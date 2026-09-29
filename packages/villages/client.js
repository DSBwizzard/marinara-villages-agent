var tx=Object.create;var zu=Object.defineProperty;var ax=Object.getOwnPropertyDescriptor;var nx=Object.getOwnPropertyNames;var ix=Object.getPrototypeOf,rx=Object.prototype.hasOwnProperty;var ox=(e,t,a)=>t in e?zu(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var mn=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var sx=(e,t,a,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of nx(t))!rx.call(e,r)&&r!==a&&zu(e,r,{get:()=>t[r],enumerable:!(i=ax(t,r))||i.enumerable});return e};var Ji=(e,t,a)=>(a=e!=null?tx(ix(e)):{},sx(t||!e||!e.__esModule?zu(a,"default",{value:e,enumerable:!0}):a,e));var nf=(e,t,a)=>ox(e,typeof t!="symbol"?t+"":t,a);var bf=mn(me=>{"use strict";var Ou=Symbol.for("react.transitional.element"),lx=Symbol.for("react.portal"),cx=Symbol.for("react.fragment"),dx=Symbol.for("react.strict_mode"),ux=Symbol.for("react.profiler"),hx=Symbol.for("react.consumer"),mx=Symbol.for("react.context"),px=Symbol.for("react.forward_ref"),gx=Symbol.for("react.suspense"),fx=Symbol.for("react.memo"),cf=Symbol.for("react.lazy"),bx=Symbol.for("react.activity"),vx=Symbol.for("react.view_transition"),rf=Symbol.iterator;function yx(e){return e===null||typeof e!="object"?null:(e=rf&&e[rf]||e["@@iterator"],typeof e=="function"?e:null)}var df={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},uf=Object.assign,hf={};function Zr(e,t,a){this.props=e,this.context=t,this.refs=hf,this.updater=a||df}Zr.prototype.isReactComponent={};Zr.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Zr.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function mf(){}mf.prototype=Zr.prototype;function Vu(e,t,a){this.props=e,this.context=t,this.refs=hf,this.updater=a||df}var Du=Vu.prototype=new mf;Du.constructor=Vu;uf(Du,Zr.prototype);Du.isPureReactComponent=!0;var of=Array.isArray;function Mu(){}var nt={H:null,A:null,T:null,S:null},pf=Object.prototype.hasOwnProperty;function Iu(e,t,a){var i=a.ref;return{$$typeof:Ou,type:e,key:t,ref:i!==void 0?i:null,props:a}}function wx(e,t){return Iu(e.type,t,e.props)}function _u(e){return typeof e=="object"&&e!==null&&e.$$typeof===Ou}function $x(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var sf=/\/+/g;function Ru(e,t){return typeof e=="object"&&e!==null&&e.key!=null?$x(""+e.key):t.toString(36)}function xx(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Mu,Mu):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Qr(e,t,a,i,r){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case Ou:case lx:c=!0;break;case cf:return c=e._init,Qr(c(e._payload),t,a,i,r)}}if(c)return r=r(e),c=i===""?"."+Ru(e,0):i,of(r)?(a="",c!=null&&(a=c.replace(sf,"$&/")+"/"),Qr(r,t,a,"",function(f){return f})):r!=null&&(_u(r)&&(r=wx(r,a+(r.key==null||e&&e.key===r.key?"":(""+r.key).replace(sf,"$&/")+"/")+c)),t.push(r)),1;c=0;var d=i===""?".":i+":";if(of(e))for(var h=0;h<e.length;h++)i=e[h],s=d+Ru(i,h),c+=Qr(i,t,a,s,r);else if(h=yx(e),typeof h=="function")for(e=h.call(e),h=0;!(i=e.next()).done;)i=i.value,s=d+Ru(i,h++),c+=Qr(i,t,a,s,r);else if(s==="object"){if(typeof e.then=="function")return Qr(xx(e),t,a,i,r);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function Kl(e,t,a){if(e==null)return e;var i=[],r=0;return Qr(e,i,"","",function(s){return t.call(a,s,r++)}),i}function Nx(e){if(e._status===-1){var t=e._result,a=t();a.then(function(i){(e._status===0||e._status===-1)&&(e._status=1,e._result=i,a.status===void 0&&(a.status="fulfilled",a.value=i))},function(i){(e._status===0||e._status===-1)&&(e._status=2,e._result=i,a.status===void 0&&(a.status="rejected",a.reason=i))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var lf=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function gf(e){var t=nt.T,a={};a.types=t!==null?t.types:null,nt.T=a;try{var i=e(),r=nt.S;r!==null&&r(a,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(Mu,lf)}catch(s){lf(s)}finally{t!==null&&a.types!==null&&(t.types=a.types),nt.T=t}}function ff(e){var t=nt.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else gf(ff.bind(null,e))}var Sx={map:Kl,forEach:function(e,t,a){Kl(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Kl(e,function(){t++}),t},toArray:function(e){return Kl(e,function(t){return t})||[]},only:function(e){if(!_u(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};me.Activity=bx;me.Children=Sx;me.Component=Zr;me.Fragment=cx;me.Profiler=ux;me.PureComponent=Vu;me.StrictMode=dx;me.Suspense=gx;me.ViewTransition=vx;me.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=nt;me.__COMPILER_RUNTIME={__proto__:null,c:function(e){return nt.H.useMemoCache(e)}};me.addTransitionType=ff;me.cache=function(e){return function(){return e.apply(null,arguments)}};me.cacheSignal=function(){return null};me.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=uf({},e.props),r=e.key;if(t!=null)for(s in t.key!==void 0&&(r=""+t.key),t)!pf.call(t,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&t.ref===void 0||(i[s]=t[s]);var s=arguments.length-2;if(s===1)i.children=a;else if(1<s){for(var c=Array(s),d=0;d<s;d++)c[d]=arguments[d+2];i.children=c}return Iu(e.type,r,i)};me.createContext=function(e){return e={$$typeof:mx,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:hx,_context:e},e};me.createElement=function(e,t,a){var i,r={},s=null;if(t!=null)for(i in t.key!==void 0&&(s=""+t.key),t)pf.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(r[i]=t[i]);var c=arguments.length-2;if(c===1)r.children=a;else if(1<c){for(var d=Array(c),h=0;h<c;h++)d[h]=arguments[h+2];r.children=d}if(e&&e.defaultProps)for(i in c=e.defaultProps,c)r[i]===void 0&&(r[i]=c[i]);return Iu(e,s,r)};me.createRef=function(){return{current:null}};me.forwardRef=function(e){return{$$typeof:px,render:e}};me.isValidElement=_u;me.lazy=function(e){return{$$typeof:cf,_payload:{_status:-1,_result:e},_init:Nx}};me.memo=function(e,t){return{$$typeof:fx,type:e,compare:t===void 0?null:t}};me.startTransition=gf;me.unstable_useCacheRefresh=function(){return nt.H.useCacheRefresh()};me.use=function(e){return nt.H.use(e)};me.useActionState=function(e,t,a){return nt.H.useActionState(e,t,a)};me.useCallback=function(e,t){return nt.H.useCallback(e,t)};me.useContext=function(e){return nt.H.useContext(e)};me.useDebugValue=function(){};me.useDeferredValue=function(e,t){return nt.H.useDeferredValue(e,t)};me.useEffect=function(e,t){return nt.H.useEffect(e,t)};me.useEffectEvent=function(e){return nt.H.useEffectEvent(e)};me.useId=function(){return nt.H.useId()};me.useImperativeHandle=function(e,t,a){return nt.H.useImperativeHandle(e,t,a)};me.useInsertionEffect=function(e,t){return nt.H.useInsertionEffect(e,t)};me.useLayoutEffect=function(e,t){return nt.H.useLayoutEffect(e,t)};me.useMemo=function(e,t){return nt.H.useMemo(e,t)};me.useOptimistic=function(e,t){return nt.H.useOptimistic(e,t)};me.useReducer=function(e,t,a){return nt.H.useReducer(e,t,a)};me.useRef=function(e){return nt.H.useRef(e)};me.useState=function(e){return nt.H.useState(e)};me.useSyncExternalStore=function(e,t,a){return nt.H.useSyncExternalStore(e,t,a)};me.useTransition=function(){return nt.H.useTransition()};me.version="19.3.0"});var ys=mn((QS,vf)=>{"use strict";vf.exports=bf()});var $f=mn(Jl=>{"use strict";var kx=Symbol.for("react.transitional.element"),Tx=Symbol.for("react.fragment");function wf(e,t,a){var i=null;if(a!==void 0&&(i=""+a),t.key!==void 0&&(i=""+t.key),"key"in t){a={};for(var r in t)r!=="key"&&(a[r]=t[r])}else a=t;return t=a.ref,{$$typeof:kx,type:e,key:i,ref:t!==void 0?t:null,props:a}}Jl.Fragment=Tx;Jl.jsx=wf;Jl.jsxs=wf});var ws=mn((JS,xf)=>{"use strict";xf.exports=$f()});var _f=mn(ut=>{"use strict";function Lu(e,t){var a=e.length;e.push(t);e:for(;0<a;){var i=a-1>>>1,r=e[i];if(0<Wl(r,t))e[i]=t,e[a]=r,a=i;else break e}}function pn(e){return e.length===0?null:e[0]}function tc(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var i=0,r=e.length,s=r>>>1;i<s;){var c=2*(i+1)-1,d=e[c],h=c+1,f=e[h];if(0>Wl(d,a))h<r&&0>Wl(f,d)?(e[i]=f,e[h]=a,i=h):(e[i]=d,e[c]=a,i=c);else if(h<r&&0>Wl(f,a))e[i]=f,e[h]=a,i=h;else break e}}return t}function Wl(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}ut.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(Ef=performance,ut.unstable_now=function(){return Ef.now()}):(qu=Date,Af=qu.now(),ut.unstable_now=function(){return qu.now()-Af});var Ef,qu,Af,Bn=[],di=[],zx=1,Ha=null,ta=3,Gu=!1,$s=!1,xs=!1,Yu=!1,Mf=typeof setTimeout=="function"?setTimeout:null,Of=typeof clearTimeout=="function"?clearTimeout:null,zf=typeof setImmediate<"u"?setImmediate:null;function ec(e){for(var t=pn(di);t!==null;){if(t.callback===null)tc(di);else if(t.startTime<=e)tc(di),t.sortIndex=t.expirationTime,Lu(Bn,t);else break;t=pn(di)}}function Xu(e){if(xs=!1,ec(e),!$s)if(pn(Bn)!==null)$s=!0,Jr||(Jr=!0,Kr());else{var t=pn(di);t!==null&&Pu(Xu,t.startTime-e)}}var Jr=!1,Ns=-1,Vf=5,Df=-1;function If(){return Yu?!0:!(ut.unstable_now()-Df<Vf)}function Bu(){if(Yu=!1,Jr){var e=ut.unstable_now();Df=e;var t=!0;try{e:{$s=!1,xs&&(xs=!1,Of(Ns),Ns=-1),Gu=!0;var a=ta;try{t:{for(ec(e),Ha=pn(Bn);Ha!==null&&!(Ha.expirationTime>e&&If());){var i=Ha.callback;if(typeof i=="function"){Ha.callback=null,ta=Ha.priorityLevel;var r=i(Ha.expirationTime<=e);if(e=ut.unstable_now(),typeof r=="function"){Ha.callback=r,ec(e),t=!0;break t}Ha===pn(Bn)&&tc(Bn),ec(e)}else tc(Bn);Ha=pn(Bn)}if(Ha!==null)t=!0;else{var s=pn(di);s!==null&&Pu(Xu,s.startTime-e),t=!1}}break e}finally{Ha=null,ta=a,Gu=!1}t=void 0}}finally{t?Kr():Jr=!1}}}var Kr;typeof zf=="function"?Kr=function(){zf(Bu)}:typeof MessageChannel<"u"?(ju=new MessageChannel,Rf=ju.port2,ju.port1.onmessage=Bu,Kr=function(){Rf.postMessage(null)}):Kr=function(){Mf(Bu,0)};var ju,Rf;function Pu(e,t){Ns=Mf(function(){e(ut.unstable_now())},t)}ut.unstable_IdlePriority=5;ut.unstable_ImmediatePriority=1;ut.unstable_LowPriority=4;ut.unstable_NormalPriority=3;ut.unstable_Profiling=null;ut.unstable_UserBlockingPriority=2;ut.unstable_cancelCallback=function(e){e.callback=null};ut.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Vf=0<e?Math.floor(1e3/e):5};ut.unstable_getCurrentPriorityLevel=function(){return ta};ut.unstable_next=function(e){switch(ta){case 1:case 2:case 3:var t=3;break;default:t=ta}var a=ta;ta=t;try{return e()}finally{ta=a}};ut.unstable_requestPaint=function(){Yu=!0};ut.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=ta;ta=e;try{return t()}finally{ta=a}};ut.unstable_scheduleCallback=function(e,t,a){var i=ut.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?i+a:i):a=i,e){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=a+r,e={id:zx++,callback:t,priorityLevel:e,startTime:a,expirationTime:r,sortIndex:-1},a>i?(e.sortIndex=a,Lu(di,e),pn(Bn)===null&&e===pn(di)&&(xs?(Of(Ns),Ns=-1):xs=!0,Pu(Xu,a-i))):(e.sortIndex=r,Lu(Bn,e),$s||Gu||($s=!0,Jr||(Jr=!0,Kr()))),e};ut.unstable_shouldYield=If;ut.unstable_wrapCallback=function(e){var t=ta;return function(){var a=ta;ta=t;try{return e.apply(this,arguments)}finally{ta=a}}}});var Uf=mn((tk,Hf)=>{"use strict";Hf.exports=_f()});var jf=mn(aa=>{"use strict";var Rx=ys();function Bf(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ui(){}var la={d:{f:ui,r:function(){throw Error(Bf(522))},D:ui,C:ui,L:ui,m:ui,X:ui,S:ui,M:ui},p:0,findDOMNode:null},Mx=Symbol.for("react.portal"),Ox=Symbol.for("react.recoverable"),qf=Symbol.for("react.optimistic_key");function Vx(e,t,a){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Mx,key:i==null?null:i===qf?qf:""+i,children:e,containerInfo:t,implementation:a}}var Ss=Rx.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function ac(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}aa.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=la;aa.browser=function(e){return{$$typeof:Ox,_reason:e}};aa.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Bf(299));return Vx(e,t,null,a)};aa.flushSync=function(e){var t=Ss.T,a=la.p;try{if(Ss.T=null,la.p=2,e)return e()}finally{Ss.T=t,la.p=a,la.d.f()}};aa.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,la.d.C(e,t))};aa.prefetchDNS=function(e){typeof e=="string"&&la.d.D(e)};aa.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,i=ac(a,t.crossOrigin),r=typeof t.integrity=="string"?t.integrity:void 0,s=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?la.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:r,fetchPriority:s}):a==="script"&&la.d.X(e,{crossOrigin:i,integrity:r,fetchPriority:s,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};aa.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=ac(t.as,t.crossOrigin);la.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&la.d.M(e)};aa.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,i=ac(a,t.crossOrigin);la.d.L(e,a,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};aa.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=ac(t.as,t.crossOrigin);la.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else la.d.m(e)};aa.requestFormReset=function(e){la.d.r(e)};aa.unstable_batchedUpdates=function(e,t){return e(t)};aa.useFormState=function(e,t,a){return Ss.H.useFormState(e,t,a)};aa.useFormStatus=function(){return Ss.H.useHostTransitionStatus()};aa.version="19.3.0"});var Yf=mn((nk,Gf)=>{"use strict";function Lf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Lf)}catch(e){console.error(e)}}Lf(),Gf.exports=jf()});var R0=mn(_d=>{"use strict";var Vt=Uf(),zv=ys(),Dx=Yf();function D(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Rv(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function ul(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function Mv(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Ov(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Xf(e){if(ul(e)!==e)throw Error(D(188))}function Ix(e){var t=e.alternate;if(!t){if(t=ul(e),t===null)throw Error(D(188));return t!==e?null:e}for(var a=e,i=t;;){var r=a.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){a=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===a)return Xf(r),e;if(s===i)return Xf(r),t;s=s.sibling}throw Error(D(188))}if(a.return!==i.return)a=r,i=s;else{for(var c=!1,d=r.child;d;){if(d===a){c=!0,a=r,i=s;break}if(d===i){c=!0,i=r,a=s;break}d=d.sibling}if(!c){for(d=s.child;d;){if(d===a){c=!0,a=s,i=r;break}if(d===i){c=!0,i=s,a=r;break}d=d.sibling}if(!c)throw Error(D(189))}}if(a.alternate!==i)throw Error(D(190))}if(a.tag!==3)throw Error(D(188));return a.stateNode.current===a?e:t}function Vv(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=Vv(e),t!==null)return t;e=e.sibling}return null}function ya(e,t,a,i,r,s){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,i,r,s)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&ya(e.child,t,a,i,r,s))return!0;e=e.sibling}return!1}function vr(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Pf(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function Dv(e){var t=[null,null],a=vr(e);return a===null||Iv(t,e,a.child,{foundSelf:!1}),t}function Iv(e,t,a,i){for(;a!==null;){if(a===t)i.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(i.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&Iv(e,t,a.child,i))return!0;a=a.sibling}return!1}function Ot(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(D(559))}}var io=null,kh=null;function _x(e,t,a){return e===a?!0:e===t?(io=e,!0):!1}function Hx(e,t,a){return e===a?(kh=e,!1):e===t?(kh!==null&&(io=e),!0):!1}function Qf(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function Th(e,t,a){for(var i=0,r=e;r;r=a(r))i++;r=0;for(var s=t;s;s=a(s))r++;for(;0<i-r;)e=a(e),i--;for(;0<r-i;)t=a(t),r--;for(;i--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var Fe=Object.assign,Ux=Symbol.for("react.element"),nc=Symbol.for("react.transitional.element"),Rs=Symbol.for("react.portal"),ro=Symbol.for("react.fragment"),_v=Symbol.for("react.strict_mode"),Ch=Symbol.for("react.profiler"),Hv=Symbol.for("react.consumer"),wn=Symbol.for("react.context"),Im=Symbol.for("react.forward_ref"),Eh=Symbol.for("react.suspense"),Ah=Symbol.for("react.suspense_list"),_m=Symbol.for("react.memo"),gi=Symbol.for("react.lazy"),zh=Symbol.for("react.activity"),qx=Symbol.for("react.legacy_hidden"),Bx=Symbol.for("react.memo_cache_sentinel"),Rh=Symbol.for("react.view_transition"),jx=Symbol.for("react.recoverable"),Zf=Symbol.iterator;function ks(e){return e===null||typeof e!="object"?null:(e=Zf&&e[Zf]||e["@@iterator"],typeof e=="function"?e:null)}var Lx=Symbol.for("react.client.reference");function Mh(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===Lx?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case ro:return"Fragment";case Ch:return"Profiler";case _v:return"StrictMode";case Eh:return"Suspense";case Ah:return"SuspenseList";case zh:return"Activity";case Rh:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case Rs:return"Portal";case wn:return e.displayName||"Context";case Hv:return(e._context.displayName||"Context")+".Consumer";case Im:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case _m:return t=e.displayName||null,t!==null?t:Mh(e.type)||"Memo";case gi:t=e._payload,e=e._init;try{return Mh(e(t))}catch{}}return null}var Ms=Array.isArray,re=zv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ie=Dx.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,rr={pending:!1,data:null,method:null,action:null},Oh=[],oo=-1;function Cn(e){return{current:e}}function Pt(e){0>oo||(e.current=Oh[oo],Oh[oo]=null,oo--)}function ot(e,t){oo++,Oh[oo]=e.current,e.current=t}var Sn=Cn(null),Zs=Cn(null),Si=Cn(null),Lc=Cn(null);function Gc(e,t){switch(ot(Si,t),ot(Zs,e),ot(Sn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?cv(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=cv(t),e=o0(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}Pt(Sn),ot(Sn,e)}function Co(){Pt(Sn),Pt(Zs),Pt(Si)}function Vh(e){var t=e.memoizedState;t!==null&&(_o._currentValue=t.memoizedState,ot(Lc,e)),t=Sn.current;var a=o0(t,e.type);t!==a&&(ot(Zs,e),ot(Sn,a))}function Yc(e){Zs.current===e&&(Pt(Sn),Pt(Zs)),Lc.current===e&&(Pt(Lc),_o._currentValue=rr)}var Qu,Kf;function mi(e){if(Qu===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Qu=t&&t[1]||"",Kf=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Qu+e+Kf}var Zu=!1;function Ku(e,t){if(!e||Zu)return"";Zu=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var N=function(){throw Error()};if(Object.defineProperty(N.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(N,[])}catch(R){var p=R}Reflect.construct(e,[],N)}else{try{N.call()}catch(R){p=R}N=!1;try{var b=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),N=!0,new e}finally{N&&(b!==void 0?Object.defineProperty(e.prototype,"props",b):delete e.prototype.props)}}}else{try{throw Error()}catch(R){p=R}(N=e())&&typeof N.catch=="function"&&N.catch(function(){})}}catch(R){if(R&&p&&typeof R.stack=="string")return[R.stack,p.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=i.DetermineComponentFrameRoot(),c=s[0],d=s[1];if(c&&d){var h=c.split(`
`),f=d.split(`
`);for(r=i=0;i<h.length&&!h[i].includes("DetermineComponentFrameRoot");)i++;for(;r<f.length&&!f[r].includes("DetermineComponentFrameRoot");)r++;if(i===h.length||r===f.length)for(i=h.length-1,r=f.length-1;1<=i&&0<=r&&h[i]!==f[r];)r--;for(;1<=i&&0<=r;i--,r--)if(h[i]!==f[r]){if(i!==1||r!==1)do if(i--,r--,0>r||h[i]!==f[r]){var w=`
`+h[i].replace(" at new "," at ");return e.displayName&&w.includes("<anonymous>")&&(w=w.replace("<anonymous>",e.displayName)),w}while(1<=i&&0<=r);break}}}finally{Zu=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?mi(a):""}function Gx(e,t){switch(e.tag){case 26:case 27:case 5:return mi(e.type);case 16:return mi("Lazy");case 13:return e.child!==t&&t!==null?mi("Suspense Fallback"):mi("Suspense");case 19:return mi("SuspenseList");case 0:case 15:return Ku(e.type,!1);case 11:return Ku(e.type.render,!1);case 1:return Ku(e.type,!0);case 31:return mi("Activity");case 30:return mi("ViewTransition");default:return""}}function Jf(e){try{var t="",a=null;do t+=Gx(e,a),a=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var Dh=Object.prototype.hasOwnProperty,Hm=Vt.unstable_scheduleCallback,Ju=Vt.unstable_cancelCallback,Yx=Vt.unstable_shouldYield,Xx=Vt.unstable_requestPaint,Ca=Vt.unstable_now,Px=Vt.unstable_getCurrentPriorityLevel,Uv=Vt.unstable_ImmediatePriority,qv=Vt.unstable_UserBlockingPriority,Xc=Vt.unstable_NormalPriority,Qx=Vt.unstable_LowPriority,Bv=Vt.unstable_IdlePriority,Zx=Vt.log,Kx=Vt.unstable_setDisableYieldValue,hl=null,Ea=null;function vi(e){if(typeof Zx=="function"&&Kx(e),Ea&&typeof Ea.setStrictMode=="function")try{Ea.setStrictMode(hl,e)}catch{}}var Aa=Math.clz32?Math.clz32:Wx,Jx=Math.log,Fx=Math.LN2;function Wx(e){return e>>>=0,e===0?32:31-(Jx(e)/Fx|0)|0}var ic=256,rc=262144,oc=4194304;function er(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function vd(e,t,a){var i=e.pendingLanes;if(i===0)return 0;var r=0,s=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var d=i&134217727;return d!==0?(i=d&~s,i!==0?r=er(i):(c&=d,c!==0?r=er(c):a||(a=d&~e,a!==0&&(r=er(a))))):(d=i&~s,d!==0?r=er(d):c!==0?r=er(c):a||(a=i&~e,a!==0&&(r=er(a)))),r===0?0:t!==0&&t!==r&&(t&s)===0&&(s=r&-r,a=t&-t,s>=a||s===32&&(a&4194048)!==0)?t:r}function ml(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function jv(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var i=31-Aa(a),r=1<<i;t|=e[i],a&=~r}return t}function e5(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Lv(){var e=oc;return oc<<=1,(oc&62914560)===0&&(oc=4194304),e}function Fu(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function pl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function t5(e,t,a,i,r,s){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var d=e.entanglements,h=e.expirationTimes,f=e.hiddenUpdates;for(a=c&~a;0<a;){var w=31-Aa(a),N=1<<w;d[w]=0,h[w]=-1;var p=f[w];if(p!==null)for(f[w]=null,w=0;w<p.length;w++){var b=p[w];b!==null&&(b.lane&=-536870913)}a&=~N}i!==0&&Gv(e,i,0),s!==0&&r===0&&e.tag!==0&&(e.suspendedLanes|=s&~(c&~t))}function Gv(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-Aa(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|a&261930}function Yv(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var i=31-Aa(a),r=1<<i;r&t|e[i]&t&&(e[i]|=t),a&=~r}}function Xv(e,t){var a=t&-t;return a=(a&42)!==0?1:Um(a),(a&(e.suspendedLanes|t))!==0?0:a}function Um(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function qm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Pv(){var e=Ie.p;return e!==0?e:(e=window.event,e===void 0?32:E0(e.type))}function Ff(e,t){var a=Ie.p;try{return Ie.p=e,t()}finally{Ie.p=a}}var ei=Math.random().toString(36).slice(2),Yt="__reactFiber$"+ei,wa="__reactProps$"+ei,qo="__reactContainer$"+ei,Wf="__reactEvents$"+ei,a5="__reactListeners$"+ei,n5="__reactHandles$"+ei,eb="__reactResources$"+ei,gl="__reactMarker$"+ei,Pc="__reactLoad$"+ei;function yd(e){delete e[Yt],delete e[wa],delete e[a5],delete e[n5]}function nr(e){var t;if(t=e[Yt])return t;for(var a=e.parentNode;a;){if(t=a[qo]||a[Yt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=bv(e);e!==null;){if(a=e[Yt])return a;e=bv(e)}return t}e=a,a=e.parentNode}return null}function Bo(e){if(e=e[Yt]||e[qo]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Os(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(D(33))}function bo(e){var t=e[eb];return t||(t=e[eb]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function Bt(e){e[gl]=!0}function Qv(e){e[Pc]=void 0}var Zv=new Set,Kv={};function yr(e,t){Eo(e,t),Eo(e+"Capture",t)}function Eo(e,t){for(Kv[e]=t,e=0;e<t.length;e++)Zv.add(t[e])}var i5=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),tb={},ab={};function r5(e){return Dh.call(ab,e)?!0:Dh.call(tb,e)?!1:i5.test(e)?ab[e]=!0:(tb[e]=!0,!1)}var Oe=!1;function nb(){var e=Oe;return Oe=!1,e}function Sc(e,t,a){if(r5(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function sc(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function jn(e,t,a,i){if(i===null)e.removeAttribute(a);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,i)}}function Na(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Jv(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function o5(e,t,a){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var r=i.get,s=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return r.call(this)},set:function(c){a=""+c,s.call(this,c)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Ih(e){if(!e._valueTracker){var t=Jv(e)?"checked":"value";e._valueTracker=o5(e,t,""+e[t])}}function Fv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),i="";return e&&(i=Jv(e)?e.checked?"true":"false":e.value),e=i,e!==a?(t.setValue(e),!0):!1}var s5=/[\n"\\]/g;function La(e){return e.replace(s5,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function _h(e,t,a,i,r,s,c,d){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Na(t)):e.value!==""+Na(t)&&(e.value=""+Na(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?Wu(e,Na(e.value)):Wu(e,Na(t)):a!=null?Wu(e,Na(a)):i!=null&&e.removeAttribute("value"),r==null&&s!=null&&(e.defaultChecked=!!s),r!=null&&(e.checked=r&&typeof r!="function"&&typeof r!="symbol"),d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"?e.name=""+Na(d):e.removeAttribute("name")}function Wv(e,t,a,i,r,s,c,d){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.type=s),t!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||t!=null)){Ih(e);return}a=a!=null?""+Na(a):"",t=t!=null?""+Na(t):a,d||t===e.value||(e.value=t),e.defaultValue=t}i=i??r,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=d?e.checked:!!i,e.defaultChecked=!!i,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),Ih(e)}function Wu(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function vo(e,t,a,i){if(e=e.options,t){t={};for(var r=0;r<a.length;r++)t["$"+a[r]]=!0;for(a=0;a<e.length;a++)r=t.hasOwnProperty("$"+e[a].value),e[a].selected!==r&&(e[a].selected=r),r&&i&&(e[a].defaultSelected=!0)}else{for(a=""+Na(a),t=null,r=0;r<e.length;r++){if(e[r].value===a){e[r].selected=!0,i&&(e[r].defaultSelected=!0);return}t!==null||e[r].disabled||(t=e[r])}t!==null&&(t.selected=!0)}}function ey(e,t,a){if(t!=null&&(t=""+Na(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+Na(a):""}function ty(e,t,a,i){if(t==null){if(i!=null){if(a!=null)throw Error(D(92));if(Ms(i)){if(1<i.length)throw Error(D(93));i=i[0]}a=i}a==null&&(a=""),t=a}a=Na(t),e.defaultValue=a,i=e.textContent,i===a&&i!==""&&i!==null&&(e.value=i),Ih(e)}function Ao(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var l5=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function ib(e,t,a){var i=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,a):typeof a!="number"||a===0||l5.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function ay(e,t,a){if(t!=null&&typeof t!="object")throw Error(D(62));if(e=e.style,a!=null){for(var i in a)!a.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="",Oe=!0);for(var r in t)i=t[r],t.hasOwnProperty(r)&&a[r]!==i&&(ib(e,r,i),Oe=!0)}else for(var s in t)t.hasOwnProperty(s)&&ib(e,s,t[s])}function Bm(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var c5=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),d5=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function kc(e){return d5.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function $n(){}var Hh=null;function jm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var so=null,yo=null;function rb(e){var t=Bo(e);if(t&&(e=t.stateNode)){var a=e[wa]||null;e:switch(e=t.stateNode,t.type){case"input":if(_h(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+La(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var i=a[t];if(i!==e&&i.form===e.form){var r=i[wa]||null;if(!r)throw Error(D(90));_h(i,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(t=0;t<a.length;t++)i=a[t],i.form===e.form&&Fv(i)}break e;case"textarea":ey(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&vo(e,!!a.multiple,t,!1)}}}var eh=!1;function ny(e,t,a){if(eh)return e(t,a);eh=!0;try{var i=e(t);return i}finally{if(eh=!1,(so!==null||yo!==null)&&(Od(),so&&(t=so,e=yo,yo=so=null,rb(t),e)))for(t=0;t<e.length;t++)rb(e[t])}}function Ks(e,t){var a=e.stateNode;if(a===null)return null;var i=a[wa]||null;if(i===null)return null;a=i[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(D(231,t,typeof a));return a}var Qn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Uh=!1;if(Qn)try{Fr={},Object.defineProperty(Fr,"passive",{get:function(){Uh=!0}}),window.addEventListener("test",Fr,Fr),window.removeEventListener("test",Fr,Fr)}catch{Uh=!1}var Fr,yi=null,Lm=null,Tc=null;function iy(){if(Tc)return Tc;var e,t=Lm,a=t.length,i,r="value"in yi?yi.value:yi.textContent,s=r.length;for(e=0;e<a&&t[e]===r[e];e++);var c=a-e;for(i=1;i<=c&&t[a-i]===r[s-i];i++);return Tc=r.slice(e,1<i?1-i:void 0)}function Cc(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function lc(){return!0}function ob(){return!1}function ha(e){function t(a,i,r,s,c){this._reactName=a,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=c,this.currentTarget=null;for(var d in e)e.hasOwnProperty(d)&&(a=e[d],this[d]=a?a(s):s[d]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?lc:ob,this.isPropagationStopped=ob,this}return Fe(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=lc)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=lc)},persist:function(){},isPersistent:lc}),t}var Ui={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},wd=ha(Ui),fl=Fe({},Ui,{view:0,detail:0}),u5=ha(fl),th,ah,Ts,$d=Fe({},fl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Gm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Ts&&(Ts&&e.type==="mousemove"?(th=e.screenX-Ts.screenX,ah=e.screenY-Ts.screenY):ah=th=0,Ts=e),th)},movementY:function(e){return"movementY"in e?e.movementY:ah}}),sb=ha($d),h5=Fe({},$d,{dataTransfer:0}),m5=ha(h5),p5=Fe({},fl,{relatedTarget:0}),nh=ha(p5),g5=Fe({},Ui,{animationName:0,elapsedTime:0,pseudoElement:0}),f5=ha(g5),b5=Fe({},Ui,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),v5=ha(b5),y5=Fe({},Ui,{data:0}),lb=ha(y5),w5={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},$5={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},x5={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function N5(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=x5[e])?!!t[e]:!1}function Gm(){return N5}var S5=Fe({},fl,{key:function(e){if(e.key){var t=w5[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Cc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?$5[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Gm,charCode:function(e){return e.type==="keypress"?Cc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Cc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),k5=ha(S5),T5=Fe({},$d,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),cb=ha(T5),C5=Fe({},Ui,{submitter:0}),E5=ha(C5),A5=Fe({},fl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Gm}),z5=ha(A5),R5=Fe({},Ui,{propertyName:0,elapsedTime:0,pseudoElement:0}),M5=ha(R5),O5=Fe({},$d,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),V5=ha(O5),D5=Fe({},Ui,{newState:0,oldState:0,source:0}),I5=ha(D5),_5=[9,13,27,32],Ym=Qn&&"CompositionEvent"in window,Is=null;Qn&&"documentMode"in document&&(Is=document.documentMode);var H5=Qn&&"TextEvent"in window&&!Is,ry=Qn&&(!Ym||Is&&8<Is&&11>=Is),db=" ",ub=!1;function oy(e,t){switch(e){case"keyup":return _5.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function sy(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var lo=!1;function U5(e,t){switch(e){case"compositionend":return sy(t);case"keypress":return t.which!==32?null:(ub=!0,db);case"textInput":return e=t.data,e===db&&ub?null:e;default:return null}}function q5(e,t){if(lo)return e==="compositionend"||!Ym&&oy(e,t)?(e=iy(),Tc=Lm=yi=null,lo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return ry&&t.locale!=="ko"?null:t.data;default:return null}}var B5={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function hb(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!B5[e.type]:t==="textarea"}function ly(e,t,a,i){so?yo?yo.push(i):yo=[i]:so=i,t=gd(t,"onChange"),0<t.length&&(a=new wd("onChange","change",null,a,i),e.push({event:a,listeners:t}))}var _s=null,Js=null;function j5(e){n0(e,0)}function xd(e){var t=Os(e);if(Fv(t))return e}function mb(e,t){if(e==="change")return t}var cy=!1;Qn&&(Qn?(dc="oninput"in document,dc||(ih=document.createElement("div"),ih.setAttribute("oninput","return;"),dc=typeof ih.oninput=="function"),cc=dc):cc=!1,cy=cc&&(!document.documentMode||9<document.documentMode));var cc,dc,ih;function pb(){_s&&(_s.detachEvent("onpropertychange",dy),Js=_s=null)}function dy(e){if(e.propertyName==="value"&&xd(Js)){var t=[];ly(t,Js,e,jm(e)),ny(j5,t)}}function L5(e,t,a){e==="focusin"?(pb(),_s=t,Js=a,_s.attachEvent("onpropertychange",dy)):e==="focusout"&&pb()}function G5(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return xd(Js)}function Y5(e,t){if(e==="click")return xd(t)}function X5(e,t){if(e==="input"||e==="change")return xd(t)}function P5(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Ra=typeof Object.is=="function"?Object.is:P5;function Fs(e,t){if(Ra(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),i=Object.keys(t);if(a.length!==i.length)return!1;for(i=0;i<a.length;i++){var r=a[i];if(!Dh.call(t,r)||!Ra(e[r],t[r]))return!1}return!0}function qh(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function gb(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function fb(e,t){var a=gb(e);e=0;for(var i;a;){if(a.nodeType===3){if(i=e+a.textContent.length,e<=t&&i>=t)return{node:a,offset:t-e};e=i}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=gb(a)}}function uy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?uy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function hy(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=qh(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=qh(e.document)}return t}function Xm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Q5=Qn&&"documentMode"in document&&11>=document.documentMode,co=null,Bh=null,Hs=null,jh=!1;function bb(e,t,a){var i=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;jh||co==null||co!==qh(i)||(i=co,"selectionStart"in i&&Xm(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Hs&&Fs(Hs,i)||(Hs=i,i=gd(Bh,"onSelect"),0<i.length&&(t=new wd("onSelect","select",null,t,a),e.push({event:t,listeners:i}),t.target=co)))}function Fi(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var uo={animationend:Fi("Animation","AnimationEnd"),animationiteration:Fi("Animation","AnimationIteration"),animationstart:Fi("Animation","AnimationStart"),transitionrun:Fi("Transition","TransitionRun"),transitionstart:Fi("Transition","TransitionStart"),transitioncancel:Fi("Transition","TransitionCancel"),transitionend:Fi("Transition","TransitionEnd")},rh={},my={};Qn&&(my=document.createElement("div").style,"AnimationEvent"in window||(delete uo.animationend.animation,delete uo.animationiteration.animation,delete uo.animationstart.animation),"TransitionEvent"in window||delete uo.transitionend.transition);function wr(e){if(rh[e])return rh[e];if(!uo[e])return e;var t=uo[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in my)return rh[e]=t[a];return e}var py=wr("animationend"),gy=wr("animationiteration"),fy=wr("animationstart"),Z5=wr("transitionrun"),K5=wr("transitionstart"),J5=wr("transitioncancel"),by=wr("transitionend"),vy=new Map,Lh="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Lh.push("scrollEnd");function sn(e,t){vy.set(e,t),yr(t,[e])}var F5=0;function Zn(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=on.identifierPrefix;var a=F5++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function vb(e){if(e==null||typeof e=="string")return e;var t=null,a=To;if(a!==null)for(var i=0;i<a.length;i++){var r=e[a[i]];if(r!=null){if(r==="none")return"none";t=t==null?r:t+(" "+r)}}return t??e.default}function ti(e,t){return e=vb(e),t=vb(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Qc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},qa=[],ho=0,Pm=0;function Nd(){for(var e=ho,t=Pm=ho=0;t<e;){var a=qa[t];qa[t++]=null;var i=qa[t];qa[t++]=null;var r=qa[t];qa[t++]=null;var s=qa[t];if(qa[t++]=null,i!==null&&r!==null){var c=i.pending;c===null?r.next=r:(r.next=c.next,c.next=r),i.pending=r}s!==0&&yy(a,r,s)}}function Sd(e,t,a,i){qa[ho++]=e,qa[ho++]=t,qa[ho++]=a,qa[ho++]=i,Pm|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function Qm(e,t,a,i){return Sd(e,t,a,i),Zc(e)}function $r(e,t){return Sd(e,null,null,t),Zc(e)}function yy(e,t,a){e.lanes|=a;var i=e.alternate;i!==null&&(i.lanes|=a);for(var r=!1,s=e.return;s!==null;)s.childLanes|=a,i=s.alternate,i!==null&&(i.childLanes|=a),s.tag===22&&(e=s.stateNode,e===null||e._visibility&1||(r=!0)),e=s,s=s.return;return e.tag===3?(s=e.stateNode,r&&t!==null&&(r=31-Aa(a),e=s.hiddenUpdates,i=e[r],i===null?e[r]=[t]:i.push(t),t.lane=a|536870912),s):null}function Zc(e){if(50<Qs)throw Qs=0,_c=null,Error(D(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var mo={};function W5(e,t,a,i){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ba(e,t,a,i){return new W5(e,t,a,i)}function Zm(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Xn(e,t){var a=e.alternate;return a===null?(a=ba(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function wy(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Ec(e,t,a,i,r,s){var c=0;if(i=e,typeof i=="function")Zm(i)&&(c=1);else if(typeof i=="string")c=k2(e,a,Sn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(i){case zh:return e=ba(31,a,t,r),e.elementType=zh,e.lanes=s,e;case ro:return or(a.children,r,s,t);case _v:c=8,r|=24;break;case Ch:return e=ba(12,a,t,r|2),e.elementType=Ch,e.lanes=s,e;case Eh:return e=ba(13,a,t,r),e.elementType=Eh,e.lanes=s,e;case Ah:return e=ba(19,a,t,r),e.elementType=Ah,e.lanes=s,e;case qx:case Rh:return e=r|32,e=ba(30,a,t,e),e.elementType=Rh,e.lanes=s,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof i=="object"&&i!==null)switch(i.$$typeof){case wn:c=10;break e;case Hv:c=9;break e;case Im:c=11;break e;case _m:c=14;break e;case gi:c=16,i=null;break e}c=29,a=Error(D(130,e===null?"null":typeof e,"")),i=null}return t=ba(c,a,t,r),t.elementType=e,t.type=i,t.lanes=s,t}function or(e,t,a,i){return e=ba(7,e,i,t),e.lanes=a,e}function oh(e,t,a){return e=ba(6,e,null,t),e.lanes=a,e}function $y(e){var t=ba(18,null,null,0);return t.stateNode=e,t}function sh(e,t,a){return t=ba(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var yb=new WeakMap;function Ga(e,t){if(typeof e=="object"&&e!==null){var a=yb.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Jf(t)},yb.set(e,t),t)}return{value:e,source:t,stack:Jf(t)}}var po=[],go=0,Kc=null,Ws=0,Ba=[],ja=0,Vi=null,xn=1,Nn="";function Gn(e,t){po[go++]=Ws,po[go++]=Kc,Kc=e,Ws=t}function xy(e,t,a){Ba[ja++]=xn,Ba[ja++]=Nn,Ba[ja++]=Vi,Vi=e;var i=xn;e=Nn;var r=32-Aa(i)-1;i&=~(1<<r),a+=1;var s=32-Aa(t)+r;if(30<s){var c=r-r%5;s=(i&(1<<c)-1).toString(32),i>>=c,r-=c,xn=1<<32-Aa(t)+r|a<<r|i,Nn=s+e}else xn=1<<s|a<<r|i,Nn=e}function kd(e){e.return!==null&&(Gn(e,1),xy(e,1,0))}function Km(e){for(;e===Kc;)Kc=po[--go],po[go]=null,Ws=po[--go],po[go]=null;for(;e===Vi;)Vi=Ba[--ja],Ba[ja]=null,Nn=Ba[--ja],Ba[ja]=null,xn=Ba[--ja],Ba[ja]=null}function Ny(e,t){Ba[ja++]=xn,Ba[ja++]=Nn,Ba[ja++]=Vi,xn=t.id,Nn=t.overflow,Vi=e}var jt=null,rt=null,$e=!1,ki=null,Ya=!1,Gh=Error(D(519));function Di(e){var t=Error(D(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw el(Ga(t,e)),Gh}function wb(e){var t=e.stateNode,a=e.type,i=e.memoizedProps;switch(t[Yt]=e,t[wa]=i,a){case"dialog":Se("cancel",t),Se("close",t);break;case"iframe":case"object":case"embed":Se("load",t);break;case"video":case"audio":for(a=0;a<il.length;a++)Se(il[a],t);break;case"source":Se("error",t);break;case"img":case"image":case"link":Se("error",t),Se("load",t);break;case"details":Se("toggle",t);break;case"input":Se("invalid",t),Wv(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":Se("invalid",t);break;case"textarea":Se("invalid",t),ty(t,i.value,i.defaultValue,i.children)}a=i.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||i.suppressHydrationWarning===!0||r0(t.textContent,a)?(i.popover!=null&&(Se("beforetoggle",t),Se("toggle",t)),i.onScroll!=null&&Se("scroll",t),i.onScrollEnd!=null&&Se("scrollend",t),i.onClick!=null&&(t.onclick=$n),t=!0):t=!1,t||Di(e,!0)}function Jc(e){for(jt=e.return;jt;)switch(jt.tag){case 5:case 31:case 13:Ya=!1;return;case 27:case 3:Ya=!0;return;default:jt=jt.return}}function Wr(e){if(e!==jt)return!1;if(!$e)return Jc(e),$e=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Em(e.type,e.memoizedProps)),a=!a),a&&rt&&Di(e),Jc(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(D(317));rt=fv(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(D(317));rt=fv(e)}else t===27?(t=rt,qi(e.type)?(e=Mm,Mm=null,rt=e):rt=t):rt=jt?Xa(e.stateNode.nextSibling):null;return!0}function dr(){rt=jt=null,$e=!1}function lh(){var e=ki;return e!==null&&(ga===null?ga=e:ga.push.apply(ga,e),ki=null),e}function el(e){ki===null?ki=[e]:ki.push(e)}var Yh=Cn(null),xr=null,Yn=null;function wi(e,t,a){ot(Yh,t._currentValue),t._currentValue=a}function Pn(e){e._currentValue=Yh.current,Pt(Yh)}function Ac(e,t,a){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===a)break;e=e.return}}function Xh(e,t,a,i){var r=e.child;for(r!==null&&(r.return=e);r!==null;){var s=r.dependencies;if(s!==null){var c=r.child;s=s.firstContext;e:for(;s!==null;){var d=s;s=r;for(var h=0;h<t.length;h++)if(d.context===t[h]){s.lanes|=a,d=s.alternate,d!==null&&(d.lanes|=a),Ac(s.return,a,e),i||(c=null);break e}s=d.next}}else if(r.tag===18){if(c=r.return,c===null)throw Error(D(341));c.lanes|=a,s=c.alternate,s!==null&&(s.lanes|=a),Ac(c,a,e),c=null}else r.tag===13&&r.memoizedState!==null&&r.memoizedState.dehydrated===null?(r.lanes|=a,c=r.alternate,c!==null&&(c.lanes|=a),Ac(r.return,a,e),c=r.child,c=c!==null?c.sibling:null):c=r.child;if(c!==null)c.return=r;else for(c=r;c!==null;){if(c===e){c=null;break}if(r=c.sibling,r!==null){r.return=c.return,c=r;break}c=c.return}r=c}}function ur(e,t,a,i){e=null;for(var r=t,s=!1;r!==null;){if(!s){if((r.flags&524288)!==0)s=!0;else if((r.flags&262144)!==0)break}if(r.tag===10){var c=r.alternate;if(c===null)throw Error(D(387));if(c=c.memoizedProps,c!==null){var d=r.type;Ra(r.pendingProps.value,c.value)||(e!==null?e.push(d):e=[d])}}else if(r===Lc.current){if(c=r.alternate,c===null)throw Error(D(387));c.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(e!==null?e.push(_o):e=[_o])}r=r.return}return e!==null&&Xh(t,e,a,i),t.flags|=262144,e!==null}function Fc(e){for(e=e.firstContext;e!==null;){if(!Ra(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function hr(e){xr=e,Yn=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Xt(e){return Sy(xr,e)}function uc(e,t){return xr===null&&hr(e),Sy(e,t)}function Sy(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},Yn===null){if(e===null)throw Error(D(308));Yn=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Yn=Yn.next=t;return a}var eN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},tN=Vt.unstable_scheduleCallback,aN=Vt.unstable_NormalPriority,Ct={$$typeof:wn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Jm(){return{controller:new eN,data:new Map,refCount:0}}function bl(e){e.refCount--,e.refCount===0&&tN(aN,function(){e.controller.abort()})}function $b(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var i=t[e];a.indexOf(i)===-1&&a.push(i)}}}var Vs=null;function nN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var Us=null,Ph=0,mr=0,wo=null;function iN(e,t){if(Us===null){var a=Us=[];Ph=0,mr=kp(),wo={status:"pending",value:void 0,then:function(i){a.push(i)}}}return Ph++,t.then(xb,xb),t}function xb(){if(--Ph===0&&(Vs=null,Us!==null)){wo!==null&&(wo.status="fulfilled");var e=Us;Us=null,mr=0,wo=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function rN(e,t){var a=[],i={status:"pending",value:null,reason:null,then:function(r){a.push(r)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var r=0;r<a.length;r++)(0,a[r])(t)},function(r){for(i.status="rejected",i.reason=r,r=0;r<a.length;r++)(0,a[r])(void 0)}),i}var Nb=re.S;re.S=function(e,t){if(jw=Ca(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&iN(e,t),Vs!==null)for(var a=Vo;a!==null;)$b(a,Vs),a=a.next;if(a=e.types,a!==null){for(var i=Vo;i!==null;)$b(i,a),i=i.next;if(mr!==0){i=Vs,i===null&&(i=Vs=[]);for(var r=0;r<a.length;r++){var s=a[r];i.indexOf(s)===-1&&i.push(s)}}}Nb!==null&&Nb(e,t)};var sr=Cn(null);function Fm(){var e=sr.current;return e!==null?e:Je.pooledCache}function zc(e,t){t===null?ot(sr,sr.current):ot(sr,t.pool)}function ky(){var e=Fm();return e===null?null:{parent:Ct._currentValue,pool:e}}var jo=Error(D(460)),Wm=Error(D(474)),Td=Error(D(542)),Wc={then:function(){}};function Sb(e){return e=e.status,e==="fulfilled"||e==="rejected"}function Ty(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then($n,$n),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Tb(e),e===void 0&&!("reason"in t)?Error(D(600)):e;default:if(typeof t.status=="string")t.then($n,$n);else{if(e=Je,e!==null&&100<e.shellSuspendCounter)throw Error(D(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var r=t;r.status="fulfilled",r.value=i}},function(i){if(t.status==="pending"){var r=t;r.status="rejected",r.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Tb(e),e}throw lr=t,jo}}function tr(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(lr=a,jo):a}}var lr=null;function kb(){if(lr===null)throw Error(D(459));var e=lr;return lr=null,e}function Tb(e){if(e===jo||e===Td)throw Error(D(483))}var $o=null,tl=0;function hc(e){var t=tl;return tl+=1,$o===null&&($o=[]),Ty($o,e,t)}function hi(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function mc(e,t){throw t.$$typeof===Ux?Error(D(525)):(e=Object.prototype.toString.call(t),Error(D(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function Cy(e){function t($,y){if(e){var v=$.deletions;v===null?($.deletions=[y],$.flags|=16):v.push(y)}}function a($,y){if(!e)return null;for(;y!==null;)t($,y),y=y.sibling;return null}function i($){for(var y=new Map;$!==null;)$.key===null?y.set($.index,$):y.set($.key,$),$=$.sibling;return y}function r($,y){return $=Xn($,y),$.index=0,$.sibling=null,$}function s($,y,v){return $.index=v,e?(v=$.alternate,v!==null?(v=v.index,v<y?($.flags|=2,y):v):($.flags|=134217730,y)):($.flags|=1048576,y)}function c($){return e&&$.alternate===null&&($.flags|=134217730),$}function d($,y,v,E){return y===null||y.tag!==6?(y=oh(v,$.mode,E),y.return=$,y):(y=r(y,v),y.return=$,y)}function h($,y,v,E){var I=v.type;return I===ro?($=w($,y,v.props.children,E,v.key),hi($,v),$):y!==null&&(y.elementType===I||typeof I=="object"&&I!==null&&I.$$typeof===gi&&tr(I)===y.type)?(y=r(y,v.props),hi(y,v),y.return=$,y):(y=Ec(v.type,v.key,v.props,null,$.mode,E),hi(y,v),y.return=$,y)}function f($,y,v,E){return y===null||y.tag!==4||y.stateNode.containerInfo!==v.containerInfo||y.stateNode.implementation!==v.implementation?(y=sh(v,$.mode,E),y.return=$,y):(y=r(y,v.children||[]),y.return=$,y)}function w($,y,v,E,I){return y===null||y.tag!==7?(y=or(v,$.mode,E,I),y.return=$,y):(y=r(y,v),y.return=$,y)}function N($,y,v){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return y=oh(""+y,$.mode,v),y.return=$,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case nc:return v=Ec(y.type,y.key,y.props,null,$.mode,v),hi(v,y),v.return=$,v;case Rs:return y=sh(y,$.mode,v),y.return=$,y;case gi:return y=tr(y),N($,y,v)}if(Ms(y)||ks(y))return y=or(y,$.mode,v,null),y.return=$,y;if(typeof y.then=="function")return N($,hc(y),v);if(y.$$typeof===wn)return N($,uc($,y),v);mc($,y)}return null}function p($,y,v,E){var I=y!==null?y.key:null;if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return I!==null?null:d($,y,""+v,E);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case nc:return v.key===I?h($,y,v,E):null;case Rs:return v.key===I?f($,y,v,E):null;case gi:return v=tr(v),p($,y,v,E)}if(Ms(v)||ks(v))return I!==null?null:w($,y,v,E,null);if(typeof v.then=="function")return p($,y,hc(v),E);if(v.$$typeof===wn)return p($,y,uc($,v),E);mc($,v)}return null}function b($,y,v,E,I){if(typeof E=="string"&&E!==""||typeof E=="number"||typeof E=="bigint")return $=$.get(v)||null,d(y,$,""+E,I);if(typeof E=="object"&&E!==null){switch(E.$$typeof){case nc:return $=$.get(E.key===null?v:E.key)||null,h(y,$,E,I);case Rs:return $=$.get(E.key===null?v:E.key)||null,f(y,$,E,I);case gi:return E=tr(E),b($,y,v,E,I)}if(Ms(E)||ks(E))return $=$.get(v)||null,w(y,$,E,I,null);if(typeof E.then=="function")return b($,y,v,hc(E),I);if(E.$$typeof===wn)return b($,y,v,uc(y,E),I);mc(y,E)}return null}function R($,y,v,E){for(var I=null,Y=null,j=y,X=y=0,ve=null;j!==null&&X<v.length;X++){j.index>X?(ve=j,j=null):ve=j.sibling;var F=p($,j,v[X],E);if(F===null){j===null&&(j=ve);break}e&&j&&F.alternate===null&&t($,j),y=s(F,y,X),Y===null?I=F:Y.sibling=F,Y=F,j=ve}if(X===v.length)return a($,j),$e&&Gn($,X),I;if(j===null){for(;X<v.length;X++)j=N($,v[X],E),j!==null&&(y=s(j,y,X),Y===null?I=j:Y.sibling=j,Y=j);return $e&&Gn($,X),I}for(j=i(j);X<v.length;X++)ve=b(j,$,X,v[X],E),ve!==null&&(e&&(F=ve.alternate,F!==null&&j.delete(F.key===null?X:F.key)),y=s(ve,y,X),Y===null?I=ve:Y.sibling=ve,Y=ve);return e&&j.forEach(function(We){return t($,We)}),$e&&Gn($,X),I}function O($,y,v,E){if(v==null)throw Error(D(151));for(var I=null,Y=null,j=y,X=y=0,ve=null,F=v.next();j!==null&&!F.done;X++,F=v.next()){j.index>X?(ve=j,j=null):ve=j.sibling;var We=p($,j,F.value,E);if(We===null){j===null&&(j=ve);break}e&&j&&We.alternate===null&&t($,j),y=s(We,y,X),Y===null?I=We:Y.sibling=We,Y=We,j=ve}if(F.done)return a($,j),$e&&Gn($,X),I;if(j===null){for(;!F.done;X++,F=v.next())F=N($,F.value,E),F!==null&&(y=s(F,y,X),Y===null?I=F:Y.sibling=F,Y=F);return $e&&Gn($,X),I}for(j=i(j);!F.done;X++,F=v.next())F=b(j,$,X,F.value,E),F!==null&&(e&&(ve=F.alternate,ve!==null&&j.delete(ve.key===null?X:ve.key)),y=s(F,y,X),Y===null?I=F:Y.sibling=F,Y=F);return e&&j.forEach(function(he){return t($,he)}),$e&&Gn($,X),I}function V($,y,v,E){if(typeof v=="object"&&v!==null&&v.type===ro&&v.key===null&&v.props.ref===void 0&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case nc:e:{for(var I=v.key;y!==null;){if(y.key===I){if(I=v.type,I===ro){if(y.tag===7){a($,y.sibling),E=r(y,v.props.children),hi(E,v),E.return=$,$=E;break e}}else if(y.elementType===I||typeof I=="object"&&I!==null&&I.$$typeof===gi&&tr(I)===y.type){a($,y.sibling),E=r(y,v.props),hi(E,v),E.return=$,$=E;break e}a($,y);break}else t($,y);y=y.sibling}v.type===ro?(E=or(v.props.children,$.mode,E,v.key),hi(E,v),E.return=$,$=E):(E=Ec(v.type,v.key,v.props,null,$.mode,E),hi(E,v),E.return=$,$=E)}return c($);case Rs:e:{for(I=v.key;y!==null;){if(y.key===I)if(y.tag===4&&y.stateNode.containerInfo===v.containerInfo&&y.stateNode.implementation===v.implementation){a($,y.sibling),E=r(y,v.children||[]),E.return=$,$=E;break e}else{a($,y);break}else t($,y);y=y.sibling}E=sh(v,$.mode,E),E.return=$,$=E}return c($);case gi:return v=tr(v),V($,y,v,E)}if(Ms(v))return R($,y,v,E);if(ks(v)){if(I=ks(v),typeof I!="function")throw Error(D(150));return v=I.call(v),O($,y,v,E)}if(typeof v.then=="function")return V($,y,hc(v),E);if(v.$$typeof===wn)return V($,y,uc($,v),E);mc($,v)}return typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint"?(v=""+v,y!==null&&y.tag===6?(a($,y.sibling),E=r(y,v),E.return=$,$=E):(a($,y),E=oh(v,$.mode,E),E.return=$,$=E),c($)):a($,y)}return function($,y,v,E){try{tl=0;var I=V($,y,v,E);return $o=null,I}catch(j){if(j===jo||j===Td)throw j;var Y=ba(29,j,null,$.mode);return Y.lanes=E,Y.return=$,Y}}}var pr=Cy(!0),Ey=Cy(!1),fi=!1;function ep(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Qh(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Ti(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Ci(e,t,a){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(De&2)!==0){var r=i.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),i.pending=t,t=Zc(e),yy(e,null,a),t}return Sd(e,i,t,a),Zc(e)}function qs(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Yv(e,a)}}function ch(e,t){var a=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,a===i)){var r=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?r=s=c:s=s.next=c,a=a.next}while(a!==null);s===null?r=s=t:s=s.next=t}else r=s=t;a={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,callbacks:i.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var Zh=!1;function Bs(){if(Zh){var e=wo;if(e!==null)throw e}}function js(e,t,a,i){Zh=!1;var r=e.updateQueue;fi=!1;var s=r.firstBaseUpdate,c=r.lastBaseUpdate,d=r.shared.pending;if(d!==null){r.shared.pending=null;var h=d,f=h.next;h.next=null,c===null?s=f:c.next=f,c=h;var w=e.alternate;w!==null&&(w=w.updateQueue,d=w.lastBaseUpdate,d!==c&&(d===null?w.firstBaseUpdate=f:d.next=f,w.lastBaseUpdate=h))}if(s!==null){var N=r.baseState;c=0,w=f=h=null,d=s;do{var p=d.lane&-536870913,b=p!==d.lane;if(b?(Te&p)===p:(i&p)===p){p!==0&&p===mr&&(Zh=!0),w!==null&&(w=w.next={lane:0,tag:d.tag,payload:d.payload,callback:null,next:null});e:{var R=e,O=d;p=t;var V=a;switch(O.tag){case 1:if(R=O.payload,typeof R=="function"){N=R.call(V,N,p);break e}N=R;break e;case 3:R.flags=R.flags&-65537|128;case 0:if(R=O.payload,p=typeof R=="function"?R.call(V,N,p):R,p==null)break e;N=Fe({},N,p);break e;case 2:fi=!0}}p=d.callback,p!==null&&(e.flags|=64,b&&(e.flags|=8192),b=r.callbacks,b===null?r.callbacks=[p]:b.push(p))}else b={lane:p,tag:d.tag,payload:d.payload,callback:d.callback,next:null},w===null?(f=w=b,h=N):w=w.next=b,c|=p;if(d=d.next,d===null){if(d=r.shared.pending,d===null)break;b=d,d=b.next,b.next=null,r.lastBaseUpdate=b,r.shared.pending=null}}while(!0);w===null&&(h=N),r.baseState=h,r.firstBaseUpdate=f,r.lastBaseUpdate=w,s===null&&(r.shared.lanes=0),Hi|=c,e.lanes=c,e.memoizedState=N}}function Ay(e,t){if(typeof e!="function")throw Error(D(191,e));e.call(t)}function zy(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)Ay(a[e],t)}var Ii=Cn(null),ed=Cn(0);function Cb(e,t){e=Wn,ot(ed,e),ot(Ii,t),Wn=e|t.baseLanes}function Kh(){ot(ed,Wn),ot(Ii,Ii.current)}function tp(){Wn=ed.current,Pt(Ii),Pt(ed)}var Kt=Cn(null),na=null;function Ei(e){var t=e.alternate;ot(Qt,Qt.current&1),ot(Kt,e),na===null&&(t===null||Ii.current!==null||t.memoizedState!==null)&&(na=e)}function Jh(e){ot(Qt,Qt.current),ot(Kt,e),na===null&&(na=e)}function Ry(e){e.tag===22?(ot(Qt,Qt.current),ot(Kt,e),na===null&&(na=e)):Ai()}function Ai(){ot(Qt,Qt.current),ot(Kt,Kt.current)}function Sa(e){Pt(Kt),na===e&&(na=null),Pt(Qt)}var Qt=Cn(0);function al(e,t){ot(Kt,Kt.current),ot(Qt,t)}function ap(e){Pt(Qt),Pt(Kt),na===e&&(na=null)}function td(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Rm(a)||Ap(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Kn=0,be=null,Qe=null,Tt=null,ad=!1,xo=!1,gr=!1,nd=0,nl=0,No=null,oN=0;function vt(){throw Error(D(321))}function np(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!Ra(e[a],t[a]))return!1;return!0}function ip(e,t,a,i,r,s){return Kn=s,be=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,re.H=e===null||e.memoizedState===null?lw:cw,gr=!1,s=a(i,r),gr=!1,xo&&(s=Oy(t,a,i,r)),My(e),s}function My(e){re.H=id;var t=Qe!==null&&Qe.next!==null;if(Kn=0,Tt=Qe=be=null,ad=!1,nl=0,No=null,t)throw Error(D(300));e===null||Et||(e=e.dependencies,e!==null&&Fc(e)&&(Et=!0))}function Oy(e,t,a,i){be=e;var r=0;do{if(xo&&(No=null),nl=0,xo=!1,25<=r)throw Error(D(301));if(r+=1,Tt=Qe=null,e.updateQueue!=null){var s=e.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}re.H=pN,s=t(a,i)}while(xo);return s}function sN(){var e=re.H,t=e.useState()[0];return t=typeof t.then=="function"?vl(t):t,e=e.useState()[0],(Qe!==null?Qe.memoizedState:null)!==e&&(be.flags|=1024),t}function rp(){var e=nd!==0;return nd=0,e}function op(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function sp(e){if(ad){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}ad=!1}Kn=0,Tt=Qe=be=null,xo=!1,nl=nd=0,No=null}function ua(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Tt===null?be.memoizedState=Tt=e:Tt=Tt.next=e,Tt}function $t(){if(Qe===null){var e=be.alternate;e=e!==null?e.memoizedState:null}else e=Qe.next;var t=Tt===null?be.memoizedState:Tt.next;if(t!==null)Tt=t,Qe=e;else{if(e===null)throw be.alternate===null?Error(D(467)):Error(D(310));Qe=e,e={memoizedState:Qe.memoizedState,baseState:Qe.baseState,baseQueue:Qe.baseQueue,queue:Qe.queue,next:null},Tt===null?be.memoizedState=Tt=e:Tt=Tt.next=e}return Tt}function Cd(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function vl(e){var t=nl;return nl+=1,No===null&&(No=[]),e=Ty(No,e,t),t=be,(Tt===null?t.memoizedState:Tt.next)===null&&(t=t.alternate,re.H=t===null||t.memoizedState===null?lw:cw),e}function Ed(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return vl(e);if(e.$$typeof===jx)return;if(e.$$typeof===wn)return Xt(e)}throw Error(D(438,String(e)))}function lp(e){var t=null,a=be.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var i=be.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(r){return r.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=Cd(),be.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),i=0;i<e;i++)a[i]=Bx;return t.index++,a}function Jn(e,t){return typeof t=="function"?t(e):t}function Rc(e){var t=$t();return cp(t,Qe,e)}function cp(e,t,a){var i=e.queue;if(i===null)throw Error(D(311));i.lastRenderedReducer=a;var r=e.baseQueue,s=i.pending;if(s!==null){if(r!==null){var c=r.next;r.next=s.next,s.next=c}t.baseQueue=r=s,i.pending=null}if(s=e.baseState,r===null)e.memoizedState=s;else{t=r.next;var d=c=null,h=null,f=t,w=!1;do{var N=f.lane&-536870913;if(N!==f.lane?(Te&N)===N:(Kn&N)===N){var p=f.revertLane;if(p===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null}),N===mr&&(w=!0);else if((Kn&p)===p){f=f.next,p===mr&&(w=!0);continue}else N={lane:0,revertLane:f.revertLane,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},h===null?(d=h=N,c=s):h=h.next=N,be.lanes|=p,Hi|=p;N=f.action,gr&&a(s,N),s=f.hasEagerState?f.eagerState:a(s,N)}else p={lane:N,revertLane:f.revertLane,gesture:f.gesture,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},h===null?(d=h=p,c=s):h=h.next=p,be.lanes|=N,Hi|=N;f=f.next}while(f!==null&&f!==t);if(h===null?c=s:h.next=d,!Ra(s,e.memoizedState)&&(Et=!0,w&&(a=wo,a!==null)))throw a;e.memoizedState=s,e.baseState=c,e.baseQueue=h,i.lastRenderedState=s}return r===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function dh(e){var t=$t(),a=t.queue;if(a===null)throw Error(D(311));a.lastRenderedReducer=e;var i=a.dispatch,r=a.pending,s=t.memoizedState;if(r!==null){a.pending=null;var c=r=r.next;do s=e(s,c.action),c=c.next;while(c!==r);Ra(s,t.memoizedState)||(Et=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),a.lastRenderedState=s}return[s,i]}function Vy(e,t,a){var i=be,r=$t(),s=$e;if(s){if(a===void 0)throw Error(D(407));a=a()}else a=t();var c=!Ra((Qe||r).memoizedState,a);if(c&&(r.memoizedState=a,Et=!0),r=r.queue,dp(_y.bind(null,i,r,e),[e]),e=r.getSnapshot!==t||c||Tt!==null&&(Tt.memoizedState.tag&1)!==0,zo(e?9:8,{destroy:void 0},Iy.bind(null,i,r,a,t),null),e){if(i.flags|=2048,Je===null)throw Error(D(349));s||(Kn&127)!==0||Dy(i,t,a)}return a}function Dy(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=be.updateQueue,t===null?(t=Cd(),be.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function Iy(e,t,a,i){t.value=a,t.getSnapshot=i,Hy(t)&&Uy(e)}function _y(e,t,a){return a(function(){Hy(t)&&Uy(e)})}function Hy(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!Ra(e,a)}catch{return!0}}function Uy(e){var t=$r(e,2);t!==null&&va(t,e,2)}function Fh(e){var t=ua();if(typeof e=="function"){var a=e;if(e=a(),gr){vi(!0);try{a()}finally{vi(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Jn,lastRenderedState:e},t}function qy(e,t,a,i){return e.baseState=a,cp(e,Qe,typeof i=="function"?i:Jn)}function lN(e,t,a,i,r){if(zd(e))throw Error(D(485));if(e=t.action,e!==null){var s={payload:r,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){s.listeners.push(c)}};re.T!==null?a(!0):s.isTransition=!1,i(s),a=t.pending,a===null?(s.next=t.pending=s,By(t,s)):(s.next=a.next,t.pending=a.next=s)}}function By(e,t){var a=t.action,i=t.payload,r=e.state;if(t.isTransition){var s=re.T,c={};c.types=s!==null?s.types:null,re.T=c;try{var d=a(r,i),h=re.S;h!==null&&h(c,d),Eb(e,t,d)}catch(f){Wh(e,t,f)}finally{s!==null&&c.types!==null&&(s.types=c.types),re.T=s}}else try{s=a(r,i),Eb(e,t,s)}catch(f){Wh(e,t,f)}}function Eb(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(i){Ab(e,t,i)},function(i){return Wh(e,t,i)}):Ab(e,t,a)}function Ab(e,t,a){t.status="fulfilled",t.value=a,jy(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,By(e,a)))}function Wh(e,t,a){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=a,jy(t),t=t.next;while(t!==i)}e.action=null}function jy(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Ly(e,t){return t}function zb(e,t){if($e){var a=Je.formState;if(a!==null){e:{var i=be;if($e){if(rt){t:{for(var r=rt,s=Ya;r.nodeType!==8;){if(!s){r=null;break t}if(r=Xa(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){rt=Xa(r.nextSibling),i=r.data==="F!";break e}}Di(i)}i=!1}i&&(t=a[0])}}return a=ua(),a.memoizedState=a.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ly,lastRenderedState:t},a.queue=i,a=rw.bind(null,be,i),i.dispatch=a,i=Fh(!1),s=pp.bind(null,be,!1,i.queue),i=ua(),r={state:t,dispatch:null,action:e,pending:null},i.queue=r,a=lN.bind(null,be,r,s,a),r.dispatch=a,i.memoizedState=e,[t,a,!1]}function Rb(e){var t=$t();return Gy(t,Qe,e)}function Gy(e,t,a){if(t=cp(e,t,Ly)[0],e=Rc(Jn)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=vl(t)}catch(c){throw c===jo?Td:c}else i=t;t=$t();var r=t.queue,s=r.dispatch;return a!==t.memoizedState&&(be.flags|=2048,zo(9,{destroy:void 0},cN.bind(null,r,a),null)),[i,s,e]}function cN(e,t){e.action=t}function Mb(e){var t=$t(),a=Qe;if(a!==null)return Gy(t,a,e);$t(),t=t.memoizedState,a=$t();var i=a.queue.dispatch;return a.memoizedState=e,[t,i,!1]}function zo(e,t,a,i){return e={tag:e,create:a,deps:i,inst:t,next:null},t=be.updateQueue,t===null&&(t=Cd(),be.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(i=a.next,a.next=e,e.next=i,t.lastEffect=e),e}function Yy(){return $t().memoizedState}function Mc(e,t,a,i){var r=ua();be.flags|=e,r.memoizedState=zo(1|t,{destroy:void 0},a,i===void 0?null:i)}function Ad(e,t,a,i){var r=$t();i=i===void 0?null:i;var s=r.memoizedState.inst;Qe!==null&&i!==null&&np(i,Qe.memoizedState.deps)?r.memoizedState=zo(t,s,a,i):(be.flags|=e,r.memoizedState=zo(1|t,s,a,i))}function Ob(e,t){Mc(8390656,8,e,t)}function dp(e,t){Ad(2048,8,e,t)}function dN(e){be.flags|=4;var t=be.updateQueue;if(t===null)t=Cd(),be.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function Xy(e){var t=$t().memoizedState;return dN({ref:t,nextImpl:e}),function(){if((De&2)!==0)throw Error(D(440));return t.impl.apply(void 0,arguments)}}function Py(e,t){return Ad(4,2,e,t)}function Qy(e,t){return Ad(4,4,e,t)}function Zy(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Ky(e,t,a){a=a!=null?a.concat([e]):null,Ad(4,4,Zy.bind(null,t,e),a)}function up(){}function Jy(e,t){var a=$t();t=t===void 0?null:t;var i=a.memoizedState;return t!==null&&np(t,i[1])?i[0]:(a.memoizedState=[e,t],e)}function Fy(e,t){var a=$t();t=t===void 0?null:t;var i=a.memoizedState;if(t!==null&&np(t,i[1]))return i[0];if(i=e(),gr){vi(!0);try{e()}finally{vi(!1)}}return a.memoizedState=[i,t],i}function hp(e,t,a){return a===void 0||(Kn&1073741824)!==0&&(Te&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=Gw(),be.lanes|=e,Hi|=e,a)}function Wy(e,t,a,i){return Ra(a,t)?a:Ii.current!==null?(e=hp(e,a,i),Ra(e,t)||(Et=!0),e):(Kn&106)===0||(Kn&1073741824)!==0&&(Te&261930)===0?(Et=!0,e.memoizedState=a):(e=Gw(),be.lanes|=e,Hi|=e,t)}function ew(e,t,a,i,r){var s=Ie.p;Ie.p=s!==0&&8>s?s:8;var c=re.T,d={};d.types=c!==null?c.types:null,re.T=d,pp(e,!1,t,a);try{var h=r(),f=re.S;if(f!==null&&f(d,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var w=rN(h,i);Ls(e,t,w,za(e))}else Ls(e,t,i,za(e))}catch(N){Ls(e,t,{then:function(){},status:"rejected",reason:N},za())}finally{Ie.p=s,c!==null&&d.types!==null&&(c.types=d.types),re.T=c}}function uN(){}function em(e,t,a,i){if(e.tag!==5)throw Error(D(476));var r=tw(e).queue;ew(e,r,t,rr,a===null?uN:function(){return aw(e),a(i)})}function tw(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:rr,baseState:rr,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Jn,lastRenderedState:rr},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Jn,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function aw(e){var t=tw(e);t.next===null&&(t=e.alternate.memoizedState),Ls(e,t.next.queue,{},za())}function mp(){return Xt(_o)}function nw(){return $t().memoizedState}function iw(){return $t().memoizedState}function hN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=za();e=Ti(a);var i=Ci(t,e,a);i!==null&&(va(i,t,a),qs(i,t,a)),t={cache:Jm()},e.payload=t;return}t=t.return}}function mN(e,t,a){var i=za();a={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},zd(e)?ow(t,a):(a=Qm(e,t,a,i),a!==null&&(va(a,e,i),sw(a,t,i)))}function rw(e,t,a){var i=za();Ls(e,t,a,i)}function Ls(e,t,a,i){var r={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(zd(e))ow(t,r);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var c=t.lastRenderedState,d=s(c,a);if(r.hasEagerState=!0,r.eagerState=d,Ra(d,c))return Sd(e,t,r,0),Je===null&&Nd(),!1}catch{}if(a=Qm(e,t,r,i),a!==null)return va(a,e,i),sw(a,t,i),!0}return!1}function pp(e,t,a,i){if(i={lane:2,revertLane:kp(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},zd(e)){if(t)throw Error(D(479))}else t=Qm(e,a,i,2),t!==null&&va(t,e,2)}function zd(e){var t=e.alternate;return e===be||t!==null&&t===be}function ow(e,t){xo=ad=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function sw(e,t,a){if((a&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Yv(e,a)}}var id={readContext:Xt,use:Ed,useCallback:vt,useContext:vt,useEffect:vt,useImperativeHandle:vt,useLayoutEffect:vt,useInsertionEffect:vt,useMemo:vt,useReducer:vt,useRef:vt,useState:vt,useDebugValue:vt,useDeferredValue:vt,useTransition:vt,useSyncExternalStore:vt,useId:vt,useHostTransitionStatus:vt,useFormState:vt,useActionState:vt,useOptimistic:vt,useMemoCache:vt,useCacheRefresh:vt,useEffectEvent:vt},lw={readContext:Xt,use:Ed,useCallback:function(e,t){return ua().memoizedState=[e,t===void 0?null:t],e},useContext:Xt,useEffect:Ob,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,Mc(4194308,4,Zy.bind(null,t,e),a)},useLayoutEffect:function(e,t){return Mc(4194308,4,e,t)},useInsertionEffect:function(e,t){Mc(4,2,e,t)},useMemo:function(e,t){var a=ua();t=t===void 0?null:t;var i=e();if(gr){vi(!0);try{e()}finally{vi(!1)}}return a.memoizedState=[i,t],i},useReducer:function(e,t,a){var i=ua();if(a!==void 0){var r=a(t);if(gr){vi(!0);try{a(t)}finally{vi(!1)}}}else r=t;return i.memoizedState=i.baseState=r,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:r},i.queue=e,e=e.dispatch=mN.bind(null,be,e),[i.memoizedState,e]},useRef:function(e){var t=ua();return e={current:e},t.memoizedState=e},useState:function(e){e=Fh(e);var t=e.queue,a=rw.bind(null,be,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:up,useDeferredValue:function(e,t){var a=ua();return hp(a,e,t)},useTransition:function(){var e=Fh(!1);return e=ew.bind(null,be,e.queue,!0,!1),ua().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var i=be,r=ua();if($e){if(a===void 0)throw Error(D(407));a=a()}else{if(a=t(),Je===null)throw Error(D(349));(Te&127)!==0||Dy(i,t,a)}r.memoizedState=a;var s={value:a,getSnapshot:t};return r.queue=s,Ob(_y.bind(null,i,s,e),[e]),i.flags|=2048,zo(9,{destroy:void 0},Iy.bind(null,i,s,a,t),null),a},useId:function(){var e=ua(),t=Je.identifierPrefix;if($e){var a=Nn,i=xn;a=(i&~(1<<32-Aa(i)-1)).toString(32)+a,t="_"+t+"R_"+a,a=nd++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=oN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:mp,useFormState:zb,useActionState:zb,useOptimistic:function(e){var t=ua();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=pp.bind(null,be,!0,a),a.dispatch=t,[e,t]},useMemoCache:lp,useCacheRefresh:function(){return ua().memoizedState=hN.bind(null,be)},useEffectEvent:function(e){var t=ua(),a={impl:e};return t.memoizedState=a,function(){if((De&2)!==0)throw Error(D(440));return a.impl.apply(void 0,arguments)}}},cw={readContext:Xt,use:Ed,useCallback:Jy,useContext:Xt,useEffect:dp,useImperativeHandle:Ky,useInsertionEffect:Py,useLayoutEffect:Qy,useMemo:Fy,useReducer:Rc,useRef:Yy,useState:function(){return Rc(Jn)},useDebugValue:up,useDeferredValue:function(e,t){var a=$t();return Wy(a,Qe.memoizedState,e,t)},useTransition:function(){var e=Rc(Jn)[0],t=$t().memoizedState;return[typeof e=="boolean"?e:vl(e),t]},useSyncExternalStore:Vy,useId:nw,useHostTransitionStatus:mp,useFormState:Rb,useActionState:Rb,useOptimistic:function(e,t){var a=$t();return qy(a,Qe,e,t)},useMemoCache:lp,useCacheRefresh:iw,useEffectEvent:Xy},pN={readContext:Xt,use:Ed,useCallback:Jy,useContext:Xt,useEffect:dp,useImperativeHandle:Ky,useInsertionEffect:Py,useLayoutEffect:Qy,useMemo:Fy,useReducer:dh,useRef:Yy,useState:function(){return dh(Jn)},useDebugValue:up,useDeferredValue:function(e,t){var a=$t();return Qe===null?hp(a,e,t):Wy(a,Qe.memoizedState,e,t)},useTransition:function(){var e=dh(Jn)[0],t=$t().memoizedState;return[typeof e=="boolean"?e:vl(e),t]},useSyncExternalStore:Vy,useId:nw,useHostTransitionStatus:mp,useFormState:Mb,useActionState:Mb,useOptimistic:function(e,t){var a=$t();return Qe!==null?qy(a,Qe,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:lp,useCacheRefresh:iw,useEffectEvent:Xy};function uh(e,t,a,i){t=e.memoizedState,a=a(i,t),a=a==null?t:Fe({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var tm={enqueueSetState:function(e,t,a){e=e._reactInternals;var i=za(),r=Ti(i);r.payload=t,a!=null&&(r.callback=a),t=Ci(e,r,i),t!==null&&(va(t,e,i),qs(t,e,i))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var i=za(),r=Ti(i);r.tag=1,r.payload=t,a!=null&&(r.callback=a),t=Ci(e,r,i),t!==null&&(va(t,e,i),qs(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=za(),i=Ti(a);i.tag=2,t!=null&&(i.callback=t),t=Ci(e,i,a),t!==null&&(va(t,e,a),qs(t,e,a))}};function Vb(e,t,a,i,r,s,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,s,c):t.prototype&&t.prototype.isPureReactComponent?!Fs(a,i)||!Fs(r,s):!0}function Db(e,t,a,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,i),t.state!==e&&tm.enqueueReplaceState(t,t.state,null)}function fr(e,t){var a=t;if("ref"in t){a={};for(var i in t)i!=="ref"&&(a[i]=t[i])}if(e=e.defaultProps){a===t&&(a=Fe({},a));for(var r in e)a[r]===void 0&&(a[r]=e[r])}return a}function dw(e){Qc(e)}function uw(e){console.error(e)}function hw(e){Qc(e)}function rd(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function Ib(e,t,a){try{var i=e.onCaughtError;i(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function am(e,t,a){return a=Ti(a),a.tag=3,a.payload={element:null},a.callback=function(){rd(e,t)},a}function mw(e){return e=Ti(e),e.tag=3,e}function pw(e,t,a,i){var r=a.type.getDerivedStateFromError;if(typeof r=="function"){var s=i.value;e.payload=function(){return r(s)},e.callback=function(){Ib(t,a,i)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){Ib(t,a,i),typeof r!="function"&&(zi===null?zi=new Set([this]):zi.add(this));var d=i.stack;this.componentDidCatch(i.value,{componentStack:d!==null?d:""})})}function gN(e,t,a,i,r){if(a.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=a.alternate,t!==null&&ur(t,a,r,!0),a=Kt.current,a!==null){switch(a.tag){case 31:case 13:case 19:return na===null?md():a.alternate===null&&yt===0&&(yt=3),a.flags&=-257,a.flags|=65536,a.lanes=r,i===Wc?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([i]):t.add(i),vh(e,i,r)),!1;case 22:return a.flags|=65536,i===Wc?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([i]):a.add(i)),vh(e,i,r)),!1}throw Error(D(435,a.tag))}return vh(e,i,r),md(),!1}if($e)return t=Kt.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=r,i!==Gh&&(e=Error(D(422),{cause:i}),el(Ga(e,a)))):(i!==Gh&&(t=Error(D(423),{cause:i}),el(Ga(t,a))),e=e.current.alternate,e.flags|=65536,r&=-r,e.lanes|=r,i=Ga(i,a),r=am(e.stateNode,i,r),ch(e,r),yt!==4&&(yt=2)),!1;var s=Error(D(520),{cause:i});if(s=Ga(s,a),Ps===null?Ps=[s]:Ps.push(s),yt!==4&&(yt=2),t===null)return!0;i=Ga(i,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=r&-r,a.lanes|=e,e=am(a.stateNode,i,e),ch(a,e),!1;case 1:if(t=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(zi===null||!zi.has(s))))return a.flags|=65536,r&=-r,a.lanes|=r,r=mw(r),pw(r,e,a,i),ch(a,r),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var gp=Error(D(461)),Et=!1;function Mt(e,t,a,i){t.child=e===null?Ey(t,null,a,i):pr(t,e.child,a,i)}function _b(e,t,a,i,r){a=a.render;var s=t.ref;if("ref"in i){var c={};for(var d in i)d!=="ref"&&(c[d]=i[d])}else c=i;return hr(t),i=ip(e,t,a,c,s,r),d=rp(),e!==null&&!Et?(op(e,t,r),Fn(e,t,r)):($e&&d&&kd(t),t.flags|=1,Mt(e,t,i,r),t.child)}function Hb(e,t,a,i,r){if(e===null){var s=a.type;return typeof s=="function"&&!Zm(s)&&s.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=s,gw(e,t,s,i,r)):(e=Ec(a.type,null,i,t,t.mode,r),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!bp(e,r)){var c=s.memoizedProps;if(a=a.compare,a=a!==null?a:Fs,a(c,i)&&e.ref===t.ref)return Fn(e,t,r)}return t.flags|=1,e=Xn(s,i),e.ref=t.ref,e.return=t,t.child=e}function gw(e,t,a,i,r){if(e!==null){var s=e.memoizedProps;if(Fs(s,i)&&e.ref===t.ref)if(Et=!1,t.pendingProps=i=s,bp(e,r))(e.flags&131072)!==0&&(Et=!0);else return t.lanes=e.lanes,Fn(e,t,r)}return nm(e,t,a,i,r)}function fw(e,t,a,i){var r=i.children,s=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(s=s!==null?s.baseLanes|a:a,e!==null){for(i=t.child=e.child,r=0;i!==null;)r=r|i.lanes|i.childLanes,i=i.sibling;i=r&~s}else i=0,t.child=null;return Ub(e,t,s,a,i)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&zc(t,s!==null?s.cachePool:null),s!==null?Cb(t,s):Kh(),Ry(t);else return i=t.lanes=536870912,Ub(e,t,s!==null?s.baseLanes|a:a,a,i)}else s!==null?(zc(t,s.cachePool),Cb(t,s),Ai(),t.memoizedState=null):(e!==null&&zc(t,null),Kh(),Ai());return Mt(e,t,r,a),t.child}function Gs(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Ub(e,t,a,i,r){var s=Fm();return s=s===null?null:{parent:Ct._currentValue,pool:s},t.memoizedState={baseLanes:a,cachePool:s},e!==null&&zc(t,null),Kh(),Ry(t),e!==null&&ur(e,t,i,!0),t.childLanes=r,null}function Oc(e,t){return t=Rd({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function qb(e,t,a){return pr(t,e.child,null,a),e=Oc(t,t.pendingProps),e.flags|=2,Sa(t),t.memoizedState=null,e}function fN(e,t,a){var i=t.pendingProps,r=(t.flags&128)!==0;if(t.flags&=-129,e===null){if($e){if(i.mode==="hidden")return e=Oc(t,i),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},Gs(null,e);if(Jh(t),(e=rt)?(e=f0(e,Ya),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Vi!==null?{id:xn,overflow:Nn}:null,retryLane:536870912,hydrationErrors:null},a=$y(e),a.return=t,t.child=a,jt=t,rt=null)):e=null,e===null)throw Di(t);return t.lanes=536870912,null}return Oc(t,i)}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(Jh(t),r)if(t.flags&256)t.flags&=-257,t=qb(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(D(558));else if(Et||ur(e,t,a,!1),r=(a&e.childLanes)!==0,Et||r){if(Ii.current===null){if(i=Je,i!==null&&(c=Xv(i,a),c!==0&&c!==s.retryLane))throw s.retryLane=c,$r(e,c),va(i,e,c),gp;md()}t=qb(e,t,a)}else e=s.treeContext,rt=Xa(c.nextSibling),jt=t,$e=!0,ki=null,Ya=!1,e!==null&&Ny(t,e),t=Oc(t,i),t.flags|=134221824;return t}return e=Xn(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function to(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(D(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function nm(e,t,a,i,r){return hr(t),a=ip(e,t,a,i,void 0,r),i=rp(),e!==null&&!Et?(op(e,t,r),Fn(e,t,r)):($e&&i&&kd(t),t.flags|=1,Mt(e,t,a,r),t.child)}function Bb(e,t,a,i,r,s){return hr(t),t.updateQueue=null,a=Oy(t,i,a,r),My(e),i=rp(),e!==null&&!Et?(op(e,t,s),Fn(e,t,s)):($e&&i&&kd(t),t.flags|=1,Mt(e,t,a,s),t.child)}function jb(e,t,a,i,r){if(hr(t),t.stateNode===null){var s=mo,c=a.contextType;typeof c=="object"&&c!==null&&(s=Xt(c)),s=new a(i,s),t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=tm,t.stateNode=s,s._reactInternals=t,s=t.stateNode,s.props=i,s.state=t.memoizedState,s.refs={},ep(t),c=a.contextType,s.context=typeof c=="object"&&c!==null?Xt(c):mo,s.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(uh(t,a,c,i),s.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(c=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),c!==s.state&&tm.enqueueReplaceState(s,s.state,null),js(t,i,s,r),Bs(),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){s=t.stateNode;var d=t.memoizedProps,h=fr(a,d);s.props=h;var f=s.context,w=a.contextType;c=mo,typeof w=="object"&&w!==null&&(c=Xt(w));var N=a.getDerivedStateFromProps;w=typeof N=="function"||typeof s.getSnapshotBeforeUpdate=="function",d=t.pendingProps!==d,w||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(d||f!==c)&&Db(t,s,i,c),fi=!1;var p=t.memoizedState;s.state=p,js(t,i,s,r),Bs(),f=t.memoizedState,d||p!==f||fi?(typeof N=="function"&&(uh(t,a,N,i),f=t.memoizedState),(h=fi||Vb(t,a,h,i,p,f,c))?(w||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=f),s.props=i,s.state=f,s.context=c,i=h):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{s=t.stateNode,Qh(e,t),c=t.memoizedProps,w=fr(a,c),s.props=w,N=t.pendingProps,p=s.context,f=a.contextType,h=mo,typeof f=="object"&&f!==null&&(h=Xt(f)),d=a.getDerivedStateFromProps,(f=typeof d=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==N||p!==h)&&Db(t,s,i,h),fi=!1,p=t.memoizedState,s.state=p,js(t,i,s,r),Bs();var b=t.memoizedState;c!==N||p!==b||fi||e!==null&&e.dependencies!==null&&Fc(e.dependencies)?(typeof d=="function"&&(uh(t,a,d,i),b=t.memoizedState),(w=fi||Vb(t,a,w,i,p,b,h)||e!==null&&e.dependencies!==null&&Fc(e.dependencies))?(f||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(i,b,h),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(i,b,h)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&p===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&p===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=b),s.props=i,s.state=b,s.context=h,i=w):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&p===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&p===e.memoizedState||(t.flags|=1024),i=!1)}return s=i,to(e,t),i=(t.flags&128)!==0,s||i?(s=t.stateNode,a=i&&typeof a.getDerivedStateFromError!="function"?null:s.render(),t.flags|=1,e!==null&&i?(t.child=pr(t,e.child,null,r),t.child=pr(t,null,a,r)):Mt(e,t,a,r),t.memoizedState=s.state,e=t.child):e=Fn(e,t,r),e}function Lb(e,t,a,i){return dr(),t.flags|=256,Mt(e,t,a,i),t.child}var im={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function rm(e){return{baseLanes:e,cachePool:ky()}}function om(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=Ta),e}function bw(e,t,a){var i=t.pendingProps,r=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(Qt.current&2)!==0),c&&(r=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if($e){if(r?Ei(t):Ai(),(e=rt)?(e=f0(e,Ya),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Vi!==null?{id:xn,overflow:Nn}:null,retryLane:536870912,hydrationErrors:null},a=$y(e),a.return=t,t.child=a,jt=t,rt=null)):e=null,e===null)throw Di(t);return Ap(e)?t.lanes=32:t.lanes=536870912,null}return s=i.children,i=i.fallback,r?(Ai(),r=t.mode,s=Rd({mode:"hidden",children:s},r),i=or(i,r,a,null),s.return=t,i.return=t,s.sibling=i,t.child=s,i=t.child,i.memoizedState=rm(a),i.childLanes=om(e,c,a),t.memoizedState=im,Gs(null,i)):(Ei(t),fp(t,s))}var d=e.memoizedState;if(d!==null){var h=d.dehydrated;if(h!==null)return bN(e,t,s,c,i,h,d,a)}return r?(Ai(),r=i.fallback,s=t.mode,d=e.child,h=d.sibling,i=Xn(d,{mode:"hidden",children:i.children}),i.subtreeFlags=d.subtreeFlags&1206910976,h!==null?r=Xn(h,r):(r=or(r,s,a,null),r.flags|=2),r.return=t,i.return=t,i.sibling=r,t.child=i,Gs(null,i),i=t.child,r=e.child.memoizedState,r===null?r=rm(a):(s=r.cachePool,s!==null?(d=Ct._currentValue,s=s.parent!==d?{parent:d,pool:d}:s):s=ky(),r={baseLanes:r.baseLanes|a,cachePool:s}),i.memoizedState=r,i.childLanes=om(e,c,a),t.memoizedState=im,Gs(e.child,i)):(Ei(t),a=e.child,e=a.sibling,a=Xn(a,{mode:"visible",children:i.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function fp(e,t){return t=Rd({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Rd(e,t){return e=ba(22,e,null,t),e.lanes=0,e}function pc(e,t,a){return pr(t,e.child,null,a),e=fp(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function bN(e,t,a,i,r,s,c,d){if(a)return t.flags&256?(Ei(t),t.flags&=-257,pc(e,t,d)):t.memoizedState!==null?(Ai(),t.child=e.child,t.flags|=128,null):(Ai(),s=r.fallback,c=t.mode,r=Rd({mode:"visible",children:r.children},c),s=or(s,c,d,null),s.flags|=2,r.return=t,s.return=t,r.sibling=s,t.child=r,pr(t,e.child,null,d),r=t.child,r.memoizedState=rm(d),r.childLanes=om(e,i,d),t.memoizedState=im,Gs(null,r));if(Ei(t),Ap(s)){if(i=s.nextSibling&&s.nextSibling.dataset,i)var h=i.dgst;return i=h,i!==""&&(r=Error(D(419)),r.stack="",r.digest=i,el({value:r,source:null,stack:null})),pc(e,t,d)}if(Et||ur(e,t,d,!1),i=(d&e.childLanes)!==0,Et||i){if(Ii.current!==null)return pc(e,t,d);if(i=Je,i!==null&&(r=Xv(i,d),r!==0&&r!==c.retryLane))throw c.retryLane=r,$r(e,r),va(i,e,r),gp;return Rm(s)||md(),pc(e,t,d)}return Rm(s)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,rt=Xa(s.nextSibling),jt=t,$e=!0,ki=null,Ya=!1,e!==null&&Ny(t,e),t=fp(t,r.children),t.flags|=134221824,t)}function Gb(e,t,a){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),Ac(e.return,t,a)}function Yb(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&td(a)===null&&(t=e),e=e.sibling}return t}function gc(e,t,a,i,r,s){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:a,tailMode:r,treeForkCount:s}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=i,c.tail=a,c.tailMode=r,c.treeForkCount=s)}function hh(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function sm(e,t,a){var i=t.pendingProps,r=i.revealOrder,s=i.tail;i=i.children;var c=Qt.current;if(t.flags&128)return al(t,c),null;var d=(c&2)!==0;if(d?(c=c&1|2,t.flags|=128):c&=1,al(t,c),r==="backwards"&&e!==null?(hh(e),Mt(e,t,i,a),hh(e)):Mt(e,t,i,a),i=$e?Ws:0,!d&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Gb(e,a,t);else if(e.tag===19)Gb(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(r){case"backwards":a=Yb(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null,hh(t)),gc(t,!0,r,null,s,i);break;case"unstable_legacy-backwards":for(a=null,r=t.child,t.child=null;r!==null;){if(e=r.alternate,e!==null&&td(e)===null){t.child=r;break}e=r.sibling,r.sibling=a,a=r,r=e}gc(t,!0,a,null,s,i);break;case"together":gc(t,!1,null,null,void 0,i);break;case"independent":t.memoizedState=null;break;default:a=Yb(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null),gc(t,!1,r,a,s,i)}return t.child}function Xb(e,t,a){var i=t.pendingProps;return wi(t,t.type,i.value),Mt(e,t,i.children,a),t.child}function Fn(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),Hi|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(ur(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(D(153));if(t.child!==null){for(e=t.child,a=Xn(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=Xn(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function bp(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Fc(e)))}function vN(e,t,a){switch(t.tag){case 3:Gc(t,t.stateNode.containerInfo),wi(t,Ct,e.memoizedState.cache),dr();break;case 27:case 5:Vh(t);break;case 4:Gc(t,t.stateNode.containerInfo);break;case 10:wi(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Jh(t),null;break;case 13:var i=t.memoizedState;if(i!==null){if(i.dehydrated!==null)return Ei(t),t.flags|=128,null;i=ur(e,t,a,!1);var r=t.child.childLanes;return i||(a&r)!==0?bw(e,t,a):(Ei(t),e=Fn(e,t,a),e!==null?e.sibling:null)}Ei(t);break;case 19:if(t.flags&128)return sm(e,t,a);if(r=(e.flags&128)!==0,i=(a&t.childLanes)!==0,i||(ur(e,t,a,!1),i=(a&t.childLanes)!==0),r){if(i)return sm(e,t,a);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),al(t,Qt.current),i)break;return null;case 22:return t.lanes=0,fw(e,t,a,t.pendingProps);case 24:wi(t,Ct,e.memoizedState.cache)}return Fn(e,t,a)}function vw(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)Et=!0;else{if(!bp(e,a)&&(t.flags&128)===0)return Et=!1,vN(e,t,a);Et=(e.flags&131072)!==0}else Et=!1,$e&&(t.flags&1048576)!==0&&xy(t,Ws,t.index);switch(t.lanes=0,t.tag){case 16:e:{var i=t.pendingProps;if(e=tr(t.elementType),t.type=e,typeof e=="function")Zm(e)?(i=fr(e,i),t.tag=1,t=jb(null,t,e,i,a)):(t.tag=0,t=nm(null,t,e,i,a));else{if(e!=null){var r=e.$$typeof;if(r===Im){t.tag=11,t=_b(null,t,e,i,a);break e}else if(r===_m){t.tag=14,t=Hb(null,t,e,i,a);break e}else if(r===wn){t.tag=10,t.type=e,t=Xb(null,t,a);break e}}throw t=Mh(e)||e,Error(D(306,t,""))}}return t;case 0:return nm(e,t,t.type,t.pendingProps,a);case 1:return i=t.type,r=fr(i,t.pendingProps),jb(e,t,i,r,a);case 3:e:{if(Gc(t,t.stateNode.containerInfo),e===null)throw Error(D(387));i=t.pendingProps;var s=t.memoizedState;r=s.element,Qh(e,t),js(t,i,null,a);var c=t.memoizedState;if(i=c.cache,wi(t,Ct,i),i!==s.cache&&Xh(t,[Ct],a,!0),Bs(),i=c.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){t=Lb(e,t,i,a);break e}else if(i!==r){r=Ga(Error(D(424)),t),el(r),t=Lb(e,t,i,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,rt=Xa(e.firstChild),jt=t,$e=!0,ki=null,Ya=!0,a=Ey(t,null,i,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(dr(),i===r){t=Fn(e,t,a);break e}Mt(e,t,i,a)}t=t.child}return t;case 26:return to(e,t),e===null?(a=yv(t.type,null,t.pendingProps,null))?t.memoizedState=a:$e||(t.stateNode=s0(t.type,t.pendingProps,Si.current,t)):t.memoizedState=yv(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Vh(t),e===null&&$e&&(i=t.stateNode=b0(t.type,t.pendingProps,Si.current),jt=t,Ya=!0,r=rt,qi(t.type)?(Mm=r,rt=Xa(i.firstChild)):rt=r),Mt(e,t,t.pendingProps.children,a),to(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&$e&&((r=i=rt)&&(i=d2(i,t.type,t.pendingProps,Ya),i!==null?(t.stateNode=i,jt=t,rt=Xa(i.firstChild),Ya=!1,r=!0):r=!1),r||Di(t)),Vh(t),r=t.type,s=t.pendingProps,c=e!==null?e.memoizedProps:null,i=s.children,Em(r,s)?i=null:c!==null&&Em(r,c)&&(t.flags|=32),t.memoizedState!==null&&(r=ip(e,t,sN,null,null,a),_o._currentValue=r),to(e,t),Mt(e,t,i,a),t.child;case 6:return e===null&&$e&&((e=a=rt)&&(a=u2(a,t.pendingProps,Ya),a!==null?(t.stateNode=a,jt=t,rt=null,e=!0):e=!1),e||Di(t)),null;case 13:return bw(e,t,a);case 4:return Gc(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=pr(t,null,i,a):Mt(e,t,i,a),t.child;case 11:return _b(e,t,t.type,t.pendingProps,a);case 7:return i=t.pendingProps,to(e,t),Mt(e,t,i,a),t.child;case 8:return Mt(e,t,t.pendingProps.children,a),t.child;case 12:return Mt(e,t,t.pendingProps.children,a),t.child;case 10:return Xb(e,t,a);case 9:return r=t.type._context,i=t.pendingProps.children,hr(t),r=Xt(r),i=i(r),t.flags|=1,Mt(e,t,i,a),t.child;case 14:return Hb(e,t,t.type,t.pendingProps,a);case 15:return gw(e,t,t.type,t.pendingProps,a);case 19:return sm(e,t,a);case 31:return fN(e,t,a);case 22:return fw(e,t,a,t.pendingProps);case 24:return hr(t),i=Xt(Ct),e===null?(r=Fm(),r===null&&(r=Je,s=Jm(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=a),r=s),t.memoizedState={parent:i,cache:r},ep(t),wi(t,Ct,r)):((e.lanes&a)!==0&&(Qh(e,t),js(t,null,null,a),Bs()),r=e.memoizedState,s=t.memoizedState,r.parent!==i?(r={parent:i,cache:i},t.memoizedState=r,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=r),wi(t,Ct,i)):(i=s.cache,wi(t,Ct,i),i!==r.cache&&Xh(t,[Ct],a,!0))),Mt(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),i=t.pendingProps,i.name!=null&&i.name!=="auto"?t.flags|=e===null?18882560:18874368:$e&&kd(t),e!==null&&e.memoizedProps.name!==i.name?t.flags|=4194816:to(e,t),Mt(e,t,i.children,a),t.child;case 29:throw t.pendingProps}throw Error(D(156,t.tag))}function Ln(e){e.flags|=4}function mh(e,t,a,i,r){var s;if((s=(e.mode&32)!==0)&&(s=a===null?xv(t,i):xv(t,i)&&(i.src!==a.src||i.srcSet!==a.srcSet)),s){if(e.flags|=16777216,(r&335544128)===r)if(e.stateNode.complete)e.flags|=8192;else if(Pw())e.flags|=8192;else throw lr=Wc,Wm}else e.flags&=-16777217}function Pb(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!$0(t))if(Pw())e.flags|=8192;else throw lr=Wc,Wm}function fc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Lv():536870912,e.lanes|=t,Ro|=t)}function Cs(e,t){if(!$e)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,i=null;a!==null;)a.alternate!==null&&(i=a),a=a.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function it(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,i=0;if(t)for(var r=e.child;r!==null;)a|=r.lanes|r.childLanes,i|=r.subtreeFlags&1206910976,i|=r.flags&1206910976,r.return=e,r=r.sibling;else for(r=e.child;r!==null;)a|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=e,r=r.sibling;return e.subtreeFlags|=i,e.childLanes=a,t}function yN(e,t,a){var i=t.pendingProps;switch(Km(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return it(t),null;case 1:return it(t),null;case 3:return a=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),Pn(Ct),Co(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Wr(t)?Ln(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,lh())),it(t),null;case 26:var r=t.type,s=t.memoizedState;return e===null?(Ln(t),s!==null?(it(t),Pb(t,s)):(it(t),mh(t,r,null,i,a))):s?s!==e.memoizedState?(Ln(t),it(t),Pb(t,s)):(it(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&Ln(t),it(t),mh(t,r,e,i,a)),null;case 27:if(Yc(t),a=Si.current,r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Ln(t);else{if(!i){if(t.stateNode===null)throw Error(D(166));return it(t),t.subtreeFlags&=-33554433,null}e=Sn.current,Wr(t)?wb(t,e):(e=b0(r,i,a),t.stateNode=e,Ln(t))}return it(t),t.subtreeFlags&=-33554433,null;case 5:if(Yc(t),r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Ln(t);else{if(!i){if(t.stateNode===null)throw Error(D(166));return it(t),t.subtreeFlags&=-33554433,null}if(s=Sn.current,Wr(t))wb(t,s);else{var c=ol(Si.current);switch(s){case 1:s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=c.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof i.is=="string"?c.createElement("select",{is:i.is}):c.createElement("select"),i.multiple?s.multiple=!0:i.size&&(s.size=i.size);break;default:s=typeof i.is=="string"?c.createElement(r,{is:i.is}):c.createElement(r)}}s[Yt]=t,s[wa]=i;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)s.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=s;e:switch(Zt(s,r,i),r){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}i&&Ln(t)}}return it(t),t.subtreeFlags&=-33554433,mh(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&Ln(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(D(166));if(e=Si.current,Wr(t)){if(e=t.stateNode,a=t.memoizedProps,i=null,r=jt,r!==null)switch(r.tag){case 27:case 5:i=r.memoizedProps}e[Yt]=t,e=!!(e.nodeValue===a||i!==null&&i.suppressHydrationWarning===!0||r0(e.nodeValue,a)),e||Di(t,!0)}else e=ol(e).createTextNode(i),e[Yt]=t,t.stateNode=e}return it(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(i=Wr(t),a!==null){if(e===null){if(!i)throw Error(D(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(D(557));e[Yt]=t}else dr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;it(t),e=!1}else a=lh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(Sa(t),t):(Sa(t),null);if((t.flags&128)!==0)throw Error(D(558))}return it(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(r=Wr(t),i!==null&&i.dehydrated!==null){if(e===null){if(!r)throw Error(D(318));if(r=t.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(D(317));r[Yt]=t}else dr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;it(t),r=!1}else r=lh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=r),r=!0;if(!r)return t.flags&256?(Sa(t),t):(Sa(t),null)}return Sa(t),(t.flags&128)!==0?(t.lanes=a,t):(a=i!==null,e=e!==null&&e.memoizedState!==null,a&&(i=t.child,r=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(r=i.alternate.memoizedState.cachePool.pool),s=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(s=i.memoizedState.cachePool.pool),s!==r&&(i.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),fc(t,t.updateQueue),it(t),null);case 4:return Co(),e===null&&Tp(t.stateNode.containerInfo),t.flags|=67108864,it(t),null;case 10:return Pn(t.type),it(t),null;case 19:if(ap(t),i=t.memoizedState,i===null)return it(t),null;if(r=(t.flags&128)!==0,s=i.rendering,s===null)if(r)Cs(i,!1);else{if(yt!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=td(e),s!==null){for(t.flags|=128,Cs(i,!1),e=s.updateQueue,t.updateQueue=e,fc(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)wy(a,e),a=a.sibling;return al(t,Qt.current&1|2),$e&&Gn(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&Ca()>ud&&(t.flags|=128,r=!0,Cs(i,!1),t.lanes=4194304)}else{if(!r)if(e=td(s),e!==null){if(t.flags|=128,r=!0,e=e.updateQueue,t.updateQueue=e,fc(t,e),Cs(i,!0),i.tail===null&&i.tailMode!=="collapsed"&&i.tailMode!=="visible"&&!s.alternate&&!$e)return it(t),null}else 2*Ca()-i.renderingStartTime>ud&&a!==536870912&&(t.flags|=128,r=!0,Cs(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(e=i.last,e!==null?e.sibling=s:t.child=s,i.last=s)}if(i.tail!==null){e=i.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return i.rendering=e,i.tail=e.sibling,i.renderingStartTime=Ca(),e.sibling=null,s=Qt.current,s=r?s&1|2:s&1,i.tailMode==="visible"||i.tailMode==="collapsed"||!a||$e?al(t,s):(a=s,ot(Kt,t),ot(Qt,a),na===null&&(na=t)),$e&&Gn(t,i.treeForkCount),e}return it(t),null;case 22:case 23:return Sa(t),tp(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(a&536870912)!==0&&(t.flags&128)===0&&(it(t),t.subtreeFlags&6&&(t.flags|=8192)):it(t),a=t.updateQueue,a!==null&&fc(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==a&&(t.flags|=2048),e!==null&&Pt(sr),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Pn(Ct),it(t),null;case 25:return null;case 30:return t.flags|=33554432,it(t),null}throw Error(D(156,t.tag))}function wN(e,t){switch(Km(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Pn(Ct),Co(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Yc(t),null;case 31:if(t.memoizedState!==null){if(Sa(t),t.alternate===null)throw Error(D(340));dr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Sa(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(D(340));dr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return ap(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Co(),null;case 10:return Pn(t.type),null;case 22:case 23:return Sa(t),tp(),e!==null&&Pt(sr),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Pn(Ct),null;case 25:return null;default:return null}}function yw(e,t){switch(Km(t),t.tag){case 3:Pn(Ct),Co();break;case 26:case 27:case 5:Yc(t);break;case 4:Co();break;case 31:t.memoizedState!==null&&Sa(t);break;case 13:Sa(t);break;case 19:ap(t);break;case 10:Pn(t.type);break;case 22:case 23:Sa(t),tp(),e!==null&&Pt(sr);break;case 24:Pn(Ct)}}function yl(e,t){try{var a=t.updateQueue,i=a!==null?a.lastEffect:null;if(i!==null){var r=i.next;a=r;do{if((a.tag&e)===e){i=void 0;var s=a.create,c=a.inst;i=s(),c.destroy=i}a=a.next}while(a!==r)}}catch(d){Xe(t,t.return,d)}}function _i(e,t,a){try{var i=t.updateQueue,r=i!==null?i.lastEffect:null;if(r!==null){var s=r.next;i=s;do{if((i.tag&e)===e){var c=i.inst,d=c.destroy;if(d!==void 0){c.destroy=void 0,r=t;var h=a,f=d;try{f()}catch(w){Xe(r,h,w)}}}i=i.next}while(i!==s)}}catch(w){Xe(t,t.return,w)}}function ww(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{zy(t,a)}catch(i){Xe(e,e.return,i)}}}function $w(e,t,a){a.props=fr(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(i){Xe(e,t,i)}}function vn(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:var r=e.stateNode,s=Zn(e.memoizedProps,r);(r.ref===null||r.ref.name!==s)&&(r.ref=u0(s)),i=r.ref;break;case 7:if(e.stateNode===null){var c=new Ma(e);ya(e.child,!1,l2,c,void 0,void 0),e.stateNode=c}i=e.stateNode;break;default:i=e.stateNode}typeof a=="function"?e.refCleanup=a(i):a.current=i}}catch(d){Xe(e,t,d)}}function Gt(e,t){var a=e.ref,i=e.refCleanup;if(a!==null)if(typeof i=="function")try{i()}catch(r){Xe(e,t,r)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(r){Xe(e,t,r)}else a.current=null}function od(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)g0(e.stateNode,t[a])}function Qb(e){for(var t=e.return;t!==null&&(yp(t)&&g0(e.stateNode,t.stateNode),!vp(t));)t=t.return}function Ys(e){for(var t=e.return;t!==null&&(yp(t)&&c2(e.stateNode,t.stateNode),!vp(t));)t=t.return}function vp(e){return e.tag===5||e.tag===3||e.tag===27}function yp(e){return e&&e.tag===7&&e.stateNode!==null}function lm(e){var t=e.type,a=e.memoizedProps,i=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&i.focus();break e;case"img":a.src?i.src=a.src:a.srcSet&&(i.srcset=a.srcSet)}}catch(r){Xe(e,e.return,r)}}function ph(e,t,a){try{var i=e.stateNode;GN(i,e.type,a,t),i[wa]=t}catch(r){Xe(e,e.return,r)}}function xw(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&qi(e.type)||e.tag===4}function gh(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||xw(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&qi(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function cm(e,t,a,i){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(r,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(r),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=$n)),od(e,i),Oe=!0;else if(r!==4&&(r===27&&(od(e,i),i=null,qi(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(cm(e,t,a,i),e=e.sibling;e!==null;)cm(e,t,a,i),e=e.sibling}function sd(e,t,a,i){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?a.insertBefore(r,t):a.appendChild(r),od(e,i),Oe=!0;else if(r!==4&&(r===27&&(od(e,i),i=null,qi(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(sd(e,t,a,i),e=e.sibling;e!==null;)sd(e,t,a,i),e=e.sibling}function Nw(e){var t=e.stateNode,a=e.memoizedProps;try{for(var i=e.type,r=t.attributes;r.length;)t.removeAttributeNode(r[0]);Zt(t,i,a),t[Yt]=e,t[wa]=a}catch(s){Xe(e,e.return,s)}}var ld=!1,ka=null;function Zb(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(ld=!0)}var yn=null;function Kb(){var e=yn;return yn=null,e}var fa=0;function Lo(e,t,a,i,r){return fa=0,Sw(e.child,t,a,i,r)}function Sw(e,t,a,i,r){for(var s=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(i!==null){var d=Am(c);i.push(d),d.view&&(s=!0)}else s||Am(c).view&&(s=!0);ld=!0,l0(c,fa===0?t:t+"_"+fa,a),fa++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&r||Sw(e.child,t,a,i,r)&&(s=!0));e=e.sibling}return s}function Tn(e,t){for(;e!==null;)e.tag===5?c0(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||Tn(e.child,t)),e=e.sibling}function Vc(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Vc(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(D(544));var a=t.name;t=ti(t.default,t.share),t!=="none"&&(Lo(e,a,t,null,!1)||Tn(e.child,!1))}e=e.sibling}}function dm(e,t){if(e.tag===30){var a=e.stateNode,i=e.memoizedProps,r=Zn(i,a),s=ti(i.default,a.paired?i.share:i.enter);s!=="none"?Lo(e,r,s,null,!1)?(Vc(e),a.paired||t||Mo(e,i.onEnter)):Tn(e.child,!1):Vc(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)dm(e,t),e=e.sibling;else Vc(e)}function um(e){if(ka!==null&&ka.size!==0){var t=ka;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,i=a.name;if(i!=null&&i!=="auto"){var r=t.get(i);if(r!==void 0){var s=ti(a.default,a.share);if(s!=="none"&&(Lo(e,i,s,null,!1)?(s=e.stateNode,r.paired=s,s.paired=r,Mo(e,a.onShare)):Tn(e.child,!1)),t.delete(i),t.size===0)break}}}um(e)}e=e.sibling}}}function hm(e){if(e.tag===30){var t=e.memoizedProps,a=Zn(t,e.stateNode),i=ka!==null?ka.get(a):void 0,r=ti(t.default,i!==void 0?t.share:t.exit);r!=="none"&&(Lo(e,a,r,null,!1)?i!==void 0?(r=e.stateNode,i.paired=r,r.paired=i,ka.delete(a),Mo(e,t.onShare)):Mo(e,t.onExit):Tn(e.child,!1)),ka!==null&&um(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)hm(e),e=e.sibling;else ka!==null&&um(e)}function kw(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=Zn(t,e.stateNode);t=ti(t.default,t.update),e.flags&=-5,t!=="none"&&Lo(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&kw(e);e=e.sibling}}function mm(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,Tn(e.child,!1))}mm(e)}e=e.sibling}}function Dc(e){if(e.tag===30)e.stateNode.paired=null,Tn(e.child,!1),mm(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Dc(e),e=e.sibling;else mm(e)}function Tw(e){for(e=e.child;e!==null;)e.tag===30?Tn(e.child,!1):(e.subtreeFlags&33554432)!==0&&Tw(e),e=e.sibling}function wp(e,t,a,i,r,s,c){for(var d=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(s!==null&&fa<s.length){var f=s[fa],w=Am(h);(f.view||w.view)&&(d=!0);var N;if(N=(e.flags&4)===0)if(w.clip)N=!0;else{N=f.rect;var p=w.rect;N=N.y!==p.y||N.x!==p.x||N.height!==p.height||N.width!==p.width}N&&(e.flags|=4),w.abs?w=!f.abs:(f=f.rect,w=w.rect,w=f.height!==w.height||f.width!==w.width),w&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&l0(h,fa===0?a:a+"_"+fa,r),d&&(e.flags&4)!==0||(yn===null&&(yn=[]),yn.push(h,fa===0?i:i+"_"+fa,t.memoizedProps)),fa++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:wp(e,t.child,a,i,r,s,c)&&(d=!0));t=t.sibling}return d}function Cw(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,i=e.stateNode,r=Zn(a,i),s=ti(a.default,a.update);if(t){i=i.clones;var c=i===null?null:i.map(KN)}else c=e.memoizedState,e.memoizedState=null;i=e;var d=e.child;fa=0,r=wp(i,d,r,r,s,c,!1),(e.flags&4)!==0&&r&&(t||Mo(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&Cw(e,t);e=e.sibling}}var Ut=!1,Be=!1,gn=!1,fh=!1,Jb=typeof WeakSet=="function"?WeakSet:Set,qt=null,fn=!1,Ds=!1,cd=!1,pm=!1;function $N(e,t,a){if(e=e.containerInfo,Tm=Ho,e=hy(e),Xm(e)){if("selectionStart"in e)var i={start:e.selectionStart,end:e.selectionEnd};else e:{i=(i=e.ownerDocument)&&i.defaultView||window;var r=i.getSelection&&i.getSelection();if(r&&r.rangeCount!==0){i=r.anchorNode;var s=r.anchorOffset,c=r.focusNode;r=r.focusOffset;try{i.nodeType,c.nodeType}catch{i=null;break e}var d=0,h=-1,f=-1,w=0,N=0,p=e,b=null;t:for(;;){for(var R;p!==i||s!==0&&p.nodeType!==3||(h=d+s),p!==c||r!==0&&p.nodeType!==3||(f=d+r),p.nodeType===3&&(d+=p.nodeValue.length),(R=p.firstChild)!==null;)b=p,p=R;for(;;){if(p===e)break t;if(b===i&&++w===s&&(h=d),b===c&&++N===r&&(f=d),(R=p.nextSibling)!==null)break;p=b,b=p.parentNode}p=R}i=h===-1||f===-1?null:{start:h,end:f}}else i=null}i=i||{start:0,end:0}}else i=null;for(Cm={focusedElem:e,selectionRange:i},Ho=!1,a=(a&335544064)===a,qt=t,t=a?9270:1024;qt!==null;){if(e=qt,a&&(i=e.deletions,i!==null))for(s=0;s<i.length;s++)a&&hm(i[s]);if(e.alternate===null&&(e.flags&2)!==0)a&&Zb(e),bc(a);else{if(e.tag===22){if(i=e.alternate,e.memoizedState!==null){i!==null&&i.memoizedState===null&&a&&hm(i),bc(a);continue}else if(i!==null&&i.memoizedState!==null){a&&Zb(e),bc(a);continue}}i=e.child,(e.subtreeFlags&t)!==0&&i!==null?(i.return=e,qt=i):(a&&kw(e),bc(a))}}ka=null}function bc(e){for(;qt!==null;){var t=qt,a=e,i=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((r&1024)!==0&&i!==null){a=void 0,r=i.memoizedProps,i=i.memoizedState;var s=t.stateNode;try{var c=fr(t.type,r);a=s.getSnapshotBeforeUpdate(c,i),s.__reactInternalSnapshotBeforeUpdate=a}catch(d){Xe(t,t.return,d)}}break;case 3:if((r&1024)!==0){if(i=t.stateNode.containerInfo,a=i.nodeType,a===9)zm(i);else if(a===1)switch(i.nodeName){case"HEAD":case"HTML":case"BODY":zm(i);break;default:i.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&i!==null&&(a=Zn(i.memoizedProps,i.stateNode),r=t.memoizedProps,r=ti(r.default,r.update),r!=="none"&&Lo(i,a,r,i.memoizedState=[],!0));break;default:if((r&1024)!==0)throw Error(D(163))}if(i=t.sibling,i!==null){i.return=t.return,qt=i;break}qt=t.return}}function Ew(e,t,a){var i=a.flags;switch(a.tag){case 0:case 11:case 15:bn(e,a),i&4&&yl(5,a);break;case 1:if(bn(e,a),i&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){Xe(a,a.return,c)}else{var r=fr(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(r,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){Xe(a,a.return,c)}}i&64&&ww(a),i&512&&vn(a,a.return);break;case 3:if(bn(e,a),i&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{zy(e,t)}catch(c){Xe(a,a.return,c)}}break;case 27:t===null&&i&4&&Nw(a);case 26:case 5:bn(e,a),t===null&&i&4&&lm(a),i&512&&vn(a,a.return);break;case 12:bn(e,a);break;case 31:bn(e,a),i&4&&Mw(e,a);break;case 13:bn(e,a),i&4&&Ow(e,a),i&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=ON.bind(null,a),h2(e,a))));break;case 22:if(i=a.memoizedState!==null||Ut,!i){var s=t!==null&&t.memoizedState!==null||Be;t=Ut,r=Be,Ut=i,(Be=s)&&!r?(i=2,(a.subtreeFlags&8772)!==0&&(i|=1),an(e,a,i)):bn(e,a),Ut=t,Be=r}break;case 30:bn(e,a),i&512&&vn(a,a.return);break;case 7:i&512&&vn(a,a.return);default:bn(e,a)}}function gm(e,t){for(e=e.child;e!==null;)Aw(e,t),e=e.sibling}function Aw(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var i=a.style;typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"}else{var r=e.stateNode,s=e.memoizedProps.style,c=s!=null&&s.hasOwnProperty("display")?s.display:null;r.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){Xe(e,e.return,h)}fm(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,Oe=!0}catch(h){Xe(e,e.return,h)}break;case 18:try{var d=e.stateNode;t?mv(d,!0):mv(e.stateNode,!1)}catch(h){Xe(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&gm(e,t);break;default:gm(e,t)}}function fm(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,i=t;switch(a.tag){case 4:Aw(a,i);break e;case 22:a.memoizedState===null&&fm(a,i);break e;default:fm(a,i)}}e=e.sibling}}function zw(e){var t=e.alternate;t!==null&&(e.alternate=null,zw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&yd(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var ht=null,pa=!1;function tn(e,t,a){for(a=a.child;a!==null;)Rw(e,t,a),a=a.sibling}function Rw(e,t,a){if(Ea&&typeof Ea.onCommitFiberUnmount=="function")try{Ea.onCommitFiberUnmount(hl,a)}catch{}switch(a.tag){case 26:Be||Gt(a,t),tn(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!Be&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Be||Gt(a,t),Ys(a);var i=ht,r=pa;qi(a.type)&&(ht=a.stateNode,pa=!1),tn(e,t,a),v0(a.stateNode,a.type,a.memoizedProps),ht=i,pa=r;break;case 5:Be||Gt(a,t),Ys(a);case 6:if(a.tag===6&&Ys(a),i=ht,r=pa,ht=null,tn(e,t,a),ht=i,pa=r,ht!==null)if(pa)try{(ht.nodeType===9?ht.body:ht.nodeName==="HTML"?ht.ownerDocument.body:ht).removeChild(a.stateNode),Oe=!0}catch(s){Xe(a,t,s)}else try{ht.removeChild(a.stateNode),Oe=!0}catch(s){Xe(a,t,s)}break;case 18:ht!==null&&(pa?(e=ht,hv(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),Uo(e)):hv(ht,a.stateNode));break;case 4:i=ht,r=pa,ht=a.stateNode.containerInfo,pa=!0,tn(e,t,a),ht=i,pa=r;break;case 0:case 11:case 14:case 15:_i(2,a,t),Be||_i(4,a,t),tn(e,t,a);break;case 1:Be||(Gt(a,t),i=a.stateNode,typeof i.componentWillUnmount=="function"&&$w(a,t,i)),tn(e,t,a);break;case 21:tn(e,t,a);break;case 22:Be=(i=Be)||a.memoizedState!==null,tn(e,t,a),Be=i;break;case 30:Gt(a,t),tn(e,t,a);break;case 7:Be||Gt(a,t),tn(e,t,a);break;default:tn(e,t,a)}}function Mw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Uo(e)}catch(a){Xe(t,t.return,a)}}}function Ow(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Uo(e)}catch(a){Xe(t,t.return,a)}}function xN(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Jb),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Jb),t;default:throw Error(D(435,e.tag))}}function vc(e,t){var a=xN(e);t.forEach(function(i){if(!a.has(i)){a.add(i);var r=VN.bind(null,e,i);i.then(r,r)}})}function ca(e,t,a){var i=t.deletions;if(i!==null)for(var r=0;r<i.length;r++){var s=i[r],c=e,d=t,h=d;e:for(;h!==null;){switch(h.tag){case 27:if(qi(h.type)){ht=h.stateNode,pa=!1;break e}break;case 5:ht=h.stateNode,pa=!1;break e;case 3:case 4:ht=h.stateNode.containerInfo,pa=!0;break e}h=h.return}if(ht===null)throw Error(D(160));Rw(c,d,s),ht=null,pa=!1,c=s.alternate,c!==null&&(c.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Vw(t,e,a),t=t.sibling}var nn=null;function Vw(e,t,a){var i=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(r&4&&(i=e.updateQueue,i=i!==null?i.events:null,i!==null))for(var s=0;s<i.length;s++){var c=i[s];c.ref.impl=c.nextImpl}ca(t,e,a),da(e),r&4&&(_i(3,e,e.return),yl(3,e),_i(5,e,e.return));break;case 1:ca(t,e,a),da(e),r&512&&(Be||i===null||Gt(i,i.return)),r&64&&Ut&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(s=nn,ca(t,e,a),da(e),r&512&&(Be||i===null||Gt(i,i.return)),r&4)if(r=i!==null?i.memoizedState:null,a=e.memoizedState,i===null)if(a===null)if(e.stateNode===null)if(Ut)e.stateNode=s0(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,r=s.ownerDocument||s;t:switch(t){case"title":i=r.getElementsByTagName("title")[0],(!i||i[gl]||i[Yt]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=r.createElement(t),r.head.insertBefore(i,r.querySelector("head > title"))),Zt(i,t,a),i[Yt]=e,Bt(i),t=i;break e;case"link":if(s=$v("link","href",r).get(t+(a.href||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&i.getAttribute("rel")===(a.rel==null?null:a.rel)&&i.getAttribute("title")===(a.title==null?null:a.title)&&i.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(c,1);break t}}i=r.createElement(t),Zt(i,t,a),r.head.appendChild(i);break;case"meta":if(s=$v("meta","content",r).get(t+(a.content||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("content")===(a.content==null?null:""+a.content)&&i.getAttribute("name")===(a.name==null?null:a.name)&&i.getAttribute("property")===(a.property==null?null:a.property)&&i.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&i.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(c,1);break t}}i=r.createElement(t),Zt(i,t,a),r.head.appendChild(i);break;default:throw Error(D(468,t))}i[Yt]=e,Bt(i),t=i}e.stateNode=t}else Ut||Om(s,e.type,e.stateNode);else e.stateNode=wv(s,a,e.memoizedProps);else r!==a?(r===null?(t=i.stateNode,t===null||Be||t.parentNode.removeChild(t)):r.count--,a===null?Ut||Om(s,e.type,e.stateNode):wv(s,a,e.memoizedProps)):a===null&&e.stateNode!==null&&ph(e,e.memoizedProps,i.memoizedProps);break;case 27:ca(t,e,a),da(e),r&512&&(Be||i===null||Gt(i,i.return)),i!==null&&r&4&&ph(e,e.memoizedProps,i.memoizedProps);break;case 5:if(s=gn,gn=!1,ca(t,e,a),gn=s,da(e),r&512&&(Be||i===null||Gt(i,i.return)),e.flags&32){t=e.stateNode;try{Ao(t,""),Oe=!0}catch(w){Xe(e,e.return,w)}}r&4&&e.stateNode!=null&&(t=e.memoizedProps,ph(e,t,i!==null?i.memoizedProps:t)),r&1024&&(fh=!0);break;case 6:if(ca(t,e,a),da(e),r&4){if(e.stateNode===null)throw Error(D(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,Oe=!0}catch(w){Xe(e,e.return,w)}}break;case 3:if(Oe=!1,Uc=null,s=nn,nn=sl(t.containerInfo),ca(t,e,a),nn=s,da(e),r&4&&i!==null&&i.memoizedState.isDehydrated)try{Uo(t.containerInfo)}catch(w){Xe(e,e.return,w)}fh&&(fh=!1,Dw(e)),Oe=!1;break;case 4:r=gn,gn=Ut,i=nb(),s=nn,nn=sl(e.stateNode.containerInfo),ca(t,e,a),da(e),nn=s,Oe&&Ds&&(cd=!0),Oe=i,gn=r;break;case 12:ca(t,e,a),da(e);break;case 31:ca(t,e,a),da(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,vc(e,t)));break;case 13:ca(t,e,a),da(e),e.child.flags&8192&&e.memoizedState!==null!=(i!==null&&i.memoizedState!==null)&&(Md=Ca()),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,vc(e,t)));break;case 22:s=e.memoizedState!==null,c=i!==null&&i.memoizedState!==null;var d=Ut,h=Be,f=gn;Ut=d||s,gn=f||s,Be=h||c,ca(t,e,a),Be=h,gn=f,Ut=d,da(e),r&8192&&(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,!s||i===null||c||Ut||Be||(t=c||Be,a=Ut,i=Be,Ut=s||Ut,Be=t,pi(e,2),Ut=a,Be=i),!s&&gn||gm(e,s)),r&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,vc(e,a))));break;case 19:ca(t,e,a),da(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,vc(e,t)));break;case 30:r&512&&(Be||i===null||Gt(i,i.return)),r=nb(),s=Ds,c=(a&335544064)===a,d=e.memoizedProps,Ds=c&&ti(d.default,d.update)!=="none",ca(t,e,a),da(e),c&&i!==null&&Oe&&(e.flags|=4),Ds=s,Oe=r;break;case 21:break;case 7:r&512&&(Be||i===null||Gt(i,i.return)),i&&i.stateNode!==null&&(i.stateNode._fragmentFiber=e);default:ca(t,e,a),da(e)}}function da(e){var t=e.flags;if(t&2){try{for(var a,i=e.return;i!==null;){if(xw(i)){a=i;break}i=i.return}i=null;for(var r=e.return;r!==null;){if(yp(r)){var s=r.stateNode;i===null?i=[s]:i.push(s)}if(vp(r))break;r=r.return}var c=i;if(a==null)throw Error(D(160));switch(a.tag){case 27:var d=a.stateNode,h=gh(e);sd(e,h,d,c);break;case 5:var f=a.stateNode;a.flags&32&&(Ao(f,""),a.flags&=-33);var w=gh(e);sd(e,w,f,c);break;case 3:case 4:var N=a.stateNode.containerInfo,p=gh(e);cm(e,p,N,c);break;default:throw Error(D(161))}}catch(b){Xe(e,e.return,b)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Dw(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Dw(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,Ho=!0,t.reset(),Ho=!1),e=e.sibling}}function eo(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)Iw(t,e),t=t.sibling;else Cw(t,!1)}function Iw(e,t){var a=e.alternate;if(a===null)dm(e,!1);else switch(e.tag){case 3:if(pm=fn=!1,Kb(),eo(t,e),!fn&&!cd){if(e=yn,e!==null)for(var i=0;i<e.length;i+=3){a=e[i];var r=e[i+1];c0(a,e[i+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+r+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),pm=!0}yn=null;break;case 5:eo(t,e);break;case 4:i=fn,fn=!1,eo(t,e),fn&&(cd=!0),fn=i;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?dm(e,!1):eo(t,e));break;case 30:i=fn,r=Kb(),fn=!1,eo(t,e),fn&&(e.flags|=4);var s=e.memoizedProps,c=e.stateNode;t=Zn(s,c),c=Zn(a.memoizedProps,c);var d=ti(s.default,s.update);d==="none"?t=!1:(s=a.memoizedState,a.memoizedState=null,a=e.child,fa=0,t=wp(e,a,t,c,d,s,!0),fa!==(s===null?0:s.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(Mo(e,e.memoizedProps.onUpdate),yn=r):r!==null&&(r.push.apply(r,yn),yn=r),fn=(e.flags&32)!==0?!0:i;break;default:eo(t,e)}}function bn(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Ew(e,t.alternate,t),t=t.sibling}function pi(e,t){for(e=e.child;e!==null;){var a=e,i=t;switch(a.tag){case 0:case 11:case 14:case 15:_i(4,a,a.return),pi(a,i);break;case 1:Gt(a,a.return);var r=a.stateNode;typeof r.componentWillUnmount=="function"&&$w(a,a.return,r),pi(a,i);break;case 27:(i&2)!==0&&v0(a.stateNode,a.type,a.memoizedProps);case 5:Gt(a,a.return),a.tag!==5&&a.tag!==27||Ys(a),pi(a,i);break;case 6:Ys(a);break;case 26:Gt(a,a.return),r=a.stateNode,a.memoizedState!==null||r===null||Be||r.parentNode.removeChild(r),pi(a,i);break;case 22:a.memoizedState===null&&pi(a,i);break;case 30:Gt(a,a.return),pi(a,i);break;case 7:Gt(a,a.return);default:pi(a,i)}e=e.sibling}}function an(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var i=t.alternate,r=e,s=t,c=s.flags,d=(a&1)!==0;switch(s.tag){case 0:case 11:case 15:an(r,s,a),yl(4,s);break;case 1:if(an(r,s,a),i=s,r=i.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(w){Xe(i,i.return,w)}if(i=s,r=i.updateQueue,r!==null){var h=i.stateNode;try{var f=r.shared.hiddenCallbacks;if(f!==null)for(r.shared.hiddenCallbacks=null,r=0;r<f.length;r++)Ay(f[r],h)}catch(w){Xe(i,i.return,w)}}d&&c&64&&ww(s),vn(s,s.return);break;case 27:(a&2)!==0&&Nw(s);case 5:s.tag!==5&&s.tag!==27||Qb(s),an(r,s,a),d&&i===null&&c&4&&lm(s),vn(s,s.return);break;case 6:Qb(s);break;case 26:h=s.stateNode,s.memoizedState!==null||h===null||Ut||Om(sl(h.ownerDocument),s.type,h),an(r,s,a),d&&i===null&&c&4&&lm(s),vn(s,s.return);break;case 12:an(r,s,a);break;case 31:an(r,s,a),d&&c&4&&Mw(r,s);break;case 13:an(r,s,a),d&&c&4&&Ow(r,s);break;case 22:s.memoizedState===null&&an(r,s,a),vn(s,s.return);break;case 30:an(r,s,a),vn(s,s.return);break;case 7:vn(s,s.return);default:an(r,s,a)}t=t.sibling}}function $p(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&bl(a))}function xp(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&bl(e))}function Ua(e,t,a,i){var r=(a&335544064)===a;if(t.subtreeFlags&(r?10262:10256))for(t=t.child;t!==null;)_w(e,t,a,i),t=t.sibling;else r&&Tw(t)}function _w(e,t,a,i){var r=(a&335544064)===a;r&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&Dc(t);var s=t.flags;switch(t.tag){case 0:case 11:case 15:Ua(e,t,a,i),s&2048&&yl(9,t);break;case 1:Ua(e,t,a,i);break;case 3:Ua(e,t,a,i),r&&pm&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),s&2048&&(s=null,t.alternate!==null&&(s=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==s&&(t.refCount++,s!=null&&bl(s)));break;case 12:if(s&2048){Ua(e,t,a,i),s=t.stateNode;try{var c=t.memoizedProps,d=c.id,h=c.onPostCommit;typeof h=="function"&&h(d,t.alternate===null?"mount":"update",s.passiveEffectDuration,-0)}catch(f){Xe(t,t.return,f)}}else Ua(e,t,a,i);break;case 31:Ua(e,t,a,i);break;case 13:Ua(e,t,a,i);break;case 23:break;case 22:c=t.stateNode,d=t.alternate,t.memoizedState!==null?(r&&d!==null&&d.memoizedState===null&&Dc(d),c._visibility&2?Ua(e,t,a,i):Xs(e,t)):(r&&d!==null&&d.memoizedState!==null&&Dc(t),c._visibility&2?Ua(e,t,a,i):(c._visibility|=2,ao(e,t,a,i,(t.subtreeFlags&10256)!==0||!1))),s&2048&&$p(d,t);break;case 24:Ua(e,t,a,i),s&2048&&xp(t.alternate,t);break;case 30:r&&(s=t.alternate,s!==null&&(Tn(s.child,!0),Tn(t.child,!0))),Ua(e,t,a,i);break;default:Ua(e,t,a,i)}}function ao(e,t,a,i,r){for(r=r&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var s=e,c=t,d=a,h=i,f=c.flags;switch(c.tag){case 0:case 11:case 15:ao(s,c,d,h,r),yl(8,c);break;case 23:break;case 22:var w=c.stateNode;c.memoizedState!==null?w._visibility&2?ao(s,c,d,h,r):Xs(s,c):(w._visibility|=2,ao(s,c,d,h,r)),r&&f&2048&&$p(c.alternate,c);break;case 24:ao(s,c,d,h,r),r&&f&2048&&xp(c.alternate,c);break;default:ao(s,c,d,h,r)}t=t.sibling}}function Xs(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,i=t,r=i.flags;switch(i.tag){case 22:Xs(a,i),r&2048&&$p(i.alternate,i);break;case 24:Xs(a,i),r&2048&&xp(i.alternate,i);break;default:Xs(a,i)}t=t.sibling}}var ar=8192;function Wi(e,t,a){if(e.subtreeFlags&ar)for(e=e.child;e!==null;)Hw(e,t,a),e=e.sibling}function Hw(e,t,a){switch(e.tag){case 26:Wi(e,t,a),e.flags&ar&&(e.memoizedState!==null?T2(a,nn,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Nv(a,e)));break;case 5:Wi(e,t,a),e.flags&ar&&(e=e.stateNode,(t&335544128)===t&&Nv(a,e));break;case 3:case 4:var i=nn;nn=sl(e.stateNode.containerInfo),Wi(e,t,a),nn=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=ar,ar=16777216,Wi(e,t,a),ar=i):Wi(e,t,a));break;case 30:if((e.flags&ar)!==0&&(i=e.memoizedProps.name,i!=null&&i!=="auto")){var r=e.stateNode;r.paired=null,ka===null&&(ka=new Map),ka.set(i,r)}Wi(e,t,a);break;default:Wi(e,t,a)}}function Uw(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Es(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];qt=i,Bw(i,e)}Uw(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)qw(e),e=e.sibling}function qw(e){switch(e.tag){case 0:case 11:case 15:Es(e),e.flags&2048&&_i(9,e,e.return);break;case 3:Es(e);break;case 12:Es(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Ic(e)):Es(e);break;default:Es(e)}}function Ic(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];qt=i,Bw(i,e)}Uw(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:_i(8,t,t.return),Ic(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Ic(t));break;default:Ic(t)}e=e.sibling}}function Bw(e,t){for(;qt!==null;){var a=qt;switch(a.tag){case 0:case 11:case 15:_i(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var i=a.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:bl(a.memoizedState.cache)}if(i=a.child,i!==null)i.return=a,qt=i;else e:for(a=e;qt!==null;){i=qt;var r=i.sibling,s=i.return;if(zw(i),i===a){qt=null;break e}if(r!==null){r.return=s,qt=r;break e}qt=s}}}var NN={getCacheForType:function(e){var t=Xt(Ct),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return Xt(Ct).controller.signal}},SN=typeof WeakMap=="function"?WeakMap:Map,De=0,Je=null,ke=null,Te=0,Ge=0,xa=null,$i=!1,Go=!1,Np=!1,Wn=0,yt=0,Hi=0,cr=0,dd=0,Ta=0,Ro=0,Ps=null,ga=null,bm=!1,Md=0,jw=0,ud=1/0,hd=null,zi=null,ft=0,on=null,br=null,kn=0,vm=0,ym=null,Lw=null,So=null,ko=null,To=null,Qs=0,_c=null;function za(){return(De&2)!==0&&Te!==0?Te&-Te:re.T!==null?kp():Pv()}function Gw(){if(Ta===0)if((Te&536870912)===0||$e){var e=rc;rc<<=1,(rc&3932160)===0&&(rc=262144),Ta=e}else Ta=536870912;return e=Kt.current,e!==null&&(e.flags|=32),Ta}function Mo(e,t){if(t!=null){var a=e.stateNode,i=a.ref;i===null&&(i=a.ref=u0(Zn(e.memoizedProps,a))),ko===null&&(ko=[]),ko.push(t.bind(null,i))}}function va(e,t,a){(e===Je&&(Ge===2||Ge===9)||e.cancelPendingCommit!==null)&&(Oo(e,0),xi(e,Te,Ta,!1)),pl(e,a),((De&2)===0||e!==Je)&&(e===Je&&((De&2)===0&&(cr|=a),yt===4&&xi(e,Te,Ta,!1)),En(e))}function Yw(e,t,a){if((De&6)!==0)throw Error(D(327));var i=!a&&(t&127)===0&&(t&e.expiredLanes)===0||ml(e,t),r=i?CN(e,t):bh(e,t,!0),s=i;do{if(r===0){Go&&!i&&xi(e,t,0,!1);break}else{if(a=e.current.alternate,s&&!kN(a)){r=bh(e,t,!1),s=!1;continue}if(r===2){if(s=t,e.errorRecoveryDisabledLanes&s)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var d=e;r=Ps;var h=d.current.memoizedState.isDehydrated;if(h&&(Oo(d,c).flags|=256),c=bh(d,c,!1),c!==2&&c!==6){if(Np&&!h){d.errorRecoveryDisabledLanes|=s,cr|=s,r=4;break e}s=ga,ga=r,s!==null&&(ga===null?ga=s:ga.push.apply(ga,s))}r=c}if(s=!1,r!==2)continue}}if(r===1){Oo(e,0),xi(e,t,0,!0);break}e:{switch(i=e,s=r,s){case 0:case 1:throw Error(D(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:xi(i,t,Ta,!$i);break e;case 2:ga=null;break;case 3:case 5:break;default:throw Error(D(329))}if((t&62914560)===t&&(r=Md+300-Ca(),10<r)){if(xi(i,t,Ta,!$i),vd(i,0,!0)!==0)break e;kn=t,i.timeoutHandle=Cp(Fb.bind(null,i,a,ga,hd,bm,t,Ta,cr,Ro,$i,s,"Throttled",-0,0),r);break e}Fb(i,a,ga,hd,bm,t,Ta,cr,Ro,$i,s,null,-0,0)}}break}while(!0);En(e)}function Fb(e,t,a,i,r,s,c,d,h,f,w,N,p,b){e.timeoutHandle=-1;var R=t.subtreeFlags,O=(s&335544064)===s;if(N=null,(O||R&8192||(R&16785408)===16785408)&&(N={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:$n},ka=null,Hw(t,s,N),O&&(R=N,O=e.containerInfo,O=(O.nodeType===9?O:O.ownerDocument).__reactViewTransition,O!=null&&(R.count++,R.waitingForViewTransition=!0,R=ll.bind(R),O.finished.then(R,R))),R=(s&62914560)===s?Md-Ca():(s&4194048)===s?jw-Ca():0,R=C2(N,R),R!==null)){kn=s,e.cancelPendingCommit=R(ev.bind(null,e,t,s,a,i,r,c,d,h,f,w,N,null,p,b)),xi(e,s,c,!f);return}ev(e,t,s,a,i,r,c,d,h,f,w,N)}function kN(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var i=0;i<a.length;i++){var r=a[i],s=r.getSnapshot;r=r.value;try{if(!Ra(s(),r))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function xi(e,t,a,i){t=jv(e,t),t&=~dd,t&=~cr,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var r=t;0<r;){var s=31-Aa(r),c=1<<s;i[s]=-1,r&=~c}a!==0&&Gv(e,a,t)}function Od(){return(De&6)===0?(wl(0,!1),!1):!0}function Sp(){if(ke!==null){if(Ge===0)var e=ke.return;else e=ke,Yn=xr=null,sp(e),$o=null,tl=0,e=ke;for(;e!==null;)yw(e.alternate,e),e=e.return;ke=null}}function Oo(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,PN(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),kn=0,Sp(),Je=e,ke=a=Xn(e.current,null),Te=t,Ge=0,xa=null,$i=!1,Go=ml(e,t),Np=!1,Ro=Ta=dd=cr=Hi=yt=0,ga=Ps=null,bm=!1,Wn=jv(e,t),Nd(),a}function Xw(e,t){be=null,re.H=id,t===jo||t===Td?(t=kb(),Ge=3):t===Wm?(t=kb(),Ge=4):Ge=t===gp?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,xa=t,ke===null&&(yt=1,rd(e,Ga(t,e.current)))}function Pw(){var e=Kt.current;return e===null?!0:(Te&4194048)===Te?na===null:(Te&62914560)===Te||(Te&536870912)!==0?e===na:!1}function Qw(){var e=re.H;return re.H=id,e===null?id:e}function Zw(){var e=re.A;return re.A=NN,e}function md(){yt=4,$i||(Te&4194048)!==Te&&Kt.current!==null||(Go=!0),(Hi&134217727)===0&&(cr&134217727)===0||Je===null||xi(Je,Te,Ta,!1)}function bh(e,t,a){var i=De;De|=2;var r=Qw(),s=Zw();(Je!==e||Te!==t)&&(hd=null,Oo(e,t)),t=!1;var c=yt;e:do try{if(Ge!==0&&ke!==null){var d=ke,h=xa;switch(Ge){case 8:Sp(),c=6;break e;case 3:case 2:case 9:case 6:Kt.current===null&&(t=!0);var f=Ge;if(Ge=0,xa=null,fo(e,d,h,f),a&&Go){c=0;break e}break;default:f=Ge,Ge=0,xa=null,fo(e,d,h,f)}}TN(),c=yt;break}catch(w){Xw(e,w)}while(!0);return t&&e.shellSuspendCounter++,Yn=xr=null,De=i,re.H=r,re.A=s,ke===null&&(Je=null,Te=0,Nd()),c}function TN(){for(;ke!==null;)Kw(ke)}function CN(e,t){var a=De;De|=2;var i=Qw(),r=Zw();Je!==e||Te!==t?(hd=null,ud=Ca()+500,Oo(e,t)):Go=ml(e,t);e:do try{if(Ge!==0&&ke!==null){t=ke;var s=xa;t:switch(Ge){case 1:Ge=0,xa=null,fo(e,t,s,1);break;case 2:case 9:if(Sb(s)){Ge=0,xa=null,Wb(t);break}t=function(){Ge!==2&&Ge!==9||Je!==e||(Ge=7),En(e)},s.then(t,t);break e;case 3:Ge=7;break e;case 4:Ge=5;break e;case 7:Sb(s)?(Ge=0,xa=null,Wb(t)):(Ge=0,xa=null,fo(e,t,s,7));break;case 5:var c=null;switch(ke.tag){case 26:c=ke.memoizedState;case 5:case 27:var d=ke;if(c?$0(c):d.stateNode.complete){Ge=0,xa=null;var h=d.sibling;if(h!==null)ke=h;else{var f=d.return;f!==null?(ke=f,Vd(f)):ke=null}break t}}Ge=0,xa=null,fo(e,t,s,5);break;case 6:Ge=0,xa=null,fo(e,t,s,6);break;case 8:Sp(),yt=6;break e;default:throw Error(D(462))}}EN();break}catch(w){Xw(e,w)}while(!0);return Yn=xr=null,re.H=i,re.A=r,De=a,ke!==null?0:(Je=null,Te=0,Nd(),yt)}function EN(){for(;ke!==null&&!Yx();)Kw(ke)}function Kw(e){var t=vw(e.alternate,e,Wn);e.memoizedProps=e.pendingProps,t===null?Vd(e):ke=t}function Wb(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=Bb(a,t,t.pendingProps,t.type,void 0,Te);break;case 11:t=Bb(a,t,t.pendingProps,t.type.render,t.ref,Te);break;case 5:sp(t);var i=t;i===jt&&($e?(Jc(i),i.tag===5&&i.stateNode!=null&&(rt=i.stateNode)):(Jc(i),$e=!0));default:yw(a,t),t=ke=wy(t,Wn),t=vw(a,t,Wn)}e.memoizedProps=e.pendingProps,t===null?Vd(e):ke=t}function fo(e,t,a,i){Yn=xr=null,sp(t),$o=null,tl=0;var r=t.return;try{if(gN(e,r,t,a,Te)){yt=1,rd(e,Ga(a,e.current)),ke=null;return}}catch(s){if(r!==null)throw ke=r,s;yt=1,rd(e,Ga(a,e.current)),ke=null;return}t.flags&32768?($e||i===1?e=!0:Go||(Te&536870912)!==0?e=!1:($i=e=!0,(i===2||i===9||i===3||i===6)&&(i=Kt.current,i!==null&&i.tag===13&&(i.flags|=16384))),Jw(t,e)):Vd(t)}function Vd(e){var t=e;do{if((t.flags&32768)!==0){Jw(t,$i);return}e=t.return;var a=yN(t.alternate,t,Wn);if(a!==null){ke=a;return}if(t=t.sibling,t!==null){ke=t;return}ke=t=e}while(t!==null);yt===0&&(yt=5)}function Jw(e,t){do{var a=wN(e.alternate,e);if(a!==null){a.flags&=32767,ke=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){ke=e;return}ke=e=a}while(e!==null);yt=6,ke=null}function ev(e,t,a,i,r,s,c,d,h,f,w,N){e.cancelPendingCommit=null;do Dd();while(ft!==0);if((De&6)!==0)throw Error(D(327));if(t!==null){if(t===e.current)throw Error(D(177));e===Je&&(ke=Je=null,Te=0),br=t,on=e,kn=a,ym=r,Lw=i,AN(e,t,a,c,d,h,N)}}function AN(e,t,a,i,r,s,c){var d=t.lanes|t.childLanes;if(vm=d,d|=Pm,t5(e,a,d,i,r,s),ko=null,(a&335544064)===a?(To=nN(e),i=10262):(To=null,i=10256),(t.subtreeFlags&i)!==0||(t.flags&i)!==0?(e.callbackNode=null,e.callbackPriority=0,DN(Xc,function(){return Nm(),null})):(e.callbackNode=null,e.callbackPriority=0),ld=!1,i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=re.T,re.T=null,r=Ie.p,Ie.p=2,s=De,De|=4;try{$N(e,t,a)}finally{De=s,Ie.p=r,re.T=i}}ft=1,ld?So=WN(c,e.containerInfo,To,wm,$m,RN,xm,Nm,zN,null,null):(wm(),$m(),xm())}function zN(e){if(ft!==0){var t=on.onRecoverableError;t(e,{componentStack:null})}}function RN(){ft===3&&(ft=0,Iw(br,on),ft=4)}function wm(){if(ft===1){ft=0;var e=on,t=br,a=kn,i=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||i){i=re.T,re.T=null;var r=Ie.p;Ie.p=2;var s=De;De|=4;try{Ds=cd=!1,Vw(t,e,a),a=Cm;var c=hy(e.containerInfo),d=a.focusedElem,h=a.selectionRange;if(c!==d&&d&&d.ownerDocument&&uy(d.ownerDocument.documentElement,d)){if(h!==null&&Xm(d)){var f=h.start,w=h.end;if(w===void 0&&(w=f),"selectionStart"in d)d.selectionStart=f,d.selectionEnd=Math.min(w,d.value.length);else{var N=d.ownerDocument||document,p=N&&N.defaultView||window;if(p.getSelection){var b=p.getSelection(),R=d.textContent.length,O=Math.min(h.start,R),V=h.end===void 0?O:Math.min(h.end,R);!b.extend&&O>V&&(c=V,V=O,O=c);var $=fb(d,O),y=fb(d,V);if($&&y&&(b.rangeCount!==1||b.anchorNode!==$.node||b.anchorOffset!==$.offset||b.focusNode!==y.node||b.focusOffset!==y.offset)){var v=N.createRange();v.setStart($.node,$.offset),b.removeAllRanges(),O>V?(b.addRange(v),b.extend(y.node,y.offset)):(v.setEnd(y.node,y.offset),b.addRange(v))}}}}for(N=[],b=d;b=b.parentNode;)b.nodeType===1&&N.push({element:b,left:b.scrollLeft,top:b.scrollTop});for(typeof d.focus=="function"&&d.focus(),d=0;d<N.length;d++){var E=N[d];E.element.scrollLeft=E.left,E.element.scrollTop=E.top}}Ho=!!Tm,Cm=Tm=null}finally{De=s,Ie.p=r,re.T=i}}e.current=t,ft=2}}function $m(){if(ft===2){ft=0;var e=on,t=br,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=re.T,re.T=null;var i=Ie.p;Ie.p=2;var r=De;De|=4;try{Ew(e,t.alternate,t)}finally{De=r,Ie.p=i,re.T=a}}ft=3}}function xm(){if(ft===4||ft===3){ft=0;var e=So;So=null,Xx();var t=on,a=br,i=kn,r=Lw,s=(i&335544064)===i?10262:10256;if((a.subtreeFlags&s)!==0||(a.flags&s)!==0?ft=5:(ft=0,br=on=null,Fw(t,t.pendingLanes)),s=t.pendingLanes,s===0&&(zi=null),qm(i),a=a.stateNode,Ea&&typeof Ea.onCommitFiberRoot=="function")try{Ea.onCommitFiberRoot(hl,a,void 0,(a.current.flags&128)===128)}catch{}if(r!==null){a=re.T,s=Ie.p,Ie.p=2,re.T=null;try{for(var c=t.onRecoverableError,d=0;d<r.length;d++){var h=r[d];c(h.value,{componentStack:h.stack})}}finally{re.T=a,Ie.p=s}}if(r=ko,c=To,To=null,r!==null&&(ko=null,c===null&&(c=[]),e!==null))for(h=0;h<r.length;h++)a=(0,r[h])(c),a!==void 0&&e.finished.finally(a);(kn&3)!==0&&Dd(),En(t),s=t.pendingLanes,(i&261930)!==0&&(s&42)!==0?t===_c?Qs++:(Qs=0,_c=t):(Qs=0,_c=null),wl(0,!1)}}function Fw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,bl(t)))}function Dd(){return So!==null&&(So.skipTransition(),So=null),wm(),$m(),xm(),Nm()}function Nm(){if(ft!==5)return!1;var e=on,t=vm;vm=0;var a=qm(kn),i=re.T,r=Ie.p;try{Ie.p=32>a?32:a,re.T=null,a=ym,ym=null;var s=on,c=kn;if(ft=0,br=on=null,kn=0,(De&6)!==0)throw Error(D(331));var d=De;if(De|=4,qw(s.current),_w(s,s.current,c,a),De=d,wl(0,!1),Ea&&typeof Ea.onPostCommitFiberRoot=="function")try{Ea.onPostCommitFiberRoot(hl,s)}catch{}return!0}finally{Ie.p=r,re.T=i,Fw(e,t)}}function tv(e,t,a){t=Ga(a,t),t=am(e.stateNode,t,2),e=Ci(e,t,2),e!==null&&(pl(e,2),En(e))}function Xe(e,t,a){if(e.tag===3)tv(e,e,a);else for(;t!==null;){if(t.tag===3){tv(t,e,a);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(zi===null||!zi.has(i))){e=Ga(a,e),a=mw(2),i=Ci(t,a,2),i!==null&&(pw(a,i,t,e),pl(i,2),En(i));break}}t=t.return}}function vh(e,t,a){var i=e.pingCache;if(i===null){i=e.pingCache=new SN;var r=new Set;i.set(t,r)}else r=i.get(t),r===void 0&&(r=new Set,i.set(t,r));r.has(a)||(Np=!0,r.add(a),e=MN.bind(null,e,t,a),t.then(e,e))}function MN(e,t,a){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Je===e&&(Te&a)===a&&((yt===4||yt===3&&(Te&62914560)===Te&&300>Ca()-Md)&&(De&2)===0?Oo(e,0):dd|=a,Ro===Te&&(Ro=0)),En(e)}function Ww(e,t){t===0&&(t=Lv()),e=$r(e,t),e!==null&&(pl(e,t),En(e))}function ON(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Ww(e,a)}function VN(e,t){var a=0;switch(e.tag){case 31:case 13:var i=e.stateNode,r=e.memoizedState;r!==null&&(a=r.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(D(314))}i!==null&&i.delete(t),Ww(e,a)}function DN(e,t){return Hm(e,t)}var Vo=null,no=null,Sm=!1,pd=!1,yh=!1,Ni=0;function En(e){e!==no&&e.next===null&&(no===null?Vo=no=e:no=no.next=e),pd=!0,Sm||(Sm=!0,_N())}function wl(e,t){if(!yh&&pd){yh=!0;do for(var a=!1,i=Vo;i!==null;){if(!t)if(e!==0){var r=i.pendingLanes;if(r===0)var s=0;else{var c=i.suspendedLanes,d=i.pingedLanes;s=(1<<31-Aa(42|e)+1)-1,s&=r&~(c&~d),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,av(i,s))}else s=Te,s=vd(i,i===Je?s:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(s&3)===0||ml(i,s)||(a=!0,av(i,s));i=i.next}while(a);yh=!1}}function IN(){e0()}function e0(){pd=Sm=!1;var e=0;Ni!==0&&XN()&&(e=Ni);for(var t=Ca(),a=null,i=Vo;i!==null;){var r=i.next,s=t0(i,t);s===0?(i.next=null,a===null?Vo=r:a.next=r,r===null&&(no=a)):(a=i,(e!==0||(s&3)!==0)&&(pd=!0)),i=r}ft!==0&&ft!==5||wl(e,!1),Ni!==0&&(Ni=0)}function t0(e,t){for(var a=e.suspendedLanes,i=e.pingedLanes,r=e.expirationTimes,s=e.pendingLanes&-62914561;0<s;){var c=31-Aa(s),d=1<<c,h=r[c];h===-1?((d&a)===0||(d&i)!==0)&&(r[c]=e5(d,t)):h<=t&&(e.expiredLanes|=d),s&=~d}if(t=Je,a=Te,a=vd(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,a===0||e===t&&(Ge===2||Ge===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&Ju(i),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||ml(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(i!==null&&Ju(i),qm(a)){case 2:case 8:a=qv;break;case 32:a=Xc;break;case 268435456:a=Bv;break;default:a=Xc}return i=a0.bind(null,e),a=Hm(a,i),e.callbackPriority=t,e.callbackNode=a,t}return i!==null&&i!==null&&Ju(i),e.callbackPriority=2,e.callbackNode=null,2}function a0(e,t){if(ft!==0&&ft!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(Dd()&&e.callbackNode!==a)return null;var i=Te;return i=vd(e,e===Je?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(Yw(e,i,t),t0(e,Ca()),e.callbackNode!=null&&e.callbackNode===a?a0.bind(null,e):null)}function av(e,t){if(Dd())return null;Yw(e,t,!0)}function _N(){QN(function(){(De&6)!==0?Hm(Uv,IN):e0()})}function kp(){if(Ni===0){var e=mr;e===0&&(e=ic,ic<<=1,(ic&261888)===0&&(ic=256)),Ni=e}return Ni}function nv(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:kc(e)}function HN(e,t,a,i,r){if(t==="submit"&&a&&a.stateNode===r){var s=nv((r[wa]||null).action),c=i.submitter;c&&(t=(t=c[wa]||null)?nv(t.formAction):c.getAttribute("formAction"),t!==null&&(s=t,c=null));var d=new wd("action","action",null,i,r);e.push({event:d,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(Ni!==0){var h=new FormData(r,c);em(a,{pending:!0,data:h,method:r.method,action:s},null,h)}}else typeof s=="function"&&(d.preventDefault(),h=new FormData(r,c),em(a,{pending:!0,data:h,method:r.method,action:s},s,h))},currentTarget:r}]})}}for(yc=0;yc<Lh.length;yc++)wc=Lh[yc],iv=wc.toLowerCase(),rv=wc[0].toUpperCase()+wc.slice(1),sn(iv,"on"+rv);var wc,iv,rv,yc;sn(py,"onAnimationEnd");sn(gy,"onAnimationIteration");sn(fy,"onAnimationStart");sn("dblclick","onDoubleClick");sn("focusin","onFocus");sn("focusout","onBlur");sn(Z5,"onTransitionRun");sn(K5,"onTransitionStart");sn(J5,"onTransitionCancel");sn(by,"onTransitionEnd");Eo("onMouseEnter",["mouseout","mouseover"]);Eo("onMouseLeave",["mouseout","mouseover"]);Eo("onPointerEnter",["pointerout","pointerover"]);Eo("onPointerLeave",["pointerout","pointerover"]);yr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));yr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));yr("onBeforeInput",["compositionend","keypress","textInput","paste"]);yr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));yr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));yr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var il="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),UN=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(il));function n0(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var i=e[a],r=i.event;i=i.listeners;e:{var s=void 0;if(t)for(var c=i.length-1;0<=c;c--){var d=i[c],h=d.instance,f=d.currentTarget;if(d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=f;try{s(r)}catch(w){Qc(w)}r.currentTarget=null,s=h}else for(c=0;c<i.length;c++){if(d=i[c],h=d.instance,f=d.currentTarget,d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=f;try{s(r)}catch(w){Qc(w)}r.currentTarget=null,s=h}}}}function Se(e,t){var a=t[Wf];a===void 0&&(a=t[Wf]=new Set);var i=e+"__bubble";a.has(i)||(i0(t,e,2,!1),a.add(i))}function wh(e,t,a){var i=0;t&&(i|=4),i0(a,e,i,t)}var $c="_reactListening"+Math.random().toString(36).slice(2);function Tp(e){if(!e[$c]){e[$c]=!0,Zv.forEach(function(a){a!=="selectionchange"&&(UN.has(a)||wh(a,!1,e),wh(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[$c]||(t[$c]=!0,wh("selectionchange",!1,t))}}function i0(e,t,a,i){switch(E0(t)){case 2:var r=R2;break;case 8:r=M2;break;default:r=Op}a=r.bind(null,t,a,e),r=void 0,!Uh||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),i?r!==void 0?e.addEventListener(t,a,{capture:!0,passive:r}):e.addEventListener(t,a,!0):r!==void 0?e.addEventListener(t,a,{passive:r}):e.addEventListener(t,a,!1)}function $h(e,t,a,i,r){var s=i;if((t&1)===0&&(t&2)===0&&i!==null)e:for(;;){if(i===null)return;var c=i.tag;if(c===3||c===4){var d=i.stateNode.containerInfo;if(d===r)break;if(c===4)for(c=i.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===r)return;c=c.return}for(;d!==null;){if(c=nr(d),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){i=s=c;continue e}d=d.parentNode}}i=i.return}ny(function(){var f=s,w=jm(a),N=[];e:{var p=vy.get(e);if(p!==void 0){var b=wd,R=e;switch(e){case"keypress":if(Cc(a)===0)break e;case"keydown":case"keyup":b=k5;break;case"focusin":R="focus",b=nh;break;case"focusout":R="blur",b=nh;break;case"beforeblur":case"afterblur":b=nh;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":b=sb;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":b=m5;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":b=z5;break;case py:case gy:case fy:b=f5;break;case by:b=M5;break;case"scroll":case"scrollend":b=u5;break;case"wheel":b=V5;break;case"copy":case"cut":case"paste":b=v5;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":b=cb;break;case"submit":b=E5;break;case"toggle":case"beforetoggle":b=I5}var O=(t&4)!==0,V=!O&&(e==="scroll"||e==="scrollend"),$=O?p!==null?p+"Capture":null:p;O=[];for(var y=f,v;y!==null;){var E=y;if(v=E.stateNode,E=E.tag,E!==5&&E!==26&&E!==27||v===null||$===null||(E=Ks(y,$),E!=null&&O.push(rl(y,E,v))),V)break;y=y.return}0<O.length&&(p=new b(p,R,null,a,w),N.push({event:p,listeners:O}))}}if((t&7)===0){e:{if(b=e==="mouseover"||e==="pointerover",p=e==="mouseout"||e==="pointerout",b&&a!==Hh&&(R=a.relatedTarget||a.fromElement)&&(nr(R)||R[qo]))break e;(p||b)&&(R=w.window===w?w:(b=w.ownerDocument)?b.defaultView||b.parentWindow:window,p?(b=a.relatedTarget||a.toElement,p=f,b=b?nr(b):null,b!==null&&(V=ul(b),O=b.tag,b!==V||O!==5&&O!==27&&O!==6)&&(b=null)):(p=null,b=f),p!==b&&(O=sb,E="onMouseLeave",$="onMouseEnter",y="mouse",(e==="pointerout"||e==="pointerover")&&(O=cb,E="onPointerLeave",$="onPointerEnter",y="pointer"),V=p==null?R:Os(p),v=b==null?R:Os(b),R=new O(E,y+"leave",p,a,w),R.target=V,R.relatedTarget=v,E=null,nr(w)===f&&(O=new O($,y+"enter",b,a,w),O.target=v,O.relatedTarget=V,E=O),V=E,O=p&&b?Th(p,b,qN):null,p!==null&&ov(N,R,p,O,!1),b!==null&&V!==null&&ov(N,V,b,O,!0)))}e:{if(p=f?Os(f):window,b=p.nodeName&&p.nodeName.toLowerCase(),b==="select"||b==="input"&&p.type==="file")var I=mb;else if(hb(p))if(cy)I=X5;else{I=G5;var Y=L5}else b=p.nodeName,!b||b.toLowerCase()!=="input"||p.type!=="checkbox"&&p.type!=="radio"?f&&Bm(f.elementType)&&(I=mb):I=Y5;if(I&&(I=I(e,f))){ly(N,I,a,w);break e}Y&&Y(e,p,f)}switch(Y=f?Os(f):window,e){case"focusin":(hb(Y)||Y.contentEditable==="true")&&(co=Y,Bh=f,Hs=null);break;case"focusout":Hs=Bh=co=null;break;case"mousedown":jh=!0;break;case"contextmenu":case"mouseup":case"dragend":jh=!1,bb(N,a,w);break;case"selectionchange":if(Q5)break;case"keydown":case"keyup":bb(N,a,w)}var j;if(Ym)e:{switch(e){case"compositionstart":var X="onCompositionStart";break e;case"compositionend":X="onCompositionEnd";break e;case"compositionupdate":X="onCompositionUpdate";break e}X=void 0}else lo?oy(e,a)&&(X="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(X="onCompositionStart");X&&(ry&&a.locale!=="ko"&&(lo||X!=="onCompositionStart"?X==="onCompositionEnd"&&lo&&(j=iy()):(yi=w,Lm="value"in yi?yi.value:yi.textContent,lo=!0)),Y=gd(f,X),0<Y.length&&(X=new lb(X,e,null,a,w),N.push({event:X,listeners:Y}),j?X.data=j:(j=sy(a),j!==null&&(X.data=j)))),(j=H5?U5(e,a):q5(e,a))&&(X=gd(f,"onBeforeInput"),0<X.length&&(Y=new lb("onBeforeInput","beforeinput",null,a,w),N.push({event:Y,listeners:X}),Y.data=j)),HN(N,e,f,a,w)}n0(N,t)})}function rl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function gd(e,t){for(var a=t+"Capture",i=[];e!==null;){var r=e,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=Ks(e,a),r!=null&&i.unshift(rl(e,r,s)),r=Ks(e,t),r!=null&&i.push(rl(e,r,s))),e.tag===3)return i;e=e.return}return[]}function qN(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function ov(e,t,a,i,r){for(var s=t._reactName,c=[];a!==null&&a!==i;){var d=a,h=d.alternate,f=d.stateNode;if(d=d.tag,h!==null&&h===i)break;d!==5&&d!==26&&d!==27||f===null||(h=f,r?(f=Ks(a,s),f!=null&&c.unshift(rl(a,f,h))):r||(f=Ks(a,s),f!=null&&c.push(rl(a,f,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var BN=/\r\n?/g,jN=/\u0000|\uFFFD/g;function sv(e){return(typeof e=="string"?e:""+e).replace(BN,`
`).replace(jN,"")}function r0(e,t){return t=sv(t),sv(e)===t}function Ye(e,t,a,i,r,s){switch(a){case"children":if(typeof i=="string")t==="body"||t==="textarea"&&i===""||Ao(e,i);else if(typeof i=="number"||typeof i=="bigint")t!=="body"&&Ao(e,""+i);else return;break;case"className":sc(e,"class",i);break;case"tabIndex":sc(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":sc(e,a,i);break;case"style":ay(e,i,s);return;case"data":if(t!=="object"){sc(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=kc(i),e.setAttribute(a,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(t!=="input"&&Ye(e,t,"name",r.name,r,null),Ye(e,t,"formEncType",r.formEncType,r,null),Ye(e,t,"formMethod",r.formMethod,r,null),Ye(e,t,"formTarget",r.formTarget,r,null)):(Ye(e,t,"encType",r.encType,r,null),Ye(e,t,"method",r.method,r,null),Ye(e,t,"target",r.target,r,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=kc(i),e.setAttribute(a,i);break;case"onClick":i!=null&&(e.onclick=$n);return;case"onScroll":i!=null&&Se("scroll",e);return;case"onScrollEnd":i!=null&&Se("scrollend",e);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(D(61));if(a=i.__html,a!=null){if(r.children!=null)throw Error(D(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}a=kc(i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":i===!0?e.setAttribute(a,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(a,i):e.removeAttribute(a);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(a):e.setAttribute(a,i);break;case"popover":Se("beforetoggle",e),Se("toggle",e),Sc(e,"popover",i);break;case"xlinkActuate":jn(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":jn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":jn(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":jn(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":jn(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":jn(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":jn(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":jn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":jn(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":Sc(e,"is",i);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=c5.get(a)||a,Sc(e,a,i);else return}Oe=!0}function km(e,t,a,i,r,s){switch(a){case"style":ay(e,i,s);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(D(61));if(a=i.__html,a!=null){if(r.children!=null)throw Error(D(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof i=="string")Ao(e,i);else if(typeof i=="number"||typeof i=="bigint")Ao(e,""+i);else return;break;case"onScroll":i!=null&&Se("scroll",e);return;case"onScrollEnd":i!=null&&Se("scrollend",e);return;case"onClick":i!=null&&(e.onclick=$n);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Kv.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(r=a.endsWith("Capture"),s=a.slice(2,r?a.length-7:void 0),t=e[wa]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(s,t,r),typeof i=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(s,i,r);break e}Oe=!0,a in e?e[a]=i:i===!0?e.setAttribute(a,""):Sc(e,a,i)}return}Oe=!0}function Zt(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Se("error",e),Se("load",e);var i=!1,r=!1,s;for(s in a)if(a.hasOwnProperty(s)){var c=a[s];if(c!=null)switch(s){case"src":i=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(D(137,t));default:Ye(e,t,s,c,a,null)}}r&&Ye(e,t,"srcSet",a.srcSet,a,null),i&&Ye(e,t,"src",a.src,a,null);return;case"input":Se("invalid",e);var d=s=c=r=null,h=null,f=null;for(i in a)if(a.hasOwnProperty(i)){var w=a[i];if(w!=null)switch(i){case"name":r=w;break;case"type":c=w;break;case"checked":h=w;break;case"defaultChecked":f=w;break;case"value":s=w;break;case"defaultValue":d=w;break;case"children":case"dangerouslySetInnerHTML":if(w!=null)throw Error(D(137,t));break;default:Ye(e,t,i,w,a,null)}}Wv(e,s,d,h,f,c,r,!1);return;case"select":Se("invalid",e),i=c=s=null;for(r in a)if(a.hasOwnProperty(r)&&(d=a[r],d!=null))switch(r){case"value":s=d;break;case"defaultValue":c=d;break;case"multiple":i=d;default:Ye(e,t,r,d,a,null)}t=s,a=c,e.multiple=!!i,t!=null?vo(e,!!i,t,!1):a!=null&&vo(e,!!i,a,!0);return;case"textarea":Se("invalid",e),s=r=i=null;for(c in a)if(a.hasOwnProperty(c)&&(d=a[c],d!=null))switch(c){case"value":i=d;break;case"defaultValue":r=d;break;case"children":s=d;break;case"dangerouslySetInnerHTML":if(d!=null)throw Error(D(91));break;default:Ye(e,t,c,d,a,null)}ty(e,i,r,s);return;case"option":for(h in a)a.hasOwnProperty(h)&&(i=a[h],i!=null)&&(h==="selected"?e.selected=i&&typeof i!="function"&&typeof i!="symbol":Ye(e,t,h,i,a,null));return;case"dialog":Se("beforetoggle",e),Se("toggle",e),Se("cancel",e),Se("close",e);break;case"iframe":case"object":Se("load",e);break;case"video":case"audio":for(i=0;i<il.length;i++)Se(il[i],e);break;case"image":Se("error",e),Se("load",e);break;case"details":Se("toggle",e);break;case"embed":case"source":case"link":Se("error",e),Se("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(f in a)if(a.hasOwnProperty(f)&&(i=a[f],i!=null))switch(f){case"children":case"dangerouslySetInnerHTML":throw Error(D(137,t));default:Ye(e,t,f,i,a,null)}return;default:if(Bm(t)){for(w in a)a.hasOwnProperty(w)&&(i=a[w],i!==void 0&&km(e,t,w,i,a,void 0));return}}for(d in a)a.hasOwnProperty(d)&&(i=a[d],i!=null&&Ye(e,t,d,i,a,null))}var LN={};function GN(e,t,a,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,c=null,d=null,h=null,f=null,w=null;for(b in a){var N=a[b];if(a.hasOwnProperty(b)&&N!=null)switch(b){case"checked":break;case"value":break;case"defaultValue":h=N;default:i.hasOwnProperty(b)||Ye(e,t,b,null,i,N)}}for(var p in i){var b=i[p];if(N=a[p],i.hasOwnProperty(p)&&(b!=null||N!=null))switch(p){case"type":b!==N&&(Oe=!0),s=b;break;case"name":b!==N&&(Oe=!0),r=b;break;case"checked":b!==N&&(Oe=!0),f=b;break;case"defaultChecked":b!==N&&(Oe=!0),w=b;break;case"value":b!==N&&(Oe=!0),c=b;break;case"defaultValue":b!==N&&(Oe=!0),d=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(D(137,t));break;default:b!==N&&Ye(e,t,p,b,i,N)}}_h(e,c,d,h,f,w,s,r);return;case"select":b=c=d=p=null;for(s in a)if(h=a[s],a.hasOwnProperty(s)&&h!=null)switch(s){case"value":break;case"multiple":b=h;default:i.hasOwnProperty(s)||Ye(e,t,s,null,i,h)}for(r in i)if(s=i[r],h=a[r],i.hasOwnProperty(r)&&(s!=null||h!=null))switch(r){case"value":s!==h&&(Oe=!0),p=s;break;case"defaultValue":s!==h&&(Oe=!0),d=s;break;case"multiple":s!==h&&(Oe=!0),c=s;default:s!==h&&Ye(e,t,r,s,i,h)}t=d,a=c,i=b,p!=null?vo(e,!!a,p,!1):!!i!=!!a&&(t!=null?vo(e,!!a,t,!0):vo(e,!!a,a?[]:"",!1));return;case"textarea":b=p=null;for(d in a)if(r=a[d],a.hasOwnProperty(d)&&r!=null&&!i.hasOwnProperty(d))switch(d){case"value":break;case"children":break;default:Ye(e,t,d,null,i,r)}for(c in i)if(r=i[c],s=a[c],i.hasOwnProperty(c)&&(r!=null||s!=null))switch(c){case"value":r!==s&&(Oe=!0),p=r;break;case"defaultValue":r!==s&&(Oe=!0),b=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(D(91));break;default:r!==s&&Ye(e,t,c,r,i,s)}ey(e,p,b);return;case"option":for(var R in a)p=a[R],a.hasOwnProperty(R)&&p!=null&&!i.hasOwnProperty(R)&&(R==="selected"?e.selected=!1:Ye(e,t,R,null,i,p));for(h in i)p=i[h],b=a[h],i.hasOwnProperty(h)&&p!==b&&(p!=null||b!=null)&&(h==="selected"?(p!==b&&(Oe=!0),e.selected=p&&typeof p!="function"&&typeof p!="symbol"):Ye(e,t,h,p,i,b));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var O in a)p=a[O],a.hasOwnProperty(O)&&p!=null&&!i.hasOwnProperty(O)&&Ye(e,t,O,null,i,p);for(f in i)if(p=i[f],b=a[f],i.hasOwnProperty(f)&&p!==b&&(p!=null||b!=null))switch(f){case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(D(137,t));break;default:Ye(e,t,f,p,i,b)}return;default:if(Bm(t)){for(var V in a)p=a[V],a.hasOwnProperty(V)&&p!==void 0&&!i.hasOwnProperty(V)&&km(e,t,V,void 0,i,p);for(w in i)p=i[w],b=a[w],!i.hasOwnProperty(w)||p===b||p===void 0&&b===void 0||km(e,t,w,p,i,b);return}}for(var $ in a)p=a[$],a.hasOwnProperty($)&&p!=null&&!i.hasOwnProperty($)&&Ye(e,t,$,null,i,p);for(N in i)p=i[N],b=a[N],!i.hasOwnProperty(N)||p===b||p==null&&b==null||Ye(e,t,N,p,i,b)}function lv(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function YN(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),i=0;i<a.length;i++){var r=a[i],s=r.transferSize,c=r.initiatorType,d=r.duration;if(s&&d&&lv(c)){for(c=0,d=r.responseEnd,i+=1;i<a.length;i++){var h=a[i],f=h.startTime;if(f>d)break;var w=h.transferSize,N=h.initiatorType;w&&lv(N)&&(h=h.responseEnd,c+=w*(h<d?1:(d-f)/(h-f)))}if(--i,t+=8*(s+c)/(r.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Tm=null,Cm=null;function ol(e){return e.nodeType===9?e:e.ownerDocument}function cv(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function o0(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function s0(e,t,a,i){return a=ol(a).createElement(e),a[Yt]=i,a[wa]=t,Zt(a,e,t),Bt(a),a}function Em(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var xh=null;function XN(){var e=window.event;return e&&e.type==="popstate"?e===xh?!1:(xh=e,!0):(xh=null,!1)}var Cp=typeof setTimeout=="function"?setTimeout:void 0,PN=typeof clearTimeout=="function"?clearTimeout:void 0,dv=typeof Promise=="function"?Promise:void 0,uv=typeof requestAnimationFrame=="function"?requestAnimationFrame:Cp,QN=typeof queueMicrotask=="function"?queueMicrotask:typeof dv<"u"?function(e){return dv.resolve(null).then(e).catch(ZN)}:Cp;function ZN(e){setTimeout(function(){throw e})}function qi(e){return e==="head"}function hv(e,t){var a=t,i=0;do{var r=a.nextSibling;if(e.removeChild(a),r&&r.nodeType===8)if(a=r.data,a==="/$"||a==="/&"){if(i===0){e.removeChild(r),Uo(t);return}i--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")i++;else if(a==="html")Sh(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,Sh(a);for(var s=a.firstChild;s;){var c=s.nextSibling,d=s.nodeName;s[gl]||d==="SCRIPT"||d==="STYLE"||d==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=c}}else a==="body"&&Sh(e.ownerDocument.body);a=r}while(a);Uo(t)}function mv(e,t){var a=e;e=0;do{var i=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),i&&i.nodeType===8)if(a=i.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=i}while(a)}function l0(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var i=1;else for(var r=i=0;r<t.length;r++){var s=t[r];0<s.width&&0<s.height&&i++}i===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function c0(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function d0(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function Am(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return d0(t,a,e)}function KN(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return d0(t,a,e)}function JN(e){return e.documentElement.clientHeight}function FN(e){this.addEventListener("load",e),this.addEventListener("error",e)}function WN(e,t,a,i,r,s,c,d,h){var f=t.nodeType===9?t:t.ownerDocument;try{var w=f.startViewTransition({update:function(){var p=f.defaultView,b=p.navigation&&p.navigation.transition,R=f.fonts.status;i();var O=[];if(R==="loaded"&&(JN(f),f.fonts.status==="loading"&&O.push(f.fonts.ready)),R=O.length,e!==null)for(var V=e.suspenseyImages,$=0,y=0;y<V.length;y++){var v=V[y];if(!v.complete){var E=v.getBoundingClientRect();if(0<E.bottom&&0<E.right&&E.top<p.innerHeight&&E.left<p.innerWidth){if($+=x0(v),$>qc){O.length=R;break}v=new Promise(FN.bind(v)),O.push(v)}}}if(0<O.length)return p=Promise.race([Promise.all(O),new Promise(function(I){return setTimeout(I,500)})]).then(r,r),(b?Promise.allSettled([b.finished,p]):p).then(s,s);if(r(),b)return b.finished.then(s,s);s()},types:a});f.__reactViewTransition=w;var N=[];return w.ready.then(function(){for(var p=f.documentElement.getAnimations({subtree:!0}),b=0;b<p.length;b++){var R=p[b],O=R.effect,V=O.pseudoElement;if(V!=null&&V.startsWith("::view-transition")){N.push(R),R=O.getKeyframes();for(var $=V=void 0,y=!0,v=0;v<R.length;v++){var E=R[v],I=E.width;if(V===void 0)V=I;else if(V!==I){y=!1;break}if(I=E.height,$===void 0)$=I;else if($!==I){y=!1;break}delete E.width,delete E.height,E.transform==="none"&&delete E.transform}y&&V!==void 0&&$!==void 0&&(O.setKeyframes(R),y=getComputedStyle(O.target,O.pseudoElement),y.width!==V||y.height!==$)&&(y=R[0],y.width=V,y.height=$,y=R[R.length-1],y.width=V,y.height=$,O.setKeyframes(R))}}c()},function(p){f.__reactViewTransition===w&&(f.__reactViewTransition=null);try{typeof p=="object"&&p!==null&&p.name==="InvalidStateError"&&(p.message==="View transition was skipped because document visibility state is hidden."||p.message==="Skipping view transition because document visibility state has become hidden."||p.message==="Skipping view transition because viewport size changed."||p.message==="Transition was aborted because of invalid state")&&(p=null),p!==null&&h(p)}finally{i(),r(),c()}}),w.finished.finally(function(){for(var p=0;p<N.length;p++)N[p].cancel();f.__reactViewTransition===w&&(f.__reactViewTransition=null),d()}),w}catch{return i(),r(),c(),null}}function ir(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}ir.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:Fe({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};ir.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),i=[],r=0;r<a.length;r++){var s=a[r].effect;s!==null&&s.target===e&&s.pseudoElement===t&&i.push(a[r])}return i};ir.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function u0(e){return{name:e,group:new ir("group",e),imagePair:new ir("image-pair",e),old:new ir("old",e),new:new ir("new",e)}}function Ma(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}Ma.prototype.addEventListener=function(e,t,a){var i=null,r=null;if(!(a!=null&&typeof a!="boolean"&&(i=a.signal||null,i!==null&&i.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var s=this._eventListeners;if(h0(s,e,t,a)===-1){var c=this,d=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(d=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),i!==null&&(r=c.removeEventListener.bind(c,e,t,a),i.addEventListener("abort",r,{once:!0}),r=i.removeEventListener.bind(i,"abort",r)),i=Do(a),s.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:d,cleanup:r}),ya(this._fragmentFiber.child,!1,e2,e,d,i)}this._eventListeners=s}};function e2(e,t,a,i){return Ot(e).addEventListener(t,a,i),!1}Ma.prototype.removeEventListener=function(e,t,a){var i=this._eventListeners;if(i!==null&&(t=h0(i,e,t,a),t!==-1)){var r=i[t];a=r.attachedListener;var s=r.cleanup;r=Do(r.optionsOrUseCapture),ya(this._fragmentFiber.child,!1,t2,e,a,r),i.splice(t,1),s!==null&&s()}};function t2(e,t,a,i){return Ot(e).removeEventListener(t,a,i),!1}function Do(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function pv(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function h0(e,t,a,i){if(e.length===0)return-1;i=pv(i);for(var r=0;r<e.length;r++){var s=e[r];if(s.type===t&&s.listener===a&&pv(s.optionsOrUseCapture)===i)return r}return-1}Ma.prototype.dispatchEvent=function(e){var t=vr(this._fragmentFiber);if(t===null)return!0;t=Ot(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var i=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var r=0;r<a.length;r++){var s=a[r];i.addEventListener(s.type,s.attachedListener,Do(s.optionsOrUseCapture))}if(t.appendChild(i),e=i.dispatchEvent(e),a)for(r=0;r<a.length;r++)s=a[r],i.removeEventListener(s.type,s.attachedListener,Do(s.optionsOrUseCapture));return t.removeChild(i),e}return t.dispatchEvent(e)};Ma.prototype.focus=function(e){ya(this._fragmentFiber.child,!0,m0,e,void 0,void 0)};function m0(e,t){return e.tag===6?!1:(e=Ot(e),m2(e,t))}Ma.prototype.focusLast=function(e){var t=[];ya(this._fragmentFiber.child,!0,Ep,t,void 0,void 0);for(var a=t.length-1;0<=a&&!m0(t[a],e);a--);};function Ep(e,t){return t.push(e),!1}Ma.prototype.blur=function(){var e=vr(this._fragmentFiber);e!==null&&(e=Ot(e),e=ol(e).activeElement,e!==null&&ya(this._fragmentFiber.child,!1,a2,e,void 0,void 0))};function a2(e,t){return e.tag===6?!1:(e=Ot(e),e===t||e.contains(t)?(t.blur(),!0):!1)}Ma.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),ya(this._fragmentFiber.child,!1,n2,e,void 0,void 0)};function n2(e,t){return e.tag===6||(e=Ot(e),t.observe(e)),!1}Ma.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),ya(this._fragmentFiber.child,!1,i2,e,void 0,void 0);for(var a=t=0;a<rn.length;a++){var i=rn[a];i.fragmentInstance===this&&i.observer===e?e.unobserve(i.instance):rn[t++]=i}rn.length=t}};function i2(e,t){return e.tag===6||(e=Ot(e),t.unobserve(e)),!1}var rn=[],Nh=!1;function r2(e,t,a){rn.push({fragmentInstance:e,observer:t,instance:a}),Nh||(Nh=!0,p2(function(){Nh=!1;var i=rn;rn=[];for(var r=0;r<i.length;r++){var s=i[r];s.observer.unobserve(s.instance)}}))}Ma.prototype.getClientRects=function(){var e=[];return ya(this._fragmentFiber.child,!1,o2,e,void 0,void 0),e};function o2(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=Ot(e),t.push.apply(t,e.getClientRects());return!1}Ma.prototype.getRootNode=function(e){var t=vr(this._fragmentFiber);return t===null?this:Ot(t).getRootNode(e)};Ma.prototype.compareDocumentPosition=function(e){var t=vr(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];ya(this._fragmentFiber.child,!1,Ep,a,void 0,void 0);var i=Ot(t);if(a.length===0){if(a=i,Pf(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var r=i=a.compareDocumentPosition(e);return a===e?r=Node.DOCUMENT_POSITION_CONTAINS:i&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=Dv(t)[1],a===null?r=Node.DOCUMENT_POSITION_PRECEDING:(e=Ot(a).compareDocumentPosition(e),r=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),r|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=Ot(a[0]),r=Ot(a[a.length-1]);var s=Pf(this._fragmentFiber)?t.parentElement:i;if(s==null)return Node.DOCUMENT_POSITION_DISCONNECTED;i=s.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,s=s.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),d=r.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||d&Node.DOCUMENT_POSITION_CONTAINED_BY;return d=i&&s&&c&Node.DOCUMENT_POSITION_FOLLOWING&&d&Node.DOCUMENT_POSITION_PRECEDING,t=i&&t===e||s&&r===e||h||d?Node.DOCUMENT_POSITION_CONTAINED_BY:!i&&t===e||!s&&r===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||s2(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function s2(e,t,a,i,r){var s=nr(r);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!s)e:{for(;s!==null;){if(s.tag===7&&(s===t||s.alternate===t)){a=!0;break e}s=s.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(s===null)return s=r.ownerDocument,r===s||r===s.documentElement||r===s.body;e:{for(s=t,t=vr(t);s!==null;){if(!(s.tag!==5&&s.tag!==3&&s.tag!==27||s!==t&&s.alternate!==t)){s=!0;break e}s=s.return}s=!1}return s}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!s)&&!(t=s===a)&&(t=Th(a,s,Qf),t===null?t=!1:(ya(t,!0,_x,s,a),s=io,io=null,t=s!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!s)&&!(t=s===i)&&(t=Th(i,s,Qf),t===null?t=!1:(ya(t,!0,Hx,s,i),s=io,kh=io=null,t=s!==null)),t):!1}function gv(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}Ma.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(D(566));var t=[];ya(this._fragmentFiber.child,!1,Ep,t,void 0,void 0);var a=e!==!1;if(t.length===0){var i=Dv(this._fragmentFiber);if(i=a?i[1]||i[0]||vr(this._fragmentFiber):i[0]||i[1],i===null)return;if(i.tag===6){e=Ot(i),gv(e,a);return}if(i=Ot(i),i.nodeType!==9){if(i.nodeType===11){a="host"in i?i.host:null,a!==null&&a.scrollIntoView(e);return}i.scrollIntoView(e)}}for(i=a?t.length-1:0;i!==(a?-1:t.length);){var r=t[i];r.tag===6?(r=Ot(r),gv(r,a)):Ot(r).scrollIntoView(e),i+=a?-1:1}};function l2(e,t){return e=Ot(e),p0(e,t),!1}function p0(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function g0(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i];e.addEventListener(r.type,r.attachedListener,Do(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){for(var c=0,d=0;d<rn.length;d++){var h=rn[d];(h.fragmentInstance!==t||h.observer!==s||h.instance!==e)&&(rn[c++]=h)}rn.length=c,s.observe(e)}),p0(e,t))}function c2(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i];e.removeEventListener(r.type,r.attachedListener,Do(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){typeof s.rootMargin=="string"?r2(t,s,e):s.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function zm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":zm(a),yd(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function d2(e,t,a,i){for(;e.nodeType===1;){var r=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[gl])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(s=e.getAttribute("rel"),s==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(s!==r.rel||e.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||e.getAttribute("title")!==(r.title==null?null:r.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(s=e.getAttribute("src"),(s!==(r.src==null?null:r.src)||e.getAttribute("type")!==(r.type==null?null:r.type)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&e.getAttribute("name")===s)return e}else return e;if(e=Xa(e.nextSibling),e===null)break}return null}function u2(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=Xa(e.nextSibling),e===null))return null;return e}function f0(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Xa(e.nextSibling),e===null))return null;return e}function Rm(e){return e.data==="$?"||e.data==="$~"}function Ap(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function h2(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var i=function(){t(),a.removeEventListener("DOMContentLoaded",i)};a.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function Xa(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Mm=null;function fv(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return Xa(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function bv(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function m2(e,t){function a(){i=!0}if(e.ownerDocument.activeElement===e)return!0;var i=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return i}function p2(e){uv(function(){uv(function(t){return e(t)})})}function b0(e,t,a){switch(t=ol(a),e){case"html":if(e=t.documentElement,!e)throw Error(D(452));return e;case"head":if(e=t.head,!e)throw Error(D(453));return e;case"body":if(e=t.body,!e)throw Error(D(454));return e;default:throw Error(D(451))}}function v0(e,t,a){for(var i in a){var r=a[i];a.hasOwnProperty(i)&&r!=null&&Ye(e,t,i,null,LN,r)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===$n&&(e.onclick=null),yd(e)}function Sh(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);yd(e)}var Pa=new Map,vv=new Set;function sl(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var ai=Ie.d;Ie.d={f:g2,r:f2,D:b2,C:v2,L:y2,m:w2,X:x2,S:$2,M:N2};function g2(){var e=ai.f(),t=Od();return e||t}function f2(e){var t=Bo(e);t!==null&&t.tag===5&&t.type==="form"?aw(t):ai.r(e)}var Yo=typeof document>"u"?null:document;function y0(e,t,a){var i=Yo;if(i&&typeof t=="string"&&t){var r=La(t);r='link[rel="'+e+'"][href="'+r+'"]',typeof a=="string"&&(r+='[crossorigin="'+a+'"]'),vv.has(r)||(vv.add(r),e={rel:e,crossOrigin:a,href:t},i.querySelector(r)===null&&(t=i.createElement("link"),Zt(t,"link",e),Bt(t),i.head.appendChild(t)))}}function b2(e){ai.D(e),y0("dns-prefetch",e,null)}function v2(e,t){ai.C(e,t),y0("preconnect",e,t)}function y2(e,t,a){ai.L(e,t,a);var i=Yo;if(i&&e&&t){var r='link[rel="preload"][as="'+La(t)+'"]';t==="image"&&a&&a.imageSrcSet?(r+='[imagesrcset="'+La(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(r+='[imagesizes="'+La(a.imageSizes)+'"]')):r+='[href="'+La(e)+'"]';var s=r;switch(t){case"style":s=Io(e);break;case"script":s=Xo(e)}if(!(Pa.has(s)||(e=Fe({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),Pa.set(s,e),i.querySelector(r)!==null||t==="style"&&i.querySelector($l(s))||t==="script"&&i.querySelector(xl(s))))){var c=i.createElement("link");Zt(c,"link",e),t==="style"&&(c[Pc]=!0,c.onload=c.onerror=function(){Qv(c)}),Bt(c),i.head.appendChild(c)}}}function w2(e,t){ai.m(e,t);var a=Yo;if(a&&e){var i=t&&typeof t.as=="string"?t.as:"script",r='link[rel="modulepreload"][as="'+La(i)+'"][href="'+La(e)+'"]',s=r;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=Xo(e)}if(!Pa.has(s)&&(e=Fe({rel:"modulepreload",href:e},t),Pa.set(s,e),a.querySelector(r)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(xl(s)))return}i=a.createElement("link"),Zt(i,"link",e),Bt(i),a.head.appendChild(i)}}}function $2(e,t,a){ai.S(e,t,a);var i=Yo;if(i&&e){var r=bo(i).hoistableStyles,s=Io(e);t=t||"default";var c=r.get(s);if(!c){var d={loading:0,preload:null};if(c=i.querySelector($l(s)))d.loading=5;else{e=Fe({rel:"stylesheet",href:e,"data-precedence":t},a),(a=Pa.get(s))&&zp(e,a);var h=c=i.createElement("link");Bt(h),Zt(h,"link",e),h._p=new Promise(function(f,w){h.onload=f,h.onerror=w}),h.addEventListener("load",function(){d.loading|=1}),h.addEventListener("error",function(){d.loading|=2}),d.loading|=4,Hc(c,t,i)}c={type:"stylesheet",instance:c,count:1,state:d},r.set(s,c)}}}function x2(e,t){ai.X(e,t);var a=Yo;if(a&&e){var i=bo(a).hoistableScripts,r=Xo(e),s=i.get(r);s||(s=a.querySelector(xl(r)),s||(e=Fe({src:e,async:!0},t),(t=Pa.get(r))&&Rp(e,t),s=a.createElement("script"),Bt(s),Zt(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function N2(e,t){ai.M(e,t);var a=Yo;if(a&&e){var i=bo(a).hoistableScripts,r=Xo(e),s=i.get(r);s||(s=a.querySelector(xl(r)),s||(e=Fe({src:e,async:!0,type:"module"},t),(t=Pa.get(r))&&Rp(e,t),s=a.createElement("script"),Bt(s),Zt(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function yv(e,t,a,i){var r=(r=Si.current)?sl(r):null;if(!r)throw Error(D(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=Io(a.href),t=bo(r).hoistableStyles,i=t.get(a),i||(i={type:"style",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=Io(a.href);var s=bo(r).hoistableStyles,c=s.get(e);if(c||(r=r.ownerDocument||r,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(e,c),(s=r.querySelector($l(e)))?s._p||(c.instance=s,c.state.loading=5):(s=Pa.get(e),s||(s={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Pa.set(e,s)),S2(r,e,s,c.state))),t&&i===null)throw Error(D(528,""));return c}if(t&&i!==null)throw Error(D(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=Xo(a),t=bo(r).hoistableScripts,i=t.get(a),i||(i={type:"script",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(D(444,e))}}function Io(e){return'href="'+La(e)+'"'}function $l(e){return'link[rel="stylesheet"]['+e+"]"}function w0(e){return Fe({},e,{"data-precedence":e.precedence,precedence:null})}function S2(e,t,a,i){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Pc]!==!0){i.loading=1;return}}else t=e.createElement("link"),t[Pc]=!0,t.onload=t.onerror=Qv.bind(null,t),Zt(t,"link",a),Bt(t),e.head.appendChild(t);i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2})}function Xo(e){return'[src="'+La(e)+'"]'}function xl(e){return"script[async]"+e}function wv(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+La(a.href)+'"]');if(i)return t.instance=i,Bt(i),i;var r=Fe({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),Bt(i),Zt(i,"style",r),Hc(i,a.precedence,e),t.instance=i;case"stylesheet":r=Io(a.href);var s=e.querySelector($l(r));if(s)return t.state.loading|=4,t.instance=s,Bt(s),s;i=w0(a),(r=Pa.get(r))&&zp(i,r),s=(e.ownerDocument||e).createElement("link"),Bt(s);var c=s;return c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),Zt(s,"link",i),t.state.loading|=4,Hc(s,a.precedence,e),t.instance=s;case"script":return s=Xo(a.src),(r=e.querySelector(xl(s)))?(t.instance=r,Bt(r),r):(i=a,(r=Pa.get(s))&&(i=Fe({},a),Rp(i,r)),e=e.ownerDocument||e,r=e.createElement("script"),Bt(r),Zt(r,"link",i),e.head.appendChild(r),t.instance=r);case"void":return null;default:throw Error(D(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Hc(i,a.precedence,e));return t.instance}function Hc(e,t,a){for(var i=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=i.length?i[i.length-1]:null,s=r,c=0;c<i.length;c++){var d=i[c];if(d.dataset.precedence===t)s=d;else if(s!==r)break}s?s.parentNode.insertBefore(e,s.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function zp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Rp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Uc=null;function $v(e,t,a){if(Uc===null){var i=new Map,r=Uc=new Map;r.set(a,i)}else r=Uc,i=r.get(a),i||(i=new Map,r.set(a,i));if(i.has(e))return i;for(i.set(e,null),a=a.getElementsByTagName(e),r=0;r<a.length;r++){var s=a[r];if(!(s[gl]||s[Yt]||e==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var c=s.getAttribute(t)||"";c=e+c;var d=i.get(c);d?d.push(s):i.set(c,[s])}}return i}function Om(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function k2(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function xv(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function $0(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function x0(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Nv(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=x0(t),e.suspenseyImages.push(t)),e=E2.bind(e),t.decode().then(e,e))}function T2(e,t,a,i){if(a.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var r=Io(i.href),s=t.querySelector($l(r));if(s){t=s._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=ll.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=s,Bt(s);return}s=t.ownerDocument||t,i=w0(i),(r=Pa.get(r))&&zp(i,r),s=s.createElement("link"),Bt(s);var c=s;c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),Zt(s,"link",i),a.instance=s}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=ll.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var qc=0;function C2(e,t){return e.stylesheets&&e.count===0&&Bc(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var i=setTimeout(function(){if(e.stylesheets&&Bc(e,e.stylesheets),e.unsuspend){var s=e.unsuspend;e.unsuspend=null,s()}},6e4+t);0<e.imgBytes&&qc===0&&(qc=62500*YN());var r=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Bc(e,e.stylesheets),e.unsuspend)){var s=e.unsuspend;e.unsuspend=null,s()}},(e.imgBytes>qc?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(r)}}:null}function N0(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)Bc(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function ll(){this.count--,N0(this)}function E2(){this.imgCount--,N0(this)}var fd=null;function Bc(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,fd=new Map,t.forEach(A2,e),fd=null,ll.call(e))}function A2(e,t){if(!(t.state.loading&4)){var a=fd.get(e);if(a)var i=a.get(null);else{a=new Map,fd.set(e,a);for(var r=e.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var c=r[s];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),i=c)}i&&a.set(null,i)}r=t.instance,c=r.getAttribute("data-precedence"),s=a.get(c)||i,s===i&&a.set(null,r),a.set(c,r),this.count++,i=ll.bind(this),r.addEventListener("load",i),r.addEventListener("error",i),s?s.parentNode.insertBefore(r,s.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(r,e.firstChild)),t.state.loading|=4}}var _o={$$typeof:wn,Provider:null,Consumer:null,_currentValue:rr,_currentValue2:rr,_threadCount:0};function z2(e,t,a,i,r,s,c,d,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Fu(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Fu(0),this.hiddenUpdates=Fu(null),this.identifierPrefix=i,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function S0(e,t,a,i,r,s,c,d,h,f,w,N){return e=new z2(e,t,a,c,h,f,w,N,d),t=1,s===!0&&(t|=24),s=ba(3,null,null,t),e.current=s,s.stateNode=e,t=Jm(),t.refCount++,e.pooledCache=t,t.refCount++,s.memoizedState={element:i,isDehydrated:a,cache:t},ep(s),e}function k0(e){return e?(e=mo,e):mo}function T0(e,t,a,i,r,s){r=k0(r),i.context===null?i.context=r:i.pendingContext=r,i=Ti(t),i.payload={element:a},s=s===void 0?null:s,s!==null&&(i.callback=s),a=Ci(e,i,t),a!==null&&(va(a,e,t),qs(a,e,t))}function Sv(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function Mp(e,t){Sv(e,t),(e=e.alternate)&&Sv(e,t)}function C0(e){if(e.tag===13||e.tag===31){var t=$r(e,67108864);t!==null&&va(t,e,67108864),Mp(e,67108864)}}function kv(e){if(e.tag===13||e.tag===31){var t=za();t=Um(t);var a=$r(e,t);a!==null&&va(a,e,t),Mp(e,t)}}var Ho=!0;function R2(e,t,a,i){var r=re.T;re.T=null;var s=Ie.p;try{Ie.p=2,Op(e,t,a,i)}finally{Ie.p=s,re.T=r}}function M2(e,t,a,i){var r=re.T;re.T=null;var s=Ie.p;try{Ie.p=8,Op(e,t,a,i)}finally{Ie.p=s,re.T=r}}function Op(e,t,a,i){if(Ho){var r=Vm(i);if(r===null)$h(e,t,i,bd,a),Tv(e,i);else if(V2(r,e,t,a,i))i.stopPropagation();else if(Tv(e,i),t&4&&-1<O2.indexOf(e)){for(;r!==null;){var s=Bo(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var c=er(s.pendingLanes);if(c!==0){var d=s;for(d.pendingLanes|=2,d.entangledLanes|=2;c;){var h=1<<31-Aa(c);d.entanglements[1]|=h,c&=~h}En(s),(De&6)===0&&(ud=Ca()+500,wl(0,!1))}}break;case 31:case 13:d=$r(s,2),d!==null&&va(d,s,2),Od(),Mp(s,2)}if(s=Vm(i),s===null&&$h(e,t,i,bd,a),s===r)break;r=s}r!==null&&i.stopPropagation()}else $h(e,t,i,null,a)}}function Vm(e){return e=jm(e),Vp(e)}var bd=null;function Vp(e){if(bd=null,e=nr(e),e!==null){var t=ul(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=Mv(t),e!==null)return e;e=null}else if(a===31){if(e=Ov(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return bd=e,null}function E0(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Px()){case Uv:return 2;case qv:return 8;case Xc:case Qx:return 32;case Bv:return 268435456;default:return 32}default:return 32}}var Dm=!1,Ri=null,Mi=null,Oi=null,cl=new Map,dl=new Map,bi=[],O2="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Tv(e,t){switch(e){case"focusin":case"focusout":Ri=null;break;case"dragenter":case"dragleave":Mi=null;break;case"mouseover":case"mouseout":Oi=null;break;case"pointerover":case"pointerout":cl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":dl.delete(t.pointerId)}}function As(e,t,a,i,r,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:a,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},t!==null&&(t=Bo(t),t!==null&&C0(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),e)}function V2(e,t,a,i,r){switch(t){case"focusin":return Ri=As(Ri,e,t,a,i,r),!0;case"dragenter":return Mi=As(Mi,e,t,a,i,r),!0;case"mouseover":return Oi=As(Oi,e,t,a,i,r),!0;case"pointerover":var s=r.pointerId;return cl.set(s,As(cl.get(s)||null,e,t,a,i,r)),!0;case"gotpointercapture":return s=r.pointerId,dl.set(s,As(dl.get(s)||null,e,t,a,i,r)),!0}return!1}function A0(e){var t=nr(e.target);if(t!==null){var a=ul(t);if(a!==null){if(t=a.tag,t===13){if(t=Mv(a),t!==null){e.blockedOn=t,Ff(e.priority,function(){kv(a)});return}}else if(t===31){if(t=Ov(a),t!==null){e.blockedOn=t,Ff(e.priority,function(){kv(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function jc(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=Vm(e.nativeEvent);if(a===null){a=e.nativeEvent;var i=new a.constructor(a.type,a);Hh=i,a.target.dispatchEvent(i),Hh=null}else return t=Bo(a),t!==null&&C0(t),e.blockedOn=a,!1;t.shift()}return!0}function Cv(e,t,a){jc(e)&&a.delete(t)}function D2(){Dm=!1,Ri!==null&&jc(Ri)&&(Ri=null),Mi!==null&&jc(Mi)&&(Mi=null),Oi!==null&&jc(Oi)&&(Oi=null),cl.forEach(Cv),dl.forEach(Cv)}function xc(e,t){e.blockedOn===t&&(e.blockedOn=null,Dm||(Dm=!0,Vt.unstable_scheduleCallback(Vt.unstable_NormalPriority,D2)))}var Nc=null;function Ev(e){Nc!==e&&(Nc=e,Vt.unstable_scheduleCallback(Vt.unstable_NormalPriority,function(){Nc===e&&(Nc=null);for(var t=0;t<e.length;t+=3){var a=e[t],i=e[t+1],r=e[t+2];if(typeof i!="function"){if(Vp(i||a)===null)continue;break}var s=Bo(a);s!==null&&(e.splice(t,3),t-=3,em(s,{pending:!0,data:r,method:a.method,action:i},i,r))}}))}function Uo(e){function t(h){return xc(h,e)}Ri!==null&&xc(Ri,e),Mi!==null&&xc(Mi,e),Oi!==null&&xc(Oi,e),cl.forEach(t),dl.forEach(t);for(var a=0;a<bi.length;a++){var i=bi[a];i.blockedOn===e&&(i.blockedOn=null)}for(;0<bi.length&&(a=bi[0],a.blockedOn===null);)A0(a),a.blockedOn===null&&bi.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(i=0;i<a.length;i+=3){var r=a[i],s=a[i+1],c=r[wa]||null;if(typeof s=="function")c||Ev(a);else if(c){var d=null;if(s&&s.hasAttribute("formAction")){if(r=s,c=s[wa]||null)d=c.formAction;else if(Vp(r)!==null)continue}else d=c.action;typeof d=="function"?a[i+1]=d:(a.splice(i,3),i-=3),Ev(a)}}}function z0(){function e(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(c){return r=c})},focusReset:"manual",scroll:"manual"})}function t(){r!==null&&(r(),r=null),i||setTimeout(a,20)}function a(){if(!i&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,r=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),r!==null&&(r(),r=null)}}}function Dp(e){this._internalRoot=e}Id.prototype.render=Dp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(D(409));var a=t.current,i=za();T0(a,i,e,t,null,null)};Id.prototype.unmount=Dp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;T0(e.current,2,null,e,null,null),Od(),t[qo]=null}};function Id(e){this._internalRoot=e}Id.prototype.unstable_scheduleHydration=function(e){if(e){var t=Pv();e={blockedOn:null,target:e,priority:t};for(var a=0;a<bi.length&&t!==0&&t<bi[a].priority;a++);bi.splice(a,0,e),a===0&&A0(e)}};var Av=zv.version;if(Av!=="19.3.0")throw Error(D(527,Av,"19.3.0"));Ie.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(D(188)):(e=Object.keys(e).join(","),Error(D(268,e)));return e=Ix(t),e=e!==null?Vv(e):null,e=e===null?null:e.stateNode,e};var I2={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:re,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(zs=__REACT_DEVTOOLS_GLOBAL_HOOK__,!zs.isDisabled&&zs.supportsFiber))try{hl=zs.inject(I2),Ea=zs}catch{}var zs;_d.createRoot=function(e,t){if(!Rv(e))throw Error(D(299));var a=!1,i="",r=dw,s=uw,c=hw;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(r=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=S0(e,1,!1,null,null,a,i,null,r,s,c,z0),e[qo]=t.current,Tp(e),new Dp(t)};_d.hydrateRoot=function(e,t,a){if(!Rv(e))throw Error(D(299));var i=!1,r="",s=dw,c=uw,d=hw,h=null;return a!=null&&(a.unstable_strictMode===!0&&(i=!0),a.identifierPrefix!==void 0&&(r=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(d=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=S0(e,1,!0,t,a??null,i,r,h,s,c,d,z0),t.context=k0(null),a=t.current,i=za(),i=Um(i),r=Ti(i),r.callback=null,Ci(a,r,i),a=i,t.current.lanes=a,pl(t,a),En(t),e[qo]=t.current,Tp(e),new Id(t)};_d.version="19.3.0"});var V0=mn((rk,O0)=>{"use strict";function M0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(M0)}catch(e){console.error(e)}}M0(),O0.exports=R0()});var Ee=Ji(ys());var Hu={PAPERCRAFT:"Faithfully preserve the source character\u2019s design, clothing, colors, anatomy, and identifying features. Render as a handcrafted 2D papercraft game character: simplified cartoon proportions, bold clean near-black outlines, and a distinct thin off-white paper-cut border around the entire silhouette. Construct the character from flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply a clearly visible matte handmade paper texture with fine fibers and gentle printed color variation across the entire character. Slightly imperfect physical cut edges. Clean, expressive, polished storybook character design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. The result should look like a physical illustrated paper character assembled from printed cutouts.",BATTLEHIGHWAY:"Use the reference image ONLY as a character-design reference for identity, species/anatomy, core outfit, colors, proportions, and defining features. Redraw the character strictly in the visual style of early-2000s Sonic Battle character art. Reconstruct the character from bold angular graphic shapes, not smooth modern anatomy. Use exaggerated proportions, a strong asymmetrical silhouette, and slightly hand-drawn, irregular contours. Build the design from large faceted masses, wedges, spikes, tapered limbs, and simplified shape clusters. Do not just take normal anatomy and make it slightly angular. Use thick dark outer outlines and selective thinner interior lines to divide important forms only. Group repeated details like feathers, fur, hair, folds, fingers, and accessories into a few large simplified shapes instead of many small ones. Use flat saturated colors with one large hard-edged shadow shape per major form and only occasional small highlight accents. Keep strong value separation and graphic cutout-like shading, not realistic form rendering. Include some medium-scale structural details that define the character, but remove microdetail. The final image should feel like Sonic Battle character key art: graphic, angular, simplified, lively, and highly readable, not polished modern anime art, not painterly, not vector-clean, and not realistic. No gradients, soft shading, painterly texture, glossy rendering, realistic lighting, detailed folds, excessive feather/fur/hair separation, or 3D volume.",Custom:""},Uu=["neutral","happy","sad","angry","surprised","thinking"];function yf(e,t){if(!e||!/^[a-z0-9_-]{1,40}$/.test(e.label)||!["front","side"].includes(e.view))throw new Error("Choose a valid view and expression label.");if(typeof e.pose!="string"||e.pose.length>500)throw new Error("Pose instructions must be at most 500 characters.");if(![e.x,e.y,e.width,e.height].every(Number.isInteger)||e.x<0||e.y<0||e.width<1||e.height<1||e.x+e.width>t.width||e.y+e.height>t.height)throw new Error("The crop must fit inside the source image.");if(![e.scale,e.offsetX,e.offsetY].every(Number.isFinite)||e.scale<.1||e.scale>3||Math.abs(e.offsetX)>512||Math.abs(e.offsetY)>768)throw new Error("Choose a scale between 0.1 and 3 and an offset inside the sprite canvas.")}var S=Ji(ws()),Fl=e=>e instanceof Error?e.message:"The sprite action failed.";function Cx(){let e=crypto.getRandomValues(new Uint8Array(16));e[6]=e[6]&15|64,e[8]=e[8]&63|128;let t=Array.from(e,a=>a.toString(16).padStart(2,"0")).join("");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}var Nf=e=>new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(String(i.result)),i.onerror=()=>a(new Error("The file could not be read.")),i.readAsDataURL(e)}),kf=e=>new Promise((t,a)=>{let i=new Image;i.onload=()=>t(i),i.onerror=()=>a(new Error("The image could not be loaded.")),i.src=e});function Ex(e,t,a){let i=e.getImageData(0,0,t,a),r=i.data,c=[0,t-1,t*(a-1),t*a-1].find(b=>{let R=b*4;return r[R+3]>240&&Math.max(r[R],r[R+1],r[R+2])-Math.min(r[R],r[R+1],r[R+2])>120});if(c===void 0)return;let d=[r[c*4],r[c*4+1],r[c*4+2]],h=new Uint8Array(t*a),f=new Int32Array(t*a),w=0,N=0,p=b=>{if(h[b])return;h[b]=1;let R=b*4;(r[R+3]<16||Math.hypot(r[R]-d[0],r[R+1]-d[1],r[R+2]-d[2])<75)&&(f[N++]=b)};for(let b=0;b<t;b++)p(b),p((a-1)*t+b);for(let b=0;b<a;b++)p(b*t),p(b*t+t-1);for(;w<N;){let b=f[w++];r[b*4+3]=0,b%t>0&&p(b-1),b%t<t-1&&p(b+1),b>=t&&p(b-t),b<t*(a-1)&&p(b+t)}e.putImageData(i,0,0)}async function Tf(e,t,a=!1){yf(t,e);let i=await kf(e.url),r=document.createElement("canvas");r.width=t.width,r.height=t.height;let s=r.getContext("2d");s.drawImage(i,t.x,t.y,t.width,t.height,0,0,t.width,t.height),a&&Ex(s,r.width,r.height);let c=document.createElement("canvas");c.width=512,c.height=768;let d=c.getContext("2d"),f=(e.baseScale??Math.min(512/Math.max(...e.cells.map(p=>p.width)),768/Math.max(...e.cells.map(p=>p.height))))*t.scale,w=t.width*f,N=t.height*f;return d.drawImage(r,(512-w)/2+t.offsetX,768-N+t.offsetY,w,N),c}function Sf({candidate:e,mirrored:t=!1}){let a=(0,Ee.useRef)(null),[i,r]=(0,Ee.useState)("");return(0,Ee.useEffect)(()=>{let s=!1;return Tf(e.sheet,e.cell,e.cell.cleanup).then(c=>{!s&&a.current&&(a.current.getContext("2d").clearRect(0,0,512,768),a.current.getContext("2d").drawImage(c,0,0),r(""))}).catch(c=>{s||r(Fl(c))}),()=>{s=!0}},[e.sheet,e.cell]),(0,S.jsxs)(S.Fragment,{children:[i?(0,S.jsx)("small",{role:"alert",children:i}):null,(0,S.jsx)("canvas",{ref:a,width:512,height:768,style:{transform:t?"scaleX(-1)":void 0},role:"img","aria-label":e.cell.view+" "+e.cell.label})]})}var Ax=`
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
`;function Cf({villager:e,request:t,onSaved:a,onBack:i,onExport:r}){let s="/villagers/"+encodeURIComponent(e.characterId)+"/sprites",[c,d]=(0,Ee.useState)(null),[h,f]=(0,Ee.useState)(null),[w,N]=(0,Ee.useState)("Create"),[p,b]=(0,Ee.useState)("front"),[R,O]=(0,Ee.useState)(["neutral"]),[V,$]=(0,Ee.useState)(""),[y,v]=(0,Ee.useState)({}),[E,I]=(0,Ee.useState)(!1),[Y,j]=(0,Ee.useState)(null),[X,ve]=(0,Ee.useState)([]),[F,We]=(0,Ee.useState)(""),[he,et]=(0,Ee.useState)(null),[mt,Oa]=(0,Ee.useState)("scene"),[xt,Dt]=(0,Ee.useState)("front"),[je,Le]=(0,Ee.useState)(0),[ie,Ve]=(0,Ee.useState)(!1),[pt,It]=(0,Ee.useState)(""),[At,K]=(0,Ee.useState)(""),[zt,Rt]=(0,Ee.useState)(""),[Nt,Ze]=(0,Ee.useState)(null),[pe,gt]=(0,Ee.useState)(1),[st,oe]=(0,Ee.useState)(1),[_e,se]=(0,Ee.useState)("neutral"),Re=(0,Ee.useRef)(null),ee=(0,Ee.useRef)(null),A=(0,Ee.useRef)(null),H=e.sprite?.images??[],ne=H.some(x=>x.view==="front"&&x.label==="neutral"),ge=H.some(x=>x.view===p&&x.label==="neutral"),ye=c?.jobs.some(x=>x.status==="running")??!1,He=(c?.jobs??[]).flatMap(x=>x.sheets.flatMap(J=>J.cells.filter(ct=>ct.status==="candidate").map(ct=>({sheet:J,cell:ct})))),we=He.find(x=>x.cell.id===F),Ne=we?{sheet:we.sheet,cell:he??we.cell}:null,W=H.filter(x=>x.view===(xt==="front"?"front":"side")),Ft=W[je%Math.max(1,W.length)]??H.find(x=>x.view==="front"&&x.label==="neutral"),Ae=x=>{d(x)},G=(x,J)=>t(s+"/studio"+(x?"/"+x:""),J===void 0?void 0:{method:"POST",body:JSON.stringify(J)});(0,Ee.useEffect)(()=>{let x=!1;return t(s+"/studio").then(J=>{x||(d(J),f(J.settings),J.jobs.some(ct=>ct.status!=="ready"||ct.sheets.some(C=>C.cells.some(le=>le.status==="candidate")))&&N("Review"))}).catch(J=>{x||It(Fl(J))}),A.current?.focus(),()=>{x=!0}},[s,t]),(0,Ee.useEffect)(()=>{if(!ye)return;let x=window.setInterval(()=>{t(s+"/studio").then(d).catch(J=>It(Fl(J)))},2e3);return()=>window.clearInterval(x)},[ye,s,t]),(0,Ee.useEffect)(()=>{O(ee.current?[ee.current]:ge?Uu.filter(x=>x!=="neutral"):["neutral"]),ee.current=null,j(null),Re.current=null},[p,ge]);async function T(x){Ve(!0),It(""),K("");try{await x()}catch(J){It(Fl(J))}finally{Ve(!1)}}async function Q(){h&&(Ae(await G("settings",h)),K("Style and connection saved."))}function xe(x){f(x),j(null),Re.current=null}function _t(x){We(x.cell.id),et(structuredClone(x.cell)),Dt(x.cell.view==="front"?"front":"right")}function lt(x){O(x),j(null),Re.current=null}let bt={view:p,expressions:R.map(x=>({label:x,pose:y[x]??""})),individual:E};async function Wt(){if(!zt)throw new Error("Choose an image to import.");let x=await kf(zt),J;if(Nt&&typeof Nt=="object"&&Array.isArray(Nt.cells))J=Nt.cells;else{if(!Number.isInteger(pe)||!Number.isInteger(st)||pe<1||st<1||pe*st>48)throw new Error("Choose a grid of up to 48 cells.");let ct=_e.split(",").map(C=>C.trim().toLowerCase().replace(/\s+/g,"_")).filter(Boolean);if(!ct.length||ct.length>pe*st)throw new Error("Supply one label per occupied cell, separated by commas.");J=ct.map((C,le)=>{let te=Math.floor(le%pe*x.naturalWidth/pe),Ht=Math.floor(Math.floor(le/pe)*x.naturalHeight/st);return{label:C,view:p,x:te,y:Ht,width:Math.floor((le%pe+1)*x.naturalWidth/pe)-te,height:Math.floor((Math.floor(le/pe)+1)*x.naturalHeight/st)-Ht}})}Ae(await G("import",{image:zt,cells:J})),Rt(""),Ze(null),N("Review"),K("Imported. Review and approve the cells you want.")}async function zn(){let x=He.filter(C=>X.includes(C.cell.id));if(!x.length)throw new Error("Select at least one candidate.");if(he&&we&&JSON.stringify(he)!==JSON.stringify(we.cell))throw new Error("Save your crop and alignment before approving.");let J=[];for(let C of x)J.push({id:C.cell.id,expected:C.cell,image:(await Tf(C.sheet,C.cell,C.cell.cleanup)).toDataURL("image/png")});let ct=await G("approve",{cells:J});Ae(ct.studio),a(ct.snapshot),ve([]),We(""),et(null),K("Selected sprites approved.")}async function Va(x){window.confirm(`Delete the ${x.cell.view} ${x.cell.label} candidate from review?`)&&(Ae(await G("discard",{id:x.cell.id})),ve(J=>J.filter(ct=>ct!==x.cell.id)),F===x.cell.id&&(We(""),et(null)),K("Candidate removed from review."))}async function ii(x){if(!window.confirm(`Remove the approved ${x.view} ${x.label} sprite from scenes?`))return;let J=await G("remove",x);Ae(J.studio),a(J.snapshot),Le(0),K("Approved sprite removed from scenes.")}return(0,S.jsxs)("section",{className:"vss","aria-label":e.name+" Sprite Studio",children:[(0,S.jsx)("style",{children:Ax}),(0,S.jsxs)("header",{className:"vss-header",children:[c?.reference?(0,S.jsx)("img",{src:c.reference.url,alt:e.name+" reference portrait",style:{width:56,height:64,objectFit:"contain",borderRadius:8}}):null,(0,S.jsxs)("div",{children:[(0,S.jsxs)("p",{className:"vss-hint",children:["Villagers / ",e.name]}),(0,S.jsxs)("h2",{ref:A,tabIndex:-1,children:[e.name,"\u2019s Sprite Studio"]}),(0,S.jsxs)("small",{children:[H.length," approved \xB7 ",He.length," awaiting review"]})]}),(0,S.jsx)("button",{onClick:()=>{T(async()=>{await Q(),i()})},disabled:ie,children:"\u2190 Back to Villagers"})]}),pt?(0,S.jsx)("p",{className:"vss-error",role:"alert",children:pt}):null,At?(0,S.jsx)("p",{role:"status",children:At}):null,!c||!h?(0,S.jsx)("p",{role:"status",children:"Loading saved sprite work\u2026"}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("nav",{className:"vss-nav","aria-label":"Sprite Studio sections",children:["Create","Review","Approved"].map(x=>(0,S.jsxs)("button",{"aria-pressed":w===x,onClick:()=>{N(x),x!=="Review"&&(We(""),et(null))},children:[x,x==="Review"&&He.length?" \xB7 "+He.length:""]},x))}),(0,S.jsxs)("div",{className:"vss-layout",children:[(0,S.jsxs)("aside",{className:"vss-panel vss-preview",children:[(0,S.jsx)("div",{className:"vss-row",children:["front","right","left"].map(x=>(0,S.jsx)("button",{"aria-pressed":xt===x,onClick:()=>Dt(x),children:x==="front"?"Facing you":x==="right"?"Facing right":"Facing left"},x))}),(0,S.jsx)("div",{className:"vss-stage","data-background":mt,"data-half":e.sprite?.framing.mode==="half",style:{"--crop":e.sprite?.framing.cropPercent??58},children:Ne?(0,S.jsx)(Sf,{candidate:Ne,mirrored:xt==="left"&&Ne.cell.view==="side"}):Ft?(0,S.jsx)("img",{src:Ft.url,alt:Ft.label+" approved sprite",style:{transform:xt==="left"&&Ft.view==="side"?"scaleX(-1)":void 0}}):c.reference?(0,S.jsx)("img",{src:c.reference.url,alt:"Captured identity reference"}):(0,S.jsx)("p",{children:"Capture or upload a reference to begin."})}),(0,S.jsxs)("label",{children:["Preview background",(0,S.jsxs)("select",{value:mt,onChange:x=>Oa(x.target.value),children:[(0,S.jsx)("option",{value:"scene",children:"Sample scene"}),(0,S.jsx)("option",{value:"light",children:"Light"}),(0,S.jsx)("option",{value:"dark",children:"Dark"}),(0,S.jsx)("option",{value:"checker",children:"Transparency checkerboard"})]})]}),!Ne&&W.length?(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsx)("button",{onClick:()=>Le(x=>x+1),children:"Next expression"}),(0,S.jsx)("span",{children:Ft?.label})]}):null,(0,S.jsx)("p",{className:"vss-hint",children:"Side poses address the other villager, with the body open to the audience. Left uses mirrored right-facing art."}),e.sprite?(0,S.jsxs)("details",{children:[(0,S.jsx)("summary",{children:"Display framing"}),(0,S.jsxs)("label",{children:["Framing",(0,S.jsxs)("select",{value:e.sprite.framing.mode,onChange:x=>{T(async()=>a(await t(s+"/framing",{method:"PATCH",body:JSON.stringify({mode:x.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,S.jsx)("option",{value:"full",children:"Full body"}),(0,S.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite.framing.mode==="half"?(0,S.jsxs)("label",{children:["Visible height",(0,S.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,onChange:x=>{T(async()=>a(await t(s+"/framing",{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(x.target.value)})})))}})]}):null]}):null]}),(0,S.jsx)("div",{className:"vss-panel",children:w==="Create"?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("h3",{children:"Create sprites"}),(0,S.jsx)("p",{className:"vss-progress",children:ne?H.some(x=>x.view==="side"&&x.label==="neutral")?"3 \xB7 Expand the expression set.":"2 \xB7 Establish and approve the side neutral.":"1 \xB7 Establish and approve the front neutral."}),(0,S.jsxs)("details",{open:!c.reference,children:[(0,S.jsx)("summary",{children:"Identity reference"}),c.reference?(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsx)("img",{className:"vss-reference",src:c.reference.url,alt:"Saved reference"}),(0,S.jsxs)("small",{children:[c.reference.origin==="snapshot"?"Captured with the villager snapshot":c.reference.origin==="upload"?"Uploaded reference":"Captured from the current card"," ","\xB7 ",new Date(c.reference.capturedAt).toLocaleDateString()]})]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("p",{className:"vss-hint",children:"This older snapshot has no saved avatar. Capturing now uses the current card, not its historical avatar."}),(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsx)("button",{disabled:ie,onClick:()=>{T(async()=>Ae(await G("reference",{})))},children:"Capture current card avatar"}),(0,S.jsxs)("label",{children:["Upload reference",(0,S.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",onChange:x=>{let J=x.target.files?.[0];J&&T(async()=>Ae(await G("reference",{image:await Nf(J)})))}})]})]})]})]}),(0,S.jsxs)("label",{children:["Image connection",(0,S.jsxs)("select",{value:h.connectionId,onChange:x=>xe({...h,connectionId:x.target.value}),onBlur:()=>{T(Q)},children:[(0,S.jsx)("option",{value:"",children:"Village default"}),h.connectionId&&!c.connections.some(x=>x.id===h.connectionId)?(0,S.jsx)("option",{value:h.connectionId,children:"Unavailable saved connection \u2014 choose another"}):null,c.connections.map(x=>(0,S.jsxs)("option",{value:x.id,children:[x.name," \xB7 ",x.model]},x.id))]})]}),(0,S.jsxs)("label",{children:["Style example",(0,S.jsx)("select",{value:h.style,onChange:x=>xe({...h,style:x.target.value}),onBlur:()=>{T(Q)},children:Object.keys(Hu).map(x=>(0,S.jsx)("option",{value:x,children:x==="PAPERCRAFT"?"Papercraft":x==="BATTLEHIGHWAY"?"Battle Highway":x},x))})]}),(0,S.jsxs)("label",{children:["Draw it in this style",(0,S.jsx)("textarea",{value:h.prompts[h.style],maxLength:6e3,onChange:x=>xe({...h,prompts:{...h.prompts,[h.style]:x.target.value}}),onBlur:()=>{T(Q)}})]}),(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsx)("button",{disabled:ie,onClick:()=>{T(Q)},children:"Save style and connection"}),h.style!=="Custom"?(0,S.jsx)("button",{onClick:()=>xe({...h,prompts:{...h.prompts,[h.style]:Hu[h.style]}}),children:"Reset example"}):null]}),(0,S.jsx)("p",{className:"vss-hint",children:"Changes apply to future draws. To restyle the whole character, replace the neutrals first, then regenerate chosen expressions."}),(0,S.jsxs)("label",{children:["View",(0,S.jsxs)("select",{value:p,onChange:x=>{b(x.target.value),Dt(x.target.value==="front"?"front":"right")},children:[(0,S.jsx)("option",{value:"front",children:"Front \xB7 facing you"}),(0,S.jsx)("option",{value:"side",children:"Side \xB7 facing villagers"})]})]}),(0,S.jsx)("div",{className:"vss-grid",children:[...new Set([...Uu,...H.map(x=>x.label),...R])].map(x=>(0,S.jsxs)("label",{className:"vss-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:R.includes(x),disabled:x!=="neutral"&&!ge,onChange:J=>lt(J.target.checked?[...R,x]:R.filter(ct=>ct!==x))}),x.replace(/_/g," ")]},x))}),(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsxs)("label",{children:["Custom expression",(0,S.jsx)("input",{value:V,onChange:x=>$(x.target.value),maxLength:40})]}),(0,S.jsx)("button",{disabled:!ge||!V.trim(),onClick:()=>{let x=V.trim().toLowerCase().replace(/\s+/g,"_");if(!/^[a-z0-9_-]{1,40}$/.test(x)){It("Use letters, numbers, dashes, or underscores.");return}lt([...new Set([...R,x])]),$("")},children:"Add expression"})]}),(0,S.jsxs)("details",{children:[(0,S.jsx)("summary",{children:"Expression poses"}),R.map(x=>(0,S.jsxs)("label",{children:[x,(0,S.jsx)("input",{value:y[x]??"",maxLength:500,placeholder:"Optional gesture or pose",onChange:J=>{v({...y,[x]:J.target.value}),j(null),Re.current=null}})]},x))]}),(0,S.jsxs)("label",{className:"vss-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:E,onChange:x=>{I(x.target.checked),j(null),Re.current=null}}),"Generate individual images instead of sheets"]}),(0,S.jsx)("button",{disabled:ie||ye||!R.length||p==="side"&&!ne,onClick:()=>{T(async()=>{await Q(),j(await G("plan",bt)),Re.current=null})},children:"Review generation plan"}),Y?(0,S.jsxs)("div",{className:"vss-panel",children:[(0,S.jsxs)("strong",{children:[Y.connection.name," \xB7 ",Y.connection.model]}),(0,S.jsxs)("p",{children:[Y.batches.length," image ",Y.batches.length===1?"submission":"submissions"," \xB7"," ",R.length," expressions \xB7"," ",Y.estimatedCost===null?"Cost unavailable":"Estimated $"+Y.estimatedCost.toFixed(3)]}),Y.batches.map((x,J)=>(0,S.jsxs)("small",{children:["Sheet ",J+1,": ",x.cols," \xD7 ",x.rows," cells \xB7 ",x.width," \xD7 ",x.height,"px \xB7"," ",x.count," expressions"]},J)),(0,S.jsxs)("small",{children:[Y.localWorkflow?"A local workflow may run multiple internal steps. Internal counts and cost are unavailable.":"Reference inputs may also be billed."," ","Villages sends one Engine request per listed sheet and never retries automatically. Provider-internal attempts and usage are unavailable; Studio blocks a separately configured Engine fallback."]}),Y.customParametersIgnored?(0,S.jsx)("small",{children:"Custom connection request fields are ignored for Studio draws so they cannot override the reviewed model, size, prompt, or image count."}):null,(0,S.jsx)("button",{className:"vss-primary",disabled:ie||ye,onClick:()=>{T(async()=>{Re.current??(Re.current=Cx()),Ae(await G("jobs",{...bt,submissionId:Re.current,plan:Y})),N("Review")})},children:"Generate selected sprites"})]}):null,(0,S.jsxs)("details",{children:[(0,S.jsx)("summary",{children:"Import sprites or a sheet \xB7 no image calls"}),(0,S.jsxs)("label",{children:["Image",(0,S.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",onChange:x=>{let J=x.target.files?.[0];J&&T(async()=>Rt(await Nf(J)))}})]}),(0,S.jsxs)("label",{children:["Optional exported JSON manifest",(0,S.jsx)("input",{type:"file",accept:".json,application/json",onChange:x=>{let J=x.target.files?.[0];J&&T(async()=>Ze(JSON.parse(await J.text())))}})]}),Nt?(0,S.jsx)("small",{children:"Cell positions and views will be read from the manifest."}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)("div",{className:"vss-fields",children:[(0,S.jsxs)("label",{children:["Columns",(0,S.jsx)("input",{type:"number",min:1,max:8,value:pe,onChange:x=>gt(Number(x.target.value))})]}),(0,S.jsxs)("label",{children:["Rows",(0,S.jsx)("input",{type:"number",min:1,max:24,value:st,onChange:x=>oe(Number(x.target.value))})]})]}),(0,S.jsxs)("label",{children:["Labels in reading order",(0,S.jsx)("input",{value:_e,onChange:x=>se(x.target.value)})]}),(0,S.jsx)("small",{children:"Uses the selected front/side view above. A single image uses a 1 \xD7 1 grid."})]}),(0,S.jsx)("button",{disabled:ie||!zt,onClick:()=>{T(Wt)},children:"Import for review"})]})]}):w==="Review"?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("h3",{children:"Review candidates"}),c.jobs.map(x=>(0,S.jsxs)("div",{className:"vss-progress",children:[(0,S.jsxs)("strong",{children:[x.model||"Generation"," \xB7 ",x.status]}),(0,S.jsxs)("small",{children:[" ","\xB7 ",x.attempted," submitted / ",x.planned," planned"]}),x.error?(0,S.jsx)("p",{className:"vss-hint",children:x.error}):null,x.pendingAssetId&&x.status!=="running"?(0,S.jsx)("button",{disabled:ie,onClick:()=>{T(async()=>Ae(await G("recover",{id:x.id})))},children:"Recover saved original \xB7 no image call"}):null,x.sheets.map(J=>(0,S.jsxs)("div",{children:[(0,S.jsx)("a",{href:J.url,target:"_blank",rel:"noreferrer",children:"Open original sheet"}),J.usage?(0,S.jsxs)("details",{children:[(0,S.jsx)("summary",{children:"Provider-reported usage"}),(0,S.jsx)("pre",{children:JSON.stringify(J.usage,null,2)})]}):(0,S.jsx)("small",{children:" \xB7 Usage unavailable"})]},J.assetId))]},x.id)),He.length?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsx)("button",{onClick:()=>ve(He.map(x=>x.cell.id)),children:"Select all"}),(0,S.jsx)("button",{onClick:()=>ve([]),children:"Clear selection"}),(0,S.jsxs)("button",{disabled:ie||!X.length,className:"vss-primary",onClick:()=>{T(zn)},children:["Approve selected (",X.length,")"]})]}),(0,S.jsx)("div",{className:"vss-grid",children:He.map(x=>(0,S.jsxs)("div",{className:"vss-card",children:[(0,S.jsx)("button",{"aria-label":"Edit "+x.cell.view+" "+x.cell.label,"aria-pressed":F===x.cell.id,onClick:()=>_t(x),children:(0,S.jsx)(Sf,{candidate:x})}),(0,S.jsxs)("label",{className:"vss-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:X.includes(x.cell.id),onChange:J=>ve(J.target.checked?[...X,x.cell.id]:X.filter(ct=>ct!==x.cell.id))}),x.cell.label]}),(0,S.jsx)("small",{children:x.cell.view}),(0,S.jsx)("button",{disabled:ie,onClick:()=>{T(()=>Va(x))},children:"Delete candidate"})]},x.cell.id))})]}):(0,S.jsx)("p",{className:"vss-hint",children:ye?"Generating. You can leave and return; the job and artwork are saved.":"No candidates awaiting review. Create or import a sheet to begin."}),Ne&&he?(0,S.jsxs)("div",{className:"vss-panel",children:[(0,S.jsx)("h3",{children:"Crop and alignment"}),(0,S.jsxs)("svg",{className:"vss-source",viewBox:`0 0 ${Ne.sheet.width} ${Ne.sheet.height}`,role:"img","aria-label":"Original sheet with selected crop",children:[(0,S.jsx)("image",{href:Ne.sheet.url,width:Ne.sheet.width,height:Ne.sheet.height}),(0,S.jsx)("rect",{x:he.x,y:he.y,width:he.width,height:he.height,fill:"none",stroke:"#c5a4ff",strokeWidth:Math.max(3,Ne.sheet.width/150)})]}),(0,S.jsxs)("div",{className:"vss-fields",children:[(0,S.jsxs)("label",{children:["Expression",(0,S.jsx)("input",{value:he.label,maxLength:40,onChange:x=>et({...he,label:x.target.value})})]}),(0,S.jsxs)("label",{children:["View",(0,S.jsxs)("select",{value:he.view,onChange:x=>et({...he,view:x.target.value}),children:[(0,S.jsx)("option",{value:"front",children:"Front"}),(0,S.jsx)("option",{value:"side",children:"Side"})]})]}),["x","y","width","height","scale","offsetX","offsetY"].map(x=>(0,S.jsxs)("label",{children:[{x:"Crop X",y:"Crop Y",width:"Crop width",height:"Crop height",scale:"Scale",offsetX:"Horizontal offset",offsetY:"Foot offset"}[x],(0,S.jsx)("input",{type:"number",step:x==="scale"?.05:1,value:he[x],onChange:J=>et({...he,[x]:Number(J.target.value)})})]},x))]}),(0,S.jsxs)("label",{className:"vss-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:he.cleanup??!1,onChange:x=>et({...he,cleanup:x.target.checked})}),"Remove edge-connected color matte locally"]}),(0,S.jsx)("small",{children:"Reversible. Preserves off-white paper borders. If a cutout still needs work, correct the crop or import a cleaned image."}),(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsx)("button",{disabled:ie,onClick:()=>{T(async()=>{Ae(await G("cell",{id:he.id,cell:he})),K("Crop and alignment saved.")})},children:"Save crop and alignment"}),(0,S.jsx)("button",{disabled:ie,onClick:()=>{T(()=>Va(Ne))},children:"Delete candidate"}),(0,S.jsx)("button",{disabled:ye,onClick:()=>{b(he.view),he.view!==p&&(ee.current=he.label),O([he.label]),v({...y,[he.label]:he.pose}),I(!0),j(null),Re.current=null,N("Create"),We(""),et(null)},children:"Prepare individual regeneration"})]})]}):null]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("h3",{children:"Approved sprites"}),(0,S.jsx)("p",{className:"vss-hint",children:"These sprites are used in scenes. Replacements only become active after approval."}),H.length?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("div",{className:"vss-grid",children:H.map(x=>(0,S.jsxs)("div",{className:"vss-card",children:[(0,S.jsx)("button",{onClick:()=>{Dt(x.view==="front"?"front":"right"),Le(H.filter(J=>J.view===x.view).indexOf(x))},children:(0,S.jsx)("img",{src:x.url,alt:x.view+" "+x.label})}),(0,S.jsx)("span",{children:x.label}),(0,S.jsx)("small",{children:x.view}),(0,S.jsx)("button",{onClick:()=>{b(x.view),x.view!==p&&(ee.current=x.label),O([x.label]),I(!0),j(null),Re.current=null,N("Create")},children:"Replace"}),(0,S.jsx)("button",{disabled:ie,onClick:()=>{T(()=>ii(x))},children:"Remove approved sprite"})]},x.view+":"+x.label))}),(0,S.jsx)("button",{disabled:ie,onClick:()=>{T(r)},children:"Download both views and manifest"})]}):(0,S.jsx)("p",{children:"No sprites approved yet."})]})})]})]})]})}var m=Ji(ys()),w1=Ji(V0());function _2(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),i="",r=[],s=[];for(let c=0;c<a.length;c++){let d=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(d)?.[1];if(h&&(i?h[0]===i[0]&&h.length>=i.length&&(i=""):i=h),!i&&!d.trim()&&(!t||c<a.length-1)){let f=r.join(`
`).trim();f&&s.push(f),r=[]}else r.push(d)}if(!t){let c=r.join(`
`).trim();c&&s.push(c)}return s}var H2=['"',"'","\u201D","\u2019","\xBB","\u300D"],U2=['"',"'","\u201C","\u2018","\xAB","\u300C"];function D0(e){let t=e.trim();return H2.includes(t.slice(-1))&&U2.some(i=>t.slice(0,-1).includes(i))?"speech":"prose"}function I0(e,t){let a=_2(e),i=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return i();let r=[],s=[],c=[],d=[];for(let h=0;h<a.length;h+=1){let f=t[h];if(f.kind==="untagged"){r.push(a[h]),s.push(d),c.push(f.expression??null),d=[];continue}let w={register:f.kind==="whisper"?"whisper":"side",text:f.text,...f.target?{target:f.target}:{}};r.length?s[s.length-1].push(w):d.push(w)}return r.length===0?i():{paragraphs:r,asides:s,expressions:c}}var q2="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function Nr(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],i=new RegExp(q2,"g"),r=0,s,c=d=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+d};return}a.push({kind:"text",text:d})};for(;(s=i.exec(e))!==null;)s.index>r&&c(e.slice(r,s.index)),s[1]!=null?c(s[1]):s[2]!=null&&s[3]!=null?a.push({kind:"link",text:s[2],href:s[3]}):s[4]!=null?a.push({kind:"code",text:s[4]}):s[5]!=null?a.push({kind:"styled",style:"highlight",children:Nr(s[5],t+1)}):s[6]!=null?a.push({kind:"styled",style:"strikethrough",children:Nr(s[6],t+1)}):s[7]!=null?a.push({kind:"styled",style:"bold-italic",children:Nr(s[7],t+1)}):s[8]!=null?a.push({kind:"styled",style:"bold",children:Nr(s[8],t+1)}):s[9]!=null?a.push({kind:"styled",style:"underline",children:Nr(s[9],t+1)}):(s[10]!=null||s[11]!=null)&&a.push({kind:"styled",style:"italic",children:Nr(s[10]??s[11],t+1)}),r=s.index+s[0].length;return r<e.length&&c(e.slice(r)),a}function _0(e){return Nr(e,0)}function ni(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function H0(e){return e===null||typeof e=="string"}function U0(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function Hd(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function B2(e){return e===null?!0:ni(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function j2(e){if(!ni(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!Hd(e.capabilities)||!ni(e.presentation)||!ni(e.occupancy)||!ni(e.state))return!1;let{presentation:t,occupancy:a,state:i}=e;return B2(t.image)&&U0(t.x)&&U0(t.y)&&typeof a.playerHome=="boolean"&&H0(a.residentCharacterId)&&H0(a.homeKind)&&typeof i.condition=="string"&&Hd(i.upgrades)&&Hd(i.furniture)&&Hd(i.publicFacts)&&typeof i.updatedAt=="string"}function q0(e){if(!ni(e)||!ni(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(j2),i=Array.isArray(e.venueRequests)?e.venueRequests:[],r=i.filter(s=>ni(s)&&typeof s.id=="string"&&ni(s.venueDraft)&&typeof s.venueDraft.name=="string"&&typeof s.venueDraft.category=="string");return a.length===t.length&&r.length===i.length&&i===e.venueRequests?e:{...e,venueRequests:r,settings:{...e.settings,venues:a}}}function B0(e,t,a){return e==="Enter"&&!t&&!a}function Ud(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,i=>i.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function j0(e,t,a,i){let r=Math.max(0,a-1);return!e||e.roomId!==t?r:a>e.stepCount?e.stepCount:Math.min(i,r)}function Po(e,t){return t?.roomId===e}function L0(e,t){return e.status==="closed"&&e.submissions?.some(a=>a.id===t)===!0}function G0(e,t){return t<0||t===e?"front":t<e?"left":"right"}function Y0(e,t,a){let i=a==="front"?"front":"side",r=e.find(s=>s.view===i&&s.label===t)??e.find(s=>s.view===i&&s.label==="neutral")??e.find(s=>s.view==="front"&&s.label===t)??e.find(s=>s.view==="front"&&s.label==="neutral");return r?{image:r,mirrored:r.view==="side"&&a==="left"}:null}function X0(e,t,a){let i=.2*a.photoWidth/a.width,r=.2*a.photoHeight/a.height;return t.some(s=>s.x!==null&&s.y!==null&&Math.abs(s.x-e.x)<i&&Math.abs(s.y-e.y)<r)}function P0(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var Bi=(e,t,a)=>Math.min(a,Math.max(t,e));function qd(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function Ip(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let i=Math.min(t.width/e.width,t.height/e.height),r=Math.max(a.zoom,qd(e,t)),s=e.width*i*r,c=e.height*i*r,d=t.width/2-a.centerX*s,h=t.height/2-a.centerY*c;return{left:s<=t.width?(t.width-s)/2:Bi(d,t.width-s,0),top:c<=t.height?(t.height-c)/2:Bi(h,t.height-c,0),width:s,height:c}}function Q0(e,t,a,i,r,s){let c=Ip(e,t,a);if(!c.width||!c.height)return a;let d=qd(e,t),h=Bi(a.zoom*s,d,Math.max(4,d*2)),f=h/Math.max(a.zoom,d),w=c.width*f,N=c.height*f,p=(i.x-c.left)/c.width,b=(i.y-c.top)/c.height,R=r.x-p*w,O=r.y-b*N;return{zoom:h,centerX:Bi((t.width/2-R)/w,0,1),centerY:Bi((t.height/2-O)/N,0,1)}}function Z0(e,t){let a=Math.max(1,t),i=Math.max(4,a*2);return .32+1.03*((Bi(e,a,i)-a)/(i-a))}function K0(e,t){return t?Math.max(1,e):e}function _p(e,t,a){let i=Math.min(90,t.width/2),r=64,s=116,c=e.left+a.x*e.width,d=e.top+a.y*e.height,h=d+r,f=h+s<=t.height?h:d-r-s;return{left:Bi(c,i,t.width-i),top:Bi(f,0,Math.max(0,t.height-s))}}var o=Ji(ws()),n="marinara-capability-villages",J0="marinara-capability-villages-styles",L2="/api/villages",G2=.7,Pp=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],Hp=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),Y2={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},Tr=e=>Pp.find(t=>t.value===e),X2=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,F0={roads:"auto",structures:"auto",water:"auto"},Bd=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],W0=1,e1=3,P2={residence:["A modest stone home, with ivy growing on the walls","A tent and hammock pitched in the shade between two pine trees","A mighty castle, with imposing obsidian pillars and multiple dungeons","A dumpster behind the supermarket","An armored cash transport car, converted into a mobile home"],gathering:["A communal fire pit, with logs and stumps arranged around it in a semicircle","A decommissioned pizzeria, complete with inert animatronic performers","The situation room, with a round table bearing strategic maps","The hardy Brandythrone tavern, where ale and fistfights are plentiful","A meticulously-landscaped public park, where trampling the roses is punishable by fine"]},Up="__villages_image_disabled__",t1=["neutral","happy","sad","angry","surprised","thinking"];function a1(e,t,a,i,r=!1,s=1){let c=t==="gathering"?"Gathering Place":r?"Your residence":`Residence ${s}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:i},occupancy:{playerHome:r,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}var $1={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function jd(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function Q2(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let i=Math.floor(a/36e5),r=Math.max(1,Math.ceil(a%36e5/6e4));return i>0?`${i}h ${r}m left`:`${r}m left`}function Z2({library:e,busy:t,onRefresh:a,onForget:i}){let[r,s]=(0,m.useState)("all"),[c,d]=(0,m.useState)(""),[h,f]=(0,m.useState)(""),[w,N]=(0,m.useState)(null),[p,b]=(0,m.useState)(""),R=Date.now(),O=(v,E)=>(!h.trim()||`${v} ${E.map(I=>I.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||E.some(I=>I.id===c)),V=(e?.recollections??[]).filter(v=>O(v.text,[...v.subjects,...v.knownBy])),$=(e?.durable??[]).filter(v=>O(v.text,[...v.subjects,...v.knownBy])),y=async(v,E)=>{try{let I=await U(`/rooms/archive/${encodeURIComponent(v)}`);N({visit:I.visit,lineIds:E}),b("")}catch(I){N(null),b(L(I,"The source visit could not be read."))}};return(0,o.jsxs)("div",{className:`${n}-memory-library`,children:[(0,o.jsxs)("section",{className:`${n}-memory-hero`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-kicker`,children:"Continuity, with receipts"}),(0,o.jsx)("h3",{children:"What your villagers carry forward"}),(0,o.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,o.jsxs)("div",{className:`${n}-memory-stats`,children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,o.jsxs)("div",{className:`${n}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"01"}),(0,o.jsx)("strong",{children:"Passing"}),(0,o.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"02"}),(0,o.jsx)("strong",{children:"Durable"}),(0,o.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"03"}),(0,o.jsx)("strong",{children:"Archive"}),(0,o.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,o.jsxs)("div",{className:`${n}-memory-health`,role:"status",children:[(0,o.jsx)("span",{children:"\u25C7"}),(0,o.jsxs)("div",{children:[(0,o.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,o.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,o.jsxs)("div",{className:`${n}-memory-toolbar`,children:[(0,o.jsx)("div",{className:`${n}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([v,E])=>(0,o.jsx)("button",{type:"button","data-active":r===v,onClick:()=>s(v),children:E},v))}),(0,o.jsx)("input",{type:"search",value:h,onChange:v=>f(v.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,o.jsxs)("select",{value:c,onChange:v=>d(v.target.value),"aria-label":"Filter memories by resident",children:[(0,o.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(v=>(0,o.jsx)("option",{value:v.id,children:v.name},v.id))]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&r!=="durable"&&V.length>0?(0,o.jsxs)("section",{className:`${n}-memory-section`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,o.jsx)("h3",{children:"Passing recollections"})]}),(0,o.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,o.jsx)("div",{className:`${n}-memory-grid`,children:V.map(v=>{let E=v.evidence[v.evidence.length-1]??{visitId:v.visitId,lineIds:[]};return(0,o.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"passing",children:[(0,o.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${n}-memory-pill`,children:"Passing"}),(0,o.jsx)("span",{children:Q2(v.expiresAt,R)})]}),(0,o.jsx)("p",{className:`${n}-memory-text`,children:v.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:jd(v.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:jd(v.knownBy)})]})]}),v.reinforcementCount>0?(0,o.jsxs)("p",{className:`${n}-memory-reinforced`,children:["\u21BB Reinforced ",v.reinforcementCount," ",v.reinforcementCount===1?"time":"times"]}):null,(0,o.jsxs)("div",{className:`${n}-memory-card-actions`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>{y(E.visitId,E.lineIds)},children:"View evidence"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>i("recollections",v.id),children:"Let go"})]})]},v.id)})})]}):null,e&&r!=="passing"&&$.length>0?(0,o.jsxs)("section",{className:`${n}-memory-section`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,o.jsx)("h3",{children:"Durable memories"})]}),(0,o.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,o.jsx)("div",{className:`${n}-memory-grid`,children:$.map(v=>(0,o.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"durable",children:[(0,o.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${n}-memory-pill`,children:v.memoryCategory?$1[v.memoryCategory]:v.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,o.jsxs)("span",{children:[v.dateLabel,n1(v)?` \xB7 ${n1(v)}`:""]})]}),(0,o.jsx)("p",{className:`${n}-memory-text`,children:v.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:jd(v.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:jd(v.knownBy)})]})]}),(0,o.jsxs)("div",{className:`${n}-memory-card-actions`,children:[v.evidence?(0,o.jsx)("button",{type:"button",onClick:()=>{y(v.evidence.visitId,v.evidence.lineIds)},children:"View evidence"}):(0,o.jsx)("span",{className:`${n}-memory-legacy`,children:"No evidence link on this older memory"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>i("durable",v.id),children:"Forget"})]})]},v.id))})]}):null,e&&(r!=="durable"&&V.length||r!=="passing"&&$.length)===0?(0,o.jsxs)("div",{className:`${n}-memory-empty`,children:[(0,o.jsx)("span",{children:"\u2727"}),(0,o.jsx)("h3",{children:"No memories match"}),(0,o.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,o.jsxs)("p",{className:`${n}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,p?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:p}):null,w?(0,o.jsxs)("section",{className:`${n}-memory-evidence`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,o.jsxs)("h3",{children:["Exact evidence \xB7 ",w.visit.placeName]})]}),(0,o.jsx)("button",{type:"button",onClick:()=>N(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,o.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,o.jsx)("ol",{children:w.visit.lines.filter(v=>w.lineIds.includes(v.id)).map(v=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:v.name||"Player"}),(0,o.jsxs)("small",{children:[Xd(v.at)," \xB7 heard by"," ",v.heardBy.map(E=>w.visit.participants.find(I=>I.characterId===E)?.name??E).join(", ")||"no one"]})]}),Ko(v.content,`memory-evidence-${v.id}-`)]},v.id))})]}):null]})}function Xd(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":T1.format(t)}function n1(e){return Xd(e.occurredAt)}function K2(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function i1(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function qp(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var J2=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function F2(e,t){let a=[],i=Date.parse(e);if(Number.isFinite(i)){let s=Math.floor((Date.now()-i)/864e5);a.push(s<=0?"written today":s===1?"written yesterday":`written ${s} days ago`)}let r=Date.parse(t);return a.push(Number.isFinite(r)?`fades ${J2.format(new Date(r))}`:"no set end"),a.join(" \xB7 ")}function W2(e,t){let a=e.find(i=>i.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(i=>i.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?Jt(a,t.spaceClass).image:null)?.url??"":""}var Qp=class extends m.Component{constructor(){super(...arguments);nf(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let i=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=i,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:i},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,o.jsx)("div",{className:`${n}-root`,role:"alert",children:(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h1",{className:`${n}-panel-title`,children:"Villages could not open"}),(0,o.jsx)("p",{className:`${n}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},Bp=`
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
`;function Zp(){let e=document.getElementById(J0);if(!document.querySelector(n)){e?.remove();return}if(e){e.textContent!==Bp&&(e.textContent=Bp);return}let t=document.createElement("style");t.id=J0,t.textContent=Bp,document.head.appendChild(t)}var eS=new MutationObserver(()=>{document.querySelector(n)&&Zp()});eS.observe(document.head,{childList:!0,subtree:!0});var tS="marinara_admin_secret";function x1(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(tS)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var aS="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function N1(e,t,a){let i=e?.error,r=typeof i=="string"&&i?i:a;return t===403&&/admin[-_ ]?secret/iu.test(r)?new Error(`${aS} (${r})`):new Error(r)}async function U(e,t){let a=await fetch(`${L2}${e}`,{...t,headers:x1(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw N1(i,a.status,`The village replied ${a.status}.`);return q0(i)}async function Jp(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:x1(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw N1(i,a.status,`The Engine replied ${a.status}.`);return i}var Sr=e=>typeof e=="number"&&Number.isFinite(e);function Fp(e){let t=e;for(let N=0;N<2&&typeof t=="string";N+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:i,srcY:r,srcWidth:s,srcHeight:c}=a;if(Sr(i)&&Sr(r)&&Sr(s)&&Sr(c))return s<=0||c<=0||i<0||r<0||i+s>1.001||r+c>1.001?null:{srcX:i,srcY:r,srcWidth:s,srcHeight:c};let{zoom:d,offsetX:h,offsetY:f,fullImage:w}=a;return!Sr(d)||d<=0||!Sr(h)||!Sr(f)||w!==void 0&&typeof w!="boolean"?null:w===void 0?{zoom:d,offsetX:h,offsetY:f}:{zoom:d,offsetX:h,offsetY:f,fullImage:w}}function nS(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function iS(e,t){if(e.length===0)return{};let a=await Jp("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),i={};if(!Array.isArray(a))return i;for(let r of a){let s=typeof r?.id=="string"?r.id:"",c=typeof r?.avatarUrl=="string"?r.avatarUrl.trim():"";s.length>0&&c.length>0&&(i[s]={url:c,crop:Fp(r.avatarCrop)})}return i}async function rS(e,t){let a=e.trim();if(a.length===0)return null;let i=await Jp(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),r=typeof i?.avatarPath=="string"?i.avatarPath.trim():"";return r.length===0?null:{url:r,crop:Fp(i.avatarCrop)}}function oS(e){let t=[];for(let a of e){let i=typeof a.id=="string"?a.id.trim():"";if(i.length===0)continue;let r=typeof a.provider=="string"?a.provider:"";if(r==="video_generation")continue;let s=typeof a.name=="string"&&a.name.trim()?a.name.trim():i;t.push({id:i,name:s,category:r==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function L(e,t){return e instanceof Error&&e.message?e.message:t}function Qo(e){let t=L(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function r1(e){try{let{session:t}=await U("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}async function o1(e,t){try{let{visit:a}=await U(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return L0(a,t)?a:null}catch{return null}}function s1(e){let t=L(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function Pd(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function Ko(e,t){return S1(_0(e),t)}function S1(e,t){let a=0;return e.map(i=>{let r=`${t}${a++}`;switch(i.kind){case"text":return i.text;case"code":return(0,o.jsx)("code",{className:`${n}-chat-md-code`,dir:"ltr",children:i.text},r);case"link":return(0,o.jsx)("a",{className:`${n}-chat-md-link`,href:i.href,target:"_blank",rel:"noopener noreferrer",children:i.text},r);default:return sS(i,r)}})}function sS(e,t){let a=S1(e.children,`${t}-`);switch(e.style){case"bold":return(0,o.jsx)("strong",{children:a},t);case"bold-italic":return(0,o.jsx)("strong",{children:(0,o.jsx)("em",{children:a})},t);case"italic":return(0,o.jsx)("em",{children:a},t);case"underline":return(0,o.jsx)("u",{children:a},t);case"strikethrough":return(0,o.jsx)("del",{children:a},t);default:return(0,o.jsx)("mark",{className:`${n}-chat-md-highlight`,children:a},t)}}function lS(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function Qd(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var k1=["residence","workplace","gathering","other"];function An(e){return e.classes?.length?e.classes:Qd(e)?["residence"]:["other"]}function l1(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function Zd(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function Jt(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function c1({draft:e,existing:t,villagers:a,editableClasses:i,onChange:r}){let s=An(e),c=(d,h)=>{let f=s.map(w=>w===d?{...Jt(e,w),...h}:Jt(e,w));r({...e,spaces:f,description:f[0]?.description??e.description})};return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["Name",(0,o.jsx)("input",{className:`${n}-notice-input`,value:e.name,maxLength:100,onChange:d=>r({...e,name:d.target.value}),placeholder:"The Lantern Workshop"})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Form ",(0,o.jsx)("span",{className:`${n}-hint`,children:"What is it, in your world?"}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:e.form??"",maxLength:200,onChange:d=>r({...e,form:d.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Map pin \xB7 optional"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,o.jsx)("div",{className:`${n}-row`,children:["x","y"].map(d=>(0,o.jsxs)("label",{className:`${n}-label`,children:[d==="x"?"Across":"Down",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[d]??"",disabled:t&&Zd(e)>0,onChange:h=>r({...e,presentation:{...e.presentation,[d]:h.target.value===""?null:Number(h.target.value)}})})]},d))}),t&&Zd(e)>0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${n}-row`,children:k1.map(d=>(0,o.jsxs)("label",{className:`${n}-label`,style:{textTransform:"capitalize"},children:[(0,o.jsx)("input",{type:"checkbox",checked:s.includes(d),disabled:t||!s.includes(d)&&s.length>=2,onChange:h=>{let f=h.target.checked?[...s,d]:s.filter(w=>w!==d);f.length<1||f.length>2||r({...e,classes:f,spaces:f.map(w=>Jt(e,w))})}})," ",d]},d))}),t?(0,o.jsx)("p",{className:`${n}-hint`,children:"Class changes go through a Venue proposal."}):null]}),s.includes("residence")?(0,o.jsxs)("label",{className:`${n}-label`,children:["Resident capacity \xB7 includes you",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:d=>r({...e,residenceCapacity:Number(d.target.value)})}),t?(0,o.jsx)("span",{className:`${n}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,s.includes("workplace")?(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Workers"}),a.map(d=>(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(d.characterId),onChange:h=>r({...e,workerIds:h.target.checked?[...e.workerIds??[],d.characterId]:(e.workerIds??[]).filter(f=>f!==d.characterId)})})," ",d.name]},d.characterId)),a.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No villagers are available yet."}):null]}):null,s.filter(d=>!i||i.includes(d)).map(d=>{let h=Jt(e,d);return(0,o.jsxs)("section",{className:`${n}-field`,children:[(0,o.jsxs)("h3",{className:`${n}-panel-title`,style:{textTransform:"capitalize"},children:[d," space"]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.description,maxLength:1e3,onChange:f=>c(d,{description:f.target.value})})]}),(0,o.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Current physical state used by visits and pictures."}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:h.state.condition,onChange:f=>c(d,{state:{...h.state,condition:f.target.value}})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this space."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.state.items.join(`
`),onChange:f=>c(d,{state:{...h.state,items:f.target.value.split(`
`)}})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this space."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.state.publicFacts.join(`
`),onChange:f=>c(d,{state:{...h.state,publicFacts:f.target.value.split(`
`)}})})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((f,w)=>(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("input",{className:`${n}-notice-input`,value:f.text,"aria-label":`Feature ${w+1}`,onChange:N=>c(d,{state:{...h.state,features:h.state.features.map(p=>p.id===f.id?{...p,text:N.target.value}:p)}})}),(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:f.locked,onChange:N=>c(d,{state:{...h.state,features:h.state.features.map(p=>p.id===f.id?{...p,locked:N.target.checked}:p)}})})," ","Locked"]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,"aria-label":`Remove feature ${w+1}`,onClick:()=>c(d,{state:{...h.state,features:h.state.features.filter(N=>N.id!==f.id)}}),children:"\xD7"})]},f.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:h.state.features.length>=5,onClick:()=>c(d,{state:{...h.state,features:[...h.state.features,{id:Ud(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},d)})]})}function Zo(e){return e.filter(t=>!Qd(t)||An(t).some(a=>a!=="residence"))}function Ld(){return Math.random().toString(36).slice(2,10)}function kr(e){return Math.round(e*1e4)/1e4}var cS=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),T1=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),dS=6e4,uS=700;function d1(e){return`${cS.format(e)} \xB7 ${T1.format(e)}`}function hS(){let[e,t]=(0,m.useState)(()=>d1(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(d1(new Date)),1e3);return()=>clearInterval(a)},[]),e}function mS(){let[e,t]=hS().split(" \xB7 ");return(0,o.jsxs)("span",{className:`${n}-mobile-clock`,children:[(0,o.jsx)("span",{children:e}),(0,o.jsx)("strong",{children:t})]})}function pS({weather:e}){return(0,o.jsxs)("span",{className:`${n}-mobile-datetime`,children:[(0,o.jsx)(mS,{}),(0,o.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:gS(e)})]})}function gS(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function u1(e){return e?.closest(n)??null}function fS(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let r=()=>t(u1(document.fullscreenElement)!==null);return r(),document.addEventListener("fullscreenchange",r),()=>document.removeEventListener("fullscreenchange",r)},[]);let a=document.fullscreenEnabled,i=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":i,title:i,onClick:r=>{let s=u1(r.currentTarget);if(!s)return;if(document.fullscreenElement===s){document.exitFullscreen().catch(()=>{});return}let c=s.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,o.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,o.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,o.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function bS({happenings:e,recap:t,mobile:a=!1}){let i=(0,m.useRef)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=i.current;if(!c)return;let d=()=>s(c.open);return c.addEventListener("toggle",d),()=>c.removeEventListener("toggle",d)},[]),(0,m.useEffect)(()=>{if(!r)return;let c=d=>{!(d.target instanceof Node)||i.current?.contains(d.target)||i.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[r]),(0,o.jsxs)("details",{ref:i,className:`${n}-news`,children:[(0,o.jsxs)("summary",{className:`${n}-button ${n}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,o.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,o.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,o.jsx)("span",{className:`${n}-news-nyi`,children:"NYI"})]}),(0,o.jsxs)("div",{className:`${n}-news-panel`,children:[(0,o.jsx)("h2",{className:`${n}-news-title`,children:"Events"}),t?(0,o.jsxs)("div",{children:[(0,o.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,o.jsx)("ul",{className:`${n}-news-list`,children:t.details.map(c=>(0,o.jsx)("li",{className:`${n}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,o.jsx)("p",{className:`${n}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,o.jsxs)("p",{className:`${n}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,o.jsx)("p",{className:`${n}-news-empty`,children:"No events to show yet."}):(0,o.jsx)("ul",{className:`${n}-news-list`,children:e.map(c=>(0,o.jsx)("li",{className:`${n}-news-item`,children:c.text},c.id))})]})]})}function C1(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function vS(e){return e.length>0?C1(e,!0):"Empty house"}function yS(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function h1(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function wS(e,t){return t.length>0?C1(t,!0):e.name||"An empty house"}function Gd(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var $S=.028;function kl(e){return new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(typeof i.result=="string"?i.result:""),i.onerror=()=>a(new Error("That picture could not be read.")),i.readAsDataURL(e)})}function Yd(e){return new Promise((t,a)=>{let i=new Image;i.onload=()=>t({width:i.naturalWidth,height:i.naturalHeight}),i.onerror=()=>a(new Error("That picture could not be read.")),i.src=e})}var m1=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function jp(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}var xS=`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><rect width="640" height="440" fill="#11285b"/><g stroke="#6c9bd5" opacity=".34" stroke-width="1"><path d="M0 40H640M0 80H640M0 120H640M0 160H640M0 200H640M0 240H640M0 280H640M0 320H640M0 360H640M0 400H640M40 0V440M80 0V440M120 0V440M160 0V440M200 0V440M240 0V440M280 0V440M320 0V440M360 0V440M400 0V440M440 0V440M480 0V440M520 0V440M560 0V440M600 0V440"/></g><g fill="none" stroke="#d7e9ff" stroke-width="5" stroke-linejoin="round"><path d="M110 195 320 88 530 195 320 302Z"/><path d="M110 195v150l210 87 210-87V195M320 302v130"/><path d="M212 153v89l108 46 108-46v-89M257 128v76l63 29 63-29v-76"/><path d="M160 221v72l95 40v-72zM385 334l95-40v-72l-95 40z"/></g><g fill="#d7e9ff" font-family="Arial,sans-serif" letter-spacing="9" text-anchor="middle"><text x="320" y="48" font-size="22">VILLAGE PROJECT</text></g></svg>')}`;function Lp(e,t,a){return e<t?t:e>a?a:e}function NS(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),d=e.width*c,h=e.height*c;return{left:(t.width-d)/2,top:(t.height-h)/2,width:d,height:h}}let i=Math.max(t.width/e.width,t.height/e.height)*a.zoom,r=e.width*i,s=e.height*i;return{left:(t.width-r)*(a.focusX/100),top:(t.height-s)*(a.focusY/100),width:r,height:s}}function SS(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Nl(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function Gp({src:e,alt:t,pins:a,placing:i,view:r,shape:s,zoom:c,onPlace:d,onView:h,onDismiss:f,compact:w,fitToRoom:N,mobile:p,photoPins:b,children:R}){let O=d!==void 0,V=h!==void 0,$=(0,m.useRef)(null),y=(0,m.useRef)(null),[v,E]=(0,m.useState)(null),[I,Y]=(0,m.useState)(null),[j,X]=(0,m.useState)(null),ve=(0,m.useRef)(null),F=(0,m.useRef)(new Map),We=(0,m.useRef)(null),[he,et]=(0,m.useState)(null),[mt,Oa]=(0,m.useState)(null),xt=(0,m.useRef)(null),Dt=(0,m.useRef)(null),je=(0,m.useRef)(!1),[Le,ie]=(0,m.useState)(null),Ve=(0,m.useMemo)(()=>Le?{...r,...Le}:r,[Le,r]),pt=e?v?.src===e?v:null:s,It={zoom:pt&&I?qd(pt,I):1,centerX:.5,centerY:.5},At=j??It,K=(0,m.useMemo)(()=>p?pt&&I?Ip(pt,I,At):null:e?v&&v.src===e&&I?NS(v,I,Ve):null:I?{left:0,top:0,width:I.width,height:I.height}:null,[v,I,Ve,p,pt,At,e]);(0,m.useEffect)(()=>{X(null),ve.current=null,F.current.clear(),We.current=null},[e,I?.width,I?.height]);let zt=s?N&&he?{width:`${he.width}px`,height:`${he.height}px`,aspectRatio:`${s.width} / ${s.height}`}:{aspectRatio:`${s.width} / ${s.height}`}:void 0,Rt=(0,m.useCallback)(()=>{let A=y.current;if(!A)return;let H=A.getBoundingClientRect();H.width===0||H.height===0||Y(ne=>ne&&ne.width===H.width&&ne.height===H.height?ne:{width:H.width,height:H.height})},[]);(0,m.useEffect)(()=>{let A=y.current;if(!A||typeof ResizeObserver>"u")return;let H=new ResizeObserver(()=>Rt());return H.observe(A),()=>H.disconnect()},[Rt]);let Nt=(0,m.useCallback)(()=>{let A=$.current?.parentElement;if(!A||!s)return;let H=A.getBoundingClientRect(),ne=getComputedStyle(A),ge=W=>Number.parseFloat(ne.getPropertyValue(W))||0,ye=H.width-ge("padding-left")-ge("padding-right"),He=H.height-ge("padding-top")-ge("padding-bottom"),we=s.width/s.height,Ne=Math.min(ye,He*we);Ne>0&&et(W=>W&&Math.abs(W.width-Ne)<.5?W:{width:Ne,height:Ne/we})},[s]);(0,m.useLayoutEffect)(()=>{if(!N||(Nt(),typeof ResizeObserver>"u"))return;let A=$.current?.parentElement;if(!A)return;let H=new ResizeObserver(()=>Nt());return H.observe(A),()=>H.disconnect()},[N,Nt]);let Ze=(0,m.useCallback)(A=>{if(!O||!d||!K)return;let H=A.currentTarget.getBoundingClientRect(),ne=(A.clientX-H.left-K.left)/K.width,ge=(A.clientY-H.top-K.top)/K.height;if(!(ne>=0&&ne<=1)||!(ge>=0&&ge<=1))return;let He=y.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();d(kr(ne),kr(ge),{width:K.width,height:K.height,photoWidth:He?.width??58,photoHeight:He?.height??58})},[d,O,K]),pe=(0,m.useCallback)(A=>{if(!V||!K||!h||Ve.fit!=="cover")return;let H=A.currentTarget.getBoundingClientRect();xt.current={x:A.clientX,y:A.clientY,focusX:Ve.focusX,focusY:Ve.focusY,spanX:H.width-K.width,spanY:H.height-K.height},ie({focusX:Ve.focusX,focusY:Ve.focusY}),A.currentTarget.setPointerCapture(A.pointerId),A.preventDefault()},[V,Ve.focusX,Ve.focusY,Ve.fit,h,K]),gt=(0,m.useCallback)(A=>{let H=xt.current;if(!H)return;let ne=H.spanX===0?H.focusX:H.focusX+(A.clientX-H.x)/H.spanX*100,ge=H.spanY===0?H.focusY:H.focusY+(A.clientY-H.y)/H.spanY*100;ie({focusX:kr(Lp(ne,0,100)),focusY:kr(Lp(ge,0,100))})},[]),st=(0,m.useCallback)(A=>{if(!xt.current)return;xt.current=null,A.currentTarget.hasPointerCapture(A.pointerId)&&A.currentTarget.releasePointerCapture(A.pointerId);let H=Le;ie(null),H&&h&&h({...r,...H})},[Le,h,r]),oe=(0,m.useCallback)(A=>{!h||!c||h({...r,zoom:kr(Lp(A,c.min,c.max))})},[h,r,c]),_e=()=>{let A=[...F.current.values()];if(A.length===0){We.current=null;return}let H=A[0],ne=A[1];We.current={view:ve.current??At,x:ne?(H.x+ne.x)/2:H.x,y:ne?(H.y+ne.y)/2:H.y,distance:ne?Math.hypot(H.x-ne.x,H.y-ne.y):1}},se=A=>{if(!p||A.pointerType!=="touch"||(A.isPrimary&&(F.current.clear(),je.current=!1),!y.current)||A.target instanceof Element&&A.target.closest(`.${n}-doors, .${n}-zoom`))return;$.current?.setAttribute("data-mobile-gesturing","true");let H=y.current.getBoundingClientRect();F.current.set(A.pointerId,{x:A.clientX-H.left,y:A.clientY-H.top}),F.current.size>1&&(je.current=!0),_e()},Re=A=>{if(!p||!F.current.has(A.pointerId)||!pt||!I||!y.current)return;let H=y.current.getBoundingClientRect();F.current.set(A.pointerId,{x:A.clientX-H.left,y:A.clientY-H.top});let ne=[...F.current.values()],ge=ne[0],ye=ne[1],He=ye?(ge.x+ye.x)/2:ge.x,we=ye?(ge.y+ye.y)/2:ge.y,Ne=ye?Math.hypot(ge.x-ye.x,ge.y-ye.y):1,W=We.current;if(!W||!P0(W,{x:He,y:we,distance:Ne})&&!je.current)return;je.current||f?.(),je.current=!0;let Ae=Q0(pt,I,W.view,{x:W.x,y:W.y},{x:He,y:we},ye&&W.distance>0?Ne/W.distance:1);ve.current=Ae,X(Ae)},ee=(A,H=!1)=>{if(!p||!F.current.has(A.pointerId))return;let ne=!H&&F.current.size===1&&!je.current;if(F.current.delete(A.pointerId),F.current.size===0&&$.current?.removeAttribute("data-mobile-gesturing"),_e(),!ne||!(A.target instanceof Element))return;let ge=A.target.closest(`.${n}-pin`)?.dataset.pinId,ye=ge?a.find(He=>He.id===ge):null;if(ye?.onSelect){je.current=!0,ye.onSelect();return}if(!(!A.target.closest(`.${n}-canvas`)||A.target.closest("button")))if(O&&i&&d&&K){let He=y.current.getBoundingClientRect(),we=(A.clientX-He.left-K.left)/K.width,Ne=(A.clientY-He.top-K.top)/K.height;if(we>=0&&we<=1&&Ne>=0&&Ne<=1){je.current=!0;let Ft=y.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();d(kr(we),kr(Ne),{width:K.width,height:K.height,photoWidth:Ft?.width??72,photoHeight:Ft?.height??72})}}else f&&(je.current=!0,f())};return(0,o.jsxs)("div",{ref:$,className:`${n}-stage${w?` ${n}-stage-compact`:""}`,style:zt,"data-shaped":s?"true":"false","data-framing":V&&Ve.fit==="cover"?"true":"false","data-mobile":p?"true":"false","data-photo-pins":b?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:A=>{if(p){se(A);return}je.current=!1,Dt.current=A.pointerType==="touch"?{x:A.clientX,y:A.clientY}:null},onPointerMoveCapture:A=>{if(p){Re(A);return}let H=Dt.current;H&&(Math.abs(A.clientX-H.x)>8||Math.abs(A.clientY-H.y)>8)&&(je.current=!0)},onPointerUpCapture:p?ee:void 0,onPointerCancelCapture:A=>{p&&ee(A,!0),Dt.current&&(je.current=!0)},onClickCapture:A=>{je.current&&(je.current=!1,A.preventDefault(),A.stopPropagation())},children:[R,(0,o.jsxs)("div",{ref:y,className:`${n}-canvas`,"data-placing":O&&i?"true":"false","data-dragging":Le?"true":"false",onClick:O&&i?Ze:f?()=>f():void 0,onPointerDown:V?pe:void 0,onPointerMove:V?gt:void 0,onPointerUp:V?st:void 0,onPointerCancel:V?st:void 0,children:[e?(0,o.jsx)("img",{className:`${n}-canvas-img`,style:p&&K?{position:"absolute",left:K.left,top:K.top,width:K.width,height:K.height,objectFit:"fill"}:SS(Ve),src:e,alt:t,draggable:!1,onLoad:A=>{let{naturalWidth:H,naturalHeight:ne}=A.currentTarget;H<=0||ne<=0||(E({src:e,width:H,height:ne}),Rt())},onError:()=>Oa(e)}):(0,o.jsxs)(o.Fragment,{children:[p&&K?(0,o.jsx)("span",{className:`${n}-mobile-logical`,style:{left:K.left,top:K.top,width:K.width,height:K.height},"aria-hidden":"true"}):null,(0,o.jsx)("span",{className:`${n}-canvas-empty`,children:"Logical village map"})]}),e&&mt===e?(0,o.jsx)("span",{className:`${n}-canvas-missing`,children:"The map picture could not be loaded \u2014 choose another one in Village Settings \u2192 Village Map."}):null,K?a.map(A=>(0,o.jsxs)("span",{className:`${n}-pin-holder`,"data-selected":A.selected?"true":"false",style:{left:`${K.left+A.x*K.width}px`,top:`${K.top+(A.y+(p&&A.kind!=="person"?0:A.dy??0))*K.height}px`},children:[(0,o.jsx)("button",{type:"button",className:`${n}-pin`,"data-pin-id":A.id,"data-tone":A.tone,"data-kind":A.kind??"place","data-selected":A.selected?"true":"false","aria-expanded":A.doors?!0:void 0,disabled:A.onSelect===void 0,title:A.text,onClick:H=>{H.stopPropagation(),A.onSelect?.()},children:(p||b)&&A.kind!=="person"?(0,o.jsxs)("span",{className:`${n}-pin-photo-card`,style:{transform:`scale(${K0(p?Z0(At.zoom,It.zoom):G2,A.selected===!0)})`},children:[(0,o.jsxs)("span",{className:`${n}-pin-photo`,"aria-hidden":"true",children:[A.image?(0,o.jsx)("img",{src:A.image,alt:"",loading:"lazy",draggable:!1}):(0,o.jsx)("span",{className:`${n}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,o.jsx)("span",{className:`${n}-pin-photo-tack`})]}),(0,o.jsx)("span",{className:`${n}-pin-name`,children:A.text})]}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("span",{"aria-hidden":"true",className:`${n}-pin-tack`,children:(0,o.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,o.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,o.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,o.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,o.jsx)("span",{className:`${n}-pin-name`,children:A.text})]})}),A.onRemove?(0,o.jsx)("button",{type:"button",className:`${n}-pin-remove`,"aria-label":`Take ${A.text} off the map`,onClick:H=>{H.stopPropagation(),A.onRemove?.()},children:"\xD7"}):null,A.onResume?(0,o.jsx)("button",{type:"button",className:`${n}-pin-resume`,onClick:H=>{H.stopPropagation(),A.onResume?.()},children:"DEBUG: Resume Chat"}):null]},A.id)):null]}),K?a.filter(A=>A.doors!==void 0&&A.doors.length>0).map(A=>(0,o.jsx)("div",{className:`${n}-doors`,style:{left:`${I?_p(K,I,A).left:K.left+A.x*K.width}px`,top:`${I?_p(K,I,A).top:K.top+(A.y+(A.dy??0))*K.height}px`},children:A.doors?.map(H=>(0,o.jsx)("button",{type:"button",className:`${n}-door`,onClick:ne=>{ne.stopPropagation(),H.onSelect()},children:H.label},H.label))},`doors:${A.id}`)):null,V&&c&&Ve.fit==="cover"?(0,o.jsxs)("div",{className:`${n}-zoom`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:Ve.zoom>=c.max,onClick:()=>oe(Ve.zoom+c.step),children:"+"}),(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:Ve.zoom<=c.min,onClick:()=>oe(Ve.zoom-c.step),children:"\u2212"}),(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:Ve.focusX===50&&Ve.focusY===50&&Ve.zoom===c.min,onClick:()=>{h&&h({...r,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function Sl(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function kS({scenario:e}){let t=X2(e),[a,i]=(0,m.useState)(null);return(0,o.jsxs)("div",{className:`${n}-scenario-art-panel`,children:[a===t?(0,o.jsx)("span",{className:`${n}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,o.jsx)("img",{src:t,alt:`${Tr(e).label} village scene`,onError:()=>i(t)}),(0,o.jsxs)("div",{className:`${n}-scenario-art-content`,children:[(0,o.jsx)("p",{children:"A new beginning awaits."}),(0,o.jsx)("strong",{children:Tr(e).description})]})]})}function TS({label:e,choices:t,selectedId:a,onSelect:i,disabled:r,emptyMessage:s}){return t.length?(0,o.jsx)("div",{className:`${n}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,o.jsxs)("button",{type:"button",className:`${n}-identity-card`,"aria-pressed":a===c.id,disabled:r,onClick:()=>i(c.id),children:[(0,o.jsx)(Cr,{portrait:c.portrait,name:c.name,className:`${n}-identity-card-face`,glyph:"person"}),(0,o.jsx)("strong",{children:c.name}),c.hint?(0,o.jsx)("small",{children:c.hint}):null]},c.id))}):(0,o.jsx)("p",{className:`${n}-hint`,children:s})}function CS({value:e}){return(0,o.jsxs)("section",{className:`${n}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,o.jsx)(Cr,{portrait:e.portrait,name:e.name,className:`${n}-identity-preview-face`,glyph:"person"}),(0,o.jsxs)("div",{className:`${n}-identity-preview-copy`,children:[(0,o.jsx)("h3",{children:e.name}),e.overview?(0,o.jsx)("p",{className:`${n}-identity-overview`,children:e.overview}):null,e.details.length?(0,o.jsx)("dl",{className:`${n}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:t}),(0,o.jsx)("dd",{children:a})]},t))}):null,(0,o.jsx)("p",{className:`${n}-identity-context`,children:e.context})]})]})}function p1(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let i=a.lastIndexOf(" ",t),r=a.indexOf(" ",t);return`${a.slice(0,i>0?i:r>0?r:a.length).trimEnd()}\u2026`}function g1(e){return e.avatarPath?{url:e.avatarPath,crop:Fp(e.avatarCrop)}:void 0}function ES({personas:e,draft:t,onDraft:a,disabled:i}){let[r,s]=(0,m.useState)(""),[c,d]=(0,m.useState)(null),[h,f]=(0,m.useState)(""),w=e?.find(O=>O.id===t),N=w?.id,p=r.trim().toLocaleLowerCase(),b=(e??[]).filter(O=>!p||`${O.name} ${O.summary}`.toLocaleLowerCase().includes(p)).sort((O,V)=>O.name.localeCompare(V.name,void 0,{sensitivity:"base"})).map(O=>({id:O.id,name:O.name,portrait:g1(O),hint:O.summary}));(0,m.useEffect)(()=>{if(d(null),f(""),!t||!N)return;let O=new AbortController;return U(`/personas/${encodeURIComponent(t)}`,{signal:O.signal}).then(V=>{O.signal.aborted||d(V.persona)}).catch(V=>{O.signal.aborted||f(L(V,"This Persona could not be read."))}),()=>O.abort()},[t,N]);let R=c&&c.id===t?{id:c.id,name:c.name,portrait:g1(c),overview:p1(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,O])=>O.trim()).map(([O,V])=>({label:O,text:p1(V,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,o.jsxs)("div",{className:`${n}-founding-persona`,children:[(0,o.jsxs)("div",{className:`${n}-identity-picker-head`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-persona-search`,children:"Who are you?"}),(0,o.jsx)("input",{id:`${n}-setup-persona-search`,className:`${n}-search`,type:"search",value:r,placeholder:"Search Personas",onChange:O=>s(O.target.value),disabled:i||e===null})]}),(0,o.jsx)(TS,{label:"Choose a Persona",choices:b,selectedId:t,onSelect:a,disabled:i,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!w?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):R?(0,o.jsx)(CS,{value:R}):h?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:h}):w?(0,o.jsxs)("p",{className:`${n}-hint`,children:["Reading ",w.name,"\u2026"]}):(0,o.jsx)("p",{className:`${n}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function AS({idPrefix:e,personas:t,draft:a,onDraft:i,storedId:r,storedName:s,storedMissing:c,disabled:d}){let h=(t??[]).find(p=>p.id===a)??null,f=h?.name??(a===r?s:""),w=c&&a===r,N=a.length>0;return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-${e}-persona`,children:"Who are you?"}),(0,o.jsxs)("select",{id:`${n}-${e}-persona`,className:`${n}-select`,value:a,disabled:d||t===null||t.length===0,onChange:p=>i(p.target.value),children:[(0,o.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(p=>(0,o.jsx)("option",{value:p.id,children:p.isActive?`${p.name} \u2014 your Persona`:p.name},p.id))]}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(p=>p.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),N?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:w?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":f.length>0?`The villagers know you as ${f}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,o.jsx)("p",{className:`${n}-macro-help`,children:h.summary}):null]}):null]})}function f1({books:e,error:t,selected:a,onChange:i,disabled:r}){let[s,c]=(0,m.useState)(""),d=new Map((e??[]).map(b=>[b.id,b])),h=(e??[]).filter(b=>!b.hiddenFromLibrary||a.includes(b.id)),f=a.filter(b=>!d.has(b)),N=[...h,...f.map(b=>({id:b,name:b,enabled:!1}))].filter(b=>b.name.toLocaleLowerCase().includes(s.trim().toLocaleLowerCase())),p=N.slice(0,50);return(0,o.jsxs)("fieldset",{className:`${n}-field ${n}-lore-picker`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Lorebooks for this village"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,o.jsx)("div",{className:`${n}-lore-selected`,"aria-live":"polite",children:a.length?a.map(b=>(0,o.jsxs)("span",{className:`${n}-lore-chip`,children:[(0,o.jsxs)("span",{children:[d.get(b)?.name??b,e===null?" (checking)":d.has(b)?d.get(b)?.enabled?"":" (disabled)":" (missing)"]}),(0,o.jsx)("button",{type:"button","aria-label":`Remove ${d.get(b)?.name??b}`,disabled:r,onClick:()=>i(a.filter(R=>R!==b)),children:"\xD7"})]},b)):(0,o.jsx)("span",{className:`${n}-hint`,children:"No lorebooks selected."})}),t?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:t}):null,e===null&&!t?(0,o.jsx)("p",{className:`${n}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No lorebooks in the Engine library."}):null,(0,o.jsxs)("details",{className:`${n}-lore-options`,children:[(0,o.jsxs)("summary",{className:`${n}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,o.jsx)("input",{type:"search",className:`${n}-search`,value:s,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:b=>c(b.target.value)}),(0,o.jsxs)("div",{className:`${n}-lore-results`,children:[p.map(b=>{let R=a.includes(b.id),O=f.includes(b.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":b.enabled?"":"Disabled \u2014 skipped";return(0,o.jsxs)("label",{className:`${n}-reason-option`,children:[(0,o.jsx)("input",{type:"checkbox",checked:R,disabled:r||!b.enabled&&!R||!R&&a.length>=24,onChange:()=>i(R?a.filter(V=>V!==b.id):[...a,b.id])}),b.name,O?` (${O})`:""]},b.id)}),e!==null&&N.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No matching lorebooks."}):null,N.length>p.length?(0,o.jsx)("p",{className:`${n}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function b1({id:e,label:t,hint:a,options:i,value:r,disabled:s,onChange:c}){let d=r.length>0&&!i.some(h=>h.id===r);return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:e,children:t}),(0,o.jsxs)("select",{id:e,className:`${n}-select`,value:r,disabled:s,onChange:h=>c(h.target.value),children:[(0,o.jsx)("option",{value:"",children:"Engine default"}),d?(0,o.jsx)("option",{value:r,children:"Missing \u2014 this connection is gone"}):null,i.map(h=>(0,o.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,o.jsx)("span",{className:`${n}-hint`,children:a})]})}function Yp({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[i,r]=(0,m.useState)(null),[s,c]=(0,m.useState)([]),[d,h]=(0,m.useState)(""),[f,w]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let V=!1;return(async()=>{try{let[$,y]=await Promise.all([U("/connections"),Jp("/api/connections")]);if(V)return;r($),c(oS(Array.isArray(y)?y:[]))}catch($){V||h(L($,"This agent's connections could not be read."))}})(),()=>{V=!0}},[]);let N=(0,m.useCallback)(async V=>{w(!0),h("");try{r(await U("/connections",{method:"PUT",body:JSON.stringify(V)}))}catch($){h(L($,"That connection could not be saved."))}finally{w(!1)}},[]),p=s.filter(V=>V.category==="language"),b=s.filter(V=>V.category==="image_generation"),R=b.some(V=>V.defaultForAgents),O=i!==null&&(i.imageConnectionId===Up||b.length===0||i.imageConnectionId.length===0&&!R);return(0,m.useEffect)(()=>{if(!e)return;let V=i?.systemConnectionId??"",$=i?.narrationConnectionId??"";i?V.length===0||$.length===0?e("Choose both System and Narration connections before continuing."):!p.some(y=>y.id===V)||!p.some(y=>y.id===$)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,i,p]),(0,m.useEffect)(()=>{t?.(O)},[O,t]),(0,o.jsxs)("div",{className:`${n}-field ${a?`${n}-connections-compact`:""}`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Connections"}),a?(0,o.jsx)("p",{className:`${n}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,o.jsx)("p",{className:`${n}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),i?(0,o.jsxs)("div",{className:a?`${n}-connections-grid`:"",children:[(0,o.jsx)(b1,{id:`${n}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:p,value:i.systemConnectionId,disabled:f,onChange:V=>{N({systemConnectionId:V})}}),(0,o.jsx)(b1,{id:`${n}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:p,value:i.narrationConnectionId,disabled:f,onChange:V=>{N({narrationConnectionId:V})}}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-connection-image`,children:"Images"}),(0,o.jsxs)("select",{id:`${n}-connection-image`,className:`${n}-select`,value:i.imageConnectionId,disabled:f,onChange:V=>{N({imageConnectionId:V.target.value})},children:[(0,o.jsx)("option",{value:Up,children:"Disabled"}),(0,o.jsx)("option",{value:"",children:"Use Engine default"}),i.imageConnectionId.length>0&&i.imageConnectionId!==Up&&!b.some(V=>V.id===i.imageConnectionId)?(0,o.jsx)("option",{value:i.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,b.map(V=>(0,o.jsx)("option",{value:V.id,children:V.name},V.id))]}),(0,o.jsx)("span",{className:`${n}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,o.jsxs)(o.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,o.jsxs)("span",{className:`${n}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,o.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):d.length===0?(0,o.jsx)("span",{className:`${n}-hint`,children:"Reading this agent's connections\u2026"}):null,d?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:d}):null]})}function zS(){let[e,t]=(0,m.useState)(null),[a,i]=(0,m.useState)(""),[r,s]=(0,m.useState)(!1),[c,d]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let f=!1;return U("/narration").then(w=>{f||t(w)}).catch(w=>{f||i(L(w,"Village writing settings could not be read."))}),()=>{f=!0}},[]);let h=(0,m.useCallback)(async f=>{s(!0),d(!1),i("");try{let w=await U("/narration",{method:"PUT",body:JSON.stringify(f)});return t(w),d(!0),w}catch(w){return i(L(w,"That writing change could not be saved.")),null}finally{s(!1)}},[]);return{view:e,error:a,busy:r,saved:c,save:h}}function RS(){let{view:e,error:t,busy:a,saved:i,save:r}=zS(),[s,c]=(0,m.useState)(null),d=s??e?.writingGuidance??"";return(0,o.jsxs)("div",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Additional writing guidance"}),(0,o.jsx)("p",{className:n+"-empty",children:"Optionally influence narration and dialogue in this village. Resident cards, scene facts, and the player's choices remain in charge. Leave this empty for Villages' own scene writing. Saved changes apply to the next generated venue turn."}),e?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("textarea",{className:n+"-textarea","aria-label":"Additional writing guidance",value:d,rows:5,maxLength:e.writingGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.writingGuidance,onClick:()=>{r({writingGuidance:d}).then(h=>{h&&c(h.writingGuidance)})},children:"Apply guidance"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||!d,onClick:()=>{r({writingGuidance:""}).then(h=>{h&&c(h.writingGuidance)})},children:"Clear guidance"}),(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Tense"}),(0,o.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{r({tense:h.target.value})},children:[(0,o.jsx)("option",{value:"present",children:"Present"}),(0,o.jsx)("option",{value:"past",children:"Past"})]})]}),(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Person"}),(0,o.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{r({person:h.target.value})},children:[(0,o.jsx)("option",{value:"first",children:"First person (I)"}),(0,o.jsx)("option",{value:"second",children:"Second person (you)"}),(0,o.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Content rating"}),(0,o.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{r({rating:h.target.value})},children:[(0,o.jsx)("option",{value:"sfw",children:"SFW"}),(0,o.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,o.jsx)("span",{className:n+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,o.jsx)("span",{className:n+"-hint",children:"Reading village writing settings\u2026"}),a?(0,o.jsx)("span",{className:n+"-hint",children:"Saving\u2026"}):null,i&&!a?(0,o.jsx)("span",{className:n+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:t}):null]})}function Cr({portrait:e,name:t,className:a,glyph:i="initial"}){return(0,o.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,o.jsx)("img",{src:e.url,alt:"",style:nS(e.crop)}):i==="person"?(0,o.jsxs)("svg",{className:`${n}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,o.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,o.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function MS({villager:e,portrait:t,selected:a,onSelect:i}){return(0,o.jsxs)("div",{className:`${n}-tile`,"data-selected":a?"true":"false",children:[(0,o.jsxs)("div",{className:`${n}-tile-head`,children:[(0,o.jsx)(Cr,{portrait:t,name:e.name,className:`${n}-avatar`}),(0,o.jsx)("button",{type:"button",className:`${n}-tile-name`,onClick:i,disabled:i===void 0,title:i?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,o.jsx)("p",{className:`${n}-tile-summary`,children:e.summary}):null,(0,o.jsxs)("div",{className:`${n}-tile-meta`,children:[e.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(r=>(0,o.jsx)("span",{className:`${n}-tag`,children:r},r))]})]})}function v1(e,t){let a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=e,i.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function OS(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((N,p)=>{let b=R=>{let O=t1.indexOf(R);return O<0?t1.length:O};return b(N.label)-b(p.label)||N.label.localeCompare(p.label)||N.view.localeCompare(p.view)}),i=512,r=768,s=2,c=document.createElement("canvas");c.width=s*i,c.height=Math.ceil(a.length/s)*r;let d=c.getContext("2d");if(!d)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let N=0;N<a.length;N+=1){let p=a[N],b=new Image;b.src=p.url,await b.decode();let R=N%s*i,O=Math.floor(N/s)*r,V=Math.min(i/b.naturalWidth,r/b.naturalHeight),$=Math.round(b.naturalWidth*V),y=Math.round(b.naturalHeight*V);d.drawImage(b,R+Math.floor((i-$)/2),O+r-y,$,y),h.push({view:p.view,expression:p.label,x:R,y:O,width:i,height:r})}let f=await new Promise((N,p)=>c.toBlob(b=>b?N(b):p(new Error("The browser could not export this sheet.")),"image/png")),w=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";v1(`${w}-sprites.png`,f),v1(`${w}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function VS({entry:e,onDecide:t}){let[a,i]=(0,m.useState)(e.improvement?.title??""),[r,s]=(0,m.useState)(e.improvement?.description??""),[c,d]=(0,m.useState)(e.improvement?.extraBeds??0),[h,f]=(0,m.useState)(e.improvementSlot??0),[w,N]=(0,m.useState)(!1),[p,b]=(0,m.useState)(""),R=V=>{N(!0),b(""),t(V,{title:a,description:r,extraBeds:c,slot:h}).catch($=>b(L($,"That Venue request could not be decided."))).finally(()=>N(!1))},O=a!==e.improvement?.title||r!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["Proposed improvement",(0,o.jsx)("input",{className:`${n}-notice-input`,value:a,onChange:V=>i(V.target.value)})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["What changes?",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:r,onChange:V=>s(V.target.value)})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:V=>d(Number(V.target.value))})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:h,onChange:V=>f(Number(V.target.value)),children:[(0,o.jsx)("option",{value:0,children:"Slot 1"}),(0,o.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:w||!a.trim()||!r.trim(),onClick:()=>R(!0),children:O?"Send counteroffer":"Approve exact request"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:w,onClick:()=>R(!1),children:"Decline"})]}),p?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:p}):null]})}function DS({room:e,nameColors:t,speechColors:a,picture:i,draft:r,mode:s,targetId:c,busy:d,error:h,greetingNotice:f,ruling:w,open:N,ended:p,playerName:b,playerPortrait:R,portraits:O,sprites:V,onDraft:$,onMode:y,onTarget:v,onSend:E,onViewVenue:I,onEnterPrivate:Y,privateSpaceOwnerName:j,onEnd:X,onLeavePending:ve,endFailed:F,reviewing:We,onRetryGreeting:he,onContinueWithoutGreeting:et,notices:mt,onDismissNotice:Oa,debugDiscardEnabled:xt,onDebugDiscard:Dt,onUseMailbox:je,onProjects:Le}){let[ie,Ve]=(0,m.useState)(0),[pt,It]=(0,m.useState)(!1),[At,K]=(0,m.useState)(!1),[zt,Rt]=(0,m.useState)(!1),[Nt,Ze]=(0,m.useState)(!1),[pe,gt]=(0,m.useState)(null),st=(0,m.useRef)(null),oe=(0,m.useRef)(null),_e=(0,m.useRef)(null),se=(0,m.useRef)(null),Re=(0,m.useRef)(null),ee=(0,m.useRef)(null),A=(0,m.useRef)(null),H=(0,m.useRef)(null),ne=(0,m.useRef)(null),ge=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let C=new Set(mt.map(te=>te.id)),le=mt.some(te=>te.kind==="memory"&&!ge.current.has(te.id));ge.current=C,le?Rt(!0):mt.length===0&&Rt(!1)},[mt,e.id]),(0,m.useEffect)(()=>{pt&&window.requestAnimationFrame(()=>ee.current?.focus())},[pt]),(0,m.useEffect)(()=>{if(!At)return;let C=te=>{H.current?.contains(te.target)||K(!1)},le=te=>{te.key==="Escape"&&K(!1)};return document.addEventListener("pointerdown",C),document.addEventListener("keydown",le),()=>{document.removeEventListener("pointerdown",C),document.removeEventListener("keydown",le)}},[At]),(0,m.useEffect)(()=>{if(!Nt)return;let C=te=>{se.current?.contains(te.target)||Ze(!1)},le=te=>{te.key==="Escape"&&Ze(!1)};return document.addEventListener("pointerdown",C),document.addEventListener("focusin",C),document.addEventListener("keydown",le),()=>{document.removeEventListener("pointerdown",C),document.removeEventListener("focusin",C),document.removeEventListener("keydown",le)}},[Nt]);let ye=(0,m.useCallback)(()=>{gt(null),window.requestAnimationFrame(()=>st.current?.focus())},[]),He=new Set((e.submissions??[]).flatMap(C=>(C.recollections??[]).map(le=>le.id))).size;(0,m.useEffect)(()=>{if(!pe)return;window.requestAnimationFrame(()=>oe.current?.focus());let C=le=>{if(le.key==="Tab"){le.preventDefault(),oe.current?.focus();return}le.key==="Escape"&&(le.preventDefault(),ye())};return window.addEventListener("keydown",C),()=>window.removeEventListener("keydown",C)},[ye,pe]);let we=(0,m.useMemo)(()=>{let C=[],le=new Map;for(let te of e.lines){if(te.kind!=="side"&&te.kind!=="whisper"||!te.asideFor)continue;let Ht=le.get(te.asideFor)??[];Ht.push({register:te.kind,text:te.content,...te.targetId?{target:e.participants.find($a=>$a.characterId===te.targetId)?.name??te.targetId}:{},speakerId:te.speakerId,name:te.name,expression:te.expression,gazeAt:te.gazeAt}),le.set(te.asideFor,Ht)}for(let te of e.lines){if(te.kind==="side"||te.kind==="whisper")continue;let Ht=te.speakerId.length===0,$a=I0(te.content,te.beats??null);$a.paragraphs.forEach((ea,Rn)=>{C.push({key:`${C.length}`,speakerId:Ht?"":te.speakerId,name:Ht?b:te.name,player:Ht,text:ea,asides:[...$a.asides[Rn]??[],...Rn===$a.paragraphs.length-1?le.get(te.id??"")??[]:[]],...te.kind?{register:te.kind==="narration"?"narration":"speech"}:{},...te.expression?{expression:te.expression}:{},...te.gazeAt?{gazeAt:te.gazeAt}:{}})})}return C},[b,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{Ve(C=>j0(ne.current,e.id,we.length,C)),ne.current={roomId:e.id,stepCount:we.length}},[e.id,we.length]);let Ne=Math.min(ie,Math.max(0,we.length-1)),W=we[Ne],Ft=Ne>0,Ae=Ne<we.length-1,G=!p&&e.status==="active"&&!Ae,T=(0,m.useCallback)(()=>{let C=_e.current;if(!C)return;let le=window.getComputedStyle(C),te=Number.parseFloat(le.lineHeight),Ht=Number.parseFloat(le.paddingTop)+Number.parseFloat(le.paddingBottom),$a=Math.ceil(te+Ht),ea=Math.ceil(te*2+Ht);C.style.height="auto",C.style.height=`${Math.min(Math.max(C.scrollHeight,$a),ea)}px`,C.style.overflowY=C.scrollHeight>ea+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{T()},[G,r,T]),(0,m.useEffect)(()=>{let C=_e.current?.parentElement;if(!C)return;let le=C.clientWidth,te=new ResizeObserver(()=>{C.clientWidth!==le&&(le=C.clientWidth,T())});return te.observe(C),()=>te.disconnect()},[G,T]);let Q=()=>{!G||d||s!=="conclude"&&!r.trim()||s==="fulfill"&&!c||(Ze(!1),E())};(0,m.useLayoutEffect)(()=>{A.current&&(A.current.scrollTop=0)},[Ne,e.id]);let xe=W?.register??(W===void 0||W.speakerId==="__venue_scene__"?"narration":W.player||D0(W.text)==="speech"?"speech":"narration"),_t=W===void 0?void 0:W.player?R:O[W.speakerId],lt=e.participants.filter(C=>e.activeIds.includes(C.characterId)),bt=e.status==="closed"&&lt.length===0?e.participants:lt,Wt=bt.find(C=>C.characterId===W?.speakerId),zn=C=>Pd(a[C]),Va=C=>Pd(t[C]),ii=bt.slice(0,4),x=bt.filter(C=>!ii.some(le=>le.characterId===C.characterId)),J=ii.findIndex(C=>C.characterId===Wt?.characterId)>=2?"left":"right",ct=(0,o.jsxs)("p",{className:`${n}-chat-pending`,role:"status",children:[(0,o.jsx)("span",{className:`${n}-chat-spinner ${n}-spin`,"aria-hidden":"true"}),(0,o.jsx)("span",{className:`${n}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,o.jsxs)("aside",{className:`${n}-chat`,"data-open":N?"true":"false","data-ended":p?"true":"false","data-opening-error":e.status==="opening"&&h?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,o.jsx)("p",{className:`${n}-visually-hidden`,children:`Here now: ${lt.length?lt.map(C=>`${C.name}${C.doing?` is ${C.doing}`:""}`).join("; "):"nobody"}.`}),(0,o.jsx)("div",{className:`${n}-chat-scene`,"aria-hidden":"true",children:i?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("img",{className:`${n}-chat-scene-backdrop`,src:i,alt:""}),(0,o.jsx)("span",{className:`${n}-chat-scrim`}),(0,o.jsx)("span",{className:`${n}-chat-vignette`})]}):(0,o.jsx)("span",{className:`${n}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,o.jsxs)("div",{className:`${n}-chat-head`,children:[(0,o.jsx)("span",{className:`${n}-room-place`,children:e.placeName}),(0,o.jsxs)("span",{ref:H,className:`${n}-chat-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-room-actions-trigger`,onClick:()=>K(C=>!C),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":At,children:"\xB7\xB7\xB7"}),At?(0,o.jsxs)("span",{className:`${n}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{K(!1),I()},disabled:d,children:"View Venue"}),Y?(0,o.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{K(!1),Y()},disabled:d,children:["Enter ",j??"private space"]}):null,(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{K(!1),p&&e.memoryPending?ve():X()},disabled:d,children:p&&e.memoryPending?"Leave with memory pending":p?"Return to map":"End visit now"}),(F||e.status==="closing"||e.memoryPending)&&!p?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{K(!1),ve()},children:"Leave with memory pending"}):null,xt&&e.status!=="closed"?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{K(!1),Dt()},disabled:d,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:e.spaceClass==="residence"?"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like.":"You\u2019re outside this Venue. You can speak in your own words, or leave whenever you like."}):null,mt.length>0?(0,o.jsxs)("div",{className:`${n}-room-notices`,"aria-live":"polite",children:[(0,o.jsxs)("button",{type:"button",className:`${n}-room-notices-trigger`,onClick:()=>Rt(C=>!C),"aria-expanded":zt,"aria-label":`${mt.length} village ${mt.length===1?"notice":"notices"}`,children:["\u2726 ",mt.length]}),zt?(0,o.jsx)("div",{className:`${n}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:mt.map(C=>(0,o.jsxs)("div",{className:`${n}-room-star`,children:[(0,o.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),C.kind==="memory"&&C.detail?(0,o.jsx)("button",{type:"button",className:`${n}-room-star-detail`,onClick:le=>{st.current=le.currentTarget,gt(C)},"aria-label":`View memory: ${C.text}`,title:"View saved memory",children:C.text}):(0,o.jsx)("span",{children:C.text}),(0,o.jsx)("button",{type:"button",className:`${n}-room-star-dismiss`,onClick:()=>{pe?.id===C.id&&gt(null),Oa(C.id)},"aria-label":`Dismiss ${C.text}`,title:"Dismiss notice",children:"\xD7"})]},C.id))}):null]}):null,pe?.detail?(0,o.jsx)("div",{className:`${n}-memory-backdrop`,onClick:C=>{C.currentTarget===C.target&&ye()},children:(0,o.jsxs)("div",{className:`${n}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${n}-memory-dialog-title`,children:[(0,o.jsxs)("div",{className:`${n}-memory-dialog-head`,children:[(0,o.jsx)("h2",{id:`${n}-memory-dialog-title`,children:pe.text}),(0,o.jsx)("button",{ref:oe,type:"button",onClick:ye,"aria-label":"Close memory",children:"\xD7"})]}),(0,o.jsx)("p",{children:pe.detail})]})}):null,lt.length>0?(0,o.jsx)("div",{className:`${n}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:lt.map(C=>(0,o.jsx)("span",{className:`${n}-chat-activity`,children:`${C.name}: ${C.doing||"spending time here"}`},C.characterId))}):null,(0,o.jsxs)("div",{className:`${n}-chat-stage`,"aria-hidden":"true",children:[(0,o.jsx)("div",{className:`${n}-chat-cast`,children:ii.map((C,le)=>{let te=V[C.characterId],Ht=C.characterId===Wt?.characterId,$a=W?.asides.find(On=>On.speakerId===C.characterId),ea=Ht?W?.expression??"neutral":$a?.expression??"neutral",Rn=Ht?W?.gazeAt:$a?.gazeAt??(C.characterId===W?.gazeAt?Wt?.characterId:void 0),ia=ii.findIndex(On=>On.characterId===Rn),Mn=Y0(te?.images??[],ea,G0(le,ia));return(0,o.jsxs)("div",{className:`${n}-chat-cast-person`,"data-active":C.characterId===Wt?.characterId?"true":"false","data-sprite":Mn?"true":"false",children:[Mn?(0,o.jsx)("img",{src:Mn.image.url,alt:"","data-framing":te?.framing.mode??"full","data-facing":Mn.mirrored?"left":"right"}):(0,o.jsx)(Cr,{portrait:O[C.characterId],name:C.name,className:`${n}-avatar`}),(0,o.jsx)("span",{style:Va(C.characterId),children:C.name})]},C.characterId)})}),x.length>0?(0,o.jsx)("div",{className:`${n}-chat-cast-rest`,children:x.map(C=>(0,o.jsxs)("span",{children:[(0,o.jsx)(Cr,{portrait:O[C.characterId],name:C.name,className:`${n}-avatar`}),(0,o.jsx)("span",{style:Va(C.characterId),children:C.name})]},C.characterId))}):null]}),(0,o.jsxs)("div",{className:`${n}-chat-vn`,children:[pt?(0,o.jsx)("div",{ref:ee,className:`${n}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:C=>{C.key==="Escape"&&(It(!1),window.requestAnimationFrame(()=>Re.current?.focus()))},children:e.lines.map((C,le)=>(0,o.jsxs)("p",{className:`${n}-chat-vn-text`,children:[(0,o.jsxs)("strong",{style:C.role==="assistant"&&C.kind!=="narration"?Va(C.speakerId):void 0,children:[C.role==="user"?b:C.kind==="narration"||C.speakerId==="__venue_scene__"?"Narration":C.name||"Resident",C.kind==="side"?" \xB7 aside":C.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,o.jsx)("span",{style:C.role==="assistant"&&C.kind!=="narration"?zn(C.speakerId):void 0,children:Ko(C.content,`history-${le}-`)})]},C.id??le))}):null,W&&W.asides.length>0?(0,o.jsx)("div",{className:`${n}-chat-vn-asides`,"data-side":J,"aria-live":"polite",children:W.asides.map((C,le)=>(0,o.jsxs)("div",{className:`${n}-chat-vn-aside`,"data-register":C.register,children:[(0,o.jsx)(Cr,{portrait:C.speakerId?O[C.speakerId]:_t,name:C.name??W.name,glyph:W.player?"person":"initial",className:`${n}-chat-vn-aside-face`}),(0,o.jsxs)("div",{className:`${n}-chat-vn-aside-column`,children:[(0,o.jsxs)("p",{className:`${n}-chat-vn-aside-head`,children:[(0,o.jsx)("span",{className:`${n}-chat-vn-aside-icon`,children:C.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,o.jsx)("span",{className:`${n}-chat-vn-aside-name`,style:Va(C.speakerId??W.speakerId),children:C.name??W.name}),C.register==="whisper"&&C.target?(0,o.jsx)("span",{className:`${n}-chat-vn-aside-target`,children:`\u2192 ${C.target}`}):null]}),(0,o.jsx)("p",{className:`${n}-chat-vn-aside-text`,style:zn(C.speakerId??W.speakerId),children:Ko(C.text,`vn-aside-${le}-`)})]})]},`${le}-${C.register}`))}):null,(0,o.jsx)("div",{className:`${n}-chat-vn-card`,"data-register":xe,children:(0,o.jsx)("div",{className:`${n}-chat-vn-row`,children:(0,o.jsxs)("div",{className:`${n}-chat-vn-column`,children:[xe==="narration"?(0,o.jsx)("p",{className:`${n}-chat-vn-label`,children:"Narration"}):(0,o.jsx)("p",{className:`${n}-chat-vn-name`,style:W?.player?void 0:Va(W?.speakerId??""),children:W?.name??""}),(0,o.jsxs)("div",{ref:A,className:`${n}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[W?xe==="narration"?(0,o.jsx)("p",{className:`${n}-chat-vn-beat`,"data-register":"narration",children:Ko(W.text,"vn-beat-")}):(0,o.jsx)("p",{className:`${n}-chat-vn-text`,style:W.player?void 0:zn(W.speakerId),children:Ko(W.text,"vn-")}):(0,o.jsx)("p",{className:`${n}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:lt.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!p&&d?ct:null]})]})})}),(0,o.jsxs)("div",{className:`${n}-room-panel-tools`,children:[e.lines.length>0?(0,o.jsx)("button",{ref:Re,type:"button",className:`${n}-chat-history-toggle`,"aria-label":"History","aria-expanded":pt,onClick:()=>It(C=>!C),children:pt?"Hide history":"History"}):null,(0,o.jsx)("span",{className:`${n}-chat-vn-counter`,children:`${Ne+1} / ${Math.max(1,we.length)}`}),(0,o.jsxs)("span",{className:`${n}-chat-vn-nav`,children:[(0,o.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>Ve(Ne-1),disabled:!Ft,"aria-label":"Previous paragraph",children:["\u2039 ",(0,o.jsx)("span",{children:"Previous"})]}),Ae?(0,o.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>Ve(Ne+1),"aria-label":"Next paragraph",children:[(0,o.jsx)("span",{children:"Next"})," \u203A"]}):p?(0,o.jsx)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:e.memoryPending?ve:X,disabled:d,children:e.memoryPending?"Leave with memory pending":"Return to map"}):null]})]}),h&&e.status==="opening"?(0,o.jsxs)("div",{className:`${n}-room-error`,role:"alert",children:[(0,o.jsx)("p",{children:h}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:X,disabled:d,children:"Back to map"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:he,disabled:d,children:"Retry opening"}),e.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:et,disabled:d,children:"Continue without opening"}):null]}):null,f?(0,o.jsx)("div",{className:`${n}-room-error`,role:"status",children:(0,o.jsx)("p",{children:f})}):null,w?(0,o.jsx)("p",{className:`${n}-empty`,children:w}):null,e.status==="closing"||e.memoryPending?(0,o.jsx)("p",{className:`${n}-hint`,children:e.memoryPending?`Memory review ${We?"in progress":"pending"} \xB7 ${e.memoryReview?.nextRecollection??0}/${He} recollections reviewed. You can leave with memory pending and retry from Memories.`:"Closing this visit\u2026"}):null,p&&!e.memoryPending&&e.memoryReview?.status==="complete"&&!e.memoryReview.decisions?.some(C=>C.action==="promote")?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:"Review complete. No durable memories were made from this visit."}):null,G&&s==="fulfill"&&lt.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,G?(0,o.jsxs)("div",{className:`${n}-composer`,children:[s==="fulfill"&&lt.length>0?(0,o.jsxs)("select",{value:c,onChange:C=>v(C.target.value),"aria-label":"Whose wish you fulfilled",disabled:d||p||e.status!=="active",children:[(0,o.jsx)("option",{value:"",children:"Choose one villager"}),lt.map(C=>(0,o.jsx)("option",{value:C.characterId,children:C.name},C.characterId))]}):null,(0,o.jsx)("div",{className:`${n}-composer-row`,children:(0,o.jsxs)("span",{className:`${n}-chat-input`,children:[(0,o.jsxs)("span",{ref:se,className:`${n}-room-mode-anchor`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-room-mode-toggle`,onClick:()=>Ze(C=>!C),"aria-label":`Mode: ${s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":Nt,title:s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude",children:s==="chat"?"\u{1F4AC}":s==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),Nt?(0,o.jsx)("span",{className:`${n}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(C=>(0,o.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":s===C,disabled:d||C==="fulfill"&&lt.length===0,onClick:()=>{y(C),Ze(!1)},children:C==="chat"?"Chat":C==="fulfill"?"Fulfill":"Conclude"},C))}):null]}),je?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:je,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,Le?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:Le,children:"Projects"}):null,(0,o.jsx)("textarea",{ref:_e,className:`${n}-textarea`,rows:1,value:r,onChange:C=>$(C.target.value),onKeyDown:C=>{B0(C.key,C.shiftKey,C.nativeEvent.isComposing)&&(C.preventDefault(),Q())},placeholder:s==="fulfill"?"What did you do for them?":s==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:d||p||e.status!=="active"}),(0,o.jsx)("button",{type:"button",className:`${n}-chat-send`,onClick:Q,disabled:d||p||e.status!=="active"||s!=="conclude"&&r.trim().length===0||s==="fulfill"&&!c,"aria-label":d?"Sending":"Send",title:d?"Sending":"Send",children:d?"Sending\u2026":"Send"})]})})]}):null,h&&e.status!=="opening"?(0,o.jsx)("div",{className:`${n}-room-error`,role:"alert",children:(0,o.jsx)("p",{children:h})}):null]})]})}function IS(e){return e==="index"||e==="general"?e:["chatlogs","progress","agendas","schedules"].includes(e)?"debug":"village"}var _S={index:"Menu",villagers:"Villagers",noticeboard:"Noticeboard",venueRequests:"Venue Requests",projects:"Projects",memories:"Memories",village:"Village Settings",general:"General Settings",chatlogs:"Venue Visits",progress:"Progress",agendas:"Villager Wishes",schedules:"Villager Agendas"},HS="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.",Xp=["concept","approval","builder","requirements","materials","construction","finishing"],y1={concept:"Concept & placement",approval:"Affected villagers",builder:"Assign a Builder",requirements:"Define requirements",materials:"Prepare materials",construction:"Construction",finishing:"Finishing visit"};function US({snapshot:e,room:t,onSnapshot:a,onReturn:i,onMap:r,onPlaceOnMap:s,mobile:c,debugEnabled:d,focusProjectId:h,siteProjectId:f}){let[w,N]=(0,m.useState)(h),[p,b]=(0,m.useState)(""),[R,O]=(0,m.useState)(""),[V,$]=(0,m.useState)("gathering"),[y,v]=(0,m.useState)(""),[E,I]=(0,m.useState)(""),[Y,j]=(0,m.useState)("upgrade"),[X,ve]=(0,m.useState)("workplace"),[F,We]=(0,m.useState)(2),[he,et]=(0,m.useState)(0),[mt,Oa]=(0,m.useState)(0),[xt,Dt]=(0,m.useState)(""),[je,Le]=(0,m.useState)(""),[ie,Ve]=(0,m.useState)(""),[pt,It]=(0,m.useState)(null),[At,K]=(0,m.useState)(null),[zt,Rt]=(0,m.useState)(null),[Nt,Ze]=(0,m.useState)(!1),[pe,gt]=(0,m.useState)(!1),[st,oe]=(0,m.useState)(""),[_e,se]=(0,m.useState)([]);(0,m.useEffect)(()=>{h&&N(h)},[h]);let Re=e.projects.filter(T=>(T.kind==="new-venue"||T.kind==="renovation")&&T.lifecycle?.phase!=="complete"),ee=Re.find(T=>T.id===w)??null,A=ee?.lifecycle,H=(0,m.useCallback)(async T=>{try{let Q=await U(`/projects/${encodeURIComponent(T)}/evidence`);se(Q.candidates)}catch(Q){se([]),oe(L(Q,"Saved conversation evidence could not be loaded."))}},[]);(0,m.useEffect)(()=>{e.progressEngineVersion===1&&ee?.id?H(ee.id):se([])},[ee?.id,A?.phase,e.progressEngineVersion,H]);let ne=e.settings.venues.find(T=>T.id===ee?.venueId),ge=e.settings.venues.find(T=>T.id===E),ye=["residence","workplace","gathering","other"].filter(T=>!ge?.classes?.includes(T)).includes(X)?X:["residence","workplace","gathering","other"].find(T=>!ge?.classes?.includes(T)),He=async(T,Q={})=>{gt(!0),oe("");try{let xe=await U(T,{method:"POST",body:JSON.stringify(Q)});return a(xe),xe}catch(xe){return oe(L(xe,"The Project could not be updated.")),null}finally{gt(!1)}},we=(T,Q={})=>ee&&He(`/projects/${encodeURIComponent(ee.id)}/${T}`,Q),Ne=async()=>{let T=p==="new-venue"?{name:R,venueClass:V,description:y}:{title:R,detail:y,...Y==="class"&&ge&&ye?{classes:[...new Set([...ge.classes??[],ye])]}:{},...Y==="capacity"?{capacity:F}:{},...Y==="upgrade"?{slot:he,improvement:{title:R,description:y,extraBeds:mt}}:{},...Y==="remove-upgrade"?{slot:he,improvement:null}:{}},xe=(await He(p==="new-venue"?"/projects":`/projects/renovations/${encodeURIComponent(E)}`,T))?.projects.find(_t=>_t.kind===p&&_t.lifecycle?.phase!=="complete");xe&&(N(xe.id),b(""))},W=async T=>{if(ee){gt(!0),oe("");try{let Q=await U("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:{name:ee.title,form:xt||ee.title,description:je||ee.venueDraft?.description||ne?.description,spaceDescription:ie||ne?.spaces?.[0]?.description||je,venueClass:ee.venueDraft?.classes?.[0]??ne?.classes?.[0]??"other"},area:T,villageName:e.village.name,setting:e.settings.setting,worldFacts:e.settings.worldFacts,selectedLorebookIds:e.settings.selectedLorebookIds})});Rt({area:T,image:Q})}catch(Q){oe(L(Q,"The Venue image could not be generated."))}finally{gt(!1)}}},Ft=async(T,Q)=>{if(!(!Q||!ee)){gt(!0),oe("");try{let xe=await U("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:ee.title,image:await kl(Q)})});Rt({area:T,image:xe})}catch(xe){oe(L(xe,"The Venue image could not be uploaded."))}finally{gt(!1)}}},Ae=A?.phase,G=(T,Q="",xe="")=>{if(e.progressEngineVersion!==1||!ee)return null;let _t=_e.filter(bt=>{let Wt=bt.quote.toLocaleLowerCase();return xe&&!Wt.includes(xe.toLocaleLowerCase())?!1:T==="approval"?/\b(?:yes|agree|approve|fine|okay|can|may)\b/iu.test(Wt):T==="builder"?/\b(?:build|construct|renovat\w*|work on|do it|take it on|handle it)\b/iu.test(Wt):T==="requirements"?/\b(?:structure|equipment|finish)\b/iu.test(Wt):T==="offer"?/\b(?:have|supply|bring|provide)\b/iu.test(Wt):/\b(?:here|give|hand|take)\b/iu.test(Wt)}),lt=(_t.length?_t:_e).slice(0,12);return(0,o.jsxs)("details",{className:`${n}-project-evidence`,children:[(0,o.jsxs)("summary",{children:["Record"," ",T==="requirements"?"Builder checklist":T==="handoff"?"supply handoff":T==="offer"?"supply offer":T==="approval"?"approval":"Builder agreement"," ","from a saved visit"]}),lt.length?lt.map(bt=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:bt.residentName||bt.residentId})," at ",bt.venueName,": \u201C",bt.quote,"\u201D"]}),(0,o.jsxs)("small",{children:["After: \u201C",bt.playerMessage,"\u201D"]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{we("record",{kind:T,requirementId:Q,sessionId:bt.sessionId,submissionId:bt.submissionId,lineId:bt.lineId})},children:"Record this line"})]},`${bt.sessionId}:${bt.lineId}`)):(0,o.jsx)("p",{children:"No saved resident lines yet. Talk to a villager, then return here."})]})};return ee&&Ae==="finishing"&&Nt?(0,o.jsxs)("div",{className:`${n}-project-finish-visit`,children:[(0,o.jsxs)("header",{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ze(!1),children:"Back to Project"}),(0,o.jsx)("h2",{children:ee.kind==="new-venue"?`Open ${ee.title}`:`Review ${ee.title}`}),(0,o.jsx)("p",{children:ee.kind==="new-venue"?"Give the finished place its form, exterior, and interior. Images are optional.":"Review the finished change and update its exterior image if you wish."})]}),ee.kind==="new-venue"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Form",(0,o.jsx)("input",{value:xt,onChange:T=>Dt(T.target.value),placeholder:"What is this place, physically?"})]}),(0,o.jsxs)("label",{children:["Exterior description",(0,o.jsx)("textarea",{value:je,onChange:T=>Le(T.target.value)})]}),(0,o.jsxs)("label",{children:["Interior description",(0,o.jsx)("textarea",{value:ie,onChange:T=>Ve(T.target.value)})]})]}):(0,o.jsx)("p",{children:A?.change?.detail}),["exterior",...ee.kind==="new-venue"?["interior"]:[]].map(T=>{let Q=T==="exterior"?pt:At;return(0,o.jsxs)("section",{className:`${n}-project-image`,children:[(0,o.jsxs)("h3",{children:[T==="exterior"?"Exterior":"Interior"," image \xB7 optional"]}),Q?(0,o.jsx)("img",{src:Q.url,alt:`${T} preview`}):(0,o.jsx)("p",{children:"No image chosen. A placeholder will be used."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{W(T)},children:"Generate image"}),(0,o.jsx)("input",{type:"file",accept:"image/*","aria-label":`Upload ${T} image`,disabled:pe,onChange:xe=>{let _t=xe.target.files?.[0];xe.target.value="",Ft(T,_t)}})]},T)}),zt?(0,o.jsxs)("section",{className:`${n}-project-image`,children:[(0,o.jsx)("img",{src:zt.image.url,alt:"Generated Venue candidate"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{zt.area==="exterior"?It(zt.image):K(zt.image),Rt(null)},children:"Use this image"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Rt(null),children:"Discard"})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe||ee.kind==="new-venue"&&(!xt.trim()||!je.trim()||!ie.trim()),onClick:async()=>{await we("open",{form:xt,exteriorDescription:je,interiorDescription:ie,exteriorImage:pt,interiorImage:At})&&Ze(!1)},children:"Open Venue"}),st?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:st}):null]}):(0,o.jsxs)("div",{className:`${n}-project-screen`,"data-mobile":c,children:[(0,o.jsxs)("header",{className:`${n}-project-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-project-eyebrow`,children:"PROJECTS"}),(0,o.jsx)("h2",{children:ee?.title??"Build something in the Village"}),(0,o.jsx)("p",{children:ee?ee.kind==="new-venue"?"A new place, from blueprint to opening day.":"Change a place that already belongs to the Village.":"One New Venue and one Renovation may be underway at once."})]}),ee?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>N(""),children:"All Projects"}):null]}),ee?(0,o.jsxs)("div",{className:`${n}-project-layout`,children:[(0,o.jsx)("nav",{className:`${n}-project-rail`,"aria-label":"Project phases",children:Xp.filter(T=>T!=="approval"||ee.kind==="renovation").map((T,Q)=>{let xe=Xp.indexOf(Ae),_t=Xp.indexOf(T);return(0,o.jsxs)("div",{className:`${n}-project-step`,"data-state":_t===xe?"active":_t<xe?"done":"locked",children:[(0,o.jsx)("b",{children:_t<xe?"\u2713":Q+1}),(0,o.jsx)("span",{children:y1[T]})]},T)})}),(0,o.jsxs)("main",{className:`${n}-project-card`,children:[Ae==="concept"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Place the blueprint"}),(0,o.jsx)("p",{children:ee.venueDraft?.description}),(0,o.jsx)("p",{children:"Choose a clear spot on the Village map. The blueprint marks where this Venue will be built."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>s(ee.id),children:"Place on Village map"})]}):null,Ae==="approval"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"People affected by this change"}),(0,o.jsx)("p",{children:"They may approve in conversation or reply through Mailbox. Every affected resident or worker must agree before you ask for a Builder."}),A?.affectedIds.map(T=>(0,o.jsxs)("p",{children:[e.villagers.find(Q=>Q.characterId===T)?.name??T,":"," ",A.approvals.some(Q=>Q.residentId===T)?"Approved":"Awaiting approval"]},T)),G("approval"),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{we("request-approval")},children:"Ask remaining villagers through Mailbox"})]}):null,Ae==="builder"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Find a Builder"}),(0,o.jsx)("p",{children:"Find villagers on the map and ask them about this Project in a real conversation. Their clear agreements appear here."}),G("builder"),e.progressEngineVersion!==1?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{we("recheck-builder")},children:"Review recent chats for missed agreements"}):null,A?.candidates.length?A.candidates.map(T=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{we("builder",{residentId:T.residentId})},children:["Assign"," ",e.villagers.find(Q=>Q.characterId===T.residentId)?.name??"this Villager"]},T.residentId)):(0,o.jsx)("p",{children:"No one has agreed yet."})]}):null,Ae==="requirements"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Define requirements with your Builder"}),(0,o.jsxs)("p",{children:["Ask"," ",e.villagers.find(T=>T.characterId===A?.builderId)?.name??"your Builder"," ","what this job needs. They decide the materials, functional equipment, and finishing supplies."]}),A?.requirements.length?(0,o.jsxs)("div",{children:[A.requirements.map(T=>(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:T.category})," \xB7 ",T.needed?T.title:"Not needed"]},T.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{we("requirements")},children:"Accept Builder's plan"}),(0,o.jsx)("p",{children:"To change it, discuss a revision with the Builder."})]}):(0,o.jsx)("p",{children:"Waiting for the Builder's plan."}),G("requirements"),e.progressEngineVersion===1?G("builder"):null,A?.candidates.filter(T=>T.residentId!==A.builderId).map(T=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{we("builder",{residentId:T.residentId})},children:["Switch to"," ",e.villagers.find(Q=>Q.characterId===T.residentId)?.name??"another Builder"]},T.residentId))]}):null,Ae==="materials"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Prepare materials"}),(0,o.jsx)("p",{children:"Find each supply in the Village, then bring it to this blueprint site. Deliveries update the list here."}),A?.requirements.filter(T=>T.needed).map(T=>(0,o.jsxs)("div",{className:`${n}-project-material`,children:[(0,o.jsx)("strong",{children:T.title}),(0,o.jsx)("span",{children:T.deliveredAt?"Delivered":T.carriedAt?"Ready to deliver":"Find and obtain"}),e.progressEngineVersion===1&&!T.carriedAt?(0,o.jsx)(o.Fragment,{children:A.sources?.some(Q=>Q.requirementId===T.id)?G("handoff",T.id,T.title):(0,o.jsxs)(o.Fragment,{children:[(A.recordedItems??[]).filter(Q=>Q.itemName.toLocaleLowerCase()===T.title.toLocaleLowerCase()).map(Q=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{we("existing-source",{requirementId:T.id,venueId:Q.venueId})},children:["Record existing item at"," ",e.settings.venues.find(xe=>xe.id===Q.venueId)?.name??"Venue"]},Q.venueId)),(A.heldSupplies??[]).filter(Q=>!Q.assignedRequirementId&&Q.itemName.toLocaleLowerCase()===T.title.toLocaleLowerCase()).map(Q=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{we("reallocate-held",{requirementId:T.id,heldId:Q.id})},children:["Commit previously acquired ",Q.itemName,Q.deliveredAt?" (already delivered)":""]},Q.id)),G("offer",T.id,T.title)]})}):null,T.carriedAt&&!T.deliveredAt&&f===ee.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{we("deliver",{requirementId:T.id})},children:"Deliver at blueprint site"}):null,T.carriedAt&&!T.deliveredAt&&f!==ee.id?(0,o.jsx)("span",{children:"Visit this Project's blueprint on the Village map to deliver it."}):null]},T.id)),e.progressEngineVersion===1?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{H(ee.id)},children:"Refresh saved visit lines"}):null,e.progressEngineVersion===1?G("builder"):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe||A?.requirements.some(T=>T.needed&&!T.deliveredAt),onClick:()=>{we("start")},children:"Begin construction"})]}):null,Ae==="construction"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is underway"}),(0,o.jsxs)("p",{children:[e.villagers.find(T=>T.characterId===A?.builderId)?.name??"The Builder"," is focused on this site for 24 hours, with normal rest and essential breaks."]}),A?.workOrder?(0,o.jsxs)("p",{children:["Expected completion: ",new Date(A.workOrder.completesAt).toLocaleString()]}):null,A?.blockedReason?(0,o.jsx)("p",{role:"status",children:A.blockedReason}):null,e.progressEngineVersion===1&&ee.status==="blocked"?G("builder"):null,ee.status==="blocked"?A?.candidates.filter(T=>T.residentId!==A.builderId).map(T=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,onClick:()=>{we("builder",{residentId:T.residentId})},children:["Continue with"," ",e.villagers.find(Q=>Q.characterId===T.residentId)?.name??"Builder"]},T.residentId)):null,d&&ee.status==="building"?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe,onClick:()=>{we("debug-complete")},children:"DEBUG: Complete construction now"}):null]}):null,Ae==="finishing"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is complete"}),(0,o.jsxs)("p",{children:["Visit the finished ",ee.kind==="new-venue"?"Venue":"Renovation"," to define its final details and open it to the Village."]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ze(!0),children:"Visit finished Venue"})]}):null,st?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:st}):null,(0,o.jsx)("footer",{className:`${n}-project-footer`,children:t?.status==="active"?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:i,children:"Return to current visit"}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:r,children:"Back to map"})})]})]}):(0,o.jsxs)("div",{className:`${n}-project-slots`,children:[["new-venue","renovation"].map(T=>{let Q=Re.find(xe=>xe.kind===T);return(0,o.jsxs)("button",{type:"button",className:`${n}-project-slot`,onClick:()=>Q?N(Q.id):b(T),children:[(0,o.jsx)("span",{children:T==="new-venue"?"NEW VENUE":"RENOVATION"}),(0,o.jsx)("strong",{children:Q?.title??(T==="new-venue"?"Imagine a new place":"Change an existing Venue")}),(0,o.jsx)("small",{children:Q?.lifecycle?y1[Q.lifecycle.phase]??"Opening":"Available"})]},T)}),p?(0,o.jsxs)("section",{className:`${n}-project-card ${n}-project-create`,children:[(0,o.jsx)("h3",{children:p==="new-venue"?"Describe the new Venue":"Describe the Renovation"}),p==="renovation"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Venue",(0,o.jsxs)("select",{value:E,onChange:T=>I(T.target.value),children:[(0,o.jsx)("option",{value:"",children:"Choose a Venue"}),e.settings.venues.filter(T=>T.constructionStatus!=="worksite").map(T=>(0,o.jsx)("option",{value:T.id,children:T.name},T.id))]})]}),(0,o.jsxs)("label",{children:["Physical change",(0,o.jsxs)("select",{value:Y,onChange:T=>j(T.target.value),children:[(0,o.jsx)("option",{value:"upgrade",children:"Add or replace an Upgrade"}),(0,o.jsx)("option",{value:"remove-upgrade",children:"Remove an Upgrade"}),(0,o.jsx)("option",{value:"class",children:"Add a second Class"}),(0,o.jsx)("option",{value:"capacity",children:"Change Residence capacity"})]})]}),Y==="class"?(ge?.classes?.length??0)>=2?(0,o.jsx)("p",{children:"This Venue already has two Classes."}):(0,o.jsxs)("label",{children:["Second Class",(0,o.jsx)("select",{value:ye??"",onChange:T=>ve(T.target.value),children:["residence","workplace","gathering","other"].filter(T=>!ge?.classes?.includes(T)).map(T=>(0,o.jsx)("option",{value:T,children:T},T))})]}):null,Y==="capacity"?(0,o.jsxs)("label",{children:["Capacity",(0,o.jsx)("input",{type:"number",min:1,max:4,value:F,onChange:T=>We(Number(T.target.value))})]}):null,Y==="upgrade"||Y==="remove-upgrade"?(0,o.jsxs)("label",{children:["Upgrade slot",(0,o.jsxs)("select",{value:he,onChange:T=>et(Number(T.target.value)),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",ge?.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",ge?.improvements?.[1]?.title??"empty"]})]})]}):null,Y==="upgrade"?(0,o.jsxs)("label",{children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:mt,onChange:T=>Oa(Number(T.target.value))})]}):null]}):(0,o.jsxs)("label",{children:["Venue Class",(0,o.jsxs)("select",{value:V,onChange:T=>$(T.target.value),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"other",children:"Other"})]})]}),(0,o.jsxs)("label",{children:[p==="new-venue"?"Venue name":"Project name",(0,o.jsx)("input",{value:R,onChange:T=>O(T.target.value),placeholder:"Give this place a name"})]}),(0,o.jsxs)("label",{children:["What would this ",p==="new-venue"?"place":"change"," be like in the Village?",(0,o.jsx)("textarea",{value:y,onChange:T=>v(T.target.value)})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pe||!R.trim()||!y.trim()||p==="renovation"&&(!E||Y==="class"&&(!ye||(ge?.classes?.length??0)>=2)),onClick:()=>{Ne()},children:p==="new-venue"?"Continue to map placement":"Start Renovation"})]}):null]}),!ee&&st?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:st}):null]})}function qS({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let l=()=>{let g=e.getBoundingClientRect();a(g.width<=704||g.width<=880&&g.height<=512)};l();let u=new ResizeObserver(l);return u.observe(e),()=>u.disconnect()},[e]);let[i,r]=(0,m.useState)(null),s=i?.settings.setupMaxVillagerCount??3,c=i?.settings.homeBuildings??[],[d,h]=(0,m.useState)(null),[f,w]=(0,m.useState)(null),[N,p]=(0,m.useState)(null),[b,R]=(0,m.useState)(0),[O,V]=(0,m.useState)(0),[$,y]=(0,m.useState)(0),[v,E]=(0,m.useState)(null),[I,Y]=(0,m.useState)(!1),[j,X]=(0,m.useState)(""),[ve,F]=(0,m.useState)(""),[We,he]=(0,m.useState)(""),[et,mt]=(0,m.useState)(null),[Oa,xt]=(0,m.useState)(null),[Dt,je]=(0,m.useState)(!1),[Le,ie]=(0,m.useState)("home"),[Ve,pt]=(0,m.useState)(""),[It,At]=(0,m.useState)(""),[K,zt]=(0,m.useState)(""),[Rt,Nt]=(0,m.useState)(null),[Ze,pe]=(0,m.useState)("view"),[gt,st]=(0,m.useState)("exterior");(0,m.useEffect)(()=>{if(gt==="exterior")return;let l=i?.settings.venues.find(g=>g.id===Rt);(gt.startsWith("class:")?l&&An(l).includes(gt.slice(6)):l&&gt.startsWith("private:")&&(l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[])).includes(gt.slice(8))&&l.privateSpaces?.some(g=>g.ownerId===gt.slice(8)))||st("exterior")},[i,Rt,gt]);let[oe,_e]=(0,m.useState)(null),[se,Re]=(0,m.useState)(null),[ee,A]=(0,m.useState)(!1),[H,ne]=(0,m.useState)(""),[ge,ye]=(0,m.useState)(""),[He,we]=(0,m.useState)(""),[Ne,W]=(0,m.useState)(null),[Ft,Ae]=(0,m.useState)(!1),[G,T]=(0,m.useState)("index"),Q=IS(G),[xe,_t]=(0,m.useState)({}),[lt,bt]=(0,m.useState)(null),Wt=(0,m.useRef)(null),zn=(0,m.useRef)([]),[Va,ii]=(0,m.useState)({}),[x,J]=(0,m.useState)({}),[ct,C]=(0,m.useState)(""),[le,te]=(0,m.useState)(null),[Ht,$a]=(0,m.useState)(""),[ea,Rn]=(0,m.useState)(""),[ia,Mn]=(0,m.useState)(""),[On,Wp]=(0,m.useState)(null),[Tl,eg]=(0,m.useState)(""),[Cl,tg]=(0,m.useState)([]),[Kd,ag]=(0,m.useState)(1600),[Qa,ng]=(0,m.useState)([]),[Er,ig]=(0,m.useState)(1600),[Jd,z1]=(0,m.useState)(null),[rg,og]=(0,m.useState)(""),[El,Ar]=(0,m.useState)([]),[sg,R1]=(0,m.useState)(""),[Fd,Vn]=(0,m.useState)(!1),[Al,ji]=(0,m.useState)(!1),[M1,zl]=(0,m.useState)(null),[zr,Jo]=(0,m.useState)(null),[Za,Wd]=(0,m.useState)(!1),[Fo,Rr]=(0,m.useState)(!1),[Mr,lg]=(0,m.useState)(!1),[cg,O1]=(0,m.useState)(""),[dg,V1]=(0,m.useState)({}),[Wo,ug]=(0,m.useState)({}),[Rl,hg]=(0,m.useState)(""),[Ue,Ml]=(0,m.useState)(0),[ln,mg]=(0,m.useState)(""),[Lt,pg]=(0,m.useState)(""),[Dn,gg]=(0,m.useState)("rebuild"),[Da,eu]=(0,m.useState)(Tr("rebuild").premise),[es,fg]=(0,m.useState)(""),[D1,I1]=(0,m.useState)(Hp),[In,bg]=(0,m.useState)([]),[_1,Ol]=(0,m.useState)([]),[dt,Li]=(0,m.useState)([]),[ts,Ka]=(0,m.useState)(null),[H1,vg]=(0,m.useState)(0),[yg,tu]=(0,m.useState)(!1),[au,Gi]=(0,m.useState)(null),[as,ri]=(0,m.useState)(null),[cn,Vl]=(0,m.useState)(!1),[wg,nu]=(0,m.useState)(""),[Dl,$g]=(0,m.useState)(F0),[Pe,Yi]=(0,m.useState)("generate"),[U1,iu]=(0,m.useState)(""),[Il,ru]=(0,m.useState)(null),[q1,xg]=(0,m.useState)(""),[ns,ou]=(0,m.useState)(null),[Or,su]=(0,m.useState)(""),[Vr,lu]=(0,m.useState)(""),is=JSON.stringify({scenario:Dn,premise:Da.trim(),direction:es.trim(),setting:Lt.trim(),lorebooks:Qa,loreBudget:Er}),cu=(0,m.useRef)(is);(0,m.useEffect)(()=>{cu.current!==is&&!i?.isFounded&&ri(null),cu.current=is},[is,i?.isFounded]);let du=JSON.stringify({setting:Lt.trim(),worldFacts:i?.isFounded?In:null,lorebooks:Qa,structure:Or,negative:Vr,options:Dl}),[ra,rs]=(0,m.useState)(!1),[Ng,_l]=(0,m.useState)(""),[uu,B1]=(0,m.useState)("Connections are still loading."),[Sg,kg]=(0,m.useState)(!1),[j1,os]=(0,m.useState)(!1),[Tg,ze]=(0,m.useState)(""),[L1,Hl]=(0,m.useState)(!1),[Dr,hu]=(0,m.useState)(""),[dn,Ir]=(0,m.useState)(null),[mu,_n]=(0,m.useState)(null),[Cg,Ul]=(0,m.useState)(!1),[un,_r]=(0,m.useState)(""),[Eg,oi]=(0,m.useState)(null),Hr=i?.settings.townMapView??Nl("cover"),Ag=i?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:null,G1=dn?.size??Ag,zg=i?Pe==="existing"?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:ns&&Il===Pe?ns:{width:i.settings.townMapGenerationWidth,height:i.settings.townMapGenerationHeight}:null,Y1=i?{min:i.settings.townMapZoomMin,max:i.settings.townMapZoomMax,step:i.settings.townMapZoomStep}:{min:1,max:1,step:.1},X1=Fo?null:dn?dn.image:Dr||null,Xi=Pe==="none"?null:Pe==="existing"?Dr||null:Il===Pe&&(Pe!=="generate"||q1===du)&&U1||null,ql=dn!==null||Cg,Pi=ql?mu??Hr:Hr,pu=dn?jp(dn.size):null,[si,tt]=(0,m.useState)(""),[oa,ce]=(0,m.useState)(""),[B,ae]=(0,m.useState)(!1),[q,Ke]=(0,m.useState)(null),[P1,ss]=(0,m.useState)(!1),[Q1,Ja]=(0,m.useState)(!1),[ls,Hn]=(0,m.useState)(""),[cs,Bl]=(0,m.useState)("chat"),[ds,gu]=(0,m.useState)(""),[Z1,Rg]=(0,m.useState)(""),[K1,Fa]=(0,m.useState)([]),Wa=(0,m.useRef)(new Set),[us,J1]=(0,m.useState)(!1),Mg=(0,m.useRef)(0),Ur=(0,m.useRef)(0),Og=(0,m.useRef)(""),[fu,qr]=(0,m.useState)(""),[en,St]=(0,m.useState)(!1),[hs,Vg]=(0,m.useState)(""),jl=(0,m.useRef)(new Set),Un=(0,m.useRef)(!1),Qi=(0,m.useRef)(null),ms=(0,m.useRef)(null),sa=(0,m.useRef)(null),li=(0,m.useCallback)(l=>{let u=[];for(let g of l)Wa.current.has(g.id)||(Wa.current.add(g.id),u.push(g));u.length>0&&Fa(g=>[...g,...u])},[]),ps=(0,m.useRef)(!1),[F1,kt]=(0,m.useState)(""),[W1,Zi]=(0,m.useState)(""),[Br,jr]=(0,m.useState)(!1),[Dg,bu]=(0,m.useState)(""),Ig=(0,m.useRef)(""),Ll=(0,m.useRef)(!1),[vu,_g]=(0,m.useState)(!1),yu=(0,m.useRef)(null),wu=(0,m.useRef)(null);(0,m.useEffect)(()=>{let l=wu.current,u=yu.current;l===null||!u||(wu.current=null,u.focus(),u.setSelectionRange(l,l))},[ea]);let Gl=(0,m.useCallback)(async(l=!1)=>{if(Ll.current)return null;Ll.current=!0;let u=setTimeout(()=>_g(!0),uS);try{let g=await U("/reconcile",{method:"POST",body:l?JSON.stringify({forceStory:!0}):void 0});return r(g),g}catch{return null}finally{clearTimeout(u),_g(!1),Ll.current=!1}},[]),e$=(0,m.useCallback)(async()=>{let l=i?.happenings[0]?.id??"";bu("Writing...");let u=await Gl(!0);if(!u){bu("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}bu((u.happenings[0]?.id??"")===l?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[i,Gl]),qe=(0,m.useCallback)(async(l={})=>{try{let u=await U("",{signal:l.signal});r(u),tt("")}catch(u){if(l.signal?.aborted||l.quiet)return;r(null),tt(L(u,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let l=i?.village.nextTransitionAt??"";l.length===0||l===Ig.current||(Ig.current=l,i?.isFounded&&Gl())},[i,Gl]);let hn=(0,m.useCallback)(async l=>{try{let u=await U("/catalog",{signal:l});h(u.characters),tt("")}catch(u){if(l?.aborted)return;tt(L(u,"Could not read your character library."))}},[]),Lr=(0,m.useCallback)(async l=>{try{let u=await U("/personas",{signal:l});Wp(u.personas)}catch(u){if(l?.aborted)return;Wp([]),tt(L(u,"Could not read your Personas."))}},[]),Gr=(0,m.useCallback)(async l=>{try{let u=await U("/lorebooks",{signal:l});z1(u.books),og("")}catch(u){if(l?.aborted)return;og(L(u,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),Hg=(0,m.useRef)(new Set),gs=(0,m.useCallback)(async l=>{try{let u=await U("/memories",{signal:l});w(u),tt("");let g=u.archive.pendingReviewId;g&&!Hg.current.has(g)&&!l?.aborted&&(Hg.current.add(g),window.setTimeout(()=>{l?.aborted||U(`/rooms/archive/${encodeURIComponent(g)}/retry-memory`,{method:"POST"}).then(()=>U("/memories")).then(k=>{l?.aborted||w(k)}).catch(()=>{})},0))}catch(u){if(l?.aborted)return;w(null),tt(L(u,"Could not read villager memories."))}},[]),t$=(0,m.useCallback)(async(l,u)=>{let g=l==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(g)){ae(!0);try{await U(`/memories/${l}/${encodeURIComponent(u)}`,{method:"DELETE"}),await gs()}catch(k){tt(L(k,"That memory could not be removed."))}finally{ae(!1)}}},[gs]),Yl=(0,m.useCallback)(async l=>{try{let u=await U("/agendas",{signal:l});mt(u.villagers)}catch(u){if(l?.aborted)return;mt(null),tt(L(u,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(Le!=="menu"||G!=="agendas"&&G!=="schedules"||!et?.some(u=>u.agenda?.personalizationPending&&!u.agenda.personalizationFailure))return;let l=window.setInterval(()=>{Yl()},5e3);return()=>window.clearInterval(l)},[et,Yl,G,Le]);let a$=(0,m.useCallback)(async l=>{ae(!0);try{let u=await U(`/agendas/${encodeURIComponent(l)}/regenerate`,{method:"POST"});mt(u.villagers),tt("")}catch(u){tt(L(u,"That villager could not be asked again."))}finally{ae(!1)}},[]),n$=(0,m.useCallback)(async(l,u)=>{ae(!0);try{let g=await U(`/agendas/${encodeURIComponent(l)}/completed/${encodeURIComponent(u)}/correct`,{method:"POST"});mt(g.villagers),tt("")}catch(g){tt(L(g,"That wish completion could not be corrected."))}finally{ae(!1)}},[]),i$=(0,m.useCallback)(async(l,u)=>{ae(!0);try{let g=await U(`/agendas/${encodeURIComponent(l)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:u})});mt(g.villagers),tt("")}catch(g){tt(L(g,"Schedule use could not be changed."))}finally{ae(!1)}},[]);(0,m.useEffect)(()=>{let l=new AbortController;return qe({signal:l.signal}),()=>l.abort()},[qe]),(0,m.useEffect)(()=>{let l=()=>{document.hidden||qe({quiet:!0})},u=setInterval(()=>{document.hidden||Ll.current||qe({quiet:!0})},dS);return document.addEventListener("visibilitychange",l),()=>{clearInterval(u),document.removeEventListener("visibilitychange",l)}},[qe]),(0,m.useEffect)(()=>{if(!q?.id||q.status==="closed"||Le!=="room")return;Og.current!==q.id?(Og.current=q.id,Ur.current=Date.parse(q.lastActivityAt||q.startedAt)||Date.now()):Ur.current=Math.max(Ur.current,Date.parse(q.lastActivityAt||q.startedAt)||0);let l=!1,u=_=>{l||Po(q.id,sa.current)||(Ke(null),Ja(!1),Fa([]),Wa.current.clear(),qr(_==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ie("home"),qe())},g=(_=!1)=>{Po(q.id,sa.current)||U("/rooms/active").then(async({session:P})=>{if(l||Po(q.id,sa.current))return;if(P?.id===q.id){_&&(await U("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:q.id})}),Ur.current=Date.now());return}let Ce=await U(`/rooms/archive/${encodeURIComponent(q.id)}`).catch(()=>null);l||Po(q.id,sa.current)||u(Ce?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(P=>{let Ce=Qo(P);Ce&&u(Ce)})},k=_=>{if(!Po(q.id,sa.current)){if(Date.now()-Ur.current>=30*6e4){_.cancelable&&_.preventDefault(),_.stopImmediatePropagation(),g(!0);return}Ur.current=Date.now(),!(Date.now()-Mg.current<15e3)&&(Mg.current=Date.now(),U("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:q.id})}).catch(P=>{let Ce=Qo(P);Ce?u(Ce):g()}))}},M=()=>g();window.addEventListener("focus",M),document.addEventListener("visibilitychange",M);for(let _ of["pointerdown","keydown","input","scroll"])window.addEventListener(_,k,!0);return()=>{l=!0,window.removeEventListener("focus",M),document.removeEventListener("visibilitychange",M);for(let _ of["pointerdown","keydown","input","scroll"])window.removeEventListener(_,k,!0)}},[q?.id,q?.status,q?.lastActivityAt,q?.startedAt,Le,qe]),(0,m.useEffect)(()=>{let l=new AbortController;return U("/rooms/active",{signal:l.signal}).then(({session:u,debugDiscardEnabled:g})=>{J1(g),!(l.signal.aborted||!u)&&(Ke(u),Bl("chat"),Ja(!0),ie("room"),u.status==="opening"&&(St(!0),U("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u.id}),signal:AbortSignal.timeout(3e4)}).then(({session:k})=>{l.signal.aborted||Ke(k)}).catch(async k=>{if(l.signal.aborted)return;let M=await r1(u.id);l.signal.aborted||(M?Ke(M):kt(s1(k)))}).finally(()=>{l.signal.aborted||St(!1)})))}).catch(()=>{}),()=>l.abort()},[]),(0,m.useEffect)(()=>{if(G!=="chatlogs"||!i?.isFounded)return;let l=new AbortController,u=new URLSearchParams;return j&&u.set("venueId",j),ve&&u.set("characterId",ve),u.set("offset",String(O)),u.set("limit","20"),p(null),U(`/rooms/archive?${u.toString()}`,{signal:l.signal}).then(({visits:g,total:k})=>{l.signal.aborted||(p(g),R(k),he(""))}).catch(g=>{l.signal.aborted||he(L(g,"Venue visits could not be read."))}),()=>l.abort()},[j,ve,O,$,G,i?.isFounded]);let $u=(0,m.useCallback)(async l=>{try{let u=await U(`/rooms/archive/${encodeURIComponent(l)}`);E(u.visit),he("")}catch(u){he(L(u,"That visit could not be read."))}},[]),r$=(0,m.useCallback)(async l=>{ae(!0);try{await U(`/rooms/archive/${encodeURIComponent(l)}/retry-memory`,{method:"POST"}),await $u(l),y(u=>u+1),he("")}catch(u){he(L(u,"Memory filing is still pending."))}finally{ae(!1)}},[$u]),Ug=(0,m.useCallback)(async l=>{if(window.confirm(l?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){ae(!0);try{await U(l?`/rooms/archive/${encodeURIComponent(l)}`:"/rooms/archive",{method:"DELETE"}),E(null),V(0),y(u=>u+1),he("")}catch(u){he(L(u,"Visit transcripts could not be deleted."))}finally{ae(!1)}}},[]);(0,m.useEffect)(()=>{if(!Dt)return;let l=new AbortController;return hn(l.signal),()=>l.abort()},[Dt,hn]);let qg=i?i.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(qg===null)return;let l=new AbortController;return(async()=>{try{let u=await U("/town-map",{signal:l.signal});hu(u.image)}catch{l.signal.aborted||hu("")}})(),()=>l.abort()},[qg]);let o$=(0,m.useCallback)(async l=>{ae(!0);try{r(await U("/villagers",{method:"POST",body:JSON.stringify({characterId:l})})),tt(""),await hn()}catch(u){tt(L(u,"That character could not move in."))}finally{ae(!1)}},[hn]),s$=(0,m.useCallback)(async l=>{ae(!0);try{r(await U(`/villagers/${encodeURIComponent(l)}`,{method:"DELETE"})),tt(""),d&&await hn()}catch(u){tt(L(u,"That villager could not leave."))}finally{ae(!1)}},[d,hn]),l$=(0,m.useCallback)(async l=>{C(l);try{let u=await U(`/villagers/${encodeURIComponent(l)}/refresh`);J(g=>({...g,[l]:u})),tt("")}catch(u){tt(L(u,"That villager's card could not be compared."))}finally{C("")}},[]),c$=(0,m.useCallback)(async l=>{C(l);try{r(await U(`/villagers/${encodeURIComponent(l)}/refresh`,{method:"POST"})),J(u=>{let g={...u};return delete g[l],g}),tt("")}catch(u){tt(L(u,"That villager's card could not be refreshed."))}finally{C("")}},[]),wt=(0,m.useCallback)(l=>{l==="projects"&&zt(""),ce(""),Ae(!1),l==="villagers"&&hn(),l==="village"&&Lr(),l==="village"&&Gr(),l==="memories"&&(w(null),gs()),(l==="agendas"||l==="schedules")&&Yl(),l==="progress"&&U("/progress/debug").then(xt).catch(g=>{xt(null),tt(L(g,"Progress diagnostics are unavailable."))}),l==="village"&&(Le!=="menu"||G!=="village")&&i&&(Rn(i.settings.promptKnowledge),Mn(i.settings.playerPersonaId),eg(i.settings.setting),tg(i.settings.selectedLorebookIds),ag(i.settings.loreTokenBudget),Ar(Zo(i.settings.venues).map(g=>({...g})))),T(l),ie("menu")},[Yl,hn,Gr,gs,Lr,G,Le,i]),Xl=(0,m.useCallback)(()=>{je(!1),ce(""),W(null),Ae(!1),ie("home")},[]),ci=(0,m.useCallback)(l=>{!l.memoryPending||jl.current.has(l.id)||(jl.current.add(l.id),Vg(l.id),U(`/rooms/archive/${encodeURIComponent(l.id)}/retry-memory`,{method:"POST"}).then(u=>{Un.current||(Ke(g=>g?.id===l.id?u.session:g),li(u.recordEvents??[]))}).catch(u=>{Un.current||kt(L(u,"Memory review is still pending. You can leave and retry from Memories."))}).finally(()=>{jl.current.delete(l.id),Vg(u=>u===l.id?"":u)}))},[li]);(0,m.useEffect)(()=>{if(!hs)return;let l=window.setInterval(()=>{U(`/rooms/archive/${encodeURIComponent(hs)}`).then(({visit:u})=>{Un.current||!jl.current.has(hs)||Ke(g=>g?.id===u.id&&g.memoryPending?{...g,memoryPending:u.memoryPending,memoryReview:u.memoryReview}:g)}).catch(()=>{})},2e3);return()=>window.clearInterval(l)},[hs]);let d$=(0,m.useCallback)(async()=>{if(!(!q||en)&&!(q.memoryPending&&(q.status==="closed"||Br))){if(!q.id||q.status==="closed"||Br){sa.current=null,Ja(!1),Ke(null),Fa([]),Wa.current.clear(),Hn(""),Zi(""),ie("home"),qe();return}St(!0),kt(""),Y(!1),Ke({...q,status:"closing"}),sa.current={roomId:q.id,submissionId:""};try{let l=await U("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:q.id})});if(Un.current)return;Ke(l.session),jr(!0),li(l.recordEvents??[]),ci(l.session),Hn(""),Zi(""),qe()}catch(l){if(Un.current)return;sa.current=null;let u=Qo(l);if(u){Ke(null),Ja(!1),Fa([]),Wa.current.clear(),qr(u==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ie("home"),qe();return}kt(L(l,"You could not leave the venue.")),Y(!0)}finally{St(!1)}}},[qe,li,q,en,Br,ci]),u$=(0,m.useCallback)(async()=>{if(!q?.id||q.status!=="active"||en||ps.current)return;let l=ms.current??Ud();ms.current=l,sa.current={roomId:q.id,submissionId:l},St(!0),kt(""),Y(!1);try{let u=await U("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:q.id,submissionId:l,message:ls}),signal:AbortSignal.timeout(3e5)});Ke(u.session),jr(!0),li(u.recordEvents??[]),ci(u.session),ms.current=null,Hn(""),qe()}catch(u){let g=await o1(q.id,l);if(g){Ke(g),jr(!0),ci(g),Hn(""),kt(""),Y(!1),ms.current=null,qe();return}sa.current=null;let k=Qo(u);if(k){Ke(null),Ja(!1),Fa([]),Wa.current.clear(),qr(k==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ie("home"),qe();return}kt(L(u,"The scene could not end yet.")),Y(!0)}finally{St(!1)}},[qe,li,q,en,ls,ci]),h$=(0,m.useCallback)(async()=>{if(!(!q?.id||Un.current)){Un.current=!0,St(!0);try{await U("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:q.id})}),sa.current=null,Ja(!1),Ke(null),Fa([]),Wa.current.clear(),ie("home"),Y(!1),qe()}catch(l){kt(L(l,"The visit could not be left yet.")),Un.current=!1}finally{St(!1)}}},[qe,q]),m$=(0,m.useCallback)(async()=>{if(!(!q?.id||!us||en)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){St(!0);try{await U("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:q.id})}),Ke(null),Ja(!1),Fa([]),Wa.current.clear(),Hn(""),ie("home"),qe()}catch(l){kt(L(l,"The debug discard failed."))}finally{St(!1)}}},[q,us,en,qe]),p$=(0,m.useCallback)(async()=>{let l=ls.trim();if(q===null||!q.id||Br||en||ps.current||l.length===0)return;ps.current=!0;let u=Qi.current??Ud();Qi.current=u;let g=q;try{await U("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:q.id})})}catch(M){ps.current=!1;let _=Qo(M);_?(Ke(null),Ja(!1),Fa([]),Wa.current.clear(),qr(_==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ie("home"),qe()):kt(L(M,"The visit could not be checked."));return}let k={speakerId:"",name:"",role:"user",content:l,at:new Date().toISOString()};St(!0),kt(""),Hn(""),Ke({...q,lines:[...q.lines,k]}),sa.current={roomId:q.id,submissionId:u};try{let M=await U("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:q.id,message:l,mode:cs,targetId:cs==="fulfill"?ds:"",submissionId:u}),signal:AbortSignal.timeout(3e5)});Ke(M.session),jr(M.session.status==="closed"),M.session.status!=="closed"&&(sa.current=null),li(M.recordEvents??[]),M.session.status==="closed"&&ci(M.session),ds&&!M.session.activeIds.includes(ds)&&gu(""),Rg(M.verdict?.reason??""),Bl("chat"),Qi.current=null,Zi(""),qe()}catch(M){let _=await o1(q.id,u);if(_){Ke(_),jr(!0),ci(_),kt(""),Qi.current=null,Zi(""),qe();return}sa.current=null;let P=Qo(M);if(P){Ke(null),Ja(!1),Fa([]),Wa.current.clear(),qr(P==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ie("home"),qe();return}Ke(g),Hn(l),kt(L(M,"That line could not be sent."))}finally{ps.current=!1,St(!1)}},[qe,li,q,en,ls,Br,cs,ds,ci]),g$=(0,m.useCallback)(l=>(i?.villagers??[]).filter(u=>u.place?.id===l),[i]),xu=(0,m.useCallback)(l=>{W(null),Ae(!1),Nt(l.id),pe("view"),st("exterior"),_e(null),Re(null),ie("venue")},[]),Nu=(0,m.useCallback)(async l=>{St(!0),kt(""),Zi("");try{let u=await U("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(3e4)});Ke(u.session),qe()}catch(u){let g=await r1(l);g?Ke(g):kt(s1(u))}finally{St(!1)}},[qe]),f$=(0,m.useCallback)(async l=>{St(!0);try{let{session:u}=await U("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(1e4)});Ke(u),Zi(u.lines.length===0?"The opening failed. You can start the conversation now.":""),kt("")}catch(u){kt(L(u,"The visit could not continue. Retry or leave the venue."))}finally{St(!1)}},[]),Pl=(0,m.useCallback)(async(l,u,g="",k)=>{Un.current=!1,sa.current=null,W(null),Ae(!1),oi(null),Hn(""),jr(!1),kt(""),Zi(""),Fa([]),Wa.current.clear(),St(!0),Ke({version:1,id:"",placeId:l.id,placeName:l.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Ja(!0),ie("room");try{let{session:M}=await U("/rooms",{method:"POST",body:JSON.stringify({venueId:l.id,spaceClass:u,privateOwnerId:g,entryArea:k}),signal:AbortSignal.timeout(2e4)});Ke(M),Bl("chat"),gu(""),Rg(""),qr(""),Ja(!0),qe(),M.status==="opening"&&await Nu(M.id)}catch(M){kt(L(M,"That room could not be opened. Retry or leave the venue."))}finally{St(!1)}},[Nu,qe]),Bg=(0,m.useCallback)(l=>{Ae(!1),W(l.id),ie("home")},[]),jg=(0,m.useCallback)(()=>{Nt(null),pe("view"),st("exterior"),_e(null),Re(null),W(null),ie("home")},[]),b$=(0,m.useCallback)(async()=>{ae(!0),ce("");try{r(await U("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:ea,playerPersonaId:ia,setting:Tl,selectedLorebookIds:Cl,loreTokenBudget:Kd})}))}catch(l){ce(L(l,"Those settings could not be saved."))}finally{ae(!1)}},[ea,Cl,Kd,ia,Tl]),v$=(0,m.useCallback)(async l=>{ae(!0),ce("");try{r(await U("/settings",{method:"PATCH",body:JSON.stringify({storyPace:l})}))}catch(u){ce(L(u,"That could not be saved."))}finally{ae(!1)}},[]),y$=(0,m.useCallback)(async l=>{let u=i?.settings.characterSpeechColors??!0;r(g=>g&&{...g,settings:{...g.settings,characterSpeechColors:l}}),ae(!0),ce("");try{r(await U("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:l})}))}catch(g){r(k=>k&&{...k,settings:{...k.settings,characterSpeechColors:u}}),ce(L(g,"Character speech colors could not be saved."))}finally{ae(!1)}},[i?.settings.characterSpeechColors]),Lg=(0,m.useCallback)(async l=>{ae(!0),ce("");try{r(await U("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:l})})),y(u=>u+1)}catch(u){ce(L(u,"Visit retention could not be saved."))}finally{ae(!1)}},[]),w$=(0,m.useCallback)(async()=>{if(!(i&&Zo(i.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){ae(!0),ce("");try{let l=await U("/bootstrap",{method:"POST"});Ar(l.places.map(u=>({id:Ld(),name:u.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(l){ce(L(l,"The village did not suggest any places."))}finally{ae(!1)}}},[i]),$$=(0,m.useCallback)(async()=>{if(Lt.trim().length===0){ze("Describe what the village is like before generating its map.");return}rs(!0),ze("");try{let l=await U("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:Or===i?.settings.townMapLayoutPrompt?void 0:Or,negative:Vr===i?.settings.townMapNegativePrompt?void 0:Vr,setting:Lt,options:Dl,selectedLorebookIds:Qa,scenarioImprint:i?.isFounded?{origin:"",worldFacts:In,openingConditions:[],visualCues:[]}:null})}),u=await Yd(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");iu(l.image),ru("generate"),xg(du),ou(u),Yi("generate")}catch(l){ze(L(l,"The village map could not be generated."))}finally{rs(!1)}},[Qa,Vr,Or,Lt,Dl,du,In,i?.isFounded,i?.settings.townMapLayoutPrompt,i?.settings.townMapNegativePrompt]),x$=(0,m.useCallback)(async()=>{ze(""),ae(!0);try{let l=await U("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:Lt,selectedLorebookIds:Qa,loreTokenBudget:Er})});Ol(l.names)}catch(l){ze(L(l,"The village could not suggest names for the public venue."))}finally{ae(!1)}},[Qa,Er,Lt]),N$=(0,m.useCallback)(async l=>{if(!l||!i)return;ze("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let g=k=>Math.round(k/1e5)/10;ze(`That picture is ${g(l.size)} MB and a village map holds ${g(u)} MB. Choose a smaller copy.`);return}rs(!0);try{let g=await kl(l),k=await Yd(g);iu(g),ru("upload"),ou(k),Yi("upload")}catch(g){ze(L(g,"That picture could not be used as the village map."))}finally{rs(!1)}},[i]),S$=(0,m.useCallback)(()=>{if(!i)return;let l=Object.fromEntries(i.settings.venues.map(u=>[u.id,{x:u.presentation.x,y:u.presentation.y}]));V1(l),ug(l),O1(i.settings.townMapImageSetAt),zl(i.settings.venues[0]?.id??null),Wd(!0),Rr(!1),Ir(null),_n(null),Ul(!1),ce("")},[i]),k$=(0,m.useCallback)(async()=>{if(i){lg(!0),ce("");try{let l=await U("/setup/town-map/generate",{method:"POST",body:JSON.stringify({setting:i.settings.setting,selectedLorebookIds:i.settings.selectedLorebookIds,scenarioImprint:{origin:"",worldFacts:i.settings.worldFacts,openingConditions:[],visualCues:[]}})}),u=await Yd(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");Ir({image:l.image,size:u}),Rr(!1),_n(Nl("cover"))}catch(l){ce(L(l,"The village map could not be generated."))}finally{lg(!1)}}},[i]),T$=(0,m.useCallback)(async l=>{if(!l||!i)return;ce("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let g=k=>Math.round(k/1e5)/10;ce(`That picture is ${g(l.size)} MB and the village map holds ${g(u)} MB. Try a smaller copy.`);return}ae(!0);try{let g=await kl(l),k=await Yd(g);Ir({image:g,size:k}),Rr(!1),_n(Nl("cover"))}catch(g){ce(L(g,"That picture could not be used as the village map."))}finally{ae(!1)}},[i]),Gg=(0,m.useCallback)(async()=>{if(!i)return;let l=Fo?"":dn?.image??Dr;ae(!0),ce("");try{let u=Object.fromEntries(i.settings.venues.map(k=>[k.id,Gd(k)])),g=await U("/town-map",{method:"PUT",body:JSON.stringify({image:l,view:mu??i.settings.townMapView,expectedMapSetAt:Za?cg:i.settings.townMapImageSetAt,placements:Object.entries(Za?dg:u).map(([k,M])=>({venueId:k,fromX:M.x,fromY:M.y,x:Za?Wo[k]?.x??null:M.x,y:Za?Wo[k]?.y??null:M.y}))})});r(g),hu(l),Ir(null),_n(null),Ul(!1),Wd(!1),Rr(!1),Jo(null)}catch(u){ce(L(u,"The village map could not be saved."))}finally{ae(!1)}},[i,mu,Dr,dn,Fo,Za,cg,dg,Wo]),Yg=(0,m.useCallback)(()=>{Ir(null),_n(null),Ul(!1),Wd(!1),Rr(!1),Jo(null),ce("")},[]),C$=(0,m.useCallback)(async(l,u,g="")=>{if(!un){_r(l),oi(null),ce("");try{r(await U("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:g})}))}catch(k){oi({id:l,text:L(k,"That place could not be drawn.")})}finally{_r("")}}},[un]),E$=(0,m.useCallback)(async(l,u,g,k="")=>{if(!(!u||!i||un)){_r(l),oi(null),ce("");try{let M=P=>Math.round(P/1e5)/10;if(u.size>i.settings.maxVenueImageBytes){oi({id:l,text:`That picture is ${M(u.size)} MB and a place holds ${M(i.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let _=await kl(u);r(await U("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:l,image:_,spaceClass:g,privateOwnerId:k})}))}catch(M){oi({id:l,text:L(M,"That picture could not be kept.")})}finally{_r("")}}},[un,i]),A$=(0,m.useCallback)(async(l,u,g="")=>{if(!un){_r(l),oi(null),ce("");try{r(await U("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:g})}))}catch(k){oi({id:l,text:L(k,"That picture could not be taken away.")})}finally{_r("")}}},[un]),z$=(i?.settings.venues.length??0)+El.filter(l=>!i?.settings.venues.some(u=>u.id===l.id)).length,R$=(0,m.useCallback)((l,u,g)=>{let k=dt.find(_=>_.category==="public-center"),M=au??(Al?k?.id:void 0);if(X0({x:l,y:u},dt.filter(_=>_.id!==M).map(_=>_.presentation),g??{width:1e3,height:700,photoWidth:58,photoHeight:58})){nu("That photograph would cover another venue. Place it a little to the side.");return}if(nu(""),M)Li(_=>_.map(P=>P.id===M?{...P,presentation:{...P.presentation,x:l,y:u}}:P)),Ka(M);else if(Al){let _=a1(Ld(),"gathering",l,u);Li(P=>[...P,_]),Ka(_.id)}else if(Fd){let _=dt.filter(Ce=>Ce.classes?.includes("residence"));if(_.length>=1+s)return;let P=a1(Ld(),"residence",l,u,_.length===0,_.length+1);Li(Ce=>[...Ce,P]),Ka(P.id)}Gi(null),Vn(!1),ji(!1)},[au,Fd,Al,s,dt]),Ki=(0,m.useCallback)((l,u)=>{Li(g=>g.map(k=>k.id===l?u(k):k))},[]),M$=(0,m.useCallback)(l=>{Li(u=>{let g=u.filter(k=>k.id!==l);if(!g.some(k=>k.occupancy.playerHome)){let k=g.findIndex(M=>M.classes?.includes("residence"));k>=0&&(g[k]={...g[k],occupancy:{...g[k].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return g}),Ka(u=>u===l?null:u)},[]),O$=l=>{if(i?.isFounded||l===Dn)return;let u=Tr(Dn).premise,g=!!Da.trim()&&Da!==u;gg(l),g||eu(Tr(l).premise),fg(""),ze("")},fs=(0,m.useCallback)((l,u)=>{ce(""),ze(""),kg(!1),os(!1),Hl(!1),je(!1),$a(""),Ml(0),mg(l?"":u?.village.name??""),pg(l?"":u?.village.setting??"");let g=l?"":u?.settings.foundingReason??"",k=Pp.some(Xr=>Xr.value===g),M=k?g:g?"custom":"rebuild",_=Y2[g]??g,P=u?.settings.foundingDetails??"",Ce=[_,P].filter(Boolean).join(" "),_a=Ce.length>(u?.settings.foundingDetailsMaxLength??500),Yr=u?.isFounded?P:g&&!k?_a?P:Ce:l||!g?Tr(M).premise:P,qn=l?"":u?.isFounded?u.settings.foundingGuidance??"":[_a?_:"",u?.settings.foundingGuidance??""].filter(Boolean).join(" ");gg(M),eu(Yr),fg(M==="none"?"":qn),I1(l?Hp():u?.settings.scenarioImprint??Hp()),bg(l?[]:u?.settings.worldFacts??[]),Ol([]);let ma=l||!u?[]:u.settings.venues.filter(Xr=>Xr.classes?.includes("residence")||Xr.category==="public-center");Li(ma),Ka(ma[0]?.id??null),Gi(null),ri(null),nu(""),ng(l?[]:u?.settings.selectedLorebookIds??[]),ig(l?1600:u?.settings.loreTokenBudget??1600),$g({...F0}),Yi(l?"generate":u?.settings.townMapImageSetAt?"existing":"none"),iu(""),ru(null),xg(""),ou(null),su(u?.settings.townMapLayoutPrompt??""),lu(u?.settings.townMapNegativePrompt??""),rs(!1),Mn(l?"":u?.settings.playerPersonaId??""),Lr(),Gr(),ie("setup")},[Gr,Lr]),Xg=(0,m.useCallback)(l=>{if(Ue===0&&l>0){if(ln.trim().length===0){ze("Give the village a name before continuing.");return}if(Lt.trim().length===0){ze("Describe what the village is like before continuing.");return}if(!i?.isFounded&&!Da.trim()){ze("Describe the village's first day before continuing.");return}}if(Ue===1&&l>1){if(!ia.trim()){ze("Choose the Persona who lives in this village.");return}if(!On?.some(u=>u.id===ia)){ze("That Persona is no longer in your library. Choose another one to continue.");return}if(uu.length>0){ze(uu);return}if(Sg){os(!0);return}}if(Ue===2&&l>2&&Pe!=="none"&&!Xi){ze(Pe==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(Ue===3&&l>3){let u=dt.filter(P=>P.classes?.includes("residence")),g=u.filter(P=>!P.occupancy.playerHome),k=g.length;if(!u.some(P=>P.occupancy.playerHome)||k<W0||k>e1||!dt.some(P=>P.category==="public-center")){ze("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let M=g.map(P=>P.occupancy.residentCharacterId).filter(Boolean);if(M.length!==g.length||new Set(M).size!==M.length){ze("Assign a different villager to each villager Residence before review.");return}let _=dt.map(P=>({venue:P,field:P.name.trim()?P.form?.trim()?P.description.trim()?P.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:P})=>P);if(_){Ka(_.venue.id),ze(`Complete ${_.field.replaceAll("-"," ")} for ${_.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${_.field}`)?.focus(),0);return}}os(!1),ze(""),Ml(l),l===1&&Lr(),l===0&&Gr(),l===3&&hn(),Vn(!1),ji(!1),Gi(null)},[uu,dt,Sg,hn,Lr,Gr,ia,On,Pe,Xi,ln,Da,i?.isFounded,Lt,Ue,e]),V$=(0,m.useCallback)(()=>{os(!1),ze(""),Ml(2),Vn(!1),ji(!1)},[]),D$=(0,m.useCallback)(()=>{os(!1),ze("")},[]),Me=dt.find(l=>l.id===ts)??null,bs=Me?.classes?.includes("gathering")?"gathering":"residence";(0,m.useEffect)(()=>{vg(0),tu(!1)},[ts,bs]),(0,m.useEffect)(()=>{if(!ts||Me?.form?.trim()||yg)return;let l=window.setInterval(()=>vg(u=>(u+1)%5),4e3);return()=>window.clearInterval(l)},[ts,Me?.form,yg]);let Su=Me?Jt(Me,Me.category==="public-center"?"gathering":"residence"):null,I$=l=>({id:l.id,name:l.name,form:l.form??"",description:l.description,spaceDescription:l.spaces?.[0]?.description??"",venueClass:l.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:l.occupancy.residentCharacterId??""}),_$=async(l,u)=>{if(cn)return;if(!(u==="exterior"?l.description:l.spaces?.[0]?.description??"").trim()){Ka(l.id),ze(`Add an ${u} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${u}-description`)?.focus(),0);return}let k=is;Vl(!0),ze("");try{let M=await U("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:I$(l),area:u,villageName:ln,setting:Lt,foundingDetails:Da,scenarioImprint:i?.isFounded?D1:null,worldFacts:i?.isFounded?In:[],selectedLorebookIds:Qa})});cu.current===k&&ri({venueId:l.id,area:u,image:M})}catch(M){ze(L(M,"Venue art could not be generated."))}finally{Vl(!1)}},H$=async(l,u,g)=>{if(!(!g||cn)){if(g.size>(i?.settings.maxVenueImageBytes??8e6)){ze("That venue image is too large. Choose a smaller file.");return}Vl(!0),ze("");try{let k=await U("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:l.name,image:await kl(g)})});ri({venueId:l.id,area:u,image:k})}catch(k){ze(L(k,"That venue image could not be uploaded."))}finally{Vl(!1)}}},U$=()=>{if(!as)return;let{venueId:l,area:u,image:g}=as;Ki(l,k=>u==="exterior"?{...k,presentation:{...k.presentation,image:g}}:{...k,spaces:[{...Jt(k,k.classes?.includes("gathering")?"gathering":"residence"),image:g}]}),ri(null)},Pg=(0,m.useCallback)(()=>{if(ln.trim().length===0)return"Give the village a name.";if(ia.trim().length===0)return"Choose the Persona who lives in this village.";if(!i?.isFounded&&!Da.trim())return"Describe the village's first day.";let l=In.map(M=>M.trim()).filter(Boolean);if(i?.isFounded&&(l.length>4||l.some(M=>M.length>160)))return"Use at most four current world facts of 160 characters each.";if(Lt.trim().length===0)return"Describe what the village is like.";if(Pe!=="none"&&!Xi)return"Choose, generate, or upload the village map.";let u=dt.filter(M=>M.classes?.includes("residence")),g=u.filter(M=>!M.occupancy.playerHome);if(g.length<W0||g.length>e1)return"Place one to three homes for initial villagers.";if(!u.some(M=>M.occupancy.playerHome))return"One Residence has to be yours.";if(dt.some(M=>!M.name.trim()||!M.form?.trim()||!M.description.trim()||!M.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let k=g.map(M=>M.occupancy.residentCharacterId).filter(M=>M!==null);return k.length!==g.length?"Choose who lives in each villager home.":new Set(k).size!==k.length?"A villager can only live in one house.":dt.filter(M=>M.category==="public-center").length!==1?"Place one Gathering Place.":""},[dt,ia,Pe,Xi,ln,Da,i?.isFounded,In,Lt]),q$=(0,m.useCallback)(async()=>{let l=Pg();if(l){let u=dt.find(g=>!g.name.trim()||!g.form?.trim()||!g.description.trim()||!g.spaces?.[0]?.description.trim());if(u){let g=u.name.trim()?u.form?.trim()?u.description.trim()?"interior-description":"exterior-description":"form":"venue-name";Ka(u.id),Ml(3),window.setTimeout(()=>e.querySelector(`#${n}-setup-${g}`)?.focus(),0)}ze(l);return}ae(!0),ze("");try{let u=await U("/setup",{method:"POST",body:JSON.stringify({name:ln.trim(),setting:Lt.trim(),foundingReason:i?.isFounded?i.settings.foundingReason:Dn,foundingDetails:i?.isFounded?i.settings.foundingDetails:Da.trim(),foundingGuidance:i?.isFounded?i.settings.foundingGuidance:es.trim(),scenarioImprint:i?.isFounded?i.settings.scenarioImprint:null,worldFacts:i?.isFounded?In.map(g=>g.trim()).filter(Boolean):[],selectedLorebookIds:Qa,loreTokenBudget:Er,playerPersonaId:ia,townMapImage:Xi??"",townMapView:Pe==="existing"?Hr:Nl("cover"),venues:dt})});r(u),Vn(!1),ie(!i?.isFounded||u.foundingPreparation?.status==="pending"||u.foundingPreparation?.status==="failed"?"preparing":"home")}catch(u){ze(L(u,"The village could not be founded."))}finally{ae(!1)}},[e,dt,i?.isFounded,i?.settings.foundingReason,i?.settings.foundingDetails,i?.settings.foundingGuidance,i?.settings.scenarioImprint,ia,Hr,Pg,Pe,Xi,ln,Dn,Da,es,In,Qa,Er,Lt]),B$=(0,m.useCallback)(async()=>{ae(!0),ce("");try{let l=await U("/setup/reset",{method:"POST"});r(l),h(null),fs(!0,l)}catch(l){ce(L(l,"The village could not be reset."))}finally{ae(!1),Hl(!1)}},[fs]),Qg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!i||Qg.current||(Qg.current=!0,i.isFounded?i.foundingPreparation&&i.foundingPreparation.status!=="ready"&&ie("preparing"):fs(!1,i))},[fs,i]),(0,m.useEffect)(()=>{if(Le!=="preparing")return;let l=!1,u=async()=>{try{let k=await U("/setup/preparation");if(l)return;r(k),_l(""),(!k.foundingPreparation||k.foundingPreparation.status==="ready")&&ie("home")}catch(k){l||_l(L(k,"Preparation status could not be read."))}};u();let g=window.setInterval(()=>{u()},2500);return()=>{l=!0,window.clearInterval(g)}},[Le]);let j$=(0,m.useCallback)(async()=>{_l("");try{r(await U("/setup/preparation/retry",{method:"POST"}))}catch(l){_l(L(l,"Preparation could not be retried."))}},[]),L$=(0,m.useCallback)(()=>{_e({id:Ld(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),G$=(0,m.useCallback)(async l=>{ae(!0),ce("");try{let u=i?.settings.venues.some(_=>_.id===l.id)??!1,g=An(l).map(_=>Jt(l,_)),k=await U(u?`/locations/venue/${encodeURIComponent(l.id)}`:"/projects",{method:u?"PUT":"POST",body:JSON.stringify(u?{name:l.name,description:g[0]?.description??l.description}:{name:l.name,classes:l.classes,description:g[0]?.description??l.description})}),M=Zo(k.settings.venues).find(_=>u?_.id===l.id:_.name.toLowerCase()===l.name.trim().toLowerCase());r(k),_e(null),u||wt("projects"),Ar(_=>{let P=_.map(Ce=>Ce.id===l.id&&M?M:Ce);return[...P,...Zo(k.settings.venues).filter(Ce=>!P.some(_a=>_a.id===Ce.id))]})}catch(u){ce(L(u,"That place could not be saved."))}finally{ae(!1)}},[i,wt]),Y$=(0,m.useCallback)(async l=>{let u=i?.settings.venues.find(g=>g.id===l);if(!u){Ar(g=>g.filter(k=>k.id!==l));return}ae(!0),ce("");try{let g=await U(`/locations/venue/${encodeURIComponent(l)}/dependencies`);if(g.roomPresent||g.playerHome||g.residentCharacterIds.length||g.pendingMailCount){ce(g.roomPresent?"End the active visit before deleting this Venue.":g.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let k=g.residentCharacterIds.length+g.pendingResidenceCharacterIds.length,M=k||g.workerCharacterIds.length||g.remapCount||g.eventCount?`This place is referenced by ${k} pending moves, ${g.workerCharacterIds.length} workers, ${g.remapCount} schedule moves, and ${g.eventCount} events. Delete it?`:`Delete ${u.name}?`;if(!window.confirm(M))return;let _=await U(`/locations/venue/${encodeURIComponent(l)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});r(_),Ar(P=>P.filter(Ce=>Ce.id!==l))}catch(g){ce(L(g,"That place could not be removed."))}finally{ae(!1)}},[i]),Zg=(0,m.useCallback)(async(l,u)=>{ae(!0),ce("");try{let g=xe[l.id]??l.venueDraft,k=await U(`/venue-requests/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST",body:u?JSON.stringify(g):void 0});if(r(k),u){let M=new Set(El.map(_=>_.id));Ar(_=>[..._,...Zo(k.settings.venues).filter(P=>!M.has(P.id))])}_t(M=>{let _={...M};return delete _[l.id],_})}catch(g){ce(L(g,u?"That venue could not be approved.":"That request could not be denied."))}finally{ae(!1)}},[xe,El]),X$=(0,m.useCallback)(l=>{let u=yu.current,g=u?.selectionStart??ea.length,k=u?.selectionEnd??g;wu.current=g+l.length,Rn(`${ea.slice(0,g)}${l}${ea.slice(k)}`)},[ea]),Kg=(0,m.useCallback)(async()=>{let l=Rl.trim();if(l.length!==0){ae(!0),ce("");try{r(await U("/noticeboard",{method:"POST",body:JSON.stringify({notice:l})})),hg("")}catch(u){ce(L(u,"That notice could not be pinned up."))}finally{ae(!1)}}},[Rl]),P$=(0,m.useCallback)(async l=>{ae(!0),ce("");try{r(await U(`/noticeboard/${l}`,{method:"DELETE"}))}catch(u){ce(L(u,"That notice could not be taken down."))}finally{ae(!1)}},[]),Ql=Ht.trim().toLowerCase(),ku=(d??[]).filter(l=>Ql.length===0||l.name.toLowerCase().includes(Ql)||l.comment.toLowerCase().includes(Ql)||l.tags.some(u=>u.toLowerCase().includes(Ql))),Jg=[...(i?.villagers??[]).map(l=>l.characterId),...Dt?ku.map(l=>l.id):[]].join(`
`),Fg=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let l=Jg.split(`
`).filter(g=>g.length>0&&!Fg.current.has(g));if(l.length===0)return;for(let g of l)Fg.current.add(g);let u=new AbortController;return(async()=>{try{let g=await iS(l,u.signal);u.signal.aborted||ii(k=>({...k,...g}))}catch{}})(),()=>u.abort()},[Jg]);let Tu=i?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(te(null),Tu.length===0)return;let l=new AbortController;return(async()=>{try{let u=await rS(Tu,l.signal);l.signal.aborted||te(u)}catch{}})(),()=>l.abort()},[Tu]);let Ia=(0,m.useCallback)(l=>l?d?.find(u=>u.id===l)?.name??i?.villagers.find(u=>u.characterId===l)?.name??"":"",[d,i]),Q$=(()=>{let l=i?.settings.venues??[],u=[],g=new Map;for(let k of i?.villagers??[]){let M=k.place?.id;if(!M)continue;let _=g.get(M);_?_.push(k):g.set(M,[k])}for(let k of l){let M=Gd(k);if(!M)continue;let _=i?.projects.find(qn=>qn.venueId===k.id&&qn.lifecycle?.phase!=="complete"),P=()=>{_&&(wt("projects"),pt(_.id),zt(_.id))},Ce=k.occupancy.residentCharacterId,_a=Qd(k),Yr=k.occupancy.playerHome?Sl(i):Ia(Ce);u.push({id:k.id,x:M.x,y:M.y,text:_a?vS(Yr):k.name,image:_?xS:k.presentation.image?.url??null,tone:_a?h1({isPlayerHome:k.occupancy.playerHome,occupant:Ce}):"venue",selected:Ne===k.id,doors:Ne===k.id?[..._?[{label:"View Project",onSelect:P}]:[],..._?.kind==="new-venue"?[]:[{label:"View venue",onSelect:()=>xu(k)},{label:"Visit",onSelect:()=>{Pl(k)}}]]:void 0,onSelect:_?.kind==="new-venue"?P:()=>Bg(k)}),(g.get(k.id)??[]).forEach((qn,ma)=>{u.push({id:`villager:${qn.characterId}`,x:M.x,y:M.y,dy:$S*(ma+1),text:qn.name,tone:"resident",kind:"person"})})}return u})(),Z$=dt.flatMap(l=>{let u=Gd(l);return u?[{id:l.id,x:u.x,y:u.y,text:l.name||(l.category==="public-center"?"Gathering Place":"Residence"),image:l.presentation.image?.url??null,tone:l.category==="public-center"?"venue":l.occupancy.playerHome?"player":"resident",onSelect:()=>Ka(l.id)}]:[]});if(Le==="room")return(0,o.jsxs)("div",{className:`${n}-root ${n}-room-screen`,"data-mobile":t?"true":"false",children:[q?(0,o.jsx)(DS,{room:q,nameColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.nameColor])):{},speechColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.dialogueColor])):{},picture:W2(i?.settings.venues??[],q),draft:ls,mode:cs,targetId:ds,busy:en,error:F1,greetingNotice:W1,ruling:Z1,open:Q1,ended:Br,playerName:Sl(i),playerPortrait:le??void 0,portraits:Va,sprites:Object.fromEntries((i?.villagers??[]).map(l=>[l.characterId,l.sprite])),onDraft:l=>{Qi.current=null,ms.current=null,Hn(l)},onMode:l=>{Qi.current=null,Bl(l)},onTarget:l=>{Qi.current=null,gu(l)},onSend:()=>{cs==="conclude"?u$():p$()},onViewVenue:()=>{Nt(q.placeId),_e(null),ie("venue"),qe()},onEnterPrivate:q.area==="shared"&&q.privateAccessOwnerId?()=>{St(!0),U("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:q.id,ownerId:q.privateAccessOwnerId})}).then(({session:l})=>{Ke(l),qe()}).catch(l=>kt(L(l,"That private space could not be entered."))).finally(()=>St(!1))}:void 0,privateSpaceOwnerName:Ia(q.privateAccessOwnerId),onEnd:()=>{d$()},notices:K1,onDismissNotice:l=>Fa(u=>u.filter(g=>g.id!==l)),debugDiscardEnabled:us,onDebugDiscard:()=>{m$()},onLeavePending:()=>{h$()},endFailed:I,reviewing:hs===q.id,onRetryGreeting:()=>{if(q.id)Nu(q.id);else{let l=i?.settings.venues.find(u=>u.id===q.placeId);l&&Pl(l)}},onContinueWithoutGreeting:()=>{q.id&&f$(q.id)},onUseMailbox:i?.settings.venues.some(l=>l.id===q.placeId&&l.occupancy.playerHome&&(!q.spaceClass||q.spaceClass==="residence"))?()=>ss(!0):void 0,onProjects:()=>wt("projects")}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:Xl,children:"Back to village"}),P1&&i?(0,o.jsx)("div",{className:`${n}-mailbox-backdrop`,onClick:()=>ss(!1),children:(0,o.jsxs)("section",{className:`${n}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:l=>l.stopPropagation(),children:[(0,o.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Mailbox"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>ss(!1),children:"Close"})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,o.jsxs)("div",{className:`${n}-mailbox-list`,children:[[...i.venueMail??[]].reverse().map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsx)("strong",{children:l.title}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("p",{className:`${n}-hint`,children:l.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(l.dueAt).toLocaleString()}`:l.status==="pending-player"?"Awaiting your decision":l.status==="approved"?"Approved":"Declined"}),l.decisions.map(u=>(0,o.jsxs)("p",{children:[(0,o.jsxs)("strong",{children:[Ia(u.characterId),":"]})," ",u.reply]},u.characterId)),l.status==="pending-player"&&l.kind==="villager-change"?(0,o.jsx)(VS,{entry:l,onDecide:async(u,g)=>{r(await U(`/venue-mail/${encodeURIComponent(l.id)}/decision`,{method:"POST",body:JSON.stringify({approved:u,...g})}))}}):null,l.error?(0,o.jsxs)("p",{className:`${n}-hint`,children:["Reply delayed: ",l.error]}):null]},l.id)),(i.venueMail?.length??0)===0&&i.venueRequests.length===0&&i.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No Venue mail yet."}):null,i.venueRequests.map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName||"A villager"," suggests ",l.venueDraft.name]}),(0,o.jsx)("p",{children:l.venueDraft.classes.map(u=>u[0].toUpperCase()+u.slice(1)).join(" / ")}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{ss(!1),wt("venueRequests")},children:"Review request"})]},l.id)),i.upgradeRequests.map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName," suggests a home change"]}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{ss(!1),wt("venueRequests")},children:"Review request"})]},l.id))]})]})}):null]});if(Le==="venue"){let l=(i?.settings.venues??[]).find(z=>z.id===Rt)??null;if(!i||!l)return(0,o.jsx)("div",{className:`${n}-root`,children:(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:"A place that is gone"}),(0,o.jsx)("p",{className:`${n}-subtitle`,children:"This venue is no longer in the village."})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:jg,children:"Back to map"})]})});let u=g$(l.id),g=An(l),k=l.occupancy.homeKind?yS(c,l.occupancy.homeKind).name:"",M=l.occupancy.playerHome?Sl(i):Ia(l.occupancy.residentCharacterId),_=l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[]),P=g.includes("residence")&&_.length>0,Ce=q?.placeId===l.id&&(q.area==="shared"||q.area==="private"),_a=q?.placeId===l.id&&q.area==="private"?q.privateOwnerId:"",Yr=l.occupancy.playerHome||l.playerSeenShared||Ce,qn=(l.privateSpaces??[]).filter(z=>l.playerSeenPrivateIds?.includes(z.ownerId)||z.ownerId===_a),ma=q?.status!=="closed"&&q?.id?q:null,Xr=(l.playerInvitations??[]).some(z=>_.includes(z.residentId)),Cu=[{key:"exterior",label:"Exterior",subtitle:"Outside the building",area:"outside",spaceClass:g[0],ownerId:"",image:l.presentation.image,description:l.form||k||`The outside of ${l.name}.`,state:l.exteriorState,locked:!1,canEnter:!0,accessLabel:"Open (no restrictions)"},...g.map(z=>{let fe=Jt(l,z),Z=z==="residence",ue=Z?!Yr:!l.playerSeenPublic&&!(ma?.placeId===l.id&&ma.area==="public"),at=!Z||!P||l.occupancy.playerHome||Xr;return{key:`class:${z}`,label:g.length===1?"Interior":`${z[0].toUpperCase()}${z.slice(1)} interior`,subtitle:Z?"Shared living space":`${z[0].toUpperCase()}${z.slice(1)} space`,area:Z?"shared":"public",spaceClass:z,ownerId:"",image:ue?null:fe.image,description:ue?"":fe.description,state:ue?void 0:fe.state,locked:ue,canEnter:at,accessLabel:at?"Open to visit":"Resident invitation required"}}),...(l.privateSpaces??[]).filter(z=>_.includes(z.ownerId)).map(z=>{let fe=Ia(z.ownerId),Z=!l.playerSeenPrivateIds?.includes(z.ownerId)&&z.ownerId!==_a,ue=(l.playerInvitations??[]).some(at=>at.scope==="private"&&at.ownerId===z.ownerId&&at.residentId===z.ownerId);return{key:`private:${z.ownerId}`,label:`${fe}'s Private Space`,subtitle:"Restricted area",area:"private",spaceClass:"residence",ownerId:z.ownerId,image:Z?null:z.image,description:Z?"":z.description,state:Z?void 0:z.state,locked:Z,canEnter:ue,accessLabel:ue?"Owner's invitation available":"Owner's invitation required",adaptationPending:!Z&&z.adaptationPending}})],de=Cu.find(z=>z.key===gt)??Cu[0],Wg=(l.editProposals??[]).filter(z=>de.area==="shared"?z.target==="shared":de.area==="private"&&z.target==="private"&&z.ownerId===de.ownerId),Eu=de.description&&de.description!==l.form&&de.description!==k?de.description:"",K$=!de.locked&&!!(Eu||de.adaptationPending||de.state?.condition||de.state?.items.length||de.state?.publicFacts.length||de.state?.features.length||de.area==="outside"&&i.village.setting||Wg.length),Zl=ma?.placeId===l.id&&ma.area===de.area&&(de.area==="outside"||ma.spaceClass===de.spaceClass)&&(de.area!=="private"||ma.privateOwnerId===de.ownerId),Au=(z,fe,Z,ue="")=>(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h3",{className:`${n}-panel-title`,children:z}),fe?(0,o.jsx)("img",{className:`${n}-venue-space-picture`,src:fe.url,alt:`${z} at ${l.name}`}):(0,o.jsx)("div",{className:`${n}-venue-image-empty`,children:"No image yet"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!un||B,onClick:()=>{C$(l.id,Z,ue)},children:fe?"Redraw image":"Draw image"}),(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*","aria-label":`Upload ${z.toLowerCase()} image`,disabled:!!un||B,onChange:at=>{let vs=at.target.files?.[0];at.target.value="",E$(l.id,vs,Z,ue)}}),fe?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!un||B,onClick:()=>{A$(l.id,Z,ue)},children:"Remove image"}):null]})]},ue||Z||"exterior"),Pr=z=>({name:z.name,form:z.form,workerIds:z.workerIds,position:{x:z.presentation.x,y:z.presentation.y},spaces:g.map(fe=>{let Z=Jt(z,fe);return{description:Z.description,condition:Z.state.condition,items:Z.state.items,publicFacts:Z.state.publicFacts,features:Z.state.features.map(({id:ue,text:at,locked:vs})=>({id:ue,text:at,locked:vs}))}}),privateSpaces:z.privateSpaces?.map(fe=>({ownerId:fe.ownerId,description:fe.description,condition:fe.state.condition,items:fe.state.items,publicFacts:fe.state.publicFacts,features:fe.state.features.map(({id:Z,text:ue,locked:at})=>({id:Z,text:ue,locked:at}))}))}),J$=!!(oe&&JSON.stringify(Pr(oe))!==JSON.stringify(Pr(l))),F$=!!(se&&(JSON.stringify(se.classes)!==JSON.stringify(g)||se.capacity!==(l.residenceCapacity??1)||se.slot!==0||se.title||se.description||se.extraBeds)),W$=()=>{(Ze==="edit"&&J$||Ze==="proposal"&&F$)&&!window.confirm("Discard your unsaved changes?")||(pe("view"),_e(null),Re(null),ne(""),ye(""))},ef=(z,fe)=>{r(z);let Z=z.settings.venues.find(ue=>ue.id===l.id);Z&&_e(structuredClone(Z)),ye(fe)},ex=async()=>{if(oe){if(oe.form!==l.form||JSON.stringify(oe.classes)!==JSON.stringify(l.classes)||JSON.stringify(oe.workerIds??[])!==JSON.stringify(l.workerIds??[])||JSON.stringify(oe.state)!==JSON.stringify(l.state)||oe.presentation.x!==l.presentation.x||oe.presentation.y!==l.presentation.y){ne("Physical edits and map moves need an earned route. Edit only the name or description here.");return}if(P){let z=Pr(oe),fe=Pr(l),Z=g.indexOf("residence");if((Z>=0&&JSON.stringify(z.spaces[Z])!==JSON.stringify(fe.spaces[Z])||JSON.stringify(z.privateSpaces)!==JSON.stringify(fe.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}A(!0),ne(""),ye("");try{let z=await U(`/locations/venue/${encodeURIComponent(l.id)}`,{method:"PUT",body:JSON.stringify({name:oe.name,description:oe.description})});ef(z,"Venue details saved.")}catch(z){ne(L(z,"The Venue could not be saved."))}finally{A(!1)}}},tf=async(z,fe="")=>{if(!oe)return;let Z=z==="private"?oe.privateSpaces?.find(at=>at.ownerId===fe):Jt(oe,"residence");if(!Z)return;let ue=structuredClone(oe);if(z==="shared"?ue.spaces=ue.spaces?.map(at=>at.venueClass==="residence"?Jt(l,"residence"):at):ue.privateSpaces=ue.privateSpaces?.map(at=>at.ownerId===fe?l.privateSpaces?.find(vs=>vs.ownerId===fe)??at:at),!(JSON.stringify(Pr(ue))!==JSON.stringify(Pr(l))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){A(!0),ne(""),ye("");try{let at=await U(`/locations/venue/${encodeURIComponent(l.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:z,ownerId:fe,description:Z.description,state:Z.state})});ef(at,`${z==="private"?"Private":"Shared"} room edit proposed.`)}catch(at){ne(L(at,"That room edit could not be proposed."))}finally{A(!1)}}},af=wS(l,M);return(0,o.jsxs)("div",{className:`${n}-root`,"data-venue-view":Ze==="view"?"true":void 0,children:[(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:Ze==="view"?af:`${Ze==="edit"?"Edit Venue":"Propose Change"} \xB7 ${af}`}),(0,o.jsx)("p",{className:`${n}-subtitle`,children:Ze==="view"?l.form||k||(u.length===0?"Nobody is here right now":`Villagers here: ${u.map(z=>z.name).join(", ")}`):Ze==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,o.jsxs)("div",{className:`${n}-venue-header-controls`,children:[(0,o.jsx)("div",{className:`${n}-actions`,children:Ze==="view"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{_e(structuredClone(l)),ne(""),ye(""),pe("edit")},children:"Edit Venue"}),g.includes("residence")&&!l.occupancy.playerHome?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{ne(""),U(`/locations/venue/${encodeURIComponent(l.id)}/player-move`,{method:"POST"}).then(r).catch(z=>ne(L(z,"The move could not be requested.")))},children:"Request to live here"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Re({classes:g,capacity:l.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),ne(""),ye(""),pe("proposal")},children:"Propose Change"}),ma?.placeId===l.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>ie("room"),children:"Return to scene"}):null]}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:W$,children:Ze==="edit"?"Close Editor":"Exit Change Proposal"})}),Ze==="view"&&H?(0,o.jsx)("p",{className:`${n}-venue-move-error`,role:"alert",children:H}):null]})]}),Ze==="view"?(0,o.jsxs)("main",{className:n+"-venue-page","aria-label":"View Venue",children:[(0,o.jsxs)("nav",{className:n+"-venue-zones","aria-label":"Venue zones",children:[(0,o.jsx)("button",{type:"button",className:n+"-venue-back",onClick:jg,children:"\u2190 Back to map"}),Cu.map(z=>(0,o.jsxs)("button",{type:"button",className:n+"-venue-zone-tab","data-active":de.key===z.key?"true":"false","aria-current":de.key===z.key?"page":void 0,onClick:()=>st(z.key),children:[(0,o.jsx)("span",{className:n+"-venue-zone-thumb",children:z.image&&!z.locked?(0,o.jsx)("img",{src:z.image.url,alt:""}):(0,o.jsx)("span",{"aria-hidden":"true",children:z.locked?"\u25C8":"\u2302"})}),(0,o.jsxs)("span",{className:n+"-venue-zone-copy",children:[(0,o.jsx)("strong",{children:z.label}),(0,o.jsx)("small",{children:z.subtitle})]})]},z.key))]}),(0,o.jsxs)("div",{className:n+"-venue-zone-content",children:[(0,o.jsx)("section",{className:n+"-venue-zone-main","aria-label":de.label,children:(0,o.jsx)("div",{className:n+"-venue-artwork",children:de.image&&!de.locked?(0,o.jsx)("img",{src:de.image.url,alt:de.label+" at "+l.name}):(0,o.jsx)("div",{className:n+"-venue-artwork-empty",children:de.locked?"Area not discovered yet":"No image for this area yet"})})}),(0,o.jsxs)("aside",{className:n+"-venue-zone-context",children:[(0,o.jsx)("span",{className:n+"-venue-kicker",children:"Zone"}),(0,o.jsx)("h2",{children:de.label}),(0,o.jsx)("p",{children:de.subtitle}),(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Occupancy"}),(0,o.jsx)("strong",{children:g.includes("residence")?Zd(l)+" / "+l1(l)+" residents":u.length+" here now"})]}),(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Accessibility"}),(0,o.jsx)("strong",{children:de.accessLabel})]}),K$?(0,o.jsxs)("details",{className:n+"-venue-more",children:[(0,o.jsx)("summary",{children:"Area details"}),Eu?(0,o.jsx)("p",{children:Eu}):null,de.adaptationPending?(0,o.jsx)("p",{children:"This room is still being adapted after a move."}):null,de.state?.condition?(0,o.jsxs)("p",{children:["Condition: ",de.state.condition]}):null,de.state?.items.length?(0,o.jsxs)("p",{children:["Present items: ",de.state.items.join(", ")]}):null,de.state?.publicFacts.length?(0,o.jsxs)("p",{children:["Established facts: ",de.state.publicFacts.join(" \xB7 ")]}):null,de.state?.features.length?(0,o.jsxs)("p",{children:["Defining features: ",de.state.features.map(z=>z.text).join(" \xB7 ")]}):null,de.area==="outside"&&i.village.setting?(0,o.jsxs)("p",{children:["Village: ",i.village.setting]}):null,Wg.map(z=>(0,o.jsxs)("p",{children:["Proposed room edit:"," ",z.declined?"declined or stale":`approved by ${z.approvedIds.length} of ${z.requiredIds.length} residents`]},z.id))]}):null,de.locked&&!de.canEnter?(0,o.jsx)("p",{className:n+"-venue-zone-guidance",children:"Visit the exterior and ask the resident for an invitation."}):null,ma&&!Zl?(0,o.jsx)("p",{className:n+"-venue-zone-guidance",children:"Finish the active visit before entering another area."}):null,(0,o.jsx)("button",{type:"button",className:n+"-venue-visit",disabled:en||!Zl&&(!!ma||!de.canEnter),onClick:()=>Zl?ie("room"):void Pl(l,de.spaceClass,de.ownerId,de.area),children:en?"Opening visit\u2026":Zl?"Return to scene \u2192":"Visit this area \u2192"})]})]})]}):Ze==="edit"?(0,o.jsxs)("main",{className:`${n}-venue-editor-page`,children:[(0,o.jsxs)("div",{className:`${n}-venue-space-grid`,children:[Au("Exterior image",l.presentation.image),g.filter(z=>z!=="residence"||Yr).map(z=>Au(z==="residence"?"Shared Residence image":`${z} space image`,Jt(l,z).image,z)),qn.map(z=>Au(`${Ia(z.ownerId)}'s private image`,z.image,"residence",z.ownerId))]}),un===l.id?(0,o.jsx)("p",{className:`${n}-hint`,children:"Drawing or saving the image\u2026"}):null,Eg?.id===l.id?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Eg.text}):null,oe?(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue details"}),(0,o.jsx)(c1,{draft:oe,existing:!0,villagers:i.villagers,editableClasses:g.filter(z=>z!=="residence"||!P||Ce),onChange:_e}),P?(0,o.jsx)("p",{className:`${n}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ee||!oe.name.trim(),onClick:()=>{ex()},children:"Save Venue details"}),P&&Ce?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ee||!Jt(oe,"residence").description.trim(),onClick:()=>{tf("shared")},children:"Propose shared room edit"}):null]}),P&&!Ce?(0,o.jsx)("p",{className:`${n}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,_a&&oe?.privateSpaces?.filter(z=>z.ownerId===_a).map(z=>(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsxs)("h2",{className:`${n}-panel-title`,children:["Propose changes to ",Ia(z.ownerId),"'s private space"]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:z.description,onChange:fe=>_e(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(ue=>ue.ownerId===z.ownerId?{...ue,description:fe.target.value}:ue)})})]}),(0,o.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:z.state.condition,onChange:fe=>_e(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(ue=>ue.ownerId===z.ownerId?{...ue,state:{...ue.state,condition:fe.target.value}}:ue)})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this room."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:z.state.items.join(`
`),onChange:fe=>_e(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(ue=>ue.ownerId===z.ownerId?{...ue,state:{...ue.state,items:fe.target.value.split(`
`)}}:ue)})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this room."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:z.state.publicFacts.join(`
`),onChange:fe=>_e(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(ue=>ue.ownerId===z.ownerId?{...ue,state:{...ue.state,publicFacts:fe.target.value.split(`
`)}}:ue)})})]})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ee||!z.description.trim(),onClick:()=>{tf("private",z.ownerId)},children:"Propose private room edit"})]},z.ownerId)),P&&(l.residentIds?.length??0)>0?(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Resident moves"}),(0,o.jsxs)("select",{value:He,onChange:z=>we(z.target.value),"aria-label":"Destination for resident move",children:[(0,o.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),i.settings.venues.filter(z=>z.id!==l.id&&An(z).includes("residence")&&Zd(z)<l1(z)).map(z=>(0,o.jsx)("option",{value:z.id,children:z.name},z.id))]}),(l.residentIds??[]).map(z=>{let fe=i.residences.find(Z=>Z.characterId===z&&Z.status!=="current");return(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("strong",{children:Ia(z)}),fe?(0,o.jsx)("span",{className:`${n}-hint`,children:fe.status==="moving"?"Moving":"Awaiting consent"}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!He||ee,onClick:()=>{A(!0),U("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:z,venueId:He})}).then(r).catch(Z=>ne(L(Z,"The move could not be requested."))).finally(()=>A(!1))},children:"Ask to move"})]},z)})]}):null,ge?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:ge}):null,H?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:H}):null]}):(0,o.jsx)("main",{className:`${n}-venue-proposal-page`,children:(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Propose a Venue change"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),se?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${n}-row`,children:k1.map(z=>(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:se.classes.includes(z),disabled:!se.classes.includes(z)&&se.classes.length>=2,onChange:fe=>Re(Z=>Z&&{...Z,classes:fe.target.checked?[...Z.classes,z]:Z.classes.filter(ue=>ue!==z)})})," ",z]},z))})]}),se.classes.includes("residence")?(0,o.jsxs)("label",{className:`${n}-label`,children:["Base capacity \xB7 includes you",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:se.capacity,onChange:z=>Re({...se,capacity:Number(z.target.value)})})]}):null,(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:se.slot,onChange:z=>Re({...se,slot:Number(z.target.value)}),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",l.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",l.improvements?.[1]?.title??"empty"]})]})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,o.jsx)("input",{className:`${n}-notice-input`,value:se.title,onChange:z=>Re({...se,title:z.target.value}),placeholder:"A second sleeping alcove"})]}),se.title?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["What changes in the story?",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:se.description,onChange:z=>Re({...se,description:z.target.value})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:3,value:se.extraBeds,onChange:z=>Re({...se,extraBeds:Number(z.target.value)})})]})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ee||se.classes.length<1||se.title.trim().length>0&&!se.description.trim(),onClick:()=>{A(!0),ne(""),U(`/locations/venue/${encodeURIComponent(l.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:se.classes,capacity:se.capacity,...se.title.trim()?{slot:se.slot,improvement:{title:se.title,description:se.description,extraBeds:se.extraBeds}}:{},title:se.title||`Change ${l.name}`,detail:se.description||`Change Venue Classes or capacity at ${l.name}.`})}).then(z=>{r(z),Re(null),ye("Proposal submitted.")}).catch(z=>ne(L(z,"The proposal could not be saved."))).finally(()=>A(!1))},children:"Submit proposal"})]}):(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:ge||"Proposal submitted."}),H?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:H}):null]})})]})}if(Le==="menu")return(0,o.jsxs)("div",{className:`${n}-root ${n}-sectioned-menu`,"data-section":Q,"data-page":G,"data-mobile":t,children:[(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:_S[G]}),t?null:(0,o.jsx)("p",{className:`${n}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,o.jsx)("div",{className:`${n}-actions`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:G!=="index"?()=>T("index"):Xl,children:G!=="index"?"Back to menu":"Back to the village"})}),si?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:si}):null]}),(0,o.jsxs)("nav",{className:`${n}-menu-nav`,"aria-label":"Village menu pages",children:[(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village Management"}),(0,o.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":G==="villagers","data-active":G==="villagers"?"true":"false",disabled:!i||B,onClick:()=>wt("villagers"),children:`Villagers (${i?.villagers.length??0})`}),(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":G==="memories","data-active":G==="memories"?"true":"false",disabled:!i||B,onClick:()=>wt("memories"),children:"Memories"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":G==="venueRequests","data-active":G==="venueRequests"?"true":"false",disabled:!i||B,onClick:()=>wt("venueRequests"),children:`Venue Requests (${(i?.venueRequests?.length??0)+(i?.upgradeRequests?.length??0)+(i?.residences?.filter(l=>l.status==="pending"&&l.requestedBy==="villager").length??0)})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":G==="projects","data-active":G==="projects"?"true":"false",disabled:!i||B,onClick:()=>wt("projects"),children:`Projects (${i?.projects?.filter(l=>(l.kind==="new-venue"||l.kind==="renovation")&&l.lifecycle?.phase!=="complete").length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":G==="village","data-active":G==="village"?"true":"false",onClick:()=>wt("village"),children:"Village Settings"})]})]}),(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"General Settings"}),(0,o.jsx)("div",{className:`${n}-menu-group-buttons`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":G==="general","data-active":G==="general"?"true":"false",onClick:()=>wt("general"),children:"General settings"})})]}),(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Debug"}),(0,o.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[us?(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":G==="progress","data-active":G==="progress"?"true":"false",disabled:!i||B,onClick:()=>wt("progress"),children:"DEBUG: Progress"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":G==="chatlogs","data-active":G==="chatlogs"?"true":"false",disabled:!i||B,onClick:()=>wt("chatlogs"),children:`DEBUG: Venue Visits (${N?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":G==="agendas","data-active":G==="agendas"?"true":"false",disabled:!i||B,onClick:()=>wt("agendas"),children:`DEBUG: Villager Wishes (${et?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":G==="schedules","data-active":G==="schedules"?"true":"false",disabled:!i||B,onClick:()=>wt("schedules"),children:`Villager Agendas (${et?.length??0})`})]})]})]}),G==="index"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-content ${n}-menu-welcome`,role:"main",children:[(0,o.jsx)("span",{className:`${n}-venue-kicker`,children:"Village menu"}),(0,o.jsx)("h2",{children:"Choose where to go"}),(0,o.jsx)("p",{children:"Manage the people and places in your village, adjust settings, or inspect its DEBUG records."}),(0,o.jsxs)("div",{className:`${n}-menu-quick-links`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>wt("villagers"),children:"Village Management"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>wt("general"),children:"General Settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>wt("chatlogs"),children:"DEBUG Settings"})]})]}):!i&&G!=="general"?(0,o.jsx)("section",{className:`${n}-panel ${n}-menu-content`,role:"main",children:si?"The village could not be loaded. Return to the village and try again.":"Loading village menu\u2026"}):G==="general"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-content`,role:"main",children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"General settings"}),(0,o.jsx)(Yp,{}),i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-row`,htmlFor:`${n}-speech-colors`,children:[(0,o.jsx)("input",{id:`${n}-speech-colors`,type:"checkbox",checked:i.settings.characterSpeechColors,disabled:B,onChange:l=>{y$(l.target.checked)}}),(0,o.jsx)("span",{children:"Character chat colors"})]}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Show names and spoken words in the colors captured from each villager\u2019s card. Use Compare card and Apply refresh to adopt later color changes."})]}):null,i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-story-pace`,children:"Story pace"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,o.jsx)("select",{id:`${n}-story-pace`,value:i.settings.storyPace,disabled:B,onChange:l=>{v$(l.target.value)},children:i.settings.storyPaces.map(l=>(0,o.jsx)("option",{value:l,children:l.charAt(0).toUpperCase()+l.slice(1)},l))}),(0,o.jsx)("span",{className:`${n}-hint`,children:lS(i.settings.storyPace)})]}):null,i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-visit-retention`,children:"Visit transcripts"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,o.jsxs)("select",{id:`${n}-visit-retention`,value:i.settings.visitRetention.mode,disabled:B,onChange:l=>{let u=l.target.value;Lg({mode:u,value:u==="count"?100:u==="days"?365:0})},children:[(0,o.jsx)("option",{value:"forever",children:"Keep forever"}),(0,o.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,o.jsx)("option",{value:"days",children:"Retire after days"})]}),i.settings.visitRetention.mode!=="forever"?(0,o.jsx)("input",{type:"number","aria-label":i.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:i.settings.visitRetention.mode==="count"?1:30,max:i.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:i.settings.visitRetention.value,onBlur:l=>{let u=Number(l.target.value);u!==i.settings.visitRetention.value&&Lg({mode:i.settings.visitRetention.mode,value:u})}},`${i.settings.visitRetention.mode}:${i.settings.visitRetention.value}`):null]}):null,(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Starting over"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,o.jsx)("div",{className:`${n}-row`,children:L1?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-danger`,disabled:B,onClick:()=>{B$()},children:"Yes, empty the village"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:()=>Hl(!1),children:"Keep it"})]}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||!i,onClick:()=>Hl(!0),children:"Reset the village and start over"})})]}),oa?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:oa}):null]}):G==="village"?(0,o.jsxs)("div",{className:`${n}-menu-body ${n}-menu-content`,role:"main",children:[i?(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village settings"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"These choices belong to this village. Resident cards shape their voices, and Villages writes each scene around what is happening now. Village knowledge is refreshed for every reply."}),(0,o.jsx)(RS,{}),(0,o.jsxs)("section",{className:n+"-field","aria-label":"Village Map",children:[(0,o.jsx)("h3",{className:n+"-panel-title",children:"Village Map"}),(0,o.jsx)("p",{className:n+"-hint",children:"Replace the background image here. Venue pins remain in their saved places until you reposition them in the preview."}),Za?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:"Venues will not move automatically. Review every pin on the new map; moving one here is free and does not change its residents, projects, or history."}):null,(0,o.jsx)(Gp,{src:X1,alt:"Village map preview with venue pins",pins:i.settings.venues.flatMap(l=>{let u=Za?Wo[l.id]:Gd(l);return!u||u.x===null||u.y===null?[]:[{id:l.id,x:u.x,y:u.y,text:l.name,tone:Qd(l)?h1({isPlayerHome:l.occupancy.playerHome,occupant:l.occupancy.residentCharacterId}):"venue",onSelect:()=>zl(l.id)}]}),placing:Za&&zr!==null,view:Pi,shape:G1,zoom:Y1,mobile:t,onView:ql&&!zr?_n:void 0,onPlace:Za&&zr?(l,u)=>{ug(g=>({...g,[zr]:{x:l,y:u}})),zl(zr),Jo(null)}:void 0}),Za?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:B||Mr,onClick:()=>{k$()},children:Mr?"Generating map\u2026":"Generate replacement"}),(0,o.jsx)("input",{className:n+"-file",type:"file",accept:"image/png,image/jpeg,image/webp,image/avif","aria-label":"Upload replacement village map",disabled:B||Mr,onChange:l=>{let u=l.target.files?.[0];l.target.value="",T$(u)}}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:B||Mr,onClick:()=>{Rr(!0),Ir(null),_n(null),Jo(null)},children:"No background image"})]}),dn||Fo?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:n+"-hint",children:"Select a venue, then choose Move pin and its new position on the preview. Unmoved venues keep their saved coordinates."}),(0,o.jsx)("div",{className:n+"-field","aria-label":"Venue placement",children:i.settings.venues.map(l=>{let u=Wo[l.id],g=l.occupancy.residentCharacterId?Ia(l.occupancy.residentCharacterId):l.occupancy.playerHome?Sl(i):"";return(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":M1===l.id,onClick:()=>zl(l.id),children:l.name}),(0,o.jsx)("span",{className:n+"-hint",children:g||"No resident"}),(0,o.jsx)("span",{className:n+"-hint",children:u?.x!==null&&u?.x!==void 0&&u?.y!==null&&u?.y!==void 0?"On map":"Not placed"}),(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":zr===l.id,onClick:()=>Jo(l.id),children:"Move pin"})]},l.id)})})]}):null,pu?(0,o.jsx)("p",{className:n+"-hint","data-tone":pu.tone,children:pu.text}):null,ql?(0,o.jsx)("div",{className:n+"-steps",role:"group","aria-label":"How the picture sits in the frame",children:m1.map(l=>(0,o.jsx)("button",{type:"button",className:n+"-step","data-clickable":"true","data-active":Pi.fit===l.fit?"true":"false","aria-pressed":Pi.fit===l.fit,onClick:()=>_n({...Pi,fit:l.fit}),children:l.label},l.fit))}):null,(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:B||Mr||!dn&&!Fo,onClick:()=>{Gg()},children:"Save map and placements"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:B||Mr,onClick:Yg,children:"Cancel replacement"})]})]}):ql?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:n+"-steps",role:"group","aria-label":"How the picture sits in the frame",children:m1.map(l=>(0,o.jsx)("button",{type:"button",className:n+"-step","data-clickable":"true","data-active":Pi.fit===l.fit?"true":"false","aria-pressed":Pi.fit===l.fit,onClick:()=>_n({...Pi,fit:l.fit}),children:l.label},l.fit))}),(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:B,onClick:()=>{Gg()},children:"Save framing"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:B,onClick:Yg,children:"Cancel"})]})]}):(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:B,onClick:S$,children:"Replace map"}),i.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:B||!Dr,onClick:()=>Ul(!0),children:"Crop or fit current map"}):null]}),oa?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:oa}):null]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||!i,onClick:()=>fs(!1,i),children:"Run setup again"}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${n}-setting`,className:`${n}-textarea ${n}-off`,value:Tl,maxLength:i.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:l=>eg(l.target.value)}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,o.jsx)(f1,{books:Jd,error:rg,selected:Cl,onChange:tg,disabled:B}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${n}-lore-budget`,className:`${n}-notice-input`,type:"number",min:i.settings.loreTokenBudgetMin,max:i.settings.loreTokenBudgetMax,step:100,value:Kd,disabled:B,onChange:l=>ag(Number(l.target.value))}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,o.jsxs)("section",{className:`${n}-field`,children:[(0,o.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venues"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:L$,disabled:B||z$>=i.settings.maxPlaces,children:"Propose Venue Project"})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,o.jsx)("input",{className:`${n}-notice-input`,type:"search",value:sg,onChange:l=>R1(l.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,o.jsx)("div",{className:`${n}-notice-add`,children:i.settings.venues.filter(l=>`${l.name} ${l.form??""} ${An(l).join(" ")}`.toLowerCase().includes(sg.toLowerCase())).map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name||"Unnamed Residence"}),(0,o.jsx)("span",{className:`${n}-hint`,children:[l.form,An(l).join(" + ")].filter(Boolean).join(" \xB7 ")}),An(l).includes("residence")?(0,o.jsxs)("span",{className:`${n}-hint`,children:[(l.residentIds?.length??+!!l.occupancy.residentCharacterId)+Number(l.occupancy.playerHome)," ","/ ",l.residenceCapacity??1," residents"]}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>xu(l),children:"View Venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>_e(structuredClone(l)),children:"Edit"}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{Y$(l.id)},"aria-label":`Delete ${l.name}`,disabled:B,children:"\xD7"})]})]},l.id))}),oe?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("h3",{className:`${n}-panel-title`,children:i.settings.venues.some(l=>l.id===oe.id)?"Edit Venue":"Create Venue"}),(0,o.jsx)(c1,{draft:oe,existing:i.settings.venues.some(l=>l.id===oe.id),villagers:i.villagers,onChange:_e}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||!oe.name.trim()||!An(oe).every(l=>Jt(oe,l).description.trim()),onClick:()=>{G$(oe)},children:"Save Venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>_e(null),children:"Cancel"})]})]}):null,(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{w$()},disabled:B,children:"Suggest Venues"})}),El.filter(l=>!i.settings.venues.some(u=>u.id===l.id)).map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name}),(0,o.jsx)("span",{className:`${n}-hint`,children:l.form}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>_e(l),children:"Review suggestion"})]},l.id))]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-knowledge`,children:"The information villagers know"}),(0,o.jsx)("textarea",{id:`${n}-knowledge`,ref:yu,className:`${n}-preset`,value:ea,maxLength:i.settings.promptBoxMaxLength,spellCheck:!1,onChange:l=>Rn(l.target.value)}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card guides their voice; additional writing guidance is in Village Settings."}),(0,o.jsx)("div",{className:`${n}-macros`,children:i.settings.macros.map(l=>(0,o.jsx)("button",{type:"button",className:`${n}-macro`,title:`${l.label} \u2014 ${l.help}`,onClick:()=>X$(l.token),children:l.token},l.token))}),(0,o.jsxs)("p",{className:`${n}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,o.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,o.jsx)(AS,{idPrefix:"settings",personas:On,draft:ia,onDraft:Mn,storedId:i.settings.playerPersonaId,storedName:i.settings.playerPersonaName,storedMissing:i.settings.playerPersonaMissing,disabled:B}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{b$()},disabled:B,children:"Save settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Rn(i.settings.defaultPromptKnowledge)},disabled:B,children:"Restore the default box"}),(0,o.jsx)("span",{className:`${n}-hint`,children:ea===i.settings.promptKnowledge&&ia===i.settings.playerPersonaId&&Tl===i.settings.setting&&JSON.stringify(Cl)===JSON.stringify(i.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,oa&&!Za&&!Cg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:oa}):null]}):(0,o.jsxs)("div",{className:`${n}-menu-body ${n}-menu-content`,role:"main",children:[Q==="debug"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-debug-action`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!i||B||vu,onClick:()=>{e$()},children:"Force Village Update"}),(0,o.jsx)("p",{className:`${n}-status`,children:HS}),Dg?(0,o.jsx)("p",{className:`${n}-status`,role:"status",children:Dg}):null]}):null,G==="villagers"&&lt&&i?.villagers.some(l=>l.characterId===lt)?(0,o.jsx)(Cf,{villager:i.villagers.find(l=>l.characterId===lt),request:U,onSaved:l=>r(l),onExport:()=>OS(i.villagers.find(l=>l.characterId===lt)),onBack:()=>{bt(null),requestAnimationFrame(()=>{for(let{element:l,top:u}of zn.current)l.scrollTop=u;Wt.current?.focus({preventScroll:!0})})}},lt):null,G==="villagers"?(0,o.jsxs)("div",{className:`${n}-overlay`,style:lt?{display:"none"}:void 0,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Villagers"})}),(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>je(l=>!l),disabled:B,children:Dt?"Close the list":"Add a villager"})}),Dt?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("input",{className:`${n}-search`,type:"search",value:Ht,onChange:l=>$a(l.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),d===null?(0,o.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):ku.length===0?(0,o.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,o.jsx)("div",{className:`${n}-picker-list`,children:ku.map(l=>(0,o.jsxs)("div",{className:`${n}-picker-item`,"data-resident":l.inVillage?"true":"false",children:[(0,o.jsx)(Cr,{portrait:Va[l.id],name:l.name,className:`${n}-avatar`}),(0,o.jsxs)("div",{className:`${n}-picker-text`,children:[(0,o.jsx)("div",{className:`${n}-villager-name`,children:l.name}),(0,o.jsx)("div",{className:`${n}-villager-role`,children:l.comment||l.tags.slice(0,3).join(" \xB7 ")}),l.summary?(0,o.jsx)("p",{className:`${n}-tile-summary`,children:l.summary}):null]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{o$(l.id)},disabled:B||l.inVillage,children:l.inVillage?"Lives here":"Move in"})]},l.id))})]}):null,i&&i.villagers.length>0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:`${n}-villagers`,children:i.villagers.map(l=>(0,o.jsx)(MS,{villager:l,portrait:Va[l.characterId],selected:!1,onSelect:!l.place||q!==null?void 0:()=>{let u=i.settings.venues.find(g=>g.id===l.place?.id);u&&Bg(u)}},l.characterId))}),(0,o.jsx)("div",{className:`${n}-roster`,children:i.villagers.map(l=>(0,o.jsx)("div",{className:`${n}-roster-entry`,children:(0,o.jsxs)("div",{className:`${n}-roster-row`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-villager-name`,children:l.name}),l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,x[l.characterId]?(0,o.jsx)("div",{className:`${n}-tile-summary`,children:x[l.characterId].changed?`New card: ${x[l.characterId].proposed?.name??"unavailable"}`:x[l.characterId].sourceAvailable?`Snapshot revision ${x[l.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,o.jsxs)("span",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:u=>{Wt.current=u.currentTarget,zn.current=[];for(let g=u.currentTarget.parentElement;g;g=g.parentElement)zn.current.push({element:g,top:g.scrollTop});bt(l.characterId)},"aria-expanded":lt===l.characterId,children:`Sprite Studio \xB7 ${l.sprite?.images.length??0} approved`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{l$(l.characterId)},disabled:B||ct.length>0,children:"Compare card"}),x[l.characterId]?.changed&&x[l.characterId]?.sourceAvailable?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{c$(l.characterId)},disabled:B||ct.length>0,children:"Apply refresh"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{s$(l.characterId)},disabled:B||ct.length>0,children:"Move out"})]})]})},l.characterId))})]}):(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]})]}):null,G==="memories"?(0,o.jsxs)("div",{className:n+"-overlay",children:[(0,o.jsx)("div",{className:n+"-overlay-head",children:(0,o.jsx)("h2",{className:n+"-panel-title",children:"Memories"})}),(0,o.jsx)(Z2,{library:f,busy:B,onRefresh:()=>{w(null),gs()},onForget:(l,u)=>{t$(l,u)}})]}):null,G==="noticeboard"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Noticeboard"})}),i.noticeboard.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,o.jsx)("ul",{className:`${n}-notices`,children:i.noticeboard.map((l,u)=>(0,o.jsxs)("li",{className:`${n}-notice-row`,children:[(0,o.jsxs)("span",{children:[l.author.length>0?(0,o.jsx)("span",{className:`${n}-notice-author`,children:`${l.author}: `}):null,l.text]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{P$(u)},disabled:B,"aria-label":`Take down: ${l.text}`,children:"\xD7"})]},`${u}:${l.text}`))}),(0,o.jsxs)("div",{className:`${n}-notice-add`,children:[(0,o.jsx)("input",{className:`${n}-notice-input`,type:"text",value:Rl,maxLength:i.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:l=>hg(l.target.value),onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),Kg())}}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Kg()},disabled:B||Rl.trim().length===0||i.noticeboard.length>=i.settings.maxNoticeboardNotes,children:`Pin it up (${i.noticeboard.length}/${i.settings.maxNoticeboardNotes})`})]})]}):null,G==="projects"&&i?(0,o.jsx)(US,{snapshot:i,room:q,onSnapshot:r,onReturn:()=>ie("room"),onMap:()=>{zt(""),Xl()},onPlaceOnMap:l=>{pt(l),At(l),Xl()},mobile:t,debugEnabled:us,focusProjectId:Ve,siteProjectId:K}):null,G==="venueRequests"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue Requests"})}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Villagers can ask for places in conversation. Accepting a request starts a New Venue Project; place its blueprint on the map, find a willing Builder, and work through the Project phases."}),i.venueRequests.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody has requested a new place."}):(0,o.jsx)("ul",{className:`${n}-notices`,children:i.venueRequests.map(l=>{let u=xe[l.id]??l.venueDraft,g=k=>_t(M=>({...M,[l.id]:{...u,...k}}));return(0,o.jsx)("li",{className:`${n}-notice-row`,children:(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("strong",{children:l.requesterName||"A villager"}),l.requestQuote?(0,o.jsxs)("p",{children:["\u201C",l.requestQuote,"\u201D"]}):null,(0,o.jsx)("span",{className:`${n}-hint`,children:` \xB7 ${l.source==="chat"?"Conversation":"Village life"}`}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:u.name,maxLength:i.settings.maxVenueNameLength,"aria-label":`Requested place name from ${l.requesterName||"villager"}`,onChange:k=>g({name:k.target.value})}),(0,o.jsxs)("select",{className:`${n}-notice-input`,value:u.classes[0]??"gathering","aria-label":`Requested place class from ${l.requesterName||"villager"}`,onChange:k=>g({classes:[k.target.value]}),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"other",children:"Other"})]}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:u.description??"",maxLength:1e3,"aria-label":`Requested place description from ${l.requesterName||"villager"}`,onChange:k=>g({description:k.target.value})}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||!u.name.trim(),onClick:()=>{ae(!0),ce(""),U("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:u.name,classes:u.classes}]})}).then(k=>g({description:k.descriptions[l.id]??""})).catch(k=>ce(L(k,"The description draft could not be generated."))).finally(()=>ae(!1))},children:"Generate description draft"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||!u.name.trim()||u.classes.length===0||!u.description?.trim(),onClick:()=>{Zg(l,!0)},children:u.name!==l.venueDraft.name||JSON.stringify(u.classes)!==JSON.stringify(l.venueDraft.classes)?"Send counteroffer":"Start planning project"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:()=>{Zg(l,!1)},children:"Deny"})]})]})},l.id)})}),(0,o.jsx)("h3",{className:`${n}-panel-title`,children:"Home upgrade requests"}),i.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No home upgrades requested."}):i.upgradeRequests.map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("span",{children:l.detail}),[!0,!1].map(u=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:()=>{ae(!0),ce(""),U(`/venue-upgrades/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST"}).then(r).catch(g=>ce(L(g,"The upgrade request could not be decided."))).finally(()=>ae(!1))},children:u?"Approve upgrade":"Deny"},String(u)))]},l.id)),(0,o.jsx)("h3",{className:`${n}-panel-title`,children:"Resident move requests"}),i.residences.filter(l=>l.status!=="current").length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No moves pending."}):i.residences.filter(l=>l.status!=="current").map(l=>{let u=Ia(l.characterId),g=i.settings.venues.find(k=>k.id===l.proposedVenueId)?.name||"another venue";return(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("span",{children:`${u} \u2192 ${g}`}),l.status==="moving"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("span",{className:`${n}-hint`,children:["Move due ",new Date(l.completesAt??"").toLocaleString()]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:()=>{ae(!0),ce(""),U("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(k=>ce(L(k,"The move could not be completed."))).finally(()=>ae(!1))},children:"DEBUG: Complete move now"})]}):l.requestedBy==="player"?(0,o.jsxs)("span",{className:`${n}-hint`,children:["Awaiting ",u,"'s answer in conversation."]}):[!0,!1].map(k=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:()=>{ae(!0),ce(""),U(`/residences/${k?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(M=>ce(L(M,"The move request could not be decided."))).finally(()=>ae(!1))},children:k?"Approve move":"Deny"},String(k)))]},l.characterId)}),oa?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:oa}):null]}):null,G==="progress"?(0,o.jsxs)("div",{className:`${n}-panel`,children:[(0,o.jsx)("h2",{children:"DEBUG: Progress"}),(0,o.jsxs)("p",{children:["Engine version: ",Oa?.engineVersion??"loading"]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{U("/progress/debug").then(xt)},children:"Refresh diagnostics"}),Oa?.backlog.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Unprocessed saved turns"}),Oa.backlog.map(l=>(0,o.jsxs)("p",{children:[l.at," \xB7 ",l.sessionId,"/",l.submissionId," ",l.error?`\xB7 ${l.error}`:"\xB7 awaiting replay"]},`${l.sessionId}:${l.submissionId}`))]}):(0,o.jsx)("p",{children:"No saved turns await replay."}),Oa?.tasks.map(l=>(0,o.jsxs)("details",{open:!0,children:[(0,o.jsxs)("summary",{children:[l.definition.owner.kind," ",l.definition.owner.id," \xB7 revision ",l.definition.revision," \xB7"," ",l.resolvedAt?"resolved":l.definition.phases[l.phaseIndex]?.title??"complete"]}),(0,o.jsxs)("p",{children:["Disclosed: ",l.visibleAt||"hidden",l.resolvedAt?` \xB7 Resolved: ${l.resolvedAt} \xB7 ${l.resolutionKey}`:""]}),l.definition.phases.map(u=>(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:u.title}),u.requirements.map(g=>{let k=l.receipts.filter(M=>M.phaseId===u.id&&M.requirementId===g.id);return(0,o.jsxs)("p",{children:[g.title," \xB7 ",l.requirementVisibleAt[g.id]||"hidden"," \xB7"," ",k.length?k.map(M=>`${M.routeId}: ${M.evidence.sourceId} ${M.evidence.excerpt??""}`).join("; "):"pending"]},g.id)})]},u.id)),l.attempts.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Rejected or unavailable"}),l.attempts.map((u,g)=>(0,o.jsxs)("p",{children:[u.phaseId,"/",u.requirementId," \xB7 ",u.status,": ",u.reason]},`${u.evidenceId}:${g}`))]}):null,l.transitions.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Transitions"}),l.transitions.map((u,g)=>(0,o.jsxs)("p",{children:[u.phaseId," \u2192 ",u.at," \xB7 ",u.evidenceId]},`${u.phaseId}:${g}`))]}):null,l.revisionHistory?.map(u=>(0,o.jsxs)("details",{children:[(0,o.jsxs)("summary",{children:["Earlier revision ",u.definition.revision," \xB7 ",u.receipts.length," accepted sources"]}),u.receipts.map(g=>(0,o.jsxs)("p",{children:[g.requirementId," \xB7 ",g.evidence.sourceId," \xB7 ",g.evidence.excerpt??""]},`${g.requirementId}:${g.evidence.sourceId}`)),u.transitions.map((g,k)=>(0,o.jsxs)("p",{children:[g.phaseId," \u2192 ",g.at]},`${g.phaseId}:${k}`))]},u.definition.revision))]},l.definition.id)),si?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:si}):null]}):null,G==="chatlogs"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue visits"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsxs)("select",{"aria-label":"Filter visits by venue",value:j,onChange:l=>{X(l.target.value),V(0),E(null)},children:[(0,o.jsx)("option",{value:"",children:"All venues"}),(i?.settings.venues??[]).map(l=>(0,o.jsx)("option",{value:l.id,children:l.name},l.id))]}),(0,o.jsxs)("select",{"aria-label":"Filter visits by resident",value:ve,onChange:l=>{F(l.target.value),V(0),E(null)},children:[(0,o.jsx)("option",{value:"",children:"All residents"}),(i?.villagers??[]).map(l=>(0,o.jsx)("option",{value:l.characterId,children:l.name},l.characterId))]})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||b===0,onClick:()=>{Ug()},children:"Delete all completed logs"}),We?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:We}):null,N===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading venue visits\u2026"}):N.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No completed visits match these filters."}):N.map(l=>(0,o.jsxs)("section",{children:[(0,o.jsxs)("h3",{className:`${n}-story-day`,children:[l.placeName," \xB7 ",Xd(l.startedAt)]}),(0,o.jsxs)("p",{className:`${n}-story-meta`,children:[l.participants.map(u=>u.name).join(", ")," \xB7 ",l.lineCount," lines",l.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",l.memoryPending?l.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${l.memoryReview.nextRecollection??0}/${l.recollectionCount} recollections reviewed \xB7 ${l.memoryReview.attempts} ${l.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${l.memoryProgress?.nextUnit??0}/${l.memoryUnits} pieces processed)`:""]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{$u(l.id)},children:v?.id===l.id?"Refresh transcript":"Open transcript"}),l.memoryPending?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:()=>{r$(l.id)},children:l.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:()=>{Ug(l.id)},children:"Delete log"})]}),v?.id===l.id?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("ul",{className:`${n}-story`,children:v.lines.map((u,g)=>(0,o.jsx)("li",{className:`${n}-story-row`,children:(0,o.jsxs)("span",{children:[(0,o.jsxs)("span",{className:`${n}-story-meta`,children:[(0,o.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?Pd(i.villagers.find(k=>k.characterId===u.speakerId)?.nameColor):void 0,children:u.name||Sl(i)})," \xB7 ",Xd(u.at)]}),(0,o.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?Pd(i.villagers.find(k=>k.characterId===u.speakerId)?.dialogueColor):void 0,children:Ko(u.content,`venue-${l.id}-${g}-`)}),(0,o.jsxs)("span",{className:`${n}-story-meta`,children:["Heard by:"," ",u.heardBy?.map(k=>v.participants.find(M=>M.characterId===k)?.name??k).join(", ")||"no one"]})]})},`${l.id}:${g}`))}),(v.submissions??[]).some(u=>u.recollections?.length)?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,o.jsx)("summary",{children:"Captured recollections and evidence"}),(0,o.jsx)("ul",{className:`${n}-story`,children:(v.submissions??[]).flatMap(u=>(u.recollections??[]).map(g=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:g.text}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Subjects: ${g.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${g.knownByCharacterIds.join(", ")}`}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Evidence: ${g.lineIds.join(", ")}`})]},g.id)))})]}):null,v.memoryReview&&v.memoryReview.status!=="none"?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,open:v.memoryPending,children:[(0,o.jsx)("summary",{children:`Durable review \xB7 ${v.memoryReview?.status??"none"}`}),(0,o.jsxs)("div",{className:`${n}-agenda-notes-body`,children:[(0,o.jsxs)("p",{className:`${n}-story-meta`,children:[`${v.memoryReview?.attempts??0} review attempts \xB7 ${v.memoryReview?.nextRecollection??0} recollections reviewed`,v.memoryReview?.error?` \xB7 Last error: ${v.memoryReview.error}`:""]}),(0,o.jsx)("ul",{className:`${n}-story`,children:(v.memoryReview?.decisions??[]).map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:`${u.action==="promote"?"Promoted":"Rejected"}${u.category?` \xB7 ${$1[u.category]}`:""}`}),u.text?(0,o.jsx)("p",{children:u.text}):null,(0,o.jsx)("p",{className:`${n}-wish-meta`,children:u.reason}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Sources: ${u.recollectionIds.join(", ")}`})]},u.id))})]})]}):null]}):null]},l.id)),b>20?(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:O===0,onClick:()=>{V(Math.max(0,O-20)),E(null)},children:"Previous"}),(0,o.jsxs)("span",{children:[O+1,"\u2013",Math.min(b,O+20)," of ",b]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:O+20>=b,onClick:()=>{V(O+20),E(null)},children:"Next"})]}):null]}):null,G==="agendas"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"What the villagers wish"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),et===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading what the villagers wish\u2026"}):et.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("section",{children:et.map(l=>(0,o.jsxs)("div",{children:[(0,o.jsxs)("h3",{className:`${n}-story-day`,children:[l.name,l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null]}),l.agenda===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):l.agenda.wishes.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure?`Wish generation failed: ${l.agenda.personalizationFailure}`:l.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,o.jsx)("ul",{className:`${n}-story`,children:l.agenda.wishes.map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:u.wish}),u.tell.length>0?(0,o.jsx)("p",{className:`${n}-wish-tell`,children:`Shows as: ${u.tell}`}):null,(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`${u.intensity===1?"Faint":u.intensity===3?"Strong":"Present"} \xB7 ${F2(u.addedAt??"",u.expiresAt??"")}`})]},u.id))}),l.completedWishes.length>0?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,o.jsx)("summary",{children:`Completed wishes (${l.completedWishes.length})`}),(0,o.jsx)("ul",{className:`${n}-story`,children:l.completedWishes.map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:u.wish.wish}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Fulfilled ${new Date(u.fulfilledAt).toLocaleDateString()}`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:()=>{n$(l.characterId,u.wish.id)},children:"Mark as not fulfilled"})]},u.wish.id))})]}):null]},l.characterId))})]}):null,G==="schedules"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Villager agendas"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),et===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Loading agendas\u2026"}):et.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("div",{className:`${n}-agenda-list`,children:et.map(l=>(0,o.jsxs)("details",{className:`${n}-week`,children:[(0,o.jsx)("summary",{className:`${n}-week-toggle`,children:(0,o.jsxs)("h3",{className:`${n}-week-head`,children:[l.name,l.agenda?.personalizationPending?(0,o.jsx)("span",{className:`${n}-badge`,children:l.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,l.agenda?.personalizationFailure?(0,o.jsx)("span",{className:`${n}-badge`,children:"Personalization failed"}):null,l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"Card missing"}):null,l.nativeSchedule?(0,o.jsx)("span",{className:`${n}-badge`,children:l.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,qp(l)?(0,o.jsx)("span",{className:`${n}-badge`,children:"Earlier hours kept"}):null]})}),(0,o.jsxs)("div",{className:`${n}-week-body`,children:[l.agenda?.routineSummary?(0,o.jsx)("p",{className:`${n}-story-meta`,children:l.agenda.routineSummary}):null,l.agenda?.personalizationFailure?(0,o.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure}):l.agenda?.personalizationPending?(0,o.jsx)("p",{className:`${n}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,o.jsxs)("div",{className:`${n}-agenda-actions`,children:[(0,o.jsxs)("label",{className:`${n}-agenda-switch`,children:[(0,o.jsx)("input",{type:"checkbox",checked:l.ingestSchedule,disabled:B,onChange:u=>{i$(l.characterId,u.target.checked)}}),"Use Marinara schedule when available"]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:()=>{a$(l.characterId)},children:"Regenerate agenda"})]}),l.nativeSchedule?(0,o.jsxs)("p",{className:`${n}-story-scope`,children:[l.ingestSchedule&&l.remapFailure?`Schedule translation failed: ${l.remapFailure.message}`:l.ingestSchedule&&l.agenda?.scheduleWeek?"Schedule guides today and future days.":l.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",qp(l)?" Earlier hours retain the previous plan.":""]}):qp(l)?(0,o.jsx)("p",{className:`${n}-story-scope`,children:"Earlier hours retain the previous plan."}):null,l.weekUnreadable?(0,o.jsx)("p",{className:`${n}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):l.nativeSchedule?null:(0,o.jsx)("p",{className:`${n}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,o.jsx)("div",{className:`${n}-agenda-days`,children:l.days.map(u=>{let g=u.isToday?l.agenda?.activeDay?.blocks??l.agenda?.week?.[u.weekday]??[]:(l.ingestSchedule?l.agenda?.scheduleWeek?.[u.weekday]:void 0)??l.agenda?.week?.[u.weekday]??[],k=l.nativeSchedule?.days[u.weekday]??[];return(0,o.jsxs)("details",{className:`${n}-agenda-day`,open:u.isToday||void 0,children:[(0,o.jsxs)("summary",{children:[u.weekday," \xB7 ",u.dateLabel,u.isToday?" \xB7 Today":""]}),(0,o.jsxs)("div",{className:`${n}-agenda-compare`,"data-comparison":l.nativeSchedule?"true":void 0,children:[(0,o.jsxs)("section",{"aria-label":`${u.weekday} Villages agenda`,children:[(0,o.jsx)("h4",{children:"Villages agenda"}),(0,o.jsx)("ol",{className:`${n}-agenda-blocks`,children:g.map((M,_)=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("time",{children:[i1(M.startMinute),"\u2013",i1(M.endMinute)]}),(0,o.jsx)("strong",{children:M.activity}),(0,o.jsx)("span",{children:M.venueId?K2(i?.settings.venues??[],M.venueId):"Home"}),(0,o.jsx)("span",{children:M.reason}),(0,o.jsx)("span",{className:`${n}-story-scope`,children:M.status==="idle"?"Available":M.status==="dnd"?"Busy":M.status==="offline"?"Offline":"Online"})]},`${M.startMinute}-${M.endMinute}-${_}`))})]}),l.nativeSchedule?(0,o.jsxs)("section",{"aria-label":`${u.weekday} Marinara schedule`,children:[(0,o.jsx)("h4",{children:"Marinara schedule"}),k.length?(0,o.jsx)("ol",{className:`${n}-agenda-blocks`,children:k.map((M,_)=>(0,o.jsxs)("li",{children:[(0,o.jsx)("time",{children:M.time}),(0,o.jsx)("strong",{children:M.activity}),(0,o.jsx)("span",{className:`${n}-story-scope`,children:M.status||"No availability set"})]},`${M.time}-${_}`))}):(0,o.jsx)("p",{className:`${n}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${u.weekday}-${u.dateLabel}`)})})]})]},l.characterId))})]}):null,oa?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:oa}):null]})]});if(Le==="preparing"){let l=i?.foundingPreparation,u=i?.villagers.length??0,g=l?.completedIds.length??0,k=i?.villagers.find(Ce=>Ce.characterId===l?.currentId)?.name,M=l?.stage==="reading"?"Reading the character card and native schedule":l?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":l?.stage==="resolving"?"Connecting to the System model":l?.stage==="model"?`Waiting for ${l.modelName||"the System model"} to write wishes, the week, and schedule mappings`:l?.stage==="applying"?"Expanding the week and applying native schedule times":l?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",_=l?.stageStartedAt?Date.parse(l.stageStartedAt):NaN,P=l?.status==="pending"&&Number.isFinite(_)?Math.max(0,Math.floor((Date.now()-_)/1e3)):null;return(0,o.jsx)("div",{className:`${n}-root ${n}-preparing`,role:"status","aria-live":"polite",children:(0,o.jsxs)("div",{children:[(0,o.jsx)("div",{className:`${n}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,o.jsxs)("h1",{children:[i?.village.name??"Your village"," is settling in"]}),(0,o.jsx)("p",{children:l?.status==="failed"?"The villagers need a hand before the gates open.":k?`Making room for ${k}\u2026`:"Lighting windows and making plans\u2026"}),(0,o.jsx)("p",{children:`${g} of ${u} villagers ready`}),l?.status==="pending"&&l.stage?(0,o.jsxs)("p",{children:[M,k?` for ${k}`:"","."]}):null,l?.attempt?(0,o.jsx)("p",{children:`Attempt ${l.attempt} of 3${P!==null?` \xB7 ${P}s in this stage`:""}`}):null,l?.stage==="resolving"||l?.stage==="model"||l?.stage==="applying"||l?.stage==="saving"?(0,o.jsx)("p",{children:`${l.loreEntryCount??0} relevant lorebook entries included`}):null,l?.status==="pending"&&l.error?(0,o.jsx)("p",{className:`${n}-hint`,children:`Previous attempt: ${l.error}`}):null,l?.status==="failed"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:l.error}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{j$()},children:"Retry this villager"}),(0,o.jsxs)("details",{children:[(0,o.jsx)("summary",{children:"Change connections"}),(0,o.jsx)(Yp,{})]})]}):null,Ng?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Ng}):null]})})}if(Le==="setup"){let l=(d??[]).map(u=>({id:u.id,name:u.name}));return(0,o.jsx)("div",{className:`${n}-root ${n}-home ${n}-setup-root`,children:(0,o.jsxs)("div",{className:`${n}-home-body ${n}-setup-body`,"data-step":Ue,children:[(0,o.jsx)("aside",{className:`${n}-setup-rail`,"aria-label":"Founding progress",children:Bd.map((u,g)=>(0,o.jsxs)("div",{className:`${n}-setup-rail-step`,"data-active":g===Ue?"true":"false","data-done":g<Ue?"true":"false","aria-current":g===Ue?"step":void 0,children:[(0,o.jsx)("span",{className:`${n}-setup-rail-number`,children:g+1}),(0,o.jsx)("span",{children:u})]},u))}),(0,o.jsx)("div",{className:`${n}-side`,children:(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:i?.isFounded?"Setting the village up again":"Founding your village"})}),(0,o.jsxs)("p",{className:`${n}-setup-kicker`,children:["Step ",Ue+1," of ",Bd.length," \xB7 ",Bd[Ue]]}),Ue===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-name`,children:"What is this village called?"}),(0,o.jsx)("input",{id:`${n}-setup-name`,className:`${n}-search`,type:"text",value:ln,maxLength:i?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:B,onChange:u=>mg(u.target.value)})]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Choose a scenario"}),(0,o.jsx)("div",{className:`${n}-scenario-options`,children:Pp.filter(u=>u.value!=="custom"||i?.isFounded&&Dn==="custom").map(u=>(0,o.jsxs)("label",{className:`${n}-scenario-option`,children:[(0,o.jsx)("input",{type:"radio",name:`${n}-founding-scenario`,checked:Dn===u.value,disabled:B||i?.isFounded,onChange:()=>O$(u.value)}),(0,o.jsx)("span",{className:`${n}-scenario-icon`,"aria-hidden":"true",children:u.icon}),(0,o.jsx)("strong",{children:u.label}),(0,o.jsx)("small",{children:u.description})]},u.value))})]}),i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,Ue===1?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(ES,{personas:On,draft:ia,onDraft:Mn,disabled:B}),(0,o.jsx)(Yp,{onSetupProblem:B1,onImageWarningChange:kg,compact:!0}),j1?(0,o.jsxs)("div",{className:`${n}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,o.jsx)("p",{className:`${n}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,o.jsxs)("span",{className:`${n}-chat-confirm-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:D$,children:"Set up an image connection"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:V$,children:"I understand, continue"})]})]}):null]}):null,Ue===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${n}-setup-setting`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:Lt,maxLength:i?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:B||ra,onChange:u=>{pg(u.target.value),Ol([])}}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),i?.isFounded?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("strong",{children:"Day 1 record"}),(0,o.jsx)("p",{className:`${n}-hint`,children:i.settings.foundingDetails||"This village has no recorded first-day description."}),(0,o.jsx)("span",{className:`${n}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-founding-details`,children:"What happens on the village's first day?"}),(0,o.jsx)("textarea",{id:`${n}-founding-details`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:Da,maxLength:i?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:B,onChange:u=>eu(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history."})]}),i?.isFounded?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-world-facts`,children:"Current world facts"}),(0,o.jsx)("textarea",{id:`${n}-world-facts`,className:`${n}-textarea`,value:In.join(`
`),disabled:B,placeholder:"One stable fact per line, up to four.",onChange:u=>bg(u.target.value.split(/\r?\n/u))}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,o.jsx)(f1,{books:Jd,error:rg,selected:Qa,onChange:u=>{ng(u),Ol([])},disabled:B}),(0,o.jsxs)("details",{className:`${n}-field`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Advanced lore settings"}),(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${n}-setup-lore-budget`,className:`${n}-notice-input`,type:"number",min:i?.settings.loreTokenBudgetMin??200,max:i?.settings.loreTokenBudgetMax??3200,step:100,value:Er,disabled:B,onChange:u=>ig(Number(u.target.value))}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Ue===2&&i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"Replace the map and review venue pins in Village Settings \u2192 Village Map. Finish this setup to keep changes you made on earlier steps."}):null,Ue===2&&!i?.isFounded?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-steps`,role:"group","aria-label":"Village map image source",children:[(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":Pe==="generate"?"true":"false","aria-pressed":Pe==="generate",disabled:ra,onClick:()=>Yi("generate"),children:"Generate with AI"}),(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":Pe==="upload"?"true":"false","aria-pressed":Pe==="upload",disabled:ra,onClick:()=>Yi("upload"),children:"Upload an image"}),(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":Pe==="none"?"true":"false","aria-pressed":Pe==="none",disabled:ra,onClick:()=>Yi("none"),children:"No background image"}),i?.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":Pe==="existing"?"true":"false","aria-pressed":Pe==="existing",disabled:ra,onClick:()=>Yi("existing"),children:"Keep current map"}):null]}),Pe==="generate"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Advanced map elements"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,o.jsx)("div",{className:`${n}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([u,g])=>(0,o.jsxs)("label",{className:`${n}-label`,children:[g,(0,o.jsxs)("select",{className:`${n}-select`,value:Dl[u],disabled:ra,onChange:k=>$g(M=>({...M,[u]:k.target.value})),children:[(0,o.jsx)("option",{value:"auto",children:"Auto"}),(0,o.jsx)("option",{value:"include",children:"Include"}),(0,o.jsx)("option",{value:"exclude",children:"Exclude"})]})]},u))})]}),(0,o.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Testing prompt controls"}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-prompt`,children:[(0,o.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,o.jsx)("textarea",{id:`${n}-setup-map-prompt`,className:`${n}-textarea`,value:Or,maxLength:1500,disabled:ra,onChange:u=>su(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-negative`,children:[(0,o.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,o.jsx)("textarea",{id:`${n}-setup-map-negative`,className:`${n}-textarea`,value:Vr,maxLength:1500,disabled:ra,onChange:u=>lu(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ra||Or===i?.settings.townMapLayoutPrompt&&Vr===i?.settings.townMapNegativePrompt,onClick:()=>{su(i?.settings.townMapLayoutPrompt??""),lu(i?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ra||Lt.trim().length===0,onClick:()=>{$$()},children:ra?"Generating map\u2026":Il==="generate"?"Generate again":"Generate map"})})]}):null,Pe==="upload"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:ra,"aria-label":"Choose a village map image",onChange:u=>{let g=u.target.files?.[0];u.target.value="",N$(g)}}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,Pe==="none"?(0,o.jsx)("p",{className:`${n}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image in Village Settings \u2192 Village Map later."}):null,ns&&Pe!=="none"&&Il===Pe&&zg?(0,o.jsx)("p",{className:`${n}-hint`,"data-tone":jp(ns).tone,children:jp(ns).text}):null]}):null,Ue===3&&i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"Existing Venues keep their locations. Use Village Settings \u2192 Village Map to reposition them with a replacement map, and View Venue to edit their details."}):null,Ue===3&&!i?.isFounded?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Place your home, one to three villager homes, and a Gathering Place. Choose who lives where. Villages will draft the place details for you to review."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||cn||dt.filter(u=>u.classes?.includes("residence")).length>=1+s,onClick:()=>{Vn(!0),ji(!1),Gi(null)},children:"Place a Residence"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||cn||dt.some(u=>u.category==="public-center"),onClick:()=>{Vn(!1),ji(!0),Gi(null)},children:"Place a Gathering Place"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||cn||dt.length===0,onClick:()=>{Li([]),Ka(null),ri(null),Gi(null),Vn(!1),ji(!1)},children:"Reset all venues"})]}),wg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:wg}):null,(0,o.jsx)("div",{className:`${n}-setup-venue-list`,children:dt.map(u=>(0,o.jsxs)("button",{type:"button",className:`${n}-setup-venue-card`,"data-selected":u.id===ts?"true":"false",onClick:()=>Ka(u.id),children:[u.presentation.image?(0,o.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,o.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:u.name||"Unnamed venue"}),(0,o.jsxs)("small",{children:[u.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",u.occupancy.playerHome?"You":Ia(u.occupancy.residentCharacterId)||"Choose a villager"]})]})]},u.id))}),Me&&Su?(0,o.jsxs)("div",{className:`${n}-setup-venue-editor`,children:[(0,o.jsxs)("h3",{className:`${n}-panel-title`,children:[Me.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",Me.name]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Gi(Me.id),Vn(!1),ji(!1)},children:"Move on map"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>M$(Me.id),children:"Remove venue"})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Name",(0,o.jsx)("input",{id:`${n}-setup-venue-name`,className:`${n}-notice-input`,value:Me.name,maxLength:100,onChange:u=>Ki(Me.id,g=>({...g,name:u.target.value}))})]}),Me.category==="public-center"?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||cn,onClick:()=>{x$()},children:"Suggest three names"}),_1.map(u=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ki(Me.id,g=>({...g,name:u})),children:u},u))]}):null,(0,o.jsxs)("p",{className:`${n}-hint`,children:["Class: ",bs==="gathering"?"Gathering":"Residence"]}),(0,o.jsxs)("div",{className:`${n}-setup-form-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-form`,children:"Form"}),(0,o.jsx)("textarea",{id:`${n}-setup-form`,className:`${n}-textarea`,rows:2,value:Me.form??"",maxLength:240,placeholder:P2[bs][H1],onFocus:()=>tu(!0),onBlur:()=>tu(!1),onChange:u=>{Ki(Me.id,g=>({...g,form:u.target.value})),ze("")}}),(0,o.jsx)("small",{className:`${n}-hint`,children:"What the Venue actually is"})]}),Me.category!=="public-center"?(0,o.jsxs)("label",{className:`${n}-label`,children:["Resident",(0,o.jsxs)("select",{className:`${n}-select`,value:Me.occupancy.residentCharacterId??"",disabled:Me.occupancy.playerHome,onChange:u=>Ki(Me.id,g=>({...g,residentIds:u.target.value?[u.target.value]:[],occupancy:{...g.occupancy,residentCharacterId:u.target.value||null}})),children:[(0,o.jsx)("option",{value:"",children:Me.occupancy.playerHome?"You":"Choose a villager"}),l.map(u=>(0,o.jsx)("option",{value:u.id,disabled:dt.some(g=>g.id!==Me.id&&g.occupancy.residentCharacterId===u.id),children:u.name},u.id))]})]}):null,(0,o.jsx)("div",{className:`${n}-setup-place-spaces`,children:["exterior","interior"].map(u=>{let g=u==="exterior",k=g?"Exterior":"Interior",M=g?Me.presentation.image:Su.image;return(0,o.jsxs)("section",{className:`${n}-setup-place-space`,children:[(0,o.jsx)("h4",{children:k}),(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-${u}-description`,children:[k," Description \xB7 required"]}),(0,o.jsx)("textarea",{id:`${n}-setup-${u}-description`,className:`${n}-textarea`,value:g?Me.description:Su.description,maxLength:1e3,onChange:_=>{let P=_.target.value;Ki(Me.id,Ce=>g?{...Ce,description:P}:{...Ce,spaces:[{...Jt(Ce,bs),description:P}]}),ze(""),ri(null)}}),(0,o.jsxs)("span",{className:`${n}-label`,children:[k," Image \xB7 optional"]}),M?(0,o.jsx)("img",{className:`${n}-setup-image-preview`,src:M.url,alt:`${u} of ${Me.name}`}):(0,o.jsx)("p",{className:`${n}-hint`,children:"No image yet. A placeholder will be used."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:cn,onClick:()=>{_$(Me,u)},children:M?`Regenerate ${k} Image`:`Generate ${k} Image`}),(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*",disabled:cn,"aria-label":`Upload ${u} image for ${Me.name}`,onChange:_=>{let P=_.target.files?.[0];_.target.value="",H$(Me,u,P)}}),M?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ki(Me.id,_=>g?{..._,presentation:{..._.presentation,image:null}}:{..._,spaces:[{...Jt(_,bs),image:null}]}),children:"Remove image"}):null]}),as?.venueId===Me.id&&as.area===u?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("img",{className:`${n}-setup-image-preview`,src:as.image.url,alt:`New ${u} image preview`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:U$,children:"Use this image"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>ri(null),children:"Discard"})]}):null]},u)})})]}):(0,o.jsx)("p",{className:`${n}-hint`,children:"Place or select a venue to edit it."}),d===null?(0,o.jsx)("p",{className:`${n}-hint`,children:"Reading your villager library\u2026"}):null]}):null,Ue===4?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Village Beginning"}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:ln.trim()})," \xB7 ",Lt.trim()]}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Persona:"})," ",On?.find(u=>u.id===ia)?.name??"Selected Persona"," \xB7 ",(0,o.jsx)("strong",{children:"Scenario:"})," ",Tr(Dn).label]}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Day 1:"})," ",Da||"No first-day description was recorded."]}),es?(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Original founding direction:"})," ",es]}):null]}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Map and lore"}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Map:"})," ",Pe==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,o.jsx)("strong",{children:"Lorebooks:"})," ",Qa.map(u=>Jd?.find(g=>g.id===u)?.name??u).join(", ")||"None"]})]}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Starting places"}),(0,o.jsx)("div",{className:`${n}-setup-venue-list`,children:dt.map(u=>(0,o.jsxs)("div",{className:`${n}-setup-venue-card`,children:[u.presentation.image?(0,o.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,o.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,o.jsxs)("span",{children:[(0,o.jsxs)("strong",{children:[u.name," \xB7 ",u.category==="public-center"?"Gathering Place":"Residence"]}),(0,o.jsxs)("small",{children:[u.form," \xB7"," ",u.occupancy.playerHome?"You":Ia(u.occupancy.residentCharacterId)||"Community"]})]})]},u.id))}),dt.map(u=>(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsxs)("strong",{children:[u.name,":"]})," ",u.description," ",u.spaces?.[0]?.description]},`${u.id}-summary`))]})]}):null,Tg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Tg}):null,oa?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:oa}):null]})}),(0,o.jsxs)("div",{className:`${n}-setup-visual`,children:[Ue<=1?(0,o.jsx)(kS,{scenario:Dn}):(0,o.jsx)("div",{className:`${n}-setup-map-shell`,children:(0,o.jsx)("div",{className:`${n}-setup-map-viewport`,children:(0,o.jsx)(Gp,{src:Xi,alt:`A map of ${ln.trim()||"your new village"}.`,pins:Ue<3?[]:Z$,placing:Ue===3&&!i?.isFounded&&(Fd||Al||au!==null),view:Pe==="existing"?Hr:Nl("cover"),shape:zg,onPlace:Ue===3&&!i?.isFounded?R$:void 0,compact:Ue<2,mobile:t&&Ue>=2,photoPins:Ue>=3})})}),(0,o.jsxs)("nav",{className:`${n}-setup-footer`,"aria-label":"Founding navigation",children:[Ue>0?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B||ra||cn,onClick:()=>Xg(Ue-1),children:"\u2190 Back"}):null,Ue<Bd.length-1?(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:B||ra||cn,onClick:()=>Xg(Ue+1),children:"Next \u2192"}):(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:B||ra||!i,onClick:()=>{q$()},children:i?.isFounded?"Save this village":"Found the village"}),i?.isFounded?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:B,onClick:()=>{Vn(!1),ie("home")},children:"Show me the village"}):null]})]})]})})}return(0,o.jsxs)("div",{className:`${n}-root ${n}-home ${n}-home-full`,"data-mobile":t?"true":"false",children:[(0,o.jsxs)("div",{className:`${n}-home-bar`,children:[(0,o.jsx)(pS,{weather:i?.village.weather??""}),!t&&i?.isFounded&&Zo(i.settings.venues).length>0?(0,o.jsxs)("div",{className:`${n}-places-picker`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-expanded":Ft,"aria-controls":`${n}-places-list`,disabled:B,onClick:()=>{W(null),Ae(l=>!l)},children:"Places"}),Ft?(0,o.jsx)("div",{id:`${n}-places-list`,className:`${n}-places-list`,children:i.settings.venues.map(l=>(0,o.jsxs)("div",{className:`${n}-places-list-row`,children:[(0,o.jsx)("span",{className:`${n}-places-list-name`,children:l.name}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>xu(l),children:"View venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Pl(l)},children:"Visit"})]},l.id))}):null]}):null,(0,o.jsxs)("span",{className:`${n}-home-bar-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-mobile-board-button`,"aria-label":`Noticeboard (${i?.noticeboard.length??0})`,disabled:!i||B,onClick:()=>wt("noticeboard"),children:(0,o.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),i?.isFounded?(0,o.jsx)(bS,{happenings:i.happenings,recap:i.recap,mobile:t}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:B||!i,onClick:()=>{T("index"),ie("menu")},children:"\u2630"}),t?null:(0,o.jsx)(fS,{}),It?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{At("")},children:"Cancel placement"}):null]})]}),(0,o.jsx)("div",{className:`${n}-room`,children:(0,o.jsx)("div",{className:`${n}-home-map-viewport`,children:(0,o.jsx)(Gp,{src:Dr||null,alt:`A map of ${i?.village.name??"the village"}.`,pins:Q$,placing:!!It,view:Hr,shape:Ag,onPlace:(l,u)=>{if(!It)return;let g=It;ae(!0),tt(""),U(`/projects/${encodeURIComponent(g)}/place`,{method:"POST",body:JSON.stringify({x:l,y:u})}).then(k=>{r(k),At(""),pt(g),wt("projects")}).catch(k=>tt(L(k,"The blueprint could not be placed here."))).finally(()=>ae(!1))},onDismiss:()=>{W(null),Ae(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:si||oa||vu||fu?(0,o.jsxs)("div",{className:`${n}-notice`,children:[si?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:si}):null,oa?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:oa}):null,vu?(0,o.jsxs)("span",{className:`${n}-status`,children:["Catching up on what ",i?.village.name??"the village"," has been doing\u2026"]}):null,fu?(0,o.jsx)("p",{className:`${n}-status`,children:fu}):null]}):null})})})]})}var Kp=class extends HTMLElement{connectedCallback(){Zp(),this.__root??(this.__root=(0,w1.createRoot)(this)),this.__root.render((0,o.jsx)(Qp,{element:this,children:(0,o.jsx)(BS,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),Zp()})}};function BS({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let i=()=>t(r=>r+1);return e.addEventListener("marinara-capability-props",i),()=>e.removeEventListener("marinara-capability-props",i)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,o.jsx)(YS,{props:e.capabilityProps??{}}):a==="toolbar"?(0,o.jsx)(GS,{props:e.capabilityProps??{}}):(0,o.jsx)(qS,{element:e})}function jS(){return(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,o.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,o.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,o.jsx)("path",{d:"M9.5 16.5h5"})]})}var LS="marinara-active-chat-id";function E1(){try{window.localStorage.removeItem(LS)}catch{}window.location.reload()}function A1(e,t){let[a,i]=(0,m.useState)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(s(!1),i(null),!t)return;let c=new AbortController;return(async()=>{try{let d=await U(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;i(d??null),s(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:r}}function GS({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",i=e.mobileCompact===!0,r=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:s,known:c}=A1(t,a&&t.length>0),[d,h]=(0,m.useState)(!1),f=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!d)return;let b=O=>{f.current?.contains(O.target)||h(!1)},R=O=>{O.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",b),document.addEventListener("keydown",R),()=>{document.removeEventListener("pointerdown",b),document.removeEventListener("keydown",R)}},[d]),!a||!c||s===null)return null;let w=s.name||"your villager",N=s.villageName||"your village",p=`Villages \u2014 this roleplay spun off from ${N}`;return(0,o.jsxs)("span",{className:`${n}-tracker`,"data-compact":i,"data-open":d,ref:f,children:[(0,o.jsxs)("button",{type:"button",className:r?`${r} ${n}-tracker-chip`:`${n}-button ${n}-tracker-chip`,onClick:()=>h(b=>!b),"aria-haspopup":"menu","aria-expanded":d,title:p,"aria-label":p,children:[(0,o.jsx)(jS,{}),(0,o.jsx)("span",{className:`${n}-tracker-label`,children:"Villages"})]}),d?(0,o.jsxs)("div",{className:`${n}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${N}`,children:[(0,o.jsxs)("p",{className:`${n}-tracker-menu-title`,children:["This roleplay spun off from ",N]}),s.resident?(0,o.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[w," still lives there. ",N," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,o.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[w," does not live in ",N," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,o.jsx)("div",{className:`${n}-tracker-menu-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:E1,title:`Leaves this chat and opens Marinara's home screen, where the ${N} tab is waiting.`,children:"Open the village"})})]}):null]})}function YS({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:i,known:r}=A1(t,a&&t.length>0);if(!a||!r)return null;if(i===null)return(0,o.jsx)("div",{className:`${n}-panel-view`,children:(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let s=i.name||"this villager",c=i.villageName||"your village";return(0,o.jsxs)("div",{className:`${n}-panel-view`,children:[(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:i.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${s} does not live there any more. Nothing said here is read by the village either way.`}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Villager"}),(0,o.jsx)("span",{children:s})]}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Chat"}),(0,o.jsx)("span",{children:i.room})]}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Came from"}),(0,o.jsx)("span",{children:c})]}),(0,o.jsx)("div",{className:`${n}-panel-view-actions`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:E1,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(n)||customElements.define(n,Kp);
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
