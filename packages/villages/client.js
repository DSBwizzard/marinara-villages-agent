var D$=Object.create;var Ku=Object.defineProperty;var _$=Object.getOwnPropertyDescriptor;var H$=Object.getOwnPropertyNames;var U$=Object.getPrototypeOf,L$=Object.prototype.hasOwnProperty;var q$=(e,t,a)=>t in e?Ku(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var On=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var B$=(e,t,a,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of H$(t))!L$.call(e,r)&&r!==a&&Ku(e,r,{get:()=>t[r],enumerable:!(i=_$(t,r))||i.enumerable});return e};var In=(e,t,a)=>(a=e!=null?D$(U$(e)):{},B$(t||!e||!e.__esModule?Ku(a,"default",{value:e,enumerable:!0}):a,e));var wc=(e,t,a)=>q$(e,typeof t!="symbol"?t+"":t,a);var jf=On($e=>{"use strict";var th=Symbol.for("react.transitional.element"),j$=Symbol.for("react.portal"),Y$=Symbol.for("react.fragment"),G$=Symbol.for("react.strict_mode"),P$=Symbol.for("react.profiler"),X$=Symbol.for("react.consumer"),Z$=Symbol.for("react.context"),Q$=Symbol.for("react.forward_ref"),F$=Symbol.for("react.suspense"),J$=Symbol.for("react.memo"),If=Symbol.for("react.lazy"),K$=Symbol.for("react.activity"),W$=Symbol.for("react.view_transition"),Mf=Symbol.iterator;function e5(e){return e===null||typeof e!="object"?null:(e=Mf&&e[Mf]||e["@@iterator"],typeof e=="function"?e:null)}var Df={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},_f=Object.assign,Hf={};function fo(e,t,a){this.props=e,this.context=t,this.refs=Hf,this.updater=a||Df}fo.prototype.isReactComponent={};fo.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};fo.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Uf(){}Uf.prototype=fo.prototype;function ah(e,t,a){this.props=e,this.context=t,this.refs=Hf,this.updater=a||Df}var nh=ah.prototype=new Uf;nh.constructor=ah;_f(nh,fo.prototype);nh.isPureReactComponent=!0;var zf=Array.isArray;function eh(){}var vt={H:null,A:null,T:null,S:null},Lf=Object.prototype.hasOwnProperty;function ih(e,t,a){var i=a.ref;return{$$typeof:th,type:e,key:t,ref:i!==void 0?i:null,props:a}}function t5(e,t){return ih(e.type,t,e.props)}function rh(e){return typeof e=="object"&&e!==null&&e.$$typeof===th}function a5(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var Vf=/\/+/g;function Wu(e,t){return typeof e=="object"&&e!==null&&e.key!=null?a5(""+e.key):t.toString(36)}function n5(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(eh,eh):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function go(e,t,a,i,r){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case th:case j$:c=!0;break;case If:return c=e._init,go(c(e._payload),t,a,i,r)}}if(c)return r=r(e),c=i===""?"."+Wu(e,0):i,zf(r)?(a="",c!=null&&(a=c.replace(Vf,"$&/")+"/"),go(r,t,a,"",function(p){return p})):r!=null&&(rh(r)&&(r=t5(r,a+(r.key==null||e&&e.key===r.key?"":(""+r.key).replace(Vf,"$&/")+"/")+c)),t.push(r)),1;c=0;var d=i===""?".":i+":";if(zf(e))for(var h=0;h<e.length;h++)i=e[h],s=d+Wu(i,h),c+=go(i,t,a,s,r);else if(h=e5(e),typeof h=="function")for(e=h.call(e),h=0;!(i=e.next()).done;)i=i.value,s=d+Wu(i,h++),c+=go(i,t,a,s,r);else if(s==="object"){if(typeof e.then=="function")return go(n5(e),t,a,i,r);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function xc(e,t,a){if(e==null)return e;var i=[],r=0;return go(e,i,"","",function(s){return t.call(a,s,r++)}),i}function i5(e){if(e._status===-1){var t=e._result,a=t();a.then(function(i){(e._status===0||e._status===-1)&&(e._status=1,e._result=i,a.status===void 0&&(a.status="fulfilled",a.value=i))},function(i){(e._status===0||e._status===-1)&&(e._status=2,e._result=i,a.status===void 0&&(a.status="rejected",a.reason=i))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var Of=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function qf(e){var t=vt.T,a={};a.types=t!==null?t.types:null,vt.T=a;try{var i=e(),r=vt.S;r!==null&&r(a,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(eh,Of)}catch(s){Of(s)}finally{t!==null&&a.types!==null&&(t.types=a.types),vt.T=t}}function Bf(e){var t=vt.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else qf(Bf.bind(null,e))}var r5={map:xc,forEach:function(e,t,a){xc(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return xc(e,function(){t++}),t},toArray:function(e){return xc(e,function(t){return t})||[]},only:function(e){if(!rh(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};$e.Activity=K$;$e.Children=r5;$e.Component=fo;$e.Fragment=Y$;$e.Profiler=P$;$e.PureComponent=ah;$e.StrictMode=G$;$e.Suspense=F$;$e.ViewTransition=W$;$e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=vt;$e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return vt.H.useMemoCache(e)}};$e.addTransitionType=Bf;$e.cache=function(e){return function(){return e.apply(null,arguments)}};$e.cacheSignal=function(){return null};$e.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=_f({},e.props),r=e.key;if(t!=null)for(s in t.key!==void 0&&(r=""+t.key),t)!Lf.call(t,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&t.ref===void 0||(i[s]=t[s]);var s=arguments.length-2;if(s===1)i.children=a;else if(1<s){for(var c=Array(s),d=0;d<s;d++)c[d]=arguments[d+2];i.children=c}return ih(e.type,r,i)};$e.createContext=function(e){return e={$$typeof:Z$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:X$,_context:e},e};$e.createElement=function(e,t,a){var i,r={},s=null;if(t!=null)for(i in t.key!==void 0&&(s=""+t.key),t)Lf.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(r[i]=t[i]);var c=arguments.length-2;if(c===1)r.children=a;else if(1<c){for(var d=Array(c),h=0;h<c;h++)d[h]=arguments[h+2];r.children=d}if(e&&e.defaultProps)for(i in c=e.defaultProps,c)r[i]===void 0&&(r[i]=c[i]);return ih(e,s,r)};$e.createRef=function(){return{current:null}};$e.forwardRef=function(e){return{$$typeof:Q$,render:e}};$e.isValidElement=rh;$e.lazy=function(e){return{$$typeof:If,_payload:{_status:-1,_result:e},_init:i5}};$e.memo=function(e,t){return{$$typeof:J$,type:e,compare:t===void 0?null:t}};$e.startTransition=qf;$e.unstable_useCacheRefresh=function(){return vt.H.useCacheRefresh()};$e.use=function(e){return vt.H.use(e)};$e.useActionState=function(e,t,a){return vt.H.useActionState(e,t,a)};$e.useCallback=function(e,t){return vt.H.useCallback(e,t)};$e.useContext=function(e){return vt.H.useContext(e)};$e.useDebugValue=function(){};$e.useDeferredValue=function(e,t){return vt.H.useDeferredValue(e,t)};$e.useEffect=function(e,t){return vt.H.useEffect(e,t)};$e.useEffectEvent=function(e){return vt.H.useEffectEvent(e)};$e.useId=function(){return vt.H.useId()};$e.useImperativeHandle=function(e,t,a){return vt.H.useImperativeHandle(e,t,a)};$e.useInsertionEffect=function(e,t){return vt.H.useInsertionEffect(e,t)};$e.useLayoutEffect=function(e,t){return vt.H.useLayoutEffect(e,t)};$e.useMemo=function(e,t){return vt.H.useMemo(e,t)};$e.useOptimistic=function(e,t){return vt.H.useOptimistic(e,t)};$e.useReducer=function(e,t,a){return vt.H.useReducer(e,t,a)};$e.useRef=function(e){return vt.H.useRef(e)};$e.useState=function(e){return vt.H.useState(e)};$e.useSyncExternalStore=function(e,t,a){return vt.H.useSyncExternalStore(e,t,a)};$e.useTransition=function(){return vt.H.useTransition()};$e.version="19.3.0"});var bo=On((z2,Yf)=>{"use strict";Yf.exports=jf()});var Pf=On($c=>{"use strict";var o5=Symbol.for("react.transitional.element"),s5=Symbol.for("react.fragment");function Gf(e,t,a){var i=null;if(a!==void 0&&(i=""+a),t.key!==void 0&&(i=""+t.key),"key"in t){a={};for(var r in t)r!=="key"&&(a[r]=t[r])}else a=t;return t=a.ref,{$$typeof:o5,type:e,key:i,ref:t!==void 0?t:null,props:a}}$c.Fragment=s5;$c.jsx=Gf;$c.jsxs=Gf});var fr=On((O2,Xf)=>{"use strict";Xf.exports=Pf()});var ub=On(kt=>{"use strict";function mh(e,t){var a=e.length;e.push(t);e:for(;0<a;){var i=a-1>>>1,r=e[i];if(0<Sc(r,t))e[i]=t,e[a]=r,a=i;else break e}}function Dn(e){return e.length===0?null:e[0]}function Cc(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var i=0,r=e.length,s=r>>>1;i<s;){var c=2*(i+1)-1,d=e[c],h=c+1,p=e[h];if(0>Sc(d,a))h<r&&0>Sc(p,d)?(e[i]=p,e[h]=a,i=h):(e[i]=d,e[c]=a,i=c);else if(h<r&&0>Sc(p,a))e[i]=p,e[h]=a,i=h;else break e}}return t}function Sc(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}kt.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(ab=performance,kt.unstable_now=function(){return ab.now()}):(dh=Date,nb=dh.now(),kt.unstable_now=function(){return dh.now()-nb});var ab,dh,nb,si=[],Ri=[],h5=1,Ka=null,ha=3,ph=!1,js=!1,Ys=!1,gh=!1,ob=typeof setTimeout=="function"?setTimeout:null,sb=typeof clearTimeout=="function"?clearTimeout:null,ib=typeof setImmediate<"u"?setImmediate:null;function kc(e){for(var t=Dn(Ri);t!==null;){if(t.callback===null)Cc(Ri);else if(t.startTime<=e)Cc(Ri),t.sortIndex=t.expirationTime,mh(si,t);else break;t=Dn(Ri)}}function fh(e){if(Ys=!1,kc(e),!js)if(Dn(si)!==null)js=!0,wo||(wo=!0,yo());else{var t=Dn(Ri);t!==null&&bh(fh,t.startTime-e)}}var wo=!1,Gs=-1,lb=5,cb=-1;function db(){return gh?!0:!(kt.unstable_now()-cb<lb)}function uh(){if(gh=!1,wo){var e=kt.unstable_now();cb=e;var t=!0;try{e:{js=!1,Ys&&(Ys=!1,sb(Gs),Gs=-1),ph=!0;var a=ha;try{t:{for(kc(e),Ka=Dn(si);Ka!==null&&!(Ka.expirationTime>e&&db());){var i=Ka.callback;if(typeof i=="function"){Ka.callback=null,ha=Ka.priorityLevel;var r=i(Ka.expirationTime<=e);if(e=kt.unstable_now(),typeof r=="function"){Ka.callback=r,kc(e),t=!0;break t}Ka===Dn(si)&&Cc(si),kc(e)}else Cc(si);Ka=Dn(si)}if(Ka!==null)t=!0;else{var s=Dn(Ri);s!==null&&bh(fh,s.startTime-e),t=!1}}break e}finally{Ka=null,ha=a,ph=!1}t=void 0}}finally{t?yo():wo=!1}}}var yo;typeof ib=="function"?yo=function(){ib(uh)}:typeof MessageChannel<"u"?(hh=new MessageChannel,rb=hh.port2,hh.port1.onmessage=uh,yo=function(){rb.postMessage(null)}):yo=function(){ob(uh,0)};var hh,rb;function bh(e,t){Gs=ob(function(){e(kt.unstable_now())},t)}kt.unstable_IdlePriority=5;kt.unstable_ImmediatePriority=1;kt.unstable_LowPriority=4;kt.unstable_NormalPriority=3;kt.unstable_Profiling=null;kt.unstable_UserBlockingPriority=2;kt.unstable_cancelCallback=function(e){e.callback=null};kt.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):lb=0<e?Math.floor(1e3/e):5};kt.unstable_getCurrentPriorityLevel=function(){return ha};kt.unstable_next=function(e){switch(ha){case 1:case 2:case 3:var t=3;break;default:t=ha}var a=ha;ha=t;try{return e()}finally{ha=a}};kt.unstable_requestPaint=function(){gh=!0};kt.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=ha;ha=e;try{return t()}finally{ha=a}};kt.unstable_scheduleCallback=function(e,t,a){var i=kt.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?i+a:i):a=i,e){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=a+r,e={id:h5++,callback:t,priorityLevel:e,startTime:a,expirationTime:r,sortIndex:-1},a>i?(e.sortIndex=a,mh(Ri,e),Dn(si)===null&&e===Dn(Ri)&&(Ys?(sb(Gs),Gs=-1):Ys=!0,bh(fh,a-i))):(e.sortIndex=r,mh(si,e),js||ph||(js=!0,wo||(wo=!0,yo()))),e};kt.unstable_shouldYield=db;kt.unstable_wrapCallback=function(e){var t=ha;return function(){var a=ha;ha=t;try{return e.apply(this,arguments)}finally{ha=a}}}});var mb=On((B2,hb)=>{"use strict";hb.exports=ub()});var fb=On(ma=>{"use strict";var m5=bo();function gb(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Mi(){}var xa={d:{f:Mi,r:function(){throw Error(gb(522))},D:Mi,C:Mi,L:Mi,m:Mi,X:Mi,S:Mi,M:Mi},p:0,findDOMNode:null},p5=Symbol.for("react.portal"),g5=Symbol.for("react.recoverable"),pb=Symbol.for("react.optimistic_key");function f5(e,t,a){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:p5,key:i==null?null:i===pb?pb:""+i,children:e,containerInfo:t,implementation:a}}var Ps=m5.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Tc(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}ma.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=xa;ma.browser=function(e){return{$$typeof:g5,_reason:e}};ma.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(gb(299));return f5(e,t,null,a)};ma.flushSync=function(e){var t=Ps.T,a=xa.p;try{if(Ps.T=null,xa.p=2,e)return e()}finally{Ps.T=t,xa.p=a,xa.d.f()}};ma.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,xa.d.C(e,t))};ma.prefetchDNS=function(e){typeof e=="string"&&xa.d.D(e)};ma.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,i=Tc(a,t.crossOrigin),r=typeof t.integrity=="string"?t.integrity:void 0,s=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?xa.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:r,fetchPriority:s}):a==="script"&&xa.d.X(e,{crossOrigin:i,integrity:r,fetchPriority:s,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};ma.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=Tc(t.as,t.crossOrigin);xa.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&xa.d.M(e)};ma.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,i=Tc(a,t.crossOrigin);xa.d.L(e,a,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};ma.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=Tc(t.as,t.crossOrigin);xa.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else xa.d.m(e)};ma.requestFormReset=function(e){xa.d.r(e)};ma.unstable_batchedUpdates=function(e,t){return e(t)};ma.useFormState=function(e,t,a){return Ps.H.useFormState(e,t,a)};ma.useFormStatus=function(){return Ps.H.useHostTransitionStatus()};ma.version="19.3.0"});var yb=On((Y2,vb)=>{"use strict";function bb(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(bb)}catch(e){console.error(e)}}bb(),vb.exports=fb()});var r1=On(lu=>{"use strict";var Xt=mb(),iy=bo(),b5=yb();function U(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ry(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Vl(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function oy(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function sy(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function wb(e){if(Vl(e)!==e)throw Error(U(188))}function v5(e){var t=e.alternate;if(!t){if(t=Vl(e),t===null)throw Error(U(188));return t!==e?null:e}for(var a=e,i=t;;){var r=a.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){a=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===a)return wb(r),e;if(s===i)return wb(r),t;s=s.sibling}throw Error(U(188))}if(a.return!==i.return)a=r,i=s;else{for(var c=!1,d=r.child;d;){if(d===a){c=!0,a=r,i=s;break}if(d===i){c=!0,i=r,a=s;break}d=d.sibling}if(!c){for(d=s.child;d;){if(d===a){c=!0,a=s,i=r;break}if(d===i){c=!0,i=s,a=r;break}d=d.sibling}if(!c)throw Error(U(189))}}if(a.alternate!==i)throw Error(U(190))}if(a.tag!==3)throw Error(U(188));return a.stateNode.current===a?e:t}function ly(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=ly(e),t!==null)return t;e=e.sibling}return null}function Oa(e,t,a,i,r,s){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,i,r,s)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Oa(e.child,t,a,i,r,s))return!0;e=e.sibling}return!1}function Hr(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function xb(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function cy(e){var t=[null,null],a=Hr(e);return a===null||dy(t,e,a.child,{foundSelf:!1}),t}function dy(e,t,a,i){for(;a!==null;){if(a===t)i.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(i.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&dy(e,t,a.child,i))return!0;a=a.sibling}return!1}function Pt(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(U(559))}}var To=null,Qh=null;function y5(e,t,a){return e===a?!0:e===t?(To=e,!0):!1}function w5(e,t,a){return e===a?(Qh=e,!1):e===t?(Qh!==null&&(To=e),!0):!1}function $b(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function Fh(e,t,a){for(var i=0,r=e;r;r=a(r))i++;r=0;for(var s=t;s;s=a(s))r++;for(;0<i-r;)e=a(e),i--;for(;0<r-i;)t=a(t),r--;for(;i--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var gt=Object.assign,x5=Symbol.for("react.element"),Ec=Symbol.for("react.transitional.element"),Ws=Symbol.for("react.portal"),Eo=Symbol.for("react.fragment"),uy=Symbol.for("react.strict_mode"),Jh=Symbol.for("react.profiler"),hy=Symbol.for("react.consumer"),Bn=Symbol.for("react.context"),op=Symbol.for("react.forward_ref"),Kh=Symbol.for("react.suspense"),Wh=Symbol.for("react.suspense_list"),sp=Symbol.for("react.memo"),Ii=Symbol.for("react.lazy"),em=Symbol.for("react.activity"),$5=Symbol.for("react.legacy_hidden"),N5=Symbol.for("react.memo_cache_sentinel"),tm=Symbol.for("react.view_transition"),S5=Symbol.for("react.recoverable"),Nb=Symbol.iterator;function Xs(e){return e===null||typeof e!="object"?null:(e=Nb&&e[Nb]||e["@@iterator"],typeof e=="function"?e:null)}var k5=Symbol.for("react.client.reference");function am(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===k5?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Eo:return"Fragment";case Jh:return"Profiler";case uy:return"StrictMode";case Kh:return"Suspense";case Wh:return"SuspenseList";case em:return"Activity";case tm:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case Ws:return"Portal";case Bn:return e.displayName||"Context";case hy:return(e._context.displayName||"Context")+".Consumer";case op:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case sp:return t=e.displayName||null,t!==null?t:am(e.type)||"Memo";case Ii:t=e._payload,e=e._init;try{return am(e(t))}catch{}}return null}var el=Array.isArray,xe=iy.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,tt=b5.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,kr={pending:!1,data:null,method:null,action:null},nm=[],Ao=-1;function Qn(e){return{current:e}}function ra(e){0>Ao||(e.current=nm[Ao],nm[Ao]=null,Ao--)}function xt(e,t){Ao++,nm[Ao]=e.current,e.current=t}var Pn=Qn(null),bl=Qn(null),Yi=Qn(null),pd=Qn(null);function gd(e,t){switch(xt(Yi,t),xt(bl,e),xt(Pn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?_v(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=_v(t),e=O0(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}ra(Pn),xt(Pn,e)}function Qo(){ra(Pn),ra(bl),ra(Yi)}function im(e){var t=e.memoizedState;t!==null&&(rs._currentValue=t.memoizedState,xt(pd,e)),t=Pn.current;var a=O0(t,e.type);t!==a&&(xt(bl,e),xt(Pn,a))}function fd(e){bl.current===e&&(ra(Pn),ra(bl)),pd.current===e&&(ra(pd),rs._currentValue=kr)}var vh,Sb;function Vi(e){if(vh===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);vh=t&&t[1]||"",Sb=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+vh+e+Sb}var yh=!1;function wh(e,t){if(!e||yh)return"";yh=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var $=function(){throw Error()};if(Object.defineProperty($.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct($,[])}catch(V){var f=V}Reflect.construct(e,[],$)}else{try{$.call()}catch(V){f=V}$=!1;try{var y=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),$=!0,new e}finally{$&&(y!==void 0?Object.defineProperty(e.prototype,"props",y):delete e.prototype.props)}}}else{try{throw Error()}catch(V){f=V}($=e())&&typeof $.catch=="function"&&$.catch(function(){})}}catch(V){if(V&&f&&typeof V.stack=="string")return[V.stack,f.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=i.DetermineComponentFrameRoot(),c=s[0],d=s[1];if(c&&d){var h=c.split(`
`),p=d.split(`
`);for(r=i=0;i<h.length&&!h[i].includes("DetermineComponentFrameRoot");)i++;for(;r<p.length&&!p[r].includes("DetermineComponentFrameRoot");)r++;if(i===h.length||r===p.length)for(i=h.length-1,r=p.length-1;1<=i&&0<=r&&h[i]!==p[r];)r--;for(;1<=i&&0<=r;i--,r--)if(h[i]!==p[r]){if(i!==1||r!==1)do if(i--,r--,0>r||h[i]!==p[r]){var b=`
`+h[i].replace(" at new "," at ");return e.displayName&&b.includes("<anonymous>")&&(b=b.replace("<anonymous>",e.displayName)),b}while(1<=i&&0<=r);break}}}finally{yh=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Vi(a):""}function C5(e,t){switch(e.tag){case 26:case 27:case 5:return Vi(e.type);case 16:return Vi("Lazy");case 13:return e.child!==t&&t!==null?Vi("Suspense Fallback"):Vi("Suspense");case 19:return Vi("SuspenseList");case 0:case 15:return wh(e.type,!1);case 11:return wh(e.type.render,!1);case 1:return wh(e.type,!0);case 31:return Vi("Activity");case 30:return Vi("ViewTransition");default:return""}}function kb(e){try{var t="",a=null;do t+=C5(e,a),a=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var rm=Object.prototype.hasOwnProperty,lp=Xt.unstable_scheduleCallback,xh=Xt.unstable_cancelCallback,T5=Xt.unstable_shouldYield,E5=Xt.unstable_requestPaint,ja=Xt.unstable_now,A5=Xt.unstable_getCurrentPriorityLevel,my=Xt.unstable_ImmediatePriority,py=Xt.unstable_UserBlockingPriority,bd=Xt.unstable_NormalPriority,R5=Xt.unstable_LowPriority,gy=Xt.unstable_IdlePriority,M5=Xt.log,z5=Xt.unstable_setDisableYieldValue,Ol=null,Ya=null;function Hi(e){if(typeof M5=="function"&&z5(e),Ya&&typeof Ya.setStrictMode=="function")try{Ya.setStrictMode(Ol,e)}catch{}}var Ga=Math.clz32?Math.clz32:I5,V5=Math.log,O5=Math.LN2;function I5(e){return e>>>=0,e===0?32:31-(V5(e)/O5|0)|0}var Ac=256,Rc=262144,Mc=4194304;function wr(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function jd(e,t,a){var i=e.pendingLanes;if(i===0)return 0;var r=0,s=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var d=i&134217727;return d!==0?(i=d&~s,i!==0?r=wr(i):(c&=d,c!==0?r=wr(c):a||(a=d&~e,a!==0&&(r=wr(a))))):(d=i&~s,d!==0?r=wr(d):c!==0?r=wr(c):a||(a=i&~e,a!==0&&(r=wr(a)))),r===0?0:t!==0&&t!==r&&(t&s)===0&&(s=r&-r,a=t&-t,s>=a||s===32&&(a&4194048)!==0)?t:r}function Il(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function fy(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var i=31-Ga(a),r=1<<i;t|=e[i],a&=~r}return t}function D5(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function by(){var e=Mc;return Mc<<=1,(Mc&62914560)===0&&(Mc=4194304),e}function $h(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Dl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function _5(e,t,a,i,r,s){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var d=e.entanglements,h=e.expirationTimes,p=e.hiddenUpdates;for(a=c&~a;0<a;){var b=31-Ga(a),$=1<<b;d[b]=0,h[b]=-1;var f=p[b];if(f!==null)for(p[b]=null,b=0;b<f.length;b++){var y=f[b];y!==null&&(y.lane&=-536870913)}a&=~$}i!==0&&vy(e,i,0),s!==0&&r===0&&e.tag!==0&&(e.suspendedLanes|=s&~(c&~t))}function vy(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-Ga(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|a&261930}function yy(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var i=31-Ga(a),r=1<<i;r&t|e[i]&t&&(e[i]|=t),a&=~r}}function wy(e,t){var a=t&-t;return a=(a&42)!==0?1:cp(a),(a&(e.suspendedLanes|t))!==0?0:a}function cp(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function dp(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function xy(){var e=tt.p;return e!==0?e:(e=window.event,e===void 0?32:a1(e.type))}function Cb(e,t){var a=tt.p;try{return tt.p=e,t()}finally{tt.p=a}}var wi=Math.random().toString(36).slice(2),na="__reactFiber$"+wi,Ia="__reactProps$"+wi,ls="__reactContainer$"+wi,Tb="__reactEvents$"+wi,H5="__reactListeners$"+wi,U5="__reactHandles$"+wi,Eb="__reactResources$"+wi,_l="__reactMarker$"+wi,vd="__reactLoad$"+wi;function Yd(e){delete e[na],delete e[Ia],delete e[H5],delete e[U5]}function Nr(e){var t;if(t=e[na])return t;for(var a=e.parentNode;a;){if(t=a[ls]||a[na]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=Gv(e);e!==null;){if(a=e[na])return a;e=Gv(e)}return t}e=a,a=e.parentNode}return null}function cs(e){if(e=e[na]||e[ls]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function tl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(U(33))}function Uo(e){var t=e[Eb];return t||(t=e[Eb]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function Kt(e){e[_l]=!0}function $y(e){e[vd]=void 0}var Ny=new Set,Sy={};function Ur(e,t){Fo(e,t),Fo(e+"Capture",t)}function Fo(e,t){for(Sy[e]=t,e=0;e<t.length;e++)Ny.add(t[e])}var L5=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Ab={},Rb={};function q5(e){return rm.call(Rb,e)?!0:rm.call(Ab,e)?!1:L5.test(e)?Rb[e]=!0:(Ab[e]=!0,!1)}var We=!1;function Mb(){var e=We;return We=!1,e}function Qc(e,t,a){if(q5(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function zc(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function li(e,t,a,i){if(i===null)e.removeAttribute(a);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,i)}}function Ua(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function ky(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function B5(e,t,a){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var r=i.get,s=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return r.call(this)},set:function(c){a=""+c,s.call(this,c)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function om(e){if(!e._valueTracker){var t=ky(e)?"checked":"value";e._valueTracker=B5(e,t,""+e[t])}}function Cy(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),i="";return e&&(i=ky(e)?e.checked?"true":"false":e.value),e=i,e!==a?(t.setValue(e),!0):!1}var j5=/[\n"\\]/g;function nn(e){return e.replace(j5,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function sm(e,t,a,i,r,s,c,d){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Ua(t)):e.value!==""+Ua(t)&&(e.value=""+Ua(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?Nh(e,Ua(e.value)):Nh(e,Ua(t)):a!=null?Nh(e,Ua(a)):i!=null&&e.removeAttribute("value"),r==null&&s!=null&&(e.defaultChecked=!!s),r!=null&&(e.checked=r&&typeof r!="function"&&typeof r!="symbol"),d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"?e.name=""+Ua(d):e.removeAttribute("name")}function Ty(e,t,a,i,r,s,c,d){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.type=s),t!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||t!=null)){om(e);return}a=a!=null?""+Ua(a):"",t=t!=null?""+Ua(t):a,d||t===e.value||(e.value=t),e.defaultValue=t}i=i??r,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=d?e.checked:!!i,e.defaultChecked=!!i,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),om(e)}function Nh(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function Lo(e,t,a,i){if(e=e.options,t){t={};for(var r=0;r<a.length;r++)t["$"+a[r]]=!0;for(a=0;a<e.length;a++)r=t.hasOwnProperty("$"+e[a].value),e[a].selected!==r&&(e[a].selected=r),r&&i&&(e[a].defaultSelected=!0)}else{for(a=""+Ua(a),t=null,r=0;r<e.length;r++){if(e[r].value===a){e[r].selected=!0,i&&(e[r].defaultSelected=!0);return}t!==null||e[r].disabled||(t=e[r])}t!==null&&(t.selected=!0)}}function Ey(e,t,a){if(t!=null&&(t=""+Ua(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+Ua(a):""}function Ay(e,t,a,i){if(t==null){if(i!=null){if(a!=null)throw Error(U(92));if(el(i)){if(1<i.length)throw Error(U(93));i=i[0]}a=i}a==null&&(a=""),t=a}a=Ua(t),e.defaultValue=a,i=e.textContent,i===a&&i!==""&&i!==null&&(e.value=i),om(e)}function Jo(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var Y5=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function zb(e,t,a){var i=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,a):typeof a!="number"||a===0||Y5.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Ry(e,t,a){if(t!=null&&typeof t!="object")throw Error(U(62));if(e=e.style,a!=null){for(var i in a)!a.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="",We=!0);for(var r in t)i=t[r],t.hasOwnProperty(r)&&a[r]!==i&&(zb(e,r,i),We=!0)}else for(var s in t)t.hasOwnProperty(s)&&zb(e,s,t[s])}function up(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var G5=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),P5=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Fc(e){return P5.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function jn(){}var lm=null;function hp(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Ro=null,qo=null;function Vb(e){var t=cs(e);if(t&&(e=t.stateNode)){var a=e[Ia]||null;e:switch(e=t.stateNode,t.type){case"input":if(sm(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+nn(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var i=a[t];if(i!==e&&i.form===e.form){var r=i[Ia]||null;if(!r)throw Error(U(90));sm(i,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(t=0;t<a.length;t++)i=a[t],i.form===e.form&&Cy(i)}break e;case"textarea":Ey(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&Lo(e,!!a.multiple,t,!1)}}}var Sh=!1;function My(e,t,a){if(Sh)return e(t,a);Sh=!0;try{var i=e(t);return i}finally{if(Sh=!1,(Ro!==null||qo!==null)&&(iu(),Ro&&(t=Ro,e=qo,qo=Ro=null,Vb(t),e)))for(t=0;t<e.length;t++)Vb(e[t])}}function vl(e,t){var a=e.stateNode;if(a===null)return null;var i=a[Ia]||null;if(i===null)return null;a=i[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(U(231,t,typeof a));return a}var pi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),cm=!1;if(pi)try{xo={},Object.defineProperty(xo,"passive",{get:function(){cm=!0}}),window.addEventListener("test",xo,xo),window.removeEventListener("test",xo,xo)}catch{cm=!1}var xo,Ui=null,mp=null,Jc=null;function zy(){if(Jc)return Jc;var e,t=mp,a=t.length,i,r="value"in Ui?Ui.value:Ui.textContent,s=r.length;for(e=0;e<a&&t[e]===r[e];e++);var c=a-e;for(i=1;i<=c&&t[a-i]===r[s-i];i++);return Jc=r.slice(e,1<i?1-i:void 0)}function Kc(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Vc(){return!0}function Ob(){return!1}function ka(e){function t(a,i,r,s,c){this._reactName=a,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=c,this.currentTarget=null;for(var d in e)e.hasOwnProperty(d)&&(a=e[d],this[d]=a?a(s):s[d]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Vc:Ob,this.isPropagationStopped=Ob,this}return gt(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Vc)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Vc)},persist:function(){},isPersistent:Vc}),t}var rr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Gd=ka(rr),Hl=gt({},rr,{view:0,detail:0}),X5=ka(Hl),kh,Ch,Zs,Pd=gt({},Hl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:pp,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Zs&&(Zs&&e.type==="mousemove"?(kh=e.screenX-Zs.screenX,Ch=e.screenY-Zs.screenY):Ch=kh=0,Zs=e),kh)},movementY:function(e){return"movementY"in e?e.movementY:Ch}}),Ib=ka(Pd),Z5=gt({},Pd,{dataTransfer:0}),Q5=ka(Z5),F5=gt({},Hl,{relatedTarget:0}),Th=ka(F5),J5=gt({},rr,{animationName:0,elapsedTime:0,pseudoElement:0}),K5=ka(J5),W5=gt({},rr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),eN=ka(W5),tN=gt({},rr,{data:0}),Db=ka(tN),aN={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},nN={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},iN={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function rN(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=iN[e])?!!t[e]:!1}function pp(){return rN}var oN=gt({},Hl,{key:function(e){if(e.key){var t=aN[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Kc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?nN[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:pp,charCode:function(e){return e.type==="keypress"?Kc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Kc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),sN=ka(oN),lN=gt({},Pd,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),_b=ka(lN),cN=gt({},rr,{submitter:0}),dN=ka(cN),uN=gt({},Hl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:pp}),hN=ka(uN),mN=gt({},rr,{propertyName:0,elapsedTime:0,pseudoElement:0}),pN=ka(mN),gN=gt({},Pd,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),fN=ka(gN),bN=gt({},rr,{newState:0,oldState:0,source:0}),vN=ka(bN),yN=[9,13,27,32],gp=pi&&"CompositionEvent"in window,il=null;pi&&"documentMode"in document&&(il=document.documentMode);var wN=pi&&"TextEvent"in window&&!il,Vy=pi&&(!gp||il&&8<il&&11>=il),Hb=" ",Ub=!1;function Oy(e,t){switch(e){case"keyup":return yN.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Iy(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Mo=!1;function xN(e,t){switch(e){case"compositionend":return Iy(t);case"keypress":return t.which!==32?null:(Ub=!0,Hb);case"textInput":return e=t.data,e===Hb&&Ub?null:e;default:return null}}function $N(e,t){if(Mo)return e==="compositionend"||!gp&&Oy(e,t)?(e=zy(),Jc=mp=Ui=null,Mo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Vy&&t.locale!=="ko"?null:t.data;default:return null}}var NN={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Lb(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!NN[e.type]:t==="textarea"}function Dy(e,t,a,i){Ro?qo?qo.push(i):qo=[i]:Ro=i,t=Ld(t,"onChange"),0<t.length&&(a=new Gd("onChange","change",null,a,i),e.push({event:a,listeners:t}))}var rl=null,yl=null;function SN(e){M0(e,0)}function Xd(e){var t=tl(e);if(Cy(t))return e}function qb(e,t){if(e==="change")return t}var _y=!1;pi&&(pi?(Ic="oninput"in document,Ic||(Eh=document.createElement("div"),Eh.setAttribute("oninput","return;"),Ic=typeof Eh.oninput=="function"),Oc=Ic):Oc=!1,_y=Oc&&(!document.documentMode||9<document.documentMode));var Oc,Ic,Eh;function Bb(){rl&&(rl.detachEvent("onpropertychange",Hy),yl=rl=null)}function Hy(e){if(e.propertyName==="value"&&Xd(yl)){var t=[];Dy(t,yl,e,hp(e)),My(SN,t)}}function kN(e,t,a){e==="focusin"?(Bb(),rl=t,yl=a,rl.attachEvent("onpropertychange",Hy)):e==="focusout"&&Bb()}function CN(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Xd(yl)}function TN(e,t){if(e==="click")return Xd(t)}function EN(e,t){if(e==="input"||e==="change")return Xd(t)}function AN(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Xa=typeof Object.is=="function"?Object.is:AN;function wl(e,t){if(Xa(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),i=Object.keys(t);if(a.length!==i.length)return!1;for(i=0;i<a.length;i++){var r=a[i];if(!rm.call(t,r)||!Xa(e[r],t[r]))return!1}return!0}function dm(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function jb(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Yb(e,t){var a=jb(e);e=0;for(var i;a;){if(a.nodeType===3){if(i=e+a.textContent.length,e<=t&&i>=t)return{node:a,offset:t-e};e=i}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=jb(a)}}function Uy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Uy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Ly(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=dm(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=dm(e.document)}return t}function fp(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var RN=pi&&"documentMode"in document&&11>=document.documentMode,zo=null,um=null,ol=null,hm=!1;function Gb(e,t,a){var i=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;hm||zo==null||zo!==dm(i)||(i=zo,"selectionStart"in i&&fp(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),ol&&wl(ol,i)||(ol=i,i=Ld(um,"onSelect"),0<i.length&&(t=new Gd("onSelect","select",null,t,a),e.push({event:t,listeners:i}),t.target=zo)))}function vr(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Vo={animationend:vr("Animation","AnimationEnd"),animationiteration:vr("Animation","AnimationIteration"),animationstart:vr("Animation","AnimationStart"),transitionrun:vr("Transition","TransitionRun"),transitionstart:vr("Transition","TransitionStart"),transitioncancel:vr("Transition","TransitionCancel"),transitionend:vr("Transition","TransitionEnd")},Ah={},qy={};pi&&(qy=document.createElement("div").style,"AnimationEvent"in window||(delete Vo.animationend.animation,delete Vo.animationiteration.animation,delete Vo.animationstart.animation),"TransitionEvent"in window||delete Vo.transitionend.transition);function Lr(e){if(Ah[e])return Ah[e];if(!Vo[e])return e;var t=Vo[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in qy)return Ah[e]=t[a];return e}var By=Lr("animationend"),jy=Lr("animationiteration"),Yy=Lr("animationstart"),MN=Lr("transitionrun"),zN=Lr("transitionstart"),VN=Lr("transitioncancel"),Gy=Lr("transitionend"),Py=new Map,mm="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");mm.push("scrollEnd");function $n(e,t){Py.set(e,t),Ur(t,[e])}var ON=0;function gi(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=xn.identifierPrefix;var a=ON++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function Pb(e){if(e==null||typeof e=="string")return e;var t=null,a=Zo;if(a!==null)for(var i=0;i<a.length;i++){var r=e[a[i]];if(r!=null){if(r==="none")return"none";t=t==null?r:t+(" "+r)}}return t??e.default}function xi(e,t){return e=Pb(e),t=Pb(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var yd=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},en=[],Oo=0,bp=0;function Zd(){for(var e=Oo,t=bp=Oo=0;t<e;){var a=en[t];en[t++]=null;var i=en[t];en[t++]=null;var r=en[t];en[t++]=null;var s=en[t];if(en[t++]=null,i!==null&&r!==null){var c=i.pending;c===null?r.next=r:(r.next=c.next,c.next=r),i.pending=r}s!==0&&Xy(a,r,s)}}function Qd(e,t,a,i){en[Oo++]=e,en[Oo++]=t,en[Oo++]=a,en[Oo++]=i,bp|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function vp(e,t,a,i){return Qd(e,t,a,i),wd(e)}function qr(e,t){return Qd(e,null,null,t),wd(e)}function Xy(e,t,a){e.lanes|=a;var i=e.alternate;i!==null&&(i.lanes|=a);for(var r=!1,s=e.return;s!==null;)s.childLanes|=a,i=s.alternate,i!==null&&(i.childLanes|=a),s.tag===22&&(e=s.stateNode,e===null||e._visibility&1||(r=!0)),e=s,s=s.return;return e.tag===3?(s=e.stateNode,r&&t!==null&&(r=31-Ga(a),e=s.hiddenUpdates,i=e[r],i===null?e[r]=[t]:i.push(t),t.lane=a|536870912),s):null}function wd(e){if(50<fl)throw fl=0,ld=null,Error(U(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Io={};function IN(e,t,a,i){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function za(e,t,a,i){return new IN(e,t,a,i)}function yp(e){return e=e.prototype,!(!e||!e.isReactComponent)}function hi(e,t){var a=e.alternate;return a===null?(a=za(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Zy(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Wc(e,t,a,i,r,s){var c=0;if(i=e,typeof i=="function")yp(i)&&(c=1);else if(typeof i=="string")c=sk(e,a,Pn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(i){case em:return e=za(31,a,t,r),e.elementType=em,e.lanes=s,e;case Eo:return Cr(a.children,r,s,t);case uy:c=8,r|=24;break;case Jh:return e=za(12,a,t,r|2),e.elementType=Jh,e.lanes=s,e;case Kh:return e=za(13,a,t,r),e.elementType=Kh,e.lanes=s,e;case Wh:return e=za(19,a,t,r),e.elementType=Wh,e.lanes=s,e;case $5:case tm:return e=r|32,e=za(30,a,t,e),e.elementType=tm,e.lanes=s,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof i=="object"&&i!==null)switch(i.$$typeof){case Bn:c=10;break e;case hy:c=9;break e;case op:c=11;break e;case sp:c=14;break e;case Ii:c=16,i=null;break e}c=29,a=Error(U(130,e===null?"null":typeof e,"")),i=null}return t=za(c,a,t,r),t.elementType=e,t.type=i,t.lanes=s,t}function Cr(e,t,a,i){return e=za(7,e,i,t),e.lanes=a,e}function Rh(e,t,a){return e=za(6,e,null,t),e.lanes=a,e}function Qy(e){var t=za(18,null,null,0);return t.stateNode=e,t}function Mh(e,t,a){return t=za(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Xb=new WeakMap;function rn(e,t){if(typeof e=="object"&&e!==null){var a=Xb.get(e);return a!==void 0?a:(t={value:e,source:t,stack:kb(t)},Xb.set(e,t),t)}return{value:e,source:t,stack:kb(t)}}var Do=[],_o=0,xd=null,xl=0,tn=[],an=0,er=null,Yn=1,Gn="";function di(e,t){Do[_o++]=xl,Do[_o++]=xd,xd=e,xl=t}function Fy(e,t,a){tn[an++]=Yn,tn[an++]=Gn,tn[an++]=er,er=e;var i=Yn;e=Gn;var r=32-Ga(i)-1;i&=~(1<<r),a+=1;var s=32-Ga(t)+r;if(30<s){var c=r-r%5;s=(i&(1<<c)-1).toString(32),i>>=c,r-=c,Yn=1<<32-Ga(t)+r|a<<r|i,Gn=s+e}else Yn=1<<s|a<<r|i,Gn=e}function Fd(e){e.return!==null&&(di(e,1),Fy(e,1,0))}function wp(e){for(;e===xd;)xd=Do[--_o],Do[_o]=null,xl=Do[--_o],Do[_o]=null;for(;e===er;)er=tn[--an],tn[an]=null,Gn=tn[--an],tn[an]=null,Yn=tn[--an],tn[an]=null}function Jy(e,t){tn[an++]=Yn,tn[an++]=Gn,tn[an++]=er,Yn=t.id,Gn=t.overflow,er=e}var Wt=null,wt=null,ze=!1,Gi=null,on=!1,pm=Error(U(519));function tr(e){var t=Error(U(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw $l(rn(t,e)),pm}function Zb(e){var t=e.stateNode,a=e.type,i=e.memoizedProps;switch(t[na]=e,t[Ia]=i,a){case"dialog":Ie("cancel",t),Ie("close",t);break;case"iframe":case"object":case"embed":Ie("load",t);break;case"video":case"audio":for(a=0;a<Cl.length;a++)Ie(Cl[a],t);break;case"source":Ie("error",t);break;case"img":case"image":case"link":Ie("error",t),Ie("load",t);break;case"details":Ie("toggle",t);break;case"input":Ie("invalid",t),Ty(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":Ie("invalid",t);break;case"textarea":Ie("invalid",t),Ay(t,i.value,i.defaultValue,i.children)}a=i.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||i.suppressHydrationWarning===!0||V0(t.textContent,a)?(i.popover!=null&&(Ie("beforetoggle",t),Ie("toggle",t)),i.onScroll!=null&&Ie("scroll",t),i.onScrollEnd!=null&&Ie("scrollend",t),i.onClick!=null&&(t.onclick=jn),t=!0):t=!1,t||tr(e,!0)}function $d(e){for(Wt=e.return;Wt;)switch(Wt.tag){case 5:case 31:case 13:on=!1;return;case 27:case 3:on=!0;return;default:Wt=Wt.return}}function $o(e){if(e!==Wt)return!1;if(!ze)return $d(e),ze=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Km(e.type,e.memoizedProps)),a=!a),a&&wt&&tr(e),$d(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(U(317));wt=Yv(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(U(317));wt=Yv(e)}else t===27?(t=wt,or(e.type)?(e=ap,ap=null,wt=e):wt=t):wt=Wt?sn(e.stateNode.nextSibling):null;return!0}function Rr(){wt=Wt=null,ze=!1}function zh(){var e=Gi;return e!==null&&(Ra===null?Ra=e:Ra.push.apply(Ra,e),Gi=null),e}function $l(e){Gi===null?Gi=[e]:Gi.push(e)}var gm=Qn(null),Br=null,ui=null;function Li(e,t,a){xt(gm,t._currentValue),t._currentValue=a}function mi(e){e._currentValue=gm.current,ra(gm)}function ed(e,t,a){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===a)break;e=e.return}}function fm(e,t,a,i){var r=e.child;for(r!==null&&(r.return=e);r!==null;){var s=r.dependencies;if(s!==null){var c=r.child;s=s.firstContext;e:for(;s!==null;){var d=s;s=r;for(var h=0;h<t.length;h++)if(d.context===t[h]){s.lanes|=a,d=s.alternate,d!==null&&(d.lanes|=a),ed(s.return,a,e),i||(c=null);break e}s=d.next}}else if(r.tag===18){if(c=r.return,c===null)throw Error(U(341));c.lanes|=a,s=c.alternate,s!==null&&(s.lanes|=a),ed(c,a,e),c=null}else r.tag===13&&r.memoizedState!==null&&r.memoizedState.dehydrated===null?(r.lanes|=a,c=r.alternate,c!==null&&(c.lanes|=a),ed(r.return,a,e),c=r.child,c=c!==null?c.sibling:null):c=r.child;if(c!==null)c.return=r;else for(c=r;c!==null;){if(c===e){c=null;break}if(r=c.sibling,r!==null){r.return=c.return,c=r;break}c=c.return}r=c}}function Mr(e,t,a,i){e=null;for(var r=t,s=!1;r!==null;){if(!s){if((r.flags&524288)!==0)s=!0;else if((r.flags&262144)!==0)break}if(r.tag===10){var c=r.alternate;if(c===null)throw Error(U(387));if(c=c.memoizedProps,c!==null){var d=r.type;Xa(r.pendingProps.value,c.value)||(e!==null?e.push(d):e=[d])}}else if(r===pd.current){if(c=r.alternate,c===null)throw Error(U(387));c.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(e!==null?e.push(rs):e=[rs])}r=r.return}return e!==null&&fm(t,e,a,i),t.flags|=262144,e!==null}function Nd(e){for(e=e.firstContext;e!==null;){if(!Xa(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function zr(e){Br=e,ui=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function ia(e){return Ky(Br,e)}function Dc(e,t){return Br===null&&zr(e),Ky(e,t)}function Ky(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},ui===null){if(e===null)throw Error(U(308));ui=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else ui=ui.next=t;return a}var DN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},_N=Xt.unstable_scheduleCallback,HN=Xt.unstable_NormalPriority,jt={$$typeof:Bn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function xp(){return{controller:new DN,data:new Map,refCount:0}}function Ul(e){e.refCount--,e.refCount===0&&_N(HN,function(){e.controller.abort()})}function Qb(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var i=t[e];a.indexOf(i)===-1&&a.push(i)}}}var al=null;function UN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var sl=null,bm=0,Vr=0,Bo=null;function LN(e,t){if(sl===null){var a=sl=[];bm=0,Vr=Qp(),Bo={status:"pending",value:void 0,then:function(i){a.push(i)}}}return bm++,t.then(Fb,Fb),t}function Fb(){if(--bm===0&&(al=null,sl!==null)){Bo!==null&&(Bo.status="fulfilled");var e=sl;sl=null,Vr=0,Bo=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function qN(e,t){var a=[],i={status:"pending",value:null,reason:null,then:function(r){a.push(r)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var r=0;r<a.length;r++)(0,a[r])(t)},function(r){for(i.status="rejected",i.reason=r,r=0;r<a.length;r++)(0,a[r])(void 0)}),i}var Jb=xe.S;xe.S=function(e,t){if(f0=ja(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&LN(e,t),al!==null)for(var a=as;a!==null;)Qb(a,al),a=a.next;if(a=e.types,a!==null){for(var i=as;i!==null;)Qb(i,a),i=i.next;if(Vr!==0){i=al,i===null&&(i=al=[]);for(var r=0;r<a.length;r++){var s=a[r];i.indexOf(s)===-1&&i.push(s)}}}Jb!==null&&Jb(e,t)};var Tr=Qn(null);function $p(){var e=Tr.current;return e!==null?e:pt.pooledCache}function td(e,t){t===null?xt(Tr,Tr.current):xt(Tr,t.pool)}function Wy(){var e=$p();return e===null?null:{parent:jt._currentValue,pool:e}}var ds=Error(U(460)),Np=Error(U(474)),Jd=Error(U(542)),Sd={then:function(){}};function Kb(e){return e=e.status,e==="fulfilled"||e==="rejected"}function ew(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(jn,jn),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,ev(e),e===void 0&&!("reason"in t)?Error(U(600)):e;default:if(typeof t.status=="string")t.then(jn,jn);else{if(e=pt,e!==null&&100<e.shellSuspendCounter)throw Error(U(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var r=t;r.status="fulfilled",r.value=i}},function(i){if(t.status==="pending"){var r=t;r.status="rejected",r.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,ev(e),e}throw Er=t,ds}}function xr(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Er=a,ds):a}}var Er=null;function Wb(){if(Er===null)throw Error(U(459));var e=Er;return Er=null,e}function ev(e){if(e===ds||e===Jd)throw Error(U(483))}var jo=null,Nl=0;function _c(e){var t=Nl;return Nl+=1,jo===null&&(jo=[]),ew(jo,e,t)}function zi(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Hc(e,t){throw t.$$typeof===x5?Error(U(525)):(e=Object.prototype.toString.call(t),Error(U(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function tw(e){function t(N,v){if(e){var w=N.deletions;w===null?(N.deletions=[v],N.flags|=16):w.push(v)}}function a(N,v){if(!e)return null;for(;v!==null;)t(N,v),v=v.sibling;return null}function i(N){for(var v=new Map;N!==null;)N.key===null?v.set(N.index,N):v.set(N.key,N),N=N.sibling;return v}function r(N,v){return N=hi(N,v),N.index=0,N.sibling=null,N}function s(N,v,w){return N.index=w,e?(w=N.alternate,w!==null?(w=w.index,w<v?(N.flags|=2,v):w):(N.flags|=134217730,v)):(N.flags|=1048576,v)}function c(N){return e&&N.alternate===null&&(N.flags|=134217730),N}function d(N,v,w,A){return v===null||v.tag!==6?(v=Rh(w,N.mode,A),v.return=N,v):(v=r(v,w),v.return=N,v)}function h(N,v,w,A){var H=w.type;return H===Eo?(N=b(N,v,w.props.children,A,w.key),zi(N,w),N):v!==null&&(v.elementType===H||typeof H=="object"&&H!==null&&H.$$typeof===Ii&&xr(H)===v.type)?(v=r(v,w.props),zi(v,w),v.return=N,v):(v=Wc(w.type,w.key,w.props,null,N.mode,A),zi(v,w),v.return=N,v)}function p(N,v,w,A){return v===null||v.tag!==4||v.stateNode.containerInfo!==w.containerInfo||v.stateNode.implementation!==w.implementation?(v=Mh(w,N.mode,A),v.return=N,v):(v=r(v,w.children||[]),v.return=N,v)}function b(N,v,w,A,H){return v===null||v.tag!==7?(v=Cr(w,N.mode,A,H),v.return=N,v):(v=r(v,w),v.return=N,v)}function $(N,v,w){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return v=Rh(""+v,N.mode,w),v.return=N,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Ec:return w=Wc(v.type,v.key,v.props,null,N.mode,w),zi(w,v),w.return=N,w;case Ws:return v=Mh(v,N.mode,w),v.return=N,v;case Ii:return v=xr(v),$(N,v,w)}if(el(v)||Xs(v))return v=Cr(v,N.mode,w,null),v.return=N,v;if(typeof v.then=="function")return $(N,_c(v),w);if(v.$$typeof===Bn)return $(N,Dc(N,v),w);Hc(N,v)}return null}function f(N,v,w,A){var H=v!==null?v.key:null;if(typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint")return H!==null?null:d(N,v,""+w,A);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Ec:return w.key===H?h(N,v,w,A):null;case Ws:return w.key===H?p(N,v,w,A):null;case Ii:return w=xr(w),f(N,v,w,A)}if(el(w)||Xs(w))return H!==null?null:b(N,v,w,A,null);if(typeof w.then=="function")return f(N,v,_c(w),A);if(w.$$typeof===Bn)return f(N,v,Dc(N,w),A);Hc(N,w)}return null}function y(N,v,w,A,H){if(typeof A=="string"&&A!==""||typeof A=="number"||typeof A=="bigint")return N=N.get(w)||null,d(v,N,""+A,H);if(typeof A=="object"&&A!==null){switch(A.$$typeof){case Ec:return N=N.get(A.key===null?w:A.key)||null,h(v,N,A,H);case Ws:return N=N.get(A.key===null?w:A.key)||null,p(v,N,A,H);case Ii:return A=xr(A),y(N,v,w,A,H)}if(el(A)||Xs(A))return N=N.get(w)||null,b(v,N,A,H,null);if(typeof A.then=="function")return y(N,v,w,_c(A),H);if(A.$$typeof===Bn)return y(N,v,w,Dc(v,A),H);Hc(v,A)}return null}function V(N,v,w,A){for(var H=null,Y=null,F=v,te=v=0,Te=null;F!==null&&te<w.length;te++){F.index>te?(Te=F,F=null):Te=F.sibling;var B=f(N,F,w[te],A);if(B===null){F===null&&(F=Te);break}e&&F&&B.alternate===null&&t(N,F),v=s(B,v,te),Y===null?H=B:Y.sibling=B,Y=B,F=Te}if(te===w.length)return a(N,F),ze&&di(N,te),H;if(F===null){for(;te<w.length;te++)F=$(N,w[te],A),F!==null&&(v=s(F,v,te),Y===null?H=F:Y.sibling=F,Y=F);return ze&&di(N,te),H}for(F=i(F);te<w.length;te++)Te=y(F,N,te,w[te],A),Te!==null&&(e&&(B=Te.alternate,B!==null&&F.delete(B.key===null?te:B.key)),v=s(Te,v,te),Y===null?H=Te:Y.sibling=Te,Y=Te);return e&&F.forEach(function(re){return t(N,re)}),ze&&di(N,te),H}function z(N,v,w,A){if(w==null)throw Error(U(151));for(var H=null,Y=null,F=v,te=v=0,Te=null,B=w.next();F!==null&&!B.done;te++,B=w.next()){F.index>te?(Te=F,F=null):Te=F.sibling;var re=f(N,F,B.value,A);if(re===null){F===null&&(F=Te);break}e&&F&&re.alternate===null&&t(N,F),v=s(re,v,te),Y===null?H=re:Y.sibling=re,Y=re,F=Te}if(B.done)return a(N,F),ze&&di(N,te),H;if(F===null){for(;!B.done;te++,B=w.next())B=$(N,B.value,A),B!==null&&(v=s(B,v,te),Y===null?H=B:Y.sibling=B,Y=B);return ze&&di(N,te),H}for(F=i(F);!B.done;te++,B=w.next())B=y(F,N,te,B.value,A),B!==null&&(e&&(Te=B.alternate,Te!==null&&F.delete(Te.key===null?te:Te.key)),v=s(B,v,te),Y===null?H=B:Y.sibling=B,Y=B);return e&&F.forEach(function(me){return t(N,me)}),ze&&di(N,te),H}function O(N,v,w,A){if(typeof w=="object"&&w!==null&&w.type===Eo&&w.key===null&&w.props.ref===void 0&&(w=w.props.children),typeof w=="object"&&w!==null){switch(w.$$typeof){case Ec:e:{for(var H=w.key;v!==null;){if(v.key===H){if(H=w.type,H===Eo){if(v.tag===7){a(N,v.sibling),A=r(v,w.props.children),zi(A,w),A.return=N,N=A;break e}}else if(v.elementType===H||typeof H=="object"&&H!==null&&H.$$typeof===Ii&&xr(H)===v.type){a(N,v.sibling),A=r(v,w.props),zi(A,w),A.return=N,N=A;break e}a(N,v);break}else t(N,v);v=v.sibling}w.type===Eo?(A=Cr(w.props.children,N.mode,A,w.key),zi(A,w),A.return=N,N=A):(A=Wc(w.type,w.key,w.props,null,N.mode,A),zi(A,w),A.return=N,N=A)}return c(N);case Ws:e:{for(H=w.key;v!==null;){if(v.key===H)if(v.tag===4&&v.stateNode.containerInfo===w.containerInfo&&v.stateNode.implementation===w.implementation){a(N,v.sibling),A=r(v,w.children||[]),A.return=N,N=A;break e}else{a(N,v);break}else t(N,v);v=v.sibling}A=Mh(w,N.mode,A),A.return=N,N=A}return c(N);case Ii:return w=xr(w),O(N,v,w,A)}if(el(w))return V(N,v,w,A);if(Xs(w)){if(H=Xs(w),typeof H!="function")throw Error(U(150));return w=H.call(w),z(N,v,w,A)}if(typeof w.then=="function")return O(N,v,_c(w),A);if(w.$$typeof===Bn)return O(N,v,Dc(N,w),A);Hc(N,w)}return typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint"?(w=""+w,v!==null&&v.tag===6?(a(N,v.sibling),A=r(v,w),A.return=N,N=A):(a(N,v),A=Rh(w,N.mode,A),A.return=N,N=A),c(N)):a(N,v)}return function(N,v,w,A){try{Nl=0;var H=O(N,v,w,A);return jo=null,H}catch(F){if(F===ds||F===Jd)throw F;var Y=za(29,F,null,N.mode);return Y.lanes=A,Y.return=N,Y}}}var Or=tw(!0),aw=tw(!1),Di=!1;function Sp(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function vm(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Pi(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Xi(e,t,a){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(et&2)!==0){var r=i.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),i.pending=t,t=wd(e),Xy(e,null,a),t}return Qd(e,i,t,a),wd(e)}function ll(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,yy(e,a)}}function Vh(e,t){var a=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,a===i)){var r=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?r=s=c:s=s.next=c,a=a.next}while(a!==null);s===null?r=s=t:s=s.next=t}else r=s=t;a={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,callbacks:i.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var ym=!1;function cl(){if(ym){var e=Bo;if(e!==null)throw e}}function dl(e,t,a,i){ym=!1;var r=e.updateQueue;Di=!1;var s=r.firstBaseUpdate,c=r.lastBaseUpdate,d=r.shared.pending;if(d!==null){r.shared.pending=null;var h=d,p=h.next;h.next=null,c===null?s=p:c.next=p,c=h;var b=e.alternate;b!==null&&(b=b.updateQueue,d=b.lastBaseUpdate,d!==c&&(d===null?b.firstBaseUpdate=p:d.next=p,b.lastBaseUpdate=h))}if(s!==null){var $=r.baseState;c=0,b=p=h=null,d=s;do{var f=d.lane&-536870913,y=f!==d.lane;if(y?(je&f)===f:(i&f)===f){f!==0&&f===Vr&&(ym=!0),b!==null&&(b=b.next={lane:0,tag:d.tag,payload:d.payload,callback:null,next:null});e:{var V=e,z=d;f=t;var O=a;switch(z.tag){case 1:if(V=z.payload,typeof V=="function"){$=V.call(O,$,f);break e}$=V;break e;case 3:V.flags=V.flags&-65537|128;case 0:if(V=z.payload,f=typeof V=="function"?V.call(O,$,f):V,f==null)break e;$=gt({},$,f);break e;case 2:Di=!0}}f=d.callback,f!==null&&(e.flags|=64,y&&(e.flags|=8192),y=r.callbacks,y===null?r.callbacks=[f]:y.push(f))}else y={lane:f,tag:d.tag,payload:d.payload,callback:d.callback,next:null},b===null?(p=b=y,h=$):b=b.next=y,c|=f;if(d=d.next,d===null){if(d=r.shared.pending,d===null)break;y=d,d=y.next,y.next=null,r.lastBaseUpdate=y,r.shared.pending=null}}while(!0);b===null&&(h=$),r.baseState=h,r.firstBaseUpdate=p,r.lastBaseUpdate=b,s===null&&(r.shared.lanes=0),ir|=c,e.lanes=c,e.memoizedState=$}}function nw(e,t){if(typeof e!="function")throw Error(U(191,e));e.call(t)}function iw(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)nw(a[e],t)}var ar=Qn(null),kd=Qn(0);function tv(e,t){e=yi,xt(kd,e),xt(ar,t),yi=e|t.baseLanes}function wm(){xt(kd,yi),xt(ar,ar.current)}function kp(){yi=kd.current,ra(ar),ra(kd)}var la=Qn(null),pa=null;function Zi(e){var t=e.alternate;xt(oa,oa.current&1),xt(la,e),pa===null&&(t===null||ar.current!==null||t.memoizedState!==null)&&(pa=e)}function xm(e){xt(oa,oa.current),xt(la,e),pa===null&&(pa=e)}function rw(e){e.tag===22?(xt(oa,oa.current),xt(la,e),pa===null&&(pa=e)):Qi()}function Qi(){xt(oa,oa.current),xt(la,la.current)}function La(e){ra(la),pa===e&&(pa=null),ra(oa)}var oa=Qn(0);function Sl(e,t){xt(la,la.current),xt(oa,t)}function Cp(e){ra(oa),ra(la),pa===e&&(pa=null)}function Cd(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||tp(a)||Wp(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var fi=0,Ce=null,mt=null,Bt=null,Td=!1,Yo=!1,Ir=!1,Ed=0,kl=0,Go=null,BN=0;function Ot(){throw Error(U(321))}function Tp(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!Xa(e[a],t[a]))return!1;return!0}function Ep(e,t,a,i,r,s){return fi=s,Ce=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,xe.H=e===null||e.memoizedState===null?Dw:_w,Ir=!1,s=a(i,r),Ir=!1,Yo&&(s=sw(t,a,i,r)),ow(e),s}function ow(e){xe.H=Ad;var t=mt!==null&&mt.next!==null;if(fi=0,Bt=mt=Ce=null,Td=!1,kl=0,Go=null,t)throw Error(U(300));e===null||Yt||(e=e.dependencies,e!==null&&Nd(e)&&(Yt=!0))}function sw(e,t,a,i){Ce=e;var r=0;do{if(Yo&&(Go=null),kl=0,Yo=!1,25<=r)throw Error(U(301));if(r+=1,Bt=mt=null,e.updateQueue!=null){var s=e.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}xe.H=FN,s=t(a,i)}while(Yo);return s}function jN(){var e=xe.H,t=e.useState()[0];return t=typeof t.then=="function"?Ll(t):t,e=e.useState()[0],(mt!==null?mt.memoizedState:null)!==e&&(Ce.flags|=1024),t}function Ap(){var e=Ed!==0;return Ed=0,e}function Rp(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Mp(e){if(Td){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Td=!1}fi=0,Bt=mt=Ce=null,Yo=!1,kl=Ed=0,Go=null}function Sa(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Bt===null?Ce.memoizedState=Bt=e:Bt=Bt.next=e,Bt}function Lt(){if(mt===null){var e=Ce.alternate;e=e!==null?e.memoizedState:null}else e=mt.next;var t=Bt===null?Ce.memoizedState:Bt.next;if(t!==null)Bt=t,mt=e;else{if(e===null)throw Ce.alternate===null?Error(U(467)):Error(U(310));mt=e,e={memoizedState:mt.memoizedState,baseState:mt.baseState,baseQueue:mt.baseQueue,queue:mt.queue,next:null},Bt===null?Ce.memoizedState=Bt=e:Bt=Bt.next=e}return Bt}function Kd(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ll(e){var t=kl;return kl+=1,Go===null&&(Go=[]),e=ew(Go,e,t),t=Ce,(Bt===null?t.memoizedState:Bt.next)===null&&(t=t.alternate,xe.H=t===null||t.memoizedState===null?Dw:_w),e}function Wd(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Ll(e);if(e.$$typeof===S5)return;if(e.$$typeof===Bn)return ia(e)}throw Error(U(438,String(e)))}function zp(e){var t=null,a=Ce.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var i=Ce.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(r){return r.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=Kd(),Ce.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),i=0;i<e;i++)a[i]=N5;return t.index++,a}function bi(e,t){return typeof t=="function"?t(e):t}function ad(e){var t=Lt();return Vp(t,mt,e)}function Vp(e,t,a){var i=e.queue;if(i===null)throw Error(U(311));i.lastRenderedReducer=a;var r=e.baseQueue,s=i.pending;if(s!==null){if(r!==null){var c=r.next;r.next=s.next,s.next=c}t.baseQueue=r=s,i.pending=null}if(s=e.baseState,r===null)e.memoizedState=s;else{t=r.next;var d=c=null,h=null,p=t,b=!1;do{var $=p.lane&-536870913;if($!==p.lane?(je&$)===$:(fi&$)===$){var f=p.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:p.action,hasEagerState:p.hasEagerState,eagerState:p.eagerState,next:null}),$===Vr&&(b=!0);else if((fi&f)===f){p=p.next,f===Vr&&(b=!0);continue}else $={lane:0,revertLane:p.revertLane,gesture:null,action:p.action,hasEagerState:p.hasEagerState,eagerState:p.eagerState,next:null},h===null?(d=h=$,c=s):h=h.next=$,Ce.lanes|=f,ir|=f;$=p.action,Ir&&a(s,$),s=p.hasEagerState?p.eagerState:a(s,$)}else f={lane:$,revertLane:p.revertLane,gesture:p.gesture,action:p.action,hasEagerState:p.hasEagerState,eagerState:p.eagerState,next:null},h===null?(d=h=f,c=s):h=h.next=f,Ce.lanes|=$,ir|=$;p=p.next}while(p!==null&&p!==t);if(h===null?c=s:h.next=d,!Xa(s,e.memoizedState)&&(Yt=!0,b&&(a=Bo,a!==null)))throw a;e.memoizedState=s,e.baseState=c,e.baseQueue=h,i.lastRenderedState=s}return r===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function Oh(e){var t=Lt(),a=t.queue;if(a===null)throw Error(U(311));a.lastRenderedReducer=e;var i=a.dispatch,r=a.pending,s=t.memoizedState;if(r!==null){a.pending=null;var c=r=r.next;do s=e(s,c.action),c=c.next;while(c!==r);Xa(s,t.memoizedState)||(Yt=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),a.lastRenderedState=s}return[s,i]}function lw(e,t,a){var i=Ce,r=Lt(),s=ze;if(s){if(a===void 0)throw Error(U(407));a=a()}else a=t();var c=!Xa((mt||r).memoizedState,a);if(c&&(r.memoizedState=a,Yt=!0),r=r.queue,Op(uw.bind(null,i,r,e),[e]),e=r.getSnapshot!==t||c||Bt!==null&&(Bt.memoizedState.tag&1)!==0,Ko(e?9:8,{destroy:void 0},dw.bind(null,i,r,a,t),null),e){if(i.flags|=2048,pt===null)throw Error(U(349));s||(fi&127)!==0||cw(i,t,a)}return a}function cw(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=Ce.updateQueue,t===null?(t=Kd(),Ce.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function dw(e,t,a,i){t.value=a,t.getSnapshot=i,hw(t)&&mw(e)}function uw(e,t,a){return a(function(){hw(t)&&mw(e)})}function hw(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!Xa(e,a)}catch{return!0}}function mw(e){var t=qr(e,2);t!==null&&Va(t,e,2)}function $m(e){var t=Sa();if(typeof e=="function"){var a=e;if(e=a(),Ir){Hi(!0);try{a()}finally{Hi(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:bi,lastRenderedState:e},t}function pw(e,t,a,i){return e.baseState=a,Vp(e,mt,typeof i=="function"?i:bi)}function YN(e,t,a,i,r){if(tu(e))throw Error(U(485));if(e=t.action,e!==null){var s={payload:r,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){s.listeners.push(c)}};xe.T!==null?a(!0):s.isTransition=!1,i(s),a=t.pending,a===null?(s.next=t.pending=s,gw(t,s)):(s.next=a.next,t.pending=a.next=s)}}function gw(e,t){var a=t.action,i=t.payload,r=e.state;if(t.isTransition){var s=xe.T,c={};c.types=s!==null?s.types:null,xe.T=c;try{var d=a(r,i),h=xe.S;h!==null&&h(c,d),av(e,t,d)}catch(p){Nm(e,t,p)}finally{s!==null&&c.types!==null&&(s.types=c.types),xe.T=s}}else try{s=a(r,i),av(e,t,s)}catch(p){Nm(e,t,p)}}function av(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(i){nv(e,t,i)},function(i){return Nm(e,t,i)}):nv(e,t,a)}function nv(e,t,a){t.status="fulfilled",t.value=a,fw(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,gw(e,a)))}function Nm(e,t,a){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=a,fw(t),t=t.next;while(t!==i)}e.action=null}function fw(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function bw(e,t){return t}function iv(e,t){if(ze){var a=pt.formState;if(a!==null){e:{var i=Ce;if(ze){if(wt){t:{for(var r=wt,s=on;r.nodeType!==8;){if(!s){r=null;break t}if(r=sn(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){wt=sn(r.nextSibling),i=r.data==="F!";break e}}tr(i)}i=!1}i&&(t=a[0])}}return a=Sa(),a.memoizedState=a.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:bw,lastRenderedState:t},a.queue=i,a=Vw.bind(null,Ce,i),i.dispatch=a,i=$m(!1),s=Hp.bind(null,Ce,!1,i.queue),i=Sa(),r={state:t,dispatch:null,action:e,pending:null},i.queue=r,a=YN.bind(null,Ce,r,s,a),r.dispatch=a,i.memoizedState=e,[t,a,!1]}function rv(e){var t=Lt();return vw(t,mt,e)}function vw(e,t,a){if(t=Vp(e,t,bw)[0],e=ad(bi)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=Ll(t)}catch(c){throw c===ds?Jd:c}else i=t;t=Lt();var r=t.queue,s=r.dispatch;return a!==t.memoizedState&&(Ce.flags|=2048,Ko(9,{destroy:void 0},GN.bind(null,r,a),null)),[i,s,e]}function GN(e,t){e.action=t}function ov(e){var t=Lt(),a=mt;if(a!==null)return vw(t,a,e);Lt(),t=t.memoizedState,a=Lt();var i=a.queue.dispatch;return a.memoizedState=e,[t,i,!1]}function Ko(e,t,a,i){return e={tag:e,create:a,deps:i,inst:t,next:null},t=Ce.updateQueue,t===null&&(t=Kd(),Ce.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(i=a.next,a.next=e,e.next=i,t.lastEffect=e),e}function yw(){return Lt().memoizedState}function nd(e,t,a,i){var r=Sa();Ce.flags|=e,r.memoizedState=Ko(1|t,{destroy:void 0},a,i===void 0?null:i)}function eu(e,t,a,i){var r=Lt();i=i===void 0?null:i;var s=r.memoizedState.inst;mt!==null&&i!==null&&Tp(i,mt.memoizedState.deps)?r.memoizedState=Ko(t,s,a,i):(Ce.flags|=e,r.memoizedState=Ko(1|t,s,a,i))}function sv(e,t){nd(8390656,8,e,t)}function Op(e,t){eu(2048,8,e,t)}function PN(e){Ce.flags|=4;var t=Ce.updateQueue;if(t===null)t=Kd(),Ce.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function ww(e){var t=Lt().memoizedState;return PN({ref:t,nextImpl:e}),function(){if((et&2)!==0)throw Error(U(440));return t.impl.apply(void 0,arguments)}}function xw(e,t){return eu(4,2,e,t)}function $w(e,t){return eu(4,4,e,t)}function Nw(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Sw(e,t,a){a=a!=null?a.concat([e]):null,eu(4,4,Nw.bind(null,t,e),a)}function Ip(){}function kw(e,t){var a=Lt();t=t===void 0?null:t;var i=a.memoizedState;return t!==null&&Tp(t,i[1])?i[0]:(a.memoizedState=[e,t],e)}function Cw(e,t){var a=Lt();t=t===void 0?null:t;var i=a.memoizedState;if(t!==null&&Tp(t,i[1]))return i[0];if(i=e(),Ir){Hi(!0);try{e()}finally{Hi(!1)}}return a.memoizedState=[i,t],i}function Dp(e,t,a){return a===void 0||(fi&1073741824)!==0&&(je&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=v0(),Ce.lanes|=e,ir|=e,a)}function Tw(e,t,a,i){return Xa(a,t)?a:ar.current!==null?(e=Dp(e,a,i),Xa(e,t)||(Yt=!0),e):(fi&106)===0||(fi&1073741824)!==0&&(je&261930)===0?(Yt=!0,e.memoizedState=a):(e=v0(),Ce.lanes|=e,ir|=e,t)}function Ew(e,t,a,i,r){var s=tt.p;tt.p=s!==0&&8>s?s:8;var c=xe.T,d={};d.types=c!==null?c.types:null,xe.T=d,Hp(e,!1,t,a);try{var h=r(),p=xe.S;if(p!==null&&p(d,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var b=qN(h,i);ul(e,t,b,Pa(e))}else ul(e,t,i,Pa(e))}catch($){ul(e,t,{then:function(){},status:"rejected",reason:$},Pa())}finally{tt.p=s,c!==null&&d.types!==null&&(c.types=d.types),xe.T=c}}function XN(){}function Sm(e,t,a,i){if(e.tag!==5)throw Error(U(476));var r=Aw(e).queue;Ew(e,r,t,kr,a===null?XN:function(){return Rw(e),a(i)})}function Aw(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:kr,baseState:kr,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:bi,lastRenderedState:kr},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:bi,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Rw(e){var t=Aw(e);t.next===null&&(t=e.alternate.memoizedState),ul(e,t.next.queue,{},Pa())}function _p(){return ia(rs)}function Mw(){return Lt().memoizedState}function zw(){return Lt().memoizedState}function ZN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=Pa();e=Pi(a);var i=Xi(t,e,a);i!==null&&(Va(i,t,a),ll(i,t,a)),t={cache:xp()},e.payload=t;return}t=t.return}}function QN(e,t,a){var i=Pa();a={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},tu(e)?Ow(t,a):(a=vp(e,t,a,i),a!==null&&(Va(a,e,i),Iw(a,t,i)))}function Vw(e,t,a){var i=Pa();ul(e,t,a,i)}function ul(e,t,a,i){var r={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(tu(e))Ow(t,r);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var c=t.lastRenderedState,d=s(c,a);if(r.hasEagerState=!0,r.eagerState=d,Xa(d,c))return Qd(e,t,r,0),pt===null&&Zd(),!1}catch{}if(a=vp(e,t,r,i),a!==null)return Va(a,e,i),Iw(a,t,i),!0}return!1}function Hp(e,t,a,i){if(i={lane:2,revertLane:Qp(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},tu(e)){if(t)throw Error(U(479))}else t=vp(e,a,i,2),t!==null&&Va(t,e,2)}function tu(e){var t=e.alternate;return e===Ce||t!==null&&t===Ce}function Ow(e,t){Yo=Td=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Iw(e,t,a){if((a&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,yy(e,a)}}var Ad={readContext:ia,use:Wd,useCallback:Ot,useContext:Ot,useEffect:Ot,useImperativeHandle:Ot,useLayoutEffect:Ot,useInsertionEffect:Ot,useMemo:Ot,useReducer:Ot,useRef:Ot,useState:Ot,useDebugValue:Ot,useDeferredValue:Ot,useTransition:Ot,useSyncExternalStore:Ot,useId:Ot,useHostTransitionStatus:Ot,useFormState:Ot,useActionState:Ot,useOptimistic:Ot,useMemoCache:Ot,useCacheRefresh:Ot,useEffectEvent:Ot},Dw={readContext:ia,use:Wd,useCallback:function(e,t){return Sa().memoizedState=[e,t===void 0?null:t],e},useContext:ia,useEffect:sv,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,nd(4194308,4,Nw.bind(null,t,e),a)},useLayoutEffect:function(e,t){return nd(4194308,4,e,t)},useInsertionEffect:function(e,t){nd(4,2,e,t)},useMemo:function(e,t){var a=Sa();t=t===void 0?null:t;var i=e();if(Ir){Hi(!0);try{e()}finally{Hi(!1)}}return a.memoizedState=[i,t],i},useReducer:function(e,t,a){var i=Sa();if(a!==void 0){var r=a(t);if(Ir){Hi(!0);try{a(t)}finally{Hi(!1)}}}else r=t;return i.memoizedState=i.baseState=r,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:r},i.queue=e,e=e.dispatch=QN.bind(null,Ce,e),[i.memoizedState,e]},useRef:function(e){var t=Sa();return e={current:e},t.memoizedState=e},useState:function(e){e=$m(e);var t=e.queue,a=Vw.bind(null,Ce,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:Ip,useDeferredValue:function(e,t){var a=Sa();return Dp(a,e,t)},useTransition:function(){var e=$m(!1);return e=Ew.bind(null,Ce,e.queue,!0,!1),Sa().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var i=Ce,r=Sa();if(ze){if(a===void 0)throw Error(U(407));a=a()}else{if(a=t(),pt===null)throw Error(U(349));(je&127)!==0||cw(i,t,a)}r.memoizedState=a;var s={value:a,getSnapshot:t};return r.queue=s,sv(uw.bind(null,i,s,e),[e]),i.flags|=2048,Ko(9,{destroy:void 0},dw.bind(null,i,s,a,t),null),a},useId:function(){var e=Sa(),t=pt.identifierPrefix;if(ze){var a=Gn,i=Yn;a=(i&~(1<<32-Ga(i)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Ed++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=BN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:_p,useFormState:iv,useActionState:iv,useOptimistic:function(e){var t=Sa();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=Hp.bind(null,Ce,!0,a),a.dispatch=t,[e,t]},useMemoCache:zp,useCacheRefresh:function(){return Sa().memoizedState=ZN.bind(null,Ce)},useEffectEvent:function(e){var t=Sa(),a={impl:e};return t.memoizedState=a,function(){if((et&2)!==0)throw Error(U(440));return a.impl.apply(void 0,arguments)}}},_w={readContext:ia,use:Wd,useCallback:kw,useContext:ia,useEffect:Op,useImperativeHandle:Sw,useInsertionEffect:xw,useLayoutEffect:$w,useMemo:Cw,useReducer:ad,useRef:yw,useState:function(){return ad(bi)},useDebugValue:Ip,useDeferredValue:function(e,t){var a=Lt();return Tw(a,mt.memoizedState,e,t)},useTransition:function(){var e=ad(bi)[0],t=Lt().memoizedState;return[typeof e=="boolean"?e:Ll(e),t]},useSyncExternalStore:lw,useId:Mw,useHostTransitionStatus:_p,useFormState:rv,useActionState:rv,useOptimistic:function(e,t){var a=Lt();return pw(a,mt,e,t)},useMemoCache:zp,useCacheRefresh:zw,useEffectEvent:ww},FN={readContext:ia,use:Wd,useCallback:kw,useContext:ia,useEffect:Op,useImperativeHandle:Sw,useInsertionEffect:xw,useLayoutEffect:$w,useMemo:Cw,useReducer:Oh,useRef:yw,useState:function(){return Oh(bi)},useDebugValue:Ip,useDeferredValue:function(e,t){var a=Lt();return mt===null?Dp(a,e,t):Tw(a,mt.memoizedState,e,t)},useTransition:function(){var e=Oh(bi)[0],t=Lt().memoizedState;return[typeof e=="boolean"?e:Ll(e),t]},useSyncExternalStore:lw,useId:Mw,useHostTransitionStatus:_p,useFormState:ov,useActionState:ov,useOptimistic:function(e,t){var a=Lt();return mt!==null?pw(a,mt,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:zp,useCacheRefresh:zw,useEffectEvent:ww};function Ih(e,t,a,i){t=e.memoizedState,a=a(i,t),a=a==null?t:gt({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var km={enqueueSetState:function(e,t,a){e=e._reactInternals;var i=Pa(),r=Pi(i);r.payload=t,a!=null&&(r.callback=a),t=Xi(e,r,i),t!==null&&(Va(t,e,i),ll(t,e,i))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var i=Pa(),r=Pi(i);r.tag=1,r.payload=t,a!=null&&(r.callback=a),t=Xi(e,r,i),t!==null&&(Va(t,e,i),ll(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=Pa(),i=Pi(a);i.tag=2,t!=null&&(i.callback=t),t=Xi(e,i,a),t!==null&&(Va(t,e,a),ll(t,e,a))}};function lv(e,t,a,i,r,s,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,s,c):t.prototype&&t.prototype.isPureReactComponent?!wl(a,i)||!wl(r,s):!0}function cv(e,t,a,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,i),t.state!==e&&km.enqueueReplaceState(t,t.state,null)}function Dr(e,t){var a=t;if("ref"in t){a={};for(var i in t)i!=="ref"&&(a[i]=t[i])}if(e=e.defaultProps){a===t&&(a=gt({},a));for(var r in e)a[r]===void 0&&(a[r]=e[r])}return a}function Hw(e){yd(e)}function Uw(e){console.error(e)}function Lw(e){yd(e)}function Rd(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function dv(e,t,a){try{var i=e.onCaughtError;i(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Cm(e,t,a){return a=Pi(a),a.tag=3,a.payload={element:null},a.callback=function(){Rd(e,t)},a}function qw(e){return e=Pi(e),e.tag=3,e}function Bw(e,t,a,i){var r=a.type.getDerivedStateFromError;if(typeof r=="function"){var s=i.value;e.payload=function(){return r(s)},e.callback=function(){dv(t,a,i)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){dv(t,a,i),typeof r!="function"&&(Fi===null?Fi=new Set([this]):Fi.add(this));var d=i.stack;this.componentDidCatch(i.value,{componentStack:d!==null?d:""})})}function JN(e,t,a,i,r){if(a.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=a.alternate,t!==null&&Mr(t,a,r,!0),a=la.current,a!==null){switch(a.tag){case 31:case 13:case 19:return pa===null?Hd():a.alternate===null&&It===0&&(It=3),a.flags&=-257,a.flags|=65536,a.lanes=r,i===Sd?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([i]):t.add(i),Bh(e,i,r)),!1;case 22:return a.flags|=65536,i===Sd?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([i]):a.add(i)),Bh(e,i,r)),!1}throw Error(U(435,a.tag))}return Bh(e,i,r),Hd(),!1}if(ze)return t=la.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=r,i!==pm&&(e=Error(U(422),{cause:i}),$l(rn(e,a)))):(i!==pm&&(t=Error(U(423),{cause:i}),$l(rn(t,a))),e=e.current.alternate,e.flags|=65536,r&=-r,e.lanes|=r,i=rn(i,a),r=Cm(e.stateNode,i,r),Vh(e,r),It!==4&&(It=2)),!1;var s=Error(U(520),{cause:i});if(s=rn(s,a),gl===null?gl=[s]:gl.push(s),It!==4&&(It=2),t===null)return!0;i=rn(i,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=r&-r,a.lanes|=e,e=Cm(a.stateNode,i,e),Vh(a,e),!1;case 1:if(t=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(Fi===null||!Fi.has(s))))return a.flags|=65536,r&=-r,a.lanes|=r,r=qw(r),Bw(r,e,a,i),Vh(a,r),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var Up=Error(U(461)),Yt=!1;function Gt(e,t,a,i){t.child=e===null?aw(t,null,a,i):Or(t,e.child,a,i)}function uv(e,t,a,i,r){a=a.render;var s=t.ref;if("ref"in i){var c={};for(var d in i)d!=="ref"&&(c[d]=i[d])}else c=i;return zr(t),i=Ep(e,t,a,c,s,r),d=Ap(),e!==null&&!Yt?(Rp(e,t,r),vi(e,t,r)):(ze&&d&&Fd(t),t.flags|=1,Gt(e,t,i,r),t.child)}function hv(e,t,a,i,r){if(e===null){var s=a.type;return typeof s=="function"&&!yp(s)&&s.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=s,jw(e,t,s,i,r)):(e=Wc(a.type,null,i,t,t.mode,r),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!qp(e,r)){var c=s.memoizedProps;if(a=a.compare,a=a!==null?a:wl,a(c,i)&&e.ref===t.ref)return vi(e,t,r)}return t.flags|=1,e=hi(s,i),e.ref=t.ref,e.return=t,t.child=e}function jw(e,t,a,i,r){if(e!==null){var s=e.memoizedProps;if(wl(s,i)&&e.ref===t.ref)if(Yt=!1,t.pendingProps=i=s,qp(e,r))(e.flags&131072)!==0&&(Yt=!0);else return t.lanes=e.lanes,vi(e,t,r)}return Tm(e,t,a,i,r)}function Yw(e,t,a,i){var r=i.children,s=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(s=s!==null?s.baseLanes|a:a,e!==null){for(i=t.child=e.child,r=0;i!==null;)r=r|i.lanes|i.childLanes,i=i.sibling;i=r&~s}else i=0,t.child=null;return mv(e,t,s,a,i)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&td(t,s!==null?s.cachePool:null),s!==null?tv(t,s):wm(),rw(t);else return i=t.lanes=536870912,mv(e,t,s!==null?s.baseLanes|a:a,a,i)}else s!==null?(td(t,s.cachePool),tv(t,s),Qi(),t.memoizedState=null):(e!==null&&td(t,null),wm(),Qi());return Gt(e,t,r,a),t.child}function hl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function mv(e,t,a,i,r){var s=$p();return s=s===null?null:{parent:jt._currentValue,pool:s},t.memoizedState={baseLanes:a,cachePool:s},e!==null&&td(t,null),wm(),rw(t),e!==null&&Mr(e,t,i,!0),t.childLanes=r,null}function id(e,t){return t=au({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function pv(e,t,a){return Or(t,e.child,null,a),e=id(t,t.pendingProps),e.flags|=2,La(t),t.memoizedState=null,e}function KN(e,t,a){var i=t.pendingProps,r=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(ze){if(i.mode==="hidden")return e=id(t,i),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},hl(null,e);if(xm(t),(e=wt)?(e=Y0(e,on),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:er!==null?{id:Yn,overflow:Gn}:null,retryLane:536870912,hydrationErrors:null},a=Qy(e),a.return=t,t.child=a,Wt=t,wt=null)):e=null,e===null)throw tr(t);return t.lanes=536870912,null}return id(t,i)}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(xm(t),r)if(t.flags&256)t.flags&=-257,t=pv(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(U(558));else if(Yt||Mr(e,t,a,!1),r=(a&e.childLanes)!==0,Yt||r){if(ar.current===null){if(i=pt,i!==null&&(c=wy(i,a),c!==0&&c!==s.retryLane))throw s.retryLane=c,qr(e,c),Va(i,e,c),Up;Hd()}t=pv(e,t,a)}else e=s.treeContext,wt=sn(c.nextSibling),Wt=t,ze=!0,Gi=null,on=!1,e!==null&&Jy(t,e),t=id(t,i),t.flags|=134221824;return t}return e=hi(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function So(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(U(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Tm(e,t,a,i,r){return zr(t),a=Ep(e,t,a,i,void 0,r),i=Ap(),e!==null&&!Yt?(Rp(e,t,r),vi(e,t,r)):(ze&&i&&Fd(t),t.flags|=1,Gt(e,t,a,r),t.child)}function gv(e,t,a,i,r,s){return zr(t),t.updateQueue=null,a=sw(t,i,a,r),ow(e),i=Ap(),e!==null&&!Yt?(Rp(e,t,s),vi(e,t,s)):(ze&&i&&Fd(t),t.flags|=1,Gt(e,t,a,s),t.child)}function fv(e,t,a,i,r){if(zr(t),t.stateNode===null){var s=Io,c=a.contextType;typeof c=="object"&&c!==null&&(s=ia(c)),s=new a(i,s),t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=km,t.stateNode=s,s._reactInternals=t,s=t.stateNode,s.props=i,s.state=t.memoizedState,s.refs={},Sp(t),c=a.contextType,s.context=typeof c=="object"&&c!==null?ia(c):Io,s.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(Ih(t,a,c,i),s.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(c=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),c!==s.state&&km.enqueueReplaceState(s,s.state,null),dl(t,i,s,r),cl(),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){s=t.stateNode;var d=t.memoizedProps,h=Dr(a,d);s.props=h;var p=s.context,b=a.contextType;c=Io,typeof b=="object"&&b!==null&&(c=ia(b));var $=a.getDerivedStateFromProps;b=typeof $=="function"||typeof s.getSnapshotBeforeUpdate=="function",d=t.pendingProps!==d,b||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(d||p!==c)&&cv(t,s,i,c),Di=!1;var f=t.memoizedState;s.state=f,dl(t,i,s,r),cl(),p=t.memoizedState,d||f!==p||Di?(typeof $=="function"&&(Ih(t,a,$,i),p=t.memoizedState),(h=Di||lv(t,a,h,i,f,p,c))?(b||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=p),s.props=i,s.state=p,s.context=c,i=h):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{s=t.stateNode,vm(e,t),c=t.memoizedProps,b=Dr(a,c),s.props=b,$=t.pendingProps,f=s.context,p=a.contextType,h=Io,typeof p=="object"&&p!==null&&(h=ia(p)),d=a.getDerivedStateFromProps,(p=typeof d=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==$||f!==h)&&cv(t,s,i,h),Di=!1,f=t.memoizedState,s.state=f,dl(t,i,s,r),cl();var y=t.memoizedState;c!==$||f!==y||Di||e!==null&&e.dependencies!==null&&Nd(e.dependencies)?(typeof d=="function"&&(Ih(t,a,d,i),y=t.memoizedState),(b=Di||lv(t,a,b,i,f,y,h)||e!==null&&e.dependencies!==null&&Nd(e.dependencies))?(p||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(i,y,h),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(i,y,h)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=y),s.props=i,s.state=y,s.context=h,i=b):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),i=!1)}return s=i,So(e,t),i=(t.flags&128)!==0,s||i?(s=t.stateNode,a=i&&typeof a.getDerivedStateFromError!="function"?null:s.render(),t.flags|=1,e!==null&&i?(t.child=Or(t,e.child,null,r),t.child=Or(t,null,a,r)):Gt(e,t,a,r),t.memoizedState=s.state,e=t.child):e=vi(e,t,r),e}function bv(e,t,a,i){return Rr(),t.flags|=256,Gt(e,t,a,i),t.child}var Em={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Am(e){return{baseLanes:e,cachePool:Wy()}}function Rm(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=Ba),e}function Gw(e,t,a){var i=t.pendingProps,r=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(oa.current&2)!==0),c&&(r=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(ze){if(r?Zi(t):Qi(),(e=wt)?(e=Y0(e,on),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:er!==null?{id:Yn,overflow:Gn}:null,retryLane:536870912,hydrationErrors:null},a=Qy(e),a.return=t,t.child=a,Wt=t,wt=null)):e=null,e===null)throw tr(t);return Wp(e)?t.lanes=32:t.lanes=536870912,null}return s=i.children,i=i.fallback,r?(Qi(),r=t.mode,s=au({mode:"hidden",children:s},r),i=Cr(i,r,a,null),s.return=t,i.return=t,s.sibling=i,t.child=s,i=t.child,i.memoizedState=Am(a),i.childLanes=Rm(e,c,a),t.memoizedState=Em,hl(null,i)):(Zi(t),Lp(t,s))}var d=e.memoizedState;if(d!==null){var h=d.dehydrated;if(h!==null)return WN(e,t,s,c,i,h,d,a)}return r?(Qi(),r=i.fallback,s=t.mode,d=e.child,h=d.sibling,i=hi(d,{mode:"hidden",children:i.children}),i.subtreeFlags=d.subtreeFlags&1206910976,h!==null?r=hi(h,r):(r=Cr(r,s,a,null),r.flags|=2),r.return=t,i.return=t,i.sibling=r,t.child=i,hl(null,i),i=t.child,r=e.child.memoizedState,r===null?r=Am(a):(s=r.cachePool,s!==null?(d=jt._currentValue,s=s.parent!==d?{parent:d,pool:d}:s):s=Wy(),r={baseLanes:r.baseLanes|a,cachePool:s}),i.memoizedState=r,i.childLanes=Rm(e,c,a),t.memoizedState=Em,hl(e.child,i)):(Zi(t),a=e.child,e=a.sibling,a=hi(a,{mode:"visible",children:i.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function Lp(e,t){return t=au({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function au(e,t){return e=za(22,e,null,t),e.lanes=0,e}function Uc(e,t,a){return Or(t,e.child,null,a),e=Lp(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function WN(e,t,a,i,r,s,c,d){if(a)return t.flags&256?(Zi(t),t.flags&=-257,Uc(e,t,d)):t.memoizedState!==null?(Qi(),t.child=e.child,t.flags|=128,null):(Qi(),s=r.fallback,c=t.mode,r=au({mode:"visible",children:r.children},c),s=Cr(s,c,d,null),s.flags|=2,r.return=t,s.return=t,r.sibling=s,t.child=r,Or(t,e.child,null,d),r=t.child,r.memoizedState=Am(d),r.childLanes=Rm(e,i,d),t.memoizedState=Em,hl(null,r));if(Zi(t),Wp(s)){if(i=s.nextSibling&&s.nextSibling.dataset,i)var h=i.dgst;return i=h,i!==""&&(r=Error(U(419)),r.stack="",r.digest=i,$l({value:r,source:null,stack:null})),Uc(e,t,d)}if(Yt||Mr(e,t,d,!1),i=(d&e.childLanes)!==0,Yt||i){if(ar.current!==null)return Uc(e,t,d);if(i=pt,i!==null&&(r=wy(i,d),r!==0&&r!==c.retryLane))throw c.retryLane=r,qr(e,r),Va(i,e,r),Up;return tp(s)||Hd(),Uc(e,t,d)}return tp(s)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,wt=sn(s.nextSibling),Wt=t,ze=!0,Gi=null,on=!1,e!==null&&Jy(t,e),t=Lp(t,r.children),t.flags|=134221824,t)}function vv(e,t,a){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),ed(e.return,t,a)}function yv(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Cd(a)===null&&(t=e),e=e.sibling}return t}function Lc(e,t,a,i,r,s){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:a,tailMode:r,treeForkCount:s}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=i,c.tail=a,c.tailMode=r,c.treeForkCount=s)}function Dh(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Mm(e,t,a){var i=t.pendingProps,r=i.revealOrder,s=i.tail;i=i.children;var c=oa.current;if(t.flags&128)return Sl(t,c),null;var d=(c&2)!==0;if(d?(c=c&1|2,t.flags|=128):c&=1,Sl(t,c),r==="backwards"&&e!==null?(Dh(e),Gt(e,t,i,a),Dh(e)):Gt(e,t,i,a),i=ze?xl:0,!d&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&vv(e,a,t);else if(e.tag===19)vv(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(r){case"backwards":a=yv(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null,Dh(t)),Lc(t,!0,r,null,s,i);break;case"unstable_legacy-backwards":for(a=null,r=t.child,t.child=null;r!==null;){if(e=r.alternate,e!==null&&Cd(e)===null){t.child=r;break}e=r.sibling,r.sibling=a,a=r,r=e}Lc(t,!0,a,null,s,i);break;case"together":Lc(t,!1,null,null,void 0,i);break;case"independent":t.memoizedState=null;break;default:a=yv(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null),Lc(t,!1,r,a,s,i)}return t.child}function wv(e,t,a){var i=t.pendingProps;return Li(t,t.type,i.value),Gt(e,t,i.children,a),t.child}function vi(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),ir|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Mr(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(U(153));if(t.child!==null){for(e=t.child,a=hi(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=hi(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function qp(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Nd(e)))}function eS(e,t,a){switch(t.tag){case 3:gd(t,t.stateNode.containerInfo),Li(t,jt,e.memoizedState.cache),Rr();break;case 27:case 5:im(t);break;case 4:gd(t,t.stateNode.containerInfo);break;case 10:Li(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,xm(t),null;break;case 13:var i=t.memoizedState;if(i!==null){if(i.dehydrated!==null)return Zi(t),t.flags|=128,null;i=Mr(e,t,a,!1);var r=t.child.childLanes;return i||(a&r)!==0?Gw(e,t,a):(Zi(t),e=vi(e,t,a),e!==null?e.sibling:null)}Zi(t);break;case 19:if(t.flags&128)return Mm(e,t,a);if(r=(e.flags&128)!==0,i=(a&t.childLanes)!==0,i||(Mr(e,t,a,!1),i=(a&t.childLanes)!==0),r){if(i)return Mm(e,t,a);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),Sl(t,oa.current),i)break;return null;case 22:return t.lanes=0,Yw(e,t,a,t.pendingProps);case 24:Li(t,jt,e.memoizedState.cache)}return vi(e,t,a)}function Pw(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)Yt=!0;else{if(!qp(e,a)&&(t.flags&128)===0)return Yt=!1,eS(e,t,a);Yt=(e.flags&131072)!==0}else Yt=!1,ze&&(t.flags&1048576)!==0&&Fy(t,xl,t.index);switch(t.lanes=0,t.tag){case 16:e:{var i=t.pendingProps;if(e=xr(t.elementType),t.type=e,typeof e=="function")yp(e)?(i=Dr(e,i),t.tag=1,t=fv(null,t,e,i,a)):(t.tag=0,t=Tm(null,t,e,i,a));else{if(e!=null){var r=e.$$typeof;if(r===op){t.tag=11,t=uv(null,t,e,i,a);break e}else if(r===sp){t.tag=14,t=hv(null,t,e,i,a);break e}else if(r===Bn){t.tag=10,t.type=e,t=wv(null,t,a);break e}}throw t=am(e)||e,Error(U(306,t,""))}}return t;case 0:return Tm(e,t,t.type,t.pendingProps,a);case 1:return i=t.type,r=Dr(i,t.pendingProps),fv(e,t,i,r,a);case 3:e:{if(gd(t,t.stateNode.containerInfo),e===null)throw Error(U(387));i=t.pendingProps;var s=t.memoizedState;r=s.element,vm(e,t),dl(t,i,null,a);var c=t.memoizedState;if(i=c.cache,Li(t,jt,i),i!==s.cache&&fm(t,[jt],a,!0),cl(),i=c.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){t=bv(e,t,i,a);break e}else if(i!==r){r=rn(Error(U(424)),t),$l(r),t=bv(e,t,i,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,wt=sn(e.firstChild),Wt=t,ze=!0,Gi=null,on=!0,a=aw(t,null,i,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Rr(),i===r){t=vi(e,t,a);break e}Gt(e,t,i,a)}t=t.child}return t;case 26:return So(e,t),e===null?(a=Xv(t.type,null,t.pendingProps,null))?t.memoizedState=a:ze||(t.stateNode=I0(t.type,t.pendingProps,Yi.current,t)):t.memoizedState=Xv(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return im(t),e===null&&ze&&(i=t.stateNode=G0(t.type,t.pendingProps,Yi.current),Wt=t,on=!0,r=wt,or(t.type)?(ap=r,wt=sn(i.firstChild)):wt=r),Gt(e,t,t.pendingProps.children,a),So(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&ze&&((r=i=wt)&&(i=PS(i,t.type,t.pendingProps,on),i!==null?(t.stateNode=i,Wt=t,wt=sn(i.firstChild),on=!1,r=!0):r=!1),r||tr(t)),im(t),r=t.type,s=t.pendingProps,c=e!==null?e.memoizedProps:null,i=s.children,Km(r,s)?i=null:c!==null&&Km(r,c)&&(t.flags|=32),t.memoizedState!==null&&(r=Ep(e,t,jN,null,null,a),rs._currentValue=r),So(e,t),Gt(e,t,i,a),t.child;case 6:return e===null&&ze&&((e=a=wt)&&(a=XS(a,t.pendingProps,on),a!==null?(t.stateNode=a,Wt=t,wt=null,e=!0):e=!1),e||tr(t)),null;case 13:return Gw(e,t,a);case 4:return gd(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=Or(t,null,i,a):Gt(e,t,i,a),t.child;case 11:return uv(e,t,t.type,t.pendingProps,a);case 7:return i=t.pendingProps,So(e,t),Gt(e,t,i,a),t.child;case 8:return Gt(e,t,t.pendingProps.children,a),t.child;case 12:return Gt(e,t,t.pendingProps.children,a),t.child;case 10:return wv(e,t,a);case 9:return r=t.type._context,i=t.pendingProps.children,zr(t),r=ia(r),i=i(r),t.flags|=1,Gt(e,t,i,a),t.child;case 14:return hv(e,t,t.type,t.pendingProps,a);case 15:return jw(e,t,t.type,t.pendingProps,a);case 19:return Mm(e,t,a);case 31:return KN(e,t,a);case 22:return Yw(e,t,a,t.pendingProps);case 24:return zr(t),i=ia(jt),e===null?(r=$p(),r===null&&(r=pt,s=xp(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=a),r=s),t.memoizedState={parent:i,cache:r},Sp(t),Li(t,jt,r)):((e.lanes&a)!==0&&(vm(e,t),dl(t,null,null,a),cl()),r=e.memoizedState,s=t.memoizedState,r.parent!==i?(r={parent:i,cache:i},t.memoizedState=r,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=r),Li(t,jt,i)):(i=s.cache,Li(t,jt,i),i!==r.cache&&fm(t,[jt],a,!0))),Gt(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),i=t.pendingProps,i.name!=null&&i.name!=="auto"?t.flags|=e===null?18882560:18874368:ze&&Fd(t),e!==null&&e.memoizedProps.name!==i.name?t.flags|=4194816:So(e,t),Gt(e,t,i.children,a),t.child;case 29:throw t.pendingProps}throw Error(U(156,t.tag))}function ci(e){e.flags|=4}function _h(e,t,a,i,r){var s;if((s=(e.mode&32)!==0)&&(s=a===null?Fv(t,i):Fv(t,i)&&(i.src!==a.src||i.srcSet!==a.srcSet)),s){if(e.flags|=16777216,(r&335544128)===r)if(e.stateNode.complete)e.flags|=8192;else if(x0())e.flags|=8192;else throw Er=Sd,Np}else e.flags&=-16777217}function xv(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Q0(t))if(x0())e.flags|=8192;else throw Er=Sd,Np}function qc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?by():536870912,e.lanes|=t,Wo|=t)}function Qs(e,t){if(!ze)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,i=null;a!==null;)a.alternate!==null&&(i=a),a=a.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function yt(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,i=0;if(t)for(var r=e.child;r!==null;)a|=r.lanes|r.childLanes,i|=r.subtreeFlags&1206910976,i|=r.flags&1206910976,r.return=e,r=r.sibling;else for(r=e.child;r!==null;)a|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=e,r=r.sibling;return e.subtreeFlags|=i,e.childLanes=a,t}function tS(e,t,a){var i=t.pendingProps;switch(wp(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return yt(t),null;case 1:return yt(t),null;case 3:return a=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),mi(jt),Qo(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&($o(t)?ci(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,zh())),yt(t),null;case 26:var r=t.type,s=t.memoizedState;return e===null?(ci(t),s!==null?(yt(t),xv(t,s)):(yt(t),_h(t,r,null,i,a))):s?s!==e.memoizedState?(ci(t),yt(t),xv(t,s)):(yt(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&ci(t),yt(t),_h(t,r,e,i,a)),null;case 27:if(fd(t),a=Yi.current,r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&ci(t);else{if(!i){if(t.stateNode===null)throw Error(U(166));return yt(t),t.subtreeFlags&=-33554433,null}e=Pn.current,$o(t)?Zb(t,e):(e=G0(r,i,a),t.stateNode=e,ci(t))}return yt(t),t.subtreeFlags&=-33554433,null;case 5:if(fd(t),r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&ci(t);else{if(!i){if(t.stateNode===null)throw Error(U(166));return yt(t),t.subtreeFlags&=-33554433,null}if(s=Pn.current,$o(t))Zb(t,s);else{var c=El(Yi.current);switch(s){case 1:s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=c.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof i.is=="string"?c.createElement("select",{is:i.is}):c.createElement("select"),i.multiple?s.multiple=!0:i.size&&(s.size=i.size);break;default:s=typeof i.is=="string"?c.createElement(r,{is:i.is}):c.createElement(r)}}s[na]=t,s[Ia]=i;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)s.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=s;e:switch(sa(s,r,i),r){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}i&&ci(t)}}return yt(t),t.subtreeFlags&=-33554433,_h(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&ci(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(U(166));if(e=Yi.current,$o(t)){if(e=t.stateNode,a=t.memoizedProps,i=null,r=Wt,r!==null)switch(r.tag){case 27:case 5:i=r.memoizedProps}e[na]=t,e=!!(e.nodeValue===a||i!==null&&i.suppressHydrationWarning===!0||V0(e.nodeValue,a)),e||tr(t,!0)}else e=El(e).createTextNode(i),e[na]=t,t.stateNode=e}return yt(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(i=$o(t),a!==null){if(e===null){if(!i)throw Error(U(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(U(557));e[na]=t}else Rr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;yt(t),e=!1}else a=zh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(La(t),t):(La(t),null);if((t.flags&128)!==0)throw Error(U(558))}return yt(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(r=$o(t),i!==null&&i.dehydrated!==null){if(e===null){if(!r)throw Error(U(318));if(r=t.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(U(317));r[na]=t}else Rr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;yt(t),r=!1}else r=zh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=r),r=!0;if(!r)return t.flags&256?(La(t),t):(La(t),null)}return La(t),(t.flags&128)!==0?(t.lanes=a,t):(a=i!==null,e=e!==null&&e.memoizedState!==null,a&&(i=t.child,r=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(r=i.alternate.memoizedState.cachePool.pool),s=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(s=i.memoizedState.cachePool.pool),s!==r&&(i.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),qc(t,t.updateQueue),yt(t),null);case 4:return Qo(),e===null&&Fp(t.stateNode.containerInfo),t.flags|=67108864,yt(t),null;case 10:return mi(t.type),yt(t),null;case 19:if(Cp(t),i=t.memoizedState,i===null)return yt(t),null;if(r=(t.flags&128)!==0,s=i.rendering,s===null)if(r)Qs(i,!1);else{if(It!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=Cd(e),s!==null){for(t.flags|=128,Qs(i,!1),e=s.updateQueue,t.updateQueue=e,qc(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Zy(a,e),a=a.sibling;return Sl(t,oa.current&1|2),ze&&di(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&ja()>Dd&&(t.flags|=128,r=!0,Qs(i,!1),t.lanes=4194304)}else{if(!r)if(e=Cd(s),e!==null){if(t.flags|=128,r=!0,e=e.updateQueue,t.updateQueue=e,qc(t,e),Qs(i,!0),i.tail===null&&i.tailMode!=="collapsed"&&i.tailMode!=="visible"&&!s.alternate&&!ze)return yt(t),null}else 2*ja()-i.renderingStartTime>Dd&&a!==536870912&&(t.flags|=128,r=!0,Qs(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(e=i.last,e!==null?e.sibling=s:t.child=s,i.last=s)}if(i.tail!==null){e=i.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return i.rendering=e,i.tail=e.sibling,i.renderingStartTime=ja(),e.sibling=null,s=oa.current,s=r?s&1|2:s&1,i.tailMode==="visible"||i.tailMode==="collapsed"||!a||ze?Sl(t,s):(a=s,xt(la,t),xt(oa,a),pa===null&&(pa=t)),ze&&di(t,i.treeForkCount),e}return yt(t),null;case 22:case 23:return La(t),kp(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(a&536870912)!==0&&(t.flags&128)===0&&(yt(t),t.subtreeFlags&6&&(t.flags|=8192)):yt(t),a=t.updateQueue,a!==null&&qc(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==a&&(t.flags|=2048),e!==null&&ra(Tr),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),mi(jt),yt(t),null;case 25:return null;case 30:return t.flags|=33554432,yt(t),null}throw Error(U(156,t.tag))}function aS(e,t){switch(wp(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return mi(jt),Qo(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return fd(t),null;case 31:if(t.memoizedState!==null){if(La(t),t.alternate===null)throw Error(U(340));Rr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(La(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(U(340));Rr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Cp(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Qo(),null;case 10:return mi(t.type),null;case 22:case 23:return La(t),kp(),e!==null&&ra(Tr),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return mi(jt),null;case 25:return null;default:return null}}function Xw(e,t){switch(wp(t),t.tag){case 3:mi(jt),Qo();break;case 26:case 27:case 5:fd(t);break;case 4:Qo();break;case 31:t.memoizedState!==null&&La(t);break;case 13:La(t);break;case 19:Cp(t);break;case 10:mi(t.type);break;case 22:case 23:La(t),kp(),e!==null&&ra(Tr);break;case 24:mi(jt)}}function ql(e,t){try{var a=t.updateQueue,i=a!==null?a.lastEffect:null;if(i!==null){var r=i.next;a=r;do{if((a.tag&e)===e){i=void 0;var s=a.create,c=a.inst;i=s(),c.destroy=i}a=a.next}while(a!==r)}}catch(d){ut(t,t.return,d)}}function nr(e,t,a){try{var i=t.updateQueue,r=i!==null?i.lastEffect:null;if(r!==null){var s=r.next;i=s;do{if((i.tag&e)===e){var c=i.inst,d=c.destroy;if(d!==void 0){c.destroy=void 0,r=t;var h=a,p=d;try{p()}catch(b){ut(r,h,b)}}}i=i.next}while(i!==s)}}catch(b){ut(t,t.return,b)}}function Zw(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{iw(t,a)}catch(i){ut(e,e.return,i)}}}function Qw(e,t,a){a.props=Dr(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(i){ut(e,t,i)}}function Ln(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:var r=e.stateNode,s=gi(e.memoizedProps,r);(r.ref===null||r.ref.name!==s)&&(r.ref=U0(s)),i=r.ref;break;case 7:if(e.stateNode===null){var c=new Za(e);Oa(e.child,!1,YS,c,void 0,void 0),e.stateNode=c}i=e.stateNode;break;default:i=e.stateNode}typeof a=="function"?e.refCleanup=a(i):a.current=i}}catch(d){ut(e,t,d)}}function aa(e,t){var a=e.ref,i=e.refCleanup;if(a!==null)if(typeof i=="function")try{i()}catch(r){ut(e,t,r)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(r){ut(e,t,r)}else a.current=null}function Md(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)j0(e.stateNode,t[a])}function $v(e){for(var t=e.return;t!==null&&(jp(t)&&j0(e.stateNode,t.stateNode),!Bp(t));)t=t.return}function ml(e){for(var t=e.return;t!==null&&(jp(t)&&GS(e.stateNode,t.stateNode),!Bp(t));)t=t.return}function Bp(e){return e.tag===5||e.tag===3||e.tag===27}function jp(e){return e&&e.tag===7&&e.stateNode!==null}function zm(e){var t=e.type,a=e.memoizedProps,i=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&i.focus();break e;case"img":a.src?i.src=a.src:a.srcSet&&(i.srcset=a.srcSet)}}catch(r){ut(e,e.return,r)}}function Hh(e,t,a){try{var i=e.stateNode;CS(i,e.type,a,t),i[Ia]=t}catch(r){ut(e,e.return,r)}}function Fw(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&or(e.type)||e.tag===4}function Uh(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Fw(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&or(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Vm(e,t,a,i){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(r,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(r),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=jn)),Md(e,i),We=!0;else if(r!==4&&(r===27&&(Md(e,i),i=null,or(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(Vm(e,t,a,i),e=e.sibling;e!==null;)Vm(e,t,a,i),e=e.sibling}function zd(e,t,a,i){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?a.insertBefore(r,t):a.appendChild(r),Md(e,i),We=!0;else if(r!==4&&(r===27&&(Md(e,i),i=null,or(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(zd(e,t,a,i),e=e.sibling;e!==null;)zd(e,t,a,i),e=e.sibling}function Jw(e){var t=e.stateNode,a=e.memoizedProps;try{for(var i=e.type,r=t.attributes;r.length;)t.removeAttributeNode(r[0]);sa(t,i,a),t[na]=e,t[Ia]=a}catch(s){ut(e,e.return,s)}}var Vd=!1,qa=null;function Nv(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Vd=!0)}var qn=null;function Sv(){var e=qn;return qn=null,e}var Ma=0;function us(e,t,a,i,r){return Ma=0,Kw(e.child,t,a,i,r)}function Kw(e,t,a,i,r){for(var s=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(i!==null){var d=Wm(c);i.push(d),d.view&&(s=!0)}else s||Wm(c).view&&(s=!0);Vd=!0,D0(c,Ma===0?t:t+"_"+Ma,a),Ma++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&r||Kw(e.child,t,a,i,r)&&(s=!0));e=e.sibling}return s}function Zn(e,t){for(;e!==null;)e.tag===5?_0(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||Zn(e.child,t)),e=e.sibling}function rd(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(rd(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(U(544));var a=t.name;t=xi(t.default,t.share),t!=="none"&&(us(e,a,t,null,!1)||Zn(e.child,!1))}e=e.sibling}}function Om(e,t){if(e.tag===30){var a=e.stateNode,i=e.memoizedProps,r=gi(i,a),s=xi(i.default,a.paired?i.share:i.enter);s!=="none"?us(e,r,s,null,!1)?(rd(e),a.paired||t||es(e,i.onEnter)):Zn(e.child,!1):rd(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Om(e,t),e=e.sibling;else rd(e)}function Im(e){if(qa!==null&&qa.size!==0){var t=qa;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,i=a.name;if(i!=null&&i!=="auto"){var r=t.get(i);if(r!==void 0){var s=xi(a.default,a.share);if(s!=="none"&&(us(e,i,s,null,!1)?(s=e.stateNode,r.paired=s,s.paired=r,es(e,a.onShare)):Zn(e.child,!1)),t.delete(i),t.size===0)break}}}Im(e)}e=e.sibling}}}function Dm(e){if(e.tag===30){var t=e.memoizedProps,a=gi(t,e.stateNode),i=qa!==null?qa.get(a):void 0,r=xi(t.default,i!==void 0?t.share:t.exit);r!=="none"&&(us(e,a,r,null,!1)?i!==void 0?(r=e.stateNode,i.paired=r,r.paired=i,qa.delete(a),es(e,t.onShare)):es(e,t.onExit):Zn(e.child,!1)),qa!==null&&Im(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Dm(e),e=e.sibling;else qa!==null&&Im(e)}function Ww(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=gi(t,e.stateNode);t=xi(t.default,t.update),e.flags&=-5,t!=="none"&&us(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&Ww(e);e=e.sibling}}function _m(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,Zn(e.child,!1))}_m(e)}e=e.sibling}}function od(e){if(e.tag===30)e.stateNode.paired=null,Zn(e.child,!1),_m(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)od(e),e=e.sibling;else _m(e)}function e0(e){for(e=e.child;e!==null;)e.tag===30?Zn(e.child,!1):(e.subtreeFlags&33554432)!==0&&e0(e),e=e.sibling}function Yp(e,t,a,i,r,s,c){for(var d=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(s!==null&&Ma<s.length){var p=s[Ma],b=Wm(h);(p.view||b.view)&&(d=!0);var $;if($=(e.flags&4)===0)if(b.clip)$=!0;else{$=p.rect;var f=b.rect;$=$.y!==f.y||$.x!==f.x||$.height!==f.height||$.width!==f.width}$&&(e.flags|=4),b.abs?b=!p.abs:(p=p.rect,b=b.rect,b=p.height!==b.height||p.width!==b.width),b&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&D0(h,Ma===0?a:a+"_"+Ma,r),d&&(e.flags&4)!==0||(qn===null&&(qn=[]),qn.push(h,Ma===0?i:i+"_"+Ma,t.memoizedProps)),Ma++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:Yp(e,t.child,a,i,r,s,c)&&(d=!0));t=t.sibling}return d}function t0(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,i=e.stateNode,r=gi(a,i),s=xi(a.default,a.update);if(t){i=i.clones;var c=i===null?null:i.map(zS)}else c=e.memoizedState,e.memoizedState=null;i=e;var d=e.child;Ma=0,r=Yp(i,d,r,r,s,c,!1),(e.flags&4)!==0&&r&&(t||es(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&t0(e,t);e=e.sibling}}var Ft=!1,st=!1,_n=!1,Lh=!1,kv=typeof WeakSet=="function"?WeakSet:Set,Jt=null,Hn=!1,nl=!1,Od=!1,Hm=!1;function nS(e,t,a){if(e=e.containerInfo,Fm=os,e=Ly(e),fp(e)){if("selectionStart"in e)var i={start:e.selectionStart,end:e.selectionEnd};else e:{i=(i=e.ownerDocument)&&i.defaultView||window;var r=i.getSelection&&i.getSelection();if(r&&r.rangeCount!==0){i=r.anchorNode;var s=r.anchorOffset,c=r.focusNode;r=r.focusOffset;try{i.nodeType,c.nodeType}catch{i=null;break e}var d=0,h=-1,p=-1,b=0,$=0,f=e,y=null;t:for(;;){for(var V;f!==i||s!==0&&f.nodeType!==3||(h=d+s),f!==c||r!==0&&f.nodeType!==3||(p=d+r),f.nodeType===3&&(d+=f.nodeValue.length),(V=f.firstChild)!==null;)y=f,f=V;for(;;){if(f===e)break t;if(y===i&&++b===s&&(h=d),y===c&&++$===r&&(p=d),(V=f.nextSibling)!==null)break;f=y,y=f.parentNode}f=V}i=h===-1||p===-1?null:{start:h,end:p}}else i=null}i=i||{start:0,end:0}}else i=null;for(Jm={focusedElem:e,selectionRange:i},os=!1,a=(a&335544064)===a,Jt=t,t=a?9270:1024;Jt!==null;){if(e=Jt,a&&(i=e.deletions,i!==null))for(s=0;s<i.length;s++)a&&Dm(i[s]);if(e.alternate===null&&(e.flags&2)!==0)a&&Nv(e),Bc(a);else{if(e.tag===22){if(i=e.alternate,e.memoizedState!==null){i!==null&&i.memoizedState===null&&a&&Dm(i),Bc(a);continue}else if(i!==null&&i.memoizedState!==null){a&&Nv(e),Bc(a);continue}}i=e.child,(e.subtreeFlags&t)!==0&&i!==null?(i.return=e,Jt=i):(a&&Ww(e),Bc(a))}}qa=null}function Bc(e){for(;Jt!==null;){var t=Jt,a=e,i=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((r&1024)!==0&&i!==null){a=void 0,r=i.memoizedProps,i=i.memoizedState;var s=t.stateNode;try{var c=Dr(t.type,r);a=s.getSnapshotBeforeUpdate(c,i),s.__reactInternalSnapshotBeforeUpdate=a}catch(d){ut(t,t.return,d)}}break;case 3:if((r&1024)!==0){if(i=t.stateNode.containerInfo,a=i.nodeType,a===9)ep(i);else if(a===1)switch(i.nodeName){case"HEAD":case"HTML":case"BODY":ep(i);break;default:i.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&i!==null&&(a=gi(i.memoizedProps,i.stateNode),r=t.memoizedProps,r=xi(r.default,r.update),r!=="none"&&us(i,a,r,i.memoizedState=[],!0));break;default:if((r&1024)!==0)throw Error(U(163))}if(i=t.sibling,i!==null){i.return=t.return,Jt=i;break}Jt=t.return}}function a0(e,t,a){var i=a.flags;switch(a.tag){case 0:case 11:case 15:Un(e,a),i&4&&ql(5,a);break;case 1:if(Un(e,a),i&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){ut(a,a.return,c)}else{var r=Dr(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(r,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){ut(a,a.return,c)}}i&64&&Zw(a),i&512&&Ln(a,a.return);break;case 3:if(Un(e,a),i&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{iw(e,t)}catch(c){ut(a,a.return,c)}}break;case 27:t===null&&i&4&&Jw(a);case 26:case 5:Un(e,a),t===null&&i&4&&zm(a),i&512&&Ln(a,a.return);break;case 12:Un(e,a);break;case 31:Un(e,a),i&4&&o0(e,a);break;case 13:Un(e,a),i&4&&s0(e,a),i&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=gS.bind(null,a),ZS(e,a))));break;case 22:if(i=a.memoizedState!==null||Ft,!i){var s=t!==null&&t.memoizedState!==null||st;t=Ft,r=st,Ft=i,(st=s)&&!r?(i=2,(a.subtreeFlags&8772)!==0&&(i|=1),vn(e,a,i)):Un(e,a),Ft=t,st=r}break;case 30:Un(e,a),i&512&&Ln(a,a.return);break;case 7:i&512&&Ln(a,a.return);default:Un(e,a)}}function Um(e,t){for(e=e.child;e!==null;)n0(e,t),e=e.sibling}function n0(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var i=a.style;typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"}else{var r=e.stateNode,s=e.memoizedProps.style,c=s!=null&&s.hasOwnProperty("display")?s.display:null;r.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){ut(e,e.return,h)}Lm(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,We=!0}catch(h){ut(e,e.return,h)}break;case 18:try{var d=e.stateNode;t?qv(d,!0):qv(e.stateNode,!1)}catch(h){ut(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&Um(e,t);break;default:Um(e,t)}}function Lm(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,i=t;switch(a.tag){case 4:n0(a,i);break e;case 22:a.memoizedState===null&&Lm(a,i);break e;default:Lm(a,i)}}e=e.sibling}}function i0(e){var t=e.alternate;t!==null&&(e.alternate=null,i0(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Yd(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Ct=null,Aa=!1;function bn(e,t,a){for(a=a.child;a!==null;)r0(e,t,a),a=a.sibling}function r0(e,t,a){if(Ya&&typeof Ya.onCommitFiberUnmount=="function")try{Ya.onCommitFiberUnmount(Ol,a)}catch{}switch(a.tag){case 26:st||aa(a,t),bn(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!st&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:st||aa(a,t),ml(a);var i=Ct,r=Aa;or(a.type)&&(Ct=a.stateNode,Aa=!1),bn(e,t,a),P0(a.stateNode,a.type,a.memoizedProps),Ct=i,Aa=r;break;case 5:st||aa(a,t),ml(a);case 6:if(a.tag===6&&ml(a),i=Ct,r=Aa,Ct=null,bn(e,t,a),Ct=i,Aa=r,Ct!==null)if(Aa)try{(Ct.nodeType===9?Ct.body:Ct.nodeName==="HTML"?Ct.ownerDocument.body:Ct).removeChild(a.stateNode),We=!0}catch(s){ut(a,t,s)}else try{Ct.removeChild(a.stateNode),We=!0}catch(s){ut(a,t,s)}break;case 18:Ct!==null&&(Aa?(e=Ct,Lv(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),ss(e)):Lv(Ct,a.stateNode));break;case 4:i=Ct,r=Aa,Ct=a.stateNode.containerInfo,Aa=!0,bn(e,t,a),Ct=i,Aa=r;break;case 0:case 11:case 14:case 15:nr(2,a,t),st||nr(4,a,t),bn(e,t,a);break;case 1:st||(aa(a,t),i=a.stateNode,typeof i.componentWillUnmount=="function"&&Qw(a,t,i)),bn(e,t,a);break;case 21:bn(e,t,a);break;case 22:st=(i=st)||a.memoizedState!==null,bn(e,t,a),st=i;break;case 30:aa(a,t),bn(e,t,a);break;case 7:st||aa(a,t),bn(e,t,a);break;default:bn(e,t,a)}}function o0(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{ss(e)}catch(a){ut(t,t.return,a)}}}function s0(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{ss(e)}catch(a){ut(t,t.return,a)}}function iS(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new kv),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new kv),t;default:throw Error(U(435,e.tag))}}function jc(e,t){var a=iS(e);t.forEach(function(i){if(!a.has(i)){a.add(i);var r=fS.bind(null,e,i);i.then(r,r)}})}function $a(e,t,a){var i=t.deletions;if(i!==null)for(var r=0;r<i.length;r++){var s=i[r],c=e,d=t,h=d;e:for(;h!==null;){switch(h.tag){case 27:if(or(h.type)){Ct=h.stateNode,Aa=!1;break e}break;case 5:Ct=h.stateNode,Aa=!1;break e;case 3:case 4:Ct=h.stateNode.containerInfo,Aa=!0;break e}h=h.return}if(Ct===null)throw Error(U(160));r0(c,d,s),Ct=null,Aa=!1,c=s.alternate,c!==null&&(c.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)l0(t,e,a),t=t.sibling}var yn=null;function l0(e,t,a){var i=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(r&4&&(i=e.updateQueue,i=i!==null?i.events:null,i!==null))for(var s=0;s<i.length;s++){var c=i[s];c.ref.impl=c.nextImpl}$a(t,e,a),Na(e),r&4&&(nr(3,e,e.return),ql(3,e),nr(5,e,e.return));break;case 1:$a(t,e,a),Na(e),r&512&&(st||i===null||aa(i,i.return)),r&64&&Ft&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(s=yn,$a(t,e,a),Na(e),r&512&&(st||i===null||aa(i,i.return)),r&4)if(r=i!==null?i.memoizedState:null,a=e.memoizedState,i===null)if(a===null)if(e.stateNode===null)if(Ft)e.stateNode=I0(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,r=s.ownerDocument||s;t:switch(t){case"title":i=r.getElementsByTagName("title")[0],(!i||i[_l]||i[na]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=r.createElement(t),r.head.insertBefore(i,r.querySelector("head > title"))),sa(i,t,a),i[na]=e,Kt(i),t=i;break e;case"link":if(s=Qv("link","href",r).get(t+(a.href||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&i.getAttribute("rel")===(a.rel==null?null:a.rel)&&i.getAttribute("title")===(a.title==null?null:a.title)&&i.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(c,1);break t}}i=r.createElement(t),sa(i,t,a),r.head.appendChild(i);break;case"meta":if(s=Qv("meta","content",r).get(t+(a.content||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("content")===(a.content==null?null:""+a.content)&&i.getAttribute("name")===(a.name==null?null:a.name)&&i.getAttribute("property")===(a.property==null?null:a.property)&&i.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&i.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(c,1);break t}}i=r.createElement(t),sa(i,t,a),r.head.appendChild(i);break;default:throw Error(U(468,t))}i[na]=e,Kt(i),t=i}e.stateNode=t}else Ft||np(s,e.type,e.stateNode);else e.stateNode=Zv(s,a,e.memoizedProps);else r!==a?(r===null?(t=i.stateNode,t===null||st||t.parentNode.removeChild(t)):r.count--,a===null?Ft||np(s,e.type,e.stateNode):Zv(s,a,e.memoizedProps)):a===null&&e.stateNode!==null&&Hh(e,e.memoizedProps,i.memoizedProps);break;case 27:$a(t,e,a),Na(e),r&512&&(st||i===null||aa(i,i.return)),i!==null&&r&4&&Hh(e,e.memoizedProps,i.memoizedProps);break;case 5:if(s=_n,_n=!1,$a(t,e,a),_n=s,Na(e),r&512&&(st||i===null||aa(i,i.return)),e.flags&32){t=e.stateNode;try{Jo(t,""),We=!0}catch(b){ut(e,e.return,b)}}r&4&&e.stateNode!=null&&(t=e.memoizedProps,Hh(e,t,i!==null?i.memoizedProps:t)),r&1024&&(Lh=!0);break;case 6:if($a(t,e,a),Na(e),r&4){if(e.stateNode===null)throw Error(U(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,We=!0}catch(b){ut(e,e.return,b)}}break;case 3:if(We=!1,dd=null,s=yn,yn=Al(t.containerInfo),$a(t,e,a),yn=s,Na(e),r&4&&i!==null&&i.memoizedState.isDehydrated)try{ss(t.containerInfo)}catch(b){ut(e,e.return,b)}Lh&&(Lh=!1,c0(e)),We=!1;break;case 4:r=_n,_n=Ft,i=Mb(),s=yn,yn=Al(e.stateNode.containerInfo),$a(t,e,a),Na(e),yn=s,We&&nl&&(Od=!0),We=i,_n=r;break;case 12:$a(t,e,a),Na(e);break;case 31:$a(t,e,a),Na(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,jc(e,t)));break;case 13:$a(t,e,a),Na(e),e.child.flags&8192&&e.memoizedState!==null!=(i!==null&&i.memoizedState!==null)&&(nu=ja()),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,jc(e,t)));break;case 22:s=e.memoizedState!==null,c=i!==null&&i.memoizedState!==null;var d=Ft,h=st,p=_n;Ft=d||s,_n=p||s,st=h||c,$a(t,e,a),st=h,_n=p,Ft=d,Na(e),r&8192&&(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,!s||i===null||c||Ft||st||(t=c||st,a=Ft,i=st,Ft=s||Ft,st=t,Oi(e,2),Ft=a,st=i),!s&&_n||Um(e,s)),r&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,jc(e,a))));break;case 19:$a(t,e,a),Na(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,jc(e,t)));break;case 30:r&512&&(st||i===null||aa(i,i.return)),r=Mb(),s=nl,c=(a&335544064)===a,d=e.memoizedProps,nl=c&&xi(d.default,d.update)!=="none",$a(t,e,a),Na(e),c&&i!==null&&We&&(e.flags|=4),nl=s,We=r;break;case 21:break;case 7:r&512&&(st||i===null||aa(i,i.return)),i&&i.stateNode!==null&&(i.stateNode._fragmentFiber=e);default:$a(t,e,a),Na(e)}}function Na(e){var t=e.flags;if(t&2){try{for(var a,i=e.return;i!==null;){if(Fw(i)){a=i;break}i=i.return}i=null;for(var r=e.return;r!==null;){if(jp(r)){var s=r.stateNode;i===null?i=[s]:i.push(s)}if(Bp(r))break;r=r.return}var c=i;if(a==null)throw Error(U(160));switch(a.tag){case 27:var d=a.stateNode,h=Uh(e);zd(e,h,d,c);break;case 5:var p=a.stateNode;a.flags&32&&(Jo(p,""),a.flags&=-33);var b=Uh(e);zd(e,b,p,c);break;case 3:case 4:var $=a.stateNode.containerInfo,f=Uh(e);Vm(e,f,$,c);break;default:throw Error(U(161))}}catch(y){ut(e,e.return,y)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function c0(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;c0(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,os=!0,t.reset(),os=!1),e=e.sibling}}function No(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)d0(t,e),t=t.sibling;else t0(t,!1)}function d0(e,t){var a=e.alternate;if(a===null)Om(e,!1);else switch(e.tag){case 3:if(Hm=Hn=!1,Sv(),No(t,e),!Hn&&!Od){if(e=qn,e!==null)for(var i=0;i<e.length;i+=3){a=e[i];var r=e[i+1];_0(a,e[i+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+r+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),Hm=!0}qn=null;break;case 5:No(t,e);break;case 4:i=Hn,Hn=!1,No(t,e),Hn&&(Od=!0),Hn=i;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Om(e,!1):No(t,e));break;case 30:i=Hn,r=Sv(),Hn=!1,No(t,e),Hn&&(e.flags|=4);var s=e.memoizedProps,c=e.stateNode;t=gi(s,c),c=gi(a.memoizedProps,c);var d=xi(s.default,s.update);d==="none"?t=!1:(s=a.memoizedState,a.memoizedState=null,a=e.child,Ma=0,t=Yp(e,a,t,c,d,s,!0),Ma!==(s===null?0:s.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(es(e,e.memoizedProps.onUpdate),qn=r):r!==null&&(r.push.apply(r,qn),qn=r),Hn=(e.flags&32)!==0?!0:i;break;default:No(t,e)}}function Un(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)a0(e,t.alternate,t),t=t.sibling}function Oi(e,t){for(e=e.child;e!==null;){var a=e,i=t;switch(a.tag){case 0:case 11:case 14:case 15:nr(4,a,a.return),Oi(a,i);break;case 1:aa(a,a.return);var r=a.stateNode;typeof r.componentWillUnmount=="function"&&Qw(a,a.return,r),Oi(a,i);break;case 27:(i&2)!==0&&P0(a.stateNode,a.type,a.memoizedProps);case 5:aa(a,a.return),a.tag!==5&&a.tag!==27||ml(a),Oi(a,i);break;case 6:ml(a);break;case 26:aa(a,a.return),r=a.stateNode,a.memoizedState!==null||r===null||st||r.parentNode.removeChild(r),Oi(a,i);break;case 22:a.memoizedState===null&&Oi(a,i);break;case 30:aa(a,a.return),Oi(a,i);break;case 7:aa(a,a.return);default:Oi(a,i)}e=e.sibling}}function vn(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var i=t.alternate,r=e,s=t,c=s.flags,d=(a&1)!==0;switch(s.tag){case 0:case 11:case 15:vn(r,s,a),ql(4,s);break;case 1:if(vn(r,s,a),i=s,r=i.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(b){ut(i,i.return,b)}if(i=s,r=i.updateQueue,r!==null){var h=i.stateNode;try{var p=r.shared.hiddenCallbacks;if(p!==null)for(r.shared.hiddenCallbacks=null,r=0;r<p.length;r++)nw(p[r],h)}catch(b){ut(i,i.return,b)}}d&&c&64&&Zw(s),Ln(s,s.return);break;case 27:(a&2)!==0&&Jw(s);case 5:s.tag!==5&&s.tag!==27||$v(s),vn(r,s,a),d&&i===null&&c&4&&zm(s),Ln(s,s.return);break;case 6:$v(s);break;case 26:h=s.stateNode,s.memoizedState!==null||h===null||Ft||np(Al(h.ownerDocument),s.type,h),vn(r,s,a),d&&i===null&&c&4&&zm(s),Ln(s,s.return);break;case 12:vn(r,s,a);break;case 31:vn(r,s,a),d&&c&4&&o0(r,s);break;case 13:vn(r,s,a),d&&c&4&&s0(r,s);break;case 22:s.memoizedState===null&&vn(r,s,a),Ln(s,s.return);break;case 30:vn(r,s,a),Ln(s,s.return);break;case 7:Ln(s,s.return);default:vn(r,s,a)}t=t.sibling}}function Gp(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Ul(a))}function Pp(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Ul(e))}function Wa(e,t,a,i){var r=(a&335544064)===a;if(t.subtreeFlags&(r?10262:10256))for(t=t.child;t!==null;)u0(e,t,a,i),t=t.sibling;else r&&e0(t)}function u0(e,t,a,i){var r=(a&335544064)===a;r&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&od(t);var s=t.flags;switch(t.tag){case 0:case 11:case 15:Wa(e,t,a,i),s&2048&&ql(9,t);break;case 1:Wa(e,t,a,i);break;case 3:Wa(e,t,a,i),r&&Hm&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),s&2048&&(s=null,t.alternate!==null&&(s=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==s&&(t.refCount++,s!=null&&Ul(s)));break;case 12:if(s&2048){Wa(e,t,a,i),s=t.stateNode;try{var c=t.memoizedProps,d=c.id,h=c.onPostCommit;typeof h=="function"&&h(d,t.alternate===null?"mount":"update",s.passiveEffectDuration,-0)}catch(p){ut(t,t.return,p)}}else Wa(e,t,a,i);break;case 31:Wa(e,t,a,i);break;case 13:Wa(e,t,a,i);break;case 23:break;case 22:c=t.stateNode,d=t.alternate,t.memoizedState!==null?(r&&d!==null&&d.memoizedState===null&&od(d),c._visibility&2?Wa(e,t,a,i):pl(e,t)):(r&&d!==null&&d.memoizedState!==null&&od(t),c._visibility&2?Wa(e,t,a,i):(c._visibility|=2,ko(e,t,a,i,(t.subtreeFlags&10256)!==0||!1))),s&2048&&Gp(d,t);break;case 24:Wa(e,t,a,i),s&2048&&Pp(t.alternate,t);break;case 30:r&&(s=t.alternate,s!==null&&(Zn(s.child,!0),Zn(t.child,!0))),Wa(e,t,a,i);break;default:Wa(e,t,a,i)}}function ko(e,t,a,i,r){for(r=r&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var s=e,c=t,d=a,h=i,p=c.flags;switch(c.tag){case 0:case 11:case 15:ko(s,c,d,h,r),ql(8,c);break;case 23:break;case 22:var b=c.stateNode;c.memoizedState!==null?b._visibility&2?ko(s,c,d,h,r):pl(s,c):(b._visibility|=2,ko(s,c,d,h,r)),r&&p&2048&&Gp(c.alternate,c);break;case 24:ko(s,c,d,h,r),r&&p&2048&&Pp(c.alternate,c);break;default:ko(s,c,d,h,r)}t=t.sibling}}function pl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,i=t,r=i.flags;switch(i.tag){case 22:pl(a,i),r&2048&&Gp(i.alternate,i);break;case 24:pl(a,i),r&2048&&Pp(i.alternate,i);break;default:pl(a,i)}t=t.sibling}}var $r=8192;function yr(e,t,a){if(e.subtreeFlags&$r)for(e=e.child;e!==null;)h0(e,t,a),e=e.sibling}function h0(e,t,a){switch(e.tag){case 26:yr(e,t,a),e.flags&$r&&(e.memoizedState!==null?lk(a,yn,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Jv(a,e)));break;case 5:yr(e,t,a),e.flags&$r&&(e=e.stateNode,(t&335544128)===t&&Jv(a,e));break;case 3:case 4:var i=yn;yn=Al(e.stateNode.containerInfo),yr(e,t,a),yn=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=$r,$r=16777216,yr(e,t,a),$r=i):yr(e,t,a));break;case 30:if((e.flags&$r)!==0&&(i=e.memoizedProps.name,i!=null&&i!=="auto")){var r=e.stateNode;r.paired=null,qa===null&&(qa=new Map),qa.set(i,r)}yr(e,t,a);break;default:yr(e,t,a)}}function m0(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Fs(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];Jt=i,g0(i,e)}m0(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)p0(e),e=e.sibling}function p0(e){switch(e.tag){case 0:case 11:case 15:Fs(e),e.flags&2048&&nr(9,e,e.return);break;case 3:Fs(e);break;case 12:Fs(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,sd(e)):Fs(e);break;default:Fs(e)}}function sd(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];Jt=i,g0(i,e)}m0(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:nr(8,t,t.return),sd(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,sd(t));break;default:sd(t)}e=e.sibling}}function g0(e,t){for(;Jt!==null;){var a=Jt;switch(a.tag){case 0:case 11:case 15:nr(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var i=a.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:Ul(a.memoizedState.cache)}if(i=a.child,i!==null)i.return=a,Jt=i;else e:for(a=e;Jt!==null;){i=Jt;var r=i.sibling,s=i.return;if(i0(i),i===a){Jt=null;break e}if(r!==null){r.return=s,Jt=r;break e}Jt=s}}}var rS={getCacheForType:function(e){var t=ia(jt),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return ia(jt).controller.signal}},oS=typeof WeakMap=="function"?WeakMap:Map,et=0,pt=null,De=null,je=0,ct=0,Ha=null,qi=!1,hs=!1,Xp=!1,yi=0,It=0,ir=0,Ar=0,Id=0,Ba=0,Wo=0,gl=null,Ra=null,qm=!1,nu=0,f0=0,Dd=1/0,_d=null,Fi=null,Mt=0,xn=null,_r=null,Xn=0,Bm=0,jm=null,b0=null,Po=null,Xo=null,Zo=null,fl=0,ld=null;function Pa(){return(et&2)!==0&&je!==0?je&-je:xe.T!==null?Qp():xy()}function v0(){if(Ba===0)if((je&536870912)===0||ze){var e=Rc;Rc<<=1,(Rc&3932160)===0&&(Rc=262144),Ba=e}else Ba=536870912;return e=la.current,e!==null&&(e.flags|=32),Ba}function es(e,t){if(t!=null){var a=e.stateNode,i=a.ref;i===null&&(i=a.ref=U0(gi(e.memoizedProps,a))),Xo===null&&(Xo=[]),Xo.push(t.bind(null,i))}}function Va(e,t,a){(e===pt&&(ct===2||ct===9)||e.cancelPendingCommit!==null)&&(ts(e,0),Bi(e,je,Ba,!1)),Dl(e,a),((et&2)===0||e!==pt)&&(e===pt&&((et&2)===0&&(Ar|=a),It===4&&Bi(e,je,Ba,!1)),Fn(e))}function y0(e,t,a){if((et&6)!==0)throw Error(U(327));var i=!a&&(t&127)===0&&(t&e.expiredLanes)===0||Il(e,t),r=i?cS(e,t):qh(e,t,!0),s=i;do{if(r===0){hs&&!i&&Bi(e,t,0,!1);break}else{if(a=e.current.alternate,s&&!sS(a)){r=qh(e,t,!1),s=!1;continue}if(r===2){if(s=t,e.errorRecoveryDisabledLanes&s)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var d=e;r=gl;var h=d.current.memoizedState.isDehydrated;if(h&&(ts(d,c).flags|=256),c=qh(d,c,!1),c!==2&&c!==6){if(Xp&&!h){d.errorRecoveryDisabledLanes|=s,Ar|=s,r=4;break e}s=Ra,Ra=r,s!==null&&(Ra===null?Ra=s:Ra.push.apply(Ra,s))}r=c}if(s=!1,r!==2)continue}}if(r===1){ts(e,0),Bi(e,t,0,!0);break}e:{switch(i=e,s=r,s){case 0:case 1:throw Error(U(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:Bi(i,t,Ba,!qi);break e;case 2:Ra=null;break;case 3:case 5:break;default:throw Error(U(329))}if((t&62914560)===t&&(r=nu+300-ja(),10<r)){if(Bi(i,t,Ba,!qi),jd(i,0,!0)!==0)break e;Xn=t,i.timeoutHandle=Jp(Cv.bind(null,i,a,Ra,_d,qm,t,Ba,Ar,Wo,qi,s,"Throttled",-0,0),r);break e}Cv(i,a,Ra,_d,qm,t,Ba,Ar,Wo,qi,s,null,-0,0)}}break}while(!0);Fn(e)}function Cv(e,t,a,i,r,s,c,d,h,p,b,$,f,y){e.timeoutHandle=-1;var V=t.subtreeFlags,z=(s&335544064)===s;if($=null,(z||V&8192||(V&16785408)===16785408)&&($={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:jn},qa=null,h0(t,s,$),z&&(V=$,z=e.containerInfo,z=(z.nodeType===9?z:z.ownerDocument).__reactViewTransition,z!=null&&(V.count++,V.waitingForViewTransition=!0,V=Rl.bind(V),z.finished.then(V,V))),V=(s&62914560)===s?nu-ja():(s&4194048)===s?f0-ja():0,V=ck($,V),V!==null)){Xn=s,e.cancelPendingCommit=V(Ev.bind(null,e,t,s,a,i,r,c,d,h,p,b,$,null,f,y)),Bi(e,s,c,!p);return}Ev(e,t,s,a,i,r,c,d,h,p,b,$)}function sS(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var i=0;i<a.length;i++){var r=a[i],s=r.getSnapshot;r=r.value;try{if(!Xa(s(),r))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Bi(e,t,a,i){t=fy(e,t),t&=~Id,t&=~Ar,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var r=t;0<r;){var s=31-Ga(r),c=1<<s;i[s]=-1,r&=~c}a!==0&&vy(e,a,t)}function iu(){return(et&6)===0?(Bl(0,!1),!1):!0}function Zp(){if(De!==null){if(ct===0)var e=De.return;else e=De,ui=Br=null,Mp(e),jo=null,Nl=0,e=De;for(;e!==null;)Xw(e.alternate,e),e=e.return;De=null}}function ts(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,AS(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),Xn=0,Zp(),pt=e,De=a=hi(e.current,null),je=t,ct=0,Ha=null,qi=!1,hs=Il(e,t),Xp=!1,Wo=Ba=Id=Ar=ir=It=0,Ra=gl=null,qm=!1,yi=fy(e,t),Zd(),a}function w0(e,t){Ce=null,xe.H=Ad,t===ds||t===Jd?(t=Wb(),ct=3):t===Np?(t=Wb(),ct=4):ct=t===Up?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Ha=t,De===null&&(It=1,Rd(e,rn(t,e.current)))}function x0(){var e=la.current;return e===null?!0:(je&4194048)===je?pa===null:(je&62914560)===je||(je&536870912)!==0?e===pa:!1}function $0(){var e=xe.H;return xe.H=Ad,e===null?Ad:e}function N0(){var e=xe.A;return xe.A=rS,e}function Hd(){It=4,qi||(je&4194048)!==je&&la.current!==null||(hs=!0),(ir&134217727)===0&&(Ar&134217727)===0||pt===null||Bi(pt,je,Ba,!1)}function qh(e,t,a){var i=et;et|=2;var r=$0(),s=N0();(pt!==e||je!==t)&&(_d=null,ts(e,t)),t=!1;var c=It;e:do try{if(ct!==0&&De!==null){var d=De,h=Ha;switch(ct){case 8:Zp(),c=6;break e;case 3:case 2:case 9:case 6:la.current===null&&(t=!0);var p=ct;if(ct=0,Ha=null,Ho(e,d,h,p),a&&hs){c=0;break e}break;default:p=ct,ct=0,Ha=null,Ho(e,d,h,p)}}lS(),c=It;break}catch(b){w0(e,b)}while(!0);return t&&e.shellSuspendCounter++,ui=Br=null,et=i,xe.H=r,xe.A=s,De===null&&(pt=null,je=0,Zd()),c}function lS(){for(;De!==null;)S0(De)}function cS(e,t){var a=et;et|=2;var i=$0(),r=N0();pt!==e||je!==t?(_d=null,Dd=ja()+500,ts(e,t)):hs=Il(e,t);e:do try{if(ct!==0&&De!==null){t=De;var s=Ha;t:switch(ct){case 1:ct=0,Ha=null,Ho(e,t,s,1);break;case 2:case 9:if(Kb(s)){ct=0,Ha=null,Tv(t);break}t=function(){ct!==2&&ct!==9||pt!==e||(ct=7),Fn(e)},s.then(t,t);break e;case 3:ct=7;break e;case 4:ct=5;break e;case 7:Kb(s)?(ct=0,Ha=null,Tv(t)):(ct=0,Ha=null,Ho(e,t,s,7));break;case 5:var c=null;switch(De.tag){case 26:c=De.memoizedState;case 5:case 27:var d=De;if(c?Q0(c):d.stateNode.complete){ct=0,Ha=null;var h=d.sibling;if(h!==null)De=h;else{var p=d.return;p!==null?(De=p,ru(p)):De=null}break t}}ct=0,Ha=null,Ho(e,t,s,5);break;case 6:ct=0,Ha=null,Ho(e,t,s,6);break;case 8:Zp(),It=6;break e;default:throw Error(U(462))}}dS();break}catch(b){w0(e,b)}while(!0);return ui=Br=null,xe.H=i,xe.A=r,et=a,De!==null?0:(pt=null,je=0,Zd(),It)}function dS(){for(;De!==null&&!T5();)S0(De)}function S0(e){var t=Pw(e.alternate,e,yi);e.memoizedProps=e.pendingProps,t===null?ru(e):De=t}function Tv(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=gv(a,t,t.pendingProps,t.type,void 0,je);break;case 11:t=gv(a,t,t.pendingProps,t.type.render,t.ref,je);break;case 5:Mp(t);var i=t;i===Wt&&(ze?($d(i),i.tag===5&&i.stateNode!=null&&(wt=i.stateNode)):($d(i),ze=!0));default:Xw(a,t),t=De=Zy(t,yi),t=Pw(a,t,yi)}e.memoizedProps=e.pendingProps,t===null?ru(e):De=t}function Ho(e,t,a,i){ui=Br=null,Mp(t),jo=null,Nl=0;var r=t.return;try{if(JN(e,r,t,a,je)){It=1,Rd(e,rn(a,e.current)),De=null;return}}catch(s){if(r!==null)throw De=r,s;It=1,Rd(e,rn(a,e.current)),De=null;return}t.flags&32768?(ze||i===1?e=!0:hs||(je&536870912)!==0?e=!1:(qi=e=!0,(i===2||i===9||i===3||i===6)&&(i=la.current,i!==null&&i.tag===13&&(i.flags|=16384))),k0(t,e)):ru(t)}function ru(e){var t=e;do{if((t.flags&32768)!==0){k0(t,qi);return}e=t.return;var a=tS(t.alternate,t,yi);if(a!==null){De=a;return}if(t=t.sibling,t!==null){De=t;return}De=t=e}while(t!==null);It===0&&(It=5)}function k0(e,t){do{var a=aS(e.alternate,e);if(a!==null){a.flags&=32767,De=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){De=e;return}De=e=a}while(e!==null);It=6,De=null}function Ev(e,t,a,i,r,s,c,d,h,p,b,$){e.cancelPendingCommit=null;do ou();while(Mt!==0);if((et&6)!==0)throw Error(U(327));if(t!==null){if(t===e.current)throw Error(U(177));e===pt&&(De=pt=null,je=0),_r=t,xn=e,Xn=a,jm=r,b0=i,uS(e,t,a,c,d,h,$)}}function uS(e,t,a,i,r,s,c){var d=t.lanes|t.childLanes;if(Bm=d,d|=bp,_5(e,a,d,i,r,s),Xo=null,(a&335544064)===a?(Zo=UN(e),i=10262):(Zo=null,i=10256),(t.subtreeFlags&i)!==0||(t.flags&i)!==0?(e.callbackNode=null,e.callbackPriority=0,bS(bd,function(){return Xm(),null})):(e.callbackNode=null,e.callbackPriority=0),Vd=!1,i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=xe.T,xe.T=null,r=tt.p,tt.p=2,s=et,et|=4;try{nS(e,t,a)}finally{et=s,tt.p=r,xe.T=i}}Mt=1,Vd?Po=IS(c,e.containerInfo,Zo,Ym,Gm,mS,Pm,Xm,hS,null,null):(Ym(),Gm(),Pm())}function hS(e){if(Mt!==0){var t=xn.onRecoverableError;t(e,{componentStack:null})}}function mS(){Mt===3&&(Mt=0,d0(_r,xn),Mt=4)}function Ym(){if(Mt===1){Mt=0;var e=xn,t=_r,a=Xn,i=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||i){i=xe.T,xe.T=null;var r=tt.p;tt.p=2;var s=et;et|=4;try{nl=Od=!1,l0(t,e,a),a=Jm;var c=Ly(e.containerInfo),d=a.focusedElem,h=a.selectionRange;if(c!==d&&d&&d.ownerDocument&&Uy(d.ownerDocument.documentElement,d)){if(h!==null&&fp(d)){var p=h.start,b=h.end;if(b===void 0&&(b=p),"selectionStart"in d)d.selectionStart=p,d.selectionEnd=Math.min(b,d.value.length);else{var $=d.ownerDocument||document,f=$&&$.defaultView||window;if(f.getSelection){var y=f.getSelection(),V=d.textContent.length,z=Math.min(h.start,V),O=h.end===void 0?z:Math.min(h.end,V);!y.extend&&z>O&&(c=O,O=z,z=c);var N=Yb(d,z),v=Yb(d,O);if(N&&v&&(y.rangeCount!==1||y.anchorNode!==N.node||y.anchorOffset!==N.offset||y.focusNode!==v.node||y.focusOffset!==v.offset)){var w=$.createRange();w.setStart(N.node,N.offset),y.removeAllRanges(),z>O?(y.addRange(w),y.extend(v.node,v.offset)):(w.setEnd(v.node,v.offset),y.addRange(w))}}}}for($=[],y=d;y=y.parentNode;)y.nodeType===1&&$.push({element:y,left:y.scrollLeft,top:y.scrollTop});for(typeof d.focus=="function"&&d.focus(),d=0;d<$.length;d++){var A=$[d];A.element.scrollLeft=A.left,A.element.scrollTop=A.top}}os=!!Fm,Jm=Fm=null}finally{et=s,tt.p=r,xe.T=i}}e.current=t,Mt=2}}function Gm(){if(Mt===2){Mt=0;var e=xn,t=_r,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=xe.T,xe.T=null;var i=tt.p;tt.p=2;var r=et;et|=4;try{a0(e,t.alternate,t)}finally{et=r,tt.p=i,xe.T=a}}Mt=3}}function Pm(){if(Mt===4||Mt===3){Mt=0;var e=Po;Po=null,E5();var t=xn,a=_r,i=Xn,r=b0,s=(i&335544064)===i?10262:10256;if((a.subtreeFlags&s)!==0||(a.flags&s)!==0?Mt=5:(Mt=0,_r=xn=null,C0(t,t.pendingLanes)),s=t.pendingLanes,s===0&&(Fi=null),dp(i),a=a.stateNode,Ya&&typeof Ya.onCommitFiberRoot=="function")try{Ya.onCommitFiberRoot(Ol,a,void 0,(a.current.flags&128)===128)}catch{}if(r!==null){a=xe.T,s=tt.p,tt.p=2,xe.T=null;try{for(var c=t.onRecoverableError,d=0;d<r.length;d++){var h=r[d];c(h.value,{componentStack:h.stack})}}finally{xe.T=a,tt.p=s}}if(r=Xo,c=Zo,Zo=null,r!==null&&(Xo=null,c===null&&(c=[]),e!==null))for(h=0;h<r.length;h++)a=(0,r[h])(c),a!==void 0&&e.finished.finally(a);(Xn&3)!==0&&ou(),Fn(t),s=t.pendingLanes,(i&261930)!==0&&(s&42)!==0?t===ld?fl++:(fl=0,ld=t):(fl=0,ld=null),Bl(0,!1)}}function C0(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Ul(t)))}function ou(){return Po!==null&&(Po.skipTransition(),Po=null),Ym(),Gm(),Pm(),Xm()}function Xm(){if(Mt!==5)return!1;var e=xn,t=Bm;Bm=0;var a=dp(Xn),i=xe.T,r=tt.p;try{tt.p=32>a?32:a,xe.T=null,a=jm,jm=null;var s=xn,c=Xn;if(Mt=0,_r=xn=null,Xn=0,(et&6)!==0)throw Error(U(331));var d=et;if(et|=4,p0(s.current),u0(s,s.current,c,a),et=d,Bl(0,!1),Ya&&typeof Ya.onPostCommitFiberRoot=="function")try{Ya.onPostCommitFiberRoot(Ol,s)}catch{}return!0}finally{tt.p=r,xe.T=i,C0(e,t)}}function Av(e,t,a){t=rn(a,t),t=Cm(e.stateNode,t,2),e=Xi(e,t,2),e!==null&&(Dl(e,2),Fn(e))}function ut(e,t,a){if(e.tag===3)Av(e,e,a);else for(;t!==null;){if(t.tag===3){Av(t,e,a);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Fi===null||!Fi.has(i))){e=rn(a,e),a=qw(2),i=Xi(t,a,2),i!==null&&(Bw(a,i,t,e),Dl(i,2),Fn(i));break}}t=t.return}}function Bh(e,t,a){var i=e.pingCache;if(i===null){i=e.pingCache=new oS;var r=new Set;i.set(t,r)}else r=i.get(t),r===void 0&&(r=new Set,i.set(t,r));r.has(a)||(Xp=!0,r.add(a),e=pS.bind(null,e,t,a),t.then(e,e))}function pS(e,t,a){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,pt===e&&(je&a)===a&&((It===4||It===3&&(je&62914560)===je&&300>ja()-nu)&&(et&2)===0?ts(e,0):Id|=a,Wo===je&&(Wo=0)),Fn(e)}function T0(e,t){t===0&&(t=by()),e=qr(e,t),e!==null&&(Dl(e,t),Fn(e))}function gS(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),T0(e,a)}function fS(e,t){var a=0;switch(e.tag){case 31:case 13:var i=e.stateNode,r=e.memoizedState;r!==null&&(a=r.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(U(314))}i!==null&&i.delete(t),T0(e,a)}function bS(e,t){return lp(e,t)}var as=null,Co=null,Zm=!1,Ud=!1,jh=!1,ji=0;function Fn(e){e!==Co&&e.next===null&&(Co===null?as=Co=e:Co=Co.next=e),Ud=!0,Zm||(Zm=!0,yS())}function Bl(e,t){if(!jh&&Ud){jh=!0;do for(var a=!1,i=as;i!==null;){if(!t)if(e!==0){var r=i.pendingLanes;if(r===0)var s=0;else{var c=i.suspendedLanes,d=i.pingedLanes;s=(1<<31-Ga(42|e)+1)-1,s&=r&~(c&~d),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,Rv(i,s))}else s=je,s=jd(i,i===pt?s:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(s&3)===0||Il(i,s)||(a=!0,Rv(i,s));i=i.next}while(a);jh=!1}}function vS(){E0()}function E0(){Ud=Zm=!1;var e=0;ji!==0&&ES()&&(e=ji);for(var t=ja(),a=null,i=as;i!==null;){var r=i.next,s=A0(i,t);s===0?(i.next=null,a===null?as=r:a.next=r,r===null&&(Co=a)):(a=i,(e!==0||(s&3)!==0)&&(Ud=!0)),i=r}Mt!==0&&Mt!==5||Bl(e,!1),ji!==0&&(ji=0)}function A0(e,t){for(var a=e.suspendedLanes,i=e.pingedLanes,r=e.expirationTimes,s=e.pendingLanes&-62914561;0<s;){var c=31-Ga(s),d=1<<c,h=r[c];h===-1?((d&a)===0||(d&i)!==0)&&(r[c]=D5(d,t)):h<=t&&(e.expiredLanes|=d),s&=~d}if(t=pt,a=je,a=jd(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,a===0||e===t&&(ct===2||ct===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&xh(i),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Il(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(i!==null&&xh(i),dp(a)){case 2:case 8:a=py;break;case 32:a=bd;break;case 268435456:a=gy;break;default:a=bd}return i=R0.bind(null,e),a=lp(a,i),e.callbackPriority=t,e.callbackNode=a,t}return i!==null&&i!==null&&xh(i),e.callbackPriority=2,e.callbackNode=null,2}function R0(e,t){if(Mt!==0&&Mt!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(ou()&&e.callbackNode!==a)return null;var i=je;return i=jd(e,e===pt?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(y0(e,i,t),A0(e,ja()),e.callbackNode!=null&&e.callbackNode===a?R0.bind(null,e):null)}function Rv(e,t){if(ou())return null;y0(e,t,!0)}function yS(){RS(function(){(et&6)!==0?lp(my,vS):E0()})}function Qp(){if(ji===0){var e=Vr;e===0&&(e=Ac,Ac<<=1,(Ac&261888)===0&&(Ac=256)),ji=e}return ji}function Mv(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Fc(e)}function wS(e,t,a,i,r){if(t==="submit"&&a&&a.stateNode===r){var s=Mv((r[Ia]||null).action),c=i.submitter;c&&(t=(t=c[Ia]||null)?Mv(t.formAction):c.getAttribute("formAction"),t!==null&&(s=t,c=null));var d=new Gd("action","action",null,i,r);e.push({event:d,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(ji!==0){var h=new FormData(r,c);Sm(a,{pending:!0,data:h,method:r.method,action:s},null,h)}}else typeof s=="function"&&(d.preventDefault(),h=new FormData(r,c),Sm(a,{pending:!0,data:h,method:r.method,action:s},s,h))},currentTarget:r}]})}}for(Yc=0;Yc<mm.length;Yc++)Gc=mm[Yc],zv=Gc.toLowerCase(),Vv=Gc[0].toUpperCase()+Gc.slice(1),$n(zv,"on"+Vv);var Gc,zv,Vv,Yc;$n(By,"onAnimationEnd");$n(jy,"onAnimationIteration");$n(Yy,"onAnimationStart");$n("dblclick","onDoubleClick");$n("focusin","onFocus");$n("focusout","onBlur");$n(MN,"onTransitionRun");$n(zN,"onTransitionStart");$n(VN,"onTransitionCancel");$n(Gy,"onTransitionEnd");Fo("onMouseEnter",["mouseout","mouseover"]);Fo("onMouseLeave",["mouseout","mouseover"]);Fo("onPointerEnter",["pointerout","pointerover"]);Fo("onPointerLeave",["pointerout","pointerover"]);Ur("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ur("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ur("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ur("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ur("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ur("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Cl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),xS=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Cl));function M0(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var i=e[a],r=i.event;i=i.listeners;e:{var s=void 0;if(t)for(var c=i.length-1;0<=c;c--){var d=i[c],h=d.instance,p=d.currentTarget;if(d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=p;try{s(r)}catch(b){yd(b)}r.currentTarget=null,s=h}else for(c=0;c<i.length;c++){if(d=i[c],h=d.instance,p=d.currentTarget,d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=p;try{s(r)}catch(b){yd(b)}r.currentTarget=null,s=h}}}}function Ie(e,t){var a=t[Tb];a===void 0&&(a=t[Tb]=new Set);var i=e+"__bubble";a.has(i)||(z0(t,e,2,!1),a.add(i))}function Yh(e,t,a){var i=0;t&&(i|=4),z0(a,e,i,t)}var Pc="_reactListening"+Math.random().toString(36).slice(2);function Fp(e){if(!e[Pc]){e[Pc]=!0,Ny.forEach(function(a){a!=="selectionchange"&&(xS.has(a)||Yh(a,!1,e),Yh(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Pc]||(t[Pc]=!0,Yh("selectionchange",!1,t))}}function z0(e,t,a,i){switch(a1(t)){case 2:var r=mk;break;case 8:r=pk;break;default:r=ng}a=r.bind(null,t,a,e),r=void 0,!cm||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),i?r!==void 0?e.addEventListener(t,a,{capture:!0,passive:r}):e.addEventListener(t,a,!0):r!==void 0?e.addEventListener(t,a,{passive:r}):e.addEventListener(t,a,!1)}function Gh(e,t,a,i,r){var s=i;if((t&1)===0&&(t&2)===0&&i!==null)e:for(;;){if(i===null)return;var c=i.tag;if(c===3||c===4){var d=i.stateNode.containerInfo;if(d===r)break;if(c===4)for(c=i.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===r)return;c=c.return}for(;d!==null;){if(c=Nr(d),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){i=s=c;continue e}d=d.parentNode}}i=i.return}My(function(){var p=s,b=hp(a),$=[];e:{var f=Py.get(e);if(f!==void 0){var y=Gd,V=e;switch(e){case"keypress":if(Kc(a)===0)break e;case"keydown":case"keyup":y=sN;break;case"focusin":V="focus",y=Th;break;case"focusout":V="blur",y=Th;break;case"beforeblur":case"afterblur":y=Th;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":y=Ib;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":y=Q5;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":y=hN;break;case By:case jy:case Yy:y=K5;break;case Gy:y=pN;break;case"scroll":case"scrollend":y=X5;break;case"wheel":y=fN;break;case"copy":case"cut":case"paste":y=eN;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":y=_b;break;case"submit":y=dN;break;case"toggle":case"beforetoggle":y=vN}var z=(t&4)!==0,O=!z&&(e==="scroll"||e==="scrollend"),N=z?f!==null?f+"Capture":null:f;z=[];for(var v=p,w;v!==null;){var A=v;if(w=A.stateNode,A=A.tag,A!==5&&A!==26&&A!==27||w===null||N===null||(A=vl(v,N),A!=null&&z.push(Tl(v,A,w))),O)break;v=v.return}0<z.length&&(f=new y(f,V,null,a,b),$.push({event:f,listeners:z}))}}if((t&7)===0){e:{if(y=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",y&&a!==lm&&(V=a.relatedTarget||a.fromElement)&&(Nr(V)||V[ls]))break e;(f||y)&&(V=b.window===b?b:(y=b.ownerDocument)?y.defaultView||y.parentWindow:window,f?(y=a.relatedTarget||a.toElement,f=p,y=y?Nr(y):null,y!==null&&(O=Vl(y),z=y.tag,y!==O||z!==5&&z!==27&&z!==6)&&(y=null)):(f=null,y=p),f!==y&&(z=Ib,A="onMouseLeave",N="onMouseEnter",v="mouse",(e==="pointerout"||e==="pointerover")&&(z=_b,A="onPointerLeave",N="onPointerEnter",v="pointer"),O=f==null?V:tl(f),w=y==null?V:tl(y),V=new z(A,v+"leave",f,a,b),V.target=O,V.relatedTarget=w,A=null,Nr(b)===p&&(z=new z(N,v+"enter",y,a,b),z.target=w,z.relatedTarget=O,A=z),O=A,z=f&&y?Fh(f,y,$S):null,f!==null&&Ov($,V,f,z,!1),y!==null&&O!==null&&Ov($,O,y,z,!0)))}e:{if(f=p?tl(p):window,y=f.nodeName&&f.nodeName.toLowerCase(),y==="select"||y==="input"&&f.type==="file")var H=qb;else if(Lb(f))if(_y)H=EN;else{H=CN;var Y=kN}else y=f.nodeName,!y||y.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?p&&up(p.elementType)&&(H=qb):H=TN;if(H&&(H=H(e,p))){Dy($,H,a,b);break e}Y&&Y(e,f,p)}switch(Y=p?tl(p):window,e){case"focusin":(Lb(Y)||Y.contentEditable==="true")&&(zo=Y,um=p,ol=null);break;case"focusout":ol=um=zo=null;break;case"mousedown":hm=!0;break;case"contextmenu":case"mouseup":case"dragend":hm=!1,Gb($,a,b);break;case"selectionchange":if(RN)break;case"keydown":case"keyup":Gb($,a,b)}var F;if(gp)e:{switch(e){case"compositionstart":var te="onCompositionStart";break e;case"compositionend":te="onCompositionEnd";break e;case"compositionupdate":te="onCompositionUpdate";break e}te=void 0}else Mo?Oy(e,a)&&(te="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(te="onCompositionStart");te&&(Vy&&a.locale!=="ko"&&(Mo||te!=="onCompositionStart"?te==="onCompositionEnd"&&Mo&&(F=zy()):(Ui=b,mp="value"in Ui?Ui.value:Ui.textContent,Mo=!0)),Y=Ld(p,te),0<Y.length&&(te=new Db(te,e,null,a,b),$.push({event:te,listeners:Y}),F?te.data=F:(F=Iy(a),F!==null&&(te.data=F)))),(F=wN?xN(e,a):$N(e,a))&&(te=Ld(p,"onBeforeInput"),0<te.length&&(Y=new Db("onBeforeInput","beforeinput",null,a,b),$.push({event:Y,listeners:te}),Y.data=F)),wS($,e,p,a,b)}M0($,t)})}function Tl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function Ld(e,t){for(var a=t+"Capture",i=[];e!==null;){var r=e,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=vl(e,a),r!=null&&i.unshift(Tl(e,r,s)),r=vl(e,t),r!=null&&i.push(Tl(e,r,s))),e.tag===3)return i;e=e.return}return[]}function $S(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Ov(e,t,a,i,r){for(var s=t._reactName,c=[];a!==null&&a!==i;){var d=a,h=d.alternate,p=d.stateNode;if(d=d.tag,h!==null&&h===i)break;d!==5&&d!==26&&d!==27||p===null||(h=p,r?(p=vl(a,s),p!=null&&c.unshift(Tl(a,p,h))):r||(p=vl(a,s),p!=null&&c.push(Tl(a,p,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var NS=/\r\n?/g,SS=/\u0000|\uFFFD/g;function Iv(e){return(typeof e=="string"?e:""+e).replace(NS,`
`).replace(SS,"")}function V0(e,t){return t=Iv(t),Iv(e)===t}function dt(e,t,a,i,r,s){switch(a){case"children":if(typeof i=="string")t==="body"||t==="textarea"&&i===""||Jo(e,i);else if(typeof i=="number"||typeof i=="bigint")t!=="body"&&Jo(e,""+i);else return;break;case"className":zc(e,"class",i);break;case"tabIndex":zc(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":zc(e,a,i);break;case"style":Ry(e,i,s);return;case"data":if(t!=="object"){zc(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=Fc(i),e.setAttribute(a,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(t!=="input"&&dt(e,t,"name",r.name,r,null),dt(e,t,"formEncType",r.formEncType,r,null),dt(e,t,"formMethod",r.formMethod,r,null),dt(e,t,"formTarget",r.formTarget,r,null)):(dt(e,t,"encType",r.encType,r,null),dt(e,t,"method",r.method,r,null),dt(e,t,"target",r.target,r,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=Fc(i),e.setAttribute(a,i);break;case"onClick":i!=null&&(e.onclick=jn);return;case"onScroll":i!=null&&Ie("scroll",e);return;case"onScrollEnd":i!=null&&Ie("scrollend",e);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(U(61));if(a=i.__html,a!=null){if(r.children!=null)throw Error(U(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}a=Fc(i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":i===!0?e.setAttribute(a,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(a,i):e.removeAttribute(a);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(a):e.setAttribute(a,i);break;case"popover":Ie("beforetoggle",e),Ie("toggle",e),Qc(e,"popover",i);break;case"xlinkActuate":li(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":li(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":li(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":li(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":li(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":li(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":li(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":li(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":li(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":Qc(e,"is",i);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=G5.get(a)||a,Qc(e,a,i);else return}We=!0}function Qm(e,t,a,i,r,s){switch(a){case"style":Ry(e,i,s);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(U(61));if(a=i.__html,a!=null){if(r.children!=null)throw Error(U(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof i=="string")Jo(e,i);else if(typeof i=="number"||typeof i=="bigint")Jo(e,""+i);else return;break;case"onScroll":i!=null&&Ie("scroll",e);return;case"onScrollEnd":i!=null&&Ie("scrollend",e);return;case"onClick":i!=null&&(e.onclick=jn);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Sy.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(r=a.endsWith("Capture"),s=a.slice(2,r?a.length-7:void 0),t=e[Ia]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(s,t,r),typeof i=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(s,i,r);break e}We=!0,a in e?e[a]=i:i===!0?e.setAttribute(a,""):Qc(e,a,i)}return}We=!0}function sa(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Ie("error",e),Ie("load",e);var i=!1,r=!1,s;for(s in a)if(a.hasOwnProperty(s)){var c=a[s];if(c!=null)switch(s){case"src":i=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(U(137,t));default:dt(e,t,s,c,a,null)}}r&&dt(e,t,"srcSet",a.srcSet,a,null),i&&dt(e,t,"src",a.src,a,null);return;case"input":Ie("invalid",e);var d=s=c=r=null,h=null,p=null;for(i in a)if(a.hasOwnProperty(i)){var b=a[i];if(b!=null)switch(i){case"name":r=b;break;case"type":c=b;break;case"checked":h=b;break;case"defaultChecked":p=b;break;case"value":s=b;break;case"defaultValue":d=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(U(137,t));break;default:dt(e,t,i,b,a,null)}}Ty(e,s,d,h,p,c,r,!1);return;case"select":Ie("invalid",e),i=c=s=null;for(r in a)if(a.hasOwnProperty(r)&&(d=a[r],d!=null))switch(r){case"value":s=d;break;case"defaultValue":c=d;break;case"multiple":i=d;default:dt(e,t,r,d,a,null)}t=s,a=c,e.multiple=!!i,t!=null?Lo(e,!!i,t,!1):a!=null&&Lo(e,!!i,a,!0);return;case"textarea":Ie("invalid",e),s=r=i=null;for(c in a)if(a.hasOwnProperty(c)&&(d=a[c],d!=null))switch(c){case"value":i=d;break;case"defaultValue":r=d;break;case"children":s=d;break;case"dangerouslySetInnerHTML":if(d!=null)throw Error(U(91));break;default:dt(e,t,c,d,a,null)}Ay(e,i,r,s);return;case"option":for(h in a)a.hasOwnProperty(h)&&(i=a[h],i!=null)&&(h==="selected"?e.selected=i&&typeof i!="function"&&typeof i!="symbol":dt(e,t,h,i,a,null));return;case"dialog":Ie("beforetoggle",e),Ie("toggle",e),Ie("cancel",e),Ie("close",e);break;case"iframe":case"object":Ie("load",e);break;case"video":case"audio":for(i=0;i<Cl.length;i++)Ie(Cl[i],e);break;case"image":Ie("error",e),Ie("load",e);break;case"details":Ie("toggle",e);break;case"embed":case"source":case"link":Ie("error",e),Ie("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(p in a)if(a.hasOwnProperty(p)&&(i=a[p],i!=null))switch(p){case"children":case"dangerouslySetInnerHTML":throw Error(U(137,t));default:dt(e,t,p,i,a,null)}return;default:if(up(t)){for(b in a)a.hasOwnProperty(b)&&(i=a[b],i!==void 0&&Qm(e,t,b,i,a,void 0));return}}for(d in a)a.hasOwnProperty(d)&&(i=a[d],i!=null&&dt(e,t,d,i,a,null))}var kS={};function CS(e,t,a,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,c=null,d=null,h=null,p=null,b=null;for(y in a){var $=a[y];if(a.hasOwnProperty(y)&&$!=null)switch(y){case"checked":break;case"value":break;case"defaultValue":h=$;default:i.hasOwnProperty(y)||dt(e,t,y,null,i,$)}}for(var f in i){var y=i[f];if($=a[f],i.hasOwnProperty(f)&&(y!=null||$!=null))switch(f){case"type":y!==$&&(We=!0),s=y;break;case"name":y!==$&&(We=!0),r=y;break;case"checked":y!==$&&(We=!0),p=y;break;case"defaultChecked":y!==$&&(We=!0),b=y;break;case"value":y!==$&&(We=!0),c=y;break;case"defaultValue":y!==$&&(We=!0),d=y;break;case"children":case"dangerouslySetInnerHTML":if(y!=null)throw Error(U(137,t));break;default:y!==$&&dt(e,t,f,y,i,$)}}sm(e,c,d,h,p,b,s,r);return;case"select":y=c=d=f=null;for(s in a)if(h=a[s],a.hasOwnProperty(s)&&h!=null)switch(s){case"value":break;case"multiple":y=h;default:i.hasOwnProperty(s)||dt(e,t,s,null,i,h)}for(r in i)if(s=i[r],h=a[r],i.hasOwnProperty(r)&&(s!=null||h!=null))switch(r){case"value":s!==h&&(We=!0),f=s;break;case"defaultValue":s!==h&&(We=!0),d=s;break;case"multiple":s!==h&&(We=!0),c=s;default:s!==h&&dt(e,t,r,s,i,h)}t=d,a=c,i=y,f!=null?Lo(e,!!a,f,!1):!!i!=!!a&&(t!=null?Lo(e,!!a,t,!0):Lo(e,!!a,a?[]:"",!1));return;case"textarea":y=f=null;for(d in a)if(r=a[d],a.hasOwnProperty(d)&&r!=null&&!i.hasOwnProperty(d))switch(d){case"value":break;case"children":break;default:dt(e,t,d,null,i,r)}for(c in i)if(r=i[c],s=a[c],i.hasOwnProperty(c)&&(r!=null||s!=null))switch(c){case"value":r!==s&&(We=!0),f=r;break;case"defaultValue":r!==s&&(We=!0),y=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(U(91));break;default:r!==s&&dt(e,t,c,r,i,s)}Ey(e,f,y);return;case"option":for(var V in a)f=a[V],a.hasOwnProperty(V)&&f!=null&&!i.hasOwnProperty(V)&&(V==="selected"?e.selected=!1:dt(e,t,V,null,i,f));for(h in i)f=i[h],y=a[h],i.hasOwnProperty(h)&&f!==y&&(f!=null||y!=null)&&(h==="selected"?(f!==y&&(We=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):dt(e,t,h,f,i,y));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var z in a)f=a[z],a.hasOwnProperty(z)&&f!=null&&!i.hasOwnProperty(z)&&dt(e,t,z,null,i,f);for(p in i)if(f=i[p],y=a[p],i.hasOwnProperty(p)&&f!==y&&(f!=null||y!=null))switch(p){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(U(137,t));break;default:dt(e,t,p,f,i,y)}return;default:if(up(t)){for(var O in a)f=a[O],a.hasOwnProperty(O)&&f!==void 0&&!i.hasOwnProperty(O)&&Qm(e,t,O,void 0,i,f);for(b in i)f=i[b],y=a[b],!i.hasOwnProperty(b)||f===y||f===void 0&&y===void 0||Qm(e,t,b,f,i,y);return}}for(var N in a)f=a[N],a.hasOwnProperty(N)&&f!=null&&!i.hasOwnProperty(N)&&dt(e,t,N,null,i,f);for($ in i)f=i[$],y=a[$],!i.hasOwnProperty($)||f===y||f==null&&y==null||dt(e,t,$,f,i,y)}function Dv(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function TS(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),i=0;i<a.length;i++){var r=a[i],s=r.transferSize,c=r.initiatorType,d=r.duration;if(s&&d&&Dv(c)){for(c=0,d=r.responseEnd,i+=1;i<a.length;i++){var h=a[i],p=h.startTime;if(p>d)break;var b=h.transferSize,$=h.initiatorType;b&&Dv($)&&(h=h.responseEnd,c+=b*(h<d?1:(d-p)/(h-p)))}if(--i,t+=8*(s+c)/(r.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Fm=null,Jm=null;function El(e){return e.nodeType===9?e:e.ownerDocument}function _v(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function O0(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function I0(e,t,a,i){return a=El(a).createElement(e),a[na]=i,a[Ia]=t,sa(a,e,t),Kt(a),a}function Km(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Ph=null;function ES(){var e=window.event;return e&&e.type==="popstate"?e===Ph?!1:(Ph=e,!0):(Ph=null,!1)}var Jp=typeof setTimeout=="function"?setTimeout:void 0,AS=typeof clearTimeout=="function"?clearTimeout:void 0,Hv=typeof Promise=="function"?Promise:void 0,Uv=typeof requestAnimationFrame=="function"?requestAnimationFrame:Jp,RS=typeof queueMicrotask=="function"?queueMicrotask:typeof Hv<"u"?function(e){return Hv.resolve(null).then(e).catch(MS)}:Jp;function MS(e){setTimeout(function(){throw e})}function or(e){return e==="head"}function Lv(e,t){var a=t,i=0;do{var r=a.nextSibling;if(e.removeChild(a),r&&r.nodeType===8)if(a=r.data,a==="/$"||a==="/&"){if(i===0){e.removeChild(r),ss(t);return}i--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")i++;else if(a==="html")Zh(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,Zh(a);for(var s=a.firstChild;s;){var c=s.nextSibling,d=s.nodeName;s[_l]||d==="SCRIPT"||d==="STYLE"||d==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=c}}else a==="body"&&Zh(e.ownerDocument.body);a=r}while(a);ss(t)}function qv(e,t){var a=e;e=0;do{var i=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),i&&i.nodeType===8)if(a=i.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=i}while(a)}function D0(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var i=1;else for(var r=i=0;r<t.length;r++){var s=t[r];0<s.width&&0<s.height&&i++}i===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function _0(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function H0(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function Wm(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return H0(t,a,e)}function zS(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return H0(t,a,e)}function VS(e){return e.documentElement.clientHeight}function OS(e){this.addEventListener("load",e),this.addEventListener("error",e)}function IS(e,t,a,i,r,s,c,d,h){var p=t.nodeType===9?t:t.ownerDocument;try{var b=p.startViewTransition({update:function(){var f=p.defaultView,y=f.navigation&&f.navigation.transition,V=p.fonts.status;i();var z=[];if(V==="loaded"&&(VS(p),p.fonts.status==="loading"&&z.push(p.fonts.ready)),V=z.length,e!==null)for(var O=e.suspenseyImages,N=0,v=0;v<O.length;v++){var w=O[v];if(!w.complete){var A=w.getBoundingClientRect();if(0<A.bottom&&0<A.right&&A.top<f.innerHeight&&A.left<f.innerWidth){if(N+=F0(w),N>ud){z.length=V;break}w=new Promise(OS.bind(w)),z.push(w)}}}if(0<z.length)return f=Promise.race([Promise.all(z),new Promise(function(H){return setTimeout(H,500)})]).then(r,r),(y?Promise.allSettled([y.finished,f]):f).then(s,s);if(r(),y)return y.finished.then(s,s);s()},types:a});p.__reactViewTransition=b;var $=[];return b.ready.then(function(){for(var f=p.documentElement.getAnimations({subtree:!0}),y=0;y<f.length;y++){var V=f[y],z=V.effect,O=z.pseudoElement;if(O!=null&&O.startsWith("::view-transition")){$.push(V),V=z.getKeyframes();for(var N=O=void 0,v=!0,w=0;w<V.length;w++){var A=V[w],H=A.width;if(O===void 0)O=H;else if(O!==H){v=!1;break}if(H=A.height,N===void 0)N=H;else if(N!==H){v=!1;break}delete A.width,delete A.height,A.transform==="none"&&delete A.transform}v&&O!==void 0&&N!==void 0&&(z.setKeyframes(V),v=getComputedStyle(z.target,z.pseudoElement),v.width!==O||v.height!==N)&&(v=V[0],v.width=O,v.height=N,v=V[V.length-1],v.width=O,v.height=N,z.setKeyframes(V))}}c()},function(f){p.__reactViewTransition===b&&(p.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{i(),r(),c()}}),b.finished.finally(function(){for(var f=0;f<$.length;f++)$[f].cancel();p.__reactViewTransition===b&&(p.__reactViewTransition=null),d()}),b}catch{return i(),r(),c(),null}}function Sr(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Sr.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:gt({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Sr.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),i=[],r=0;r<a.length;r++){var s=a[r].effect;s!==null&&s.target===e&&s.pseudoElement===t&&i.push(a[r])}return i};Sr.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function U0(e){return{name:e,group:new Sr("group",e),imagePair:new Sr("image-pair",e),old:new Sr("old",e),new:new Sr("new",e)}}function Za(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}Za.prototype.addEventListener=function(e,t,a){var i=null,r=null;if(!(a!=null&&typeof a!="boolean"&&(i=a.signal||null,i!==null&&i.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var s=this._eventListeners;if(L0(s,e,t,a)===-1){var c=this,d=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(d=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),i!==null&&(r=c.removeEventListener.bind(c,e,t,a),i.addEventListener("abort",r,{once:!0}),r=i.removeEventListener.bind(i,"abort",r)),i=ns(a),s.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:d,cleanup:r}),Oa(this._fragmentFiber.child,!1,DS,e,d,i)}this._eventListeners=s}};function DS(e,t,a,i){return Pt(e).addEventListener(t,a,i),!1}Za.prototype.removeEventListener=function(e,t,a){var i=this._eventListeners;if(i!==null&&(t=L0(i,e,t,a),t!==-1)){var r=i[t];a=r.attachedListener;var s=r.cleanup;r=ns(r.optionsOrUseCapture),Oa(this._fragmentFiber.child,!1,_S,e,a,r),i.splice(t,1),s!==null&&s()}};function _S(e,t,a,i){return Pt(e).removeEventListener(t,a,i),!1}function ns(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function Bv(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function L0(e,t,a,i){if(e.length===0)return-1;i=Bv(i);for(var r=0;r<e.length;r++){var s=e[r];if(s.type===t&&s.listener===a&&Bv(s.optionsOrUseCapture)===i)return r}return-1}Za.prototype.dispatchEvent=function(e){var t=Hr(this._fragmentFiber);if(t===null)return!0;t=Pt(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var i=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var r=0;r<a.length;r++){var s=a[r];i.addEventListener(s.type,s.attachedListener,ns(s.optionsOrUseCapture))}if(t.appendChild(i),e=i.dispatchEvent(e),a)for(r=0;r<a.length;r++)s=a[r],i.removeEventListener(s.type,s.attachedListener,ns(s.optionsOrUseCapture));return t.removeChild(i),e}return t.dispatchEvent(e)};Za.prototype.focus=function(e){Oa(this._fragmentFiber.child,!0,q0,e,void 0,void 0)};function q0(e,t){return e.tag===6?!1:(e=Pt(e),QS(e,t))}Za.prototype.focusLast=function(e){var t=[];Oa(this._fragmentFiber.child,!0,Kp,t,void 0,void 0);for(var a=t.length-1;0<=a&&!q0(t[a],e);a--);};function Kp(e,t){return t.push(e),!1}Za.prototype.blur=function(){var e=Hr(this._fragmentFiber);e!==null&&(e=Pt(e),e=El(e).activeElement,e!==null&&Oa(this._fragmentFiber.child,!1,HS,e,void 0,void 0))};function HS(e,t){return e.tag===6?!1:(e=Pt(e),e===t||e.contains(t)?(t.blur(),!0):!1)}Za.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Oa(this._fragmentFiber.child,!1,US,e,void 0,void 0)};function US(e,t){return e.tag===6||(e=Pt(e),t.observe(e)),!1}Za.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Oa(this._fragmentFiber.child,!1,LS,e,void 0,void 0);for(var a=t=0;a<wn.length;a++){var i=wn[a];i.fragmentInstance===this&&i.observer===e?e.unobserve(i.instance):wn[t++]=i}wn.length=t}};function LS(e,t){return e.tag===6||(e=Pt(e),t.unobserve(e)),!1}var wn=[],Xh=!1;function qS(e,t,a){wn.push({fragmentInstance:e,observer:t,instance:a}),Xh||(Xh=!0,FS(function(){Xh=!1;var i=wn;wn=[];for(var r=0;r<i.length;r++){var s=i[r];s.observer.unobserve(s.instance)}}))}Za.prototype.getClientRects=function(){var e=[];return Oa(this._fragmentFiber.child,!1,BS,e,void 0,void 0),e};function BS(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=Pt(e),t.push.apply(t,e.getClientRects());return!1}Za.prototype.getRootNode=function(e){var t=Hr(this._fragmentFiber);return t===null?this:Pt(t).getRootNode(e)};Za.prototype.compareDocumentPosition=function(e){var t=Hr(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Oa(this._fragmentFiber.child,!1,Kp,a,void 0,void 0);var i=Pt(t);if(a.length===0){if(a=i,xb(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var r=i=a.compareDocumentPosition(e);return a===e?r=Node.DOCUMENT_POSITION_CONTAINS:i&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=cy(t)[1],a===null?r=Node.DOCUMENT_POSITION_PRECEDING:(e=Pt(a).compareDocumentPosition(e),r=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),r|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=Pt(a[0]),r=Pt(a[a.length-1]);var s=xb(this._fragmentFiber)?t.parentElement:i;if(s==null)return Node.DOCUMENT_POSITION_DISCONNECTED;i=s.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,s=s.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),d=r.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||d&Node.DOCUMENT_POSITION_CONTAINED_BY;return d=i&&s&&c&Node.DOCUMENT_POSITION_FOLLOWING&&d&Node.DOCUMENT_POSITION_PRECEDING,t=i&&t===e||s&&r===e||h||d?Node.DOCUMENT_POSITION_CONTAINED_BY:!i&&t===e||!s&&r===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||jS(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function jS(e,t,a,i,r){var s=Nr(r);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!s)e:{for(;s!==null;){if(s.tag===7&&(s===t||s.alternate===t)){a=!0;break e}s=s.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(s===null)return s=r.ownerDocument,r===s||r===s.documentElement||r===s.body;e:{for(s=t,t=Hr(t);s!==null;){if(!(s.tag!==5&&s.tag!==3&&s.tag!==27||s!==t&&s.alternate!==t)){s=!0;break e}s=s.return}s=!1}return s}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!s)&&!(t=s===a)&&(t=Fh(a,s,$b),t===null?t=!1:(Oa(t,!0,y5,s,a),s=To,To=null,t=s!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!s)&&!(t=s===i)&&(t=Fh(i,s,$b),t===null?t=!1:(Oa(t,!0,w5,s,i),s=To,Qh=To=null,t=s!==null)),t):!1}function jv(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}Za.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(U(566));var t=[];Oa(this._fragmentFiber.child,!1,Kp,t,void 0,void 0);var a=e!==!1;if(t.length===0){var i=cy(this._fragmentFiber);if(i=a?i[1]||i[0]||Hr(this._fragmentFiber):i[0]||i[1],i===null)return;if(i.tag===6){e=Pt(i),jv(e,a);return}if(i=Pt(i),i.nodeType!==9){if(i.nodeType===11){a="host"in i?i.host:null,a!==null&&a.scrollIntoView(e);return}i.scrollIntoView(e)}}for(i=a?t.length-1:0;i!==(a?-1:t.length);){var r=t[i];r.tag===6?(r=Pt(r),jv(r,a)):Pt(r).scrollIntoView(e),i+=a?-1:1}};function YS(e,t){return e=Pt(e),B0(e,t),!1}function B0(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function j0(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i];e.addEventListener(r.type,r.attachedListener,ns(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){for(var c=0,d=0;d<wn.length;d++){var h=wn[d];(h.fragmentInstance!==t||h.observer!==s||h.instance!==e)&&(wn[c++]=h)}wn.length=c,s.observe(e)}),B0(e,t))}function GS(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i];e.removeEventListener(r.type,r.attachedListener,ns(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){typeof s.rootMargin=="string"?qS(t,s,e):s.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function ep(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":ep(a),Yd(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function PS(e,t,a,i){for(;e.nodeType===1;){var r=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[_l])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(s=e.getAttribute("rel"),s==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(s!==r.rel||e.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||e.getAttribute("title")!==(r.title==null?null:r.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(s=e.getAttribute("src"),(s!==(r.src==null?null:r.src)||e.getAttribute("type")!==(r.type==null?null:r.type)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&e.getAttribute("name")===s)return e}else return e;if(e=sn(e.nextSibling),e===null)break}return null}function XS(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=sn(e.nextSibling),e===null))return null;return e}function Y0(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=sn(e.nextSibling),e===null))return null;return e}function tp(e){return e.data==="$?"||e.data==="$~"}function Wp(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function ZS(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var i=function(){t(),a.removeEventListener("DOMContentLoaded",i)};a.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function sn(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var ap=null;function Yv(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return sn(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function Gv(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function QS(e,t){function a(){i=!0}if(e.ownerDocument.activeElement===e)return!0;var i=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return i}function FS(e){Uv(function(){Uv(function(t){return e(t)})})}function G0(e,t,a){switch(t=El(a),e){case"html":if(e=t.documentElement,!e)throw Error(U(452));return e;case"head":if(e=t.head,!e)throw Error(U(453));return e;case"body":if(e=t.body,!e)throw Error(U(454));return e;default:throw Error(U(451))}}function P0(e,t,a){for(var i in a){var r=a[i];a.hasOwnProperty(i)&&r!=null&&dt(e,t,i,null,kS,r)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===jn&&(e.onclick=null),Yd(e)}function Zh(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Yd(e)}var ln=new Map,Pv=new Set;function Al(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var $i=tt.d;tt.d={f:JS,r:KS,D:WS,C:ek,L:tk,m:ak,X:ik,S:nk,M:rk};function JS(){var e=$i.f(),t=iu();return e||t}function KS(e){var t=cs(e);t!==null&&t.tag===5&&t.type==="form"?Rw(t):$i.r(e)}var ms=typeof document>"u"?null:document;function X0(e,t,a){var i=ms;if(i&&typeof t=="string"&&t){var r=nn(t);r='link[rel="'+e+'"][href="'+r+'"]',typeof a=="string"&&(r+='[crossorigin="'+a+'"]'),Pv.has(r)||(Pv.add(r),e={rel:e,crossOrigin:a,href:t},i.querySelector(r)===null&&(t=i.createElement("link"),sa(t,"link",e),Kt(t),i.head.appendChild(t)))}}function WS(e){$i.D(e),X0("dns-prefetch",e,null)}function ek(e,t){$i.C(e,t),X0("preconnect",e,t)}function tk(e,t,a){$i.L(e,t,a);var i=ms;if(i&&e&&t){var r='link[rel="preload"][as="'+nn(t)+'"]';t==="image"&&a&&a.imageSrcSet?(r+='[imagesrcset="'+nn(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(r+='[imagesizes="'+nn(a.imageSizes)+'"]')):r+='[href="'+nn(e)+'"]';var s=r;switch(t){case"style":s=is(e);break;case"script":s=ps(e)}if(!(ln.has(s)||(e=gt({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),ln.set(s,e),i.querySelector(r)!==null||t==="style"&&i.querySelector(jl(s))||t==="script"&&i.querySelector(Yl(s))))){var c=i.createElement("link");sa(c,"link",e),t==="style"&&(c[vd]=!0,c.onload=c.onerror=function(){$y(c)}),Kt(c),i.head.appendChild(c)}}}function ak(e,t){$i.m(e,t);var a=ms;if(a&&e){var i=t&&typeof t.as=="string"?t.as:"script",r='link[rel="modulepreload"][as="'+nn(i)+'"][href="'+nn(e)+'"]',s=r;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=ps(e)}if(!ln.has(s)&&(e=gt({rel:"modulepreload",href:e},t),ln.set(s,e),a.querySelector(r)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Yl(s)))return}i=a.createElement("link"),sa(i,"link",e),Kt(i),a.head.appendChild(i)}}}function nk(e,t,a){$i.S(e,t,a);var i=ms;if(i&&e){var r=Uo(i).hoistableStyles,s=is(e);t=t||"default";var c=r.get(s);if(!c){var d={loading:0,preload:null};if(c=i.querySelector(jl(s)))d.loading=5;else{e=gt({rel:"stylesheet",href:e,"data-precedence":t},a),(a=ln.get(s))&&eg(e,a);var h=c=i.createElement("link");Kt(h),sa(h,"link",e),h._p=new Promise(function(p,b){h.onload=p,h.onerror=b}),h.addEventListener("load",function(){d.loading|=1}),h.addEventListener("error",function(){d.loading|=2}),d.loading|=4,cd(c,t,i)}c={type:"stylesheet",instance:c,count:1,state:d},r.set(s,c)}}}function ik(e,t){$i.X(e,t);var a=ms;if(a&&e){var i=Uo(a).hoistableScripts,r=ps(e),s=i.get(r);s||(s=a.querySelector(Yl(r)),s||(e=gt({src:e,async:!0},t),(t=ln.get(r))&&tg(e,t),s=a.createElement("script"),Kt(s),sa(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function rk(e,t){$i.M(e,t);var a=ms;if(a&&e){var i=Uo(a).hoistableScripts,r=ps(e),s=i.get(r);s||(s=a.querySelector(Yl(r)),s||(e=gt({src:e,async:!0,type:"module"},t),(t=ln.get(r))&&tg(e,t),s=a.createElement("script"),Kt(s),sa(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function Xv(e,t,a,i){var r=(r=Yi.current)?Al(r):null;if(!r)throw Error(U(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=is(a.href),t=Uo(r).hoistableStyles,i=t.get(a),i||(i={type:"style",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=is(a.href);var s=Uo(r).hoistableStyles,c=s.get(e);if(c||(r=r.ownerDocument||r,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(e,c),(s=r.querySelector(jl(e)))?s._p||(c.instance=s,c.state.loading=5):(s=ln.get(e),s||(s={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},ln.set(e,s)),ok(r,e,s,c.state))),t&&i===null)throw Error(U(528,""));return c}if(t&&i!==null)throw Error(U(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=ps(a),t=Uo(r).hoistableScripts,i=t.get(a),i||(i={type:"script",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(U(444,e))}}function is(e){return'href="'+nn(e)+'"'}function jl(e){return'link[rel="stylesheet"]['+e+"]"}function Z0(e){return gt({},e,{"data-precedence":e.precedence,precedence:null})}function ok(e,t,a,i){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[vd]!==!0){i.loading=1;return}}else t=e.createElement("link"),t[vd]=!0,t.onload=t.onerror=$y.bind(null,t),sa(t,"link",a),Kt(t),e.head.appendChild(t);i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2})}function ps(e){return'[src="'+nn(e)+'"]'}function Yl(e){return"script[async]"+e}function Zv(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+nn(a.href)+'"]');if(i)return t.instance=i,Kt(i),i;var r=gt({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),Kt(i),sa(i,"style",r),cd(i,a.precedence,e),t.instance=i;case"stylesheet":r=is(a.href);var s=e.querySelector(jl(r));if(s)return t.state.loading|=4,t.instance=s,Kt(s),s;i=Z0(a),(r=ln.get(r))&&eg(i,r),s=(e.ownerDocument||e).createElement("link"),Kt(s);var c=s;return c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),sa(s,"link",i),t.state.loading|=4,cd(s,a.precedence,e),t.instance=s;case"script":return s=ps(a.src),(r=e.querySelector(Yl(s)))?(t.instance=r,Kt(r),r):(i=a,(r=ln.get(s))&&(i=gt({},a),tg(i,r)),e=e.ownerDocument||e,r=e.createElement("script"),Kt(r),sa(r,"link",i),e.head.appendChild(r),t.instance=r);case"void":return null;default:throw Error(U(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,cd(i,a.precedence,e));return t.instance}function cd(e,t,a){for(var i=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=i.length?i[i.length-1]:null,s=r,c=0;c<i.length;c++){var d=i[c];if(d.dataset.precedence===t)s=d;else if(s!==r)break}s?s.parentNode.insertBefore(e,s.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function eg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function tg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var dd=null;function Qv(e,t,a){if(dd===null){var i=new Map,r=dd=new Map;r.set(a,i)}else r=dd,i=r.get(a),i||(i=new Map,r.set(a,i));if(i.has(e))return i;for(i.set(e,null),a=a.getElementsByTagName(e),r=0;r<a.length;r++){var s=a[r];if(!(s[_l]||s[na]||e==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var c=s.getAttribute(t)||"";c=e+c;var d=i.get(c);d?d.push(s):i.set(c,[s])}}return i}function np(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function sk(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Fv(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function Q0(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function F0(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Jv(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=F0(t),e.suspenseyImages.push(t)),e=dk.bind(e),t.decode().then(e,e))}function lk(e,t,a,i){if(a.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var r=is(i.href),s=t.querySelector(jl(r));if(s){t=s._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Rl.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=s,Kt(s);return}s=t.ownerDocument||t,i=Z0(i),(r=ln.get(r))&&eg(i,r),s=s.createElement("link"),Kt(s);var c=s;c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),sa(s,"link",i),a.instance=s}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Rl.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var ud=0;function ck(e,t){return e.stylesheets&&e.count===0&&hd(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var i=setTimeout(function(){if(e.stylesheets&&hd(e,e.stylesheets),e.unsuspend){var s=e.unsuspend;e.unsuspend=null,s()}},6e4+t);0<e.imgBytes&&ud===0&&(ud=62500*TS());var r=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&hd(e,e.stylesheets),e.unsuspend)){var s=e.unsuspend;e.unsuspend=null,s()}},(e.imgBytes>ud?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(r)}}:null}function J0(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)hd(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Rl(){this.count--,J0(this)}function dk(){this.imgCount--,J0(this)}var qd=null;function hd(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,qd=new Map,t.forEach(uk,e),qd=null,Rl.call(e))}function uk(e,t){if(!(t.state.loading&4)){var a=qd.get(e);if(a)var i=a.get(null);else{a=new Map,qd.set(e,a);for(var r=e.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var c=r[s];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),i=c)}i&&a.set(null,i)}r=t.instance,c=r.getAttribute("data-precedence"),s=a.get(c)||i,s===i&&a.set(null,r),a.set(c,r),this.count++,i=Rl.bind(this),r.addEventListener("load",i),r.addEventListener("error",i),s?s.parentNode.insertBefore(r,s.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(r,e.firstChild)),t.state.loading|=4}}var rs={$$typeof:Bn,Provider:null,Consumer:null,_currentValue:kr,_currentValue2:kr,_threadCount:0};function hk(e,t,a,i,r,s,c,d,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=$h(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=$h(0),this.hiddenUpdates=$h(null),this.identifierPrefix=i,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function K0(e,t,a,i,r,s,c,d,h,p,b,$){return e=new hk(e,t,a,c,h,p,b,$,d),t=1,s===!0&&(t|=24),s=za(3,null,null,t),e.current=s,s.stateNode=e,t=xp(),t.refCount++,e.pooledCache=t,t.refCount++,s.memoizedState={element:i,isDehydrated:a,cache:t},Sp(s),e}function W0(e){return e?(e=Io,e):Io}function e1(e,t,a,i,r,s){r=W0(r),i.context===null?i.context=r:i.pendingContext=r,i=Pi(t),i.payload={element:a},s=s===void 0?null:s,s!==null&&(i.callback=s),a=Xi(e,i,t),a!==null&&(Va(a,e,t),ll(a,e,t))}function Kv(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function ag(e,t){Kv(e,t),(e=e.alternate)&&Kv(e,t)}function t1(e){if(e.tag===13||e.tag===31){var t=qr(e,67108864);t!==null&&Va(t,e,67108864),ag(e,67108864)}}function Wv(e){if(e.tag===13||e.tag===31){var t=Pa();t=cp(t);var a=qr(e,t);a!==null&&Va(a,e,t),ag(e,t)}}var os=!0;function mk(e,t,a,i){var r=xe.T;xe.T=null;var s=tt.p;try{tt.p=2,ng(e,t,a,i)}finally{tt.p=s,xe.T=r}}function pk(e,t,a,i){var r=xe.T;xe.T=null;var s=tt.p;try{tt.p=8,ng(e,t,a,i)}finally{tt.p=s,xe.T=r}}function ng(e,t,a,i){if(os){var r=ip(i);if(r===null)Gh(e,t,i,Bd,a),ey(e,i);else if(fk(r,e,t,a,i))i.stopPropagation();else if(ey(e,i),t&4&&-1<gk.indexOf(e)){for(;r!==null;){var s=cs(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var c=wr(s.pendingLanes);if(c!==0){var d=s;for(d.pendingLanes|=2,d.entangledLanes|=2;c;){var h=1<<31-Ga(c);d.entanglements[1]|=h,c&=~h}Fn(s),(et&6)===0&&(Dd=ja()+500,Bl(0,!1))}}break;case 31:case 13:d=qr(s,2),d!==null&&Va(d,s,2),iu(),ag(s,2)}if(s=ip(i),s===null&&Gh(e,t,i,Bd,a),s===r)break;r=s}r!==null&&i.stopPropagation()}else Gh(e,t,i,null,a)}}function ip(e){return e=hp(e),ig(e)}var Bd=null;function ig(e){if(Bd=null,e=Nr(e),e!==null){var t=Vl(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=oy(t),e!==null)return e;e=null}else if(a===31){if(e=sy(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return Bd=e,null}function a1(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(A5()){case my:return 2;case py:return 8;case bd:case R5:return 32;case gy:return 268435456;default:return 32}default:return 32}}var rp=!1,Ji=null,Ki=null,Wi=null,Ml=new Map,zl=new Map,_i=[],gk="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function ey(e,t){switch(e){case"focusin":case"focusout":Ji=null;break;case"dragenter":case"dragleave":Ki=null;break;case"mouseover":case"mouseout":Wi=null;break;case"pointerover":case"pointerout":Ml.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":zl.delete(t.pointerId)}}function Js(e,t,a,i,r,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:a,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},t!==null&&(t=cs(t),t!==null&&t1(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),e)}function fk(e,t,a,i,r){switch(t){case"focusin":return Ji=Js(Ji,e,t,a,i,r),!0;case"dragenter":return Ki=Js(Ki,e,t,a,i,r),!0;case"mouseover":return Wi=Js(Wi,e,t,a,i,r),!0;case"pointerover":var s=r.pointerId;return Ml.set(s,Js(Ml.get(s)||null,e,t,a,i,r)),!0;case"gotpointercapture":return s=r.pointerId,zl.set(s,Js(zl.get(s)||null,e,t,a,i,r)),!0}return!1}function n1(e){var t=Nr(e.target);if(t!==null){var a=Vl(t);if(a!==null){if(t=a.tag,t===13){if(t=oy(a),t!==null){e.blockedOn=t,Cb(e.priority,function(){Wv(a)});return}}else if(t===31){if(t=sy(a),t!==null){e.blockedOn=t,Cb(e.priority,function(){Wv(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function md(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=ip(e.nativeEvent);if(a===null){a=e.nativeEvent;var i=new a.constructor(a.type,a);lm=i,a.target.dispatchEvent(i),lm=null}else return t=cs(a),t!==null&&t1(t),e.blockedOn=a,!1;t.shift()}return!0}function ty(e,t,a){md(e)&&a.delete(t)}function bk(){rp=!1,Ji!==null&&md(Ji)&&(Ji=null),Ki!==null&&md(Ki)&&(Ki=null),Wi!==null&&md(Wi)&&(Wi=null),Ml.forEach(ty),zl.forEach(ty)}function Xc(e,t){e.blockedOn===t&&(e.blockedOn=null,rp||(rp=!0,Xt.unstable_scheduleCallback(Xt.unstable_NormalPriority,bk)))}var Zc=null;function ay(e){Zc!==e&&(Zc=e,Xt.unstable_scheduleCallback(Xt.unstable_NormalPriority,function(){Zc===e&&(Zc=null);for(var t=0;t<e.length;t+=3){var a=e[t],i=e[t+1],r=e[t+2];if(typeof i!="function"){if(ig(i||a)===null)continue;break}var s=cs(a);s!==null&&(e.splice(t,3),t-=3,Sm(s,{pending:!0,data:r,method:a.method,action:i},i,r))}}))}function ss(e){function t(h){return Xc(h,e)}Ji!==null&&Xc(Ji,e),Ki!==null&&Xc(Ki,e),Wi!==null&&Xc(Wi,e),Ml.forEach(t),zl.forEach(t);for(var a=0;a<_i.length;a++){var i=_i[a];i.blockedOn===e&&(i.blockedOn=null)}for(;0<_i.length&&(a=_i[0],a.blockedOn===null);)n1(a),a.blockedOn===null&&_i.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(i=0;i<a.length;i+=3){var r=a[i],s=a[i+1],c=r[Ia]||null;if(typeof s=="function")c||ay(a);else if(c){var d=null;if(s&&s.hasAttribute("formAction")){if(r=s,c=s[Ia]||null)d=c.formAction;else if(ig(r)!==null)continue}else d=c.action;typeof d=="function"?a[i+1]=d:(a.splice(i,3),i-=3),ay(a)}}}function i1(){function e(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(c){return r=c})},focusReset:"manual",scroll:"manual"})}function t(){r!==null&&(r(),r=null),i||setTimeout(a,20)}function a(){if(!i&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,r=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),r!==null&&(r(),r=null)}}}function rg(e){this._internalRoot=e}su.prototype.render=rg.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(U(409));var a=t.current,i=Pa();e1(a,i,e,t,null,null)};su.prototype.unmount=rg.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;e1(e.current,2,null,e,null,null),iu(),t[ls]=null}};function su(e){this._internalRoot=e}su.prototype.unstable_scheduleHydration=function(e){if(e){var t=xy();e={blockedOn:null,target:e,priority:t};for(var a=0;a<_i.length&&t!==0&&t<_i[a].priority;a++);_i.splice(a,0,e),a===0&&n1(e)}};var ny=iy.version;if(ny!=="19.3.0")throw Error(U(527,ny,"19.3.0"));tt.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(U(188)):(e=Object.keys(e).join(","),Error(U(268,e)));return e=v5(t),e=e!==null?ly(e):null,e=e===null?null:e.stateNode,e};var vk={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:xe,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Ks=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ks.isDisabled&&Ks.supportsFiber))try{Ol=Ks.inject(vk),Ya=Ks}catch{}var Ks;lu.createRoot=function(e,t){if(!ry(e))throw Error(U(299));var a=!1,i="",r=Hw,s=Uw,c=Lw;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(r=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=K0(e,1,!1,null,null,a,i,null,r,s,c,i1),e[ls]=t.current,Fp(e),new rg(t)};lu.hydrateRoot=function(e,t,a){if(!ry(e))throw Error(U(299));var i=!1,r="",s=Hw,c=Uw,d=Lw,h=null;return a!=null&&(a.unstable_strictMode===!0&&(i=!0),a.identifierPrefix!==void 0&&(r=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(d=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=K0(e,1,!0,t,a??null,i,r,h,s,c,d,i1),t.context=W0(null),a=t.current,i=Pa(),i=cp(i),r=Pi(i),r.callback=null,Xi(a,r,i),a=i,t.current.lanes=a,Dl(t,a),Fn(t),e[ls]=t.current,Fp(e),new su(t)};lu.version="19.3.0"});var l1=On((P2,s1)=>{"use strict";function o1(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o1)}catch(e){console.error(e)}}o1(),s1.exports=r1()});var Ai=In(bo()),Z=In(fr()),br={"Painted illustration":"Painted storybook illustration, coherent brushwork, soft lighting, and a consistent color palette.",Watercolor:"Watercolor scenery with translucent washes, textured paper, soft edges, and a harmonious palette.",Cartoon:"Cartoon scenery with clean outlines, simplified shapes, expressive colors, and consistent cel shading.","Pixel art":"Pixel art scenery with crisp pixel edges, a limited consistent palette, and carefully shaded forms.",Photorealism:"Photorealistic scenery with natural materials, realistic lighting, and coherent photographic detail.",Custom:""};function oh({value:e,onChange:t}){return(0,Z.jsxs)("fieldset",{className:"villages-scenery-fields",children:[(0,Z.jsx)("legend",{children:"Scenery art style"}),(0,Z.jsxs)("label",{children:["Style preset",(0,Z.jsx)("select",{"aria-label":"Scenery style preset",value:Object.keys(br).find(a=>br[a]===e)??"Custom",onChange:a=>t(br[a.target.value]),children:Object.keys(br).map(a=>(0,Z.jsx)("option",{children:a},a))})]}),(0,Z.jsxs)("label",{children:["Style description",(0,Z.jsx)("textarea",{"aria-label":"Scenery style description",rows:3,maxLength:600,value:e,onChange:a=>t(a.target.value)})]}),(0,Z.jsx)("p",{children:"Used for future map and venue images. Existing artwork stays as it is."})]})}function Nc(){return{id:"private:player",ownerId:"player",name:"Your personal space",purpose:"Personal space",venueClass:"residence",description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}}function sh({rooms:e,onChange:t,people:a,workplace:i=!1,playerHome:r=!1}){let s=(c,d)=>t(e.map(h=>h.id===c?{...h,...d}:h));return(0,Z.jsxs)("section",{className:"villages-private-fields",children:[r?(0,Z.jsx)("p",{children:"Your personal space belongs to you. Other residents\u2019 personal spaces remain a surprise until you\u2019re invited."}):i?(0,Z.jsx)("p",{children:"A private work area is included automatically. All current workers have access; guests need an invitation."}):(0,Z.jsx)("p",{children:"Restricted rooms are optional. Choose who can invite guests and approve lasting changes."}),e.filter(c=>c.ownerId!=="player").map(c=>(0,Z.jsxs)("fieldset",{children:[(0,Z.jsx)("legend",{children:c.name||"Private space"}),(0,Z.jsxs)("label",{children:["Room name",(0,Z.jsx)("input",{maxLength:100,value:c.name??"",onChange:d=>s(c.id,{name:d.target.value})})]}),(0,Z.jsxs)("label",{children:["Purpose",(0,Z.jsx)("input",{maxLength:240,value:c.purpose??"",onChange:d=>s(c.id,{purpose:d.target.value})})]}),i?null:(0,Z.jsxs)("fieldset",{children:[(0,Z.jsx)("legend",{children:"Room controllers"}),a.map(d=>(0,Z.jsxs)("label",{children:[(0,Z.jsx)("input",{type:"checkbox",checked:c.controllerIds?.includes(d.id)??!1,onChange:h=>s(c.id,{controllerIds:h.target.checked?[...c.controllerIds??[],d.id]:c.controllerIds?.filter(p=>p!==d.id)})}),d.name]},d.id))]}),(0,Z.jsxs)("label",{children:["Description \xB7 optional",(0,Z.jsx)("textarea",{maxLength:1e3,value:c.description,onChange:d=>s(c.id,{description:d.target.value})})]}),(0,Z.jsx)("p",{children:"Private details will be prepared when the venue opens. Its image is drawn on first invited entry."}),(0,Z.jsx)("button",{type:"button",onClick:()=>t(e.filter(d=>d.id!==c.id)),children:"Remove this private space"})]},c.id)),(0,Z.jsx)("button",{type:"button",onClick:()=>t([...e,{...Nc(),id:"restricted:"+crypto.randomUUID(),ownerId:"",name:"",purpose:"",venueClass:i?"workplace":"other",controllerIds:[]}]),children:"Add private space"})]})}function Zf({venue:e,tag:t,people:a,assignedIds:i,busy:r,problem:s,onPatch:c,onDone:d,onCancel:h,onMove:p,onGenerate:b,onUpload:$,onRemove:f}){let y=e.classes?.includes("residence")??!1,V=y&&!e.occupancy.playerHome,z=V?["Resident","Name and form","Exterior","Shared interior","Private spaces"]:["Name and form","Exterior","Interior","Private spaces"],[O,N]=(0,Ai.useState)(0),[v,w]=(0,Ai.useState)(""),A=(0,Ai.useRef)(null),H=z[O],Y=e.spaces?.[0],F=e.privateSpaces?.find(B=>B.ownerId==="player")??Nc();(0,Ai.useEffect)(()=>{A.current?.querySelector("input,textarea,select,button")?.focus()},[O]);let te=(B,re)=>(0,Z.jsxs)("section",{children:[(0,Z.jsx)("p",{children:"Image \xB7 optional"}),re?(0,Z.jsx)("img",{className:t+"-setup-image-preview",src:re.url,alt:B+" of "+e.name}):(0,Z.jsx)("p",{children:"No image yet."}),(0,Z.jsxs)("div",{className:t+"-row",children:[(0,Z.jsxs)("button",{type:"button",disabled:r,onClick:()=>b(B),children:[re?"Regenerate":"Generate"," ",B," image"]}),(0,Z.jsxs)("label",{children:["Upload ",B," image",(0,Z.jsx)("input",{type:"file",accept:"image/*",disabled:r,onChange:me=>{let ft=me.target.files?.[0];me.target.value="",ft&&$(B,ft)}})]}),re?(0,Z.jsx)("button",{type:"button",disabled:r,onClick:()=>c(B==="exterior"?{...e,presentation:{...e.presentation,image:null}}:B==="private"?{...e,privateSpaces:(e.privateSpaces??[F]).map(me=>me.ownerId==="player"?{...me,image:null}:me)}:{...e,spaces:e.spaces?.map((me,ft)=>ft===0?{...me,image:null}:me)}),children:"Remove image"}):null]})]});(0,Ai.useEffect)(()=>{let B=window.visualViewport,re=()=>{let me=A.current;!me||!B||window.innerWidth>704||(me.style.height=B.height+"px",me.parentElement.style.top=B.offsetTop+"px",me.parentElement.style.bottom="auto")};return re(),B?.addEventListener("resize",re),B?.addEventListener("scroll",re),()=>{B?.removeEventListener("resize",re),B?.removeEventListener("scroll",re)}},[]);let Te=()=>{let B=H==="Resident"&&!e.occupancy.residentCharacterId?"Choose a villager.":H==="Name and form"&&(!e.name.trim()||!e.form?.trim())?"Add a name and describe the form.":H==="Exterior"&&!e.description.trim()?"Describe the exterior.":(H==="Interior"||H==="Shared interior")&&!Y?.description.trim()?"Describe the interior.":"";if(w(B),B){A.current?.querySelector("input,textarea,select")?.focus();return}O===z.length-1?d():N(O+1)};return(0,Z.jsx)("div",{className:"villages-founding-backdrop",children:(0,Z.jsxs)("div",{ref:A,className:"villages-founding-dialog",role:"dialog","aria-modal":"true","aria-label":"Define "+e.name,onKeyDown:B=>{if(B.key==="Escape"&&!r&&h(),B.key==="Tab"){let re=Array.from(A.current?.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)")??[]);B.shiftKey&&B.target===re[0]?(B.preventDefault(),re.at(-1)?.focus()):!B.shiftKey&&B.target===re.at(-1)&&(B.preventDefault(),re[0]?.focus())}},children:[(0,Z.jsxs)("header",{children:[(0,Z.jsx)("h3",{children:e.name||"New venue"}),(0,Z.jsxs)("p",{children:[H," \xB7 ",O+1," of ",z.length]})]}),(0,Z.jsxs)("div",{className:"villages-founding-editor-body",children:[H==="Resident"?(0,Z.jsxs)("label",{children:["Assigned villager",(0,Z.jsxs)("select",{"aria-label":"Assigned villager",value:e.occupancy.residentCharacterId??"",onChange:B=>c({...e,residentIds:B.target.value?[B.target.value]:[],occupancy:{...e.occupancy,residentCharacterId:B.target.value||null}}),children:[(0,Z.jsx)("option",{value:"",children:"Choose a villager"}),a.map(B=>(0,Z.jsx)("option",{value:B.id,disabled:i.includes(B.id),children:B.name},B.id))]})]}):null,H==="Name and form"?(0,Z.jsxs)(Z.Fragment,{children:[(0,Z.jsxs)("label",{children:["Name",(0,Z.jsx)("input",{"aria-label":"Venue name",maxLength:100,value:e.name,onChange:B=>c({...e,name:B.target.value})})]}),(0,Z.jsxs)("label",{children:["Form",(0,Z.jsx)("textarea",{"aria-label":"Venue form",maxLength:240,value:e.form??"",placeholder:y?"A stone house, a tent, or a converted vehicle\u2026":"A park, communal fire pit, or gathering hall\u2026",onChange:B=>c({...e,form:B.target.value})})]})]}):null,H==="Exterior"||H==="Interior"||H==="Shared interior"?(0,Z.jsxs)(Z.Fragment,{children:[(0,Z.jsxs)("label",{children:[H," description",(0,Z.jsx)("textarea",{"aria-label":H+" description",maxLength:1e3,value:H==="Exterior"?e.description:Y?.description??"",onChange:B=>c(H==="Exterior"?{...e,description:B.target.value}:{...e,spaces:e.spaces?.map((re,me)=>me===0?{...re,description:B.target.value}:re)})})]}),(0,Z.jsxs)("fieldset",{children:[(0,Z.jsx)("legend",{children:"Image context"}),V?(0,Z.jsxs)("label",{children:[(0,Z.jsx)("input",{type:"checkbox",checked:e.imageContext?.useAssignedVillagerContext??!0,onChange:B=>c({...e,imageContext:{useVisualLore:e.imageContext?.useVisualLore??!0,useAssignedVillagerContext:B.target.checked}})}),"Use assigned villager\u2019s personality"]}):null,(0,Z.jsxs)("label",{children:[(0,Z.jsx)("input",{type:"checkbox",checked:e.imageContext?.useVisualLore??!0,onChange:B=>c({...e,imageContext:{useAssignedVillagerContext:e.imageContext?.useAssignedVillagerContext??!0,useVisualLore:B.target.checked}})}),"Use selected visual lore"]})]}),te(H==="Exterior"?"exterior":"interior",H==="Exterior"?e.presentation.image:Y?.image)]}):null,H==="Private spaces"?(0,Z.jsxs)(Z.Fragment,{children:[V?(0,Z.jsx)("p",{children:"This villager\u2019s personal space will be prepared from their personality, relevant lore, and this home\u2019s form. Its details stay hidden until you\u2019re invited."}):null,e.occupancy.playerHome?(0,Z.jsxs)(Z.Fragment,{children:[(0,Z.jsxs)("label",{children:["Your personal-space description",(0,Z.jsx)("textarea",{"aria-label":"Your personal-space description",maxLength:1e3,value:F.description,onChange:B=>c({...e,privateSpaces:[...(e.privateSpaces??[]).filter(re=>re.ownerId!=="player"),{...F,description:B.target.value}]})})]}),te("private",F.image)]}):null,(0,Z.jsx)(sh,{rooms:e.privateSpaces??[],onChange:B=>c({...e,privateSpaces:B}),people:[{id:"player",name:"You"},...a],playerHome:e.occupancy.playerHome})]}):null,(0,Z.jsxs)("div",{className:t+"-row",children:[(0,Z.jsx)("button",{type:"button",disabled:r,onClick:p,children:"Move on map"}),(0,Z.jsx)("button",{type:"button",disabled:r,onClick:f,children:"Remove venue"})]}),v||s?(0,Z.jsx)("p",{role:"alert",className:t+"-error",children:v||s}):null,r?(0,Z.jsx)("p",{role:"status",children:"Preparing image\u2026"}):null]}),(0,Z.jsxs)("footer",{children:[(0,Z.jsx)("button",{type:"button",disabled:r,onClick:h,children:"Cancel"}),(0,Z.jsx)("button",{type:"button",disabled:r||O===0,onClick:()=>{w(""),N(O-1)},children:"Back"}),(0,Z.jsx)("button",{type:"button",disabled:r,onClick:Te,children:O===z.length-1?"Done":"Continue"})]})]})})}function Qf(e,t,a){let i=t*a;if(!i||e.length!==i*4)return!1;let r=e.slice(),s=Math.max(1,Math.ceil(t*.18)),c=Math.max(1,Math.ceil(a*.18)),d=Math.max(1,Math.floor(Math.sqrt(i/4e4))),h=new Map,p=0;for(let R=0;R<a;R+=d)for(let q=0;q<t;q+=d){if(q>=s&&q<t-s&&R>=c&&R<a-c)continue;let ne=(R*t+q)*4;if(e[ne+3]<128)continue;p++;let Ne=[e[ne],e[ne+1],e[ne+2]];if(Math.max(...Ne)<180||Math.max(...Ne)-Math.min(...Ne)<140)continue;let de=Ne.map(at=>Math.floor(at/32)).join(":"),He=h.get(de)??{rgb:[0,0,0],count:0};for(let at=0;at<3;at++)He.rgb[at]+=Ne[at];He.count++,h.set(de,He)}let b=[...h.values()].sort((R,q)=>q.count-R.count)[0];if(!b||b.count<Math.max(4,p*.25))return!1;let $=b.rgb.map(R=>R/b.count),f=new Float32Array(i);for(let R=0;R<i;R++)f[R]=Math.hypot(r[R*4]-$[0],r[R*4+1]-$[1],r[R*4+2]-$[2]);let y=R=>f[R],V=new Set;for(let R=0;R<a;R+=d)for(let q=0;q<t;q+=d){if(q>=s&&q<t-s&&R>=c&&R<a-c)continue;let ne=R*t+q;e[ne*4+3]>128&&y(ne)<28&&V.add((q>=t/2?1:0)+(R>=a/2?2:0))}if(V.size<3)return!1;let z=new Uint8Array(i),O=new Int32Array(i),N=0,v=0,w=t,A=-1,H=a,Y=-1;for(let R=0;R<i;R++)e[R*4+3]===0||y(R)>=28||(z[R]=1,O[v++]=R,w=Math.min(w,R%t),A=Math.max(A,R%t),H=Math.min(H,Math.floor(R/t)),Y=Math.max(Y,Math.floor(R/t)));let F=(R,q)=>{R%t>0&&q(R-1),R%t<t-1&&q(R+1),R>=t&&q(R-t),R<i-t&&q(R+t)};for(;N<v;)F(O[N++],R=>{z[R]||e[R*4+3]===0||y(R)>=90||(z[R]=1,O[v++]=R)});let te=$.map((R,q)=>({value:R,index:q})).filter(({value:R})=>R>Math.max(...$)-48),Te=$.map((R,q)=>({value:R,index:q})).filter(({value:R})=>R<Math.min(...$)+48),B=new Float32Array(i),re=new Uint8Array(i);for(let R=0;R<i;R++){let q=255,ne=0,Ne=0;for(let{index:de}of te)q=Math.min(q,r[R*4+de]),ne=Math.max(ne,r[R*4+de]);for(let{index:de}of Te)Ne=Math.max(Ne,r[R*4+de]);B[R]=q-Ne,re[R]=q-Ne>8&&ne-q<48?1:0}let me=R=>B[R],ft=new Uint8Array(i);for(let R=0;R<i;R++){if(ft[R]||z[R]||e[R*4+3]===0)continue;N=0,v=1,O[0]=R,ft[R]=1;let q=!0;for(;N<v;){let ne=O[N++];q&&(q=me(ne)>8&&y(ne)<180),F(ne,Ne=>{ft[Ne]||z[Ne]||e[Ne*4+3]===0||(ft[Ne]=1,O[v++]=Ne)})}if(v<=16&&q)for(let ne=0;ne<v;ne++)z[O[ne]]=1}let _e=Math.min(12,Math.max(6,Math.ceil(Math.min(t,a)/32))),Tt=new Uint8Array(i);N=0,v=0;for(let R=0;R<i;R++)(z[R]||e[R*4+3]===0)&&(Tt[R]=1,O[v++]=R);for(;N<v;){let R=O[N++];Tt[R]>_e*2||F(R,q=>{Tt[q]||(Tt[q]=Tt[R]+1,O[v++]=q)})}for(let R=0;R<i;R++){if(z[R]||!Tt[R]||Tt[R]>_e+1||e[R*4+3]===0)continue;let q=R%t,ne=Math.floor(R/t),Ne=r[R*4]-$[0],de=r[R*4+1]-$[1],He=r[R*4+2]-$[2],at,Oe=1,ie=1/0,Qt=!!re[R],Ue=Qt?_e*2:_e,_t=y(R)+8,Ge=me(R)-8;e:for(let nt=Math.max(0,ne-Ue);nt<=Math.min(a-1,ne+Ue);nt++)for(let be=Math.max(0,q-Ue);be<=Math.min(t-1,q+Ue);be++){let pe=nt*t+be;if(z[pe]||r[pe*4+3]<=128||re[pe]&&Tt[pe]&&Tt[pe]<=_e*2||me(pe)>=Ge||y(pe)<=_t)continue;let ue=r[pe*4]-$[0],it=r[pe*4+1]-$[1],Nt=r[pe*4+2]-$[2],Pe=Math.max(0,Math.min(1,(ue*Ne+it*de+Nt*He)/(ue*ue+it*it+Nt*Nt))),qt=Ne-Pe*ue,Xe=de-Pe*it,I=He-Pe*Nt,G=qt*qt+Xe*Xe+I*I;if(G<ie&&(ie=G,Oe=Pe,at=[r[pe*4],r[pe*4+1],r[pe*4+2]],ie<1e-6))break e}if(!at){Qt&&y(R)<180&&(e[R*4+3]=0);continue}if(Qt){let nt=Math.min(...te.map(({index:pe})=>at[pe]))-Math.max(...Te.map(({index:pe})=>at[pe])),be=Math.min(...te.map(({value:pe})=>pe))-Math.max(...Te.map(({value:pe})=>pe));Oe=Math.max(0,Math.min(1,(be-me(R))/(be-nt)))}else if(ie>64||Oe>=.98)continue;if(e[R*4+3]=Math.round(r[R*4+3]*Oe),at)for(let nt=0;nt<3;nt++)e[R*4+nt]=at[nt]}let Dt=R=>R.filter(q=>z[q]).length/R.length,Zt=w<=t*.1&&A>=t*.9-1&&H<=a*.1&&Y>=a*.9-1&&Dt(Array.from({length:A-w+1},(R,q)=>H*t+w+q))>.7&&Dt(Array.from({length:A-w+1},(R,q)=>Y*t+w+q))>.7&&Dt(Array.from({length:Y-H+1},(R,q)=>(H+q)*t+w))>.7&&Dt(Array.from({length:Y-H+1},(R,q)=>(H+q)*t+A))>.7;for(let R=0;R<i;R++){let q=R%t,ne=Math.floor(R/t),Ne=R*4,de=[e[Ne],e[Ne+1],e[Ne+2]];(z[R]||Zt&&(q<w||q>A||ne<H||ne>Y)&&(Math.max(...de)<100&&Math.max(...de)-Math.min(...de)<50||me(R)>8))&&(e[Ne+3]=0)}return!0}var Re=In(bo());var lh={PAPERCRAFT:"Faithfully preserve the source character\u2019s design, clothing, colors, anatomy, and identifying features. Render as a handcrafted 2D papercraft game character: simplified cartoon proportions, bold clean near-black outlines, and a distinct thin off-white paper-cut border around the entire silhouette. Construct the character from flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply a clearly visible matte handmade paper texture with fine fibers and gentle printed color variation across the entire character. Slightly imperfect physical cut edges. Clean, expressive, polished storybook character design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. The result should look like a physical illustrated paper character assembled from printed cutouts.",BATTLEHIGHWAY:"Use the reference image ONLY as a character-design reference for identity, species/anatomy, core outfit, colors, proportions, and defining features. Redraw the character strictly in the visual style of early-2000s Sonic Battle character art. Reconstruct the character from bold angular graphic shapes, not smooth modern anatomy. Use exaggerated proportions, a strong asymmetrical silhouette, and slightly hand-drawn, irregular contours. Build the design from large faceted masses, wedges, spikes, tapered limbs, and simplified shape clusters. Do not just take normal anatomy and make it slightly angular. Use thick dark outer outlines and selective thinner interior lines to divide important forms only. Group repeated details like feathers, fur, hair, folds, fingers, and accessories into a few large simplified shapes instead of many small ones. Use flat saturated colors with one large hard-edged shadow shape per major form and only occasional small highlight accents. Keep strong value separation and graphic cutout-like shading, not realistic form rendering. Include some medium-scale structural details that define the character, but remove microdetail. The final image should feel like Sonic Battle character key art: graphic, angular, simplified, lively, and highly readable, not polished modern anime art, not painterly, not vector-clean, and not realistic. No gradients, soft shading, painterly texture, glossy rendering, realistic lighting, detailed folds, excessive feather/fur/hair separation, or 3D volume.",Custom:""},Ff=["neutral","happy","sad","angry","surprised","thinking"];function Jf(e,t){if(!e||!/^[a-z0-9_-]{1,40}$/.test(e.label)||!["front","side"].includes(e.view))throw new Error("Choose a valid view and expression label.");if(typeof e.pose!="string"||e.pose.length>500)throw new Error("Pose instructions must be at most 500 characters.");if(![e.x,e.y,e.width,e.height].every(Number.isInteger)||e.x<0||e.y<0||e.width<1||e.height<1||e.x+e.width>t.width||e.y+e.height>t.height)throw new Error("The crop must fit inside the source image.");if(![e.scale,e.offsetX,e.offsetY].every(Number.isFinite)||e.scale<.1||e.scale>3||Math.abs(e.offsetX)>512||Math.abs(e.offsetY)>768)throw new Error("Choose a scale between 0.1 and 3 and an offset inside the sprite canvas.")}var k=In(fr()),vo=e=>e instanceof Error?e.message:"The sprite action failed.";function l5(){let e=crypto.getRandomValues(new Uint8Array(16));e[6]=e[6]&15|64,e[8]=e[8]&63|128;let t=Array.from(e,a=>a.toString(16).padStart(2,"0")).join("");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}var Kf=e=>new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(String(i.result)),i.onerror=()=>a(new Error("The file could not be read.")),i.readAsDataURL(e)}),Wf=e=>new Promise((t,a)=>{let i=new Image;i.onload=()=>t(i),i.onerror=()=>a(new Error("The image could not be loaded.")),i.src=e});function c5(e,t,a){let i=e.getImageData(0,0,t,a);Qf(i.data,t,a)&&e.putImageData(i,0,0)}async function eb(e,t,a=!1){Jf(t,e);let i=await Wf(e.url),r=document.createElement("canvas");r.width=t.width,r.height=t.height;let s=r.getContext("2d");s.drawImage(i,t.x,t.y,t.width,t.height,0,0,t.width,t.height),a&&c5(s,r.width,r.height);let c=document.createElement("canvas");c.width=512,c.height=768;let d=c.getContext("2d"),p=(e.baseScale??Math.min(512/Math.max(...e.cells.map(z=>z.width)),768/Math.max(...e.cells.map(z=>z.height))))*t.scale,b=s.getImageData(0,0,r.width,r.height).data,$=r.width,f=-1,y=r.height,V=-1;for(let z=0;z<r.height;z++)for(let O=0;O<r.width;O++)b[(z*r.width+O)*4+3]>16&&($=Math.min($,O),f=Math.max(f,O),y=Math.min(y,z),V=Math.max(V,z));if(f>=$){let z=f-$+1,O=V-y+1,N=Math.min(p,480/z,736/O),v=z*N,w=O*N;d.drawImage(r,$,y,z,O,(512-v)/2+t.offsetX,752-w+t.offsetY,v,w)}return c}function ch({candidate:e,mirrored:t=!1}){let a=(0,Re.useRef)(null),[i,r]=(0,Re.useState)("");return(0,Re.useEffect)(()=>{if(e.cell.rendered)return;let s=!1;return eb(e.sheet,e.cell,e.cell.cleanup).then(c=>{!s&&a.current&&(a.current.getContext("2d").clearRect(0,0,512,768),a.current.getContext("2d").drawImage(c,0,0),r(""))}).catch(c=>{s||r(vo(c))}),()=>{s=!0}},[e.sheet,e.cell]),e.cell.rendered?(0,k.jsx)("img",{src:e.cell.rendered.url,alt:e.cell.view+" "+e.cell.label,style:{transform:t?"scaleX(-1)":void 0}}):(0,k.jsxs)(k.Fragment,{children:[i?(0,k.jsx)("small",{role:"alert",children:i}):null,(0,k.jsx)("canvas",{ref:a,width:512,height:768,style:{transform:t?"scaleX(-1)":void 0},role:"img","aria-label":e.cell.view+" "+e.cell.label})]})}var d5=`
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
`;function tb({villager:e,request:t,onSaved:a,onBack:i,onExport:r}){let s="/villagers/"+encodeURIComponent(e.characterId)+"/sprites",[c,d]=(0,Re.useState)(null),[h,p]=(0,Re.useState)(null),[b,$]=(0,Re.useState)("Create"),[f,y]=(0,Re.useState)("front"),[V,z]=(0,Re.useState)([...Ff]),[O,N]=(0,Re.useState)(""),[v,w]=(0,Re.useState)({}),[A,H]=(0,Re.useState)(!1),[Y,F]=(0,Re.useState)(null),[te,Te]=(0,Re.useState)(""),[B,re]=(0,Re.useState)(!1),[me,ft]=(0,Re.useState)([]),[_e,Tt]=(0,Re.useState)(""),[Dt,Zt]=(0,Re.useState)(""),[R,q]=(0,Re.useState)(null),[ne,Ne]=(0,Re.useState)(!1),[de,He]=(0,Re.useState)(""),[at,Oe]=(0,Re.useState)(""),[ie,Qt]=(0,Re.useState)(!1),[Ue,_t]=(0,Re.useState)(!1),[Ge,nt]=(0,Re.useState)(null),be=(0,Re.useRef)(null),[pe,ue]=(0,Re.useState)(""),[it,Nt]=(0,Re.useState)(null),[Pe,qt]=(0,Re.useState)(1),[Xe,I]=(0,Re.useState)(1),[G,ye]=(0,Re.useState)("neutral"),Ae=(0,Re.useRef)(null),Le=(0,Re.useRef)(""),Me=(0,Re.useRef)(null),Q=(S,x)=>t(s+"/studio"+(S?"/"+S:""),x===void 0?void 0:{method:"POST",body:JSON.stringify(x)}),qe=S=>{d(S.studio),a(S.snapshot)},J=(c?.jobs??[]).flatMap(S=>S.sheets.flatMap(x=>x.cells.map(D=>({sheet:x,cell:D})))),rt=J.find(S=>S.cell.id===_e),Et=R?J.find(S=>S.cell.id===R.id):null,he=c?.jobs.some(S=>S.status==="running")??!1,Ye=e.sprite?.images??[],zt=J.filter(S=>S.cell.pending).length,Ze=c?.expressions??[],ea={view:f,individual:A,settings:h,expressions:V.filter(S=>Ze.some(x=>x.label===S)).map(S=>{let x=Ze.find(D=>D.label===S);return{label:S,pose:v[S]??x.pose,expressionId:x.id}})},ga=JSON.stringify(ea),Ca=c?.reference?.url;(0,Re.useEffect)(()=>{Ge&&!be.current?.open&&be.current?.showModal(),!Ge&&be.current?.open&&be.current.close()},[Ge]),(0,Re.useEffect)(()=>{let S=!1;return t(s+"/studio").then(x=>{S||(d(x),p(x.settings),x.jobs.length&&$("Review"))}).catch(x=>{S||He(vo(x))}),Me.current?.focus(),()=>{S=!0}},[s,t]),(0,Re.useEffect)(()=>{if(!he)return;let S=window.setInterval(()=>{t(s+"/studio").then(d).catch(x=>He(vo(x)))},2e3);return()=>window.clearInterval(S)},[he,s,t]),(0,Re.useEffect)(()=>{let S=!1;if(F(null),Te(""),Le.current!==ga&&(Ae.current=null,Le.current=ga),!Ca||!JSON.parse(ga).expressions.length){re(!1);return}re(!0);let x=window.setTimeout(()=>{t(s+"/studio/plan",{method:"POST",body:ga}).then(D=>{S||F(D)}).catch(D=>{S||Te(vo(D))}).finally(()=>{S||re(!1)})},350);return()=>{S=!0,window.clearTimeout(x)}},[ga,Ca,s,t]);async function Se(S){Ne(!0),He(""),Oe("");try{await S()}catch(x){He(vo(x));try{d(await Q(""))}catch{}}finally{Ne(!1)}}async function At(){let S=await Q("plan",ea);F(S),Ae.current??(Ae.current=l5());try{let x=Ae.current,D=await Q("jobs",{...ea,plan:S,submissionId:x});if(d(D),Ae.current=null,!D.jobs.some(P=>P.id===x)){Oe("This submission already completed and its artwork was removed. Click Generate to start a new batch.");return}$("Review"),Oe("Drawing a saved batch. Existing scene images stay active.")}catch(x){if(/plan changed|model changed|size changed/i.test(vo(x)))F(await Q("plan",ea)),Oe("Summary refreshed. Click Generate to submit the updated request.");else throw x}}async function Ta(S,x){if(!S.length)throw new Error("Choose cutouts and expression slots.");let D=[];for(let{candidate:P,expressionId:ge}of S)D.push({id:P.cell.id,expressionId:ge,expected:P.cell,...P.cell.rendered?{}:{image:(await eb(P.sheet,P.cell,P.cell.cleanup)).toDataURL("image/png")}});qe(await Q("assign",{cells:D,batchId:x})),Oe("Assigned. These images are now used in scenes.")}async function Da(S){let x=(S.assignments??[]).filter(P=>Ze.some(ge=>ge.id===P.expressionId)),D=new Map;for(let P of S.sheets)for(let ge of P.cells)!ge.expressionId||!Ze.some(oe=>oe.id===ge.expressionId)||x.some(oe=>oe.cellId===ge.id)||D.set(ge.view+":"+ge.expressionId,{candidate:{sheet:P,cell:ge},expressionId:ge.expressionId});for(let P of x){let ge=J.find(oe=>oe.cell.id===P.cellId);ge&&D.set(P.view+":"+P.expressionId,{candidate:ge,expressionId:P.expressionId})}await Ta([...D.values()],S.id)}async function Ht(S){let x=await Q("repair-background",{batchId:S.id});d(x);let D=new Map((x.repairedCells??[]).map(ge=>[ge.originalId,ge.cellId])),P=x.assignments.flatMap(ge=>{let oe=D.get(ge.cellId),lt=x.jobs.flatMap(_a=>_a.sheets).find(_a=>_a.cells.some(Nn=>Nn.id===oe)),ta=lt?.cells.find(_a=>_a.id===oe);return lt&&ta?[{candidate:{sheet:lt,cell:ta},expressionId:ge.expressionId}]:[]});P.length&&await Ta(P,S.id),Oe("Backgrounds repaired. Original artwork retained; active sprites updated.")}function T(S){Tt(S.cell.id),Zt(c?.assignments.find(x=>x.cellId===S.cell.id)?.expressionId??S.cell.expressionId??Ze[0]?.id??""),q(null)}async function K(S){let x=await Q("delete",{...S,confirmed:!0});d(x.studio),nt(null),Ae.current=null,ft([]),Tt(""),q(null),Oe("Artwork removed. "+x.deleted+" unused files deleted."+(x.failures.length?" Use Delete unused files to retry: "+x.failures.map(D=>D.error).join("; "):""))}async function le(){let S=await Wf(pe),x;if(it&&typeof it=="object"&&Array.isArray(it.cells))x=it.cells;else{if(!Number.isInteger(Pe)||!Number.isInteger(Xe)||Pe<1||Xe<1)throw new Error("Choose a valid grid.");let D=G.split(",").map(P=>P.trim().toLowerCase().replace(/\s+/g,"_")).filter(Boolean);if(!D.length||D.length>Pe*Xe)throw new Error("Supply one name per occupied cell, separated by commas.");x=D.map((P,ge)=>{let oe=Math.floor(ge%Pe*S.naturalWidth/Pe),lt=Math.floor(Math.floor(ge/Pe)*S.naturalHeight/Xe);return{label:P,view:f,x:oe,y:lt,width:Math.floor((ge%Pe+1)*S.naturalWidth/Pe)-oe,height:Math.floor((Math.floor(ge/Pe)+1)*S.naturalHeight/Xe)-lt}})}d(await Q("import",{image:pe,cells:x})),ue(""),Nt(null),$("Review")}function Qe(S){if(S.style&&Object.hasOwn(lh,S.style)){let D=S.style;p(P=>P&&{...P,style:D,connectionId:S.connectionId,prompts:{...P.prompts,[D]:S.stylePrompt??P.prompts[D]}})}let x=S.requestedExpressions??[...S.sheets.flatMap(D=>D.cells),...S.pendingExpressions??[]];z([...new Set(x.map(D=>D.label))]),w(Object.fromEntries(x.map(D=>[D.label,D.pose]))),y(S.view),H(S.individual??!1),Ae.current=null,$("Create"),Oe("Retry prepared. Generate creates a new batch with the displayed request count.")}let Fe=(0,k.jsxs)("aside",{className:"vss-panel vss-slots","data-open":Ue,"aria-label":"Expression assignment panel",children:[(0,k.jsxs)("h3",{children:["Expressions \xB7 ",Ze.length]}),(0,k.jsx)("p",{className:"vss-hint",children:rt?"Selected: "+rt.cell.label+" \xB7 "+rt.cell.view:"Select a cutout, then Assign. Or drag it onto an expression."}),(0,k.jsxs)("label",{children:["Assign selected cutout to",(0,k.jsxs)("select",{"aria-label":"Assign selected cutout to",value:Dt,onChange:S=>Zt(S.target.value),children:[(0,k.jsx)("option",{value:"",children:"Choose expression"}),Ze.map(S=>(0,k.jsx)("option",{value:S.id,children:S.name},S.id))]})]}),(0,k.jsx)("button",{className:"vss-primary",disabled:ne||!rt||!Dt,onClick:()=>rt&&void Se(()=>Ta([{candidate:rt,expressionId:Dt}])),children:"Assign"}),(0,k.jsx)("button",{className:"vss-slot-toggle","aria-expanded":Ue,onClick:()=>_t(!Ue),children:Ue?"Hide expressions":"Show expressions"}),(0,k.jsx)("div",{className:"vss-slot-list",children:Ze.map(S=>{let x=(c?.assignments??[]).filter(D=>D.expressionId===S.id);return(0,k.jsxs)("div",{className:"vss-slot",onDragOver:D=>D.preventDefault(),onDrop:D=>{D.preventDefault();let P=J.find(ge=>ge.cell.id===D.dataTransfer.getData("application/x-villages-cutout"));P&&!ne&&Se(()=>Ta([{candidate:P,expressionId:S.id}]))},children:[(0,k.jsxs)("strong",{children:[S.name,c?.defaultExpressionId===S.id?" \xB7 Default":""]}),(0,k.jsx)("small",{children:S.useWhen||S.pose||"Uses this expression's name as guidance."}),(0,k.jsxs)("div",{className:"vss-row",children:[x.map(D=>{let P=J.find(ge=>ge.cell.id===D.cellId);return P?(0,k.jsxs)("div",{className:"vss-mini",children:[(0,k.jsx)(ch,{candidate:P}),(0,k.jsx)("small",{children:D.view})]},D.view):null}),x.length?null:(0,k.jsx)("small",{children:"Empty \xB7 optional"})]}),(0,k.jsxs)("button",{disabled:ne||!rt,"aria-label":"Assign selected cutout to "+S.name,onClick:()=>rt&&void Se(()=>Ta([{candidate:rt,expressionId:S.id}])),children:["Assign ",rt?.cell.view??""," here"]}),x.length&&c?.defaultExpressionId!==S.id?(0,k.jsx)("button",{disabled:ne,onClick:()=>{Se(async()=>qe(await Q("expression",{defaultId:S.id})))},children:"Use as default scene image"}):null,(0,k.jsxs)("details",{children:[(0,k.jsxs)("summary",{children:["Edit ",S.name]}),(0,k.jsxs)("form",{onSubmit:D=>{D.preventDefault();let P=new FormData(D.currentTarget);Se(async()=>qe(await Q("expression",{id:S.id,name:P.get("name"),label:P.get("name"),pose:P.get("pose"),useWhen:P.get("useWhen")})))},children:[(0,k.jsxs)("label",{children:["Name",(0,k.jsx)("input",{name:"name",defaultValue:S.name,maxLength:40,required:!0})]}),(0,k.jsxs)("label",{children:["Pose for generation",(0,k.jsx)("input",{name:"pose",defaultValue:S.pose,maxLength:500})]}),(0,k.jsxs)("label",{children:["Use when \xB7 optional",(0,k.jsx)("input",{name:"useWhen",defaultValue:S.useWhen,maxLength:1e3})]}),(0,k.jsx)("button",{disabled:ne,children:"Save expression"}),(0,k.jsx)("button",{type:"button",disabled:ne||!!x.length,onClick:()=>{Se(async()=>qe(await Q("expression",{removeId:S.id})))},children:"Remove empty slot"})]})]})]},S.id)})}),(0,k.jsxs)("form",{onSubmit:S=>{S.preventDefault();let x=O.trim();Se(async()=>{qe(await Q("expression",{name:x})),N(""),z(D=>[...new Set([...D,x.toLowerCase().replace(/\s+/g,"_")])])})},children:[(0,k.jsxs)("label",{children:["New expression",(0,k.jsx)("input",{value:O,maxLength:40,onChange:S=>N(S.target.value),placeholder:"Delighted, running\u2026"})]}),(0,k.jsx)("button",{disabled:ne||!O.trim(),children:"Add expression"})]})]});return(0,k.jsxs)("section",{className:"vss","aria-label":e.name+" Sprite Studio",children:[(0,k.jsx)("style",{children:d5+u5}),(0,k.jsxs)("header",{className:"vss-header",children:[(0,k.jsxs)("div",{children:[(0,k.jsxs)("p",{className:"vss-hint",children:["Villagers / ",e.name]}),(0,k.jsxs)("h2",{ref:Me,tabIndex:-1,children:[e.name,"\u2019s Sprite Studio"]}),(0,k.jsxs)("small",{children:[Ye.length," in use \xB7 ",J.length," saved cutouts \xB7 ",zt," pending review"]})]}),(0,k.jsx)("button",{disabled:ne,onClick:()=>{Se(async()=>{h&&await Q("settings",h),i()})},children:"\u2190 Back to Villagers"})]}),de&&!Ge?(0,k.jsx)("p",{className:"vss-error",role:"alert",children:de}):null,(0,k.jsx)("p",{role:"status","aria-live":"polite",children:at}),!c||!h?(0,k.jsx)("p",{children:"Loading saved sprite work\u2026"}):(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)("nav",{className:"vss-nav","aria-label":"Sprite Studio sections",children:["Create","Review","In use"].map(S=>(0,k.jsxs)("button",{"aria-pressed":b===S,onClick:()=>{$(S),q(null)},children:[S,S==="Review"&&zt?" \xB7 "+zt:""]},S))}),c.reference?null:(0,k.jsxs)("div",{className:"vss-panel",children:[(0,k.jsx)("h3",{children:"Capture an identity reference"}),(0,k.jsx)("button",{disabled:ne,onClick:()=>{Se(async()=>d(await Q("reference",{})))},children:"Capture current avatar"}),(0,k.jsxs)("label",{children:["Upload reference",(0,k.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",onChange:S=>{let x=S.target.files?.[0];x&&Se(async()=>d(await Q("reference",{image:await Kf(x)})))}})]})]}),b==="Create"?(0,k.jsxs)("div",{className:"vss-create",children:[(0,k.jsxs)("div",{className:"vss-panel",children:[(0,k.jsx)("h3",{children:"Generate a saved batch"}),(0,k.jsx)("p",{className:"vss-hint",children:"Choose any expressions. Neutral is optional. Assign images in Review to use them in scenes."}),(0,k.jsxs)("label",{children:["View",(0,k.jsxs)("select",{"aria-label":"View",value:f,onChange:S=>y(S.target.value),children:[(0,k.jsx)("option",{value:"front",children:"Front \xB7 facing you"}),(0,k.jsx)("option",{value:"side",children:"Side \xB7 facing right, mirrored for left"})]})]}),(0,k.jsx)("div",{className:"vss-expressions",children:Ze.map(S=>(0,k.jsxs)("div",{children:[(0,k.jsxs)("label",{className:"vss-check",children:[(0,k.jsx)("input",{type:"checkbox",checked:V.includes(S.label),onChange:x=>z(x.target.checked?[...V,S.label]:V.filter(D=>D!==S.label))}),S.name]}),V.includes(S.label)?(0,k.jsxs)("label",{children:["Pose \xB7 optional",(0,k.jsx)("input",{value:v[S.label]??S.pose,maxLength:500,onChange:x=>w({...v,[S.label]:x.target.value})})]}):null]},S.id))}),(0,k.jsxs)("label",{children:["Art style",(0,k.jsxs)("select",{"aria-label":"Art style",value:h.style,onChange:S=>p({...h,style:S.target.value}),children:[(0,k.jsx)("option",{value:"PAPERCRAFT",children:"Papercraft"}),(0,k.jsx)("option",{value:"BATTLEHIGHWAY",children:"Battle Highway"}),(0,k.jsx)("option",{value:"Custom",children:"Custom"})]})]}),(0,k.jsxs)("details",{children:[(0,k.jsx)("summary",{children:"Style prompt"}),(0,k.jsxs)("label",{children:["Drawing instructions",(0,k.jsx)("textarea",{value:h.prompts[h.style],maxLength:6e3,onChange:S=>p({...h,prompts:{...h.prompts,[h.style]:S.target.value}})})]}),(0,k.jsx)("button",{onClick:()=>p({...h,prompts:{...h.prompts,[h.style]:lh[h.style]}}),children:"Restore style prompt"})]}),(0,k.jsxs)("label",{children:["Image connection",(0,k.jsxs)("select",{"aria-label":"Image connection",value:h.connectionId,onChange:S=>p({...h,connectionId:S.target.value}),children:[(0,k.jsx)("option",{value:"",children:"Village default"}),c.connections.map(S=>(0,k.jsxs)("option",{value:S.id,children:[S.name," \xB7 ",S.model]},S.id))]})]}),(0,k.jsxs)("label",{children:["Drawing layout",(0,k.jsxs)("select",{"aria-label":"Drawing layout",value:A?"individual":"sheet",onChange:S=>H(S.target.value==="individual"),children:[(0,k.jsx)("option",{value:"sheet",children:"Efficient sheets \xB7 up to six sprites each"}),(0,k.jsx)("option",{value:"individual",children:"Individual \xB7 more drawing space per sprite"})]})]}),(0,k.jsx)("div",{className:"vss-panel","aria-label":"Generation request summary",children:B?(0,k.jsx)("p",{children:"Updating request summary\u2026"}):Y?(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)("strong",{children:[Y.connection.name," \xB7 ",Y.connection.model]}),(0,k.jsxs)("p",{children:[ea.expressions.length," expressions \xB7 ",Y.batches.length," image"," ",Y.batches.length===1?"request":"requests"," \xB7"," ",Y.estimatedCost===null?"Cost unavailable":"Estimated $"+Y.estimatedCost.toFixed(3)]}),Y.batches.map((S,x)=>(0,k.jsxs)("small",{children:["Sheet ",x+1,": ",S.count," sprites \xB7 ",S.cols," \xD7 ",S.rows," \xB7 ",S.width," \xD7"," ",S.height,"px source"]},x)),(0,k.jsxs)("small",{children:["Cutouts saved at 512 \xD7 768."," ",Y.localWorkflow?"Local workflow internal steps and costs are unavailable. ":"","No automatic retries or provider changes."]})]}):(0,k.jsx)("p",{className:"vss-hint",children:te||"Select expressions and capture a reference to see the request summary."})}),(0,k.jsx)("button",{className:"vss-primary",disabled:ne||he||B||!Y||!ea.expressions.length,onClick:()=>{Se(At)},children:ne?"Working\u2026":"Generate"}),(0,k.jsxs)("details",{children:[(0,k.jsx)("summary",{children:"Import images or a sheet"}),(0,k.jsxs)("label",{children:["Image",(0,k.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",onChange:S=>{let x=S.target.files?.[0];x&&Se(async()=>ue(await Kf(x)))}})]}),(0,k.jsxs)("label",{children:["Optional exported JSON manifest",(0,k.jsx)("input",{type:"file",accept:".json,application/json",onChange:S=>{let x=S.target.files?.[0];x&&Se(async()=>Nt(JSON.parse(await x.text())))}})]}),it?(0,k.jsx)("small",{children:"Using manifest cell positions and views."}):(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)("div",{className:"vss-fields",children:[(0,k.jsxs)("label",{children:["Columns",(0,k.jsx)("input",{type:"number",min:1,value:Pe,onChange:S=>qt(Number(S.target.value))})]}),(0,k.jsxs)("label",{children:["Rows",(0,k.jsx)("input",{type:"number",min:1,value:Xe,onChange:S=>I(Number(S.target.value))})]})]}),(0,k.jsxs)("label",{children:["Expression names in reading order",(0,k.jsx)("input",{value:G,onChange:S=>ye(S.target.value)})]})]}),(0,k.jsx)("button",{disabled:ne||!pe,onClick:()=>{Se(le)},children:"Import to gallery"})]})]}),(0,k.jsxs)("div",{children:[c.reference?(0,k.jsxs)("div",{className:"vss-panel",children:[(0,k.jsx)("h3",{children:"Original identity reference"}),(0,k.jsx)("img",{className:"vss-reference",src:c.reference.url,alt:"Captured identity reference"}),(0,k.jsx)("small",{children:"Used for every generation and art style."})]}):null,Fe]})]}):b==="Review"?(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)("div",{className:"vss-row",children:[(0,k.jsx)("h3",{children:"Saved artwork"}),(0,k.jsx)("button",{disabled:ne||!zt,onClick:()=>{Se(async()=>{d(await Q("clear-review",{})),Qt(!1),Oe("Pending review cleared. All saved artwork remains available.")})},children:"Clear pending review"}),(0,k.jsxs)("label",{className:"vss-check",children:[(0,k.jsx)("input",{type:"checkbox",checked:ie,onChange:S=>Qt(S.target.checked)}),"Pending only"]}),(0,k.jsxs)("button",{disabled:ne||!me.length,onClick:()=>nt({ids:me,deleteFiles:!1}),children:["Delete selected cutouts (",me.length,")"]}),(0,k.jsx)("button",{disabled:ne,onClick:()=>{Se(async()=>{if(!window.confirm("Delete unused Studio-owned files? Saved alternatives, active assignments, shared originals, and the identity reference are retained."))return;let S=await Q("delete-unused",{});d(S.studio),Oe(S.deleted+" unused files deleted."+(S.failures.length?" Retry needed: "+S.failures.map(x=>x.error).join("; "):""))})},children:"Delete unused files"})]}),(0,k.jsxs)("div",{className:"vss-library",children:[(0,k.jsxs)("div",{className:"vss-gallery",children:[c.jobs.length?null:(0,k.jsx)("div",{className:"vss-panel",children:(0,k.jsx)("p",{children:"Generate or import artwork to begin. Each batch stays here for future swaps."})}),[...c.jobs].reverse().map(S=>{let x=S.sheets.flatMap(D=>D.cells.filter(P=>!ie||P.pending).map(P=>({sheet:D,cell:P})));return ie&&!x.length&&S.status==="ready"?null:(0,k.jsxs)("article",{className:"vss-panel","aria-label":"Batch "+S.id,children:[(0,k.jsx)("h3",{children:S.style==="PAPERCRAFT"?"Papercraft":S.style==="BATTLEHIGHWAY"?"Battle Highway":S.style||S.model||"Saved batch"}),(0,k.jsxs)("small",{children:[new Date(S.createdAt).toLocaleString()," \xB7 ",S.model," \xB7 ",S.attempted," submitted /"," ",S.planned," planned requests \xB7 ",S.status]}),S.error?(0,k.jsx)("p",{className:"vss-hint",children:S.error}):null,(0,k.jsxs)("div",{className:"vss-row",children:[(0,k.jsx)("button",{className:"vss-primary",disabled:ne||S.status==="running"||!x.length,onClick:()=>{Se(()=>Da(S))},children:"Use this batch"}),(0,k.jsx)("button",{disabled:ne||S.status==="running",onClick:()=>nt({batchId:S.id,deleteFiles:!1}),children:"Delete batch"}),(0,k.jsx)("button",{disabled:ne||S.status==="running"||!x.length,onClick:()=>{Se(()=>Ht(S))},children:"Repair backgrounds"}),S.status==="interrupted"?(0,k.jsx)("button",{disabled:ne||he,onClick:()=>Qe(S),children:"Prepare retry"}):null,S.pendingAssetId&&S.status!=="running"?(0,k.jsx)("button",{disabled:ne,onClick:()=>{Se(async()=>d(await Q("recover",{id:S.id})))},children:"Recover saved original \xB7 no image request"}):null]}),(0,k.jsx)("div",{className:"vss-originals",children:S.sheets.map((D,P)=>(0,k.jsxs)("details",{children:[(0,k.jsxs)("summary",{children:["Original sheet ",P+1,(0,k.jsx)("img",{className:"vss-sheet-thumb",src:D.url,alt:"Sheet thumbnail "+(P+1)})]}),(0,k.jsx)("a",{href:D.url,target:"_blank",rel:"noreferrer",children:(0,k.jsx)("img",{src:D.url,alt:"Original sheet "+(P+1)})}),(0,k.jsxs)("small",{children:[D.width," \xD7 ",D.height,"px \xB7 Provider usage"," ",D.usage?JSON.stringify(D.usage):"unavailable"]})]},D.assetId+":"+P))}),(0,k.jsx)("div",{className:"vss-grid",children:x.map(D=>{let P=c.assignments.filter(ge=>ge.cellId===D.cell.id);return(0,k.jsxs)("div",{className:"vss-card",draggable:!ne,onDragStart:ge=>{ge.dataTransfer.setData("application/x-villages-cutout",D.cell.id),ge.dataTransfer.effectAllowed="copy",T(D)},children:[(0,k.jsx)("button",{"aria-label":"Select "+D.cell.view+" "+D.cell.label+" cutout","aria-pressed":_e===D.cell.id,onClick:()=>T(D),children:(0,k.jsx)(ch,{candidate:D})}),(0,k.jsx)("strong",{children:D.cell.label.replaceAll("_"," ")}),(0,k.jsx)("small",{children:D.cell.view}),P.length?(0,k.jsxs)("span",{className:"vss-badge",children:["In use \xB7"," ",P.map(ge=>Ze.find(oe=>oe.id===ge.expressionId)?.name).join(", ")]}):(0,k.jsx)("small",{children:D.cell.pending?"Pending review":"Saved alternative"}),(0,k.jsxs)("label",{className:"vss-check",children:[(0,k.jsx)("input",{type:"checkbox",checked:me.includes(D.cell.id),"aria-label":"Select "+D.cell.label+" for deletion",onChange:ge=>ft(ge.target.checked?[...me,D.cell.id]:me.filter(oe=>oe!==D.cell.id))}),"Select for deletion"]}),(0,k.jsx)("button",{disabled:ne,onClick:()=>{T(D),q(structuredClone(D.cell))},children:"Adjust image"})]},D.cell.id)})})]},S.id)})]}),Fe]}),R&&Et?(0,k.jsxs)("div",{className:"vss-panel","aria-label":"Adjust image",children:[(0,k.jsx)("h3",{children:"Adjust image \xB7 saves another cutout"}),(0,k.jsxs)("div",{className:"vss-adjust",children:[(0,k.jsx)("div",{className:"vss-stage","data-background":"checker",children:(0,k.jsx)(ch,{candidate:{sheet:Et.sheet,cell:{...R,rendered:void 0}}})}),(0,k.jsxs)("svg",{className:"vss-source",viewBox:"0 0 "+Et.sheet.width+" "+Et.sheet.height,role:"img","aria-label":"Original sheet with selected crop",children:[(0,k.jsx)("image",{href:Et.sheet.url,width:Et.sheet.width,height:Et.sheet.height}),(0,k.jsx)("rect",{x:R.x,y:R.y,width:R.width,height:R.height,fill:"none",stroke:"#c5a4ff",strokeWidth:Math.max(3,Et.sheet.width/150)})]})]}),(0,k.jsx)("div",{className:"vss-fields",children:["x","y","width","height","scale","offsetX","offsetY"].map(S=>(0,k.jsxs)("label",{children:[{x:"Crop X",y:"Crop Y",width:"Crop width",height:"Crop height",scale:"Scale",offsetX:"Horizontal offset",offsetY:"Foot offset"}[S],(0,k.jsx)("input",{type:"number",step:S==="scale"?.05:1,value:R[S],onChange:x=>q({...R,[S]:Number(x.target.value)})})]},S))}),(0,k.jsxs)("label",{className:"vss-check",children:[(0,k.jsx)("input",{type:"checkbox",checked:R.cleanup??!1,onChange:S=>q({...R,cleanup:S.target.checked})}),"Remove background"]}),(0,k.jsxs)("div",{className:"vss-row",children:[(0,k.jsx)("button",{disabled:ne,onClick:()=>{Se(async()=>{let S=await Q("cell",{id:R.id,cell:R});d(S),Tt(S.adjustedCellId??_e),q(null),Oe("Adjusted cutout saved. Assign it when ready.")})},children:"Save adjusted cutout"}),(0,k.jsx)("button",{onClick:()=>q(null),children:"Cancel"})]})]}):null]}):(0,k.jsxs)("div",{className:"vss-panel",children:[(0,k.jsx)("h3",{children:"In use"}),(0,k.jsx)("p",{className:"vss-hint",children:"These assignments are used in scenes. Saved alternatives remain in Review."}),(0,k.jsx)("div",{className:"vss-grid",children:Ye.map(S=>(0,k.jsxs)("div",{className:"vss-card",children:[(0,k.jsx)("img",{src:S.url,alt:S.label+" "+S.view}),(0,k.jsx)("strong",{children:S.label.replaceAll("_"," ")}),(0,k.jsx)("small",{children:S.view}),(0,k.jsx)("button",{disabled:ne,onClick:()=>{Se(async()=>{qe(await Q("remove",S)),Oe("Removed from scenes. Saved artwork remains available.")})},children:"Remove from scenes"})]},S.view+":"+S.label))}),Ye.length?(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)("label",{children:["Scene framing",(0,k.jsxs)("select",{value:e.sprite?.framing.mode??"full",onChange:S=>{Se(async()=>a(await t(s+"/framing",{method:"POST",body:JSON.stringify({mode:S.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,k.jsx)("option",{value:"full",children:"Full body"}),(0,k.jsx)("option",{value:"half",children:"Half body"})]})]}),e.sprite?.framing.mode==="half"?(0,k.jsxs)("label",{children:["Visible body height \xB7 percent",(0,k.jsx)("input",{type:"number",min:40,max:85,defaultValue:e.sprite.framing.cropPercent,onBlur:S=>{let x=Number(S.target.value);x!==e.sprite?.framing.cropPercent&&Se(async()=>a(await t(s+"/framing",{method:"POST",body:JSON.stringify({mode:"half",cropPercent:x})})))}})]}):null,(0,k.jsx)("button",{disabled:ne,onClick:()=>{Se(r)},children:"Download both views and manifest"})]}):(0,k.jsx)("p",{children:"No assigned images yet."}),Fe]})]}),(0,k.jsx)("dialog",{ref:be,className:"vss-delete-dialog","aria-labelledby":"vss-delete-title",onCancel:()=>nt(null),children:Ge?(0,k.jsxs)("div",{className:"vss-panel",children:[(0,k.jsx)("h3",{id:"vss-delete-title",children:"Delete saved artwork?"}),de?(0,k.jsx)("p",{className:"vss-error",role:"alert",children:de}):null,(0,k.jsxs)("p",{children:[Ge.batchId?"Remove this batch from the gallery.":"Remove "+Ge.ids?.length+" selected cutouts from the gallery."," ","Images currently in use are protected."]}),(0,k.jsxs)("label",{className:"vss-check",children:[(0,k.jsx)("input",{type:"checkbox",checked:Ge.deleteFiles,onChange:S=>nt({...Ge,deleteFiles:S.target.checked})}),"Also delete unused files from disk"]}),(0,k.jsx)("small",{children:"Shared originals and retained alternatives stay saved. Files kept on disk can be removed later with Delete unused files."}),(0,k.jsxs)("div",{className:"vss-row",children:[(0,k.jsx)("button",{disabled:ne,onClick:()=>nt(null),children:"Cancel"}),(0,k.jsx)("button",{disabled:ne,onClick:()=>{Se(()=>K(Ge))},children:"Delete artwork"})]})]}):null})]})}var u5=`
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
`;var m=In(bo()),K1=In(l1());function yk(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),i="",r=[],s=[];for(let c=0;c<a.length;c++){let d=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(d)?.[1];if(h&&(i?h[0]===i[0]&&h.length>=i.length&&(i=""):i=h),!i&&!d.trim()&&(!t||c<a.length-1)){let p=r.join(`
`).trim();p&&s.push(p),r=[]}else r.push(d)}if(!t){let c=r.join(`
`).trim();c&&s.push(c)}return s}var wk=['"',"'","\u201D","\u2019","\xBB","\u300D"],xk=['"',"'","\u201C","\u2018","\xAB","\u300C"];function c1(e){let t=e.trim();return wk.includes(t.slice(-1))&&xk.some(i=>t.slice(0,-1).includes(i))?"speech":"prose"}function d1(e,t){let a=yk(e),i=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return i();let r=[],s=[],c=[],d=[];for(let h=0;h<a.length;h+=1){let p=t[h];if(p.kind==="untagged"){r.push(a[h]),s.push(d),c.push(p.expression??null),d=[];continue}let b={register:p.kind==="whisper"?"whisper":"side",text:p.text,...p.target?{target:p.target}:{}};r.length?s[s.length-1].push(b):d.push(b)}return r.length===0?i():{paragraphs:r,asides:s,expressions:c}}var $k="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function jr(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],i=new RegExp($k,"g"),r=0,s,c=d=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+d};return}a.push({kind:"text",text:d})};for(;(s=i.exec(e))!==null;)s.index>r&&c(e.slice(r,s.index)),s[1]!=null?c(s[1]):s[2]!=null&&s[3]!=null?a.push({kind:"link",text:s[2],href:s[3]}):s[4]!=null?a.push({kind:"code",text:s[4]}):s[5]!=null?a.push({kind:"styled",style:"highlight",children:jr(s[5],t+1)}):s[6]!=null?a.push({kind:"styled",style:"strikethrough",children:jr(s[6],t+1)}):s[7]!=null?a.push({kind:"styled",style:"bold-italic",children:jr(s[7],t+1)}):s[8]!=null?a.push({kind:"styled",style:"bold",children:jr(s[8],t+1)}):s[9]!=null?a.push({kind:"styled",style:"underline",children:jr(s[9],t+1)}):(s[10]!=null||s[11]!=null)&&a.push({kind:"styled",style:"italic",children:jr(s[10]??s[11],t+1)}),r=s.index+s[0].length;return r<e.length&&c(e.slice(r)),a}function u1(e){return jr(e,0)}function Ni(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function h1(e){return e===null||typeof e=="string"}function m1(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function cu(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function Nk(e){return e===null?!0:Ni(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function Sk(e){if(!Ni(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!cu(e.capabilities)||!Ni(e.presentation)||!Ni(e.occupancy)||!Ni(e.state))return!1;let{presentation:t,occupancy:a,state:i}=e;return Nk(t.image)&&m1(t.x)&&m1(t.y)&&typeof a.playerHome=="boolean"&&h1(a.residentCharacterId)&&h1(a.homeKind)&&typeof i.condition=="string"&&cu(i.upgrades)&&cu(i.furniture)&&cu(i.publicFacts)&&typeof i.updatedAt=="string"}function p1(e){if(!Ni(e)||!Ni(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(Sk),i=Array.isArray(e.venueRequests)?e.venueRequests:[],r=i.filter(s=>Ni(s)&&typeof s.id=="string"&&Ni(s.venueDraft)&&typeof s.venueDraft.name=="string"&&typeof s.venueDraft.category=="string");return a.length===t.length&&r.length===i.length&&i===e.venueRequests?e:{...e,venueRequests:r,settings:{...e.settings,venues:a}}}function g1(e,t,a){return e==="Enter"&&!t&&!a}function du(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,i=>i.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function f1(e,t,a,i){let r=Math.max(0,a-1);return!e||e.roomId!==t?r:a>e.stepCount?e.stepCount:Math.min(i,r)}function gs(e,t){return t?.roomId===e}function b1(e,t){return e.status==="closed"&&e.submissions?.some(a=>a.id===t)===!0}function og(e){return Object.fromEntries(e.map((t,a)=>[t,{position:e.length===3&&a===1?"center":a<Math.ceil(e.length/2)?"left":"right",expression:"",look:{target:"player"}}]))}function sg(e){let t=(e.staging??[]).map(r=>({...r}));if(!e.speakerId||e.kind==="narration"||e.speakerId==="__venue_scene__")return t;let a=t.find(r=>r.characterId===e.speakerId)??{characterId:e.speakerId};!a.expression&&e.expression&&(a.expression=e.expression);let i=e.gazeAt||(e.kind==="whisper"?e.targetId:void 0);return!a.look&&i&&(a.look=i==="player"?{target:"player"}:{target:"villager",characterId:i}),!t.includes(a)&&(a.expression||a.look)&&t.push(a),t}function v1(e,t){return Object.fromEntries(Object.entries(e).map(([a,i])=>[a,i.look.target==="villager"&&!t.includes(i.look.characterId)?{...i,look:{target:"player"}}:i]))}function y1(e,t){let a=og(e),i=e;return t.map(r=>{r.beforeIds&&(i=r.beforeIds,a=v1(a,i)),a={...a};for(let s of r.cues??[]){if(!i.includes(s.characterId)||!a[s.characterId])continue;let{characterId:c,...d}=s;a[c]={...a[c],...d}}return r.afterIds&&(i=r.afterIds,a=v1(a,i)),{state:a,activeIds:i}})}function w1(e,t){let a=new Map,i=new Map(e.flatMap((r,s)=>r.id?[[r.id,s]]:[]));for(let r of t){let s=(r.replyLineIds??[]).filter(b=>i.has(b));if(!s.length)continue;let c=s[0],d=s.at(-1),h=i.get(c);h>0&&e[h-1].role==="user"&&(h-=1);let p=e[h].id;p&&r.activeIdsAtTurn&&a.set(p,{...a.get(p),beforeIds:r.activeIdsAtTurn}),r.activeIdsAfterTurn&&a.set(d,{...a.get(d),afterIds:r.activeIdsAfterTurn})}return a}function x1(e,t){let a=["left","center","right"],i={};a.forEach((r,s)=>{let c=Object.keys(t).filter(d=>t[d]?.position===r);c.forEach((d,h)=>{i[d]={x:(s+(h+.5)/c.length)/3,width:Math.min(.25,.9/(3*c.length)),facing:"front"}})});for(let r of Object.keys(i))e.includes(r)||delete i[r];for(let r of e){let s=i[r];if(!s)continue;let c=t[r].look;if(c.target==="direction")s.facing=c.direction;else if(c.target==="villager"&&i[c.characterId]){let d=i[c.characterId].x;s.facing=d===s.x?"front":d<s.x?"left":"right"}}return i}function $1(e,t){return t<0||t===e?"front":t<e?"left":"right"}function N1(e,t,a){let i=a==="front"?"front":"side",r=d=>d.expressionId===t||d.label===t||d.aliases?.includes(t),s=d=>d.isDefault||d.label==="neutral",c=e.find(d=>d.view===i&&r(d))??e.find(d=>d.view==="front"&&r(d))??e.find(r)??e.find(d=>d.view===i&&d.isDefault)??e.find(d=>d.view==="front"&&d.isDefault)??e.find(d=>d.isDefault)??e.find(d=>d.view===i&&s(d))??e.find(d=>d.view==="front"&&s(d))??e.find(d=>d.view===i)??e[0];return c?{image:c,mirrored:c.view==="side"&&a==="left"}:null}function S1(e,t,a){let i=.2*a.photoWidth/a.width,r=.2*a.photoHeight/a.height;return t.some(s=>s.x!==null&&s.y!==null&&Math.abs(s.x-e.x)<i&&Math.abs(s.y-e.y)<r)}function k1(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var sr=(e,t,a)=>Math.min(a,Math.max(t,e));function uu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function lg(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let i=Math.min(t.width/e.width,t.height/e.height),r=Math.max(a.zoom,uu(e,t)),s=e.width*i*r,c=e.height*i*r,d=t.width/2-a.centerX*s,h=t.height/2-a.centerY*c;return{left:s<=t.width?(t.width-s)/2:sr(d,t.width-s,0),top:c<=t.height?(t.height-c)/2:sr(h,t.height-c,0),width:s,height:c}}function C1(e,t,a,i,r,s){let c=lg(e,t,a);if(!c.width||!c.height)return a;let d=uu(e,t),h=sr(a.zoom*s,d,Math.max(4,d*2)),p=h/Math.max(a.zoom,d),b=c.width*p,$=c.height*p,f=(i.x-c.left)/c.width,y=(i.y-c.top)/c.height,V=r.x-f*b,z=r.y-y*$;return{zoom:h,centerX:sr((t.width/2-V)/b,0,1),centerY:sr((t.height/2-z)/$,0,1)}}function T1(e,t){let a=Math.max(1,t),i=Math.max(4,a*2);return .32+1.03*((sr(e,a,i)-a)/(i-a))}function E1(e,t){return t?Math.max(1,e):e}function cg(e,t,a){let i=Math.min(90,t.width/2),r=64,s=116,c=e.left+a.x*e.width,d=e.top+a.y*e.height,h=d+r,p=h+s<=t.height?h:d-r-s;return{left:sr(c,i,t.width-i),top:sr(p,0,Math.max(0,t.height-s))}}var o=In(fr()),n="marinara-capability-villages",A1="marinara-capability-villages-styles",kk="/api/villages",Ck=.7,yg=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],dg=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),Tk={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},Pr=e=>yg.find(t=>t.value===e),Ek=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,R1={roads:"auto",structures:"auto",water:"auto"},hu=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],M1=1,z1=3,ug="__villages_image_disabled__",V1=["neutral","happy","sad","angry","surprised","thinking"];function O1(e,t,a,i,r=!1,s=1){let c=t==="gathering"?"Gathering Place":r?"Your residence":`Residence ${s}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:i},occupancy:{playerHome:r,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}var W1={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function mu(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function Ak(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let i=Math.floor(a/36e5),r=Math.max(1,Math.ceil(a%36e5/6e4));return i>0?`${i}h ${r}m left`:`${r}m left`}function Rk({library:e,busy:t,onRefresh:a,onForget:i}){let[r,s]=(0,m.useState)("all"),[c,d]=(0,m.useState)(""),[h,p]=(0,m.useState)(""),[b,$]=(0,m.useState)(null),[f,y]=(0,m.useState)(""),V=Date.now(),z=(w,A)=>(!h.trim()||`${w} ${A.map(H=>H.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||A.some(H=>H.id===c)),O=(e?.recollections??[]).filter(w=>z(w.text,[...w.subjects,...w.knownBy])),N=(e?.durable??[]).filter(w=>z(w.text,[...w.subjects,...w.knownBy])),v=async(w,A)=>{try{let H=await j(`/rooms/archive/${encodeURIComponent(w)}`);$({visit:H.visit,lineIds:A}),y("")}catch(H){$(null),y(X(H,"The source visit could not be read."))}};return(0,o.jsxs)("div",{className:`${n}-memory-library`,children:[(0,o.jsxs)("section",{className:`${n}-memory-hero`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-kicker`,children:"Continuity, with receipts"}),(0,o.jsx)("h3",{children:"What your villagers carry forward"}),(0,o.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,o.jsxs)("div",{className:`${n}-memory-stats`,children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,o.jsxs)("div",{className:`${n}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"01"}),(0,o.jsx)("strong",{children:"Passing"}),(0,o.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"02"}),(0,o.jsx)("strong",{children:"Durable"}),(0,o.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"03"}),(0,o.jsx)("strong",{children:"Archive"}),(0,o.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,o.jsxs)("div",{className:`${n}-memory-health`,role:"status",children:[(0,o.jsx)("span",{children:"\u25C7"}),(0,o.jsxs)("div",{children:[(0,o.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,o.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,o.jsxs)("div",{className:`${n}-memory-toolbar`,children:[(0,o.jsx)("div",{className:`${n}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([w,A])=>(0,o.jsx)("button",{type:"button","data-active":r===w,onClick:()=>s(w),children:A},w))}),(0,o.jsx)("input",{type:"search",value:h,onChange:w=>p(w.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,o.jsxs)("select",{value:c,onChange:w=>d(w.target.value),"aria-label":"Filter memories by resident",children:[(0,o.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(w=>(0,o.jsx)("option",{value:w.id,children:w.name},w.id))]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&r!=="durable"&&O.length>0?(0,o.jsxs)("section",{className:`${n}-memory-section`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,o.jsx)("h3",{children:"Passing recollections"})]}),(0,o.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,o.jsx)("div",{className:`${n}-memory-grid`,children:O.map(w=>{let A=w.evidence[w.evidence.length-1]??{visitId:w.visitId,lineIds:[]};return(0,o.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"passing",children:[(0,o.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${n}-memory-pill`,children:"Passing"}),(0,o.jsx)("span",{children:Ak(w.expiresAt,V)})]}),(0,o.jsx)("p",{className:`${n}-memory-text`,children:w.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:mu(w.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:mu(w.knownBy)})]})]}),w.reinforcementCount>0?(0,o.jsxs)("p",{className:`${n}-memory-reinforced`,children:["\u21BB Reinforced ",w.reinforcementCount," ",w.reinforcementCount===1?"time":"times"]}):null,(0,o.jsxs)("div",{className:`${n}-memory-card-actions`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>{v(A.visitId,A.lineIds)},children:"View evidence"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>i("recollections",w.id),children:"Let go"})]})]},w.id)})})]}):null,e&&r!=="passing"&&N.length>0?(0,o.jsxs)("section",{className:`${n}-memory-section`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,o.jsx)("h3",{children:"Durable memories"})]}),(0,o.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,o.jsx)("div",{className:`${n}-memory-grid`,children:N.map(w=>(0,o.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"durable",children:[(0,o.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${n}-memory-pill`,children:w.memoryCategory?W1[w.memoryCategory]:w.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,o.jsxs)("span",{children:[w.dateLabel,I1(w)?` \xB7 ${I1(w)}`:""]})]}),(0,o.jsx)("p",{className:`${n}-memory-text`,children:w.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:mu(w.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:mu(w.knownBy)})]})]}),(0,o.jsxs)("div",{className:`${n}-memory-card-actions`,children:[w.evidence?(0,o.jsx)("button",{type:"button",onClick:()=>{v(w.evidence.visitId,w.evidence.lineIds)},children:"View evidence"}):(0,o.jsx)("span",{className:`${n}-memory-legacy`,children:"No evidence link on this older memory"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>i("durable",w.id),children:"Forget"})]})]},w.id))})]}):null,e&&(r!=="durable"&&O.length||r!=="passing"&&N.length)===0?(0,o.jsxs)("div",{className:`${n}-memory-empty`,children:[(0,o.jsx)("span",{children:"\u2727"}),(0,o.jsx)("h3",{children:"No memories match"}),(0,o.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,o.jsxs)("p",{className:`${n}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,f?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:f}):null,b?(0,o.jsxs)("section",{className:`${n}-memory-evidence`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,o.jsxs)("h3",{children:["Exact evidence \xB7 ",b.visit.placeName]})]}),(0,o.jsx)("button",{type:"button",onClick:()=>$(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,o.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,o.jsx)("ol",{children:b.visit.lines.filter(w=>b.lineIds.includes(w.id)).map(w=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:w.name||"Player"}),(0,o.jsxs)("small",{children:[bu(w.at)," \xB7 heard by"," ",w.heardBy.map(A=>b.visit.participants.find(H=>H.characterId===A)?.name??A).join(", ")||"no one"]})]}),ys(w.content,`memory-evidence-${w.id}-`)]},w.id))})]}):null]})}function bu(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":nx.format(t)}function I1(e){return bu(e.occurredAt)}function Mk(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function D1(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function hg(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var zk=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function Vk(e,t){let a=[],i=Date.parse(e);if(Number.isFinite(i)){let s=Math.floor((Date.now()-i)/864e5);a.push(s<=0?"written today":s===1?"written yesterday":`written ${s} days ago`)}let r=Date.parse(t);return a.push(Number.isFinite(r)?`fades ${zk.format(new Date(r))}`:"no set end"),a.join(" \xB7 ")}function Ok(e,t){let a=e.find(i=>i.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.zoneId&&a.zones?a.zones.find(i=>i.id===t.zoneId)?.image?.url??"":t.area==="private"?a.privateSpaces?.find(i=>i.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?cn(a,t.spaceClass).image:null)?.url??"":""}var wg=class extends m.Component{constructor(){super(...arguments);wc(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let i=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=i,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:i},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,o.jsx)("div",{className:`${n}-root`,role:"alert",children:(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h1",{className:`${n}-panel-title`,children:"Villages could not open"}),(0,o.jsx)("p",{className:`${n}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},mg=`
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
.${n}-room-screen .${n}-chat-cast[data-staging="true"] > .${n}-chat-cast-person[data-active="true"] { position: absolute; bottom: 0; flex: none; max-width: none; height: 100%; transition: left .22s ease, opacity .18s ease, filter .18s ease, transform .18s ease; }
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
`;function xg(){let e=document.getElementById(A1);if(!document.querySelector(n)){e?.remove();return}if(e){e.textContent!==mg&&(e.textContent=mg);return}let t=document.createElement("style");t.id=A1,t.textContent=mg,document.head.appendChild(t)}var Ik=new MutationObserver(()=>{document.querySelector(n)&&xg()});Ik.observe(document.head,{childList:!0,subtree:!0});var Dk="marinara_admin_secret";function ex(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(Dk)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var _k="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.",Xl=class extends Error{constructor(a,i,r){super(a);wc(this,"status",i);wc(this,"code",r)}};function tx(e,t,a){let i=e?.error,r=typeof i=="string"&&i?i:a;return t===403&&/admin[-_ ]?secret/iu.test(r)?new Error(`${_k} (${r})`):new Xl(r,t,e?.code)}async function j(e,t){let a=await fetch(`${kk}${e}`,{...t,headers:ex(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw tx(i,a.status,`The village replied ${a.status}.`);return p1(i)}async function Ng(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:ex(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw tx(i,a.status,`The Engine replied ${a.status}.`);return i}var Yr=e=>typeof e=="number"&&Number.isFinite(e);function Sg(e){let t=e;for(let $=0;$<2&&typeof t=="string";$+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:i,srcY:r,srcWidth:s,srcHeight:c}=a;if(Yr(i)&&Yr(r)&&Yr(s)&&Yr(c))return s<=0||c<=0||i<0||r<0||i+s>1.001||r+c>1.001?null:{srcX:i,srcY:r,srcWidth:s,srcHeight:c};let{zoom:d,offsetX:h,offsetY:p,fullImage:b}=a;return!Yr(d)||d<=0||!Yr(h)||!Yr(p)||b!==void 0&&typeof b!="boolean"?null:b===void 0?{zoom:d,offsetX:h,offsetY:p}:{zoom:d,offsetX:h,offsetY:p,fullImage:b}}function Hk(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function Uk(e,t){if(e.length===0)return{};let a=await Ng("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),i={};if(!Array.isArray(a))return i;for(let r of a){let s=typeof r?.id=="string"?r.id:"",c=typeof r?.avatarUrl=="string"?r.avatarUrl.trim():"";s.length>0&&c.length>0&&(i[s]={url:c,crop:Sg(r.avatarCrop)})}return i}async function Lk(e,t){let a=e.trim();if(a.length===0)return null;let i=await Ng(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),r=typeof i?.avatarPath=="string"?i.avatarPath.trim():"";return r.length===0?null:{url:r,crop:Sg(i.avatarCrop)}}function qk(e){let t=[];for(let a of e){let i=typeof a.id=="string"?a.id.trim():"";if(i.length===0)continue;let r=typeof a.provider=="string"?a.provider:"";if(r==="video_generation")continue;let s=typeof a.name=="string"&&a.name.trim()?a.name.trim():i;t.push({id:i,name:s,category:r==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function X(e,t){return e instanceof Error&&e.message?e.message:t}function fs(e){let t=X(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function _1(e){try{let{session:t}=await j("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}async function bs(e,t){try{t&&await j(`/rooms/${encodeURIComponent(e)}/operations/${encodeURIComponent(t)}`,{signal:AbortSignal.timeout(5e3)});let{session:a}=await j("/rooms/active",{signal:AbortSignal.timeout(5e3)});if(a?.id===e)return a;let{visit:i}=await j(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return i}catch{return null}}async function H1(e,t){try{let{visit:a}=await j(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return b1(a,t)?a:null}catch{return null}}function U1(e){let t=X(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function vu(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function ys(e,t){return ax(u1(e),t)}function ax(e,t){let a=0;return e.map(i=>{let r=`${t}${a++}`;switch(i.kind){case"text":return i.text;case"code":return(0,o.jsx)("code",{className:`${n}-chat-md-code`,dir:"ltr",children:i.text},r);case"link":return(0,o.jsx)("a",{className:`${n}-chat-md-link`,href:i.href,target:"_blank",rel:"noopener noreferrer",children:i.text},r);default:return Bk(i,r)}})}function Bk(e,t){let a=ax(e.children,`${t}-`);switch(e.style){case"bold":return(0,o.jsx)("strong",{children:a},t);case"bold-italic":return(0,o.jsx)("strong",{children:(0,o.jsx)("em",{children:a})},t);case"italic":return(0,o.jsx)("em",{children:a},t);case"underline":return(0,o.jsx)("u",{children:a},t);case"strikethrough":return(0,o.jsx)("del",{children:a},t);default:return(0,o.jsx)("mark",{className:`${n}-chat-md-highlight`,children:a},t)}}function jk(e){return e==="off"?"Automatic Events and new wishes are paused. Existing wishes can still be fulfilled or expire.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function yu(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}function Yk({zone:e,onSave:t}){let[a,i]=(0,m.useState)(e.description),[r,s]=(0,m.useState)(e.state?.features.map(b=>b.text).join(`
`)??""),[c,d]=(0,m.useState)(!1),[h,p]=(0,m.useState)("");return(0,o.jsxs)("section",{className:n+"-venue-card",children:[(0,o.jsxs)("h2",{children:[e.label," details"]}),(0,o.jsxs)("label",{children:["Description",(0,o.jsx)("textarea",{value:a,onChange:b=>i(b.target.value)})]}),(0,o.jsxs)("label",{children:["Features \xB7 one per line",(0,o.jsx)("textarea",{value:r,onChange:b=>s(b.target.value)})]}),(0,o.jsx)("p",{children:e.area==="shared"||e.area==="private"?"Resident-controlled changes become exact proposals during an invited visit.":"These details describe this zone."}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:c||!a.trim(),onClick:async()=>{d(!0),p("");try{await t({description:a,state:{features:r.split(`
`).map(b=>b.trim()).filter(Boolean).map(b=>({...e.state?.features.find($=>$.text===b),text:b}))}}),p(e.area==="shared"||e.area==="private"?"Saved. Any required resident approvals appear in the Venue.":"Zone saved.")}catch{p("The zone could not be saved. See the message above.")}finally{d(!1)}},children:c?"Saving\u2026":e.area==="shared"||e.area==="private"?"Save / propose zone changes":"Save zone details"}),h?(0,o.jsx)("p",{role:"status",children:h}):null]})}var xs=["residence","workplace","gathering","other"];function Jn(e){return e.classes?.length?e.classes:yu(e)?["residence"]:["other"]}function L1(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function wu(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function cn(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function q1({draft:e,existing:t,villagers:a,editableClasses:i,onChange:r}){let s=Jn(e),c=(d,h)=>{let p=s.map(b=>b===d?{...cn(e,b),...h}:cn(e,b));r({...e,spaces:p,description:p[0]?.description??e.description})};return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["Name",(0,o.jsx)("input",{className:`${n}-notice-input`,value:e.name,maxLength:100,onChange:d=>r({...e,name:d.target.value}),placeholder:"The Lantern Workshop"})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Form ",(0,o.jsx)("span",{className:`${n}-hint`,children:"What is it, in your world?"}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:e.form??"",maxLength:200,onChange:d=>r({...e,form:d.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Map pin \xB7 optional"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,o.jsx)("div",{className:`${n}-row`,children:["x","y"].map(d=>(0,o.jsxs)("label",{className:`${n}-label`,children:[d==="x"?"Across":"Down",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[d]??"",disabled:t&&wu(e)>0,onChange:h=>r({...e,presentation:{...e.presentation,[d]:h.target.value===""?null:Number(h.target.value)}})})]},d))}),t&&wu(e)>0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${n}-row`,children:xs.map(d=>(0,o.jsxs)("label",{className:`${n}-label`,style:{textTransform:"capitalize"},children:[(0,o.jsx)("input",{type:"checkbox",checked:s.includes(d),disabled:t||!s.includes(d)&&s.length>=2,onChange:h=>{let p=h.target.checked?[...s,d]:s.filter(b=>b!==d);p.length<1||p.length>2||r({...e,classes:p,spaces:p.map(b=>cn(e,b))})}})," ",d]},d))}),t?(0,o.jsx)("p",{className:`${n}-hint`,children:"Class changes go through a Venue proposal."}):null]}),s.includes("residence")?(0,o.jsxs)("label",{className:`${n}-label`,children:["Resident capacity \xB7 includes you",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:d=>r({...e,residenceCapacity:Number(d.target.value)})}),t?(0,o.jsx)("span",{className:`${n}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,s.includes("workplace")?(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Workers"}),a.map(d=>(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(d.characterId),onChange:h=>r({...e,workerIds:h.target.checked?[...e.workerIds??[],d.characterId]:(e.workerIds??[]).filter(p=>p!==d.characterId)})})," ",d.name]},d.characterId)),a.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No villagers are available yet."}):null]}):null,s.filter(d=>!i||i.includes(d)).map(d=>{let h=cn(e,d);return(0,o.jsxs)("section",{className:`${n}-field`,children:[(0,o.jsxs)("h3",{className:`${n}-panel-title`,style:{textTransform:"capitalize"},children:[d," space"]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.description,maxLength:1e3,onChange:p=>c(d,{description:p.target.value})})]}),(0,o.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Current physical state used by visits and pictures."}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:h.state.condition,onChange:p=>c(d,{state:{...h.state,condition:p.target.value}})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this space."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.state.items.join(`
`),onChange:p=>c(d,{state:{...h.state,items:p.target.value.split(`
`)}})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this space."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.state.publicFacts.join(`
`),onChange:p=>c(d,{state:{...h.state,publicFacts:p.target.value.split(`
`)}})})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((p,b)=>(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("input",{className:`${n}-notice-input`,value:p.text,"aria-label":`Feature ${b+1}`,onChange:$=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===p.id?{...f,text:$.target.value}:f)}})}),(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:p.locked,onChange:$=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===p.id?{...f,locked:$.target.checked}:f)}})})," ","Locked"]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,"aria-label":`Remove feature ${b+1}`,onClick:()=>c(d,{state:{...h.state,features:h.state.features.filter($=>$.id!==p.id)}}),children:"\xD7"})]},p.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:h.state.features.length>=5,onClick:()=>c(d,{state:{...h.state,features:[...h.state.features,{id:du(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},d)})]})}function vs(e){return e.filter(t=>!yu(t)||Jn(t).some(a=>a!=="residence"))}function pu(){return Math.random().toString(36).slice(2,10)}function Gr(e){return Math.round(e*1e4)/1e4}var Gk=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),nx=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),Pk=6e4,Xk=700;function B1(e){return`${Gk.format(e)} \xB7 ${nx.format(e)}`}function Zk(){let[e,t]=(0,m.useState)(()=>B1(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(B1(new Date)),1e3);return()=>clearInterval(a)},[]),e}function Qk(){let[e,t]=Zk().split(" \xB7 ");return(0,o.jsxs)("span",{className:`${n}-mobile-clock`,children:[(0,o.jsx)("span",{children:e}),(0,o.jsx)("strong",{children:t})]})}function Fk({weather:e}){return(0,o.jsxs)("span",{className:`${n}-mobile-datetime`,children:[(0,o.jsx)(Qk,{}),(0,o.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:Jk(e)})]})}function Jk(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function j1(e){return e?.closest(n)??null}function Kk(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let r=()=>t(j1(document.fullscreenElement)!==null);return r(),document.addEventListener("fullscreenchange",r),()=>document.removeEventListener("fullscreenchange",r)},[]);let a=document.fullscreenEnabled,i=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":i,title:i,onClick:r=>{let s=j1(r.currentTarget);if(!s)return;if(document.fullscreenElement===s){document.exitFullscreen().catch(()=>{});return}let c=s.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,o.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,o.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,o.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function Wk({happenings:e,recap:t,mobile:a=!1}){let i=(0,m.useRef)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=i.current;if(!c)return;let d=()=>s(c.open);return c.addEventListener("toggle",d),()=>c.removeEventListener("toggle",d)},[]),(0,m.useEffect)(()=>{if(!r)return;let c=d=>{!(d.target instanceof Node)||i.current?.contains(d.target)||i.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[r]),(0,o.jsxs)("details",{ref:i,className:`${n}-news`,children:[(0,o.jsxs)("summary",{className:`${n}-button ${n}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,o.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,o.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,o.jsx)("span",{className:`${n}-news-nyi`,children:"NYI"})]}),(0,o.jsxs)("div",{className:`${n}-news-panel`,children:[(0,o.jsx)("h2",{className:`${n}-news-title`,children:"Events"}),t?(0,o.jsxs)("div",{children:[(0,o.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,o.jsx)("ul",{className:`${n}-news-list`,children:t.details.map(c=>(0,o.jsx)("li",{className:`${n}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,o.jsx)("p",{className:`${n}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,o.jsxs)("p",{className:`${n}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,o.jsx)("p",{className:`${n}-news-empty`,children:"No events to show yet."}):(0,o.jsx)("ul",{className:`${n}-news-list`,children:e.map(c=>(0,o.jsx)("li",{className:`${n}-news-item`,children:c.text},c.id))})]})]})}function ix(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function e2(e){return e.length>0?ix(e,!0):"Empty house"}function t2(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function Y1(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function a2(e,t){return t.length>0?ix(t,!0):e.name||"An empty house"}function gu(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var n2=.028;function ws(e){return new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(typeof i.result=="string"?i.result:""),i.onerror=()=>a(new Error("That picture could not be read.")),i.readAsDataURL(e)})}function fu(e){return new Promise((t,a)=>{let i=new Image;i.onload=()=>t({width:i.naturalWidth,height:i.naturalHeight}),i.onerror=()=>a(new Error("That picture could not be read.")),i.src=e})}var G1=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function pg(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}var i2=`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><rect width="640" height="440" fill="#11285b"/><g stroke="#6c9bd5" opacity=".34" stroke-width="1"><path d="M0 40H640M0 80H640M0 120H640M0 160H640M0 200H640M0 240H640M0 280H640M0 320H640M0 360H640M0 400H640M40 0V440M80 0V440M120 0V440M160 0V440M200 0V440M240 0V440M280 0V440M320 0V440M360 0V440M400 0V440M440 0V440M480 0V440M520 0V440M560 0V440M600 0V440"/></g><g fill="none" stroke="#d7e9ff" stroke-width="5" stroke-linejoin="round"><path d="M110 195 320 88 530 195 320 302Z"/><path d="M110 195v150l210 87 210-87V195M320 302v130"/><path d="M212 153v89l108 46 108-46v-89M257 128v76l63 29 63-29v-76"/><path d="M160 221v72l95 40v-72zM385 334l95-40v-72l-95 40z"/></g><g fill="#d7e9ff" font-family="Arial,sans-serif" letter-spacing="9" text-anchor="middle"><text x="320" y="48" font-size="22">VILLAGE PROJECT</text></g></svg>')}`;function gg(e,t,a){return e<t?t:e>a?a:e}function r2(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),d=e.width*c,h=e.height*c;return{left:(t.width-d)/2,top:(t.height-h)/2,width:d,height:h}}let i=Math.max(t.width/e.width,t.height/e.height)*a.zoom,r=e.width*i,s=e.height*i;return{left:(t.width-r)*(a.focusX/100),top:(t.height-s)*(a.focusY/100),width:r,height:s}}function o2(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Gl(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function fg({src:e,alt:t,pins:a,placing:i,view:r,shape:s,zoom:c,onPlace:d,onView:h,onDismiss:p,compact:b,fitToRoom:$,mobile:f,photoPins:y,placementCursor:V,children:z}){let O=d!==void 0,N=h!==void 0,v=(0,m.useRef)(null),w=(0,m.useRef)(null),[A,H]=(0,m.useState)(null),[Y,F]=(0,m.useState)(null),[te,Te]=(0,m.useState)(null),B=(0,m.useRef)(null),re=(0,m.useRef)(new Map),me=(0,m.useRef)(null),[ft,_e]=(0,m.useState)(null),[Tt,Dt]=(0,m.useState)(null),Zt=(0,m.useRef)(null),R=(0,m.useRef)(null),q=(0,m.useRef)(!1),[ne,Ne]=(0,m.useState)(null),de=(0,m.useMemo)(()=>ne?{...r,...ne}:r,[ne,r]),He=(0,m.useMemo)(()=>e?A?.src===e?A:null:s??{width:1280,height:720},[e,A,s]),at={zoom:He&&Y?uu(He,Y):1,centerX:.5,centerY:.5},Oe=te??at,ie=(0,m.useMemo)(()=>f?He&&Y?lg(He,Y,Oe):null:e?A&&A.src===e&&Y?r2(A,Y,de):null:Y?{left:0,top:0,width:Y.width,height:Y.height}:null,[A,Y,de,f,He,Oe,e]);(0,m.useEffect)(()=>{Te(null),B.current=null,re.current.clear(),me.current=null},[e]);let Qt=s?$&&ft?{width:`${ft.width}px`,height:`${ft.height}px`,aspectRatio:`${s.width} / ${s.height}`}:{aspectRatio:`${s.width} / ${s.height}`}:void 0,Ue=(0,m.useCallback)(()=>{let I=w.current;if(!I)return;let G=I.getBoundingClientRect();G.width===0||G.height===0||F(ye=>ye&&ye.width===G.width&&ye.height===G.height?ye:{width:G.width,height:G.height})},[]);(0,m.useEffect)(()=>{let I=w.current;if(!I||typeof ResizeObserver>"u")return;let G=new ResizeObserver(()=>Ue());return G.observe(I),()=>G.disconnect()},[Ue]);let _t=(0,m.useCallback)(()=>{let I=v.current?.parentElement;if(!I||!s)return;let G=I.getBoundingClientRect(),ye=getComputedStyle(I),Ae=J=>Number.parseFloat(ye.getPropertyValue(J))||0,Le=G.width-Ae("padding-left")-Ae("padding-right"),Me=G.height-Ae("padding-top")-Ae("padding-bottom"),Q=s.width/s.height,qe=Math.min(Le,Me*Q);qe>0&&_e(J=>J&&Math.abs(J.width-qe)<.5?J:{width:qe,height:qe/Q})},[s]);(0,m.useLayoutEffect)(()=>{if(!$||(_t(),typeof ResizeObserver>"u"))return;let I=v.current?.parentElement;if(!I)return;let G=new ResizeObserver(()=>_t());return G.observe(I),()=>G.disconnect()},[$,_t]);let Ge=(0,m.useCallback)(I=>{if(!O||!d||!ie)return;let G=I.currentTarget.getBoundingClientRect(),ye=(I.clientX-G.left-ie.left)/ie.width,Ae=(I.clientY-G.top-ie.top)/ie.height;if(!(ye>=0&&ye<=1)||!(Ae>=0&&Ae<=1))return;let Me=w.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();d(Gr(ye),Gr(Ae),{width:ie.width,height:ie.height,photoWidth:Me?.width??58,photoHeight:Me?.height??58})},[d,O,ie]),nt=(0,m.useCallback)(I=>{if(!N||!ie||!h||de.fit!=="cover")return;let G=I.currentTarget.getBoundingClientRect();Zt.current={x:I.clientX,y:I.clientY,focusX:de.focusX,focusY:de.focusY,spanX:G.width-ie.width,spanY:G.height-ie.height},Ne({focusX:de.focusX,focusY:de.focusY}),I.currentTarget.setPointerCapture(I.pointerId),I.preventDefault()},[N,de.focusX,de.focusY,de.fit,h,ie]),be=(0,m.useCallback)(I=>{let G=Zt.current;if(!G)return;let ye=G.spanX===0?G.focusX:G.focusX+(I.clientX-G.x)/G.spanX*100,Ae=G.spanY===0?G.focusY:G.focusY+(I.clientY-G.y)/G.spanY*100;Ne({focusX:Gr(gg(ye,0,100)),focusY:Gr(gg(Ae,0,100))})},[]),pe=(0,m.useCallback)(I=>{if(!Zt.current)return;Zt.current=null,I.currentTarget.hasPointerCapture(I.pointerId)&&I.currentTarget.releasePointerCapture(I.pointerId);let G=ne;Ne(null),G&&h&&h({...r,...G})},[ne,h,r]),ue=(0,m.useCallback)(I=>{!h||!c||h({...r,zoom:Gr(gg(I,c.min,c.max))})},[h,r,c]),it=()=>{let I=[...re.current.values()];if(I.length===0){me.current=null;return}let G=I[0],ye=I[1];me.current={view:B.current??Oe,x:ye?(G.x+ye.x)/2:G.x,y:ye?(G.y+ye.y)/2:G.y,distance:ye?Math.hypot(G.x-ye.x,G.y-ye.y):1}},Nt=I=>{if(!f||I.pointerType!=="touch"||(I.isPrimary&&(re.current.clear(),q.current=!1),!w.current)||I.target instanceof Element&&I.target.closest(`.${n}-doors, .${n}-zoom`))return;v.current?.setAttribute("data-mobile-gesturing","true");let G=w.current.getBoundingClientRect();re.current.set(I.pointerId,{x:I.clientX-G.left,y:I.clientY-G.top}),re.current.size>1&&(q.current=!0),it()},Pe=I=>{if(!f||!re.current.has(I.pointerId)||!He||!Y||!w.current)return;let G=w.current.getBoundingClientRect();re.current.set(I.pointerId,{x:I.clientX-G.left,y:I.clientY-G.top});let ye=[...re.current.values()],Ae=ye[0],Le=ye[1],Me=Le?(Ae.x+Le.x)/2:Ae.x,Q=Le?(Ae.y+Le.y)/2:Ae.y,qe=Le?Math.hypot(Ae.x-Le.x,Ae.y-Le.y):1,J=me.current;if(!J||!k1(J,{x:Me,y:Q,distance:qe})&&!q.current)return;q.current||p?.(),q.current=!0;let Et=C1(He,Y,J.view,{x:J.x,y:J.y},{x:Me,y:Q},Le&&J.distance>0?qe/J.distance:1);B.current=Et,Te(Et)},qt=(I,G)=>{let ye=Ae=>{document.removeEventListener("click",ye,!0),Math.abs(Ae.clientX-I)<3&&Math.abs(Ae.clientY-G)<3&&(Ae.preventDefault(),Ae.stopImmediatePropagation())};document.addEventListener("click",ye,!0),window.setTimeout(()=>document.removeEventListener("click",ye,!0),500)},Xe=(I,G=!1)=>{if(!f||!re.current.has(I.pointerId))return;let ye=!G&&re.current.size===1&&!q.current;if(re.current.delete(I.pointerId),re.current.size===0&&v.current?.removeAttribute("data-mobile-gesturing"),it(),!ye||!(I.target instanceof Element))return;let Ae=I.target.closest(`.${n}-pin`)?.dataset.pinId,Le=Ae?a.find(Me=>Me.id===Ae):null;if(Le?.onSelect){q.current=!0,qt(I.clientX,I.clientY),Le.onSelect();return}if(!(!I.target.closest(`.${n}-canvas`)||I.target.closest("button")))if(O&&i&&d&&ie){let Me=w.current.getBoundingClientRect(),Q=(I.clientX-Me.left-ie.left)/ie.width,qe=(I.clientY-Me.top-ie.top)/ie.height;if(Q>=0&&Q<=1&&qe>=0&&qe<=1){q.current=!0;let rt=w.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();qt(I.clientX,I.clientY),d(Gr(Q),Gr(qe),{width:ie.width,height:ie.height,photoWidth:rt?.width??72,photoHeight:rt?.height??72})}}else p&&(q.current=!0,p())};return(0,o.jsxs)("div",{ref:v,className:`${n}-stage${b?` ${n}-stage-compact`:""}`,style:Qt,"data-shaped":s?"true":"false","data-framing":N&&de.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":y?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:I=>{if(f){Nt(I);return}q.current=!1,R.current=I.pointerType==="touch"?{x:I.clientX,y:I.clientY}:null},onPointerMoveCapture:I=>{if(f){Pe(I);return}let G=R.current;G&&(Math.abs(I.clientX-G.x)>8||Math.abs(I.clientY-G.y)>8)&&(q.current=!0)},onPointerUpCapture:f?Xe:void 0,onPointerCancelCapture:I=>{f&&Xe(I,!0),R.current&&(q.current=!0)},onClickCapture:I=>{q.current&&(q.current=!1,I.preventDefault(),I.stopPropagation())},children:[z,(0,o.jsxs)("div",{ref:w,className:`${n}-canvas`,"data-placing":O&&i?"true":"false","data-dragging":ne?"true":"false",onClick:O&&i?Ge:p?()=>p():void 0,onPointerDown:N?nt:void 0,onPointerMove:N?be:void 0,onPointerUp:N?pe:void 0,onPointerCancel:N?pe:void 0,children:[e?(0,o.jsx)("img",{className:`${n}-canvas-img`,style:f&&ie?{position:"absolute",left:ie.left,top:ie.top,width:ie.width,height:ie.height,objectFit:"fill"}:o2(de),src:e,alt:t,draggable:!1,onLoad:I=>{let{naturalWidth:G,naturalHeight:ye}=I.currentTarget;G<=0||ye<=0||(H({src:e,width:G,height:ye}),Ue())},onError:()=>Dt(e)}):(0,o.jsxs)(o.Fragment,{children:[f&&ie?(0,o.jsx)("span",{className:`${n}-mobile-logical`,style:{left:ie.left,top:ie.top,width:ie.width,height:ie.height},"aria-hidden":"true"}):null,(0,o.jsx)("span",{className:`${n}-canvas-empty`,children:"Logical village map"})]}),e&&Tt===e?(0,o.jsx)("span",{className:`${n}-canvas-missing`,children:"The map picture could not be loaded \u2014 choose another one in Village Settings \u2192 Village Map."}):null,ie&&V&&i?(0,o.jsx)("span",{className:`${n}-placement-cursor`,"aria-hidden":"true",style:{position:"absolute",left:ie.left+V.x*ie.width,top:ie.top+V.y*ie.height,zIndex:3,pointerEvents:"none",border:"2px solid #d5c6ff",background:"#251a3a99",borderRadius:"50%",width:"1rem",height:"1rem",transform:"translate(-50%,-50%)"}}):null,ie?a.map(I=>(0,o.jsxs)("span",{className:`${n}-pin-holder`,"data-selected":I.selected?"true":"false",style:{left:`${ie.left+I.x*ie.width}px`,top:`${ie.top+(I.y+(f&&I.kind!=="person"?0:I.dy??0))*ie.height}px`},children:[(0,o.jsx)("button",{type:"button",className:`${n}-pin`,"data-pin-id":I.id,"data-tone":I.tone,"data-kind":I.kind??"place","data-selected":I.selected?"true":"false","aria-expanded":I.doors?!0:void 0,disabled:I.onSelect===void 0,title:I.text,onClick:G=>{G.stopPropagation(),I.onSelect?.()},children:(f||y)&&I.kind!=="person"?(0,o.jsxs)("span",{className:`${n}-pin-photo-card`,style:{transform:`scale(${E1(f?T1(Oe.zoom,at.zoom):Ck,I.selected===!0)})`},children:[(0,o.jsxs)("span",{className:`${n}-pin-photo`,"aria-hidden":"true",children:[I.image?(0,o.jsx)("img",{src:I.image,alt:"",loading:"lazy",draggable:!1}):(0,o.jsx)("span",{className:`${n}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,o.jsx)("span",{className:`${n}-pin-photo-tack`})]}),(0,o.jsx)("span",{className:`${n}-pin-name`,children:I.text})]}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("span",{"aria-hidden":"true",className:`${n}-pin-tack`,children:(0,o.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,o.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,o.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,o.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,o.jsx)("span",{className:`${n}-pin-name`,children:I.text})]})}),I.onRemove?(0,o.jsx)("button",{type:"button",className:`${n}-pin-remove`,"aria-label":`Take ${I.text} off the map`,onClick:G=>{G.stopPropagation(),I.onRemove?.()},children:"\xD7"}):null,I.onResume?(0,o.jsx)("button",{type:"button",className:`${n}-pin-resume`,onClick:G=>{G.stopPropagation(),I.onResume?.()},children:"DEBUG: Resume Chat"}):null]},I.id)):null]}),ie?a.filter(I=>I.doors!==void 0&&I.doors.length>0).map(I=>(0,o.jsx)("div",{className:`${n}-doors`,style:{left:`${Y?cg(ie,Y,I).left:ie.left+I.x*ie.width}px`,top:`${Y?cg(ie,Y,I).top:ie.top+(I.y+(I.dy??0))*ie.height}px`},children:I.doors?.map(G=>(0,o.jsx)("button",{type:"button",className:`${n}-door`,onClick:ye=>{ye.stopPropagation(),G.onSelect()},children:G.label},G.label))},`doors:${I.id}`)):null,N&&c&&de.fit==="cover"?(0,o.jsxs)("div",{className:`${n}-zoom`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:de.zoom>=c.max,onClick:()=>ue(de.zoom+c.step),children:"+"}),(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:de.zoom<=c.min,onClick:()=>ue(de.zoom-c.step),children:"\u2212"}),(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:de.focusX===50&&de.focusY===50&&de.zoom===c.min,onClick:()=>{h&&h({...r,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function Pl(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function s2({scenario:e}){let t=Ek(e),[a,i]=(0,m.useState)(null);return(0,o.jsxs)("div",{className:`${n}-scenario-art-panel`,children:[a===t?(0,o.jsx)("span",{className:`${n}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,o.jsx)("img",{src:t,alt:`${Pr(e).label} village scene`,onError:()=>i(t)}),(0,o.jsxs)("div",{className:`${n}-scenario-art-content`,children:[(0,o.jsx)("p",{children:"A new beginning awaits."}),(0,o.jsx)("strong",{children:Pr(e).description})]})]})}function l2({label:e,choices:t,selectedId:a,onSelect:i,disabled:r,emptyMessage:s}){return t.length?(0,o.jsx)("div",{className:`${n}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,o.jsxs)("button",{type:"button",className:`${n}-identity-card`,"aria-pressed":a===c.id,disabled:r,onClick:()=>i(c.id),children:[(0,o.jsx)(Xr,{portrait:c.portrait,name:c.name,className:`${n}-identity-card-face`,glyph:"person"}),(0,o.jsx)("strong",{children:c.name}),c.hint?(0,o.jsx)("small",{children:c.hint}):null]},c.id))}):(0,o.jsx)("p",{className:`${n}-hint`,children:s})}function c2({value:e}){return(0,o.jsxs)("section",{className:`${n}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,o.jsx)(Xr,{portrait:e.portrait,name:e.name,className:`${n}-identity-preview-face`,glyph:"person"}),(0,o.jsxs)("div",{className:`${n}-identity-preview-copy`,children:[(0,o.jsx)("h3",{children:e.name}),e.overview?(0,o.jsx)("p",{className:`${n}-identity-overview`,children:e.overview}):null,e.details.length?(0,o.jsx)("dl",{className:`${n}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:t}),(0,o.jsx)("dd",{children:a})]},t))}):null,(0,o.jsx)("p",{className:`${n}-identity-context`,children:e.context})]})]})}function P1(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let i=a.lastIndexOf(" ",t),r=a.indexOf(" ",t);return`${a.slice(0,i>0?i:r>0?r:a.length).trimEnd()}\u2026`}function X1(e){return e.avatarPath?{url:e.avatarPath,crop:Sg(e.avatarCrop)}:void 0}function d2({personas:e,draft:t,onDraft:a,disabled:i}){let[r,s]=(0,m.useState)(""),[c,d]=(0,m.useState)(null),[h,p]=(0,m.useState)(""),b=e?.find(z=>z.id===t),$=b?.id,f=r.trim().toLocaleLowerCase(),y=(e??[]).filter(z=>!f||`${z.name} ${z.summary}`.toLocaleLowerCase().includes(f)).sort((z,O)=>z.name.localeCompare(O.name,void 0,{sensitivity:"base"})).map(z=>({id:z.id,name:z.name,portrait:X1(z),hint:z.summary}));(0,m.useEffect)(()=>{if(d(null),p(""),!t||!$)return;let z=new AbortController;return j(`/personas/${encodeURIComponent(t)}`,{signal:z.signal}).then(O=>{z.signal.aborted||d(O.persona)}).catch(O=>{z.signal.aborted||p(X(O,"This Persona could not be read."))}),()=>z.abort()},[t,$]);let V=c&&c.id===t?{id:c.id,name:c.name,portrait:X1(c),overview:P1(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,z])=>z.trim()).map(([z,O])=>({label:z,text:P1(O,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,o.jsxs)("div",{className:`${n}-founding-persona`,children:[(0,o.jsxs)("div",{className:`${n}-identity-picker-head`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-persona-search`,children:"Who are you?"}),(0,o.jsx)("input",{id:`${n}-setup-persona-search`,className:`${n}-search`,type:"search",value:r,placeholder:"Search Personas",onChange:z=>s(z.target.value),disabled:i||e===null})]}),(0,o.jsx)(l2,{label:"Choose a Persona",choices:y,selectedId:t,onSelect:a,disabled:i,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!b?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):V?(0,o.jsx)(c2,{value:V}):h?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:h}):b?(0,o.jsxs)("p",{className:`${n}-hint`,children:["Reading ",b.name,"\u2026"]}):(0,o.jsx)("p",{className:`${n}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function u2({idPrefix:e,personas:t,draft:a,onDraft:i,storedId:r,storedName:s,storedMissing:c,disabled:d}){let h=(t??[]).find(f=>f.id===a)??null,p=h?.name??(a===r?s:""),b=c&&a===r,$=a.length>0;return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-${e}-persona`,children:"Who are you?"}),(0,o.jsxs)("select",{id:`${n}-${e}-persona`,className:`${n}-select`,value:a,disabled:d||t===null||t.length===0,onChange:f=>i(f.target.value),children:[(0,o.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,o.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),$?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:b?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":p.length>0?`The villagers know you as ${p}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,o.jsx)("p",{className:`${n}-macro-help`,children:h.summary}):null]}):null]})}function Z1({books:e,error:t,selected:a,onChange:i,disabled:r}){let[s,c]=(0,m.useState)(""),d=new Map((e??[]).map(y=>[y.id,y])),h=(e??[]).filter(y=>!y.hiddenFromLibrary||a.includes(y.id)),p=a.filter(y=>!d.has(y)),$=[...h,...p.map(y=>({id:y,name:y,enabled:!1}))].filter(y=>y.name.toLocaleLowerCase().includes(s.trim().toLocaleLowerCase())),f=$.slice(0,50);return(0,o.jsxs)("fieldset",{className:`${n}-field ${n}-lore-picker`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Lorebooks for this village"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,o.jsx)("div",{className:`${n}-lore-selected`,"aria-live":"polite",children:a.length?a.map(y=>(0,o.jsxs)("span",{className:`${n}-lore-chip`,children:[(0,o.jsxs)("span",{children:[d.get(y)?.name??y,e===null?" (checking)":d.has(y)?d.get(y)?.enabled?"":" (disabled)":" (missing)"]}),(0,o.jsx)("button",{type:"button","aria-label":`Remove ${d.get(y)?.name??y}`,disabled:r,onClick:()=>i(a.filter(V=>V!==y)),children:"\xD7"})]},y)):(0,o.jsx)("span",{className:`${n}-hint`,children:"No lorebooks selected."})}),t?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:t}):null,e===null&&!t?(0,o.jsx)("p",{className:`${n}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No lorebooks in the Engine library."}):null,(0,o.jsxs)("details",{className:`${n}-lore-options`,children:[(0,o.jsxs)("summary",{className:`${n}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,o.jsx)("input",{type:"search",className:`${n}-search`,value:s,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:y=>c(y.target.value)}),(0,o.jsxs)("div",{className:`${n}-lore-results`,children:[f.map(y=>{let V=a.includes(y.id),z=p.includes(y.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":y.enabled?"":"Disabled \u2014 skipped";return(0,o.jsxs)("label",{className:`${n}-reason-option`,children:[(0,o.jsx)("input",{type:"checkbox",checked:V,disabled:r||!y.enabled&&!V||!V&&a.length>=24,onChange:()=>i(V?a.filter(O=>O!==y.id):[...a,y.id])}),y.name,z?` (${z})`:""]},y.id)}),e!==null&&$.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No matching lorebooks."}):null,$.length>f.length?(0,o.jsx)("p",{className:`${n}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function Q1({id:e,label:t,hint:a,options:i,value:r,disabled:s,onChange:c}){let d=r.length>0&&!i.some(h=>h.id===r);return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:e,children:t}),(0,o.jsxs)("select",{id:e,className:`${n}-select`,value:r,disabled:s,onChange:h=>c(h.target.value),children:[(0,o.jsx)("option",{value:"",children:"Engine default"}),d?(0,o.jsx)("option",{value:r,children:"Missing \u2014 this connection is gone"}):null,i.map(h=>(0,o.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,o.jsx)("span",{className:`${n}-hint`,children:a})]})}function bg({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[i,r]=(0,m.useState)(null),[s,c]=(0,m.useState)([]),[d,h]=(0,m.useState)(""),[p,b]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let O=!1;return(async()=>{try{let[N,v]=await Promise.all([j("/connections"),Ng("/api/connections")]);if(O)return;r(N),c(qk(Array.isArray(v)?v:[]))}catch(N){O||h(X(N,"This agent's connections could not be read."))}})(),()=>{O=!0}},[]);let $=(0,m.useCallback)(async O=>{b(!0),h("");try{r(await j("/connections",{method:"PUT",body:JSON.stringify(O)}))}catch(N){h(X(N,"That connection could not be saved."))}finally{b(!1)}},[]),f=s.filter(O=>O.category==="language"),y=s.filter(O=>O.category==="image_generation"),V=y.some(O=>O.defaultForAgents),z=i!==null&&(i.imageConnectionId===ug||y.length===0||i.imageConnectionId.length===0&&!V);return(0,m.useEffect)(()=>{if(!e)return;let O=i?.systemConnectionId??"",N=i?.narrationConnectionId??"";i?O.length===0||N.length===0?e("Choose both System and Narration connections before continuing."):!f.some(v=>v.id===O)||!f.some(v=>v.id===N)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,i,f]),(0,m.useEffect)(()=>{t?.(z)},[z,t]),(0,o.jsxs)("div",{className:`${n}-field ${a?`${n}-connections-compact`:""}`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Connections"}),a?(0,o.jsx)("p",{className:`${n}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,o.jsx)("p",{className:`${n}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),i?(0,o.jsxs)("div",{className:a?`${n}-connections-grid`:"",children:[(0,o.jsx)(Q1,{id:`${n}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:f,value:i.systemConnectionId,disabled:p,onChange:O=>{$({systemConnectionId:O})}}),(0,o.jsx)(Q1,{id:`${n}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:f,value:i.narrationConnectionId,disabled:p,onChange:O=>{$({narrationConnectionId:O})}}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-connection-image`,children:"Images"}),(0,o.jsxs)("select",{id:`${n}-connection-image`,className:`${n}-select`,value:i.imageConnectionId,disabled:p,onChange:O=>{$({imageConnectionId:O.target.value})},children:[(0,o.jsx)("option",{value:ug,children:"Disabled"}),(0,o.jsx)("option",{value:"",children:"Use Engine default"}),i.imageConnectionId.length>0&&i.imageConnectionId!==ug&&!y.some(O=>O.id===i.imageConnectionId)?(0,o.jsx)("option",{value:i.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,y.map(O=>(0,o.jsx)("option",{value:O.id,children:O.name},O.id))]}),(0,o.jsx)("span",{className:`${n}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,o.jsxs)(o.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,o.jsxs)("span",{className:`${n}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,o.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):d.length===0?(0,o.jsx)("span",{className:`${n}-hint`,children:"Reading this agent's connections\u2026"}):null,d?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:d}):null]})}function h2(){let[e,t]=(0,m.useState)(null),[a,i]=(0,m.useState)(""),[r,s]=(0,m.useState)(!1),[c,d]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let p=!1;return j("/narration").then(b=>{p||t(b)}).catch(b=>{p||i(X(b,"Village writing settings could not be read."))}),()=>{p=!0}},[]);let h=(0,m.useCallback)(async p=>{s(!0),d(!1),i("");try{let b=await j("/narration",{method:"PUT",body:JSON.stringify(p)});return t(b),d(!0),b}catch(b){return i(X(b,"That writing change could not be saved.")),null}finally{s(!1)}},[]);return{view:e,error:a,busy:r,saved:c,save:h}}function m2(){let{view:e,error:t,busy:a,saved:i,save:r}=h2(),[s,c]=(0,m.useState)(null),d=s??e?.writingGuidance??"";return(0,o.jsxs)("div",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Additional writing guidance"}),(0,o.jsx)("p",{className:n+"-empty",children:"Optionally influence narration and dialogue in this village. Resident cards, scene facts, and the player's choices remain in charge. Leave this empty for Villages' own scene writing. Saved changes apply to the next generated venue turn."}),e?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("textarea",{className:n+"-textarea","aria-label":"Additional writing guidance",value:d,rows:5,maxLength:e.writingGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.writingGuidance,onClick:()=>{r({writingGuidance:d}).then(h=>{h&&c(h.writingGuidance)})},children:"Apply guidance"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||!d,onClick:()=>{r({writingGuidance:""}).then(h=>{h&&c(h.writingGuidance)})},children:"Clear guidance"}),(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Tense"}),(0,o.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{r({tense:h.target.value})},children:[(0,o.jsx)("option",{value:"present",children:"Present"}),(0,o.jsx)("option",{value:"past",children:"Past"})]})]}),(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Person"}),(0,o.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{r({person:h.target.value})},children:[(0,o.jsx)("option",{value:"first",children:"First person (I)"}),(0,o.jsx)("option",{value:"second",children:"Second person (you)"}),(0,o.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Content rating"}),(0,o.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{r({rating:h.target.value})},children:[(0,o.jsx)("option",{value:"sfw",children:"SFW"}),(0,o.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,o.jsx)("span",{className:n+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,o.jsx)("span",{className:n+"-hint",children:"Reading village writing settings\u2026"}),a?(0,o.jsx)("span",{className:n+"-hint",children:"Saving\u2026"}):null,i&&!a?(0,o.jsx)("span",{className:n+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:t}):null]})}function Xr({portrait:e,name:t,className:a,glyph:i="initial"}){return(0,o.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,o.jsx)("img",{src:e.url,alt:"",style:Hk(e.crop)}):i==="person"?(0,o.jsxs)("svg",{className:`${n}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,o.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,o.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function p2({villager:e,portrait:t,selected:a,onSelect:i}){return(0,o.jsxs)("div",{className:`${n}-tile`,"data-selected":a?"true":"false",children:[(0,o.jsxs)("div",{className:`${n}-tile-head`,children:[(0,o.jsx)(Xr,{portrait:t,name:e.name,className:`${n}-avatar`}),(0,o.jsx)("button",{type:"button",className:`${n}-tile-name`,onClick:i,disabled:i===void 0,title:i?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,o.jsx)("p",{className:`${n}-tile-summary`,children:e.summary}):null,(0,o.jsxs)("div",{className:`${n}-tile-meta`,children:[e.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(r=>(0,o.jsx)("span",{className:`${n}-tag`,children:r},r))]})]})}function F1(e,t){let a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=e,i.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function g2(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort(($,f)=>{let y=V=>{let z=V1.indexOf(V);return z<0?V1.length:z};return y($.label)-y(f.label)||$.label.localeCompare(f.label)||$.view.localeCompare(f.view)}),i=512,r=768,s=2,c=document.createElement("canvas");c.width=s*i,c.height=Math.ceil(a.length/s)*r;let d=c.getContext("2d");if(!d)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let $=0;$<a.length;$+=1){let f=a[$],y=new Image;y.src=f.url,await y.decode();let V=$%s*i,z=Math.floor($/s)*r,O=Math.min(i/y.naturalWidth,r/y.naturalHeight),N=Math.round(y.naturalWidth*O),v=Math.round(y.naturalHeight*O);d.drawImage(y,V+Math.floor((i-N)/2),z+r-v,N,v),h.push({view:f.view,expression:f.label,x:V,y:z,width:i,height:r})}let p=await new Promise(($,f)=>c.toBlob(y=>y?$(y):f(new Error("The browser could not export this sheet.")),"image/png")),b=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";F1(`${b}-sprites.png`,p),F1(`${b}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function f2({entry:e,onDecide:t}){let[a,i]=(0,m.useState)(e.improvement?.title??""),[r,s]=(0,m.useState)(e.improvement?.description??""),[c,d]=(0,m.useState)(e.improvement?.extraBeds??0),[h,p]=(0,m.useState)(e.improvementSlot??0),[b,$]=(0,m.useState)(!1),[f,y]=(0,m.useState)(""),V=O=>{$(!0),y(""),t(O,{title:a,description:r,extraBeds:c,slot:h}).catch(N=>y(X(N,"That Venue request could not be decided."))).finally(()=>$(!1))},z=a!==e.improvement?.title||r!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["Proposed improvement",(0,o.jsx)("input",{className:`${n}-notice-input`,value:a,onChange:O=>i(O.target.value)})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["What changes?",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:r,onChange:O=>s(O.target.value)})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:O=>d(Number(O.target.value))})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:h,onChange:O=>p(Number(O.target.value)),children:[(0,o.jsx)("option",{value:0,children:"Slot 1"}),(0,o.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:b||!a.trim()||!r.trim(),onClick:()=>V(!0),children:z?"Send counteroffer":"Approve exact request"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:b,onClick:()=>V(!1),children:"Decline"})]}),f?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:f}):null]})}function b2({room:e,nameColors:t,speechColors:a,picture:i,draft:r,mode:s,targetId:c,busy:d,error:h,greetingNotice:p,ruling:b,open:$,ended:f,playerName:y,playerPortrait:V,portraits:z,sprites:O,onDraft:N,onMode:v,onTarget:w,onSend:A,onViewVenue:H,onEnterPrivate:Y,privateSpaceOwnerName:F,onEnd:te,onLeavePending:Te,endFailed:B,reviewing:re,onRetryGreeting:me,onContinueWithoutGreeting:ft,notices:_e,onDismissNotice:Tt,debugDiscardEnabled:Dt,onDebugDiscard:Zt,onUseMailbox:R,onProjects:q}){let[ne,Ne]=(0,m.useState)(0),[de,He]=(0,m.useState)(!1),[at,Oe]=(0,m.useState)(!1),[ie,Qt]=(0,m.useState)(!1),[Ue,_t]=(0,m.useState)(!1),[Ge,nt]=(0,m.useState)(null),be=(0,m.useRef)(null),pe=(0,m.useRef)(null),ue=(0,m.useRef)(null),it=(0,m.useRef)(null),Nt=(0,m.useRef)(null),Pe=(0,m.useRef)(null),qt=(0,m.useRef)(null),Xe=(0,m.useRef)(null),I=(0,m.useRef)(null),G=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let x=new Set(_e.map(P=>P.id)),D=_e.some(P=>P.kind==="memory"&&!G.current.has(P.id));G.current=x,D?Qt(!0):_e.length===0&&Qt(!1)},[_e,e.id]),(0,m.useEffect)(()=>{de&&window.requestAnimationFrame(()=>Pe.current?.focus())},[de]),(0,m.useEffect)(()=>{if(!at)return;let x=P=>{Xe.current?.contains(P.target)||Oe(!1)},D=P=>{P.key==="Escape"&&Oe(!1)};return document.addEventListener("pointerdown",x),document.addEventListener("keydown",D),()=>{document.removeEventListener("pointerdown",x),document.removeEventListener("keydown",D)}},[at]),(0,m.useEffect)(()=>{if(!Ue)return;let x=P=>{it.current?.contains(P.target)||_t(!1)},D=P=>{P.key==="Escape"&&_t(!1)};return document.addEventListener("pointerdown",x),document.addEventListener("focusin",x),document.addEventListener("keydown",D),()=>{document.removeEventListener("pointerdown",x),document.removeEventListener("focusin",x),document.removeEventListener("keydown",D)}},[Ue]);let ye=(0,m.useCallback)(()=>{nt(null),window.requestAnimationFrame(()=>be.current?.focus())},[]),Ae=new Set((e.submissions??[]).flatMap(x=>(x.recollections??[]).map(D=>D.id))).size;(0,m.useEffect)(()=>{if(!Ge)return;window.requestAnimationFrame(()=>pe.current?.focus());let x=D=>{if(D.key==="Tab"){D.preventDefault(),pe.current?.focus();return}D.key==="Escape"&&(D.preventDefault(),ye())};return window.addEventListener("keydown",x),()=>window.removeEventListener("keydown",x)},[ye,Ge]);let Le=(0,m.useMemo)(()=>{let x=[],D=w1(e.lines,e.submissions??[]),P=new Map,ge=new Map;for(let oe of e.lines){if(oe.kind!=="side"&&oe.kind!=="whisper"||!oe.asideFor)continue;let lt=ge.get(oe.asideFor)??[];lt.push({register:oe.kind,text:oe.content,...oe.targetId?{target:e.participants.find(ta=>ta.characterId===oe.targetId)?.name??oe.targetId}:{},speakerId:oe.speakerId,name:oe.name,expression:oe.expression,gazeAt:oe.gazeAt}),ge.set(oe.asideFor,lt),P.set(oe.asideFor,[...P.get(oe.asideFor)??[],oe])}for(let oe of e.lines){if(oe.kind==="side"||oe.kind==="whisper")continue;let lt=oe.speakerId.length===0,ta=d1(oe.content,oe.beats??null),_a=P.get(oe.id??"")??[],Nn=[oe,..._a].map(Sn=>D.get(Sn.id??"")),dn=Nn.find(Sn=>Sn?.beforeIds)?.beforeIds,ca=Nn.find(Sn=>Sn?.afterIds)?.afterIds;ta.paragraphs.forEach((Sn,un)=>{x.push({key:`${x.length}`,...e.stagingVersion===1?{stagingEvent:{cues:[...un===0?sg(oe):[],...un===ta.paragraphs.length-1?_a.flatMap(sg):[]],...un===0&&dn?{beforeIds:dn}:{},...un===ta.paragraphs.length-1&&ca?{afterIds:ca}:{}}}:{},speakerId:lt?"":oe.speakerId,name:lt?y:oe.name,player:lt,text:Sn,asides:[...ta.asides[un]??[],...un===ta.paragraphs.length-1?ge.get(oe.id??"")??[]:[]],...oe.kind?{register:oe.kind==="narration"?"narration":"speech"}:{},...oe.expression?{expression:oe.expression}:{},...oe.gazeAt?{gazeAt:oe.gazeAt}:{}})})}return x},[y,e.lines,e.participants,e.stagingVersion,e.submissions]);(0,m.useLayoutEffect)(()=>{Ne(x=>f1(I.current,e.id,Le.length,x)),I.current={roomId:e.id,stepCount:Le.length}},[e.id,Le.length]);let Me=Math.min(ne,Math.max(0,Le.length-1)),Q=Le[Me],J=(0,m.useMemo)(()=>e.stagingVersion===1?y1(e.participants.map(x=>x.characterId),Le.map(x=>x.stagingEvent??{})):[],[e.stagingVersion,e.participants,Le])[Me],rt=J?.state??og(e.participants.map(x=>x.characterId)),Et=(0,m.useRef)(null),he=(0,m.useMemo)(()=>Et.current?.roomId===e.id&&!Et.current.restoring&&Me>Et.current.at,[e.id,Me]);(0,m.useLayoutEffect)(()=>{let x=Et.current?.roomId!==e.id;Et.current={roomId:e.id,at:Me,restoring:x&&Me!==Math.max(0,Le.length-1)}},[e.id,Me,Le.length]);let Ye=Me>0,zt=Me<Le.length-1,Ze=!f&&e.status==="active"&&!zt,ea=(0,m.useCallback)(()=>{let x=ue.current;if(!x)return;let D=window.getComputedStyle(x),P=Number.parseFloat(D.lineHeight),ge=Number.parseFloat(D.paddingTop)+Number.parseFloat(D.paddingBottom),oe=Math.ceil(P+ge),lt=Math.ceil(P*2+ge);x.style.height="auto",x.style.height=`${Math.min(Math.max(x.scrollHeight,oe),lt)}px`,x.style.overflowY=x.scrollHeight>lt+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{ea()},[Ze,r,ea]),(0,m.useEffect)(()=>{let x=ue.current?.parentElement;if(!x)return;let D=x.clientWidth,P=new ResizeObserver(()=>{x.clientWidth!==D&&(D=x.clientWidth,ea())});return P.observe(x),()=>P.disconnect()},[Ze,ea]);let ga=()=>{!Ze||d||s!=="conclude"&&!r.trim()||s==="fulfill"&&!c||(_t(!1),A())};(0,m.useLayoutEffect)(()=>{qt.current&&(qt.current.scrollTop=0)},[Me,e.id]);let Ca=Q?.register??(Q===void 0||Q.speakerId==="__venue_scene__"?"narration":Q.player||c1(Q.text)==="speech"?"speech":"narration"),Se=Q===void 0?void 0:Q.player?V:z[Q.speakerId],At=e.participants.filter(x=>e.activeIds.includes(x.characterId)),Ta=e.stagingVersion===1?e.participants.filter(x=>(J?.activeIds??e.activeIds).includes(x.characterId)):e.status==="closed"&&At.length===0?e.participants:At,Da=Ta.find(x=>x.characterId===Q?.speakerId),Ht=x=>vu(a[x]),T=x=>vu(t[x]),K=Ta.slice(0,4),le=Ta.filter(x=>!K.some(D=>D.characterId===x.characterId)),Qe=x1(K.map(x=>x.characterId),rt),Fe=(e.stagingVersion===1?(Qe[Da?.characterId??""]?.x??0)>.5:K.findIndex(x=>x.characterId===Da?.characterId)>=2)?"left":"right",S=(0,o.jsxs)("p",{className:`${n}-chat-pending`,role:"status",children:[(0,o.jsx)("span",{className:`${n}-chat-spinner ${n}-spin`,"aria-hidden":"true"}),(0,o.jsx)("span",{className:`${n}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,o.jsxs)("aside",{className:`${n}-chat`,"data-open":$?"true":"false","data-ended":f?"true":"false","data-opening-error":e.status==="opening"&&h?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,o.jsx)("p",{className:`${n}-visually-hidden`,children:`Here now: ${At.length?At.map(x=>`${x.name}${x.doing?` is ${x.doing}`:""}`).join("; "):"nobody"}.`}),(0,o.jsx)("div",{className:`${n}-chat-scene`,"aria-hidden":"true",children:i?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("img",{className:`${n}-chat-scene-backdrop`,src:i,alt:""}),(0,o.jsx)("span",{className:`${n}-chat-scrim`}),(0,o.jsx)("span",{className:`${n}-chat-vignette`})]}):(0,o.jsx)("span",{className:`${n}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,o.jsxs)("div",{className:`${n}-chat-head`,children:[(0,o.jsx)("span",{className:`${n}-room-place`,children:e.placeName}),(0,o.jsxs)("span",{ref:Xe,className:`${n}-chat-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-room-actions-trigger`,onClick:()=>Oe(x=>!x),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":at,children:"\xB7\xB7\xB7"}),at?(0,o.jsxs)("span",{className:`${n}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Oe(!1),H()},disabled:d,children:"View Venue"}),Y?(0,o.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{Oe(!1),Y()},disabled:d,children:["Enter ",F??"private space"]}):null,(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Oe(!1),f&&e.memoryPending?Te():te()},disabled:d,children:f&&e.memoryPending?"Leave with memory pending":f?"Return to map":"End visit now"}),(B||e.status==="closing"||e.memoryPending)&&!f?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Oe(!1),Te()},children:"Leave with memory pending"}):null,Dt&&e.status!=="closed"?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Oe(!1),Zt()},disabled:d,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:e.spaceClass==="residence"?"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like.":"You\u2019re outside this Venue. You can speak in your own words, or leave whenever you like."}):null,_e.length>0?(0,o.jsxs)("div",{className:`${n}-room-notices`,"aria-live":"polite",children:[(0,o.jsxs)("button",{type:"button",className:`${n}-room-notices-trigger`,onClick:()=>Qt(x=>!x),"aria-expanded":ie,"aria-label":`${_e.length} village ${_e.length===1?"notice":"notices"}`,children:["\u2726 ",_e.length]}),ie?(0,o.jsx)("div",{className:`${n}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:_e.map(x=>(0,o.jsxs)("div",{className:`${n}-room-star`,children:[(0,o.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),x.kind==="memory"&&x.detail?(0,o.jsx)("button",{type:"button",className:`${n}-room-star-detail`,onClick:D=>{be.current=D.currentTarget,nt(x)},"aria-label":`View memory: ${x.text}`,title:"View saved memory",children:x.text}):(0,o.jsx)("span",{children:x.text}),(0,o.jsx)("button",{type:"button",className:`${n}-room-star-dismiss`,onClick:()=>{Ge?.id===x.id&&nt(null),Tt(x.id)},"aria-label":`Dismiss ${x.text}`,title:"Dismiss notice",children:"\xD7"})]},x.id))}):null]}):null,Ge?.detail?(0,o.jsx)("div",{className:`${n}-memory-backdrop`,onClick:x=>{x.currentTarget===x.target&&ye()},children:(0,o.jsxs)("div",{className:`${n}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${n}-memory-dialog-title`,children:[(0,o.jsxs)("div",{className:`${n}-memory-dialog-head`,children:[(0,o.jsx)("h2",{id:`${n}-memory-dialog-title`,children:Ge.text}),(0,o.jsx)("button",{ref:pe,type:"button",onClick:ye,"aria-label":"Close memory",children:"\xD7"})]}),(0,o.jsx)("p",{children:Ge.detail})]})}):null,At.length>0?(0,o.jsx)("div",{className:`${n}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:At.map(x=>(0,o.jsx)("span",{className:`${n}-chat-activity`,children:`${x.name}: ${x.doing||"spending time here"}`},x.characterId))}):null,(0,o.jsxs)("div",{className:`${n}-chat-stage`,"aria-hidden":"true",children:[(0,o.jsx)("div",{className:`${n}-chat-cast`,"data-staging":e.stagingVersion===1?"true":"false","data-animate":he?"true":"false",children:K.map((x,D)=>{let P=O[x.characterId],ge=x.characterId===Da?.characterId,oe=Q?.asides.find(ca=>ca.speakerId===x.characterId),lt=e.stagingVersion===1?Qe[x.characterId]:void 0,ta=lt?rt[x.characterId].expression:ge?Q?.expression??"":oe?.expression??"",_a=ge?Q?.gazeAt:oe?.gazeAt??(x.characterId===Q?.gazeAt?Da?.characterId:void 0),Nn=K.findIndex(ca=>ca.characterId===_a),dn=N1(P?.images??[],ta,lt?.facing??$1(D,Nn));return(0,o.jsxs)("div",{className:`${n}-chat-cast-person`,"data-active":x.characterId===Da?.characterId?"true":"false","data-sprite":dn?"true":"false","data-character-id":x.characterId,"data-position":lt?rt[x.characterId].position:void 0,"data-attention":lt?lt.facing:void 0,style:lt?{left:`${(lt.x-lt.width/2)*100}%`,width:`${lt.width*100}%`}:void 0,children:[dn?(0,o.jsx)("img",{src:dn.image.url,alt:"","data-framing":P?.framing.mode??"full","data-facing":dn.image.view==="front"?"front":dn.mirrored?"left":"right"}):(0,o.jsx)(Xr,{portrait:z[x.characterId],name:x.name,className:`${n}-avatar`}),(0,o.jsx)("span",{style:T(x.characterId),children:x.name})]},x.characterId)})}),le.length>0?(0,o.jsx)("div",{className:`${n}-chat-cast-rest`,children:le.map(x=>(0,o.jsxs)("span",{children:[(0,o.jsx)(Xr,{portrait:z[x.characterId],name:x.name,className:`${n}-avatar`}),(0,o.jsx)("span",{style:T(x.characterId),children:x.name})]},x.characterId))}):null]}),(0,o.jsxs)("div",{className:`${n}-chat-vn`,children:[de?(0,o.jsx)("div",{ref:Pe,className:`${n}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:x=>{x.key==="Escape"&&(He(!1),window.requestAnimationFrame(()=>Nt.current?.focus()))},children:e.lines.map((x,D)=>(0,o.jsxs)("p",{className:`${n}-chat-vn-text`,children:[(0,o.jsxs)("strong",{style:x.role==="assistant"&&x.kind!=="narration"?T(x.speakerId):void 0,children:[x.role==="user"?y:x.kind==="narration"||x.speakerId==="__venue_scene__"?"Narration":x.name||"Resident",x.kind==="side"?" \xB7 aside":x.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,o.jsx)("span",{style:x.role==="assistant"&&x.kind!=="narration"?Ht(x.speakerId):void 0,children:ys(x.content,`history-${D}-`)})]},x.id??D))}):null,Q&&Q.asides.length>0?(0,o.jsx)("div",{className:`${n}-chat-vn-asides`,"data-side":Fe,"aria-live":"polite",children:Q.asides.map((x,D)=>(0,o.jsxs)("div",{className:`${n}-chat-vn-aside`,"data-register":x.register,children:[(0,o.jsx)(Xr,{portrait:x.speakerId?z[x.speakerId]:Se,name:x.name??Q.name,glyph:Q.player?"person":"initial",className:`${n}-chat-vn-aside-face`}),(0,o.jsxs)("div",{className:`${n}-chat-vn-aside-column`,children:[(0,o.jsxs)("p",{className:`${n}-chat-vn-aside-head`,children:[(0,o.jsx)("span",{className:`${n}-chat-vn-aside-icon`,children:x.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,o.jsx)("span",{className:`${n}-chat-vn-aside-name`,style:T(x.speakerId??Q.speakerId),children:x.name??Q.name}),x.register==="whisper"&&x.target?(0,o.jsx)("span",{className:`${n}-chat-vn-aside-target`,children:`\u2192 ${x.target}`}):null]}),(0,o.jsx)("p",{className:`${n}-chat-vn-aside-text`,style:Ht(x.speakerId??Q.speakerId),children:ys(x.text,`vn-aside-${D}-`)})]})]},`${D}-${x.register}`))}):null,(0,o.jsx)("div",{className:`${n}-chat-vn-card`,"data-register":Ca,children:(0,o.jsx)("div",{className:`${n}-chat-vn-row`,children:(0,o.jsxs)("div",{className:`${n}-chat-vn-column`,children:[Ca==="narration"?(0,o.jsx)("p",{className:`${n}-chat-vn-label`,children:"Narration"}):(0,o.jsx)("p",{className:`${n}-chat-vn-name`,style:Q?.player?void 0:T(Q?.speakerId??""),children:Q?.name??""}),(0,o.jsxs)("div",{ref:qt,className:`${n}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[Q?Ca==="narration"?(0,o.jsx)("p",{className:`${n}-chat-vn-beat`,"data-register":"narration",children:ys(Q.text,"vn-beat-")}):(0,o.jsx)("p",{className:`${n}-chat-vn-text`,style:Q.player?void 0:Ht(Q.speakerId),children:ys(Q.text,"vn-")}):(0,o.jsx)("p",{className:`${n}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:At.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!f&&d?S:null]})]})})}),(0,o.jsxs)("div",{className:`${n}-room-panel-tools`,children:[e.lines.length>0?(0,o.jsx)("button",{ref:Nt,type:"button",className:`${n}-chat-history-toggle`,"aria-label":"History","aria-expanded":de,onClick:()=>He(x=>!x),children:de?"Hide history":"History"}):null,(0,o.jsx)("span",{className:`${n}-chat-vn-counter`,children:`${Me+1} / ${Math.max(1,Le.length)}`}),(0,o.jsxs)("span",{className:`${n}-chat-vn-nav`,children:[(0,o.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>Ne(Me-1),disabled:!Ye,"aria-label":"Previous paragraph",children:["\u2039 ",(0,o.jsx)("span",{children:"Previous"})]}),zt?(0,o.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>Ne(Me+1),"aria-label":"Next paragraph",children:[(0,o.jsx)("span",{children:"Next"})," \u203A"]}):f?(0,o.jsx)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:e.memoryPending?Te:te,disabled:d,children:e.memoryPending?"Leave with memory pending":"Return to map"}):null]})]}),h&&e.status==="opening"?(0,o.jsxs)("div",{className:`${n}-room-error`,role:"alert",children:[(0,o.jsx)("p",{children:h}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:te,disabled:d,children:"Back to map"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:me,disabled:d,children:"Retry opening"}),e.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:ft,disabled:d,children:"Continue without opening"}):null]}):null,p?(0,o.jsx)("div",{className:`${n}-room-error`,role:"status",children:(0,o.jsx)("p",{children:p})}):null,b?(0,o.jsx)("p",{className:`${n}-empty`,children:b}):null,e.status==="closing"||e.memoryPending?(0,o.jsx)("p",{className:`${n}-hint`,children:e.memoryPending?`Memory review ${re?"in progress":"pending"} \xB7 ${e.memoryReview?.nextRecollection??0}/${Ae} recollections reviewed. You can leave with memory pending and retry from Memories.`:"Closing this visit\u2026"}):null,f&&!e.memoryPending&&e.memoryReview?.status==="complete"&&!e.memoryReview.decisions?.some(x=>x.action==="promote")?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:"Review complete. No durable memories were made from this visit."}):null,Ze&&s==="fulfill"&&At.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,Ze?(0,o.jsxs)("div",{className:`${n}-composer`,children:[s==="fulfill"&&At.length>0?(0,o.jsxs)("select",{value:c,onChange:x=>w(x.target.value),"aria-label":"Whose wish you fulfilled",disabled:d||f||e.status!=="active",children:[(0,o.jsx)("option",{value:"",children:"Choose one villager"}),At.map(x=>(0,o.jsx)("option",{value:x.characterId,children:x.name},x.characterId))]}):null,(0,o.jsx)("div",{className:`${n}-composer-row`,children:(0,o.jsxs)("span",{className:`${n}-chat-input`,children:[(0,o.jsxs)("span",{ref:it,className:`${n}-room-mode-anchor`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-room-mode-toggle`,onClick:()=>_t(x=>!x),"aria-label":`Mode: ${s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":Ue,title:s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude",children:s==="chat"?"\u{1F4AC}":s==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),Ue?(0,o.jsx)("span",{className:`${n}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(x=>(0,o.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":s===x,disabled:d||x==="fulfill"&&At.length===0,onClick:()=>{v(x),_t(!1)},children:x==="chat"?"Chat":x==="fulfill"?"Fulfill":"Conclude"},x))}):null]}),R?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:R,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,q?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:q,children:"Projects"}):null,(0,o.jsx)("textarea",{ref:ue,className:`${n}-textarea`,rows:1,value:r,onChange:x=>N(x.target.value),onKeyDown:x=>{g1(x.key,x.shiftKey,x.nativeEvent.isComposing)&&(x.preventDefault(),ga())},placeholder:s==="fulfill"?"What did you do for them?":s==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:d||f||e.status!=="active"}),(0,o.jsx)("button",{type:"button",className:`${n}-chat-send`,onClick:ga,disabled:d||f||e.status!=="active"||s!=="conclude"&&r.trim().length===0||s==="fulfill"&&!c,"aria-label":d?"Sending":"Send",title:d?"Sending":"Send",children:d?"Sending\u2026":"Send"})]})})]}):null,h&&e.status!=="opening"?(0,o.jsx)("div",{className:`${n}-room-error`,role:"alert",children:(0,o.jsx)("p",{children:h})}):null]})]})}function v2(e){return e==="index"||e==="general"?e:["chatlogs","progress","agendas","schedules"].includes(e)?"debug":"village"}var y2={index:"Menu",villagers:"Villagers",noticeboard:"Noticeboard",venueRequests:"Venue Requests",projects:"Projects",memories:"Memories",village:"Village Settings",general:"General Settings",chatlogs:"Venue Visits",progress:"Progress",agendas:"Villager Wishes",schedules:"Villager Agendas"},w2="Testing action: runs normal time catch-up, then bypasses Background events and wishes for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.",vg=["concept","approval","builder","requirements","materials","construction","finishing"],J1={concept:"Concept & placement",approval:"Affected villagers",builder:"Assign a Builder",requirements:"Define requirements",materials:"Prepare materials",construction:"Construction",finishing:"Finishing visit"};function x2({project:e,busy:t,onSave:a}){let[i,r]=(0,m.useState)(!1),[s,c]=(0,m.useState)(e.title),[d,h]=(0,m.useState)(()=>structuredClone(e.lifecycle.change)),p=d.improvement;return i?(0,o.jsxs)("section",{className:n+"-project-card",children:[(0,o.jsx)("p",{children:"Changing reviewed terms requires fresh affected-person approvals, a Builder agreement, and a checklist. Acquired supplies remain available."}),(0,o.jsxs)("label",{children:["Project name",(0,o.jsx)("input",{value:s,onChange:b=>c(b.target.value)})]}),(0,o.jsxs)("label",{children:["Reviewed change",(0,o.jsx)("textarea",{value:d.detail,onChange:b=>h({...d,detail:b.target.value})})]}),d.classes?(0,o.jsxs)("label",{children:["Base Classes",xs.map(b=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:d.classes.includes(b),onChange:$=>h({...d,classes:$.target.checked?[...d.classes,b]:d.classes.filter(f=>f!==b)})}),b]},b))]}):null,d.capacity!==void 0?(0,o.jsxs)("label",{children:["Residential capacity",(0,o.jsx)("input",{type:"number",min:1,max:4,value:d.capacity,onChange:b=>h({...d,capacity:Number(b.target.value)})})]}):null,p?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Upgrade title",(0,o.jsx)("input",{value:p.title,onChange:b=>h({...d,improvement:{...p,title:b.target.value}})})]}),(0,o.jsxs)("label",{children:["Upgrade description",(0,o.jsx)("textarea",{value:p.description,onChange:b=>h({...d,improvement:{...p,description:b.target.value}})})]}),(0,o.jsxs)("label",{children:["Contributed Class",(0,o.jsxs)("select",{value:p.classContribution??"",onChange:b=>h({...d,improvement:{...p,classContribution:b.target.value||void 0}}),children:[(0,o.jsx)("option",{value:"",children:"No additional Class"}),xs.map(b=>(0,o.jsx)("option",{value:b,children:b},b))]})]}),(p.zones??[]).map((b,$)=>(0,o.jsxs)("section",{children:[(0,o.jsxs)("label",{children:["Zone name",(0,o.jsx)("input",{value:b.name,onChange:f=>h({...d,improvement:{...p,zones:p.zones.map((y,V)=>V===$?{...y,name:f.target.value}:y)}})})]}),(0,o.jsxs)("label",{children:["Zone description",(0,o.jsx)("textarea",{value:b.description,onChange:f=>h({...d,improvement:{...p,zones:p.zones.map((y,V)=>V===$?{...y,description:f.target.value}:y)}})})]}),(0,o.jsxs)("label",{children:["Zone kind",(0,o.jsxs)("select",{value:b.kind,onChange:f=>h({...d,improvement:{...p,zones:p.zones.map((y,V)=>V===$?{...y,kind:f.target.value,venueClass:f.target.value==="staff"?"workplace":f.target.value==="shared-residence"?"residence":p.classContribution??y.venueClass}:y)}}),children:[(0,o.jsx)("option",{value:"public",children:"Public"}),(0,o.jsx)("option",{value:"shared-residence",children:"Shared residential"}),(0,o.jsx)("option",{value:"staff",children:"Staff"})]})]}),(0,o.jsx)("button",{type:"button",className:n+"-button",onClick:()=>h({...d,improvement:{...p,zones:p.zones.filter((f,y)=>y!==$)}}),children:"Remove this zone"})]},b.id||$)),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:(p.zones?.length??0)>=16,onClick:()=>h({...d,improvement:{...p,zones:[...p.zones??[],{id:"",name:"",description:"",kind:"public",venueClass:p.classContribution??"other"}]}}),children:"Add a zone"})]}):null,(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:t,onClick:async()=>{await a({title:s,...d})&&r(!1)},children:"Submit revised proposal"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:t,onClick:()=>r(!1),children:"Cancel revision"})]}):(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:t,onClick:()=>r(!0),children:"Revise reviewed proposal"})}function $2({snapshot:e,room:t,onSnapshot:a,onReturn:i,onMap:r,onPlaceOnMap:s,mobile:c,debugEnabled:d,focusProjectId:h,siteProjectId:p}){let[b,$]=(0,m.useState)(h),[f,y]=(0,m.useState)(""),[V,z]=(0,m.useState)(""),[O,N]=(0,m.useState)("gathering"),[v,w]=(0,m.useState)(""),[A,H]=(0,m.useState)(""),[Y,F]=(0,m.useState)("upgrade"),[te,Te]=(0,m.useState)(["gathering"]),[B,re]=(0,m.useState)(""),[me,ft]=(0,m.useState)(2),[_e,Tt]=(0,m.useState)(0),[Dt,Zt]=(0,m.useState)(0),[R,q]=(0,m.useState)("replace"),[ne,Ne]=(0,m.useState)(""),[de,He]=(0,m.useState)([]),[at,Oe]=(0,m.useState)(""),[ie,Qt]=(0,m.useState)(""),[Ue,_t]=(0,m.useState)(""),[Ge,nt]=(0,m.useState)(null),[be,pe]=(0,m.useState)(null),[ue,it]=(0,m.useState)({}),[Nt,Pe]=(0,m.useState)(null),[qt,Xe]=(0,m.useState)(!1),[I,G]=(0,m.useState)([]),[ye,Ae]=(0,m.useState)(e.settings.personalizeVenueImagesByDefault!==!1),[Le,Me]=(0,m.useState)(e.settings.useVisualLoreByDefault!==!1);(0,m.useEffect)(()=>{G([])},[b]);let[Q,qe]=(0,m.useState)(!1),[J,rt]=(0,m.useState)("");(0,m.useEffect)(()=>{h&&$(h)},[h]);let Et=e.projects.filter(T=>(T.kind==="new-venue"||T.kind==="renovation")&&T.lifecycle?.phase!=="complete"),he=Et.find(T=>T.id===b)??null,Ye=he?.lifecycle,zt=e.settings.venues.find(T=>T.id===he?.venueId),Ze=e.settings.venues.find(T=>T.id===A),ea=JSON.stringify(Ze?.improvements?.[_e]??null);(0,m.useEffect)(()=>{let T=JSON.parse(ea);R==="modify"&&T?(z(T.title),w(T.description),Zt(T.extraBeds),re(T.spaceId??""),Ne(T.classContribution??""),He(T.zones??[])):(Ne(""),re(""),He([]))},[Ze?.id,ea,_e,R]);let ga=JSON.stringify(Ze?.baseClasses??Ze?.classes??["gathering"]);(0,m.useEffect)(()=>{Te(JSON.parse(ga))},[Ze?.id,ga]);let Ca=async(T,K={})=>{qe(!0),rt("");try{let le=await j(T,{method:"POST",body:JSON.stringify(K)});return a(le),le}catch(le){return rt(X(le,"The Project could not be updated.")),null}finally{qe(!1)}},Se=(T,K={})=>he&&Ca(`/projects/${encodeURIComponent(he.id)}/${T}`,K),At=async()=>{let T=f==="new-venue"?{name:V,venueClass:O,description:v}:{title:V,detail:v,...Y==="class"&&Ze?{classes:te}:{},...Y==="capacity"?{capacity:me}:{},...Y==="upgrade"?{slot:_e,improvement:{id:R==="modify"?Ze?.improvements?.[_e]?.id:void 0,title:V,description:v,extraBeds:Dt,spaceId:B||null,classContribution:ne||void 0,zones:de}}:{},...Y==="remove-upgrade"?{slot:_e,improvement:null}:{}},le=(await Ca(f==="new-venue"?"/projects":`/projects/renovations/${encodeURIComponent(A)}`,T))?.projects.find(Qe=>Qe.kind===f&&Qe.lifecycle?.phase!=="complete");le&&($(le.id),y(""))},Ta=async T=>{if(he){qe(!0),rt("");try{let K=await j("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:{id:zt?.id||he.venueId||he.id,name:he.title,form:at||he.title,description:ie||he.venueDraft?.description||zt?.description,spaceDescription:Ue||zt?.spaces?.[0]?.description||ie,venueClass:he.venueDraft?.classes?.[0]??zt?.classes?.[0]??"other"},area:T,villageName:e.village.name,setting:e.settings.setting,worldFacts:e.settings.worldFacts,selectedLorebookIds:e.settings.selectedLorebookIds,sceneryArtStyle:e.settings.sceneryArtStyle,useVisualLore:Le,useAssignedVillagerContext:ye})});Pe({area:T,image:K})}catch(K){rt(X(K,"The Venue image could not be generated."))}finally{qe(!1)}}},Da=async(T,K)=>{if(!(!K||!he)){qe(!0),rt("");try{let le=await j("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:he.title,image:await ws(K)})});Pe({area:T,image:le})}catch(le){rt(X(le,"The Venue image could not be uploaded."))}finally{qe(!1)}}},Ht=Ye?.phase;return he&&Ht==="finishing"&&qt?(0,o.jsxs)("div",{className:`${n}-project-finish-visit`,children:[(0,o.jsxs)("header",{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Xe(!1),children:"Back to Project"}),(0,o.jsx)("h2",{children:he.kind==="new-venue"?`Open ${he.title}`:`Review ${he.title}`}),(0,o.jsx)("p",{children:he.kind==="new-venue"?"Give the finished place its form, exterior, and interior. Images are optional.":"Review the approved zone names, access, and descriptions, then choose final images if you wish."})]}),he.kind==="renovation"?(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:Q,onClick:async()=>{await Se("renew-approvals")&&Xe(!1)},children:"Renew approvals for current residents and workers"}):null,he.kind==="new-venue"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Form",(0,o.jsx)("input",{value:at,onChange:T=>Oe(T.target.value),placeholder:"What is this place, physically?"})]}),(0,o.jsxs)("label",{children:["Exterior description",(0,o.jsx)("textarea",{value:ie,onChange:T=>Qt(T.target.value)})]}),(0,o.jsxs)("label",{children:["Interior description",(0,o.jsx)("textarea",{value:Ue,onChange:T=>_t(T.target.value)})]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:ye,onChange:T=>Ae(T.target.checked)}),"Use assigned villagers\u2019 personality for images"]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:Le,onChange:T=>Me(T.target.checked)}),"Use selected visual lore"]}),zt?.classes?.includes("residence")?(0,o.jsx)("p",{children:"Each occupant receives a personal space when they move in."}):null,(0,o.jsx)(sh,{rooms:I,onChange:G,workplace:zt?.classes?.includes("workplace"),people:[{id:"player",name:"You"},...e.villagers.map(T=>({id:T.characterId,name:T.name}))]})]}):(0,o.jsx)("p",{children:Ye?.change?.detail}),["exterior",...he.kind==="new-venue"?["interior"]:[]].map(T=>{let K=T==="exterior"?Ge:be;return(0,o.jsxs)("section",{className:`${n}-project-image`,children:[(0,o.jsxs)("h3",{children:[T==="exterior"?"Exterior":"Interior"," image \xB7 optional"]}),K?(0,o.jsx)("img",{src:K.url,alt:`${T} preview`}):(0,o.jsx)("p",{children:"No image chosen. A placeholder will be used."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Q,onClick:()=>{Ta(T)},children:"Generate image"}),(0,o.jsx)("input",{type:"file",accept:"image/*","aria-label":`Upload ${T} image`,disabled:Q,onChange:le=>{let Qe=le.target.files?.[0];le.target.value="",Da(T,Qe)}})]},T)}),he.kind==="renovation"?(Ye?.change?.improvement?.zones??[]).map(T=>(0,o.jsxs)("section",{className:n+"-project-image",children:[(0,o.jsxs)("h3",{children:[T.name," \xB7 ",T.kind]}),(0,o.jsx)("p",{children:T.description}),ue[T.id]?(0,o.jsx)("img",{src:ue[T.id].url,alt:T.name+" preview"}):(0,o.jsx)("p",{children:"Image optional. Existing images are preserved."}),(0,o.jsxs)("label",{children:["Upload final zone image",(0,o.jsx)("input",{type:"file",accept:"image/*",disabled:Q,onChange:async K=>{let le=K.target.files?.[0];if(K.target.value="",!!le){qe(!0);try{let Qe=await j("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:T.name,image:await ws(le)})});it(Fe=>({...Fe,[T.id]:Qe}))}catch(Qe){rt(X(Qe,"The zone image could not be uploaded."))}finally{qe(!1)}}}})]})]},T.id)):null,Nt?(0,o.jsxs)("section",{className:`${n}-project-image`,children:[(0,o.jsx)("img",{src:Nt.image.url,alt:"Generated Venue candidate"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Nt.area==="exterior"?nt(Nt.image):pe(Nt.image),Pe(null)},children:"Use this image"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Pe(null),children:"Discard"})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Q||he.kind==="new-venue"&&(!at.trim()||!ie.trim()||!Ue.trim()),onClick:async()=>{await Se("open",{form:at,exteriorDescription:ie,interiorDescription:Ue,exteriorImage:Ge,interiorImage:be,zoneImages:ue,privateSpaces:I,imageContext:{useAssignedVillagerContext:ye,useVisualLore:Le}})&&Xe(!1)},children:"Open Venue"}),J?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:J}):null]}):(0,o.jsxs)("div",{className:`${n}-project-screen`,"data-mobile":c,children:[(0,o.jsxs)("header",{className:`${n}-project-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-project-eyebrow`,children:"PROJECTS"}),(0,o.jsx)("h2",{children:he?.title??"Build something in the Village"}),(0,o.jsx)("p",{children:he?he.kind==="new-venue"?"A new place, from blueprint to opening day.":"Change a place that already belongs to the Village.":"One New Venue and one Renovation may be underway at once."})]}),he?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>$(""),children:"All Projects"}):null]}),he?(0,o.jsxs)("div",{className:`${n}-project-layout`,children:[(0,o.jsx)("nav",{className:`${n}-project-rail`,"aria-label":"Project phases",children:vg.filter(T=>T!=="approval"||he.kind==="renovation").map((T,K)=>{let le=vg.indexOf(Ht),Qe=vg.indexOf(T);return(0,o.jsxs)("div",{className:`${n}-project-step`,"data-state":Qe===le?"active":Qe<le?"done":"locked",children:[(0,o.jsx)("b",{children:Qe<le?"\u2713":K+1}),(0,o.jsx)("span",{children:J1[T]})]},T)})}),(0,o.jsxs)("main",{className:`${n}-project-card`,children:[he.kind==="renovation"&&!["construction","finishing","complete"].includes(Ht??"")?(0,o.jsx)(x2,{project:he,busy:Q,onSave:T=>Ca(`/projects/${encodeURIComponent(he.id)}/revise`,T)},he.id+he.updatedAt):null,Ht==="concept"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Place the blueprint"}),(0,o.jsx)("p",{children:he.venueDraft?.description}),(0,o.jsx)("p",{children:"Choose a clear spot on the Village map. The blueprint marks where this Venue will be built."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>s(he.id),children:"Place on Village map"})]}):null,Ht==="approval"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"People affected by this change"}),(0,o.jsx)("p",{children:Ye?.change?.detail}),(Ye?.change?.improvement?.zones??[]).map(T=>(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:T.name})," \xB7 ",T.kind,": ",T.description]},T.id)),(0,o.jsx)("p",{children:"They may approve in conversation or reply through Mailbox. Every affected resident or worker must agree before you ask for a Builder."}),Ye?.affectedIds.map(T=>(0,o.jsxs)("p",{children:[e.villagers.find(K=>K.characterId===T)?.name??T,":"," ",Ye.approvals.some(K=>K.residentId===T)?"Approved":"Awaiting approval"]},T)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Q,onClick:()=>{Se("request-approval")},children:"Ask remaining villagers through Mailbox"})]}):null,Ht==="builder"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Find a Builder"}),(0,o.jsx)("p",{children:"Find villagers on the map and ask them about this Project in a real conversation. Their clear agreements appear here automatically."}),e.progressEngineVersion!==1?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Q,onClick:()=>{Se("recheck-builder")},children:"Review recent chats for missed agreements"}):null,Ye?.candidates.length?Ye.candidates.map(T=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:Q,onClick:()=>{Se("builder",{residentId:T.residentId})},children:["Assign"," ",e.villagers.find(K=>K.characterId===T.residentId)?.name??"this Villager"]},T.residentId)):(0,o.jsx)("p",{children:"No one has agreed yet."})]}):null,Ht==="requirements"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Define requirements with your Builder"}),(0,o.jsxs)("p",{children:["Ask"," ",e.villagers.find(T=>T.characterId===Ye?.builderId)?.name??"your Builder"," ","what this job needs. They decide the materials, functional equipment, and finishing supplies. Their checklist appears here automatically."]}),Ye?.requirements.length?(0,o.jsxs)("div",{children:[Ye.requirements.map(T=>(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:T.category})," \xB7 ",T.needed?T.title:"Not needed"]},T.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Q,onClick:()=>{Se("requirements")},children:"Accept Builder's plan"}),(0,o.jsx)("p",{children:"To change it, discuss a revision with the Builder."})]}):(0,o.jsx)("p",{children:"Waiting for the Builder's plan."}),Ye?.candidates.filter(T=>T.residentId!==Ye.builderId).map(T=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:Q,onClick:()=>{Se("builder",{residentId:T.residentId})},children:["Switch to"," ",e.villagers.find(K=>K.characterId===T.residentId)?.name??"another Builder"]},T.residentId))]}):null,Ht==="materials"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Prepare materials"}),(0,o.jsx)("p",{children:"Find each supply in the Village, then bring it to this blueprint site. Offers and handoffs are recognized during your visits. Deliveries update the list here."}),Ye?.requirements.filter(T=>T.needed).map(T=>(0,o.jsxs)("div",{className:`${n}-project-material`,children:[(0,o.jsx)("strong",{children:T.title}),(0,o.jsx)("span",{children:T.deliveredAt?"Delivered":T.carriedAt?"Ready to deliver":"Find and obtain"}),e.progressEngineVersion===1&&!T.carriedAt?(0,o.jsx)(o.Fragment,{children:Ye.sources?.some(K=>K.requirementId===T.id)?(0,o.jsx)("p",{children:"The supplier\u2019s handoff will be recognized during your visit."}):(0,o.jsxs)(o.Fragment,{children:[(Ye.recordedItems??[]).filter(K=>K.itemName.toLocaleLowerCase()===T.title.toLocaleLowerCase()).map(K=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:Q,onClick:()=>{Se("existing-source",{requirementId:T.id,venueId:K.venueId,zoneId:K.zoneId})},children:["Choose available item at"," ",e.settings.venues.find(le=>le.id===K.venueId)?.name??"Venue",K.zoneId?" \xB7 "+(e.settings.venues.find(le=>le.id===K.venueId)?.zones?.find(le=>le.id===K.zoneId)?.name??"Zone"):""]},K.venueId+":"+K.zoneId+":"+K.itemName)),(Ye.heldSupplies??[]).filter(K=>!K.assignedRequirementId&&K.itemName.toLocaleLowerCase()===T.title.toLocaleLowerCase()).map(K=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:Q,onClick:()=>{Se("reallocate-held",{requirementId:T.id,heldId:K.id})},children:["Commit previously acquired ",K.itemName,K.deliveredAt?" (already delivered)":""]},K.id))]})}):null,T.carriedAt&&!T.deliveredAt&&p===he.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Q,onClick:()=>{Se("deliver",{requirementId:T.id})},children:"Deliver at blueprint site"}):null,T.carriedAt&&!T.deliveredAt&&p!==he.id?(0,o.jsx)("span",{children:"Visit this Project's blueprint on the Village map to deliver it."}):null]},T.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Q||Ye?.requirements.some(T=>T.needed&&!T.deliveredAt),onClick:()=>{Se("start")},children:"Begin construction"})]}):null,Ht==="construction"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is underway"}),(0,o.jsxs)("p",{children:[e.villagers.find(T=>T.characterId===Ye?.builderId)?.name??"The Builder"," is focused on this site for 24 hours, with normal rest and essential breaks."]}),Ye?.workOrder?(0,o.jsxs)("p",{children:["Expected completion: ",new Date(Ye.workOrder.completesAt).toLocaleString()]}):null,Ye?.blockedReason?(0,o.jsx)("p",{role:"status",children:Ye.blockedReason}):null,he.status==="blocked"?Ye?.candidates.filter(T=>T.residentId!==Ye.builderId).map(T=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,onClick:()=>{Se("builder",{residentId:T.residentId})},children:["Continue with"," ",e.villagers.find(K=>K.characterId===T.residentId)?.name??"Builder"]},T.residentId)):null,d&&he.status==="building"?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Q,onClick:()=>{Se("debug-complete")},children:"DEBUG: Complete construction now"}):null]}):null,Ht==="finishing"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is complete"}),(0,o.jsxs)("p",{children:["Visit the finished ",he.kind==="new-venue"?"Venue":"Renovation"," to define its final details and open it to the Village."]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Xe(!0),children:"Visit finished Venue"})]}):null,J?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:J}):null,(0,o.jsx)("footer",{className:`${n}-project-footer`,children:t?.status==="active"?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:i,children:"Return to current visit"}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:r,children:"Back to map"})})]})]}):(0,o.jsxs)("div",{className:`${n}-project-slots`,children:[["new-venue","renovation"].map(T=>{let K=Et.find(le=>le.kind===T);return(0,o.jsxs)("button",{type:"button",className:`${n}-project-slot`,onClick:()=>K?$(K.id):y(T),children:[(0,o.jsx)("span",{children:T==="new-venue"?"NEW VENUE":"RENOVATION"}),(0,o.jsx)("strong",{children:K?.title??(T==="new-venue"?"Imagine a new place":"Change an existing Venue")}),(0,o.jsx)("small",{children:K?.lifecycle?J1[K.lifecycle.phase]??"Opening":"Available"})]},T)}),f?(0,o.jsxs)("section",{className:`${n}-project-card ${n}-project-create`,children:[(0,o.jsx)("h3",{children:f==="new-venue"?"Describe the new Venue":"Describe the Renovation"}),f==="renovation"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Venue",(0,o.jsxs)("select",{value:A,onChange:T=>H(T.target.value),children:[(0,o.jsx)("option",{value:"",children:"Choose a Venue"}),e.settings.venues.filter(T=>T.constructionStatus!=="worksite").map(T=>(0,o.jsx)("option",{value:T.id,children:T.name},T.id))]})]}),(0,o.jsxs)("label",{children:["Physical change",(0,o.jsxs)("select",{value:Y,onChange:T=>F(T.target.value),children:[(0,o.jsx)("option",{value:"upgrade",children:"Add or replace an Upgrade"}),(0,o.jsx)("option",{value:"remove-upgrade",children:"Remove an Upgrade"}),(0,o.jsx)("option",{value:"class",children:"Change base Classes"}),(0,o.jsx)("option",{value:"capacity",children:"Change Residence capacity"})]})]}),Y==="class"?(0,o.jsxs)("fieldset",{children:[(0,o.jsx)("legend",{children:"Base Classes"}),(0,o.jsx)("p",{children:"Choose one or two base Classes. Upgrade contributions also count toward the two-Class limit."}),xs.map(T=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:te.includes(T),onChange:K=>Te(le=>K.target.checked?[...le,T]:le.filter(Qe=>Qe!==T))}),T]},T))]}):null,Y==="capacity"?(0,o.jsxs)("label",{children:["Capacity",(0,o.jsx)("input",{type:"number",min:1,max:4,value:me,onChange:T=>ft(Number(T.target.value))})]}):null,Y==="upgrade"||Y==="remove-upgrade"?(0,o.jsxs)("label",{children:["Upgrade slot",(0,o.jsxs)("select",{value:_e,onChange:T=>Tt(Number(T.target.value)),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",Ze?.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",Ze?.improvements?.[1]?.title??"empty"]})]})]}):null,Y==="upgrade"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Upgrade action",(0,o.jsxs)("select",{value:R,onChange:T=>q(T.target.value),children:[(0,o.jsx)("option",{value:"replace",children:"Add or replace this Upgrade"}),Ze?.improvements?.[_e]?(0,o.jsx)("option",{value:"modify",children:"Modify the existing Upgrade"}):null]})]}),(0,o.jsxs)("label",{children:["Class contributed",(0,o.jsxs)("select",{value:ne,onChange:T=>Ne(T.target.value),children:[(0,o.jsx)("option",{value:"",children:"No additional Class"}),xs.map(T=>(0,o.jsx)("option",{value:T,children:T},T))]})]}),(0,o.jsxs)("label",{children:["Existing area improved (optional)",(0,o.jsxs)("select",{value:B,onChange:T=>re(T.target.value),children:[(0,o.jsx)("option",{value:"",children:"No existing area"}),Ze?.zones?.filter(T=>T.kind!=="private-residence").map(T=>(0,o.jsx)("option",{value:T.id,children:T.name},T.id))]})]}),(0,o.jsx)("p",{children:"A Venue supports at most two distinct Classes, including its Upgrades. An Upgrade can add zones or improve an existing area."}),(de??[]).map((T,K)=>(0,o.jsxs)("section",{className:n+"-project-card",children:[(0,o.jsxs)("label",{children:["Zone name",(0,o.jsx)("input",{value:T.name,onChange:le=>He(Qe=>Qe?.map((Fe,S)=>S===K?{...Fe,name:le.target.value}:Fe))})]}),(0,o.jsxs)("label",{children:["Area",(0,o.jsxs)("select",{value:T.kind,onChange:le=>He(Qe=>Qe?.map((Fe,S)=>S===K?{...Fe,kind:le.target.value,venueClass:le.target.value==="shared-residence"?"residence":le.target.value==="staff"?"workplace":ne||Ze?.classes?.[0]||"other"}:Fe)),children:[(0,o.jsx)("option",{value:"public",children:"Public \xB7 everyone"}),(0,o.jsx)("option",{value:"shared-residence",children:"Shared living \xB7 residents and guests"}),(0,o.jsx)("option",{value:"staff",children:"Staff \xB7 all current workers and guests"}),(0,o.jsx)("option",{value:"restricted",children:"Private \xB7 assigned controllers and guests"})]})]}),["staff","restricted"].includes(T.kind)?(0,o.jsxs)("label",{children:["Purpose",(0,o.jsx)("input",{value:T.purpose??"",maxLength:240,onChange:le=>He(Qe=>Qe?.map((Fe,S)=>S===K?{...Fe,purpose:le.target.value}:Fe))})]}):null,T.kind==="restricted"?(0,o.jsxs)("fieldset",{children:[(0,o.jsx)("legend",{children:"Room controllers"}),e.villagers.map(le=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:T.controllerIds?.includes(le.characterId)??!1,onChange:Qe=>He(Fe=>Fe?.map((S,x)=>x===K?{...S,controllerIds:Qe.target.checked?[...S.controllerIds??[],le.characterId]:S.controllerIds?.filter(D=>D!==le.characterId)}:S))}),le.name]},le.characterId))]}):null,(0,o.jsxs)("label",{children:["Description",(0,o.jsx)("textarea",{value:T.description,onChange:le=>He(Qe=>Qe?.map((Fe,S)=>S===K?{...Fe,description:le.target.value}:Fe))})]}),(0,o.jsx)("button",{type:"button",className:n+"-button",onClick:()=>He(le=>le?.filter((Qe,Fe)=>Fe!==K)),children:"Remove from proposal"})]},T.id??K)),(0,o.jsx)("button",{type:"button",className:n+"-button",onClick:()=>He(T=>[...T??[],{name:"",kind:"public",description:"",venueClass:ne||Ze?.classes?.[0]||"other"}]),children:"Add a Zone to this Upgrade"})]}):null,Y==="upgrade"?(0,o.jsxs)("label",{children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:Dt,onChange:T=>Zt(Number(T.target.value))})]}):null]}):(0,o.jsxs)("label",{children:["Venue Class",(0,o.jsxs)("select",{value:O,onChange:T=>N(T.target.value),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"other",children:"Other"})]})]}),(0,o.jsxs)("label",{children:[f==="new-venue"?"Venue name":"Project name",(0,o.jsx)("input",{value:V,onChange:T=>z(T.target.value),placeholder:"Give this place a name"})]}),(0,o.jsxs)("label",{children:["What would this ",f==="new-venue"?"place":"change"," be like in the Village?",(0,o.jsx)("textarea",{value:v,onChange:T=>w(T.target.value)})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Q||!V.trim()||!v.trim()||f==="renovation"&&(!A||Y==="class"&&(!te.length||te.length>2)),onClick:()=>{At()},children:f==="new-venue"?"Continue to map placement":"Start Renovation"})]}):null]}),!he&&J?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:J}):null]})}function N2({characterId:e,total:t,busy:a,onCorrect:i}){let[r,s]=(0,m.useState)(null),[c,d]=(0,m.useState)(!1),[h,p]=(0,m.useState)(""),b=async $=>{d(!0),p("");try{s(await j(`/agendas/${encodeURIComponent(e)}/history${$===void 0?"":`?cursor=${encodeURIComponent($)}`}`))}catch(f){p(X(f,"Wish history could not be read."))}finally{d(!1)}};return(0,o.jsxs)("details",{className:`${n}-agenda-notes`,onToggle:$=>{$.currentTarget.open&&!r&&!c&&b()},children:[(0,o.jsx)("summary",{children:`Wish history (${t})`}),h?(0,o.jsx)("p",{role:"alert",children:h}):null,c?(0,o.jsx)("p",{children:"Loading wish history\u2026"}):null,(0,o.jsx)("ul",{className:`${n}-story`,children:r?.entries.map($=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:$.wish.wish}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`${$.correctedAt?"Corrected":$.kind==="fulfilled"?"Fulfilled":"Expired"} ${new Date($.correctedAt||$.fulfilledAt).toLocaleDateString()}`}),$.kind==="fulfilled"&&!$.correctedAt?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:a||c,onClick:()=>{(async()=>{await i(e,$.wish.id),await b()})()},children:"Mark as not fulfilled"}):null]},$.sequence))}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:c,onClick:()=>{b()},children:"Latest outcomes"}),r?.nextCursor?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:c,onClick:()=>{b(r.nextCursor)},children:"Older outcomes"}):null]})}function S2({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let l=()=>{let g=e.getBoundingClientRect();a(g.width<=704||g.width<=880&&g.height<=512)};l();let u=new ResizeObserver(l);return u.observe(e),()=>u.disconnect()},[e]);let[i,r]=(0,m.useState)(null),s=i?.settings.homeBuildings??[],[c,d]=(0,m.useState)(null),[h,p]=(0,m.useState)(null),[b,$]=(0,m.useState)(null),[f,y]=(0,m.useState)(0),[V,z]=(0,m.useState)(0),[O,N]=(0,m.useState)(0),[v,w]=(0,m.useState)(null),[A,H]=(0,m.useState)(!1),[Y,F]=(0,m.useState)(""),[te,Te]=(0,m.useState)(""),[B,re]=(0,m.useState)(""),[me,ft]=(0,m.useState)(null),[_e,Tt]=(0,m.useState)(null),[Dt,Zt]=(0,m.useState)(!1),[R,q]=(0,m.useState)("home"),[ne,Ne]=(0,m.useState)(""),[de,He]=(0,m.useState)(""),[at,Oe]=(0,m.useState)(""),[ie,Qt]=(0,m.useState)(null),[Ue,_t]=(0,m.useState)("view"),[Ge,nt]=(0,m.useState)("exterior");(0,m.useEffect)(()=>{if(Ge==="exterior")return;let l=i?.settings.venues.find(g=>g.id===ie);l?.zones?.some(g=>g.id===Ge)||(Ge.startsWith("class:")?l&&Jn(l).includes(Ge.slice(6)):l&&Ge.startsWith("private:")&&(l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[])).includes(Ge.slice(8))&&l.privateSpaces?.some(g=>g.ownerId===Ge.slice(8)))||nt("exterior")},[i,ie,Ge]);let[be,pe]=(0,m.useState)(null),[ue,it]=(0,m.useState)(null),[Nt,Pe]=(0,m.useState)(!1),[qt,Xe]=(0,m.useState)(""),[I,G]=(0,m.useState)(""),[ye,Ae]=(0,m.useState)(""),[Le,Me]=(0,m.useState)(null),[Q,qe]=(0,m.useState)(!1),[J,rt]=(0,m.useState)("index"),Et=v2(J),[he,Ye]=(0,m.useState)({}),[zt,Ze]=(0,m.useState)(null),ea=(0,m.useRef)(null),ga=(0,m.useRef)([]),[Ca,Se]=(0,m.useState)({}),[At,Ta]=(0,m.useState)({}),[Da,Ht]=(0,m.useState)(""),[T,K]=(0,m.useState)(null),[le,Qe]=(0,m.useState)(""),[Fe,S]=(0,m.useState)(""),[x,D]=(0,m.useState)(""),[P,ge]=(0,m.useState)(null),[oe,lt]=(0,m.useState)(""),[ta,_a]=(0,m.useState)([]),[Nn,dn]=(0,m.useState)(1600),[ca,Sn]=(0,m.useState)([]),[un,kg]=(0,m.useState)(1600),[xu,sx]=(0,m.useState)(null),[Cg,Tg]=(0,m.useState)(""),[Zl,Zr]=(0,m.useState)([]),[Eg,lx]=(0,m.useState)(""),[$s,Si]=(0,m.useState)(!1),[Qr,Fr]=(0,m.useState)(!1),[cx,Ql]=(0,m.useState)(null),[Jr,Ns]=(0,m.useState)(null),[hn,$u]=(0,m.useState)(!1),[Ss,Kr]=(0,m.useState)(!1),[Wr,Ag]=(0,m.useState)(!1),[Rg,dx]=(0,m.useState)(""),[Mg,ux]=(0,m.useState)({}),[ks,zg]=(0,m.useState)({}),[Fl,Vg]=(0,m.useState)(""),[Je,Jl]=(0,m.useState)(0),[kn,Og]=(0,m.useState)(""),[fa,Ig]=(0,m.useState)(""),[Kn,Dg]=(0,m.useState)("rebuild"),[Qa,Nu]=(0,m.useState)(Pr("rebuild").premise),[Cs,_g]=(0,m.useState)(""),[hx,mx]=(0,m.useState)(dg),[Wn,Hg]=(0,m.useState)([]),[Ve,ki]=(0,m.useState)([]),[Cn,Ug]=(0,m.useState)(1),[Su,px]=(0,m.useState)({x:.5,y:.5}),[Lg,ei]=(0,m.useState)(!1),[lr,ku]=(0,m.useState)([]),[qg,Kl]=(0,m.useState)(""),ti=(0,m.useRef)(null),[Tn,Wl]=(0,m.useState)(br["Painted illustration"]),[En,ec]=(0,m.useState)(!0),[An,tc]=(0,m.useState)(!0),[eo,Bg]=(0,m.useState)(!0),[jg,mn]=(0,m.useState)(null),[Ts,Es]=(0,m.useState)(null),[As,ac]=(0,m.useState)(!1),[Yg,Cu]=(0,m.useState)(""),[nc,Gg]=(0,m.useState)(R1),[ht,cr]=(0,m.useState)("generate"),[gx,Tu]=(0,m.useState)(""),[ic,Eu]=(0,m.useState)(null),[fx,Pg]=(0,m.useState)(""),[Rs,Au]=(0,m.useState)(null),[to,Ru]=(0,m.useState)(""),[ao,Mu]=(0,m.useState)(""),Ms=JSON.stringify({scenario:Kn,premise:Qa.trim(),direction:Cs.trim(),setting:fa.trim(),lorebooks:ca,loreBudget:un,persona:x,artStyle:Tn,personalityDefault:En,visualLoreDefault:An}),zu=(0,m.useRef)(Ms),Xg=(0,m.useRef)(Ve);(0,m.useEffect)(()=>{Xg.current=Ve},[Ve]),(0,m.useEffect)(()=>{zu.current!==Ms&&i?.isFounded,zu.current=Ms},[Ms,i?.isFounded]);let Vu=JSON.stringify({setting:fa.trim(),worldFacts:i?.isFounded?Wn:null,lorebooks:ca,artStyle:Tn,useVisualLore:eo,structure:to,negative:ao,options:nc}),[ba,zs]=(0,m.useState)(!1),[Zg,rc]=(0,m.useState)(""),[Ou,bx]=(0,m.useState)("Connections are still loading."),[Qg,Fg]=(0,m.useState)(!1),[vx,Vs]=(0,m.useState)(!1),[Iu,Ee]=(0,m.useState)(""),[yx,oc]=(0,m.useState)(!1),[no,Du]=(0,m.useState)(""),[Rn,io]=(0,m.useState)(null),[_u,ai]=(0,m.useState)(null),[Jg,sc]=(0,m.useState)(!1),[Mn,ro]=(0,m.useState)(""),[Kg,ni]=(0,m.useState)(null),oo=i?.settings.townMapView??Gl("cover"),Wg=i?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:null,wx=Rn?.size??Wg,ef=i?ht==="existing"?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:Rs&&ic===ht?Rs:{width:i.settings.townMapGenerationWidth,height:i.settings.townMapGenerationHeight}:null,xx=i?{min:i.settings.townMapZoomMin,max:i.settings.townMapZoomMax,step:i.settings.townMapZoomStep}:{min:1,max:1,step:.1},$x=Ss?null:Rn?Rn.image:no||null,dr=ht==="none"?null:ht==="existing"?no||null:ic===ht&&(ht!=="generate"||fx===Vu)&&gx||null,lc=Rn!==null||Jg,ur=lc?_u??oo:oo,Hu=Rn?pg(Rn.size):null,[Ci,bt]=(0,m.useState)(""),[va,ve]=(0,m.useState)(""),[W,se]=(0,m.useState)(!1),[_,Be]=(0,m.useReducer)((l,u)=>{let g=typeof u=="function"?u(l):u;return l?.id&&l.id===g?.id&&(l.sceneRevision??0)>(g.sceneRevision??0)?l:g},null),[Nx,Os]=(0,m.useState)(!1),[Sx,Fa]=(0,m.useState)(!1),[hr,Ja]=(0,m.useState)(""),[Is,cc]=(0,m.useState)("chat"),[Ds,dc]=(0,m.useState)(""),[kx,tf]=(0,m.useState)(""),[Cx,pn]=(0,m.useState)([]),gn=(0,m.useRef)(new Set),[_s,Tx]=(0,m.useState)(!1),af=(0,m.useRef)(0),so=(0,m.useRef)(0),nf=(0,m.useRef)(""),[Uu,lo]=(0,m.useState)(""),[da,St]=(0,m.useState)(!1),[Hs,rf]=(0,m.useState)(""),uc=(0,m.useRef)(new Set),ii=(0,m.useRef)(!1),ri=(0,m.useRef)(null),co=(0,m.useRef)(null),ua=(0,m.useRef)(null),zn=(0,m.useCallback)(l=>{let u=[];for(let g of l)gn.current.has(g.id)||(gn.current.add(g.id),u.push(g));u.length>0&&pn(g=>[...g,...u])},[]),Us=(0,m.useRef)(!1),[Ex,$t]=(0,m.useState)(""),[Ax,mr]=(0,m.useState)(""),[uo,oi]=(0,m.useState)(!1),[of,Lu]=(0,m.useState)(""),sf=(0,m.useRef)(""),hc=(0,m.useRef)(!1),[qu,lf]=(0,m.useState)(!1),Bu=(0,m.useRef)(null),ju=(0,m.useRef)(null);(0,m.useEffect)(()=>{let l=ju.current,u=Bu.current;l===null||!u||(ju.current=null,u.focus(),u.setSelectionRange(l,l))},[Fe]);let mc=(0,m.useCallback)(async(l=!1)=>{if(hc.current)return null;hc.current=!0;let u=setTimeout(()=>lf(!0),Xk);try{let g=await j("/reconcile",{method:"POST",body:l?JSON.stringify({forceStory:!0}):void 0});return r(g),g}catch{return null}finally{clearTimeout(u),lf(!1),hc.current=!1}},[]),Rx=(0,m.useCallback)(async()=>{let l=i?.happenings[0]?.id??"";Lu("Writing...");let u=await mc(!0);if(!u){Lu("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}Lu((u.happenings[0]?.id??"")===l?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[i,mc]),Ke=(0,m.useCallback)(async(l={})=>{try{let u=await j("",{signal:l.signal});r(u),bt("")}catch(u){if(l.signal?.aborted||l.quiet)return;r(null),bt(X(u,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let l=i?.village.nextTransitionAt??"";l.length===0||l===sf.current||(sf.current=l,i?.isFounded&&mc())},[i,mc]);let Vn=(0,m.useCallback)(async l=>{try{let u=await j("/catalog",{signal:l});d(u.characters),bt("")}catch(u){if(l?.aborted)return;bt(X(u,"Could not read your character library."))}},[]),ho=(0,m.useCallback)(async l=>{try{let u=await j("/personas",{signal:l});ge(u.personas)}catch(u){if(l?.aborted)return;ge([]),bt(X(u,"Could not read your Personas."))}},[]),mo=(0,m.useCallback)(async l=>{try{let u=await j("/lorebooks",{signal:l});sx(u.books),Tg("")}catch(u){if(l?.aborted)return;Tg(X(u,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),cf=(0,m.useRef)(new Set),Ls=(0,m.useCallback)(async l=>{try{let u=await j("/memories",{signal:l});p(u),bt("");let g=u.archive.pendingReviewId;g&&!cf.current.has(g)&&!l?.aborted&&(cf.current.add(g),window.setTimeout(()=>{l?.aborted||j(`/rooms/archive/${encodeURIComponent(g)}/retry-memory`,{method:"POST"}).then(()=>j("/memories")).then(E=>{l?.aborted||p(E)}).catch(()=>{})},0))}catch(u){if(l?.aborted)return;p(null),bt(X(u,"Could not read villager memories."))}},[]),Mx=(0,m.useCallback)(async(l,u)=>{let g=l==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(g)){se(!0);try{await j(`/memories/${l}/${encodeURIComponent(u)}`,{method:"DELETE"}),await Ls()}catch(E){bt(X(E,"That memory could not be removed."))}finally{se(!1)}}},[Ls]),pc=(0,m.useCallback)(async l=>{try{let u=await j("/agendas",{signal:l});ft(u.villagers)}catch(u){if(l?.aborted)return;ft(null),bt(X(u,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(R!=="menu"||J!=="agendas"&&J!=="schedules"||!me?.some(u=>u.agenda?.personalizationPending&&!u.agenda.personalizationFailure))return;let l=window.setInterval(()=>{pc()},5e3);return()=>window.clearInterval(l)},[me,pc,J,R]);let zx=(0,m.useCallback)(async l=>{se(!0);try{let u=await j(`/agendas/${encodeURIComponent(l)}/regenerate`,{method:"POST"});ft(u.villagers),bt("")}catch(u){bt(X(u,"That villager could not be asked again."))}finally{se(!1)}},[]),Vx=(0,m.useCallback)(async(l,u)=>{se(!0);try{let g=await j(`/agendas/${encodeURIComponent(l)}/completed/${encodeURIComponent(u)}/correct`,{method:"POST"});ft(g.villagers),bt("")}catch(g){bt(X(g,"That wish completion could not be corrected."))}finally{se(!1)}},[]),Ox=(0,m.useCallback)(async(l,u)=>{se(!0);try{let g=await j(`/agendas/${encodeURIComponent(l)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:u})});ft(g.villagers),bt("")}catch(g){bt(X(g,"Schedule use could not be changed."))}finally{se(!1)}},[]);(0,m.useEffect)(()=>{let l=new AbortController;return Ke({signal:l.signal}),()=>l.abort()},[Ke]),(0,m.useEffect)(()=>{let l=()=>{document.hidden||Ke({quiet:!0})},u=setInterval(()=>{document.hidden||hc.current||Ke({quiet:!0})},Pk);return document.addEventListener("visibilitychange",l),()=>{clearInterval(u),document.removeEventListener("visibilitychange",l)}},[Ke]),(0,m.useEffect)(()=>{if(!_?.id||_.status==="closed"||R!=="room")return;nf.current!==_.id?(nf.current=_.id,so.current=Date.parse(_.lastActivityAt||_.startedAt)||Date.now()):so.current=Math.max(so.current,Date.parse(_.lastActivityAt||_.startedAt)||0);let l=!1,u=L=>{l||gs(_.id,ua.current)||(Be(null),Fa(!1),pn([]),gn.current.clear(),lo(L==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),q("home"),Ke())},g=(L=!1)=>{gs(_.id,ua.current)||j("/rooms/active").then(async({session:ee})=>{if(l||gs(_.id,ua.current))return;if(ee?.id===_.id){Be(ee),L&&(await j("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:_.id})}),so.current=Date.now());return}let ke=await j(`/rooms/archive/${encodeURIComponent(_.id)}`).catch(()=>null);l||gs(_.id,ua.current)||u(ke?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(ee=>{let ke=fs(ee);ke&&u(ke)})},E=L=>{if(!gs(_.id,ua.current)){if(Date.now()-so.current>=30*6e4){L.cancelable&&L.preventDefault(),L.stopImmediatePropagation(),g(!0);return}so.current=Date.now(),!(Date.now()-af.current<15e3)&&(af.current=Date.now(),j("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:_.id})}).catch(ee=>{let ke=fs(ee);ke?u(ke):g()}))}},M=()=>g();window.addEventListener("focus",M),document.addEventListener("visibilitychange",M);for(let L of["pointerdown","keydown","input","scroll"])window.addEventListener(L,E,!0);return()=>{l=!0,window.removeEventListener("focus",M),document.removeEventListener("visibilitychange",M);for(let L of["pointerdown","keydown","input","scroll"])window.removeEventListener(L,E,!0)}},[_?.id,_?.status,_?.lastActivityAt,_?.startedAt,R,Ke]),(0,m.useEffect)(()=>{if(!_?.id||_.operation?.status!=="running"||da)return;let l=!1,u=!1,g=async()=>{if(l||u||document.hidden)return;u=!0;let M=await bs(_.id,_.operation?.id);u=!1,!l&&M&&(Be(M),oi(M.status==="closed"),M.operation?.status!=="running"&&$t(""))},E=window.setInterval(()=>{g()},1500);return window.addEventListener("focus",g),document.addEventListener("visibilitychange",g),()=>{l=!0,window.clearInterval(E),window.removeEventListener("focus",g),document.removeEventListener("visibilitychange",g)}},[_?.id,_?.operation?.id,_?.operation?.status,da]),(0,m.useEffect)(()=>{if(!_?.id||_.operation?.status!=="interrupted"||_.submissions?.some(u=>u.id===_.operation?.id))return;let l=!1;return j(`/rooms/${encodeURIComponent(_.id)}/operations/${encodeURIComponent(_.operation.id)}`).then(({operation:u})=>{l||!u?.input?.message||Ja(g=>g||u.input?.message||"")}).catch(()=>{}),()=>{l=!0}},[_?.id,_?.operation?.id,_?.operation?.status,_?.submissions]),(0,m.useEffect)(()=>{let l=new AbortController;return j("/rooms/active",{signal:l.signal}).then(({session:u,debugDiscardEnabled:g})=>{Tx(g),!(l.signal.aborted||!u)&&(Be(u),cc("chat"),Fa(!0),q("room"),u.status==="opening"&&(St(!0),j("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u.id}),signal:AbortSignal.timeout(3e4)}).then(({session:E})=>{l.signal.aborted||Be(E)}).catch(async E=>{if(l.signal.aborted)return;let M=await _1(u.id);l.signal.aborted||(M?Be(M):$t(U1(E)))}).finally(()=>{l.signal.aborted||St(!1)})))}).catch(()=>{}),()=>l.abort()},[]),(0,m.useEffect)(()=>{if(J!=="chatlogs"||!i?.isFounded)return;let l=new AbortController,u=new URLSearchParams;return Y&&u.set("venueId",Y),te&&u.set("characterId",te),u.set("offset",String(V)),u.set("limit","20"),$(null),j(`/rooms/archive?${u.toString()}`,{signal:l.signal}).then(({visits:g,total:E})=>{l.signal.aborted||($(g),y(E),re(""))}).catch(g=>{l.signal.aborted||re(X(g,"Venue visits could not be read."))}),()=>l.abort()},[Y,te,V,O,J,i?.isFounded]);let Yu=(0,m.useCallback)(async l=>{try{let u=await j(`/rooms/archive/${encodeURIComponent(l)}`);w(u.visit),re("")}catch(u){re(X(u,"That visit could not be read."))}},[]),Ix=(0,m.useCallback)(async l=>{se(!0);try{let u=await j(`/rooms/${encodeURIComponent(l)}/operation`);await j(`/rooms/archive/${encodeURIComponent(l)}/retry-memory`,{method:"POST",body:JSON.stringify({retryOfAttemptId:u.operation?.attemptId})}),await Yu(l),N(g=>g+1),re("")}catch(u){re(X(u,"Memory filing is still pending."))}finally{se(!1)}},[Yu]),df=(0,m.useCallback)(async l=>{if(window.confirm(l?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){se(!0);try{await j(l?`/rooms/archive/${encodeURIComponent(l)}`:"/rooms/archive",{method:"DELETE"}),w(null),z(0),N(u=>u+1),re("")}catch(u){re(X(u,"Visit transcripts could not be deleted."))}finally{se(!1)}}},[]);(0,m.useEffect)(()=>{if(!Dt)return;let l=new AbortController;return Vn(l.signal),()=>l.abort()},[Dt,Vn]);let uf=i?i.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(uf===null)return;let l=new AbortController;return(async()=>{try{let u=await j("/town-map",{signal:l.signal});Du(u.image)}catch{l.signal.aborted||Du("")}})(),()=>l.abort()},[uf]);let Dx=(0,m.useCallback)(async l=>{se(!0);try{r(await j("/villagers",{method:"POST",body:JSON.stringify({characterId:l})})),bt(""),await Vn()}catch(u){bt(X(u,"That character could not move in."))}finally{se(!1)}},[Vn]),_x=(0,m.useCallback)(async l=>{se(!0);try{r(await j(`/villagers/${encodeURIComponent(l)}`,{method:"DELETE"})),bt(""),c&&await Vn()}catch(u){bt(X(u,"That villager could not leave."))}finally{se(!1)}},[c,Vn]),Hx=(0,m.useCallback)(async l=>{Ht(l);try{let u=await j(`/villagers/${encodeURIComponent(l)}/refresh`);Ta(g=>({...g,[l]:u})),bt("")}catch(u){bt(X(u,"That villager's card could not be compared."))}finally{Ht("")}},[]),Ux=(0,m.useCallback)(async l=>{Ht(l);try{r(await j(`/villagers/${encodeURIComponent(l)}/refresh`,{method:"POST"})),Ta(u=>{let g={...u};return delete g[l],g}),bt("")}catch(u){bt(X(u,"That villager's card could not be refreshed."))}finally{Ht("")}},[]),Ut=(0,m.useCallback)(l=>{l==="projects"&&Oe(""),ve(""),qe(!1),l==="villagers"&&Vn(),l==="village"&&ho(),l==="village"&&mo(),l==="memories"&&(p(null),Ls()),(l==="agendas"||l==="schedules")&&pc(),l==="progress"&&j("/progress/debug").then(Tt).catch(g=>{Tt(null),bt(X(g,"Progress diagnostics are unavailable."))}),l==="village"&&(R!=="menu"||J!=="village")&&i&&(S(i.settings.promptKnowledge),D(i.settings.playerPersonaId),lt(i.settings.setting),_a(i.settings.selectedLorebookIds),dn(i.settings.loreTokenBudget),Wl(i.settings.sceneryArtStyle??""),ec(i.settings.personalizeVenueImagesByDefault!==!1),tc(i.settings.useVisualLoreByDefault!==!1),Zr(vs(i.settings.venues).map(g=>({...g})))),rt(l),q("menu")},[pc,Vn,mo,Ls,ho,J,R,i]),gc=(0,m.useCallback)(()=>{Zt(!1),ve(""),Me(null),qe(!1),q("home")},[]),Ti=(0,m.useCallback)(l=>{!l.memoryPending||uc.current.has(l.id)||(uc.current.add(l.id),rf(l.id),j(`/rooms/archive/${encodeURIComponent(l.id)}/retry-memory`,{method:"POST"}).then(u=>{ii.current||(Be(g=>g?.id===l.id?u.session:g),zn(u.recordEvents??[]))}).catch(u=>{ii.current||$t(X(u,"Memory review is still pending. You can leave and retry from Memories."))}).finally(()=>{uc.current.delete(l.id),rf(u=>u===l.id?"":u)}))},[zn]);(0,m.useEffect)(()=>{if(!Hs)return;let l=window.setInterval(()=>{j(`/rooms/archive/${encodeURIComponent(Hs)}`).then(({visit:u})=>{ii.current||!uc.current.has(Hs)||Be(g=>g?.id===u.id&&g.memoryPending?{...g,memoryPending:u.memoryPending,memoryReview:u.memoryReview}:g)}).catch(()=>{})},2e3);return()=>window.clearInterval(l)},[Hs]);let Lx=(0,m.useCallback)(async()=>{if(!(!_||da)&&!(_.memoryPending&&(_.status==="closed"||uo))){if(!_.id||_.status==="closed"||uo){ua.current=null,Fa(!1),Be(null),pn([]),gn.current.clear(),Ja(""),mr(""),q("home"),Ke();return}St(!0),$t(""),H(!1),Be({..._,status:"closing"}),ua.current={roomId:_.id,submissionId:""};try{let l=await j("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:_.id,expectedSceneRevision:_.sceneRevision??0})});if(ii.current)return;Be(l.session),oi(!0),zn(l.recordEvents??[]),Ti(l.session),Ja(""),mr(""),Ke()}catch(l){if(ii.current)return;ua.current=null;let u=fs(l);if(u){Be(null),Fa(!1),pn([]),gn.current.clear(),lo(u==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),q("home"),Ke();return}let g=await bs(_.id);g&&(Be(g),oi(g.status==="closed")),$t(X(l,"You could not leave the venue.")),H(!0)}finally{St(!1)}}},[Ke,zn,_,da,uo,Ti]),qx=(0,m.useCallback)(async()=>{if(!_?.id||_.status!=="active"||da||Us.current)return;let l=co.current??du();co.current=l,ua.current={roomId:_.id,submissionId:l},St(!0),$t(""),H(!1);try{let u=await j("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:_.id,submissionId:l,message:hr,expectedSceneRevision:_.sceneRevision??0}),signal:AbortSignal.timeout(3e5)});Be(u.session),oi(!0),zn(u.recordEvents??[]),Ti(u.session),co.current=null,Ja(""),Ke()}catch(u){let g=await bs(_.id,l);g&&Be(g);let E=g?.submissions?.some(L=>L.id===l)?g:await H1(_.id,l);if(E){Be(E),oi(E.status==="closed"),E.status==="closed"&&Ti(E),Ja(""),$t(""),H(!1),co.current=null,Ke();return}ua.current=null;let M=fs(u);if(M){Be(null),Fa(!1),pn([]),gn.current.clear(),lo(M==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),q("home"),Ke();return}$t(X(u,"The scene could not end yet.")),H(!0)}finally{St(!1)}},[Ke,zn,_,da,hr,Ti]),Bx=(0,m.useCallback)(async()=>{if(!(!_?.id||ii.current)){ii.current=!0,St(!0);try{await j("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:_.id})}),ua.current=null,Fa(!1),Be(null),pn([]),gn.current.clear(),q("home"),H(!1),Ke()}catch(l){$t(X(l,"The visit could not be left yet.")),ii.current=!1}finally{St(!1)}}},[Ke,_]),jx=(0,m.useCallback)(async()=>{if(!(!_?.id||!_s||da)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){St(!0);try{await j("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:_.id})}),Be(null),Fa(!1),pn([]),gn.current.clear(),Ja(""),q("home"),Ke()}catch(l){$t(X(l,"The debug discard failed."))}finally{St(!1)}}},[_,_s,da,Ke]),Yx=(0,m.useCallback)(async()=>{let l=hr.trim();if(_===null||!_.id||uo||da||Us.current||l.length===0)return;Us.current=!0;let u=ri.current??du();ri.current=u;let g=_;try{await j("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:_.id})})}catch(M){Us.current=!1;let L=fs(M);L?(Be(null),Fa(!1),pn([]),gn.current.clear(),lo(L==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),q("home"),Ke()):$t(X(M,"The visit could not be checked."));return}let E={speakerId:"",name:"",role:"user",content:l,at:new Date().toISOString()};St(!0),$t(""),Ja(""),Be({..._,lines:[..._.lines,E]}),ua.current={roomId:_.id,submissionId:u};try{let M=await j("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:_.id,message:l,mode:Is,targetId:Is==="fulfill"?Ds:"",submissionId:u,expectedSceneRevision:_.sceneRevision??0}),signal:AbortSignal.timeout(3e5)});Be(M.session),oi(M.session.status==="closed"),M.session.status!=="closed"&&(ua.current=null),zn(M.recordEvents??[]),M.session.status==="closed"&&Ti(M.session),Ds&&!M.session.activeIds.includes(Ds)&&dc(""),tf(M.verdict?.reason??""),cc("chat"),ri.current=null,mr(""),Ke()}catch(M){let L=await bs(_.id,u);L&&Be(L);let ee=L?.submissions?.some(pr=>pr.id===u)?L:await H1(_.id,u);if(ee){Be(ee),oi(ee.status==="closed"),ee.status==="closed"&&Ti(ee),$t(""),Ja(""),ri.current=null,mr(""),Ke();return}ua.current=null;let ke=fs(M);if(ke){Be(null),Fa(!1),pn([]),gn.current.clear(),lo(ke==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),q("home"),Ke();return}let ya=await bs(_.id,u);ya?Be(ya):M instanceof Xl||Be(g),M instanceof Xl&&(M.code==="SCENE_BUSY"||M.code==="SCENE_STALE")&&(ri.current=null),Ja(l),$t(X(M,"That line could not be sent."))}finally{Us.current=!1,St(!1)}},[Ke,zn,_,da,hr,uo,Is,Ds,Ti]),Gx=(0,m.useCallback)(l=>(i?.villagers??[]).filter(u=>u.place?.id===l),[i]),Gu=(0,m.useCallback)(l=>{Me(null),qe(!1),Qt(l.id),_t("view"),nt("exterior"),pe(null),it(null),q("venue")},[]),Pu=(0,m.useCallback)(async l=>{St(!0),$t(""),mr("");try{let u=await j("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(3e4)});Be(u.session),Ke()}catch(u){let g=await _1(l);g?Be(g):$t(U1(u))}finally{St(!1)}},[Ke]),Px=(0,m.useCallback)(async()=>{if(!(!_?.id||!_.operation||da)){St(!0);try{let{operation:l}=await j(`/rooms/${encodeURIComponent(_.id)}/operations/${encodeURIComponent(_.operation.id)}`),u=l.kind==="move"?"/rooms/zone":l.kind==="memory"?`/rooms/archive/${encodeURIComponent(_.id)}/retry-memory`:l.kind==="greet"?"/rooms/greet":l.kind==="turn"?l.input?.mode==="leave"?"/rooms/leave":"/rooms/turn":"/rooms/end",g=await j(u,{method:"POST",body:JSON.stringify({...l.input,sessionId:_.id,submissionId:l.id,operationId:l.id,expectedSceneRevision:_.sceneRevision??0,retryOfAttemptId:l.attemptId}),signal:AbortSignal.timeout(3e5)});Be(g.session),oi(g.session.status==="closed"),zn(g.recordEvents??[]),hr.trim()===l.input?.message&&Ja(""),ri.current=null,co.current=null,ua.current=null,$t(""),Ke()}catch(l){let u=await bs(_.id);u&&Be(u),$t(X(l,"The saved request could not be recovered."))}finally{St(!1)}}},[_,da,hr,zn,Ke]),Xx=(0,m.useCallback)(async l=>{St(!0);try{let{session:u}=await j("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(1e4)});Be(u),mr(u.lines.length===0?"The opening failed. You can start the conversation now.":""),$t("")}catch(u){$t(X(u,"The visit could not continue. Retry or leave the venue."))}finally{St(!1)}},[]),fc=(0,m.useCallback)(async(l,u,g="",E,M)=>{if(_?.id&&_.status==="active"&&_.placeId===l.id&&M){St(!0),$t("");try{let{session:L}=await j("/rooms/zone",{method:"POST",body:JSON.stringify({sessionId:_.id,zoneId:M,expectedSceneRevision:_.sceneRevision??0})});Be(L),dc(""),q("room"),Fa(!0),Ke()}catch(L){$t(X(L,"That zone could not be entered."))}finally{St(!1)}return}ii.current=!1,ua.current=null,Me(null),qe(!1),ni(null),Ja(""),oi(!1),$t(""),mr(""),pn([]),gn.current.clear(),St(!0),Be({version:1,id:"",placeId:l.id,placeName:l.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Fa(!0),q("room");try{let{session:L}=await j("/rooms",{method:"POST",body:JSON.stringify({venueId:l.id,spaceClass:u,privateOwnerId:g,entryArea:E,zoneId:M,expectedSceneRevision:_?.sceneRevision}),signal:AbortSignal.timeout(2e4)});Be(L),cc("chat"),dc(""),tf(""),lo(""),Fa(!0),Ke(),L.status==="opening"&&await Pu(L.id)}catch(L){$t(X(L,"That room could not be opened. Retry or leave the venue."))}finally{St(!1)}},[Pu,Ke,_]),hf=(0,m.useCallback)(l=>{qe(!1),Me(l.id),q("home")},[]),mf=(0,m.useCallback)(()=>{Qt(null),_t("view"),nt("exterior"),pe(null),it(null),Me(null),q("home")},[]),Zx=(0,m.useCallback)(async()=>{se(!0),ve("");try{r(await j("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:Fe,playerPersonaId:x,setting:oe,selectedLorebookIds:ta,loreTokenBudget:Nn})}))}catch(l){ve(X(l,"Those settings could not be saved."))}finally{se(!1)}},[Fe,ta,Nn,x,oe]),Qx=(0,m.useCallback)(async l=>{se(!0),ve("");try{r(await j("/settings",{method:"PATCH",body:JSON.stringify({storyPace:l})}))}catch(u){ve(X(u,"That could not be saved."))}finally{se(!1)}},[]),Fx=(0,m.useCallback)(async l=>{let u=i?.settings.characterSpeechColors??!0;r(g=>g&&{...g,settings:{...g.settings,characterSpeechColors:l}}),se(!0),ve("");try{r(await j("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:l})}))}catch(g){r(E=>E&&{...E,settings:{...E.settings,characterSpeechColors:u}}),ve(X(g,"Character speech colors could not be saved."))}finally{se(!1)}},[i?.settings.characterSpeechColors]),pf=(0,m.useCallback)(async l=>{se(!0),ve("");try{r(await j("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:l})})),N(u=>u+1)}catch(u){ve(X(u,"Visit retention could not be saved."))}finally{se(!1)}},[]),Jx=(0,m.useCallback)(async()=>{if(!(i&&vs(i.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){se(!0),ve("");try{let l=await j("/bootstrap",{method:"POST"});Zr(l.places.map(u=>({id:pu(),name:u.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(l){ve(X(l,"The village did not suggest any places."))}finally{se(!1)}}},[i]),Kx=(0,m.useCallback)(async()=>{if(fa.trim().length===0){Ee("Describe what the village is like before generating its map.");return}zs(!0),Ee("");try{let l=await j("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:to===i?.settings.townMapLayoutPrompt?void 0:to,negative:ao===i?.settings.townMapNegativePrompt?void 0:ao,setting:fa,options:nc,selectedLorebookIds:ca,sceneryArtStyle:Tn,useVisualLore:eo,scenarioImprint:i?.isFounded?{origin:"",worldFacts:Wn,openingConditions:[],visualCues:[]}:null})}),u=await fu(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");Tu(l.image),Eu("generate"),Pg(Vu),Au(u),cr("generate")}catch(l){Ee(X(l,"The village map could not be generated."))}finally{zs(!1)}},[ca,ao,to,fa,nc,Vu,Tn,eo,Wn,i?.isFounded,i?.settings.townMapLayoutPrompt,i?.settings.townMapNegativePrompt]),Wx=(0,m.useCallback)(async l=>{if(!l||!i)return;Ee("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let g=E=>Math.round(E/1e5)/10;Ee(`That picture is ${g(l.size)} MB and a village map holds ${g(u)} MB. Choose a smaller copy.`);return}zs(!0);try{let g=await ws(l),E=await fu(g);Tu(g),Eu("upload"),Au(E),cr("upload")}catch(g){Ee(X(g,"That picture could not be used as the village map."))}finally{zs(!1)}},[i]),e$=(0,m.useCallback)(()=>{if(!i)return;let l=Object.fromEntries(i.settings.venues.map(u=>[u.id,{x:u.presentation.x,y:u.presentation.y}]));ux(l),zg(l),dx(i.settings.townMapImageSetAt),Ql(i.settings.venues[0]?.id??null),$u(!0),Kr(!1),io(null),ai(null),sc(!1),ve("")},[i]),t$=(0,m.useCallback)(async()=>{if(i){Ag(!0),ve("");try{let l=await j("/setup/town-map/generate",{method:"POST",body:JSON.stringify({setting:i.settings.setting,selectedLorebookIds:i.settings.selectedLorebookIds,scenarioImprint:{origin:"",worldFacts:i.settings.worldFacts,openingConditions:[],visualCues:[]}})}),u=await fu(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");io({image:l.image,size:u}),Kr(!1),ai(Gl("cover"))}catch(l){ve(X(l,"The village map could not be generated."))}finally{Ag(!1)}}},[i]),a$=(0,m.useCallback)(async l=>{if(!l||!i)return;ve("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let g=E=>Math.round(E/1e5)/10;ve(`That picture is ${g(l.size)} MB and the village map holds ${g(u)} MB. Try a smaller copy.`);return}se(!0);try{let g=await ws(l),E=await fu(g);io({image:g,size:E}),Kr(!1),ai(Gl("cover"))}catch(g){ve(X(g,"That picture could not be used as the village map."))}finally{se(!1)}},[i]),gf=(0,m.useCallback)(async()=>{if(!i)return;let l=Ss?"":Rn?.image??no;se(!0),ve("");try{let u=Object.fromEntries(i.settings.venues.map(E=>[E.id,gu(E)])),g=await j("/town-map",{method:"PUT",body:JSON.stringify({image:l,view:_u??i.settings.townMapView,expectedMapSetAt:hn?Rg:i.settings.townMapImageSetAt,placements:Object.entries(hn?Mg:u).map(([E,M])=>({venueId:E,fromX:M.x,fromY:M.y,x:hn?ks[E]?.x??null:M.x,y:hn?ks[E]?.y??null:M.y}))})});r(g),Du(l),io(null),ai(null),sc(!1),$u(!1),Kr(!1),Ns(null)}catch(u){ve(X(u,"The village map could not be saved."))}finally{se(!1)}},[i,_u,no,Rn,Ss,hn,Rg,Mg,ks]),ff=(0,m.useCallback)(()=>{io(null),ai(null),sc(!1),$u(!1),Kr(!1),Ns(null),ve("")},[]),n$=(0,m.useCallback)(async(l,u,g="",E)=>{if(!Mn){ro(l),ni(null),ve("");try{r(await j("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:g,zoneId:E})}))}catch(M){ni({id:l,text:X(M,"That place could not be drawn.")})}finally{ro("")}}},[Mn]),i$=(0,m.useCallback)(async(l,u,g,E="",M)=>{if(!(!u||!i||Mn)){ro(l),ni(null),ve("");try{let L=ke=>Math.round(ke/1e5)/10;if(u.size>i.settings.maxVenueImageBytes){ni({id:l,text:`That picture is ${L(u.size)} MB and a place holds ${L(i.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let ee=await ws(u);r(await j("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:l,image:ee,spaceClass:g,privateOwnerId:E,zoneId:M})}))}catch(L){ni({id:l,text:X(L,"That picture could not be kept.")})}finally{ro("")}}},[Mn,i]),r$=(0,m.useCallback)(async(l,u,g="",E)=>{if(!Mn){ro(l),ni(null),ve("");try{r(await j("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:g,zoneId:E})}))}catch(M){ni({id:l,text:X(M,"That picture could not be taken away.")})}finally{ro("")}}},[Mn]),o$=(i?.settings.venues.length??0)+Zl.filter(l=>!i?.settings.venues.some(u=>u.id===l.id)).length,bf=(0,m.useCallback)((l,u,g)=>{let E=Ve.find(L=>L.category==="public-center"),M=Ts??(Qr?E?.id:void 0);if(S1({x:l,y:u},Ve.filter(L=>L.id!==M).map(L=>L.presentation),g??{width:1e3,height:700,photoWidth:58,photoHeight:58})){Cu("That photograph would cover another venue. Place it a little to the side.");return}if(Cu(""),M)ki(L=>L.map(ee=>ee.id===M?{...ee,presentation:{...ee.presentation,x:l,y:u}}:ee)),mn(M),ei(!0);else if(Qr){let L={...O1(pu(),"gathering",l,u),imageContext:{useAssignedVillagerContext:En,useVisualLore:An}};ki(ee=>[...ee,L]),mn(L.id),Kl(L.id),ei(!0),ti.current=null}else if($s){let L=Ve.filter(ke=>ke.classes?.includes("residence"));if(L.length>=1+Cn)return;let ee={...O1(pu(),"residence",l,u,!L.some(ke=>ke.occupancy.playerHome),L.length+1),imageContext:{useAssignedVillagerContext:En,useVisualLore:An}};ki(ke=>[...ke,ee]),mn(ee.id),Kl(ee.id),ei(!0),ti.current=null}Es(null),Si(!1),Fr(!1)},[Ts,$s,Qr,Cn,Ve,En,An]),vf=(0,m.useCallback)((l,u)=>{ki(g=>g.map(E=>E.id===l?u(E):E))},[]),s$=(0,m.useCallback)(l=>{ki(u=>u.filter(E=>E.id!==l)),mn(u=>u===l?null:u)},[]),l$=l=>{if(i?.isFounded||l===Kn)return;let u=Pr(Kn).premise,g=!!Qa.trim()&&Qa!==u;Dg(l),g||Nu(Pr(l).premise),_g(""),Ee("")},qs=(0,m.useCallback)((l,u)=>{ve(""),Ee(""),Fg(!1),Vs(!1),oc(!1),Zt(!1),Qe(""),Jl(0),Og(l?"":u?.village.name??""),Ig(l?"":u?.village.setting??"");let g=l?"":u?.settings.foundingReason??"",E=yg.some(wa=>wa.value===g),M=E?g:g?"custom":"rebuild",L=Tk[g]??g,ee=u?.settings.foundingDetails??"",ke=[L,ee].filter(Boolean).join(" "),ya=ke.length>(u?.settings.foundingDetailsMaxLength??500),pr=u?.isFounded?ee:g&&!E?ya?ee:ke:l||!g?Pr(M).premise:ee,Ei=l?"":u?.isFounded?u.settings.foundingGuidance??"":[ya?L:"",u?.settings.foundingGuidance??""].filter(Boolean).join(" ");Dg(M),Nu(pr),_g(M==="none"?"":Ei),mx(l?dg():u?.settings.scenarioImprint??dg()),Hg(l?[]:u?.settings.worldFacts??[]);let Rt=l||!u?[]:u.settings.venues.filter(wa=>wa.classes?.includes("residence")||wa.category==="public-center");ki(Rt),Ug(Math.max(1,Rt.filter(wa=>wa.classes?.includes("residence")&&!wa.occupancy.playerHome).length)),ku(Rt.filter(wa=>wa.form?.trim()&&wa.description.trim()&&wa.spaces?.[0]?.description.trim()).map(wa=>wa.id)),ei(!1),Kl(""),Wl(l||!u?.isFounded?br["Painted illustration"]:u.settings.sceneryArtStyle??""),ec(u?.settings.personalizeVenueImagesByDefault!==!1),tc(u?.settings.useVisualLoreByDefault!==!1),Bg(u?.settings.useVisualLoreByDefault!==!1),mn(Rt[0]?.id??null),Es(null),Cu(""),Sn(l?[]:u?.settings.selectedLorebookIds??[]),kg(l?1600:u?.settings.loreTokenBudget??1600),Gg({...R1}),cr(l?"generate":u?.settings.townMapImageSetAt?"existing":"none"),Tu(""),Eu(null),Pg(""),Au(null),Ru(u?.settings.townMapLayoutPrompt??""),Mu(u?.settings.townMapNegativePrompt??""),zs(!1),D(l?"":u?.settings.playerPersonaId??""),ho(),mo(),q("setup")},[mo,ho]),yf=(0,m.useCallback)(l=>{if(Je===0&&l>0){if(kn.trim().length===0){Ee("Give the village a name before continuing.");return}if(fa.trim().length===0){Ee("Describe what the village is like before continuing.");return}if(!i?.isFounded&&!Qa.trim()){Ee("Describe the village's first day before continuing.");return}}if(Je===1&&l>1){if(!x.trim()){Ee("Choose the Persona who lives in this village.");return}if(!P?.some(u=>u.id===x)){Ee("That Persona is no longer in your library. Choose another one to continue.");return}if(Ou.length>0){Ee(Ou);return}if(Qg){Vs(!0);return}}if(Je===2&&l>2&&ht!=="none"&&!dr){Ee(ht==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(Je===3&&l>3){if(!i?.isFounded&&Ve.some(ee=>!lr.includes(ee.id))){Ee("Finish each venue with Done before review.");return}if(!i?.isFounded&&Ve.filter(ee=>ee.classes?.includes("residence")).length<1+Cn){Ee("Place the selected number of homes before review.");return}let u=Ve.filter(ee=>ee.classes?.includes("residence")),g=u.filter(ee=>!ee.occupancy.playerHome),E=g.length;if(!u.some(ee=>ee.occupancy.playerHome)||E<M1||E>z1||!Ve.some(ee=>ee.category==="public-center")){Ee("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let M=g.map(ee=>ee.occupancy.residentCharacterId).filter(Boolean);if(M.length!==g.length||new Set(M).size!==M.length){Ee("Assign a different villager to each villager Residence before review.");return}let L=Ve.map(ee=>({venue:ee,field:ee.name.trim()?ee.form?.trim()?ee.description.trim()?ee.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:ee})=>ee);if(L){mn(L.venue.id),Ee(`Complete ${L.field.replaceAll("-"," ")} for ${L.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${L.field}`)?.focus(),0);return}}Vs(!1),Ee(""),Jl(l),l===1&&ho(),l===0&&mo(),l===3&&(Vn(),ei(!1)),Si(l===3&&!i?.isFounded&&Ve.filter(u=>u.classes?.includes("residence")).length<1+Cn),Fr(l===3&&!i?.isFounded&&Ve.filter(u=>u.classes?.includes("residence")).length>=1+Cn&&!Ve.some(u=>u.category==="public-center")),Es(null)},[Cn,lr,Ou,Ve,Qg,Vn,ho,mo,x,P,ht,dr,kn,Qa,i?.isFounded,fa,Je,e]),c$=(0,m.useCallback)(()=>{Vs(!1),Ee(""),Jl(2),Si(!1),Fr(!1)},[]),d$=(0,m.useCallback)(()=>{Vs(!1),Ee("")},[]),Vt=Ve.find(l=>l.id===jg)??null,u$=l=>({id:l.id,name:l.name,form:l.form??"",description:l.description,spaceDescription:l.spaces?.[0]?.description??"",venueClass:l.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:l.occupancy.residentCharacterId??""}),h$=async(l,u)=>{if(As)return;let g=u==="private"?l.privateSpaces?.find(L=>L.ownerId==="player")?.description??"":u==="exterior"?l.description:l.spaces?.[0]?.description??"";if(!g.trim()){mn(l.id),Ee(`Add an ${u} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${u}-description`)?.focus(),0);return}let E=Ms,M=JSON.stringify(l);ac(!0),Ee("");try{let L=await j("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:u$(l),area:u,privateOwnerId:u==="private"?"player":void 0,privateDescription:g,playerPersonaId:x,sceneryArtStyle:Tn,useAssignedVillagerContext:l.imageContext?.useAssignedVillagerContext??En,useVisualLore:l.imageContext?.useVisualLore??An,villageName:kn,setting:fa,foundingDetails:Qa,scenarioImprint:i?.isFounded?hx:null,worldFacts:i?.isFounded?Wn:[],selectedLorebookIds:ca})});if(zu.current!==E||JSON.stringify(Xg.current.find(ee=>ee.id===l.id))!==M){Ee("The venue changed while its image was generated. Generate again.");return}ki(ee=>ee.map(ke=>ke.id===l.id&&JSON.stringify(ke)===M?wf(ke,u,L):ke))}catch(L){Ee(X(L,"Venue art could not be generated."))}finally{ac(!1)}},m$=async(l,u,g)=>{if(!(!g||As)){if(g.size>(i?.settings.maxVenueImageBytes??8e6)){Ee("That venue image is too large. Choose a smaller file.");return}ac(!0),Ee("");try{let E=await j("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:l.name,image:await ws(g)})});vf(l.id,M=>wf(M,u,E))}catch(E){Ee(X(E,"That venue image could not be uploaded."))}finally{ac(!1)}}},wf=(l,u,g)=>u==="exterior"?{...l,presentation:{...l.presentation,image:g}}:u==="private"?{...l,privateSpaces:(l.privateSpaces??[Nc()]).map(E=>E.ownerId==="player"?{...E,image:g}:E)}:{...l,spaces:l.spaces?.map((E,M)=>M===0?{...E,image:g}:E)},Xu=(l,u=lr)=>{let g=l.find(M=>!u.includes(M.id));ei(!1),mn(null),Kl(g?.id??""),Es(g?.id??null);let E=l.filter(M=>M.classes?.includes("residence")).length;Si(!g&&(E<1+Cn||!l.some(M=>M.occupancy.playerHome))),Fr(!g&&E>=1+Cn&&!l.some(M=>M.category==="public-center")),window.setTimeout(()=>{let M=e.querySelector("."+n+"-setup-map-viewport");M?.scrollIntoView({block:"nearest"}),M?.focus()},0)},p$=()=>{if(Vt){if(Vt.classes?.includes("residence")&&!Vt.occupancy.playerHome&&!Vt.occupancy.residentCharacterId){Ee("Choose a villager.");return}if(!Vt.name.trim()||!Vt.form?.trim()||!Vt.description.trim()||!Vt.spaces?.[0]?.description.trim()){Ee("Complete this venue\u2019s name, form, exterior, and interior.");return}if(Vt.privateSpaces?.some(l=>l.ownerId!=="player"&&(!l.name?.trim()||!l.purpose?.trim()||!l.controllerIds?.length))){Ee("Give each private room a name, purpose, and controller.");return}ku(l=>[...new Set([...l,Vt.id])]),Ee(""),Xu(Ve,[...lr,Vt.id])}},g$=()=>{let l=qg===jg?Ve.filter(u=>u.id!==qg):Ve.map(u=>u.id===ti.current?.id?ti.current:u);ki(l),Ee(""),Xu(l)},xf=(0,m.useCallback)(()=>{if(kn.trim().length===0)return"Give the village a name.";if(x.trim().length===0)return"Choose the Persona who lives in this village.";if(!i?.isFounded&&!Qa.trim())return"Describe the village's first day.";let l=Wn.map(M=>M.trim()).filter(Boolean);if(i?.isFounded&&(l.length>4||l.some(M=>M.length>160)))return"Use at most four current world facts of 160 characters each.";if(fa.trim().length===0)return"Describe what the village is like.";if(ht!=="none"&&!dr)return"Choose, generate, or upload the village map.";if(!i?.isFounded&&Ve.some(M=>!lr.includes(M.id)))return"Finish each venue with Done in Step 4.";let u=Ve.filter(M=>M.classes?.includes("residence")),g=u.filter(M=>!M.occupancy.playerHome);if(g.length<M1||g.length>z1)return"Place one to three homes for initial villagers.";if(!u.some(M=>M.occupancy.playerHome))return"One Residence has to be yours.";if(Ve.some(M=>!M.name.trim()||!M.form?.trim()||!M.description.trim()||!M.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let E=g.map(M=>M.occupancy.residentCharacterId).filter(M=>M!==null);return E.length!==g.length?"Choose who lives in each villager home.":new Set(E).size!==E.length?"A villager can only live in one house.":Ve.filter(M=>M.category==="public-center").length!==1?"Place one Gathering Place.":""},[Ve,lr,x,ht,dr,kn,Qa,i?.isFounded,Wn,fa]),f$=(0,m.useCallback)(async()=>{let l=xf();if(l){let u=Ve.find(g=>!g.name.trim()||!g.form?.trim()||!g.description.trim()||!g.spaces?.[0]?.description.trim());if(u){let g=u.name.trim()?u.form?.trim()?u.description.trim()?"interior-description":"exterior-description":"form":"venue-name";mn(u.id),Jl(3),window.setTimeout(()=>e.querySelector(`#${n}-setup-${g}`)?.focus(),0)}Ee(l);return}se(!0),Ee("");try{let u=await j("/setup",{method:"POST",body:JSON.stringify({name:kn.trim(),setting:fa.trim(),foundingReason:i?.isFounded?i.settings.foundingReason:Kn,foundingDetails:i?.isFounded?i.settings.foundingDetails:Qa.trim(),foundingGuidance:i?.isFounded?i.settings.foundingGuidance:Cs.trim(),scenarioImprint:i?.isFounded?i.settings.scenarioImprint:null,worldFacts:i?.isFounded?Wn.map(g=>g.trim()).filter(Boolean):[],selectedLorebookIds:ca,personalizeVenueImagesByDefault:En,useVisualLoreByDefault:An,sceneryArtStyle:Tn,useVisualLore:eo,loreTokenBudget:un,playerPersonaId:x,townMapImage:dr??"",townMapView:ht==="existing"?oo:Gl("cover"),venues:Ve})});r(u),Si(!1),q(!i?.isFounded||u.foundingPreparation?.status==="pending"||u.foundingPreparation?.status==="failed"?"preparing":"home")}catch(u){Ee(X(u,"The village could not be founded."))}finally{se(!1)}},[e,Ve,i?.isFounded,i?.settings.foundingReason,i?.settings.foundingDetails,i?.settings.foundingGuidance,i?.settings.scenarioImprint,x,oo,xf,Tn,eo,En,An,ht,dr,kn,Kn,Qa,Cs,Wn,ca,un,fa]),b$=(0,m.useCallback)(async()=>{se(!0),ve("");try{let l=await j("/setup/reset",{method:"POST"});r(l),d(null),qs(!0,l)}catch(l){ve(X(l,"The village could not be reset."))}finally{se(!1),oc(!1)}},[qs]),$f=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!i||$f.current||($f.current=!0,i.isFounded?i.foundingPreparation&&i.foundingPreparation.status!=="ready"&&q("preparing"):qs(!1,i))},[qs,i]),(0,m.useEffect)(()=>{if(R!=="preparing")return;let l=!1,u=async()=>{try{let E=await j("/setup/preparation");if(l)return;r(E),rc(""),(!E.foundingPreparation||E.foundingPreparation.status==="ready")&&q("home")}catch(E){l||rc(X(E,"Preparation status could not be read."))}};u();let g=window.setInterval(()=>{u()},2500);return()=>{l=!0,window.clearInterval(g)}},[R]);let v$=(0,m.useCallback)(async()=>{rc("");try{r(await j("/setup/preparation/retry",{method:"POST"}))}catch(l){rc(X(l,"Preparation could not be retried."))}},[]),y$=(0,m.useCallback)(()=>{pe({id:pu(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),w$=(0,m.useCallback)(async l=>{se(!0),ve("");try{let u=i?.settings.venues.some(L=>L.id===l.id)??!1,g=Jn(l).map(L=>cn(l,L)),E=await j(u?`/locations/venue/${encodeURIComponent(l.id)}`:"/projects",{method:u?"PUT":"POST",body:JSON.stringify(u?{name:l.name,description:g[0]?.description??l.description}:{name:l.name,classes:l.classes,description:g[0]?.description??l.description})}),M=vs(E.settings.venues).find(L=>u?L.id===l.id:L.name.toLowerCase()===l.name.trim().toLowerCase());r(E),pe(null),u||Ut("projects"),Zr(L=>{let ee=L.map(ke=>ke.id===l.id&&M?M:ke);return[...ee,...vs(E.settings.venues).filter(ke=>!ee.some(ya=>ya.id===ke.id))]})}catch(u){ve(X(u,"That place could not be saved."))}finally{se(!1)}},[i,Ut]),x$=(0,m.useCallback)(async l=>{let u=i?.settings.venues.find(g=>g.id===l);if(!u){Zr(g=>g.filter(E=>E.id!==l));return}se(!0),ve("");try{let g=await j(`/locations/venue/${encodeURIComponent(l)}/dependencies`);if(g.roomPresent||g.playerHome||g.residentCharacterIds.length||g.pendingMailCount){ve(g.roomPresent?"End the active visit before deleting this Venue.":g.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let E=g.residentCharacterIds.length+g.pendingResidenceCharacterIds.length,M=E||g.workerCharacterIds.length||g.remapCount||g.eventCount?`This place is referenced by ${E} pending moves, ${g.workerCharacterIds.length} workers, ${g.remapCount} schedule moves, and ${g.eventCount} events. Delete it?`:`Delete ${u.name}?`;if(!window.confirm(M))return;let L=await j(`/locations/venue/${encodeURIComponent(l)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});r(L),Zr(ee=>ee.filter(ke=>ke.id!==l))}catch(g){ve(X(g,"That place could not be removed."))}finally{se(!1)}},[i]),Nf=(0,m.useCallback)(async(l,u)=>{se(!0),ve("");try{let g=he[l.id]??l.venueDraft,E=await j(`/venue-requests/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST",body:u?JSON.stringify(g):void 0});if(r(E),u){let M=new Set(Zl.map(L=>L.id));Zr(L=>[...L,...vs(E.settings.venues).filter(ee=>!M.has(ee.id))])}Ye(M=>{let L={...M};return delete L[l.id],L})}catch(g){ve(X(g,u?"That venue could not be approved.":"That request could not be denied."))}finally{se(!1)}},[he,Zl]),$$=(0,m.useCallback)(l=>{let u=Bu.current,g=u?.selectionStart??Fe.length,E=u?.selectionEnd??g;ju.current=g+l.length,S(`${Fe.slice(0,g)}${l}${Fe.slice(E)}`)},[Fe]),Sf=(0,m.useCallback)(async()=>{let l=Fl.trim();if(l.length!==0){se(!0),ve("");try{r(await j("/noticeboard",{method:"POST",body:JSON.stringify({notice:l})})),Vg("")}catch(u){ve(X(u,"That notice could not be pinned up."))}finally{se(!1)}}},[Fl]),N$=(0,m.useCallback)(async l=>{se(!0),ve("");try{r(await j(`/noticeboard/${l}`,{method:"DELETE"}))}catch(u){ve(X(u,"That notice could not be taken down."))}finally{se(!1)}},[]),bc=le.trim().toLowerCase(),Zu=(c??[]).filter(l=>bc.length===0||l.name.toLowerCase().includes(bc)||l.comment.toLowerCase().includes(bc)||l.tags.some(u=>u.toLowerCase().includes(bc))),kf=[...(i?.villagers??[]).map(l=>l.characterId),...Dt?Zu.map(l=>l.id):[]].join(`
`),Cf=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let l=kf.split(`
`).filter(g=>g.length>0&&!Cf.current.has(g));if(l.length===0)return;for(let g of l)Cf.current.add(g);let u=new AbortController;return(async()=>{try{let g=await Uk(l,u.signal);u.signal.aborted||Se(E=>({...E,...g}))}catch{}})(),()=>u.abort()},[kf]);let Qu=i?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(K(null),Qu.length===0)return;let l=new AbortController;return(async()=>{try{let u=await Lk(Qu,l.signal);l.signal.aborted||K(u)}catch{}})(),()=>l.abort()},[Qu]);let fn=(0,m.useCallback)(l=>l?c?.find(u=>u.id===l)?.name??i?.villagers.find(u=>u.characterId===l)?.name??"":"",[c,i]),S$=(()=>{let l=i?.settings.venues??[],u=[],g=new Map;for(let E of i?.villagers??[]){let M=E.place?.id;if(!M)continue;let L=g.get(M);L?L.push(E):g.set(M,[E])}for(let E of l){let M=gu(E);if(!M)continue;let L=i?.projects.find(Ei=>Ei.venueId===E.id&&Ei.lifecycle?.phase!=="complete"),ee=()=>{L&&(Ut("projects"),Ne(L.id),Oe(L.id))},ke=E.occupancy.residentCharacterId,ya=yu(E),pr=E.occupancy.playerHome?Pl(i):fn(ke);u.push({id:E.id,x:M.x,y:M.y,text:ya?e2(pr):E.name,image:L?i2:E.presentation.image?.url??null,tone:ya?Y1({isPlayerHome:E.occupancy.playerHome,occupant:ke}):"venue",selected:Le===E.id,doors:Le===E.id?[...L?[{label:"View Project",onSelect:ee}]:[],...L?.kind==="new-venue"?[]:[{label:"View venue",onSelect:()=>Gu(E)},{label:"Visit",onSelect:()=>{fc(E)}}]]:void 0,onSelect:L?.kind==="new-venue"?ee:()=>hf(E)}),(g.get(E.id)??[]).forEach((Ei,Rt)=>{u.push({id:`villager:${Ei.characterId}`,x:M.x,y:M.y,dy:n2*(Rt+1),text:Ei.name,tone:"resident",kind:"person"})})}return u})(),k$=Ve.flatMap(l=>{let u=gu(l);return u?[{id:l.id,x:u.x,y:u.y,text:l.name||(l.category==="public-center"?"Gathering Place":"Residence"),image:l.presentation.image?.url??null,tone:l.category==="public-center"?"venue":l.occupancy.playerHome?"player":"resident",onSelect:()=>{ti.current=structuredClone(l),mn(l.id),ei(!0),Ee("")}}]:[]});if(R==="room")return(0,o.jsxs)("div",{className:`${n}-root ${n}-room-screen`,"data-mobile":t?"true":"false",children:[_?.operation?.status==="running"?(0,o.jsx)("div",{role:"status",children:"This conversation is responding. Your draft stays here."}):null,_?.operation?.status==="interrupted"?(0,o.jsxs)("div",{role:"alert",className:`${n}-room-error`,children:[(0,o.jsx)("p",{children:"The previous request may have been billed. Retry the saved request only when you are ready to authorize further work."}),(0,o.jsx)("button",{className:`${n}-button`,disabled:da,onClick:()=>{Px()},children:"Retry saved request"})]}):null,_?(0,o.jsx)(b2,{room:_,nameColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.nameColor])):{},speechColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.dialogueColor])):{},picture:Ok(i?.settings.venues??[],_),draft:hr,mode:Is,targetId:Ds,busy:da||_.operation?.status==="running",error:Ex,greetingNotice:Ax,ruling:kx,open:Sx,ended:uo,playerName:Pl(i),playerPortrait:T??void 0,portraits:Ca,sprites:Object.fromEntries((i?.villagers??[]).map(l=>[l.characterId,l.sprite])),onDraft:l=>{ri.current=null,co.current=null,Ja(l)},onMode:l=>{ri.current=null,cc(l)},onTarget:l=>{ri.current=null,dc(l)},onSend:()=>{Is==="conclude"?qx():Yx()},onViewVenue:()=>{Qt(_.placeId),pe(null),q("venue"),Ke()},onEnterPrivate:_.area==="shared"&&_.privateAccessOwnerId?()=>{St(!0),j("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:_.id,ownerId:_.privateAccessOwnerId,expectedSceneRevision:_.sceneRevision??0})}).then(({session:l})=>{Be(l),Ke()}).catch(l=>$t(X(l,"That private space could not be entered."))).finally(()=>St(!1))}:void 0,privateSpaceOwnerName:fn(_.privateAccessOwnerId),onEnd:()=>{Lx()},notices:Cx,onDismissNotice:l=>pn(u=>u.filter(g=>g.id!==l)),debugDiscardEnabled:_s,onDebugDiscard:()=>{jx()},onLeavePending:()=>{Bx()},endFailed:A,reviewing:Hs===_.id,onRetryGreeting:()=>{if(_.id)Pu(_.id);else{let l=i?.settings.venues.find(u=>u.id===_.placeId);l&&fc(l)}},onContinueWithoutGreeting:()=>{_.id&&Xx(_.id)},onUseMailbox:i?.settings.venues.some(l=>l.id===_.placeId&&l.occupancy.playerHome&&(!_.spaceClass||_.spaceClass==="residence"))?()=>Os(!0):void 0,onProjects:()=>Ut("projects")}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:gc,children:"Back to village"}),Nx&&i?(0,o.jsx)("div",{className:`${n}-mailbox-backdrop`,onClick:()=>Os(!1),children:(0,o.jsxs)("section",{className:`${n}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:l=>l.stopPropagation(),children:[(0,o.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Mailbox"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Os(!1),children:"Close"})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,o.jsxs)("div",{className:`${n}-mailbox-list`,children:[[...i.venueMail??[]].reverse().map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsx)("strong",{children:l.title}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("p",{className:`${n}-hint`,children:l.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(l.dueAt).toLocaleString()}`:l.status==="pending-player"?"Awaiting your decision":l.status==="approved"?"Approved":"Declined"}),l.decisions.map(u=>(0,o.jsxs)("p",{children:[(0,o.jsxs)("strong",{children:[fn(u.characterId),":"]})," ",u.reply]},u.characterId)),l.status==="pending-player"&&l.kind==="villager-change"?(0,o.jsx)(f2,{entry:l,onDecide:async(u,g)=>{r(await j(`/venue-mail/${encodeURIComponent(l.id)}/decision`,{method:"POST",body:JSON.stringify({approved:u,...g})}))}}):null,l.error?(0,o.jsxs)("p",{className:`${n}-hint`,children:["Reply delayed: ",l.error]}):null]},l.id)),(i.venueMail?.length??0)===0&&i.venueRequests.length===0&&i.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No Venue mail yet."}):null,i.venueRequests.map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName||"A villager"," suggests ",l.venueDraft.name]}),(0,o.jsx)("p",{children:l.venueDraft.classes.map(u=>u[0].toUpperCase()+u.slice(1)).join(" / ")}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Os(!1),Ut("venueRequests")},children:"Review request"})]},l.id)),i.upgradeRequests.map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName," suggests a home change"]}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Os(!1),Ut("venueRequests")},children:"Review request"})]},l.id))]})]})}):null]});if(R==="venue"){let l=(i?.settings.venues??[]).find(C=>C.id===ie)??null;if(!i||!l)return(0,o.jsx)("div",{className:`${n}-root`,children:(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:"A place that is gone"}),(0,o.jsx)("p",{className:`${n}-subtitle`,children:"This venue is no longer in the village."})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:mf,children:"Back to map"})]})});let u=Gx(l.id),g=Jn(l),E=l.occupancy.homeKind?t2(s,l.occupancy.homeKind).name:"",M=l.occupancy.playerHome?Pl(i):fn(l.occupancy.residentCharacterId),L=l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[]),ee=g.includes("residence")&&L.length>0,ke=_?.placeId===l.id&&(_.area==="shared"||_.area==="private"),ya=_?.placeId===l.id&&_.area==="private"?_.privateOwnerId:"",pr=l.occupancy.playerHome||l.playerSeenShared||ke,Ei=(l.privateSpaces??[]).filter(C=>l.playerSeenPrivateIds?.includes(C.ownerId)||C.ownerId===ya),Rt=_?.status!=="closed"&&_?.id?_:null,wa=(l.playerInvitations??[]).some(C=>L.includes(C.residentId)),C$=[{key:"exterior",label:"Exterior",subtitle:"Outside the building",area:"outside",spaceClass:g[0],ownerId:"",image:l.presentation.image,description:l.form||E||`The outside of ${l.name}.`,state:l.exteriorState,locked:!1,canEnter:!0,accessLabel:"Open (no restrictions)"},...g.map(C=>{let we=cn(l,C),ae=C==="residence",fe=ae?!pr:!l.playerSeenPublic&&!(Rt?.placeId===l.id&&Rt.area==="public"),ot=!ae||!ee||l.occupancy.playerHome||wa;return{key:`class:${C}`,label:g.length===1?"Interior":`${C[0].toUpperCase()}${C.slice(1)} interior`,subtitle:ae?"Shared living space":`${C[0].toUpperCase()}${C.slice(1)} space`,area:ae?"shared":"public",spaceClass:C,ownerId:"",image:fe?null:we.image,description:fe?"":we.description,state:fe?void 0:we.state,locked:fe,canEnter:ot,accessLabel:ot?"Open to visit":"Resident invitation required"}}),...(l.privateSpaces??[]).filter(C=>L.includes(C.ownerId)).map(C=>{let we=fn(C.ownerId),ae=!l.playerSeenPrivateIds?.includes(C.ownerId)&&C.ownerId!==ya,fe=(l.playerInvitations??[]).some(ot=>ot.scope==="private"&&ot.ownerId===C.ownerId&&ot.residentId===C.ownerId);return{key:`private:${C.ownerId}`,label:`${we}'s Private Space`,subtitle:"Restricted area",area:"private",spaceClass:"residence",ownerId:C.ownerId,image:ae?null:C.image,description:ae?"":C.description,state:ae?void 0:C.state,locked:ae,canEnter:fe,accessLabel:fe?"Owner's invitation available":"Owner's invitation required",adaptationPending:!ae&&C.adaptationPending}})],vc=l.zones?l.zones.map(C=>{let we=C.kind==="exterior"?"outside":C.kind==="private-residence"?"private":C.kind==="shared-residence"?"shared":"public",ae=C.kind!=="exterior"&&!C.seen&&!(l.occupancy.playerHome&&C.kind==="shared-residence")&&!(Rt?.placeId===l.id&&Rt.zoneId===C.id),fe=l.playerInvitations?.some(Ea=>Ea.zoneId===C.id)||Rt?.placeId===l.id&&Rt.grantedZoneIds?.includes(C.id),ot=!C.closed&&(C.kind==="exterior"||C.kind==="public"||(C.kind==="shared-residence"||C.kind==="private-residence"&&C.ownerId==="player")&&l.occupancy.playerHome||!!fe||C.kind==="restricted"&&!!C.controllerIds?.includes("player"));return{key:C.id,zoneId:C.id,label:C.kind==="private-residence"?C.ownerId==="player"?"Your personal space":fn(C.ownerId??"")+"'s Private Space":C.name,subtitle:C.kind==="staff"?"Staff area":C.kind==="shared-residence"?"Shared living space":C.kind==="private-residence"?"Resident's personal space":C.kind==="exterior"?"Outside the building":"Public area",area:we,spaceClass:C.venueClass,ownerId:C.ownerId??"",image:ae?null:C.image,description:ae?"":C.description,state:ae?void 0:C.state,locked:ae,canEnter:ot,accessLabel:C.closed?"Closed for Renovation":C.kind==="exterior"||C.kind==="public"?"Open to everyone":fe?"Permission for this visit":C.kind==="private-residence"?"Owner's invitation required":C.kind==="staff"?"Workers and invited guests":C.kind==="restricted"?"Assigned controllers and invited guests":"Residents and invited guests"}}):C$,ce=vc.find(C=>C.key===Ge)??vc[0],gr=l.zones?.find(C=>C.id===ce.zoneId),Bs=gr?.preparation,T$=gr?.kind==="staff"?l.workerIds??[]:gr?.kind==="private-residence"?[gr.ownerId??""]:gr?.controllerIds??[],Tf=(l.editProposals??[]).filter(C=>C.zoneId?C.zoneId===ce.zoneId:ce.area==="shared"?C.target==="shared":ce.area==="private"&&C.target==="private"&&C.ownerId===ce.ownerId),Fu=ce.description&&ce.description!==l.form&&ce.description!==E?ce.description:"",E$=!ce.locked&&!!(Fu||ce.adaptationPending||ce.state?.condition||ce.state?.items.length||ce.state?.publicFacts.length||ce.state?.features.length||ce.area==="outside"&&i.village.setting||Tf.length),yc=Rt?.placeId===l.id&&(ce.zoneId?Rt.zoneId===ce.zoneId:Rt.area===ce.area)&&(ce.zoneId?Rt.zoneId===ce.zoneId:ce.area==="outside"||Rt.spaceClass===ce.spaceClass)&&(ce.area!=="private"||Rt.privateOwnerId===ce.ownerId),A$=(C,we,ae,fe="",ot)=>(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h3",{className:`${n}-panel-title`,children:C}),fe?(0,o.jsx)("p",{children:"Personal-space images always reflect their owner."}):null,(0,o.jsxs)("fieldset",{children:[(0,o.jsx)("legend",{children:"Venue image context"}),(fe?["useVisualLore"]:["useAssignedVillagerContext","useVisualLore"]).map(Ea=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",disabled:W,checked:l.imageContext?.[Ea]??(Ea==="useVisualLore"?i.settings.useVisualLoreByDefault!==!1:i.settings.personalizeVenueImagesByDefault!==!1),onChange:async Ju=>{let O$={useAssignedVillagerContext:l.imageContext?.useAssignedVillagerContext??i.settings.personalizeVenueImagesByDefault!==!1,useVisualLore:l.imageContext?.useVisualLore??i.settings.useVisualLoreByDefault!==!1,[Ea]:Ju.target.checked};se(!0);try{r(await j("/locations/venue/"+encodeURIComponent(l.id),{method:"PUT",body:JSON.stringify({name:l.name,description:l.description,imageContext:O$})}))}catch(I$){ve(X(I$,"Image context could not be saved."))}finally{se(!1)}}}),Ea==="useVisualLore"?"Use selected visual lore":"Use assigned villagers\u2019 personality"]},Ea))]}),we?(0,o.jsx)("img",{className:`${n}-venue-space-picture`,src:we.url,alt:`${C} at ${l.name}`}):(0,o.jsx)("div",{className:`${n}-venue-image-empty`,children:"No image yet"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!Mn||W,onClick:()=>{n$(l.id,ae,fe,ot)},children:we?"Redraw image":"Draw image"}),(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*","aria-label":`Upload ${C.toLowerCase()} image`,disabled:!!Mn||W,onChange:Ea=>{let Ju=Ea.target.files?.[0];Ea.target.value="",i$(l.id,Ju,ae,fe,ot)}}),we?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!Mn||W,onClick:()=>{r$(l.id,ae,fe,ot)},children:"Remove image"}):null]})]},ot||fe||ae||"exterior"),po=C=>({name:C.name,form:C.form,workerIds:C.workerIds,position:{x:C.presentation.x,y:C.presentation.y},spaces:g.map(we=>{let ae=cn(C,we);return{description:ae.description,condition:ae.state.condition,items:ae.state.items,publicFacts:ae.state.publicFacts,features:ae.state.features.map(({id:fe,text:ot,locked:Ea})=>({id:fe,text:ot,locked:Ea}))}}),privateSpaces:C.privateSpaces?.map(we=>({ownerId:we.ownerId,description:we.description,condition:we.state.condition,items:we.state.items,publicFacts:we.state.publicFacts,features:we.state.features.map(({id:ae,text:fe,locked:ot})=>({id:ae,text:fe,locked:ot}))}))}),R$=!!(be&&JSON.stringify(po(be))!==JSON.stringify(po(l))),M$=!!(ue&&(JSON.stringify(ue.classes)!==JSON.stringify(g)||ue.capacity!==(l.residenceCapacity??1)||ue.slot!==0||ue.title||ue.description||ue.extraBeds)),z$=()=>{(Ue==="edit"&&R$||Ue==="proposal"&&M$)&&!window.confirm("Discard your unsaved changes?")||(_t("view"),pe(null),it(null),Xe(""),G(""))},Ef=(C,we)=>{r(C);let ae=C.settings.venues.find(fe=>fe.id===l.id);ae&&pe(structuredClone(ae)),G(we)},V$=async()=>{if(be){if(be.form!==l.form||JSON.stringify(be.classes)!==JSON.stringify(l.classes)||JSON.stringify(be.workerIds??[])!==JSON.stringify(l.workerIds??[])||JSON.stringify(be.state)!==JSON.stringify(l.state)||be.presentation.x!==l.presentation.x||be.presentation.y!==l.presentation.y){Xe("Physical edits and map moves need an earned route. Edit only the name or description here.");return}if(ee){let C=po(be),we=po(l),ae=g.indexOf("residence");if((ae>=0&&JSON.stringify(C.spaces[ae])!==JSON.stringify(we.spaces[ae])||JSON.stringify(C.privateSpaces)!==JSON.stringify(we.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}Pe(!0),Xe(""),G("");try{let C=await j(`/locations/venue/${encodeURIComponent(l.id)}`,{method:"PUT",body:JSON.stringify({name:be.name,description:be.description})});Ef(C,"Venue details saved.")}catch(C){Xe(X(C,"The Venue could not be saved."))}finally{Pe(!1)}}},Af=async(C,we="")=>{if(!be)return;let ae=C==="private"?be.privateSpaces?.find(ot=>ot.ownerId===we):cn(be,"residence");if(!ae)return;let fe=structuredClone(be);if(C==="shared"?fe.spaces=fe.spaces?.map(ot=>ot.venueClass==="residence"?cn(l,"residence"):ot):fe.privateSpaces=fe.privateSpaces?.map(ot=>ot.ownerId===we?l.privateSpaces?.find(Ea=>Ea.ownerId===we)??ot:ot),!(JSON.stringify(po(fe))!==JSON.stringify(po(l))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){Pe(!0),Xe(""),G("");try{let ot=await j(`/locations/venue/${encodeURIComponent(l.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:C,ownerId:we,description:ae.description,state:ae.state})});Ef(ot,`${C==="private"?"Private":"Shared"} room edit proposed.`)}catch(ot){Xe(X(ot,"That room edit could not be proposed."))}finally{Pe(!1)}}},Rf=a2(l,M);return(0,o.jsxs)("div",{className:`${n}-root`,"data-venue-view":Ue==="view"?"true":void 0,children:[(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:Ue==="view"?Rf:`${Ue==="edit"?"Edit Venue":"Propose Change"} \xB7 ${Rf}`}),(0,o.jsx)("p",{className:`${n}-subtitle`,children:Ue==="view"?l.form||E||(u.length===0?"Nobody is here right now":`Villagers here: ${u.map(C=>C.name).join(", ")}`):Ue==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,o.jsxs)("div",{className:`${n}-venue-header-controls`,children:[(0,o.jsx)("div",{className:`${n}-actions`,children:Ue==="view"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{pe(structuredClone(l)),Xe(""),G(""),_t("edit")},children:"Edit Venue"}),g.includes("residence")&&!l.occupancy.playerHome?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Xe(""),j(`/locations/venue/${encodeURIComponent(l.id)}/player-move`,{method:"POST"}).then(r).catch(C=>Xe(X(C,"The move could not be requested.")))},children:"Request to live here"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{it({classes:g,capacity:l.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),Xe(""),G(""),_t("proposal")},children:"Propose Change"}),Rt?.placeId===l.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>q("room"),children:"Return to scene"}):null]}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:z$,children:Ue==="edit"?"Close Editor":"Exit Change Proposal"})}),Ue==="view"&&qt?(0,o.jsx)("p",{className:`${n}-venue-move-error`,role:"alert",children:qt}):null]})]}),Ue==="view"?(0,o.jsxs)("main",{className:n+"-venue-page","aria-label":"View Venue",children:[(0,o.jsxs)("nav",{className:n+"-venue-zones","aria-label":"Venue zones",children:[(0,o.jsx)("button",{type:"button",className:n+"-venue-back",onClick:mf,children:"\u2190 Back to map"}),vc.map(C=>(0,o.jsxs)("button",{type:"button",className:n+"-venue-zone-tab","data-active":ce.key===C.key?"true":"false","aria-current":ce.key===C.key?"page":void 0,onClick:()=>nt(C.key),children:[(0,o.jsx)("span",{className:n+"-venue-zone-thumb",children:C.image&&!C.locked?(0,o.jsx)("img",{src:C.image.url,alt:""}):(0,o.jsx)("span",{"aria-hidden":"true",children:C.locked?"\u25C8":"\u2302"})}),(0,o.jsxs)("span",{className:n+"-venue-zone-copy",children:[(0,o.jsx)("strong",{children:C.label}),(0,o.jsx)("small",{children:C.subtitle})]})]},C.key))]}),(0,o.jsxs)("div",{className:n+"-venue-zone-content",children:[(0,o.jsx)("section",{className:n+"-venue-zone-main","aria-label":ce.label,children:(0,o.jsx)("div",{className:n+"-venue-artwork",children:ce.image&&!ce.locked?(0,o.jsx)("img",{src:ce.image.url,alt:ce.label+" at "+l.name}):(0,o.jsx)("div",{className:n+"-venue-artwork-empty",children:ce.locked?"Area not discovered yet":"No image for this area yet"})})}),(0,o.jsxs)("aside",{className:n+"-venue-zone-context",children:[(0,o.jsx)("span",{className:n+"-venue-kicker",children:"Zone"}),(0,o.jsx)("h2",{children:ce.label}),(0,o.jsx)("p",{children:ce.subtitle}),(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Occupancy"}),(0,o.jsx)("strong",{children:g.includes("residence")?wu(l)+" / "+L1(l)+" residents":u.length+" here now"})]}),(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Accessibility"}),(0,o.jsx)("strong",{children:ce.accessLabel})]}),gr&&["private-residence","staff","restricted"].includes(gr.kind)?(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Controllers"}),(0,o.jsx)("strong",{children:T$.map(C=>C==="player"?"You":i.villagers.find(we=>we.characterId===C)?.name??C).join(", ")||"No current controllers"})]}):null,Bs?.status==="ready"?(0,o.jsx)("p",{role:"status",children:"Private space ready."}):null,Bs&&Bs.status!=="ready"?(0,o.jsxs)("p",{role:"status",children:["Private space ",Bs.status==="failed"?"preparation failed":"is being prepared",".",Bs.status==="failed"?(0,o.jsx)("button",{type:"button",disabled:W,onClick:async()=>{se(!0);try{r(await j("/private-spaces/retry",{method:"POST"}))}catch(C){ve(X(C,"Private preparation failed."))}finally{se(!1)}},children:"Retry private-space preparation"}):null]}):null,E$?(0,o.jsxs)("details",{className:n+"-venue-more",children:[(0,o.jsx)("summary",{children:"Area details"}),Fu?(0,o.jsx)("p",{children:Fu}):null,ce.adaptationPending?(0,o.jsx)("p",{children:"This room is still being adapted after a move."}):null,ce.state?.condition?(0,o.jsxs)("p",{children:["Condition: ",ce.state.condition]}):null,ce.state?.items.length?(0,o.jsxs)("p",{children:["Present items: ",ce.state.items.join(", ")]}):null,ce.state?.publicFacts.length?(0,o.jsxs)("p",{children:["Established facts: ",ce.state.publicFacts.join(" \xB7 ")]}):null,ce.state?.features.length?(0,o.jsxs)("p",{children:["Defining features: ",ce.state.features.map(C=>C.text).join(" \xB7 ")]}):null,ce.area==="outside"&&i.village.setting?(0,o.jsxs)("p",{children:["Village: ",i.village.setting]}):null,Tf.map(C=>(0,o.jsxs)("p",{children:["Proposed room edit:"," ",C.declined?"declined or stale":`approved by ${C.approvedIds.length} of ${C.requiredIds.length} residents`]},C.id))]}):null,ce.locked&&!ce.canEnter?(0,o.jsx)("p",{className:n+"-venue-zone-guidance",children:"Visit the exterior and ask the resident for an invitation."}):null,Rt&&!yc?(0,o.jsx)("p",{className:n+"-venue-zone-guidance",children:"Move between zones to continue this visit."}):null,(0,o.jsx)("button",{type:"button",className:n+"-venue-visit",disabled:da||!yc&&(!!Rt&&Rt?.placeId!==l.id||!ce.canEnter),onClick:()=>yc?q("room"):void fc(l,ce.spaceClass,ce.ownerId,ce.area,ce.zoneId),children:da?"Opening visit\u2026":yc?"Return to scene \u2192":"Visit this area \u2192"})]})]})]}):Ue==="edit"?(0,o.jsxs)("main",{className:`${n}-venue-editor-page`,children:[(0,o.jsx)("div",{className:`${n}-venue-space-grid`,children:vc.filter(C=>!C.locked).map(C=>A$(C.label+" image",C.image,C.area==="outside"?void 0:C.spaceClass,C.ownerId,C.zoneId))}),Mn===l.id?(0,o.jsx)("p",{className:`${n}-hint`,children:"Drawing or saving the image\u2026"}):null,Kg?.id===l.id?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Kg.text}):null,ce.zoneId&&!ce.locked?(0,o.jsx)(Yk,{zone:ce,onSave:async C=>{try{r(await j(`/venues/${encodeURIComponent(l.id)}/zones/${encodeURIComponent(ce.zoneId)}`,{method:"PUT",body:JSON.stringify(C)}))}catch(we){throw ni({id:l.id,text:X(we,"The zone could not be saved.")}),we}}},ce.zoneId):null,be?(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue details"}),(0,o.jsx)(q1,{draft:be,existing:!0,villagers:i.villagers,editableClasses:g.filter(C=>C!=="residence"||!ee||ke),onChange:pe}),ee?(0,o.jsx)("p",{className:`${n}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Nt||!be.name.trim(),onClick:()=>{V$()},children:"Save Venue details"}),ee&&ke?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Nt||!cn(be,"residence").description.trim(),onClick:()=>{Af("shared")},children:"Propose shared room edit"}):null]}),ee&&!ke?(0,o.jsx)("p",{className:`${n}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,ya&&be?.privateSpaces?.filter(C=>C.ownerId===ya).map(C=>(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsxs)("h2",{className:`${n}-panel-title`,children:["Propose changes to ",fn(C.ownerId),"'s private space"]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:C.description,onChange:we=>pe(ae=>ae&&{...ae,privateSpaces:ae.privateSpaces?.map(fe=>fe.ownerId===C.ownerId?{...fe,description:we.target.value}:fe)})})]}),(0,o.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:C.state.condition,onChange:we=>pe(ae=>ae&&{...ae,privateSpaces:ae.privateSpaces?.map(fe=>fe.ownerId===C.ownerId?{...fe,state:{...fe.state,condition:we.target.value}}:fe)})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this room."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:C.state.items.join(`
`),onChange:we=>pe(ae=>ae&&{...ae,privateSpaces:ae.privateSpaces?.map(fe=>fe.ownerId===C.ownerId?{...fe,state:{...fe.state,items:we.target.value.split(`
`)}}:fe)})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this room."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:C.state.publicFacts.join(`
`),onChange:we=>pe(ae=>ae&&{...ae,privateSpaces:ae.privateSpaces?.map(fe=>fe.ownerId===C.ownerId?{...fe,state:{...fe.state,publicFacts:we.target.value.split(`
`)}}:fe)})})]})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Nt||!C.description.trim(),onClick:()=>{Af("private",C.ownerId)},children:"Propose private room edit"})]},C.ownerId)),ee&&(l.residentIds?.length??0)>0?(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Resident moves"}),(0,o.jsxs)("select",{value:ye,onChange:C=>Ae(C.target.value),"aria-label":"Destination for resident move",children:[(0,o.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),i.settings.venues.filter(C=>C.id!==l.id&&Jn(C).includes("residence")&&wu(C)<L1(C)).map(C=>(0,o.jsx)("option",{value:C.id,children:C.name},C.id))]}),(l.residentIds??[]).map(C=>{let we=i.residences.find(ae=>ae.characterId===C&&ae.status!=="current");return(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("strong",{children:fn(C)}),we?(0,o.jsx)("span",{className:`${n}-hint`,children:we.status==="moving"?"Moving":"Awaiting consent"}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!ye||Nt,onClick:()=>{Pe(!0),j("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:C,venueId:ye})}).then(r).catch(ae=>Xe(X(ae,"The move could not be requested."))).finally(()=>Pe(!1))},children:"Ask to move"})]},C)})]}):null,I?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:I}):null,qt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:qt}):null]}):(0,o.jsx)("main",{className:`${n}-venue-proposal-page`,children:(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Propose a Venue change"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),ue?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${n}-row`,children:xs.map(C=>(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:ue.classes.includes(C),disabled:!ue.classes.includes(C)&&ue.classes.length>=2,onChange:we=>it(ae=>ae&&{...ae,classes:we.target.checked?[...ae.classes,C]:ae.classes.filter(fe=>fe!==C)})})," ",C]},C))})]}),ue.classes.includes("residence")?(0,o.jsxs)("label",{className:`${n}-label`,children:["Base capacity \xB7 includes you",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:ue.capacity,onChange:C=>it({...ue,capacity:Number(C.target.value)})})]}):null,(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:ue.slot,onChange:C=>it({...ue,slot:Number(C.target.value)}),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",l.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",l.improvements?.[1]?.title??"empty"]})]})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,o.jsx)("input",{className:`${n}-notice-input`,value:ue.title,onChange:C=>it({...ue,title:C.target.value}),placeholder:"A second sleeping alcove"})]}),ue.title?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["What changes in the story?",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:ue.description,onChange:C=>it({...ue,description:C.target.value})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:3,value:ue.extraBeds,onChange:C=>it({...ue,extraBeds:Number(C.target.value)})})]})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Nt||ue.classes.length<1||ue.title.trim().length>0&&!ue.description.trim(),onClick:()=>{Pe(!0),Xe(""),j(`/locations/venue/${encodeURIComponent(l.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:ue.classes,capacity:ue.capacity,...ue.title.trim()?{slot:ue.slot,improvement:{title:ue.title,description:ue.description,extraBeds:ue.extraBeds}}:{},title:ue.title||`Change ${l.name}`,detail:ue.description||`Change Venue Classes or capacity at ${l.name}.`})}).then(C=>{r(C),it(null),G("Proposal submitted.")}).catch(C=>Xe(X(C,"The proposal could not be saved."))).finally(()=>Pe(!1))},children:"Submit proposal"})]}):(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:I||"Proposal submitted."}),qt?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:qt}):null]})})]})}if(R==="menu")return(0,o.jsxs)("div",{className:`${n}-root ${n}-sectioned-menu`,"data-section":Et,"data-page":J,"data-mobile":t,children:[(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:y2[J]}),t?null:(0,o.jsx)("p",{className:`${n}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,o.jsx)("div",{className:`${n}-actions`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:J!=="index"?()=>rt("index"):gc,children:J!=="index"?"Back to menu":"Back to the village"})}),Ci?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Ci}):null]}),(0,o.jsxs)("nav",{className:`${n}-menu-nav`,"aria-label":"Village menu pages",children:[(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village Management"}),(0,o.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":J==="villagers","data-active":J==="villagers"?"true":"false",disabled:!i||W,onClick:()=>Ut("villagers"),children:`Villagers (${i?.villagers.length??0})`}),(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":J==="memories","data-active":J==="memories"?"true":"false",disabled:!i||W,onClick:()=>Ut("memories"),children:"Memories"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":J==="venueRequests","data-active":J==="venueRequests"?"true":"false",disabled:!i||W,onClick:()=>Ut("venueRequests"),children:`Venue Requests (${(i?.venueRequests?.length??0)+(i?.upgradeRequests?.length??0)+(i?.residences?.filter(l=>l.status==="pending"&&l.requestedBy==="villager").length??0)})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":J==="projects","data-active":J==="projects"?"true":"false",disabled:!i||W,onClick:()=>Ut("projects"),children:`Projects (${i?.projects?.filter(l=>(l.kind==="new-venue"||l.kind==="renovation")&&l.lifecycle?.phase!=="complete").length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":J==="village","data-active":J==="village"?"true":"false",onClick:()=>Ut("village"),children:"Village Settings"})]})]}),(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"General Settings"}),(0,o.jsx)("div",{className:`${n}-menu-group-buttons`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":J==="general","data-active":J==="general"?"true":"false",onClick:()=>Ut("general"),children:"General settings"})})]}),(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Debug"}),(0,o.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[_s?(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":J==="progress","data-active":J==="progress"?"true":"false",disabled:!i||W,onClick:()=>Ut("progress"),children:"DEBUG: Progress"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":J==="chatlogs","data-active":J==="chatlogs"?"true":"false",disabled:!i||W,onClick:()=>Ut("chatlogs"),children:`DEBUG: Venue Visits (${b?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":J==="agendas","data-active":J==="agendas"?"true":"false",disabled:!i||W,onClick:()=>Ut("agendas"),children:`DEBUG: Villager Wishes (${me?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":J==="schedules","data-active":J==="schedules"?"true":"false",disabled:!i||W,onClick:()=>Ut("schedules"),children:`Villager Agendas (${me?.length??0})`})]})]})]}),J==="index"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-content ${n}-menu-welcome`,role:"main",children:[(0,o.jsx)("span",{className:`${n}-venue-kicker`,children:"Village menu"}),(0,o.jsx)("h2",{children:"Choose where to go"}),(0,o.jsx)("p",{children:"Manage the people and places in your village, adjust settings, or inspect its DEBUG records."}),(0,o.jsxs)("div",{className:`${n}-menu-quick-links`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ut("villagers"),children:"Village Management"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ut("general"),children:"General Settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ut("chatlogs"),children:"DEBUG Settings"})]})]}):!i&&J!=="general"?(0,o.jsx)("section",{className:`${n}-panel ${n}-menu-content`,role:"main",children:Ci?"The village could not be loaded. Return to the village and try again.":"Loading village menu\u2026"}):J==="general"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-content`,role:"main",children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"General settings"}),(0,o.jsx)(bg,{}),i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-row`,htmlFor:`${n}-speech-colors`,children:[(0,o.jsx)("input",{id:`${n}-speech-colors`,type:"checkbox",checked:i.settings.characterSpeechColors,disabled:W,onChange:l=>{Fx(l.target.checked)}}),(0,o.jsx)("span",{children:"Character chat colors"})]}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Show names and spoken words in the colors captured from each villager\u2019s card. Use Compare card and Apply refresh to adopt later color changes."})]}):null,i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-story-pace`,children:"Background events and wishes"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Controls automatic Events, resident housing proposals from those events, and new wishes. Off pauses these. Time, schedules, approved moves, construction, and existing wish expiry continue. Visits and other generation features use their own controls. All enabled levels allow at most one new wish per resident per day and two active wishes; quiet days can have none."}),(0,o.jsx)("select",{id:`${n}-story-pace`,value:i.settings.storyPace,disabled:W,onChange:l=>{Qx(l.target.value)},children:i.settings.storyPaces.map(l=>(0,o.jsx)("option",{value:l,children:l.charAt(0).toUpperCase()+l.slice(1)},l))}),(0,o.jsx)("span",{className:`${n}-hint`,children:jk(i.settings.storyPace)})]}):null,i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-visit-retention`,children:"Visit transcripts"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,o.jsxs)("select",{id:`${n}-visit-retention`,value:i.settings.visitRetention.mode,disabled:W,onChange:l=>{let u=l.target.value;pf({mode:u,value:u==="count"?100:u==="days"?365:0})},children:[(0,o.jsx)("option",{value:"forever",children:"Keep forever"}),(0,o.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,o.jsx)("option",{value:"days",children:"Retire after days"})]}),i.settings.visitRetention.mode!=="forever"?(0,o.jsx)("input",{type:"number","aria-label":i.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:i.settings.visitRetention.mode==="count"?1:30,max:i.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:i.settings.visitRetention.value,onBlur:l=>{let u=Number(l.target.value);u!==i.settings.visitRetention.value&&pf({mode:i.settings.visitRetention.mode,value:u})}},`${i.settings.visitRetention.mode}:${i.settings.visitRetention.value}`):null]}):null,(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Starting over"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,o.jsx)("div",{className:`${n}-row`,children:yx?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-danger`,disabled:W,onClick:()=>{b$()},children:"Yes, empty the village"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:()=>oc(!1),children:"Keep it"})]}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W||!i,onClick:()=>oc(!0),children:"Reset the village and start over"})})]}),va?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:va}):null]}):J==="village"?(0,o.jsxs)("div",{className:`${n}-menu-body ${n}-menu-content`,role:"main",children:[(0,o.jsxs)("section",{className:n+"-venue-card",children:[(0,o.jsx)(oh,{value:Tn,onChange:Wl}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:En,onChange:l=>ec(l.target.checked)}),"Personalize new venue images by default"]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:An,onChange:l=>tc(l.target.checked)}),"Use visual lore by default"]}),(0,o.jsx)("button",{type:"button",disabled:W,onClick:async()=>{se(!0),ve("");try{r(await j("/settings",{method:"PATCH",body:JSON.stringify({sceneryArtStyle:Tn,personalizeVenueImagesByDefault:En,useVisualLoreByDefault:An})}))}catch(l){ve(X(l,"Scenery settings could not be saved."))}finally{se(!1)}},children:"Save scenery settings"})]}),i?(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village settings"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"These choices belong to this village. Resident cards shape their voices, and Villages writes each scene around what is happening now. Village knowledge is refreshed for every reply."}),(0,o.jsx)(m2,{}),(0,o.jsxs)("section",{className:n+"-field","aria-label":"Village Map",children:[(0,o.jsx)("h3",{className:n+"-panel-title",children:"Village Map"}),(0,o.jsx)("p",{className:n+"-hint",children:"Replace the background image here. Venue pins remain in their saved places until you reposition them in the preview."}),hn?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:"Venues will not move automatically. Review every pin on the new map; moving one here is free and does not change its residents, projects, or history."}):null,(0,o.jsx)(fg,{src:$x,alt:"Village map preview with venue pins",pins:i.settings.venues.flatMap(l=>{let u=hn?ks[l.id]:gu(l);return!u||u.x===null||u.y===null?[]:[{id:l.id,x:u.x,y:u.y,text:l.name,tone:yu(l)?Y1({isPlayerHome:l.occupancy.playerHome,occupant:l.occupancy.residentCharacterId}):"venue",onSelect:()=>Ql(l.id)}]}),placing:hn&&Jr!==null,view:ur,shape:wx,zoom:xx,mobile:t,onView:lc&&!Jr?ai:void 0,onPlace:hn&&Jr?(l,u)=>{zg(g=>({...g,[Jr]:{x:l,y:u}})),Ql(Jr),Ns(null)}:void 0}),hn?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:W||Wr,onClick:()=>{t$()},children:Wr?"Generating map\u2026":"Generate replacement"}),(0,o.jsx)("input",{className:n+"-file",type:"file",accept:"image/png,image/jpeg,image/webp,image/avif","aria-label":"Upload replacement village map",disabled:W||Wr,onChange:l=>{let u=l.target.files?.[0];l.target.value="",a$(u)}}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:W||Wr,onClick:()=>{Kr(!0),io(null),ai(null),Ns(null)},children:"No background image"})]}),Rn||Ss?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:n+"-hint",children:"Select a venue, then choose Move pin and its new position on the preview. Unmoved venues keep their saved coordinates."}),(0,o.jsx)("div",{className:n+"-field","aria-label":"Venue placement",children:i.settings.venues.map(l=>{let u=ks[l.id],g=l.occupancy.residentCharacterId?fn(l.occupancy.residentCharacterId):l.occupancy.playerHome?Pl(i):"";return(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":cx===l.id,onClick:()=>Ql(l.id),children:l.name}),(0,o.jsx)("span",{className:n+"-hint",children:g||"No resident"}),(0,o.jsx)("span",{className:n+"-hint",children:u?.x!==null&&u?.x!==void 0&&u?.y!==null&&u?.y!==void 0?"On map":"Not placed"}),(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":Jr===l.id,onClick:()=>Ns(l.id),children:"Move pin"})]},l.id)})})]}):null,Hu?(0,o.jsx)("p",{className:n+"-hint","data-tone":Hu.tone,children:Hu.text}):null,lc?(0,o.jsx)("div",{className:n+"-steps",role:"group","aria-label":"How the picture sits in the frame",children:G1.map(l=>(0,o.jsx)("button",{type:"button",className:n+"-step","data-clickable":"true","data-active":ur.fit===l.fit?"true":"false","aria-pressed":ur.fit===l.fit,onClick:()=>ai({...ur,fit:l.fit}),children:l.label},l.fit))}):null,(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:W||Wr||!Rn&&!Ss,onClick:()=>{gf()},children:"Save map and placements"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:W||Wr,onClick:ff,children:"Cancel replacement"})]})]}):lc?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:n+"-steps",role:"group","aria-label":"How the picture sits in the frame",children:G1.map(l=>(0,o.jsx)("button",{type:"button",className:n+"-step","data-clickable":"true","data-active":ur.fit===l.fit?"true":"false","aria-pressed":ur.fit===l.fit,onClick:()=>ai({...ur,fit:l.fit}),children:l.label},l.fit))}),(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:W,onClick:()=>{gf()},children:"Save framing"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:W,onClick:ff,children:"Cancel"})]})]}):(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:W,onClick:e$,children:"Replace map"}),i.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:W||!no,onClick:()=>sc(!0),children:"Crop or fit current map"}):null]}),va?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:va}):null]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W||!i,onClick:()=>qs(!1,i),children:"Run setup again"}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${n}-setting`,className:`${n}-textarea ${n}-off`,value:oe,maxLength:i.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:l=>lt(l.target.value)}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,o.jsx)(Z1,{books:xu,error:Cg,selected:ta,onChange:_a,disabled:W}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${n}-lore-budget`,className:`${n}-notice-input`,type:"number",min:i.settings.loreTokenBudgetMin,max:i.settings.loreTokenBudgetMax,step:100,value:Nn,disabled:W,onChange:l=>dn(Number(l.target.value))}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,o.jsxs)("section",{className:`${n}-field`,children:[(0,o.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venues"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:y$,disabled:W||o$>=i.settings.maxPlaces,children:"Propose Venue Project"})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,o.jsx)("input",{className:`${n}-notice-input`,type:"search",value:Eg,onChange:l=>lx(l.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,o.jsx)("div",{className:`${n}-notice-add`,children:i.settings.venues.filter(l=>`${l.name} ${l.form??""} ${Jn(l).join(" ")}`.toLowerCase().includes(Eg.toLowerCase())).map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name||"Unnamed Residence"}),(0,o.jsx)("span",{className:`${n}-hint`,children:[l.form,Jn(l).join(" + ")].filter(Boolean).join(" \xB7 ")}),Jn(l).includes("residence")?(0,o.jsxs)("span",{className:`${n}-hint`,children:[(l.residentIds?.length??+!!l.occupancy.residentCharacterId)+Number(l.occupancy.playerHome)," ","/ ",l.residenceCapacity??1," residents"]}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Gu(l),children:"View Venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>pe(structuredClone(l)),children:"Edit"}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{x$(l.id)},"aria-label":`Delete ${l.name}`,disabled:W,children:"\xD7"})]})]},l.id))}),be?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("h3",{className:`${n}-panel-title`,children:i.settings.venues.some(l=>l.id===be.id)?"Edit Venue":"Create Venue"}),(0,o.jsx)(q1,{draft:be,existing:i.settings.venues.some(l=>l.id===be.id),villagers:i.villagers,onChange:pe}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W||!be.name.trim()||!Jn(be).every(l=>cn(be,l).description.trim()),onClick:()=>{w$(be)},children:"Save Venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>pe(null),children:"Cancel"})]})]}):null,(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Jx()},disabled:W,children:"Suggest Venues"})}),Zl.filter(l=>!i.settings.venues.some(u=>u.id===l.id)).map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name}),(0,o.jsx)("span",{className:`${n}-hint`,children:l.form}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>pe(l),children:"Review suggestion"})]},l.id))]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-knowledge`,children:"The information villagers know"}),(0,o.jsx)("textarea",{id:`${n}-knowledge`,ref:Bu,className:`${n}-preset`,value:Fe,maxLength:i.settings.promptBoxMaxLength,spellCheck:!1,onChange:l=>S(l.target.value)}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card guides their voice; additional writing guidance is in Village Settings."}),(0,o.jsx)("div",{className:`${n}-macros`,children:i.settings.macros.map(l=>(0,o.jsx)("button",{type:"button",className:`${n}-macro`,title:`${l.label} \u2014 ${l.help}`,onClick:()=>$$(l.token),children:l.token},l.token))}),(0,o.jsxs)("p",{className:`${n}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,o.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,o.jsx)(u2,{idPrefix:"settings",personas:P,draft:x,onDraft:D,storedId:i.settings.playerPersonaId,storedName:i.settings.playerPersonaName,storedMissing:i.settings.playerPersonaMissing,disabled:W}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Zx()},disabled:W,children:"Save settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{S(i.settings.defaultPromptKnowledge)},disabled:W,children:"Restore the default box"}),(0,o.jsx)("span",{className:`${n}-hint`,children:Fe===i.settings.promptKnowledge&&x===i.settings.playerPersonaId&&oe===i.settings.setting&&JSON.stringify(ta)===JSON.stringify(i.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,va&&!hn&&!Jg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:va}):null]}):(0,o.jsxs)("div",{className:`${n}-menu-body ${n}-menu-content`,role:"main",children:[Et==="debug"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-debug-action`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!i||W||qu,onClick:()=>{Rx()},children:"Force Village Update"}),(0,o.jsx)("p",{className:`${n}-status`,children:w2}),of?(0,o.jsx)("p",{className:`${n}-status`,role:"status",children:of}):null]}):null,J==="villagers"&&zt&&i?.villagers.some(l=>l.characterId===zt)?(0,o.jsx)(tb,{villager:i.villagers.find(l=>l.characterId===zt),request:j,onSaved:l=>r(l),onExport:()=>g2(i.villagers.find(l=>l.characterId===zt)),onBack:()=>{Ze(null),requestAnimationFrame(()=>{for(let{element:l,top:u}of ga.current)l.scrollTop=u;ea.current?.focus({preventScroll:!0})})}},zt):null,J==="villagers"?(0,o.jsxs)("div",{className:`${n}-overlay`,style:zt?{display:"none"}:void 0,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Villagers"})}),(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Zt(l=>!l),disabled:W,children:Dt?"Close the list":"Add a villager"})}),Dt?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("input",{className:`${n}-search`,type:"search",value:le,onChange:l=>Qe(l.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),c===null?(0,o.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):Zu.length===0?(0,o.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,o.jsx)("div",{className:`${n}-picker-list`,children:Zu.map(l=>(0,o.jsxs)("div",{className:`${n}-picker-item`,"data-resident":l.inVillage?"true":"false",children:[(0,o.jsx)(Xr,{portrait:Ca[l.id],name:l.name,className:`${n}-avatar`}),(0,o.jsxs)("div",{className:`${n}-picker-text`,children:[(0,o.jsx)("div",{className:`${n}-villager-name`,children:l.name}),(0,o.jsx)("div",{className:`${n}-villager-role`,children:l.comment||l.tags.slice(0,3).join(" \xB7 ")}),l.summary?(0,o.jsx)("p",{className:`${n}-tile-summary`,children:l.summary}):null]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Dx(l.id)},disabled:W||l.inVillage,children:l.inVillage?"Lives here":"Move in"})]},l.id))})]}):null,i&&i.villagers.length>0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:`${n}-villagers`,children:i.villagers.map(l=>(0,o.jsx)(p2,{villager:l,portrait:Ca[l.characterId],selected:!1,onSelect:!l.place||_!==null?void 0:()=>{let u=i.settings.venues.find(g=>g.id===l.place?.id);u&&hf(u)}},l.characterId))}),(0,o.jsx)("div",{className:`${n}-roster`,children:i.villagers.map(l=>(0,o.jsx)("div",{className:`${n}-roster-entry`,children:(0,o.jsxs)("div",{className:`${n}-roster-row`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-villager-name`,children:l.name}),l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,At[l.characterId]?(0,o.jsx)("div",{className:`${n}-tile-summary`,children:At[l.characterId].changed?`New card: ${At[l.characterId].proposed?.name??"unavailable"}`:At[l.characterId].sourceAvailable?`Snapshot revision ${At[l.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,o.jsxs)("span",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:u=>{ea.current=u.currentTarget,ga.current=[];for(let g=u.currentTarget.parentElement;g;g=g.parentElement)ga.current.push({element:g,top:g.scrollTop});Ze(l.characterId)},"aria-expanded":zt===l.characterId,children:`Sprite Studio \xB7 ${l.sprite?.images.length??0} approved`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Hx(l.characterId)},disabled:W||Da.length>0,children:"Compare card"}),At[l.characterId]?.changed&&At[l.characterId]?.sourceAvailable?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Ux(l.characterId)},disabled:W||Da.length>0,children:"Apply refresh"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{_x(l.characterId)},disabled:W||Da.length>0,children:"Move out"})]})]})},l.characterId))})]}):(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]})]}):null,J==="memories"?(0,o.jsxs)("div",{className:n+"-overlay",children:[(0,o.jsx)("div",{className:n+"-overlay-head",children:(0,o.jsx)("h2",{className:n+"-panel-title",children:"Memories"})}),(0,o.jsx)(Rk,{library:h,busy:W,onRefresh:()=>{p(null),Ls()},onForget:(l,u)=>{Mx(l,u)}})]}):null,J==="noticeboard"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Noticeboard"})}),i.noticeboard.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,o.jsx)("ul",{className:`${n}-notices`,children:i.noticeboard.map((l,u)=>(0,o.jsxs)("li",{className:`${n}-notice-row`,children:[(0,o.jsxs)("span",{children:[l.author.length>0?(0,o.jsx)("span",{className:`${n}-notice-author`,children:`${l.author}: `}):null,l.text]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{N$(u)},disabled:W,"aria-label":`Take down: ${l.text}`,children:"\xD7"})]},`${u}:${l.text}`))}),(0,o.jsxs)("div",{className:`${n}-notice-add`,children:[(0,o.jsx)("input",{className:`${n}-notice-input`,type:"text",value:Fl,maxLength:i.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:l=>Vg(l.target.value),onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),Sf())}}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Sf()},disabled:W||Fl.trim().length===0||i.noticeboard.length>=i.settings.maxNoticeboardNotes,children:`Pin it up (${i.noticeboard.length}/${i.settings.maxNoticeboardNotes})`})]})]}):null,J==="projects"&&i?(0,o.jsx)($2,{snapshot:i,room:_,onSnapshot:r,onReturn:()=>q("room"),onMap:()=>{Oe(""),gc()},onPlaceOnMap:l=>{Ne(l),He(l),gc()},mobile:t,debugEnabled:_s,focusProjectId:ne,siteProjectId:at}):null,J==="venueRequests"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue Requests"})}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Villagers can ask for places in conversation. Accepting a request starts a New Venue Project; place its blueprint on the map, find a willing Builder, and work through the Project phases."}),i.venueRequests.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody has requested a new place."}):(0,o.jsx)("ul",{className:`${n}-notices`,children:i.venueRequests.map(l=>{let u=he[l.id]??l.venueDraft,g=E=>Ye(M=>({...M,[l.id]:{...u,...E}}));return(0,o.jsx)("li",{className:`${n}-notice-row`,children:(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("strong",{children:l.requesterName||"A villager"}),l.requestQuote?(0,o.jsxs)("p",{children:["\u201C",l.requestQuote,"\u201D"]}):null,(0,o.jsx)("span",{className:`${n}-hint`,children:` \xB7 ${l.source==="chat"?"Conversation":"Village life"}`}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:u.name,maxLength:i.settings.maxVenueNameLength,"aria-label":`Requested place name from ${l.requesterName||"villager"}`,onChange:E=>g({name:E.target.value})}),(0,o.jsxs)("select",{className:`${n}-notice-input`,value:u.classes[0]??"gathering","aria-label":`Requested place class from ${l.requesterName||"villager"}`,onChange:E=>g({classes:[E.target.value]}),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"other",children:"Other"})]}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:u.description??"",maxLength:1e3,"aria-label":`Requested place description from ${l.requesterName||"villager"}`,onChange:E=>g({description:E.target.value})}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W||!u.name.trim(),onClick:()=>{se(!0),ve(""),j("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:u.name,classes:u.classes}]})}).then(E=>g({description:E.descriptions[l.id]??""})).catch(E=>ve(X(E,"The description draft could not be generated."))).finally(()=>se(!1))},children:"Generate description draft"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W||!u.name.trim()||u.classes.length===0||!u.description?.trim(),onClick:()=>{Nf(l,!0)},children:u.name!==l.venueDraft.name||JSON.stringify(u.classes)!==JSON.stringify(l.venueDraft.classes)?"Send counteroffer":"Start planning project"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:()=>{Nf(l,!1)},children:"Deny"})]})]})},l.id)})}),(0,o.jsx)("h3",{className:`${n}-panel-title`,children:"Home upgrade requests"}),i.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No home upgrades requested."}):i.upgradeRequests.map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("span",{children:l.detail}),[!0,!1].map(u=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:()=>{se(!0),ve(""),j(`/venue-upgrades/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST"}).then(r).catch(g=>ve(X(g,"The upgrade request could not be decided."))).finally(()=>se(!1))},children:u?"Approve upgrade":"Deny"},String(u)))]},l.id)),(0,o.jsx)("h3",{className:`${n}-panel-title`,children:"Resident move requests"}),i.residences.filter(l=>l.status!=="current").length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No moves pending."}):i.residences.filter(l=>l.status!=="current").map(l=>{let u=fn(l.characterId),g=i.settings.venues.find(E=>E.id===l.proposedVenueId)?.name||"another venue";return(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("span",{children:`${u} \u2192 ${g}`}),l.status==="moving"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("span",{className:`${n}-hint`,children:["Move due ",new Date(l.completesAt??"").toLocaleString()]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:()=>{se(!0),ve(""),j("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(E=>ve(X(E,"The move could not be completed."))).finally(()=>se(!1))},children:"DEBUG: Complete move now"})]}):l.requestedBy==="player"?(0,o.jsxs)("span",{className:`${n}-hint`,children:["Awaiting ",u,"'s answer in conversation."]}):[!0,!1].map(E=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:()=>{se(!0),ve(""),j(`/residences/${E?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(M=>ve(X(M,"The move request could not be decided."))).finally(()=>se(!1))},children:E?"Approve move":"Deny"},String(E)))]},l.characterId)}),va?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:va}):null]}):null,J==="progress"?(0,o.jsxs)("div",{className:`${n}-panel`,children:[(0,o.jsx)("h2",{children:"DEBUG: Progress"}),(0,o.jsxs)("p",{children:["Engine version: ",_e?.engineVersion??"loading"]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{j("/progress/debug").then(Tt)},children:"Refresh diagnostics"}),_e?.backlog.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Unprocessed saved turns"}),_e.backlog.map(l=>(0,o.jsxs)("p",{children:[l.at," \xB7 ",l.sessionId,"/",l.submissionId," ",l.error?`\xB7 ${l.error}`:"\xB7 awaiting replay"]},`${l.sessionId}:${l.submissionId}`))]}):(0,o.jsx)("p",{children:"No saved turns await replay."}),_e?.speechProofs?.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Captured Project speech"}),_e.speechProofs.map(l=>(0,o.jsxs)("p",{children:[l.projectId," \xB7 ",l.grade??"typed"," \xB7 ",l.lineId,": \u201C",l.quote,"\u201D",l.citations?.map((u,g)=>(0,o.jsxs)("span",{children:[" ","\xB7 ",u.lineId,": \u201C",u.quote,"\u201D"]},`${u.lineId}:${g}`))]},`${l.projectId}:${l.lineId}`))]}):null,_e?.tasks.map(l=>(0,o.jsxs)("details",{open:!0,children:[(0,o.jsxs)("summary",{children:[l.definition.owner.kind," ",l.definition.owner.id," \xB7 revision ",l.definition.revision," \xB7"," ",l.resolvedAt?"resolved":l.definition.phases[l.phaseIndex]?.title??"complete"]}),(0,o.jsxs)("p",{children:["Disclosed: ",l.visibleAt||"hidden",l.resolvedAt?` \xB7 Resolved: ${l.resolvedAt} \xB7 ${l.resolutionKey}`:""]}),l.definition.phases.map(u=>(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:u.title}),u.requirements.map(g=>{let E=l.receipts.filter(M=>M.phaseId===u.id&&M.requirementId===g.id);return(0,o.jsxs)("p",{children:[g.title," \xB7 ",l.requirementVisibleAt[g.id]||"hidden"," \xB7"," ",E.length?E.map(M=>`${M.routeId} [${M.evidence.grade??"typed"}]: ${M.evidence.sourceId} ${M.evidence.excerpt??""} ${(M.evidence.citations??[]).map(L=>`${L.lineId}: ${L.quote}`).join("; ")}`).join("; "):"pending"]},g.id)})]},u.id)),l.attempts.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Rejected or unavailable"}),l.attempts.map((u,g)=>(0,o.jsxs)("p",{children:[u.phaseId,"/",u.requirementId," \xB7 ",u.status,": ",u.reason]},`${u.evidenceId}:${g}`))]}):null,l.transitions.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Transitions"}),l.transitions.map((u,g)=>(0,o.jsxs)("p",{children:[u.phaseId," \u2192 ",u.at," \xB7 ",u.evidenceId]},`${u.phaseId}:${g}`))]}):null,l.revisionHistory?.map(u=>(0,o.jsxs)("details",{children:[(0,o.jsxs)("summary",{children:["Earlier revision ",u.definition.revision," \xB7 ",u.receipts.length," accepted sources"]}),u.receipts.map(g=>(0,o.jsxs)("p",{children:[g.requirementId," \xB7 ",g.evidence.grade??"typed"," \xB7 ",g.evidence.sourceId," ","\xB7 ",g.evidence.excerpt??"",g.evidence.citations?.map(E=>(0,o.jsxs)("span",{children:[" ","\xB7 ",E.lineId,": \u201C",E.quote,"\u201D"]},`${E.lineId}:${E.quote}`))]},`${g.requirementId}:${g.evidence.sourceId}`)),u.transitions.map((g,E)=>(0,o.jsxs)("p",{children:[g.phaseId," \u2192 ",g.at]},`${g.phaseId}:${E}`))]},u.definition.revision))]},l.definition.id)),Ci?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Ci}):null]}):null,J==="chatlogs"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue visits"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsxs)("select",{"aria-label":"Filter visits by venue",value:Y,onChange:l=>{F(l.target.value),z(0),w(null)},children:[(0,o.jsx)("option",{value:"",children:"All venues"}),(i?.settings.venues??[]).map(l=>(0,o.jsx)("option",{value:l.id,children:l.name},l.id))]}),(0,o.jsxs)("select",{"aria-label":"Filter visits by resident",value:te,onChange:l=>{Te(l.target.value),z(0),w(null)},children:[(0,o.jsx)("option",{value:"",children:"All residents"}),(i?.villagers??[]).map(l=>(0,o.jsx)("option",{value:l.characterId,children:l.name},l.characterId))]})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W||f===0,onClick:()=>{df()},children:"Delete all completed logs"}),B?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:B}):null,b===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading venue visits\u2026"}):b.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No completed visits match these filters."}):b.map(l=>(0,o.jsxs)("section",{children:[(0,o.jsxs)("h3",{className:`${n}-story-day`,children:[l.placeName," \xB7 ",bu(l.startedAt)]}),(0,o.jsxs)("p",{className:`${n}-story-meta`,children:[l.participants.map(u=>u.name).join(", ")," \xB7 ",l.lineCount," lines",l.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",l.memoryPending?l.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${l.memoryReview.nextRecollection??0}/${l.recollectionCount} recollections reviewed \xB7 ${l.memoryReview.attempts} ${l.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${l.memoryProgress?.nextUnit??0}/${l.memoryUnits} pieces processed)`:""]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Yu(l.id)},children:v?.id===l.id?"Refresh transcript":"Open transcript"}),l.memoryPending?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:()=>{Ix(l.id)},children:l.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:()=>{df(l.id)},children:"Delete log"})]}),v?.id===l.id?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("ul",{className:`${n}-story`,children:v.lines.map((u,g)=>(0,o.jsx)("li",{className:`${n}-story-row`,children:(0,o.jsxs)("span",{children:[(0,o.jsxs)("span",{className:`${n}-story-meta`,children:[(0,o.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?vu(i.villagers.find(E=>E.characterId===u.speakerId)?.nameColor):void 0,children:u.name||Pl(i)})," \xB7 ",bu(u.at)]}),(0,o.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?vu(i.villagers.find(E=>E.characterId===u.speakerId)?.dialogueColor):void 0,children:ys(u.content,`venue-${l.id}-${g}-`)}),(0,o.jsxs)("span",{className:`${n}-story-meta`,children:["Heard by:"," ",u.heardBy?.map(E=>v.participants.find(M=>M.characterId===E)?.name??E).join(", ")||"no one"]})]})},`${l.id}:${g}`))}),(v.submissions??[]).some(u=>u.recollections?.length)?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,o.jsx)("summary",{children:"Captured recollections and evidence"}),(0,o.jsx)("ul",{className:`${n}-story`,children:(v.submissions??[]).flatMap(u=>(u.recollections??[]).map(g=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:g.text}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Subjects: ${g.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${g.knownByCharacterIds.join(", ")}`}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Evidence: ${g.lineIds.join(", ")}`})]},g.id)))})]}):null,v.memoryReview&&v.memoryReview.status!=="none"?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,open:v.memoryPending,children:[(0,o.jsx)("summary",{children:`Durable review \xB7 ${v.memoryReview?.status??"none"}`}),(0,o.jsxs)("div",{className:`${n}-agenda-notes-body`,children:[(0,o.jsxs)("p",{className:`${n}-story-meta`,children:[`${v.memoryReview?.attempts??0} review attempts \xB7 ${v.memoryReview?.nextRecollection??0} recollections reviewed`,v.memoryReview?.error?` \xB7 Last error: ${v.memoryReview.error}`:""]}),(0,o.jsx)("ul",{className:`${n}-story`,children:(v.memoryReview?.decisions??[]).map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:`${u.action==="promote"?"Promoted":"Rejected"}${u.category?` \xB7 ${W1[u.category]}`:""}`}),u.text?(0,o.jsx)("p",{children:u.text}):null,(0,o.jsx)("p",{className:`${n}-wish-meta`,children:u.reason}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Sources: ${u.recollectionIds.join(", ")}`})]},u.id))})]})]}):null]}):null]},l.id)),f>20?(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:V===0,onClick:()=>{z(Math.max(0,V-20)),w(null)},children:"Previous"}),(0,o.jsxs)("span",{children:[V+1,"\u2013",Math.min(f,V+20)," of ",f]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:V+20>=f,onClick:()=>{z(V+20),w(null)},children:"Next"})]}):null]}):null,J==="agendas"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"What the villagers wish"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),me===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading what the villagers wish\u2026"}):me.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("section",{children:me.map(l=>(0,o.jsxs)("div",{children:[(0,o.jsxs)("h3",{className:`${n}-story-day`,children:[l.name,l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null]}),l.agenda===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):l.agenda.wishes.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure?`Routine personalization needs attention: ${l.agenda.personalizationFailure}`:l.agenda.generatedAt?"No current wishes.":"Their provisional routine is available. New wishes follow the daily allowance."}):(0,o.jsx)("ul",{className:`${n}-story`,children:l.agenda.wishes.map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:u.wish}),u.tell.length>0?(0,o.jsx)("p",{className:`${n}-wish-tell`,children:`Shows as: ${u.tell}`}):null,(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`${u.intensity===1?"Faint":u.intensity===3?"Strong":"Present"} \xB7 ${Vk(u.addedAt??"",u.expiresAt??"")}`})]},u.id))}),(0,o.jsx)(N2,{characterId:l.characterId,total:l.wishHistoryCount??0,busy:W,onCorrect:Vx}),l.wishAttempt?(0,o.jsx)("p",{className:`${n}-hint`,children:`Wish update: ${l.wishAttempt.stage} \xB7 ${l.wishAttempt.reason} \xB7 ${l.wishAttempt.calls} requests \xB7 input tokens ${l.wishAttempt.inputTokens??"unavailable"} \xB7 output tokens ${l.wishAttempt.outputTokens??"unavailable"}`}):null]},l.characterId))})]}):null,J==="schedules"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Villager agendas"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),me===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Loading agendas\u2026"}):me.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("div",{className:`${n}-agenda-list`,children:me.map(l=>(0,o.jsxs)("details",{className:`${n}-week`,children:[(0,o.jsx)("summary",{className:`${n}-week-toggle`,children:(0,o.jsxs)("h3",{className:`${n}-week-head`,children:[l.name,l.agenda?.personalizationPending?(0,o.jsx)("span",{className:`${n}-badge`,children:l.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,l.agenda?.personalizationFailure?(0,o.jsx)("span",{className:`${n}-badge`,children:"Personalization failed"}):null,l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"Card missing"}):null,l.nativeSchedule?(0,o.jsx)("span",{className:`${n}-badge`,children:l.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,hg(l)?(0,o.jsx)("span",{className:`${n}-badge`,children:"Earlier hours kept"}):null]})}),(0,o.jsxs)("div",{className:`${n}-week-body`,children:[l.agenda?.routineSummary?(0,o.jsx)("p",{className:`${n}-story-meta`,children:l.agenda.routineSummary}):null,l.agenda?.personalizationFailure?(0,o.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure}):l.agenda?.personalizationPending?(0,o.jsx)("p",{className:`${n}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,o.jsxs)("div",{className:`${n}-agenda-actions`,children:[(0,o.jsxs)("label",{className:`${n}-agenda-switch`,children:[(0,o.jsx)("input",{type:"checkbox",checked:l.ingestSchedule,disabled:W,onChange:u=>{Ox(l.characterId,u.target.checked)}}),"Use Marinara schedule when available"]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:()=>{zx(l.characterId)},children:"Regenerate agenda"})]}),l.nativeSchedule?(0,o.jsxs)("p",{className:`${n}-story-scope`,children:[l.ingestSchedule&&l.remapFailure?`Schedule translation failed: ${l.remapFailure.message}`:l.ingestSchedule&&l.agenda?.scheduleWeek?"Schedule guides today and future days.":l.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",hg(l)?" Earlier hours retain the previous plan.":""]}):hg(l)?(0,o.jsx)("p",{className:`${n}-story-scope`,children:"Earlier hours retain the previous plan."}):null,l.weekUnreadable?(0,o.jsx)("p",{className:`${n}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):l.nativeSchedule?null:(0,o.jsx)("p",{className:`${n}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,o.jsx)("div",{className:`${n}-agenda-days`,children:l.days.map(u=>{let g=u.isToday?l.effectiveDays?.[u.weekday]??l.agenda?.activeDay?.blocks??l.agenda?.week?.[u.weekday]??[]:l.effectiveDays?.[u.weekday]??(l.ingestSchedule?l.agenda?.scheduleWeek?.[u.weekday]:void 0)??l.agenda?.week?.[u.weekday]??[],E=l.nativeSchedule?.days[u.weekday]??[];return(0,o.jsxs)("details",{className:`${n}-agenda-day`,open:u.isToday||void 0,children:[(0,o.jsxs)("summary",{children:[u.weekday," \xB7 ",u.dateLabel,u.isToday?" \xB7 Today":""]}),(0,o.jsxs)("div",{className:`${n}-agenda-compare`,"data-comparison":l.nativeSchedule?"true":void 0,children:[(0,o.jsxs)("section",{"aria-label":`${u.weekday} Villages agenda`,children:[(0,o.jsx)("h4",{children:"Villages agenda"}),(0,o.jsx)("ol",{className:`${n}-agenda-blocks`,children:g.map((M,L)=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("time",{children:[D1(M.startMinute),"\u2013",D1(M.endMinute)]}),(0,o.jsx)("strong",{children:M.activity}),(0,o.jsx)("span",{children:M.venueId?Mk(i?.settings.venues??[],M.venueId):"Home"}),(0,o.jsx)("span",{children:M.reason}),(0,o.jsx)("span",{className:`${n}-story-scope`,children:M.status==="idle"?"Available":M.status==="dnd"?"Busy":M.status==="offline"?"Offline":"Online"})]},`${M.startMinute}-${M.endMinute}-${L}`))})]}),l.nativeSchedule?(0,o.jsxs)("section",{"aria-label":`${u.weekday} Marinara schedule`,children:[(0,o.jsx)("h4",{children:"Marinara schedule"}),E.length?(0,o.jsx)("ol",{className:`${n}-agenda-blocks`,children:E.map((M,L)=>(0,o.jsxs)("li",{children:[(0,o.jsx)("time",{children:M.time}),(0,o.jsx)("strong",{children:M.activity}),(0,o.jsx)("span",{className:`${n}-story-scope`,children:M.status||"No availability set"})]},`${M.time}-${L}`))}):(0,o.jsx)("p",{className:`${n}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${u.weekday}-${u.dateLabel}`)})})]})]},l.characterId))})]}):null,va?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:va}):null]})]});if(R==="preparing"){let l=i?.foundingPreparation,u=i?.villagers.length??0,g=l?.completedIds.length??0,E=i?.villagers.find(ke=>ke.characterId===l?.currentId)?.name,M=l?.stage==="reading"?"Reading the character card and native schedule":l?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":l?.stage==="resolving"?"Connecting to the System model":l?.stage==="model"?`Waiting for ${l.modelName||"the System model"} to write wishes, the week, and schedule mappings`:l?.stage==="applying"?"Expanding the week and applying native schedule times":l?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",L=l?.stageStartedAt?Date.parse(l.stageStartedAt):NaN,ee=l?.status==="pending"&&Number.isFinite(L)?Math.max(0,Math.floor((Date.now()-L)/1e3)):null;return(0,o.jsx)("div",{className:`${n}-root ${n}-preparing`,role:"status","aria-live":"polite",children:(0,o.jsxs)("div",{children:[(0,o.jsx)("div",{className:`${n}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,o.jsxs)("h1",{children:[i?.village.name??"Your village"," is settling in"]}),(0,o.jsx)("p",{children:l?.status==="failed"?"The villagers need a hand before the gates open.":E?`Making room for ${E}\u2026`:"Lighting windows and making plans\u2026"}),(0,o.jsx)("p",{children:`${g} of ${u} villagers ready`}),l?.status==="pending"&&l.stage?(0,o.jsxs)("p",{children:[M,E?` for ${E}`:"","."]}):null,l?.attempt?(0,o.jsx)("p",{children:`Attempt ${l.attempt} of 3${ee!==null?` \xB7 ${ee}s in this stage`:""}`}):null,l?.stage==="resolving"||l?.stage==="model"||l?.stage==="applying"||l?.stage==="saving"?(0,o.jsx)("p",{children:`${l.loreEntryCount??0} relevant lorebook entries included`}):null,l?.status==="pending"&&l.error?(0,o.jsx)("p",{className:`${n}-hint`,children:`Previous attempt: ${l.error}`}):null,l?.status==="failed"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:l.error}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{v$()},children:"Retry this villager"}),(0,o.jsxs)("details",{children:[(0,o.jsx)("summary",{children:"Change connections"}),(0,o.jsx)(bg,{})]})]}):null,Zg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Zg}):null]})})}if(R==="setup"){let l=(c??[]).map(u=>({id:u.id,name:u.name}));return(0,o.jsx)("div",{className:`${n}-root ${n}-home ${n}-setup-root`,children:(0,o.jsxs)("div",{className:`${n}-home-body ${n}-setup-body`,"data-step":Je,children:[(0,o.jsx)("aside",{className:`${n}-setup-rail`,"aria-label":"Founding progress",children:hu.map((u,g)=>(0,o.jsxs)("div",{className:`${n}-setup-rail-step`,"data-active":g===Je?"true":"false","data-done":g<Je?"true":"false","aria-current":g===Je?"step":void 0,children:[(0,o.jsx)("span",{className:`${n}-setup-rail-number`,children:g+1}),(0,o.jsx)("span",{children:u})]},u))}),(0,o.jsx)("div",{className:`${n}-side`,children:(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:i?.isFounded?"Setting the village up again":"Founding your village"})}),(0,o.jsxs)("p",{className:`${n}-setup-kicker`,children:["Step ",Je+1," of ",hu.length," \xB7 ",hu[Je]]}),Je===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-name`,children:"What is this village called?"}),(0,o.jsx)("input",{id:`${n}-setup-name`,className:`${n}-search`,type:"text",value:kn,maxLength:i?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:W,onChange:u=>Og(u.target.value)})]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Choose a scenario"}),(0,o.jsx)("div",{className:`${n}-scenario-options`,children:yg.filter(u=>u.value!=="custom"||i?.isFounded&&Kn==="custom").map(u=>(0,o.jsxs)("label",{className:`${n}-scenario-option`,children:[(0,o.jsx)("input",{type:"radio",name:`${n}-founding-scenario`,checked:Kn===u.value,disabled:W||i?.isFounded,onChange:()=>l$(u.value)}),(0,o.jsx)("span",{className:`${n}-scenario-icon`,"aria-hidden":"true",children:u.icon}),(0,o.jsx)("strong",{children:u.label}),(0,o.jsx)("small",{children:u.description})]},u.value))})]}),i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,Je===1?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(d2,{personas:P,draft:x,onDraft:D,disabled:W}),(0,o.jsx)(bg,{onSetupProblem:bx,onImageWarningChange:Fg,compact:!0}),vx?(0,o.jsxs)("div",{className:`${n}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,o.jsx)("p",{className:`${n}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,o.jsxs)("span",{className:`${n}-chat-confirm-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:d$,children:"Set up an image connection"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:c$,children:"I understand, continue"})]})]}):null]}):null,Je===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${n}-setup-setting`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:fa,maxLength:i?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:W||ba,onChange:u=>{Ig(u.target.value)}}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),i?.isFounded?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("strong",{children:"Day 1 record"}),(0,o.jsx)("p",{className:`${n}-hint`,children:i.settings.foundingDetails||"This village has no recorded first-day description."}),(0,o.jsx)("span",{className:`${n}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-founding-details`,children:"What happens on the village's first day?"}),(0,o.jsx)("textarea",{id:`${n}-founding-details`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:Qa,maxLength:i?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:W,onChange:u=>Nu(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history."})]}),i?.isFounded?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-world-facts`,children:"Current world facts"}),(0,o.jsx)("textarea",{id:`${n}-world-facts`,className:`${n}-textarea`,value:Wn.join(`
`),disabled:W,placeholder:"One stable fact per line, up to four.",onChange:u=>Hg(u.target.value.split(/\r?\n/u))}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,o.jsx)(Z1,{books:xu,error:Cg,selected:ca,onChange:u=>{Sn(u)},disabled:W}),(0,o.jsxs)("details",{className:`${n}-field`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Advanced lore settings"}),(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${n}-setup-lore-budget`,className:`${n}-notice-input`,type:"number",min:i?.settings.loreTokenBudgetMin??200,max:i?.settings.loreTokenBudgetMax??3200,step:100,value:un,disabled:W,onChange:u=>kg(Number(u.target.value))}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Je===2&&i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"Replace the map and review venue pins in Village Settings \u2192 Village Map. Finish this setup to keep changes you made on earlier steps."}):null,Je===2&&!i?.isFounded?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(oh,{value:Tn,onChange:Wl}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:eo,onChange:u=>Bg(u.target.checked)}),"Use selected visual lore for the map"]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:An,onChange:u=>tc(u.target.checked)}),"Use visual lore for new venues by default"]}),(0,o.jsxs)("div",{className:`${n}-steps`,role:"group","aria-label":"Village map image source",children:[(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":ht==="generate"?"true":"false","aria-pressed":ht==="generate",disabled:ba,onClick:()=>cr("generate"),children:"Generate with AI"}),(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":ht==="upload"?"true":"false","aria-pressed":ht==="upload",disabled:ba,onClick:()=>cr("upload"),children:"Upload an image"}),(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":ht==="none"?"true":"false","aria-pressed":ht==="none",disabled:ba,onClick:()=>cr("none"),children:"No background image"}),i?.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":ht==="existing"?"true":"false","aria-pressed":ht==="existing",disabled:ba,onClick:()=>cr("existing"),children:"Keep current map"}):null]}),ht==="generate"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Advanced map elements"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,o.jsx)("div",{className:`${n}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([u,g])=>(0,o.jsxs)("label",{className:`${n}-label`,children:[g,(0,o.jsxs)("select",{className:`${n}-select`,value:nc[u],disabled:ba,onChange:E=>Gg(M=>({...M,[u]:E.target.value})),children:[(0,o.jsx)("option",{value:"auto",children:"Auto"}),(0,o.jsx)("option",{value:"include",children:"Include"}),(0,o.jsx)("option",{value:"exclude",children:"Exclude"})]})]},u))})]}),(0,o.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Testing prompt controls"}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-prompt`,children:[(0,o.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,o.jsx)("textarea",{id:`${n}-setup-map-prompt`,className:`${n}-textarea`,value:to,maxLength:1500,disabled:ba,onChange:u=>Ru(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-negative`,children:[(0,o.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,o.jsx)("textarea",{id:`${n}-setup-map-negative`,className:`${n}-textarea`,value:ao,maxLength:1500,disabled:ba,onChange:u=>Mu(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ba||to===i?.settings.townMapLayoutPrompt&&ao===i?.settings.townMapNegativePrompt,onClick:()=>{Ru(i?.settings.townMapLayoutPrompt??""),Mu(i?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ba||fa.trim().length===0,onClick:()=>{Kx()},children:ba?"Generating map\u2026":ic==="generate"?"Generate again":"Generate map"})})]}):null,ht==="upload"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:ba,"aria-label":"Choose a village map image",onChange:u=>{let g=u.target.files?.[0];u.target.value="",Wx(g)}}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,ht==="none"?(0,o.jsx)("p",{className:`${n}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image in Village Settings \u2192 Village Map later."}):null,Rs&&ht!=="none"&&ic===ht&&ef?(0,o.jsx)("p",{className:`${n}-hint`,"data-tone":pg(Rs).tone,children:pg(Rs).text}):null]}):null,Je===3&&i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"Existing Venues keep their locations. Use Village Settings \u2192 Village Map to reposition them with a replacement map, and View Venue to edit their details."}):null,Je===3&&!i?.isFounded?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Place your village"}),(0,o.jsxs)("label",{className:n+"-label",children:["Villager homes",(0,o.jsx)("select",{"aria-label":"Number of villager homes",value:Cn,onChange:u=>{let g=Number(u.target.value);Ug(g);let E=Ve.filter(M=>M.classes?.includes("residence")).length;Si(E<1+g),Fr(E>=1+g&&!Ve.some(M=>M.category==="public-center"))},children:[1,2,3].map(u=>(0,o.jsx)("option",{value:u,children:u},u))})]}),(0,o.jsxs)("label",{children:["Home image default",(0,o.jsxs)("select",{"aria-label":"Home image default",value:En?"personalized":"generic",onChange:u=>ec(u.target.value==="personalized"),children:[(0,o.jsx)("option",{value:"personalized",children:"Personalized homes"}),(0,o.jsx)("option",{value:"generic",children:"Generic homes"})]})]}),(0,o.jsx)("p",{role:"status",children:Ts?"Select a new spot for this venue.":$s?Ve.some(u=>u.occupancy.playerHome)?"Select a spot for the next villager home.":"Select a spot for your home.":Qr?"Select a spot for the Gathering Venue.":"Your venues are placed. Review the village when ready."}),Ve.filter(u=>u.classes?.includes("residence")).length>1+Cn?(0,o.jsx)("p",{role:"alert",children:"Completed homes are kept when you lower the count. You can review these homes or remove one explicitly."}):null,(0,o.jsx)("div",{className:n+"-setup-venue-list",children:Ve.map(u=>(0,o.jsxs)("button",{type:"button",className:n+"-setup-venue-card",onClick:()=>{ti.current=structuredClone(u),mn(u.id),ei(!0),Ee("")},children:[u.name," \xB7 ",lr.includes(u.id)?"Done":"Edit"]},u.id))}),Yg?(0,o.jsx)("p",{role:"alert",className:n+"-error",children:Yg}):null,Lg&&Vt?(0,o.jsx)(Zf,{venue:Vt,tag:n,people:l,assignedIds:Ve.filter(u=>u.id!==Vt.id).map(u=>u.occupancy.residentCharacterId??""),busy:As,problem:Iu,onPatch:u=>{vf(u.id,()=>u),Ee("")},onDone:p$,onCancel:g$,onMove:()=>{ti.current??(ti.current=structuredClone(Vt)),Es(Vt.id),ei(!1),Si(!1),Fr(!1)},onRemove:()=>{let u=Ve.filter(g=>g.id!==Vt.id);s$(Vt.id),ku(g=>g.filter(E=>E!==Vt.id)),Xu(u)},onGenerate:u=>{h$(Vt,u)},onUpload:(u,g)=>{m$(Vt,u,g)}},Vt.id):null,c===null?(0,o.jsx)("p",{children:"Reading your villager library\u2026"}):null]}):null,Je===4?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Village Beginning"}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:kn.trim()})," \xB7 ",fa.trim()]}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Persona:"})," ",P?.find(u=>u.id===x)?.name??"Selected Persona"," \xB7 ",(0,o.jsx)("strong",{children:"Scenario:"})," ",Pr(Kn).label]}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Day 1:"})," ",Qa||"No first-day description was recorded."]}),Cs?(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Original founding direction:"})," ",Cs]}):null]}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Map and lore"}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Map:"})," ",ht==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,o.jsx)("strong",{children:"Lorebooks:"})," ",ca.map(u=>xu?.find(g=>g.id===u)?.name??u).join(", ")||"None"]})]}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Starting places"}),(0,o.jsx)("div",{className:`${n}-setup-venue-list`,children:Ve.map(u=>(0,o.jsxs)("div",{className:`${n}-setup-venue-card`,children:[u.presentation.image?(0,o.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,o.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,o.jsxs)("span",{children:[(0,o.jsxs)("strong",{children:[u.name," \xB7 ",u.category==="public-center"?"Gathering Place":"Residence"]}),(0,o.jsxs)("small",{children:[u.form," \xB7"," ",u.occupancy.playerHome?"You":fn(u.occupancy.residentCharacterId)||"Community"]})]})]},u.id))}),Ve.map(u=>(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsxs)("strong",{children:[u.name,":"]})," ",u.description," ",u.spaces?.[0]?.description]},`${u.id}-summary`))]})]}):null,Iu?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Iu}):null,va?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:va}):null]})}),(0,o.jsxs)("div",{className:`${n}-setup-visual`,children:[Je<=1?(0,o.jsx)(s2,{scenario:Kn}):(0,o.jsx)("div",{className:`${n}-setup-map-shell`,children:(0,o.jsx)("div",{className:`${n}-setup-map-viewport`,tabIndex:0,"aria-label":"Venue placement map. Arrow keys choose a spot; Enter places a venue.",onKeyDown:u=>{u.target!==u.currentTarget||Je!==3||Lg||!($s||Qr||Ts)||(u.key==="Enter"?(u.preventDefault(),bf(Su.x,Su.y)):["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(u.key)&&(u.preventDefault(),px(g=>({x:Math.max(.02,Math.min(.98,g.x+(u.key==="ArrowLeft"?-.025:u.key==="ArrowRight"?.025:0))),y:Math.max(.02,Math.min(.98,g.y+(u.key==="ArrowUp"?-.025:u.key==="ArrowDown"?.025:0)))}))))},children:(0,o.jsx)(fg,{src:dr,alt:`A map of ${kn.trim()||"your new village"}.`,pins:Je<3?[]:k$,placing:Je===3&&!i?.isFounded&&($s||Qr||Ts!==null),view:ht==="existing"?oo:Gl("cover"),shape:ef,onPlace:Je===3&&!i?.isFounded?bf:void 0,compact:Je<2,mobile:t&&Je>=2,photoPins:Je>=3,placementCursor:Je===3?Su:void 0})})}),(0,o.jsxs)("nav",{className:`${n}-setup-footer`,"aria-label":"Founding navigation",children:[Je>0?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W||ba||As,onClick:()=>yf(Je-1),children:"\u2190 Back"}):null,Je<hu.length-1?(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:W||ba||As,onClick:()=>yf(Je+1),children:Je===3?"Review village":"Next \u2192"}):(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:W||ba||!i,onClick:()=>{f$()},children:i?.isFounded?"Save this village":"Found the village"}),i?.isFounded?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:W,onClick:()=>{Si(!1),q("home")},children:"Show me the village"}):null]})]})]})})}return(0,o.jsxs)("div",{className:`${n}-root ${n}-home ${n}-home-full`,"data-mobile":t?"true":"false",children:[(0,o.jsxs)("div",{className:`${n}-home-bar`,children:[(0,o.jsx)(Fk,{weather:i?.village.weather??""}),!t&&i?.isFounded&&vs(i.settings.venues).length>0?(0,o.jsxs)("div",{className:`${n}-places-picker`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-expanded":Q,"aria-controls":`${n}-places-list`,disabled:W,onClick:()=>{Me(null),qe(l=>!l)},children:"Places"}),Q?(0,o.jsx)("div",{id:`${n}-places-list`,className:`${n}-places-list`,children:i.settings.venues.map(l=>(0,o.jsxs)("div",{className:`${n}-places-list-row`,children:[(0,o.jsx)("span",{className:`${n}-places-list-name`,children:l.name}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Gu(l),children:"View venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{fc(l)},children:"Visit"})]},l.id))}):null]}):null,(0,o.jsxs)("span",{className:`${n}-home-bar-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-mobile-board-button`,"aria-label":`Noticeboard (${i?.noticeboard.length??0})`,disabled:!i||W,onClick:()=>Ut("noticeboard"),children:(0,o.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),i?.isFounded?(0,o.jsx)(Wk,{happenings:i.happenings,recap:i.recap,mobile:t}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:W||!i,onClick:()=>{rt("index"),q("menu")},children:"\u2630"}),t?null:(0,o.jsx)(Kk,{}),de?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{He("")},children:"Cancel placement"}):null]})]}),(0,o.jsx)("div",{className:`${n}-room`,children:(0,o.jsx)("div",{className:`${n}-home-map-viewport`,children:(0,o.jsx)(fg,{src:no||null,alt:`A map of ${i?.village.name??"the village"}.`,pins:S$,placing:!!de,view:oo,shape:Wg,onPlace:(l,u)=>{if(!de)return;let g=de;se(!0),bt(""),j(`/projects/${encodeURIComponent(g)}/place`,{method:"POST",body:JSON.stringify({x:l,y:u})}).then(E=>{r(E),He(""),Ne(g),Ut("projects")}).catch(E=>bt(X(E,"The blueprint could not be placed here."))).finally(()=>se(!1))},onDismiss:()=>{Me(null),qe(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Ci||va||qu||Uu?(0,o.jsxs)("div",{className:`${n}-notice`,children:[Ci?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Ci}):null,va?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:va}):null,qu?(0,o.jsxs)("span",{className:`${n}-status`,children:["Catching up on what ",i?.village.name??"the village"," has been doing\u2026"]}):null,Uu?(0,o.jsx)("p",{className:`${n}-status`,children:Uu}):null]}):null})})})]})}var $g=class extends HTMLElement{connectedCallback(){xg(),this.__root??(this.__root=(0,K1.createRoot)(this)),this.__root.render((0,o.jsx)(wg,{element:this,children:(0,o.jsx)(k2,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),xg()})}};function k2({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let i=()=>t(r=>r+1);return e.addEventListener("marinara-capability-props",i),()=>e.removeEventListener("marinara-capability-props",i)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,o.jsx)(A2,{props:e.capabilityProps??{}}):a==="toolbar"?(0,o.jsx)(E2,{props:e.capabilityProps??{}}):(0,o.jsx)(S2,{element:e})}function C2(){return(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,o.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,o.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,o.jsx)("path",{d:"M9.5 16.5h5"})]})}var T2="marinara-active-chat-id";function rx(){try{window.localStorage.removeItem(T2)}catch{}window.location.reload()}function ox(e,t){let[a,i]=(0,m.useState)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(s(!1),i(null),!t)return;let c=new AbortController;return(async()=>{try{let d=await j(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;i(d??null),s(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:r}}function E2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",i=e.mobileCompact===!0,r=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:s,known:c}=ox(t,a&&t.length>0),[d,h]=(0,m.useState)(!1),p=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!d)return;let y=z=>{p.current?.contains(z.target)||h(!1)},V=z=>{z.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",y),document.addEventListener("keydown",V),()=>{document.removeEventListener("pointerdown",y),document.removeEventListener("keydown",V)}},[d]),!a||!c||s===null)return null;let b=s.name||"your villager",$=s.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${$}`;return(0,o.jsxs)("span",{className:`${n}-tracker`,"data-compact":i,"data-open":d,ref:p,children:[(0,o.jsxs)("button",{type:"button",className:r?`${r} ${n}-tracker-chip`:`${n}-button ${n}-tracker-chip`,onClick:()=>h(y=>!y),"aria-haspopup":"menu","aria-expanded":d,title:f,"aria-label":f,children:[(0,o.jsx)(C2,{}),(0,o.jsx)("span",{className:`${n}-tracker-label`,children:"Villages"})]}),d?(0,o.jsxs)("div",{className:`${n}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${$}`,children:[(0,o.jsxs)("p",{className:`${n}-tracker-menu-title`,children:["This roleplay spun off from ",$]}),s.resident?(0,o.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[b," still lives there. ",$," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,o.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[b," does not live in ",$," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,o.jsx)("div",{className:`${n}-tracker-menu-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:rx,title:`Leaves this chat and opens Marinara's home screen, where the ${$} tab is waiting.`,children:"Open the village"})})]}):null]})}function A2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:i,known:r}=ox(t,a&&t.length>0);if(!a||!r)return null;if(i===null)return(0,o.jsx)("div",{className:`${n}-panel-view`,children:(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let s=i.name||"this villager",c=i.villageName||"your village";return(0,o.jsxs)("div",{className:`${n}-panel-view`,children:[(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:i.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${s} does not live there any more. Nothing said here is read by the village either way.`}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Villager"}),(0,o.jsx)("span",{children:s})]}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Chat"}),(0,o.jsx)("span",{children:i.room})]}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Came from"}),(0,o.jsx)("span",{children:c})]}),(0,o.jsx)("div",{className:`${n}-panel-view-actions`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:rx,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(n)||customElements.define(n,$g);
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
