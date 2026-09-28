var O$=Object.create;var yd=Object.defineProperty;var V$=Object.getOwnPropertyDescriptor;var D$=Object.getOwnPropertyNames;var _$=Object.getPrototypeOf,H$=Object.prototype.hasOwnProperty;var I$=(e,t,a)=>t in e?yd(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var tn=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var U$=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of D$(t))!H$.call(e,o)&&o!==a&&yd(e,o,{get:()=>t[o],enumerable:!(n=V$(t,o))||n.enumerable});return e};var Hl=(e,t,a)=>(a=e!=null?O$(_$(e)):{},U$(t||!e||!e.__esModule?yd(a,"default",{value:e,enumerable:!0}):a,e));var Lg=(e,t,a)=>I$(e,typeof t!="symbol"?t+"":t,a);var tf=tn(te=>{"use strict";var xd=Symbol.for("react.transitional.element"),q$=Symbol.for("react.portal"),B$=Symbol.for("react.fragment"),L$=Symbol.for("react.strict_mode"),j$=Symbol.for("react.profiler"),G$=Symbol.for("react.consumer"),Y$=Symbol.for("react.context"),X$=Symbol.for("react.forward_ref"),Q$=Symbol.for("react.suspense"),Z$=Symbol.for("react.memo"),Qg=Symbol.for("react.lazy"),K$=Symbol.for("react.activity"),J$=Symbol.for("react.view_transition"),jg=Symbol.iterator;function F$(e){return e===null||typeof e!="object"?null:(e=jg&&e[jg]||e["@@iterator"],typeof e=="function"?e:null)}var Zg={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Kg=Object.assign,Jg={};function Mo(e,t,a){this.props=e,this.context=t,this.refs=Jg,this.updater=a||Zg}Mo.prototype.isReactComponent={};Mo.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Mo.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Fg(){}Fg.prototype=Mo.prototype;function Nd(e,t,a){this.props=e,this.context=t,this.refs=Jg,this.updater=a||Zg}var Sd=Nd.prototype=new Fg;Sd.constructor=Nd;Kg(Sd,Mo.prototype);Sd.isPureReactComponent=!0;var Gg=Array.isArray;function $d(){}var De={H:null,A:null,T:null,S:null},Pg=Object.prototype.hasOwnProperty;function Td(e,t,a){var n=a.ref;return{$$typeof:xd,type:e,key:t,ref:n!==void 0?n:null,props:a}}function P$(e,t){return Td(e.type,t,e.props)}function kd(e){return typeof e=="object"&&e!==null&&e.$$typeof===xd}function W$(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var Yg=/\/+/g;function wd(e,t){return typeof e=="object"&&e!==null&&e.key!=null?W$(""+e.key):t.toString(36)}function ex(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then($d,$d):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Ao(e,t,a,n,o){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case xd:case q$:c=!0;break;case Qg:return c=e._init,Ao(c(e._payload),t,a,n,o)}}if(c)return o=o(e),c=n===""?"."+wd(e,0):n,Gg(o)?(a="",c!=null&&(a=c.replace(Yg,"$&/")+"/"),Ao(o,t,a,"",function(g){return g})):o!=null&&(kd(o)&&(o=P$(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(Yg,"$&/")+"/")+c)),t.push(o)),1;c=0;var d=n===""?".":n+":";if(Gg(e))for(var h=0;h<e.length;h++)n=e[h],s=d+wd(n,h),c+=Ao(n,t,a,s,o);else if(h=F$(e),typeof h=="function")for(e=h.call(e),h=0;!(n=e.next()).done;)n=n.value,s=d+wd(n,h++),c+=Ao(n,t,a,s,o);else if(s==="object"){if(typeof e.then=="function")return Ao(ex(e),t,a,n,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function Il(e,t,a){if(e==null)return e;var n=[],o=0;return Ao(e,n,"","",function(s){return t.call(a,s,o++)}),n}function tx(e){if(e._status===-1){var t=e._result,a=t();a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n,a.status===void 0&&(a.status="fulfilled",a.value=n))},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n,a.status===void 0&&(a.status="rejected",a.reason=n))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var Xg=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Wg(e){var t=De.T,a={};a.types=t!==null?t.types:null,De.T=a;try{var n=e(),o=De.S;o!==null&&o(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then($d,Xg)}catch(s){Xg(s)}finally{t!==null&&a.types!==null&&(t.types=a.types),De.T=t}}function ef(e){var t=De.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else Wg(ef.bind(null,e))}var ax={map:Il,forEach:function(e,t,a){Il(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Il(e,function(){t++}),t},toArray:function(e){return Il(e,function(t){return t})||[]},only:function(e){if(!kd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};te.Activity=K$;te.Children=ax;te.Component=Mo;te.Fragment=B$;te.Profiler=j$;te.PureComponent=Nd;te.StrictMode=L$;te.Suspense=Q$;te.ViewTransition=J$;te.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=De;te.__COMPILER_RUNTIME={__proto__:null,c:function(e){return De.H.useMemoCache(e)}};te.addTransitionType=ef;te.cache=function(e){return function(){return e.apply(null,arguments)}};te.cacheSignal=function(){return null};te.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var n=Kg({},e.props),o=e.key;if(t!=null)for(s in t.key!==void 0&&(o=""+t.key),t)!Pg.call(t,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&t.ref===void 0||(n[s]=t[s]);var s=arguments.length-2;if(s===1)n.children=a;else if(1<s){for(var c=Array(s),d=0;d<s;d++)c[d]=arguments[d+2];n.children=c}return Td(e.type,o,n)};te.createContext=function(e){return e={$$typeof:Y$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:G$,_context:e},e};te.createElement=function(e,t,a){var n,o={},s=null;if(t!=null)for(n in t.key!==void 0&&(s=""+t.key),t)Pg.call(t,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(o[n]=t[n]);var c=arguments.length-2;if(c===1)o.children=a;else if(1<c){for(var d=Array(c),h=0;h<c;h++)d[h]=arguments[h+2];o.children=d}if(e&&e.defaultProps)for(n in c=e.defaultProps,c)o[n]===void 0&&(o[n]=c[n]);return Td(e,s,o)};te.createRef=function(){return{current:null}};te.forwardRef=function(e){return{$$typeof:X$,render:e}};te.isValidElement=kd;te.lazy=function(e){return{$$typeof:Qg,_payload:{_status:-1,_result:e},_init:tx}};te.memo=function(e,t){return{$$typeof:Z$,type:e,compare:t===void 0?null:t}};te.startTransition=Wg;te.unstable_useCacheRefresh=function(){return De.H.useCacheRefresh()};te.use=function(e){return De.H.use(e)};te.useActionState=function(e,t,a){return De.H.useActionState(e,t,a)};te.useCallback=function(e,t){return De.H.useCallback(e,t)};te.useContext=function(e){return De.H.useContext(e)};te.useDebugValue=function(){};te.useDeferredValue=function(e,t){return De.H.useDeferredValue(e,t)};te.useEffect=function(e,t){return De.H.useEffect(e,t)};te.useEffectEvent=function(e){return De.H.useEffectEvent(e)};te.useId=function(){return De.H.useId()};te.useImperativeHandle=function(e,t,a){return De.H.useImperativeHandle(e,t,a)};te.useInsertionEffect=function(e,t){return De.H.useInsertionEffect(e,t)};te.useLayoutEffect=function(e,t){return De.H.useLayoutEffect(e,t)};te.useMemo=function(e,t){return De.H.useMemo(e,t)};te.useOptimistic=function(e,t){return De.H.useOptimistic(e,t)};te.useReducer=function(e,t,a){return De.H.useReducer(e,t,a)};te.useRef=function(e){return De.H.useRef(e)};te.useState=function(e){return De.H.useState(e)};te.useSyncExternalStore=function(e,t,a){return De.H.useSyncExternalStore(e,t,a)};te.useTransition=function(){return De.H.useTransition()};te.version="19.3.0"});var Ul=tn((f2,af)=>{"use strict";af.exports=tf()});var mf=tn(Be=>{"use strict";function Ad(e,t){var a=e.length;e.push(t);e:for(;0<a;){var n=a-1>>>1,o=e[n];if(0<ql(o,t))e[n]=t,e[a]=o,a=n;else break e}}function an(e){return e.length===0?null:e[0]}function Ll(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var n=0,o=e.length,s=o>>>1;n<s;){var c=2*(n+1)-1,d=e[c],h=c+1,g=e[h];if(0>ql(d,a))h<o&&0>ql(g,d)?(e[n]=g,e[h]=a,n=h):(e[n]=d,e[c]=a,n=c);else if(h<o&&0>ql(g,a))e[n]=g,e[h]=a,n=h;else break e}}return t}function ql(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Be.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(nf=performance,Be.unstable_now=function(){return nf.now()}):(Ed=Date,of=Ed.now(),Be.unstable_now=function(){return Ed.now()-of});var nf,Ed,of,$n=[],Xn=[],nx=1,Sa=null,At=3,Md=!1,Pr=!1,Wr=!1,Rd=!1,lf=typeof setTimeout=="function"?setTimeout:null,cf=typeof clearTimeout=="function"?clearTimeout:null,rf=typeof setImmediate<"u"?setImmediate:null;function Bl(e){for(var t=an(Xn);t!==null;){if(t.callback===null)Ll(Xn);else if(t.startTime<=e)Ll(Xn),t.sortIndex=t.expirationTime,Ad($n,t);else break;t=an(Xn)}}function Od(e){if(Wr=!1,Bl(e),!Pr)if(an($n)!==null)Pr=!0,Oo||(Oo=!0,Ro());else{var t=an(Xn);t!==null&&Vd(Od,t.startTime-e)}}var Oo=!1,es=-1,uf=5,df=-1;function hf(){return Rd?!0:!(Be.unstable_now()-df<uf)}function Cd(){if(Rd=!1,Oo){var e=Be.unstable_now();df=e;var t=!0;try{e:{Pr=!1,Wr&&(Wr=!1,cf(es),es=-1),Md=!0;var a=At;try{t:{for(Bl(e),Sa=an($n);Sa!==null&&!(Sa.expirationTime>e&&hf());){var n=Sa.callback;if(typeof n=="function"){Sa.callback=null,At=Sa.priorityLevel;var o=n(Sa.expirationTime<=e);if(e=Be.unstable_now(),typeof o=="function"){Sa.callback=o,Bl(e),t=!0;break t}Sa===an($n)&&Ll($n),Bl(e)}else Ll($n);Sa=an($n)}if(Sa!==null)t=!0;else{var s=an(Xn);s!==null&&Vd(Od,s.startTime-e),t=!1}}break e}finally{Sa=null,At=a,Md=!1}t=void 0}}finally{t?Ro():Oo=!1}}}var Ro;typeof rf=="function"?Ro=function(){rf(Cd)}:typeof MessageChannel<"u"?(zd=new MessageChannel,sf=zd.port2,zd.port1.onmessage=Cd,Ro=function(){sf.postMessage(null)}):Ro=function(){lf(Cd,0)};var zd,sf;function Vd(e,t){es=lf(function(){e(Be.unstable_now())},t)}Be.unstable_IdlePriority=5;Be.unstable_ImmediatePriority=1;Be.unstable_LowPriority=4;Be.unstable_NormalPriority=3;Be.unstable_Profiling=null;Be.unstable_UserBlockingPriority=2;Be.unstable_cancelCallback=function(e){e.callback=null};Be.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):uf=0<e?Math.floor(1e3/e):5};Be.unstable_getCurrentPriorityLevel=function(){return At};Be.unstable_next=function(e){switch(At){case 1:case 2:case 3:var t=3;break;default:t=At}var a=At;At=t;try{return e()}finally{At=a}};Be.unstable_requestPaint=function(){Rd=!0};Be.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=At;At=e;try{return t()}finally{At=a}};Be.unstable_scheduleCallback=function(e,t,a){var n=Be.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:nx++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>n?(e.sortIndex=a,Ad(Xn,e),an($n)===null&&e===an(Xn)&&(Wr?(cf(es),es=-1):Wr=!0,Vd(Od,a-n))):(e.sortIndex=o,Ad($n,e),Pr||Md||(Pr=!0,Oo||(Oo=!0,Ro()))),e};Be.unstable_shouldYield=hf;Be.unstable_wrapCallback=function(e){var t=At;return function(){var a=At;At=t;try{return e.apply(this,arguments)}finally{At=a}}}});var gf=tn((v2,pf)=>{"use strict";pf.exports=mf()});var vf=tn(Mt=>{"use strict";var ix=Ul();function bf(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Qn(){}var It={d:{f:Qn,r:function(){throw Error(bf(522))},D:Qn,C:Qn,L:Qn,m:Qn,X:Qn,S:Qn,M:Qn},p:0,findDOMNode:null},ox=Symbol.for("react.portal"),rx=Symbol.for("react.recoverable"),ff=Symbol.for("react.optimistic_key");function sx(e,t,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ox,key:n==null?null:n===ff?ff:""+n,children:e,containerInfo:t,implementation:a}}var ts=ix.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function jl(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Mt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=It;Mt.browser=function(e){return{$$typeof:rx,_reason:e}};Mt.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(bf(299));return sx(e,t,null,a)};Mt.flushSync=function(e){var t=ts.T,a=It.p;try{if(ts.T=null,It.p=2,e)return e()}finally{ts.T=t,It.p=a,It.d.f()}};Mt.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,It.d.C(e,t))};Mt.prefetchDNS=function(e){typeof e=="string"&&It.d.D(e)};Mt.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,n=jl(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,s=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?It.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:n,integrity:o,fetchPriority:s}):a==="script"&&It.d.X(e,{crossOrigin:n,integrity:o,fetchPriority:s,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Mt.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=jl(t.as,t.crossOrigin);It.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&It.d.M(e)};Mt.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,n=jl(a,t.crossOrigin);It.d.L(e,a,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Mt.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=jl(t.as,t.crossOrigin);It.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else It.d.m(e)};Mt.requestFormReset=function(e){It.d.r(e)};Mt.unstable_batchedUpdates=function(e,t){return e(t)};Mt.useFormState=function(e,t,a){return ts.H.useFormState(e,t,a)};Mt.useFormStatus=function(){return ts.H.useHostTransitionStatus()};Mt.version="19.3.0"});var $f=tn((w2,wf)=>{"use strict";function yf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(yf)}catch(e){console.error(e)}}yf(),wf.exports=vf()});var s0=tn(Su=>{"use strict";var ht=gf(),rv=Ul(),lx=$f();function M(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function sv(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Ls(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function lv(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function cv(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function xf(e){if(Ls(e)!==e)throw Error(M(188))}function cx(e){var t=e.alternate;if(!t){if(t=Ls(e),t===null)throw Error(M(188));return t!==e?null:e}for(var a=e,n=t;;){var o=a.return;if(o===null)break;var s=o.alternate;if(s===null){if(n=o.return,n!==null){a=n;continue}break}if(o.child===s.child){for(s=o.child;s;){if(s===a)return xf(o),e;if(s===n)return xf(o),t;s=s.sibling}throw Error(M(188))}if(a.return!==n.return)a=o,n=s;else{for(var c=!1,d=o.child;d;){if(d===a){c=!0,a=o,n=s;break}if(d===n){c=!0,n=o,a=s;break}d=d.sibling}if(!c){for(d=s.child;d;){if(d===a){c=!0,a=s,n=o;break}if(d===n){c=!0,n=s,a=o;break}d=d.sibling}if(!c)throw Error(M(189))}}if(a.alternate!==n)throw Error(M(190))}if(a.tag!==3)throw Error(M(188));return a.stateNode.current===a?e:t}function uv(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=uv(e),t!==null)return t;e=e.sibling}return null}function Wt(e,t,a,n,o,s){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,n,o,s)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Wt(e.child,t,a,n,o,s))return!0;e=e.sibling}return!1}function io(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Nf(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function dv(e){var t=[null,null],a=io(e);return a===null||hv(t,e,a.child,{foundSelf:!1}),t}function hv(e,t,a,n){for(;a!==null;){if(a===t)n.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(n.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&hv(e,t,a.child,n))return!0;a=a.sibling}return!1}function dt(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(M(559))}}var qo=null,hh=null;function ux(e,t,a){return e===a?!0:e===t?(qo=e,!0):!1}function dx(e,t,a){return e===a?(hh=e,!1):e===t?(hh!==null&&(qo=e),!0):!1}function Sf(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function mh(e,t,a){for(var n=0,o=e;o;o=a(o))n++;o=0;for(var s=t;s;s=a(s))o++;for(;0<n-o;)e=a(e),n--;for(;0<o-n;)t=a(t),o--;for(;n--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var Ve=Object.assign,hx=Symbol.for("react.element"),Gl=Symbol.for("react.transitional.element"),ls=Symbol.for("react.portal"),Bo=Symbol.for("react.fragment"),mv=Symbol.for("react.strict_mode"),ph=Symbol.for("react.profiler"),pv=Symbol.for("react.consumer"),cn=Symbol.for("react.context"),Nm=Symbol.for("react.forward_ref"),gh=Symbol.for("react.suspense"),fh=Symbol.for("react.suspense_list"),Sm=Symbol.for("react.memo"),Fn=Symbol.for("react.lazy"),bh=Symbol.for("react.activity"),mx=Symbol.for("react.legacy_hidden"),px=Symbol.for("react.memo_cache_sentinel"),vh=Symbol.for("react.view_transition"),gx=Symbol.for("react.recoverable"),Tf=Symbol.iterator;function as(e){return e===null||typeof e!="object"?null:(e=Tf&&e[Tf]||e["@@iterator"],typeof e=="function"?e:null)}var fx=Symbol.for("react.client.reference");function yh(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===fx?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Bo:return"Fragment";case ph:return"Profiler";case mv:return"StrictMode";case gh:return"Suspense";case fh:return"SuspenseList";case bh:return"Activity";case vh:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case ls:return"Portal";case cn:return e.displayName||"Context";case pv:return(e._context.displayName||"Context")+".Consumer";case Nm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Sm:return t=e.displayName||null,t!==null?t:yh(e.type)||"Memo";case Fn:t=e._payload,e=e._init;try{return yh(e(t))}catch{}}return null}var cs=Array.isArray,ee=rv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,xe=lx.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Yi={pending:!1,data:null,method:null,action:null},wh=[],Lo=-1;function fn(e){return{current:e}}function Tt(e){0>Lo||(e.current=wh[Lo],wh[Lo]=null,Lo--)}function Ie(e,t){Lo++,wh[Lo]=e.current,e.current=t}var mn=fn(null),ks=fn(null),ri=fn(null),Ac=fn(null);function Mc(e,t){switch(Ie(ri,t),Ie(ks,e),Ie(mn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Ub(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Ub(t),e=_w(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}Tt(mn),Ie(mn,e)}function lr(){Tt(mn),Tt(ks),Tt(ri)}function $h(e){var t=e.memoizedState;t!==null&&(vr._currentValue=t.memoizedState,Ie(Ac,e)),t=mn.current;var a=_w(t,e.type);t!==a&&(Ie(ks,e),Ie(mn,a))}function Rc(e){ks.current===e&&(Tt(mn),Tt(ks)),Ac.current===e&&(Tt(Ac),vr._currentValue=Yi)}var Dd,kf;function Kn(e){if(Dd===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Dd=t&&t[1]||"",kf=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Dd+e+kf}var _d=!1;function Hd(e,t){if(!e||_d)return"";_d=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var N=function(){throw Error()};if(Object.defineProperty(N.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(N,[])}catch(A){var f=A}Reflect.construct(e,[],N)}else{try{N.call()}catch(A){f=A}N=!1;try{var $=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),N=!0,new e}finally{N&&($!==void 0?Object.defineProperty(e.prototype,"props",$):delete e.prototype.props)}}}else{try{throw Error()}catch(A){f=A}(N=e())&&typeof N.catch=="function"&&N.catch(function(){})}}catch(A){if(A&&f&&typeof A.stack=="string")return[A.stack,f.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=n.DetermineComponentFrameRoot(),c=s[0],d=s[1];if(c&&d){var h=c.split(`
`),g=d.split(`
`);for(o=n=0;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;for(;o<g.length&&!g[o].includes("DetermineComponentFrameRoot");)o++;if(n===h.length||o===g.length)for(n=h.length-1,o=g.length-1;1<=n&&0<=o&&h[n]!==g[o];)o--;for(;1<=n&&0<=o;n--,o--)if(h[n]!==g[o]){if(n!==1||o!==1)do if(n--,o--,0>o||h[n]!==g[o]){var w=`
`+h[n].replace(" at new "," at ");return e.displayName&&w.includes("<anonymous>")&&(w=w.replace("<anonymous>",e.displayName)),w}while(1<=n&&0<=o);break}}}finally{_d=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Kn(a):""}function bx(e,t){switch(e.tag){case 26:case 27:case 5:return Kn(e.type);case 16:return Kn("Lazy");case 13:return e.child!==t&&t!==null?Kn("Suspense Fallback"):Kn("Suspense");case 19:return Kn("SuspenseList");case 0:case 15:return Hd(e.type,!1);case 11:return Hd(e.type.render,!1);case 1:return Hd(e.type,!0);case 31:return Kn("Activity");case 30:return Kn("ViewTransition");default:return""}}function Ef(e){try{var t="",a=null;do t+=bx(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var xh=Object.prototype.hasOwnProperty,Tm=ht.unstable_scheduleCallback,Id=ht.unstable_cancelCallback,vx=ht.unstable_shouldYield,yx=ht.unstable_requestPaint,ha=ht.unstable_now,wx=ht.unstable_getCurrentPriorityLevel,gv=ht.unstable_ImmediatePriority,fv=ht.unstable_UserBlockingPriority,Oc=ht.unstable_NormalPriority,$x=ht.unstable_LowPriority,bv=ht.unstable_IdlePriority,xx=ht.log,Nx=ht.unstable_setDisableYieldValue,js=null,ma=null;function ei(e){if(typeof xx=="function"&&Nx(e),ma&&typeof ma.setStrictMode=="function")try{ma.setStrictMode(js,e)}catch{}}var pa=Math.clz32?Math.clz32:kx,Sx=Math.log,Tx=Math.LN2;function kx(e){return e>>>=0,e===0?32:31-(Sx(e)/Tx|0)|0}var Yl=256,Xl=262144,Ql=4194304;function qi(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function ou(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var o=0,s=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var d=n&134217727;return d!==0?(n=d&~s,n!==0?o=qi(n):(c&=d,c!==0?o=qi(c):a||(a=d&~e,a!==0&&(o=qi(a))))):(d=n&~s,d!==0?o=qi(d):c!==0?o=qi(c):a||(a=n&~e,a!==0&&(o=qi(a)))),o===0?0:t!==0&&t!==o&&(t&s)===0&&(s=o&-o,a=t&-t,s>=a||s===32&&(a&4194048)!==0)?t:o}function Gs(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function vv(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-pa(a),o=1<<n;t|=e[n],a&=~o}return t}function Ex(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function yv(){var e=Ql;return Ql<<=1,(Ql&62914560)===0&&(Ql=4194304),e}function Ud(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Ys(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Cx(e,t,a,n,o,s){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var d=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=c&~a;0<a;){var w=31-pa(a),N=1<<w;d[w]=0,h[w]=-1;var f=g[w];if(f!==null)for(g[w]=null,w=0;w<f.length;w++){var $=f[w];$!==null&&($.lane&=-536870913)}a&=~N}n!==0&&wv(e,n,0),s!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=s&~(c&~t))}function wv(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-pa(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function $v(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-pa(a),o=1<<n;o&t|e[n]&t&&(e[n]|=t),a&=~o}}function xv(e,t){var a=t&-t;return a=(a&42)!==0?1:km(a),(a&(e.suspendedLanes|t))!==0?0:a}function km(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Em(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Nv(){var e=xe.p;return e!==0?e:(e=window.event,e===void 0?32:i0(e.type))}function Cf(e,t){var a=xe.p;try{return xe.p=e,t()}finally{xe.p=a}}var Vn=Math.random().toString(36).slice(2),Nt="__reactFiber$"+Vn,ea="__reactProps$"+Vn,$r="__reactContainer$"+Vn,zf="__reactEvents$"+Vn,zx="__reactListeners$"+Vn,Ax="__reactHandles$"+Vn,Af="__reactResources$"+Vn,Xs="__reactMarker$"+Vn,Vc="__reactLoad$"+Vn;function ru(e){delete e[Nt],delete e[ea],delete e[zx],delete e[Ax]}function ji(e){var t;if(t=e[Nt])return t;for(var a=e.parentNode;a;){if(t=a[$r]||a[Nt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=Qb(e);e!==null;){if(a=e[Nt])return a;e=Qb(e)}return t}e=a,a=e.parentNode}return null}function xr(e){if(e=e[Nt]||e[$r]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function us(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(M(33))}function Po(e){var t=e[Af];return t||(t=e[Af]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function bt(e){e[Xs]=!0}function Sv(e){e[Vc]=void 0}var Tv=new Set,kv={};function oo(e,t){cr(e,t),cr(e+"Capture",t)}function cr(e,t){for(kv[e]=t,e=0;e<t.length;e++)Tv.add(t[e])}var Mx=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Mf={},Rf={};function Rx(e){return xh.call(Rf,e)?!0:xh.call(Mf,e)?!1:Mx.test(e)?Rf[e]=!0:(Mf[e]=!0,!1)}var we=!1;function Of(){var e=we;return we=!1,e}function dc(e,t,a){if(Rx(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function Zl(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function xn(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,n)}}function la(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Ev(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Ox(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,s=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(c){a=""+c,s.call(this,c)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Nh(e){if(!e._valueTracker){var t=Ev(e)?"checked":"value";e._valueTracker=Ox(e,t,""+e[t])}}function Cv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=Ev(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}var Vx=/[\n"\\]/g;function za(e){return e.replace(Vx,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Sh(e,t,a,n,o,s,c,d){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+la(t)):e.value!==""+la(t)&&(e.value=""+la(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?qd(e,la(e.value)):qd(e,la(t)):a!=null?qd(e,la(a)):n!=null&&e.removeAttribute("value"),o==null&&s!=null&&(e.defaultChecked=!!s),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"?e.name=""+la(d):e.removeAttribute("name")}function zv(e,t,a,n,o,s,c,d){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.type=s),t!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||t!=null)){Nh(e);return}a=a!=null?""+la(a):"",t=t!=null?""+la(t):a,d||t===e.value||(e.value=t),e.defaultValue=t}n=n??o,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=d?e.checked:!!n,e.defaultChecked=!!n,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),Nh(e)}function qd(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function Wo(e,t,a,n){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&n&&(e[a].defaultSelected=!0)}else{for(a=""+la(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,n&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function Av(e,t,a){if(t!=null&&(t=""+la(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+la(a):""}function Mv(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(M(92));if(cs(n)){if(1<n.length)throw Error(M(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=la(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),Nh(e)}function ur(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var Dx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Vf(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||Dx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Rv(e,t,a){if(t!=null&&typeof t!="object")throw Error(M(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="",we=!0);for(var o in t)n=t[o],t.hasOwnProperty(o)&&a[o]!==n&&(Vf(e,o,n),we=!0)}else for(var s in t)t.hasOwnProperty(s)&&Vf(e,s,t[s])}function Cm(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var _x=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Hx=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function hc(e){return Hx.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function un(){}var Th=null;function zm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var jo=null,er=null;function Df(e){var t=xr(e);if(t&&(e=t.stateNode)){var a=e[ea]||null;e:switch(e=t.stateNode,t.type){case"input":if(Sh(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+za(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var o=n[ea]||null;if(!o)throw Error(M(90));Sh(n,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&Cv(n)}break e;case"textarea":Av(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&Wo(e,!!a.multiple,t,!1)}}}var Bd=!1;function Ov(e,t,a){if(Bd)return e(t,a);Bd=!0;try{var n=e(t);return n}finally{if(Bd=!1,(jo!==null||er!==null)&&(wu(),jo&&(t=jo,e=er,er=jo=null,Df(t),e)))for(t=0;t<e.length;t++)Df(e[t])}}function Es(e,t){var a=e.stateNode;if(a===null)return null;var n=a[ea]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(M(231,t,typeof a));return a}var Cn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),kh=!1;if(Cn)try{Vo={},Object.defineProperty(Vo,"passive",{get:function(){kh=!0}}),window.addEventListener("test",Vo,Vo),window.removeEventListener("test",Vo,Vo)}catch{kh=!1}var Vo,ti=null,Am=null,mc=null;function Vv(){if(mc)return mc;var e,t=Am,a=t.length,n,o="value"in ti?ti.value:ti.textContent,s=o.length;for(e=0;e<a&&t[e]===o[e];e++);var c=a-e;for(n=1;n<=c&&t[a-n]===o[s-n];n++);return mc=o.slice(e,1<n?1-n:void 0)}function pc(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Kl(){return!0}function _f(){return!1}function Lt(e){function t(a,n,o,s,c){this._reactName=a,this._targetInst=o,this.type=n,this.nativeEvent=s,this.target=c,this.currentTarget=null;for(var d in e)e.hasOwnProperty(d)&&(a=e[d],this[d]=a?a(s):s[d]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Kl:_f,this.isPropagationStopped=_f,this}return Ve(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Kl)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Kl)},persist:function(){},isPersistent:Kl}),t}var $i={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},su=Lt($i),Qs=Ve({},$i,{view:0,detail:0}),Ix=Lt(Qs),Ld,jd,ns,lu=Ve({},Qs,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Mm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==ns&&(ns&&e.type==="mousemove"?(Ld=e.screenX-ns.screenX,jd=e.screenY-ns.screenY):jd=Ld=0,ns=e),Ld)},movementY:function(e){return"movementY"in e?e.movementY:jd}}),Hf=Lt(lu),Ux=Ve({},lu,{dataTransfer:0}),qx=Lt(Ux),Bx=Ve({},Qs,{relatedTarget:0}),Gd=Lt(Bx),Lx=Ve({},$i,{animationName:0,elapsedTime:0,pseudoElement:0}),jx=Lt(Lx),Gx=Ve({},$i,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Yx=Lt(Gx),Xx=Ve({},$i,{data:0}),If=Lt(Xx),Qx={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Zx={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Kx={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Jx(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Kx[e])?!!t[e]:!1}function Mm(){return Jx}var Fx=Ve({},Qs,{key:function(e){if(e.key){var t=Qx[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=pc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Zx[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Mm,charCode:function(e){return e.type==="keypress"?pc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?pc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Px=Lt(Fx),Wx=Ve({},lu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Uf=Lt(Wx),eN=Ve({},$i,{submitter:0}),tN=Lt(eN),aN=Ve({},Qs,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Mm}),nN=Lt(aN),iN=Ve({},$i,{propertyName:0,elapsedTime:0,pseudoElement:0}),oN=Lt(iN),rN=Ve({},lu,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),sN=Lt(rN),lN=Ve({},$i,{newState:0,oldState:0,source:0}),cN=Lt(lN),uN=[9,13,27,32],Rm=Cn&&"CompositionEvent"in window,ms=null;Cn&&"documentMode"in document&&(ms=document.documentMode);var dN=Cn&&"TextEvent"in window&&!ms,Dv=Cn&&(!Rm||ms&&8<ms&&11>=ms),qf=" ",Bf=!1;function _v(e,t){switch(e){case"keyup":return uN.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Hv(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Go=!1;function hN(e,t){switch(e){case"compositionend":return Hv(t);case"keypress":return t.which!==32?null:(Bf=!0,qf);case"textInput":return e=t.data,e===qf&&Bf?null:e;default:return null}}function mN(e,t){if(Go)return e==="compositionend"||!Rm&&_v(e,t)?(e=Vv(),mc=Am=ti=null,Go=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Dv&&t.locale!=="ko"?null:t.data;default:return null}}var pN={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Lf(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!pN[e.type]:t==="textarea"}function Iv(e,t,a,n){jo?er?er.push(n):er=[n]:jo=n,t=au(t,"onChange"),0<t.length&&(a=new su("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var ps=null,Cs=null;function gN(e){Ow(e,0)}function cu(e){var t=us(e);if(Cv(t))return e}function jf(e,t){if(e==="change")return t}var Uv=!1;Cn&&(Cn?(Fl="oninput"in document,Fl||(Yd=document.createElement("div"),Yd.setAttribute("oninput","return;"),Fl=typeof Yd.oninput=="function"),Jl=Fl):Jl=!1,Uv=Jl&&(!document.documentMode||9<document.documentMode));var Jl,Fl,Yd;function Gf(){ps&&(ps.detachEvent("onpropertychange",qv),Cs=ps=null)}function qv(e){if(e.propertyName==="value"&&cu(Cs)){var t=[];Iv(t,Cs,e,zm(e)),Ov(gN,t)}}function fN(e,t,a){e==="focusin"?(Gf(),ps=t,Cs=a,ps.attachEvent("onpropertychange",qv)):e==="focusout"&&Gf()}function bN(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return cu(Cs)}function vN(e,t){if(e==="click")return cu(t)}function yN(e,t){if(e==="input"||e==="change")return cu(t)}function wN(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var fa=typeof Object.is=="function"?Object.is:wN;function zs(e,t){if(fa(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var o=a[n];if(!xh.call(t,o)||!fa(e[o],t[o]))return!1}return!0}function Eh(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Yf(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Xf(e,t){var a=Yf(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Yf(a)}}function Bv(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Bv(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Lv(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Eh(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=Eh(e.document)}return t}function Om(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var $N=Cn&&"documentMode"in document&&11>=document.documentMode,Yo=null,Ch=null,gs=null,zh=!1;function Qf(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;zh||Yo==null||Yo!==Eh(n)||(n=Yo,"selectionStart"in n&&Om(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),gs&&zs(gs,n)||(gs=n,n=au(Ch,"onSelect"),0<n.length&&(t=new su("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=Yo)))}function Ii(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Xo={animationend:Ii("Animation","AnimationEnd"),animationiteration:Ii("Animation","AnimationIteration"),animationstart:Ii("Animation","AnimationStart"),transitionrun:Ii("Transition","TransitionRun"),transitionstart:Ii("Transition","TransitionStart"),transitioncancel:Ii("Transition","TransitionCancel"),transitionend:Ii("Transition","TransitionEnd")},Xd={},jv={};Cn&&(jv=document.createElement("div").style,"AnimationEvent"in window||(delete Xo.animationend.animation,delete Xo.animationiteration.animation,delete Xo.animationstart.animation),"TransitionEvent"in window||delete Xo.transitionend.transition);function ro(e){if(Xd[e])return Xd[e];if(!Xo[e])return e;var t=Xo[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in jv)return Xd[e]=t[a];return e}var Gv=ro("animationend"),Yv=ro("animationiteration"),Xv=ro("animationstart"),xN=ro("transitionrun"),NN=ro("transitionstart"),SN=ro("transitioncancel"),Qv=ro("transitionend"),Zv=new Map,Ah="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Ah.push("scrollEnd");function Xa(e,t){Zv.set(e,t),oo(t,[e])}var TN=0;function zn(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Ya.identifierPrefix;var a=TN++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function Zf(e){if(e==null||typeof e=="string")return e;var t=null,a=sr;if(a!==null)for(var n=0;n<a.length;n++){var o=e[a[n]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function Dn(e,t){return e=Zf(e),t=Zf(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Dc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},ka=[],Qo=0,Vm=0;function uu(){for(var e=Qo,t=Vm=Qo=0;t<e;){var a=ka[t];ka[t++]=null;var n=ka[t];ka[t++]=null;var o=ka[t];ka[t++]=null;var s=ka[t];if(ka[t++]=null,n!==null&&o!==null){var c=n.pending;c===null?o.next=o:(o.next=c.next,c.next=o),n.pending=o}s!==0&&Kv(a,o,s)}}function du(e,t,a,n){ka[Qo++]=e,ka[Qo++]=t,ka[Qo++]=a,ka[Qo++]=n,Vm|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function Dm(e,t,a,n){return du(e,t,a,n),_c(e)}function so(e,t){return du(e,null,null,t),_c(e)}function Kv(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var o=!1,s=e.return;s!==null;)s.childLanes|=a,n=s.alternate,n!==null&&(n.childLanes|=a),s.tag===22&&(e=s.stateNode,e===null||e._visibility&1||(o=!0)),e=s,s=s.return;return e.tag===3?(s=e.stateNode,o&&t!==null&&(o=31-pa(a),e=s.hiddenUpdates,n=e[o],n===null?e[o]=[t]:n.push(t),t.lane=a|536870912),s):null}function _c(e){if(50<Ts)throw Ts=0,Sc=null,Error(M(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Zo={};function kN(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ft(e,t,a,n){return new kN(e,t,a,n)}function _m(e){return e=e.prototype,!(!e||!e.isReactComponent)}function kn(e,t){var a=e.alternate;return a===null?(a=Ft(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Jv(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function gc(e,t,a,n,o,s){var c=0;if(n=e,typeof n=="function")_m(n)&&(c=1);else if(typeof n=="string")c=P5(e,a,mn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(n){case bh:return e=Ft(31,a,t,o),e.elementType=bh,e.lanes=s,e;case Bo:return Xi(a.children,o,s,t);case mv:c=8,o|=24;break;case ph:return e=Ft(12,a,t,o|2),e.elementType=ph,e.lanes=s,e;case gh:return e=Ft(13,a,t,o),e.elementType=gh,e.lanes=s,e;case fh:return e=Ft(19,a,t,o),e.elementType=fh,e.lanes=s,e;case mx:case vh:return e=o|32,e=Ft(30,a,t,e),e.elementType=vh,e.lanes=s,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case cn:c=10;break e;case pv:c=9;break e;case Nm:c=11;break e;case Sm:c=14;break e;case Fn:c=16,n=null;break e}c=29,a=Error(M(130,e===null?"null":typeof e,"")),n=null}return t=Ft(c,a,t,o),t.elementType=e,t.type=n,t.lanes=s,t}function Xi(e,t,a,n){return e=Ft(7,e,n,t),e.lanes=a,e}function Qd(e,t,a){return e=Ft(6,e,null,t),e.lanes=a,e}function Fv(e){var t=Ft(18,null,null,0);return t.stateNode=e,t}function Zd(e,t,a){return t=Ft(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Kf=new WeakMap;function Aa(e,t){if(typeof e=="object"&&e!==null){var a=Kf.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Ef(t)},Kf.set(e,t),t)}return{value:e,source:t,stack:Ef(t)}}var Ko=[],Jo=0,Hc=null,As=0,Ea=[],Ca=0,fi=null,dn=1,hn="";function Sn(e,t){Ko[Jo++]=As,Ko[Jo++]=Hc,Hc=e,As=t}function Pv(e,t,a){Ea[Ca++]=dn,Ea[Ca++]=hn,Ea[Ca++]=fi,fi=e;var n=dn;e=hn;var o=32-pa(n)-1;n&=~(1<<o),a+=1;var s=32-pa(t)+o;if(30<s){var c=o-o%5;s=(n&(1<<c)-1).toString(32),n>>=c,o-=c,dn=1<<32-pa(t)+o|a<<o|n,hn=s+e}else dn=1<<s|a<<o|n,hn=e}function hu(e){e.return!==null&&(Sn(e,1),Pv(e,1,0))}function Hm(e){for(;e===Hc;)Hc=Ko[--Jo],Ko[Jo]=null,As=Ko[--Jo],Ko[Jo]=null;for(;e===fi;)fi=Ea[--Ca],Ea[Ca]=null,hn=Ea[--Ca],Ea[Ca]=null,dn=Ea[--Ca],Ea[Ca]=null}function Wv(e,t){Ea[Ca++]=dn,Ea[Ca++]=hn,Ea[Ca++]=fi,dn=t.id,hn=t.overflow,fi=e}var vt=null,He=null,ce=!1,si=null,Ma=!1,Mh=Error(M(519));function bi(e){var t=Error(M(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Ms(Aa(t,e)),Mh}function Jf(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[Nt]=e,t[ea]=n,a){case"dialog":de("cancel",t),de("close",t);break;case"iframe":case"object":case"embed":de("load",t);break;case"video":case"audio":for(a=0;a<Ds.length;a++)de(Ds[a],t);break;case"source":de("error",t);break;case"img":case"image":case"link":de("error",t),de("load",t);break;case"details":de("toggle",t);break;case"input":de("invalid",t),zv(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":de("invalid",t);break;case"textarea":de("invalid",t),Mv(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||Dw(t.textContent,a)?(n.popover!=null&&(de("beforetoggle",t),de("toggle",t)),n.onScroll!=null&&de("scroll",t),n.onScrollEnd!=null&&de("scrollend",t),n.onClick!=null&&(t.onclick=un),t=!0):t=!1,t||bi(e,!0)}function Ic(e){for(vt=e.return;vt;)switch(vt.tag){case 5:case 31:case 13:Ma=!1;return;case 27:case 3:Ma=!0;return;default:vt=vt.return}}function Do(e){if(e!==vt)return!1;if(!ce)return Ic(e),ce=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||gm(e.type,e.memoizedProps)),a=!a),a&&He&&bi(e),Ic(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(317));He=Xb(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(317));He=Xb(e)}else t===27?(t=He,xi(e.type)?(e=ym,ym=null,He=e):He=t):He=vt?Ra(e.stateNode.nextSibling):null;return!0}function Ji(){He=vt=null,ce=!1}function Kd(){var e=si;return e!==null&&(Kt===null?Kt=e:Kt.push.apply(Kt,e),si=null),e}function Ms(e){si===null?si=[e]:si.push(e)}var Rh=fn(null),lo=null,Tn=null;function ai(e,t,a){Ie(Rh,t._currentValue),t._currentValue=a}function En(e){e._currentValue=Rh.current,Tt(Rh)}function fc(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function Oh(e,t,a,n){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var s=o.dependencies;if(s!==null){var c=o.child;s=s.firstContext;e:for(;s!==null;){var d=s;s=o;for(var h=0;h<t.length;h++)if(d.context===t[h]){s.lanes|=a,d=s.alternate,d!==null&&(d.lanes|=a),fc(s.return,a,e),n||(c=null);break e}s=d.next}}else if(o.tag===18){if(c=o.return,c===null)throw Error(M(341));c.lanes|=a,s=c.alternate,s!==null&&(s.lanes|=a),fc(c,a,e),c=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,c=o.alternate,c!==null&&(c.lanes|=a),fc(o.return,a,e),c=o.child,c=c!==null?c.sibling:null):c=o.child;if(c!==null)c.return=o;else for(c=o;c!==null;){if(c===e){c=null;break}if(o=c.sibling,o!==null){o.return=c.return,c=o;break}c=c.return}o=c}}function Fi(e,t,a,n){e=null;for(var o=t,s=!1;o!==null;){if(!s){if((o.flags&524288)!==0)s=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var c=o.alternate;if(c===null)throw Error(M(387));if(c=c.memoizedProps,c!==null){var d=o.type;fa(o.pendingProps.value,c.value)||(e!==null?e.push(d):e=[d])}}else if(o===Ac.current){if(c=o.alternate,c===null)throw Error(M(387));c.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(vr):e=[vr])}o=o.return}return e!==null&&Oh(t,e,a,n),t.flags|=262144,e!==null}function Uc(e){for(e=e.firstContext;e!==null;){if(!fa(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Pi(e){lo=e,Tn=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function St(e){return ey(lo,e)}function Pl(e,t){return lo===null&&Pi(e),ey(e,t)}function ey(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},Tn===null){if(e===null)throw Error(M(308));Tn=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Tn=Tn.next=t;return a}var EN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},CN=ht.unstable_scheduleCallback,zN=ht.unstable_NormalPriority,at={$$typeof:cn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Im(){return{controller:new EN,data:new Map,refCount:0}}function Zs(e){e.refCount--,e.refCount===0&&CN(zN,function(){e.controller.abort()})}function Ff(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var n=t[e];a.indexOf(n)===-1&&a.push(n)}}}var ds=null;function AN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var fs=null,Vh=0,Wi=0,tr=null;function MN(e,t){if(fs===null){var a=fs=[];Vh=0,Wi=hp(),tr={status:"pending",value:void 0,then:function(n){a.push(n)}}}return Vh++,t.then(Pf,Pf),t}function Pf(){if(--Vh===0&&(ds=null,fs!==null)){tr!==null&&(tr.status="fulfilled");var e=fs;fs=null,Wi=0,tr=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function RN(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(n.status="rejected",n.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),n}var Wf=ee.S;ee.S=function(e,t){if(vw=ha(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&MN(e,t),ds!==null)for(var a=gr;a!==null;)Ff(a,ds),a=a.next;if(a=e.types,a!==null){for(var n=gr;n!==null;)Ff(n,a),n=n.next;if(Wi!==0){n=ds,n===null&&(n=ds=[]);for(var o=0;o<a.length;o++){var s=a[o];n.indexOf(s)===-1&&n.push(s)}}}Wf!==null&&Wf(e,t)};var Qi=fn(null);function Um(){var e=Qi.current;return e!==null?e:Oe.pooledCache}function bc(e,t){t===null?Ie(Qi,Qi.current):Ie(Qi,t.pool)}function ty(){var e=Um();return e===null?null:{parent:at._currentValue,pool:e}}var Nr=Error(M(460)),qm=Error(M(474)),mu=Error(M(542)),qc={then:function(){}};function eb(e){return e=e.status,e==="fulfilled"||e==="rejected"}function ay(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(un,un),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,ab(e),e===void 0&&!("reason"in t)?Error(M(600)):e;default:if(typeof t.status=="string")t.then(un,un);else{if(e=Oe,e!==null&&100<e.shellSuspendCounter)throw Error(M(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=n}},function(n){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,ab(e),e}throw Zi=t,Nr}}function Bi(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Zi=a,Nr):a}}var Zi=null;function tb(){if(Zi===null)throw Error(M(459));var e=Zi;return Zi=null,e}function ab(e){if(e===Nr||e===mu)throw Error(M(483))}var ar=null,Rs=0;function Wl(e){var t=Rs;return Rs+=1,ar===null&&(ar=[]),ay(ar,e,t)}function Zn(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function ec(e,t){throw t.$$typeof===hx?Error(M(525)):(e=Object.prototype.toString.call(t),Error(M(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function ny(e){function t(y,v){if(e){var b=y.deletions;b===null?(y.deletions=[v],y.flags|=16):b.push(v)}}function a(y,v){if(!e)return null;for(;v!==null;)t(y,v),v=v.sibling;return null}function n(y){for(var v=new Map;y!==null;)y.key===null?v.set(y.index,y):v.set(y.key,y),y=y.sibling;return v}function o(y,v){return y=kn(y,v),y.index=0,y.sibling=null,y}function s(y,v,b){return y.index=b,e?(b=y.alternate,b!==null?(b=b.index,b<v?(y.flags|=2,v):b):(y.flags|=134217730,v)):(y.flags|=1048576,v)}function c(y){return e&&y.alternate===null&&(y.flags|=134217730),y}function d(y,v,b,S){return v===null||v.tag!==6?(v=Qd(b,y.mode,S),v.return=y,v):(v=o(v,b),v.return=y,v)}function h(y,v,b,S){var O=b.type;return O===Bo?(y=w(y,v,b.props.children,S,b.key),Zn(y,b),y):v!==null&&(v.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Fn&&Bi(O)===v.type)?(v=o(v,b.props),Zn(v,b),v.return=y,v):(v=gc(b.type,b.key,b.props,null,y.mode,S),Zn(v,b),v.return=y,v)}function g(y,v,b,S){return v===null||v.tag!==4||v.stateNode.containerInfo!==b.containerInfo||v.stateNode.implementation!==b.implementation?(v=Zd(b,y.mode,S),v.return=y,v):(v=o(v,b.children||[]),v.return=y,v)}function w(y,v,b,S,O){return v===null||v.tag!==7?(v=Xi(b,y.mode,S,O),v.return=y,v):(v=o(v,b),v.return=y,v)}function N(y,v,b){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return v=Qd(""+v,y.mode,b),v.return=y,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Gl:return b=gc(v.type,v.key,v.props,null,y.mode,b),Zn(b,v),b.return=y,b;case ls:return v=Zd(v,y.mode,b),v.return=y,v;case Fn:return v=Bi(v),N(y,v,b)}if(cs(v)||as(v))return v=Xi(v,y.mode,b,null),v.return=y,v;if(typeof v.then=="function")return N(y,Wl(v),b);if(v.$$typeof===cn)return N(y,Pl(y,v),b);ec(y,v)}return null}function f(y,v,b,S){var O=v!==null?v.key:null;if(typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint")return O!==null?null:d(y,v,""+b,S);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case Gl:return b.key===O?h(y,v,b,S):null;case ls:return b.key===O?g(y,v,b,S):null;case Fn:return b=Bi(b),f(y,v,b,S)}if(cs(b)||as(b))return O!==null?null:w(y,v,b,S,null);if(typeof b.then=="function")return f(y,v,Wl(b),S);if(b.$$typeof===cn)return f(y,v,Pl(y,b),S);ec(y,b)}return null}function $(y,v,b,S,O){if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return y=y.get(b)||null,d(v,y,""+S,O);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case Gl:return y=y.get(S.key===null?b:S.key)||null,h(v,y,S,O);case ls:return y=y.get(S.key===null?b:S.key)||null,g(v,y,S,O);case Fn:return S=Bi(S),$(y,v,b,S,O)}if(cs(S)||as(S))return y=y.get(b)||null,w(v,y,S,O,null);if(typeof S.then=="function")return $(y,v,b,Wl(S),O);if(S.$$typeof===cn)return $(y,v,b,Pl(v,S),O);ec(v,S)}return null}function A(y,v,b,S){for(var O=null,F=null,I=v,B=v=0,ve=null;I!==null&&B<b.length;B++){I.index>B?(ve=I,I=null):ve=I.sibling;var Y=f(y,I,b[B],S);if(Y===null){I===null&&(I=ve);break}e&&I&&Y.alternate===null&&t(y,I),v=s(Y,v,B),F===null?O=Y:F.sibling=Y,F=Y,I=ve}if(B===b.length)return a(y,I),ce&&Sn(y,B),O;if(I===null){for(;B<b.length;B++)I=N(y,b[B],S),I!==null&&(v=s(I,v,B),F===null?O=I:F.sibling=I,F=I);return ce&&Sn(y,B),O}for(I=n(I);B<b.length;B++)ve=$(I,y,B,b[B],S),ve!==null&&(e&&(Y=ve.alternate,Y!==null&&I.delete(Y.key===null?B:Y.key)),v=s(ve,v,B),F===null?O=ve:F.sibling=ve,F=ve);return e&&I.forEach(function(Ne){return t(y,Ne)}),ce&&Sn(y,B),O}function k(y,v,b,S){if(b==null)throw Error(M(151));for(var O=null,F=null,I=v,B=v=0,ve=null,Y=b.next();I!==null&&!Y.done;B++,Y=b.next()){I.index>B?(ve=I,I=null):ve=I.sibling;var Ne=f(y,I,Y.value,S);if(Ne===null){I===null&&(I=ve);break}e&&I&&Ne.alternate===null&&t(y,I),v=s(Ne,v,B),F===null?O=Ne:F.sibling=Ne,F=Ne,I=ve}if(Y.done)return a(y,I),ce&&Sn(y,B),O;if(I===null){for(;!Y.done;B++,Y=b.next())Y=N(y,Y.value,S),Y!==null&&(v=s(Y,v,B),F===null?O=Y:F.sibling=Y,F=Y);return ce&&Sn(y,B),O}for(I=n(I);!Y.done;B++,Y=b.next())Y=$(I,y,B,Y.value,S),Y!==null&&(e&&(ve=Y.alternate,ve!==null&&I.delete(ve.key===null?B:ve.key)),v=s(Y,v,B),F===null?O=Y:F.sibling=Y,F=Y);return e&&I.forEach(function(it){return t(y,it)}),ce&&Sn(y,B),O}function _(y,v,b,S){if(typeof b=="object"&&b!==null&&b.type===Bo&&b.key===null&&b.props.ref===void 0&&(b=b.props.children),typeof b=="object"&&b!==null){switch(b.$$typeof){case Gl:e:{for(var O=b.key;v!==null;){if(v.key===O){if(O=b.type,O===Bo){if(v.tag===7){a(y,v.sibling),S=o(v,b.props.children),Zn(S,b),S.return=y,y=S;break e}}else if(v.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Fn&&Bi(O)===v.type){a(y,v.sibling),S=o(v,b.props),Zn(S,b),S.return=y,y=S;break e}a(y,v);break}else t(y,v);v=v.sibling}b.type===Bo?(S=Xi(b.props.children,y.mode,S,b.key),Zn(S,b),S.return=y,y=S):(S=gc(b.type,b.key,b.props,null,y.mode,S),Zn(S,b),S.return=y,y=S)}return c(y);case ls:e:{for(O=b.key;v!==null;){if(v.key===O)if(v.tag===4&&v.stateNode.containerInfo===b.containerInfo&&v.stateNode.implementation===b.implementation){a(y,v.sibling),S=o(v,b.children||[]),S.return=y,y=S;break e}else{a(y,v);break}else t(y,v);v=v.sibling}S=Zd(b,y.mode,S),S.return=y,y=S}return c(y);case Fn:return b=Bi(b),_(y,v,b,S)}if(cs(b))return A(y,v,b,S);if(as(b)){if(O=as(b),typeof O!="function")throw Error(M(150));return b=O.call(b),k(y,v,b,S)}if(typeof b.then=="function")return _(y,v,Wl(b),S);if(b.$$typeof===cn)return _(y,v,Pl(y,b),S);ec(y,b)}return typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint"?(b=""+b,v!==null&&v.tag===6?(a(y,v.sibling),S=o(v,b),S.return=y,y=S):(a(y,v),S=Qd(b,y.mode,S),S.return=y,y=S),c(y)):a(y,v)}return function(y,v,b,S){try{Rs=0;var O=_(y,v,b,S);return ar=null,O}catch(I){if(I===Nr||I===mu)throw I;var F=Ft(29,I,null,y.mode);return F.lanes=S,F.return=y,F}}}var eo=ny(!0),iy=ny(!1),Pn=!1;function Bm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Dh(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function li(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ci(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,($e&2)!==0){var o=n.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),n.pending=t,t=_c(e),Kv(e,null,a),t}return du(e,n,t,a),_c(e)}function bs(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,$v(e,a)}}function Jd(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var o=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?o=s=c:s=s.next=c,a=a.next}while(a!==null);s===null?o=s=t:s=s.next=t}else o=s=t;a={baseState:n.baseState,firstBaseUpdate:o,lastBaseUpdate:s,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var _h=!1;function vs(){if(_h){var e=tr;if(e!==null)throw e}}function ys(e,t,a,n){_h=!1;var o=e.updateQueue;Pn=!1;var s=o.firstBaseUpdate,c=o.lastBaseUpdate,d=o.shared.pending;if(d!==null){o.shared.pending=null;var h=d,g=h.next;h.next=null,c===null?s=g:c.next=g,c=h;var w=e.alternate;w!==null&&(w=w.updateQueue,d=w.lastBaseUpdate,d!==c&&(d===null?w.firstBaseUpdate=g:d.next=g,w.lastBaseUpdate=h))}if(s!==null){var N=o.baseState;c=0,w=g=h=null,d=s;do{var f=d.lane&-536870913,$=f!==d.lane;if($?(pe&f)===f:(n&f)===f){f!==0&&f===Wi&&(_h=!0),w!==null&&(w=w.next={lane:0,tag:d.tag,payload:d.payload,callback:null,next:null});e:{var A=e,k=d;f=t;var _=a;switch(k.tag){case 1:if(A=k.payload,typeof A=="function"){N=A.call(_,N,f);break e}N=A;break e;case 3:A.flags=A.flags&-65537|128;case 0:if(A=k.payload,f=typeof A=="function"?A.call(_,N,f):A,f==null)break e;N=Ve({},N,f);break e;case 2:Pn=!0}}f=d.callback,f!==null&&(e.flags|=64,$&&(e.flags|=8192),$=o.callbacks,$===null?o.callbacks=[f]:$.push(f))}else $={lane:f,tag:d.tag,payload:d.payload,callback:d.callback,next:null},w===null?(g=w=$,h=N):w=w.next=$,c|=f;if(d=d.next,d===null){if(d=o.shared.pending,d===null)break;$=d,d=$.next,$.next=null,o.lastBaseUpdate=$,o.shared.pending=null}}while(!0);w===null&&(h=N),o.baseState=h,o.firstBaseUpdate=g,o.lastBaseUpdate=w,s===null&&(o.shared.lanes=0),wi|=c,e.lanes=c,e.memoizedState=N}}function oy(e,t){if(typeof e!="function")throw Error(M(191,e));e.call(t)}function ry(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)oy(a[e],t)}var vi=fn(null),Bc=fn(0);function nb(e,t){e=On,Ie(Bc,e),Ie(vi,t),On=e|t.baseLanes}function Hh(){Ie(Bc,On),Ie(vi,vi.current)}function Lm(){On=Bc.current,Tt(vi),Tt(Bc)}var Ct=fn(null),Rt=null;function ui(e){var t=e.alternate;Ie(kt,kt.current&1),Ie(Ct,e),Rt===null&&(t===null||vi.current!==null||t.memoizedState!==null)&&(Rt=e)}function Ih(e){Ie(kt,kt.current),Ie(Ct,e),Rt===null&&(Rt=e)}function sy(e){e.tag===22?(Ie(kt,kt.current),Ie(Ct,e),Rt===null&&(Rt=e)):di()}function di(){Ie(kt,kt.current),Ie(Ct,Ct.current)}function ca(e){Tt(Ct),Rt===e&&(Rt=null),Tt(kt)}var kt=fn(0);function Os(e,t){Ie(Ct,Ct.current),Ie(kt,t)}function jm(e){Tt(kt),Tt(Ct),Rt===e&&(Rt=null)}function Lc(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||vm(a)||fp(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var An=0,se=null,Ae=null,tt=null,jc=!1,nr=!1,to=!1,Gc=0,Vs=0,ir=null,ON=0;function Ze(){throw Error(M(321))}function Gm(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!fa(e[a],t[a]))return!1;return!0}function Ym(e,t,a,n,o,s){return An=s,se=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,ee.H=e===null||e.memoizedState===null?Iy:Uy,to=!1,s=a(n,o),to=!1,nr&&(s=cy(t,a,n,o)),ly(e),s}function ly(e){ee.H=Yc;var t=Ae!==null&&Ae.next!==null;if(An=0,tt=Ae=se=null,jc=!1,Vs=0,ir=null,t)throw Error(M(300));e===null||nt||(e=e.dependencies,e!==null&&Uc(e)&&(nt=!0))}function cy(e,t,a,n){se=e;var o=0;do{if(nr&&(ir=null),Vs=0,nr=!1,25<=o)throw Error(M(301));if(o+=1,tt=Ae=null,e.updateQueue!=null){var s=e.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}ee.H=BN,s=t(a,n)}while(nr);return s}function VN(){var e=ee.H,t=e.useState()[0];return t=typeof t.then=="function"?Ks(t):t,e=e.useState()[0],(Ae!==null?Ae.memoizedState:null)!==e&&(se.flags|=1024),t}function Xm(){var e=Gc!==0;return Gc=0,e}function Qm(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Zm(e){if(jc){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}jc=!1}An=0,tt=Ae=se=null,nr=!1,Vs=Gc=0,ir=null}function Bt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return tt===null?se.memoizedState=tt=e:tt=tt.next=e,tt}function We(){if(Ae===null){var e=se.alternate;e=e!==null?e.memoizedState:null}else e=Ae.next;var t=tt===null?se.memoizedState:tt.next;if(t!==null)tt=t,Ae=e;else{if(e===null)throw se.alternate===null?Error(M(467)):Error(M(310));Ae=e,e={memoizedState:Ae.memoizedState,baseState:Ae.baseState,baseQueue:Ae.baseQueue,queue:Ae.queue,next:null},tt===null?se.memoizedState=tt=e:tt=tt.next=e}return tt}function pu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ks(e){var t=Vs;return Vs+=1,ir===null&&(ir=[]),e=ay(ir,e,t),t=se,(tt===null?t.memoizedState:tt.next)===null&&(t=t.alternate,ee.H=t===null||t.memoizedState===null?Iy:Uy),e}function gu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Ks(e);if(e.$$typeof===gx)return;if(e.$$typeof===cn)return St(e)}throw Error(M(438,String(e)))}function Km(e){var t=null,a=se.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=se.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=pu(),se.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=px;return t.index++,a}function Mn(e,t){return typeof t=="function"?t(e):t}function vc(e){var t=We();return Jm(t,Ae,e)}function Jm(e,t,a){var n=e.queue;if(n===null)throw Error(M(311));n.lastRenderedReducer=a;var o=e.baseQueue,s=n.pending;if(s!==null){if(o!==null){var c=o.next;o.next=s.next,s.next=c}t.baseQueue=o=s,n.pending=null}if(s=e.baseState,o===null)e.memoizedState=s;else{t=o.next;var d=c=null,h=null,g=t,w=!1;do{var N=g.lane&-536870913;if(N!==g.lane?(pe&N)===N:(An&N)===N){var f=g.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),N===Wi&&(w=!0);else if((An&f)===f){g=g.next,f===Wi&&(w=!0);continue}else N={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(d=h=N,c=s):h=h.next=N,se.lanes|=f,wi|=f;N=g.action,to&&a(s,N),s=g.hasEagerState?g.eagerState:a(s,N)}else f={lane:N,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(d=h=f,c=s):h=h.next=f,se.lanes|=N,wi|=N;g=g.next}while(g!==null&&g!==t);if(h===null?c=s:h.next=d,!fa(s,e.memoizedState)&&(nt=!0,w&&(a=tr,a!==null)))throw a;e.memoizedState=s,e.baseState=c,e.baseQueue=h,n.lastRenderedState=s}return o===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function Fd(e){var t=We(),a=t.queue;if(a===null)throw Error(M(311));a.lastRenderedReducer=e;var n=a.dispatch,o=a.pending,s=t.memoizedState;if(o!==null){a.pending=null;var c=o=o.next;do s=e(s,c.action),c=c.next;while(c!==o);fa(s,t.memoizedState)||(nt=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),a.lastRenderedState=s}return[s,n]}function uy(e,t,a){var n=se,o=We(),s=ce;if(s){if(a===void 0)throw Error(M(407));a=a()}else a=t();var c=!fa((Ae||o).memoizedState,a);if(c&&(o.memoizedState=a,nt=!0),o=o.queue,Fm(my.bind(null,n,o,e),[e]),e=o.getSnapshot!==t||c||tt!==null&&(tt.memoizedState.tag&1)!==0,dr(e?9:8,{destroy:void 0},hy.bind(null,n,o,a,t),null),e){if(n.flags|=2048,Oe===null)throw Error(M(349));s||(An&127)!==0||dy(n,t,a)}return a}function dy(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=se.updateQueue,t===null?(t=pu(),se.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function hy(e,t,a,n){t.value=a,t.getSnapshot=n,py(t)&&gy(e)}function my(e,t,a){return a(function(){py(t)&&gy(e)})}function py(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!fa(e,a)}catch{return!0}}function gy(e){var t=so(e,2);t!==null&&Pt(t,e,2)}function Uh(e){var t=Bt();if(typeof e=="function"){var a=e;if(e=a(),to){ei(!0);try{a()}finally{ei(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Mn,lastRenderedState:e},t}function fy(e,t,a,n){return e.baseState=a,Jm(e,Ae,typeof n=="function"?n:Mn)}function DN(e,t,a,n,o){if(bu(e))throw Error(M(485));if(e=t.action,e!==null){var s={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){s.listeners.push(c)}};ee.T!==null?a(!0):s.isTransition=!1,n(s),a=t.pending,a===null?(s.next=t.pending=s,by(t,s)):(s.next=a.next,t.pending=a.next=s)}}function by(e,t){var a=t.action,n=t.payload,o=e.state;if(t.isTransition){var s=ee.T,c={};c.types=s!==null?s.types:null,ee.T=c;try{var d=a(o,n),h=ee.S;h!==null&&h(c,d),ib(e,t,d)}catch(g){qh(e,t,g)}finally{s!==null&&c.types!==null&&(s.types=c.types),ee.T=s}}else try{s=a(o,n),ib(e,t,s)}catch(g){qh(e,t,g)}}function ib(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){ob(e,t,n)},function(n){return qh(e,t,n)}):ob(e,t,a)}function ob(e,t,a){t.status="fulfilled",t.value=a,vy(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,by(e,a)))}function qh(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,vy(t),t=t.next;while(t!==n)}e.action=null}function vy(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function yy(e,t){return t}function rb(e,t){if(ce){var a=Oe.formState;if(a!==null){e:{var n=se;if(ce){if(He){t:{for(var o=He,s=Ma;o.nodeType!==8;){if(!s){o=null;break t}if(o=Ra(o.nextSibling),o===null){o=null;break t}}s=o.data,o=s==="F!"||s==="F"?o:null}if(o){He=Ra(o.nextSibling),n=o.data==="F!";break e}}bi(n)}n=!1}n&&(t=a[0])}}return a=Bt(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:yy,lastRenderedState:t},a.queue=n,a=Dy.bind(null,se,n),n.dispatch=a,n=Uh(!1),s=tp.bind(null,se,!1,n.queue),n=Bt(),o={state:t,dispatch:null,action:e,pending:null},n.queue=o,a=DN.bind(null,se,o,s,a),o.dispatch=a,n.memoizedState=e,[t,a,!1]}function sb(e){var t=We();return wy(t,Ae,e)}function wy(e,t,a){if(t=Jm(e,t,yy)[0],e=vc(Mn)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=Ks(t)}catch(c){throw c===Nr?mu:c}else n=t;t=We();var o=t.queue,s=o.dispatch;return a!==t.memoizedState&&(se.flags|=2048,dr(9,{destroy:void 0},_N.bind(null,o,a),null)),[n,s,e]}function _N(e,t){e.action=t}function lb(e){var t=We(),a=Ae;if(a!==null)return wy(t,a,e);We(),t=t.memoizedState,a=We();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function dr(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=se.updateQueue,t===null&&(t=pu(),se.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function $y(){return We().memoizedState}function yc(e,t,a,n){var o=Bt();se.flags|=e,o.memoizedState=dr(1|t,{destroy:void 0},a,n===void 0?null:n)}function fu(e,t,a,n){var o=We();n=n===void 0?null:n;var s=o.memoizedState.inst;Ae!==null&&n!==null&&Gm(n,Ae.memoizedState.deps)?o.memoizedState=dr(t,s,a,n):(se.flags|=e,o.memoizedState=dr(1|t,s,a,n))}function cb(e,t){yc(8390656,8,e,t)}function Fm(e,t){fu(2048,8,e,t)}function HN(e){se.flags|=4;var t=se.updateQueue;if(t===null)t=pu(),se.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function xy(e){var t=We().memoizedState;return HN({ref:t,nextImpl:e}),function(){if(($e&2)!==0)throw Error(M(440));return t.impl.apply(void 0,arguments)}}function Ny(e,t){return fu(4,2,e,t)}function Sy(e,t){return fu(4,4,e,t)}function Ty(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function ky(e,t,a){a=a!=null?a.concat([e]):null,fu(4,4,Ty.bind(null,t,e),a)}function Pm(){}function Ey(e,t){var a=We();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&Gm(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function Cy(e,t){var a=We();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&Gm(t,n[1]))return n[0];if(n=e(),to){ei(!0);try{e()}finally{ei(!1)}}return a.memoizedState=[n,t],n}function Wm(e,t,a){return a===void 0||(An&1073741824)!==0&&(pe&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=ww(),se.lanes|=e,wi|=e,a)}function zy(e,t,a,n){return fa(a,t)?a:vi.current!==null?(e=Wm(e,a,n),fa(e,t)||(nt=!0),e):(An&106)===0||(An&1073741824)!==0&&(pe&261930)===0?(nt=!0,e.memoizedState=a):(e=ww(),se.lanes|=e,wi|=e,t)}function Ay(e,t,a,n,o){var s=xe.p;xe.p=s!==0&&8>s?s:8;var c=ee.T,d={};d.types=c!==null?c.types:null,ee.T=d,tp(e,!1,t,a);try{var h=o(),g=ee.S;if(g!==null&&g(d,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var w=RN(h,n);ws(e,t,w,ga(e))}else ws(e,t,n,ga(e))}catch(N){ws(e,t,{then:function(){},status:"rejected",reason:N},ga())}finally{xe.p=s,c!==null&&d.types!==null&&(c.types=d.types),ee.T=c}}function IN(){}function Bh(e,t,a,n){if(e.tag!==5)throw Error(M(476));var o=My(e).queue;Ay(e,o,t,Yi,a===null?IN:function(){return Ry(e),a(n)})}function My(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Yi,baseState:Yi,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Mn,lastRenderedState:Yi},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Mn,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Ry(e){var t=My(e);t.next===null&&(t=e.alternate.memoizedState),ws(e,t.next.queue,{},ga())}function ep(){return St(vr)}function Oy(){return We().memoizedState}function Vy(){return We().memoizedState}function UN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=ga();e=li(a);var n=ci(t,e,a);n!==null&&(Pt(n,t,a),bs(n,t,a)),t={cache:Im()},e.payload=t;return}t=t.return}}function qN(e,t,a){var n=ga();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},bu(e)?_y(t,a):(a=Dm(e,t,a,n),a!==null&&(Pt(a,e,n),Hy(a,t,n)))}function Dy(e,t,a){var n=ga();ws(e,t,a,n)}function ws(e,t,a,n){var o={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(bu(e))_y(t,o);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var c=t.lastRenderedState,d=s(c,a);if(o.hasEagerState=!0,o.eagerState=d,fa(d,c))return du(e,t,o,0),Oe===null&&uu(),!1}catch{}if(a=Dm(e,t,o,n),a!==null)return Pt(a,e,n),Hy(a,t,n),!0}return!1}function tp(e,t,a,n){if(n={lane:2,revertLane:hp(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},bu(e)){if(t)throw Error(M(479))}else t=Dm(e,a,n,2),t!==null&&Pt(t,e,2)}function bu(e){var t=e.alternate;return e===se||t!==null&&t===se}function _y(e,t){nr=jc=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Hy(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,$v(e,a)}}var Yc={readContext:St,use:gu,useCallback:Ze,useContext:Ze,useEffect:Ze,useImperativeHandle:Ze,useLayoutEffect:Ze,useInsertionEffect:Ze,useMemo:Ze,useReducer:Ze,useRef:Ze,useState:Ze,useDebugValue:Ze,useDeferredValue:Ze,useTransition:Ze,useSyncExternalStore:Ze,useId:Ze,useHostTransitionStatus:Ze,useFormState:Ze,useActionState:Ze,useOptimistic:Ze,useMemoCache:Ze,useCacheRefresh:Ze,useEffectEvent:Ze},Iy={readContext:St,use:gu,useCallback:function(e,t){return Bt().memoizedState=[e,t===void 0?null:t],e},useContext:St,useEffect:cb,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,yc(4194308,4,Ty.bind(null,t,e),a)},useLayoutEffect:function(e,t){return yc(4194308,4,e,t)},useInsertionEffect:function(e,t){yc(4,2,e,t)},useMemo:function(e,t){var a=Bt();t=t===void 0?null:t;var n=e();if(to){ei(!0);try{e()}finally{ei(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=Bt();if(a!==void 0){var o=a(t);if(to){ei(!0);try{a(t)}finally{ei(!1)}}}else o=t;return n.memoizedState=n.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},n.queue=e,e=e.dispatch=qN.bind(null,se,e),[n.memoizedState,e]},useRef:function(e){var t=Bt();return e={current:e},t.memoizedState=e},useState:function(e){e=Uh(e);var t=e.queue,a=Dy.bind(null,se,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:Pm,useDeferredValue:function(e,t){var a=Bt();return Wm(a,e,t)},useTransition:function(){var e=Uh(!1);return e=Ay.bind(null,se,e.queue,!0,!1),Bt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=se,o=Bt();if(ce){if(a===void 0)throw Error(M(407));a=a()}else{if(a=t(),Oe===null)throw Error(M(349));(pe&127)!==0||dy(n,t,a)}o.memoizedState=a;var s={value:a,getSnapshot:t};return o.queue=s,cb(my.bind(null,n,s,e),[e]),n.flags|=2048,dr(9,{destroy:void 0},hy.bind(null,n,s,a,t),null),a},useId:function(){var e=Bt(),t=Oe.identifierPrefix;if(ce){var a=hn,n=dn;a=(n&~(1<<32-pa(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Gc++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=ON++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:ep,useFormState:rb,useActionState:rb,useOptimistic:function(e){var t=Bt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=tp.bind(null,se,!0,a),a.dispatch=t,[e,t]},useMemoCache:Km,useCacheRefresh:function(){return Bt().memoizedState=UN.bind(null,se)},useEffectEvent:function(e){var t=Bt(),a={impl:e};return t.memoizedState=a,function(){if(($e&2)!==0)throw Error(M(440));return a.impl.apply(void 0,arguments)}}},Uy={readContext:St,use:gu,useCallback:Ey,useContext:St,useEffect:Fm,useImperativeHandle:ky,useInsertionEffect:Ny,useLayoutEffect:Sy,useMemo:Cy,useReducer:vc,useRef:$y,useState:function(){return vc(Mn)},useDebugValue:Pm,useDeferredValue:function(e,t){var a=We();return zy(a,Ae.memoizedState,e,t)},useTransition:function(){var e=vc(Mn)[0],t=We().memoizedState;return[typeof e=="boolean"?e:Ks(e),t]},useSyncExternalStore:uy,useId:Oy,useHostTransitionStatus:ep,useFormState:sb,useActionState:sb,useOptimistic:function(e,t){var a=We();return fy(a,Ae,e,t)},useMemoCache:Km,useCacheRefresh:Vy,useEffectEvent:xy},BN={readContext:St,use:gu,useCallback:Ey,useContext:St,useEffect:Fm,useImperativeHandle:ky,useInsertionEffect:Ny,useLayoutEffect:Sy,useMemo:Cy,useReducer:Fd,useRef:$y,useState:function(){return Fd(Mn)},useDebugValue:Pm,useDeferredValue:function(e,t){var a=We();return Ae===null?Wm(a,e,t):zy(a,Ae.memoizedState,e,t)},useTransition:function(){var e=Fd(Mn)[0],t=We().memoizedState;return[typeof e=="boolean"?e:Ks(e),t]},useSyncExternalStore:uy,useId:Oy,useHostTransitionStatus:ep,useFormState:lb,useActionState:lb,useOptimistic:function(e,t){var a=We();return Ae!==null?fy(a,Ae,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Km,useCacheRefresh:Vy,useEffectEvent:xy};function Pd(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:Ve({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Lh={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=ga(),o=li(n);o.payload=t,a!=null&&(o.callback=a),t=ci(e,o,n),t!==null&&(Pt(t,e,n),bs(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=ga(),o=li(n);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=ci(e,o,n),t!==null&&(Pt(t,e,n),bs(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=ga(),n=li(a);n.tag=2,t!=null&&(n.callback=t),t=ci(e,n,a),t!==null&&(Pt(t,e,a),bs(t,e,a))}};function ub(e,t,a,n,o,s,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,s,c):t.prototype&&t.prototype.isPureReactComponent?!zs(a,n)||!zs(o,s):!0}function db(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&Lh.enqueueReplaceState(t,t.state,null)}function ao(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=Ve({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function qy(e){Dc(e)}function By(e){console.error(e)}function Ly(e){Dc(e)}function Xc(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function hb(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function jh(e,t,a){return a=li(a),a.tag=3,a.payload={element:null},a.callback=function(){Xc(e,t)},a}function jy(e){return e=li(e),e.tag=3,e}function Gy(e,t,a,n){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var s=n.value;e.payload=function(){return o(s)},e.callback=function(){hb(t,a,n)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){hb(t,a,n),typeof o!="function"&&(hi===null?hi=new Set([this]):hi.add(this));var d=n.stack;this.componentDidCatch(n.value,{componentStack:d!==null?d:""})})}function LN(e,t,a,n,o){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&Fi(t,a,o,!0),a=Ct.current,a!==null){switch(a.tag){case 31:case 13:case 19:return Rt===null?eu():a.alternate===null&&Ke===0&&(Ke=3),a.flags&=-257,a.flags|=65536,a.lanes=o,n===qc?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),oh(e,n,o)),!1;case 22:return a.flags|=65536,n===qc?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),oh(e,n,o)),!1}throw Error(M(435,a.tag))}return oh(e,n,o),eu(),!1}if(ce)return t=Ct.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,n!==Mh&&(e=Error(M(422),{cause:n}),Ms(Aa(e,a)))):(n!==Mh&&(t=Error(M(423),{cause:n}),Ms(Aa(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,n=Aa(n,a),o=jh(e.stateNode,n,o),Jd(e,o),Ke!==4&&(Ke=2)),!1;var s=Error(M(520),{cause:n});if(s=Aa(s,a),Ss===null?Ss=[s]:Ss.push(s),Ke!==4&&(Ke=2),t===null)return!0;n=Aa(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=jh(a.stateNode,n,e),Jd(a,e),!1;case 1:if(t=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(hi===null||!hi.has(s))))return a.flags|=65536,o&=-o,a.lanes|=o,o=jy(o),Gy(o,e,a,n),Jd(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var ap=Error(M(461)),nt=!1;function ut(e,t,a,n){t.child=e===null?iy(t,null,a,n):eo(t,e.child,a,n)}function mb(e,t,a,n,o){a=a.render;var s=t.ref;if("ref"in n){var c={};for(var d in n)d!=="ref"&&(c[d]=n[d])}else c=n;return Pi(t),n=Ym(e,t,a,c,s,o),d=Xm(),e!==null&&!nt?(Qm(e,t,o),Rn(e,t,o)):(ce&&d&&hu(t),t.flags|=1,ut(e,t,n,o),t.child)}function pb(e,t,a,n,o){if(e===null){var s=a.type;return typeof s=="function"&&!_m(s)&&s.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=s,Yy(e,t,s,n,o)):(e=gc(a.type,null,n,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!ip(e,o)){var c=s.memoizedProps;if(a=a.compare,a=a!==null?a:zs,a(c,n)&&e.ref===t.ref)return Rn(e,t,o)}return t.flags|=1,e=kn(s,n),e.ref=t.ref,e.return=t,t.child=e}function Yy(e,t,a,n,o){if(e!==null){var s=e.memoizedProps;if(zs(s,n)&&e.ref===t.ref)if(nt=!1,t.pendingProps=n=s,ip(e,o))(e.flags&131072)!==0&&(nt=!0);else return t.lanes=e.lanes,Rn(e,t,o)}return Gh(e,t,a,n,o)}function Xy(e,t,a,n){var o=n.children,s=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(s=s!==null?s.baseLanes|a:a,e!==null){for(n=t.child=e.child,o=0;n!==null;)o=o|n.lanes|n.childLanes,n=n.sibling;n=o&~s}else n=0,t.child=null;return gb(e,t,s,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&bc(t,s!==null?s.cachePool:null),s!==null?nb(t,s):Hh(),sy(t);else return n=t.lanes=536870912,gb(e,t,s!==null?s.baseLanes|a:a,a,n)}else s!==null?(bc(t,s.cachePool),nb(t,s),di(),t.memoizedState=null):(e!==null&&bc(t,null),Hh(),di());return ut(e,t,o,a),t.child}function $s(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function gb(e,t,a,n,o){var s=Um();return s=s===null?null:{parent:at._currentValue,pool:s},t.memoizedState={baseLanes:a,cachePool:s},e!==null&&bc(t,null),Hh(),sy(t),e!==null&&Fi(e,t,n,!0),t.childLanes=o,null}function wc(e,t){return t=vu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function fb(e,t,a){return eo(t,e.child,null,a),e=wc(t,t.pendingProps),e.flags|=2,ca(t),t.memoizedState=null,e}function jN(e,t,a){var n=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(ce){if(n.mode==="hidden")return e=wc(t,n),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},$s(null,e);if(Ih(t),(e=He)?(e=Xw(e,Ma),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:fi!==null?{id:dn,overflow:hn}:null,retryLane:536870912,hydrationErrors:null},a=Fv(e),a.return=t,t.child=a,vt=t,He=null)):e=null,e===null)throw bi(t);return t.lanes=536870912,null}return wc(t,n)}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(Ih(t),o)if(t.flags&256)t.flags&=-257,t=fb(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(M(558));else if(nt||Fi(e,t,a,!1),o=(a&e.childLanes)!==0,nt||o){if(vi.current===null){if(n=Oe,n!==null&&(c=xv(n,a),c!==0&&c!==s.retryLane))throw s.retryLane=c,so(e,c),Pt(n,e,c),ap;eu()}t=fb(e,t,a)}else e=s.treeContext,He=Ra(c.nextSibling),vt=t,ce=!0,si=null,Ma=!1,e!==null&&Wv(t,e),t=wc(t,n),t.flags|=134221824;return t}return e=kn(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Ho(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(M(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Gh(e,t,a,n,o){return Pi(t),a=Ym(e,t,a,n,void 0,o),n=Xm(),e!==null&&!nt?(Qm(e,t,o),Rn(e,t,o)):(ce&&n&&hu(t),t.flags|=1,ut(e,t,a,o),t.child)}function bb(e,t,a,n,o,s){return Pi(t),t.updateQueue=null,a=cy(t,n,a,o),ly(e),n=Xm(),e!==null&&!nt?(Qm(e,t,s),Rn(e,t,s)):(ce&&n&&hu(t),t.flags|=1,ut(e,t,a,s),t.child)}function vb(e,t,a,n,o){if(Pi(t),t.stateNode===null){var s=Zo,c=a.contextType;typeof c=="object"&&c!==null&&(s=St(c)),s=new a(n,s),t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Lh,t.stateNode=s,s._reactInternals=t,s=t.stateNode,s.props=n,s.state=t.memoizedState,s.refs={},Bm(t),c=a.contextType,s.context=typeof c=="object"&&c!==null?St(c):Zo,s.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(Pd(t,a,c,n),s.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(c=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),c!==s.state&&Lh.enqueueReplaceState(s,s.state,null),ys(t,n,s,o),vs(),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){s=t.stateNode;var d=t.memoizedProps,h=ao(a,d);s.props=h;var g=s.context,w=a.contextType;c=Zo,typeof w=="object"&&w!==null&&(c=St(w));var N=a.getDerivedStateFromProps;w=typeof N=="function"||typeof s.getSnapshotBeforeUpdate=="function",d=t.pendingProps!==d,w||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(d||g!==c)&&db(t,s,n,c),Pn=!1;var f=t.memoizedState;s.state=f,ys(t,n,s,o),vs(),g=t.memoizedState,d||f!==g||Pn?(typeof N=="function"&&(Pd(t,a,N,n),g=t.memoizedState),(h=Pn||ub(t,a,h,n,f,g,c))?(w||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=g),s.props=n,s.state=g,s.context=c,n=h):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{s=t.stateNode,Dh(e,t),c=t.memoizedProps,w=ao(a,c),s.props=w,N=t.pendingProps,f=s.context,g=a.contextType,h=Zo,typeof g=="object"&&g!==null&&(h=St(g)),d=a.getDerivedStateFromProps,(g=typeof d=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==N||f!==h)&&db(t,s,n,h),Pn=!1,f=t.memoizedState,s.state=f,ys(t,n,s,o),vs();var $=t.memoizedState;c!==N||f!==$||Pn||e!==null&&e.dependencies!==null&&Uc(e.dependencies)?(typeof d=="function"&&(Pd(t,a,d,n),$=t.memoizedState),(w=Pn||ub(t,a,w,n,f,$,h)||e!==null&&e.dependencies!==null&&Uc(e.dependencies))?(g||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(n,$,h),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(n,$,h)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=$),s.props=n,s.state=$,s.context=h,n=w):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),n=!1)}return s=n,Ho(e,t),n=(t.flags&128)!==0,s||n?(s=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:s.render(),t.flags|=1,e!==null&&n?(t.child=eo(t,e.child,null,o),t.child=eo(t,null,a,o)):ut(e,t,a,o),t.memoizedState=s.state,e=t.child):e=Rn(e,t,o),e}function yb(e,t,a,n){return Ji(),t.flags|=256,ut(e,t,a,n),t.child}var Yh={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Xh(e){return{baseLanes:e,cachePool:ty()}}function Qh(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=da),e}function Qy(e,t,a){var n=t.pendingProps,o=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(kt.current&2)!==0),c&&(o=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(ce){if(o?ui(t):di(),(e=He)?(e=Xw(e,Ma),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:fi!==null?{id:dn,overflow:hn}:null,retryLane:536870912,hydrationErrors:null},a=Fv(e),a.return=t,t.child=a,vt=t,He=null)):e=null,e===null)throw bi(t);return fp(e)?t.lanes=32:t.lanes=536870912,null}return s=n.children,n=n.fallback,o?(di(),o=t.mode,s=vu({mode:"hidden",children:s},o),n=Xi(n,o,a,null),s.return=t,n.return=t,s.sibling=n,t.child=s,n=t.child,n.memoizedState=Xh(a),n.childLanes=Qh(e,c,a),t.memoizedState=Yh,$s(null,n)):(ui(t),np(t,s))}var d=e.memoizedState;if(d!==null){var h=d.dehydrated;if(h!==null)return GN(e,t,s,c,n,h,d,a)}return o?(di(),o=n.fallback,s=t.mode,d=e.child,h=d.sibling,n=kn(d,{mode:"hidden",children:n.children}),n.subtreeFlags=d.subtreeFlags&1206910976,h!==null?o=kn(h,o):(o=Xi(o,s,a,null),o.flags|=2),o.return=t,n.return=t,n.sibling=o,t.child=n,$s(null,n),n=t.child,o=e.child.memoizedState,o===null?o=Xh(a):(s=o.cachePool,s!==null?(d=at._currentValue,s=s.parent!==d?{parent:d,pool:d}:s):s=ty(),o={baseLanes:o.baseLanes|a,cachePool:s}),n.memoizedState=o,n.childLanes=Qh(e,c,a),t.memoizedState=Yh,$s(e.child,n)):(ui(t),a=e.child,e=a.sibling,a=kn(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function np(e,t){return t=vu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function vu(e,t){return e=Ft(22,e,null,t),e.lanes=0,e}function tc(e,t,a){return eo(t,e.child,null,a),e=np(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function GN(e,t,a,n,o,s,c,d){if(a)return t.flags&256?(ui(t),t.flags&=-257,tc(e,t,d)):t.memoizedState!==null?(di(),t.child=e.child,t.flags|=128,null):(di(),s=o.fallback,c=t.mode,o=vu({mode:"visible",children:o.children},c),s=Xi(s,c,d,null),s.flags|=2,o.return=t,s.return=t,o.sibling=s,t.child=o,eo(t,e.child,null,d),o=t.child,o.memoizedState=Xh(d),o.childLanes=Qh(e,n,d),t.memoizedState=Yh,$s(null,o));if(ui(t),fp(s)){if(n=s.nextSibling&&s.nextSibling.dataset,n)var h=n.dgst;return n=h,n!==""&&(o=Error(M(419)),o.stack="",o.digest=n,Ms({value:o,source:null,stack:null})),tc(e,t,d)}if(nt||Fi(e,t,d,!1),n=(d&e.childLanes)!==0,nt||n){if(vi.current!==null)return tc(e,t,d);if(n=Oe,n!==null&&(o=xv(n,d),o!==0&&o!==c.retryLane))throw c.retryLane=o,so(e,o),Pt(n,e,o),ap;return vm(s)||eu(),tc(e,t,d)}return vm(s)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,He=Ra(s.nextSibling),vt=t,ce=!0,si=null,Ma=!1,e!==null&&Wv(t,e),t=np(t,o.children),t.flags|=134221824,t)}function wb(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),fc(e.return,t,a)}function $b(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Lc(a)===null&&(t=e),e=e.sibling}return t}function ac(e,t,a,n,o,s){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:o,treeForkCount:s}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=n,c.tail=a,c.tailMode=o,c.treeForkCount=s)}function Wd(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Zh(e,t,a){var n=t.pendingProps,o=n.revealOrder,s=n.tail;n=n.children;var c=kt.current;if(t.flags&128)return Os(t,c),null;var d=(c&2)!==0;if(d?(c=c&1|2,t.flags|=128):c&=1,Os(t,c),o==="backwards"&&e!==null?(Wd(e),ut(e,t,n,a),Wd(e)):ut(e,t,n,a),n=ce?As:0,!d&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&wb(e,a,t);else if(e.tag===19)wb(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=$b(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,Wd(t)),ac(t,!0,o,null,s,n);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&Lc(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}ac(t,!0,a,null,s,n);break;case"together":ac(t,!1,null,null,void 0,n);break;case"independent":t.memoizedState=null;break;default:a=$b(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),ac(t,!1,o,a,s,n)}return t.child}function xb(e,t,a){var n=t.pendingProps;return ai(t,t.type,n.value),ut(e,t,n.children,a),t.child}function Rn(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),wi|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Fi(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(M(153));if(t.child!==null){for(e=t.child,a=kn(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=kn(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function ip(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Uc(e)))}function YN(e,t,a){switch(t.tag){case 3:Mc(t,t.stateNode.containerInfo),ai(t,at,e.memoizedState.cache),Ji();break;case 27:case 5:$h(t);break;case 4:Mc(t,t.stateNode.containerInfo);break;case 10:ai(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Ih(t),null;break;case 13:var n=t.memoizedState;if(n!==null){if(n.dehydrated!==null)return ui(t),t.flags|=128,null;n=Fi(e,t,a,!1);var o=t.child.childLanes;return n||(a&o)!==0?Qy(e,t,a):(ui(t),e=Rn(e,t,a),e!==null?e.sibling:null)}ui(t);break;case 19:if(t.flags&128)return Zh(e,t,a);if(o=(e.flags&128)!==0,n=(a&t.childLanes)!==0,n||(Fi(e,t,a,!1),n=(a&t.childLanes)!==0),o){if(n)return Zh(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),Os(t,kt.current),n)break;return null;case 22:return t.lanes=0,Xy(e,t,a,t.pendingProps);case 24:ai(t,at,e.memoizedState.cache)}return Rn(e,t,a)}function Zy(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)nt=!0;else{if(!ip(e,a)&&(t.flags&128)===0)return nt=!1,YN(e,t,a);nt=(e.flags&131072)!==0}else nt=!1,ce&&(t.flags&1048576)!==0&&Pv(t,As,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=Bi(t.elementType),t.type=e,typeof e=="function")_m(e)?(n=ao(e,n),t.tag=1,t=vb(null,t,e,n,a)):(t.tag=0,t=Gh(null,t,e,n,a));else{if(e!=null){var o=e.$$typeof;if(o===Nm){t.tag=11,t=mb(null,t,e,n,a);break e}else if(o===Sm){t.tag=14,t=pb(null,t,e,n,a);break e}else if(o===cn){t.tag=10,t.type=e,t=xb(null,t,a);break e}}throw t=yh(e)||e,Error(M(306,t,""))}}return t;case 0:return Gh(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,o=ao(n,t.pendingProps),vb(e,t,n,o,a);case 3:e:{if(Mc(t,t.stateNode.containerInfo),e===null)throw Error(M(387));n=t.pendingProps;var s=t.memoizedState;o=s.element,Dh(e,t),ys(t,n,null,a);var c=t.memoizedState;if(n=c.cache,ai(t,at,n),n!==s.cache&&Oh(t,[at],a,!0),vs(),n=c.element,s.isDehydrated)if(s={element:n,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){t=yb(e,t,n,a);break e}else if(n!==o){o=Aa(Error(M(424)),t),Ms(o),t=yb(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,He=Ra(e.firstChild),vt=t,ce=!0,si=null,Ma=!0,a=iy(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Ji(),n===o){t=Rn(e,t,a);break e}ut(e,t,n,a)}t=t.child}return t;case 26:return Ho(e,t),e===null?(a=Kb(t.type,null,t.pendingProps,null))?t.memoizedState=a:ce||(t.stateNode=Hw(t.type,t.pendingProps,ri.current,t)):t.memoizedState=Kb(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return $h(t),e===null&&ce&&(n=t.stateNode=Qw(t.type,t.pendingProps,ri.current),vt=t,Ma=!0,o=He,xi(t.type)?(ym=o,He=Ra(n.firstChild)):He=o),ut(e,t,t.pendingProps.children,a),Ho(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&ce&&((o=n=He)&&(n=H5(n,t.type,t.pendingProps,Ma),n!==null?(t.stateNode=n,vt=t,He=Ra(n.firstChild),Ma=!1,o=!0):o=!1),o||bi(t)),$h(t),o=t.type,s=t.pendingProps,c=e!==null?e.memoizedProps:null,n=s.children,gm(o,s)?n=null:c!==null&&gm(o,c)&&(t.flags|=32),t.memoizedState!==null&&(o=Ym(e,t,VN,null,null,a),vr._currentValue=o),Ho(e,t),ut(e,t,n,a),t.child;case 6:return e===null&&ce&&((e=a=He)&&(a=I5(a,t.pendingProps,Ma),a!==null?(t.stateNode=a,vt=t,He=null,e=!0):e=!1),e||bi(t)),null;case 13:return Qy(e,t,a);case 4:return Mc(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=eo(t,null,n,a):ut(e,t,n,a),t.child;case 11:return mb(e,t,t.type,t.pendingProps,a);case 7:return n=t.pendingProps,Ho(e,t),ut(e,t,n,a),t.child;case 8:return ut(e,t,t.pendingProps.children,a),t.child;case 12:return ut(e,t,t.pendingProps.children,a),t.child;case 10:return xb(e,t,a);case 9:return o=t.type._context,n=t.pendingProps.children,Pi(t),o=St(o),n=n(o),t.flags|=1,ut(e,t,n,a),t.child;case 14:return pb(e,t,t.type,t.pendingProps,a);case 15:return Yy(e,t,t.type,t.pendingProps,a);case 19:return Zh(e,t,a);case 31:return jN(e,t,a);case 22:return Xy(e,t,a,t.pendingProps);case 24:return Pi(t),n=St(at),e===null?(o=Um(),o===null&&(o=Oe,s=Im(),o.pooledCache=s,s.refCount++,s!==null&&(o.pooledCacheLanes|=a),o=s),t.memoizedState={parent:n,cache:o},Bm(t),ai(t,at,o)):((e.lanes&a)!==0&&(Dh(e,t),ys(t,null,null,a),vs()),o=e.memoizedState,s=t.memoizedState,o.parent!==n?(o={parent:n,cache:n},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),ai(t,at,n)):(n=s.cache,ai(t,at,n),n!==o.cache&&Oh(t,[at],a,!0))),ut(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),n=t.pendingProps,n.name!=null&&n.name!=="auto"?t.flags|=e===null?18882560:18874368:ce&&hu(t),e!==null&&e.memoizedProps.name!==n.name?t.flags|=4194816:Ho(e,t),ut(e,t,n.children,a),t.child;case 29:throw t.pendingProps}throw Error(M(156,t.tag))}function Nn(e){e.flags|=4}function eh(e,t,a,n,o){var s;if((s=(e.mode&32)!==0)&&(s=a===null?Pb(t,n):Pb(t,n)&&(n.src!==a.src||n.srcSet!==a.srcSet)),s){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(Nw())e.flags|=8192;else throw Zi=qc,qm}else e.flags&=-16777217}function Nb(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Fw(t))if(Nw())e.flags|=8192;else throw Zi=qc,qm}function nc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?yv():536870912,e.lanes|=t,hr|=t)}function is(e,t){if(!ce)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function _e(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags&1206910976,n|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags,n|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function XN(e,t,a){var n=t.pendingProps;switch(Hm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return _e(t),null;case 1:return _e(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),En(at),lr(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Do(t)?Nn(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Kd())),_e(t),null;case 26:var o=t.type,s=t.memoizedState;return e===null?(Nn(t),s!==null?(_e(t),Nb(t,s)):(_e(t),eh(t,o,null,n,a))):s?s!==e.memoizedState?(Nn(t),_e(t),Nb(t,s)):(_e(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&Nn(t),_e(t),eh(t,o,e,n,a)),null;case 27:if(Rc(t),a=ri.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&Nn(t);else{if(!n){if(t.stateNode===null)throw Error(M(166));return _e(t),t.subtreeFlags&=-33554433,null}e=mn.current,Do(t)?Jf(t,e):(e=Qw(o,n,a),t.stateNode=e,Nn(t))}return _e(t),t.subtreeFlags&=-33554433,null;case 5:if(Rc(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&Nn(t);else{if(!n){if(t.stateNode===null)throw Error(M(166));return _e(t),t.subtreeFlags&=-33554433,null}if(s=mn.current,Do(t))Jf(t,s);else{var c=Hs(ri.current);switch(s){case 1:s=c.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:s=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":s=c.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":s=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":s=c.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof n.is=="string"?c.createElement("select",{is:n.is}):c.createElement("select"),n.multiple?s.multiple=!0:n.size&&(s.size=n.size);break;default:s=typeof n.is=="string"?c.createElement(o,{is:n.is}):c.createElement(o)}}s[Nt]=t,s[ea]=n;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)s.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=s;e:switch(Et(s,o,n),o){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&Nn(t)}}return _e(t),t.subtreeFlags&=-33554433,eh(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&Nn(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(M(166));if(e=ri.current,Do(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,o=vt,o!==null)switch(o.tag){case 27:case 5:n=o.memoizedProps}e[Nt]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||Dw(e.nodeValue,a)),e||bi(t,!0)}else e=Hs(e).createTextNode(n),e[Nt]=t,t.stateNode=e}return _e(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=Do(t),a!==null){if(e===null){if(!n)throw Error(M(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(557));e[Nt]=t}else Ji(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;_e(t),e=!1}else a=Kd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(ca(t),t):(ca(t),null);if((t.flags&128)!==0)throw Error(M(558))}return _e(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=Do(t),n!==null&&n.dehydrated!==null){if(e===null){if(!o)throw Error(M(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(M(317));o[Nt]=t}else Ji(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;_e(t),o=!1}else o=Kd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(ca(t),t):(ca(t),null)}return ca(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,o=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(o=n.alternate.memoizedState.cachePool.pool),s=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(s=n.memoizedState.cachePool.pool),s!==o&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),nc(t,t.updateQueue),_e(t),null);case 4:return lr(),e===null&&mp(t.stateNode.containerInfo),t.flags|=67108864,_e(t),null;case 10:return En(t.type),_e(t),null;case 19:if(jm(t),n=t.memoizedState,n===null)return _e(t),null;if(o=(t.flags&128)!==0,s=n.rendering,s===null)if(o)is(n,!1);else{if(Ke!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=Lc(e),s!==null){for(t.flags|=128,is(n,!1),e=s.updateQueue,t.updateQueue=e,nc(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Jv(a,e),a=a.sibling;return Os(t,kt.current&1|2),ce&&Sn(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&ha()>Pc&&(t.flags|=128,o=!0,is(n,!1),t.lanes=4194304)}else{if(!o)if(e=Lc(s),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,nc(t,e),is(n,!0),n.tail===null&&n.tailMode!=="collapsed"&&n.tailMode!=="visible"&&!s.alternate&&!ce)return _e(t),null}else 2*ha()-n.renderingStartTime>Pc&&a!==536870912&&(t.flags|=128,o=!0,is(n,!1),t.lanes=4194304);n.isBackwards?(s.sibling=t.child,t.child=s):(e=n.last,e!==null?e.sibling=s:t.child=s,n.last=s)}if(n.tail!==null){e=n.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return n.rendering=e,n.tail=e.sibling,n.renderingStartTime=ha(),e.sibling=null,s=kt.current,s=o?s&1|2:s&1,n.tailMode==="visible"||n.tailMode==="collapsed"||!a||ce?Os(t,s):(a=s,Ie(Ct,t),Ie(kt,a),Rt===null&&(Rt=t)),ce&&Sn(t,n.treeForkCount),e}return _e(t),null;case 22:case 23:return ca(t),Lm(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&(_e(t),t.subtreeFlags&6&&(t.flags|=8192)):_e(t),a=t.updateQueue,a!==null&&nc(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&Tt(Qi),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),En(at),_e(t),null;case 25:return null;case 30:return t.flags|=33554432,_e(t),null}throw Error(M(156,t.tag))}function QN(e,t){switch(Hm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return En(at),lr(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Rc(t),null;case 31:if(t.memoizedState!==null){if(ca(t),t.alternate===null)throw Error(M(340));Ji()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(ca(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(M(340));Ji()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return jm(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return lr(),null;case 10:return En(t.type),null;case 22:case 23:return ca(t),Lm(),e!==null&&Tt(Qi),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return En(at),null;case 25:return null;default:return null}}function Ky(e,t){switch(Hm(t),t.tag){case 3:En(at),lr();break;case 26:case 27:case 5:Rc(t);break;case 4:lr();break;case 31:t.memoizedState!==null&&ca(t);break;case 13:ca(t);break;case 19:jm(t);break;case 10:En(t.type);break;case 22:case 23:ca(t),Lm(),e!==null&&Tt(Qi);break;case 24:En(at)}}function Js(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var o=n.next;a=o;do{if((a.tag&e)===e){n=void 0;var s=a.create,c=a.inst;n=s(),c.destroy=n}a=a.next}while(a!==o)}}catch(d){Ee(t,t.return,d)}}function yi(e,t,a){try{var n=t.updateQueue,o=n!==null?n.lastEffect:null;if(o!==null){var s=o.next;n=s;do{if((n.tag&e)===e){var c=n.inst,d=c.destroy;if(d!==void 0){c.destroy=void 0,o=t;var h=a,g=d;try{g()}catch(w){Ee(o,h,w)}}}n=n.next}while(n!==s)}}catch(w){Ee(t,t.return,w)}}function Jy(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{ry(t,a)}catch(n){Ee(e,e.return,n)}}}function Fy(e,t,a){a.props=ao(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){Ee(e,t,n)}}function sn(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:var o=e.stateNode,s=zn(e.memoizedProps,o);(o.ref===null||o.ref.name!==s)&&(o.ref=Bw(s)),n=o.ref;break;case 7:if(e.stateNode===null){var c=new ba(e);Wt(e.child,!1,D5,c,void 0,void 0),e.stateNode=c}n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(d){Ee(e,t,d)}}function xt(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(o){Ee(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){Ee(e,t,o)}else a.current=null}function Qc(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)Yw(e.stateNode,t[a])}function Sb(e){for(var t=e.return;t!==null&&(rp(t)&&Yw(e.stateNode,t.stateNode),!op(t));)t=t.return}function xs(e){for(var t=e.return;t!==null&&(rp(t)&&_5(e.stateNode,t.stateNode),!op(t));)t=t.return}function op(e){return e.tag===5||e.tag===3||e.tag===27}function rp(e){return e&&e.tag===7&&e.stateNode!==null}function Kh(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(o){Ee(e,e.return,o)}}function th(e,t,a){try{var n=e.stateNode;b5(n,e.type,a,t),n[ea]=t}catch(o){Ee(e,e.return,o)}}function Py(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&xi(e.type)||e.tag===4}function ah(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Py(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&xi(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Jh(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=un)),Qc(e,n),we=!0;else if(o!==4&&(o===27&&(Qc(e,n),n=null,xi(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(Jh(e,t,a,n),e=e.sibling;e!==null;)Jh(e,t,a,n),e=e.sibling}function Zc(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),Qc(e,n),we=!0;else if(o!==4&&(o===27&&(Qc(e,n),n=null,xi(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(Zc(e,t,a,n),e=e.sibling;e!==null;)Zc(e,t,a,n),e=e.sibling}function Wy(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);Et(t,n,a),t[Nt]=e,t[ea]=a}catch(s){Ee(e,e.return,s)}}var Kc=!1,ua=null;function Tb(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Kc=!0)}var ln=null;function kb(){var e=ln;return ln=null,e}var Jt=0;function Sr(e,t,a,n,o){return Jt=0,ew(e.child,t,a,n,o)}function ew(e,t,a,n,o){for(var s=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(n!==null){var d=fm(c);n.push(d),d.view&&(s=!0)}else s||fm(c).view&&(s=!0);Kc=!0,Iw(c,Jt===0?t:t+"_"+Jt,a),Jt++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||ew(e.child,t,a,n,o)&&(s=!0));e=e.sibling}return s}function gn(e,t){for(;e!==null;)e.tag===5?Uw(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||gn(e.child,t)),e=e.sibling}function $c(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&($c(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(M(544));var a=t.name;t=Dn(t.default,t.share),t!=="none"&&(Sr(e,a,t,null,!1)||gn(e.child,!1))}e=e.sibling}}function Fh(e,t){if(e.tag===30){var a=e.stateNode,n=e.memoizedProps,o=zn(n,a),s=Dn(n.default,a.paired?n.share:n.enter);s!=="none"?Sr(e,o,s,null,!1)?($c(e),a.paired||t||mr(e,n.onEnter)):gn(e.child,!1):$c(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Fh(e,t),e=e.sibling;else $c(e)}function Ph(e){if(ua!==null&&ua.size!==0){var t=ua;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,n=a.name;if(n!=null&&n!=="auto"){var o=t.get(n);if(o!==void 0){var s=Dn(a.default,a.share);if(s!=="none"&&(Sr(e,n,s,null,!1)?(s=e.stateNode,o.paired=s,s.paired=o,mr(e,a.onShare)):gn(e.child,!1)),t.delete(n),t.size===0)break}}}Ph(e)}e=e.sibling}}}function Wh(e){if(e.tag===30){var t=e.memoizedProps,a=zn(t,e.stateNode),n=ua!==null?ua.get(a):void 0,o=Dn(t.default,n!==void 0?t.share:t.exit);o!=="none"&&(Sr(e,a,o,null,!1)?n!==void 0?(o=e.stateNode,n.paired=o,o.paired=n,ua.delete(a),mr(e,t.onShare)):mr(e,t.onExit):gn(e.child,!1)),ua!==null&&Ph(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Wh(e),e=e.sibling;else ua!==null&&Ph(e)}function tw(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=zn(t,e.stateNode);t=Dn(t.default,t.update),e.flags&=-5,t!=="none"&&Sr(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&tw(e);e=e.sibling}}function em(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,gn(e.child,!1))}em(e)}e=e.sibling}}function xc(e){if(e.tag===30)e.stateNode.paired=null,gn(e.child,!1),em(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)xc(e),e=e.sibling;else em(e)}function aw(e){for(e=e.child;e!==null;)e.tag===30?gn(e.child,!1):(e.subtreeFlags&33554432)!==0&&aw(e),e=e.sibling}function sp(e,t,a,n,o,s,c){for(var d=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(s!==null&&Jt<s.length){var g=s[Jt],w=fm(h);(g.view||w.view)&&(d=!0);var N;if(N=(e.flags&4)===0)if(w.clip)N=!0;else{N=g.rect;var f=w.rect;N=N.y!==f.y||N.x!==f.x||N.height!==f.height||N.width!==f.width}N&&(e.flags|=4),w.abs?w=!g.abs:(g=g.rect,w=w.rect,w=g.height!==w.height||g.width!==w.width),w&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&Iw(h,Jt===0?a:a+"_"+Jt,o),d&&(e.flags&4)!==0||(ln===null&&(ln=[]),ln.push(h,Jt===0?n:n+"_"+Jt,t.memoizedProps)),Jt++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:sp(e,t.child,a,n,o,s,c)&&(d=!0));t=t.sibling}return d}function nw(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,n=e.stateNode,o=zn(a,n),s=Dn(a.default,a.update);if(t){n=n.clones;var c=n===null?null:n.map(N5)}else c=e.memoizedState,e.memoizedState=null;n=e;var d=e.child;Jt=0,o=sp(n,d,o,o,s,c,!1),(e.flags&4)!==0&&o&&(t||mr(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&nw(e,t);e=e.sibling}}var gt=!1,Se=!1,nn=!1,nh=!1,Eb=typeof WeakSet=="function"?WeakSet:Set,ft=null,on=!1,hs=!1,Jc=!1,tm=!1;function ZN(e,t,a){if(e=e.containerInfo,mm=yr,e=Lv(e),Om(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var s=o.anchorOffset,c=o.focusNode;o=o.focusOffset;try{n.nodeType,c.nodeType}catch{n=null;break e}var d=0,h=-1,g=-1,w=0,N=0,f=e,$=null;t:for(;;){for(var A;f!==n||s!==0&&f.nodeType!==3||(h=d+s),f!==c||o!==0&&f.nodeType!==3||(g=d+o),f.nodeType===3&&(d+=f.nodeValue.length),(A=f.firstChild)!==null;)$=f,f=A;for(;;){if(f===e)break t;if($===n&&++w===s&&(h=d),$===c&&++N===o&&(g=d),(A=f.nextSibling)!==null)break;f=$,$=f.parentNode}f=A}n=h===-1||g===-1?null:{start:h,end:g}}else n=null}n=n||{start:0,end:0}}else n=null;for(pm={focusedElem:e,selectionRange:n},yr=!1,a=(a&335544064)===a,ft=t,t=a?9270:1024;ft!==null;){if(e=ft,a&&(n=e.deletions,n!==null))for(s=0;s<n.length;s++)a&&Wh(n[s]);if(e.alternate===null&&(e.flags&2)!==0)a&&Tb(e),ic(a);else{if(e.tag===22){if(n=e.alternate,e.memoizedState!==null){n!==null&&n.memoizedState===null&&a&&Wh(n),ic(a);continue}else if(n!==null&&n.memoizedState!==null){a&&Tb(e),ic(a);continue}}n=e.child,(e.subtreeFlags&t)!==0&&n!==null?(n.return=e,ft=n):(a&&tw(e),ic(a))}}ua=null}function ic(e){for(;ft!==null;){var t=ft,a=e,n=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&n!==null){a=void 0,o=n.memoizedProps,n=n.memoizedState;var s=t.stateNode;try{var c=ao(t.type,o);a=s.getSnapshotBeforeUpdate(c,n),s.__reactInternalSnapshotBeforeUpdate=a}catch(d){Ee(t,t.return,d)}}break;case 3:if((o&1024)!==0){if(n=t.stateNode.containerInfo,a=n.nodeType,a===9)bm(n);else if(a===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":bm(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&n!==null&&(a=zn(n.memoizedProps,n.stateNode),o=t.memoizedProps,o=Dn(o.default,o.update),o!=="none"&&Sr(n,a,o,n.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(M(163))}if(n=t.sibling,n!==null){n.return=t.return,ft=n;break}ft=t.return}}function iw(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:rn(e,a),n&4&&Js(5,a);break;case 1:if(rn(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){Ee(a,a.return,c)}else{var o=ao(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){Ee(a,a.return,c)}}n&64&&Jy(a),n&512&&sn(a,a.return);break;case 3:if(rn(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{ry(e,t)}catch(c){Ee(a,a.return,c)}}break;case 27:t===null&&n&4&&Wy(a);case 26:case 5:rn(e,a),t===null&&n&4&&Kh(a),n&512&&sn(a,a.return);break;case 12:rn(e,a);break;case 31:rn(e,a),n&4&&lw(e,a);break;case 13:rn(e,a),n&4&&cw(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=r5.bind(null,a),U5(e,a))));break;case 22:if(n=a.memoizedState!==null||gt,!n){var s=t!==null&&t.memoizedState!==null||Se;t=gt,o=Se,gt=n,(Se=s)&&!o?(n=2,(a.subtreeFlags&8772)!==0&&(n|=1),La(e,a,n)):rn(e,a),gt=t,Se=o}break;case 30:rn(e,a),n&512&&sn(a,a.return);break;case 7:n&512&&sn(a,a.return);default:rn(e,a)}}function am(e,t){for(e=e.child;e!==null;)ow(e,t),e=e.sibling}function ow(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var n=a.style;typeof n.setProperty=="function"?n.setProperty("display","none","important"):n.display="none"}else{var o=e.stateNode,s=e.memoizedProps.style,c=s!=null&&s.hasOwnProperty("display")?s.display:null;o.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){Ee(e,e.return,h)}nm(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,we=!0}catch(h){Ee(e,e.return,h)}break;case 18:try{var d=e.stateNode;t?jb(d,!0):jb(e.stateNode,!1)}catch(h){Ee(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&am(e,t);break;default:am(e,t)}}function nm(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,n=t;switch(a.tag){case 4:ow(a,n);break e;case 22:a.memoizedState===null&&nm(a,n);break e;default:nm(a,n)}}e=e.sibling}}function rw(e){var t=e.alternate;t!==null&&(e.alternate=null,rw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&ru(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Le=null,Zt=!1;function Ba(e,t,a){for(a=a.child;a!==null;)sw(e,t,a),a=a.sibling}function sw(e,t,a){if(ma&&typeof ma.onCommitFiberUnmount=="function")try{ma.onCommitFiberUnmount(js,a)}catch{}switch(a.tag){case 26:Se||xt(a,t),Ba(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!Se&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Se||xt(a,t),xs(a);var n=Le,o=Zt;xi(a.type)&&(Le=a.stateNode,Zt=!1),Ba(e,t,a),Zw(a.stateNode,a.type,a.memoizedProps),Le=n,Zt=o;break;case 5:Se||xt(a,t),xs(a);case 6:if(a.tag===6&&xs(a),n=Le,o=Zt,Le=null,Ba(e,t,a),Le=n,Zt=o,Le!==null)if(Zt)try{(Le.nodeType===9?Le.body:Le.nodeName==="HTML"?Le.ownerDocument.body:Le).removeChild(a.stateNode),we=!0}catch(s){Ee(a,t,s)}else try{Le.removeChild(a.stateNode),we=!0}catch(s){Ee(a,t,s)}break;case 18:Le!==null&&(Zt?(e=Le,Lb(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),wr(e)):Lb(Le,a.stateNode));break;case 4:n=Le,o=Zt,Le=a.stateNode.containerInfo,Zt=!0,Ba(e,t,a),Le=n,Zt=o;break;case 0:case 11:case 14:case 15:yi(2,a,t),Se||yi(4,a,t),Ba(e,t,a);break;case 1:Se||(xt(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&Fy(a,t,n)),Ba(e,t,a);break;case 21:Ba(e,t,a);break;case 22:Se=(n=Se)||a.memoizedState!==null,Ba(e,t,a),Se=n;break;case 30:xt(a,t),Ba(e,t,a);break;case 7:Se||xt(a,t),Ba(e,t,a);break;default:Ba(e,t,a)}}function lw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{wr(e)}catch(a){Ee(t,t.return,a)}}}function cw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{wr(e)}catch(a){Ee(t,t.return,a)}}function KN(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Eb),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Eb),t;default:throw Error(M(435,e.tag))}}function oc(e,t){var a=KN(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var o=s5.bind(null,e,n);n.then(o,o)}})}function Ut(e,t,a){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var s=n[o],c=e,d=t,h=d;e:for(;h!==null;){switch(h.tag){case 27:if(xi(h.type)){Le=h.stateNode,Zt=!1;break e}break;case 5:Le=h.stateNode,Zt=!1;break e;case 3:case 4:Le=h.stateNode.containerInfo,Zt=!0;break e}h=h.return}if(Le===null)throw Error(M(160));sw(c,d,s),Le=null,Zt=!1,c=s.alternate,c!==null&&(c.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)uw(t,e,a),t=t.sibling}var ja=null;function uw(e,t,a){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(n=e.updateQueue,n=n!==null?n.events:null,n!==null))for(var s=0;s<n.length;s++){var c=n[s];c.ref.impl=c.nextImpl}Ut(t,e,a),qt(e),o&4&&(yi(3,e,e.return),Js(3,e),yi(5,e,e.return));break;case 1:Ut(t,e,a),qt(e),o&512&&(Se||n===null||xt(n,n.return)),o&64&&gt&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(s=ja,Ut(t,e,a),qt(e),o&512&&(Se||n===null||xt(n,n.return)),o&4)if(o=n!==null?n.memoizedState:null,a=e.memoizedState,n===null)if(a===null)if(e.stateNode===null)if(gt)e.stateNode=Hw(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=s.ownerDocument||s;t:switch(t){case"title":n=o.getElementsByTagName("title")[0],(!n||n[Xs]||n[Nt]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=o.createElement(t),o.head.insertBefore(n,o.querySelector("head > title"))),Et(n,t,a),n[Nt]=e,bt(n),t=n;break e;case"link":if(s=Fb("link","href",o).get(t+(a.href||""))){for(c=0;c<s.length;c++)if(n=s[c],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(c,1);break t}}n=o.createElement(t),Et(n,t,a),o.head.appendChild(n);break;case"meta":if(s=Fb("meta","content",o).get(t+(a.content||""))){for(c=0;c<s.length;c++)if(n=s[c],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(c,1);break t}}n=o.createElement(t),Et(n,t,a),o.head.appendChild(n);break;default:throw Error(M(468,t))}n[Nt]=e,bt(n),t=n}e.stateNode=t}else gt||wm(s,e.type,e.stateNode);else e.stateNode=Jb(s,a,e.memoizedProps);else o!==a?(o===null?(t=n.stateNode,t===null||Se||t.parentNode.removeChild(t)):o.count--,a===null?gt||wm(s,e.type,e.stateNode):Jb(s,a,e.memoizedProps)):a===null&&e.stateNode!==null&&th(e,e.memoizedProps,n.memoizedProps);break;case 27:Ut(t,e,a),qt(e),o&512&&(Se||n===null||xt(n,n.return)),n!==null&&o&4&&th(e,e.memoizedProps,n.memoizedProps);break;case 5:if(s=nn,nn=!1,Ut(t,e,a),nn=s,qt(e),o&512&&(Se||n===null||xt(n,n.return)),e.flags&32){t=e.stateNode;try{ur(t,""),we=!0}catch(w){Ee(e,e.return,w)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,th(e,t,n!==null?n.memoizedProps:t)),o&1024&&(nh=!0);break;case 6:if(Ut(t,e,a),qt(e),o&4){if(e.stateNode===null)throw Error(M(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,we=!0}catch(w){Ee(e,e.return,w)}}break;case 3:if(we=!1,kc=null,s=ja,ja=Is(t.containerInfo),Ut(t,e,a),ja=s,qt(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{wr(t.containerInfo)}catch(w){Ee(e,e.return,w)}nh&&(nh=!1,dw(e)),we=!1;break;case 4:o=nn,nn=gt,n=Of(),s=ja,ja=Is(e.stateNode.containerInfo),Ut(t,e,a),qt(e),ja=s,we&&hs&&(Jc=!0),we=n,nn=o;break;case 12:Ut(t,e,a),qt(e);break;case 31:Ut(t,e,a),qt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,oc(e,t)));break;case 13:Ut(t,e,a),qt(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(yu=ha()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,oc(e,t)));break;case 22:s=e.memoizedState!==null,c=n!==null&&n.memoizedState!==null;var d=gt,h=Se,g=nn;gt=d||s,nn=g||s,Se=h||c,Ut(t,e,a),Se=h,nn=g,gt=d,qt(e),o&8192&&(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,!s||n===null||c||gt||Se||(t=c||Se,a=gt,n=Se,gt=s||gt,Se=t,Jn(e,2),gt=a,Se=n),!s&&nn||am(e,s)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,oc(e,a))));break;case 19:Ut(t,e,a),qt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,oc(e,t)));break;case 30:o&512&&(Se||n===null||xt(n,n.return)),o=Of(),s=hs,c=(a&335544064)===a,d=e.memoizedProps,hs=c&&Dn(d.default,d.update)!=="none",Ut(t,e,a),qt(e),c&&n!==null&&we&&(e.flags|=4),hs=s,we=o;break;case 21:break;case 7:o&512&&(Se||n===null||xt(n,n.return)),n&&n.stateNode!==null&&(n.stateNode._fragmentFiber=e);default:Ut(t,e,a),qt(e)}}function qt(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(Py(n)){a=n;break}n=n.return}n=null;for(var o=e.return;o!==null;){if(rp(o)){var s=o.stateNode;n===null?n=[s]:n.push(s)}if(op(o))break;o=o.return}var c=n;if(a==null)throw Error(M(160));switch(a.tag){case 27:var d=a.stateNode,h=ah(e);Zc(e,h,d,c);break;case 5:var g=a.stateNode;a.flags&32&&(ur(g,""),a.flags&=-33);var w=ah(e);Zc(e,w,g,c);break;case 3:case 4:var N=a.stateNode.containerInfo,f=ah(e);Jh(e,f,N,c);break;default:throw Error(M(161))}}catch($){Ee(e,e.return,$)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function dw(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;dw(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,yr=!0,t.reset(),yr=!1),e=e.sibling}}function _o(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)hw(t,e),t=t.sibling;else nw(t,!1)}function hw(e,t){var a=e.alternate;if(a===null)Fh(e,!1);else switch(e.tag){case 3:if(tm=on=!1,kb(),_o(t,e),!on&&!Jc){if(e=ln,e!==null)for(var n=0;n<e.length;n+=3){a=e[n];var o=e[n+1];Uw(a,e[n+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),tm=!0}ln=null;break;case 5:_o(t,e);break;case 4:n=on,on=!1,_o(t,e),on&&(Jc=!0),on=n;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Fh(e,!1):_o(t,e));break;case 30:n=on,o=kb(),on=!1,_o(t,e),on&&(e.flags|=4);var s=e.memoizedProps,c=e.stateNode;t=zn(s,c),c=zn(a.memoizedProps,c);var d=Dn(s.default,s.update);d==="none"?t=!1:(s=a.memoizedState,a.memoizedState=null,a=e.child,Jt=0,t=sp(e,a,t,c,d,s,!0),Jt!==(s===null?0:s.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(mr(e,e.memoizedProps.onUpdate),ln=o):o!==null&&(o.push.apply(o,ln),ln=o),on=(e.flags&32)!==0?!0:n;break;default:_o(t,e)}}function rn(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)iw(e,t.alternate,t),t=t.sibling}function Jn(e,t){for(e=e.child;e!==null;){var a=e,n=t;switch(a.tag){case 0:case 11:case 14:case 15:yi(4,a,a.return),Jn(a,n);break;case 1:xt(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&Fy(a,a.return,o),Jn(a,n);break;case 27:(n&2)!==0&&Zw(a.stateNode,a.type,a.memoizedProps);case 5:xt(a,a.return),a.tag!==5&&a.tag!==27||xs(a),Jn(a,n);break;case 6:xs(a);break;case 26:xt(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||Se||o.parentNode.removeChild(o),Jn(a,n);break;case 22:a.memoizedState===null&&Jn(a,n);break;case 30:xt(a,a.return),Jn(a,n);break;case 7:xt(a,a.return);default:Jn(a,n)}e=e.sibling}}function La(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var n=t.alternate,o=e,s=t,c=s.flags,d=(a&1)!==0;switch(s.tag){case 0:case 11:case 15:La(o,s,a),Js(4,s);break;case 1:if(La(o,s,a),n=s,o=n.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch(w){Ee(n,n.return,w)}if(n=s,o=n.updateQueue,o!==null){var h=n.stateNode;try{var g=o.shared.hiddenCallbacks;if(g!==null)for(o.shared.hiddenCallbacks=null,o=0;o<g.length;o++)oy(g[o],h)}catch(w){Ee(n,n.return,w)}}d&&c&64&&Jy(s),sn(s,s.return);break;case 27:(a&2)!==0&&Wy(s);case 5:s.tag!==5&&s.tag!==27||Sb(s),La(o,s,a),d&&n===null&&c&4&&Kh(s),sn(s,s.return);break;case 6:Sb(s);break;case 26:h=s.stateNode,s.memoizedState!==null||h===null||gt||wm(Is(h.ownerDocument),s.type,h),La(o,s,a),d&&n===null&&c&4&&Kh(s),sn(s,s.return);break;case 12:La(o,s,a);break;case 31:La(o,s,a),d&&c&4&&lw(o,s);break;case 13:La(o,s,a),d&&c&4&&cw(o,s);break;case 22:s.memoizedState===null&&La(o,s,a),sn(s,s.return);break;case 30:La(o,s,a),sn(s,s.return);break;case 7:sn(s,s.return);default:La(o,s,a)}t=t.sibling}}function lp(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Zs(a))}function cp(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Zs(e))}function Ta(e,t,a,n){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)mw(e,t,a,n),t=t.sibling;else o&&aw(t)}function mw(e,t,a,n){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&xc(t);var s=t.flags;switch(t.tag){case 0:case 11:case 15:Ta(e,t,a,n),s&2048&&Js(9,t);break;case 1:Ta(e,t,a,n);break;case 3:Ta(e,t,a,n),o&&tm&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),s&2048&&(s=null,t.alternate!==null&&(s=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==s&&(t.refCount++,s!=null&&Zs(s)));break;case 12:if(s&2048){Ta(e,t,a,n),s=t.stateNode;try{var c=t.memoizedProps,d=c.id,h=c.onPostCommit;typeof h=="function"&&h(d,t.alternate===null?"mount":"update",s.passiveEffectDuration,-0)}catch(g){Ee(t,t.return,g)}}else Ta(e,t,a,n);break;case 31:Ta(e,t,a,n);break;case 13:Ta(e,t,a,n);break;case 23:break;case 22:c=t.stateNode,d=t.alternate,t.memoizedState!==null?(o&&d!==null&&d.memoizedState===null&&xc(d),c._visibility&2?Ta(e,t,a,n):Ns(e,t)):(o&&d!==null&&d.memoizedState!==null&&xc(t),c._visibility&2?Ta(e,t,a,n):(c._visibility|=2,Io(e,t,a,n,(t.subtreeFlags&10256)!==0||!1))),s&2048&&lp(d,t);break;case 24:Ta(e,t,a,n),s&2048&&cp(t.alternate,t);break;case 30:o&&(s=t.alternate,s!==null&&(gn(s.child,!0),gn(t.child,!0))),Ta(e,t,a,n);break;default:Ta(e,t,a,n)}}function Io(e,t,a,n,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var s=e,c=t,d=a,h=n,g=c.flags;switch(c.tag){case 0:case 11:case 15:Io(s,c,d,h,o),Js(8,c);break;case 23:break;case 22:var w=c.stateNode;c.memoizedState!==null?w._visibility&2?Io(s,c,d,h,o):Ns(s,c):(w._visibility|=2,Io(s,c,d,h,o)),o&&g&2048&&lp(c.alternate,c);break;case 24:Io(s,c,d,h,o),o&&g&2048&&cp(c.alternate,c);break;default:Io(s,c,d,h,o)}t=t.sibling}}function Ns(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,o=n.flags;switch(n.tag){case 22:Ns(a,n),o&2048&&lp(n.alternate,n);break;case 24:Ns(a,n),o&2048&&cp(n.alternate,n);break;default:Ns(a,n)}t=t.sibling}}var Li=8192;function Ui(e,t,a){if(e.subtreeFlags&Li)for(e=e.child;e!==null;)pw(e,t,a),e=e.sibling}function pw(e,t,a){switch(e.tag){case 26:Ui(e,t,a),e.flags&Li&&(e.memoizedState!==null?W5(a,ja,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Wb(a,e)));break;case 5:Ui(e,t,a),e.flags&Li&&(e=e.stateNode,(t&335544128)===t&&Wb(a,e));break;case 3:case 4:var n=ja;ja=Is(e.stateNode.containerInfo),Ui(e,t,a),ja=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=Li,Li=16777216,Ui(e,t,a),Li=n):Ui(e,t,a));break;case 30:if((e.flags&Li)!==0&&(n=e.memoizedProps.name,n!=null&&n!=="auto")){var o=e.stateNode;o.paired=null,ua===null&&(ua=new Map),ua.set(n,o)}Ui(e,t,a);break;default:Ui(e,t,a)}}function gw(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function os(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];ft=n,bw(n,e)}gw(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)fw(e),e=e.sibling}function fw(e){switch(e.tag){case 0:case 11:case 15:os(e),e.flags&2048&&yi(9,e,e.return);break;case 3:os(e);break;case 12:os(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Nc(e)):os(e);break;default:os(e)}}function Nc(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];ft=n,bw(n,e)}gw(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:yi(8,t,t.return),Nc(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Nc(t));break;default:Nc(t)}e=e.sibling}}function bw(e,t){for(;ft!==null;){var a=ft;switch(a.tag){case 0:case 11:case 15:yi(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:Zs(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,ft=n;else e:for(a=e;ft!==null;){n=ft;var o=n.sibling,s=n.return;if(rw(n),n===a){ft=null;break e}if(o!==null){o.return=s,ft=o;break e}ft=s}}}var JN={getCacheForType:function(e){var t=St(at),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return St(at).controller.signal}},FN=typeof WeakMap=="function"?WeakMap:Map,$e=0,Oe=null,he=null,pe=0,Te=0,sa=null,ni=!1,Tr=!1,up=!1,On=0,Ke=0,wi=0,Ki=0,Fc=0,da=0,hr=0,Ss=null,Kt=null,im=!1,yu=0,vw=0,Pc=1/0,Wc=null,hi=null,Ye=0,Ya=null,no=null,pn=0,om=0,rm=null,yw=null,or=null,rr=null,sr=null,Ts=0,Sc=null;function ga(){return($e&2)!==0&&pe!==0?pe&-pe:ee.T!==null?hp():Nv()}function ww(){if(da===0)if((pe&536870912)===0||ce){var e=Xl;Xl<<=1,(Xl&3932160)===0&&(Xl=262144),da=e}else da=536870912;return e=Ct.current,e!==null&&(e.flags|=32),da}function mr(e,t){if(t!=null){var a=e.stateNode,n=a.ref;n===null&&(n=a.ref=Bw(zn(e.memoizedProps,a))),rr===null&&(rr=[]),rr.push(t.bind(null,n))}}function Pt(e,t,a){(e===Oe&&(Te===2||Te===9)||e.cancelPendingCommit!==null)&&(pr(e,0),ii(e,pe,da,!1)),Ys(e,a),(($e&2)===0||e!==Oe)&&(e===Oe&&(($e&2)===0&&(Ki|=a),Ke===4&&ii(e,pe,da,!1)),bn(e))}function $w(e,t,a){if(($e&6)!==0)throw Error(M(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||Gs(e,t),o=n?e5(e,t):ih(e,t,!0),s=n;do{if(o===0){Tr&&!n&&ii(e,t,0,!1);break}else{if(a=e.current.alternate,s&&!PN(a)){o=ih(e,t,!1),s=!1;continue}if(o===2){if(s=t,e.errorRecoveryDisabledLanes&s)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var d=e;o=Ss;var h=d.current.memoizedState.isDehydrated;if(h&&(pr(d,c).flags|=256),c=ih(d,c,!1),c!==2&&c!==6){if(up&&!h){d.errorRecoveryDisabledLanes|=s,Ki|=s,o=4;break e}s=Kt,Kt=o,s!==null&&(Kt===null?Kt=s:Kt.push.apply(Kt,s))}o=c}if(s=!1,o!==2)continue}}if(o===1){pr(e,0),ii(e,t,0,!0);break}e:{switch(n=e,s=o,s){case 0:case 1:throw Error(M(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:ii(n,t,da,!ni);break e;case 2:Kt=null;break;case 3:case 5:break;default:throw Error(M(329))}if((t&62914560)===t&&(o=yu+300-ha(),10<o)){if(ii(n,t,da,!ni),ou(n,0,!0)!==0)break e;pn=t,n.timeoutHandle=pp(Cb.bind(null,n,a,Kt,Wc,im,t,da,Ki,hr,ni,s,"Throttled",-0,0),o);break e}Cb(n,a,Kt,Wc,im,t,da,Ki,hr,ni,s,null,-0,0)}}break}while(!0);bn(e)}function Cb(e,t,a,n,o,s,c,d,h,g,w,N,f,$){e.timeoutHandle=-1;var A=t.subtreeFlags,k=(s&335544064)===s;if(N=null,(k||A&8192||(A&16785408)===16785408)&&(N={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:un},ua=null,pw(t,s,N),k&&(A=N,k=e.containerInfo,k=(k.nodeType===9?k:k.ownerDocument).__reactViewTransition,k!=null&&(A.count++,A.waitingForViewTransition=!0,A=Us.bind(A),k.finished.then(A,A))),A=(s&62914560)===s?yu-ha():(s&4194048)===s?vw-ha():0,A=eS(N,A),A!==null)){pn=s,e.cancelPendingCommit=A(Ab.bind(null,e,t,s,a,n,o,c,d,h,g,w,N,null,f,$)),ii(e,s,c,!g);return}Ab(e,t,s,a,n,o,c,d,h,g,w,N)}function PN(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var o=a[n],s=o.getSnapshot;o=o.value;try{if(!fa(s(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function ii(e,t,a,n){t=vv(e,t),t&=~Fc,t&=~Ki,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var o=t;0<o;){var s=31-pa(o),c=1<<s;n[s]=-1,o&=~c}a!==0&&wv(e,a,t)}function wu(){return($e&6)===0?(Fs(0,!1),!1):!0}function dp(){if(he!==null){if(Te===0)var e=he.return;else e=he,Tn=lo=null,Zm(e),ar=null,Rs=0,e=he;for(;e!==null;)Ky(e.alternate,e),e=e.return;he=null}}function pr(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,w5(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),pn=0,dp(),Oe=e,he=a=kn(e.current,null),pe=t,Te=0,sa=null,ni=!1,Tr=Gs(e,t),up=!1,hr=da=Fc=Ki=wi=Ke=0,Kt=Ss=null,im=!1,On=vv(e,t),uu(),a}function xw(e,t){se=null,ee.H=Yc,t===Nr||t===mu?(t=tb(),Te=3):t===qm?(t=tb(),Te=4):Te=t===ap?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,sa=t,he===null&&(Ke=1,Xc(e,Aa(t,e.current)))}function Nw(){var e=Ct.current;return e===null?!0:(pe&4194048)===pe?Rt===null:(pe&62914560)===pe||(pe&536870912)!==0?e===Rt:!1}function Sw(){var e=ee.H;return ee.H=Yc,e===null?Yc:e}function Tw(){var e=ee.A;return ee.A=JN,e}function eu(){Ke=4,ni||(pe&4194048)!==pe&&Ct.current!==null||(Tr=!0),(wi&134217727)===0&&(Ki&134217727)===0||Oe===null||ii(Oe,pe,da,!1)}function ih(e,t,a){var n=$e;$e|=2;var o=Sw(),s=Tw();(Oe!==e||pe!==t)&&(Wc=null,pr(e,t)),t=!1;var c=Ke;e:do try{if(Te!==0&&he!==null){var d=he,h=sa;switch(Te){case 8:dp(),c=6;break e;case 3:case 2:case 9:case 6:Ct.current===null&&(t=!0);var g=Te;if(Te=0,sa=null,Fo(e,d,h,g),a&&Tr){c=0;break e}break;default:g=Te,Te=0,sa=null,Fo(e,d,h,g)}}WN(),c=Ke;break}catch(w){xw(e,w)}while(!0);return t&&e.shellSuspendCounter++,Tn=lo=null,$e=n,ee.H=o,ee.A=s,he===null&&(Oe=null,pe=0,uu()),c}function WN(){for(;he!==null;)kw(he)}function e5(e,t){var a=$e;$e|=2;var n=Sw(),o=Tw();Oe!==e||pe!==t?(Wc=null,Pc=ha()+500,pr(e,t)):Tr=Gs(e,t);e:do try{if(Te!==0&&he!==null){t=he;var s=sa;t:switch(Te){case 1:Te=0,sa=null,Fo(e,t,s,1);break;case 2:case 9:if(eb(s)){Te=0,sa=null,zb(t);break}t=function(){Te!==2&&Te!==9||Oe!==e||(Te=7),bn(e)},s.then(t,t);break e;case 3:Te=7;break e;case 4:Te=5;break e;case 7:eb(s)?(Te=0,sa=null,zb(t)):(Te=0,sa=null,Fo(e,t,s,7));break;case 5:var c=null;switch(he.tag){case 26:c=he.memoizedState;case 5:case 27:var d=he;if(c?Fw(c):d.stateNode.complete){Te=0,sa=null;var h=d.sibling;if(h!==null)he=h;else{var g=d.return;g!==null?(he=g,$u(g)):he=null}break t}}Te=0,sa=null,Fo(e,t,s,5);break;case 6:Te=0,sa=null,Fo(e,t,s,6);break;case 8:dp(),Ke=6;break e;default:throw Error(M(462))}}t5();break}catch(w){xw(e,w)}while(!0);return Tn=lo=null,ee.H=n,ee.A=o,$e=a,he!==null?0:(Oe=null,pe=0,uu(),Ke)}function t5(){for(;he!==null&&!vx();)kw(he)}function kw(e){var t=Zy(e.alternate,e,On);e.memoizedProps=e.pendingProps,t===null?$u(e):he=t}function zb(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=bb(a,t,t.pendingProps,t.type,void 0,pe);break;case 11:t=bb(a,t,t.pendingProps,t.type.render,t.ref,pe);break;case 5:Zm(t);var n=t;n===vt&&(ce?(Ic(n),n.tag===5&&n.stateNode!=null&&(He=n.stateNode)):(Ic(n),ce=!0));default:Ky(a,t),t=he=Jv(t,On),t=Zy(a,t,On)}e.memoizedProps=e.pendingProps,t===null?$u(e):he=t}function Fo(e,t,a,n){Tn=lo=null,Zm(t),ar=null,Rs=0;var o=t.return;try{if(LN(e,o,t,a,pe)){Ke=1,Xc(e,Aa(a,e.current)),he=null;return}}catch(s){if(o!==null)throw he=o,s;Ke=1,Xc(e,Aa(a,e.current)),he=null;return}t.flags&32768?(ce||n===1?e=!0:Tr||(pe&536870912)!==0?e=!1:(ni=e=!0,(n===2||n===9||n===3||n===6)&&(n=Ct.current,n!==null&&n.tag===13&&(n.flags|=16384))),Ew(t,e)):$u(t)}function $u(e){var t=e;do{if((t.flags&32768)!==0){Ew(t,ni);return}e=t.return;var a=XN(t.alternate,t,On);if(a!==null){he=a;return}if(t=t.sibling,t!==null){he=t;return}he=t=e}while(t!==null);Ke===0&&(Ke=5)}function Ew(e,t){do{var a=QN(e.alternate,e);if(a!==null){a.flags&=32767,he=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){he=e;return}he=e=a}while(e!==null);Ke=6,he=null}function Ab(e,t,a,n,o,s,c,d,h,g,w,N){e.cancelPendingCommit=null;do xu();while(Ye!==0);if(($e&6)!==0)throw Error(M(327));if(t!==null){if(t===e.current)throw Error(M(177));e===Oe&&(he=Oe=null,pe=0),no=t,Ya=e,pn=a,rm=o,yw=n,a5(e,t,a,c,d,h,N)}}function a5(e,t,a,n,o,s,c){var d=t.lanes|t.childLanes;if(om=d,d|=Vm,Cx(e,a,d,n,o,s),rr=null,(a&335544064)===a?(sr=AN(e),n=10262):(sr=null,n=10256),(t.subtreeFlags&n)!==0||(t.flags&n)!==0?(e.callbackNode=null,e.callbackPriority=0,l5(Oc,function(){return um(),null})):(e.callbackNode=null,e.callbackPriority=0),Kc=!1,n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=ee.T,ee.T=null,o=xe.p,xe.p=2,s=$e,$e|=4;try{ZN(e,t,a)}finally{$e=s,xe.p=o,ee.T=n}}Ye=1,Kc?or=k5(c,e.containerInfo,sr,sm,lm,i5,cm,um,n5,null,null):(sm(),lm(),cm())}function n5(e){if(Ye!==0){var t=Ya.onRecoverableError;t(e,{componentStack:null})}}function i5(){Ye===3&&(Ye=0,hw(no,Ya),Ye=4)}function sm(){if(Ye===1){Ye=0;var e=Ya,t=no,a=pn,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=ee.T,ee.T=null;var o=xe.p;xe.p=2;var s=$e;$e|=4;try{hs=Jc=!1,uw(t,e,a),a=pm;var c=Lv(e.containerInfo),d=a.focusedElem,h=a.selectionRange;if(c!==d&&d&&d.ownerDocument&&Bv(d.ownerDocument.documentElement,d)){if(h!==null&&Om(d)){var g=h.start,w=h.end;if(w===void 0&&(w=g),"selectionStart"in d)d.selectionStart=g,d.selectionEnd=Math.min(w,d.value.length);else{var N=d.ownerDocument||document,f=N&&N.defaultView||window;if(f.getSelection){var $=f.getSelection(),A=d.textContent.length,k=Math.min(h.start,A),_=h.end===void 0?k:Math.min(h.end,A);!$.extend&&k>_&&(c=_,_=k,k=c);var y=Xf(d,k),v=Xf(d,_);if(y&&v&&($.rangeCount!==1||$.anchorNode!==y.node||$.anchorOffset!==y.offset||$.focusNode!==v.node||$.focusOffset!==v.offset)){var b=N.createRange();b.setStart(y.node,y.offset),$.removeAllRanges(),k>_?($.addRange(b),$.extend(v.node,v.offset)):(b.setEnd(v.node,v.offset),$.addRange(b))}}}}for(N=[],$=d;$=$.parentNode;)$.nodeType===1&&N.push({element:$,left:$.scrollLeft,top:$.scrollTop});for(typeof d.focus=="function"&&d.focus(),d=0;d<N.length;d++){var S=N[d];S.element.scrollLeft=S.left,S.element.scrollTop=S.top}}yr=!!mm,pm=mm=null}finally{$e=s,xe.p=o,ee.T=n}}e.current=t,Ye=2}}function lm(){if(Ye===2){Ye=0;var e=Ya,t=no,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=ee.T,ee.T=null;var n=xe.p;xe.p=2;var o=$e;$e|=4;try{iw(e,t.alternate,t)}finally{$e=o,xe.p=n,ee.T=a}}Ye=3}}function cm(){if(Ye===4||Ye===3){Ye=0;var e=or;or=null,yx();var t=Ya,a=no,n=pn,o=yw,s=(n&335544064)===n?10262:10256;if((a.subtreeFlags&s)!==0||(a.flags&s)!==0?Ye=5:(Ye=0,no=Ya=null,Cw(t,t.pendingLanes)),s=t.pendingLanes,s===0&&(hi=null),Em(n),a=a.stateNode,ma&&typeof ma.onCommitFiberRoot=="function")try{ma.onCommitFiberRoot(js,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=ee.T,s=xe.p,xe.p=2,ee.T=null;try{for(var c=t.onRecoverableError,d=0;d<o.length;d++){var h=o[d];c(h.value,{componentStack:h.stack})}}finally{ee.T=a,xe.p=s}}if(o=rr,c=sr,sr=null,o!==null&&(rr=null,c===null&&(c=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(c),a!==void 0&&e.finished.finally(a);(pn&3)!==0&&xu(),bn(t),s=t.pendingLanes,(n&261930)!==0&&(s&42)!==0?t===Sc?Ts++:(Ts=0,Sc=t):(Ts=0,Sc=null),Fs(0,!1)}}function Cw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Zs(t)))}function xu(){return or!==null&&(or.skipTransition(),or=null),sm(),lm(),cm(),um()}function um(){if(Ye!==5)return!1;var e=Ya,t=om;om=0;var a=Em(pn),n=ee.T,o=xe.p;try{xe.p=32>a?32:a,ee.T=null,a=rm,rm=null;var s=Ya,c=pn;if(Ye=0,no=Ya=null,pn=0,($e&6)!==0)throw Error(M(331));var d=$e;if($e|=4,fw(s.current),mw(s,s.current,c,a),$e=d,Fs(0,!1),ma&&typeof ma.onPostCommitFiberRoot=="function")try{ma.onPostCommitFiberRoot(js,s)}catch{}return!0}finally{xe.p=o,ee.T=n,Cw(e,t)}}function Mb(e,t,a){t=Aa(a,t),t=jh(e.stateNode,t,2),e=ci(e,t,2),e!==null&&(Ys(e,2),bn(e))}function Ee(e,t,a){if(e.tag===3)Mb(e,e,a);else for(;t!==null;){if(t.tag===3){Mb(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(hi===null||!hi.has(n))){e=Aa(a,e),a=jy(2),n=ci(t,a,2),n!==null&&(Gy(a,n,t,e),Ys(n,2),bn(n));break}}t=t.return}}function oh(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new FN;var o=new Set;n.set(t,o)}else o=n.get(t),o===void 0&&(o=new Set,n.set(t,o));o.has(a)||(up=!0,o.add(a),e=o5.bind(null,e,t,a),t.then(e,e))}function o5(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Oe===e&&(pe&a)===a&&((Ke===4||Ke===3&&(pe&62914560)===pe&&300>ha()-yu)&&($e&2)===0?pr(e,0):Fc|=a,hr===pe&&(hr=0)),bn(e)}function zw(e,t){t===0&&(t=yv()),e=so(e,t),e!==null&&(Ys(e,t),bn(e))}function r5(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),zw(e,a)}function s5(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(M(314))}n!==null&&n.delete(t),zw(e,a)}function l5(e,t){return Tm(e,t)}var gr=null,Uo=null,dm=!1,tu=!1,rh=!1,oi=0;function bn(e){e!==Uo&&e.next===null&&(Uo===null?gr=Uo=e:Uo=Uo.next=e),tu=!0,dm||(dm=!0,u5())}function Fs(e,t){if(!rh&&tu){rh=!0;do for(var a=!1,n=gr;n!==null;){if(!t)if(e!==0){var o=n.pendingLanes;if(o===0)var s=0;else{var c=n.suspendedLanes,d=n.pingedLanes;s=(1<<31-pa(42|e)+1)-1,s&=o&~(c&~d),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,Rb(n,s))}else s=pe,s=ou(n,n===Oe?s:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(s&3)===0||Gs(n,s)||(a=!0,Rb(n,s));n=n.next}while(a);rh=!1}}function c5(){Aw()}function Aw(){tu=dm=!1;var e=0;oi!==0&&y5()&&(e=oi);for(var t=ha(),a=null,n=gr;n!==null;){var o=n.next,s=Mw(n,t);s===0?(n.next=null,a===null?gr=o:a.next=o,o===null&&(Uo=a)):(a=n,(e!==0||(s&3)!==0)&&(tu=!0)),n=o}Ye!==0&&Ye!==5||Fs(e,!1),oi!==0&&(oi=0)}function Mw(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,o=e.expirationTimes,s=e.pendingLanes&-62914561;0<s;){var c=31-pa(s),d=1<<c,h=o[c];h===-1?((d&a)===0||(d&n)!==0)&&(o[c]=Ex(d,t)):h<=t&&(e.expiredLanes|=d),s&=~d}if(t=Oe,a=pe,a=ou(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(Te===2||Te===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&Id(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Gs(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&Id(n),Em(a)){case 2:case 8:a=fv;break;case 32:a=Oc;break;case 268435456:a=bv;break;default:a=Oc}return n=Rw.bind(null,e),a=Tm(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&Id(n),e.callbackPriority=2,e.callbackNode=null,2}function Rw(e,t){if(Ye!==0&&Ye!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(xu()&&e.callbackNode!==a)return null;var n=pe;return n=ou(e,e===Oe?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:($w(e,n,t),Mw(e,ha()),e.callbackNode!=null&&e.callbackNode===a?Rw.bind(null,e):null)}function Rb(e,t){if(xu())return null;$w(e,t,!0)}function u5(){$5(function(){($e&6)!==0?Tm(gv,c5):Aw()})}function hp(){if(oi===0){var e=Wi;e===0&&(e=Yl,Yl<<=1,(Yl&261888)===0&&(Yl=256)),oi=e}return oi}function Ob(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:hc(e)}function d5(e,t,a,n,o){if(t==="submit"&&a&&a.stateNode===o){var s=Ob((o[ea]||null).action),c=n.submitter;c&&(t=(t=c[ea]||null)?Ob(t.formAction):c.getAttribute("formAction"),t!==null&&(s=t,c=null));var d=new su("action","action",null,n,o);e.push({event:d,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(oi!==0){var h=new FormData(o,c);Bh(a,{pending:!0,data:h,method:o.method,action:s},null,h)}}else typeof s=="function"&&(d.preventDefault(),h=new FormData(o,c),Bh(a,{pending:!0,data:h,method:o.method,action:s},s,h))},currentTarget:o}]})}}for(rc=0;rc<Ah.length;rc++)sc=Ah[rc],Vb=sc.toLowerCase(),Db=sc[0].toUpperCase()+sc.slice(1),Xa(Vb,"on"+Db);var sc,Vb,Db,rc;Xa(Gv,"onAnimationEnd");Xa(Yv,"onAnimationIteration");Xa(Xv,"onAnimationStart");Xa("dblclick","onDoubleClick");Xa("focusin","onFocus");Xa("focusout","onBlur");Xa(xN,"onTransitionRun");Xa(NN,"onTransitionStart");Xa(SN,"onTransitionCancel");Xa(Qv,"onTransitionEnd");cr("onMouseEnter",["mouseout","mouseover"]);cr("onMouseLeave",["mouseout","mouseover"]);cr("onPointerEnter",["pointerout","pointerover"]);cr("onPointerLeave",["pointerout","pointerover"]);oo("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));oo("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));oo("onBeforeInput",["compositionend","keypress","textInput","paste"]);oo("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));oo("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));oo("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ds="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),h5=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ds));function Ow(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],o=n.event;n=n.listeners;e:{var s=void 0;if(t)for(var c=n.length-1;0<=c;c--){var d=n[c],h=d.instance,g=d.currentTarget;if(d=d.listener,h!==s&&o.isPropagationStopped())break e;s=d,o.currentTarget=g;try{s(o)}catch(w){Dc(w)}o.currentTarget=null,s=h}else for(c=0;c<n.length;c++){if(d=n[c],h=d.instance,g=d.currentTarget,d=d.listener,h!==s&&o.isPropagationStopped())break e;s=d,o.currentTarget=g;try{s(o)}catch(w){Dc(w)}o.currentTarget=null,s=h}}}}function de(e,t){var a=t[zf];a===void 0&&(a=t[zf]=new Set);var n=e+"__bubble";a.has(n)||(Vw(t,e,2,!1),a.add(n))}function sh(e,t,a){var n=0;t&&(n|=4),Vw(a,e,n,t)}var lc="_reactListening"+Math.random().toString(36).slice(2);function mp(e){if(!e[lc]){e[lc]=!0,Tv.forEach(function(a){a!=="selectionchange"&&(h5.has(a)||sh(a,!1,e),sh(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[lc]||(t[lc]=!0,sh("selectionchange",!1,t))}}function Vw(e,t,a,n){switch(i0(t)){case 2:var o=iS;break;case 8:o=oS;break;default:o=wp}a=o.bind(null,t,a,e),o=void 0,!kh||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),n?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function lh(e,t,a,n,o){var s=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var c=n.tag;if(c===3||c===4){var d=n.stateNode.containerInfo;if(d===o)break;if(c===4)for(c=n.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===o)return;c=c.return}for(;d!==null;){if(c=ji(d),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){n=s=c;continue e}d=d.parentNode}}n=n.return}Ov(function(){var g=s,w=zm(a),N=[];e:{var f=Zv.get(e);if(f!==void 0){var $=su,A=e;switch(e){case"keypress":if(pc(a)===0)break e;case"keydown":case"keyup":$=Px;break;case"focusin":A="focus",$=Gd;break;case"focusout":A="blur",$=Gd;break;case"beforeblur":case"afterblur":$=Gd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":$=Hf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":$=qx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":$=nN;break;case Gv:case Yv:case Xv:$=jx;break;case Qv:$=oN;break;case"scroll":case"scrollend":$=Ix;break;case"wheel":$=sN;break;case"copy":case"cut":case"paste":$=Yx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":$=Uf;break;case"submit":$=tN;break;case"toggle":case"beforetoggle":$=cN}var k=(t&4)!==0,_=!k&&(e==="scroll"||e==="scrollend"),y=k?f!==null?f+"Capture":null:f;k=[];for(var v=g,b;v!==null;){var S=v;if(b=S.stateNode,S=S.tag,S!==5&&S!==26&&S!==27||b===null||y===null||(S=Es(v,y),S!=null&&k.push(_s(v,S,b))),_)break;v=v.return}0<k.length&&(f=new $(f,A,null,a,w),N.push({event:f,listeners:k}))}}if((t&7)===0){e:{if($=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",$&&a!==Th&&(A=a.relatedTarget||a.fromElement)&&(ji(A)||A[$r]))break e;(f||$)&&(A=w.window===w?w:($=w.ownerDocument)?$.defaultView||$.parentWindow:window,f?($=a.relatedTarget||a.toElement,f=g,$=$?ji($):null,$!==null&&(_=Ls($),k=$.tag,$!==_||k!==5&&k!==27&&k!==6)&&($=null)):(f=null,$=g),f!==$&&(k=Hf,S="onMouseLeave",y="onMouseEnter",v="mouse",(e==="pointerout"||e==="pointerover")&&(k=Uf,S="onPointerLeave",y="onPointerEnter",v="pointer"),_=f==null?A:us(f),b=$==null?A:us($),A=new k(S,v+"leave",f,a,w),A.target=_,A.relatedTarget=b,S=null,ji(w)===g&&(k=new k(y,v+"enter",$,a,w),k.target=b,k.relatedTarget=_,S=k),_=S,k=f&&$?mh(f,$,m5):null,f!==null&&_b(N,A,f,k,!1),$!==null&&_!==null&&_b(N,_,$,k,!0)))}e:{if(f=g?us(g):window,$=f.nodeName&&f.nodeName.toLowerCase(),$==="select"||$==="input"&&f.type==="file")var O=jf;else if(Lf(f))if(Uv)O=yN;else{O=bN;var F=fN}else $=f.nodeName,!$||$.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?g&&Cm(g.elementType)&&(O=jf):O=vN;if(O&&(O=O(e,g))){Iv(N,O,a,w);break e}F&&F(e,f,g)}switch(F=g?us(g):window,e){case"focusin":(Lf(F)||F.contentEditable==="true")&&(Yo=F,Ch=g,gs=null);break;case"focusout":gs=Ch=Yo=null;break;case"mousedown":zh=!0;break;case"contextmenu":case"mouseup":case"dragend":zh=!1,Qf(N,a,w);break;case"selectionchange":if($N)break;case"keydown":case"keyup":Qf(N,a,w)}var I;if(Rm)e:{switch(e){case"compositionstart":var B="onCompositionStart";break e;case"compositionend":B="onCompositionEnd";break e;case"compositionupdate":B="onCompositionUpdate";break e}B=void 0}else Go?_v(e,a)&&(B="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(B="onCompositionStart");B&&(Dv&&a.locale!=="ko"&&(Go||B!=="onCompositionStart"?B==="onCompositionEnd"&&Go&&(I=Vv()):(ti=w,Am="value"in ti?ti.value:ti.textContent,Go=!0)),F=au(g,B),0<F.length&&(B=new If(B,e,null,a,w),N.push({event:B,listeners:F}),I?B.data=I:(I=Hv(a),I!==null&&(B.data=I)))),(I=dN?hN(e,a):mN(e,a))&&(B=au(g,"onBeforeInput"),0<B.length&&(F=new If("onBeforeInput","beforeinput",null,a,w),N.push({event:F,listeners:B}),F.data=I)),d5(N,e,g,a,w)}Ow(N,t)})}function _s(e,t,a){return{instance:e,listener:t,currentTarget:a}}function au(e,t){for(var a=t+"Capture",n=[];e!==null;){var o=e,s=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||s===null||(o=Es(e,a),o!=null&&n.unshift(_s(e,o,s)),o=Es(e,t),o!=null&&n.push(_s(e,o,s))),e.tag===3)return n;e=e.return}return[]}function m5(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function _b(e,t,a,n,o){for(var s=t._reactName,c=[];a!==null&&a!==n;){var d=a,h=d.alternate,g=d.stateNode;if(d=d.tag,h!==null&&h===n)break;d!==5&&d!==26&&d!==27||g===null||(h=g,o?(g=Es(a,s),g!=null&&c.unshift(_s(a,g,h))):o||(g=Es(a,s),g!=null&&c.push(_s(a,g,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var p5=/\r\n?/g,g5=/\u0000|\uFFFD/g;function Hb(e){return(typeof e=="string"?e:""+e).replace(p5,`
`).replace(g5,"")}function Dw(e,t){return t=Hb(t),Hb(e)===t}function ke(e,t,a,n,o,s){switch(a){case"children":if(typeof n=="string")t==="body"||t==="textarea"&&n===""||ur(e,n);else if(typeof n=="number"||typeof n=="bigint")t!=="body"&&ur(e,""+n);else return;break;case"className":Zl(e,"class",n);break;case"tabIndex":Zl(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":Zl(e,a,n);break;case"style":Rv(e,n,s);return;case"data":if(t!=="object"){Zl(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=hc(n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(t!=="input"&&ke(e,t,"name",o.name,o,null),ke(e,t,"formEncType",o.formEncType,o,null),ke(e,t,"formMethod",o.formMethod,o,null),ke(e,t,"formTarget",o.formTarget,o,null)):(ke(e,t,"encType",o.encType,o,null),ke(e,t,"method",o.method,o,null),ke(e,t,"target",o.target,o,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=hc(n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=un);return;case"onScroll":n!=null&&de("scroll",e);return;case"onScrollEnd":n!=null&&de("scrollend",e);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(M(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(M(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=hc(n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":de("beforetoggle",e),de("toggle",e),dc(e,"popover",n);break;case"xlinkActuate":xn(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":xn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":xn(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":xn(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":xn(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":xn(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":xn(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":xn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":xn(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":dc(e,"is",n);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=_x.get(a)||a,dc(e,a,n);else return}we=!0}function hm(e,t,a,n,o,s){switch(a){case"style":Rv(e,n,s);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(M(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(M(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof n=="string")ur(e,n);else if(typeof n=="number"||typeof n=="bigint")ur(e,""+n);else return;break;case"onScroll":n!=null&&de("scroll",e);return;case"onScrollEnd":n!=null&&de("scrollend",e);return;case"onClick":n!=null&&(e.onclick=un);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!kv.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),s=a.slice(2,o?a.length-7:void 0),t=e[ea]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(s,t,o),typeof n=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(s,n,o);break e}we=!0,a in e?e[a]=n:n===!0?e.setAttribute(a,""):dc(e,a,n)}return}we=!0}function Et(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":de("error",e),de("load",e);var n=!1,o=!1,s;for(s in a)if(a.hasOwnProperty(s)){var c=a[s];if(c!=null)switch(s){case"src":n=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(M(137,t));default:ke(e,t,s,c,a,null)}}o&&ke(e,t,"srcSet",a.srcSet,a,null),n&&ke(e,t,"src",a.src,a,null);return;case"input":de("invalid",e);var d=s=c=o=null,h=null,g=null;for(n in a)if(a.hasOwnProperty(n)){var w=a[n];if(w!=null)switch(n){case"name":o=w;break;case"type":c=w;break;case"checked":h=w;break;case"defaultChecked":g=w;break;case"value":s=w;break;case"defaultValue":d=w;break;case"children":case"dangerouslySetInnerHTML":if(w!=null)throw Error(M(137,t));break;default:ke(e,t,n,w,a,null)}}zv(e,s,d,h,g,c,o,!1);return;case"select":de("invalid",e),n=c=s=null;for(o in a)if(a.hasOwnProperty(o)&&(d=a[o],d!=null))switch(o){case"value":s=d;break;case"defaultValue":c=d;break;case"multiple":n=d;default:ke(e,t,o,d,a,null)}t=s,a=c,e.multiple=!!n,t!=null?Wo(e,!!n,t,!1):a!=null&&Wo(e,!!n,a,!0);return;case"textarea":de("invalid",e),s=o=n=null;for(c in a)if(a.hasOwnProperty(c)&&(d=a[c],d!=null))switch(c){case"value":n=d;break;case"defaultValue":o=d;break;case"children":s=d;break;case"dangerouslySetInnerHTML":if(d!=null)throw Error(M(91));break;default:ke(e,t,c,d,a,null)}Mv(e,n,o,s);return;case"option":for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!=null)&&(h==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":ke(e,t,h,n,a,null));return;case"dialog":de("beforetoggle",e),de("toggle",e),de("cancel",e),de("close",e);break;case"iframe":case"object":de("load",e);break;case"video":case"audio":for(n=0;n<Ds.length;n++)de(Ds[n],e);break;case"image":de("error",e),de("load",e);break;case"details":de("toggle",e);break;case"embed":case"source":case"link":de("error",e),de("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(n=a[g],n!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(M(137,t));default:ke(e,t,g,n,a,null)}return;default:if(Cm(t)){for(w in a)a.hasOwnProperty(w)&&(n=a[w],n!==void 0&&hm(e,t,w,n,a,void 0));return}}for(d in a)a.hasOwnProperty(d)&&(n=a[d],n!=null&&ke(e,t,d,n,a,null))}var f5={};function b5(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,s=null,c=null,d=null,h=null,g=null,w=null;for($ in a){var N=a[$];if(a.hasOwnProperty($)&&N!=null)switch($){case"checked":break;case"value":break;case"defaultValue":h=N;default:n.hasOwnProperty($)||ke(e,t,$,null,n,N)}}for(var f in n){var $=n[f];if(N=a[f],n.hasOwnProperty(f)&&($!=null||N!=null))switch(f){case"type":$!==N&&(we=!0),s=$;break;case"name":$!==N&&(we=!0),o=$;break;case"checked":$!==N&&(we=!0),g=$;break;case"defaultChecked":$!==N&&(we=!0),w=$;break;case"value":$!==N&&(we=!0),c=$;break;case"defaultValue":$!==N&&(we=!0),d=$;break;case"children":case"dangerouslySetInnerHTML":if($!=null)throw Error(M(137,t));break;default:$!==N&&ke(e,t,f,$,n,N)}}Sh(e,c,d,h,g,w,s,o);return;case"select":$=c=d=f=null;for(s in a)if(h=a[s],a.hasOwnProperty(s)&&h!=null)switch(s){case"value":break;case"multiple":$=h;default:n.hasOwnProperty(s)||ke(e,t,s,null,n,h)}for(o in n)if(s=n[o],h=a[o],n.hasOwnProperty(o)&&(s!=null||h!=null))switch(o){case"value":s!==h&&(we=!0),f=s;break;case"defaultValue":s!==h&&(we=!0),d=s;break;case"multiple":s!==h&&(we=!0),c=s;default:s!==h&&ke(e,t,o,s,n,h)}t=d,a=c,n=$,f!=null?Wo(e,!!a,f,!1):!!n!=!!a&&(t!=null?Wo(e,!!a,t,!0):Wo(e,!!a,a?[]:"",!1));return;case"textarea":$=f=null;for(d in a)if(o=a[d],a.hasOwnProperty(d)&&o!=null&&!n.hasOwnProperty(d))switch(d){case"value":break;case"children":break;default:ke(e,t,d,null,n,o)}for(c in n)if(o=n[c],s=a[c],n.hasOwnProperty(c)&&(o!=null||s!=null))switch(c){case"value":o!==s&&(we=!0),f=o;break;case"defaultValue":o!==s&&(we=!0),$=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(M(91));break;default:o!==s&&ke(e,t,c,o,n,s)}Av(e,f,$);return;case"option":for(var A in a)f=a[A],a.hasOwnProperty(A)&&f!=null&&!n.hasOwnProperty(A)&&(A==="selected"?e.selected=!1:ke(e,t,A,null,n,f));for(h in n)f=n[h],$=a[h],n.hasOwnProperty(h)&&f!==$&&(f!=null||$!=null)&&(h==="selected"?(f!==$&&(we=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):ke(e,t,h,f,n,$));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var k in a)f=a[k],a.hasOwnProperty(k)&&f!=null&&!n.hasOwnProperty(k)&&ke(e,t,k,null,n,f);for(g in n)if(f=n[g],$=a[g],n.hasOwnProperty(g)&&f!==$&&(f!=null||$!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(M(137,t));break;default:ke(e,t,g,f,n,$)}return;default:if(Cm(t)){for(var _ in a)f=a[_],a.hasOwnProperty(_)&&f!==void 0&&!n.hasOwnProperty(_)&&hm(e,t,_,void 0,n,f);for(w in n)f=n[w],$=a[w],!n.hasOwnProperty(w)||f===$||f===void 0&&$===void 0||hm(e,t,w,f,n,$);return}}for(var y in a)f=a[y],a.hasOwnProperty(y)&&f!=null&&!n.hasOwnProperty(y)&&ke(e,t,y,null,n,f);for(N in n)f=n[N],$=a[N],!n.hasOwnProperty(N)||f===$||f==null&&$==null||ke(e,t,N,f,n,$)}function Ib(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function v5(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var o=a[n],s=o.transferSize,c=o.initiatorType,d=o.duration;if(s&&d&&Ib(c)){for(c=0,d=o.responseEnd,n+=1;n<a.length;n++){var h=a[n],g=h.startTime;if(g>d)break;var w=h.transferSize,N=h.initiatorType;w&&Ib(N)&&(h=h.responseEnd,c+=w*(h<d?1:(d-g)/(h-g)))}if(--n,t+=8*(s+c)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var mm=null,pm=null;function Hs(e){return e.nodeType===9?e:e.ownerDocument}function Ub(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function _w(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Hw(e,t,a,n){return a=Hs(a).createElement(e),a[Nt]=n,a[ea]=t,Et(a,e,t),bt(a),a}function gm(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var ch=null;function y5(){var e=window.event;return e&&e.type==="popstate"?e===ch?!1:(ch=e,!0):(ch=null,!1)}var pp=typeof setTimeout=="function"?setTimeout:void 0,w5=typeof clearTimeout=="function"?clearTimeout:void 0,qb=typeof Promise=="function"?Promise:void 0,Bb=typeof requestAnimationFrame=="function"?requestAnimationFrame:pp,$5=typeof queueMicrotask=="function"?queueMicrotask:typeof qb<"u"?function(e){return qb.resolve(null).then(e).catch(x5)}:pp;function x5(e){setTimeout(function(){throw e})}function xi(e){return e==="head"}function Lb(e,t){var a=t,n=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(o),wr(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")dh(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,dh(a);for(var s=a.firstChild;s;){var c=s.nextSibling,d=s.nodeName;s[Xs]||d==="SCRIPT"||d==="STYLE"||d==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=c}}else a==="body"&&dh(e.ownerDocument.body);a=o}while(a);wr(t)}function jb(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function Iw(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var n=1;else for(var o=n=0;o<t.length;o++){var s=t[o];0<s.width&&0<s.height&&n++}n===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function Uw(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function qw(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function fm(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return qw(t,a,e)}function N5(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return qw(t,a,e)}function S5(e){return e.documentElement.clientHeight}function T5(e){this.addEventListener("load",e),this.addEventListener("error",e)}function k5(e,t,a,n,o,s,c,d,h){var g=t.nodeType===9?t:t.ownerDocument;try{var w=g.startViewTransition({update:function(){var f=g.defaultView,$=f.navigation&&f.navigation.transition,A=g.fonts.status;n();var k=[];if(A==="loaded"&&(S5(g),g.fonts.status==="loading"&&k.push(g.fonts.ready)),A=k.length,e!==null)for(var _=e.suspenseyImages,y=0,v=0;v<_.length;v++){var b=_[v];if(!b.complete){var S=b.getBoundingClientRect();if(0<S.bottom&&0<S.right&&S.top<f.innerHeight&&S.left<f.innerWidth){if(y+=Pw(b),y>Ec){k.length=A;break}b=new Promise(T5.bind(b)),k.push(b)}}}if(0<k.length)return f=Promise.race([Promise.all(k),new Promise(function(O){return setTimeout(O,500)})]).then(o,o),($?Promise.allSettled([$.finished,f]):f).then(s,s);if(o(),$)return $.finished.then(s,s);s()},types:a});g.__reactViewTransition=w;var N=[];return w.ready.then(function(){for(var f=g.documentElement.getAnimations({subtree:!0}),$=0;$<f.length;$++){var A=f[$],k=A.effect,_=k.pseudoElement;if(_!=null&&_.startsWith("::view-transition")){N.push(A),A=k.getKeyframes();for(var y=_=void 0,v=!0,b=0;b<A.length;b++){var S=A[b],O=S.width;if(_===void 0)_=O;else if(_!==O){v=!1;break}if(O=S.height,y===void 0)y=O;else if(y!==O){v=!1;break}delete S.width,delete S.height,S.transform==="none"&&delete S.transform}v&&_!==void 0&&y!==void 0&&(k.setKeyframes(A),v=getComputedStyle(k.target,k.pseudoElement),v.width!==_||v.height!==y)&&(v=A[0],v.width=_,v.height=y,v=A[A.length-1],v.width=_,v.height=y,k.setKeyframes(A))}}c()},function(f){g.__reactViewTransition===w&&(g.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{n(),o(),c()}}),w.finished.finally(function(){for(var f=0;f<N.length;f++)N[f].cancel();g.__reactViewTransition===w&&(g.__reactViewTransition=null),d()}),w}catch{return n(),o(),c(),null}}function Gi(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Gi.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:Ve({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Gi.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),n=[],o=0;o<a.length;o++){var s=a[o].effect;s!==null&&s.target===e&&s.pseudoElement===t&&n.push(a[o])}return n};Gi.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function Bw(e){return{name:e,group:new Gi("group",e),imagePair:new Gi("image-pair",e),old:new Gi("old",e),new:new Gi("new",e)}}function ba(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}ba.prototype.addEventListener=function(e,t,a){var n=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(n=a.signal||null,n!==null&&n.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var s=this._eventListeners;if(Lw(s,e,t,a)===-1){var c=this,d=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(d=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),n!==null&&(o=c.removeEventListener.bind(c,e,t,a),n.addEventListener("abort",o,{once:!0}),o=n.removeEventListener.bind(n,"abort",o)),n=fr(a),s.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:d,cleanup:o}),Wt(this._fragmentFiber.child,!1,E5,e,d,n)}this._eventListeners=s}};function E5(e,t,a,n){return dt(e).addEventListener(t,a,n),!1}ba.prototype.removeEventListener=function(e,t,a){var n=this._eventListeners;if(n!==null&&(t=Lw(n,e,t,a),t!==-1)){var o=n[t];a=o.attachedListener;var s=o.cleanup;o=fr(o.optionsOrUseCapture),Wt(this._fragmentFiber.child,!1,C5,e,a,o),n.splice(t,1),s!==null&&s()}};function C5(e,t,a,n){return dt(e).removeEventListener(t,a,n),!1}function fr(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function Gb(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function Lw(e,t,a,n){if(e.length===0)return-1;n=Gb(n);for(var o=0;o<e.length;o++){var s=e[o];if(s.type===t&&s.listener===a&&Gb(s.optionsOrUseCapture)===n)return o}return-1}ba.prototype.dispatchEvent=function(e){var t=io(this._fragmentFiber);if(t===null)return!0;t=dt(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var n=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var s=a[o];n.addEventListener(s.type,s.attachedListener,fr(s.optionsOrUseCapture))}if(t.appendChild(n),e=n.dispatchEvent(e),a)for(o=0;o<a.length;o++)s=a[o],n.removeEventListener(s.type,s.attachedListener,fr(s.optionsOrUseCapture));return t.removeChild(n),e}return t.dispatchEvent(e)};ba.prototype.focus=function(e){Wt(this._fragmentFiber.child,!0,jw,e,void 0,void 0)};function jw(e,t){return e.tag===6?!1:(e=dt(e),q5(e,t))}ba.prototype.focusLast=function(e){var t=[];Wt(this._fragmentFiber.child,!0,gp,t,void 0,void 0);for(var a=t.length-1;0<=a&&!jw(t[a],e);a--);};function gp(e,t){return t.push(e),!1}ba.prototype.blur=function(){var e=io(this._fragmentFiber);e!==null&&(e=dt(e),e=Hs(e).activeElement,e!==null&&Wt(this._fragmentFiber.child,!1,z5,e,void 0,void 0))};function z5(e,t){return e.tag===6?!1:(e=dt(e),e===t||e.contains(t)?(t.blur(),!0):!1)}ba.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Wt(this._fragmentFiber.child,!1,A5,e,void 0,void 0)};function A5(e,t){return e.tag===6||(e=dt(e),t.observe(e)),!1}ba.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Wt(this._fragmentFiber.child,!1,M5,e,void 0,void 0);for(var a=t=0;a<Ga.length;a++){var n=Ga[a];n.fragmentInstance===this&&n.observer===e?e.unobserve(n.instance):Ga[t++]=n}Ga.length=t}};function M5(e,t){return e.tag===6||(e=dt(e),t.unobserve(e)),!1}var Ga=[],uh=!1;function R5(e,t,a){Ga.push({fragmentInstance:e,observer:t,instance:a}),uh||(uh=!0,B5(function(){uh=!1;var n=Ga;Ga=[];for(var o=0;o<n.length;o++){var s=n[o];s.observer.unobserve(s.instance)}}))}ba.prototype.getClientRects=function(){var e=[];return Wt(this._fragmentFiber.child,!1,O5,e,void 0,void 0),e};function O5(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=dt(e),t.push.apply(t,e.getClientRects());return!1}ba.prototype.getRootNode=function(e){var t=io(this._fragmentFiber);return t===null?this:dt(t).getRootNode(e)};ba.prototype.compareDocumentPosition=function(e){var t=io(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Wt(this._fragmentFiber.child,!1,gp,a,void 0,void 0);var n=dt(t);if(a.length===0){if(a=n,Nf(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=n=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:n&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=dv(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=dt(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=dt(a[0]),o=dt(a[a.length-1]);var s=Nf(this._fragmentFiber)?t.parentElement:n;if(s==null)return Node.DOCUMENT_POSITION_DISCONNECTED;n=s.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,s=s.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),d=o.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||d&Node.DOCUMENT_POSITION_CONTAINED_BY;return d=n&&s&&c&Node.DOCUMENT_POSITION_FOLLOWING&&d&Node.DOCUMENT_POSITION_PRECEDING,t=n&&t===e||s&&o===e||h||d?Node.DOCUMENT_POSITION_CONTAINED_BY:!n&&t===e||!s&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||V5(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function V5(e,t,a,n,o){var s=ji(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!s)e:{for(;s!==null;){if(s.tag===7&&(s===t||s.alternate===t)){a=!0;break e}s=s.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(s===null)return s=o.ownerDocument,o===s||o===s.documentElement||o===s.body;e:{for(s=t,t=io(t);s!==null;){if(!(s.tag!==5&&s.tag!==3&&s.tag!==27||s!==t&&s.alternate!==t)){s=!0;break e}s=s.return}s=!1}return s}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!s)&&!(t=s===a)&&(t=mh(a,s,Sf),t===null?t=!1:(Wt(t,!0,ux,s,a),s=qo,qo=null,t=s!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!s)&&!(t=s===n)&&(t=mh(n,s,Sf),t===null?t=!1:(Wt(t,!0,dx,s,n),s=qo,hh=qo=null,t=s!==null)),t):!1}function Yb(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}ba.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(M(566));var t=[];Wt(this._fragmentFiber.child,!1,gp,t,void 0,void 0);var a=e!==!1;if(t.length===0){var n=dv(this._fragmentFiber);if(n=a?n[1]||n[0]||io(this._fragmentFiber):n[0]||n[1],n===null)return;if(n.tag===6){e=dt(n),Yb(e,a);return}if(n=dt(n),n.nodeType!==9){if(n.nodeType===11){a="host"in n?n.host:null,a!==null&&a.scrollIntoView(e);return}n.scrollIntoView(e)}}for(n=a?t.length-1:0;n!==(a?-1:t.length);){var o=t[n];o.tag===6?(o=dt(o),Yb(o,a)):dt(o).scrollIntoView(e),n+=a?-1:1}};function D5(e,t){return e=dt(e),Gw(e,t),!1}function Gw(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function Yw(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.addEventListener(o.type,o.attachedListener,fr(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){for(var c=0,d=0;d<Ga.length;d++){var h=Ga[d];(h.fragmentInstance!==t||h.observer!==s||h.instance!==e)&&(Ga[c++]=h)}Ga.length=c,s.observe(e)}),Gw(e,t))}function _5(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.removeEventListener(o.type,o.attachedListener,fr(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){typeof s.rootMargin=="string"?R5(t,s,e):s.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function bm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":bm(a),ru(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function H5(e,t,a,n){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[Xs])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(s=e.getAttribute("rel"),s==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(s!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(s=e.getAttribute("src"),(s!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&s&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var s=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===s)return e}else return e;if(e=Ra(e.nextSibling),e===null)break}return null}function I5(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=Ra(e.nextSibling),e===null))return null;return e}function Xw(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Ra(e.nextSibling),e===null))return null;return e}function vm(e){return e.data==="$?"||e.data==="$~"}function fp(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function U5(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function Ra(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var ym=null;function Xb(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return Ra(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function Qb(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function q5(e,t){function a(){n=!0}if(e.ownerDocument.activeElement===e)return!0;var n=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return n}function B5(e){Bb(function(){Bb(function(t){return e(t)})})}function Qw(e,t,a){switch(t=Hs(a),e){case"html":if(e=t.documentElement,!e)throw Error(M(452));return e;case"head":if(e=t.head,!e)throw Error(M(453));return e;case"body":if(e=t.body,!e)throw Error(M(454));return e;default:throw Error(M(451))}}function Zw(e,t,a){for(var n in a){var o=a[n];a.hasOwnProperty(n)&&o!=null&&ke(e,t,n,null,f5,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===un&&(e.onclick=null),ru(e)}function dh(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);ru(e)}var Oa=new Map,Zb=new Set;function Is(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var _n=xe.d;xe.d={f:L5,r:j5,D:G5,C:Y5,L:X5,m:Q5,X:K5,S:Z5,M:J5};function L5(){var e=_n.f(),t=wu();return e||t}function j5(e){var t=xr(e);t!==null&&t.tag===5&&t.type==="form"?Ry(t):_n.r(e)}var kr=typeof document>"u"?null:document;function Kw(e,t,a){var n=kr;if(n&&typeof t=="string"&&t){var o=za(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),Zb.has(o)||(Zb.add(o),e={rel:e,crossOrigin:a,href:t},n.querySelector(o)===null&&(t=n.createElement("link"),Et(t,"link",e),bt(t),n.head.appendChild(t)))}}function G5(e){_n.D(e),Kw("dns-prefetch",e,null)}function Y5(e,t){_n.C(e,t),Kw("preconnect",e,t)}function X5(e,t,a){_n.L(e,t,a);var n=kr;if(n&&e&&t){var o='link[rel="preload"][as="'+za(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+za(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+za(a.imageSizes)+'"]')):o+='[href="'+za(e)+'"]';var s=o;switch(t){case"style":s=br(e);break;case"script":s=Er(e)}if(!(Oa.has(s)||(e=Ve({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),Oa.set(s,e),n.querySelector(o)!==null||t==="style"&&n.querySelector(Ps(s))||t==="script"&&n.querySelector(Ws(s))))){var c=n.createElement("link");Et(c,"link",e),t==="style"&&(c[Vc]=!0,c.onload=c.onerror=function(){Sv(c)}),bt(c),n.head.appendChild(c)}}}function Q5(e,t){_n.m(e,t);var a=kr;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+za(n)+'"][href="'+za(e)+'"]',s=o;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=Er(e)}if(!Oa.has(s)&&(e=Ve({rel:"modulepreload",href:e},t),Oa.set(s,e),a.querySelector(o)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Ws(s)))return}n=a.createElement("link"),Et(n,"link",e),bt(n),a.head.appendChild(n)}}}function Z5(e,t,a){_n.S(e,t,a);var n=kr;if(n&&e){var o=Po(n).hoistableStyles,s=br(e);t=t||"default";var c=o.get(s);if(!c){var d={loading:0,preload:null};if(c=n.querySelector(Ps(s)))d.loading=5;else{e=Ve({rel:"stylesheet",href:e,"data-precedence":t},a),(a=Oa.get(s))&&bp(e,a);var h=c=n.createElement("link");bt(h),Et(h,"link",e),h._p=new Promise(function(g,w){h.onload=g,h.onerror=w}),h.addEventListener("load",function(){d.loading|=1}),h.addEventListener("error",function(){d.loading|=2}),d.loading|=4,Tc(c,t,n)}c={type:"stylesheet",instance:c,count:1,state:d},o.set(s,c)}}}function K5(e,t){_n.X(e,t);var a=kr;if(a&&e){var n=Po(a).hoistableScripts,o=Er(e),s=n.get(o);s||(s=a.querySelector(Ws(o)),s||(e=Ve({src:e,async:!0},t),(t=Oa.get(o))&&vp(e,t),s=a.createElement("script"),bt(s),Et(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},n.set(o,s))}}function J5(e,t){_n.M(e,t);var a=kr;if(a&&e){var n=Po(a).hoistableScripts,o=Er(e),s=n.get(o);s||(s=a.querySelector(Ws(o)),s||(e=Ve({src:e,async:!0,type:"module"},t),(t=Oa.get(o))&&vp(e,t),s=a.createElement("script"),bt(s),Et(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},n.set(o,s))}}function Kb(e,t,a,n){var o=(o=ri.current)?Is(o):null;if(!o)throw Error(M(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=br(a.href),t=Po(o).hoistableStyles,n=t.get(a),n||(n={type:"style",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=br(a.href);var s=Po(o).hoistableStyles,c=s.get(e);if(c||(o=o.ownerDocument||o,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(e,c),(s=o.querySelector(Ps(e)))?s._p||(c.instance=s,c.state.loading=5):(s=Oa.get(e),s||(s={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Oa.set(e,s)),F5(o,e,s,c.state))),t&&n===null)throw Error(M(528,""));return c}if(t&&n!==null)throw Error(M(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=Er(a),t=Po(o).hoistableScripts,n=t.get(a),n||(n={type:"script",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(M(444,e))}}function br(e){return'href="'+za(e)+'"'}function Ps(e){return'link[rel="stylesheet"]['+e+"]"}function Jw(e){return Ve({},e,{"data-precedence":e.precedence,precedence:null})}function F5(e,t,a,n){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Vc]!==!0){n.loading=1;return}}else t=e.createElement("link"),t[Vc]=!0,t.onload=t.onerror=Sv.bind(null,t),Et(t,"link",a),bt(t),e.head.appendChild(t);n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2})}function Er(e){return'[src="'+za(e)+'"]'}function Ws(e){return"script[async]"+e}function Jb(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+za(a.href)+'"]');if(n)return t.instance=n,bt(n),n;var o=Ve({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),bt(n),Et(n,"style",o),Tc(n,a.precedence,e),t.instance=n;case"stylesheet":o=br(a.href);var s=e.querySelector(Ps(o));if(s)return t.state.loading|=4,t.instance=s,bt(s),s;n=Jw(a),(o=Oa.get(o))&&bp(n,o),s=(e.ownerDocument||e).createElement("link"),bt(s);var c=s;return c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),Et(s,"link",n),t.state.loading|=4,Tc(s,a.precedence,e),t.instance=s;case"script":return s=Er(a.src),(o=e.querySelector(Ws(s)))?(t.instance=o,bt(o),o):(n=a,(o=Oa.get(s))&&(n=Ve({},a),vp(n,o)),e=e.ownerDocument||e,o=e.createElement("script"),bt(o),Et(o,"link",n),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(M(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,Tc(n,a.precedence,e));return t.instance}function Tc(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=n.length?n[n.length-1]:null,s=o,c=0;c<n.length;c++){var d=n[c];if(d.dataset.precedence===t)s=d;else if(s!==o)break}s?s.parentNode.insertBefore(e,s.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function bp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function vp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var kc=null;function Fb(e,t,a){if(kc===null){var n=new Map,o=kc=new Map;o.set(a,n)}else o=kc,n=o.get(a),n||(n=new Map,o.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var s=a[o];if(!(s[Xs]||s[Nt]||e==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var c=s.getAttribute(t)||"";c=e+c;var d=n.get(c);d?d.push(s):n.set(c,[s])}}return n}function wm(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function P5(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Pb(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function Fw(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function Pw(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Wb(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=Pw(t),e.suspenseyImages.push(t)),e=tS.bind(e),t.decode().then(e,e))}function W5(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=br(n.href),s=t.querySelector(Ps(o));if(s){t=s._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Us.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=s,bt(s);return}s=t.ownerDocument||t,n=Jw(n),(o=Oa.get(o))&&bp(n,o),s=s.createElement("link"),bt(s);var c=s;c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),Et(s,"link",n),a.instance=s}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Us.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Ec=0;function eS(e,t){return e.stylesheets&&e.count===0&&Cc(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&Cc(e,e.stylesheets),e.unsuspend){var s=e.unsuspend;e.unsuspend=null,s()}},6e4+t);0<e.imgBytes&&Ec===0&&(Ec=62500*v5());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Cc(e,e.stylesheets),e.unsuspend)){var s=e.unsuspend;e.unsuspend=null,s()}},(e.imgBytes>Ec?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(o)}}:null}function Ww(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)Cc(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Us(){this.count--,Ww(this)}function tS(){this.imgCount--,Ww(this)}var nu=null;function Cc(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,nu=new Map,t.forEach(aS,e),nu=null,Us.call(e))}function aS(e,t){if(!(t.state.loading&4)){var a=nu.get(e);if(a)var n=a.get(null);else{a=new Map,nu.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<o.length;s++){var c=o[s];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),n=c)}n&&a.set(null,n)}o=t.instance,c=o.getAttribute("data-precedence"),s=a.get(c)||n,s===n&&a.set(null,o),a.set(c,o),this.count++,n=Us.bind(this),o.addEventListener("load",n),o.addEventListener("error",n),s?s.parentNode.insertBefore(o,s.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var vr={$$typeof:cn,Provider:null,Consumer:null,_currentValue:Yi,_currentValue2:Yi,_threadCount:0};function nS(e,t,a,n,o,s,c,d,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Ud(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ud(0),this.hiddenUpdates=Ud(null),this.identifierPrefix=n,this.onUncaughtError=o,this.onCaughtError=s,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function e0(e,t,a,n,o,s,c,d,h,g,w,N){return e=new nS(e,t,a,c,h,g,w,N,d),t=1,s===!0&&(t|=24),s=Ft(3,null,null,t),e.current=s,s.stateNode=e,t=Im(),t.refCount++,e.pooledCache=t,t.refCount++,s.memoizedState={element:n,isDehydrated:a,cache:t},Bm(s),e}function t0(e){return e?(e=Zo,e):Zo}function a0(e,t,a,n,o,s){o=t0(o),n.context===null?n.context=o:n.pendingContext=o,n=li(t),n.payload={element:a},s=s===void 0?null:s,s!==null&&(n.callback=s),a=ci(e,n,t),a!==null&&(Pt(a,e,t),bs(a,e,t))}function ev(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function yp(e,t){ev(e,t),(e=e.alternate)&&ev(e,t)}function n0(e){if(e.tag===13||e.tag===31){var t=so(e,67108864);t!==null&&Pt(t,e,67108864),yp(e,67108864)}}function tv(e){if(e.tag===13||e.tag===31){var t=ga();t=km(t);var a=so(e,t);a!==null&&Pt(a,e,t),yp(e,t)}}var yr=!0;function iS(e,t,a,n){var o=ee.T;ee.T=null;var s=xe.p;try{xe.p=2,wp(e,t,a,n)}finally{xe.p=s,ee.T=o}}function oS(e,t,a,n){var o=ee.T;ee.T=null;var s=xe.p;try{xe.p=8,wp(e,t,a,n)}finally{xe.p=s,ee.T=o}}function wp(e,t,a,n){if(yr){var o=$m(n);if(o===null)lh(e,t,n,iu,a),av(e,n);else if(sS(o,e,t,a,n))n.stopPropagation();else if(av(e,n),t&4&&-1<rS.indexOf(e)){for(;o!==null;){var s=xr(o);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var c=qi(s.pendingLanes);if(c!==0){var d=s;for(d.pendingLanes|=2,d.entangledLanes|=2;c;){var h=1<<31-pa(c);d.entanglements[1]|=h,c&=~h}bn(s),($e&6)===0&&(Pc=ha()+500,Fs(0,!1))}}break;case 31:case 13:d=so(s,2),d!==null&&Pt(d,s,2),wu(),yp(s,2)}if(s=$m(n),s===null&&lh(e,t,n,iu,a),s===o)break;o=s}o!==null&&n.stopPropagation()}else lh(e,t,n,null,a)}}function $m(e){return e=zm(e),$p(e)}var iu=null;function $p(e){if(iu=null,e=ji(e),e!==null){var t=Ls(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=lv(t),e!==null)return e;e=null}else if(a===31){if(e=cv(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return iu=e,null}function i0(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(wx()){case gv:return 2;case fv:return 8;case Oc:case $x:return 32;case bv:return 268435456;default:return 32}default:return 32}}var xm=!1,mi=null,pi=null,gi=null,qs=new Map,Bs=new Map,Wn=[],rS="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function av(e,t){switch(e){case"focusin":case"focusout":mi=null;break;case"dragenter":case"dragleave":pi=null;break;case"mouseover":case"mouseout":gi=null;break;case"pointerover":case"pointerout":qs.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Bs.delete(t.pointerId)}}function rs(e,t,a,n,o,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:s,targetContainers:[o]},t!==null&&(t=xr(t),t!==null&&n0(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function sS(e,t,a,n,o){switch(t){case"focusin":return mi=rs(mi,e,t,a,n,o),!0;case"dragenter":return pi=rs(pi,e,t,a,n,o),!0;case"mouseover":return gi=rs(gi,e,t,a,n,o),!0;case"pointerover":var s=o.pointerId;return qs.set(s,rs(qs.get(s)||null,e,t,a,n,o)),!0;case"gotpointercapture":return s=o.pointerId,Bs.set(s,rs(Bs.get(s)||null,e,t,a,n,o)),!0}return!1}function o0(e){var t=ji(e.target);if(t!==null){var a=Ls(t);if(a!==null){if(t=a.tag,t===13){if(t=lv(a),t!==null){e.blockedOn=t,Cf(e.priority,function(){tv(a)});return}}else if(t===31){if(t=cv(a),t!==null){e.blockedOn=t,Cf(e.priority,function(){tv(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function zc(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=$m(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);Th=n,a.target.dispatchEvent(n),Th=null}else return t=xr(a),t!==null&&n0(t),e.blockedOn=a,!1;t.shift()}return!0}function nv(e,t,a){zc(e)&&a.delete(t)}function lS(){xm=!1,mi!==null&&zc(mi)&&(mi=null),pi!==null&&zc(pi)&&(pi=null),gi!==null&&zc(gi)&&(gi=null),qs.forEach(nv),Bs.forEach(nv)}function cc(e,t){e.blockedOn===t&&(e.blockedOn=null,xm||(xm=!0,ht.unstable_scheduleCallback(ht.unstable_NormalPriority,lS)))}var uc=null;function iv(e){uc!==e&&(uc=e,ht.unstable_scheduleCallback(ht.unstable_NormalPriority,function(){uc===e&&(uc=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],o=e[t+2];if(typeof n!="function"){if($p(n||a)===null)continue;break}var s=xr(a);s!==null&&(e.splice(t,3),t-=3,Bh(s,{pending:!0,data:o,method:a.method,action:n},n,o))}}))}function wr(e){function t(h){return cc(h,e)}mi!==null&&cc(mi,e),pi!==null&&cc(pi,e),gi!==null&&cc(gi,e),qs.forEach(t),Bs.forEach(t);for(var a=0;a<Wn.length;a++){var n=Wn[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<Wn.length&&(a=Wn[0],a.blockedOn===null);)o0(a),a.blockedOn===null&&Wn.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var o=a[n],s=a[n+1],c=o[ea]||null;if(typeof s=="function")c||iv(a);else if(c){var d=null;if(s&&s.hasAttribute("formAction")){if(o=s,c=s[ea]||null)d=c.formAction;else if($p(o)!==null)continue}else d=c.action;typeof d=="function"?a[n+1]=d:(a.splice(n,3),n-=3),iv(a)}}}function r0(){function e(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(c){return o=c})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function xp(e){this._internalRoot=e}Nu.prototype.render=xp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(M(409));var a=t.current,n=ga();a0(a,n,e,t,null,null)};Nu.prototype.unmount=xp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;a0(e.current,2,null,e,null,null),wu(),t[$r]=null}};function Nu(e){this._internalRoot=e}Nu.prototype.unstable_scheduleHydration=function(e){if(e){var t=Nv();e={blockedOn:null,target:e,priority:t};for(var a=0;a<Wn.length&&t!==0&&t<Wn[a].priority;a++);Wn.splice(a,0,e),a===0&&o0(e)}};var ov=rv.version;if(ov!=="19.3.0")throw Error(M(527,ov,"19.3.0"));xe.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(M(188)):(e=Object.keys(e).join(","),Error(M(268,e)));return e=cx(t),e=e!==null?uv(e):null,e=e===null?null:e.stateNode,e};var cS={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:ee,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(ss=__REACT_DEVTOOLS_GLOBAL_HOOK__,!ss.isDisabled&&ss.supportsFiber))try{js=ss.inject(cS),ma=ss}catch{}var ss;Su.createRoot=function(e,t){if(!sv(e))throw Error(M(299));var a=!1,n="",o=qy,s=By,c=Ly;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=e0(e,1,!1,null,null,a,n,null,o,s,c,r0),e[$r]=t.current,mp(e),new xp(t)};Su.hydrateRoot=function(e,t,a){if(!sv(e))throw Error(M(299));var n=!1,o="",s=qy,c=By,d=Ly,h=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(d=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=e0(e,1,!0,t,a??null,n,o,h,s,c,d,r0),t.context=t0(null),a=t.current,n=ga(),n=km(n),o=li(n),o.callback=null,ci(a,o,n),a=n,t.current.lanes=a,Ys(t,a),bn(t),e[$r]=t.current,mp(e),new Nu(t)};Su.version="19.3.0"});var u0=tn((x2,c0)=>{"use strict";function l0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(l0)}catch(e){console.error(e)}}l0(),c0.exports=s0()});var E0=tn(Cu=>{"use strict";var fS=Symbol.for("react.transitional.element"),bS=Symbol.for("react.fragment");function k0(e,t,a){var n=null;if(a!==void 0&&(n=""+a),t.key!==void 0&&(n=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:fS,type:e,key:n,ref:t!==void 0?t:null,props:a}}Cu.Fragment=bS;Cu.jsx=k0;Cu.jsxs=k0});var Tp=tn((R2,C0)=>{"use strict";C0.exports=E0()});var m=Hl(Ul()),K0=Hl(u0());function uS(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),n="",o=[],s=[];for(let c=0;c<a.length;c++){let d=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(d)?.[1];if(h&&(n?h[0]===n[0]&&h.length>=n.length&&(n=""):n=h),!n&&!d.trim()&&(!t||c<a.length-1)){let g=o.join(`
`).trim();g&&s.push(g),o=[]}else o.push(d)}if(!t){let c=o.join(`
`).trim();c&&s.push(c)}return s}var dS=['"',"'","\u201D","\u2019","\xBB","\u300D"],hS=['"',"'","\u201C","\u2018","\xAB","\u300C"];function d0(e){let t=e.trim();return dS.includes(t.slice(-1))&&hS.some(n=>t.slice(0,-1).includes(n))?"speech":"prose"}function h0(e,t){let a=uS(e),n=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return n();let o=[],s=[],c=[],d=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){o.push(a[h]),s.push(d),c.push(g.expression??null),d=[];continue}let w={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};o.length?s[s.length-1].push(w):d.push(w)}return o.length===0?n():{paragraphs:o,asides:s,expressions:c}}var mS="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function co(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],n=new RegExp(mS,"g"),o=0,s,c=d=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+d};return}a.push({kind:"text",text:d})};for(;(s=n.exec(e))!==null;)s.index>o&&c(e.slice(o,s.index)),s[1]!=null?c(s[1]):s[2]!=null&&s[3]!=null?a.push({kind:"link",text:s[2],href:s[3]}):s[4]!=null?a.push({kind:"code",text:s[4]}):s[5]!=null?a.push({kind:"styled",style:"highlight",children:co(s[5],t+1)}):s[6]!=null?a.push({kind:"styled",style:"strikethrough",children:co(s[6],t+1)}):s[7]!=null?a.push({kind:"styled",style:"bold-italic",children:co(s[7],t+1)}):s[8]!=null?a.push({kind:"styled",style:"bold",children:co(s[8],t+1)}):s[9]!=null?a.push({kind:"styled",style:"underline",children:co(s[9],t+1)}):(s[10]!=null||s[11]!=null)&&a.push({kind:"styled",style:"italic",children:co(s[10]??s[11],t+1)}),o=s.index+s[0].length;return o<e.length&&c(e.slice(o)),a}function m0(e){return co(e,0)}function Hn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function p0(e){return e===null||typeof e=="string"}function g0(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function Tu(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function pS(e){return e===null?!0:Hn(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function gS(e){if(!Hn(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.purpose!="string"||typeof e.category!="string"||!Tu(e.capabilities)||!Hn(e.presentation)||!Hn(e.occupancy)||!Hn(e.state))return!1;let{presentation:t,occupancy:a,state:n}=e;return pS(t.image)&&g0(t.x)&&g0(t.y)&&typeof a.playerHome=="boolean"&&p0(a.residentCharacterId)&&p0(a.homeKind)&&typeof n.condition=="string"&&Tu(n.upgrades)&&Tu(n.furniture)&&Tu(n.publicFacts)&&typeof n.updatedAt=="string"}function f0(e){if(!Hn(e)||!Hn(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(gS),n=Array.isArray(e.venueRequests)?e.venueRequests:[],o=n.filter(s=>Hn(s)&&typeof s.id=="string"&&Hn(s.venueDraft)&&typeof s.venueDraft.name=="string"&&typeof s.venueDraft.purpose=="string"&&typeof s.venueDraft.category=="string");return a.length===t.length&&o.length===n.length&&n===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function b0(e,t,a){return e==="Enter"&&!t&&!a}function ku(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,n=>n.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function v0(e,t,a,n){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(n,o)}function y0(e,t){return t<0||t===e?"front":t<e?"left":"right"}function w0(e,t,a){let n=a==="front"?"front":"side",o=e.find(s=>s.view===n&&s.label===t)??e.find(s=>s.view===n&&s.label==="neutral")??e.find(s=>s.view==="front"&&s.label===t)??e.find(s=>s.view==="front"&&s.label==="neutral");return o?{image:o,mirrored:o.view==="side"&&a==="left"}:null}function $0(e,t,a){let n=.2*a.photoWidth/a.width,o=.2*a.photoHeight/a.height;return t.some(s=>s.x!==null&&s.y!==null&&Math.abs(s.x-e.x)<n&&Math.abs(s.y-e.y)<o)}function x0(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var Ni=(e,t,a)=>Math.min(a,Math.max(t,e));function Eu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function Np(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let n=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,Eu(e,t)),s=e.width*n*o,c=e.height*n*o,d=t.width/2-a.centerX*s,h=t.height/2-a.centerY*c;return{left:s<=t.width?(t.width-s)/2:Ni(d,t.width-s,0),top:c<=t.height?(t.height-c)/2:Ni(h,t.height-c,0),width:s,height:c}}function N0(e,t,a,n,o,s){let c=Np(e,t,a);if(!c.width||!c.height)return a;let d=Eu(e,t),h=Ni(a.zoom*s,d,Math.max(4,d*2)),g=h/Math.max(a.zoom,d),w=c.width*g,N=c.height*g,f=(n.x-c.left)/c.width,$=(n.y-c.top)/c.height,A=o.x-f*w,k=o.y-$*N;return{zoom:h,centerX:Ni((t.width/2-A)/w,0,1),centerY:Ni((t.height/2-k)/N,0,1)}}function S0(e,t){let a=Math.max(1,t),n=Math.max(4,a*2);return .32+1.03*((Ni(e,a,n)-a)/(n-a))}function T0(e,t){return t?Math.max(1,e):e}function Sp(e,t,a){let n=Math.min(90,t.width/2),o=64,s=116,c=e.left+a.x*e.width,d=e.top+a.y*e.height,h=d+o,g=h+s<=t.height?h:d-o-s;return{left:Ni(c,n,t.width-n),top:Ni(g,0,Math.max(0,t.height-s))}}var r=Hl(Tp()),i="marinara-capability-villages",z0="marinara-capability-villages-styles",vS="/api/villages",yS=.7,Vp=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"After a devastating upheaval, scattered survivors founded this village to begin again. Shared work and mutual dependence shaped its first homes and customs."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"Drawn by a distant purpose, a small group crossed into unfamiliar country and established a foothold. Their first journeys shaped the paths and customs of the village they built."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"Makers, merchants, and newcomers founded this village at a promising crossroads. Its first workshops and exchanges shaped a place built around craft and opportunity."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"No scenario",description:"Let life unfold.",icon:"\u221E",premise:""}],el=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),wS={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},Cr=e=>Vp.find(t=>t.value===e),$S=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,A0={roads:!0,structures:!1,water:!1},tl=["Village Identity","Connections & Persona","World & Setting","Scenario Imprint","Village Map","Build the Village","Review"],M0=1,kp=3,Ep="__villages_image_disabled__",Mu=["neutral","happy","sad","angry","surprised","thinking"];function R0(e,t,a,n,o=!1,s=1){let c=t==="gathering"?"Gathering Place":o?"Your residence":`Residence ${s}`;return{id:e,name:c,form:t==="gathering"?"Gathering place":"Home",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],purpose:"",description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:n},occupancy:{playerHome:o,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""},guidance:""}}function xS(e){let t=[];for(let a of e){let n=t[t.length-1];n&&n.label===a.dateLabel?n.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}var J0={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function zu(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function NS(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let n=Math.floor(a/36e5),o=Math.max(1,Math.ceil(a%36e5/6e4));return n>0?`${n}h ${o}m left`:`${o}m left`}function SS({library:e,busy:t,onRefresh:a,onForget:n}){let[o,s]=(0,m.useState)("all"),[c,d]=(0,m.useState)(""),[h,g]=(0,m.useState)(""),[w,N]=(0,m.useState)(null),[f,$]=(0,m.useState)(""),A=Date.now(),k=(b,S)=>(!h.trim()||`${b} ${S.map(O=>O.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||S.some(O=>O.id===c)),_=(e?.recollections??[]).filter(b=>k(b.text,[...b.subjects,...b.knownBy])),y=(e?.durable??[]).filter(b=>k(b.text,[...b.subjects,...b.knownBy])),v=async(b,S)=>{try{let O=await D(`/rooms/archive/${encodeURIComponent(b)}`);N({visit:O.visit,lineIds:S}),$("")}catch(O){N(null),$(U(O,"The source visit could not be read."))}};return(0,r.jsxs)("div",{className:`${i}-memory-library`,children:[(0,r.jsxs)("section",{className:`${i}-memory-hero`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-kicker`,children:"Continuity, with receipts"}),(0,r.jsx)("h3",{children:"What your villagers carry forward"}),(0,r.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,r.jsxs)("div",{className:`${i}-memory-stats`,children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,r.jsxs)("div",{className:`${i}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"01"}),(0,r.jsx)("strong",{children:"Passing"}),(0,r.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"02"}),(0,r.jsx)("strong",{children:"Durable"}),(0,r.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"03"}),(0,r.jsx)("strong",{children:"Archive"}),(0,r.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,r.jsxs)("div",{className:`${i}-memory-health`,role:"status",children:[(0,r.jsx)("span",{children:"\u25C7"}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,r.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,r.jsxs)("div",{className:`${i}-memory-toolbar`,children:[(0,r.jsx)("div",{className:`${i}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([b,S])=>(0,r.jsx)("button",{type:"button","data-active":o===b,onClick:()=>s(b),children:S},b))}),(0,r.jsx)("input",{type:"search",value:h,onChange:b=>g(b.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,r.jsxs)("select",{value:c,onChange:b=>d(b.target.value),"aria-label":"Filter memories by resident",children:[(0,r.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(b=>(0,r.jsx)("option",{value:b.id,children:b.name},b.id))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&o!=="durable"&&_.length>0?(0,r.jsxs)("section",{className:`${i}-memory-section`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,r.jsx)("h3",{children:"Passing recollections"})]}),(0,r.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,r.jsx)("div",{className:`${i}-memory-grid`,children:_.map(b=>{let S=b.evidence[b.evidence.length-1]??{visitId:b.visitId,lineIds:[]};return(0,r.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"passing",children:[(0,r.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${i}-memory-pill`,children:"Passing"}),(0,r.jsx)("span",{children:NS(b.expiresAt,A)})]}),(0,r.jsx)("p",{className:`${i}-memory-text`,children:b.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:zu(b.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:zu(b.knownBy)})]})]}),b.reinforcementCount>0?(0,r.jsxs)("p",{className:`${i}-memory-reinforced`,children:["\u21BB Reinforced ",b.reinforcementCount," ",b.reinforcementCount===1?"time":"times"]}):null,(0,r.jsxs)("div",{className:`${i}-memory-card-actions`,children:[(0,r.jsx)("button",{type:"button",onClick:()=>{v(S.visitId,S.lineIds)},children:"View evidence"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>n("recollections",b.id),children:"Let go"})]})]},b.id)})})]}):null,e&&o!=="passing"&&y.length>0?(0,r.jsxs)("section",{className:`${i}-memory-section`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,r.jsx)("h3",{children:"Durable memories"})]}),(0,r.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,r.jsx)("div",{className:`${i}-memory-grid`,children:y.map(b=>(0,r.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"durable",children:[(0,r.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${i}-memory-pill`,children:b.memoryCategory?J0[b.memoryCategory]:b.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,r.jsxs)("span",{children:[b.dateLabel,Dp(b)?` \xB7 ${Dp(b)}`:""]})]}),(0,r.jsx)("p",{className:`${i}-memory-text`,children:b.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:zu(b.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:zu(b.knownBy)})]})]}),(0,r.jsxs)("div",{className:`${i}-memory-card-actions`,children:[b.evidence?(0,r.jsx)("button",{type:"button",onClick:()=>{v(b.evidence.visitId,b.evidence.lineIds)},children:"View evidence"}):(0,r.jsx)("span",{className:`${i}-memory-legacy`,children:"No evidence link on this older memory"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>n("durable",b.id),children:"Forget"})]})]},b.id))})]}):null,e&&(o!=="durable"&&_.length||o!=="passing"&&y.length)===0?(0,r.jsxs)("div",{className:`${i}-memory-empty`,children:[(0,r.jsx)("span",{children:"\u2727"}),(0,r.jsx)("h3",{children:"No memories match"}),(0,r.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,r.jsxs)("p",{className:`${i}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null,w?(0,r.jsxs)("section",{className:`${i}-memory-evidence`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,r.jsxs)("h3",{children:["Exact evidence \xB7 ",w.visit.placeName]})]}),(0,r.jsx)("button",{type:"button",onClick:()=>N(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,r.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,r.jsx)("ol",{children:w.visit.lines.filter(b=>w.lineIds.includes(b.id)).map(b=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:b.name||"Player"}),(0,r.jsxs)("small",{children:[Ru(b.at)," \xB7 heard by"," ",b.heardBy.map(S=>w.visit.participants.find(O=>O.characterId===S)?.name??S).join(", ")||"no one"]})]}),zr(b.content,`memory-evidence-${b.id}-`)]},b.id))})]}):null]})}function Ru(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":a1.format(t)}function Dp(e){return Ru(e.occurredAt)}function TS(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function O0(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Cp(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var kS=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function ES(e,t){let a=[],n=Date.parse(e);if(Number.isFinite(n)){let s=Math.floor((Date.now()-n)/864e5);a.push(s<=0?"written today":s===1?"written yesterday":`written ${s} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${kS.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function CS(e,t){let a=e.find(n=>n.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(n=>n.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?je(a,t.spaceClass).image:null)?.url??"":""}var _p=class extends m.Component{constructor(){super(...arguments);Lg(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let n=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=n,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:n},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${i}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h1",{className:`${i}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${i}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},zS=`
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
.${i}-setup-root { box-sizing: border-box; container-type: inline-size; }
.${i}-setup-root:has(.${i}-setup-body[data-step="0"]) {
  --background: #121936; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  background: radial-gradient(circle at 12% 95%, #263978, #111832 50%, #0e1430);
  color: #f3f3ff;
}
.${i}-setup-body { flex-wrap: nowrap; align-items: stretch; }
.${i}-setup-body > .${i}-side { flex: 1 1 34rem; }
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
.${i}-setup-body[data-step="0"] {
  --background: #151d3b; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  gap: .75rem; align-items: flex-start; color: var(--foreground);
}
.${i}-setup-body[data-step="0"] > .${i}-side { flex-basis: 35rem; }
.${i}-setup-body[data-step="0"] .${i}-overlay {
  gap: .2rem; padding: .65rem .8rem; border-color: #5268b8; border-radius: 1rem;
  background: linear-gradient(145deg, #182044, #101831);
  box-shadow: inset 0 0 2rem #27347866;
}
.${i}-setup-body[data-step="0"] .${i}-panel-title {
  font-size: clamp(1.25rem, 1.8vw, 1.65rem); color: #f5f5ff;
}
.${i}-setup-body[data-step="0"] .${i}-field { margin-top: .15rem; }
.${i}-setup-body[data-step="0"] .${i}-search,
.${i}-setup-body[data-step="0"] .${i}-textarea {
  background: #1c254a; border-color: #7082cf; color: #f2f4ff;
}
.${i}-setup-body[data-step="0"] .${i}-setup-premise .${i}-textarea {
  height: 3.25rem;
}
.${i}-setup-body[data-step="0"] .${i}-setup-guidance .${i}-textarea {
  height: 2.5rem; min-height: 2.5rem;
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
  position: relative; flex: 1 1 19rem; min-width: 0; height: 24.5rem; min-height: 0;
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${i}-scenario-art-panel > img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
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
.${i}-scenario-next {
  width: min(100%, 15rem); margin-top: .55rem; padding: .65rem;
  border-color: #7584ff; background: linear-gradient(135deg, #6077ff, #7365ed); color: #fff;
  font-size: 1rem; font-weight: 700;
}
@container (min-width: 80rem) {
  .${i}-scenario-options { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
@container (min-width: 42.01rem) and (max-width: 80rem) {
  .${i}-setup-body[data-step="0"] .${i}-setup-premise .${i}-textarea {
    height: 4.25rem;
  }
}
@container (max-width: 70rem) {
  .${i}-setup-body { flex-wrap: wrap; }
  .${i}-setup-rail {
    flex: 1 1 100%; flex-direction: row; overflow-x: auto; padding: .25rem 0;
  }
  .${i}-setup-rail-step { flex: 0 0 auto; }
}
@container (min-width: 42.01rem) and (max-width: 70rem) {
  .${i}-setup-body[data-step="0"] > .${i}-side { flex-basis: 25rem; }
  .${i}-setup-body[data-step="0"] > .${i}-scenario-art-panel { flex-basis: 14rem; }
}
@container (max-width: 42rem) {
  .${i}-setup-body > .${i}-side,
  .${i}-scenario-art-panel,
  .${i}-setup-map-shell { flex: 1 1 100%; }
  .${i}-scenario-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .${i}-scenario-art-panel { height: 18rem; min-height: 18rem; }
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
`;function V0(){let e=document.getElementById(z0);if(!document.querySelector(i)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=z0,t.textContent=zS,document.head.appendChild(t)}var AS="marinara_admin_secret";function F0(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(AS)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var MS="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function P0(e,t,a){let n=e?.error,o=typeof n=="string"&&n?n:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${MS} (${o})`):new Error(o)}async function D(e,t){let a=await fetch(`${vS}${e}`,{...t,headers:F0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw P0(n,a.status,`The village replied ${a.status}.`);return f0(n)}async function Up(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:F0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw P0(n,a.status,`The Engine replied ${a.status}.`);return n}var uo=e=>typeof e=="number"&&Number.isFinite(e);function W0(e){let t=e;for(let N=0;N<2&&typeof t=="string";N+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:n,srcY:o,srcWidth:s,srcHeight:c}=a;if(uo(n)&&uo(o)&&uo(s)&&uo(c))return s<=0||c<=0||n<0||o<0||n+s>1.001||o+c>1.001?null:{srcX:n,srcY:o,srcWidth:s,srcHeight:c};let{zoom:d,offsetX:h,offsetY:g,fullImage:w}=a;return!uo(d)||d<=0||!uo(h)||!uo(g)||w!==void 0&&typeof w!="boolean"?null:w===void 0?{zoom:d,offsetX:h,offsetY:g}:{zoom:d,offsetX:h,offsetY:g,fullImage:w}}function RS(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function OS(e,t){if(e.length===0)return{};let a=await Up("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),n={};if(!Array.isArray(a))return n;for(let o of a){let s=typeof o?.id=="string"?o.id:"",c=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";s.length>0&&c.length>0&&(n[s]={url:c,crop:W0(o.avatarCrop)})}return n}async function VS(e,t){let a=e.trim();if(a.length===0)return null;let n=await Up(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof n?.avatarPath=="string"?n.avatarPath.trim():"";return o.length===0?null:{url:o,crop:W0(n.avatarCrop)}}function DS(e){let t=[];for(let a of e){let n=typeof a.id=="string"?a.id.trim():"";if(n.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let s=typeof a.name=="string"&&a.name.trim()?a.name.trim():n;t.push({id:n,name:s,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function U(e,t){return e instanceof Error&&e.message?e.message:t}function al(e){let t=U(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function D0(e){try{let{session:t}=await D("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}function _0(e){let t=U(e,"The greeting could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The greeting took too long. Retry it or continue without a greeting.":`${t} Retry it or continue without a greeting.`}function zr(e,t){return e1(m0(e),t)}function e1(e,t){let a=0;return e.map(n=>{let o=`${t}${a++}`;switch(n.kind){case"text":return n.text;case"code":return(0,r.jsx)("code",{className:`${i}-chat-md-code`,dir:"ltr",children:n.text},o);case"link":return(0,r.jsx)("a",{className:`${i}-chat-md-link`,href:n.href,target:"_blank",rel:"noopener noreferrer",children:n.text},o);default:return _S(n,o)}})}function _S(e,t){let a=e1(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${i}-chat-md-highlight`,children:a},t)}}function HS(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function Ar(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var t1=["residence","workplace","gathering","other"];function Un(e){return e.classes?.length?e.classes:Ar(e)?["residence"]:["other"]}function H0(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function Ou(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function je(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function I0({draft:e,existing:t,villagers:a,editableClasses:n,onChange:o}){let s=Un(e),c=(d,h)=>{let g=s.map(w=>w===d?{...je(e,w),...h}:je(e,w));o({...e,spaces:g,description:g[0]?.description??e.description})};return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.name,maxLength:100,onChange:d=>o({...e,name:d.target.value}),placeholder:"The Lantern Workshop"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form ",(0,r.jsx)("span",{className:`${i}-hint`,children:"What is it, in your world?"}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.form??"",maxLength:200,onChange:d=>o({...e,form:d.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Purpose",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.purpose,maxLength:200,onChange:d=>o({...e,purpose:d.target.value}),placeholder:"What happens here?"})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map pin \xB7 optional"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,r.jsx)("div",{className:`${i}-row`,children:["x","y"].map(d=>(0,r.jsxs)("label",{className:`${i}-label`,children:[d==="x"?"Across":"Down",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[d]??"",disabled:t&&Ou(e)>0,onChange:h=>o({...e,presentation:{...e.presentation,[d]:h.target.value===""?null:Number(h.target.value)}})})]},d))}),t&&Ou(e)>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:t1.map(d=>(0,r.jsxs)("label",{className:`${i}-label`,style:{textTransform:"capitalize"},children:[(0,r.jsx)("input",{type:"checkbox",checked:s.includes(d),disabled:t||!s.includes(d)&&s.length>=2,onChange:h=>{let g=h.target.checked?[...s,d]:s.filter(w=>w!==d);g.length<1||g.length>2||o({...e,classes:g,spaces:g.map(w=>je(e,w))})}})," ",d]},d))}),t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Class changes go through a Venue proposal."}):null]}),s.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:d=>o({...e,residenceCapacity:Number(d.target.value)})}),t?(0,r.jsx)("span",{className:`${i}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,s.includes("workplace")?(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Workers"}),a.map(d=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(d.characterId),onChange:h=>o({...e,workerIds:h.target.checked?[...e.workerIds??[],d.characterId]:(e.workerIds??[]).filter(g=>g!==d.characterId)})})," ",d.name]},d.characterId)),a.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No villagers are available yet."}):null]}):null,s.filter(d=>!n||n.includes(d)).map(d=>{let h=je(e,d);return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,style:{textTransform:"capitalize"},children:[d," space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.description,maxLength:1e3,onChange:g=>c(d,{description:g.target.value})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Current physical state used by visits and pictures."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:h.state.condition,onChange:g=>c(d,{state:{...h.state,condition:g.target.value}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.items.join(`
`),onChange:g=>c(d,{state:{...h.state,items:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.publicFacts.join(`
`),onChange:g=>c(d,{state:{...h.state,publicFacts:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((g,w)=>(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,value:g.text,"aria-label":`Feature ${w+1}`,onChange:N=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,text:N.target.value}:f)}})}),(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g.locked,onChange:N=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,locked:N.target.checked}:f)}})})," ","Locked"]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,"aria-label":`Remove feature ${w+1}`,onClick:()=>c(d,{state:{...h.state,features:h.state.features.filter(N=>N.id!==g.id)}}),children:"\xD7"})]},g.id)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:h.state.features.length>=5,onClick:()=>c(d,{state:{...h.state,features:[...h.state.features,{id:ku(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},d)})]})}function Hp(e){return e.filter(t=>Ar(t))}function In(e){return e.filter(t=>!Ar(t)||Un(t).some(a=>a!=="residence"))}function IS(e,t){let a=Hp(e);return a.length!==t.length?!1:t.every((n,o)=>{let s=a[o];return s.id===n.id&&s.name===n.name&&(s.form??"Home")===n.form&&s.occupancy.playerHome===n.isPlayerHome&&s.occupancy.residentCharacterId===n.characterId&&s.description===n.description&&Math.abs((s.presentation.x??-1)-(n.x??-1))<1e-4&&Math.abs((s.presentation.y??-1)-(n.y??-1))<1e-4})}function US(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let s=a.get(o.id);return{id:o.id,name:o.name,form:o.form,classes:["residence"],spaces:[{...je(s??{id:o.id,name:o.name,description:o.description,purpose:"",category:"",presentation:{image:null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}},"residence"),description:o.description}],residenceCapacity:s?.residenceCapacity??1,residentIds:o.characterId?[o.characterId]:[],improvements:s?.improvements??[null,null],purpose:s?.purpose??"",description:o.description,category:s?.category??"",presentation:{image:s?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:s?.capabilities??[],state:s?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...e.filter(o=>!Ar(o))]}function ho(){return Math.random().toString(36).slice(2,10)}function mo(e){return Math.round(e*1e4)/1e4}var qS=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),a1=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),BS=6e4,LS=700;function U0(e){return`${qS.format(e)} \xB7 ${a1.format(e)}`}function jS(){let[e,t]=(0,m.useState)(()=>U0(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(U0(new Date)),1e3);return()=>clearInterval(a)},[]),e}function GS(){let[e,t]=jS().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${i}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function YS({weather:e}){return(0,r.jsxs)("span",{className:`${i}-mobile-datetime`,children:[(0,r.jsx)(GS,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:XS(e)})]})}function XS(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function q0(e){return e?.closest(i)??null}function QS(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(q0(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,n=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":n,title:n,onClick:o=>{let s=q0(o.currentTarget);if(!s)return;if(document.fullscreenElement===s){document.exitFullscreen().catch(()=>{});return}let c=s.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function ZS({happenings:e,recap:t,mobile:a=!1}){let n=(0,m.useRef)(null),[o,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=n.current;if(!c)return;let d=()=>s(c.open);return c.addEventListener("toggle",d),()=>c.removeEventListener("toggle",d)},[]),(0,m.useEffect)(()=>{if(!o)return;let c=d=>{!(d.target instanceof Node)||n.current?.contains(d.target)||n.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[o]),(0,r.jsxs)("details",{ref:n,className:`${i}-news`,children:[(0,r.jsxs)("summary",{className:`${i}-button ${i}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${i}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${i}-news-panel`,children:[(0,r.jsx)("h2",{className:`${i}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${i}-news-list`,children:t.details.map(c=>(0,r.jsx)("li",{className:`${i}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,r.jsx)("p",{className:`${i}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${i}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${i}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${i}-news-list`,children:e.map(c=>(0,r.jsx)("li",{className:`${i}-news-item`,children:c.text},c.id))})]})]})}function n1(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function KS(e){return e.length>0?n1(e,!0):"Empty house"}function B0(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function L0(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function JS(e,t){return t.length>0?n1(t,!0):e.name||"An empty house"}function nl(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var FS=.028;function il(e){return new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(typeof n.result=="string"?n.result:""),n.onerror=()=>a(new Error("That picture could not be read.")),n.readAsDataURL(e)})}function zp(e){return new Promise((t,a)=>{let n=new Image;n.onload=()=>t({width:n.naturalWidth,height:n.naturalHeight}),n.onerror=()=>a(new Error("That picture could not be read.")),n.src=e})}var j0=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function Ap(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function Mp(e,t,a){return e<t?t:e>a?a:e}function PS(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),d=e.width*c,h=e.height*c;return{left:(t.width-d)/2,top:(t.height-h)/2,width:d,height:h}}let n=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*n,s=e.height*n;return{left:(t.width-o)*(a.focusX/100),top:(t.height-s)*(a.focusY/100),width:o,height:s}}function WS(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Au(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function Rp({src:e,alt:t,pins:a,placing:n,view:o,shape:s,zoom:c,onPlace:d,onView:h,onDismiss:g,compact:w,fitToRoom:N,mobile:f,photoPins:$,children:A}){let k=d!==void 0,_=h!==void 0,y=(0,m.useRef)(null),v=(0,m.useRef)(null),[b,S]=(0,m.useState)(null),[O,F]=(0,m.useState)(null),[I,B]=(0,m.useState)(null),ve=(0,m.useRef)(null),Y=(0,m.useRef)(new Map),Ne=(0,m.useRef)(null),[it,Qa]=(0,m.useState)(null),[Si,Ot]=(0,m.useState)(null),mt=(0,m.useRef)(null),q=(0,m.useRef)(null),ae=(0,m.useRef)(!1),[Xe,va]=(0,m.useState)(null),ne=(0,m.useMemo)(()=>Xe?{...o,...Xe}:o,[Xe,o]),ge=e?b?.src===e?b:null:s,go={zoom:ge&&O?Eu(ge,O):1,centerX:.5,centerY:.5},ta=I??go,X=(0,m.useMemo)(()=>f?ge&&O?Np(ge,O,ta):null:e?b&&b.src===e&&O?PS(b,O,ne):null:O?{left:0,top:0,width:O.width,height:O.height}:null,[b,O,ne,f,ge,ta,e]);(0,m.useEffect)(()=>{B(null),ve.current=null,Y.current.clear(),Ne.current=null},[e,O?.width,O?.height]);let jt=s?N&&it?{width:`${it.width}px`,height:`${it.height}px`,aspectRatio:`${s.width} / ${s.height}`}:{aspectRatio:`${s.width} / ${s.height}`}:void 0,Za=(0,m.useCallback)(()=>{let z=v.current;if(!z)return;let H=z.getBoundingClientRect();H.width===0||H.height===0||F(Q=>Q&&Q.width===H.width&&Q.height===H.height?Q:{width:H.width,height:H.height})},[]);(0,m.useEffect)(()=>{let z=v.current;if(!z||typeof ResizeObserver>"u")return;let H=new ResizeObserver(()=>Za());return H.observe(z),()=>H.disconnect()},[Za]);let Va=(0,m.useCallback)(()=>{let z=y.current?.parentElement;if(!z||!s)return;let H=z.getBoundingClientRect(),Q=getComputedStyle(z),Ue=Fe=>Number.parseFloat(Q.getPropertyValue(Fe))||0,qe=H.width-Ue("padding-left")-Ue("padding-right"),Je=H.height-Ue("padding-top")-Ue("padding-bottom"),Qe=s.width/s.height,G=Math.min(qe,Je*Qe);G>0&&Qa(Fe=>Fe&&Math.abs(Fe.width-G)<.5?Fe:{width:G,height:G/Qe})},[s]);(0,m.useLayoutEffect)(()=>{if(!N||(Va(),typeof ResizeObserver>"u"))return;let z=y.current?.parentElement;if(!z)return;let H=new ResizeObserver(()=>Va());return H.observe(z),()=>H.disconnect()},[N,Va]);let fe=(0,m.useCallback)(z=>{if(!k||!d||!X)return;let H=z.currentTarget.getBoundingClientRect(),Q=(z.clientX-H.left-X.left)/X.width,Ue=(z.clientY-H.top-X.top)/X.height;if(!(Q>=0&&Q<=1)||!(Ue>=0&&Ue<=1))return;let Je=v.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();d(mo(Q),mo(Ue),{width:X.width,height:X.height,photoWidth:Je?.width??58,photoHeight:Je?.height??58})},[d,k,X]),Ge=(0,m.useCallback)(z=>{if(!_||!X||!h||ne.fit!=="cover")return;let H=z.currentTarget.getBoundingClientRect();mt.current={x:z.clientX,y:z.clientY,focusX:ne.focusX,focusY:ne.focusY,spanX:H.width-X.width,spanY:H.height-X.height},va({focusX:ne.focusX,focusY:ne.focusY}),z.currentTarget.setPointerCapture(z.pointerId),z.preventDefault()},[_,ne.focusX,ne.focusY,ne.fit,h,X]),le=(0,m.useCallback)(z=>{let H=mt.current;if(!H)return;let Q=H.spanX===0?H.focusX:H.focusX+(z.clientX-H.x)/H.spanX*100,Ue=H.spanY===0?H.focusY:H.focusY+(z.clientY-H.y)/H.spanY*100;va({focusX:mo(Mp(Q,0,100)),focusY:mo(Mp(Ue,0,100))})},[]),yt=(0,m.useCallback)(z=>{if(!mt.current)return;mt.current=null,z.currentTarget.hasPointerCapture(z.pointerId)&&z.currentTarget.releasePointerCapture(z.pointerId);let H=Xe;va(null),H&&h&&h({...o,...H})},[Xe,h,o]),Da=(0,m.useCallback)(z=>{!h||!c||h({...o,zoom:mo(Mp(z,c.min,c.max))})},[h,o,c]),Vt=()=>{let z=[...Y.current.values()];if(z.length===0){Ne.current=null;return}let H=z[0],Q=z[1];Ne.current={view:ve.current??ta,x:Q?(H.x+Q.x)/2:H.x,y:Q?(H.y+Q.y)/2:H.y,distance:Q?Math.hypot(H.x-Q.x,H.y-Q.y):1}},_a=z=>{if(!f||z.pointerType!=="touch"||(z.isPrimary&&(Y.current.clear(),ae.current=!1),!v.current)||z.target instanceof Element&&z.target.closest(`.${i}-doors, .${i}-zoom`))return;y.current?.setAttribute("data-mobile-gesturing","true");let H=v.current.getBoundingClientRect();Y.current.set(z.pointerId,{x:z.clientX-H.left,y:z.clientY-H.top}),Y.current.size>1&&(ae.current=!0),Vt()},zt=z=>{if(!f||!Y.current.has(z.pointerId)||!ge||!O||!v.current)return;let H=v.current.getBoundingClientRect();Y.current.set(z.pointerId,{x:z.clientX-H.left,y:z.clientY-H.top});let Q=[...Y.current.values()],Ue=Q[0],qe=Q[1],Je=qe?(Ue.x+qe.x)/2:Ue.x,Qe=qe?(Ue.y+qe.y)/2:Ue.y,G=qe?Math.hypot(Ue.x-qe.x,Ue.y-qe.y):1,Fe=Ne.current;if(!Fe||!x0(Fe,{x:Je,y:Qe,distance:G})&&!ae.current)return;ae.current||g?.(),ae.current=!0;let ot=N0(ge,O,Fe.view,{x:Fe.x,y:Fe.y},{x:Je,y:Qe},qe&&Fe.distance>0?G/Fe.distance:1);ve.current=ot,B(ot)},Ha=(z,H=!1)=>{if(!f||!Y.current.has(z.pointerId))return;let Q=!H&&Y.current.size===1&&!ae.current;if(Y.current.delete(z.pointerId),Y.current.size===0&&y.current?.removeAttribute("data-mobile-gesturing"),Vt(),!Q||!(z.target instanceof Element))return;let Ue=z.target.closest(`.${i}-pin`)?.dataset.pinId,qe=Ue?a.find(Je=>Je.id===Ue):null;if(qe?.onSelect){ae.current=!0,qe.onSelect();return}if(!(!z.target.closest(`.${i}-canvas`)||z.target.closest("button")))if(k&&n&&d&&X){let Je=v.current.getBoundingClientRect(),Qe=(z.clientX-Je.left-X.left)/X.width,G=(z.clientY-Je.top-X.top)/X.height;if(Qe>=0&&Qe<=1&&G>=0&&G<=1){ae.current=!0;let aa=v.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();d(mo(Qe),mo(G),{width:X.width,height:X.height,photoWidth:aa?.width??72,photoHeight:aa?.height??72})}}else g&&(ae.current=!0,g())};return(0,r.jsxs)("div",{ref:y,className:`${i}-stage${w?` ${i}-stage-compact`:""}`,style:jt,"data-shaped":s?"true":"false","data-framing":_&&ne.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":$?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:z=>{if(f){_a(z);return}ae.current=!1,q.current=z.pointerType==="touch"?{x:z.clientX,y:z.clientY}:null},onPointerMoveCapture:z=>{if(f){zt(z);return}let H=q.current;H&&(Math.abs(z.clientX-H.x)>8||Math.abs(z.clientY-H.y)>8)&&(ae.current=!0)},onPointerUpCapture:f?Ha:void 0,onPointerCancelCapture:z=>{f&&Ha(z,!0),q.current&&(ae.current=!0)},onClickCapture:z=>{ae.current&&(ae.current=!1,z.preventDefault(),z.stopPropagation())},children:[A,(0,r.jsxs)("div",{ref:v,className:`${i}-canvas`,"data-placing":k&&n?"true":"false","data-dragging":Xe?"true":"false",onClick:k&&n?fe:g?()=>g():void 0,onPointerDown:_?Ge:void 0,onPointerMove:_?le:void 0,onPointerUp:_?yt:void 0,onPointerCancel:_?yt:void 0,children:[e?(0,r.jsx)("img",{className:`${i}-canvas-img`,style:f&&X?{position:"absolute",left:X.left,top:X.top,width:X.width,height:X.height,objectFit:"fill"}:WS(ne),src:e,alt:t,draggable:!1,onLoad:z=>{let{naturalWidth:H,naturalHeight:Q}=z.currentTarget;H<=0||Q<=0||(S({src:e,width:H,height:Q}),Za())},onError:()=>Ot(e)}):(0,r.jsxs)(r.Fragment,{children:[f&&X?(0,r.jsx)("span",{className:`${i}-mobile-logical`,style:{left:X.left,top:X.top,width:X.width,height:X.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${i}-canvas-empty`,children:"Logical village map"})]}),e&&Si===e?(0,r.jsx)("span",{className:`${i}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,X?a.map(z=>(0,r.jsxs)("span",{className:`${i}-pin-holder`,"data-selected":z.selected?"true":"false",style:{left:`${X.left+z.x*X.width}px`,top:`${X.top+(z.y+(f&&z.kind!=="person"?0:z.dy??0))*X.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${i}-pin`,"data-pin-id":z.id,"data-tone":z.tone,"data-kind":z.kind??"place","data-selected":z.selected?"true":"false","aria-expanded":z.doors?!0:void 0,disabled:z.onSelect===void 0,title:z.text,onClick:H=>{H.stopPropagation(),z.onSelect?.()},children:(f||$)&&z.kind!=="person"?(0,r.jsxs)("span",{className:`${i}-pin-photo-card`,style:{transform:`scale(${T0(f?S0(ta.zoom,go.zoom):yS,z.selected===!0)})`},children:[(0,r.jsxs)("span",{className:`${i}-pin-photo`,"aria-hidden":"true",children:[z.image?(0,r.jsx)("img",{src:z.image,alt:"",loading:"lazy",draggable:!1}):(0,r.jsx)("span",{className:`${i}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,r.jsx)("span",{className:`${i}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:z.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${i}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:z.text})]})}),z.onRemove?(0,r.jsx)("button",{type:"button",className:`${i}-pin-remove`,"aria-label":`Take ${z.text} off the map`,onClick:H=>{H.stopPropagation(),z.onRemove?.()},children:"\xD7"}):null,z.onResume?(0,r.jsx)("button",{type:"button",className:`${i}-pin-resume`,onClick:H=>{H.stopPropagation(),z.onResume?.()},children:"DEBUG: Resume Chat"}):null]},z.id)):null]}),X?a.filter(z=>z.doors!==void 0&&z.doors.length>0).map(z=>(0,r.jsx)("div",{className:`${i}-doors`,style:{left:`${O?Sp(X,O,z).left:X.left+z.x*X.width}px`,top:`${O?Sp(X,O,z).top:X.top+(z.y+(z.dy??0))*X.height}px`},children:z.doors?.map(H=>(0,r.jsx)("button",{type:"button",className:`${i}-door`,onClick:Q=>{Q.stopPropagation(),H.onSelect()},children:H.label},H.label))},`doors:${z.id}`)):null,_&&c&&ne.fit==="cover"?(0,r.jsxs)("div",{className:`${i}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:ne.zoom>=c.max,onClick:()=>Da(ne.zoom+c.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:ne.zoom<=c.min,onClick:()=>Da(ne.zoom-c.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:ne.focusX===50&&ne.focusY===50&&ne.zoom===c.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function po(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function G0({idPrefix:e,personas:t,draft:a,onDraft:n,storedId:o,storedName:s,storedMissing:c,disabled:d}){let h=(t??[]).find(f=>f.id===a)??null,g=h?.name??(a===o?s:""),w=c&&a===o,N=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${i}-${e}-persona`,className:`${i}-select`,value:a,disabled:d||t===null||t.length===0,onChange:f=>n(f.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,r.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),N?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:w?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${i}-macro-help`,children:h.summary}):null]}):null]})}function Y0({books:e,error:t,selected:a,onChange:n,disabled:o}){let s=new Map((e??[]).map(h=>[h.id,h])),c=(e??[]).filter(h=>!h.hiddenFromLibrary||a.includes(h.id)),d=a.filter(h=>!s.has(h));return(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No lorebooks in the Engine library."}):null,[...c,...d.map(h=>({id:h,name:h,enabled:!1}))].map(h=>{let g=a.includes(h.id),w=d.includes(h.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":h.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g,disabled:o||!h.enabled&&!g,onChange:()=>n(g?a.filter(N=>N!==h.id):[...a,h.id])}),h.name,w?` (${w})`:""]},h.id)})]})}function e2({homes:e,villagers:t,disabled:a,selectedId:n,onPatch:o,onRemove:s,onSelect:c,lockedIds:d,showDescriptions:h,onGenerateDescription:g}){let w=new Set(e.map(N=>N.characterId));return(0,r.jsx)("div",{className:`${i}-home-list`,children:e.map((N,f)=>{let $=d?.has(N.id)??!1,A=t.find(k=>k.id===N.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${i}-home-row`,"data-selected":N.id===n?"true":"false",onMouseEnter:()=>c(N.id),children:[(0,r.jsx)("span",{className:`${i}-home-index`,"aria-hidden":"true",children:f+1}),N.isPlayerHome?(0,r.jsx)("span",{className:`${i}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-who`,children:A?`${A} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${i}-select`,value:N.characterId??"",disabled:a||$,"aria-label":`Who lives in home ${f+1}`,onChange:k=>o(N.id,{characterId:k.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(k=>{let _=k.id!==N.characterId&&w.has(k.id);return(0,r.jsx)("option",{value:k.id,disabled:_,children:_?`${k.name} \u2014 already housed`:k.name},k.id)})]}):null]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Venue name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:N.name,maxLength:60,disabled:a||$,onChange:k=>o(N.id,{name:k.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:N.form,maxLength:240,disabled:a||$,onChange:k=>o(N.id,{form:k.target.value}),placeholder:"Cabin, truck, sleeping pod\u2026"})]}),h?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("textarea",{className:`${i}-textarea`,value:N.description,maxLength:1e3,disabled:a||$,"aria-label":`Description of home ${f+1}`,onChange:k=>o(N.id,{description:k.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:a||$,onClick:()=>g?.(N),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:a||$,"aria-label":`Take home ${f+1} off the map`,onClick:()=>s(N.id),children:"\xD7"}),$?(0,r.jsx)("span",{className:`${i}-hint`,children:"Move approved and completed before changing this home."}):null]},N.id)})})}function X0({id:e,label:t,hint:a,options:n,value:o,disabled:s,onChange:c}){let d=o.length>0&&!n.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${i}-select`,value:o,disabled:s,onChange:h=>c(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),d?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,n.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a})]})}function Op({onSetupProblem:e,onImageWarningChange:t}){let[a,n]=(0,m.useState)(null),[o,s]=(0,m.useState)([]),[c,d]=(0,m.useState)(""),[h,g]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let k=!1;return(async()=>{try{let[_,y]=await Promise.all([D("/connections"),Up("/api/connections")]);if(k)return;n(_),s(DS(Array.isArray(y)?y:[]))}catch(_){k||d(U(_,"This agent's connections could not be read."))}})(),()=>{k=!0}},[]);let w=(0,m.useCallback)(async k=>{g(!0),d("");try{n(await D("/connections",{method:"PUT",body:JSON.stringify(k)}))}catch(_){d(U(_,"That connection could not be saved."))}finally{g(!1)}},[]),N=o.filter(k=>k.category==="language"),f=o.filter(k=>k.category==="image_generation"),$=f.some(k=>k.defaultForAgents),A=a!==null&&(a.imageConnectionId===Ep||f.length===0||a.imageConnectionId.length===0&&!$);return(0,m.useEffect)(()=>{if(!e)return;let k=a?.systemConnectionId??"",_=a?.narrationConnectionId??"";a?k.length===0||_.length===0?e("Choose both System and Narration connections before continuing."):!N.some(y=>y.id===k)||!N.some(y=>y.id===_)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,a,N]),(0,m.useEffect)(()=>{t?.(A)},[A,t]),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Connections"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),a?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(X0,{id:`${i}-connection-system`,label:"System",hint:"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:N,value:a.systemConnectionId,disabled:h,onChange:k=>{w({systemConnectionId:k})}}),(0,r.jsx)(X0,{id:`${i}-connection-narration`,label:"Narration",hint:"Everything the villagers say to you, and how the conversation reads back afterwards.",options:N,value:a.narrationConnectionId,disabled:h,onChange:k=>{w({narrationConnectionId:k})}}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${i}-connection-image`,className:`${i}-select`,value:a.imageConnectionId,disabled:h,onChange:k=>{w({imageConnectionId:k.target.value})},children:[(0,r.jsx)("option",{value:Ep,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),a.imageConnectionId.length>0&&a.imageConnectionId!==Ep&&!f.some(k=>k.id===a.imageConnectionId)?(0,r.jsx)("option",{value:a.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,f.map(k=>(0,r.jsx)("option",{value:k.id,children:k.name},k.id))]}),(0,r.jsxs)("span",{className:`${i}-hint`,children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${i}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})]})]}):c.length===0?(0,r.jsx)("span",{className:`${i}-hint`,children:"Reading this agent's connections\u2026"}):null,c?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:c}):null]})}function i1(){let[e,t]=(0,m.useState)(null),[a,n]=(0,m.useState)(""),[o,s]=(0,m.useState)(!1),[c,d]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return D("/narration").then(w=>{g||t(w)}).catch(w=>{g||n(U(w,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{s(!0),d(!1),n("");try{let w=await D("/narration",{method:"PUT",body:JSON.stringify(g)});return t(w),d(!0),w}catch(w){return n(U(w,"That writing change could not be saved.")),null}finally{s(!1)}},[]);return{view:e,error:a,busy:o,saved:c,save:h}}function t2(){let{view:e,error:t,busy:a,saved:n,save:o}=i1(),[s,c]=(0,m.useState)(null),d=s??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:i+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Narration style",value:d,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||d===e.styleInstructions,onClick:()=>{o({styleInstructions:d}).then(h=>{h&&c(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||d===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&c(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:i+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function a2(){let{view:e,error:t,busy:a,saved:n,save:o}=i1(),[s,c]=(0,m.useState)(null),d=s??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:i+"-panel",children:[(0,r.jsx)("h2",{className:i+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:i+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Villager reply guidance",value:d,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||d===e.replyGuidance,onClick:()=>{o({replyGuidance:d}).then(h=>{h&&c(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||d===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&c(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:i+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function ol({portrait:e,name:t,className:a,glyph:n="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:RS(e.crop)}):n==="person"?(0,r.jsxs)("svg",{className:`${i}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function n2({villager:e,portrait:t,selected:a,onSelect:n}){return(0,r.jsxs)("div",{className:`${i}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-tile-head`,children:[(0,r.jsx)(ol,{portrait:t,name:e.name,className:`${i}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${i}-tile-name`,onClick:n,disabled:n===void 0,title:n?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${i}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${i}-tag`,children:o},o))]})]})}function Q0(e,t){let a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function i2(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((N,f)=>{let $=A=>{let k=Mu.indexOf(A);return k<0?Mu.length:k};return $(N.label)-$(f.label)||N.label.localeCompare(f.label)||N.view.localeCompare(f.view)}),n=512,o=768,s=2,c=document.createElement("canvas");c.width=s*n,c.height=Math.ceil(a.length/s)*o;let d=c.getContext("2d");if(!d)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let N=0;N<a.length;N+=1){let f=a[N],$=new Image;$.src=f.url,await $.decode();let A=N%s*n,k=Math.floor(N/s)*o,_=Math.min(n/$.naturalWidth,o/$.naturalHeight),y=Math.round($.naturalWidth*_),v=Math.round($.naturalHeight*_);d.drawImage($,A+Math.floor((n-y)/2),k+o-v,y,v),h.push({view:f.view,expression:f.label,x:A,y:k,width:n,height:o})}let g=await new Promise((N,f)=>c.toBlob($=>$?N($):f(new Error("The browser could not export this sheet.")),"image/png")),w=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";Q0(`${w}-sprites.png`,g),Q0(`${w}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function o2({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[n,o]=(0,m.useState)("front"),[s,c]=(0,m.useState)("neutral"),[d,h]=(0,m.useState)(""),[g,w]=(0,m.useState)(""),[N,f]=(0,m.useState)(!0),[$,A]=(0,m.useState)(null),[k,_]=(0,m.useState)([]),[y,v]=(0,m.useState)(!1),[b,S]=(0,m.useState)(""),[O,F]=(0,m.useState)(""),I=(0,m.useRef)(null),B=e.sprite?.images??[],ve=B.filter(q=>q.view===n),Y=B.some(q=>q.view==="front"&&q.label==="neutral"),Ne=ve.some(q=>q.label==="neutral"),it=s==="custom"?d.trim().toLowerCase().replace(/\s+/g,"_"):s,Qa=ve.find(q=>q.label===it),Si=[...Mu,...B.map(q=>q.label).filter(q=>!Mu.includes(q))].filter((q,ae,Xe)=>Xe.indexOf(q)===ae);(0,m.useEffect)(()=>{A(null),o("front"),c("neutral"),S(""),D(`${a}/source`).then(q=>_(q.sprites)).catch(()=>_([]))},[a]);async function Ot(q){v(!0),S(""),F("");try{await q()}catch(ae){S(U(ae,"The sprite could not be prepared."))}finally{v(!1)}}function mt(){if(!/^[a-z0-9_-]{1,40}$/.test(it))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(n==="side"&&!Y)throw new Error("Approve the front neutral sprite first.");if(it!=="neutral"&&!Ne)throw new Error(`Approve the ${n} neutral sprite first.`);return it}return(0,r.jsxs)("section",{className:`${i}-sprite-editor`,"aria-label":`${e.name} sprite studio`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-heading`,children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{children:[e.name,"'s sprite studio"]}),(0,r.jsx)("p",{children:"Build a front view for player conversations and one side profile for villager-to-villager moments."})]}),(0,r.jsxs)("span",{className:`${i}-sprite-count`,children:[B.length," approved"]})]}),(0,r.jsx)("div",{className:`${i}-sprite-views`,"aria-label":"Sprite view",children:["front","side"].map(q=>(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-view`,"aria-pressed":n===q,"data-active":n===q?"true":"false",disabled:y,onClick:()=>{o(q),c("neutral"),A(null)},children:[(0,r.jsx)("strong",{children:q==="front"?"Facing you":"Facing villagers"}),(0,r.jsxs)("span",{children:[B.filter(ae=>ae.view===q).length," approved \xB7"," ",q==="front"?"front":"side, mirrored left or right"]})]},q))}),(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Choose an expression"}),(0,r.jsx)("span",{children:"Only approved images appear in scenes."})]}),(0,r.jsxs)("div",{className:`${i}-sprite-choices`,children:[Si.map(q=>{let ae=ve.find(Xe=>Xe.label===q);return(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":s===q?"true":"false","aria-pressed":s===q,disabled:y,onClick:()=>{c(q),A(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,children:ae?(0,r.jsx)("img",{src:ae.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:"\uFF0B"})}),(0,r.jsx)("span",{children:q}),(0,r.jsx)("small",{children:ae?"Approved":"Open"})]},q)}),(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":s==="custom"?"true":"false","aria-pressed":s==="custom",disabled:y,onClick:()=>{c("custom"),A(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,"aria-hidden":"true",children:"\u2726"}),(0,r.jsx)("span",{children:"Custom"}),(0,r.jsx)("small",{children:"Name your own"})]})]}),s==="custom"?(0,r.jsxs)("label",{children:["Custom expression name",(0,r.jsx)("input",{value:d,maxLength:40,disabled:y,onChange:q=>{h(q.target.value),A(null)}})]}):null,(0,r.jsxs)("div",{className:`${i}-sprite-selected`,children:[(0,r.jsxs)("strong",{children:[n==="front"?"Front":"Side"," \xB7 ",it||"custom"]}),(0,r.jsx)("span",{children:Qa?"Approved art is ready. You can replace it after reviewing a new candidate.":"No approved art yet."})]}),n==="side"&&!Y?(0,r.jsx)("p",{className:`${i}-hint`,children:"Start with an approved front neutral sprite to keep the side profile recognizable."}):null,it!=="neutral"&&!Ne?(0,r.jsx)("p",{className:`${i}-hint`,children:"Approve this view's neutral sprite before adding expressions."}):null,(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:g,maxLength:2e3,disabled:y,onChange:q=>w(q.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${i}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:N,disabled:y,onChange:q=>f(q.target.checked)})," ","Use an approved neutral or available portrait as the identity reference"]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${i}-sprite-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:y||n==="side"&&!Y||it!=="neutral"&&!Ne,onClick:()=>{Ot(async()=>{let q=mt(),ae=await D(`${a}/generate`,{method:"POST",body:JSON.stringify({view:n,expression:q,appearance:g,useReference:N})});A({view:n,label:q,image:ae.image}),F(`Candidate: ${ae.width} \xD7 ${ae.height}. Review before approving.`)})},children:y?"Working\u2026":`Generate ${n} ${it||"sprite"} \xB7 1 image request`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:y||n==="side"&&!Y||it!=="neutral"&&!Ne,onClick:()=>I.current?.click(),children:"Upload candidate"}),(0,r.jsx)("input",{ref:I,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:q=>{Ot(async()=>{let ae=mt(),Xe=q.target.files?.[0];Xe&&A({view:n,label:ae,image:await il(Xe)}),q.target.value=""})}})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"One cell per click. Approval, mirroring, and export use no image API. If the selected Engine connection fails, its configured fallback may make another provider attempt."}),$?(0,r.jsxs)("div",{className:`${i}-sprite-candidate`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Review candidate"}),(0,r.jsxs)("span",{children:[$.view," \xB7 ",$.label]})]}),(0,r.jsxs)("div",{className:`${i}-sprite-candidate-views`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:$.image,alt:`${$.view} ${$.label} candidate for ${e.name}`}),(0,r.jsx)("span",{children:$.view==="side"?"Facing right":"Facing you"})]}),$.view==="side"?(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{className:`${i}-sprite-mirrored`,src:$.image,alt:""}),(0,r.jsx)("span",{children:"Mirrored left \xB7 no extra image"})]}):null]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:y,onClick:()=>{Ot(async()=>{let q=await D(`${a}/approve`,{method:"POST",body:JSON.stringify({view:$.view,expression:$.label,image:$.image})});t(q),A(null),F(`${$.view} ${$.label} approved.`)})},children:"Approve this sprite"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:y,onClick:()=>A(null),children:"Discard candidate"})]})]}):null,k.length&&n==="front"?(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Copy an existing Engine full-body sprite"}),(0,r.jsx)("div",{className:`${i}-row`,children:k.map(q=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:y||q.expression!=="neutral"&&!Ne,onClick:()=>{Ot(async()=>{let ae=await D(`${a}/import`,{method:"POST",body:JSON.stringify({view:n,expression:q.expression})});t(ae),F(`${q.expression} copied to this Village.`)})},children:q.expression},q.expression))})]}):null,B.length?(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Display framing and export"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:y,onChange:q=>{Ot(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:q.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:y,onChange:q=>{Ot(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(q.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:y,onClick:()=>{Ot(()=>i2(e))},children:"Download both views and manifest"})]})]})}):null,O?(0,r.jsx)("p",{role:"status",children:O}):null,b?(0,r.jsx)("p",{role:"alert",children:b}):null]})}function r2({entry:e,onDecide:t}){let[a,n]=(0,m.useState)(e.improvement?.title??""),[o,s]=(0,m.useState)(e.improvement?.description??""),[c,d]=(0,m.useState)(e.improvement?.extraBeds??0),[h,g]=(0,m.useState)(e.improvementSlot??0),[w,N]=(0,m.useState)(!1),[f,$]=(0,m.useState)(""),A=_=>{N(!0),$(""),t(_,{title:a,description:o,extraBeds:c,slot:h}).catch(y=>$(U(y,"That Venue request could not be decided."))).finally(()=>N(!1))},k=a!==e.improvement?.title||o!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Proposed improvement",(0,r.jsx)("input",{className:`${i}-notice-input`,value:a,onChange:_=>n(_.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:o,onChange:_=>s(_.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds",(0,r.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:_=>d(Number(_.target.value))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:h,onChange:_=>g(Number(_.target.value)),children:[(0,r.jsx)("option",{value:0,children:"Slot 1"}),(0,r.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||!a.trim()||!o.trim(),onClick:()=>A(!0),children:k?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>A(!1),children:"Decline"})]}),f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null]})}function s2({room:e,picture:t,draft:a,mode:n,targetId:o,busy:s,error:c,greetingNotice:d,ruling:h,open:g,ended:w,playerName:N,playerPortrait:f,portraits:$,sprites:A,onDraft:k,onMode:_,onTarget:y,onSend:v,onViewVenue:b,onEnterPrivate:S,privateSpaceOwnerName:O,onEnd:F,onLeavePending:I,endFailed:B,onRetryGreeting:ve,onContinueWithoutGreeting:Y,notices:Ne,onDismissNotice:it,debugDiscardEnabled:Qa,onDebugDiscard:Si,onUseMailbox:Ot}){let[mt,q]=(0,m.useState)(0),[ae,Xe]=(0,m.useState)(!1),[va,ne]=(0,m.useState)(!1),[ge,go]=(0,m.useState)(!1),[ta,X]=(0,m.useState)(!1),[jt,Za]=(0,m.useState)(null),Va=(0,m.useRef)(null),fe=(0,m.useRef)(null),Ge=(0,m.useRef)(null),le=(0,m.useRef)(null),yt=(0,m.useRef)(null),Da=(0,m.useRef)(null),Vt=(0,m.useRef)(null),_a=(0,m.useRef)(null),zt=(0,m.useRef)(null);(0,m.useEffect)(()=>{ae&&window.requestAnimationFrame(()=>Da.current?.focus())},[ae]),(0,m.useEffect)(()=>{if(!va)return;let C=W=>{_a.current?.contains(W.target)||ne(!1)},me=W=>{W.key==="Escape"&&ne(!1)};return document.addEventListener("pointerdown",C),document.addEventListener("keydown",me),()=>{document.removeEventListener("pointerdown",C),document.removeEventListener("keydown",me)}},[va]),(0,m.useEffect)(()=>{if(!ta)return;let C=W=>{le.current?.contains(W.target)||X(!1)},me=W=>{W.key==="Escape"&&X(!1)};return document.addEventListener("pointerdown",C),document.addEventListener("focusin",C),document.addEventListener("keydown",me),()=>{document.removeEventListener("pointerdown",C),document.removeEventListener("focusin",C),document.removeEventListener("keydown",me)}},[ta]);let Ha=(0,m.useCallback)(()=>{Za(null),window.requestAnimationFrame(()=>Va.current?.focus())},[]);(0,m.useEffect)(()=>{if(!jt)return;window.requestAnimationFrame(()=>fe.current?.focus());let C=me=>{if(me.key==="Tab"){me.preventDefault(),fe.current?.focus();return}me.key==="Escape"&&(me.preventDefault(),Ha())};return window.addEventListener("keydown",C),()=>window.removeEventListener("keydown",C)},[Ha,jt]);let z=(0,m.useMemo)(()=>{let C=[],me=new Map;for(let W of e.lines){if(W.kind!=="side"&&W.kind!=="whisper"||!W.asideFor)continue;let wt=me.get(W.asideFor)??[];wt.push({register:W.kind,text:W.content,...W.targetId?{target:e.participants.find(ya=>ya.characterId===W.targetId)?.name??W.targetId}:{},speakerId:W.speakerId,name:W.name,expression:W.expression,gazeAt:W.gazeAt}),me.set(W.asideFor,wt)}for(let W of e.lines){if(W.kind==="side"||W.kind==="whisper")continue;let wt=W.speakerId.length===0,ya=h0(W.content,W.beats??null);ya.paragraphs.forEach((yn,Ei)=>{C.push({key:`${C.length}`,speakerId:wt?"":W.speakerId,name:wt?N:W.name,player:wt,text:yn,asides:[...ya.asides[Ei]??[],...Ei===ya.paragraphs.length-1?me.get(W.id??"")??[]:[]],...W.kind?{register:W.kind==="narration"?"narration":"speech"}:{},...W.expression?{expression:W.expression}:{},...W.gazeAt?{gazeAt:W.gazeAt}:{}})})}return C},[N,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{q(C=>v0(zt.current,e.id,z.length,C)),zt.current={roomId:e.id,stepCount:z.length}},[e.id,z.length]);let H=Math.min(mt,Math.max(0,z.length-1)),Q=z[H],Ue=H>0,qe=H<z.length-1,Je=!w&&e.status==="active"&&!qe,Qe=(0,m.useCallback)(()=>{let C=Ge.current;if(!C)return;let me=window.getComputedStyle(C),W=Number.parseFloat(me.lineHeight),wt=Number.parseFloat(me.paddingTop)+Number.parseFloat(me.paddingBottom),ya=Math.ceil(W+wt),yn=Math.ceil(W*2+wt);C.style.height="auto",C.style.height=`${Math.min(Math.max(C.scrollHeight,ya),yn)}px`,C.style.overflowY=C.scrollHeight>yn+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{Qe()},[Je,a,Qe]),(0,m.useEffect)(()=>{let C=Ge.current?.parentElement;if(!C)return;let me=C.clientWidth,W=new ResizeObserver(()=>{C.clientWidth!==me&&(me=C.clientWidth,Qe())});return W.observe(C),()=>W.disconnect()},[Je,Qe]);let G=()=>{!Je||s||n!=="conclude"&&!a.trim()||n==="fulfill"&&!o||(X(!1),v())};(0,m.useLayoutEffect)(()=>{Vt.current&&(Vt.current.scrollTop=0)},[H,e.id]);let Fe=Q?.register??(Q===void 0||Q.speakerId==="__venue_scene__"?"narration":Q.player||d0(Q.text)==="speech"?"speech":"narration"),aa=Q===void 0?void 0:Q.player?f:$[Q.speakerId],ot=e.participants.filter(C=>e.activeIds.includes(C.characterId)),Ti=e.status==="closed"&&ot.length===0?e.participants:ot,ki=Ti.find(C=>C.characterId===Q?.speakerId),vn=Ti.slice(0,4),rl=Ti.filter(C=>!vn.some(me=>me.characterId===C.characterId)),Mr=vn.findIndex(C=>C.characterId===ki?.characterId)>=2?"left":"right",Vu=(0,r.jsxs)("p",{className:`${i}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${i}-chat-spinner ${i}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${i}-chat-pending-label`,children:e.status==="opening"?"Preparing a greeting\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${i}-chat`,"data-open":g?"true":"false","data-ended":w?"true":"false","data-opening-error":e.status==="opening"&&c?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${i}-visually-hidden`,children:`Here now: ${ot.length?ot.map(C=>`${C.name}${C.doing?` is ${C.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${i}-chat-scene`,"aria-hidden":"true",children:t?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${i}-chat-scene-backdrop`,src:t,alt:""}),(0,r.jsx)("span",{className:`${i}-chat-scrim`}),(0,r.jsx)("span",{className:`${i}-chat-vignette`})]}):(0,r.jsx)("span",{className:`${i}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,r.jsxs)("div",{className:`${i}-chat-head`,children:[(0,r.jsx)("span",{className:`${i}-room-place`,children:e.placeName}),(0,r.jsxs)("span",{ref:_a,className:`${i}-chat-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-actions-trigger`,onClick:()=>ne(C=>!C),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":va,children:"\xB7\xB7\xB7"}),va?(0,r.jsxs)("span",{className:`${i}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{ne(!1),b()},disabled:s,children:"View Venue"}),S?(0,r.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{ne(!1),S()},disabled:s,children:["Enter ",O??"private space"]}):null,(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{ne(!1),F()},disabled:s,children:w?"Return to map":"End visit now"}),B||e.status==="closing"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{ne(!1),I()},children:"Leave with memory pending"}):null,Qa&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{ne(!1),Si()},disabled:s,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like."}):null,Ne.length>0?(0,r.jsxs)("div",{className:`${i}-room-notices`,"aria-live":"polite",children:[(0,r.jsxs)("button",{type:"button",className:`${i}-room-notices-trigger`,onClick:()=>go(C=>!C),"aria-expanded":ge,"aria-label":`${Ne.length} village ${Ne.length===1?"notice":"notices"}`,children:["\u2726 ",Ne.length]}),ge?(0,r.jsx)("div",{className:`${i}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:Ne.map(C=>(0,r.jsxs)("div",{className:`${i}-room-star`,children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),C.kind==="memory"&&C.detail?(0,r.jsx)("button",{type:"button",className:`${i}-room-star-detail`,onClick:me=>{Va.current=me.currentTarget,Za(C)},"aria-label":`View memory: ${C.text}`,title:"View saved memory",children:C.text}):(0,r.jsx)("span",{children:C.text}),(0,r.jsx)("button",{type:"button",className:`${i}-room-star-dismiss`,onClick:()=>{jt?.id===C.id&&Za(null),it(C.id)},"aria-label":`Dismiss ${C.text}`,title:"Dismiss notice",children:"\xD7"})]},C.id))}):null]}):null,jt?.detail?(0,r.jsx)("div",{className:`${i}-memory-backdrop`,onClick:C=>{C.currentTarget===C.target&&Ha()},children:(0,r.jsxs)("div",{className:`${i}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${i}-memory-dialog-title`,children:[(0,r.jsxs)("div",{className:`${i}-memory-dialog-head`,children:[(0,r.jsx)("h2",{id:`${i}-memory-dialog-title`,children:jt.text}),(0,r.jsx)("button",{ref:fe,type:"button",onClick:Ha,"aria-label":"Close memory",children:"\xD7"})]}),(0,r.jsx)("p",{children:jt.detail})]})}):null,ot.length>0?(0,r.jsx)("div",{className:`${i}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:ot.map(C=>(0,r.jsx)("span",{className:`${i}-chat-activity`,children:`${C.name}: ${C.doing||"spending time here"}`},C.characterId))}):null,(0,r.jsxs)("div",{className:`${i}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${i}-chat-cast`,children:vn.map((C,me)=>{let W=A[C.characterId],wt=C.characterId===ki?.characterId,ya=Q?.asides.find(qn=>qn.speakerId===C.characterId),yn=wt?Q?.expression??"neutral":ya?.expression??"neutral",Ei=wt?Q?.gazeAt:ya?.gazeAt??(C.characterId===Q?.gazeAt?ki?.characterId:void 0),sl=vn.findIndex(qn=>qn.characterId===Ei),Gt=w0(W?.images??[],yn,y0(me,sl));return(0,r.jsxs)("div",{className:`${i}-chat-cast-person`,"data-active":C.characterId===ki?.characterId?"true":"false","data-sprite":Gt?"true":"false",children:[Gt?(0,r.jsx)("img",{src:Gt.image.url,alt:"","data-framing":W?.framing.mode??"full","data-facing":Gt.mirrored?"left":"right"}):(0,r.jsx)(ol,{portrait:$[C.characterId],name:C.name,className:`${i}-avatar`}),(0,r.jsx)("span",{children:C.name})]},C.characterId)})}),rl.length>0?(0,r.jsx)("div",{className:`${i}-chat-cast-rest`,children:rl.map(C=>(0,r.jsxs)("span",{children:[(0,r.jsx)(ol,{portrait:$[C.characterId],name:C.name,className:`${i}-avatar`}),C.name]},C.characterId))}):null]}),(0,r.jsxs)("div",{className:`${i}-chat-vn`,children:[ae?(0,r.jsx)("div",{ref:Da,className:`${i}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:C=>{C.key==="Escape"&&(Xe(!1),window.requestAnimationFrame(()=>yt.current?.focus()))},children:e.lines.map((C,me)=>(0,r.jsxs)("p",{className:`${i}-chat-vn-text`,children:[(0,r.jsxs)("strong",{children:[C.role==="user"?N:C.kind==="narration"||C.speakerId==="__venue_scene__"?"Narration":C.name||"Resident",C.kind==="side"?" \xB7 aside":C.kind==="whisper"?" \xB7 whisper":"",":"," "]}),zr(C.content,`history-${me}-`)]},C.id??me))}):null,Q&&Q.asides.length>0?(0,r.jsx)("div",{className:`${i}-chat-vn-asides`,"data-side":Mr,"aria-live":"polite",children:Q.asides.map((C,me)=>(0,r.jsxs)("div",{className:`${i}-chat-vn-aside`,"data-register":C.register,children:[(0,r.jsx)(ol,{portrait:C.speakerId?$[C.speakerId]:aa,name:C.name??Q.name,glyph:Q.player?"person":"initial",className:`${i}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${i}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${i}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${i}-chat-vn-aside-icon`,children:C.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${i}-chat-vn-aside-name`,children:C.name??Q.name}),C.register==="whisper"&&C.target?(0,r.jsx)("span",{className:`${i}-chat-vn-aside-target`,children:`\u2192 ${C.target}`}):null]}),(0,r.jsx)("p",{className:`${i}-chat-vn-aside-text`,children:zr(C.text,`vn-aside-${me}-`)})]})]},`${me}-${C.register}`))}):null,(0,r.jsx)("div",{className:`${i}-chat-vn-card`,"data-register":Fe,children:(0,r.jsx)("div",{className:`${i}-chat-vn-row`,children:(0,r.jsxs)("div",{className:`${i}-chat-vn-column`,children:[Fe==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${i}-chat-vn-name`,children:Q?.name??""}),(0,r.jsxs)("div",{ref:Vt,className:`${i}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[Q?Fe==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-beat`,"data-register":"narration",children:zr(Q.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,children:zr(Q.text,"vn-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Preparing a greeting in ${e.placeName}\u2026`:ot.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!w&&s?Vu:null]})]})})}),(0,r.jsxs)("div",{className:`${i}-room-panel-tools`,children:[e.lines.length>0?(0,r.jsx)("button",{ref:yt,type:"button",className:`${i}-chat-history-toggle`,"aria-label":"History","aria-expanded":ae,onClick:()=>Xe(C=>!C),children:ae?"Hide history":"History"}):null,(0,r.jsx)("span",{className:`${i}-chat-vn-counter`,children:`${H+1} / ${Math.max(1,z.length)}`}),(0,r.jsxs)("span",{className:`${i}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>q(H-1),disabled:!Ue,"aria-label":"Previous paragraph",children:["\u2039 ",(0,r.jsx)("span",{children:"Previous"})]}),qe?(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>q(H+1),"aria-label":"Next paragraph",children:[(0,r.jsx)("span",{children:"Next"})," \u203A"]}):w?(0,r.jsx)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:F,disabled:s,children:"Return to map"}):null]})]}),c&&e.status==="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:c}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:F,disabled:s,children:"Back to map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:ve,disabled:s,children:"Retry greeting"}),e.id?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Y,disabled:s,children:"Continue without greeting"}):null]}):null,d?(0,r.jsx)("div",{className:`${i}-room-error`,role:"status",children:(0,r.jsx)("p",{children:d})}):null,h?(0,r.jsx)("p",{className:`${i}-empty`,children:h}):null,e.status==="closing"?(0,r.jsx)("p",{className:`${i}-hint`,children:"The visit is still being remembered. You can leave with memory pending if filing cannot finish."}):null,Je&&n==="fulfill"&&ot.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,Je?(0,r.jsxs)("div",{className:`${i}-composer`,children:[n==="fulfill"&&ot.length>0?(0,r.jsxs)("select",{value:o,onChange:C=>y(C.target.value),"aria-label":"Whose wish you fulfilled",disabled:s||w||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),ot.map(C=>(0,r.jsx)("option",{value:C.characterId,children:C.name},C.characterId))]}):null,(0,r.jsx)("div",{className:`${i}-composer-row`,children:(0,r.jsxs)("span",{className:`${i}-chat-input`,children:[(0,r.jsxs)("span",{ref:le,className:`${i}-room-mode-anchor`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-mode-toggle`,onClick:()=>X(C=>!C),"aria-label":`Mode: ${n==="chat"?"Chat":n==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":ta,title:n==="chat"?"Chat":n==="fulfill"?"Fulfill":"Conclude",children:n==="chat"?"\u{1F4AC}":n==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),ta?(0,r.jsx)("span",{className:`${i}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(C=>(0,r.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":n===C,disabled:s||C==="fulfill"&&ot.length===0,onClick:()=>{_(C),X(!1)},children:C==="chat"?"Chat":C==="fulfill"?"Fulfill":"Conclude"},C))}):null]}),Ot?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Ot,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,(0,r.jsx)("textarea",{ref:Ge,className:`${i}-textarea`,rows:1,value:a,onChange:C=>k(C.target.value),onKeyDown:C=>{b0(C.key,C.shiftKey,C.nativeEvent.isComposing)&&(C.preventDefault(),G())},placeholder:n==="fulfill"?"What did you do for them?":n==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:s||w||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${i}-chat-send`,onClick:G,disabled:s||w||e.status!=="active"||n!=="conclude"&&a.trim().length===0||n==="fulfill"&&!o,"aria-label":s?"Sending":"Send",title:s?"Sending":"Send",children:s?"Sending\u2026":"Send"})]})})]}):null,c&&e.status!=="opening"?(0,r.jsx)("div",{className:`${i}-room-error`,role:"alert",children:(0,r.jsx)("p",{children:c})}):null]})]})}var Z0="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function l2({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let l=()=>{let p=e.getBoundingClientRect();a(p.width<=704||p.width<=880&&p.height<=512)};l();let u=new ResizeObserver(l);return u.observe(e),()=>u.disconnect()},[e]);let[n,o]=(0,m.useState)(null),[s,c]=(0,m.useState)(null),[d,h]=(0,m.useState)(null),[g,w]=(0,m.useState)(0),[N,f]=(0,m.useState)("residents"),[$,A]=(0,m.useState)(null),[k,_]=(0,m.useState)(null),[y,v]=(0,m.useState)(0),[b,S]=(0,m.useState)(0),[O,F]=(0,m.useState)(0),[I,B]=(0,m.useState)(null),[ve,Y]=(0,m.useState)(!1),[Ne,it]=(0,m.useState)(""),[Qa,Si]=(0,m.useState)(""),[Ot,mt]=(0,m.useState)(""),[q,ae]=(0,m.useState)(null),[Xe,va]=(0,m.useState)(!1),[ne,ge]=(0,m.useState)("home"),[go,ta]=(0,m.useState)(null),[X,jt]=(0,m.useState)("view"),[Za,Va]=(0,m.useState)(!1),[fe,Ge]=(0,m.useState)(null),[le,yt]=(0,m.useState)(null),[Da,Vt]=(0,m.useState)(!1),[_a,zt]=(0,m.useState)(""),[Ha,z]=(0,m.useState)(""),[H,Q]=(0,m.useState)(""),[Ue,qe]=(0,m.useState)(null),[Je,Qe]=(0,m.useState)(!1),[G,Fe]=(0,m.useState)("village"),[aa,ot]=(0,m.useState)("index"),[Ti,ki]=(0,m.useState)({}),[vn,rl]=(0,m.useState)(null),[Mr,Vu]=(0,m.useState)({}),[C,me]=(0,m.useState)({}),[W,wt]=(0,m.useState)(""),[ya,yn]=(0,m.useState)(null),[Ei,sl]=(0,m.useState)(""),[Gt,qn]=(0,m.useState)(""),[wa,ll]=(0,m.useState)(""),[Du,qp]=(0,m.useState)(null),[cl,Bp]=(0,m.useState)(""),[ul,Lp]=(0,m.useState)([]),[_u,jp]=(0,m.useState)(1600),[na,Gp]=(0,m.useState)([]),[Ci,Yp]=(0,m.useState)(1600),[Hu,s1]=(0,m.useState)(null),[Xp,Qp]=(0,m.useState)(""),[dl,fo]=(0,m.useState)([]),[Zp,l1]=(0,m.useState)(""),[$a,hl]=(0,m.useState)([]),[zi,Yt]=(0,m.useState)(!1),[ml,Ai]=(0,m.useState)(!1),[c1,Iu]=(0,m.useState)(null),[u1,Uu]=(0,m.useState)(null),[pl,qu]=(0,m.useState)(null),[gl,Kp]=(0,m.useState)(""),[be,Bu]=(0,m.useState)(0),[Ka,Jp]=(0,m.useState)(""),[rt,Fp]=(0,m.useState)(""),[ye,Pp]=(0,m.useState)("rebuild"),[Ia,Lu]=(0,m.useState)(Cr("rebuild").premise),[wn,ju]=(0,m.useState)(""),[st,Mi]=(0,m.useState)(el),[Ja,Wp]=(0,m.useState)([]),[Rr,Ri]=(0,m.useState)(""),[d1,eg]=(0,m.useState)(!1),[h1,Gu]=(0,m.useState)({}),[m1,fl]=(0,m.useState)([]),[Ce,Oi]=(0,m.useState)([]),[tg,Bn]=(0,m.useState)(null),[Yu,Vi]=(0,m.useState)(null),[ia,Fa]=(0,m.useState)({}),[Or,Di]=(0,m.useState)(null),[Ua,bo]=(0,m.useState)(!1),[ag,Xu]=(0,m.useState)(""),[bl,ng]=(0,m.useState)(A0),[ze,_i]=(0,m.useState)("generate"),[p1,Qu]=(0,m.useState)(""),[vl,Zu]=(0,m.useState)(null),[g1,ig]=(0,m.useState)(""),[Vr,Ku]=(0,m.useState)(null),[Ln,Ju]=(0,m.useState)(""),[vo,Fu]=(0,m.useState)(""),Xt=JSON.stringify({scenario:ye,premise:Ia.trim(),direction:wn.trim(),setting:rt.trim(),lorebooks:na}),Dr=(0,m.useRef)(Xt);(0,m.useEffect)(()=>{Dr.current!==Xt&&!n?.isFounded&&(Mi(el()),Ri(""),Fa({}),Di(null)),Dr.current=Xt},[Xt,n?.isFounded]);let Pu=JSON.stringify({source:n?.isFounded?null:Xt,setting:rt.trim(),imprint:n?.isFounded?null:st,worldFacts:n?.isFounded?Ja:null,lorebooks:na,structure:Ln,negative:vo,options:bl}),[Dt,_r]=(0,m.useState)(!1),[og,yl]=(0,m.useState)(""),[Wu,f1]=(0,m.useState)("Connections are still loading."),[rg,sg]=(0,m.useState)(!1),[b1,Hr]=(0,m.useState)(!1),[lg,ue]=(0,m.useState)(""),[v1,wl]=(0,m.useState)(!1),[$l,xl]=(0,m.useState)(""),[qa,ed]=(0,m.useState)(null),[td,Ir]=(0,m.useState)(null),[y1,ad]=(0,m.useState)(!1),[Pa,yo]=(0,m.useState)(""),[cg,jn]=(0,m.useState)(null),wo=n?.settings.townMapView??Au("cover"),ug=n?qa?.size??{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:null,dg=n?ze==="existing"?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:Vr&&vl===ze?Vr:{width:n.settings.townMapGenerationWidth,height:n.settings.townMapGenerationHeight}:null,w1=n?{min:n.settings.townMapZoomMin,max:n.settings.townMapZoomMax,step:n.settings.townMapZoomStep}:{min:1,max:1,step:.1},Nl=qa?qa.image:$l||null,Hi=ze==="none"?null:ze==="existing"?$l||null:vl===ze&&(ze!=="generate"||g1===Pu)&&p1||null,Sl=qa!==null||y1,Ur=Sl?td??wo:wo,nd=qa?Ap(qa.size):null,[qr,Me]=(0,m.useState)(""),[_t,K]=(0,m.useState)(""),[V,j]=(0,m.useState)(!1),[L,Pe]=(0,m.useState)(null),[$1,Br]=(0,m.useState)(!1),[x1,Wa]=(0,m.useState)(!1),[Lr,$o]=(0,m.useState)(""),[jr,Tl]=(0,m.useState)("chat"),[Gr,id]=(0,m.useState)(""),[N1,hg]=(0,m.useState)(""),[S1,xa]=(0,m.useState)([]),oa=(0,m.useRef)(new Set),[od,T1]=(0,m.useState)(!1),mg=(0,m.useRef)(0),xo=(0,m.useRef)(0),pg=(0,m.useRef)(""),[rd,Yr]=(0,m.useState)(""),[Na,et]=(0,m.useState)(!1),No=(0,m.useRef)(!1),So=(0,m.useRef)(null),kl=(0,m.useRef)(null),Xr=(0,m.useRef)(!1),[k1,$t]=(0,m.useState)(""),[E1,Qr]=(0,m.useState)(""),[sd,ld]=(0,m.useState)(!1),[El,cd]=(0,m.useState)(""),gg=(0,m.useRef)(""),Cl=(0,m.useRef)(!1),[zl,fg]=(0,m.useState)(!1),ud=(0,m.useRef)(null),dd=(0,m.useRef)(null);(0,m.useEffect)(()=>{let l=dd.current,u=ud.current;l===null||!u||(dd.current=null,u.focus(),u.setSelectionRange(l,l))},[Gt]);let Al=(0,m.useCallback)(async(l=!1)=>{if(Cl.current)return null;Cl.current=!0;let u=setTimeout(()=>fg(!0),LS);try{let p=await D("/reconcile",{method:"POST",body:l?JSON.stringify({forceStory:!0}):void 0});return o(p),p}catch{return null}finally{clearTimeout(u),fg(!1),Cl.current=!1}},[]),bg=(0,m.useCallback)(async()=>{let l=n?.happenings[0]?.id??"";cd("Writing...");let u=await Al(!0);if(!u){cd("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}cd((u.happenings[0]?.id??"")===l?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[n,Al]),Re=(0,m.useCallback)(async(l={})=>{try{let u=await D("",{signal:l.signal});o(u),Me("")}catch(u){if(l.signal?.aborted||l.quiet)return;o(null),Me(U(u,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let l=n?.village.nextTransitionAt??"";l.length===0||l===gg.current||(gg.current=l,n?.isFounded&&Al())},[n,Al]);let en=(0,m.useCallback)(async l=>{try{let u=await D("/catalog",{signal:l});c(u.characters),Me("")}catch(u){if(l?.aborted)return;Me(U(u,"Could not read your character library."))}},[]),To=(0,m.useCallback)(async l=>{try{let u=await D("/personas",{signal:l});qp(u.personas)}catch(u){if(l?.aborted)return;qp([]),Me(U(u,"Could not read your Personas."))}},[]),ko=(0,m.useCallback)(async l=>{try{let u=await D("/lorebooks",{signal:l});s1(u.books),Qp("")}catch(u){if(l?.aborted)return;Qp(U(u,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),vg=(0,m.useCallback)(async l=>{try{let u=await D("/story?offset=0&limit=50",{signal:l});h(u.entries),w(u.total)}catch(u){if(l?.aborted)return;h(null),Me(U(u,"Could not read the village story."))}},[]),Ml=(0,m.useCallback)(async l=>{try{let u=await D("/memories",{signal:l});A(u),Me("")}catch(u){if(l?.aborted)return;A(null),Me(U(u,"Could not read villager memories."))}},[]),C1=(0,m.useCallback)(async(l,u)=>{let p=l==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(p)){j(!0);try{await D(`/memories/${l}/${encodeURIComponent(u)}`,{method:"DELETE"}),await Ml()}catch(x){Me(U(x,"That memory could not be removed."))}finally{j(!1)}}},[Ml]),z1=(0,m.useCallback)(async l=>{j(!0);try{let u=await D(`/story/${encodeURIComponent(l)}`,{method:"DELETE"});h(u.entries),w(u.total),Me("")}catch(u){Me(U(u,"That memory could not be removed."))}finally{j(!1)}},[]),A1=(0,m.useCallback)(async()=>{let l=d?.length??0;try{let u=await D(`/story?offset=${l}&limit=50`);h(p=>[...p??[],...u.entries]),w(u.total)}catch(u){Me(U(u,"Could not read more memories."))}},[d]),Rl=(0,m.useCallback)(async l=>{try{let u=await D("/agendas",{signal:l});ae(u.villagers)}catch(u){if(l?.aborted)return;ae(null),Me(U(u,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(ne!=="menu"||G!=="agendas"&&G!=="schedules"||!q?.some(u=>u.agenda?.personalizationPending&&!u.agenda.personalizationFailure))return;let l=window.setInterval(()=>{Rl()},5e3);return()=>window.clearInterval(l)},[q,Rl,G,ne]);let M1=(0,m.useCallback)(async l=>{j(!0);try{let u=await D(`/agendas/${encodeURIComponent(l)}/regenerate`,{method:"POST"});ae(u.villagers),Me("")}catch(u){Me(U(u,"That villager could not be asked again."))}finally{j(!1)}},[]),R1=(0,m.useCallback)(async(l,u)=>{j(!0);try{let p=await D(`/agendas/${encodeURIComponent(l)}/completed/${encodeURIComponent(u)}/correct`,{method:"POST"});ae(p.villagers),Me("")}catch(p){Me(U(p,"That wish completion could not be corrected."))}finally{j(!1)}},[]),O1=(0,m.useCallback)(async(l,u)=>{j(!0);try{let p=await D(`/agendas/${encodeURIComponent(l)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:u})});ae(p.villagers),Me("")}catch(p){Me(U(p,"Schedule use could not be changed."))}finally{j(!1)}},[]);(0,m.useEffect)(()=>{let l=new AbortController;return Re({signal:l.signal}),()=>l.abort()},[Re]),(0,m.useEffect)(()=>{let l=()=>{document.hidden||Re({quiet:!0})},u=setInterval(()=>{document.hidden||Cl.current||Re({quiet:!0})},BS);return document.addEventListener("visibilitychange",l),()=>{clearInterval(u),document.removeEventListener("visibilitychange",l)}},[Re]),(0,m.useEffect)(()=>{if(!L?.id||L.status==="closed"||ne!=="room")return;pg.current!==L.id?(pg.current=L.id,xo.current=Date.parse(L.lastActivityAt||L.startedAt)||Date.now()):xo.current=Math.max(xo.current,Date.parse(L.lastActivityAt||L.startedAt)||0);let l=!1,u=R=>{l||(Pe(null),Wa(!1),xa([]),oa.current.clear(),Yr(R==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ge("home"),Re())},p=(R=!1)=>{D("/rooms/active").then(async({session:oe})=>{if(oe?.id===L.id){R&&(await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})}),xo.current=Date.now());return}let ie=await D(`/rooms/archive/${encodeURIComponent(L.id)}`).catch(()=>null);u(ie?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(oe=>{let ie=al(oe);ie&&u(ie)})},x=R=>{if(Date.now()-xo.current>=30*6e4){R.cancelable&&R.preventDefault(),R.stopImmediatePropagation(),p(!0);return}xo.current=Date.now(),!(Date.now()-mg.current<15e3)&&(mg.current=Date.now(),D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})}).catch(oe=>{let ie=al(oe);ie?u(ie):p()}))},E=()=>p();window.addEventListener("focus",E),document.addEventListener("visibilitychange",E);for(let R of["pointerdown","keydown","input","scroll"])window.addEventListener(R,x,!0);return()=>{l=!0,window.removeEventListener("focus",E),document.removeEventListener("visibilitychange",E);for(let R of["pointerdown","keydown","input","scroll"])window.removeEventListener(R,x,!0)}},[L?.id,L?.status,L?.lastActivityAt,L?.startedAt,ne,Re]),(0,m.useEffect)(()=>{let l=new AbortController;return D("/rooms/active",{signal:l.signal}).then(({session:u,debugDiscardEnabled:p})=>{T1(p),!(l.signal.aborted||!u)&&(Pe(u),Tl("chat"),Wa(!0),ge("room"),u.status==="opening"&&(et(!0),D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u.id}),signal:AbortSignal.timeout(3e4)}).then(({session:x})=>{l.signal.aborted||Pe(x)}).catch(async x=>{if(l.signal.aborted)return;let E=await D0(u.id);l.signal.aborted||(E?Pe(E):$t(_0(x)))}).finally(()=>{l.signal.aborted||et(!1)})))}).catch(()=>{}),()=>l.abort()},[]),(0,m.useEffect)(()=>{if(G!=="chatlogs"||!n?.isFounded)return;let l=new AbortController,u=new URLSearchParams;return Ne&&u.set("venueId",Ne),Qa&&u.set("characterId",Qa),u.set("offset",String(b)),u.set("limit","20"),_(null),D(`/rooms/archive?${u.toString()}`,{signal:l.signal}).then(({visits:p,total:x})=>{l.signal.aborted||(_(p),v(x),mt(""))}).catch(p=>{l.signal.aborted||mt(U(p,"Venue visits could not be read."))}),()=>l.abort()},[Ne,Qa,b,O,G,n?.isFounded]);let hd=(0,m.useCallback)(async l=>{try{let u=await D(`/rooms/archive/${encodeURIComponent(l)}`);B(u.visit),mt("")}catch(u){mt(U(u,"That visit could not be read."))}},[]),V1=(0,m.useCallback)(async l=>{j(!0);try{await D(`/rooms/archive/${encodeURIComponent(l)}/retry-memory`,{method:"POST"}),await hd(l),F(u=>u+1),mt("")}catch(u){mt(U(u,"Memory filing is still pending."))}finally{j(!1)}},[hd]),yg=(0,m.useCallback)(async l=>{if(window.confirm(l?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){j(!0);try{await D(l?`/rooms/archive/${encodeURIComponent(l)}`:"/rooms/archive",{method:"DELETE"}),B(null),S(0),F(u=>u+1),mt("")}catch(u){mt(U(u,"Visit transcripts could not be deleted."))}finally{j(!1)}}},[]);(0,m.useEffect)(()=>{if(!Xe)return;let l=new AbortController;return en(l.signal),()=>l.abort()},[Xe,en]);let wg=n?n.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(wg===null)return;let l=new AbortController;return(async()=>{try{let u=await D("/town-map",{signal:l.signal});xl(u.image)}catch{l.signal.aborted||xl("")}})(),()=>l.abort()},[wg]);let D1=(0,m.useCallback)(async l=>{j(!0);try{o(await D("/villagers",{method:"POST",body:JSON.stringify({characterId:l})})),Me(""),await en()}catch(u){Me(U(u,"That character could not move in."))}finally{j(!1)}},[en]),_1=(0,m.useCallback)(async l=>{j(!0);try{o(await D(`/villagers/${encodeURIComponent(l)}`,{method:"DELETE"})),Me(""),s&&await en()}catch(u){Me(U(u,"That villager could not leave."))}finally{j(!1)}},[s,en]),H1=(0,m.useCallback)(async l=>{wt(l);try{let u=await D(`/villagers/${encodeURIComponent(l)}/refresh`);me(p=>({...p,[l]:u})),Me("")}catch(u){Me(U(u,"That villager's card could not be compared."))}finally{wt("")}},[]),I1=(0,m.useCallback)(async l=>{wt(l);try{o(await D(`/villagers/${encodeURIComponent(l)}/refresh`,{method:"POST"})),me(u=>{let p={...u};return delete p[l],p}),Me("")}catch(u){Me(U(u,"That villager's card could not be refreshed."))}finally{wt("")}},[]),lt=(0,m.useCallback)(l=>{ot(l==="noticeboard"?"noticeboard":l==="general"?"general":l==="replyGuidance"||l==="story"||l==="chatlogs"||l==="agendas"||l==="schedules"?"debug":"village"),K(""),Qe(!1),l==="villagers"&&en(),l==="villagers"&&(ne!=="menu"||G!=="villagers")&&f("residents"),l==="village"&&To(),l==="village"&&ko(),l==="story"&&vg(),(l==="agendas"||l==="schedules")&&Rl(),l==="village"&&(ne!=="menu"||G!=="village")&&n&&(qn(n.settings.promptKnowledge),ll(n.settings.playerPersonaId),Bp(n.settings.setting),Lp(n.settings.selectedLorebookIds),jp(n.settings.loreTokenBudget),fo(In(n.settings.venues).map(p=>({...p})))),Fe(l),ge("menu")},[Rl,en,ko,To,vg,G,ne,n]),md=(0,m.useCallback)(()=>{va(!1),K(""),qe(null),Qe(!1),ge("home")},[]),U1=(0,m.useCallback)(async()=>{if(!(!L||Na)){et(!0),$t(""),Y(!1),Pe({...L,status:"closing"});try{if(L.id&&await D("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:L.id})}),No.current)return;Wa(!1),Pe(null),xa([]),oa.current.clear(),$o(""),Qr(""),ge("home"),Re()}catch(l){if(No.current)return;let u=al(l);if(u){Pe(null),Wa(!1),xa([]),oa.current.clear(),Yr(u==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ge("home"),Re();return}$t(U(l,"You could not leave the venue.")),Y(!0)}finally{et(!1)}}},[Re,L,Na]),q1=(0,m.useCallback)(async()=>{if(!L?.id||L.status!=="active"||Na||Xr.current)return;let l=kl.current??ku();kl.current=l,et(!0),$t(""),Y(!1);try{let u=await D("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:L.id,submissionId:l,message:Lr}),signal:AbortSignal.timeout(3e5)});Pe(u.session),Re(),ld(!0);for(let p of u.recordEvents??[])oa.current.has(p.id)||(oa.current.add(p.id),xa(x=>[...x,p]));kl.current=null,Re()}catch(u){$t(U(u,"The scene could not end yet.")),Y(!0)}finally{et(!1)}},[Re,L,Na,Lr]),B1=(0,m.useCallback)(async()=>{if(!(!L?.id||No.current)){No.current=!0,et(!0);try{await D("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:L.id})}),Wa(!1),Pe(null),xa([]),oa.current.clear(),ge("home"),Y(!1),Re()}catch(l){$t(U(l,"The visit could not be left yet.")),No.current=!1}finally{et(!1)}}},[Re,L]),L1=(0,m.useCallback)(async()=>{if(!(!L?.id||!od||Na)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){et(!0);try{await D("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:L.id})}),Pe(null),Wa(!1),xa([]),oa.current.clear(),$o(""),ge("home"),Re()}catch(l){$t(U(l,"The debug discard failed."))}finally{et(!1)}}},[L,od,Na,Re]),j1=(0,m.useCallback)(async()=>{let l=Lr.trim();if(L===null||!L.id||sd||Na||Xr.current||l.length===0)return;Xr.current=!0;let u=So.current??ku();So.current=u;let p=L;try{await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})})}catch(E){Xr.current=!1;let R=al(E);R?(Pe(null),Wa(!1),xa([]),oa.current.clear(),Yr(R==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ge("home"),Re()):$t(U(E,"The visit could not be checked."));return}let x={speakerId:"",name:"",role:"user",content:l,at:new Date().toISOString()};et(!0),$t(""),$o(""),Pe({...L,lines:[...L.lines,x]});try{let E=await D("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:L.id,message:l,mode:jr,targetId:jr==="fulfill"?Gr:"",submissionId:u}),signal:AbortSignal.timeout(3e5)});if(Pe(E.session),ld(E.session.status==="closed"),E.session.status==="closed")xa([]),oa.current.clear();else for(let R of E.recordEvents??[])oa.current.has(R.id)||(oa.current.add(R.id),xa(oe=>[...oe,R]));Gr&&!E.session.activeIds.includes(Gr)&&id(""),hg(E.verdict?.reason??""),Tl("chat"),So.current=null,Qr(""),Re()}catch(E){let R=al(E);if(R){Pe(null),Wa(!1),xa([]),oa.current.clear(),Yr(R==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ge("home"),Re();return}Pe(p),$o(l),$t(U(E,"That line could not be sent."))}finally{Xr.current=!1,et(!1)}},[Re,L,Na,Lr,sd,jr,Gr]),G1=(0,m.useCallback)(l=>(n?.villagers??[]).filter(u=>u.place?.id===l),[n]),Ol=(0,m.useCallback)(l=>{qe(null),Qe(!1),ta(l.id),jt("view"),Va(!1),Ge(null),yt(null),ge("venue")},[]),pd=(0,m.useCallback)(async l=>{et(!0),$t(""),Qr("");try{let u=await D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(3e4)});Pe(u.session),Re()}catch(u){let p=await D0(l);p?Pe(p):$t(_0(u))}finally{et(!1)}},[Re]),Y1=(0,m.useCallback)(async l=>{et(!0);try{let{session:u}=await D("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(1e4)});Pe(u),Qr(u.lines.length===0?"The greeting failed. You can start the conversation now.":""),$t("")}catch(u){$t(U(u,"The visit could not continue. Retry or leave the venue."))}finally{et(!1)}},[]),Zr=(0,m.useCallback)(async(l,u,p="")=>{No.current=!1,qe(null),Qe(!1),jn(null),$o(""),ld(!1),$t(""),Qr(""),xa([]),oa.current.clear(),et(!0),Pe({version:1,id:"",placeId:l.id,placeName:l.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Wa(!0),ge("room");try{let{session:x}=await D("/rooms",{method:"POST",body:JSON.stringify({venueId:l.id,spaceClass:u,privateOwnerId:p}),signal:AbortSignal.timeout(2e4)});Pe(x),Tl("chat"),id(""),hg(""),Yr(""),Wa(!0),Re(),x.status==="opening"&&await pd(x.id)}catch(x){$t(U(x,"That room could not be opened. Retry or leave the venue."))}finally{et(!1)}},[pd,Re]),$g=(0,m.useCallback)(l=>{Qe(!1),qe(l.id),ge("home")},[]),xg=(0,m.useCallback)(()=>{ta(null),jt("view"),Va(!1),Ge(null),yt(null),qe(null),ge("home")},[]),X1=(0,m.useCallback)(async()=>{j(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:Gt,playerPersonaId:wa,setting:cl,selectedLorebookIds:ul,loreTokenBudget:_u})}))}catch(l){K(U(l,"Those settings could not be saved."))}finally{j(!1)}},[Gt,ul,_u,wa,cl]),Q1=(0,m.useCallback)(async l=>{j(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({storyPace:l})}))}catch(u){K(U(u,"That could not be saved."))}finally{j(!1)}},[]),Ng=(0,m.useCallback)(async l=>{j(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:l})})),F(u=>u+1)}catch(u){K(U(u,"Visit retention could not be saved."))}finally{j(!1)}},[]),Z1=(0,m.useCallback)(async()=>{if(!(n&&In(n.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){j(!0),K("");try{let l=await D("/bootstrap",{method:"POST"});fo(l.places.map(u=>({id:ho(),name:u.name,purpose:u.purpose,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(l){K(U(l,"The village did not suggest any places."))}finally{j(!1)}}},[n]),K1=(0,m.useCallback)(async()=>{if(rt.trim().length===0){ue("Write the Setting and Theme before generating its map.");return}if(Ln.trim().length===0){ue("The DEBUG map layout prompt cannot be blank.");return}_r(!0),ue("");try{let l=await D("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:Ln===n?.settings.townMapLayoutPrompt?void 0:Ln,negative:vo===n?.settings.townMapNegativePrompt?void 0:vo,setting:rt,options:bl,selectedLorebookIds:na,scenarioImprint:n?.isFounded?{origin:"",worldFacts:Ja,openingConditions:[],visualCues:[]}:ye==="none"?null:st})}),u=await zp(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");Qu(l.image),Zu("generate"),ig(Pu),Ku(u),_i("generate")}catch(l){ue(U(l,"The village map could not be generated."))}finally{_r(!1)}},[na,vo,Ln,rt,bl,Pu,st,Ja,ye,n?.isFounded,n?.settings.townMapLayoutPrompt,n?.settings.townMapNegativePrompt]),J1=(0,m.useCallback)(async()=>{ue(""),j(!0);try{let l=await D("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:rt,selectedLorebookIds:na,loreTokenBudget:Ci})});fl(l.names)}catch(l){ue(U(l,"The village could not suggest names for the public venue."))}finally{j(!1)}},[na,Ci,rt]),F1=(0,m.useCallback)(async l=>{if(!l||!n)return;ue("");let u=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let p=x=>Math.round(x/1e5)/10;ue(`That picture is ${p(l.size)} MB and a village map holds ${p(u)} MB. Choose a smaller copy.`);return}_r(!0);try{let p=await il(l),x=await zp(p);Qu(p),Zu("upload"),Ku(x),_i("upload")}catch(p){ue(U(p,"That picture could not be used as the village map."))}finally{_r(!1)}},[n]),Sg=(0,m.useCallback)(async l=>{if(!l||!n)return;K("");let u=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let p=x=>Math.round(x/1e5)/10;K(`That picture is ${p(l.size)} MB and the village map holds ${p(u)} MB. Try a smaller copy.`);return}j(!0);try{let p=await il(l),x=await zp(p);ed({image:p,size:x}),Ir(Au("cover"))}catch(p){K(U(p,"That picture could not be used as the town map."))}finally{j(!1)}},[n]),Tg=(0,m.useCallback)(async()=>{if(!n)return;let l=qa?qa.image:$l;j(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:l,townMapView:td??n.settings.townMapView})})),xl(l),ed(null),Ir(null),ad(!1)}catch(u){K(U(u,"The town map could not be saved."))}finally{j(!1)}},[n,td,$l,qa]),Vl=(0,m.useCallback)(()=>{ed(null),Ir(null),ad(!1),K("")},[]),kg=(0,m.useCallback)(async()=>{j(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),xl(""),Vl()}catch(l){K(U(l,"The town map could not be taken down."))}finally{j(!1)}},[Vl]),P1=(0,m.useCallback)(async(l,u,p="")=>{if(!Pa){yo(l),jn(null),K("");try{o(await D("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:p})}))}catch(x){jn({id:l,text:U(x,"That place could not be drawn.")})}finally{yo("")}}},[Pa]),W1=(0,m.useCallback)(async(l,u,p,x="")=>{if(!(!u||!n||Pa)){yo(l),jn(null),K("");try{let E=oe=>Math.round(oe/1e5)/10;if(u.size>n.settings.maxVenueImageBytes){jn({id:l,text:`That picture is ${E(u.size)} MB and a place holds ${E(n.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let R=await il(u);o(await D("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:l,image:R,spaceClass:p,privateOwnerId:x})}))}catch(E){jn({id:l,text:U(E,"That picture could not be kept.")})}finally{yo("")}}},[Pa,n]),e$=(0,m.useCallback)(async(l,u,p="")=>{if(!Pa){yo(l),jn(null),K("");try{o(await D("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:p})}))}catch(x){jn({id:l,text:U(x,"That picture could not be taken away.")})}finally{yo("")}}},[Pa]),t$=n?.settings.maxPlaces??48,Eo=n?.settings.setupMaxVillagerCount??kp,Eg=(n?.settings.homeBuildings??[]).map(l=>({...l,name:n?.settings.homeBuildingNames?.[l.kind]??l.name})),a$=n&&!n.isFounded?1+Eo:t$,Dl=Math.max(0,a$-In(n?.settings.venues??[]).length),n$=(n?.settings.venues.length??0)+dl.filter(l=>!n?.settings.venues.some(u=>u.id===l.id)).length,Kr=(0,m.useCallback)(l=>{let u=Hp(l);hl(u.map(p=>({id:p.id,name:p.name,form:p.form??"Home",description:p.description,x:p.presentation.x,y:p.presentation.y,building:p.occupancy.homeKind,isPlayerHome:p.occupancy.playerHome,characterId:p.occupancy.residentCharacterId}))),Iu(u[0]?.id??null),Yt(!1)},[]),Cg=(0,m.useCallback)(()=>{K(""),n&&Kr(n.settings.venues),ot("village"),Fe("homes"),ge("menu")},[Kr,n]),zg=(0,m.useCallback)((l,u)=>{if(K(""),$a.length>=Dl||$a.length>=1+Eo)return;let p=ho(),x=$a.length===0;hl(E=>[...E,{id:p,name:x?"Your residence":`Residence ${E.length+1}`,form:"Home",description:"",x:l,y:u,building:null,isPlayerHome:x,characterId:null}]),Iu(p)},[$a.length,Dl,Eo]),i$=(0,m.useCallback)((l,u,p)=>{let x=Ce.find(R=>R.category==="public-center"),E=Yu??(ml?x?.id:void 0);if($0({x:l,y:u},Ce.filter(R=>R.id!==E).map(R=>R.presentation),p??{width:1e3,height:700,photoWidth:58,photoHeight:58})){Xu("That photograph would cover another venue. Place it a little to the side.");return}if(Xu(""),E)Oi(R=>R.map(oe=>oe.id===E?{...oe,presentation:{...oe.presentation,x:l,y:u}}:oe)),Bn(E);else if(ml){let R=R0(ho(),"gathering",l,u);Oi(oe=>[...oe,R]),Bn(R.id)}else if(zi){let R=Ce.filter(ie=>ie.classes?.includes("residence"));if(R.length>=1+Eo)return;let oe=R0(ho(),"residence",l,u,R.length===0,R.length+1);Oi(ie=>[...ie,oe]),Bn(oe.id)}Vi(null),Yt(!1),Ai(!1)},[Yu,zi,ml,Eo,Ce]),Qt=(0,m.useCallback)((l,u)=>{Oi(p=>p.map(x=>x.id===l?u(x):x))},[]),o$=(0,m.useCallback)(l=>{Oi(u=>{let p=u.filter(x=>x.id!==l);if(!p.some(x=>x.occupancy.playerHome)){let x=p.findIndex(E=>E.classes?.includes("residence"));x>=0&&(p[x]={...p[x],occupancy:{...p[x].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return p}),Bn(u=>u===l?null:u),Fa(u=>{let p={...u};return delete p[l],p})},[]),r$=(0,m.useCallback)((l,u)=>{zg(l,u),Yt(!1),ge("menu")},[zg]),Ag=(0,m.useCallback)((l,u)=>{n?.settings.venues.some(p=>p.id===l&&p.occupancy.residentCharacterId)||hl(p=>p.map(x=>x.id===l?{...x,...u}:x))},[n]),s$=(0,m.useCallback)(l=>{if(n?.settings.venues.some(u=>u.id===l&&u.occupancy.residentCharacterId)){K("Move the resident to another venue before removing this home.");return}hl(u=>{let p=u.filter(x=>x.id!==l);return p.length>0&&!p.some(x=>x.isPlayerHome)&&(p[0]={...p[0],isPlayerHome:!0,characterId:null}),p})},[n]),l$=(0,m.useCallback)(async()=>{if(n){if($a.some(l=>!l.description.trim())){K("Review a description for every home before saving.");return}j(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({venues:US(n.settings.venues,$a),venueScope:"homes"})})),Yt(!1)}catch(l){K(U(l,"Those homes could not be saved."))}finally{j(!1)}}},[$a,n]),c$=async l=>{if(!n)return;let u=n.villagers.find(x=>x.characterId===l.characterId)?.name,p=l.isPlayerHome?`${po(n)}'s home`:u?`${u}'s home`:B0(Eg,l.building).name;j(!0),K("");try{let x=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:p,purpose:l.isPlayerHome?"Player residence":u?`Home of ${u}`:"Available home",homeKind:l.building}]})});Ag(l.id,{description:x.descriptions[l.id]??""})}catch(x){K(U(x,"The home description could not be generated. You can write it by hand."))}finally{j(!1)}},u$=l=>{if(n?.isFounded||l===ye)return;let u=h1[l]??"";Gu(p=>({...p,[ye]:wn})),Pp(l),Lu(Cr(l).premise),ju(l==="none"?"":u),Mi(el()),Ri(""),Fa({}),ue("")},d$=async()=>{let l=Xt;j(!0),eg(!0),ue("");try{let u=await D("/setup/scenario-imprint/draft",{method:"POST",body:JSON.stringify({foundingReason:ye,foundingDetails:Ia,foundingGuidance:wn,setting:rt,selectedLorebookIds:na,loreTokenBudget:Ci})});Dr.current===l&&(Mi(u.imprint),Ri(""),Fa({}))}catch(u){ue(U(u,"The Scenario imprint could not be drafted. You can write it yourself."))}finally{eg(!1),j(!1)}},h$=(l,u)=>{Mi(p=>({...p,[l]:u.split(/\r?\n/u)})),Ri("")},m$=()=>{let l={origin:st.origin.trim(),worldFacts:st.worldFacts.map(p=>p.trim()).filter(Boolean),openingConditions:st.openingConditions.map(p=>p.trim()).filter(Boolean),visualCues:st.visualCues.map(p=>p.trim()).filter(Boolean)},u=[[l.worldFacts,160],[l.openingConditions,160],[l.visualCues,120]];if(!l.origin&&!u.some(([p])=>p.length)||l.origin.length>400||u.some(([p,x])=>p.length>4||p.some(E=>E.length>x))){ue("Add an origin or starting detail. Use at most four short lines in each list.");return}Mi(l),Ri(Xt),Fa({}),ue("")},Jr=(0,m.useCallback)((l,u)=>{K(""),ue(""),sg(!1),Hr(!1),wl(!1),va(!1),sl(""),Bu(0),Jp(l?"":u?.village.name??""),Fp(l?"":u?.village.setting??"");let p=l?"":u?.settings.foundingReason??"",x=Vp.some(ra=>ra.value===p),E=x?p:p?"custom":"rebuild",R=wS[p]??p,oe=u?.settings.foundingDetails??"",ie=[R,oe].filter(Boolean).join(" "),pt=ie.length>(u?.settings.foundingDetailsMaxLength??500),Gn=u?.isFounded?oe:p&&!x?pt?oe:ie:l||!p?Cr(E).premise:oe,Yn=l?"":u?.isFounded?u.settings.foundingGuidance??"":[pt?R:"",u?.settings.foundingGuidance??""].filter(Boolean).join(" ");Pp(E),Lu(Gn),ju(E==="none"?"":Yn),Mi(l?el():u?.settings.scenarioImprint??el()),Wp(l?[]:u?.settings.worldFacts??[]),Ri(""),Gu({[E]:Yn}),fl([]);let zo=l||!u?[]:u.settings.venues.filter(ra=>ra.classes?.includes("residence")||ra.category==="public-center");Oi(zo.map(ra=>({...ra,guidance:""}))),Bn(zo[0]?.id??null),Vi(null),Fa({}),Di(null),Xu(""),Gp(l?[]:u?.settings.selectedLorebookIds??[]),Yp(l?1600:u?.settings.loreTokenBudget??1600),ng({...A0}),_i(l?"generate":u?.settings.townMapImageSetAt?"existing":"none"),Qu(""),Zu(null),ig(""),Ku(null),Ju(u?.settings.townMapLayoutPrompt??""),Fu(u?.settings.townMapNegativePrompt??""),_r(!1),ll(l?"":u?.settings.playerPersonaId??""),To(),ko(),Kr(l||!u?[]:u.settings.venues),ge("setup")},[ko,To,Kr]),gd=(0,m.useCallback)(l=>{if(ye==="none"&&be===2&&l===3&&(l=4),ye==="none"&&be===4&&l===3&&(l=2),be===0&&l>0){if(Ka.trim().length===0){ue("Give the village a name before continuing.");return}if(!n?.isFounded&&ye!=="none"&&!Ia.trim()){ue("Write a scenario premise, or choose No scenario.");return}}if(be===1&&l>1){if(!wa.trim()){ue("Choose the Persona who lives in this village.");return}if(Wu.length>0){ue(Wu);return}if(rg){Hr(!0);return}}if(be===2&&l>2&&rt.trim().length===0){ue("Write the Setting and Theme before continuing.");return}if(be===3&&l>3&&!n?.isFounded&&ye!=="none"&&Rr!==Xt){ue("Review and approve the Scenario imprint before drawing the map.");return}if(be===4&&l>4&&ze!=="none"&&!Hi){ue(ze==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(be===5&&l>5){let u=Ce.filter(R=>R.classes?.includes("residence")),p=u.filter(R=>!R.occupancy.playerHome),x=p.length;if(!u.some(R=>R.occupancy.playerHome)||x<M0||x>kp||!Ce.some(R=>R.category==="public-center")){ue("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}if(Ce.some(R=>!R.name.trim()||!R.form?.trim()||!R.description.trim()||!R.spaces?.[0]?.description.trim())){ue("Give every venue a name, form, exterior description, and scene description before review.");return}let E=p.map(R=>R.occupancy.residentCharacterId).filter(Boolean);if(E.length!==p.length||new Set(E).size!==E.length){ue("Assign a different villager to each villager Residence before review.");return}}Hr(!1),ue(""),Bu(l),l===1&&To(),l===2&&ko(),l===5&&en(),Yt(!1),Ai(!1),Vi(null)},[Wu,Ce,rg,en,To,ko,wa,ze,Hi,Ka,ye,Ia,Rr,Xt,n?.isFounded,rt,be]),p$=(0,m.useCallback)(()=>{Hr(!1),ue(""),Bu(2),Yt(!1),Ai(!1)},[]),g$=(0,m.useCallback)(()=>{Hr(!1),ue("")},[]),P=Ce.find(l=>l.id===tg)??null,Co=P?je(P,P.category==="public-center"?"gathering":"residence"):null,Mg=l=>({id:l.id,name:l.name,form:l.form??"",purpose:l.purpose,description:l.description,spaceDescription:l.spaces?.[0]?.description??"",venueClass:l.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:l.occupancy.residentCharacterId??"",guidance:l.guidance}),Rg=async l=>{if(!l.length||Ua)return;let u=Xt;bo(!0),ue("");try{let p=await D("/setup/venues/draft",{method:"POST",body:JSON.stringify({setting:rt,foundingReason:ye,foundingDetails:Ia,foundingGuidance:wn,scenarioImprint:n?.isFounded||ye==="none"?null:st,worldFacts:n?.isFounded?Ja:[],selectedLorebookIds:na,loreTokenBudget:Ci,venues:l.map(Mg)})});Dr.current===u&&Fa(x=>({...x,...p.drafts}))}catch(p){ue(U(p,"Venue text could not be drafted."))}finally{bo(!1)}},fd=(l,u)=>{let p=ia[l];p&&(Qt(l,x=>{let E=(ie,pt,Gn="")=>(u||!ie.trim()||ie===Gn)&&pt||ie,R=je(x,x.classes?.includes("gathering")?"gathering":"residence"),oe=(ie,pt)=>u||ie.length===0?pt??ie:ie;return{...x,name:E(x.name,p.name,x.category==="public-center"?"Gathering Place":x.occupancy.playerHome?"Your residence":`Residence ${Ce.filter(ie=>ie.classes?.includes("residence")).findIndex(ie=>ie.id===x.id)+1}`),form:E(x.form??"",p.form,x.category==="public-center"?"Gathering place":"Home"),purpose:E(x.purpose,p.purpose),description:E(x.description,p.description),spaces:[{...R,description:E(R.description,p.spaceDescription),state:{...R.state,condition:E(R.state.condition,p.condition),items:oe(R.state.items,p.items),publicFacts:oe(R.state.publicFacts,p.publicFacts),features:oe(R.state.features.map(ie=>ie.text),p.features).map((ie,pt)=>({id:R.state.features[pt]?.id??ho(),text:ie,sourceCharacterId:"",locked:R.state.features[pt]?.locked??!1,updatedAt:""}))}}]}}),Fa(x=>{let E={...x};return delete E[l],E}))},f$=async(l,u)=>{if(Ua)return;let p=Xt;bo(!0),ue("");try{let x=await D("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:Mg(l),area:u,villageName:Ka,setting:rt,scenarioImprint:n?.isFounded||ye==="none"?null:st,worldFacts:n?.isFounded?Ja:[],selectedLorebookIds:na})});Dr.current===p&&Di({venueId:l.id,area:u,image:x})}catch(x){ue(U(x,"Venue art could not be generated."))}finally{bo(!1)}},b$=async(l,u,p)=>{if(!(!p||Ua)){if(p.size>(n?.settings.maxVenueImageBytes??8e6)){ue("That venue image is too large. Choose a smaller file.");return}bo(!0),ue("");try{let x=await D("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:l.name,image:await il(p)})});Di({venueId:l.id,area:u,image:x})}catch(x){ue(U(x,"That venue image could not be uploaded."))}finally{bo(!1)}}},v$=()=>{if(!Or)return;let{venueId:l,area:u,image:p}=Or;Qt(l,x=>u==="exterior"?{...x,presentation:{...x.presentation,image:p}}:{...x,spaces:[{...je(x,x.classes?.includes("gathering")?"gathering":"residence"),image:p}]}),Di(null)},Og=(0,m.useCallback)(()=>{if(Ka.trim().length===0)return"Give the village a name.";if(wa.trim().length===0)return"Choose the Persona who lives in this village.";if(!n?.isFounded&&ye!=="none"&&!Ia.trim())return"Write a scenario premise.";let l=Ja.map(E=>E.trim()).filter(Boolean);if(n?.isFounded&&(l.length>4||l.some(E=>E.length>160)))return"Use at most four current world facts of 160 characters each.";if(!n?.isFounded&&ye!=="none"&&Rr!==Xt)return"Review and approve the Scenario imprint.";if(rt.trim().length===0)return"Write the Setting and Theme.";if(ze!=="none"&&!Hi)return"Choose, generate, or upload the village map.";let u=Ce.filter(E=>E.classes?.includes("residence")),p=u.filter(E=>!E.occupancy.playerHome);if(p.length<M0||p.length>kp)return"Place one to three homes for initial villagers.";if(!u.some(E=>E.occupancy.playerHome))return"One Residence has to be yours.";if(Ce.some(E=>!E.name.trim()||!E.form?.trim()||!E.description.trim()||!E.spaces?.[0]?.description.trim()))return"Give every venue a name, Form, exterior description, and scene description in Step 6.";let x=p.map(E=>E.occupancy.residentCharacterId).filter(E=>E!==null);return x.length!==p.length?"Choose who lives in each villager home.":new Set(x).size!==x.length?"A villager can only live in one house.":Ce.filter(E=>E.category==="public-center").length!==1?"Place one Gathering Place.":""},[Ce,wa,ze,Hi,Ka,ye,Ia,Rr,Xt,n?.isFounded,Ja,rt]),y$=(0,m.useCallback)(async()=>{let l=Og();if(l){ue(l);return}j(!0),ue("");try{let u=await D("/setup",{method:"POST",body:JSON.stringify({name:Ka.trim(),setting:rt.trim(),foundingReason:n?.isFounded?n.settings.foundingReason:ye,foundingDetails:n?.isFounded?n.settings.foundingDetails:Ia.trim(),foundingGuidance:n?.isFounded?n.settings.foundingGuidance:wn.trim(),scenarioImprint:n?.isFounded?n.settings.scenarioImprint:ye==="none"?null:st,worldFacts:n?.isFounded?Ja.map(p=>p.trim()).filter(Boolean):ye==="none"?[]:st.worldFacts,selectedLorebookIds:na,loreTokenBudget:Ci,playerPersonaId:wa,townMapImage:Hi??"",townMapView:ze==="existing"?wo:Au("cover"),venues:Ce})});o(u),Yt(!1),ge(!n?.isFounded||u.foundingPreparation?.status==="pending"||u.foundingPreparation?.status==="failed"?"preparing":"home")}catch(u){ue(U(u,"The village could not be founded."))}finally{j(!1)}},[n?.isFounded,n?.settings.foundingReason,n?.settings.foundingDetails,n?.settings.foundingGuidance,n?.settings.scenarioImprint,Ce,wa,wo,Og,ze,Hi,Ka,ye,Ia,wn,st,Ja,na,Ci,rt]),w$=(0,m.useCallback)(async()=>{j(!0),K("");try{let l=await D("/setup/reset",{method:"POST"});o(l),c(null),Jr(!0,l)}catch(l){K(U(l,"The village could not be reset."))}finally{j(!1),wl(!1)}},[Jr]),Vg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!n||Vg.current||(Vg.current=!0,n.isFounded?n.foundingPreparation&&n.foundingPreparation.status!=="ready"&&ge("preparing"):Jr(!1,n))},[Jr,n]),(0,m.useEffect)(()=>{if(ne!=="preparing")return;let l=!1,u=async()=>{try{let x=await D("/setup/preparation");if(l)return;o(x),yl(""),(!x.foundingPreparation||x.foundingPreparation.status==="ready")&&ge("home")}catch(x){l||yl(U(x,"Preparation status could not be read."))}};u();let p=window.setInterval(()=>{u()},2500);return()=>{l=!0,window.clearInterval(p)}},[ne]);let $$=(0,m.useCallback)(async()=>{yl("");try{o(await D("/setup/preparation/retry",{method:"POST"}))}catch(l){yl(U(l,"Preparation could not be retried."))}},[]),x$=(0,m.useCallback)(()=>{Ge({id:ho(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],purpose:"",description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),N$=(0,m.useCallback)(async l=>{j(!0),K("");try{let u=n?.settings.venues.some(R=>R.id===l.id)??!1,p=Un(l).map(R=>je(l,R)),x=await D(u?`/locations/venue/${encodeURIComponent(l.id)}`:"/locations/venue",{method:u?"PUT":"POST",body:JSON.stringify({name:l.name,form:l.form,classes:l.classes,residenceCapacity:l.residenceCapacity,spaces:p,workerIds:l.workerIds??[],presentation:{x:l.presentation.x,y:l.presentation.y},purpose:l.purpose,category:l.category,description:p[0]?.description??l.description,state:{condition:p[0]?.state.condition??"",furniture:p[0]?.state.items??[],publicFacts:p[0]?.state.publicFacts??[],features:p[0]?.state.features??[]}})}),E=In(x.settings.venues).find(R=>u?R.id===l.id:R.name.toLowerCase()===l.name.trim().toLowerCase());o(x),Ge(null),fo(R=>{let oe=R.map(ie=>ie.id===l.id&&E?E:ie);return[...oe,...In(x.settings.venues).filter(ie=>!oe.some(pt=>pt.id===ie.id))]})}catch(u){K(U(u,"That place could not be saved."))}finally{j(!1)}},[n]),S$=(0,m.useCallback)(async l=>{let u=n?.settings.venues.find(p=>p.id===l);if(!u){fo(p=>p.filter(x=>x.id!==l));return}j(!0),K("");try{let p=await D(`/locations/venue/${encodeURIComponent(l)}/dependencies`);if(p.roomPresent||p.playerHome||p.residentCharacterIds.length||p.pendingMailCount){K(p.roomPresent?"End the active visit before deleting this Venue.":p.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let x=p.residentCharacterIds.length+p.pendingResidenceCharacterIds.length,E=x||p.workerCharacterIds.length||p.remapCount||p.eventCount?`This place is referenced by ${x} pending moves, ${p.workerCharacterIds.length} workers, ${p.remapCount} schedule moves, and ${p.eventCount} events. Delete it?`:`Delete ${u.name}?`;if(!window.confirm(E))return;let R=await D(`/locations/venue/${encodeURIComponent(l)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(R),fo(oe=>oe.filter(ie=>ie.id!==l))}catch(p){K(U(p,"That place could not be removed."))}finally{j(!1)}},[n]),Dg=(0,m.useCallback)(async(l,u)=>{j(!0),K("");try{let p=Ti[l.id]??l.venueDraft,x=await D(`/venue-requests/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST",body:u?JSON.stringify(p):void 0});if(o(x),u){let E=new Set(dl.map(R=>R.id));fo(R=>[...R,...In(x.settings.venues).filter(oe=>!E.has(oe.id))])}ki(E=>{let R={...E};return delete R[l.id],R})}catch(p){K(U(p,u?"That venue could not be approved.":"That request could not be denied."))}finally{j(!1)}},[Ti,dl]),T$=(0,m.useCallback)(l=>{let u=ud.current,p=u?.selectionStart??Gt.length,x=u?.selectionEnd??p;dd.current=p+l.length,qn(`${Gt.slice(0,p)}${l}${Gt.slice(x)}`)},[Gt]),_g=(0,m.useCallback)(async()=>{let l=gl.trim();if(l.length!==0){j(!0),K("");try{o(await D("/noticeboard",{method:"POST",body:JSON.stringify({notice:l})})),Kp("")}catch(u){K(U(u,"That notice could not be pinned up."))}finally{j(!1)}}},[gl]),k$=(0,m.useCallback)(async l=>{j(!0),K("");try{o(await D(`/noticeboard/${l}`,{method:"DELETE"}))}catch(u){K(U(u,"That notice could not be taken down."))}finally{j(!1)}},[]),_l=Ei.trim().toLowerCase(),bd=(s??[]).filter(l=>_l.length===0||l.name.toLowerCase().includes(_l)||l.comment.toLowerCase().includes(_l)||l.tags.some(u=>u.toLowerCase().includes(_l))),Hg=[...(n?.villagers??[]).map(l=>l.characterId),...Xe?bd.map(l=>l.id):[]].join(`
`),Ig=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let l=Hg.split(`
`).filter(p=>p.length>0&&!Ig.current.has(p));if(l.length===0)return;for(let p of l)Ig.current.add(p);let u=new AbortController;return(async()=>{try{let p=await OS(l,u.signal);u.signal.aborted||Vu(x=>({...x,...p}))}catch{}})(),()=>u.abort()},[Hg]);let vd=n?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(yn(null),vd.length===0)return;let l=new AbortController;return(async()=>{try{let u=await VS(vd,l.signal);l.signal.aborted||yn(u)}catch{}})(),()=>l.abort()},[vd]);let Ht=(0,m.useCallback)(l=>l?s?.find(u=>u.id===l)?.name??n?.villagers.find(u=>u.characterId===l)?.name??"":"",[s,n]),E$=(()=>{let l=n?.settings.venues??[],u=[],p=new Map;for(let x of n?.villagers??[]){let E=x.place?.id;if(!E)continue;let R=p.get(E);R?R.push(x):p.set(E,[x])}for(let x of l){let E=nl(x);if(!E)continue;let R=x.occupancy.residentCharacterId,oe=Ar(x),ie=x.occupancy.playerHome?po(n):Ht(R);u.push({id:x.id,x:E.x,y:E.y,text:oe?KS(ie):x.name,image:x.presentation.image?.url??null,tone:oe?L0({isPlayerHome:x.occupancy.playerHome,occupant:R}):"venue",selected:Ue===x.id,doors:Ue===x.id?[{label:"View venue",onSelect:()=>Ol(x)},{label:"Visit",onSelect:()=>{Zr(x)}}]:void 0,onSelect:()=>$g(x)}),(p.get(x.id)??[]).forEach((pt,Gn)=>{u.push({id:`villager:${pt.characterId}`,x:E.x,y:E.y,dy:FS*(Gn+1),text:pt.name,tone:"resident",kind:"person"})})}return u})(),C$=Ce.flatMap(l=>{let u=nl(l);return u?[{id:l.id,x:u.x,y:u.y,text:l.name||(l.category==="public-center"?"Gathering Place":"Residence"),image:l.presentation.image?.url??null,tone:l.category==="public-center"?"venue":l.occupancy.playerHome?"player":"resident",onSelect:()=>Bn(l.id)}]:[]});if(ne==="room")return(0,r.jsxs)("div",{className:`${i}-root ${i}-room-screen`,"data-mobile":t?"true":"false",children:[L?(0,r.jsx)(s2,{room:L,picture:CS(n?.settings.venues??[],L),draft:Lr,mode:jr,targetId:Gr,busy:Na,error:k1,greetingNotice:E1,ruling:N1,open:x1,ended:sd,playerName:po(n),playerPortrait:ya??void 0,portraits:Mr,sprites:Object.fromEntries((n?.villagers??[]).map(l=>[l.characterId,l.sprite])),onDraft:l=>{So.current=null,kl.current=null,$o(l)},onMode:l=>{So.current=null,Tl(l)},onTarget:l=>{So.current=null,id(l)},onSend:()=>{jr==="conclude"?q1():j1()},onViewVenue:()=>{ta(L.placeId),Ge(null),ge("venue"),Re()},onEnterPrivate:L.area==="shared"&&L.privateAccessOwnerId?()=>{et(!0),D("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:L.id,ownerId:L.privateAccessOwnerId})}).then(({session:l})=>{Pe(l),Re()}).catch(l=>$t(U(l,"That private space could not be entered."))).finally(()=>et(!1))}:void 0,privateSpaceOwnerName:Ht(L.privateAccessOwnerId),onEnd:()=>{U1()},notices:S1,onDismissNotice:l=>xa(u=>u.filter(p=>p.id!==l)),debugDiscardEnabled:od,onDebugDiscard:()=>{L1()},onLeavePending:()=>{B1()},endFailed:ve,onRetryGreeting:()=>{if(L.id)pd(L.id);else{let l=n?.settings.venues.find(u=>u.id===L.placeId);l&&Zr(l)}},onContinueWithoutGreeting:()=>{L.id&&Y1(L.id)},onUseMailbox:n?.settings.venues.some(l=>l.id===L.placeId&&l.occupancy.playerHome&&(!L.spaceClass||L.spaceClass==="residence"))?()=>Br(!0):void 0}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:md,children:"Back to village"}),$1&&n?(0,r.jsx)("div",{className:`${i}-mailbox-backdrop`,onClick:()=>Br(!1),children:(0,r.jsxs)("section",{className:`${i}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:l=>l.stopPropagation(),children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Mailbox"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Br(!1),children:"Close"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,r.jsxs)("div",{className:`${i}-mailbox-list`,children:[[...n.venueMail??[]].reverse().map(l=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsx)("strong",{children:l.title}),(0,r.jsx)("p",{children:l.detail}),(0,r.jsx)("p",{className:`${i}-hint`,children:l.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(l.dueAt).toLocaleString()}`:l.status==="pending-player"?"Awaiting your decision":l.status==="approved"?"Approved":"Declined"}),l.decisions.map(u=>(0,r.jsxs)("p",{children:[(0,r.jsxs)("strong",{children:[Ht(u.characterId),":"]})," ",u.reply]},u.characterId)),l.status==="pending-player"&&l.kind==="villager-change"?(0,r.jsx)(r2,{entry:l,onDecide:async(u,p)=>{o(await D(`/venue-mail/${encodeURIComponent(l.id)}/decision`,{method:"POST",body:JSON.stringify({approved:u,...p})}))}}):null,l.error?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Reply delayed: ",l.error]}):null]},l.id)),(n.venueMail?.length??0)===0&&n.venueRequests.length===0&&n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No Venue mail yet."}):null,n.venueRequests.map(l=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[l.requesterName||"A villager"," suggests ",l.venueDraft.name]}),(0,r.jsx)("p",{children:l.venueDraft.purpose}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Br(!1),lt("venueRequests")},children:"Review request"})]},l.id)),n.upgradeRequests.map(l=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[l.requesterName," suggests a home change"]}),(0,r.jsx)("p",{children:l.detail}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Br(!1),lt("venueRequests")},children:"Review request"})]},l.id))]})]})}):null]});if(ne==="venue"){let l=(n?.settings.venues??[]).find(T=>T.id===go)??null;if(!n||!l)return(0,r.jsx)("div",{className:`${i}-root`,children:(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:"This venue is no longer in the village."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:xg,children:"Back to map"})]})});let u=G1(l.id),p=Un(l),x=l.occupancy.homeKind?B0(Eg,l.occupancy.homeKind).name:"",E=l.occupancy.playerHome?po(n):Ht(l.occupancy.residentCharacterId),R=p.includes("residence")&&(l.residentIds?.length??0)>0,oe=L?.placeId===l.id&&(L.area==="shared"||L.area==="private"),ie=L?.placeId===l.id&&L.area==="private"?L.privateOwnerId:"",pt=l.occupancy.playerHome||l.playerSeenShared||oe,Gn=(l.privateSpaces??[]).filter(T=>l.playerSeenPrivateIds?.includes(T.ownerId)||T.ownerId===ie),Yn=[...p.map(T=>({key:T,label:`${T[0].toUpperCase()}${T.slice(1)} space`,spaceClass:T,ownerId:""})),...(l.playerInvitations??[]).filter(T=>T.scope==="private"&&T.ownerId).map(T=>({key:`private:${T.ownerId}`,label:`${Ht(T.ownerId??"")}'s private space`,spaceClass:"residence",ownerId:T.ownerId??""}))],zo=(T,J,Z,re="")=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:T}),J?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:J.url,alt:`${T} at ${l.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"No image yet"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Pa||V,onClick:()=>{P1(l.id,Z,re)},children:J?"Redraw image":"Draw image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*","aria-label":`Upload ${T.toLowerCase()} image`,disabled:!!Pa||V,onChange:ct=>{let Fr=ct.target.files?.[0];ct.target.value="",W1(l.id,Fr,Z,re)}}),J?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Pa||V,onClick:()=>{e$(l.id,Z,re)},children:"Remove image"}):null]})]},re||Z||"exterior"),ra=T=>({name:T.name,form:T.form,purpose:T.purpose,workerIds:T.workerIds,position:{x:T.presentation.x,y:T.presentation.y},spaces:p.map(J=>{let Z=je(T,J);return{description:Z.description,condition:Z.state.condition,items:Z.state.items,publicFacts:Z.state.publicFacts,features:Z.state.features.map(({id:re,text:ct,locked:Fr})=>({id:re,text:ct,locked:Fr}))}}),privateSpaces:T.privateSpaces?.map(J=>({ownerId:J.ownerId,description:J.description,condition:J.state.condition,items:J.state.items,publicFacts:J.state.publicFacts,features:J.state.features.map(({id:Z,text:re,locked:ct})=>({id:Z,text:re,locked:ct}))}))}),z$=!!(fe&&JSON.stringify(ra(fe))!==JSON.stringify(ra(l))),A$=!!(le&&(JSON.stringify(le.classes)!==JSON.stringify(p)||le.capacity!==(l.residenceCapacity??1)||le.slot!==0||le.title||le.description||le.extraBeds)),M$=()=>{(X==="edit"&&z$||X==="proposal"&&A$)&&!window.confirm("Discard your unsaved changes?")||(jt("view"),Ge(null),yt(null),zt(""),z(""))},Ug=(T,J)=>{o(T);let Z=T.settings.venues.find(re=>re.id===l.id);Z&&Ge(structuredClone(Z)),z(J)},R$=async()=>{if(fe){if(R){let T=ra(fe),J=ra(l),Z=p.indexOf("residence");if((Z>=0&&JSON.stringify(T.spaces[Z])!==JSON.stringify(J.spaces[Z])||JSON.stringify(T.privateSpaces)!==JSON.stringify(J.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}Vt(!0),zt(""),z("");try{let T=p.map(re=>je(R&&re==="residence"?l:fe,re)),J=T[0],Z=await D(`/locations/venue/${encodeURIComponent(l.id)}`,{method:"PUT",body:JSON.stringify({name:fe.name,form:fe.form,purpose:fe.purpose,description:R?l.description:J?.description??fe.description,spaces:T,workerIds:fe.workerIds??[],presentation:{x:fe.presentation.x,y:fe.presentation.y},state:R?l.state:{condition:J?.state.condition??"",furniture:J?.state.items??[],publicFacts:J?.state.publicFacts??[],features:J?.state.features??[]}})});Ug(Z,"Venue details saved.")}catch(T){zt(U(T,"The Venue could not be saved."))}finally{Vt(!1)}}},qg=async(T,J="")=>{if(!fe)return;let Z=T==="private"?fe.privateSpaces?.find(ct=>ct.ownerId===J):je(fe,"residence");if(!Z)return;let re=structuredClone(fe);if(T==="shared"?re.spaces=re.spaces?.map(ct=>ct.venueClass==="residence"?je(l,"residence"):ct):re.privateSpaces=re.privateSpaces?.map(ct=>ct.ownerId===J?l.privateSpaces?.find(Fr=>Fr.ownerId===J)??ct:ct),!(JSON.stringify(ra(re))!==JSON.stringify(ra(l))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){Vt(!0),zt(""),z("");try{let ct=await D(`/locations/venue/${encodeURIComponent(l.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:T,ownerId:J,description:Z.description,state:Z.state})});Ug(ct,`${T==="private"?"Private":"Shared"} room edit proposed.`)}catch(ct){zt(U(ct,"That room edit could not be proposed."))}finally{Vt(!1)}}},Bg=JS(l,E);return(0,r.jsxs)("div",{className:`${i}-root`,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:X==="view"?Bg:`${X==="edit"?"Edit Venue":"Propose Change"} \xB7 ${Bg}`}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:X==="view"?u.length===0?"Nobody is here right now":`Villagers here: ${u.map(T=>T.name).join(", ")}`:X==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:X==="view"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ge(structuredClone(l)),zt(""),z(""),jt("edit")},children:"Edit Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{yt({classes:p,capacity:l.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),zt(""),z(""),jt("proposal")},children:"Propose Change"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:L?.placeId===l.id&&L.status!=="closed"?()=>ge("room"):xg,children:L?.placeId===l.id&&L.status!=="closed"?"Return to scene":"Back to map"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:M$,children:X==="edit"?"Close Editor":"Exit Change Proposal"})})]}),X==="view"?(0,r.jsxs)("main",{className:`${i}-venue-page`,children:[(0,r.jsxs)("section",{className:`${i}-venue-hero`,children:[l.presentation.image?(0,r.jsx)("img",{className:`${i}-venue-picture`,src:l.presentation.image.url,alt:`Exterior of ${l.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Exterior image not drawn yet"}),(0,r.jsxs)("div",{className:`${i}-venue-context`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"The place"}),l.purpose?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:l.purpose}):null,l.form||x?(0,r.jsx)("p",{children:l.form||x}):null,n.village.setting?(0,r.jsx)("p",{className:`${i}-hint`,children:n.village.setting}):null,p.includes("residence")?(0,r.jsxs)("p",{className:`${i}-hint`,children:[Ou(l)," / ",H0(l)," residents"]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Na,"aria-expanded":Yn.length>1?Za:void 0,onClick:()=>{if(Yn.length===1){let T=Yn[0];Zr(l,T.spaceClass,T.ownerId)}else Va(T=>!T)},children:Na?"Opening visit\u2026":"Visit Venue"})}),Za&&Yn.length>1?(0,r.jsxs)("div",{className:`${i}-venue-visit-picker`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Choose a space"}),Yn.map(T=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Na,onClick:()=>{Va(!1),Zr(l,T.spaceClass,T.ownerId)},children:T.label},T.key))]}):null,p.includes("residence")&&!l.occupancy.playerHome?(0,r.jsx)("p",{className:`${i}-hint`,children:"You can speak from outside. Entering a resident's home requires an invitation."}):null]})]}),p.includes("residence")&&!pt?(0,r.jsx)("p",{className:`${i}-hint`,children:"The shared Residence space appears after you enter with an invitation."}):null,(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[p.filter(T=>T!=="residence"||pt).map(T=>{let J=je(l,T);return(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:T==="residence"?"Shared Residence space":`${T[0].toUpperCase()}${T.slice(1)} space`}),J.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:J.image.url,alt:`${T} space at ${l.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),J.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:J.description}):null,J.state.condition?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Condition now: ",J.state.condition]}):null,J.state.items.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Present items: ",J.state.items.join(", ")]}):null,J.state.publicFacts.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Established facts: ",J.state.publicFacts.join(" \xB7 ")]}):null]},T)}),Gn.map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:[Ht(T.ownerId),"'s private space"]}),T.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:T.image.url,alt:`${Ht(T.ownerId)}'s private space`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),T.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:T.description}):null,T.adaptationPending?(0,r.jsx)("p",{className:`${i}-hint`,children:"This room is still being adapted after a move."}):null]},T.ownerId))]}),(l.editProposals??[]).map(T=>(0,r.jsxs)("p",{className:`${i}-hint`,children:["Proposed ",T.target," room edit:"," ",T.declined?"declined or stale":`approved by ${T.approvedIds.length} of ${T.requiredIds.length} residents`]},T.id)),p.includes("residence")&&!l.occupancy.playerHome?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{D(`/locations/venue/${encodeURIComponent(l.id)}/player-move`,{method:"POST"}).then(o).catch(T=>zt(U(T,"The move could not be requested.")))},children:"Request to live here"}):null,_a?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_a}):null]}):X==="edit"?(0,r.jsxs)("main",{className:`${i}-venue-editor-page`,children:[(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[zo("Exterior image",l.presentation.image),p.filter(T=>T!=="residence"||pt).map(T=>zo(T==="residence"?"Shared Residence image":`${T} space image`,je(l,T).image,T)),Gn.map(T=>zo(`${Ht(T.ownerId)}'s private image`,T.image,"residence",T.ownerId))]}),Pa===l.id?(0,r.jsx)("p",{className:`${i}-hint`,children:"Drawing or saving the image\u2026"}):null,cg?.id===l.id?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:cg.text}):null,fe?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue details"}),(0,r.jsx)(I0,{draft:fe,existing:!0,villagers:n.villagers,editableClasses:p.filter(T=>T!=="residence"||!R||oe),onChange:Ge}),R?(0,r.jsx)("p",{className:`${i}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Da||!fe.name.trim(),onClick:()=>{R$()},children:"Save Venue details"}),R&&oe?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Da||!je(fe,"residence").description.trim(),onClick:()=>{qg("shared")},children:"Propose shared room edit"}):null]}),R&&!oe?(0,r.jsx)("p",{className:`${i}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,ie&&fe?.privateSpaces?.filter(T=>T.ownerId===ie).map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:["Propose changes to ",Ht(T.ownerId),"'s private space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.description,onChange:J=>Ge(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(re=>re.ownerId===T.ownerId?{...re,description:J.target.value}:re)})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.condition,onChange:J=>Ge(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(re=>re.ownerId===T.ownerId?{...re,state:{...re.state,condition:J.target.value}}:re)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.items.join(`
`),onChange:J=>Ge(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(re=>re.ownerId===T.ownerId?{...re,state:{...re.state,items:J.target.value.split(`
`)}}:re)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.publicFacts.join(`
`),onChange:J=>Ge(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(re=>re.ownerId===T.ownerId?{...re,state:{...re.state,publicFacts:J.target.value.split(`
`)}}:re)})})]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Da||!T.description.trim(),onClick:()=>{qg("private",T.ownerId)},children:"Propose private room edit"})]},T.ownerId)),R&&(l.residentIds?.length??0)>0?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Resident moves"}),(0,r.jsxs)("select",{value:H,onChange:T=>Q(T.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),n.settings.venues.filter(T=>T.id!==l.id&&Un(T).includes("residence")&&Ou(T)<H0(T)).map(T=>(0,r.jsx)("option",{value:T.id,children:T.name},T.id))]}),(l.residentIds??[]).map(T=>{let J=n.residences.find(Z=>Z.characterId===T&&Z.status!=="current");return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("strong",{children:Ht(T)}),J?(0,r.jsx)("span",{className:`${i}-hint`,children:J.status==="moving"?"Moving":"Awaiting consent"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!H||Da,onClick:()=>{Vt(!0),D("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:T,venueId:H})}).then(o).catch(Z=>zt(U(Z,"The move could not be requested."))).finally(()=>Vt(!1))},children:"Ask to move"})]},T)})]}):null,Ha?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:Ha}):null,_a?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_a}):null]}):(0,r.jsx)("main",{className:`${i}-venue-proposal-page`,children:(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Propose a Venue change"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),le?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:t1.map(T=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:le.classes.includes(T),disabled:!le.classes.includes(T)&&le.classes.length>=2,onChange:J=>yt(Z=>Z&&{...Z,classes:J.target.checked?[...Z.classes,T]:Z.classes.filter(re=>re!==T)})})," ",T]},T))})]}),le.classes.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Base capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:le.capacity,onChange:T=>yt({...le,capacity:Number(T.target.value)})})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:le.slot,onChange:T=>yt({...le,slot:Number(T.target.value)}),children:[(0,r.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",l.improvements?.[0]?.title??"empty"]}),(0,r.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",l.improvements?.[1]?.title??"empty"]})]})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,r.jsx)("input",{className:`${i}-notice-input`,value:le.title,onChange:T=>yt({...le,title:T.target.value}),placeholder:"A second sleeping alcove"})]}),le.title?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes in the story?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:le.description,onChange:T=>yt({...le,description:T.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:3,value:le.extraBeds,onChange:T=>yt({...le,extraBeds:Number(T.target.value)})})]})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Da||le.classes.length<1||le.title.trim().length>0&&!le.description.trim(),onClick:()=>{Vt(!0),zt(""),D(`/locations/venue/${encodeURIComponent(l.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:le.classes,capacity:le.capacity,...le.title.trim()?{slot:le.slot,improvement:{title:le.title,description:le.description,extraBeds:le.extraBeds}}:{},title:le.title||`Change ${l.name}`,detail:le.description||`Change Venue Classes or capacity at ${l.name}.`})}).then(T=>{o(T),yt(null),z("Proposal submitted.")}).catch(T=>zt(U(T,"The proposal could not be saved."))).finally(()=>Vt(!1))},children:"Submit proposal"})]}):(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:Ha||"Proposal submitted."}),_a?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_a}):null]})})]})}if(ne==="menu")return(0,r.jsxs)("div",{className:`${i}-root ${i}-sectioned-menu`,"data-section":aa,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[aa]}),t?null:(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:aa!=="index"?()=>ot("index"):md,children:aa!=="index"?"Back to menu":"Back to the village"})})]}),qr?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:qr}):null,(0,r.jsx)("nav",{className:`${i}-mobile-menu-nav`,"aria-label":"Village menu",children:aa==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>lt("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>lt("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>lt("story"),children:"DEBUG Settings"})]}):aa==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([l,u])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":G===l,onClick:()=>l==="homes"?Cg():lt(l),children:u},l))}):aa==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([l,u])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":G===l,onClick:()=>lt(l),children:u},l)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||V||zl,onClick:()=>{bg()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${i}-status`,children:Z0}),El?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:El}):null]}):null}),(0,r.jsxs)("nav",{className:`${i}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="villagers","data-active":G==="villagers"?"true":"false",disabled:!n||V,onClick:()=>lt("villagers"),children:`Villagers (${n?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="noticeboard","data-active":G==="noticeboard"?"true":"false",disabled:!n||V,onClick:()=>lt("noticeboard"),children:`Noticeboard (${n?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="venueRequests","data-active":G==="venueRequests"?"true":"false",disabled:!n||V,onClick:()=>lt("venueRequests"),children:`Venue Requests (${(n?.venueRequests?.length??0)+(n?.upgradeRequests?.length??0)+(n?.residences?.filter(l=>l.status==="pending"&&l.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="homes","data-active":G==="homes"?"true":"false",disabled:!n||V,onClick:Cg,children:`Homes (${Hp(n?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="map","data-active":G==="map"?"true":"false",disabled:!n||V,onClick:()=>lt("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="village","data-active":G==="village"?"true":"false",onClick:()=>lt("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${i}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="general","data-active":G==="general"?"true":"false",onClick:()=>lt("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="replyGuidance","data-active":G==="replyGuidance"?"true":"false",disabled:!n||V,onClick:()=>lt("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="story","data-active":G==="story"?"true":"false",disabled:!n||V,onClick:()=>lt("story"),children:`DEBUG: Village Story (${d?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="chatlogs","data-active":G==="chatlogs"?"true":"false",disabled:!n||V,onClick:()=>lt("chatlogs"),children:`DEBUG: Venue Visits (${k?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="agendas","data-active":G==="agendas"?"true":"false",disabled:!n||V,onClick:()=>lt("agendas"),children:`DEBUG: Villager Wishes (${q?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="schedules","data-active":G==="schedules"?"true":"false",disabled:!n||V,onClick:()=>lt("schedules"),children:`Villager Agendas (${q?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||V||zl,onClick:()=>{bg()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${i}-status`,children:Z0}),El?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:El}):null]})]}),G==="general"?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General settings"}),(0,r.jsx)(Op,{}),n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${i}-story-pace`,value:n.settings.storyPace,disabled:V,onChange:l=>{Q1(l.target.value)},children:n.settings.storyPaces.map(l=>(0,r.jsx)("option",{value:l,children:l.charAt(0).toUpperCase()+l.slice(1)},l))}),(0,r.jsx)("span",{className:`${i}-hint`,children:HS(n.settings.storyPace)})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${i}-visit-retention`,value:n.settings.visitRetention.mode,disabled:V,onChange:l=>{let u=l.target.value;Ng({mode:u,value:u==="count"?100:u==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),n.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":n.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:n.settings.visitRetention.mode==="count"?1:30,max:n.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:n.settings.visitRetention.value,onBlur:l=>{let u=Number(l.target.value);u!==n.settings.visitRetention.value&&Ng({mode:n.settings.visitRetention.mode,value:u})}},`${n.settings.visitRetention.mode}:${n.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Setting the village up again is the same three questions you answered when you arrived, over the village as it stands now."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||!n,onClick:()=>Jr(!1,n),children:"Run setup again"}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${i}-row`,children:v1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-danger`,disabled:V,onClick:()=>{w$()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>wl(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||!n,onClick:()=>wl(!0),children:"Reset the village and start over"})})]}),_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]}):G==="village"?(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[n?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(t2,{}),t?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Map background image"}),Nl?(0,r.jsx)("img",{className:`${i}-mobile-map-preview`,src:Nl,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:V,"aria-label":"Choose a town map picture",onChange:l=>{let u=l.target.files?.[0];l.target.value="",Sg(u)}}),qa?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{Tg()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:Vl,children:"Cancel"})]}):n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{kg()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setting`,className:`${i}-textarea ${i}-off`,value:cl,maxLength:n.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:l=>Bp(l.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Read-only here. What this place is like is the wizard's first question, asked beside where the houses stand so the village is described once rather than twice; run it again to change this. What is written still reaches every villager in the meantime."})]}),(0,r.jsx)(Y0,{books:Hu,error:Xp,selected:ul,onChange:Lp,disabled:V}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-lore-budget`,className:`${i}-notice-input`,type:"number",min:n.settings.loreTokenBudgetMin,max:n.settings.loreTokenBudgetMax,step:100,value:_u,disabled:V,onChange:l=>jp(Number(l.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venues"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:x$,disabled:V||n$>=n.settings.maxPlaces,children:"Create Venue"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"search",value:Zp,onChange:l=>l1(l.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,r.jsx)("div",{className:`${i}-notice-add`,children:n.settings.venues.filter(l=>`${l.name} ${l.form??""} ${Un(l).join(" ")}`.toLowerCase().includes(Zp.toLowerCase())).map(l=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:l.name||"Unnamed Residence"}),(0,r.jsx)("span",{className:`${i}-hint`,children:[l.form,Un(l).join(" + ")].filter(Boolean).join(" \xB7 ")}),Un(l).includes("residence")?(0,r.jsxs)("span",{className:`${i}-hint`,children:[(l.residentIds?.length??+!!l.occupancy.residentCharacterId)+Number(l.occupancy.playerHome)," ","/ ",l.residenceCapacity??1," residents"]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ol(l),children:"View Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ge(structuredClone(l)),children:"Edit"}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{S$(l.id)},"aria-label":`Delete ${l.name}`,disabled:V,children:"\xD7"})]})]},l.id))}),fe?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:n.settings.venues.some(l=>l.id===fe.id)?"Edit Venue":"Create Venue"}),(0,r.jsx)(I0,{draft:fe,existing:n.settings.venues.some(l=>l.id===fe.id),villagers:n.villagers,onChange:Ge}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||!fe.name.trim()||!Un(fe).every(l=>je(fe,l).description.trim()),onClick:()=>{N$(fe)},children:"Save Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ge(null),children:"Cancel"})]})]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Z1()},disabled:V,children:"Suggest Venues"})}),dl.filter(l=>!n.settings.venues.some(u=>u.id===l.id)).map(l=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:l.name}),(0,r.jsx)("span",{className:`${i}-hint`,children:l.purpose}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ge(l),children:"Review suggestion"})]},l.id))]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${i}-knowledge`,ref:ud,className:`${i}-preset`,value:Gt,maxLength:n.settings.promptBoxMaxLength,spellCheck:!1,onChange:l=>qn(l.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${i}-macros`,children:n.settings.macros.map(l=>(0,r.jsx)("button",{type:"button",className:`${i}-macro`,title:`${l.label} \u2014 ${l.help}`,onClick:()=>T$(l.token),children:l.token},l.token))}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)(G0,{idPrefix:"settings",personas:Du,draft:wa,onDraft:ll,storedId:n.settings.playerPersonaId,storedName:n.settings.playerPersonaName,storedMissing:n.settings.playerPersonaMissing,disabled:V}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{X1()},disabled:V,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{qn(n.settings.defaultPromptKnowledge)},disabled:V,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${i}-hint`,children:Gt===n.settings.promptKnowledge&&wa===n.settings.playerPersonaId&&cl===n.settings.setting&&JSON.stringify(ul)===JSON.stringify(n.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]}):(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[G==="villagers"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villagers"})}),(0,r.jsxs)("nav",{className:`${i}-villager-submenu`,"aria-label":"Villagers sections",children:[(0,r.jsxs)("button",{type:"button","data-active":N==="residents","aria-pressed":N==="residents",onClick:()=>f("residents"),children:[(0,r.jsx)("span",{children:"Residents"}),(0,r.jsxs)("small",{children:[n?.villagers.length??0," living here"]})]}),(0,r.jsxs)("button",{type:"button","data-active":N==="memories","aria-pressed":N==="memories",onClick:()=>{f("memories"),A(null),Ml()},children:[(0,r.jsx)("span",{children:"Memories"}),(0,r.jsx)("small",{children:"Passing, durable & evidence"})]})]}),N==="residents"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>va(l=>!l),disabled:V,children:Xe?"Close the list":"Add a villager"})}),Xe?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("input",{className:`${i}-search`,type:"search",value:Ei,onChange:l=>sl(l.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),s===null?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):bd.length===0?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${i}-picker-list`,children:bd.map(l=>(0,r.jsxs)("div",{className:`${i}-picker-item`,"data-resident":l.inVillage?"true":"false",children:[(0,r.jsx)(ol,{portrait:Mr[l.id],name:l.name,className:`${i}-avatar`}),(0,r.jsxs)("div",{className:`${i}-picker-text`,children:[(0,r.jsx)("div",{className:`${i}-villager-name`,children:l.name}),(0,r.jsx)("div",{className:`${i}-villager-role`,children:l.comment||l.tags.slice(0,3).join(" \xB7 ")}),l.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:l.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{D1(l.id)},disabled:V||l.inVillage,children:l.inVillage?"Lives here":"Move in"})]},l.id))})]}):null,n&&n.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-villagers`,children:n.villagers.map(l=>(0,r.jsx)(n2,{villager:l,portrait:Mr[l.characterId],selected:!1,onSelect:!l.place||L!==null?void 0:()=>{let u=n.settings.venues.find(p=>p.id===l.place?.id);u&&$g(u)}},l.characterId))}),(0,r.jsx)("div",{className:`${i}-roster`,children:n.villagers.map(l=>(0,r.jsxs)("div",{className:`${i}-roster-entry`,children:[(0,r.jsxs)("div",{className:`${i}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-villager-name`,children:l.name}),l.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,C[l.characterId]?(0,r.jsx)("div",{className:`${i}-tile-summary`,children:C[l.characterId].changed?`New card: ${C[l.characterId].proposed?.name??"unavailable"}`:C[l.characterId].sourceAvailable?`Snapshot revision ${C[l.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>rl(vn===l.characterId?null:l.characterId),"aria-expanded":vn===l.characterId,children:vn===l.characterId?"Close sprite studio":`Sprites \xB7 ${l.sprite?.images.length??0} approved`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{H1(l.characterId)},disabled:V||W.length>0,children:"Compare card"}),C[l.characterId]?.changed&&C[l.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{I1(l.characterId)},disabled:V||W.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{_1(l.characterId)},disabled:V||W.length>0,children:"Move out"})]})]}),vn===l.characterId?(0,r.jsx)(o2,{villager:l,onSaved:o}):null]},l.characterId))})]}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):(0,r.jsx)(SS,{library:$,busy:V,onRefresh:()=>{A(null),Ml()},onForget:(l,u)=>{C1(l,u)}})]}):null,G==="noticeboard"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Noticeboard"})}),n.noticeboard.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.noticeboard.map((l,u)=>(0,r.jsxs)("li",{className:`${i}-notice-row`,children:[(0,r.jsxs)("span",{children:[l.author.length>0?(0,r.jsx)("span",{className:`${i}-notice-author`,children:`${l.author}: `}):null,l.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{k$(u)},disabled:V,"aria-label":`Take down: ${l.text}`,children:"\xD7"})]},`${u}:${l.text}`))}),(0,r.jsxs)("div",{className:`${i}-notice-add`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:gl,maxLength:n.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:l=>Kp(l.target.value),onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),_g())}}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{_g()},disabled:V||gl.trim().length===0||n.noticeboard.length>=n.settings.maxNoticeboardNotes,children:`Pin it up (${n.noticeboard.length}/${n.settings.maxNoticeboardNotes})`})]})]}):null,G==="venueRequests"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villagers can ask for places in conversation or during village life. A place joins the village only when you approve it here. Taking down a notice does not change a request."}),n.venueRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.venueRequests.map(l=>{let u=Ti[l.id]??l.venueDraft,p=x=>ki(E=>({...E,[l.id]:{...u,...x}}));return(0,r.jsx)("li",{className:`${i}-notice-row`,children:(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:l.requesterName||"A villager"}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${l.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:u.name,maxLength:n.settings.maxVenueNameLength,"aria-label":`Requested place name from ${l.requesterName||"villager"}`,onChange:x=>p({name:x.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:u.purpose,maxLength:n.settings.maxVenueNoteLength,"aria-label":`Requested place purpose from ${l.requesterName||"villager"}`,onChange:x=>p({purpose:x.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:u.category,maxLength:n.settings.maxVenueNoteLength,placeholder:"Category (optional)","aria-label":`Requested place category from ${l.requesterName||"villager"}`,onChange:x=>p({category:x.target.value})}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:u.description??"",maxLength:1e3,"aria-label":`Requested place description from ${l.requesterName||"villager"}`,onChange:x=>p({description:x.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||!u.name.trim(),onClick:()=>{j(!0),K(""),D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:u.name,purpose:u.purpose}]})}).then(x=>p({description:x.descriptions[l.id]??""})).catch(x=>K(U(x,"The description draft could not be generated."))).finally(()=>j(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||!u.name.trim()||!u.purpose.trim()||!u.description?.trim(),onClick:()=>{Dg(l,!0)},children:u.name!==l.venueDraft.name||u.purpose!==l.venueDraft.purpose||u.category!==l.venueDraft.category?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{Dg(l,!1)},children:"Deny"})]})]})},l.id)})}),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Home upgrade requests"}),n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No home upgrades requested."}):n.upgradeRequests.map(l=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:l.detail}),[!0,!1].map(u=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{j(!0),K(""),D(`/venue-upgrades/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST"}).then(o).catch(p=>K(U(p,"The upgrade request could not be decided."))).finally(()=>j(!1))},children:u?"Approve upgrade":"Deny"},String(u)))]},l.id)),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Resident move requests"}),n.residences.filter(l=>l.status!=="current").length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No moves pending."}):n.residences.filter(l=>l.status!=="current").map(l=>{let u=Ht(l.characterId),p=n.settings.venues.find(x=>x.id===l.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:`${u} \u2192 ${p}`}),l.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${i}-hint`,children:["Move due ",new Date(l.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{j(!0),K(""),D("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(o).catch(x=>K(U(x,"The move could not be completed."))).finally(()=>j(!1))},children:"DEBUG: Complete move now"})]}):l.requestedBy==="player"?(0,r.jsxs)("span",{className:`${i}-hint`,children:["Awaiting ",u,"'s answer in conversation."]}):[!0,!1].map(x=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{j(!0),K(""),D(`/residences/${x?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(o).catch(E=>K(U(E,"The move request could not be decided."))).finally(()=>j(!1))},children:x?"Approve move":"Deny"},String(x)))]},l.characterId)}),_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]}):null,G==="homes"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Homes on the map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||$a.length>=Dl,onClick:()=>{Yt(!0),md()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${$a.length} of at most ${Dl}`})]}),$a.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(e2,{homes:$a,villagers:(n?.villagers??[]).map(l=>({id:l.characterId,name:l.name})),disabled:V,selectedId:c1,onPatch:Ag,onRemove:s$,onSelect:Iu,showDescriptions:!0,onGenerateDescription:l=>{c$(l)},lockedIds:new Set(n.settings.venues.filter(l=>l.occupancy.residentCharacterId).map(l=>l.id))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{l$()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>Kr(n.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${i}-hint`,children:IS(n.settings.venues,$a)?"No unsaved changes.":"Unsaved changes."})]})]}):null,G==="map"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(Rp,{src:Nl,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:n.settings.venues.flatMap(l=>{let u=nl(l);if(!u)return[];let p=l.occupancy.residentCharacterId?Ht(l.occupancy.residentCharacterId):l.occupancy.playerHome?po(n):"";return[{id:l.id,x:u.x,y:u.y,text:p?`${l.name||"Home"} \xB7 ${p}`:l.name,tone:Ar(l)?L0({isPlayerHome:l.occupancy.playerHome,occupant:l.occupancy.residentCharacterId}):"venue",onSelect:()=>Uu(l.id)}]}),placing:pl!==null,view:Ur,shape:ug,zoom:w1,onView:Sl?Ir:void 0,onPlace:pl?(l,u)=>{let p=pl;j(!0),K(""),D(`/locations/venue/${encodeURIComponent(p)}`,{method:"PUT",body:JSON.stringify({presentation:{x:l,y:u}})}).then(o).catch(x=>K(U(x,"The venue could not be placed."))).finally(()=>{j(!1),qu(null)})}:void 0}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Venue positions and residents"}),n.settings.venues.map(l=>{let u=l.occupancy.residentCharacterId?Ht(l.occupancy.residentCharacterId):l.occupancy.playerHome?po(n):"",p=!!l.occupancy.residentCharacterId;return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":u1===l.id,onClick:()=>Uu(l.id),children:l.name||"Home"}),(0,r.jsx)("span",{className:`${i}-hint`,children:u?`Lives here: ${u}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${i}-hint`,children:nl(l)?"On map":"Not placed"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||p,onClick:()=>{Uu(l.id),qu(l.id)},children:nl(l)?"Move pin":"Place pin"})]},l.id)}),pl?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>qu(null),children:"Cancel pin placement"}):null,_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]}),Sl?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:j0.map(l=>(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Ur.fit===l.fit?"true":"false","aria-pressed":Ur.fit===l.fit,onClick:()=>Ir({...Ur,fit:l.fit}),children:l.label},l.fit))}),(0,r.jsx)("p",{className:`${i}-hint`,children:j0.find(l=>l.fit===Ur.fit)?.help})]}):null,nd?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":nd.tone,children:nd.text}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:V,"aria-label":"Choose a town map picture",onChange:l=>{let u=l.target.files?.[0];l.target.value="",Sg(u)}}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{kg()},children:"Remove background image"}):null]}),Sl?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{Tg()},children:qa?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:Vl,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>ad(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:n.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),In(n.settings.venues).length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${i}-places`,children:In(n.settings.venues).map(l=>(0,r.jsxs)("li",{className:`${i}-place`,children:[l.presentation.image?(0,r.jsx)("img",{className:`${i}-place-thumb`,src:l.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${i}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${i}-place-body`,children:[(0,r.jsx)("span",{className:`${i}-place-name`,children:l.name}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{Ol(l)},children:"View Venue"})})]})]},l.id))})]})]}):null,G==="replyGuidance"?(0,r.jsx)(a2,{}):null,G==="story"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),d===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the village remembers\u2026"}):d.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):xS(d).map(l=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${i}-story-day`,children:l.label}),(0,r.jsx)("ul",{className:`${i}-story`,children:l.entries.map(u=>{let p=Dp(u),x=u.actors.map(E=>E.name).join(", ");return(0,r.jsxs)("li",{className:`${i}-story-row`,children:[(0,r.jsxs)("span",{children:[p.length>0||u.scope==="private"||u.kind==="favour"?(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[p,u.scope==="private"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:` \xB7 private to ${x}`}):null,u.kind==="favour"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 a favour"}):null,u.kind==="tick"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,u.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:V,onClick:()=>{z1(u.id)},"aria-label":`Forget: ${u.text}`,children:"\xD7"})]},u.id)})})]},`${l.label}:${l.entries[0]?.id??""}`)),d&&d.length<g?(0,r.jsxs)("button",{type:"button",className:`${i}-button`,onClick:()=>{A1()},children:["Load more memories (",d.length," of ",g,")"]}):null]}):null,G==="chatlogs"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:Ne,onChange:l=>{it(l.target.value),S(0),B(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(n?.settings.venues??[]).map(l=>(0,r.jsx)("option",{value:l.id,children:l.name},l.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:Qa,onChange:l=>{Si(l.target.value),S(0),B(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(n?.villagers??[]).map(l=>(0,r.jsx)("option",{value:l.characterId,children:l.name},l.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||y===0,onClick:()=>{yg()},children:"Delete all completed logs"}),Ot?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ot}):null,k===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading venue visits\u2026"}):k.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No completed visits match these filters."}):k.map(l=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[l.placeName," \xB7 ",Ru(l.startedAt)]}),(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[l.participants.map(u=>u.name).join(", ")," \xB7 ",l.lineCount," lines",l.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",l.memoryPending?l.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${l.memoryReview.attempts} ${l.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${l.memoryProgress?.nextUnit??0}/${l.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{hd(l.id)},children:I?.id===l.id?"Refresh transcript":"Open transcript"}),l.memoryPending?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{V1(l.id)},children:l.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{yg(l.id)},children:"Delete log"})]}),I?.id===l.id?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("ul",{className:`${i}-story`,children:I.lines.map((u,p)=>(0,r.jsx)("li",{className:`${i}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[u.name||po(n)," \xB7 ",Ru(u.at)]}),zr(u.content,`venue-${l.id}-${p}-`),(0,r.jsxs)("span",{className:`${i}-story-meta`,children:["Heard by:"," ",u.heardBy?.map(x=>I.participants.find(E=>E.characterId===x)?.name??x).join(", ")||"no one"]})]})},`${l.id}:${p}`))}),(I.submissions??[]).some(u=>u.recollections?.length)?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:"Captured recollections and evidence"}),(0,r.jsx)("ul",{className:`${i}-story`,children:(I.submissions??[]).flatMap(u=>(u.recollections??[]).map(p=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:p.text}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Subjects: ${p.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${p.knownByCharacterIds.join(", ")}`}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Evidence: ${p.lineIds.join(", ")}`})]},p.id)))})]}):null,I.memoryReview&&I.memoryReview.status!=="none"?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,open:I.memoryPending,children:[(0,r.jsx)("summary",{children:`Durable review \xB7 ${I.memoryReview?.status??"none"}`}),(0,r.jsxs)("div",{className:`${i}-agenda-notes-body`,children:[(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[`${I.memoryReview?.attempts??0} review attempts`,I.memoryReview?.error?` \xB7 Last error: ${I.memoryReview.error}`:""]}),(0,r.jsx)("ul",{className:`${i}-story`,children:(I.memoryReview?.decisions??[]).map(u=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:`${u.action==="promote"?"Promoted":"Rejected"}${u.category?` \xB7 ${J0[u.category]}`:""}`}),u.text?(0,r.jsx)("p",{children:u.text}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:u.reason}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Sources: ${u.recollectionIds.join(", ")}`})]},u.id))})]})]}):null]}):null]},l.id)),y>20?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:b===0,onClick:()=>{S(Math.max(0,b-20)),B(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[b+1,"\u2013",Math.min(y,b+20)," of ",y]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:b+20>=y,onClick:()=>{S(b+20),B(null)},children:"Next"})]}):null]}):null,G==="agendas"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),q===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the villagers wish\u2026"}):q.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:q.map(l=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[l.name,l.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null]}),l.agenda===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):l.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:l.agenda.personalizationFailure?`Wish generation failed: ${l.agenda.personalizationFailure}`:l.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${i}-story`,children:l.agenda.wishes.map(u=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:u.wish}),u.tell.length>0?(0,r.jsx)("p",{className:`${i}-wish-tell`,children:`Shows as: ${u.tell}`}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`${u.intensity===1?"Faint":u.intensity===3?"Strong":"Present"} \xB7 ${ES(u.addedAt??"",u.expiresAt??"")}`})]},u.id))}),l.completedWishes.length>0?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:`Completed wishes (${l.completedWishes.length})`}),(0,r.jsx)("ul",{className:`${i}-story`,children:l.completedWishes.map(u=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:u.wish.wish}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Fulfilled ${new Date(u.fulfilledAt).toLocaleDateString()}`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{R1(l.characterId,u.wish.id)},children:"Mark as not fulfilled"})]},u.wish.id))})]}):null]},l.characterId))})]}):null,G==="schedules"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),q===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Loading agendas\u2026"}):q.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${i}-agenda-list`,children:q.map(l=>(0,r.jsxs)("details",{className:`${i}-week`,children:[(0,r.jsx)("summary",{className:`${i}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${i}-week-head`,children:[l.name,l.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${i}-badge`,children:l.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,l.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${i}-badge`,children:"Personalization failed"}):null,l.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"Card missing"}):null,l.nativeSchedule?(0,r.jsx)("span",{className:`${i}-badge`,children:l.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,Cp(l)?(0,r.jsx)("span",{className:`${i}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${i}-week-body`,children:[l.agenda?.routineSummary?(0,r.jsx)("p",{className:`${i}-story-meta`,children:l.agenda.routineSummary}):null,l.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${i}-empty`,children:l.agenda.personalizationFailure}):l.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${i}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${i}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:l.ingestSchedule,disabled:V,onChange:u=>{O1(l.characterId,u.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{M1(l.characterId)},children:"Regenerate agenda"})]}),l.nativeSchedule?(0,r.jsxs)("p",{className:`${i}-story-scope`,children:[l.ingestSchedule&&l.remapFailure?`Schedule translation failed: ${l.remapFailure.message}`:l.ingestSchedule&&l.agenda?.scheduleWeek?"Schedule guides today and future days.":l.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",Cp(l)?" Earlier hours retain the previous plan.":""]}):Cp(l)?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Earlier hours retain the previous plan."}):null,l.weekUnreadable?(0,r.jsx)("p",{className:`${i}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):l.nativeSchedule?null:(0,r.jsx)("p",{className:`${i}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${i}-agenda-days`,children:l.days.map(u=>{let p=u.isToday?l.agenda?.activeDay?.blocks??l.agenda?.week?.[u.weekday]??[]:(l.ingestSchedule?l.agenda?.scheduleWeek?.[u.weekday]:void 0)??l.agenda?.week?.[u.weekday]??[],x=l.nativeSchedule?.days[u.weekday]??[];return(0,r.jsxs)("details",{className:`${i}-agenda-day`,open:u.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[u.weekday," \xB7 ",u.dateLabel,u.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${i}-agenda-compare`,"data-comparison":l.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${u.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:p.map((E,R)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[O0(E.startMinute),"\u2013",O0(E.endMinute)]}),(0,r.jsx)("strong",{children:E.activity}),(0,r.jsx)("span",{children:E.venueId?TS(n?.settings.venues??[],E.venueId):"Home"}),(0,r.jsx)("span",{children:E.reason}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:E.status==="idle"?"Available":E.status==="dnd"?"Busy":E.status==="offline"?"Offline":"Online"})]},`${E.startMinute}-${E.endMinute}-${R}`))})]}),l.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${u.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),x.length?(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:x.map((E,R)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:E.time}),(0,r.jsx)("strong",{children:E.activity}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:E.status||"No availability set"})]},`${E.time}-${R}`))}):(0,r.jsx)("p",{className:`${i}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${u.weekday}-${u.dateLabel}`)})})]})]},l.characterId))})]}):null,_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]})]});if(ne==="preparing"){let l=n?.foundingPreparation,u=n?.villagers.length??0,p=l?.completedIds.length??0,x=n?.villagers.find(E=>E.characterId===l?.currentId)?.name;return(0,r.jsx)("div",{className:`${i}-root ${i}-preparing`,role:"status","aria-live":"polite",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("div",{className:`${i}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,r.jsxs)("h1",{children:[n?.village.name??"Your village"," is settling in"]}),(0,r.jsx)("p",{children:l?.status==="failed"?"The villagers need a hand before the gates open.":x?`Making room for ${x}\u2026`:"Lighting windows and making plans\u2026"}),(0,r.jsx)("p",{children:`${p} of ${u} villagers ready`}),l?.status==="failed"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:l.error}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{$$()},children:"Retry"}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Change connections"}),(0,r.jsx)(Op,{})]})]}):null,og?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:og}):null]})})}if(ne==="setup"){let l=(s??[]).map(u=>({id:u.id,name:u.name}));return(0,r.jsx)("div",{className:`${i}-root ${i}-home ${i}-setup-root`,children:(0,r.jsxs)("div",{className:`${i}-home-body ${i}-setup-body`,"data-step":be,children:[(0,r.jsx)("aside",{className:`${i}-setup-rail`,"aria-label":"Founding progress",children:tl.map((u,p)=>(0,r.jsxs)("div",{className:`${i}-setup-rail-step`,"data-active":p===be?"true":"false","data-done":p<be?"true":"false","aria-current":p===be?"step":void 0,children:[(0,r.jsx)("span",{className:`${i}-setup-rail-number`,children:p+1}),(0,r.jsx)("span",{children:u})]},u))}),(0,r.jsx)("div",{className:`${i}-side`,children:(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:n?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsxs)("p",{className:`${i}-setup-kicker`,children:["Step ",be+1," of ",tl.length," \xB7 ",tl[be]]}),be===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${i}-setup-name`,className:`${i}-search`,type:"text",value:Ka,maxLength:n?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:V,onChange:u=>Jp(u.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Choose a scenario"}),(0,r.jsx)("div",{className:`${i}-scenario-options`,children:Vp.map(u=>(0,r.jsxs)("label",{className:`${i}-scenario-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${i}-founding-scenario`,checked:ye===u.value,disabled:V||n?.isFounded,onChange:()=>u$(u.value)}),(0,r.jsx)("span",{className:`${i}-scenario-icon`,"aria-hidden":"true",children:u.icon}),(0,r.jsx)("strong",{children:u.label}),(0,r.jsx)("small",{children:u.description})]},u.value))})]}),ye==="none"?(0,r.jsx)("p",{className:`${i}-hint`,children:"Your village will have a world and setting, with no prescribed founding story."}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field ${i}-setup-premise`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-founding-details`,children:"Scenario starting idea (required)"}),(0,r.jsx)("textarea",{id:`${i}-founding-details`,className:`${i}-textarea`,value:Ia,maxLength:n?.settings.foundingDetailsMaxLength??2e3,placeholder:"Describe a founding event, a world condition, a starting situation, or anything else.",disabled:V||n?.isFounded,onChange:u=>{let p=u.target.value;Lu(p)}}),(0,r.jsx)("span",{className:`${i}-hint`,children:ye==="custom"?"Write your own starting point. Switching scenarios clears this premise.":"Edit this starting point freely. Switching scenarios restores the original premise."})]}),(0,r.jsxs)("div",{className:`${i}-field ${i}-setup-guidance`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-founding-guidance`,children:"Founding direction (optional)"}),(0,r.jsx)("textarea",{id:`${i}-founding-guidance`,className:`${i}-textarea`,value:wn,maxLength:n?.settings.foundingGuidanceMaxLength??500,placeholder:"What should the village's beginning feel like?",disabled:V||n?.isFounded,onChange:u=>{let p=u.target.value;ju(p),Gu(x=>({...x,[ye]:p}))}})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"This guidance shapes the opening village. Later stories follow what actually happens there."}),n?.isFounded?(0,r.jsx)("p",{className:`${i}-hint`,children:"The founding Scenario is locked. Start a new village to choose another."}):null]}),n?.isFounded&&n.settings.foundingReason!=="none"?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:"Founding record"}),n.settings.scenarioImprint?(0,r.jsxs)(r.Fragment,{children:[n.settings.scenarioImprint.origin?(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Origin:"})," ",n.settings.scenarioImprint.origin]}):null,n.settings.scenarioImprint.worldFacts.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"World facts at founding:"})," ",n.settings.scenarioImprint.worldFacts.join("; ")]}):null,n.settings.scenarioImprint.openingConditions.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Opening conditions:"})," ",n.settings.scenarioImprint.openingConditions.join("; ")]}):null,n.settings.scenarioImprint.visualCues.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Opening visual cues:"})," ",n.settings.scenarioImprint.visualCues.join("; ")]}):null]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"This village predates founding imprints. Its original Scenario text is preserved above as history."})]}):null]}):null,be===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(G0,{idPrefix:"setup",personas:Du,draft:wa,onDraft:ll,storedId:n?.settings.playerPersonaId??"",storedName:n?.settings.playerPersonaName??"",storedMissing:n?.settings.playerPersonaMissing??!1,disabled:V}),(0,r.jsx)(Op,{onSetupProblem:f1,onImageWarningChange:sg}),b1?(0,r.jsxs)("div",{className:`${i}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${i}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${i}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:g$,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:p$,children:"I understand, continue"})]})]}):null]}):null,be===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setup-setting`,className:`${i}-textarea`,value:rt,maxLength:n?.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:V||Dt,onChange:u=>{Fp(u.target.value),fl([])}}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required. Define the world, its atmosphere, and the village's visual character."})]}),n?.isFounded?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-world-facts`,children:"Current world facts"}),(0,r.jsx)("textarea",{id:`${i}-world-facts`,className:`${i}-textarea`,value:Ja.join(`
`),disabled:V,placeholder:"One stable fact per line, up to four.",onChange:u=>Wp(u.target.value.split(/\r?\n/u))}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked origin."})]}):null,(0,r.jsx)(Y0,{books:Hu,error:Xp,selected:na,onChange:u=>{Gp(u),fl([])},disabled:V}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-setup-lore-budget`,className:`${i}-notice-input`,type:"number",min:n?.settings.loreTokenBudgetMin??200,max:n?.settings.loreTokenBudgetMax??3200,step:100,value:Ci,disabled:V,onChange:u=>Yp(Number(u.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,be===3?(0,r.jsx)(r.Fragment,{children:n?.isFounded?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-hint`,children:"The founding Scenario is part of this village's history and is locked. Current world facts can be edited in World & Setting."}),n.settings.scenarioImprint?.origin?(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Origin:"})," ",n.settings.scenarioImprint.origin]}):(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.foundingDetails||"No founding story was chosen."})]}):ye==="none"?(0,r.jsx)("p",{className:`${i}-hint`,children:"No Scenario was chosen. The world and villagers can develop without a founding imprint."}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-hint`,children:"Review what this Scenario establishes. Origin is history; opening conditions and visual cues guide founding only. Stable world facts remain editable as the village changes."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{d$()},children:d1?"Drafting\u2026":"Draft imprint"}),(0,r.jsx)("span",{className:`${i}-hint`,children:"You can write or revise every field yourself."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-imprint-origin`,children:"Founding history (optional)"}),(0,r.jsx)("textarea",{id:`${i}-imprint-origin`,className:`${i}-textarea`,value:st.origin,maxLength:400,disabled:V,placeholder:"Leave blank if your idea has no founding event.",onChange:u=>{Mi(p=>({...p,origin:u.target.value})),Ri("")}})]}),[["worldFacts","Stable world facts","Only truths that should still hold today.",160],["openingConditions","Opening conditions","Starting pressures or opportunities, not permanent facts.",160],["visualCues","Founding visual cues","Details for the initial map and venue art.",120]].map(([u,p,x,E])=>(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-imprint-${u}`,children:p}),(0,r.jsx)("textarea",{id:`${i}-imprint-${u}`,className:`${i}-textarea`,value:st[u].join(`
`),disabled:V,placeholder:"One detail per line, up to four.",onChange:R=>h$(u,R.target.value)}),(0,r.jsxs)("span",{className:`${i}-hint`,children:[x," Up to four lines, ",E," characters each."]})]},u)),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:m$,children:"Approve imprint"}),Rr===Xt?(0,r.jsx)("span",{className:`${i}-hint`,children:"Approved for this founding."}):(0,r.jsx)("span",{className:`${i}-hint`,children:"Approval is needed before the map step."})]})]})}):null,be===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="generate"?"true":"false","aria-pressed":ze==="generate",disabled:Dt,onClick:()=>_i("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="upload"?"true":"false","aria-pressed":ze==="upload",disabled:Dt,onClick:()=>_i("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="none"?"true":"false","aria-pressed":ze==="none",disabled:Dt,onClick:()=>_i("none"),children:"No background image"}),n?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="existing"?"true":"false","aria-pressed":ze==="existing",disabled:Dt,onClick:()=>_i("existing"),children:"Keep current map"}):null]}),ze==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map elements"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([u,p])=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:bl[u],disabled:Dt,onChange:x=>ng(E=>({...E,[u]:x.target.checked}))}),p]},u))}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Unchecked elements are excluded, even if Setting and Theme mentions them. Structures may appear anywhere but must leave room for future locations."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-prompt`,className:`${i}-textarea`,value:Ln,maxLength:1500,disabled:Dt,onChange:u=>Ju(u.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-negative`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-negative`,className:`${i}-textarea`,value:vo,maxLength:1500,disabled:Dt,onChange:u=>Fu(u.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Dt||rt.trim().length===0||Ln.trim().length===0,onClick:()=>{K1()},children:Dt?"Generating map\u2026":vl==="generate"?"Generate again":"Generate map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Dt||Ln===n?.settings.townMapLayoutPrompt&&vo===n?.settings.townMapNegativePrompt,onClick:()=>{Ju(n?.settings.townMapLayoutPrompt??""),Fu(n?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})]})]}):null,ze==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:Dt,"aria-label":"Choose a village map image",onChange:u=>{let p=u.target.files?.[0];u.target.value="",F1(p)}}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,ze==="none"?(0,r.jsx)("p",{className:`${i}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,Vr&&ze!=="none"&&vl===ze&&dg?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":Ap(Vr).tone,children:Ap(Vr).text}):null]}):null,be===5?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Place your Residence, one to three villager Residences, and one Gathering Place. Select a photograph to finish it."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||Ua||Ce.filter(u=>u.classes?.includes("residence")).length>=1+Eo,onClick:()=>{Yt(!0),Ai(!1),Vi(null)},children:"Place a Residence"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||Ua||Ce.some(u=>u.category==="public-center"),onClick:()=>{Yt(!1),Ai(!0),Vi(null)},children:"Place a Gathering Place"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||Ua||Ce.length===0,onClick:()=>{Oi([]),Bn(null),Fa({}),Di(null),Vi(null),Yt(!1),Ai(!1)},children:"Reset all venues"})]}),ag?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:ag}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||Ua||!Ce.length,onClick:()=>{Rg(Ce)},children:"Draft all venue text"}),Object.keys(ia).length>1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Object.keys(ia).forEach(u=>fd(u,!1)),children:"Use all drafts in empty fields"}):null]}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:Ce.map(u=>(0,r.jsxs)("button",{type:"button",className:`${i}-setup-venue-card`,"data-selected":u.id===tg?"true":"false",onClick:()=>Bn(u.id),children:[u.presentation.image?(0,r.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:u.name||"Unnamed venue"}),(0,r.jsxs)("small",{children:[u.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",u.occupancy.playerHome?"You":Ht(u.occupancy.residentCharacterId)||"Choose a villager"]})]})]},u.id))}),P&&Co?(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,children:[P.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",P.name]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Vi(P.id),Yt(!1),Ai(!1)},children:"Move on map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>o$(P.id),children:"Remove venue"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:P.name,maxLength:100,onChange:u=>Qt(P.id,p=>({...p,name:u.target.value}))})]}),P.category==="public-center"?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||Ua,onClick:()=>{J1()},children:"Suggest three names"}),m1.map(u=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Qt(P.id,p=>({...p,name:u})),children:u},u))]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:P.form??"",maxLength:240,onChange:u=>Qt(P.id,p=>({...p,form:u.target.value}))})]}),P.category!=="public-center"?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident",(0,r.jsxs)("select",{className:`${i}-select`,value:P.occupancy.residentCharacterId??"",disabled:P.occupancy.playerHome,onChange:u=>Qt(P.id,p=>({...p,residentIds:u.target.value?[u.target.value]:[],occupancy:{...p.occupancy,residentCharacterId:u.target.value||null}})),children:[(0,r.jsx)("option",{value:"",children:P.occupancy.playerHome?"You":"Choose a villager"}),l.map(u=>(0,r.jsx)("option",{value:u.id,disabled:Ce.some(p=>p.id!==P.id&&p.occupancy.residentCharacterId===u.id),children:u.name},u.id))]})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Purpose",(0,r.jsx)("input",{className:`${i}-notice-input`,value:P.purpose,maxLength:240,onChange:u=>Qt(P.id,p=>({...p,purpose:u.target.value}))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Guidance for AI text and art",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:P.guidance,maxLength:1e3,placeholder:"Mood, materials, details to include or avoid\u2026",onChange:u=>Qt(P.id,p=>({...p,guidance:u.target.value}))})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ua,onClick:()=>{Rg([P])},children:"Generate text draft"}),ia[P.id]?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("strong",{children:"Suggested venue text"}),(0,r.jsxs)("p",{children:[ia[P.id]?.name," \xB7"," ",ia[P.id]?.form]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Purpose:"})," ",ia[P.id]?.purpose]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Exterior:"})," ",ia[P.id]?.description]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Scene:"})," ",ia[P.id]?.spaceDescription]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Initial condition:"})," ",ia[P.id]?.condition]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Items:"})," ",ia[P.id]?.items.join(", ")||"None"]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Public facts:"})," ",ia[P.id]?.publicFacts.join(", ")||"None"]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Features:"})," ",ia[P.id]?.features.join(", ")||"None"]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>fd(P.id,!1),children:"Use in empty fields"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>fd(P.id,!0),children:"Replace text with this draft"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Fa(u=>{let p={...u};return delete p[P.id],p}),children:"Discard draft"})]})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Exterior description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:P.description,maxLength:1e3,onChange:u=>Qt(P.id,p=>({...p,description:u.target.value}))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:Co.description,maxLength:1e3,onChange:u=>Qt(P.id,p=>({...p,spaces:[{...je(p,p.category==="public-center"?"gathering":"residence"),description:u.target.value}]}))})]}),["exterior","interior"].map(u=>{let p=u==="exterior"?P.presentation.image:Co.image;return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("span",{className:`${i}-label`,children:[u==="exterior"?"Exterior photograph":"Interior photograph"," \xB7 optional"]}),p?(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:p.url,alt:`${u} of ${P.name}`}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No image yet. A placeholder will be used."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ua,onClick:()=>{f$(P,u)},children:p?"Regenerate image":"Generate image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*",disabled:Ua,"aria-label":`Upload ${u} image for ${P.name}`,onChange:x=>{let E=x.target.files?.[0];x.target.value="",b$(P,u,E)}}),p?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Qt(P.id,x=>u==="exterior"?{...x,presentation:{...x.presentation,image:null}}:{...x,spaces:[{...je(x,x.category==="public-center"?"gathering":"residence"),image:null}]}),children:"Remove image"}):null]}),Or?.venueId===P.id&&Or.area===u?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:Or.image.url,alt:"New image preview"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:v$,children:"Use this photograph"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Di(null),children:"Discard"})]}):null]},u)}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Advanced venue details"}),(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Initial condition",(0,r.jsx)("input",{className:`${i}-notice-input`,value:Co.state.condition,onChange:u=>Qt(P.id,p=>{let x=je(p,p.category==="public-center"?"gathering":"residence");return{...p,spaces:[{...x,state:{...x.state,condition:u.target.value}}]}})})]}),["items","publicFacts"].map(u=>(0,r.jsxs)("label",{className:`${i}-label`,children:[u==="items"?"Notable items \xB7 one per line":"Public facts \xB7 one per line",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:Co.state[u].join(`
`),onChange:p=>Qt(P.id,x=>{let E=je(x,x.category==="public-center"?"gathering":"residence");return{...x,spaces:[{...E,state:{...E.state,[u]:p.target.value.split(`
`).map(R=>R.trim()).filter(Boolean)}}]}})})]},u)),(0,r.jsxs)("label",{className:`${i}-label`,children:["Features \xB7 one per line",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:Co.state.features.map(u=>u.text).join(`
`),onChange:u=>Qt(P.id,p=>{let x=je(p,p.category==="public-center"?"gathering":"residence");return{...p,spaces:[{...x,state:{...x.state,features:u.target.value.split(`
`).map(E=>E.trim()).filter(Boolean).slice(0,5).map((E,R)=>({id:x.state.features[R]?.id??ho(),text:E,sourceCharacterId:"",locked:!1,updatedAt:""}))}}]}})})]})]})]})]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"Place or select a venue to edit it."}),s===null?(0,r.jsx)("p",{className:`${i}-hint`,children:"Reading your villager library\u2026"}):null]}):null,be===6?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Review your village before opening its gates. Return to Step 6 to change a venue."}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[Ka.trim()," \xB7 ",rt.trim()," \xB7"," ",Ce.filter(u=>u.classes?.includes("residence")).length," Residences \xB7"," ",Ce.filter(u=>u.category==="public-center").length," Gathering Place"]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Persona:"})," ",Du?.find(u=>u.id===wa)?.name??"Selected Persona"," \xB7 ",(0,r.jsx)("strong",{children:"Scenario:"})," ",Cr(ye).label]}),ye!=="none"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Scenario premise:"})," ",Ia]}),wn?(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Narrative direction:"})," ",wn]}):null]}):null,(n?.isFounded?n.settings.scenarioImprint:ye!=="none"&&st)?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:"Reviewed founding imprint"}),[["Origin",(n?.isFounded?n.settings.scenarioImprint:st)?.origin],["Stable world facts",(n?.isFounded?n.settings.scenarioImprint:st)?.worldFacts.join("; ")],["Opening conditions",(n?.isFounded?n.settings.scenarioImprint:st)?.openingConditions.join("; ")],["Visual cues",(n?.isFounded?n.settings.scenarioImprint:st)?.visualCues.join("; ")]].filter(([,u])=>u).map(([u,p])=>(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsxs)("strong",{children:[u,":"]})," ",p]},u))]}):null,(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Map:"})," ",ze==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,r.jsx)("strong",{children:"Lorebooks:"})," ",na.map(u=>Hu?.find(p=>p.id===u)?.name??u).join(", ")||"None"]}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:Ce.map(u=>(0,r.jsxs)("div",{className:`${i}-setup-venue-card`,children:[u.presentation.image?(0,r.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsxs)("strong",{children:[u.name," \xB7 ",u.category==="public-center"?"Gathering Place":"Residence"]}),(0,r.jsxs)("small",{children:[u.form," \xB7"," ",u.occupancy.playerHome?"You":Ht(u.occupancy.residentCharacterId)||"Community"]})]})]},u.id))}),Ce.map(u=>(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsxs)("strong",{children:[u.name,":"]})," ",u.description," ",u.spaces?.[0]?.description]},`${u.id}-summary`))]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[be>0?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||Dt,onClick:()=>gd(be-1),children:"Back"}):null,be>0&&be<tl.length-1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||Dt,onClick:()=>gd(be+1),children:"Next"}):be===tl.length-1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V||Dt||!n,onClick:()=>{y$()},children:n?.isFounded?"Save this village":"Found the village"}):null,n?.isFounded?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-spacer`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:V,onClick:()=>{Yt(!1),ge("home")},children:"Show me the village"})]}):null]}),lg?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:lg}):null,_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]})}),be===0?(0,r.jsxs)("div",{className:`${i}-scenario-art-panel`,children:[(0,r.jsx)("img",{src:$S(ye),alt:`${Cr(ye).label} village scene`}),(0,r.jsxs)("div",{className:`${i}-scenario-art-content`,children:[(0,r.jsx)("p",{children:"A new beginning awaits."}),(0,r.jsx)("strong",{children:Cr(ye).description}),(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-scenario-next`,disabled:V,onClick:()=>gd(1),children:"Next \u2192"})]})]}):(0,r.jsx)("div",{className:`${i}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${i}-setup-map-viewport`,children:(0,r.jsx)(Rp,{src:Hi,alt:`A map of ${Ka.trim()||"your new village"}.`,pins:be<5?[]:C$,placing:be===5&&(zi||ml||Yu!==null),view:ze==="existing"?wo:Au("cover"),shape:dg,onPlace:be===5?i$:void 0,compact:be<4,mobile:t&&be>=4,photoPins:be>=5})})})]})})}return(0,r.jsxs)("div",{className:`${i}-root ${i}-home ${i}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-home-bar`,children:[(0,r.jsx)(YS,{weather:n?.village.weather??""}),!t&&n?.isFounded&&In(n.settings.venues).length>0?(0,r.jsxs)("div",{className:`${i}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":Je,"aria-controls":`${i}-places-list`,disabled:V,onClick:()=>{qe(null),Qe(l=>!l)},children:"Places"}),Je?(0,r.jsx)("div",{id:`${i}-places-list`,className:`${i}-places-list`,children:n.settings.venues.map(l=>(0,r.jsxs)("div",{className:`${i}-places-list-row`,children:[(0,r.jsx)("span",{className:`${i}-places-list-name`,children:l.name}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ol(l),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Zr(l)},children:"Visit"})]},l.id))}):null]}):null,(0,r.jsxs)("span",{className:`${i}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-mobile-board-button`,"aria-label":`Noticeboard (${n?.noticeboard.length??0})`,disabled:!n||V,onClick:()=>lt("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),n?.isFounded?(0,r.jsx)(ZS,{happenings:n.happenings,recap:n.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:V||!n,onClick:()=>{ot("index"),ge("menu")},children:"\u2630"}),t?null:(0,r.jsx)(QS,{}),zi?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Yt(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${i}-room`,children:(0,r.jsx)("div",{className:`${i}-home-map-viewport`,children:(0,r.jsx)(Rp,{src:Nl,alt:`A map of ${n?.village.name??"the village"}.`,pins:E$,placing:zi,view:wo,shape:ug,onPlace:r$,onDismiss:()=>{qe(null),Qe(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:qr||_t||zi||zl||rd?(0,r.jsxs)("div",{className:`${i}-notice`,children:[qr?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:qr}):null,_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null,zi?(0,r.jsx)("span",{className:`${i}-status`,children:"Click the map where the house stands."}):null,zl?(0,r.jsxs)("span",{className:`${i}-status`,children:["Catching up on what ",n?.village.name??"the village"," has been doing\u2026"]}):null,rd?(0,r.jsx)("p",{className:`${i}-status`,children:rd}):null]}):null})})})]})}var Ip=class extends HTMLElement{connectedCallback(){V0(),this.__root??(this.__root=(0,K0.createRoot)(this)),this.__root.render((0,r.jsx)(_p,{element:this,children:(0,r.jsx)(c2,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),V0()})}};function c2({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let n=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",n),()=>e.removeEventListener("marinara-capability-props",n)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(m2,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(h2,{props:e.capabilityProps??{}}):(0,r.jsx)(l2,{element:e})}function u2(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var d2="marinara-active-chat-id";function o1(){try{window.localStorage.removeItem(d2)}catch{}window.location.reload()}function r1(e,t){let[a,n]=(0,m.useState)(null),[o,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(s(!1),n(null),!t)return;let c=new AbortController;return(async()=>{try{let d=await D(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;n(d??null),s(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:o}}function h2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",n=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:s,known:c}=r1(t,a&&t.length>0),[d,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!d)return;let $=k=>{g.current?.contains(k.target)||h(!1)},A=k=>{k.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",$),document.addEventListener("keydown",A),()=>{document.removeEventListener("pointerdown",$),document.removeEventListener("keydown",A)}},[d]),!a||!c||s===null)return null;let w=s.name||"your villager",N=s.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${N}`;return(0,r.jsxs)("span",{className:`${i}-tracker`,"data-compact":n,"data-open":d,ref:g,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${i}-tracker-chip`:`${i}-button ${i}-tracker-chip`,onClick:()=>h($=>!$),"aria-haspopup":"menu","aria-expanded":d,title:f,"aria-label":f,children:[(0,r.jsx)(u2,{}),(0,r.jsx)("span",{className:`${i}-tracker-label`,children:"Villages"})]}),d?(0,r.jsxs)("div",{className:`${i}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${N}`,children:[(0,r.jsxs)("p",{className:`${i}-tracker-menu-title`,children:["This roleplay spun off from ",N]}),s.resident?(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[w," still lives there. ",N," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[w," does not live in ",N," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${i}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:o1,title:`Leaves this chat and opens Marinara's home screen, where the ${N} tab is waiting.`,children:"Open the village"})})]}):null]})}function m2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:n,known:o}=r1(t,a&&t.length>0);if(!a||!o)return null;if(n===null)return(0,r.jsx)("div",{className:`${i}-panel-view`,children:(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let s=n.name||"this villager",c=n.villageName||"your village";return(0,r.jsxs)("div",{className:`${i}-panel-view`,children:[(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:n.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${s} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:s})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:n.room})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:c})]}),(0,r.jsx)("div",{className:`${i}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:o1,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(i)||customElements.define(i,Ip);
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
