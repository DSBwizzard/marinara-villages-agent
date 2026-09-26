var s1=Object.create;var Cc=Object.defineProperty;var u1=Object.getOwnPropertyDescriptor;var c1=Object.getOwnPropertyNames;var d1=Object.getPrototypeOf,h1=Object.prototype.hasOwnProperty;var m1=(e,t,a)=>t in e?Cc(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var Ra=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var f1=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of c1(t))!h1.call(e,o)&&o!==a&&Cc(e,o,{get:()=>t[o],enumerable:!(n=u1(t,o))||n.enumerable});return e};var Fr=(e,t,a)=>(a=e!=null?s1(d1(e)):{},f1(t||!e||!e.__esModule?Cc(a,"default",{value:e,enumerable:!0}):a,e));var Yf=(e,t,a)=>m1(e,typeof t!="symbol"?t+"":t,a);var ag=Ra(K=>{"use strict";var Mc=Symbol.for("react.transitional.element"),g1=Symbol.for("react.portal"),p1=Symbol.for("react.fragment"),b1=Symbol.for("react.strict_mode"),v1=Symbol.for("react.profiler"),y1=Symbol.for("react.consumer"),w1=Symbol.for("react.context"),x1=Symbol.for("react.forward_ref"),$1=Symbol.for("react.suspense"),N1=Symbol.for("react.memo"),Zf=Symbol.for("react.lazy"),S1=Symbol.for("react.activity"),T1=Symbol.for("react.view_transition"),jf=Symbol.iterator;function E1(e){return e===null||typeof e!="object"?null:(e=jf&&e[jf]||e["@@iterator"],typeof e=="function"?e:null)}var Kf={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Jf=Object.assign,Ff={};function Zi(e,t,a){this.props=e,this.context=t,this.refs=Ff,this.updater=a||Kf}Zi.prototype.isReactComponent={};Zi.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Zi.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Pf(){}Pf.prototype=Zi.prototype;function Oc(e,t,a){this.props=e,this.context=t,this.refs=Ff,this.updater=a||Kf}var Rc=Oc.prototype=new Pf;Rc.constructor=Oc;Jf(Rc,Zi.prototype);Rc.isPureReactComponent=!0;var If=Array.isArray;function zc(){}var xe={H:null,A:null,T:null,S:null},Wf=Object.prototype.hasOwnProperty;function Vc(e,t,a){var n=a.ref;return{$$typeof:Mc,type:e,key:t,ref:n!==void 0?n:null,props:a}}function k1(e,t){return Vc(e.type,t,e.props)}function Dc(e){return typeof e=="object"&&e!==null&&e.$$typeof===Mc}function C1(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var Xf=/\/+/g;function Ac(e,t){return typeof e=="object"&&e!==null&&e.key!=null?C1(""+e.key):t.toString(36)}function A1(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(zc,zc):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Qi(e,t,a,n,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var s=!1;if(e===null)s=!0;else switch(l){case"bigint":case"string":case"number":s=!0;break;case"object":switch(e.$$typeof){case Mc:case g1:s=!0;break;case Zf:return s=e._init,Qi(s(e._payload),t,a,n,o)}}if(s)return o=o(e),s=n===""?"."+Ac(e,0):n,If(o)?(a="",s!=null&&(a=s.replace(Xf,"$&/")+"/"),Qi(o,t,a,"",function(g){return g})):o!=null&&(Dc(o)&&(o=k1(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(Xf,"$&/")+"/")+s)),t.push(o)),1;s=0;var c=n===""?".":n+":";if(If(e))for(var h=0;h<e.length;h++)n=e[h],l=c+Ac(n,h),s+=Qi(n,t,a,l,o);else if(h=E1(e),typeof h=="function")for(e=h.call(e),h=0;!(n=e.next()).done;)n=n.value,l=c+Ac(n,h++),s+=Qi(n,t,a,l,o);else if(l==="object"){if(typeof e.then=="function")return Qi(A1(e),t,a,n,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return s}function Pr(e,t,a){if(e==null)return e;var n=[],o=0;return Qi(e,n,"","",function(l){return t.call(a,l,o++)}),n}function z1(e){if(e._status===-1){var t=e._result,a=t();a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n,a.status===void 0&&(a.status="fulfilled",a.value=n))},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n,a.status===void 0&&(a.status="rejected",a.reason=n))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var Qf=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function eg(e){var t=xe.T,a={};a.types=t!==null?t.types:null,xe.T=a;try{var n=e(),o=xe.S;o!==null&&o(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(zc,Qf)}catch(l){Qf(l)}finally{t!==null&&a.types!==null&&(t.types=a.types),xe.T=t}}function tg(e){var t=xe.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else eg(tg.bind(null,e))}var M1={map:Pr,forEach:function(e,t,a){Pr(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Pr(e,function(){t++}),t},toArray:function(e){return Pr(e,function(t){return t})||[]},only:function(e){if(!Dc(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};K.Activity=S1;K.Children=M1;K.Component=Zi;K.Fragment=p1;K.Profiler=v1;K.PureComponent=Oc;K.StrictMode=b1;K.Suspense=$1;K.ViewTransition=T1;K.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=xe;K.__COMPILER_RUNTIME={__proto__:null,c:function(e){return xe.H.useMemoCache(e)}};K.addTransitionType=tg;K.cache=function(e){return function(){return e.apply(null,arguments)}};K.cacheSignal=function(){return null};K.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var n=Jf({},e.props),o=e.key;if(t!=null)for(l in t.key!==void 0&&(o=""+t.key),t)!Wf.call(t,l)||l==="key"||l==="__self"||l==="__source"||l==="ref"&&t.ref===void 0||(n[l]=t[l]);var l=arguments.length-2;if(l===1)n.children=a;else if(1<l){for(var s=Array(l),c=0;c<l;c++)s[c]=arguments[c+2];n.children=s}return Vc(e.type,o,n)};K.createContext=function(e){return e={$$typeof:w1,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:y1,_context:e},e};K.createElement=function(e,t,a){var n,o={},l=null;if(t!=null)for(n in t.key!==void 0&&(l=""+t.key),t)Wf.call(t,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(o[n]=t[n]);var s=arguments.length-2;if(s===1)o.children=a;else if(1<s){for(var c=Array(s),h=0;h<s;h++)c[h]=arguments[h+2];o.children=c}if(e&&e.defaultProps)for(n in s=e.defaultProps,s)o[n]===void 0&&(o[n]=s[n]);return Vc(e,l,o)};K.createRef=function(){return{current:null}};K.forwardRef=function(e){return{$$typeof:x1,render:e}};K.isValidElement=Dc;K.lazy=function(e){return{$$typeof:Zf,_payload:{_status:-1,_result:e},_init:z1}};K.memo=function(e,t){return{$$typeof:N1,type:e,compare:t===void 0?null:t}};K.startTransition=eg;K.unstable_useCacheRefresh=function(){return xe.H.useCacheRefresh()};K.use=function(e){return xe.H.use(e)};K.useActionState=function(e,t,a){return xe.H.useActionState(e,t,a)};K.useCallback=function(e,t){return xe.H.useCallback(e,t)};K.useContext=function(e){return xe.H.useContext(e)};K.useDebugValue=function(){};K.useDeferredValue=function(e,t){return xe.H.useDeferredValue(e,t)};K.useEffect=function(e,t){return xe.H.useEffect(e,t)};K.useEffectEvent=function(e){return xe.H.useEffectEvent(e)};K.useId=function(){return xe.H.useId()};K.useImperativeHandle=function(e,t,a){return xe.H.useImperativeHandle(e,t,a)};K.useInsertionEffect=function(e,t){return xe.H.useInsertionEffect(e,t)};K.useLayoutEffect=function(e,t){return xe.H.useLayoutEffect(e,t)};K.useMemo=function(e,t){return xe.H.useMemo(e,t)};K.useOptimistic=function(e,t){return xe.H.useOptimistic(e,t)};K.useReducer=function(e,t,a){return xe.H.useReducer(e,t,a)};K.useRef=function(e){return xe.H.useRef(e)};K.useState=function(e){return xe.H.useState(e)};K.useSyncExternalStore=function(e,t,a){return xe.H.useSyncExternalStore(e,t,a)};K.useTransition=function(){return xe.H.useTransition()};K.version="19.3.0"});var Wr=Ra((U5,ng)=>{"use strict";ng.exports=ag()});var mg=Ra(ke=>{"use strict";function qc(e,t){var a=e.length;e.push(t);e:for(;0<a;){var n=a-1>>>1,o=e[n];if(0<es(o,t))e[n]=t,e[a]=o,a=n;else break e}}function Va(e){return e.length===0?null:e[0]}function as(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var n=0,o=e.length,l=o>>>1;n<l;){var s=2*(n+1)-1,c=e[s],h=s+1,g=e[h];if(0>es(c,a))h<o&&0>es(g,c)?(e[n]=g,e[h]=a,n=h):(e[n]=c,e[s]=a,n=s);else if(h<o&&0>es(g,a))e[n]=g,e[h]=a,n=h;else break e}}return t}function es(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}ke.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(ig=performance,ke.unstable_now=function(){return ig.now()}):(_c=Date,og=_c.now(),ke.unstable_now=function(){return _c.now()-og});var ig,_c,og,Fa=[],wn=[],O1=1,aa=null,dt=3,Lc=!1,dl=!1,hl=!1,Bc=!1,sg=typeof setTimeout=="function"?setTimeout:null,ug=typeof clearTimeout=="function"?clearTimeout:null,lg=typeof setImmediate<"u"?setImmediate:null;function ts(e){for(var t=Va(wn);t!==null;){if(t.callback===null)as(wn);else if(t.startTime<=e)as(wn),t.sortIndex=t.expirationTime,qc(Fa,t);else break;t=Va(wn)}}function Gc(e){if(hl=!1,ts(e),!dl)if(Va(Fa)!==null)dl=!0,Ji||(Ji=!0,Ki());else{var t=Va(wn);t!==null&&Yc(Gc,t.startTime-e)}}var Ji=!1,ml=-1,cg=5,dg=-1;function hg(){return Bc?!0:!(ke.unstable_now()-dg<cg)}function Hc(){if(Bc=!1,Ji){var e=ke.unstable_now();dg=e;var t=!0;try{e:{dl=!1,hl&&(hl=!1,ug(ml),ml=-1),Lc=!0;var a=dt;try{t:{for(ts(e),aa=Va(Fa);aa!==null&&!(aa.expirationTime>e&&hg());){var n=aa.callback;if(typeof n=="function"){aa.callback=null,dt=aa.priorityLevel;var o=n(aa.expirationTime<=e);if(e=ke.unstable_now(),typeof o=="function"){aa.callback=o,ts(e),t=!0;break t}aa===Va(Fa)&&as(Fa),ts(e)}else as(Fa);aa=Va(Fa)}if(aa!==null)t=!0;else{var l=Va(wn);l!==null&&Yc(Gc,l.startTime-e),t=!1}}break e}finally{aa=null,dt=a,Lc=!1}t=void 0}}finally{t?Ki():Ji=!1}}}var Ki;typeof lg=="function"?Ki=function(){lg(Hc)}:typeof MessageChannel<"u"?(Uc=new MessageChannel,rg=Uc.port2,Uc.port1.onmessage=Hc,Ki=function(){rg.postMessage(null)}):Ki=function(){sg(Hc,0)};var Uc,rg;function Yc(e,t){ml=sg(function(){e(ke.unstable_now())},t)}ke.unstable_IdlePriority=5;ke.unstable_ImmediatePriority=1;ke.unstable_LowPriority=4;ke.unstable_NormalPriority=3;ke.unstable_Profiling=null;ke.unstable_UserBlockingPriority=2;ke.unstable_cancelCallback=function(e){e.callback=null};ke.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):cg=0<e?Math.floor(1e3/e):5};ke.unstable_getCurrentPriorityLevel=function(){return dt};ke.unstable_next=function(e){switch(dt){case 1:case 2:case 3:var t=3;break;default:t=dt}var a=dt;dt=t;try{return e()}finally{dt=a}};ke.unstable_requestPaint=function(){Bc=!0};ke.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=dt;dt=e;try{return t()}finally{dt=a}};ke.unstable_scheduleCallback=function(e,t,a){var n=ke.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:O1++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>n?(e.sortIndex=a,qc(wn,e),Va(Fa)===null&&e===Va(wn)&&(hl?(ug(ml),ml=-1):hl=!0,Yc(Gc,a-n))):(e.sortIndex=o,qc(Fa,e),dl||Lc||(dl=!0,Ji||(Ji=!0,Ki()))),e};ke.unstable_shouldYield=hg;ke.unstable_wrapCallback=function(e){var t=dt;return function(){var a=dt;dt=t;try{return e.apply(this,arguments)}finally{dt=a}}}});var gg=Ra((L5,fg)=>{"use strict";fg.exports=mg()});var vg=Ra(ht=>{"use strict";var R1=Wr();function bg(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function xn(){}var yt={d:{f:xn,r:function(){throw Error(bg(522))},D:xn,C:xn,L:xn,m:xn,X:xn,S:xn,M:xn},p:0,findDOMNode:null},V1=Symbol.for("react.portal"),D1=Symbol.for("react.recoverable"),pg=Symbol.for("react.optimistic_key");function _1(e,t,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:V1,key:n==null?null:n===pg?pg:""+n,children:e,containerInfo:t,implementation:a}}var fl=R1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function ns(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}ht.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=yt;ht.browser=function(e){return{$$typeof:D1,_reason:e}};ht.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(bg(299));return _1(e,t,null,a)};ht.flushSync=function(e){var t=fl.T,a=yt.p;try{if(fl.T=null,yt.p=2,e)return e()}finally{fl.T=t,yt.p=a,yt.d.f()}};ht.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,yt.d.C(e,t))};ht.prefetchDNS=function(e){typeof e=="string"&&yt.d.D(e)};ht.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,n=ns(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,l=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?yt.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:n,integrity:o,fetchPriority:l}):a==="script"&&yt.d.X(e,{crossOrigin:n,integrity:o,fetchPriority:l,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};ht.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=ns(t.as,t.crossOrigin);yt.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&yt.d.M(e)};ht.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,n=ns(a,t.crossOrigin);yt.d.L(e,a,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};ht.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=ns(t.as,t.crossOrigin);yt.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else yt.d.m(e)};ht.requestFormReset=function(e){yt.d.r(e)};ht.unstable_batchedUpdates=function(e,t){return e(t)};ht.useFormState=function(e,t,a){return fl.H.useFormState(e,t,a)};ht.useFormStatus=function(){return fl.H.useHostTransitionStatus()};ht.version="19.3.0"});var xg=Ra((G5,wg)=>{"use strict";function yg(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(yg)}catch(e){console.error(e)}}yg(),wg.exports=vg()});var rw=Ra(Uu=>{"use strict";var je=gg(),lb=Wr(),H1=xg();function C(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function rb(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function tr(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function sb(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function ub(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function $g(e){if(tr(e)!==e)throw Error(C(188))}function U1(e){var t=e.alternate;if(!t){if(t=tr(e),t===null)throw Error(C(188));return t!==e?null:e}for(var a=e,n=t;;){var o=a.return;if(o===null)break;var l=o.alternate;if(l===null){if(n=o.return,n!==null){a=n;continue}break}if(o.child===l.child){for(l=o.child;l;){if(l===a)return $g(o),e;if(l===n)return $g(o),t;l=l.sibling}throw Error(C(188))}if(a.return!==n.return)a=o,n=l;else{for(var s=!1,c=o.child;c;){if(c===a){s=!0,a=o,n=l;break}if(c===n){s=!0,n=o,a=l;break}c=c.sibling}if(!s){for(c=l.child;c;){if(c===a){s=!0,a=l,n=o;break}if(c===n){s=!0,n=l,a=o;break}c=c.sibling}if(!s)throw Error(C(189))}}if(a.alternate!==n)throw Error(C(190))}if(a.tag!==3)throw Error(C(188));return a.stateNode.current===a?e:t}function cb(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=cb(e),t!==null)return t;e=e.sibling}return null}function Rt(e,t,a,n,o,l){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,n,o,l)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Rt(e.child,t,a,n,o,l))return!0;e=e.sibling}return!1}function Ti(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Ng(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function db(e){var t=[null,null],a=Ti(e);return a===null||hb(t,e,a.child,{foundSelf:!1}),t}function hb(e,t,a,n){for(;a!==null;){if(a===t)n.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(n.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&hb(e,t,a.child,n))return!0;a=a.sibling}return!1}function Ye(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(C(559))}}var no=null,xd=null;function q1(e,t,a){return e===a?!0:e===t?(no=e,!0):!1}function L1(e,t,a){return e===a?(xd=e,!1):e===t?(xd!==null&&(no=e),!0):!1}function Sg(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function $d(e,t,a){for(var n=0,o=e;o;o=a(o))n++;o=0;for(var l=t;l;l=a(l))o++;for(;0<n-o;)e=a(e),n--;for(;0<o-n;)t=a(t),o--;for(;n--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var ye=Object.assign,B1=Symbol.for("react.element"),is=Symbol.for("react.transitional.element"),xl=Symbol.for("react.portal"),io=Symbol.for("react.fragment"),mb=Symbol.for("react.strict_mode"),Nd=Symbol.for("react.profiler"),fb=Symbol.for("react.consumer"),La=Symbol.for("react.context"),Oh=Symbol.for("react.forward_ref"),Sd=Symbol.for("react.suspense"),Td=Symbol.for("react.suspense_list"),Rh=Symbol.for("react.memo"),Tn=Symbol.for("react.lazy"),Ed=Symbol.for("react.activity"),G1=Symbol.for("react.legacy_hidden"),Y1=Symbol.for("react.memo_cache_sentinel"),kd=Symbol.for("react.view_transition"),j1=Symbol.for("react.recoverable"),Tg=Symbol.iterator;function gl(e){return e===null||typeof e!="object"?null:(e=Tg&&e[Tg]||e["@@iterator"],typeof e=="function"?e:null)}var I1=Symbol.for("react.client.reference");function Cd(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===I1?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case io:return"Fragment";case Nd:return"Profiler";case mb:return"StrictMode";case Sd:return"Suspense";case Td:return"SuspenseList";case Ed:return"Activity";case kd:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case xl:return"Portal";case La:return e.displayName||"Context";case fb:return(e._context.displayName||"Context")+".Consumer";case Oh:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Rh:return t=e.displayName||null,t!==null?t:Cd(e.type)||"Memo";case Tn:t=e._payload,e=e._init;try{return Cd(e(t))}catch{}}return null}var $l=Array.isArray,Z=lb.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,re=H1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,hi={pending:!1,data:null,method:null,action:null},Ad=[],oo=-1;function Qa(e){return{current:e}}function nt(e){0>oo||(e.current=Ad[oo],Ad[oo]=null,oo--)}function Se(e,t){oo++,Ad[oo]=e.current,e.current=t}var ja=Qa(null),ql=Qa(null),Vn=Qa(null),js=Qa(null);function Is(e,t){switch(Se(Vn,t),Se(ql,e),Se(ja,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?qp(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=qp(t),e=_y(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}nt(ja),Se(ja,e)}function Eo(){nt(ja),nt(ql),nt(Vn)}function zd(e){var t=e.memoizedState;t!==null&&(_o._currentValue=t.memoizedState,Se(js,e)),t=ja.current;var a=_y(t,e.type);t!==a&&(Se(ql,e),Se(ja,a))}function Xs(e){ql.current===e&&(nt(ja),nt(ql)),js.current===e&&(nt(js),_o._currentValue=hi)}var jc,Eg;function Nn(e){if(jc===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);jc=t&&t[1]||"",Eg=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+jc+e+Eg}var Ic=!1;function Xc(e,t){if(!e||Ic)return"";Ic=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var $=function(){throw Error()};if(Object.defineProperty($.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct($,[])}catch(A){var f=A}Reflect.construct(e,[],$)}else{try{$.call()}catch(A){f=A}$=!1;try{var y=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),$=!0,new e}finally{$&&(y!==void 0?Object.defineProperty(e.prototype,"props",y):delete e.prototype.props)}}}else{try{throw Error()}catch(A){f=A}($=e())&&typeof $.catch=="function"&&$.catch(function(){})}}catch(A){if(A&&f&&typeof A.stack=="string")return[A.stack,f.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var l=n.DetermineComponentFrameRoot(),s=l[0],c=l[1];if(s&&c){var h=s.split(`
`),g=c.split(`
`);for(o=n=0;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;for(;o<g.length&&!g[o].includes("DetermineComponentFrameRoot");)o++;if(n===h.length||o===g.length)for(n=h.length-1,o=g.length-1;1<=n&&0<=o&&h[n]!==g[o];)o--;for(;1<=n&&0<=o;n--,o--)if(h[n]!==g[o]){if(n!==1||o!==1)do if(n--,o--,0>o||h[n]!==g[o]){var w=`
`+h[n].replace(" at new "," at ");return e.displayName&&w.includes("<anonymous>")&&(w=w.replace("<anonymous>",e.displayName)),w}while(1<=n&&0<=o);break}}}finally{Ic=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Nn(a):""}function X1(e,t){switch(e.tag){case 26:case 27:case 5:return Nn(e.type);case 16:return Nn("Lazy");case 13:return e.child!==t&&t!==null?Nn("Suspense Fallback"):Nn("Suspense");case 19:return Nn("SuspenseList");case 0:case 15:return Xc(e.type,!1);case 11:return Xc(e.type.render,!1);case 1:return Xc(e.type,!0);case 31:return Nn("Activity");case 30:return Nn("ViewTransition");default:return""}}function kg(e){try{var t="",a=null;do t+=X1(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var Md=Object.prototype.hasOwnProperty,Vh=je.unstable_scheduleCallback,Qc=je.unstable_cancelCallback,Q1=je.unstable_shouldYield,Z1=je.unstable_requestPaint,Gt=je.unstable_now,K1=je.unstable_getCurrentPriorityLevel,gb=je.unstable_ImmediatePriority,pb=je.unstable_UserBlockingPriority,Qs=je.unstable_NormalPriority,J1=je.unstable_LowPriority,bb=je.unstable_IdlePriority,F1=je.log,P1=je.unstable_setDisableYieldValue,ar=null,Yt=null;function Cn(e){if(typeof F1=="function"&&P1(e),Yt&&typeof Yt.setStrictMode=="function")try{Yt.setStrictMode(ar,e)}catch{}}var jt=Math.clz32?Math.clz32:tx,W1=Math.log,ex=Math.LN2;function tx(e){return e>>>=0,e===0?32:31-(W1(e)/ex|0)|0}var os=256,ls=262144,rs=4194304;function ri(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function yu(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var o=0,l=e.suspendedLanes,s=e.pingedLanes;e=e.warmLanes;var c=n&134217727;return c!==0?(n=c&~l,n!==0?o=ri(n):(s&=c,s!==0?o=ri(s):a||(a=c&~e,a!==0&&(o=ri(a))))):(c=n&~l,c!==0?o=ri(c):s!==0?o=ri(s):a||(a=n&~e,a!==0&&(o=ri(a)))),o===0?0:t!==0&&t!==o&&(t&l)===0&&(l=o&-o,a=t&-t,l>=a||l===32&&(a&4194048)!==0)?t:o}function nr(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function vb(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-jt(a),o=1<<n;t|=e[n],a&=~o}return t}function ax(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function yb(){var e=rs;return rs<<=1,(rs&62914560)===0&&(rs=4194304),e}function Zc(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function ir(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function nx(e,t,a,n,o,l){var s=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var c=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=s&~a;0<a;){var w=31-jt(a),$=1<<w;c[w]=0,h[w]=-1;var f=g[w];if(f!==null)for(g[w]=null,w=0;w<f.length;w++){var y=f[w];y!==null&&(y.lane&=-536870913)}a&=~$}n!==0&&wb(e,n,0),l!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=l&~(s&~t))}function wb(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-jt(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function xb(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-jt(a),o=1<<n;o&t|e[n]&t&&(e[n]|=t),a&=~o}}function $b(e,t){var a=t&-t;return a=(a&42)!==0?1:Dh(a),(a&(e.suspendedLanes|t))!==0?0:a}function Dh(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function _h(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Nb(){var e=re.p;return e!==0?e:(e=window.event,e===void 0?32:iw(e.type))}function Cg(e,t){var a=re.p;try{return re.p=e,t()}finally{re.p=a}}var dn=Math.random().toString(36).slice(2),tt="__reactFiber$"+dn,Vt="__reactProps$"+dn,qo="__reactContainer$"+dn,Ag="__reactEvents$"+dn,ix="__reactListeners$"+dn,ox="__reactHandles$"+dn,zg="__reactResources$"+dn,or="__reactMarker$"+dn,Zs="__reactLoad$"+dn;function wu(e){delete e[tt],delete e[Vt],delete e[ix],delete e[ox]}function ci(e){var t;if(t=e[tt])return t;for(var a=e.parentNode;a;){if(t=a[qo]||a[tt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=Qp(e);e!==null;){if(a=e[tt])return a;e=Qp(e)}return t}e=a,a=e.parentNode}return null}function Lo(e){if(e=e[tt]||e[qo]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Nl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(C(33))}function po(e){var t=e[zg];return t||(t=e[zg]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function Ke(e){e[or]=!0}function Sb(e){e[Zs]=void 0}var Tb=new Set,Eb={};function Ei(e,t){ko(e,t),ko(e+"Capture",t)}function ko(e,t){for(Eb[e]=t,e=0;e<t.length;e++)Tb.add(t[e])}var lx=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Mg={},Og={};function rx(e){return Md.call(Og,e)?!0:Md.call(Mg,e)?!1:lx.test(e)?Og[e]=!0:(Mg[e]=!0,!1)}var oe=!1;function Rg(){var e=oe;return oe=!1,e}function Ts(e,t,a){if(rx(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function ss(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function Pa(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,n)}}function Ut(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function kb(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function sx(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(s){a=""+s,l.call(this,s)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(s){a=""+s},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Od(e){if(!e._valueTracker){var t=kb(e)?"checked":"value";e._valueTracker=sx(e,t,""+e[t])}}function Cb(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=kb(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}var ux=/[\n"\\]/g;function ra(e){return e.replace(ux,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Rd(e,t,a,n,o,l,s,c){e.name="",s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?e.type=s:e.removeAttribute("type"),t!=null?s==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Ut(t)):e.value!==""+Ut(t)&&(e.value=""+Ut(t)):s!=="submit"&&s!=="reset"||e.removeAttribute("value"),t!=null?s==="number"&&e.value==t?Kc(e,Ut(e.value)):Kc(e,Ut(t)):a!=null?Kc(e,Ut(a)):n!=null&&e.removeAttribute("value"),o==null&&l!=null&&(e.defaultChecked=!!l),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.name=""+Ut(c):e.removeAttribute("name")}function Ab(e,t,a,n,o,l,s,c){if(l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"&&(e.type=l),t!=null||a!=null){if(!(l!=="submit"&&l!=="reset"||t!=null)){Od(e);return}a=a!=null?""+Ut(a):"",t=t!=null?""+Ut(t):a,c||t===e.value||(e.value=t),e.defaultValue=t}n=n??o,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=c?e.checked:!!n,e.defaultChecked=!!n,s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.name=s),Od(e)}function Kc(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function bo(e,t,a,n){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&n&&(e[a].defaultSelected=!0)}else{for(a=""+Ut(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,n&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function zb(e,t,a){if(t!=null&&(t=""+Ut(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+Ut(a):""}function Mb(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(C(92));if($l(n)){if(1<n.length)throw Error(C(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=Ut(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),Od(e)}function Co(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var cx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Vg(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||cx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Ob(e,t,a){if(t!=null&&typeof t!="object")throw Error(C(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="",oe=!0);for(var o in t)n=t[o],t.hasOwnProperty(o)&&a[o]!==n&&(Vg(e,o,n),oe=!0)}else for(var l in t)t.hasOwnProperty(l)&&Vg(e,l,t[l])}function Hh(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var dx=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),hx=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Es(e){return hx.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Ba(){}var Vd=null;function Uh(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var lo=null,vo=null;function Dg(e){var t=Lo(e);if(t&&(e=t.stateNode)){var a=e[Vt]||null;e:switch(e=t.stateNode,t.type){case"input":if(Rd(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+ra(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var o=n[Vt]||null;if(!o)throw Error(C(90));Rd(n,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&Cb(n)}break e;case"textarea":zb(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&bo(e,!!a.multiple,t,!1)}}}var Jc=!1;function Rb(e,t,a){if(Jc)return e(t,a);Jc=!0;try{var n=e(t);return n}finally{if(Jc=!1,(lo!==null||vo!==null)&&(Vu(),lo&&(t=lo,e=vo,vo=lo=null,Dg(t),e)))for(t=0;t<e.length;t++)Dg(e[t])}}function Ll(e,t){var a=e.stateNode;if(a===null)return null;var n=a[Vt]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(C(231,t,typeof a));return a}var on=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Dd=!1;if(on)try{Fi={},Object.defineProperty(Fi,"passive",{get:function(){Dd=!0}}),window.addEventListener("test",Fi,Fi),window.removeEventListener("test",Fi,Fi)}catch{Dd=!1}var Fi,An=null,qh=null,ks=null;function Vb(){if(ks)return ks;var e,t=qh,a=t.length,n,o="value"in An?An.value:An.textContent,l=o.length;for(e=0;e<a&&t[e]===o[e];e++);var s=a-e;for(n=1;n<=s&&t[a-n]===o[l-n];n++);return ks=o.slice(e,1<n?1-n:void 0)}function Cs(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function us(){return!0}function _g(){return!1}function Nt(e){function t(a,n,o,l,s){this._reactName=a,this._targetInst=o,this.type=n,this.nativeEvent=l,this.target=s,this.currentTarget=null;for(var c in e)e.hasOwnProperty(c)&&(a=e[c],this[c]=a?a(l):l[c]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?us:_g,this.isPropagationStopped=_g,this}return ye(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=us)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=us)},persist:function(){},isPersistent:us}),t}var Kn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},xu=Nt(Kn),lr=ye({},Kn,{view:0,detail:0}),mx=Nt(lr),Fc,Pc,pl,$u=ye({},lr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Lh,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==pl&&(pl&&e.type==="mousemove"?(Fc=e.screenX-pl.screenX,Pc=e.screenY-pl.screenY):Pc=Fc=0,pl=e),Fc)},movementY:function(e){return"movementY"in e?e.movementY:Pc}}),Hg=Nt($u),fx=ye({},$u,{dataTransfer:0}),gx=Nt(fx),px=ye({},lr,{relatedTarget:0}),Wc=Nt(px),bx=ye({},Kn,{animationName:0,elapsedTime:0,pseudoElement:0}),vx=Nt(bx),yx=ye({},Kn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),wx=Nt(yx),xx=ye({},Kn,{data:0}),Ug=Nt(xx),$x={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Nx={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Sx={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Tx(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Sx[e])?!!t[e]:!1}function Lh(){return Tx}var Ex=ye({},lr,{key:function(e){if(e.key){var t=$x[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Cs(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Nx[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Lh,charCode:function(e){return e.type==="keypress"?Cs(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Cs(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),kx=Nt(Ex),Cx=ye({},$u,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),qg=Nt(Cx),Ax=ye({},Kn,{submitter:0}),zx=Nt(Ax),Mx=ye({},lr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Lh}),Ox=Nt(Mx),Rx=ye({},Kn,{propertyName:0,elapsedTime:0,pseudoElement:0}),Vx=Nt(Rx),Dx=ye({},$u,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),_x=Nt(Dx),Hx=ye({},Kn,{newState:0,oldState:0,source:0}),Ux=Nt(Hx),qx=[9,13,27,32],Bh=on&&"CompositionEvent"in window,El=null;on&&"documentMode"in document&&(El=document.documentMode);var Lx=on&&"TextEvent"in window&&!El,Db=on&&(!Bh||El&&8<El&&11>=El),Lg=" ",Bg=!1;function _b(e,t){switch(e){case"keyup":return qx.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Hb(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var ro=!1;function Bx(e,t){switch(e){case"compositionend":return Hb(t);case"keypress":return t.which!==32?null:(Bg=!0,Lg);case"textInput":return e=t.data,e===Lg&&Bg?null:e;default:return null}}function Gx(e,t){if(ro)return e==="compositionend"||!Bh&&_b(e,t)?(e=Vb(),ks=qh=An=null,ro=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Db&&t.locale!=="ko"?null:t.data;default:return null}}var Yx={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Gg(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Yx[e.type]:t==="textarea"}function Ub(e,t,a,n){lo?vo?vo.push(n):vo=[n]:lo=n,t=pu(t,"onChange"),0<t.length&&(a=new xu("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var kl=null,Bl=null;function jx(e){Ry(e,0)}function Nu(e){var t=Nl(e);if(Cb(t))return e}function Yg(e,t){if(e==="change")return t}var qb=!1;on&&(on?(ds="oninput"in document,ds||(ed=document.createElement("div"),ed.setAttribute("oninput","return;"),ds=typeof ed.oninput=="function"),cs=ds):cs=!1,qb=cs&&(!document.documentMode||9<document.documentMode));var cs,ds,ed;function jg(){kl&&(kl.detachEvent("onpropertychange",Lb),Bl=kl=null)}function Lb(e){if(e.propertyName==="value"&&Nu(Bl)){var t=[];Ub(t,Bl,e,Uh(e)),Rb(jx,t)}}function Ix(e,t,a){e==="focusin"?(jg(),kl=t,Bl=a,kl.attachEvent("onpropertychange",Lb)):e==="focusout"&&jg()}function Xx(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Nu(Bl)}function Qx(e,t){if(e==="click")return Nu(t)}function Zx(e,t){if(e==="input"||e==="change")return Nu(t)}function Kx(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Xt=typeof Object.is=="function"?Object.is:Kx;function Gl(e,t){if(Xt(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var o=a[n];if(!Md.call(t,o)||!Xt(e[o],t[o]))return!1}return!0}function _d(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Ig(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Xg(e,t){var a=Ig(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Ig(a)}}function Bb(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Bb(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Gb(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=_d(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=_d(e.document)}return t}function Gh(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Jx=on&&"documentMode"in document&&11>=document.documentMode,so=null,Hd=null,Cl=null,Ud=!1;function Qg(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Ud||so==null||so!==_d(n)||(n=so,"selectionStart"in n&&Gh(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),Cl&&Gl(Cl,n)||(Cl=n,n=pu(Hd,"onSelect"),0<n.length&&(t=new xu("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=so)))}function oi(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var uo={animationend:oi("Animation","AnimationEnd"),animationiteration:oi("Animation","AnimationIteration"),animationstart:oi("Animation","AnimationStart"),transitionrun:oi("Transition","TransitionRun"),transitionstart:oi("Transition","TransitionStart"),transitioncancel:oi("Transition","TransitionCancel"),transitionend:oi("Transition","TransitionEnd")},td={},Yb={};on&&(Yb=document.createElement("div").style,"AnimationEvent"in window||(delete uo.animationend.animation,delete uo.animationiteration.animation,delete uo.animationstart.animation),"TransitionEvent"in window||delete uo.transitionend.transition);function ki(e){if(td[e])return td[e];if(!uo[e])return e;var t=uo[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in Yb)return td[e]=t[a];return e}var jb=ki("animationend"),Ib=ki("animationiteration"),Xb=ki("animationstart"),Fx=ki("transitionrun"),Px=ki("transitionstart"),Wx=ki("transitioncancel"),Qb=ki("transitionend"),Zb=new Map,qd="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");qd.push("scrollEnd");function Na(e,t){Zb.set(e,t),Ei(t,[e])}var e$=0;function ln(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=$a.identifierPrefix;var a=e$++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function Zg(e){if(e==null||typeof e=="string")return e;var t=null,a=To;if(a!==null)for(var n=0;n<a.length;n++){var o=e[a[n]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function hn(e,t){return e=Zg(e),t=Zg(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Ks=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},ia=[],co=0,Yh=0;function Su(){for(var e=co,t=Yh=co=0;t<e;){var a=ia[t];ia[t++]=null;var n=ia[t];ia[t++]=null;var o=ia[t];ia[t++]=null;var l=ia[t];if(ia[t++]=null,n!==null&&o!==null){var s=n.pending;s===null?o.next=o:(o.next=s.next,s.next=o),n.pending=o}l!==0&&Kb(a,o,l)}}function Tu(e,t,a,n){ia[co++]=e,ia[co++]=t,ia[co++]=a,ia[co++]=n,Yh|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function jh(e,t,a,n){return Tu(e,t,a,n),Js(e)}function Ci(e,t){return Tu(e,null,null,t),Js(e)}function Kb(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var o=!1,l=e.return;l!==null;)l.childLanes|=a,n=l.alternate,n!==null&&(n.childLanes|=a),l.tag===22&&(e=l.stateNode,e===null||e._visibility&1||(o=!0)),e=l,l=l.return;return e.tag===3?(l=e.stateNode,o&&t!==null&&(o=31-jt(a),e=l.hiddenUpdates,n=e[o],n===null?e[o]=[t]:n.push(t),t.lane=a|536870912),l):null}function Js(e){if(50<Ul)throw Ul=0,Us=null,Error(C(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var ho={};function t$(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Mt(e,t,a,n){return new t$(e,t,a,n)}function Ih(e){return e=e.prototype,!(!e||!e.isReactComponent)}function an(e,t){var a=e.alternate;return a===null?(a=Mt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Jb(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function As(e,t,a,n,o,l){var s=0;if(n=e,typeof n=="function")Ih(n)&&(s=1);else if(typeof n=="string")s=kN(e,a,ja.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(n){case Ed:return e=Mt(31,a,t,o),e.elementType=Ed,e.lanes=l,e;case io:return mi(a.children,o,l,t);case mb:s=8,o|=24;break;case Nd:return e=Mt(12,a,t,o|2),e.elementType=Nd,e.lanes=l,e;case Sd:return e=Mt(13,a,t,o),e.elementType=Sd,e.lanes=l,e;case Td:return e=Mt(19,a,t,o),e.elementType=Td,e.lanes=l,e;case G1:case kd:return e=o|32,e=Mt(30,a,t,e),e.elementType=kd,e.lanes=l,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case La:s=10;break e;case fb:s=9;break e;case Oh:s=11;break e;case Rh:s=14;break e;case Tn:s=16,n=null;break e}s=29,a=Error(C(130,e===null?"null":typeof e,"")),n=null}return t=Mt(s,a,t,o),t.elementType=e,t.type=n,t.lanes=l,t}function mi(e,t,a,n){return e=Mt(7,e,n,t),e.lanes=a,e}function ad(e,t,a){return e=Mt(6,e,null,t),e.lanes=a,e}function Fb(e){var t=Mt(18,null,null,0);return t.stateNode=e,t}function nd(e,t,a){return t=Mt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Kg=new WeakMap;function sa(e,t){if(typeof e=="object"&&e!==null){var a=Kg.get(e);return a!==void 0?a:(t={value:e,source:t,stack:kg(t)},Kg.set(e,t),t)}return{value:e,source:t,stack:kg(t)}}var mo=[],fo=0,Fs=null,Yl=0,oa=[],la=0,jn=null,Ga=1,Ya="";function en(e,t){mo[fo++]=Yl,mo[fo++]=Fs,Fs=e,Yl=t}function Pb(e,t,a){oa[la++]=Ga,oa[la++]=Ya,oa[la++]=jn,jn=e;var n=Ga;e=Ya;var o=32-jt(n)-1;n&=~(1<<o),a+=1;var l=32-jt(t)+o;if(30<l){var s=o-o%5;l=(n&(1<<s)-1).toString(32),n>>=s,o-=s,Ga=1<<32-jt(t)+o|a<<o|n,Ya=l+e}else Ga=1<<l|a<<o|n,Ya=e}function Eu(e){e.return!==null&&(en(e,1),Pb(e,1,0))}function Xh(e){for(;e===Fs;)Fs=mo[--fo],mo[fo]=null,Yl=mo[--fo],mo[fo]=null;for(;e===jn;)jn=oa[--la],oa[la]=null,Ya=oa[--la],oa[la]=null,Ga=oa[--la],oa[la]=null}function Wb(e,t){oa[la++]=Ga,oa[la++]=Ya,oa[la++]=jn,Ga=t.id,Ya=t.overflow,jn=e}var Je=null,Ne=null,W=!1,Dn=null,ua=!1,Ld=Error(C(519));function In(e){var t=Error(C(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw jl(sa(t,e)),Ld}function Jg(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[tt]=e,t[Vt]=n,a){case"dialog":ee("cancel",t),ee("close",t);break;case"iframe":case"object":case"embed":ee("load",t);break;case"video":case"audio":for(a=0;a<Zl.length;a++)ee(Zl[a],t);break;case"source":ee("error",t);break;case"img":case"image":case"link":ee("error",t),ee("load",t);break;case"details":ee("toggle",t);break;case"input":ee("invalid",t),Ab(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":ee("invalid",t);break;case"textarea":ee("invalid",t),Mb(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||Dy(t.textContent,a)?(n.popover!=null&&(ee("beforetoggle",t),ee("toggle",t)),n.onScroll!=null&&ee("scroll",t),n.onScrollEnd!=null&&ee("scrollend",t),n.onClick!=null&&(t.onclick=Ba),t=!0):t=!1,t||In(e,!0)}function Ps(e){for(Je=e.return;Je;)switch(Je.tag){case 5:case 31:case 13:ua=!1;return;case 27:case 3:ua=!0;return;default:Je=Je.return}}function Pi(e){if(e!==Je)return!1;if(!W)return Ps(e),W=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Sh(e.type,e.memoizedProps)),a=!a),a&&Ne&&In(e),Ps(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(C(317));Ne=Xp(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(C(317));Ne=Xp(e)}else t===27?(t=Ne,Jn(e.type)?(e=Ch,Ch=null,Ne=e):Ne=t):Ne=Je?ca(e.stateNode.nextSibling):null;return!0}function bi(){Ne=Je=null,W=!1}function id(){var e=Dn;return e!==null&&(At===null?At=e:At.push.apply(At,e),Dn=null),e}function jl(e){Dn===null?Dn=[e]:Dn.push(e)}var Bd=Qa(null),Ai=null,tn=null;function zn(e,t,a){Se(Bd,t._currentValue),t._currentValue=a}function nn(e){e._currentValue=Bd.current,nt(Bd)}function zs(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function Gd(e,t,a,n){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var l=o.dependencies;if(l!==null){var s=o.child;l=l.firstContext;e:for(;l!==null;){var c=l;l=o;for(var h=0;h<t.length;h++)if(c.context===t[h]){l.lanes|=a,c=l.alternate,c!==null&&(c.lanes|=a),zs(l.return,a,e),n||(s=null);break e}l=c.next}}else if(o.tag===18){if(s=o.return,s===null)throw Error(C(341));s.lanes|=a,l=s.alternate,l!==null&&(l.lanes|=a),zs(s,a,e),s=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,s=o.alternate,s!==null&&(s.lanes|=a),zs(o.return,a,e),s=o.child,s=s!==null?s.sibling:null):s=o.child;if(s!==null)s.return=o;else for(s=o;s!==null;){if(s===e){s=null;break}if(o=s.sibling,o!==null){o.return=s.return,s=o;break}s=s.return}o=s}}function vi(e,t,a,n){e=null;for(var o=t,l=!1;o!==null;){if(!l){if((o.flags&524288)!==0)l=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var s=o.alternate;if(s===null)throw Error(C(387));if(s=s.memoizedProps,s!==null){var c=o.type;Xt(o.pendingProps.value,s.value)||(e!==null?e.push(c):e=[c])}}else if(o===js.current){if(s=o.alternate,s===null)throw Error(C(387));s.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(_o):e=[_o])}o=o.return}return e!==null&&Gd(t,e,a,n),t.flags|=262144,e!==null}function Ws(e){for(e=e.firstContext;e!==null;){if(!Xt(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function yi(e){Ai=e,tn=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function at(e){return ev(Ai,e)}function hs(e,t){return Ai===null&&yi(e),ev(e,t)}function ev(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},tn===null){if(e===null)throw Error(C(308));tn=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else tn=tn.next=t;return a}var a$=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},n$=je.unstable_scheduleCallback,i$=je.unstable_NormalPriority,Le={$$typeof:La,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Qh(){return{controller:new a$,data:new Map,refCount:0}}function rr(e){e.refCount--,e.refCount===0&&n$(i$,function(){e.controller.abort()})}function Fg(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var n=t[e];a.indexOf(n)===-1&&a.push(n)}}}var Sl=null;function o$(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var Al=null,Yd=0,wi=0,yo=null;function l$(e,t){if(Al===null){var a=Al=[];Yd=0,wi=xm(),yo={status:"pending",value:void 0,then:function(n){a.push(n)}}}return Yd++,t.then(Pg,Pg),t}function Pg(){if(--Yd===0&&(Sl=null,Al!==null)){yo!==null&&(yo.status="fulfilled");var e=Al;Al=null,wi=0,yo=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function r$(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(n.status="rejected",n.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),n}var Wg=Z.S;Z.S=function(e,t){if(vy=Gt(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&l$(e,t),Sl!==null)for(var a=Ro;a!==null;)Fg(a,Sl),a=a.next;if(a=e.types,a!==null){for(var n=Ro;n!==null;)Fg(n,a),n=n.next;if(wi!==0){n=Sl,n===null&&(n=Sl=[]);for(var o=0;o<a.length;o++){var l=a[o];n.indexOf(l)===-1&&n.push(l)}}}Wg!==null&&Wg(e,t)};var fi=Qa(null);function Zh(){var e=fi.current;return e!==null?e:ve.pooledCache}function Ms(e,t){t===null?Se(fi,fi.current):Se(fi,t.pool)}function tv(){var e=Zh();return e===null?null:{parent:Le._currentValue,pool:e}}var Bo=Error(C(460)),Kh=Error(C(474)),ku=Error(C(542)),eu={then:function(){}};function ep(e){return e=e.status,e==="fulfilled"||e==="rejected"}function av(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(Ba,Ba),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,ap(e),e===void 0&&!("reason"in t)?Error(C(600)):e;default:if(typeof t.status=="string")t.then(Ba,Ba);else{if(e=ve,e!==null&&100<e.shellSuspendCounter)throw Error(C(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=n}},function(n){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,ap(e),e}throw gi=t,Bo}}function si(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(gi=a,Bo):a}}var gi=null;function tp(){if(gi===null)throw Error(C(459));var e=gi;return gi=null,e}function ap(e){if(e===Bo||e===ku)throw Error(C(483))}var wo=null,Il=0;function ms(e){var t=Il;return Il+=1,wo===null&&(wo=[]),av(wo,e,t)}function $n(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function fs(e,t){throw t.$$typeof===B1?Error(C(525)):(e=Object.prototype.toString.call(t),Error(C(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function nv(e){function t(b,p){if(e){var x=b.deletions;x===null?(b.deletions=[p],b.flags|=16):x.push(p)}}function a(b,p){if(!e)return null;for(;p!==null;)t(b,p),p=p.sibling;return null}function n(b){for(var p=new Map;b!==null;)b.key===null?p.set(b.index,b):p.set(b.key,b),b=b.sibling;return p}function o(b,p){return b=an(b,p),b.index=0,b.sibling=null,b}function l(b,p,x){return b.index=x,e?(x=b.alternate,x!==null?(x=x.index,x<p?(b.flags|=2,p):x):(b.flags|=134217730,p)):(b.flags|=1048576,p)}function s(b){return e&&b.alternate===null&&(b.flags|=134217730),b}function c(b,p,x,T){return p===null||p.tag!==6?(p=ad(x,b.mode,T),p.return=b,p):(p=o(p,x),p.return=b,p)}function h(b,p,x,T){var M=x.type;return M===io?(b=w(b,p,x.props.children,T,x.key),$n(b,x),b):p!==null&&(p.elementType===M||typeof M=="object"&&M!==null&&M.$$typeof===Tn&&si(M)===p.type)?(p=o(p,x.props),$n(p,x),p.return=b,p):(p=As(x.type,x.key,x.props,null,b.mode,T),$n(p,x),p.return=b,p)}function g(b,p,x,T){return p===null||p.tag!==4||p.stateNode.containerInfo!==x.containerInfo||p.stateNode.implementation!==x.implementation?(p=nd(x,b.mode,T),p.return=b,p):(p=o(p,x.children||[]),p.return=b,p)}function w(b,p,x,T,M){return p===null||p.tag!==7?(p=mi(x,b.mode,T,M),p.return=b,p):(p=o(p,x),p.return=b,p)}function $(b,p,x){if(typeof p=="string"&&p!==""||typeof p=="number"||typeof p=="bigint")return p=ad(""+p,b.mode,x),p.return=b,p;if(typeof p=="object"&&p!==null){switch(p.$$typeof){case is:return x=As(p.type,p.key,p.props,null,b.mode,x),$n(x,p),x.return=b,x;case xl:return p=nd(p,b.mode,x),p.return=b,p;case Tn:return p=si(p),$(b,p,x)}if($l(p)||gl(p))return p=mi(p,b.mode,x,null),p.return=b,p;if(typeof p.then=="function")return $(b,ms(p),x);if(p.$$typeof===La)return $(b,hs(b,p),x);fs(b,p)}return null}function f(b,p,x,T){var M=p!==null?p.key:null;if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return M!==null?null:c(b,p,""+x,T);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case is:return x.key===M?h(b,p,x,T):null;case xl:return x.key===M?g(b,p,x,T):null;case Tn:return x=si(x),f(b,p,x,T)}if($l(x)||gl(x))return M!==null?null:w(b,p,x,T,null);if(typeof x.then=="function")return f(b,p,ms(x),T);if(x.$$typeof===La)return f(b,p,hs(b,x),T);fs(b,x)}return null}function y(b,p,x,T,M){if(typeof T=="string"&&T!==""||typeof T=="number"||typeof T=="bigint")return b=b.get(x)||null,c(p,b,""+T,M);if(typeof T=="object"&&T!==null){switch(T.$$typeof){case is:return b=b.get(T.key===null?x:T.key)||null,h(p,b,T,M);case xl:return b=b.get(T.key===null?x:T.key)||null,g(p,b,T,M);case Tn:return T=si(T),y(b,p,x,T,M)}if($l(T)||gl(T))return b=b.get(x)||null,w(p,b,T,M,null);if(typeof T.then=="function")return y(b,p,x,ms(T),M);if(T.$$typeof===La)return y(b,p,x,hs(p,T),M);fs(p,T)}return null}function A(b,p,x,T){for(var M=null,I=null,H=p,q=p=0,ae=null;H!==null&&q<x.length;q++){H.index>q?(ae=H,H=null):ae=H.sibling;var O=f(b,H,x[q],T);if(O===null){H===null&&(H=ae);break}e&&H&&O.alternate===null&&t(b,H),p=l(O,p,q),I===null?M=O:I.sibling=O,I=O,H=ae}if(q===x.length)return a(b,H),W&&en(b,q),M;if(H===null){for(;q<x.length;q++)H=$(b,x[q],T),H!==null&&(p=l(H,p,q),I===null?M=H:I.sibling=H,I=H);return W&&en(b,q),M}for(H=n(H);q<x.length;q++)ae=y(H,b,q,x[q],T),ae!==null&&(e&&(O=ae.alternate,O!==null&&H.delete(O.key===null?q:O.key)),p=l(ae,p,q),I===null?M=ae:I.sibling=ae,I=ae);return e&&H.forEach(function(se){return t(b,se)}),W&&en(b,q),M}function S(b,p,x,T){if(x==null)throw Error(C(151));for(var M=null,I=null,H=p,q=p=0,ae=null,O=x.next();H!==null&&!O.done;q++,O=x.next()){H.index>q?(ae=H,H=null):ae=H.sibling;var se=f(b,H,O.value,T);if(se===null){H===null&&(H=ae);break}e&&H&&se.alternate===null&&t(b,H),p=l(se,p,q),I===null?M=se:I.sibling=se,I=se,H=ae}if(O.done)return a(b,H),W&&en(b,q),M;if(H===null){for(;!O.done;q++,O=x.next())O=$(b,O.value,T),O!==null&&(p=l(O,p,q),I===null?M=O:I.sibling=O,I=O);return W&&en(b,q),M}for(H=n(H);!O.done;q++,O=x.next())O=y(H,b,q,O.value,T),O!==null&&(e&&(ae=O.alternate,ae!==null&&H.delete(ae.key===null?q:ae.key)),p=l(O,p,q),I===null?M=O:I.sibling=O,I=O);return e&&H.forEach(function(rt){return t(b,rt)}),W&&en(b,q),M}function V(b,p,x,T){if(typeof x=="object"&&x!==null&&x.type===io&&x.key===null&&x.props.ref===void 0&&(x=x.props.children),typeof x=="object"&&x!==null){switch(x.$$typeof){case is:e:{for(var M=x.key;p!==null;){if(p.key===M){if(M=x.type,M===io){if(p.tag===7){a(b,p.sibling),T=o(p,x.props.children),$n(T,x),T.return=b,b=T;break e}}else if(p.elementType===M||typeof M=="object"&&M!==null&&M.$$typeof===Tn&&si(M)===p.type){a(b,p.sibling),T=o(p,x.props),$n(T,x),T.return=b,b=T;break e}a(b,p);break}else t(b,p);p=p.sibling}x.type===io?(T=mi(x.props.children,b.mode,T,x.key),$n(T,x),T.return=b,b=T):(T=As(x.type,x.key,x.props,null,b.mode,T),$n(T,x),T.return=b,b=T)}return s(b);case xl:e:{for(M=x.key;p!==null;){if(p.key===M)if(p.tag===4&&p.stateNode.containerInfo===x.containerInfo&&p.stateNode.implementation===x.implementation){a(b,p.sibling),T=o(p,x.children||[]),T.return=b,b=T;break e}else{a(b,p);break}else t(b,p);p=p.sibling}T=nd(x,b.mode,T),T.return=b,b=T}return s(b);case Tn:return x=si(x),V(b,p,x,T)}if($l(x))return A(b,p,x,T);if(gl(x)){if(M=gl(x),typeof M!="function")throw Error(C(150));return x=M.call(x),S(b,p,x,T)}if(typeof x.then=="function")return V(b,p,ms(x),T);if(x.$$typeof===La)return V(b,p,hs(b,x),T);fs(b,x)}return typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint"?(x=""+x,p!==null&&p.tag===6?(a(b,p.sibling),T=o(p,x),T.return=b,b=T):(a(b,p),T=ad(x,b.mode,T),T.return=b,b=T),s(b)):a(b,p)}return function(b,p,x,T){try{Il=0;var M=V(b,p,x,T);return wo=null,M}catch(H){if(H===Bo||H===ku)throw H;var I=Mt(29,H,null,b.mode);return I.lanes=T,I.return=b,I}}}var xi=nv(!0),iv=nv(!1),En=!1;function Jh(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function jd(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function _n(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Hn(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,(le&2)!==0){var o=n.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),n.pending=t,t=Js(e),Kb(e,null,a),t}return Tu(e,n,t,a),Js(e)}function zl(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,xb(e,a)}}function od(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var o=null,l=null;if(a=a.firstBaseUpdate,a!==null){do{var s={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};l===null?o=l=s:l=l.next=s,a=a.next}while(a!==null);l===null?o=l=t:l=l.next=t}else o=l=t;a={baseState:n.baseState,firstBaseUpdate:o,lastBaseUpdate:l,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var Id=!1;function Ml(){if(Id){var e=yo;if(e!==null)throw e}}function Ol(e,t,a,n){Id=!1;var o=e.updateQueue;En=!1;var l=o.firstBaseUpdate,s=o.lastBaseUpdate,c=o.shared.pending;if(c!==null){o.shared.pending=null;var h=c,g=h.next;h.next=null,s===null?l=g:s.next=g,s=h;var w=e.alternate;w!==null&&(w=w.updateQueue,c=w.lastBaseUpdate,c!==s&&(c===null?w.firstBaseUpdate=g:c.next=g,w.lastBaseUpdate=h))}if(l!==null){var $=o.baseState;s=0,w=g=h=null,c=l;do{var f=c.lane&-536870913,y=f!==c.lane;if(y?(ne&f)===f:(n&f)===f){f!==0&&f===wi&&(Id=!0),w!==null&&(w=w.next={lane:0,tag:c.tag,payload:c.payload,callback:null,next:null});e:{var A=e,S=c;f=t;var V=a;switch(S.tag){case 1:if(A=S.payload,typeof A=="function"){$=A.call(V,$,f);break e}$=A;break e;case 3:A.flags=A.flags&-65537|128;case 0:if(A=S.payload,f=typeof A=="function"?A.call(V,$,f):A,f==null)break e;$=ye({},$,f);break e;case 2:En=!0}}f=c.callback,f!==null&&(e.flags|=64,y&&(e.flags|=8192),y=o.callbacks,y===null?o.callbacks=[f]:y.push(f))}else y={lane:f,tag:c.tag,payload:c.payload,callback:c.callback,next:null},w===null?(g=w=y,h=$):w=w.next=y,s|=f;if(c=c.next,c===null){if(c=o.shared.pending,c===null)break;y=c,c=y.next,y.next=null,o.lastBaseUpdate=y,o.shared.pending=null}}while(!0);w===null&&(h=$),o.baseState=h,o.firstBaseUpdate=g,o.lastBaseUpdate=w,l===null&&(o.shared.lanes=0),Zn|=s,e.lanes=s,e.memoizedState=$}}function ov(e,t){if(typeof e!="function")throw Error(C(191,e));e.call(t)}function lv(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)ov(a[e],t)}var Xn=Qa(null),tu=Qa(0);function np(e,t){e=cn,Se(tu,e),Se(Xn,t),cn=e|t.baseLanes}function Xd(){Se(tu,cn),Se(Xn,Xn.current)}function Fh(){cn=tu.current,nt(Xn),nt(tu)}var lt=Qa(null),mt=null;function Un(e){var t=e.alternate;Se(it,it.current&1),Se(lt,e),mt===null&&(t===null||Xn.current!==null||t.memoizedState!==null)&&(mt=e)}function Qd(e){Se(it,it.current),Se(lt,e),mt===null&&(mt=e)}function rv(e){e.tag===22?(Se(it,it.current),Se(lt,e),mt===null&&(mt=e)):qn()}function qn(){Se(it,it.current),Se(lt,lt.current)}function qt(e){nt(lt),mt===e&&(mt=null),nt(it)}var it=Qa(0);function Xl(e,t){Se(lt,lt.current),Se(it,t)}function Ph(e){nt(it),nt(lt),mt===e&&(mt=null)}function au(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||kh(a)||Tm(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var rn=0,F=null,be=null,qe=null,nu=!1,xo=!1,$i=!1,iu=0,Ql=0,$o=null,s$=0;function Re(){throw Error(C(321))}function Wh(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!Xt(e[a],t[a]))return!1;return!0}function em(e,t,a,n,o,l){return rn=l,F=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Z.H=e===null||e.memoizedState===null?Uv:qv,$i=!1,l=a(n,o),$i=!1,xo&&(l=uv(t,a,n,o)),sv(e),l}function sv(e){Z.H=ou;var t=be!==null&&be.next!==null;if(rn=0,qe=be=F=null,nu=!1,Ql=0,$o=null,t)throw Error(C(300));e===null||Be||(e=e.dependencies,e!==null&&Ws(e)&&(Be=!0))}function uv(e,t,a,n){F=e;var o=0;do{if(xo&&($o=null),Ql=0,xo=!1,25<=o)throw Error(C(301));if(o+=1,qe=be=null,e.updateQueue!=null){var l=e.updateQueue;l.lastEffect=null,l.events=null,l.stores=null,l.memoCache!=null&&(l.memoCache.index=0)}Z.H=p$,l=t(a,n)}while(xo);return l}function u$(){var e=Z.H,t=e.useState()[0];return t=typeof t.then=="function"?sr(t):t,e=e.useState()[0],(be!==null?be.memoizedState:null)!==e&&(F.flags|=1024),t}function tm(){var e=iu!==0;return iu=0,e}function am(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function nm(e){if(nu){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}nu=!1}rn=0,qe=be=F=null,xo=!1,Ql=iu=0,$o=null}function $t(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return qe===null?F.memoizedState=qe=e:qe=qe.next=e,qe}function _e(){if(be===null){var e=F.alternate;e=e!==null?e.memoizedState:null}else e=be.next;var t=qe===null?F.memoizedState:qe.next;if(t!==null)qe=t,be=e;else{if(e===null)throw F.alternate===null?Error(C(467)):Error(C(310));be=e,e={memoizedState:be.memoizedState,baseState:be.baseState,baseQueue:be.baseQueue,queue:be.queue,next:null},qe===null?F.memoizedState=qe=e:qe=qe.next=e}return qe}function Cu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function sr(e){var t=Ql;return Ql+=1,$o===null&&($o=[]),e=av($o,e,t),t=F,(qe===null?t.memoizedState:qe.next)===null&&(t=t.alternate,Z.H=t===null||t.memoizedState===null?Uv:qv),e}function Au(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return sr(e);if(e.$$typeof===j1)return;if(e.$$typeof===La)return at(e)}throw Error(C(438,String(e)))}function im(e){var t=null,a=F.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=F.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=Cu(),F.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=Y1;return t.index++,a}function sn(e,t){return typeof t=="function"?t(e):t}function Os(e){var t=_e();return om(t,be,e)}function om(e,t,a){var n=e.queue;if(n===null)throw Error(C(311));n.lastRenderedReducer=a;var o=e.baseQueue,l=n.pending;if(l!==null){if(o!==null){var s=o.next;o.next=l.next,l.next=s}t.baseQueue=o=l,n.pending=null}if(l=e.baseState,o===null)e.memoizedState=l;else{t=o.next;var c=s=null,h=null,g=t,w=!1;do{var $=g.lane&-536870913;if($!==g.lane?(ne&$)===$:(rn&$)===$){var f=g.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),$===wi&&(w=!0);else if((rn&f)===f){g=g.next,f===wi&&(w=!0);continue}else $={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(c=h=$,s=l):h=h.next=$,F.lanes|=f,Zn|=f;$=g.action,$i&&a(l,$),l=g.hasEagerState?g.eagerState:a(l,$)}else f={lane:$,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(c=h=f,s=l):h=h.next=f,F.lanes|=$,Zn|=$;g=g.next}while(g!==null&&g!==t);if(h===null?s=l:h.next=c,!Xt(l,e.memoizedState)&&(Be=!0,w&&(a=yo,a!==null)))throw a;e.memoizedState=l,e.baseState=s,e.baseQueue=h,n.lastRenderedState=l}return o===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function ld(e){var t=_e(),a=t.queue;if(a===null)throw Error(C(311));a.lastRenderedReducer=e;var n=a.dispatch,o=a.pending,l=t.memoizedState;if(o!==null){a.pending=null;var s=o=o.next;do l=e(l,s.action),s=s.next;while(s!==o);Xt(l,t.memoizedState)||(Be=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),a.lastRenderedState=l}return[l,n]}function cv(e,t,a){var n=F,o=_e(),l=W;if(l){if(a===void 0)throw Error(C(407));a=a()}else a=t();var s=!Xt((be||o).memoizedState,a);if(s&&(o.memoizedState=a,Be=!0),o=o.queue,lm(mv.bind(null,n,o,e),[e]),e=o.getSnapshot!==t||s||qe!==null&&(qe.memoizedState.tag&1)!==0,Ao(e?9:8,{destroy:void 0},hv.bind(null,n,o,a,t),null),e){if(n.flags|=2048,ve===null)throw Error(C(349));l||(rn&127)!==0||dv(n,t,a)}return a}function dv(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=F.updateQueue,t===null?(t=Cu(),F.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function hv(e,t,a,n){t.value=a,t.getSnapshot=n,fv(t)&&gv(e)}function mv(e,t,a){return a(function(){fv(t)&&gv(e)})}function fv(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!Xt(e,a)}catch{return!0}}function gv(e){var t=Ci(e,2);t!==null&&Ot(t,e,2)}function Zd(e){var t=$t();if(typeof e=="function"){var a=e;if(e=a(),$i){Cn(!0);try{a()}finally{Cn(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:sn,lastRenderedState:e},t}function pv(e,t,a,n){return e.baseState=a,om(e,be,typeof n=="function"?n:sn)}function c$(e,t,a,n,o){if(Mu(e))throw Error(C(485));if(e=t.action,e!==null){var l={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(s){l.listeners.push(s)}};Z.T!==null?a(!0):l.isTransition=!1,n(l),a=t.pending,a===null?(l.next=t.pending=l,bv(t,l)):(l.next=a.next,t.pending=a.next=l)}}function bv(e,t){var a=t.action,n=t.payload,o=e.state;if(t.isTransition){var l=Z.T,s={};s.types=l!==null?l.types:null,Z.T=s;try{var c=a(o,n),h=Z.S;h!==null&&h(s,c),ip(e,t,c)}catch(g){Kd(e,t,g)}finally{l!==null&&s.types!==null&&(l.types=s.types),Z.T=l}}else try{l=a(o,n),ip(e,t,l)}catch(g){Kd(e,t,g)}}function ip(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){op(e,t,n)},function(n){return Kd(e,t,n)}):op(e,t,a)}function op(e,t,a){t.status="fulfilled",t.value=a,vv(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,bv(e,a)))}function Kd(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,vv(t),t=t.next;while(t!==n)}e.action=null}function vv(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function yv(e,t){return t}function lp(e,t){if(W){var a=ve.formState;if(a!==null){e:{var n=F;if(W){if(Ne){t:{for(var o=Ne,l=ua;o.nodeType!==8;){if(!l){o=null;break t}if(o=ca(o.nextSibling),o===null){o=null;break t}}l=o.data,o=l==="F!"||l==="F"?o:null}if(o){Ne=ca(o.nextSibling),n=o.data==="F!";break e}}In(n)}n=!1}n&&(t=a[0])}}return a=$t(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:yv,lastRenderedState:t},a.queue=n,a=Dv.bind(null,F,n),n.dispatch=a,n=Zd(!1),l=cm.bind(null,F,!1,n.queue),n=$t(),o={state:t,dispatch:null,action:e,pending:null},n.queue=o,a=c$.bind(null,F,o,l,a),o.dispatch=a,n.memoizedState=e,[t,a,!1]}function rp(e){var t=_e();return wv(t,be,e)}function wv(e,t,a){if(t=om(e,t,yv)[0],e=Os(sn)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=sr(t)}catch(s){throw s===Bo?ku:s}else n=t;t=_e();var o=t.queue,l=o.dispatch;return a!==t.memoizedState&&(F.flags|=2048,Ao(9,{destroy:void 0},d$.bind(null,o,a),null)),[n,l,e]}function d$(e,t){e.action=t}function sp(e){var t=_e(),a=be;if(a!==null)return wv(t,a,e);_e(),t=t.memoizedState,a=_e();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function Ao(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=F.updateQueue,t===null&&(t=Cu(),F.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function xv(){return _e().memoizedState}function Rs(e,t,a,n){var o=$t();F.flags|=e,o.memoizedState=Ao(1|t,{destroy:void 0},a,n===void 0?null:n)}function zu(e,t,a,n){var o=_e();n=n===void 0?null:n;var l=o.memoizedState.inst;be!==null&&n!==null&&Wh(n,be.memoizedState.deps)?o.memoizedState=Ao(t,l,a,n):(F.flags|=e,o.memoizedState=Ao(1|t,l,a,n))}function up(e,t){Rs(8390656,8,e,t)}function lm(e,t){zu(2048,8,e,t)}function h$(e){F.flags|=4;var t=F.updateQueue;if(t===null)t=Cu(),F.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function $v(e){var t=_e().memoizedState;return h$({ref:t,nextImpl:e}),function(){if((le&2)!==0)throw Error(C(440));return t.impl.apply(void 0,arguments)}}function Nv(e,t){return zu(4,2,e,t)}function Sv(e,t){return zu(4,4,e,t)}function Tv(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Ev(e,t,a){a=a!=null?a.concat([e]):null,zu(4,4,Tv.bind(null,t,e),a)}function rm(){}function kv(e,t){var a=_e();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&Wh(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function Cv(e,t){var a=_e();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&Wh(t,n[1]))return n[0];if(n=e(),$i){Cn(!0);try{e()}finally{Cn(!1)}}return a.memoizedState=[n,t],n}function sm(e,t,a){return a===void 0||(rn&1073741824)!==0&&(ne&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=wy(),F.lanes|=e,Zn|=e,a)}function Av(e,t,a,n){return Xt(a,t)?a:Xn.current!==null?(e=sm(e,a,n),Xt(e,t)||(Be=!0),e):(rn&106)===0||(rn&1073741824)!==0&&(ne&261930)===0?(Be=!0,e.memoizedState=a):(e=wy(),F.lanes|=e,Zn|=e,t)}function zv(e,t,a,n,o){var l=re.p;re.p=l!==0&&8>l?l:8;var s=Z.T,c={};c.types=s!==null?s.types:null,Z.T=c,cm(e,!1,t,a);try{var h=o(),g=Z.S;if(g!==null&&g(c,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var w=r$(h,n);Rl(e,t,w,It(e))}else Rl(e,t,n,It(e))}catch($){Rl(e,t,{then:function(){},status:"rejected",reason:$},It())}finally{re.p=l,s!==null&&c.types!==null&&(s.types=c.types),Z.T=s}}function m$(){}function Jd(e,t,a,n){if(e.tag!==5)throw Error(C(476));var o=Mv(e).queue;zv(e,o,t,hi,a===null?m$:function(){return Ov(e),a(n)})}function Mv(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:hi,baseState:hi,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:sn,lastRenderedState:hi},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:sn,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Ov(e){var t=Mv(e);t.next===null&&(t=e.alternate.memoizedState),Rl(e,t.next.queue,{},It())}function um(){return at(_o)}function Rv(){return _e().memoizedState}function Vv(){return _e().memoizedState}function f$(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=It();e=_n(a);var n=Hn(t,e,a);n!==null&&(Ot(n,t,a),zl(n,t,a)),t={cache:Qh()},e.payload=t;return}t=t.return}}function g$(e,t,a){var n=It();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Mu(e)?_v(t,a):(a=jh(e,t,a,n),a!==null&&(Ot(a,e,n),Hv(a,t,n)))}function Dv(e,t,a){var n=It();Rl(e,t,a,n)}function Rl(e,t,a,n){var o={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Mu(e))_v(t,o);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var s=t.lastRenderedState,c=l(s,a);if(o.hasEagerState=!0,o.eagerState=c,Xt(c,s))return Tu(e,t,o,0),ve===null&&Su(),!1}catch{}if(a=jh(e,t,o,n),a!==null)return Ot(a,e,n),Hv(a,t,n),!0}return!1}function cm(e,t,a,n){if(n={lane:2,revertLane:xm(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Mu(e)){if(t)throw Error(C(479))}else t=jh(e,a,n,2),t!==null&&Ot(t,e,2)}function Mu(e){var t=e.alternate;return e===F||t!==null&&t===F}function _v(e,t){xo=nu=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Hv(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,xb(e,a)}}var ou={readContext:at,use:Au,useCallback:Re,useContext:Re,useEffect:Re,useImperativeHandle:Re,useLayoutEffect:Re,useInsertionEffect:Re,useMemo:Re,useReducer:Re,useRef:Re,useState:Re,useDebugValue:Re,useDeferredValue:Re,useTransition:Re,useSyncExternalStore:Re,useId:Re,useHostTransitionStatus:Re,useFormState:Re,useActionState:Re,useOptimistic:Re,useMemoCache:Re,useCacheRefresh:Re,useEffectEvent:Re},Uv={readContext:at,use:Au,useCallback:function(e,t){return $t().memoizedState=[e,t===void 0?null:t],e},useContext:at,useEffect:up,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,Rs(4194308,4,Tv.bind(null,t,e),a)},useLayoutEffect:function(e,t){return Rs(4194308,4,e,t)},useInsertionEffect:function(e,t){Rs(4,2,e,t)},useMemo:function(e,t){var a=$t();t=t===void 0?null:t;var n=e();if($i){Cn(!0);try{e()}finally{Cn(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=$t();if(a!==void 0){var o=a(t);if($i){Cn(!0);try{a(t)}finally{Cn(!1)}}}else o=t;return n.memoizedState=n.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},n.queue=e,e=e.dispatch=g$.bind(null,F,e),[n.memoizedState,e]},useRef:function(e){var t=$t();return e={current:e},t.memoizedState=e},useState:function(e){e=Zd(e);var t=e.queue,a=Dv.bind(null,F,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:rm,useDeferredValue:function(e,t){var a=$t();return sm(a,e,t)},useTransition:function(){var e=Zd(!1);return e=zv.bind(null,F,e.queue,!0,!1),$t().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=F,o=$t();if(W){if(a===void 0)throw Error(C(407));a=a()}else{if(a=t(),ve===null)throw Error(C(349));(ne&127)!==0||dv(n,t,a)}o.memoizedState=a;var l={value:a,getSnapshot:t};return o.queue=l,up(mv.bind(null,n,l,e),[e]),n.flags|=2048,Ao(9,{destroy:void 0},hv.bind(null,n,l,a,t),null),a},useId:function(){var e=$t(),t=ve.identifierPrefix;if(W){var a=Ya,n=Ga;a=(n&~(1<<32-jt(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=iu++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=s$++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:um,useFormState:lp,useActionState:lp,useOptimistic:function(e){var t=$t();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=cm.bind(null,F,!0,a),a.dispatch=t,[e,t]},useMemoCache:im,useCacheRefresh:function(){return $t().memoizedState=f$.bind(null,F)},useEffectEvent:function(e){var t=$t(),a={impl:e};return t.memoizedState=a,function(){if((le&2)!==0)throw Error(C(440));return a.impl.apply(void 0,arguments)}}},qv={readContext:at,use:Au,useCallback:kv,useContext:at,useEffect:lm,useImperativeHandle:Ev,useInsertionEffect:Nv,useLayoutEffect:Sv,useMemo:Cv,useReducer:Os,useRef:xv,useState:function(){return Os(sn)},useDebugValue:rm,useDeferredValue:function(e,t){var a=_e();return Av(a,be.memoizedState,e,t)},useTransition:function(){var e=Os(sn)[0],t=_e().memoizedState;return[typeof e=="boolean"?e:sr(e),t]},useSyncExternalStore:cv,useId:Rv,useHostTransitionStatus:um,useFormState:rp,useActionState:rp,useOptimistic:function(e,t){var a=_e();return pv(a,be,e,t)},useMemoCache:im,useCacheRefresh:Vv,useEffectEvent:$v},p$={readContext:at,use:Au,useCallback:kv,useContext:at,useEffect:lm,useImperativeHandle:Ev,useInsertionEffect:Nv,useLayoutEffect:Sv,useMemo:Cv,useReducer:ld,useRef:xv,useState:function(){return ld(sn)},useDebugValue:rm,useDeferredValue:function(e,t){var a=_e();return be===null?sm(a,e,t):Av(a,be.memoizedState,e,t)},useTransition:function(){var e=ld(sn)[0],t=_e().memoizedState;return[typeof e=="boolean"?e:sr(e),t]},useSyncExternalStore:cv,useId:Rv,useHostTransitionStatus:um,useFormState:sp,useActionState:sp,useOptimistic:function(e,t){var a=_e();return be!==null?pv(a,be,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:im,useCacheRefresh:Vv,useEffectEvent:$v};function rd(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:ye({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Fd={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=It(),o=_n(n);o.payload=t,a!=null&&(o.callback=a),t=Hn(e,o,n),t!==null&&(Ot(t,e,n),zl(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=It(),o=_n(n);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=Hn(e,o,n),t!==null&&(Ot(t,e,n),zl(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=It(),n=_n(a);n.tag=2,t!=null&&(n.callback=t),t=Hn(e,n,a),t!==null&&(Ot(t,e,a),zl(t,e,a))}};function cp(e,t,a,n,o,l,s){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,l,s):t.prototype&&t.prototype.isPureReactComponent?!Gl(a,n)||!Gl(o,l):!0}function dp(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&Fd.enqueueReplaceState(t,t.state,null)}function Ni(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=ye({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function Lv(e){Ks(e)}function Bv(e){console.error(e)}function Gv(e){Ks(e)}function lu(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function hp(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function Pd(e,t,a){return a=_n(a),a.tag=3,a.payload={element:null},a.callback=function(){lu(e,t)},a}function Yv(e){return e=_n(e),e.tag=3,e}function jv(e,t,a,n){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var l=n.value;e.payload=function(){return o(l)},e.callback=function(){hp(t,a,n)}}var s=a.stateNode;s!==null&&typeof s.componentDidCatch=="function"&&(e.callback=function(){hp(t,a,n),typeof o!="function"&&(Ln===null?Ln=new Set([this]):Ln.add(this));var c=n.stack;this.componentDidCatch(n.value,{componentStack:c!==null?c:""})})}function b$(e,t,a,n,o){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&vi(t,a,o,!0),a=lt.current,a!==null){switch(a.tag){case 31:case 13:case 19:return mt===null?fu():a.alternate===null&&Ve===0&&(Ve=3),a.flags&=-257,a.flags|=65536,a.lanes=o,n===eu?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),fd(e,n,o)),!1;case 22:return a.flags|=65536,n===eu?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),fd(e,n,o)),!1}throw Error(C(435,a.tag))}return fd(e,n,o),fu(),!1}if(W)return t=lt.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,n!==Ld&&(e=Error(C(422),{cause:n}),jl(sa(e,a)))):(n!==Ld&&(t=Error(C(423),{cause:n}),jl(sa(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,n=sa(n,a),o=Pd(e.stateNode,n,o),od(e,o),Ve!==4&&(Ve=2)),!1;var l=Error(C(520),{cause:n});if(l=sa(l,a),Hl===null?Hl=[l]:Hl.push(l),Ve!==4&&(Ve=2),t===null)return!0;n=sa(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=Pd(a.stateNode,n,e),od(a,e),!1;case 1:if(t=a.type,l=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||l!==null&&typeof l.componentDidCatch=="function"&&(Ln===null||!Ln.has(l))))return a.flags|=65536,o&=-o,a.lanes|=o,o=Yv(o),jv(o,e,a,n),od(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var dm=Error(C(461)),Be=!1;function Ge(e,t,a,n){t.child=e===null?iv(t,null,a,n):xi(t,e.child,a,n)}function mp(e,t,a,n,o){a=a.render;var l=t.ref;if("ref"in n){var s={};for(var c in n)c!=="ref"&&(s[c]=n[c])}else s=n;return yi(t),n=em(e,t,a,s,l,o),c=tm(),e!==null&&!Be?(am(e,t,o),un(e,t,o)):(W&&c&&Eu(t),t.flags|=1,Ge(e,t,n,o),t.child)}function fp(e,t,a,n,o){if(e===null){var l=a.type;return typeof l=="function"&&!Ih(l)&&l.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=l,Iv(e,t,l,n,o)):(e=As(a.type,null,n,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,!mm(e,o)){var s=l.memoizedProps;if(a=a.compare,a=a!==null?a:Gl,a(s,n)&&e.ref===t.ref)return un(e,t,o)}return t.flags|=1,e=an(l,n),e.ref=t.ref,e.return=t,t.child=e}function Iv(e,t,a,n,o){if(e!==null){var l=e.memoizedProps;if(Gl(l,n)&&e.ref===t.ref)if(Be=!1,t.pendingProps=n=l,mm(e,o))(e.flags&131072)!==0&&(Be=!0);else return t.lanes=e.lanes,un(e,t,o)}return Wd(e,t,a,n,o)}function Xv(e,t,a,n){var o=n.children,l=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(l=l!==null?l.baseLanes|a:a,e!==null){for(n=t.child=e.child,o=0;n!==null;)o=o|n.lanes|n.childLanes,n=n.sibling;n=o&~l}else n=0,t.child=null;return gp(e,t,l,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Ms(t,l!==null?l.cachePool:null),l!==null?np(t,l):Xd(),rv(t);else return n=t.lanes=536870912,gp(e,t,l!==null?l.baseLanes|a:a,a,n)}else l!==null?(Ms(t,l.cachePool),np(t,l),qn(),t.memoizedState=null):(e!==null&&Ms(t,null),Xd(),qn());return Ge(e,t,o,a),t.child}function Vl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function gp(e,t,a,n,o){var l=Zh();return l=l===null?null:{parent:Le._currentValue,pool:l},t.memoizedState={baseLanes:a,cachePool:l},e!==null&&Ms(t,null),Xd(),rv(t),e!==null&&vi(e,t,n,!0),t.childLanes=o,null}function Vs(e,t){return t=Ou({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function pp(e,t,a){return xi(t,e.child,null,a),e=Vs(t,t.pendingProps),e.flags|=2,qt(t),t.memoizedState=null,e}function v$(e,t,a){var n=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(W){if(n.mode==="hidden")return e=Vs(t,n),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},Vl(null,e);if(Qd(t),(e=Ne)?(e=Xy(e,ua),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:jn!==null?{id:Ga,overflow:Ya}:null,retryLane:536870912,hydrationErrors:null},a=Fb(e),a.return=t,t.child=a,Je=t,Ne=null)):e=null,e===null)throw In(t);return t.lanes=536870912,null}return Vs(t,n)}var l=e.memoizedState;if(l!==null){var s=l.dehydrated;if(Qd(t),o)if(t.flags&256)t.flags&=-257,t=pp(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(C(558));else if(Be||vi(e,t,a,!1),o=(a&e.childLanes)!==0,Be||o){if(Xn.current===null){if(n=ve,n!==null&&(s=$b(n,a),s!==0&&s!==l.retryLane))throw l.retryLane=s,Ci(e,s),Ot(n,e,s),dm;fu()}t=pp(e,t,a)}else e=l.treeContext,Ne=ca(s.nextSibling),Je=t,W=!0,Dn=null,ua=!1,e!==null&&Wb(t,e),t=Vs(t,n),t.flags|=134221824;return t}return e=an(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function eo(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(C(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Wd(e,t,a,n,o){return yi(t),a=em(e,t,a,n,void 0,o),n=tm(),e!==null&&!Be?(am(e,t,o),un(e,t,o)):(W&&n&&Eu(t),t.flags|=1,Ge(e,t,a,o),t.child)}function bp(e,t,a,n,o,l){return yi(t),t.updateQueue=null,a=uv(t,n,a,o),sv(e),n=tm(),e!==null&&!Be?(am(e,t,l),un(e,t,l)):(W&&n&&Eu(t),t.flags|=1,Ge(e,t,a,l),t.child)}function vp(e,t,a,n,o){if(yi(t),t.stateNode===null){var l=ho,s=a.contextType;typeof s=="object"&&s!==null&&(l=at(s)),l=new a(n,l),t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,l.updater=Fd,t.stateNode=l,l._reactInternals=t,l=t.stateNode,l.props=n,l.state=t.memoizedState,l.refs={},Jh(t),s=a.contextType,l.context=typeof s=="object"&&s!==null?at(s):ho,l.state=t.memoizedState,s=a.getDerivedStateFromProps,typeof s=="function"&&(rd(t,a,s,n),l.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(s=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),s!==l.state&&Fd.enqueueReplaceState(l,l.state,null),Ol(t,n,l,o),Ml(),l.state=t.memoizedState),typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){l=t.stateNode;var c=t.memoizedProps,h=Ni(a,c);l.props=h;var g=l.context,w=a.contextType;s=ho,typeof w=="object"&&w!==null&&(s=at(w));var $=a.getDerivedStateFromProps;w=typeof $=="function"||typeof l.getSnapshotBeforeUpdate=="function",c=t.pendingProps!==c,w||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(c||g!==s)&&dp(t,l,n,s),En=!1;var f=t.memoizedState;l.state=f,Ol(t,n,l,o),Ml(),g=t.memoizedState,c||f!==g||En?(typeof $=="function"&&(rd(t,a,$,n),g=t.memoizedState),(h=En||cp(t,a,h,n,f,g,s))?(w||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount()),typeof l.componentDidMount=="function"&&(t.flags|=4194308)):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=g),l.props=n,l.state=g,l.context=s,n=h):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{l=t.stateNode,jd(e,t),s=t.memoizedProps,w=Ni(a,s),l.props=w,$=t.pendingProps,f=l.context,g=a.contextType,h=ho,typeof g=="object"&&g!==null&&(h=at(g)),c=a.getDerivedStateFromProps,(g=typeof c=="function"||typeof l.getSnapshotBeforeUpdate=="function")||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(s!==$||f!==h)&&dp(t,l,n,h),En=!1,f=t.memoizedState,l.state=f,Ol(t,n,l,o),Ml();var y=t.memoizedState;s!==$||f!==y||En||e!==null&&e.dependencies!==null&&Ws(e.dependencies)?(typeof c=="function"&&(rd(t,a,c,n),y=t.memoizedState),(w=En||cp(t,a,w,n,f,y,h)||e!==null&&e.dependencies!==null&&Ws(e.dependencies))?(g||typeof l.UNSAFE_componentWillUpdate!="function"&&typeof l.componentWillUpdate!="function"||(typeof l.componentWillUpdate=="function"&&l.componentWillUpdate(n,y,h),typeof l.UNSAFE_componentWillUpdate=="function"&&l.UNSAFE_componentWillUpdate(n,y,h)),typeof l.componentDidUpdate=="function"&&(t.flags|=4),typeof l.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof l.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=y),l.props=n,l.state=y,l.context=h,n=w):(typeof l.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),n=!1)}return l=n,eo(e,t),n=(t.flags&128)!==0,l||n?(l=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:l.render(),t.flags|=1,e!==null&&n?(t.child=xi(t,e.child,null,o),t.child=xi(t,null,a,o)):Ge(e,t,a,o),t.memoizedState=l.state,e=t.child):e=un(e,t,o),e}function yp(e,t,a,n){return bi(),t.flags|=256,Ge(e,t,a,n),t.child}var eh={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function th(e){return{baseLanes:e,cachePool:tv()}}function ah(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=Bt),e}function Qv(e,t,a){var n=t.pendingProps,o=!1,l=(t.flags&128)!==0,s;if((s=l)||(s=e!==null&&e.memoizedState===null?!1:(it.current&2)!==0),s&&(o=!0,t.flags&=-129),s=(t.flags&32)!==0,t.flags&=-33,e===null){if(W){if(o?Un(t):qn(),(e=Ne)?(e=Xy(e,ua),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:jn!==null?{id:Ga,overflow:Ya}:null,retryLane:536870912,hydrationErrors:null},a=Fb(e),a.return=t,t.child=a,Je=t,Ne=null)):e=null,e===null)throw In(t);return Tm(e)?t.lanes=32:t.lanes=536870912,null}return l=n.children,n=n.fallback,o?(qn(),o=t.mode,l=Ou({mode:"hidden",children:l},o),n=mi(n,o,a,null),l.return=t,n.return=t,l.sibling=n,t.child=l,n=t.child,n.memoizedState=th(a),n.childLanes=ah(e,s,a),t.memoizedState=eh,Vl(null,n)):(Un(t),hm(t,l))}var c=e.memoizedState;if(c!==null){var h=c.dehydrated;if(h!==null)return y$(e,t,l,s,n,h,c,a)}return o?(qn(),o=n.fallback,l=t.mode,c=e.child,h=c.sibling,n=an(c,{mode:"hidden",children:n.children}),n.subtreeFlags=c.subtreeFlags&1206910976,h!==null?o=an(h,o):(o=mi(o,l,a,null),o.flags|=2),o.return=t,n.return=t,n.sibling=o,t.child=n,Vl(null,n),n=t.child,o=e.child.memoizedState,o===null?o=th(a):(l=o.cachePool,l!==null?(c=Le._currentValue,l=l.parent!==c?{parent:c,pool:c}:l):l=tv(),o={baseLanes:o.baseLanes|a,cachePool:l}),n.memoizedState=o,n.childLanes=ah(e,s,a),t.memoizedState=eh,Vl(e.child,n)):(Un(t),a=e.child,e=a.sibling,a=an(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=a,t.memoizedState=null,a)}function hm(e,t){return t=Ou({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Ou(e,t){return e=Mt(22,e,null,t),e.lanes=0,e}function gs(e,t,a){return xi(t,e.child,null,a),e=hm(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function y$(e,t,a,n,o,l,s,c){if(a)return t.flags&256?(Un(t),t.flags&=-257,gs(e,t,c)):t.memoizedState!==null?(qn(),t.child=e.child,t.flags|=128,null):(qn(),l=o.fallback,s=t.mode,o=Ou({mode:"visible",children:o.children},s),l=mi(l,s,c,null),l.flags|=2,o.return=t,l.return=t,o.sibling=l,t.child=o,xi(t,e.child,null,c),o=t.child,o.memoizedState=th(c),o.childLanes=ah(e,n,c),t.memoizedState=eh,Vl(null,o));if(Un(t),Tm(l)){if(n=l.nextSibling&&l.nextSibling.dataset,n)var h=n.dgst;return n=h,n!==""&&(o=Error(C(419)),o.stack="",o.digest=n,jl({value:o,source:null,stack:null})),gs(e,t,c)}if(Be||vi(e,t,c,!1),n=(c&e.childLanes)!==0,Be||n){if(Xn.current!==null)return gs(e,t,c);if(n=ve,n!==null&&(o=$b(n,c),o!==0&&o!==s.retryLane))throw s.retryLane=o,Ci(e,o),Ot(n,e,o),dm;return kh(l)||fu(),gs(e,t,c)}return kh(l)?(t.flags|=192,t.child=e.child,null):(e=s.treeContext,Ne=ca(l.nextSibling),Je=t,W=!0,Dn=null,ua=!1,e!==null&&Wb(t,e),t=hm(t,o.children),t.flags|=134221824,t)}function wp(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),zs(e.return,t,a)}function xp(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&au(a)===null&&(t=e),e=e.sibling}return t}function ps(e,t,a,n,o,l){var s=e.memoizedState;s===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:o,treeForkCount:l}:(s.isBackwards=t,s.rendering=null,s.renderingStartTime=0,s.last=n,s.tail=a,s.tailMode=o,s.treeForkCount=l)}function sd(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function nh(e,t,a){var n=t.pendingProps,o=n.revealOrder,l=n.tail;n=n.children;var s=it.current;if(t.flags&128)return Xl(t,s),null;var c=(s&2)!==0;if(c?(s=s&1|2,t.flags|=128):s&=1,Xl(t,s),o==="backwards"&&e!==null?(sd(e),Ge(e,t,n,a),sd(e)):Ge(e,t,n,a),n=W?Yl:0,!c&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&wp(e,a,t);else if(e.tag===19)wp(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=xp(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,sd(t)),ps(t,!0,o,null,l,n);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&au(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}ps(t,!0,a,null,l,n);break;case"together":ps(t,!1,null,null,void 0,n);break;case"independent":t.memoizedState=null;break;default:a=xp(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),ps(t,!1,o,a,l,n)}return t.child}function $p(e,t,a){var n=t.pendingProps;return zn(t,t.type,n.value),Ge(e,t,n.children,a),t.child}function un(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),Zn|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(vi(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(C(153));if(t.child!==null){for(e=t.child,a=an(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=an(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function mm(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Ws(e)))}function w$(e,t,a){switch(t.tag){case 3:Is(t,t.stateNode.containerInfo),zn(t,Le,e.memoizedState.cache),bi();break;case 27:case 5:zd(t);break;case 4:Is(t,t.stateNode.containerInfo);break;case 10:zn(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Qd(t),null;break;case 13:var n=t.memoizedState;if(n!==null){if(n.dehydrated!==null)return Un(t),t.flags|=128,null;n=vi(e,t,a,!1);var o=t.child.childLanes;return n||(a&o)!==0?Qv(e,t,a):(Un(t),e=un(e,t,a),e!==null?e.sibling:null)}Un(t);break;case 19:if(t.flags&128)return nh(e,t,a);if(o=(e.flags&128)!==0,n=(a&t.childLanes)!==0,n||(vi(e,t,a,!1),n=(a&t.childLanes)!==0),o){if(n)return nh(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),Xl(t,it.current),n)break;return null;case 22:return t.lanes=0,Xv(e,t,a,t.pendingProps);case 24:zn(t,Le,e.memoizedState.cache)}return un(e,t,a)}function Zv(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)Be=!0;else{if(!mm(e,a)&&(t.flags&128)===0)return Be=!1,w$(e,t,a);Be=(e.flags&131072)!==0}else Be=!1,W&&(t.flags&1048576)!==0&&Pb(t,Yl,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=si(t.elementType),t.type=e,typeof e=="function")Ih(e)?(n=Ni(e,n),t.tag=1,t=vp(null,t,e,n,a)):(t.tag=0,t=Wd(null,t,e,n,a));else{if(e!=null){var o=e.$$typeof;if(o===Oh){t.tag=11,t=mp(null,t,e,n,a);break e}else if(o===Rh){t.tag=14,t=fp(null,t,e,n,a);break e}else if(o===La){t.tag=10,t.type=e,t=$p(null,t,a);break e}}throw t=Cd(e)||e,Error(C(306,t,""))}}return t;case 0:return Wd(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,o=Ni(n,t.pendingProps),vp(e,t,n,o,a);case 3:e:{if(Is(t,t.stateNode.containerInfo),e===null)throw Error(C(387));n=t.pendingProps;var l=t.memoizedState;o=l.element,jd(e,t),Ol(t,n,null,a);var s=t.memoizedState;if(n=s.cache,zn(t,Le,n),n!==l.cache&&Gd(t,[Le],a,!0),Ml(),n=s.element,l.isDehydrated)if(l={element:n,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){t=yp(e,t,n,a);break e}else if(n!==o){o=sa(Error(C(424)),t),jl(o),t=yp(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Ne=ca(e.firstChild),Je=t,W=!0,Dn=null,ua=!0,a=iv(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(bi(),n===o){t=un(e,t,a);break e}Ge(e,t,n,a)}t=t.child}return t;case 26:return eo(e,t),e===null?(a=Kp(t.type,null,t.pendingProps,null))?t.memoizedState=a:W||(t.stateNode=Hy(t.type,t.pendingProps,Vn.current,t)):t.memoizedState=Kp(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return zd(t),e===null&&W&&(n=t.stateNode=Qy(t.type,t.pendingProps,Vn.current),Je=t,ua=!0,o=Ne,Jn(t.type)?(Ch=o,Ne=ca(n.firstChild)):Ne=o),Ge(e,t,t.pendingProps.children,a),eo(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&W&&((o=n=Ne)&&(n=hN(n,t.type,t.pendingProps,ua),n!==null?(t.stateNode=n,Je=t,Ne=ca(n.firstChild),ua=!1,o=!0):o=!1),o||In(t)),zd(t),o=t.type,l=t.pendingProps,s=e!==null?e.memoizedProps:null,n=l.children,Sh(o,l)?n=null:s!==null&&Sh(o,s)&&(t.flags|=32),t.memoizedState!==null&&(o=em(e,t,u$,null,null,a),_o._currentValue=o),eo(e,t),Ge(e,t,n,a),t.child;case 6:return e===null&&W&&((e=a=Ne)&&(a=mN(a,t.pendingProps,ua),a!==null?(t.stateNode=a,Je=t,Ne=null,e=!0):e=!1),e||In(t)),null;case 13:return Qv(e,t,a);case 4:return Is(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=xi(t,null,n,a):Ge(e,t,n,a),t.child;case 11:return mp(e,t,t.type,t.pendingProps,a);case 7:return n=t.pendingProps,eo(e,t),Ge(e,t,n,a),t.child;case 8:return Ge(e,t,t.pendingProps.children,a),t.child;case 12:return Ge(e,t,t.pendingProps.children,a),t.child;case 10:return $p(e,t,a);case 9:return o=t.type._context,n=t.pendingProps.children,yi(t),o=at(o),n=n(o),t.flags|=1,Ge(e,t,n,a),t.child;case 14:return fp(e,t,t.type,t.pendingProps,a);case 15:return Iv(e,t,t.type,t.pendingProps,a);case 19:return nh(e,t,a);case 31:return v$(e,t,a);case 22:return Xv(e,t,a,t.pendingProps);case 24:return yi(t),n=at(Le),e===null?(o=Zh(),o===null&&(o=ve,l=Qh(),o.pooledCache=l,l.refCount++,l!==null&&(o.pooledCacheLanes|=a),o=l),t.memoizedState={parent:n,cache:o},Jh(t),zn(t,Le,o)):((e.lanes&a)!==0&&(jd(e,t),Ol(t,null,null,a),Ml()),o=e.memoizedState,l=t.memoizedState,o.parent!==n?(o={parent:n,cache:n},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),zn(t,Le,n)):(n=l.cache,zn(t,Le,n),n!==o.cache&&Gd(t,[Le],a,!0))),Ge(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),n=t.pendingProps,n.name!=null&&n.name!=="auto"?t.flags|=e===null?18882560:18874368:W&&Eu(t),e!==null&&e.memoizedProps.name!==n.name?t.flags|=4194816:eo(e,t),Ge(e,t,n.children,a),t.child;case 29:throw t.pendingProps}throw Error(C(156,t.tag))}function Wa(e){e.flags|=4}function ud(e,t,a,n,o){var l;if((l=(e.mode&32)!==0)&&(l=a===null?Pp(t,n):Pp(t,n)&&(n.src!==a.src||n.srcSet!==a.srcSet)),l){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(Ny())e.flags|=8192;else throw gi=eu,Kh}else e.flags&=-16777217}function Np(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Fy(t))if(Ny())e.flags|=8192;else throw gi=eu,Kh}function bs(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?yb():536870912,e.lanes|=t,zo|=t)}function bl(e,t){if(!W)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function $e(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags&1206910976,n|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags,n|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function x$(e,t,a){var n=t.pendingProps;switch(Xh(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return $e(t),null;case 1:return $e(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),nn(Le),Eo(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Pi(t)?Wa(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,id())),$e(t),null;case 26:var o=t.type,l=t.memoizedState;return e===null?(Wa(t),l!==null?($e(t),Np(t,l)):($e(t),ud(t,o,null,n,a))):l?l!==e.memoizedState?(Wa(t),$e(t),Np(t,l)):($e(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&Wa(t),$e(t),ud(t,o,e,n,a)),null;case 27:if(Xs(t),a=Vn.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&Wa(t);else{if(!n){if(t.stateNode===null)throw Error(C(166));return $e(t),t.subtreeFlags&=-33554433,null}e=ja.current,Pi(t)?Jg(t,e):(e=Qy(o,n,a),t.stateNode=e,Wa(t))}return $e(t),t.subtreeFlags&=-33554433,null;case 5:if(Xs(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&Wa(t);else{if(!n){if(t.stateNode===null)throw Error(C(166));return $e(t),t.subtreeFlags&=-33554433,null}if(l=ja.current,Pi(t))Jg(t,l);else{var s=Jl(Vn.current);switch(l){case 1:l=s.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:l=s.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":l=s.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":l=s.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":l=s.createElement("div"),l.innerHTML="<script><\/script>",l=l.removeChild(l.firstChild);break;case"select":l=typeof n.is=="string"?s.createElement("select",{is:n.is}):s.createElement("select"),n.multiple?l.multiple=!0:n.size&&(l.size=n.size);break;default:l=typeof n.is=="string"?s.createElement(o,{is:n.is}):s.createElement(o)}}l[tt]=t,l[Vt]=n;e:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)l.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break e;for(;s.sibling===null;){if(s.return===null||s.return===t)break e;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=l;e:switch(ot(l,o,n),o){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&Wa(t)}}return $e(t),t.subtreeFlags&=-33554433,ud(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&Wa(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(C(166));if(e=Vn.current,Pi(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,o=Je,o!==null)switch(o.tag){case 27:case 5:n=o.memoizedProps}e[tt]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||Dy(e.nodeValue,a)),e||In(t,!0)}else e=Jl(e).createTextNode(n),e[tt]=t,t.stateNode=e}return $e(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=Pi(t),a!==null){if(e===null){if(!n)throw Error(C(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(C(557));e[tt]=t}else bi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;$e(t),e=!1}else a=id(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(qt(t),t):(qt(t),null);if((t.flags&128)!==0)throw Error(C(558))}return $e(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=Pi(t),n!==null&&n.dehydrated!==null){if(e===null){if(!o)throw Error(C(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(C(317));o[tt]=t}else bi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;$e(t),o=!1}else o=id(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(qt(t),t):(qt(t),null)}return qt(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,o=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(o=n.alternate.memoizedState.cachePool.pool),l=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(l=n.memoizedState.cachePool.pool),l!==o&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),bs(t,t.updateQueue),$e(t),null);case 4:return Eo(),e===null&&$m(t.stateNode.containerInfo),t.flags|=67108864,$e(t),null;case 10:return nn(t.type),$e(t),null;case 19:if(Ph(t),n=t.memoizedState,n===null)return $e(t),null;if(o=(t.flags&128)!==0,l=n.rendering,l===null)if(o)bl(n,!1);else{if(Ve!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(l=au(e),l!==null){for(t.flags|=128,bl(n,!1),e=l.updateQueue,t.updateQueue=e,bs(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Jb(a,e),a=a.sibling;return Xl(t,it.current&1|2),W&&en(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&Gt()>hu&&(t.flags|=128,o=!0,bl(n,!1),t.lanes=4194304)}else{if(!o)if(e=au(l),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,bs(t,e),bl(n,!0),n.tail===null&&n.tailMode!=="collapsed"&&n.tailMode!=="visible"&&!l.alternate&&!W)return $e(t),null}else 2*Gt()-n.renderingStartTime>hu&&a!==536870912&&(t.flags|=128,o=!0,bl(n,!1),t.lanes=4194304);n.isBackwards?(l.sibling=t.child,t.child=l):(e=n.last,e!==null?e.sibling=l:t.child=l,n.last=l)}if(n.tail!==null){e=n.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return n.rendering=e,n.tail=e.sibling,n.renderingStartTime=Gt(),e.sibling=null,l=it.current,l=o?l&1|2:l&1,n.tailMode==="visible"||n.tailMode==="collapsed"||!a||W?Xl(t,l):(a=l,Se(lt,t),Se(it,a),mt===null&&(mt=t)),W&&en(t,n.treeForkCount),e}return $e(t),null;case 22:case 23:return qt(t),Fh(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&($e(t),t.subtreeFlags&6&&(t.flags|=8192)):$e(t),a=t.updateQueue,a!==null&&bs(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&nt(fi),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),nn(Le),$e(t),null;case 25:return null;case 30:return t.flags|=33554432,$e(t),null}throw Error(C(156,t.tag))}function $$(e,t){switch(Xh(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return nn(Le),Eo(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Xs(t),null;case 31:if(t.memoizedState!==null){if(qt(t),t.alternate===null)throw Error(C(340));bi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(qt(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(C(340));bi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Ph(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Eo(),null;case 10:return nn(t.type),null;case 22:case 23:return qt(t),Fh(),e!==null&&nt(fi),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return nn(Le),null;case 25:return null;default:return null}}function Kv(e,t){switch(Xh(t),t.tag){case 3:nn(Le),Eo();break;case 26:case 27:case 5:Xs(t);break;case 4:Eo();break;case 31:t.memoizedState!==null&&qt(t);break;case 13:qt(t);break;case 19:Ph(t);break;case 10:nn(t.type);break;case 22:case 23:qt(t),Fh(),e!==null&&nt(fi);break;case 24:nn(Le)}}function ur(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var o=n.next;a=o;do{if((a.tag&e)===e){n=void 0;var l=a.create,s=a.inst;n=l(),s.destroy=n}a=a.next}while(a!==o)}}catch(c){me(t,t.return,c)}}function Qn(e,t,a){try{var n=t.updateQueue,o=n!==null?n.lastEffect:null;if(o!==null){var l=o.next;n=l;do{if((n.tag&e)===e){var s=n.inst,c=s.destroy;if(c!==void 0){s.destroy=void 0,o=t;var h=a,g=c;try{g()}catch(w){me(o,h,w)}}}n=n.next}while(n!==l)}}catch(w){me(t,t.return,w)}}function Jv(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{lv(t,a)}catch(n){me(e,e.return,n)}}}function Fv(e,t,a){a.props=Ni(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){me(e,t,n)}}function Ua(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:var o=e.stateNode,l=ln(e.memoizedProps,o);(o.ref===null||o.ref.name!==l)&&(o.ref=By(l)),n=o.ref;break;case 7:if(e.stateNode===null){var s=new Qt(e);Rt(e.child,!1,cN,s,void 0,void 0),e.stateNode=s}n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(c){me(e,t,c)}}function et(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(o){me(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){me(e,t,o)}else a.current=null}function ru(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)Iy(e.stateNode,t[a])}function Sp(e){for(var t=e.return;t!==null&&(gm(t)&&Iy(e.stateNode,t.stateNode),!fm(t));)t=t.return}function Dl(e){for(var t=e.return;t!==null&&(gm(t)&&dN(e.stateNode,t.stateNode),!fm(t));)t=t.return}function fm(e){return e.tag===5||e.tag===3||e.tag===27}function gm(e){return e&&e.tag===7&&e.stateNode!==null}function ih(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(o){me(e,e.return,o)}}function cd(e,t,a){try{var n=e.stateNode;X$(n,e.type,a,t),n[Vt]=t}catch(o){me(e,e.return,o)}}function Pv(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Jn(e.type)||e.tag===4}function dd(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Pv(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Jn(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function oh(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=Ba)),ru(e,n),oe=!0;else if(o!==4&&(o===27&&(ru(e,n),n=null,Jn(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(oh(e,t,a,n),e=e.sibling;e!==null;)oh(e,t,a,n),e=e.sibling}function su(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),ru(e,n),oe=!0;else if(o!==4&&(o===27&&(ru(e,n),n=null,Jn(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(su(e,t,a,n),e=e.sibling;e!==null;)su(e,t,a,n),e=e.sibling}function Wv(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);ot(t,n,a),t[tt]=e,t[Vt]=a}catch(l){me(e,e.return,l)}}var uu=!1,Lt=null;function Tp(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(uu=!0)}var qa=null;function Ep(){var e=qa;return qa=null,e}var zt=0;function Go(e,t,a,n,o){return zt=0,ey(e.child,t,a,n,o)}function ey(e,t,a,n,o){for(var l=!1;e!==null;){if(e.tag===5){var s=e.stateNode;if(n!==null){var c=Th(s);n.push(c),c.view&&(l=!0)}else l||Th(s).view&&(l=!0);uu=!0,Uy(s,zt===0?t:t+"_"+zt,a),zt++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||ey(e.child,t,a,n,o)&&(l=!0));e=e.sibling}return l}function Xa(e,t){for(;e!==null;)e.tag===5?qy(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||Xa(e.child,t)),e=e.sibling}function Ds(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Ds(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(C(544));var a=t.name;t=hn(t.default,t.share),t!=="none"&&(Go(e,a,t,null,!1)||Xa(e.child,!1))}e=e.sibling}}function lh(e,t){if(e.tag===30){var a=e.stateNode,n=e.memoizedProps,o=ln(n,a),l=hn(n.default,a.paired?n.share:n.enter);l!=="none"?Go(e,o,l,null,!1)?(Ds(e),a.paired||t||Mo(e,n.onEnter)):Xa(e.child,!1):Ds(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)lh(e,t),e=e.sibling;else Ds(e)}function rh(e){if(Lt!==null&&Lt.size!==0){var t=Lt;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,n=a.name;if(n!=null&&n!=="auto"){var o=t.get(n);if(o!==void 0){var l=hn(a.default,a.share);if(l!=="none"&&(Go(e,n,l,null,!1)?(l=e.stateNode,o.paired=l,l.paired=o,Mo(e,a.onShare)):Xa(e.child,!1)),t.delete(n),t.size===0)break}}}rh(e)}e=e.sibling}}}function sh(e){if(e.tag===30){var t=e.memoizedProps,a=ln(t,e.stateNode),n=Lt!==null?Lt.get(a):void 0,o=hn(t.default,n!==void 0?t.share:t.exit);o!=="none"&&(Go(e,a,o,null,!1)?n!==void 0?(o=e.stateNode,n.paired=o,o.paired=n,Lt.delete(a),Mo(e,t.onShare)):Mo(e,t.onExit):Xa(e.child,!1)),Lt!==null&&rh(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)sh(e),e=e.sibling;else Lt!==null&&rh(e)}function ty(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=ln(t,e.stateNode);t=hn(t.default,t.update),e.flags&=-5,t!=="none"&&Go(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&ty(e);e=e.sibling}}function uh(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,Xa(e.child,!1))}uh(e)}e=e.sibling}}function _s(e){if(e.tag===30)e.stateNode.paired=null,Xa(e.child,!1),uh(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)_s(e),e=e.sibling;else uh(e)}function ay(e){for(e=e.child;e!==null;)e.tag===30?Xa(e.child,!1):(e.subtreeFlags&33554432)!==0&&ay(e),e=e.sibling}function pm(e,t,a,n,o,l,s){for(var c=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(l!==null&&zt<l.length){var g=l[zt],w=Th(h);(g.view||w.view)&&(c=!0);var $;if($=(e.flags&4)===0)if(w.clip)$=!0;else{$=g.rect;var f=w.rect;$=$.y!==f.y||$.x!==f.x||$.height!==f.height||$.width!==f.width}$&&(e.flags|=4),w.abs?w=!g.abs:(g=g.rect,w=w.rect,w=g.height!==w.height||g.width!==w.width),w&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&Uy(h,zt===0?a:a+"_"+zt,o),c&&(e.flags&4)!==0||(qa===null&&(qa=[]),qa.push(h,zt===0?n:n+"_"+zt,t.memoizedProps)),zt++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&s?e.flags|=t.flags&32:pm(e,t.child,a,n,o,l,s)&&(c=!0));t=t.sibling}return c}function ny(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,n=e.stateNode,o=ln(a,n),l=hn(a.default,a.update);if(t){n=n.clones;var s=n===null?null:n.map(P$)}else s=e.memoizedState,e.memoizedState=null;n=e;var c=e.child;zt=0,o=pm(n,c,o,o,l,s,!1),(e.flags&4)!==0&&o&&(t||Mo(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&ny(e,t);e=e.sibling}}var Qe=!1,ce=!1,Da=!1,hd=!1,kp=typeof WeakSet=="function"?WeakSet:Set,Ze=null,_a=!1,Tl=!1,cu=!1,ch=!1;function N$(e,t,a){if(e=e.containerInfo,$h=Ho,e=Gb(e),Gh(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var l=o.anchorOffset,s=o.focusNode;o=o.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var c=0,h=-1,g=-1,w=0,$=0,f=e,y=null;t:for(;;){for(var A;f!==n||l!==0&&f.nodeType!==3||(h=c+l),f!==s||o!==0&&f.nodeType!==3||(g=c+o),f.nodeType===3&&(c+=f.nodeValue.length),(A=f.firstChild)!==null;)y=f,f=A;for(;;){if(f===e)break t;if(y===n&&++w===l&&(h=c),y===s&&++$===o&&(g=c),(A=f.nextSibling)!==null)break;f=y,y=f.parentNode}f=A}n=h===-1||g===-1?null:{start:h,end:g}}else n=null}n=n||{start:0,end:0}}else n=null;for(Nh={focusedElem:e,selectionRange:n},Ho=!1,a=(a&335544064)===a,Ze=t,t=a?9270:1024;Ze!==null;){if(e=Ze,a&&(n=e.deletions,n!==null))for(l=0;l<n.length;l++)a&&sh(n[l]);if(e.alternate===null&&(e.flags&2)!==0)a&&Tp(e),vs(a);else{if(e.tag===22){if(n=e.alternate,e.memoizedState!==null){n!==null&&n.memoizedState===null&&a&&sh(n),vs(a);continue}else if(n!==null&&n.memoizedState!==null){a&&Tp(e),vs(a);continue}}n=e.child,(e.subtreeFlags&t)!==0&&n!==null?(n.return=e,Ze=n):(a&&ty(e),vs(a))}}Lt=null}function vs(e){for(;Ze!==null;){var t=Ze,a=e,n=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&n!==null){a=void 0,o=n.memoizedProps,n=n.memoizedState;var l=t.stateNode;try{var s=Ni(t.type,o);a=l.getSnapshotBeforeUpdate(s,n),l.__reactInternalSnapshotBeforeUpdate=a}catch(c){me(t,t.return,c)}}break;case 3:if((o&1024)!==0){if(n=t.stateNode.containerInfo,a=n.nodeType,a===9)Eh(n);else if(a===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":Eh(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&n!==null&&(a=ln(n.memoizedProps,n.stateNode),o=t.memoizedProps,o=hn(o.default,o.update),o!=="none"&&Go(n,a,o,n.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(C(163))}if(n=t.sibling,n!==null){n.return=t.return,Ze=n;break}Ze=t.return}}function iy(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:Ha(e,a),n&4&&ur(5,a);break;case 1:if(Ha(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(s){me(a,a.return,s)}else{var o=Ni(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(s){me(a,a.return,s)}}n&64&&Jv(a),n&512&&Ua(a,a.return);break;case 3:if(Ha(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{lv(e,t)}catch(s){me(a,a.return,s)}}break;case 27:t===null&&n&4&&Wv(a);case 26:case 5:Ha(e,a),t===null&&n&4&&ih(a),n&512&&Ua(a,a.return);break;case 12:Ha(e,a);break;case 31:Ha(e,a),n&4&&sy(e,a);break;case 13:Ha(e,a),n&4&&uy(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=D$.bind(null,a),fN(e,a))));break;case 22:if(n=a.memoizedState!==null||Qe,!n){var l=t!==null&&t.memoizedState!==null||ce;t=Qe,o=ce,Qe=n,(ce=l)&&!o?(n=2,(a.subtreeFlags&8772)!==0&&(n|=1),ya(e,a,n)):Ha(e,a),Qe=t,ce=o}break;case 30:Ha(e,a),n&512&&Ua(a,a.return);break;case 7:n&512&&Ua(a,a.return);default:Ha(e,a)}}function dh(e,t){for(e=e.child;e!==null;)oy(e,t),e=e.sibling}function oy(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var n=a.style;typeof n.setProperty=="function"?n.setProperty("display","none","important"):n.display="none"}else{var o=e.stateNode,l=e.memoizedProps.style,s=l!=null&&l.hasOwnProperty("display")?l.display:null;o.style.display=s==null||typeof s=="boolean"?"":(""+s).trim()}}catch(h){me(e,e.return,h)}hh(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,oe=!0}catch(h){me(e,e.return,h)}break;case 18:try{var c=e.stateNode;t?Yp(c,!0):Yp(e.stateNode,!1)}catch(h){me(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&dh(e,t);break;default:dh(e,t)}}function hh(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,n=t;switch(a.tag){case 4:oy(a,n);break e;case 22:a.memoizedState===null&&hh(a,n);break e;default:hh(a,n)}}e=e.sibling}}function ly(e){var t=e.alternate;t!==null&&(e.alternate=null,ly(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&wu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Ce=null,Ct=!1;function va(e,t,a){for(a=a.child;a!==null;)ry(e,t,a),a=a.sibling}function ry(e,t,a){if(Yt&&typeof Yt.onCommitFiberUnmount=="function")try{Yt.onCommitFiberUnmount(ar,a)}catch{}switch(a.tag){case 26:ce||et(a,t),va(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!ce&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:ce||et(a,t),Dl(a);var n=Ce,o=Ct;Jn(a.type)&&(Ce=a.stateNode,Ct=!1),va(e,t,a),Zy(a.stateNode,a.type,a.memoizedProps),Ce=n,Ct=o;break;case 5:ce||et(a,t),Dl(a);case 6:if(a.tag===6&&Dl(a),n=Ce,o=Ct,Ce=null,va(e,t,a),Ce=n,Ct=o,Ce!==null)if(Ct)try{(Ce.nodeType===9?Ce.body:Ce.nodeName==="HTML"?Ce.ownerDocument.body:Ce).removeChild(a.stateNode),oe=!0}catch(l){me(a,t,l)}else try{Ce.removeChild(a.stateNode),oe=!0}catch(l){me(a,t,l)}break;case 18:Ce!==null&&(Ct?(e=Ce,Gp(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),Uo(e)):Gp(Ce,a.stateNode));break;case 4:n=Ce,o=Ct,Ce=a.stateNode.containerInfo,Ct=!0,va(e,t,a),Ce=n,Ct=o;break;case 0:case 11:case 14:case 15:Qn(2,a,t),ce||Qn(4,a,t),va(e,t,a);break;case 1:ce||(et(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&Fv(a,t,n)),va(e,t,a);break;case 21:va(e,t,a);break;case 22:ce=(n=ce)||a.memoizedState!==null,va(e,t,a),ce=n;break;case 30:et(a,t),va(e,t,a);break;case 7:ce||et(a,t),va(e,t,a);break;default:va(e,t,a)}}function sy(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Uo(e)}catch(a){me(t,t.return,a)}}}function uy(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Uo(e)}catch(a){me(t,t.return,a)}}function S$(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new kp),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new kp),t;default:throw Error(C(435,e.tag))}}function ys(e,t){var a=S$(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var o=_$.bind(null,e,n);n.then(o,o)}})}function wt(e,t,a){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var l=n[o],s=e,c=t,h=c;e:for(;h!==null;){switch(h.tag){case 27:if(Jn(h.type)){Ce=h.stateNode,Ct=!1;break e}break;case 5:Ce=h.stateNode,Ct=!1;break e;case 3:case 4:Ce=h.stateNode.containerInfo,Ct=!0;break e}h=h.return}if(Ce===null)throw Error(C(160));ry(s,c,l),Ce=null,Ct=!1,s=l.alternate,s!==null&&(s.return=null),l.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)cy(t,e,a),t=t.sibling}var wa=null;function cy(e,t,a){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(n=e.updateQueue,n=n!==null?n.events:null,n!==null))for(var l=0;l<n.length;l++){var s=n[l];s.ref.impl=s.nextImpl}wt(t,e,a),xt(e),o&4&&(Qn(3,e,e.return),ur(3,e),Qn(5,e,e.return));break;case 1:wt(t,e,a),xt(e),o&512&&(ce||n===null||et(n,n.return)),o&64&&Qe&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(l=wa,wt(t,e,a),xt(e),o&512&&(ce||n===null||et(n,n.return)),o&4)if(o=n!==null?n.memoizedState:null,a=e.memoizedState,n===null)if(a===null)if(e.stateNode===null)if(Qe)e.stateNode=Hy(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=l.ownerDocument||l;t:switch(t){case"title":n=o.getElementsByTagName("title")[0],(!n||n[or]||n[tt]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=o.createElement(t),o.head.insertBefore(n,o.querySelector("head > title"))),ot(n,t,a),n[tt]=e,Ke(n),t=n;break e;case"link":if(l=Fp("link","href",o).get(t+(a.href||""))){for(s=0;s<l.length;s++)if(n=l[s],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){l.splice(s,1);break t}}n=o.createElement(t),ot(n,t,a),o.head.appendChild(n);break;case"meta":if(l=Fp("meta","content",o).get(t+(a.content||""))){for(s=0;s<l.length;s++)if(n=l[s],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){l.splice(s,1);break t}}n=o.createElement(t),ot(n,t,a),o.head.appendChild(n);break;default:throw Error(C(468,t))}n[tt]=e,Ke(n),t=n}e.stateNode=t}else Qe||Ah(l,e.type,e.stateNode);else e.stateNode=Jp(l,a,e.memoizedProps);else o!==a?(o===null?(t=n.stateNode,t===null||ce||t.parentNode.removeChild(t)):o.count--,a===null?Qe||Ah(l,e.type,e.stateNode):Jp(l,a,e.memoizedProps)):a===null&&e.stateNode!==null&&cd(e,e.memoizedProps,n.memoizedProps);break;case 27:wt(t,e,a),xt(e),o&512&&(ce||n===null||et(n,n.return)),n!==null&&o&4&&cd(e,e.memoizedProps,n.memoizedProps);break;case 5:if(l=Da,Da=!1,wt(t,e,a),Da=l,xt(e),o&512&&(ce||n===null||et(n,n.return)),e.flags&32){t=e.stateNode;try{Co(t,""),oe=!0}catch(w){me(e,e.return,w)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,cd(e,t,n!==null?n.memoizedProps:t)),o&1024&&(hd=!0);break;case 6:if(wt(t,e,a),xt(e),o&4){if(e.stateNode===null)throw Error(C(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,oe=!0}catch(w){me(e,e.return,w)}}break;case 3:if(oe=!1,Ls=null,l=wa,wa=Fl(t.containerInfo),wt(t,e,a),wa=l,xt(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{Uo(t.containerInfo)}catch(w){me(e,e.return,w)}hd&&(hd=!1,dy(e)),oe=!1;break;case 4:o=Da,Da=Qe,n=Rg(),l=wa,wa=Fl(e.stateNode.containerInfo),wt(t,e,a),xt(e),wa=l,oe&&Tl&&(cu=!0),oe=n,Da=o;break;case 12:wt(t,e,a),xt(e);break;case 31:wt(t,e,a),xt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,ys(e,t)));break;case 13:wt(t,e,a),xt(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Ru=Gt()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,ys(e,t)));break;case 22:l=e.memoizedState!==null,s=n!==null&&n.memoizedState!==null;var c=Qe,h=ce,g=Da;Qe=c||l,Da=g||l,ce=h||s,wt(t,e,a),ce=h,Da=g,Qe=c,xt(e),o&8192&&(t=e.stateNode,t._visibility=l?t._visibility&-2:t._visibility|1,!l||n===null||s||Qe||ce||(t=s||ce,a=Qe,n=ce,Qe=l||Qe,ce=t,Sn(e,2),Qe=a,ce=n),!l&&Da||dh(e,l)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,ys(e,a))));break;case 19:wt(t,e,a),xt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,ys(e,t)));break;case 30:o&512&&(ce||n===null||et(n,n.return)),o=Rg(),l=Tl,s=(a&335544064)===a,c=e.memoizedProps,Tl=s&&hn(c.default,c.update)!=="none",wt(t,e,a),xt(e),s&&n!==null&&oe&&(e.flags|=4),Tl=l,oe=o;break;case 21:break;case 7:o&512&&(ce||n===null||et(n,n.return)),n&&n.stateNode!==null&&(n.stateNode._fragmentFiber=e);default:wt(t,e,a),xt(e)}}function xt(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(Pv(n)){a=n;break}n=n.return}n=null;for(var o=e.return;o!==null;){if(gm(o)){var l=o.stateNode;n===null?n=[l]:n.push(l)}if(fm(o))break;o=o.return}var s=n;if(a==null)throw Error(C(160));switch(a.tag){case 27:var c=a.stateNode,h=dd(e);su(e,h,c,s);break;case 5:var g=a.stateNode;a.flags&32&&(Co(g,""),a.flags&=-33);var w=dd(e);su(e,w,g,s);break;case 3:case 4:var $=a.stateNode.containerInfo,f=dd(e);oh(e,f,$,s);break;default:throw Error(C(161))}}catch(y){me(e,e.return,y)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function dy(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;dy(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,Ho=!0,t.reset(),Ho=!1),e=e.sibling}}function Wi(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)hy(t,e),t=t.sibling;else ny(t,!1)}function hy(e,t){var a=e.alternate;if(a===null)lh(e,!1);else switch(e.tag){case 3:if(ch=_a=!1,Ep(),Wi(t,e),!_a&&!cu){if(e=qa,e!==null)for(var n=0;n<e.length;n+=3){a=e[n];var o=e[n+1];qy(a,e[n+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),ch=!0}qa=null;break;case 5:Wi(t,e);break;case 4:n=_a,_a=!1,Wi(t,e),_a&&(cu=!0),_a=n;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?lh(e,!1):Wi(t,e));break;case 30:n=_a,o=Ep(),_a=!1,Wi(t,e),_a&&(e.flags|=4);var l=e.memoizedProps,s=e.stateNode;t=ln(l,s),s=ln(a.memoizedProps,s);var c=hn(l.default,l.update);c==="none"?t=!1:(l=a.memoizedState,a.memoizedState=null,a=e.child,zt=0,t=pm(e,a,t,s,c,l,!0),zt!==(l===null?0:l.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(Mo(e,e.memoizedProps.onUpdate),qa=o):o!==null&&(o.push.apply(o,qa),qa=o),_a=(e.flags&32)!==0?!0:n;break;default:Wi(t,e)}}function Ha(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)iy(e,t.alternate,t),t=t.sibling}function Sn(e,t){for(e=e.child;e!==null;){var a=e,n=t;switch(a.tag){case 0:case 11:case 14:case 15:Qn(4,a,a.return),Sn(a,n);break;case 1:et(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&Fv(a,a.return,o),Sn(a,n);break;case 27:(n&2)!==0&&Zy(a.stateNode,a.type,a.memoizedProps);case 5:et(a,a.return),a.tag!==5&&a.tag!==27||Dl(a),Sn(a,n);break;case 6:Dl(a);break;case 26:et(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||ce||o.parentNode.removeChild(o),Sn(a,n);break;case 22:a.memoizedState===null&&Sn(a,n);break;case 30:et(a,a.return),Sn(a,n);break;case 7:et(a,a.return);default:Sn(a,n)}e=e.sibling}}function ya(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var n=t.alternate,o=e,l=t,s=l.flags,c=(a&1)!==0;switch(l.tag){case 0:case 11:case 15:ya(o,l,a),ur(4,l);break;case 1:if(ya(o,l,a),n=l,o=n.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch(w){me(n,n.return,w)}if(n=l,o=n.updateQueue,o!==null){var h=n.stateNode;try{var g=o.shared.hiddenCallbacks;if(g!==null)for(o.shared.hiddenCallbacks=null,o=0;o<g.length;o++)ov(g[o],h)}catch(w){me(n,n.return,w)}}c&&s&64&&Jv(l),Ua(l,l.return);break;case 27:(a&2)!==0&&Wv(l);case 5:l.tag!==5&&l.tag!==27||Sp(l),ya(o,l,a),c&&n===null&&s&4&&ih(l),Ua(l,l.return);break;case 6:Sp(l);break;case 26:h=l.stateNode,l.memoizedState!==null||h===null||Qe||Ah(Fl(h.ownerDocument),l.type,h),ya(o,l,a),c&&n===null&&s&4&&ih(l),Ua(l,l.return);break;case 12:ya(o,l,a);break;case 31:ya(o,l,a),c&&s&4&&sy(o,l);break;case 13:ya(o,l,a),c&&s&4&&uy(o,l);break;case 22:l.memoizedState===null&&ya(o,l,a),Ua(l,l.return);break;case 30:ya(o,l,a),Ua(l,l.return);break;case 7:Ua(l,l.return);default:ya(o,l,a)}t=t.sibling}}function bm(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&rr(a))}function vm(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&rr(e))}function na(e,t,a,n){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)my(e,t,a,n),t=t.sibling;else o&&ay(t)}function my(e,t,a,n){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&_s(t);var l=t.flags;switch(t.tag){case 0:case 11:case 15:na(e,t,a,n),l&2048&&ur(9,t);break;case 1:na(e,t,a,n);break;case 3:na(e,t,a,n),o&&ch&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),l&2048&&(l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&rr(l)));break;case 12:if(l&2048){na(e,t,a,n),l=t.stateNode;try{var s=t.memoizedProps,c=s.id,h=s.onPostCommit;typeof h=="function"&&h(c,t.alternate===null?"mount":"update",l.passiveEffectDuration,-0)}catch(g){me(t,t.return,g)}}else na(e,t,a,n);break;case 31:na(e,t,a,n);break;case 13:na(e,t,a,n);break;case 23:break;case 22:s=t.stateNode,c=t.alternate,t.memoizedState!==null?(o&&c!==null&&c.memoizedState===null&&_s(c),s._visibility&2?na(e,t,a,n):_l(e,t)):(o&&c!==null&&c.memoizedState!==null&&_s(t),s._visibility&2?na(e,t,a,n):(s._visibility|=2,to(e,t,a,n,(t.subtreeFlags&10256)!==0||!1))),l&2048&&bm(c,t);break;case 24:na(e,t,a,n),l&2048&&vm(t.alternate,t);break;case 30:o&&(l=t.alternate,l!==null&&(Xa(l.child,!0),Xa(t.child,!0))),na(e,t,a,n);break;default:na(e,t,a,n)}}function to(e,t,a,n,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var l=e,s=t,c=a,h=n,g=s.flags;switch(s.tag){case 0:case 11:case 15:to(l,s,c,h,o),ur(8,s);break;case 23:break;case 22:var w=s.stateNode;s.memoizedState!==null?w._visibility&2?to(l,s,c,h,o):_l(l,s):(w._visibility|=2,to(l,s,c,h,o)),o&&g&2048&&bm(s.alternate,s);break;case 24:to(l,s,c,h,o),o&&g&2048&&vm(s.alternate,s);break;default:to(l,s,c,h,o)}t=t.sibling}}function _l(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,o=n.flags;switch(n.tag){case 22:_l(a,n),o&2048&&bm(n.alternate,n);break;case 24:_l(a,n),o&2048&&vm(n.alternate,n);break;default:_l(a,n)}t=t.sibling}}var ui=8192;function li(e,t,a){if(e.subtreeFlags&ui)for(e=e.child;e!==null;)fy(e,t,a),e=e.sibling}function fy(e,t,a){switch(e.tag){case 26:li(e,t,a),e.flags&ui&&(e.memoizedState!==null?CN(a,wa,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Wp(a,e)));break;case 5:li(e,t,a),e.flags&ui&&(e=e.stateNode,(t&335544128)===t&&Wp(a,e));break;case 3:case 4:var n=wa;wa=Fl(e.stateNode.containerInfo),li(e,t,a),wa=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=ui,ui=16777216,li(e,t,a),ui=n):li(e,t,a));break;case 30:if((e.flags&ui)!==0&&(n=e.memoizedProps.name,n!=null&&n!=="auto")){var o=e.stateNode;o.paired=null,Lt===null&&(Lt=new Map),Lt.set(n,o)}li(e,t,a);break;default:li(e,t,a)}}function gy(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function vl(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];Ze=n,by(n,e)}gy(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)py(e),e=e.sibling}function py(e){switch(e.tag){case 0:case 11:case 15:vl(e),e.flags&2048&&Qn(9,e,e.return);break;case 3:vl(e);break;case 12:vl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Hs(e)):vl(e);break;default:vl(e)}}function Hs(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];Ze=n,by(n,e)}gy(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Qn(8,t,t.return),Hs(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Hs(t));break;default:Hs(t)}e=e.sibling}}function by(e,t){for(;Ze!==null;){var a=Ze;switch(a.tag){case 0:case 11:case 15:Qn(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:rr(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,Ze=n;else e:for(a=e;Ze!==null;){n=Ze;var o=n.sibling,l=n.return;if(ly(n),n===a){Ze=null;break e}if(o!==null){o.return=l,Ze=o;break e}Ze=l}}}var T$={getCacheForType:function(e){var t=at(Le),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return at(Le).controller.signal}},E$=typeof WeakMap=="function"?WeakMap:Map,le=0,ve=null,te=null,ne=0,de=0,Ht=null,Mn=!1,Yo=!1,ym=!1,cn=0,Ve=0,Zn=0,pi=0,du=0,Bt=0,zo=0,Hl=null,At=null,mh=!1,Ru=0,vy=0,hu=1/0,mu=null,Ln=null,ze=0,$a=null,Si=null,Ia=0,fh=0,gh=null,yy=null,No=null,So=null,To=null,Ul=0,Us=null;function It(){return(le&2)!==0&&ne!==0?ne&-ne:Z.T!==null?xm():Nb()}function wy(){if(Bt===0)if((ne&536870912)===0||W){var e=ls;ls<<=1,(ls&3932160)===0&&(ls=262144),Bt=e}else Bt=536870912;return e=lt.current,e!==null&&(e.flags|=32),Bt}function Mo(e,t){if(t!=null){var a=e.stateNode,n=a.ref;n===null&&(n=a.ref=By(ln(e.memoizedProps,a))),So===null&&(So=[]),So.push(t.bind(null,n))}}function Ot(e,t,a){(e===ve&&(de===2||de===9)||e.cancelPendingCommit!==null)&&(Oo(e,0),On(e,ne,Bt,!1)),ir(e,a),((le&2)===0||e!==ve)&&(e===ve&&((le&2)===0&&(pi|=a),Ve===4&&On(e,ne,Bt,!1)),Za(e))}function xy(e,t,a){if((le&6)!==0)throw Error(C(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||nr(e,t),o=n?A$(e,t):md(e,t,!0),l=n;do{if(o===0){Yo&&!n&&On(e,t,0,!1);break}else{if(a=e.current.alternate,l&&!k$(a)){o=md(e,t,!1),l=!1;continue}if(o===2){if(l=t,e.errorRecoveryDisabledLanes&l)var s=0;else s=e.pendingLanes&-536870913,s=s!==0?s:s&536870912?536870912:0;if(s!==0){t=s;e:{var c=e;o=Hl;var h=c.current.memoizedState.isDehydrated;if(h&&(Oo(c,s).flags|=256),s=md(c,s,!1),s!==2&&s!==6){if(ym&&!h){c.errorRecoveryDisabledLanes|=l,pi|=l,o=4;break e}l=At,At=o,l!==null&&(At===null?At=l:At.push.apply(At,l))}o=s}if(l=!1,o!==2)continue}}if(o===1){Oo(e,0),On(e,t,0,!0);break}e:{switch(n=e,l=o,l){case 0:case 1:throw Error(C(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:On(n,t,Bt,!Mn);break e;case 2:At=null;break;case 3:case 5:break;default:throw Error(C(329))}if((t&62914560)===t&&(o=Ru+300-Gt(),10<o)){if(On(n,t,Bt,!Mn),yu(n,0,!0)!==0)break e;Ia=t,n.timeoutHandle=Nm(Cp.bind(null,n,a,At,mu,mh,t,Bt,pi,zo,Mn,l,"Throttled",-0,0),o);break e}Cp(n,a,At,mu,mh,t,Bt,pi,zo,Mn,l,null,-0,0)}}break}while(!0);Za(e)}function Cp(e,t,a,n,o,l,s,c,h,g,w,$,f,y){e.timeoutHandle=-1;var A=t.subtreeFlags,S=(l&335544064)===l;if($=null,(S||A&8192||(A&16785408)===16785408)&&($={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Ba},Lt=null,fy(t,l,$),S&&(A=$,S=e.containerInfo,S=(S.nodeType===9?S:S.ownerDocument).__reactViewTransition,S!=null&&(A.count++,A.waitingForViewTransition=!0,A=Pl.bind(A),S.finished.then(A,A))),A=(l&62914560)===l?Ru-Gt():(l&4194048)===l?vy-Gt():0,A=AN($,A),A!==null)){Ia=l,e.cancelPendingCommit=A(zp.bind(null,e,t,l,a,n,o,s,c,h,g,w,$,null,f,y)),On(e,l,s,!g);return}zp(e,t,l,a,n,o,s,c,h,g,w,$)}function k$(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var o=a[n],l=o.getSnapshot;o=o.value;try{if(!Xt(l(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function On(e,t,a,n){t=vb(e,t),t&=~du,t&=~pi,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var o=t;0<o;){var l=31-jt(o),s=1<<l;n[l]=-1,o&=~s}a!==0&&wb(e,a,t)}function Vu(){return(le&6)===0?(cr(0,!1),!1):!0}function wm(){if(te!==null){if(de===0)var e=te.return;else e=te,tn=Ai=null,nm(e),wo=null,Il=0,e=te;for(;e!==null;)Kv(e.alternate,e),e=e.return;te=null}}function Oo(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,K$(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),Ia=0,wm(),ve=e,te=a=an(e.current,null),ne=t,de=0,Ht=null,Mn=!1,Yo=nr(e,t),ym=!1,zo=Bt=du=pi=Zn=Ve=0,At=Hl=null,mh=!1,cn=vb(e,t),Su(),a}function $y(e,t){F=null,Z.H=ou,t===Bo||t===ku?(t=tp(),de=3):t===Kh?(t=tp(),de=4):de=t===dm?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Ht=t,te===null&&(Ve=1,lu(e,sa(t,e.current)))}function Ny(){var e=lt.current;return e===null?!0:(ne&4194048)===ne?mt===null:(ne&62914560)===ne||(ne&536870912)!==0?e===mt:!1}function Sy(){var e=Z.H;return Z.H=ou,e===null?ou:e}function Ty(){var e=Z.A;return Z.A=T$,e}function fu(){Ve=4,Mn||(ne&4194048)!==ne&&lt.current!==null||(Yo=!0),(Zn&134217727)===0&&(pi&134217727)===0||ve===null||On(ve,ne,Bt,!1)}function md(e,t,a){var n=le;le|=2;var o=Sy(),l=Ty();(ve!==e||ne!==t)&&(mu=null,Oo(e,t)),t=!1;var s=Ve;e:do try{if(de!==0&&te!==null){var c=te,h=Ht;switch(de){case 8:wm(),s=6;break e;case 3:case 2:case 9:case 6:lt.current===null&&(t=!0);var g=de;if(de=0,Ht=null,go(e,c,h,g),a&&Yo){s=0;break e}break;default:g=de,de=0,Ht=null,go(e,c,h,g)}}C$(),s=Ve;break}catch(w){$y(e,w)}while(!0);return t&&e.shellSuspendCounter++,tn=Ai=null,le=n,Z.H=o,Z.A=l,te===null&&(ve=null,ne=0,Su()),s}function C$(){for(;te!==null;)Ey(te)}function A$(e,t){var a=le;le|=2;var n=Sy(),o=Ty();ve!==e||ne!==t?(mu=null,hu=Gt()+500,Oo(e,t)):Yo=nr(e,t);e:do try{if(de!==0&&te!==null){t=te;var l=Ht;t:switch(de){case 1:de=0,Ht=null,go(e,t,l,1);break;case 2:case 9:if(ep(l)){de=0,Ht=null,Ap(t);break}t=function(){de!==2&&de!==9||ve!==e||(de=7),Za(e)},l.then(t,t);break e;case 3:de=7;break e;case 4:de=5;break e;case 7:ep(l)?(de=0,Ht=null,Ap(t)):(de=0,Ht=null,go(e,t,l,7));break;case 5:var s=null;switch(te.tag){case 26:s=te.memoizedState;case 5:case 27:var c=te;if(s?Fy(s):c.stateNode.complete){de=0,Ht=null;var h=c.sibling;if(h!==null)te=h;else{var g=c.return;g!==null?(te=g,Du(g)):te=null}break t}}de=0,Ht=null,go(e,t,l,5);break;case 6:de=0,Ht=null,go(e,t,l,6);break;case 8:wm(),Ve=6;break e;default:throw Error(C(462))}}z$();break}catch(w){$y(e,w)}while(!0);return tn=Ai=null,Z.H=n,Z.A=o,le=a,te!==null?0:(ve=null,ne=0,Su(),Ve)}function z$(){for(;te!==null&&!Q1();)Ey(te)}function Ey(e){var t=Zv(e.alternate,e,cn);e.memoizedProps=e.pendingProps,t===null?Du(e):te=t}function Ap(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=bp(a,t,t.pendingProps,t.type,void 0,ne);break;case 11:t=bp(a,t,t.pendingProps,t.type.render,t.ref,ne);break;case 5:nm(t);var n=t;n===Je&&(W?(Ps(n),n.tag===5&&n.stateNode!=null&&(Ne=n.stateNode)):(Ps(n),W=!0));default:Kv(a,t),t=te=Jb(t,cn),t=Zv(a,t,cn)}e.memoizedProps=e.pendingProps,t===null?Du(e):te=t}function go(e,t,a,n){tn=Ai=null,nm(t),wo=null,Il=0;var o=t.return;try{if(b$(e,o,t,a,ne)){Ve=1,lu(e,sa(a,e.current)),te=null;return}}catch(l){if(o!==null)throw te=o,l;Ve=1,lu(e,sa(a,e.current)),te=null;return}t.flags&32768?(W||n===1?e=!0:Yo||(ne&536870912)!==0?e=!1:(Mn=e=!0,(n===2||n===9||n===3||n===6)&&(n=lt.current,n!==null&&n.tag===13&&(n.flags|=16384))),ky(t,e)):Du(t)}function Du(e){var t=e;do{if((t.flags&32768)!==0){ky(t,Mn);return}e=t.return;var a=x$(t.alternate,t,cn);if(a!==null){te=a;return}if(t=t.sibling,t!==null){te=t;return}te=t=e}while(t!==null);Ve===0&&(Ve=5)}function ky(e,t){do{var a=$$(e.alternate,e);if(a!==null){a.flags&=32767,te=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){te=e;return}te=e=a}while(e!==null);Ve=6,te=null}function zp(e,t,a,n,o,l,s,c,h,g,w,$){e.cancelPendingCommit=null;do _u();while(ze!==0);if((le&6)!==0)throw Error(C(327));if(t!==null){if(t===e.current)throw Error(C(177));e===ve&&(te=ve=null,ne=0),Si=t,$a=e,Ia=a,gh=o,yy=n,M$(e,t,a,s,c,h,$)}}function M$(e,t,a,n,o,l,s){var c=t.lanes|t.childLanes;if(fh=c,c|=Yh,nx(e,a,c,n,o,l),So=null,(a&335544064)===a?(To=o$(e),n=10262):(To=null,n=10256),(t.subtreeFlags&n)!==0||(t.flags&n)!==0?(e.callbackNode=null,e.callbackPriority=0,H$(Qs,function(){return yh(),null})):(e.callbackNode=null,e.callbackPriority=0),uu=!1,n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=Z.T,Z.T=null,o=re.p,re.p=2,l=le,le|=4;try{N$(e,t,a)}finally{le=l,re.p=o,Z.T=n}}ze=1,uu?No=tN(s,e.containerInfo,To,ph,bh,R$,vh,yh,O$,null,null):(ph(),bh(),vh())}function O$(e){if(ze!==0){var t=$a.onRecoverableError;t(e,{componentStack:null})}}function R$(){ze===3&&(ze=0,hy(Si,$a),ze=4)}function ph(){if(ze===1){ze=0;var e=$a,t=Si,a=Ia,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=Z.T,Z.T=null;var o=re.p;re.p=2;var l=le;le|=4;try{Tl=cu=!1,cy(t,e,a),a=Nh;var s=Gb(e.containerInfo),c=a.focusedElem,h=a.selectionRange;if(s!==c&&c&&c.ownerDocument&&Bb(c.ownerDocument.documentElement,c)){if(h!==null&&Gh(c)){var g=h.start,w=h.end;if(w===void 0&&(w=g),"selectionStart"in c)c.selectionStart=g,c.selectionEnd=Math.min(w,c.value.length);else{var $=c.ownerDocument||document,f=$&&$.defaultView||window;if(f.getSelection){var y=f.getSelection(),A=c.textContent.length,S=Math.min(h.start,A),V=h.end===void 0?S:Math.min(h.end,A);!y.extend&&S>V&&(s=V,V=S,S=s);var b=Xg(c,S),p=Xg(c,V);if(b&&p&&(y.rangeCount!==1||y.anchorNode!==b.node||y.anchorOffset!==b.offset||y.focusNode!==p.node||y.focusOffset!==p.offset)){var x=$.createRange();x.setStart(b.node,b.offset),y.removeAllRanges(),S>V?(y.addRange(x),y.extend(p.node,p.offset)):(x.setEnd(p.node,p.offset),y.addRange(x))}}}}for($=[],y=c;y=y.parentNode;)y.nodeType===1&&$.push({element:y,left:y.scrollLeft,top:y.scrollTop});for(typeof c.focus=="function"&&c.focus(),c=0;c<$.length;c++){var T=$[c];T.element.scrollLeft=T.left,T.element.scrollTop=T.top}}Ho=!!$h,Nh=$h=null}finally{le=l,re.p=o,Z.T=n}}e.current=t,ze=2}}function bh(){if(ze===2){ze=0;var e=$a,t=Si,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=Z.T,Z.T=null;var n=re.p;re.p=2;var o=le;le|=4;try{iy(e,t.alternate,t)}finally{le=o,re.p=n,Z.T=a}}ze=3}}function vh(){if(ze===4||ze===3){ze=0;var e=No;No=null,Z1();var t=$a,a=Si,n=Ia,o=yy,l=(n&335544064)===n?10262:10256;if((a.subtreeFlags&l)!==0||(a.flags&l)!==0?ze=5:(ze=0,Si=$a=null,Cy(t,t.pendingLanes)),l=t.pendingLanes,l===0&&(Ln=null),_h(n),a=a.stateNode,Yt&&typeof Yt.onCommitFiberRoot=="function")try{Yt.onCommitFiberRoot(ar,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=Z.T,l=re.p,re.p=2,Z.T=null;try{for(var s=t.onRecoverableError,c=0;c<o.length;c++){var h=o[c];s(h.value,{componentStack:h.stack})}}finally{Z.T=a,re.p=l}}if(o=So,s=To,To=null,o!==null&&(So=null,s===null&&(s=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(s),a!==void 0&&e.finished.finally(a);(Ia&3)!==0&&_u(),Za(t),l=t.pendingLanes,(n&261930)!==0&&(l&42)!==0?t===Us?Ul++:(Ul=0,Us=t):(Ul=0,Us=null),cr(0,!1)}}function Cy(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,rr(t)))}function _u(){return No!==null&&(No.skipTransition(),No=null),ph(),bh(),vh(),yh()}function yh(){if(ze!==5)return!1;var e=$a,t=fh;fh=0;var a=_h(Ia),n=Z.T,o=re.p;try{re.p=32>a?32:a,Z.T=null,a=gh,gh=null;var l=$a,s=Ia;if(ze=0,Si=$a=null,Ia=0,(le&6)!==0)throw Error(C(331));var c=le;if(le|=4,py(l.current),my(l,l.current,s,a),le=c,cr(0,!1),Yt&&typeof Yt.onPostCommitFiberRoot=="function")try{Yt.onPostCommitFiberRoot(ar,l)}catch{}return!0}finally{re.p=o,Z.T=n,Cy(e,t)}}function Mp(e,t,a){t=sa(a,t),t=Pd(e.stateNode,t,2),e=Hn(e,t,2),e!==null&&(ir(e,2),Za(e))}function me(e,t,a){if(e.tag===3)Mp(e,e,a);else for(;t!==null;){if(t.tag===3){Mp(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(Ln===null||!Ln.has(n))){e=sa(a,e),a=Yv(2),n=Hn(t,a,2),n!==null&&(jv(a,n,t,e),ir(n,2),Za(n));break}}t=t.return}}function fd(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new E$;var o=new Set;n.set(t,o)}else o=n.get(t),o===void 0&&(o=new Set,n.set(t,o));o.has(a)||(ym=!0,o.add(a),e=V$.bind(null,e,t,a),t.then(e,e))}function V$(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,ve===e&&(ne&a)===a&&((Ve===4||Ve===3&&(ne&62914560)===ne&&300>Gt()-Ru)&&(le&2)===0?Oo(e,0):du|=a,zo===ne&&(zo=0)),Za(e)}function Ay(e,t){t===0&&(t=yb()),e=Ci(e,t),e!==null&&(ir(e,t),Za(e))}function D$(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Ay(e,a)}function _$(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(C(314))}n!==null&&n.delete(t),Ay(e,a)}function H$(e,t){return Vh(e,t)}var Ro=null,ao=null,wh=!1,gu=!1,gd=!1,Rn=0;function Za(e){e!==ao&&e.next===null&&(ao===null?Ro=ao=e:ao=ao.next=e),gu=!0,wh||(wh=!0,q$())}function cr(e,t){if(!gd&&gu){gd=!0;do for(var a=!1,n=Ro;n!==null;){if(!t)if(e!==0){var o=n.pendingLanes;if(o===0)var l=0;else{var s=n.suspendedLanes,c=n.pingedLanes;l=(1<<31-jt(42|e)+1)-1,l&=o&~(s&~c),l=l&201326741?l&201326741|1:l?l|2:0}l!==0&&(a=!0,Op(n,l))}else l=ne,l=yu(n,n===ve?l:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(l&3)===0||nr(n,l)||(a=!0,Op(n,l));n=n.next}while(a);gd=!1}}function U$(){zy()}function zy(){gu=wh=!1;var e=0;Rn!==0&&Z$()&&(e=Rn);for(var t=Gt(),a=null,n=Ro;n!==null;){var o=n.next,l=My(n,t);l===0?(n.next=null,a===null?Ro=o:a.next=o,o===null&&(ao=a)):(a=n,(e!==0||(l&3)!==0)&&(gu=!0)),n=o}ze!==0&&ze!==5||cr(e,!1),Rn!==0&&(Rn=0)}function My(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,o=e.expirationTimes,l=e.pendingLanes&-62914561;0<l;){var s=31-jt(l),c=1<<s,h=o[s];h===-1?((c&a)===0||(c&n)!==0)&&(o[s]=ax(c,t)):h<=t&&(e.expiredLanes|=c),l&=~c}if(t=ve,a=ne,a=yu(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(de===2||de===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&Qc(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||nr(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&Qc(n),_h(a)){case 2:case 8:a=pb;break;case 32:a=Qs;break;case 268435456:a=bb;break;default:a=Qs}return n=Oy.bind(null,e),a=Vh(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&Qc(n),e.callbackPriority=2,e.callbackNode=null,2}function Oy(e,t){if(ze!==0&&ze!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(_u()&&e.callbackNode!==a)return null;var n=ne;return n=yu(e,e===ve?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:(xy(e,n,t),My(e,Gt()),e.callbackNode!=null&&e.callbackNode===a?Oy.bind(null,e):null)}function Op(e,t){if(_u())return null;xy(e,t,!0)}function q$(){J$(function(){(le&6)!==0?Vh(gb,U$):zy()})}function xm(){if(Rn===0){var e=wi;e===0&&(e=os,os<<=1,(os&261888)===0&&(os=256)),Rn=e}return Rn}function Rp(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Es(e)}function L$(e,t,a,n,o){if(t==="submit"&&a&&a.stateNode===o){var l=Rp((o[Vt]||null).action),s=n.submitter;s&&(t=(t=s[Vt]||null)?Rp(t.formAction):s.getAttribute("formAction"),t!==null&&(l=t,s=null));var c=new xu("action","action",null,n,o);e.push({event:c,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(Rn!==0){var h=new FormData(o,s);Jd(a,{pending:!0,data:h,method:o.method,action:l},null,h)}}else typeof l=="function"&&(c.preventDefault(),h=new FormData(o,s),Jd(a,{pending:!0,data:h,method:o.method,action:l},l,h))},currentTarget:o}]})}}for(ws=0;ws<qd.length;ws++)xs=qd[ws],Vp=xs.toLowerCase(),Dp=xs[0].toUpperCase()+xs.slice(1),Na(Vp,"on"+Dp);var xs,Vp,Dp,ws;Na(jb,"onAnimationEnd");Na(Ib,"onAnimationIteration");Na(Xb,"onAnimationStart");Na("dblclick","onDoubleClick");Na("focusin","onFocus");Na("focusout","onBlur");Na(Fx,"onTransitionRun");Na(Px,"onTransitionStart");Na(Wx,"onTransitionCancel");Na(Qb,"onTransitionEnd");ko("onMouseEnter",["mouseout","mouseover"]);ko("onMouseLeave",["mouseout","mouseover"]);ko("onPointerEnter",["pointerout","pointerover"]);ko("onPointerLeave",["pointerout","pointerover"]);Ei("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ei("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ei("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ei("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ei("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ei("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Zl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),B$=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Zl));function Ry(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],o=n.event;n=n.listeners;e:{var l=void 0;if(t)for(var s=n.length-1;0<=s;s--){var c=n[s],h=c.instance,g=c.currentTarget;if(c=c.listener,h!==l&&o.isPropagationStopped())break e;l=c,o.currentTarget=g;try{l(o)}catch(w){Ks(w)}o.currentTarget=null,l=h}else for(s=0;s<n.length;s++){if(c=n[s],h=c.instance,g=c.currentTarget,c=c.listener,h!==l&&o.isPropagationStopped())break e;l=c,o.currentTarget=g;try{l(o)}catch(w){Ks(w)}o.currentTarget=null,l=h}}}}function ee(e,t){var a=t[Ag];a===void 0&&(a=t[Ag]=new Set);var n=e+"__bubble";a.has(n)||(Vy(t,e,2,!1),a.add(n))}function pd(e,t,a){var n=0;t&&(n|=4),Vy(a,e,n,t)}var $s="_reactListening"+Math.random().toString(36).slice(2);function $m(e){if(!e[$s]){e[$s]=!0,Tb.forEach(function(a){a!=="selectionchange"&&(B$.has(a)||pd(a,!1,e),pd(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[$s]||(t[$s]=!0,pd("selectionchange",!1,t))}}function Vy(e,t,a,n){switch(iw(t)){case 2:var o=RN;break;case 8:o=VN;break;default:o=Am}a=o.bind(null,t,a,e),o=void 0,!Dd||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),n?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function bd(e,t,a,n,o){var l=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var s=n.tag;if(s===3||s===4){var c=n.stateNode.containerInfo;if(c===o)break;if(s===4)for(s=n.return;s!==null;){var h=s.tag;if((h===3||h===4)&&s.stateNode.containerInfo===o)return;s=s.return}for(;c!==null;){if(s=ci(c),s===null)return;if(h=s.tag,h===5||h===6||h===26||h===27){n=l=s;continue e}c=c.parentNode}}n=n.return}Rb(function(){var g=l,w=Uh(a),$=[];e:{var f=Zb.get(e);if(f!==void 0){var y=xu,A=e;switch(e){case"keypress":if(Cs(a)===0)break e;case"keydown":case"keyup":y=kx;break;case"focusin":A="focus",y=Wc;break;case"focusout":A="blur",y=Wc;break;case"beforeblur":case"afterblur":y=Wc;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":y=Hg;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":y=gx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":y=Ox;break;case jb:case Ib:case Xb:y=vx;break;case Qb:y=Vx;break;case"scroll":case"scrollend":y=mx;break;case"wheel":y=_x;break;case"copy":case"cut":case"paste":y=wx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":y=qg;break;case"submit":y=zx;break;case"toggle":case"beforetoggle":y=Ux}var S=(t&4)!==0,V=!S&&(e==="scroll"||e==="scrollend"),b=S?f!==null?f+"Capture":null:f;S=[];for(var p=g,x;p!==null;){var T=p;if(x=T.stateNode,T=T.tag,T!==5&&T!==26&&T!==27||x===null||b===null||(T=Ll(p,b),T!=null&&S.push(Kl(p,T,x))),V)break;p=p.return}0<S.length&&(f=new y(f,A,null,a,w),$.push({event:f,listeners:S}))}}if((t&7)===0){e:{if(y=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",y&&a!==Vd&&(A=a.relatedTarget||a.fromElement)&&(ci(A)||A[qo]))break e;(f||y)&&(A=w.window===w?w:(y=w.ownerDocument)?y.defaultView||y.parentWindow:window,f?(y=a.relatedTarget||a.toElement,f=g,y=y?ci(y):null,y!==null&&(V=tr(y),S=y.tag,y!==V||S!==5&&S!==27&&S!==6)&&(y=null)):(f=null,y=g),f!==y&&(S=Hg,T="onMouseLeave",b="onMouseEnter",p="mouse",(e==="pointerout"||e==="pointerover")&&(S=qg,T="onPointerLeave",b="onPointerEnter",p="pointer"),V=f==null?A:Nl(f),x=y==null?A:Nl(y),A=new S(T,p+"leave",f,a,w),A.target=V,A.relatedTarget=x,T=null,ci(w)===g&&(S=new S(b,p+"enter",y,a,w),S.target=x,S.relatedTarget=V,T=S),V=T,S=f&&y?$d(f,y,G$):null,f!==null&&_p($,A,f,S,!1),y!==null&&V!==null&&_p($,V,y,S,!0)))}e:{if(f=g?Nl(g):window,y=f.nodeName&&f.nodeName.toLowerCase(),y==="select"||y==="input"&&f.type==="file")var M=Yg;else if(Gg(f))if(qb)M=Zx;else{M=Xx;var I=Ix}else y=f.nodeName,!y||y.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?g&&Hh(g.elementType)&&(M=Yg):M=Qx;if(M&&(M=M(e,g))){Ub($,M,a,w);break e}I&&I(e,f,g)}switch(I=g?Nl(g):window,e){case"focusin":(Gg(I)||I.contentEditable==="true")&&(so=I,Hd=g,Cl=null);break;case"focusout":Cl=Hd=so=null;break;case"mousedown":Ud=!0;break;case"contextmenu":case"mouseup":case"dragend":Ud=!1,Qg($,a,w);break;case"selectionchange":if(Jx)break;case"keydown":case"keyup":Qg($,a,w)}var H;if(Bh)e:{switch(e){case"compositionstart":var q="onCompositionStart";break e;case"compositionend":q="onCompositionEnd";break e;case"compositionupdate":q="onCompositionUpdate";break e}q=void 0}else ro?_b(e,a)&&(q="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(q="onCompositionStart");q&&(Db&&a.locale!=="ko"&&(ro||q!=="onCompositionStart"?q==="onCompositionEnd"&&ro&&(H=Vb()):(An=w,qh="value"in An?An.value:An.textContent,ro=!0)),I=pu(g,q),0<I.length&&(q=new Ug(q,e,null,a,w),$.push({event:q,listeners:I}),H?q.data=H:(H=Hb(a),H!==null&&(q.data=H)))),(H=Lx?Bx(e,a):Gx(e,a))&&(q=pu(g,"onBeforeInput"),0<q.length&&(I=new Ug("onBeforeInput","beforeinput",null,a,w),$.push({event:I,listeners:q}),I.data=H)),L$($,e,g,a,w)}Ry($,t)})}function Kl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function pu(e,t){for(var a=t+"Capture",n=[];e!==null;){var o=e,l=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||l===null||(o=Ll(e,a),o!=null&&n.unshift(Kl(e,o,l)),o=Ll(e,t),o!=null&&n.push(Kl(e,o,l))),e.tag===3)return n;e=e.return}return[]}function G$(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function _p(e,t,a,n,o){for(var l=t._reactName,s=[];a!==null&&a!==n;){var c=a,h=c.alternate,g=c.stateNode;if(c=c.tag,h!==null&&h===n)break;c!==5&&c!==26&&c!==27||g===null||(h=g,o?(g=Ll(a,l),g!=null&&s.unshift(Kl(a,g,h))):o||(g=Ll(a,l),g!=null&&s.push(Kl(a,g,h)))),a=a.return}s.length!==0&&e.push({event:t,listeners:s})}var Y$=/\r\n?/g,j$=/\u0000|\uFFFD/g;function Hp(e){return(typeof e=="string"?e:""+e).replace(Y$,`
`).replace(j$,"")}function Dy(e,t){return t=Hp(t),Hp(e)===t}function he(e,t,a,n,o,l){switch(a){case"children":if(typeof n=="string")t==="body"||t==="textarea"&&n===""||Co(e,n);else if(typeof n=="number"||typeof n=="bigint")t!=="body"&&Co(e,""+n);else return;break;case"className":ss(e,"class",n);break;case"tabIndex":ss(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":ss(e,a,n);break;case"style":Ob(e,n,l);return;case"data":if(t!=="object"){ss(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=Es(n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof l=="function"&&(a==="formAction"?(t!=="input"&&he(e,t,"name",o.name,o,null),he(e,t,"formEncType",o.formEncType,o,null),he(e,t,"formMethod",o.formMethod,o,null),he(e,t,"formTarget",o.formTarget,o,null)):(he(e,t,"encType",o.encType,o,null),he(e,t,"method",o.method,o,null),he(e,t,"target",o.target,o,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=Es(n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=Ba);return;case"onScroll":n!=null&&ee("scroll",e);return;case"onScrollEnd":n!=null&&ee("scrollend",e);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(C(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(C(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=Es(n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":ee("beforetoggle",e),ee("toggle",e),Ts(e,"popover",n);break;case"xlinkActuate":Pa(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":Pa(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":Pa(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":Pa(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":Pa(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":Pa(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":Pa(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":Pa(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":Pa(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":Ts(e,"is",n);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=dx.get(a)||a,Ts(e,a,n);else return}oe=!0}function xh(e,t,a,n,o,l){switch(a){case"style":Ob(e,n,l);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(C(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(C(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof n=="string")Co(e,n);else if(typeof n=="number"||typeof n=="bigint")Co(e,""+n);else return;break;case"onScroll":n!=null&&ee("scroll",e);return;case"onScrollEnd":n!=null&&ee("scrollend",e);return;case"onClick":n!=null&&(e.onclick=Ba);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Eb.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),l=a.slice(2,o?a.length-7:void 0),t=e[Vt]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(l,t,o),typeof n=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(l,n,o);break e}oe=!0,a in e?e[a]=n:n===!0?e.setAttribute(a,""):Ts(e,a,n)}return}oe=!0}function ot(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ee("error",e),ee("load",e);var n=!1,o=!1,l;for(l in a)if(a.hasOwnProperty(l)){var s=a[l];if(s!=null)switch(l){case"src":n=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(C(137,t));default:he(e,t,l,s,a,null)}}o&&he(e,t,"srcSet",a.srcSet,a,null),n&&he(e,t,"src",a.src,a,null);return;case"input":ee("invalid",e);var c=l=s=o=null,h=null,g=null;for(n in a)if(a.hasOwnProperty(n)){var w=a[n];if(w!=null)switch(n){case"name":o=w;break;case"type":s=w;break;case"checked":h=w;break;case"defaultChecked":g=w;break;case"value":l=w;break;case"defaultValue":c=w;break;case"children":case"dangerouslySetInnerHTML":if(w!=null)throw Error(C(137,t));break;default:he(e,t,n,w,a,null)}}Ab(e,l,c,h,g,s,o,!1);return;case"select":ee("invalid",e),n=s=l=null;for(o in a)if(a.hasOwnProperty(o)&&(c=a[o],c!=null))switch(o){case"value":l=c;break;case"defaultValue":s=c;break;case"multiple":n=c;default:he(e,t,o,c,a,null)}t=l,a=s,e.multiple=!!n,t!=null?bo(e,!!n,t,!1):a!=null&&bo(e,!!n,a,!0);return;case"textarea":ee("invalid",e),l=o=n=null;for(s in a)if(a.hasOwnProperty(s)&&(c=a[s],c!=null))switch(s){case"value":n=c;break;case"defaultValue":o=c;break;case"children":l=c;break;case"dangerouslySetInnerHTML":if(c!=null)throw Error(C(91));break;default:he(e,t,s,c,a,null)}Mb(e,n,o,l);return;case"option":for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!=null)&&(h==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":he(e,t,h,n,a,null));return;case"dialog":ee("beforetoggle",e),ee("toggle",e),ee("cancel",e),ee("close",e);break;case"iframe":case"object":ee("load",e);break;case"video":case"audio":for(n=0;n<Zl.length;n++)ee(Zl[n],e);break;case"image":ee("error",e),ee("load",e);break;case"details":ee("toggle",e);break;case"embed":case"source":case"link":ee("error",e),ee("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(n=a[g],n!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(C(137,t));default:he(e,t,g,n,a,null)}return;default:if(Hh(t)){for(w in a)a.hasOwnProperty(w)&&(n=a[w],n!==void 0&&xh(e,t,w,n,a,void 0));return}}for(c in a)a.hasOwnProperty(c)&&(n=a[c],n!=null&&he(e,t,c,n,a,null))}var I$={};function X$(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,l=null,s=null,c=null,h=null,g=null,w=null;for(y in a){var $=a[y];if(a.hasOwnProperty(y)&&$!=null)switch(y){case"checked":break;case"value":break;case"defaultValue":h=$;default:n.hasOwnProperty(y)||he(e,t,y,null,n,$)}}for(var f in n){var y=n[f];if($=a[f],n.hasOwnProperty(f)&&(y!=null||$!=null))switch(f){case"type":y!==$&&(oe=!0),l=y;break;case"name":y!==$&&(oe=!0),o=y;break;case"checked":y!==$&&(oe=!0),g=y;break;case"defaultChecked":y!==$&&(oe=!0),w=y;break;case"value":y!==$&&(oe=!0),s=y;break;case"defaultValue":y!==$&&(oe=!0),c=y;break;case"children":case"dangerouslySetInnerHTML":if(y!=null)throw Error(C(137,t));break;default:y!==$&&he(e,t,f,y,n,$)}}Rd(e,s,c,h,g,w,l,o);return;case"select":y=s=c=f=null;for(l in a)if(h=a[l],a.hasOwnProperty(l)&&h!=null)switch(l){case"value":break;case"multiple":y=h;default:n.hasOwnProperty(l)||he(e,t,l,null,n,h)}for(o in n)if(l=n[o],h=a[o],n.hasOwnProperty(o)&&(l!=null||h!=null))switch(o){case"value":l!==h&&(oe=!0),f=l;break;case"defaultValue":l!==h&&(oe=!0),c=l;break;case"multiple":l!==h&&(oe=!0),s=l;default:l!==h&&he(e,t,o,l,n,h)}t=c,a=s,n=y,f!=null?bo(e,!!a,f,!1):!!n!=!!a&&(t!=null?bo(e,!!a,t,!0):bo(e,!!a,a?[]:"",!1));return;case"textarea":y=f=null;for(c in a)if(o=a[c],a.hasOwnProperty(c)&&o!=null&&!n.hasOwnProperty(c))switch(c){case"value":break;case"children":break;default:he(e,t,c,null,n,o)}for(s in n)if(o=n[s],l=a[s],n.hasOwnProperty(s)&&(o!=null||l!=null))switch(s){case"value":o!==l&&(oe=!0),f=o;break;case"defaultValue":o!==l&&(oe=!0),y=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(C(91));break;default:o!==l&&he(e,t,s,o,n,l)}zb(e,f,y);return;case"option":for(var A in a)f=a[A],a.hasOwnProperty(A)&&f!=null&&!n.hasOwnProperty(A)&&(A==="selected"?e.selected=!1:he(e,t,A,null,n,f));for(h in n)f=n[h],y=a[h],n.hasOwnProperty(h)&&f!==y&&(f!=null||y!=null)&&(h==="selected"?(f!==y&&(oe=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):he(e,t,h,f,n,y));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var S in a)f=a[S],a.hasOwnProperty(S)&&f!=null&&!n.hasOwnProperty(S)&&he(e,t,S,null,n,f);for(g in n)if(f=n[g],y=a[g],n.hasOwnProperty(g)&&f!==y&&(f!=null||y!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(C(137,t));break;default:he(e,t,g,f,n,y)}return;default:if(Hh(t)){for(var V in a)f=a[V],a.hasOwnProperty(V)&&f!==void 0&&!n.hasOwnProperty(V)&&xh(e,t,V,void 0,n,f);for(w in n)f=n[w],y=a[w],!n.hasOwnProperty(w)||f===y||f===void 0&&y===void 0||xh(e,t,w,f,n,y);return}}for(var b in a)f=a[b],a.hasOwnProperty(b)&&f!=null&&!n.hasOwnProperty(b)&&he(e,t,b,null,n,f);for($ in n)f=n[$],y=a[$],!n.hasOwnProperty($)||f===y||f==null&&y==null||he(e,t,$,f,n,y)}function Up(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function Q$(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var o=a[n],l=o.transferSize,s=o.initiatorType,c=o.duration;if(l&&c&&Up(s)){for(s=0,c=o.responseEnd,n+=1;n<a.length;n++){var h=a[n],g=h.startTime;if(g>c)break;var w=h.transferSize,$=h.initiatorType;w&&Up($)&&(h=h.responseEnd,s+=w*(h<c?1:(c-g)/(h-g)))}if(--n,t+=8*(l+s)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var $h=null,Nh=null;function Jl(e){return e.nodeType===9?e:e.ownerDocument}function qp(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function _y(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Hy(e,t,a,n){return a=Jl(a).createElement(e),a[tt]=n,a[Vt]=t,ot(a,e,t),Ke(a),a}function Sh(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var vd=null;function Z$(){var e=window.event;return e&&e.type==="popstate"?e===vd?!1:(vd=e,!0):(vd=null,!1)}var Nm=typeof setTimeout=="function"?setTimeout:void 0,K$=typeof clearTimeout=="function"?clearTimeout:void 0,Lp=typeof Promise=="function"?Promise:void 0,Bp=typeof requestAnimationFrame=="function"?requestAnimationFrame:Nm,J$=typeof queueMicrotask=="function"?queueMicrotask:typeof Lp<"u"?function(e){return Lp.resolve(null).then(e).catch(F$)}:Nm;function F$(e){setTimeout(function(){throw e})}function Jn(e){return e==="head"}function Gp(e,t){var a=t,n=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(o),Uo(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")wd(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,wd(a);for(var l=a.firstChild;l;){var s=l.nextSibling,c=l.nodeName;l[or]||c==="SCRIPT"||c==="STYLE"||c==="LINK"&&l.rel.toLowerCase()==="stylesheet"||a.removeChild(l),l=s}}else a==="body"&&wd(e.ownerDocument.body);a=o}while(a);Uo(t)}function Yp(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function Uy(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var n=1;else for(var o=n=0;o<t.length;o++){var l=t[o];0<l.width&&0<l.height&&n++}n===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function qy(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function Ly(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function Th(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return Ly(t,a,e)}function P$(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return Ly(t,a,e)}function W$(e){return e.documentElement.clientHeight}function eN(e){this.addEventListener("load",e),this.addEventListener("error",e)}function tN(e,t,a,n,o,l,s,c,h){var g=t.nodeType===9?t:t.ownerDocument;try{var w=g.startViewTransition({update:function(){var f=g.defaultView,y=f.navigation&&f.navigation.transition,A=g.fonts.status;n();var S=[];if(A==="loaded"&&(W$(g),g.fonts.status==="loading"&&S.push(g.fonts.ready)),A=S.length,e!==null)for(var V=e.suspenseyImages,b=0,p=0;p<V.length;p++){var x=V[p];if(!x.complete){var T=x.getBoundingClientRect();if(0<T.bottom&&0<T.right&&T.top<f.innerHeight&&T.left<f.innerWidth){if(b+=Py(x),b>Bs){S.length=A;break}x=new Promise(eN.bind(x)),S.push(x)}}}if(0<S.length)return f=Promise.race([Promise.all(S),new Promise(function(M){return setTimeout(M,500)})]).then(o,o),(y?Promise.allSettled([y.finished,f]):f).then(l,l);if(o(),y)return y.finished.then(l,l);l()},types:a});g.__reactViewTransition=w;var $=[];return w.ready.then(function(){for(var f=g.documentElement.getAnimations({subtree:!0}),y=0;y<f.length;y++){var A=f[y],S=A.effect,V=S.pseudoElement;if(V!=null&&V.startsWith("::view-transition")){$.push(A),A=S.getKeyframes();for(var b=V=void 0,p=!0,x=0;x<A.length;x++){var T=A[x],M=T.width;if(V===void 0)V=M;else if(V!==M){p=!1;break}if(M=T.height,b===void 0)b=M;else if(b!==M){p=!1;break}delete T.width,delete T.height,T.transform==="none"&&delete T.transform}p&&V!==void 0&&b!==void 0&&(S.setKeyframes(A),p=getComputedStyle(S.target,S.pseudoElement),p.width!==V||p.height!==b)&&(p=A[0],p.width=V,p.height=b,p=A[A.length-1],p.width=V,p.height=b,S.setKeyframes(A))}}s()},function(f){g.__reactViewTransition===w&&(g.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{n(),o(),s()}}),w.finished.finally(function(){for(var f=0;f<$.length;f++)$[f].cancel();g.__reactViewTransition===w&&(g.__reactViewTransition=null),c()}),w}catch{return n(),o(),s(),null}}function di(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}di.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:ye({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};di.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),n=[],o=0;o<a.length;o++){var l=a[o].effect;l!==null&&l.target===e&&l.pseudoElement===t&&n.push(a[o])}return n};di.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function By(e){return{name:e,group:new di("group",e),imagePair:new di("image-pair",e),old:new di("old",e),new:new di("new",e)}}function Qt(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}Qt.prototype.addEventListener=function(e,t,a){var n=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(n=a.signal||null,n!==null&&n.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var l=this._eventListeners;if(Gy(l,e,t,a)===-1){var s=this,c=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(c=function(h){s.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),n!==null&&(o=s.removeEventListener.bind(s,e,t,a),n.addEventListener("abort",o,{once:!0}),o=n.removeEventListener.bind(n,"abort",o)),n=Vo(a),l.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:c,cleanup:o}),Rt(this._fragmentFiber.child,!1,aN,e,c,n)}this._eventListeners=l}};function aN(e,t,a,n){return Ye(e).addEventListener(t,a,n),!1}Qt.prototype.removeEventListener=function(e,t,a){var n=this._eventListeners;if(n!==null&&(t=Gy(n,e,t,a),t!==-1)){var o=n[t];a=o.attachedListener;var l=o.cleanup;o=Vo(o.optionsOrUseCapture),Rt(this._fragmentFiber.child,!1,nN,e,a,o),n.splice(t,1),l!==null&&l()}};function nN(e,t,a,n){return Ye(e).removeEventListener(t,a,n),!1}function Vo(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function jp(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function Gy(e,t,a,n){if(e.length===0)return-1;n=jp(n);for(var o=0;o<e.length;o++){var l=e[o];if(l.type===t&&l.listener===a&&jp(l.optionsOrUseCapture)===n)return o}return-1}Qt.prototype.dispatchEvent=function(e){var t=Ti(this._fragmentFiber);if(t===null)return!0;t=Ye(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var n=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var l=a[o];n.addEventListener(l.type,l.attachedListener,Vo(l.optionsOrUseCapture))}if(t.appendChild(n),e=n.dispatchEvent(e),a)for(o=0;o<a.length;o++)l=a[o],n.removeEventListener(l.type,l.attachedListener,Vo(l.optionsOrUseCapture));return t.removeChild(n),e}return t.dispatchEvent(e)};Qt.prototype.focus=function(e){Rt(this._fragmentFiber.child,!0,Yy,e,void 0,void 0)};function Yy(e,t){return e.tag===6?!1:(e=Ye(e),gN(e,t))}Qt.prototype.focusLast=function(e){var t=[];Rt(this._fragmentFiber.child,!0,Sm,t,void 0,void 0);for(var a=t.length-1;0<=a&&!Yy(t[a],e);a--);};function Sm(e,t){return t.push(e),!1}Qt.prototype.blur=function(){var e=Ti(this._fragmentFiber);e!==null&&(e=Ye(e),e=Jl(e).activeElement,e!==null&&Rt(this._fragmentFiber.child,!1,iN,e,void 0,void 0))};function iN(e,t){return e.tag===6?!1:(e=Ye(e),e===t||e.contains(t)?(t.blur(),!0):!1)}Qt.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Rt(this._fragmentFiber.child,!1,oN,e,void 0,void 0)};function oN(e,t){return e.tag===6||(e=Ye(e),t.observe(e)),!1}Qt.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Rt(this._fragmentFiber.child,!1,lN,e,void 0,void 0);for(var a=t=0;a<xa.length;a++){var n=xa[a];n.fragmentInstance===this&&n.observer===e?e.unobserve(n.instance):xa[t++]=n}xa.length=t}};function lN(e,t){return e.tag===6||(e=Ye(e),t.unobserve(e)),!1}var xa=[],yd=!1;function rN(e,t,a){xa.push({fragmentInstance:e,observer:t,instance:a}),yd||(yd=!0,pN(function(){yd=!1;var n=xa;xa=[];for(var o=0;o<n.length;o++){var l=n[o];l.observer.unobserve(l.instance)}}))}Qt.prototype.getClientRects=function(){var e=[];return Rt(this._fragmentFiber.child,!1,sN,e,void 0,void 0),e};function sN(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=Ye(e),t.push.apply(t,e.getClientRects());return!1}Qt.prototype.getRootNode=function(e){var t=Ti(this._fragmentFiber);return t===null?this:Ye(t).getRootNode(e)};Qt.prototype.compareDocumentPosition=function(e){var t=Ti(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Rt(this._fragmentFiber.child,!1,Sm,a,void 0,void 0);var n=Ye(t);if(a.length===0){if(a=n,Ng(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=n=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:n&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=db(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=Ye(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=Ye(a[0]),o=Ye(a[a.length-1]);var l=Ng(this._fragmentFiber)?t.parentElement:n;if(l==null)return Node.DOCUMENT_POSITION_DISCONNECTED;n=l.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,l=l.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var s=t.compareDocumentPosition(e),c=o.compareDocumentPosition(e),h=s&Node.DOCUMENT_POSITION_CONTAINED_BY||c&Node.DOCUMENT_POSITION_CONTAINED_BY;return c=n&&l&&s&Node.DOCUMENT_POSITION_FOLLOWING&&c&Node.DOCUMENT_POSITION_PRECEDING,t=n&&t===e||l&&o===e||h||c?Node.DOCUMENT_POSITION_CONTAINED_BY:!n&&t===e||!l&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:s,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||uN(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function uN(e,t,a,n,o){var l=ci(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!l)e:{for(;l!==null;){if(l.tag===7&&(l===t||l.alternate===t)){a=!0;break e}l=l.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(l===null)return l=o.ownerDocument,o===l||o===l.documentElement||o===l.body;e:{for(l=t,t=Ti(t);l!==null;){if(!(l.tag!==5&&l.tag!==3&&l.tag!==27||l!==t&&l.alternate!==t)){l=!0;break e}l=l.return}l=!1}return l}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!l)&&!(t=l===a)&&(t=$d(a,l,Sg),t===null?t=!1:(Rt(t,!0,q1,l,a),l=no,no=null,t=l!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!l)&&!(t=l===n)&&(t=$d(n,l,Sg),t===null?t=!1:(Rt(t,!0,L1,l,n),l=no,xd=no=null,t=l!==null)),t):!1}function Ip(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}Qt.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(C(566));var t=[];Rt(this._fragmentFiber.child,!1,Sm,t,void 0,void 0);var a=e!==!1;if(t.length===0){var n=db(this._fragmentFiber);if(n=a?n[1]||n[0]||Ti(this._fragmentFiber):n[0]||n[1],n===null)return;if(n.tag===6){e=Ye(n),Ip(e,a);return}if(n=Ye(n),n.nodeType!==9){if(n.nodeType===11){a="host"in n?n.host:null,a!==null&&a.scrollIntoView(e);return}n.scrollIntoView(e)}}for(n=a?t.length-1:0;n!==(a?-1:t.length);){var o=t[n];o.tag===6?(o=Ye(o),Ip(o,a)):Ye(o).scrollIntoView(e),n+=a?-1:1}};function cN(e,t){return e=Ye(e),jy(e,t),!1}function jy(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function Iy(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.addEventListener(o.type,o.attachedListener,Vo(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){for(var s=0,c=0;c<xa.length;c++){var h=xa[c];(h.fragmentInstance!==t||h.observer!==l||h.instance!==e)&&(xa[s++]=h)}xa.length=s,l.observe(e)}),jy(e,t))}function dN(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.removeEventListener(o.type,o.attachedListener,Vo(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){typeof l.rootMargin=="string"?rN(t,l,e):l.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function Eh(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Eh(a),wu(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function hN(e,t,a,n){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[or])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(l=e.getAttribute("rel"),l==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(l!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(l=e.getAttribute("src"),(l!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&l&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var l=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===l)return e}else return e;if(e=ca(e.nextSibling),e===null)break}return null}function mN(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=ca(e.nextSibling),e===null))return null;return e}function Xy(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=ca(e.nextSibling),e===null))return null;return e}function kh(e){return e.data==="$?"||e.data==="$~"}function Tm(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function fN(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function ca(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Ch=null;function Xp(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return ca(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function Qp(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function gN(e,t){function a(){n=!0}if(e.ownerDocument.activeElement===e)return!0;var n=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return n}function pN(e){Bp(function(){Bp(function(t){return e(t)})})}function Qy(e,t,a){switch(t=Jl(a),e){case"html":if(e=t.documentElement,!e)throw Error(C(452));return e;case"head":if(e=t.head,!e)throw Error(C(453));return e;case"body":if(e=t.body,!e)throw Error(C(454));return e;default:throw Error(C(451))}}function Zy(e,t,a){for(var n in a){var o=a[n];a.hasOwnProperty(n)&&o!=null&&he(e,t,n,null,I$,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===Ba&&(e.onclick=null),wu(e)}function wd(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);wu(e)}var da=new Map,Zp=new Set;function Fl(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var mn=re.d;re.d={f:bN,r:vN,D:yN,C:wN,L:xN,m:$N,X:SN,S:NN,M:TN};function bN(){var e=mn.f(),t=Vu();return e||t}function vN(e){var t=Lo(e);t!==null&&t.tag===5&&t.type==="form"?Ov(t):mn.r(e)}var jo=typeof document>"u"?null:document;function Ky(e,t,a){var n=jo;if(n&&typeof t=="string"&&t){var o=ra(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),Zp.has(o)||(Zp.add(o),e={rel:e,crossOrigin:a,href:t},n.querySelector(o)===null&&(t=n.createElement("link"),ot(t,"link",e),Ke(t),n.head.appendChild(t)))}}function yN(e){mn.D(e),Ky("dns-prefetch",e,null)}function wN(e,t){mn.C(e,t),Ky("preconnect",e,t)}function xN(e,t,a){mn.L(e,t,a);var n=jo;if(n&&e&&t){var o='link[rel="preload"][as="'+ra(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+ra(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+ra(a.imageSizes)+'"]')):o+='[href="'+ra(e)+'"]';var l=o;switch(t){case"style":l=Do(e);break;case"script":l=Io(e)}if(!(da.has(l)||(e=ye({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),da.set(l,e),n.querySelector(o)!==null||t==="style"&&n.querySelector(dr(l))||t==="script"&&n.querySelector(hr(l))))){var s=n.createElement("link");ot(s,"link",e),t==="style"&&(s[Zs]=!0,s.onload=s.onerror=function(){Sb(s)}),Ke(s),n.head.appendChild(s)}}}function $N(e,t){mn.m(e,t);var a=jo;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+ra(n)+'"][href="'+ra(e)+'"]',l=o;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":l=Io(e)}if(!da.has(l)&&(e=ye({rel:"modulepreload",href:e},t),da.set(l,e),a.querySelector(o)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(hr(l)))return}n=a.createElement("link"),ot(n,"link",e),Ke(n),a.head.appendChild(n)}}}function NN(e,t,a){mn.S(e,t,a);var n=jo;if(n&&e){var o=po(n).hoistableStyles,l=Do(e);t=t||"default";var s=o.get(l);if(!s){var c={loading:0,preload:null};if(s=n.querySelector(dr(l)))c.loading=5;else{e=ye({rel:"stylesheet",href:e,"data-precedence":t},a),(a=da.get(l))&&Em(e,a);var h=s=n.createElement("link");Ke(h),ot(h,"link",e),h._p=new Promise(function(g,w){h.onload=g,h.onerror=w}),h.addEventListener("load",function(){c.loading|=1}),h.addEventListener("error",function(){c.loading|=2}),c.loading|=4,qs(s,t,n)}s={type:"stylesheet",instance:s,count:1,state:c},o.set(l,s)}}}function SN(e,t){mn.X(e,t);var a=jo;if(a&&e){var n=po(a).hoistableScripts,o=Io(e),l=n.get(o);l||(l=a.querySelector(hr(o)),l||(e=ye({src:e,async:!0},t),(t=da.get(o))&&km(e,t),l=a.createElement("script"),Ke(l),ot(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function TN(e,t){mn.M(e,t);var a=jo;if(a&&e){var n=po(a).hoistableScripts,o=Io(e),l=n.get(o);l||(l=a.querySelector(hr(o)),l||(e=ye({src:e,async:!0,type:"module"},t),(t=da.get(o))&&km(e,t),l=a.createElement("script"),Ke(l),ot(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function Kp(e,t,a,n){var o=(o=Vn.current)?Fl(o):null;if(!o)throw Error(C(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=Do(a.href),t=po(o).hoistableStyles,n=t.get(a),n||(n={type:"style",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=Do(a.href);var l=po(o).hoistableStyles,s=l.get(e);if(s||(o=o.ownerDocument||o,s={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},l.set(e,s),(l=o.querySelector(dr(e)))?l._p||(s.instance=l,s.state.loading=5):(l=da.get(e),l||(l={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},da.set(e,l)),EN(o,e,l,s.state))),t&&n===null)throw Error(C(528,""));return s}if(t&&n!==null)throw Error(C(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=Io(a),t=po(o).hoistableScripts,n=t.get(a),n||(n={type:"script",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(C(444,e))}}function Do(e){return'href="'+ra(e)+'"'}function dr(e){return'link[rel="stylesheet"]['+e+"]"}function Jy(e){return ye({},e,{"data-precedence":e.precedence,precedence:null})}function EN(e,t,a,n){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Zs]!==!0){n.loading=1;return}}else t=e.createElement("link"),t[Zs]=!0,t.onload=t.onerror=Sb.bind(null,t),ot(t,"link",a),Ke(t),e.head.appendChild(t);n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2})}function Io(e){return'[src="'+ra(e)+'"]'}function hr(e){return"script[async]"+e}function Jp(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+ra(a.href)+'"]');if(n)return t.instance=n,Ke(n),n;var o=ye({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),Ke(n),ot(n,"style",o),qs(n,a.precedence,e),t.instance=n;case"stylesheet":o=Do(a.href);var l=e.querySelector(dr(o));if(l)return t.state.loading|=4,t.instance=l,Ke(l),l;n=Jy(a),(o=da.get(o))&&Em(n,o),l=(e.ownerDocument||e).createElement("link"),Ke(l);var s=l;return s._p=new Promise(function(c,h){s.onload=c,s.onerror=h}),ot(l,"link",n),t.state.loading|=4,qs(l,a.precedence,e),t.instance=l;case"script":return l=Io(a.src),(o=e.querySelector(hr(l)))?(t.instance=o,Ke(o),o):(n=a,(o=da.get(l))&&(n=ye({},a),km(n,o)),e=e.ownerDocument||e,o=e.createElement("script"),Ke(o),ot(o,"link",n),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(C(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,qs(n,a.precedence,e));return t.instance}function qs(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=n.length?n[n.length-1]:null,l=o,s=0;s<n.length;s++){var c=n[s];if(c.dataset.precedence===t)l=c;else if(l!==o)break}l?l.parentNode.insertBefore(e,l.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function Em(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function km(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Ls=null;function Fp(e,t,a){if(Ls===null){var n=new Map,o=Ls=new Map;o.set(a,n)}else o=Ls,n=o.get(a),n||(n=new Map,o.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var l=a[o];if(!(l[or]||l[tt]||e==="link"&&l.getAttribute("rel")==="stylesheet")&&l.namespaceURI!=="http://www.w3.org/2000/svg"){var s=l.getAttribute(t)||"";s=e+s;var c=n.get(s);c?c.push(l):n.set(s,[l])}}return n}function Ah(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function kN(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Pp(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function Fy(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function Py(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Wp(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=Py(t),e.suspenseyImages.push(t)),e=zN.bind(e),t.decode().then(e,e))}function CN(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=Do(n.href),l=t.querySelector(dr(o));if(l){t=l._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Pl.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=l,Ke(l);return}l=t.ownerDocument||t,n=Jy(n),(o=da.get(o))&&Em(n,o),l=l.createElement("link"),Ke(l);var s=l;s._p=new Promise(function(c,h){s.onload=c,s.onerror=h}),ot(l,"link",n),a.instance=l}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Pl.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Bs=0;function AN(e,t){return e.stylesheets&&e.count===0&&Gs(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&Gs(e,e.stylesheets),e.unsuspend){var l=e.unsuspend;e.unsuspend=null,l()}},6e4+t);0<e.imgBytes&&Bs===0&&(Bs=62500*Q$());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Gs(e,e.stylesheets),e.unsuspend)){var l=e.unsuspend;e.unsuspend=null,l()}},(e.imgBytes>Bs?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(o)}}:null}function Wy(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)Gs(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Pl(){this.count--,Wy(this)}function zN(){this.imgCount--,Wy(this)}var bu=null;function Gs(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,bu=new Map,t.forEach(MN,e),bu=null,Pl.call(e))}function MN(e,t){if(!(t.state.loading&4)){var a=bu.get(e);if(a)var n=a.get(null);else{a=new Map,bu.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),l=0;l<o.length;l++){var s=o[l];(s.nodeName==="LINK"||s.getAttribute("media")!=="not all")&&(a.set(s.dataset.precedence,s),n=s)}n&&a.set(null,n)}o=t.instance,s=o.getAttribute("data-precedence"),l=a.get(s)||n,l===n&&a.set(null,o),a.set(s,o),this.count++,n=Pl.bind(this),o.addEventListener("load",n),o.addEventListener("error",n),l?l.parentNode.insertBefore(o,l.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var _o={$$typeof:La,Provider:null,Consumer:null,_currentValue:hi,_currentValue2:hi,_threadCount:0};function ON(e,t,a,n,o,l,s,c,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Zc(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Zc(0),this.hiddenUpdates=Zc(null),this.identifierPrefix=n,this.onUncaughtError=o,this.onCaughtError=l,this.onRecoverableError=s,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function ew(e,t,a,n,o,l,s,c,h,g,w,$){return e=new ON(e,t,a,s,h,g,w,$,c),t=1,l===!0&&(t|=24),l=Mt(3,null,null,t),e.current=l,l.stateNode=e,t=Qh(),t.refCount++,e.pooledCache=t,t.refCount++,l.memoizedState={element:n,isDehydrated:a,cache:t},Jh(l),e}function tw(e){return e?(e=ho,e):ho}function aw(e,t,a,n,o,l){o=tw(o),n.context===null?n.context=o:n.pendingContext=o,n=_n(t),n.payload={element:a},l=l===void 0?null:l,l!==null&&(n.callback=l),a=Hn(e,n,t),a!==null&&(Ot(a,e,t),zl(a,e,t))}function eb(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function Cm(e,t){eb(e,t),(e=e.alternate)&&eb(e,t)}function nw(e){if(e.tag===13||e.tag===31){var t=Ci(e,67108864);t!==null&&Ot(t,e,67108864),Cm(e,67108864)}}function tb(e){if(e.tag===13||e.tag===31){var t=It();t=Dh(t);var a=Ci(e,t);a!==null&&Ot(a,e,t),Cm(e,t)}}var Ho=!0;function RN(e,t,a,n){var o=Z.T;Z.T=null;var l=re.p;try{re.p=2,Am(e,t,a,n)}finally{re.p=l,Z.T=o}}function VN(e,t,a,n){var o=Z.T;Z.T=null;var l=re.p;try{re.p=8,Am(e,t,a,n)}finally{re.p=l,Z.T=o}}function Am(e,t,a,n){if(Ho){var o=zh(n);if(o===null)bd(e,t,n,vu,a),ab(e,n);else if(_N(o,e,t,a,n))n.stopPropagation();else if(ab(e,n),t&4&&-1<DN.indexOf(e)){for(;o!==null;){var l=Lo(o);if(l!==null)switch(l.tag){case 3:if(l=l.stateNode,l.current.memoizedState.isDehydrated){var s=ri(l.pendingLanes);if(s!==0){var c=l;for(c.pendingLanes|=2,c.entangledLanes|=2;s;){var h=1<<31-jt(s);c.entanglements[1]|=h,s&=~h}Za(l),(le&6)===0&&(hu=Gt()+500,cr(0,!1))}}break;case 31:case 13:c=Ci(l,2),c!==null&&Ot(c,l,2),Vu(),Cm(l,2)}if(l=zh(n),l===null&&bd(e,t,n,vu,a),l===o)break;o=l}o!==null&&n.stopPropagation()}else bd(e,t,n,null,a)}}function zh(e){return e=Uh(e),zm(e)}var vu=null;function zm(e){if(vu=null,e=ci(e),e!==null){var t=tr(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=sb(t),e!==null)return e;e=null}else if(a===31){if(e=ub(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return vu=e,null}function iw(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(K1()){case gb:return 2;case pb:return 8;case Qs:case J1:return 32;case bb:return 268435456;default:return 32}default:return 32}}var Mh=!1,Bn=null,Gn=null,Yn=null,Wl=new Map,er=new Map,kn=[],DN="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function ab(e,t){switch(e){case"focusin":case"focusout":Bn=null;break;case"dragenter":case"dragleave":Gn=null;break;case"mouseover":case"mouseout":Yn=null;break;case"pointerover":case"pointerout":Wl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":er.delete(t.pointerId)}}function yl(e,t,a,n,o,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:l,targetContainers:[o]},t!==null&&(t=Lo(t),t!==null&&nw(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function _N(e,t,a,n,o){switch(t){case"focusin":return Bn=yl(Bn,e,t,a,n,o),!0;case"dragenter":return Gn=yl(Gn,e,t,a,n,o),!0;case"mouseover":return Yn=yl(Yn,e,t,a,n,o),!0;case"pointerover":var l=o.pointerId;return Wl.set(l,yl(Wl.get(l)||null,e,t,a,n,o)),!0;case"gotpointercapture":return l=o.pointerId,er.set(l,yl(er.get(l)||null,e,t,a,n,o)),!0}return!1}function ow(e){var t=ci(e.target);if(t!==null){var a=tr(t);if(a!==null){if(t=a.tag,t===13){if(t=sb(a),t!==null){e.blockedOn=t,Cg(e.priority,function(){tb(a)});return}}else if(t===31){if(t=ub(a),t!==null){e.blockedOn=t,Cg(e.priority,function(){tb(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Ys(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=zh(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);Vd=n,a.target.dispatchEvent(n),Vd=null}else return t=Lo(a),t!==null&&nw(t),e.blockedOn=a,!1;t.shift()}return!0}function nb(e,t,a){Ys(e)&&a.delete(t)}function HN(){Mh=!1,Bn!==null&&Ys(Bn)&&(Bn=null),Gn!==null&&Ys(Gn)&&(Gn=null),Yn!==null&&Ys(Yn)&&(Yn=null),Wl.forEach(nb),er.forEach(nb)}function Ns(e,t){e.blockedOn===t&&(e.blockedOn=null,Mh||(Mh=!0,je.unstable_scheduleCallback(je.unstable_NormalPriority,HN)))}var Ss=null;function ib(e){Ss!==e&&(Ss=e,je.unstable_scheduleCallback(je.unstable_NormalPriority,function(){Ss===e&&(Ss=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],o=e[t+2];if(typeof n!="function"){if(zm(n||a)===null)continue;break}var l=Lo(a);l!==null&&(e.splice(t,3),t-=3,Jd(l,{pending:!0,data:o,method:a.method,action:n},n,o))}}))}function Uo(e){function t(h){return Ns(h,e)}Bn!==null&&Ns(Bn,e),Gn!==null&&Ns(Gn,e),Yn!==null&&Ns(Yn,e),Wl.forEach(t),er.forEach(t);for(var a=0;a<kn.length;a++){var n=kn[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<kn.length&&(a=kn[0],a.blockedOn===null);)ow(a),a.blockedOn===null&&kn.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var o=a[n],l=a[n+1],s=o[Vt]||null;if(typeof l=="function")s||ib(a);else if(s){var c=null;if(l&&l.hasAttribute("formAction")){if(o=l,s=l[Vt]||null)c=s.formAction;else if(zm(o)!==null)continue}else c=s.action;typeof c=="function"?a[n+1]=c:(a.splice(n,3),n-=3),ib(a)}}}function lw(){function e(l){l.canIntercept&&l.info==="react-transition"&&l.intercept({handler:function(){return new Promise(function(s){return o=s})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var l=navigation.currentEntry;l&&l.url!=null&&navigation.navigate(l.url,{state:l.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function Mm(e){this._internalRoot=e}Hu.prototype.render=Mm.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(C(409));var a=t.current,n=It();aw(a,n,e,t,null,null)};Hu.prototype.unmount=Mm.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;aw(e.current,2,null,e,null,null),Vu(),t[qo]=null}};function Hu(e){this._internalRoot=e}Hu.prototype.unstable_scheduleHydration=function(e){if(e){var t=Nb();e={blockedOn:null,target:e,priority:t};for(var a=0;a<kn.length&&t!==0&&t<kn[a].priority;a++);kn.splice(a,0,e),a===0&&ow(e)}};var ob=lb.version;if(ob!=="19.3.0")throw Error(C(527,ob,"19.3.0"));re.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(C(188)):(e=Object.keys(e).join(","),Error(C(268,e)));return e=U1(t),e=e!==null?cb(e):null,e=e===null?null:e.stateNode,e};var UN={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:Z,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(wl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!wl.isDisabled&&wl.supportsFiber))try{ar=wl.inject(UN),Yt=wl}catch{}var wl;Uu.createRoot=function(e,t){if(!rb(e))throw Error(C(299));var a=!1,n="",o=Lv,l=Bv,s=Gv;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(l=t.onCaughtError),t.onRecoverableError!==void 0&&(s=t.onRecoverableError)),t=ew(e,1,!1,null,null,a,n,null,o,l,s,lw),e[qo]=t.current,$m(e),new Mm(t)};Uu.hydrateRoot=function(e,t,a){if(!rb(e))throw Error(C(299));var n=!1,o="",l=Lv,s=Bv,c=Gv,h=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(l=a.onUncaughtError),a.onCaughtError!==void 0&&(s=a.onCaughtError),a.onRecoverableError!==void 0&&(c=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=ew(e,1,!0,t,a??null,n,o,h,l,s,c,lw),t.context=tw(null),a=t.current,n=It(),n=Dh(n),o=_n(n),o.callback=null,Hn(a,o,n),a=n,t.current.lanes=a,ir(t,a),Za(t),e[qo]=t.current,$m(e),new Hu(t)};Uu.version="19.3.0"});var cw=Ra((j5,uw)=>{"use strict";function sw(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(sw)}catch(e){console.error(e)}}sw(),uw.exports=rw()});var Nw=Ra(Bu=>{"use strict";var IN=Symbol.for("react.transitional.element"),XN=Symbol.for("react.fragment");function $w(e,t,a){var n=null;if(a!==void 0&&(n=""+a),t.key!==void 0&&(n=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:IN,type:e,key:n,ref:t!==void 0?t:null,props:a}}Bu.Fragment=XN;Bu.jsx=$w;Bu.jsxs=$w});var Dm=Ra((W5,Sw)=>{"use strict";Sw.exports=Nw()});var m=Fr(Wr()),Qw=Fr(cw());function qN(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),n="",o=[],l=[];for(let s=0;s<a.length;s++){let c=a[s],h=/^ {0,3}(`{3,}|~{3,})/.exec(c)?.[1];if(h&&(n?h[0]===n[0]&&h.length>=n.length&&(n=""):n=h),!n&&!c.trim()&&(!t||s<a.length-1)){let g=o.join(`
`).trim();g&&l.push(g),o=[]}else o.push(c)}if(!t){let s=o.join(`
`).trim();s&&l.push(s)}return l}var LN=['"',"'","\u201D","\u2019","\xBB","\u300D"],BN=['"',"'","\u201C","\u2018","\xAB","\u300C"];function dw(e){let t=e.trim();return LN.includes(t.slice(-1))&&BN.some(n=>t.slice(0,-1).includes(n))?"speech":"prose"}function hw(e,t){let a=qN(e),n=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return n();let o=[],l=[],s=[],c=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){o.push(a[h]),l.push(c),s.push(g.expression??null),c=[];continue}let w={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};o.length?l[l.length-1].push(w):c.push(w)}return o.length===0?n():{paragraphs:o,asides:l,expressions:s}}var GN="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function zi(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],n=new RegExp(GN,"g"),o=0,l,s=c=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+c};return}a.push({kind:"text",text:c})};for(;(l=n.exec(e))!==null;)l.index>o&&s(e.slice(o,l.index)),l[1]!=null?s(l[1]):l[2]!=null&&l[3]!=null?a.push({kind:"link",text:l[2],href:l[3]}):l[4]!=null?a.push({kind:"code",text:l[4]}):l[5]!=null?a.push({kind:"styled",style:"highlight",children:zi(l[5],t+1)}):l[6]!=null?a.push({kind:"styled",style:"strikethrough",children:zi(l[6],t+1)}):l[7]!=null?a.push({kind:"styled",style:"bold-italic",children:zi(l[7],t+1)}):l[8]!=null?a.push({kind:"styled",style:"bold",children:zi(l[8],t+1)}):l[9]!=null?a.push({kind:"styled",style:"underline",children:zi(l[9],t+1)}):(l[10]!=null||l[11]!=null)&&a.push({kind:"styled",style:"italic",children:zi(l[10]??l[11],t+1)}),o=l.index+l[0].length;return o<e.length&&s(e.slice(o)),a}function mw(e){return zi(e,0)}function fn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function fw(e){return e===null||typeof e=="string"}function gw(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function qu(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function YN(e){return e===null?!0:fn(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function jN(e){if(!fn(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.purpose!="string"||typeof e.category!="string"||!qu(e.capabilities)||!fn(e.presentation)||!fn(e.occupancy)||!fn(e.state))return!1;let{presentation:t,occupancy:a,state:n}=e;return YN(t.image)&&gw(t.x)&&gw(t.y)&&typeof a.playerHome=="boolean"&&fw(a.residentCharacterId)&&fw(a.homeKind)&&typeof n.condition=="string"&&qu(n.upgrades)&&qu(n.furniture)&&qu(n.publicFacts)&&typeof n.updatedAt=="string"}function pw(e){if(!fn(e)||!fn(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(jN),n=Array.isArray(e.venueRequests)?e.venueRequests:[],o=n.filter(l=>fn(l)&&typeof l.id=="string"&&fn(l.venueDraft)&&typeof l.venueDraft.name=="string"&&typeof l.venueDraft.purpose=="string"&&typeof l.venueDraft.category=="string");return a.length===t.length&&o.length===n.length&&n===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function bw(e,t,a){return e==="Enter"&&!t&&!a}function mr(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,n=>n.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function vw(e,t,a,n){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(n,o)}function yw(e,t,a,n){let o=Math.max((n.width+6)/a.width,.15),l=Math.max((n.height+6)/a.height,.22);return t.every(s=>s.kind==="person"||Math.abs(s.x-e.x)>=o||Math.abs(s.y-e.y)>=l)}function ww(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var Fn=(e,t,a)=>Math.min(a,Math.max(t,e));function Lu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function Om(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let n=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,Lu(e,t)),l=e.width*n*o,s=e.height*n*o,c=t.width/2-a.centerX*l,h=t.height/2-a.centerY*s;return{left:l<=t.width?(t.width-l)/2:Fn(c,t.width-l,0),top:s<=t.height?(t.height-s)/2:Fn(h,t.height-s,0),width:l,height:s}}function xw(e,t,a,n,o,l){let s=Om(e,t,a);if(!s.width||!s.height)return a;let c=Lu(e,t),h=Fn(a.zoom*l,c,Math.max(4,c*2)),g=h/Math.max(a.zoom,c),w=s.width*g,$=s.height*g,f=(n.x-s.left)/s.width,y=(n.y-s.top)/s.height,A=o.x-f*w,S=o.y-y*$;return{zoom:h,centerX:Fn((t.width/2-A)/w,0,1),centerY:Fn((t.height/2-S)/$,0,1)}}function Rm(e,t){let a=Math.max(1,t),n=Math.max(4,a*2);return .32+1.03*((Fn(e,a,n)-a)/(n-a))}function Vm(e,t,a){let n=Math.min(90,t.width/2),o=e.left+a.x*e.width,l=e.top+a.y*e.height;return{left:Fn(o,n,t.width-n),top:Fn(l>t.height-130?l-116:l,0,Math.max(0,t.height-116))}}var r=Fr(Dm()),i="marinara-capability-villages",Tw="marinara-capability-villages-styles",QN="/api/villages",ZN=[{value:"fresh-start",label:"Fresh start"},{value:"refuge",label:"Refuge"},{value:"shared-project",label:"Shared project"},{value:"discovery",label:"Discovery"},{value:"homecoming",label:"Homecoming"},{value:"something-else",label:"Something else"}],Ew={roads:!0,structures:!1,water:!1},kw=["Village identity","Connections","Village map","Build the village","Review"],Cw=1,_m=3,Hm="__villages_image_disabled__",jm=["neutral","happy","sad","angry","surprised","thinking"],Aw="A small home with a modest main room and a quiet place to rest.";function KN(e){let t=[];for(let a of e){let n=t[t.length-1];n&&n.label===a.dateLabel?n.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}function Im(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":Pw.format(t)}function JN(e){return Im(e.occurredAt)}function FN(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function zw(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Um(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var PN=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function WN(e,t){let a=[],n=Date.parse(e);if(Number.isFinite(n)){let l=Math.floor((Date.now()-n)/864e5);a.push(l<=0?"written today":l===1?"written yesterday":`written ${l} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${PN.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function e5(e,t){return e.find(a=>a.id===t)?.presentation.image?.url??""}var Xm=class extends m.Component{constructor(){super(...arguments);Yf(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let n=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=n,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:n},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${i}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h1",{className:`${i}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${i}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},t5=`
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
.${i}-venue-about {
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--popover); padding: .625rem .75rem;
}
.${i}-venue-here { display: flex; flex-direction: column; gap: .25rem; }
.${i}-venue-here .${i}-roster { margin-top: .25rem; }
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
  transform: translate(-50%, 1.5rem);
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
.${i}-home-full .${i}-pin[data-kind="place"], .${i}-stage[data-mobile="true"] .${i}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; padding: 0; border: 0; border-radius: 0; background: transparent; color: #30261c; box-shadow: none; text-align: center; white-space: normal; line-height: 1.1; overflow: visible; }
.${i}-home-full .${i}-pin-photo-card, .${i}-stage[data-mobile="true"] .${i}-pin-photo-card { display: flex; flex: 0 0 auto; flex-direction: column; width: clamp(3.5rem, 6cqw, 5rem); gap: .1rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; box-shadow: 0 3px 8px #0009; transform-origin: center; }
.${i}-stage[data-mobile="true"] .${i}-pin-photo-card { width: clamp(4rem, 17cqw, 5.25rem); }
.${i}-home-full .${i}-pin-photo, .${i}-stage[data-mobile="true"] .${i}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; overflow: visible; }
.${i}-home-full .${i}-pin-photo img, .${i}-stage[data-mobile="true"] .${i}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-home-full .${i}-pin-photo-tack, .${i}-stage[data-mobile="true"] .${i}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${i}-home-full .${i}-pin-name, .${i}-stage[data-mobile="true"] .${i}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-size: .58rem; font-weight: 700; }
.${i}-stage[data-mobile="true"] .${i}-pin[data-kind="person"] { max-width: 7rem; }
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
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo-card { display: flex; flex-direction: column; gap: .1rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; color: #30261c; box-shadow: 0 3px 8px #0009; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .55rem; font-weight: 700; }
.${i}-pin-photo-empty { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #e8dfc9; font-size: 1.15rem; }
.${i}-pin-placement-error { position: absolute; z-index: 15; left: .5rem; bottom: .5rem; margin: 0; max-width: calc(100% - 1rem); padding: .4rem .6rem; border-radius: .5rem; background: #261a19e8; color: white; font-size: .75rem; pointer-events: none; }
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
.${i}-room-mode-toggle:focus-visible, .${i}-room-mode-menu button:focus-visible, .${i}-room-star-detail:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${i}-room-star-detail { flex: 1; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.${i}-memory-backdrop { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; background: #0009; }
.${i}-memory-dialog { box-sizing: border-box; width: min(28rem, 100%); max-height: min(75cqh, 36rem); overflow-y: auto; padding: 1rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--popover); color: var(--foreground); box-shadow: 0 1rem 2rem #0009; }
.${i}-memory-dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.${i}-memory-dialog-head button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 1.5rem; cursor: pointer; }
.${i}-memory-dialog p { margin: .75rem 0 0; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
@container ${i} (max-width: 44rem) { .${i}-room-screen .${i}-chat-vn { width: 100%; padding: .45rem; } .${i}-room-screen .${i}-chat-vn-asides { width: min(85%, 22rem); } .${i}-room-mode-toggle { width: 2.5rem; height: 2.5rem; } }
@container ${i} (min-width: 34rem) and (max-height: 30rem) { .${i}-room-screen .${i}-chat-vn { width: 64%; align-self: flex-end; } }
`;function Mw(){let e=document.getElementById(Tw);if(!document.querySelector(i)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=Tw,t.textContent=t5,document.head.appendChild(t)}var a5="marinara_admin_secret";function Zw(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(a5)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var n5="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function Kw(e,t,a){let n=e?.error,o=typeof n=="string"&&n?n:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${n5} (${o})`):new Error(o)}async function D(e,t){let a=await fetch(`${QN}${e}`,{...t,headers:Zw(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw Kw(n,a.status,`The village replied ${a.status}.`);return pw(n)}async function Zm(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:Zw(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw Kw(n,a.status,`The Engine replied ${a.status}.`);return n}var Mi=e=>typeof e=="number"&&Number.isFinite(e);function Jw(e){let t=e;for(let $=0;$<2&&typeof t=="string";$+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:n,srcY:o,srcWidth:l,srcHeight:s}=a;if(Mi(n)&&Mi(o)&&Mi(l)&&Mi(s))return l<=0||s<=0||n<0||o<0||n+l>1.001||o+s>1.001?null:{srcX:n,srcY:o,srcWidth:l,srcHeight:s};let{zoom:c,offsetX:h,offsetY:g,fullImage:w}=a;return!Mi(c)||c<=0||!Mi(h)||!Mi(g)||w!==void 0&&typeof w!="boolean"?null:w===void 0?{zoom:c,offsetX:h,offsetY:g}:{zoom:c,offsetX:h,offsetY:g,fullImage:w}}function i5(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function o5(e,t){if(e.length===0)return{};let a=await Zm("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),n={};if(!Array.isArray(a))return n;for(let o of a){let l=typeof o?.id=="string"?o.id:"",s=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";l.length>0&&s.length>0&&(n[l]={url:s,crop:Jw(o.avatarCrop)})}return n}async function l5(e,t){let a=e.trim();if(a.length===0)return null;let n=await Zm(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof n?.avatarPath=="string"?n.avatarPath.trim():"";return o.length===0?null:{url:o,crop:Jw(n.avatarCrop)}}function r5(e){let t=[];for(let a of e){let n=typeof a.id=="string"?a.id.trim():"";if(n.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let l=typeof a.name=="string"&&a.name.trim()?a.name.trim():n;t.push({id:n,name:l,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function U(e,t){return e instanceof Error&&e.message?e.message:t}function fr(e){let t=U(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function Ow(e){try{let{session:t}=await D("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}function Rw(e){let t=U(e,"The greeting could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The greeting took too long. Retry it or continue without a greeting.":`${t} Retry it or continue without a greeting.`}function br(e,t){return Fw(mw(e),t)}function Fw(e,t){let a=0;return e.map(n=>{let o=`${t}${a++}`;switch(n.kind){case"text":return n.text;case"code":return(0,r.jsx)("code",{className:`${i}-chat-md-code`,dir:"ltr",children:n.text},o);case"link":return(0,r.jsx)("a",{className:`${i}-chat-md-link`,href:n.href,target:"_blank",rel:"noopener noreferrer",children:n.text},o);default:return s5(n,o)}})}function s5(e,t){let a=Fw(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${i}-chat-md-highlight`,children:a},t)}}function u5(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function yr(e){return e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null}function vr(e){return e.filter(t=>yr(t))}function Sa(e){return e.filter(t=>!yr(t))}function c5(e,t){let a=vr(e);return a.length!==t.length?!1:t.every((n,o)=>{let l=a[o];return l.id===n.id&&l.occupancy.homeKind===n.building&&l.occupancy.playerHome===n.isPlayerHome&&l.occupancy.residentCharacterId===n.characterId&&l.description===n.description&&Math.abs((l.presentation.x??-1)-(n.x??-1))<1e-4&&Math.abs((l.presentation.y??-1)-(n.y??-1))<1e-4})}function Vw(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let l=a.get(o.id);return{id:o.id,name:l?.name??"",purpose:l?.purpose??"",description:o.description,category:l?.category??"",presentation:{image:l?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:o.building},capabilities:l?.capabilities??[],state:l?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...Sa(e)]}function Gu(){return Math.random().toString(36).slice(2,10)}function gr(e){return Math.round(e*1e4)/1e4}var d5=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),Pw=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),h5=6e4,m5=700;function Dw(e){return`${d5.format(e)} \xB7 ${Pw.format(e)}`}function f5(){let[e,t]=(0,m.useState)(()=>Dw(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(Dw(new Date)),1e3);return()=>clearInterval(a)},[]),e}function g5(){let[e,t]=f5().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${i}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function p5({weather:e}){return(0,r.jsxs)("span",{className:`${i}-mobile-datetime`,children:[(0,r.jsx)(g5,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:b5(e)})]})}function b5(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function _w(e){return e?.closest(i)??null}function v5(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(_w(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,n=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":n,title:n,onClick:o=>{let l=_w(o.currentTarget);if(!l)return;if(document.fullscreenElement===l){document.exitFullscreen().catch(()=>{});return}let s=l.requestFullscreen?.();s&&s.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function y5({happenings:e,recap:t,mobile:a=!1}){let n=(0,m.useRef)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let s=n.current;if(!s)return;let c=()=>l(s.open);return s.addEventListener("toggle",c),()=>s.removeEventListener("toggle",c)},[]),(0,m.useEffect)(()=>{if(!o)return;let s=c=>{!(c.target instanceof Node)||n.current?.contains(c.target)||n.current?.removeAttribute("open")};return document.addEventListener("pointerdown",s),document.addEventListener("keydown",s),()=>{document.removeEventListener("pointerdown",s),document.removeEventListener("keydown",s)}},[o]),(0,r.jsxs)("details",{ref:n,className:`${i}-news`,children:[(0,r.jsxs)("summary",{className:`${i}-button ${i}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${i}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${i}-news-panel`,children:[(0,r.jsx)("h2",{className:`${i}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${i}-news-list`,children:t.details.map(s=>(0,r.jsx)("li",{className:`${i}-news-item`,children:s.text},`recap-${s.id}`))}):null,t.summaries.map(s=>(0,r.jsx)("p",{className:`${i}-news-empty`,children:s},s)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${i}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${i}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${i}-news-list`,children:e.map(s=>(0,r.jsx)("li",{className:`${i}-news-item`,children:s.text},s.id))})]})]})}function Ww(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function Hw(e){return e.length>0?Ww(e,!0):"Empty house"}function ju(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function qm(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function Uw(e,t){return t.length>0?Ww(t,!0):e.name||"An empty house"}function pr(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var w5=.028;function Iu(e){return new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(typeof n.result=="string"?n.result:""),n.onerror=()=>a(new Error("That picture could not be read.")),n.readAsDataURL(e)})}function Lm(e){return new Promise((t,a)=>{let n=new Image;n.onload=()=>t({width:n.naturalWidth,height:n.naturalHeight}),n.onerror=()=>a(new Error("That picture could not be read.")),n.src=e})}var qw=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function Bm(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function Gm(e,t,a){return e<t?t:e>a?a:e}function x5(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let s=Math.min(t.width/e.width,t.height/e.height),c=e.width*s,h=e.height*s;return{left:(t.width-c)/2,top:(t.height-h)/2,width:c,height:h}}let n=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*n,l=e.height*n;return{left:(t.width-o)*(a.focusX/100),top:(t.height-l)*(a.focusY/100),width:o,height:l}}function $5(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Yu(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function Ym({src:e,alt:t,pins:a,placing:n,view:o,shape:l,zoom:s,onPlace:c,onView:h,onDismiss:g,compact:w,fitToRoom:$,mobile:f,photoPins:y,children:A}){let S=c!==void 0,V=h!==void 0,b=(0,m.useRef)(null),p=(0,m.useRef)(null),[x,T]=(0,m.useState)(null),[M,I]=(0,m.useState)(null),[H,q]=(0,m.useState)(null),ae=(0,m.useRef)(null),O=(0,m.useRef)(new Map),se=(0,m.useRef)(null),[rt,St]=(0,m.useState)(null),[Ta,ha]=(0,m.useState)(null),[gn,st]=(0,m.useState)(""),fe=(0,m.useRef)(null),Zt=(0,m.useRef)(null),Me=(0,m.useRef)(!1),[Kt,ft]=(0,m.useState)(null),G=(0,m.useMemo)(()=>Kt?{...o,...Kt}:o,[Kt,o]),J=e?x?.src===e?x:null:l,ma={zoom:J&&M?Lu(J,M):1,centerX:.5,centerY:.5},Ie=H??ma,X=(0,m.useMemo)(()=>f?J&&M?Om(J,M,Ie):null:e?x&&x.src===e&&M?x5(x,M,G):null:M?{left:0,top:0,width:M.width,height:M.height}:null,[x,M,G,f,J,Ie,e]);(0,m.useEffect)(()=>{q(null),ae.current=null,O.current.clear(),se.current=null},[e,M?.width,M?.height]);let Tt=l?$&&rt?{width:`${rt.width}px`,height:`${rt.height}px`,aspectRatio:`${l.width} / ${l.height}`}:{aspectRatio:`${l.width} / ${l.height}`}:void 0,Ea=(0,m.useCallback)(()=>{let k=p.current;if(!k)return;let _=k.getBoundingClientRect();_.width===0||_.height===0||I(P=>P&&P.width===_.width&&P.height===_.height?P:{width:_.width,height:_.height})},[]);(0,m.useEffect)(()=>{let k=p.current;if(!k||typeof ResizeObserver>"u")return;let _=new ResizeObserver(()=>Ea());return _.observe(k),()=>_.disconnect()},[Ea]);let Fe=(0,m.useCallback)(()=>{let k=b.current?.parentElement;if(!k||!l)return;let _=k.getBoundingClientRect(),P=getComputedStyle(k),Ee=bt=>Number.parseFloat(P.getPropertyValue(bt))||0,De=_.width-Ee("padding-left")-Ee("padding-right"),Ft=_.height-Ee("padding-top")-Ee("padding-bottom"),Dt=l.width/l.height,ut=Math.min(De,Ft*Dt);ut>0&&St(bt=>bt&&Math.abs(bt.width-ut)<.5?bt:{width:ut,height:ut/Dt})},[l]);(0,m.useLayoutEffect)(()=>{if(!$||(Fe(),typeof ResizeObserver>"u"))return;let k=b.current?.parentElement;if(!k)return;let _=new ResizeObserver(()=>Fe());return _.observe(k),()=>_.disconnect()},[$,Fe]);let ka=(0,m.useCallback)((k,_)=>{if(!(!c||!X)){if(y){let P=f?Math.min(84,Math.max(64,M?.width?M.width*.17:64))*Rm(Ie.zoom,ma.zoom):Math.min(44,Math.max(24,X.width*.055)),Ee=P+(f?18:13);if(!yw({x:k,y:_},a,X,{width:P,height:Ee})){st("Choose a spot farther from another photograph.");return}}st(""),c(gr(k),gr(_))}},[M?.width,f,Ie.zoom,ma.zoom,c,y,X,a]),gt=(0,m.useCallback)(k=>{if(!S||!c||!X)return;let _=k.currentTarget.getBoundingClientRect(),P=(k.clientX-_.left-X.left)/X.width,Ee=(k.clientY-_.top-X.top)/X.height;!(P>=0&&P<=1)||!(Ee>=0&&Ee<=1)||ka(P,Ee)},[c,S,X,ka]),Wn=(0,m.useCallback)(k=>{if(!V||!X||!h||G.fit!=="cover")return;let _=k.currentTarget.getBoundingClientRect();fe.current={x:k.clientX,y:k.clientY,focusX:G.focusX,focusY:G.focusY,spanX:_.width-X.width,spanY:_.height-X.height},ft({focusX:G.focusX,focusY:G.focusY}),k.currentTarget.setPointerCapture(k.pointerId),k.preventDefault()},[V,G.focusX,G.focusY,G.fit,h,X]),Jt=(0,m.useCallback)(k=>{let _=fe.current;if(!_)return;let P=_.spanX===0?_.focusX:_.focusX+(k.clientX-_.x)/_.spanX*100,Ee=_.spanY===0?_.focusY:_.focusY+(k.clientY-_.y)/_.spanY*100;ft({focusX:gr(Gm(P,0,100)),focusY:gr(Gm(Ee,0,100))})},[]),j=(0,m.useCallback)(k=>{if(!fe.current)return;fe.current=null,k.currentTarget.hasPointerCapture(k.pointerId)&&k.currentTarget.releasePointerCapture(k.pointerId);let _=Kt;ft(null),_&&h&&h({...o,..._})},[Kt,h,o]),ei=(0,m.useCallback)(k=>{!h||!s||h({...o,zoom:gr(Gm(k,s.min,s.max))})},[h,o,s]),z=()=>{let k=[...O.current.values()];if(k.length===0){se.current=null;return}let _=k[0],P=k[1];se.current={view:ae.current??Ie,x:P?(_.x+P.x)/2:_.x,y:P?(_.y+P.y)/2:_.y,distance:P?Math.hypot(_.x-P.x,_.y-P.y):1}},Te=k=>{if(!f||k.pointerType!=="touch"||(k.isPrimary&&(O.current.clear(),Me.current=!1),!p.current)||k.target instanceof Element&&k.target.closest(`.${i}-doors, .${i}-zoom`))return;let _=p.current.getBoundingClientRect();O.current.set(k.pointerId,{x:k.clientX-_.left,y:k.clientY-_.top}),O.current.size>1&&(Me.current=!0),z()},ie=k=>{if(!f||!O.current.has(k.pointerId)||!J||!M||!p.current)return;let _=p.current.getBoundingClientRect();O.current.set(k.pointerId,{x:k.clientX-_.left,y:k.clientY-_.top});let P=[...O.current.values()],Ee=P[0],De=P[1],Ft=De?(Ee.x+De.x)/2:Ee.x,Dt=De?(Ee.y+De.y)/2:Ee.y,ut=De?Math.hypot(Ee.x-De.x,Ee.y-De.y):1,bt=se.current;if(!bt||!ww(bt,{x:Ft,y:Dt,distance:ut})&&!Me.current)return;Me.current||g?.(),Me.current=!0;let Qo=xw(J,M,bt.view,{x:bt.x,y:bt.y},{x:Ft,y:Dt},De&&bt.distance>0?ut/bt.distance:1);ae.current=Qo,q(Qo)},pt=(k,_=!1)=>{if(!f||!O.current.has(k.pointerId))return;let P=!_&&O.current.size===1&&!Me.current;if(O.current.delete(k.pointerId),z(),!P||!(k.target instanceof Element))return;let Ee=k.target.closest(`.${i}-pin`)?.dataset.pinId,De=Ee?a.find(Ft=>Ft.id===Ee):null;if(De?.onSelect){Me.current=!0,De.onSelect();return}if(!(!k.target.closest(`.${i}-canvas`)||k.target.closest("button")))if(S&&n&&c&&X){let Ft=p.current.getBoundingClientRect(),Dt=(k.clientX-Ft.left-X.left)/X.width,ut=(k.clientY-Ft.top-X.top)/X.height;Dt>=0&&Dt<=1&&ut>=0&&ut<=1&&(Me.current=!0,ka(Dt,ut))}else g&&(Me.current=!0,g())};return(0,r.jsxs)("div",{ref:b,className:`${i}-stage${w?` ${i}-stage-compact`:""}`,style:Tt,"data-shaped":l?"true":"false","data-framing":V&&G.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":y?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:k=>{if(f){Te(k);return}Me.current=!1,Zt.current=k.pointerType==="touch"?{x:k.clientX,y:k.clientY}:null},onPointerMoveCapture:k=>{if(f){ie(k);return}let _=Zt.current;_&&(Math.abs(k.clientX-_.x)>8||Math.abs(k.clientY-_.y)>8)&&(Me.current=!0)},onPointerUpCapture:f?pt:void 0,onPointerCancelCapture:k=>{f&&pt(k,!0),Zt.current&&(Me.current=!0)},onClickCapture:k=>{Me.current&&(Me.current=!1,k.preventDefault(),k.stopPropagation())},children:[A,gn&&n?(0,r.jsx)("p",{className:`${i}-pin-placement-error`,role:"alert",children:gn}):null,(0,r.jsxs)("div",{ref:p,className:`${i}-canvas`,"data-placing":S&&n?"true":"false","data-dragging":Kt?"true":"false",onClick:S&&n?gt:g?()=>g():void 0,onPointerDown:V?Wn:void 0,onPointerMove:V?Jt:void 0,onPointerUp:V?j:void 0,onPointerCancel:V?j:void 0,children:[e?(0,r.jsx)("img",{className:`${i}-canvas-img`,style:f&&X?{position:"absolute",left:X.left,top:X.top,width:X.width,height:X.height,objectFit:"fill"}:$5(G),src:e,alt:t,draggable:!1,onLoad:k=>{let{naturalWidth:_,naturalHeight:P}=k.currentTarget;_<=0||P<=0||(T({src:e,width:_,height:P}),Ea())},onError:()=>ha(e)}):(0,r.jsxs)(r.Fragment,{children:[f&&X?(0,r.jsx)("span",{className:`${i}-mobile-logical`,style:{left:X.left,top:X.top,width:X.width,height:X.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${i}-canvas-empty`,children:"Logical village map"})]}),e&&Ta===e?(0,r.jsx)("span",{className:`${i}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,X?a.map(k=>(0,r.jsxs)("span",{className:`${i}-pin-holder`,style:{left:`${X.left+k.x*X.width}px`,top:`${X.top+(k.y+(f&&k.kind!=="person"?0:k.dy??0))*X.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${i}-pin`,"data-pin-id":k.id,"data-tone":k.tone,"data-kind":k.kind??"place",disabled:k.onSelect===void 0,title:k.text,onClick:_=>{_.stopPropagation(),k.onSelect?.()},children:(f||y)&&k.kind!=="person"?(0,r.jsxs)("span",{className:`${i}-pin-photo-card`,style:f?{transform:`scale(${Rm(Ie.zoom,ma.zoom)})`}:{width:`${Math.min(44,Math.max(24,X.width*.055))}px`},children:[(0,r.jsxs)("span",{className:`${i}-pin-photo`,"aria-hidden":"true",children:[k.image?(0,r.jsx)("img",{src:k.image,alt:"",loading:"lazy",draggable:!1}):(0,r.jsx)("span",{className:`${i}-pin-photo-empty`,children:"\u2302"}),(0,r.jsx)("span",{className:`${i}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:k.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${i}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:k.text})]})}),k.onRemove?(0,r.jsx)("button",{type:"button",className:`${i}-pin-remove`,"aria-label":`Take ${k.text} off the map`,onClick:_=>{_.stopPropagation(),k.onRemove?.()},children:"\xD7"}):null,k.onResume?(0,r.jsx)("button",{type:"button",className:`${i}-pin-resume`,onClick:_=>{_.stopPropagation(),k.onResume?.()},children:"DEBUG: Resume Chat"}):null]},k.id)):null]}),X?a.filter(k=>k.doors!==void 0&&k.doors.length>0).map(k=>(0,r.jsx)("div",{className:`${i}-doors`,style:{left:`${M?Vm(X,M,k).left:X.left+k.x*X.width}px`,top:`${M?Vm(X,M,k).top:X.top+(k.y+(k.dy??0))*X.height}px`},children:k.doors?.map(_=>(0,r.jsx)("button",{type:"button",className:`${i}-door`,onClick:P=>{P.stopPropagation(),_.onSelect()},children:_.label},_.label))},`doors:${k.id}`)):null,V&&s&&G.fit==="cover"?(0,r.jsxs)("div",{className:`${i}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:G.zoom>=s.max,onClick:()=>ei(G.zoom+s.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:G.zoom<=s.min,onClick:()=>ei(G.zoom-s.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:G.focusX===50&&G.focusY===50&&G.zoom===s.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:s.min})},children:"Centre"})]}):null]})}function Pn(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function Lw({idPrefix:e,personas:t,draft:a,onDraft:n,storedId:o,storedName:l,storedMissing:s,disabled:c}){let h=(t??[]).find(f=>f.id===a)??null,g=h?.name??(a===o?l:""),w=s&&a===o,$=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${i}-${e}-persona`,className:`${i}-select`,value:a,disabled:c||t===null||t.length===0,onChange:f=>n(f.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,r.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),$?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:w?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${i}-macro-help`,children:h.summary}):null]}):null]})}function Bw({books:e,error:t,selected:a,onChange:n,disabled:o}){let l=new Map((e??[]).map(h=>[h.id,h])),s=(e??[]).filter(h=>!h.hiddenFromLibrary||a.includes(h.id)),c=a.filter(h=>!l.has(h));return(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books supply live world facts for places, stories, conversations, and generated scenery. Villages never edits them."}),t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No lorebooks in the Engine library."}):null,[...s,...c.map(h=>({id:h,name:h,enabled:!1}))].map(h=>{let g=a.includes(h.id),w=c.includes(h.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":h.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g,disabled:o||!h.enabled&&!g,onChange:()=>n(g?a.filter($=>$!==h.id):[...a,h.id])}),h.name,w?` (${w})`:""]},h.id)})]})}function Gw({homes:e,villagers:t,buildings:a,disabled:n,selectedId:o,onPatch:l,onRemove:s,onSelect:c,lockedIds:h,showDescriptions:g,onGenerateDescription:w}){let $=new Set(e.map(f=>f.characterId));return(0,r.jsx)("div",{className:`${i}-home-list`,children:e.map((f,y)=>{let A=ju(a,f.building),S=h?.has(f.id)??!1,V=t.find(b=>b.id===f.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${i}-home-row`,"data-selected":f.id===o?"true":"false",onMouseEnter:()=>c(f.id),children:[(0,r.jsx)("span",{className:`${i}-home-index`,"aria-hidden":"true",children:y+1}),f.isPlayerHome?(0,r.jsx)("span",{className:`${i}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-who`,children:V?`${V} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${i}-select`,value:f.characterId??"",disabled:n||S,"aria-label":`Who lives in home ${y+1}`,onChange:b=>l(f.id,{characterId:b.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(b=>{let p=b.id!==f.characterId&&$.has(b.id);return(0,r.jsx)("option",{value:b.id,disabled:p,children:p?`${b.name} \u2014 already housed`:b.name},b.id)})]}):null]}),(0,r.jsxs)("span",{className:`${i}-building`,children:[A.name,A.category?(0,r.jsx)("span",{className:`${i}-hint`,children:A.category}):null]}),g?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("textarea",{className:`${i}-textarea`,value:f.description,maxLength:1e3,disabled:n||S,"aria-label":`Description of home ${y+1}`,onChange:b=>l(f.id,{description:b.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:n||S,onClick:()=>w?.(f),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:n||S,"aria-label":`Take home ${y+1} off the map`,onClick:()=>s(f.id),children:"\xD7"}),S?(0,r.jsx)("span",{className:`${i}-hint`,children:"Move approved and completed before changing this home."}):null]},f.id)})})}function Yw({id:e,label:t,hint:a,options:n,value:o,disabled:l,onChange:s}){let c=o.length>0&&!n.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${i}-select`,value:o,disabled:l,onChange:h=>s(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),c?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,n.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a})]})}function jw({onSetupProblem:e,onImageWarningChange:t}){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)([]),[s,c]=(0,m.useState)(""),[h,g]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let S=!1;return(async()=>{try{let[V,b]=await Promise.all([D("/connections"),Zm("/api/connections")]);if(S)return;n(V),l(r5(Array.isArray(b)?b:[]))}catch(V){S||c(U(V,"This agent's connections could not be read."))}})(),()=>{S=!0}},[]);let w=(0,m.useCallback)(async S=>{g(!0),c("");try{n(await D("/connections",{method:"PUT",body:JSON.stringify(S)}))}catch(V){c(U(V,"That connection could not be saved."))}finally{g(!1)}},[]),$=o.filter(S=>S.category==="language"),f=o.filter(S=>S.category==="image_generation"),y=f.some(S=>S.defaultForAgents),A=a!==null&&(a.imageConnectionId===Hm||f.length===0||a.imageConnectionId.length===0&&!y);return(0,m.useEffect)(()=>{if(!e)return;let S=a?.systemConnectionId??"",V=a?.narrationConnectionId??"";a?S.length===0||V.length===0?e("Choose both System and Narration connections before continuing."):!$.some(b=>b.id===S)||!$.some(b=>b.id===V)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,a,$]),(0,m.useEffect)(()=>{t?.(A)},[A,t]),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Connections"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),a?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(Yw,{id:`${i}-connection-system`,label:"System",hint:"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:$,value:a.systemConnectionId,disabled:h,onChange:S=>{w({systemConnectionId:S})}}),(0,r.jsx)(Yw,{id:`${i}-connection-narration`,label:"Narration",hint:"Everything the villagers say to you, and how the conversation reads back afterwards.",options:$,value:a.narrationConnectionId,disabled:h,onChange:S=>{w({narrationConnectionId:S})}}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${i}-connection-image`,className:`${i}-select`,value:a.imageConnectionId,disabled:h,onChange:S=>{w({imageConnectionId:S.target.value})},children:[(0,r.jsx)("option",{value:Hm,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),a.imageConnectionId.length>0&&a.imageConnectionId!==Hm&&!f.some(S=>S.id===a.imageConnectionId)?(0,r.jsx)("option",{value:a.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,f.map(S=>(0,r.jsx)("option",{value:S.id,children:S.name},S.id))]}),(0,r.jsxs)("span",{className:`${i}-hint`,children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${i}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})]})]}):s.length===0?(0,r.jsx)("span",{className:`${i}-hint`,children:"Reading this agent's connections\u2026"}):null,s?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:s}):null]})}function e0(){let[e,t]=(0,m.useState)(null),[a,n]=(0,m.useState)(""),[o,l]=(0,m.useState)(!1),[s,c]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return D("/narration").then(w=>{g||t(w)}).catch(w=>{g||n(U(w,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{l(!0),c(!1),n("");try{let w=await D("/narration",{method:"PUT",body:JSON.stringify(g)});return t(w),c(!0),w}catch(w){return n(U(w,"That writing change could not be saved.")),null}finally{l(!1)}},[]);return{view:e,error:a,busy:o,saved:s,save:h}}function N5(){let{view:e,error:t,busy:a,saved:n,save:o}=e0(),[l,s]=(0,m.useState)(null),c=l??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:i+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Narration style",value:c,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>s(h.target.value)}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.styleInstructions,onClick:()=>{o({styleInstructions:c}).then(h=>{h&&s(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&s(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:i+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function S5(){let{view:e,error:t,busy:a,saved:n,save:o}=e0(),[l,s]=(0,m.useState)(null),c=l??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:i+"-panel",children:[(0,r.jsx)("h2",{className:i+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:i+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Villager reply guidance",value:c,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>s(h.target.value)}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.replyGuidance,onClick:()=>{o({replyGuidance:c}).then(h=>{h&&s(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&s(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:i+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function Xo({portrait:e,name:t,className:a,glyph:n="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:i5(e.crop)}):n==="person"?(0,r.jsxs)("svg",{className:`${i}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function T5({villager:e,portrait:t,selected:a,onSelect:n}){return(0,r.jsxs)("div",{className:`${i}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-tile-head`,children:[(0,r.jsx)(Xo,{portrait:t,name:e.name,className:`${i}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${i}-tile-name`,onClick:n,disabled:n===void 0,title:n?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${i}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${i}-tag`,children:o},o))]})]})}function Iw(e,t){let a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function E5(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort(($,f)=>{let y=A=>{let S=jm.indexOf(A);return S<0?jm.length:S};return y($.label)-y(f.label)||$.label.localeCompare(f.label)}),n=512,o=768,l=2,s=document.createElement("canvas");s.width=l*n,s.height=Math.ceil(a.length/l)*o;let c=s.getContext("2d");if(!c)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let $=0;$<a.length;$+=1){let f=a[$],y=new Image;y.src=f.url,await y.decode();let A=$%l*n,S=Math.floor($/l)*o,V=Math.min(n/y.naturalWidth,o/y.naturalHeight),b=Math.round(y.naturalWidth*V),p=Math.round(y.naturalHeight*V);c.drawImage(y,A+Math.floor((n-b)/2),S+o-p,b,p),h.push({expression:f.label,x:A,y:S,width:n,height:o})}let g=await new Promise(($,f)=>s.toBlob(y=>y?$(y):f(new Error("The browser could not export this sheet.")),"image/png")),w=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";Iw(`${w}-sprites.png`,g),Iw(`${w}-sprites.json`,new Blob([JSON.stringify({width:s.width,height:s.height,cells:h},null,2)],{type:"application/json"}))}function k5({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[n,o]=(0,m.useState)("neutral"),[l,s]=(0,m.useState)(""),[c,h]=(0,m.useState)(""),[g,w]=(0,m.useState)(!0),[$,f]=(0,m.useState)(null),[y,A]=(0,m.useState)([]),[S,V]=(0,m.useState)(!1),[b,p]=(0,m.useState)(""),[x,T]=(0,m.useState)(""),M=e.sprite?.images??[],I=M.some(O=>O.label==="neutral"),H=n==="custom"?l.trim().toLowerCase().replace(/\s+/g,"_"):n;(0,m.useEffect)(()=>{f(null),o("neutral"),p(""),D(`${a}/source`).then(O=>A(O.sprites)).catch(()=>A([]))},[a]);async function q(O){V(!0),p(""),T("");try{await O()}catch(se){p(U(se,"The sprite could not be prepared."))}finally{V(!1)}}function ae(){if(!/^[a-z0-9_-]{1,40}$/.test(H))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(H!=="neutral"&&!I)throw new Error("Approve the neutral sprite first.");return H}return(0,r.jsxs)("section",{className:`${i}-sprite-editor`,"aria-label":`${e.name} sprite creator`,children:[(0,r.jsxs)("h3",{children:["Sprites for ",e.name]}),(0,r.jsx)("p",{children:"Generate a neutral full-body sprite, review it, then add expressions one at a time. Your approved art belongs to this Village."}),(0,r.jsxs)("label",{children:["Expression",(0,r.jsxs)("select",{value:n,onChange:O=>{o(O.target.value),f(null)},children:[jm.map(O=>(0,r.jsx)("option",{value:O,children:O},O)),(0,r.jsx)("option",{value:"custom",children:"Custom\u2026"})]})]}),n==="custom"?(0,r.jsxs)("label",{children:["Custom expression",(0,r.jsx)("input",{value:l,maxLength:40,onChange:O=>{s(O.target.value),f(null)}})]}):null,(0,r.jsx)("p",{className:`${i}-hint`,children:"More starter expressions are coming."}),(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:c,maxLength:2e3,onChange:O=>h(O.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${i}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g,onChange:O=>w(O.target.checked)})," Use approved neutral and available portrait as identity references"]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S,onClick:()=>{q(async()=>{let O=ae(),se=await D(`${a}/generate`,{method:"POST",body:JSON.stringify({expression:O,appearance:c,useReference:g})});f(se.image),T(`Candidate: ${se.width} \xD7 ${se.height}. Review before approving.`)})},children:S?"Working\u2026":$?"Retry this expression":"Generate candidate"}),(0,r.jsxs)("label",{className:`${i}-button`,children:["Upload candidate",(0,r.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:O=>{q(async()=>{ae();let se=O.target.files?.[0];se&&f(await Iu(se)),O.target.value=""})}})]})]}),$?(0,r.jsxs)("div",{className:`${i}-sprite-candidate`,children:[(0,r.jsx)("img",{src:$,alt:`${H} candidate for ${e.name}`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S,onClick:()=>{q(async()=>{let O=await D(`${a}/approve`,{method:"POST",body:JSON.stringify({expression:ae(),image:$})});t(O),f(null),T(`${H} approved.`)})},children:"Approve this sprite"})]}):null,y.length?(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{children:"Copy an existing Engine full-body sprite:"}),(0,r.jsx)("div",{className:`${i}-row`,children:y.map(O=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S||O.expression!=="neutral"&&!I,onClick:()=>{q(async()=>{let se=await D(`${a}/import`,{method:"POST",body:JSON.stringify({expression:O.expression})});t(se),T(`${O.expression} copied to this Village.`)})},children:O.expression},O.expression))})]}):null,M.length?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-sprite-approved`,children:M.map(O=>(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:O.url,alt:`${e.name}: ${O.label}`}),(0,r.jsx)("span",{children:O.label})]},O.label))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:S,onChange:O=>{q(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:O.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:S,onChange:O=>{q(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(O.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S,onClick:()=>{q(()=>E5(e))},children:"Download sheet and manifest"})]})]}):null,x?(0,r.jsx)("p",{role:"status",children:x}):null,b?(0,r.jsx)("p",{role:"alert",children:b}):null]})}function C5({room:e,picture:t,draft:a,mode:n,targetId:o,busy:l,error:s,greetingNotice:c,ruling:h,open:g,ended:w,playerName:$,playerPortrait:f,portraits:y,sprites:A,onDraft:S,onMode:V,onTarget:b,onSend:p,onLeave:x,onEnd:T,onLeavePending:M,endFailed:I,onRetryGreeting:H,onContinueWithoutGreeting:q,notices:ae,onDismissNotice:O,debugDiscardEnabled:se,onDebugDiscard:rt}){let[St,Ta]=(0,m.useState)(0),[ha,gn]=(0,m.useState)(!1),[st,fe]=(0,m.useState)(!1),[Zt,Me]=(0,m.useState)(null),Kt=(0,m.useRef)(null),ft=(0,m.useMemo)(()=>{let z=[],Te=new Map;for(let ie of e.lines){if(ie.kind!=="side"&&ie.kind!=="whisper"||!ie.asideFor)continue;let pt=Te.get(ie.asideFor)??[];pt.push({register:ie.kind,text:ie.content,...ie.targetId?{target:e.participants.find(k=>k.characterId===ie.targetId)?.name??ie.targetId}:{},speakerId:ie.speakerId,name:ie.name,expression:ie.expression}),Te.set(ie.asideFor,pt)}for(let ie of e.lines){if(ie.kind==="side"||ie.kind==="whisper")continue;let pt=ie.speakerId.length===0,k=hw(ie.content,ie.beats??null);k.paragraphs.forEach((_,P)=>{z.push({key:`${z.length}`,speakerId:pt?"":ie.speakerId,name:pt?$:ie.name,player:pt,text:_,asides:[...k.asides[P]??[],...P===k.paragraphs.length-1?Te.get(ie.id??"")??[]:[]],...ie.kind?{register:ie.kind==="narration"?"narration":"speech"}:{},...ie.expression?{expression:ie.expression}:{}})})}return z},[$,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{Ta(z=>vw(Kt.current,e.id,ft.length,z)),Kt.current={roomId:e.id,stepCount:ft.length}},[e.id,ft.length]);let G=Math.min(St,Math.max(0,ft.length-1)),J=ft[G],ma=G>0,Ie=G<ft.length-1,X=!Ie&&!w&&e.status==="active";(0,m.useEffect)(()=>{if(!Zt)return;let z=Te=>{Te.key==="Escape"&&Me(null)};return window.addEventListener("keydown",z),()=>window.removeEventListener("keydown",z)},[Zt]);let Tt=J?.register??(J===void 0||J.speakerId==="__venue_scene__"?"narration":J.player||dw(J.text)==="speech"?"speech":"narration"),Ea=J===void 0?void 0:J.player?f:y[J.speakerId],Fe=e.participants.filter(z=>e.activeIds.includes(z.characterId)),ka=e.status==="closed"&&Fe.length===0?e.participants:Fe,gt=ka.find(z=>z.characterId===J?.speakerId),Wn=ka.filter(z=>z.characterId!==gt?.characterId),Jt=gt?[Wn[0],gt,Wn[1]].filter(z=>!!z):ka.slice(0,3),j=ka.filter(z=>!Jt.some(Te=>Te.characterId===z.characterId)),ei=(0,r.jsxs)("p",{className:`${i}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${i}-chat-spinner ${i}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${i}-chat-pending-label`,children:e.status==="opening"?"Preparing a greeting\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${i}-chat`,"data-open":g?"true":"false","data-ended":w?"true":"false","data-opening-error":e.status==="opening"&&s?"true":"false","aria-label":`Inside ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${i}-visually-hidden`,children:`Here now: ${Fe.length?Fe.map(z=>`${z.name}${z.doing?` is ${z.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${i}-chat-scene`,"aria-hidden":"true",children:t?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${i}-chat-scene-backdrop`,src:t,alt:""}),(0,r.jsx)("span",{className:`${i}-chat-scrim`}),(0,r.jsx)("span",{className:`${i}-chat-vignette`})]}):null}),(0,r.jsx)("div",{className:`${i}-chat-head`,children:(0,r.jsxs)("span",{className:`${i}-chat-actions`,children:[se&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:rt,disabled:l,title:"DEBUG: Clears this visit and transcript. Completed effects and memories remain.",children:"DEBUG: Discard Visit"}):null,se&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:T,disabled:l,title:"DEBUG: End this visit immediately without a closing exchange",children:"DEBUG: End immediately"}):null,I||e.status==="closing"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:M,children:"Leave with memory pending"}):null]})}),ae.length>0?(0,r.jsx)("div",{className:`${i}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:ae.map(z=>(0,r.jsxs)("div",{className:`${i}-room-star`,role:"status",children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),z.kind==="memory"&&z.detail?(0,r.jsx)("button",{type:"button",className:`${i}-room-star-detail`,onClick:()=>Me(z),"aria-label":`Read ${z.text}`,children:z.text}):(0,r.jsx)("span",{children:z.text}),(0,r.jsx)("button",{type:"button",onClick:()=>O(z.id),"aria-label":`Dismiss ${z.text}`,title:"Dismiss notice",children:"\xD7"})]},z.id))}):null,Zt?(0,r.jsx)("div",{className:`${i}-memory-backdrop`,onClick:()=>Me(null),children:(0,r.jsxs)("div",{className:`${i}-memory-dialog`,role:"dialog","aria-modal":"true","aria-label":Zt.text,onClick:z=>z.stopPropagation(),children:[(0,r.jsxs)("div",{className:`${i}-memory-dialog-head`,children:[(0,r.jsx)("strong",{children:Zt.text}),(0,r.jsx)("button",{type:"button",onClick:()=>Me(null),"aria-label":"Close memory",children:"\xD7"})]}),(0,r.jsx)("p",{children:Zt.detail})]})}):null,Fe.length>0?(0,r.jsx)("div",{className:`${i}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:Fe.map(z=>(0,r.jsx)("span",{className:`${i}-chat-activity`,children:`${z.name}: ${z.doing||"spending time here"}`},z.characterId))}):null,(0,r.jsxs)("div",{className:`${i}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${i}-chat-cast`,children:Jt.map(z=>{let Te=A[z.characterId],ie=z.characterId===gt?.characterId?J?.expression??"neutral":"neutral",pt=Te?.images.find(k=>k.label===ie)??Te?.images.find(k=>k.label==="neutral");return(0,r.jsxs)("div",{className:`${i}-chat-cast-person`,"data-active":z.characterId===gt?.characterId?"true":"false",children:[pt?(0,r.jsx)("img",{src:pt.url,alt:"","data-framing":Te?.framing.mode??"full"}):(0,r.jsx)(Xo,{portrait:y[z.characterId],name:z.name,className:`${i}-avatar`}),(0,r.jsx)("span",{children:z.name})]},z.characterId)})}),j.length>0?(0,r.jsx)("div",{className:`${i}-chat-cast-rest`,children:j.map(z=>(0,r.jsxs)("span",{children:[(0,r.jsx)(Xo,{portrait:y[z.characterId],name:z.name,className:`${i}-avatar`}),z.name]},z.characterId))}):null]}),(0,r.jsxs)("div",{className:`${i}-chat-vn`,children:[ha?(0,r.jsx)("div",{className:`${i}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,children:e.lines.map((z,Te)=>(0,r.jsxs)("p",{className:`${i}-chat-vn-text`,children:[(0,r.jsxs)("strong",{children:[z.role==="user"?$:z.kind==="narration"||z.speakerId==="__venue_scene__"?"Narration":z.name||"Resident",z.kind==="side"?" \xB7 aside":z.kind==="whisper"?" \xB7 whisper":"",":"," "]}),br(z.content,`history-${Te}-`)]},z.id??Te))}):null,J&&J.asides.length>0?(0,r.jsx)("div",{className:`${i}-chat-vn-asides`,"aria-live":"polite",children:J.asides.map((z,Te)=>(0,r.jsxs)("div",{className:`${i}-chat-vn-aside`,"data-register":z.register,children:[(0,r.jsx)(Xo,{portrait:z.speakerId?y[z.speakerId]:Ea,name:z.name??J.name,glyph:J.player?"person":"initial",className:`${i}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${i}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${i}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${i}-chat-vn-aside-icon`,children:z.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${i}-chat-vn-aside-name`,children:z.name??J.name}),z.register==="whisper"&&z.target?(0,r.jsx)("span",{className:`${i}-chat-vn-aside-target`,children:`\u2192 ${z.target}`}):null]}),(0,r.jsx)("p",{className:`${i}-chat-vn-aside-text`,children:br(z.text,`vn-aside-${Te}-`)})]})]},`${Te}-${z.register}`))}):null,(0,r.jsxs)("div",{className:`${i}-chat-vn-card`,"data-register":Tt,children:[(0,r.jsxs)("div",{className:`${i}-chat-vn-row`,children:[Tt==="speech"?(0,r.jsx)(Xo,{portrait:Ea,name:J?.name??"",glyph:J?.player?"person":"initial",className:`${i}-chat-vn-portrait`}):null,(0,r.jsxs)("div",{className:`${i}-chat-vn-column`,children:[Tt==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${i}-chat-vn-name`,children:J?.name??""}),(0,r.jsxs)("div",{className:`${i}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[J?Tt==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-beat`,"data-register":"narration",children:br(J.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,children:br(J.text,"vn-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Preparing a greeting in ${e.placeName}\u2026`:Fe.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!w&&l?ei:null]})]})]}),ma||Ie?(0,r.jsxs)("div",{className:`${i}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>Ta(G-1),disabled:!ma,title:"Read the paragraph before this one",children:[(0,r.jsx)("svg",{viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:(0,r.jsx)("path",{d:"M10 3.5 5.5 8l4.5 4.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})}),"Previous paragraph"]}),(0,r.jsx)("span",{className:`${i}-chat-vn-counter`,children:`${G+1} / ${Math.max(1,ft.length)}`}),(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>Ta(G+1),disabled:!Ie,title:"Read the next paragraph",children:["Next paragraph",(0,r.jsx)("svg",{viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:(0,r.jsx)("path",{d:"M6 3.5 10.5 8 6 12.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]})]}):null]}),(0,r.jsxs)("div",{className:`${i}-room-panel-tools`,children:[e.lines.length>0?(0,r.jsx)("button",{type:"button",className:`${i}-chat-history-toggle`,"aria-expanded":ha,onClick:()=>gn(z=>!z),children:ha?"Hide history":"History"}):null,(0,r.jsx)("span",{className:`${i}-spacer`}),w&&!Ie?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:T,disabled:l,children:"Return to map"}):X?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:x,disabled:l,children:"End scene"}):null]}),s&&e.status==="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:s}),e.status==="opening"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:H,disabled:l,children:"Retry greeting"}),e.id?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:q,disabled:l,children:"Continue without greeting"}):null]}):null]}):null,c?(0,r.jsx)("div",{className:`${i}-room-error`,role:"status",children:(0,r.jsx)("p",{children:c})}):null,h?(0,r.jsx)("p",{className:`${i}-empty`,children:h}):null,e.status==="closing"?(0,r.jsx)("p",{className:`${i}-hint`,children:"The visit is still being remembered. You can leave with memory pending if filing cannot finish."}):null,X&&n==="fulfill"&&Fe.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,X?(0,r.jsxs)("div",{className:`${i}-composer`,children:[n==="fulfill"&&Fe.length>0?(0,r.jsxs)("select",{value:o,onChange:z=>b(z.target.value),"aria-label":"Whose wish you fulfilled",disabled:l||w||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),Fe.map(z=>(0,r.jsx)("option",{value:z.characterId,children:z.name},z.characterId))]}):null,(0,r.jsx)("div",{className:`${i}-composer-row`,children:(0,r.jsxs)("span",{className:`${i}-chat-input`,children:[(0,r.jsxs)("span",{className:`${i}-room-mode-anchor`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-mode-toggle`,onClick:()=>fe(z=>!z),"aria-label":`Mode: ${n==="chat"?"Chat":"Fulfill"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":st,title:n==="chat"?"Chat":"Fulfill",children:"\u{1F4AC}"}),st?(0,r.jsx)("span",{className:`${i}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill"].map(z=>(0,r.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":n===z,disabled:l||z==="fulfill"&&Fe.length===0,onClick:()=>{V(z),fe(!1)},children:z==="chat"?"Chat":"Fulfill"},z))}):null]}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:a,onChange:z=>S(z.target.value),onKeyDown:z=>{bw(z.key,z.shiftKey,z.nativeEvent.isComposing)&&(z.preventDefault(),e.status==="active"&&(n!=="fulfill"||o)&&p())},placeholder:n==="fulfill"?"What did you do for them?":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:l||w||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${i}-chat-send`,onClick:p,disabled:l||w||e.status!=="active"||a.trim().length===0||n==="fulfill"&&!o,"aria-label":l?"Sending":"Send",title:l?"Sending":"Send",children:l?"Sending\u2026":"Send"})]})}),s&&e.status!=="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:s}),e.status==="active"&&a.trim()?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:p,disabled:l||w,children:"Retry message"}):null]}):null]}):null,s&&I&&!l&&e.status==="active"?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:x,children:"Retry ending scene"}):null]})]})}function A5({place:e,residents:t,onSave:a,onPromoteItem:n}){let[o,l]=(0,m.useState)(e.state.features??[]),[s,c]=(0,m.useState)(e.workerIds??[]),[h,g]=(0,m.useState)(""),[w,$]=(0,m.useState)(!1),[f,y]=(0,m.useState)(""),A=JSON.stringify(o)!==JSON.stringify(e.state.features??[])||JSON.stringify(s)!==JSON.stringify(e.workerIds??[]);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("span",{className:`${i}-label`,children:["Defining features (",o.length,"/5)"]}),o.map((S,V)=>(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,value:S.text,maxLength:240,"aria-label":`Feature ${V+1}`,onChange:b=>l(p=>p.map(x=>x.id===S.id?{...x,text:b.target.value}:x))}),(0,r.jsxs)("label",{children:[(0,r.jsx)("input",{type:"checkbox",checked:S.locked,onChange:b=>l(p=>p.map(x=>x.id===S.id?{...x,locked:b.target.checked}:x))}),"Locked"]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,"aria-label":`Remove feature ${V+1}`,onClick:()=>l(b=>b.filter(p=>p.id!==S.id)),children:"\xD7"})]},S.id)),o.length<5?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>l(S=>[...S,{id:mr(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]),children:"Add feature"}),e.state.furniture.length>0?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{value:h,onChange:S=>g(S.target.value),"aria-label":"Item to promote to a venue feature",children:[(0,r.jsx)("option",{value:"",children:"Choose an item to promote"}),e.state.furniture.map((S,V)=>(0,r.jsx)("option",{value:V,children:S},`${V}-${S}`))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||h===""||A,onClick:()=>{$(!0),y(""),n(Number(h)).catch(S=>y(U(S,"That item could not be promoted."))).finally(()=>$(!1))},children:"Promote to feature"}),A?(0,r.jsx)("span",{className:`${i}-hint`,children:"Save feature edits first."}):null]}):null]}):null,!e.occupancy.playerHome&&!e.occupancy.residentCharacterId?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Assigned workers"}),t.map(S=>(0,r.jsxs)("label",{children:[(0,r.jsx)("input",{type:"checkbox",checked:s.includes(S.characterId),onChange:V=>c(b=>V.target.checked?[...b,S.characterId]:b.filter(p=>p!==S.characterId))}),S.name]},S.characterId))]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||o.some(S=>!S.text.trim()),onClick:()=>{$(!0),y(""),a(o,s).catch(S=>y(U(S,"Features could not be saved."))).finally(()=>$(!1))},children:w?"Saving\u2026":"Save features and workers"}),f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null]})}var Xw="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function z5({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let u=()=>{let v=e.getBoundingClientRect();a(v.width<=704||v.width<=880&&v.height<=512)};u();let d=new ResizeObserver(u);return d.observe(e),()=>d.disconnect()},[e]);let[n,o]=(0,m.useState)(null),[l,s]=(0,m.useState)(null),[c,h]=(0,m.useState)(null),[g,w]=(0,m.useState)(0),[$,f]=(0,m.useState)(null),[y,A]=(0,m.useState)(0),[S,V]=(0,m.useState)(0),[b,p]=(0,m.useState)(0),[x,T]=(0,m.useState)(null),[M,I]=(0,m.useState)(!1),[H,q]=(0,m.useState)(""),[ae,O]=(0,m.useState)(""),[se,rt]=(0,m.useState)(""),[St,Ta]=(0,m.useState)(null),[ha,gn]=(0,m.useState)(!1),[st,fe]=(0,m.useState)("home"),[Zt,Me]=(0,m.useState)(null),[Kt,ft]=(0,m.useState)(!1),[G,J]=(0,m.useState)(null),[ma,Ie]=(0,m.useState)(!1),[X,Tt]=(0,m.useState)(""),[Ea,Fe]=(0,m.useState)(""),[ka,gt]=(0,m.useState)(null),[Wn,Jt]=(0,m.useState)(!1),[j,ei]=(0,m.useState)("village"),[z,Te]=(0,m.useState)("index"),[ie,pt]=(0,m.useState)({}),[k,_]=(0,m.useState)(null),[P,Ee]=(0,m.useState)({}),[De,Ft]=(0,m.useState)({}),[Dt,ut]=(0,m.useState)(""),[bt,Xu]=(0,m.useState)(null),[Qo,Km]=(0,m.useState)(""),[Ka,wr]=(0,m.useState)(""),[_t,xr]=(0,m.useState)(""),[$r,Jm]=(0,m.useState)(null),[Nr,Fm]=(0,m.useState)(""),[Sr,Pm]=(0,m.useState)([]),[Ca,Wm]=(0,m.useState)([]),[ef,n0]=(0,m.useState)(null),[tf,af]=(0,m.useState)(""),[Oi,pn]=(0,m.useState)([]),[ue,Zo]=(0,m.useState)([]),[Ko,Pt]=(0,m.useState)(!1),[Qu,Ri]=(0,m.useState)(!1),[nf,Vi]=(0,m.useState)(null),[i0,Zu]=(0,m.useState)(null),[Tr,Ku]=(0,m.useState)(null),[Er,of]=(0,m.useState)(""),[Ae,Ju]=(0,m.useState)(0),[Aa,lf]=(0,m.useState)(""),[Pe,rf]=(0,m.useState)(""),[Wt,sf]=(0,m.useState)(""),[Ja,uf]=(0,m.useState)(""),[cf,kr]=(0,m.useState)([]),[ti,Di]=(0,m.useState)({}),[Cr,bn]=(0,m.useState)([]),[Jo,Ar]=(0,m.useState)({}),[zr,df]=(0,m.useState)(Ew),[ge,ai]=(0,m.useState)("generate"),[o0,Fu]=(0,m.useState)(""),[Mr,Pu]=(0,m.useState)(null),[Fo,Wu]=(0,m.useState)(null),[vn,ec]=(0,m.useState)(""),[Or,tc]=(0,m.useState)(""),[Et,Po]=(0,m.useState)(!1),[fa,ac]=(0,m.useState)(""),[ea,hf]=(0,m.useState)(null),[nc,l0]=(0,m.useState)("Connections are still loading."),[mf,ff]=(0,m.useState)(!1),[r0,Wo]=(0,m.useState)(!1),[gf,we]=(0,m.useState)(""),[s0,Rr]=(0,m.useState)(!1),[Vr,Dr]=(0,m.useState)(""),[ga,ic]=(0,m.useState)(null),[oc,el]=(0,m.useState)(null),[u0,lc]=(0,m.useState)(!1),[za,_i]=(0,m.useState)(""),[rc,yn]=(0,m.useState)(null),Hi=n?.settings.townMapView??Yu("cover"),pf=n?ga?.size??{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:null,bf=n?ge==="existing"?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:Fo&&Mr===ge?Fo:{width:n.settings.townMapGenerationWidth,height:n.settings.townMapGenerationHeight}:null,c0=n?{min:n.settings.townMapZoomMin,max:n.settings.townMapZoomMax,step:n.settings.townMapZoomStep}:{min:1,max:1,step:.1},_r=ga?ga.image:Vr||null,ni=ge==="none"?null:ge==="existing"?Vr||null:Mr===ge&&o0||null,Hr=ga!==null||u0,tl=Hr?oc??Hi:Hi,sc=ga?Bm(ga.size):null,[al,Oe]=(0,m.useState)(""),[vt,Y]=(0,m.useState)(""),[R,B]=(0,m.useState)(!1),[Q,He]=(0,m.useState)(null),[d0,Ma]=(0,m.useState)(!1),[uc,Ui]=(0,m.useState)(""),[Ur,cc]=(0,m.useState)("chat"),[nl,qr]=(0,m.useState)(""),[h0,vf]=(0,m.useState)(""),[m0,pa]=(0,m.useState)([]),ta=(0,m.useRef)(new Set),[dc,f0]=(0,m.useState)(!1),yf=(0,m.useRef)(0),qi=(0,m.useRef)(0),wf=(0,m.useRef)(""),[hc,il]=(0,m.useState)(""),[ba,Xe]=(0,m.useState)(!1),Li=(0,m.useRef)(!1),Bi=(0,m.useRef)(null),mc=(0,m.useRef)(null),ol=(0,m.useRef)(!1),[g0,ct]=(0,m.useState)(""),[p0,ll]=(0,m.useState)(""),[fc,gc]=(0,m.useState)(!1),[Lr,pc]=(0,m.useState)(""),xf=(0,m.useRef)(""),Br=(0,m.useRef)(!1),[Gr,$f]=(0,m.useState)(!1),bc=(0,m.useRef)(null),vc=(0,m.useRef)(null);(0,m.useEffect)(()=>{let u=vc.current,d=bc.current;u===null||!d||(vc.current=null,d.focus(),d.setSelectionRange(u,u))},[Ka]);let Yr=(0,m.useCallback)(async(u=!1)=>{if(Br.current)return null;Br.current=!0;let d=setTimeout(()=>$f(!0),m5);try{let v=await D("/reconcile",{method:"POST",body:u?JSON.stringify({forceStory:!0}):void 0});return o(v),v}catch{return null}finally{clearTimeout(d),$f(!1),Br.current=!1}},[]),Nf=(0,m.useCallback)(async()=>{let u=n?.happenings[0]?.id??"";pc("Writing...");let d=await Yr(!0);if(!d){pc("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}pc((d.happenings[0]?.id??"")===u?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[n,Yr]),Ue=(0,m.useCallback)(async(u={})=>{try{let d=await D("",{signal:u.signal});o(d),Oe("")}catch(d){if(u.signal?.aborted||u.quiet)return;o(null),Oe(U(d,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let u=n?.village.nextTransitionAt??"";u.length===0||u===xf.current||(xf.current=u,n?.isFounded&&Yr())},[n,Yr]);let Oa=(0,m.useCallback)(async u=>{try{let d=await D("/catalog",{signal:u});s(d.characters),Oe("")}catch(d){if(u?.aborted)return;Oe(U(d,"Could not read your character library."))}},[]),Gi=(0,m.useCallback)(async u=>{try{let d=await D("/personas",{signal:u});Jm(d.personas)}catch(d){if(u?.aborted)return;Jm([]),Oe(U(d,"Could not read your Personas."))}},[]),Yi=(0,m.useCallback)(async u=>{try{let d=await D("/lorebooks",{signal:u});n0(d.books),af("")}catch(d){if(u?.aborted)return;af(U(d,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),Sf=(0,m.useCallback)(async u=>{try{let d=await D("/story?offset=0&limit=50",{signal:u});h(d.entries),w(d.total)}catch(d){if(u?.aborted)return;h(null),Oe(U(d,"Could not read the village story."))}},[]),b0=(0,m.useCallback)(async u=>{B(!0);try{let d=await D(`/story/${encodeURIComponent(u)}`,{method:"DELETE"});h(d.entries),w(d.total),Oe("")}catch(d){Oe(U(d,"That memory could not be removed."))}finally{B(!1)}},[]),v0=(0,m.useCallback)(async()=>{let u=c?.length??0;try{let d=await D(`/story?offset=${u}&limit=50`);h(v=>[...v??[],...d.entries]),w(d.total)}catch(d){Oe(U(d,"Could not read more memories."))}},[c]),jr=(0,m.useCallback)(async u=>{try{let d=await D("/agendas",{signal:u});Ta(d.villagers)}catch(d){if(u?.aborted)return;Ta(null),Oe(U(d,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(st!=="menu"||j!=="agendas"&&j!=="schedules"||!St?.some(d=>d.agenda?.personalizationPending&&!d.agenda.personalizationFailure))return;let u=window.setInterval(()=>{jr()},5e3);return()=>window.clearInterval(u)},[St,jr,j,st]);let y0=(0,m.useCallback)(async u=>{B(!0);try{let d=await D(`/agendas/${encodeURIComponent(u)}/regenerate`,{method:"POST"});Ta(d.villagers),Oe("")}catch(d){Oe(U(d,"That villager could not be asked again."))}finally{B(!1)}},[]),w0=(0,m.useCallback)(async(u,d)=>{B(!0);try{let v=await D(`/agendas/${encodeURIComponent(u)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:d})});Ta(v.villagers),Oe("")}catch(v){Oe(U(v,"Schedule use could not be changed."))}finally{B(!1)}},[]);(0,m.useEffect)(()=>{let u=new AbortController;return Ue({signal:u.signal}),()=>u.abort()},[Ue]),(0,m.useEffect)(()=>{let u=()=>{document.hidden||Ue({quiet:!0})},d=setInterval(()=>{document.hidden||Br.current||Ue({quiet:!0})},h5);return document.addEventListener("visibilitychange",u),()=>{clearInterval(d),document.removeEventListener("visibilitychange",u)}},[Ue]),(0,m.useEffect)(()=>{if(!Q?.id||Q.status==="closed"||st!=="room")return;wf.current!==Q.id?(wf.current=Q.id,qi.current=Date.parse(Q.lastActivityAt||Q.startedAt)||Date.now()):qi.current=Math.max(qi.current,Date.parse(Q.lastActivityAt||Q.startedAt)||0);let u=!1,d=L=>{u||(He(null),Ma(!1),pa([]),ta.current.clear(),il(L==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),fe("home"),Ue())},v=(L=!1)=>{D("/rooms/active").then(async({session:pe})=>{if(pe?.id===Q.id){L&&(await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:Q.id})}),qi.current=Date.now());return}let kt=await D(`/rooms/archive/${encodeURIComponent(Q.id)}`).catch(()=>null);d(kt?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(pe=>{let kt=fr(pe);kt&&d(kt)})},E=L=>{if(Date.now()-qi.current>=30*6e4){L.cancelable&&L.preventDefault(),L.stopImmediatePropagation(),v(!0);return}qi.current=Date.now(),!(Date.now()-yf.current<15e3)&&(yf.current=Date.now(),D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:Q.id})}).catch(pe=>{let kt=fr(pe);kt?d(kt):v()}))},N=()=>v();window.addEventListener("focus",N),document.addEventListener("visibilitychange",N);for(let L of["pointerdown","keydown","input","scroll"])window.addEventListener(L,E,!0);return()=>{u=!0,window.removeEventListener("focus",N),document.removeEventListener("visibilitychange",N);for(let L of["pointerdown","keydown","input","scroll"])window.removeEventListener(L,E,!0)}},[Q?.id,Q?.status,Q?.lastActivityAt,Q?.startedAt,st,Ue]),(0,m.useEffect)(()=>{let u=new AbortController;return D("/rooms/active",{signal:u.signal}).then(({session:d,debugDiscardEnabled:v})=>{f0(v),!(u.signal.aborted||!d)&&(He(d),cc("chat"),Ma(!0),fe("room"),d.status==="opening"&&(Xe(!0),D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:d.id}),signal:AbortSignal.timeout(3e4)}).then(({session:E})=>{u.signal.aborted||He(E)}).catch(async E=>{if(u.signal.aborted)return;let N=await Ow(d.id);u.signal.aborted||(N?He(N):ct(Rw(E)))}).finally(()=>{u.signal.aborted||Xe(!1)})))}).catch(()=>{}),()=>u.abort()},[]),(0,m.useEffect)(()=>{if(j!=="chatlogs"||!n?.isFounded)return;let u=new AbortController,d=new URLSearchParams;return H&&d.set("venueId",H),ae&&d.set("characterId",ae),d.set("offset",String(S)),d.set("limit","20"),f(null),D(`/rooms/archive?${d.toString()}`,{signal:u.signal}).then(({visits:v,total:E})=>{u.signal.aborted||(f(v),A(E),rt(""))}).catch(v=>{u.signal.aborted||rt(U(v,"Venue visits could not be read."))}),()=>u.abort()},[H,ae,S,b,j,n?.isFounded]);let yc=(0,m.useCallback)(async u=>{try{let d=await D(`/rooms/archive/${encodeURIComponent(u)}`);T(d.visit),rt("")}catch(d){rt(U(d,"That visit could not be read."))}},[]),x0=(0,m.useCallback)(async u=>{B(!0);try{await D(`/rooms/archive/${encodeURIComponent(u)}/retry-memory`,{method:"POST"}),await yc(u),p(d=>d+1),rt("")}catch(d){rt(U(d,"Memory filing is still pending."))}finally{B(!1)}},[yc]),Tf=(0,m.useCallback)(async u=>{if(window.confirm(u?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){B(!0);try{await D(u?`/rooms/archive/${encodeURIComponent(u)}`:"/rooms/archive",{method:"DELETE"}),T(null),V(0),p(d=>d+1),rt("")}catch(d){rt(U(d,"Visit transcripts could not be deleted."))}finally{B(!1)}}},[]);(0,m.useEffect)(()=>{if(!ha)return;let u=new AbortController;return Oa(u.signal),()=>u.abort()},[ha,Oa]);let Ef=n?n.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(Ef===null)return;let u=new AbortController;return(async()=>{try{let d=await D("/town-map",{signal:u.signal});Dr(d.image)}catch{u.signal.aborted||Dr("")}})(),()=>u.abort()},[Ef]);let $0=(0,m.useCallback)(async u=>{B(!0);try{o(await D("/villagers",{method:"POST",body:JSON.stringify({characterId:u})})),Oe(""),await Oa()}catch(d){Oe(U(d,"That character could not move in."))}finally{B(!1)}},[Oa]),N0=(0,m.useCallback)(async u=>{B(!0);try{o(await D(`/villagers/${encodeURIComponent(u)}`,{method:"DELETE"})),Oe(""),l&&await Oa()}catch(d){Oe(U(d,"That villager could not leave."))}finally{B(!1)}},[l,Oa]),S0=(0,m.useCallback)(async u=>{ut(u);try{let d=await D(`/villagers/${encodeURIComponent(u)}/refresh`);Ft(v=>({...v,[u]:d})),Oe("")}catch(d){Oe(U(d,"That villager's card could not be compared."))}finally{ut("")}},[]),T0=(0,m.useCallback)(async u=>{ut(u);try{o(await D(`/villagers/${encodeURIComponent(u)}/refresh`,{method:"POST"})),Ft(d=>{let v={...d};return delete v[u],v}),Oe("")}catch(d){Oe(U(d,"That villager's card could not be refreshed."))}finally{ut("")}},[]),We=(0,m.useCallback)(u=>{Te(u==="noticeboard"?"noticeboard":u==="general"?"general":u==="replyGuidance"||u==="story"||u==="chatlogs"||u==="agendas"||u==="schedules"?"debug":"village"),Y(""),Jt(!1),u==="villagers"&&Oa(),u==="village"&&Gi(),u==="village"&&Yi(),u==="story"&&Sf(),(u==="agendas"||u==="schedules")&&jr(),u==="village"&&(st!=="menu"||j!=="village")&&n&&(wr(n.settings.promptKnowledge),xr(n.settings.playerPersonaId),Fm(n.settings.setting),Pm(n.settings.selectedLorebookIds),pn(Sa(n.settings.venues).map(v=>({...v}))),Ar(n.settings.homeBuildingNames)),ei(u),fe("menu")},[jr,Oa,Yi,Gi,Sf,j,st,n]),wc=(0,m.useCallback)(()=>{gn(!1),Y(""),gt(null),Jt(!1),fe("home")},[]),E0=(0,m.useCallback)(async()=>{if(!(!Q||ba)){Xe(!0),ct(""),I(!1),He({...Q,status:"closing"});try{if(Q.id&&await D("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:Q.id})}),Li.current)return;Ma(!1),He(null),pa([]),ta.current.clear(),Ui(""),ll(""),fe("home"),Ue()}catch(u){if(Li.current)return;let d=fr(u);if(d){He(null),Ma(!1),pa([]),ta.current.clear(),il(d==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),fe("home"),Ue();return}ct(U(u,"You could not leave the venue.")),I(!0)}finally{Xe(!1)}}},[Ue,Q,ba]),k0=(0,m.useCallback)(async()=>{if(!Q?.id||Q.status!=="active"||ba||ol.current)return;let u=mc.current??mr();mc.current=u,Xe(!0),ct(""),I(!1);try{let d=await D("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:Q.id,submissionId:u}),signal:AbortSignal.timeout(3e5)});He(d.session),gc(!0);for(let v of d.recordEvents??[])ta.current.has(v.id)||(ta.current.add(v.id),pa(E=>[...E,v]));mc.current=null,Ue()}catch(d){ct(U(d,"The scene could not end yet.")),I(!0)}finally{Xe(!1)}},[Ue,Q,ba]),C0=(0,m.useCallback)(async()=>{if(!(!Q?.id||Li.current)){Li.current=!0,Xe(!0);try{await D("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:Q.id})}),Ma(!1),He(null),pa([]),ta.current.clear(),fe("home"),I(!1),Ue()}catch(u){ct(U(u,"The visit could not be left yet.")),Li.current=!1}finally{Xe(!1)}}},[Ue,Q]),A0=(0,m.useCallback)(async()=>{if(!(!Q?.id||!dc||ba)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){Xe(!0);try{await D("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:Q.id})}),He(null),Ma(!1),pa([]),ta.current.clear(),Ui(""),fe("home"),Ue()}catch(u){ct(U(u,"The debug discard failed."))}finally{Xe(!1)}}},[Q,dc,ba,Ue]),z0=(0,m.useCallback)(async()=>{let u=uc.trim();if(Q===null||!Q.id||fc||ba||ol.current||u.length===0)return;ol.current=!0;let d=Bi.current??mr();Bi.current=d;let v=Q;try{await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:Q.id})})}catch(N){ol.current=!1;let L=fr(N);L?(He(null),Ma(!1),pa([]),ta.current.clear(),il(L==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),fe("home"),Ue()):ct(U(N,"The visit could not be checked."));return}let E={speakerId:"",name:"",role:"user",content:u,at:new Date().toISOString()};Xe(!0),ct(""),Ui(""),He({...Q,lines:[...Q.lines,E]});try{let N=await D("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:Q.id,message:u,mode:Ur,targetId:Ur==="fulfill"?nl:"",submissionId:d}),signal:AbortSignal.timeout(3e5)});He(N.session),gc(N.session.status==="closed");for(let L of N.recordEvents??[])ta.current.has(L.id)||(ta.current.add(L.id),pa(pe=>[...pe,L]));nl&&!N.session.activeIds.includes(nl)&&qr(""),vf(N.verdict?.reason??""),Bi.current=null,ll(""),Ue()}catch(N){let L=fr(N);if(L){He(null),Ma(!1),pa([]),ta.current.clear(),il(L==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),fe("home"),Ue();return}He(v),Ui(u),ct(U(N,"That line could not be sent."))}finally{ol.current=!1,Xe(!1)}},[Ue,Q,ba,uc,fc,Ur,nl]),M0=(0,m.useCallback)(u=>(n?.villagers??[]).filter(d=>d.place?.id===u),[n]),xc=(0,m.useCallback)((u,d=!1)=>{gt(null),Jt(!1),Me(u.id),ft(d),J(null),fe("venue")},[]),$c=(0,m.useCallback)(async u=>{Xe(!0),ct(""),ll("");try{let d=await D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u}),signal:AbortSignal.timeout(3e4)});He(d.session)}catch(d){let v=await Ow(u);v?He(v):ct(Rw(d))}finally{Xe(!1)}},[]),O0=(0,m.useCallback)(async u=>{Xe(!0);try{let{session:d}=await D("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:u}),signal:AbortSignal.timeout(1e4)});He(d),ll(d.lines.length===0?"The greeting failed. You can start the conversation now.":""),ct("")}catch(d){ct(U(d,"The visit could not continue. Retry or leave the venue."))}finally{Xe(!1)}},[]),Ir=(0,m.useCallback)(async u=>{Li.current=!1,gt(null),Jt(!1),yn(null),Ui(""),gc(!1),ct(""),ll(""),pa([]),ta.current.clear(),Xe(!0),He({version:1,id:"",placeId:u.id,placeName:u.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Ma(!0),fe("room");try{let{session:d}=await D("/rooms",{method:"POST",body:JSON.stringify({venueId:u.id}),signal:AbortSignal.timeout(2e4)});He(d),cc("chat"),qr(""),vf(""),il(""),Ma(!0),d.status==="opening"&&await $c(d.id)}catch(d){ct(U(d,"That room could not be opened. Retry or leave the venue."))}finally{Xe(!1)}},[$c]),kf=(0,m.useCallback)(u=>{Jt(!1),gt(u.id),fe("home")},[]),Cf=(0,m.useCallback)(()=>{Me(null),ft(!1),J(null),gt(null),fe("home")},[]),R0=(0,m.useCallback)(async()=>{B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:Ka,playerPersonaId:_t,setting:Nr,selectedLorebookIds:Sr})}))}catch(u){Y(U(u,"Those settings could not be saved."))}finally{B(!1)}},[Ka,Sr,_t,Nr]),V0=(0,m.useCallback)(async u=>{B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({storyPace:u})}))}catch(d){Y(U(d,"That could not be saved."))}finally{B(!1)}},[]),Af=(0,m.useCallback)(async u=>{B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:u})})),p(d=>d+1)}catch(d){Y(U(d,"Visit retention could not be saved."))}finally{B(!1)}},[]),D0=(0,m.useCallback)(async()=>{if(!(n&&Sa(n.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){B(!0),Y("");try{let u=await D("/bootstrap",{method:"POST"});pn(u.places.map(d=>({id:Gu(),name:d.name,purpose:d.purpose,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(u){Y(U(u,"The village did not suggest any places."))}finally{B(!1)}}},[n]),ji=`${vn.trim()}\0${Pe.trim()}\0${JSON.stringify(zr)}\0${Ca.join(",")}`,_0=(0,m.useCallback)(async()=>{if(Pe.trim().length===0){we("Write the Setting and Theme before generating its map.");return}if(vn.trim().length===0){we("The DEBUG map layout prompt cannot be blank.");return}Po(!0),we("");try{let u=await D("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:vn===n?.settings.townMapLayoutPrompt?void 0:vn,setting:Pe,options:zr,selectedLorebookIds:Ca})}),d=await Lm(u.image);if(d.width!==u.width||d.height!==u.height)throw new Error("The generated map's reported dimensions do not match the image.");Fu(u.image),Pu("generate"),Wu(d),tc(ji),ai("generate")}catch(u){we(U(u,"The village map could not be generated."))}finally{Po(!1)}},[Ca,ji,vn,Pe,zr,n?.settings.townMapLayoutPrompt]),H0=(0,m.useCallback)(async()=>{we(""),B(!0);try{let u=await D("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:Pe,selectedLorebookIds:Ca})});kr(u.names)}catch(u){we(U(u,"The village could not suggest names for the public venue."))}finally{B(!1)}},[Ca,Pe]),U0=(0,m.useCallback)(async u=>{if(!u||!n)return;we("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(u.size>d){let v=E=>Math.round(E/1e5)/10;we(`That picture is ${v(u.size)} MB and a village map holds ${v(d)} MB. Choose a smaller copy.`);return}Po(!0);try{let v=await Iu(u),E=await Lm(v);Fu(v),Pu("upload"),Wu(E),tc(""),ai("upload")}catch(v){we(U(v,"That picture could not be used as the village map."))}finally{Po(!1)}},[n]),zf=(0,m.useCallback)(async u=>{if(!u||!n)return;Y("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(u.size>d){let v=E=>Math.round(E/1e5)/10;Y(`That picture is ${v(u.size)} MB and the village map holds ${v(d)} MB. Try a smaller copy.`);return}B(!0);try{let v=await Iu(u),E=await Lm(v);ic({image:v,size:E}),el(Yu("cover"))}catch(v){Y(U(v,"That picture could not be used as the town map."))}finally{B(!1)}},[n]),Mf=(0,m.useCallback)(async()=>{if(!n)return;let u=ga?ga.image:Vr;B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:u,townMapView:oc??n.settings.townMapView})})),Dr(u),ic(null),el(null),lc(!1)}catch(d){Y(U(d,"The town map could not be saved."))}finally{B(!1)}},[n,oc,Vr,ga]),Xr=(0,m.useCallback)(()=>{ic(null),el(null),lc(!1),Y("")},[]),Of=(0,m.useCallback)(async()=>{B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),Dr(""),Xr()}catch(u){Y(U(u,"The town map could not be taken down."))}finally{B(!1)}},[Xr]),q0=(0,m.useCallback)(async u=>{if(!za){_i(u),yn(null),Y("");try{o(await D("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:u})}))}catch(d){yn({id:u,text:U(d,"That place could not be drawn.")})}finally{_i("")}}},[za]),L0=(0,m.useCallback)(async(u,d)=>{if(!(!d||!n||za)){_i(u),yn(null),Y("");try{let v=N=>Math.round(N/1e5)/10;if(d.size>n.settings.maxVenueImageBytes){yn({id:u,text:`That picture is ${v(d.size)} MB and a place holds ${v(n.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let E=await Iu(d);o(await D("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:u,image:E})}))}catch(v){yn({id:u,text:U(v,"That picture could not be kept.")})}finally{_i("")}}},[za,n]),B0=(0,m.useCallback)(async u=>{if(!za){_i(u),yn(null),Y("");try{o(await D("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:u})}))}catch(d){yn({id:u,text:U(d,"That picture could not be taken away.")})}finally{_i("")}}},[za]),G0=n?.settings.maxPlaces??48,rl=n?.settings.setupMaxVillagerCount??_m,sl=(n?.settings.homeBuildings??[]).map(u=>({...u,name:n?.settings.homeBuildingNames?.[u.kind]??u.name})),Nc=n?.settings.defaultHomeBuilding??"",Rf=ju(sl,Nc).name.toLowerCase(),Y0=n&&!n.isFounded?1+rl:G0,Qr=Math.max(0,Y0-Sa(n?.settings.venues??[]).length),Vf=vr(n?.settings.venues??[]).length+Oi.length,ul=(0,m.useCallback)(u=>{let d=vr(u);Zo(d.map(v=>({id:v.id,description:v.description,x:v.x,y:v.y,building:v.building,isPlayerHome:v.isPlayerHome,characterId:v.characterId}))),Vi(d[0]?.id??null),Pt(!1)},[]),Df=(0,m.useCallback)(()=>{Y(""),n&&ul(n.settings.venues),Te("village"),ei("homes"),fe("menu")},[ul,n]),Zr=(0,m.useCallback)((u,d)=>{if(Y(""),ue.length>=Qr||ue.length>=1+rl)return;let v=Gu(),E=ue.length===0;Zo(N=>[...N,{id:v,description:Aw,x:u,y:d,building:Nc,isPlayerHome:E,characterId:null}]),Di(N=>({...N,[v]:Aw})),Vi(v)},[Nc,ue.length,Qr,rl]),j0=(0,m.useCallback)((u,d)=>{if(Qu){hf({x:u,y:d}),Ri(!1);return}Zr(u,d)},[Zr,Qu]),I0=(0,m.useCallback)((u,d)=>{Zr(u,d),Pt(!1),fe("menu")},[Zr]),Sc=(0,m.useCallback)((u,d)=>{n?.settings.venues.some(v=>v.id===u&&v.occupancy.residentCharacterId)||Zo(v=>v.map(E=>E.id===u?{...E,...d}:E))},[n]),Tc=(0,m.useCallback)(u=>{if(n?.settings.venues.some(d=>d.id===u&&d.occupancy.residentCharacterId)){Y("Move the resident to another venue before removing this home.");return}Zo(d=>{let v=d.filter(E=>E.id!==u);return v.length>0&&!v.some(E=>E.isPlayerHome)&&(v[0]={...v[0],isPlayerHome:!0,characterId:null}),v})},[n]),X0=(0,m.useCallback)(async()=>{if(n){if(ue.some(u=>!u.description.trim())){Y("Review a description for every home before saving.");return}B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({venues:Vw(n.settings.venues,ue),venueScope:"homes"})})),Pt(!1)}catch(u){Y(U(u,"Those homes could not be saved."))}finally{B(!1)}}},[ue,n]),Q0=async u=>{if(!n)return;let d=n.villagers.find(E=>E.characterId===u.characterId)?.name,v=u.isPlayerHome?`${Pn(n)}'s home`:d?`${d}'s home`:ju(sl,u.building).name;B(!0),Y("");try{let E=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:u.id,name:v,purpose:u.isPlayerHome?"Player residence":d?`Home of ${d}`:"Available home",homeKind:u.building}]})});Sc(u.id,{description:E.descriptions[u.id]??""})}catch(E){Y(U(E,"The home description could not be generated. You can write it by hand."))}finally{B(!1)}},cl=(0,m.useCallback)((u,d)=>{Y(""),we(""),ff(!1),Wo(!1),Rr(!1),gn(!1),Km(""),Ju(0),lf(u?"":d?.village.name??""),rf(u?"":d?.village.setting??""),sf(u?"":d?.settings.foundingReason??""),uf(u?"":d?.settings.foundingDetails??""),kr([]);let v=d?.settings.venues.find(N=>N.category.trim().toLowerCase()==="public-center");Di(u||!d?{}:{...Object.fromEntries(vr(d.settings.venues).map(N=>[N.id,N.description])),"setup-public-center":v?.description??""}),bn([]),Ar(u?{"small-home":"Small home","medium-home":"Medium home","large-home":"Large home","huge-home":"Huge home"}:d?.settings.homeBuildingNames??{}),Wm(u?[]:d?.settings.selectedLorebookIds??[]),df({...Ew}),ai(u?"generate":d?.settings.townMapImageSetAt?"existing":"none"),Fu(""),Pu(null),Wu(null),ec(d?.settings.townMapLayoutPrompt??""),tc(""),Po(!1),ac(u?"":d?.settings.venues.find(N=>N.category.trim().toLowerCase()==="public-center")?.name??"");let E=d?.settings.venues.find(N=>N.category.trim().toLowerCase()==="public-center");hf(u?null:pr(E)),xr(u?"":d?.settings.playerPersonaId??""),Gi(),Yi(),ul(u||!d?[]:d.settings.venues),fe("setup")},[Yi,Gi,ul]),_f=(0,m.useCallback)(u=>{if(Ae===0&&u>0){if(Aa.trim().length===0){we("Give the village a name before continuing.");return}if(_t.trim().length===0){we("Choose the Persona who lives in this village.");return}if(!Wt||Wt==="something-else"&&!Ja.trim()){we("Choose why the village is being founded, and describe Something else if selected.");return}}if(Ae===1&&u>1&&nc.length>0){we(nc);return}if(Ae===1&&u>1&&mf){Wo(!0);return}if(Ae===2&&u>2){if(Pe.trim().length===0){we("Write the Setting and Theme before continuing.");return}if(ge!=="none"&&!ni){we(ge==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(ge==="generate"&&Or!==ji){we("The setting, map options, or DEBUG prompt changed. Generate the map again before continuing.");return}}if(Ae===3&&u>3){let d=ue.filter(v=>!v.isPlayerHome).length;if(!ue.some(v=>v.isPlayerHome)||d<Cw||d>_m||fa.trim().length===0||ea===null){we("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}}Wo(!1),we(""),Ae===4&&u<4&&bn([]),Ju(u),u===0&&(Gi(),Yi()),u===3&&Oa(),Pt(u===3),Ri(!1)},[nc,ue,mf,Oa,Gi,Yi,_t,fa,ea,Or,ji,ge,ni,Aa,Wt,Ja,Pe,Ae]),Z0=(0,m.useCallback)(()=>{Wo(!1),we(""),Ju(2),Pt(!1),Ri(!1)},[]),K0=(0,m.useCallback)(()=>{Wo(!1),we("")},[]),Ii=(0,m.useMemo)(()=>[...ue.map(u=>{let d=u.isPlayerHome?$r?.find(v=>v.id===_t)?.name??"Player":l?.find(v=>v.id===u.characterId)?.name??"Villager";return{id:u.id,name:`${d}'s home`,purpose:`Home of ${d}`,homeKind:u.building}}),{id:"setup-public-center",name:fa.trim(),purpose:"A public meeting place",homeKind:null}],[ue,$r,_t,l,fa]),J0=(0,m.useCallback)(async()=>{we(""),B(!0);try{let u=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({setting:Pe,foundingReason:Wt,foundingDetails:Ja,selectedLorebookIds:Ca,venues:Ii.filter(d=>d.id==="setup-public-center")})});Di(d=>({...d,...u.descriptions})),bn(d=>d.filter(v=>v!=="setup-public-center"))}catch(u){we(U(u,"Descriptions could not be generated. You can write them by hand."))}finally{B(!1)}},[Ii,Ja,Wt,Ca,Pe]),Hf=(0,m.useCallback)(()=>{if(Aa.trim().length===0)return"Give the village a name.";if(_t.trim().length===0)return"Choose the Persona who lives in this village.";if(!Wt||Wt==="something-else"&&!Ja.trim())return"Choose why the village is being founded.";if(Pe.trim().length===0)return"Write the Setting and Theme.";if(ge!=="none"&&!ni)return"Choose, generate, or upload the village map.";if(ge==="generate"&&Or!==ji)return"Generate the map again so it matches the current setting, options, and prompt.";let u=ue.filter(v=>!v.isPlayerHome);if(u.length<Cw||u.length>_m)return"Place one to three homes for initial villagers.";if(!ue.some(v=>v.isPlayerHome))return"One of the homes has to be yours.";let d=u.map(v=>v.characterId).filter(v=>v!==null);return d.length!==u.length?"Choose who lives in each villager home.":new Set(d).size!==d.length?"A villager can only live in one house.":fa.trim().length===0?"Give the public center a name.":ea===null?"Place the public center on the map.":!n?.isFounded&&Ii.some(v=>!ti[v.id]?.trim()||!Cr.includes(v.id))?"Approve a description for every founding place.":""},[ue,_t,fa,ea,Or,ji,ge,ni,Aa,Wt,Ja,Pe,Ii,ti,Cr,n?.isFounded]),F0=(0,m.useCallback)(async()=>{let u=Hf();if(u){we(u);return}B(!0),we("");try{let d=n?.settings.venues.find(E=>E.category.trim().toLowerCase()==="public-center"),v={id:d?.id??Gu(),name:fa.trim(),purpose:d?.purpose??"",description:ti["setup-public-center"]??d?.description??"",category:"public-center",presentation:{image:d?.presentation.image??null,x:ea.x,y:ea.y},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:d?.capabilities??[],state:d?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}};o(await D("/setup",{method:"POST",body:JSON.stringify({name:Aa.trim(),setting:Pe.trim(),foundingReason:Wt,foundingDetails:Ja.trim(),selectedLorebookIds:Ca,playerPersonaId:_t,townMapImage:ni??"",townMapView:ge==="existing"?Hi:Yu("cover"),homeBuildingNames:Jo,venues:[...Vw(n?.settings.venues??[],ue).filter(E=>E.id!==v.id).map(E=>({...E,description:ti[E.id]??E.description})),v]})})),Pt(!1),fe("home")}catch(d){we(U(d,"The village could not be founded."))}finally{B(!1)}},[ue,_t,fa,ea,Hi,Hf,ge,ni,Aa,Wt,Ja,Ca,Pe,ti,Jo,n]),P0=(0,m.useCallback)(async()=>{B(!0),Y("");try{let u=await D("/setup/reset",{method:"POST"});o(u),s(null),cl(!0,u)}catch(u){Y(U(u,"The village could not be reset."))}finally{B(!1),Rr(!1)}},[cl]),Uf=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!n||Uf.current||(Uf.current=!0,n.isFounded||cl(!1,n))},[cl,n]);let W0=(0,m.useCallback)(()=>{pn(u=>[...u,{id:Gu(),name:"",purpose:"",description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}])},[]),Xi=(0,m.useCallback)((u,d)=>{pn(v=>v.map(E=>E.id===u?{...E,...d}:E))},[]),e1=(0,m.useCallback)(async u=>{B(!0),Y("");try{let d=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:u.id,name:u.name,purpose:u.purpose}]})});Xi(u.id,{description:d.descriptions[u.id]??""})}catch(d){Y(U(d,"The description draft could not be generated."))}finally{B(!1)}},[Xi]),t1=(0,m.useCallback)(async u=>{B(!0),Y("");try{let d=n?.settings.venues.some(N=>N.id===u.id)??!1,v=await D(d?`/locations/venue/${encodeURIComponent(u.id)}`:"/locations/venue",{method:d?"PUT":"POST",body:JSON.stringify({name:u.name,purpose:u.purpose,category:u.category,description:u.description})}),E=Sa(v.settings.venues).find(N=>d?N.id===u.id:N.name.toLowerCase()===u.name.trim().toLowerCase());o(v),pn(N=>{let L=N.map(pe=>pe.id===u.id&&E?E:pe);return[...L,...Sa(v.settings.venues).filter(pe=>!L.some(kt=>kt.id===pe.id))]})}catch(d){Y(U(d,"That place could not be saved."))}finally{B(!1)}},[n]),a1=(0,m.useCallback)(async u=>{let d=n?.settings.venues.find(v=>v.id===u);if(!d){pn(v=>v.filter(E=>E.id!==u));return}B(!0),Y("");try{let v=await D(`/locations/venue/${encodeURIComponent(u)}/dependencies`);if(v.roomPresent){Y("End the active visit before deleting this venue.");return}let E=v.residentCharacterIds.length+v.pendingResidenceCharacterIds.length,N=E||v.remapCount||v.eventCount?`This place is referenced by ${E} residents, ${v.remapCount} schedule moves, and ${v.eventCount} events. Delete it?`:`Delete ${d.name}?`;if(!window.confirm(N))return;let L=await D(`/locations/venue/${encodeURIComponent(u)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(L),pn(pe=>pe.filter(kt=>kt.id!==u))}catch(v){Y(U(v,"That place could not be removed."))}finally{B(!1)}},[n]),qf=(0,m.useCallback)(async(u,d)=>{B(!0),Y("");try{let v=ie[u.id]??u.venueDraft,E=await D(`/venue-requests/${encodeURIComponent(u.id)}/${d?"approve":"deny"}`,{method:"POST",body:d?JSON.stringify(v):void 0});if(o(E),d){let N=new Set(Oi.map(L=>L.id));pn(L=>[...L,...Sa(E.settings.venues).filter(pe=>!N.has(pe.id))])}pt(N=>{let L={...N};return delete L[u.id],L})}catch(v){Y(U(v,d?"That venue could not be approved.":"That request could not be denied."))}finally{B(!1)}},[ie,Oi]),n1=(0,m.useCallback)(u=>{let d=bc.current,v=d?.selectionStart??Ka.length,E=d?.selectionEnd??v;vc.current=v+u.length,wr(`${Ka.slice(0,v)}${u}${Ka.slice(E)}`)},[Ka]),Lf=(0,m.useCallback)(async()=>{let u=Er.trim();if(u.length!==0){B(!0),Y("");try{o(await D("/noticeboard",{method:"POST",body:JSON.stringify({notice:u})})),of("")}catch(d){Y(U(d,"That notice could not be pinned up."))}finally{B(!1)}}},[Er]),i1=(0,m.useCallback)(async u=>{B(!0),Y("");try{o(await D(`/noticeboard/${u}`,{method:"DELETE"}))}catch(d){Y(U(d,"That notice could not be taken down."))}finally{B(!1)}},[]),Kr=Qo.trim().toLowerCase(),Ec=(l??[]).filter(u=>Kr.length===0||u.name.toLowerCase().includes(Kr)||u.comment.toLowerCase().includes(Kr)||u.tags.some(d=>d.toLowerCase().includes(Kr))),Bf=[...(n?.villagers??[]).map(u=>u.characterId),...ha?Ec.map(u=>u.id):[]].join(`
`),Gf=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let u=Bf.split(`
`).filter(v=>v.length>0&&!Gf.current.has(v));if(u.length===0)return;for(let v of u)Gf.current.add(v);let d=new AbortController;return(async()=>{try{let v=await o5(u,d.signal);d.signal.aborted||Ee(E=>({...E,...v}))}catch{}})(),()=>d.abort()},[Bf]);let kc=n?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(Xu(null),kc.length===0)return;let u=new AbortController;return(async()=>{try{let d=await l5(kc,u.signal);u.signal.aborted||Xu(d)}catch{}})(),()=>u.abort()},[kc]);let ii=(0,m.useCallback)(u=>u?l?.find(d=>d.id===u)?.name??n?.villagers.find(d=>d.characterId===u)?.name??"":"",[l,n]),o1=(()=>{let u=n?.settings.venues??[],d=[],v=new Map;for(let E of n?.villagers??[]){let N=E.place?.id;if(!N)continue;let L=v.get(N);L?L.push(E):v.set(N,[E])}for(let E of u){let N=pr(E);if(!N)continue;let L=E.occupancy.residentCharacterId,pe=yr(E),kt=E.occupancy.playerHome?Pn(n):ii(L);d.push({id:E.id,x:N.x,y:N.y,text:pe?Hw(kt):E.name,image:E.presentation.image?.url??null,tone:pe?qm({isPlayerHome:E.occupancy.playerHome,occupant:L}):"venue",doors:ka===E.id?[{label:"View venue",onSelect:()=>xc(E,!0)},{label:"Visit",onSelect:()=>{Ir(E)}}]:void 0,onSelect:()=>kf(E)}),(v.get(E.id)??[]).forEach((Jr,r1)=>{d.push({id:`villager:${Jr.characterId}`,x:N.x,y:N.y,dy:w5*(r1+1),text:Jr.name,tone:"resident",kind:"person"})})}return d})(),l1=[...ue.flatMap(u=>{if(u.x===null||u.y===null)return[];let d=u.isPlayerHome?Pn(n):ii(u.characterId);return[{id:u.id,x:u.x,y:u.y,text:Hw(d),image:n?.settings.venues.find(v=>v.id===u.id)?.presentation.image?.url??null,tone:qm({isPlayerHome:u.isPlayerHome,occupant:d}),onSelect:()=>Vi(u.id),onRemove:()=>Tc(u.id)}]}),...ea?[{id:"setup-public-center",x:ea.x,y:ea.y,text:fa.trim()||"Public center",image:n?.settings.venues.find(u=>u.id==="setup-public-center")?.presentation.image?.url??null,tone:"place",onSelect:()=>{Pt(!1),Ri(!0)}}]:[]];if(st==="room")return(0,r.jsx)("div",{className:`${i}-root ${i}-room-screen`,children:Q?(0,r.jsx)(C5,{room:Q,picture:e5(n?.settings.venues??[],Q.placeId),draft:uc,mode:Ur,targetId:nl,busy:ba,error:g0,greetingNotice:p0,ruling:h0,open:d0,ended:fc,playerName:Pn(n),playerPortrait:bt??void 0,portraits:P,sprites:Object.fromEntries((n?.villagers??[]).map(u=>[u.characterId,u.sprite])),onDraft:u=>{Bi.current=null,Ui(u)},onMode:u=>{Bi.current=null,cc(u),u!=="fulfill"&&qr("")},onTarget:u=>{Bi.current=null,qr(u)},onSend:()=>{z0()},onLeave:()=>{k0()},onEnd:()=>{E0()},notices:m0,onDismissNotice:u=>pa(d=>d.filter(v=>v.id!==u)),debugDiscardEnabled:dc,onDebugDiscard:()=>{A0()},onLeavePending:()=>{C0()},endFailed:M,onRetryGreeting:()=>{if(Q.id)$c(Q.id);else{let u=n?.settings.venues.find(d=>d.id===Q.placeId);u&&Ir(u)}},onContinueWithoutGreeting:()=>{Q.id&&O0(Q.id)}}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:wc,children:"Back to village"})});if(st==="venue"){let u=(n?.settings.venues??[]).find(N=>N.id===Zt)??null;if(!n||!u)return(0,r.jsx)("div",{className:`${i}-root`,children:(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Whatever this screen was standing in is not in the village now."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Cf,children:"Back to the map"})})]})});let d=M0(u.id),v=u.occupancy.homeKind?ju(sl,u.occupancy.homeKind).name:"",E=u.occupancy.playerHome?Pn(n):ii(u.occupancy.residentCharacterId);return(0,r.jsxs)("div",{className:`${i}-root`,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:Uw(u,E)}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:d.length===0?"Nobody is here at this hour.":d.map(N=>N.name).join(", ")})]}),(0,r.jsxs)("div",{className:`${i}-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":Kt,onClick:()=>ft(N=>!N),children:"About"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Tt(""),J(N=>N?null:structuredClone(u))},children:G?"Close editor":"Edit room"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Cf,children:"Back to map"})]})]}),(0,r.jsxs)("div",{className:`${i}-venue`,children:[u.presentation.image?(0,r.jsx)("img",{className:`${i}-venue-picture`,src:u.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-venue-picture`,"data-empty":"true","aria-hidden":"true",children:v.length>0?`A ${v.toLowerCase()}, not drawn yet`:"Not drawn yet"}),(0,r.jsxs)("div",{className:`${i}-venue-body`,children:[(0,r.jsx)("p",{className:`${i}-venue-beat`,children:u.description||u.purpose||`A place in ${n.village.name||"the village"}.`}),u.description&&u.purpose?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Venue Purpose: ",u.purpose]}):null,u.state.condition?(0,r.jsx)("p",{className:`${i}-empty`,children:u.state.condition}):null,u.state.upgrades.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Approved upgrades: ",u.state.upgrades.join(", ")]}):null,(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Furniture and items"}),u.state.furniture.length?(0,r.jsx)("ul",{className:`${i}-roster`,children:u.state.furniture.map((N,L)=>(0,r.jsx)("li",{className:`${i}-roster-row`,children:N},`${L}-${N}`))}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No items listed."})]}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("span",{className:`${i}-label`,children:["Venue features (",u.state.features?.length??0,"/5)"]}),(u.state.features?.length??0)>0?(0,r.jsx)("ul",{className:`${i}-roster`,children:u.state.features?.map(N=>(0,r.jsxs)("li",{className:`${i}-roster-row`,children:[(0,r.jsx)("strong",{children:N.text}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${N.locked?"Locked":"Unlocked"} \xB7 Added by ${n.villagers.find(L=>L.characterId===N.sourceCharacterId)?.name??"player"}${N.updatedAt?` \xB7 Updated ${new Date(N.updatedAt).toLocaleDateString()}`:""}`})]},N.id))}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No venue features yet."})]}),G?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:["Edit ",Uw(u,E)]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:G.name,maxLength:n.settings.maxVenueNameLength,onChange:N=>J({...G,name:N.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Venue Purpose",(0,r.jsx)("input",{className:`${i}-notice-input`,value:G.purpose,maxLength:n.settings.maxVenueNoteLength,onChange:N=>J({...G,purpose:N.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Category",(0,r.jsx)("input",{className:`${i}-notice-input`,value:G.category,maxLength:n.settings.maxVenueNoteLength,onChange:N=>J({...G,category:N.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Room description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:G.description,maxLength:1e3,onChange:N=>J({...G,description:N.target.value})})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:ma,onClick:()=>{Ie(!0),Tt(""),D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:u.id,name:G.name,purpose:G.purpose,homeKind:u.occupancy.homeKind}]})}).then(N=>J(L=>L?{...L,description:N.descriptions[u.id]??L.description}:null)).catch(N=>Tt(U(N,"A description draft could not be generated."))).finally(()=>Ie(!1))},children:"Generate description draft"}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition",(0,r.jsx)("input",{className:`${i}-notice-input`,value:G.state.condition,maxLength:n.settings.maxVenueNoteLength,onChange:N=>J({...G,state:{...G.state,condition:N.target.value}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Furniture and items (one per line)",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:G.state.furniture.join(`
`),onChange:N=>J({...G,state:{...G.state,furniture:N.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Public facts (one per line)",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:G.state.publicFacts.join(`
`),onChange:N=>J({...G,state:{...G.state,publicFacts:N.target.value.split(`
`)}})})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Structural upgrades come from villager requests and player approval."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:ma||!yr(G)&&!G.name.trim()||!G.description.trim(),onClick:()=>{Ie(!0),Tt(""),D(`/locations/venue/${encodeURIComponent(u.id)}`,{method:"PUT",body:JSON.stringify({name:G.name,purpose:G.purpose,category:G.category,description:G.description,state:{condition:G.state.condition,furniture:G.state.furniture.map(N=>N.trim()).filter(Boolean),publicFacts:G.state.publicFacts.map(N=>N.trim()).filter(Boolean)}})}).then(N=>{o(N),J(structuredClone(N.settings.venues.find(L=>L.id===u.id)??u))}).catch(N=>Tt(U(N,"The room could not be saved."))).finally(()=>Ie(!1))},children:"Approve and save room details"}),X?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:X}):null]}):null,G?(0,r.jsx)(A5,{place:u,residents:n.villagers,onSave:async(N,L)=>{let pe=await D(`/locations/venue/${encodeURIComponent(u.id)}`,{method:"PUT",body:JSON.stringify({workerIds:L,state:{features:N}})});o(pe)},onPromoteItem:async N=>{if((u.state.features?.length??0)>=5)throw new Error("This venue already has five features.");let L=u.state.furniture[N];if(!L)throw new Error("Choose an item to promote.");let pe=await D(`/locations/venue/${encodeURIComponent(u.id)}`,{method:"PUT",body:JSON.stringify({state:{furniture:u.state.furniture.filter((kt,Jr)=>Jr!==N),features:[...u.state.features??[],{id:mr(),text:L,sourceCharacterId:"",locked:!1,updatedAt:""}]}})});o(pe)}},`${u.id}:${u.state.updatedAt}`):null,G&&u.occupancy.residentCharacterId?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Resident move"}),(0,r.jsx)("p",{className:`${i}-hint`,children:`${ii(u.occupancy.residentCharacterId)} lives here. You may ask them to move; they can accept or decline in conversation. Their home stays here until an approved move finishes.`}),n.residences.find(N=>N.characterId===u.occupancy.residentCharacterId&&N.status!=="current")?(0,r.jsx)("p",{className:`${i}-hint`,children:(()=>{let N=n.residences.find(pe=>pe.characterId===u.occupancy.residentCharacterId&&pe.status!=="current"),L=n.settings.venues.find(pe=>pe.id===N.proposedVenueId)?.name??"another venue";return N.status==="moving"?`Moving to ${L}; due ${new Date(N.completesAt??"").toLocaleString()}.`:`Move to ${L} requested by ${N.requestedBy??"villager"}; awaiting approval.`})()}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{value:Ea,onChange:N=>Fe(N.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose an available venue"}),n.settings.venues.filter(N=>N.id!==u.id&&!N.occupancy.playerHome&&!N.occupancy.residentCharacterId).map(N=>(0,r.jsx)("option",{value:N.id,children:N.name||"Empty home"},N.id))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!Ea||ma,onClick:()=>{Ie(!0),Tt(""),D("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:u.occupancy.residentCharacterId,venueId:Ea})}).then(o).catch(N=>Tt(U(N,"The move could not be requested."))).finally(()=>Ie(!1))},children:"Ask resident to move"})]})]}):null,(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-label`,children:"DEBUG: Active traces"}),(u.state.traces?.length??0)>0?(0,r.jsx)("ul",{className:`${i}-roster`,children:u.state.traces?.map(N=>(0,r.jsxs)("li",{className:`${i}-roster-row`,children:[N.text," ",(0,r.jsx)("span",{className:`${i}-hint`,children:`(${N.kind}, ${N.id})`})]},N.id))}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No active traces."})]}),u.state.publicFacts.length?(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-label`,children:"About this place"}),(0,r.jsx)("ul",{className:`${i}-roster`,children:u.state.publicFacts.map((N,L)=>(0,r.jsx)("li",{className:`${i}-roster-row`,children:N},`${L}-${N}`))})]}):null,G?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:za===u.id||R,onClick:()=>{q0(u.id)},children:u.presentation.image?"Draw it again":"Draw a picture"}),(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*",disabled:za===u.id||R,"aria-label":`Choose a picture for ${u.name}`,onChange:N=>{let L=N.target.files?.[0];N.target.value="",L0(u.id,L)}}),u.presentation.image?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:za===u.id||R,onClick:()=>{B0(u.id)},children:"Take picture away"}):null]})]}):null,za===u.id?(0,r.jsx)("p",{className:`${i}-hint`,children:"Working on it\u2026 a drawing can take a minute."}):null,rc&&rc.id===u.id?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":"warn",children:rc.text}):null,Kt?(0,r.jsxs)("div",{className:`${i}-venue-about`,children:[u.purpose.length>0?(0,r.jsx)("p",{className:`${i}-empty`,children:u.purpose}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has written anything about this place."}),v.length>0?(0,r.jsxs)("p",{className:`${i}-hint`,children:["What stands here is ",v.toLowerCase(),"."]}):null,(0,r.jsx)("p",{className:`${i}-hint`,children:n.village.setting.length>0?n.village.setting:"This village has not said what it is like yet, so this is everything it knows."})]}):null,(0,r.jsxs)("div",{className:`${i}-venue-here`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Here right now"}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:ba,onClick:()=>{Ir(u)},title:`Enter the shared space with ${d.length} ${d.length===1?"villager":"villagers"} present. They may speak or continue what they are doing.`,children:ba?"Opening visit\u2026":"Visit"})}),d.length>0?(0,r.jsx)("ul",{className:`${i}-roster`,children:d.map(N=>(0,r.jsx)("li",{className:`${i}-roster-row`,children:(0,r.jsx)("span",{className:`${i}-villager-name`,children:N.name})},N.characterId))}):null]})]})]})]})}if(st==="menu")return(0,r.jsxs)("div",{className:`${i}-root ${i}-sectioned-menu`,"data-section":z,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[z]}),t?null:(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:z!=="index"?()=>Te("index"):wc,children:z!=="index"?"Back to menu":"Back to the village"})})]}),al?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:al}):null,(0,r.jsx)("nav",{className:`${i}-mobile-menu-nav`,"aria-label":"Village menu",children:z==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>We("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>We("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>We("story"),children:"DEBUG Settings"})]}):z==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([u,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":j===u,onClick:()=>u==="homes"?Df():We(u),children:d},u))}):z==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([u,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":j===u,onClick:()=>We(u),children:d},u)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||R||Gr,onClick:()=>{Nf()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${i}-status`,children:Xw}),Lr?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:Lr}):null]}):null}),(0,r.jsxs)("nav",{className:`${i}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="villagers","data-active":j==="villagers"?"true":"false",disabled:!n||R,onClick:()=>We("villagers"),children:`Villagers (${n?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="noticeboard","data-active":j==="noticeboard"?"true":"false",disabled:!n||R,onClick:()=>We("noticeboard"),children:`Noticeboard (${n?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="venueRequests","data-active":j==="venueRequests"?"true":"false",disabled:!n||R,onClick:()=>We("venueRequests"),children:`Venue Requests (${(n?.venueRequests?.length??0)+(n?.upgradeRequests?.length??0)+(n?.residences?.filter(u=>u.status==="pending"&&u.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="homes","data-active":j==="homes"?"true":"false",disabled:!n||R,onClick:Df,children:`Homes (${vr(n?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="map","data-active":j==="map"?"true":"false",disabled:!n||R,onClick:()=>We("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="village","data-active":j==="village"?"true":"false",onClick:()=>We("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${i}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="general","data-active":j==="general"?"true":"false",onClick:()=>We("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="replyGuidance","data-active":j==="replyGuidance"?"true":"false",disabled:!n||R,onClick:()=>We("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="story","data-active":j==="story"?"true":"false",disabled:!n||R,onClick:()=>We("story"),children:`DEBUG: Village Story (${c?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="chatlogs","data-active":j==="chatlogs"?"true":"false",disabled:!n||R,onClick:()=>We("chatlogs"),children:`DEBUG: Venue Visits (${$?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="agendas","data-active":j==="agendas"?"true":"false",disabled:!n||R,onClick:()=>We("agendas"),children:`DEBUG: Villager Wishes (${St?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="schedules","data-active":j==="schedules"?"true":"false",disabled:!n||R,onClick:()=>We("schedules"),children:`Villager Agendas (${St?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||R||Gr,onClick:()=>{Nf()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${i}-status`,children:Xw}),Lr?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:Lr}):null]})]}),j==="general"?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General settings"}),(0,r.jsx)(jw,{}),n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${i}-story-pace`,value:n.settings.storyPace,disabled:R,onChange:u=>{V0(u.target.value)},children:n.settings.storyPaces.map(u=>(0,r.jsx)("option",{value:u,children:u.charAt(0).toUpperCase()+u.slice(1)},u))}),(0,r.jsx)("span",{className:`${i}-hint`,children:u5(n.settings.storyPace)})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${i}-visit-retention`,value:n.settings.visitRetention.mode,disabled:R,onChange:u=>{let d=u.target.value;Af({mode:d,value:d==="count"?100:d==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),n.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":n.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:n.settings.visitRetention.mode==="count"?1:30,max:n.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:n.settings.visitRetention.value,onBlur:u=>{let d=Number(u.target.value);d!==n.settings.visitRetention.value&&Af({mode:n.settings.visitRetention.mode,value:d})}},`${n.settings.visitRetention.mode}:${n.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Setting the village up again is the same three questions you answered when you arrived, over the village as it stands now."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!n,onClick:()=>cl(!1,n),children:"Run setup again"}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${i}-row`,children:s0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-danger`,disabled:R,onClick:()=>{P0()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>Rr(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!n,onClick:()=>Rr(!0),children:"Reset the village and start over"})})]}),vt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:vt}):null]}):j==="village"?(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[n?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(N5,{}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Home tier names"}),["small-home","medium-home","large-home","huge-home"].map(u=>(0,r.jsxs)("label",{className:`${i}-label`,children:[u.replace("-"," "),(0,r.jsx)("input",{className:`${i}-notice-input`,value:Jo[u]??"",maxLength:60,onChange:d=>Ar(v=>({...v,[u]:d.target.value}))})]},u)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{B(!0),Y(""),D("/settings",{method:"PATCH",body:JSON.stringify({homeBuildingNames:Jo})}).then(o).catch(u=>Y(U(u,"Home tier names could not be saved."))).finally(()=>B(!1))},children:"Save home tier names"})]}),t?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Map background image"}),_r?(0,r.jsx)("img",{className:`${i}-mobile-map-preview`,src:_r,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:R,"aria-label":"Choose a town map picture",onChange:u=>{let d=u.target.files?.[0];u.target.value="",zf(d)}}),ga?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Mf()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:Xr,children:"Cancel"})]}):n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Of()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setting`,className:`${i}-textarea ${i}-off`,value:Nr,maxLength:n.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:u=>Fm(u.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Read-only here. What this place is like is the wizard's first question, asked beside where the houses stand so the village is described once rather than twice; run it again to change this. What is written still reaches every villager in the meantime."})]}),(0,r.jsx)(Bw,{books:ef,error:tf,selected:Sr,onChange:Pm,disabled:R}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Places in the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{D0()},disabled:R||!n,children:Oi.length>0?"Replace with suggestions":"Suggest places"})]}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a character's card says they ",(0,r.jsx)("em",{children:"do"})," gets translated into one of these places \u2014 the card supplies the verb, the village supplies the noun. Renaming or reworking a place is safe: nothing about a villager is stored here."]}),(0,r.jsxs)("div",{children:[Oi.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet. Suggest some, or add the first one by hand."}):(0,r.jsx)("div",{className:`${i}-notice-add`,children:Oi.map((u,d)=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:u.name,maxLength:n.settings.maxVenueNameLength,placeholder:"Name of the place","aria-label":`Name of place ${d+1}`,onChange:v=>Xi(u.id,{name:v.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:u.purpose,maxLength:n.settings.maxVenueNoteLength,placeholder:"What happens there (optional)",title:"Venue Purpose","aria-label":`What happens at place ${d+1}`,onChange:v=>Xi(u.id,{purpose:v.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:u.category,maxLength:n.settings.maxVenueNoteLength,placeholder:"Category (optional)","aria-label":`Category of place ${d+1}`,onChange:v=>Xi(u.id,{category:v.target.value})}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:u.description,maxLength:1e3,placeholder:"Approved room description","aria-label":`Description of ${u.name||`place ${d+1}`}`,onChange:v=>Xi(u.id,{description:v.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!u.name.trim(),onClick:()=>{e1(u)},children:"Generate description draft"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{t1(u)},disabled:R||!u.name.trim()||!u.description.trim(),"aria-label":`Save place: ${u.name||d+1}`,children:"Save place"}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{a1(u.id)},disabled:R,"aria-label":`Remove place: ${u.name||d+1}`,children:"\xD7"})]},u.id))}),Vf<n.settings.maxPlaces?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>W0(),style:{marginTop:".5rem"},children:`Add a place (${Vf}/${n.settings.maxPlaces})`}):null]}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Nothing here is stored against a villager. A card says what somebody ",(0,r.jsx)("em",{children:"does"}),"; this is the list of places the village offers them to do it in. Open any saved place from ",(0,r.jsx)("strong",{children:"Places"})," on the village screen, even if it has no map pin yet."]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${i}-knowledge`,ref:bc,className:`${i}-preset`,value:Ka,maxLength:n.settings.promptBoxMaxLength,spellCheck:!1,onChange:u=>wr(u.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${i}-macros`,children:n.settings.macros.map(u=>(0,r.jsx)("button",{type:"button",className:`${i}-macro`,title:`${u.label} \u2014 ${u.help}`,onClick:()=>n1(u.token),children:u.token},u.token))}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)(Lw,{idPrefix:"settings",personas:$r,draft:_t,onDraft:xr,storedId:n.settings.playerPersonaId,storedName:n.settings.playerPersonaName,storedMissing:n.settings.playerPersonaMissing,disabled:R}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{R0()},disabled:R,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{wr(n.settings.defaultPromptKnowledge)},disabled:R,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${i}-hint`,children:Ka===n.settings.promptKnowledge&&_t===n.settings.playerPersonaId&&Nr===n.settings.setting&&JSON.stringify(Sr)===JSON.stringify(n.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,vt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:vt}):null]}):(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[j==="villagers"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villagers"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>gn(u=>!u),disabled:R,children:ha?"Close the list":"Add a villager"})}),ha?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("input",{className:`${i}-search`,type:"search",value:Qo,onChange:u=>Km(u.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),l===null?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):Ec.length===0?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${i}-picker-list`,children:Ec.map(u=>(0,r.jsxs)("div",{className:`${i}-picker-item`,"data-resident":u.inVillage?"true":"false",children:[(0,r.jsx)(Xo,{portrait:P[u.id],name:u.name,className:`${i}-avatar`}),(0,r.jsxs)("div",{className:`${i}-picker-text`,children:[(0,r.jsx)("div",{className:`${i}-villager-name`,children:u.name}),(0,r.jsx)("div",{className:`${i}-villager-role`,children:u.comment||u.tags.slice(0,3).join(" \xB7 ")}),u.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:u.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{$0(u.id)},disabled:R||u.inVillage,children:u.inVillage?"Lives here":"Move in"})]},u.id))})]}):null,n&&n.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-villagers`,children:n.villagers.map(u=>(0,r.jsx)(T5,{villager:u,portrait:P[u.characterId],selected:!1,onSelect:!u.place||Q!==null?void 0:()=>{let d=n.settings.venues.find(v=>v.id===u.place?.id);d&&kf(d)}},u.characterId))}),(0,r.jsx)("div",{className:`${i}-roster`,children:n.villagers.map(u=>(0,r.jsxs)("div",{className:`${i}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-villager-name`,children:u.name}),u.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,De[u.characterId]?(0,r.jsx)("div",{className:`${i}-tile-summary`,children:De[u.characterId].changed?`New card: ${De[u.characterId].proposed?.name??"unavailable"}`:De[u.characterId].sourceAvailable?`Snapshot revision ${De[u.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>_(k===u.characterId?null:u.characterId),children:k===u.characterId?"Close sprites":"Sprites"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{S0(u.characterId)},disabled:R||Dt.length>0,children:"Compare card"}),De[u.characterId]?.changed&&De[u.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{T0(u.characterId)},disabled:R||Dt.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{N0(u.characterId)},disabled:R||Dt.length>0,children:"Move out"})]})]},u.characterId))}),n.villagers.find(u=>u.characterId===k)?(0,r.jsx)(k5,{villager:n.villagers.find(u=>u.characterId===k),onSaved:o}):null]}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):null,j==="noticeboard"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Noticeboard"})}),n.noticeboard.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.noticeboard.map((u,d)=>(0,r.jsxs)("li",{className:`${i}-notice-row`,children:[(0,r.jsxs)("span",{children:[u.author.length>0?(0,r.jsx)("span",{className:`${i}-notice-author`,children:`${u.author}: `}):null,u.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{i1(d)},disabled:R,"aria-label":`Take down: ${u.text}`,children:"\xD7"})]},`${d}:${u.text}`))}),(0,r.jsxs)("div",{className:`${i}-notice-add`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:Er,maxLength:n.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:u=>of(u.target.value),onKeyDown:u=>{u.key==="Enter"&&(u.preventDefault(),Lf())}}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Lf()},disabled:R||Er.trim().length===0||n.noticeboard.length>=n.settings.maxNoticeboardNotes,children:`Pin it up (${n.noticeboard.length}/${n.settings.maxNoticeboardNotes})`})]})]}):null,j==="venueRequests"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villagers can ask for places in conversation or during village life. A place joins the village only when you approve it here. Taking down a notice does not change a request."}),n.venueRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.venueRequests.map(u=>{let d=ie[u.id]??u.venueDraft,v=E=>pt(N=>({...N,[u.id]:{...d,...E}}));return(0,r.jsx)("li",{className:`${i}-notice-row`,children:(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:u.requesterName||"A villager"}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${u.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.name,maxLength:n.settings.maxVenueNameLength,"aria-label":`Requested place name from ${u.requesterName||"villager"}`,onChange:E=>v({name:E.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.purpose,maxLength:n.settings.maxVenueNoteLength,"aria-label":`Requested place purpose from ${u.requesterName||"villager"}`,onChange:E=>v({purpose:E.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.category,maxLength:n.settings.maxVenueNoteLength,placeholder:"Category (optional)","aria-label":`Requested place category from ${u.requesterName||"villager"}`,onChange:E=>v({category:E.target.value})}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:d.description??"",maxLength:1e3,"aria-label":`Requested place description from ${u.requesterName||"villager"}`,onChange:E=>v({description:E.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!d.name.trim(),onClick:()=>{B(!0),Y(""),D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:u.id,name:d.name,purpose:d.purpose}]})}).then(E=>v({description:E.descriptions[u.id]??""})).catch(E=>Y(U(E,"The description draft could not be generated."))).finally(()=>B(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!d.name.trim()||!d.purpose.trim()||!d.description?.trim(),onClick:()=>{qf(u,!0)},children:"Approve"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{qf(u,!1)},children:"Deny"})]})]})},u.id)})}),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Home upgrade requests"}),n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No home upgrades requested."}):n.upgradeRequests.map(u=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:u.detail}),[!0,!1].map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{B(!0),Y(""),D(`/venue-upgrades/${encodeURIComponent(u.id)}/${d?"approve":"deny"}`,{method:"POST"}).then(o).catch(v=>Y(U(v,"The upgrade request could not be decided."))).finally(()=>B(!1))},children:d?"Approve upgrade":"Deny"},String(d)))]},u.id)),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Resident move requests"}),n.residences.filter(u=>u.status!=="current").length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No moves pending."}):n.residences.filter(u=>u.status!=="current").map(u=>{let d=ii(u.characterId),v=n.settings.venues.find(E=>E.id===u.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:`${d} \u2192 ${v}`}),u.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${i}-hint`,children:["Move due ",new Date(u.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{B(!0),Y(""),D("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:u.characterId})}).then(o).catch(E=>Y(U(E,"The move could not be completed."))).finally(()=>B(!1))},children:"DEBUG: Complete move now"})]}):u.requestedBy==="player"?(0,r.jsxs)("span",{className:`${i}-hint`,children:["Awaiting ",d,"'s answer in conversation."]}):[!0,!1].map(E=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{B(!0),Y(""),D(`/residences/${E?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:u.characterId})}).then(o).catch(N=>Y(U(N,"The move request could not be decided."))).finally(()=>B(!1))},children:E?"Approve move":"Deny"},String(E)))]},u.characterId)}),vt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:vt}):null]}):null,j==="homes"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Homes on the map"})}),(0,r.jsxs)("p",{className:`${i}-empty`,children:["Where everyone lives. Every house here is a ",Rf,". A house nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||ue.length>=Qr,onClick:()=>{Pt(!0),wc()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${ue.length} of at most ${Qr}`})]}),ue.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(Gw,{homes:ue,villagers:(n?.villagers??[]).map(u=>({id:u.characterId,name:u.name})),buildings:sl,disabled:R,selectedId:nf,onPatch:Sc,onRemove:Tc,onSelect:Vi,showDescriptions:!0,onGenerateDescription:u=>{Q0(u)},lockedIds:new Set(n.settings.venues.filter(u=>u.occupancy.residentCharacterId).map(u=>u.id))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{X0()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>ul(n.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${i}-hint`,children:c5(n.settings.venues,ue)?"No unsaved changes.":"Unsaved changes."})]})]}):null,j==="map"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(Ym,{src:_r,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:n.settings.venues.flatMap(u=>{let d=pr(u);if(!d)return[];let v=u.occupancy.residentCharacterId?ii(u.occupancy.residentCharacterId):u.occupancy.playerHome?Pn(n):"";return[{id:u.id,x:d.x,y:d.y,text:v?`${u.name||"Home"} \xB7 ${v}`:u.name,tone:yr(u)?qm({isPlayerHome:u.occupancy.playerHome,occupant:u.occupancy.residentCharacterId}):"venue",onSelect:()=>Zu(u.id)}]}),placing:Tr!==null,view:tl,shape:pf,zoom:c0,onView:Hr?el:void 0,onPlace:Tr?(u,d)=>{let v=Tr;B(!0),Y(""),D(`/locations/venue/${encodeURIComponent(v)}`,{method:"PUT",body:JSON.stringify({presentation:{x:u,y:d}})}).then(o).catch(E=>Y(U(E,"The venue could not be placed."))).finally(()=>{B(!1),Ku(null)})}:void 0}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Venue positions and residents"}),n.settings.venues.map(u=>{let d=u.occupancy.residentCharacterId?ii(u.occupancy.residentCharacterId):u.occupancy.playerHome?Pn(n):"",v=!!u.occupancy.residentCharacterId;return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":i0===u.id,onClick:()=>Zu(u.id),children:u.name||"Home"}),(0,r.jsx)("span",{className:`${i}-hint`,children:d?`Lives here: ${d}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${i}-hint`,children:pr(u)?"On map":"Not placed"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||v,onClick:()=>{Zu(u.id),Ku(u.id)},children:pr(u)?"Move pin":"Place pin"})]},u.id)}),Tr?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ku(null),children:"Cancel pin placement"}):null,vt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:vt}):null]}),Hr?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:qw.map(u=>(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":tl.fit===u.fit?"true":"false","aria-pressed":tl.fit===u.fit,onClick:()=>el({...tl,fit:u.fit}),children:u.label},u.fit))}),(0,r.jsx)("p",{className:`${i}-hint`,children:qw.find(u=>u.fit===tl.fit)?.help})]}):null,sc?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":sc.tone,children:sc.text}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:R,"aria-label":"Choose a town map picture",onChange:u=>{let d=u.target.files?.[0];u.target.value="",zf(d)}}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Of()},children:"Remove background image"}):null]}),Hr?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Mf()},children:ga?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:Xr,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>lc(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a conversation stands in when somebody is there. Open Edit Room to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:n.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),Sa(n.settings.venues).length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${i}-places`,children:Sa(n.settings.venues).map(u=>(0,r.jsxs)("li",{className:`${i}-place`,children:[u.presentation.image?(0,r.jsx)("img",{className:`${i}-place-thumb`,src:u.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${i}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${i}-place-body`,children:[(0,r.jsx)("span",{className:`${i}-place-name`,children:u.name}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{xc(u),J(structuredClone(u))},children:"Edit room"})})]})]},u.id))})]})]}):null,j==="replyGuidance"?(0,r.jsx)(S5,{}):null,j==="story"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),c===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the village remembers\u2026"}):c.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):KN(c).map(u=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${i}-story-day`,children:u.label}),(0,r.jsx)("ul",{className:`${i}-story`,children:u.entries.map(d=>{let v=JN(d),E=d.actors.map(N=>N.name).join(", ");return(0,r.jsxs)("li",{className:`${i}-story-row`,children:[(0,r.jsxs)("span",{children:[v.length>0||d.scope==="private"||d.kind==="favour"?(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[v,d.scope==="private"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:` \xB7 private to ${E}`}):null,d.kind==="favour"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 a favour"}):null,d.kind==="tick"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,d.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:R,onClick:()=>{b0(d.id)},"aria-label":`Forget: ${d.text}`,children:"\xD7"})]},d.id)})})]},`${u.label}:${u.entries[0]?.id??""}`)),c&&c.length<g?(0,r.jsxs)("button",{type:"button",className:`${i}-button`,onClick:()=>{v0()},children:["Load more memories (",c.length," of ",g,")"]}):null]}):null,j==="chatlogs"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:H,onChange:u=>{q(u.target.value),V(0),T(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(n?.settings.venues??[]).map(u=>(0,r.jsx)("option",{value:u.id,children:u.name},u.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:ae,onChange:u=>{O(u.target.value),V(0),T(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(n?.villagers??[]).map(u=>(0,r.jsx)("option",{value:u.characterId,children:u.name},u.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||y===0,onClick:()=>{Tf()},children:"Delete all completed logs"}),se?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:se}):null,$===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading venue visits\u2026"}):$.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No completed visits match these filters."}):$.map(u=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[u.placeName," \xB7 ",Im(u.startedAt)]}),(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[u.participants.map(d=>d.name).join(", ")," \xB7 ",u.lineCount," lines",u.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",u.memoryPending?` \xB7 memory pending (${u.memoryProgress?.nextUnit??0}/${u.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{yc(u.id)},children:x?.id===u.id?"Refresh transcript":"Open transcript"}),u.memoryPending?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{x0(u.id)},children:"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Tf(u.id)},children:"Delete log"})]}),x?.id===u.id?(0,r.jsx)("ul",{className:`${i}-story`,children:x.lines.map((d,v)=>(0,r.jsx)("li",{className:`${i}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[d.name||Pn(n)," \xB7 ",Im(d.at)]}),br(d.content,`venue-${u.id}-${v}-`),(0,r.jsxs)("span",{className:`${i}-story-meta`,children:["Heard by:"," ",d.heardBy?.map(E=>x.participants.find(N=>N.characterId===E)?.name??E).join(", ")||"no one"]})]})},`${u.id}:${v}`))}):null]},u.id)),y>20?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S===0,onClick:()=>{V(Math.max(0,S-20)),T(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[S+1,"\u2013",Math.min(y,S+20)," of ",y]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S+20>=y,onClick:()=>{V(S+20),T(null)},children:"Next"})]}):null]}):null,j==="agendas"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),St===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the villagers wish\u2026"}):St.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:St.map(u=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[u.name,u.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null]}),u.agenda===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):u.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:u.agenda.personalizationFailure?`Wish generation failed: ${u.agenda.personalizationFailure}`:u.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${i}-story`,children:u.agenda.wishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish}),d.tell.length>0?(0,r.jsx)("p",{className:`${i}-wish-tell`,children:`Shows as: ${d.tell}`}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`${d.intensity===1?"Faint":d.intensity===3?"Strong":"Present"} \xB7 ${WN(d.addedAt??"",d.expiresAt??"")}`})]},d.id))})]},u.characterId))})]}):null,j==="schedules"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),St===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Loading agendas\u2026"}):St.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${i}-agenda-list`,children:St.map(u=>(0,r.jsxs)("details",{className:`${i}-week`,children:[(0,r.jsx)("summary",{className:`${i}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${i}-week-head`,children:[u.name,u.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${i}-badge`,children:u.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,u.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${i}-badge`,children:"Personalization failed"}):null,u.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"Card missing"}):null,u.nativeSchedule?(0,r.jsx)("span",{className:`${i}-badge`,children:u.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,Um(u)?(0,r.jsx)("span",{className:`${i}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${i}-week-body`,children:[u.agenda?.routineSummary?(0,r.jsx)("p",{className:`${i}-story-meta`,children:u.agenda.routineSummary}):null,u.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${i}-empty`,children:u.agenda.personalizationFailure}):u.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${i}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${i}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:u.ingestSchedule,disabled:R,onChange:d=>{w0(u.characterId,d.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{y0(u.characterId)},children:"Regenerate agenda"})]}),u.nativeSchedule?(0,r.jsxs)("p",{className:`${i}-story-scope`,children:[u.ingestSchedule&&u.remapFailure?`Schedule translation failed: ${u.remapFailure.message}`:u.ingestSchedule&&u.agenda?.scheduleWeek?"Schedule guides today and future days.":u.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",Um(u)?" Earlier hours retain the previous plan.":""]}):Um(u)?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Earlier hours retain the previous plan."}):null,u.weekUnreadable?(0,r.jsx)("p",{className:`${i}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):u.nativeSchedule?null:(0,r.jsx)("p",{className:`${i}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${i}-agenda-days`,children:u.days.map(d=>{let v=d.isToday?u.agenda?.activeDay?.blocks??u.agenda?.week?.[d.weekday]??[]:(u.ingestSchedule?u.agenda?.scheduleWeek?.[d.weekday]:void 0)??u.agenda?.week?.[d.weekday]??[],E=u.nativeSchedule?.days[d.weekday]??[];return(0,r.jsxs)("details",{className:`${i}-agenda-day`,open:d.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[d.weekday," \xB7 ",d.dateLabel,d.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${i}-agenda-compare`,"data-comparison":u.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${d.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:v.map((N,L)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[zw(N.startMinute),"\u2013",zw(N.endMinute)]}),(0,r.jsx)("strong",{children:N.activity}),(0,r.jsx)("span",{children:N.venueId?FN(n?.settings.venues??[],N.venueId):"Home"}),(0,r.jsx)("span",{children:N.reason}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:N.status==="idle"?"Available":N.status==="dnd"?"Busy":N.status==="offline"?"Offline":"Online"})]},`${N.startMinute}-${N.endMinute}-${L}`))})]}),u.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${d.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),E.length?(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:E.map((N,L)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:N.time}),(0,r.jsx)("strong",{children:N.activity}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:N.status||"No availability set"})]},`${N.time}-${L}`))}):(0,r.jsx)("p",{className:`${i}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${d.weekday}-${d.dateLabel}`)})})]})]},u.characterId))})]}):null,vt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:vt}):null]})]});if(st==="setup"){let u=(l??[]).map(d=>({id:d.id,name:d.name}));return(0,r.jsxs)("div",{className:`${i}-root ${i}-home`,children:[(0,r.jsx)("div",{className:`${i}-mapbar`,children:(0,r.jsx)("span",{className:`${i}-mapbar-title`,children:Aa.trim()||"A new village"})}),(0,r.jsxs)("div",{className:`${i}-home-body`,children:[(0,r.jsx)("div",{className:`${i}-side`,children:(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:n?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsx)("div",{className:`${i}-steps`,children:kw.map((d,v)=>(0,r.jsx)("span",{className:`${i}-step`,"data-active":v===Ae?"true":"false","data-done":v<Ae?"true":"false",children:`${v+1}. ${d}`},d))}),Ae===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${i}-setup-name`,className:`${i}-search`,type:"text",value:Aa,maxLength:n?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:R,onChange:d=>lf(d.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Why is this village being founded?"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:ZN.map(d=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${i}-founding-reason`,checked:Wt===d.value,disabled:R,onChange:()=>sf(d.value)}),d.label]},d.value))})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-founding-details`,children:["Founding details ",Wt==="something-else"?"(required)":"(optional)"]}),(0,r.jsx)("textarea",{id:`${i}-founding-details`,className:`${i}-textarea`,value:Ja,maxLength:n?.settings.foundingDetailsMaxLength??500,placeholder:"Who brought everyone together, and what are they hoping to build?",disabled:R,onChange:d=>uf(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"This premise informs village stories without forcing repeated events."})]}),(0,r.jsx)(Lw,{idPrefix:"setup",personas:$r,draft:_t,onDraft:xr,storedId:n?.settings.playerPersonaId??"",storedName:n?.settings.playerPersonaName??"",storedMissing:n?.settings.playerPersonaMissing??!1,disabled:R}),(0,r.jsx)(Bw,{books:ef,error:tf,selected:Ca,onChange:d=>{Wm(d),kr([])},disabled:R})]}):null,Ae===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(jw,{onSetupProblem:l0,onImageWarningChange:ff}),r0?(0,r.jsxs)("div",{className:`${i}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${i}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${i}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:K0,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:Z0,children:"I understand, continue"})]})]}):null]}):null,Ae===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setup-setting`,className:`${i}-textarea`,value:Pe,maxLength:n?.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:R||Et,onChange:d=>{rf(d.target.value),kr([])}}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required. Describe the village's setting, visual style, and narrative vibe."})]}),(0,r.jsxs)("div",{className:`${i}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ge==="generate"?"true":"false","aria-pressed":ge==="generate",disabled:Et,onClick:()=>ai("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ge==="upload"?"true":"false","aria-pressed":ge==="upload",disabled:Et,onClick:()=>ai("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ge==="none"?"true":"false","aria-pressed":ge==="none",disabled:Et,onClick:()=>ai("none"),children:"No background image"}),n?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ge==="existing"?"true":"false","aria-pressed":ge==="existing",disabled:Et,onClick:()=>ai("existing"),children:"Keep current map"}):null]}),ge==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map elements"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([d,v])=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:zr[d],disabled:Et,onChange:E=>df(N=>({...N,[d]:E.target.checked}))}),v]},d))}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Unchecked elements are excluded, even if Setting and Theme mentions them. Structures may appear anywhere but must leave room for future locations."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-prompt`,className:`${i}-textarea`,value:vn,maxLength:1500,disabled:Et,onChange:d=>ec(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Et||Pe.trim().length===0||vn.trim().length===0,onClick:()=>{_0()},children:Et?"Generating map\u2026":Mr==="generate"?"Generate again":"Generate map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Et||vn===n?.settings.townMapLayoutPrompt,onClick:()=>ec(n?.settings.townMapLayoutPrompt??""),children:"Restore default prompt"})]})]}):null,ge==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:Et,"aria-label":"Choose a village map image",onChange:d=>{let v=d.target.files?.[0];d.target.value="",U0(v)}}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,ge==="none"?(0,r.jsx)("p",{className:`${i}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,Fo&&ge!=="none"&&Mr===ge&&bf?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":Bm(Fo).tone,children:Bm(Fo).text}):null]}):null,Ae===3?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("p",{className:`${i}-empty`,children:["Place one home for you, one to three homes for initial villagers, and the public center. Every home is a ",Rf,"."]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Nothing has to be exact: a pin marks a building, not a doorstep."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Pt(!0),Ri(!1)},disabled:R||ue.length>=1+rl,children:"Place a home"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Pt(!1),Ri(!0)},disabled:R,children:ea?"Move public center":"Place public center"})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Zo([]),Vi(null)},disabled:R||ue.length===0,children:"Start the map over"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${ue.length}/${1+rl} placed`})]}),ue.length>0?(0,r.jsx)(Gw,{homes:ue,villagers:u,buildings:sl,disabled:R,selectedId:nf,onPatch:Sc,onRemove:Tc,onSelect:Vi,lockedIds:new Set((n?.settings.venues??[]).filter(d=>d.occupancy.residentCharacterId).map(d=>d.id))}):null,(0,r.jsx)("p",{className:`${i}-empty`,children:"Give each villager home to someone. Everyone you name moves in when the village is founded, and their conversation starts here."}),l===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading your library\u2026"}):u.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Your character library is empty, so add characters there before founding this village."}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-center-name`,children:"Public venue name"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!Pe.trim(),onClick:()=>{H0()},children:"Suggest three names from setting and lore"}),cf.length>0?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-hint`,children:"Choose a name for the public venue, or write your own."}),cf.map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{ac(d),Di(v=>({...v,"setup-public-center":""})),bn(v=>v.filter(E=>E!=="setup-public-center"))},children:d},d))]}):null,(0,r.jsx)("input",{id:`${i}-setup-center-name`,className:`${i}-search`,type:"text",value:fa,maxLength:n?.settings.maxVenueNameLength,disabled:R,onChange:d=>{ac(d.target.value),Di(v=>({...v,"setup-public-center":""})),bn(v=>v.filter(E=>E!=="setup-public-center"))}}),(0,r.jsx)("span",{className:`${i}-hint`,children:ea?"The public center is placed on the map. Choose Move public center to place it again.":"Place the named public center on the map."})]})]}):null,Ae===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Review the homes and public venue, then approve their descriptions before founding."}),(0,r.jsx)("p",{className:`${i}-hint`,children:`${Aa.trim()||"Unnamed village"}, ${ue.length} homes, ${ue.filter(d=>!d.isPlayerHome&&d.characterId!==null).length} initial villagers, and ${fa.trim()||"an unnamed"} public center`}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Home tier names"}),["small-home","medium-home","large-home","huge-home"].map(d=>(0,r.jsxs)("label",{className:`${i}-label`,children:[d.replace("-"," "),(0,r.jsx)("input",{className:`${i}-notice-input`,value:Jo[d]??"",maxLength:60,onChange:v=>{Ar(E=>({...E,[d]:v.target.value})),bn([])}})]},d))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||Ii.some(d=>!d.name.trim()),onClick:()=>{J0()},children:"Generate public venue description draft"}),Ii.map(d=>(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:[d.name||"Unnamed venue"," description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:ti[d.id]??"",maxLength:1e3,onChange:v=>{Di(E=>({...E,[d.id]:v.target.value})),bn(E=>E.filter(N=>N!==d.id))}})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!ti[d.id]?.trim()||Cr.includes(d.id),onClick:()=>bn(v=>[...v,d.id]),children:Cr.includes(d.id)?"Approved":"Approve description"})]},d.id))]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[Ae>0?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||Et,onClick:()=>_f(Ae-1),children:"Back"}):null,Ae<kw.length-1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||Et,onClick:()=>_f(Ae+1),children:"Next"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||Et||!n,onClick:()=>{F0()},children:n?.isFounded?"Save this village":"Found the village"}),n?.isFounded?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-spacer`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Pt(!1),fe("home")},children:"Show me the village"})]}):null]}),gf?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:gf}):null,vt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:vt}):null]})}),(0,r.jsx)("div",{className:`${i}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${i}-setup-map-viewport`,children:(0,r.jsx)(Ym,{src:ni,alt:`A map of ${Aa.trim()||"your new village"}.`,pins:Ae<3?[]:l1,placing:Ae===3&&(Ko||Qu),view:ge==="existing"?Hi:Yu("cover"),shape:bf,onPlace:Ae===3?j0:void 0,compact:Ae<2,mobile:t&&Ae>=2,photoPins:!0})})})]})]})}return(0,r.jsxs)("div",{className:`${i}-root ${i}-home ${i}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-home-bar`,children:[(0,r.jsx)(p5,{weather:n?.village.weather??""}),!t&&n?.isFounded&&Sa(n.settings.venues).length>0?(0,r.jsxs)("div",{className:`${i}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":Wn,"aria-controls":`${i}-places-list`,disabled:R,onClick:()=>{gt(null),Jt(u=>!u)},children:"Places"}),Wn?(0,r.jsx)("div",{id:`${i}-places-list`,className:`${i}-places-list`,children:Sa(n.settings.venues).map(u=>(0,r.jsxs)("div",{className:`${i}-places-list-row`,children:[(0,r.jsx)("span",{className:`${i}-places-list-name`,children:u.name}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>xc(u,!0),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ir(u)},children:"Visit"})]},u.id))}):null]}):null,(0,r.jsxs)("span",{className:`${i}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-mobile-board-button`,"aria-label":`Noticeboard (${n?.noticeboard.length??0})`,disabled:!n||R,onClick:()=>We("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),n?.isFounded?(0,r.jsx)(y5,{happenings:n.happenings,recap:n.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:R||!n,onClick:()=>{Te("index"),fe("menu")},children:"\u2630"}),t?null:(0,r.jsx)(v5,{}),Ko?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Pt(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${i}-room`,children:(0,r.jsx)("div",{className:`${i}-home-map-viewport`,children:(0,r.jsx)(Ym,{src:_r,alt:`A map of ${n?.village.name??"the village"}.`,pins:o1,placing:Ko,view:Hi,shape:pf,onPlace:I0,onDismiss:()=>{gt(null),Jt(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:al||vt||Ko||Gr||hc?(0,r.jsxs)("div",{className:`${i}-notice`,children:[al?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:al}):null,vt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:vt}):null,Ko?(0,r.jsx)("span",{className:`${i}-status`,children:"Click the map where the house stands."}):null,Gr?(0,r.jsxs)("span",{className:`${i}-status`,children:["Catching up on what ",n?.village.name??"the village"," has been doing\u2026"]}):null,hc?(0,r.jsx)("p",{className:`${i}-status`,children:hc}):null]}):null})})})]})}var Qm=class extends HTMLElement{connectedCallback(){Mw(),this.__root??(this.__root=(0,Qw.createRoot)(this)),this.__root.render((0,r.jsx)(Xm,{element:this,children:(0,r.jsx)(M5,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),Mw()})}};function M5({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let n=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",n),()=>e.removeEventListener("marinara-capability-props",n)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(D5,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(V5,{props:e.capabilityProps??{}}):(0,r.jsx)(z5,{element:e})}function O5(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var R5="marinara-active-chat-id";function t0(){try{window.localStorage.removeItem(R5)}catch{}window.location.reload()}function a0(e,t){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(l(!1),n(null),!t)return;let s=new AbortController;return(async()=>{try{let c=await D(`/spinoffs/${encodeURIComponent(e)}`,{signal:s.signal});if(s.signal.aborted)return;n(c??null),l(!0)}catch{}})(),()=>s.abort()},[e,t]),{origin:a,known:o}}function V5({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",n=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:l,known:s}=a0(t,a&&t.length>0),[c,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!c)return;let y=S=>{g.current?.contains(S.target)||h(!1)},A=S=>{S.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",y),document.addEventListener("keydown",A),()=>{document.removeEventListener("pointerdown",y),document.removeEventListener("keydown",A)}},[c]),!a||!s||l===null)return null;let w=l.name||"your villager",$=l.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${$}`;return(0,r.jsxs)("span",{className:`${i}-tracker`,"data-compact":n,"data-open":c,ref:g,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${i}-tracker-chip`:`${i}-button ${i}-tracker-chip`,onClick:()=>h(y=>!y),"aria-haspopup":"menu","aria-expanded":c,title:f,"aria-label":f,children:[(0,r.jsx)(O5,{}),(0,r.jsx)("span",{className:`${i}-tracker-label`,children:"Villages"})]}),c?(0,r.jsxs)("div",{className:`${i}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${$}`,children:[(0,r.jsxs)("p",{className:`${i}-tracker-menu-title`,children:["This roleplay spun off from ",$]}),l.resident?(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[w," still lives there. ",$," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[w," does not live in ",$," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${i}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:t0,title:`Leaves this chat and opens Marinara's home screen, where the ${$} tab is waiting.`,children:"Open the village"})})]}):null]})}function D5({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:n,known:o}=a0(t,a&&t.length>0);if(!a||!o)return null;if(n===null)return(0,r.jsx)("div",{className:`${i}-panel-view`,children:(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let l=n.name||"this villager",s=n.villageName||"your village";return(0,r.jsxs)("div",{className:`${i}-panel-view`,children:[(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:n.resident?`This roleplay spun off from ${s}, and ${s} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${s}, and ${l} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:l})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:n.room})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:s})]}),(0,r.jsx)("div",{className:`${i}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:t0,title:`Leaves this chat and opens Marinara's home screen, where the ${s} tab is waiting.`,children:"Open the village"})})]})}customElements.get(i)||customElements.define(i,Qm);
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
