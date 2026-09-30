var X$=Object.create;var rh=Object.defineProperty;var Z$=Object.getOwnPropertyDescriptor;var Q$=Object.getOwnPropertyNames;var F$=Object.getPrototypeOf,J$=Object.prototype.hasOwnProperty;var K$=(e,t,a)=>t in e?rh(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var On=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var W$=(e,t,a,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of Q$(t))!J$.call(e,r)&&r!==a&&rh(e,r,{get:()=>t[r],enumerable:!(i=Z$(t,r))||i.enumerable});return e};var In=(e,t,a)=>(a=e!=null?X$(F$(e)):{},W$(t||!e||!e.__esModule?rh(a,"default",{value:e,enumerable:!0}):a,e));var kc=(e,t,a)=>K$(e,typeof t!="symbol"?t+"":t,a);var Kf=On(ke=>{"use strict";var lh=Symbol.for("react.transitional.element"),e5=Symbol.for("react.portal"),t5=Symbol.for("react.fragment"),a5=Symbol.for("react.strict_mode"),n5=Symbol.for("react.profiler"),i5=Symbol.for("react.consumer"),r5=Symbol.for("react.context"),o5=Symbol.for("react.forward_ref"),s5=Symbol.for("react.suspense"),l5=Symbol.for("react.memo"),Yf=Symbol.for("react.lazy"),c5=Symbol.for("react.activity"),d5=Symbol.for("react.view_transition"),qf=Symbol.iterator;function u5(e){return e===null||typeof e!="object"?null:(e=qf&&e[qf]||e["@@iterator"],typeof e=="function"?e:null)}var Gf={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Pf=Object.assign,Xf={};function yo(e,t,a){this.props=e,this.context=t,this.refs=Xf,this.updater=a||Gf}yo.prototype.isReactComponent={};yo.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};yo.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Zf(){}Zf.prototype=yo.prototype;function ch(e,t,a){this.props=e,this.context=t,this.refs=Xf,this.updater=a||Gf}var dh=ch.prototype=new Zf;dh.constructor=ch;Pf(dh,yo.prototype);dh.isPureReactComponent=!0;var Lf=Array.isArray;function sh(){}var vt={H:null,A:null,T:null,S:null},Qf=Object.prototype.hasOwnProperty;function uh(e,t,a){var i=a.ref;return{$$typeof:lh,type:e,key:t,ref:i!==void 0?i:null,props:a}}function h5(e,t){return uh(e.type,t,e.props)}function hh(e){return typeof e=="object"&&e!==null&&e.$$typeof===lh}function m5(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var Bf=/\/+/g;function oh(e,t){return typeof e=="object"&&e!==null&&e.key!=null?m5(""+e.key):t.toString(36)}function p5(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(sh,sh):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function vo(e,t,a,i,r){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case lh:case e5:c=!0;break;case Yf:return c=e._init,vo(c(e._payload),t,a,i,r)}}if(c)return r=r(e),c=i===""?"."+oh(e,0):i,Lf(r)?(a="",c!=null&&(a=c.replace(Bf,"$&/")+"/"),vo(r,t,a,"",function(p){return p})):r!=null&&(hh(r)&&(r=h5(r,a+(r.key==null||e&&e.key===r.key?"":(""+r.key).replace(Bf,"$&/")+"/")+c)),t.push(r)),1;c=0;var d=i===""?".":i+":";if(Lf(e))for(var h=0;h<e.length;h++)i=e[h],s=d+oh(i,h),c+=vo(i,t,a,s,r);else if(h=u5(e),typeof h=="function")for(e=h.call(e),h=0;!(i=e.next()).done;)i=i.value,s=d+oh(i,h++),c+=vo(i,t,a,s,r);else if(s==="object"){if(typeof e.then=="function")return vo(p5(e),t,a,i,r);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function Cc(e,t,a){if(e==null)return e;var i=[],r=0;return vo(e,i,"","",function(s){return t.call(a,s,r++)}),i}function g5(e){if(e._status===-1){var t=e._result,a=t();a.then(function(i){(e._status===0||e._status===-1)&&(e._status=1,e._result=i,a.status===void 0&&(a.status="fulfilled",a.value=i))},function(i){(e._status===0||e._status===-1)&&(e._status=2,e._result=i,a.status===void 0&&(a.status="rejected",a.reason=i))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var jf=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Ff(e){var t=vt.T,a={};a.types=t!==null?t.types:null,vt.T=a;try{var i=e(),r=vt.S;r!==null&&r(a,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(sh,jf)}catch(s){jf(s)}finally{t!==null&&a.types!==null&&(t.types=a.types),vt.T=t}}function Jf(e){var t=vt.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else Ff(Jf.bind(null,e))}var f5={map:Cc,forEach:function(e,t,a){Cc(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Cc(e,function(){t++}),t},toArray:function(e){return Cc(e,function(t){return t})||[]},only:function(e){if(!hh(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};ke.Activity=c5;ke.Children=f5;ke.Component=yo;ke.Fragment=t5;ke.Profiler=n5;ke.PureComponent=ch;ke.StrictMode=a5;ke.Suspense=s5;ke.ViewTransition=d5;ke.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=vt;ke.__COMPILER_RUNTIME={__proto__:null,c:function(e){return vt.H.useMemoCache(e)}};ke.addTransitionType=Jf;ke.cache=function(e){return function(){return e.apply(null,arguments)}};ke.cacheSignal=function(){return null};ke.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=Pf({},e.props),r=e.key;if(t!=null)for(s in t.key!==void 0&&(r=""+t.key),t)!Qf.call(t,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&t.ref===void 0||(i[s]=t[s]);var s=arguments.length-2;if(s===1)i.children=a;else if(1<s){for(var c=Array(s),d=0;d<s;d++)c[d]=arguments[d+2];i.children=c}return uh(e.type,r,i)};ke.createContext=function(e){return e={$$typeof:r5,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:i5,_context:e},e};ke.createElement=function(e,t,a){var i,r={},s=null;if(t!=null)for(i in t.key!==void 0&&(s=""+t.key),t)Qf.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(r[i]=t[i]);var c=arguments.length-2;if(c===1)r.children=a;else if(1<c){for(var d=Array(c),h=0;h<c;h++)d[h]=arguments[h+2];r.children=d}if(e&&e.defaultProps)for(i in c=e.defaultProps,c)r[i]===void 0&&(r[i]=c[i]);return uh(e,s,r)};ke.createRef=function(){return{current:null}};ke.forwardRef=function(e){return{$$typeof:o5,render:e}};ke.isValidElement=hh;ke.lazy=function(e){return{$$typeof:Yf,_payload:{_status:-1,_result:e},_init:g5}};ke.memo=function(e,t){return{$$typeof:l5,type:e,compare:t===void 0?null:t}};ke.startTransition=Ff;ke.unstable_useCacheRefresh=function(){return vt.H.useCacheRefresh()};ke.use=function(e){return vt.H.use(e)};ke.useActionState=function(e,t,a){return vt.H.useActionState(e,t,a)};ke.useCallback=function(e,t){return vt.H.useCallback(e,t)};ke.useContext=function(e){return vt.H.useContext(e)};ke.useDebugValue=function(){};ke.useDeferredValue=function(e,t){return vt.H.useDeferredValue(e,t)};ke.useEffect=function(e,t){return vt.H.useEffect(e,t)};ke.useEffectEvent=function(e){return vt.H.useEffectEvent(e)};ke.useId=function(){return vt.H.useId()};ke.useImperativeHandle=function(e,t,a){return vt.H.useImperativeHandle(e,t,a)};ke.useInsertionEffect=function(e,t){return vt.H.useInsertionEffect(e,t)};ke.useLayoutEffect=function(e,t){return vt.H.useLayoutEffect(e,t)};ke.useMemo=function(e,t){return vt.H.useMemo(e,t)};ke.useOptimistic=function(e,t){return vt.H.useOptimistic(e,t)};ke.useReducer=function(e,t,a){return vt.H.useReducer(e,t,a)};ke.useRef=function(e){return vt.H.useRef(e)};ke.useState=function(e){return vt.H.useState(e)};ke.useSyncExternalStore=function(e,t,a){return vt.H.useSyncExternalStore(e,t,a)};ke.useTransition=function(){return vt.H.useTransition()};ke.version="19.3.0"});var wo=On((P2,Wf)=>{"use strict";Wf.exports=Kf()});var tb=On(Tc=>{"use strict";var b5=Symbol.for("react.transitional.element"),v5=Symbol.for("react.fragment");function eb(e,t,a){var i=null;if(a!==void 0&&(i=""+a),t.key!==void 0&&(i=""+t.key),"key"in t){a={};for(var r in t)r!=="key"&&(a[r]=t[r])}else a=t;return t=a.ref,{$$typeof:b5,type:e,key:i,ref:t!==void 0?t:null,props:a}}Tc.Fragment=v5;Tc.jsx=eb;Tc.jsxs=eb});var br=On((Z2,ab)=>{"use strict";ab.exports=tb()});var xb=On(Et=>{"use strict";function xh(e,t){var a=e.length;e.push(t);e:for(;0<a;){var i=a-1>>>1,r=e[i];if(0<Ac(r,t))e[i]=t,e[a]=r,a=i;else break e}}function Dn(e){return e.length===0?null:e[0]}function Mc(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var i=0,r=e.length,s=r>>>1;i<s;){var c=2*(i+1)-1,d=e[c],h=c+1,p=e[h];if(0>Ac(d,a))h<r&&0>Ac(p,d)?(e[i]=p,e[h]=a,i=h):(e[i]=d,e[c]=a,i=c);else if(h<r&&0>Ac(p,a))e[i]=p,e[h]=a,i=h;else break e}}return t}function Ac(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Et.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(hb=performance,Et.unstable_now=function(){return hb.now()}):(vh=Date,mb=vh.now(),Et.unstable_now=function(){return vh.now()-mb});var hb,vh,mb,si=[],Ri=[],C5=1,Wa=null,ga=3,$h=!1,Zs=!1,Qs=!1,Sh=!1,fb=typeof setTimeout=="function"?setTimeout:null,bb=typeof clearTimeout=="function"?clearTimeout:null,pb=typeof setImmediate<"u"?setImmediate:null;function Rc(e){for(var t=Dn(Ri);t!==null;){if(t.callback===null)Mc(Ri);else if(t.startTime<=e)Mc(Ri),t.sortIndex=t.expirationTime,xh(si,t);else break;t=Dn(Ri)}}function Nh(e){if(Qs=!1,Rc(e),!Zs)if(Dn(si)!==null)Zs=!0,So||(So=!0,$o());else{var t=Dn(Ri);t!==null&&kh(Nh,t.startTime-e)}}var So=!1,Fs=-1,vb=5,yb=-1;function wb(){return Sh?!0:!(Et.unstable_now()-yb<vb)}function yh(){if(Sh=!1,So){var e=Et.unstable_now();yb=e;var t=!0;try{e:{Zs=!1,Qs&&(Qs=!1,bb(Fs),Fs=-1),$h=!0;var a=ga;try{t:{for(Rc(e),Wa=Dn(si);Wa!==null&&!(Wa.expirationTime>e&&wb());){var i=Wa.callback;if(typeof i=="function"){Wa.callback=null,ga=Wa.priorityLevel;var r=i(Wa.expirationTime<=e);if(e=Et.unstable_now(),typeof r=="function"){Wa.callback=r,Rc(e),t=!0;break t}Wa===Dn(si)&&Mc(si),Rc(e)}else Mc(si);Wa=Dn(si)}if(Wa!==null)t=!0;else{var s=Dn(Ri);s!==null&&kh(Nh,s.startTime-e),t=!1}}break e}finally{Wa=null,ga=a,$h=!1}t=void 0}}finally{t?$o():So=!1}}}var $o;typeof pb=="function"?$o=function(){pb(yh)}:typeof MessageChannel<"u"?(wh=new MessageChannel,gb=wh.port2,wh.port1.onmessage=yh,$o=function(){gb.postMessage(null)}):$o=function(){fb(yh,0)};var wh,gb;function kh(e,t){Fs=fb(function(){e(Et.unstable_now())},t)}Et.unstable_IdlePriority=5;Et.unstable_ImmediatePriority=1;Et.unstable_LowPriority=4;Et.unstable_NormalPriority=3;Et.unstable_Profiling=null;Et.unstable_UserBlockingPriority=2;Et.unstable_cancelCallback=function(e){e.callback=null};Et.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):vb=0<e?Math.floor(1e3/e):5};Et.unstable_getCurrentPriorityLevel=function(){return ga};Et.unstable_next=function(e){switch(ga){case 1:case 2:case 3:var t=3;break;default:t=ga}var a=ga;ga=t;try{return e()}finally{ga=a}};Et.unstable_requestPaint=function(){Sh=!0};Et.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=ga;ga=e;try{return t()}finally{ga=a}};Et.unstable_scheduleCallback=function(e,t,a){var i=Et.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?i+a:i):a=i,e){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=a+r,e={id:C5++,callback:t,priorityLevel:e,startTime:a,expirationTime:r,sortIndex:-1},a>i?(e.sortIndex=a,xh(Ri,e),Dn(si)===null&&e===Dn(Ri)&&(Qs?(bb(Fs),Fs=-1):Qs=!0,kh(Nh,a-i))):(e.sortIndex=r,xh(si,e),Zs||$h||(Zs=!0,So||(So=!0,$o()))),e};Et.unstable_shouldYield=wb;Et.unstable_wrapCallback=function(e){var t=ga;return function(){var a=ga;ga=t;try{return e.apply(this,arguments)}finally{ga=a}}}});var Sb=On((rC,$b)=>{"use strict";$b.exports=xb()});var Cb=On(fa=>{"use strict";var T5=wo();function kb(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Mi(){}var Na={d:{f:Mi,r:function(){throw Error(kb(522))},D:Mi,C:Mi,L:Mi,m:Mi,X:Mi,S:Mi,M:Mi},p:0,findDOMNode:null},E5=Symbol.for("react.portal"),A5=Symbol.for("react.recoverable"),Nb=Symbol.for("react.optimistic_key");function R5(e,t,a){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:E5,key:i==null?null:i===Nb?Nb:""+i,children:e,containerInfo:t,implementation:a}}var Js=T5.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function zc(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}fa.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Na;fa.browser=function(e){return{$$typeof:A5,_reason:e}};fa.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(kb(299));return R5(e,t,null,a)};fa.flushSync=function(e){var t=Js.T,a=Na.p;try{if(Js.T=null,Na.p=2,e)return e()}finally{Js.T=t,Na.p=a,Na.d.f()}};fa.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Na.d.C(e,t))};fa.prefetchDNS=function(e){typeof e=="string"&&Na.d.D(e)};fa.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,i=zc(a,t.crossOrigin),r=typeof t.integrity=="string"?t.integrity:void 0,s=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?Na.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:r,fetchPriority:s}):a==="script"&&Na.d.X(e,{crossOrigin:i,integrity:r,fetchPriority:s,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};fa.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=zc(t.as,t.crossOrigin);Na.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&Na.d.M(e)};fa.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,i=zc(a,t.crossOrigin);Na.d.L(e,a,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};fa.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=zc(t.as,t.crossOrigin);Na.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else Na.d.m(e)};fa.requestFormReset=function(e){Na.d.r(e)};fa.unstable_batchedUpdates=function(e,t){return e(t)};fa.useFormState=function(e,t,a){return Js.H.useFormState(e,t,a)};fa.useFormStatus=function(){return Js.H.useHostTransitionStatus()};fa.version="19.3.0"});var Ab=On((sC,Eb)=>{"use strict";function Tb(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Tb)}catch(e){console.error(e)}}Tb(),Eb.exports=Cb()});var g1=On(mu=>{"use strict";var Kt=Sb(),py=wo(),M5=Ab();function U(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function gy(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Hl(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function fy(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function by(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Rb(e){if(Hl(e)!==e)throw Error(U(188))}function z5(e){var t=e.alternate;if(!t){if(t=Hl(e),t===null)throw Error(U(188));return t!==e?null:e}for(var a=e,i=t;;){var r=a.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){a=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===a)return Rb(r),e;if(s===i)return Rb(r),t;s=s.sibling}throw Error(U(188))}if(a.return!==i.return)a=r,i=s;else{for(var c=!1,d=r.child;d;){if(d===a){c=!0,a=r,i=s;break}if(d===i){c=!0,i=r,a=s;break}d=d.sibling}if(!c){for(d=s.child;d;){if(d===a){c=!0,a=s,i=r;break}if(d===i){c=!0,i=s,a=r;break}d=d.sibling}if(!c)throw Error(U(189))}}if(a.alternate!==i)throw Error(U(190))}if(a.tag!==3)throw Error(U(188));return a.stateNode.current===a?e:t}function vy(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=vy(e),t!==null)return t;e=e.sibling}return null}function Da(e,t,a,i,r,s){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,i,r,s)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Da(e.child,t,a,i,r,s))return!0;e=e.sibling}return!1}function Ur(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Mb(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function yy(e){var t=[null,null],a=Ur(e);return a===null||wy(t,e,a.child,{foundSelf:!1}),t}function wy(e,t,a,i){for(;a!==null;){if(a===t)i.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(i.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&wy(e,t,a.child,i))return!0;a=a.sibling}return!1}function Jt(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(U(559))}}var Ro=null,nm=null;function V5(e,t,a){return e===a?!0:e===t?(Ro=e,!0):!1}function O5(e,t,a){return e===a?(nm=e,!1):e===t?(nm!==null&&(Ro=e),!0):!1}function zb(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function im(e,t,a){for(var i=0,r=e;r;r=a(r))i++;r=0;for(var s=t;s;s=a(s))r++;for(;0<i-r;)e=a(e),i--;for(;0<r-i;)t=a(t),r--;for(;i--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var pt=Object.assign,I5=Symbol.for("react.element"),Vc=Symbol.for("react.transitional.element"),il=Symbol.for("react.portal"),Mo=Symbol.for("react.fragment"),xy=Symbol.for("react.strict_mode"),rm=Symbol.for("react.profiler"),$y=Symbol.for("react.consumer"),Bn=Symbol.for("react.context"),pp=Symbol.for("react.forward_ref"),om=Symbol.for("react.suspense"),sm=Symbol.for("react.suspense_list"),gp=Symbol.for("react.memo"),Ii=Symbol.for("react.lazy"),lm=Symbol.for("react.activity"),D5=Symbol.for("react.legacy_hidden"),_5=Symbol.for("react.memo_cache_sentinel"),cm=Symbol.for("react.view_transition"),H5=Symbol.for("react.recoverable"),Vb=Symbol.iterator;function Ks(e){return e===null||typeof e!="object"?null:(e=Vb&&e[Vb]||e["@@iterator"],typeof e=="function"?e:null)}var U5=Symbol.for("react.client.reference");function dm(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===U5?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Mo:return"Fragment";case rm:return"Profiler";case xy:return"StrictMode";case om:return"Suspense";case sm:return"SuspenseList";case lm:return"Activity";case cm:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case il:return"Portal";case Bn:return e.displayName||"Context";case $y:return(e._context.displayName||"Context")+".Consumer";case pp:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case gp:return t=e.displayName||null,t!==null?t:dm(e.type)||"Memo";case Ii:t=e._payload,e=e._init;try{return dm(e(t))}catch{}}return null}var rl=Array.isArray,$e=py.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ke=M5.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Cr={pending:!1,data:null,method:null,action:null},um=[],zo=-1;function Qn(e){return{current:e}}function ca(e){0>zo||(e.current=um[zo],um[zo]=null,zo--)}function xt(e,t){zo++,um[zo]=e.current,e.current=t}var Pn=Qn(null),$l=Qn(null),Yi=Qn(null),yd=Qn(null);function wd(e,t){switch(xt(Yi,t),xt($l,e),xt(Pn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Xv(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Xv(t),e=Y0(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}ca(Pn),xt(Pn,e)}function Ko(){ca(Pn),ca($l),ca(Yi)}function hm(e){var t=e.memoizedState;t!==null&&(ls._currentValue=t.memoizedState,xt(yd,e)),t=Pn.current;var a=Y0(t,e.type);t!==a&&(xt($l,e),xt(Pn,a))}function xd(e){$l.current===e&&(ca(Pn),ca($l)),yd.current===e&&(ca(yd),ls._currentValue=Cr)}var Ch,Ob;function Vi(e){if(Ch===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Ch=t&&t[1]||"",Ob=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Ch+e+Ob}var Th=!1;function Eh(e,t){if(!e||Th)return"";Th=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var $=function(){throw Error()};if(Object.defineProperty($.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct($,[])}catch(V){var f=V}Reflect.construct(e,[],$)}else{try{$.call()}catch(V){f=V}$=!1;try{var y=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),$=!0,new e}finally{$&&(y!==void 0?Object.defineProperty(e.prototype,"props",y):delete e.prototype.props)}}}else{try{throw Error()}catch(V){f=V}($=e())&&typeof $.catch=="function"&&$.catch(function(){})}}catch(V){if(V&&f&&typeof V.stack=="string")return[V.stack,f.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=i.DetermineComponentFrameRoot(),c=s[0],d=s[1];if(c&&d){var h=c.split(`
`),p=d.split(`
`);for(r=i=0;i<h.length&&!h[i].includes("DetermineComponentFrameRoot");)i++;for(;r<p.length&&!p[r].includes("DetermineComponentFrameRoot");)r++;if(i===h.length||r===p.length)for(i=h.length-1,r=p.length-1;1<=i&&0<=r&&h[i]!==p[r];)r--;for(;1<=i&&0<=r;i--,r--)if(h[i]!==p[r]){if(i!==1||r!==1)do if(i--,r--,0>r||h[i]!==p[r]){var b=`
`+h[i].replace(" at new "," at ");return e.displayName&&b.includes("<anonymous>")&&(b=b.replace("<anonymous>",e.displayName)),b}while(1<=i&&0<=r);break}}}finally{Th=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Vi(a):""}function q5(e,t){switch(e.tag){case 26:case 27:case 5:return Vi(e.type);case 16:return Vi("Lazy");case 13:return e.child!==t&&t!==null?Vi("Suspense Fallback"):Vi("Suspense");case 19:return Vi("SuspenseList");case 0:case 15:return Eh(e.type,!1);case 11:return Eh(e.type.render,!1);case 1:return Eh(e.type,!0);case 31:return Vi("Activity");case 30:return Vi("ViewTransition");default:return""}}function Ib(e){try{var t="",a=null;do t+=q5(e,a),a=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var mm=Object.prototype.hasOwnProperty,fp=Kt.unstable_scheduleCallback,Ah=Kt.unstable_cancelCallback,L5=Kt.unstable_shouldYield,B5=Kt.unstable_requestPaint,Ya=Kt.unstable_now,j5=Kt.unstable_getCurrentPriorityLevel,Sy=Kt.unstable_ImmediatePriority,Ny=Kt.unstable_UserBlockingPriority,$d=Kt.unstable_NormalPriority,Y5=Kt.unstable_LowPriority,ky=Kt.unstable_IdlePriority,G5=Kt.log,P5=Kt.unstable_setDisableYieldValue,Ul=null,Ga=null;function Hi(e){if(typeof G5=="function"&&P5(e),Ga&&typeof Ga.setStrictMode=="function")try{Ga.setStrictMode(Ul,e)}catch{}}var Pa=Math.clz32?Math.clz32:Q5,X5=Math.log,Z5=Math.LN2;function Q5(e){return e>>>=0,e===0?32:31-(X5(e)/Z5|0)|0}var Oc=256,Ic=262144,Dc=4194304;function xr(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Zd(e,t,a){var i=e.pendingLanes;if(i===0)return 0;var r=0,s=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var d=i&134217727;return d!==0?(i=d&~s,i!==0?r=xr(i):(c&=d,c!==0?r=xr(c):a||(a=d&~e,a!==0&&(r=xr(a))))):(d=i&~s,d!==0?r=xr(d):c!==0?r=xr(c):a||(a=i&~e,a!==0&&(r=xr(a)))),r===0?0:t!==0&&t!==r&&(t&s)===0&&(s=r&-r,a=t&-t,s>=a||s===32&&(a&4194048)!==0)?t:r}function ql(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Cy(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var i=31-Pa(a),r=1<<i;t|=e[i],a&=~r}return t}function F5(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Ty(){var e=Dc;return Dc<<=1,(Dc&62914560)===0&&(Dc=4194304),e}function Rh(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Ll(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function J5(e,t,a,i,r,s){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var d=e.entanglements,h=e.expirationTimes,p=e.hiddenUpdates;for(a=c&~a;0<a;){var b=31-Pa(a),$=1<<b;d[b]=0,h[b]=-1;var f=p[b];if(f!==null)for(p[b]=null,b=0;b<f.length;b++){var y=f[b];y!==null&&(y.lane&=-536870913)}a&=~$}i!==0&&Ey(e,i,0),s!==0&&r===0&&e.tag!==0&&(e.suspendedLanes|=s&~(c&~t))}function Ey(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-Pa(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|a&261930}function Ay(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var i=31-Pa(a),r=1<<i;r&t|e[i]&t&&(e[i]|=t),a&=~r}}function Ry(e,t){var a=t&-t;return a=(a&42)!==0?1:bp(a),(a&(e.suspendedLanes|t))!==0?0:a}function bp(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function vp(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function My(){var e=Ke.p;return e!==0?e:(e=window.event,e===void 0?32:h1(e.type))}function Db(e,t){var a=Ke.p;try{return Ke.p=e,t()}finally{Ke.p=a}}var wi=Math.random().toString(36).slice(2),sa="__reactFiber$"+wi,_a="__reactProps$"+wi,us="__reactContainer$"+wi,_b="__reactEvents$"+wi,K5="__reactListeners$"+wi,W5="__reactHandles$"+wi,Hb="__reactResources$"+wi,Bl="__reactMarker$"+wi,Sd="__reactLoad$"+wi;function Qd(e){delete e[sa],delete e[_a],delete e[K5],delete e[W5]}function Nr(e){var t;if(t=e[sa])return t;for(var a=e.parentNode;a;){if(t=a[us]||a[sa]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=ty(e);e!==null;){if(a=e[sa])return a;e=ty(e)}return t}e=a,a=e.parentNode}return null}function hs(e){if(e=e[sa]||e[us]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function ol(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(U(33))}function Bo(e){var t=e[Hb];return t||(t=e[Hb]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function na(e){e[Bl]=!0}function zy(e){e[Sd]=void 0}var Vy=new Set,Oy={};function qr(e,t){Wo(e,t),Wo(e+"Capture",t)}function Wo(e,t){for(Oy[e]=t,e=0;e<t.length;e++)Vy.add(t[e])}var eS=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Ub={},qb={};function tS(e){return mm.call(qb,e)?!0:mm.call(Ub,e)?!1:eS.test(e)?qb[e]=!0:(Ub[e]=!0,!1)}var Qe=!1;function Lb(){var e=Qe;return Qe=!1,e}function ed(e,t,a){if(tS(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function _c(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function li(e,t,a,i){if(i===null)e.removeAttribute(a);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,i)}}function qa(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Iy(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function aS(e,t,a){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var r=i.get,s=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return r.call(this)},set:function(c){a=""+c,s.call(this,c)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function pm(e){if(!e._valueTracker){var t=Iy(e)?"checked":"value";e._valueTracker=aS(e,t,""+e[t])}}function Dy(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),i="";return e&&(i=Iy(e)?e.checked?"true":"false":e.value),e=i,e!==a?(t.setValue(e),!0):!1}var nS=/[\n"\\]/g;function rn(e){return e.replace(nS,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function gm(e,t,a,i,r,s,c,d){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+qa(t)):e.value!==""+qa(t)&&(e.value=""+qa(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?Mh(e,qa(e.value)):Mh(e,qa(t)):a!=null?Mh(e,qa(a)):i!=null&&e.removeAttribute("value"),r==null&&s!=null&&(e.defaultChecked=!!s),r!=null&&(e.checked=r&&typeof r!="function"&&typeof r!="symbol"),d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"?e.name=""+qa(d):e.removeAttribute("name")}function _y(e,t,a,i,r,s,c,d){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.type=s),t!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||t!=null)){pm(e);return}a=a!=null?""+qa(a):"",t=t!=null?""+qa(t):a,d||t===e.value||(e.value=t),e.defaultValue=t}i=i??r,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=d?e.checked:!!i,e.defaultChecked=!!i,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),pm(e)}function Mh(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function jo(e,t,a,i){if(e=e.options,t){t={};for(var r=0;r<a.length;r++)t["$"+a[r]]=!0;for(a=0;a<e.length;a++)r=t.hasOwnProperty("$"+e[a].value),e[a].selected!==r&&(e[a].selected=r),r&&i&&(e[a].defaultSelected=!0)}else{for(a=""+qa(a),t=null,r=0;r<e.length;r++){if(e[r].value===a){e[r].selected=!0,i&&(e[r].defaultSelected=!0);return}t!==null||e[r].disabled||(t=e[r])}t!==null&&(t.selected=!0)}}function Hy(e,t,a){if(t!=null&&(t=""+qa(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+qa(a):""}function Uy(e,t,a,i){if(t==null){if(i!=null){if(a!=null)throw Error(U(92));if(rl(i)){if(1<i.length)throw Error(U(93));i=i[0]}a=i}a==null&&(a=""),t=a}a=qa(t),e.defaultValue=a,i=e.textContent,i===a&&i!==""&&i!==null&&(e.value=i),pm(e)}function es(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var iS=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Bb(e,t,a){var i=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,a):typeof a!="number"||a===0||iS.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function qy(e,t,a){if(t!=null&&typeof t!="object")throw Error(U(62));if(e=e.style,a!=null){for(var i in a)!a.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="",Qe=!0);for(var r in t)i=t[r],t.hasOwnProperty(r)&&a[r]!==i&&(Bb(e,r,i),Qe=!0)}else for(var s in t)t.hasOwnProperty(s)&&Bb(e,s,t[s])}function yp(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var rS=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),oS=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function td(e){return oS.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function jn(){}var fm=null;function wp(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Vo=null,Yo=null;function jb(e){var t=hs(e);if(t&&(e=t.stateNode)){var a=e[_a]||null;e:switch(e=t.stateNode,t.type){case"input":if(gm(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+rn(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var i=a[t];if(i!==e&&i.form===e.form){var r=i[_a]||null;if(!r)throw Error(U(90));gm(i,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(t=0;t<a.length;t++)i=a[t],i.form===e.form&&Dy(i)}break e;case"textarea":Hy(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&jo(e,!!a.multiple,t,!1)}}}var zh=!1;function Ly(e,t,a){if(zh)return e(t,a);zh=!0;try{var i=e(t);return i}finally{if(zh=!1,(Vo!==null||Yo!==null)&&(cu(),Vo&&(t=Vo,e=Yo,Yo=Vo=null,jb(t),e)))for(t=0;t<e.length;t++)jb(e[t])}}function Sl(e,t){var a=e.stateNode;if(a===null)return null;var i=a[_a]||null;if(i===null)return null;a=i[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(U(231,t,typeof a));return a}var pi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),bm=!1;if(pi)try{No={},Object.defineProperty(No,"passive",{get:function(){bm=!0}}),window.addEventListener("test",No,No),window.removeEventListener("test",No,No)}catch{bm=!1}var No,Ui=null,xp=null,ad=null;function By(){if(ad)return ad;var e,t=xp,a=t.length,i,r="value"in Ui?Ui.value:Ui.textContent,s=r.length;for(e=0;e<a&&t[e]===r[e];e++);var c=a-e;for(i=1;i<=c&&t[a-i]===r[s-i];i++);return ad=r.slice(e,1<i?1-i:void 0)}function nd(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Hc(){return!0}function Yb(){return!1}function Ea(e){function t(a,i,r,s,c){this._reactName=a,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=c,this.currentTarget=null;for(var d in e)e.hasOwnProperty(d)&&(a=e[d],this[d]=a?a(s):s[d]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Hc:Yb,this.isPropagationStopped=Yb,this}return pt(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Hc)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Hc)},persist:function(){},isPersistent:Hc}),t}var rr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Fd=Ea(rr),jl=pt({},rr,{view:0,detail:0}),sS=Ea(jl),Vh,Oh,Ws,Jd=pt({},jl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:$p,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Ws&&(Ws&&e.type==="mousemove"?(Vh=e.screenX-Ws.screenX,Oh=e.screenY-Ws.screenY):Oh=Vh=0,Ws=e),Vh)},movementY:function(e){return"movementY"in e?e.movementY:Oh}}),Gb=Ea(Jd),lS=pt({},Jd,{dataTransfer:0}),cS=Ea(lS),dS=pt({},jl,{relatedTarget:0}),Ih=Ea(dS),uS=pt({},rr,{animationName:0,elapsedTime:0,pseudoElement:0}),hS=Ea(uS),mS=pt({},rr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),pS=Ea(mS),gS=pt({},rr,{data:0}),Pb=Ea(gS),fS={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},bS={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},vS={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function yS(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=vS[e])?!!t[e]:!1}function $p(){return yS}var wS=pt({},jl,{key:function(e){if(e.key){var t=fS[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=nd(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?bS[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:$p,charCode:function(e){return e.type==="keypress"?nd(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?nd(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),xS=Ea(wS),$S=pt({},Jd,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Xb=Ea($S),SS=pt({},rr,{submitter:0}),NS=Ea(SS),kS=pt({},jl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:$p}),CS=Ea(kS),TS=pt({},rr,{propertyName:0,elapsedTime:0,pseudoElement:0}),ES=Ea(TS),AS=pt({},Jd,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),RS=Ea(AS),MS=pt({},rr,{newState:0,oldState:0,source:0}),zS=Ea(MS),VS=[9,13,27,32],Sp=pi&&"CompositionEvent"in window,cl=null;pi&&"documentMode"in document&&(cl=document.documentMode);var OS=pi&&"TextEvent"in window&&!cl,jy=pi&&(!Sp||cl&&8<cl&&11>=cl),Zb=" ",Qb=!1;function Yy(e,t){switch(e){case"keyup":return VS.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Gy(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Oo=!1;function IS(e,t){switch(e){case"compositionend":return Gy(t);case"keypress":return t.which!==32?null:(Qb=!0,Zb);case"textInput":return e=t.data,e===Zb&&Qb?null:e;default:return null}}function DS(e,t){if(Oo)return e==="compositionend"||!Sp&&Yy(e,t)?(e=By(),ad=xp=Ui=null,Oo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return jy&&t.locale!=="ko"?null:t.data;default:return null}}var _S={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Fb(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!_S[e.type]:t==="textarea"}function Py(e,t,a,i){Vo?Yo?Yo.push(i):Yo=[i]:Vo=i,t=Gd(t,"onChange"),0<t.length&&(a=new Fd("onChange","change",null,a,i),e.push({event:a,listeners:t}))}var dl=null,Nl=null;function HS(e){L0(e,0)}function Kd(e){var t=ol(e);if(Dy(t))return e}function Jb(e,t){if(e==="change")return t}var Xy=!1;pi&&(pi?(qc="oninput"in document,qc||(Dh=document.createElement("div"),Dh.setAttribute("oninput","return;"),qc=typeof Dh.oninput=="function"),Uc=qc):Uc=!1,Xy=Uc&&(!document.documentMode||9<document.documentMode));var Uc,qc,Dh;function Kb(){dl&&(dl.detachEvent("onpropertychange",Zy),Nl=dl=null)}function Zy(e){if(e.propertyName==="value"&&Kd(Nl)){var t=[];Py(t,Nl,e,wp(e)),Ly(HS,t)}}function US(e,t,a){e==="focusin"?(Kb(),dl=t,Nl=a,dl.attachEvent("onpropertychange",Zy)):e==="focusout"&&Kb()}function qS(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Kd(Nl)}function LS(e,t){if(e==="click")return Kd(t)}function BS(e,t){if(e==="input"||e==="change")return Kd(t)}function jS(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Za=typeof Object.is=="function"?Object.is:jS;function kl(e,t){if(Za(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),i=Object.keys(t);if(a.length!==i.length)return!1;for(i=0;i<a.length;i++){var r=a[i];if(!mm.call(t,r)||!Za(e[r],t[r]))return!1}return!0}function vm(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Wb(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function ev(e,t){var a=Wb(e);e=0;for(var i;a;){if(a.nodeType===3){if(i=e+a.textContent.length,e<=t&&i>=t)return{node:a,offset:t-e};e=i}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Wb(a)}}function Qy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Qy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Fy(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=vm(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=vm(e.document)}return t}function Np(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var YS=pi&&"documentMode"in document&&11>=document.documentMode,Io=null,ym=null,ul=null,wm=!1;function tv(e,t,a){var i=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;wm||Io==null||Io!==vm(i)||(i=Io,"selectionStart"in i&&Np(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),ul&&kl(ul,i)||(ul=i,i=Gd(ym,"onSelect"),0<i.length&&(t=new Fd("onSelect","select",null,t,a),e.push({event:t,listeners:i}),t.target=Io)))}function yr(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Do={animationend:yr("Animation","AnimationEnd"),animationiteration:yr("Animation","AnimationIteration"),animationstart:yr("Animation","AnimationStart"),transitionrun:yr("Transition","TransitionRun"),transitionstart:yr("Transition","TransitionStart"),transitioncancel:yr("Transition","TransitionCancel"),transitionend:yr("Transition","TransitionEnd")},_h={},Jy={};pi&&(Jy=document.createElement("div").style,"AnimationEvent"in window||(delete Do.animationend.animation,delete Do.animationiteration.animation,delete Do.animationstart.animation),"TransitionEvent"in window||delete Do.transitionend.transition);function Lr(e){if(_h[e])return _h[e];if(!Do[e])return e;var t=Do[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in Jy)return _h[e]=t[a];return e}var Ky=Lr("animationend"),Wy=Lr("animationiteration"),ew=Lr("animationstart"),GS=Lr("transitionrun"),PS=Lr("transitionstart"),XS=Lr("transitioncancel"),tw=Lr("transitionend"),aw=new Map,xm="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");xm.push("scrollEnd");function Sn(e,t){aw.set(e,t),qr(t,[e])}var ZS=0;function gi(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=$n.identifierPrefix;var a=ZS++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function av(e){if(e==null||typeof e=="string")return e;var t=null,a=Jo;if(a!==null)for(var i=0;i<a.length;i++){var r=e[a[i]];if(r!=null){if(r==="none")return"none";t=t==null?r:t+(" "+r)}}return t??e.default}function xi(e,t){return e=av(e),t=av(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Nd=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},tn=[],_o=0,kp=0;function Wd(){for(var e=_o,t=kp=_o=0;t<e;){var a=tn[t];tn[t++]=null;var i=tn[t];tn[t++]=null;var r=tn[t];tn[t++]=null;var s=tn[t];if(tn[t++]=null,i!==null&&r!==null){var c=i.pending;c===null?r.next=r:(r.next=c.next,c.next=r),i.pending=r}s!==0&&nw(a,r,s)}}function eu(e,t,a,i){tn[_o++]=e,tn[_o++]=t,tn[_o++]=a,tn[_o++]=i,kp|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function Cp(e,t,a,i){return eu(e,t,a,i),kd(e)}function Br(e,t){return eu(e,null,null,t),kd(e)}function nw(e,t,a){e.lanes|=a;var i=e.alternate;i!==null&&(i.lanes|=a);for(var r=!1,s=e.return;s!==null;)s.childLanes|=a,i=s.alternate,i!==null&&(i.childLanes|=a),s.tag===22&&(e=s.stateNode,e===null||e._visibility&1||(r=!0)),e=s,s=s.return;return e.tag===3?(s=e.stateNode,r&&t!==null&&(r=31-Pa(a),e=s.hiddenUpdates,i=e[r],i===null?e[r]=[t]:i.push(t),t.lane=a|536870912),s):null}function kd(e){if(50<xl)throw xl=0,md=null,Error(U(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Ho={};function QS(e,t,a,i){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Oa(e,t,a,i){return new QS(e,t,a,i)}function Tp(e){return e=e.prototype,!(!e||!e.isReactComponent)}function hi(e,t){var a=e.alternate;return a===null?(a=Oa(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function iw(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function id(e,t,a,i,r,s){var c=0;if(i=e,typeof i=="function")Tp(i)&&(c=1);else if(typeof i=="string")c=xk(e,a,Pn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(i){case lm:return e=Oa(31,a,t,r),e.elementType=lm,e.lanes=s,e;case Mo:return Tr(a.children,r,s,t);case xy:c=8,r|=24;break;case rm:return e=Oa(12,a,t,r|2),e.elementType=rm,e.lanes=s,e;case om:return e=Oa(13,a,t,r),e.elementType=om,e.lanes=s,e;case sm:return e=Oa(19,a,t,r),e.elementType=sm,e.lanes=s,e;case D5:case cm:return e=r|32,e=Oa(30,a,t,e),e.elementType=cm,e.lanes=s,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof i=="object"&&i!==null)switch(i.$$typeof){case Bn:c=10;break e;case $y:c=9;break e;case pp:c=11;break e;case gp:c=14;break e;case Ii:c=16,i=null;break e}c=29,a=Error(U(130,e===null?"null":typeof e,"")),i=null}return t=Oa(c,a,t,r),t.elementType=e,t.type=i,t.lanes=s,t}function Tr(e,t,a,i){return e=Oa(7,e,i,t),e.lanes=a,e}function Hh(e,t,a){return e=Oa(6,e,null,t),e.lanes=a,e}function rw(e){var t=Oa(18,null,null,0);return t.stateNode=e,t}function Uh(e,t,a){return t=Oa(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var nv=new WeakMap;function on(e,t){if(typeof e=="object"&&e!==null){var a=nv.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Ib(t)},nv.set(e,t),t)}return{value:e,source:t,stack:Ib(t)}}var Uo=[],qo=0,Cd=null,Cl=0,an=[],nn=0,er=null,Yn=1,Gn="";function di(e,t){Uo[qo++]=Cl,Uo[qo++]=Cd,Cd=e,Cl=t}function ow(e,t,a){an[nn++]=Yn,an[nn++]=Gn,an[nn++]=er,er=e;var i=Yn;e=Gn;var r=32-Pa(i)-1;i&=~(1<<r),a+=1;var s=32-Pa(t)+r;if(30<s){var c=r-r%5;s=(i&(1<<c)-1).toString(32),i>>=c,r-=c,Yn=1<<32-Pa(t)+r|a<<r|i,Gn=s+e}else Yn=1<<s|a<<r|i,Gn=e}function tu(e){e.return!==null&&(di(e,1),ow(e,1,0))}function Ep(e){for(;e===Cd;)Cd=Uo[--qo],Uo[qo]=null,Cl=Uo[--qo],Uo[qo]=null;for(;e===er;)er=an[--nn],an[nn]=null,Gn=an[--nn],an[nn]=null,Yn=an[--nn],an[nn]=null}function sw(e,t){an[nn++]=Yn,an[nn++]=Gn,an[nn++]=er,Yn=t.id,Gn=t.overflow,er=e}var ia=null,wt=null,ze=!1,Gi=null,sn=!1,$m=Error(U(519));function tr(e){var t=Error(U(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Tl(on(t,e)),$m}function iv(e){var t=e.stateNode,a=e.type,i=e.memoizedProps;switch(t[sa]=e,t[_a]=i,a){case"dialog":De("cancel",t),De("close",t);break;case"iframe":case"object":case"embed":De("load",t);break;case"video":case"audio":for(a=0;a<Ml.length;a++)De(Ml[a],t);break;case"source":De("error",t);break;case"img":case"image":case"link":De("error",t),De("load",t);break;case"details":De("toggle",t);break;case"input":De("invalid",t),_y(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":De("invalid",t);break;case"textarea":De("invalid",t),Uy(t,i.value,i.defaultValue,i.children)}a=i.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||i.suppressHydrationWarning===!0||j0(t.textContent,a)?(i.popover!=null&&(De("beforetoggle",t),De("toggle",t)),i.onScroll!=null&&De("scroll",t),i.onScrollEnd!=null&&De("scrollend",t),i.onClick!=null&&(t.onclick=jn),t=!0):t=!1,t||tr(e,!0)}function Td(e){for(ia=e.return;ia;)switch(ia.tag){case 5:case 31:case 13:sn=!1;return;case 27:case 3:sn=!0;return;default:ia=ia.return}}function ko(e){if(e!==ia)return!1;if(!ze)return Td(e),ze=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||op(e.type,e.memoizedProps)),a=!a),a&&wt&&tr(e),Td(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(U(317));wt=ey(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(U(317));wt=ey(e)}else t===27?(t=wt,or(e.type)?(e=dp,dp=null,wt=e):wt=t):wt=ia?ln(e.stateNode.nextSibling):null;return!0}function Mr(){wt=ia=null,ze=!1}function qh(){var e=Gi;return e!==null&&(za===null?za=e:za.push.apply(za,e),Gi=null),e}function Tl(e){Gi===null?Gi=[e]:Gi.push(e)}var Sm=Qn(null),jr=null,ui=null;function qi(e,t,a){xt(Sm,t._currentValue),t._currentValue=a}function mi(e){e._currentValue=Sm.current,ca(Sm)}function rd(e,t,a){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===a)break;e=e.return}}function Nm(e,t,a,i){var r=e.child;for(r!==null&&(r.return=e);r!==null;){var s=r.dependencies;if(s!==null){var c=r.child;s=s.firstContext;e:for(;s!==null;){var d=s;s=r;for(var h=0;h<t.length;h++)if(d.context===t[h]){s.lanes|=a,d=s.alternate,d!==null&&(d.lanes|=a),rd(s.return,a,e),i||(c=null);break e}s=d.next}}else if(r.tag===18){if(c=r.return,c===null)throw Error(U(341));c.lanes|=a,s=c.alternate,s!==null&&(s.lanes|=a),rd(c,a,e),c=null}else r.tag===13&&r.memoizedState!==null&&r.memoizedState.dehydrated===null?(r.lanes|=a,c=r.alternate,c!==null&&(c.lanes|=a),rd(r.return,a,e),c=r.child,c=c!==null?c.sibling:null):c=r.child;if(c!==null)c.return=r;else for(c=r;c!==null;){if(c===e){c=null;break}if(r=c.sibling,r!==null){r.return=c.return,c=r;break}c=c.return}r=c}}function zr(e,t,a,i){e=null;for(var r=t,s=!1;r!==null;){if(!s){if((r.flags&524288)!==0)s=!0;else if((r.flags&262144)!==0)break}if(r.tag===10){var c=r.alternate;if(c===null)throw Error(U(387));if(c=c.memoizedProps,c!==null){var d=r.type;Za(r.pendingProps.value,c.value)||(e!==null?e.push(d):e=[d])}}else if(r===yd.current){if(c=r.alternate,c===null)throw Error(U(387));c.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(e!==null?e.push(ls):e=[ls])}r=r.return}return e!==null&&Nm(t,e,a,i),t.flags|=262144,e!==null}function Ed(e){for(e=e.firstContext;e!==null;){if(!Za(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Vr(e){jr=e,ui=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function la(e){return lw(jr,e)}function Lc(e,t){return jr===null&&Vr(e),lw(e,t)}function lw(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},ui===null){if(e===null)throw Error(U(308));ui=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else ui=ui.next=t;return a}var FS=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},JS=Kt.unstable_scheduleCallback,KS=Kt.unstable_NormalPriority,Xt={$$typeof:Bn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Ap(){return{controller:new FS,data:new Map,refCount:0}}function Yl(e){e.refCount--,e.refCount===0&&JS(KS,function(){e.controller.abort()})}function rv(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var i=t[e];a.indexOf(i)===-1&&a.push(i)}}}var sl=null;function WS(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var hl=null,km=0,Or=0,Go=null;function eN(e,t){if(hl===null){var a=hl=[];km=0,Or=ng(),Go={status:"pending",value:void 0,then:function(i){a.push(i)}}}return km++,t.then(ov,ov),t}function ov(){if(--km===0&&(sl=null,hl!==null)){Go!==null&&(Go.status="fulfilled");var e=hl;hl=null,Or=0,Go=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function tN(e,t){var a=[],i={status:"pending",value:null,reason:null,then:function(r){a.push(r)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var r=0;r<a.length;r++)(0,a[r])(t)},function(r){for(i.status="rejected",i.reason=r,r=0;r<a.length;r++)(0,a[r])(void 0)}),i}var sv=$e.S;$e.S=function(e,t){if(C0=Ya(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&eN(e,t),sl!==null)for(var a=rs;a!==null;)rv(a,sl),a=a.next;if(a=e.types,a!==null){for(var i=rs;i!==null;)rv(i,a),i=i.next;if(Or!==0){i=sl,i===null&&(i=sl=[]);for(var r=0;r<a.length;r++){var s=a[r];i.indexOf(s)===-1&&i.push(s)}}}sv!==null&&sv(e,t)};var Er=Qn(null);function Rp(){var e=Er.current;return e!==null?e:mt.pooledCache}function od(e,t){t===null?xt(Er,Er.current):xt(Er,t.pool)}function cw(){var e=Rp();return e===null?null:{parent:Xt._currentValue,pool:e}}var ms=Error(U(460)),Mp=Error(U(474)),au=Error(U(542)),Ad={then:function(){}};function lv(e){return e=e.status,e==="fulfilled"||e==="rejected"}function dw(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(jn,jn),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,dv(e),e===void 0&&!("reason"in t)?Error(U(600)):e;default:if(typeof t.status=="string")t.then(jn,jn);else{if(e=mt,e!==null&&100<e.shellSuspendCounter)throw Error(U(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var r=t;r.status="fulfilled",r.value=i}},function(i){if(t.status==="pending"){var r=t;r.status="rejected",r.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,dv(e),e}throw Ar=t,ms}}function $r(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Ar=a,ms):a}}var Ar=null;function cv(){if(Ar===null)throw Error(U(459));var e=Ar;return Ar=null,e}function dv(e){if(e===ms||e===au)throw Error(U(483))}var Po=null,El=0;function Bc(e){var t=El;return El+=1,Po===null&&(Po=[]),dw(Po,e,t)}function zi(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function jc(e,t){throw t.$$typeof===I5?Error(U(525)):(e=Object.prototype.toString.call(t),Error(U(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function uw(e){function t(S,v){if(e){var w=S.deletions;w===null?(S.deletions=[v],S.flags|=16):w.push(v)}}function a(S,v){if(!e)return null;for(;v!==null;)t(S,v),v=v.sibling;return null}function i(S){for(var v=new Map;S!==null;)S.key===null?v.set(S.index,S):v.set(S.key,S),S=S.sibling;return v}function r(S,v){return S=hi(S,v),S.index=0,S.sibling=null,S}function s(S,v,w){return S.index=w,e?(w=S.alternate,w!==null?(w=w.index,w<v?(S.flags|=2,v):w):(S.flags|=134217730,v)):(S.flags|=1048576,v)}function c(S){return e&&S.alternate===null&&(S.flags|=134217730),S}function d(S,v,w,A){return v===null||v.tag!==6?(v=Hh(w,S.mode,A),v.return=S,v):(v=r(v,w),v.return=S,v)}function h(S,v,w,A){var _=w.type;return _===Mo?(S=b(S,v,w.props.children,A,w.key),zi(S,w),S):v!==null&&(v.elementType===_||typeof _=="object"&&_!==null&&_.$$typeof===Ii&&$r(_)===v.type)?(v=r(v,w.props),zi(v,w),v.return=S,v):(v=id(w.type,w.key,w.props,null,S.mode,A),zi(v,w),v.return=S,v)}function p(S,v,w,A){return v===null||v.tag!==4||v.stateNode.containerInfo!==w.containerInfo||v.stateNode.implementation!==w.implementation?(v=Uh(w,S.mode,A),v.return=S,v):(v=r(v,w.children||[]),v.return=S,v)}function b(S,v,w,A,_){return v===null||v.tag!==7?(v=Tr(w,S.mode,A,_),v.return=S,v):(v=r(v,w),v.return=S,v)}function $(S,v,w){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return v=Hh(""+v,S.mode,w),v.return=S,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Vc:return w=id(v.type,v.key,v.props,null,S.mode,w),zi(w,v),w.return=S,w;case il:return v=Uh(v,S.mode,w),v.return=S,v;case Ii:return v=$r(v),$(S,v,w)}if(rl(v)||Ks(v))return v=Tr(v,S.mode,w,null),v.return=S,v;if(typeof v.then=="function")return $(S,Bc(v),w);if(v.$$typeof===Bn)return $(S,Lc(S,v),w);jc(S,v)}return null}function f(S,v,w,A){var _=v!==null?v.key:null;if(typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint")return _!==null?null:d(S,v,""+w,A);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Vc:return w.key===_?h(S,v,w,A):null;case il:return w.key===_?p(S,v,w,A):null;case Ii:return w=$r(w),f(S,v,w,A)}if(rl(w)||Ks(w))return _!==null?null:b(S,v,w,A,null);if(typeof w.then=="function")return f(S,v,Bc(w),A);if(w.$$typeof===Bn)return f(S,v,Lc(S,w),A);jc(S,w)}return null}function y(S,v,w,A,_){if(typeof A=="string"&&A!==""||typeof A=="number"||typeof A=="bigint")return S=S.get(w)||null,d(v,S,""+A,_);if(typeof A=="object"&&A!==null){switch(A.$$typeof){case Vc:return S=S.get(A.key===null?w:A.key)||null,h(v,S,A,_);case il:return S=S.get(A.key===null?w:A.key)||null,p(v,S,A,_);case Ii:return A=$r(A),y(S,v,w,A,_)}if(rl(A)||Ks(A))return S=S.get(w)||null,b(v,S,A,_,null);if(typeof A.then=="function")return y(S,v,w,Bc(A),_);if(A.$$typeof===Bn)return y(S,v,w,Lc(v,A),_);jc(v,A)}return null}function V(S,v,w,A){for(var _=null,Z=null,ee=v,Q=v=0,Te=null;ee!==null&&Q<w.length;Q++){ee.index>Q?(Te=ee,ee=null):Te=ee.sibling;var B=f(S,ee,w[Q],A);if(B===null){ee===null&&(ee=Te);break}e&&ee&&B.alternate===null&&t(S,ee),v=s(B,v,Q),Z===null?_=B:Z.sibling=B,Z=B,ee=Te}if(Q===w.length)return a(S,ee),ze&&di(S,Q),_;if(ee===null){for(;Q<w.length;Q++)ee=$(S,w[Q],A),ee!==null&&(v=s(ee,v,Q),Z===null?_=ee:Z.sibling=ee,Z=ee);return ze&&di(S,Q),_}for(ee=i(ee);Q<w.length;Q++)Te=y(ee,S,Q,w[Q],A),Te!==null&&(e&&(B=Te.alternate,B!==null&&ee.delete(B.key===null?Q:B.key)),v=s(Te,v,Q),Z===null?_=Te:Z.sibling=Te,Z=Te);return e&&ee.forEach(function(re){return t(S,re)}),ze&&di(S,Q),_}function M(S,v,w,A){if(w==null)throw Error(U(151));for(var _=null,Z=null,ee=v,Q=v=0,Te=null,B=w.next();ee!==null&&!B.done;Q++,B=w.next()){ee.index>Q?(Te=ee,ee=null):Te=ee.sibling;var re=f(S,ee,B.value,A);if(re===null){ee===null&&(ee=Te);break}e&&ee&&re.alternate===null&&t(S,ee),v=s(re,v,Q),Z===null?_=re:Z.sibling=re,Z=re,ee=Te}if(B.done)return a(S,ee),ze&&di(S,Q),_;if(ee===null){for(;!B.done;Q++,B=w.next())B=$(S,B.value,A),B!==null&&(v=s(B,v,Q),Z===null?_=B:Z.sibling=B,Z=B);return ze&&di(S,Q),_}for(ee=i(ee);!B.done;Q++,B=w.next())B=y(ee,S,Q,B.value,A),B!==null&&(e&&(Te=B.alternate,Te!==null&&ee.delete(Te.key===null?Q:Te.key)),v=s(B,v,Q),Z===null?_=B:Z.sibling=B,Z=B);return e&&ee.forEach(function(ve){return t(S,ve)}),ze&&di(S,Q),_}function O(S,v,w,A){if(typeof w=="object"&&w!==null&&w.type===Mo&&w.key===null&&w.props.ref===void 0&&(w=w.props.children),typeof w=="object"&&w!==null){switch(w.$$typeof){case Vc:e:{for(var _=w.key;v!==null;){if(v.key===_){if(_=w.type,_===Mo){if(v.tag===7){a(S,v.sibling),A=r(v,w.props.children),zi(A,w),A.return=S,S=A;break e}}else if(v.elementType===_||typeof _=="object"&&_!==null&&_.$$typeof===Ii&&$r(_)===v.type){a(S,v.sibling),A=r(v,w.props),zi(A,w),A.return=S,S=A;break e}a(S,v);break}else t(S,v);v=v.sibling}w.type===Mo?(A=Tr(w.props.children,S.mode,A,w.key),zi(A,w),A.return=S,S=A):(A=id(w.type,w.key,w.props,null,S.mode,A),zi(A,w),A.return=S,S=A)}return c(S);case il:e:{for(_=w.key;v!==null;){if(v.key===_)if(v.tag===4&&v.stateNode.containerInfo===w.containerInfo&&v.stateNode.implementation===w.implementation){a(S,v.sibling),A=r(v,w.children||[]),A.return=S,S=A;break e}else{a(S,v);break}else t(S,v);v=v.sibling}A=Uh(w,S.mode,A),A.return=S,S=A}return c(S);case Ii:return w=$r(w),O(S,v,w,A)}if(rl(w))return V(S,v,w,A);if(Ks(w)){if(_=Ks(w),typeof _!="function")throw Error(U(150));return w=_.call(w),M(S,v,w,A)}if(typeof w.then=="function")return O(S,v,Bc(w),A);if(w.$$typeof===Bn)return O(S,v,Lc(S,w),A);jc(S,w)}return typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint"?(w=""+w,v!==null&&v.tag===6?(a(S,v.sibling),A=r(v,w),A.return=S,S=A):(a(S,v),A=Hh(w,S.mode,A),A.return=S,S=A),c(S)):a(S,v)}return function(S,v,w,A){try{El=0;var _=O(S,v,w,A);return Po=null,_}catch(ee){if(ee===ms||ee===au)throw ee;var Z=Oa(29,ee,null,S.mode);return Z.lanes=A,Z.return=S,Z}}}var Ir=uw(!0),hw=uw(!1),Di=!1;function zp(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Cm(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Pi(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Xi(e,t,a){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(Je&2)!==0){var r=i.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),i.pending=t,t=kd(e),nw(e,null,a),t}return eu(e,i,t,a),kd(e)}function ml(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Ay(e,a)}}function Lh(e,t){var a=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,a===i)){var r=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?r=s=c:s=s.next=c,a=a.next}while(a!==null);s===null?r=s=t:s=s.next=t}else r=s=t;a={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,callbacks:i.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var Tm=!1;function pl(){if(Tm){var e=Go;if(e!==null)throw e}}function gl(e,t,a,i){Tm=!1;var r=e.updateQueue;Di=!1;var s=r.firstBaseUpdate,c=r.lastBaseUpdate,d=r.shared.pending;if(d!==null){r.shared.pending=null;var h=d,p=h.next;h.next=null,c===null?s=p:c.next=p,c=h;var b=e.alternate;b!==null&&(b=b.updateQueue,d=b.lastBaseUpdate,d!==c&&(d===null?b.firstBaseUpdate=p:d.next=p,b.lastBaseUpdate=h))}if(s!==null){var $=r.baseState;c=0,b=p=h=null,d=s;do{var f=d.lane&-536870913,y=f!==d.lane;if(y?(Ue&f)===f:(i&f)===f){f!==0&&f===Or&&(Tm=!0),b!==null&&(b=b.next={lane:0,tag:d.tag,payload:d.payload,callback:null,next:null});e:{var V=e,M=d;f=t;var O=a;switch(M.tag){case 1:if(V=M.payload,typeof V=="function"){$=V.call(O,$,f);break e}$=V;break e;case 3:V.flags=V.flags&-65537|128;case 0:if(V=M.payload,f=typeof V=="function"?V.call(O,$,f):V,f==null)break e;$=pt({},$,f);break e;case 2:Di=!0}}f=d.callback,f!==null&&(e.flags|=64,y&&(e.flags|=8192),y=r.callbacks,y===null?r.callbacks=[f]:y.push(f))}else y={lane:f,tag:d.tag,payload:d.payload,callback:d.callback,next:null},b===null?(p=b=y,h=$):b=b.next=y,c|=f;if(d=d.next,d===null){if(d=r.shared.pending,d===null)break;y=d,d=y.next,y.next=null,r.lastBaseUpdate=y,r.shared.pending=null}}while(!0);b===null&&(h=$),r.baseState=h,r.firstBaseUpdate=p,r.lastBaseUpdate=b,s===null&&(r.shared.lanes=0),ir|=c,e.lanes=c,e.memoizedState=$}}function mw(e,t){if(typeof e!="function")throw Error(U(191,e));e.call(t)}function pw(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)mw(a[e],t)}var ar=Qn(null),Rd=Qn(0);function uv(e,t){e=yi,xt(Rd,e),xt(ar,t),yi=e|t.baseLanes}function Em(){xt(Rd,yi),xt(ar,ar.current)}function Vp(){yi=Rd.current,ca(ar),ca(Rd)}var ha=Qn(null),ba=null;function Zi(e){var t=e.alternate;xt(da,da.current&1),xt(ha,e),ba===null&&(t===null||ar.current!==null||t.memoizedState!==null)&&(ba=e)}function Am(e){xt(da,da.current),xt(ha,e),ba===null&&(ba=e)}function gw(e){e.tag===22?(xt(da,da.current),xt(ha,e),ba===null&&(ba=e)):Qi()}function Qi(){xt(da,da.current),xt(ha,ha.current)}function La(e){ca(ha),ba===e&&(ba=null),ca(da)}var da=Qn(0);function Al(e,t){xt(ha,ha.current),xt(da,t)}function Op(e){ca(da),ca(ha),ba===e&&(ba=null)}function Md(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||cp(a)||sg(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var fi=0,Ee=null,dt=null,Pt=null,zd=!1,Xo=!1,Dr=!1,Vd=0,Rl=0,Zo=null,aN=0;function Ht(){throw Error(U(321))}function Ip(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!Za(e[a],t[a]))return!1;return!0}function Dp(e,t,a,i,r,s){return fi=s,Ee=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,$e.H=e===null||e.memoizedState===null?Pw:Xw,Dr=!1,s=a(i,r),Dr=!1,Xo&&(s=bw(t,a,i,r)),fw(e),s}function fw(e){$e.H=Od;var t=dt!==null&&dt.next!==null;if(fi=0,Pt=dt=Ee=null,zd=!1,Rl=0,Zo=null,t)throw Error(U(300));e===null||Zt||(e=e.dependencies,e!==null&&Ed(e)&&(Zt=!0))}function bw(e,t,a,i){Ee=e;var r=0;do{if(Xo&&(Zo=null),Rl=0,Xo=!1,25<=r)throw Error(U(301));if(r+=1,Pt=dt=null,e.updateQueue!=null){var s=e.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}$e.H=dN,s=t(a,i)}while(Xo);return s}function nN(){var e=$e.H,t=e.useState()[0];return t=typeof t.then=="function"?Gl(t):t,e=e.useState()[0],(dt!==null?dt.memoizedState:null)!==e&&(Ee.flags|=1024),t}function _p(){var e=Vd!==0;return Vd=0,e}function Hp(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Up(e){if(zd){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}zd=!1}fi=0,Pt=dt=Ee=null,Xo=!1,Rl=Vd=0,Zo=null}function Ta(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Pt===null?Ee.memoizedState=Pt=e:Pt=Pt.next=e,Pt}function Yt(){if(dt===null){var e=Ee.alternate;e=e!==null?e.memoizedState:null}else e=dt.next;var t=Pt===null?Ee.memoizedState:Pt.next;if(t!==null)Pt=t,dt=e;else{if(e===null)throw Ee.alternate===null?Error(U(467)):Error(U(310));dt=e,e={memoizedState:dt.memoizedState,baseState:dt.baseState,baseQueue:dt.baseQueue,queue:dt.queue,next:null},Pt===null?Ee.memoizedState=Pt=e:Pt=Pt.next=e}return Pt}function nu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Gl(e){var t=Rl;return Rl+=1,Zo===null&&(Zo=[]),e=dw(Zo,e,t),t=Ee,(Pt===null?t.memoizedState:Pt.next)===null&&(t=t.alternate,$e.H=t===null||t.memoizedState===null?Pw:Xw),e}function iu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Gl(e);if(e.$$typeof===H5)return;if(e.$$typeof===Bn)return la(e)}throw Error(U(438,String(e)))}function qp(e){var t=null,a=Ee.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var i=Ee.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(r){return r.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=nu(),Ee.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),i=0;i<e;i++)a[i]=_5;return t.index++,a}function bi(e,t){return typeof t=="function"?t(e):t}function sd(e){var t=Yt();return Lp(t,dt,e)}function Lp(e,t,a){var i=e.queue;if(i===null)throw Error(U(311));i.lastRenderedReducer=a;var r=e.baseQueue,s=i.pending;if(s!==null){if(r!==null){var c=r.next;r.next=s.next,s.next=c}t.baseQueue=r=s,i.pending=null}if(s=e.baseState,r===null)e.memoizedState=s;else{t=r.next;var d=c=null,h=null,p=t,b=!1;do{var $=p.lane&-536870913;if($!==p.lane?(Ue&$)===$:(fi&$)===$){var f=p.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:p.action,hasEagerState:p.hasEagerState,eagerState:p.eagerState,next:null}),$===Or&&(b=!0);else if((fi&f)===f){p=p.next,f===Or&&(b=!0);continue}else $={lane:0,revertLane:p.revertLane,gesture:null,action:p.action,hasEagerState:p.hasEagerState,eagerState:p.eagerState,next:null},h===null?(d=h=$,c=s):h=h.next=$,Ee.lanes|=f,ir|=f;$=p.action,Dr&&a(s,$),s=p.hasEagerState?p.eagerState:a(s,$)}else f={lane:$,revertLane:p.revertLane,gesture:p.gesture,action:p.action,hasEagerState:p.hasEagerState,eagerState:p.eagerState,next:null},h===null?(d=h=f,c=s):h=h.next=f,Ee.lanes|=$,ir|=$;p=p.next}while(p!==null&&p!==t);if(h===null?c=s:h.next=d,!Za(s,e.memoizedState)&&(Zt=!0,b&&(a=Go,a!==null)))throw a;e.memoizedState=s,e.baseState=c,e.baseQueue=h,i.lastRenderedState=s}return r===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function Bh(e){var t=Yt(),a=t.queue;if(a===null)throw Error(U(311));a.lastRenderedReducer=e;var i=a.dispatch,r=a.pending,s=t.memoizedState;if(r!==null){a.pending=null;var c=r=r.next;do s=e(s,c.action),c=c.next;while(c!==r);Za(s,t.memoizedState)||(Zt=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),a.lastRenderedState=s}return[s,i]}function vw(e,t,a){var i=Ee,r=Yt(),s=ze;if(s){if(a===void 0)throw Error(U(407));a=a()}else a=t();var c=!Za((dt||r).memoizedState,a);if(c&&(r.memoizedState=a,Zt=!0),r=r.queue,Bp(xw.bind(null,i,r,e),[e]),e=r.getSnapshot!==t||c||Pt!==null&&(Pt.memoizedState.tag&1)!==0,ts(e?9:8,{destroy:void 0},ww.bind(null,i,r,a,t),null),e){if(i.flags|=2048,mt===null)throw Error(U(349));s||(fi&127)!==0||yw(i,t,a)}return a}function yw(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=Ee.updateQueue,t===null?(t=nu(),Ee.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function ww(e,t,a,i){t.value=a,t.getSnapshot=i,$w(t)&&Sw(e)}function xw(e,t,a){return a(function(){$w(t)&&Sw(e)})}function $w(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!Za(e,a)}catch{return!0}}function Sw(e){var t=Br(e,2);t!==null&&Ia(t,e,2)}function Rm(e){var t=Ta();if(typeof e=="function"){var a=e;if(e=a(),Dr){Hi(!0);try{a()}finally{Hi(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:bi,lastRenderedState:e},t}function Nw(e,t,a,i){return e.baseState=a,Lp(e,dt,typeof i=="function"?i:bi)}function iN(e,t,a,i,r){if(ou(e))throw Error(U(485));if(e=t.action,e!==null){var s={payload:r,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){s.listeners.push(c)}};$e.T!==null?a(!0):s.isTransition=!1,i(s),a=t.pending,a===null?(s.next=t.pending=s,kw(t,s)):(s.next=a.next,t.pending=a.next=s)}}function kw(e,t){var a=t.action,i=t.payload,r=e.state;if(t.isTransition){var s=$e.T,c={};c.types=s!==null?s.types:null,$e.T=c;try{var d=a(r,i),h=$e.S;h!==null&&h(c,d),hv(e,t,d)}catch(p){Mm(e,t,p)}finally{s!==null&&c.types!==null&&(s.types=c.types),$e.T=s}}else try{s=a(r,i),hv(e,t,s)}catch(p){Mm(e,t,p)}}function hv(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(i){mv(e,t,i)},function(i){return Mm(e,t,i)}):mv(e,t,a)}function mv(e,t,a){t.status="fulfilled",t.value=a,Cw(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,kw(e,a)))}function Mm(e,t,a){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=a,Cw(t),t=t.next;while(t!==i)}e.action=null}function Cw(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Tw(e,t){return t}function pv(e,t){if(ze){var a=mt.formState;if(a!==null){e:{var i=Ee;if(ze){if(wt){t:{for(var r=wt,s=sn;r.nodeType!==8;){if(!s){r=null;break t}if(r=ln(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){wt=ln(r.nextSibling),i=r.data==="F!";break e}}tr(i)}i=!1}i&&(t=a[0])}}return a=Ta(),a.memoizedState=a.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Tw,lastRenderedState:t},a.queue=i,a=jw.bind(null,Ee,i),i.dispatch=a,i=Rm(!1),s=Pp.bind(null,Ee,!1,i.queue),i=Ta(),r={state:t,dispatch:null,action:e,pending:null},i.queue=r,a=iN.bind(null,Ee,r,s,a),r.dispatch=a,i.memoizedState=e,[t,a,!1]}function gv(e){var t=Yt();return Ew(t,dt,e)}function Ew(e,t,a){if(t=Lp(e,t,Tw)[0],e=sd(bi)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=Gl(t)}catch(c){throw c===ms?au:c}else i=t;t=Yt();var r=t.queue,s=r.dispatch;return a!==t.memoizedState&&(Ee.flags|=2048,ts(9,{destroy:void 0},rN.bind(null,r,a),null)),[i,s,e]}function rN(e,t){e.action=t}function fv(e){var t=Yt(),a=dt;if(a!==null)return Ew(t,a,e);Yt(),t=t.memoizedState,a=Yt();var i=a.queue.dispatch;return a.memoizedState=e,[t,i,!1]}function ts(e,t,a,i){return e={tag:e,create:a,deps:i,inst:t,next:null},t=Ee.updateQueue,t===null&&(t=nu(),Ee.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(i=a.next,a.next=e,e.next=i,t.lastEffect=e),e}function Aw(){return Yt().memoizedState}function ld(e,t,a,i){var r=Ta();Ee.flags|=e,r.memoizedState=ts(1|t,{destroy:void 0},a,i===void 0?null:i)}function ru(e,t,a,i){var r=Yt();i=i===void 0?null:i;var s=r.memoizedState.inst;dt!==null&&i!==null&&Ip(i,dt.memoizedState.deps)?r.memoizedState=ts(t,s,a,i):(Ee.flags|=e,r.memoizedState=ts(1|t,s,a,i))}function bv(e,t){ld(8390656,8,e,t)}function Bp(e,t){ru(2048,8,e,t)}function oN(e){Ee.flags|=4;var t=Ee.updateQueue;if(t===null)t=nu(),Ee.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function Rw(e){var t=Yt().memoizedState;return oN({ref:t,nextImpl:e}),function(){if((Je&2)!==0)throw Error(U(440));return t.impl.apply(void 0,arguments)}}function Mw(e,t){return ru(4,2,e,t)}function zw(e,t){return ru(4,4,e,t)}function Vw(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Ow(e,t,a){a=a!=null?a.concat([e]):null,ru(4,4,Vw.bind(null,t,e),a)}function jp(){}function Iw(e,t){var a=Yt();t=t===void 0?null:t;var i=a.memoizedState;return t!==null&&Ip(t,i[1])?i[0]:(a.memoizedState=[e,t],e)}function Dw(e,t){var a=Yt();t=t===void 0?null:t;var i=a.memoizedState;if(t!==null&&Ip(t,i[1]))return i[0];if(i=e(),Dr){Hi(!0);try{e()}finally{Hi(!1)}}return a.memoizedState=[i,t],i}function Yp(e,t,a){return a===void 0||(fi&1073741824)!==0&&(Ue&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=E0(),Ee.lanes|=e,ir|=e,a)}function _w(e,t,a,i){return Za(a,t)?a:ar.current!==null?(e=Yp(e,a,i),Za(e,t)||(Zt=!0),e):(fi&106)===0||(fi&1073741824)!==0&&(Ue&261930)===0?(Zt=!0,e.memoizedState=a):(e=E0(),Ee.lanes|=e,ir|=e,t)}function Hw(e,t,a,i,r){var s=Ke.p;Ke.p=s!==0&&8>s?s:8;var c=$e.T,d={};d.types=c!==null?c.types:null,$e.T=d,Pp(e,!1,t,a);try{var h=r(),p=$e.S;if(p!==null&&p(d,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var b=tN(h,i);fl(e,t,b,Xa(e))}else fl(e,t,i,Xa(e))}catch($){fl(e,t,{then:function(){},status:"rejected",reason:$},Xa())}finally{Ke.p=s,c!==null&&d.types!==null&&(c.types=d.types),$e.T=c}}function sN(){}function zm(e,t,a,i){if(e.tag!==5)throw Error(U(476));var r=Uw(e).queue;Hw(e,r,t,Cr,a===null?sN:function(){return qw(e),a(i)})}function Uw(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Cr,baseState:Cr,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:bi,lastRenderedState:Cr},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:bi,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function qw(e){var t=Uw(e);t.next===null&&(t=e.alternate.memoizedState),fl(e,t.next.queue,{},Xa())}function Gp(){return la(ls)}function Lw(){return Yt().memoizedState}function Bw(){return Yt().memoizedState}function lN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=Xa();e=Pi(a);var i=Xi(t,e,a);i!==null&&(Ia(i,t,a),ml(i,t,a)),t={cache:Ap()},e.payload=t;return}t=t.return}}function cN(e,t,a){var i=Xa();a={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},ou(e)?Yw(t,a):(a=Cp(e,t,a,i),a!==null&&(Ia(a,e,i),Gw(a,t,i)))}function jw(e,t,a){var i=Xa();fl(e,t,a,i)}function fl(e,t,a,i){var r={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(ou(e))Yw(t,r);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var c=t.lastRenderedState,d=s(c,a);if(r.hasEagerState=!0,r.eagerState=d,Za(d,c))return eu(e,t,r,0),mt===null&&Wd(),!1}catch{}if(a=Cp(e,t,r,i),a!==null)return Ia(a,e,i),Gw(a,t,i),!0}return!1}function Pp(e,t,a,i){if(i={lane:2,revertLane:ng(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},ou(e)){if(t)throw Error(U(479))}else t=Cp(e,a,i,2),t!==null&&Ia(t,e,2)}function ou(e){var t=e.alternate;return e===Ee||t!==null&&t===Ee}function Yw(e,t){Xo=zd=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Gw(e,t,a){if((a&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Ay(e,a)}}var Od={readContext:la,use:iu,useCallback:Ht,useContext:Ht,useEffect:Ht,useImperativeHandle:Ht,useLayoutEffect:Ht,useInsertionEffect:Ht,useMemo:Ht,useReducer:Ht,useRef:Ht,useState:Ht,useDebugValue:Ht,useDeferredValue:Ht,useTransition:Ht,useSyncExternalStore:Ht,useId:Ht,useHostTransitionStatus:Ht,useFormState:Ht,useActionState:Ht,useOptimistic:Ht,useMemoCache:Ht,useCacheRefresh:Ht,useEffectEvent:Ht},Pw={readContext:la,use:iu,useCallback:function(e,t){return Ta().memoizedState=[e,t===void 0?null:t],e},useContext:la,useEffect:bv,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,ld(4194308,4,Vw.bind(null,t,e),a)},useLayoutEffect:function(e,t){return ld(4194308,4,e,t)},useInsertionEffect:function(e,t){ld(4,2,e,t)},useMemo:function(e,t){var a=Ta();t=t===void 0?null:t;var i=e();if(Dr){Hi(!0);try{e()}finally{Hi(!1)}}return a.memoizedState=[i,t],i},useReducer:function(e,t,a){var i=Ta();if(a!==void 0){var r=a(t);if(Dr){Hi(!0);try{a(t)}finally{Hi(!1)}}}else r=t;return i.memoizedState=i.baseState=r,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:r},i.queue=e,e=e.dispatch=cN.bind(null,Ee,e),[i.memoizedState,e]},useRef:function(e){var t=Ta();return e={current:e},t.memoizedState=e},useState:function(e){e=Rm(e);var t=e.queue,a=jw.bind(null,Ee,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:jp,useDeferredValue:function(e,t){var a=Ta();return Yp(a,e,t)},useTransition:function(){var e=Rm(!1);return e=Hw.bind(null,Ee,e.queue,!0,!1),Ta().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var i=Ee,r=Ta();if(ze){if(a===void 0)throw Error(U(407));a=a()}else{if(a=t(),mt===null)throw Error(U(349));(Ue&127)!==0||yw(i,t,a)}r.memoizedState=a;var s={value:a,getSnapshot:t};return r.queue=s,bv(xw.bind(null,i,s,e),[e]),i.flags|=2048,ts(9,{destroy:void 0},ww.bind(null,i,s,a,t),null),a},useId:function(){var e=Ta(),t=mt.identifierPrefix;if(ze){var a=Gn,i=Yn;a=(i&~(1<<32-Pa(i)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Vd++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=aN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Gp,useFormState:pv,useActionState:pv,useOptimistic:function(e){var t=Ta();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=Pp.bind(null,Ee,!0,a),a.dispatch=t,[e,t]},useMemoCache:qp,useCacheRefresh:function(){return Ta().memoizedState=lN.bind(null,Ee)},useEffectEvent:function(e){var t=Ta(),a={impl:e};return t.memoizedState=a,function(){if((Je&2)!==0)throw Error(U(440));return a.impl.apply(void 0,arguments)}}},Xw={readContext:la,use:iu,useCallback:Iw,useContext:la,useEffect:Bp,useImperativeHandle:Ow,useInsertionEffect:Mw,useLayoutEffect:zw,useMemo:Dw,useReducer:sd,useRef:Aw,useState:function(){return sd(bi)},useDebugValue:jp,useDeferredValue:function(e,t){var a=Yt();return _w(a,dt.memoizedState,e,t)},useTransition:function(){var e=sd(bi)[0],t=Yt().memoizedState;return[typeof e=="boolean"?e:Gl(e),t]},useSyncExternalStore:vw,useId:Lw,useHostTransitionStatus:Gp,useFormState:gv,useActionState:gv,useOptimistic:function(e,t){var a=Yt();return Nw(a,dt,e,t)},useMemoCache:qp,useCacheRefresh:Bw,useEffectEvent:Rw},dN={readContext:la,use:iu,useCallback:Iw,useContext:la,useEffect:Bp,useImperativeHandle:Ow,useInsertionEffect:Mw,useLayoutEffect:zw,useMemo:Dw,useReducer:Bh,useRef:Aw,useState:function(){return Bh(bi)},useDebugValue:jp,useDeferredValue:function(e,t){var a=Yt();return dt===null?Yp(a,e,t):_w(a,dt.memoizedState,e,t)},useTransition:function(){var e=Bh(bi)[0],t=Yt().memoizedState;return[typeof e=="boolean"?e:Gl(e),t]},useSyncExternalStore:vw,useId:Lw,useHostTransitionStatus:Gp,useFormState:fv,useActionState:fv,useOptimistic:function(e,t){var a=Yt();return dt!==null?Nw(a,dt,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:qp,useCacheRefresh:Bw,useEffectEvent:Rw};function jh(e,t,a,i){t=e.memoizedState,a=a(i,t),a=a==null?t:pt({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Vm={enqueueSetState:function(e,t,a){e=e._reactInternals;var i=Xa(),r=Pi(i);r.payload=t,a!=null&&(r.callback=a),t=Xi(e,r,i),t!==null&&(Ia(t,e,i),ml(t,e,i))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var i=Xa(),r=Pi(i);r.tag=1,r.payload=t,a!=null&&(r.callback=a),t=Xi(e,r,i),t!==null&&(Ia(t,e,i),ml(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=Xa(),i=Pi(a);i.tag=2,t!=null&&(i.callback=t),t=Xi(e,i,a),t!==null&&(Ia(t,e,a),ml(t,e,a))}};function vv(e,t,a,i,r,s,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,s,c):t.prototype&&t.prototype.isPureReactComponent?!kl(a,i)||!kl(r,s):!0}function yv(e,t,a,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,i),t.state!==e&&Vm.enqueueReplaceState(t,t.state,null)}function _r(e,t){var a=t;if("ref"in t){a={};for(var i in t)i!=="ref"&&(a[i]=t[i])}if(e=e.defaultProps){a===t&&(a=pt({},a));for(var r in e)a[r]===void 0&&(a[r]=e[r])}return a}function Zw(e){Nd(e)}function Qw(e){console.error(e)}function Fw(e){Nd(e)}function Id(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function wv(e,t,a){try{var i=e.onCaughtError;i(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Om(e,t,a){return a=Pi(a),a.tag=3,a.payload={element:null},a.callback=function(){Id(e,t)},a}function Jw(e){return e=Pi(e),e.tag=3,e}function Kw(e,t,a,i){var r=a.type.getDerivedStateFromError;if(typeof r=="function"){var s=i.value;e.payload=function(){return r(s)},e.callback=function(){wv(t,a,i)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){wv(t,a,i),typeof r!="function"&&(Fi===null?Fi=new Set([this]):Fi.add(this));var d=i.stack;this.componentDidCatch(i.value,{componentStack:d!==null?d:""})})}function uN(e,t,a,i,r){if(a.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=a.alternate,t!==null&&zr(t,a,r,!0),a=ha.current,a!==null){switch(a.tag){case 31:case 13:case 19:return ba===null?jd():a.alternate===null&&Ut===0&&(Ut=3),a.flags&=-257,a.flags|=65536,a.lanes=r,i===Ad?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([i]):t.add(i),Fh(e,i,r)),!1;case 22:return a.flags|=65536,i===Ad?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([i]):a.add(i)),Fh(e,i,r)),!1}throw Error(U(435,a.tag))}return Fh(e,i,r),jd(),!1}if(ze)return t=ha.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=r,i!==$m&&(e=Error(U(422),{cause:i}),Tl(on(e,a)))):(i!==$m&&(t=Error(U(423),{cause:i}),Tl(on(t,a))),e=e.current.alternate,e.flags|=65536,r&=-r,e.lanes|=r,i=on(i,a),r=Om(e.stateNode,i,r),Lh(e,r),Ut!==4&&(Ut=2)),!1;var s=Error(U(520),{cause:i});if(s=on(s,a),wl===null?wl=[s]:wl.push(s),Ut!==4&&(Ut=2),t===null)return!0;i=on(i,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=r&-r,a.lanes|=e,e=Om(a.stateNode,i,e),Lh(a,e),!1;case 1:if(t=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(Fi===null||!Fi.has(s))))return a.flags|=65536,r&=-r,a.lanes|=r,r=Jw(r),Kw(r,e,a,i),Lh(a,r),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var Xp=Error(U(461)),Zt=!1;function Ft(e,t,a,i){t.child=e===null?hw(t,null,a,i):Ir(t,e.child,a,i)}function xv(e,t,a,i,r){a=a.render;var s=t.ref;if("ref"in i){var c={};for(var d in i)d!=="ref"&&(c[d]=i[d])}else c=i;return Vr(t),i=Dp(e,t,a,c,s,r),d=_p(),e!==null&&!Zt?(Hp(e,t,r),vi(e,t,r)):(ze&&d&&tu(t),t.flags|=1,Ft(e,t,i,r),t.child)}function $v(e,t,a,i,r){if(e===null){var s=a.type;return typeof s=="function"&&!Tp(s)&&s.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=s,Ww(e,t,s,i,r)):(e=id(a.type,null,i,t,t.mode,r),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!Qp(e,r)){var c=s.memoizedProps;if(a=a.compare,a=a!==null?a:kl,a(c,i)&&e.ref===t.ref)return vi(e,t,r)}return t.flags|=1,e=hi(s,i),e.ref=t.ref,e.return=t,t.child=e}function Ww(e,t,a,i,r){if(e!==null){var s=e.memoizedProps;if(kl(s,i)&&e.ref===t.ref)if(Zt=!1,t.pendingProps=i=s,Qp(e,r))(e.flags&131072)!==0&&(Zt=!0);else return t.lanes=e.lanes,vi(e,t,r)}return Im(e,t,a,i,r)}function e0(e,t,a,i){var r=i.children,s=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(s=s!==null?s.baseLanes|a:a,e!==null){for(i=t.child=e.child,r=0;i!==null;)r=r|i.lanes|i.childLanes,i=i.sibling;i=r&~s}else i=0,t.child=null;return Sv(e,t,s,a,i)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&od(t,s!==null?s.cachePool:null),s!==null?uv(t,s):Em(),gw(t);else return i=t.lanes=536870912,Sv(e,t,s!==null?s.baseLanes|a:a,a,i)}else s!==null?(od(t,s.cachePool),uv(t,s),Qi(),t.memoizedState=null):(e!==null&&od(t,null),Em(),Qi());return Ft(e,t,r,a),t.child}function bl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Sv(e,t,a,i,r){var s=Rp();return s=s===null?null:{parent:Xt._currentValue,pool:s},t.memoizedState={baseLanes:a,cachePool:s},e!==null&&od(t,null),Em(),gw(t),e!==null&&zr(e,t,i,!0),t.childLanes=r,null}function cd(e,t){return t=su({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Nv(e,t,a){return Ir(t,e.child,null,a),e=cd(t,t.pendingProps),e.flags|=2,La(t),t.memoizedState=null,e}function hN(e,t,a){var i=t.pendingProps,r=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(ze){if(i.mode==="hidden")return e=cd(t,i),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},bl(null,e);if(Am(t),(e=wt)?(e=e1(e,sn),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:er!==null?{id:Yn,overflow:Gn}:null,retryLane:536870912,hydrationErrors:null},a=rw(e),a.return=t,t.child=a,ia=t,wt=null)):e=null,e===null)throw tr(t);return t.lanes=536870912,null}return cd(t,i)}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(Am(t),r)if(t.flags&256)t.flags&=-257,t=Nv(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(U(558));else if(Zt||zr(e,t,a,!1),r=(a&e.childLanes)!==0,Zt||r){if(ar.current===null){if(i=mt,i!==null&&(c=Ry(i,a),c!==0&&c!==s.retryLane))throw s.retryLane=c,Br(e,c),Ia(i,e,c),Xp;jd()}t=Nv(e,t,a)}else e=s.treeContext,wt=ln(c.nextSibling),ia=t,ze=!0,Gi=null,sn=!1,e!==null&&sw(t,e),t=cd(t,i),t.flags|=134221824;return t}return e=hi(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function To(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(U(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Im(e,t,a,i,r){return Vr(t),a=Dp(e,t,a,i,void 0,r),i=_p(),e!==null&&!Zt?(Hp(e,t,r),vi(e,t,r)):(ze&&i&&tu(t),t.flags|=1,Ft(e,t,a,r),t.child)}function kv(e,t,a,i,r,s){return Vr(t),t.updateQueue=null,a=bw(t,i,a,r),fw(e),i=_p(),e!==null&&!Zt?(Hp(e,t,s),vi(e,t,s)):(ze&&i&&tu(t),t.flags|=1,Ft(e,t,a,s),t.child)}function Cv(e,t,a,i,r){if(Vr(t),t.stateNode===null){var s=Ho,c=a.contextType;typeof c=="object"&&c!==null&&(s=la(c)),s=new a(i,s),t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Vm,t.stateNode=s,s._reactInternals=t,s=t.stateNode,s.props=i,s.state=t.memoizedState,s.refs={},zp(t),c=a.contextType,s.context=typeof c=="object"&&c!==null?la(c):Ho,s.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(jh(t,a,c,i),s.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(c=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),c!==s.state&&Vm.enqueueReplaceState(s,s.state,null),gl(t,i,s,r),pl(),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){s=t.stateNode;var d=t.memoizedProps,h=_r(a,d);s.props=h;var p=s.context,b=a.contextType;c=Ho,typeof b=="object"&&b!==null&&(c=la(b));var $=a.getDerivedStateFromProps;b=typeof $=="function"||typeof s.getSnapshotBeforeUpdate=="function",d=t.pendingProps!==d,b||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(d||p!==c)&&yv(t,s,i,c),Di=!1;var f=t.memoizedState;s.state=f,gl(t,i,s,r),pl(),p=t.memoizedState,d||f!==p||Di?(typeof $=="function"&&(jh(t,a,$,i),p=t.memoizedState),(h=Di||vv(t,a,h,i,f,p,c))?(b||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=p),s.props=i,s.state=p,s.context=c,i=h):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{s=t.stateNode,Cm(e,t),c=t.memoizedProps,b=_r(a,c),s.props=b,$=t.pendingProps,f=s.context,p=a.contextType,h=Ho,typeof p=="object"&&p!==null&&(h=la(p)),d=a.getDerivedStateFromProps,(p=typeof d=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==$||f!==h)&&yv(t,s,i,h),Di=!1,f=t.memoizedState,s.state=f,gl(t,i,s,r),pl();var y=t.memoizedState;c!==$||f!==y||Di||e!==null&&e.dependencies!==null&&Ed(e.dependencies)?(typeof d=="function"&&(jh(t,a,d,i),y=t.memoizedState),(b=Di||vv(t,a,b,i,f,y,h)||e!==null&&e.dependencies!==null&&Ed(e.dependencies))?(p||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(i,y,h),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(i,y,h)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=y),s.props=i,s.state=y,s.context=h,i=b):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),i=!1)}return s=i,To(e,t),i=(t.flags&128)!==0,s||i?(s=t.stateNode,a=i&&typeof a.getDerivedStateFromError!="function"?null:s.render(),t.flags|=1,e!==null&&i?(t.child=Ir(t,e.child,null,r),t.child=Ir(t,null,a,r)):Ft(e,t,a,r),t.memoizedState=s.state,e=t.child):e=vi(e,t,r),e}function Tv(e,t,a,i){return Mr(),t.flags|=256,Ft(e,t,a,i),t.child}var Dm={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function _m(e){return{baseLanes:e,cachePool:cw()}}function Hm(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=ja),e}function t0(e,t,a){var i=t.pendingProps,r=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(da.current&2)!==0),c&&(r=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(ze){if(r?Zi(t):Qi(),(e=wt)?(e=e1(e,sn),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:er!==null?{id:Yn,overflow:Gn}:null,retryLane:536870912,hydrationErrors:null},a=rw(e),a.return=t,t.child=a,ia=t,wt=null)):e=null,e===null)throw tr(t);return sg(e)?t.lanes=32:t.lanes=536870912,null}return s=i.children,i=i.fallback,r?(Qi(),r=t.mode,s=su({mode:"hidden",children:s},r),i=Tr(i,r,a,null),s.return=t,i.return=t,s.sibling=i,t.child=s,i=t.child,i.memoizedState=_m(a),i.childLanes=Hm(e,c,a),t.memoizedState=Dm,bl(null,i)):(Zi(t),Zp(t,s))}var d=e.memoizedState;if(d!==null){var h=d.dehydrated;if(h!==null)return mN(e,t,s,c,i,h,d,a)}return r?(Qi(),r=i.fallback,s=t.mode,d=e.child,h=d.sibling,i=hi(d,{mode:"hidden",children:i.children}),i.subtreeFlags=d.subtreeFlags&1206910976,h!==null?r=hi(h,r):(r=Tr(r,s,a,null),r.flags|=2),r.return=t,i.return=t,i.sibling=r,t.child=i,bl(null,i),i=t.child,r=e.child.memoizedState,r===null?r=_m(a):(s=r.cachePool,s!==null?(d=Xt._currentValue,s=s.parent!==d?{parent:d,pool:d}:s):s=cw(),r={baseLanes:r.baseLanes|a,cachePool:s}),i.memoizedState=r,i.childLanes=Hm(e,c,a),t.memoizedState=Dm,bl(e.child,i)):(Zi(t),a=e.child,e=a.sibling,a=hi(a,{mode:"visible",children:i.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function Zp(e,t){return t=su({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function su(e,t){return e=Oa(22,e,null,t),e.lanes=0,e}function Yc(e,t,a){return Ir(t,e.child,null,a),e=Zp(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function mN(e,t,a,i,r,s,c,d){if(a)return t.flags&256?(Zi(t),t.flags&=-257,Yc(e,t,d)):t.memoizedState!==null?(Qi(),t.child=e.child,t.flags|=128,null):(Qi(),s=r.fallback,c=t.mode,r=su({mode:"visible",children:r.children},c),s=Tr(s,c,d,null),s.flags|=2,r.return=t,s.return=t,r.sibling=s,t.child=r,Ir(t,e.child,null,d),r=t.child,r.memoizedState=_m(d),r.childLanes=Hm(e,i,d),t.memoizedState=Dm,bl(null,r));if(Zi(t),sg(s)){if(i=s.nextSibling&&s.nextSibling.dataset,i)var h=i.dgst;return i=h,i!==""&&(r=Error(U(419)),r.stack="",r.digest=i,Tl({value:r,source:null,stack:null})),Yc(e,t,d)}if(Zt||zr(e,t,d,!1),i=(d&e.childLanes)!==0,Zt||i){if(ar.current!==null)return Yc(e,t,d);if(i=mt,i!==null&&(r=Ry(i,d),r!==0&&r!==c.retryLane))throw c.retryLane=r,Br(e,r),Ia(i,e,r),Xp;return cp(s)||jd(),Yc(e,t,d)}return cp(s)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,wt=ln(s.nextSibling),ia=t,ze=!0,Gi=null,sn=!1,e!==null&&sw(t,e),t=Zp(t,r.children),t.flags|=134221824,t)}function Ev(e,t,a){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),rd(e.return,t,a)}function Av(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Md(a)===null&&(t=e),e=e.sibling}return t}function Gc(e,t,a,i,r,s){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:a,tailMode:r,treeForkCount:s}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=i,c.tail=a,c.tailMode=r,c.treeForkCount=s)}function Yh(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Um(e,t,a){var i=t.pendingProps,r=i.revealOrder,s=i.tail;i=i.children;var c=da.current;if(t.flags&128)return Al(t,c),null;var d=(c&2)!==0;if(d?(c=c&1|2,t.flags|=128):c&=1,Al(t,c),r==="backwards"&&e!==null?(Yh(e),Ft(e,t,i,a),Yh(e)):Ft(e,t,i,a),i=ze?Cl:0,!d&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Ev(e,a,t);else if(e.tag===19)Ev(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(r){case"backwards":a=Av(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null,Yh(t)),Gc(t,!0,r,null,s,i);break;case"unstable_legacy-backwards":for(a=null,r=t.child,t.child=null;r!==null;){if(e=r.alternate,e!==null&&Md(e)===null){t.child=r;break}e=r.sibling,r.sibling=a,a=r,r=e}Gc(t,!0,a,null,s,i);break;case"together":Gc(t,!1,null,null,void 0,i);break;case"independent":t.memoizedState=null;break;default:a=Av(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null),Gc(t,!1,r,a,s,i)}return t.child}function Rv(e,t,a){var i=t.pendingProps;return qi(t,t.type,i.value),Ft(e,t,i.children,a),t.child}function vi(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),ir|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(zr(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(U(153));if(t.child!==null){for(e=t.child,a=hi(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=hi(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function Qp(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Ed(e)))}function pN(e,t,a){switch(t.tag){case 3:wd(t,t.stateNode.containerInfo),qi(t,Xt,e.memoizedState.cache),Mr();break;case 27:case 5:hm(t);break;case 4:wd(t,t.stateNode.containerInfo);break;case 10:qi(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Am(t),null;break;case 13:var i=t.memoizedState;if(i!==null){if(i.dehydrated!==null)return Zi(t),t.flags|=128,null;i=zr(e,t,a,!1);var r=t.child.childLanes;return i||(a&r)!==0?t0(e,t,a):(Zi(t),e=vi(e,t,a),e!==null?e.sibling:null)}Zi(t);break;case 19:if(t.flags&128)return Um(e,t,a);if(r=(e.flags&128)!==0,i=(a&t.childLanes)!==0,i||(zr(e,t,a,!1),i=(a&t.childLanes)!==0),r){if(i)return Um(e,t,a);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),Al(t,da.current),i)break;return null;case 22:return t.lanes=0,e0(e,t,a,t.pendingProps);case 24:qi(t,Xt,e.memoizedState.cache)}return vi(e,t,a)}function a0(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)Zt=!0;else{if(!Qp(e,a)&&(t.flags&128)===0)return Zt=!1,pN(e,t,a);Zt=(e.flags&131072)!==0}else Zt=!1,ze&&(t.flags&1048576)!==0&&ow(t,Cl,t.index);switch(t.lanes=0,t.tag){case 16:e:{var i=t.pendingProps;if(e=$r(t.elementType),t.type=e,typeof e=="function")Tp(e)?(i=_r(e,i),t.tag=1,t=Cv(null,t,e,i,a)):(t.tag=0,t=Im(null,t,e,i,a));else{if(e!=null){var r=e.$$typeof;if(r===pp){t.tag=11,t=xv(null,t,e,i,a);break e}else if(r===gp){t.tag=14,t=$v(null,t,e,i,a);break e}else if(r===Bn){t.tag=10,t.type=e,t=Rv(null,t,a);break e}}throw t=dm(e)||e,Error(U(306,t,""))}}return t;case 0:return Im(e,t,t.type,t.pendingProps,a);case 1:return i=t.type,r=_r(i,t.pendingProps),Cv(e,t,i,r,a);case 3:e:{if(wd(t,t.stateNode.containerInfo),e===null)throw Error(U(387));i=t.pendingProps;var s=t.memoizedState;r=s.element,Cm(e,t),gl(t,i,null,a);var c=t.memoizedState;if(i=c.cache,qi(t,Xt,i),i!==s.cache&&Nm(t,[Xt],a,!0),pl(),i=c.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){t=Tv(e,t,i,a);break e}else if(i!==r){r=on(Error(U(424)),t),Tl(r),t=Tv(e,t,i,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,wt=ln(e.firstChild),ia=t,ze=!0,Gi=null,sn=!0,a=hw(t,null,i,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Mr(),i===r){t=vi(e,t,a);break e}Ft(e,t,i,a)}t=t.child}return t;case 26:return To(e,t),e===null?(a=ny(t.type,null,t.pendingProps,null))?t.memoizedState=a:ze||(t.stateNode=G0(t.type,t.pendingProps,Yi.current,t)):t.memoizedState=ny(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return hm(t),e===null&&ze&&(i=t.stateNode=t1(t.type,t.pendingProps,Yi.current),ia=t,sn=!0,r=wt,or(t.type)?(dp=r,wt=ln(i.firstChild)):wt=r),Ft(e,t,t.pendingProps.children,a),To(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&ze&&((r=i=wt)&&(i=ok(i,t.type,t.pendingProps,sn),i!==null?(t.stateNode=i,ia=t,wt=ln(i.firstChild),sn=!1,r=!0):r=!1),r||tr(t)),hm(t),r=t.type,s=t.pendingProps,c=e!==null?e.memoizedProps:null,i=s.children,op(r,s)?i=null:c!==null&&op(r,c)&&(t.flags|=32),t.memoizedState!==null&&(r=Dp(e,t,nN,null,null,a),ls._currentValue=r),To(e,t),Ft(e,t,i,a),t.child;case 6:return e===null&&ze&&((e=a=wt)&&(a=sk(a,t.pendingProps,sn),a!==null?(t.stateNode=a,ia=t,wt=null,e=!0):e=!1),e||tr(t)),null;case 13:return t0(e,t,a);case 4:return wd(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=Ir(t,null,i,a):Ft(e,t,i,a),t.child;case 11:return xv(e,t,t.type,t.pendingProps,a);case 7:return i=t.pendingProps,To(e,t),Ft(e,t,i,a),t.child;case 8:return Ft(e,t,t.pendingProps.children,a),t.child;case 12:return Ft(e,t,t.pendingProps.children,a),t.child;case 10:return Rv(e,t,a);case 9:return r=t.type._context,i=t.pendingProps.children,Vr(t),r=la(r),i=i(r),t.flags|=1,Ft(e,t,i,a),t.child;case 14:return $v(e,t,t.type,t.pendingProps,a);case 15:return Ww(e,t,t.type,t.pendingProps,a);case 19:return Um(e,t,a);case 31:return hN(e,t,a);case 22:return e0(e,t,a,t.pendingProps);case 24:return Vr(t),i=la(Xt),e===null?(r=Rp(),r===null&&(r=mt,s=Ap(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=a),r=s),t.memoizedState={parent:i,cache:r},zp(t),qi(t,Xt,r)):((e.lanes&a)!==0&&(Cm(e,t),gl(t,null,null,a),pl()),r=e.memoizedState,s=t.memoizedState,r.parent!==i?(r={parent:i,cache:i},t.memoizedState=r,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=r),qi(t,Xt,i)):(i=s.cache,qi(t,Xt,i),i!==r.cache&&Nm(t,[Xt],a,!0))),Ft(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),i=t.pendingProps,i.name!=null&&i.name!=="auto"?t.flags|=e===null?18882560:18874368:ze&&tu(t),e!==null&&e.memoizedProps.name!==i.name?t.flags|=4194816:To(e,t),Ft(e,t,i.children,a),t.child;case 29:throw t.pendingProps}throw Error(U(156,t.tag))}function ci(e){e.flags|=4}function Gh(e,t,a,i,r){var s;if((s=(e.mode&32)!==0)&&(s=a===null?oy(t,i):oy(t,i)&&(i.src!==a.src||i.srcSet!==a.srcSet)),s){if(e.flags|=16777216,(r&335544128)===r)if(e.stateNode.complete)e.flags|=8192;else if(M0())e.flags|=8192;else throw Ar=Ad,Mp}else e.flags&=-16777217}function Mv(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!r1(t))if(M0())e.flags|=8192;else throw Ar=Ad,Mp}function Pc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Ty():536870912,e.lanes|=t,as|=t)}function el(e,t){if(!ze)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,i=null;a!==null;)a.alternate!==null&&(i=a),a=a.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function yt(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,i=0;if(t)for(var r=e.child;r!==null;)a|=r.lanes|r.childLanes,i|=r.subtreeFlags&1206910976,i|=r.flags&1206910976,r.return=e,r=r.sibling;else for(r=e.child;r!==null;)a|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=e,r=r.sibling;return e.subtreeFlags|=i,e.childLanes=a,t}function gN(e,t,a){var i=t.pendingProps;switch(Ep(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return yt(t),null;case 1:return yt(t),null;case 3:return a=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),mi(Xt),Ko(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(ko(t)?ci(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,qh())),yt(t),null;case 26:var r=t.type,s=t.memoizedState;return e===null?(ci(t),s!==null?(yt(t),Mv(t,s)):(yt(t),Gh(t,r,null,i,a))):s?s!==e.memoizedState?(ci(t),yt(t),Mv(t,s)):(yt(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&ci(t),yt(t),Gh(t,r,e,i,a)),null;case 27:if(xd(t),a=Yi.current,r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&ci(t);else{if(!i){if(t.stateNode===null)throw Error(U(166));return yt(t),t.subtreeFlags&=-33554433,null}e=Pn.current,ko(t)?iv(t,e):(e=t1(r,i,a),t.stateNode=e,ci(t))}return yt(t),t.subtreeFlags&=-33554433,null;case 5:if(xd(t),r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&ci(t);else{if(!i){if(t.stateNode===null)throw Error(U(166));return yt(t),t.subtreeFlags&=-33554433,null}if(s=Pn.current,ko(t))iv(t,s);else{var c=Vl(Yi.current);switch(s){case 1:s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=c.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof i.is=="string"?c.createElement("select",{is:i.is}):c.createElement("select"),i.multiple?s.multiple=!0:i.size&&(s.size=i.size);break;default:s=typeof i.is=="string"?c.createElement(r,{is:i.is}):c.createElement(r)}}s[sa]=t,s[_a]=i;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)s.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=s;e:switch(ua(s,r,i),r){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}i&&ci(t)}}return yt(t),t.subtreeFlags&=-33554433,Gh(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&ci(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(U(166));if(e=Yi.current,ko(t)){if(e=t.stateNode,a=t.memoizedProps,i=null,r=ia,r!==null)switch(r.tag){case 27:case 5:i=r.memoizedProps}e[sa]=t,e=!!(e.nodeValue===a||i!==null&&i.suppressHydrationWarning===!0||j0(e.nodeValue,a)),e||tr(t,!0)}else e=Vl(e).createTextNode(i),e[sa]=t,t.stateNode=e}return yt(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(i=ko(t),a!==null){if(e===null){if(!i)throw Error(U(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(U(557));e[sa]=t}else Mr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;yt(t),e=!1}else a=qh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(La(t),t):(La(t),null);if((t.flags&128)!==0)throw Error(U(558))}return yt(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(r=ko(t),i!==null&&i.dehydrated!==null){if(e===null){if(!r)throw Error(U(318));if(r=t.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(U(317));r[sa]=t}else Mr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;yt(t),r=!1}else r=qh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=r),r=!0;if(!r)return t.flags&256?(La(t),t):(La(t),null)}return La(t),(t.flags&128)!==0?(t.lanes=a,t):(a=i!==null,e=e!==null&&e.memoizedState!==null,a&&(i=t.child,r=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(r=i.alternate.memoizedState.cachePool.pool),s=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(s=i.memoizedState.cachePool.pool),s!==r&&(i.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),Pc(t,t.updateQueue),yt(t),null);case 4:return Ko(),e===null&&ig(t.stateNode.containerInfo),t.flags|=67108864,yt(t),null;case 10:return mi(t.type),yt(t),null;case 19:if(Op(t),i=t.memoizedState,i===null)return yt(t),null;if(r=(t.flags&128)!==0,s=i.rendering,s===null)if(r)el(i,!1);else{if(Ut!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=Md(e),s!==null){for(t.flags|=128,el(i,!1),e=s.updateQueue,t.updateQueue=e,Pc(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)iw(a,e),a=a.sibling;return Al(t,da.current&1|2),ze&&di(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&Ya()>Ld&&(t.flags|=128,r=!0,el(i,!1),t.lanes=4194304)}else{if(!r)if(e=Md(s),e!==null){if(t.flags|=128,r=!0,e=e.updateQueue,t.updateQueue=e,Pc(t,e),el(i,!0),i.tail===null&&i.tailMode!=="collapsed"&&i.tailMode!=="visible"&&!s.alternate&&!ze)return yt(t),null}else 2*Ya()-i.renderingStartTime>Ld&&a!==536870912&&(t.flags|=128,r=!0,el(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(e=i.last,e!==null?e.sibling=s:t.child=s,i.last=s)}if(i.tail!==null){e=i.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return i.rendering=e,i.tail=e.sibling,i.renderingStartTime=Ya(),e.sibling=null,s=da.current,s=r?s&1|2:s&1,i.tailMode==="visible"||i.tailMode==="collapsed"||!a||ze?Al(t,s):(a=s,xt(ha,t),xt(da,a),ba===null&&(ba=t)),ze&&di(t,i.treeForkCount),e}return yt(t),null;case 22:case 23:return La(t),Vp(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(a&536870912)!==0&&(t.flags&128)===0&&(yt(t),t.subtreeFlags&6&&(t.flags|=8192)):yt(t),a=t.updateQueue,a!==null&&Pc(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==a&&(t.flags|=2048),e!==null&&ca(Er),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),mi(Xt),yt(t),null;case 25:return null;case 30:return t.flags|=33554432,yt(t),null}throw Error(U(156,t.tag))}function fN(e,t){switch(Ep(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return mi(Xt),Ko(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return xd(t),null;case 31:if(t.memoizedState!==null){if(La(t),t.alternate===null)throw Error(U(340));Mr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(La(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(U(340));Mr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Op(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Ko(),null;case 10:return mi(t.type),null;case 22:case 23:return La(t),Vp(),e!==null&&ca(Er),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return mi(Xt),null;case 25:return null;default:return null}}function n0(e,t){switch(Ep(t),t.tag){case 3:mi(Xt),Ko();break;case 26:case 27:case 5:xd(t);break;case 4:Ko();break;case 31:t.memoizedState!==null&&La(t);break;case 13:La(t);break;case 19:Op(t);break;case 10:mi(t.type);break;case 22:case 23:La(t),Vp(),e!==null&&ca(Er);break;case 24:mi(Xt)}}function Pl(e,t){try{var a=t.updateQueue,i=a!==null?a.lastEffect:null;if(i!==null){var r=i.next;a=r;do{if((a.tag&e)===e){i=void 0;var s=a.create,c=a.inst;i=s(),c.destroy=i}a=a.next}while(a!==r)}}catch(d){ot(t,t.return,d)}}function nr(e,t,a){try{var i=t.updateQueue,r=i!==null?i.lastEffect:null;if(r!==null){var s=r.next;i=s;do{if((i.tag&e)===e){var c=i.inst,d=c.destroy;if(d!==void 0){c.destroy=void 0,r=t;var h=a,p=d;try{p()}catch(b){ot(r,h,b)}}}i=i.next}while(i!==s)}}catch(b){ot(t,t.return,b)}}function i0(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{pw(t,a)}catch(i){ot(e,e.return,i)}}}function r0(e,t,a){a.props=_r(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(i){ot(e,t,i)}}function qn(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:var r=e.stateNode,s=gi(e.memoizedProps,r);(r.ref===null||r.ref.name!==s)&&(r.ref=Q0(s)),i=r.ref;break;case 7:if(e.stateNode===null){var c=new Qa(e);Da(e.child,!1,ik,c,void 0,void 0),e.stateNode=c}i=e.stateNode;break;default:i=e.stateNode}typeof a=="function"?e.refCleanup=a(i):a.current=i}}catch(d){ot(e,t,d)}}function oa(e,t){var a=e.ref,i=e.refCleanup;if(a!==null)if(typeof i=="function")try{i()}catch(r){ot(e,t,r)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(r){ot(e,t,r)}else a.current=null}function Dd(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)W0(e.stateNode,t[a])}function zv(e){for(var t=e.return;t!==null&&(Jp(t)&&W0(e.stateNode,t.stateNode),!Fp(t));)t=t.return}function vl(e){for(var t=e.return;t!==null&&(Jp(t)&&rk(e.stateNode,t.stateNode),!Fp(t));)t=t.return}function Fp(e){return e.tag===5||e.tag===3||e.tag===27}function Jp(e){return e&&e.tag===7&&e.stateNode!==null}function qm(e){var t=e.type,a=e.memoizedProps,i=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&i.focus();break e;case"img":a.src?i.src=a.src:a.srcSet&&(i.srcset=a.srcSet)}}catch(r){ot(e,e.return,r)}}function Ph(e,t,a){try{var i=e.stateNode;qN(i,e.type,a,t),i[_a]=t}catch(r){ot(e,e.return,r)}}function o0(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&or(e.type)||e.tag===4}function Xh(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||o0(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&or(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Lm(e,t,a,i){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(r,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(r),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=jn)),Dd(e,i),Qe=!0;else if(r!==4&&(r===27&&(Dd(e,i),i=null,or(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(Lm(e,t,a,i),e=e.sibling;e!==null;)Lm(e,t,a,i),e=e.sibling}function _d(e,t,a,i){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?a.insertBefore(r,t):a.appendChild(r),Dd(e,i),Qe=!0;else if(r!==4&&(r===27&&(Dd(e,i),i=null,or(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(_d(e,t,a,i),e=e.sibling;e!==null;)_d(e,t,a,i),e=e.sibling}function s0(e){var t=e.stateNode,a=e.memoizedProps;try{for(var i=e.type,r=t.attributes;r.length;)t.removeAttributeNode(r[0]);ua(t,i,a),t[sa]=e,t[_a]=a}catch(s){ot(e,e.return,s)}}var Hd=!1,Ba=null;function Vv(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Hd=!0)}var Ln=null;function Ov(){var e=Ln;return Ln=null,e}var Va=0;function ps(e,t,a,i,r){return Va=0,l0(e.child,t,a,i,r)}function l0(e,t,a,i,r){for(var s=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(i!==null){var d=sp(c);i.push(d),d.view&&(s=!0)}else s||sp(c).view&&(s=!0);Hd=!0,P0(c,Va===0?t:t+"_"+Va,a),Va++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&r||l0(e.child,t,a,i,r)&&(s=!0));e=e.sibling}return s}function Zn(e,t){for(;e!==null;)e.tag===5?X0(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||Zn(e.child,t)),e=e.sibling}function dd(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(dd(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(U(544));var a=t.name;t=xi(t.default,t.share),t!=="none"&&(ps(e,a,t,null,!1)||Zn(e.child,!1))}e=e.sibling}}function Bm(e,t){if(e.tag===30){var a=e.stateNode,i=e.memoizedProps,r=gi(i,a),s=xi(i.default,a.paired?i.share:i.enter);s!=="none"?ps(e,r,s,null,!1)?(dd(e),a.paired||t||ns(e,i.onEnter)):Zn(e.child,!1):dd(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Bm(e,t),e=e.sibling;else dd(e)}function jm(e){if(Ba!==null&&Ba.size!==0){var t=Ba;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,i=a.name;if(i!=null&&i!=="auto"){var r=t.get(i);if(r!==void 0){var s=xi(a.default,a.share);if(s!=="none"&&(ps(e,i,s,null,!1)?(s=e.stateNode,r.paired=s,s.paired=r,ns(e,a.onShare)):Zn(e.child,!1)),t.delete(i),t.size===0)break}}}jm(e)}e=e.sibling}}}function Ym(e){if(e.tag===30){var t=e.memoizedProps,a=gi(t,e.stateNode),i=Ba!==null?Ba.get(a):void 0,r=xi(t.default,i!==void 0?t.share:t.exit);r!=="none"&&(ps(e,a,r,null,!1)?i!==void 0?(r=e.stateNode,i.paired=r,r.paired=i,Ba.delete(a),ns(e,t.onShare)):ns(e,t.onExit):Zn(e.child,!1)),Ba!==null&&jm(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Ym(e),e=e.sibling;else Ba!==null&&jm(e)}function c0(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=gi(t,e.stateNode);t=xi(t.default,t.update),e.flags&=-5,t!=="none"&&ps(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&c0(e);e=e.sibling}}function Gm(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,Zn(e.child,!1))}Gm(e)}e=e.sibling}}function ud(e){if(e.tag===30)e.stateNode.paired=null,Zn(e.child,!1),Gm(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)ud(e),e=e.sibling;else Gm(e)}function d0(e){for(e=e.child;e!==null;)e.tag===30?Zn(e.child,!1):(e.subtreeFlags&33554432)!==0&&d0(e),e=e.sibling}function Kp(e,t,a,i,r,s,c){for(var d=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(s!==null&&Va<s.length){var p=s[Va],b=sp(h);(p.view||b.view)&&(d=!0);var $;if($=(e.flags&4)===0)if(b.clip)$=!0;else{$=p.rect;var f=b.rect;$=$.y!==f.y||$.x!==f.x||$.height!==f.height||$.width!==f.width}$&&(e.flags|=4),b.abs?b=!p.abs:(p=p.rect,b=b.rect,b=p.height!==b.height||p.width!==b.width),b&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&P0(h,Va===0?a:a+"_"+Va,r),d&&(e.flags&4)!==0||(Ln===null&&(Ln=[]),Ln.push(h,Va===0?i:i+"_"+Va,t.memoizedProps)),Va++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:Kp(e,t.child,a,i,r,s,c)&&(d=!0));t=t.sibling}return d}function u0(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,i=e.stateNode,r=gi(a,i),s=xi(a.default,a.update);if(t){i=i.clones;var c=i===null?null:i.map(PN)}else c=e.memoizedState,e.memoizedState=null;i=e;var d=e.child;Va=0,r=Kp(i,d,r,r,s,c,!1),(e.flags&4)!==0&&r&&(t||ns(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&u0(e,t);e=e.sibling}}var ta=!1,tt=!1,_n=!1,Zh=!1,Iv=typeof WeakSet=="function"?WeakSet:Set,aa=null,Hn=!1,ll=!1,Ud=!1,Pm=!1;function bN(e,t,a){if(e=e.containerInfo,ip=cs,e=Fy(e),Np(e)){if("selectionStart"in e)var i={start:e.selectionStart,end:e.selectionEnd};else e:{i=(i=e.ownerDocument)&&i.defaultView||window;var r=i.getSelection&&i.getSelection();if(r&&r.rangeCount!==0){i=r.anchorNode;var s=r.anchorOffset,c=r.focusNode;r=r.focusOffset;try{i.nodeType,c.nodeType}catch{i=null;break e}var d=0,h=-1,p=-1,b=0,$=0,f=e,y=null;t:for(;;){for(var V;f!==i||s!==0&&f.nodeType!==3||(h=d+s),f!==c||r!==0&&f.nodeType!==3||(p=d+r),f.nodeType===3&&(d+=f.nodeValue.length),(V=f.firstChild)!==null;)y=f,f=V;for(;;){if(f===e)break t;if(y===i&&++b===s&&(h=d),y===c&&++$===r&&(p=d),(V=f.nextSibling)!==null)break;f=y,y=f.parentNode}f=V}i=h===-1||p===-1?null:{start:h,end:p}}else i=null}i=i||{start:0,end:0}}else i=null;for(rp={focusedElem:e,selectionRange:i},cs=!1,a=(a&335544064)===a,aa=t,t=a?9270:1024;aa!==null;){if(e=aa,a&&(i=e.deletions,i!==null))for(s=0;s<i.length;s++)a&&Ym(i[s]);if(e.alternate===null&&(e.flags&2)!==0)a&&Vv(e),Xc(a);else{if(e.tag===22){if(i=e.alternate,e.memoizedState!==null){i!==null&&i.memoizedState===null&&a&&Ym(i),Xc(a);continue}else if(i!==null&&i.memoizedState!==null){a&&Vv(e),Xc(a);continue}}i=e.child,(e.subtreeFlags&t)!==0&&i!==null?(i.return=e,aa=i):(a&&c0(e),Xc(a))}}Ba=null}function Xc(e){for(;aa!==null;){var t=aa,a=e,i=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((r&1024)!==0&&i!==null){a=void 0,r=i.memoizedProps,i=i.memoizedState;var s=t.stateNode;try{var c=_r(t.type,r);a=s.getSnapshotBeforeUpdate(c,i),s.__reactInternalSnapshotBeforeUpdate=a}catch(d){ot(t,t.return,d)}}break;case 3:if((r&1024)!==0){if(i=t.stateNode.containerInfo,a=i.nodeType,a===9)lp(i);else if(a===1)switch(i.nodeName){case"HEAD":case"HTML":case"BODY":lp(i);break;default:i.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&i!==null&&(a=gi(i.memoizedProps,i.stateNode),r=t.memoizedProps,r=xi(r.default,r.update),r!=="none"&&ps(i,a,r,i.memoizedState=[],!0));break;default:if((r&1024)!==0)throw Error(U(163))}if(i=t.sibling,i!==null){i.return=t.return,aa=i;break}aa=t.return}}function h0(e,t,a){var i=a.flags;switch(a.tag){case 0:case 11:case 15:Un(e,a),i&4&&Pl(5,a);break;case 1:if(Un(e,a),i&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){ot(a,a.return,c)}else{var r=_r(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(r,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){ot(a,a.return,c)}}i&64&&i0(a),i&512&&qn(a,a.return);break;case 3:if(Un(e,a),i&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{pw(e,t)}catch(c){ot(a,a.return,c)}}break;case 27:t===null&&i&4&&s0(a);case 26:case 5:Un(e,a),t===null&&i&4&&qm(a),i&512&&qn(a,a.return);break;case 12:Un(e,a);break;case 31:Un(e,a),i&4&&f0(e,a);break;case 13:Un(e,a),i&4&&b0(e,a),i&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=AN.bind(null,a),lk(e,a))));break;case 22:if(i=a.memoizedState!==null||ta,!i){var s=t!==null&&t.memoizedState!==null||tt;t=ta,r=tt,ta=i,(tt=s)&&!r?(i=2,(a.subtreeFlags&8772)!==0&&(i|=1),yn(e,a,i)):Un(e,a),ta=t,tt=r}break;case 30:Un(e,a),i&512&&qn(a,a.return);break;case 7:i&512&&qn(a,a.return);default:Un(e,a)}}function Xm(e,t){for(e=e.child;e!==null;)m0(e,t),e=e.sibling}function m0(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var i=a.style;typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"}else{var r=e.stateNode,s=e.memoizedProps.style,c=s!=null&&s.hasOwnProperty("display")?s.display:null;r.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){ot(e,e.return,h)}Zm(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,Qe=!0}catch(h){ot(e,e.return,h)}break;case 18:try{var d=e.stateNode;t?Jv(d,!0):Jv(e.stateNode,!1)}catch(h){ot(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&Xm(e,t);break;default:Xm(e,t)}}function Zm(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,i=t;switch(a.tag){case 4:m0(a,i);break e;case 22:a.memoizedState===null&&Zm(a,i);break e;default:Zm(a,i)}}e=e.sibling}}function p0(e){var t=e.alternate;t!==null&&(e.alternate=null,p0(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Qd(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var At=null,Ma=!1;function vn(e,t,a){for(a=a.child;a!==null;)g0(e,t,a),a=a.sibling}function g0(e,t,a){if(Ga&&typeof Ga.onCommitFiberUnmount=="function")try{Ga.onCommitFiberUnmount(Ul,a)}catch{}switch(a.tag){case 26:tt||oa(a,t),vn(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!tt&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:tt||oa(a,t),vl(a);var i=At,r=Ma;or(a.type)&&(At=a.stateNode,Ma=!1),vn(e,t,a),a1(a.stateNode,a.type,a.memoizedProps),At=i,Ma=r;break;case 5:tt||oa(a,t),vl(a);case 6:if(a.tag===6&&vl(a),i=At,r=Ma,At=null,vn(e,t,a),At=i,Ma=r,At!==null)if(Ma)try{(At.nodeType===9?At.body:At.nodeName==="HTML"?At.ownerDocument.body:At).removeChild(a.stateNode),Qe=!0}catch(s){ot(a,t,s)}else try{At.removeChild(a.stateNode),Qe=!0}catch(s){ot(a,t,s)}break;case 18:At!==null&&(Ma?(e=At,Fv(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),ds(e)):Fv(At,a.stateNode));break;case 4:i=At,r=Ma,At=a.stateNode.containerInfo,Ma=!0,vn(e,t,a),At=i,Ma=r;break;case 0:case 11:case 14:case 15:nr(2,a,t),tt||nr(4,a,t),vn(e,t,a);break;case 1:tt||(oa(a,t),i=a.stateNode,typeof i.componentWillUnmount=="function"&&r0(a,t,i)),vn(e,t,a);break;case 21:vn(e,t,a);break;case 22:tt=(i=tt)||a.memoizedState!==null,vn(e,t,a),tt=i;break;case 30:oa(a,t),vn(e,t,a);break;case 7:tt||oa(a,t),vn(e,t,a);break;default:vn(e,t,a)}}function f0(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{ds(e)}catch(a){ot(t,t.return,a)}}}function b0(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{ds(e)}catch(a){ot(t,t.return,a)}}function vN(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Iv),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Iv),t;default:throw Error(U(435,e.tag))}}function Zc(e,t){var a=vN(e);t.forEach(function(i){if(!a.has(i)){a.add(i);var r=RN.bind(null,e,i);i.then(r,r)}})}function ka(e,t,a){var i=t.deletions;if(i!==null)for(var r=0;r<i.length;r++){var s=i[r],c=e,d=t,h=d;e:for(;h!==null;){switch(h.tag){case 27:if(or(h.type)){At=h.stateNode,Ma=!1;break e}break;case 5:At=h.stateNode,Ma=!1;break e;case 3:case 4:At=h.stateNode.containerInfo,Ma=!0;break e}h=h.return}if(At===null)throw Error(U(160));g0(c,d,s),At=null,Ma=!1,c=s.alternate,c!==null&&(c.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)v0(t,e,a),t=t.sibling}var wn=null;function v0(e,t,a){var i=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(r&4&&(i=e.updateQueue,i=i!==null?i.events:null,i!==null))for(var s=0;s<i.length;s++){var c=i[s];c.ref.impl=c.nextImpl}ka(t,e,a),Ca(e),r&4&&(nr(3,e,e.return),Pl(3,e),nr(5,e,e.return));break;case 1:ka(t,e,a),Ca(e),r&512&&(tt||i===null||oa(i,i.return)),r&64&&ta&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(s=wn,ka(t,e,a),Ca(e),r&512&&(tt||i===null||oa(i,i.return)),r&4)if(r=i!==null?i.memoizedState:null,a=e.memoizedState,i===null)if(a===null)if(e.stateNode===null)if(ta)e.stateNode=G0(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,r=s.ownerDocument||s;t:switch(t){case"title":i=r.getElementsByTagName("title")[0],(!i||i[Bl]||i[sa]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=r.createElement(t),r.head.insertBefore(i,r.querySelector("head > title"))),ua(i,t,a),i[sa]=e,na(i),t=i;break e;case"link":if(s=ry("link","href",r).get(t+(a.href||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&i.getAttribute("rel")===(a.rel==null?null:a.rel)&&i.getAttribute("title")===(a.title==null?null:a.title)&&i.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(c,1);break t}}i=r.createElement(t),ua(i,t,a),r.head.appendChild(i);break;case"meta":if(s=ry("meta","content",r).get(t+(a.content||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("content")===(a.content==null?null:""+a.content)&&i.getAttribute("name")===(a.name==null?null:a.name)&&i.getAttribute("property")===(a.property==null?null:a.property)&&i.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&i.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(c,1);break t}}i=r.createElement(t),ua(i,t,a),r.head.appendChild(i);break;default:throw Error(U(468,t))}i[sa]=e,na(i),t=i}e.stateNode=t}else ta||up(s,e.type,e.stateNode);else e.stateNode=iy(s,a,e.memoizedProps);else r!==a?(r===null?(t=i.stateNode,t===null||tt||t.parentNode.removeChild(t)):r.count--,a===null?ta||up(s,e.type,e.stateNode):iy(s,a,e.memoizedProps)):a===null&&e.stateNode!==null&&Ph(e,e.memoizedProps,i.memoizedProps);break;case 27:ka(t,e,a),Ca(e),r&512&&(tt||i===null||oa(i,i.return)),i!==null&&r&4&&Ph(e,e.memoizedProps,i.memoizedProps);break;case 5:if(s=_n,_n=!1,ka(t,e,a),_n=s,Ca(e),r&512&&(tt||i===null||oa(i,i.return)),e.flags&32){t=e.stateNode;try{es(t,""),Qe=!0}catch(b){ot(e,e.return,b)}}r&4&&e.stateNode!=null&&(t=e.memoizedProps,Ph(e,t,i!==null?i.memoizedProps:t)),r&1024&&(Zh=!0);break;case 6:if(ka(t,e,a),Ca(e),r&4){if(e.stateNode===null)throw Error(U(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,Qe=!0}catch(b){ot(e,e.return,b)}}break;case 3:if(Qe=!1,gd=null,s=wn,wn=Ol(t.containerInfo),ka(t,e,a),wn=s,Ca(e),r&4&&i!==null&&i.memoizedState.isDehydrated)try{ds(t.containerInfo)}catch(b){ot(e,e.return,b)}Zh&&(Zh=!1,y0(e)),Qe=!1;break;case 4:r=_n,_n=ta,i=Lb(),s=wn,wn=Ol(e.stateNode.containerInfo),ka(t,e,a),Ca(e),wn=s,Qe&&ll&&(Ud=!0),Qe=i,_n=r;break;case 12:ka(t,e,a),Ca(e);break;case 31:ka(t,e,a),Ca(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Zc(e,t)));break;case 13:ka(t,e,a),Ca(e),e.child.flags&8192&&e.memoizedState!==null!=(i!==null&&i.memoizedState!==null)&&(lu=Ya()),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Zc(e,t)));break;case 22:s=e.memoizedState!==null,c=i!==null&&i.memoizedState!==null;var d=ta,h=tt,p=_n;ta=d||s,_n=p||s,tt=h||c,ka(t,e,a),tt=h,_n=p,ta=d,Ca(e),r&8192&&(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,!s||i===null||c||ta||tt||(t=c||tt,a=ta,i=tt,ta=s||ta,tt=t,Oi(e,2),ta=a,tt=i),!s&&_n||Xm(e,s)),r&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,Zc(e,a))));break;case 19:ka(t,e,a),Ca(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Zc(e,t)));break;case 30:r&512&&(tt||i===null||oa(i,i.return)),r=Lb(),s=ll,c=(a&335544064)===a,d=e.memoizedProps,ll=c&&xi(d.default,d.update)!=="none",ka(t,e,a),Ca(e),c&&i!==null&&Qe&&(e.flags|=4),ll=s,Qe=r;break;case 21:break;case 7:r&512&&(tt||i===null||oa(i,i.return)),i&&i.stateNode!==null&&(i.stateNode._fragmentFiber=e);default:ka(t,e,a),Ca(e)}}function Ca(e){var t=e.flags;if(t&2){try{for(var a,i=e.return;i!==null;){if(o0(i)){a=i;break}i=i.return}i=null;for(var r=e.return;r!==null;){if(Jp(r)){var s=r.stateNode;i===null?i=[s]:i.push(s)}if(Fp(r))break;r=r.return}var c=i;if(a==null)throw Error(U(160));switch(a.tag){case 27:var d=a.stateNode,h=Xh(e);_d(e,h,d,c);break;case 5:var p=a.stateNode;a.flags&32&&(es(p,""),a.flags&=-33);var b=Xh(e);_d(e,b,p,c);break;case 3:case 4:var $=a.stateNode.containerInfo,f=Xh(e);Lm(e,f,$,c);break;default:throw Error(U(161))}}catch(y){ot(e,e.return,y)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function y0(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;y0(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,cs=!0,t.reset(),cs=!1),e=e.sibling}}function Co(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)w0(t,e),t=t.sibling;else u0(t,!1)}function w0(e,t){var a=e.alternate;if(a===null)Bm(e,!1);else switch(e.tag){case 3:if(Pm=Hn=!1,Ov(),Co(t,e),!Hn&&!Ud){if(e=Ln,e!==null)for(var i=0;i<e.length;i+=3){a=e[i];var r=e[i+1];X0(a,e[i+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+r+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),Pm=!0}Ln=null;break;case 5:Co(t,e);break;case 4:i=Hn,Hn=!1,Co(t,e),Hn&&(Ud=!0),Hn=i;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Bm(e,!1):Co(t,e));break;case 30:i=Hn,r=Ov(),Hn=!1,Co(t,e),Hn&&(e.flags|=4);var s=e.memoizedProps,c=e.stateNode;t=gi(s,c),c=gi(a.memoizedProps,c);var d=xi(s.default,s.update);d==="none"?t=!1:(s=a.memoizedState,a.memoizedState=null,a=e.child,Va=0,t=Kp(e,a,t,c,d,s,!0),Va!==(s===null?0:s.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(ns(e,e.memoizedProps.onUpdate),Ln=r):r!==null&&(r.push.apply(r,Ln),Ln=r),Hn=(e.flags&32)!==0?!0:i;break;default:Co(t,e)}}function Un(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)h0(e,t.alternate,t),t=t.sibling}function Oi(e,t){for(e=e.child;e!==null;){var a=e,i=t;switch(a.tag){case 0:case 11:case 14:case 15:nr(4,a,a.return),Oi(a,i);break;case 1:oa(a,a.return);var r=a.stateNode;typeof r.componentWillUnmount=="function"&&r0(a,a.return,r),Oi(a,i);break;case 27:(i&2)!==0&&a1(a.stateNode,a.type,a.memoizedProps);case 5:oa(a,a.return),a.tag!==5&&a.tag!==27||vl(a),Oi(a,i);break;case 6:vl(a);break;case 26:oa(a,a.return),r=a.stateNode,a.memoizedState!==null||r===null||tt||r.parentNode.removeChild(r),Oi(a,i);break;case 22:a.memoizedState===null&&Oi(a,i);break;case 30:oa(a,a.return),Oi(a,i);break;case 7:oa(a,a.return);default:Oi(a,i)}e=e.sibling}}function yn(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var i=t.alternate,r=e,s=t,c=s.flags,d=(a&1)!==0;switch(s.tag){case 0:case 11:case 15:yn(r,s,a),Pl(4,s);break;case 1:if(yn(r,s,a),i=s,r=i.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(b){ot(i,i.return,b)}if(i=s,r=i.updateQueue,r!==null){var h=i.stateNode;try{var p=r.shared.hiddenCallbacks;if(p!==null)for(r.shared.hiddenCallbacks=null,r=0;r<p.length;r++)mw(p[r],h)}catch(b){ot(i,i.return,b)}}d&&c&64&&i0(s),qn(s,s.return);break;case 27:(a&2)!==0&&s0(s);case 5:s.tag!==5&&s.tag!==27||zv(s),yn(r,s,a),d&&i===null&&c&4&&qm(s),qn(s,s.return);break;case 6:zv(s);break;case 26:h=s.stateNode,s.memoizedState!==null||h===null||ta||up(Ol(h.ownerDocument),s.type,h),yn(r,s,a),d&&i===null&&c&4&&qm(s),qn(s,s.return);break;case 12:yn(r,s,a);break;case 31:yn(r,s,a),d&&c&4&&f0(r,s);break;case 13:yn(r,s,a),d&&c&4&&b0(r,s);break;case 22:s.memoizedState===null&&yn(r,s,a),qn(s,s.return);break;case 30:yn(r,s,a),qn(s,s.return);break;case 7:qn(s,s.return);default:yn(r,s,a)}t=t.sibling}}function Wp(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Yl(a))}function eg(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Yl(e))}function en(e,t,a,i){var r=(a&335544064)===a;if(t.subtreeFlags&(r?10262:10256))for(t=t.child;t!==null;)x0(e,t,a,i),t=t.sibling;else r&&d0(t)}function x0(e,t,a,i){var r=(a&335544064)===a;r&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&ud(t);var s=t.flags;switch(t.tag){case 0:case 11:case 15:en(e,t,a,i),s&2048&&Pl(9,t);break;case 1:en(e,t,a,i);break;case 3:en(e,t,a,i),r&&Pm&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),s&2048&&(s=null,t.alternate!==null&&(s=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==s&&(t.refCount++,s!=null&&Yl(s)));break;case 12:if(s&2048){en(e,t,a,i),s=t.stateNode;try{var c=t.memoizedProps,d=c.id,h=c.onPostCommit;typeof h=="function"&&h(d,t.alternate===null?"mount":"update",s.passiveEffectDuration,-0)}catch(p){ot(t,t.return,p)}}else en(e,t,a,i);break;case 31:en(e,t,a,i);break;case 13:en(e,t,a,i);break;case 23:break;case 22:c=t.stateNode,d=t.alternate,t.memoizedState!==null?(r&&d!==null&&d.memoizedState===null&&ud(d),c._visibility&2?en(e,t,a,i):yl(e,t)):(r&&d!==null&&d.memoizedState!==null&&ud(t),c._visibility&2?en(e,t,a,i):(c._visibility|=2,Eo(e,t,a,i,(t.subtreeFlags&10256)!==0||!1))),s&2048&&Wp(d,t);break;case 24:en(e,t,a,i),s&2048&&eg(t.alternate,t);break;case 30:r&&(s=t.alternate,s!==null&&(Zn(s.child,!0),Zn(t.child,!0))),en(e,t,a,i);break;default:en(e,t,a,i)}}function Eo(e,t,a,i,r){for(r=r&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var s=e,c=t,d=a,h=i,p=c.flags;switch(c.tag){case 0:case 11:case 15:Eo(s,c,d,h,r),Pl(8,c);break;case 23:break;case 22:var b=c.stateNode;c.memoizedState!==null?b._visibility&2?Eo(s,c,d,h,r):yl(s,c):(b._visibility|=2,Eo(s,c,d,h,r)),r&&p&2048&&Wp(c.alternate,c);break;case 24:Eo(s,c,d,h,r),r&&p&2048&&eg(c.alternate,c);break;default:Eo(s,c,d,h,r)}t=t.sibling}}function yl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,i=t,r=i.flags;switch(i.tag){case 22:yl(a,i),r&2048&&Wp(i.alternate,i);break;case 24:yl(a,i),r&2048&&eg(i.alternate,i);break;default:yl(a,i)}t=t.sibling}}var Sr=8192;function wr(e,t,a){if(e.subtreeFlags&Sr)for(e=e.child;e!==null;)$0(e,t,a),e=e.sibling}function $0(e,t,a){switch(e.tag){case 26:wr(e,t,a),e.flags&Sr&&(e.memoizedState!==null?$k(a,wn,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&sy(a,e)));break;case 5:wr(e,t,a),e.flags&Sr&&(e=e.stateNode,(t&335544128)===t&&sy(a,e));break;case 3:case 4:var i=wn;wn=Ol(e.stateNode.containerInfo),wr(e,t,a),wn=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=Sr,Sr=16777216,wr(e,t,a),Sr=i):wr(e,t,a));break;case 30:if((e.flags&Sr)!==0&&(i=e.memoizedProps.name,i!=null&&i!=="auto")){var r=e.stateNode;r.paired=null,Ba===null&&(Ba=new Map),Ba.set(i,r)}wr(e,t,a);break;default:wr(e,t,a)}}function S0(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function tl(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];aa=i,k0(i,e)}S0(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)N0(e),e=e.sibling}function N0(e){switch(e.tag){case 0:case 11:case 15:tl(e),e.flags&2048&&nr(9,e,e.return);break;case 3:tl(e);break;case 12:tl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,hd(e)):tl(e);break;default:tl(e)}}function hd(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];aa=i,k0(i,e)}S0(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:nr(8,t,t.return),hd(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,hd(t));break;default:hd(t)}e=e.sibling}}function k0(e,t){for(;aa!==null;){var a=aa;switch(a.tag){case 0:case 11:case 15:nr(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var i=a.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:Yl(a.memoizedState.cache)}if(i=a.child,i!==null)i.return=a,aa=i;else e:for(a=e;aa!==null;){i=aa;var r=i.sibling,s=i.return;if(p0(i),i===a){aa=null;break e}if(r!==null){r.return=s,aa=r;break e}aa=s}}}var yN={getCacheForType:function(e){var t=la(Xt),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return la(Xt).controller.signal}},wN=typeof WeakMap=="function"?WeakMap:Map,Je=0,mt=null,_e=null,Ue=0,it=0,Ua=null,Li=!1,gs=!1,tg=!1,yi=0,Ut=0,ir=0,Rr=0,qd=0,ja=0,as=0,wl=null,za=null,Qm=!1,lu=0,C0=0,Ld=1/0,Bd=null,Fi=null,zt=0,$n=null,Hr=null,Xn=0,Fm=0,Jm=null,T0=null,Qo=null,Fo=null,Jo=null,xl=0,md=null;function Xa(){return(Je&2)!==0&&Ue!==0?Ue&-Ue:$e.T!==null?ng():My()}function E0(){if(ja===0)if((Ue&536870912)===0||ze){var e=Ic;Ic<<=1,(Ic&3932160)===0&&(Ic=262144),ja=e}else ja=536870912;return e=ha.current,e!==null&&(e.flags|=32),ja}function ns(e,t){if(t!=null){var a=e.stateNode,i=a.ref;i===null&&(i=a.ref=Q0(gi(e.memoizedProps,a))),Fo===null&&(Fo=[]),Fo.push(t.bind(null,i))}}function Ia(e,t,a){(e===mt&&(it===2||it===9)||e.cancelPendingCommit!==null)&&(is(e,0),Bi(e,Ue,ja,!1)),Ll(e,a),((Je&2)===0||e!==mt)&&(e===mt&&((Je&2)===0&&(Rr|=a),Ut===4&&Bi(e,Ue,ja,!1)),Fn(e))}function A0(e,t,a){if((Je&6)!==0)throw Error(U(327));var i=!a&&(t&127)===0&&(t&e.expiredLanes)===0||ql(e,t),r=i?SN(e,t):Qh(e,t,!0),s=i;do{if(r===0){gs&&!i&&Bi(e,t,0,!1);break}else{if(a=e.current.alternate,s&&!xN(a)){r=Qh(e,t,!1),s=!1;continue}if(r===2){if(s=t,e.errorRecoveryDisabledLanes&s)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var d=e;r=wl;var h=d.current.memoizedState.isDehydrated;if(h&&(is(d,c).flags|=256),c=Qh(d,c,!1),c!==2&&c!==6){if(tg&&!h){d.errorRecoveryDisabledLanes|=s,Rr|=s,r=4;break e}s=za,za=r,s!==null&&(za===null?za=s:za.push.apply(za,s))}r=c}if(s=!1,r!==2)continue}}if(r===1){is(e,0),Bi(e,t,0,!0);break}e:{switch(i=e,s=r,s){case 0:case 1:throw Error(U(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:Bi(i,t,ja,!Li);break e;case 2:za=null;break;case 3:case 5:break;default:throw Error(U(329))}if((t&62914560)===t&&(r=lu+300-Ya(),10<r)){if(Bi(i,t,ja,!Li),Zd(i,0,!0)!==0)break e;Xn=t,i.timeoutHandle=rg(Dv.bind(null,i,a,za,Bd,Qm,t,ja,Rr,as,Li,s,"Throttled",-0,0),r);break e}Dv(i,a,za,Bd,Qm,t,ja,Rr,as,Li,s,null,-0,0)}}break}while(!0);Fn(e)}function Dv(e,t,a,i,r,s,c,d,h,p,b,$,f,y){e.timeoutHandle=-1;var V=t.subtreeFlags,M=(s&335544064)===s;if($=null,(M||V&8192||(V&16785408)===16785408)&&($={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:jn},Ba=null,$0(t,s,$),M&&(V=$,M=e.containerInfo,M=(M.nodeType===9?M:M.ownerDocument).__reactViewTransition,M!=null&&(V.count++,V.waitingForViewTransition=!0,V=Il.bind(V),M.finished.then(V,V))),V=(s&62914560)===s?lu-Ya():(s&4194048)===s?C0-Ya():0,V=Sk($,V),V!==null)){Xn=s,e.cancelPendingCommit=V(Hv.bind(null,e,t,s,a,i,r,c,d,h,p,b,$,null,f,y)),Bi(e,s,c,!p);return}Hv(e,t,s,a,i,r,c,d,h,p,b,$)}function xN(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var i=0;i<a.length;i++){var r=a[i],s=r.getSnapshot;r=r.value;try{if(!Za(s(),r))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Bi(e,t,a,i){t=Cy(e,t),t&=~qd,t&=~Rr,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var r=t;0<r;){var s=31-Pa(r),c=1<<s;i[s]=-1,r&=~c}a!==0&&Ey(e,a,t)}function cu(){return(Je&6)===0?(Xl(0,!1),!1):!0}function ag(){if(_e!==null){if(it===0)var e=_e.return;else e=_e,ui=jr=null,Up(e),Po=null,El=0,e=_e;for(;e!==null;)n0(e.alternate,e),e=e.return;_e=null}}function is(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,jN(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),Xn=0,ag(),mt=e,_e=a=hi(e.current,null),Ue=t,it=0,Ua=null,Li=!1,gs=ql(e,t),tg=!1,as=ja=qd=Rr=ir=Ut=0,za=wl=null,Qm=!1,yi=Cy(e,t),Wd(),a}function R0(e,t){Ee=null,$e.H=Od,t===ms||t===au?(t=cv(),it=3):t===Mp?(t=cv(),it=4):it=t===Xp?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Ua=t,_e===null&&(Ut=1,Id(e,on(t,e.current)))}function M0(){var e=ha.current;return e===null?!0:(Ue&4194048)===Ue?ba===null:(Ue&62914560)===Ue||(Ue&536870912)!==0?e===ba:!1}function z0(){var e=$e.H;return $e.H=Od,e===null?Od:e}function V0(){var e=$e.A;return $e.A=yN,e}function jd(){Ut=4,Li||(Ue&4194048)!==Ue&&ha.current!==null||(gs=!0),(ir&134217727)===0&&(Rr&134217727)===0||mt===null||Bi(mt,Ue,ja,!1)}function Qh(e,t,a){var i=Je;Je|=2;var r=z0(),s=V0();(mt!==e||Ue!==t)&&(Bd=null,is(e,t)),t=!1;var c=Ut;e:do try{if(it!==0&&_e!==null){var d=_e,h=Ua;switch(it){case 8:ag(),c=6;break e;case 3:case 2:case 9:case 6:ha.current===null&&(t=!0);var p=it;if(it=0,Ua=null,Lo(e,d,h,p),a&&gs){c=0;break e}break;default:p=it,it=0,Ua=null,Lo(e,d,h,p)}}$N(),c=Ut;break}catch(b){R0(e,b)}while(!0);return t&&e.shellSuspendCounter++,ui=jr=null,Je=i,$e.H=r,$e.A=s,_e===null&&(mt=null,Ue=0,Wd()),c}function $N(){for(;_e!==null;)O0(_e)}function SN(e,t){var a=Je;Je|=2;var i=z0(),r=V0();mt!==e||Ue!==t?(Bd=null,Ld=Ya()+500,is(e,t)):gs=ql(e,t);e:do try{if(it!==0&&_e!==null){t=_e;var s=Ua;t:switch(it){case 1:it=0,Ua=null,Lo(e,t,s,1);break;case 2:case 9:if(lv(s)){it=0,Ua=null,_v(t);break}t=function(){it!==2&&it!==9||mt!==e||(it=7),Fn(e)},s.then(t,t);break e;case 3:it=7;break e;case 4:it=5;break e;case 7:lv(s)?(it=0,Ua=null,_v(t)):(it=0,Ua=null,Lo(e,t,s,7));break;case 5:var c=null;switch(_e.tag){case 26:c=_e.memoizedState;case 5:case 27:var d=_e;if(c?r1(c):d.stateNode.complete){it=0,Ua=null;var h=d.sibling;if(h!==null)_e=h;else{var p=d.return;p!==null?(_e=p,du(p)):_e=null}break t}}it=0,Ua=null,Lo(e,t,s,5);break;case 6:it=0,Ua=null,Lo(e,t,s,6);break;case 8:ag(),Ut=6;break e;default:throw Error(U(462))}}NN();break}catch(b){R0(e,b)}while(!0);return ui=jr=null,$e.H=i,$e.A=r,Je=a,_e!==null?0:(mt=null,Ue=0,Wd(),Ut)}function NN(){for(;_e!==null&&!L5();)O0(_e)}function O0(e){var t=a0(e.alternate,e,yi);e.memoizedProps=e.pendingProps,t===null?du(e):_e=t}function _v(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=kv(a,t,t.pendingProps,t.type,void 0,Ue);break;case 11:t=kv(a,t,t.pendingProps,t.type.render,t.ref,Ue);break;case 5:Up(t);var i=t;i===ia&&(ze?(Td(i),i.tag===5&&i.stateNode!=null&&(wt=i.stateNode)):(Td(i),ze=!0));default:n0(a,t),t=_e=iw(t,yi),t=a0(a,t,yi)}e.memoizedProps=e.pendingProps,t===null?du(e):_e=t}function Lo(e,t,a,i){ui=jr=null,Up(t),Po=null,El=0;var r=t.return;try{if(uN(e,r,t,a,Ue)){Ut=1,Id(e,on(a,e.current)),_e=null;return}}catch(s){if(r!==null)throw _e=r,s;Ut=1,Id(e,on(a,e.current)),_e=null;return}t.flags&32768?(ze||i===1?e=!0:gs||(Ue&536870912)!==0?e=!1:(Li=e=!0,(i===2||i===9||i===3||i===6)&&(i=ha.current,i!==null&&i.tag===13&&(i.flags|=16384))),I0(t,e)):du(t)}function du(e){var t=e;do{if((t.flags&32768)!==0){I0(t,Li);return}e=t.return;var a=gN(t.alternate,t,yi);if(a!==null){_e=a;return}if(t=t.sibling,t!==null){_e=t;return}_e=t=e}while(t!==null);Ut===0&&(Ut=5)}function I0(e,t){do{var a=fN(e.alternate,e);if(a!==null){a.flags&=32767,_e=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){_e=e;return}_e=e=a}while(e!==null);Ut=6,_e=null}function Hv(e,t,a,i,r,s,c,d,h,p,b,$){e.cancelPendingCommit=null;do uu();while(zt!==0);if((Je&6)!==0)throw Error(U(327));if(t!==null){if(t===e.current)throw Error(U(177));e===mt&&(_e=mt=null,Ue=0),Hr=t,$n=e,Xn=a,Jm=r,T0=i,kN(e,t,a,c,d,h,$)}}function kN(e,t,a,i,r,s,c){var d=t.lanes|t.childLanes;if(Fm=d,d|=kp,J5(e,a,d,i,r,s),Fo=null,(a&335544064)===a?(Jo=WS(e),i=10262):(Jo=null,i=10256),(t.subtreeFlags&i)!==0||(t.flags&i)!==0?(e.callbackNode=null,e.callbackPriority=0,MN($d,function(){return tp(),null})):(e.callbackNode=null,e.callbackPriority=0),Hd=!1,i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=$e.T,$e.T=null,r=Ke.p,Ke.p=2,s=Je,Je|=4;try{bN(e,t,a)}finally{Je=s,Ke.p=r,$e.T=i}}zt=1,Hd?Qo=QN(c,e.containerInfo,Jo,Km,Wm,TN,ep,tp,CN,null,null):(Km(),Wm(),ep())}function CN(e){if(zt!==0){var t=$n.onRecoverableError;t(e,{componentStack:null})}}function TN(){zt===3&&(zt=0,w0(Hr,$n),zt=4)}function Km(){if(zt===1){zt=0;var e=$n,t=Hr,a=Xn,i=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||i){i=$e.T,$e.T=null;var r=Ke.p;Ke.p=2;var s=Je;Je|=4;try{ll=Ud=!1,v0(t,e,a),a=rp;var c=Fy(e.containerInfo),d=a.focusedElem,h=a.selectionRange;if(c!==d&&d&&d.ownerDocument&&Qy(d.ownerDocument.documentElement,d)){if(h!==null&&Np(d)){var p=h.start,b=h.end;if(b===void 0&&(b=p),"selectionStart"in d)d.selectionStart=p,d.selectionEnd=Math.min(b,d.value.length);else{var $=d.ownerDocument||document,f=$&&$.defaultView||window;if(f.getSelection){var y=f.getSelection(),V=d.textContent.length,M=Math.min(h.start,V),O=h.end===void 0?M:Math.min(h.end,V);!y.extend&&M>O&&(c=O,O=M,M=c);var S=ev(d,M),v=ev(d,O);if(S&&v&&(y.rangeCount!==1||y.anchorNode!==S.node||y.anchorOffset!==S.offset||y.focusNode!==v.node||y.focusOffset!==v.offset)){var w=$.createRange();w.setStart(S.node,S.offset),y.removeAllRanges(),M>O?(y.addRange(w),y.extend(v.node,v.offset)):(w.setEnd(v.node,v.offset),y.addRange(w))}}}}for($=[],y=d;y=y.parentNode;)y.nodeType===1&&$.push({element:y,left:y.scrollLeft,top:y.scrollTop});for(typeof d.focus=="function"&&d.focus(),d=0;d<$.length;d++){var A=$[d];A.element.scrollLeft=A.left,A.element.scrollTop=A.top}}cs=!!ip,rp=ip=null}finally{Je=s,Ke.p=r,$e.T=i}}e.current=t,zt=2}}function Wm(){if(zt===2){zt=0;var e=$n,t=Hr,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=$e.T,$e.T=null;var i=Ke.p;Ke.p=2;var r=Je;Je|=4;try{h0(e,t.alternate,t)}finally{Je=r,Ke.p=i,$e.T=a}}zt=3}}function ep(){if(zt===4||zt===3){zt=0;var e=Qo;Qo=null,B5();var t=$n,a=Hr,i=Xn,r=T0,s=(i&335544064)===i?10262:10256;if((a.subtreeFlags&s)!==0||(a.flags&s)!==0?zt=5:(zt=0,Hr=$n=null,D0(t,t.pendingLanes)),s=t.pendingLanes,s===0&&(Fi=null),vp(i),a=a.stateNode,Ga&&typeof Ga.onCommitFiberRoot=="function")try{Ga.onCommitFiberRoot(Ul,a,void 0,(a.current.flags&128)===128)}catch{}if(r!==null){a=$e.T,s=Ke.p,Ke.p=2,$e.T=null;try{for(var c=t.onRecoverableError,d=0;d<r.length;d++){var h=r[d];c(h.value,{componentStack:h.stack})}}finally{$e.T=a,Ke.p=s}}if(r=Fo,c=Jo,Jo=null,r!==null&&(Fo=null,c===null&&(c=[]),e!==null))for(h=0;h<r.length;h++)a=(0,r[h])(c),a!==void 0&&e.finished.finally(a);(Xn&3)!==0&&uu(),Fn(t),s=t.pendingLanes,(i&261930)!==0&&(s&42)!==0?t===md?xl++:(xl=0,md=t):(xl=0,md=null),Xl(0,!1)}}function D0(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Yl(t)))}function uu(){return Qo!==null&&(Qo.skipTransition(),Qo=null),Km(),Wm(),ep(),tp()}function tp(){if(zt!==5)return!1;var e=$n,t=Fm;Fm=0;var a=vp(Xn),i=$e.T,r=Ke.p;try{Ke.p=32>a?32:a,$e.T=null,a=Jm,Jm=null;var s=$n,c=Xn;if(zt=0,Hr=$n=null,Xn=0,(Je&6)!==0)throw Error(U(331));var d=Je;if(Je|=4,N0(s.current),x0(s,s.current,c,a),Je=d,Xl(0,!1),Ga&&typeof Ga.onPostCommitFiberRoot=="function")try{Ga.onPostCommitFiberRoot(Ul,s)}catch{}return!0}finally{Ke.p=r,$e.T=i,D0(e,t)}}function Uv(e,t,a){t=on(a,t),t=Om(e.stateNode,t,2),e=Xi(e,t,2),e!==null&&(Ll(e,2),Fn(e))}function ot(e,t,a){if(e.tag===3)Uv(e,e,a);else for(;t!==null;){if(t.tag===3){Uv(t,e,a);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Fi===null||!Fi.has(i))){e=on(a,e),a=Jw(2),i=Xi(t,a,2),i!==null&&(Kw(a,i,t,e),Ll(i,2),Fn(i));break}}t=t.return}}function Fh(e,t,a){var i=e.pingCache;if(i===null){i=e.pingCache=new wN;var r=new Set;i.set(t,r)}else r=i.get(t),r===void 0&&(r=new Set,i.set(t,r));r.has(a)||(tg=!0,r.add(a),e=EN.bind(null,e,t,a),t.then(e,e))}function EN(e,t,a){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,mt===e&&(Ue&a)===a&&((Ut===4||Ut===3&&(Ue&62914560)===Ue&&300>Ya()-lu)&&(Je&2)===0?is(e,0):qd|=a,as===Ue&&(as=0)),Fn(e)}function _0(e,t){t===0&&(t=Ty()),e=Br(e,t),e!==null&&(Ll(e,t),Fn(e))}function AN(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),_0(e,a)}function RN(e,t){var a=0;switch(e.tag){case 31:case 13:var i=e.stateNode,r=e.memoizedState;r!==null&&(a=r.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(U(314))}i!==null&&i.delete(t),_0(e,a)}function MN(e,t){return fp(e,t)}var rs=null,Ao=null,ap=!1,Yd=!1,Jh=!1,ji=0;function Fn(e){e!==Ao&&e.next===null&&(Ao===null?rs=Ao=e:Ao=Ao.next=e),Yd=!0,ap||(ap=!0,VN())}function Xl(e,t){if(!Jh&&Yd){Jh=!0;do for(var a=!1,i=rs;i!==null;){if(!t)if(e!==0){var r=i.pendingLanes;if(r===0)var s=0;else{var c=i.suspendedLanes,d=i.pingedLanes;s=(1<<31-Pa(42|e)+1)-1,s&=r&~(c&~d),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,qv(i,s))}else s=Ue,s=Zd(i,i===mt?s:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(s&3)===0||ql(i,s)||(a=!0,qv(i,s));i=i.next}while(a);Jh=!1}}function zN(){H0()}function H0(){Yd=ap=!1;var e=0;ji!==0&&BN()&&(e=ji);for(var t=Ya(),a=null,i=rs;i!==null;){var r=i.next,s=U0(i,t);s===0?(i.next=null,a===null?rs=r:a.next=r,r===null&&(Ao=a)):(a=i,(e!==0||(s&3)!==0)&&(Yd=!0)),i=r}zt!==0&&zt!==5||Xl(e,!1),ji!==0&&(ji=0)}function U0(e,t){for(var a=e.suspendedLanes,i=e.pingedLanes,r=e.expirationTimes,s=e.pendingLanes&-62914561;0<s;){var c=31-Pa(s),d=1<<c,h=r[c];h===-1?((d&a)===0||(d&i)!==0)&&(r[c]=F5(d,t)):h<=t&&(e.expiredLanes|=d),s&=~d}if(t=mt,a=Ue,a=Zd(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,a===0||e===t&&(it===2||it===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&Ah(i),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||ql(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(i!==null&&Ah(i),vp(a)){case 2:case 8:a=Ny;break;case 32:a=$d;break;case 268435456:a=ky;break;default:a=$d}return i=q0.bind(null,e),a=fp(a,i),e.callbackPriority=t,e.callbackNode=a,t}return i!==null&&i!==null&&Ah(i),e.callbackPriority=2,e.callbackNode=null,2}function q0(e,t){if(zt!==0&&zt!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(uu()&&e.callbackNode!==a)return null;var i=Ue;return i=Zd(e,e===mt?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(A0(e,i,t),U0(e,Ya()),e.callbackNode!=null&&e.callbackNode===a?q0.bind(null,e):null)}function qv(e,t){if(uu())return null;A0(e,t,!0)}function VN(){YN(function(){(Je&6)!==0?fp(Sy,zN):H0()})}function ng(){if(ji===0){var e=Or;e===0&&(e=Oc,Oc<<=1,(Oc&261888)===0&&(Oc=256)),ji=e}return ji}function Lv(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:td(e)}function ON(e,t,a,i,r){if(t==="submit"&&a&&a.stateNode===r){var s=Lv((r[_a]||null).action),c=i.submitter;c&&(t=(t=c[_a]||null)?Lv(t.formAction):c.getAttribute("formAction"),t!==null&&(s=t,c=null));var d=new Fd("action","action",null,i,r);e.push({event:d,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(ji!==0){var h=new FormData(r,c);zm(a,{pending:!0,data:h,method:r.method,action:s},null,h)}}else typeof s=="function"&&(d.preventDefault(),h=new FormData(r,c),zm(a,{pending:!0,data:h,method:r.method,action:s},s,h))},currentTarget:r}]})}}for(Qc=0;Qc<xm.length;Qc++)Fc=xm[Qc],Bv=Fc.toLowerCase(),jv=Fc[0].toUpperCase()+Fc.slice(1),Sn(Bv,"on"+jv);var Fc,Bv,jv,Qc;Sn(Ky,"onAnimationEnd");Sn(Wy,"onAnimationIteration");Sn(ew,"onAnimationStart");Sn("dblclick","onDoubleClick");Sn("focusin","onFocus");Sn("focusout","onBlur");Sn(GS,"onTransitionRun");Sn(PS,"onTransitionStart");Sn(XS,"onTransitionCancel");Sn(tw,"onTransitionEnd");Wo("onMouseEnter",["mouseout","mouseover"]);Wo("onMouseLeave",["mouseout","mouseover"]);Wo("onPointerEnter",["pointerout","pointerover"]);Wo("onPointerLeave",["pointerout","pointerover"]);qr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));qr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));qr("onBeforeInput",["compositionend","keypress","textInput","paste"]);qr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));qr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));qr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ml="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),IN=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ml));function L0(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var i=e[a],r=i.event;i=i.listeners;e:{var s=void 0;if(t)for(var c=i.length-1;0<=c;c--){var d=i[c],h=d.instance,p=d.currentTarget;if(d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=p;try{s(r)}catch(b){Nd(b)}r.currentTarget=null,s=h}else for(c=0;c<i.length;c++){if(d=i[c],h=d.instance,p=d.currentTarget,d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=p;try{s(r)}catch(b){Nd(b)}r.currentTarget=null,s=h}}}}function De(e,t){var a=t[_b];a===void 0&&(a=t[_b]=new Set);var i=e+"__bubble";a.has(i)||(B0(t,e,2,!1),a.add(i))}function Kh(e,t,a){var i=0;t&&(i|=4),B0(a,e,i,t)}var Jc="_reactListening"+Math.random().toString(36).slice(2);function ig(e){if(!e[Jc]){e[Jc]=!0,Vy.forEach(function(a){a!=="selectionchange"&&(IN.has(a)||Kh(a,!1,e),Kh(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Jc]||(t[Jc]=!0,Kh("selectionchange",!1,t))}}function B0(e,t,a,i){switch(h1(t)){case 2:var r=Tk;break;case 8:r=Ek;break;default:r=ug}a=r.bind(null,t,a,e),r=void 0,!bm||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),i?r!==void 0?e.addEventListener(t,a,{capture:!0,passive:r}):e.addEventListener(t,a,!0):r!==void 0?e.addEventListener(t,a,{passive:r}):e.addEventListener(t,a,!1)}function Wh(e,t,a,i,r){var s=i;if((t&1)===0&&(t&2)===0&&i!==null)e:for(;;){if(i===null)return;var c=i.tag;if(c===3||c===4){var d=i.stateNode.containerInfo;if(d===r)break;if(c===4)for(c=i.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===r)return;c=c.return}for(;d!==null;){if(c=Nr(d),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){i=s=c;continue e}d=d.parentNode}}i=i.return}Ly(function(){var p=s,b=wp(a),$=[];e:{var f=aw.get(e);if(f!==void 0){var y=Fd,V=e;switch(e){case"keypress":if(nd(a)===0)break e;case"keydown":case"keyup":y=xS;break;case"focusin":V="focus",y=Ih;break;case"focusout":V="blur",y=Ih;break;case"beforeblur":case"afterblur":y=Ih;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":y=Gb;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":y=cS;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":y=CS;break;case Ky:case Wy:case ew:y=hS;break;case tw:y=ES;break;case"scroll":case"scrollend":y=sS;break;case"wheel":y=RS;break;case"copy":case"cut":case"paste":y=pS;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":y=Xb;break;case"submit":y=NS;break;case"toggle":case"beforetoggle":y=zS}var M=(t&4)!==0,O=!M&&(e==="scroll"||e==="scrollend"),S=M?f!==null?f+"Capture":null:f;M=[];for(var v=p,w;v!==null;){var A=v;if(w=A.stateNode,A=A.tag,A!==5&&A!==26&&A!==27||w===null||S===null||(A=Sl(v,S),A!=null&&M.push(zl(v,A,w))),O)break;v=v.return}0<M.length&&(f=new y(f,V,null,a,b),$.push({event:f,listeners:M}))}}if((t&7)===0){e:{if(y=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",y&&a!==fm&&(V=a.relatedTarget||a.fromElement)&&(Nr(V)||V[us]))break e;(f||y)&&(V=b.window===b?b:(y=b.ownerDocument)?y.defaultView||y.parentWindow:window,f?(y=a.relatedTarget||a.toElement,f=p,y=y?Nr(y):null,y!==null&&(O=Hl(y),M=y.tag,y!==O||M!==5&&M!==27&&M!==6)&&(y=null)):(f=null,y=p),f!==y&&(M=Gb,A="onMouseLeave",S="onMouseEnter",v="mouse",(e==="pointerout"||e==="pointerover")&&(M=Xb,A="onPointerLeave",S="onPointerEnter",v="pointer"),O=f==null?V:ol(f),w=y==null?V:ol(y),V=new M(A,v+"leave",f,a,b),V.target=O,V.relatedTarget=w,A=null,Nr(b)===p&&(M=new M(S,v+"enter",y,a,b),M.target=w,M.relatedTarget=O,A=M),O=A,M=f&&y?im(f,y,DN):null,f!==null&&Yv($,V,f,M,!1),y!==null&&O!==null&&Yv($,O,y,M,!0)))}e:{if(f=p?ol(p):window,y=f.nodeName&&f.nodeName.toLowerCase(),y==="select"||y==="input"&&f.type==="file")var _=Jb;else if(Fb(f))if(Xy)_=BS;else{_=qS;var Z=US}else y=f.nodeName,!y||y.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?p&&yp(p.elementType)&&(_=Jb):_=LS;if(_&&(_=_(e,p))){Py($,_,a,b);break e}Z&&Z(e,f,p)}switch(Z=p?ol(p):window,e){case"focusin":(Fb(Z)||Z.contentEditable==="true")&&(Io=Z,ym=p,ul=null);break;case"focusout":ul=ym=Io=null;break;case"mousedown":wm=!0;break;case"contextmenu":case"mouseup":case"dragend":wm=!1,tv($,a,b);break;case"selectionchange":if(YS)break;case"keydown":case"keyup":tv($,a,b)}var ee;if(Sp)e:{switch(e){case"compositionstart":var Q="onCompositionStart";break e;case"compositionend":Q="onCompositionEnd";break e;case"compositionupdate":Q="onCompositionUpdate";break e}Q=void 0}else Oo?Yy(e,a)&&(Q="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(Q="onCompositionStart");Q&&(jy&&a.locale!=="ko"&&(Oo||Q!=="onCompositionStart"?Q==="onCompositionEnd"&&Oo&&(ee=By()):(Ui=b,xp="value"in Ui?Ui.value:Ui.textContent,Oo=!0)),Z=Gd(p,Q),0<Z.length&&(Q=new Pb(Q,e,null,a,b),$.push({event:Q,listeners:Z}),ee?Q.data=ee:(ee=Gy(a),ee!==null&&(Q.data=ee)))),(ee=OS?IS(e,a):DS(e,a))&&(Q=Gd(p,"onBeforeInput"),0<Q.length&&(Z=new Pb("onBeforeInput","beforeinput",null,a,b),$.push({event:Z,listeners:Q}),Z.data=ee)),ON($,e,p,a,b)}L0($,t)})}function zl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function Gd(e,t){for(var a=t+"Capture",i=[];e!==null;){var r=e,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=Sl(e,a),r!=null&&i.unshift(zl(e,r,s)),r=Sl(e,t),r!=null&&i.push(zl(e,r,s))),e.tag===3)return i;e=e.return}return[]}function DN(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Yv(e,t,a,i,r){for(var s=t._reactName,c=[];a!==null&&a!==i;){var d=a,h=d.alternate,p=d.stateNode;if(d=d.tag,h!==null&&h===i)break;d!==5&&d!==26&&d!==27||p===null||(h=p,r?(p=Sl(a,s),p!=null&&c.unshift(zl(a,p,h))):r||(p=Sl(a,s),p!=null&&c.push(zl(a,p,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var _N=/\r\n?/g,HN=/\u0000|\uFFFD/g;function Gv(e){return(typeof e=="string"?e:""+e).replace(_N,`
`).replace(HN,"")}function j0(e,t){return t=Gv(t),Gv(e)===t}function rt(e,t,a,i,r,s){switch(a){case"children":if(typeof i=="string")t==="body"||t==="textarea"&&i===""||es(e,i);else if(typeof i=="number"||typeof i=="bigint")t!=="body"&&es(e,""+i);else return;break;case"className":_c(e,"class",i);break;case"tabIndex":_c(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":_c(e,a,i);break;case"style":qy(e,i,s);return;case"data":if(t!=="object"){_c(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=td(i),e.setAttribute(a,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(t!=="input"&&rt(e,t,"name",r.name,r,null),rt(e,t,"formEncType",r.formEncType,r,null),rt(e,t,"formMethod",r.formMethod,r,null),rt(e,t,"formTarget",r.formTarget,r,null)):(rt(e,t,"encType",r.encType,r,null),rt(e,t,"method",r.method,r,null),rt(e,t,"target",r.target,r,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=td(i),e.setAttribute(a,i);break;case"onClick":i!=null&&(e.onclick=jn);return;case"onScroll":i!=null&&De("scroll",e);return;case"onScrollEnd":i!=null&&De("scrollend",e);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(U(61));if(a=i.__html,a!=null){if(r.children!=null)throw Error(U(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}a=td(i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":i===!0?e.setAttribute(a,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(a,i):e.removeAttribute(a);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(a):e.setAttribute(a,i);break;case"popover":De("beforetoggle",e),De("toggle",e),ed(e,"popover",i);break;case"xlinkActuate":li(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":li(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":li(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":li(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":li(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":li(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":li(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":li(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":li(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":ed(e,"is",i);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=rS.get(a)||a,ed(e,a,i);else return}Qe=!0}function np(e,t,a,i,r,s){switch(a){case"style":qy(e,i,s);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(U(61));if(a=i.__html,a!=null){if(r.children!=null)throw Error(U(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof i=="string")es(e,i);else if(typeof i=="number"||typeof i=="bigint")es(e,""+i);else return;break;case"onScroll":i!=null&&De("scroll",e);return;case"onScrollEnd":i!=null&&De("scrollend",e);return;case"onClick":i!=null&&(e.onclick=jn);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Oy.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(r=a.endsWith("Capture"),s=a.slice(2,r?a.length-7:void 0),t=e[_a]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(s,t,r),typeof i=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(s,i,r);break e}Qe=!0,a in e?e[a]=i:i===!0?e.setAttribute(a,""):ed(e,a,i)}return}Qe=!0}function ua(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":De("error",e),De("load",e);var i=!1,r=!1,s;for(s in a)if(a.hasOwnProperty(s)){var c=a[s];if(c!=null)switch(s){case"src":i=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(U(137,t));default:rt(e,t,s,c,a,null)}}r&&rt(e,t,"srcSet",a.srcSet,a,null),i&&rt(e,t,"src",a.src,a,null);return;case"input":De("invalid",e);var d=s=c=r=null,h=null,p=null;for(i in a)if(a.hasOwnProperty(i)){var b=a[i];if(b!=null)switch(i){case"name":r=b;break;case"type":c=b;break;case"checked":h=b;break;case"defaultChecked":p=b;break;case"value":s=b;break;case"defaultValue":d=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(U(137,t));break;default:rt(e,t,i,b,a,null)}}_y(e,s,d,h,p,c,r,!1);return;case"select":De("invalid",e),i=c=s=null;for(r in a)if(a.hasOwnProperty(r)&&(d=a[r],d!=null))switch(r){case"value":s=d;break;case"defaultValue":c=d;break;case"multiple":i=d;default:rt(e,t,r,d,a,null)}t=s,a=c,e.multiple=!!i,t!=null?jo(e,!!i,t,!1):a!=null&&jo(e,!!i,a,!0);return;case"textarea":De("invalid",e),s=r=i=null;for(c in a)if(a.hasOwnProperty(c)&&(d=a[c],d!=null))switch(c){case"value":i=d;break;case"defaultValue":r=d;break;case"children":s=d;break;case"dangerouslySetInnerHTML":if(d!=null)throw Error(U(91));break;default:rt(e,t,c,d,a,null)}Uy(e,i,r,s);return;case"option":for(h in a)a.hasOwnProperty(h)&&(i=a[h],i!=null)&&(h==="selected"?e.selected=i&&typeof i!="function"&&typeof i!="symbol":rt(e,t,h,i,a,null));return;case"dialog":De("beforetoggle",e),De("toggle",e),De("cancel",e),De("close",e);break;case"iframe":case"object":De("load",e);break;case"video":case"audio":for(i=0;i<Ml.length;i++)De(Ml[i],e);break;case"image":De("error",e),De("load",e);break;case"details":De("toggle",e);break;case"embed":case"source":case"link":De("error",e),De("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(p in a)if(a.hasOwnProperty(p)&&(i=a[p],i!=null))switch(p){case"children":case"dangerouslySetInnerHTML":throw Error(U(137,t));default:rt(e,t,p,i,a,null)}return;default:if(yp(t)){for(b in a)a.hasOwnProperty(b)&&(i=a[b],i!==void 0&&np(e,t,b,i,a,void 0));return}}for(d in a)a.hasOwnProperty(d)&&(i=a[d],i!=null&&rt(e,t,d,i,a,null))}var UN={};function qN(e,t,a,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,c=null,d=null,h=null,p=null,b=null;for(y in a){var $=a[y];if(a.hasOwnProperty(y)&&$!=null)switch(y){case"checked":break;case"value":break;case"defaultValue":h=$;default:i.hasOwnProperty(y)||rt(e,t,y,null,i,$)}}for(var f in i){var y=i[f];if($=a[f],i.hasOwnProperty(f)&&(y!=null||$!=null))switch(f){case"type":y!==$&&(Qe=!0),s=y;break;case"name":y!==$&&(Qe=!0),r=y;break;case"checked":y!==$&&(Qe=!0),p=y;break;case"defaultChecked":y!==$&&(Qe=!0),b=y;break;case"value":y!==$&&(Qe=!0),c=y;break;case"defaultValue":y!==$&&(Qe=!0),d=y;break;case"children":case"dangerouslySetInnerHTML":if(y!=null)throw Error(U(137,t));break;default:y!==$&&rt(e,t,f,y,i,$)}}gm(e,c,d,h,p,b,s,r);return;case"select":y=c=d=f=null;for(s in a)if(h=a[s],a.hasOwnProperty(s)&&h!=null)switch(s){case"value":break;case"multiple":y=h;default:i.hasOwnProperty(s)||rt(e,t,s,null,i,h)}for(r in i)if(s=i[r],h=a[r],i.hasOwnProperty(r)&&(s!=null||h!=null))switch(r){case"value":s!==h&&(Qe=!0),f=s;break;case"defaultValue":s!==h&&(Qe=!0),d=s;break;case"multiple":s!==h&&(Qe=!0),c=s;default:s!==h&&rt(e,t,r,s,i,h)}t=d,a=c,i=y,f!=null?jo(e,!!a,f,!1):!!i!=!!a&&(t!=null?jo(e,!!a,t,!0):jo(e,!!a,a?[]:"",!1));return;case"textarea":y=f=null;for(d in a)if(r=a[d],a.hasOwnProperty(d)&&r!=null&&!i.hasOwnProperty(d))switch(d){case"value":break;case"children":break;default:rt(e,t,d,null,i,r)}for(c in i)if(r=i[c],s=a[c],i.hasOwnProperty(c)&&(r!=null||s!=null))switch(c){case"value":r!==s&&(Qe=!0),f=r;break;case"defaultValue":r!==s&&(Qe=!0),y=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(U(91));break;default:r!==s&&rt(e,t,c,r,i,s)}Hy(e,f,y);return;case"option":for(var V in a)f=a[V],a.hasOwnProperty(V)&&f!=null&&!i.hasOwnProperty(V)&&(V==="selected"?e.selected=!1:rt(e,t,V,null,i,f));for(h in i)f=i[h],y=a[h],i.hasOwnProperty(h)&&f!==y&&(f!=null||y!=null)&&(h==="selected"?(f!==y&&(Qe=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):rt(e,t,h,f,i,y));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var M in a)f=a[M],a.hasOwnProperty(M)&&f!=null&&!i.hasOwnProperty(M)&&rt(e,t,M,null,i,f);for(p in i)if(f=i[p],y=a[p],i.hasOwnProperty(p)&&f!==y&&(f!=null||y!=null))switch(p){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(U(137,t));break;default:rt(e,t,p,f,i,y)}return;default:if(yp(t)){for(var O in a)f=a[O],a.hasOwnProperty(O)&&f!==void 0&&!i.hasOwnProperty(O)&&np(e,t,O,void 0,i,f);for(b in i)f=i[b],y=a[b],!i.hasOwnProperty(b)||f===y||f===void 0&&y===void 0||np(e,t,b,f,i,y);return}}for(var S in a)f=a[S],a.hasOwnProperty(S)&&f!=null&&!i.hasOwnProperty(S)&&rt(e,t,S,null,i,f);for($ in i)f=i[$],y=a[$],!i.hasOwnProperty($)||f===y||f==null&&y==null||rt(e,t,$,f,i,y)}function Pv(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function LN(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),i=0;i<a.length;i++){var r=a[i],s=r.transferSize,c=r.initiatorType,d=r.duration;if(s&&d&&Pv(c)){for(c=0,d=r.responseEnd,i+=1;i<a.length;i++){var h=a[i],p=h.startTime;if(p>d)break;var b=h.transferSize,$=h.initiatorType;b&&Pv($)&&(h=h.responseEnd,c+=b*(h<d?1:(d-p)/(h-p)))}if(--i,t+=8*(s+c)/(r.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var ip=null,rp=null;function Vl(e){return e.nodeType===9?e:e.ownerDocument}function Xv(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Y0(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function G0(e,t,a,i){return a=Vl(a).createElement(e),a[sa]=i,a[_a]=t,ua(a,e,t),na(a),a}function op(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var em=null;function BN(){var e=window.event;return e&&e.type==="popstate"?e===em?!1:(em=e,!0):(em=null,!1)}var rg=typeof setTimeout=="function"?setTimeout:void 0,jN=typeof clearTimeout=="function"?clearTimeout:void 0,Zv=typeof Promise=="function"?Promise:void 0,Qv=typeof requestAnimationFrame=="function"?requestAnimationFrame:rg,YN=typeof queueMicrotask=="function"?queueMicrotask:typeof Zv<"u"?function(e){return Zv.resolve(null).then(e).catch(GN)}:rg;function GN(e){setTimeout(function(){throw e})}function or(e){return e==="head"}function Fv(e,t){var a=t,i=0;do{var r=a.nextSibling;if(e.removeChild(a),r&&r.nodeType===8)if(a=r.data,a==="/$"||a==="/&"){if(i===0){e.removeChild(r),ds(t);return}i--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")i++;else if(a==="html")am(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,am(a);for(var s=a.firstChild;s;){var c=s.nextSibling,d=s.nodeName;s[Bl]||d==="SCRIPT"||d==="STYLE"||d==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=c}}else a==="body"&&am(e.ownerDocument.body);a=r}while(a);ds(t)}function Jv(e,t){var a=e;e=0;do{var i=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),i&&i.nodeType===8)if(a=i.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=i}while(a)}function P0(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var i=1;else for(var r=i=0;r<t.length;r++){var s=t[r];0<s.width&&0<s.height&&i++}i===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function X0(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function Z0(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function sp(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return Z0(t,a,e)}function PN(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return Z0(t,a,e)}function XN(e){return e.documentElement.clientHeight}function ZN(e){this.addEventListener("load",e),this.addEventListener("error",e)}function QN(e,t,a,i,r,s,c,d,h){var p=t.nodeType===9?t:t.ownerDocument;try{var b=p.startViewTransition({update:function(){var f=p.defaultView,y=f.navigation&&f.navigation.transition,V=p.fonts.status;i();var M=[];if(V==="loaded"&&(XN(p),p.fonts.status==="loading"&&M.push(p.fonts.ready)),V=M.length,e!==null)for(var O=e.suspenseyImages,S=0,v=0;v<O.length;v++){var w=O[v];if(!w.complete){var A=w.getBoundingClientRect();if(0<A.bottom&&0<A.right&&A.top<f.innerHeight&&A.left<f.innerWidth){if(S+=o1(w),S>fd){M.length=V;break}w=new Promise(ZN.bind(w)),M.push(w)}}}if(0<M.length)return f=Promise.race([Promise.all(M),new Promise(function(_){return setTimeout(_,500)})]).then(r,r),(y?Promise.allSettled([y.finished,f]):f).then(s,s);if(r(),y)return y.finished.then(s,s);s()},types:a});p.__reactViewTransition=b;var $=[];return b.ready.then(function(){for(var f=p.documentElement.getAnimations({subtree:!0}),y=0;y<f.length;y++){var V=f[y],M=V.effect,O=M.pseudoElement;if(O!=null&&O.startsWith("::view-transition")){$.push(V),V=M.getKeyframes();for(var S=O=void 0,v=!0,w=0;w<V.length;w++){var A=V[w],_=A.width;if(O===void 0)O=_;else if(O!==_){v=!1;break}if(_=A.height,S===void 0)S=_;else if(S!==_){v=!1;break}delete A.width,delete A.height,A.transform==="none"&&delete A.transform}v&&O!==void 0&&S!==void 0&&(M.setKeyframes(V),v=getComputedStyle(M.target,M.pseudoElement),v.width!==O||v.height!==S)&&(v=V[0],v.width=O,v.height=S,v=V[V.length-1],v.width=O,v.height=S,M.setKeyframes(V))}}c()},function(f){p.__reactViewTransition===b&&(p.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{i(),r(),c()}}),b.finished.finally(function(){for(var f=0;f<$.length;f++)$[f].cancel();p.__reactViewTransition===b&&(p.__reactViewTransition=null),d()}),b}catch{return i(),r(),c(),null}}function kr(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}kr.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:pt({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};kr.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),i=[],r=0;r<a.length;r++){var s=a[r].effect;s!==null&&s.target===e&&s.pseudoElement===t&&i.push(a[r])}return i};kr.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function Q0(e){return{name:e,group:new kr("group",e),imagePair:new kr("image-pair",e),old:new kr("old",e),new:new kr("new",e)}}function Qa(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}Qa.prototype.addEventListener=function(e,t,a){var i=null,r=null;if(!(a!=null&&typeof a!="boolean"&&(i=a.signal||null,i!==null&&i.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var s=this._eventListeners;if(F0(s,e,t,a)===-1){var c=this,d=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(d=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),i!==null&&(r=c.removeEventListener.bind(c,e,t,a),i.addEventListener("abort",r,{once:!0}),r=i.removeEventListener.bind(i,"abort",r)),i=os(a),s.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:d,cleanup:r}),Da(this._fragmentFiber.child,!1,FN,e,d,i)}this._eventListeners=s}};function FN(e,t,a,i){return Jt(e).addEventListener(t,a,i),!1}Qa.prototype.removeEventListener=function(e,t,a){var i=this._eventListeners;if(i!==null&&(t=F0(i,e,t,a),t!==-1)){var r=i[t];a=r.attachedListener;var s=r.cleanup;r=os(r.optionsOrUseCapture),Da(this._fragmentFiber.child,!1,JN,e,a,r),i.splice(t,1),s!==null&&s()}};function JN(e,t,a,i){return Jt(e).removeEventListener(t,a,i),!1}function os(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function Kv(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function F0(e,t,a,i){if(e.length===0)return-1;i=Kv(i);for(var r=0;r<e.length;r++){var s=e[r];if(s.type===t&&s.listener===a&&Kv(s.optionsOrUseCapture)===i)return r}return-1}Qa.prototype.dispatchEvent=function(e){var t=Ur(this._fragmentFiber);if(t===null)return!0;t=Jt(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var i=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var r=0;r<a.length;r++){var s=a[r];i.addEventListener(s.type,s.attachedListener,os(s.optionsOrUseCapture))}if(t.appendChild(i),e=i.dispatchEvent(e),a)for(r=0;r<a.length;r++)s=a[r],i.removeEventListener(s.type,s.attachedListener,os(s.optionsOrUseCapture));return t.removeChild(i),e}return t.dispatchEvent(e)};Qa.prototype.focus=function(e){Da(this._fragmentFiber.child,!0,J0,e,void 0,void 0)};function J0(e,t){return e.tag===6?!1:(e=Jt(e),ck(e,t))}Qa.prototype.focusLast=function(e){var t=[];Da(this._fragmentFiber.child,!0,og,t,void 0,void 0);for(var a=t.length-1;0<=a&&!J0(t[a],e);a--);};function og(e,t){return t.push(e),!1}Qa.prototype.blur=function(){var e=Ur(this._fragmentFiber);e!==null&&(e=Jt(e),e=Vl(e).activeElement,e!==null&&Da(this._fragmentFiber.child,!1,KN,e,void 0,void 0))};function KN(e,t){return e.tag===6?!1:(e=Jt(e),e===t||e.contains(t)?(t.blur(),!0):!1)}Qa.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Da(this._fragmentFiber.child,!1,WN,e,void 0,void 0)};function WN(e,t){return e.tag===6||(e=Jt(e),t.observe(e)),!1}Qa.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Da(this._fragmentFiber.child,!1,ek,e,void 0,void 0);for(var a=t=0;a<xn.length;a++){var i=xn[a];i.fragmentInstance===this&&i.observer===e?e.unobserve(i.instance):xn[t++]=i}xn.length=t}};function ek(e,t){return e.tag===6||(e=Jt(e),t.unobserve(e)),!1}var xn=[],tm=!1;function tk(e,t,a){xn.push({fragmentInstance:e,observer:t,instance:a}),tm||(tm=!0,dk(function(){tm=!1;var i=xn;xn=[];for(var r=0;r<i.length;r++){var s=i[r];s.observer.unobserve(s.instance)}}))}Qa.prototype.getClientRects=function(){var e=[];return Da(this._fragmentFiber.child,!1,ak,e,void 0,void 0),e};function ak(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=Jt(e),t.push.apply(t,e.getClientRects());return!1}Qa.prototype.getRootNode=function(e){var t=Ur(this._fragmentFiber);return t===null?this:Jt(t).getRootNode(e)};Qa.prototype.compareDocumentPosition=function(e){var t=Ur(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Da(this._fragmentFiber.child,!1,og,a,void 0,void 0);var i=Jt(t);if(a.length===0){if(a=i,Mb(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var r=i=a.compareDocumentPosition(e);return a===e?r=Node.DOCUMENT_POSITION_CONTAINS:i&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=yy(t)[1],a===null?r=Node.DOCUMENT_POSITION_PRECEDING:(e=Jt(a).compareDocumentPosition(e),r=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),r|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=Jt(a[0]),r=Jt(a[a.length-1]);var s=Mb(this._fragmentFiber)?t.parentElement:i;if(s==null)return Node.DOCUMENT_POSITION_DISCONNECTED;i=s.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,s=s.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),d=r.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||d&Node.DOCUMENT_POSITION_CONTAINED_BY;return d=i&&s&&c&Node.DOCUMENT_POSITION_FOLLOWING&&d&Node.DOCUMENT_POSITION_PRECEDING,t=i&&t===e||s&&r===e||h||d?Node.DOCUMENT_POSITION_CONTAINED_BY:!i&&t===e||!s&&r===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||nk(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function nk(e,t,a,i,r){var s=Nr(r);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!s)e:{for(;s!==null;){if(s.tag===7&&(s===t||s.alternate===t)){a=!0;break e}s=s.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(s===null)return s=r.ownerDocument,r===s||r===s.documentElement||r===s.body;e:{for(s=t,t=Ur(t);s!==null;){if(!(s.tag!==5&&s.tag!==3&&s.tag!==27||s!==t&&s.alternate!==t)){s=!0;break e}s=s.return}s=!1}return s}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!s)&&!(t=s===a)&&(t=im(a,s,zb),t===null?t=!1:(Da(t,!0,V5,s,a),s=Ro,Ro=null,t=s!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!s)&&!(t=s===i)&&(t=im(i,s,zb),t===null?t=!1:(Da(t,!0,O5,s,i),s=Ro,nm=Ro=null,t=s!==null)),t):!1}function Wv(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}Qa.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(U(566));var t=[];Da(this._fragmentFiber.child,!1,og,t,void 0,void 0);var a=e!==!1;if(t.length===0){var i=yy(this._fragmentFiber);if(i=a?i[1]||i[0]||Ur(this._fragmentFiber):i[0]||i[1],i===null)return;if(i.tag===6){e=Jt(i),Wv(e,a);return}if(i=Jt(i),i.nodeType!==9){if(i.nodeType===11){a="host"in i?i.host:null,a!==null&&a.scrollIntoView(e);return}i.scrollIntoView(e)}}for(i=a?t.length-1:0;i!==(a?-1:t.length);){var r=t[i];r.tag===6?(r=Jt(r),Wv(r,a)):Jt(r).scrollIntoView(e),i+=a?-1:1}};function ik(e,t){return e=Jt(e),K0(e,t),!1}function K0(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function W0(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i];e.addEventListener(r.type,r.attachedListener,os(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){for(var c=0,d=0;d<xn.length;d++){var h=xn[d];(h.fragmentInstance!==t||h.observer!==s||h.instance!==e)&&(xn[c++]=h)}xn.length=c,s.observe(e)}),K0(e,t))}function rk(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i];e.removeEventListener(r.type,r.attachedListener,os(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){typeof s.rootMargin=="string"?tk(t,s,e):s.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function lp(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":lp(a),Qd(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function ok(e,t,a,i){for(;e.nodeType===1;){var r=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[Bl])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(s=e.getAttribute("rel"),s==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(s!==r.rel||e.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||e.getAttribute("title")!==(r.title==null?null:r.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(s=e.getAttribute("src"),(s!==(r.src==null?null:r.src)||e.getAttribute("type")!==(r.type==null?null:r.type)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&e.getAttribute("name")===s)return e}else return e;if(e=ln(e.nextSibling),e===null)break}return null}function sk(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=ln(e.nextSibling),e===null))return null;return e}function e1(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=ln(e.nextSibling),e===null))return null;return e}function cp(e){return e.data==="$?"||e.data==="$~"}function sg(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function lk(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var i=function(){t(),a.removeEventListener("DOMContentLoaded",i)};a.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function ln(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var dp=null;function ey(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return ln(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function ty(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function ck(e,t){function a(){i=!0}if(e.ownerDocument.activeElement===e)return!0;var i=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return i}function dk(e){Qv(function(){Qv(function(t){return e(t)})})}function t1(e,t,a){switch(t=Vl(a),e){case"html":if(e=t.documentElement,!e)throw Error(U(452));return e;case"head":if(e=t.head,!e)throw Error(U(453));return e;case"body":if(e=t.body,!e)throw Error(U(454));return e;default:throw Error(U(451))}}function a1(e,t,a){for(var i in a){var r=a[i];a.hasOwnProperty(i)&&r!=null&&rt(e,t,i,null,UN,r)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===jn&&(e.onclick=null),Qd(e)}function am(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Qd(e)}var cn=new Map,ay=new Set;function Ol(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var $i=Ke.d;Ke.d={f:uk,r:hk,D:mk,C:pk,L:gk,m:fk,X:vk,S:bk,M:yk};function uk(){var e=$i.f(),t=cu();return e||t}function hk(e){var t=hs(e);t!==null&&t.tag===5&&t.type==="form"?qw(t):$i.r(e)}var fs=typeof document>"u"?null:document;function n1(e,t,a){var i=fs;if(i&&typeof t=="string"&&t){var r=rn(t);r='link[rel="'+e+'"][href="'+r+'"]',typeof a=="string"&&(r+='[crossorigin="'+a+'"]'),ay.has(r)||(ay.add(r),e={rel:e,crossOrigin:a,href:t},i.querySelector(r)===null&&(t=i.createElement("link"),ua(t,"link",e),na(t),i.head.appendChild(t)))}}function mk(e){$i.D(e),n1("dns-prefetch",e,null)}function pk(e,t){$i.C(e,t),n1("preconnect",e,t)}function gk(e,t,a){$i.L(e,t,a);var i=fs;if(i&&e&&t){var r='link[rel="preload"][as="'+rn(t)+'"]';t==="image"&&a&&a.imageSrcSet?(r+='[imagesrcset="'+rn(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(r+='[imagesizes="'+rn(a.imageSizes)+'"]')):r+='[href="'+rn(e)+'"]';var s=r;switch(t){case"style":s=ss(e);break;case"script":s=bs(e)}if(!(cn.has(s)||(e=pt({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),cn.set(s,e),i.querySelector(r)!==null||t==="style"&&i.querySelector(Zl(s))||t==="script"&&i.querySelector(Ql(s))))){var c=i.createElement("link");ua(c,"link",e),t==="style"&&(c[Sd]=!0,c.onload=c.onerror=function(){zy(c)}),na(c),i.head.appendChild(c)}}}function fk(e,t){$i.m(e,t);var a=fs;if(a&&e){var i=t&&typeof t.as=="string"?t.as:"script",r='link[rel="modulepreload"][as="'+rn(i)+'"][href="'+rn(e)+'"]',s=r;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=bs(e)}if(!cn.has(s)&&(e=pt({rel:"modulepreload",href:e},t),cn.set(s,e),a.querySelector(r)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Ql(s)))return}i=a.createElement("link"),ua(i,"link",e),na(i),a.head.appendChild(i)}}}function bk(e,t,a){$i.S(e,t,a);var i=fs;if(i&&e){var r=Bo(i).hoistableStyles,s=ss(e);t=t||"default";var c=r.get(s);if(!c){var d={loading:0,preload:null};if(c=i.querySelector(Zl(s)))d.loading=5;else{e=pt({rel:"stylesheet",href:e,"data-precedence":t},a),(a=cn.get(s))&&lg(e,a);var h=c=i.createElement("link");na(h),ua(h,"link",e),h._p=new Promise(function(p,b){h.onload=p,h.onerror=b}),h.addEventListener("load",function(){d.loading|=1}),h.addEventListener("error",function(){d.loading|=2}),d.loading|=4,pd(c,t,i)}c={type:"stylesheet",instance:c,count:1,state:d},r.set(s,c)}}}function vk(e,t){$i.X(e,t);var a=fs;if(a&&e){var i=Bo(a).hoistableScripts,r=bs(e),s=i.get(r);s||(s=a.querySelector(Ql(r)),s||(e=pt({src:e,async:!0},t),(t=cn.get(r))&&cg(e,t),s=a.createElement("script"),na(s),ua(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function yk(e,t){$i.M(e,t);var a=fs;if(a&&e){var i=Bo(a).hoistableScripts,r=bs(e),s=i.get(r);s||(s=a.querySelector(Ql(r)),s||(e=pt({src:e,async:!0,type:"module"},t),(t=cn.get(r))&&cg(e,t),s=a.createElement("script"),na(s),ua(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function ny(e,t,a,i){var r=(r=Yi.current)?Ol(r):null;if(!r)throw Error(U(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=ss(a.href),t=Bo(r).hoistableStyles,i=t.get(a),i||(i={type:"style",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=ss(a.href);var s=Bo(r).hoistableStyles,c=s.get(e);if(c||(r=r.ownerDocument||r,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(e,c),(s=r.querySelector(Zl(e)))?s._p||(c.instance=s,c.state.loading=5):(s=cn.get(e),s||(s={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},cn.set(e,s)),wk(r,e,s,c.state))),t&&i===null)throw Error(U(528,""));return c}if(t&&i!==null)throw Error(U(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=bs(a),t=Bo(r).hoistableScripts,i=t.get(a),i||(i={type:"script",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(U(444,e))}}function ss(e){return'href="'+rn(e)+'"'}function Zl(e){return'link[rel="stylesheet"]['+e+"]"}function i1(e){return pt({},e,{"data-precedence":e.precedence,precedence:null})}function wk(e,t,a,i){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Sd]!==!0){i.loading=1;return}}else t=e.createElement("link"),t[Sd]=!0,t.onload=t.onerror=zy.bind(null,t),ua(t,"link",a),na(t),e.head.appendChild(t);i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2})}function bs(e){return'[src="'+rn(e)+'"]'}function Ql(e){return"script[async]"+e}function iy(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+rn(a.href)+'"]');if(i)return t.instance=i,na(i),i;var r=pt({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),na(i),ua(i,"style",r),pd(i,a.precedence,e),t.instance=i;case"stylesheet":r=ss(a.href);var s=e.querySelector(Zl(r));if(s)return t.state.loading|=4,t.instance=s,na(s),s;i=i1(a),(r=cn.get(r))&&lg(i,r),s=(e.ownerDocument||e).createElement("link"),na(s);var c=s;return c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),ua(s,"link",i),t.state.loading|=4,pd(s,a.precedence,e),t.instance=s;case"script":return s=bs(a.src),(r=e.querySelector(Ql(s)))?(t.instance=r,na(r),r):(i=a,(r=cn.get(s))&&(i=pt({},a),cg(i,r)),e=e.ownerDocument||e,r=e.createElement("script"),na(r),ua(r,"link",i),e.head.appendChild(r),t.instance=r);case"void":return null;default:throw Error(U(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,pd(i,a.precedence,e));return t.instance}function pd(e,t,a){for(var i=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=i.length?i[i.length-1]:null,s=r,c=0;c<i.length;c++){var d=i[c];if(d.dataset.precedence===t)s=d;else if(s!==r)break}s?s.parentNode.insertBefore(e,s.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function lg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function cg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var gd=null;function ry(e,t,a){if(gd===null){var i=new Map,r=gd=new Map;r.set(a,i)}else r=gd,i=r.get(a),i||(i=new Map,r.set(a,i));if(i.has(e))return i;for(i.set(e,null),a=a.getElementsByTagName(e),r=0;r<a.length;r++){var s=a[r];if(!(s[Bl]||s[sa]||e==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var c=s.getAttribute(t)||"";c=e+c;var d=i.get(c);d?d.push(s):i.set(c,[s])}}return i}function up(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function xk(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function oy(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function r1(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function o1(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function sy(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=o1(t),e.suspenseyImages.push(t)),e=Nk.bind(e),t.decode().then(e,e))}function $k(e,t,a,i){if(a.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var r=ss(i.href),s=t.querySelector(Zl(r));if(s){t=s._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Il.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=s,na(s);return}s=t.ownerDocument||t,i=i1(i),(r=cn.get(r))&&lg(i,r),s=s.createElement("link"),na(s);var c=s;c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),ua(s,"link",i),a.instance=s}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Il.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var fd=0;function Sk(e,t){return e.stylesheets&&e.count===0&&bd(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var i=setTimeout(function(){if(e.stylesheets&&bd(e,e.stylesheets),e.unsuspend){var s=e.unsuspend;e.unsuspend=null,s()}},6e4+t);0<e.imgBytes&&fd===0&&(fd=62500*LN());var r=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&bd(e,e.stylesheets),e.unsuspend)){var s=e.unsuspend;e.unsuspend=null,s()}},(e.imgBytes>fd?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(r)}}:null}function s1(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)bd(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Il(){this.count--,s1(this)}function Nk(){this.imgCount--,s1(this)}var Pd=null;function bd(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Pd=new Map,t.forEach(kk,e),Pd=null,Il.call(e))}function kk(e,t){if(!(t.state.loading&4)){var a=Pd.get(e);if(a)var i=a.get(null);else{a=new Map,Pd.set(e,a);for(var r=e.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var c=r[s];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),i=c)}i&&a.set(null,i)}r=t.instance,c=r.getAttribute("data-precedence"),s=a.get(c)||i,s===i&&a.set(null,r),a.set(c,r),this.count++,i=Il.bind(this),r.addEventListener("load",i),r.addEventListener("error",i),s?s.parentNode.insertBefore(r,s.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(r,e.firstChild)),t.state.loading|=4}}var ls={$$typeof:Bn,Provider:null,Consumer:null,_currentValue:Cr,_currentValue2:Cr,_threadCount:0};function Ck(e,t,a,i,r,s,c,d,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Rh(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Rh(0),this.hiddenUpdates=Rh(null),this.identifierPrefix=i,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function l1(e,t,a,i,r,s,c,d,h,p,b,$){return e=new Ck(e,t,a,c,h,p,b,$,d),t=1,s===!0&&(t|=24),s=Oa(3,null,null,t),e.current=s,s.stateNode=e,t=Ap(),t.refCount++,e.pooledCache=t,t.refCount++,s.memoizedState={element:i,isDehydrated:a,cache:t},zp(s),e}function c1(e){return e?(e=Ho,e):Ho}function d1(e,t,a,i,r,s){r=c1(r),i.context===null?i.context=r:i.pendingContext=r,i=Pi(t),i.payload={element:a},s=s===void 0?null:s,s!==null&&(i.callback=s),a=Xi(e,i,t),a!==null&&(Ia(a,e,t),ml(a,e,t))}function ly(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function dg(e,t){ly(e,t),(e=e.alternate)&&ly(e,t)}function u1(e){if(e.tag===13||e.tag===31){var t=Br(e,67108864);t!==null&&Ia(t,e,67108864),dg(e,67108864)}}function cy(e){if(e.tag===13||e.tag===31){var t=Xa();t=bp(t);var a=Br(e,t);a!==null&&Ia(a,e,t),dg(e,t)}}var cs=!0;function Tk(e,t,a,i){var r=$e.T;$e.T=null;var s=Ke.p;try{Ke.p=2,ug(e,t,a,i)}finally{Ke.p=s,$e.T=r}}function Ek(e,t,a,i){var r=$e.T;$e.T=null;var s=Ke.p;try{Ke.p=8,ug(e,t,a,i)}finally{Ke.p=s,$e.T=r}}function ug(e,t,a,i){if(cs){var r=hp(i);if(r===null)Wh(e,t,i,Xd,a),dy(e,i);else if(Rk(r,e,t,a,i))i.stopPropagation();else if(dy(e,i),t&4&&-1<Ak.indexOf(e)){for(;r!==null;){var s=hs(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var c=xr(s.pendingLanes);if(c!==0){var d=s;for(d.pendingLanes|=2,d.entangledLanes|=2;c;){var h=1<<31-Pa(c);d.entanglements[1]|=h,c&=~h}Fn(s),(Je&6)===0&&(Ld=Ya()+500,Xl(0,!1))}}break;case 31:case 13:d=Br(s,2),d!==null&&Ia(d,s,2),cu(),dg(s,2)}if(s=hp(i),s===null&&Wh(e,t,i,Xd,a),s===r)break;r=s}r!==null&&i.stopPropagation()}else Wh(e,t,i,null,a)}}function hp(e){return e=wp(e),hg(e)}var Xd=null;function hg(e){if(Xd=null,e=Nr(e),e!==null){var t=Hl(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=fy(t),e!==null)return e;e=null}else if(a===31){if(e=by(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return Xd=e,null}function h1(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(j5()){case Sy:return 2;case Ny:return 8;case $d:case Y5:return 32;case ky:return 268435456;default:return 32}default:return 32}}var mp=!1,Ji=null,Ki=null,Wi=null,Dl=new Map,_l=new Map,_i=[],Ak="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function dy(e,t){switch(e){case"focusin":case"focusout":Ji=null;break;case"dragenter":case"dragleave":Ki=null;break;case"mouseover":case"mouseout":Wi=null;break;case"pointerover":case"pointerout":Dl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":_l.delete(t.pointerId)}}function al(e,t,a,i,r,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:a,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},t!==null&&(t=hs(t),t!==null&&u1(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),e)}function Rk(e,t,a,i,r){switch(t){case"focusin":return Ji=al(Ji,e,t,a,i,r),!0;case"dragenter":return Ki=al(Ki,e,t,a,i,r),!0;case"mouseover":return Wi=al(Wi,e,t,a,i,r),!0;case"pointerover":var s=r.pointerId;return Dl.set(s,al(Dl.get(s)||null,e,t,a,i,r)),!0;case"gotpointercapture":return s=r.pointerId,_l.set(s,al(_l.get(s)||null,e,t,a,i,r)),!0}return!1}function m1(e){var t=Nr(e.target);if(t!==null){var a=Hl(t);if(a!==null){if(t=a.tag,t===13){if(t=fy(a),t!==null){e.blockedOn=t,Db(e.priority,function(){cy(a)});return}}else if(t===31){if(t=by(a),t!==null){e.blockedOn=t,Db(e.priority,function(){cy(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function vd(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=hp(e.nativeEvent);if(a===null){a=e.nativeEvent;var i=new a.constructor(a.type,a);fm=i,a.target.dispatchEvent(i),fm=null}else return t=hs(a),t!==null&&u1(t),e.blockedOn=a,!1;t.shift()}return!0}function uy(e,t,a){vd(e)&&a.delete(t)}function Mk(){mp=!1,Ji!==null&&vd(Ji)&&(Ji=null),Ki!==null&&vd(Ki)&&(Ki=null),Wi!==null&&vd(Wi)&&(Wi=null),Dl.forEach(uy),_l.forEach(uy)}function Kc(e,t){e.blockedOn===t&&(e.blockedOn=null,mp||(mp=!0,Kt.unstable_scheduleCallback(Kt.unstable_NormalPriority,Mk)))}var Wc=null;function hy(e){Wc!==e&&(Wc=e,Kt.unstable_scheduleCallback(Kt.unstable_NormalPriority,function(){Wc===e&&(Wc=null);for(var t=0;t<e.length;t+=3){var a=e[t],i=e[t+1],r=e[t+2];if(typeof i!="function"){if(hg(i||a)===null)continue;break}var s=hs(a);s!==null&&(e.splice(t,3),t-=3,zm(s,{pending:!0,data:r,method:a.method,action:i},i,r))}}))}function ds(e){function t(h){return Kc(h,e)}Ji!==null&&Kc(Ji,e),Ki!==null&&Kc(Ki,e),Wi!==null&&Kc(Wi,e),Dl.forEach(t),_l.forEach(t);for(var a=0;a<_i.length;a++){var i=_i[a];i.blockedOn===e&&(i.blockedOn=null)}for(;0<_i.length&&(a=_i[0],a.blockedOn===null);)m1(a),a.blockedOn===null&&_i.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(i=0;i<a.length;i+=3){var r=a[i],s=a[i+1],c=r[_a]||null;if(typeof s=="function")c||hy(a);else if(c){var d=null;if(s&&s.hasAttribute("formAction")){if(r=s,c=s[_a]||null)d=c.formAction;else if(hg(r)!==null)continue}else d=c.action;typeof d=="function"?a[i+1]=d:(a.splice(i,3),i-=3),hy(a)}}}function p1(){function e(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(c){return r=c})},focusReset:"manual",scroll:"manual"})}function t(){r!==null&&(r(),r=null),i||setTimeout(a,20)}function a(){if(!i&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,r=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),r!==null&&(r(),r=null)}}}function mg(e){this._internalRoot=e}hu.prototype.render=mg.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(U(409));var a=t.current,i=Xa();d1(a,i,e,t,null,null)};hu.prototype.unmount=mg.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;d1(e.current,2,null,e,null,null),cu(),t[us]=null}};function hu(e){this._internalRoot=e}hu.prototype.unstable_scheduleHydration=function(e){if(e){var t=My();e={blockedOn:null,target:e,priority:t};for(var a=0;a<_i.length&&t!==0&&t<_i[a].priority;a++);_i.splice(a,0,e),a===0&&m1(e)}};var my=py.version;if(my!=="19.3.0")throw Error(U(527,my,"19.3.0"));Ke.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(U(188)):(e=Object.keys(e).join(","),Error(U(268,e)));return e=z5(t),e=e!==null?vy(e):null,e=e===null?null:e.stateNode,e};var zk={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:$e,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(nl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!nl.isDisabled&&nl.supportsFiber))try{Ul=nl.inject(zk),Ga=nl}catch{}var nl;mu.createRoot=function(e,t){if(!gy(e))throw Error(U(299));var a=!1,i="",r=Zw,s=Qw,c=Fw;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(r=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=l1(e,1,!1,null,null,a,i,null,r,s,c,p1),e[us]=t.current,ig(e),new mg(t)};mu.hydrateRoot=function(e,t,a){if(!gy(e))throw Error(U(299));var i=!1,r="",s=Zw,c=Qw,d=Fw,h=null;return a!=null&&(a.unstable_strictMode===!0&&(i=!0),a.identifierPrefix!==void 0&&(r=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(d=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=l1(e,1,!0,t,a??null,i,r,h,s,c,d,p1),t.context=c1(null),a=t.current,i=Xa(),i=bp(i),r=Pi(i),r.callback=null,Xi(a,r,i),a=i,t.current.lanes=a,Ll(t,a),Fn(t),e[us]=t.current,ig(e),new hu(t)};mu.version="19.3.0"});var v1=On((cC,b1)=>{"use strict";function f1(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(f1)}catch(e){console.error(e)}}f1(),b1.exports=g1()});var Ai=In(wo()),J=In(br()),vr={"Painted illustration":"Painted storybook illustration, coherent brushwork, soft lighting, and a consistent color palette.",Watercolor:"Watercolor scenery with translucent washes, textured paper, soft edges, and a harmonious palette.",Cartoon:"Cartoon scenery with clean outlines, simplified shapes, expressive colors, and consistent cel shading.","Pixel art":"Pixel art scenery with crisp pixel edges, a limited consistent palette, and carefully shaded forms.",Photorealism:"Photorealistic scenery with natural materials, realistic lighting, and coherent photographic detail.",Custom:""};function mh({value:e,onChange:t}){return(0,J.jsxs)("fieldset",{className:"villages-scenery-fields",children:[(0,J.jsx)("legend",{children:"Scenery art style"}),(0,J.jsxs)("label",{children:["Style preset",(0,J.jsx)("select",{"aria-label":"Scenery style preset",value:Object.keys(vr).find(a=>vr[a]===e)??"Custom",onChange:a=>t(vr[a.target.value]),children:Object.keys(vr).map(a=>(0,J.jsx)("option",{children:a},a))})]}),(0,J.jsxs)("label",{children:["Style description",(0,J.jsx)("textarea",{"aria-label":"Scenery style description",rows:3,maxLength:600,value:e,onChange:a=>t(a.target.value)})]}),(0,J.jsx)("p",{children:"Used for future map and venue images. Existing artwork stays as it is."})]})}function Ec(){return{id:"private:player",ownerId:"player",name:"Your personal space",purpose:"Personal space",venueClass:"residence",description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}}function ph({rooms:e,onChange:t,people:a,workplace:i=!1,playerHome:r=!1}){let s=(c,d)=>t(e.map(h=>h.id===c?{...h,...d}:h));return(0,J.jsxs)("section",{className:"villages-private-fields",children:[r?(0,J.jsx)("p",{children:"Your personal space belongs to you. Other residents\u2019 personal spaces remain a surprise until you\u2019re invited."}):i?(0,J.jsx)("p",{children:"A private work area is included automatically. All current workers have access; guests need an invitation."}):(0,J.jsx)("p",{children:"Restricted rooms are optional. Choose who can invite guests and approve lasting changes."}),e.filter(c=>c.ownerId!=="player").map(c=>(0,J.jsxs)("fieldset",{children:[(0,J.jsx)("legend",{children:c.name||"Private space"}),(0,J.jsxs)("label",{children:["Room name",(0,J.jsx)("input",{maxLength:100,value:c.name??"",onChange:d=>s(c.id,{name:d.target.value})})]}),(0,J.jsxs)("label",{children:["Purpose",(0,J.jsx)("input",{maxLength:240,value:c.purpose??"",onChange:d=>s(c.id,{purpose:d.target.value})})]}),i?null:(0,J.jsxs)("fieldset",{children:[(0,J.jsx)("legend",{children:"Room controllers"}),a.map(d=>(0,J.jsxs)("label",{children:[(0,J.jsx)("input",{type:"checkbox",checked:c.controllerIds?.includes(d.id)??!1,onChange:h=>s(c.id,{controllerIds:h.target.checked?[...c.controllerIds??[],d.id]:c.controllerIds?.filter(p=>p!==d.id)})}),d.name]},d.id))]}),(0,J.jsxs)("label",{children:["Description \xB7 optional",(0,J.jsx)("textarea",{maxLength:1e3,value:c.description,onChange:d=>s(c.id,{description:d.target.value})})]}),(0,J.jsx)("p",{children:"Private details will be prepared when the venue opens. Its image is drawn on first invited entry."}),(0,J.jsx)("button",{type:"button",onClick:()=>t(e.filter(d=>d.id!==c.id)),children:"Remove this private space"})]},c.id)),(0,J.jsx)("button",{type:"button",onClick:()=>t([...e,{...Ec(),id:"restricted:"+crypto.randomUUID(),ownerId:"",name:"",purpose:"",venueClass:i?"workplace":"other",controllerIds:[]}]),children:"Add private space"})]})}function nb({venue:e,tag:t,people:a,assignedIds:i,busy:r,problem:s,onPatch:c,onDone:d,onCancel:h,onMove:p,onGenerate:b,onUpload:$,onRemove:f}){let y=e.classes?.includes("residence")??!1,V=y&&!e.occupancy.playerHome,M=V?["Resident","Name and form","Exterior","Shared interior","Private spaces"]:["Name and form","Exterior","Interior","Private spaces"],[O,S]=(0,Ai.useState)(0),[v,w]=(0,Ai.useState)(""),A=(0,Ai.useRef)(null),_=M[O],Z=e.spaces?.[0],ee=e.privateSpaces?.find(B=>B.ownerId==="player")??Ec();(0,Ai.useEffect)(()=>{A.current?.querySelector("input,textarea,select,button")?.focus()},[O]);let Q=(B,re)=>(0,J.jsxs)("section",{children:[(0,J.jsx)("p",{children:"Image \xB7 optional"}),re?(0,J.jsx)("img",{className:t+"-setup-image-preview",src:re.url,alt:B+" of "+e.name}):(0,J.jsx)("p",{children:"No image yet."}),(0,J.jsxs)("div",{className:t+"-row",children:[(0,J.jsxs)("button",{type:"button",disabled:r,onClick:()=>b(B),children:[re?"Regenerate":"Generate"," ",B," image"]}),(0,J.jsxs)("label",{children:["Upload ",B," image",(0,J.jsx)("input",{type:"file",accept:"image/*",disabled:r,onChange:ve=>{let ut=ve.target.files?.[0];ve.target.value="",ut&&$(B,ut)}})]}),re?(0,J.jsx)("button",{type:"button",disabled:r,onClick:()=>c(B==="exterior"?{...e,presentation:{...e.presentation,image:null}}:B==="private"?{...e,privateSpaces:(e.privateSpaces??[ee]).map(ve=>ve.ownerId==="player"?{...ve,image:null}:ve)}:{...e,spaces:e.spaces?.map((ve,ut)=>ut===0?{...ve,image:null}:ve)}),children:"Remove image"}):null]})]});(0,Ai.useEffect)(()=>{let B=window.visualViewport,re=()=>{let ve=A.current;!ve||!B||window.innerWidth>704||(ve.style.height=B.height+"px",ve.parentElement.style.top=B.offsetTop+"px",ve.parentElement.style.bottom="auto")};return re(),B?.addEventListener("resize",re),B?.addEventListener("scroll",re),()=>{B?.removeEventListener("resize",re),B?.removeEventListener("scroll",re)}},[]);let Te=()=>{let B=_==="Resident"&&!e.occupancy.residentCharacterId?"Choose a villager.":_==="Name and form"&&(!e.name.trim()||!e.form?.trim())?"Add a name and describe the form.":_==="Exterior"&&!e.description.trim()?"Describe the exterior.":(_==="Interior"||_==="Shared interior")&&!Z?.description.trim()?"Describe the interior.":"";if(w(B),B){A.current?.querySelector("input,textarea,select")?.focus();return}O===M.length-1?d():S(O+1)};return(0,J.jsx)("div",{className:"villages-founding-backdrop",children:(0,J.jsxs)("div",{ref:A,className:"villages-founding-dialog",role:"dialog","aria-modal":"true","aria-label":"Define "+e.name,onKeyDown:B=>{if(B.key==="Escape"&&!r&&h(),B.key==="Tab"){let re=Array.from(A.current?.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)")??[]);B.shiftKey&&B.target===re[0]?(B.preventDefault(),re.at(-1)?.focus()):!B.shiftKey&&B.target===re.at(-1)&&(B.preventDefault(),re[0]?.focus())}},children:[(0,J.jsxs)("header",{children:[(0,J.jsx)("h3",{children:e.name||"New venue"}),(0,J.jsxs)("p",{children:[_," \xB7 ",O+1," of ",M.length]})]}),(0,J.jsxs)("div",{className:"villages-founding-editor-body",children:[_==="Resident"?(0,J.jsxs)("label",{children:["Assigned villager",(0,J.jsxs)("select",{"aria-label":"Assigned villager",value:e.occupancy.residentCharacterId??"",onChange:B=>c({...e,residentIds:B.target.value?[B.target.value]:[],occupancy:{...e.occupancy,residentCharacterId:B.target.value||null}}),children:[(0,J.jsx)("option",{value:"",children:"Choose a villager"}),a.map(B=>(0,J.jsx)("option",{value:B.id,disabled:i.includes(B.id),children:B.name},B.id))]})]}):null,_==="Name and form"?(0,J.jsxs)(J.Fragment,{children:[(0,J.jsxs)("label",{children:["Name",(0,J.jsx)("input",{"aria-label":"Venue name",maxLength:100,value:e.name,onChange:B=>c({...e,name:B.target.value})})]}),(0,J.jsxs)("label",{children:["Form",(0,J.jsx)("textarea",{"aria-label":"Venue form",maxLength:240,value:e.form??"",placeholder:y?"A stone house, a tent, or a converted vehicle\u2026":"A park, communal fire pit, or gathering hall\u2026",onChange:B=>c({...e,form:B.target.value})})]})]}):null,_==="Exterior"||_==="Interior"||_==="Shared interior"?(0,J.jsxs)(J.Fragment,{children:[(0,J.jsxs)("label",{children:[_," description",(0,J.jsx)("textarea",{"aria-label":_+" description",maxLength:1e3,value:_==="Exterior"?e.description:Z?.description??"",onChange:B=>c(_==="Exterior"?{...e,description:B.target.value}:{...e,spaces:e.spaces?.map((re,ve)=>ve===0?{...re,description:B.target.value}:re)})})]}),(0,J.jsxs)("fieldset",{children:[(0,J.jsx)("legend",{children:"Image context"}),V?(0,J.jsxs)("label",{children:[(0,J.jsx)("input",{type:"checkbox",checked:e.imageContext?.useAssignedVillagerContext??!0,onChange:B=>c({...e,imageContext:{useVisualLore:e.imageContext?.useVisualLore??!0,useAssignedVillagerContext:B.target.checked}})}),"Use assigned villager\u2019s personality"]}):null,(0,J.jsxs)("label",{children:[(0,J.jsx)("input",{type:"checkbox",checked:e.imageContext?.useVisualLore??!0,onChange:B=>c({...e,imageContext:{useAssignedVillagerContext:e.imageContext?.useAssignedVillagerContext??!0,useVisualLore:B.target.checked}})}),"Use selected visual lore"]})]}),Q(_==="Exterior"?"exterior":"interior",_==="Exterior"?e.presentation.image:Z?.image)]}):null,_==="Private spaces"?(0,J.jsxs)(J.Fragment,{children:[V?(0,J.jsx)("p",{children:"This villager\u2019s personal space will be prepared from their personality, relevant lore, and this home\u2019s form. Its details stay hidden until you\u2019re invited."}):null,e.occupancy.playerHome?(0,J.jsxs)(J.Fragment,{children:[(0,J.jsxs)("label",{children:["Your personal-space description",(0,J.jsx)("textarea",{"aria-label":"Your personal-space description",maxLength:1e3,value:ee.description,onChange:B=>c({...e,privateSpaces:[...(e.privateSpaces??[]).filter(re=>re.ownerId!=="player"),{...ee,description:B.target.value}]})})]}),Q("private",ee.image)]}):null,(0,J.jsx)(ph,{rooms:e.privateSpaces??[],onChange:B=>c({...e,privateSpaces:B}),people:[{id:"player",name:"You"},...a],playerHome:e.occupancy.playerHome})]}):null,(0,J.jsxs)("div",{className:t+"-row",children:[(0,J.jsx)("button",{type:"button",disabled:r,onClick:p,children:"Move on map"}),(0,J.jsx)("button",{type:"button",disabled:r,onClick:f,children:"Remove venue"})]}),v||s?(0,J.jsx)("p",{role:"alert",className:t+"-error",children:v||s}):null,r?(0,J.jsx)("p",{role:"status",children:"Preparing image\u2026"}):null]}),(0,J.jsxs)("footer",{children:[(0,J.jsx)("button",{type:"button",disabled:r,onClick:h,children:"Cancel"}),(0,J.jsx)("button",{type:"button",disabled:r||O===0,onClick:()=>{w(""),S(O-1)},children:"Back"}),(0,J.jsx)("button",{type:"button",disabled:r,onClick:Te,children:O===M.length-1?"Done":"Continue"})]})]})})}function ib(e,t,a){let i=t*a;if(!i||e.length!==i*4)return!1;let r=e.slice(),s=Math.max(1,Math.ceil(t*.18)),c=Math.max(1,Math.ceil(a*.18)),d=Math.max(1,Math.floor(Math.sqrt(i/4e4))),h=new Map,p=0;for(let z=0;z<a;z+=d)for(let j=0;j<t;j+=d){if(j>=s&&j<t-s&&z>=c&&z<a-c)continue;let me=(z*t+j)*4;if(e[me+3]<128)continue;p++;let ye=[e[me],e[me+1],e[me+2]];if(Math.max(...ye)<180||Math.max(...ye)-Math.min(...ye)<140)continue;let te=ye.map(Ge=>Math.floor(Ge/32)).join(":"),Be=h.get(te)??{rgb:[0,0,0],count:0};for(let Ge=0;Ge<3;Ge++)Be.rgb[Ge]+=ye[Ge];Be.count++,h.set(te,Be)}let b=[...h.values()].sort((z,j)=>j.count-z.count)[0];if(!b||b.count<Math.max(4,p*.25))return!1;let $=b.rgb.map(z=>z/b.count),f=new Float32Array(i);for(let z=0;z<i;z++)f[z]=Math.hypot(r[z*4]-$[0],r[z*4+1]-$[1],r[z*4+2]-$[2]);let y=z=>f[z],V=new Set;for(let z=0;z<a;z+=d)for(let j=0;j<t;j+=d){if(j>=s&&j<t-s&&z>=c&&z<a-c)continue;let me=z*t+j;e[me*4+3]>128&&y(me)<28&&V.add((j>=t/2?1:0)+(z>=a/2?2:0))}if(V.size<3)return!1;let M=new Uint8Array(i),O=new Int32Array(i),S=0,v=0,w=t,A=-1,_=a,Z=-1;for(let z=0;z<i;z++)e[z*4+3]===0||y(z)>=28||(M[z]=1,O[v++]=z,w=Math.min(w,z%t),A=Math.max(A,z%t),_=Math.min(_,Math.floor(z/t)),Z=Math.max(Z,Math.floor(z/t)));let ee=(z,j)=>{z%t>0&&j(z-1),z%t<t-1&&j(z+1),z>=t&&j(z-t),z<i-t&&j(z+t)};for(;S<v;)ee(O[S++],z=>{M[z]||e[z*4+3]===0||y(z)>=90||(M[z]=1,O[v++]=z)});let Q=$.map((z,j)=>({value:z,index:j})).filter(({value:z})=>z>Math.max(...$)-48),Te=$.map((z,j)=>({value:z,index:j})).filter(({value:z})=>z<Math.min(...$)+48),B=new Float32Array(i),re=new Uint8Array(i);for(let z=0;z<i;z++){let j=255,me=0,ye=0;for(let{index:te}of Q)j=Math.min(j,r[z*4+te]),me=Math.max(me,r[z*4+te]);for(let{index:te}of Te)ye=Math.max(ye,r[z*4+te]);B[z]=j-ye,re[z]=j-ye>8&&me-j<48?1:0}let ve=z=>B[z],ut=new Uint8Array(i);for(let z=0;z<i;z++){if(ut[z]||M[z]||e[z*4+3]===0)continue;S=0,v=1,O[0]=z,ut[z]=1;let j=!0;for(;S<v;){let me=O[S++];j&&(j=ve(me)>8&&y(me)<180),ee(me,ye=>{ut[ye]||M[ye]||e[ye*4+3]===0||(ut[ye]=1,O[v++]=ye)})}if(v<=16&&j)for(let me=0;me<v;me++)M[O[me]]=1}let Me=Math.min(12,Math.max(6,Math.ceil(Math.min(t,a)/32))),Vt=new Uint8Array(i);S=0,v=0;for(let z=0;z<i;z++)(M[z]||e[z*4+3]===0)&&(Vt[z]=1,O[v++]=z);for(;S<v;){let z=O[S++];Vt[z]>Me*2||ee(z,j=>{Vt[j]||(Vt[j]=Vt[z]+1,O[v++]=j)})}for(let z=0;z<i;z++){if(M[z]||!Vt[z]||Vt[z]>Me+1||e[z*4+3]===0)continue;let j=z%t,me=Math.floor(z/t),ye=r[z*4]-$[0],te=r[z*4+1]-$[1],Be=r[z*4+2]-$[2],Ge,at=1,ie=1/0,ht=!!re[z],qe=ht?Me*2:Me,Ot=y(z)+8,st=ve(z)-8;e:for(let $t=Math.max(0,me-qe);$t<=Math.min(a-1,me+qe);$t++)for(let pe=Math.max(0,j-qe);pe<=Math.min(t-1,j+qe);pe++){let ge=$t*t+pe;if(M[ge]||r[ge*4+3]<=128||re[ge]&&Vt[ge]&&Vt[ge]<=Me*2||ve(ge)>=st||y(ge)<=Ot)continue;let he=r[ge*4]-$[0],lt=r[ge*4+1]-$[1],kt=r[ge*4+2]-$[2],nt=Math.max(0,Math.min(1,(he*ye+lt*te+kt*Be)/(he*he+lt*lt+kt*kt))),Lt=ye-nt*he,Ve=te-nt*lt,I=Be-nt*kt,X=Lt*Lt+Ve*Ve+I*I;if(X<ie&&(ie=X,at=nt,Ge=[r[ge*4],r[ge*4+1],r[ge*4+2]],ie<1e-6))break e}if(Ge){if(ht){let $t=Math.min(...Q.map(({index:ge})=>Ge[ge]))-Math.max(...Te.map(({index:ge})=>Ge[ge])),pe=Math.min(...Q.map(({value:ge})=>ge))-Math.max(...Te.map(({value:ge})=>ge));if(ie>64&&ve(z)<pe*.45)continue;at=Math.max(0,Math.min(1,(pe-ve(z))/(pe-$t)))}else if(ie>64||at>=.98)continue;if(e[z*4+3]=Math.round(r[z*4+3]*at),Ge)for(let $t=0;$t<3;$t++)e[z*4+$t]=Ge[$t]}}let qt=z=>z.filter(j=>M[j]).length/z.length,Qt=w<=t*.1&&A>=t*.9-1&&_<=a*.1&&Z>=a*.9-1&&qt(Array.from({length:A-w+1},(z,j)=>_*t+w+j))>.7&&qt(Array.from({length:A-w+1},(z,j)=>Z*t+w+j))>.7&&qt(Array.from({length:Z-_+1},(z,j)=>(_+j)*t+w))>.7&&qt(Array.from({length:Z-_+1},(z,j)=>(_+j)*t+A))>.7;for(let z=0;z<i;z++){let j=z%t,me=Math.floor(z/t),ye=z*4,te=[e[ye],e[ye+1],e[ye+2]];(M[z]||Qt&&(j<w||j>A||me<_||me>Z)&&(Math.max(...te)<100&&Math.max(...te)-Math.min(...te)<50||ve(z)>8))&&(e[ye+3]=0)}return!0}function rb(){let e=new Map,t=new Map,a=[],i=0,r=!1;function s(){for(;!r&&i<2&&a.length;){let c=a.shift();i++,Promise.resolve().then(c.work).then(d=>{r||(e.set(c.key,d),e.size>12&&e.delete(e.keys().next().value)),t.delete(c.key),c.resolve(d)},d=>{t.delete(c.key),c.reject(d)}).finally(()=>{i--,s()})}}return{get(c,d){if(r)return Promise.reject(new Error("Sprite Studio closed."));if(e.has(c)){let b=e.get(c);return e.delete(c),e.set(c,b),Promise.resolve(b)}let h=t.get(c);if(h)return h;let p=new Promise((b,$)=>a.push({key:c,work:d,resolve:b,reject:$}));return t.set(c,p),s(),p},dispose(){r=!0,e.clear(),t.clear();for(let c of a.splice(0))c.reject(new Error("Sprite Studio closed."))}}}var Ce=In(wo());var gh={PAPERCRAFT:"Faithfully preserve the source character\u2019s design, clothing, colors, anatomy, and identifying features. Render as a handcrafted 2D papercraft game character: simplified cartoon proportions, bold clean near-black outlines, and a distinct thin off-white paper-cut border around the entire silhouette. Construct the character from flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply a clearly visible matte handmade paper texture with fine fibers and gentle printed color variation across the entire character. Slightly imperfect physical cut edges. Clean, expressive, polished storybook character design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. The result should look like a physical illustrated paper character assembled from printed cutouts.",BATTLEHIGHWAY:"Use the reference image ONLY as a character-design reference for identity, species/anatomy, core outfit, colors, proportions, and defining features. Redraw the character strictly in the visual style of early-2000s Sonic Battle character art. Reconstruct the character from bold angular graphic shapes, not smooth modern anatomy. Use exaggerated proportions, a strong asymmetrical silhouette, and slightly hand-drawn, irregular contours. Build the design from large faceted masses, wedges, spikes, tapered limbs, and simplified shape clusters. Do not just take normal anatomy and make it slightly angular. Use thick dark outer outlines and selective thinner interior lines to divide important forms only. Group repeated details like feathers, fur, hair, folds, fingers, and accessories into a few large simplified shapes instead of many small ones. Use flat saturated colors with one large hard-edged shadow shape per major form and only occasional small highlight accents. Keep strong value separation and graphic cutout-like shading, not realistic form rendering. Include some medium-scale structural details that define the character, but remove microdetail. The final image should feel like Sonic Battle character key art: graphic, angular, simplified, lively, and highly readable, not polished modern anime art, not painterly, not vector-clean, and not realistic. No gradients, soft shading, painterly texture, glossy rendering, realistic lighting, detailed folds, excessive feather/fur/hair separation, or 3D volume.",Custom:""},ob=["neutral","happy","sad","angry","surprised","thinking"];function fh(e,t){if(!e||!/^[a-z0-9_-]{1,40}$/.test(e.label)||!["front","side"].includes(e.view))throw new Error("Choose a valid view and expression label.");if(typeof e.pose!="string"||e.pose.length>500)throw new Error("Pose instructions must be at most 500 characters.");if(![e.x,e.y,e.width,e.height].every(Number.isInteger)||e.x<0||e.y<0||e.width<1||e.height<1||e.x+e.width>t.width||e.y+e.height>t.height)throw new Error("The crop must fit inside the source image.");if(![e.scale,e.offsetX,e.offsetY].every(Number.isFinite)||e.scale<.1||e.scale>3||Math.abs(e.offsetX)>512||Math.abs(e.offsetY)>768)throw new Error("Choose a scale between 0.1 and 3 and an offset inside the sprite canvas.")}var N=In(br()),w5=1,xo=e=>e instanceof Error?e.message:"The sprite action failed.";function x5(){let e=crypto.getRandomValues(new Uint8Array(16));e[6]=e[6]&15|64,e[8]=e[8]&63|128;let t=Array.from(e,a=>a.toString(16).padStart(2,"0")).join("");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}var sb=e=>new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(String(i.result)),i.onerror=()=>a(new Error("The file could not be read.")),i.readAsDataURL(e)}),cb=e=>new Promise((t,a)=>{let i=new Image;i.onload=()=>t(i),i.onerror=()=>a(new Error("The image could not be loaded.")),i.src=e});function $5(e,t,a){let i=e.getImageData(0,0,t,a);ib(i.data,t,a)&&e.putImageData(i,0,0)}function S5(e,t,a=!1){return JSON.stringify({source:[e.url,e.source?.sha256],sheetSize:[e.width,e.height],baseScale:e.baseScale??Math.min(512/Math.max(...e.cells.map(i=>i.width)),768/Math.max(...e.cells.map(i=>i.height))),crop:[t.x,t.y,t.width,t.height],transform:[t.scale,t.offsetX,t.offsetY],canvas:[512,768],cleanup:a,cleanupVersion:a?4:0,rendererVersion:w5})}async function db(e,t,a=!1,i){if(fh(t,e),!i)return lb(e,t,a);let r=await i.get(S5(e,t,a),()=>lb(e,t,a)),s=document.createElement("canvas");return s.width=r.width,s.height=r.height,s.getContext("2d").drawImage(r,0,0),s}async function lb(e,t,a=!1){fh(t,e);let i=await cb(e.url),r=document.createElement("canvas");r.width=t.width,r.height=t.height;let s=r.getContext("2d");s.drawImage(i,t.x,t.y,t.width,t.height,0,0,t.width,t.height),a&&$5(s,r.width,r.height);let c=document.createElement("canvas");c.width=512,c.height=768;let d=c.getContext("2d"),p=(e.baseScale??Math.min(512/Math.max(...e.cells.map(M=>M.width)),768/Math.max(...e.cells.map(M=>M.height))))*t.scale,b=s.getImageData(0,0,r.width,r.height).data,$=r.width,f=-1,y=r.height,V=-1;for(let M=0;M<r.height;M++)for(let O=0;O<r.width;O++)b[(M*r.width+O)*4+3]>16&&($=Math.min($,O),f=Math.max(f,O),y=Math.min(y,M),V=Math.max(V,M));if(f>=$){let M=f-$+1,O=V-y+1,S=Math.min(p,480/M,736/O),v=M*S,w=O*S;d.drawImage(r,$,y,M,O,(512-v)/2+t.offsetX,752-w+t.offsetY,v,w)}return c}function bh({candidate:e,mirrored:t=!1,renderCache:a}){let i=(0,Ce.useRef)(null),[r,s]=(0,Ce.useState)("");return(0,Ce.useEffect)(()=>{if(e.cell.rendered)return;let c=!1;return db(e.sheet,e.cell,e.cell.cleanup,a).then(d=>{!c&&i.current&&(i.current.getContext("2d").clearRect(0,0,512,768),i.current.getContext("2d").drawImage(d,0,0),s(""))}).catch(d=>{c||s(xo(d))}),()=>{c=!0}},[e.sheet,e.cell,a]),e.cell.rendered?(0,N.jsx)("img",{src:e.cell.rendered.url,alt:e.cell.view+" "+e.cell.label,style:{transform:t?"scaleX(-1)":void 0}}):(0,N.jsxs)(N.Fragment,{children:[r?(0,N.jsx)("small",{role:"alert",children:r}):null,(0,N.jsx)("canvas",{ref:i,width:512,height:768,style:{transform:t?"scaleX(-1)":void 0},role:"img","aria-label":e.cell.view+" "+e.cell.label})]})}var N5=`
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
`;function ub({villager:e,request:t,onSaved:a,onBack:i,onExport:r}){let s=(0,Ce.useMemo)(()=>rb(),[]),c=(0,Ce.useRef)(null);(0,Ce.useEffect)(()=>(c.current!==null&&clearTimeout(c.current),()=>{c.current=setTimeout(()=>s.dispose(),0)}),[s]);let d="/villagers/"+encodeURIComponent(e.characterId)+"/sprites",[h,p]=(0,Ce.useState)(null),[b,$]=(0,Ce.useState)(null),[f,y]=(0,Ce.useState)("Create"),[V,M]=(0,Ce.useState)("front"),[O,S]=(0,Ce.useState)([...ob]),[v,w]=(0,Ce.useState)(""),[A,_]=(0,Ce.useState)({}),[Z,ee]=(0,Ce.useState)(!1),[Q,Te]=(0,Ce.useState)(null),[B,re]=(0,Ce.useState)(""),[ve,ut]=(0,Ce.useState)(!1),[Me,Vt]=(0,Ce.useState)([]),[qt,Qt]=(0,Ce.useState)(""),[z,j]=(0,Ce.useState)(""),[me,ye]=(0,Ce.useState)(null),[te,Be]=(0,Ce.useState)(!1),[Ge,at]=(0,Ce.useState)(""),[ie,ht]=(0,Ce.useState)(""),[qe,Ot]=(0,Ce.useState)(!1),[st,$t]=(0,Ce.useState)(!1),[pe,ge]=(0,Ce.useState)(null),he=(0,Ce.useRef)(null),[lt,kt]=(0,Ce.useState)(""),[nt,Lt]=(0,Ce.useState)(null),[Ve,I]=(0,Ce.useState)(1),[X,we]=(0,Ce.useState)(1),[je,Le]=(0,Ce.useState)("neutral"),Ne=(0,Ce.useRef)(null),oe=(0,Ce.useRef)(""),Ze=(0,Ce.useRef)(null),P=(x,H)=>t(d+"/studio"+(x?"/"+x:""),H===void 0?void 0:{method:"POST",body:JSON.stringify(H)}),gt=x=>{p(x.studio),a(x.snapshot)},It=(h?.jobs??[]).flatMap(x=>x.sheets.flatMap(H=>H.cells.map(Y=>({sheet:H,cell:Y})))),de=It.find(x=>x.cell.id===qt),Re=me?It.find(x=>x.cell.id===me.id):null,Dt=h?.jobs.some(x=>x.status==="running")??!1,ft=e.sprite?.images??[],va=It.filter(x=>x.cell.pending).length,Gt=h?.expressions??[],Wt={view:V,individual:Z,settings:b,expressions:O.filter(x=>Gt.some(H=>H.label===x)).map(x=>{let H=Gt.find(Y=>Y.label===x);return{label:x,pose:A[x]??H.pose,expressionId:H.id}})},Rt=JSON.stringify(Wt),Ct=h?.reference?.url;(0,Ce.useEffect)(()=>{pe&&!he.current?.open&&he.current?.showModal(),!pe&&he.current?.open&&he.current.close()},[pe]),(0,Ce.useEffect)(()=>{let x=!1;return t(d+"/studio").then(H=>{x||(p(H),$(H.settings),H.jobs.length&&y("Review"))}).catch(H=>{x||at(xo(H))}),Ze.current?.focus(),()=>{x=!0}},[d,t]),(0,Ce.useEffect)(()=>{if(!Dt)return;let x=window.setInterval(()=>{t(d+"/studio").then(p).catch(H=>at(xo(H)))},2e3);return()=>window.clearInterval(x)},[Dt,d,t]),(0,Ce.useEffect)(()=>{let x=!1;if(Te(null),re(""),oe.current!==Rt&&(Ne.current=null,oe.current=Rt),!Ct||!JSON.parse(Rt).expressions.length){ut(!1);return}ut(!0);let H=window.setTimeout(()=>{t(d+"/studio/plan",{method:"POST",body:Rt}).then(Y=>{x||Te(Y)}).catch(Y=>{x||re(xo(Y))}).finally(()=>{x||ut(!1)})},350);return()=>{x=!0,window.clearTimeout(H)}},[Rt,Ct,d,t]);async function Ye(x){Be(!0),at(""),ht("");try{await x()}catch(H){at(xo(H));try{p(await P(""))}catch{}}finally{Be(!1)}}async function Ha(){let x=await P("plan",Wt);Te(x),Ne.current??(Ne.current=x5());try{let H=Ne.current,Y=await P("jobs",{...Wt,plan:x,submissionId:H});if(p(Y),Ne.current=null,!Y.jobs.some(G=>G.id===H)){ht("This submission already completed and its artwork was removed. Click Generate to start a new batch.");return}y("Review"),ht("Drawing a saved batch. Existing scene images stay active.")}catch(H){if(/plan changed|model changed|size changed/i.test(xo(H)))Te(await P("plan",Wt)),ht("Summary refreshed. Click Generate to submit the updated request.");else throw H}}async function St(x,H){if(!x.length)throw new Error("Choose cutouts and expression slots.");let Y=[];for(let{candidate:G,expressionId:se}of x)Y.push({id:G.cell.id,expressionId:se,expected:G.cell,...G.cell.rendered?{}:{image:(await db(G.sheet,G.cell,G.cell.cleanup,s)).toDataURL("image/png")}});gt(await P("assign",{cells:Y,batchId:H})),ht("Assigned. These images are now used in scenes.")}async function C(x){let H=(x.assignments??[]).filter(G=>Gt.some(se=>se.id===G.expressionId)),Y=new Map;for(let G of x.sheets)for(let se of G.cells)!se.expressionId||!Gt.some(We=>We.id===se.expressionId)||H.some(We=>We.cellId===se.id)||Y.set(se.view+":"+se.expressionId,{candidate:{sheet:G,cell:se},expressionId:se.expressionId});for(let G of H){let se=It.find(We=>We.cell.id===G.cellId);se&&Y.set(G.view+":"+G.expressionId,{candidate:se,expressionId:G.expressionId})}await St([...Y.values()],x.id)}async function W(x){let H=await P("repair-background",{batchId:x.id});p(H);let Y=new Map((H.repairedCells??[]).map(se=>[se.originalId,se.cellId])),G=H.assignments.flatMap(se=>{let We=Y.get(se.cellId),Aa=H.jobs.flatMap(ra=>ra.sheets).find(ra=>ra.cells.some(ea=>ea.id===We)),un=Aa?.cells.find(ra=>ra.id===We);return Aa&&un?[{candidate:{sheet:Aa,cell:un},expressionId:se.expressionId}]:[]});G.length&&await St(G,x.id),ht("Backgrounds repaired. Original artwork retained; active sprites updated.")}function le(x){Qt(x.cell.id),j(h?.assignments.find(H=>H.cellId===x.cell.id)?.expressionId??x.cell.expressionId??Gt[0]?.id??""),ye(null)}async function Pe(x){let H=await P("delete",{...x,confirmed:!0});p(H.studio),ge(null),Ne.current=null,Vt([]),Qt(""),ye(null),ht("Artwork removed. "+H.deleted+" unused files deleted."+(H.failures.length?" Use Delete unused files to retry: "+H.failures.map(Y=>Y.error).join("; "):""))}async function Fe(){let x=await cb(lt),H;if(nt&&typeof nt=="object"&&Array.isArray(nt.cells))H=nt.cells;else{if(!Number.isInteger(Ve)||!Number.isInteger(X)||Ve<1||X<1)throw new Error("Choose a valid grid.");let Y=je.split(",").map(G=>G.trim().toLowerCase().replace(/\s+/g,"_")).filter(Boolean);if(!Y.length||Y.length>Ve*X)throw new Error("Supply one name per occupied cell, separated by commas.");H=Y.map((G,se)=>{let We=Math.floor(se%Ve*x.naturalWidth/Ve),Aa=Math.floor(Math.floor(se/Ve)*x.naturalHeight/X);return{label:G,view:V,x:We,y:Aa,width:Math.floor((se%Ve+1)*x.naturalWidth/Ve)-We,height:Math.floor((Math.floor(se/Ve)+1)*x.naturalHeight/X)-Aa}})}p(await P("import",{image:lt,cells:H})),kt(""),Lt(null),y("Review")}function Bt(x){if(x.style&&Object.hasOwn(gh,x.style)){let Y=x.style;$(G=>G&&{...G,style:Y,connectionId:x.connectionId,prompts:{...G.prompts,[Y]:x.stylePrompt??G.prompts[Y]}})}let H=x.requestedExpressions??[...x.sheets.flatMap(Y=>Y.cells),...x.pendingExpressions??[]];S([...new Set(H.map(Y=>Y.label))]),_(Object.fromEntries(H.map(Y=>[Y.label,Y.pose]))),M(x.view),ee(x.individual??!1),Ne.current=null,y("Create"),ht("Retry prepared. Generate creates a new batch with the displayed request count.")}let E=(0,N.jsxs)("aside",{className:"vss-panel vss-slots","data-open":st,"aria-label":"Expression assignment panel",children:[(0,N.jsxs)("h3",{children:["Expressions \xB7 ",Gt.length]}),(0,N.jsx)("p",{className:"vss-hint",children:de?"Selected: "+de.cell.label+" \xB7 "+de.cell.view:"Select a cutout, then Assign. Or drag it onto an expression."}),(0,N.jsxs)("label",{children:["Assign selected cutout to",(0,N.jsxs)("select",{"aria-label":"Assign selected cutout to",value:z,onChange:x=>j(x.target.value),children:[(0,N.jsx)("option",{value:"",children:"Choose expression"}),Gt.map(x=>(0,N.jsx)("option",{value:x.id,children:x.name},x.id))]})]}),(0,N.jsx)("button",{className:"vss-primary",disabled:te||!de||!z,onClick:()=>de&&void Ye(()=>St([{candidate:de,expressionId:z}])),children:"Assign"}),(0,N.jsx)("button",{className:"vss-slot-toggle","aria-expanded":st,onClick:()=>$t(!st),children:st?"Hide expressions":"Show expressions"}),(0,N.jsx)("div",{className:"vss-slot-list",children:Gt.map(x=>{let H=(h?.assignments??[]).filter(Y=>Y.expressionId===x.id);return(0,N.jsxs)("div",{className:"vss-slot",onDragOver:Y=>Y.preventDefault(),onDrop:Y=>{Y.preventDefault();let G=It.find(se=>se.cell.id===Y.dataTransfer.getData("application/x-villages-cutout"));G&&!te&&Ye(()=>St([{candidate:G,expressionId:x.id}]))},children:[(0,N.jsxs)("strong",{children:[x.name,h?.defaultExpressionId===x.id?" \xB7 Default":""]}),(0,N.jsx)("small",{children:x.useWhen||x.pose||"Uses this expression's name as guidance."}),(0,N.jsxs)("div",{className:"vss-row",children:[H.map(Y=>{let G=It.find(se=>se.cell.id===Y.cellId);return G?(0,N.jsxs)("div",{className:"vss-mini",children:[(0,N.jsx)(bh,{renderCache:s,candidate:G}),(0,N.jsx)("small",{children:Y.view})]},Y.view):null}),H.length?null:(0,N.jsx)("small",{children:"Empty \xB7 optional"})]}),(0,N.jsxs)("button",{disabled:te||!de,"aria-label":"Assign selected cutout to "+x.name,onClick:()=>de&&void Ye(()=>St([{candidate:de,expressionId:x.id}])),children:["Assign ",de?.cell.view??""," here"]}),H.length&&h?.defaultExpressionId!==x.id?(0,N.jsx)("button",{disabled:te,onClick:()=>{Ye(async()=>gt(await P("expression",{defaultId:x.id})))},children:"Use as default scene image"}):null,(0,N.jsxs)("details",{children:[(0,N.jsxs)("summary",{children:["Edit ",x.name]}),(0,N.jsxs)("form",{onSubmit:Y=>{Y.preventDefault();let G=new FormData(Y.currentTarget);Ye(async()=>gt(await P("expression",{id:x.id,name:G.get("name"),label:G.get("name"),pose:G.get("pose"),useWhen:G.get("useWhen")})))},children:[(0,N.jsxs)("label",{children:["Name",(0,N.jsx)("input",{name:"name",defaultValue:x.name,maxLength:40,required:!0})]}),(0,N.jsxs)("label",{children:["Pose for generation",(0,N.jsx)("input",{name:"pose",defaultValue:x.pose,maxLength:500})]}),(0,N.jsxs)("label",{children:["Use when \xB7 optional",(0,N.jsx)("input",{name:"useWhen",defaultValue:x.useWhen,maxLength:1e3})]}),(0,N.jsx)("button",{disabled:te,children:"Save expression"}),(0,N.jsx)("button",{type:"button",disabled:te||!!H.length,onClick:()=>{Ye(async()=>gt(await P("expression",{removeId:x.id})))},children:"Remove empty slot"})]})]})]},x.id)})}),(0,N.jsxs)("form",{onSubmit:x=>{x.preventDefault();let H=v.trim();Ye(async()=>{gt(await P("expression",{name:H})),w(""),S(Y=>[...new Set([...Y,H.toLowerCase().replace(/\s+/g,"_")])])})},children:[(0,N.jsxs)("label",{children:["New expression",(0,N.jsx)("input",{value:v,maxLength:40,onChange:x=>w(x.target.value),placeholder:"Delighted, running\u2026"})]}),(0,N.jsx)("button",{disabled:te||!v.trim(),children:"Add expression"})]})]});return(0,N.jsxs)("section",{className:"vss","aria-label":e.name+" Sprite Studio",children:[(0,N.jsx)("style",{children:N5+k5}),(0,N.jsxs)("header",{className:"vss-header",children:[(0,N.jsxs)("div",{children:[(0,N.jsxs)("p",{className:"vss-hint",children:["Villagers / ",e.name]}),(0,N.jsxs)("h2",{ref:Ze,tabIndex:-1,children:[e.name,"\u2019s Sprite Studio"]}),(0,N.jsxs)("small",{children:[ft.length," in use \xB7 ",It.length," saved cutouts \xB7 ",va," pending review"]})]}),(0,N.jsx)("button",{disabled:te,onClick:()=>{Ye(async()=>{b&&await P("settings",b),i()})},children:"\u2190 Back to Villagers"})]}),Ge&&!pe?(0,N.jsx)("p",{className:"vss-error",role:"alert",children:Ge}):null,(0,N.jsx)("p",{role:"status","aria-live":"polite",children:ie}),!h||!b?(0,N.jsx)("p",{children:"Loading saved sprite work\u2026"}):(0,N.jsxs)(N.Fragment,{children:[(0,N.jsx)("nav",{className:"vss-nav","aria-label":"Sprite Studio sections",children:["Create","Review","In use"].map(x=>(0,N.jsxs)("button",{"aria-pressed":f===x,onClick:()=>{y(x),ye(null)},children:[x,x==="Review"&&va?" \xB7 "+va:""]},x))}),h.reference?null:(0,N.jsxs)("div",{className:"vss-panel",children:[(0,N.jsx)("h3",{children:"Capture an identity reference"}),(0,N.jsx)("button",{disabled:te,onClick:()=>{Ye(async()=>p(await P("reference",{})))},children:"Capture current avatar"}),(0,N.jsxs)("label",{children:["Upload reference",(0,N.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",onChange:x=>{let H=x.target.files?.[0];H&&Ye(async()=>p(await P("reference",{image:await sb(H)})))}})]})]}),f==="Create"?(0,N.jsxs)("div",{className:"vss-create",children:[(0,N.jsxs)("div",{className:"vss-panel",children:[(0,N.jsx)("h3",{children:"Generate a saved batch"}),(0,N.jsx)("p",{className:"vss-hint",children:"Choose any expressions. Neutral is optional. Assign images in Review to use them in scenes."}),(0,N.jsxs)("label",{children:["View",(0,N.jsxs)("select",{"aria-label":"View",value:V,onChange:x=>M(x.target.value),children:[(0,N.jsx)("option",{value:"front",children:"Front \xB7 facing you"}),(0,N.jsx)("option",{value:"side",children:"Side \xB7 facing right, mirrored for left"})]})]}),(0,N.jsx)("div",{className:"vss-expressions",children:Gt.map(x=>(0,N.jsxs)("div",{children:[(0,N.jsxs)("label",{className:"vss-check",children:[(0,N.jsx)("input",{type:"checkbox",checked:O.includes(x.label),onChange:H=>S(H.target.checked?[...O,x.label]:O.filter(Y=>Y!==x.label))}),x.name]}),O.includes(x.label)?(0,N.jsxs)("label",{children:["Pose \xB7 optional",(0,N.jsx)("input",{value:A[x.label]??x.pose,maxLength:500,onChange:H=>_({...A,[x.label]:H.target.value})})]}):null]},x.id))}),(0,N.jsxs)("label",{children:["Art style",(0,N.jsxs)("select",{"aria-label":"Art style",value:b.style,onChange:x=>$({...b,style:x.target.value}),children:[(0,N.jsx)("option",{value:"PAPERCRAFT",children:"Papercraft"}),(0,N.jsx)("option",{value:"BATTLEHIGHWAY",children:"Battle Highway"}),(0,N.jsx)("option",{value:"Custom",children:"Custom"})]})]}),(0,N.jsxs)("details",{children:[(0,N.jsx)("summary",{children:"Style prompt"}),(0,N.jsxs)("label",{children:["Drawing instructions",(0,N.jsx)("textarea",{value:b.prompts[b.style],maxLength:6e3,onChange:x=>$({...b,prompts:{...b.prompts,[b.style]:x.target.value}})})]}),(0,N.jsx)("button",{onClick:()=>$({...b,prompts:{...b.prompts,[b.style]:gh[b.style]}}),children:"Restore style prompt"})]}),(0,N.jsxs)("label",{children:["Image connection",(0,N.jsxs)("select",{"aria-label":"Image connection",value:b.connectionId,onChange:x=>$({...b,connectionId:x.target.value}),children:[(0,N.jsx)("option",{value:"",children:"Village default"}),h.connections.map(x=>(0,N.jsxs)("option",{value:x.id,children:[x.name," \xB7 ",x.model]},x.id))]})]}),(0,N.jsxs)("label",{children:["Drawing layout",(0,N.jsxs)("select",{"aria-label":"Drawing layout",value:Z?"individual":"sheet",onChange:x=>ee(x.target.value==="individual"),children:[(0,N.jsx)("option",{value:"sheet",children:"Efficient sheets \xB7 up to six sprites each"}),(0,N.jsx)("option",{value:"individual",children:"Individual \xB7 more drawing space per sprite"})]})]}),(0,N.jsx)("div",{className:"vss-panel","aria-label":"Generation request summary",children:ve?(0,N.jsx)("p",{children:"Updating request summary\u2026"}):Q?(0,N.jsxs)(N.Fragment,{children:[(0,N.jsxs)("strong",{children:[Q.connection.name," \xB7 ",Q.connection.model]}),(0,N.jsxs)("p",{children:[Wt.expressions.length," expressions \xB7 ",Q.batches.length," image"," ",Q.batches.length===1?"request":"requests"," \xB7"," ",Q.estimatedCost===null?"Cost unavailable":"Estimated $"+Q.estimatedCost.toFixed(3)]}),Q.batches.map((x,H)=>(0,N.jsxs)("small",{children:["Sheet ",H+1,": ",x.count," sprites \xB7 ",x.cols," \xD7 ",x.rows," \xB7 ",x.width," \xD7"," ",x.height,"px source"]},H)),(0,N.jsxs)("small",{children:["Cutouts saved at 512 \xD7 768."," ",Q.localWorkflow?"Local workflow internal steps and costs are unavailable. ":"","No automatic retries or provider changes."]})]}):(0,N.jsx)("p",{className:"vss-hint",children:B||"Select expressions and capture a reference to see the request summary."})}),(0,N.jsx)("button",{className:"vss-primary",disabled:te||Dt||ve||!Q||!Wt.expressions.length,onClick:()=>{Ye(Ha)},children:te?"Working\u2026":"Generate"}),(0,N.jsxs)("details",{children:[(0,N.jsx)("summary",{children:"Import images or a sheet"}),(0,N.jsxs)("label",{children:["Image",(0,N.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",onChange:x=>{let H=x.target.files?.[0];H&&Ye(async()=>kt(await sb(H)))}})]}),(0,N.jsxs)("label",{children:["Optional exported JSON manifest",(0,N.jsx)("input",{type:"file",accept:".json,application/json",onChange:x=>{let H=x.target.files?.[0];H&&Ye(async()=>Lt(JSON.parse(await H.text())))}})]}),nt?(0,N.jsx)("small",{children:"Using manifest cell positions and views."}):(0,N.jsxs)(N.Fragment,{children:[(0,N.jsxs)("div",{className:"vss-fields",children:[(0,N.jsxs)("label",{children:["Columns",(0,N.jsx)("input",{type:"number",min:1,value:Ve,onChange:x=>I(Number(x.target.value))})]}),(0,N.jsxs)("label",{children:["Rows",(0,N.jsx)("input",{type:"number",min:1,value:X,onChange:x=>we(Number(x.target.value))})]})]}),(0,N.jsxs)("label",{children:["Expression names in reading order",(0,N.jsx)("input",{value:je,onChange:x=>Le(x.target.value)})]})]}),(0,N.jsx)("button",{disabled:te||!lt,onClick:()=>{Ye(Fe)},children:"Import to gallery"})]})]}),(0,N.jsxs)("div",{children:[h.reference?(0,N.jsxs)("div",{className:"vss-panel",children:[(0,N.jsx)("h3",{children:"Original identity reference"}),(0,N.jsx)("img",{className:"vss-reference",src:h.reference.url,alt:"Captured identity reference"}),(0,N.jsx)("small",{children:"Used for every generation and art style."})]}):null,E]})]}):f==="Review"?(0,N.jsxs)(N.Fragment,{children:[(0,N.jsxs)("div",{className:"vss-row",children:[(0,N.jsx)("h3",{children:"Saved artwork"}),(0,N.jsx)("button",{disabled:te||!va,onClick:()=>{Ye(async()=>{p(await P("clear-review",{})),Ot(!1),ht("Pending review cleared. All saved artwork remains available.")})},children:"Clear pending review"}),(0,N.jsxs)("label",{className:"vss-check",children:[(0,N.jsx)("input",{type:"checkbox",checked:qe,onChange:x=>Ot(x.target.checked)}),"Pending only"]}),(0,N.jsxs)("button",{disabled:te||!Me.length,onClick:()=>ge({ids:Me,deleteFiles:!1}),children:["Delete selected cutouts (",Me.length,")"]}),(0,N.jsx)("button",{disabled:te,onClick:()=>{Ye(async()=>{if(!window.confirm("Delete unused Studio-owned files? Saved alternatives, active assignments, shared originals, and the identity reference are retained."))return;let x=await P("delete-unused",{});p(x.studio),ht(x.deleted+" unused files deleted."+(x.failures.length?" Retry needed: "+x.failures.map(H=>H.error).join("; "):""))})},children:"Delete unused files"})]}),(0,N.jsxs)("div",{className:"vss-library",children:[(0,N.jsxs)("div",{className:"vss-gallery",children:[h.jobs.length?null:(0,N.jsx)("div",{className:"vss-panel",children:(0,N.jsx)("p",{children:"Generate or import artwork to begin. Each batch stays here for future swaps."})}),[...h.jobs].reverse().map(x=>{let H=x.sheets.flatMap(Y=>Y.cells.filter(G=>!qe||G.pending).map(G=>({sheet:Y,cell:G})));return qe&&!H.length&&x.status==="ready"?null:(0,N.jsxs)("article",{className:"vss-panel","aria-label":"Batch "+x.id,children:[(0,N.jsx)("h3",{children:x.style==="PAPERCRAFT"?"Papercraft":x.style==="BATTLEHIGHWAY"?"Battle Highway":x.style||x.model||"Saved batch"}),(0,N.jsxs)("small",{children:[new Date(x.createdAt).toLocaleString()," \xB7 ",x.model," \xB7 ",x.attempted," submitted /"," ",x.planned," planned requests \xB7 ",x.status]}),x.error?(0,N.jsx)("p",{className:"vss-hint",children:x.error}):null,(0,N.jsxs)("div",{className:"vss-row",children:[(0,N.jsx)("button",{className:"vss-primary",disabled:te||x.status==="running"||!H.length,onClick:()=>{Ye(()=>C(x))},children:"Use this batch"}),(0,N.jsx)("button",{disabled:te||x.status==="running",onClick:()=>ge({batchId:x.id,deleteFiles:!1}),children:"Delete batch"}),(0,N.jsx)("button",{disabled:te||x.status==="running"||!H.length,onClick:()=>{Ye(()=>W(x))},children:"Repair backgrounds"}),x.status==="interrupted"?(0,N.jsx)("button",{disabled:te||Dt,onClick:()=>Bt(x),children:"Prepare retry"}):null,x.pendingAssetId&&x.status!=="running"?(0,N.jsx)("button",{disabled:te,onClick:()=>{Ye(async()=>p(await P("recover",{id:x.id})))},children:"Recover saved original \xB7 no image request"}):null]}),x.sheets.some(Y=>!Y.source||Y.source.kind==="legacy")?(0,N.jsx)("p",{children:"Earlier saved sources may already contain transparency damage. Repair backgrounds cannot restore missing opacity. Generate a new batch to review replacements; existing artwork stays saved."}):null,(0,N.jsx)("div",{className:"vss-originals",children:x.sheets.map((Y,G)=>(0,N.jsxs)("details",{children:[(0,N.jsxs)("summary",{children:["Original sheet ",G+1,(0,N.jsx)("img",{className:"vss-sheet-thumb",src:Y.url,alt:"Sheet thumbnail "+(G+1)})]}),(0,N.jsx)("a",{href:Y.url,target:"_blank",rel:"noreferrer",children:(0,N.jsx)("img",{src:Y.url,alt:"Original sheet "+(G+1)})}),(0,N.jsxs)("small",{children:[Y.width," \xD7 ",Y.height,"px \xB7 Provider usage"," ",Y.usage?JSON.stringify(Y.usage):"unavailable"]})]},Y.assetId+":"+G))}),(0,N.jsx)("div",{className:"vss-grid",children:H.map(Y=>{let G=h.assignments.filter(se=>se.cellId===Y.cell.id);return(0,N.jsxs)("div",{className:"vss-card",draggable:!te,onDragStart:se=>{se.dataTransfer.setData("application/x-villages-cutout",Y.cell.id),se.dataTransfer.effectAllowed="copy",le(Y)},children:[(0,N.jsx)("button",{"aria-label":"Select "+Y.cell.view+" "+Y.cell.label+" cutout","aria-pressed":qt===Y.cell.id,onClick:()=>le(Y),children:(0,N.jsx)(bh,{renderCache:s,candidate:Y})}),(0,N.jsx)("strong",{children:Y.cell.label.replaceAll("_"," ")}),(0,N.jsx)("small",{children:Y.cell.view}),G.length?(0,N.jsxs)("span",{className:"vss-badge",children:["In use \xB7"," ",G.map(se=>Gt.find(We=>We.id===se.expressionId)?.name).join(", ")]}):(0,N.jsx)("small",{children:Y.cell.pending?"Pending review":"Saved alternative"}),(0,N.jsxs)("label",{className:"vss-check",children:[(0,N.jsx)("input",{type:"checkbox",checked:Me.includes(Y.cell.id),"aria-label":"Select "+Y.cell.label+" for deletion",onChange:se=>Vt(se.target.checked?[...Me,Y.cell.id]:Me.filter(We=>We!==Y.cell.id))}),"Select for deletion"]}),(0,N.jsx)("button",{disabled:te,onClick:()=>{le(Y),ye(structuredClone(Y.cell))},children:"Adjust image"})]},Y.cell.id)})})]},x.id)})]}),E]}),me&&Re?(0,N.jsxs)("div",{className:"vss-panel","aria-label":"Adjust image",children:[(0,N.jsx)("h3",{children:"Adjust image \xB7 saves another cutout"}),(0,N.jsxs)("div",{className:"vss-adjust",children:[(0,N.jsx)("div",{className:"vss-stage","data-background":"checker",children:(0,N.jsx)(bh,{renderCache:s,candidate:{sheet:Re.sheet,cell:{...me,rendered:void 0}}})}),(0,N.jsxs)("svg",{className:"vss-source",viewBox:"0 0 "+Re.sheet.width+" "+Re.sheet.height,role:"img","aria-label":"Original sheet with selected crop",children:[(0,N.jsx)("image",{href:Re.sheet.url,width:Re.sheet.width,height:Re.sheet.height}),(0,N.jsx)("rect",{x:me.x,y:me.y,width:me.width,height:me.height,fill:"none",stroke:"#c5a4ff",strokeWidth:Math.max(3,Re.sheet.width/150)})]})]}),(0,N.jsx)("div",{className:"vss-fields",children:["x","y","width","height","scale","offsetX","offsetY"].map(x=>(0,N.jsxs)("label",{children:[{x:"Crop X",y:"Crop Y",width:"Crop width",height:"Crop height",scale:"Scale",offsetX:"Horizontal offset",offsetY:"Foot offset"}[x],(0,N.jsx)("input",{type:"number",step:x==="scale"?.05:1,value:me[x],onChange:H=>ye({...me,[x]:Number(H.target.value)})})]},x))}),(0,N.jsxs)("label",{className:"vss-check",children:[(0,N.jsx)("input",{type:"checkbox",checked:me.cleanup??!1,onChange:x=>ye({...me,cleanup:x.target.checked})}),"Remove background"]}),(0,N.jsxs)("div",{className:"vss-row",children:[(0,N.jsx)("button",{disabled:te,onClick:()=>{Ye(async()=>{let x=await P("cell",{id:me.id,cell:me});p(x),Qt(x.adjustedCellId??qt),ye(null),ht("Adjusted cutout saved. Assign it when ready.")})},children:"Save adjusted cutout"}),(0,N.jsx)("button",{onClick:()=>ye(null),children:"Cancel"})]})]}):null]}):(0,N.jsxs)("div",{className:"vss-panel",children:[(0,N.jsx)("h3",{children:"In use"}),(0,N.jsx)("p",{className:"vss-hint",children:"These assignments are used in scenes. Saved alternatives remain in Review."}),(0,N.jsx)("div",{className:"vss-grid",children:ft.map(x=>(0,N.jsxs)("div",{className:"vss-card",children:[(0,N.jsx)("img",{src:x.url,alt:x.label+" "+x.view}),(0,N.jsx)("strong",{children:x.label.replaceAll("_"," ")}),(0,N.jsx)("small",{children:x.view}),(0,N.jsx)("button",{disabled:te,onClick:()=>{Ye(async()=>{gt(await P("remove",x)),ht("Removed from scenes. Saved artwork remains available.")})},children:"Remove from scenes"})]},x.view+":"+x.label))}),ft.length?(0,N.jsxs)(N.Fragment,{children:[(0,N.jsxs)("label",{children:["Scene framing",(0,N.jsxs)("select",{value:e.sprite?.framing.mode??"full",onChange:x=>{Ye(async()=>a(await t(d+"/framing",{method:"POST",body:JSON.stringify({mode:x.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,N.jsx)("option",{value:"full",children:"Full body"}),(0,N.jsx)("option",{value:"half",children:"Half body"})]})]}),e.sprite?.framing.mode==="half"?(0,N.jsxs)("label",{children:["Visible body height \xB7 percent",(0,N.jsx)("input",{type:"number",min:40,max:85,defaultValue:e.sprite.framing.cropPercent,onBlur:x=>{let H=Number(x.target.value);H!==e.sprite?.framing.cropPercent&&Ye(async()=>a(await t(d+"/framing",{method:"POST",body:JSON.stringify({mode:"half",cropPercent:H})})))}})]}):null,(0,N.jsx)("button",{disabled:te,onClick:()=>{Ye(r)},children:"Download both views and manifest"})]}):(0,N.jsx)("p",{children:"No assigned images yet."}),E]})]}),(0,N.jsx)("dialog",{ref:he,className:"vss-delete-dialog","aria-labelledby":"vss-delete-title",onCancel:()=>ge(null),children:pe?(0,N.jsxs)("div",{className:"vss-panel",children:[(0,N.jsx)("h3",{id:"vss-delete-title",children:"Delete saved artwork?"}),Ge?(0,N.jsx)("p",{className:"vss-error",role:"alert",children:Ge}):null,(0,N.jsxs)("p",{children:[pe.batchId?"Remove this batch from the gallery.":"Remove "+pe.ids?.length+" selected cutouts from the gallery."," ","Images currently in use are protected."]}),(0,N.jsxs)("label",{className:"vss-check",children:[(0,N.jsx)("input",{type:"checkbox",checked:pe.deleteFiles,onChange:x=>ge({...pe,deleteFiles:x.target.checked})}),"Also delete unused files from disk"]}),(0,N.jsx)("small",{children:"Shared originals and retained alternatives stay saved. Files kept on disk can be removed later with Delete unused files."}),(0,N.jsxs)("div",{className:"vss-row",children:[(0,N.jsx)("button",{disabled:te,onClick:()=>ge(null),children:"Cancel"}),(0,N.jsx)("button",{disabled:te,onClick:()=>{Ye(()=>Pe(pe))},children:"Delete artwork"})]})]}):null})]})}var k5=`
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
`;var m=In(wo()),cx=In(v1());function Vk(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),i="",r=[],s=[];for(let c=0;c<a.length;c++){let d=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(d)?.[1];if(h&&(i?h[0]===i[0]&&h.length>=i.length&&(i=""):i=h),!i&&!d.trim()&&(!t||c<a.length-1)){let p=r.join(`
`).trim();p&&s.push(p),r=[]}else r.push(d)}if(!t){let c=r.join(`
`).trim();c&&s.push(c)}return s}var Ok=['"',"'","\u201D","\u2019","\xBB","\u300D"],Ik=['"',"'","\u201C","\u2018","\xAB","\u300C"];function y1(e){let t=e.trim();return Ok.includes(t.slice(-1))&&Ik.some(i=>t.slice(0,-1).includes(i))?"speech":"prose"}function w1(e,t){let a=Vk(e),i=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return i();let r=[],s=[],c=[],d=[];for(let h=0;h<a.length;h+=1){let p=t[h];if(p.kind==="untagged"){r.push(a[h]),s.push(d),c.push(p.expression??null),d=[];continue}let b={register:p.kind==="whisper"?"whisper":"side",text:p.text,...p.target?{target:p.target}:{}};r.length?s[s.length-1].push(b):d.push(b)}return r.length===0?i():{paragraphs:r,asides:s,expressions:c}}var Dk="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function Yr(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],i=new RegExp(Dk,"g"),r=0,s,c=d=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+d};return}a.push({kind:"text",text:d})};for(;(s=i.exec(e))!==null;)s.index>r&&c(e.slice(r,s.index)),s[1]!=null?c(s[1]):s[2]!=null&&s[3]!=null?a.push({kind:"link",text:s[2],href:s[3]}):s[4]!=null?a.push({kind:"code",text:s[4]}):s[5]!=null?a.push({kind:"styled",style:"highlight",children:Yr(s[5],t+1)}):s[6]!=null?a.push({kind:"styled",style:"strikethrough",children:Yr(s[6],t+1)}):s[7]!=null?a.push({kind:"styled",style:"bold-italic",children:Yr(s[7],t+1)}):s[8]!=null?a.push({kind:"styled",style:"bold",children:Yr(s[8],t+1)}):s[9]!=null?a.push({kind:"styled",style:"underline",children:Yr(s[9],t+1)}):(s[10]!=null||s[11]!=null)&&a.push({kind:"styled",style:"italic",children:Yr(s[10]??s[11],t+1)}),r=s.index+s[0].length;return r<e.length&&c(e.slice(r)),a}function x1(e){return Yr(e,0)}function Si(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function $1(e){return e===null||typeof e=="string"}function S1(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function pu(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function _k(e){return e===null?!0:Si(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function Hk(e){if(!Si(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!pu(e.capabilities)||!Si(e.presentation)||!Si(e.occupancy)||!Si(e.state))return!1;let{presentation:t,occupancy:a,state:i}=e;return _k(t.image)&&S1(t.x)&&S1(t.y)&&typeof a.playerHome=="boolean"&&$1(a.residentCharacterId)&&$1(a.homeKind)&&typeof i.condition=="string"&&pu(i.upgrades)&&pu(i.furniture)&&pu(i.publicFacts)&&typeof i.updatedAt=="string"}function N1(e){if(!Si(e)||!Si(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(Hk),i=Array.isArray(e.venueRequests)?e.venueRequests:[],r=i.filter(s=>Si(s)&&typeof s.id=="string"&&Si(s.venueDraft)&&typeof s.venueDraft.name=="string"&&typeof s.venueDraft.category=="string");return a.length===t.length&&r.length===i.length&&i===e.venueRequests?e:{...e,venueRequests:r,settings:{...e.settings,venues:a}}}function k1(e,t,a){return e==="Enter"&&!t&&!a}function sr(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,i=>i.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function C1(e,t,a,i){let r=Math.max(0,a-1);return!e||e.roomId!==t?r:a>e.stepCount?e.stepCount:Math.min(i,r)}function vs(e,t){return t?.roomId===e}function T1(e,t){return e.status==="closed"&&e.submissions?.some(a=>a.id===t)===!0}function pg(e){return Object.fromEntries(e.map((t,a)=>[t,{position:e.length===3&&a===1?"center":a<Math.ceil(e.length/2)?"left":"right",expression:"",look:{target:"player"}}]))}function gg(e){let t=(e.staging??[]).map(r=>({...r}));if(!e.speakerId||e.kind==="narration"||e.speakerId==="__venue_scene__")return t;let a=t.find(r=>r.characterId===e.speakerId)??{characterId:e.speakerId};!a.expression&&e.expression&&(a.expression=e.expression);let i=e.gazeAt||(e.kind==="whisper"?e.targetId:void 0);return!a.look&&i&&(a.look=i==="player"?{target:"player"}:{target:"villager",characterId:i}),!t.includes(a)&&(a.expression||a.look)&&t.push(a),t}function E1(e,t){return Object.fromEntries(Object.entries(e).map(([a,i])=>[a,i.look.target==="villager"&&!t.includes(i.look.characterId)?{...i,look:{target:"player"}}:i]))}function A1(e,t){let a=pg(e),i=e;return t.map(r=>{r.beforeIds&&(i=r.beforeIds,a=E1(a,i)),a={...a};for(let s of r.cues??[]){if(!i.includes(s.characterId)||!a[s.characterId])continue;let{characterId:c,...d}=s;a[c]={...a[c],...d}}return r.afterIds&&(i=r.afterIds,a=E1(a,i)),{state:a,activeIds:i}})}function R1(e,t){let a=new Map,i=new Map(e.flatMap((r,s)=>r.id?[[r.id,s]]:[]));for(let r of t){let s=(r.replyLineIds??[]).filter(b=>i.has(b));if(!s.length)continue;let c=s[0],d=s.at(-1),h=i.get(c);h>0&&e[h-1].role==="user"&&(h-=1);let p=e[h].id;p&&r.activeIdsAtTurn&&a.set(p,{...a.get(p),beforeIds:r.activeIdsAtTurn}),r.activeIdsAfterTurn&&a.set(d,{...a.get(d),afterIds:r.activeIdsAfterTurn})}return a}function M1(e,t){let a=["left","center","right"],i={};a.forEach((r,s)=>{let c=Object.keys(t).filter(d=>t[d]?.position===r);c.forEach((d,h)=>{i[d]={x:(s+(h+.5)/c.length)/3,width:Math.min(.25,.9/(3*c.length)),facing:"front"}})});for(let r of Object.keys(i))e.includes(r)||delete i[r];for(let r of e){let s=i[r];if(!s)continue;let c=t[r].look;if(c.target==="direction")s.facing=c.direction;else if(c.target==="villager"&&i[c.characterId]){let d=i[c.characterId].x;s.facing=d===s.x?"front":d<s.x?"left":"right"}}return i}function z1(e,t){return t<0||t===e?"front":t<e?"left":"right"}function V1(e,t,a){let i=a==="front"?"front":"side",r=d=>d.expressionId===t||d.label===t||d.aliases?.includes(t),s=d=>d.isDefault||d.label==="neutral",c=e.find(d=>d.view===i&&r(d))??e.find(d=>d.view==="front"&&r(d))??e.find(r)??e.find(d=>d.view===i&&d.isDefault)??e.find(d=>d.view==="front"&&d.isDefault)??e.find(d=>d.isDefault)??e.find(d=>d.view===i&&s(d))??e.find(d=>d.view==="front"&&s(d))??e.find(d=>d.view===i)??e[0];return c?{image:c,mirrored:c.view==="side"&&a==="left"}:null}function O1(e,t,a){let i=.2*a.photoWidth/a.width,r=.2*a.photoHeight/a.height;return t.some(s=>s.x!==null&&s.y!==null&&Math.abs(s.x-e.x)<i&&Math.abs(s.y-e.y)<r)}function I1(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var lr=(e,t,a)=>Math.min(a,Math.max(t,e));function gu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function fg(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let i=Math.min(t.width/e.width,t.height/e.height),r=Math.max(a.zoom,gu(e,t)),s=e.width*i*r,c=e.height*i*r,d=t.width/2-a.centerX*s,h=t.height/2-a.centerY*c;return{left:s<=t.width?(t.width-s)/2:lr(d,t.width-s,0),top:c<=t.height?(t.height-c)/2:lr(h,t.height-c,0),width:s,height:c}}function D1(e,t,a,i,r,s){let c=fg(e,t,a);if(!c.width||!c.height)return a;let d=gu(e,t),h=lr(a.zoom*s,d,Math.max(4,d*2)),p=h/Math.max(a.zoom,d),b=c.width*p,$=c.height*p,f=(i.x-c.left)/c.width,y=(i.y-c.top)/c.height,V=r.x-f*b,M=r.y-y*$;return{zoom:h,centerX:lr((t.width/2-V)/b,0,1),centerY:lr((t.height/2-M)/$,0,1)}}function _1(e,t){let a=Math.max(1,t),i=Math.max(4,a*2);return .32+1.03*((lr(e,a,i)-a)/(i-a))}function H1(e,t){return t?Math.max(1,e):e}function bg(e,t,a){let i=Math.min(90,t.width/2),r=64,s=116,c=e.left+a.x*e.width,d=e.top+a.y*e.height,h=d+r,p=h+s<=t.height?h:d-r-s;return{left:lr(c,i,t.width-i),top:lr(p,0,Math.max(0,t.height-s))}}var o=In(br()),n="marinara-capability-villages",U1="marinara-capability-villages-styles",Uk="/api/villages",qk=.7,Tg=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],vg=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),Lk={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},Xr=e=>Tg.find(t=>t.value===e),Bk=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,q1={roads:"auto",structures:"auto",water:"auto"},fu=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],L1=1,B1=3,yg="__villages_image_disabled__",j1=["neutral","happy","sad","angry","surprised","thinking"];function Y1({jobs:e,onRetry:t}){let[a,i]=(0,m.useState)(""),[r,s]=(0,m.useState)(""),c=e.filter(d=>d.status!=="obsolete");return c.length?(0,o.jsxs)("details",{className:n+"-panel",open:c.some(d=>["failed","interrupted"].includes(d.status)),children:[(0,o.jsxs)("summary",{children:["Background work: ",c.filter(d=>d.status!=="completed").length," pending"]}),(0,o.jsx)("p",{className:n+"-hint",children:"Recurring updates run while Villages is visible. Requested work can finish while away."}),c.map(d=>(0,o.jsx)("div",{className:n+"-notice-row",children:(0,o.jsxs)("div",{className:n+"-field",children:[(0,o.jsx)("strong",{children:d.label}),(0,o.jsxs)("span",{children:[d.status,": ",d.completedSteps," saved steps, ",d.requests," requests,"," ",d.tokens===null?"token usage unavailable":d.tokens+" reported tokens"]}),d.error?(0,o.jsx)("p",{className:n+"-status",children:d.error}):null,d.connectionPaused?(0,o.jsx)("p",{className:n+"-status",children:"Automatic work on this connection is paused. A successful retry resumes it."}):null,["failed","interrupted","paused"].includes(d.status)?(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:!!a,onClick:()=>{i(d.id),s(""),t(d).catch(h=>s(F(h,"Could not retry background work."))).finally(()=>i(""))},children:a===d.id?"Queuing...":d.status==="paused"?"Run now":"Retry unfinished work"}):null]})},d.id)),r?(0,o.jsx)("p",{role:"alert",className:n+"-error",children:r}):null]}):null}function G1(e,t,a,i,r=!1,s=1){let c=t==="gathering"?"Gathering Place":r?"Your residence":`Residence ${s}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:i},occupancy:{playerHome:r,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}var dx={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function bu(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function jk(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let i=Math.floor(a/36e5),r=Math.max(1,Math.ceil(a%36e5/6e4));return i>0?`${i}h ${r}m left`:`${r}m left`}function Yk({library:e,busy:t,onRefresh:a,onForget:i}){let[r,s]=(0,m.useState)("all"),[c,d]=(0,m.useState)(""),[h,p]=(0,m.useState)(""),[b,$]=(0,m.useState)(null),[f,y]=(0,m.useState)(""),V=Date.now(),M=(w,A)=>(!h.trim()||`${w} ${A.map(_=>_.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||A.some(_=>_.id===c)),O=(e?.recollections??[]).filter(w=>M(w.text,[...w.subjects,...w.knownBy])),S=(e?.durable??[]).filter(w=>M(w.text,[...w.subjects,...w.knownBy])),v=async(w,A)=>{try{let _=await L(`/rooms/archive/${encodeURIComponent(w)}`);$({visit:_.visit,lineIds:A}),y("")}catch(_){$(null),y(F(_,"The source visit could not be read."))}};return(0,o.jsxs)("div",{className:`${n}-memory-library`,children:[(0,o.jsxs)("section",{className:`${n}-memory-hero`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-kicker`,children:"Continuity, with receipts"}),(0,o.jsx)("h3",{children:"What your villagers carry forward"}),(0,o.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,o.jsxs)("div",{className:`${n}-memory-stats`,children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,o.jsxs)("div",{className:`${n}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"01"}),(0,o.jsx)("strong",{children:"Passing"}),(0,o.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"02"}),(0,o.jsx)("strong",{children:"Durable"}),(0,o.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"03"}),(0,o.jsx)("strong",{children:"Archive"}),(0,o.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,o.jsxs)("div",{className:`${n}-memory-health`,role:"status",children:[(0,o.jsx)("span",{children:"\u25C7"}),(0,o.jsxs)("div",{children:[(0,o.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,o.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,o.jsxs)("div",{className:`${n}-memory-toolbar`,children:[(0,o.jsx)("div",{className:`${n}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([w,A])=>(0,o.jsx)("button",{type:"button","data-active":r===w,onClick:()=>s(w),children:A},w))}),(0,o.jsx)("input",{type:"search",value:h,onChange:w=>p(w.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,o.jsxs)("select",{value:c,onChange:w=>d(w.target.value),"aria-label":"Filter memories by resident",children:[(0,o.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(w=>(0,o.jsx)("option",{value:w.id,children:w.name},w.id))]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&r!=="durable"&&O.length>0?(0,o.jsxs)("section",{className:`${n}-memory-section`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,o.jsx)("h3",{children:"Passing recollections"})]}),(0,o.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,o.jsx)("div",{className:`${n}-memory-grid`,children:O.map(w=>{let A=w.evidence[w.evidence.length-1]??{visitId:w.visitId,lineIds:[]};return(0,o.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"passing",children:[(0,o.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${n}-memory-pill`,children:"Passing"}),(0,o.jsx)("span",{children:jk(w.expiresAt,V)})]}),(0,o.jsx)("p",{className:`${n}-memory-text`,children:w.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:bu(w.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:bu(w.knownBy)})]})]}),w.reinforcementCount>0?(0,o.jsxs)("p",{className:`${n}-memory-reinforced`,children:["\u21BB Reinforced ",w.reinforcementCount," ",w.reinforcementCount===1?"time":"times"]}):null,(0,o.jsxs)("div",{className:`${n}-memory-card-actions`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>{v(A.visitId,A.lineIds)},children:"View evidence"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>i("recollections",w.id),children:"Let go"})]})]},w.id)})})]}):null,e&&r!=="passing"&&S.length>0?(0,o.jsxs)("section",{className:`${n}-memory-section`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,o.jsx)("h3",{children:"Durable memories"})]}),(0,o.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,o.jsx)("div",{className:`${n}-memory-grid`,children:S.map(w=>(0,o.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"durable",children:[(0,o.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${n}-memory-pill`,children:w.memoryCategory?dx[w.memoryCategory]:w.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,o.jsxs)("span",{children:[w.dateLabel,P1(w)?` \xB7 ${P1(w)}`:""]})]}),(0,o.jsx)("p",{className:`${n}-memory-text`,children:w.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:bu(w.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:bu(w.knownBy)})]})]}),(0,o.jsxs)("div",{className:`${n}-memory-card-actions`,children:[w.evidence?(0,o.jsx)("button",{type:"button",onClick:()=>{v(w.evidence.visitId,w.evidence.lineIds)},children:"View evidence"}):(0,o.jsx)("span",{className:`${n}-memory-legacy`,children:"No evidence link on this older memory"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>i("durable",w.id),children:"Forget"})]})]},w.id))})]}):null,e&&(r!=="durable"&&O.length||r!=="passing"&&S.length)===0?(0,o.jsxs)("div",{className:`${n}-memory-empty`,children:[(0,o.jsx)("span",{children:"\u2727"}),(0,o.jsx)("h3",{children:"No memories match"}),(0,o.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,o.jsxs)("p",{className:`${n}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,f?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:f}):null,b?(0,o.jsxs)("section",{className:`${n}-memory-evidence`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,o.jsxs)("h3",{children:["Exact evidence \xB7 ",b.visit.placeName]})]}),(0,o.jsx)("button",{type:"button",onClick:()=>$(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,o.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,o.jsx)("ol",{children:b.visit.lines.filter(w=>b.lineIds.includes(w.id)).map(w=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:w.name||"Player"}),(0,o.jsxs)("small",{children:[xu(w.at)," \xB7 heard by"," ",w.heardBy.map(A=>b.visit.participants.find(_=>_.characterId===A)?.name??A).join(", ")||"no one"]})]}),$s(w.content,`memory-evidence-${w.id}-`)]},w.id))})]}):null]})}function xu(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":px.format(t)}function P1(e){return xu(e.occurredAt)}function Gk(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function X1(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function wg(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var Pk=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function Xk(e,t){let a=[],i=Date.parse(e);if(Number.isFinite(i)){let s=Math.floor((Date.now()-i)/864e5);a.push(s<=0?"written today":s===1?"written yesterday":`written ${s} days ago`)}let r=Date.parse(t);return a.push(Number.isFinite(r)?`fades ${Pk.format(new Date(r))}`:"no set end"),a.join(" \xB7 ")}function Zk(e,t){let a=e.find(i=>i.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.zoneId&&a.zones?a.zones.find(i=>i.id===t.zoneId)?.image?.url??"":t.area==="private"?a.privateSpaces?.find(i=>i.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?dn(a,t.spaceClass).image:null)?.url??"":""}var Eg=class extends m.Component{constructor(){super(...arguments);kc(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let i=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=i,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:i},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,o.jsx)("div",{className:`${n}-root`,role:"alert",children:(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h1",{className:`${n}-panel-title`,children:"Villages could not open"}),(0,o.jsx)("p",{className:`${n}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},xg=`
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
.${n}-root {
  --${n}-pad: clamp(.625rem, 2cqw, 1.25rem);
  --${n}-gap: clamp(.5rem, 1.4cqw, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--${n}-gap);
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: var(--${n}-pad);
  color: var(--foreground);
}
.${n}-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: .75rem; }
.${n}-title { margin: 0; font-size: 1.5rem; font-weight: 600; letter-spacing: -.01em; }
.${n}-subtitle { margin: .125rem 0 0; font-size: .75rem; color: var(--muted-foreground); }
.${n}-panel {
  border: 1px solid var(--border);
  border-radius: .75rem;
  background: var(--popover);
  padding: .875rem 1rem;
}
.${n}-panel-title { margin: 0 0 .625rem; font-size: .6875rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-foreground); }
.${n}-villagers { display: grid; gap: .625rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
.${n}-villager { display: flex; gap: .625rem; align-items: flex-start; }
.${n}-avatar {
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
.${n}-avatar > img { display: block; width: 100%; height: 100%; object-fit: cover; }
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
.${n}-person { width: 1.5em; height: 1.5em; }
.${n}-villager-name { font-size: .8125rem; font-weight: 600; }
.${n}-villager-role { font-size: .6875rem; color: var(--muted-foreground); }
.${n}-villager-note { margin: .375rem 0 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${n}-notices { margin: 0; padding-left: 1.1rem; display: grid; gap: .375rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-actions { display: flex; align-items: center; gap: .625rem; }
.${n}-button {
  border: 1px solid var(--border);
  border-radius: .5rem;
  background: var(--background);
  color: var(--foreground);
  padding: .3125rem .625rem;
  font-size: .75rem;
  cursor: pointer;
}
.${n}-button:hover { border-color: var(--primary); color: var(--primary); }
.${n}-button:disabled { opacity: .6; cursor: default; }
.${n}-button[data-active="true"] {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px var(--primary);
}
/*
  The menu's options, gathered under headings rather than strung out in one row:
  everything that shows you the village under Village Management, and everything
  that changes how it behaves under General Settings. More groups are expected.
*/
.${n}-menu-nav { display: flex; flex-direction: column; gap: .875rem; }
.${n}-menu-group { display: flex; flex-direction: column; gap: .375rem; }
.${n}-menu-group > .${n}-panel-title { margin: 0; }
.${n}-menu-group-buttons { display: flex; flex-wrap: wrap; gap: .5rem; }
.${n}-menu-body { display: flex; flex-direction: column; gap: 1rem; }
.${n}-roster { display: flex; flex-direction: column; gap: .375rem; margin-top: .75rem; }
.${n}-roster-entry { min-width: 0; border: 1px solid var(--border); border-radius: .75rem; padding: .5rem .625rem; background: color-mix(in srgb, var(--popover) 92%, transparent); }
.${n}-roster-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; font-size: .75rem; }
.${n}-roster-row > div:first-child { flex: 1 1 10rem; min-width: 0; }
.${n}-roster-row > .${n}-villager-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${n}-status { font-size: .75rem; color: var(--muted-foreground); }
.${n}-error { font-size: .75rem; color: var(--destructive, #e5484d); }
.${n}-tile {
  display: flex; flex-direction: column; gap: .25rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--background); color: inherit;
  padding: .625rem .75rem; cursor: pointer; font: inherit;
}
.${n}-tile:hover { border-color: var(--primary); }
.${n}-tile[data-selected="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${n}-tile-head { display: flex; align-items: center; gap: .5rem; }
.${n}-tile-name { font-size: .8125rem; font-weight: 600; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${n}-tile-summary { margin: 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${n}-tile-meta { display: flex; flex-wrap: wrap; gap: .375rem; align-items: center; font-size: .6875rem; color: var(--muted-foreground); }
.${n}-badge {
  border-radius: 999px; padding: .0625rem .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  color: var(--destructive, #e5484d); font-size: .625rem;
}
.${n}-tag { border: 1px solid var(--border); border-radius: 999px; padding: .0625rem .375rem; font-size: .625rem; }
.${n}-remove {
  flex: 0 0 auto; border: 1px solid var(--border); border-radius: .375rem;
  background: transparent; color: var(--muted-foreground);
  font-size: .6875rem; line-height: 1; padding: .25rem .375rem; cursor: pointer;
}
.${n}-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
.${n}-empty { margin: 0; font-size: .75rem; line-height: 1.55; color: var(--muted-foreground); }
.${n}-search {
  width: 100%; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}
.${n}-picker-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; max-height: 16rem; overflow-y: auto; }
.${n}-picker-item { display: flex; align-items: center; gap: .625rem; border: 1px solid var(--border); border-radius: .5rem; padding: .5rem .625rem; }
.${n}-picker-item[data-resident="true"] { opacity: .6; }
.${n}-picker-text { flex: 1 1 auto; min-width: 0; }
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
.${n}-chat {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column; gap: .75rem;
  min-height: 0;
  border-left: 0; border-radius: 0;
  background: var(--popover); padding: .875rem;
  transform: translateX(100%);
  visibility: hidden;
  transition: transform .28s ease, visibility 0s linear .28s;
}
.${n}-chat[data-open="true"] {
  transform: translateX(0);
  visibility: visible;
  transition: transform .28s ease;
}
.${n}-room-screen {
  position: relative; display: flex; height: 100%; min-height: 0; overflow: hidden;
}
.${n}-room-screen > .${n}-chat {
  position: relative; inset: auto; flex: 1 1 auto; min-width: 0;
  box-sizing: border-box; overflow: hidden; transform: none; visibility: visible; transition: none;
}
.${n}-room-screen .${n}-chat-scene { pointer-events: none; }
.${n}-room-screen .${n}-chat-head {
  align-items: center;
}
.${n}-room-screen .${n}-chat-actions {
  width: 100%; justify-content: flex-end; margin-left: 0;
}
.${n}-room-stars {
  position: absolute; z-index: 4; top: 4.25rem; left: .875rem;
  display: grid; gap: .4rem; width: min(20rem, calc(100% - 1.75rem));
  max-height: min(40vh, 18rem); overflow-y: auto; pointer-events: auto;
}
.${n}-room-star {
  display: flex; align-items: flex-start; gap: .5rem; padding: .55rem .65rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--surface)); color: var(--text);
  box-shadow: 0 .25rem 1rem #0003; font-size: .82rem; line-height: 1.35;
}
.${n}-room-star > span:first-child { color: #e5b13e; font-size: 1.2rem; line-height: 1; }
.${n}-room-star > span:nth-child(2) { flex: 1; }
.${n}-room-star button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${n}-room-star-dismiss { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; margin: -.5rem -.55rem -.5rem 0; font-size: 1.2rem !important; line-height: 1; }
.${n}-room-star button:focus-visible { outline: 2px solid currentColor; border-radius: .2rem; }
@media (max-width: 600px) {
  .${n}-room-stars { top: 4.75rem; left: .625rem; width: min(19rem, calc(100% - 1.25rem)); max-height: 32vh; }
}
@media (prefers-reduced-motion: reduce) {
  .${n}-chat, .${n}-chat[data-open="true"] { transition: none; }
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
.${n}-chat > .${n}-chat-stage,
.${n}-chat > .${n}-chat-activities,
.${n}-chat > .${n}-chat-vn,
.${n}-chat > .${n}-chat-confirm,
.${n}-chat > .${n}-error,
.${n}-chat > .${n}-room-error,
.${n}-chat > .${n}-composer,
.${n}-chat > .${n}-chat-ended { position: relative; z-index: 1; }
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
.${n}-chat-head {
  position: absolute; top: .875rem; left: .875rem; right: .875rem; z-index: 3;
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: .375rem;
  pointer-events: none;
}
.${n}-chat-head > * { pointer-events: auto; }
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
.${n}-chat-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; margin-left: auto; }
.${n}-chat-menu-anchor { position: relative; display: inline-flex; }
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
.${n}-chat-menu-button {
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
.${n}-chat-menu-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${n}-chat-menu-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${n}-chat-menu-button svg { width: 1rem; height: 1rem; }
/*
  The same button shape, for the one press that has a word on it.

  A card that has gone from the library draws Close instead of the options menu,
  and it is drawn in the chrome rather than in the row below because there is
  nowhere else for it to be. It wears the toolbar's own surface so that the one
  control in the top chrome is the same control whether it is a glyph or a word.
*/
.${n}-chat-tool {
  min-height: 2rem; box-sizing: border-box;
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
}
.${n}-chat-tool:hover {
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
.${n}-chat-menu {
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
.${n}-chat-menu-note {
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
.${n}-chat-menu .${n}-button { width: 100%; justify-content: flex-start; text-align: left; }
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
.${n}-chat-debug {
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
.${n}-chat-end {
  position: absolute; left: 50%; bottom: calc(100% + .375rem);
  transform: translateX(-50%);
  display: flex; justify-content: center;
}
.${n}-chat-end > .${n}-button {
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: 999px; padding: .3125rem .875rem;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .4);
}
.${n}-chat-end > .${n}-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${n}-button-quiet { border-color: transparent; background: transparent; color: var(--muted-foreground); }
.${n}-button-quiet:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  The debug action's question, drawn under the button that raised it rather than
  over the whole tab. It belongs beside the control it is about \u2014 a modal would
  put the map, the drawer and the player's own words behind a sheet of grey to
  ask one question about one button \u2014 and it is drawn in the destructive colour
  so that the question and the thing it is asking about read as one action.
*/
.${n}-chat-confirm {
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .5rem; padding: .5rem .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 10%, transparent);
}
.${n}-chat-confirm-note { margin: 0; font-size: .6875rem; line-height: 1.5; color: var(--foreground); }
.${n}-chat-confirm-row { display: flex; flex-wrap: wrap; gap: .375rem; }
.${n}-image-recommendation { color: #d68a18; }
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
.${n}-chat[data-ended="true"] .${n}-composer { display: none; }
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
.${n}-chat[data-greeting="writing"] .${n}-composer { display: none; }
.${n}-chat[data-greeting="failed"] .${n}-composer { display: none; }
.${n}-chat-ended {
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
.${n}-chat-scene {
  position: absolute; inset: 0; z-index: 0;
  min-height: 0;
  background: var(--muted, rgba(127, 127, 127, .08));
  overflow: hidden;
}
.${n}-chat-scene-backdrop {
  position: absolute; inset: 0; display: block;
  width: 100%; height: 100%; object-fit: cover;
}
.${n}-chat-scene-placeholder {
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
.${n}-chat-scrim {
  position: absolute; inset: 0; display: block;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--background) 55%, transparent) 0%,
    color-mix(in srgb, var(--background) 40%, transparent) 42%,
    color-mix(in srgb, var(--background) 45%, transparent) 72%,
    color-mix(in srgb, var(--background) 60%, transparent) 100%
  );
}
.${n}-chat-vignette {
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
.${n}-chat-stage {
  flex: 1 1 34cqh; min-height: 0;
  container-type: size;
  display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
  gap: .375rem;
  padding-bottom: .25rem;
}
.${n}-chat-activities {
  max-width: min(90%, 42rem); max-height: 5rem; overflow-y: auto;
  flex: 0 0 auto; align-self: center;
  display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem;
  color: var(--foreground); font-size: .6875rem; line-height: 1.4;
}
.${n}-chat-activity {
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
.${n}-chat-vn {
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
.${n}-chat-figure {
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
.${n}-chat-figure > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${n}-chat-figure[data-sprite="true"] { width: min(35cqw, 23rem); height: min(65cqh, 35rem); aspect-ratio: auto; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${n}-chat-figure[data-sprite="true"] > img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.${n}-chat-figure[data-sprite="true"][data-framing="half"] { overflow: hidden; height: min(54cqh, 25rem); }
.${n}-chat-figure[data-sprite="true"][data-framing="half"] > img { object-fit: cover; object-position: center top; }
.${n}-sprite-editor { min-width: 0; border-top: 1px solid var(--border); padding: 1rem .125rem .25rem; margin-top: .625rem; display: grid; gap: .875rem; }
.${n}-sprite-heading, .${n}-sprite-section-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: .5rem 1rem; }
.${n}-sprite-heading h3 { margin: 0; font-size: 1.1rem; }
.${n}-sprite-heading p { margin: .25rem 0 0; color: var(--muted-foreground); font-size: .8125rem; }
.${n}-sprite-count { border: 1px solid var(--border); border-radius: 99rem; padding: .25rem .625rem; white-space: nowrap; font-size: .75rem; }
.${n}-sprite-views { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.${n}-sprite-view { display: grid; gap: .2rem; min-width: 0; text-align: left; border: 1px solid var(--border); border-radius: .7rem; padding: .7rem .8rem; background: var(--popover); color: var(--foreground); cursor: pointer; font: inherit; }
.${n}-sprite-view span { color: var(--muted-foreground); font-size: .75rem; }
.${n}-sprite-view[data-active="true"], .${n}-sprite-choice[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, var(--popover)); box-shadow: inset 0 0 0 1px var(--primary); }
.${n}-sprite-section-head { color: var(--foreground); font-size: .8125rem; }
.${n}-sprite-section-head span { color: var(--muted-foreground); }
.${n}-sprite-choices { display: grid; grid-template-columns: repeat(auto-fill, minmax(6.25rem, 1fr)); gap: .5rem; }
.${n}-sprite-choice { display: grid; justify-items: center; gap: .15rem; min-width: 0; border: 1px solid var(--border); border-radius: .65rem; padding: .4rem; background: var(--popover); color: var(--foreground); cursor: pointer; font: inherit; text-transform: capitalize; }
.${n}-sprite-choice-art { display: grid; place-items: center; width: 100%; height: 6rem; border-radius: .4rem; background: color-mix(in srgb, var(--muted) 75%, transparent); color: var(--muted-foreground); font-size: 1.3rem; overflow: hidden; }
.${n}-sprite-choice-art img { display: block; width: 100%; height: 100%; object-fit: contain; }
.${n}-sprite-choice small { color: var(--muted-foreground); font-size: .6875rem; text-transform: none; }
.${n}-sprite-selected { display: flex; align-items: baseline; flex-wrap: wrap; gap: .25rem .75rem; font-size: .8125rem; text-transform: capitalize; }
.${n}-sprite-selected span { color: var(--muted-foreground); text-transform: none; }
.${n}-sprite-editor label { display: grid; gap: .25rem; font-size: .8125rem; }
.${n}-sprite-editor label.${n}-row { display: flex; align-items: center; }
.${n}-sprite-editor textarea { min-height: 5rem; }
.${n}-sprite-actions { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.${n}-sprite-candidate { display: grid; gap: .75rem; border: 1px solid var(--border); border-radius: .7rem; padding: .75rem; background: var(--popover); }
.${n}-sprite-candidate-views { display: flex; flex-wrap: wrap; gap: .75rem; }
.${n}-sprite-candidate-views > div { display: grid; gap: .25rem; justify-items: center; flex: 0 1 12rem; min-width: 0; font-size: .75rem; color: var(--muted-foreground); }
.${n}-sprite-candidate-views img { display: block; width: 100%; height: 14rem; object-fit: contain; background: repeating-conic-gradient(#7773 0 25%, transparent 0 50%) 0 0/20px 20px; }
.${n}-sprite-mirrored { transform: scaleX(-1); }
.${n}-sprite-more { border-top: 1px solid var(--border); padding-top: .5rem; }
.${n}-sprite-more summary { cursor: pointer; font-size: .8125rem; }
.${n}-sprite-more > .${n}-row { margin-top: .75rem; }
.${n}-sprite-view:focus-visible, .${n}-sprite-choice:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
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
.${n}-chat-cast {
  position: relative; z-index: 1;
  display: flex; align-items: flex-end; justify-content: center;
  flex-wrap: nowrap; gap: .375rem;
  width: 100%; height: min(100%, 28rem); min-height: 0;
}
.${n}-chat-cast-person {
  display: flex; flex: 0 1 27%; flex-direction: column; align-items: center; justify-content: flex-end;
  min-width: 0; height: 85%; color: var(--foreground); font-size: .6875rem;
  text-shadow: 0 1px 4px #000, 0 2px 8px #000;
}
.${n}-chat-cast-person[data-active="true"] { flex-basis: 40%; height: 100%; }
.${n}-chat-cast-person > img { display: block; width: 100%; height: calc(100% - 1.5rem); object-fit: contain; object-position: center bottom; filter: drop-shadow(0 .5rem .75rem #0009); }
.${n}-chat-cast-person > img[data-framing="half"] { object-fit: cover; object-position: center top; }
.${n}-chat-cast-person > img[data-facing="left"] { transform: scaleX(-1); }
.${n}-chat-cast-person > .${n}-avatar { width: min(7rem, 100%); height: auto; aspect-ratio: 1; }
.${n}-chat-cast-person > span:not(.${n}-avatar) { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: .15rem .35rem; border-radius: .35rem; background: #0009; }
.${n}-chat-cast-rest { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; max-height: 2rem; overflow-y: auto; }
.${n}-chat-cast-rest > span { display: inline-flex; align-items: center; gap: .2rem; padding: .1rem .35rem; border-radius: .35rem; background: #000a; color: white; font-size: .625rem; }
.${n}-chat-cast-rest .${n}-avatar { width: 1rem; height: 1rem; border-radius: 50%; overflow: hidden; }
.${n}-room-screen .${n}-chat-activities { display: none; }
.${n}-room-screen .${n}-chat-history-toggle { width: auto; height: auto; min-height: 2rem; align-self: center; padding: .2rem .65rem; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .5rem; }
.${n}-room-screen .${n}-chat-vn-text { font-size: .9375rem; line-height: 1.55; }
.${n}-room-screen .${n}-chat-vn-aside-text { font-size: .8125rem; line-height: 1.45; }
/* The plate is what makes the name readable over a picture, so it is drawn
   whether or not there is one behind it: place names are short, and a name that
   changed its contrast depending on the hour would be worse than a plain chip. */
.${n}-chat-scene-place {
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
.${n}-chat-log {
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
.${n}-chat-tab { display: flex; justify-content: center; }
.${n}-chat-history-toggle {
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
.${n}-chat-history-toggle::before { content: ""; position: absolute; inset: -.625rem -.25rem; }
.${n}-chat-history-toggle:hover { color: var(--marinara-chat-chrome-highlight-text, var(--primary)); }
.${n}-chat-history-toggle svg { width: .875rem; height: .875rem; }
.${n}-chat-history-toggle[aria-expanded="true"] {
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
.${n}-chat-vn-card {
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
.${n}-chat-vn-row {
  display: flex; gap: .75rem; min-width: 0; min-height: 0; align-items: flex-start;
  padding: .75rem;
}
.${n}-chat-vn-portrait {
  position: relative; flex: 0 0 auto; align-self: flex-start;
  display: flex; align-items: center; justify-content: center;
  width: min(5rem, 26cqw); aspect-ratio: 1 / 1;
  border-radius: .75rem; border: 1px solid var(--border);
  background: var(--secondary);
  font-size: 1.25rem; font-weight: 600;
  overflow: hidden;
}
.${n}-chat-vn-portrait > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${n}-chat-vn-column { display: flex; flex-direction: column; gap: .5rem; min-width: 0; min-height: 0; align-self: stretch; flex: 1 1 auto; }
.${n}-chat-vn-name {
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
.${n}-chat-vn-reading {
  flex: 0 1 auto; min-height: 0; max-height: min(30cqh, 18rem);
  overflow-y: auto; overscroll-behavior: contain;
  display: flex; flex-direction: column; gap: .375rem;
  padding-right: .25rem;
}
.${n}-chat-vn-reading:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: .25rem; }
.${n}-chat-vn-text {
  margin: 0; font-size: .8125rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${n}-chat-vn-text[data-empty="true"] { color: var(--muted-foreground); }
/*  The sentence a failed greeting is said in. The destructive colour is the one
    the rest of the sheet already uses for something that went wrong rather than
    something the player did, and the words themselves are deliberately plain:
    this is a villager who could not be reached, not a mistake anybody made. */
.${n}-chat-vn-text[data-error="true"] { color: var(--destructive, #e5484d); }
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
.${n}-chat-vn-label {
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
.${n}-chat-vn-asides {
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
.${n}-chat-vn-aside {
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
.${n}-chat-vn-aside[data-register="whisper"] {
  border-color: var(--marinara-chat-chrome-button-border, var(--marinara-chat-chrome-panel-border, var(--border)));
}
.${n}-chat-vn-aside-face {
  position: relative; flex: 0 0 auto; margin-top: .125rem;
  display: flex; align-items: center; justify-content: center;
  width: 1.75rem; height: 1.75rem;
  border-radius: 999px; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--secondary);
  font-size: .6875rem; font-weight: 600;
  overflow: hidden;
}
.${n}-chat-vn-aside-face > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${n}-chat-vn-aside-column { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; }
.${n}-chat-vn-aside-head {
  display: flex; align-items: center; gap: .375rem;
  margin: 0; min-width: 0;
}
.${n}-chat-vn-aside-icon { flex: 0 0 auto; font-size: .5625rem; }
.${n}-chat-vn-aside-name {
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .6875rem; font-weight: 600; line-height: 1.4;
  color: var(--marinara-chat-chrome-highlight-text, var(--foreground));
}
.${n}-chat-vn-aside-target {
  flex: 0 0 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .5625rem; color: var(--muted-foreground);
}
.${n}-chat-vn-aside-text {
  margin: .125rem 0 0; min-width: 0;
  font-size: .75rem; line-height: 1.6; font-style: normal;
  white-space: pre-wrap; overflow-wrap: break-word;
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
}
.${n}-chat-vn-aside[data-register="whisper"] .${n}-chat-vn-aside-text { font-style: italic; }
.${n}-chat-vn-beat {
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
.${n}-chat-md-code {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: .85em; padding: .1em .35em; border-radius: 4px;
  background: rgba(255, 255, 255, .06); border: 1px solid rgba(255, 255, 255, .1);
  color: #e8e6e3; direction: ltr; unicode-bidi: isolate;
}
.${n}-chat-md-link { color: var(--primary); text-decoration: underline; text-underline-offset: .12em; }
.${n}-chat-md-link:hover { opacity: .85; }
.${n}-chat-md-highlight {
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
.${n}-chat-vn-nav {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  padding: .375rem .75rem;
  border-top: 1px solid var(--marinara-chat-chrome-panel-divider, color-mix(in srgb, var(--border) 50%, transparent));
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem;
}
.${n}-chat-vn-counter {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: .6875rem; opacity: .75;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-variant-numeric: tabular-nums;
}
.${n}-chat-vn-button {
  display: inline-flex; align-items: center; gap: .25rem;
  border-radius: .25rem; padding: .25rem .5rem;
  background: transparent;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem; font-family: inherit; cursor: pointer;
  transition: background-color .15s ease;
}
.${n}-chat-vn-button svg { width: .875rem; height: .875rem; }
.${n}-chat-vn-button:hover { background: var(--marinara-chat-chrome-button-bg-hover, color-mix(in srgb, var(--foreground) 10%, transparent)); }
.${n}-chat-vn-button:disabled {
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
.${n}-chat-pending { display: flex; justify-content: flex-start; margin: 0; }
.${n}-chat-spinner {
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
.${n}-visually-hidden {
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
.${n}-msg { max-width: 88%; border-radius: .625rem; padding: .4375rem .625rem; font-size: .75rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word; }
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
.${n}-msg[data-role="assistant"] {
  align-self: flex-start;
  background: linear-gradient(160deg, color-mix(in srgb, var(--primary) 14%, var(--background)), color-mix(in srgb, var(--primary) 6%, var(--background)));
  border: 1px solid var(--border);
}
.${n}-msg[data-role="user"] {
  align-self: flex-end;
  background: linear-gradient(160deg, color-mix(in srgb, #60a5fa 26%, var(--background)), color-mix(in srgb, #60a5fa 13%, var(--background)));
  border: 1px solid color-mix(in srgb, #60a5fa 40%, transparent);
}
.${n}-msg-pending { align-self: flex-start; font-size: .75rem; color: var(--muted-foreground); padding: .25rem .125rem; }
/*
  The judge's sentence, under the reply it produced. It is drawn as a footnote
  rather than a bubble because it is not something anybody said \u2014 it is the
  village's account of whether the player was believed, and the one place the
  player can find out why the answer went the way it did. The rule on the left
  is the whole of it: green for believed, red for not.
*/
.${n}-ruling {
  align-self: stretch; margin: .125rem 0 0; padding: .25rem 0 .25rem .5rem;
  border-left: 2px solid var(--muted-foreground);
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${n}-ruling[data-fulfilled="true"] { border-left-color: var(--primary); color: var(--primary); }
.${n}-ruling[data-fulfilled="false"] { border-left-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
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
.${n}-chat-mode-button {
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
.${n}-chat-mode-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${n}-chat-mode-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${n}-chat-mode-button:disabled { cursor: default; opacity: .5; }
.${n}-chat-mode-button svg { width: 1rem; height: 1rem; }
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
.${n}-chat-modes {
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
.${n}-chat-modes-head {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .4375rem .625rem;
  font-size: .6875rem; font-weight: 600;
}
.${n}-chat-modes-list { display: flex; flex-direction: column; gap: .125rem; padding: .25rem; }
.${n}-chat-mode-item {
  display: flex; align-items: center; gap: .5rem; width: 100%;
  border: 0; border-radius: .5rem; padding: .4375rem .5rem;
  background: transparent; color: inherit;
  font-size: .75rem; font-family: inherit; text-align: left; cursor: pointer;
  transition: background-color .15s ease;
}
.${n}-chat-mode-item:hover { background: color-mix(in srgb, var(--foreground) 10%, transparent); }
.${n}-chat-mode-item[data-active="true"] { font-weight: 600; }
.${n}-chat-mode-item:disabled { cursor: default; opacity: .5; }
.${n}-chat-mode-item-label { flex: 1 1 auto; min-width: 0; }
.${n}-chat-mode-item svg { width: .875rem; height: .875rem; flex: 0 0 auto; }
/*
  The one press in the menu that is not a mode.

  Leaving is a verb of the conversation rather than a way of being answered, so it
  is drawn under a rule at the foot of the list rather than beside the three that
  are: a player scanning the modes should not find walking out among them. It is
  still drawn only where there is a conversation to leave \u2014 see showLeave \u2014 and
  it is the press that spends the goodbye, which is why it is here rather than
  beside the ending that follows it.
*/
.${n}-chat-modes-foot {
  display: flex; flex-direction: column;
  border-top: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .25rem;
}
.${n}-chat-modes-foot > .${n}-button { width: 100%; justify-content: flex-start; text-align: left; }
/*
  Where the player says what they did for somebody.

  This is the third verb's box rather than a panel beside the ordinary one: the
  same composer, with the label and the claim input swapped in for the textarea,
  because a claim is still something being said to this villager and only one
  sentence is on the table at a time. The verbs underneath do not move, so
  changing your mind is pressing Chat and getting your half-written message back
  exactly as you left it \u2014 the draft belongs to the drawer, not to this box.
*/
.${n}-claim { display: flex; flex-direction: column; gap: .375rem; }
.${n}-composer { display: flex; flex-direction: column; gap: .375rem; }
.${n}-textarea {
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
.${n}-composer-row { display: flex; }
.${n}-composer-row > .${n}-claim,
.${n}-composer-row > .${n}-chat-input { flex: 1 1 auto; min-width: 0; }
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
.${n}-chat-input {
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
.${n}-chat-input:focus-within {
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
.${n}-chat-input > .${n}-chat-menu-anchor { position: static; flex: 0 0 auto; }
/*
  The words, and the only thing in the frame that is allowed to change height.

  Its own horizontal padding is gone, because the glyphs beside it hold its two
  edges apart now: the frame's padding is the inset, and a second one inside the
  frame would be two insets for one gap. What is left is the vertical inset that
  keeps the first line off the frame's top edge.
*/
.${n}-chat-input > .${n}-textarea {
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
.${n}-chat-input > .${n}-hint { flex: 1 1 auto; min-width: 0; }
.${n}-chat-send {
  display: inline-flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
  width: 1.75rem; height: 1.75rem; padding: 0; box-sizing: border-box;
  border: 1px solid transparent; border-radius: 999px;
  background: transparent; color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${n}-chat-send:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${n}-chat-send:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${n}-chat-send:disabled { cursor: default; opacity: .45; }
.${n}-chat-send:disabled:hover {
  border-color: transparent; background: transparent;
  color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
}
.${n}-chat-send svg { width: 1rem; height: 1rem; }
.${n}-room-screen .${n}-chat-send {
  width: auto; min-width: 4.5rem; height: 2.75rem; padding: 0 .75rem;
  border-color: var(--primary); border-radius: .75rem;
  background: var(--primary); color: var(--primary-foreground, white);
  font-size: .75rem; font-weight: 700; touch-action: manipulation;
}
.${n}-room-screen .${n}-chat-mode-button {
  width: auto; min-width: 4.5rem; height: 2.25rem; padding: 0 .625rem;
  border-radius: .625rem; font-size: .75rem; font-weight: 700; white-space: nowrap;
}
.${n}-room-screen .${n}-chat-send:hover:not(:disabled) {
  background: var(--primary); color: var(--primary-foreground, white);
}
.${n}-room-screen .${n}-chat-pending { align-items: center; gap: .5rem; }
.${n}-room-screen .${n}-chat-pending-label { font-size: .75rem; }
.${n}-room-modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .375rem; }
.${n}-room-mode {
  min-width: 0; min-height: 2.5rem; padding: .375rem .25rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); color: var(--foreground);
  font: inherit; font-size: .75rem; font-weight: 600; cursor: pointer;
}
.${n}-room-mode[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 18%, var(--popover)); color: var(--primary); }
.${n}-room-mode:disabled { opacity: .5; cursor: default; }
.${n}-room-mode:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${n}-room-error {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .625rem; padding: .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 9%, var(--popover));
  color: var(--destructive, #e5484d); font-size: .75rem;
}
.${n}-room-error p { margin: 0; flex: 1 1 12rem; overflow-wrap: anywhere; }
.${n}-room-error .${n}-button { flex: 0 0 auto; border-color: currentColor; color: inherit; }
.${n}-room-screen .${n}-chat[data-opening-error="true"] .${n}-chat-vn { display: none; }
.${n}-hint { font-size: .625rem; color: var(--muted-foreground); }
/* Said in the colour a warning is said in, so enlarging a small picture is not
   something the player has to notice for themselves. */
.${n}-hint[data-tone="warn"] { color: var(--destructive, #e5484d); }
.${n}-field { display: flex; flex-direction: column; gap: .25rem; margin-top: .625rem; }
.${n}-label { font-size: .6875rem; font-weight: 600; color: var(--muted-foreground); }
/* A switch is the box and its words as one control. Clicking the sentence
   toggles it, which is what every settings list is expected to do. */
.${n}-switch { display: flex; align-items: flex-start; gap: .4375rem; font-size: .75rem; line-height: 1.5; cursor: pointer; }
.${n}-switch[data-disabled="true"] { cursor: default; opacity: .5; }
.${n}-switch input { flex: none; margin: .1875rem 0 0; accent-color: var(--primary); }
.${n}-switch-hours { font-size: .625rem; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
/* Indented under the master switch, because it is what the master switch is
   holding open rather than a second, unrelated question. */
.${n}-switches { display: grid; gap: .25rem; margin-top: .125rem; padding-left: 1.3125rem; }
/*
  The three places a panel opens a scrolling list inside a panel that already
  scrolls. Each ceiling is whichever is smaller: the length it has always had, or
  a share of the tab's height. On any tab big enough for the old number the old
  number is what binds, so nothing on a monitor moves; on a short tab the inner
  box stops being taller than the screen it is on, which is what turns one scroll
  region into two nested ones.
*/
.${n}-preset {
  width: 100%; box-sizing: border-box; resize: vertical;
  min-height: 11rem; max-height: min(24rem, 60cqh);
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .6875rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${n}-macros { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .5rem; }
.${n}-macro {
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--background); color: var(--foreground);
  padding: .1875rem .4375rem; cursor: pointer;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${n}-macro:hover { border-color: var(--primary); color: var(--primary); }
.${n}-macro-help { margin: .5rem 0 0; font-size: .625rem; line-height: 1.55; color: var(--muted-foreground); }
/* A control that is switched off while the village setup flow which will owe it
   is still being written. The prose around it stays at full strength, because
   the reason it is off is the thing worth reading; the control itself is dimmed
   so nobody tries to type into a box that will not take the letters. */
.${n}-off { opacity: .5; }
/*
  A translation prompt, printed verbatim. Monospaced and scrollable, because it
  is read as the thing being worked on rather than as prose: a prompt reflowed
  into a paragraph is a prompt nobody can compare against the one they meant to
  write. The cap is here rather than on the overlay so that a villager with a
  long week cannot push the whole panel off the bottom of the tab.
*/
.${n}-prompt {
  margin: .5rem 0 0; padding: .4375rem .5rem;
  max-height: min(18rem, 55cqh); overflow: auto;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  font-size: .625rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${n}-notice-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-notice-row > span { flex: 1 1 auto; min-width: 0; }
.${n}-notice-author { font-weight: 600; color: var(--foreground); }
.${n}-notice-add { display: flex; gap: .5rem; margin-top: .625rem; }
.${n}-notice-input {
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
.${n}-places { margin: .5rem 0 0; padding: 0; list-style: none; display: grid; gap: .625rem; }
.${n}-place { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .625rem; align-items: start; }
.${n}-place-thumb {
  width: 4.5rem; height: 3rem; display: block; object-fit: cover;
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
/* Empty is drawn as empty \u2014 dashed rather than solid \u2014 so "no picture yet" is
   visibly a state the village is in rather than a picture that failed. */
.${n}-place-thumb[data-empty="true"] { border-style: dashed; }
.${n}-place-body { display: flex; flex-direction: column; gap: .25rem; min-width: 0; }
.${n}-place-name { font-size: .75rem; font-weight: 600; color: var(--foreground); overflow-wrap: break-word; }
/* The buttons hug the name rather than sitting a row's gap below it: the row
   margin is right for a row under a paragraph and wrong for one under a label. */
.${n}-place-body .${n}-row { margin-top: 0; }
.${n}-place-body .${n}-file { font-size: .625rem; }
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
.${n}-venue { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: .875rem; align-items: flex-start; }
.${n}-venue-exterior { flex: 0 1 18rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
.${n}-venue-picture {
  flex: 0 1 18rem; min-width: 0; box-sizing: border-box;
  aspect-ratio: 4 / 3; border-radius: .625rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
.${n}-venue-picture:not([data-empty="true"]) {
  display: block; width: 100%; object-fit: cover; border: 1px solid var(--border);
}
.${n}-venue-picture[data-empty="true"] {
  display: flex; align-items: center; justify-content: center;
  border: 1px dashed var(--border); padding: .5rem; text-align: center;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${n}-venue-body { flex: 1 1 20rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
/* The buttons hug the beat above them rather than sitting a row's margin below it,
   which is the same substitution the places list makes under a name. */
.${n}-venue-body .${n}-row { margin-top: 0; }
/* The look-around is the one paragraph on this screen, so it is set at reading
   size rather than at the sheet's label size. */
.${n}-venue-beat { margin: 0; font-size: .875rem; line-height: 1.65; }
.${n}-venue-page, .${n}-venue-editor-page, .${n}-venue-proposal-page {
  display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;
}
.${n}-venue-hero {
  display: grid; grid-template-columns: minmax(15rem, 30rem) minmax(15rem, 38rem);
  gap: 1rem; align-items: start;
}
.${n}-venue-hero > .${n}-venue-picture,
.${n}-venue-hero > .${n}-venue-image-empty {
  width: 100%; min-height: 0; max-height: 22.5rem; aspect-ratio: 4 / 3;
}
.${n}-venue-context, .${n}-venue-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: 1rem;
}
.${n}-venue-context p, .${n}-venue-card p { margin: 0; }
.${n}-venue-context { align-self: center; }
.${n}-venue-space-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; }
.${n}-venue-card .${n}-venue-space-picture {
  width: 100%; max-width: none; max-height: 16rem; aspect-ratio: 16 / 10;
}
.${n}-venue-image-empty {
  display: grid; place-items: center; width: 100%; min-height: 10rem; max-height: 16rem;
  border: 1px dashed var(--border); border-radius: .625rem; color: var(--muted-foreground);
  background: var(--background); text-align: center; font-size: .75rem;
}
.${n}-venue-visit-picker { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${n}-venue-scene-details { width: 100%; border-top: 1px solid var(--border); padding-top: .5rem; }
.${n}-venue-scene-details summary { cursor: pointer; font-weight: 600; }
.${n}-venue-scene-details[open] { display: flex; flex-direction: column; gap: .625rem; }
@media (max-width: 700px) {
  .${n}-venue-hero { grid-template-columns: 1fr; }
  .${n}-venue-page .${n}-button,
  .${n}-venue-editor-page .${n}-button,
  .${n}-venue-proposal-page .${n}-button { min-height: 2.5rem; }
}
/* Villages' current UI language: dark navy, blue glass surfaces, violet focus.
   These scoped values can become a selectable theme palette in a later release. */
.${n}-root[data-venue-view="true"] {
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
.${n}-root[data-venue-view="true"] > .${n}-header {
  grid-column: 2; grid-row: 1; align-items: center; padding: 1.25rem 1.5rem .75rem;
}
.${n}-root[data-venue-view="true"] .${n}-venue-header-controls { display: flex; flex-direction: column; align-items: flex-end; gap: .5rem; min-width: 0; }
.${n}-root[data-venue-view="true"] .${n}-actions { flex-wrap: wrap; justify-content: flex-end; }
.${n}-venue-move-error { max-width: 27rem; margin: 0; color: #ffb7c1; font-size: .8rem; line-height: 1.4; text-align: right; }
.${n}-root[data-venue-view="true"] .${n}-title { font-size: clamp(1.35rem, 2.4cqw, 2rem); font-weight: 700; }
.${n}-root[data-venue-view="true"] .${n}-subtitle { color: var(--venue-muted); font-size: .88rem; }
.${n}-root[data-venue-view="true"] .${n}-header .${n}-button,
.${n}-venue-back {
  border: 1px solid #6478c1; border-radius: .7rem; background: #142653;
  color: var(--venue-text); padding: .65rem .9rem; font: inherit; cursor: pointer;
}
.${n}-root[data-venue-view="true"] .${n}-header .${n}-button:hover,
.${n}-venue-back:hover { border-color: #aa92ff; background: #203774; }
.${n}-root[data-venue-view="true"] > .${n}-venue-page { display: contents; }
.${n}-venue-zones {
  grid-column: 1; grid-row: 1 / span 2; display: flex; flex-direction: column; gap: .65rem;
  min-height: 0; overflow-y: auto; padding: 1rem .65rem;
  border-right: 1px solid #314782;
  background: radial-gradient(circle at 30% 85%, #274588, transparent 65%), linear-gradient(#10214a, #142a5b);
}
.${n}-venue-back { min-height: 2.7rem; margin: 0 .1rem 1rem; }
.${n}-venue-zone-tab {
  display: flex; align-items: center; gap: .65rem; min-width: 0; width: 100%;
  border: 1px solid transparent; border-radius: .72rem; padding: .45rem;
  background: transparent; color: var(--venue-text); text-align: left; font: inherit; cursor: pointer;
}
.${n}-venue-zone-tab:hover { background: #253b75; }
.${n}-venue-zone-tab[data-active="true"] {
  border-color: #8060ff; background: linear-gradient(105deg, #5139b4, #253c8d);
  box-shadow: 0 0 0 2px #8756ff, 0 0 1.1rem #683cf977;
}
.${n}-venue-zone-tab:focus-visible, .${n}-venue-back:focus-visible,
.${n}-venue-visit:focus-visible { outline: 3px solid #b6a2ff; outline-offset: 2px; }
.${n}-venue-zone-thumb {
  flex: 0 0 3.4rem; display: grid; place-items: center; width: 3.4rem; height: 3.4rem;
  overflow: hidden; border: 1px solid #5570b0; border-radius: .42rem; background: #18254d;
}
.${n}-venue-zone-thumb img { width: 100%; height: 100%; object-fit: cover; }
.${n}-venue-zone-thumb > span { font-size: 1.5rem; color: #b5c3ec; }
.${n}-venue-zone-copy { min-width: 0; }
.${n}-venue-zone-copy strong, .${n}-venue-zone-copy small { display: block; overflow-wrap: anywhere; }
.${n}-venue-zone-copy strong { font-size: .78rem; line-height: 1.3; }
.${n}-venue-zone-copy small { color: var(--venue-muted); font-size: .68rem; line-height: 1.35; }
.${n}-venue-zone-content {
  grid-column: 2; grid-row: 2; display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(16rem, 1fr);
  align-items: start; gap: 1rem; min-width: 0; padding: .75rem 1.5rem 1.5rem;
}
.${n}-venue-zone-main { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.${n}-venue-artwork { overflow: hidden; border: 1px solid var(--venue-border); border-radius: .85rem; background: #0c1732; }
.${n}-venue-artwork img, .${n}-venue-artwork-empty {
  display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover;
}
.${n}-venue-artwork-empty { display: grid; place-items: center; color: var(--venue-muted); text-align: center; }
.${n}-venue-zone-context {
  min-width: 0; border: 1px solid var(--venue-border); border-radius: .8rem;
  background: linear-gradient(145deg, #142753, #101e42); padding: 1rem 1.15rem;
}
.${n}-venue-zone-context h2 { margin: 0 0 .55rem; font-size: 1.2rem; }
.${n}-venue-zone-context p { margin: 0; color: var(--venue-muted); line-height: 1.6; }
.${n}-venue-more { margin-top: 1rem; border: 1px solid var(--venue-border); border-radius: .6rem; padding: .7rem .9rem; }
.${n}-venue-more summary { cursor: pointer; }
.${n}-venue-more p { margin-top: .65rem; }
.${n}-venue-zone-context { display: flex; flex-direction: column; min-height: min(31rem, 63cqh); }
.${n}-venue-kicker { color: #b9c5ff; font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; }
.${n}-venue-zone-stat { display: flex; justify-content: space-between; gap: .65rem; border-top: 1px solid #29447f; margin-top: 1.1rem; padding: 1rem 0 0; }
.${n}-venue-zone-stat span { color: var(--venue-muted); }
.${n}-venue-zone-stat strong { font-weight: 500; text-align: right; }
.${n}-venue-zone-guidance { margin-top: 1rem !important; font-size: .85rem; }
.${n}-venue-visit {
  width: 100%; min-height: 3.25rem; margin-top: auto; border: 0; border-radius: .55rem;
  background: linear-gradient(100deg, #3156e8, var(--venue-accent));
  color: white; font: inherit; font-size: 1rem; font-weight: 700; cursor: pointer;
}
.${n}-venue-visit:disabled { opacity: .48; cursor: default; }
@container (max-width: 48rem) {
  .${n}-root[data-venue-view="true"] { display: flex; flex-direction: column; }
  .${n}-root[data-venue-view="true"] > .${n}-header { order: 0; padding: 1rem; }
  .${n}-root[data-venue-view="true"] .${n}-venue-header-controls { align-items: flex-start; }
  .${n}-root[data-venue-view="true"] .${n}-actions { justify-content: flex-start; }
  .${n}-root[data-venue-view="true"] .${n}-venue-move-error { text-align: left; }
  .${n}-root[data-venue-view="true"] > .${n}-venue-page { order: 1; display: flex; flex-direction: column; margin: 0; }
  .${n}-venue-zones { order: 0; flex-direction: row; overflow-x: auto; overflow-y: hidden; padding: .7rem; border-right: 0; border-bottom: 1px solid #314782; }
  .${n}-venue-back { flex: 0 0 auto; margin: 0; }
  .${n}-venue-zone-tab { flex: 0 0 11rem; }
  .${n}-venue-zone-content { order: 2; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; padding: 1rem; }
  .${n}-venue-zone-main, .${n}-venue-zone-context { width: 100%; box-sizing: border-box; }
  .${n}-venue-zone-context { min-height: 0; gap: .25rem; }
  .${n}-venue-visit { margin-top: 1rem; }
}
/*
  The village story. A flat list under a date heading, scrolled by the overlay
  it sits in, with a monospaced stamp on the memories that carry one. The max
  height is here rather than on the overlay so a very old village cannot push
  the panel taller than the tab.
*/
.${n}-story { margin: 0 0 .75rem; padding: 0; list-style: none; display: grid; gap: .375rem; max-height: min(26rem, 60cqh); overflow-y: auto; }
.${n}-story-day {
  position: sticky; top: 0; z-index: 1; margin: 0 0 .375rem;
  background: var(--background); padding: .125rem 0;
  font-size: .625rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${n}-story-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-story-row > span { flex: 1 1 auto; min-width: 0; }
.${n}-story-meta {
  display: block; margin-bottom: .0625rem;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--muted-foreground);
}
.${n}-story-scope { color: var(--primary); }
/* Villagers \u2192 Memories: a calm library, not a diagnostic table. */
.${n}-villager-submenu {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin: 0 0 1rem;
  padding: .3rem; border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
  border-radius: .85rem; background: color-mix(in srgb, var(--muted) 55%, transparent);
}
.${n}-villager-submenu button {
  display: flex; flex-direction: column; align-items: flex-start; gap: .12rem; min-width: 0;
  border: 0; border-radius: .62rem; padding: .62rem .8rem; background: transparent; color: var(--muted-foreground);
  text-align: left; cursor: pointer; transition: background .16s ease, color .16s ease, box-shadow .16s ease;
}
.${n}-villager-submenu button[data-active="true"] {
  background: var(--background); color: var(--foreground); box-shadow: 0 1px 8px color-mix(in srgb, #000 12%, transparent);
}
.${n}-villager-submenu span { font-size: .8rem; font-weight: 700; }
.${n}-villager-submenu small { overflow: hidden; max-width: 100%; font-size: .64rem; text-overflow: ellipsis; white-space: nowrap; }
.${n}-memory-library { display: flex; flex-direction: column; gap: 1rem; }
.${n}-memory-hero {
  display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(12rem, .8fr); gap: 1rem; padding: 1.15rem;
  overflow: hidden; border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--border)); border-radius: 1rem;
  background:
    radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--primary) 23%, transparent), transparent 37%),
    linear-gradient(145deg, color-mix(in srgb, var(--popover) 95%, transparent), color-mix(in srgb, var(--muted) 62%, transparent));
}
.${n}-memory-kicker { font-size: .62rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--primary); }
.${n}-memory-hero h3 { margin: .28rem 0 .38rem; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.15rem, 3vw, 1.7rem); font-weight: 500; }
.${n}-memory-hero p { max-width: 50rem; margin: 0; color: var(--muted-foreground); font-size: .76rem; line-height: 1.55; }
.${n}-memory-stats { display: grid; grid-template-columns: repeat(3, 1fr); align-self: stretch; gap: .4rem; }
.${n}-memory-stats span { display: flex; flex-direction: column; justify-content: center; min-width: 0; border: 1px solid color-mix(in srgb, var(--border) 72%, transparent); border-radius: .72rem; padding: .62rem .35rem; background: color-mix(in srgb, var(--background) 78%, transparent); text-align: center; color: var(--muted-foreground); font-size: .6rem; }
.${n}-memory-stats strong { color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: 1.28rem; font-weight: 500; }
.${n}-memory-layers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${n}-memory-layers article { display: grid; grid-template-columns: auto 1fr; gap: .05rem .48rem; border: 1px solid var(--border); border-radius: .72rem; padding: .65rem .72rem; background: color-mix(in srgb, var(--background) 74%, transparent); }
.${n}-memory-layers article > span { grid-row: 1 / span 2; color: color-mix(in srgb, var(--primary) 72%, var(--muted-foreground)); font: 700 .58rem/1.35 ui-monospace, monospace; }
.${n}-memory-layers strong { font-size: .7rem; }
.${n}-memory-layers p { margin: 0; color: var(--muted-foreground); font-size: .62rem; line-height: 1.35; }
.${n}-memory-health { display: flex; align-items: center; gap: .7rem; border: 1px solid color-mix(in srgb, #d59a34 50%, var(--border)); border-radius: .72rem; padding: .66rem .78rem; background: color-mix(in srgb, #d59a34 9%, var(--background)); }
.${n}-memory-health > span { color: #d59a34; font-size: 1.2rem; }
.${n}-memory-health > div { flex: 1; min-width: 0; }
.${n}-memory-health strong { font-size: .72rem; }
.${n}-memory-health p { margin: .08rem 0 0; color: var(--muted-foreground); font-size: .62rem; }
.${n}-memory-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${n}-memory-toolbar input { flex: 1 1 12rem; min-width: 0; }
.${n}-memory-toolbar input, .${n}-memory-toolbar select { min-height: 2.25rem; border: 1px solid var(--border); border-radius: .58rem; padding: .42rem .62rem; background: var(--background); color: var(--foreground); font-size: .72rem; }
.${n}-memory-tabs { display: flex; gap: .18rem; border: 1px solid var(--border); border-radius: .6rem; padding: .2rem; background: var(--muted); }
.${n}-memory-tabs button { border: 0; border-radius: .4rem; padding: .38rem .62rem; background: transparent; color: var(--muted-foreground); font-size: .68rem; cursor: pointer; }
.${n}-memory-tabs button[data-active="true"] { background: var(--background); color: var(--foreground); box-shadow: 0 1px 4px color-mix(in srgb, #000 12%, transparent); }
.${n}-memory-section { display: flex; flex-direction: column; gap: .55rem; }
.${n}-memory-section-head { display: flex; align-items: center; justify-content: space-between; gap: .6rem; }
.${n}-memory-section-head > div { display: flex; align-items: center; gap: .48rem; min-width: 0; }
.${n}-memory-section-head h3 { margin: 0; font-size: .78rem; }
.${n}-memory-section-head > span { color: var(--muted-foreground); font-size: .62rem; }
.${n}-memory-orb { display: grid; place-items: center; width: 1.55rem; height: 1.55rem; border-radius: 50%; font-size: .72rem; }
.${n}-memory-orb[data-kind="passing"] { background: color-mix(in srgb, #60a5fa 16%, transparent); color: #60a5fa; }
.${n}-memory-orb[data-kind="durable"] { background: color-mix(in srgb, #e5b94b 17%, transparent); color: #dcae35; }
.${n}-memory-orb[data-kind="archive"] { background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary); }
.${n}-memory-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: .62rem; }
.${n}-memory-card { display: flex; flex-direction: column; gap: .58rem; min-width: 0; border: 1px solid var(--border); border-radius: .82rem; padding: .8rem; background: color-mix(in srgb, var(--popover) 94%, transparent); box-shadow: 0 5px 20px color-mix(in srgb, #000 6%, transparent); }
.${n}-memory-card[data-kind="passing"] { border-left: 3px solid color-mix(in srgb, #60a5fa 72%, var(--border)); }
.${n}-memory-card[data-kind="durable"] { border-left: 3px solid color-mix(in srgb, #e5b94b 78%, var(--border)); }
.${n}-memory-card-top { display: flex; align-items: center; justify-content: space-between; gap: .5rem; color: var(--muted-foreground); font-size: .6rem; }
.${n}-memory-pill { overflow: hidden; border-radius: 999px; padding: .2rem .42rem; background: color-mix(in srgb, var(--primary) 11%, var(--muted)); color: color-mix(in srgb, var(--primary) 82%, var(--foreground)); font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
.${n}-memory-text { margin: 0; color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: .9rem; line-height: 1.45; }
.${n}-memory-card dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .38rem; margin: 0; }
.${n}-memory-card dl > div { min-width: 0; border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent); padding-top: .38rem; }
.${n}-memory-card dt { color: var(--muted-foreground); font-size: .55rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.${n}-memory-card dd { overflow: hidden; margin: .08rem 0 0; font-size: .66rem; text-overflow: ellipsis; }
.${n}-memory-reinforced, .${n}-memory-footnote, .${n}-memory-legacy { margin: 0; color: var(--muted-foreground); font-size: .6rem; }
.${n}-memory-card-actions { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-top: auto; }
.${n}-memory-card-actions button, .${n}-memory-evidence button { border: 0; padding: .18rem 0; background: transparent; color: var(--primary); font-size: .64rem; font-weight: 700; cursor: pointer; }
.${n}-memory-card-actions button:last-child { color: var(--muted-foreground); }
.${n}-memory-empty { display: grid; place-items: center; min-height: 10rem; border: 1px dashed var(--border); border-radius: .82rem; padding: 1rem; text-align: center; color: var(--muted-foreground); }
.${n}-memory-empty span { color: var(--primary); font-size: 1.35rem; }
.${n}-memory-empty h3 { margin: .25rem 0 0; color: var(--foreground); font-size: .82rem; }
.${n}-memory-empty p { margin: .15rem 0 0; font-size: .68rem; }
.${n}-memory-evidence { display: flex; flex-direction: column; gap: .58rem; border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--border)); border-radius: .82rem; padding: .82rem; background: color-mix(in srgb, var(--primary) 4%, var(--background)); }
.${n}-memory-evidence > p { margin: 0; color: var(--muted-foreground); font-size: .64rem; }
.${n}-memory-evidence ol { display: grid; gap: .42rem; margin: 0; padding: 0; list-style: none; }
.${n}-memory-evidence li { border-left: 2px solid color-mix(in srgb, var(--primary) 46%, var(--border)); padding: .45rem .55rem; background: color-mix(in srgb, var(--popover) 88%, transparent); font-size: .72rem; line-height: 1.45; }
.${n}-memory-evidence li > span { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; margin-bottom: .16rem; }
.${n}-memory-evidence small { color: var(--muted-foreground); font-size: .56rem; font-weight: 400; }
@media (max-width: 700px) {
  .${n}-memory-hero { grid-template-columns: 1fr; }
  .${n}-memory-layers { grid-template-columns: 1fr; }
  .${n}-memory-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .${n}-memory-toolbar > input { order: -1; flex-basis: 100%; }
  .${n}-memory-section-head > span { display: none; }
}
.${n}-wish-card {
  padding: .625rem .75rem; border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); font-size: .75rem; line-height: 1.4;
}
.${n}-wish-card p { margin: 0; }
.${n}-wish-card p + p { margin-top: .25rem; }
.${n}-wish-text { color: var(--foreground); font-weight: 600; }
.${n}-wish-tell { color: var(--muted-foreground); }
.${n}-wish-meta { color: var(--muted-foreground); font-size: .6875rem; }
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
.${n}-agenda-notes { margin: 0 0 .625rem; }
.${n}-agenda-notes > summary {
  display: inline-flex; align-items: center; gap: .3125rem;
  list-style: none; cursor: pointer;
}
.${n}-agenda-notes > summary::-webkit-details-marker { display: none; }
.${n}-agenda-notes > summary::marker { content: ""; }
.${n}-agenda-notes[open] > summary { border-color: var(--primary); color: var(--primary); }
.${n}-agenda-notes-body { display: flex; flex-direction: column; gap: .5rem; margin: .4375rem 0 0; }
/*
  A day the Engine's week has nothing in, drawn as an absence. Muted rather than
  coloured and italic rather than plain, because it is the one row in this list
  that is not an event: the label above it is a real day and the hours under it
  really are empty, so the row that says so has to look like a note rather than
  like something a villager is doing.
*/
.${n}-story-blank { color: var(--muted-foreground); font-style: italic; opacity: .75; }
.${n}-row { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: .75rem; }

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
.${n}-week {
  display: block; margin: 0 0 .5rem; padding: .5rem .625rem;
  border: 1px solid var(--border); border-radius: .5rem; background: var(--card);
}
.${n}-week-toggle {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  list-style: none; cursor: pointer;
}
.${n}-week-toggle::-webkit-details-marker { display: none; }
.${n}-week-toggle::marker { content: ""; }
.${n}-week-head {
  flex: 1 1 auto; min-width: 0; margin: 0;
  font-size: .6875rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${n}-week-toggle:hover > .${n}-week-head,
.${n}-week[open] > .${n}-week-toggle > .${n}-week-head { color: var(--primary); }
.${n}-week-body { display: flex; flex-direction: column; margin-top: .5rem; }

.${n}-agenda-list { display: grid; gap: .5rem; }
.${n}-agenda-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin: .75rem 0 .25rem; }
.${n}-agenda-switch { display: inline-flex; align-items: center; gap: .4rem; font-size: .75rem; cursor: pointer; }
.${n}-agenda-switch input { accent-color: var(--primary); }
.${n}-agenda-days { display: grid; gap: .35rem; margin-top: .5rem; }
.${n}-agenda-day { border: 1px solid var(--border); border-radius: .375rem; padding: .35rem .5rem; }
.${n}-agenda-day > summary { cursor: pointer; font-size: .75rem; font-weight: 600; }
.${n}-agenda-compare { display: grid; gap: .75rem; padding-top: .5rem; }
.${n}-agenda-compare[data-comparison="true"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.${n}-agenda-compare section { min-width: 0; }
.${n}-agenda-compare h4 { margin: 0 0 .35rem; font-size: .7rem; color: var(--muted-foreground); }
.${n}-agenda-blocks { display: grid; gap: .3rem; margin: 0; padding: 0; list-style: none; }
.${n}-agenda-blocks li { display: grid; grid-template-columns: 7.2rem minmax(0, 1fr); gap: .1rem .5rem; padding: .4rem .5rem; border-radius: .3rem; background: var(--muted); font-size: .7rem; line-height: 1.35; }
.${n}-agenda-blocks time { grid-row: span 4; white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--muted-foreground); }
.${n}-agenda-blocks strong { font-weight: 600; }
@container ${n} (max-width: 35rem) {
  .${n}-agenda-compare[data-comparison="true"] { grid-template-columns: minmax(0, 1fr); }
  .${n}-agenda-blocks li { grid-template-columns: minmax(0, 1fr); }
  .${n}-agenda-blocks time { grid-row: auto; }
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
.${n}-home {
  gap: calc(var(--${n}-gap) * .75);
  padding: calc(var(--${n}-pad) * .8);
  overflow-y: auto;
}
.${n}-home-body { display: flex; flex-wrap: wrap; align-items: flex-start; gap: .75rem; }
.${n}-setup-map-shell { position: relative; flex: 1 1 26rem; min-width: 0; }
.${n}-setup-map-viewport {
  width: 100%; overflow: auto; border: 2px solid color-mix(in srgb, var(--primary) 45%, var(--border));
  border-radius: .875rem; background: color-mix(in srgb, var(--popover) 80%, #111827);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent), 0 .75rem 2rem rgba(0, 0, 0, .3);
}
.${n}-setup-map-viewport > .${n}-stage:not(.${n}-stage-compact) { width: 100%; flex: none; border: 0; }
.${n}-home-map-viewport { flex: 1 1 auto; min-width: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: visible; }
.${n}-reason-options { display: flex; flex-wrap: wrap; gap: .5rem .875rem; margin-top: .375rem; }
.${n}-field:where(fieldset) { border: 0; padding: 0; min-width: 0; }
.${n}-reason-option { display: inline-flex; align-items: center; gap: .35rem; font-size: .75rem; cursor: pointer; }
.${n}-debug-label { color: #ff465f; font-weight: 800; letter-spacing: .06em; }
.${n}-side { display: flex; flex-direction: column; gap: .75rem; flex: 1 1 18rem; min-width: 0; }
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
.${n}-home-full {
  --${n}-map-wood: .75rem;
  --${n}-map-mat: .5rem;
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
.${n}-room {
  position: relative;
  flex: 1 1 auto; min-width: 0; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  padding: calc(var(--${n}-map-wood) + var(--${n}-map-mat) + 1px);
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
.${n}-home-full .${n}-stage {
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
.${n}-home-full .${n}-stage:not([data-shaped="true"]) { width: 100%; }
.${n}-home-full .${n}-canvas {
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
.${n}-home-full .${n}-stage::before,
.${n}-home-full .${n}-stage::after {
  content: "";
  position: absolute;
  z-index: -1;
  pointer-events: none;
}
.${n}-home-full .${n}-stage::before {
  inset: calc(-1 * (var(--${n}-map-wood) + var(--${n}-map-mat)));
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
.${n}-home-full .${n}-stage::after {
  inset: calc(-1 * var(--${n}-map-mat));
  border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 86%, #c08b4e);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .22);
}
.${n}-places-picker { position: relative; pointer-events: auto; }
.${n}-places-list {
  position: absolute; top: calc(100% + .375rem); left: 0; z-index: 10;
  display: flex; flex-direction: column; gap: .375rem;
  min-width: min(19rem, 80vw); max-width: min(24rem, 90vw); max-height: 60vh; overflow: auto;
  padding: .5rem; border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${n}-places-list-row { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${n}-places-list-name { flex: 1 1 100%; font-size: .8125rem; font-weight: 600; }
/* A button whose whole content is a drawn glyph: square, with the glyph centred
   in it rather than sitting on a text baseline it has none of. */
.${n}-icon-button {
  display: inline-flex; align-items: center; justify-content: center;
  padding: .3125rem; line-height: 0;
}
.${n}-icon-button svg { display: block; width: 1rem; height: 1rem; }
/*
  Anything that went wrong, said in the corner rather than in a bar: there is no
  footer on the map, so this is the only place it can be said, and it is only
  ever there while there is something to say.

  It belongs to the picture, so it stays in the frame's lower corner while the
  clock and controls stay above the map.
*/
.${n}-notice {
  position: absolute; bottom: .5rem; left: .5rem; z-index: 2;
  display: flex; flex-direction: column; gap: .375rem;
  max-width: min(30rem, 75%); pointer-events: none;
}
.${n}-notice .${n}-status,
.${n}-notice .${n}-error {
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
.${n}-news { position: relative; }
.${n}-news-toggle { display: inline-flex; align-items: center; gap: .3125rem; list-style: none; }
.${n}-news-toggle svg { display: block; flex: 0 0 auto; width: 1rem; height: 1rem; }
/* The browser's own disclosure triangle: a character that cannot be sized,
   coloured or placed with the rest of the button. The button is the affordance;
   a marker on top of it is a second one saying the same thing. */
.${n}-news-toggle::-webkit-details-marker { display: none; }
.${n}-news-toggle::marker { content: ""; }
.${n}-news[open] > .${n}-news-toggle { border-color: var(--primary); color: var(--primary); }
.${n}-news-panel {
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
.${n}-news-title {
  margin: 0; font-size: .6875rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .04em;
  color: var(--muted-foreground);
}
.${n}-news-list { margin: 0; padding: 0; list-style: none; display: grid; gap: .375rem; }
.${n}-news-item { font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-news-empty {
  margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground);
}
.${n}-mapbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .5rem .625rem;
}
.${n}-mapbar-title { font-size: .8125rem; font-weight: 600; }
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
.${n}-stage {
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
.${n}-stage:not([data-shaped="true"]) { min-height: 14rem; }
/* A stand-in for the map rather than the map itself: the same picture at the same
   shape, small enough to sit beside a column of prose. */
.${n}-stage-compact { flex: 0 1 auto; width: min(100%, 22rem); align-self: center; }
.${n}-canvas { position: absolute; inset: 0; }
.${n}-stage[data-empty="true"] .${n}-canvas {
  background:
    radial-gradient(circle at 20% 28%, color-mix(in srgb, var(--primary) 12%, transparent) 0 2%, transparent 2.25%),
    radial-gradient(circle at 73% 68%, color-mix(in srgb, var(--primary) 10%, transparent) 0 3%, transparent 3.25%),
    linear-gradient(24deg, transparent 47%, color-mix(in srgb, var(--border) 65%, transparent) 48% 52%, transparent 53%),
    color-mix(in srgb, var(--muted) 55%, var(--background));
}
.${n}-canvas-empty {
  position: absolute; right: .625rem; bottom: .5rem;
  color: var(--muted-foreground); font-size: .6875rem;
}
.${n}-canvas[data-placing="true"] { cursor: crosshair; }
.${n}-canvas[data-dragging="true"] { cursor: grabbing; }
.${n}-stage[data-framing="true"] .${n}-canvas { cursor: grab; touch-action: none; }
.${n}-stage[data-framing="true"] .${n}-canvas[data-dragging="true"] { cursor: grabbing; }
.${n}-canvas-img {
  display: block; width: 100%; height: 100%;
  object-fit: contain;
  user-select: none;
}
/*
  The framing editor's controls. Sat outside the frame rather than in it so a
  press on one of them is not also the start of a drag, and drawn small at the
  foot of the frame so what they change stays visible while they change it.
*/
.${n}-zoom {
  position: absolute; right: .5rem; bottom: .5rem; z-index: 3;
  display: flex; gap: .25rem;
}
.${n}-zoom-button {
  border: 1px solid var(--border); border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 92%, transparent);
  color: inherit; font: inherit; font-size: .6875rem; line-height: 1;
  padding: .3125rem .4375rem; cursor: pointer;
}
.${n}-zoom-button:disabled { opacity: .5; cursor: default; }
.${n}-canvas-missing {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  padding: 1rem; text-align: center; font-size: .8125rem; line-height: 1.45;
  color: var(--muted-foreground);
}
.${n}-pin-holder { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; gap: .125rem; }
.${n}-pin {
  display: flex; align-items: center; gap: .25rem;
  border: 1px solid var(--primary); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground);
  padding: .125rem .4375rem .125rem .25rem;
  font: inherit; font-size: .6875rem; line-height: 1.6; cursor: pointer;
  white-space: nowrap;
}
.${n}-pin:hover { color: var(--primary); }
.${n}-pin:disabled { cursor: default; color: var(--muted-foreground); }
.${n}-pin[data-selected="true"] { box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 45%, transparent); }
.${n}-pin[data-tone="player"] { border-color: var(--primary); }
.${n}-pin[data-tone="empty"] {
  border-style: dashed; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
/*
  A place that is not a house: a shop, a harbour, the mill pond. The plainest
  thing on the map, in the ordinary border colour, because all it has to do is be
  read \u2014 there is nothing behind it to press yet.
*/
.${n}-pin[data-tone="venue"] { border-color: var(--border); }
/*
  Somebody standing at a place rather than the place itself.

  Dimmer than the building and drawn without the tack, because the tack is what
  says "there is a building here" and two things on one spot both claiming to be
  the building is the map lying about one of them. The building keeps its pin and
  the people hang underneath it, which is also the order the two answers arrive in:
  what is here, then who.
*/
.${n}-pin[data-kind="person"] {
  border-style: dotted; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
.${n}-pin[data-kind="person"] .${n}-pin-tack { display: none; }
/*
  A thumbtack, because that is what the thing on a map is: something pushed
  through the paper to say a building is here. Drawn rather than taken from a
  font or an emoji, so it is the same tack on every machine the Engine runs on.
*/
.${n}-pin-tack { flex: 0 0 auto; width: 1rem; height: 1rem; color: var(--destructive, #e5484d); }
.${n}-pin-tack svg { display: block; width: 100%; height: 100%; fill: currentColor; }
.${n}-pin[data-tone="empty"] .${n}-pin-tack { color: var(--muted-foreground); }
.${n}-pin-remove {
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent); color: var(--muted-foreground);
  font-size: .625rem; line-height: 1; padding: .125rem .25rem; cursor: pointer;
}
.${n}-pin-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
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
.${n}-pin-resume {
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
.${n}-doors {
  position: absolute; z-index: 4;
  transform: translate(-50%, 2.75rem);
  display: flex; flex-direction: column; align-items: stretch; gap: .1875rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: color-mix(in srgb, var(--popover) 96%, transparent);
  padding: .25rem;
  box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${n}-door {
  white-space: nowrap; cursor: pointer;
  font: inherit; font-size: .6875rem; line-height: 1.6;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground); padding: .125rem .625rem;
}
.${n}-door:hover { border-color: var(--primary); color: var(--primary); }
/* A card, whether it is the wizard's questions or an option open in the Menu. */
.${n}-overlay {
  display: flex; flex-direction: column; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .875rem 1rem;
}
.${n}-overlay-head { display: flex; align-items: center; gap: .5rem; }
.${n}-overlay-head > .${n}-panel-title { flex: 1 1 auto; margin: 0; }

/* The founding wizard. */
.${n}-setup-root {
  box-sizing: border-box; container-type: inline-size; overflow-x: hidden; overflow-y: auto;
  --background: #121936; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  background: radial-gradient(circle at 12% 95%, #263978, #111832 50%, #0e1430);
  color: #f3f3ff;
}
.${n}-setup-body { flex-wrap: nowrap; align-items: stretch; }
.${n}-setup-body { flex: 0 0 auto; min-height: 0; }
.${n}-setup-body > .${n}-side { flex: 1 1 34rem; }
.${n}-setup-visual {
  display: flex; flex-direction: column; gap: .6rem; flex: 1 1 19rem; min-width: 0; min-height: 0;
}
.${n}-setup-visual > .${n}-setup-map-shell { flex: 1 1 auto; min-height: 0; }
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
.${n}-setup-footer { display: flex; gap: .65rem; min-height: 2.75rem; }
.${n}-setup-footer > .${n}-button { flex: 1 1 0; min-width: 0; }
.${n}-setup-footer > .${n}-setup-forward {
  border-color: #7584ff; background: linear-gradient(135deg, #6077ff, #7365ed);
  color: #fff; font-weight: 700;
}
.${n}-setup-rail {
  flex: 0 0 10rem; display: flex; flex-direction: column; gap: .4rem;
  padding: .75rem .25rem; color: var(--muted-foreground);
}
.${n}-setup-rail-step {
  display: flex; align-items: center; gap: .65rem; padding: .4rem .25rem;
  font-size: .78rem; line-height: 1.35; opacity: .75;
}
.${n}-setup-rail-step[data-active="true"] { color: var(--foreground); opacity: 1; font-weight: 700; }
.${n}-setup-rail-step[data-done="true"] { opacity: 1; }
.${n}-setup-rail-number {
  display: grid; place-items: center; flex: 0 0 2rem; height: 2rem;
  border: 1px solid var(--border); border-radius: 50%; font-weight: 700;
}
.${n}-setup-rail-step[data-active="true"] .${n}-setup-rail-number {
  border-color: #bca5ff; background: linear-gradient(135deg, #7663f6, #446ee9);
  box-shadow: 0 0 .85rem #9878f1a8; color: #fff;
}
.${n}-setup-kicker { margin: 0; color: var(--muted-foreground); font-size: .78rem; }
.${n}-setup-body {
  --background: #151d3b; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  gap: .75rem; align-items: stretch; color: var(--foreground);
}
.${n}-setup-body > .${n}-side { flex-basis: 35rem; min-height: 0; }
.${n}-setup-body .${n}-overlay {
  gap: .2rem; padding: .65rem .8rem; border-color: #5268b8; border-radius: 1rem;
  background: linear-gradient(145deg, #182044, #101831);
  box-shadow: inset 0 0 2rem #27347866;
}
.${n}-setup-body .${n}-panel-title {
  font-size: clamp(1.25rem, 1.8vw, 1.65rem); color: #f5f5ff;
}
.${n}-setup-body .${n}-field { margin-top: .15rem; }
.${n}-setup-body[data-step="1"] .${n}-overlay { height: 100%; min-height: 0; overflow: hidden; }
.${n}-setup-body .${n}-search,
.${n}-setup-body .${n}-textarea,
.${n}-setup-body .${n}-select,
.${n}-setup-body .${n}-notice-input {
  background: #1c254a; border-color: #7082cf; color: #f2f4ff;
}
.${n}-setup-beginning-textarea { min-height: 4.5rem; }
.${n}-setup-form-field { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .35rem .6rem; align-items: start; }
.${n}-setup-form-field > .${n}-label { padding-top: .55rem; }
.${n}-setup-form-field > .${n}-hint { grid-column: 2; }
.${n}-setup-place-spaces { display: grid; gap: .65rem; }
.${n}-setup-place-space { display: grid; gap: .4rem; border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .7rem; }
.${n}-setup-place-space h4 { margin: 0; color: #f5f5ff; font-size: 1rem; }
.${n}-setup-advanced {
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .55rem .65rem;
}
.${n}-setup-advanced > summary { cursor: pointer; }
.${n}-setup-advanced .${n}-reason-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
.${n}-setup-advanced .${n}-label { min-width: 0; }
.${n}-setup-review-card {
  display: grid; gap: .3rem; border: 1px solid #5265ac; border-radius: .85rem;
  background: #1c254b; padding: .65rem;
}
.${n}-setup-review-card h3 { margin: 0; color: #f5f5ff; font-size: .9rem; }
.${n}-setup-review-card p { margin: 0; }
.${n}-setup-body .${n}-setup-venue-card {
  border-color: #5265ac; border-radius: .85rem; background: #1c254b; color: #f0f2ff;
}
.${n}-setup-body .${n}-setup-venue-card[data-selected="true"] {
  border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff;
}
.${n}-setup-body .${n}-setup-map-shell {
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${n}-setup-body .${n}-step[data-clickable="true"] {
  border-color: #5265ac; border-radius: .65rem; background: #1c254b; color: #d3ddfa; padding: .4rem .7rem;
}
.${n}-setup-body .${n}-step[data-active="true"] {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff; color: #f5f5ff;
}
.${n}-scenario-options {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .4rem; margin-top: .15rem;
}
.${n}-scenario-option {
  position: relative; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .1rem; min-height: 3.2rem; padding: .25rem .3rem;
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b;
  color: #f0f2ff; text-align: center; cursor: pointer;
}
.${n}-scenario-option input {
  position: absolute; width: 1px; height: 1px; opacity: 0;
}
.${n}-scenario-option:has(input:checked) {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff, 0 0 1rem #9a78ff9c;
}
.${n}-scenario-option:has(input:focus-visible) { outline: 3px solid #f2d6ff; outline-offset: 3px; }
.${n}-scenario-icon { color: #b9c8ff; font-size: max(1.1rem, 18px); line-height: 1; }
.${n}-scenario-option strong { font-size: max(.72rem, 13px); }
.${n}-scenario-option small { color: #bdc8ed; font-size: max(.6rem, 11px); line-height: 1.2; }
.${n}-scenario-art-panel {
  position: relative; flex: 1 1 12rem; min-width: 0; min-height: 8rem;
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${n}-scenario-art-panel > img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
.${n}-scenario-art-placeholder {
  position: absolute; inset: 0; display: grid; place-items: center;
  color: #d3ddfa; font-size: 2rem;
}
.${n}-scenario-art-panel::after {
  content: ""; position: absolute; inset: 36% 0 0;
  background: linear-gradient(transparent, #0e1a3ba8 48%, #101a3ef0);
}
.${n}-scenario-art-content {
  position: absolute; z-index: 1; inset: auto 1rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  color: #fff; text-align: center;
}
.${n}-scenario-art-content p {
  margin: 0; font-family: Georgia, serif; font-style: italic; font-size: clamp(1.25rem, 2vw, 1.9rem);
}
.${n}-scenario-art-content strong { font-weight: 500; }
/* World setup uses the same indigo panels and borders as Identity and Persona. */
.${n}-lore-picker {
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .65rem;
}
.${n}-lore-selected { display: flex; flex-wrap: wrap; gap: .35rem; max-height: 5rem; overflow-y: auto; margin: .4rem 0; }
.${n}-lore-chip {
  display: inline-flex; align-items: center; gap: .3rem; max-width: 100%; padding: .15rem .25rem .15rem .5rem;
  border: 1px solid #6684d4; border-radius: 999px; background: #303d85; color: #f0f2ff; font-size: .72rem;
}
.${n}-lore-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${n}-lore-chip button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${n}-lore-chip button:focus-visible { outline: 2px solid #f2d6ff; border-radius: 50%; }
.${n}-lore-options > summary { cursor: pointer; list-style-position: inside; }
.${n}-lore-options > .${n}-search { width: 100%; box-sizing: border-box; margin: .5rem 0; }
.${n}-lore-results { display: grid; gap: .15rem; max-height: 12rem; overflow-y: auto; }
/* Compact, role-neutral identity chooser used by Founding's Persona adapter. */
.${n}-founding-persona { display: flex; flex-direction: column; gap: .3rem; min-height: 0; }
.${n}-identity-picker-head { display: flex; align-items: center; gap: .75rem; }
.${n}-identity-picker-head > .${n}-label { flex: 0 0 auto; }
.${n}-identity-picker-head > .${n}-search { flex: 1 1 auto; width: 0; min-width: 0; }
.${n}-identity-strip {
  display: flex; gap: .4rem; min-height: 5.5rem; overflow-x: auto; overflow-y: hidden;
  padding: .15rem .15rem .3rem; scrollbar-width: thin;
}
.${n}-identity-card {
  display: flex; flex-direction: column; align-items: center; gap: .15rem;
  flex: 0 0 6.8rem; min-width: 0; padding: .25rem;
  border: 1px solid #5265ac; border-radius: .6rem; background: #1c254b;
  color: #f0f2ff; font: inherit; font-size: .7rem; cursor: pointer;
}
.${n}-identity-card[aria-pressed="true"] { border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff; }
.${n}-identity-card:focus-visible { outline: 3px solid #f2d6ff; outline-offset: 2px; }
.${n}-identity-card-face, .${n}-identity-preview-face {
  position: relative; display: grid; place-items: center; overflow: hidden; flex: 0 0 auto;
  border-radius: 50%; background: #324576; color: #e9edff;
}
.${n}-identity-card-face { width: 2.5rem; height: 2.5rem; }
.${n}-identity-card-face > img, .${n}-identity-preview-face > img { width: 100%; height: 100%; object-fit: cover; }
.${n}-identity-card-face svg, .${n}-identity-preview-face svg { width: 55%; height: 55%; }
.${n}-identity-card strong, .${n}-identity-card small {
  overflow: hidden; max-width: 100%; white-space: nowrap; text-overflow: ellipsis;
}
.${n}-identity-card small { color: #b9c8e9; font-size: .55rem; }
.${n}-identity-preview {
  display: flex; gap: .55rem; min-height: 0; max-height: 9.3rem; overflow-y: auto;
  padding: .5rem; border: 1px solid #5265ac; border-radius: .65rem; background: #1c254b;
}
.${n}-identity-preview-face { width: 3.2rem; height: 3.2rem; }
.${n}-identity-preview-copy { min-width: 0; font-size: .68rem; line-height: 1.35; }
.${n}-identity-preview-copy h3 { margin: 0 0 .15rem; font-size: .9rem; }
.${n}-identity-preview-copy p { margin: .12rem 0; }
.${n}-identity-overview { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.${n}-identity-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35rem; margin: .3rem 0; }
.${n}-identity-details dt { font-weight: 700; color: #cfdaff; }
.${n}-identity-details dd { margin: 0; }
.${n}-identity-context { color: #bdc8ed; }
.${n}-connections-compact { min-height: 0; }
.${n}-connections-compact > .${n}-hint { margin: 0; }
.${n}-connections-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${n}-connections-grid > .${n}-field { min-width: 0; }
.${n}-connections-grid .${n}-select { width: 100%; }
.${n}-connections-grid .${n}-hint { line-height: 1.25; }
@container (min-width: 80rem) {
  .${n}-scenario-options { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@container (max-width: 70rem) {
  .${n}-setup-body { flex-wrap: wrap; }
  .${n}-setup-rail {
    flex: 1 1 100%; flex-direction: row; overflow-x: auto; padding: .25rem 0;
  }
  .${n}-setup-rail-step { flex: 0 0 auto; }
}
@container (min-width: 42.01rem) and (max-width: 70rem) {
  .${n}-setup-body > .${n}-side { flex-basis: 25rem; }
  .${n}-setup-visual { flex-basis: 14rem; }
}
@container (max-width: 42rem) {
  .${n}-setup-body { flex: none; }
  .${n}-setup-body > .${n}-side,
  .${n}-setup-visual { flex: 1 1 100%; }
  .${n}-setup-body[data-step="1"] .${n}-overlay { height: auto; overflow: visible; }
  .${n}-identity-preview { max-height: none; }
  .${n}-connections-grid { grid-template-columns: 1fr; }
  .${n}-scenario-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .${n}-setup-advanced .${n}-reason-options { grid-template-columns: 1fr; }
  .${n}-scenario-art-panel { flex: none; height: 18rem; }
  .${n}-setup-form-field { grid-template-columns: 1fr; }
  .${n}-setup-form-field > .${n}-hint { grid-column: 1; }
}
.${n}-steps { display: flex; flex-wrap: wrap; gap: .375rem; }
/*
  A chip that says where something has got to: which step of the wizard, or
  which of the three fits a picture is drawn with. Only the ones that are
  really a control say so, by carrying the data-clickable attribute \u2014 a chip
  that answers the cursor and then does nothing when it is clicked is a promise
  the strip cannot keep. That is why the wizard's own chips are not controls.
*/
.${n}-step {
  font: inherit; font-size: .6875rem; color: var(--muted-foreground);
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 85%, transparent);
  padding: .1875rem .5rem;
}
.${n}-step[data-clickable="true"] { cursor: pointer; }
.${n}-step[data-clickable="true"]:hover { border-color: var(--primary); color: var(--primary); }
.${n}-step[data-active="true"] { border-color: var(--primary); color: var(--primary); }
.${n}-step[data-done="true"] { border-color: color-mix(in srgb, var(--primary) 45%, transparent); }
.${n}-home-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid var(--border); border-radius: .5rem; padding: .4375rem .5rem;
}
.${n}-home-row[data-selected="true"] { border-color: var(--primary); }
.${n}-home-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; }
.${n}-home-index {
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
.${n}-building {
  flex: 0 0 auto; display: flex; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--muted-foreground) 10%, transparent);
  padding: .125rem .5rem; font-size: .6875rem; color: var(--muted-foreground);
}
.${n}-select {
  box-sizing: border-box; max-width: 100%;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .3125rem .375rem; font-size: .75rem; font-family: inherit;
}
.${n}-who { font-size: .75rem; color: var(--muted-foreground); min-width: 5rem; }
.${n}-danger { border-color: color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent); color: var(--destructive, #e5484d); }
.${n}-spacer { flex: 1 1 auto; }
.${n}-file { max-width: 100%; font-size: .6875rem; color: var(--muted-foreground); }

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
${n} {
  display: block;
  height: 100%;
  min-height: 0;
  container-type: size;
  container-name: ${n};
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
${n}:fullscreen {
  background: var(--background);
  --${n}-safe-top: env(safe-area-inset-top, 0px);
  --${n}-safe-right: env(safe-area-inset-right, 0px);
  --${n}-safe-bottom: env(safe-area-inset-bottom, 0px);
  --${n}-safe-left: env(safe-area-inset-left, 0px);
}
${n}:fullscreen .${n}-root {
  padding:
    calc(var(--${n}-pad) + var(--${n}-safe-top))
    calc(var(--${n}-pad) + var(--${n}-safe-right))
    calc(var(--${n}-pad) + var(--${n}-safe-bottom))
    calc(var(--${n}-pad) + var(--${n}-safe-left));
}
${n}:fullscreen .${n}-home-full {
  padding:
    calc(var(--${n}-pad) * .6 + var(--${n}-safe-top))
    calc(var(--${n}-pad) * .6 + var(--${n}-safe-right))
    calc(var(--${n}-pad) * .6 + var(--${n}-safe-bottom))
    calc(var(--${n}-pad) * .6 + var(--${n}-safe-left));
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
.${n}-rotate { display: none; }
@media (orientation: portrait) and (pointer: coarse) {
  .${n}-rotate {
    position: absolute; inset: 0; z-index: 5;
    display: grid; place-content: center; justify-items: center;
    gap: .75rem;
    padding: calc(var(--${n}-pad) * 2) var(--${n}-pad);
    background: color-mix(in srgb, var(--background) 96%, transparent);
    text-align: center;
  }
}
.${n}-rotate-phone { width: 3.25rem; color: var(--primary); }
.${n}-rotate-phone svg { display: block; width: 100%; height: auto; }
.${n}-rotate-title { margin: 0; font-size: .875rem; font-weight: 600; color: var(--foreground); }
.${n}-rotate-note { margin: 0; max-width: 32ch; font-size: .8125rem; line-height: 1.5; color: var(--muted-foreground); }
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
  .${n}-button,
  .${n}-select,
  .${n}-search,
  .${n}-notice-input,
  .${n}-macro,
  .${n}-chat-mode-button,
  .${n}-chat-send,
  .${n}-step[data-clickable="true"],
  .${n}-zoom-button,
  .${n}-remove { min-height: 2.25rem; }
  .${n}-icon-button,
  .${n}-chat-mode-button,
  .${n}-chat-send { min-width: 2.25rem; }
  .${n}-zoom-button,
  .${n}-icon-button,
  .${n}-chat-mode-button,
  .${n}-chat-send { justify-content: center; }
  /*
    There used to be a second rule here, reserving room on the box's right-hand
    edge for the press, because the press floated over the words and grew under a
    coarse pointer. The press is a flex item at the end of the line now, so the
    box makes that room for it by itself and there is nothing left to reserve.
  */
  .${n}-pin-remove { min-width: 1.75rem; min-height: 1.75rem; }
  .${n}-textarea { min-height: 4.5rem; }
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
@container ${n} (max-width: 44rem) {
  .${n}-chat { padding: .625rem; }
  .${n}-chat-head { top: .625rem; left: .625rem; right: .625rem; }
  .${n}-chat-vn-row { gap: .5rem; padding: .625rem; }
  .${n}-room-screen > .${n}-chat { overflow-y: auto; }
  .${n}-room-screen .${n}-chat-stage {
    flex: 1 1 9.5rem; height: auto; min-height: 9.5rem; padding-top: 3.25rem;
    justify-content: flex-end;
  }
  .${n}-room-screen .${n}-chat-cast { height: 100%; max-height: none; }
  .${n}-room-screen .${n}-chat-cast-person,
  .${n}-room-screen .${n}-chat-cast-person[data-active="true"] {
    flex: 0 1 30%; height: auto; justify-content: center;
  }
  .${n}-room-screen .${n}-chat-cast-person > .${n}-avatar { width: min(4rem, 100%); }
  .${n}-room-screen .${n}-chat-cast-person > img { height: 5rem; max-width: 100%; }
  .${n}-room-screen .${n}-chat-vn { flex: 0 0 auto; justify-content: flex-start; }
  .${n}-room-screen .${n}-chat > .${n}-composer { flex: 0 0 auto; }
  .${n}-room-screen .${n}-chat > .${n}-composer {
    position: sticky; bottom: 0; z-index: 2;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--popover);
  }
}
@container ${n} (max-width: 55rem) and (max-height: 32rem) {
  .${n}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}
@container ${n} (max-height: 30rem) {
  .${n}-chat { gap: .5rem; padding: .625rem; }
  .${n}-chat-stage { gap: .25rem; }
  /*
    The same share of the figure's width as the rule it overrides, and a TIGHTER
    reservation under it: this block is where the plate under the figure is given
    up, so the half a rem it was keeping clear goes back to the figure. That is
    the only difference between the two lines, and it is the whole reason this
    block still states a size of its own.
  */
  .${n}-chat-figure { width: min(38cqw, calc(100cqh - .5rem)); }
  .${n}-chat-scene-place { display: none; }
  .${n}-chat-log { gap: .375rem; }
  .${n}-chat-vn-portrait { display: none; }
  .${n}-chat-vn-reading { max-height: min(34cqh, 11rem); }
}
/* A short landscape viewport gives the cast a column beside the reading stack. */
@container ${n} (min-width: 34rem) and (max-height: 30rem) {
  .${n}-room-screen .${n}-chat-stage {
    position: absolute; top: 3rem; bottom: .5rem; left: .5rem; width: 34%;
    z-index: 1; flex: none;
  }
  .${n}-room-screen .${n}-chat-cast-person { font-size: .5625rem; }
  .${n}-room-screen .${n}-chat-vn,
  .${n}-room-screen .${n}-chat > .${n}-row,
  .${n}-room-screen .${n}-chat > .${n}-composer {
    width: 64%; align-self: flex-end; box-sizing: border-box;
  }
  .${n}-room-screen .${n}-chat-vn { margin-top: auto; }
}
@container ${n} (max-width: 34rem) {
  .${n}-menu-group-buttons { flex-direction: column; align-items: stretch; }
  .${n}-chat-menu { max-width: 88cqw; }
  .${n}-chat-modes { max-width: 88cqw; }
  .${n}-chat-menu-button { width: 2.25rem; height: 2.25rem; }
  .${n}-chat-vn-portrait { width: min(4rem, 22cqw); }
}
@container ${n} (max-width: 34rem) and (max-height: 32rem) {
  .${n}-room-screen .${n}-chat-stage { min-height: 7.5rem; padding-top: 2.75rem; }
  .${n}-room-screen .${n}-chat-cast-person > .${n}-avatar { width: min(3.25rem, 100%); }
  .${n}-room-screen .${n}-chat-cast-person > img { height: 3.5rem; }
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
@container ${n} (max-height: 22rem) {
  .${n}-chat-stage { gap: .125rem; padding-bottom: .125rem; }
  .${n}-chat-vn-reading { max-height: min(38cqh, 9rem); }
  .${n}-chat-vn-name { font-size: .8125rem; }
}

@container ${n} (max-width: 44rem) {
  .${n}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
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
.${n}-backdrop {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center;
  padding: clamp(.75rem, 3vw, 2rem);
  background: color-mix(in srgb, #05060a 52%, transparent);
}
.${n}-sheet {
  display: flex; flex-direction: column; gap: .75rem;
  width: min(100%, 27rem); max-height: min(100%, 34rem);
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 1.5rem 3.5rem rgba(0, 0, 0, .45);
  padding: .9375rem;
  overflow: hidden;
}
.${n}-sheet-head { display: flex; flex-direction: column; gap: .1875rem; }
.${n}-sheet-title { margin: 0; font-size: .9625rem; font-weight: 600; }
.${n}-sheet-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-sheet-body {
  display: flex; flex-direction: column; gap: .5rem;
  min-height: 0; overflow-y: auto; padding-right: .125rem;
}
.${n}-sheet-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${n}-sheet-actions-end { margin-left: auto; display: flex; flex-wrap: wrap; gap: .375rem; }
/*  The one filled button in the package. Everywhere else the accent is a border,
    because everywhere else the control sits inside the player's village and is
    one of several. Here there is exactly one thing to do next. */
.${n}-button-primary {
  border-color: var(--primary); background: var(--primary);
  color: var(--primary-foreground, var(--background));
}
.${n}-button-primary:hover { border-color: var(--primary); color: var(--primary-foreground, var(--background)); opacity: .9; }
/*  A preset, as a row rather than as an option in a select. It is drawn as a
    list because a preset is a choice with consequences \u2014 it decides how the
    whole roleplay reads \u2014 and a dropdown hides the consequences behind a click. */
.${n}-choice {
  display: flex; flex-direction: column; align-items: flex-start; gap: .125rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .5rem;
  background: transparent; color: var(--foreground);
  padding: .4375rem .625rem; font: inherit; font-size: .8125rem; cursor: pointer;
}
.${n}-choice:hover { border-color: var(--primary); }
.${n}-choice[data-active="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${n}-choice-note { font-size: .6875rem; line-height: 1.45; color: var(--muted-foreground); }
/*  One preset question, and the answers to it. The pills are the Engine's own
    button mode; the list below is its listbox mode, which it reaches for by
    itself once a question has enough answers that a wall of pills stops being
    readable. Both are drawn here because the popup has to be able to show
    whichever one the preset asked for. */
.${n}-var { display: flex; flex-direction: column; gap: .3125rem; }
.${n}-var-question { font-size: .75rem; font-weight: 600; line-height: 1.4; }
.${n}-var-options { display: flex; flex-wrap: wrap; gap: .25rem; }
.${n}-var-option {
  display: inline-flex; align-items: center; gap: .3125rem;
  border: 1px solid var(--border); border-radius: 999px;
  padding: .1875rem .5rem; font-size: .75rem; line-height: 1.4; cursor: pointer;
}
.${n}-var-option:hover { border-color: var(--primary); }
.${n}-var-option[data-on="true"] { border-color: var(--primary); color: var(--primary); }
.${n}-var-option input { flex: none; margin: 0; accent-color: var(--primary); }
.${n}-var-list {
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
.${n}-gate {
  display: flex; flex-direction: column; gap: .75rem; align-items: flex-start;
  margin: auto; width: min(100%, 32rem); padding: 1.25rem;
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background));
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, .3);
}
.${n}-gate-title { margin: 0; font-size: 1.125rem; font-weight: 600; }
.${n}-gate-note { margin: 0; font-size: .8125rem; line-height: 1.55; color: var(--muted-foreground); }
.${n}-gate-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
/*  The chip's own popover, hung off the toolbar button it belongs to. Absolute
    rather than fixed: it is a sentence about the button under the player's
    finger, and it should move with the chat chrome rather than with the page. */
.${n}-tracker-menu {
  position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40;
  width: 17rem; display: flex; flex-direction: column; gap: .5rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35); padding: .625rem;
}
.${n}-tracker-menu-title { margin: 0; font-size: .8125rem; font-weight: 600; }
.${n}-tracker-menu-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${n}-tracker-menu-row { display: flex; flex-wrap: wrap; gap: .375rem; }
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
.${n}-tracker-chip { width: auto; max-width: none; gap: .3125rem; padding-inline: .5rem; }
.${n}-tracker-label { font-size: .6875rem; font-weight: 600; line-height: 1; letter-spacing: .01em; }
/*  On a phone the strip is a row of squares and there is no room for a word, so
    the chip goes back to being one: the icon, the same host chrome, and the same
    menu one press away. The sentence the label was carrying is the menu's first
    line, which is where a player on a phone will read it anyway. */
.${n}-tracker[data-compact="true"] .${n}-tracker-label { display: none; }
.${n}-tracker[data-open="true"] .${n}-tracker-label { color: var(--marinara-chat-chrome-button-text-active, currentColor); }
/*
  The tracker panel's body.

  Drawn inside the Engine's own tracker section, which already supplies the
  card, the veil and the heading, so this adds no chrome of its own \u2014 only the
  small amount of layout the Engine's shell leaves to the package.
*/
.${n}-panel-view { display: flex; flex-direction: column; gap: .4375rem; }
.${n}-panel-view-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: .375rem; font-size: .75rem; line-height: 1.5; }
.${n}-panel-view-key { color: var(--muted-foreground); }
.${n}-panel-view-actions { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .125rem; }
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
.${n}-tracker { position: relative; display: inline-flex; align-items: center; }
.${n}-tracker svg { width: 1rem; height: 1rem; }
.${n}-tracker[data-state="done"] { opacity: .7; }
.${n}-spin { animation: ${n}-spin .9s linear infinite; }
@keyframes ${n}-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .${n}-spin { animation: none; }
}

/* 0.6.10 mobile village: the wooden frame is the viewport, not the moving map. */
.${n}-home-full[data-mobile="true"] { box-sizing: border-box; flex-direction: column; overflow: hidden; padding: .5rem; gap: .5rem; }
.${n}-home-full[data-mobile="true"] .${n}-room { min-height: 0; padding: calc(var(--${n}-map-wood) + var(--${n}-map-mat) + 1px); }
.${n}-home-full[data-mobile="true"] .${n}-home-map-viewport { display: block; width: 100%; height: 100%; overflow: visible; }
.${n}-home-full[data-mobile="true"] .${n}-stage { display: block; width: 100% !important; height: 100% !important; aspect-ratio: auto !important; touch-action: none; }
.${n}-stage[data-mobile="true"] { touch-action: none; user-select: none; }
.${n}-stage[data-mobile="true"] .${n}-canvas { overflow: hidden; }
.${n}-stage[data-mobile="true"] .${n}-canvas-img { max-width: none; max-height: none; pointer-events: none; }
.${n}-stage[data-mobile="true"][data-empty="true"] .${n}-canvas { background: var(--background); }
.${n}-mobile-logical { position: absolute; display: block; background: radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--primary) 17%, transparent), transparent 30%), linear-gradient(25deg, #34304d, #20243b); pointer-events: none; }
.${n}-home-bar { display: flex; align-items: center; flex: 0 0 auto; gap: .35rem; min-width: 0; z-index: 15; }
.${n}-home-bar-actions { display: inline-flex; align-items: center; gap: .35rem; margin-left: auto; }
.${n}-home-bar .${n}-button { min-height: 2.5rem; }
.${n}-mobile-datetime { display: inline-flex; align-items: center; gap: .2rem; min-width: 0; border: 1px solid #d6ba7c; border-radius: .65rem; background: #718eb6; color: #172238; padding: .2rem .3rem; font-size: .95rem; white-space: nowrap; }
.${n}-mobile-clock { display: flex; flex-direction: column; line-height: 1.15; font-variant-numeric: tabular-nums; font-size: clamp(.58rem, 2.5cqw, .75rem); }
.${n}-mobile-board-button, .${n}-mobile-menu-button, .${n}-home-bar .${n}-news-toggle { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; min-width: 2.5rem; min-height: 2.5rem; padding: .15rem; }
.${n}-mobile-board-button { border: 3px solid #5c381d; border-radius: .3rem; background: repeating-linear-gradient(90deg, #ad7540 0 9px, #9a6636 9px 11px); color: #f6e3b6; box-shadow: inset 0 0 0 2px #c5925a, 0 2px 4px #0007; font-size: 1.4rem; cursor: pointer; }
.${n}-mobile-board-button:disabled { opacity: .55; }
.${n}-mobile-menu-button { font-size: 1.5rem; line-height: 1; }
.${n}-home-bar .${n}-news-toggle { position: relative; }
.${n}-home-bar .${n}-news-toggle svg { width: 1.3rem; height: 1.3rem; }
.${n}-news-nyi { position: absolute; right: -.15rem; bottom: -.3rem; border-radius: .2rem; background: var(--popover); color: var(--foreground); padding: 0 .1rem; font-size: .55rem; font-weight: 700; }
.${n}-home-bar .${n}-news-panel { width: min(19rem, 80cqw); max-height: 60cqh; }
.${n}-home-full[data-mobile="false"] .${n}-mobile-datetime { font-size: 1rem; padding: .25rem .45rem; }
.${n}-home-full[data-mobile="false"] .${n}-mobile-clock { font-size: .75rem; }
.${n}-stage[data-mobile="true"] .${n}-pin-holder { z-index: 2; }
.${n}-stage .${n}-pin-holder[data-selected="true"] { z-index: 7; }
.${n}-home-full .${n}-pin[data-kind="place"], .${n}-stage[data-mobile="true"] .${n}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; padding: 0; border: 0; border-radius: 0; background: transparent; color: #30261c; box-shadow: none; text-align: center; white-space: normal; line-height: 1.1; overflow: visible; }
.${n}-home-full .${n}-pin-photo-card, .${n}-stage[data-mobile="true"] .${n}-pin-photo-card { display: flex; flex: 0 0 auto; flex-direction: column; width: clamp(3.5rem, 6cqw, 5rem); gap: .1rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${n}-stage[data-mobile="true"] .${n}-pin-photo-card { width: clamp(4rem, 17cqw, 5.25rem); }
.${n}-home-full .${n}-pin-photo, .${n}-stage[data-mobile="true"] .${n}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; overflow: visible; }
.${n}-home-full .${n}-pin-photo img, .${n}-stage[data-mobile="true"] .${n}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${n}-home-full .${n}-pin-photo-tack, .${n}-stage[data-mobile="true"] .${n}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${n}-home-full .${n}-pin-name, .${n}-stage[data-mobile="true"] .${n}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-size: .58rem; font-weight: 700; }
.${n}-stage[data-mobile="true"] .${n}-pin[data-kind="person"] { max-width: 7rem; }
.${n}-stage[data-mobile="true"][data-mobile-gesturing="true"] .${n}-pin-photo-card { transition: none; }
.${n}-stage[data-mobile="true"] .${n}-doors { z-index: 8; transform: translateX(-50%); min-width: min(10rem, 70cqw); }
.${n}-project-screen { display: grid; gap: 1.25rem; min-height: 0; color: #eef2ff; }
.${n}-project-head { display: flex; justify-content: space-between; align-items: start; gap: 1rem; padding: .25rem .25rem .5rem; }
.${n}-project-head h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); margin: .25rem 0; color: #f6f4ff; }
.${n}-project-head p { margin: 0; color: #adbee8; }
.${n}-project-eyebrow { color: #b8adff; font-size: .72rem; font-weight: 800; letter-spacing: .12em; }
.${n}-project-slots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.${n}-project-slot, .${n}-project-card { border: 1px solid #3f59ab; border-radius: 1rem; background: linear-gradient(145deg, #182b62, #101d44); box-shadow: 0 1rem 2rem #070e2b44; color: #f1f3ff; }
.${n}-project-slot { display: grid; gap: .6rem; min-height: 11rem; text-align: left; padding: 1.3rem; cursor: pointer; }
.${n}-project-slot:hover, .${n}-project-slot:focus-visible { border-color: #a78bfa; box-shadow: 0 0 0 2px #8d6cf6; }
.${n}-project-slot span { color: #aa9eff; font-size: .78rem; font-weight: 800; letter-spacing: .1em; }
.${n}-project-slot strong { font-size: 1.3rem; }
.${n}-project-slot small { color: #b8c6eb; }
.${n}-project-create { grid-column: 1 / -1; }
.${n}-project-layout { display: grid; grid-template-columns: minmax(10rem, 13rem) minmax(19rem, 1fr); gap: 1rem; align-items: start; min-height: 0; }
.${n}-project-rail { display: grid; gap: .6rem; }
.${n}-project-step { display: flex; align-items: center; gap: .7rem; color: #8da2d4; padding: .7rem; border-radius: .7rem; }
.${n}-project-step b { display: grid; place-items: center; flex: 0 0 2.3rem; height: 2.3rem; border: 1px solid #6480cd; border-radius: 50%; }
.${n}-project-step[data-state="active"] { color: white; background: linear-gradient(110deg, #344af1, #192c69); }
.${n}-project-step[data-state="active"] b { background: #8b4cf4; border-color: #8b4cf4; }
.${n}-project-step[data-state="done"] { color: #b8d6ff; }
.${n}-project-card { display: grid; gap: .85rem; padding: 1.25rem; }
.${n}-project-card h3, .${n}-project-card h4 { margin: 0; }
.${n}-project-card p { margin: .1rem 0; line-height: 1.45; color: #c7d4f6; }
.${n}-project-card label { display: grid; gap: .4rem; font-weight: 650; }
.${n}-project-card input:not([type="file"]), .${n}-project-card select, .${n}-project-card textarea { width: 100%; box-sizing: border-box; border: 1px solid #5470bf; border-radius: .55rem; background: #172b60; color: #f4f6ff; padding: .7rem; font: inherit; }
.${n}-project-card textarea { min-height: 7rem; resize: vertical; }
.${n}-project-card > .${n}-button { background: linear-gradient(100deg, #3656f6, #9448ef); color: white; min-height: 2.75rem; }
.${n}-project-material { display: grid; gap: .35rem; border: 1px solid #425ba1; border-radius: .65rem; padding: .7rem; }
.${n}-project-material span { color: #b6c5ea; }
.${n}-project-finish-visit { display: grid; gap: 1rem; max-width: 62rem; margin: 0 auto; padding: 1.25rem; border: 1px solid #536cc0; border-radius: 1rem; background: #142657; color: #f4f6ff; }
.${n}-project-finish-visit header { display: grid; gap: .5rem; }
.${n}-project-finish-visit h2, .${n}-project-finish-visit p { margin: 0; }
.${n}-project-finish-visit label { display: grid; gap: .4rem; }
.${n}-project-finish-visit input:not([type="file"]), .${n}-project-finish-visit textarea { width: 100%; box-sizing: border-box; border: 1px solid #5470bf; border-radius: .55rem; background: #172b60; color: #f4f6ff; padding: .7rem; font: inherit; }
.${n}-project-finish-visit textarea { min-height: 7rem; }
.${n}-project-image { display: grid; gap: .5rem; border-top: 1px solid #425ba1; padding-top: .8rem; }
.${n}-project-image img { max-width: min(100%, 20rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
.${n}-project-footer { display: flex; justify-content: flex-start; border-top: 1px solid #425ba1; padding-top: .8rem; }
@media (max-width: 700px) { .${n}-project-slots, .${n}-project-layout { grid-template-columns: 1fr; } .${n}-project-rail { display: flex; overflow-x: auto; } .${n}-project-step { flex: 0 0 9rem; } }
.${n}-mobile-map-preview { display: block; max-width: min(100%, 22rem); max-height: 13rem; object-fit: contain; border: 2px solid var(--border); }
.${n}-setup-map-viewport:has(> .${n}-stage[data-mobile="true"]) { height: min(55cqh, 30rem); overflow: hidden; }
.${n}-setup-map-viewport > .${n}-stage[data-mobile="true"] { width: 100% !important; height: 100% !important; aspect-ratio: auto !important; }
/* Shared place photographs, including the founding map before an image exists. */
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; padding: 0; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin-photo-card { display: flex; flex-direction: column; gap: .1rem; width: 4rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; color: #30261c; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; }
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${n}-stage[data-photo-pins="true"][data-mobile="false"] .${n}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .55rem; font-weight: 700; }
.${n}-pin-photo-empty { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #e8dfc9; font-size: 1.5rem; }
.${n}-pin-placement-error { position: absolute; z-index: 15; left: .5rem; bottom: .5rem; margin: 0; max-width: calc(100% - 1rem); padding: .4rem .6rem; border-radius: .5rem; background: #261a19e8; color: white; font-size: .75rem; pointer-events: none; }
.${n}-setup-venue-list { display: grid; gap: .45rem; margin: .5rem 0; }
.${n}-setup-venue-card { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); align-items: center; gap: .65rem; min-height: 4.4rem; width: 100%; box-sizing: border-box; text-align: left; border: 1px solid var(--border); border-radius: .6rem; background: var(--background); color: var(--foreground); padding: .45rem; }
.${n}-setup-venue-card[data-selected="true"] { border-color: var(--primary); }
.${n}-setup-venue-card img, .${n}-setup-venue-placeholder { width: 3.5rem; height: 3.5rem; object-fit: cover; border-radius: .3rem; background: #31291f; }
.${n}-setup-venue-placeholder { display: grid; place-items: center; color: #eee5d5; font-size: 1.3rem; }
@media (prefers-reduced-motion: reduce) { .${n}-pin-photo-card { transition: none; } }
.${n}-setup-venue-card strong, .${n}-setup-venue-card small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${n}-setup-venue-editor { display: grid; gap: .65rem; border-top: 1px solid var(--border); padding-top: .75rem; }
.${n}-setup-image-preview { display: block; width: min(100%, 18rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
.${n}-preparing { display: grid; place-items: center; min-height: 100%; padding: 2rem; text-align: center; background: radial-gradient(circle at 50% 65%, #584a2e, #241e24 70%); color: #fff4dd; }
.${n}-preparing-house { font-size: clamp(4rem, 13vw, 7rem); animation: ${n}-settle 2.5s ease-in-out infinite; }
@keyframes ${n}-settle { 50% { transform: translateY(-.35rem) rotate(2deg); } }
@media (prefers-reduced-motion: reduce) { .${n}-preparing-house { animation: none; } }
/* Game Mode's reading stack: asides float over a bounded bottom panel. */
.${n}-root.${n}-room-screen { box-sizing: border-box; padding: 0; overflow: hidden; }
.${n}-room-screen .${n}-chat-vn { position: relative; align-self: center; width: min(58rem, 100%); margin-top: auto; padding: .6rem; box-sizing: border-box; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: 1rem; background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 88%, transparent)); backdrop-filter: blur(14px); box-shadow: 0 .75rem 2rem #0007; }
.${n}-room-screen .${n}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .5rem); width: min(75%, 24rem); max-height: min(30cqh, 12rem); }
.${n}-room-screen .${n}-chat-vn-card { background: color-mix(in srgb, var(--background) 62%, transparent); box-shadow: none; }
.${n}-room-screen .${n}-chat-vn-reading { max-height: min(30cqh, 18rem); }
.${n}-room-panel-tools { display: flex; align-items: center; gap: .5rem; min-height: 2rem; }
.${n}-room-screen .${n}-chat-history-toggle { min-height: 2rem; }
.${n}-room-screen .${n}-composer { min-width: 0; }
.${n}-room-mode-anchor { position: relative; flex: 0 0 auto; }
.${n}-room-mode-toggle { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border: 0; border-radius: .5rem; background: transparent; color: var(--primary); font-size: 1rem; cursor: pointer; }
.${n}-room-mode-menu { position: absolute; z-index: 20; left: 0; bottom: calc(100% + .45rem); display: grid; width: 9rem; padding: .25rem; border: 1px solid var(--border); border-radius: .6rem; background: var(--popover); box-shadow: 0 .5rem 1rem #0008; }
.${n}-room-mode-menu button { border: 0; border-radius: .35rem; background: transparent; color: var(--foreground); text-align: left; padding: .5rem; font: inherit; cursor: pointer; }
.${n}-room-mode-menu button[aria-checked="true"] { background: color-mix(in srgb, var(--primary) 17%, var(--popover)); }
.${n}-room-mode-menu button:disabled { opacity: .5; cursor: default; }
.${n}-mailbox-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 1rem; background: #0009; }
.${n}-mailbox { width: min(42rem, 100%); max-height: min(80vh, 48rem); overflow: auto; padding: 1.5rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--popover); box-shadow: 0 1rem 3rem #0009; }
.${n}-mailbox-list { display: grid; gap: .75rem; margin-top: 1rem; }
.${n}-mailbox-item { padding: .9rem; border: 1px solid var(--border); border-radius: .75rem; }
.${n}-venue-space-picture { display: block; width: min(100%, 24rem); aspect-ratio: 4 / 3; object-fit: cover; border: 1px solid var(--border); border-radius: .625rem; }
.${n}-room-mode-toggle:focus-visible, .${n}-room-mode-menu button:focus-visible, .${n}-room-star-detail:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${n}-room-star-detail { flex: 1; align-self: stretch; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; text-align: left; cursor: pointer; }
.${n}-memory-backdrop { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; background: #0009; }
.${n}-memory-dialog { box-sizing: border-box; width: min(28rem, 100%); max-height: min(75cqh, 36rem); overflow-y: auto; padding: 1rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--popover); color: var(--foreground); box-shadow: 0 1rem 2rem #0009; }
.${n}-memory-dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.${n}-memory-dialog-head h2 { margin: 0; font-size: 1rem; line-height: 1.4; }
.${n}-memory-dialog-head button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 1.5rem; cursor: pointer; }
.${n}-memory-dialog p { margin: .75rem 0 0; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
@container ${n} (max-width: 44rem) { .${n}-room-screen .${n}-chat-vn { width: 100%; padding: .45rem; } .${n}-room-screen .${n}-chat-vn-asides { width: min(85%, 22rem); } .${n}-room-mode-toggle { width: 2.5rem; height: 2.5rem; } }
@container ${n} (min-width: 34rem) and (max-height: 30rem) { .${n}-room-screen .${n}-chat-vn { width: 64%; align-self: flex-end; } }
.${n}-room-screen[data-mobile="true"] .${n}-room-stars { top: 4.25rem; left: .625rem; width: min(15rem, calc(100% - 1.25rem)); max-height: 20cqh; gap: .25rem; }
.${n}-room-screen[data-mobile="true"] .${n}-room-star { gap: .35rem; padding: .35rem .45rem; font-size: .75rem; line-height: 1.3; }
.${n}-room-screen[data-mobile="true"] .${n}-room-star-dismiss { margin: -.3rem -.35rem -.3rem 0; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides { position: static; flex: 0 0 auto; align-self: flex-end; width: min(90%, 20rem); max-height: 9rem; margin-bottom: .125rem; z-index: 2; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-vn-aside { max-width: 100%; padding: .4rem .55rem; gap: .375rem; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-vn-aside-face { width: 1.5rem; height: 1.5rem; }
.${n}-room-screen[data-mobile="true"] .${n}-memory-backdrop { padding: .5rem; }
.${n}-room-screen[data-mobile="true"] .${n}-memory-dialog { width: min(20rem, 100%); max-height: 60cqh; padding: .75rem; }

/* Venue visits use a single shallow reading dock so the stage owns the remaining height. */
.${n}-room-screen > .${n}-chat { gap: 0; padding: 0; overflow: hidden; }
.${n}-room-screen .${n}-chat-scrim {
  background: linear-gradient(180deg, color-mix(in srgb, var(--background) 30%, transparent), transparent 25%, transparent 65%, color-mix(in srgb, var(--background) 30%, transparent));
}
.${n}-room-screen .${n}-chat-vignette { opacity: .45; }
.${n}-room-screen .${n}-chat-head { top: .65rem; left: .75rem; right: .75rem; z-index: 6; align-items: center; }
.${n}-room-place, .${n}-room-actions-trigger, .${n}-room-notices-trigger {
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 82%, transparent));
  color: var(--foreground); backdrop-filter: blur(12px); box-shadow: 0 .25rem .75rem #0004;
}
.${n}-room-place { display: block; max-width: min(18rem, 60%); padding: .35rem .65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .75rem; }
.${n}-room-screen .${n}-chat-actions { position: relative; width: auto; margin-left: auto; }
.${n}-room-actions-trigger { width: 2rem; height: 2rem; cursor: pointer; font-size: 1.25rem; line-height: 1; }
.${n}-room-actions-menu { position: absolute; right: 0; top: calc(100% + .4rem); z-index: 15; display: grid; width: min(16rem, 80vw); padding: .25rem; border: 1px solid var(--border); border-radius: .7rem; background: var(--popover); box-shadow: 0 .6rem 1.5rem #0009; }
.${n}-room-actions-menu button { border: 0; border-radius: .4rem; padding: .55rem .65rem; background: transparent; color: var(--foreground); text-align: left; font: inherit; font-size: .8125rem; cursor: pointer; }
.${n}-room-actions-menu button:hover { background: color-mix(in srgb, var(--foreground) 9%, transparent); }
.${n}-room-actions-menu button:disabled { opacity: .45; cursor: default; }
.${n}-room-notices { position: absolute; top: 3.2rem; left: .75rem; z-index: 4; }
.${n}-room-notices-trigger { min-width: 2.5rem; min-height: 2rem; padding: .25rem .55rem; color: #e5b13e; font-size: .75rem; cursor: pointer; }
.${n}-room-screen .${n}-room-stars, .${n}-room-screen[data-mobile="true"] .${n}-room-stars { position: absolute; top: calc(100% + .35rem); left: 0; width: min(20rem, calc(100vw - 1.5rem)); max-height: 35cqh; overflow-y: auto; }
.${n}-room-screen .${n}-chat-stage { position: relative; top: auto; bottom: auto; left: auto; width: 100%; height: auto; min-height: 0; flex: 1 1 auto; padding: 3rem .75rem 0; box-sizing: border-box; }
.${n}-room-screen .${n}-chat-cast { height: 100%; max-height: none; gap: clamp(.2rem, 1vw, 1rem); }
.${n}-room-screen .${n}-chat-cast-person,
.${n}-room-screen .${n}-chat-cast-person[data-active="true"] { position: relative; flex: 1 1 0; max-width: 25%; height: 100%; min-width: 0; opacity: .78; transition: transform .18s ease, opacity .18s ease, filter .18s ease; }
.${n}-room-screen .${n}-chat-cast-person[data-active="true"] { z-index: 2; opacity: 1; filter: brightness(1.08); transform: scale(1.035); transform-origin: center bottom; }
.${n}-room-screen .${n}-chat-cast-person[data-sprite="false"] { justify-content: center; }
.${n}-room-screen .${n}-chat-cast-person > img { width: 100%; height: 100%; max-width: none; object-fit: contain; object-position: center bottom; }
.${n}-room-screen .${n}-chat-cast-person > .${n}-avatar { width: min(8rem, 80%); }
.${n}-room-screen .${n}-chat-cast-person > span:not(.${n}-avatar) { position: absolute; bottom: .3rem; max-width: 95%; }
.${n}-room-screen .${n}-chat-cast[data-staging="true"] > .${n}-chat-cast-person,
.${n}-room-screen .${n}-chat-cast[data-staging="true"] > .${n}-chat-cast-person[data-active="true"] { position: absolute; bottom: 0; left: var(--cast-left); width: var(--cast-width); flex: none; max-width: none; height: 100%; transition: left .22s ease, opacity .18s ease, filter .18s ease, transform .18s ease; }
.${n}-room-screen .${n}-chat-cast[data-staging="true"][data-animate="false"] > .${n}-chat-cast-person { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .${n}-room-screen .${n}-chat-cast[data-staging="true"] > .${n}-chat-cast-person { transition: none; }
}
.${n}-room-screen .${n}-chat-cast-rest { position: absolute; right: .5rem; bottom: .25rem; }
.${n}-room-screen .${n}-chat-vn { position: relative; z-index: 3; flex: 0 0 auto; align-self: center; width: min(72rem, calc(100% - 1.5rem)); margin: 0 auto .5rem; padding: .5rem .75rem; gap: .25rem; border-radius: .85rem; }
.${n}-room-screen .${n}-chat[data-opening-error="true"] .${n}-chat-vn { display: flex; }
.${n}-room-screen .${n}-chat-vn-card { border: 0; border-radius: 0; background: transparent; backdrop-filter: none; box-shadow: none; }
.${n}-room-screen .${n}-chat-vn-row { padding: 0; }
.${n}-room-screen .${n}-chat-vn-column { gap: .18rem; }
.${n}-room-screen .${n}-chat-vn-reading { max-height: 5.8rem; min-height: 1.45rem; padding: 0 .25rem 0 0; overflow-y: auto; }
.${n}-room-screen .${n}-chat-vn-text,
.${n}-room-screen .${n}-chat-vn-beat { max-width: none; padding: 0; border: 0; border-radius: 0; background: transparent; color: var(--foreground); font-size: 1rem; line-height: 1.45; }
.${n}-room-screen .${n}-chat-vn-name,
.${n}-room-screen .${n}-chat-vn-label { align-self: flex-start; margin: 0; padding: 0; border-radius: 0; background: transparent; color: var(--marinara-chat-chrome-highlight-text, var(--primary)); font-size: .72rem; font-weight: 650; line-height: 1.35; letter-spacing: 0; text-transform: none; }
.${n}-room-panel-tools { display: grid; grid-template-columns: minmax(4rem, 1fr) auto minmax(4rem, 1fr); gap: .4rem; min-height: 1.75rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); padding-top: .25rem; }
.${n}-room-panel-tools .${n}-chat-history-toggle { justify-self: start; min-height: 1.75rem; padding: .15rem .35rem; border: 0; background: transparent; font-size: .75rem; }
.${n}-room-panel-tools .${n}-chat-vn-counter { justify-self: center; }
.${n}-room-panel-tools .${n}-chat-vn-nav { justify-self: end; gap: .25rem; padding: 0; border: 0; }
.${n}-room-panel-tools .${n}-chat-vn-button { min-height: 1.75rem; padding: .2rem .4rem; border: 0; color: var(--foreground); }
.${n}-room-screen .${n}-chat-log { position: absolute; z-index: 8; bottom: calc(100% + .45rem); left: 0; width: 100%; max-height: min(55cqh, 32rem); box-sizing: border-box; overflow-y: auto; padding: .75rem; border: 1px solid var(--border); border-radius: .75rem; background: var(--popover); box-shadow: 0 .75rem 2rem #0009; }
.${n}-room-screen .${n}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); overflow-y: auto; }
.${n}-room-screen .${n}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); margin: 0; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${n}-room-screen .${n}-composer { padding-top: .35rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); }
.${n}-room-screen .${n}-chat-input > .${n}-textarea { height: 1.75rem; min-height: 0; max-height: none; overflow-y: hidden; }
.${n}-room-actions-trigger:focus-visible, .${n}-room-actions-menu button:focus-visible, .${n}-room-notices-trigger:focus-visible, .${n}-room-panel-tools button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
@container ${n} (max-width: 44rem) {
  .${n}-room-screen .${n}-chat-stage { min-height: 0; padding-top: 3rem; }
  .${n}-room-screen .${n}-chat-cast-person, .${n}-room-screen .${n}-chat-cast-person[data-active="true"] { flex: 1 1 0; max-width: 25%; height: 100%; }
  .${n}-room-screen .${n}-chat-cast-person > img { height: 100%; }
  .${n}-room-screen .${n}-chat-vn { width: calc(100% - .75rem); margin-bottom: .35rem; padding: .45rem .55rem; }
  .${n}-room-screen .${n}-chat-vn-asides, .${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides { position: absolute; right: .25rem; bottom: calc(100% + .3rem); width: min(52vw, 13rem); max-height: 20cqh; margin: 0; }
  .${n}-room-screen .${n}-chat-vn-asides[data-side="left"], .${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides[data-side="left"] { right: auto; left: .25rem; }
}
@container ${n} (max-height: 30rem) {
  .${n}-room-screen .${n}-chat-stage { min-height: 0; padding-top: 2.5rem; }
  .${n}-room-screen .${n}-chat-vn { width: min(72rem, calc(100% - .75rem)); align-self: center; }
  .${n}-room-screen .${n}-chat-vn-reading { max-height: 4.35rem; }
}
@container ${n} (max-width: 44rem) and (min-height: 40rem) {
  .${n}-room-screen .${n}-chat-vn-asides, .${n}-room-screen[data-mobile="true"] .${n}-chat-vn-asides { bottom: calc(100% + 13rem); }
}
/* Mobile artwork grows independently of the staging slots. Shared zones may overlap,
   but the image boxes stay within the floor and the speaker paints above listeners. */
.${n}-room-screen[data-mobile="true"] .${n}-chat-stage .${n}-chat-cast > .${n}-chat-cast-person,
.${n}-room-screen[data-mobile="true"] .${n}-chat-stage .${n}-chat-cast > .${n}-chat-cast-person[data-active="true"] {
  --cast-display-width: var(--cast-width, 25%);
  position: absolute; bottom: 0; flex: none; max-width: none;
  width: var(--cast-display-width); height: 100%;
  left: clamp(0px, calc(var(--cast-center) - var(--cast-display-width) / 2), calc(100% - var(--cast-display-width)));
  transform: none;
}
.${n}-room-screen[data-mobile="true"] .${n}-chat-stage .${n}-chat-cast > .${n}-chat-cast-person[data-sprite="true"] {
  --cast-display-width: min(70cqw, 66.666667cqh);
}
.${n}-room-screen[data-mobile="true"] .${n}-chat-cast-person > img { flex: 0 0 auto; }
.${n}-room-screen[data-mobile="true"] .${n}-chat-cast-person > img[data-framing="half"] { object-fit: cover; object-position: center top; }
@media (prefers-reduced-motion: reduce) { .${n}-room-screen .${n}-chat-cast-person { transition: none; } }

/* The Menu shares View Venue's palette and keeps its navigation on screen. */
.${n}-root.${n}-sectioned-menu {
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
.${n}-sectioned-menu > .${n}-header {
  grid-column: 1 / -1; grid-row: 1; align-items: center; min-height: 4.5rem; padding: .8rem 1.25rem;
  border-bottom: 1px solid #314782; background: #101f48e8;
}
.${n}-sectioned-menu .${n}-title { font-size: clamp(1.3rem, 2.4cqw, 2rem); font-weight: 700; }
.${n}-sectioned-menu .${n}-subtitle { color: var(--muted-foreground); font-size: .82rem; }
.${n}-sectioned-menu > .${n}-header > .${n}-error { flex-basis: 100%; margin: 0; }
.${n}-sectioned-menu .${n}-menu-nav {
  grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: 1rem; min-height: 0; overflow-y: auto;
  padding: 1rem .7rem; border-right: 1px solid #314782;
  background: radial-gradient(circle at 25% 85%, #274588, transparent 65%), linear-gradient(#10214a, #142a5b);
}
.${n}-sectioned-menu .${n}-menu-group { gap: .45rem; }
.${n}-sectioned-menu .${n}-menu-group > .${n}-panel-title {
  padding: .1rem .5rem; color: #b9c5ff; font-size: .7rem;
}
.${n}-sectioned-menu .${n}-menu-group-buttons { flex-direction: column; align-items: stretch; gap: .25rem; }
.${n}-sectioned-menu .${n}-menu-nav .${n}-button {
  min-height: 2.45rem; border-color: transparent; background: transparent;
  color: var(--foreground); text-align: left; font-size: .85rem;
}
.${n}-sectioned-menu .${n}-menu-nav .${n}-button:hover { border-color: #6a7fc4; background: #253b75; color: white; }
.${n}-sectioned-menu .${n}-menu-nav .${n}-button[data-active="true"] {
  border-color: #8060ff; background: linear-gradient(105deg, #5139b4, #253c8d);
  color: white; box-shadow: 0 0 0 1px #8756ff, 0 0 1rem #683cf955;
}
.${n}-menu-content {
  grid-column: 2; grid-row: 2; box-sizing: border-box; min-width: 0; min-height: 0; overflow-x: hidden; overflow-y: auto;
  padding: clamp(.75rem, 2cqw, 1.5rem);
}
.${n}-menu-content.${n}-panel,
.${n}-menu-content > .${n}-panel,
.${n}-menu-content .${n}-overlay {
  border: 1px solid var(--border); border-radius: .85rem;
  background: linear-gradient(145deg, #172c5e, #101f45); color: var(--foreground);
}
.${n}-menu-content .${n}-panel-title { color: #c7d2ff; font-size: .74rem; }
.${n}-menu-content .${n}-button { min-height: 2.35rem; background: #172d60; color: var(--foreground); font-size: .85rem; }
.${n}-menu-content .${n}-button:hover { border-color: #aa92ff; background: #203774; color: white; }
.${n}-menu-content .${n}-hint,
.${n}-menu-content .${n}-empty,
.${n}-menu-content .${n}-status { font-size: .82rem; line-height: 1.5; }
.${n}-sectioned-menu .${n}-button:focus-visible,
.${n}-sectioned-menu input:focus-visible,
.${n}-sectioned-menu select:focus-visible,
.${n}-sectioned-menu textarea:focus-visible { outline: 3px solid #b6a2ff; outline-offset: 2px; }
.${n}-menu-content input:not([type="checkbox"]):not([type="radio"]),
.${n}-menu-content select, .${n}-menu-content textarea {
  border-color: #5570b0; background: #0c1c42; color: var(--foreground); font-size: .85rem;
}
.${n}-menu-content input::placeholder, .${n}-menu-content textarea::placeholder { color: #aebce3; }
.${n}-menu-content .${n}-notice-row { border-color: #526bb1; background: #1c3568; color: var(--foreground); }
.${n}-menu-content .${n}-notice-author { color: #d9e1ff; }
.${n}-menu-content .${n}-menu-body { gap: 1rem; }
.${n}-sectioned-menu > .${n}-panel.${n}-menu-content { margin: clamp(.75rem, 2cqw, 1.5rem); }
.${n}-menu-welcome { display: grid; align-self: start; gap: .9rem; max-width: 50rem; padding: 1.5rem; }
.${n}-menu-welcome h2 { margin: 0; font-size: clamp(1.4rem, 3cqw, 2.2rem); }
.${n}-menu-welcome p { max-width: 40rem; margin: 0; color: var(--muted-foreground); line-height: 1.6; }
.${n}-menu-quick-links { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .4rem; }
.${n}-menu-debug-action { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin-bottom: 1rem; }
.${n}-menu-debug-action .${n}-status { margin: 0; flex: 1 1 15rem; }
@container (max-width: 48rem) {
  .${n}-root.${n}-sectioned-menu { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto minmax(0, 1fr); }
  .${n}-sectioned-menu .${n}-menu-nav {
    grid-column: 1; grid-row: 2; flex-direction: row; gap: 1.25rem; max-height: 7.5rem;
    overflow-x: auto; overflow-y: hidden; padding: .6rem .75rem;
    border-right: 0; border-bottom: 1px solid #314782;
  }
  .${n}-sectioned-menu .${n}-menu-group { flex: 0 0 auto; }
  .${n}-sectioned-menu .${n}-menu-group-buttons { flex-direction: row; flex-wrap: nowrap; }
  .${n}-sectioned-menu .${n}-menu-nav .${n}-button { flex: 0 0 auto; min-height: 2.5rem; white-space: nowrap; }
  .${n}-menu-content { grid-column: 1; grid-row: 3; padding: .75rem; }
  .${n}-sectioned-menu > .${n}-header { padding: .75rem; }
}
`;function Ag(){let e=document.getElementById(U1);if(!document.querySelector(n)){e?.remove();return}if(e){e.textContent!==xg&&(e.textContent=xg);return}let t=document.createElement("style");t.id=U1,t.textContent=xg,document.head.appendChild(t)}var Qk=new MutationObserver(()=>{document.querySelector(n)&&Ag()});Qk.observe(document.head,{childList:!0,subtree:!0});var Fk="marinara_admin_secret";function ux(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(Fk)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var Jk="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.",Kl=class extends Error{constructor(a,i,r){super(a);kc(this,"status",i);kc(this,"code",r)}};function hx(e,t,a){let i=e?.error,r=typeof i=="string"&&i?i:a;return t===403&&/admin[-_ ]?secret/iu.test(r)?new Error(`${Jk} (${r})`):new Kl(r,t,e?.code)}async function L(e,t){let a=await fetch(`${Uk}${e}`,{...t,headers:ux(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw hx(i,a.status,`The village replied ${a.status}.`);return N1(i)}async function Mg(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:ux(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw hx(i,a.status,`The Engine replied ${a.status}.`);return i}var Gr=e=>typeof e=="number"&&Number.isFinite(e);function zg(e){let t=e;for(let $=0;$<2&&typeof t=="string";$+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:i,srcY:r,srcWidth:s,srcHeight:c}=a;if(Gr(i)&&Gr(r)&&Gr(s)&&Gr(c))return s<=0||c<=0||i<0||r<0||i+s>1.001||r+c>1.001?null:{srcX:i,srcY:r,srcWidth:s,srcHeight:c};let{zoom:d,offsetX:h,offsetY:p,fullImage:b}=a;return!Gr(d)||d<=0||!Gr(h)||!Gr(p)||b!==void 0&&typeof b!="boolean"?null:b===void 0?{zoom:d,offsetX:h,offsetY:p}:{zoom:d,offsetX:h,offsetY:p,fullImage:b}}function Kk(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function Wk(e,t){if(e.length===0)return{};let a=await Mg("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),i={};if(!Array.isArray(a))return i;for(let r of a){let s=typeof r?.id=="string"?r.id:"",c=typeof r?.avatarUrl=="string"?r.avatarUrl.trim():"";s.length>0&&c.length>0&&(i[s]={url:c,crop:zg(r.avatarCrop)})}return i}async function e2(e,t){let a=e.trim();if(a.length===0)return null;let i=await Mg(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),r=typeof i?.avatarPath=="string"?i.avatarPath.trim():"";return r.length===0?null:{url:r,crop:zg(i.avatarCrop)}}function t2(e){let t=[];for(let a of e){let i=typeof a.id=="string"?a.id.trim():"";if(i.length===0)continue;let r=typeof a.provider=="string"?a.provider:"";if(r==="video_generation")continue;let s=typeof a.name=="string"&&a.name.trim()?a.name.trim():i;t.push({id:i,name:s,category:r==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function F(e,t){return e instanceof Error&&e.message?e.message:t}function ys(e){let t=F(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function Z1(e){try{let{session:t}=await L("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}async function ws(e,t){try{t&&await L(`/rooms/${encodeURIComponent(e)}/operations/${encodeURIComponent(t)}`,{signal:AbortSignal.timeout(5e3)});let{session:a}=await L("/rooms/active",{signal:AbortSignal.timeout(5e3)});if(a?.id===e)return a;let{visit:i}=await L(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return i}catch{return null}}async function Q1(e,t){try{let{visit:a}=await L(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return T1(a,t)?a:null}catch{return null}}function F1(e){let t=F(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function $u(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function $s(e,t){return mx(x1(e),t)}function mx(e,t){let a=0;return e.map(i=>{let r=`${t}${a++}`;switch(i.kind){case"text":return i.text;case"code":return(0,o.jsx)("code",{className:`${n}-chat-md-code`,dir:"ltr",children:i.text},r);case"link":return(0,o.jsx)("a",{className:`${n}-chat-md-link`,href:i.href,target:"_blank",rel:"noopener noreferrer",children:i.text},r);default:return a2(i,r)}})}function a2(e,t){let a=mx(e.children,`${t}-`);switch(e.style){case"bold":return(0,o.jsx)("strong",{children:a},t);case"bold-italic":return(0,o.jsx)("strong",{children:(0,o.jsx)("em",{children:a})},t);case"italic":return(0,o.jsx)("em",{children:a},t);case"underline":return(0,o.jsx)("u",{children:a},t);case"strikethrough":return(0,o.jsx)("del",{children:a},t);default:return(0,o.jsx)("mark",{className:`${n}-chat-md-highlight`,children:a},t)}}function n2(e){return e==="off"?"Automatic Events and new wishes are paused. Existing wishes can still be fulfilled or expire.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function Su(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}function i2({zone:e,onSave:t}){let[a,i]=(0,m.useState)(e.description),[r,s]=(0,m.useState)(e.state?.features.map(b=>b.text).join(`
`)??""),[c,d]=(0,m.useState)(!1),[h,p]=(0,m.useState)("");return(0,o.jsxs)("section",{className:n+"-venue-card",children:[(0,o.jsxs)("h2",{children:[e.label," details"]}),(0,o.jsxs)("label",{children:["Description",(0,o.jsx)("textarea",{value:a,onChange:b=>i(b.target.value)})]}),(0,o.jsxs)("label",{children:["Features \xB7 one per line",(0,o.jsx)("textarea",{value:r,onChange:b=>s(b.target.value)})]}),(0,o.jsx)("p",{children:e.area==="shared"||e.area==="private"?"Resident-controlled changes become exact proposals during an invited visit.":"These details describe this zone."}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:c||!a.trim(),onClick:async()=>{d(!0),p("");try{await t({description:a,state:{features:r.split(`
`).map(b=>b.trim()).filter(Boolean).map(b=>({...e.state?.features.find($=>$.text===b),text:b}))}}),p(e.area==="shared"||e.area==="private"?"Saved. Any required resident approvals appear in the Venue.":"Zone saved.")}catch{p("The zone could not be saved. See the message above.")}finally{d(!1)}},children:c?"Saving\u2026":e.area==="shared"||e.area==="private"?"Save / propose zone changes":"Save zone details"}),h?(0,o.jsx)("p",{role:"status",children:h}):null]})}var Ns=["residence","workplace","gathering","other"];function Jn(e){return e.classes?.length?e.classes:Su(e)?["residence"]:["other"]}function J1(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function Nu(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function dn(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function K1({draft:e,existing:t,villagers:a,editableClasses:i,onChange:r}){let s=Jn(e),c=(d,h)=>{let p=s.map(b=>b===d?{...dn(e,b),...h}:dn(e,b));r({...e,spaces:p,description:p[0]?.description??e.description})};return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["Name",(0,o.jsx)("input",{className:`${n}-notice-input`,value:e.name,maxLength:100,onChange:d=>r({...e,name:d.target.value}),placeholder:"The Lantern Workshop"})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Form ",(0,o.jsx)("span",{className:`${n}-hint`,children:"What is it, in your world?"}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:e.form??"",maxLength:200,onChange:d=>r({...e,form:d.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Map pin \xB7 optional"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,o.jsx)("div",{className:`${n}-row`,children:["x","y"].map(d=>(0,o.jsxs)("label",{className:`${n}-label`,children:[d==="x"?"Across":"Down",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[d]??"",disabled:t&&Nu(e)>0,onChange:h=>r({...e,presentation:{...e.presentation,[d]:h.target.value===""?null:Number(h.target.value)}})})]},d))}),t&&Nu(e)>0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${n}-row`,children:Ns.map(d=>(0,o.jsxs)("label",{className:`${n}-label`,style:{textTransform:"capitalize"},children:[(0,o.jsx)("input",{type:"checkbox",checked:s.includes(d),disabled:t||!s.includes(d)&&s.length>=2,onChange:h=>{let p=h.target.checked?[...s,d]:s.filter(b=>b!==d);p.length<1||p.length>2||r({...e,classes:p,spaces:p.map(b=>dn(e,b))})}})," ",d]},d))}),t?(0,o.jsx)("p",{className:`${n}-hint`,children:"Class changes go through a Venue proposal."}):null]}),s.includes("residence")?(0,o.jsxs)("label",{className:`${n}-label`,children:["Resident capacity \xB7 includes you",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:d=>r({...e,residenceCapacity:Number(d.target.value)})}),t?(0,o.jsx)("span",{className:`${n}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,s.includes("workplace")?(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Workers"}),a.map(d=>(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(d.characterId),onChange:h=>r({...e,workerIds:h.target.checked?[...e.workerIds??[],d.characterId]:(e.workerIds??[]).filter(p=>p!==d.characterId)})})," ",d.name]},d.characterId)),a.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No villagers are available yet."}):null]}):null,s.filter(d=>!i||i.includes(d)).map(d=>{let h=dn(e,d);return(0,o.jsxs)("section",{className:`${n}-field`,children:[(0,o.jsxs)("h3",{className:`${n}-panel-title`,style:{textTransform:"capitalize"},children:[d," space"]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.description,maxLength:1e3,onChange:p=>c(d,{description:p.target.value})})]}),(0,o.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Current physical state used by visits and pictures."}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:h.state.condition,onChange:p=>c(d,{state:{...h.state,condition:p.target.value}})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this space."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.state.items.join(`
`),onChange:p=>c(d,{state:{...h.state,items:p.target.value.split(`
`)}})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this space."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.state.publicFacts.join(`
`),onChange:p=>c(d,{state:{...h.state,publicFacts:p.target.value.split(`
`)}})})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((p,b)=>(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("input",{className:`${n}-notice-input`,value:p.text,"aria-label":`Feature ${b+1}`,onChange:$=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===p.id?{...f,text:$.target.value}:f)}})}),(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:p.locked,onChange:$=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===p.id?{...f,locked:$.target.checked}:f)}})})," ","Locked"]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,"aria-label":`Remove feature ${b+1}`,onClick:()=>c(d,{state:{...h.state,features:h.state.features.filter($=>$.id!==p.id)}}),children:"\xD7"})]},p.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:h.state.features.length>=5,onClick:()=>c(d,{state:{...h.state,features:[...h.state.features,{id:sr(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},d)})]})}function xs(e){return e.filter(t=>!Su(t)||Jn(t).some(a=>a!=="residence"))}function vu(){return Math.random().toString(36).slice(2,10)}function Pr(e){return Math.round(e*1e4)/1e4}var r2=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),px=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),o2=6e4,s2=700;function W1(e){return`${r2.format(e)} \xB7 ${px.format(e)}`}function l2(){let[e,t]=(0,m.useState)(()=>W1(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(W1(new Date)),1e3);return()=>clearInterval(a)},[]),e}function c2(){let[e,t]=l2().split(" \xB7 ");return(0,o.jsxs)("span",{className:`${n}-mobile-clock`,children:[(0,o.jsx)("span",{children:e}),(0,o.jsx)("strong",{children:t})]})}function d2({weather:e}){return(0,o.jsxs)("span",{className:`${n}-mobile-datetime`,children:[(0,o.jsx)(c2,{}),(0,o.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:u2(e)})]})}function u2(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function ex(e){return e?.closest(n)??null}function h2(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let r=()=>t(ex(document.fullscreenElement)!==null);return r(),document.addEventListener("fullscreenchange",r),()=>document.removeEventListener("fullscreenchange",r)},[]);let a=document.fullscreenEnabled,i=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":i,title:i,onClick:r=>{let s=ex(r.currentTarget);if(!s)return;if(document.fullscreenElement===s){document.exitFullscreen().catch(()=>{});return}let c=s.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,o.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,o.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,o.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function m2({happenings:e,recap:t,mobile:a=!1}){let i=(0,m.useRef)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=i.current;if(!c)return;let d=()=>s(c.open);return c.addEventListener("toggle",d),()=>c.removeEventListener("toggle",d)},[]),(0,m.useEffect)(()=>{if(!r)return;let c=d=>{!(d.target instanceof Node)||i.current?.contains(d.target)||i.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[r]),(0,o.jsxs)("details",{ref:i,className:`${n}-news`,children:[(0,o.jsxs)("summary",{className:`${n}-button ${n}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,o.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,o.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,o.jsx)("span",{className:`${n}-news-nyi`,children:"NYI"})]}),(0,o.jsxs)("div",{className:`${n}-news-panel`,children:[(0,o.jsx)("h2",{className:`${n}-news-title`,children:"Events"}),t?(0,o.jsxs)("div",{children:[(0,o.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,o.jsx)("ul",{className:`${n}-news-list`,children:t.details.map(c=>(0,o.jsx)("li",{className:`${n}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,o.jsx)("p",{className:`${n}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,o.jsxs)("p",{className:`${n}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,o.jsx)("p",{className:`${n}-news-empty`,children:"No events to show yet."}):(0,o.jsx)("ul",{className:`${n}-news-list`,children:e.map(c=>(0,o.jsx)("li",{className:`${n}-news-item`,children:c.text},c.id))})]})]})}function gx(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function p2(e){return e.length>0?gx(e,!0):"Empty house"}function g2(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function tx(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function f2(e,t){return t.length>0?gx(t,!0):e.name||"An empty house"}function yu(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var b2=.028;function Ss(e){return new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(typeof i.result=="string"?i.result:""),i.onerror=()=>a(new Error("That picture could not be read.")),i.readAsDataURL(e)})}function wu(e){return new Promise((t,a)=>{let i=new Image;i.onload=()=>t({width:i.naturalWidth,height:i.naturalHeight}),i.onerror=()=>a(new Error("That picture could not be read.")),i.src=e})}var ax=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function $g(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}var v2=`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><rect width="640" height="440" fill="#11285b"/><g stroke="#6c9bd5" opacity=".34" stroke-width="1"><path d="M0 40H640M0 80H640M0 120H640M0 160H640M0 200H640M0 240H640M0 280H640M0 320H640M0 360H640M0 400H640M40 0V440M80 0V440M120 0V440M160 0V440M200 0V440M240 0V440M280 0V440M320 0V440M360 0V440M400 0V440M440 0V440M480 0V440M520 0V440M560 0V440M600 0V440"/></g><g fill="none" stroke="#d7e9ff" stroke-width="5" stroke-linejoin="round"><path d="M110 195 320 88 530 195 320 302Z"/><path d="M110 195v150l210 87 210-87V195M320 302v130"/><path d="M212 153v89l108 46 108-46v-89M257 128v76l63 29 63-29v-76"/><path d="M160 221v72l95 40v-72zM385 334l95-40v-72l-95 40z"/></g><g fill="#d7e9ff" font-family="Arial,sans-serif" letter-spacing="9" text-anchor="middle"><text x="320" y="48" font-size="22">VILLAGE PROJECT</text></g></svg>')}`;function Sg(e,t,a){return e<t?t:e>a?a:e}function y2(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),d=e.width*c,h=e.height*c;return{left:(t.width-d)/2,top:(t.height-h)/2,width:d,height:h}}let i=Math.max(t.width/e.width,t.height/e.height)*a.zoom,r=e.width*i,s=e.height*i;return{left:(t.width-r)*(a.focusX/100),top:(t.height-s)*(a.focusY/100),width:r,height:s}}function w2(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Fl(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function Ng({src:e,alt:t,pins:a,placing:i,view:r,shape:s,zoom:c,onPlace:d,onView:h,onDismiss:p,compact:b,fitToRoom:$,mobile:f,photoPins:y,placementCursor:V,children:M}){let O=d!==void 0,S=h!==void 0,v=(0,m.useRef)(null),w=(0,m.useRef)(null),[A,_]=(0,m.useState)(null),[Z,ee]=(0,m.useState)(null),[Q,Te]=(0,m.useState)(null),B=(0,m.useRef)(null),re=(0,m.useRef)(new Map),ve=(0,m.useRef)(null),[ut,Me]=(0,m.useState)(null),[Vt,qt]=(0,m.useState)(null),Qt=(0,m.useRef)(null),z=(0,m.useRef)(null),j=(0,m.useRef)(!1),[me,ye]=(0,m.useState)(null),te=(0,m.useMemo)(()=>me?{...r,...me}:r,[me,r]),Be=(0,m.useMemo)(()=>e?A?.src===e?A:null:s??{width:1280,height:720},[e,A,s]),Ge={zoom:Be&&Z?gu(Be,Z):1,centerX:.5,centerY:.5},at=Q??Ge,ie=(0,m.useMemo)(()=>f?Be&&Z?fg(Be,Z,at):null:e?A&&A.src===e&&Z?y2(A,Z,te):null:Z?{left:0,top:0,width:Z.width,height:Z.height}:null,[A,Z,te,f,Be,at,e]);(0,m.useEffect)(()=>{Te(null),B.current=null,re.current.clear(),ve.current=null},[e]);let ht=s?$&&ut?{width:`${ut.width}px`,height:`${ut.height}px`,aspectRatio:`${s.width} / ${s.height}`}:{aspectRatio:`${s.width} / ${s.height}`}:void 0,qe=(0,m.useCallback)(()=>{let I=w.current;if(!I)return;let X=I.getBoundingClientRect();X.width===0||X.height===0||ee(we=>we&&we.width===X.width&&we.height===X.height?we:{width:X.width,height:X.height})},[]);(0,m.useEffect)(()=>{let I=w.current;if(!I||typeof ResizeObserver>"u")return;let X=new ResizeObserver(()=>qe());return X.observe(I),()=>X.disconnect()},[qe]);let Ot=(0,m.useCallback)(()=>{let I=v.current?.parentElement;if(!I||!s)return;let X=I.getBoundingClientRect(),we=getComputedStyle(I),je=P=>Number.parseFloat(we.getPropertyValue(P))||0,Le=X.width-je("padding-left")-je("padding-right"),Ne=X.height-je("padding-top")-je("padding-bottom"),oe=s.width/s.height,Ze=Math.min(Le,Ne*oe);Ze>0&&Me(P=>P&&Math.abs(P.width-Ze)<.5?P:{width:Ze,height:Ze/oe})},[s]);(0,m.useLayoutEffect)(()=>{if(!$||(Ot(),typeof ResizeObserver>"u"))return;let I=v.current?.parentElement;if(!I)return;let X=new ResizeObserver(()=>Ot());return X.observe(I),()=>X.disconnect()},[$,Ot]);let st=(0,m.useCallback)(I=>{if(!O||!d||!ie)return;let X=I.currentTarget.getBoundingClientRect(),we=(I.clientX-X.left-ie.left)/ie.width,je=(I.clientY-X.top-ie.top)/ie.height;if(!(we>=0&&we<=1)||!(je>=0&&je<=1))return;let Ne=w.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();d(Pr(we),Pr(je),{width:ie.width,height:ie.height,photoWidth:Ne?.width??58,photoHeight:Ne?.height??58})},[d,O,ie]),$t=(0,m.useCallback)(I=>{if(!S||!ie||!h||te.fit!=="cover")return;let X=I.currentTarget.getBoundingClientRect();Qt.current={x:I.clientX,y:I.clientY,focusX:te.focusX,focusY:te.focusY,spanX:X.width-ie.width,spanY:X.height-ie.height},ye({focusX:te.focusX,focusY:te.focusY}),I.currentTarget.setPointerCapture(I.pointerId),I.preventDefault()},[S,te.focusX,te.focusY,te.fit,h,ie]),pe=(0,m.useCallback)(I=>{let X=Qt.current;if(!X)return;let we=X.spanX===0?X.focusX:X.focusX+(I.clientX-X.x)/X.spanX*100,je=X.spanY===0?X.focusY:X.focusY+(I.clientY-X.y)/X.spanY*100;ye({focusX:Pr(Sg(we,0,100)),focusY:Pr(Sg(je,0,100))})},[]),ge=(0,m.useCallback)(I=>{if(!Qt.current)return;Qt.current=null,I.currentTarget.hasPointerCapture(I.pointerId)&&I.currentTarget.releasePointerCapture(I.pointerId);let X=me;ye(null),X&&h&&h({...r,...X})},[me,h,r]),he=(0,m.useCallback)(I=>{!h||!c||h({...r,zoom:Pr(Sg(I,c.min,c.max))})},[h,r,c]),lt=()=>{let I=[...re.current.values()];if(I.length===0){ve.current=null;return}let X=I[0],we=I[1];ve.current={view:B.current??at,x:we?(X.x+we.x)/2:X.x,y:we?(X.y+we.y)/2:X.y,distance:we?Math.hypot(X.x-we.x,X.y-we.y):1}},kt=I=>{if(!f||I.pointerType!=="touch"||(I.isPrimary&&(re.current.clear(),j.current=!1),!w.current)||I.target instanceof Element&&I.target.closest(`.${n}-doors, .${n}-zoom`))return;v.current?.setAttribute("data-mobile-gesturing","true");let X=w.current.getBoundingClientRect();re.current.set(I.pointerId,{x:I.clientX-X.left,y:I.clientY-X.top}),re.current.size>1&&(j.current=!0),lt()},nt=I=>{if(!f||!re.current.has(I.pointerId)||!Be||!Z||!w.current)return;let X=w.current.getBoundingClientRect();re.current.set(I.pointerId,{x:I.clientX-X.left,y:I.clientY-X.top});let we=[...re.current.values()],je=we[0],Le=we[1],Ne=Le?(je.x+Le.x)/2:je.x,oe=Le?(je.y+Le.y)/2:je.y,Ze=Le?Math.hypot(je.x-Le.x,je.y-Le.y):1,P=ve.current;if(!P||!I1(P,{x:Ne,y:oe,distance:Ze})&&!j.current)return;j.current||p?.(),j.current=!0;let It=D1(Be,Z,P.view,{x:P.x,y:P.y},{x:Ne,y:oe},Le&&P.distance>0?Ze/P.distance:1);B.current=It,Te(It)},Lt=(I,X)=>{let we=je=>{document.removeEventListener("click",we,!0),Math.abs(je.clientX-I)<3&&Math.abs(je.clientY-X)<3&&(je.preventDefault(),je.stopImmediatePropagation())};document.addEventListener("click",we,!0),window.setTimeout(()=>document.removeEventListener("click",we,!0),500)},Ve=(I,X=!1)=>{if(!f||!re.current.has(I.pointerId))return;let we=!X&&re.current.size===1&&!j.current;if(re.current.delete(I.pointerId),re.current.size===0&&v.current?.removeAttribute("data-mobile-gesturing"),lt(),!we||!(I.target instanceof Element))return;let je=I.target.closest(`.${n}-pin`)?.dataset.pinId,Le=je?a.find(Ne=>Ne.id===je):null;if(Le?.onSelect){j.current=!0,Lt(I.clientX,I.clientY),Le.onSelect();return}if(!(!I.target.closest(`.${n}-canvas`)||I.target.closest("button")))if(O&&i&&d&&ie){let Ne=w.current.getBoundingClientRect(),oe=(I.clientX-Ne.left-ie.left)/ie.width,Ze=(I.clientY-Ne.top-ie.top)/ie.height;if(oe>=0&&oe<=1&&Ze>=0&&Ze<=1){j.current=!0;let gt=w.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();Lt(I.clientX,I.clientY),d(Pr(oe),Pr(Ze),{width:ie.width,height:ie.height,photoWidth:gt?.width??72,photoHeight:gt?.height??72})}}else p&&(j.current=!0,p())};return(0,o.jsxs)("div",{ref:v,className:`${n}-stage${b?` ${n}-stage-compact`:""}`,style:ht,"data-shaped":s?"true":"false","data-framing":S&&te.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":y?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:I=>{if(f){kt(I);return}j.current=!1,z.current=I.pointerType==="touch"?{x:I.clientX,y:I.clientY}:null},onPointerMoveCapture:I=>{if(f){nt(I);return}let X=z.current;X&&(Math.abs(I.clientX-X.x)>8||Math.abs(I.clientY-X.y)>8)&&(j.current=!0)},onPointerUpCapture:f?Ve:void 0,onPointerCancelCapture:I=>{f&&Ve(I,!0),z.current&&(j.current=!0)},onClickCapture:I=>{j.current&&(j.current=!1,I.preventDefault(),I.stopPropagation())},children:[M,(0,o.jsxs)("div",{ref:w,className:`${n}-canvas`,"data-placing":O&&i?"true":"false","data-dragging":me?"true":"false",onClick:O&&i?st:p?()=>p():void 0,onPointerDown:S?$t:void 0,onPointerMove:S?pe:void 0,onPointerUp:S?ge:void 0,onPointerCancel:S?ge:void 0,children:[e?(0,o.jsx)("img",{className:`${n}-canvas-img`,style:f&&ie?{position:"absolute",left:ie.left,top:ie.top,width:ie.width,height:ie.height,objectFit:"fill"}:w2(te),src:e,alt:t,draggable:!1,onLoad:I=>{let{naturalWidth:X,naturalHeight:we}=I.currentTarget;X<=0||we<=0||(_({src:e,width:X,height:we}),qe())},onError:()=>qt(e)}):(0,o.jsxs)(o.Fragment,{children:[f&&ie?(0,o.jsx)("span",{className:`${n}-mobile-logical`,style:{left:ie.left,top:ie.top,width:ie.width,height:ie.height},"aria-hidden":"true"}):null,(0,o.jsx)("span",{className:`${n}-canvas-empty`,children:"Logical village map"})]}),e&&Vt===e?(0,o.jsx)("span",{className:`${n}-canvas-missing`,children:"The map picture could not be loaded \u2014 choose another one in Village Settings \u2192 Village Map."}):null,ie&&V&&i?(0,o.jsx)("span",{className:`${n}-placement-cursor`,"aria-hidden":"true",style:{position:"absolute",left:ie.left+V.x*ie.width,top:ie.top+V.y*ie.height,zIndex:3,pointerEvents:"none",border:"2px solid #d5c6ff",background:"#251a3a99",borderRadius:"50%",width:"1rem",height:"1rem",transform:"translate(-50%,-50%)"}}):null,ie?a.map(I=>(0,o.jsxs)("span",{className:`${n}-pin-holder`,"data-selected":I.selected?"true":"false",style:{left:`${ie.left+I.x*ie.width}px`,top:`${ie.top+(I.y+(f&&I.kind!=="person"?0:I.dy??0))*ie.height}px`},children:[(0,o.jsx)("button",{type:"button",className:`${n}-pin`,"data-pin-id":I.id,"data-tone":I.tone,"data-kind":I.kind??"place","data-selected":I.selected?"true":"false","aria-expanded":I.doors?!0:void 0,disabled:I.onSelect===void 0,title:I.text,onClick:X=>{X.stopPropagation(),I.onSelect?.()},children:(f||y)&&I.kind!=="person"?(0,o.jsxs)("span",{className:`${n}-pin-photo-card`,style:{transform:`scale(${H1(f?_1(at.zoom,Ge.zoom):qk,I.selected===!0)})`},children:[(0,o.jsxs)("span",{className:`${n}-pin-photo`,"aria-hidden":"true",children:[I.image?(0,o.jsx)("img",{src:I.image,alt:"",loading:"lazy",draggable:!1}):(0,o.jsx)("span",{className:`${n}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,o.jsx)("span",{className:`${n}-pin-photo-tack`})]}),(0,o.jsx)("span",{className:`${n}-pin-name`,children:I.text})]}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("span",{"aria-hidden":"true",className:`${n}-pin-tack`,children:(0,o.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,o.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,o.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,o.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,o.jsx)("span",{className:`${n}-pin-name`,children:I.text})]})}),I.onRemove?(0,o.jsx)("button",{type:"button",className:`${n}-pin-remove`,"aria-label":`Take ${I.text} off the map`,onClick:X=>{X.stopPropagation(),I.onRemove?.()},children:"\xD7"}):null,I.onResume?(0,o.jsx)("button",{type:"button",className:`${n}-pin-resume`,onClick:X=>{X.stopPropagation(),I.onResume?.()},children:"DEBUG: Resume Chat"}):null]},I.id)):null]}),ie?a.filter(I=>I.doors!==void 0&&I.doors.length>0).map(I=>(0,o.jsx)("div",{className:`${n}-doors`,style:{left:`${Z?bg(ie,Z,I).left:ie.left+I.x*ie.width}px`,top:`${Z?bg(ie,Z,I).top:ie.top+(I.y+(I.dy??0))*ie.height}px`},children:I.doors?.map(X=>(0,o.jsx)("button",{type:"button",className:`${n}-door`,onClick:we=>{we.stopPropagation(),X.onSelect()},children:X.label},X.label))},`doors:${I.id}`)):null,S&&c&&te.fit==="cover"?(0,o.jsxs)("div",{className:`${n}-zoom`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:te.zoom>=c.max,onClick:()=>he(te.zoom+c.step),children:"+"}),(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:te.zoom<=c.min,onClick:()=>he(te.zoom-c.step),children:"\u2212"}),(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:te.focusX===50&&te.focusY===50&&te.zoom===c.min,onClick:()=>{h&&h({...r,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function Jl(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function x2({scenario:e}){let t=Bk(e),[a,i]=(0,m.useState)(null);return(0,o.jsxs)("div",{className:`${n}-scenario-art-panel`,children:[a===t?(0,o.jsx)("span",{className:`${n}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,o.jsx)("img",{src:t,alt:`${Xr(e).label} village scene`,onError:()=>i(t)}),(0,o.jsxs)("div",{className:`${n}-scenario-art-content`,children:[(0,o.jsx)("p",{children:"A new beginning awaits."}),(0,o.jsx)("strong",{children:Xr(e).description})]})]})}function $2({label:e,choices:t,selectedId:a,onSelect:i,disabled:r,emptyMessage:s}){return t.length?(0,o.jsx)("div",{className:`${n}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,o.jsxs)("button",{type:"button",className:`${n}-identity-card`,"aria-pressed":a===c.id,disabled:r,onClick:()=>i(c.id),children:[(0,o.jsx)(Zr,{portrait:c.portrait,name:c.name,className:`${n}-identity-card-face`,glyph:"person"}),(0,o.jsx)("strong",{children:c.name}),c.hint?(0,o.jsx)("small",{children:c.hint}):null]},c.id))}):(0,o.jsx)("p",{className:`${n}-hint`,children:s})}function S2({value:e}){return(0,o.jsxs)("section",{className:`${n}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,o.jsx)(Zr,{portrait:e.portrait,name:e.name,className:`${n}-identity-preview-face`,glyph:"person"}),(0,o.jsxs)("div",{className:`${n}-identity-preview-copy`,children:[(0,o.jsx)("h3",{children:e.name}),e.overview?(0,o.jsx)("p",{className:`${n}-identity-overview`,children:e.overview}):null,e.details.length?(0,o.jsx)("dl",{className:`${n}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:t}),(0,o.jsx)("dd",{children:a})]},t))}):null,(0,o.jsx)("p",{className:`${n}-identity-context`,children:e.context})]})]})}function nx(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let i=a.lastIndexOf(" ",t),r=a.indexOf(" ",t);return`${a.slice(0,i>0?i:r>0?r:a.length).trimEnd()}\u2026`}function ix(e){return e.avatarPath?{url:e.avatarPath,crop:zg(e.avatarCrop)}:void 0}function N2({personas:e,draft:t,onDraft:a,disabled:i}){let[r,s]=(0,m.useState)(""),[c,d]=(0,m.useState)(null),[h,p]=(0,m.useState)(""),b=e?.find(M=>M.id===t),$=b?.id,f=r.trim().toLocaleLowerCase(),y=(e??[]).filter(M=>!f||`${M.name} ${M.summary}`.toLocaleLowerCase().includes(f)).sort((M,O)=>M.name.localeCompare(O.name,void 0,{sensitivity:"base"})).map(M=>({id:M.id,name:M.name,portrait:ix(M),hint:M.summary}));(0,m.useEffect)(()=>{if(d(null),p(""),!t||!$)return;let M=new AbortController;return L(`/personas/${encodeURIComponent(t)}`,{signal:M.signal}).then(O=>{M.signal.aborted||d(O.persona)}).catch(O=>{M.signal.aborted||p(F(O,"This Persona could not be read."))}),()=>M.abort()},[t,$]);let V=c&&c.id===t?{id:c.id,name:c.name,portrait:ix(c),overview:nx(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,M])=>M.trim()).map(([M,O])=>({label:M,text:nx(O,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,o.jsxs)("div",{className:`${n}-founding-persona`,children:[(0,o.jsxs)("div",{className:`${n}-identity-picker-head`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-persona-search`,children:"Who are you?"}),(0,o.jsx)("input",{id:`${n}-setup-persona-search`,className:`${n}-search`,type:"search",value:r,placeholder:"Search Personas",onChange:M=>s(M.target.value),disabled:i||e===null})]}),(0,o.jsx)($2,{label:"Choose a Persona",choices:y,selectedId:t,onSelect:a,disabled:i,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!b?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):V?(0,o.jsx)(S2,{value:V}):h?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:h}):b?(0,o.jsxs)("p",{className:`${n}-hint`,children:["Reading ",b.name,"\u2026"]}):(0,o.jsx)("p",{className:`${n}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function k2({idPrefix:e,personas:t,draft:a,onDraft:i,storedId:r,storedName:s,storedMissing:c,disabled:d}){let h=(t??[]).find(f=>f.id===a)??null,p=h?.name??(a===r?s:""),b=c&&a===r,$=a.length>0;return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-${e}-persona`,children:"Who are you?"}),(0,o.jsxs)("select",{id:`${n}-${e}-persona`,className:`${n}-select`,value:a,disabled:d||t===null||t.length===0,onChange:f=>i(f.target.value),children:[(0,o.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,o.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),$?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:b?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":p.length>0?`The villagers know you as ${p}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,o.jsx)("p",{className:`${n}-macro-help`,children:h.summary}):null]}):null]})}function rx({books:e,error:t,selected:a,onChange:i,disabled:r}){let[s,c]=(0,m.useState)(""),d=new Map((e??[]).map(y=>[y.id,y])),h=(e??[]).filter(y=>!y.hiddenFromLibrary||a.includes(y.id)),p=a.filter(y=>!d.has(y)),$=[...h,...p.map(y=>({id:y,name:y,enabled:!1}))].filter(y=>y.name.toLocaleLowerCase().includes(s.trim().toLocaleLowerCase())),f=$.slice(0,50);return(0,o.jsxs)("fieldset",{className:`${n}-field ${n}-lore-picker`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Lorebooks for this village"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,o.jsx)("div",{className:`${n}-lore-selected`,"aria-live":"polite",children:a.length?a.map(y=>(0,o.jsxs)("span",{className:`${n}-lore-chip`,children:[(0,o.jsxs)("span",{children:[d.get(y)?.name??y,e===null?" (checking)":d.has(y)?d.get(y)?.enabled?"":" (disabled)":" (missing)"]}),(0,o.jsx)("button",{type:"button","aria-label":`Remove ${d.get(y)?.name??y}`,disabled:r,onClick:()=>i(a.filter(V=>V!==y)),children:"\xD7"})]},y)):(0,o.jsx)("span",{className:`${n}-hint`,children:"No lorebooks selected."})}),t?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:t}):null,e===null&&!t?(0,o.jsx)("p",{className:`${n}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No lorebooks in the Engine library."}):null,(0,o.jsxs)("details",{className:`${n}-lore-options`,children:[(0,o.jsxs)("summary",{className:`${n}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,o.jsx)("input",{type:"search",className:`${n}-search`,value:s,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:y=>c(y.target.value)}),(0,o.jsxs)("div",{className:`${n}-lore-results`,children:[f.map(y=>{let V=a.includes(y.id),M=p.includes(y.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":y.enabled?"":"Disabled \u2014 skipped";return(0,o.jsxs)("label",{className:`${n}-reason-option`,children:[(0,o.jsx)("input",{type:"checkbox",checked:V,disabled:r||!y.enabled&&!V||!V&&a.length>=24,onChange:()=>i(V?a.filter(O=>O!==y.id):[...a,y.id])}),y.name,M?` (${M})`:""]},y.id)}),e!==null&&$.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No matching lorebooks."}):null,$.length>f.length?(0,o.jsx)("p",{className:`${n}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function ox({id:e,label:t,hint:a,options:i,value:r,disabled:s,onChange:c}){let d=r.length>0&&!i.some(h=>h.id===r);return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:e,children:t}),(0,o.jsxs)("select",{id:e,className:`${n}-select`,value:r,disabled:s,onChange:h=>c(h.target.value),children:[(0,o.jsx)("option",{value:"",children:"Engine default"}),d?(0,o.jsx)("option",{value:r,children:"Missing \u2014 this connection is gone"}):null,i.map(h=>(0,o.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,o.jsx)("span",{className:`${n}-hint`,children:a})]})}function kg({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[i,r]=(0,m.useState)(null),[s,c]=(0,m.useState)([]),[d,h]=(0,m.useState)(""),[p,b]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let O=!1;return(async()=>{try{let[S,v]=await Promise.all([L("/connections"),Mg("/api/connections")]);if(O)return;r(S),c(t2(Array.isArray(v)?v:[]))}catch(S){O||h(F(S,"This agent's connections could not be read."))}})(),()=>{O=!0}},[]);let $=(0,m.useCallback)(async O=>{b(!0),h("");try{r(await L("/connections",{method:"PUT",body:JSON.stringify(O)}))}catch(S){h(F(S,"That connection could not be saved."))}finally{b(!1)}},[]),f=s.filter(O=>O.category==="language"),y=s.filter(O=>O.category==="image_generation"),V=y.some(O=>O.defaultForAgents),M=i!==null&&(i.imageConnectionId===yg||y.length===0||i.imageConnectionId.length===0&&!V);return(0,m.useEffect)(()=>{if(!e)return;let O=i?.systemConnectionId??"",S=i?.narrationConnectionId??"";i?O.length===0||S.length===0?e("Choose both System and Narration connections before continuing."):!f.some(v=>v.id===O)||!f.some(v=>v.id===S)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,i,f]),(0,m.useEffect)(()=>{t?.(M)},[M,t]),(0,o.jsxs)("div",{className:`${n}-field ${a?`${n}-connections-compact`:""}`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Connections"}),a?(0,o.jsx)("p",{className:`${n}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,o.jsx)("p",{className:`${n}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),i?(0,o.jsxs)("div",{className:a?`${n}-connections-grid`:"",children:[(0,o.jsx)(ox,{id:`${n}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:f,value:i.systemConnectionId,disabled:p,onChange:O=>{$({systemConnectionId:O})}}),(0,o.jsx)(ox,{id:`${n}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:f,value:i.narrationConnectionId,disabled:p,onChange:O=>{$({narrationConnectionId:O})}}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-connection-image`,children:"Images"}),(0,o.jsxs)("select",{id:`${n}-connection-image`,className:`${n}-select`,value:i.imageConnectionId,disabled:p,onChange:O=>{$({imageConnectionId:O.target.value})},children:[(0,o.jsx)("option",{value:yg,children:"Disabled"}),(0,o.jsx)("option",{value:"",children:"Use Engine default"}),i.imageConnectionId.length>0&&i.imageConnectionId!==yg&&!y.some(O=>O.id===i.imageConnectionId)?(0,o.jsx)("option",{value:i.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,y.map(O=>(0,o.jsx)("option",{value:O.id,children:O.name},O.id))]}),(0,o.jsx)("span",{className:`${n}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,o.jsxs)(o.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,o.jsxs)("span",{className:`${n}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,o.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):d.length===0?(0,o.jsx)("span",{className:`${n}-hint`,children:"Reading this agent's connections\u2026"}):null,d?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:d}):null]})}function C2(){let[e,t]=(0,m.useState)(null),[a,i]=(0,m.useState)(""),[r,s]=(0,m.useState)(!1),[c,d]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let p=!1;return L("/narration").then(b=>{p||t(b)}).catch(b=>{p||i(F(b,"Village writing settings could not be read."))}),()=>{p=!0}},[]);let h=(0,m.useCallback)(async p=>{s(!0),d(!1),i("");try{let b=await L("/narration",{method:"PUT",body:JSON.stringify(p)});return t(b),d(!0),b}catch(b){return i(F(b,"That writing change could not be saved.")),null}finally{s(!1)}},[]);return{view:e,error:a,busy:r,saved:c,save:h}}function T2(){let{view:e,error:t,busy:a,saved:i,save:r}=C2(),[s,c]=(0,m.useState)(null),d=s??e?.writingGuidance??"";return(0,o.jsxs)("div",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Additional writing guidance"}),(0,o.jsx)("p",{className:n+"-empty",children:"Optionally influence narration and dialogue in this village. Resident cards, scene facts, and the player's choices remain in charge. Leave this empty for Villages' own scene writing. Saved changes apply to the next generated venue turn."}),e?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("textarea",{className:n+"-textarea","aria-label":"Additional writing guidance",value:d,rows:5,maxLength:e.writingGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.writingGuidance,onClick:()=>{r({writingGuidance:d}).then(h=>{h&&c(h.writingGuidance)})},children:"Apply guidance"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||!d,onClick:()=>{r({writingGuidance:""}).then(h=>{h&&c(h.writingGuidance)})},children:"Clear guidance"}),(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Tense"}),(0,o.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{r({tense:h.target.value})},children:[(0,o.jsx)("option",{value:"present",children:"Present"}),(0,o.jsx)("option",{value:"past",children:"Past"})]})]}),(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Person"}),(0,o.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{r({person:h.target.value})},children:[(0,o.jsx)("option",{value:"first",children:"First person (I)"}),(0,o.jsx)("option",{value:"second",children:"Second person (you)"}),(0,o.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Content rating"}),(0,o.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{r({rating:h.target.value})},children:[(0,o.jsx)("option",{value:"sfw",children:"SFW"}),(0,o.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,o.jsx)("span",{className:n+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,o.jsx)("span",{className:n+"-hint",children:"Reading village writing settings\u2026"}),a?(0,o.jsx)("span",{className:n+"-hint",children:"Saving\u2026"}):null,i&&!a?(0,o.jsx)("span",{className:n+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:t}):null]})}function Zr({portrait:e,name:t,className:a,glyph:i="initial"}){return(0,o.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,o.jsx)("img",{src:e.url,alt:"",style:Kk(e.crop)}):i==="person"?(0,o.jsxs)("svg",{className:`${n}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,o.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,o.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function E2({villager:e,portrait:t,selected:a,onSelect:i}){return(0,o.jsxs)("div",{className:`${n}-tile`,"data-selected":a?"true":"false",children:[(0,o.jsxs)("div",{className:`${n}-tile-head`,children:[(0,o.jsx)(Zr,{portrait:t,name:e.name,className:`${n}-avatar`}),(0,o.jsx)("button",{type:"button",className:`${n}-tile-name`,onClick:i,disabled:i===void 0,title:i?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,o.jsx)("p",{className:`${n}-tile-summary`,children:e.summary}):null,(0,o.jsxs)("div",{className:`${n}-tile-meta`,children:[e.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(r=>(0,o.jsx)("span",{className:`${n}-tag`,children:r},r))]})]})}function sx(e,t){let a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=e,i.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function A2(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort(($,f)=>{let y=V=>{let M=j1.indexOf(V);return M<0?j1.length:M};return y($.label)-y(f.label)||$.label.localeCompare(f.label)||$.view.localeCompare(f.view)}),i=512,r=768,s=2,c=document.createElement("canvas");c.width=s*i,c.height=Math.ceil(a.length/s)*r;let d=c.getContext("2d");if(!d)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let $=0;$<a.length;$+=1){let f=a[$],y=new Image;y.src=f.url,await y.decode();let V=$%s*i,M=Math.floor($/s)*r,O=Math.min(i/y.naturalWidth,r/y.naturalHeight),S=Math.round(y.naturalWidth*O),v=Math.round(y.naturalHeight*O);d.drawImage(y,V+Math.floor((i-S)/2),M+r-v,S,v),h.push({view:f.view,expression:f.label,x:V,y:M,width:i,height:r})}let p=await new Promise(($,f)=>c.toBlob(y=>y?$(y):f(new Error("The browser could not export this sheet.")),"image/png")),b=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";sx(`${b}-sprites.png`,p),sx(`${b}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function R2({entry:e,onDecide:t}){let[a,i]=(0,m.useState)(e.improvement?.title??""),[r,s]=(0,m.useState)(e.improvement?.description??""),[c,d]=(0,m.useState)(e.improvement?.extraBeds??0),[h,p]=(0,m.useState)(e.improvementSlot??0),[b,$]=(0,m.useState)(!1),[f,y]=(0,m.useState)(""),V=O=>{$(!0),y(""),t(O,{title:a,description:r,extraBeds:c,slot:h}).catch(S=>y(F(S,"That Venue request could not be decided."))).finally(()=>$(!1))},M=a!==e.improvement?.title||r!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["Proposed improvement",(0,o.jsx)("input",{className:`${n}-notice-input`,value:a,onChange:O=>i(O.target.value)})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["What changes?",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:r,onChange:O=>s(O.target.value)})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:O=>d(Number(O.target.value))})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:h,onChange:O=>p(Number(O.target.value)),children:[(0,o.jsx)("option",{value:0,children:"Slot 1"}),(0,o.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:b||!a.trim()||!r.trim(),onClick:()=>V(!0),children:M?"Send counteroffer":"Approve exact request"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:b,onClick:()=>V(!1),children:"Decline"})]}),f?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:f}):null]})}function M2({room:e,nameColors:t,speechColors:a,picture:i,draft:r,mode:s,targetId:c,busy:d,error:h,greetingNotice:p,ruling:b,open:$,ended:f,playerName:y,playerPortrait:V,portraits:M,sprites:O,onDraft:S,onMode:v,onTarget:w,onSend:A,onViewVenue:_,onEnterPrivate:Z,privateSpaceOwnerName:ee,onEnd:Q,onLeavePending:Te,endFailed:B,reviewing:re,onRetryGreeting:ve,onContinueWithoutGreeting:ut,notices:Me,onDismissNotice:Vt,debugDiscardEnabled:qt,onDebugDiscard:Qt,onUseMailbox:z,onProjects:j}){let[me,ye]=(0,m.useState)(0),[te,Be]=(0,m.useState)(!1),[Ge,at]=(0,m.useState)(!1),[ie,ht]=(0,m.useState)(!1),[qe,Ot]=(0,m.useState)(!1),[st,$t]=(0,m.useState)(null),pe=(0,m.useRef)(null),ge=(0,m.useRef)(null),he=(0,m.useRef)(null),lt=(0,m.useRef)(null),kt=(0,m.useRef)(null),nt=(0,m.useRef)(null),Lt=(0,m.useRef)(null),Ve=(0,m.useRef)(null),I=(0,m.useRef)(null),X=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let E=new Set(Me.map(H=>H.id)),x=Me.some(H=>H.kind==="memory"&&!X.current.has(H.id));X.current=E,x?ht(!0):Me.length===0&&ht(!1)},[Me,e.id]),(0,m.useEffect)(()=>{te&&window.requestAnimationFrame(()=>nt.current?.focus())},[te]),(0,m.useEffect)(()=>{if(!Ge)return;let E=H=>{Ve.current?.contains(H.target)||at(!1)},x=H=>{H.key==="Escape"&&at(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("keydown",x),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("keydown",x)}},[Ge]),(0,m.useEffect)(()=>{if(!qe)return;let E=H=>{lt.current?.contains(H.target)||Ot(!1)},x=H=>{H.key==="Escape"&&Ot(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("focusin",E),document.addEventListener("keydown",x),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("focusin",E),document.removeEventListener("keydown",x)}},[qe]);let we=(0,m.useCallback)(()=>{$t(null),window.requestAnimationFrame(()=>pe.current?.focus())},[]),je=new Set((e.submissions??[]).flatMap(E=>(E.recollections??[]).map(x=>x.id))).size;(0,m.useEffect)(()=>{if(!st)return;window.requestAnimationFrame(()=>ge.current?.focus());let E=x=>{if(x.key==="Tab"){x.preventDefault(),ge.current?.focus();return}x.key==="Escape"&&(x.preventDefault(),we())};return window.addEventListener("keydown",E),()=>window.removeEventListener("keydown",E)},[we,st]);let Le=(0,m.useMemo)(()=>{let E=[],x=R1(e.lines,e.submissions??[]),H=new Map,Y=new Map;for(let G of e.lines){if(G.kind!=="side"&&G.kind!=="whisper"||!G.asideFor)continue;let se=Y.get(G.asideFor)??[];se.push({register:G.kind,text:G.content,...G.targetId?{target:e.participants.find(We=>We.characterId===G.targetId)?.name??G.targetId}:{},speakerId:G.speakerId,name:G.name,expression:G.expression,gazeAt:G.gazeAt}),Y.set(G.asideFor,se),H.set(G.asideFor,[...H.get(G.asideFor)??[],G])}for(let G of e.lines){if(G.kind==="side"||G.kind==="whisper")continue;let se=G.speakerId.length===0,We=w1(G.content,G.beats??null),Aa=H.get(G.id??"")??[],un=[G,...Aa].map(Nn=>x.get(Nn.id??"")),ra=un.find(Nn=>Nn?.beforeIds)?.beforeIds,ea=un.find(Nn=>Nn?.afterIds)?.afterIds;We.paragraphs.forEach((Nn,hn)=>{E.push({key:`${E.length}`,...e.stagingVersion===1?{stagingEvent:{cues:[...hn===0?gg(G):[],...hn===We.paragraphs.length-1?Aa.flatMap(gg):[]],...hn===0&&ra?{beforeIds:ra}:{},...hn===We.paragraphs.length-1&&ea?{afterIds:ea}:{}}}:{},speakerId:se?"":G.speakerId,name:se?y:G.name,player:se,text:Nn,asides:[...We.asides[hn]??[],...hn===We.paragraphs.length-1?Y.get(G.id??"")??[]:[]],...G.kind?{register:G.kind==="narration"?"narration":"speech"}:{},...G.expression?{expression:G.expression}:{},...G.gazeAt?{gazeAt:G.gazeAt}:{}})})}return E},[y,e.lines,e.participants,e.stagingVersion,e.submissions]);(0,m.useLayoutEffect)(()=>{ye(E=>C1(I.current,e.id,Le.length,E)),I.current={roomId:e.id,stepCount:Le.length}},[e.id,Le.length]);let Ne=Math.min(me,Math.max(0,Le.length-1)),oe=Le[Ne],P=(0,m.useMemo)(()=>e.stagingVersion===1?A1(e.participants.map(E=>E.characterId),Le.map(E=>E.stagingEvent??{})):[],[e.stagingVersion,e.participants,Le])[Ne],gt=P?.state??pg(e.participants.map(E=>E.characterId)),It=(0,m.useRef)(null),de=(0,m.useMemo)(()=>It.current?.roomId===e.id&&!It.current.restoring&&Ne>It.current.at,[e.id,Ne]);(0,m.useLayoutEffect)(()=>{let E=It.current?.roomId!==e.id;It.current={roomId:e.id,at:Ne,restoring:E&&Ne!==Math.max(0,Le.length-1)}},[e.id,Ne,Le.length]);let Re=Ne>0,Dt=Ne<Le.length-1,ft=!f&&e.status==="active"&&!Dt,va=(0,m.useCallback)(()=>{let E=he.current;if(!E)return;let x=window.getComputedStyle(E),H=Number.parseFloat(x.lineHeight),Y=Number.parseFloat(x.paddingTop)+Number.parseFloat(x.paddingBottom),G=Math.ceil(H+Y),se=Math.ceil(H*2+Y);E.style.height="auto",E.style.height=`${Math.min(Math.max(E.scrollHeight,G),se)}px`,E.style.overflowY=E.scrollHeight>se+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{va()},[ft,r,va]),(0,m.useEffect)(()=>{let E=he.current?.parentElement;if(!E)return;let x=E.clientWidth,H=new ResizeObserver(()=>{E.clientWidth!==x&&(x=E.clientWidth,va())});return H.observe(E),()=>H.disconnect()},[ft,va]);let Gt=()=>{!ft||d||s!=="conclude"&&!r.trim()||s==="fulfill"&&!c||(Ot(!1),A())};(0,m.useLayoutEffect)(()=>{Lt.current&&(Lt.current.scrollTop=0)},[Ne,e.id]);let Wt=oe?.register??(oe===void 0||oe.speakerId==="__venue_scene__"?"narration":oe.player||y1(oe.text)==="speech"?"speech":"narration"),Rt=oe===void 0?void 0:oe.player?V:M[oe.speakerId],Ct=e.participants.filter(E=>e.activeIds.includes(E.characterId)),Ye=e.stagingVersion===1?e.participants.filter(E=>(P?.activeIds??e.activeIds).includes(E.characterId)):e.status==="closed"&&Ct.length===0?e.participants:Ct,Ha=Ye.find(E=>E.characterId===oe?.speakerId),St=E=>$u(a[E]),C=E=>$u(t[E]),W=Ye.slice(0,4),le=Ye.filter(E=>!W.some(x=>x.characterId===E.characterId)),Pe=M1(W.map(E=>E.characterId),gt),Fe=(e.stagingVersion===1?(Pe[Ha?.characterId??""]?.x??0)>.5:W.findIndex(E=>E.characterId===Ha?.characterId)>=2)?"left":"right",Bt=(0,o.jsxs)("p",{className:`${n}-chat-pending`,role:"status",children:[(0,o.jsx)("span",{className:`${n}-chat-spinner ${n}-spin`,"aria-hidden":"true"}),(0,o.jsx)("span",{className:`${n}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,o.jsxs)("aside",{className:`${n}-chat`,"data-open":$?"true":"false","data-ended":f?"true":"false","data-opening-error":e.status==="opening"&&h?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,o.jsx)("p",{className:`${n}-visually-hidden`,children:`Here now: ${Ct.length?Ct.map(E=>`${E.name}${E.doing?` is ${E.doing}`:""}`).join("; "):"nobody"}.`}),(0,o.jsx)("div",{className:`${n}-chat-scene`,"aria-hidden":"true",children:i?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("img",{className:`${n}-chat-scene-backdrop`,src:i,alt:""}),(0,o.jsx)("span",{className:`${n}-chat-scrim`}),(0,o.jsx)("span",{className:`${n}-chat-vignette`})]}):(0,o.jsx)("span",{className:`${n}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,o.jsxs)("div",{className:`${n}-chat-head`,children:[(0,o.jsx)("span",{className:`${n}-room-place`,children:e.placeName}),(0,o.jsxs)("span",{ref:Ve,className:`${n}-chat-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-room-actions-trigger`,onClick:()=>at(E=>!E),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":Ge,children:"\xB7\xB7\xB7"}),Ge?(0,o.jsxs)("span",{className:`${n}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{at(!1),_()},disabled:d,children:"View Venue"}),Z?(0,o.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{at(!1),Z()},disabled:d,children:["Enter ",ee??"private space"]}):null,(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{at(!1),f&&e.memoryPending?Te():Q()},disabled:d,children:f&&e.memoryPending?"Leave with memory pending":f?"Return to map":"End visit now"}),(B||e.status==="closing"||e.memoryPending)&&!f?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{at(!1),Te()},children:"Leave with memory pending"}):null,qt&&e.status!=="closed"?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{at(!1),Qt()},disabled:d,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:e.spaceClass==="residence"?"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like.":"You\u2019re outside this Venue. You can speak in your own words, or leave whenever you like."}):null,Me.length>0?(0,o.jsxs)("div",{className:`${n}-room-notices`,"aria-live":"polite",children:[(0,o.jsxs)("button",{type:"button",className:`${n}-room-notices-trigger`,onClick:()=>ht(E=>!E),"aria-expanded":ie,"aria-label":`${Me.length} village ${Me.length===1?"notice":"notices"}`,children:["\u2726 ",Me.length]}),ie?(0,o.jsx)("div",{className:`${n}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:Me.map(E=>(0,o.jsxs)("div",{className:`${n}-room-star`,children:[(0,o.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),E.kind==="memory"&&E.detail?(0,o.jsx)("button",{type:"button",className:`${n}-room-star-detail`,onClick:x=>{pe.current=x.currentTarget,$t(E)},"aria-label":`View memory: ${E.text}`,title:"View saved memory",children:E.text}):(0,o.jsx)("span",{children:E.text}),(0,o.jsx)("button",{type:"button",className:`${n}-room-star-dismiss`,onClick:()=>{st?.id===E.id&&$t(null),Vt(E.id)},"aria-label":`Dismiss ${E.text}`,title:"Dismiss notice",children:"\xD7"})]},E.id))}):null]}):null,st?.detail?(0,o.jsx)("div",{className:`${n}-memory-backdrop`,onClick:E=>{E.currentTarget===E.target&&we()},children:(0,o.jsxs)("div",{className:`${n}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${n}-memory-dialog-title`,children:[(0,o.jsxs)("div",{className:`${n}-memory-dialog-head`,children:[(0,o.jsx)("h2",{id:`${n}-memory-dialog-title`,children:st.text}),(0,o.jsx)("button",{ref:ge,type:"button",onClick:we,"aria-label":"Close memory",children:"\xD7"})]}),(0,o.jsx)("p",{children:st.detail})]})}):null,Ct.length>0?(0,o.jsx)("div",{className:`${n}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:Ct.map(E=>(0,o.jsx)("span",{className:`${n}-chat-activity`,children:`${E.name}: ${E.doing||"spending time here"}`},E.characterId))}):null,(0,o.jsxs)("div",{className:`${n}-chat-stage`,"aria-hidden":"true",children:[(0,o.jsx)("div",{className:`${n}-chat-cast`,"data-staging":e.stagingVersion===1?"true":"false","data-animate":de?"true":"false",children:W.map((E,x)=>{let H=O[E.characterId],Y=E.characterId===Ha?.characterId,G=oe?.asides.find(ea=>ea.speakerId===E.characterId),se=e.stagingVersion===1?Pe[E.characterId]:void 0,We=se?gt[E.characterId].expression:Y?oe?.expression??"":G?.expression??"",Aa=Y?oe?.gazeAt:G?.gazeAt??(E.characterId===oe?.gazeAt?Ha?.characterId:void 0),un=W.findIndex(ea=>ea.characterId===Aa),ra=V1(H?.images??[],We,se?.facing??z1(x,un));return(0,o.jsxs)("div",{className:`${n}-chat-cast-person`,"data-active":E.characterId===Ha?.characterId?"true":"false","data-sprite":ra?"true":"false","data-character-id":E.characterId,"data-position":se?gt[E.characterId].position:void 0,"data-attention":se?se.facing:void 0,style:{"--cast-center":`${(se?.x??(x+.5)/W.length)*100}%`,...se?{"--cast-left":`${(se.x-se.width/2)*100}%`,"--cast-width":`${se.width*100}%`}:{}},children:[ra?(0,o.jsx)("img",{src:ra.image.url,alt:"","data-framing":H?.framing.mode??"full","data-facing":ra.image.view==="front"?"front":ra.mirrored?"left":"right"}):(0,o.jsx)(Zr,{portrait:M[E.characterId],name:E.name,className:`${n}-avatar`}),(0,o.jsx)("span",{style:C(E.characterId),children:E.name})]},E.characterId)})}),le.length>0?(0,o.jsx)("div",{className:`${n}-chat-cast-rest`,children:le.map(E=>(0,o.jsxs)("span",{children:[(0,o.jsx)(Zr,{portrait:M[E.characterId],name:E.name,className:`${n}-avatar`}),(0,o.jsx)("span",{style:C(E.characterId),children:E.name})]},E.characterId))}):null]}),(0,o.jsxs)("div",{className:`${n}-chat-vn`,children:[te?(0,o.jsx)("div",{ref:nt,className:`${n}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:E=>{E.key==="Escape"&&(Be(!1),window.requestAnimationFrame(()=>kt.current?.focus()))},children:e.lines.map((E,x)=>(0,o.jsxs)("p",{className:`${n}-chat-vn-text`,children:[(0,o.jsxs)("strong",{style:E.role==="assistant"&&E.kind!=="narration"?C(E.speakerId):void 0,children:[E.role==="user"?y:E.kind==="narration"||E.speakerId==="__venue_scene__"?"Narration":E.name||"Resident",E.kind==="side"?" \xB7 aside":E.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,o.jsx)("span",{style:E.role==="assistant"&&E.kind!=="narration"?St(E.speakerId):void 0,children:$s(E.content,`history-${x}-`)})]},E.id??x))}):null,oe&&oe.asides.length>0?(0,o.jsx)("div",{className:`${n}-chat-vn-asides`,"data-side":Fe,"aria-live":"polite",children:oe.asides.map((E,x)=>(0,o.jsxs)("div",{className:`${n}-chat-vn-aside`,"data-register":E.register,children:[(0,o.jsx)(Zr,{portrait:E.speakerId?M[E.speakerId]:Rt,name:E.name??oe.name,glyph:oe.player?"person":"initial",className:`${n}-chat-vn-aside-face`}),(0,o.jsxs)("div",{className:`${n}-chat-vn-aside-column`,children:[(0,o.jsxs)("p",{className:`${n}-chat-vn-aside-head`,children:[(0,o.jsx)("span",{className:`${n}-chat-vn-aside-icon`,children:E.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,o.jsx)("span",{className:`${n}-chat-vn-aside-name`,style:C(E.speakerId??oe.speakerId),children:E.name??oe.name}),E.register==="whisper"&&E.target?(0,o.jsx)("span",{className:`${n}-chat-vn-aside-target`,children:`\u2192 ${E.target}`}):null]}),(0,o.jsx)("p",{className:`${n}-chat-vn-aside-text`,style:St(E.speakerId??oe.speakerId),children:$s(E.text,`vn-aside-${x}-`)})]})]},`${x}-${E.register}`))}):null,(0,o.jsx)("div",{className:`${n}-chat-vn-card`,"data-register":Wt,children:(0,o.jsx)("div",{className:`${n}-chat-vn-row`,children:(0,o.jsxs)("div",{className:`${n}-chat-vn-column`,children:[Wt==="narration"?(0,o.jsx)("p",{className:`${n}-chat-vn-label`,children:"Narration"}):(0,o.jsx)("p",{className:`${n}-chat-vn-name`,style:oe?.player?void 0:C(oe?.speakerId??""),children:oe?.name??""}),(0,o.jsxs)("div",{ref:Lt,className:`${n}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[oe?Wt==="narration"?(0,o.jsx)("p",{className:`${n}-chat-vn-beat`,"data-register":"narration",children:$s(oe.text,"vn-beat-")}):(0,o.jsx)("p",{className:`${n}-chat-vn-text`,style:oe.player?void 0:St(oe.speakerId),children:$s(oe.text,"vn-")}):(0,o.jsx)("p",{className:`${n}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:Ct.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!f&&d?Bt:null]})]})})}),(0,o.jsxs)("div",{className:`${n}-room-panel-tools`,children:[e.lines.length>0?(0,o.jsx)("button",{ref:kt,type:"button",className:`${n}-chat-history-toggle`,"aria-label":"History","aria-expanded":te,onClick:()=>Be(E=>!E),children:te?"Hide history":"History"}):null,(0,o.jsx)("span",{className:`${n}-chat-vn-counter`,children:`${Ne+1} / ${Math.max(1,Le.length)}`}),(0,o.jsxs)("span",{className:`${n}-chat-vn-nav`,children:[(0,o.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>ye(Ne-1),disabled:!Re,"aria-label":"Previous paragraph",children:["\u2039 ",(0,o.jsx)("span",{children:"Previous"})]}),Dt?(0,o.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>ye(Ne+1),"aria-label":"Next paragraph",children:[(0,o.jsx)("span",{children:"Next"})," \u203A"]}):f?(0,o.jsx)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:e.memoryPending?Te:Q,disabled:d,children:e.memoryPending?"Leave with memory pending":"Return to map"}):null]})]}),h&&e.status==="opening"?(0,o.jsxs)("div",{className:`${n}-room-error`,role:"alert",children:[(0,o.jsx)("p",{children:h}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:Q,disabled:d,children:"Back to map"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:ve,disabled:d,children:"Retry opening"}),e.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:ut,disabled:d,children:"Continue without opening"}):null]}):null,p?(0,o.jsx)("div",{className:`${n}-room-error`,role:"status",children:(0,o.jsx)("p",{children:p})}):null,b?(0,o.jsx)("p",{className:`${n}-empty`,children:b}):null,e.status==="closing"||e.memoryPending?(0,o.jsx)("p",{className:`${n}-hint`,children:e.memoryPending?`Memory review ${re?"in progress":"pending"} \xB7 ${e.memoryReview?.nextRecollection??0}/${je} recollections reviewed. You can leave with memory pending and retry from Memories.`:"Closing this visit\u2026"}):null,f&&!e.memoryPending&&e.memoryReview?.status==="complete"&&!e.memoryReview.decisions?.some(E=>E.action==="promote")?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:"Review complete. No durable memories were made from this visit."}):null,ft&&s==="fulfill"&&Ct.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,ft?(0,o.jsxs)("div",{className:`${n}-composer`,children:[s==="fulfill"&&Ct.length>0?(0,o.jsxs)("select",{value:c,onChange:E=>w(E.target.value),"aria-label":"Whose wish you fulfilled",disabled:d||f||e.status!=="active",children:[(0,o.jsx)("option",{value:"",children:"Choose one villager"}),Ct.map(E=>(0,o.jsx)("option",{value:E.characterId,children:E.name},E.characterId))]}):null,(0,o.jsx)("div",{className:`${n}-composer-row`,children:(0,o.jsxs)("span",{className:`${n}-chat-input`,children:[(0,o.jsxs)("span",{ref:lt,className:`${n}-room-mode-anchor`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-room-mode-toggle`,onClick:()=>Ot(E=>!E),"aria-label":`Mode: ${s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":qe,title:s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude",children:s==="chat"?"\u{1F4AC}":s==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),qe?(0,o.jsx)("span",{className:`${n}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(E=>(0,o.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":s===E,disabled:d||E==="fulfill"&&Ct.length===0,onClick:()=>{v(E),Ot(!1)},children:E==="chat"?"Chat":E==="fulfill"?"Fulfill":"Conclude"},E))}):null]}),z?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:z,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,j?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:j,children:"Projects"}):null,(0,o.jsx)("textarea",{ref:he,className:`${n}-textarea`,rows:1,value:r,onChange:E=>S(E.target.value),onKeyDown:E=>{k1(E.key,E.shiftKey,E.nativeEvent.isComposing)&&(E.preventDefault(),Gt())},placeholder:s==="fulfill"?"What did you do for them?":s==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:d||f||e.status!=="active"}),(0,o.jsx)("button",{type:"button",className:`${n}-chat-send`,onClick:Gt,disabled:d||f||e.status!=="active"||s!=="conclude"&&r.trim().length===0||s==="fulfill"&&!c,"aria-label":d?"Sending":"Send",title:d?"Sending":"Send",children:d?"Sending\u2026":"Send"})]})})]}):null,h&&e.status!=="opening"?(0,o.jsx)("div",{className:`${n}-room-error`,role:"alert",children:(0,o.jsx)("p",{children:h})}):null]})]})}function z2(e){return e==="index"||e==="general"?e:["chatlogs","progress","agendas","schedules"].includes(e)?"debug":"village"}var V2={index:"Menu",villagers:"Villagers",noticeboard:"Noticeboard",venueRequests:"Venue Requests",projects:"Projects",memories:"Memories",village:"Village Settings",general:"General Settings",chatlogs:"Venue Visits",progress:"Progress",agendas:"Villager Wishes",schedules:"Villager Agendas"},O2="Testing action: runs normal time catch-up, then bypasses Background events and wishes for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.",Cg=["concept","approval","builder","requirements","materials","construction","finishing"],lx={concept:"Concept & placement",approval:"Affected villagers",builder:"Assign a Builder",requirements:"Define requirements",materials:"Prepare materials",construction:"Construction",finishing:"Finishing visit"};function I2({project:e,busy:t,onSave:a}){let[i,r]=(0,m.useState)(!1),[s,c]=(0,m.useState)(e.title),[d,h]=(0,m.useState)(()=>structuredClone(e.lifecycle.change)),p=d.improvement;return i?(0,o.jsxs)("section",{className:n+"-project-card",children:[(0,o.jsx)("p",{children:"Changing reviewed terms requires fresh affected-person approvals, a Builder agreement, and a checklist. Acquired supplies remain available."}),(0,o.jsxs)("label",{children:["Project name",(0,o.jsx)("input",{value:s,onChange:b=>c(b.target.value)})]}),(0,o.jsxs)("label",{children:["Reviewed change",(0,o.jsx)("textarea",{value:d.detail,onChange:b=>h({...d,detail:b.target.value})})]}),d.classes?(0,o.jsxs)("label",{children:["Base Classes",Ns.map(b=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:d.classes.includes(b),onChange:$=>h({...d,classes:$.target.checked?[...d.classes,b]:d.classes.filter(f=>f!==b)})}),b]},b))]}):null,d.capacity!==void 0?(0,o.jsxs)("label",{children:["Residential capacity",(0,o.jsx)("input",{type:"number",min:1,max:4,value:d.capacity,onChange:b=>h({...d,capacity:Number(b.target.value)})})]}):null,p?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Upgrade title",(0,o.jsx)("input",{value:p.title,onChange:b=>h({...d,improvement:{...p,title:b.target.value}})})]}),(0,o.jsxs)("label",{children:["Upgrade description",(0,o.jsx)("textarea",{value:p.description,onChange:b=>h({...d,improvement:{...p,description:b.target.value}})})]}),(0,o.jsxs)("label",{children:["Contributed Class",(0,o.jsxs)("select",{value:p.classContribution??"",onChange:b=>h({...d,improvement:{...p,classContribution:b.target.value||void 0}}),children:[(0,o.jsx)("option",{value:"",children:"No additional Class"}),Ns.map(b=>(0,o.jsx)("option",{value:b,children:b},b))]})]}),(p.zones??[]).map((b,$)=>(0,o.jsxs)("section",{children:[(0,o.jsxs)("label",{children:["Zone name",(0,o.jsx)("input",{value:b.name,onChange:f=>h({...d,improvement:{...p,zones:p.zones.map((y,V)=>V===$?{...y,name:f.target.value}:y)}})})]}),(0,o.jsxs)("label",{children:["Zone description",(0,o.jsx)("textarea",{value:b.description,onChange:f=>h({...d,improvement:{...p,zones:p.zones.map((y,V)=>V===$?{...y,description:f.target.value}:y)}})})]}),(0,o.jsxs)("label",{children:["Zone kind",(0,o.jsxs)("select",{value:b.kind,onChange:f=>h({...d,improvement:{...p,zones:p.zones.map((y,V)=>V===$?{...y,kind:f.target.value,venueClass:f.target.value==="staff"?"workplace":f.target.value==="shared-residence"?"residence":p.classContribution??y.venueClass}:y)}}),children:[(0,o.jsx)("option",{value:"public",children:"Public"}),(0,o.jsx)("option",{value:"shared-residence",children:"Shared residential"}),(0,o.jsx)("option",{value:"staff",children:"Staff"})]})]}),(0,o.jsx)("button",{type:"button",className:n+"-button",onClick:()=>h({...d,improvement:{...p,zones:p.zones.filter((f,y)=>y!==$)}}),children:"Remove this zone"})]},b.id||$)),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:(p.zones?.length??0)>=16,onClick:()=>h({...d,improvement:{...p,zones:[...p.zones??[],{id:"",name:"",description:"",kind:"public",venueClass:p.classContribution??"other"}]}}),children:"Add a zone"})]}):null,(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:t,onClick:async()=>{await a({title:s,...d})&&r(!1)},children:"Submit revised proposal"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:t,onClick:()=>r(!1),children:"Cancel revision"})]}):(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:t,onClick:()=>r(!0),children:"Revise reviewed proposal"})}function D2({snapshot:e,room:t,onSnapshot:a,onReturn:i,onMap:r,onPlaceOnMap:s,mobile:c,debugEnabled:d,focusProjectId:h,siteProjectId:p}){let[b,$]=(0,m.useState)(h),[f,y]=(0,m.useState)(""),[V,M]=(0,m.useState)(""),[O,S]=(0,m.useState)("gathering"),[v,w]=(0,m.useState)(""),[A,_]=(0,m.useState)(""),[Z,ee]=(0,m.useState)("upgrade"),[Q,Te]=(0,m.useState)(["gathering"]),[B,re]=(0,m.useState)(""),[ve,ut]=(0,m.useState)(2),[Me,Vt]=(0,m.useState)(0),[qt,Qt]=(0,m.useState)(0),[z,j]=(0,m.useState)("replace"),[me,ye]=(0,m.useState)(""),[te,Be]=(0,m.useState)([]),[Ge,at]=(0,m.useState)(""),[ie,ht]=(0,m.useState)(""),[qe,Ot]=(0,m.useState)(""),[st,$t]=(0,m.useState)(null),[pe,ge]=(0,m.useState)(null),[he,lt]=(0,m.useState)({}),[kt,nt]=(0,m.useState)(null),[Lt,Ve]=(0,m.useState)(!1),[I,X]=(0,m.useState)([]),[we,je]=(0,m.useState)(e.settings.personalizeVenueImagesByDefault!==!1),[Le,Ne]=(0,m.useState)(e.settings.useVisualLoreByDefault!==!1);(0,m.useEffect)(()=>{X([])},[b]);let[oe,Ze]=(0,m.useState)(!1),[P,gt]=(0,m.useState)("");(0,m.useEffect)(()=>{h&&$(h)},[h]);let It=e.projects.filter(C=>(C.kind==="new-venue"||C.kind==="renovation")&&C.lifecycle?.phase!=="complete"),de=It.find(C=>C.id===b)??null,Re=de?.lifecycle,Dt=e.settings.venues.find(C=>C.id===de?.venueId),ft=e.settings.venues.find(C=>C.id===A),va=JSON.stringify(ft?.improvements?.[Me]??null);(0,m.useEffect)(()=>{let C=JSON.parse(va);z==="modify"&&C?(M(C.title),w(C.description),Qt(C.extraBeds),re(C.spaceId??""),ye(C.classContribution??""),Be(C.zones??[])):(ye(""),re(""),Be([]))},[ft?.id,va,Me,z]);let Gt=JSON.stringify(ft?.baseClasses??ft?.classes??["gathering"]);(0,m.useEffect)(()=>{Te(JSON.parse(Gt))},[ft?.id,Gt]);let Wt=async(C,W={})=>{Ze(!0),gt("");try{let le=await L(C,{method:"POST",body:JSON.stringify(W)});return a(le),le}catch(le){return gt(F(le,"The Project could not be updated.")),null}finally{Ze(!1)}},Rt=(C,W={})=>de&&Wt(`/projects/${encodeURIComponent(de.id)}/${C}`,W),Ct=async()=>{let C=f==="new-venue"?{name:V,venueClass:O,description:v}:{title:V,detail:v,...Z==="class"&&ft?{classes:Q}:{},...Z==="capacity"?{capacity:ve}:{},...Z==="upgrade"?{slot:Me,improvement:{id:z==="modify"?ft?.improvements?.[Me]?.id:void 0,title:V,description:v,extraBeds:qt,spaceId:B||null,classContribution:me||void 0,zones:te}}:{},...Z==="remove-upgrade"?{slot:Me,improvement:null}:{}},le=(await Wt(f==="new-venue"?"/projects":`/projects/renovations/${encodeURIComponent(A)}`,C))?.projects.find(Pe=>Pe.kind===f&&Pe.lifecycle?.phase!=="complete");le&&($(le.id),y(""))},Ye=async C=>{if(de){Ze(!0),gt("");try{let W=await L("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:{id:Dt?.id||de.venueId||de.id,name:de.title,form:Ge||de.title,description:ie||de.venueDraft?.description||Dt?.description,spaceDescription:qe||Dt?.spaces?.[0]?.description||ie,venueClass:de.venueDraft?.classes?.[0]??Dt?.classes?.[0]??"other"},area:C,villageName:e.village.name,setting:e.settings.setting,worldFacts:e.settings.worldFacts,selectedLorebookIds:e.settings.selectedLorebookIds,sceneryArtStyle:e.settings.sceneryArtStyle,useVisualLore:Le,useAssignedVillagerContext:we})});nt({area:C,image:W})}catch(W){gt(F(W,"The Venue image could not be generated."))}finally{Ze(!1)}}},Ha=async(C,W)=>{if(!(!W||!de)){Ze(!0),gt("");try{let le=await L("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:de.title,image:await Ss(W)})});nt({area:C,image:le})}catch(le){gt(F(le,"The Venue image could not be uploaded."))}finally{Ze(!1)}}},St=Re?.phase;return de&&St==="finishing"&&Lt?(0,o.jsxs)("div",{className:`${n}-project-finish-visit`,children:[(0,o.jsxs)("header",{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ve(!1),children:"Back to Project"}),(0,o.jsx)("h2",{children:de.kind==="new-venue"?`Open ${de.title}`:`Review ${de.title}`}),(0,o.jsx)("p",{children:de.kind==="new-venue"?"Give the finished place its form, exterior, and interior. Images are optional.":"Review the approved zone names, access, and descriptions, then choose final images if you wish."})]}),de.kind==="renovation"?(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:oe,onClick:async()=>{await Rt("renew-approvals")&&Ve(!1)},children:"Renew approvals for current residents and workers"}):null,de.kind==="new-venue"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Form",(0,o.jsx)("input",{value:Ge,onChange:C=>at(C.target.value),placeholder:"What is this place, physically?"})]}),(0,o.jsxs)("label",{children:["Exterior description",(0,o.jsx)("textarea",{value:ie,onChange:C=>ht(C.target.value)})]}),(0,o.jsxs)("label",{children:["Interior description",(0,o.jsx)("textarea",{value:qe,onChange:C=>Ot(C.target.value)})]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:we,onChange:C=>je(C.target.checked)}),"Use assigned villagers\u2019 personality for images"]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:Le,onChange:C=>Ne(C.target.checked)}),"Use selected visual lore"]}),Dt?.classes?.includes("residence")?(0,o.jsx)("p",{children:"Each occupant receives a personal space when they move in."}):null,(0,o.jsx)(ph,{rooms:I,onChange:X,workplace:Dt?.classes?.includes("workplace"),people:[{id:"player",name:"You"},...e.villagers.map(C=>({id:C.characterId,name:C.name}))]})]}):(0,o.jsx)("p",{children:Re?.change?.detail}),["exterior",...de.kind==="new-venue"?["interior"]:[]].map(C=>{let W=C==="exterior"?st:pe;return(0,o.jsxs)("section",{className:`${n}-project-image`,children:[(0,o.jsxs)("h3",{children:[C==="exterior"?"Exterior":"Interior"," image \xB7 optional"]}),W?(0,o.jsx)("img",{src:W.url,alt:`${C} preview`}):(0,o.jsx)("p",{children:"No image chosen. A placeholder will be used."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:oe,onClick:()=>{Ye(C)},children:"Generate image"}),(0,o.jsx)("input",{type:"file",accept:"image/*","aria-label":`Upload ${C} image`,disabled:oe,onChange:le=>{let Pe=le.target.files?.[0];le.target.value="",Ha(C,Pe)}})]},C)}),de.kind==="renovation"?(Re?.change?.improvement?.zones??[]).map(C=>(0,o.jsxs)("section",{className:n+"-project-image",children:[(0,o.jsxs)("h3",{children:[C.name," \xB7 ",C.kind]}),(0,o.jsx)("p",{children:C.description}),he[C.id]?(0,o.jsx)("img",{src:he[C.id].url,alt:C.name+" preview"}):(0,o.jsx)("p",{children:"Image optional. Existing images are preserved."}),(0,o.jsxs)("label",{children:["Upload final zone image",(0,o.jsx)("input",{type:"file",accept:"image/*",disabled:oe,onChange:async W=>{let le=W.target.files?.[0];if(W.target.value="",!!le){Ze(!0);try{let Pe=await L("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:C.name,image:await Ss(le)})});lt(Fe=>({...Fe,[C.id]:Pe}))}catch(Pe){gt(F(Pe,"The zone image could not be uploaded."))}finally{Ze(!1)}}}})]})]},C.id)):null,kt?(0,o.jsxs)("section",{className:`${n}-project-image`,children:[(0,o.jsx)("img",{src:kt.image.url,alt:"Generated Venue candidate"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{kt.area==="exterior"?$t(kt.image):ge(kt.image),nt(null)},children:"Use this image"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>nt(null),children:"Discard"})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:oe||de.kind==="new-venue"&&(!Ge.trim()||!ie.trim()||!qe.trim()),onClick:async()=>{await Rt("open",{form:Ge,exteriorDescription:ie,interiorDescription:qe,exteriorImage:st,interiorImage:pe,zoneImages:he,privateSpaces:I,imageContext:{useAssignedVillagerContext:we,useVisualLore:Le}})&&Ve(!1)},children:"Open Venue"}),P?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:P}):null]}):(0,o.jsxs)("div",{className:`${n}-project-screen`,"data-mobile":c,children:[(0,o.jsxs)("header",{className:`${n}-project-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-project-eyebrow`,children:"PROJECTS"}),(0,o.jsx)("h2",{children:de?.title??"Build something in the Village"}),(0,o.jsx)("p",{children:de?de.kind==="new-venue"?"A new place, from blueprint to opening day.":"Change a place that already belongs to the Village.":"One New Venue and one Renovation may be underway at once."})]}),de?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>$(""),children:"All Projects"}):null]}),de?(0,o.jsxs)("div",{className:`${n}-project-layout`,children:[(0,o.jsx)("nav",{className:`${n}-project-rail`,"aria-label":"Project phases",children:Cg.filter(C=>C!=="approval"||de.kind==="renovation").map((C,W)=>{let le=Cg.indexOf(St),Pe=Cg.indexOf(C);return(0,o.jsxs)("div",{className:`${n}-project-step`,"data-state":Pe===le?"active":Pe<le?"done":"locked",children:[(0,o.jsx)("b",{children:Pe<le?"\u2713":W+1}),(0,o.jsx)("span",{children:lx[C]})]},C)})}),(0,o.jsxs)("main",{className:`${n}-project-card`,children:[de.kind==="renovation"&&!["construction","finishing","complete"].includes(St??"")?(0,o.jsx)(I2,{project:de,busy:oe,onSave:C=>Wt(`/projects/${encodeURIComponent(de.id)}/revise`,C)},de.id+de.updatedAt):null,St==="concept"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Place the blueprint"}),(0,o.jsx)("p",{children:de.venueDraft?.description}),(0,o.jsx)("p",{children:"Choose a clear spot on the Village map. The blueprint marks where this Venue will be built."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>s(de.id),children:"Place on Village map"})]}):null,St==="approval"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"People affected by this change"}),(0,o.jsx)("p",{children:Re?.change?.detail}),(Re?.change?.improvement?.zones??[]).map(C=>(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:C.name})," \xB7 ",C.kind,": ",C.description]},C.id)),(0,o.jsx)("p",{children:"They may approve in conversation or reply through Mailbox. Every affected resident or worker must agree before you ask for a Builder."}),Re?.affectedIds.map(C=>(0,o.jsxs)("p",{children:[e.villagers.find(W=>W.characterId===C)?.name??C,":"," ",Re.approvals.some(W=>W.residentId===C)?"Approved":"Awaiting approval"]},C)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:oe,onClick:()=>{Rt("request-approval")},children:"Ask remaining villagers through Mailbox"})]}):null,St==="builder"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Find a Builder"}),(0,o.jsx)("p",{children:"Find villagers on the map and ask them about this Project in a real conversation. Their clear agreements appear here automatically."}),e.progressEngineVersion!==1?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:oe,onClick:()=>{Rt("recheck-builder")},children:"Review recent chats for missed agreements"}):null,Re?.candidates.length?Re.candidates.map(C=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:oe,onClick:()=>{Rt("builder",{residentId:C.residentId})},children:["Assign"," ",e.villagers.find(W=>W.characterId===C.residentId)?.name??"this Villager"]},C.residentId)):(0,o.jsx)("p",{children:"No one has agreed yet."})]}):null,St==="requirements"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Define requirements with your Builder"}),(0,o.jsxs)("p",{children:["Ask"," ",e.villagers.find(C=>C.characterId===Re?.builderId)?.name??"your Builder"," ","what this job needs. They decide the materials, functional equipment, and finishing supplies. Their checklist appears here automatically."]}),Re?.requirements.length?(0,o.jsxs)("div",{children:[Re.requirements.map(C=>(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:C.category})," \xB7 ",C.needed?C.title:"Not needed"]},C.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:oe,onClick:()=>{Rt("requirements")},children:"Accept Builder's plan"}),(0,o.jsx)("p",{children:"To change it, discuss a revision with the Builder."})]}):(0,o.jsx)("p",{children:"Waiting for the Builder's plan."}),Re?.candidates.filter(C=>C.residentId!==Re.builderId).map(C=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:oe,onClick:()=>{Rt("builder",{residentId:C.residentId})},children:["Switch to"," ",e.villagers.find(W=>W.characterId===C.residentId)?.name??"another Builder"]},C.residentId))]}):null,St==="materials"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Prepare materials"}),(0,o.jsx)("p",{children:"Find each supply in the Village, then bring it to this blueprint site. Offers and handoffs are recognized during your visits. Deliveries update the list here."}),Re?.requirements.filter(C=>C.needed).map(C=>(0,o.jsxs)("div",{className:`${n}-project-material`,children:[(0,o.jsx)("strong",{children:C.title}),(0,o.jsx)("span",{children:C.deliveredAt?"Delivered":C.carriedAt?"Ready to deliver":"Find and obtain"}),e.progressEngineVersion===1&&!C.carriedAt?(0,o.jsx)(o.Fragment,{children:Re.sources?.some(W=>W.requirementId===C.id)?(0,o.jsx)("p",{children:"The supplier\u2019s handoff will be recognized during your visit."}):(0,o.jsxs)(o.Fragment,{children:[(Re.recordedItems??[]).filter(W=>W.itemName.toLocaleLowerCase()===C.title.toLocaleLowerCase()).map(W=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:oe,onClick:()=>{Rt("existing-source",{requirementId:C.id,venueId:W.venueId,zoneId:W.zoneId})},children:["Choose available item at"," ",e.settings.venues.find(le=>le.id===W.venueId)?.name??"Venue",W.zoneId?" \xB7 "+(e.settings.venues.find(le=>le.id===W.venueId)?.zones?.find(le=>le.id===W.zoneId)?.name??"Zone"):""]},W.venueId+":"+W.zoneId+":"+W.itemName)),(Re.heldSupplies??[]).filter(W=>!W.assignedRequirementId&&W.itemName.toLocaleLowerCase()===C.title.toLocaleLowerCase()).map(W=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:oe,onClick:()=>{Rt("reallocate-held",{requirementId:C.id,heldId:W.id})},children:["Commit previously acquired ",W.itemName,W.deliveredAt?" (already delivered)":""]},W.id))]})}):null,C.carriedAt&&!C.deliveredAt&&p===de.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:oe,onClick:()=>{Rt("deliver",{requirementId:C.id})},children:"Deliver at blueprint site"}):null,C.carriedAt&&!C.deliveredAt&&p!==de.id?(0,o.jsx)("span",{children:"Visit this Project's blueprint on the Village map to deliver it."}):null]},C.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:oe||Re?.requirements.some(C=>C.needed&&!C.deliveredAt),onClick:()=>{Rt("start")},children:"Begin construction"})]}):null,St==="construction"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is underway"}),(0,o.jsxs)("p",{children:[e.villagers.find(C=>C.characterId===Re?.builderId)?.name??"The Builder"," is focused on this site for 24 hours, with normal rest and essential breaks."]}),Re?.workOrder?(0,o.jsxs)("p",{children:["Expected completion: ",new Date(Re.workOrder.completesAt).toLocaleString()]}):null,Re?.blockedReason?(0,o.jsx)("p",{role:"status",children:Re.blockedReason}):null,de.status==="blocked"?Re?.candidates.filter(C=>C.residentId!==Re.builderId).map(C=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,onClick:()=>{Rt("builder",{residentId:C.residentId})},children:["Continue with"," ",e.villagers.find(W=>W.characterId===C.residentId)?.name??"Builder"]},C.residentId)):null,d&&de.status==="building"?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:oe,onClick:()=>{Rt("debug-complete")},children:"DEBUG: Complete construction now"}):null]}):null,St==="finishing"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is complete"}),(0,o.jsxs)("p",{children:["Visit the finished ",de.kind==="new-venue"?"Venue":"Renovation"," to define its final details and open it to the Village."]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ve(!0),children:"Visit finished Venue"})]}):null,P?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:P}):null,(0,o.jsx)("footer",{className:`${n}-project-footer`,children:t?.status==="active"?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:i,children:"Return to current visit"}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:r,children:"Back to map"})})]})]}):(0,o.jsxs)("div",{className:`${n}-project-slots`,children:[["new-venue","renovation"].map(C=>{let W=It.find(le=>le.kind===C);return(0,o.jsxs)("button",{type:"button",className:`${n}-project-slot`,onClick:()=>W?$(W.id):y(C),children:[(0,o.jsx)("span",{children:C==="new-venue"?"NEW VENUE":"RENOVATION"}),(0,o.jsx)("strong",{children:W?.title??(C==="new-venue"?"Imagine a new place":"Change an existing Venue")}),(0,o.jsx)("small",{children:W?.lifecycle?lx[W.lifecycle.phase]??"Opening":"Available"})]},C)}),f?(0,o.jsxs)("section",{className:`${n}-project-card ${n}-project-create`,children:[(0,o.jsx)("h3",{children:f==="new-venue"?"Describe the new Venue":"Describe the Renovation"}),f==="renovation"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Venue",(0,o.jsxs)("select",{value:A,onChange:C=>_(C.target.value),children:[(0,o.jsx)("option",{value:"",children:"Choose a Venue"}),e.settings.venues.filter(C=>C.constructionStatus!=="worksite").map(C=>(0,o.jsx)("option",{value:C.id,children:C.name},C.id))]})]}),(0,o.jsxs)("label",{children:["Physical change",(0,o.jsxs)("select",{value:Z,onChange:C=>ee(C.target.value),children:[(0,o.jsx)("option",{value:"upgrade",children:"Add or replace an Upgrade"}),(0,o.jsx)("option",{value:"remove-upgrade",children:"Remove an Upgrade"}),(0,o.jsx)("option",{value:"class",children:"Change base Classes"}),(0,o.jsx)("option",{value:"capacity",children:"Change Residence capacity"})]})]}),Z==="class"?(0,o.jsxs)("fieldset",{children:[(0,o.jsx)("legend",{children:"Base Classes"}),(0,o.jsx)("p",{children:"Choose one or two base Classes. Upgrade contributions also count toward the two-Class limit."}),Ns.map(C=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:Q.includes(C),onChange:W=>Te(le=>W.target.checked?[...le,C]:le.filter(Pe=>Pe!==C))}),C]},C))]}):null,Z==="capacity"?(0,o.jsxs)("label",{children:["Capacity",(0,o.jsx)("input",{type:"number",min:1,max:4,value:ve,onChange:C=>ut(Number(C.target.value))})]}):null,Z==="upgrade"||Z==="remove-upgrade"?(0,o.jsxs)("label",{children:["Upgrade slot",(0,o.jsxs)("select",{value:Me,onChange:C=>Vt(Number(C.target.value)),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",ft?.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",ft?.improvements?.[1]?.title??"empty"]})]})]}):null,Z==="upgrade"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Upgrade action",(0,o.jsxs)("select",{value:z,onChange:C=>j(C.target.value),children:[(0,o.jsx)("option",{value:"replace",children:"Add or replace this Upgrade"}),ft?.improvements?.[Me]?(0,o.jsx)("option",{value:"modify",children:"Modify the existing Upgrade"}):null]})]}),(0,o.jsxs)("label",{children:["Class contributed",(0,o.jsxs)("select",{value:me,onChange:C=>ye(C.target.value),children:[(0,o.jsx)("option",{value:"",children:"No additional Class"}),Ns.map(C=>(0,o.jsx)("option",{value:C,children:C},C))]})]}),(0,o.jsxs)("label",{children:["Existing area improved (optional)",(0,o.jsxs)("select",{value:B,onChange:C=>re(C.target.value),children:[(0,o.jsx)("option",{value:"",children:"No existing area"}),ft?.zones?.filter(C=>C.kind!=="private-residence").map(C=>(0,o.jsx)("option",{value:C.id,children:C.name},C.id))]})]}),(0,o.jsx)("p",{children:"A Venue supports at most two distinct Classes, including its Upgrades. An Upgrade can add zones or improve an existing area."}),(te??[]).map((C,W)=>(0,o.jsxs)("section",{className:n+"-project-card",children:[(0,o.jsxs)("label",{children:["Zone name",(0,o.jsx)("input",{value:C.name,onChange:le=>Be(Pe=>Pe?.map((Fe,Bt)=>Bt===W?{...Fe,name:le.target.value}:Fe))})]}),(0,o.jsxs)("label",{children:["Area",(0,o.jsxs)("select",{value:C.kind,onChange:le=>Be(Pe=>Pe?.map((Fe,Bt)=>Bt===W?{...Fe,kind:le.target.value,venueClass:le.target.value==="shared-residence"?"residence":le.target.value==="staff"?"workplace":me||ft?.classes?.[0]||"other"}:Fe)),children:[(0,o.jsx)("option",{value:"public",children:"Public \xB7 everyone"}),(0,o.jsx)("option",{value:"shared-residence",children:"Shared living \xB7 residents and guests"}),(0,o.jsx)("option",{value:"staff",children:"Staff \xB7 all current workers and guests"}),(0,o.jsx)("option",{value:"restricted",children:"Private \xB7 assigned controllers and guests"})]})]}),["staff","restricted"].includes(C.kind)?(0,o.jsxs)("label",{children:["Purpose",(0,o.jsx)("input",{value:C.purpose??"",maxLength:240,onChange:le=>Be(Pe=>Pe?.map((Fe,Bt)=>Bt===W?{...Fe,purpose:le.target.value}:Fe))})]}):null,C.kind==="restricted"?(0,o.jsxs)("fieldset",{children:[(0,o.jsx)("legend",{children:"Room controllers"}),e.villagers.map(le=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:C.controllerIds?.includes(le.characterId)??!1,onChange:Pe=>Be(Fe=>Fe?.map((Bt,E)=>E===W?{...Bt,controllerIds:Pe.target.checked?[...Bt.controllerIds??[],le.characterId]:Bt.controllerIds?.filter(x=>x!==le.characterId)}:Bt))}),le.name]},le.characterId))]}):null,(0,o.jsxs)("label",{children:["Description",(0,o.jsx)("textarea",{value:C.description,onChange:le=>Be(Pe=>Pe?.map((Fe,Bt)=>Bt===W?{...Fe,description:le.target.value}:Fe))})]}),(0,o.jsx)("button",{type:"button",className:n+"-button",onClick:()=>Be(le=>le?.filter((Pe,Fe)=>Fe!==W)),children:"Remove from proposal"})]},C.id??W)),(0,o.jsx)("button",{type:"button",className:n+"-button",onClick:()=>Be(C=>[...C??[],{name:"",kind:"public",description:"",venueClass:me||ft?.classes?.[0]||"other"}]),children:"Add a Zone to this Upgrade"})]}):null,Z==="upgrade"?(0,o.jsxs)("label",{children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:qt,onChange:C=>Qt(Number(C.target.value))})]}):null]}):(0,o.jsxs)("label",{children:["Venue Class",(0,o.jsxs)("select",{value:O,onChange:C=>S(C.target.value),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"other",children:"Other"})]})]}),(0,o.jsxs)("label",{children:[f==="new-venue"?"Venue name":"Project name",(0,o.jsx)("input",{value:V,onChange:C=>M(C.target.value),placeholder:"Give this place a name"})]}),(0,o.jsxs)("label",{children:["What would this ",f==="new-venue"?"place":"change"," be like in the Village?",(0,o.jsx)("textarea",{value:v,onChange:C=>w(C.target.value)})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:oe||!V.trim()||!v.trim()||f==="renovation"&&(!A||Z==="class"&&(!Q.length||Q.length>2)),onClick:()=>{Ct()},children:f==="new-venue"?"Continue to map placement":"Start Renovation"})]}):null]}),!de&&P?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:P}):null]})}function _2({characterId:e,total:t,busy:a,onCorrect:i}){let[r,s]=(0,m.useState)(null),[c,d]=(0,m.useState)(!1),[h,p]=(0,m.useState)(""),b=async $=>{d(!0),p("");try{s(await L(`/agendas/${encodeURIComponent(e)}/history${$===void 0?"":`?cursor=${encodeURIComponent($)}`}`))}catch(f){p(F(f,"Wish history could not be read."))}finally{d(!1)}};return(0,o.jsxs)("details",{className:`${n}-agenda-notes`,onToggle:$=>{$.currentTarget.open&&!r&&!c&&b()},children:[(0,o.jsx)("summary",{children:`Wish history (${t})`}),h?(0,o.jsx)("p",{role:"alert",children:h}):null,c?(0,o.jsx)("p",{children:"Loading wish history\u2026"}):null,(0,o.jsx)("ul",{className:`${n}-story`,children:r?.entries.map($=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:$.wish.wish}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`${$.correctedAt?"Corrected":$.kind==="fulfilled"?"Fulfilled":"Expired"} ${new Date($.correctedAt||$.fulfilledAt).toLocaleDateString()}`}),$.kind==="fulfilled"&&!$.correctedAt?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:a||c,onClick:()=>{(async()=>{await i(e,$.wish.id),await b()})()},children:"Mark as not fulfilled"}):null]},$.sequence))}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:c,onClick:()=>{b()},children:"Latest outcomes"}),r?.nextCursor?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:c,onClick:()=>{b(r.nextCursor)},children:"Older outcomes"}):null]})}function H2({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let l=()=>{let g=e.getBoundingClientRect();a(g.width<=704||g.width<=880&&g.height<=512)};l();let u=new ResizeObserver(l);return u.observe(e),()=>u.disconnect()},[e]);let[i,r]=(0,m.useState)(null),s=i?.settings.homeBuildings??[],[c,d]=(0,m.useState)(null),[h,p]=(0,m.useState)(null),[b,$]=(0,m.useState)(null),[f,y]=(0,m.useState)(0),[V,M]=(0,m.useState)(0),[O,S]=(0,m.useState)(0),[v,w]=(0,m.useState)(null),[A,_]=(0,m.useState)(!1),[Z,ee]=(0,m.useState)(""),[Q,Te]=(0,m.useState)(""),[B,re]=(0,m.useState)(""),[ve,ut]=(0,m.useState)(null),[Me,Vt]=(0,m.useState)(null),[qt,Qt]=(0,m.useState)(!1),[z,j]=(0,m.useState)("home"),[me,ye]=(0,m.useState)(""),[te,Be]=(0,m.useState)(""),[Ge,at]=(0,m.useState)(""),[ie,ht]=(0,m.useState)(null),[qe,Ot]=(0,m.useState)("view"),[st,$t]=(0,m.useState)("exterior");(0,m.useEffect)(()=>{if(st==="exterior")return;let l=i?.settings.venues.find(g=>g.id===ie);l?.zones?.some(g=>g.id===st)||(st.startsWith("class:")?l&&Jn(l).includes(st.slice(6)):l&&st.startsWith("private:")&&(l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[])).includes(st.slice(8))&&l.privateSpaces?.some(g=>g.ownerId===st.slice(8)))||$t("exterior")},[i,ie,st]);let[pe,ge]=(0,m.useState)(null),[he,lt]=(0,m.useState)(null),[kt,nt]=(0,m.useState)(!1),[Lt,Ve]=(0,m.useState)(""),[I,X]=(0,m.useState)(""),[we,je]=(0,m.useState)(""),[Le,Ne]=(0,m.useState)(null),[oe,Ze]=(0,m.useState)(!1),[P,gt]=(0,m.useState)("index"),It=z2(P),[de,Re]=(0,m.useState)({}),[Dt,ft]=(0,m.useState)(null),va=(0,m.useRef)(null),Gt=(0,m.useRef)([]),[Wt,Rt]=(0,m.useState)({}),[Ct,Ye]=(0,m.useState)({}),[Ha,St]=(0,m.useState)(""),[C,W]=(0,m.useState)(null),[le,Pe]=(0,m.useState)(""),[Fe,Bt]=(0,m.useState)(""),[E,x]=(0,m.useState)(""),[H,Y]=(0,m.useState)(null),[G,se]=(0,m.useState)(""),[We,Aa]=(0,m.useState)([]),[un,ra]=(0,m.useState)(1600),[ea,Nn]=(0,m.useState)([]),[hn,Vg]=(0,m.useState)(1600),[ku,vx]=(0,m.useState)(null),[Og,Ig]=(0,m.useState)(""),[Wl,Qr]=(0,m.useState)([]),[Dg,yx]=(0,m.useState)(""),[ks,Ni]=(0,m.useState)(!1),[Fr,Jr]=(0,m.useState)(!1),[wx,ec]=(0,m.useState)(null),[Kr,Cs]=(0,m.useState)(null),[mn,Cu]=(0,m.useState)(!1),[Ts,Wr]=(0,m.useState)(!1),[eo,_g]=(0,m.useState)(!1),[Hg,xx]=(0,m.useState)(""),[Ug,$x]=(0,m.useState)({}),[Es,qg]=(0,m.useState)({}),[tc,Lg]=(0,m.useState)(""),[Xe,ac]=(0,m.useState)(0),[kn,Bg]=(0,m.useState)(""),[ya,jg]=(0,m.useState)(""),[Kn,Yg]=(0,m.useState)("rebuild"),[Fa,Tu]=(0,m.useState)(Xr("rebuild").premise),[As,Gg]=(0,m.useState)(""),[Sx,Nx]=(0,m.useState)(vg),[Wn,Pg]=(0,m.useState)([]),[Oe,ki]=(0,m.useState)([]),[Cn,Xg]=(0,m.useState)(1),[Eu,kx]=(0,m.useState)({x:.5,y:.5}),[Zg,ei]=(0,m.useState)(!1),[cr,Au]=(0,m.useState)([]),[Qg,nc]=(0,m.useState)(""),ti=(0,m.useRef)(null),[Tn,ic]=(0,m.useState)(vr["Painted illustration"]),[En,rc]=(0,m.useState)(!0),[An,oc]=(0,m.useState)(!0),[to,Fg]=(0,m.useState)(!0),[Jg,pn]=(0,m.useState)(null),[Rs,Ms]=(0,m.useState)(null),[zs,sc]=(0,m.useState)(!1),[Kg,Ru]=(0,m.useState)(""),[lc,Wg]=(0,m.useState)(q1),[ct,dr]=(0,m.useState)("generate"),[Cx,Mu]=(0,m.useState)(""),[cc,zu]=(0,m.useState)(null),[Tx,ef]=(0,m.useState)(""),[Vs,Vu]=(0,m.useState)(null),[ao,Ou]=(0,m.useState)(""),[no,Iu]=(0,m.useState)(""),Os=JSON.stringify({scenario:Kn,premise:Fa.trim(),direction:As.trim(),setting:ya.trim(),lorebooks:ea,loreBudget:hn,persona:E,artStyle:Tn,personalityDefault:En,visualLoreDefault:An}),Du=(0,m.useRef)(Os),tf=(0,m.useRef)(Oe);(0,m.useEffect)(()=>{tf.current=Oe},[Oe]),(0,m.useEffect)(()=>{Du.current!==Os&&i?.isFounded,Du.current=Os},[Os,i?.isFounded]);let _u=JSON.stringify({setting:ya.trim(),worldFacts:i?.isFounded?Wn:null,lorebooks:ea,artStyle:Tn,useVisualLore:to,structure:ao,negative:no,options:lc}),[wa,Is]=(0,m.useState)(!1),[af,dc]=(0,m.useState)(""),[Hu,Ex]=(0,m.useState)("Connections are still loading."),[nf,rf]=(0,m.useState)(!1),[Ax,Ds]=(0,m.useState)(!1),[Uu,Ae]=(0,m.useState)(""),[Rx,uc]=(0,m.useState)(!1),[io,qu]=(0,m.useState)(""),[Rn,ro]=(0,m.useState)(null),[Lu,ai]=(0,m.useState)(null),[of,hc]=(0,m.useState)(!1),[Mn,oo]=(0,m.useState)(""),[sf,ni]=(0,m.useState)(null),so=i?.settings.townMapView??Fl("cover"),lf=i?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:null,Mx=Rn?.size??lf,cf=i?ct==="existing"?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:Vs&&cc===ct?Vs:{width:i.settings.townMapGenerationWidth,height:i.settings.townMapGenerationHeight}:null,zx=i?{min:i.settings.townMapZoomMin,max:i.settings.townMapZoomMax,step:i.settings.townMapZoomStep}:{min:1,max:1,step:.1},Vx=Ts?null:Rn?Rn.image:io||null,ur=ct==="none"?null:ct==="existing"?io||null:cc===ct&&(ct!=="generate"||Tx===_u)&&Cx||null,mc=Rn!==null||of,hr=mc?Lu??so:so,Bu=Rn?$g(Rn.size):null,[Ci,bt]=(0,m.useState)(""),[xa,be]=(0,m.useState)(""),[ae,ce]=(0,m.useState)(!1),[D,He]=(0,m.useReducer)((l,u)=>{let g=typeof u=="function"?u(l):u;return l?.id&&l.id===g?.id&&(l.sceneRevision??0)>(g.sceneRevision??0)?l:g},null),[Ox,_s]=(0,m.useState)(!1),[Ix,Ja]=(0,m.useState)(!1),[mr,Ka]=(0,m.useState)(""),[Hs,pc]=(0,m.useState)("chat"),[Us,gc]=(0,m.useState)(""),[Dx,df]=(0,m.useState)(""),[_x,gn]=(0,m.useState)([]),fn=(0,m.useRef)(new Set),[qs,Hx]=(0,m.useState)(!1),uf=(0,m.useRef)(0),lo=(0,m.useRef)(0),hf=(0,m.useRef)(""),[ju,co]=(0,m.useState)(""),[ma,Tt]=(0,m.useState)(!1),[Ls,mf]=(0,m.useState)(""),fc=(0,m.useRef)(new Set),ii=(0,m.useRef)(!1),ri=(0,m.useRef)(null),uo=(0,m.useRef)(null),pa=(0,m.useRef)(null),zn=(0,m.useCallback)(l=>{let u=[];for(let g of l)fn.current.has(g.id)||(fn.current.add(g.id),u.push(g));u.length>0&&gn(g=>[...g,...u])},[]),Bs=(0,m.useRef)(!1),[Ux,Nt]=(0,m.useState)(""),[qx,pr]=(0,m.useState)(""),[ho,oi]=(0,m.useState)(!1),[pf,Yu]=(0,m.useState)(""),gf=(0,m.useRef)(""),bc=(0,m.useRef)(!1),[Gu,ff]=(0,m.useState)(!1),Pu=(0,m.useRef)(null),Xu=(0,m.useRef)(null);(0,m.useEffect)(()=>{let l=Xu.current,u=Pu.current;l===null||!u||(Xu.current=null,u.focus(),u.setSelectionRange(l,l))},[Fe]);let Zu=(0,m.useRef)(i);(0,m.useEffect)(()=>{Zu.current=i},[i]);let js=(0,m.useRef)(null),mo=(0,m.useCallback)(async(l=!1)=>{if(bc.current)return null;bc.current=!0;let u=setTimeout(()=>ff(!0),s2);try{let g=await L("/reconcile",{method:"POST",body:l?JSON.stringify({forceStory:!0,...js.current??(js.current={id:sr(),expectedAttempt:Zu.current?.backgroundWork?.find(T=>T.kind==="story")?.attempt??0}),actionId:js.current.id}):void 0});return r(g),l&&(js.current=null),g}catch{return null}finally{clearTimeout(u),ff(!1),bc.current=!1}},[]),Lx=(0,m.useCallback)(async()=>{let l=i?.happenings[0]?.id??"";Yu("Writing...");let u=await mo(!0);if(!u){Yu("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}Yu(u.backgroundWork?.some(g=>g.kind==="story"&&["queued","running","paused"].includes(g.status))?"The event is queued. See Background work for progress.":(u.happenings[0]?.id??"")===l?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[i,mo]),Ie=(0,m.useCallback)(async(l={})=>{try{let u=await L("",{signal:l.signal});r(u),bt("")}catch(u){if(l.signal?.aborted||l.quiet)return;r(null),bt(F(u,"Could not read the village."))}},[]),Ys=(0,m.useRef)("");(0,m.useEffect)(()=>{if(!i?.isFounded)return;Ys.current||(Ys.current=sr());let l=0,u=async()=>{let q=++l,K=document.visibilityState==="visible"&&e.checkVisibility({checkVisibilityCSS:!0});try{let Se=await L("/background/presence",{method:"POST",body:JSON.stringify({sessionId:Ys.current,visible:K})});K&&q===l&&(Se.snapshot?r(Se.snapshot):(await mo(),await Ie({quiet:!0})))}catch{}};u();let g=window.setInterval(()=>{u()},3e4),T=()=>{u()};document.addEventListener("visibilitychange",T);let R=new IntersectionObserver(T);return R.observe(e),()=>{R.disconnect(),l++,clearInterval(g),document.removeEventListener("visibilitychange",T),L("/background/presence",{method:"POST",body:JSON.stringify({sessionId:Ys.current,visible:!1})}).catch(()=>{})}},[i?.isFounded,mo,Ie,e]);let bf=i?.backgroundWork?.some(l=>["queued","running"].includes(l.status))??!1;(0,m.useEffect)(()=>{if(!bf)return;let l=window.setInterval(()=>{document.visibilityState==="visible"&&Ie({quiet:!0})},5e3);return()=>clearInterval(l)},[bf,Ie]),(0,m.useEffect)(()=>{let l=i?.village.nextTransitionAt??"";l.length===0||l===gf.current||(gf.current=l,i?.isFounded&&mo())},[i,mo]);let Vn=(0,m.useCallback)(async l=>{try{let u=await L("/catalog",{signal:l});d(u.characters),bt("")}catch(u){if(l?.aborted)return;bt(F(u,"Could not read your character library."))}},[]),po=(0,m.useCallback)(async l=>{try{let u=await L("/personas",{signal:l});Y(u.personas)}catch(u){if(l?.aborted)return;Y([]),bt(F(u,"Could not read your Personas."))}},[]),go=(0,m.useCallback)(async l=>{try{let u=await L("/lorebooks",{signal:l});vx(u.books),Ig("")}catch(u){if(l?.aborted)return;Ig(F(u,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),vf=(0,m.useRef)(new Set),Gs=(0,m.useCallback)(async l=>{try{let u=await L("/memories",{signal:l});p(u),bt("");let g=u.archive.pendingReviewId;g&&!vf.current.has(g)&&!l?.aborted&&(vf.current.add(g),window.setTimeout(()=>{l?.aborted||L(`/rooms/archive/${encodeURIComponent(g)}/retry-memory`,{method:"POST"}).then(()=>L("/memories")).then(T=>{l?.aborted||p(T)}).catch(()=>{})},0))}catch(u){if(l?.aborted)return;p(null),bt(F(u,"Could not read villager memories."))}},[]),Bx=(0,m.useCallback)(async(l,u)=>{let g=l==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(g)){ce(!0);try{await L(`/memories/${l}/${encodeURIComponent(u)}`,{method:"DELETE"}),await Gs()}catch(T){bt(F(T,"That memory could not be removed."))}finally{ce(!1)}}},[Gs]),fo=(0,m.useCallback)(async l=>{try{let u=await L("/agendas",{signal:l});ut(u.villagers)}catch(u){if(l?.aborted)return;ut(null),bt(F(u,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(z!=="menu"||P!=="agendas"&&P!=="schedules"||!ve?.some(u=>u.agenda?.personalizationPending&&!u.agenda.personalizationFailure))return;let l=window.setInterval(()=>{fo()},5e3);return()=>window.clearInterval(l)},[ve,fo,P,z]);let Qu=(0,m.useRef)(new Map),vc=(0,m.useCallback)(async l=>{let u=Qu.current.get(l.id);u||(u={id:sr(),attempt:l.attempt},Qu.current.set(l.id,u));let g=await L("/background/retry",{method:"POST",body:JSON.stringify({id:l.id,expectedAttempt:u.attempt,actionId:u.id})});r(g),Qu.current.delete(l.id),await fo()},[fo]),yc=(0,o.jsx)(Y1,{jobs:(i?.backgroundWork??[]).filter(l=>P==="agendas"?["agenda","wish"].includes(l.kind):P==="schedules"?["agenda","translation"].includes(l.kind):P==="venueRequests"?["mail","adaptation"].includes(l.kind):!0),onRetry:vc}),Fu=(0,m.useRef)(new Map),jx=(0,m.useCallback)(async l=>{ce(!0);try{let u=Zu.current?.backgroundWork?.find(R=>R.kind==="agenda"&&R.subjectId===l&&["failed","interrupted","paused"].includes(R.status));if(u){await vc(u);return}let g=Fu.current.get(l)??sr();Fu.current.set(l,g);let T=await L(`/agendas/${encodeURIComponent(l)}/regenerate`,{method:"POST",body:JSON.stringify({actionId:g})});Fu.current.delete(l),ut(T.villagers),bt("")}catch(u){bt(F(u,"That villager could not be asked again."))}finally{ce(!1)}},[vc]),Yx=(0,m.useCallback)(async(l,u)=>{ce(!0);try{let g=await L(`/agendas/${encodeURIComponent(l)}/completed/${encodeURIComponent(u)}/correct`,{method:"POST"});ut(g.villagers),bt("")}catch(g){bt(F(g,"That wish completion could not be corrected."))}finally{ce(!1)}},[]),Gx=(0,m.useCallback)(async(l,u)=>{ce(!0);try{let g=await L(`/agendas/${encodeURIComponent(l)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:u})});ut(g.villagers),bt("")}catch(g){bt(F(g,"Schedule use could not be changed."))}finally{ce(!1)}},[]);(0,m.useEffect)(()=>{let l=new AbortController;return Ie({signal:l.signal}),()=>l.abort()},[Ie]),(0,m.useEffect)(()=>{let l=()=>{document.hidden||Ie({quiet:!0})},u=setInterval(()=>{document.hidden||bc.current||Ie({quiet:!0})},o2);return document.addEventListener("visibilitychange",l),()=>{clearInterval(u),document.removeEventListener("visibilitychange",l)}},[Ie]),(0,m.useEffect)(()=>{if(!D?.id||D.status==="closed"||z!=="room")return;hf.current!==D.id?(hf.current=D.id,lo.current=Date.parse(D.lastActivityAt||D.startedAt)||Date.now()):lo.current=Math.max(lo.current,Date.parse(D.lastActivityAt||D.startedAt)||0);let l=!1,u=q=>{l||vs(D.id,pa.current)||(He(null),Ja(!1),gn([]),fn.current.clear(),co(q==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),Ie())},g=(q=!1)=>{vs(D.id,pa.current)||L("/rooms/active").then(async({session:K})=>{if(l||vs(D.id,pa.current))return;if(K?.id===D.id){He(K),q&&(await L("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:D.id})}),lo.current=Date.now());return}let Se=await L(`/rooms/archive/${encodeURIComponent(D.id)}`).catch(()=>null);l||vs(D.id,pa.current)||u(Se?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(K=>{let Se=ys(K);Se&&u(Se)})},T=q=>{if(!vs(D.id,pa.current)){if(Date.now()-lo.current>=30*6e4){q.cancelable&&q.preventDefault(),q.stopImmediatePropagation(),g(!0);return}lo.current=Date.now(),!(Date.now()-uf.current<15e3)&&(uf.current=Date.now(),L("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:D.id})}).catch(K=>{let Se=ys(K);Se?u(Se):g()}))}},R=()=>g();window.addEventListener("focus",R),document.addEventListener("visibilitychange",R);for(let q of["pointerdown","keydown","input","scroll"])window.addEventListener(q,T,!0);return()=>{l=!0,window.removeEventListener("focus",R),document.removeEventListener("visibilitychange",R);for(let q of["pointerdown","keydown","input","scroll"])window.removeEventListener(q,T,!0)}},[D?.id,D?.status,D?.lastActivityAt,D?.startedAt,z,Ie]),(0,m.useEffect)(()=>{if(!D?.id||D.operation?.status!=="running"||ma)return;let l=!1,u=!1,g=async()=>{if(l||u||document.hidden)return;u=!0;let R=await ws(D.id,D.operation?.id);u=!1,!l&&R&&(He(R),oi(R.status==="closed"),R.operation?.status!=="running"&&Nt(""))},T=window.setInterval(()=>{g()},1500);return window.addEventListener("focus",g),document.addEventListener("visibilitychange",g),()=>{l=!0,window.clearInterval(T),window.removeEventListener("focus",g),document.removeEventListener("visibilitychange",g)}},[D?.id,D?.operation?.id,D?.operation?.status,ma]),(0,m.useEffect)(()=>{if(!D?.id||D.operation?.status!=="interrupted"||D.submissions?.some(u=>u.id===D.operation?.id))return;let l=!1;return L(`/rooms/${encodeURIComponent(D.id)}/operations/${encodeURIComponent(D.operation.id)}`).then(({operation:u})=>{l||!u?.input?.message||Ka(g=>g||u.input?.message||"")}).catch(()=>{}),()=>{l=!0}},[D?.id,D?.operation?.id,D?.operation?.status,D?.submissions]),(0,m.useEffect)(()=>{let l=new AbortController;return L("/rooms/active",{signal:l.signal}).then(({session:u,debugDiscardEnabled:g})=>{Hx(g),!(l.signal.aborted||!u)&&(He(u),pc("chat"),Ja(!0),j("room"),u.status==="opening"&&(Tt(!0),L("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u.id}),signal:AbortSignal.timeout(3e4)}).then(({session:T})=>{l.signal.aborted||He(T)}).catch(async T=>{if(l.signal.aborted)return;let R=await Z1(u.id);l.signal.aborted||(R?He(R):Nt(F1(T)))}).finally(()=>{l.signal.aborted||Tt(!1)})))}).catch(()=>{}),()=>l.abort()},[]),(0,m.useEffect)(()=>{if(P!=="chatlogs"||!i?.isFounded)return;let l=new AbortController,u=new URLSearchParams;return Z&&u.set("venueId",Z),Q&&u.set("characterId",Q),u.set("offset",String(V)),u.set("limit","20"),$(null),L(`/rooms/archive?${u.toString()}`,{signal:l.signal}).then(({visits:g,total:T})=>{l.signal.aborted||($(g),y(T),re(""))}).catch(g=>{l.signal.aborted||re(F(g,"Venue visits could not be read."))}),()=>l.abort()},[Z,Q,V,O,P,i?.isFounded]);let Ju=(0,m.useCallback)(async l=>{try{let u=await L(`/rooms/archive/${encodeURIComponent(l)}`);w(u.visit),re("")}catch(u){re(F(u,"That visit could not be read."))}},[]),Px=(0,m.useCallback)(async l=>{ce(!0);try{let u=await L(`/rooms/${encodeURIComponent(l)}/operation`);await L(`/rooms/archive/${encodeURIComponent(l)}/retry-memory`,{method:"POST",body:JSON.stringify({retryOfAttemptId:u.operation?.attemptId})}),await Ju(l),S(g=>g+1),re("")}catch(u){re(F(u,"Memory filing is still pending."))}finally{ce(!1)}},[Ju]),yf=(0,m.useCallback)(async l=>{if(window.confirm(l?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){ce(!0);try{await L(l?`/rooms/archive/${encodeURIComponent(l)}`:"/rooms/archive",{method:"DELETE"}),w(null),M(0),S(u=>u+1),re("")}catch(u){re(F(u,"Visit transcripts could not be deleted."))}finally{ce(!1)}}},[]);(0,m.useEffect)(()=>{if(!qt)return;let l=new AbortController;return Vn(l.signal),()=>l.abort()},[qt,Vn]);let wf=i?i.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(wf===null)return;let l=new AbortController;return(async()=>{try{let u=await L("/town-map",{signal:l.signal});qu(u.image)}catch{l.signal.aborted||qu("")}})(),()=>l.abort()},[wf]);let Xx=(0,m.useCallback)(async l=>{ce(!0);try{r(await L("/villagers",{method:"POST",body:JSON.stringify({characterId:l})})),bt(""),await Vn()}catch(u){bt(F(u,"That character could not move in."))}finally{ce(!1)}},[Vn]),Zx=(0,m.useCallback)(async l=>{ce(!0);try{r(await L(`/villagers/${encodeURIComponent(l)}`,{method:"DELETE"})),bt(""),c&&await Vn()}catch(u){bt(F(u,"That villager could not leave."))}finally{ce(!1)}},[c,Vn]),Qx=(0,m.useCallback)(async l=>{St(l);try{let u=await L(`/villagers/${encodeURIComponent(l)}/refresh`);Ye(g=>({...g,[l]:u})),bt("")}catch(u){bt(F(u,"That villager's card could not be compared."))}finally{St("")}},[]),Fx=(0,m.useCallback)(async l=>{St(l);try{r(await L(`/villagers/${encodeURIComponent(l)}/refresh`,{method:"POST"})),Ye(u=>{let g={...u};return delete g[l],g}),bt("")}catch(u){bt(F(u,"That villager's card could not be refreshed."))}finally{St("")}},[]),jt=(0,m.useCallback)(l=>{l==="projects"&&at(""),be(""),Ze(!1),l==="villagers"&&Vn(),l==="village"&&po(),l==="village"&&go(),l==="memories"&&(p(null),Gs()),(l==="agendas"||l==="schedules")&&fo(),l==="progress"&&L("/progress/debug").then(Vt).catch(g=>{Vt(null),bt(F(g,"Progress diagnostics are unavailable."))}),l==="village"&&(z!=="menu"||P!=="village")&&i&&(Bt(i.settings.promptKnowledge),x(i.settings.playerPersonaId),se(i.settings.setting),Aa(i.settings.selectedLorebookIds),ra(i.settings.loreTokenBudget),ic(i.settings.sceneryArtStyle??""),rc(i.settings.personalizeVenueImagesByDefault!==!1),oc(i.settings.useVisualLoreByDefault!==!1),Qr(xs(i.settings.venues).map(g=>({...g})))),gt(l),j("menu")},[fo,Vn,go,Gs,po,P,z,i]),wc=(0,m.useCallback)(()=>{Qt(!1),be(""),Ne(null),Ze(!1),j("home")},[]),Ti=(0,m.useCallback)(l=>{!l.memoryPending||fc.current.has(l.id)||(fc.current.add(l.id),mf(l.id),L(`/rooms/archive/${encodeURIComponent(l.id)}/retry-memory`,{method:"POST"}).then(u=>{ii.current||(He(g=>g?.id===l.id?u.session:g),zn(u.recordEvents??[]))}).catch(u=>{ii.current||Nt(F(u,"Memory review is still pending. You can leave and retry from Memories."))}).finally(()=>{fc.current.delete(l.id),mf(u=>u===l.id?"":u)}))},[zn]);(0,m.useEffect)(()=>{if(!Ls)return;let l=window.setInterval(()=>{L(`/rooms/archive/${encodeURIComponent(Ls)}`).then(({visit:u})=>{ii.current||!fc.current.has(Ls)||He(g=>g?.id===u.id&&g.memoryPending?{...g,memoryPending:u.memoryPending,memoryReview:u.memoryReview}:g)}).catch(()=>{})},2e3);return()=>window.clearInterval(l)},[Ls]);let Jx=(0,m.useCallback)(async()=>{if(!(!D||ma)&&!(D.memoryPending&&(D.status==="closed"||ho))){if(!D.id||D.status==="closed"||ho){pa.current=null,Ja(!1),He(null),gn([]),fn.current.clear(),Ka(""),pr(""),j("home"),Ie();return}Tt(!0),Nt(""),_(!1),He({...D,status:"closing"}),pa.current={roomId:D.id,submissionId:""};try{let l=await L("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:D.id,expectedSceneRevision:D.sceneRevision??0})});if(ii.current)return;He(l.session),oi(!0),zn(l.recordEvents??[]),Ti(l.session),Ka(""),pr(""),Ie()}catch(l){if(ii.current)return;pa.current=null;let u=ys(l);if(u){He(null),Ja(!1),gn([]),fn.current.clear(),co(u==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),Ie();return}let g=await ws(D.id);g&&(He(g),oi(g.status==="closed")),Nt(F(l,"You could not leave the venue.")),_(!0)}finally{Tt(!1)}}},[Ie,zn,D,ma,ho,Ti]),Kx=(0,m.useCallback)(async()=>{if(!D?.id||D.status!=="active"||ma||Bs.current)return;let l=uo.current??sr();uo.current=l,pa.current={roomId:D.id,submissionId:l},Tt(!0),Nt(""),_(!1);try{let u=await L("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:D.id,submissionId:l,message:mr,expectedSceneRevision:D.sceneRevision??0}),signal:AbortSignal.timeout(3e5)});He(u.session),oi(!0),zn(u.recordEvents??[]),Ti(u.session),uo.current=null,Ka(""),Ie()}catch(u){let g=await ws(D.id,l);g&&He(g);let T=g?.submissions?.some(q=>q.id===l)?g:await Q1(D.id,l);if(T){He(T),oi(T.status==="closed"),T.status==="closed"&&Ti(T),Ka(""),Nt(""),_(!1),uo.current=null,Ie();return}pa.current=null;let R=ys(u);if(R){He(null),Ja(!1),gn([]),fn.current.clear(),co(R==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),Ie();return}Nt(F(u,"The scene could not end yet.")),_(!0)}finally{Tt(!1)}},[Ie,zn,D,ma,mr,Ti]),Wx=(0,m.useCallback)(async()=>{if(!(!D?.id||ii.current)){ii.current=!0,Tt(!0);try{await L("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:D.id})}),pa.current=null,Ja(!1),He(null),gn([]),fn.current.clear(),j("home"),_(!1),Ie()}catch(l){Nt(F(l,"The visit could not be left yet.")),ii.current=!1}finally{Tt(!1)}}},[Ie,D]),e$=(0,m.useCallback)(async()=>{if(!(!D?.id||!qs||ma)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){Tt(!0);try{await L("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:D.id})}),He(null),Ja(!1),gn([]),fn.current.clear(),Ka(""),j("home"),Ie()}catch(l){Nt(F(l,"The debug discard failed."))}finally{Tt(!1)}}},[D,qs,ma,Ie]),t$=(0,m.useCallback)(async()=>{let l=mr.trim();if(D===null||!D.id||ho||ma||Bs.current||l.length===0)return;Bs.current=!0;let u=ri.current??sr();ri.current=u;let g=D;try{await L("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:D.id})})}catch(R){Bs.current=!1;let q=ys(R);q?(He(null),Ja(!1),gn([]),fn.current.clear(),co(q==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),Ie()):Nt(F(R,"The visit could not be checked."));return}let T={speakerId:"",name:"",role:"user",content:l,at:new Date().toISOString()};Tt(!0),Nt(""),Ka(""),He({...D,lines:[...D.lines,T]}),pa.current={roomId:D.id,submissionId:u};try{let R=await L("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:D.id,message:l,mode:Hs,targetId:Hs==="fulfill"?Us:"",submissionId:u,expectedSceneRevision:D.sceneRevision??0}),signal:AbortSignal.timeout(3e5)});He(R.session),oi(R.session.status==="closed"),R.session.status!=="closed"&&(pa.current=null),zn(R.recordEvents??[]),R.session.status==="closed"&&Ti(R.session),Us&&!R.session.activeIds.includes(Us)&&gc(""),df(R.verdict?.reason??""),pc("chat"),ri.current=null,pr(""),Ie()}catch(R){let q=await ws(D.id,u);q&&He(q);let K=q?.submissions?.some(gr=>gr.id===u)?q:await Q1(D.id,u);if(K){He(K),oi(K.status==="closed"),K.status==="closed"&&Ti(K),Nt(""),Ka(""),ri.current=null,pr(""),Ie();return}pa.current=null;let Se=ys(R);if(Se){He(null),Ja(!1),gn([]),fn.current.clear(),co(Se==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),Ie();return}let $a=await ws(D.id,u);$a?He($a):R instanceof Kl||He(g),R instanceof Kl&&(R.code==="SCENE_BUSY"||R.code==="SCENE_STALE")&&(ri.current=null),Ka(l),Nt(F(R,"That line could not be sent."))}finally{Bs.current=!1,Tt(!1)}},[Ie,zn,D,ma,mr,ho,Hs,Us,Ti]),a$=(0,m.useCallback)(l=>(i?.villagers??[]).filter(u=>u.place?.id===l),[i]),Ku=(0,m.useCallback)(l=>{Ne(null),Ze(!1),ht(l.id),Ot("view"),$t("exterior"),ge(null),lt(null),j("venue")},[]),Wu=(0,m.useCallback)(async l=>{Tt(!0),Nt(""),pr("");try{let u=await L("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(3e4)});He(u.session),Ie()}catch(u){let g=await Z1(l);g?He(g):Nt(F1(u))}finally{Tt(!1)}},[Ie]),n$=(0,m.useCallback)(async()=>{if(!(!D?.id||!D.operation||ma)){Tt(!0);try{let{operation:l}=await L(`/rooms/${encodeURIComponent(D.id)}/operations/${encodeURIComponent(D.operation.id)}`),u=l.kind==="move"?"/rooms/zone":l.kind==="memory"?`/rooms/archive/${encodeURIComponent(D.id)}/retry-memory`:l.kind==="greet"?"/rooms/greet":l.kind==="turn"?l.input?.mode==="leave"?"/rooms/leave":"/rooms/turn":"/rooms/end",g=await L(u,{method:"POST",body:JSON.stringify({...l.input,sessionId:D.id,submissionId:l.id,operationId:l.id,expectedSceneRevision:D.sceneRevision??0,retryOfAttemptId:l.attemptId}),signal:AbortSignal.timeout(3e5)});He(g.session),oi(g.session.status==="closed"),zn(g.recordEvents??[]),mr.trim()===l.input?.message&&Ka(""),ri.current=null,uo.current=null,pa.current=null,Nt(""),Ie()}catch(l){let u=await ws(D.id);u&&He(u),Nt(F(l,"The saved request could not be recovered."))}finally{Tt(!1)}}},[D,ma,mr,zn,Ie]),i$=(0,m.useCallback)(async l=>{Tt(!0);try{let{session:u}=await L("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(1e4)});He(u),pr(u.lines.length===0?"The opening failed. You can start the conversation now.":""),Nt("")}catch(u){Nt(F(u,"The visit could not continue. Retry or leave the venue."))}finally{Tt(!1)}},[]),xc=(0,m.useCallback)(async(l,u,g="",T,R)=>{if(D?.id&&D.status==="active"&&D.placeId===l.id&&R){Tt(!0),Nt("");try{let{session:q}=await L("/rooms/zone",{method:"POST",body:JSON.stringify({sessionId:D.id,zoneId:R,expectedSceneRevision:D.sceneRevision??0})});He(q),gc(""),j("room"),Ja(!0),Ie()}catch(q){Nt(F(q,"That zone could not be entered."))}finally{Tt(!1)}return}ii.current=!1,pa.current=null,Ne(null),Ze(!1),ni(null),Ka(""),oi(!1),Nt(""),pr(""),gn([]),fn.current.clear(),Tt(!0),He({version:1,id:"",placeId:l.id,placeName:l.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Ja(!0),j("room");try{let{session:q}=await L("/rooms",{method:"POST",body:JSON.stringify({venueId:l.id,spaceClass:u,privateOwnerId:g,entryArea:T,zoneId:R,expectedSceneRevision:D?.sceneRevision}),signal:AbortSignal.timeout(2e4)});He(q),pc("chat"),gc(""),df(""),co(""),Ja(!0),Ie(),q.status==="opening"&&await Wu(q.id)}catch(q){Nt(F(q,"That room could not be opened. Retry or leave the venue."))}finally{Tt(!1)}},[Wu,Ie,D]),xf=(0,m.useCallback)(l=>{Ze(!1),Ne(l.id),j("home")},[]),$f=(0,m.useCallback)(()=>{ht(null),Ot("view"),$t("exterior"),ge(null),lt(null),Ne(null),j("home")},[]),r$=(0,m.useCallback)(async()=>{ce(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:Fe,playerPersonaId:E,setting:G,selectedLorebookIds:We,loreTokenBudget:un})}))}catch(l){be(F(l,"Those settings could not be saved."))}finally{ce(!1)}},[Fe,We,un,E,G]),o$=(0,m.useCallback)(async l=>{ce(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({storyPace:l})}))}catch(u){be(F(u,"That could not be saved."))}finally{ce(!1)}},[]),s$=(0,m.useCallback)(async l=>{let u=i?.settings.characterSpeechColors??!0;r(g=>g&&{...g,settings:{...g.settings,characterSpeechColors:l}}),ce(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:l})}))}catch(g){r(T=>T&&{...T,settings:{...T.settings,characterSpeechColors:u}}),be(F(g,"Character speech colors could not be saved."))}finally{ce(!1)}},[i?.settings.characterSpeechColors]),Sf=(0,m.useCallback)(async l=>{ce(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:l})})),S(u=>u+1)}catch(u){be(F(u,"Visit retention could not be saved."))}finally{ce(!1)}},[]),l$=(0,m.useCallback)(async()=>{if(!(i&&xs(i.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){ce(!0),be("");try{let l=await L("/bootstrap",{method:"POST"});Qr(l.places.map(u=>({id:vu(),name:u.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(l){be(F(l,"The village did not suggest any places."))}finally{ce(!1)}}},[i]),c$=(0,m.useCallback)(async()=>{if(ya.trim().length===0){Ae("Describe what the village is like before generating its map.");return}Is(!0),Ae("");try{let l=await L("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:ao===i?.settings.townMapLayoutPrompt?void 0:ao,negative:no===i?.settings.townMapNegativePrompt?void 0:no,setting:ya,options:lc,selectedLorebookIds:ea,sceneryArtStyle:Tn,useVisualLore:to,scenarioImprint:i?.isFounded?{origin:"",worldFacts:Wn,openingConditions:[],visualCues:[]}:null})}),u=await wu(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");Mu(l.image),zu("generate"),ef(_u),Vu(u),dr("generate")}catch(l){Ae(F(l,"The village map could not be generated."))}finally{Is(!1)}},[ea,no,ao,ya,lc,_u,Tn,to,Wn,i?.isFounded,i?.settings.townMapLayoutPrompt,i?.settings.townMapNegativePrompt]),d$=(0,m.useCallback)(async l=>{if(!l||!i)return;Ae("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let g=T=>Math.round(T/1e5)/10;Ae(`That picture is ${g(l.size)} MB and a village map holds ${g(u)} MB. Choose a smaller copy.`);return}Is(!0);try{let g=await Ss(l),T=await wu(g);Mu(g),zu("upload"),Vu(T),dr("upload")}catch(g){Ae(F(g,"That picture could not be used as the village map."))}finally{Is(!1)}},[i]),u$=(0,m.useCallback)(()=>{if(!i)return;let l=Object.fromEntries(i.settings.venues.map(u=>[u.id,{x:u.presentation.x,y:u.presentation.y}]));$x(l),qg(l),xx(i.settings.townMapImageSetAt),ec(i.settings.venues[0]?.id??null),Cu(!0),Wr(!1),ro(null),ai(null),hc(!1),be("")},[i]),h$=(0,m.useCallback)(async()=>{if(i){_g(!0),be("");try{let l=await L("/setup/town-map/generate",{method:"POST",body:JSON.stringify({setting:i.settings.setting,selectedLorebookIds:i.settings.selectedLorebookIds,scenarioImprint:{origin:"",worldFacts:i.settings.worldFacts,openingConditions:[],visualCues:[]}})}),u=await wu(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");ro({image:l.image,size:u}),Wr(!1),ai(Fl("cover"))}catch(l){be(F(l,"The village map could not be generated."))}finally{_g(!1)}}},[i]),m$=(0,m.useCallback)(async l=>{if(!l||!i)return;be("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let g=T=>Math.round(T/1e5)/10;be(`That picture is ${g(l.size)} MB and the village map holds ${g(u)} MB. Try a smaller copy.`);return}ce(!0);try{let g=await Ss(l),T=await wu(g);ro({image:g,size:T}),Wr(!1),ai(Fl("cover"))}catch(g){be(F(g,"That picture could not be used as the village map."))}finally{ce(!1)}},[i]),Nf=(0,m.useCallback)(async()=>{if(!i)return;let l=Ts?"":Rn?.image??io;ce(!0),be("");try{let u=Object.fromEntries(i.settings.venues.map(T=>[T.id,yu(T)])),g=await L("/town-map",{method:"PUT",body:JSON.stringify({image:l,view:Lu??i.settings.townMapView,expectedMapSetAt:mn?Hg:i.settings.townMapImageSetAt,placements:Object.entries(mn?Ug:u).map(([T,R])=>({venueId:T,fromX:R.x,fromY:R.y,x:mn?Es[T]?.x??null:R.x,y:mn?Es[T]?.y??null:R.y}))})});r(g),qu(l),ro(null),ai(null),hc(!1),Cu(!1),Wr(!1),Cs(null)}catch(u){be(F(u,"The village map could not be saved."))}finally{ce(!1)}},[i,Lu,io,Rn,Ts,mn,Hg,Ug,Es]),kf=(0,m.useCallback)(()=>{ro(null),ai(null),hc(!1),Cu(!1),Wr(!1),Cs(null),be("")},[]),p$=(0,m.useCallback)(async(l,u,g="",T)=>{if(!Mn){oo(l),ni(null),be("");try{r(await L("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:g,zoneId:T})}))}catch(R){ni({id:l,text:F(R,"That place could not be drawn.")})}finally{oo("")}}},[Mn]),g$=(0,m.useCallback)(async(l,u,g,T="",R)=>{if(!(!u||!i||Mn)){oo(l),ni(null),be("");try{let q=Se=>Math.round(Se/1e5)/10;if(u.size>i.settings.maxVenueImageBytes){ni({id:l,text:`That picture is ${q(u.size)} MB and a place holds ${q(i.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let K=await Ss(u);r(await L("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:l,image:K,spaceClass:g,privateOwnerId:T,zoneId:R})}))}catch(q){ni({id:l,text:F(q,"That picture could not be kept.")})}finally{oo("")}}},[Mn,i]),f$=(0,m.useCallback)(async(l,u,g="",T)=>{if(!Mn){oo(l),ni(null),be("");try{r(await L("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:g,zoneId:T})}))}catch(R){ni({id:l,text:F(R,"That picture could not be taken away.")})}finally{oo("")}}},[Mn]),b$=(i?.settings.venues.length??0)+Wl.filter(l=>!i?.settings.venues.some(u=>u.id===l.id)).length,Cf=(0,m.useCallback)((l,u,g)=>{let T=Oe.find(q=>q.category==="public-center"),R=Rs??(Fr?T?.id:void 0);if(O1({x:l,y:u},Oe.filter(q=>q.id!==R).map(q=>q.presentation),g??{width:1e3,height:700,photoWidth:58,photoHeight:58})){Ru("That photograph would cover another venue. Place it a little to the side.");return}if(Ru(""),R)ki(q=>q.map(K=>K.id===R?{...K,presentation:{...K.presentation,x:l,y:u}}:K)),pn(R),ei(!0);else if(Fr){let q={...G1(vu(),"gathering",l,u),imageContext:{useAssignedVillagerContext:En,useVisualLore:An}};ki(K=>[...K,q]),pn(q.id),nc(q.id),ei(!0),ti.current=null}else if(ks){let q=Oe.filter(Se=>Se.classes?.includes("residence"));if(q.length>=1+Cn)return;let K={...G1(vu(),"residence",l,u,!q.some(Se=>Se.occupancy.playerHome),q.length+1),imageContext:{useAssignedVillagerContext:En,useVisualLore:An}};ki(Se=>[...Se,K]),pn(K.id),nc(K.id),ei(!0),ti.current=null}Ms(null),Ni(!1),Jr(!1)},[Rs,ks,Fr,Cn,Oe,En,An]),Tf=(0,m.useCallback)((l,u)=>{ki(g=>g.map(T=>T.id===l?u(T):T))},[]),v$=(0,m.useCallback)(l=>{ki(u=>u.filter(T=>T.id!==l)),pn(u=>u===l?null:u)},[]),y$=l=>{if(i?.isFounded||l===Kn)return;let u=Xr(Kn).premise,g=!!Fa.trim()&&Fa!==u;Yg(l),g||Tu(Xr(l).premise),Gg(""),Ae("")},Ps=(0,m.useCallback)((l,u)=>{be(""),Ae(""),rf(!1),Ds(!1),uc(!1),Qt(!1),Pe(""),ac(0),Bg(l?"":u?.village.name??""),jg(l?"":u?.village.setting??"");let g=l?"":u?.settings.foundingReason??"",T=Tg.some(Sa=>Sa.value===g),R=T?g:g?"custom":"rebuild",q=Lk[g]??g,K=u?.settings.foundingDetails??"",Se=[q,K].filter(Boolean).join(" "),$a=Se.length>(u?.settings.foundingDetailsMaxLength??500),gr=u?.isFounded?K:g&&!T?$a?K:Se:l||!g?Xr(R).premise:K,Ei=l?"":u?.isFounded?u.settings.foundingGuidance??"":[$a?q:"",u?.settings.foundingGuidance??""].filter(Boolean).join(" ");Yg(R),Tu(gr),Gg(R==="none"?"":Ei),Nx(l?vg():u?.settings.scenarioImprint??vg()),Pg(l?[]:u?.settings.worldFacts??[]);let Mt=l||!u?[]:u.settings.venues.filter(Sa=>Sa.classes?.includes("residence")||Sa.category==="public-center");ki(Mt),Xg(Math.max(1,Mt.filter(Sa=>Sa.classes?.includes("residence")&&!Sa.occupancy.playerHome).length)),Au(Mt.filter(Sa=>Sa.form?.trim()&&Sa.description.trim()&&Sa.spaces?.[0]?.description.trim()).map(Sa=>Sa.id)),ei(!1),nc(""),ic(l||!u?.isFounded?vr["Painted illustration"]:u.settings.sceneryArtStyle??""),rc(u?.settings.personalizeVenueImagesByDefault!==!1),oc(u?.settings.useVisualLoreByDefault!==!1),Fg(u?.settings.useVisualLoreByDefault!==!1),pn(Mt[0]?.id??null),Ms(null),Ru(""),Nn(l?[]:u?.settings.selectedLorebookIds??[]),Vg(l?1600:u?.settings.loreTokenBudget??1600),Wg({...q1}),dr(l?"generate":u?.settings.townMapImageSetAt?"existing":"none"),Mu(""),zu(null),ef(""),Vu(null),Ou(u?.settings.townMapLayoutPrompt??""),Iu(u?.settings.townMapNegativePrompt??""),Is(!1),x(l?"":u?.settings.playerPersonaId??""),po(),go(),j("setup")},[go,po]),Ef=(0,m.useCallback)(l=>{if(Xe===0&&l>0){if(kn.trim().length===0){Ae("Give the village a name before continuing.");return}if(ya.trim().length===0){Ae("Describe what the village is like before continuing.");return}if(!i?.isFounded&&!Fa.trim()){Ae("Describe the village's first day before continuing.");return}}if(Xe===1&&l>1){if(!E.trim()){Ae("Choose the Persona who lives in this village.");return}if(!H?.some(u=>u.id===E)){Ae("That Persona is no longer in your library. Choose another one to continue.");return}if(Hu.length>0){Ae(Hu);return}if(nf){Ds(!0);return}}if(Xe===2&&l>2&&ct!=="none"&&!ur){Ae(ct==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(Xe===3&&l>3){if(!i?.isFounded&&Oe.some(K=>!cr.includes(K.id))){Ae("Finish each venue with Done before review.");return}if(!i?.isFounded&&Oe.filter(K=>K.classes?.includes("residence")).length<1+Cn){Ae("Place the selected number of homes before review.");return}let u=Oe.filter(K=>K.classes?.includes("residence")),g=u.filter(K=>!K.occupancy.playerHome),T=g.length;if(!u.some(K=>K.occupancy.playerHome)||T<L1||T>B1||!Oe.some(K=>K.category==="public-center")){Ae("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let R=g.map(K=>K.occupancy.residentCharacterId).filter(Boolean);if(R.length!==g.length||new Set(R).size!==R.length){Ae("Assign a different villager to each villager Residence before review.");return}let q=Oe.map(K=>({venue:K,field:K.name.trim()?K.form?.trim()?K.description.trim()?K.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:K})=>K);if(q){pn(q.venue.id),Ae(`Complete ${q.field.replaceAll("-"," ")} for ${q.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${q.field}`)?.focus(),0);return}}Ds(!1),Ae(""),ac(l),l===1&&po(),l===0&&go(),l===3&&(Vn(),ei(!1)),Ni(l===3&&!i?.isFounded&&Oe.filter(u=>u.classes?.includes("residence")).length<1+Cn),Jr(l===3&&!i?.isFounded&&Oe.filter(u=>u.classes?.includes("residence")).length>=1+Cn&&!Oe.some(u=>u.category==="public-center")),Ms(null)},[Cn,cr,Hu,Oe,nf,Vn,po,go,E,H,ct,ur,kn,Fa,i?.isFounded,ya,Xe,e]),w$=(0,m.useCallback)(()=>{Ds(!1),Ae(""),ac(2),Ni(!1),Jr(!1)},[]),x$=(0,m.useCallback)(()=>{Ds(!1),Ae("")},[]),_t=Oe.find(l=>l.id===Jg)??null,$$=l=>({id:l.id,name:l.name,form:l.form??"",description:l.description,spaceDescription:l.spaces?.[0]?.description??"",venueClass:l.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:l.occupancy.residentCharacterId??""}),S$=async(l,u)=>{if(zs)return;let g=u==="private"?l.privateSpaces?.find(q=>q.ownerId==="player")?.description??"":u==="exterior"?l.description:l.spaces?.[0]?.description??"";if(!g.trim()){pn(l.id),Ae(`Add an ${u} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${u}-description`)?.focus(),0);return}let T=Os,R=JSON.stringify(l);sc(!0),Ae("");try{let q=await L("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:$$(l),area:u,privateOwnerId:u==="private"?"player":void 0,privateDescription:g,playerPersonaId:E,sceneryArtStyle:Tn,useAssignedVillagerContext:l.imageContext?.useAssignedVillagerContext??En,useVisualLore:l.imageContext?.useVisualLore??An,villageName:kn,setting:ya,foundingDetails:Fa,scenarioImprint:i?.isFounded?Sx:null,worldFacts:i?.isFounded?Wn:[],selectedLorebookIds:ea})});if(Du.current!==T||JSON.stringify(tf.current.find(K=>K.id===l.id))!==R){Ae("The venue changed while its image was generated. Generate again.");return}ki(K=>K.map(Se=>Se.id===l.id&&JSON.stringify(Se)===R?Af(Se,u,q):Se))}catch(q){Ae(F(q,"Venue art could not be generated."))}finally{sc(!1)}},N$=async(l,u,g)=>{if(!(!g||zs)){if(g.size>(i?.settings.maxVenueImageBytes??8e6)){Ae("That venue image is too large. Choose a smaller file.");return}sc(!0),Ae("");try{let T=await L("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:l.name,image:await Ss(g)})});Tf(l.id,R=>Af(R,u,T))}catch(T){Ae(F(T,"That venue image could not be uploaded."))}finally{sc(!1)}}},Af=(l,u,g)=>u==="exterior"?{...l,presentation:{...l.presentation,image:g}}:u==="private"?{...l,privateSpaces:(l.privateSpaces??[Ec()]).map(T=>T.ownerId==="player"?{...T,image:g}:T)}:{...l,spaces:l.spaces?.map((T,R)=>R===0?{...T,image:g}:T)},eh=(l,u=cr)=>{let g=l.find(R=>!u.includes(R.id));ei(!1),pn(null),nc(g?.id??""),Ms(g?.id??null);let T=l.filter(R=>R.classes?.includes("residence")).length;Ni(!g&&(T<1+Cn||!l.some(R=>R.occupancy.playerHome))),Jr(!g&&T>=1+Cn&&!l.some(R=>R.category==="public-center")),window.setTimeout(()=>{let R=e.querySelector("."+n+"-setup-map-viewport");R?.scrollIntoView({block:"nearest"}),R?.focus()},0)},k$=()=>{if(_t){if(_t.classes?.includes("residence")&&!_t.occupancy.playerHome&&!_t.occupancy.residentCharacterId){Ae("Choose a villager.");return}if(!_t.name.trim()||!_t.form?.trim()||!_t.description.trim()||!_t.spaces?.[0]?.description.trim()){Ae("Complete this venue\u2019s name, form, exterior, and interior.");return}if(_t.privateSpaces?.some(l=>l.ownerId!=="player"&&(!l.name?.trim()||!l.purpose?.trim()||!l.controllerIds?.length))){Ae("Give each private room a name, purpose, and controller.");return}Au(l=>[...new Set([...l,_t.id])]),Ae(""),eh(Oe,[...cr,_t.id])}},C$=()=>{let l=Qg===Jg?Oe.filter(u=>u.id!==Qg):Oe.map(u=>u.id===ti.current?.id?ti.current:u);ki(l),Ae(""),eh(l)},Rf=(0,m.useCallback)(()=>{if(kn.trim().length===0)return"Give the village a name.";if(E.trim().length===0)return"Choose the Persona who lives in this village.";if(!i?.isFounded&&!Fa.trim())return"Describe the village's first day.";let l=Wn.map(R=>R.trim()).filter(Boolean);if(i?.isFounded&&(l.length>4||l.some(R=>R.length>160)))return"Use at most four current world facts of 160 characters each.";if(ya.trim().length===0)return"Describe what the village is like.";if(ct!=="none"&&!ur)return"Choose, generate, or upload the village map.";if(!i?.isFounded&&Oe.some(R=>!cr.includes(R.id)))return"Finish each venue with Done in Step 4.";let u=Oe.filter(R=>R.classes?.includes("residence")),g=u.filter(R=>!R.occupancy.playerHome);if(g.length<L1||g.length>B1)return"Place one to three homes for initial villagers.";if(!u.some(R=>R.occupancy.playerHome))return"One Residence has to be yours.";if(Oe.some(R=>!R.name.trim()||!R.form?.trim()||!R.description.trim()||!R.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let T=g.map(R=>R.occupancy.residentCharacterId).filter(R=>R!==null);return T.length!==g.length?"Choose who lives in each villager home.":new Set(T).size!==T.length?"A villager can only live in one house.":Oe.filter(R=>R.category==="public-center").length!==1?"Place one Gathering Place.":""},[Oe,cr,E,ct,ur,kn,Fa,i?.isFounded,Wn,ya]),T$=(0,m.useCallback)(async()=>{let l=Rf();if(l){let u=Oe.find(g=>!g.name.trim()||!g.form?.trim()||!g.description.trim()||!g.spaces?.[0]?.description.trim());if(u){let g=u.name.trim()?u.form?.trim()?u.description.trim()?"interior-description":"exterior-description":"form":"venue-name";pn(u.id),ac(3),window.setTimeout(()=>e.querySelector(`#${n}-setup-${g}`)?.focus(),0)}Ae(l);return}ce(!0),Ae("");try{let u=await L("/setup",{method:"POST",body:JSON.stringify({name:kn.trim(),setting:ya.trim(),foundingReason:i?.isFounded?i.settings.foundingReason:Kn,foundingDetails:i?.isFounded?i.settings.foundingDetails:Fa.trim(),foundingGuidance:i?.isFounded?i.settings.foundingGuidance:As.trim(),scenarioImprint:i?.isFounded?i.settings.scenarioImprint:null,worldFacts:i?.isFounded?Wn.map(g=>g.trim()).filter(Boolean):[],selectedLorebookIds:ea,personalizeVenueImagesByDefault:En,useVisualLoreByDefault:An,sceneryArtStyle:Tn,useVisualLore:to,loreTokenBudget:hn,playerPersonaId:E,townMapImage:ur??"",townMapView:ct==="existing"?so:Fl("cover"),venues:Oe})});r(u),Ni(!1),j(!i?.isFounded||u.foundingPreparation?.status==="pending"||u.foundingPreparation?.status==="failed"?"preparing":"home")}catch(u){Ae(F(u,"The village could not be founded."))}finally{ce(!1)}},[e,Oe,i?.isFounded,i?.settings.foundingReason,i?.settings.foundingDetails,i?.settings.foundingGuidance,i?.settings.scenarioImprint,E,so,Rf,Tn,to,En,An,ct,ur,kn,Kn,Fa,As,Wn,ea,hn,ya]),E$=(0,m.useCallback)(async()=>{ce(!0),be("");try{let l=await L("/setup/reset",{method:"POST"});r(l),d(null),Ps(!0,l)}catch(l){be(F(l,"The village could not be reset."))}finally{ce(!1),uc(!1)}},[Ps]),Mf=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!i||Mf.current||(Mf.current=!0,i.isFounded?i.foundingPreparation&&i.foundingPreparation.status!=="ready"&&j("preparing"):Ps(!1,i))},[Ps,i]),(0,m.useEffect)(()=>{if(z!=="preparing")return;let l=!1,u=async()=>{try{let T=await L("/setup/preparation");if(l)return;r(T),dc(""),(!T.foundingPreparation||T.foundingPreparation.status==="ready")&&j("home")}catch(T){l||dc(F(T,"Preparation status could not be read."))}};u();let g=window.setInterval(()=>{u()},2500);return()=>{l=!0,window.clearInterval(g)}},[z]);let A$=(0,m.useCallback)(async()=>{dc("");try{r(await L("/setup/preparation/retry",{method:"POST"}))}catch(l){dc(F(l,"Preparation could not be retried."))}},[]),R$=(0,m.useCallback)(()=>{ge({id:vu(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),M$=(0,m.useCallback)(async l=>{ce(!0),be("");try{let u=i?.settings.venues.some(q=>q.id===l.id)??!1,g=Jn(l).map(q=>dn(l,q)),T=await L(u?`/locations/venue/${encodeURIComponent(l.id)}`:"/projects",{method:u?"PUT":"POST",body:JSON.stringify(u?{name:l.name,description:g[0]?.description??l.description}:{name:l.name,classes:l.classes,description:g[0]?.description??l.description})}),R=xs(T.settings.venues).find(q=>u?q.id===l.id:q.name.toLowerCase()===l.name.trim().toLowerCase());r(T),ge(null),u||jt("projects"),Qr(q=>{let K=q.map(Se=>Se.id===l.id&&R?R:Se);return[...K,...xs(T.settings.venues).filter(Se=>!K.some($a=>$a.id===Se.id))]})}catch(u){be(F(u,"That place could not be saved."))}finally{ce(!1)}},[i,jt]),z$=(0,m.useCallback)(async l=>{let u=i?.settings.venues.find(g=>g.id===l);if(!u){Qr(g=>g.filter(T=>T.id!==l));return}ce(!0),be("");try{let g=await L(`/locations/venue/${encodeURIComponent(l)}/dependencies`);if(g.roomPresent||g.playerHome||g.residentCharacterIds.length||g.pendingMailCount){be(g.roomPresent?"End the active visit before deleting this Venue.":g.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let T=g.residentCharacterIds.length+g.pendingResidenceCharacterIds.length,R=T||g.workerCharacterIds.length||g.remapCount||g.eventCount?`This place is referenced by ${T} pending moves, ${g.workerCharacterIds.length} workers, ${g.remapCount} schedule moves, and ${g.eventCount} events. Delete it?`:`Delete ${u.name}?`;if(!window.confirm(R))return;let q=await L(`/locations/venue/${encodeURIComponent(l)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});r(q),Qr(K=>K.filter(Se=>Se.id!==l))}catch(g){be(F(g,"That place could not be removed."))}finally{ce(!1)}},[i]),zf=(0,m.useCallback)(async(l,u)=>{ce(!0),be("");try{let g=de[l.id]??l.venueDraft,T=await L(`/venue-requests/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST",body:u?JSON.stringify(g):void 0});if(r(T),u){let R=new Set(Wl.map(q=>q.id));Qr(q=>[...q,...xs(T.settings.venues).filter(K=>!R.has(K.id))])}Re(R=>{let q={...R};return delete q[l.id],q})}catch(g){be(F(g,u?"That venue could not be approved.":"That request could not be denied."))}finally{ce(!1)}},[de,Wl]),V$=(0,m.useCallback)(l=>{let u=Pu.current,g=u?.selectionStart??Fe.length,T=u?.selectionEnd??g;Xu.current=g+l.length,Bt(`${Fe.slice(0,g)}${l}${Fe.slice(T)}`)},[Fe]),Vf=(0,m.useCallback)(async()=>{let l=tc.trim();if(l.length!==0){ce(!0),be("");try{r(await L("/noticeboard",{method:"POST",body:JSON.stringify({notice:l})})),Lg("")}catch(u){be(F(u,"That notice could not be pinned up."))}finally{ce(!1)}}},[tc]),O$=(0,m.useCallback)(async l=>{ce(!0),be("");try{r(await L(`/noticeboard/${l}`,{method:"DELETE"}))}catch(u){be(F(u,"That notice could not be taken down."))}finally{ce(!1)}},[]),$c=le.trim().toLowerCase(),th=(c??[]).filter(l=>$c.length===0||l.name.toLowerCase().includes($c)||l.comment.toLowerCase().includes($c)||l.tags.some(u=>u.toLowerCase().includes($c))),Of=[...(i?.villagers??[]).map(l=>l.characterId),...qt?th.map(l=>l.id):[]].join(`
`),If=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let l=Of.split(`
`).filter(g=>g.length>0&&!If.current.has(g));if(l.length===0)return;for(let g of l)If.current.add(g);let u=new AbortController;return(async()=>{try{let g=await Wk(l,u.signal);u.signal.aborted||Rt(T=>({...T,...g}))}catch{}})(),()=>u.abort()},[Of]);let ah=i?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(W(null),ah.length===0)return;let l=new AbortController;return(async()=>{try{let u=await e2(ah,l.signal);l.signal.aborted||W(u)}catch{}})(),()=>l.abort()},[ah]);let bn=(0,m.useCallback)(l=>l?c?.find(u=>u.id===l)?.name??i?.villagers.find(u=>u.characterId===l)?.name??"":"",[c,i]),I$=(()=>{let l=i?.settings.venues??[],u=[],g=new Map;for(let T of i?.villagers??[]){let R=T.place?.id;if(!R)continue;let q=g.get(R);q?q.push(T):g.set(R,[T])}for(let T of l){let R=yu(T);if(!R)continue;let q=i?.projects.find(Ei=>Ei.venueId===T.id&&Ei.lifecycle?.phase!=="complete"),K=()=>{q&&(jt("projects"),ye(q.id),at(q.id))},Se=T.occupancy.residentCharacterId,$a=Su(T),gr=T.occupancy.playerHome?Jl(i):bn(Se);u.push({id:T.id,x:R.x,y:R.y,text:$a?p2(gr):T.name,image:q?v2:T.presentation.image?.url??null,tone:$a?tx({isPlayerHome:T.occupancy.playerHome,occupant:Se}):"venue",selected:Le===T.id,doors:Le===T.id?[...q?[{label:"View Project",onSelect:K}]:[],...q?.kind==="new-venue"?[]:[{label:"View venue",onSelect:()=>Ku(T)},{label:"Visit",onSelect:()=>{xc(T)}}]]:void 0,onSelect:q?.kind==="new-venue"?K:()=>xf(T)}),(g.get(T.id)??[]).forEach((Ei,Mt)=>{u.push({id:`villager:${Ei.characterId}`,x:R.x,y:R.y,dy:b2*(Mt+1),text:Ei.name,tone:"resident",kind:"person"})})}return u})(),D$=Oe.flatMap(l=>{let u=yu(l);return u?[{id:l.id,x:u.x,y:u.y,text:l.name||(l.category==="public-center"?"Gathering Place":"Residence"),image:l.presentation.image?.url??null,tone:l.category==="public-center"?"venue":l.occupancy.playerHome?"player":"resident",onSelect:()=>{ti.current=structuredClone(l),pn(l.id),ei(!0),Ae("")}}]:[]});if(z==="room")return(0,o.jsxs)("div",{className:`${n}-root ${n}-room-screen`,"data-mobile":t?"true":"false",children:[D?.operation?.status==="running"?(0,o.jsx)("div",{role:"status",children:"This conversation is responding. Your draft stays here."}):null,D?.operation?.status==="interrupted"?(0,o.jsxs)("div",{role:"alert",className:`${n}-room-error`,children:[(0,o.jsx)("p",{children:"The previous request may have been billed. Retry the saved request only when you are ready to authorize further work."}),(0,o.jsx)("button",{className:`${n}-button`,disabled:ma,onClick:()=>{n$()},children:"Retry saved request"})]}):null,D?(0,o.jsx)(M2,{room:D,nameColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.nameColor])):{},speechColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.dialogueColor])):{},picture:Zk(i?.settings.venues??[],D),draft:mr,mode:Hs,targetId:Us,busy:ma||D.operation?.status==="running",error:Ux,greetingNotice:qx,ruling:Dx,open:Ix,ended:ho,playerName:Jl(i),playerPortrait:C??void 0,portraits:Wt,sprites:Object.fromEntries((i?.villagers??[]).map(l=>[l.characterId,l.sprite])),onDraft:l=>{ri.current=null,uo.current=null,Ka(l)},onMode:l=>{ri.current=null,pc(l)},onTarget:l=>{ri.current=null,gc(l)},onSend:()=>{Hs==="conclude"?Kx():t$()},onViewVenue:()=>{ht(D.placeId),ge(null),j("venue"),Ie()},onEnterPrivate:D.area==="shared"&&D.privateAccessOwnerId?()=>{Tt(!0),L("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:D.id,ownerId:D.privateAccessOwnerId,expectedSceneRevision:D.sceneRevision??0})}).then(({session:l})=>{He(l),Ie()}).catch(l=>Nt(F(l,"That private space could not be entered."))).finally(()=>Tt(!1))}:void 0,privateSpaceOwnerName:bn(D.privateAccessOwnerId),onEnd:()=>{Jx()},notices:_x,onDismissNotice:l=>gn(u=>u.filter(g=>g.id!==l)),debugDiscardEnabled:qs,onDebugDiscard:()=>{e$()},onLeavePending:()=>{Wx()},endFailed:A,reviewing:Ls===D.id,onRetryGreeting:()=>{if(D.id)Wu(D.id);else{let l=i?.settings.venues.find(u=>u.id===D.placeId);l&&xc(l)}},onContinueWithoutGreeting:()=>{D.id&&i$(D.id)},onUseMailbox:i?.settings.venues.some(l=>l.id===D.placeId&&l.occupancy.playerHome&&(!D.spaceClass||D.spaceClass==="residence"))?()=>_s(!0):void 0,onProjects:()=>jt("projects")}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:wc,children:"Back to village"}),Ox&&i?(0,o.jsx)("div",{className:`${n}-mailbox-backdrop`,onClick:()=>_s(!1),children:(0,o.jsxs)("section",{className:`${n}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:l=>l.stopPropagation(),children:[(0,o.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Mailbox"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>_s(!1),children:"Close"})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,o.jsxs)("div",{className:`${n}-mailbox-list`,children:[[...i.venueMail??[]].reverse().map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsx)("strong",{children:l.title}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("p",{className:`${n}-hint`,children:l.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(l.dueAt).toLocaleString()}`:l.status==="pending-player"?"Awaiting your decision":l.status==="approved"?"Approved":"Declined"}),l.decisions.map(u=>(0,o.jsxs)("p",{children:[(0,o.jsxs)("strong",{children:[bn(u.characterId),":"]})," ",u.reply]},u.characterId)),l.status==="pending-player"&&l.kind==="villager-change"?(0,o.jsx)(R2,{entry:l,onDecide:async(u,g)=>{r(await L(`/venue-mail/${encodeURIComponent(l.id)}/decision`,{method:"POST",body:JSON.stringify({approved:u,...g})}))}}):null,l.error?(0,o.jsxs)("p",{className:`${n}-hint`,children:["Reply delayed: ",l.error]}):null]},l.id)),(i.venueMail?.length??0)===0&&i.venueRequests.length===0&&i.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No Venue mail yet."}):null,i.venueRequests.map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName||"A villager"," suggests ",l.venueDraft.name]}),(0,o.jsx)("p",{children:l.venueDraft.classes.map(u=>u[0].toUpperCase()+u.slice(1)).join(" / ")}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{_s(!1),jt("venueRequests")},children:"Review request"})]},l.id)),i.upgradeRequests.map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName," suggests a home change"]}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{_s(!1),jt("venueRequests")},children:"Review request"})]},l.id))]})]})}):null]});if(z==="venue"){let l=(i?.settings.venues??[]).find(k=>k.id===ie)??null;if(!i||!l)return(0,o.jsx)("div",{className:`${n}-root`,children:(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:"A place that is gone"}),(0,o.jsx)("p",{className:`${n}-subtitle`,children:"This venue is no longer in the village."})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:$f,children:"Back to map"})]})});let u=a$(l.id),g=Jn(l),T=l.occupancy.homeKind?g2(s,l.occupancy.homeKind).name:"",R=l.occupancy.playerHome?Jl(i):bn(l.occupancy.residentCharacterId),q=l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[]),K=g.includes("residence")&&q.length>0,Se=D?.placeId===l.id&&(D.area==="shared"||D.area==="private"),$a=D?.placeId===l.id&&D.area==="private"?D.privateOwnerId:"",gr=l.occupancy.playerHome||l.playerSeenShared||Se,Ei=(l.privateSpaces??[]).filter(k=>l.playerSeenPrivateIds?.includes(k.ownerId)||k.ownerId===$a),Mt=D?.status!=="closed"&&D?.id?D:null,Sa=(l.playerInvitations??[]).some(k=>q.includes(k.residentId)),_$=[{key:"exterior",label:"Exterior",subtitle:"Outside the building",area:"outside",spaceClass:g[0],ownerId:"",image:l.presentation.image,description:l.form||T||`The outside of ${l.name}.`,state:l.exteriorState,locked:!1,canEnter:!0,accessLabel:"Open (no restrictions)"},...g.map(k=>{let xe=dn(l,k),ne=k==="residence",fe=ne?!gr:!l.playerSeenPublic&&!(Mt?.placeId===l.id&&Mt.area==="public"),et=!ne||!K||l.occupancy.playerHome||Sa;return{key:`class:${k}`,label:g.length===1?"Interior":`${k[0].toUpperCase()}${k.slice(1)} interior`,subtitle:ne?"Shared living space":`${k[0].toUpperCase()}${k.slice(1)} space`,area:ne?"shared":"public",spaceClass:k,ownerId:"",image:fe?null:xe.image,description:fe?"":xe.description,state:fe?void 0:xe.state,locked:fe,canEnter:et,accessLabel:et?"Open to visit":"Resident invitation required"}}),...(l.privateSpaces??[]).filter(k=>q.includes(k.ownerId)).map(k=>{let xe=bn(k.ownerId),ne=!l.playerSeenPrivateIds?.includes(k.ownerId)&&k.ownerId!==$a,fe=(l.playerInvitations??[]).some(et=>et.scope==="private"&&et.ownerId===k.ownerId&&et.residentId===k.ownerId);return{key:`private:${k.ownerId}`,label:`${xe}'s Private Space`,subtitle:"Restricted area",area:"private",spaceClass:"residence",ownerId:k.ownerId,image:ne?null:k.image,description:ne?"":k.description,state:ne?void 0:k.state,locked:ne,canEnter:fe,accessLabel:fe?"Owner's invitation available":"Owner's invitation required",adaptationPending:!ne&&k.adaptationPending}})],Sc=l.zones?l.zones.map(k=>{let xe=k.kind==="exterior"?"outside":k.kind==="private-residence"?"private":k.kind==="shared-residence"?"shared":"public",ne=k.kind!=="exterior"&&!k.seen&&!(l.occupancy.playerHome&&k.kind==="shared-residence")&&!(Mt?.placeId===l.id&&Mt.zoneId===k.id),fe=l.playerInvitations?.some(Ra=>Ra.zoneId===k.id)||Mt?.placeId===l.id&&Mt.grantedZoneIds?.includes(k.id),et=!k.closed&&(k.kind==="exterior"||k.kind==="public"||(k.kind==="shared-residence"||k.kind==="private-residence"&&k.ownerId==="player")&&l.occupancy.playerHome||!!fe||k.kind==="restricted"&&!!k.controllerIds?.includes("player"));return{key:k.id,zoneId:k.id,label:k.kind==="private-residence"?k.ownerId==="player"?"Your personal space":bn(k.ownerId??"")+"'s Private Space":k.name,subtitle:k.kind==="staff"?"Staff area":k.kind==="shared-residence"?"Shared living space":k.kind==="private-residence"?"Resident's personal space":k.kind==="exterior"?"Outside the building":"Public area",area:xe,spaceClass:k.venueClass,ownerId:k.ownerId??"",image:ne?null:k.image,description:ne?"":k.description,state:ne?void 0:k.state,locked:ne,canEnter:et,accessLabel:k.closed?"Closed for Renovation":k.kind==="exterior"||k.kind==="public"?"Open to everyone":fe?"Permission for this visit":k.kind==="private-residence"?"Owner's invitation required":k.kind==="staff"?"Workers and invited guests":k.kind==="restricted"?"Assigned controllers and invited guests":"Residents and invited guests"}}):_$,ue=Sc.find(k=>k.key===st)??Sc[0],fr=l.zones?.find(k=>k.id===ue.zoneId),Xs=fr?.preparation,H$=fr?.kind==="staff"?l.workerIds??[]:fr?.kind==="private-residence"?[fr.ownerId??""]:fr?.controllerIds??[],Df=(l.editProposals??[]).filter(k=>k.zoneId?k.zoneId===ue.zoneId:ue.area==="shared"?k.target==="shared":ue.area==="private"&&k.target==="private"&&k.ownerId===ue.ownerId),nh=ue.description&&ue.description!==l.form&&ue.description!==T?ue.description:"",U$=!ue.locked&&!!(nh||ue.adaptationPending||ue.state?.condition||ue.state?.items.length||ue.state?.publicFacts.length||ue.state?.features.length||ue.area==="outside"&&i.village.setting||Df.length),Nc=Mt?.placeId===l.id&&(ue.zoneId?Mt.zoneId===ue.zoneId:Mt.area===ue.area)&&(ue.zoneId?Mt.zoneId===ue.zoneId:ue.area==="outside"||Mt.spaceClass===ue.spaceClass)&&(ue.area!=="private"||Mt.privateOwnerId===ue.ownerId),q$=(k,xe,ne,fe="",et)=>(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h3",{className:`${n}-panel-title`,children:k}),fe?(0,o.jsx)("p",{children:"Personal-space images always reflect their owner."}):null,(0,o.jsxs)("fieldset",{children:[(0,o.jsx)("legend",{children:"Venue image context"}),(fe?["useVisualLore"]:["useAssignedVillagerContext","useVisualLore"]).map(Ra=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",disabled:ae,checked:l.imageContext?.[Ra]??(Ra==="useVisualLore"?i.settings.useVisualLoreByDefault!==!1:i.settings.personalizeVenueImagesByDefault!==!1),onChange:async ih=>{let G$={useAssignedVillagerContext:l.imageContext?.useAssignedVillagerContext??i.settings.personalizeVenueImagesByDefault!==!1,useVisualLore:l.imageContext?.useVisualLore??i.settings.useVisualLoreByDefault!==!1,[Ra]:ih.target.checked};ce(!0);try{r(await L("/locations/venue/"+encodeURIComponent(l.id),{method:"PUT",body:JSON.stringify({name:l.name,description:l.description,imageContext:G$})}))}catch(P$){be(F(P$,"Image context could not be saved."))}finally{ce(!1)}}}),Ra==="useVisualLore"?"Use selected visual lore":"Use assigned villagers\u2019 personality"]},Ra))]}),xe?(0,o.jsx)("img",{className:`${n}-venue-space-picture`,src:xe.url,alt:`${k} at ${l.name}`}):(0,o.jsx)("div",{className:`${n}-venue-image-empty`,children:"No image yet"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!Mn||ae,onClick:()=>{p$(l.id,ne,fe,et)},children:xe?"Redraw image":"Draw image"}),(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*","aria-label":`Upload ${k.toLowerCase()} image`,disabled:!!Mn||ae,onChange:Ra=>{let ih=Ra.target.files?.[0];Ra.target.value="",g$(l.id,ih,ne,fe,et)}}),xe?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!Mn||ae,onClick:()=>{f$(l.id,ne,fe,et)},children:"Remove image"}):null]})]},et||fe||ne||"exterior"),bo=k=>({name:k.name,form:k.form,workerIds:k.workerIds,position:{x:k.presentation.x,y:k.presentation.y},spaces:g.map(xe=>{let ne=dn(k,xe);return{description:ne.description,condition:ne.state.condition,items:ne.state.items,publicFacts:ne.state.publicFacts,features:ne.state.features.map(({id:fe,text:et,locked:Ra})=>({id:fe,text:et,locked:Ra}))}}),privateSpaces:k.privateSpaces?.map(xe=>({ownerId:xe.ownerId,description:xe.description,condition:xe.state.condition,items:xe.state.items,publicFacts:xe.state.publicFacts,features:xe.state.features.map(({id:ne,text:fe,locked:et})=>({id:ne,text:fe,locked:et}))}))}),L$=!!(pe&&JSON.stringify(bo(pe))!==JSON.stringify(bo(l))),B$=!!(he&&(JSON.stringify(he.classes)!==JSON.stringify(g)||he.capacity!==(l.residenceCapacity??1)||he.slot!==0||he.title||he.description||he.extraBeds)),j$=()=>{(qe==="edit"&&L$||qe==="proposal"&&B$)&&!window.confirm("Discard your unsaved changes?")||(Ot("view"),ge(null),lt(null),Ve(""),X(""))},_f=(k,xe)=>{r(k);let ne=k.settings.venues.find(fe=>fe.id===l.id);ne&&ge(structuredClone(ne)),X(xe)},Y$=async()=>{if(pe){if(pe.form!==l.form||JSON.stringify(pe.classes)!==JSON.stringify(l.classes)||JSON.stringify(pe.workerIds??[])!==JSON.stringify(l.workerIds??[])||JSON.stringify(pe.state)!==JSON.stringify(l.state)||pe.presentation.x!==l.presentation.x||pe.presentation.y!==l.presentation.y){Ve("Physical edits and map moves need an earned route. Edit only the name or description here.");return}if(K){let k=bo(pe),xe=bo(l),ne=g.indexOf("residence");if((ne>=0&&JSON.stringify(k.spaces[ne])!==JSON.stringify(xe.spaces[ne])||JSON.stringify(k.privateSpaces)!==JSON.stringify(xe.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}nt(!0),Ve(""),X("");try{let k=await L(`/locations/venue/${encodeURIComponent(l.id)}`,{method:"PUT",body:JSON.stringify({name:pe.name,description:pe.description})});_f(k,"Venue details saved.")}catch(k){Ve(F(k,"The Venue could not be saved."))}finally{nt(!1)}}},Hf=async(k,xe="")=>{if(!pe)return;let ne=k==="private"?pe.privateSpaces?.find(et=>et.ownerId===xe):dn(pe,"residence");if(!ne)return;let fe=structuredClone(pe);if(k==="shared"?fe.spaces=fe.spaces?.map(et=>et.venueClass==="residence"?dn(l,"residence"):et):fe.privateSpaces=fe.privateSpaces?.map(et=>et.ownerId===xe?l.privateSpaces?.find(Ra=>Ra.ownerId===xe)??et:et),!(JSON.stringify(bo(fe))!==JSON.stringify(bo(l))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){nt(!0),Ve(""),X("");try{let et=await L(`/locations/venue/${encodeURIComponent(l.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:k,ownerId:xe,description:ne.description,state:ne.state})});_f(et,`${k==="private"?"Private":"Shared"} room edit proposed.`)}catch(et){Ve(F(et,"That room edit could not be proposed."))}finally{nt(!1)}}},Uf=f2(l,R);return(0,o.jsxs)("div",{className:`${n}-root`,"data-venue-view":qe==="view"?"true":void 0,children:[(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:qe==="view"?Uf:`${qe==="edit"?"Edit Venue":"Propose Change"} \xB7 ${Uf}`}),(0,o.jsx)("p",{className:`${n}-subtitle`,children:qe==="view"?l.form||T||(u.length===0?"Nobody is here right now":`Villagers here: ${u.map(k=>k.name).join(", ")}`):qe==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,o.jsxs)("div",{className:`${n}-venue-header-controls`,children:[(0,o.jsx)("div",{className:`${n}-actions`,children:qe==="view"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{ge(structuredClone(l)),Ve(""),X(""),Ot("edit")},children:"Edit Venue"}),g.includes("residence")&&!l.occupancy.playerHome?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Ve(""),L(`/locations/venue/${encodeURIComponent(l.id)}/player-move`,{method:"POST"}).then(r).catch(k=>Ve(F(k,"The move could not be requested.")))},children:"Request to live here"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{lt({classes:g,capacity:l.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),Ve(""),X(""),Ot("proposal")},children:"Propose Change"}),Mt?.placeId===l.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>j("room"),children:"Return to scene"}):null]}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:j$,children:qe==="edit"?"Close Editor":"Exit Change Proposal"})}),qe==="view"&&Lt?(0,o.jsx)("p",{className:`${n}-venue-move-error`,role:"alert",children:Lt}):null]})]}),qe==="view"?(0,o.jsxs)("main",{className:n+"-venue-page","aria-label":"View Venue",children:[(0,o.jsxs)("nav",{className:n+"-venue-zones","aria-label":"Venue zones",children:[(0,o.jsx)("button",{type:"button",className:n+"-venue-back",onClick:$f,children:"\u2190 Back to map"}),Sc.map(k=>(0,o.jsxs)("button",{type:"button",className:n+"-venue-zone-tab","data-active":ue.key===k.key?"true":"false","aria-current":ue.key===k.key?"page":void 0,onClick:()=>$t(k.key),children:[(0,o.jsx)("span",{className:n+"-venue-zone-thumb",children:k.image&&!k.locked?(0,o.jsx)("img",{src:k.image.url,alt:""}):(0,o.jsx)("span",{"aria-hidden":"true",children:k.locked?"\u25C8":"\u2302"})}),(0,o.jsxs)("span",{className:n+"-venue-zone-copy",children:[(0,o.jsx)("strong",{children:k.label}),(0,o.jsx)("small",{children:k.subtitle})]})]},k.key))]}),(0,o.jsxs)("div",{className:n+"-venue-zone-content",children:[(0,o.jsx)("section",{className:n+"-venue-zone-main","aria-label":ue.label,children:(0,o.jsx)("div",{className:n+"-venue-artwork",children:ue.image&&!ue.locked?(0,o.jsx)("img",{src:ue.image.url,alt:ue.label+" at "+l.name}):(0,o.jsx)("div",{className:n+"-venue-artwork-empty",children:ue.locked?"Area not discovered yet":"No image for this area yet"})})}),(0,o.jsxs)("aside",{className:n+"-venue-zone-context",children:[(0,o.jsx)("span",{className:n+"-venue-kicker",children:"Zone"}),(0,o.jsx)("h2",{children:ue.label}),(0,o.jsx)("p",{children:ue.subtitle}),(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Occupancy"}),(0,o.jsx)("strong",{children:g.includes("residence")?Nu(l)+" / "+J1(l)+" residents":u.length+" here now"})]}),(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Accessibility"}),(0,o.jsx)("strong",{children:ue.accessLabel})]}),fr&&["private-residence","staff","restricted"].includes(fr.kind)?(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Controllers"}),(0,o.jsx)("strong",{children:H$.map(k=>k==="player"?"You":i.villagers.find(xe=>xe.characterId===k)?.name??k).join(", ")||"No current controllers"})]}):null,Xs?.status==="ready"?(0,o.jsx)("p",{role:"status",children:"Private space ready."}):null,Xs&&Xs.status!=="ready"?(0,o.jsxs)("p",{role:"status",children:["Private space ",Xs.status==="failed"?"preparation failed":"is being prepared",".",Xs.status==="failed"?(0,o.jsx)("button",{type:"button",disabled:ae,onClick:async()=>{ce(!0);try{r(await L("/private-spaces/retry",{method:"POST"}))}catch(k){be(F(k,"Private preparation failed."))}finally{ce(!1)}},children:"Retry private-space preparation"}):null]}):null,U$?(0,o.jsxs)("details",{className:n+"-venue-more",children:[(0,o.jsx)("summary",{children:"Area details"}),nh?(0,o.jsx)("p",{children:nh}):null,ue.adaptationPending?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{children:"This room is still being adapted after a move."}),(0,o.jsx)(Y1,{jobs:(i?.backgroundWork??[]).filter(k=>k.kind==="adaptation"),onRetry:vc})]}):null,ue.state?.condition?(0,o.jsxs)("p",{children:["Condition: ",ue.state.condition]}):null,ue.state?.items.length?(0,o.jsxs)("p",{children:["Present items: ",ue.state.items.join(", ")]}):null,ue.state?.publicFacts.length?(0,o.jsxs)("p",{children:["Established facts: ",ue.state.publicFacts.join(" \xB7 ")]}):null,ue.state?.features.length?(0,o.jsxs)("p",{children:["Defining features: ",ue.state.features.map(k=>k.text).join(" \xB7 ")]}):null,ue.area==="outside"&&i.village.setting?(0,o.jsxs)("p",{children:["Village: ",i.village.setting]}):null,Df.map(k=>(0,o.jsxs)("p",{children:["Proposed room edit:"," ",k.declined?"declined or stale":`approved by ${k.approvedIds.length} of ${k.requiredIds.length} residents`]},k.id))]}):null,ue.locked&&!ue.canEnter?(0,o.jsx)("p",{className:n+"-venue-zone-guidance",children:"Visit the exterior and ask the resident for an invitation."}):null,Mt&&!Nc?(0,o.jsx)("p",{className:n+"-venue-zone-guidance",children:"Move between zones to continue this visit."}):null,(0,o.jsx)("button",{type:"button",className:n+"-venue-visit",disabled:ma||!Nc&&(!!Mt&&Mt?.placeId!==l.id||!ue.canEnter),onClick:()=>Nc?j("room"):void xc(l,ue.spaceClass,ue.ownerId,ue.area,ue.zoneId),children:ma?"Opening visit\u2026":Nc?"Return to scene \u2192":"Visit this area \u2192"})]})]})]}):qe==="edit"?(0,o.jsxs)("main",{className:`${n}-venue-editor-page`,children:[(0,o.jsx)("div",{className:`${n}-venue-space-grid`,children:Sc.filter(k=>!k.locked).map(k=>q$(k.label+" image",k.image,k.area==="outside"?void 0:k.spaceClass,k.ownerId,k.zoneId))}),Mn===l.id?(0,o.jsx)("p",{className:`${n}-hint`,children:"Drawing or saving the image\u2026"}):null,sf?.id===l.id?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:sf.text}):null,ue.zoneId&&!ue.locked?(0,o.jsx)(i2,{zone:ue,onSave:async k=>{try{r(await L(`/venues/${encodeURIComponent(l.id)}/zones/${encodeURIComponent(ue.zoneId)}`,{method:"PUT",body:JSON.stringify(k)}))}catch(xe){throw ni({id:l.id,text:F(xe,"The zone could not be saved.")}),xe}}},ue.zoneId):null,pe?(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue details"}),(0,o.jsx)(K1,{draft:pe,existing:!0,villagers:i.villagers,editableClasses:g.filter(k=>k!=="residence"||!K||Se),onChange:ge}),K?(0,o.jsx)("p",{className:`${n}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:kt||!pe.name.trim(),onClick:()=>{Y$()},children:"Save Venue details"}),K&&Se?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:kt||!dn(pe,"residence").description.trim(),onClick:()=>{Hf("shared")},children:"Propose shared room edit"}):null]}),K&&!Se?(0,o.jsx)("p",{className:`${n}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,$a&&pe?.privateSpaces?.filter(k=>k.ownerId===$a).map(k=>(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsxs)("h2",{className:`${n}-panel-title`,children:["Propose changes to ",bn(k.ownerId),"'s private space"]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:k.description,onChange:xe=>ge(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(fe=>fe.ownerId===k.ownerId?{...fe,description:xe.target.value}:fe)})})]}),(0,o.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:k.state.condition,onChange:xe=>ge(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(fe=>fe.ownerId===k.ownerId?{...fe,state:{...fe.state,condition:xe.target.value}}:fe)})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this room."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:k.state.items.join(`
`),onChange:xe=>ge(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(fe=>fe.ownerId===k.ownerId?{...fe,state:{...fe.state,items:xe.target.value.split(`
`)}}:fe)})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this room."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:k.state.publicFacts.join(`
`),onChange:xe=>ge(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(fe=>fe.ownerId===k.ownerId?{...fe,state:{...fe.state,publicFacts:xe.target.value.split(`
`)}}:fe)})})]})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:kt||!k.description.trim(),onClick:()=>{Hf("private",k.ownerId)},children:"Propose private room edit"})]},k.ownerId)),K&&(l.residentIds?.length??0)>0?(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Resident moves"}),(0,o.jsxs)("select",{value:we,onChange:k=>je(k.target.value),"aria-label":"Destination for resident move",children:[(0,o.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),i.settings.venues.filter(k=>k.id!==l.id&&Jn(k).includes("residence")&&Nu(k)<J1(k)).map(k=>(0,o.jsx)("option",{value:k.id,children:k.name},k.id))]}),(l.residentIds??[]).map(k=>{let xe=i.residences.find(ne=>ne.characterId===k&&ne.status!=="current");return(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("strong",{children:bn(k)}),xe?(0,o.jsx)("span",{className:`${n}-hint`,children:xe.status==="moving"?"Moving":"Awaiting consent"}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!we||kt,onClick:()=>{nt(!0),L("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:k,venueId:we})}).then(r).catch(ne=>Ve(F(ne,"The move could not be requested."))).finally(()=>nt(!1))},children:"Ask to move"})]},k)})]}):null,I?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:I}):null,Lt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]}):(0,o.jsx)("main",{className:`${n}-venue-proposal-page`,children:(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Propose a Venue change"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),he?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${n}-row`,children:Ns.map(k=>(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:he.classes.includes(k),disabled:!he.classes.includes(k)&&he.classes.length>=2,onChange:xe=>lt(ne=>ne&&{...ne,classes:xe.target.checked?[...ne.classes,k]:ne.classes.filter(fe=>fe!==k)})})," ",k]},k))})]}),he.classes.includes("residence")?(0,o.jsxs)("label",{className:`${n}-label`,children:["Base capacity \xB7 includes you",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:he.capacity,onChange:k=>lt({...he,capacity:Number(k.target.value)})})]}):null,(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:he.slot,onChange:k=>lt({...he,slot:Number(k.target.value)}),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",l.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",l.improvements?.[1]?.title??"empty"]})]})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,o.jsx)("input",{className:`${n}-notice-input`,value:he.title,onChange:k=>lt({...he,title:k.target.value}),placeholder:"A second sleeping alcove"})]}),he.title?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["What changes in the story?",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:he.description,onChange:k=>lt({...he,description:k.target.value})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:3,value:he.extraBeds,onChange:k=>lt({...he,extraBeds:Number(k.target.value)})})]})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:kt||he.classes.length<1||he.title.trim().length>0&&!he.description.trim(),onClick:()=>{nt(!0),Ve(""),L(`/locations/venue/${encodeURIComponent(l.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:he.classes,capacity:he.capacity,...he.title.trim()?{slot:he.slot,improvement:{title:he.title,description:he.description,extraBeds:he.extraBeds}}:{},title:he.title||`Change ${l.name}`,detail:he.description||`Change Venue Classes or capacity at ${l.name}.`})}).then(k=>{r(k),lt(null),X("Proposal submitted.")}).catch(k=>Ve(F(k,"The proposal could not be saved."))).finally(()=>nt(!1))},children:"Submit proposal"})]}):(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:I||"Proposal submitted."}),Lt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Lt}):null]})})]})}if(z==="menu")return(0,o.jsxs)("div",{className:`${n}-root ${n}-sectioned-menu`,"data-section":It,"data-page":P,"data-mobile":t,children:[(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:V2[P]}),t?null:(0,o.jsx)("p",{className:`${n}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,o.jsx)("div",{className:`${n}-actions`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:P!=="index"?()=>gt("index"):wc,children:P!=="index"?"Back to menu":"Back to the village"})}),Ci?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Ci}):null]}),(0,o.jsxs)("nav",{className:`${n}-menu-nav`,"aria-label":"Village menu pages",children:[(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village Management"}),(0,o.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":P==="villagers","data-active":P==="villagers"?"true":"false",disabled:!i||ae,onClick:()=>jt("villagers"),children:`Villagers (${i?.villagers.length??0})`}),(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":P==="memories","data-active":P==="memories"?"true":"false",disabled:!i||ae,onClick:()=>jt("memories"),children:"Memories"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":P==="venueRequests","data-active":P==="venueRequests"?"true":"false",disabled:!i||ae,onClick:()=>jt("venueRequests"),children:`Venue Requests (${(i?.venueRequests?.length??0)+(i?.upgradeRequests?.length??0)+(i?.residences?.filter(l=>l.status==="pending"&&l.requestedBy==="villager").length??0)})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":P==="projects","data-active":P==="projects"?"true":"false",disabled:!i||ae,onClick:()=>jt("projects"),children:`Projects (${i?.projects?.filter(l=>(l.kind==="new-venue"||l.kind==="renovation")&&l.lifecycle?.phase!=="complete").length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":P==="village","data-active":P==="village"?"true":"false",onClick:()=>jt("village"),children:"Village Settings"})]})]}),(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"General Settings"}),(0,o.jsx)("div",{className:`${n}-menu-group-buttons`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":P==="general","data-active":P==="general"?"true":"false",onClick:()=>jt("general"),children:"General settings"})})]}),(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Debug"}),(0,o.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[qs?(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":P==="progress","data-active":P==="progress"?"true":"false",disabled:!i||ae,onClick:()=>jt("progress"),children:"DEBUG: Progress"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":P==="chatlogs","data-active":P==="chatlogs"?"true":"false",disabled:!i||ae,onClick:()=>jt("chatlogs"),children:`DEBUG: Venue Visits (${b?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":P==="agendas","data-active":P==="agendas"?"true":"false",disabled:!i||ae,onClick:()=>jt("agendas"),children:`DEBUG: Villager Wishes (${ve?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":P==="schedules","data-active":P==="schedules"?"true":"false",disabled:!i||ae,onClick:()=>jt("schedules"),children:`Villager Agendas (${ve?.length??0})`})]})]})]}),P==="index"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-content ${n}-menu-welcome`,role:"main",children:[yc,(0,o.jsx)("span",{className:`${n}-venue-kicker`,children:"Village menu"}),(0,o.jsx)("h2",{children:"Choose where to go"}),(0,o.jsx)("p",{children:"Manage the people and places in your village, adjust settings, or inspect its DEBUG records."}),(0,o.jsxs)("div",{className:`${n}-menu-quick-links`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>jt("villagers"),children:"Village Management"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>jt("general"),children:"General Settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>jt("chatlogs"),children:"DEBUG Settings"})]})]}):!i&&P!=="general"?(0,o.jsx)("section",{className:`${n}-panel ${n}-menu-content`,role:"main",children:Ci?"The village could not be loaded. Return to the village and try again.":"Loading village menu\u2026"}):P==="general"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-content`,role:"main",children:[yc,(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"General settings"}),(0,o.jsx)(kg,{}),i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-row`,htmlFor:`${n}-speech-colors`,children:[(0,o.jsx)("input",{id:`${n}-speech-colors`,type:"checkbox",checked:i.settings.characterSpeechColors,disabled:ae,onChange:l=>{s$(l.target.checked)}}),(0,o.jsx)("span",{children:"Character chat colors"})]}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Show names and spoken words in the colors captured from each villager\u2019s card. Use Compare card and Apply refresh to adopt later color changes."})]}):null,i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-story-pace`,children:"Background events and wishes"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Controls automatic Events, resident housing proposals from those events, and new wishes. Off pauses these. Time, schedules, approved moves, construction, and existing wish expiry continue. Visits and other generation features use their own controls. All enabled levels allow at most one new wish per resident per day and two active wishes; quiet days can have none."}),(0,o.jsx)("select",{id:`${n}-story-pace`,value:i.settings.storyPace,disabled:ae,onChange:l=>{o$(l.target.value)},children:i.settings.storyPaces.map(l=>(0,o.jsx)("option",{value:l,children:l.charAt(0).toUpperCase()+l.slice(1)},l))}),(0,o.jsx)("span",{className:`${n}-hint`,children:n2(i.settings.storyPace)})]}):null,i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-visit-retention`,children:"Visit transcripts"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,o.jsxs)("select",{id:`${n}-visit-retention`,value:i.settings.visitRetention.mode,disabled:ae,onChange:l=>{let u=l.target.value;Sf({mode:u,value:u==="count"?100:u==="days"?365:0})},children:[(0,o.jsx)("option",{value:"forever",children:"Keep forever"}),(0,o.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,o.jsx)("option",{value:"days",children:"Retire after days"})]}),i.settings.visitRetention.mode!=="forever"?(0,o.jsx)("input",{type:"number","aria-label":i.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:i.settings.visitRetention.mode==="count"?1:30,max:i.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:i.settings.visitRetention.value,onBlur:l=>{let u=Number(l.target.value);u!==i.settings.visitRetention.value&&Sf({mode:i.settings.visitRetention.mode,value:u})}},`${i.settings.visitRetention.mode}:${i.settings.visitRetention.value}`):null]}):null,(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Starting over"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,o.jsx)("div",{className:`${n}-row`,children:Rx?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-danger`,disabled:ae,onClick:()=>{E$()},children:"Yes, empty the village"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>uc(!1),children:"Keep it"})]}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae||!i,onClick:()=>uc(!0),children:"Reset the village and start over"})})]}),xa?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:xa}):null]}):P==="village"?(0,o.jsxs)("div",{className:`${n}-menu-body ${n}-menu-content`,role:"main",children:[(0,o.jsxs)("section",{className:n+"-venue-card",children:[(0,o.jsx)(mh,{value:Tn,onChange:ic}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:En,onChange:l=>rc(l.target.checked)}),"Personalize new venue images by default"]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:An,onChange:l=>oc(l.target.checked)}),"Use visual lore by default"]}),(0,o.jsx)("button",{type:"button",disabled:ae,onClick:async()=>{ce(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({sceneryArtStyle:Tn,personalizeVenueImagesByDefault:En,useVisualLoreByDefault:An})}))}catch(l){be(F(l,"Scenery settings could not be saved."))}finally{ce(!1)}},children:"Save scenery settings"})]}),yc,i?(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village settings"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"These choices belong to this village. Resident cards shape their voices, and Villages writes each scene around what is happening now. Village knowledge is refreshed for every reply."}),(0,o.jsx)(T2,{}),(0,o.jsxs)("section",{className:n+"-field","aria-label":"Village Map",children:[(0,o.jsx)("h3",{className:n+"-panel-title",children:"Village Map"}),(0,o.jsx)("p",{className:n+"-hint",children:"Replace the background image here. Venue pins remain in their saved places until you reposition them in the preview."}),mn?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:"Venues will not move automatically. Review every pin on the new map; moving one here is free and does not change its residents, projects, or history."}):null,(0,o.jsx)(Ng,{src:Vx,alt:"Village map preview with venue pins",pins:i.settings.venues.flatMap(l=>{let u=mn?Es[l.id]:yu(l);return!u||u.x===null||u.y===null?[]:[{id:l.id,x:u.x,y:u.y,text:l.name,tone:Su(l)?tx({isPlayerHome:l.occupancy.playerHome,occupant:l.occupancy.residentCharacterId}):"venue",onSelect:()=>ec(l.id)}]}),placing:mn&&Kr!==null,view:hr,shape:Mx,zoom:zx,mobile:t,onView:mc&&!Kr?ai:void 0,onPlace:mn&&Kr?(l,u)=>{qg(g=>({...g,[Kr]:{x:l,y:u}})),ec(Kr),Cs(null)}:void 0}),mn?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:ae||eo,onClick:()=>{h$()},children:eo?"Generating map\u2026":"Generate replacement"}),(0,o.jsx)("input",{className:n+"-file",type:"file",accept:"image/png,image/jpeg,image/webp,image/avif","aria-label":"Upload replacement village map",disabled:ae||eo,onChange:l=>{let u=l.target.files?.[0];l.target.value="",m$(u)}}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:ae||eo,onClick:()=>{Wr(!0),ro(null),ai(null),Cs(null)},children:"No background image"})]}),Rn||Ts?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:n+"-hint",children:"Select a venue, then choose Move pin and its new position on the preview. Unmoved venues keep their saved coordinates."}),(0,o.jsx)("div",{className:n+"-field","aria-label":"Venue placement",children:i.settings.venues.map(l=>{let u=Es[l.id],g=l.occupancy.residentCharacterId?bn(l.occupancy.residentCharacterId):l.occupancy.playerHome?Jl(i):"";return(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":wx===l.id,onClick:()=>ec(l.id),children:l.name}),(0,o.jsx)("span",{className:n+"-hint",children:g||"No resident"}),(0,o.jsx)("span",{className:n+"-hint",children:u?.x!==null&&u?.x!==void 0&&u?.y!==null&&u?.y!==void 0?"On map":"Not placed"}),(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":Kr===l.id,onClick:()=>Cs(l.id),children:"Move pin"})]},l.id)})})]}):null,Bu?(0,o.jsx)("p",{className:n+"-hint","data-tone":Bu.tone,children:Bu.text}):null,mc?(0,o.jsx)("div",{className:n+"-steps",role:"group","aria-label":"How the picture sits in the frame",children:ax.map(l=>(0,o.jsx)("button",{type:"button",className:n+"-step","data-clickable":"true","data-active":hr.fit===l.fit?"true":"false","aria-pressed":hr.fit===l.fit,onClick:()=>ai({...hr,fit:l.fit}),children:l.label},l.fit))}):null,(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:ae||eo||!Rn&&!Ts,onClick:()=>{Nf()},children:"Save map and placements"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:ae||eo,onClick:kf,children:"Cancel replacement"})]})]}):mc?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:n+"-steps",role:"group","aria-label":"How the picture sits in the frame",children:ax.map(l=>(0,o.jsx)("button",{type:"button",className:n+"-step","data-clickable":"true","data-active":hr.fit===l.fit?"true":"false","aria-pressed":hr.fit===l.fit,onClick:()=>ai({...hr,fit:l.fit}),children:l.label},l.fit))}),(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:ae,onClick:()=>{Nf()},children:"Save framing"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:ae,onClick:kf,children:"Cancel"})]})]}):(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:ae,onClick:u$,children:"Replace map"}),i.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:ae||!io,onClick:()=>hc(!0),children:"Crop or fit current map"}):null]}),xa?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:xa}):null]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae||!i,onClick:()=>Ps(!1,i),children:"Run setup again"}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${n}-setting`,className:`${n}-textarea ${n}-off`,value:G,maxLength:i.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:l=>se(l.target.value)}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,o.jsx)(rx,{books:ku,error:Og,selected:We,onChange:Aa,disabled:ae}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${n}-lore-budget`,className:`${n}-notice-input`,type:"number",min:i.settings.loreTokenBudgetMin,max:i.settings.loreTokenBudgetMax,step:100,value:un,disabled:ae,onChange:l=>ra(Number(l.target.value))}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,o.jsxs)("section",{className:`${n}-field`,children:[(0,o.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venues"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:R$,disabled:ae||b$>=i.settings.maxPlaces,children:"Propose Venue Project"})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,o.jsx)("input",{className:`${n}-notice-input`,type:"search",value:Dg,onChange:l=>yx(l.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,o.jsx)("div",{className:`${n}-notice-add`,children:i.settings.venues.filter(l=>`${l.name} ${l.form??""} ${Jn(l).join(" ")}`.toLowerCase().includes(Dg.toLowerCase())).map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name||"Unnamed Residence"}),(0,o.jsx)("span",{className:`${n}-hint`,children:[l.form,Jn(l).join(" + ")].filter(Boolean).join(" \xB7 ")}),Jn(l).includes("residence")?(0,o.jsxs)("span",{className:`${n}-hint`,children:[(l.residentIds?.length??+!!l.occupancy.residentCharacterId)+Number(l.occupancy.playerHome)," ","/ ",l.residenceCapacity??1," residents"]}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ku(l),children:"View Venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>ge(structuredClone(l)),children:"Edit"}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{z$(l.id)},"aria-label":`Delete ${l.name}`,disabled:ae,children:"\xD7"})]})]},l.id))}),pe?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("h3",{className:`${n}-panel-title`,children:i.settings.venues.some(l=>l.id===pe.id)?"Edit Venue":"Create Venue"}),(0,o.jsx)(K1,{draft:pe,existing:i.settings.venues.some(l=>l.id===pe.id),villagers:i.villagers,onChange:ge}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae||!pe.name.trim()||!Jn(pe).every(l=>dn(pe,l).description.trim()),onClick:()=>{M$(pe)},children:"Save Venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>ge(null),children:"Cancel"})]})]}):null,(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{l$()},disabled:ae,children:"Suggest Venues"})}),Wl.filter(l=>!i.settings.venues.some(u=>u.id===l.id)).map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name}),(0,o.jsx)("span",{className:`${n}-hint`,children:l.form}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>ge(l),children:"Review suggestion"})]},l.id))]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-knowledge`,children:"The information villagers know"}),(0,o.jsx)("textarea",{id:`${n}-knowledge`,ref:Pu,className:`${n}-preset`,value:Fe,maxLength:i.settings.promptBoxMaxLength,spellCheck:!1,onChange:l=>Bt(l.target.value)}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card guides their voice; additional writing guidance is in Village Settings."}),(0,o.jsx)("div",{className:`${n}-macros`,children:i.settings.macros.map(l=>(0,o.jsx)("button",{type:"button",className:`${n}-macro`,title:`${l.label} \u2014 ${l.help}`,onClick:()=>V$(l.token),children:l.token},l.token))}),(0,o.jsxs)("p",{className:`${n}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,o.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,o.jsx)(k2,{idPrefix:"settings",personas:H,draft:E,onDraft:x,storedId:i.settings.playerPersonaId,storedName:i.settings.playerPersonaName,storedMissing:i.settings.playerPersonaMissing,disabled:ae}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{r$()},disabled:ae,children:"Save settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Bt(i.settings.defaultPromptKnowledge)},disabled:ae,children:"Restore the default box"}),(0,o.jsx)("span",{className:`${n}-hint`,children:Fe===i.settings.promptKnowledge&&E===i.settings.playerPersonaId&&G===i.settings.setting&&JSON.stringify(We)===JSON.stringify(i.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,xa&&!mn&&!of?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:xa}):null]}):(0,o.jsxs)("div",{className:`${n}-menu-body ${n}-menu-content`,role:"main",children:[yc,It==="debug"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-debug-action`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!i||ae||Gu,onClick:()=>{Lx()},children:"Force Village Update"}),(0,o.jsx)("p",{className:`${n}-status`,children:O2}),pf?(0,o.jsx)("p",{className:`${n}-status`,role:"status",children:pf}):null]}):null,P==="villagers"&&Dt&&i?.villagers.some(l=>l.characterId===Dt)?(0,o.jsx)(ub,{villager:i.villagers.find(l=>l.characterId===Dt),request:L,onSaved:l=>r(l),onExport:()=>A2(i.villagers.find(l=>l.characterId===Dt)),onBack:()=>{ft(null),requestAnimationFrame(()=>{for(let{element:l,top:u}of Gt.current)l.scrollTop=u;va.current?.focus({preventScroll:!0})})}},Dt):null,P==="villagers"?(0,o.jsxs)("div",{className:`${n}-overlay`,style:Dt?{display:"none"}:void 0,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Villagers"})}),(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Qt(l=>!l),disabled:ae,children:qt?"Close the list":"Add a villager"})}),qt?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("input",{className:`${n}-search`,type:"search",value:le,onChange:l=>Pe(l.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),c===null?(0,o.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):th.length===0?(0,o.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,o.jsx)("div",{className:`${n}-picker-list`,children:th.map(l=>(0,o.jsxs)("div",{className:`${n}-picker-item`,"data-resident":l.inVillage?"true":"false",children:[(0,o.jsx)(Zr,{portrait:Wt[l.id],name:l.name,className:`${n}-avatar`}),(0,o.jsxs)("div",{className:`${n}-picker-text`,children:[(0,o.jsx)("div",{className:`${n}-villager-name`,children:l.name}),(0,o.jsx)("div",{className:`${n}-villager-role`,children:l.comment||l.tags.slice(0,3).join(" \xB7 ")}),l.summary?(0,o.jsx)("p",{className:`${n}-tile-summary`,children:l.summary}):null]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Xx(l.id)},disabled:ae||l.inVillage,children:l.inVillage?"Lives here":"Move in"})]},l.id))})]}):null,i&&i.villagers.length>0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:`${n}-villagers`,children:i.villagers.map(l=>(0,o.jsx)(E2,{villager:l,portrait:Wt[l.characterId],selected:!1,onSelect:!l.place||D!==null?void 0:()=>{let u=i.settings.venues.find(g=>g.id===l.place?.id);u&&xf(u)}},l.characterId))}),(0,o.jsx)("div",{className:`${n}-roster`,children:i.villagers.map(l=>(0,o.jsx)("div",{className:`${n}-roster-entry`,children:(0,o.jsxs)("div",{className:`${n}-roster-row`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-villager-name`,children:l.name}),l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,Ct[l.characterId]?(0,o.jsx)("div",{className:`${n}-tile-summary`,children:Ct[l.characterId].changed?`New card: ${Ct[l.characterId].proposed?.name??"unavailable"}`:Ct[l.characterId].sourceAvailable?`Snapshot revision ${Ct[l.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,o.jsxs)("span",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:u=>{va.current=u.currentTarget,Gt.current=[];for(let g=u.currentTarget.parentElement;g;g=g.parentElement)Gt.current.push({element:g,top:g.scrollTop});ft(l.characterId)},"aria-expanded":Dt===l.characterId,children:`Sprite Studio \xB7 ${l.sprite?.images.length??0} approved`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Qx(l.characterId)},disabled:ae||Ha.length>0,children:"Compare card"}),Ct[l.characterId]?.changed&&Ct[l.characterId]?.sourceAvailable?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Fx(l.characterId)},disabled:ae||Ha.length>0,children:"Apply refresh"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Zx(l.characterId)},disabled:ae||Ha.length>0,children:"Move out"})]})]})},l.characterId))})]}):(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]})]}):null,P==="memories"?(0,o.jsxs)("div",{className:n+"-overlay",children:[(0,o.jsx)("div",{className:n+"-overlay-head",children:(0,o.jsx)("h2",{className:n+"-panel-title",children:"Memories"})}),(0,o.jsx)(Yk,{library:h,busy:ae,onRefresh:()=>{p(null),Gs()},onForget:(l,u)=>{Bx(l,u)}})]}):null,P==="noticeboard"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Noticeboard"})}),i.noticeboard.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,o.jsx)("ul",{className:`${n}-notices`,children:i.noticeboard.map((l,u)=>(0,o.jsxs)("li",{className:`${n}-notice-row`,children:[(0,o.jsxs)("span",{children:[l.author.length>0?(0,o.jsx)("span",{className:`${n}-notice-author`,children:`${l.author}: `}):null,l.text]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{O$(u)},disabled:ae,"aria-label":`Take down: ${l.text}`,children:"\xD7"})]},`${u}:${l.text}`))}),(0,o.jsxs)("div",{className:`${n}-notice-add`,children:[(0,o.jsx)("input",{className:`${n}-notice-input`,type:"text",value:tc,maxLength:i.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:l=>Lg(l.target.value),onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),Vf())}}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Vf()},disabled:ae||tc.trim().length===0||i.noticeboard.length>=i.settings.maxNoticeboardNotes,children:`Pin it up (${i.noticeboard.length}/${i.settings.maxNoticeboardNotes})`})]})]}):null,P==="projects"&&i?(0,o.jsx)(D2,{snapshot:i,room:D,onSnapshot:r,onReturn:()=>j("room"),onMap:()=>{at(""),wc()},onPlaceOnMap:l=>{ye(l),Be(l),wc()},mobile:t,debugEnabled:qs,focusProjectId:me,siteProjectId:Ge}):null,P==="venueRequests"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue Requests"})}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Villagers can ask for places in conversation. Accepting a request starts a New Venue Project; place its blueprint on the map, find a willing Builder, and work through the Project phases."}),i.venueRequests.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody has requested a new place."}):(0,o.jsx)("ul",{className:`${n}-notices`,children:i.venueRequests.map(l=>{let u=de[l.id]??l.venueDraft,g=T=>Re(R=>({...R,[l.id]:{...u,...T}}));return(0,o.jsx)("li",{className:`${n}-notice-row`,children:(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("strong",{children:l.requesterName||"A villager"}),l.requestQuote?(0,o.jsxs)("p",{children:["\u201C",l.requestQuote,"\u201D"]}):null,(0,o.jsx)("span",{className:`${n}-hint`,children:` \xB7 ${l.source==="chat"?"Conversation":"Village life"}`}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:u.name,maxLength:i.settings.maxVenueNameLength,"aria-label":`Requested place name from ${l.requesterName||"villager"}`,onChange:T=>g({name:T.target.value})}),(0,o.jsxs)("select",{className:`${n}-notice-input`,value:u.classes[0]??"gathering","aria-label":`Requested place class from ${l.requesterName||"villager"}`,onChange:T=>g({classes:[T.target.value]}),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"other",children:"Other"})]}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:u.description??"",maxLength:1e3,"aria-label":`Requested place description from ${l.requesterName||"villager"}`,onChange:T=>g({description:T.target.value})}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae||!u.name.trim(),onClick:()=>{ce(!0),be(""),L("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:u.name,classes:u.classes}]})}).then(T=>g({description:T.descriptions[l.id]??""})).catch(T=>be(F(T,"The description draft could not be generated."))).finally(()=>ce(!1))},children:"Generate description draft"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae||!u.name.trim()||u.classes.length===0||!u.description?.trim(),onClick:()=>{zf(l,!0)},children:u.name!==l.venueDraft.name||JSON.stringify(u.classes)!==JSON.stringify(l.venueDraft.classes)?"Send counteroffer":"Start planning project"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{zf(l,!1)},children:"Deny"})]})]})},l.id)})}),(0,o.jsx)("h3",{className:`${n}-panel-title`,children:"Home upgrade requests"}),i.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No home upgrades requested."}):i.upgradeRequests.map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("span",{children:l.detail}),[!0,!1].map(u=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{ce(!0),be(""),L(`/venue-upgrades/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST"}).then(r).catch(g=>be(F(g,"The upgrade request could not be decided."))).finally(()=>ce(!1))},children:u?"Approve upgrade":"Deny"},String(u)))]},l.id)),(0,o.jsx)("h3",{className:`${n}-panel-title`,children:"Resident move requests"}),i.residences.filter(l=>l.status!=="current").length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No moves pending."}):i.residences.filter(l=>l.status!=="current").map(l=>{let u=bn(l.characterId),g=i.settings.venues.find(T=>T.id===l.proposedVenueId)?.name||"another venue";return(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("span",{children:`${u} \u2192 ${g}`}),l.status==="moving"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("span",{className:`${n}-hint`,children:["Move due ",new Date(l.completesAt??"").toLocaleString()]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{ce(!0),be(""),L("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(T=>be(F(T,"The move could not be completed."))).finally(()=>ce(!1))},children:"DEBUG: Complete move now"})]}):l.requestedBy==="player"?(0,o.jsxs)("span",{className:`${n}-hint`,children:["Awaiting ",u,"'s answer in conversation."]}):[!0,!1].map(T=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{ce(!0),be(""),L(`/residences/${T?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(R=>be(F(R,"The move request could not be decided."))).finally(()=>ce(!1))},children:T?"Approve move":"Deny"},String(T)))]},l.characterId)}),xa?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:xa}):null]}):null,P==="progress"?(0,o.jsxs)("div",{className:`${n}-panel`,children:[(0,o.jsx)("h2",{children:"DEBUG: Progress"}),(0,o.jsxs)("p",{children:["Engine version: ",Me?.engineVersion??"loading"]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{L("/progress/debug").then(Vt)},children:"Refresh diagnostics"}),Me?.backlog.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Unprocessed saved turns"}),Me.backlog.map(l=>(0,o.jsxs)("p",{children:[l.at," \xB7 ",l.sessionId,"/",l.submissionId," ",l.error?`\xB7 ${l.error}`:"\xB7 awaiting replay"]},`${l.sessionId}:${l.submissionId}`))]}):(0,o.jsx)("p",{children:"No saved turns await replay."}),Me?.speechProofs?.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Captured Project speech"}),Me.speechProofs.map(l=>(0,o.jsxs)("p",{children:[l.projectId," \xB7 ",l.grade??"typed"," \xB7 ",l.lineId,": \u201C",l.quote,"\u201D",l.citations?.map((u,g)=>(0,o.jsxs)("span",{children:[" ","\xB7 ",u.lineId,": \u201C",u.quote,"\u201D"]},`${u.lineId}:${g}`))]},`${l.projectId}:${l.lineId}`))]}):null,Me?.tasks.map(l=>(0,o.jsxs)("details",{open:!0,children:[(0,o.jsxs)("summary",{children:[l.definition.owner.kind," ",l.definition.owner.id," \xB7 revision ",l.definition.revision," \xB7"," ",l.resolvedAt?"resolved":l.definition.phases[l.phaseIndex]?.title??"complete"]}),(0,o.jsxs)("p",{children:["Disclosed: ",l.visibleAt||"hidden",l.resolvedAt?` \xB7 Resolved: ${l.resolvedAt} \xB7 ${l.resolutionKey}`:""]}),l.definition.phases.map(u=>(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:u.title}),u.requirements.map(g=>{let T=l.receipts.filter(R=>R.phaseId===u.id&&R.requirementId===g.id);return(0,o.jsxs)("p",{children:[g.title," \xB7 ",l.requirementVisibleAt[g.id]||"hidden"," \xB7"," ",T.length?T.map(R=>`${R.routeId} [${R.evidence.grade??"typed"}]: ${R.evidence.sourceId} ${R.evidence.excerpt??""} ${(R.evidence.citations??[]).map(q=>`${q.lineId}: ${q.quote}`).join("; ")}`).join("; "):"pending"]},g.id)})]},u.id)),l.attempts.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Rejected or unavailable"}),l.attempts.map((u,g)=>(0,o.jsxs)("p",{children:[u.phaseId,"/",u.requirementId," \xB7 ",u.status,": ",u.reason]},`${u.evidenceId}:${g}`))]}):null,l.transitions.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Transitions"}),l.transitions.map((u,g)=>(0,o.jsxs)("p",{children:[u.phaseId," \u2192 ",u.at," \xB7 ",u.evidenceId]},`${u.phaseId}:${g}`))]}):null,l.revisionHistory?.map(u=>(0,o.jsxs)("details",{children:[(0,o.jsxs)("summary",{children:["Earlier revision ",u.definition.revision," \xB7 ",u.receipts.length," accepted sources"]}),u.receipts.map(g=>(0,o.jsxs)("p",{children:[g.requirementId," \xB7 ",g.evidence.grade??"typed"," \xB7 ",g.evidence.sourceId," ","\xB7 ",g.evidence.excerpt??"",g.evidence.citations?.map(T=>(0,o.jsxs)("span",{children:[" ","\xB7 ",T.lineId,": \u201C",T.quote,"\u201D"]},`${T.lineId}:${T.quote}`))]},`${g.requirementId}:${g.evidence.sourceId}`)),u.transitions.map((g,T)=>(0,o.jsxs)("p",{children:[g.phaseId," \u2192 ",g.at]},`${g.phaseId}:${T}`))]},u.definition.revision))]},l.definition.id)),Ci?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Ci}):null]}):null,P==="chatlogs"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue visits"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsxs)("select",{"aria-label":"Filter visits by venue",value:Z,onChange:l=>{ee(l.target.value),M(0),w(null)},children:[(0,o.jsx)("option",{value:"",children:"All venues"}),(i?.settings.venues??[]).map(l=>(0,o.jsx)("option",{value:l.id,children:l.name},l.id))]}),(0,o.jsxs)("select",{"aria-label":"Filter visits by resident",value:Q,onChange:l=>{Te(l.target.value),M(0),w(null)},children:[(0,o.jsx)("option",{value:"",children:"All residents"}),(i?.villagers??[]).map(l=>(0,o.jsx)("option",{value:l.characterId,children:l.name},l.characterId))]})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae||f===0,onClick:()=>{yf()},children:"Delete all completed logs"}),B?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:B}):null,b===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading venue visits\u2026"}):b.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No completed visits match these filters."}):b.map(l=>(0,o.jsxs)("section",{children:[(0,o.jsxs)("h3",{className:`${n}-story-day`,children:[l.placeName," \xB7 ",xu(l.startedAt)]}),(0,o.jsxs)("p",{className:`${n}-story-meta`,children:[l.participants.map(u=>u.name).join(", ")," \xB7 ",l.lineCount," lines",l.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",l.memoryPending?l.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${l.memoryReview.nextRecollection??0}/${l.recollectionCount} recollections reviewed \xB7 ${l.memoryReview.attempts} ${l.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${l.memoryProgress?.nextUnit??0}/${l.memoryUnits} pieces processed)`:""]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Ju(l.id)},children:v?.id===l.id?"Refresh transcript":"Open transcript"}),l.memoryPending?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{Px(l.id)},children:l.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{yf(l.id)},children:"Delete log"})]}),v?.id===l.id?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("ul",{className:`${n}-story`,children:v.lines.map((u,g)=>(0,o.jsx)("li",{className:`${n}-story-row`,children:(0,o.jsxs)("span",{children:[(0,o.jsxs)("span",{className:`${n}-story-meta`,children:[(0,o.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?$u(i.villagers.find(T=>T.characterId===u.speakerId)?.nameColor):void 0,children:u.name||Jl(i)})," \xB7 ",xu(u.at)]}),(0,o.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?$u(i.villagers.find(T=>T.characterId===u.speakerId)?.dialogueColor):void 0,children:$s(u.content,`venue-${l.id}-${g}-`)}),(0,o.jsxs)("span",{className:`${n}-story-meta`,children:["Heard by:"," ",u.heardBy?.map(T=>v.participants.find(R=>R.characterId===T)?.name??T).join(", ")||"no one"]})]})},`${l.id}:${g}`))}),(v.submissions??[]).some(u=>u.recollections?.length)?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,o.jsx)("summary",{children:"Captured recollections and evidence"}),(0,o.jsx)("ul",{className:`${n}-story`,children:(v.submissions??[]).flatMap(u=>(u.recollections??[]).map(g=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:g.text}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Subjects: ${g.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${g.knownByCharacterIds.join(", ")}`}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Evidence: ${g.lineIds.join(", ")}`})]},g.id)))})]}):null,v.memoryReview&&v.memoryReview.status!=="none"?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,open:v.memoryPending,children:[(0,o.jsx)("summary",{children:`Durable review \xB7 ${v.memoryReview?.status??"none"}`}),(0,o.jsxs)("div",{className:`${n}-agenda-notes-body`,children:[(0,o.jsxs)("p",{className:`${n}-story-meta`,children:[`${v.memoryReview?.attempts??0} review attempts \xB7 ${v.memoryReview?.nextRecollection??0} recollections reviewed`,v.memoryReview?.error?` \xB7 Last error: ${v.memoryReview.error}`:""]}),(0,o.jsx)("ul",{className:`${n}-story`,children:(v.memoryReview?.decisions??[]).map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:`${u.action==="promote"?"Promoted":"Rejected"}${u.category?` \xB7 ${dx[u.category]}`:""}`}),u.text?(0,o.jsx)("p",{children:u.text}):null,(0,o.jsx)("p",{className:`${n}-wish-meta`,children:u.reason}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Sources: ${u.recollectionIds.join(", ")}`})]},u.id))})]})]}):null]}):null]},l.id)),f>20?(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:V===0,onClick:()=>{M(Math.max(0,V-20)),w(null)},children:"Previous"}),(0,o.jsxs)("span",{children:[V+1,"\u2013",Math.min(f,V+20)," of ",f]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:V+20>=f,onClick:()=>{M(V+20),w(null)},children:"Next"})]}):null]}):null,P==="agendas"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"What the villagers wish"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),ve===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading what the villagers wish\u2026"}):ve.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("section",{children:ve.map(l=>(0,o.jsxs)("div",{children:[(0,o.jsxs)("h3",{className:`${n}-story-day`,children:[l.name,l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null]}),l.agenda===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):l.agenda.wishes.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure?`Routine personalization needs attention: ${l.agenda.personalizationFailure}`:l.agenda.generatedAt?"No current wishes.":"Their provisional routine is available. New wishes follow the daily allowance."}):(0,o.jsx)("ul",{className:`${n}-story`,children:l.agenda.wishes.map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:u.wish}),u.tell.length>0?(0,o.jsx)("p",{className:`${n}-wish-tell`,children:`Shows as: ${u.tell}`}):null,(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`${u.intensity===1?"Faint":u.intensity===3?"Strong":"Present"} \xB7 ${Xk(u.addedAt??"",u.expiresAt??"")}`})]},u.id))}),(0,o.jsx)(_2,{characterId:l.characterId,total:l.wishHistoryCount??0,busy:ae,onCorrect:Yx}),l.wishAttempt?(0,o.jsx)("p",{className:`${n}-hint`,children:`Wish update: ${l.wishAttempt.stage} \xB7 ${l.wishAttempt.reason} \xB7 ${l.wishAttempt.calls} requests \xB7 input tokens ${l.wishAttempt.inputTokens??"unavailable"} \xB7 output tokens ${l.wishAttempt.outputTokens??"unavailable"}`}):null]},l.characterId))})]}):null,P==="schedules"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Villager agendas"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),ve===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Loading agendas\u2026"}):ve.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("div",{className:`${n}-agenda-list`,children:ve.map(l=>(0,o.jsxs)("details",{className:`${n}-week`,children:[(0,o.jsx)("summary",{className:`${n}-week-toggle`,children:(0,o.jsxs)("h3",{className:`${n}-week-head`,children:[l.name,l.agenda?.personalizationPending?(0,o.jsx)("span",{className:`${n}-badge`,children:l.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,l.agenda?.personalizationFailure?(0,o.jsx)("span",{className:`${n}-badge`,children:"Personalization failed"}):null,l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"Card missing"}):null,l.nativeSchedule?(0,o.jsx)("span",{className:`${n}-badge`,children:l.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,wg(l)?(0,o.jsx)("span",{className:`${n}-badge`,children:"Earlier hours kept"}):null]})}),(0,o.jsxs)("div",{className:`${n}-week-body`,children:[l.agenda?.routineSummary?(0,o.jsx)("p",{className:`${n}-story-meta`,children:l.agenda.routineSummary}):null,l.agenda?.personalizationFailure?(0,o.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure}):l.agenda?.personalizationPending?(0,o.jsx)("p",{className:`${n}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,o.jsxs)("div",{className:`${n}-agenda-actions`,children:[(0,o.jsxs)("label",{className:`${n}-agenda-switch`,children:[(0,o.jsx)("input",{type:"checkbox",checked:l.ingestSchedule,disabled:ae,onChange:u=>{Gx(l.characterId,u.target.checked)}}),"Use Marinara schedule when available"]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{jx(l.characterId)},children:"Regenerate agenda"})]}),l.nativeSchedule?(0,o.jsxs)("p",{className:`${n}-story-scope`,children:[l.ingestSchedule&&l.remapFailure?`Schedule translation failed: ${l.remapFailure.message}`:l.ingestSchedule&&l.agenda?.scheduleWeek?"Schedule guides today and future days.":l.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",wg(l)?" Earlier hours retain the previous plan.":""]}):wg(l)?(0,o.jsx)("p",{className:`${n}-story-scope`,children:"Earlier hours retain the previous plan."}):null,l.weekUnreadable?(0,o.jsx)("p",{className:`${n}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):l.nativeSchedule?null:(0,o.jsx)("p",{className:`${n}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,o.jsx)("div",{className:`${n}-agenda-days`,children:l.days.map(u=>{let g=u.isToday?l.effectiveDays?.[u.weekday]??l.agenda?.activeDay?.blocks??l.agenda?.week?.[u.weekday]??[]:l.effectiveDays?.[u.weekday]??(l.ingestSchedule?l.agenda?.scheduleWeek?.[u.weekday]:void 0)??l.agenda?.week?.[u.weekday]??[],T=l.nativeSchedule?.days[u.weekday]??[];return(0,o.jsxs)("details",{className:`${n}-agenda-day`,open:u.isToday||void 0,children:[(0,o.jsxs)("summary",{children:[u.weekday," \xB7 ",u.dateLabel,u.isToday?" \xB7 Today":""]}),(0,o.jsxs)("div",{className:`${n}-agenda-compare`,"data-comparison":l.nativeSchedule?"true":void 0,children:[(0,o.jsxs)("section",{"aria-label":`${u.weekday} Villages agenda`,children:[(0,o.jsx)("h4",{children:"Villages agenda"}),(0,o.jsx)("ol",{className:`${n}-agenda-blocks`,children:g.map((R,q)=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("time",{children:[X1(R.startMinute),"\u2013",X1(R.endMinute)]}),(0,o.jsx)("strong",{children:R.activity}),(0,o.jsx)("span",{children:R.venueId?Gk(i?.settings.venues??[],R.venueId):"Home"}),(0,o.jsx)("span",{children:R.reason}),(0,o.jsx)("span",{className:`${n}-story-scope`,children:R.status==="idle"?"Available":R.status==="dnd"?"Busy":R.status==="offline"?"Offline":"Online"})]},`${R.startMinute}-${R.endMinute}-${q}`))})]}),l.nativeSchedule?(0,o.jsxs)("section",{"aria-label":`${u.weekday} Marinara schedule`,children:[(0,o.jsx)("h4",{children:"Marinara schedule"}),T.length?(0,o.jsx)("ol",{className:`${n}-agenda-blocks`,children:T.map((R,q)=>(0,o.jsxs)("li",{children:[(0,o.jsx)("time",{children:R.time}),(0,o.jsx)("strong",{children:R.activity}),(0,o.jsx)("span",{className:`${n}-story-scope`,children:R.status||"No availability set"})]},`${R.time}-${q}`))}):(0,o.jsx)("p",{className:`${n}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${u.weekday}-${u.dateLabel}`)})})]})]},l.characterId))})]}):null,xa?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:xa}):null]})]});if(z==="preparing"){let l=i?.foundingPreparation,u=i?.villagers.length??0,g=l?.completedIds.length??0,T=i?.villagers.find(Se=>Se.characterId===l?.currentId)?.name,R=l?.stage==="reading"?"Reading the character card and native schedule":l?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":l?.stage==="resolving"?"Connecting to the System model":l?.stage==="model"?`Waiting for ${l.modelName||"the System model"} to write wishes, the week, and schedule mappings`:l?.stage==="applying"?"Expanding the week and applying native schedule times":l?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",q=l?.stageStartedAt?Date.parse(l.stageStartedAt):NaN,K=l?.status==="pending"&&Number.isFinite(q)?Math.max(0,Math.floor((Date.now()-q)/1e3)):null;return(0,o.jsx)("div",{className:`${n}-root ${n}-preparing`,role:"status","aria-live":"polite",children:(0,o.jsxs)("div",{children:[(0,o.jsx)("div",{className:`${n}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,o.jsxs)("h1",{children:[i?.village.name??"Your village"," is settling in"]}),(0,o.jsx)("p",{children:l?.status==="failed"?"The villagers need a hand before the gates open.":T?`Making room for ${T}\u2026`:"Lighting windows and making plans\u2026"}),(0,o.jsx)("p",{children:`${g} of ${u} villagers ready`}),l?.status==="pending"&&l.stage?(0,o.jsxs)("p",{children:[R,T?` for ${T}`:"","."]}):null,l?.attempt?(0,o.jsx)("p",{children:`Attempt ${l.attempt} of 3${K!==null?` \xB7 ${K}s in this stage`:""}`}):null,l?.stage==="resolving"||l?.stage==="model"||l?.stage==="applying"||l?.stage==="saving"?(0,o.jsx)("p",{children:`${l.loreEntryCount??0} relevant lorebook entries included`}):null,l?.status==="pending"&&l.error?(0,o.jsx)("p",{className:`${n}-hint`,children:`Previous attempt: ${l.error}`}):null,l?.status==="failed"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:l.error}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{A$()},children:"Retry this villager"}),(0,o.jsxs)("details",{children:[(0,o.jsx)("summary",{children:"Change connections"}),(0,o.jsx)(kg,{})]})]}):null,af?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:af}):null]})})}if(z==="setup"){let l=(c??[]).map(u=>({id:u.id,name:u.name}));return(0,o.jsx)("div",{className:`${n}-root ${n}-home ${n}-setup-root`,children:(0,o.jsxs)("div",{className:`${n}-home-body ${n}-setup-body`,"data-step":Xe,children:[(0,o.jsx)("aside",{className:`${n}-setup-rail`,"aria-label":"Founding progress",children:fu.map((u,g)=>(0,o.jsxs)("div",{className:`${n}-setup-rail-step`,"data-active":g===Xe?"true":"false","data-done":g<Xe?"true":"false","aria-current":g===Xe?"step":void 0,children:[(0,o.jsx)("span",{className:`${n}-setup-rail-number`,children:g+1}),(0,o.jsx)("span",{children:u})]},u))}),(0,o.jsx)("div",{className:`${n}-side`,children:(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:i?.isFounded?"Setting the village up again":"Founding your village"})}),(0,o.jsxs)("p",{className:`${n}-setup-kicker`,children:["Step ",Xe+1," of ",fu.length," \xB7 ",fu[Xe]]}),Xe===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-name`,children:"What is this village called?"}),(0,o.jsx)("input",{id:`${n}-setup-name`,className:`${n}-search`,type:"text",value:kn,maxLength:i?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:ae,onChange:u=>Bg(u.target.value)})]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Choose a scenario"}),(0,o.jsx)("div",{className:`${n}-scenario-options`,children:Tg.filter(u=>u.value!=="custom"||i?.isFounded&&Kn==="custom").map(u=>(0,o.jsxs)("label",{className:`${n}-scenario-option`,children:[(0,o.jsx)("input",{type:"radio",name:`${n}-founding-scenario`,checked:Kn===u.value,disabled:ae||i?.isFounded,onChange:()=>y$(u.value)}),(0,o.jsx)("span",{className:`${n}-scenario-icon`,"aria-hidden":"true",children:u.icon}),(0,o.jsx)("strong",{children:u.label}),(0,o.jsx)("small",{children:u.description})]},u.value))})]}),i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,Xe===1?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(N2,{personas:H,draft:E,onDraft:x,disabled:ae}),(0,o.jsx)(kg,{onSetupProblem:Ex,onImageWarningChange:rf,compact:!0}),Ax?(0,o.jsxs)("div",{className:`${n}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,o.jsx)("p",{className:`${n}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,o.jsxs)("span",{className:`${n}-chat-confirm-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:x$,children:"Set up an image connection"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:w$,children:"I understand, continue"})]})]}):null]}):null,Xe===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${n}-setup-setting`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:ya,maxLength:i?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:ae||wa,onChange:u=>{jg(u.target.value)}}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),i?.isFounded?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("strong",{children:"Day 1 record"}),(0,o.jsx)("p",{className:`${n}-hint`,children:i.settings.foundingDetails||"This village has no recorded first-day description."}),(0,o.jsx)("span",{className:`${n}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-founding-details`,children:"What happens on the village's first day?"}),(0,o.jsx)("textarea",{id:`${n}-founding-details`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:Fa,maxLength:i?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:ae,onChange:u=>Tu(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history."})]}),i?.isFounded?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-world-facts`,children:"Current world facts"}),(0,o.jsx)("textarea",{id:`${n}-world-facts`,className:`${n}-textarea`,value:Wn.join(`
`),disabled:ae,placeholder:"One stable fact per line, up to four.",onChange:u=>Pg(u.target.value.split(/\r?\n/u))}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,o.jsx)(rx,{books:ku,error:Og,selected:ea,onChange:u=>{Nn(u)},disabled:ae}),(0,o.jsxs)("details",{className:`${n}-field`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Advanced lore settings"}),(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${n}-setup-lore-budget`,className:`${n}-notice-input`,type:"number",min:i?.settings.loreTokenBudgetMin??200,max:i?.settings.loreTokenBudgetMax??3200,step:100,value:hn,disabled:ae,onChange:u=>Vg(Number(u.target.value))}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Xe===2&&i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"Replace the map and review venue pins in Village Settings \u2192 Village Map. Finish this setup to keep changes you made on earlier steps."}):null,Xe===2&&!i?.isFounded?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(mh,{value:Tn,onChange:ic}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:to,onChange:u=>Fg(u.target.checked)}),"Use selected visual lore for the map"]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:An,onChange:u=>oc(u.target.checked)}),"Use visual lore for new venues by default"]}),(0,o.jsxs)("div",{className:`${n}-steps`,role:"group","aria-label":"Village map image source",children:[(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":ct==="generate"?"true":"false","aria-pressed":ct==="generate",disabled:wa,onClick:()=>dr("generate"),children:"Generate with AI"}),(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":ct==="upload"?"true":"false","aria-pressed":ct==="upload",disabled:wa,onClick:()=>dr("upload"),children:"Upload an image"}),(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":ct==="none"?"true":"false","aria-pressed":ct==="none",disabled:wa,onClick:()=>dr("none"),children:"No background image"}),i?.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":ct==="existing"?"true":"false","aria-pressed":ct==="existing",disabled:wa,onClick:()=>dr("existing"),children:"Keep current map"}):null]}),ct==="generate"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Advanced map elements"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,o.jsx)("div",{className:`${n}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([u,g])=>(0,o.jsxs)("label",{className:`${n}-label`,children:[g,(0,o.jsxs)("select",{className:`${n}-select`,value:lc[u],disabled:wa,onChange:T=>Wg(R=>({...R,[u]:T.target.value})),children:[(0,o.jsx)("option",{value:"auto",children:"Auto"}),(0,o.jsx)("option",{value:"include",children:"Include"}),(0,o.jsx)("option",{value:"exclude",children:"Exclude"})]})]},u))})]}),(0,o.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Testing prompt controls"}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-prompt`,children:[(0,o.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,o.jsx)("textarea",{id:`${n}-setup-map-prompt`,className:`${n}-textarea`,value:ao,maxLength:1500,disabled:wa,onChange:u=>Ou(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-negative`,children:[(0,o.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,o.jsx)("textarea",{id:`${n}-setup-map-negative`,className:`${n}-textarea`,value:no,maxLength:1500,disabled:wa,onChange:u=>Iu(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:wa||ao===i?.settings.townMapLayoutPrompt&&no===i?.settings.townMapNegativePrompt,onClick:()=>{Ou(i?.settings.townMapLayoutPrompt??""),Iu(i?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:wa||ya.trim().length===0,onClick:()=>{c$()},children:wa?"Generating map\u2026":cc==="generate"?"Generate again":"Generate map"})})]}):null,ct==="upload"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:wa,"aria-label":"Choose a village map image",onChange:u=>{let g=u.target.files?.[0];u.target.value="",d$(g)}}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,ct==="none"?(0,o.jsx)("p",{className:`${n}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image in Village Settings \u2192 Village Map later."}):null,Vs&&ct!=="none"&&cc===ct&&cf?(0,o.jsx)("p",{className:`${n}-hint`,"data-tone":$g(Vs).tone,children:$g(Vs).text}):null]}):null,Xe===3&&i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"Existing Venues keep their locations. Use Village Settings \u2192 Village Map to reposition them with a replacement map, and View Venue to edit their details."}):null,Xe===3&&!i?.isFounded?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Place your village"}),(0,o.jsxs)("label",{className:n+"-label",children:["Villager homes",(0,o.jsx)("select",{"aria-label":"Number of villager homes",value:Cn,onChange:u=>{let g=Number(u.target.value);Xg(g);let T=Oe.filter(R=>R.classes?.includes("residence")).length;Ni(T<1+g),Jr(T>=1+g&&!Oe.some(R=>R.category==="public-center"))},children:[1,2,3].map(u=>(0,o.jsx)("option",{value:u,children:u},u))})]}),(0,o.jsxs)("label",{children:["Home image default",(0,o.jsxs)("select",{"aria-label":"Home image default",value:En?"personalized":"generic",onChange:u=>rc(u.target.value==="personalized"),children:[(0,o.jsx)("option",{value:"personalized",children:"Personalized homes"}),(0,o.jsx)("option",{value:"generic",children:"Generic homes"})]})]}),(0,o.jsx)("p",{role:"status",children:Rs?"Select a new spot for this venue.":ks?Oe.some(u=>u.occupancy.playerHome)?"Select a spot for the next villager home.":"Select a spot for your home.":Fr?"Select a spot for the Gathering Venue.":"Your venues are placed. Review the village when ready."}),Oe.filter(u=>u.classes?.includes("residence")).length>1+Cn?(0,o.jsx)("p",{role:"alert",children:"Completed homes are kept when you lower the count. You can review these homes or remove one explicitly."}):null,(0,o.jsx)("div",{className:n+"-setup-venue-list",children:Oe.map(u=>(0,o.jsxs)("button",{type:"button",className:n+"-setup-venue-card",onClick:()=>{ti.current=structuredClone(u),pn(u.id),ei(!0),Ae("")},children:[u.name," \xB7 ",cr.includes(u.id)?"Done":"Edit"]},u.id))}),Kg?(0,o.jsx)("p",{role:"alert",className:n+"-error",children:Kg}):null,Zg&&_t?(0,o.jsx)(nb,{venue:_t,tag:n,people:l,assignedIds:Oe.filter(u=>u.id!==_t.id).map(u=>u.occupancy.residentCharacterId??""),busy:zs,problem:Uu,onPatch:u=>{Tf(u.id,()=>u),Ae("")},onDone:k$,onCancel:C$,onMove:()=>{ti.current??(ti.current=structuredClone(_t)),Ms(_t.id),ei(!1),Ni(!1),Jr(!1)},onRemove:()=>{let u=Oe.filter(g=>g.id!==_t.id);v$(_t.id),Au(g=>g.filter(T=>T!==_t.id)),eh(u)},onGenerate:u=>{S$(_t,u)},onUpload:(u,g)=>{N$(_t,u,g)}},_t.id):null,c===null?(0,o.jsx)("p",{children:"Reading your villager library\u2026"}):null]}):null,Xe===4?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Village Beginning"}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:kn.trim()})," \xB7 ",ya.trim()]}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Persona:"})," ",H?.find(u=>u.id===E)?.name??"Selected Persona"," \xB7 ",(0,o.jsx)("strong",{children:"Scenario:"})," ",Xr(Kn).label]}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Day 1:"})," ",Fa||"No first-day description was recorded."]}),As?(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Original founding direction:"})," ",As]}):null]}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Map and lore"}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Map:"})," ",ct==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,o.jsx)("strong",{children:"Lorebooks:"})," ",ea.map(u=>ku?.find(g=>g.id===u)?.name??u).join(", ")||"None"]})]}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Starting places"}),(0,o.jsx)("div",{className:`${n}-setup-venue-list`,children:Oe.map(u=>(0,o.jsxs)("div",{className:`${n}-setup-venue-card`,children:[u.presentation.image?(0,o.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,o.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,o.jsxs)("span",{children:[(0,o.jsxs)("strong",{children:[u.name," \xB7 ",u.category==="public-center"?"Gathering Place":"Residence"]}),(0,o.jsxs)("small",{children:[u.form," \xB7"," ",u.occupancy.playerHome?"You":bn(u.occupancy.residentCharacterId)||"Community"]})]})]},u.id))}),Oe.map(u=>(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsxs)("strong",{children:[u.name,":"]})," ",u.description," ",u.spaces?.[0]?.description]},`${u.id}-summary`))]})]}):null,Uu?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Uu}):null,xa?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:xa}):null]})}),(0,o.jsxs)("div",{className:`${n}-setup-visual`,children:[Xe<=1?(0,o.jsx)(x2,{scenario:Kn}):(0,o.jsx)("div",{className:`${n}-setup-map-shell`,children:(0,o.jsx)("div",{className:`${n}-setup-map-viewport`,tabIndex:0,"aria-label":"Venue placement map. Arrow keys choose a spot; Enter places a venue.",onKeyDown:u=>{u.target!==u.currentTarget||Xe!==3||Zg||!(ks||Fr||Rs)||(u.key==="Enter"?(u.preventDefault(),Cf(Eu.x,Eu.y)):["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(u.key)&&(u.preventDefault(),kx(g=>({x:Math.max(.02,Math.min(.98,g.x+(u.key==="ArrowLeft"?-.025:u.key==="ArrowRight"?.025:0))),y:Math.max(.02,Math.min(.98,g.y+(u.key==="ArrowUp"?-.025:u.key==="ArrowDown"?.025:0)))}))))},children:(0,o.jsx)(Ng,{src:ur,alt:`A map of ${kn.trim()||"your new village"}.`,pins:Xe<3?[]:D$,placing:Xe===3&&!i?.isFounded&&(ks||Fr||Rs!==null),view:ct==="existing"?so:Fl("cover"),shape:cf,onPlace:Xe===3&&!i?.isFounded?Cf:void 0,compact:Xe<2,mobile:t&&Xe>=2,photoPins:Xe>=3,placementCursor:Xe===3?Eu:void 0})})}),(0,o.jsxs)("nav",{className:`${n}-setup-footer`,"aria-label":"Founding navigation",children:[Xe>0?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae||wa||zs,onClick:()=>Ef(Xe-1),children:"\u2190 Back"}):null,Xe<fu.length-1?(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:ae||wa||zs,onClick:()=>Ef(Xe+1),children:Xe===3?"Review village":"Next \u2192"}):(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:ae||wa||!i,onClick:()=>{T$()},children:i?.isFounded?"Save this village":"Found the village"}),i?.isFounded?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{Ni(!1),j("home")},children:"Show me the village"}):null]})]})]})})}return(0,o.jsxs)("div",{className:`${n}-root ${n}-home ${n}-home-full`,"data-mobile":t?"true":"false",children:[(0,o.jsxs)("div",{className:`${n}-home-bar`,children:[(0,o.jsx)(d2,{weather:i?.village.weather??""}),!t&&i?.isFounded&&xs(i.settings.venues).length>0?(0,o.jsxs)("div",{className:`${n}-places-picker`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-expanded":oe,"aria-controls":`${n}-places-list`,disabled:ae,onClick:()=>{Ne(null),Ze(l=>!l)},children:"Places"}),oe?(0,o.jsx)("div",{id:`${n}-places-list`,className:`${n}-places-list`,children:i.settings.venues.map(l=>(0,o.jsxs)("div",{className:`${n}-places-list-row`,children:[(0,o.jsx)("span",{className:`${n}-places-list-name`,children:l.name}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ku(l),children:"View venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{xc(l)},children:"Visit"})]},l.id))}):null]}):null,(0,o.jsxs)("span",{className:`${n}-home-bar-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-mobile-board-button`,"aria-label":`Noticeboard (${i?.noticeboard.length??0})`,disabled:!i||ae,onClick:()=>jt("noticeboard"),children:(0,o.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),i?.isFounded?(0,o.jsx)(m2,{happenings:i.happenings,recap:i.recap,mobile:t}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:ae||!i,onClick:()=>{gt("index"),j("menu")},children:"\u2630"}),t?null:(0,o.jsx)(h2,{}),te?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Be("")},children:"Cancel placement"}):null]})]}),(0,o.jsx)("div",{className:`${n}-room`,children:(0,o.jsx)("div",{className:`${n}-home-map-viewport`,children:(0,o.jsx)(Ng,{src:io||null,alt:`A map of ${i?.village.name??"the village"}.`,pins:I$,placing:!!te,view:so,shape:lf,onPlace:(l,u)=>{if(!te)return;let g=te;ce(!0),bt(""),L(`/projects/${encodeURIComponent(g)}/place`,{method:"POST",body:JSON.stringify({x:l,y:u})}).then(T=>{r(T),Be(""),ye(g),jt("projects")}).catch(T=>bt(F(T,"The blueprint could not be placed here."))).finally(()=>ce(!1))},onDismiss:()=>{Ne(null),Ze(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Ci||xa||Gu||ju?(0,o.jsxs)("div",{className:`${n}-notice`,children:[Ci?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Ci}):null,xa?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:xa}):null,Gu?(0,o.jsxs)("span",{className:`${n}-status`,children:["Catching up on what ",i?.village.name??"the village"," has been doing\u2026"]}):null,ju?(0,o.jsx)("p",{className:`${n}-status`,children:ju}):null]}):null})})})]})}var Rg=class extends HTMLElement{connectedCallback(){Ag(),this.__root??(this.__root=(0,cx.createRoot)(this)),this.__root.render((0,o.jsx)(Eg,{element:this,children:(0,o.jsx)(U2,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),Ag()})}};function U2({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let i=()=>t(r=>r+1);return e.addEventListener("marinara-capability-props",i),()=>e.removeEventListener("marinara-capability-props",i)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,o.jsx)(j2,{props:e.capabilityProps??{}}):a==="toolbar"?(0,o.jsx)(B2,{props:e.capabilityProps??{}}):(0,o.jsx)(H2,{element:e})}function q2(){return(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,o.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,o.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,o.jsx)("path",{d:"M9.5 16.5h5"})]})}var L2="marinara-active-chat-id";function fx(){try{window.localStorage.removeItem(L2)}catch{}window.location.reload()}function bx(e,t){let[a,i]=(0,m.useState)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(s(!1),i(null),!t)return;let c=new AbortController;return(async()=>{try{let d=await L(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;i(d??null),s(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:r}}function B2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",i=e.mobileCompact===!0,r=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:s,known:c}=bx(t,a&&t.length>0),[d,h]=(0,m.useState)(!1),p=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!d)return;let y=M=>{p.current?.contains(M.target)||h(!1)},V=M=>{M.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",y),document.addEventListener("keydown",V),()=>{document.removeEventListener("pointerdown",y),document.removeEventListener("keydown",V)}},[d]),!a||!c||s===null)return null;let b=s.name||"your villager",$=s.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${$}`;return(0,o.jsxs)("span",{className:`${n}-tracker`,"data-compact":i,"data-open":d,ref:p,children:[(0,o.jsxs)("button",{type:"button",className:r?`${r} ${n}-tracker-chip`:`${n}-button ${n}-tracker-chip`,onClick:()=>h(y=>!y),"aria-haspopup":"menu","aria-expanded":d,title:f,"aria-label":f,children:[(0,o.jsx)(q2,{}),(0,o.jsx)("span",{className:`${n}-tracker-label`,children:"Villages"})]}),d?(0,o.jsxs)("div",{className:`${n}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${$}`,children:[(0,o.jsxs)("p",{className:`${n}-tracker-menu-title`,children:["This roleplay spun off from ",$]}),s.resident?(0,o.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[b," still lives there. ",$," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,o.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[b," does not live in ",$," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,o.jsx)("div",{className:`${n}-tracker-menu-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:fx,title:`Leaves this chat and opens Marinara's home screen, where the ${$} tab is waiting.`,children:"Open the village"})})]}):null]})}function j2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:i,known:r}=bx(t,a&&t.length>0);if(!a||!r)return null;if(i===null)return(0,o.jsx)("div",{className:`${n}-panel-view`,children:(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let s=i.name||"this villager",c=i.villageName||"your village";return(0,o.jsxs)("div",{className:`${n}-panel-view`,children:[(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:i.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${s} does not live there any more. Nothing said here is read by the village either way.`}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Villager"}),(0,o.jsx)("span",{children:s})]}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Chat"}),(0,o.jsx)("span",{children:i.room})]}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Came from"}),(0,o.jsx)("span",{children:c})]}),(0,o.jsx)("div",{className:`${n}-panel-view-actions`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:fx,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(n)||customElements.define(n,Rg);
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
