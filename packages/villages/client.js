var X$=Object.create;var kd=Object.defineProperty;var Q$=Object.getOwnPropertyDescriptor;var Z$=Object.getOwnPropertyNames;var K$=Object.getPrototypeOf,J$=Object.prototype.hasOwnProperty;var P$=(e,t,a)=>t in e?kd(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var Wa=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var F$=(e,t,a,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of Z$(t))!J$.call(e,o)&&o!==a&&kd(e,o,{get:()=>t[o],enumerable:!(i=Q$(t,o))||i.enumerable});return e};var Yl=(e,t,a)=>(a=e!=null?X$(K$(e)):{},F$(t||!e||!e.__esModule?kd(a,"default",{value:e,enumerable:!0}):a,e));var Fg=(e,t,a)=>P$(e,typeof t!="symbol"?t+"":t,a);var hf=Wa(le=>{"use strict";var Cd=Symbol.for("react.transitional.element"),W$=Symbol.for("react.portal"),ex=Symbol.for("react.fragment"),tx=Symbol.for("react.strict_mode"),ax=Symbol.for("react.profiler"),nx=Symbol.for("react.consumer"),ix=Symbol.for("react.context"),ox=Symbol.for("react.forward_ref"),rx=Symbol.for("react.suspense"),sx=Symbol.for("react.memo"),nf=Symbol.for("react.lazy"),lx=Symbol.for("react.activity"),cx=Symbol.for("react.view_transition"),Wg=Symbol.iterator;function ux(e){return e===null||typeof e!="object"?null:(e=Wg&&e[Wg]||e["@@iterator"],typeof e=="function"?e:null)}var of={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},rf=Object.assign,sf={};function _o(e,t,a){this.props=e,this.context=t,this.refs=sf,this.updater=a||of}_o.prototype.isReactComponent={};_o.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};_o.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function lf(){}lf.prototype=_o.prototype;function zd(e,t,a){this.props=e,this.context=t,this.refs=sf,this.updater=a||of}var Ad=zd.prototype=new lf;Ad.constructor=zd;rf(Ad,_o.prototype);Ad.isPureReactComponent=!0;var ef=Array.isArray;function Ed(){}var Ye={H:null,A:null,T:null,S:null},cf=Object.prototype.hasOwnProperty;function Rd(e,t,a){var i=a.ref;return{$$typeof:Cd,type:e,key:t,ref:i!==void 0?i:null,props:a}}function dx(e,t){return Rd(e.type,t,e.props)}function Md(e){return typeof e=="object"&&e!==null&&e.$$typeof===Cd}function hx(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var tf=/\/+/g;function Td(e,t){return typeof e=="object"&&e!==null&&e.key!=null?hx(""+e.key):t.toString(36)}function mx(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Ed,Ed):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Do(e,t,a,i,o){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case Cd:case W$:c=!0;break;case nf:return c=e._init,Do(c(e._payload),t,a,i,o)}}if(c)return o=o(e),c=i===""?"."+Td(e,0):i,ef(o)?(a="",c!=null&&(a=c.replace(tf,"$&/")+"/"),Do(o,t,a,"",function(f){return f})):o!=null&&(Md(o)&&(o=dx(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(tf,"$&/")+"/")+c)),t.push(o)),1;c=0;var d=i===""?".":i+":";if(ef(e))for(var h=0;h<e.length;h++)i=e[h],s=d+Td(i,h),c+=Do(i,t,a,s,o);else if(h=ux(e),typeof h=="function")for(e=h.call(e),h=0;!(i=e.next()).done;)i=i.value,s=d+Td(i,h++),c+=Do(i,t,a,s,o);else if(s==="object"){if(typeof e.then=="function")return Do(mx(e),t,a,i,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function Xl(e,t,a){if(e==null)return e;var i=[],o=0;return Do(e,i,"","",function(s){return t.call(a,s,o++)}),i}function px(e){if(e._status===-1){var t=e._result,a=t();a.then(function(i){(e._status===0||e._status===-1)&&(e._status=1,e._result=i,a.status===void 0&&(a.status="fulfilled",a.value=i))},function(i){(e._status===0||e._status===-1)&&(e._status=2,e._result=i,a.status===void 0&&(a.status="rejected",a.reason=i))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var af=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function uf(e){var t=Ye.T,a={};a.types=t!==null?t.types:null,Ye.T=a;try{var i=e(),o=Ye.S;o!==null&&o(a,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(Ed,af)}catch(s){af(s)}finally{t!==null&&a.types!==null&&(t.types=a.types),Ye.T=t}}function df(e){var t=Ye.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else uf(df.bind(null,e))}var gx={map:Xl,forEach:function(e,t,a){Xl(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Xl(e,function(){t++}),t},toArray:function(e){return Xl(e,function(t){return t})||[]},only:function(e){if(!Md(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};le.Activity=lx;le.Children=gx;le.Component=_o;le.Fragment=ex;le.Profiler=ax;le.PureComponent=zd;le.StrictMode=tx;le.Suspense=rx;le.ViewTransition=cx;le.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ye;le.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Ye.H.useMemoCache(e)}};le.addTransitionType=df;le.cache=function(e){return function(){return e.apply(null,arguments)}};le.cacheSignal=function(){return null};le.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=rf({},e.props),o=e.key;if(t!=null)for(s in t.key!==void 0&&(o=""+t.key),t)!cf.call(t,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&t.ref===void 0||(i[s]=t[s]);var s=arguments.length-2;if(s===1)i.children=a;else if(1<s){for(var c=Array(s),d=0;d<s;d++)c[d]=arguments[d+2];i.children=c}return Rd(e.type,o,i)};le.createContext=function(e){return e={$$typeof:ix,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:nx,_context:e},e};le.createElement=function(e,t,a){var i,o={},s=null;if(t!=null)for(i in t.key!==void 0&&(s=""+t.key),t)cf.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(o[i]=t[i]);var c=arguments.length-2;if(c===1)o.children=a;else if(1<c){for(var d=Array(c),h=0;h<c;h++)d[h]=arguments[h+2];o.children=d}if(e&&e.defaultProps)for(i in c=e.defaultProps,c)o[i]===void 0&&(o[i]=c[i]);return Rd(e,s,o)};le.createRef=function(){return{current:null}};le.forwardRef=function(e){return{$$typeof:ox,render:e}};le.isValidElement=Md;le.lazy=function(e){return{$$typeof:nf,_payload:{_status:-1,_result:e},_init:px}};le.memo=function(e,t){return{$$typeof:sx,type:e,compare:t===void 0?null:t}};le.startTransition=uf;le.unstable_useCacheRefresh=function(){return Ye.H.useCacheRefresh()};le.use=function(e){return Ye.H.use(e)};le.useActionState=function(e,t,a){return Ye.H.useActionState(e,t,a)};le.useCallback=function(e,t){return Ye.H.useCallback(e,t)};le.useContext=function(e){return Ye.H.useContext(e)};le.useDebugValue=function(){};le.useDeferredValue=function(e,t){return Ye.H.useDeferredValue(e,t)};le.useEffect=function(e,t){return Ye.H.useEffect(e,t)};le.useEffectEvent=function(e){return Ye.H.useEffectEvent(e)};le.useId=function(){return Ye.H.useId()};le.useImperativeHandle=function(e,t,a){return Ye.H.useImperativeHandle(e,t,a)};le.useInsertionEffect=function(e,t){return Ye.H.useInsertionEffect(e,t)};le.useLayoutEffect=function(e,t){return Ye.H.useLayoutEffect(e,t)};le.useMemo=function(e,t){return Ye.H.useMemo(e,t)};le.useOptimistic=function(e,t){return Ye.H.useOptimistic(e,t)};le.useReducer=function(e,t,a){return Ye.H.useReducer(e,t,a)};le.useRef=function(e){return Ye.H.useRef(e)};le.useState=function(e){return Ye.H.useState(e)};le.useSyncExternalStore=function(e,t,a){return Ye.H.useSyncExternalStore(e,t,a)};le.useTransition=function(){return Ye.H.useTransition()};le.version="19.3.0"});var Ql=Wa((_2,mf)=>{"use strict";mf.exports=hf()});var Nf=Wa(Pe=>{"use strict";function _d(e,t){var a=e.length;e.push(t);e:for(;0<a;){var i=a-1>>>1,o=e[i];if(0<Zl(o,t))e[i]=t,e[a]=o,a=i;else break e}}function en(e){return e.length===0?null:e[0]}function Jl(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var i=0,o=e.length,s=o>>>1;i<s;){var c=2*(i+1)-1,d=e[c],h=c+1,f=e[h];if(0>Zl(d,a))h<o&&0>Zl(f,d)?(e[i]=f,e[h]=a,i=h):(e[i]=d,e[c]=a,i=c);else if(h<o&&0>Zl(f,a))e[i]=f,e[h]=a,i=h;else break e}}return t}function Zl(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Pe.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(pf=performance,Pe.unstable_now=function(){return pf.now()}):(Od=Date,gf=Od.now(),Pe.unstable_now=function(){return Od.now()-gf});var pf,Od,gf,Tn=[],Zn=[],fx=1,xa=null,Dt=3,Id=!1,ss=!1,ls=!1,Hd=!1,vf=typeof setTimeout=="function"?setTimeout:null,yf=typeof clearTimeout=="function"?clearTimeout:null,ff=typeof setImmediate<"u"?setImmediate:null;function Kl(e){for(var t=en(Zn);t!==null;){if(t.callback===null)Jl(Zn);else if(t.startTime<=e)Jl(Zn),t.sortIndex=t.expirationTime,_d(Tn,t);else break;t=en(Zn)}}function Ud(e){if(ls=!1,Kl(e),!ss)if(en(Tn)!==null)ss=!0,Ho||(Ho=!0,Io());else{var t=en(Zn);t!==null&&qd(Ud,t.startTime-e)}}var Ho=!1,cs=-1,wf=5,$f=-1;function xf(){return Hd?!0:!(Pe.unstable_now()-$f<wf)}function Vd(){if(Hd=!1,Ho){var e=Pe.unstable_now();$f=e;var t=!0;try{e:{ss=!1,ls&&(ls=!1,yf(cs),cs=-1),Id=!0;var a=Dt;try{t:{for(Kl(e),xa=en(Tn);xa!==null&&!(xa.expirationTime>e&&xf());){var i=xa.callback;if(typeof i=="function"){xa.callback=null,Dt=xa.priorityLevel;var o=i(xa.expirationTime<=e);if(e=Pe.unstable_now(),typeof o=="function"){xa.callback=o,Kl(e),t=!0;break t}xa===en(Tn)&&Jl(Tn),Kl(e)}else Jl(Tn);xa=en(Tn)}if(xa!==null)t=!0;else{var s=en(Zn);s!==null&&qd(Ud,s.startTime-e),t=!1}}break e}finally{xa=null,Dt=a,Id=!1}t=void 0}}finally{t?Io():Ho=!1}}}var Io;typeof ff=="function"?Io=function(){ff(Vd)}:typeof MessageChannel<"u"?(Dd=new MessageChannel,bf=Dd.port2,Dd.port1.onmessage=Vd,Io=function(){bf.postMessage(null)}):Io=function(){vf(Vd,0)};var Dd,bf;function qd(e,t){cs=vf(function(){e(Pe.unstable_now())},t)}Pe.unstable_IdlePriority=5;Pe.unstable_ImmediatePriority=1;Pe.unstable_LowPriority=4;Pe.unstable_NormalPriority=3;Pe.unstable_Profiling=null;Pe.unstable_UserBlockingPriority=2;Pe.unstable_cancelCallback=function(e){e.callback=null};Pe.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):wf=0<e?Math.floor(1e3/e):5};Pe.unstable_getCurrentPriorityLevel=function(){return Dt};Pe.unstable_next=function(e){switch(Dt){case 1:case 2:case 3:var t=3;break;default:t=Dt}var a=Dt;Dt=t;try{return e()}finally{Dt=a}};Pe.unstable_requestPaint=function(){Hd=!0};Pe.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=Dt;Dt=e;try{return t()}finally{Dt=a}};Pe.unstable_scheduleCallback=function(e,t,a){var i=Pe.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?i+a:i):a=i,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:fx++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>i?(e.sortIndex=a,_d(Zn,e),en(Tn)===null&&e===en(Zn)&&(ls?(yf(cs),cs=-1):ls=!0,qd(Ud,a-i))):(e.sortIndex=o,_d(Tn,e),ss||Id||(ss=!0,Ho||(Ho=!0,Io()))),e};Pe.unstable_shouldYield=xf;Pe.unstable_wrapCallback=function(e){var t=Dt;return function(){var a=Dt;Dt=t;try{return e.apply(this,arguments)}finally{Dt=a}}}});var kf=Wa((H2,Sf)=>{"use strict";Sf.exports=Nf()});var Cf=Wa(_t=>{"use strict";var bx=Ql();function Ef(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Kn(){}var jt={d:{f:Kn,r:function(){throw Error(Ef(522))},D:Kn,C:Kn,L:Kn,m:Kn,X:Kn,S:Kn,M:Kn},p:0,findDOMNode:null},vx=Symbol.for("react.portal"),yx=Symbol.for("react.recoverable"),Tf=Symbol.for("react.optimistic_key");function wx(e,t,a){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:vx,key:i==null?null:i===Tf?Tf:""+i,children:e,containerInfo:t,implementation:a}}var us=bx.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Pl(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}_t.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=jt;_t.browser=function(e){return{$$typeof:yx,_reason:e}};_t.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Ef(299));return wx(e,t,null,a)};_t.flushSync=function(e){var t=us.T,a=jt.p;try{if(us.T=null,jt.p=2,e)return e()}finally{us.T=t,jt.p=a,jt.d.f()}};_t.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,jt.d.C(e,t))};_t.prefetchDNS=function(e){typeof e=="string"&&jt.d.D(e)};_t.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,i=Pl(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,s=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?jt.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:o,fetchPriority:s}):a==="script"&&jt.d.X(e,{crossOrigin:i,integrity:o,fetchPriority:s,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};_t.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=Pl(t.as,t.crossOrigin);jt.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&jt.d.M(e)};_t.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,i=Pl(a,t.crossOrigin);jt.d.L(e,a,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};_t.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=Pl(t.as,t.crossOrigin);jt.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else jt.d.m(e)};_t.requestFormReset=function(e){jt.d.r(e)};_t.unstable_batchedUpdates=function(e,t){return e(t)};_t.useFormState=function(e,t,a){return us.H.useFormState(e,t,a)};_t.useFormStatus=function(){return us.H.useHostTransitionStatus()};_t.version="19.3.0"});var Rf=Wa((q2,Af)=>{"use strict";function zf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(zf)}catch(e){console.error(e)}}zf(),Af.exports=Cf()});var b0=Wa(Mu=>{"use strict";var pt=kf(),fv=Ql(),$x=Rf();function M(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function bv(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Ps(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function vv(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function yv(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Mf(e){if(Ps(e)!==e)throw Error(M(188))}function xx(e){var t=e.alternate;if(!t){if(t=Ps(e),t===null)throw Error(M(188));return t!==e?null:e}for(var a=e,i=t;;){var o=a.return;if(o===null)break;var s=o.alternate;if(s===null){if(i=o.return,i!==null){a=i;continue}break}if(o.child===s.child){for(s=o.child;s;){if(s===a)return Mf(o),e;if(s===i)return Mf(o),t;s=s.sibling}throw Error(M(188))}if(a.return!==i.return)a=o,i=s;else{for(var c=!1,d=o.child;d;){if(d===a){c=!0,a=o,i=s;break}if(d===i){c=!0,i=o,a=s;break}d=d.sibling}if(!c){for(d=s.child;d;){if(d===a){c=!0,a=s,i=o;break}if(d===i){c=!0,i=s,a=o;break}d=d.sibling}if(!c)throw Error(M(189))}}if(a.alternate!==i)throw Error(M(190))}if(a.tag!==3)throw Error(M(188));return a.stateNode.current===a?e:t}function wv(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=wv(e),t!==null)return t;e=e.sibling}return null}function ta(e,t,a,i,o,s){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,i,o,s)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&ta(e.child,t,a,i,o,s))return!0;e=e.sibling}return!1}function oo(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Of(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function $v(e){var t=[null,null],a=oo(e);return a===null||xv(t,e,a.child,{foundSelf:!1}),t}function xv(e,t,a,i){for(;a!==null;){if(a===t)i.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(i.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&xv(e,t,a.child,i))return!0;a=a.sibling}return!1}function mt(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(M(559))}}var Yo=null,vh=null;function Nx(e,t,a){return e===a?!0:e===t?(Yo=e,!0):!1}function Sx(e,t,a){return e===a?(vh=e,!1):e===t?(vh!==null&&(Yo=e),!0):!1}function Vf(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function yh(e,t,a){for(var i=0,o=e;o;o=a(o))i++;o=0;for(var s=t;s;s=a(s))o++;for(;0<i-o;)e=a(e),i--;for(;0<o-i;)t=a(t),o--;for(;i--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var Le=Object.assign,kx=Symbol.for("react.element"),Fl=Symbol.for("react.transitional.element"),bs=Symbol.for("react.portal"),Xo=Symbol.for("react.fragment"),Nv=Symbol.for("react.strict_mode"),wh=Symbol.for("react.profiler"),Sv=Symbol.for("react.consumer"),sn=Symbol.for("react.context"),zm=Symbol.for("react.forward_ref"),$h=Symbol.for("react.suspense"),xh=Symbol.for("react.suspense_list"),Am=Symbol.for("react.memo"),Wn=Symbol.for("react.lazy"),Nh=Symbol.for("react.activity"),Tx=Symbol.for("react.legacy_hidden"),Ex=Symbol.for("react.memo_cache_sentinel"),Sh=Symbol.for("react.view_transition"),Cx=Symbol.for("react.recoverable"),Df=Symbol.iterator;function ds(e){return e===null||typeof e!="object"?null:(e=Df&&e[Df]||e["@@iterator"],typeof e=="function"?e:null)}var zx=Symbol.for("react.client.reference");function kh(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===zx?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Xo:return"Fragment";case wh:return"Profiler";case Nv:return"StrictMode";case $h:return"Suspense";case xh:return"SuspenseList";case Nh:return"Activity";case Sh:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case bs:return"Portal";case sn:return e.displayName||"Context";case Sv:return(e._context.displayName||"Context")+".Consumer";case zm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Am:return t=e.displayName||null,t!==null?t:kh(e.type)||"Memo";case Wn:t=e._payload,e=e._init;try{return kh(e(t))}catch{}}return null}var vs=Array.isArray,te=fv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Te=$x.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Xi={pending:!1,data:null,method:null,action:null},Th=[],Qo=-1;function pn(e){return{current:e}}function At(e){0>Qo||(e.current=Th[Qo],Th[Qo]=null,Qo--)}function Ze(e,t){Qo++,Th[Qo]=e.current,e.current=t}var dn=pn(null),Ds=pn(null),li=pn(null),Hc=pn(null);function Uc(e,t){switch(Ze(li,t),Ze(Ds,e),Ze(dn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Kb(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Kb(t),e=Xw(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}At(dn),Ze(dn,e)}function mr(){At(dn),At(Ds),At(li)}function Eh(e){var t=e.memoizedState;t!==null&&(Nr._currentValue=t.memoizedState,Ze(Hc,e)),t=dn.current;var a=Xw(t,e.type);t!==a&&(Ze(Ds,e),Ze(dn,a))}function qc(e){Ds.current===e&&(At(dn),At(Ds)),Hc.current===e&&(At(Hc),Nr._currentValue=Xi)}var Bd,_f;function Pn(e){if(Bd===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Bd=t&&t[1]||"",_f=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Bd+e+_f}var Ld=!1;function jd(e,t){if(!e||Ld)return"";Ld=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var x=function(){throw Error()};if(Object.defineProperty(x.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(x,[])}catch(C){var g=C}Reflect.construct(e,[],x)}else{try{x.call()}catch(C){g=C}x=!1;try{var b=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),x=!0,new e}finally{x&&(b!==void 0?Object.defineProperty(e.prototype,"props",b):delete e.prototype.props)}}}else{try{throw Error()}catch(C){g=C}(x=e())&&typeof x.catch=="function"&&x.catch(function(){})}}catch(C){if(C&&g&&typeof C.stack=="string")return[C.stack,g.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=i.DetermineComponentFrameRoot(),c=s[0],d=s[1];if(c&&d){var h=c.split(`
`),f=d.split(`
`);for(o=i=0;i<h.length&&!h[i].includes("DetermineComponentFrameRoot");)i++;for(;o<f.length&&!f[o].includes("DetermineComponentFrameRoot");)o++;if(i===h.length||o===f.length)for(i=h.length-1,o=f.length-1;1<=i&&0<=o&&h[i]!==f[o];)o--;for(;1<=i&&0<=o;i--,o--)if(h[i]!==f[o]){if(i!==1||o!==1)do if(i--,o--,0>o||h[i]!==f[o]){var $=`
`+h[i].replace(" at new "," at ");return e.displayName&&$.includes("<anonymous>")&&($=$.replace("<anonymous>",e.displayName)),$}while(1<=i&&0<=o);break}}}finally{Ld=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Pn(a):""}function Ax(e,t){switch(e.tag){case 26:case 27:case 5:return Pn(e.type);case 16:return Pn("Lazy");case 13:return e.child!==t&&t!==null?Pn("Suspense Fallback"):Pn("Suspense");case 19:return Pn("SuspenseList");case 0:case 15:return jd(e.type,!1);case 11:return jd(e.type.render,!1);case 1:return jd(e.type,!0);case 31:return Pn("Activity");case 30:return Pn("ViewTransition");default:return""}}function If(e){try{var t="",a=null;do t+=Ax(e,a),a=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var Ch=Object.prototype.hasOwnProperty,Rm=pt.unstable_scheduleCallback,Gd=pt.unstable_cancelCallback,Rx=pt.unstable_shouldYield,Mx=pt.unstable_requestPaint,ha=pt.unstable_now,Ox=pt.unstable_getCurrentPriorityLevel,kv=pt.unstable_ImmediatePriority,Tv=pt.unstable_UserBlockingPriority,Bc=pt.unstable_NormalPriority,Vx=pt.unstable_LowPriority,Ev=pt.unstable_IdlePriority,Dx=pt.log,_x=pt.unstable_setDisableYieldValue,Fs=null,ma=null;function ai(e){if(typeof Dx=="function"&&_x(e),ma&&typeof ma.setStrictMode=="function")try{ma.setStrictMode(Fs,e)}catch{}}var pa=Math.clz32?Math.clz32:Ux,Ix=Math.log,Hx=Math.LN2;function Ux(e){return e>>>=0,e===0?32:31-(Ix(e)/Hx|0)|0}var Wl=256,ec=262144,tc=4194304;function Bi(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function mu(e,t,a){var i=e.pendingLanes;if(i===0)return 0;var o=0,s=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var d=i&134217727;return d!==0?(i=d&~s,i!==0?o=Bi(i):(c&=d,c!==0?o=Bi(c):a||(a=d&~e,a!==0&&(o=Bi(a))))):(d=i&~s,d!==0?o=Bi(d):c!==0?o=Bi(c):a||(a=i&~e,a!==0&&(o=Bi(a)))),o===0?0:t!==0&&t!==o&&(t&s)===0&&(s=o&-o,a=t&-t,s>=a||s===32&&(a&4194048)!==0)?t:o}function Ws(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Cv(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var i=31-pa(a),o=1<<i;t|=e[i],a&=~o}return t}function qx(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function zv(){var e=tc;return tc<<=1,(tc&62914560)===0&&(tc=4194304),e}function Yd(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function el(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Bx(e,t,a,i,o,s){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var d=e.entanglements,h=e.expirationTimes,f=e.hiddenUpdates;for(a=c&~a;0<a;){var $=31-pa(a),x=1<<$;d[$]=0,h[$]=-1;var g=f[$];if(g!==null)for(f[$]=null,$=0;$<g.length;$++){var b=g[$];b!==null&&(b.lane&=-536870913)}a&=~x}i!==0&&Av(e,i,0),s!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=s&~(c&~t))}function Av(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-pa(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|a&261930}function Rv(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var i=31-pa(a),o=1<<i;o&t|e[i]&t&&(e[i]|=t),a&=~o}}function Mv(e,t){var a=t&-t;return a=(a&42)!==0?1:Mm(a),(a&(e.suspendedLanes|t))!==0?0:a}function Mm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Om(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Ov(){var e=Te.p;return e!==0?e:(e=window.event,e===void 0?32:p0(e.type))}function Hf(e,t){var a=Te.p;try{return Te.p=e,t()}finally{Te.p=a}}var Un=Math.random().toString(36).slice(2),Ct="__reactFiber$"+Un,aa="__reactProps$"+Un,Tr="__reactContainer$"+Un,Uf="__reactEvents$"+Un,Lx="__reactListeners$"+Un,jx="__reactHandles$"+Un,qf="__reactResources$"+Un,tl="__reactMarker$"+Un,Lc="__reactLoad$"+Un;function pu(e){delete e[Ct],delete e[aa],delete e[Lx],delete e[jx]}function Gi(e){var t;if(t=e[Ct])return t;for(var a=e.parentNode;a;){if(t=a[Tr]||a[Ct]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=nv(e);e!==null;){if(a=e[Ct])return a;e=nv(e)}return t}e=a,a=e.parentNode}return null}function Er(e){if(e=e[Ct]||e[Tr]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function ys(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(M(33))}function nr(e){var t=e[qf];return t||(t=e[qf]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function yt(e){e[tl]=!0}function Vv(e){e[Lc]=void 0}var Dv=new Set,_v={};function ro(e,t){pr(e,t),pr(e+"Capture",t)}function pr(e,t){for(_v[e]=t,e=0;e<t.length;e++)Dv.add(t[e])}var Gx=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Bf={},Lf={};function Yx(e){return Ch.call(Lf,e)?!0:Ch.call(Bf,e)?!1:Gx.test(e)?Lf[e]=!0:(Bf[e]=!0,!1)}var Ne=!1;function jf(){var e=Ne;return Ne=!1,e}function yc(e,t,a){if(Yx(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function ac(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function En(e,t,a,i){if(i===null)e.removeAttribute(a);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,i)}}function la(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Iv(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Xx(e,t,a){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var o=i.get,s=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(c){a=""+c,s.call(this,c)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function zh(e){if(!e._valueTracker){var t=Iv(e)?"checked":"value";e._valueTracker=Xx(e,t,""+e[t])}}function Hv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),i="";return e&&(i=Iv(e)?e.checked?"true":"false":e.value),e=i,e!==a?(t.setValue(e),!0):!1}var Qx=/[\n"\\]/g;function Ea(e){return e.replace(Qx,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Ah(e,t,a,i,o,s,c,d){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+la(t)):e.value!==""+la(t)&&(e.value=""+la(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?Xd(e,la(e.value)):Xd(e,la(t)):a!=null?Xd(e,la(a)):i!=null&&e.removeAttribute("value"),o==null&&s!=null&&(e.defaultChecked=!!s),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"?e.name=""+la(d):e.removeAttribute("name")}function Uv(e,t,a,i,o,s,c,d){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.type=s),t!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||t!=null)){zh(e);return}a=a!=null?""+la(a):"",t=t!=null?""+la(t):a,d||t===e.value||(e.value=t),e.defaultValue=t}i=i??o,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=d?e.checked:!!i,e.defaultChecked=!!i,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),zh(e)}function Xd(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function ir(e,t,a,i){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&i&&(e[a].defaultSelected=!0)}else{for(a=""+la(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,i&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function qv(e,t,a){if(t!=null&&(t=""+la(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+la(a):""}function Bv(e,t,a,i){if(t==null){if(i!=null){if(a!=null)throw Error(M(92));if(vs(i)){if(1<i.length)throw Error(M(93));i=i[0]}a=i}a==null&&(a=""),t=a}a=la(t),e.defaultValue=a,i=e.textContent,i===a&&i!==""&&i!==null&&(e.value=i),zh(e)}function gr(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var Zx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Gf(e,t,a){var i=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,a):typeof a!="number"||a===0||Zx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Lv(e,t,a){if(t!=null&&typeof t!="object")throw Error(M(62));if(e=e.style,a!=null){for(var i in a)!a.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="",Ne=!0);for(var o in t)i=t[o],t.hasOwnProperty(o)&&a[o]!==i&&(Gf(e,o,i),Ne=!0)}else for(var s in t)t.hasOwnProperty(s)&&Gf(e,s,t[s])}function Vm(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Kx=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Jx=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function wc(e){return Jx.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function ln(){}var Rh=null;function Dm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Zo=null,or=null;function Yf(e){var t=Er(e);if(t&&(e=t.stateNode)){var a=e[aa]||null;e:switch(e=t.stateNode,t.type){case"input":if(Ah(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Ea(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var i=a[t];if(i!==e&&i.form===e.form){var o=i[aa]||null;if(!o)throw Error(M(90));Ah(i,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)i=a[t],i.form===e.form&&Hv(i)}break e;case"textarea":qv(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&ir(e,!!a.multiple,t,!1)}}}var Qd=!1;function jv(e,t,a){if(Qd)return e(t,a);Qd=!0;try{var i=e(t);return i}finally{if(Qd=!1,(Zo!==null||or!==null)&&(Cu(),Zo&&(t=Zo,e=or,or=Zo=null,Yf(t),e)))for(t=0;t<e.length;t++)Yf(e[t])}}function _s(e,t){var a=e.stateNode;if(a===null)return null;var i=a[aa]||null;if(i===null)return null;a=i[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(M(231,t,typeof a));return a}var On=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Mh=!1;if(On)try{Uo={},Object.defineProperty(Uo,"passive",{get:function(){Mh=!0}}),window.addEventListener("test",Uo,Uo),window.removeEventListener("test",Uo,Uo)}catch{Mh=!1}var Uo,ni=null,_m=null,$c=null;function Gv(){if($c)return $c;var e,t=_m,a=t.length,i,o="value"in ni?ni.value:ni.textContent,s=o.length;for(e=0;e<a&&t[e]===o[e];e++);var c=a-e;for(i=1;i<=c&&t[a-i]===o[s-i];i++);return $c=o.slice(e,1<i?1-i:void 0)}function xc(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function nc(){return!0}function Xf(){return!1}function Qt(e){function t(a,i,o,s,c){this._reactName=a,this._targetInst=o,this.type=i,this.nativeEvent=s,this.target=c,this.currentTarget=null;for(var d in e)e.hasOwnProperty(d)&&(a=e[d],this[d]=a?a(s):s[d]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?nc:Xf,this.isPropagationStopped=Xf,this}return Le(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=nc)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=nc)},persist:function(){},isPersistent:nc}),t}var Ni={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},gu=Qt(Ni),al=Le({},Ni,{view:0,detail:0}),Px=Qt(al),Zd,Kd,hs,fu=Le({},al,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Im,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==hs&&(hs&&e.type==="mousemove"?(Zd=e.screenX-hs.screenX,Kd=e.screenY-hs.screenY):Kd=Zd=0,hs=e),Zd)},movementY:function(e){return"movementY"in e?e.movementY:Kd}}),Qf=Qt(fu),Fx=Le({},fu,{dataTransfer:0}),Wx=Qt(Fx),eN=Le({},al,{relatedTarget:0}),Jd=Qt(eN),tN=Le({},Ni,{animationName:0,elapsedTime:0,pseudoElement:0}),aN=Qt(tN),nN=Le({},Ni,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),iN=Qt(nN),oN=Le({},Ni,{data:0}),Zf=Qt(oN),rN={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},sN={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},lN={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function cN(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=lN[e])?!!t[e]:!1}function Im(){return cN}var uN=Le({},al,{key:function(e){if(e.key){var t=rN[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=xc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?sN[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Im,charCode:function(e){return e.type==="keypress"?xc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?xc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),dN=Qt(uN),hN=Le({},fu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Kf=Qt(hN),mN=Le({},Ni,{submitter:0}),pN=Qt(mN),gN=Le({},al,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Im}),fN=Qt(gN),bN=Le({},Ni,{propertyName:0,elapsedTime:0,pseudoElement:0}),vN=Qt(bN),yN=Le({},fu,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),wN=Qt(yN),$N=Le({},Ni,{newState:0,oldState:0,source:0}),xN=Qt($N),NN=[9,13,27,32],Hm=On&&"CompositionEvent"in window,xs=null;On&&"documentMode"in document&&(xs=document.documentMode);var SN=On&&"TextEvent"in window&&!xs,Yv=On&&(!Hm||xs&&8<xs&&11>=xs),Jf=" ",Pf=!1;function Xv(e,t){switch(e){case"keyup":return NN.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Qv(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Ko=!1;function kN(e,t){switch(e){case"compositionend":return Qv(t);case"keypress":return t.which!==32?null:(Pf=!0,Jf);case"textInput":return e=t.data,e===Jf&&Pf?null:e;default:return null}}function TN(e,t){if(Ko)return e==="compositionend"||!Hm&&Xv(e,t)?(e=Gv(),$c=_m=ni=null,Ko=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Yv&&t.locale!=="ko"?null:t.data;default:return null}}var EN={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Ff(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!EN[e.type]:t==="textarea"}function Zv(e,t,a,i){Zo?or?or.push(i):or=[i]:Zo=i,t=uu(t,"onChange"),0<t.length&&(a=new gu("onChange","change",null,a,i),e.push({event:a,listeners:t}))}var Ns=null,Is=null;function CN(e){jw(e,0)}function bu(e){var t=ys(e);if(Hv(t))return e}function Wf(e,t){if(e==="change")return t}var Kv=!1;On&&(On?(oc="oninput"in document,oc||(Pd=document.createElement("div"),Pd.setAttribute("oninput","return;"),oc=typeof Pd.oninput=="function"),ic=oc):ic=!1,Kv=ic&&(!document.documentMode||9<document.documentMode));var ic,oc,Pd;function eb(){Ns&&(Ns.detachEvent("onpropertychange",Jv),Is=Ns=null)}function Jv(e){if(e.propertyName==="value"&&bu(Is)){var t=[];Zv(t,Is,e,Dm(e)),jv(CN,t)}}function zN(e,t,a){e==="focusin"?(eb(),Ns=t,Is=a,Ns.attachEvent("onpropertychange",Jv)):e==="focusout"&&eb()}function AN(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return bu(Is)}function RN(e,t){if(e==="click")return bu(t)}function MN(e,t){if(e==="input"||e==="change")return bu(t)}function ON(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var fa=typeof Object.is=="function"?Object.is:ON;function Hs(e,t){if(fa(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),i=Object.keys(t);if(a.length!==i.length)return!1;for(i=0;i<a.length;i++){var o=a[i];if(!Ch.call(t,o)||!fa(e[o],t[o]))return!1}return!0}function Oh(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function tb(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function ab(e,t){var a=tb(e);e=0;for(var i;a;){if(a.nodeType===3){if(i=e+a.textContent.length,e<=t&&i>=t)return{node:a,offset:t-e};e=i}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=tb(a)}}function Pv(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Pv(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Fv(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Oh(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=Oh(e.document)}return t}function Um(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var VN=On&&"documentMode"in document&&11>=document.documentMode,Jo=null,Vh=null,Ss=null,Dh=!1;function nb(e,t,a){var i=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Dh||Jo==null||Jo!==Oh(i)||(i=Jo,"selectionStart"in i&&Um(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Ss&&Hs(Ss,i)||(Ss=i,i=uu(Vh,"onSelect"),0<i.length&&(t=new gu("onSelect","select",null,t,a),e.push({event:t,listeners:i}),t.target=Jo)))}function Ui(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Po={animationend:Ui("Animation","AnimationEnd"),animationiteration:Ui("Animation","AnimationIteration"),animationstart:Ui("Animation","AnimationStart"),transitionrun:Ui("Transition","TransitionRun"),transitionstart:Ui("Transition","TransitionStart"),transitioncancel:Ui("Transition","TransitionCancel"),transitionend:Ui("Transition","TransitionEnd")},Fd={},Wv={};On&&(Wv=document.createElement("div").style,"AnimationEvent"in window||(delete Po.animationend.animation,delete Po.animationiteration.animation,delete Po.animationstart.animation),"TransitionEvent"in window||delete Po.transitionend.transition);function so(e){if(Fd[e])return Fd[e];if(!Po[e])return e;var t=Po[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in Wv)return Fd[e]=t[a];return e}var ey=so("animationend"),ty=so("animationiteration"),ay=so("animationstart"),DN=so("transitionrun"),_N=so("transitionstart"),IN=so("transitioncancel"),ny=so("transitionend"),iy=new Map,_h="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");_h.push("scrollEnd");function Xa(e,t){iy.set(e,t),ro(t,[e])}var HN=0;function Vn(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Ya.identifierPrefix;var a=HN++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function ib(e){if(e==null||typeof e=="string")return e;var t=null,a=hr;if(a!==null)for(var i=0;i<a.length;i++){var o=e[a[i]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function qn(e,t){return e=ib(e),t=ib(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var jc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Sa=[],Fo=0,qm=0;function vu(){for(var e=Fo,t=qm=Fo=0;t<e;){var a=Sa[t];Sa[t++]=null;var i=Sa[t];Sa[t++]=null;var o=Sa[t];Sa[t++]=null;var s=Sa[t];if(Sa[t++]=null,i!==null&&o!==null){var c=i.pending;c===null?o.next=o:(o.next=c.next,c.next=o),i.pending=o}s!==0&&oy(a,o,s)}}function yu(e,t,a,i){Sa[Fo++]=e,Sa[Fo++]=t,Sa[Fo++]=a,Sa[Fo++]=i,qm|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function Bm(e,t,a,i){return yu(e,t,a,i),Gc(e)}function lo(e,t){return yu(e,null,null,t),Gc(e)}function oy(e,t,a){e.lanes|=a;var i=e.alternate;i!==null&&(i.lanes|=a);for(var o=!1,s=e.return;s!==null;)s.childLanes|=a,i=s.alternate,i!==null&&(i.childLanes|=a),s.tag===22&&(e=s.stateNode,e===null||e._visibility&1||(o=!0)),e=s,s=s.return;return e.tag===3?(s=e.stateNode,o&&t!==null&&(o=31-pa(a),e=s.hiddenUpdates,i=e[o],i===null?e[o]=[t]:i.push(t),t.lane=a|536870912),s):null}function Gc(e){if(50<Vs)throw Vs=0,Mc=null,Error(M(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Wo={};function UN(e,t,a,i){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Wt(e,t,a,i){return new UN(e,t,a,i)}function Lm(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Rn(e,t){var a=e.alternate;return a===null?(a=Wt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function ry(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Nc(e,t,a,i,o,s){var c=0;if(i=e,typeof i=="function")Lm(i)&&(c=1);else if(typeof i=="string")c=dS(e,a,dn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(i){case Nh:return e=Wt(31,a,t,o),e.elementType=Nh,e.lanes=s,e;case Xo:return Qi(a.children,o,s,t);case Nv:c=8,o|=24;break;case wh:return e=Wt(12,a,t,o|2),e.elementType=wh,e.lanes=s,e;case $h:return e=Wt(13,a,t,o),e.elementType=$h,e.lanes=s,e;case xh:return e=Wt(19,a,t,o),e.elementType=xh,e.lanes=s,e;case Tx:case Sh:return e=o|32,e=Wt(30,a,t,e),e.elementType=Sh,e.lanes=s,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof i=="object"&&i!==null)switch(i.$$typeof){case sn:c=10;break e;case Sv:c=9;break e;case zm:c=11;break e;case Am:c=14;break e;case Wn:c=16,i=null;break e}c=29,a=Error(M(130,e===null?"null":typeof e,"")),i=null}return t=Wt(c,a,t,o),t.elementType=e,t.type=i,t.lanes=s,t}function Qi(e,t,a,i){return e=Wt(7,e,i,t),e.lanes=a,e}function Wd(e,t,a){return e=Wt(6,e,null,t),e.lanes=a,e}function sy(e){var t=Wt(18,null,null,0);return t.stateNode=e,t}function eh(e,t,a){return t=Wt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var ob=new WeakMap;function Ca(e,t){if(typeof e=="object"&&e!==null){var a=ob.get(e);return a!==void 0?a:(t={value:e,source:t,stack:If(t)},ob.set(e,t),t)}return{value:e,source:t,stack:If(t)}}var er=[],tr=0,Yc=null,Us=0,ka=[],Ta=0,vi=null,cn=1,un="";function zn(e,t){er[tr++]=Us,er[tr++]=Yc,Yc=e,Us=t}function ly(e,t,a){ka[Ta++]=cn,ka[Ta++]=un,ka[Ta++]=vi,vi=e;var i=cn;e=un;var o=32-pa(i)-1;i&=~(1<<o),a+=1;var s=32-pa(t)+o;if(30<s){var c=o-o%5;s=(i&(1<<c)-1).toString(32),i>>=c,o-=c,cn=1<<32-pa(t)+o|a<<o|i,un=s+e}else cn=1<<s|a<<o|i,un=e}function wu(e){e.return!==null&&(zn(e,1),ly(e,1,0))}function jm(e){for(;e===Yc;)Yc=er[--tr],er[tr]=null,Us=er[--tr],er[tr]=null;for(;e===vi;)vi=ka[--Ta],ka[Ta]=null,un=ka[--Ta],ka[Ta]=null,cn=ka[--Ta],ka[Ta]=null}function cy(e,t){ka[Ta++]=cn,ka[Ta++]=un,ka[Ta++]=vi,cn=t.id,un=t.overflow,vi=e}var wt=null,Qe=null,pe=!1,ci=null,za=!1,Ih=Error(M(519));function yi(e){var t=Error(M(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw qs(Ca(t,e)),Ih}function rb(e){var t=e.stateNode,a=e.type,i=e.memoizedProps;switch(t[Ct]=e,t[aa]=i,a){case"dialog":ge("cancel",t),ge("close",t);break;case"iframe":case"object":case"embed":ge("load",t);break;case"video":case"audio":for(a=0;a<Gs.length;a++)ge(Gs[a],t);break;case"source":ge("error",t);break;case"img":case"image":case"link":ge("error",t),ge("load",t);break;case"details":ge("toggle",t);break;case"input":ge("invalid",t),Uv(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":ge("invalid",t);break;case"textarea":ge("invalid",t),Bv(t,i.value,i.defaultValue,i.children)}a=i.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||i.suppressHydrationWarning===!0||Yw(t.textContent,a)?(i.popover!=null&&(ge("beforetoggle",t),ge("toggle",t)),i.onScroll!=null&&ge("scroll",t),i.onScrollEnd!=null&&ge("scrollend",t),i.onClick!=null&&(t.onclick=ln),t=!0):t=!1,t||yi(e,!0)}function Xc(e){for(wt=e.return;wt;)switch(wt.tag){case 5:case 31:case 13:za=!1;return;case 27:case 3:za=!0;return;default:wt=wt.return}}function qo(e){if(e!==wt)return!1;if(!pe)return Xc(e),pe=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||$m(e.type,e.memoizedProps)),a=!a),a&&Qe&&yi(e),Xc(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(317));Qe=av(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(317));Qe=av(e)}else t===27?(t=Qe,Si(e.type)?(e=km,km=null,Qe=e):Qe=t):Qe=wt?Aa(e.stateNode.nextSibling):null;return!0}function Pi(){Qe=wt=null,pe=!1}function th(){var e=ci;return e!==null&&(Pt===null?Pt=e:Pt.push.apply(Pt,e),ci=null),e}function qs(e){ci===null?ci=[e]:ci.push(e)}var Hh=pn(null),co=null,An=null;function ii(e,t,a){Ze(Hh,t._currentValue),t._currentValue=a}function Mn(e){e._currentValue=Hh.current,At(Hh)}function Sc(e,t,a){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===a)break;e=e.return}}function Uh(e,t,a,i){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var s=o.dependencies;if(s!==null){var c=o.child;s=s.firstContext;e:for(;s!==null;){var d=s;s=o;for(var h=0;h<t.length;h++)if(d.context===t[h]){s.lanes|=a,d=s.alternate,d!==null&&(d.lanes|=a),Sc(s.return,a,e),i||(c=null);break e}s=d.next}}else if(o.tag===18){if(c=o.return,c===null)throw Error(M(341));c.lanes|=a,s=c.alternate,s!==null&&(s.lanes|=a),Sc(c,a,e),c=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,c=o.alternate,c!==null&&(c.lanes|=a),Sc(o.return,a,e),c=o.child,c=c!==null?c.sibling:null):c=o.child;if(c!==null)c.return=o;else for(c=o;c!==null;){if(c===e){c=null;break}if(o=c.sibling,o!==null){o.return=c.return,c=o;break}c=c.return}o=c}}function Fi(e,t,a,i){e=null;for(var o=t,s=!1;o!==null;){if(!s){if((o.flags&524288)!==0)s=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var c=o.alternate;if(c===null)throw Error(M(387));if(c=c.memoizedProps,c!==null){var d=o.type;fa(o.pendingProps.value,c.value)||(e!==null?e.push(d):e=[d])}}else if(o===Hc.current){if(c=o.alternate,c===null)throw Error(M(387));c.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(Nr):e=[Nr])}o=o.return}return e!==null&&Uh(t,e,a,i),t.flags|=262144,e!==null}function Qc(e){for(e=e.firstContext;e!==null;){if(!fa(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Wi(e){co=e,An=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function zt(e){return uy(co,e)}function rc(e,t){return co===null&&Wi(e),uy(e,t)}function uy(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},An===null){if(e===null)throw Error(M(308));An=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else An=An.next=t;return a}var qN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},BN=pt.unstable_scheduleCallback,LN=pt.unstable_NormalPriority,ut={$$typeof:sn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Gm(){return{controller:new qN,data:new Map,refCount:0}}function nl(e){e.refCount--,e.refCount===0&&BN(LN,function(){e.controller.abort()})}function sb(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var i=t[e];a.indexOf(i)===-1&&a.push(i)}}}var ws=null;function jN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var ks=null,qh=0,eo=0,rr=null;function GN(e,t){if(ks===null){var a=ks=[];qh=0,eo=vp(),rr={status:"pending",value:void 0,then:function(i){a.push(i)}}}return qh++,t.then(lb,lb),t}function lb(){if(--qh===0&&(ws=null,ks!==null)){rr!==null&&(rr.status="fulfilled");var e=ks;ks=null,eo=0,rr=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function YN(e,t){var a=[],i={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(i.status="rejected",i.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),i}var cb=te.S;te.S=function(e,t){if(Cw=ha(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&GN(e,t),ws!==null)for(var a=wr;a!==null;)sb(a,ws),a=a.next;if(a=e.types,a!==null){for(var i=wr;i!==null;)sb(i,a),i=i.next;if(eo!==0){i=ws,i===null&&(i=ws=[]);for(var o=0;o<a.length;o++){var s=a[o];i.indexOf(s)===-1&&i.push(s)}}}cb!==null&&cb(e,t)};var Zi=pn(null);function Ym(){var e=Zi.current;return e!==null?e:Be.pooledCache}function kc(e,t){t===null?Ze(Zi,Zi.current):Ze(Zi,t.pool)}function dy(){var e=Ym();return e===null?null:{parent:ut._currentValue,pool:e}}var Cr=Error(M(460)),Xm=Error(M(474)),$u=Error(M(542)),Zc={then:function(){}};function ub(e){return e=e.status,e==="fulfilled"||e==="rejected"}function hy(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(ln,ln),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,hb(e),e===void 0&&!("reason"in t)?Error(M(600)):e;default:if(typeof t.status=="string")t.then(ln,ln);else{if(e=Be,e!==null&&100<e.shellSuspendCounter)throw Error(M(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=i}},function(i){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,hb(e),e}throw Ki=t,Cr}}function Li(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Ki=a,Cr):a}}var Ki=null;function db(){if(Ki===null)throw Error(M(459));var e=Ki;return Ki=null,e}function hb(e){if(e===Cr||e===$u)throw Error(M(483))}var sr=null,Bs=0;function sc(e){var t=Bs;return Bs+=1,sr===null&&(sr=[]),hy(sr,e,t)}function Jn(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function lc(e,t){throw t.$$typeof===kx?Error(M(525)):(e=Object.prototype.toString.call(t),Error(M(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function my(e){function t(w,y){if(e){var v=w.deletions;v===null?(w.deletions=[y],w.flags|=16):v.push(y)}}function a(w,y){if(!e)return null;for(;y!==null;)t(w,y),y=y.sibling;return null}function i(w){for(var y=new Map;w!==null;)w.key===null?y.set(w.index,w):y.set(w.key,w),w=w.sibling;return y}function o(w,y){return w=Rn(w,y),w.index=0,w.sibling=null,w}function s(w,y,v){return w.index=v,e?(v=w.alternate,v!==null?(v=v.index,v<y?(w.flags|=2,y):v):(w.flags|=134217730,y)):(w.flags|=1048576,y)}function c(w){return e&&w.alternate===null&&(w.flags|=134217730),w}function d(w,y,v,k){return y===null||y.tag!==6?(y=Wd(v,w.mode,k),y.return=w,y):(y=o(y,v),y.return=w,y)}function h(w,y,v,k){var O=v.type;return O===Xo?(w=$(w,y,v.props.children,k,v.key),Jn(w,v),w):y!==null&&(y.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Wn&&Li(O)===y.type)?(y=o(y,v.props),Jn(y,v),y.return=w,y):(y=Nc(v.type,v.key,v.props,null,w.mode,k),Jn(y,v),y.return=w,y)}function f(w,y,v,k){return y===null||y.tag!==4||y.stateNode.containerInfo!==v.containerInfo||y.stateNode.implementation!==v.implementation?(y=eh(v,w.mode,k),y.return=w,y):(y=o(y,v.children||[]),y.return=w,y)}function $(w,y,v,k,O){return y===null||y.tag!==7?(y=Qi(v,w.mode,k,O),y.return=w,y):(y=o(y,v),y.return=w,y)}function x(w,y,v){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return y=Wd(""+y,w.mode,v),y.return=w,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Fl:return v=Nc(y.type,y.key,y.props,null,w.mode,v),Jn(v,y),v.return=w,v;case bs:return y=eh(y,w.mode,v),y.return=w,y;case Wn:return y=Li(y),x(w,y,v)}if(vs(y)||ds(y))return y=Qi(y,w.mode,v,null),y.return=w,y;if(typeof y.then=="function")return x(w,sc(y),v);if(y.$$typeof===sn)return x(w,rc(w,y),v);lc(w,y)}return null}function g(w,y,v,k){var O=y!==null?y.key:null;if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return O!==null?null:d(w,y,""+v,k);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Fl:return v.key===O?h(w,y,v,k):null;case bs:return v.key===O?f(w,y,v,k):null;case Wn:return v=Li(v),g(w,y,v,k)}if(vs(v)||ds(v))return O!==null?null:$(w,y,v,k,null);if(typeof v.then=="function")return g(w,y,sc(v),k);if(v.$$typeof===sn)return g(w,y,rc(w,v),k);lc(w,v)}return null}function b(w,y,v,k,O){if(typeof k=="string"&&k!==""||typeof k=="number"||typeof k=="bigint")return w=w.get(v)||null,d(y,w,""+k,O);if(typeof k=="object"&&k!==null){switch(k.$$typeof){case Fl:return w=w.get(k.key===null?v:k.key)||null,h(y,w,k,O);case bs:return w=w.get(k.key===null?v:k.key)||null,f(y,w,k,O);case Wn:return k=Li(k),b(w,y,v,k,O)}if(vs(k)||ds(k))return w=w.get(v)||null,$(y,w,k,O,null);if(typeof k.then=="function")return b(w,y,v,sc(k),O);if(k.$$typeof===sn)return b(w,y,v,rc(y,k),O);lc(y,k)}return null}function C(w,y,v,k){for(var O=null,F=null,H=y,L=y=0,be=null;H!==null&&L<v.length;L++){H.index>L?(be=H,H=null):be=H.sibling;var J=g(w,H,v[L],k);if(J===null){H===null&&(H=be);break}e&&H&&J.alternate===null&&t(w,H),y=s(J,y,L),F===null?O=J:F.sibling=J,F=J,H=be}if(L===v.length)return a(w,H),pe&&zn(w,L),O;if(H===null){for(;L<v.length;L++)H=x(w,v[L],k),H!==null&&(y=s(H,y,L),F===null?O=H:F.sibling=H,F=H);return pe&&zn(w,L),O}for(H=i(H);L<v.length;L++)be=b(H,w,L,v[L],k),be!==null&&(e&&(J=be.alternate,J!==null&&H.delete(J.key===null?L:J.key)),y=s(be,y,L),F===null?O=be:F.sibling=be,F=be);return e&&H.forEach(function(Ve){return t(w,Ve)}),pe&&zn(w,L),O}function E(w,y,v,k){if(v==null)throw Error(M(151));for(var O=null,F=null,H=y,L=y=0,be=null,J=v.next();H!==null&&!J.done;L++,J=v.next()){H.index>L?(be=H,H=null):be=H.sibling;var Ve=g(w,H,J.value,k);if(Ve===null){H===null&&(H=be);break}e&&H&&Ve.alternate===null&&t(w,H),y=s(Ve,y,L),F===null?O=Ve:F.sibling=Ve,F=Ve,H=be}if(J.done)return a(w,H),pe&&zn(w,L),O;if(H===null){for(;!J.done;L++,J=v.next())J=x(w,J.value,k),J!==null&&(y=s(J,y,L),F===null?O=J:F.sibling=J,F=J);return pe&&zn(w,L),O}for(H=i(H);!J.done;L++,J=v.next())J=b(H,w,L,J.value,k),J!==null&&(e&&(be=J.alternate,be!==null&&H.delete(be.key===null?L:be.key)),y=s(J,y,L),F===null?O=J:F.sibling=J,F=J);return e&&H.forEach(function(Ae){return t(w,Ae)}),pe&&zn(w,L),O}function R(w,y,v,k){if(typeof v=="object"&&v!==null&&v.type===Xo&&v.key===null&&v.props.ref===void 0&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case Fl:e:{for(var O=v.key;y!==null;){if(y.key===O){if(O=v.type,O===Xo){if(y.tag===7){a(w,y.sibling),k=o(y,v.props.children),Jn(k,v),k.return=w,w=k;break e}}else if(y.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Wn&&Li(O)===y.type){a(w,y.sibling),k=o(y,v.props),Jn(k,v),k.return=w,w=k;break e}a(w,y);break}else t(w,y);y=y.sibling}v.type===Xo?(k=Qi(v.props.children,w.mode,k,v.key),Jn(k,v),k.return=w,w=k):(k=Nc(v.type,v.key,v.props,null,w.mode,k),Jn(k,v),k.return=w,w=k)}return c(w);case bs:e:{for(O=v.key;y!==null;){if(y.key===O)if(y.tag===4&&y.stateNode.containerInfo===v.containerInfo&&y.stateNode.implementation===v.implementation){a(w,y.sibling),k=o(y,v.children||[]),k.return=w,w=k;break e}else{a(w,y);break}else t(w,y);y=y.sibling}k=eh(v,w.mode,k),k.return=w,w=k}return c(w);case Wn:return v=Li(v),R(w,y,v,k)}if(vs(v))return C(w,y,v,k);if(ds(v)){if(O=ds(v),typeof O!="function")throw Error(M(150));return v=O.call(v),E(w,y,v,k)}if(typeof v.then=="function")return R(w,y,sc(v),k);if(v.$$typeof===sn)return R(w,y,rc(w,v),k);lc(w,v)}return typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint"?(v=""+v,y!==null&&y.tag===6?(a(w,y.sibling),k=o(y,v),k.return=w,w=k):(a(w,y),k=Wd(v,w.mode,k),k.return=w,w=k),c(w)):a(w,y)}return function(w,y,v,k){try{Bs=0;var O=R(w,y,v,k);return sr=null,O}catch(H){if(H===Cr||H===$u)throw H;var F=Wt(29,H,null,w.mode);return F.lanes=k,F.return=w,F}}}var to=my(!0),py=my(!1),ei=!1;function Qm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Bh(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function ui(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function di(e,t,a){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(ke&2)!==0){var o=i.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),i.pending=t,t=Gc(e),oy(e,null,a),t}return yu(e,i,t,a),Gc(e)}function Ts(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Rv(e,a)}}function ah(e,t){var a=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,a===i)){var o=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?o=s=c:s=s.next=c,a=a.next}while(a!==null);s===null?o=s=t:s=s.next=t}else o=s=t;a={baseState:i.baseState,firstBaseUpdate:o,lastBaseUpdate:s,shared:i.shared,callbacks:i.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var Lh=!1;function Es(){if(Lh){var e=rr;if(e!==null)throw e}}function Cs(e,t,a,i){Lh=!1;var o=e.updateQueue;ei=!1;var s=o.firstBaseUpdate,c=o.lastBaseUpdate,d=o.shared.pending;if(d!==null){o.shared.pending=null;var h=d,f=h.next;h.next=null,c===null?s=f:c.next=f,c=h;var $=e.alternate;$!==null&&($=$.updateQueue,d=$.lastBaseUpdate,d!==c&&(d===null?$.firstBaseUpdate=f:d.next=f,$.lastBaseUpdate=h))}if(s!==null){var x=o.baseState;c=0,$=f=h=null,d=s;do{var g=d.lane&-536870913,b=g!==d.lane;if(b?(ve&g)===g:(i&g)===g){g!==0&&g===eo&&(Lh=!0),$!==null&&($=$.next={lane:0,tag:d.tag,payload:d.payload,callback:null,next:null});e:{var C=e,E=d;g=t;var R=a;switch(E.tag){case 1:if(C=E.payload,typeof C=="function"){x=C.call(R,x,g);break e}x=C;break e;case 3:C.flags=C.flags&-65537|128;case 0:if(C=E.payload,g=typeof C=="function"?C.call(R,x,g):C,g==null)break e;x=Le({},x,g);break e;case 2:ei=!0}}g=d.callback,g!==null&&(e.flags|=64,b&&(e.flags|=8192),b=o.callbacks,b===null?o.callbacks=[g]:b.push(g))}else b={lane:g,tag:d.tag,payload:d.payload,callback:d.callback,next:null},$===null?(f=$=b,h=x):$=$.next=b,c|=g;if(d=d.next,d===null){if(d=o.shared.pending,d===null)break;b=d,d=b.next,b.next=null,o.lastBaseUpdate=b,o.shared.pending=null}}while(!0);$===null&&(h=x),o.baseState=h,o.firstBaseUpdate=f,o.lastBaseUpdate=$,s===null&&(o.shared.lanes=0),xi|=c,e.lanes=c,e.memoizedState=x}}function gy(e,t){if(typeof e!="function")throw Error(M(191,e));e.call(t)}function fy(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)gy(a[e],t)}var wi=pn(null),Kc=pn(0);function mb(e,t){e=Hn,Ze(Kc,e),Ze(wi,t),Hn=e|t.baseLanes}function jh(){Ze(Kc,Hn),Ze(wi,wi.current)}function Zm(){Hn=Kc.current,At(wi),At(Kc)}var Ot=pn(null),It=null;function hi(e){var t=e.alternate;Ze(Rt,Rt.current&1),Ze(Ot,e),It===null&&(t===null||wi.current!==null||t.memoizedState!==null)&&(It=e)}function Gh(e){Ze(Rt,Rt.current),Ze(Ot,e),It===null&&(It=e)}function by(e){e.tag===22?(Ze(Rt,Rt.current),Ze(Ot,e),It===null&&(It=e)):mi()}function mi(){Ze(Rt,Rt.current),Ze(Ot,Ot.current)}function ca(e){At(Ot),It===e&&(It=null),At(Rt)}var Rt=pn(0);function Ls(e,t){Ze(Ot,Ot.current),Ze(Rt,t)}function Km(e){At(Rt),At(Ot),It===e&&(It=null)}function Jc(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Sm(a)||xp(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Dn=0,de=null,Ie=null,ct=null,Pc=!1,lr=!1,ao=!1,Fc=0,js=0,cr=null,XN=0;function nt(){throw Error(M(321))}function Jm(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!fa(e[a],t[a]))return!1;return!0}function Pm(e,t,a,i,o,s){return Dn=s,de=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,te.H=e===null||e.memoizedState===null?Zy:Ky,ao=!1,s=a(i,o),ao=!1,lr&&(s=yy(t,a,i,o)),vy(e),s}function vy(e){te.H=Wc;var t=Ie!==null&&Ie.next!==null;if(Dn=0,ct=Ie=de=null,Pc=!1,js=0,cr=null,t)throw Error(M(300));e===null||dt||(e=e.dependencies,e!==null&&Qc(e)&&(dt=!0))}function yy(e,t,a,i){de=e;var o=0;do{if(lr&&(cr=null),js=0,lr=!1,25<=o)throw Error(M(301));if(o+=1,ct=Ie=null,e.updateQueue!=null){var s=e.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}te.H=e5,s=t(a,i)}while(lr);return s}function QN(){var e=te.H,t=e.useState()[0];return t=typeof t.then=="function"?il(t):t,e=e.useState()[0],(Ie!==null?Ie.memoizedState:null)!==e&&(de.flags|=1024),t}function Fm(){var e=Fc!==0;return Fc=0,e}function Wm(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function ep(e){if(Pc){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Pc=!1}Dn=0,ct=Ie=de=null,lr=!1,js=Fc=0,cr=null}function Xt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ct===null?de.memoizedState=ct=e:ct=ct.next=e,ct}function ot(){if(Ie===null){var e=de.alternate;e=e!==null?e.memoizedState:null}else e=Ie.next;var t=ct===null?de.memoizedState:ct.next;if(t!==null)ct=t,Ie=e;else{if(e===null)throw de.alternate===null?Error(M(467)):Error(M(310));Ie=e,e={memoizedState:Ie.memoizedState,baseState:Ie.baseState,baseQueue:Ie.baseQueue,queue:Ie.queue,next:null},ct===null?de.memoizedState=ct=e:ct=ct.next=e}return ct}function xu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function il(e){var t=js;return js+=1,cr===null&&(cr=[]),e=hy(cr,e,t),t=de,(ct===null?t.memoizedState:ct.next)===null&&(t=t.alternate,te.H=t===null||t.memoizedState===null?Zy:Ky),e}function Nu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return il(e);if(e.$$typeof===Cx)return;if(e.$$typeof===sn)return zt(e)}throw Error(M(438,String(e)))}function tp(e){var t=null,a=de.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var i=de.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=xu(),de.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),i=0;i<e;i++)a[i]=Ex;return t.index++,a}function _n(e,t){return typeof t=="function"?t(e):t}function Tc(e){var t=ot();return ap(t,Ie,e)}function ap(e,t,a){var i=e.queue;if(i===null)throw Error(M(311));i.lastRenderedReducer=a;var o=e.baseQueue,s=i.pending;if(s!==null){if(o!==null){var c=o.next;o.next=s.next,s.next=c}t.baseQueue=o=s,i.pending=null}if(s=e.baseState,o===null)e.memoizedState=s;else{t=o.next;var d=c=null,h=null,f=t,$=!1;do{var x=f.lane&-536870913;if(x!==f.lane?(ve&x)===x:(Dn&x)===x){var g=f.revertLane;if(g===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null}),x===eo&&($=!0);else if((Dn&g)===g){f=f.next,g===eo&&($=!0);continue}else x={lane:0,revertLane:f.revertLane,gesture:null,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},h===null?(d=h=x,c=s):h=h.next=x,de.lanes|=g,xi|=g;x=f.action,ao&&a(s,x),s=f.hasEagerState?f.eagerState:a(s,x)}else g={lane:x,revertLane:f.revertLane,gesture:f.gesture,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null},h===null?(d=h=g,c=s):h=h.next=g,de.lanes|=x,xi|=x;f=f.next}while(f!==null&&f!==t);if(h===null?c=s:h.next=d,!fa(s,e.memoizedState)&&(dt=!0,$&&(a=rr,a!==null)))throw a;e.memoizedState=s,e.baseState=c,e.baseQueue=h,i.lastRenderedState=s}return o===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function nh(e){var t=ot(),a=t.queue;if(a===null)throw Error(M(311));a.lastRenderedReducer=e;var i=a.dispatch,o=a.pending,s=t.memoizedState;if(o!==null){a.pending=null;var c=o=o.next;do s=e(s,c.action),c=c.next;while(c!==o);fa(s,t.memoizedState)||(dt=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),a.lastRenderedState=s}return[s,i]}function wy(e,t,a){var i=de,o=ot(),s=pe;if(s){if(a===void 0)throw Error(M(407));a=a()}else a=t();var c=!fa((Ie||o).memoizedState,a);if(c&&(o.memoizedState=a,dt=!0),o=o.queue,np(Ny.bind(null,i,o,e),[e]),e=o.getSnapshot!==t||c||ct!==null&&(ct.memoizedState.tag&1)!==0,fr(e?9:8,{destroy:void 0},xy.bind(null,i,o,a,t),null),e){if(i.flags|=2048,Be===null)throw Error(M(349));s||(Dn&127)!==0||$y(i,t,a)}return a}function $y(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=de.updateQueue,t===null?(t=xu(),de.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function xy(e,t,a,i){t.value=a,t.getSnapshot=i,Sy(t)&&ky(e)}function Ny(e,t,a){return a(function(){Sy(t)&&ky(e)})}function Sy(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!fa(e,a)}catch{return!0}}function ky(e){var t=lo(e,2);t!==null&&ea(t,e,2)}function Yh(e){var t=Xt();if(typeof e=="function"){var a=e;if(e=a(),ao){ai(!0);try{a()}finally{ai(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:_n,lastRenderedState:e},t}function Ty(e,t,a,i){return e.baseState=a,ap(e,Ie,typeof i=="function"?i:_n)}function ZN(e,t,a,i,o){if(ku(e))throw Error(M(485));if(e=t.action,e!==null){var s={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){s.listeners.push(c)}};te.T!==null?a(!0):s.isTransition=!1,i(s),a=t.pending,a===null?(s.next=t.pending=s,Ey(t,s)):(s.next=a.next,t.pending=a.next=s)}}function Ey(e,t){var a=t.action,i=t.payload,o=e.state;if(t.isTransition){var s=te.T,c={};c.types=s!==null?s.types:null,te.T=c;try{var d=a(o,i),h=te.S;h!==null&&h(c,d),pb(e,t,d)}catch(f){Xh(e,t,f)}finally{s!==null&&c.types!==null&&(s.types=c.types),te.T=s}}else try{s=a(o,i),pb(e,t,s)}catch(f){Xh(e,t,f)}}function pb(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(i){gb(e,t,i)},function(i){return Xh(e,t,i)}):gb(e,t,a)}function gb(e,t,a){t.status="fulfilled",t.value=a,Cy(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,Ey(e,a)))}function Xh(e,t,a){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=a,Cy(t),t=t.next;while(t!==i)}e.action=null}function Cy(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function zy(e,t){return t}function fb(e,t){if(pe){var a=Be.formState;if(a!==null){e:{var i=de;if(pe){if(Qe){t:{for(var o=Qe,s=za;o.nodeType!==8;){if(!s){o=null;break t}if(o=Aa(o.nextSibling),o===null){o=null;break t}}s=o.data,o=s==="F!"||s==="F"?o:null}if(o){Qe=Aa(o.nextSibling),i=o.data==="F!";break e}}yi(i)}i=!1}i&&(t=a[0])}}return a=Xt(),a.memoizedState=a.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:zy,lastRenderedState:t},a.queue=i,a=Yy.bind(null,de,i),i.dispatch=a,i=Yh(!1),s=sp.bind(null,de,!1,i.queue),i=Xt(),o={state:t,dispatch:null,action:e,pending:null},i.queue=o,a=ZN.bind(null,de,o,s,a),o.dispatch=a,i.memoizedState=e,[t,a,!1]}function bb(e){var t=ot();return Ay(t,Ie,e)}function Ay(e,t,a){if(t=ap(e,t,zy)[0],e=Tc(_n)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=il(t)}catch(c){throw c===Cr?$u:c}else i=t;t=ot();var o=t.queue,s=o.dispatch;return a!==t.memoizedState&&(de.flags|=2048,fr(9,{destroy:void 0},KN.bind(null,o,a),null)),[i,s,e]}function KN(e,t){e.action=t}function vb(e){var t=ot(),a=Ie;if(a!==null)return Ay(t,a,e);ot(),t=t.memoizedState,a=ot();var i=a.queue.dispatch;return a.memoizedState=e,[t,i,!1]}function fr(e,t,a,i){return e={tag:e,create:a,deps:i,inst:t,next:null},t=de.updateQueue,t===null&&(t=xu(),de.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(i=a.next,a.next=e,e.next=i,t.lastEffect=e),e}function Ry(){return ot().memoizedState}function Ec(e,t,a,i){var o=Xt();de.flags|=e,o.memoizedState=fr(1|t,{destroy:void 0},a,i===void 0?null:i)}function Su(e,t,a,i){var o=ot();i=i===void 0?null:i;var s=o.memoizedState.inst;Ie!==null&&i!==null&&Jm(i,Ie.memoizedState.deps)?o.memoizedState=fr(t,s,a,i):(de.flags|=e,o.memoizedState=fr(1|t,s,a,i))}function yb(e,t){Ec(8390656,8,e,t)}function np(e,t){Su(2048,8,e,t)}function JN(e){de.flags|=4;var t=de.updateQueue;if(t===null)t=xu(),de.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function My(e){var t=ot().memoizedState;return JN({ref:t,nextImpl:e}),function(){if((ke&2)!==0)throw Error(M(440));return t.impl.apply(void 0,arguments)}}function Oy(e,t){return Su(4,2,e,t)}function Vy(e,t){return Su(4,4,e,t)}function Dy(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function _y(e,t,a){a=a!=null?a.concat([e]):null,Su(4,4,Dy.bind(null,t,e),a)}function ip(){}function Iy(e,t){var a=ot();t=t===void 0?null:t;var i=a.memoizedState;return t!==null&&Jm(t,i[1])?i[0]:(a.memoizedState=[e,t],e)}function Hy(e,t){var a=ot();t=t===void 0?null:t;var i=a.memoizedState;if(t!==null&&Jm(t,i[1]))return i[0];if(i=e(),ao){ai(!0);try{e()}finally{ai(!1)}}return a.memoizedState=[i,t],i}function op(e,t,a){return a===void 0||(Dn&1073741824)!==0&&(ve&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=Aw(),de.lanes|=e,xi|=e,a)}function Uy(e,t,a,i){return fa(a,t)?a:wi.current!==null?(e=op(e,a,i),fa(e,t)||(dt=!0),e):(Dn&106)===0||(Dn&1073741824)!==0&&(ve&261930)===0?(dt=!0,e.memoizedState=a):(e=Aw(),de.lanes|=e,xi|=e,t)}function qy(e,t,a,i,o){var s=Te.p;Te.p=s!==0&&8>s?s:8;var c=te.T,d={};d.types=c!==null?c.types:null,te.T=d,sp(e,!1,t,a);try{var h=o(),f=te.S;if(f!==null&&f(d,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var $=YN(h,i);zs(e,t,$,ga(e))}else zs(e,t,i,ga(e))}catch(x){zs(e,t,{then:function(){},status:"rejected",reason:x},ga())}finally{Te.p=s,c!==null&&d.types!==null&&(c.types=d.types),te.T=c}}function PN(){}function Qh(e,t,a,i){if(e.tag!==5)throw Error(M(476));var o=By(e).queue;qy(e,o,t,Xi,a===null?PN:function(){return Ly(e),a(i)})}function By(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Xi,baseState:Xi,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:_n,lastRenderedState:Xi},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:_n,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Ly(e){var t=By(e);t.next===null&&(t=e.alternate.memoizedState),zs(e,t.next.queue,{},ga())}function rp(){return zt(Nr)}function jy(){return ot().memoizedState}function Gy(){return ot().memoizedState}function FN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=ga();e=ui(a);var i=di(t,e,a);i!==null&&(ea(i,t,a),Ts(i,t,a)),t={cache:Gm()},e.payload=t;return}t=t.return}}function WN(e,t,a){var i=ga();a={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},ku(e)?Xy(t,a):(a=Bm(e,t,a,i),a!==null&&(ea(a,e,i),Qy(a,t,i)))}function Yy(e,t,a){var i=ga();zs(e,t,a,i)}function zs(e,t,a,i){var o={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(ku(e))Xy(t,o);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var c=t.lastRenderedState,d=s(c,a);if(o.hasEagerState=!0,o.eagerState=d,fa(d,c))return yu(e,t,o,0),Be===null&&vu(),!1}catch{}if(a=Bm(e,t,o,i),a!==null)return ea(a,e,i),Qy(a,t,i),!0}return!1}function sp(e,t,a,i){if(i={lane:2,revertLane:vp(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},ku(e)){if(t)throw Error(M(479))}else t=Bm(e,a,i,2),t!==null&&ea(t,e,2)}function ku(e){var t=e.alternate;return e===de||t!==null&&t===de}function Xy(e,t){lr=Pc=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Qy(e,t,a){if((a&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Rv(e,a)}}var Wc={readContext:zt,use:Nu,useCallback:nt,useContext:nt,useEffect:nt,useImperativeHandle:nt,useLayoutEffect:nt,useInsertionEffect:nt,useMemo:nt,useReducer:nt,useRef:nt,useState:nt,useDebugValue:nt,useDeferredValue:nt,useTransition:nt,useSyncExternalStore:nt,useId:nt,useHostTransitionStatus:nt,useFormState:nt,useActionState:nt,useOptimistic:nt,useMemoCache:nt,useCacheRefresh:nt,useEffectEvent:nt},Zy={readContext:zt,use:Nu,useCallback:function(e,t){return Xt().memoizedState=[e,t===void 0?null:t],e},useContext:zt,useEffect:yb,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,Ec(4194308,4,Dy.bind(null,t,e),a)},useLayoutEffect:function(e,t){return Ec(4194308,4,e,t)},useInsertionEffect:function(e,t){Ec(4,2,e,t)},useMemo:function(e,t){var a=Xt();t=t===void 0?null:t;var i=e();if(ao){ai(!0);try{e()}finally{ai(!1)}}return a.memoizedState=[i,t],i},useReducer:function(e,t,a){var i=Xt();if(a!==void 0){var o=a(t);if(ao){ai(!0);try{a(t)}finally{ai(!1)}}}else o=t;return i.memoizedState=i.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},i.queue=e,e=e.dispatch=WN.bind(null,de,e),[i.memoizedState,e]},useRef:function(e){var t=Xt();return e={current:e},t.memoizedState=e},useState:function(e){e=Yh(e);var t=e.queue,a=Yy.bind(null,de,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:ip,useDeferredValue:function(e,t){var a=Xt();return op(a,e,t)},useTransition:function(){var e=Yh(!1);return e=qy.bind(null,de,e.queue,!0,!1),Xt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var i=de,o=Xt();if(pe){if(a===void 0)throw Error(M(407));a=a()}else{if(a=t(),Be===null)throw Error(M(349));(ve&127)!==0||$y(i,t,a)}o.memoizedState=a;var s={value:a,getSnapshot:t};return o.queue=s,yb(Ny.bind(null,i,s,e),[e]),i.flags|=2048,fr(9,{destroy:void 0},xy.bind(null,i,s,a,t),null),a},useId:function(){var e=Xt(),t=Be.identifierPrefix;if(pe){var a=un,i=cn;a=(i&~(1<<32-pa(i)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Fc++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=XN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:rp,useFormState:fb,useActionState:fb,useOptimistic:function(e){var t=Xt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=sp.bind(null,de,!0,a),a.dispatch=t,[e,t]},useMemoCache:tp,useCacheRefresh:function(){return Xt().memoizedState=FN.bind(null,de)},useEffectEvent:function(e){var t=Xt(),a={impl:e};return t.memoizedState=a,function(){if((ke&2)!==0)throw Error(M(440));return a.impl.apply(void 0,arguments)}}},Ky={readContext:zt,use:Nu,useCallback:Iy,useContext:zt,useEffect:np,useImperativeHandle:_y,useInsertionEffect:Oy,useLayoutEffect:Vy,useMemo:Hy,useReducer:Tc,useRef:Ry,useState:function(){return Tc(_n)},useDebugValue:ip,useDeferredValue:function(e,t){var a=ot();return Uy(a,Ie.memoizedState,e,t)},useTransition:function(){var e=Tc(_n)[0],t=ot().memoizedState;return[typeof e=="boolean"?e:il(e),t]},useSyncExternalStore:wy,useId:jy,useHostTransitionStatus:rp,useFormState:bb,useActionState:bb,useOptimistic:function(e,t){var a=ot();return Ty(a,Ie,e,t)},useMemoCache:tp,useCacheRefresh:Gy,useEffectEvent:My},e5={readContext:zt,use:Nu,useCallback:Iy,useContext:zt,useEffect:np,useImperativeHandle:_y,useInsertionEffect:Oy,useLayoutEffect:Vy,useMemo:Hy,useReducer:nh,useRef:Ry,useState:function(){return nh(_n)},useDebugValue:ip,useDeferredValue:function(e,t){var a=ot();return Ie===null?op(a,e,t):Uy(a,Ie.memoizedState,e,t)},useTransition:function(){var e=nh(_n)[0],t=ot().memoizedState;return[typeof e=="boolean"?e:il(e),t]},useSyncExternalStore:wy,useId:jy,useHostTransitionStatus:rp,useFormState:vb,useActionState:vb,useOptimistic:function(e,t){var a=ot();return Ie!==null?Ty(a,Ie,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:tp,useCacheRefresh:Gy,useEffectEvent:My};function ih(e,t,a,i){t=e.memoizedState,a=a(i,t),a=a==null?t:Le({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Zh={enqueueSetState:function(e,t,a){e=e._reactInternals;var i=ga(),o=ui(i);o.payload=t,a!=null&&(o.callback=a),t=di(e,o,i),t!==null&&(ea(t,e,i),Ts(t,e,i))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var i=ga(),o=ui(i);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=di(e,o,i),t!==null&&(ea(t,e,i),Ts(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=ga(),i=ui(a);i.tag=2,t!=null&&(i.callback=t),t=di(e,i,a),t!==null&&(ea(t,e,a),Ts(t,e,a))}};function wb(e,t,a,i,o,s,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,s,c):t.prototype&&t.prototype.isPureReactComponent?!Hs(a,i)||!Hs(o,s):!0}function $b(e,t,a,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,i),t.state!==e&&Zh.enqueueReplaceState(t,t.state,null)}function no(e,t){var a=t;if("ref"in t){a={};for(var i in t)i!=="ref"&&(a[i]=t[i])}if(e=e.defaultProps){a===t&&(a=Le({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function Jy(e){jc(e)}function Py(e){console.error(e)}function Fy(e){jc(e)}function eu(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function xb(e,t,a){try{var i=e.onCaughtError;i(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function Kh(e,t,a){return a=ui(a),a.tag=3,a.payload={element:null},a.callback=function(){eu(e,t)},a}function Wy(e){return e=ui(e),e.tag=3,e}function ew(e,t,a,i){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var s=i.value;e.payload=function(){return o(s)},e.callback=function(){xb(t,a,i)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){xb(t,a,i),typeof o!="function"&&(pi===null?pi=new Set([this]):pi.add(this));var d=i.stack;this.componentDidCatch(i.value,{componentStack:d!==null?d:""})})}function t5(e,t,a,i,o){if(a.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=a.alternate,t!==null&&Fi(t,a,o,!0),a=Ot.current,a!==null){switch(a.tag){case 31:case 13:case 19:return It===null?lu():a.alternate===null&&it===0&&(it=3),a.flags&=-257,a.flags|=65536,a.lanes=o,i===Zc?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([i]):t.add(i),dh(e,i,o)),!1;case 22:return a.flags|=65536,i===Zc?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([i]):a.add(i)),dh(e,i,o)),!1}throw Error(M(435,a.tag))}return dh(e,i,o),lu(),!1}if(pe)return t=Ot.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,i!==Ih&&(e=Error(M(422),{cause:i}),qs(Ca(e,a)))):(i!==Ih&&(t=Error(M(423),{cause:i}),qs(Ca(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,i=Ca(i,a),o=Kh(e.stateNode,i,o),ah(e,o),it!==4&&(it=2)),!1;var s=Error(M(520),{cause:i});if(s=Ca(s,a),Os===null?Os=[s]:Os.push(s),it!==4&&(it=2),t===null)return!0;i=Ca(i,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=Kh(a.stateNode,i,e),ah(a,e),!1;case 1:if(t=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(pi===null||!pi.has(s))))return a.flags|=65536,o&=-o,a.lanes|=o,o=Wy(o),ew(o,e,a,i),ah(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var lp=Error(M(461)),dt=!1;function ht(e,t,a,i){t.child=e===null?py(t,null,a,i):to(t,e.child,a,i)}function Nb(e,t,a,i,o){a=a.render;var s=t.ref;if("ref"in i){var c={};for(var d in i)d!=="ref"&&(c[d]=i[d])}else c=i;return Wi(t),i=Pm(e,t,a,c,s,o),d=Fm(),e!==null&&!dt?(Wm(e,t,o),In(e,t,o)):(pe&&d&&wu(t),t.flags|=1,ht(e,t,i,o),t.child)}function Sb(e,t,a,i,o){if(e===null){var s=a.type;return typeof s=="function"&&!Lm(s)&&s.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=s,tw(e,t,s,i,o)):(e=Nc(a.type,null,i,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!up(e,o)){var c=s.memoizedProps;if(a=a.compare,a=a!==null?a:Hs,a(c,i)&&e.ref===t.ref)return In(e,t,o)}return t.flags|=1,e=Rn(s,i),e.ref=t.ref,e.return=t,t.child=e}function tw(e,t,a,i,o){if(e!==null){var s=e.memoizedProps;if(Hs(s,i)&&e.ref===t.ref)if(dt=!1,t.pendingProps=i=s,up(e,o))(e.flags&131072)!==0&&(dt=!0);else return t.lanes=e.lanes,In(e,t,o)}return Jh(e,t,a,i,o)}function aw(e,t,a,i){var o=i.children,s=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(s=s!==null?s.baseLanes|a:a,e!==null){for(i=t.child=e.child,o=0;i!==null;)o=o|i.lanes|i.childLanes,i=i.sibling;i=o&~s}else i=0,t.child=null;return kb(e,t,s,a,i)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&kc(t,s!==null?s.cachePool:null),s!==null?mb(t,s):jh(),by(t);else return i=t.lanes=536870912,kb(e,t,s!==null?s.baseLanes|a:a,a,i)}else s!==null?(kc(t,s.cachePool),mb(t,s),mi(),t.memoizedState=null):(e!==null&&kc(t,null),jh(),mi());return ht(e,t,o,a),t.child}function As(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function kb(e,t,a,i,o){var s=Ym();return s=s===null?null:{parent:ut._currentValue,pool:s},t.memoizedState={baseLanes:a,cachePool:s},e!==null&&kc(t,null),jh(),by(t),e!==null&&Fi(e,t,i,!0),t.childLanes=o,null}function Cc(e,t){return t=Tu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Tb(e,t,a){return to(t,e.child,null,a),e=Cc(t,t.pendingProps),e.flags|=2,ca(t),t.memoizedState=null,e}function a5(e,t,a){var i=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(pe){if(i.mode==="hidden")return e=Cc(t,i),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},As(null,e);if(Gh(t),(e=Qe)?(e=a0(e,za),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:vi!==null?{id:cn,overflow:un}:null,retryLane:536870912,hydrationErrors:null},a=sy(e),a.return=t,t.child=a,wt=t,Qe=null)):e=null,e===null)throw yi(t);return t.lanes=536870912,null}return Cc(t,i)}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(Gh(t),o)if(t.flags&256)t.flags&=-257,t=Tb(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(M(558));else if(dt||Fi(e,t,a,!1),o=(a&e.childLanes)!==0,dt||o){if(wi.current===null){if(i=Be,i!==null&&(c=Mv(i,a),c!==0&&c!==s.retryLane))throw s.retryLane=c,lo(e,c),ea(i,e,c),lp;lu()}t=Tb(e,t,a)}else e=s.treeContext,Qe=Aa(c.nextSibling),wt=t,pe=!0,ci=null,za=!1,e!==null&&cy(t,e),t=Cc(t,i),t.flags|=134221824;return t}return e=Rn(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Lo(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(M(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Jh(e,t,a,i,o){return Wi(t),a=Pm(e,t,a,i,void 0,o),i=Fm(),e!==null&&!dt?(Wm(e,t,o),In(e,t,o)):(pe&&i&&wu(t),t.flags|=1,ht(e,t,a,o),t.child)}function Eb(e,t,a,i,o,s){return Wi(t),t.updateQueue=null,a=yy(t,i,a,o),vy(e),i=Fm(),e!==null&&!dt?(Wm(e,t,s),In(e,t,s)):(pe&&i&&wu(t),t.flags|=1,ht(e,t,a,s),t.child)}function Cb(e,t,a,i,o){if(Wi(t),t.stateNode===null){var s=Wo,c=a.contextType;typeof c=="object"&&c!==null&&(s=zt(c)),s=new a(i,s),t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Zh,t.stateNode=s,s._reactInternals=t,s=t.stateNode,s.props=i,s.state=t.memoizedState,s.refs={},Qm(t),c=a.contextType,s.context=typeof c=="object"&&c!==null?zt(c):Wo,s.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(ih(t,a,c,i),s.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(c=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),c!==s.state&&Zh.enqueueReplaceState(s,s.state,null),Cs(t,i,s,o),Es(),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){s=t.stateNode;var d=t.memoizedProps,h=no(a,d);s.props=h;var f=s.context,$=a.contextType;c=Wo,typeof $=="object"&&$!==null&&(c=zt($));var x=a.getDerivedStateFromProps;$=typeof x=="function"||typeof s.getSnapshotBeforeUpdate=="function",d=t.pendingProps!==d,$||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(d||f!==c)&&$b(t,s,i,c),ei=!1;var g=t.memoizedState;s.state=g,Cs(t,i,s,o),Es(),f=t.memoizedState,d||g!==f||ei?(typeof x=="function"&&(ih(t,a,x,i),f=t.memoizedState),(h=ei||wb(t,a,h,i,g,f,c))?($||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=f),s.props=i,s.state=f,s.context=c,i=h):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{s=t.stateNode,Bh(e,t),c=t.memoizedProps,$=no(a,c),s.props=$,x=t.pendingProps,g=s.context,f=a.contextType,h=Wo,typeof f=="object"&&f!==null&&(h=zt(f)),d=a.getDerivedStateFromProps,(f=typeof d=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==x||g!==h)&&$b(t,s,i,h),ei=!1,g=t.memoizedState,s.state=g,Cs(t,i,s,o),Es();var b=t.memoizedState;c!==x||g!==b||ei||e!==null&&e.dependencies!==null&&Qc(e.dependencies)?(typeof d=="function"&&(ih(t,a,d,i),b=t.memoizedState),($=ei||wb(t,a,$,i,g,b,h)||e!==null&&e.dependencies!==null&&Qc(e.dependencies))?(f||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(i,b,h),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(i,b,h)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=b),s.props=i,s.state=b,s.context=h,i=$):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),i=!1)}return s=i,Lo(e,t),i=(t.flags&128)!==0,s||i?(s=t.stateNode,a=i&&typeof a.getDerivedStateFromError!="function"?null:s.render(),t.flags|=1,e!==null&&i?(t.child=to(t,e.child,null,o),t.child=to(t,null,a,o)):ht(e,t,a,o),t.memoizedState=s.state,e=t.child):e=In(e,t,o),e}function zb(e,t,a,i){return Pi(),t.flags|=256,ht(e,t,a,i),t.child}var Ph={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Fh(e){return{baseLanes:e,cachePool:dy()}}function Wh(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=da),e}function nw(e,t,a){var i=t.pendingProps,o=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(Rt.current&2)!==0),c&&(o=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(pe){if(o?hi(t):mi(),(e=Qe)?(e=a0(e,za),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:vi!==null?{id:cn,overflow:un}:null,retryLane:536870912,hydrationErrors:null},a=sy(e),a.return=t,t.child=a,wt=t,Qe=null)):e=null,e===null)throw yi(t);return xp(e)?t.lanes=32:t.lanes=536870912,null}return s=i.children,i=i.fallback,o?(mi(),o=t.mode,s=Tu({mode:"hidden",children:s},o),i=Qi(i,o,a,null),s.return=t,i.return=t,s.sibling=i,t.child=s,i=t.child,i.memoizedState=Fh(a),i.childLanes=Wh(e,c,a),t.memoizedState=Ph,As(null,i)):(hi(t),cp(t,s))}var d=e.memoizedState;if(d!==null){var h=d.dehydrated;if(h!==null)return n5(e,t,s,c,i,h,d,a)}return o?(mi(),o=i.fallback,s=t.mode,d=e.child,h=d.sibling,i=Rn(d,{mode:"hidden",children:i.children}),i.subtreeFlags=d.subtreeFlags&1206910976,h!==null?o=Rn(h,o):(o=Qi(o,s,a,null),o.flags|=2),o.return=t,i.return=t,i.sibling=o,t.child=i,As(null,i),i=t.child,o=e.child.memoizedState,o===null?o=Fh(a):(s=o.cachePool,s!==null?(d=ut._currentValue,s=s.parent!==d?{parent:d,pool:d}:s):s=dy(),o={baseLanes:o.baseLanes|a,cachePool:s}),i.memoizedState=o,i.childLanes=Wh(e,c,a),t.memoizedState=Ph,As(e.child,i)):(hi(t),a=e.child,e=a.sibling,a=Rn(a,{mode:"visible",children:i.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function cp(e,t){return t=Tu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Tu(e,t){return e=Wt(22,e,null,t),e.lanes=0,e}function cc(e,t,a){return to(t,e.child,null,a),e=cp(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function n5(e,t,a,i,o,s,c,d){if(a)return t.flags&256?(hi(t),t.flags&=-257,cc(e,t,d)):t.memoizedState!==null?(mi(),t.child=e.child,t.flags|=128,null):(mi(),s=o.fallback,c=t.mode,o=Tu({mode:"visible",children:o.children},c),s=Qi(s,c,d,null),s.flags|=2,o.return=t,s.return=t,o.sibling=s,t.child=o,to(t,e.child,null,d),o=t.child,o.memoizedState=Fh(d),o.childLanes=Wh(e,i,d),t.memoizedState=Ph,As(null,o));if(hi(t),xp(s)){if(i=s.nextSibling&&s.nextSibling.dataset,i)var h=i.dgst;return i=h,i!==""&&(o=Error(M(419)),o.stack="",o.digest=i,qs({value:o,source:null,stack:null})),cc(e,t,d)}if(dt||Fi(e,t,d,!1),i=(d&e.childLanes)!==0,dt||i){if(wi.current!==null)return cc(e,t,d);if(i=Be,i!==null&&(o=Mv(i,d),o!==0&&o!==c.retryLane))throw c.retryLane=o,lo(e,o),ea(i,e,o),lp;return Sm(s)||lu(),cc(e,t,d)}return Sm(s)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,Qe=Aa(s.nextSibling),wt=t,pe=!0,ci=null,za=!1,e!==null&&cy(t,e),t=cp(t,o.children),t.flags|=134221824,t)}function Ab(e,t,a){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),Sc(e.return,t,a)}function Rb(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Jc(a)===null&&(t=e),e=e.sibling}return t}function uc(e,t,a,i,o,s){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:a,tailMode:o,treeForkCount:s}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=i,c.tail=a,c.tailMode=o,c.treeForkCount=s)}function oh(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function em(e,t,a){var i=t.pendingProps,o=i.revealOrder,s=i.tail;i=i.children;var c=Rt.current;if(t.flags&128)return Ls(t,c),null;var d=(c&2)!==0;if(d?(c=c&1|2,t.flags|=128):c&=1,Ls(t,c),o==="backwards"&&e!==null?(oh(e),ht(e,t,i,a),oh(e)):ht(e,t,i,a),i=pe?Us:0,!d&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Ab(e,a,t);else if(e.tag===19)Ab(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=Rb(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,oh(t)),uc(t,!0,o,null,s,i);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&Jc(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}uc(t,!0,a,null,s,i);break;case"together":uc(t,!1,null,null,void 0,i);break;case"independent":t.memoizedState=null;break;default:a=Rb(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),uc(t,!1,o,a,s,i)}return t.child}function Mb(e,t,a){var i=t.pendingProps;return ii(t,t.type,i.value),ht(e,t,i.children,a),t.child}function In(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),xi|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Fi(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(M(153));if(t.child!==null){for(e=t.child,a=Rn(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=Rn(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function up(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Qc(e)))}function i5(e,t,a){switch(t.tag){case 3:Uc(t,t.stateNode.containerInfo),ii(t,ut,e.memoizedState.cache),Pi();break;case 27:case 5:Eh(t);break;case 4:Uc(t,t.stateNode.containerInfo);break;case 10:ii(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Gh(t),null;break;case 13:var i=t.memoizedState;if(i!==null){if(i.dehydrated!==null)return hi(t),t.flags|=128,null;i=Fi(e,t,a,!1);var o=t.child.childLanes;return i||(a&o)!==0?nw(e,t,a):(hi(t),e=In(e,t,a),e!==null?e.sibling:null)}hi(t);break;case 19:if(t.flags&128)return em(e,t,a);if(o=(e.flags&128)!==0,i=(a&t.childLanes)!==0,i||(Fi(e,t,a,!1),i=(a&t.childLanes)!==0),o){if(i)return em(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),Ls(t,Rt.current),i)break;return null;case 22:return t.lanes=0,aw(e,t,a,t.pendingProps);case 24:ii(t,ut,e.memoizedState.cache)}return In(e,t,a)}function iw(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)dt=!0;else{if(!up(e,a)&&(t.flags&128)===0)return dt=!1,i5(e,t,a);dt=(e.flags&131072)!==0}else dt=!1,pe&&(t.flags&1048576)!==0&&ly(t,Us,t.index);switch(t.lanes=0,t.tag){case 16:e:{var i=t.pendingProps;if(e=Li(t.elementType),t.type=e,typeof e=="function")Lm(e)?(i=no(e,i),t.tag=1,t=Cb(null,t,e,i,a)):(t.tag=0,t=Jh(null,t,e,i,a));else{if(e!=null){var o=e.$$typeof;if(o===zm){t.tag=11,t=Nb(null,t,e,i,a);break e}else if(o===Am){t.tag=14,t=Sb(null,t,e,i,a);break e}else if(o===sn){t.tag=10,t.type=e,t=Mb(null,t,a);break e}}throw t=kh(e)||e,Error(M(306,t,""))}}return t;case 0:return Jh(e,t,t.type,t.pendingProps,a);case 1:return i=t.type,o=no(i,t.pendingProps),Cb(e,t,i,o,a);case 3:e:{if(Uc(t,t.stateNode.containerInfo),e===null)throw Error(M(387));i=t.pendingProps;var s=t.memoizedState;o=s.element,Bh(e,t),Cs(t,i,null,a);var c=t.memoizedState;if(i=c.cache,ii(t,ut,i),i!==s.cache&&Uh(t,[ut],a,!0),Es(),i=c.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){t=zb(e,t,i,a);break e}else if(i!==o){o=Ca(Error(M(424)),t),qs(o),t=zb(e,t,i,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Qe=Aa(e.firstChild),wt=t,pe=!0,ci=null,za=!0,a=py(t,null,i,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Pi(),i===o){t=In(e,t,a);break e}ht(e,t,i,a)}t=t.child}return t;case 26:return Lo(e,t),e===null?(a=ov(t.type,null,t.pendingProps,null))?t.memoizedState=a:pe||(t.stateNode=Qw(t.type,t.pendingProps,li.current,t)):t.memoizedState=ov(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Eh(t),e===null&&pe&&(i=t.stateNode=n0(t.type,t.pendingProps,li.current),wt=t,za=!0,o=Qe,Si(t.type)?(km=o,Qe=Aa(i.firstChild)):Qe=o),ht(e,t,t.pendingProps.children,a),Lo(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&pe&&((o=i=Qe)&&(i=J5(i,t.type,t.pendingProps,za),i!==null?(t.stateNode=i,wt=t,Qe=Aa(i.firstChild),za=!1,o=!0):o=!1),o||yi(t)),Eh(t),o=t.type,s=t.pendingProps,c=e!==null?e.memoizedProps:null,i=s.children,$m(o,s)?i=null:c!==null&&$m(o,c)&&(t.flags|=32),t.memoizedState!==null&&(o=Pm(e,t,QN,null,null,a),Nr._currentValue=o),Lo(e,t),ht(e,t,i,a),t.child;case 6:return e===null&&pe&&((e=a=Qe)&&(a=P5(a,t.pendingProps,za),a!==null?(t.stateNode=a,wt=t,Qe=null,e=!0):e=!1),e||yi(t)),null;case 13:return nw(e,t,a);case 4:return Uc(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=to(t,null,i,a):ht(e,t,i,a),t.child;case 11:return Nb(e,t,t.type,t.pendingProps,a);case 7:return i=t.pendingProps,Lo(e,t),ht(e,t,i,a),t.child;case 8:return ht(e,t,t.pendingProps.children,a),t.child;case 12:return ht(e,t,t.pendingProps.children,a),t.child;case 10:return Mb(e,t,a);case 9:return o=t.type._context,i=t.pendingProps.children,Wi(t),o=zt(o),i=i(o),t.flags|=1,ht(e,t,i,a),t.child;case 14:return Sb(e,t,t.type,t.pendingProps,a);case 15:return tw(e,t,t.type,t.pendingProps,a);case 19:return em(e,t,a);case 31:return a5(e,t,a);case 22:return aw(e,t,a,t.pendingProps);case 24:return Wi(t),i=zt(ut),e===null?(o=Ym(),o===null&&(o=Be,s=Gm(),o.pooledCache=s,s.refCount++,s!==null&&(o.pooledCacheLanes|=a),o=s),t.memoizedState={parent:i,cache:o},Qm(t),ii(t,ut,o)):((e.lanes&a)!==0&&(Bh(e,t),Cs(t,null,null,a),Es()),o=e.memoizedState,s=t.memoizedState,o.parent!==i?(o={parent:i,cache:i},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),ii(t,ut,i)):(i=s.cache,ii(t,ut,i),i!==o.cache&&Uh(t,[ut],a,!0))),ht(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),i=t.pendingProps,i.name!=null&&i.name!=="auto"?t.flags|=e===null?18882560:18874368:pe&&wu(t),e!==null&&e.memoizedProps.name!==i.name?t.flags|=4194816:Lo(e,t),ht(e,t,i.children,a),t.child;case 29:throw t.pendingProps}throw Error(M(156,t.tag))}function Cn(e){e.flags|=4}function rh(e,t,a,i,o){var s;if((s=(e.mode&32)!==0)&&(s=a===null?lv(t,i):lv(t,i)&&(i.src!==a.src||i.srcSet!==a.srcSet)),s){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(Ow())e.flags|=8192;else throw Ki=Zc,Xm}else e.flags&=-16777217}function Ob(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!s0(t))if(Ow())e.flags|=8192;else throw Ki=Zc,Xm}function dc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?zv():536870912,e.lanes|=t,br|=t)}function ms(e,t){if(!pe)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,i=null;a!==null;)a.alternate!==null&&(i=a),a=a.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function Xe(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,i=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,i|=o.subtreeFlags&1206910976,i|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,i|=o.subtreeFlags,i|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=i,e.childLanes=a,t}function o5(e,t,a){var i=t.pendingProps;switch(jm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Xe(t),null;case 1:return Xe(t),null;case 3:return a=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),Mn(ut),mr(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(qo(t)?Cn(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,th())),Xe(t),null;case 26:var o=t.type,s=t.memoizedState;return e===null?(Cn(t),s!==null?(Xe(t),Ob(t,s)):(Xe(t),rh(t,o,null,i,a))):s?s!==e.memoizedState?(Cn(t),Xe(t),Ob(t,s)):(Xe(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&Cn(t),Xe(t),rh(t,o,e,i,a)),null;case 27:if(qc(t),a=li.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Cn(t);else{if(!i){if(t.stateNode===null)throw Error(M(166));return Xe(t),t.subtreeFlags&=-33554433,null}e=dn.current,qo(t)?rb(t,e):(e=n0(o,i,a),t.stateNode=e,Cn(t))}return Xe(t),t.subtreeFlags&=-33554433,null;case 5:if(qc(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Cn(t);else{if(!i){if(t.stateNode===null)throw Error(M(166));return Xe(t),t.subtreeFlags&=-33554433,null}if(s=dn.current,qo(t))rb(t,s);else{var c=Xs(li.current);switch(s){case 1:s=c.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:s=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":s=c.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":s=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":s=c.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof i.is=="string"?c.createElement("select",{is:i.is}):c.createElement("select"),i.multiple?s.multiple=!0:i.size&&(s.size=i.size);break;default:s=typeof i.is=="string"?c.createElement(o,{is:i.is}):c.createElement(o)}}s[Ct]=t,s[aa]=i;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)s.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=s;e:switch(Mt(s,o,i),o){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}i&&Cn(t)}}return Xe(t),t.subtreeFlags&=-33554433,rh(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&Cn(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(M(166));if(e=li.current,qo(t)){if(e=t.stateNode,a=t.memoizedProps,i=null,o=wt,o!==null)switch(o.tag){case 27:case 5:i=o.memoizedProps}e[Ct]=t,e=!!(e.nodeValue===a||i!==null&&i.suppressHydrationWarning===!0||Yw(e.nodeValue,a)),e||yi(t,!0)}else e=Xs(e).createTextNode(i),e[Ct]=t,t.stateNode=e}return Xe(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(i=qo(t),a!==null){if(e===null){if(!i)throw Error(M(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(557));e[Ct]=t}else Pi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Xe(t),e=!1}else a=th(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(ca(t),t):(ca(t),null);if((t.flags&128)!==0)throw Error(M(558))}return Xe(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=qo(t),i!==null&&i.dehydrated!==null){if(e===null){if(!o)throw Error(M(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(M(317));o[Ct]=t}else Pi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Xe(t),o=!1}else o=th(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(ca(t),t):(ca(t),null)}return ca(t),(t.flags&128)!==0?(t.lanes=a,t):(a=i!==null,e=e!==null&&e.memoizedState!==null,a&&(i=t.child,o=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(o=i.alternate.memoizedState.cachePool.pool),s=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(s=i.memoizedState.cachePool.pool),s!==o&&(i.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),dc(t,t.updateQueue),Xe(t),null);case 4:return mr(),e===null&&yp(t.stateNode.containerInfo),t.flags|=67108864,Xe(t),null;case 10:return Mn(t.type),Xe(t),null;case 19:if(Km(t),i=t.memoizedState,i===null)return Xe(t),null;if(o=(t.flags&128)!==0,s=i.rendering,s===null)if(o)ms(i,!1);else{if(it!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=Jc(e),s!==null){for(t.flags|=128,ms(i,!1),e=s.updateQueue,t.updateQueue=e,dc(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)ry(a,e),a=a.sibling;return Ls(t,Rt.current&1|2),pe&&zn(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&ha()>ru&&(t.flags|=128,o=!0,ms(i,!1),t.lanes=4194304)}else{if(!o)if(e=Jc(s),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,dc(t,e),ms(i,!0),i.tail===null&&i.tailMode!=="collapsed"&&i.tailMode!=="visible"&&!s.alternate&&!pe)return Xe(t),null}else 2*ha()-i.renderingStartTime>ru&&a!==536870912&&(t.flags|=128,o=!0,ms(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(e=i.last,e!==null?e.sibling=s:t.child=s,i.last=s)}if(i.tail!==null){e=i.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return i.rendering=e,i.tail=e.sibling,i.renderingStartTime=ha(),e.sibling=null,s=Rt.current,s=o?s&1|2:s&1,i.tailMode==="visible"||i.tailMode==="collapsed"||!a||pe?Ls(t,s):(a=s,Ze(Ot,t),Ze(Rt,a),It===null&&(It=t)),pe&&zn(t,i.treeForkCount),e}return Xe(t),null;case 22:case 23:return ca(t),Zm(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(a&536870912)!==0&&(t.flags&128)===0&&(Xe(t),t.subtreeFlags&6&&(t.flags|=8192)):Xe(t),a=t.updateQueue,a!==null&&dc(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==a&&(t.flags|=2048),e!==null&&At(Zi),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Mn(ut),Xe(t),null;case 25:return null;case 30:return t.flags|=33554432,Xe(t),null}throw Error(M(156,t.tag))}function r5(e,t){switch(jm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Mn(ut),mr(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return qc(t),null;case 31:if(t.memoizedState!==null){if(ca(t),t.alternate===null)throw Error(M(340));Pi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(ca(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(M(340));Pi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Km(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return mr(),null;case 10:return Mn(t.type),null;case 22:case 23:return ca(t),Zm(),e!==null&&At(Zi),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Mn(ut),null;case 25:return null;default:return null}}function ow(e,t){switch(jm(t),t.tag){case 3:Mn(ut),mr();break;case 26:case 27:case 5:qc(t);break;case 4:mr();break;case 31:t.memoizedState!==null&&ca(t);break;case 13:ca(t);break;case 19:Km(t);break;case 10:Mn(t.type);break;case 22:case 23:ca(t),Zm(),e!==null&&At(Zi);break;case 24:Mn(ut)}}function ol(e,t){try{var a=t.updateQueue,i=a!==null?a.lastEffect:null;if(i!==null){var o=i.next;a=o;do{if((a.tag&e)===e){i=void 0;var s=a.create,c=a.inst;i=s(),c.destroy=i}a=a.next}while(a!==o)}}catch(d){Oe(t,t.return,d)}}function $i(e,t,a){try{var i=t.updateQueue,o=i!==null?i.lastEffect:null;if(o!==null){var s=o.next;i=s;do{if((i.tag&e)===e){var c=i.inst,d=c.destroy;if(d!==void 0){c.destroy=void 0,o=t;var h=a,f=d;try{f()}catch($){Oe(o,h,$)}}}i=i.next}while(i!==s)}}catch($){Oe(t,t.return,$)}}function rw(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{fy(t,a)}catch(i){Oe(e,e.return,i)}}}function sw(e,t,a){a.props=no(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(i){Oe(e,t,i)}}function on(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:var o=e.stateNode,s=Vn(e.memoizedProps,o);(o.ref===null||o.ref.name!==s)&&(o.ref=Pw(s)),i=o.ref;break;case 7:if(e.stateNode===null){var c=new ba(e);ta(e.child,!1,Z5,c,void 0,void 0),e.stateNode=c}i=e.stateNode;break;default:i=e.stateNode}typeof a=="function"?e.refCleanup=a(i):a.current=i}}catch(d){Oe(e,t,d)}}function Et(e,t){var a=e.ref,i=e.refCleanup;if(a!==null)if(typeof i=="function")try{i()}catch(o){Oe(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){Oe(e,t,o)}else a.current=null}function tu(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)t0(e.stateNode,t[a])}function Vb(e){for(var t=e.return;t!==null&&(hp(t)&&t0(e.stateNode,t.stateNode),!dp(t));)t=t.return}function Rs(e){for(var t=e.return;t!==null&&(hp(t)&&K5(e.stateNode,t.stateNode),!dp(t));)t=t.return}function dp(e){return e.tag===5||e.tag===3||e.tag===27}function hp(e){return e&&e.tag===7&&e.stateNode!==null}function tm(e){var t=e.type,a=e.memoizedProps,i=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&i.focus();break e;case"img":a.src?i.src=a.src:a.srcSet&&(i.srcset=a.srcSet)}}catch(o){Oe(e,e.return,o)}}function sh(e,t,a){try{var i=e.stateNode;A5(i,e.type,a,t),i[aa]=t}catch(o){Oe(e,e.return,o)}}function lw(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Si(e.type)||e.tag===4}function lh(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||lw(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Si(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function am(e,t,a,i){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=ln)),tu(e,i),Ne=!0;else if(o!==4&&(o===27&&(tu(e,i),i=null,Si(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(am(e,t,a,i),e=e.sibling;e!==null;)am(e,t,a,i),e=e.sibling}function au(e,t,a,i){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),tu(e,i),Ne=!0;else if(o!==4&&(o===27&&(tu(e,i),i=null,Si(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(au(e,t,a,i),e=e.sibling;e!==null;)au(e,t,a,i),e=e.sibling}function cw(e){var t=e.stateNode,a=e.memoizedProps;try{for(var i=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);Mt(t,i,a),t[Ct]=e,t[aa]=a}catch(s){Oe(e,e.return,s)}}var nu=!1,ua=null;function Db(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(nu=!0)}var rn=null;function _b(){var e=rn;return rn=null,e}var Ft=0;function zr(e,t,a,i,o){return Ft=0,uw(e.child,t,a,i,o)}function uw(e,t,a,i,o){for(var s=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(i!==null){var d=xm(c);i.push(d),d.view&&(s=!0)}else s||xm(c).view&&(s=!0);nu=!0,Zw(c,Ft===0?t:t+"_"+Ft,a),Ft++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||uw(e.child,t,a,i,o)&&(s=!0));e=e.sibling}return s}function mn(e,t){for(;e!==null;)e.tag===5?Kw(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||mn(e.child,t)),e=e.sibling}function zc(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(zc(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(M(544));var a=t.name;t=qn(t.default,t.share),t!=="none"&&(zr(e,a,t,null,!1)||mn(e.child,!1))}e=e.sibling}}function nm(e,t){if(e.tag===30){var a=e.stateNode,i=e.memoizedProps,o=Vn(i,a),s=qn(i.default,a.paired?i.share:i.enter);s!=="none"?zr(e,o,s,null,!1)?(zc(e),a.paired||t||vr(e,i.onEnter)):mn(e.child,!1):zc(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)nm(e,t),e=e.sibling;else zc(e)}function im(e){if(ua!==null&&ua.size!==0){var t=ua;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,i=a.name;if(i!=null&&i!=="auto"){var o=t.get(i);if(o!==void 0){var s=qn(a.default,a.share);if(s!=="none"&&(zr(e,i,s,null,!1)?(s=e.stateNode,o.paired=s,s.paired=o,vr(e,a.onShare)):mn(e.child,!1)),t.delete(i),t.size===0)break}}}im(e)}e=e.sibling}}}function om(e){if(e.tag===30){var t=e.memoizedProps,a=Vn(t,e.stateNode),i=ua!==null?ua.get(a):void 0,o=qn(t.default,i!==void 0?t.share:t.exit);o!=="none"&&(zr(e,a,o,null,!1)?i!==void 0?(o=e.stateNode,i.paired=o,o.paired=i,ua.delete(a),vr(e,t.onShare)):vr(e,t.onExit):mn(e.child,!1)),ua!==null&&im(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)om(e),e=e.sibling;else ua!==null&&im(e)}function dw(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=Vn(t,e.stateNode);t=qn(t.default,t.update),e.flags&=-5,t!=="none"&&zr(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&dw(e);e=e.sibling}}function rm(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,mn(e.child,!1))}rm(e)}e=e.sibling}}function Ac(e){if(e.tag===30)e.stateNode.paired=null,mn(e.child,!1),rm(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Ac(e),e=e.sibling;else rm(e)}function hw(e){for(e=e.child;e!==null;)e.tag===30?mn(e.child,!1):(e.subtreeFlags&33554432)!==0&&hw(e),e=e.sibling}function mp(e,t,a,i,o,s,c){for(var d=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(s!==null&&Ft<s.length){var f=s[Ft],$=xm(h);(f.view||$.view)&&(d=!0);var x;if(x=(e.flags&4)===0)if($.clip)x=!0;else{x=f.rect;var g=$.rect;x=x.y!==g.y||x.x!==g.x||x.height!==g.height||x.width!==g.width}x&&(e.flags|=4),$.abs?$=!f.abs:(f=f.rect,$=$.rect,$=f.height!==$.height||f.width!==$.width),$&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&Zw(h,Ft===0?a:a+"_"+Ft,o),d&&(e.flags&4)!==0||(rn===null&&(rn=[]),rn.push(h,Ft===0?i:i+"_"+Ft,t.memoizedProps)),Ft++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:mp(e,t.child,a,i,o,s,c)&&(d=!0));t=t.sibling}return d}function mw(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,i=e.stateNode,o=Vn(a,i),s=qn(a.default,a.update);if(t){i=i.clones;var c=i===null?null:i.map(_5)}else c=e.memoizedState,e.memoizedState=null;i=e;var d=e.child;Ft=0,o=mp(i,d,o,o,s,c,!1),(e.flags&4)!==0&&o&&(t||vr(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&mw(e,t);e=e.sibling}}var bt=!1,ze=!1,tn=!1,ch=!1,Ib=typeof WeakSet=="function"?WeakSet:Set,vt=null,an=!1,$s=!1,iu=!1,sm=!1;function s5(e,t,a){if(e=e.containerInfo,ym=Sr,e=Fv(e),Um(e)){if("selectionStart"in e)var i={start:e.selectionStart,end:e.selectionEnd};else e:{i=(i=e.ownerDocument)&&i.defaultView||window;var o=i.getSelection&&i.getSelection();if(o&&o.rangeCount!==0){i=o.anchorNode;var s=o.anchorOffset,c=o.focusNode;o=o.focusOffset;try{i.nodeType,c.nodeType}catch{i=null;break e}var d=0,h=-1,f=-1,$=0,x=0,g=e,b=null;t:for(;;){for(var C;g!==i||s!==0&&g.nodeType!==3||(h=d+s),g!==c||o!==0&&g.nodeType!==3||(f=d+o),g.nodeType===3&&(d+=g.nodeValue.length),(C=g.firstChild)!==null;)b=g,g=C;for(;;){if(g===e)break t;if(b===i&&++$===s&&(h=d),b===c&&++x===o&&(f=d),(C=g.nextSibling)!==null)break;g=b,b=g.parentNode}g=C}i=h===-1||f===-1?null:{start:h,end:f}}else i=null}i=i||{start:0,end:0}}else i=null;for(wm={focusedElem:e,selectionRange:i},Sr=!1,a=(a&335544064)===a,vt=t,t=a?9270:1024;vt!==null;){if(e=vt,a&&(i=e.deletions,i!==null))for(s=0;s<i.length;s++)a&&om(i[s]);if(e.alternate===null&&(e.flags&2)!==0)a&&Db(e),hc(a);else{if(e.tag===22){if(i=e.alternate,e.memoizedState!==null){i!==null&&i.memoizedState===null&&a&&om(i),hc(a);continue}else if(i!==null&&i.memoizedState!==null){a&&Db(e),hc(a);continue}}i=e.child,(e.subtreeFlags&t)!==0&&i!==null?(i.return=e,vt=i):(a&&dw(e),hc(a))}}ua=null}function hc(e){for(;vt!==null;){var t=vt,a=e,i=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&i!==null){a=void 0,o=i.memoizedProps,i=i.memoizedState;var s=t.stateNode;try{var c=no(t.type,o);a=s.getSnapshotBeforeUpdate(c,i),s.__reactInternalSnapshotBeforeUpdate=a}catch(d){Oe(t,t.return,d)}}break;case 3:if((o&1024)!==0){if(i=t.stateNode.containerInfo,a=i.nodeType,a===9)Nm(i);else if(a===1)switch(i.nodeName){case"HEAD":case"HTML":case"BODY":Nm(i);break;default:i.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&i!==null&&(a=Vn(i.memoizedProps,i.stateNode),o=t.memoizedProps,o=qn(o.default,o.update),o!=="none"&&zr(i,a,o,i.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(M(163))}if(i=t.sibling,i!==null){i.return=t.return,vt=i;break}vt=t.return}}function pw(e,t,a){var i=a.flags;switch(a.tag){case 0:case 11:case 15:nn(e,a),i&4&&ol(5,a);break;case 1:if(nn(e,a),i&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){Oe(a,a.return,c)}else{var o=no(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){Oe(a,a.return,c)}}i&64&&rw(a),i&512&&on(a,a.return);break;case 3:if(nn(e,a),i&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{fy(e,t)}catch(c){Oe(a,a.return,c)}}break;case 27:t===null&&i&4&&cw(a);case 26:case 5:nn(e,a),t===null&&i&4&&tm(a),i&512&&on(a,a.return);break;case 12:nn(e,a);break;case 31:nn(e,a),i&4&&vw(e,a);break;case 13:nn(e,a),i&4&&yw(e,a),i&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=y5.bind(null,a),F5(e,a))));break;case 22:if(i=a.memoizedState!==null||bt,!i){var s=t!==null&&t.memoizedState!==null||ze;t=bt,o=ze,bt=i,(ze=s)&&!o?(i=2,(a.subtreeFlags&8772)!==0&&(i|=1),La(e,a,i)):nn(e,a),bt=t,ze=o}break;case 30:nn(e,a),i&512&&on(a,a.return);break;case 7:i&512&&on(a,a.return);default:nn(e,a)}}function lm(e,t){for(e=e.child;e!==null;)gw(e,t),e=e.sibling}function gw(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var i=a.style;typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"}else{var o=e.stateNode,s=e.memoizedProps.style,c=s!=null&&s.hasOwnProperty("display")?s.display:null;o.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){Oe(e,e.return,h)}cm(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,Ne=!0}catch(h){Oe(e,e.return,h)}break;case 18:try{var d=e.stateNode;t?Wb(d,!0):Wb(e.stateNode,!1)}catch(h){Oe(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&lm(e,t);break;default:lm(e,t)}}function cm(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,i=t;switch(a.tag){case 4:gw(a,i);break e;case 22:a.memoizedState===null&&cm(a,i);break e;default:cm(a,i)}}e=e.sibling}}function fw(e){var t=e.alternate;t!==null&&(e.alternate=null,fw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&pu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Fe=null,Jt=!1;function Ba(e,t,a){for(a=a.child;a!==null;)bw(e,t,a),a=a.sibling}function bw(e,t,a){if(ma&&typeof ma.onCommitFiberUnmount=="function")try{ma.onCommitFiberUnmount(Fs,a)}catch{}switch(a.tag){case 26:ze||Et(a,t),Ba(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!ze&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:ze||Et(a,t),Rs(a);var i=Fe,o=Jt;Si(a.type)&&(Fe=a.stateNode,Jt=!1),Ba(e,t,a),i0(a.stateNode,a.type,a.memoizedProps),Fe=i,Jt=o;break;case 5:ze||Et(a,t),Rs(a);case 6:if(a.tag===6&&Rs(a),i=Fe,o=Jt,Fe=null,Ba(e,t,a),Fe=i,Jt=o,Fe!==null)if(Jt)try{(Fe.nodeType===9?Fe.body:Fe.nodeName==="HTML"?Fe.ownerDocument.body:Fe).removeChild(a.stateNode),Ne=!0}catch(s){Oe(a,t,s)}else try{Fe.removeChild(a.stateNode),Ne=!0}catch(s){Oe(a,t,s)}break;case 18:Fe!==null&&(Jt?(e=Fe,Fb(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),kr(e)):Fb(Fe,a.stateNode));break;case 4:i=Fe,o=Jt,Fe=a.stateNode.containerInfo,Jt=!0,Ba(e,t,a),Fe=i,Jt=o;break;case 0:case 11:case 14:case 15:$i(2,a,t),ze||$i(4,a,t),Ba(e,t,a);break;case 1:ze||(Et(a,t),i=a.stateNode,typeof i.componentWillUnmount=="function"&&sw(a,t,i)),Ba(e,t,a);break;case 21:Ba(e,t,a);break;case 22:ze=(i=ze)||a.memoizedState!==null,Ba(e,t,a),ze=i;break;case 30:Et(a,t),Ba(e,t,a);break;case 7:ze||Et(a,t),Ba(e,t,a);break;default:Ba(e,t,a)}}function vw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{kr(e)}catch(a){Oe(t,t.return,a)}}}function yw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{kr(e)}catch(a){Oe(t,t.return,a)}}function l5(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Ib),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Ib),t;default:throw Error(M(435,e.tag))}}function mc(e,t){var a=l5(e);t.forEach(function(i){if(!a.has(i)){a.add(i);var o=w5.bind(null,e,i);i.then(o,o)}})}function Gt(e,t,a){var i=t.deletions;if(i!==null)for(var o=0;o<i.length;o++){var s=i[o],c=e,d=t,h=d;e:for(;h!==null;){switch(h.tag){case 27:if(Si(h.type)){Fe=h.stateNode,Jt=!1;break e}break;case 5:Fe=h.stateNode,Jt=!1;break e;case 3:case 4:Fe=h.stateNode.containerInfo,Jt=!0;break e}h=h.return}if(Fe===null)throw Error(M(160));bw(c,d,s),Fe=null,Jt=!1,c=s.alternate,c!==null&&(c.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)ww(t,e,a),t=t.sibling}var ja=null;function ww(e,t,a){var i=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(i=e.updateQueue,i=i!==null?i.events:null,i!==null))for(var s=0;s<i.length;s++){var c=i[s];c.ref.impl=c.nextImpl}Gt(t,e,a),Yt(e),o&4&&($i(3,e,e.return),ol(3,e),$i(5,e,e.return));break;case 1:Gt(t,e,a),Yt(e),o&512&&(ze||i===null||Et(i,i.return)),o&64&&bt&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(s=ja,Gt(t,e,a),Yt(e),o&512&&(ze||i===null||Et(i,i.return)),o&4)if(o=i!==null?i.memoizedState:null,a=e.memoizedState,i===null)if(a===null)if(e.stateNode===null)if(bt)e.stateNode=Qw(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=s.ownerDocument||s;t:switch(t){case"title":i=o.getElementsByTagName("title")[0],(!i||i[tl]||i[Ct]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=o.createElement(t),o.head.insertBefore(i,o.querySelector("head > title"))),Mt(i,t,a),i[Ct]=e,yt(i),t=i;break e;case"link":if(s=sv("link","href",o).get(t+(a.href||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&i.getAttribute("rel")===(a.rel==null?null:a.rel)&&i.getAttribute("title")===(a.title==null?null:a.title)&&i.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(c,1);break t}}i=o.createElement(t),Mt(i,t,a),o.head.appendChild(i);break;case"meta":if(s=sv("meta","content",o).get(t+(a.content||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("content")===(a.content==null?null:""+a.content)&&i.getAttribute("name")===(a.name==null?null:a.name)&&i.getAttribute("property")===(a.property==null?null:a.property)&&i.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&i.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(c,1);break t}}i=o.createElement(t),Mt(i,t,a),o.head.appendChild(i);break;default:throw Error(M(468,t))}i[Ct]=e,yt(i),t=i}e.stateNode=t}else bt||Tm(s,e.type,e.stateNode);else e.stateNode=rv(s,a,e.memoizedProps);else o!==a?(o===null?(t=i.stateNode,t===null||ze||t.parentNode.removeChild(t)):o.count--,a===null?bt||Tm(s,e.type,e.stateNode):rv(s,a,e.memoizedProps)):a===null&&e.stateNode!==null&&sh(e,e.memoizedProps,i.memoizedProps);break;case 27:Gt(t,e,a),Yt(e),o&512&&(ze||i===null||Et(i,i.return)),i!==null&&o&4&&sh(e,e.memoizedProps,i.memoizedProps);break;case 5:if(s=tn,tn=!1,Gt(t,e,a),tn=s,Yt(e),o&512&&(ze||i===null||Et(i,i.return)),e.flags&32){t=e.stateNode;try{gr(t,""),Ne=!0}catch($){Oe(e,e.return,$)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,sh(e,t,i!==null?i.memoizedProps:t)),o&1024&&(ch=!0);break;case 6:if(Gt(t,e,a),Yt(e),o&4){if(e.stateNode===null)throw Error(M(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,Ne=!0}catch($){Oe(e,e.return,$)}}break;case 3:if(Ne=!1,Vc=null,s=ja,ja=Qs(t.containerInfo),Gt(t,e,a),ja=s,Yt(e),o&4&&i!==null&&i.memoizedState.isDehydrated)try{kr(t.containerInfo)}catch($){Oe(e,e.return,$)}ch&&(ch=!1,$w(e)),Ne=!1;break;case 4:o=tn,tn=bt,i=jf(),s=ja,ja=Qs(e.stateNode.containerInfo),Gt(t,e,a),Yt(e),ja=s,Ne&&$s&&(iu=!0),Ne=i,tn=o;break;case 12:Gt(t,e,a),Yt(e);break;case 31:Gt(t,e,a),Yt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,mc(e,t)));break;case 13:Gt(t,e,a),Yt(e),e.child.flags&8192&&e.memoizedState!==null!=(i!==null&&i.memoizedState!==null)&&(Eu=ha()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,mc(e,t)));break;case 22:s=e.memoizedState!==null,c=i!==null&&i.memoizedState!==null;var d=bt,h=ze,f=tn;bt=d||s,tn=f||s,ze=h||c,Gt(t,e,a),ze=h,tn=f,bt=d,Yt(e),o&8192&&(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,!s||i===null||c||bt||ze||(t=c||ze,a=bt,i=ze,bt=s||bt,ze=t,Fn(e,2),bt=a,ze=i),!s&&tn||lm(e,s)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,mc(e,a))));break;case 19:Gt(t,e,a),Yt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,mc(e,t)));break;case 30:o&512&&(ze||i===null||Et(i,i.return)),o=jf(),s=$s,c=(a&335544064)===a,d=e.memoizedProps,$s=c&&qn(d.default,d.update)!=="none",Gt(t,e,a),Yt(e),c&&i!==null&&Ne&&(e.flags|=4),$s=s,Ne=o;break;case 21:break;case 7:o&512&&(ze||i===null||Et(i,i.return)),i&&i.stateNode!==null&&(i.stateNode._fragmentFiber=e);default:Gt(t,e,a),Yt(e)}}function Yt(e){var t=e.flags;if(t&2){try{for(var a,i=e.return;i!==null;){if(lw(i)){a=i;break}i=i.return}i=null;for(var o=e.return;o!==null;){if(hp(o)){var s=o.stateNode;i===null?i=[s]:i.push(s)}if(dp(o))break;o=o.return}var c=i;if(a==null)throw Error(M(160));switch(a.tag){case 27:var d=a.stateNode,h=lh(e);au(e,h,d,c);break;case 5:var f=a.stateNode;a.flags&32&&(gr(f,""),a.flags&=-33);var $=lh(e);au(e,$,f,c);break;case 3:case 4:var x=a.stateNode.containerInfo,g=lh(e);am(e,g,x,c);break;default:throw Error(M(161))}}catch(b){Oe(e,e.return,b)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function $w(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;$w(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,Sr=!0,t.reset(),Sr=!1),e=e.sibling}}function Bo(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)xw(t,e),t=t.sibling;else mw(t,!1)}function xw(e,t){var a=e.alternate;if(a===null)nm(e,!1);else switch(e.tag){case 3:if(sm=an=!1,_b(),Bo(t,e),!an&&!iu){if(e=rn,e!==null)for(var i=0;i<e.length;i+=3){a=e[i];var o=e[i+1];Kw(a,e[i+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),sm=!0}rn=null;break;case 5:Bo(t,e);break;case 4:i=an,an=!1,Bo(t,e),an&&(iu=!0),an=i;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?nm(e,!1):Bo(t,e));break;case 30:i=an,o=_b(),an=!1,Bo(t,e),an&&(e.flags|=4);var s=e.memoizedProps,c=e.stateNode;t=Vn(s,c),c=Vn(a.memoizedProps,c);var d=qn(s.default,s.update);d==="none"?t=!1:(s=a.memoizedState,a.memoizedState=null,a=e.child,Ft=0,t=mp(e,a,t,c,d,s,!0),Ft!==(s===null?0:s.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(vr(e,e.memoizedProps.onUpdate),rn=o):o!==null&&(o.push.apply(o,rn),rn=o),an=(e.flags&32)!==0?!0:i;break;default:Bo(t,e)}}function nn(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)pw(e,t.alternate,t),t=t.sibling}function Fn(e,t){for(e=e.child;e!==null;){var a=e,i=t;switch(a.tag){case 0:case 11:case 14:case 15:$i(4,a,a.return),Fn(a,i);break;case 1:Et(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&sw(a,a.return,o),Fn(a,i);break;case 27:(i&2)!==0&&i0(a.stateNode,a.type,a.memoizedProps);case 5:Et(a,a.return),a.tag!==5&&a.tag!==27||Rs(a),Fn(a,i);break;case 6:Rs(a);break;case 26:Et(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||ze||o.parentNode.removeChild(o),Fn(a,i);break;case 22:a.memoizedState===null&&Fn(a,i);break;case 30:Et(a,a.return),Fn(a,i);break;case 7:Et(a,a.return);default:Fn(a,i)}e=e.sibling}}function La(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var i=t.alternate,o=e,s=t,c=s.flags,d=(a&1)!==0;switch(s.tag){case 0:case 11:case 15:La(o,s,a),ol(4,s);break;case 1:if(La(o,s,a),i=s,o=i.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch($){Oe(i,i.return,$)}if(i=s,o=i.updateQueue,o!==null){var h=i.stateNode;try{var f=o.shared.hiddenCallbacks;if(f!==null)for(o.shared.hiddenCallbacks=null,o=0;o<f.length;o++)gy(f[o],h)}catch($){Oe(i,i.return,$)}}d&&c&64&&rw(s),on(s,s.return);break;case 27:(a&2)!==0&&cw(s);case 5:s.tag!==5&&s.tag!==27||Vb(s),La(o,s,a),d&&i===null&&c&4&&tm(s),on(s,s.return);break;case 6:Vb(s);break;case 26:h=s.stateNode,s.memoizedState!==null||h===null||bt||Tm(Qs(h.ownerDocument),s.type,h),La(o,s,a),d&&i===null&&c&4&&tm(s),on(s,s.return);break;case 12:La(o,s,a);break;case 31:La(o,s,a),d&&c&4&&vw(o,s);break;case 13:La(o,s,a),d&&c&4&&yw(o,s);break;case 22:s.memoizedState===null&&La(o,s,a),on(s,s.return);break;case 30:La(o,s,a),on(s,s.return);break;case 7:on(s,s.return);default:La(o,s,a)}t=t.sibling}}function pp(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&nl(a))}function gp(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&nl(e))}function Na(e,t,a,i){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)Nw(e,t,a,i),t=t.sibling;else o&&hw(t)}function Nw(e,t,a,i){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&Ac(t);var s=t.flags;switch(t.tag){case 0:case 11:case 15:Na(e,t,a,i),s&2048&&ol(9,t);break;case 1:Na(e,t,a,i);break;case 3:Na(e,t,a,i),o&&sm&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),s&2048&&(s=null,t.alternate!==null&&(s=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==s&&(t.refCount++,s!=null&&nl(s)));break;case 12:if(s&2048){Na(e,t,a,i),s=t.stateNode;try{var c=t.memoizedProps,d=c.id,h=c.onPostCommit;typeof h=="function"&&h(d,t.alternate===null?"mount":"update",s.passiveEffectDuration,-0)}catch(f){Oe(t,t.return,f)}}else Na(e,t,a,i);break;case 31:Na(e,t,a,i);break;case 13:Na(e,t,a,i);break;case 23:break;case 22:c=t.stateNode,d=t.alternate,t.memoizedState!==null?(o&&d!==null&&d.memoizedState===null&&Ac(d),c._visibility&2?Na(e,t,a,i):Ms(e,t)):(o&&d!==null&&d.memoizedState!==null&&Ac(t),c._visibility&2?Na(e,t,a,i):(c._visibility|=2,jo(e,t,a,i,(t.subtreeFlags&10256)!==0||!1))),s&2048&&pp(d,t);break;case 24:Na(e,t,a,i),s&2048&&gp(t.alternate,t);break;case 30:o&&(s=t.alternate,s!==null&&(mn(s.child,!0),mn(t.child,!0))),Na(e,t,a,i);break;default:Na(e,t,a,i)}}function jo(e,t,a,i,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var s=e,c=t,d=a,h=i,f=c.flags;switch(c.tag){case 0:case 11:case 15:jo(s,c,d,h,o),ol(8,c);break;case 23:break;case 22:var $=c.stateNode;c.memoizedState!==null?$._visibility&2?jo(s,c,d,h,o):Ms(s,c):($._visibility|=2,jo(s,c,d,h,o)),o&&f&2048&&pp(c.alternate,c);break;case 24:jo(s,c,d,h,o),o&&f&2048&&gp(c.alternate,c);break;default:jo(s,c,d,h,o)}t=t.sibling}}function Ms(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,i=t,o=i.flags;switch(i.tag){case 22:Ms(a,i),o&2048&&pp(i.alternate,i);break;case 24:Ms(a,i),o&2048&&gp(i.alternate,i);break;default:Ms(a,i)}t=t.sibling}}var ji=8192;function qi(e,t,a){if(e.subtreeFlags&ji)for(e=e.child;e!==null;)Sw(e,t,a),e=e.sibling}function Sw(e,t,a){switch(e.tag){case 26:qi(e,t,a),e.flags&ji&&(e.memoizedState!==null?hS(a,ja,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&cv(a,e)));break;case 5:qi(e,t,a),e.flags&ji&&(e=e.stateNode,(t&335544128)===t&&cv(a,e));break;case 3:case 4:var i=ja;ja=Qs(e.stateNode.containerInfo),qi(e,t,a),ja=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=ji,ji=16777216,qi(e,t,a),ji=i):qi(e,t,a));break;case 30:if((e.flags&ji)!==0&&(i=e.memoizedProps.name,i!=null&&i!=="auto")){var o=e.stateNode;o.paired=null,ua===null&&(ua=new Map),ua.set(i,o)}qi(e,t,a);break;default:qi(e,t,a)}}function kw(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function ps(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];vt=i,Ew(i,e)}kw(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Tw(e),e=e.sibling}function Tw(e){switch(e.tag){case 0:case 11:case 15:ps(e),e.flags&2048&&$i(9,e,e.return);break;case 3:ps(e);break;case 12:ps(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Rc(e)):ps(e);break;default:ps(e)}}function Rc(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];vt=i,Ew(i,e)}kw(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:$i(8,t,t.return),Rc(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Rc(t));break;default:Rc(t)}e=e.sibling}}function Ew(e,t){for(;vt!==null;){var a=vt;switch(a.tag){case 0:case 11:case 15:$i(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var i=a.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:nl(a.memoizedState.cache)}if(i=a.child,i!==null)i.return=a,vt=i;else e:for(a=e;vt!==null;){i=vt;var o=i.sibling,s=i.return;if(fw(i),i===a){vt=null;break e}if(o!==null){o.return=s,vt=o;break e}vt=s}}}var c5={getCacheForType:function(e){var t=zt(ut),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return zt(ut).controller.signal}},u5=typeof WeakMap=="function"?WeakMap:Map,ke=0,Be=null,fe=null,ve=0,Re=0,sa=null,oi=!1,Ar=!1,fp=!1,Hn=0,it=0,xi=0,Ji=0,ou=0,da=0,br=0,Os=null,Pt=null,um=!1,Eu=0,Cw=0,ru=1/0,su=null,pi=null,tt=0,Ya=null,io=null,hn=0,dm=0,hm=null,zw=null,ur=null,dr=null,hr=null,Vs=0,Mc=null;function ga(){return(ke&2)!==0&&ve!==0?ve&-ve:te.T!==null?vp():Ov()}function Aw(){if(da===0)if((ve&536870912)===0||pe){var e=ec;ec<<=1,(ec&3932160)===0&&(ec=262144),da=e}else da=536870912;return e=Ot.current,e!==null&&(e.flags|=32),da}function vr(e,t){if(t!=null){var a=e.stateNode,i=a.ref;i===null&&(i=a.ref=Pw(Vn(e.memoizedProps,a))),dr===null&&(dr=[]),dr.push(t.bind(null,i))}}function ea(e,t,a){(e===Be&&(Re===2||Re===9)||e.cancelPendingCommit!==null)&&(yr(e,0),ri(e,ve,da,!1)),el(e,a),((ke&2)===0||e!==Be)&&(e===Be&&((ke&2)===0&&(Ji|=a),it===4&&ri(e,ve,da,!1)),gn(e))}function Rw(e,t,a){if((ke&6)!==0)throw Error(M(327));var i=!a&&(t&127)===0&&(t&e.expiredLanes)===0||Ws(e,t),o=i?m5(e,t):uh(e,t,!0),s=i;do{if(o===0){Ar&&!i&&ri(e,t,0,!1);break}else{if(a=e.current.alternate,s&&!d5(a)){o=uh(e,t,!1),s=!1;continue}if(o===2){if(s=t,e.errorRecoveryDisabledLanes&s)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var d=e;o=Os;var h=d.current.memoizedState.isDehydrated;if(h&&(yr(d,c).flags|=256),c=uh(d,c,!1),c!==2&&c!==6){if(fp&&!h){d.errorRecoveryDisabledLanes|=s,Ji|=s,o=4;break e}s=Pt,Pt=o,s!==null&&(Pt===null?Pt=s:Pt.push.apply(Pt,s))}o=c}if(s=!1,o!==2)continue}}if(o===1){yr(e,0),ri(e,t,0,!0);break}e:{switch(i=e,s=o,s){case 0:case 1:throw Error(M(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:ri(i,t,da,!oi);break e;case 2:Pt=null;break;case 3:case 5:break;default:throw Error(M(329))}if((t&62914560)===t&&(o=Eu+300-ha(),10<o)){if(ri(i,t,da,!oi),mu(i,0,!0)!==0)break e;hn=t,i.timeoutHandle=wp(Hb.bind(null,i,a,Pt,su,um,t,da,Ji,br,oi,s,"Throttled",-0,0),o);break e}Hb(i,a,Pt,su,um,t,da,Ji,br,oi,s,null,-0,0)}}break}while(!0);gn(e)}function Hb(e,t,a,i,o,s,c,d,h,f,$,x,g,b){e.timeoutHandle=-1;var C=t.subtreeFlags,E=(s&335544064)===s;if(x=null,(E||C&8192||(C&16785408)===16785408)&&(x={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:ln},ua=null,Sw(t,s,x),E&&(C=x,E=e.containerInfo,E=(E.nodeType===9?E:E.ownerDocument).__reactViewTransition,E!=null&&(C.count++,C.waitingForViewTransition=!0,C=Zs.bind(C),E.finished.then(C,C))),C=(s&62914560)===s?Eu-ha():(s&4194048)===s?Cw-ha():0,C=mS(x,C),C!==null)){hn=s,e.cancelPendingCommit=C(qb.bind(null,e,t,s,a,i,o,c,d,h,f,$,x,null,g,b)),ri(e,s,c,!f);return}qb(e,t,s,a,i,o,c,d,h,f,$,x)}function d5(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var i=0;i<a.length;i++){var o=a[i],s=o.getSnapshot;o=o.value;try{if(!fa(s(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function ri(e,t,a,i){t=Cv(e,t),t&=~ou,t&=~Ji,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var o=t;0<o;){var s=31-pa(o),c=1<<s;i[s]=-1,o&=~c}a!==0&&Av(e,a,t)}function Cu(){return(ke&6)===0?(rl(0,!1),!1):!0}function bp(){if(fe!==null){if(Re===0)var e=fe.return;else e=fe,An=co=null,ep(e),sr=null,Bs=0,e=fe;for(;e!==null;)ow(e.alternate,e),e=e.return;fe=null}}function yr(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,O5(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),hn=0,bp(),Be=e,fe=a=Rn(e.current,null),ve=t,Re=0,sa=null,oi=!1,Ar=Ws(e,t),fp=!1,br=da=ou=Ji=xi=it=0,Pt=Os=null,um=!1,Hn=Cv(e,t),vu(),a}function Mw(e,t){de=null,te.H=Wc,t===Cr||t===$u?(t=db(),Re=3):t===Xm?(t=db(),Re=4):Re=t===lp?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,sa=t,fe===null&&(it=1,eu(e,Ca(t,e.current)))}function Ow(){var e=Ot.current;return e===null?!0:(ve&4194048)===ve?It===null:(ve&62914560)===ve||(ve&536870912)!==0?e===It:!1}function Vw(){var e=te.H;return te.H=Wc,e===null?Wc:e}function Dw(){var e=te.A;return te.A=c5,e}function lu(){it=4,oi||(ve&4194048)!==ve&&Ot.current!==null||(Ar=!0),(xi&134217727)===0&&(Ji&134217727)===0||Be===null||ri(Be,ve,da,!1)}function uh(e,t,a){var i=ke;ke|=2;var o=Vw(),s=Dw();(Be!==e||ve!==t)&&(su=null,yr(e,t)),t=!1;var c=it;e:do try{if(Re!==0&&fe!==null){var d=fe,h=sa;switch(Re){case 8:bp(),c=6;break e;case 3:case 2:case 9:case 6:Ot.current===null&&(t=!0);var f=Re;if(Re=0,sa=null,ar(e,d,h,f),a&&Ar){c=0;break e}break;default:f=Re,Re=0,sa=null,ar(e,d,h,f)}}h5(),c=it;break}catch($){Mw(e,$)}while(!0);return t&&e.shellSuspendCounter++,An=co=null,ke=i,te.H=o,te.A=s,fe===null&&(Be=null,ve=0,vu()),c}function h5(){for(;fe!==null;)_w(fe)}function m5(e,t){var a=ke;ke|=2;var i=Vw(),o=Dw();Be!==e||ve!==t?(su=null,ru=ha()+500,yr(e,t)):Ar=Ws(e,t);e:do try{if(Re!==0&&fe!==null){t=fe;var s=sa;t:switch(Re){case 1:Re=0,sa=null,ar(e,t,s,1);break;case 2:case 9:if(ub(s)){Re=0,sa=null,Ub(t);break}t=function(){Re!==2&&Re!==9||Be!==e||(Re=7),gn(e)},s.then(t,t);break e;case 3:Re=7;break e;case 4:Re=5;break e;case 7:ub(s)?(Re=0,sa=null,Ub(t)):(Re=0,sa=null,ar(e,t,s,7));break;case 5:var c=null;switch(fe.tag){case 26:c=fe.memoizedState;case 5:case 27:var d=fe;if(c?s0(c):d.stateNode.complete){Re=0,sa=null;var h=d.sibling;if(h!==null)fe=h;else{var f=d.return;f!==null?(fe=f,zu(f)):fe=null}break t}}Re=0,sa=null,ar(e,t,s,5);break;case 6:Re=0,sa=null,ar(e,t,s,6);break;case 8:bp(),it=6;break e;default:throw Error(M(462))}}p5();break}catch($){Mw(e,$)}while(!0);return An=co=null,te.H=i,te.A=o,ke=a,fe!==null?0:(Be=null,ve=0,vu(),it)}function p5(){for(;fe!==null&&!Rx();)_w(fe)}function _w(e){var t=iw(e.alternate,e,Hn);e.memoizedProps=e.pendingProps,t===null?zu(e):fe=t}function Ub(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=Eb(a,t,t.pendingProps,t.type,void 0,ve);break;case 11:t=Eb(a,t,t.pendingProps,t.type.render,t.ref,ve);break;case 5:ep(t);var i=t;i===wt&&(pe?(Xc(i),i.tag===5&&i.stateNode!=null&&(Qe=i.stateNode)):(Xc(i),pe=!0));default:ow(a,t),t=fe=ry(t,Hn),t=iw(a,t,Hn)}e.memoizedProps=e.pendingProps,t===null?zu(e):fe=t}function ar(e,t,a,i){An=co=null,ep(t),sr=null,Bs=0;var o=t.return;try{if(t5(e,o,t,a,ve)){it=1,eu(e,Ca(a,e.current)),fe=null;return}}catch(s){if(o!==null)throw fe=o,s;it=1,eu(e,Ca(a,e.current)),fe=null;return}t.flags&32768?(pe||i===1?e=!0:Ar||(ve&536870912)!==0?e=!1:(oi=e=!0,(i===2||i===9||i===3||i===6)&&(i=Ot.current,i!==null&&i.tag===13&&(i.flags|=16384))),Iw(t,e)):zu(t)}function zu(e){var t=e;do{if((t.flags&32768)!==0){Iw(t,oi);return}e=t.return;var a=o5(t.alternate,t,Hn);if(a!==null){fe=a;return}if(t=t.sibling,t!==null){fe=t;return}fe=t=e}while(t!==null);it===0&&(it=5)}function Iw(e,t){do{var a=r5(e.alternate,e);if(a!==null){a.flags&=32767,fe=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){fe=e;return}fe=e=a}while(e!==null);it=6,fe=null}function qb(e,t,a,i,o,s,c,d,h,f,$,x){e.cancelPendingCommit=null;do Au();while(tt!==0);if((ke&6)!==0)throw Error(M(327));if(t!==null){if(t===e.current)throw Error(M(177));e===Be&&(fe=Be=null,ve=0),io=t,Ya=e,hn=a,hm=o,zw=i,g5(e,t,a,c,d,h,x)}}function g5(e,t,a,i,o,s,c){var d=t.lanes|t.childLanes;if(dm=d,d|=qm,Bx(e,a,d,i,o,s),dr=null,(a&335544064)===a?(hr=jN(e),i=10262):(hr=null,i=10256),(t.subtreeFlags&i)!==0||(t.flags&i)!==0?(e.callbackNode=null,e.callbackPriority=0,$5(Bc,function(){return fm(),null})):(e.callbackNode=null,e.callbackPriority=0),nu=!1,i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=te.T,te.T=null,o=Te.p,Te.p=2,s=ke,ke|=4;try{s5(e,t,a)}finally{ke=s,Te.p=o,te.T=i}}tt=1,nu?ur=U5(c,e.containerInfo,hr,mm,pm,b5,gm,fm,f5,null,null):(mm(),pm(),gm())}function f5(e){if(tt!==0){var t=Ya.onRecoverableError;t(e,{componentStack:null})}}function b5(){tt===3&&(tt=0,xw(io,Ya),tt=4)}function mm(){if(tt===1){tt=0;var e=Ya,t=io,a=hn,i=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||i){i=te.T,te.T=null;var o=Te.p;Te.p=2;var s=ke;ke|=4;try{$s=iu=!1,ww(t,e,a),a=wm;var c=Fv(e.containerInfo),d=a.focusedElem,h=a.selectionRange;if(c!==d&&d&&d.ownerDocument&&Pv(d.ownerDocument.documentElement,d)){if(h!==null&&Um(d)){var f=h.start,$=h.end;if($===void 0&&($=f),"selectionStart"in d)d.selectionStart=f,d.selectionEnd=Math.min($,d.value.length);else{var x=d.ownerDocument||document,g=x&&x.defaultView||window;if(g.getSelection){var b=g.getSelection(),C=d.textContent.length,E=Math.min(h.start,C),R=h.end===void 0?E:Math.min(h.end,C);!b.extend&&E>R&&(c=R,R=E,E=c);var w=ab(d,E),y=ab(d,R);if(w&&y&&(b.rangeCount!==1||b.anchorNode!==w.node||b.anchorOffset!==w.offset||b.focusNode!==y.node||b.focusOffset!==y.offset)){var v=x.createRange();v.setStart(w.node,w.offset),b.removeAllRanges(),E>R?(b.addRange(v),b.extend(y.node,y.offset)):(v.setEnd(y.node,y.offset),b.addRange(v))}}}}for(x=[],b=d;b=b.parentNode;)b.nodeType===1&&x.push({element:b,left:b.scrollLeft,top:b.scrollTop});for(typeof d.focus=="function"&&d.focus(),d=0;d<x.length;d++){var k=x[d];k.element.scrollLeft=k.left,k.element.scrollTop=k.top}}Sr=!!ym,wm=ym=null}finally{ke=s,Te.p=o,te.T=i}}e.current=t,tt=2}}function pm(){if(tt===2){tt=0;var e=Ya,t=io,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=te.T,te.T=null;var i=Te.p;Te.p=2;var o=ke;ke|=4;try{pw(e,t.alternate,t)}finally{ke=o,Te.p=i,te.T=a}}tt=3}}function gm(){if(tt===4||tt===3){tt=0;var e=ur;ur=null,Mx();var t=Ya,a=io,i=hn,o=zw,s=(i&335544064)===i?10262:10256;if((a.subtreeFlags&s)!==0||(a.flags&s)!==0?tt=5:(tt=0,io=Ya=null,Hw(t,t.pendingLanes)),s=t.pendingLanes,s===0&&(pi=null),Om(i),a=a.stateNode,ma&&typeof ma.onCommitFiberRoot=="function")try{ma.onCommitFiberRoot(Fs,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=te.T,s=Te.p,Te.p=2,te.T=null;try{for(var c=t.onRecoverableError,d=0;d<o.length;d++){var h=o[d];c(h.value,{componentStack:h.stack})}}finally{te.T=a,Te.p=s}}if(o=dr,c=hr,hr=null,o!==null&&(dr=null,c===null&&(c=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(c),a!==void 0&&e.finished.finally(a);(hn&3)!==0&&Au(),gn(t),s=t.pendingLanes,(i&261930)!==0&&(s&42)!==0?t===Mc?Vs++:(Vs=0,Mc=t):(Vs=0,Mc=null),rl(0,!1)}}function Hw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,nl(t)))}function Au(){return ur!==null&&(ur.skipTransition(),ur=null),mm(),pm(),gm(),fm()}function fm(){if(tt!==5)return!1;var e=Ya,t=dm;dm=0;var a=Om(hn),i=te.T,o=Te.p;try{Te.p=32>a?32:a,te.T=null,a=hm,hm=null;var s=Ya,c=hn;if(tt=0,io=Ya=null,hn=0,(ke&6)!==0)throw Error(M(331));var d=ke;if(ke|=4,Tw(s.current),Nw(s,s.current,c,a),ke=d,rl(0,!1),ma&&typeof ma.onPostCommitFiberRoot=="function")try{ma.onPostCommitFiberRoot(Fs,s)}catch{}return!0}finally{Te.p=o,te.T=i,Hw(e,t)}}function Bb(e,t,a){t=Ca(a,t),t=Kh(e.stateNode,t,2),e=di(e,t,2),e!==null&&(el(e,2),gn(e))}function Oe(e,t,a){if(e.tag===3)Bb(e,e,a);else for(;t!==null;){if(t.tag===3){Bb(t,e,a);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(pi===null||!pi.has(i))){e=Ca(a,e),a=Wy(2),i=di(t,a,2),i!==null&&(ew(a,i,t,e),el(i,2),gn(i));break}}t=t.return}}function dh(e,t,a){var i=e.pingCache;if(i===null){i=e.pingCache=new u5;var o=new Set;i.set(t,o)}else o=i.get(t),o===void 0&&(o=new Set,i.set(t,o));o.has(a)||(fp=!0,o.add(a),e=v5.bind(null,e,t,a),t.then(e,e))}function v5(e,t,a){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Be===e&&(ve&a)===a&&((it===4||it===3&&(ve&62914560)===ve&&300>ha()-Eu)&&(ke&2)===0?yr(e,0):ou|=a,br===ve&&(br=0)),gn(e)}function Uw(e,t){t===0&&(t=zv()),e=lo(e,t),e!==null&&(el(e,t),gn(e))}function y5(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Uw(e,a)}function w5(e,t){var a=0;switch(e.tag){case 31:case 13:var i=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(M(314))}i!==null&&i.delete(t),Uw(e,a)}function $5(e,t){return Rm(e,t)}var wr=null,Go=null,bm=!1,cu=!1,hh=!1,si=0;function gn(e){e!==Go&&e.next===null&&(Go===null?wr=Go=e:Go=Go.next=e),cu=!0,bm||(bm=!0,N5())}function rl(e,t){if(!hh&&cu){hh=!0;do for(var a=!1,i=wr;i!==null;){if(!t)if(e!==0){var o=i.pendingLanes;if(o===0)var s=0;else{var c=i.suspendedLanes,d=i.pingedLanes;s=(1<<31-pa(42|e)+1)-1,s&=o&~(c&~d),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,Lb(i,s))}else s=ve,s=mu(i,i===Be?s:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(s&3)===0||Ws(i,s)||(a=!0,Lb(i,s));i=i.next}while(a);hh=!1}}function x5(){qw()}function qw(){cu=bm=!1;var e=0;si!==0&&M5()&&(e=si);for(var t=ha(),a=null,i=wr;i!==null;){var o=i.next,s=Bw(i,t);s===0?(i.next=null,a===null?wr=o:a.next=o,o===null&&(Go=a)):(a=i,(e!==0||(s&3)!==0)&&(cu=!0)),i=o}tt!==0&&tt!==5||rl(e,!1),si!==0&&(si=0)}function Bw(e,t){for(var a=e.suspendedLanes,i=e.pingedLanes,o=e.expirationTimes,s=e.pendingLanes&-62914561;0<s;){var c=31-pa(s),d=1<<c,h=o[c];h===-1?((d&a)===0||(d&i)!==0)&&(o[c]=qx(d,t)):h<=t&&(e.expiredLanes|=d),s&=~d}if(t=Be,a=ve,a=mu(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,a===0||e===t&&(Re===2||Re===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&Gd(i),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Ws(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(i!==null&&Gd(i),Om(a)){case 2:case 8:a=Tv;break;case 32:a=Bc;break;case 268435456:a=Ev;break;default:a=Bc}return i=Lw.bind(null,e),a=Rm(a,i),e.callbackPriority=t,e.callbackNode=a,t}return i!==null&&i!==null&&Gd(i),e.callbackPriority=2,e.callbackNode=null,2}function Lw(e,t){if(tt!==0&&tt!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(Au()&&e.callbackNode!==a)return null;var i=ve;return i=mu(e,e===Be?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(Rw(e,i,t),Bw(e,ha()),e.callbackNode!=null&&e.callbackNode===a?Lw.bind(null,e):null)}function Lb(e,t){if(Au())return null;Rw(e,t,!0)}function N5(){V5(function(){(ke&6)!==0?Rm(kv,x5):qw()})}function vp(){if(si===0){var e=eo;e===0&&(e=Wl,Wl<<=1,(Wl&261888)===0&&(Wl=256)),si=e}return si}function jb(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:wc(e)}function S5(e,t,a,i,o){if(t==="submit"&&a&&a.stateNode===o){var s=jb((o[aa]||null).action),c=i.submitter;c&&(t=(t=c[aa]||null)?jb(t.formAction):c.getAttribute("formAction"),t!==null&&(s=t,c=null));var d=new gu("action","action",null,i,o);e.push({event:d,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(si!==0){var h=new FormData(o,c);Qh(a,{pending:!0,data:h,method:o.method,action:s},null,h)}}else typeof s=="function"&&(d.preventDefault(),h=new FormData(o,c),Qh(a,{pending:!0,data:h,method:o.method,action:s},s,h))},currentTarget:o}]})}}for(pc=0;pc<_h.length;pc++)gc=_h[pc],Gb=gc.toLowerCase(),Yb=gc[0].toUpperCase()+gc.slice(1),Xa(Gb,"on"+Yb);var gc,Gb,Yb,pc;Xa(ey,"onAnimationEnd");Xa(ty,"onAnimationIteration");Xa(ay,"onAnimationStart");Xa("dblclick","onDoubleClick");Xa("focusin","onFocus");Xa("focusout","onBlur");Xa(DN,"onTransitionRun");Xa(_N,"onTransitionStart");Xa(IN,"onTransitionCancel");Xa(ny,"onTransitionEnd");pr("onMouseEnter",["mouseout","mouseover"]);pr("onMouseLeave",["mouseout","mouseover"]);pr("onPointerEnter",["pointerout","pointerover"]);pr("onPointerLeave",["pointerout","pointerover"]);ro("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ro("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ro("onBeforeInput",["compositionend","keypress","textInput","paste"]);ro("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ro("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ro("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Gs="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),k5=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Gs));function jw(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var i=e[a],o=i.event;i=i.listeners;e:{var s=void 0;if(t)for(var c=i.length-1;0<=c;c--){var d=i[c],h=d.instance,f=d.currentTarget;if(d=d.listener,h!==s&&o.isPropagationStopped())break e;s=d,o.currentTarget=f;try{s(o)}catch($){jc($)}o.currentTarget=null,s=h}else for(c=0;c<i.length;c++){if(d=i[c],h=d.instance,f=d.currentTarget,d=d.listener,h!==s&&o.isPropagationStopped())break e;s=d,o.currentTarget=f;try{s(o)}catch($){jc($)}o.currentTarget=null,s=h}}}}function ge(e,t){var a=t[Uf];a===void 0&&(a=t[Uf]=new Set);var i=e+"__bubble";a.has(i)||(Gw(t,e,2,!1),a.add(i))}function mh(e,t,a){var i=0;t&&(i|=4),Gw(a,e,i,t)}var fc="_reactListening"+Math.random().toString(36).slice(2);function yp(e){if(!e[fc]){e[fc]=!0,Dv.forEach(function(a){a!=="selectionchange"&&(k5.has(a)||mh(a,!1,e),mh(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[fc]||(t[fc]=!0,mh("selectionchange",!1,t))}}function Gw(e,t,a,i){switch(p0(t)){case 2:var o=bS;break;case 8:o=vS;break;default:o=Tp}a=o.bind(null,t,a,e),o=void 0,!Mh||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),i?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function ph(e,t,a,i,o){var s=i;if((t&1)===0&&(t&2)===0&&i!==null)e:for(;;){if(i===null)return;var c=i.tag;if(c===3||c===4){var d=i.stateNode.containerInfo;if(d===o)break;if(c===4)for(c=i.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===o)return;c=c.return}for(;d!==null;){if(c=Gi(d),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){i=s=c;continue e}d=d.parentNode}}i=i.return}jv(function(){var f=s,$=Dm(a),x=[];e:{var g=iy.get(e);if(g!==void 0){var b=gu,C=e;switch(e){case"keypress":if(xc(a)===0)break e;case"keydown":case"keyup":b=dN;break;case"focusin":C="focus",b=Jd;break;case"focusout":C="blur",b=Jd;break;case"beforeblur":case"afterblur":b=Jd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":b=Qf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":b=Wx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":b=fN;break;case ey:case ty:case ay:b=aN;break;case ny:b=vN;break;case"scroll":case"scrollend":b=Px;break;case"wheel":b=wN;break;case"copy":case"cut":case"paste":b=iN;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":b=Kf;break;case"submit":b=pN;break;case"toggle":case"beforetoggle":b=xN}var E=(t&4)!==0,R=!E&&(e==="scroll"||e==="scrollend"),w=E?g!==null?g+"Capture":null:g;E=[];for(var y=f,v;y!==null;){var k=y;if(v=k.stateNode,k=k.tag,k!==5&&k!==26&&k!==27||v===null||w===null||(k=_s(y,w),k!=null&&E.push(Ys(y,k,v))),R)break;y=y.return}0<E.length&&(g=new b(g,C,null,a,$),x.push({event:g,listeners:E}))}}if((t&7)===0){e:{if(b=e==="mouseover"||e==="pointerover",g=e==="mouseout"||e==="pointerout",b&&a!==Rh&&(C=a.relatedTarget||a.fromElement)&&(Gi(C)||C[Tr]))break e;(g||b)&&(C=$.window===$?$:(b=$.ownerDocument)?b.defaultView||b.parentWindow:window,g?(b=a.relatedTarget||a.toElement,g=f,b=b?Gi(b):null,b!==null&&(R=Ps(b),E=b.tag,b!==R||E!==5&&E!==27&&E!==6)&&(b=null)):(g=null,b=f),g!==b&&(E=Qf,k="onMouseLeave",w="onMouseEnter",y="mouse",(e==="pointerout"||e==="pointerover")&&(E=Kf,k="onPointerLeave",w="onPointerEnter",y="pointer"),R=g==null?C:ys(g),v=b==null?C:ys(b),C=new E(k,y+"leave",g,a,$),C.target=R,C.relatedTarget=v,k=null,Gi($)===f&&(E=new E(w,y+"enter",b,a,$),E.target=v,E.relatedTarget=R,k=E),R=k,E=g&&b?yh(g,b,T5):null,g!==null&&Xb(x,C,g,E,!1),b!==null&&R!==null&&Xb(x,R,b,E,!0)))}e:{if(g=f?ys(f):window,b=g.nodeName&&g.nodeName.toLowerCase(),b==="select"||b==="input"&&g.type==="file")var O=Wf;else if(Ff(g))if(Kv)O=MN;else{O=AN;var F=zN}else b=g.nodeName,!b||b.toLowerCase()!=="input"||g.type!=="checkbox"&&g.type!=="radio"?f&&Vm(f.elementType)&&(O=Wf):O=RN;if(O&&(O=O(e,f))){Zv(x,O,a,$);break e}F&&F(e,g,f)}switch(F=f?ys(f):window,e){case"focusin":(Ff(F)||F.contentEditable==="true")&&(Jo=F,Vh=f,Ss=null);break;case"focusout":Ss=Vh=Jo=null;break;case"mousedown":Dh=!0;break;case"contextmenu":case"mouseup":case"dragend":Dh=!1,nb(x,a,$);break;case"selectionchange":if(VN)break;case"keydown":case"keyup":nb(x,a,$)}var H;if(Hm)e:{switch(e){case"compositionstart":var L="onCompositionStart";break e;case"compositionend":L="onCompositionEnd";break e;case"compositionupdate":L="onCompositionUpdate";break e}L=void 0}else Ko?Xv(e,a)&&(L="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(L="onCompositionStart");L&&(Yv&&a.locale!=="ko"&&(Ko||L!=="onCompositionStart"?L==="onCompositionEnd"&&Ko&&(H=Gv()):(ni=$,_m="value"in ni?ni.value:ni.textContent,Ko=!0)),F=uu(f,L),0<F.length&&(L=new Zf(L,e,null,a,$),x.push({event:L,listeners:F}),H?L.data=H:(H=Qv(a),H!==null&&(L.data=H)))),(H=SN?kN(e,a):TN(e,a))&&(L=uu(f,"onBeforeInput"),0<L.length&&(F=new Zf("onBeforeInput","beforeinput",null,a,$),x.push({event:F,listeners:L}),F.data=H)),S5(x,e,f,a,$)}jw(x,t)})}function Ys(e,t,a){return{instance:e,listener:t,currentTarget:a}}function uu(e,t){for(var a=t+"Capture",i=[];e!==null;){var o=e,s=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||s===null||(o=_s(e,a),o!=null&&i.unshift(Ys(e,o,s)),o=_s(e,t),o!=null&&i.push(Ys(e,o,s))),e.tag===3)return i;e=e.return}return[]}function T5(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Xb(e,t,a,i,o){for(var s=t._reactName,c=[];a!==null&&a!==i;){var d=a,h=d.alternate,f=d.stateNode;if(d=d.tag,h!==null&&h===i)break;d!==5&&d!==26&&d!==27||f===null||(h=f,o?(f=_s(a,s),f!=null&&c.unshift(Ys(a,f,h))):o||(f=_s(a,s),f!=null&&c.push(Ys(a,f,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var E5=/\r\n?/g,C5=/\u0000|\uFFFD/g;function Qb(e){return(typeof e=="string"?e:""+e).replace(E5,`
`).replace(C5,"")}function Yw(e,t){return t=Qb(t),Qb(e)===t}function Me(e,t,a,i,o,s){switch(a){case"children":if(typeof i=="string")t==="body"||t==="textarea"&&i===""||gr(e,i);else if(typeof i=="number"||typeof i=="bigint")t!=="body"&&gr(e,""+i);else return;break;case"className":ac(e,"class",i);break;case"tabIndex":ac(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":ac(e,a,i);break;case"style":Lv(e,i,s);return;case"data":if(t!=="object"){ac(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=wc(i),e.setAttribute(a,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(t!=="input"&&Me(e,t,"name",o.name,o,null),Me(e,t,"formEncType",o.formEncType,o,null),Me(e,t,"formMethod",o.formMethod,o,null),Me(e,t,"formTarget",o.formTarget,o,null)):(Me(e,t,"encType",o.encType,o,null),Me(e,t,"method",o.method,o,null),Me(e,t,"target",o.target,o,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=wc(i),e.setAttribute(a,i);break;case"onClick":i!=null&&(e.onclick=ln);return;case"onScroll":i!=null&&ge("scroll",e);return;case"onScrollEnd":i!=null&&ge("scrollend",e);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(M(61));if(a=i.__html,a!=null){if(o.children!=null)throw Error(M(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}a=wc(i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":i===!0?e.setAttribute(a,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(a,i):e.removeAttribute(a);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(a):e.setAttribute(a,i);break;case"popover":ge("beforetoggle",e),ge("toggle",e),yc(e,"popover",i);break;case"xlinkActuate":En(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":En(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":En(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":En(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":En(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":En(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":En(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":En(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":En(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":yc(e,"is",i);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=Kx.get(a)||a,yc(e,a,i);else return}Ne=!0}function vm(e,t,a,i,o,s){switch(a){case"style":Lv(e,i,s);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(M(61));if(a=i.__html,a!=null){if(o.children!=null)throw Error(M(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof i=="string")gr(e,i);else if(typeof i=="number"||typeof i=="bigint")gr(e,""+i);else return;break;case"onScroll":i!=null&&ge("scroll",e);return;case"onScrollEnd":i!=null&&ge("scrollend",e);return;case"onClick":i!=null&&(e.onclick=ln);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!_v.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),s=a.slice(2,o?a.length-7:void 0),t=e[aa]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(s,t,o),typeof i=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(s,i,o);break e}Ne=!0,a in e?e[a]=i:i===!0?e.setAttribute(a,""):yc(e,a,i)}return}Ne=!0}function Mt(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ge("error",e),ge("load",e);var i=!1,o=!1,s;for(s in a)if(a.hasOwnProperty(s)){var c=a[s];if(c!=null)switch(s){case"src":i=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(M(137,t));default:Me(e,t,s,c,a,null)}}o&&Me(e,t,"srcSet",a.srcSet,a,null),i&&Me(e,t,"src",a.src,a,null);return;case"input":ge("invalid",e);var d=s=c=o=null,h=null,f=null;for(i in a)if(a.hasOwnProperty(i)){var $=a[i];if($!=null)switch(i){case"name":o=$;break;case"type":c=$;break;case"checked":h=$;break;case"defaultChecked":f=$;break;case"value":s=$;break;case"defaultValue":d=$;break;case"children":case"dangerouslySetInnerHTML":if($!=null)throw Error(M(137,t));break;default:Me(e,t,i,$,a,null)}}Uv(e,s,d,h,f,c,o,!1);return;case"select":ge("invalid",e),i=c=s=null;for(o in a)if(a.hasOwnProperty(o)&&(d=a[o],d!=null))switch(o){case"value":s=d;break;case"defaultValue":c=d;break;case"multiple":i=d;default:Me(e,t,o,d,a,null)}t=s,a=c,e.multiple=!!i,t!=null?ir(e,!!i,t,!1):a!=null&&ir(e,!!i,a,!0);return;case"textarea":ge("invalid",e),s=o=i=null;for(c in a)if(a.hasOwnProperty(c)&&(d=a[c],d!=null))switch(c){case"value":i=d;break;case"defaultValue":o=d;break;case"children":s=d;break;case"dangerouslySetInnerHTML":if(d!=null)throw Error(M(91));break;default:Me(e,t,c,d,a,null)}Bv(e,i,o,s);return;case"option":for(h in a)a.hasOwnProperty(h)&&(i=a[h],i!=null)&&(h==="selected"?e.selected=i&&typeof i!="function"&&typeof i!="symbol":Me(e,t,h,i,a,null));return;case"dialog":ge("beforetoggle",e),ge("toggle",e),ge("cancel",e),ge("close",e);break;case"iframe":case"object":ge("load",e);break;case"video":case"audio":for(i=0;i<Gs.length;i++)ge(Gs[i],e);break;case"image":ge("error",e),ge("load",e);break;case"details":ge("toggle",e);break;case"embed":case"source":case"link":ge("error",e),ge("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(f in a)if(a.hasOwnProperty(f)&&(i=a[f],i!=null))switch(f){case"children":case"dangerouslySetInnerHTML":throw Error(M(137,t));default:Me(e,t,f,i,a,null)}return;default:if(Vm(t)){for($ in a)a.hasOwnProperty($)&&(i=a[$],i!==void 0&&vm(e,t,$,i,a,void 0));return}}for(d in a)a.hasOwnProperty(d)&&(i=a[d],i!=null&&Me(e,t,d,i,a,null))}var z5={};function A5(e,t,a,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,s=null,c=null,d=null,h=null,f=null,$=null;for(b in a){var x=a[b];if(a.hasOwnProperty(b)&&x!=null)switch(b){case"checked":break;case"value":break;case"defaultValue":h=x;default:i.hasOwnProperty(b)||Me(e,t,b,null,i,x)}}for(var g in i){var b=i[g];if(x=a[g],i.hasOwnProperty(g)&&(b!=null||x!=null))switch(g){case"type":b!==x&&(Ne=!0),s=b;break;case"name":b!==x&&(Ne=!0),o=b;break;case"checked":b!==x&&(Ne=!0),f=b;break;case"defaultChecked":b!==x&&(Ne=!0),$=b;break;case"value":b!==x&&(Ne=!0),c=b;break;case"defaultValue":b!==x&&(Ne=!0),d=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(M(137,t));break;default:b!==x&&Me(e,t,g,b,i,x)}}Ah(e,c,d,h,f,$,s,o);return;case"select":b=c=d=g=null;for(s in a)if(h=a[s],a.hasOwnProperty(s)&&h!=null)switch(s){case"value":break;case"multiple":b=h;default:i.hasOwnProperty(s)||Me(e,t,s,null,i,h)}for(o in i)if(s=i[o],h=a[o],i.hasOwnProperty(o)&&(s!=null||h!=null))switch(o){case"value":s!==h&&(Ne=!0),g=s;break;case"defaultValue":s!==h&&(Ne=!0),d=s;break;case"multiple":s!==h&&(Ne=!0),c=s;default:s!==h&&Me(e,t,o,s,i,h)}t=d,a=c,i=b,g!=null?ir(e,!!a,g,!1):!!i!=!!a&&(t!=null?ir(e,!!a,t,!0):ir(e,!!a,a?[]:"",!1));return;case"textarea":b=g=null;for(d in a)if(o=a[d],a.hasOwnProperty(d)&&o!=null&&!i.hasOwnProperty(d))switch(d){case"value":break;case"children":break;default:Me(e,t,d,null,i,o)}for(c in i)if(o=i[c],s=a[c],i.hasOwnProperty(c)&&(o!=null||s!=null))switch(c){case"value":o!==s&&(Ne=!0),g=o;break;case"defaultValue":o!==s&&(Ne=!0),b=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(M(91));break;default:o!==s&&Me(e,t,c,o,i,s)}qv(e,g,b);return;case"option":for(var C in a)g=a[C],a.hasOwnProperty(C)&&g!=null&&!i.hasOwnProperty(C)&&(C==="selected"?e.selected=!1:Me(e,t,C,null,i,g));for(h in i)g=i[h],b=a[h],i.hasOwnProperty(h)&&g!==b&&(g!=null||b!=null)&&(h==="selected"?(g!==b&&(Ne=!0),e.selected=g&&typeof g!="function"&&typeof g!="symbol"):Me(e,t,h,g,i,b));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var E in a)g=a[E],a.hasOwnProperty(E)&&g!=null&&!i.hasOwnProperty(E)&&Me(e,t,E,null,i,g);for(f in i)if(g=i[f],b=a[f],i.hasOwnProperty(f)&&g!==b&&(g!=null||b!=null))switch(f){case"children":case"dangerouslySetInnerHTML":if(g!=null)throw Error(M(137,t));break;default:Me(e,t,f,g,i,b)}return;default:if(Vm(t)){for(var R in a)g=a[R],a.hasOwnProperty(R)&&g!==void 0&&!i.hasOwnProperty(R)&&vm(e,t,R,void 0,i,g);for($ in i)g=i[$],b=a[$],!i.hasOwnProperty($)||g===b||g===void 0&&b===void 0||vm(e,t,$,g,i,b);return}}for(var w in a)g=a[w],a.hasOwnProperty(w)&&g!=null&&!i.hasOwnProperty(w)&&Me(e,t,w,null,i,g);for(x in i)g=i[x],b=a[x],!i.hasOwnProperty(x)||g===b||g==null&&b==null||Me(e,t,x,g,i,b)}function Zb(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function R5(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),i=0;i<a.length;i++){var o=a[i],s=o.transferSize,c=o.initiatorType,d=o.duration;if(s&&d&&Zb(c)){for(c=0,d=o.responseEnd,i+=1;i<a.length;i++){var h=a[i],f=h.startTime;if(f>d)break;var $=h.transferSize,x=h.initiatorType;$&&Zb(x)&&(h=h.responseEnd,c+=$*(h<d?1:(d-f)/(h-f)))}if(--i,t+=8*(s+c)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var ym=null,wm=null;function Xs(e){return e.nodeType===9?e:e.ownerDocument}function Kb(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Xw(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Qw(e,t,a,i){return a=Xs(a).createElement(e),a[Ct]=i,a[aa]=t,Mt(a,e,t),yt(a),a}function $m(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var gh=null;function M5(){var e=window.event;return e&&e.type==="popstate"?e===gh?!1:(gh=e,!0):(gh=null,!1)}var wp=typeof setTimeout=="function"?setTimeout:void 0,O5=typeof clearTimeout=="function"?clearTimeout:void 0,Jb=typeof Promise=="function"?Promise:void 0,Pb=typeof requestAnimationFrame=="function"?requestAnimationFrame:wp,V5=typeof queueMicrotask=="function"?queueMicrotask:typeof Jb<"u"?function(e){return Jb.resolve(null).then(e).catch(D5)}:wp;function D5(e){setTimeout(function(){throw e})}function Si(e){return e==="head"}function Fb(e,t){var a=t,i=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(i===0){e.removeChild(o),kr(t);return}i--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")i++;else if(a==="html")bh(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,bh(a);for(var s=a.firstChild;s;){var c=s.nextSibling,d=s.nodeName;s[tl]||d==="SCRIPT"||d==="STYLE"||d==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=c}}else a==="body"&&bh(e.ownerDocument.body);a=o}while(a);kr(t)}function Wb(e,t){var a=e;e=0;do{var i=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),i&&i.nodeType===8)if(a=i.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=i}while(a)}function Zw(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var i=1;else for(var o=i=0;o<t.length;o++){var s=t[o];0<s.width&&0<s.height&&i++}i===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function Kw(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function Jw(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function xm(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return Jw(t,a,e)}function _5(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return Jw(t,a,e)}function I5(e){return e.documentElement.clientHeight}function H5(e){this.addEventListener("load",e),this.addEventListener("error",e)}function U5(e,t,a,i,o,s,c,d,h){var f=t.nodeType===9?t:t.ownerDocument;try{var $=f.startViewTransition({update:function(){var g=f.defaultView,b=g.navigation&&g.navigation.transition,C=f.fonts.status;i();var E=[];if(C==="loaded"&&(I5(f),f.fonts.status==="loading"&&E.push(f.fonts.ready)),C=E.length,e!==null)for(var R=e.suspenseyImages,w=0,y=0;y<R.length;y++){var v=R[y];if(!v.complete){var k=v.getBoundingClientRect();if(0<k.bottom&&0<k.right&&k.top<g.innerHeight&&k.left<g.innerWidth){if(w+=l0(v),w>Dc){E.length=C;break}v=new Promise(H5.bind(v)),E.push(v)}}}if(0<E.length)return g=Promise.race([Promise.all(E),new Promise(function(O){return setTimeout(O,500)})]).then(o,o),(b?Promise.allSettled([b.finished,g]):g).then(s,s);if(o(),b)return b.finished.then(s,s);s()},types:a});f.__reactViewTransition=$;var x=[];return $.ready.then(function(){for(var g=f.documentElement.getAnimations({subtree:!0}),b=0;b<g.length;b++){var C=g[b],E=C.effect,R=E.pseudoElement;if(R!=null&&R.startsWith("::view-transition")){x.push(C),C=E.getKeyframes();for(var w=R=void 0,y=!0,v=0;v<C.length;v++){var k=C[v],O=k.width;if(R===void 0)R=O;else if(R!==O){y=!1;break}if(O=k.height,w===void 0)w=O;else if(w!==O){y=!1;break}delete k.width,delete k.height,k.transform==="none"&&delete k.transform}y&&R!==void 0&&w!==void 0&&(E.setKeyframes(C),y=getComputedStyle(E.target,E.pseudoElement),y.width!==R||y.height!==w)&&(y=C[0],y.width=R,y.height=w,y=C[C.length-1],y.width=R,y.height=w,E.setKeyframes(C))}}c()},function(g){f.__reactViewTransition===$&&(f.__reactViewTransition=null);try{typeof g=="object"&&g!==null&&g.name==="InvalidStateError"&&(g.message==="View transition was skipped because document visibility state is hidden."||g.message==="Skipping view transition because document visibility state has become hidden."||g.message==="Skipping view transition because viewport size changed."||g.message==="Transition was aborted because of invalid state")&&(g=null),g!==null&&h(g)}finally{i(),o(),c()}}),$.finished.finally(function(){for(var g=0;g<x.length;g++)x[g].cancel();f.__reactViewTransition===$&&(f.__reactViewTransition=null),d()}),$}catch{return i(),o(),c(),null}}function Yi(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Yi.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:Le({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Yi.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),i=[],o=0;o<a.length;o++){var s=a[o].effect;s!==null&&s.target===e&&s.pseudoElement===t&&i.push(a[o])}return i};Yi.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function Pw(e){return{name:e,group:new Yi("group",e),imagePair:new Yi("image-pair",e),old:new Yi("old",e),new:new Yi("new",e)}}function ba(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}ba.prototype.addEventListener=function(e,t,a){var i=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(i=a.signal||null,i!==null&&i.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var s=this._eventListeners;if(Fw(s,e,t,a)===-1){var c=this,d=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(d=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),i!==null&&(o=c.removeEventListener.bind(c,e,t,a),i.addEventListener("abort",o,{once:!0}),o=i.removeEventListener.bind(i,"abort",o)),i=$r(a),s.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:d,cleanup:o}),ta(this._fragmentFiber.child,!1,q5,e,d,i)}this._eventListeners=s}};function q5(e,t,a,i){return mt(e).addEventListener(t,a,i),!1}ba.prototype.removeEventListener=function(e,t,a){var i=this._eventListeners;if(i!==null&&(t=Fw(i,e,t,a),t!==-1)){var o=i[t];a=o.attachedListener;var s=o.cleanup;o=$r(o.optionsOrUseCapture),ta(this._fragmentFiber.child,!1,B5,e,a,o),i.splice(t,1),s!==null&&s()}};function B5(e,t,a,i){return mt(e).removeEventListener(t,a,i),!1}function $r(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function ev(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function Fw(e,t,a,i){if(e.length===0)return-1;i=ev(i);for(var o=0;o<e.length;o++){var s=e[o];if(s.type===t&&s.listener===a&&ev(s.optionsOrUseCapture)===i)return o}return-1}ba.prototype.dispatchEvent=function(e){var t=oo(this._fragmentFiber);if(t===null)return!0;t=mt(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var i=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var s=a[o];i.addEventListener(s.type,s.attachedListener,$r(s.optionsOrUseCapture))}if(t.appendChild(i),e=i.dispatchEvent(e),a)for(o=0;o<a.length;o++)s=a[o],i.removeEventListener(s.type,s.attachedListener,$r(s.optionsOrUseCapture));return t.removeChild(i),e}return t.dispatchEvent(e)};ba.prototype.focus=function(e){ta(this._fragmentFiber.child,!0,Ww,e,void 0,void 0)};function Ww(e,t){return e.tag===6?!1:(e=mt(e),W5(e,t))}ba.prototype.focusLast=function(e){var t=[];ta(this._fragmentFiber.child,!0,$p,t,void 0,void 0);for(var a=t.length-1;0<=a&&!Ww(t[a],e);a--);};function $p(e,t){return t.push(e),!1}ba.prototype.blur=function(){var e=oo(this._fragmentFiber);e!==null&&(e=mt(e),e=Xs(e).activeElement,e!==null&&ta(this._fragmentFiber.child,!1,L5,e,void 0,void 0))};function L5(e,t){return e.tag===6?!1:(e=mt(e),e===t||e.contains(t)?(t.blur(),!0):!1)}ba.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),ta(this._fragmentFiber.child,!1,j5,e,void 0,void 0)};function j5(e,t){return e.tag===6||(e=mt(e),t.observe(e)),!1}ba.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),ta(this._fragmentFiber.child,!1,G5,e,void 0,void 0);for(var a=t=0;a<Ga.length;a++){var i=Ga[a];i.fragmentInstance===this&&i.observer===e?e.unobserve(i.instance):Ga[t++]=i}Ga.length=t}};function G5(e,t){return e.tag===6||(e=mt(e),t.unobserve(e)),!1}var Ga=[],fh=!1;function Y5(e,t,a){Ga.push({fragmentInstance:e,observer:t,instance:a}),fh||(fh=!0,eS(function(){fh=!1;var i=Ga;Ga=[];for(var o=0;o<i.length;o++){var s=i[o];s.observer.unobserve(s.instance)}}))}ba.prototype.getClientRects=function(){var e=[];return ta(this._fragmentFiber.child,!1,X5,e,void 0,void 0),e};function X5(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=mt(e),t.push.apply(t,e.getClientRects());return!1}ba.prototype.getRootNode=function(e){var t=oo(this._fragmentFiber);return t===null?this:mt(t).getRootNode(e)};ba.prototype.compareDocumentPosition=function(e){var t=oo(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];ta(this._fragmentFiber.child,!1,$p,a,void 0,void 0);var i=mt(t);if(a.length===0){if(a=i,Of(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=i=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:i&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=$v(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=mt(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=mt(a[0]),o=mt(a[a.length-1]);var s=Of(this._fragmentFiber)?t.parentElement:i;if(s==null)return Node.DOCUMENT_POSITION_DISCONNECTED;i=s.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,s=s.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),d=o.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||d&Node.DOCUMENT_POSITION_CONTAINED_BY;return d=i&&s&&c&Node.DOCUMENT_POSITION_FOLLOWING&&d&Node.DOCUMENT_POSITION_PRECEDING,t=i&&t===e||s&&o===e||h||d?Node.DOCUMENT_POSITION_CONTAINED_BY:!i&&t===e||!s&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||Q5(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function Q5(e,t,a,i,o){var s=Gi(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!s)e:{for(;s!==null;){if(s.tag===7&&(s===t||s.alternate===t)){a=!0;break e}s=s.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(s===null)return s=o.ownerDocument,o===s||o===s.documentElement||o===s.body;e:{for(s=t,t=oo(t);s!==null;){if(!(s.tag!==5&&s.tag!==3&&s.tag!==27||s!==t&&s.alternate!==t)){s=!0;break e}s=s.return}s=!1}return s}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!s)&&!(t=s===a)&&(t=yh(a,s,Vf),t===null?t=!1:(ta(t,!0,Nx,s,a),s=Yo,Yo=null,t=s!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!s)&&!(t=s===i)&&(t=yh(i,s,Vf),t===null?t=!1:(ta(t,!0,Sx,s,i),s=Yo,vh=Yo=null,t=s!==null)),t):!1}function tv(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}ba.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(M(566));var t=[];ta(this._fragmentFiber.child,!1,$p,t,void 0,void 0);var a=e!==!1;if(t.length===0){var i=$v(this._fragmentFiber);if(i=a?i[1]||i[0]||oo(this._fragmentFiber):i[0]||i[1],i===null)return;if(i.tag===6){e=mt(i),tv(e,a);return}if(i=mt(i),i.nodeType!==9){if(i.nodeType===11){a="host"in i?i.host:null,a!==null&&a.scrollIntoView(e);return}i.scrollIntoView(e)}}for(i=a?t.length-1:0;i!==(a?-1:t.length);){var o=t[i];o.tag===6?(o=mt(o),tv(o,a)):mt(o).scrollIntoView(e),i+=a?-1:1}};function Z5(e,t){return e=mt(e),e0(e,t),!1}function e0(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function t0(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var o=a[i];e.addEventListener(o.type,o.attachedListener,$r(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){for(var c=0,d=0;d<Ga.length;d++){var h=Ga[d];(h.fragmentInstance!==t||h.observer!==s||h.instance!==e)&&(Ga[c++]=h)}Ga.length=c,s.observe(e)}),e0(e,t))}function K5(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var o=a[i];e.removeEventListener(o.type,o.attachedListener,$r(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){typeof s.rootMargin=="string"?Y5(t,s,e):s.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function Nm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Nm(a),pu(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function J5(e,t,a,i){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[tl])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(s=e.getAttribute("rel"),s==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(s!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(s=e.getAttribute("src"),(s!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&s&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var s=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===s)return e}else return e;if(e=Aa(e.nextSibling),e===null)break}return null}function P5(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=Aa(e.nextSibling),e===null))return null;return e}function a0(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Aa(e.nextSibling),e===null))return null;return e}function Sm(e){return e.data==="$?"||e.data==="$~"}function xp(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function F5(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var i=function(){t(),a.removeEventListener("DOMContentLoaded",i)};a.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function Aa(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var km=null;function av(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return Aa(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function nv(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function W5(e,t){function a(){i=!0}if(e.ownerDocument.activeElement===e)return!0;var i=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return i}function eS(e){Pb(function(){Pb(function(t){return e(t)})})}function n0(e,t,a){switch(t=Xs(a),e){case"html":if(e=t.documentElement,!e)throw Error(M(452));return e;case"head":if(e=t.head,!e)throw Error(M(453));return e;case"body":if(e=t.body,!e)throw Error(M(454));return e;default:throw Error(M(451))}}function i0(e,t,a){for(var i in a){var o=a[i];a.hasOwnProperty(i)&&o!=null&&Me(e,t,i,null,z5,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===ln&&(e.onclick=null),pu(e)}function bh(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);pu(e)}var Ra=new Map,iv=new Set;function Qs(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var Bn=Te.d;Te.d={f:tS,r:aS,D:nS,C:iS,L:oS,m:rS,X:lS,S:sS,M:cS};function tS(){var e=Bn.f(),t=Cu();return e||t}function aS(e){var t=Er(e);t!==null&&t.tag===5&&t.type==="form"?Ly(t):Bn.r(e)}var Rr=typeof document>"u"?null:document;function o0(e,t,a){var i=Rr;if(i&&typeof t=="string"&&t){var o=Ea(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),iv.has(o)||(iv.add(o),e={rel:e,crossOrigin:a,href:t},i.querySelector(o)===null&&(t=i.createElement("link"),Mt(t,"link",e),yt(t),i.head.appendChild(t)))}}function nS(e){Bn.D(e),o0("dns-prefetch",e,null)}function iS(e,t){Bn.C(e,t),o0("preconnect",e,t)}function oS(e,t,a){Bn.L(e,t,a);var i=Rr;if(i&&e&&t){var o='link[rel="preload"][as="'+Ea(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+Ea(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+Ea(a.imageSizes)+'"]')):o+='[href="'+Ea(e)+'"]';var s=o;switch(t){case"style":s=xr(e);break;case"script":s=Mr(e)}if(!(Ra.has(s)||(e=Le({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),Ra.set(s,e),i.querySelector(o)!==null||t==="style"&&i.querySelector(sl(s))||t==="script"&&i.querySelector(ll(s))))){var c=i.createElement("link");Mt(c,"link",e),t==="style"&&(c[Lc]=!0,c.onload=c.onerror=function(){Vv(c)}),yt(c),i.head.appendChild(c)}}}function rS(e,t){Bn.m(e,t);var a=Rr;if(a&&e){var i=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+Ea(i)+'"][href="'+Ea(e)+'"]',s=o;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=Mr(e)}if(!Ra.has(s)&&(e=Le({rel:"modulepreload",href:e},t),Ra.set(s,e),a.querySelector(o)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(ll(s)))return}i=a.createElement("link"),Mt(i,"link",e),yt(i),a.head.appendChild(i)}}}function sS(e,t,a){Bn.S(e,t,a);var i=Rr;if(i&&e){var o=nr(i).hoistableStyles,s=xr(e);t=t||"default";var c=o.get(s);if(!c){var d={loading:0,preload:null};if(c=i.querySelector(sl(s)))d.loading=5;else{e=Le({rel:"stylesheet",href:e,"data-precedence":t},a),(a=Ra.get(s))&&Np(e,a);var h=c=i.createElement("link");yt(h),Mt(h,"link",e),h._p=new Promise(function(f,$){h.onload=f,h.onerror=$}),h.addEventListener("load",function(){d.loading|=1}),h.addEventListener("error",function(){d.loading|=2}),d.loading|=4,Oc(c,t,i)}c={type:"stylesheet",instance:c,count:1,state:d},o.set(s,c)}}}function lS(e,t){Bn.X(e,t);var a=Rr;if(a&&e){var i=nr(a).hoistableScripts,o=Mr(e),s=i.get(o);s||(s=a.querySelector(ll(o)),s||(e=Le({src:e,async:!0},t),(t=Ra.get(o))&&Sp(e,t),s=a.createElement("script"),yt(s),Mt(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(o,s))}}function cS(e,t){Bn.M(e,t);var a=Rr;if(a&&e){var i=nr(a).hoistableScripts,o=Mr(e),s=i.get(o);s||(s=a.querySelector(ll(o)),s||(e=Le({src:e,async:!0,type:"module"},t),(t=Ra.get(o))&&Sp(e,t),s=a.createElement("script"),yt(s),Mt(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(o,s))}}function ov(e,t,a,i){var o=(o=li.current)?Qs(o):null;if(!o)throw Error(M(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=xr(a.href),t=nr(o).hoistableStyles,i=t.get(a),i||(i={type:"style",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=xr(a.href);var s=nr(o).hoistableStyles,c=s.get(e);if(c||(o=o.ownerDocument||o,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(e,c),(s=o.querySelector(sl(e)))?s._p||(c.instance=s,c.state.loading=5):(s=Ra.get(e),s||(s={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Ra.set(e,s)),uS(o,e,s,c.state))),t&&i===null)throw Error(M(528,""));return c}if(t&&i!==null)throw Error(M(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=Mr(a),t=nr(o).hoistableScripts,i=t.get(a),i||(i={type:"script",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(M(444,e))}}function xr(e){return'href="'+Ea(e)+'"'}function sl(e){return'link[rel="stylesheet"]['+e+"]"}function r0(e){return Le({},e,{"data-precedence":e.precedence,precedence:null})}function uS(e,t,a,i){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Lc]!==!0){i.loading=1;return}}else t=e.createElement("link"),t[Lc]=!0,t.onload=t.onerror=Vv.bind(null,t),Mt(t,"link",a),yt(t),e.head.appendChild(t);i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2})}function Mr(e){return'[src="'+Ea(e)+'"]'}function ll(e){return"script[async]"+e}function rv(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+Ea(a.href)+'"]');if(i)return t.instance=i,yt(i),i;var o=Le({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),yt(i),Mt(i,"style",o),Oc(i,a.precedence,e),t.instance=i;case"stylesheet":o=xr(a.href);var s=e.querySelector(sl(o));if(s)return t.state.loading|=4,t.instance=s,yt(s),s;i=r0(a),(o=Ra.get(o))&&Np(i,o),s=(e.ownerDocument||e).createElement("link"),yt(s);var c=s;return c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),Mt(s,"link",i),t.state.loading|=4,Oc(s,a.precedence,e),t.instance=s;case"script":return s=Mr(a.src),(o=e.querySelector(ll(s)))?(t.instance=o,yt(o),o):(i=a,(o=Ra.get(s))&&(i=Le({},a),Sp(i,o)),e=e.ownerDocument||e,o=e.createElement("script"),yt(o),Mt(o,"link",i),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(M(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Oc(i,a.precedence,e));return t.instance}function Oc(e,t,a){for(var i=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=i.length?i[i.length-1]:null,s=o,c=0;c<i.length;c++){var d=i[c];if(d.dataset.precedence===t)s=d;else if(s!==o)break}s?s.parentNode.insertBefore(e,s.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function Np(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Sp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Vc=null;function sv(e,t,a){if(Vc===null){var i=new Map,o=Vc=new Map;o.set(a,i)}else o=Vc,i=o.get(a),i||(i=new Map,o.set(a,i));if(i.has(e))return i;for(i.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var s=a[o];if(!(s[tl]||s[Ct]||e==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var c=s.getAttribute(t)||"";c=e+c;var d=i.get(c);d?d.push(s):i.set(c,[s])}}return i}function Tm(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function dS(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function lv(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function s0(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function l0(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function cv(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=l0(t),e.suspenseyImages.push(t)),e=pS.bind(e),t.decode().then(e,e))}function hS(e,t,a,i){if(a.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=xr(i.href),s=t.querySelector(sl(o));if(s){t=s._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Zs.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=s,yt(s);return}s=t.ownerDocument||t,i=r0(i),(o=Ra.get(o))&&Np(i,o),s=s.createElement("link"),yt(s);var c=s;c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),Mt(s,"link",i),a.instance=s}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Zs.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Dc=0;function mS(e,t){return e.stylesheets&&e.count===0&&_c(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var i=setTimeout(function(){if(e.stylesheets&&_c(e,e.stylesheets),e.unsuspend){var s=e.unsuspend;e.unsuspend=null,s()}},6e4+t);0<e.imgBytes&&Dc===0&&(Dc=62500*R5());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&_c(e,e.stylesheets),e.unsuspend)){var s=e.unsuspend;e.unsuspend=null,s()}},(e.imgBytes>Dc?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(o)}}:null}function c0(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)_c(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Zs(){this.count--,c0(this)}function pS(){this.imgCount--,c0(this)}var du=null;function _c(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,du=new Map,t.forEach(gS,e),du=null,Zs.call(e))}function gS(e,t){if(!(t.state.loading&4)){var a=du.get(e);if(a)var i=a.get(null);else{a=new Map,du.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<o.length;s++){var c=o[s];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),i=c)}i&&a.set(null,i)}o=t.instance,c=o.getAttribute("data-precedence"),s=a.get(c)||i,s===i&&a.set(null,o),a.set(c,o),this.count++,i=Zs.bind(this),o.addEventListener("load",i),o.addEventListener("error",i),s?s.parentNode.insertBefore(o,s.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var Nr={$$typeof:sn,Provider:null,Consumer:null,_currentValue:Xi,_currentValue2:Xi,_threadCount:0};function fS(e,t,a,i,o,s,c,d,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Yd(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Yd(0),this.hiddenUpdates=Yd(null),this.identifierPrefix=i,this.onUncaughtError=o,this.onCaughtError=s,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function u0(e,t,a,i,o,s,c,d,h,f,$,x){return e=new fS(e,t,a,c,h,f,$,x,d),t=1,s===!0&&(t|=24),s=Wt(3,null,null,t),e.current=s,s.stateNode=e,t=Gm(),t.refCount++,e.pooledCache=t,t.refCount++,s.memoizedState={element:i,isDehydrated:a,cache:t},Qm(s),e}function d0(e){return e?(e=Wo,e):Wo}function h0(e,t,a,i,o,s){o=d0(o),i.context===null?i.context=o:i.pendingContext=o,i=ui(t),i.payload={element:a},s=s===void 0?null:s,s!==null&&(i.callback=s),a=di(e,i,t),a!==null&&(ea(a,e,t),Ts(a,e,t))}function uv(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function kp(e,t){uv(e,t),(e=e.alternate)&&uv(e,t)}function m0(e){if(e.tag===13||e.tag===31){var t=lo(e,67108864);t!==null&&ea(t,e,67108864),kp(e,67108864)}}function dv(e){if(e.tag===13||e.tag===31){var t=ga();t=Mm(t);var a=lo(e,t);a!==null&&ea(a,e,t),kp(e,t)}}var Sr=!0;function bS(e,t,a,i){var o=te.T;te.T=null;var s=Te.p;try{Te.p=2,Tp(e,t,a,i)}finally{Te.p=s,te.T=o}}function vS(e,t,a,i){var o=te.T;te.T=null;var s=Te.p;try{Te.p=8,Tp(e,t,a,i)}finally{Te.p=s,te.T=o}}function Tp(e,t,a,i){if(Sr){var o=Em(i);if(o===null)ph(e,t,i,hu,a),hv(e,i);else if(wS(o,e,t,a,i))i.stopPropagation();else if(hv(e,i),t&4&&-1<yS.indexOf(e)){for(;o!==null;){var s=Er(o);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var c=Bi(s.pendingLanes);if(c!==0){var d=s;for(d.pendingLanes|=2,d.entangledLanes|=2;c;){var h=1<<31-pa(c);d.entanglements[1]|=h,c&=~h}gn(s),(ke&6)===0&&(ru=ha()+500,rl(0,!1))}}break;case 31:case 13:d=lo(s,2),d!==null&&ea(d,s,2),Cu(),kp(s,2)}if(s=Em(i),s===null&&ph(e,t,i,hu,a),s===o)break;o=s}o!==null&&i.stopPropagation()}else ph(e,t,i,null,a)}}function Em(e){return e=Dm(e),Ep(e)}var hu=null;function Ep(e){if(hu=null,e=Gi(e),e!==null){var t=Ps(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=vv(t),e!==null)return e;e=null}else if(a===31){if(e=yv(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return hu=e,null}function p0(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Ox()){case kv:return 2;case Tv:return 8;case Bc:case Vx:return 32;case Ev:return 268435456;default:return 32}default:return 32}}var Cm=!1,gi=null,fi=null,bi=null,Ks=new Map,Js=new Map,ti=[],yS="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function hv(e,t){switch(e){case"focusin":case"focusout":gi=null;break;case"dragenter":case"dragleave":fi=null;break;case"mouseover":case"mouseout":bi=null;break;case"pointerover":case"pointerout":Ks.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Js.delete(t.pointerId)}}function gs(e,t,a,i,o,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:a,eventSystemFlags:i,nativeEvent:s,targetContainers:[o]},t!==null&&(t=Er(t),t!==null&&m0(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function wS(e,t,a,i,o){switch(t){case"focusin":return gi=gs(gi,e,t,a,i,o),!0;case"dragenter":return fi=gs(fi,e,t,a,i,o),!0;case"mouseover":return bi=gs(bi,e,t,a,i,o),!0;case"pointerover":var s=o.pointerId;return Ks.set(s,gs(Ks.get(s)||null,e,t,a,i,o)),!0;case"gotpointercapture":return s=o.pointerId,Js.set(s,gs(Js.get(s)||null,e,t,a,i,o)),!0}return!1}function g0(e){var t=Gi(e.target);if(t!==null){var a=Ps(t);if(a!==null){if(t=a.tag,t===13){if(t=vv(a),t!==null){e.blockedOn=t,Hf(e.priority,function(){dv(a)});return}}else if(t===31){if(t=yv(a),t!==null){e.blockedOn=t,Hf(e.priority,function(){dv(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Ic(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=Em(e.nativeEvent);if(a===null){a=e.nativeEvent;var i=new a.constructor(a.type,a);Rh=i,a.target.dispatchEvent(i),Rh=null}else return t=Er(a),t!==null&&m0(t),e.blockedOn=a,!1;t.shift()}return!0}function mv(e,t,a){Ic(e)&&a.delete(t)}function $S(){Cm=!1,gi!==null&&Ic(gi)&&(gi=null),fi!==null&&Ic(fi)&&(fi=null),bi!==null&&Ic(bi)&&(bi=null),Ks.forEach(mv),Js.forEach(mv)}function bc(e,t){e.blockedOn===t&&(e.blockedOn=null,Cm||(Cm=!0,pt.unstable_scheduleCallback(pt.unstable_NormalPriority,$S)))}var vc=null;function pv(e){vc!==e&&(vc=e,pt.unstable_scheduleCallback(pt.unstable_NormalPriority,function(){vc===e&&(vc=null);for(var t=0;t<e.length;t+=3){var a=e[t],i=e[t+1],o=e[t+2];if(typeof i!="function"){if(Ep(i||a)===null)continue;break}var s=Er(a);s!==null&&(e.splice(t,3),t-=3,Qh(s,{pending:!0,data:o,method:a.method,action:i},i,o))}}))}function kr(e){function t(h){return bc(h,e)}gi!==null&&bc(gi,e),fi!==null&&bc(fi,e),bi!==null&&bc(bi,e),Ks.forEach(t),Js.forEach(t);for(var a=0;a<ti.length;a++){var i=ti[a];i.blockedOn===e&&(i.blockedOn=null)}for(;0<ti.length&&(a=ti[0],a.blockedOn===null);)g0(a),a.blockedOn===null&&ti.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(i=0;i<a.length;i+=3){var o=a[i],s=a[i+1],c=o[aa]||null;if(typeof s=="function")c||pv(a);else if(c){var d=null;if(s&&s.hasAttribute("formAction")){if(o=s,c=s[aa]||null)d=c.formAction;else if(Ep(o)!==null)continue}else d=c.action;typeof d=="function"?a[i+1]=d:(a.splice(i,3),i-=3),pv(a)}}}function f0(){function e(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(c){return o=c})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),i||setTimeout(a,20)}function a(){if(!i&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function Cp(e){this._internalRoot=e}Ru.prototype.render=Cp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(M(409));var a=t.current,i=ga();h0(a,i,e,t,null,null)};Ru.prototype.unmount=Cp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;h0(e.current,2,null,e,null,null),Cu(),t[Tr]=null}};function Ru(e){this._internalRoot=e}Ru.prototype.unstable_scheduleHydration=function(e){if(e){var t=Ov();e={blockedOn:null,target:e,priority:t};for(var a=0;a<ti.length&&t!==0&&t<ti[a].priority;a++);ti.splice(a,0,e),a===0&&g0(e)}};var gv=fv.version;if(gv!=="19.3.0")throw Error(M(527,gv,"19.3.0"));Te.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(M(188)):(e=Object.keys(e).join(","),Error(M(268,e)));return e=xx(t),e=e!==null?wv(e):null,e=e===null?null:e.stateNode,e};var xS={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:te,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(fs=__REACT_DEVTOOLS_GLOBAL_HOOK__,!fs.isDisabled&&fs.supportsFiber))try{Fs=fs.inject(xS),ma=fs}catch{}var fs;Mu.createRoot=function(e,t){if(!bv(e))throw Error(M(299));var a=!1,i="",o=Jy,s=Py,c=Fy;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=u0(e,1,!1,null,null,a,i,null,o,s,c,f0),e[Tr]=t.current,yp(e),new Cp(t)};Mu.hydrateRoot=function(e,t,a){if(!bv(e))throw Error(M(299));var i=!1,o="",s=Jy,c=Py,d=Fy,h=null;return a!=null&&(a.unstable_strictMode===!0&&(i=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(d=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=u0(e,1,!0,t,a??null,i,o,h,s,c,d,f0),t.context=d0(null),a=t.current,i=ga(),i=Mm(i),o=ui(i),o.callback=null,di(a,o,i),a=i,t.current.lanes=a,el(t,a),gn(t),e[Tr]=t.current,yp(e),new Ru(t)};Mu.version="19.3.0"});var w0=Wa((L2,y0)=>{"use strict";function v0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(v0)}catch(e){console.error(e)}}v0(),y0.exports=b0()});var H0=Wa(Du=>{"use strict";var zS=Symbol.for("react.transitional.element"),AS=Symbol.for("react.fragment");function I0(e,t,a){var i=null;if(a!==void 0&&(i=""+a),t.key!==void 0&&(i=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:zS,type:e,key:i,ref:t!==void 0?t:null,props:a}}Du.Fragment=AS;Du.jsx=I0;Du.jsxs=I0});var Rp=Wa((F2,U0)=>{"use strict";U0.exports=H0()});var m=Yl(Ql()),l1=Yl(w0());function NS(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),i="",o=[],s=[];for(let c=0;c<a.length;c++){let d=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(d)?.[1];if(h&&(i?h[0]===i[0]&&h.length>=i.length&&(i=""):i=h),!i&&!d.trim()&&(!t||c<a.length-1)){let f=o.join(`
`).trim();f&&s.push(f),o=[]}else o.push(d)}if(!t){let c=o.join(`
`).trim();c&&s.push(c)}return s}var SS=['"',"'","\u201D","\u2019","\xBB","\u300D"],kS=['"',"'","\u201C","\u2018","\xAB","\u300C"];function $0(e){let t=e.trim();return SS.includes(t.slice(-1))&&kS.some(i=>t.slice(0,-1).includes(i))?"speech":"prose"}function x0(e,t){let a=NS(e),i=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return i();let o=[],s=[],c=[],d=[];for(let h=0;h<a.length;h+=1){let f=t[h];if(f.kind==="untagged"){o.push(a[h]),s.push(d),c.push(f.expression??null),d=[];continue}let $={register:f.kind==="whisper"?"whisper":"side",text:f.text,...f.target?{target:f.target}:{}};o.length?s[s.length-1].push($):d.push($)}return o.length===0?i():{paragraphs:o,asides:s,expressions:c}}var TS="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function uo(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],i=new RegExp(TS,"g"),o=0,s,c=d=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+d};return}a.push({kind:"text",text:d})};for(;(s=i.exec(e))!==null;)s.index>o&&c(e.slice(o,s.index)),s[1]!=null?c(s[1]):s[2]!=null&&s[3]!=null?a.push({kind:"link",text:s[2],href:s[3]}):s[4]!=null?a.push({kind:"code",text:s[4]}):s[5]!=null?a.push({kind:"styled",style:"highlight",children:uo(s[5],t+1)}):s[6]!=null?a.push({kind:"styled",style:"strikethrough",children:uo(s[6],t+1)}):s[7]!=null?a.push({kind:"styled",style:"bold-italic",children:uo(s[7],t+1)}):s[8]!=null?a.push({kind:"styled",style:"bold",children:uo(s[8],t+1)}):s[9]!=null?a.push({kind:"styled",style:"underline",children:uo(s[9],t+1)}):(s[10]!=null||s[11]!=null)&&a.push({kind:"styled",style:"italic",children:uo(s[10]??s[11],t+1)}),o=s.index+s[0].length;return o<e.length&&c(e.slice(o)),a}function N0(e){return uo(e,0)}function Ln(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function S0(e){return e===null||typeof e=="string"}function k0(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function Ou(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function ES(e){return e===null?!0:Ln(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function CS(e){if(!Ln(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!Ou(e.capabilities)||!Ln(e.presentation)||!Ln(e.occupancy)||!Ln(e.state))return!1;let{presentation:t,occupancy:a,state:i}=e;return ES(t.image)&&k0(t.x)&&k0(t.y)&&typeof a.playerHome=="boolean"&&S0(a.residentCharacterId)&&S0(a.homeKind)&&typeof i.condition=="string"&&Ou(i.upgrades)&&Ou(i.furniture)&&Ou(i.publicFacts)&&typeof i.updatedAt=="string"}function T0(e){if(!Ln(e)||!Ln(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(CS),i=Array.isArray(e.venueRequests)?e.venueRequests:[],o=i.filter(s=>Ln(s)&&typeof s.id=="string"&&Ln(s.venueDraft)&&typeof s.venueDraft.name=="string"&&typeof s.venueDraft.category=="string");return a.length===t.length&&o.length===i.length&&i===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function E0(e,t,a){return e==="Enter"&&!t&&!a}function cl(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,i=>i.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function C0(e,t,a,i){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(i,o)}function Or(e,t){return t?.roomId===e}function z0(e,t){return e.status==="closed"&&e.submissions?.some(a=>a.id===t)===!0}function A0(e,t){return t<0||t===e?"front":t<e?"left":"right"}function R0(e,t,a){let i=a==="front"?"front":"side",o=e.find(s=>s.view===i&&s.label===t)??e.find(s=>s.view===i&&s.label==="neutral")??e.find(s=>s.view==="front"&&s.label===t)??e.find(s=>s.view==="front"&&s.label==="neutral");return o?{image:o,mirrored:o.view==="side"&&a==="left"}:null}function M0(e,t,a){let i=.2*a.photoWidth/a.width,o=.2*a.photoHeight/a.height;return t.some(s=>s.x!==null&&s.y!==null&&Math.abs(s.x-e.x)<i&&Math.abs(s.y-e.y)<o)}function O0(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var ki=(e,t,a)=>Math.min(a,Math.max(t,e));function Vu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function zp(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let i=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,Vu(e,t)),s=e.width*i*o,c=e.height*i*o,d=t.width/2-a.centerX*s,h=t.height/2-a.centerY*c;return{left:s<=t.width?(t.width-s)/2:ki(d,t.width-s,0),top:c<=t.height?(t.height-c)/2:ki(h,t.height-c,0),width:s,height:c}}function V0(e,t,a,i,o,s){let c=zp(e,t,a);if(!c.width||!c.height)return a;let d=Vu(e,t),h=ki(a.zoom*s,d,Math.max(4,d*2)),f=h/Math.max(a.zoom,d),$=c.width*f,x=c.height*f,g=(i.x-c.left)/c.width,b=(i.y-c.top)/c.height,C=o.x-g*$,E=o.y-b*x;return{zoom:h,centerX:ki((t.width/2-C)/$,0,1),centerY:ki((t.height/2-E)/x,0,1)}}function D0(e,t){let a=Math.max(1,t),i=Math.max(4,a*2);return .32+1.03*((ki(e,a,i)-a)/(i-a))}function _0(e,t){return t?Math.max(1,e):e}function Ap(e,t,a){let i=Math.min(90,t.width/2),o=64,s=116,c=e.left+a.x*e.width,d=e.top+a.y*e.height,h=d+o,f=h+s<=t.height?h:d-o-s;return{left:ki(c,i,t.width-i),top:ki(f,0,Math.max(0,t.height-s))}}var r=Yl(Rp()),n="marinara-capability-villages",q0="marinara-capability-villages-styles",RS="/api/villages",MS=.7,Bp=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],Mp=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),OS={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},go=e=>Bp.find(t=>t.value===e),VS=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,B0={roads:"auto",structures:"auto",water:"auto"},_u=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],L0=1,Op=3,DS={residence:["A modest stone home, with ivy growing on the walls","A tent and hammock pitched in the shade between two pine trees","A mighty castle, with imposing obsidian pillars and multiple dungeons","A dumpster behind the supermarket","An armored cash transport car, converted into a mobile home"],gathering:["A communal fire pit, with logs and stumps arranged around it in a semicircle","A decommissioned pizzeria, complete with inert animatronic performers","The situation room, with a round table bearing strategic maps","The hardy Brandythrone tavern, where ale and fistfights are plentiful","A meticulously-landscaped public park, where trampling the roses is punishable by fine"]},Vp="__villages_image_disabled__",qu=["neutral","happy","sad","angry","surprised","thinking"];function j0(e,t,a,i,o=!1,s=1){let c=t==="gathering"?"Gathering Place":o?"Your residence":`Residence ${s}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:i},occupancy:{playerHome:o,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}function _S(e){let t=[];for(let a of e){let i=t[t.length-1];i&&i.label===a.dateLabel?i.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}var c1={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function Iu(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function IS(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let i=Math.floor(a/36e5),o=Math.max(1,Math.ceil(a%36e5/6e4));return i>0?`${i}h ${o}m left`:`${o}m left`}function HS({library:e,busy:t,onRefresh:a,onForget:i}){let[o,s]=(0,m.useState)("all"),[c,d]=(0,m.useState)(""),[h,f]=(0,m.useState)(""),[$,x]=(0,m.useState)(null),[g,b]=(0,m.useState)(""),C=Date.now(),E=(v,k)=>(!h.trim()||`${v} ${k.map(O=>O.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||k.some(O=>O.id===c)),R=(e?.recollections??[]).filter(v=>E(v.text,[...v.subjects,...v.knownBy])),w=(e?.durable??[]).filter(v=>E(v.text,[...v.subjects,...v.knownBy])),y=async(v,k)=>{try{let O=await D(`/rooms/archive/${encodeURIComponent(v)}`);x({visit:O.visit,lineIds:k}),b("")}catch(O){x(null),b(B(O,"The source visit could not be read."))}};return(0,r.jsxs)("div",{className:`${n}-memory-library`,children:[(0,r.jsxs)("section",{className:`${n}-memory-hero`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${n}-memory-kicker`,children:"Continuity, with receipts"}),(0,r.jsx)("h3",{children:"What your villagers carry forward"}),(0,r.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,r.jsxs)("div",{className:`${n}-memory-stats`,children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,r.jsxs)("div",{className:`${n}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"01"}),(0,r.jsx)("strong",{children:"Passing"}),(0,r.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"02"}),(0,r.jsx)("strong",{children:"Durable"}),(0,r.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"03"}),(0,r.jsx)("strong",{children:"Archive"}),(0,r.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,r.jsxs)("div",{className:`${n}-memory-health`,role:"status",children:[(0,r.jsx)("span",{children:"\u25C7"}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,r.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,r.jsxs)("div",{className:`${n}-memory-toolbar`,children:[(0,r.jsx)("div",{className:`${n}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([v,k])=>(0,r.jsx)("button",{type:"button","data-active":o===v,onClick:()=>s(v),children:k},v))}),(0,r.jsx)("input",{type:"search",value:h,onChange:v=>f(v.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,r.jsxs)("select",{value:c,onChange:v=>d(v.target.value),"aria-label":"Filter memories by resident",children:[(0,r.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(v=>(0,r.jsx)("option",{value:v.id,children:v.name},v.id))]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&o!=="durable"&&R.length>0?(0,r.jsxs)("section",{className:`${n}-memory-section`,children:[(0,r.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,r.jsx)("h3",{children:"Passing recollections"})]}),(0,r.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,r.jsx)("div",{className:`${n}-memory-grid`,children:R.map(v=>{let k=v.evidence[v.evidence.length-1]??{visitId:v.visitId,lineIds:[]};return(0,r.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"passing",children:[(0,r.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${n}-memory-pill`,children:"Passing"}),(0,r.jsx)("span",{children:IS(v.expiresAt,C)})]}),(0,r.jsx)("p",{className:`${n}-memory-text`,children:v.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:Iu(v.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:Iu(v.knownBy)})]})]}),v.reinforcementCount>0?(0,r.jsxs)("p",{className:`${n}-memory-reinforced`,children:["\u21BB Reinforced ",v.reinforcementCount," ",v.reinforcementCount===1?"time":"times"]}):null,(0,r.jsxs)("div",{className:`${n}-memory-card-actions`,children:[(0,r.jsx)("button",{type:"button",onClick:()=>{y(k.visitId,k.lineIds)},children:"View evidence"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>i("recollections",v.id),children:"Let go"})]})]},v.id)})})]}):null,e&&o!=="passing"&&w.length>0?(0,r.jsxs)("section",{className:`${n}-memory-section`,children:[(0,r.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,r.jsx)("h3",{children:"Durable memories"})]}),(0,r.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,r.jsx)("div",{className:`${n}-memory-grid`,children:w.map(v=>(0,r.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"durable",children:[(0,r.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${n}-memory-pill`,children:v.memoryCategory?c1[v.memoryCategory]:v.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,r.jsxs)("span",{children:[v.dateLabel,Lp(v)?` \xB7 ${Lp(v)}`:""]})]}),(0,r.jsx)("p",{className:`${n}-memory-text`,children:v.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:Iu(v.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:Iu(v.knownBy)})]})]}),(0,r.jsxs)("div",{className:`${n}-memory-card-actions`,children:[v.evidence?(0,r.jsx)("button",{type:"button",onClick:()=>{y(v.evidence.visitId,v.evidence.lineIds)},children:"View evidence"}):(0,r.jsx)("span",{className:`${n}-memory-legacy`,children:"No evidence link on this older memory"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>i("durable",v.id),children:"Forget"})]})]},v.id))})]}):null,e&&(o!=="durable"&&R.length||o!=="passing"&&w.length)===0?(0,r.jsxs)("div",{className:`${n}-memory-empty`,children:[(0,r.jsx)("span",{children:"\u2727"}),(0,r.jsx)("h3",{children:"No memories match"}),(0,r.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,r.jsxs)("p",{className:`${n}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,g?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:g}):null,$?(0,r.jsxs)("section",{className:`${n}-memory-evidence`,children:[(0,r.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,r.jsxs)("h3",{children:["Exact evidence \xB7 ",$.visit.placeName]})]}),(0,r.jsx)("button",{type:"button",onClick:()=>x(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,r.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,r.jsx)("ol",{children:$.visit.lines.filter(v=>$.lineIds.includes(v.id)).map(v=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:v.name||"Player"}),(0,r.jsxs)("small",{children:[Bu(v.at)," \xB7 heard by"," ",v.heardBy.map(k=>$.visit.participants.find(O=>O.characterId===k)?.name??k).join(", ")||"no one"]})]}),Dr(v.content,`memory-evidence-${v.id}-`)]},v.id))})]}):null]})}function Bu(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":p1.format(t)}function Lp(e){return Bu(e.occurredAt)}function US(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function G0(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Dp(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var qS=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function BS(e,t){let a=[],i=Date.parse(e);if(Number.isFinite(i)){let s=Math.floor((Date.now()-i)/864e5);a.push(s<=0?"written today":s===1?"written yesterday":`written ${s} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${qS.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function LS(e,t){let a=e.find(i=>i.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(i=>i.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?$t(a,t.spaceClass).image:null)?.url??"":""}var jp=class extends m.Component{constructor(){super(...arguments);Fg(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let i=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=i,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:i},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${n}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${n}-panel`,children:[(0,r.jsx)("h1",{className:`${n}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${n}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},jS=`
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
.${n}-sectioned-menu .${n}-menu-nav { display: none; }
.${n}-mobile-menu-nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr)); gap: .5rem; }
.${n}-mobile-menu-nav .${n}-button { min-height: 2.75rem; text-align: left; }
.${n}-mobile-menu-nav .${n}-status { grid-column: 1 / -1; margin: 0; line-height: 1.45; }
.${n}-sectioned-menu[data-section="index"] > .${n}-panel, .${n}-sectioned-menu[data-section="index"] > .${n}-menu-body { display: none; }
.${n}-sectioned-menu[data-section="noticeboard"] .${n}-overlay { border: .8rem solid #9e6835; border-radius: .5rem; background: repeating-linear-gradient(90deg, #ba854d 0 21px, #a9733d 21px 24px); box-shadow: inset 0 0 0 2px #6b3d1e, 0 .5rem 1rem #0005; padding: .8rem; }
.${n}-sectioned-menu[data-section="noticeboard"] .${n}-notice-row { border: 1px solid #d9c69c; background: #fff7db; color: #33281d; padding: .6rem; box-shadow: 1px 2px 3px #0005; }
.${n}-sectioned-menu[data-section="noticeboard"] .${n}-notice-author { color: #33281d; }
.${n}-sectioned-menu[data-section="noticeboard"] .${n}-overlay-head > .${n}-panel-title { color: #2e2116; font-size: 1rem; }
.${n}-sectioned-menu[data-mobile="false"] .${n}-mobile-menu-nav { grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); }
.${n}-sectioned-menu[data-mobile="false"] .${n}-mobile-menu-nav .${n}-button { min-height: 2.5rem; }
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
`;function Y0(){let e=document.getElementById(q0);if(!document.querySelector(n)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=q0,t.textContent=jS,document.head.appendChild(t)}var GS="marinara_admin_secret";function u1(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(GS)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var YS="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function d1(e,t,a){let i=e?.error,o=typeof i=="string"&&i?i:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${YS} (${o})`):new Error(o)}async function D(e,t){let a=await fetch(`${RS}${e}`,{...t,headers:u1(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw d1(i,a.status,`The village replied ${a.status}.`);return T0(i)}async function Xp(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:u1(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw d1(i,a.status,`The Engine replied ${a.status}.`);return i}var ho=e=>typeof e=="number"&&Number.isFinite(e);function Qp(e){let t=e;for(let x=0;x<2&&typeof t=="string";x+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:i,srcY:o,srcWidth:s,srcHeight:c}=a;if(ho(i)&&ho(o)&&ho(s)&&ho(c))return s<=0||c<=0||i<0||o<0||i+s>1.001||o+c>1.001?null:{srcX:i,srcY:o,srcWidth:s,srcHeight:c};let{zoom:d,offsetX:h,offsetY:f,fullImage:$}=a;return!ho(d)||d<=0||!ho(h)||!ho(f)||$!==void 0&&typeof $!="boolean"?null:$===void 0?{zoom:d,offsetX:h,offsetY:f}:{zoom:d,offsetX:h,offsetY:f,fullImage:$}}function XS(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function QS(e,t){if(e.length===0)return{};let a=await Xp("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),i={};if(!Array.isArray(a))return i;for(let o of a){let s=typeof o?.id=="string"?o.id:"",c=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";s.length>0&&c.length>0&&(i[s]={url:c,crop:Qp(o.avatarCrop)})}return i}async function ZS(e,t){let a=e.trim();if(a.length===0)return null;let i=await Xp(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof i?.avatarPath=="string"?i.avatarPath.trim():"";return o.length===0?null:{url:o,crop:Qp(i.avatarCrop)}}function KS(e){let t=[];for(let a of e){let i=typeof a.id=="string"?a.id.trim():"";if(i.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let s=typeof a.name=="string"&&a.name.trim()?a.name.trim():i;t.push({id:i,name:s,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function B(e,t){return e instanceof Error&&e.message?e.message:t}function Vr(e){let t=B(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function X0(e){try{let{session:t}=await D("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}async function Q0(e,t){try{let{visit:a}=await D(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return z0(a,t)?a:null}catch{return null}}function Z0(e){let t=B(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function Lu(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function Dr(e,t){return h1(N0(e),t)}function h1(e,t){let a=0;return e.map(i=>{let o=`${t}${a++}`;switch(i.kind){case"text":return i.text;case"code":return(0,r.jsx)("code",{className:`${n}-chat-md-code`,dir:"ltr",children:i.text},o);case"link":return(0,r.jsx)("a",{className:`${n}-chat-md-link`,href:i.href,target:"_blank",rel:"noopener noreferrer",children:i.text},o);default:return JS(i,o)}})}function JS(e,t){let a=h1(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${n}-chat-md-highlight`,children:a},t)}}function PS(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function _r(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var m1=["residence","workplace","gathering","other"];function fn(e){return e.classes?.length?e.classes:_r(e)?["residence"]:["other"]}function K0(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function ju(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function $t(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function J0({draft:e,existing:t,villagers:a,editableClasses:i,onChange:o}){let s=fn(e),c=(d,h)=>{let f=s.map($=>$===d?{...$t(e,$),...h}:$t(e,$));o({...e,spaces:f,description:f[0]?.description??e.description})};return(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsxs)("label",{className:`${n}-label`,children:["Name",(0,r.jsx)("input",{className:`${n}-notice-input`,value:e.name,maxLength:100,onChange:d=>o({...e,name:d.target.value}),placeholder:"The Lantern Workshop"})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Form ",(0,r.jsx)("span",{className:`${n}-hint`,children:"What is it, in your world?"}),(0,r.jsx)("input",{className:`${n}-notice-input`,value:e.form??"",maxLength:200,onChange:d=>o({...e,form:d.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,r.jsxs)("fieldset",{className:`${n}-field`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Map pin \xB7 optional"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,r.jsx)("div",{className:`${n}-row`,children:["x","y"].map(d=>(0,r.jsxs)("label",{className:`${n}-label`,children:[d==="x"?"Across":"Down",(0,r.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[d]??"",disabled:t&&ju(e)>0,onChange:h=>o({...e,presentation:{...e.presentation,[d]:h.target.value===""?null:Number(h.target.value)}})})]},d))}),t&&ju(e)>0?(0,r.jsx)("p",{className:`${n}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,r.jsxs)("fieldset",{className:`${n}-field`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${n}-row`,children:m1.map(d=>(0,r.jsxs)("label",{className:`${n}-label`,style:{textTransform:"capitalize"},children:[(0,r.jsx)("input",{type:"checkbox",checked:s.includes(d),disabled:t||!s.includes(d)&&s.length>=2,onChange:h=>{let f=h.target.checked?[...s,d]:s.filter($=>$!==d);f.length<1||f.length>2||o({...e,classes:f,spaces:f.map($=>$t(e,$))})}})," ",d]},d))}),t?(0,r.jsx)("p",{className:`${n}-hint`,children:"Class changes go through a Venue proposal."}):null]}),s.includes("residence")?(0,r.jsxs)("label",{className:`${n}-label`,children:["Resident capacity \xB7 includes you",(0,r.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:d=>o({...e,residenceCapacity:Number(d.target.value)})}),t?(0,r.jsx)("span",{className:`${n}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,s.includes("workplace")?(0,r.jsxs)("fieldset",{className:`${n}-field`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Workers"}),a.map(d=>(0,r.jsxs)("label",{className:`${n}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(d.characterId),onChange:h=>o({...e,workerIds:h.target.checked?[...e.workerIds??[],d.characterId]:(e.workerIds??[]).filter(f=>f!==d.characterId)})})," ",d.name]},d.characterId)),a.length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"No villagers are available yet."}):null]}):null,s.filter(d=>!i||i.includes(d)).map(d=>{let h=$t(e,d);return(0,r.jsxs)("section",{className:`${n}-field`,children:[(0,r.jsxs)("h3",{className:`${n}-panel-title`,style:{textTransform:"capitalize"},children:[d," space"]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${n}-textarea`,value:h.description,maxLength:1e3,onChange:f=>c(d,{description:f.target.value})})]}),(0,r.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Current physical state used by visits and pictures."}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,r.jsx)("input",{className:`${n}-notice-input`,value:h.state.condition,onChange:f=>c(d,{state:{...h.state,condition:f.target.value}})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this space."}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:h.state.items.join(`
`),onChange:f=>c(d,{state:{...h.state,items:f.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this space."}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:h.state.publicFacts.join(`
`),onChange:f=>c(d,{state:{...h.state,publicFacts:f.target.value.split(`
`)}})})]}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((f,$)=>(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("input",{className:`${n}-notice-input`,value:f.text,"aria-label":`Feature ${$+1}`,onChange:x=>c(d,{state:{...h.state,features:h.state.features.map(g=>g.id===f.id?{...g,text:x.target.value}:g)}})}),(0,r.jsxs)("label",{className:`${n}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:f.locked,onChange:x=>c(d,{state:{...h.state,features:h.state.features.map(g=>g.id===f.id?{...g,locked:x.target.checked}:g)}})})," ","Locked"]}),(0,r.jsx)("button",{type:"button",className:`${n}-remove`,"aria-label":`Remove feature ${$+1}`,onClick:()=>c(d,{state:{...h.state,features:h.state.features.filter(x=>x.id!==f.id)}}),children:"\xD7"})]},f.id)),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:h.state.features.length>=5,onClick:()=>c(d,{state:{...h.state,features:[...h.state.features,{id:cl(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},d)})]})}function Gp(e){return e.filter(t=>_r(t))}function jn(e){return e.filter(t=>!_r(t)||fn(t).some(a=>a!=="residence"))}function FS(e,t){let a=Gp(e);return a.length!==t.length?!1:t.every((i,o)=>{let s=a[o];return s.id===i.id&&s.name===i.name&&(s.form??"Home")===i.form&&s.occupancy.playerHome===i.isPlayerHome&&s.occupancy.residentCharacterId===i.characterId&&s.description===i.description&&Math.abs((s.presentation.x??-1)-(i.x??-1))<1e-4&&Math.abs((s.presentation.y??-1)-(i.y??-1))<1e-4})}function WS(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let s=a.get(o.id);return{id:o.id,name:o.name,form:o.form,classes:["residence"],spaces:[{...$t(s??{id:o.id,name:o.name,description:o.description,category:"",presentation:{image:null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}},"residence"),description:o.description}],residenceCapacity:s?.residenceCapacity??1,residentIds:o.characterId?[o.characterId]:[],improvements:s?.improvements??[null,null],description:o.description,category:s?.category??"",presentation:{image:s?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:s?.capabilities??[],state:s?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...e.filter(o=>!_r(o))]}function ul(){return Math.random().toString(36).slice(2,10)}function mo(e){return Math.round(e*1e4)/1e4}var e2=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),p1=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),t2=6e4,a2=700;function P0(e){return`${e2.format(e)} \xB7 ${p1.format(e)}`}function n2(){let[e,t]=(0,m.useState)(()=>P0(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(P0(new Date)),1e3);return()=>clearInterval(a)},[]),e}function i2(){let[e,t]=n2().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${n}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function o2({weather:e}){return(0,r.jsxs)("span",{className:`${n}-mobile-datetime`,children:[(0,r.jsx)(i2,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:r2(e)})]})}function r2(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function F0(e){return e?.closest(n)??null}function s2(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(F0(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,i=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${n}-button ${n}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":i,title:i,onClick:o=>{let s=F0(o.currentTarget);if(!s)return;if(document.fullscreenElement===s){document.exitFullscreen().catch(()=>{});return}let c=s.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function l2({happenings:e,recap:t,mobile:a=!1}){let i=(0,m.useRef)(null),[o,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=i.current;if(!c)return;let d=()=>s(c.open);return c.addEventListener("toggle",d),()=>c.removeEventListener("toggle",d)},[]),(0,m.useEffect)(()=>{if(!o)return;let c=d=>{!(d.target instanceof Node)||i.current?.contains(d.target)||i.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[o]),(0,r.jsxs)("details",{ref:i,className:`${n}-news`,children:[(0,r.jsxs)("summary",{className:`${n}-button ${n}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${n}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${n}-news-panel`,children:[(0,r.jsx)("h2",{className:`${n}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${n}-news-list`,children:t.details.map(c=>(0,r.jsx)("li",{className:`${n}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,r.jsx)("p",{className:`${n}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${n}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${n}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${n}-news-list`,children:e.map(c=>(0,r.jsx)("li",{className:`${n}-news-item`,children:c.text},c.id))})]})]})}function g1(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function c2(e){return e.length>0?g1(e,!0):"Empty house"}function W0(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function e1(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function u2(e,t){return t.length>0?g1(t,!0):e.name||"An empty house"}function Hu(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var d2=.028;function dl(e){return new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(typeof i.result=="string"?i.result:""),i.onerror=()=>a(new Error("That picture could not be read.")),i.readAsDataURL(e)})}function _p(e){return new Promise((t,a)=>{let i=new Image;i.onload=()=>t({width:i.naturalWidth,height:i.naturalHeight}),i.onerror=()=>a(new Error("That picture could not be read.")),i.src=e})}var t1=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function Ip(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function Hp(e,t,a){return e<t?t:e>a?a:e}function h2(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),d=e.width*c,h=e.height*c;return{left:(t.width-d)/2,top:(t.height-h)/2,width:d,height:h}}let i=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*i,s=e.height*i;return{left:(t.width-o)*(a.focusX/100),top:(t.height-s)*(a.focusY/100),width:o,height:s}}function m2(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Uu(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function Up({src:e,alt:t,pins:a,placing:i,view:o,shape:s,zoom:c,onPlace:d,onView:h,onDismiss:f,compact:$,fitToRoom:x,mobile:g,photoPins:b,children:C}){let E=d!==void 0,R=h!==void 0,w=(0,m.useRef)(null),y=(0,m.useRef)(null),[v,k]=(0,m.useState)(null),[O,F]=(0,m.useState)(null),[H,L]=(0,m.useState)(null),be=(0,m.useRef)(null),J=(0,m.useRef)(new Map),Ve=(0,m.useRef)(null),[Ae,na]=(0,m.useState)(null),[gt,xt]=(0,m.useState)(null),at=(0,m.useRef)(null),U=(0,m.useRef)(null),se=(0,m.useRef)(!1),[Ee,ee]=(0,m.useState)(null),G=(0,m.useMemo)(()=>Ee?{...o,...Ee}:o,[Ee,o]),ae=e?v?.src===e?v:null:s,Zt={zoom:ae&&O?Vu(ae,O):1,centerX:.5,centerY:.5},V=H??Zt,Q=(0,m.useMemo)(()=>g?ae&&O?zp(ae,O,V):null:e?v&&v.src===e&&O?h2(v,O,G):null:O?{left:0,top:0,width:O.width,height:O.height}:null,[v,O,G,g,ae,V,e]);(0,m.useEffect)(()=>{L(null),be.current=null,J.current.clear(),Ve.current=null},[e,O?.width,O?.height]);let Nt=s?x&&Ae?{width:`${Ae.width}px`,height:`${Ae.height}px`,aspectRatio:`${s.width} / ${s.height}`}:{aspectRatio:`${s.width} / ${s.height}`}:void 0,We=(0,m.useCallback)(()=>{let A=y.current;if(!A)return;let j=A.getBoundingClientRect();j.width===0||j.height===0||F(ye=>ye&&ye.width===j.width&&ye.height===j.height?ye:{width:j.width,height:j.height})},[]);(0,m.useEffect)(()=>{let A=y.current;if(!A||typeof ResizeObserver>"u")return;let j=new ResizeObserver(()=>We());return j.observe(A),()=>j.disconnect()},[We]);let rt=(0,m.useCallback)(()=>{let A=w.current?.parentElement;if(!A||!s)return;let j=A.getBoundingClientRect(),ye=getComputedStyle(A),je=ne=>Number.parseFloat(ye.getPropertyValue(ne))||0,He=j.width-je("padding-left")-je("padding-right"),St=j.height-je("padding-top")-je("padding-bottom"),Ke=s.width/s.height,Y=Math.min(He,St*Ke);Y>0&&na(ne=>ne&&Math.abs(ne.width-Y)<.5?ne:{width:Y,height:Y/Ke})},[s]);(0,m.useLayoutEffect)(()=>{if(!x||(rt(),typeof ResizeObserver>"u"))return;let A=w.current?.parentElement;if(!A)return;let j=new ResizeObserver(()=>rt());return j.observe(A),()=>j.disconnect()},[x,rt]);let he=(0,m.useCallback)(A=>{if(!E||!d||!Q)return;let j=A.currentTarget.getBoundingClientRect(),ye=(A.clientX-j.left-Q.left)/Q.width,je=(A.clientY-j.top-Q.top)/Q.height;if(!(ye>=0&&ye<=1)||!(je>=0&&je<=1))return;let St=y.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();d(mo(ye),mo(je),{width:Q.width,height:Q.height,photoWidth:St?.width??58,photoHeight:St?.height??58})},[d,E,Q]),Se=(0,m.useCallback)(A=>{if(!R||!Q||!h||G.fit!=="cover")return;let j=A.currentTarget.getBoundingClientRect();at.current={x:A.clientX,y:A.clientY,focusX:G.focusX,focusY:G.focusY,spanX:j.width-Q.width,spanY:j.height-Q.height},ee({focusX:G.focusX,focusY:G.focusY}),A.currentTarget.setPointerCapture(A.pointerId),A.preventDefault()},[R,G.focusX,G.focusY,G.fit,h,Q]),ie=(0,m.useCallback)(A=>{let j=at.current;if(!j)return;let ye=j.spanX===0?j.focusX:j.focusX+(A.clientX-j.x)/j.spanX*100,je=j.spanY===0?j.focusY:j.focusY+(A.clientY-j.y)/j.spanY*100;ee({focusX:mo(Hp(ye,0,100)),focusY:mo(Hp(je,0,100))})},[]),me=(0,m.useCallback)(A=>{if(!at.current)return;at.current=null,A.currentTarget.hasPointerCapture(A.pointerId)&&A.currentTarget.releasePointerCapture(A.pointerId);let j=Ee;ee(null),j&&h&&h({...o,...j})},[Ee,h,o]),Ht=(0,m.useCallback)(A=>{!h||!c||h({...o,zoom:mo(Hp(A,c.min,c.max))})},[h,o,c]),Ut=()=>{let A=[...J.current.values()];if(A.length===0){Ve.current=null;return}let j=A[0],ye=A[1];Ve.current={view:be.current??V,x:ye?(j.x+ye.x)/2:j.x,y:ye?(j.y+ye.y)/2:j.y,distance:ye?Math.hypot(j.x-ye.x,j.y-ye.y):1}},Ma=A=>{if(!g||A.pointerType!=="touch"||(A.isPrimary&&(J.current.clear(),se.current=!1),!y.current)||A.target instanceof Element&&A.target.closest(`.${n}-doors, .${n}-zoom`))return;w.current?.setAttribute("data-mobile-gesturing","true");let j=y.current.getBoundingClientRect();J.current.set(A.pointerId,{x:A.clientX-j.left,y:A.clientY-j.top}),J.current.size>1&&(se.current=!0),Ut()},ft=A=>{if(!g||!J.current.has(A.pointerId)||!ae||!O||!y.current)return;let j=y.current.getBoundingClientRect();J.current.set(A.pointerId,{x:A.clientX-j.left,y:A.clientY-j.top});let ye=[...J.current.values()],je=ye[0],He=ye[1],St=He?(je.x+He.x)/2:je.x,Ke=He?(je.y+He.y)/2:je.y,Y=He?Math.hypot(je.x-He.x,je.y-He.y):1,ne=Ve.current;if(!ne||!O0(ne,{x:St,y:Ke,distance:Y})&&!se.current)return;se.current||f?.(),se.current=!0;let Qa=V0(ae,O,ne.view,{x:ne.x,y:ne.y},{x:St,y:Ke},He&&ne.distance>0?Y/ne.distance:1);be.current=Qa,L(Qa)},bn=(A,j=!1)=>{if(!g||!J.current.has(A.pointerId))return;let ye=!j&&J.current.size===1&&!se.current;if(J.current.delete(A.pointerId),J.current.size===0&&w.current?.removeAttribute("data-mobile-gesturing"),Ut(),!ye||!(A.target instanceof Element))return;let je=A.target.closest(`.${n}-pin`)?.dataset.pinId,He=je?a.find(St=>St.id===je):null;if(He?.onSelect){se.current=!0,He.onSelect();return}if(!(!A.target.closest(`.${n}-canvas`)||A.target.closest("button")))if(E&&i&&d&&Q){let St=y.current.getBoundingClientRect(),Ke=(A.clientX-St.left-Q.left)/Q.width,Y=(A.clientY-St.top-Q.top)/Q.height;if(Ke>=0&&Ke<=1&&Y>=0&&Y<=1){se.current=!0;let ia=y.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();d(mo(Ke),mo(Y),{width:Q.width,height:Q.height,photoWidth:ia?.width??72,photoHeight:ia?.height??72})}}else f&&(se.current=!0,f())};return(0,r.jsxs)("div",{ref:w,className:`${n}-stage${$?` ${n}-stage-compact`:""}`,style:Nt,"data-shaped":s?"true":"false","data-framing":R&&G.fit==="cover"?"true":"false","data-mobile":g?"true":"false","data-photo-pins":b?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:A=>{if(g){Ma(A);return}se.current=!1,U.current=A.pointerType==="touch"?{x:A.clientX,y:A.clientY}:null},onPointerMoveCapture:A=>{if(g){ft(A);return}let j=U.current;j&&(Math.abs(A.clientX-j.x)>8||Math.abs(A.clientY-j.y)>8)&&(se.current=!0)},onPointerUpCapture:g?bn:void 0,onPointerCancelCapture:A=>{g&&bn(A,!0),U.current&&(se.current=!0)},onClickCapture:A=>{se.current&&(se.current=!1,A.preventDefault(),A.stopPropagation())},children:[C,(0,r.jsxs)("div",{ref:y,className:`${n}-canvas`,"data-placing":E&&i?"true":"false","data-dragging":Ee?"true":"false",onClick:E&&i?he:f?()=>f():void 0,onPointerDown:R?Se:void 0,onPointerMove:R?ie:void 0,onPointerUp:R?me:void 0,onPointerCancel:R?me:void 0,children:[e?(0,r.jsx)("img",{className:`${n}-canvas-img`,style:g&&Q?{position:"absolute",left:Q.left,top:Q.top,width:Q.width,height:Q.height,objectFit:"fill"}:m2(G),src:e,alt:t,draggable:!1,onLoad:A=>{let{naturalWidth:j,naturalHeight:ye}=A.currentTarget;j<=0||ye<=0||(k({src:e,width:j,height:ye}),We())},onError:()=>xt(e)}):(0,r.jsxs)(r.Fragment,{children:[g&&Q?(0,r.jsx)("span",{className:`${n}-mobile-logical`,style:{left:Q.left,top:Q.top,width:Q.width,height:Q.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${n}-canvas-empty`,children:"Logical village map"})]}),e&&gt===e?(0,r.jsx)("span",{className:`${n}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,Q?a.map(A=>(0,r.jsxs)("span",{className:`${n}-pin-holder`,"data-selected":A.selected?"true":"false",style:{left:`${Q.left+A.x*Q.width}px`,top:`${Q.top+(A.y+(g&&A.kind!=="person"?0:A.dy??0))*Q.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${n}-pin`,"data-pin-id":A.id,"data-tone":A.tone,"data-kind":A.kind??"place","data-selected":A.selected?"true":"false","aria-expanded":A.doors?!0:void 0,disabled:A.onSelect===void 0,title:A.text,onClick:j=>{j.stopPropagation(),A.onSelect?.()},children:(g||b)&&A.kind!=="person"?(0,r.jsxs)("span",{className:`${n}-pin-photo-card`,style:{transform:`scale(${_0(g?D0(V.zoom,Zt.zoom):MS,A.selected===!0)})`},children:[(0,r.jsxs)("span",{className:`${n}-pin-photo`,"aria-hidden":"true",children:[A.image?(0,r.jsx)("img",{src:A.image,alt:"",loading:"lazy",draggable:!1}):(0,r.jsx)("span",{className:`${n}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,r.jsx)("span",{className:`${n}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${n}-pin-name`,children:A.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${n}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${n}-pin-name`,children:A.text})]})}),A.onRemove?(0,r.jsx)("button",{type:"button",className:`${n}-pin-remove`,"aria-label":`Take ${A.text} off the map`,onClick:j=>{j.stopPropagation(),A.onRemove?.()},children:"\xD7"}):null,A.onResume?(0,r.jsx)("button",{type:"button",className:`${n}-pin-resume`,onClick:j=>{j.stopPropagation(),A.onResume?.()},children:"DEBUG: Resume Chat"}):null]},A.id)):null]}),Q?a.filter(A=>A.doors!==void 0&&A.doors.length>0).map(A=>(0,r.jsx)("div",{className:`${n}-doors`,style:{left:`${O?Ap(Q,O,A).left:Q.left+A.x*Q.width}px`,top:`${O?Ap(Q,O,A).top:Q.top+(A.y+(A.dy??0))*Q.height}px`},children:A.doors?.map(j=>(0,r.jsx)("button",{type:"button",className:`${n}-door`,onClick:ye=>{ye.stopPropagation(),j.onSelect()},children:j.label},j.label))},`doors:${A.id}`)):null,R&&c&&G.fit==="cover"?(0,r.jsxs)("div",{className:`${n}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:G.zoom>=c.max,onClick:()=>Ht(G.zoom+c.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:G.zoom<=c.min,onClick:()=>Ht(G.zoom-c.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:G.focusX===50&&G.focusY===50&&G.zoom===c.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function po(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function p2({scenario:e}){let t=VS(e),[a,i]=(0,m.useState)(null);return(0,r.jsxs)("div",{className:`${n}-scenario-art-panel`,children:[a===t?(0,r.jsx)("span",{className:`${n}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,r.jsx)("img",{src:t,alt:`${go(e).label} village scene`,onError:()=>i(t)}),(0,r.jsxs)("div",{className:`${n}-scenario-art-content`,children:[(0,r.jsx)("p",{children:"A new beginning awaits."}),(0,r.jsx)("strong",{children:go(e).description})]})]})}function g2({label:e,choices:t,selectedId:a,onSelect:i,disabled:o,emptyMessage:s}){return t.length?(0,r.jsx)("div",{className:`${n}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,r.jsxs)("button",{type:"button",className:`${n}-identity-card`,"aria-pressed":a===c.id,disabled:o,onClick:()=>i(c.id),children:[(0,r.jsx)(fo,{portrait:c.portrait,name:c.name,className:`${n}-identity-card-face`,glyph:"person"}),(0,r.jsx)("strong",{children:c.name}),c.hint?(0,r.jsx)("small",{children:c.hint}):null]},c.id))}):(0,r.jsx)("p",{className:`${n}-hint`,children:s})}function f2({value:e}){return(0,r.jsxs)("section",{className:`${n}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,r.jsx)(fo,{portrait:e.portrait,name:e.name,className:`${n}-identity-preview-face`,glyph:"person"}),(0,r.jsxs)("div",{className:`${n}-identity-preview-copy`,children:[(0,r.jsx)("h3",{children:e.name}),e.overview?(0,r.jsx)("p",{className:`${n}-identity-overview`,children:e.overview}):null,e.details.length?(0,r.jsx)("dl",{className:`${n}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:t}),(0,r.jsx)("dd",{children:a})]},t))}):null,(0,r.jsx)("p",{className:`${n}-identity-context`,children:e.context})]})]})}function a1(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let i=a.lastIndexOf(" ",t),o=a.indexOf(" ",t);return`${a.slice(0,i>0?i:o>0?o:a.length).trimEnd()}\u2026`}function n1(e){return e.avatarPath?{url:e.avatarPath,crop:Qp(e.avatarCrop)}:void 0}function b2({personas:e,draft:t,onDraft:a,disabled:i}){let[o,s]=(0,m.useState)(""),[c,d]=(0,m.useState)(null),[h,f]=(0,m.useState)(""),$=e?.find(E=>E.id===t),x=$?.id,g=o.trim().toLocaleLowerCase(),b=(e??[]).filter(E=>!g||`${E.name} ${E.summary}`.toLocaleLowerCase().includes(g)).sort((E,R)=>E.name.localeCompare(R.name,void 0,{sensitivity:"base"})).map(E=>({id:E.id,name:E.name,portrait:n1(E),hint:E.summary}));(0,m.useEffect)(()=>{if(d(null),f(""),!t||!x)return;let E=new AbortController;return D(`/personas/${encodeURIComponent(t)}`,{signal:E.signal}).then(R=>{E.signal.aborted||d(R.persona)}).catch(R=>{E.signal.aborted||f(B(R,"This Persona could not be read."))}),()=>E.abort()},[t,x]);let C=c&&c.id===t?{id:c.id,name:c.name,portrait:n1(c),overview:a1(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,E])=>E.trim()).map(([E,R])=>({label:E,text:a1(R,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,r.jsxs)("div",{className:`${n}-founding-persona`,children:[(0,r.jsxs)("div",{className:`${n}-identity-picker-head`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-persona-search`,children:"Who are you?"}),(0,r.jsx)("input",{id:`${n}-setup-persona-search`,className:`${n}-search`,type:"search",value:o,placeholder:"Search Personas",onChange:E=>s(E.target.value),disabled:i||e===null})]}),(0,r.jsx)(g2,{label:"Choose a Persona",choices:b,selectedId:t,onSelect:a,disabled:i,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!$?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):C?(0,r.jsx)(f2,{value:C}):h?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:h}):$?(0,r.jsxs)("p",{className:`${n}-hint`,children:["Reading ",$.name,"\u2026"]}):(0,r.jsx)("p",{className:`${n}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function v2({idPrefix:e,personas:t,draft:a,onDraft:i,storedId:o,storedName:s,storedMissing:c,disabled:d}){let h=(t??[]).find(g=>g.id===a)??null,f=h?.name??(a===o?s:""),$=c&&a===o,x=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${n}-${e}-persona`,className:`${n}-select`,value:a,disabled:d||t===null||t.length===0,onChange:g=>i(g.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(g=>(0,r.jsx)("option",{value:g.id,children:g.isActive?`${g.name} \u2014 your Persona`:g.name},g.id))]}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(g=>g.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),x?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${n}-empty`,children:$?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":f.length>0?`The villagers know you as ${f}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${n}-macro-help`,children:h.summary}):null]}):null]})}function i1({books:e,error:t,selected:a,onChange:i,disabled:o}){let[s,c]=(0,m.useState)(""),d=new Map((e??[]).map(b=>[b.id,b])),h=(e??[]).filter(b=>!b.hiddenFromLibrary||a.includes(b.id)),f=a.filter(b=>!d.has(b)),x=[...h,...f.map(b=>({id:b,name:b,enabled:!1}))].filter(b=>b.name.toLocaleLowerCase().includes(s.trim().toLocaleLowerCase())),g=x.slice(0,50);return(0,r.jsxs)("fieldset",{className:`${n}-field ${n}-lore-picker`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,r.jsx)("div",{className:`${n}-lore-selected`,"aria-live":"polite",children:a.length?a.map(b=>(0,r.jsxs)("span",{className:`${n}-lore-chip`,children:[(0,r.jsxs)("span",{children:[d.get(b)?.name??b,e===null?" (checking)":d.has(b)?d.get(b)?.enabled?"":" (disabled)":" (missing)"]}),(0,r.jsx)("button",{type:"button","aria-label":`Remove ${d.get(b)?.name??b}`,disabled:o,onClick:()=>i(a.filter(C=>C!==b)),children:"\xD7"})]},b)):(0,r.jsx)("span",{className:`${n}-hint`,children:"No lorebooks selected."})}),t?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${n}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${n}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"No lorebooks in the Engine library."}):null,(0,r.jsxs)("details",{className:`${n}-lore-options`,children:[(0,r.jsxs)("summary",{className:`${n}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,r.jsx)("input",{type:"search",className:`${n}-search`,value:s,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:b=>c(b.target.value)}),(0,r.jsxs)("div",{className:`${n}-lore-results`,children:[g.map(b=>{let C=a.includes(b.id),E=f.includes(b.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":b.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${n}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:C,disabled:o||!b.enabled&&!C||!C&&a.length>=24,onChange:()=>i(C?a.filter(R=>R!==b.id):[...a,b.id])}),b.name,E?` (${E})`:""]},b.id)}),e!==null&&x.length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"No matching lorebooks."}):null,x.length>g.length?(0,r.jsx)("p",{className:`${n}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function y2({homes:e,villagers:t,disabled:a,selectedId:i,onPatch:o,onRemove:s,onSelect:c,lockedIds:d,showDescriptions:h,onGenerateDescription:f}){let $=new Set(e.map(x=>x.characterId));return(0,r.jsx)("div",{className:`${n}-home-list`,children:e.map((x,g)=>{let b=d?.has(x.id)??!1,C=t.find(E=>E.id===x.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${n}-home-row`,"data-selected":x.id===i?"true":"false",onMouseEnter:()=>c(x.id),children:[(0,r.jsx)("span",{className:`${n}-home-index`,"aria-hidden":"true",children:g+1}),x.isPlayerHome?(0,r.jsx)("span",{className:`${n}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${n}-who`,children:C?`${C} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${n}-select`,value:x.characterId??"",disabled:a||b,"aria-label":`Who lives in home ${g+1}`,onChange:E=>o(x.id,{characterId:E.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(E=>{let R=E.id!==x.characterId&&$.has(E.id);return(0,r.jsx)("option",{value:E.id,disabled:R,children:R?`${E.name} \u2014 already housed`:E.name},E.id)})]}):null]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Venue name",(0,r.jsx)("input",{className:`${n}-notice-input`,value:x.name,maxLength:60,disabled:a||b,onChange:E=>o(x.id,{name:E.target.value})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${n}-notice-input`,value:x.form,maxLength:240,disabled:a||b,onChange:E=>o(x.id,{form:E.target.value}),placeholder:"Cabin, truck, sleeping pod\u2026"})]}),h?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("textarea",{className:`${n}-textarea`,value:x.description,maxLength:1e3,disabled:a||b,"aria-label":`Description of home ${g+1}`,onChange:E=>o(x.id,{description:E.target.value})}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:a||b,onClick:()=>f?.(x),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${n}-remove`,disabled:a||b,"aria-label":`Take home ${g+1} off the map`,onClick:()=>s(x.id),children:"\xD7"}),b?(0,r.jsx)("span",{className:`${n}-hint`,children:"Move approved and completed before changing this home."}):null]},x.id)})})}function o1({id:e,label:t,hint:a,options:i,value:o,disabled:s,onChange:c}){let d=o.length>0&&!i.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${n}-select`,value:o,disabled:s,onChange:h=>c(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),d?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,i.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${n}-hint`,children:a})]})}function qp({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[i,o]=(0,m.useState)(null),[s,c]=(0,m.useState)([]),[d,h]=(0,m.useState)(""),[f,$]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let R=!1;return(async()=>{try{let[w,y]=await Promise.all([D("/connections"),Xp("/api/connections")]);if(R)return;o(w),c(KS(Array.isArray(y)?y:[]))}catch(w){R||h(B(w,"This agent's connections could not be read."))}})(),()=>{R=!0}},[]);let x=(0,m.useCallback)(async R=>{$(!0),h("");try{o(await D("/connections",{method:"PUT",body:JSON.stringify(R)}))}catch(w){h(B(w,"That connection could not be saved."))}finally{$(!1)}},[]),g=s.filter(R=>R.category==="language"),b=s.filter(R=>R.category==="image_generation"),C=b.some(R=>R.defaultForAgents),E=i!==null&&(i.imageConnectionId===Vp||b.length===0||i.imageConnectionId.length===0&&!C);return(0,m.useEffect)(()=>{if(!e)return;let R=i?.systemConnectionId??"",w=i?.narrationConnectionId??"";i?R.length===0||w.length===0?e("Choose both System and Narration connections before continuing."):!g.some(y=>y.id===R)||!g.some(y=>y.id===w)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,i,g]),(0,m.useEffect)(()=>{t?.(E)},[E,t]),(0,r.jsxs)("div",{className:`${n}-field ${a?`${n}-connections-compact`:""}`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Connections"}),a?(0,r.jsx)("p",{className:`${n}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,r.jsx)("p",{className:`${n}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),i?(0,r.jsxs)("div",{className:a?`${n}-connections-grid`:"",children:[(0,r.jsx)(o1,{id:`${n}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:g,value:i.systemConnectionId,disabled:f,onChange:R=>{x({systemConnectionId:R})}}),(0,r.jsx)(o1,{id:`${n}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:g,value:i.narrationConnectionId,disabled:f,onChange:R=>{x({narrationConnectionId:R})}}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${n}-connection-image`,className:`${n}-select`,value:i.imageConnectionId,disabled:f,onChange:R=>{x({imageConnectionId:R.target.value})},children:[(0,r.jsx)("option",{value:Vp,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),i.imageConnectionId.length>0&&i.imageConnectionId!==Vp&&!b.some(R=>R.id===i.imageConnectionId)?(0,r.jsx)("option",{value:i.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,b.map(R=>(0,r.jsx)("option",{value:R.id,children:R.name},R.id))]}),(0,r.jsx)("span",{className:`${n}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,r.jsxs)(r.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${n}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):d.length===0?(0,r.jsx)("span",{className:`${n}-hint`,children:"Reading this agent's connections\u2026"}):null,d?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:d}):null]})}function f1(){let[e,t]=(0,m.useState)(null),[a,i]=(0,m.useState)(""),[o,s]=(0,m.useState)(!1),[c,d]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let f=!1;return D("/narration").then($=>{f||t($)}).catch($=>{f||i(B($,"Village writing settings could not be read."))}),()=>{f=!0}},[]);let h=(0,m.useCallback)(async f=>{s(!0),d(!1),i("");try{let $=await D("/narration",{method:"PUT",body:JSON.stringify(f)});return t($),d(!0),$}catch($){return i(B($,"That writing change could not be saved.")),null}finally{s(!1)}},[]);return{view:e,error:a,busy:o,saved:c,save:h}}function w2(){let{view:e,error:t,busy:a,saved:i,save:o}=f1(),[s,c]=(0,m.useState)(null),d=s??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:n+"-field",children:[(0,r.jsx)("span",{className:n+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:n+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:n+"-textarea","aria-label":"Narration style",value:d,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.styleInstructions,onClick:()=>{o({styleInstructions:d}).then(h=>{h&&c(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&c(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:n+"-row",children:[(0,r.jsxs)("label",{className:n+"-field",children:[(0,r.jsx)("span",{className:n+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:n+"-field",children:[(0,r.jsx)("span",{className:n+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:n+"-field",children:[(0,r.jsx)("span",{className:n+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:n+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:n+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:n+"-hint",children:"Saving\u2026"}):null,i&&!a?(0,r.jsx)("span",{className:n+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:n+"-error",role:"alert",children:t}):null]})}function $2(){let{view:e,error:t,busy:a,saved:i,save:o}=f1(),[s,c]=(0,m.useState)(null),d=s??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:n+"-panel",children:[(0,r.jsx)("h2",{className:n+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:n+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:n+"-textarea","aria-label":"Villager reply guidance",value:d,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsxs)("div",{className:n+"-row",children:[(0,r.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.replyGuidance,onClick:()=>{o({replyGuidance:d}).then(h=>{h&&c(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&c(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:n+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:n+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:n+"-hint",children:"Saving\u2026"}):null,i&&!a?(0,r.jsx)("span",{className:n+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:n+"-error",role:"alert",children:t}):null]})}function fo({portrait:e,name:t,className:a,glyph:i="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:XS(e.crop)}):i==="person"?(0,r.jsxs)("svg",{className:`${n}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function x2({villager:e,portrait:t,selected:a,onSelect:i}){return(0,r.jsxs)("div",{className:`${n}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${n}-tile-head`,children:[(0,r.jsx)(fo,{portrait:t,name:e.name,className:`${n}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${n}-tile-name`,onClick:i,disabled:i===void 0,title:i?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${n}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${n}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${n}-tag`,children:o},o))]})]})}function r1(e,t){let a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=e,i.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function N2(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((x,g)=>{let b=C=>{let E=qu.indexOf(C);return E<0?qu.length:E};return b(x.label)-b(g.label)||x.label.localeCompare(g.label)||x.view.localeCompare(g.view)}),i=512,o=768,s=2,c=document.createElement("canvas");c.width=s*i,c.height=Math.ceil(a.length/s)*o;let d=c.getContext("2d");if(!d)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let x=0;x<a.length;x+=1){let g=a[x],b=new Image;b.src=g.url,await b.decode();let C=x%s*i,E=Math.floor(x/s)*o,R=Math.min(i/b.naturalWidth,o/b.naturalHeight),w=Math.round(b.naturalWidth*R),y=Math.round(b.naturalHeight*R);d.drawImage(b,C+Math.floor((i-w)/2),E+o-y,w,y),h.push({view:g.view,expression:g.label,x:C,y:E,width:i,height:o})}let f=await new Promise((x,g)=>c.toBlob(b=>b?x(b):g(new Error("The browser could not export this sheet.")),"image/png")),$=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";r1(`${$}-sprites.png`,f),r1(`${$}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function S2({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[i,o]=(0,m.useState)("front"),[s,c]=(0,m.useState)("neutral"),[d,h]=(0,m.useState)(""),[f,$]=(0,m.useState)(""),[x,g]=(0,m.useState)(!0),[b,C]=(0,m.useState)(null),[E,R]=(0,m.useState)([]),[w,y]=(0,m.useState)(!1),[v,k]=(0,m.useState)(""),[O,F]=(0,m.useState)(""),H=(0,m.useRef)(null),L=e.sprite?.images??[],be=L.filter(U=>U.view===i),J=L.some(U=>U.view==="front"&&U.label==="neutral"),Ve=be.some(U=>U.label==="neutral"),Ae=s==="custom"?d.trim().toLowerCase().replace(/\s+/g,"_"):s,na=be.find(U=>U.label===Ae),gt=[...qu,...L.map(U=>U.label).filter(U=>!qu.includes(U))].filter((U,se,Ee)=>Ee.indexOf(U)===se);(0,m.useEffect)(()=>{C(null),o("front"),c("neutral"),k(""),D(`${a}/source`).then(U=>R(U.sprites)).catch(()=>R([]))},[a]);async function xt(U){y(!0),k(""),F("");try{await U()}catch(se){k(B(se,"The sprite could not be prepared."))}finally{y(!1)}}function at(){if(!/^[a-z0-9_-]{1,40}$/.test(Ae))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(i==="side"&&!J)throw new Error("Approve the front neutral sprite first.");if(Ae!=="neutral"&&!Ve)throw new Error(`Approve the ${i} neutral sprite first.`);return Ae}return(0,r.jsxs)("section",{className:`${n}-sprite-editor`,"aria-label":`${e.name} sprite studio`,children:[(0,r.jsxs)("div",{className:`${n}-sprite-heading`,children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{children:[e.name,"'s sprite studio"]}),(0,r.jsx)("p",{children:"Build a front view for player conversations and one side profile for villager-to-villager moments."})]}),(0,r.jsxs)("span",{className:`${n}-sprite-count`,children:[L.length," approved"]})]}),(0,r.jsx)("div",{className:`${n}-sprite-views`,"aria-label":"Sprite view",children:["front","side"].map(U=>(0,r.jsxs)("button",{type:"button",className:`${n}-sprite-view`,"aria-pressed":i===U,"data-active":i===U?"true":"false",disabled:w,onClick:()=>{o(U),c("neutral"),C(null)},children:[(0,r.jsx)("strong",{children:U==="front"?"Facing you":"Facing villagers"}),(0,r.jsxs)("span",{children:[L.filter(se=>se.view===U).length," approved \xB7"," ",U==="front"?"front":"side, mirrored left or right"]})]},U))}),(0,r.jsxs)("div",{className:`${n}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Choose an expression"}),(0,r.jsx)("span",{children:"Only approved images appear in scenes."})]}),(0,r.jsxs)("div",{className:`${n}-sprite-choices`,children:[gt.map(U=>{let se=be.find(Ee=>Ee.label===U);return(0,r.jsxs)("button",{type:"button",className:`${n}-sprite-choice`,"data-active":s===U?"true":"false","aria-pressed":s===U,disabled:w,onClick:()=>{c(U),C(null)},children:[(0,r.jsx)("span",{className:`${n}-sprite-choice-art`,children:se?(0,r.jsx)("img",{src:se.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:"\uFF0B"})}),(0,r.jsx)("span",{children:U}),(0,r.jsx)("small",{children:se?"Approved":"Open"})]},U)}),(0,r.jsxs)("button",{type:"button",className:`${n}-sprite-choice`,"data-active":s==="custom"?"true":"false","aria-pressed":s==="custom",disabled:w,onClick:()=>{c("custom"),C(null)},children:[(0,r.jsx)("span",{className:`${n}-sprite-choice-art`,"aria-hidden":"true",children:"\u2726"}),(0,r.jsx)("span",{children:"Custom"}),(0,r.jsx)("small",{children:"Name your own"})]})]}),s==="custom"?(0,r.jsxs)("label",{children:["Custom expression name",(0,r.jsx)("input",{value:d,maxLength:40,disabled:w,onChange:U=>{h(U.target.value),C(null)}})]}):null,(0,r.jsxs)("div",{className:`${n}-sprite-selected`,children:[(0,r.jsxs)("strong",{children:[i==="front"?"Front":"Side"," \xB7 ",Ae||"custom"]}),(0,r.jsx)("span",{children:na?"Approved art is ready. You can replace it after reviewing a new candidate.":"No approved art yet."})]}),i==="side"&&!J?(0,r.jsx)("p",{className:`${n}-hint`,children:"Start with an approved front neutral sprite to keep the side profile recognizable."}):null,Ae!=="neutral"&&!Ve?(0,r.jsx)("p",{className:`${n}-hint`,children:"Approve this view's neutral sprite before adding expressions."}):null,(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:f,maxLength:2e3,disabled:w,onChange:U=>$(U.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${n}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:x,disabled:w,onChange:U=>g(U.target.checked)})," ","Use an approved neutral or available portrait as the identity reference"]}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${n}-sprite-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w||i==="side"&&!J||Ae!=="neutral"&&!Ve,onClick:()=>{xt(async()=>{let U=at(),se=await D(`${a}/generate`,{method:"POST",body:JSON.stringify({view:i,expression:U,appearance:f,useReference:x})});C({view:i,label:U,image:se.image}),F(`Candidate: ${se.width} \xD7 ${se.height}. Review before approving.`)})},children:w?"Working\u2026":`Generate ${i} ${Ae||"sprite"} \xB7 1 image request`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w||i==="side"&&!J||Ae!=="neutral"&&!Ve,onClick:()=>H.current?.click(),children:"Upload candidate"}),(0,r.jsx)("input",{ref:H,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:U=>{xt(async()=>{let se=at(),Ee=U.target.files?.[0];Ee&&C({view:i,label:se,image:await dl(Ee)}),U.target.value=""})}})]}),(0,r.jsx)("p",{className:`${n}-hint`,children:"One cell per click. Approval, mirroring, and export use no image API. If the selected Engine connection fails, its configured fallback may make another provider attempt."}),b?(0,r.jsxs)("div",{className:`${n}-sprite-candidate`,children:[(0,r.jsxs)("div",{className:`${n}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Review candidate"}),(0,r.jsxs)("span",{children:[b.view," \xB7 ",b.label]})]}),(0,r.jsxs)("div",{className:`${n}-sprite-candidate-views`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:b.image,alt:`${b.view} ${b.label} candidate for ${e.name}`}),(0,r.jsx)("span",{children:b.view==="side"?"Facing right":"Facing you"})]}),b.view==="side"?(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{className:`${n}-sprite-mirrored`,src:b.image,alt:""}),(0,r.jsx)("span",{children:"Mirrored left \xB7 no extra image"})]}):null]}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w,onClick:()=>{xt(async()=>{let U=await D(`${a}/approve`,{method:"POST",body:JSON.stringify({view:b.view,expression:b.label,image:b.image})});t(U),C(null),F(`${b.view} ${b.label} approved.`)})},children:"Approve this sprite"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w,onClick:()=>C(null),children:"Discard candidate"})]})]}):null,E.length&&i==="front"?(0,r.jsxs)("details",{className:`${n}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Copy an existing Engine full-body sprite"}),(0,r.jsx)("div",{className:`${n}-row`,children:E.map(U=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w||U.expression!=="neutral"&&!Ve,onClick:()=>{xt(async()=>{let se=await D(`${a}/import`,{method:"POST",body:JSON.stringify({view:i,expression:U.expression})});t(se),F(`${U.expression} copied to this Village.`)})},children:U.expression},U.expression))})]}):null,L.length?(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("details",{className:`${n}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Display framing and export"}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:w,onChange:U=>{xt(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:U.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:w,onChange:U=>{xt(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(U.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:w,onClick:()=>{xt(()=>N2(e))},children:"Download both views and manifest"})]})]})}):null,O?(0,r.jsx)("p",{role:"status",children:O}):null,v?(0,r.jsx)("p",{role:"alert",children:v}):null]})}function k2({entry:e,onDecide:t}){let[a,i]=(0,m.useState)(e.improvement?.title??""),[o,s]=(0,m.useState)(e.improvement?.description??""),[c,d]=(0,m.useState)(e.improvement?.extraBeds??0),[h,f]=(0,m.useState)(e.improvementSlot??0),[$,x]=(0,m.useState)(!1),[g,b]=(0,m.useState)(""),C=R=>{x(!0),b(""),t(R,{title:a,description:o,extraBeds:c,slot:h}).catch(w=>b(B(w,"That Venue request could not be decided."))).finally(()=>x(!1))},E=a!==e.improvement?.title||o!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsxs)("label",{className:`${n}-label`,children:["Proposed improvement",(0,r.jsx)("input",{className:`${n}-notice-input`,value:a,onChange:R=>i(R.target.value)})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["What changes?",(0,r.jsx)("textarea",{className:`${n}-textarea`,value:o,onChange:R=>s(R.target.value)})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Extra beds",(0,r.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:R=>d(Number(R.target.value))})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:h,onChange:R=>f(Number(R.target.value)),children:[(0,r.jsx)("option",{value:0,children:"Slot 1"}),(0,r.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:$||!a.trim()||!o.trim(),onClick:()=>C(!0),children:E?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:$,onClick:()=>C(!1),children:"Decline"})]}),g?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:g}):null]})}function T2({room:e,nameColors:t,speechColors:a,picture:i,draft:o,mode:s,targetId:c,busy:d,error:h,greetingNotice:f,ruling:$,open:x,ended:g,playerName:b,playerPortrait:C,portraits:E,sprites:R,onDraft:w,onMode:y,onTarget:v,onSend:k,onViewVenue:O,onEnterPrivate:F,privateSpaceOwnerName:H,onEnd:L,onLeavePending:be,endFailed:J,reviewing:Ve,onRetryGreeting:Ae,onContinueWithoutGreeting:na,notices:gt,onDismissNotice:xt,debugDiscardEnabled:at,onDebugDiscard:U,onUseMailbox:se,onProjects:Ee}){let[ee,G]=(0,m.useState)(0),[ae,Zt]=(0,m.useState)(!1),[V,Q]=(0,m.useState)(!1),[Nt,We]=(0,m.useState)(!1),[rt,he]=(0,m.useState)(!1),[Se,ie]=(0,m.useState)(null),me=(0,m.useRef)(null),Ht=(0,m.useRef)(null),Ut=(0,m.useRef)(null),Ma=(0,m.useRef)(null),ft=(0,m.useRef)(null),bn=(0,m.useRef)(null),A=(0,m.useRef)(null),j=(0,m.useRef)(null),ye=(0,m.useRef)(null),je=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let S=new Set(gt.map(Z=>Z.id)),ce=gt.some(Z=>Z.kind==="memory"&&!je.current.has(Z.id));je.current=S,ce?We(!0):gt.length===0&&We(!1)},[gt,e.id]),(0,m.useEffect)(()=>{ae&&window.requestAnimationFrame(()=>bn.current?.focus())},[ae]),(0,m.useEffect)(()=>{if(!V)return;let S=Z=>{j.current?.contains(Z.target)||Q(!1)},ce=Z=>{Z.key==="Escape"&&Q(!1)};return document.addEventListener("pointerdown",S),document.addEventListener("keydown",ce),()=>{document.removeEventListener("pointerdown",S),document.removeEventListener("keydown",ce)}},[V]),(0,m.useEffect)(()=>{if(!rt)return;let S=Z=>{Ma.current?.contains(Z.target)||he(!1)},ce=Z=>{Z.key==="Escape"&&he(!1)};return document.addEventListener("pointerdown",S),document.addEventListener("focusin",S),document.addEventListener("keydown",ce),()=>{document.removeEventListener("pointerdown",S),document.removeEventListener("focusin",S),document.removeEventListener("keydown",ce)}},[rt]);let He=(0,m.useCallback)(()=>{ie(null),window.requestAnimationFrame(()=>me.current?.focus())},[]),St=new Set((e.submissions??[]).flatMap(S=>(S.recollections??[]).map(ce=>ce.id))).size;(0,m.useEffect)(()=>{if(!Se)return;window.requestAnimationFrame(()=>Ht.current?.focus());let S=ce=>{if(ce.key==="Tab"){ce.preventDefault(),Ht.current?.focus();return}ce.key==="Escape"&&(ce.preventDefault(),He())};return window.addEventListener("keydown",S),()=>window.removeEventListener("keydown",S)},[He,Se]);let Ke=(0,m.useMemo)(()=>{let S=[],ce=new Map;for(let Z of e.lines){if(Z.kind!=="side"&&Z.kind!=="whisper"||!Z.asideFor)continue;let kt=ce.get(Z.asideFor)??[];kt.push({register:Z.kind,text:Z.content,...Z.targetId?{target:e.participants.find(Vt=>Vt.characterId===Z.targetId)?.name??Z.targetId}:{},speakerId:Z.speakerId,name:Z.name,expression:Z.expression,gazeAt:Z.gazeAt}),ce.set(Z.asideFor,kt)}for(let Z of e.lines){if(Z.kind==="side"||Z.kind==="whisper")continue;let kt=Z.speakerId.length===0,Vt=x0(Z.content,Z.beats??null);Vt.paragraphs.forEach((yn,wn)=>{S.push({key:`${S.length}`,speakerId:kt?"":Z.speakerId,name:kt?b:Z.name,player:kt,text:yn,asides:[...Vt.asides[wn]??[],...wn===Vt.paragraphs.length-1?ce.get(Z.id??"")??[]:[]],...Z.kind?{register:Z.kind==="narration"?"narration":"speech"}:{},...Z.expression?{expression:Z.expression}:{},...Z.gazeAt?{gazeAt:Z.gazeAt}:{}})})}return S},[b,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{G(S=>C0(ye.current,e.id,Ke.length,S)),ye.current={roomId:e.id,stepCount:Ke.length}},[e.id,Ke.length]);let Y=Math.min(ee,Math.max(0,Ke.length-1)),ne=Ke[Y],ia=Y>0,Qa=Y<Ke.length-1,vn=!g&&e.status==="active"&&!Qa,Ti=(0,m.useCallback)(()=>{let S=Ut.current;if(!S)return;let ce=window.getComputedStyle(S),Z=Number.parseFloat(ce.lineHeight),kt=Number.parseFloat(ce.paddingTop)+Number.parseFloat(ce.paddingBottom),Vt=Math.ceil(Z+kt),yn=Math.ceil(Z*2+kt);S.style.height="auto",S.style.height=`${Math.min(Math.max(S.scrollHeight,Vt),yn)}px`,S.style.overflowY=S.scrollHeight>yn+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{Ti()},[vn,o,Ti]),(0,m.useEffect)(()=>{let S=Ut.current?.parentElement;if(!S)return;let ce=S.clientWidth,Z=new ResizeObserver(()=>{S.clientWidth!==ce&&(ce=S.clientWidth,Ti())});return Z.observe(S),()=>Z.disconnect()},[vn,Ti]);let Ei=()=>{!vn||d||s!=="conclude"&&!o.trim()||s==="fulfill"&&!c||(he(!1),k())};(0,m.useLayoutEffect)(()=>{A.current&&(A.current.scrollTop=0)},[Y,e.id]);let Ir=ne?.register??(ne===void 0||ne.speakerId==="__venue_scene__"?"narration":ne.player||$0(ne.text)==="speech"?"speech":"narration"),Hr=ne===void 0?void 0:ne.player?C:E[ne.speakerId],oa=e.participants.filter(S=>e.activeIds.includes(S.characterId)),Oa=e.status==="closed"&&oa.length===0?e.participants:oa,Ci=Oa.find(S=>S.characterId===ne?.speakerId),zi=S=>Lu(a[S]),Za=S=>Lu(t[S]),bo=Oa.slice(0,4),Ur=Oa.filter(S=>!bo.some(ce=>ce.characterId===S.characterId)),hl=bo.findIndex(S=>S.characterId===Ci?.characterId)>=2?"left":"right",ml=(0,r.jsxs)("p",{className:`${n}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${n}-chat-spinner ${n}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${n}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${n}-chat`,"data-open":x?"true":"false","data-ended":g?"true":"false","data-opening-error":e.status==="opening"&&h?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${n}-visually-hidden`,children:`Here now: ${oa.length?oa.map(S=>`${S.name}${S.doing?` is ${S.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${n}-chat-scene`,"aria-hidden":"true",children:i?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${n}-chat-scene-backdrop`,src:i,alt:""}),(0,r.jsx)("span",{className:`${n}-chat-scrim`}),(0,r.jsx)("span",{className:`${n}-chat-vignette`})]}):(0,r.jsx)("span",{className:`${n}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,r.jsxs)("div",{className:`${n}-chat-head`,children:[(0,r.jsx)("span",{className:`${n}-room-place`,children:e.placeName}),(0,r.jsxs)("span",{ref:j,className:`${n}-chat-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-room-actions-trigger`,onClick:()=>Q(S=>!S),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":V,children:"\xB7\xB7\xB7"}),V?(0,r.jsxs)("span",{className:`${n}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Q(!1),O()},disabled:d,children:"View Venue"}),F?(0,r.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{Q(!1),F()},disabled:d,children:["Enter ",H??"private space"]}):null,(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Q(!1),g&&e.memoryPending?be():L()},disabled:d,children:g&&e.memoryPending?"Leave with memory pending":g?"Return to map":"End visit now"}),(J||e.status==="closing"||e.memoryPending)&&!g?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Q(!1),be()},children:"Leave with memory pending"}):null,at&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{Q(!1),U()},disabled:d,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,r.jsx)("p",{className:`${n}-hint`,role:"status",children:e.spaceClass==="residence"?"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like.":"You\u2019re outside this Venue. You can speak in your own words, or leave whenever you like."}):null,gt.length>0?(0,r.jsxs)("div",{className:`${n}-room-notices`,"aria-live":"polite",children:[(0,r.jsxs)("button",{type:"button",className:`${n}-room-notices-trigger`,onClick:()=>We(S=>!S),"aria-expanded":Nt,"aria-label":`${gt.length} village ${gt.length===1?"notice":"notices"}`,children:["\u2726 ",gt.length]}),Nt?(0,r.jsx)("div",{className:`${n}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:gt.map(S=>(0,r.jsxs)("div",{className:`${n}-room-star`,children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),S.kind==="memory"&&S.detail?(0,r.jsx)("button",{type:"button",className:`${n}-room-star-detail`,onClick:ce=>{me.current=ce.currentTarget,ie(S)},"aria-label":`View memory: ${S.text}`,title:"View saved memory",children:S.text}):(0,r.jsx)("span",{children:S.text}),(0,r.jsx)("button",{type:"button",className:`${n}-room-star-dismiss`,onClick:()=>{Se?.id===S.id&&ie(null),xt(S.id)},"aria-label":`Dismiss ${S.text}`,title:"Dismiss notice",children:"\xD7"})]},S.id))}):null]}):null,Se?.detail?(0,r.jsx)("div",{className:`${n}-memory-backdrop`,onClick:S=>{S.currentTarget===S.target&&He()},children:(0,r.jsxs)("div",{className:`${n}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${n}-memory-dialog-title`,children:[(0,r.jsxs)("div",{className:`${n}-memory-dialog-head`,children:[(0,r.jsx)("h2",{id:`${n}-memory-dialog-title`,children:Se.text}),(0,r.jsx)("button",{ref:Ht,type:"button",onClick:He,"aria-label":"Close memory",children:"\xD7"})]}),(0,r.jsx)("p",{children:Se.detail})]})}):null,oa.length>0?(0,r.jsx)("div",{className:`${n}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:oa.map(S=>(0,r.jsx)("span",{className:`${n}-chat-activity`,children:`${S.name}: ${S.doing||"spending time here"}`},S.characterId))}):null,(0,r.jsxs)("div",{className:`${n}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${n}-chat-cast`,children:bo.map((S,ce)=>{let Z=R[S.characterId],kt=S.characterId===Ci?.characterId,Vt=ne?.asides.find(vo=>vo.speakerId===S.characterId),yn=kt?ne?.expression??"neutral":Vt?.expression??"neutral",wn=kt?ne?.gazeAt:Vt?.gazeAt??(S.characterId===ne?.gazeAt?Ci?.characterId:void 0),pl=bo.findIndex(vo=>vo.characterId===wn),$n=R0(Z?.images??[],yn,A0(ce,pl));return(0,r.jsxs)("div",{className:`${n}-chat-cast-person`,"data-active":S.characterId===Ci?.characterId?"true":"false","data-sprite":$n?"true":"false",children:[$n?(0,r.jsx)("img",{src:$n.image.url,alt:"","data-framing":Z?.framing.mode??"full","data-facing":$n.mirrored?"left":"right"}):(0,r.jsx)(fo,{portrait:E[S.characterId],name:S.name,className:`${n}-avatar`}),(0,r.jsx)("span",{style:Za(S.characterId),children:S.name})]},S.characterId)})}),Ur.length>0?(0,r.jsx)("div",{className:`${n}-chat-cast-rest`,children:Ur.map(S=>(0,r.jsxs)("span",{children:[(0,r.jsx)(fo,{portrait:E[S.characterId],name:S.name,className:`${n}-avatar`}),(0,r.jsx)("span",{style:Za(S.characterId),children:S.name})]},S.characterId))}):null]}),(0,r.jsxs)("div",{className:`${n}-chat-vn`,children:[ae?(0,r.jsx)("div",{ref:bn,className:`${n}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:S=>{S.key==="Escape"&&(Zt(!1),window.requestAnimationFrame(()=>ft.current?.focus()))},children:e.lines.map((S,ce)=>(0,r.jsxs)("p",{className:`${n}-chat-vn-text`,children:[(0,r.jsxs)("strong",{style:S.role==="assistant"&&S.kind!=="narration"?Za(S.speakerId):void 0,children:[S.role==="user"?b:S.kind==="narration"||S.speakerId==="__venue_scene__"?"Narration":S.name||"Resident",S.kind==="side"?" \xB7 aside":S.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,r.jsx)("span",{style:S.role==="assistant"&&S.kind!=="narration"?zi(S.speakerId):void 0,children:Dr(S.content,`history-${ce}-`)})]},S.id??ce))}):null,ne&&ne.asides.length>0?(0,r.jsx)("div",{className:`${n}-chat-vn-asides`,"data-side":hl,"aria-live":"polite",children:ne.asides.map((S,ce)=>(0,r.jsxs)("div",{className:`${n}-chat-vn-aside`,"data-register":S.register,children:[(0,r.jsx)(fo,{portrait:S.speakerId?E[S.speakerId]:Hr,name:S.name??ne.name,glyph:ne.player?"person":"initial",className:`${n}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${n}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${n}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${n}-chat-vn-aside-icon`,children:S.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${n}-chat-vn-aside-name`,style:Za(S.speakerId??ne.speakerId),children:S.name??ne.name}),S.register==="whisper"&&S.target?(0,r.jsx)("span",{className:`${n}-chat-vn-aside-target`,children:`\u2192 ${S.target}`}):null]}),(0,r.jsx)("p",{className:`${n}-chat-vn-aside-text`,style:zi(S.speakerId??ne.speakerId),children:Dr(S.text,`vn-aside-${ce}-`)})]})]},`${ce}-${S.register}`))}):null,(0,r.jsx)("div",{className:`${n}-chat-vn-card`,"data-register":Ir,children:(0,r.jsx)("div",{className:`${n}-chat-vn-row`,children:(0,r.jsxs)("div",{className:`${n}-chat-vn-column`,children:[Ir==="narration"?(0,r.jsx)("p",{className:`${n}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${n}-chat-vn-name`,style:ne?.player?void 0:Za(ne?.speakerId??""),children:ne?.name??""}),(0,r.jsxs)("div",{ref:A,className:`${n}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[ne?Ir==="narration"?(0,r.jsx)("p",{className:`${n}-chat-vn-beat`,"data-register":"narration",children:Dr(ne.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${n}-chat-vn-text`,style:ne.player?void 0:zi(ne.speakerId),children:Dr(ne.text,"vn-")}):(0,r.jsx)("p",{className:`${n}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:oa.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!g&&d?ml:null]})]})})}),(0,r.jsxs)("div",{className:`${n}-room-panel-tools`,children:[e.lines.length>0?(0,r.jsx)("button",{ref:ft,type:"button",className:`${n}-chat-history-toggle`,"aria-label":"History","aria-expanded":ae,onClick:()=>Zt(S=>!S),children:ae?"Hide history":"History"}):null,(0,r.jsx)("span",{className:`${n}-chat-vn-counter`,children:`${Y+1} / ${Math.max(1,Ke.length)}`}),(0,r.jsxs)("span",{className:`${n}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>G(Y-1),disabled:!ia,"aria-label":"Previous paragraph",children:["\u2039 ",(0,r.jsx)("span",{children:"Previous"})]}),Qa?(0,r.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>G(Y+1),"aria-label":"Next paragraph",children:[(0,r.jsx)("span",{children:"Next"})," \u203A"]}):g?(0,r.jsx)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:e.memoryPending?be:L,disabled:d,children:e.memoryPending?"Leave with memory pending":"Return to map"}):null]})]}),h&&e.status==="opening"?(0,r.jsxs)("div",{className:`${n}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:h}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:L,disabled:d,children:"Back to map"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:Ae,disabled:d,children:"Retry opening"}),e.id?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:na,disabled:d,children:"Continue without opening"}):null]}):null,f?(0,r.jsx)("div",{className:`${n}-room-error`,role:"status",children:(0,r.jsx)("p",{children:f})}):null,$?(0,r.jsx)("p",{className:`${n}-empty`,children:$}):null,e.status==="closing"||e.memoryPending?(0,r.jsx)("p",{className:`${n}-hint`,children:e.memoryPending?`Memory review ${Ve?"in progress":"pending"} \xB7 ${e.memoryReview?.nextRecollection??0}/${St} recollections reviewed. You can leave with memory pending and retry from Memories.`:"Closing this visit\u2026"}):null,g&&!e.memoryPending&&e.memoryReview?.status==="complete"&&!e.memoryReview.decisions?.some(S=>S.action==="promote")?(0,r.jsx)("p",{className:`${n}-hint`,role:"status",children:"Review complete. No durable memories were made from this visit."}):null,vn&&s==="fulfill"&&oa.length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,vn?(0,r.jsxs)("div",{className:`${n}-composer`,children:[s==="fulfill"&&oa.length>0?(0,r.jsxs)("select",{value:c,onChange:S=>v(S.target.value),"aria-label":"Whose wish you fulfilled",disabled:d||g||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),oa.map(S=>(0,r.jsx)("option",{value:S.characterId,children:S.name},S.characterId))]}):null,(0,r.jsx)("div",{className:`${n}-composer-row`,children:(0,r.jsxs)("span",{className:`${n}-chat-input`,children:[(0,r.jsxs)("span",{ref:Ma,className:`${n}-room-mode-anchor`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-room-mode-toggle`,onClick:()=>he(S=>!S),"aria-label":`Mode: ${s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":rt,title:s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude",children:s==="chat"?"\u{1F4AC}":s==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),rt?(0,r.jsx)("span",{className:`${n}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(S=>(0,r.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":s===S,disabled:d||S==="fulfill"&&oa.length===0,onClick:()=>{y(S),he(!1)},children:S==="chat"?"Chat":S==="fulfill"?"Fulfill":"Conclude"},S))}):null]}),se?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:se,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,Ee?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:Ee,children:"Projects"}):null,(0,r.jsx)("textarea",{ref:Ut,className:`${n}-textarea`,rows:1,value:o,onChange:S=>w(S.target.value),onKeyDown:S=>{E0(S.key,S.shiftKey,S.nativeEvent.isComposing)&&(S.preventDefault(),Ei())},placeholder:s==="fulfill"?"What did you do for them?":s==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:d||g||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${n}-chat-send`,onClick:Ei,disabled:d||g||e.status!=="active"||s!=="conclude"&&o.trim().length===0||s==="fulfill"&&!c,"aria-label":d?"Sending":"Send",title:d?"Sending":"Send",children:d?"Sending\u2026":"Send"})]})})]}):null,h&&e.status!=="opening"?(0,r.jsx)("div",{className:`${n}-room-error`,role:"alert",children:(0,r.jsx)("p",{children:h})}):null]})]})}var s1="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function E2({snapshot:e,room:t,onSnapshot:a,onReturn:i}){let[o,s]=(0,m.useState)(""),[c,d]=(0,m.useState)(""),[h,f]=(0,m.useState)("workplace"),[$,x]=(0,m.useState)("power-source"),[g,b]=(0,m.useState)(""),[C,E]=(0,m.useState)(""),[R,w]=(0,m.useState)(""),[y,v]=(0,m.useState)(""),[k,O]=(0,m.useState)(""),[F,H]=(0,m.useState)("limited-opportunity"),[L,be]=(0,m.useState)(!1),[J,Ve]=(0,m.useState)(""),[Ae,na]=(0,m.useState)(!1),[gt,xt]=(0,m.useState)(""),at=(t?.lines??[]).filter(ee=>ee.role==="assistant"&&!!ee.speakerId&&!!ee.id),U=ee=>t?.submissions?.find(G=>G.at===ee.at),se=async(ee,G)=>{na(!0),xt("");try{a(await D(ee,{method:"POST",body:JSON.stringify(G)}))}catch(ae){xt(B(ae,"The project could not be updated."))}finally{na(!1)}},Ee=(ee,G,ae={})=>se(`/projects/${encodeURIComponent(ee)}/${G}`,ae);return(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Projects"}),t?.status==="active"?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:i,children:"Return to current visit"}):null,(0,r.jsx)("p",{className:`${n}-macro-help`,children:"A request starts planning. Spoken offers, recovered supplies, committed supplies, and a resident's build shift are recorded separately. A scene description alone cannot finish a project."}),e.villageCapabilities.length?(0,r.jsxs)("p",{className:`${n}-hint`,children:["Village capabilities: ",e.villageCapabilities.join(", ")]}):null,(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("h3",{children:"Propose a new venue"}),(0,r.jsx)("input",{className:`${n}-notice-input`,"aria-label":"Proposed venue name",value:o,onChange:ee=>s(ee.target.value),placeholder:"Power plant"}),(0,r.jsxs)("select",{className:`${n}-notice-input`,"aria-label":"Proposed venue class",value:h,onChange:ee=>f(ee.target.value),children:[(0,r.jsx)("option",{value:"workplace",children:"Workplace"}),(0,r.jsx)("option",{value:"gathering",children:"Gathering"}),(0,r.jsx)("option",{value:"other",children:"Other"})]}),(0,r.jsx)("textarea",{className:`${n}-textarea`,"aria-label":"Proposed venue description",value:c,onChange:ee=>d(ee.target.value),placeholder:"What would this place be like in this village?"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ae||!o.trim()||!c.trim(),onClick:()=>{se("/projects",{name:o,classes:[h],description:c})},children:"Create planning draft"})]}),(e.projects??[]).filter(ee=>ee.kind==="build-venue"&&ee.plan).map(ee=>{let G=ee.plan,ae=`/projects/${encodeURIComponent(ee.id)}`,Zt=e.villagers.find(V=>V.characterId===G.builderId);return(0,r.jsxs)("details",{className:`${n}-notice-row`,open:ee.status!=="complete",children:[(0,r.jsxs)("summary",{children:[(0,r.jsx)("strong",{children:ee.title})," \xB7 ",ee.status," \xB7 plan ",G.revision]}),(0,r.jsx)("p",{children:ee.venueDraft?.description}),(0,r.jsxs)("p",{children:["Need: ",G.need]}),G.blockedReason?(0,r.jsxs)("p",{role:"status",children:["Blocked: ",G.blockedReason]}):null,G.workOrder?(0,r.jsxs)("p",{children:["Builder: ",Zt?.name??G.builderId??"needs reassignment",". Shift ends"," ",new Date(G.workOrder.completesAt).toLocaleString(),"."]}):null,G.capability?(0,r.jsxs)("p",{children:["Completion outcome: ",G.capability]}):null,ee.status==="draft"?(0,r.jsxs)("label",{className:`${n}-field`,children:["Site beside",(0,r.jsx)("select",{className:`${n}-notice-input`,value:G.siteVenueId,disabled:Ae,onChange:V=>{Ee(ee.id,"site",{venueId:V.target.value})},children:e.settings.venues.filter(V=>V.constructionStatus!=="worksite").map(V=>(0,r.jsx)("option",{value:V.id,children:V.name},V.id))})]}):null,ee.status==="draft"?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ae,onClick:()=>{Ee(ee.id,"agree")},children:"Agree to these terms"}):null,(0,r.jsx)("ul",{className:`${n}-notices`,children:G.requirements.map(V=>{let Q=G.receipts.some(Nt=>(V.id==="site-permission"?Nt.kind==="promise":Nt.kind==="committed")&&Nt.requirementId===V.id&&!G.receipts.some(We=>We.kind==="released"&&We.sourceLineId===Nt.id));return(0,r.jsxs)("li",{children:[(0,r.jsx)("strong",{children:V.title})," \xB7 ",Q?"committed":"open"]},V.id)})}),G.sources.map(V=>{let Q=e.settings.venues.find(me=>me.id===V.venueId),Nt=e.villagers.find(me=>me.characterId===V.supplierId),We=G.receipts.some(me=>me.kind==="promise"&&me.sourceId===V.id),rt=G.receipts.find(me=>me.kind==="acquired"&&me.sourceId===V.id),he=rt&&G.receipts.some(me=>me.kind==="committed"&&me.sourceLineId===rt.id&&!G.receipts.some(Ht=>Ht.kind==="released"&&Ht.sourceLineId===me.id)),Se=at.findLast(me=>t?.placeId===V.venueId&&me.speakerId===V.supplierId&&me.content.toLowerCase().includes(V.itemName.toLowerCase())&&U(me)?.mode==="chat"),ie=at.findLast(me=>t?.placeId===V.venueId&&(V.kind==="existing-item"||me.speakerId===V.supplierId)&&me.content.toLowerCase().includes(V.itemName.toLowerCase())&&/\b(?:i (?:give|hand|provide|deliver|entrust) you|here (?:is|are)|you (?:may|can) take)\b/iu.test(me.content)&&U(me)?.mode==="chat");return(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("strong",{children:V.itemName}),(0,r.jsxs)("p",{children:[V.kind==="limited-opportunity"?`Limited offer from ${Nt?.name??"a resident"}`:"Existing recorded item"," ","at ",Q?.name??"missing source","; yield remaining ",V.remaining,". ",V.prerequisite," ","Cost: ",V.cost]}),(0,r.jsx)("p",{children:V.requirementId==="site-permission"?`Site agreement: ${We?"recorded":"needed"}`:`${V.kind==="existing-item"?"Recorded item":`Promise: ${We?"recorded":"needed"}`} \xB7 acquired: ${rt?"yes":"no"} \xB7 committed: ${he?"yes":"no"}`}),ee.status==="active"&&V.kind==="limited-opportunity"&&!We?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ae||!t||!Se,onClick:()=>Se&&void Ee(ee.id,"promise",{sourceId:V.id,sessionId:t?.id,submissionId:U(Se)?.id,lineId:Se.id}),children:"Record spoken offer"}):null,ee.status==="active"&&V.requirementId!=="site-permission"&&!rt?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ae||!t||!ie,onClick:()=>{Ee(ee.id,"acquire",{sourceId:V.id,sessionId:t?.id,submissionId:ie?U(ie)?.id:"",lineId:ie?.id})},children:"Record recovered supply"}):null,ee.status==="active"&&rt&&!he?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ae,onClick:()=>{Ee(ee.id,"commit",{acquiredReceiptId:rt.id,submissionId:cl()})},children:"Commit this supply"}):null]},V.id)}),ee.status==="draft"||ee.status==="active"?(0,r.jsxs)("details",{className:`${n}-field`,children:[(0,r.jsxs)("summary",{children:["Add an alternative route",ee.status==="active"?" (revised plan)":""]}),(0,r.jsx)("select",{className:`${n}-notice-input`,"aria-label":"Requirement for alternative",value:G.requirements.some(V=>V.id===$)?$:G.requirements[0]?.id??"",onChange:V=>x(V.target.value),children:G.requirements.map(V=>(0,r.jsx)("option",{value:V.id,children:V.title},V.id))}),(0,r.jsxs)("select",{className:`${n}-notice-input`,"aria-label":"Source venue",value:g,onChange:V=>b(V.target.value),children:[(0,r.jsx)("option",{value:"",children:"Choose source venue"}),e.settings.venues.filter(V=>V.constructionStatus!=="worksite").map(V=>(0,r.jsx)("option",{value:V.id,children:V.name},V.id))]}),(0,r.jsxs)("select",{className:`${n}-notice-input`,"aria-label":"Source kind",value:F,onChange:V=>H(V.target.value),children:[(0,r.jsx)("option",{value:"limited-opportunity",children:"Limited resident opportunity"}),(0,r.jsx)("option",{value:"existing-item",children:"Existing recorded item"})]}),F==="limited-opportunity"?(0,r.jsxs)("select",{className:`${n}-notice-input`,"aria-label":"Supplier",value:C,onChange:V=>E(V.target.value),children:[(0,r.jsx)("option",{value:"",children:"Choose resident supplier"}),e.villagers.map(V=>(0,r.jsx)("option",{value:V.characterId,children:V.name},V.characterId))]}):null,(0,r.jsx)("input",{className:`${n}-notice-input`,"aria-label":"Source item",value:R,onChange:V=>w(V.target.value),placeholder:"Exact item or offered supply"}),(0,r.jsx)("input",{className:`${n}-notice-input`,"aria-label":"Route prerequisite",value:k,onChange:V=>O(V.target.value),placeholder:"What must be done first?"}),(0,r.jsx)("input",{className:`${n}-notice-input`,"aria-label":"Route cost",value:y,onChange:V=>v(V.target.value),placeholder:"Favor, tradeoff, or recorded item debit"}),(0,r.jsxs)("label",{children:[(0,r.jsx)("input",{type:"checkbox",checked:L,onChange:V=>be(V.target.checked)})," ","Established magic"]}),L?(0,r.jsx)("input",{className:`${n}-notice-input`,"aria-label":"Exact lore quote",value:J,onChange:V=>Ve(V.target.value),placeholder:"Exact setting or lore excerpt"}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ae||!g||F==="limited-opportunity"&&!C||!R.trim()||!y.trim()||!k.trim(),onClick:()=>{se(`${ae}/routes`,{requirementId:G.requirements.some(V=>V.id===$)?$:G.requirements[0]?.id,venueId:g,supplierId:C,itemName:R,kind:F,cost:y,prerequisite:k,magic:L,loreQuote:J})},children:"Add route"})]}):null,ee.status==="active"||ee.status==="blocked"?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("strong",{children:"Resident builder"}),(0,r.jsx)("p",{children:Zt?`${Zt.name} agreed to build.`:"Ask a resident to explicitly agree to build this venue in a visit."}),at.filter(V=>/\bbuild\b/iu.test(V.content)&&U(V)).slice(-4).map(V=>(0,r.jsxs)("button",{type:"button",className:`${n}-button`,disabled:Ae,onClick:()=>{Ee(ee.id,"recruit",{sessionId:t?.id,submissionId:U(V)?.id,lineId:V.id,residentId:V.speakerId})},children:["Record ",V.name,"'s agreement: \u201C",V.content.slice(0,70),"\u201D"]},V.id)),ee.status==="active"?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ae||!Zt,onClick:()=>{Ee(ee.id,"start")},children:"Start resident construction shift"}):null]}):null]},ee.id)}),gt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:gt}):null]})}function C2({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let l=()=>{let p=e.getBoundingClientRect();a(p.width<=704||p.width<=880&&p.height<=512)};l();let u=new ResizeObserver(l);return u.observe(e),()=>u.disconnect()},[e]);let[i,o]=(0,m.useState)(null),[s,c]=(0,m.useState)(null),[d,h]=(0,m.useState)(null),[f,$]=(0,m.useState)(0),[x,g]=(0,m.useState)("residents"),[b,C]=(0,m.useState)(null),[E,R]=(0,m.useState)(null),[w,y]=(0,m.useState)(0),[v,k]=(0,m.useState)(0),[O,F]=(0,m.useState)(0),[H,L]=(0,m.useState)(null),[be,J]=(0,m.useState)(!1),[Ve,Ae]=(0,m.useState)(""),[na,gt]=(0,m.useState)(""),[xt,at]=(0,m.useState)(""),[U,se]=(0,m.useState)(null),[Ee,ee]=(0,m.useState)(!1),[G,ae]=(0,m.useState)("home"),[Zt,V]=(0,m.useState)(null),[Q,Nt]=(0,m.useState)("view"),[We,rt]=(0,m.useState)("exterior");(0,m.useEffect)(()=>{if(We==="exterior")return;let l=i?.settings.venues.find(p=>p.id===Zt);(We.startsWith("class:")?l&&fn(l).includes(We.slice(6)):l&&We.startsWith("private:")&&(l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[])).includes(We.slice(8))&&l.privateSpaces?.some(p=>p.ownerId===We.slice(8)))||rt("exterior")},[i,Zt,We]);let[he,Se]=(0,m.useState)(null),[ie,me]=(0,m.useState)(null),[Ht,Ut]=(0,m.useState)(!1),[Ma,ft]=(0,m.useState)(""),[bn,A]=(0,m.useState)(""),[j,ye]=(0,m.useState)(""),[je,He]=(0,m.useState)(null),[St,Ke]=(0,m.useState)(!1),[Y,ne]=(0,m.useState)("village"),[ia,Qa]=(0,m.useState)("index"),[vn,Ti]=(0,m.useState)({}),[Ei,Ir]=(0,m.useState)(null),[Hr,oa]=(0,m.useState)({}),[Oa,Ci]=(0,m.useState)({}),[zi,Za]=(0,m.useState)(""),[bo,Ur]=(0,m.useState)(null),[hl,ml]=(0,m.useState)(""),[S,ce]=(0,m.useState)(""),[Z,kt]=(0,m.useState)(""),[Vt,yn]=(0,m.useState)(null),[wn,pl]=(0,m.useState)(""),[$n,vo]=(0,m.useState)([]),[Gu,Zp]=(0,m.useState)(1600),[Va,Kp]=(0,m.useState)([]),[yo,Jp]=(0,m.useState)(1600),[Yu,y1]=(0,m.useState)(null),[Pp,Fp]=(0,m.useState)(""),[gl,wo]=(0,m.useState)([]),[Wp,w1]=(0,m.useState)(""),[va,fl]=(0,m.useState)([]),[Ai,Kt]=(0,m.useState)(!1),[bl,Ri]=(0,m.useState)(!1),[$1,Xu]=(0,m.useState)(null),[x1,eg]=(0,m.useState)(null),[vl,tg]=(0,m.useState)(null),[yl,ag]=(0,m.useState)(""),[De,wl]=(0,m.useState)(0),[Ka,ng]=(0,m.useState)(""),[Tt,ig]=(0,m.useState)(""),[xn,og]=(0,m.useState)("rebuild"),[ya,Qu]=(0,m.useState)(go("rebuild").premise),[qr,rg]=(0,m.useState)(""),[N1,S1]=(0,m.useState)(Mp),[Nn,sg]=(0,m.useState)([]),[k1,$l]=(0,m.useState)([]),[Je,Mi]=(0,m.useState)([]),[Br,Da]=(0,m.useState)(null),[T1,lg]=(0,m.useState)(0),[cg,Zu]=(0,m.useState)(!1),[Ku,Oi]=(0,m.useState)(null),[Lr,Gn]=(0,m.useState)(null),[Ja,xl]=(0,m.useState)(!1),[ug,Ju]=(0,m.useState)(""),[Nl,dg]=(0,m.useState)(B0),[_e,Vi]=(0,m.useState)("generate"),[E1,Pu]=(0,m.useState)(""),[Sl,Fu]=(0,m.useState)(null),[C1,hg]=(0,m.useState)(""),[jr,Wu]=(0,m.useState)(null),[$o,ed]=(0,m.useState)(""),[xo,td]=(0,m.useState)(""),Gr=JSON.stringify({scenario:xn,premise:ya.trim(),direction:qr.trim(),setting:Tt.trim(),lorebooks:Va,loreBudget:yo}),ad=(0,m.useRef)(Gr);(0,m.useEffect)(()=>{ad.current!==Gr&&!i?.isFounded&&Gn(null),ad.current=Gr},[Gr,i?.isFounded]);let nd=JSON.stringify({setting:Tt.trim(),worldFacts:i?.isFounded?Nn:null,lorebooks:Va,structure:$o,negative:xo,options:Nl}),[qt,Yr]=(0,m.useState)(!1),[mg,kl]=(0,m.useState)(""),[id,z1]=(0,m.useState)("Connections are still loading."),[pg,gg]=(0,m.useState)(!1),[A1,Xr]=(0,m.useState)(!1),[fg,we]=(0,m.useState)(""),[R1,Tl]=(0,m.useState)(!1),[El,Cl]=(0,m.useState)(""),[_a,od]=(0,m.useState)(null),[rd,Qr]=(0,m.useState)(null),[M1,sd]=(0,m.useState)(!1),[Pa,No]=(0,m.useState)(""),[bg,Yn]=(0,m.useState)(null),So=i?.settings.townMapView??Uu("cover"),vg=i?_a?.size??{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:null,yg=i?_e==="existing"?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:jr&&Sl===_e?jr:{width:i.settings.townMapGenerationWidth,height:i.settings.townMapGenerationHeight}:null,O1=i?{min:i.settings.townMapZoomMin,max:i.settings.townMapZoomMax,step:i.settings.townMapZoomStep}:{min:1,max:1,step:.1},zl=_a?_a.image:El||null,Di=_e==="none"?null:_e==="existing"?El||null:Sl===_e&&(_e!=="generate"||C1===nd)&&E1||null,Al=_a!==null||M1,Zr=Al?rd??So:So,ld=_a?Ip(_a.size):null,[Kr,Ue]=(0,m.useState)(""),[Bt,W]=(0,m.useState)(""),[I,P]=(0,m.useState)(!1),[q,qe]=(0,m.useState)(null),[V1,Jr]=(0,m.useState)(!1),[D1,Ia]=(0,m.useState)(!1),[Pr,Sn]=(0,m.useState)(""),[Fr,Rl]=(0,m.useState)("chat"),[Wr,cd]=(0,m.useState)(""),[_1,wg]=(0,m.useState)(""),[I1,Ha]=(0,m.useState)([]),Ua=(0,m.useRef)(new Set),[ud,H1]=(0,m.useState)(!1),$g=(0,m.useRef)(0),ko=(0,m.useRef)(0),xg=(0,m.useRef)(""),[dd,To]=(0,m.useState)(""),[qa,st]=(0,m.useState)(!1),[es,Ng]=(0,m.useState)(""),Ml=(0,m.useRef)(new Set),kn=(0,m.useRef)(!1),_i=(0,m.useRef)(null),ts=(0,m.useRef)(null),Lt=(0,m.useRef)(null),Xn=(0,m.useCallback)(l=>{let u=[];for(let p of l)Ua.current.has(p.id)||(Ua.current.add(p.id),u.push(p));u.length>0&&Ha(p=>[...p,...u])},[]),as=(0,m.useRef)(!1),[U1,lt]=(0,m.useState)(""),[q1,Ii]=(0,m.useState)(""),[Eo,Co]=(0,m.useState)(!1),[Ol,hd]=(0,m.useState)(""),Sg=(0,m.useRef)(""),Vl=(0,m.useRef)(!1),[Dl,kg]=(0,m.useState)(!1),md=(0,m.useRef)(null),pd=(0,m.useRef)(null);(0,m.useEffect)(()=>{let l=pd.current,u=md.current;l===null||!u||(pd.current=null,u.focus(),u.setSelectionRange(l,l))},[S]);let _l=(0,m.useCallback)(async(l=!1)=>{if(Vl.current)return null;Vl.current=!0;let u=setTimeout(()=>kg(!0),a2);try{let p=await D("/reconcile",{method:"POST",body:l?JSON.stringify({forceStory:!0}):void 0});return o(p),p}catch{return null}finally{clearTimeout(u),kg(!1),Vl.current=!1}},[]),Tg=(0,m.useCallback)(async()=>{let l=i?.happenings[0]?.id??"";hd("Writing...");let u=await _l(!0);if(!u){hd("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}hd((u.happenings[0]?.id??"")===l?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[i,_l]),Ce=(0,m.useCallback)(async(l={})=>{try{let u=await D("",{signal:l.signal});o(u),Ue("")}catch(u){if(l.signal?.aborted||l.quiet)return;o(null),Ue(B(u,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let l=i?.village.nextTransitionAt??"";l.length===0||l===Sg.current||(Sg.current=l,i?.isFounded&&_l())},[i,_l]);let Fa=(0,m.useCallback)(async l=>{try{let u=await D("/catalog",{signal:l});c(u.characters),Ue("")}catch(u){if(l?.aborted)return;Ue(B(u,"Could not read your character library."))}},[]),zo=(0,m.useCallback)(async l=>{try{let u=await D("/personas",{signal:l});yn(u.personas)}catch(u){if(l?.aborted)return;yn([]),Ue(B(u,"Could not read your Personas."))}},[]),Ao=(0,m.useCallback)(async l=>{try{let u=await D("/lorebooks",{signal:l});y1(u.books),Fp("")}catch(u){if(l?.aborted)return;Fp(B(u,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),Eg=(0,m.useCallback)(async l=>{try{let u=await D("/story?offset=0&limit=50",{signal:l});h(u.entries),$(u.total)}catch(u){if(l?.aborted)return;h(null),Ue(B(u,"Could not read the village story."))}},[]),Cg=(0,m.useRef)(new Set),Il=(0,m.useCallback)(async l=>{try{let u=await D("/memories",{signal:l});C(u),Ue("");let p=u.archive.pendingReviewId;p&&!Cg.current.has(p)&&!l?.aborted&&(Cg.current.add(p),window.setTimeout(()=>{l?.aborted||D(`/rooms/archive/${encodeURIComponent(p)}/retry-memory`,{method:"POST"}).then(()=>D("/memories")).then(N=>{l?.aborted||C(N)}).catch(()=>{})},0))}catch(u){if(l?.aborted)return;C(null),Ue(B(u,"Could not read villager memories."))}},[]),B1=(0,m.useCallback)(async(l,u)=>{let p=l==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(p)){P(!0);try{await D(`/memories/${l}/${encodeURIComponent(u)}`,{method:"DELETE"}),await Il()}catch(N){Ue(B(N,"That memory could not be removed."))}finally{P(!1)}}},[Il]),L1=(0,m.useCallback)(async l=>{P(!0);try{let u=await D(`/story/${encodeURIComponent(l)}`,{method:"DELETE"});h(u.entries),$(u.total),Ue("")}catch(u){Ue(B(u,"That memory could not be removed."))}finally{P(!1)}},[]),j1=(0,m.useCallback)(async()=>{let l=d?.length??0;try{let u=await D(`/story?offset=${l}&limit=50`);h(p=>[...p??[],...u.entries]),$(u.total)}catch(u){Ue(B(u,"Could not read more memories."))}},[d]),Hl=(0,m.useCallback)(async l=>{try{let u=await D("/agendas",{signal:l});se(u.villagers)}catch(u){if(l?.aborted)return;se(null),Ue(B(u,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(G!=="menu"||Y!=="agendas"&&Y!=="schedules"||!U?.some(u=>u.agenda?.personalizationPending&&!u.agenda.personalizationFailure))return;let l=window.setInterval(()=>{Hl()},5e3);return()=>window.clearInterval(l)},[U,Hl,Y,G]);let G1=(0,m.useCallback)(async l=>{P(!0);try{let u=await D(`/agendas/${encodeURIComponent(l)}/regenerate`,{method:"POST"});se(u.villagers),Ue("")}catch(u){Ue(B(u,"That villager could not be asked again."))}finally{P(!1)}},[]),Y1=(0,m.useCallback)(async(l,u)=>{P(!0);try{let p=await D(`/agendas/${encodeURIComponent(l)}/completed/${encodeURIComponent(u)}/correct`,{method:"POST"});se(p.villagers),Ue("")}catch(p){Ue(B(p,"That wish completion could not be corrected."))}finally{P(!1)}},[]),X1=(0,m.useCallback)(async(l,u)=>{P(!0);try{let p=await D(`/agendas/${encodeURIComponent(l)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:u})});se(p.villagers),Ue("")}catch(p){Ue(B(p,"Schedule use could not be changed."))}finally{P(!1)}},[]);(0,m.useEffect)(()=>{let l=new AbortController;return Ce({signal:l.signal}),()=>l.abort()},[Ce]),(0,m.useEffect)(()=>{let l=()=>{document.hidden||Ce({quiet:!0})},u=setInterval(()=>{document.hidden||Vl.current||Ce({quiet:!0})},t2);return document.addEventListener("visibilitychange",l),()=>{clearInterval(u),document.removeEventListener("visibilitychange",l)}},[Ce]),(0,m.useEffect)(()=>{if(!q?.id||q.status==="closed"||G!=="room")return;xg.current!==q.id?(xg.current=q.id,ko.current=Date.parse(q.lastActivityAt||q.startedAt)||Date.now()):ko.current=Math.max(ko.current,Date.parse(q.lastActivityAt||q.startedAt)||0);let l=!1,u=_=>{l||Or(q.id,Lt.current)||(qe(null),Ia(!1),Ha([]),Ua.current.clear(),To(_==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ae("home"),Ce())},p=(_=!1)=>{Or(q.id,Lt.current)||D("/rooms/active").then(async({session:X})=>{if(l||Or(q.id,Lt.current))return;if(X?.id===q.id){_&&(await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:q.id})}),ko.current=Date.now());return}let $e=await D(`/rooms/archive/${encodeURIComponent(q.id)}`).catch(()=>null);l||Or(q.id,Lt.current)||u($e?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(X=>{let $e=Vr(X);$e&&u($e)})},N=_=>{if(!Or(q.id,Lt.current)){if(Date.now()-ko.current>=30*6e4){_.cancelable&&_.preventDefault(),_.stopImmediatePropagation(),p(!0);return}ko.current=Date.now(),!(Date.now()-$g.current<15e3)&&($g.current=Date.now(),D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:q.id})}).catch(X=>{let $e=Vr(X);$e?u($e):p()}))}},z=()=>p();window.addEventListener("focus",z),document.addEventListener("visibilitychange",z);for(let _ of["pointerdown","keydown","input","scroll"])window.addEventListener(_,N,!0);return()=>{l=!0,window.removeEventListener("focus",z),document.removeEventListener("visibilitychange",z);for(let _ of["pointerdown","keydown","input","scroll"])window.removeEventListener(_,N,!0)}},[q?.id,q?.status,q?.lastActivityAt,q?.startedAt,G,Ce]),(0,m.useEffect)(()=>{let l=new AbortController;return D("/rooms/active",{signal:l.signal}).then(({session:u,debugDiscardEnabled:p})=>{H1(p),!(l.signal.aborted||!u)&&(qe(u),Rl("chat"),Ia(!0),ae("room"),u.status==="opening"&&(st(!0),D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u.id}),signal:AbortSignal.timeout(3e4)}).then(({session:N})=>{l.signal.aborted||qe(N)}).catch(async N=>{if(l.signal.aborted)return;let z=await X0(u.id);l.signal.aborted||(z?qe(z):lt(Z0(N)))}).finally(()=>{l.signal.aborted||st(!1)})))}).catch(()=>{}),()=>l.abort()},[]),(0,m.useEffect)(()=>{if(Y!=="chatlogs"||!i?.isFounded)return;let l=new AbortController,u=new URLSearchParams;return Ve&&u.set("venueId",Ve),na&&u.set("characterId",na),u.set("offset",String(v)),u.set("limit","20"),R(null),D(`/rooms/archive?${u.toString()}`,{signal:l.signal}).then(({visits:p,total:N})=>{l.signal.aborted||(R(p),y(N),at(""))}).catch(p=>{l.signal.aborted||at(B(p,"Venue visits could not be read."))}),()=>l.abort()},[Ve,na,v,O,Y,i?.isFounded]);let gd=(0,m.useCallback)(async l=>{try{let u=await D(`/rooms/archive/${encodeURIComponent(l)}`);L(u.visit),at("")}catch(u){at(B(u,"That visit could not be read."))}},[]),Q1=(0,m.useCallback)(async l=>{P(!0);try{await D(`/rooms/archive/${encodeURIComponent(l)}/retry-memory`,{method:"POST"}),await gd(l),F(u=>u+1),at("")}catch(u){at(B(u,"Memory filing is still pending."))}finally{P(!1)}},[gd]),zg=(0,m.useCallback)(async l=>{if(window.confirm(l?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){P(!0);try{await D(l?`/rooms/archive/${encodeURIComponent(l)}`:"/rooms/archive",{method:"DELETE"}),L(null),k(0),F(u=>u+1),at("")}catch(u){at(B(u,"Visit transcripts could not be deleted."))}finally{P(!1)}}},[]);(0,m.useEffect)(()=>{if(!Ee)return;let l=new AbortController;return Fa(l.signal),()=>l.abort()},[Ee,Fa]);let Ag=i?i.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(Ag===null)return;let l=new AbortController;return(async()=>{try{let u=await D("/town-map",{signal:l.signal});Cl(u.image)}catch{l.signal.aborted||Cl("")}})(),()=>l.abort()},[Ag]);let Z1=(0,m.useCallback)(async l=>{P(!0);try{o(await D("/villagers",{method:"POST",body:JSON.stringify({characterId:l})})),Ue(""),await Fa()}catch(u){Ue(B(u,"That character could not move in."))}finally{P(!1)}},[Fa]),K1=(0,m.useCallback)(async l=>{P(!0);try{o(await D(`/villagers/${encodeURIComponent(l)}`,{method:"DELETE"})),Ue(""),s&&await Fa()}catch(u){Ue(B(u,"That villager could not leave."))}finally{P(!1)}},[s,Fa]),J1=(0,m.useCallback)(async l=>{Za(l);try{let u=await D(`/villagers/${encodeURIComponent(l)}/refresh`);Ci(p=>({...p,[l]:u})),Ue("")}catch(u){Ue(B(u,"That villager's card could not be compared."))}finally{Za("")}},[]),P1=(0,m.useCallback)(async l=>{Za(l);try{o(await D(`/villagers/${encodeURIComponent(l)}/refresh`,{method:"POST"})),Ci(u=>{let p={...u};return delete p[l],p}),Ue("")}catch(u){Ue(B(u,"That villager's card could not be refreshed."))}finally{Za("")}},[]),et=(0,m.useCallback)(l=>{Qa(l==="noticeboard"?"noticeboard":l==="general"?"general":l==="replyGuidance"||l==="story"||l==="chatlogs"||l==="agendas"||l==="schedules"?"debug":"village"),W(""),Ke(!1),l==="villagers"&&Fa(),l==="villagers"&&(G!=="menu"||Y!=="villagers")&&g("residents"),l==="village"&&zo(),l==="village"&&Ao(),l==="story"&&Eg(),(l==="agendas"||l==="schedules")&&Hl(),l==="village"&&(G!=="menu"||Y!=="village")&&i&&(ce(i.settings.promptKnowledge),kt(i.settings.playerPersonaId),pl(i.settings.setting),vo(i.settings.selectedLorebookIds),Zp(i.settings.loreTokenBudget),wo(jn(i.settings.venues).map(p=>({...p})))),ne(l),ae("menu")},[Hl,Fa,Ao,zo,Eg,Y,G,i]),fd=(0,m.useCallback)(()=>{ee(!1),W(""),He(null),Ke(!1),ae("home")},[]),Qn=(0,m.useCallback)(l=>{!l.memoryPending||Ml.current.has(l.id)||(Ml.current.add(l.id),Ng(l.id),D(`/rooms/archive/${encodeURIComponent(l.id)}/retry-memory`,{method:"POST"}).then(u=>{kn.current||(qe(p=>p?.id===l.id?u.session:p),Xn(u.recordEvents??[]))}).catch(u=>{kn.current||lt(B(u,"Memory review is still pending. You can leave and retry from Memories."))}).finally(()=>{Ml.current.delete(l.id),Ng(u=>u===l.id?"":u)}))},[Xn]);(0,m.useEffect)(()=>{if(!es)return;let l=window.setInterval(()=>{D(`/rooms/archive/${encodeURIComponent(es)}`).then(({visit:u})=>{kn.current||!Ml.current.has(es)||qe(p=>p?.id===u.id&&p.memoryPending?{...p,memoryPending:u.memoryPending,memoryReview:u.memoryReview}:p)}).catch(()=>{})},2e3);return()=>window.clearInterval(l)},[es]);let F1=(0,m.useCallback)(async()=>{if(!(!q||qa)&&!(q.memoryPending&&(q.status==="closed"||Eo))){if(!q.id||q.status==="closed"||Eo){Lt.current=null,Ia(!1),qe(null),Ha([]),Ua.current.clear(),Sn(""),Ii(""),ae("home"),Ce();return}st(!0),lt(""),J(!1),qe({...q,status:"closing"}),Lt.current={roomId:q.id,submissionId:""};try{let l=await D("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:q.id})});if(kn.current)return;qe(l.session),Co(!0),Xn(l.recordEvents??[]),Qn(l.session),Sn(""),Ii(""),Ce()}catch(l){if(kn.current)return;Lt.current=null;let u=Vr(l);if(u){qe(null),Ia(!1),Ha([]),Ua.current.clear(),To(u==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ae("home"),Ce();return}lt(B(l,"You could not leave the venue.")),J(!0)}finally{st(!1)}}},[Ce,Xn,q,qa,Eo,Qn]),W1=(0,m.useCallback)(async()=>{if(!q?.id||q.status!=="active"||qa||as.current)return;let l=ts.current??cl();ts.current=l,Lt.current={roomId:q.id,submissionId:l},st(!0),lt(""),J(!1);try{let u=await D("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:q.id,submissionId:l,message:Pr}),signal:AbortSignal.timeout(3e5)});qe(u.session),Co(!0),Xn(u.recordEvents??[]),Qn(u.session),ts.current=null,Sn(""),Ce()}catch(u){let p=await Q0(q.id,l);if(p){qe(p),Co(!0),Qn(p),Sn(""),lt(""),J(!1),ts.current=null,Ce();return}Lt.current=null;let N=Vr(u);if(N){qe(null),Ia(!1),Ha([]),Ua.current.clear(),To(N==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ae("home"),Ce();return}lt(B(u,"The scene could not end yet.")),J(!0)}finally{st(!1)}},[Ce,Xn,q,qa,Pr,Qn]),e$=(0,m.useCallback)(async()=>{if(!(!q?.id||kn.current)){kn.current=!0,st(!0);try{await D("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:q.id})}),Lt.current=null,Ia(!1),qe(null),Ha([]),Ua.current.clear(),ae("home"),J(!1),Ce()}catch(l){lt(B(l,"The visit could not be left yet.")),kn.current=!1}finally{st(!1)}}},[Ce,q]),t$=(0,m.useCallback)(async()=>{if(!(!q?.id||!ud||qa)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){st(!0);try{await D("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:q.id})}),qe(null),Ia(!1),Ha([]),Ua.current.clear(),Sn(""),ae("home"),Ce()}catch(l){lt(B(l,"The debug discard failed."))}finally{st(!1)}}},[q,ud,qa,Ce]),a$=(0,m.useCallback)(async()=>{let l=Pr.trim();if(q===null||!q.id||Eo||qa||as.current||l.length===0)return;as.current=!0;let u=_i.current??cl();_i.current=u;let p=q;try{await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:q.id})})}catch(z){as.current=!1;let _=Vr(z);_?(qe(null),Ia(!1),Ha([]),Ua.current.clear(),To(_==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ae("home"),Ce()):lt(B(z,"The visit could not be checked."));return}let N={speakerId:"",name:"",role:"user",content:l,at:new Date().toISOString()};st(!0),lt(""),Sn(""),qe({...q,lines:[...q.lines,N]}),Lt.current={roomId:q.id,submissionId:u};try{let z=await D("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:q.id,message:l,mode:Fr,targetId:Fr==="fulfill"?Wr:"",submissionId:u}),signal:AbortSignal.timeout(3e5)});qe(z.session),Co(z.session.status==="closed"),z.session.status!=="closed"&&(Lt.current=null),Xn(z.recordEvents??[]),z.session.status==="closed"&&Qn(z.session),Wr&&!z.session.activeIds.includes(Wr)&&cd(""),wg(z.verdict?.reason??""),Rl("chat"),_i.current=null,Ii(""),Ce()}catch(z){let _=await Q0(q.id,u);if(_){qe(_),Co(!0),Qn(_),lt(""),_i.current=null,Ii(""),Ce();return}Lt.current=null;let X=Vr(z);if(X){qe(null),Ia(!1),Ha([]),Ua.current.clear(),To(X==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ae("home"),Ce();return}qe(p),Sn(l),lt(B(z,"That line could not be sent."))}finally{as.current=!1,st(!1)}},[Ce,Xn,q,qa,Pr,Eo,Fr,Wr,Qn]),n$=(0,m.useCallback)(l=>(i?.villagers??[]).filter(u=>u.place?.id===l),[i]),Ul=(0,m.useCallback)(l=>{He(null),Ke(!1),V(l.id),Nt("view"),rt("exterior"),Se(null),me(null),ae("venue")},[]),bd=(0,m.useCallback)(async l=>{st(!0),lt(""),Ii("");try{let u=await D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(3e4)});qe(u.session),Ce()}catch(u){let p=await X0(l);p?qe(p):lt(Z0(u))}finally{st(!1)}},[Ce]),i$=(0,m.useCallback)(async l=>{st(!0);try{let{session:u}=await D("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(1e4)});qe(u),Ii(u.lines.length===0?"The opening failed. You can start the conversation now.":""),lt("")}catch(u){lt(B(u,"The visit could not continue. Retry or leave the venue."))}finally{st(!1)}},[]),ql=(0,m.useCallback)(async(l,u,p="",N)=>{kn.current=!1,Lt.current=null,He(null),Ke(!1),Yn(null),Sn(""),Co(!1),lt(""),Ii(""),Ha([]),Ua.current.clear(),st(!0),qe({version:1,id:"",placeId:l.id,placeName:l.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Ia(!0),ae("room");try{let{session:z}=await D("/rooms",{method:"POST",body:JSON.stringify({venueId:l.id,spaceClass:u,privateOwnerId:p,entryArea:N}),signal:AbortSignal.timeout(2e4)});qe(z),Rl("chat"),cd(""),wg(""),To(""),Ia(!0),Ce(),z.status==="opening"&&await bd(z.id)}catch(z){lt(B(z,"That room could not be opened. Retry or leave the venue."))}finally{st(!1)}},[bd,Ce]),Rg=(0,m.useCallback)(l=>{Ke(!1),He(l.id),ae("home")},[]),Mg=(0,m.useCallback)(()=>{V(null),Nt("view"),rt("exterior"),Se(null),me(null),He(null),ae("home")},[]),o$=(0,m.useCallback)(async()=>{P(!0),W("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:S,playerPersonaId:Z,setting:wn,selectedLorebookIds:$n,loreTokenBudget:Gu})}))}catch(l){W(B(l,"Those settings could not be saved."))}finally{P(!1)}},[S,$n,Gu,Z,wn]),r$=(0,m.useCallback)(async l=>{P(!0),W("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({storyPace:l})}))}catch(u){W(B(u,"That could not be saved."))}finally{P(!1)}},[]),s$=(0,m.useCallback)(async l=>{let u=i?.settings.characterSpeechColors??!0;o(p=>p&&{...p,settings:{...p.settings,characterSpeechColors:l}}),P(!0),W("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:l})}))}catch(p){o(N=>N&&{...N,settings:{...N.settings,characterSpeechColors:u}}),W(B(p,"Character speech colors could not be saved."))}finally{P(!1)}},[i?.settings.characterSpeechColors]),Og=(0,m.useCallback)(async l=>{P(!0),W("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:l})})),F(u=>u+1)}catch(u){W(B(u,"Visit retention could not be saved."))}finally{P(!1)}},[]),l$=(0,m.useCallback)(async()=>{if(!(i&&jn(i.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){P(!0),W("");try{let l=await D("/bootstrap",{method:"POST"});wo(l.places.map(u=>({id:ul(),name:u.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(l){W(B(l,"The village did not suggest any places."))}finally{P(!1)}}},[i]),c$=(0,m.useCallback)(async()=>{if(Tt.trim().length===0){we("Describe what the village is like before generating its map.");return}Yr(!0),we("");try{let l=await D("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:$o===i?.settings.townMapLayoutPrompt?void 0:$o,negative:xo===i?.settings.townMapNegativePrompt?void 0:xo,setting:Tt,options:Nl,selectedLorebookIds:Va,scenarioImprint:i?.isFounded?{origin:"",worldFacts:Nn,openingConditions:[],visualCues:[]}:null})}),u=await _p(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");Pu(l.image),Fu("generate"),hg(nd),Wu(u),Vi("generate")}catch(l){we(B(l,"The village map could not be generated."))}finally{Yr(!1)}},[Va,xo,$o,Tt,Nl,nd,Nn,i?.isFounded,i?.settings.townMapLayoutPrompt,i?.settings.townMapNegativePrompt]),u$=(0,m.useCallback)(async()=>{we(""),P(!0);try{let l=await D("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:Tt,selectedLorebookIds:Va,loreTokenBudget:yo})});$l(l.names)}catch(l){we(B(l,"The village could not suggest names for the public venue."))}finally{P(!1)}},[Va,yo,Tt]),d$=(0,m.useCallback)(async l=>{if(!l||!i)return;we("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let p=N=>Math.round(N/1e5)/10;we(`That picture is ${p(l.size)} MB and a village map holds ${p(u)} MB. Choose a smaller copy.`);return}Yr(!0);try{let p=await dl(l),N=await _p(p);Pu(p),Fu("upload"),Wu(N),Vi("upload")}catch(p){we(B(p,"That picture could not be used as the village map."))}finally{Yr(!1)}},[i]),Vg=(0,m.useCallback)(async l=>{if(!l||!i)return;W("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let p=N=>Math.round(N/1e5)/10;W(`That picture is ${p(l.size)} MB and the village map holds ${p(u)} MB. Try a smaller copy.`);return}P(!0);try{let p=await dl(l),N=await _p(p);od({image:p,size:N}),Qr(Uu("cover"))}catch(p){W(B(p,"That picture could not be used as the town map."))}finally{P(!1)}},[i]),Dg=(0,m.useCallback)(async()=>{if(!i)return;let l=_a?_a.image:El;P(!0),W("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:l,townMapView:rd??i.settings.townMapView})})),Cl(l),od(null),Qr(null),sd(!1)}catch(u){W(B(u,"The town map could not be saved."))}finally{P(!1)}},[i,rd,El,_a]),Bl=(0,m.useCallback)(()=>{od(null),Qr(null),sd(!1),W("")},[]),_g=(0,m.useCallback)(async()=>{P(!0),W("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),Cl(""),Bl()}catch(l){W(B(l,"The town map could not be taken down."))}finally{P(!1)}},[Bl]),h$=(0,m.useCallback)(async(l,u,p="")=>{if(!Pa){No(l),Yn(null),W("");try{o(await D("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:p})}))}catch(N){Yn({id:l,text:B(N,"That place could not be drawn.")})}finally{No("")}}},[Pa]),m$=(0,m.useCallback)(async(l,u,p,N="")=>{if(!(!u||!i||Pa)){No(l),Yn(null),W("");try{let z=X=>Math.round(X/1e5)/10;if(u.size>i.settings.maxVenueImageBytes){Yn({id:l,text:`That picture is ${z(u.size)} MB and a place holds ${z(i.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let _=await dl(u);o(await D("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:l,image:_,spaceClass:p,privateOwnerId:N})}))}catch(z){Yn({id:l,text:B(z,"That picture could not be kept.")})}finally{No("")}}},[Pa,i]),p$=(0,m.useCallback)(async(l,u,p="")=>{if(!Pa){No(l),Yn(null),W("");try{o(await D("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:p})}))}catch(N){Yn({id:l,text:B(N,"That picture could not be taken away.")})}finally{No("")}}},[Pa]),g$=i?.settings.maxPlaces??48,Ro=i?.settings.setupMaxVillagerCount??Op,Ig=(i?.settings.homeBuildings??[]).map(l=>({...l,name:i?.settings.homeBuildingNames?.[l.kind]??l.name})),f$=i&&!i.isFounded?1+Ro:g$,Ll=Math.max(0,f$-jn(i?.settings.venues??[]).length),b$=(i?.settings.venues.length??0)+gl.filter(l=>!i?.settings.venues.some(u=>u.id===l.id)).length,ns=(0,m.useCallback)(l=>{let u=Gp(l);fl(u.map(p=>({id:p.id,name:p.name,form:p.form??"Home",description:p.description,x:p.presentation.x,y:p.presentation.y,building:p.occupancy.homeKind,isPlayerHome:p.occupancy.playerHome,characterId:p.occupancy.residentCharacterId}))),Xu(u[0]?.id??null),Kt(!1)},[]),Hg=(0,m.useCallback)(()=>{W(""),i&&ns(i.settings.venues),Qa("village"),ne("homes"),ae("menu")},[ns,i]),Ug=(0,m.useCallback)((l,u)=>{if(W(""),va.length>=Ll||va.length>=1+Ro)return;let p=ul(),N=va.length===0;fl(z=>[...z,{id:p,name:N?"Your residence":`Residence ${z.length+1}`,form:"Home",description:"",x:l,y:u,building:null,isPlayerHome:N,characterId:null}]),Xu(p)},[va.length,Ll,Ro]),v$=(0,m.useCallback)((l,u,p)=>{let N=Je.find(_=>_.category==="public-center"),z=Ku??(bl?N?.id:void 0);if(M0({x:l,y:u},Je.filter(_=>_.id!==z).map(_=>_.presentation),p??{width:1e3,height:700,photoWidth:58,photoHeight:58})){Ju("That photograph would cover another venue. Place it a little to the side.");return}if(Ju(""),z)Mi(_=>_.map(X=>X.id===z?{...X,presentation:{...X.presentation,x:l,y:u}}:X)),Da(z);else if(bl){let _=j0(ul(),"gathering",l,u);Mi(X=>[...X,_]),Da(_.id)}else if(Ai){let _=Je.filter($e=>$e.classes?.includes("residence"));if(_.length>=1+Ro)return;let X=j0(ul(),"residence",l,u,_.length===0,_.length+1);Mi($e=>[...$e,X]),Da(X.id)}Oi(null),Kt(!1),Ri(!1)},[Ku,Ai,bl,Ro,Je]),Hi=(0,m.useCallback)((l,u)=>{Mi(p=>p.map(N=>N.id===l?u(N):N))},[]),y$=(0,m.useCallback)(l=>{Mi(u=>{let p=u.filter(N=>N.id!==l);if(!p.some(N=>N.occupancy.playerHome)){let N=p.findIndex(z=>z.classes?.includes("residence"));N>=0&&(p[N]={...p[N],occupancy:{...p[N].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return p}),Da(u=>u===l?null:u)},[]),w$=(0,m.useCallback)((l,u)=>{Ug(l,u),Kt(!1),ae("menu")},[Ug]),qg=(0,m.useCallback)((l,u)=>{i?.settings.venues.some(p=>p.id===l&&p.occupancy.residentCharacterId)||fl(p=>p.map(N=>N.id===l?{...N,...u}:N))},[i]),$$=(0,m.useCallback)(l=>{if(i?.settings.venues.some(u=>u.id===l&&u.occupancy.residentCharacterId)){W("Move the resident to another venue before removing this home.");return}fl(u=>{let p=u.filter(N=>N.id!==l);return p.length>0&&!p.some(N=>N.isPlayerHome)&&(p[0]={...p[0],isPlayerHome:!0,characterId:null}),p})},[i]),x$=(0,m.useCallback)(async()=>{if(i){if(va.some(l=>!l.description.trim())){W("Review a description for every home before saving.");return}P(!0),W("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({venues:WS(i.settings.venues,va),venueScope:"homes"})})),Kt(!1)}catch(l){W(B(l,"Those homes could not be saved."))}finally{P(!1)}}},[va,i]),N$=async l=>{if(!i)return;let u=i.villagers.find(N=>N.characterId===l.characterId)?.name,p=l.isPlayerHome?`${po(i)}'s home`:u?`${u}'s home`:W0(Ig,l.building).name;P(!0),W("");try{let N=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:p,homeKind:l.building}]})});qg(l.id,{description:N.descriptions[l.id]??""})}catch(N){W(B(N,"The home description could not be generated. You can write it by hand."))}finally{P(!1)}},S$=l=>{if(i?.isFounded||l===xn)return;let u=go(xn).premise,p=!!ya.trim()&&ya!==u;og(l),p||Qu(go(l).premise),rg(""),we("")},is=(0,m.useCallback)((l,u)=>{W(""),we(""),gg(!1),Xr(!1),Tl(!1),ee(!1),ml(""),wl(0),ng(l?"":u?.village.name??""),ig(l?"":u?.village.setting??"");let p=l?"":u?.settings.foundingReason??"",N=Bp.some(Oo=>Oo.value===p),z=N?p:p?"custom":"rebuild",_=OS[p]??p,X=u?.settings.foundingDetails??"",$e=[_,X].filter(Boolean).join(" "),wa=$e.length>(u?.settings.foundingDetailsMaxLength??500),Mo=u?.isFounded?X:p&&!N?wa?X:$e:l||!p?go(z).premise:X,$d=l?"":u?.isFounded?u.settings.foundingGuidance??"":[wa?_:"",u?.settings.foundingGuidance??""].filter(Boolean).join(" ");og(z),Qu(Mo),rg(z==="none"?"":$d),S1(l?Mp():u?.settings.scenarioImprint??Mp()),sg(l?[]:u?.settings.worldFacts??[]),$l([]);let $a=l||!u?[]:u.settings.venues.filter(Oo=>Oo.classes?.includes("residence")||Oo.category==="public-center");Mi($a),Da($a[0]?.id??null),Oi(null),Gn(null),Ju(""),Kp(l?[]:u?.settings.selectedLorebookIds??[]),Jp(l?1600:u?.settings.loreTokenBudget??1600),dg({...B0}),Vi(l?"generate":u?.settings.townMapImageSetAt?"existing":"none"),Pu(""),Fu(null),hg(""),Wu(null),ed(u?.settings.townMapLayoutPrompt??""),td(u?.settings.townMapNegativePrompt??""),Yr(!1),kt(l?"":u?.settings.playerPersonaId??""),zo(),Ao(),ns(l||!u?[]:u.settings.venues),ae("setup")},[Ao,zo,ns]),Bg=(0,m.useCallback)(l=>{if(De===0&&l>0){if(Ka.trim().length===0){we("Give the village a name before continuing.");return}if(Tt.trim().length===0){we("Describe what the village is like before continuing.");return}if(!i?.isFounded&&!ya.trim()){we("Describe the village's first day before continuing.");return}}if(De===1&&l>1){if(!Z.trim()){we("Choose the Persona who lives in this village.");return}if(!Vt?.some(u=>u.id===Z)){we("That Persona is no longer in your library. Choose another one to continue.");return}if(id.length>0){we(id);return}if(pg){Xr(!0);return}}if(De===2&&l>2&&_e!=="none"&&!Di){we(_e==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(De===3&&l>3){let u=Je.filter(X=>X.classes?.includes("residence")),p=u.filter(X=>!X.occupancy.playerHome),N=p.length;if(!u.some(X=>X.occupancy.playerHome)||N<L0||N>Op||!Je.some(X=>X.category==="public-center")){we("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let z=p.map(X=>X.occupancy.residentCharacterId).filter(Boolean);if(z.length!==p.length||new Set(z).size!==z.length){we("Assign a different villager to each villager Residence before review.");return}let _=Je.map(X=>({venue:X,field:X.name.trim()?X.form?.trim()?X.description.trim()?X.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:X})=>X);if(_){Da(_.venue.id),we(`Complete ${_.field.replaceAll("-"," ")} for ${_.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${_.field}`)?.focus(),0);return}}Xr(!1),we(""),wl(l),l===1&&zo(),l===0&&Ao(),l===3&&Fa(),Kt(!1),Ri(!1),Oi(null)},[id,Je,pg,Fa,zo,Ao,Z,Vt,_e,Di,Ka,ya,i?.isFounded,Tt,De,e]),k$=(0,m.useCallback)(()=>{Xr(!1),we(""),wl(2),Kt(!1),Ri(!1)},[]),T$=(0,m.useCallback)(()=>{Xr(!1),we("")},[]),xe=Je.find(l=>l.id===Br)??null,os=xe?.classes?.includes("gathering")?"gathering":"residence";(0,m.useEffect)(()=>{lg(0),Zu(!1)},[Br,os]),(0,m.useEffect)(()=>{if(!Br||xe?.form?.trim()||cg)return;let l=window.setInterval(()=>lg(u=>(u+1)%5),4e3);return()=>window.clearInterval(l)},[Br,xe?.form,cg]);let vd=xe?$t(xe,xe.category==="public-center"?"gathering":"residence"):null,E$=l=>({id:l.id,name:l.name,form:l.form??"",description:l.description,spaceDescription:l.spaces?.[0]?.description??"",venueClass:l.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:l.occupancy.residentCharacterId??""}),C$=async(l,u)=>{if(Ja)return;if(!(u==="exterior"?l.description:l.spaces?.[0]?.description??"").trim()){Da(l.id),we(`Add an ${u} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${u}-description`)?.focus(),0);return}let N=Gr;xl(!0),we("");try{let z=await D("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:E$(l),area:u,villageName:Ka,setting:Tt,foundingDetails:ya,scenarioImprint:i?.isFounded?N1:null,worldFacts:i?.isFounded?Nn:[],selectedLorebookIds:Va})});ad.current===N&&Gn({venueId:l.id,area:u,image:z})}catch(z){we(B(z,"Venue art could not be generated."))}finally{xl(!1)}},z$=async(l,u,p)=>{if(!(!p||Ja)){if(p.size>(i?.settings.maxVenueImageBytes??8e6)){we("That venue image is too large. Choose a smaller file.");return}xl(!0),we("");try{let N=await D("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:l.name,image:await dl(p)})});Gn({venueId:l.id,area:u,image:N})}catch(N){we(B(N,"That venue image could not be uploaded."))}finally{xl(!1)}}},A$=()=>{if(!Lr)return;let{venueId:l,area:u,image:p}=Lr;Hi(l,N=>u==="exterior"?{...N,presentation:{...N.presentation,image:p}}:{...N,spaces:[{...$t(N,N.classes?.includes("gathering")?"gathering":"residence"),image:p}]}),Gn(null)},Lg=(0,m.useCallback)(()=>{if(Ka.trim().length===0)return"Give the village a name.";if(Z.trim().length===0)return"Choose the Persona who lives in this village.";if(!i?.isFounded&&!ya.trim())return"Describe the village's first day.";let l=Nn.map(z=>z.trim()).filter(Boolean);if(i?.isFounded&&(l.length>4||l.some(z=>z.length>160)))return"Use at most four current world facts of 160 characters each.";if(Tt.trim().length===0)return"Describe what the village is like.";if(_e!=="none"&&!Di)return"Choose, generate, or upload the village map.";let u=Je.filter(z=>z.classes?.includes("residence")),p=u.filter(z=>!z.occupancy.playerHome);if(p.length<L0||p.length>Op)return"Place one to three homes for initial villagers.";if(!u.some(z=>z.occupancy.playerHome))return"One Residence has to be yours.";if(Je.some(z=>!z.name.trim()||!z.form?.trim()||!z.description.trim()||!z.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let N=p.map(z=>z.occupancy.residentCharacterId).filter(z=>z!==null);return N.length!==p.length?"Choose who lives in each villager home.":new Set(N).size!==N.length?"A villager can only live in one house.":Je.filter(z=>z.category==="public-center").length!==1?"Place one Gathering Place.":""},[Je,Z,_e,Di,Ka,ya,i?.isFounded,Nn,Tt]),R$=(0,m.useCallback)(async()=>{let l=Lg();if(l){let u=Je.find(p=>!p.name.trim()||!p.form?.trim()||!p.description.trim()||!p.spaces?.[0]?.description.trim());if(u){let p=u.name.trim()?u.form?.trim()?u.description.trim()?"interior-description":"exterior-description":"form":"venue-name";Da(u.id),wl(3),window.setTimeout(()=>e.querySelector(`#${n}-setup-${p}`)?.focus(),0)}we(l);return}P(!0),we("");try{let u=await D("/setup",{method:"POST",body:JSON.stringify({name:Ka.trim(),setting:Tt.trim(),foundingReason:i?.isFounded?i.settings.foundingReason:xn,foundingDetails:i?.isFounded?i.settings.foundingDetails:ya.trim(),foundingGuidance:i?.isFounded?i.settings.foundingGuidance:qr.trim(),scenarioImprint:i?.isFounded?i.settings.scenarioImprint:null,worldFacts:i?.isFounded?Nn.map(p=>p.trim()).filter(Boolean):[],selectedLorebookIds:Va,loreTokenBudget:yo,playerPersonaId:Z,townMapImage:Di??"",townMapView:_e==="existing"?So:Uu("cover"),venues:Je})});o(u),Kt(!1),ae(!i?.isFounded||u.foundingPreparation?.status==="pending"||u.foundingPreparation?.status==="failed"?"preparing":"home")}catch(u){we(B(u,"The village could not be founded."))}finally{P(!1)}},[e,Je,i?.isFounded,i?.settings.foundingReason,i?.settings.foundingDetails,i?.settings.foundingGuidance,i?.settings.scenarioImprint,Z,So,Lg,_e,Di,Ka,xn,ya,qr,Nn,Va,yo,Tt]),M$=(0,m.useCallback)(async()=>{P(!0),W("");try{let l=await D("/setup/reset",{method:"POST"});o(l),c(null),is(!0,l)}catch(l){W(B(l,"The village could not be reset."))}finally{P(!1),Tl(!1)}},[is]),jg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!i||jg.current||(jg.current=!0,i.isFounded?i.foundingPreparation&&i.foundingPreparation.status!=="ready"&&ae("preparing"):is(!1,i))},[is,i]),(0,m.useEffect)(()=>{if(G!=="preparing")return;let l=!1,u=async()=>{try{let N=await D("/setup/preparation");if(l)return;o(N),kl(""),(!N.foundingPreparation||N.foundingPreparation.status==="ready")&&ae("home")}catch(N){l||kl(B(N,"Preparation status could not be read."))}};u();let p=window.setInterval(()=>{u()},2500);return()=>{l=!0,window.clearInterval(p)}},[G]);let O$=(0,m.useCallback)(async()=>{kl("");try{o(await D("/setup/preparation/retry",{method:"POST"}))}catch(l){kl(B(l,"Preparation could not be retried."))}},[]),V$=(0,m.useCallback)(()=>{Se({id:ul(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),D$=(0,m.useCallback)(async l=>{P(!0),W("");try{let u=i?.settings.venues.some(_=>_.id===l.id)??!1,p=fn(l).map(_=>$t(l,_)),N=await D(u?`/locations/venue/${encodeURIComponent(l.id)}`:"/projects",{method:u?"PUT":"POST",body:JSON.stringify(u?{name:l.name,description:p[0]?.description??l.description}:{name:l.name,classes:l.classes,description:p[0]?.description??l.description})}),z=jn(N.settings.venues).find(_=>u?_.id===l.id:_.name.toLowerCase()===l.name.trim().toLowerCase());o(N),Se(null),u||et("projects"),wo(_=>{let X=_.map($e=>$e.id===l.id&&z?z:$e);return[...X,...jn(N.settings.venues).filter($e=>!X.some(wa=>wa.id===$e.id))]})}catch(u){W(B(u,"That place could not be saved."))}finally{P(!1)}},[i,et]),_$=(0,m.useCallback)(async l=>{let u=i?.settings.venues.find(p=>p.id===l);if(!u){wo(p=>p.filter(N=>N.id!==l));return}P(!0),W("");try{let p=await D(`/locations/venue/${encodeURIComponent(l)}/dependencies`);if(p.roomPresent||p.playerHome||p.residentCharacterIds.length||p.pendingMailCount){W(p.roomPresent?"End the active visit before deleting this Venue.":p.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let N=p.residentCharacterIds.length+p.pendingResidenceCharacterIds.length,z=N||p.workerCharacterIds.length||p.remapCount||p.eventCount?`This place is referenced by ${N} pending moves, ${p.workerCharacterIds.length} workers, ${p.remapCount} schedule moves, and ${p.eventCount} events. Delete it?`:`Delete ${u.name}?`;if(!window.confirm(z))return;let _=await D(`/locations/venue/${encodeURIComponent(l)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(_),wo(X=>X.filter($e=>$e.id!==l))}catch(p){W(B(p,"That place could not be removed."))}finally{P(!1)}},[i]),Gg=(0,m.useCallback)(async(l,u)=>{P(!0),W("");try{let p=vn[l.id]??l.venueDraft,N=await D(`/venue-requests/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST",body:u?JSON.stringify(p):void 0});if(o(N),u){let z=new Set(gl.map(_=>_.id));wo(_=>[..._,...jn(N.settings.venues).filter(X=>!z.has(X.id))])}Ti(z=>{let _={...z};return delete _[l.id],_})}catch(p){W(B(p,u?"That venue could not be approved.":"That request could not be denied."))}finally{P(!1)}},[vn,gl]),I$=(0,m.useCallback)(l=>{let u=md.current,p=u?.selectionStart??S.length,N=u?.selectionEnd??p;pd.current=p+l.length,ce(`${S.slice(0,p)}${l}${S.slice(N)}`)},[S]),Yg=(0,m.useCallback)(async()=>{let l=yl.trim();if(l.length!==0){P(!0),W("");try{o(await D("/noticeboard",{method:"POST",body:JSON.stringify({notice:l})})),ag("")}catch(u){W(B(u,"That notice could not be pinned up."))}finally{P(!1)}}},[yl]),H$=(0,m.useCallback)(async l=>{P(!0),W("");try{o(await D(`/noticeboard/${l}`,{method:"DELETE"}))}catch(u){W(B(u,"That notice could not be taken down."))}finally{P(!1)}},[]),jl=hl.trim().toLowerCase(),yd=(s??[]).filter(l=>jl.length===0||l.name.toLowerCase().includes(jl)||l.comment.toLowerCase().includes(jl)||l.tags.some(u=>u.toLowerCase().includes(jl))),Xg=[...(i?.villagers??[]).map(l=>l.characterId),...Ee?yd.map(l=>l.id):[]].join(`
`),Qg=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let l=Xg.split(`
`).filter(p=>p.length>0&&!Qg.current.has(p));if(l.length===0)return;for(let p of l)Qg.current.add(p);let u=new AbortController;return(async()=>{try{let p=await QS(l,u.signal);u.signal.aborted||oa(N=>({...N,...p}))}catch{}})(),()=>u.abort()},[Xg]);let wd=i?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(Ur(null),wd.length===0)return;let l=new AbortController;return(async()=>{try{let u=await ZS(wd,l.signal);l.signal.aborted||Ur(u)}catch{}})(),()=>l.abort()},[wd]);let ra=(0,m.useCallback)(l=>l?s?.find(u=>u.id===l)?.name??i?.villagers.find(u=>u.characterId===l)?.name??"":"",[s,i]),U$=(()=>{let l=i?.settings.venues??[],u=[],p=new Map;for(let N of i?.villagers??[]){let z=N.place?.id;if(!z)continue;let _=p.get(z);_?_.push(N):p.set(z,[N])}for(let N of l){let z=Hu(N);if(!z)continue;let _=N.occupancy.residentCharacterId,X=_r(N),$e=N.occupancy.playerHome?po(i):ra(_);u.push({id:N.id,x:z.x,y:z.y,text:X?c2($e):N.name,image:N.presentation.image?.url??null,tone:X?e1({isPlayerHome:N.occupancy.playerHome,occupant:_}):"venue",selected:je===N.id,doors:je===N.id?[{label:"View venue",onSelect:()=>Ul(N)},{label:"Visit",onSelect:()=>{ql(N)}}]:void 0,onSelect:()=>Rg(N)}),(p.get(N.id)??[]).forEach((wa,Mo)=>{u.push({id:`villager:${wa.characterId}`,x:z.x,y:z.y,dy:d2*(Mo+1),text:wa.name,tone:"resident",kind:"person"})})}return u})(),q$=Je.flatMap(l=>{let u=Hu(l);return u?[{id:l.id,x:u.x,y:u.y,text:l.name||(l.category==="public-center"?"Gathering Place":"Residence"),image:l.presentation.image?.url??null,tone:l.category==="public-center"?"venue":l.occupancy.playerHome?"player":"resident",onSelect:()=>Da(l.id)}]:[]});if(G==="room")return(0,r.jsxs)("div",{className:`${n}-root ${n}-room-screen`,"data-mobile":t?"true":"false",children:[q?(0,r.jsx)(T2,{room:q,nameColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.nameColor])):{},speechColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.dialogueColor])):{},picture:LS(i?.settings.venues??[],q),draft:Pr,mode:Fr,targetId:Wr,busy:qa,error:U1,greetingNotice:q1,ruling:_1,open:D1,ended:Eo,playerName:po(i),playerPortrait:bo??void 0,portraits:Hr,sprites:Object.fromEntries((i?.villagers??[]).map(l=>[l.characterId,l.sprite])),onDraft:l=>{_i.current=null,ts.current=null,Sn(l)},onMode:l=>{_i.current=null,Rl(l)},onTarget:l=>{_i.current=null,cd(l)},onSend:()=>{Fr==="conclude"?W1():a$()},onViewVenue:()=>{V(q.placeId),Se(null),ae("venue"),Ce()},onEnterPrivate:q.area==="shared"&&q.privateAccessOwnerId?()=>{st(!0),D("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:q.id,ownerId:q.privateAccessOwnerId})}).then(({session:l})=>{qe(l),Ce()}).catch(l=>lt(B(l,"That private space could not be entered."))).finally(()=>st(!1))}:void 0,privateSpaceOwnerName:ra(q.privateAccessOwnerId),onEnd:()=>{F1()},notices:I1,onDismissNotice:l=>Ha(u=>u.filter(p=>p.id!==l)),debugDiscardEnabled:ud,onDebugDiscard:()=>{t$()},onLeavePending:()=>{e$()},endFailed:be,reviewing:es===q.id,onRetryGreeting:()=>{if(q.id)bd(q.id);else{let l=i?.settings.venues.find(u=>u.id===q.placeId);l&&ql(l)}},onContinueWithoutGreeting:()=>{q.id&&i$(q.id)},onUseMailbox:i?.settings.venues.some(l=>l.id===q.placeId&&l.occupancy.playerHome&&(!q.spaceClass||q.spaceClass==="residence"))?()=>Jr(!0):void 0,onProjects:()=>et("projects")}):(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:fd,children:"Back to village"}),V1&&i?(0,r.jsx)("div",{className:`${n}-mailbox-backdrop`,onClick:()=>Jr(!1),children:(0,r.jsxs)("section",{className:`${n}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:l=>l.stopPropagation(),children:[(0,r.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Mailbox"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Jr(!1),children:"Close"})]}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,r.jsxs)("div",{className:`${n}-mailbox-list`,children:[[...i.venueMail??[]].reverse().map(l=>(0,r.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,r.jsx)("strong",{children:l.title}),(0,r.jsx)("p",{children:l.detail}),(0,r.jsx)("p",{className:`${n}-hint`,children:l.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(l.dueAt).toLocaleString()}`:l.status==="pending-player"?"Awaiting your decision":l.status==="approved"?"Approved":"Declined"}),l.decisions.map(u=>(0,r.jsxs)("p",{children:[(0,r.jsxs)("strong",{children:[ra(u.characterId),":"]})," ",u.reply]},u.characterId)),l.status==="pending-player"&&l.kind==="villager-change"?(0,r.jsx)(k2,{entry:l,onDecide:async(u,p)=>{o(await D(`/venue-mail/${encodeURIComponent(l.id)}/decision`,{method:"POST",body:JSON.stringify({approved:u,...p})}))}}):null,l.error?(0,r.jsxs)("p",{className:`${n}-hint`,children:["Reply delayed: ",l.error]}):null]},l.id)),(i.venueMail?.length??0)===0&&i.venueRequests.length===0&&i.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"No Venue mail yet."}):null,i.venueRequests.map(l=>(0,r.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[l.requesterName||"A villager"," suggests ",l.venueDraft.name]}),(0,r.jsx)("p",{children:l.venueDraft.classes.map(u=>u[0].toUpperCase()+u.slice(1)).join(" / ")}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Jr(!1),et("venueRequests")},children:"Review request"})]},l.id)),i.upgradeRequests.map(l=>(0,r.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[l.requesterName," suggests a home change"]}),(0,r.jsx)("p",{children:l.detail}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Jr(!1),et("venueRequests")},children:"Review request"})]},l.id))]})]})}):null]});if(G==="venue"){let l=(i?.settings.venues??[]).find(T=>T.id===Zt)??null;if(!i||!l)return(0,r.jsx)("div",{className:`${n}-root`,children:(0,r.jsxs)("header",{className:`${n}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${n}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${n}-subtitle`,children:"This venue is no longer in the village."})]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:Mg,children:"Back to map"})]})});let u=n$(l.id),p=fn(l),N=l.occupancy.homeKind?W0(Ig,l.occupancy.homeKind).name:"",z=l.occupancy.playerHome?po(i):ra(l.occupancy.residentCharacterId),_=l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[]),X=p.includes("residence")&&_.length>0,$e=q?.placeId===l.id&&(q.area==="shared"||q.area==="private"),wa=q?.placeId===l.id&&q.area==="private"?q.privateOwnerId:"",Mo=l.occupancy.playerHome||l.playerSeenShared||$e,$d=(l.privateSpaces??[]).filter(T=>l.playerSeenPrivateIds?.includes(T.ownerId)||T.ownerId===wa),$a=q?.status!=="closed"&&q?.id?q:null,Oo=(l.playerInvitations??[]).some(T=>_.includes(T.residentId)),xd=[{key:"exterior",label:"Exterior",subtitle:"Outside the building",area:"outside",spaceClass:p[0],ownerId:"",image:l.presentation.image,description:l.form||N||`The outside of ${l.name}.`,state:l.exteriorState,locked:!1,canEnter:!0,accessLabel:"Open (no restrictions)"},...p.map(T=>{let ue=$t(l,T),K=T==="residence",re=K?!Mo:!l.playerSeenPublic&&!($a?.placeId===l.id&&$a.area==="public"),Ge=!K||!X||l.occupancy.playerHome||Oo;return{key:`class:${T}`,label:p.length===1?"Interior":`${T[0].toUpperCase()}${T.slice(1)} interior`,subtitle:K?"Shared living space":`${T[0].toUpperCase()}${T.slice(1)} space`,area:K?"shared":"public",spaceClass:T,ownerId:"",image:re?null:ue.image,description:re?"":ue.description,state:re?void 0:ue.state,locked:re,canEnter:Ge,accessLabel:Ge?"Open to visit":"Resident invitation required"}}),...(l.privateSpaces??[]).filter(T=>_.includes(T.ownerId)).map(T=>{let ue=ra(T.ownerId),K=!l.playerSeenPrivateIds?.includes(T.ownerId)&&T.ownerId!==wa,re=(l.playerInvitations??[]).some(Ge=>Ge.scope==="private"&&Ge.ownerId===T.ownerId&&Ge.residentId===T.ownerId);return{key:`private:${T.ownerId}`,label:`${ue}'s Private Space`,subtitle:"Restricted area",area:"private",spaceClass:"residence",ownerId:T.ownerId,image:K?null:T.image,description:K?"":T.description,state:K?void 0:T.state,locked:K,canEnter:re,accessLabel:re?"Owner's invitation available":"Owner's invitation required",adaptationPending:!K&&T.adaptationPending}})],oe=xd.find(T=>T.key===We)??xd[0],Zg=(l.editProposals??[]).filter(T=>oe.area==="shared"?T.target==="shared":oe.area==="private"&&T.target==="private"&&T.ownerId===oe.ownerId),Nd=oe.description&&oe.description!==l.form&&oe.description!==N?oe.description:"",B$=!oe.locked&&!!(Nd||oe.adaptationPending||oe.state?.condition||oe.state?.items.length||oe.state?.publicFacts.length||oe.state?.features.length||oe.area==="outside"&&i.village.setting||Zg.length),Gl=$a?.placeId===l.id&&$a.area===oe.area&&(oe.area==="outside"||$a.spaceClass===oe.spaceClass)&&(oe.area!=="private"||$a.privateOwnerId===oe.ownerId),Sd=(T,ue,K,re="")=>(0,r.jsxs)("section",{className:`${n}-venue-card`,children:[(0,r.jsx)("h3",{className:`${n}-panel-title`,children:T}),ue?(0,r.jsx)("img",{className:`${n}-venue-space-picture`,src:ue.url,alt:`${T} at ${l.name}`}):(0,r.jsx)("div",{className:`${n}-venue-image-empty`,children:"No image yet"}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!Pa||I,onClick:()=>{h$(l.id,K,re)},children:ue?"Redraw image":"Draw image"}),(0,r.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*","aria-label":`Upload ${T.toLowerCase()} image`,disabled:!!Pa||I,onChange:Ge=>{let rs=Ge.target.files?.[0];Ge.target.value="",m$(l.id,rs,K,re)}}),ue?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!Pa||I,onClick:()=>{p$(l.id,K,re)},children:"Remove image"}):null]})]},re||K||"exterior"),Vo=T=>({name:T.name,form:T.form,workerIds:T.workerIds,position:{x:T.presentation.x,y:T.presentation.y},spaces:p.map(ue=>{let K=$t(T,ue);return{description:K.description,condition:K.state.condition,items:K.state.items,publicFacts:K.state.publicFacts,features:K.state.features.map(({id:re,text:Ge,locked:rs})=>({id:re,text:Ge,locked:rs}))}}),privateSpaces:T.privateSpaces?.map(ue=>({ownerId:ue.ownerId,description:ue.description,condition:ue.state.condition,items:ue.state.items,publicFacts:ue.state.publicFacts,features:ue.state.features.map(({id:K,text:re,locked:Ge})=>({id:K,text:re,locked:Ge}))}))}),L$=!!(he&&JSON.stringify(Vo(he))!==JSON.stringify(Vo(l))),j$=!!(ie&&(JSON.stringify(ie.classes)!==JSON.stringify(p)||ie.capacity!==(l.residenceCapacity??1)||ie.slot!==0||ie.title||ie.description||ie.extraBeds)),G$=()=>{(Q==="edit"&&L$||Q==="proposal"&&j$)&&!window.confirm("Discard your unsaved changes?")||(Nt("view"),Se(null),me(null),ft(""),A(""))},Kg=(T,ue)=>{o(T);let K=T.settings.venues.find(re=>re.id===l.id);K&&Se(structuredClone(K)),A(ue)},Y$=async()=>{if(he){if(he.form!==l.form||JSON.stringify(he.classes)!==JSON.stringify(l.classes)||JSON.stringify(he.workerIds??[])!==JSON.stringify(l.workerIds??[])||JSON.stringify(he.state)!==JSON.stringify(l.state)||he.presentation.x!==l.presentation.x||he.presentation.y!==l.presentation.y){ft("Physical edits and map moves need an earned route. Edit only the name or description here.");return}if(X){let T=Vo(he),ue=Vo(l),K=p.indexOf("residence");if((K>=0&&JSON.stringify(T.spaces[K])!==JSON.stringify(ue.spaces[K])||JSON.stringify(T.privateSpaces)!==JSON.stringify(ue.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}Ut(!0),ft(""),A("");try{let T=await D(`/locations/venue/${encodeURIComponent(l.id)}`,{method:"PUT",body:JSON.stringify({name:he.name,description:he.description})});Kg(T,"Venue details saved.")}catch(T){ft(B(T,"The Venue could not be saved."))}finally{Ut(!1)}}},Jg=async(T,ue="")=>{if(!he)return;let K=T==="private"?he.privateSpaces?.find(Ge=>Ge.ownerId===ue):$t(he,"residence");if(!K)return;let re=structuredClone(he);if(T==="shared"?re.spaces=re.spaces?.map(Ge=>Ge.venueClass==="residence"?$t(l,"residence"):Ge):re.privateSpaces=re.privateSpaces?.map(Ge=>Ge.ownerId===ue?l.privateSpaces?.find(rs=>rs.ownerId===ue)??Ge:Ge),!(JSON.stringify(Vo(re))!==JSON.stringify(Vo(l))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){Ut(!0),ft(""),A("");try{let Ge=await D(`/locations/venue/${encodeURIComponent(l.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:T,ownerId:ue,description:K.description,state:K.state})});Kg(Ge,`${T==="private"?"Private":"Shared"} room edit proposed.`)}catch(Ge){ft(B(Ge,"That room edit could not be proposed."))}finally{Ut(!1)}}},Pg=u2(l,z);return(0,r.jsxs)("div",{className:`${n}-root`,"data-venue-view":Q==="view"?"true":void 0,children:[(0,r.jsxs)("header",{className:`${n}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${n}-title`,children:Q==="view"?Pg:`${Q==="edit"?"Edit Venue":"Propose Change"} \xB7 ${Pg}`}),(0,r.jsx)("p",{className:`${n}-subtitle`,children:Q==="view"?l.form||N||(u.length===0?"Nobody is here right now":`Villagers here: ${u.map(T=>T.name).join(", ")}`):Q==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,r.jsxs)("div",{className:`${n}-venue-header-controls`,children:[(0,r.jsx)("div",{className:`${n}-actions`,children:Q==="view"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Se(structuredClone(l)),ft(""),A(""),Nt("edit")},children:"Edit Venue"}),p.includes("residence")&&!l.occupancy.playerHome?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{ft(""),D(`/locations/venue/${encodeURIComponent(l.id)}/player-move`,{method:"POST"}).then(o).catch(T=>ft(B(T,"The move could not be requested.")))},children:"Request to live here"}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{me({classes:p,capacity:l.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),ft(""),A(""),Nt("proposal")},children:"Propose Change"}),$a?.placeId===l.id?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>ae("room"),children:"Return to scene"}):null]}):(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:G$,children:Q==="edit"?"Close Editor":"Exit Change Proposal"})}),Q==="view"&&Ma?(0,r.jsx)("p",{className:`${n}-venue-move-error`,role:"alert",children:Ma}):null]})]}),Q==="view"?(0,r.jsxs)("main",{className:n+"-venue-page","aria-label":"View Venue",children:[(0,r.jsxs)("nav",{className:n+"-venue-zones","aria-label":"Venue zones",children:[(0,r.jsx)("button",{type:"button",className:n+"-venue-back",onClick:Mg,children:"\u2190 Back to map"}),xd.map(T=>(0,r.jsxs)("button",{type:"button",className:n+"-venue-zone-tab","data-active":oe.key===T.key?"true":"false","aria-current":oe.key===T.key?"page":void 0,onClick:()=>rt(T.key),children:[(0,r.jsx)("span",{className:n+"-venue-zone-thumb",children:T.image&&!T.locked?(0,r.jsx)("img",{src:T.image.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:T.locked?"\u25C8":"\u2302"})}),(0,r.jsxs)("span",{className:n+"-venue-zone-copy",children:[(0,r.jsx)("strong",{children:T.label}),(0,r.jsx)("small",{children:T.subtitle})]})]},T.key))]}),(0,r.jsxs)("div",{className:n+"-venue-zone-content",children:[(0,r.jsx)("section",{className:n+"-venue-zone-main","aria-label":oe.label,children:(0,r.jsx)("div",{className:n+"-venue-artwork",children:oe.image&&!oe.locked?(0,r.jsx)("img",{src:oe.image.url,alt:oe.label+" at "+l.name}):(0,r.jsx)("div",{className:n+"-venue-artwork-empty",children:oe.locked?"Area not discovered yet":"No image for this area yet"})})}),(0,r.jsxs)("aside",{className:n+"-venue-zone-context",children:[(0,r.jsx)("span",{className:n+"-venue-kicker",children:"Zone"}),(0,r.jsx)("h2",{children:oe.label}),(0,r.jsx)("p",{children:oe.subtitle}),(0,r.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,r.jsx)("span",{children:"Occupancy"}),(0,r.jsx)("strong",{children:p.includes("residence")?ju(l)+" / "+K0(l)+" residents":u.length+" here now"})]}),(0,r.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,r.jsx)("span",{children:"Accessibility"}),(0,r.jsx)("strong",{children:oe.accessLabel})]}),B$?(0,r.jsxs)("details",{className:n+"-venue-more",children:[(0,r.jsx)("summary",{children:"Area details"}),Nd?(0,r.jsx)("p",{children:Nd}):null,oe.adaptationPending?(0,r.jsx)("p",{children:"This room is still being adapted after a move."}):null,oe.state?.condition?(0,r.jsxs)("p",{children:["Condition: ",oe.state.condition]}):null,oe.state?.items.length?(0,r.jsxs)("p",{children:["Present items: ",oe.state.items.join(", ")]}):null,oe.state?.publicFacts.length?(0,r.jsxs)("p",{children:["Established facts: ",oe.state.publicFacts.join(" \xB7 ")]}):null,oe.state?.features.length?(0,r.jsxs)("p",{children:["Defining features: ",oe.state.features.map(T=>T.text).join(" \xB7 ")]}):null,oe.area==="outside"&&i.village.setting?(0,r.jsxs)("p",{children:["Village: ",i.village.setting]}):null,Zg.map(T=>(0,r.jsxs)("p",{children:["Proposed room edit:"," ",T.declined?"declined or stale":`approved by ${T.approvedIds.length} of ${T.requiredIds.length} residents`]},T.id))]}):null,oe.locked&&!oe.canEnter?(0,r.jsx)("p",{className:n+"-venue-zone-guidance",children:"Visit the exterior and ask the resident for an invitation."}):null,$a&&!Gl?(0,r.jsx)("p",{className:n+"-venue-zone-guidance",children:"Finish the active visit before entering another area."}):null,(0,r.jsx)("button",{type:"button",className:n+"-venue-visit",disabled:qa||!Gl&&(!!$a||!oe.canEnter),onClick:()=>Gl?ae("room"):void ql(l,oe.spaceClass,oe.ownerId,oe.area),children:qa?"Opening visit\u2026":Gl?"Return to scene \u2192":"Visit this area \u2192"})]})]})]}):Q==="edit"?(0,r.jsxs)("main",{className:`${n}-venue-editor-page`,children:[(0,r.jsxs)("div",{className:`${n}-venue-space-grid`,children:[Sd("Exterior image",l.presentation.image),p.filter(T=>T!=="residence"||Mo).map(T=>Sd(T==="residence"?"Shared Residence image":`${T} space image`,$t(l,T).image,T)),$d.map(T=>Sd(`${ra(T.ownerId)}'s private image`,T.image,"residence",T.ownerId))]}),Pa===l.id?(0,r.jsx)("p",{className:`${n}-hint`,children:"Drawing or saving the image\u2026"}):null,bg?.id===l.id?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:bg.text}):null,he?(0,r.jsxs)("section",{className:`${n}-venue-card`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Venue details"}),(0,r.jsx)(J0,{draft:he,existing:!0,villagers:i.villagers,editableClasses:p.filter(T=>T!=="residence"||!X||$e),onChange:Se}),X?(0,r.jsx)("p",{className:`${n}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ht||!he.name.trim(),onClick:()=>{Y$()},children:"Save Venue details"}),X&&$e?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ht||!$t(he,"residence").description.trim(),onClick:()=>{Jg("shared")},children:"Propose shared room edit"}):null]}),X&&!$e?(0,r.jsx)("p",{className:`${n}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,wa&&he?.privateSpaces?.filter(T=>T.ownerId===wa).map(T=>(0,r.jsxs)("section",{className:`${n}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${n}-panel-title`,children:["Propose changes to ",ra(T.ownerId),"'s private space"]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${n}-textarea`,value:T.description,onChange:ue=>Se(K=>K&&{...K,privateSpaces:K.privateSpaces?.map(re=>re.ownerId===T.ownerId?{...re,description:ue.target.value}:re)})})]}),(0,r.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:T.state.condition,onChange:ue=>Se(K=>K&&{...K,privateSpaces:K.privateSpaces?.map(re=>re.ownerId===T.ownerId?{...re,state:{...re.state,condition:ue.target.value}}:re)})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this room."}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:T.state.items.join(`
`),onChange:ue=>Se(K=>K&&{...K,privateSpaces:K.privateSpaces?.map(re=>re.ownerId===T.ownerId?{...re,state:{...re.state,items:ue.target.value.split(`
`)}}:re)})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this room."}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:T.state.publicFacts.join(`
`),onChange:ue=>Se(K=>K&&{...K,privateSpaces:K.privateSpaces?.map(re=>re.ownerId===T.ownerId?{...re,state:{...re.state,publicFacts:ue.target.value.split(`
`)}}:re)})})]})]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ht||!T.description.trim(),onClick:()=>{Jg("private",T.ownerId)},children:"Propose private room edit"})]},T.ownerId)),X&&(l.residentIds?.length??0)>0?(0,r.jsxs)("section",{className:`${n}-venue-card`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Resident moves"}),(0,r.jsxs)("select",{value:j,onChange:T=>ye(T.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),i.settings.venues.filter(T=>T.id!==l.id&&fn(T).includes("residence")&&ju(T)<K0(T)).map(T=>(0,r.jsx)("option",{value:T.id,children:T.name},T.id))]}),(l.residentIds??[]).map(T=>{let ue=i.residences.find(K=>K.characterId===T&&K.status!=="current");return(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("strong",{children:ra(T)}),ue?(0,r.jsx)("span",{className:`${n}-hint`,children:ue.status==="moving"?"Moving":"Awaiting consent"}):(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:!j||Ht,onClick:()=>{Ut(!0),D("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:T,venueId:j})}).then(o).catch(K=>ft(B(K,"The move could not be requested."))).finally(()=>Ut(!1))},children:"Ask to move"})]},T)})]}):null,bn?(0,r.jsx)("p",{className:`${n}-hint`,role:"status",children:bn}):null,Ma?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Ma}):null]}):(0,r.jsx)("main",{className:`${n}-venue-proposal-page`,children:(0,r.jsxs)("section",{className:`${n}-venue-card`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Propose a Venue change"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),ie?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${n}-field`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${n}-row`,children:m1.map(T=>(0,r.jsxs)("label",{className:`${n}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:ie.classes.includes(T),disabled:!ie.classes.includes(T)&&ie.classes.length>=2,onChange:ue=>me(K=>K&&{...K,classes:ue.target.checked?[...K.classes,T]:K.classes.filter(re=>re!==T)})})," ",T]},T))})]}),ie.classes.includes("residence")?(0,r.jsxs)("label",{className:`${n}-label`,children:["Base capacity \xB7 includes you",(0,r.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:ie.capacity,onChange:T=>me({...ie,capacity:Number(T.target.value)})})]}):null,(0,r.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:ie.slot,onChange:T=>me({...ie,slot:Number(T.target.value)}),children:[(0,r.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",l.improvements?.[0]?.title??"empty"]}),(0,r.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",l.improvements?.[1]?.title??"empty"]})]})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,r.jsx)("input",{className:`${n}-notice-input`,value:ie.title,onChange:T=>me({...ie,title:T.target.value}),placeholder:"A second sleeping alcove"})]}),ie.title?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("label",{className:`${n}-label`,children:["What changes in the story?",(0,r.jsx)("textarea",{className:`${n}-textarea`,value:ie.description,onChange:T=>me({...ie,description:T.target.value})})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,r.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:3,value:ie.extraBeds,onChange:T=>me({...ie,extraBeds:Number(T.target.value)})})]})]}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ht||ie.classes.length<1||ie.title.trim().length>0&&!ie.description.trim(),onClick:()=>{Ut(!0),ft(""),D(`/locations/venue/${encodeURIComponent(l.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:ie.classes,capacity:ie.capacity,...ie.title.trim()?{slot:ie.slot,improvement:{title:ie.title,description:ie.description,extraBeds:ie.extraBeds}}:{},title:ie.title||`Change ${l.name}`,detail:ie.description||`Change Venue Classes or capacity at ${l.name}.`})}).then(T=>{o(T),me(null),A("Proposal submitted.")}).catch(T=>ft(B(T,"The proposal could not be saved."))).finally(()=>Ut(!1))},children:"Submit proposal"})]}):(0,r.jsx)("p",{className:`${n}-hint`,role:"status",children:bn||"Proposal submitted."}),Ma?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Ma}):null]})})]})}if(G==="menu")return(0,r.jsxs)("div",{className:`${n}-root ${n}-sectioned-menu`,"data-section":ia,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${n}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${n}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[ia]}),t?null:(0,r.jsx)("p",{className:`${n}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${n}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:ia!=="index"?()=>Qa("index"):fd,children:ia!=="index"?"Back to menu":"Back to the village"})})]}),Kr?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Kr}):null,(0,r.jsx)("nav",{className:`${n}-mobile-menu-nav`,"aria-label":"Village menu",children:ia==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>et("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>et("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>et("story"),children:"DEBUG Settings"})]}):ia==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["projects","Projects"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([l,u])=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,"data-active":Y===l,onClick:()=>l==="homes"?Hg():et(l),children:u},l))}):ia==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([l,u])=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,"data-active":Y===l,onClick:()=>et(l),children:u},l)),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:!i||I||Dl,onClick:()=>{Tg()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${n}-status`,children:s1}),Ol?(0,r.jsx)("p",{className:`${n}-status`,role:"status",children:Ol}):null]}):null}),(0,r.jsxs)("nav",{className:`${n}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${n}-menu-group`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="villagers","data-active":Y==="villagers"?"true":"false",disabled:!i||I,onClick:()=>et("villagers"),children:`Villagers (${i?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="noticeboard","data-active":Y==="noticeboard"?"true":"false",disabled:!i||I,onClick:()=>et("noticeboard"),children:`Noticeboard (${i?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="venueRequests","data-active":Y==="venueRequests"?"true":"false",disabled:!i||I,onClick:()=>et("venueRequests"),children:`Venue Requests (${(i?.venueRequests?.length??0)+(i?.upgradeRequests?.length??0)+(i?.residences?.filter(l=>l.status==="pending"&&l.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="projects","data-active":Y==="projects"?"true":"false",disabled:!i||I,onClick:()=>et("projects"),children:`Projects (${i?.projects?.filter(l=>l.kind==="build-venue"&&l.status!=="complete").length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="homes","data-active":Y==="homes"?"true":"false",disabled:!i||I,onClick:Hg,children:`Homes (${Gp(i?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="map","data-active":Y==="map"?"true":"false",disabled:!i||I,onClick:()=>et("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="village","data-active":Y==="village"?"true":"false",onClick:()=>et("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${n}-menu-group`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${n}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="general","data-active":Y==="general"?"true":"false",onClick:()=>et("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${n}-menu-group`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="replyGuidance","data-active":Y==="replyGuidance"?"true":"false",disabled:!i||I,onClick:()=>et("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="story","data-active":Y==="story"?"true":"false",disabled:!i||I,onClick:()=>et("story"),children:`DEBUG: Village Story (${d?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="chatlogs","data-active":Y==="chatlogs"?"true":"false",disabled:!i||I,onClick:()=>et("chatlogs"),children:`DEBUG: Venue Visits (${E?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="agendas","data-active":Y==="agendas"?"true":"false",disabled:!i||I,onClick:()=>et("agendas"),children:`DEBUG: Villager Wishes (${U?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":Y==="schedules","data-active":Y==="schedules"?"true":"false",disabled:!i||I,onClick:()=>et("schedules"),children:`Villager Agendas (${U?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:!i||I||Dl,onClick:()=>{Tg()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${n}-status`,children:s1}),Ol?(0,r.jsx)("p",{className:`${n}-status`,role:"status",children:Ol}):null]})]}),Y==="general"?(0,r.jsxs)("section",{className:`${n}-panel`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"General settings"}),(0,r.jsx)(qp,{}),i?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsxs)("label",{className:`${n}-row`,htmlFor:`${n}-speech-colors`,children:[(0,r.jsx)("input",{id:`${n}-speech-colors`,type:"checkbox",checked:i.settings.characterSpeechColors,disabled:I,onChange:l=>{s$(l.target.checked)}}),(0,r.jsx)("span",{children:"Character chat colors"})]}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Show names and spoken words in the colors captured from each villager\u2019s card. Use Compare card and Apply refresh to adopt later color changes."})]}):null,i?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${n}-story-pace`,value:i.settings.storyPace,disabled:I,onChange:l=>{r$(l.target.value)},children:i.settings.storyPaces.map(l=>(0,r.jsx)("option",{value:l,children:l.charAt(0).toUpperCase()+l.slice(1)},l))}),(0,r.jsx)("span",{className:`${n}-hint`,children:PS(i.settings.storyPace)})]}):null,i?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${n}-visit-retention`,value:i.settings.visitRetention.mode,disabled:I,onChange:l=>{let u=l.target.value;Og({mode:u,value:u==="count"?100:u==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),i.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":i.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:i.settings.visitRetention.mode==="count"?1:30,max:i.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:i.settings.visitRetention.value,onBlur:l=>{let u=Number(l.target.value);u!==i.settings.visitRetention.value&&Og({mode:i.settings.visitRetention.mode,value:u})}},`${i.settings.visitRetention.mode}:${i.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("p",{className:`${n}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||!i,onClick:()=>is(!1,i),children:"Run setup again"}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${n}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${n}-row`,children:R1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${n}-button ${n}-danger`,disabled:I,onClick:()=>{M$()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>Tl(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||!i,onClick:()=>Tl(!0),children:"Reset the village and start over"})})]}),Bt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Bt}):null]}):Y==="village"?(0,r.jsxs)("div",{className:`${n}-menu-body`,children:[i?(0,r.jsxs)("section",{className:`${n}-panel`,children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${n}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(w2,{}),t?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Map background image"}),zl?(0,r.jsx)("img",{className:`${n}-mobile-map-preview`,src:zl,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${n}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:I,"aria-label":"Choose a town map picture",onChange:l=>{let u=l.target.files?.[0];l.target.value="",Vg(u)}}),_a?(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{Dg()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:Bl,children:"Cancel"})]}):i.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{_g()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setting`,children:"What is this village like?"}),(0,r.jsx)("textarea",{id:`${n}-setting`,className:`${n}-textarea ${n}-off`,value:wn,maxLength:i.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:l=>pl(l.target.value)}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,r.jsx)(i1,{books:Yu,error:Pp,selected:$n,onChange:vo,disabled:I}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${n}-lore-budget`,className:`${n}-notice-input`,type:"number",min:i.settings.loreTokenBudgetMin,max:i.settings.loreTokenBudgetMax,step:100,value:Gu,disabled:I,onChange:l=>Zp(Number(l.target.value))}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,r.jsxs)("section",{className:`${n}-field`,children:[(0,r.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Venues"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:V$,disabled:I||b$>=i.settings.maxPlaces,children:"Propose Venue Project"})]}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,r.jsx)("input",{className:`${n}-notice-input`,type:"search",value:Wp,onChange:l=>w1(l.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,r.jsx)("div",{className:`${n}-notice-add`,children:i.settings.venues.filter(l=>`${l.name} ${l.form??""} ${fn(l).join(" ")}`.toLowerCase().includes(Wp.toLowerCase())).map(l=>(0,r.jsxs)("div",{className:`${n}-notice-row`,children:[(0,r.jsx)("strong",{children:l.name||"Unnamed Residence"}),(0,r.jsx)("span",{className:`${n}-hint`,children:[l.form,fn(l).join(" + ")].filter(Boolean).join(" \xB7 ")}),fn(l).includes("residence")?(0,r.jsxs)("span",{className:`${n}-hint`,children:[(l.residentIds?.length??+!!l.occupancy.residentCharacterId)+Number(l.occupancy.playerHome)," ","/ ",l.residenceCapacity??1," residents"]}):null,(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ul(l),children:"View Venue"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Se(structuredClone(l)),children:"Edit"}),(0,r.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{_$(l.id)},"aria-label":`Delete ${l.name}`,disabled:I,children:"\xD7"})]})]},l.id))}),he?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("h3",{className:`${n}-panel-title`,children:i.settings.venues.some(l=>l.id===he.id)?"Edit Venue":"Create Venue"}),(0,r.jsx)(J0,{draft:he,existing:i.settings.venues.some(l=>l.id===he.id),villagers:i.villagers,onChange:Se}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||!he.name.trim()||!fn(he).every(l=>$t(he,l).description.trim()),onClick:()=>{D$(he)},children:"Save Venue"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Se(null),children:"Cancel"})]})]}):null,(0,r.jsx)("div",{className:`${n}-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{l$()},disabled:I,children:"Suggest Venues"})}),gl.filter(l=>!i.settings.venues.some(u=>u.id===l.id)).map(l=>(0,r.jsxs)("div",{className:`${n}-notice-row`,children:[(0,r.jsx)("strong",{children:l.name}),(0,r.jsx)("span",{className:`${n}-hint`,children:l.form}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Se(l),children:"Review suggestion"})]},l.id))]}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${n}-knowledge`,ref:md,className:`${n}-preset`,value:S,maxLength:i.settings.promptBoxMaxLength,spellCheck:!1,onChange:l=>ce(l.target.value)}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${n}-macros`,children:i.settings.macros.map(l=>(0,r.jsx)("button",{type:"button",className:`${n}-macro`,title:`${l.label} \u2014 ${l.help}`,onClick:()=>I$(l.token),children:l.token},l.token))}),(0,r.jsxs)("p",{className:`${n}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)(v2,{idPrefix:"settings",personas:Vt,draft:Z,onDraft:kt,storedId:i.settings.playerPersonaId,storedName:i.settings.playerPersonaName,storedMissing:i.settings.playerPersonaMissing,disabled:I}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{o$()},disabled:I,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{ce(i.settings.defaultPromptKnowledge)},disabled:I,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${n}-hint`,children:S===i.settings.promptKnowledge&&Z===i.settings.playerPersonaId&&wn===i.settings.setting&&JSON.stringify($n)===JSON.stringify(i.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,Bt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Bt}):null]}):(0,r.jsxs)("div",{className:`${n}-menu-body`,children:[Y==="villagers"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Villagers"})}),(0,r.jsxs)("nav",{className:`${n}-villager-submenu`,"aria-label":"Villagers sections",children:[(0,r.jsxs)("button",{type:"button","data-active":x==="residents","aria-pressed":x==="residents",onClick:()=>g("residents"),children:[(0,r.jsx)("span",{children:"Residents"}),(0,r.jsxs)("small",{children:[i?.villagers.length??0," living here"]})]}),(0,r.jsxs)("button",{type:"button","data-active":x==="memories","aria-pressed":x==="memories",onClick:()=>{g("memories"),C(null),Il()},children:[(0,r.jsx)("span",{children:"Memories"}),(0,r.jsx)("small",{children:"Passing, durable & evidence"})]})]}),x==="residents"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${n}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${n}-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>ee(l=>!l),disabled:I,children:Ee?"Close the list":"Add a villager"})}),Ee?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("input",{className:`${n}-search`,type:"search",value:hl,onChange:l=>ml(l.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),s===null?(0,r.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):yd.length===0?(0,r.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${n}-picker-list`,children:yd.map(l=>(0,r.jsxs)("div",{className:`${n}-picker-item`,"data-resident":l.inVillage?"true":"false",children:[(0,r.jsx)(fo,{portrait:Hr[l.id],name:l.name,className:`${n}-avatar`}),(0,r.jsxs)("div",{className:`${n}-picker-text`,children:[(0,r.jsx)("div",{className:`${n}-villager-name`,children:l.name}),(0,r.jsx)("div",{className:`${n}-villager-role`,children:l.comment||l.tags.slice(0,3).join(" \xB7 ")}),l.summary?(0,r.jsx)("p",{className:`${n}-tile-summary`,children:l.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Z1(l.id)},disabled:I||l.inVillage,children:l.inVillage?"Lives here":"Move in"})]},l.id))})]}):null,i&&i.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${n}-villagers`,children:i.villagers.map(l=>(0,r.jsx)(x2,{villager:l,portrait:Hr[l.characterId],selected:!1,onSelect:!l.place||q!==null?void 0:()=>{let u=i.settings.venues.find(p=>p.id===l.place?.id);u&&Rg(u)}},l.characterId))}),(0,r.jsx)("div",{className:`${n}-roster`,children:i.villagers.map(l=>(0,r.jsxs)("div",{className:`${n}-roster-entry`,children:[(0,r.jsxs)("div",{className:`${n}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${n}-villager-name`,children:l.name}),l.missing?(0,r.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,Oa[l.characterId]?(0,r.jsx)("div",{className:`${n}-tile-summary`,children:Oa[l.characterId].changed?`New card: ${Oa[l.characterId].proposed?.name??"unavailable"}`:Oa[l.characterId].sourceAvailable?`Snapshot revision ${Oa[l.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ir(Ei===l.characterId?null:l.characterId),"aria-expanded":Ei===l.characterId,children:Ei===l.characterId?"Close sprite studio":`Sprites \xB7 ${l.sprite?.images.length??0} approved`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{J1(l.characterId)},disabled:I||zi.length>0,children:"Compare card"}),Oa[l.characterId]?.changed&&Oa[l.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{P1(l.characterId)},disabled:I||zi.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{K1(l.characterId)},disabled:I||zi.length>0,children:"Move out"})]})]}),Ei===l.characterId?(0,r.jsx)(S2,{villager:l,onSaved:o}):null]},l.characterId))})]}):(0,r.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):(0,r.jsx)(HS,{library:b,busy:I,onRefresh:()=>{C(null),Il()},onForget:(l,u)=>{B1(l,u)}})]}):null,Y==="noticeboard"&&i?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Noticeboard"})}),i.noticeboard.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${n}-notices`,children:i.noticeboard.map((l,u)=>(0,r.jsxs)("li",{className:`${n}-notice-row`,children:[(0,r.jsxs)("span",{children:[l.author.length>0?(0,r.jsx)("span",{className:`${n}-notice-author`,children:`${l.author}: `}):null,l.text]}),(0,r.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{H$(u)},disabled:I,"aria-label":`Take down: ${l.text}`,children:"\xD7"})]},`${u}:${l.text}`))}),(0,r.jsxs)("div",{className:`${n}-notice-add`,children:[(0,r.jsx)("input",{className:`${n}-notice-input`,type:"text",value:yl,maxLength:i.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:l=>ag(l.target.value),onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),Yg())}}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Yg()},disabled:I||yl.trim().length===0||i.noticeboard.length>=i.settings.maxNoticeboardNotes,children:`Pin it up (${i.noticeboard.length}/${i.settings.maxNoticeboardNotes})`})]})]}):null,Y==="projects"&&i?(0,r.jsx)(E2,{snapshot:i,room:q,onSnapshot:o,onReturn:()=>ae("room")}):null,Y==="venueRequests"&&i?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:"Villagers can ask for places in conversation. Approval starts a planning draft in Projects; the venue appears only after supplies, a resident builder, and construction."}),i.venueRequests.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${n}-notices`,children:i.venueRequests.map(l=>{let u=vn[l.id]??l.venueDraft,p=N=>Ti(z=>({...z,[l.id]:{...u,...N}}));return(0,r.jsx)("li",{className:`${n}-notice-row`,children:(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("strong",{children:l.requesterName||"A villager"}),l.requestQuote?(0,r.jsxs)("p",{children:["\u201C",l.requestQuote,"\u201D"]}):null,(0,r.jsx)("span",{className:`${n}-hint`,children:` \xB7 ${l.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${n}-notice-input`,value:u.name,maxLength:i.settings.maxVenueNameLength,"aria-label":`Requested place name from ${l.requesterName||"villager"}`,onChange:N=>p({name:N.target.value})}),(0,r.jsxs)("select",{className:`${n}-notice-input`,value:u.classes[0]??"gathering","aria-label":`Requested place class from ${l.requesterName||"villager"}`,onChange:N=>p({classes:[N.target.value]}),children:[(0,r.jsx)("option",{value:"residence",children:"Residence"}),(0,r.jsx)("option",{value:"gathering",children:"Gathering"}),(0,r.jsx)("option",{value:"workplace",children:"Workplace"}),(0,r.jsx)("option",{value:"other",children:"Other"})]}),(0,r.jsx)("textarea",{className:`${n}-textarea`,value:u.description??"",maxLength:1e3,"aria-label":`Requested place description from ${l.requesterName||"villager"}`,onChange:N=>p({description:N.target.value})}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||!u.name.trim(),onClick:()=>{P(!0),W(""),D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:u.name,classes:u.classes}]})}).then(N=>p({description:N.descriptions[l.id]??""})).catch(N=>W(B(N,"The description draft could not be generated."))).finally(()=>P(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||!u.name.trim()||u.classes.length===0||!u.description?.trim(),onClick:()=>{Gg(l,!0)},children:u.name!==l.venueDraft.name||JSON.stringify(u.classes)!==JSON.stringify(l.venueDraft.classes)?"Send counteroffer":"Start planning project"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{Gg(l,!1)},children:"Deny"})]})]})},l.id)})}),(0,r.jsx)("h3",{className:`${n}-panel-title`,children:"Home upgrade requests"}),i.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"No home upgrades requested."}):i.upgradeRequests.map(l=>(0,r.jsxs)("div",{className:`${n}-notice-row`,children:[(0,r.jsx)("span",{children:l.detail}),[!0,!1].map(u=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{P(!0),W(""),D(`/venue-upgrades/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST"}).then(o).catch(p=>W(B(p,"The upgrade request could not be decided."))).finally(()=>P(!1))},children:u?"Approve upgrade":"Deny"},String(u)))]},l.id)),(0,r.jsx)("h3",{className:`${n}-panel-title`,children:"Resident move requests"}),i.residences.filter(l=>l.status!=="current").length===0?(0,r.jsx)("p",{className:`${n}-hint`,children:"No moves pending."}):i.residences.filter(l=>l.status!=="current").map(l=>{let u=ra(l.characterId),p=i.settings.venues.find(N=>N.id===l.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${n}-notice-row`,children:[(0,r.jsx)("span",{children:`${u} \u2192 ${p}`}),l.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${n}-hint`,children:["Move due ",new Date(l.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{P(!0),W(""),D("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(o).catch(N=>W(B(N,"The move could not be completed."))).finally(()=>P(!1))},children:"DEBUG: Complete move now"})]}):l.requestedBy==="player"?(0,r.jsxs)("span",{className:`${n}-hint`,children:["Awaiting ",u,"'s answer in conversation."]}):[!0,!1].map(N=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{P(!0),W(""),D(`/residences/${N?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(o).catch(z=>W(B(z,"The move request could not be decided."))).finally(()=>P(!1))},children:N?"Approve move":"Deny"},String(N)))]},l.characterId)}),Bt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Bt}):null]}):null,Y==="homes"&&i?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Homes on the map"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||va.length>=Ll,onClick:()=>{Kt(!0),fd()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${n}-hint`,children:`${va.length} of at most ${Ll}`})]}),va.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(y2,{homes:va,villagers:(i?.villagers??[]).map(l=>({id:l.characterId,name:l.name})),disabled:I,selectedId:$1,onPatch:qg,onRemove:$$,onSelect:Xu,showDescriptions:!0,onGenerateDescription:l=>{N$(l)},lockedIds:new Set(i.settings.venues.filter(l=>l.occupancy.residentCharacterId).map(l=>l.id))}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{x$()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>ns(i.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${n}-hint`,children:FS(i.settings.venues,va)?"No unsaved changes.":"Unsaved changes."})]})]}):null,Y==="map"&&i?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(Up,{src:zl,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:i.settings.venues.flatMap(l=>{let u=Hu(l);if(!u)return[];let p=l.occupancy.residentCharacterId?ra(l.occupancy.residentCharacterId):l.occupancy.playerHome?po(i):"";return[{id:l.id,x:u.x,y:u.y,text:p?`${l.name||"Home"} \xB7 ${p}`:l.name,tone:_r(l)?e1({isPlayerHome:l.occupancy.playerHome,occupant:l.occupancy.residentCharacterId}):"venue",onSelect:()=>eg(l.id)}]}),placing:vl!==null,view:Zr,shape:vg,zoom:O1,onView:Al?Qr:void 0,onPlace:vl?(l,u)=>{let p=vl;P(!0),W(""),D(`/locations/venue/${encodeURIComponent(p)}`,{method:"PUT",body:JSON.stringify({presentation:{x:l,y:u}})}).then(o).catch(N=>W(B(N,"The venue could not be placed."))).finally(()=>{P(!1),tg(null)})}:void 0}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Venue positions and residents"}),i.settings.venues.map(l=>{let u=l.occupancy.residentCharacterId?ra(l.occupancy.residentCharacterId):l.occupancy.playerHome?po(i):"";return(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":x1===l.id,onClick:()=>eg(l.id),children:l.name||"Home"}),(0,r.jsx)("span",{className:`${n}-hint`,children:u?`Lives here: ${u}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${n}-hint`,children:Hu(l)?"On map":"Not placed"}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Pin moves need a future project."})]},l.id)}),vl?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>tg(null),children:"Cancel pin placement"}):null,Bt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Bt}):null]}),Al?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${n}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:t1.map(l=>(0,r.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":Zr.fit===l.fit?"true":"false","aria-pressed":Zr.fit===l.fit,onClick:()=>Qr({...Zr,fit:l.fit}),children:l.label},l.fit))}),(0,r.jsx)("p",{className:`${n}-hint`,children:t1.find(l=>l.fit===Zr.fit)?.help})]}):null,ld?(0,r.jsx)("p",{className:`${n}-hint`,"data-tone":ld.tone,children:ld.text}):null,(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:I,"aria-label":"Choose a town map picture",onChange:l=>{let u=l.target.files?.[0];l.target.value="",Vg(u)}}),i.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{_g()},children:"Remove background image"}):null]}),Al?(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{Dg()},children:_a?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:Bl,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("p",{className:`${n}-hint`,children:i.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),i.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>sd(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("span",{className:`${n}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${n}-macro-help`,children:["What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:i.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),jn(i.settings.venues).length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${n}-places`,children:jn(i.settings.venues).map(l=>(0,r.jsxs)("li",{className:`${n}-place`,children:[l.presentation.image?(0,r.jsx)("img",{className:`${n}-place-thumb`,src:l.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${n}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${n}-place-body`,children:[(0,r.jsx)("span",{className:`${n}-place-name`,children:l.name}),(0,r.jsx)("div",{className:`${n}-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{Ul(l)},children:"View Venue"})})]})]},l.id))})]})]}):null,Y==="replyGuidance"?(0,r.jsx)($2,{}):null,Y==="story"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),d===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Reading what the village remembers\u2026"}):d.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):_S(d).map(l=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${n}-story-day`,children:l.label}),(0,r.jsx)("ul",{className:`${n}-story`,children:l.entries.map(u=>{let p=Lp(u),N=u.actors.map(z=>z.name).join(", ");return(0,r.jsxs)("li",{className:`${n}-story-row`,children:[(0,r.jsxs)("span",{children:[p.length>0||u.scope==="private"||u.kind==="favour"?(0,r.jsxs)("span",{className:`${n}-story-meta`,children:[p,u.scope==="private"?(0,r.jsx)("span",{className:`${n}-story-scope`,children:` \xB7 private to ${N}`}):null,u.kind==="favour"?(0,r.jsx)("span",{className:`${n}-story-scope`,children:" \xB7 a favour"}):null,u.kind==="tick"?(0,r.jsx)("span",{className:`${n}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,u.text]}),(0,r.jsx)("button",{type:"button",className:`${n}-remove`,disabled:I,onClick:()=>{L1(u.id)},"aria-label":`Forget: ${u.text}`,children:"\xD7"})]},u.id)})})]},`${l.label}:${l.entries[0]?.id??""}`)),d&&d.length<f?(0,r.jsxs)("button",{type:"button",className:`${n}-button`,onClick:()=>{j1()},children:["Load more memories (",d.length," of ",f,")"]}):null]}):null,Y==="chatlogs"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:Ve,onChange:l=>{Ae(l.target.value),k(0),L(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(i?.settings.venues??[]).map(l=>(0,r.jsx)("option",{value:l.id,children:l.name},l.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:na,onChange:l=>{gt(l.target.value),k(0),L(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(i?.villagers??[]).map(l=>(0,r.jsx)("option",{value:l.characterId,children:l.name},l.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||w===0,onClick:()=>{zg()},children:"Delete all completed logs"}),xt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:xt}):null,E===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Reading venue visits\u2026"}):E.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"No completed visits match these filters."}):E.map(l=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${n}-story-day`,children:[l.placeName," \xB7 ",Bu(l.startedAt)]}),(0,r.jsxs)("p",{className:`${n}-story-meta`,children:[l.participants.map(u=>u.name).join(", ")," \xB7 ",l.lineCount," lines",l.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",l.memoryPending?l.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${l.memoryReview.nextRecollection??0}/${l.recollectionCount} recollections reviewed \xB7 ${l.memoryReview.attempts} ${l.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${l.memoryProgress?.nextUnit??0}/${l.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{gd(l.id)},children:H?.id===l.id?"Refresh transcript":"Open transcript"}),l.memoryPending?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{Q1(l.id)},children:l.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{zg(l.id)},children:"Delete log"})]}),H?.id===l.id?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("ul",{className:`${n}-story`,children:H.lines.map((u,p)=>(0,r.jsx)("li",{className:`${n}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${n}-story-meta`,children:[(0,r.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?Lu(i.villagers.find(N=>N.characterId===u.speakerId)?.nameColor):void 0,children:u.name||po(i)})," \xB7 ",Bu(u.at)]}),(0,r.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?Lu(i.villagers.find(N=>N.characterId===u.speakerId)?.dialogueColor):void 0,children:Dr(u.content,`venue-${l.id}-${p}-`)}),(0,r.jsxs)("span",{className:`${n}-story-meta`,children:["Heard by:"," ",u.heardBy?.map(N=>H.participants.find(z=>z.characterId===N)?.name??N).join(", ")||"no one"]})]})},`${l.id}:${p}`))}),(H.submissions??[]).some(u=>u.recollections?.length)?(0,r.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,r.jsx)("summary",{children:"Captured recollections and evidence"}),(0,r.jsx)("ul",{className:`${n}-story`,children:(H.submissions??[]).flatMap(u=>(u.recollections??[]).map(p=>(0,r.jsxs)("li",{className:`${n}-wish-card`,children:[(0,r.jsx)("p",{className:`${n}-wish-text`,children:p.text}),(0,r.jsx)("p",{className:`${n}-wish-meta`,children:`Subjects: ${p.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${p.knownByCharacterIds.join(", ")}`}),(0,r.jsx)("p",{className:`${n}-wish-meta`,children:`Evidence: ${p.lineIds.join(", ")}`})]},p.id)))})]}):null,H.memoryReview&&H.memoryReview.status!=="none"?(0,r.jsxs)("details",{className:`${n}-agenda-notes`,open:H.memoryPending,children:[(0,r.jsx)("summary",{children:`Durable review \xB7 ${H.memoryReview?.status??"none"}`}),(0,r.jsxs)("div",{className:`${n}-agenda-notes-body`,children:[(0,r.jsxs)("p",{className:`${n}-story-meta`,children:[`${H.memoryReview?.attempts??0} review attempts \xB7 ${H.memoryReview?.nextRecollection??0} recollections reviewed`,H.memoryReview?.error?` \xB7 Last error: ${H.memoryReview.error}`:""]}),(0,r.jsx)("ul",{className:`${n}-story`,children:(H.memoryReview?.decisions??[]).map(u=>(0,r.jsxs)("li",{className:`${n}-wish-card`,children:[(0,r.jsx)("p",{className:`${n}-wish-text`,children:`${u.action==="promote"?"Promoted":"Rejected"}${u.category?` \xB7 ${c1[u.category]}`:""}`}),u.text?(0,r.jsx)("p",{children:u.text}):null,(0,r.jsx)("p",{className:`${n}-wish-meta`,children:u.reason}),(0,r.jsx)("p",{className:`${n}-wish-meta`,children:`Sources: ${u.recollectionIds.join(", ")}`})]},u.id))})]})]}):null]}):null]},l.id)),w>20?(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:v===0,onClick:()=>{k(Math.max(0,v-20)),L(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[v+1,"\u2013",Math.min(w,v+20)," of ",w]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:v+20>=w,onClick:()=>{k(v+20),L(null)},children:"Next"})]}):null]}):null,Y==="agendas"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),U===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Reading what the villagers wish\u2026"}):U.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:U.map(l=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${n}-story-day`,children:[l.name,l.missing?(0,r.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null]}),l.agenda===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):l.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure?`Wish generation failed: ${l.agenda.personalizationFailure}`:l.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${n}-story`,children:l.agenda.wishes.map(u=>(0,r.jsxs)("li",{className:`${n}-wish-card`,children:[(0,r.jsx)("p",{className:`${n}-wish-text`,children:u.wish}),u.tell.length>0?(0,r.jsx)("p",{className:`${n}-wish-tell`,children:`Shows as: ${u.tell}`}):null,(0,r.jsx)("p",{className:`${n}-wish-meta`,children:`${u.intensity===1?"Faint":u.intensity===3?"Strong":"Present"} \xB7 ${BS(u.addedAt??"",u.expiresAt??"")}`})]},u.id))}),l.completedWishes.length>0?(0,r.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,r.jsx)("summary",{children:`Completed wishes (${l.completedWishes.length})`}),(0,r.jsx)("ul",{className:`${n}-story`,children:l.completedWishes.map(u=>(0,r.jsxs)("li",{className:`${n}-wish-card`,children:[(0,r.jsx)("p",{className:`${n}-wish-text`,children:u.wish.wish}),(0,r.jsx)("p",{className:`${n}-wish-meta`,children:`Fulfilled ${new Date(u.fulfilledAt).toLocaleDateString()}`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{Y1(l.characterId,u.wish.id)},children:"Mark as not fulfilled"})]},u.wish.id))})]}):null]},l.characterId))})]}):null,Y==="schedules"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${n}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),U===null?(0,r.jsx)("p",{className:`${n}-empty`,children:"Loading agendas\u2026"}):U.length===0?(0,r.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${n}-agenda-list`,children:U.map(l=>(0,r.jsxs)("details",{className:`${n}-week`,children:[(0,r.jsx)("summary",{className:`${n}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${n}-week-head`,children:[l.name,l.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${n}-badge`,children:l.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,l.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${n}-badge`,children:"Personalization failed"}):null,l.missing?(0,r.jsx)("span",{className:`${n}-badge`,children:"Card missing"}):null,l.nativeSchedule?(0,r.jsx)("span",{className:`${n}-badge`,children:l.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,Dp(l)?(0,r.jsx)("span",{className:`${n}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${n}-week-body`,children:[l.agenda?.routineSummary?(0,r.jsx)("p",{className:`${n}-story-meta`,children:l.agenda.routineSummary}):null,l.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure}):l.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${n}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${n}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${n}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:l.ingestSchedule,disabled:I,onChange:u=>{X1(l.characterId,u.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{G1(l.characterId)},children:"Regenerate agenda"})]}),l.nativeSchedule?(0,r.jsxs)("p",{className:`${n}-story-scope`,children:[l.ingestSchedule&&l.remapFailure?`Schedule translation failed: ${l.remapFailure.message}`:l.ingestSchedule&&l.agenda?.scheduleWeek?"Schedule guides today and future days.":l.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",Dp(l)?" Earlier hours retain the previous plan.":""]}):Dp(l)?(0,r.jsx)("p",{className:`${n}-story-scope`,children:"Earlier hours retain the previous plan."}):null,l.weekUnreadable?(0,r.jsx)("p",{className:`${n}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):l.nativeSchedule?null:(0,r.jsx)("p",{className:`${n}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${n}-agenda-days`,children:l.days.map(u=>{let p=u.isToday?l.agenda?.activeDay?.blocks??l.agenda?.week?.[u.weekday]??[]:(l.ingestSchedule?l.agenda?.scheduleWeek?.[u.weekday]:void 0)??l.agenda?.week?.[u.weekday]??[],N=l.nativeSchedule?.days[u.weekday]??[];return(0,r.jsxs)("details",{className:`${n}-agenda-day`,open:u.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[u.weekday," \xB7 ",u.dateLabel,u.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${n}-agenda-compare`,"data-comparison":l.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${u.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${n}-agenda-blocks`,children:p.map((z,_)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[G0(z.startMinute),"\u2013",G0(z.endMinute)]}),(0,r.jsx)("strong",{children:z.activity}),(0,r.jsx)("span",{children:z.venueId?US(i?.settings.venues??[],z.venueId):"Home"}),(0,r.jsx)("span",{children:z.reason}),(0,r.jsx)("span",{className:`${n}-story-scope`,children:z.status==="idle"?"Available":z.status==="dnd"?"Busy":z.status==="offline"?"Offline":"Online"})]},`${z.startMinute}-${z.endMinute}-${_}`))})]}),l.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${u.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),N.length?(0,r.jsx)("ol",{className:`${n}-agenda-blocks`,children:N.map((z,_)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:z.time}),(0,r.jsx)("strong",{children:z.activity}),(0,r.jsx)("span",{className:`${n}-story-scope`,children:z.status||"No availability set"})]},`${z.time}-${_}`))}):(0,r.jsx)("p",{className:`${n}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${u.weekday}-${u.dateLabel}`)})})]})]},l.characterId))})]}):null,Bt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Bt}):null]})]});if(G==="preparing"){let l=i?.foundingPreparation,u=i?.villagers.length??0,p=l?.completedIds.length??0,N=i?.villagers.find($e=>$e.characterId===l?.currentId)?.name,z=l?.stage==="reading"?"Reading the character card and native schedule":l?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":l?.stage==="resolving"?"Connecting to the System model":l?.stage==="model"?`Waiting for ${l.modelName||"the System model"} to write wishes, the week, and schedule mappings`:l?.stage==="applying"?"Expanding the week and applying native schedule times":l?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",_=l?.stageStartedAt?Date.parse(l.stageStartedAt):NaN,X=l?.status==="pending"&&Number.isFinite(_)?Math.max(0,Math.floor((Date.now()-_)/1e3)):null;return(0,r.jsx)("div",{className:`${n}-root ${n}-preparing`,role:"status","aria-live":"polite",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("div",{className:`${n}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,r.jsxs)("h1",{children:[i?.village.name??"Your village"," is settling in"]}),(0,r.jsx)("p",{children:l?.status==="failed"?"The villagers need a hand before the gates open.":N?`Making room for ${N}\u2026`:"Lighting windows and making plans\u2026"}),(0,r.jsx)("p",{children:`${p} of ${u} villagers ready`}),l?.status==="pending"&&l.stage?(0,r.jsxs)("p",{children:[z,N?` for ${N}`:"","."]}):null,l?.attempt?(0,r.jsx)("p",{children:`Attempt ${l.attempt} of 3${X!==null?` \xB7 ${X}s in this stage`:""}`}):null,l?.stage==="resolving"||l?.stage==="model"||l?.stage==="applying"||l?.stage==="saving"?(0,r.jsx)("p",{children:`${l.loreEntryCount??0} relevant lorebook entries included`}):null,l?.status==="pending"&&l.error?(0,r.jsx)("p",{className:`${n}-hint`,children:`Previous attempt: ${l.error}`}):null,l?.status==="failed"?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:l.error}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{O$()},children:"Retry this villager"}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Change connections"}),(0,r.jsx)(qp,{})]})]}):null,mg?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:mg}):null]})})}if(G==="setup"){let l=(s??[]).map(u=>({id:u.id,name:u.name}));return(0,r.jsx)("div",{className:`${n}-root ${n}-home ${n}-setup-root`,children:(0,r.jsxs)("div",{className:`${n}-home-body ${n}-setup-body`,"data-step":De,children:[(0,r.jsx)("aside",{className:`${n}-setup-rail`,"aria-label":"Founding progress",children:_u.map((u,p)=>(0,r.jsxs)("div",{className:`${n}-setup-rail-step`,"data-active":p===De?"true":"false","data-done":p<De?"true":"false","aria-current":p===De?"step":void 0,children:[(0,r.jsx)("span",{className:`${n}-setup-rail-number`,children:p+1}),(0,r.jsx)("span",{children:u})]},u))}),(0,r.jsx)("div",{className:`${n}-side`,children:(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("div",{className:`${n}-overlay-head`,children:(0,r.jsx)("h2",{className:`${n}-panel-title`,children:i?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsxs)("p",{className:`${n}-setup-kicker`,children:["Step ",De+1," of ",_u.length," \xB7 ",_u[De]]}),De===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${n}-setup-name`,className:`${n}-search`,type:"text",value:Ka,maxLength:i?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:I,onChange:u=>ng(u.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${n}-field`,children:[(0,r.jsx)("legend",{className:`${n}-label`,children:"Choose a scenario"}),(0,r.jsx)("div",{className:`${n}-scenario-options`,children:Bp.filter(u=>u.value!=="custom"||i?.isFounded&&xn==="custom").map(u=>(0,r.jsxs)("label",{className:`${n}-scenario-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${n}-founding-scenario`,checked:xn===u.value,disabled:I||i?.isFounded,onChange:()=>S$(u.value)}),(0,r.jsx)("span",{className:`${n}-scenario-icon`,"aria-hidden":"true",children:u.icon}),(0,r.jsx)("strong",{children:u.label}),(0,r.jsx)("small",{children:u.description})]},u.value))})]}),i?.isFounded?(0,r.jsx)("p",{className:`${n}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,De===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(b2,{personas:Vt,draft:Z,onDraft:kt,disabled:I}),(0,r.jsx)(qp,{onSetupProblem:z1,onImageWarningChange:gg,compact:!0}),A1?(0,r.jsxs)("div",{className:`${n}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${n}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${n}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${n}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:T$,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:k$,children:"I understand, continue"})]})]}):null]}):null,De===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-setting`,children:"What is this village like?"}),(0,r.jsx)("textarea",{id:`${n}-setup-setting`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:Tt,maxLength:i?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:I||qt,onChange:u=>{ig(u.target.value),$l([])}}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),i?.isFounded?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("strong",{children:"Day 1 record"}),(0,r.jsx)("p",{className:`${n}-hint`,children:i.settings.foundingDetails||"This village has no recorded first-day description."}),(0,r.jsx)("span",{className:`${n}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-founding-details`,children:"What happens on the village's first day?"}),(0,r.jsx)("textarea",{id:`${n}-founding-details`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:ya,maxLength:i?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:I,onChange:u=>Qu(u.target.value)}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history."})]}),i?.isFounded?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-world-facts`,children:"Current world facts"}),(0,r.jsx)("textarea",{id:`${n}-world-facts`,className:`${n}-textarea`,value:Nn.join(`
`),disabled:I,placeholder:"One stable fact per line, up to four.",onChange:u=>sg(u.target.value.split(/\r?\n/u))}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,r.jsx)(i1,{books:Yu,error:Pp,selected:Va,onChange:u=>{Kp(u),$l([])},disabled:I}),(0,r.jsxs)("details",{className:`${n}-field`,children:[(0,r.jsx)("summary",{className:`${n}-label`,children:"Advanced lore settings"}),(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${n}-setup-lore-budget`,className:`${n}-notice-input`,type:"number",min:i?.settings.loreTokenBudgetMin??200,max:i?.settings.loreTokenBudgetMax??3200,step:100,value:yo,disabled:I,onChange:u=>Jp(Number(u.target.value))}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,De===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${n}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":_e==="generate"?"true":"false","aria-pressed":_e==="generate",disabled:qt,onClick:()=>Vi("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":_e==="upload"?"true":"false","aria-pressed":_e==="upload",disabled:qt,onClick:()=>Vi("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":_e==="none"?"true":"false","aria-pressed":_e==="none",disabled:qt,onClick:()=>Vi("none"),children:"No background image"}),i?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":_e==="existing"?"true":"false","aria-pressed":_e==="existing",disabled:qt,onClick:()=>Vi("existing"),children:"Keep current map"}):null]}),_e==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,r.jsx)("summary",{className:`${n}-label`,children:"Advanced map elements"}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,r.jsx)("div",{className:`${n}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([u,p])=>(0,r.jsxs)("label",{className:`${n}-label`,children:[p,(0,r.jsxs)("select",{className:`${n}-select`,value:Nl[u],disabled:qt,onChange:N=>dg(z=>({...z,[u]:N.target.value})),children:[(0,r.jsx)("option",{value:"auto",children:"Auto"}),(0,r.jsx)("option",{value:"include",children:"Include"}),(0,r.jsx)("option",{value:"exclude",children:"Exclude"})]})]},u))})]}),(0,r.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,r.jsx)("summary",{className:`${n}-label`,children:"Testing prompt controls"}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${n}-setup-map-prompt`,className:`${n}-textarea`,value:$o,maxLength:1500,disabled:qt,onChange:u=>ed(u.target.value)}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-negative`,children:[(0,r.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,r.jsx)("textarea",{id:`${n}-setup-map-negative`,className:`${n}-textarea`,value:xo,maxLength:1500,disabled:qt,onChange:u=>td(u.target.value)}),(0,r.jsx)("span",{className:`${n}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,r.jsx)("div",{className:`${n}-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:qt||$o===i?.settings.townMapLayoutPrompt&&xo===i?.settings.townMapNegativePrompt,onClick:()=>{ed(i?.settings.townMapLayoutPrompt??""),td(i?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,r.jsx)("div",{className:`${n}-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:qt||Tt.trim().length===0,onClick:()=>{c$()},children:qt?"Generating map\u2026":Sl==="generate"?"Generate again":"Generate map"})})]}):null,_e==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:qt,"aria-label":"Choose a village map image",onChange:u=>{let p=u.target.files?.[0];u.target.value="",d$(p)}}),(0,r.jsx)("p",{className:`${n}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,_e==="none"?(0,r.jsx)("p",{className:`${n}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,jr&&_e!=="none"&&Sl===_e&&yg?(0,r.jsx)("p",{className:`${n}-hint`,"data-tone":Ip(jr).tone,children:Ip(jr).text}):null]}):null,De===3?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${n}-empty`,children:"Place your home, one to three villager homes, and a Gathering Place. Choose who lives where. Villages will draft the place details for you to review."}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||Ja||Je.filter(u=>u.classes?.includes("residence")).length>=1+Ro,onClick:()=>{Kt(!0),Ri(!1),Oi(null)},children:"Place a Residence"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||Ja||Je.some(u=>u.category==="public-center"),onClick:()=>{Kt(!1),Ri(!0),Oi(null)},children:"Place a Gathering Place"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||Ja||Je.length===0,onClick:()=>{Mi([]),Da(null),Gn(null),Oi(null),Kt(!1),Ri(!1)},children:"Reset all venues"})]}),ug?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:ug}):null,(0,r.jsx)("div",{className:`${n}-setup-venue-list`,children:Je.map(u=>(0,r.jsxs)("button",{type:"button",className:`${n}-setup-venue-card`,"data-selected":u.id===Br?"true":"false",onClick:()=>Da(u.id),children:[u.presentation.image?(0,r.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:u.name||"Unnamed venue"}),(0,r.jsxs)("small",{children:[u.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",u.occupancy.playerHome?"You":ra(u.occupancy.residentCharacterId)||"Choose a villager"]})]})]},u.id))}),xe&&vd?(0,r.jsxs)("div",{className:`${n}-setup-venue-editor`,children:[(0,r.jsxs)("h3",{className:`${n}-panel-title`,children:[xe.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",xe.name]}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Oi(xe.id),Kt(!1),Ri(!1)},children:"Move on map"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>y$(xe.id),children:"Remove venue"})]}),(0,r.jsxs)("label",{className:`${n}-label`,children:["Name",(0,r.jsx)("input",{id:`${n}-setup-venue-name`,className:`${n}-notice-input`,value:xe.name,maxLength:100,onChange:u=>Hi(xe.id,p=>({...p,name:u.target.value}))})]}),xe.category==="public-center"?(0,r.jsxs)("div",{className:`${n}-field`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||Ja,onClick:()=>{u$()},children:"Suggest three names"}),k1.map(u=>(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Hi(xe.id,p=>({...p,name:u})),children:u},u))]}):null,(0,r.jsxs)("p",{className:`${n}-hint`,children:["Class: ",os==="gathering"?"Gathering":"Residence"]}),(0,r.jsxs)("div",{className:`${n}-setup-form-field`,children:[(0,r.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-form`,children:"Form"}),(0,r.jsx)("textarea",{id:`${n}-setup-form`,className:`${n}-textarea`,rows:2,value:xe.form??"",maxLength:240,placeholder:DS[os][T1],onFocus:()=>Zu(!0),onBlur:()=>Zu(!1),onChange:u=>{Hi(xe.id,p=>({...p,form:u.target.value})),we("")}}),(0,r.jsx)("small",{className:`${n}-hint`,children:"What the Venue actually is"})]}),xe.category!=="public-center"?(0,r.jsxs)("label",{className:`${n}-label`,children:["Resident",(0,r.jsxs)("select",{className:`${n}-select`,value:xe.occupancy.residentCharacterId??"",disabled:xe.occupancy.playerHome,onChange:u=>Hi(xe.id,p=>({...p,residentIds:u.target.value?[u.target.value]:[],occupancy:{...p.occupancy,residentCharacterId:u.target.value||null}})),children:[(0,r.jsx)("option",{value:"",children:xe.occupancy.playerHome?"You":"Choose a villager"}),l.map(u=>(0,r.jsx)("option",{value:u.id,disabled:Je.some(p=>p.id!==xe.id&&p.occupancy.residentCharacterId===u.id),children:u.name},u.id))]})]}):null,(0,r.jsx)("div",{className:`${n}-setup-place-spaces`,children:["exterior","interior"].map(u=>{let p=u==="exterior",N=p?"Exterior":"Interior",z=p?xe.presentation.image:vd.image;return(0,r.jsxs)("section",{className:`${n}-setup-place-space`,children:[(0,r.jsx)("h4",{children:N}),(0,r.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-${u}-description`,children:[N," Description \xB7 required"]}),(0,r.jsx)("textarea",{id:`${n}-setup-${u}-description`,className:`${n}-textarea`,value:p?xe.description:vd.description,maxLength:1e3,onChange:_=>{let X=_.target.value;Hi(xe.id,$e=>p?{...$e,description:X}:{...$e,spaces:[{...$t($e,os),description:X}]}),we(""),Gn(null)}}),(0,r.jsxs)("span",{className:`${n}-label`,children:[N," Image \xB7 optional"]}),z?(0,r.jsx)("img",{className:`${n}-setup-image-preview`,src:z.url,alt:`${u} of ${xe.name}`}):(0,r.jsx)("p",{className:`${n}-hint`,children:"No image yet. A placeholder will be used."}),(0,r.jsxs)("div",{className:`${n}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:Ja,onClick:()=>{C$(xe,u)},children:z?`Regenerate ${N} Image`:`Generate ${N} Image`}),(0,r.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*",disabled:Ja,"aria-label":`Upload ${u} image for ${xe.name}`,onChange:_=>{let X=_.target.files?.[0];_.target.value="",z$(xe,u,X)}}),z?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Hi(xe.id,_=>p?{..._,presentation:{..._.presentation,image:null}}:{..._,spaces:[{...$t(_,os),image:null}]}),children:"Remove image"}):null]}),Lr?.venueId===xe.id&&Lr.area===u?(0,r.jsxs)("div",{className:`${n}-overlay`,children:[(0,r.jsx)("img",{className:`${n}-setup-image-preview`,src:Lr.image.url,alt:`New ${u} image preview`}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:A$,children:"Use this image"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Gn(null),children:"Discard"})]}):null]},u)})})]}):(0,r.jsx)("p",{className:`${n}-hint`,children:"Place or select a venue to edit it."}),s===null?(0,r.jsx)("p",{className:`${n}-hint`,children:"Reading your villager library\u2026"}):null]}):null,De===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${n}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,r.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Village Beginning"}),(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsx)("strong",{children:Ka.trim()})," \xB7 ",Tt.trim()]}),(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsx)("strong",{children:"Persona:"})," ",Vt?.find(u=>u.id===Z)?.name??"Selected Persona"," \xB7 ",(0,r.jsx)("strong",{children:"Scenario:"})," ",go(xn).label]}),(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsx)("strong",{children:"Day 1:"})," ",ya||"No first-day description was recorded."]}),qr?(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsx)("strong",{children:"Original founding direction:"})," ",qr]}):null]}),(0,r.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Map and lore"}),(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsx)("strong",{children:"Map:"})," ",_e==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,r.jsx)("strong",{children:"Lorebooks:"})," ",Va.map(u=>Yu?.find(p=>p.id===u)?.name??u).join(", ")||"None"]})]}),(0,r.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Starting places"}),(0,r.jsx)("div",{className:`${n}-setup-venue-list`,children:Je.map(u=>(0,r.jsxs)("div",{className:`${n}-setup-venue-card`,children:[u.presentation.image?(0,r.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsxs)("strong",{children:[u.name," \xB7 ",u.category==="public-center"?"Gathering Place":"Residence"]}),(0,r.jsxs)("small",{children:[u.form," \xB7"," ",u.occupancy.playerHome?"You":ra(u.occupancy.residentCharacterId)||"Community"]})]})]},u.id))}),Je.map(u=>(0,r.jsxs)("p",{className:`${n}-hint`,children:[(0,r.jsxs)("strong",{children:[u.name,":"]})," ",u.description," ",u.spaces?.[0]?.description]},`${u.id}-summary`))]})]}):null,fg?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:fg}):null,Bt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Bt}):null]})}),(0,r.jsxs)("div",{className:`${n}-setup-visual`,children:[De<=1?(0,r.jsx)(p2,{scenario:xn}):(0,r.jsx)("div",{className:`${n}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${n}-setup-map-viewport`,children:(0,r.jsx)(Up,{src:Di,alt:`A map of ${Ka.trim()||"your new village"}.`,pins:De<3?[]:q$,placing:De===3&&(Ai||bl||Ku!==null),view:_e==="existing"?So:Uu("cover"),shape:yg,onPlace:De===3?v$:void 0,compact:De<2,mobile:t&&De>=2,photoPins:De>=3})})}),(0,r.jsxs)("nav",{className:`${n}-setup-footer`,"aria-label":"Founding navigation",children:[De>0?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I||qt||Ja,onClick:()=>Bg(De-1),children:"\u2190 Back"}):null,De<_u.length-1?(0,r.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:I||qt||Ja,onClick:()=>Bg(De+1),children:"Next \u2192"}):(0,r.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:I||qt||!i,onClick:()=>{R$()},children:i?.isFounded?"Save this village":"Found the village"}),i?.isFounded?(0,r.jsx)("button",{type:"button",className:`${n}-button`,disabled:I,onClick:()=>{Kt(!1),ae("home")},children:"Show me the village"}):null]})]})]})})}return(0,r.jsxs)("div",{className:`${n}-root ${n}-home ${n}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${n}-home-bar`,children:[(0,r.jsx)(o2,{weather:i?.village.weather??""}),!t&&i?.isFounded&&jn(i.settings.venues).length>0?(0,r.jsxs)("div",{className:`${n}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-button`,"aria-expanded":St,"aria-controls":`${n}-places-list`,disabled:I,onClick:()=>{He(null),Ke(l=>!l)},children:"Places"}),St?(0,r.jsx)("div",{id:`${n}-places-list`,className:`${n}-places-list`,children:i.settings.venues.map(l=>(0,r.jsxs)("div",{className:`${n}-places-list-row`,children:[(0,r.jsx)("span",{className:`${n}-places-list-name`,children:l.name}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ul(l),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{ql(l)},children:"Visit"})]},l.id))}):null]}):null,(0,r.jsxs)("span",{className:`${n}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${n}-mobile-board-button`,"aria-label":`Noticeboard (${i?.noticeboard.length??0})`,disabled:!i||I,onClick:()=>et("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),i?.isFounded?(0,r.jsx)(l2,{happenings:i.happenings,recap:i.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${n}-button ${n}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:I||!i,onClick:()=>{Qa("index"),ae("menu")},children:"\u2630"}),t?null:(0,r.jsx)(s2,{}),Ai?(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Kt(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${n}-room`,children:(0,r.jsx)("div",{className:`${n}-home-map-viewport`,children:(0,r.jsx)(Up,{src:zl,alt:`A map of ${i?.village.name??"the village"}.`,pins:U$,placing:Ai,view:So,shape:vg,onPlace:w$,onDismiss:()=>{He(null),Ke(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Kr||Bt||Ai||Dl||dd?(0,r.jsxs)("div",{className:`${n}-notice`,children:[Kr?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Kr}):null,Bt?(0,r.jsx)("p",{className:`${n}-error`,role:"alert",children:Bt}):null,Ai?(0,r.jsx)("span",{className:`${n}-status`,children:"Click the map where the house stands."}):null,Dl?(0,r.jsxs)("span",{className:`${n}-status`,children:["Catching up on what ",i?.village.name??"the village"," has been doing\u2026"]}):null,dd?(0,r.jsx)("p",{className:`${n}-status`,children:dd}):null]}):null})})})]})}var Yp=class extends HTMLElement{connectedCallback(){Y0(),this.__root??(this.__root=(0,l1.createRoot)(this)),this.__root.render((0,r.jsx)(jp,{element:this,children:(0,r.jsx)(z2,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),Y0()})}};function z2({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let i=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",i),()=>e.removeEventListener("marinara-capability-props",i)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(O2,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(M2,{props:e.capabilityProps??{}}):(0,r.jsx)(C2,{element:e})}function A2(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var R2="marinara-active-chat-id";function b1(){try{window.localStorage.removeItem(R2)}catch{}window.location.reload()}function v1(e,t){let[a,i]=(0,m.useState)(null),[o,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(s(!1),i(null),!t)return;let c=new AbortController;return(async()=>{try{let d=await D(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;i(d??null),s(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:o}}function M2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",i=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:s,known:c}=v1(t,a&&t.length>0),[d,h]=(0,m.useState)(!1),f=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!d)return;let b=E=>{f.current?.contains(E.target)||h(!1)},C=E=>{E.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",b),document.addEventListener("keydown",C),()=>{document.removeEventListener("pointerdown",b),document.removeEventListener("keydown",C)}},[d]),!a||!c||s===null)return null;let $=s.name||"your villager",x=s.villageName||"your village",g=`Villages \u2014 this roleplay spun off from ${x}`;return(0,r.jsxs)("span",{className:`${n}-tracker`,"data-compact":i,"data-open":d,ref:f,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${n}-tracker-chip`:`${n}-button ${n}-tracker-chip`,onClick:()=>h(b=>!b),"aria-haspopup":"menu","aria-expanded":d,title:g,"aria-label":g,children:[(0,r.jsx)(A2,{}),(0,r.jsx)("span",{className:`${n}-tracker-label`,children:"Villages"})]}),d?(0,r.jsxs)("div",{className:`${n}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${x}`,children:[(0,r.jsxs)("p",{className:`${n}-tracker-menu-title`,children:["This roleplay spun off from ",x]}),s.resident?(0,r.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[$," still lives there. ",x," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[$," does not live in ",x," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${n}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${n}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:b1,title:`Leaves this chat and opens Marinara's home screen, where the ${x} tab is waiting.`,children:"Open the village"})})]}):null]})}function O2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:i,known:o}=v1(t,a&&t.length>0);if(!a||!o)return null;if(i===null)return(0,r.jsx)("div",{className:`${n}-panel-view`,children:(0,r.jsx)("p",{className:`${n}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let s=i.name||"this villager",c=i.villageName||"your village";return(0,r.jsxs)("div",{className:`${n}-panel-view`,children:[(0,r.jsx)("p",{className:`${n}-tracker-menu-note`,children:i.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${s} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${n}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:s})]}),(0,r.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${n}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:i.room})]}),(0,r.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${n}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:c})]}),(0,r.jsx)("div",{className:`${n}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${n}-button`,onClick:b1,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(n)||customElements.define(n,Yp);
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
