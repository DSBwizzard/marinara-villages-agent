var z$=Object.create;var hd=Object.defineProperty;var A$=Object.getOwnPropertyDescriptor;var M$=Object.getOwnPropertyNames;var R$=Object.getPrototypeOf,O$=Object.prototype.hasOwnProperty;var V$=(e,t,a)=>t in e?hd(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var Ja=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var D$=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of M$(t))!O$.call(e,o)&&o!==a&&hd(e,o,{get:()=>t[o],enumerable:!(n=A$(t,o))||n.enumerable});return e};var Ds=(e,t,a)=>(a=e!=null?z$(R$(e)):{},D$(t||!e||!e.__esModule?hd(a,"default",{value:e,enumerable:!0}):a,e));var Hg=(e,t,a)=>V$(e,typeof t!="symbol"?t+"":t,a);var Jg=Ja(te=>{"use strict";var gd=Symbol.for("react.transitional.element"),_$=Symbol.for("react.portal"),H$=Symbol.for("react.fragment"),U$=Symbol.for("react.strict_mode"),I$=Symbol.for("react.profiler"),q$=Symbol.for("react.consumer"),B$=Symbol.for("react.context"),L$=Symbol.for("react.forward_ref"),j$=Symbol.for("react.suspense"),G$=Symbol.for("react.memo"),Lg=Symbol.for("react.lazy"),Y$=Symbol.for("react.activity"),X$=Symbol.for("react.view_transition"),Ug=Symbol.iterator;function Q$(e){return e===null||typeof e!="object"?null:(e=Ug&&e[Ug]||e["@@iterator"],typeof e=="function"?e:null)}var jg={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Gg=Object.assign,Yg={};function Co(e,t,a){this.props=e,this.context=t,this.refs=Yg,this.updater=a||jg}Co.prototype.isReactComponent={};Co.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Co.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Xg(){}Xg.prototype=Co.prototype;function fd(e,t,a){this.props=e,this.context=t,this.refs=Yg,this.updater=a||jg}var bd=fd.prototype=new Xg;bd.constructor=fd;Gg(bd,Co.prototype);bd.isPureReactComponent=!0;var Ig=Array.isArray;function pd(){}var _e={H:null,A:null,T:null,S:null},Qg=Object.prototype.hasOwnProperty;function vd(e,t,a){var n=a.ref;return{$$typeof:gd,type:e,key:t,ref:n!==void 0?n:null,props:a}}function Z$(e,t){return vd(e.type,t,e.props)}function yd(e){return typeof e=="object"&&e!==null&&e.$$typeof===gd}function K$(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var qg=/\/+/g;function md(e,t){return typeof e=="object"&&e!==null&&e.key!=null?K$(""+e.key):t.toString(36)}function J$(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(pd,pd):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Eo(e,t,a,n,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(l){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case gd:case _$:c=!0;break;case Lg:return c=e._init,Eo(c(e._payload),t,a,n,o)}}if(c)return o=o(e),c=n===""?"."+md(e,0):n,Ig(o)?(a="",c!=null&&(a=c.replace(qg,"$&/")+"/"),Eo(o,t,a,"",function(g){return g})):o!=null&&(yd(o)&&(o=Z$(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(qg,"$&/")+"/")+c)),t.push(o)),1;c=0;var u=n===""?".":n+":";if(Ig(e))for(var h=0;h<e.length;h++)n=e[h],l=u+md(n,h),c+=Eo(n,t,a,l,o);else if(h=Q$(e),typeof h=="function")for(e=h.call(e),h=0;!(n=e.next()).done;)n=n.value,l=u+md(n,h++),c+=Eo(n,t,a,l,o);else if(l==="object"){if(typeof e.then=="function")return Eo(J$(e),t,a,n,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function _s(e,t,a){if(e==null)return e;var n=[],o=0;return Eo(e,n,"","",function(l){return t.call(a,l,o++)}),n}function F$(e){if(e._status===-1){var t=e._result,a=t();a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n,a.status===void 0&&(a.status="fulfilled",a.value=n))},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n,a.status===void 0&&(a.status="rejected",a.reason=n))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var Bg=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Zg(e){var t=_e.T,a={};a.types=t!==null?t.types:null,_e.T=a;try{var n=e(),o=_e.S;o!==null&&o(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(pd,Bg)}catch(l){Bg(l)}finally{t!==null&&a.types!==null&&(t.types=a.types),_e.T=t}}function Kg(e){var t=_e.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else Zg(Kg.bind(null,e))}var P$={map:_s,forEach:function(e,t,a){_s(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return _s(e,function(){t++}),t},toArray:function(e){return _s(e,function(t){return t})||[]},only:function(e){if(!yd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};te.Activity=Y$;te.Children=P$;te.Component=Co;te.Fragment=H$;te.Profiler=I$;te.PureComponent=fd;te.StrictMode=U$;te.Suspense=j$;te.ViewTransition=X$;te.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=_e;te.__COMPILER_RUNTIME={__proto__:null,c:function(e){return _e.H.useMemoCache(e)}};te.addTransitionType=Kg;te.cache=function(e){return function(){return e.apply(null,arguments)}};te.cacheSignal=function(){return null};te.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var n=Gg({},e.props),o=e.key;if(t!=null)for(l in t.key!==void 0&&(o=""+t.key),t)!Qg.call(t,l)||l==="key"||l==="__self"||l==="__source"||l==="ref"&&t.ref===void 0||(n[l]=t[l]);var l=arguments.length-2;if(l===1)n.children=a;else if(1<l){for(var c=Array(l),u=0;u<l;u++)c[u]=arguments[u+2];n.children=c}return vd(e.type,o,n)};te.createContext=function(e){return e={$$typeof:B$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:q$,_context:e},e};te.createElement=function(e,t,a){var n,o={},l=null;if(t!=null)for(n in t.key!==void 0&&(l=""+t.key),t)Qg.call(t,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(o[n]=t[n]);var c=arguments.length-2;if(c===1)o.children=a;else if(1<c){for(var u=Array(c),h=0;h<c;h++)u[h]=arguments[h+2];o.children=u}if(e&&e.defaultProps)for(n in c=e.defaultProps,c)o[n]===void 0&&(o[n]=c[n]);return vd(e,l,o)};te.createRef=function(){return{current:null}};te.forwardRef=function(e){return{$$typeof:L$,render:e}};te.isValidElement=yd;te.lazy=function(e){return{$$typeof:Lg,_payload:{_status:-1,_result:e},_init:F$}};te.memo=function(e,t){return{$$typeof:G$,type:e,compare:t===void 0?null:t}};te.startTransition=Zg;te.unstable_useCacheRefresh=function(){return _e.H.useCacheRefresh()};te.use=function(e){return _e.H.use(e)};te.useActionState=function(e,t,a){return _e.H.useActionState(e,t,a)};te.useCallback=function(e,t){return _e.H.useCallback(e,t)};te.useContext=function(e){return _e.H.useContext(e)};te.useDebugValue=function(){};te.useDeferredValue=function(e,t){return _e.H.useDeferredValue(e,t)};te.useEffect=function(e,t){return _e.H.useEffect(e,t)};te.useEffectEvent=function(e){return _e.H.useEffectEvent(e)};te.useId=function(){return _e.H.useId()};te.useImperativeHandle=function(e,t,a){return _e.H.useImperativeHandle(e,t,a)};te.useInsertionEffect=function(e,t){return _e.H.useInsertionEffect(e,t)};te.useLayoutEffect=function(e,t){return _e.H.useLayoutEffect(e,t)};te.useMemo=function(e,t){return _e.H.useMemo(e,t)};te.useOptimistic=function(e,t){return _e.H.useOptimistic(e,t)};te.useReducer=function(e,t,a){return _e.H.useReducer(e,t,a)};te.useRef=function(e){return _e.H.useRef(e)};te.useState=function(e){return _e.H.useState(e)};te.useSyncExternalStore=function(e,t,a){return _e.H.useSyncExternalStore(e,t,a)};te.useTransition=function(){return _e.H.useTransition()};te.version="19.3.0"});var Hs=Ja((v2,Fg)=>{"use strict";Fg.exports=Jg()});var sf=Ja(Le=>{"use strict";function Nd(e,t){var a=e.length;e.push(t);e:for(;0<a;){var n=a-1>>>1,o=e[n];if(0<Us(o,t))e[n]=t,e[a]=o,a=n;else break e}}function Fa(e){return e.length===0?null:e[0]}function qs(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var n=0,o=e.length,l=o>>>1;n<l;){var c=2*(n+1)-1,u=e[c],h=c+1,g=e[h];if(0>Us(u,a))h<o&&0>Us(g,u)?(e[n]=g,e[h]=a,n=h):(e[n]=u,e[c]=a,n=c);else if(h<o&&0>Us(g,a))e[n]=g,e[h]=a,n=h;else break e}}return t}function Us(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Le.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(Pg=performance,Le.unstable_now=function(){return Pg.now()}):(wd=Date,Wg=wd.now(),Le.unstable_now=function(){return wd.now()-Wg});var Pg,wd,Wg,yn=[],Bn=[],W$=1,ba=null,kt=3,Sd=!1,Fr=!1,Pr=!1,Td=!1,af=typeof setTimeout=="function"?setTimeout:null,nf=typeof clearTimeout=="function"?clearTimeout:null,ef=typeof setImmediate<"u"?setImmediate:null;function Is(e){for(var t=Fa(Bn);t!==null;){if(t.callback===null)qs(Bn);else if(t.startTime<=e)qs(Bn),t.sortIndex=t.expirationTime,Nd(yn,t);else break;t=Fa(Bn)}}function kd(e){if(Pr=!1,Is(e),!Fr)if(Fa(yn)!==null)Fr=!0,Ao||(Ao=!0,zo());else{var t=Fa(Bn);t!==null&&Ed(kd,t.startTime-e)}}var Ao=!1,Wr=-1,of=5,rf=-1;function lf(){return Td?!0:!(Le.unstable_now()-rf<of)}function $d(){if(Td=!1,Ao){var e=Le.unstable_now();rf=e;var t=!0;try{e:{Fr=!1,Pr&&(Pr=!1,nf(Wr),Wr=-1),Sd=!0;var a=kt;try{t:{for(Is(e),ba=Fa(yn);ba!==null&&!(ba.expirationTime>e&&lf());){var n=ba.callback;if(typeof n=="function"){ba.callback=null,kt=ba.priorityLevel;var o=n(ba.expirationTime<=e);if(e=Le.unstable_now(),typeof o=="function"){ba.callback=o,Is(e),t=!0;break t}ba===Fa(yn)&&qs(yn),Is(e)}else qs(yn);ba=Fa(yn)}if(ba!==null)t=!0;else{var l=Fa(Bn);l!==null&&Ed(kd,l.startTime-e),t=!1}}break e}finally{ba=null,kt=a,Sd=!1}t=void 0}}finally{t?zo():Ao=!1}}}var zo;typeof ef=="function"?zo=function(){ef($d)}:typeof MessageChannel<"u"?(xd=new MessageChannel,tf=xd.port2,xd.port1.onmessage=$d,zo=function(){tf.postMessage(null)}):zo=function(){af($d,0)};var xd,tf;function Ed(e,t){Wr=af(function(){e(Le.unstable_now())},t)}Le.unstable_IdlePriority=5;Le.unstable_ImmediatePriority=1;Le.unstable_LowPriority=4;Le.unstable_NormalPriority=3;Le.unstable_Profiling=null;Le.unstable_UserBlockingPriority=2;Le.unstable_cancelCallback=function(e){e.callback=null};Le.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):of=0<e?Math.floor(1e3/e):5};Le.unstable_getCurrentPriorityLevel=function(){return kt};Le.unstable_next=function(e){switch(kt){case 1:case 2:case 3:var t=3;break;default:t=kt}var a=kt;kt=t;try{return e()}finally{kt=a}};Le.unstable_requestPaint=function(){Td=!0};Le.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=kt;kt=e;try{return t()}finally{kt=a}};Le.unstable_scheduleCallback=function(e,t,a){var n=Le.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:W$++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>n?(e.sortIndex=a,Nd(Bn,e),Fa(yn)===null&&e===Fa(Bn)&&(Pr?(nf(Wr),Wr=-1):Pr=!0,Ed(kd,a-n))):(e.sortIndex=o,Nd(yn,e),Fr||Sd||(Fr=!0,Ao||(Ao=!0,zo()))),e};Le.unstable_shouldYield=lf;Le.unstable_wrapCallback=function(e){var t=kt;return function(){var a=kt;kt=t;try{return e.apply(this,arguments)}finally{kt=a}}}});var uf=Ja((w2,cf)=>{"use strict";cf.exports=sf()});var mf=Ja(Et=>{"use strict";var ex=Hs();function hf(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Ln(){}var Vt={d:{f:Ln,r:function(){throw Error(hf(522))},D:Ln,C:Ln,L:Ln,m:Ln,X:Ln,S:Ln,M:Ln},p:0,findDOMNode:null},tx=Symbol.for("react.portal"),ax=Symbol.for("react.recoverable"),df=Symbol.for("react.optimistic_key");function nx(e,t,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:tx,key:n==null?null:n===df?df:""+n,children:e,containerInfo:t,implementation:a}}var el=ex.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Bs(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Et.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Vt;Et.browser=function(e){return{$$typeof:ax,_reason:e}};Et.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(hf(299));return nx(e,t,null,a)};Et.flushSync=function(e){var t=el.T,a=Vt.p;try{if(el.T=null,Vt.p=2,e)return e()}finally{el.T=t,Vt.p=a,Vt.d.f()}};Et.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Vt.d.C(e,t))};Et.prefetchDNS=function(e){typeof e=="string"&&Vt.d.D(e)};Et.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,n=Bs(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,l=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?Vt.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:n,integrity:o,fetchPriority:l}):a==="script"&&Vt.d.X(e,{crossOrigin:n,integrity:o,fetchPriority:l,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Et.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=Bs(t.as,t.crossOrigin);Vt.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&Vt.d.M(e)};Et.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,n=Bs(a,t.crossOrigin);Vt.d.L(e,a,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Et.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=Bs(t.as,t.crossOrigin);Vt.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else Vt.d.m(e)};Et.requestFormReset=function(e){Vt.d.r(e)};Et.unstable_batchedUpdates=function(e,t){return e(t)};Et.useFormState=function(e,t,a){return el.H.useFormState(e,t,a)};Et.useFormStatus=function(){return el.H.useHostTransitionStatus()};Et.version="19.3.0"});var ff=Ja((x2,gf)=>{"use strict";function pf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(pf)}catch(e){console.error(e)}}pf(),gf.exports=mf()});var a0=Ja(xu=>{"use strict";var st=uf(),tv=Hs(),ix=ff();function M(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function av(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Bl(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function nv(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function iv(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function bf(e){if(Bl(e)!==e)throw Error(M(188))}function ox(e){var t=e.alternate;if(!t){if(t=Bl(e),t===null)throw Error(M(188));return t!==e?null:e}for(var a=e,n=t;;){var o=a.return;if(o===null)break;var l=o.alternate;if(l===null){if(n=o.return,n!==null){a=n;continue}break}if(o.child===l.child){for(l=o.child;l;){if(l===a)return bf(o),e;if(l===n)return bf(o),t;l=l.sibling}throw Error(M(188))}if(a.return!==n.return)a=o,n=l;else{for(var c=!1,u=o.child;u;){if(u===a){c=!0,a=o,n=l;break}if(u===n){c=!0,n=o,a=l;break}u=u.sibling}if(!c){for(u=l.child;u;){if(u===a){c=!0,a=l,n=o;break}if(u===n){c=!0,n=l,a=o;break}u=u.sibling}if(!c)throw Error(M(189))}}if(a.alternate!==n)throw Error(M(190))}if(a.tag!==3)throw Error(M(188));return a.stateNode.current===a?e:t}function ov(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=ov(e),t!==null)return t;e=e.sibling}return null}function Kt(e,t,a,n,o,l){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,n,o,l)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Kt(e.child,t,a,n,o,l))return!0;e=e.sibling}return!1}function Fi(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function vf(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function rv(e){var t=[null,null],a=Fi(e);return a===null||lv(t,e,a.child,{foundSelf:!1}),t}function lv(e,t,a,n){for(;a!==null;){if(a===t)n.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(n.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&lv(e,t,a.child,n))return!0;a=a.sibling}return!1}function lt(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(M(559))}}var Ho=null,oh=null;function rx(e,t,a){return e===a?!0:e===t?(Ho=e,!0):!1}function lx(e,t,a){return e===a?(oh=e,!1):e===t?(oh!==null&&(Ho=e),!0):!1}function yf(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function rh(e,t,a){for(var n=0,o=e;o;o=a(o))n++;o=0;for(var l=t;l;l=a(l))o++;for(;0<n-o;)e=a(e),n--;for(;0<o-n;)t=a(t),o--;for(;n--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var Ve=Object.assign,sx=Symbol.for("react.element"),Ls=Symbol.for("react.transitional.element"),ll=Symbol.for("react.portal"),Uo=Symbol.for("react.fragment"),sv=Symbol.for("react.strict_mode"),lh=Symbol.for("react.profiler"),cv=Symbol.for("react.consumer"),nn=Symbol.for("react.context"),fm=Symbol.for("react.forward_ref"),sh=Symbol.for("react.suspense"),ch=Symbol.for("react.suspense_list"),bm=Symbol.for("react.memo"),Xn=Symbol.for("react.lazy"),uh=Symbol.for("react.activity"),cx=Symbol.for("react.legacy_hidden"),ux=Symbol.for("react.memo_cache_sentinel"),dh=Symbol.for("react.view_transition"),dx=Symbol.for("react.recoverable"),wf=Symbol.iterator;function tl(e){return e===null||typeof e!="object"?null:(e=wf&&e[wf]||e["@@iterator"],typeof e=="function"?e:null)}var hx=Symbol.for("react.client.reference");function hh(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===hx?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Uo:return"Fragment";case lh:return"Profiler";case sv:return"StrictMode";case sh:return"Suspense";case ch:return"SuspenseList";case uh:return"Activity";case dh:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case ll:return"Portal";case nn:return e.displayName||"Context";case cv:return(e._context.displayName||"Context")+".Consumer";case fm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case bm:return t=e.displayName||null,t!==null?t:hh(e.type)||"Memo";case Xn:t=e._payload,e=e._init;try{return hh(e(t))}catch{}}return null}var sl=Array.isArray,ee=tv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,xe=ix.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ui={pending:!1,data:null,method:null,action:null},mh=[],Io=-1;function dn(e){return{current:e}}function wt(e){0>Io||(e.current=mh[Io],mh[Io]=null,Io--)}function Ie(e,t){Io++,mh[Io]=e.current,e.current=t}var sn=dn(null),Tl=dn(null),ti=dn(null),Cc=dn(null);function zc(e,t){switch(Ie(ti,t),Ie(Tl,e),Ie(sn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Vb(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Vb(t),e=Mw(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}wt(sn),Ie(sn,e)}function or(){wt(sn),wt(Tl),wt(ti)}function ph(e){var t=e.memoizedState;t!==null&&(gr._currentValue=t.memoizedState,Ie(Cc,e)),t=sn.current;var a=Mw(t,e.type);t!==a&&(Ie(Tl,e),Ie(sn,a))}function Ac(e){Tl.current===e&&(wt(sn),wt(Tl)),Cc.current===e&&(wt(Cc),gr._currentValue=Ui)}var Cd,$f;function Gn(e){if(Cd===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Cd=t&&t[1]||"",$f=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Cd+e+$f}var zd=!1;function Ad(e,t){if(!e||zd)return"";zd=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var x=function(){throw Error()};if(Object.defineProperty(x.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(x,[])}catch(C){var f=C}Reflect.construct(e,[],x)}else{try{x.call()}catch(C){f=C}x=!1;try{var b=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),x=!0,new e}finally{x&&(b!==void 0?Object.defineProperty(e.prototype,"props",b):delete e.prototype.props)}}}else{try{throw Error()}catch(C){f=C}(x=e())&&typeof x.catch=="function"&&x.catch(function(){})}}catch(C){if(C&&f&&typeof C.stack=="string")return[C.stack,f.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var l=n.DetermineComponentFrameRoot(),c=l[0],u=l[1];if(c&&u){var h=c.split(`
`),g=u.split(`
`);for(o=n=0;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;for(;o<g.length&&!g[o].includes("DetermineComponentFrameRoot");)o++;if(n===h.length||o===g.length)for(n=h.length-1,o=g.length-1;1<=n&&0<=o&&h[n]!==g[o];)o--;for(;1<=n&&0<=o;n--,o--)if(h[n]!==g[o]){if(n!==1||o!==1)do if(n--,o--,0>o||h[n]!==g[o]){var $=`
`+h[n].replace(" at new "," at ");return e.displayName&&$.includes("<anonymous>")&&($=$.replace("<anonymous>",e.displayName)),$}while(1<=n&&0<=o);break}}}finally{zd=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Gn(a):""}function mx(e,t){switch(e.tag){case 26:case 27:case 5:return Gn(e.type);case 16:return Gn("Lazy");case 13:return e.child!==t&&t!==null?Gn("Suspense Fallback"):Gn("Suspense");case 19:return Gn("SuspenseList");case 0:case 15:return Ad(e.type,!1);case 11:return Ad(e.type.render,!1);case 1:return Ad(e.type,!0);case 31:return Gn("Activity");case 30:return Gn("ViewTransition");default:return""}}function xf(e){try{var t="",a=null;do t+=mx(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var gh=Object.prototype.hasOwnProperty,vm=st.unstable_scheduleCallback,Md=st.unstable_cancelCallback,px=st.unstable_shouldYield,gx=st.unstable_requestPaint,oa=st.unstable_now,fx=st.unstable_getCurrentPriorityLevel,uv=st.unstable_ImmediatePriority,dv=st.unstable_UserBlockingPriority,Mc=st.unstable_NormalPriority,bx=st.unstable_LowPriority,hv=st.unstable_IdlePriority,vx=st.log,yx=st.unstable_setDisableYieldValue,Ll=null,ra=null;function Kn(e){if(typeof vx=="function"&&yx(e),ra&&typeof ra.setStrictMode=="function")try{ra.setStrictMode(Ll,e)}catch{}}var la=Math.clz32?Math.clz32:xx,wx=Math.log,$x=Math.LN2;function xx(e){return e>>>=0,e===0?32:31-(wx(e)/$x|0)|0}var js=256,Gs=262144,Ys=4194304;function Oi(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function nu(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var o=0,l=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var u=n&134217727;return u!==0?(n=u&~l,n!==0?o=Oi(n):(c&=u,c!==0?o=Oi(c):a||(a=u&~e,a!==0&&(o=Oi(a))))):(u=n&~l,u!==0?o=Oi(u):c!==0?o=Oi(c):a||(a=n&~e,a!==0&&(o=Oi(a)))),o===0?0:t!==0&&t!==o&&(t&l)===0&&(l=o&-o,a=t&-t,l>=a||l===32&&(a&4194048)!==0)?t:o}function jl(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function mv(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-la(a),o=1<<n;t|=e[n],a&=~o}return t}function Nx(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function pv(){var e=Ys;return Ys<<=1,(Ys&62914560)===0&&(Ys=4194304),e}function Rd(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Gl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Sx(e,t,a,n,o,l){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var u=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=c&~a;0<a;){var $=31-la(a),x=1<<$;u[$]=0,h[$]=-1;var f=g[$];if(f!==null)for(g[$]=null,$=0;$<f.length;$++){var b=f[$];b!==null&&(b.lane&=-536870913)}a&=~x}n!==0&&gv(e,n,0),l!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=l&~(c&~t))}function gv(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-la(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function fv(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-la(a),o=1<<n;o&t|e[n]&t&&(e[n]|=t),a&=~o}}function bv(e,t){var a=t&-t;return a=(a&42)!==0?1:ym(a),(a&(e.suspendedLanes|t))!==0?0:a}function ym(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function wm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function vv(){var e=xe.p;return e!==0?e:(e=window.event,e===void 0?32:Ww(e.type))}function Nf(e,t){var a=xe.p;try{return xe.p=e,t()}finally{xe.p=a}}var Rn=Math.random().toString(36).slice(2),vt="__reactFiber$"+Rn,Jt="__reactProps$"+Rn,vr="__reactContainer$"+Rn,Sf="__reactEvents$"+Rn,Tx="__reactListeners$"+Rn,kx="__reactHandles$"+Rn,Tf="__reactResources$"+Rn,Yl="__reactMarker$"+Rn,Rc="__reactLoad$"+Rn;function iu(e){delete e[vt],delete e[Jt],delete e[Tx],delete e[kx]}function _i(e){var t;if(t=e[vt])return t;for(var a=e.parentNode;a;){if(t=a[vr]||a[vt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=Lb(e);e!==null;){if(a=e[vt])return a;e=Lb(e)}return t}e=a,a=e.parentNode}return null}function yr(e){if(e=e[vt]||e[vr]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function cl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(M(33))}function Ko(e){var t=e[Tf];return t||(t=e[Tf]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function dt(e){e[Yl]=!0}function yv(e){e[Rc]=void 0}var wv=new Set,$v={};function Pi(e,t){rr(e,t),rr(e+"Capture",t)}function rr(e,t){for($v[e]=t,e=0;e<t.length;e++)wv.add(t[e])}var Ex=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),kf={},Ef={};function Cx(e){return gh.call(Ef,e)?!0:gh.call(kf,e)?!1:Ex.test(e)?Ef[e]=!0:(kf[e]=!0,!1)}var ye=!1;function Cf(){var e=ye;return ye=!1,e}function cc(e,t,a){if(Cx(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function Xs(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function wn(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,n)}}function ta(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function xv(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function zx(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(c){a=""+c,l.call(this,c)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function fh(e){if(!e._valueTracker){var t=xv(e)?"checked":"value";e._valueTracker=zx(e,t,""+e[t])}}function Nv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=xv(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}var Ax=/[\n"\\]/g;function xa(e){return e.replace(Ax,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function bh(e,t,a,n,o,l,c,u){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+ta(t)):e.value!==""+ta(t)&&(e.value=""+ta(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?Od(e,ta(e.value)):Od(e,ta(t)):a!=null?Od(e,ta(a)):n!=null&&e.removeAttribute("value"),o==null&&l!=null&&(e.defaultChecked=!!l),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?e.name=""+ta(u):e.removeAttribute("name")}function Sv(e,t,a,n,o,l,c,u){if(l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"&&(e.type=l),t!=null||a!=null){if(!(l!=="submit"&&l!=="reset"||t!=null)){fh(e);return}a=a!=null?""+ta(a):"",t=t!=null?""+ta(t):a,u||t===e.value||(e.value=t),e.defaultValue=t}n=n??o,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=u?e.checked:!!n,e.defaultChecked=!!n,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),fh(e)}function Od(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function Jo(e,t,a,n){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&n&&(e[a].defaultSelected=!0)}else{for(a=""+ta(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,n&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function Tv(e,t,a){if(t!=null&&(t=""+ta(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+ta(a):""}function kv(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(M(92));if(sl(n)){if(1<n.length)throw Error(M(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=ta(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),fh(e)}function lr(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var Mx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function zf(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||Mx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Ev(e,t,a){if(t!=null&&typeof t!="object")throw Error(M(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="",ye=!0);for(var o in t)n=t[o],t.hasOwnProperty(o)&&a[o]!==n&&(zf(e,o,n),ye=!0)}else for(var l in t)t.hasOwnProperty(l)&&zf(e,l,t[l])}function $m(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Rx=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Ox=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function uc(e){return Ox.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function on(){}var vh=null;function xm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var qo=null,Fo=null;function Af(e){var t=yr(e);if(t&&(e=t.stateNode)){var a=e[Jt]||null;e:switch(e=t.stateNode,t.type){case"input":if(bh(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+xa(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var o=n[Jt]||null;if(!o)throw Error(M(90));bh(n,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&Nv(n)}break e;case"textarea":Tv(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&Jo(e,!!a.multiple,t,!1)}}}var Vd=!1;function Cv(e,t,a){if(Vd)return e(t,a);Vd=!0;try{var n=e(t);return n}finally{if(Vd=!1,(qo!==null||Fo!==null)&&(vu(),qo&&(t=qo,e=Fo,Fo=qo=null,Af(t),e)))for(t=0;t<e.length;t++)Af(e[t])}}function kl(e,t){var a=e.stateNode;if(a===null)return null;var n=a[Jt]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(M(231,t,typeof a));return a}var kn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),yh=!1;if(kn)try{Mo={},Object.defineProperty(Mo,"passive",{get:function(){yh=!0}}),window.addEventListener("test",Mo,Mo),window.removeEventListener("test",Mo,Mo)}catch{yh=!1}var Mo,Jn=null,Nm=null,dc=null;function zv(){if(dc)return dc;var e,t=Nm,a=t.length,n,o="value"in Jn?Jn.value:Jn.textContent,l=o.length;for(e=0;e<a&&t[e]===o[e];e++);var c=a-e;for(n=1;n<=c&&t[a-n]===o[l-n];n++);return dc=o.slice(e,1<n?1-n:void 0)}function hc(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Qs(){return!0}function Mf(){return!1}function Ut(e){function t(a,n,o,l,c){this._reactName=a,this._targetInst=o,this.type=n,this.nativeEvent=l,this.target=c,this.currentTarget=null;for(var u in e)e.hasOwnProperty(u)&&(a=e[u],this[u]=a?a(l):l[u]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?Qs:Mf,this.isPropagationStopped=Mf,this}return Ve(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Qs)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Qs)},persist:function(){},isPersistent:Qs}),t}var fi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ou=Ut(fi),Xl=Ve({},fi,{view:0,detail:0}),Vx=Ut(Xl),Dd,_d,al,ru=Ve({},Xl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Sm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==al&&(al&&e.type==="mousemove"?(Dd=e.screenX-al.screenX,_d=e.screenY-al.screenY):_d=Dd=0,al=e),Dd)},movementY:function(e){return"movementY"in e?e.movementY:_d}}),Rf=Ut(ru),Dx=Ve({},ru,{dataTransfer:0}),_x=Ut(Dx),Hx=Ve({},Xl,{relatedTarget:0}),Hd=Ut(Hx),Ux=Ve({},fi,{animationName:0,elapsedTime:0,pseudoElement:0}),Ix=Ut(Ux),qx=Ve({},fi,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Bx=Ut(qx),Lx=Ve({},fi,{data:0}),Of=Ut(Lx),jx={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Gx={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Yx={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Xx(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Yx[e])?!!t[e]:!1}function Sm(){return Xx}var Qx=Ve({},Xl,{key:function(e){if(e.key){var t=jx[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=hc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Gx[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Sm,charCode:function(e){return e.type==="keypress"?hc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?hc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Zx=Ut(Qx),Kx=Ve({},ru,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Vf=Ut(Kx),Jx=Ve({},fi,{submitter:0}),Fx=Ut(Jx),Px=Ve({},Xl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Sm}),Wx=Ut(Px),eN=Ve({},fi,{propertyName:0,elapsedTime:0,pseudoElement:0}),tN=Ut(eN),aN=Ve({},ru,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),nN=Ut(aN),iN=Ve({},fi,{newState:0,oldState:0,source:0}),oN=Ut(iN),rN=[9,13,27,32],Tm=kn&&"CompositionEvent"in window,hl=null;kn&&"documentMode"in document&&(hl=document.documentMode);var lN=kn&&"TextEvent"in window&&!hl,Av=kn&&(!Tm||hl&&8<hl&&11>=hl),Df=" ",_f=!1;function Mv(e,t){switch(e){case"keyup":return rN.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Rv(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Bo=!1;function sN(e,t){switch(e){case"compositionend":return Rv(t);case"keypress":return t.which!==32?null:(_f=!0,Df);case"textInput":return e=t.data,e===Df&&_f?null:e;default:return null}}function cN(e,t){if(Bo)return e==="compositionend"||!Tm&&Mv(e,t)?(e=zv(),dc=Nm=Jn=null,Bo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Av&&t.locale!=="ko"?null:t.data;default:return null}}var uN={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Hf(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!uN[e.type]:t==="textarea"}function Ov(e,t,a,n){qo?Fo?Fo.push(n):Fo=[n]:qo=n,t=eu(t,"onChange"),0<t.length&&(a=new ou("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var ml=null,El=null;function dN(e){Cw(e,0)}function lu(e){var t=cl(e);if(Nv(t))return e}function Uf(e,t){if(e==="change")return t}var Vv=!1;kn&&(kn?(Ks="oninput"in document,Ks||(Ud=document.createElement("div"),Ud.setAttribute("oninput","return;"),Ks=typeof Ud.oninput=="function"),Zs=Ks):Zs=!1,Vv=Zs&&(!document.documentMode||9<document.documentMode));var Zs,Ks,Ud;function If(){ml&&(ml.detachEvent("onpropertychange",Dv),El=ml=null)}function Dv(e){if(e.propertyName==="value"&&lu(El)){var t=[];Ov(t,El,e,xm(e)),Cv(dN,t)}}function hN(e,t,a){e==="focusin"?(If(),ml=t,El=a,ml.attachEvent("onpropertychange",Dv)):e==="focusout"&&If()}function mN(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return lu(El)}function pN(e,t){if(e==="click")return lu(t)}function gN(e,t){if(e==="input"||e==="change")return lu(t)}function fN(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var ca=typeof Object.is=="function"?Object.is:fN;function Cl(e,t){if(ca(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var o=a[n];if(!gh.call(t,o)||!ca(e[o],t[o]))return!1}return!0}function wh(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function qf(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Bf(e,t){var a=qf(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=qf(a)}}function _v(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?_v(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Hv(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=wh(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=wh(e.document)}return t}function km(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var bN=kn&&"documentMode"in document&&11>=document.documentMode,Lo=null,$h=null,pl=null,xh=!1;function Lf(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;xh||Lo==null||Lo!==wh(n)||(n=Lo,"selectionStart"in n&&km(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),pl&&Cl(pl,n)||(pl=n,n=eu($h,"onSelect"),0<n.length&&(t=new ou("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=Lo)))}function Mi(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var jo={animationend:Mi("Animation","AnimationEnd"),animationiteration:Mi("Animation","AnimationIteration"),animationstart:Mi("Animation","AnimationStart"),transitionrun:Mi("Transition","TransitionRun"),transitionstart:Mi("Transition","TransitionStart"),transitioncancel:Mi("Transition","TransitionCancel"),transitionend:Mi("Transition","TransitionEnd")},Id={},Uv={};kn&&(Uv=document.createElement("div").style,"AnimationEvent"in window||(delete jo.animationend.animation,delete jo.animationiteration.animation,delete jo.animationstart.animation),"TransitionEvent"in window||delete jo.transitionend.transition);function Wi(e){if(Id[e])return Id[e];if(!jo[e])return e;var t=jo[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in Uv)return Id[e]=t[a];return e}var Iv=Wi("animationend"),qv=Wi("animationiteration"),Bv=Wi("animationstart"),vN=Wi("transitionrun"),yN=Wi("transitionstart"),wN=Wi("transitioncancel"),Lv=Wi("transitionend"),jv=new Map,Nh="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Nh.push("scrollEnd");function Ia(e,t){jv.set(e,t),Pi(t,[e])}var $N=0;function En(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Ua.identifierPrefix;var a=$N++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function jf(e){if(e==null||typeof e=="string")return e;var t=null,a=ir;if(a!==null)for(var n=0;n<a.length;n++){var o=e[a[n]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function On(e,t){return e=jf(e),t=jf(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Oc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},ya=[],Go=0,Em=0;function su(){for(var e=Go,t=Em=Go=0;t<e;){var a=ya[t];ya[t++]=null;var n=ya[t];ya[t++]=null;var o=ya[t];ya[t++]=null;var l=ya[t];if(ya[t++]=null,n!==null&&o!==null){var c=n.pending;c===null?o.next=o:(o.next=c.next,c.next=o),n.pending=o}l!==0&&Gv(a,o,l)}}function cu(e,t,a,n){ya[Go++]=e,ya[Go++]=t,ya[Go++]=a,ya[Go++]=n,Em|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function Cm(e,t,a,n){return cu(e,t,a,n),Vc(e)}function eo(e,t){return cu(e,null,null,t),Vc(e)}function Gv(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var o=!1,l=e.return;l!==null;)l.childLanes|=a,n=l.alternate,n!==null&&(n.childLanes|=a),l.tag===22&&(e=l.stateNode,e===null||e._visibility&1||(o=!0)),e=l,l=l.return;return e.tag===3?(l=e.stateNode,o&&t!==null&&(o=31-la(a),e=l.hiddenUpdates,n=e[o],n===null?e[o]=[t]:n.push(t),t.lane=a|536870912),l):null}function Vc(e){if(50<Sl)throw Sl=0,xc=null,Error(M(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Yo={};function xN(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Qt(e,t,a,n){return new xN(e,t,a,n)}function zm(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Sn(e,t){var a=e.alternate;return a===null?(a=Qt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Yv(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function mc(e,t,a,n,o,l){var c=0;if(n=e,typeof n=="function")zm(n)&&(c=1);else if(typeof n=="string")c=Z5(e,a,sn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(n){case uh:return e=Qt(31,a,t,o),e.elementType=uh,e.lanes=l,e;case Uo:return Ii(a.children,o,l,t);case sv:c=8,o|=24;break;case lh:return e=Qt(12,a,t,o|2),e.elementType=lh,e.lanes=l,e;case sh:return e=Qt(13,a,t,o),e.elementType=sh,e.lanes=l,e;case ch:return e=Qt(19,a,t,o),e.elementType=ch,e.lanes=l,e;case cx:case dh:return e=o|32,e=Qt(30,a,t,e),e.elementType=dh,e.lanes=l,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case nn:c=10;break e;case cv:c=9;break e;case fm:c=11;break e;case bm:c=14;break e;case Xn:c=16,n=null;break e}c=29,a=Error(M(130,e===null?"null":typeof e,"")),n=null}return t=Qt(c,a,t,o),t.elementType=e,t.type=n,t.lanes=l,t}function Ii(e,t,a,n){return e=Qt(7,e,n,t),e.lanes=a,e}function qd(e,t,a){return e=Qt(6,e,null,t),e.lanes=a,e}function Xv(e){var t=Qt(18,null,null,0);return t.stateNode=e,t}function Bd(e,t,a){return t=Qt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Gf=new WeakMap;function Na(e,t){if(typeof e=="object"&&e!==null){var a=Gf.get(e);return a!==void 0?a:(t={value:e,source:t,stack:xf(t)},Gf.set(e,t),t)}return{value:e,source:t,stack:xf(t)}}var Xo=[],Qo=0,Dc=null,zl=0,wa=[],$a=0,di=null,rn=1,ln="";function xn(e,t){Xo[Qo++]=zl,Xo[Qo++]=Dc,Dc=e,zl=t}function Qv(e,t,a){wa[$a++]=rn,wa[$a++]=ln,wa[$a++]=di,di=e;var n=rn;e=ln;var o=32-la(n)-1;n&=~(1<<o),a+=1;var l=32-la(t)+o;if(30<l){var c=o-o%5;l=(n&(1<<c)-1).toString(32),n>>=c,o-=c,rn=1<<32-la(t)+o|a<<o|n,ln=l+e}else rn=1<<l|a<<o|n,ln=e}function uu(e){e.return!==null&&(xn(e,1),Qv(e,1,0))}function Am(e){for(;e===Dc;)Dc=Xo[--Qo],Xo[Qo]=null,zl=Xo[--Qo],Xo[Qo]=null;for(;e===di;)di=wa[--$a],wa[$a]=null,ln=wa[--$a],wa[$a]=null,rn=wa[--$a],wa[$a]=null}function Zv(e,t){wa[$a++]=rn,wa[$a++]=ln,wa[$a++]=di,rn=t.id,ln=t.overflow,di=e}var ht=null,Ue=null,ce=!1,ai=null,Sa=!1,Sh=Error(M(519));function hi(e){var t=Error(M(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Al(Na(t,e)),Sh}function Yf(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[vt]=e,t[Jt]=n,a){case"dialog":de("cancel",t),de("close",t);break;case"iframe":case"object":case"embed":de("load",t);break;case"video":case"audio":for(a=0;a<Vl.length;a++)de(Vl[a],t);break;case"source":de("error",t);break;case"img":case"image":case"link":de("error",t),de("load",t);break;case"details":de("toggle",t);break;case"input":de("invalid",t),Sv(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":de("invalid",t);break;case"textarea":de("invalid",t),kv(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||Aw(t.textContent,a)?(n.popover!=null&&(de("beforetoggle",t),de("toggle",t)),n.onScroll!=null&&de("scroll",t),n.onScrollEnd!=null&&de("scrollend",t),n.onClick!=null&&(t.onclick=on),t=!0):t=!1,t||hi(e,!0)}function _c(e){for(ht=e.return;ht;)switch(ht.tag){case 5:case 31:case 13:Sa=!1;return;case 27:case 3:Sa=!0;return;default:ht=ht.return}}function Ro(e){if(e!==ht)return!1;if(!ce)return _c(e),ce=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||sm(e.type,e.memoizedProps)),a=!a),a&&Ue&&hi(e),_c(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(317));Ue=Bb(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(317));Ue=Bb(e)}else t===27?(t=Ue,bi(e.type)?(e=hm,hm=null,Ue=e):Ue=t):Ue=ht?Ta(e.stateNode.nextSibling):null;return!0}function ji(){Ue=ht=null,ce=!1}function Ld(){var e=ai;return e!==null&&(Yt===null?Yt=e:Yt.push.apply(Yt,e),ai=null),e}function Al(e){ai===null?ai=[e]:ai.push(e)}var Th=dn(null),to=null,Nn=null;function Fn(e,t,a){Ie(Th,t._currentValue),t._currentValue=a}function Tn(e){e._currentValue=Th.current,wt(Th)}function pc(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function kh(e,t,a,n){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var l=o.dependencies;if(l!==null){var c=o.child;l=l.firstContext;e:for(;l!==null;){var u=l;l=o;for(var h=0;h<t.length;h++)if(u.context===t[h]){l.lanes|=a,u=l.alternate,u!==null&&(u.lanes|=a),pc(l.return,a,e),n||(c=null);break e}l=u.next}}else if(o.tag===18){if(c=o.return,c===null)throw Error(M(341));c.lanes|=a,l=c.alternate,l!==null&&(l.lanes|=a),pc(c,a,e),c=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,c=o.alternate,c!==null&&(c.lanes|=a),pc(o.return,a,e),c=o.child,c=c!==null?c.sibling:null):c=o.child;if(c!==null)c.return=o;else for(c=o;c!==null;){if(c===e){c=null;break}if(o=c.sibling,o!==null){o.return=c.return,c=o;break}c=c.return}o=c}}function Gi(e,t,a,n){e=null;for(var o=t,l=!1;o!==null;){if(!l){if((o.flags&524288)!==0)l=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var c=o.alternate;if(c===null)throw Error(M(387));if(c=c.memoizedProps,c!==null){var u=o.type;ca(o.pendingProps.value,c.value)||(e!==null?e.push(u):e=[u])}}else if(o===Cc.current){if(c=o.alternate,c===null)throw Error(M(387));c.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(gr):e=[gr])}o=o.return}return e!==null&&kh(t,e,a,n),t.flags|=262144,e!==null}function Hc(e){for(e=e.firstContext;e!==null;){if(!ca(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Yi(e){to=e,Nn=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function yt(e){return Kv(to,e)}function Js(e,t){return to===null&&Yi(e),Kv(e,t)}function Kv(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},Nn===null){if(e===null)throw Error(M(308));Nn=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Nn=Nn.next=t;return a}var NN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},SN=st.unstable_scheduleCallback,TN=st.unstable_NormalPriority,et={$$typeof:nn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Mm(){return{controller:new NN,data:new Map,refCount:0}}function Ql(e){e.refCount--,e.refCount===0&&SN(TN,function(){e.controller.abort()})}function Xf(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var n=t[e];a.indexOf(n)===-1&&a.push(n)}}}var ul=null;function kN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var gl=null,Eh=0,Xi=0,Po=null;function EN(e,t){if(gl===null){var a=gl=[];Eh=0,Xi=op(),Po={status:"pending",value:void 0,then:function(n){a.push(n)}}}return Eh++,t.then(Qf,Qf),t}function Qf(){if(--Eh===0&&(ul=null,gl!==null)){Po!==null&&(Po.status="fulfilled");var e=gl;gl=null,Xi=0,Po=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function CN(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(n.status="rejected",n.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),n}var Zf=ee.S;ee.S=function(e,t){if(mw=oa(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&EN(e,t),ul!==null)for(var a=hr;a!==null;)Xf(a,ul),a=a.next;if(a=e.types,a!==null){for(var n=hr;n!==null;)Xf(n,a),n=n.next;if(Xi!==0){n=ul,n===null&&(n=ul=[]);for(var o=0;o<a.length;o++){var l=a[o];n.indexOf(l)===-1&&n.push(l)}}}Zf!==null&&Zf(e,t)};var qi=dn(null);function Rm(){var e=qi.current;return e!==null?e:Oe.pooledCache}function gc(e,t){t===null?Ie(qi,qi.current):Ie(qi,t.pool)}function Jv(){var e=Rm();return e===null?null:{parent:et._currentValue,pool:e}}var wr=Error(M(460)),Om=Error(M(474)),du=Error(M(542)),Uc={then:function(){}};function Kf(e){return e=e.status,e==="fulfilled"||e==="rejected"}function Fv(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(on,on),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Ff(e),e===void 0&&!("reason"in t)?Error(M(600)):e;default:if(typeof t.status=="string")t.then(on,on);else{if(e=Oe,e!==null&&100<e.shellSuspendCounter)throw Error(M(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=n}},function(n){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Ff(e),e}throw Bi=t,wr}}function Vi(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Bi=a,wr):a}}var Bi=null;function Jf(){if(Bi===null)throw Error(M(459));var e=Bi;return Bi=null,e}function Ff(e){if(e===wr||e===du)throw Error(M(483))}var Wo=null,Ml=0;function Fs(e){var t=Ml;return Ml+=1,Wo===null&&(Wo=[]),Fv(Wo,e,t)}function jn(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Ps(e,t){throw t.$$typeof===sx?Error(M(525)):(e=Object.prototype.toString.call(t),Error(M(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function Pv(e){function t(w,y){if(e){var v=w.deletions;v===null?(w.deletions=[y],w.flags|=16):v.push(y)}}function a(w,y){if(!e)return null;for(;y!==null;)t(w,y),y=y.sibling;return null}function n(w){for(var y=new Map;w!==null;)w.key===null?y.set(w.index,w):y.set(w.key,w),w=w.sibling;return y}function o(w,y){return w=Sn(w,y),w.index=0,w.sibling=null,w}function l(w,y,v){return w.index=v,e?(v=w.alternate,v!==null?(v=v.index,v<y?(w.flags|=2,y):v):(w.flags|=134217730,y)):(w.flags|=1048576,y)}function c(w){return e&&w.alternate===null&&(w.flags|=134217730),w}function u(w,y,v,S){return y===null||y.tag!==6?(y=qd(v,w.mode,S),y.return=w,y):(y=o(y,v),y.return=w,y)}function h(w,y,v,S){var O=v.type;return O===Uo?(w=$(w,y,v.props.children,S,v.key),jn(w,v),w):y!==null&&(y.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Xn&&Vi(O)===y.type)?(y=o(y,v.props),jn(y,v),y.return=w,y):(y=mc(v.type,v.key,v.props,null,w.mode,S),jn(y,v),y.return=w,y)}function g(w,y,v,S){return y===null||y.tag!==4||y.stateNode.containerInfo!==v.containerInfo||y.stateNode.implementation!==v.implementation?(y=Bd(v,w.mode,S),y.return=w,y):(y=o(y,v.children||[]),y.return=w,y)}function $(w,y,v,S,O){return y===null||y.tag!==7?(y=Ii(v,w.mode,S,O),y.return=w,y):(y=o(y,v),y.return=w,y)}function x(w,y,v){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return y=qd(""+y,w.mode,v),y.return=w,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Ls:return v=mc(y.type,y.key,y.props,null,w.mode,v),jn(v,y),v.return=w,v;case ll:return y=Bd(y,w.mode,v),y.return=w,y;case Xn:return y=Vi(y),x(w,y,v)}if(sl(y)||tl(y))return y=Ii(y,w.mode,v,null),y.return=w,y;if(typeof y.then=="function")return x(w,Fs(y),v);if(y.$$typeof===nn)return x(w,Js(w,y),v);Ps(w,y)}return null}function f(w,y,v,S){var O=y!==null?y.key:null;if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return O!==null?null:u(w,y,""+v,S);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Ls:return v.key===O?h(w,y,v,S):null;case ll:return v.key===O?g(w,y,v,S):null;case Xn:return v=Vi(v),f(w,y,v,S)}if(sl(v)||tl(v))return O!==null?null:$(w,y,v,S,null);if(typeof v.then=="function")return f(w,y,Fs(v),S);if(v.$$typeof===nn)return f(w,y,Js(w,v),S);Ps(w,v)}return null}function b(w,y,v,S,O){if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return w=w.get(v)||null,u(y,w,""+S,O);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case Ls:return w=w.get(S.key===null?v:S.key)||null,h(y,w,S,O);case ll:return w=w.get(S.key===null?v:S.key)||null,g(y,w,S,O);case Xn:return S=Vi(S),b(w,y,v,S,O)}if(sl(S)||tl(S))return w=w.get(v)||null,$(y,w,S,O,null);if(typeof S.then=="function")return b(w,y,v,Fs(S),O);if(S.$$typeof===nn)return b(w,y,v,Js(y,S),O);Ps(y,S)}return null}function C(w,y,v,S){for(var O=null,P=null,H=y,B=y=0,be=null;H!==null&&B<v.length;B++){H.index>B?(be=H,H=null):be=H.sibling;var X=f(w,H,v[B],S);if(X===null){H===null&&(H=be);break}e&&H&&X.alternate===null&&t(w,H),y=l(X,y,B),P===null?O=X:P.sibling=X,P=X,H=be}if(B===v.length)return a(w,H),ce&&xn(w,B),O;if(H===null){for(;B<v.length;B++)H=x(w,v[B],S),H!==null&&(y=l(H,y,B),P===null?O=H:P.sibling=H,P=H);return ce&&xn(w,B),O}for(H=n(H);B<v.length;B++)be=b(H,w,B,v[B],S),be!==null&&(e&&(X=be.alternate,X!==null&&H.delete(X.key===null?B:X.key)),y=l(be,y,B),P===null?O=be:P.sibling=be,P=be);return e&&H.forEach(function(De){return t(w,De)}),ce&&xn(w,B),O}function k(w,y,v,S){if(v==null)throw Error(M(151));for(var O=null,P=null,H=y,B=y=0,be=null,X=v.next();H!==null&&!X.done;B++,X=v.next()){H.index>B?(be=H,H=null):be=H.sibling;var De=f(w,H,X.value,S);if(De===null){H===null&&(H=be);break}e&&H&&De.alternate===null&&t(w,H),y=l(De,y,B),P===null?O=De:P.sibling=De,P=De,H=be}if(X.done)return a(w,H),ce&&xn(w,B),O;if(H===null){for(;!X.done;B++,X=v.next())X=x(w,X.value,S),X!==null&&(y=l(X,y,B),P===null?O=X:P.sibling=X,P=X);return ce&&xn(w,B),O}for(H=n(H);!X.done;B++,X=v.next())X=b(H,w,B,X.value,S),X!==null&&(e&&(be=X.alternate,be!==null&&H.delete(be.key===null?B:be.key)),y=l(X,y,B),P===null?O=X:P.sibling=X,P=X);return e&&H.forEach(function(Me){return t(w,Me)}),ce&&xn(w,B),O}function R(w,y,v,S){if(typeof v=="object"&&v!==null&&v.type===Uo&&v.key===null&&v.props.ref===void 0&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case Ls:e:{for(var O=v.key;y!==null;){if(y.key===O){if(O=v.type,O===Uo){if(y.tag===7){a(w,y.sibling),S=o(y,v.props.children),jn(S,v),S.return=w,w=S;break e}}else if(y.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Xn&&Vi(O)===y.type){a(w,y.sibling),S=o(y,v.props),jn(S,v),S.return=w,w=S;break e}a(w,y);break}else t(w,y);y=y.sibling}v.type===Uo?(S=Ii(v.props.children,w.mode,S,v.key),jn(S,v),S.return=w,w=S):(S=mc(v.type,v.key,v.props,null,w.mode,S),jn(S,v),S.return=w,w=S)}return c(w);case ll:e:{for(O=v.key;y!==null;){if(y.key===O)if(y.tag===4&&y.stateNode.containerInfo===v.containerInfo&&y.stateNode.implementation===v.implementation){a(w,y.sibling),S=o(y,v.children||[]),S.return=w,w=S;break e}else{a(w,y);break}else t(w,y);y=y.sibling}S=Bd(v,w.mode,S),S.return=w,w=S}return c(w);case Xn:return v=Vi(v),R(w,y,v,S)}if(sl(v))return C(w,y,v,S);if(tl(v)){if(O=tl(v),typeof O!="function")throw Error(M(150));return v=O.call(v),k(w,y,v,S)}if(typeof v.then=="function")return R(w,y,Fs(v),S);if(v.$$typeof===nn)return R(w,y,Js(w,v),S);Ps(w,v)}return typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint"?(v=""+v,y!==null&&y.tag===6?(a(w,y.sibling),S=o(y,v),S.return=w,w=S):(a(w,y),S=qd(v,w.mode,S),S.return=w,w=S),c(w)):a(w,y)}return function(w,y,v,S){try{Ml=0;var O=R(w,y,v,S);return Wo=null,O}catch(H){if(H===wr||H===du)throw H;var P=Qt(29,H,null,w.mode);return P.lanes=S,P.return=w,P}}}var Qi=Pv(!0),Wv=Pv(!1),Qn=!1;function Vm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Ch(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function ni(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ii(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,($e&2)!==0){var o=n.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),n.pending=t,t=Vc(e),Gv(e,null,a),t}return cu(e,n,t,a),Vc(e)}function fl(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,fv(e,a)}}function jd(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var o=null,l=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};l===null?o=l=c:l=l.next=c,a=a.next}while(a!==null);l===null?o=l=t:l=l.next=t}else o=l=t;a={baseState:n.baseState,firstBaseUpdate:o,lastBaseUpdate:l,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var zh=!1;function bl(){if(zh){var e=Po;if(e!==null)throw e}}function vl(e,t,a,n){zh=!1;var o=e.updateQueue;Qn=!1;var l=o.firstBaseUpdate,c=o.lastBaseUpdate,u=o.shared.pending;if(u!==null){o.shared.pending=null;var h=u,g=h.next;h.next=null,c===null?l=g:c.next=g,c=h;var $=e.alternate;$!==null&&($=$.updateQueue,u=$.lastBaseUpdate,u!==c&&(u===null?$.firstBaseUpdate=g:u.next=g,$.lastBaseUpdate=h))}if(l!==null){var x=o.baseState;c=0,$=g=h=null,u=l;do{var f=u.lane&-536870913,b=f!==u.lane;if(b?(me&f)===f:(n&f)===f){f!==0&&f===Xi&&(zh=!0),$!==null&&($=$.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var C=e,k=u;f=t;var R=a;switch(k.tag){case 1:if(C=k.payload,typeof C=="function"){x=C.call(R,x,f);break e}x=C;break e;case 3:C.flags=C.flags&-65537|128;case 0:if(C=k.payload,f=typeof C=="function"?C.call(R,x,f):C,f==null)break e;x=Ve({},x,f);break e;case 2:Qn=!0}}f=u.callback,f!==null&&(e.flags|=64,b&&(e.flags|=8192),b=o.callbacks,b===null?o.callbacks=[f]:b.push(f))}else b={lane:f,tag:u.tag,payload:u.payload,callback:u.callback,next:null},$===null?(g=$=b,h=x):$=$.next=b,c|=f;if(u=u.next,u===null){if(u=o.shared.pending,u===null)break;b=u,u=b.next,b.next=null,o.lastBaseUpdate=b,o.shared.pending=null}}while(!0);$===null&&(h=x),o.baseState=h,o.firstBaseUpdate=g,o.lastBaseUpdate=$,l===null&&(o.shared.lanes=0),gi|=c,e.lanes=c,e.memoizedState=x}}function ey(e,t){if(typeof e!="function")throw Error(M(191,e));e.call(t)}function ty(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)ey(a[e],t)}var mi=dn(null),Ic=dn(0);function Pf(e,t){e=Mn,Ie(Ic,e),Ie(mi,t),Mn=e|t.baseLanes}function Ah(){Ie(Ic,Mn),Ie(mi,mi.current)}function Dm(){Mn=Ic.current,wt(mi),wt(Ic)}var Nt=dn(null),Ct=null;function oi(e){var t=e.alternate;Ie($t,$t.current&1),Ie(Nt,e),Ct===null&&(t===null||mi.current!==null||t.memoizedState!==null)&&(Ct=e)}function Mh(e){Ie($t,$t.current),Ie(Nt,e),Ct===null&&(Ct=e)}function ay(e){e.tag===22?(Ie($t,$t.current),Ie(Nt,e),Ct===null&&(Ct=e)):ri()}function ri(){Ie($t,$t.current),Ie(Nt,Nt.current)}function aa(e){wt(Nt),Ct===e&&(Ct=null),wt($t)}var $t=dn(0);function Rl(e,t){Ie(Nt,Nt.current),Ie($t,t)}function _m(e){wt($t),wt(Nt),Ct===e&&(Ct=null)}function qc(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||dm(a)||cp(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Cn=0,ie=null,Ae=null,We=null,Bc=!1,er=!1,Zi=!1,Lc=0,Ol=0,tr=null,zN=0;function Ze(){throw Error(M(321))}function Hm(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!ca(e[a],t[a]))return!1;return!0}function Um(e,t,a,n,o,l){return Cn=l,ie=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,ee.H=e===null||e.memoizedState===null?Oy:Vy,Zi=!1,l=a(n,o),Zi=!1,er&&(l=iy(t,a,n,o)),ny(e),l}function ny(e){ee.H=jc;var t=Ae!==null&&Ae.next!==null;if(Cn=0,We=Ae=ie=null,Bc=!1,Ol=0,tr=null,t)throw Error(M(300));e===null||tt||(e=e.dependencies,e!==null&&Hc(e)&&(tt=!0))}function iy(e,t,a,n){ie=e;var o=0;do{if(er&&(tr=null),Ol=0,er=!1,25<=o)throw Error(M(301));if(o+=1,We=Ae=null,e.updateQueue!=null){var l=e.updateQueue;l.lastEffect=null,l.events=null,l.stores=null,l.memoCache!=null&&(l.memoCache.index=0)}ee.H=HN,l=t(a,n)}while(er);return l}function AN(){var e=ee.H,t=e.useState()[0];return t=typeof t.then=="function"?Zl(t):t,e=e.useState()[0],(Ae!==null?Ae.memoizedState:null)!==e&&(ie.flags|=1024),t}function Im(){var e=Lc!==0;return Lc=0,e}function qm(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Bm(e){if(Bc){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Bc=!1}Cn=0,We=Ae=ie=null,er=!1,Ol=Lc=0,tr=null}function Ht(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return We===null?ie.memoizedState=We=e:We=We.next=e,We}function Je(){if(Ae===null){var e=ie.alternate;e=e!==null?e.memoizedState:null}else e=Ae.next;var t=We===null?ie.memoizedState:We.next;if(t!==null)We=t,Ae=e;else{if(e===null)throw ie.alternate===null?Error(M(467)):Error(M(310));Ae=e,e={memoizedState:Ae.memoizedState,baseState:Ae.baseState,baseQueue:Ae.baseQueue,queue:Ae.queue,next:null},We===null?ie.memoizedState=We=e:We=We.next=e}return We}function hu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Zl(e){var t=Ol;return Ol+=1,tr===null&&(tr=[]),e=Fv(tr,e,t),t=ie,(We===null?t.memoizedState:We.next)===null&&(t=t.alternate,ee.H=t===null||t.memoizedState===null?Oy:Vy),e}function mu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Zl(e);if(e.$$typeof===dx)return;if(e.$$typeof===nn)return yt(e)}throw Error(M(438,String(e)))}function Lm(e){var t=null,a=ie.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=ie.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=hu(),ie.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=ux;return t.index++,a}function zn(e,t){return typeof t=="function"?t(e):t}function fc(e){var t=Je();return jm(t,Ae,e)}function jm(e,t,a){var n=e.queue;if(n===null)throw Error(M(311));n.lastRenderedReducer=a;var o=e.baseQueue,l=n.pending;if(l!==null){if(o!==null){var c=o.next;o.next=l.next,l.next=c}t.baseQueue=o=l,n.pending=null}if(l=e.baseState,o===null)e.memoizedState=l;else{t=o.next;var u=c=null,h=null,g=t,$=!1;do{var x=g.lane&-536870913;if(x!==g.lane?(me&x)===x:(Cn&x)===x){var f=g.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),x===Xi&&($=!0);else if((Cn&f)===f){g=g.next,f===Xi&&($=!0);continue}else x={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(u=h=x,c=l):h=h.next=x,ie.lanes|=f,gi|=f;x=g.action,Zi&&a(l,x),l=g.hasEagerState?g.eagerState:a(l,x)}else f={lane:x,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(u=h=f,c=l):h=h.next=f,ie.lanes|=x,gi|=x;g=g.next}while(g!==null&&g!==t);if(h===null?c=l:h.next=u,!ca(l,e.memoizedState)&&(tt=!0,$&&(a=Po,a!==null)))throw a;e.memoizedState=l,e.baseState=c,e.baseQueue=h,n.lastRenderedState=l}return o===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function Gd(e){var t=Je(),a=t.queue;if(a===null)throw Error(M(311));a.lastRenderedReducer=e;var n=a.dispatch,o=a.pending,l=t.memoizedState;if(o!==null){a.pending=null;var c=o=o.next;do l=e(l,c.action),c=c.next;while(c!==o);ca(l,t.memoizedState)||(tt=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),a.lastRenderedState=l}return[l,n]}function oy(e,t,a){var n=ie,o=Je(),l=ce;if(l){if(a===void 0)throw Error(M(407));a=a()}else a=t();var c=!ca((Ae||o).memoizedState,a);if(c&&(o.memoizedState=a,tt=!0),o=o.queue,Gm(sy.bind(null,n,o,e),[e]),e=o.getSnapshot!==t||c||We!==null&&(We.memoizedState.tag&1)!==0,sr(e?9:8,{destroy:void 0},ly.bind(null,n,o,a,t),null),e){if(n.flags|=2048,Oe===null)throw Error(M(349));l||(Cn&127)!==0||ry(n,t,a)}return a}function ry(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=ie.updateQueue,t===null?(t=hu(),ie.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function ly(e,t,a,n){t.value=a,t.getSnapshot=n,cy(t)&&uy(e)}function sy(e,t,a){return a(function(){cy(t)&&uy(e)})}function cy(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!ca(e,a)}catch{return!0}}function uy(e){var t=eo(e,2);t!==null&&Zt(t,e,2)}function Rh(e){var t=Ht();if(typeof e=="function"){var a=e;if(e=a(),Zi){Kn(!0);try{a()}finally{Kn(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:zn,lastRenderedState:e},t}function dy(e,t,a,n){return e.baseState=a,jm(e,Ae,typeof n=="function"?n:zn)}function MN(e,t,a,n,o){if(gu(e))throw Error(M(485));if(e=t.action,e!==null){var l={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){l.listeners.push(c)}};ee.T!==null?a(!0):l.isTransition=!1,n(l),a=t.pending,a===null?(l.next=t.pending=l,hy(t,l)):(l.next=a.next,t.pending=a.next=l)}}function hy(e,t){var a=t.action,n=t.payload,o=e.state;if(t.isTransition){var l=ee.T,c={};c.types=l!==null?l.types:null,ee.T=c;try{var u=a(o,n),h=ee.S;h!==null&&h(c,u),Wf(e,t,u)}catch(g){Oh(e,t,g)}finally{l!==null&&c.types!==null&&(l.types=c.types),ee.T=l}}else try{l=a(o,n),Wf(e,t,l)}catch(g){Oh(e,t,g)}}function Wf(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){eb(e,t,n)},function(n){return Oh(e,t,n)}):eb(e,t,a)}function eb(e,t,a){t.status="fulfilled",t.value=a,my(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,hy(e,a)))}function Oh(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,my(t),t=t.next;while(t!==n)}e.action=null}function my(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function py(e,t){return t}function tb(e,t){if(ce){var a=Oe.formState;if(a!==null){e:{var n=ie;if(ce){if(Ue){t:{for(var o=Ue,l=Sa;o.nodeType!==8;){if(!l){o=null;break t}if(o=Ta(o.nextSibling),o===null){o=null;break t}}l=o.data,o=l==="F!"||l==="F"?o:null}if(o){Ue=Ta(o.nextSibling),n=o.data==="F!";break e}}hi(n)}n=!1}n&&(t=a[0])}}return a=Ht(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:py,lastRenderedState:t},a.queue=n,a=Ay.bind(null,ie,n),n.dispatch=a,n=Rh(!1),l=Zm.bind(null,ie,!1,n.queue),n=Ht(),o={state:t,dispatch:null,action:e,pending:null},n.queue=o,a=MN.bind(null,ie,o,l,a),o.dispatch=a,n.memoizedState=e,[t,a,!1]}function ab(e){var t=Je();return gy(t,Ae,e)}function gy(e,t,a){if(t=jm(e,t,py)[0],e=fc(zn)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=Zl(t)}catch(c){throw c===wr?du:c}else n=t;t=Je();var o=t.queue,l=o.dispatch;return a!==t.memoizedState&&(ie.flags|=2048,sr(9,{destroy:void 0},RN.bind(null,o,a),null)),[n,l,e]}function RN(e,t){e.action=t}function nb(e){var t=Je(),a=Ae;if(a!==null)return gy(t,a,e);Je(),t=t.memoizedState,a=Je();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function sr(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=ie.updateQueue,t===null&&(t=hu(),ie.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function fy(){return Je().memoizedState}function bc(e,t,a,n){var o=Ht();ie.flags|=e,o.memoizedState=sr(1|t,{destroy:void 0},a,n===void 0?null:n)}function pu(e,t,a,n){var o=Je();n=n===void 0?null:n;var l=o.memoizedState.inst;Ae!==null&&n!==null&&Hm(n,Ae.memoizedState.deps)?o.memoizedState=sr(t,l,a,n):(ie.flags|=e,o.memoizedState=sr(1|t,l,a,n))}function ib(e,t){bc(8390656,8,e,t)}function Gm(e,t){pu(2048,8,e,t)}function ON(e){ie.flags|=4;var t=ie.updateQueue;if(t===null)t=hu(),ie.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function by(e){var t=Je().memoizedState;return ON({ref:t,nextImpl:e}),function(){if(($e&2)!==0)throw Error(M(440));return t.impl.apply(void 0,arguments)}}function vy(e,t){return pu(4,2,e,t)}function yy(e,t){return pu(4,4,e,t)}function wy(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function $y(e,t,a){a=a!=null?a.concat([e]):null,pu(4,4,wy.bind(null,t,e),a)}function Ym(){}function xy(e,t){var a=Je();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&Hm(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function Ny(e,t){var a=Je();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&Hm(t,n[1]))return n[0];if(n=e(),Zi){Kn(!0);try{e()}finally{Kn(!1)}}return a.memoizedState=[n,t],n}function Xm(e,t,a){return a===void 0||(Cn&1073741824)!==0&&(me&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=gw(),ie.lanes|=e,gi|=e,a)}function Sy(e,t,a,n){return ca(a,t)?a:mi.current!==null?(e=Xm(e,a,n),ca(e,t)||(tt=!0),e):(Cn&106)===0||(Cn&1073741824)!==0&&(me&261930)===0?(tt=!0,e.memoizedState=a):(e=gw(),ie.lanes|=e,gi|=e,t)}function Ty(e,t,a,n,o){var l=xe.p;xe.p=l!==0&&8>l?l:8;var c=ee.T,u={};u.types=c!==null?c.types:null,ee.T=u,Zm(e,!1,t,a);try{var h=o(),g=ee.S;if(g!==null&&g(u,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var $=CN(h,n);yl(e,t,$,sa(e))}else yl(e,t,n,sa(e))}catch(x){yl(e,t,{then:function(){},status:"rejected",reason:x},sa())}finally{xe.p=l,c!==null&&u.types!==null&&(c.types=u.types),ee.T=c}}function VN(){}function Vh(e,t,a,n){if(e.tag!==5)throw Error(M(476));var o=ky(e).queue;Ty(e,o,t,Ui,a===null?VN:function(){return Ey(e),a(n)})}function ky(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Ui,baseState:Ui,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:zn,lastRenderedState:Ui},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:zn,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Ey(e){var t=ky(e);t.next===null&&(t=e.alternate.memoizedState),yl(e,t.next.queue,{},sa())}function Qm(){return yt(gr)}function Cy(){return Je().memoizedState}function zy(){return Je().memoizedState}function DN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=sa();e=ni(a);var n=ii(t,e,a);n!==null&&(Zt(n,t,a),fl(n,t,a)),t={cache:Mm()},e.payload=t;return}t=t.return}}function _N(e,t,a){var n=sa();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},gu(e)?My(t,a):(a=Cm(e,t,a,n),a!==null&&(Zt(a,e,n),Ry(a,t,n)))}function Ay(e,t,a){var n=sa();yl(e,t,a,n)}function yl(e,t,a,n){var o={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(gu(e))My(t,o);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var c=t.lastRenderedState,u=l(c,a);if(o.hasEagerState=!0,o.eagerState=u,ca(u,c))return cu(e,t,o,0),Oe===null&&su(),!1}catch{}if(a=Cm(e,t,o,n),a!==null)return Zt(a,e,n),Ry(a,t,n),!0}return!1}function Zm(e,t,a,n){if(n={lane:2,revertLane:op(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},gu(e)){if(t)throw Error(M(479))}else t=Cm(e,a,n,2),t!==null&&Zt(t,e,2)}function gu(e){var t=e.alternate;return e===ie||t!==null&&t===ie}function My(e,t){er=Bc=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Ry(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,fv(e,a)}}var jc={readContext:yt,use:mu,useCallback:Ze,useContext:Ze,useEffect:Ze,useImperativeHandle:Ze,useLayoutEffect:Ze,useInsertionEffect:Ze,useMemo:Ze,useReducer:Ze,useRef:Ze,useState:Ze,useDebugValue:Ze,useDeferredValue:Ze,useTransition:Ze,useSyncExternalStore:Ze,useId:Ze,useHostTransitionStatus:Ze,useFormState:Ze,useActionState:Ze,useOptimistic:Ze,useMemoCache:Ze,useCacheRefresh:Ze,useEffectEvent:Ze},Oy={readContext:yt,use:mu,useCallback:function(e,t){return Ht().memoizedState=[e,t===void 0?null:t],e},useContext:yt,useEffect:ib,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,bc(4194308,4,wy.bind(null,t,e),a)},useLayoutEffect:function(e,t){return bc(4194308,4,e,t)},useInsertionEffect:function(e,t){bc(4,2,e,t)},useMemo:function(e,t){var a=Ht();t=t===void 0?null:t;var n=e();if(Zi){Kn(!0);try{e()}finally{Kn(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=Ht();if(a!==void 0){var o=a(t);if(Zi){Kn(!0);try{a(t)}finally{Kn(!1)}}}else o=t;return n.memoizedState=n.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},n.queue=e,e=e.dispatch=_N.bind(null,ie,e),[n.memoizedState,e]},useRef:function(e){var t=Ht();return e={current:e},t.memoizedState=e},useState:function(e){e=Rh(e);var t=e.queue,a=Ay.bind(null,ie,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:Ym,useDeferredValue:function(e,t){var a=Ht();return Xm(a,e,t)},useTransition:function(){var e=Rh(!1);return e=Ty.bind(null,ie,e.queue,!0,!1),Ht().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=ie,o=Ht();if(ce){if(a===void 0)throw Error(M(407));a=a()}else{if(a=t(),Oe===null)throw Error(M(349));(me&127)!==0||ry(n,t,a)}o.memoizedState=a;var l={value:a,getSnapshot:t};return o.queue=l,ib(sy.bind(null,n,l,e),[e]),n.flags|=2048,sr(9,{destroy:void 0},ly.bind(null,n,l,a,t),null),a},useId:function(){var e=Ht(),t=Oe.identifierPrefix;if(ce){var a=ln,n=rn;a=(n&~(1<<32-la(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Lc++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=zN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Qm,useFormState:tb,useActionState:tb,useOptimistic:function(e){var t=Ht();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=Zm.bind(null,ie,!0,a),a.dispatch=t,[e,t]},useMemoCache:Lm,useCacheRefresh:function(){return Ht().memoizedState=DN.bind(null,ie)},useEffectEvent:function(e){var t=Ht(),a={impl:e};return t.memoizedState=a,function(){if(($e&2)!==0)throw Error(M(440));return a.impl.apply(void 0,arguments)}}},Vy={readContext:yt,use:mu,useCallback:xy,useContext:yt,useEffect:Gm,useImperativeHandle:$y,useInsertionEffect:vy,useLayoutEffect:yy,useMemo:Ny,useReducer:fc,useRef:fy,useState:function(){return fc(zn)},useDebugValue:Ym,useDeferredValue:function(e,t){var a=Je();return Sy(a,Ae.memoizedState,e,t)},useTransition:function(){var e=fc(zn)[0],t=Je().memoizedState;return[typeof e=="boolean"?e:Zl(e),t]},useSyncExternalStore:oy,useId:Cy,useHostTransitionStatus:Qm,useFormState:ab,useActionState:ab,useOptimistic:function(e,t){var a=Je();return dy(a,Ae,e,t)},useMemoCache:Lm,useCacheRefresh:zy,useEffectEvent:by},HN={readContext:yt,use:mu,useCallback:xy,useContext:yt,useEffect:Gm,useImperativeHandle:$y,useInsertionEffect:vy,useLayoutEffect:yy,useMemo:Ny,useReducer:Gd,useRef:fy,useState:function(){return Gd(zn)},useDebugValue:Ym,useDeferredValue:function(e,t){var a=Je();return Ae===null?Xm(a,e,t):Sy(a,Ae.memoizedState,e,t)},useTransition:function(){var e=Gd(zn)[0],t=Je().memoizedState;return[typeof e=="boolean"?e:Zl(e),t]},useSyncExternalStore:oy,useId:Cy,useHostTransitionStatus:Qm,useFormState:nb,useActionState:nb,useOptimistic:function(e,t){var a=Je();return Ae!==null?dy(a,Ae,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Lm,useCacheRefresh:zy,useEffectEvent:by};function Yd(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:Ve({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Dh={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=sa(),o=ni(n);o.payload=t,a!=null&&(o.callback=a),t=ii(e,o,n),t!==null&&(Zt(t,e,n),fl(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=sa(),o=ni(n);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=ii(e,o,n),t!==null&&(Zt(t,e,n),fl(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=sa(),n=ni(a);n.tag=2,t!=null&&(n.callback=t),t=ii(e,n,a),t!==null&&(Zt(t,e,a),fl(t,e,a))}};function ob(e,t,a,n,o,l,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,l,c):t.prototype&&t.prototype.isPureReactComponent?!Cl(a,n)||!Cl(o,l):!0}function rb(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&Dh.enqueueReplaceState(t,t.state,null)}function Ki(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=Ve({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function Dy(e){Oc(e)}function _y(e){console.error(e)}function Hy(e){Oc(e)}function Gc(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function lb(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function _h(e,t,a){return a=ni(a),a.tag=3,a.payload={element:null},a.callback=function(){Gc(e,t)},a}function Uy(e){return e=ni(e),e.tag=3,e}function Iy(e,t,a,n){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var l=n.value;e.payload=function(){return o(l)},e.callback=function(){lb(t,a,n)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){lb(t,a,n),typeof o!="function"&&(li===null?li=new Set([this]):li.add(this));var u=n.stack;this.componentDidCatch(n.value,{componentStack:u!==null?u:""})})}function UN(e,t,a,n,o){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&Gi(t,a,o,!0),a=Nt.current,a!==null){switch(a.tag){case 31:case 13:case 19:return Ct===null?Pc():a.alternate===null&&Ke===0&&(Ke=3),a.flags&=-257,a.flags|=65536,a.lanes=o,n===Uc?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),Pd(e,n,o)),!1;case 22:return a.flags|=65536,n===Uc?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),Pd(e,n,o)),!1}throw Error(M(435,a.tag))}return Pd(e,n,o),Pc(),!1}if(ce)return t=Nt.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,n!==Sh&&(e=Error(M(422),{cause:n}),Al(Na(e,a)))):(n!==Sh&&(t=Error(M(423),{cause:n}),Al(Na(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,n=Na(n,a),o=_h(e.stateNode,n,o),jd(e,o),Ke!==4&&(Ke=2)),!1;var l=Error(M(520),{cause:n});if(l=Na(l,a),Nl===null?Nl=[l]:Nl.push(l),Ke!==4&&(Ke=2),t===null)return!0;n=Na(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=_h(a.stateNode,n,e),jd(a,e),!1;case 1:if(t=a.type,l=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||l!==null&&typeof l.componentDidCatch=="function"&&(li===null||!li.has(l))))return a.flags|=65536,o&=-o,a.lanes|=o,o=Uy(o),Iy(o,e,a,n),jd(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var Km=Error(M(461)),tt=!1;function rt(e,t,a,n){t.child=e===null?Wv(t,null,a,n):Qi(t,e.child,a,n)}function sb(e,t,a,n,o){a=a.render;var l=t.ref;if("ref"in n){var c={};for(var u in n)u!=="ref"&&(c[u]=n[u])}else c=n;return Yi(t),n=Um(e,t,a,c,l,o),u=Im(),e!==null&&!tt?(qm(e,t,o),An(e,t,o)):(ce&&u&&uu(t),t.flags|=1,rt(e,t,n,o),t.child)}function cb(e,t,a,n,o){if(e===null){var l=a.type;return typeof l=="function"&&!zm(l)&&l.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=l,qy(e,t,l,n,o)):(e=mc(a.type,null,n,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,!Fm(e,o)){var c=l.memoizedProps;if(a=a.compare,a=a!==null?a:Cl,a(c,n)&&e.ref===t.ref)return An(e,t,o)}return t.flags|=1,e=Sn(l,n),e.ref=t.ref,e.return=t,t.child=e}function qy(e,t,a,n,o){if(e!==null){var l=e.memoizedProps;if(Cl(l,n)&&e.ref===t.ref)if(tt=!1,t.pendingProps=n=l,Fm(e,o))(e.flags&131072)!==0&&(tt=!0);else return t.lanes=e.lanes,An(e,t,o)}return Hh(e,t,a,n,o)}function By(e,t,a,n){var o=n.children,l=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(l=l!==null?l.baseLanes|a:a,e!==null){for(n=t.child=e.child,o=0;n!==null;)o=o|n.lanes|n.childLanes,n=n.sibling;n=o&~l}else n=0,t.child=null;return ub(e,t,l,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&gc(t,l!==null?l.cachePool:null),l!==null?Pf(t,l):Ah(),ay(t);else return n=t.lanes=536870912,ub(e,t,l!==null?l.baseLanes|a:a,a,n)}else l!==null?(gc(t,l.cachePool),Pf(t,l),ri(),t.memoizedState=null):(e!==null&&gc(t,null),Ah(),ri());return rt(e,t,o,a),t.child}function wl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function ub(e,t,a,n,o){var l=Rm();return l=l===null?null:{parent:et._currentValue,pool:l},t.memoizedState={baseLanes:a,cachePool:l},e!==null&&gc(t,null),Ah(),ay(t),e!==null&&Gi(e,t,n,!0),t.childLanes=o,null}function vc(e,t){return t=fu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function db(e,t,a){return Qi(t,e.child,null,a),e=vc(t,t.pendingProps),e.flags|=2,aa(t),t.memoizedState=null,e}function IN(e,t,a){var n=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(ce){if(n.mode==="hidden")return e=vc(t,n),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},wl(null,e);if(Mh(t),(e=Ue)?(e=Bw(e,Sa),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:di!==null?{id:rn,overflow:ln}:null,retryLane:536870912,hydrationErrors:null},a=Xv(e),a.return=t,t.child=a,ht=t,Ue=null)):e=null,e===null)throw hi(t);return t.lanes=536870912,null}return vc(t,n)}var l=e.memoizedState;if(l!==null){var c=l.dehydrated;if(Mh(t),o)if(t.flags&256)t.flags&=-257,t=db(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(M(558));else if(tt||Gi(e,t,a,!1),o=(a&e.childLanes)!==0,tt||o){if(mi.current===null){if(n=Oe,n!==null&&(c=bv(n,a),c!==0&&c!==l.retryLane))throw l.retryLane=c,eo(e,c),Zt(n,e,c),Km;Pc()}t=db(e,t,a)}else e=l.treeContext,Ue=Ta(c.nextSibling),ht=t,ce=!0,ai=null,Sa=!1,e!==null&&Zv(t,e),t=vc(t,n),t.flags|=134221824;return t}return e=Sn(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Vo(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(M(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Hh(e,t,a,n,o){return Yi(t),a=Um(e,t,a,n,void 0,o),n=Im(),e!==null&&!tt?(qm(e,t,o),An(e,t,o)):(ce&&n&&uu(t),t.flags|=1,rt(e,t,a,o),t.child)}function hb(e,t,a,n,o,l){return Yi(t),t.updateQueue=null,a=iy(t,n,a,o),ny(e),n=Im(),e!==null&&!tt?(qm(e,t,l),An(e,t,l)):(ce&&n&&uu(t),t.flags|=1,rt(e,t,a,l),t.child)}function mb(e,t,a,n,o){if(Yi(t),t.stateNode===null){var l=Yo,c=a.contextType;typeof c=="object"&&c!==null&&(l=yt(c)),l=new a(n,l),t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,l.updater=Dh,t.stateNode=l,l._reactInternals=t,l=t.stateNode,l.props=n,l.state=t.memoizedState,l.refs={},Vm(t),c=a.contextType,l.context=typeof c=="object"&&c!==null?yt(c):Yo,l.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(Yd(t,a,c,n),l.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(c=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),c!==l.state&&Dh.enqueueReplaceState(l,l.state,null),vl(t,n,l,o),bl(),l.state=t.memoizedState),typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){l=t.stateNode;var u=t.memoizedProps,h=Ki(a,u);l.props=h;var g=l.context,$=a.contextType;c=Yo,typeof $=="object"&&$!==null&&(c=yt($));var x=a.getDerivedStateFromProps;$=typeof x=="function"||typeof l.getSnapshotBeforeUpdate=="function",u=t.pendingProps!==u,$||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(u||g!==c)&&rb(t,l,n,c),Qn=!1;var f=t.memoizedState;l.state=f,vl(t,n,l,o),bl(),g=t.memoizedState,u||f!==g||Qn?(typeof x=="function"&&(Yd(t,a,x,n),g=t.memoizedState),(h=Qn||ob(t,a,h,n,f,g,c))?($||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount()),typeof l.componentDidMount=="function"&&(t.flags|=4194308)):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=g),l.props=n,l.state=g,l.context=c,n=h):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{l=t.stateNode,Ch(e,t),c=t.memoizedProps,$=Ki(a,c),l.props=$,x=t.pendingProps,f=l.context,g=a.contextType,h=Yo,typeof g=="object"&&g!==null&&(h=yt(g)),u=a.getDerivedStateFromProps,(g=typeof u=="function"||typeof l.getSnapshotBeforeUpdate=="function")||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(c!==x||f!==h)&&rb(t,l,n,h),Qn=!1,f=t.memoizedState,l.state=f,vl(t,n,l,o),bl();var b=t.memoizedState;c!==x||f!==b||Qn||e!==null&&e.dependencies!==null&&Hc(e.dependencies)?(typeof u=="function"&&(Yd(t,a,u,n),b=t.memoizedState),($=Qn||ob(t,a,$,n,f,b,h)||e!==null&&e.dependencies!==null&&Hc(e.dependencies))?(g||typeof l.UNSAFE_componentWillUpdate!="function"&&typeof l.componentWillUpdate!="function"||(typeof l.componentWillUpdate=="function"&&l.componentWillUpdate(n,b,h),typeof l.UNSAFE_componentWillUpdate=="function"&&l.UNSAFE_componentWillUpdate(n,b,h)),typeof l.componentDidUpdate=="function"&&(t.flags|=4),typeof l.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof l.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=b),l.props=n,l.state=b,l.context=h,n=$):(typeof l.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),n=!1)}return l=n,Vo(e,t),n=(t.flags&128)!==0,l||n?(l=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:l.render(),t.flags|=1,e!==null&&n?(t.child=Qi(t,e.child,null,o),t.child=Qi(t,null,a,o)):rt(e,t,a,o),t.memoizedState=l.state,e=t.child):e=An(e,t,o),e}function pb(e,t,a,n){return ji(),t.flags|=256,rt(e,t,a,n),t.child}var Uh={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Ih(e){return{baseLanes:e,cachePool:Jv()}}function qh(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=ia),e}function Ly(e,t,a){var n=t.pendingProps,o=!1,l=(t.flags&128)!==0,c;if((c=l)||(c=e!==null&&e.memoizedState===null?!1:($t.current&2)!==0),c&&(o=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(ce){if(o?oi(t):ri(),(e=Ue)?(e=Bw(e,Sa),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:di!==null?{id:rn,overflow:ln}:null,retryLane:536870912,hydrationErrors:null},a=Xv(e),a.return=t,t.child=a,ht=t,Ue=null)):e=null,e===null)throw hi(t);return cp(e)?t.lanes=32:t.lanes=536870912,null}return l=n.children,n=n.fallback,o?(ri(),o=t.mode,l=fu({mode:"hidden",children:l},o),n=Ii(n,o,a,null),l.return=t,n.return=t,l.sibling=n,t.child=l,n=t.child,n.memoizedState=Ih(a),n.childLanes=qh(e,c,a),t.memoizedState=Uh,wl(null,n)):(oi(t),Jm(t,l))}var u=e.memoizedState;if(u!==null){var h=u.dehydrated;if(h!==null)return qN(e,t,l,c,n,h,u,a)}return o?(ri(),o=n.fallback,l=t.mode,u=e.child,h=u.sibling,n=Sn(u,{mode:"hidden",children:n.children}),n.subtreeFlags=u.subtreeFlags&1206910976,h!==null?o=Sn(h,o):(o=Ii(o,l,a,null),o.flags|=2),o.return=t,n.return=t,n.sibling=o,t.child=n,wl(null,n),n=t.child,o=e.child.memoizedState,o===null?o=Ih(a):(l=o.cachePool,l!==null?(u=et._currentValue,l=l.parent!==u?{parent:u,pool:u}:l):l=Jv(),o={baseLanes:o.baseLanes|a,cachePool:l}),n.memoizedState=o,n.childLanes=qh(e,c,a),t.memoizedState=Uh,wl(e.child,n)):(oi(t),a=e.child,e=a.sibling,a=Sn(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function Jm(e,t){return t=fu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function fu(e,t){return e=Qt(22,e,null,t),e.lanes=0,e}function Ws(e,t,a){return Qi(t,e.child,null,a),e=Jm(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function qN(e,t,a,n,o,l,c,u){if(a)return t.flags&256?(oi(t),t.flags&=-257,Ws(e,t,u)):t.memoizedState!==null?(ri(),t.child=e.child,t.flags|=128,null):(ri(),l=o.fallback,c=t.mode,o=fu({mode:"visible",children:o.children},c),l=Ii(l,c,u,null),l.flags|=2,o.return=t,l.return=t,o.sibling=l,t.child=o,Qi(t,e.child,null,u),o=t.child,o.memoizedState=Ih(u),o.childLanes=qh(e,n,u),t.memoizedState=Uh,wl(null,o));if(oi(t),cp(l)){if(n=l.nextSibling&&l.nextSibling.dataset,n)var h=n.dgst;return n=h,n!==""&&(o=Error(M(419)),o.stack="",o.digest=n,Al({value:o,source:null,stack:null})),Ws(e,t,u)}if(tt||Gi(e,t,u,!1),n=(u&e.childLanes)!==0,tt||n){if(mi.current!==null)return Ws(e,t,u);if(n=Oe,n!==null&&(o=bv(n,u),o!==0&&o!==c.retryLane))throw c.retryLane=o,eo(e,o),Zt(n,e,o),Km;return dm(l)||Pc(),Ws(e,t,u)}return dm(l)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,Ue=Ta(l.nextSibling),ht=t,ce=!0,ai=null,Sa=!1,e!==null&&Zv(t,e),t=Jm(t,o.children),t.flags|=134221824,t)}function gb(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),pc(e.return,t,a)}function fb(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&qc(a)===null&&(t=e),e=e.sibling}return t}function ec(e,t,a,n,o,l){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:o,treeForkCount:l}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=n,c.tail=a,c.tailMode=o,c.treeForkCount=l)}function Xd(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Bh(e,t,a){var n=t.pendingProps,o=n.revealOrder,l=n.tail;n=n.children;var c=$t.current;if(t.flags&128)return Rl(t,c),null;var u=(c&2)!==0;if(u?(c=c&1|2,t.flags|=128):c&=1,Rl(t,c),o==="backwards"&&e!==null?(Xd(e),rt(e,t,n,a),Xd(e)):rt(e,t,n,a),n=ce?zl:0,!u&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&gb(e,a,t);else if(e.tag===19)gb(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=fb(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,Xd(t)),ec(t,!0,o,null,l,n);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&qc(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}ec(t,!0,a,null,l,n);break;case"together":ec(t,!1,null,null,void 0,n);break;case"independent":t.memoizedState=null;break;default:a=fb(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),ec(t,!1,o,a,l,n)}return t.child}function bb(e,t,a){var n=t.pendingProps;return Fn(t,t.type,n.value),rt(e,t,n.children,a),t.child}function An(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),gi|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Gi(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(M(153));if(t.child!==null){for(e=t.child,a=Sn(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=Sn(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function Fm(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Hc(e)))}function BN(e,t,a){switch(t.tag){case 3:zc(t,t.stateNode.containerInfo),Fn(t,et,e.memoizedState.cache),ji();break;case 27:case 5:ph(t);break;case 4:zc(t,t.stateNode.containerInfo);break;case 10:Fn(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Mh(t),null;break;case 13:var n=t.memoizedState;if(n!==null){if(n.dehydrated!==null)return oi(t),t.flags|=128,null;n=Gi(e,t,a,!1);var o=t.child.childLanes;return n||(a&o)!==0?Ly(e,t,a):(oi(t),e=An(e,t,a),e!==null?e.sibling:null)}oi(t);break;case 19:if(t.flags&128)return Bh(e,t,a);if(o=(e.flags&128)!==0,n=(a&t.childLanes)!==0,n||(Gi(e,t,a,!1),n=(a&t.childLanes)!==0),o){if(n)return Bh(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),Rl(t,$t.current),n)break;return null;case 22:return t.lanes=0,By(e,t,a,t.pendingProps);case 24:Fn(t,et,e.memoizedState.cache)}return An(e,t,a)}function jy(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)tt=!0;else{if(!Fm(e,a)&&(t.flags&128)===0)return tt=!1,BN(e,t,a);tt=(e.flags&131072)!==0}else tt=!1,ce&&(t.flags&1048576)!==0&&Qv(t,zl,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=Vi(t.elementType),t.type=e,typeof e=="function")zm(e)?(n=Ki(e,n),t.tag=1,t=mb(null,t,e,n,a)):(t.tag=0,t=Hh(null,t,e,n,a));else{if(e!=null){var o=e.$$typeof;if(o===fm){t.tag=11,t=sb(null,t,e,n,a);break e}else if(o===bm){t.tag=14,t=cb(null,t,e,n,a);break e}else if(o===nn){t.tag=10,t.type=e,t=bb(null,t,a);break e}}throw t=hh(e)||e,Error(M(306,t,""))}}return t;case 0:return Hh(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,o=Ki(n,t.pendingProps),mb(e,t,n,o,a);case 3:e:{if(zc(t,t.stateNode.containerInfo),e===null)throw Error(M(387));n=t.pendingProps;var l=t.memoizedState;o=l.element,Ch(e,t),vl(t,n,null,a);var c=t.memoizedState;if(n=c.cache,Fn(t,et,n),n!==l.cache&&kh(t,[et],a,!0),bl(),n=c.element,l.isDehydrated)if(l={element:n,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){t=pb(e,t,n,a);break e}else if(n!==o){o=Na(Error(M(424)),t),Al(o),t=pb(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Ue=Ta(e.firstChild),ht=t,ce=!0,ai=null,Sa=!0,a=Wv(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(ji(),n===o){t=An(e,t,a);break e}rt(e,t,n,a)}t=t.child}return t;case 26:return Vo(e,t),e===null?(a=Gb(t.type,null,t.pendingProps,null))?t.memoizedState=a:ce||(t.stateNode=Rw(t.type,t.pendingProps,ti.current,t)):t.memoizedState=Gb(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return ph(t),e===null&&ce&&(n=t.stateNode=Lw(t.type,t.pendingProps,ti.current),ht=t,Sa=!0,o=Ue,bi(t.type)?(hm=o,Ue=Ta(n.firstChild)):Ue=o),rt(e,t,t.pendingProps.children,a),Vo(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&ce&&((o=n=Ue)&&(n=O5(n,t.type,t.pendingProps,Sa),n!==null?(t.stateNode=n,ht=t,Ue=Ta(n.firstChild),Sa=!1,o=!0):o=!1),o||hi(t)),ph(t),o=t.type,l=t.pendingProps,c=e!==null?e.memoizedProps:null,n=l.children,sm(o,l)?n=null:c!==null&&sm(o,c)&&(t.flags|=32),t.memoizedState!==null&&(o=Um(e,t,AN,null,null,a),gr._currentValue=o),Vo(e,t),rt(e,t,n,a),t.child;case 6:return e===null&&ce&&((e=a=Ue)&&(a=V5(a,t.pendingProps,Sa),a!==null?(t.stateNode=a,ht=t,Ue=null,e=!0):e=!1),e||hi(t)),null;case 13:return Ly(e,t,a);case 4:return zc(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=Qi(t,null,n,a):rt(e,t,n,a),t.child;case 11:return sb(e,t,t.type,t.pendingProps,a);case 7:return n=t.pendingProps,Vo(e,t),rt(e,t,n,a),t.child;case 8:return rt(e,t,t.pendingProps.children,a),t.child;case 12:return rt(e,t,t.pendingProps.children,a),t.child;case 10:return bb(e,t,a);case 9:return o=t.type._context,n=t.pendingProps.children,Yi(t),o=yt(o),n=n(o),t.flags|=1,rt(e,t,n,a),t.child;case 14:return cb(e,t,t.type,t.pendingProps,a);case 15:return qy(e,t,t.type,t.pendingProps,a);case 19:return Bh(e,t,a);case 31:return IN(e,t,a);case 22:return By(e,t,a,t.pendingProps);case 24:return Yi(t),n=yt(et),e===null?(o=Rm(),o===null&&(o=Oe,l=Mm(),o.pooledCache=l,l.refCount++,l!==null&&(o.pooledCacheLanes|=a),o=l),t.memoizedState={parent:n,cache:o},Vm(t),Fn(t,et,o)):((e.lanes&a)!==0&&(Ch(e,t),vl(t,null,null,a),bl()),o=e.memoizedState,l=t.memoizedState,o.parent!==n?(o={parent:n,cache:n},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),Fn(t,et,n)):(n=l.cache,Fn(t,et,n),n!==o.cache&&kh(t,[et],a,!0))),rt(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),n=t.pendingProps,n.name!=null&&n.name!=="auto"?t.flags|=e===null?18882560:18874368:ce&&uu(t),e!==null&&e.memoizedProps.name!==n.name?t.flags|=4194816:Vo(e,t),rt(e,t,n.children,a),t.child;case 29:throw t.pendingProps}throw Error(M(156,t.tag))}function $n(e){e.flags|=4}function Qd(e,t,a,n,o){var l;if((l=(e.mode&32)!==0)&&(l=a===null?Qb(t,n):Qb(t,n)&&(n.src!==a.src||n.srcSet!==a.srcSet)),l){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(vw())e.flags|=8192;else throw Bi=Uc,Om}else e.flags&=-16777217}function vb(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Xw(t))if(vw())e.flags|=8192;else throw Bi=Uc,Om}function tc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?pv():536870912,e.lanes|=t,cr|=t)}function nl(e,t){if(!ce)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function He(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags&1206910976,n|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags,n|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function LN(e,t,a){var n=t.pendingProps;switch(Am(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return He(t),null;case 1:return He(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Tn(et),or(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Ro(t)?$n(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Ld())),He(t),null;case 26:var o=t.type,l=t.memoizedState;return e===null?($n(t),l!==null?(He(t),vb(t,l)):(He(t),Qd(t,o,null,n,a))):l?l!==e.memoizedState?($n(t),He(t),vb(t,l)):(He(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&$n(t),He(t),Qd(t,o,e,n,a)),null;case 27:if(Ac(t),a=ti.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&$n(t);else{if(!n){if(t.stateNode===null)throw Error(M(166));return He(t),t.subtreeFlags&=-33554433,null}e=sn.current,Ro(t)?Yf(t,e):(e=Lw(o,n,a),t.stateNode=e,$n(t))}return He(t),t.subtreeFlags&=-33554433,null;case 5:if(Ac(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&$n(t);else{if(!n){if(t.stateNode===null)throw Error(M(166));return He(t),t.subtreeFlags&=-33554433,null}if(l=sn.current,Ro(t))Yf(t,l);else{var c=_l(ti.current);switch(l){case 1:l=c.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:l=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":l=c.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":l=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":l=c.createElement("div"),l.innerHTML="<script><\/script>",l=l.removeChild(l.firstChild);break;case"select":l=typeof n.is=="string"?c.createElement("select",{is:n.is}):c.createElement("select"),n.multiple?l.multiple=!0:n.size&&(l.size=n.size);break;default:l=typeof n.is=="string"?c.createElement(o,{is:n.is}):c.createElement(o)}}l[vt]=t,l[Jt]=n;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)l.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=l;e:switch(xt(l,o,n),o){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&$n(t)}}return He(t),t.subtreeFlags&=-33554433,Qd(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&$n(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(M(166));if(e=ti.current,Ro(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,o=ht,o!==null)switch(o.tag){case 27:case 5:n=o.memoizedProps}e[vt]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||Aw(e.nodeValue,a)),e||hi(t,!0)}else e=_l(e).createTextNode(n),e[vt]=t,t.stateNode=e}return He(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=Ro(t),a!==null){if(e===null){if(!n)throw Error(M(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(M(557));e[vt]=t}else ji(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;He(t),e=!1}else a=Ld(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(aa(t),t):(aa(t),null);if((t.flags&128)!==0)throw Error(M(558))}return He(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=Ro(t),n!==null&&n.dehydrated!==null){if(e===null){if(!o)throw Error(M(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(M(317));o[vt]=t}else ji(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;He(t),o=!1}else o=Ld(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(aa(t),t):(aa(t),null)}return aa(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,o=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(o=n.alternate.memoizedState.cachePool.pool),l=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(l=n.memoizedState.cachePool.pool),l!==o&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),tc(t,t.updateQueue),He(t),null);case 4:return or(),e===null&&rp(t.stateNode.containerInfo),t.flags|=67108864,He(t),null;case 10:return Tn(t.type),He(t),null;case 19:if(_m(t),n=t.memoizedState,n===null)return He(t),null;if(o=(t.flags&128)!==0,l=n.rendering,l===null)if(o)nl(n,!1);else{if(Ke!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(l=qc(e),l!==null){for(t.flags|=128,nl(n,!1),e=l.updateQueue,t.updateQueue=e,tc(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Yv(a,e),a=a.sibling;return Rl(t,$t.current&1|2),ce&&xn(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&oa()>Jc&&(t.flags|=128,o=!0,nl(n,!1),t.lanes=4194304)}else{if(!o)if(e=qc(l),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,tc(t,e),nl(n,!0),n.tail===null&&n.tailMode!=="collapsed"&&n.tailMode!=="visible"&&!l.alternate&&!ce)return He(t),null}else 2*oa()-n.renderingStartTime>Jc&&a!==536870912&&(t.flags|=128,o=!0,nl(n,!1),t.lanes=4194304);n.isBackwards?(l.sibling=t.child,t.child=l):(e=n.last,e!==null?e.sibling=l:t.child=l,n.last=l)}if(n.tail!==null){e=n.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return n.rendering=e,n.tail=e.sibling,n.renderingStartTime=oa(),e.sibling=null,l=$t.current,l=o?l&1|2:l&1,n.tailMode==="visible"||n.tailMode==="collapsed"||!a||ce?Rl(t,l):(a=l,Ie(Nt,t),Ie($t,a),Ct===null&&(Ct=t)),ce&&xn(t,n.treeForkCount),e}return He(t),null;case 22:case 23:return aa(t),Dm(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&(He(t),t.subtreeFlags&6&&(t.flags|=8192)):He(t),a=t.updateQueue,a!==null&&tc(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&wt(qi),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Tn(et),He(t),null;case 25:return null;case 30:return t.flags|=33554432,He(t),null}throw Error(M(156,t.tag))}function jN(e,t){switch(Am(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Tn(et),or(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Ac(t),null;case 31:if(t.memoizedState!==null){if(aa(t),t.alternate===null)throw Error(M(340));ji()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(aa(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(M(340));ji()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return _m(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return or(),null;case 10:return Tn(t.type),null;case 22:case 23:return aa(t),Dm(),e!==null&&wt(qi),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Tn(et),null;case 25:return null;default:return null}}function Gy(e,t){switch(Am(t),t.tag){case 3:Tn(et),or();break;case 26:case 27:case 5:Ac(t);break;case 4:or();break;case 31:t.memoizedState!==null&&aa(t);break;case 13:aa(t);break;case 19:_m(t);break;case 10:Tn(t.type);break;case 22:case 23:aa(t),Dm(),e!==null&&wt(qi);break;case 24:Tn(et)}}function Kl(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var o=n.next;a=o;do{if((a.tag&e)===e){n=void 0;var l=a.create,c=a.inst;n=l(),c.destroy=n}a=a.next}while(a!==o)}}catch(u){ke(t,t.return,u)}}function pi(e,t,a){try{var n=t.updateQueue,o=n!==null?n.lastEffect:null;if(o!==null){var l=o.next;n=l;do{if((n.tag&e)===e){var c=n.inst,u=c.destroy;if(u!==void 0){c.destroy=void 0,o=t;var h=a,g=u;try{g()}catch($){ke(o,h,$)}}}n=n.next}while(n!==l)}}catch($){ke(t,t.return,$)}}function Yy(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{ty(t,a)}catch(n){ke(e,e.return,n)}}}function Xy(e,t,a){a.props=Ki(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){ke(e,t,n)}}function tn(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:var o=e.stateNode,l=En(e.memoizedProps,o);(o.ref===null||o.ref.name!==l)&&(o.ref=_w(l)),n=o.ref;break;case 7:if(e.stateNode===null){var c=new ua(e);Kt(e.child,!1,M5,c,void 0,void 0),e.stateNode=c}n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(u){ke(e,t,u)}}function bt(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(o){ke(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){ke(e,t,o)}else a.current=null}function Yc(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)qw(e.stateNode,t[a])}function yb(e){for(var t=e.return;t!==null&&(Wm(t)&&qw(e.stateNode,t.stateNode),!Pm(t));)t=t.return}function $l(e){for(var t=e.return;t!==null&&(Wm(t)&&R5(e.stateNode,t.stateNode),!Pm(t));)t=t.return}function Pm(e){return e.tag===5||e.tag===3||e.tag===27}function Wm(e){return e&&e.tag===7&&e.stateNode!==null}function Lh(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(o){ke(e,e.return,o)}}function Zd(e,t,a){try{var n=e.stateNode;m5(n,e.type,a,t),n[Jt]=t}catch(o){ke(e,e.return,o)}}function Qy(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&bi(e.type)||e.tag===4}function Kd(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Qy(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&bi(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function jh(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=on)),Yc(e,n),ye=!0;else if(o!==4&&(o===27&&(Yc(e,n),n=null,bi(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(jh(e,t,a,n),e=e.sibling;e!==null;)jh(e,t,a,n),e=e.sibling}function Xc(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),Yc(e,n),ye=!0;else if(o!==4&&(o===27&&(Yc(e,n),n=null,bi(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(Xc(e,t,a,n),e=e.sibling;e!==null;)Xc(e,t,a,n),e=e.sibling}function Zy(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);xt(t,n,a),t[vt]=e,t[Jt]=a}catch(l){ke(e,e.return,l)}}var Qc=!1,na=null;function wb(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Qc=!0)}var an=null;function $b(){var e=an;return an=null,e}var Xt=0;function $r(e,t,a,n,o){return Xt=0,Ky(e.child,t,a,n,o)}function Ky(e,t,a,n,o){for(var l=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(n!==null){var u=cm(c);n.push(u),u.view&&(l=!0)}else l||cm(c).view&&(l=!0);Qc=!0,Ow(c,Xt===0?t:t+"_"+Xt,a),Xt++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||Ky(e.child,t,a,n,o)&&(l=!0));e=e.sibling}return l}function un(e,t){for(;e!==null;)e.tag===5?Vw(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||un(e.child,t)),e=e.sibling}function yc(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(yc(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(M(544));var a=t.name;t=On(t.default,t.share),t!=="none"&&($r(e,a,t,null,!1)||un(e.child,!1))}e=e.sibling}}function Gh(e,t){if(e.tag===30){var a=e.stateNode,n=e.memoizedProps,o=En(n,a),l=On(n.default,a.paired?n.share:n.enter);l!=="none"?$r(e,o,l,null,!1)?(yc(e),a.paired||t||ur(e,n.onEnter)):un(e.child,!1):yc(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Gh(e,t),e=e.sibling;else yc(e)}function Yh(e){if(na!==null&&na.size!==0){var t=na;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,n=a.name;if(n!=null&&n!=="auto"){var o=t.get(n);if(o!==void 0){var l=On(a.default,a.share);if(l!=="none"&&($r(e,n,l,null,!1)?(l=e.stateNode,o.paired=l,l.paired=o,ur(e,a.onShare)):un(e.child,!1)),t.delete(n),t.size===0)break}}}Yh(e)}e=e.sibling}}}function Xh(e){if(e.tag===30){var t=e.memoizedProps,a=En(t,e.stateNode),n=na!==null?na.get(a):void 0,o=On(t.default,n!==void 0?t.share:t.exit);o!=="none"&&($r(e,a,o,null,!1)?n!==void 0?(o=e.stateNode,n.paired=o,o.paired=n,na.delete(a),ur(e,t.onShare)):ur(e,t.onExit):un(e.child,!1)),na!==null&&Yh(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Xh(e),e=e.sibling;else na!==null&&Yh(e)}function Jy(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=En(t,e.stateNode);t=On(t.default,t.update),e.flags&=-5,t!=="none"&&$r(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&Jy(e);e=e.sibling}}function Qh(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,un(e.child,!1))}Qh(e)}e=e.sibling}}function wc(e){if(e.tag===30)e.stateNode.paired=null,un(e.child,!1),Qh(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)wc(e),e=e.sibling;else Qh(e)}function Fy(e){for(e=e.child;e!==null;)e.tag===30?un(e.child,!1):(e.subtreeFlags&33554432)!==0&&Fy(e),e=e.sibling}function ep(e,t,a,n,o,l,c){for(var u=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(l!==null&&Xt<l.length){var g=l[Xt],$=cm(h);(g.view||$.view)&&(u=!0);var x;if(x=(e.flags&4)===0)if($.clip)x=!0;else{x=g.rect;var f=$.rect;x=x.y!==f.y||x.x!==f.x||x.height!==f.height||x.width!==f.width}x&&(e.flags|=4),$.abs?$=!g.abs:(g=g.rect,$=$.rect,$=g.height!==$.height||g.width!==$.width),$&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&Ow(h,Xt===0?a:a+"_"+Xt,o),u&&(e.flags&4)!==0||(an===null&&(an=[]),an.push(h,Xt===0?n:n+"_"+Xt,t.memoizedProps)),Xt++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:ep(e,t.child,a,n,o,l,c)&&(u=!0));t=t.sibling}return u}function Py(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,n=e.stateNode,o=En(a,n),l=On(a.default,a.update);if(t){n=n.clones;var c=n===null?null:n.map(y5)}else c=e.memoizedState,e.memoizedState=null;n=e;var u=e.child;Xt=0,o=ep(n,u,o,o,l,c,!1),(e.flags&4)!==0&&o&&(t||ur(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&Py(e,t);e=e.sibling}}var ct=!1,Ne=!1,Pa=!1,Jd=!1,xb=typeof WeakSet=="function"?WeakSet:Set,ut=null,Wa=!1,dl=!1,Zc=!1,Zh=!1;function GN(e,t,a){if(e=e.containerInfo,rm=fr,e=Hv(e),km(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var l=o.anchorOffset,c=o.focusNode;o=o.focusOffset;try{n.nodeType,c.nodeType}catch{n=null;break e}var u=0,h=-1,g=-1,$=0,x=0,f=e,b=null;t:for(;;){for(var C;f!==n||l!==0&&f.nodeType!==3||(h=u+l),f!==c||o!==0&&f.nodeType!==3||(g=u+o),f.nodeType===3&&(u+=f.nodeValue.length),(C=f.firstChild)!==null;)b=f,f=C;for(;;){if(f===e)break t;if(b===n&&++$===l&&(h=u),b===c&&++x===o&&(g=u),(C=f.nextSibling)!==null)break;f=b,b=f.parentNode}f=C}n=h===-1||g===-1?null:{start:h,end:g}}else n=null}n=n||{start:0,end:0}}else n=null;for(lm={focusedElem:e,selectionRange:n},fr=!1,a=(a&335544064)===a,ut=t,t=a?9270:1024;ut!==null;){if(e=ut,a&&(n=e.deletions,n!==null))for(l=0;l<n.length;l++)a&&Xh(n[l]);if(e.alternate===null&&(e.flags&2)!==0)a&&wb(e),ac(a);else{if(e.tag===22){if(n=e.alternate,e.memoizedState!==null){n!==null&&n.memoizedState===null&&a&&Xh(n),ac(a);continue}else if(n!==null&&n.memoizedState!==null){a&&wb(e),ac(a);continue}}n=e.child,(e.subtreeFlags&t)!==0&&n!==null?(n.return=e,ut=n):(a&&Jy(e),ac(a))}}na=null}function ac(e){for(;ut!==null;){var t=ut,a=e,n=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&n!==null){a=void 0,o=n.memoizedProps,n=n.memoizedState;var l=t.stateNode;try{var c=Ki(t.type,o);a=l.getSnapshotBeforeUpdate(c,n),l.__reactInternalSnapshotBeforeUpdate=a}catch(u){ke(t,t.return,u)}}break;case 3:if((o&1024)!==0){if(n=t.stateNode.containerInfo,a=n.nodeType,a===9)um(n);else if(a===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":um(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&n!==null&&(a=En(n.memoizedProps,n.stateNode),o=t.memoizedProps,o=On(o.default,o.update),o!=="none"&&$r(n,a,o,n.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(M(163))}if(n=t.sibling,n!==null){n.return=t.return,ut=n;break}ut=t.return}}function Wy(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:en(e,a),n&4&&Kl(5,a);break;case 1:if(en(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){ke(a,a.return,c)}else{var o=Ki(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){ke(a,a.return,c)}}n&64&&Yy(a),n&512&&tn(a,a.return);break;case 3:if(en(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{ty(e,t)}catch(c){ke(a,a.return,c)}}break;case 27:t===null&&n&4&&Zy(a);case 26:case 5:en(e,a),t===null&&n&4&&Lh(a),n&512&&tn(a,a.return);break;case 12:en(e,a);break;case 31:en(e,a),n&4&&nw(e,a);break;case 13:en(e,a),n&4&&iw(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=a5.bind(null,a),D5(e,a))));break;case 22:if(n=a.memoizedState!==null||ct,!n){var l=t!==null&&t.memoizedState!==null||Ne;t=ct,o=Ne,ct=n,(Ne=l)&&!o?(n=2,(a.subtreeFlags&8772)!==0&&(n|=1),Da(e,a,n)):en(e,a),ct=t,Ne=o}break;case 30:en(e,a),n&512&&tn(a,a.return);break;case 7:n&512&&tn(a,a.return);default:en(e,a)}}function Kh(e,t){for(e=e.child;e!==null;)ew(e,t),e=e.sibling}function ew(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var n=a.style;typeof n.setProperty=="function"?n.setProperty("display","none","important"):n.display="none"}else{var o=e.stateNode,l=e.memoizedProps.style,c=l!=null&&l.hasOwnProperty("display")?l.display:null;o.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){ke(e,e.return,h)}Jh(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,ye=!0}catch(h){ke(e,e.return,h)}break;case 18:try{var u=e.stateNode;t?Ub(u,!0):Ub(e.stateNode,!1)}catch(h){ke(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&Kh(e,t);break;default:Kh(e,t)}}function Jh(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,n=t;switch(a.tag){case 4:ew(a,n);break e;case 22:a.memoizedState===null&&Jh(a,n);break e;default:Jh(a,n)}}e=e.sibling}}function tw(e){var t=e.alternate;t!==null&&(e.alternate=null,tw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&iu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var je=null,Gt=!1;function Va(e,t,a){for(a=a.child;a!==null;)aw(e,t,a),a=a.sibling}function aw(e,t,a){if(ra&&typeof ra.onCommitFiberUnmount=="function")try{ra.onCommitFiberUnmount(Ll,a)}catch{}switch(a.tag){case 26:Ne||bt(a,t),Va(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!Ne&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Ne||bt(a,t),$l(a);var n=je,o=Gt;bi(a.type)&&(je=a.stateNode,Gt=!1),Va(e,t,a),jw(a.stateNode,a.type,a.memoizedProps),je=n,Gt=o;break;case 5:Ne||bt(a,t),$l(a);case 6:if(a.tag===6&&$l(a),n=je,o=Gt,je=null,Va(e,t,a),je=n,Gt=o,je!==null)if(Gt)try{(je.nodeType===9?je.body:je.nodeName==="HTML"?je.ownerDocument.body:je).removeChild(a.stateNode),ye=!0}catch(l){ke(a,t,l)}else try{je.removeChild(a.stateNode),ye=!0}catch(l){ke(a,t,l)}break;case 18:je!==null&&(Gt?(e=je,Hb(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),br(e)):Hb(je,a.stateNode));break;case 4:n=je,o=Gt,je=a.stateNode.containerInfo,Gt=!0,Va(e,t,a),je=n,Gt=o;break;case 0:case 11:case 14:case 15:pi(2,a,t),Ne||pi(4,a,t),Va(e,t,a);break;case 1:Ne||(bt(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&Xy(a,t,n)),Va(e,t,a);break;case 21:Va(e,t,a);break;case 22:Ne=(n=Ne)||a.memoizedState!==null,Va(e,t,a),Ne=n;break;case 30:bt(a,t),Va(e,t,a);break;case 7:Ne||bt(a,t),Va(e,t,a);break;default:Va(e,t,a)}}function nw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{br(e)}catch(a){ke(t,t.return,a)}}}function iw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{br(e)}catch(a){ke(t,t.return,a)}}function YN(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new xb),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new xb),t;default:throw Error(M(435,e.tag))}}function nc(e,t){var a=YN(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var o=n5.bind(null,e,n);n.then(o,o)}})}function Dt(e,t,a){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var l=n[o],c=e,u=t,h=u;e:for(;h!==null;){switch(h.tag){case 27:if(bi(h.type)){je=h.stateNode,Gt=!1;break e}break;case 5:je=h.stateNode,Gt=!1;break e;case 3:case 4:je=h.stateNode.containerInfo,Gt=!0;break e}h=h.return}if(je===null)throw Error(M(160));aw(c,u,l),je=null,Gt=!1,c=l.alternate,c!==null&&(c.return=null),l.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)ow(t,e,a),t=t.sibling}var _a=null;function ow(e,t,a){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(n=e.updateQueue,n=n!==null?n.events:null,n!==null))for(var l=0;l<n.length;l++){var c=n[l];c.ref.impl=c.nextImpl}Dt(t,e,a),_t(e),o&4&&(pi(3,e,e.return),Kl(3,e),pi(5,e,e.return));break;case 1:Dt(t,e,a),_t(e),o&512&&(Ne||n===null||bt(n,n.return)),o&64&&ct&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(l=_a,Dt(t,e,a),_t(e),o&512&&(Ne||n===null||bt(n,n.return)),o&4)if(o=n!==null?n.memoizedState:null,a=e.memoizedState,n===null)if(a===null)if(e.stateNode===null)if(ct)e.stateNode=Rw(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=l.ownerDocument||l;t:switch(t){case"title":n=o.getElementsByTagName("title")[0],(!n||n[Yl]||n[vt]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=o.createElement(t),o.head.insertBefore(n,o.querySelector("head > title"))),xt(n,t,a),n[vt]=e,dt(n),t=n;break e;case"link":if(l=Xb("link","href",o).get(t+(a.href||""))){for(c=0;c<l.length;c++)if(n=l[c],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){l.splice(c,1);break t}}n=o.createElement(t),xt(n,t,a),o.head.appendChild(n);break;case"meta":if(l=Xb("meta","content",o).get(t+(a.content||""))){for(c=0;c<l.length;c++)if(n=l[c],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){l.splice(c,1);break t}}n=o.createElement(t),xt(n,t,a),o.head.appendChild(n);break;default:throw Error(M(468,t))}n[vt]=e,dt(n),t=n}e.stateNode=t}else ct||mm(l,e.type,e.stateNode);else e.stateNode=Yb(l,a,e.memoizedProps);else o!==a?(o===null?(t=n.stateNode,t===null||Ne||t.parentNode.removeChild(t)):o.count--,a===null?ct||mm(l,e.type,e.stateNode):Yb(l,a,e.memoizedProps)):a===null&&e.stateNode!==null&&Zd(e,e.memoizedProps,n.memoizedProps);break;case 27:Dt(t,e,a),_t(e),o&512&&(Ne||n===null||bt(n,n.return)),n!==null&&o&4&&Zd(e,e.memoizedProps,n.memoizedProps);break;case 5:if(l=Pa,Pa=!1,Dt(t,e,a),Pa=l,_t(e),o&512&&(Ne||n===null||bt(n,n.return)),e.flags&32){t=e.stateNode;try{lr(t,""),ye=!0}catch($){ke(e,e.return,$)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,Zd(e,t,n!==null?n.memoizedProps:t)),o&1024&&(Jd=!0);break;case 6:if(Dt(t,e,a),_t(e),o&4){if(e.stateNode===null)throw Error(M(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,ye=!0}catch($){ke(e,e.return,$)}}break;case 3:if(ye=!1,Sc=null,l=_a,_a=Hl(t.containerInfo),Dt(t,e,a),_a=l,_t(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{br(t.containerInfo)}catch($){ke(e,e.return,$)}Jd&&(Jd=!1,rw(e)),ye=!1;break;case 4:o=Pa,Pa=ct,n=Cf(),l=_a,_a=Hl(e.stateNode.containerInfo),Dt(t,e,a),_t(e),_a=l,ye&&dl&&(Zc=!0),ye=n,Pa=o;break;case 12:Dt(t,e,a),_t(e);break;case 31:Dt(t,e,a),_t(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,nc(e,t)));break;case 13:Dt(t,e,a),_t(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(bu=oa()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,nc(e,t)));break;case 22:l=e.memoizedState!==null,c=n!==null&&n.memoizedState!==null;var u=ct,h=Ne,g=Pa;ct=u||l,Pa=g||l,Ne=h||c,Dt(t,e,a),Ne=h,Pa=g,ct=u,_t(e),o&8192&&(t=e.stateNode,t._visibility=l?t._visibility&-2:t._visibility|1,!l||n===null||c||ct||Ne||(t=c||Ne,a=ct,n=Ne,ct=l||ct,Ne=t,Yn(e,2),ct=a,Ne=n),!l&&Pa||Kh(e,l)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,nc(e,a))));break;case 19:Dt(t,e,a),_t(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,nc(e,t)));break;case 30:o&512&&(Ne||n===null||bt(n,n.return)),o=Cf(),l=dl,c=(a&335544064)===a,u=e.memoizedProps,dl=c&&On(u.default,u.update)!=="none",Dt(t,e,a),_t(e),c&&n!==null&&ye&&(e.flags|=4),dl=l,ye=o;break;case 21:break;case 7:o&512&&(Ne||n===null||bt(n,n.return)),n&&n.stateNode!==null&&(n.stateNode._fragmentFiber=e);default:Dt(t,e,a),_t(e)}}function _t(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(Qy(n)){a=n;break}n=n.return}n=null;for(var o=e.return;o!==null;){if(Wm(o)){var l=o.stateNode;n===null?n=[l]:n.push(l)}if(Pm(o))break;o=o.return}var c=n;if(a==null)throw Error(M(160));switch(a.tag){case 27:var u=a.stateNode,h=Kd(e);Xc(e,h,u,c);break;case 5:var g=a.stateNode;a.flags&32&&(lr(g,""),a.flags&=-33);var $=Kd(e);Xc(e,$,g,c);break;case 3:case 4:var x=a.stateNode.containerInfo,f=Kd(e);jh(e,f,x,c);break;default:throw Error(M(161))}}catch(b){ke(e,e.return,b)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function rw(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;rw(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,fr=!0,t.reset(),fr=!1),e=e.sibling}}function Oo(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)lw(t,e),t=t.sibling;else Py(t,!1)}function lw(e,t){var a=e.alternate;if(a===null)Gh(e,!1);else switch(e.tag){case 3:if(Zh=Wa=!1,$b(),Oo(t,e),!Wa&&!Zc){if(e=an,e!==null)for(var n=0;n<e.length;n+=3){a=e[n];var o=e[n+1];Vw(a,e[n+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),Zh=!0}an=null;break;case 5:Oo(t,e);break;case 4:n=Wa,Wa=!1,Oo(t,e),Wa&&(Zc=!0),Wa=n;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Gh(e,!1):Oo(t,e));break;case 30:n=Wa,o=$b(),Wa=!1,Oo(t,e),Wa&&(e.flags|=4);var l=e.memoizedProps,c=e.stateNode;t=En(l,c),c=En(a.memoizedProps,c);var u=On(l.default,l.update);u==="none"?t=!1:(l=a.memoizedState,a.memoizedState=null,a=e.child,Xt=0,t=ep(e,a,t,c,u,l,!0),Xt!==(l===null?0:l.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(ur(e,e.memoizedProps.onUpdate),an=o):o!==null&&(o.push.apply(o,an),an=o),Wa=(e.flags&32)!==0?!0:n;break;default:Oo(t,e)}}function en(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Wy(e,t.alternate,t),t=t.sibling}function Yn(e,t){for(e=e.child;e!==null;){var a=e,n=t;switch(a.tag){case 0:case 11:case 14:case 15:pi(4,a,a.return),Yn(a,n);break;case 1:bt(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&Xy(a,a.return,o),Yn(a,n);break;case 27:(n&2)!==0&&jw(a.stateNode,a.type,a.memoizedProps);case 5:bt(a,a.return),a.tag!==5&&a.tag!==27||$l(a),Yn(a,n);break;case 6:$l(a);break;case 26:bt(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||Ne||o.parentNode.removeChild(o),Yn(a,n);break;case 22:a.memoizedState===null&&Yn(a,n);break;case 30:bt(a,a.return),Yn(a,n);break;case 7:bt(a,a.return);default:Yn(a,n)}e=e.sibling}}function Da(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var n=t.alternate,o=e,l=t,c=l.flags,u=(a&1)!==0;switch(l.tag){case 0:case 11:case 15:Da(o,l,a),Kl(4,l);break;case 1:if(Da(o,l,a),n=l,o=n.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch($){ke(n,n.return,$)}if(n=l,o=n.updateQueue,o!==null){var h=n.stateNode;try{var g=o.shared.hiddenCallbacks;if(g!==null)for(o.shared.hiddenCallbacks=null,o=0;o<g.length;o++)ey(g[o],h)}catch($){ke(n,n.return,$)}}u&&c&64&&Yy(l),tn(l,l.return);break;case 27:(a&2)!==0&&Zy(l);case 5:l.tag!==5&&l.tag!==27||yb(l),Da(o,l,a),u&&n===null&&c&4&&Lh(l),tn(l,l.return);break;case 6:yb(l);break;case 26:h=l.stateNode,l.memoizedState!==null||h===null||ct||mm(Hl(h.ownerDocument),l.type,h),Da(o,l,a),u&&n===null&&c&4&&Lh(l),tn(l,l.return);break;case 12:Da(o,l,a);break;case 31:Da(o,l,a),u&&c&4&&nw(o,l);break;case 13:Da(o,l,a),u&&c&4&&iw(o,l);break;case 22:l.memoizedState===null&&Da(o,l,a),tn(l,l.return);break;case 30:Da(o,l,a),tn(l,l.return);break;case 7:tn(l,l.return);default:Da(o,l,a)}t=t.sibling}}function tp(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Ql(a))}function ap(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Ql(e))}function va(e,t,a,n){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)sw(e,t,a,n),t=t.sibling;else o&&Fy(t)}function sw(e,t,a,n){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&wc(t);var l=t.flags;switch(t.tag){case 0:case 11:case 15:va(e,t,a,n),l&2048&&Kl(9,t);break;case 1:va(e,t,a,n);break;case 3:va(e,t,a,n),o&&Zh&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),l&2048&&(l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&Ql(l)));break;case 12:if(l&2048){va(e,t,a,n),l=t.stateNode;try{var c=t.memoizedProps,u=c.id,h=c.onPostCommit;typeof h=="function"&&h(u,t.alternate===null?"mount":"update",l.passiveEffectDuration,-0)}catch(g){ke(t,t.return,g)}}else va(e,t,a,n);break;case 31:va(e,t,a,n);break;case 13:va(e,t,a,n);break;case 23:break;case 22:c=t.stateNode,u=t.alternate,t.memoizedState!==null?(o&&u!==null&&u.memoizedState===null&&wc(u),c._visibility&2?va(e,t,a,n):xl(e,t)):(o&&u!==null&&u.memoizedState!==null&&wc(t),c._visibility&2?va(e,t,a,n):(c._visibility|=2,Do(e,t,a,n,(t.subtreeFlags&10256)!==0||!1))),l&2048&&tp(u,t);break;case 24:va(e,t,a,n),l&2048&&ap(t.alternate,t);break;case 30:o&&(l=t.alternate,l!==null&&(un(l.child,!0),un(t.child,!0))),va(e,t,a,n);break;default:va(e,t,a,n)}}function Do(e,t,a,n,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var l=e,c=t,u=a,h=n,g=c.flags;switch(c.tag){case 0:case 11:case 15:Do(l,c,u,h,o),Kl(8,c);break;case 23:break;case 22:var $=c.stateNode;c.memoizedState!==null?$._visibility&2?Do(l,c,u,h,o):xl(l,c):($._visibility|=2,Do(l,c,u,h,o)),o&&g&2048&&tp(c.alternate,c);break;case 24:Do(l,c,u,h,o),o&&g&2048&&ap(c.alternate,c);break;default:Do(l,c,u,h,o)}t=t.sibling}}function xl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,o=n.flags;switch(n.tag){case 22:xl(a,n),o&2048&&tp(n.alternate,n);break;case 24:xl(a,n),o&2048&&ap(n.alternate,n);break;default:xl(a,n)}t=t.sibling}}var Di=8192;function Ri(e,t,a){if(e.subtreeFlags&Di)for(e=e.child;e!==null;)cw(e,t,a),e=e.sibling}function cw(e,t,a){switch(e.tag){case 26:Ri(e,t,a),e.flags&Di&&(e.memoizedState!==null?K5(a,_a,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Zb(a,e)));break;case 5:Ri(e,t,a),e.flags&Di&&(e=e.stateNode,(t&335544128)===t&&Zb(a,e));break;case 3:case 4:var n=_a;_a=Hl(e.stateNode.containerInfo),Ri(e,t,a),_a=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=Di,Di=16777216,Ri(e,t,a),Di=n):Ri(e,t,a));break;case 30:if((e.flags&Di)!==0&&(n=e.memoizedProps.name,n!=null&&n!=="auto")){var o=e.stateNode;o.paired=null,na===null&&(na=new Map),na.set(n,o)}Ri(e,t,a);break;default:Ri(e,t,a)}}function uw(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function il(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];ut=n,hw(n,e)}uw(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)dw(e),e=e.sibling}function dw(e){switch(e.tag){case 0:case 11:case 15:il(e),e.flags&2048&&pi(9,e,e.return);break;case 3:il(e);break;case 12:il(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,$c(e)):il(e);break;default:il(e)}}function $c(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];ut=n,hw(n,e)}uw(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:pi(8,t,t.return),$c(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,$c(t));break;default:$c(t)}e=e.sibling}}function hw(e,t){for(;ut!==null;){var a=ut;switch(a.tag){case 0:case 11:case 15:pi(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:Ql(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,ut=n;else e:for(a=e;ut!==null;){n=ut;var o=n.sibling,l=n.return;if(tw(n),n===a){ut=null;break e}if(o!==null){o.return=l,ut=o;break e}ut=l}}}var XN={getCacheForType:function(e){var t=yt(et),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return yt(et).controller.signal}},QN=typeof WeakMap=="function"?WeakMap:Map,$e=0,Oe=null,he=null,me=0,Se=0,ea=null,Pn=!1,xr=!1,np=!1,Mn=0,Ke=0,gi=0,Li=0,Kc=0,ia=0,cr=0,Nl=null,Yt=null,Fh=!1,bu=0,mw=0,Jc=1/0,Fc=null,li=null,Ye=0,Ua=null,Ji=null,cn=0,Ph=0,Wh=null,pw=null,ar=null,nr=null,ir=null,Sl=0,xc=null;function sa(){return($e&2)!==0&&me!==0?me&-me:ee.T!==null?op():vv()}function gw(){if(ia===0)if((me&536870912)===0||ce){var e=Gs;Gs<<=1,(Gs&3932160)===0&&(Gs=262144),ia=e}else ia=536870912;return e=Nt.current,e!==null&&(e.flags|=32),ia}function ur(e,t){if(t!=null){var a=e.stateNode,n=a.ref;n===null&&(n=a.ref=_w(En(e.memoizedProps,a))),nr===null&&(nr=[]),nr.push(t.bind(null,n))}}function Zt(e,t,a){(e===Oe&&(Se===2||Se===9)||e.cancelPendingCommit!==null)&&(dr(e,0),Wn(e,me,ia,!1)),Gl(e,a),(($e&2)===0||e!==Oe)&&(e===Oe&&(($e&2)===0&&(Li|=a),Ke===4&&Wn(e,me,ia,!1)),hn(e))}function fw(e,t,a){if(($e&6)!==0)throw Error(M(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||jl(e,t),o=n?JN(e,t):Fd(e,t,!0),l=n;do{if(o===0){xr&&!n&&Wn(e,t,0,!1);break}else{if(a=e.current.alternate,l&&!ZN(a)){o=Fd(e,t,!1),l=!1;continue}if(o===2){if(l=t,e.errorRecoveryDisabledLanes&l)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var u=e;o=Nl;var h=u.current.memoizedState.isDehydrated;if(h&&(dr(u,c).flags|=256),c=Fd(u,c,!1),c!==2&&c!==6){if(np&&!h){u.errorRecoveryDisabledLanes|=l,Li|=l,o=4;break e}l=Yt,Yt=o,l!==null&&(Yt===null?Yt=l:Yt.push.apply(Yt,l))}o=c}if(l=!1,o!==2)continue}}if(o===1){dr(e,0),Wn(e,t,0,!0);break}e:{switch(n=e,l=o,l){case 0:case 1:throw Error(M(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:Wn(n,t,ia,!Pn);break e;case 2:Yt=null;break;case 3:case 5:break;default:throw Error(M(329))}if((t&62914560)===t&&(o=bu+300-oa(),10<o)){if(Wn(n,t,ia,!Pn),nu(n,0,!0)!==0)break e;cn=t,n.timeoutHandle=lp(Nb.bind(null,n,a,Yt,Fc,Fh,t,ia,Li,cr,Pn,l,"Throttled",-0,0),o);break e}Nb(n,a,Yt,Fc,Fh,t,ia,Li,cr,Pn,l,null,-0,0)}}break}while(!0);hn(e)}function Nb(e,t,a,n,o,l,c,u,h,g,$,x,f,b){e.timeoutHandle=-1;var C=t.subtreeFlags,k=(l&335544064)===l;if(x=null,(k||C&8192||(C&16785408)===16785408)&&(x={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:on},na=null,cw(t,l,x),k&&(C=x,k=e.containerInfo,k=(k.nodeType===9?k:k.ownerDocument).__reactViewTransition,k!=null&&(C.count++,C.waitingForViewTransition=!0,C=Ul.bind(C),k.finished.then(C,C))),C=(l&62914560)===l?bu-oa():(l&4194048)===l?mw-oa():0,C=J5(x,C),C!==null)){cn=l,e.cancelPendingCommit=C(Tb.bind(null,e,t,l,a,n,o,c,u,h,g,$,x,null,f,b)),Wn(e,l,c,!g);return}Tb(e,t,l,a,n,o,c,u,h,g,$,x)}function ZN(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var o=a[n],l=o.getSnapshot;o=o.value;try{if(!ca(l(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Wn(e,t,a,n){t=mv(e,t),t&=~Kc,t&=~Li,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var o=t;0<o;){var l=31-la(o),c=1<<l;n[l]=-1,o&=~c}a!==0&&gv(e,a,t)}function vu(){return($e&6)===0?(Jl(0,!1),!1):!0}function ip(){if(he!==null){if(Se===0)var e=he.return;else e=he,Nn=to=null,Bm(e),Wo=null,Ml=0,e=he;for(;e!==null;)Gy(e.alternate,e),e=e.return;he=null}}function dr(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,f5(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),cn=0,ip(),Oe=e,he=a=Sn(e.current,null),me=t,Se=0,ea=null,Pn=!1,xr=jl(e,t),np=!1,cr=ia=Kc=Li=gi=Ke=0,Yt=Nl=null,Fh=!1,Mn=mv(e,t),su(),a}function bw(e,t){ie=null,ee.H=jc,t===wr||t===du?(t=Jf(),Se=3):t===Om?(t=Jf(),Se=4):Se=t===Km?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,ea=t,he===null&&(Ke=1,Gc(e,Na(t,e.current)))}function vw(){var e=Nt.current;return e===null?!0:(me&4194048)===me?Ct===null:(me&62914560)===me||(me&536870912)!==0?e===Ct:!1}function yw(){var e=ee.H;return ee.H=jc,e===null?jc:e}function ww(){var e=ee.A;return ee.A=XN,e}function Pc(){Ke=4,Pn||(me&4194048)!==me&&Nt.current!==null||(xr=!0),(gi&134217727)===0&&(Li&134217727)===0||Oe===null||Wn(Oe,me,ia,!1)}function Fd(e,t,a){var n=$e;$e|=2;var o=yw(),l=ww();(Oe!==e||me!==t)&&(Fc=null,dr(e,t)),t=!1;var c=Ke;e:do try{if(Se!==0&&he!==null){var u=he,h=ea;switch(Se){case 8:ip(),c=6;break e;case 3:case 2:case 9:case 6:Nt.current===null&&(t=!0);var g=Se;if(Se=0,ea=null,Zo(e,u,h,g),a&&xr){c=0;break e}break;default:g=Se,Se=0,ea=null,Zo(e,u,h,g)}}KN(),c=Ke;break}catch($){bw(e,$)}while(!0);return t&&e.shellSuspendCounter++,Nn=to=null,$e=n,ee.H=o,ee.A=l,he===null&&(Oe=null,me=0,su()),c}function KN(){for(;he!==null;)$w(he)}function JN(e,t){var a=$e;$e|=2;var n=yw(),o=ww();Oe!==e||me!==t?(Fc=null,Jc=oa()+500,dr(e,t)):xr=jl(e,t);e:do try{if(Se!==0&&he!==null){t=he;var l=ea;t:switch(Se){case 1:Se=0,ea=null,Zo(e,t,l,1);break;case 2:case 9:if(Kf(l)){Se=0,ea=null,Sb(t);break}t=function(){Se!==2&&Se!==9||Oe!==e||(Se=7),hn(e)},l.then(t,t);break e;case 3:Se=7;break e;case 4:Se=5;break e;case 7:Kf(l)?(Se=0,ea=null,Sb(t)):(Se=0,ea=null,Zo(e,t,l,7));break;case 5:var c=null;switch(he.tag){case 26:c=he.memoizedState;case 5:case 27:var u=he;if(c?Xw(c):u.stateNode.complete){Se=0,ea=null;var h=u.sibling;if(h!==null)he=h;else{var g=u.return;g!==null?(he=g,yu(g)):he=null}break t}}Se=0,ea=null,Zo(e,t,l,5);break;case 6:Se=0,ea=null,Zo(e,t,l,6);break;case 8:ip(),Ke=6;break e;default:throw Error(M(462))}}FN();break}catch($){bw(e,$)}while(!0);return Nn=to=null,ee.H=n,ee.A=o,$e=a,he!==null?0:(Oe=null,me=0,su(),Ke)}function FN(){for(;he!==null&&!px();)$w(he)}function $w(e){var t=jy(e.alternate,e,Mn);e.memoizedProps=e.pendingProps,t===null?yu(e):he=t}function Sb(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=hb(a,t,t.pendingProps,t.type,void 0,me);break;case 11:t=hb(a,t,t.pendingProps,t.type.render,t.ref,me);break;case 5:Bm(t);var n=t;n===ht&&(ce?(_c(n),n.tag===5&&n.stateNode!=null&&(Ue=n.stateNode)):(_c(n),ce=!0));default:Gy(a,t),t=he=Yv(t,Mn),t=jy(a,t,Mn)}e.memoizedProps=e.pendingProps,t===null?yu(e):he=t}function Zo(e,t,a,n){Nn=to=null,Bm(t),Wo=null,Ml=0;var o=t.return;try{if(UN(e,o,t,a,me)){Ke=1,Gc(e,Na(a,e.current)),he=null;return}}catch(l){if(o!==null)throw he=o,l;Ke=1,Gc(e,Na(a,e.current)),he=null;return}t.flags&32768?(ce||n===1?e=!0:xr||(me&536870912)!==0?e=!1:(Pn=e=!0,(n===2||n===9||n===3||n===6)&&(n=Nt.current,n!==null&&n.tag===13&&(n.flags|=16384))),xw(t,e)):yu(t)}function yu(e){var t=e;do{if((t.flags&32768)!==0){xw(t,Pn);return}e=t.return;var a=LN(t.alternate,t,Mn);if(a!==null){he=a;return}if(t=t.sibling,t!==null){he=t;return}he=t=e}while(t!==null);Ke===0&&(Ke=5)}function xw(e,t){do{var a=jN(e.alternate,e);if(a!==null){a.flags&=32767,he=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){he=e;return}he=e=a}while(e!==null);Ke=6,he=null}function Tb(e,t,a,n,o,l,c,u,h,g,$,x){e.cancelPendingCommit=null;do wu();while(Ye!==0);if(($e&6)!==0)throw Error(M(327));if(t!==null){if(t===e.current)throw Error(M(177));e===Oe&&(he=Oe=null,me=0),Ji=t,Ua=e,cn=a,Wh=o,pw=n,PN(e,t,a,c,u,h,x)}}function PN(e,t,a,n,o,l,c){var u=t.lanes|t.childLanes;if(Ph=u,u|=Em,Sx(e,a,u,n,o,l),nr=null,(a&335544064)===a?(ir=kN(e),n=10262):(ir=null,n=10256),(t.subtreeFlags&n)!==0||(t.flags&n)!==0?(e.callbackNode=null,e.callbackPriority=0,i5(Mc,function(){return nm(),null})):(e.callbackNode=null,e.callbackPriority=0),Qc=!1,n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=ee.T,ee.T=null,o=xe.p,xe.p=2,l=$e,$e|=4;try{GN(e,t,a)}finally{$e=l,xe.p=o,ee.T=n}}Ye=1,Qc?ar=x5(c,e.containerInfo,ir,em,tm,e5,am,nm,WN,null,null):(em(),tm(),am())}function WN(e){if(Ye!==0){var t=Ua.onRecoverableError;t(e,{componentStack:null})}}function e5(){Ye===3&&(Ye=0,lw(Ji,Ua),Ye=4)}function em(){if(Ye===1){Ye=0;var e=Ua,t=Ji,a=cn,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=ee.T,ee.T=null;var o=xe.p;xe.p=2;var l=$e;$e|=4;try{dl=Zc=!1,ow(t,e,a),a=lm;var c=Hv(e.containerInfo),u=a.focusedElem,h=a.selectionRange;if(c!==u&&u&&u.ownerDocument&&_v(u.ownerDocument.documentElement,u)){if(h!==null&&km(u)){var g=h.start,$=h.end;if($===void 0&&($=g),"selectionStart"in u)u.selectionStart=g,u.selectionEnd=Math.min($,u.value.length);else{var x=u.ownerDocument||document,f=x&&x.defaultView||window;if(f.getSelection){var b=f.getSelection(),C=u.textContent.length,k=Math.min(h.start,C),R=h.end===void 0?k:Math.min(h.end,C);!b.extend&&k>R&&(c=R,R=k,k=c);var w=Bf(u,k),y=Bf(u,R);if(w&&y&&(b.rangeCount!==1||b.anchorNode!==w.node||b.anchorOffset!==w.offset||b.focusNode!==y.node||b.focusOffset!==y.offset)){var v=x.createRange();v.setStart(w.node,w.offset),b.removeAllRanges(),k>R?(b.addRange(v),b.extend(y.node,y.offset)):(v.setEnd(y.node,y.offset),b.addRange(v))}}}}for(x=[],b=u;b=b.parentNode;)b.nodeType===1&&x.push({element:b,left:b.scrollLeft,top:b.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<x.length;u++){var S=x[u];S.element.scrollLeft=S.left,S.element.scrollTop=S.top}}fr=!!rm,lm=rm=null}finally{$e=l,xe.p=o,ee.T=n}}e.current=t,Ye=2}}function tm(){if(Ye===2){Ye=0;var e=Ua,t=Ji,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=ee.T,ee.T=null;var n=xe.p;xe.p=2;var o=$e;$e|=4;try{Wy(e,t.alternate,t)}finally{$e=o,xe.p=n,ee.T=a}}Ye=3}}function am(){if(Ye===4||Ye===3){Ye=0;var e=ar;ar=null,gx();var t=Ua,a=Ji,n=cn,o=pw,l=(n&335544064)===n?10262:10256;if((a.subtreeFlags&l)!==0||(a.flags&l)!==0?Ye=5:(Ye=0,Ji=Ua=null,Nw(t,t.pendingLanes)),l=t.pendingLanes,l===0&&(li=null),wm(n),a=a.stateNode,ra&&typeof ra.onCommitFiberRoot=="function")try{ra.onCommitFiberRoot(Ll,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=ee.T,l=xe.p,xe.p=2,ee.T=null;try{for(var c=t.onRecoverableError,u=0;u<o.length;u++){var h=o[u];c(h.value,{componentStack:h.stack})}}finally{ee.T=a,xe.p=l}}if(o=nr,c=ir,ir=null,o!==null&&(nr=null,c===null&&(c=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(c),a!==void 0&&e.finished.finally(a);(cn&3)!==0&&wu(),hn(t),l=t.pendingLanes,(n&261930)!==0&&(l&42)!==0?t===xc?Sl++:(Sl=0,xc=t):(Sl=0,xc=null),Jl(0,!1)}}function Nw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Ql(t)))}function wu(){return ar!==null&&(ar.skipTransition(),ar=null),em(),tm(),am(),nm()}function nm(){if(Ye!==5)return!1;var e=Ua,t=Ph;Ph=0;var a=wm(cn),n=ee.T,o=xe.p;try{xe.p=32>a?32:a,ee.T=null,a=Wh,Wh=null;var l=Ua,c=cn;if(Ye=0,Ji=Ua=null,cn=0,($e&6)!==0)throw Error(M(331));var u=$e;if($e|=4,dw(l.current),sw(l,l.current,c,a),$e=u,Jl(0,!1),ra&&typeof ra.onPostCommitFiberRoot=="function")try{ra.onPostCommitFiberRoot(Ll,l)}catch{}return!0}finally{xe.p=o,ee.T=n,Nw(e,t)}}function kb(e,t,a){t=Na(a,t),t=_h(e.stateNode,t,2),e=ii(e,t,2),e!==null&&(Gl(e,2),hn(e))}function ke(e,t,a){if(e.tag===3)kb(e,e,a);else for(;t!==null;){if(t.tag===3){kb(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(li===null||!li.has(n))){e=Na(a,e),a=Uy(2),n=ii(t,a,2),n!==null&&(Iy(a,n,t,e),Gl(n,2),hn(n));break}}t=t.return}}function Pd(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new QN;var o=new Set;n.set(t,o)}else o=n.get(t),o===void 0&&(o=new Set,n.set(t,o));o.has(a)||(np=!0,o.add(a),e=t5.bind(null,e,t,a),t.then(e,e))}function t5(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Oe===e&&(me&a)===a&&((Ke===4||Ke===3&&(me&62914560)===me&&300>oa()-bu)&&($e&2)===0?dr(e,0):Kc|=a,cr===me&&(cr=0)),hn(e)}function Sw(e,t){t===0&&(t=pv()),e=eo(e,t),e!==null&&(Gl(e,t),hn(e))}function a5(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Sw(e,a)}function n5(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(M(314))}n!==null&&n.delete(t),Sw(e,a)}function i5(e,t){return vm(e,t)}var hr=null,_o=null,im=!1,Wc=!1,Wd=!1,ei=0;function hn(e){e!==_o&&e.next===null&&(_o===null?hr=_o=e:_o=_o.next=e),Wc=!0,im||(im=!0,r5())}function Jl(e,t){if(!Wd&&Wc){Wd=!0;do for(var a=!1,n=hr;n!==null;){if(!t)if(e!==0){var o=n.pendingLanes;if(o===0)var l=0;else{var c=n.suspendedLanes,u=n.pingedLanes;l=(1<<31-la(42|e)+1)-1,l&=o&~(c&~u),l=l&201326741?l&201326741|1:l?l|2:0}l!==0&&(a=!0,Eb(n,l))}else l=me,l=nu(n,n===Oe?l:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(l&3)===0||jl(n,l)||(a=!0,Eb(n,l));n=n.next}while(a);Wd=!1}}function o5(){Tw()}function Tw(){Wc=im=!1;var e=0;ei!==0&&g5()&&(e=ei);for(var t=oa(),a=null,n=hr;n!==null;){var o=n.next,l=kw(n,t);l===0?(n.next=null,a===null?hr=o:a.next=o,o===null&&(_o=a)):(a=n,(e!==0||(l&3)!==0)&&(Wc=!0)),n=o}Ye!==0&&Ye!==5||Jl(e,!1),ei!==0&&(ei=0)}function kw(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,o=e.expirationTimes,l=e.pendingLanes&-62914561;0<l;){var c=31-la(l),u=1<<c,h=o[c];h===-1?((u&a)===0||(u&n)!==0)&&(o[c]=Nx(u,t)):h<=t&&(e.expiredLanes|=u),l&=~u}if(t=Oe,a=me,a=nu(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(Se===2||Se===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&Md(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||jl(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&Md(n),wm(a)){case 2:case 8:a=dv;break;case 32:a=Mc;break;case 268435456:a=hv;break;default:a=Mc}return n=Ew.bind(null,e),a=vm(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&Md(n),e.callbackPriority=2,e.callbackNode=null,2}function Ew(e,t){if(Ye!==0&&Ye!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(wu()&&e.callbackNode!==a)return null;var n=me;return n=nu(e,e===Oe?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:(fw(e,n,t),kw(e,oa()),e.callbackNode!=null&&e.callbackNode===a?Ew.bind(null,e):null)}function Eb(e,t){if(wu())return null;fw(e,t,!0)}function r5(){b5(function(){($e&6)!==0?vm(uv,o5):Tw()})}function op(){if(ei===0){var e=Xi;e===0&&(e=js,js<<=1,(js&261888)===0&&(js=256)),ei=e}return ei}function Cb(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:uc(e)}function l5(e,t,a,n,o){if(t==="submit"&&a&&a.stateNode===o){var l=Cb((o[Jt]||null).action),c=n.submitter;c&&(t=(t=c[Jt]||null)?Cb(t.formAction):c.getAttribute("formAction"),t!==null&&(l=t,c=null));var u=new ou("action","action",null,n,o);e.push({event:u,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(ei!==0){var h=new FormData(o,c);Vh(a,{pending:!0,data:h,method:o.method,action:l},null,h)}}else typeof l=="function"&&(u.preventDefault(),h=new FormData(o,c),Vh(a,{pending:!0,data:h,method:o.method,action:l},l,h))},currentTarget:o}]})}}for(ic=0;ic<Nh.length;ic++)oc=Nh[ic],zb=oc.toLowerCase(),Ab=oc[0].toUpperCase()+oc.slice(1),Ia(zb,"on"+Ab);var oc,zb,Ab,ic;Ia(Iv,"onAnimationEnd");Ia(qv,"onAnimationIteration");Ia(Bv,"onAnimationStart");Ia("dblclick","onDoubleClick");Ia("focusin","onFocus");Ia("focusout","onBlur");Ia(vN,"onTransitionRun");Ia(yN,"onTransitionStart");Ia(wN,"onTransitionCancel");Ia(Lv,"onTransitionEnd");rr("onMouseEnter",["mouseout","mouseover"]);rr("onMouseLeave",["mouseout","mouseover"]);rr("onPointerEnter",["pointerout","pointerover"]);rr("onPointerLeave",["pointerout","pointerover"]);Pi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Pi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Pi("onBeforeInput",["compositionend","keypress","textInput","paste"]);Pi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Pi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Pi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Vl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),s5=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Vl));function Cw(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],o=n.event;n=n.listeners;e:{var l=void 0;if(t)for(var c=n.length-1;0<=c;c--){var u=n[c],h=u.instance,g=u.currentTarget;if(u=u.listener,h!==l&&o.isPropagationStopped())break e;l=u,o.currentTarget=g;try{l(o)}catch($){Oc($)}o.currentTarget=null,l=h}else for(c=0;c<n.length;c++){if(u=n[c],h=u.instance,g=u.currentTarget,u=u.listener,h!==l&&o.isPropagationStopped())break e;l=u,o.currentTarget=g;try{l(o)}catch($){Oc($)}o.currentTarget=null,l=h}}}}function de(e,t){var a=t[Sf];a===void 0&&(a=t[Sf]=new Set);var n=e+"__bubble";a.has(n)||(zw(t,e,2,!1),a.add(n))}function eh(e,t,a){var n=0;t&&(n|=4),zw(a,e,n,t)}var rc="_reactListening"+Math.random().toString(36).slice(2);function rp(e){if(!e[rc]){e[rc]=!0,wv.forEach(function(a){a!=="selectionchange"&&(s5.has(a)||eh(a,!1,e),eh(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[rc]||(t[rc]=!0,eh("selectionchange",!1,t))}}function zw(e,t,a,n){switch(Ww(t)){case 2:var o=eS;break;case 8:o=tS;break;default:o=mp}a=o.bind(null,t,a,e),o=void 0,!yh||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),n?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function th(e,t,a,n,o){var l=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var c=n.tag;if(c===3||c===4){var u=n.stateNode.containerInfo;if(u===o)break;if(c===4)for(c=n.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===o)return;c=c.return}for(;u!==null;){if(c=_i(u),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){n=l=c;continue e}u=u.parentNode}}n=n.return}Cv(function(){var g=l,$=xm(a),x=[];e:{var f=jv.get(e);if(f!==void 0){var b=ou,C=e;switch(e){case"keypress":if(hc(a)===0)break e;case"keydown":case"keyup":b=Zx;break;case"focusin":C="focus",b=Hd;break;case"focusout":C="blur",b=Hd;break;case"beforeblur":case"afterblur":b=Hd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":b=Rf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":b=_x;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":b=Wx;break;case Iv:case qv:case Bv:b=Ix;break;case Lv:b=tN;break;case"scroll":case"scrollend":b=Vx;break;case"wheel":b=nN;break;case"copy":case"cut":case"paste":b=Bx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":b=Vf;break;case"submit":b=Fx;break;case"toggle":case"beforetoggle":b=oN}var k=(t&4)!==0,R=!k&&(e==="scroll"||e==="scrollend"),w=k?f!==null?f+"Capture":null:f;k=[];for(var y=g,v;y!==null;){var S=y;if(v=S.stateNode,S=S.tag,S!==5&&S!==26&&S!==27||v===null||w===null||(S=kl(y,w),S!=null&&k.push(Dl(y,S,v))),R)break;y=y.return}0<k.length&&(f=new b(f,C,null,a,$),x.push({event:f,listeners:k}))}}if((t&7)===0){e:{if(b=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",b&&a!==vh&&(C=a.relatedTarget||a.fromElement)&&(_i(C)||C[vr]))break e;(f||b)&&(C=$.window===$?$:(b=$.ownerDocument)?b.defaultView||b.parentWindow:window,f?(b=a.relatedTarget||a.toElement,f=g,b=b?_i(b):null,b!==null&&(R=Bl(b),k=b.tag,b!==R||k!==5&&k!==27&&k!==6)&&(b=null)):(f=null,b=g),f!==b&&(k=Rf,S="onMouseLeave",w="onMouseEnter",y="mouse",(e==="pointerout"||e==="pointerover")&&(k=Vf,S="onPointerLeave",w="onPointerEnter",y="pointer"),R=f==null?C:cl(f),v=b==null?C:cl(b),C=new k(S,y+"leave",f,a,$),C.target=R,C.relatedTarget=v,S=null,_i($)===g&&(k=new k(w,y+"enter",b,a,$),k.target=v,k.relatedTarget=R,S=k),R=S,k=f&&b?rh(f,b,c5):null,f!==null&&Mb(x,C,f,k,!1),b!==null&&R!==null&&Mb(x,R,b,k,!0)))}e:{if(f=g?cl(g):window,b=f.nodeName&&f.nodeName.toLowerCase(),b==="select"||b==="input"&&f.type==="file")var O=Uf;else if(Hf(f))if(Vv)O=gN;else{O=mN;var P=hN}else b=f.nodeName,!b||b.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?g&&$m(g.elementType)&&(O=Uf):O=pN;if(O&&(O=O(e,g))){Ov(x,O,a,$);break e}P&&P(e,f,g)}switch(P=g?cl(g):window,e){case"focusin":(Hf(P)||P.contentEditable==="true")&&(Lo=P,$h=g,pl=null);break;case"focusout":pl=$h=Lo=null;break;case"mousedown":xh=!0;break;case"contextmenu":case"mouseup":case"dragend":xh=!1,Lf(x,a,$);break;case"selectionchange":if(bN)break;case"keydown":case"keyup":Lf(x,a,$)}var H;if(Tm)e:{switch(e){case"compositionstart":var B="onCompositionStart";break e;case"compositionend":B="onCompositionEnd";break e;case"compositionupdate":B="onCompositionUpdate";break e}B=void 0}else Bo?Mv(e,a)&&(B="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(B="onCompositionStart");B&&(Av&&a.locale!=="ko"&&(Bo||B!=="onCompositionStart"?B==="onCompositionEnd"&&Bo&&(H=zv()):(Jn=$,Nm="value"in Jn?Jn.value:Jn.textContent,Bo=!0)),P=eu(g,B),0<P.length&&(B=new Of(B,e,null,a,$),x.push({event:B,listeners:P}),H?B.data=H:(H=Rv(a),H!==null&&(B.data=H)))),(H=lN?sN(e,a):cN(e,a))&&(B=eu(g,"onBeforeInput"),0<B.length&&(P=new Of("onBeforeInput","beforeinput",null,a,$),x.push({event:P,listeners:B}),P.data=H)),l5(x,e,g,a,$)}Cw(x,t)})}function Dl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function eu(e,t){for(var a=t+"Capture",n=[];e!==null;){var o=e,l=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||l===null||(o=kl(e,a),o!=null&&n.unshift(Dl(e,o,l)),o=kl(e,t),o!=null&&n.push(Dl(e,o,l))),e.tag===3)return n;e=e.return}return[]}function c5(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Mb(e,t,a,n,o){for(var l=t._reactName,c=[];a!==null&&a!==n;){var u=a,h=u.alternate,g=u.stateNode;if(u=u.tag,h!==null&&h===n)break;u!==5&&u!==26&&u!==27||g===null||(h=g,o?(g=kl(a,l),g!=null&&c.unshift(Dl(a,g,h))):o||(g=kl(a,l),g!=null&&c.push(Dl(a,g,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var u5=/\r\n?/g,d5=/\u0000|\uFFFD/g;function Rb(e){return(typeof e=="string"?e:""+e).replace(u5,`
`).replace(d5,"")}function Aw(e,t){return t=Rb(t),Rb(e)===t}function Te(e,t,a,n,o,l){switch(a){case"children":if(typeof n=="string")t==="body"||t==="textarea"&&n===""||lr(e,n);else if(typeof n=="number"||typeof n=="bigint")t!=="body"&&lr(e,""+n);else return;break;case"className":Xs(e,"class",n);break;case"tabIndex":Xs(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":Xs(e,a,n);break;case"style":Ev(e,n,l);return;case"data":if(t!=="object"){Xs(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=uc(n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof l=="function"&&(a==="formAction"?(t!=="input"&&Te(e,t,"name",o.name,o,null),Te(e,t,"formEncType",o.formEncType,o,null),Te(e,t,"formMethod",o.formMethod,o,null),Te(e,t,"formTarget",o.formTarget,o,null)):(Te(e,t,"encType",o.encType,o,null),Te(e,t,"method",o.method,o,null),Te(e,t,"target",o.target,o,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=uc(n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=on);return;case"onScroll":n!=null&&de("scroll",e);return;case"onScrollEnd":n!=null&&de("scrollend",e);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(M(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(M(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=uc(n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":de("beforetoggle",e),de("toggle",e),cc(e,"popover",n);break;case"xlinkActuate":wn(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":wn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":wn(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":wn(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":wn(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":wn(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":wn(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":wn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":wn(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":cc(e,"is",n);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=Rx.get(a)||a,cc(e,a,n);else return}ye=!0}function om(e,t,a,n,o,l){switch(a){case"style":Ev(e,n,l);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(M(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(M(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof n=="string")lr(e,n);else if(typeof n=="number"||typeof n=="bigint")lr(e,""+n);else return;break;case"onScroll":n!=null&&de("scroll",e);return;case"onScrollEnd":n!=null&&de("scrollend",e);return;case"onClick":n!=null&&(e.onclick=on);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!$v.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),l=a.slice(2,o?a.length-7:void 0),t=e[Jt]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(l,t,o),typeof n=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(l,n,o);break e}ye=!0,a in e?e[a]=n:n===!0?e.setAttribute(a,""):cc(e,a,n)}return}ye=!0}function xt(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":de("error",e),de("load",e);var n=!1,o=!1,l;for(l in a)if(a.hasOwnProperty(l)){var c=a[l];if(c!=null)switch(l){case"src":n=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(M(137,t));default:Te(e,t,l,c,a,null)}}o&&Te(e,t,"srcSet",a.srcSet,a,null),n&&Te(e,t,"src",a.src,a,null);return;case"input":de("invalid",e);var u=l=c=o=null,h=null,g=null;for(n in a)if(a.hasOwnProperty(n)){var $=a[n];if($!=null)switch(n){case"name":o=$;break;case"type":c=$;break;case"checked":h=$;break;case"defaultChecked":g=$;break;case"value":l=$;break;case"defaultValue":u=$;break;case"children":case"dangerouslySetInnerHTML":if($!=null)throw Error(M(137,t));break;default:Te(e,t,n,$,a,null)}}Sv(e,l,u,h,g,c,o,!1);return;case"select":de("invalid",e),n=c=l=null;for(o in a)if(a.hasOwnProperty(o)&&(u=a[o],u!=null))switch(o){case"value":l=u;break;case"defaultValue":c=u;break;case"multiple":n=u;default:Te(e,t,o,u,a,null)}t=l,a=c,e.multiple=!!n,t!=null?Jo(e,!!n,t,!1):a!=null&&Jo(e,!!n,a,!0);return;case"textarea":de("invalid",e),l=o=n=null;for(c in a)if(a.hasOwnProperty(c)&&(u=a[c],u!=null))switch(c){case"value":n=u;break;case"defaultValue":o=u;break;case"children":l=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(M(91));break;default:Te(e,t,c,u,a,null)}kv(e,n,o,l);return;case"option":for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!=null)&&(h==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":Te(e,t,h,n,a,null));return;case"dialog":de("beforetoggle",e),de("toggle",e),de("cancel",e),de("close",e);break;case"iframe":case"object":de("load",e);break;case"video":case"audio":for(n=0;n<Vl.length;n++)de(Vl[n],e);break;case"image":de("error",e),de("load",e);break;case"details":de("toggle",e);break;case"embed":case"source":case"link":de("error",e),de("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(n=a[g],n!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(M(137,t));default:Te(e,t,g,n,a,null)}return;default:if($m(t)){for($ in a)a.hasOwnProperty($)&&(n=a[$],n!==void 0&&om(e,t,$,n,a,void 0));return}}for(u in a)a.hasOwnProperty(u)&&(n=a[u],n!=null&&Te(e,t,u,n,a,null))}var h5={};function m5(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,l=null,c=null,u=null,h=null,g=null,$=null;for(b in a){var x=a[b];if(a.hasOwnProperty(b)&&x!=null)switch(b){case"checked":break;case"value":break;case"defaultValue":h=x;default:n.hasOwnProperty(b)||Te(e,t,b,null,n,x)}}for(var f in n){var b=n[f];if(x=a[f],n.hasOwnProperty(f)&&(b!=null||x!=null))switch(f){case"type":b!==x&&(ye=!0),l=b;break;case"name":b!==x&&(ye=!0),o=b;break;case"checked":b!==x&&(ye=!0),g=b;break;case"defaultChecked":b!==x&&(ye=!0),$=b;break;case"value":b!==x&&(ye=!0),c=b;break;case"defaultValue":b!==x&&(ye=!0),u=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(M(137,t));break;default:b!==x&&Te(e,t,f,b,n,x)}}bh(e,c,u,h,g,$,l,o);return;case"select":b=c=u=f=null;for(l in a)if(h=a[l],a.hasOwnProperty(l)&&h!=null)switch(l){case"value":break;case"multiple":b=h;default:n.hasOwnProperty(l)||Te(e,t,l,null,n,h)}for(o in n)if(l=n[o],h=a[o],n.hasOwnProperty(o)&&(l!=null||h!=null))switch(o){case"value":l!==h&&(ye=!0),f=l;break;case"defaultValue":l!==h&&(ye=!0),u=l;break;case"multiple":l!==h&&(ye=!0),c=l;default:l!==h&&Te(e,t,o,l,n,h)}t=u,a=c,n=b,f!=null?Jo(e,!!a,f,!1):!!n!=!!a&&(t!=null?Jo(e,!!a,t,!0):Jo(e,!!a,a?[]:"",!1));return;case"textarea":b=f=null;for(u in a)if(o=a[u],a.hasOwnProperty(u)&&o!=null&&!n.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:Te(e,t,u,null,n,o)}for(c in n)if(o=n[c],l=a[c],n.hasOwnProperty(c)&&(o!=null||l!=null))switch(c){case"value":o!==l&&(ye=!0),f=o;break;case"defaultValue":o!==l&&(ye=!0),b=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(M(91));break;default:o!==l&&Te(e,t,c,o,n,l)}Tv(e,f,b);return;case"option":for(var C in a)f=a[C],a.hasOwnProperty(C)&&f!=null&&!n.hasOwnProperty(C)&&(C==="selected"?e.selected=!1:Te(e,t,C,null,n,f));for(h in n)f=n[h],b=a[h],n.hasOwnProperty(h)&&f!==b&&(f!=null||b!=null)&&(h==="selected"?(f!==b&&(ye=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):Te(e,t,h,f,n,b));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var k in a)f=a[k],a.hasOwnProperty(k)&&f!=null&&!n.hasOwnProperty(k)&&Te(e,t,k,null,n,f);for(g in n)if(f=n[g],b=a[g],n.hasOwnProperty(g)&&f!==b&&(f!=null||b!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(M(137,t));break;default:Te(e,t,g,f,n,b)}return;default:if($m(t)){for(var R in a)f=a[R],a.hasOwnProperty(R)&&f!==void 0&&!n.hasOwnProperty(R)&&om(e,t,R,void 0,n,f);for($ in n)f=n[$],b=a[$],!n.hasOwnProperty($)||f===b||f===void 0&&b===void 0||om(e,t,$,f,n,b);return}}for(var w in a)f=a[w],a.hasOwnProperty(w)&&f!=null&&!n.hasOwnProperty(w)&&Te(e,t,w,null,n,f);for(x in n)f=n[x],b=a[x],!n.hasOwnProperty(x)||f===b||f==null&&b==null||Te(e,t,x,f,n,b)}function Ob(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function p5(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var o=a[n],l=o.transferSize,c=o.initiatorType,u=o.duration;if(l&&u&&Ob(c)){for(c=0,u=o.responseEnd,n+=1;n<a.length;n++){var h=a[n],g=h.startTime;if(g>u)break;var $=h.transferSize,x=h.initiatorType;$&&Ob(x)&&(h=h.responseEnd,c+=$*(h<u?1:(u-g)/(h-g)))}if(--n,t+=8*(l+c)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var rm=null,lm=null;function _l(e){return e.nodeType===9?e:e.ownerDocument}function Vb(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Mw(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Rw(e,t,a,n){return a=_l(a).createElement(e),a[vt]=n,a[Jt]=t,xt(a,e,t),dt(a),a}function sm(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var ah=null;function g5(){var e=window.event;return e&&e.type==="popstate"?e===ah?!1:(ah=e,!0):(ah=null,!1)}var lp=typeof setTimeout=="function"?setTimeout:void 0,f5=typeof clearTimeout=="function"?clearTimeout:void 0,Db=typeof Promise=="function"?Promise:void 0,_b=typeof requestAnimationFrame=="function"?requestAnimationFrame:lp,b5=typeof queueMicrotask=="function"?queueMicrotask:typeof Db<"u"?function(e){return Db.resolve(null).then(e).catch(v5)}:lp;function v5(e){setTimeout(function(){throw e})}function bi(e){return e==="head"}function Hb(e,t){var a=t,n=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(o),br(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")ih(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,ih(a);for(var l=a.firstChild;l;){var c=l.nextSibling,u=l.nodeName;l[Yl]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&l.rel.toLowerCase()==="stylesheet"||a.removeChild(l),l=c}}else a==="body"&&ih(e.ownerDocument.body);a=o}while(a);br(t)}function Ub(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function Ow(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var n=1;else for(var o=n=0;o<t.length;o++){var l=t[o];0<l.width&&0<l.height&&n++}n===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function Vw(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function Dw(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function cm(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return Dw(t,a,e)}function y5(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return Dw(t,a,e)}function w5(e){return e.documentElement.clientHeight}function $5(e){this.addEventListener("load",e),this.addEventListener("error",e)}function x5(e,t,a,n,o,l,c,u,h){var g=t.nodeType===9?t:t.ownerDocument;try{var $=g.startViewTransition({update:function(){var f=g.defaultView,b=f.navigation&&f.navigation.transition,C=g.fonts.status;n();var k=[];if(C==="loaded"&&(w5(g),g.fonts.status==="loading"&&k.push(g.fonts.ready)),C=k.length,e!==null)for(var R=e.suspenseyImages,w=0,y=0;y<R.length;y++){var v=R[y];if(!v.complete){var S=v.getBoundingClientRect();if(0<S.bottom&&0<S.right&&S.top<f.innerHeight&&S.left<f.innerWidth){if(w+=Qw(v),w>Tc){k.length=C;break}v=new Promise($5.bind(v)),k.push(v)}}}if(0<k.length)return f=Promise.race([Promise.all(k),new Promise(function(O){return setTimeout(O,500)})]).then(o,o),(b?Promise.allSettled([b.finished,f]):f).then(l,l);if(o(),b)return b.finished.then(l,l);l()},types:a});g.__reactViewTransition=$;var x=[];return $.ready.then(function(){for(var f=g.documentElement.getAnimations({subtree:!0}),b=0;b<f.length;b++){var C=f[b],k=C.effect,R=k.pseudoElement;if(R!=null&&R.startsWith("::view-transition")){x.push(C),C=k.getKeyframes();for(var w=R=void 0,y=!0,v=0;v<C.length;v++){var S=C[v],O=S.width;if(R===void 0)R=O;else if(R!==O){y=!1;break}if(O=S.height,w===void 0)w=O;else if(w!==O){y=!1;break}delete S.width,delete S.height,S.transform==="none"&&delete S.transform}y&&R!==void 0&&w!==void 0&&(k.setKeyframes(C),y=getComputedStyle(k.target,k.pseudoElement),y.width!==R||y.height!==w)&&(y=C[0],y.width=R,y.height=w,y=C[C.length-1],y.width=R,y.height=w,k.setKeyframes(C))}}c()},function(f){g.__reactViewTransition===$&&(g.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{n(),o(),c()}}),$.finished.finally(function(){for(var f=0;f<x.length;f++)x[f].cancel();g.__reactViewTransition===$&&(g.__reactViewTransition=null),u()}),$}catch{return n(),o(),c(),null}}function Hi(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Hi.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:Ve({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Hi.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),n=[],o=0;o<a.length;o++){var l=a[o].effect;l!==null&&l.target===e&&l.pseudoElement===t&&n.push(a[o])}return n};Hi.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function _w(e){return{name:e,group:new Hi("group",e),imagePair:new Hi("image-pair",e),old:new Hi("old",e),new:new Hi("new",e)}}function ua(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}ua.prototype.addEventListener=function(e,t,a){var n=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(n=a.signal||null,n!==null&&n.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var l=this._eventListeners;if(Hw(l,e,t,a)===-1){var c=this,u=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(u=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),n!==null&&(o=c.removeEventListener.bind(c,e,t,a),n.addEventListener("abort",o,{once:!0}),o=n.removeEventListener.bind(n,"abort",o)),n=mr(a),l.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:u,cleanup:o}),Kt(this._fragmentFiber.child,!1,N5,e,u,n)}this._eventListeners=l}};function N5(e,t,a,n){return lt(e).addEventListener(t,a,n),!1}ua.prototype.removeEventListener=function(e,t,a){var n=this._eventListeners;if(n!==null&&(t=Hw(n,e,t,a),t!==-1)){var o=n[t];a=o.attachedListener;var l=o.cleanup;o=mr(o.optionsOrUseCapture),Kt(this._fragmentFiber.child,!1,S5,e,a,o),n.splice(t,1),l!==null&&l()}};function S5(e,t,a,n){return lt(e).removeEventListener(t,a,n),!1}function mr(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function Ib(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function Hw(e,t,a,n){if(e.length===0)return-1;n=Ib(n);for(var o=0;o<e.length;o++){var l=e[o];if(l.type===t&&l.listener===a&&Ib(l.optionsOrUseCapture)===n)return o}return-1}ua.prototype.dispatchEvent=function(e){var t=Fi(this._fragmentFiber);if(t===null)return!0;t=lt(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var n=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var l=a[o];n.addEventListener(l.type,l.attachedListener,mr(l.optionsOrUseCapture))}if(t.appendChild(n),e=n.dispatchEvent(e),a)for(o=0;o<a.length;o++)l=a[o],n.removeEventListener(l.type,l.attachedListener,mr(l.optionsOrUseCapture));return t.removeChild(n),e}return t.dispatchEvent(e)};ua.prototype.focus=function(e){Kt(this._fragmentFiber.child,!0,Uw,e,void 0,void 0)};function Uw(e,t){return e.tag===6?!1:(e=lt(e),_5(e,t))}ua.prototype.focusLast=function(e){var t=[];Kt(this._fragmentFiber.child,!0,sp,t,void 0,void 0);for(var a=t.length-1;0<=a&&!Uw(t[a],e);a--);};function sp(e,t){return t.push(e),!1}ua.prototype.blur=function(){var e=Fi(this._fragmentFiber);e!==null&&(e=lt(e),e=_l(e).activeElement,e!==null&&Kt(this._fragmentFiber.child,!1,T5,e,void 0,void 0))};function T5(e,t){return e.tag===6?!1:(e=lt(e),e===t||e.contains(t)?(t.blur(),!0):!1)}ua.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Kt(this._fragmentFiber.child,!1,k5,e,void 0,void 0)};function k5(e,t){return e.tag===6||(e=lt(e),t.observe(e)),!1}ua.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Kt(this._fragmentFiber.child,!1,E5,e,void 0,void 0);for(var a=t=0;a<Ha.length;a++){var n=Ha[a];n.fragmentInstance===this&&n.observer===e?e.unobserve(n.instance):Ha[t++]=n}Ha.length=t}};function E5(e,t){return e.tag===6||(e=lt(e),t.unobserve(e)),!1}var Ha=[],nh=!1;function C5(e,t,a){Ha.push({fragmentInstance:e,observer:t,instance:a}),nh||(nh=!0,H5(function(){nh=!1;var n=Ha;Ha=[];for(var o=0;o<n.length;o++){var l=n[o];l.observer.unobserve(l.instance)}}))}ua.prototype.getClientRects=function(){var e=[];return Kt(this._fragmentFiber.child,!1,z5,e,void 0,void 0),e};function z5(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=lt(e),t.push.apply(t,e.getClientRects());return!1}ua.prototype.getRootNode=function(e){var t=Fi(this._fragmentFiber);return t===null?this:lt(t).getRootNode(e)};ua.prototype.compareDocumentPosition=function(e){var t=Fi(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Kt(this._fragmentFiber.child,!1,sp,a,void 0,void 0);var n=lt(t);if(a.length===0){if(a=n,vf(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=n=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:n&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=rv(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=lt(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=lt(a[0]),o=lt(a[a.length-1]);var l=vf(this._fragmentFiber)?t.parentElement:n;if(l==null)return Node.DOCUMENT_POSITION_DISCONNECTED;n=l.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,l=l.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),u=o.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||u&Node.DOCUMENT_POSITION_CONTAINED_BY;return u=n&&l&&c&Node.DOCUMENT_POSITION_FOLLOWING&&u&Node.DOCUMENT_POSITION_PRECEDING,t=n&&t===e||l&&o===e||h||u?Node.DOCUMENT_POSITION_CONTAINED_BY:!n&&t===e||!l&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||A5(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function A5(e,t,a,n,o){var l=_i(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!l)e:{for(;l!==null;){if(l.tag===7&&(l===t||l.alternate===t)){a=!0;break e}l=l.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(l===null)return l=o.ownerDocument,o===l||o===l.documentElement||o===l.body;e:{for(l=t,t=Fi(t);l!==null;){if(!(l.tag!==5&&l.tag!==3&&l.tag!==27||l!==t&&l.alternate!==t)){l=!0;break e}l=l.return}l=!1}return l}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!l)&&!(t=l===a)&&(t=rh(a,l,yf),t===null?t=!1:(Kt(t,!0,rx,l,a),l=Ho,Ho=null,t=l!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!l)&&!(t=l===n)&&(t=rh(n,l,yf),t===null?t=!1:(Kt(t,!0,lx,l,n),l=Ho,oh=Ho=null,t=l!==null)),t):!1}function qb(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}ua.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(M(566));var t=[];Kt(this._fragmentFiber.child,!1,sp,t,void 0,void 0);var a=e!==!1;if(t.length===0){var n=rv(this._fragmentFiber);if(n=a?n[1]||n[0]||Fi(this._fragmentFiber):n[0]||n[1],n===null)return;if(n.tag===6){e=lt(n),qb(e,a);return}if(n=lt(n),n.nodeType!==9){if(n.nodeType===11){a="host"in n?n.host:null,a!==null&&a.scrollIntoView(e);return}n.scrollIntoView(e)}}for(n=a?t.length-1:0;n!==(a?-1:t.length);){var o=t[n];o.tag===6?(o=lt(o),qb(o,a)):lt(o).scrollIntoView(e),n+=a?-1:1}};function M5(e,t){return e=lt(e),Iw(e,t),!1}function Iw(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function qw(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.addEventListener(o.type,o.attachedListener,mr(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){for(var c=0,u=0;u<Ha.length;u++){var h=Ha[u];(h.fragmentInstance!==t||h.observer!==l||h.instance!==e)&&(Ha[c++]=h)}Ha.length=c,l.observe(e)}),Iw(e,t))}function R5(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.removeEventListener(o.type,o.attachedListener,mr(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){typeof l.rootMargin=="string"?C5(t,l,e):l.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function um(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":um(a),iu(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function O5(e,t,a,n){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[Yl])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(l=e.getAttribute("rel"),l==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(l!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(l=e.getAttribute("src"),(l!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&l&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var l=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===l)return e}else return e;if(e=Ta(e.nextSibling),e===null)break}return null}function V5(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=Ta(e.nextSibling),e===null))return null;return e}function Bw(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Ta(e.nextSibling),e===null))return null;return e}function dm(e){return e.data==="$?"||e.data==="$~"}function cp(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function D5(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function Ta(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var hm=null;function Bb(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return Ta(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function Lb(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function _5(e,t){function a(){n=!0}if(e.ownerDocument.activeElement===e)return!0;var n=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return n}function H5(e){_b(function(){_b(function(t){return e(t)})})}function Lw(e,t,a){switch(t=_l(a),e){case"html":if(e=t.documentElement,!e)throw Error(M(452));return e;case"head":if(e=t.head,!e)throw Error(M(453));return e;case"body":if(e=t.body,!e)throw Error(M(454));return e;default:throw Error(M(451))}}function jw(e,t,a){for(var n in a){var o=a[n];a.hasOwnProperty(n)&&o!=null&&Te(e,t,n,null,h5,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===on&&(e.onclick=null),iu(e)}function ih(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);iu(e)}var ka=new Map,jb=new Set;function Hl(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var Vn=xe.d;xe.d={f:U5,r:I5,D:q5,C:B5,L:L5,m:j5,X:Y5,S:G5,M:X5};function U5(){var e=Vn.f(),t=vu();return e||t}function I5(e){var t=yr(e);t!==null&&t.tag===5&&t.type==="form"?Ey(t):Vn.r(e)}var Nr=typeof document>"u"?null:document;function Gw(e,t,a){var n=Nr;if(n&&typeof t=="string"&&t){var o=xa(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),jb.has(o)||(jb.add(o),e={rel:e,crossOrigin:a,href:t},n.querySelector(o)===null&&(t=n.createElement("link"),xt(t,"link",e),dt(t),n.head.appendChild(t)))}}function q5(e){Vn.D(e),Gw("dns-prefetch",e,null)}function B5(e,t){Vn.C(e,t),Gw("preconnect",e,t)}function L5(e,t,a){Vn.L(e,t,a);var n=Nr;if(n&&e&&t){var o='link[rel="preload"][as="'+xa(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+xa(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+xa(a.imageSizes)+'"]')):o+='[href="'+xa(e)+'"]';var l=o;switch(t){case"style":l=pr(e);break;case"script":l=Sr(e)}if(!(ka.has(l)||(e=Ve({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),ka.set(l,e),n.querySelector(o)!==null||t==="style"&&n.querySelector(Fl(l))||t==="script"&&n.querySelector(Pl(l))))){var c=n.createElement("link");xt(c,"link",e),t==="style"&&(c[Rc]=!0,c.onload=c.onerror=function(){yv(c)}),dt(c),n.head.appendChild(c)}}}function j5(e,t){Vn.m(e,t);var a=Nr;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+xa(n)+'"][href="'+xa(e)+'"]',l=o;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":l=Sr(e)}if(!ka.has(l)&&(e=Ve({rel:"modulepreload",href:e},t),ka.set(l,e),a.querySelector(o)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Pl(l)))return}n=a.createElement("link"),xt(n,"link",e),dt(n),a.head.appendChild(n)}}}function G5(e,t,a){Vn.S(e,t,a);var n=Nr;if(n&&e){var o=Ko(n).hoistableStyles,l=pr(e);t=t||"default";var c=o.get(l);if(!c){var u={loading:0,preload:null};if(c=n.querySelector(Fl(l)))u.loading=5;else{e=Ve({rel:"stylesheet",href:e,"data-precedence":t},a),(a=ka.get(l))&&up(e,a);var h=c=n.createElement("link");dt(h),xt(h,"link",e),h._p=new Promise(function(g,$){h.onload=g,h.onerror=$}),h.addEventListener("load",function(){u.loading|=1}),h.addEventListener("error",function(){u.loading|=2}),u.loading|=4,Nc(c,t,n)}c={type:"stylesheet",instance:c,count:1,state:u},o.set(l,c)}}}function Y5(e,t){Vn.X(e,t);var a=Nr;if(a&&e){var n=Ko(a).hoistableScripts,o=Sr(e),l=n.get(o);l||(l=a.querySelector(Pl(o)),l||(e=Ve({src:e,async:!0},t),(t=ka.get(o))&&dp(e,t),l=a.createElement("script"),dt(l),xt(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function X5(e,t){Vn.M(e,t);var a=Nr;if(a&&e){var n=Ko(a).hoistableScripts,o=Sr(e),l=n.get(o);l||(l=a.querySelector(Pl(o)),l||(e=Ve({src:e,async:!0,type:"module"},t),(t=ka.get(o))&&dp(e,t),l=a.createElement("script"),dt(l),xt(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function Gb(e,t,a,n){var o=(o=ti.current)?Hl(o):null;if(!o)throw Error(M(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=pr(a.href),t=Ko(o).hoistableStyles,n=t.get(a),n||(n={type:"style",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=pr(a.href);var l=Ko(o).hoistableStyles,c=l.get(e);if(c||(o=o.ownerDocument||o,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},l.set(e,c),(l=o.querySelector(Fl(e)))?l._p||(c.instance=l,c.state.loading=5):(l=ka.get(e),l||(l={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},ka.set(e,l)),Q5(o,e,l,c.state))),t&&n===null)throw Error(M(528,""));return c}if(t&&n!==null)throw Error(M(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=Sr(a),t=Ko(o).hoistableScripts,n=t.get(a),n||(n={type:"script",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(M(444,e))}}function pr(e){return'href="'+xa(e)+'"'}function Fl(e){return'link[rel="stylesheet"]['+e+"]"}function Yw(e){return Ve({},e,{"data-precedence":e.precedence,precedence:null})}function Q5(e,t,a,n){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Rc]!==!0){n.loading=1;return}}else t=e.createElement("link"),t[Rc]=!0,t.onload=t.onerror=yv.bind(null,t),xt(t,"link",a),dt(t),e.head.appendChild(t);n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2})}function Sr(e){return'[src="'+xa(e)+'"]'}function Pl(e){return"script[async]"+e}function Yb(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+xa(a.href)+'"]');if(n)return t.instance=n,dt(n),n;var o=Ve({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),dt(n),xt(n,"style",o),Nc(n,a.precedence,e),t.instance=n;case"stylesheet":o=pr(a.href);var l=e.querySelector(Fl(o));if(l)return t.state.loading|=4,t.instance=l,dt(l),l;n=Yw(a),(o=ka.get(o))&&up(n,o),l=(e.ownerDocument||e).createElement("link"),dt(l);var c=l;return c._p=new Promise(function(u,h){c.onload=u,c.onerror=h}),xt(l,"link",n),t.state.loading|=4,Nc(l,a.precedence,e),t.instance=l;case"script":return l=Sr(a.src),(o=e.querySelector(Pl(l)))?(t.instance=o,dt(o),o):(n=a,(o=ka.get(l))&&(n=Ve({},a),dp(n,o)),e=e.ownerDocument||e,o=e.createElement("script"),dt(o),xt(o,"link",n),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(M(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,Nc(n,a.precedence,e));return t.instance}function Nc(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=n.length?n[n.length-1]:null,l=o,c=0;c<n.length;c++){var u=n[c];if(u.dataset.precedence===t)l=u;else if(l!==o)break}l?l.parentNode.insertBefore(e,l.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function up(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function dp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Sc=null;function Xb(e,t,a){if(Sc===null){var n=new Map,o=Sc=new Map;o.set(a,n)}else o=Sc,n=o.get(a),n||(n=new Map,o.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var l=a[o];if(!(l[Yl]||l[vt]||e==="link"&&l.getAttribute("rel")==="stylesheet")&&l.namespaceURI!=="http://www.w3.org/2000/svg"){var c=l.getAttribute(t)||"";c=e+c;var u=n.get(c);u?u.push(l):n.set(c,[l])}}return n}function mm(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function Z5(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Qb(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function Xw(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function Qw(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Zb(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=Qw(t),e.suspenseyImages.push(t)),e=F5.bind(e),t.decode().then(e,e))}function K5(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=pr(n.href),l=t.querySelector(Fl(o));if(l){t=l._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Ul.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=l,dt(l);return}l=t.ownerDocument||t,n=Yw(n),(o=ka.get(o))&&up(n,o),l=l.createElement("link"),dt(l);var c=l;c._p=new Promise(function(u,h){c.onload=u,c.onerror=h}),xt(l,"link",n),a.instance=l}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Ul.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Tc=0;function J5(e,t){return e.stylesheets&&e.count===0&&kc(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&kc(e,e.stylesheets),e.unsuspend){var l=e.unsuspend;e.unsuspend=null,l()}},6e4+t);0<e.imgBytes&&Tc===0&&(Tc=62500*p5());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&kc(e,e.stylesheets),e.unsuspend)){var l=e.unsuspend;e.unsuspend=null,l()}},(e.imgBytes>Tc?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(o)}}:null}function Zw(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)kc(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Ul(){this.count--,Zw(this)}function F5(){this.imgCount--,Zw(this)}var tu=null;function kc(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,tu=new Map,t.forEach(P5,e),tu=null,Ul.call(e))}function P5(e,t){if(!(t.state.loading&4)){var a=tu.get(e);if(a)var n=a.get(null);else{a=new Map,tu.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),l=0;l<o.length;l++){var c=o[l];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),n=c)}n&&a.set(null,n)}o=t.instance,c=o.getAttribute("data-precedence"),l=a.get(c)||n,l===n&&a.set(null,o),a.set(c,o),this.count++,n=Ul.bind(this),o.addEventListener("load",n),o.addEventListener("error",n),l?l.parentNode.insertBefore(o,l.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var gr={$$typeof:nn,Provider:null,Consumer:null,_currentValue:Ui,_currentValue2:Ui,_threadCount:0};function W5(e,t,a,n,o,l,c,u,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Rd(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Rd(0),this.hiddenUpdates=Rd(null),this.identifierPrefix=n,this.onUncaughtError=o,this.onCaughtError=l,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function Kw(e,t,a,n,o,l,c,u,h,g,$,x){return e=new W5(e,t,a,c,h,g,$,x,u),t=1,l===!0&&(t|=24),l=Qt(3,null,null,t),e.current=l,l.stateNode=e,t=Mm(),t.refCount++,e.pooledCache=t,t.refCount++,l.memoizedState={element:n,isDehydrated:a,cache:t},Vm(l),e}function Jw(e){return e?(e=Yo,e):Yo}function Fw(e,t,a,n,o,l){o=Jw(o),n.context===null?n.context=o:n.pendingContext=o,n=ni(t),n.payload={element:a},l=l===void 0?null:l,l!==null&&(n.callback=l),a=ii(e,n,t),a!==null&&(Zt(a,e,t),fl(a,e,t))}function Kb(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function hp(e,t){Kb(e,t),(e=e.alternate)&&Kb(e,t)}function Pw(e){if(e.tag===13||e.tag===31){var t=eo(e,67108864);t!==null&&Zt(t,e,67108864),hp(e,67108864)}}function Jb(e){if(e.tag===13||e.tag===31){var t=sa();t=ym(t);var a=eo(e,t);a!==null&&Zt(a,e,t),hp(e,t)}}var fr=!0;function eS(e,t,a,n){var o=ee.T;ee.T=null;var l=xe.p;try{xe.p=2,mp(e,t,a,n)}finally{xe.p=l,ee.T=o}}function tS(e,t,a,n){var o=ee.T;ee.T=null;var l=xe.p;try{xe.p=8,mp(e,t,a,n)}finally{xe.p=l,ee.T=o}}function mp(e,t,a,n){if(fr){var o=pm(n);if(o===null)th(e,t,n,au,a),Fb(e,n);else if(nS(o,e,t,a,n))n.stopPropagation();else if(Fb(e,n),t&4&&-1<aS.indexOf(e)){for(;o!==null;){var l=yr(o);if(l!==null)switch(l.tag){case 3:if(l=l.stateNode,l.current.memoizedState.isDehydrated){var c=Oi(l.pendingLanes);if(c!==0){var u=l;for(u.pendingLanes|=2,u.entangledLanes|=2;c;){var h=1<<31-la(c);u.entanglements[1]|=h,c&=~h}hn(l),($e&6)===0&&(Jc=oa()+500,Jl(0,!1))}}break;case 31:case 13:u=eo(l,2),u!==null&&Zt(u,l,2),vu(),hp(l,2)}if(l=pm(n),l===null&&th(e,t,n,au,a),l===o)break;o=l}o!==null&&n.stopPropagation()}else th(e,t,n,null,a)}}function pm(e){return e=xm(e),pp(e)}var au=null;function pp(e){if(au=null,e=_i(e),e!==null){var t=Bl(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=nv(t),e!==null)return e;e=null}else if(a===31){if(e=iv(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return au=e,null}function Ww(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(fx()){case uv:return 2;case dv:return 8;case Mc:case bx:return 32;case hv:return 268435456;default:return 32}default:return 32}}var gm=!1,si=null,ci=null,ui=null,Il=new Map,ql=new Map,Zn=[],aS="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Fb(e,t){switch(e){case"focusin":case"focusout":si=null;break;case"dragenter":case"dragleave":ci=null;break;case"mouseover":case"mouseout":ui=null;break;case"pointerover":case"pointerout":Il.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":ql.delete(t.pointerId)}}function ol(e,t,a,n,o,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:l,targetContainers:[o]},t!==null&&(t=yr(t),t!==null&&Pw(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function nS(e,t,a,n,o){switch(t){case"focusin":return si=ol(si,e,t,a,n,o),!0;case"dragenter":return ci=ol(ci,e,t,a,n,o),!0;case"mouseover":return ui=ol(ui,e,t,a,n,o),!0;case"pointerover":var l=o.pointerId;return Il.set(l,ol(Il.get(l)||null,e,t,a,n,o)),!0;case"gotpointercapture":return l=o.pointerId,ql.set(l,ol(ql.get(l)||null,e,t,a,n,o)),!0}return!1}function e0(e){var t=_i(e.target);if(t!==null){var a=Bl(t);if(a!==null){if(t=a.tag,t===13){if(t=nv(a),t!==null){e.blockedOn=t,Nf(e.priority,function(){Jb(a)});return}}else if(t===31){if(t=iv(a),t!==null){e.blockedOn=t,Nf(e.priority,function(){Jb(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Ec(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=pm(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);vh=n,a.target.dispatchEvent(n),vh=null}else return t=yr(a),t!==null&&Pw(t),e.blockedOn=a,!1;t.shift()}return!0}function Pb(e,t,a){Ec(e)&&a.delete(t)}function iS(){gm=!1,si!==null&&Ec(si)&&(si=null),ci!==null&&Ec(ci)&&(ci=null),ui!==null&&Ec(ui)&&(ui=null),Il.forEach(Pb),ql.forEach(Pb)}function lc(e,t){e.blockedOn===t&&(e.blockedOn=null,gm||(gm=!0,st.unstable_scheduleCallback(st.unstable_NormalPriority,iS)))}var sc=null;function Wb(e){sc!==e&&(sc=e,st.unstable_scheduleCallback(st.unstable_NormalPriority,function(){sc===e&&(sc=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],o=e[t+2];if(typeof n!="function"){if(pp(n||a)===null)continue;break}var l=yr(a);l!==null&&(e.splice(t,3),t-=3,Vh(l,{pending:!0,data:o,method:a.method,action:n},n,o))}}))}function br(e){function t(h){return lc(h,e)}si!==null&&lc(si,e),ci!==null&&lc(ci,e),ui!==null&&lc(ui,e),Il.forEach(t),ql.forEach(t);for(var a=0;a<Zn.length;a++){var n=Zn[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<Zn.length&&(a=Zn[0],a.blockedOn===null);)e0(a),a.blockedOn===null&&Zn.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var o=a[n],l=a[n+1],c=o[Jt]||null;if(typeof l=="function")c||Wb(a);else if(c){var u=null;if(l&&l.hasAttribute("formAction")){if(o=l,c=l[Jt]||null)u=c.formAction;else if(pp(o)!==null)continue}else u=c.action;typeof u=="function"?a[n+1]=u:(a.splice(n,3),n-=3),Wb(a)}}}function t0(){function e(l){l.canIntercept&&l.info==="react-transition"&&l.intercept({handler:function(){return new Promise(function(c){return o=c})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var l=navigation.currentEntry;l&&l.url!=null&&navigation.navigate(l.url,{state:l.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function gp(e){this._internalRoot=e}$u.prototype.render=gp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(M(409));var a=t.current,n=sa();Fw(a,n,e,t,null,null)};$u.prototype.unmount=gp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Fw(e.current,2,null,e,null,null),vu(),t[vr]=null}};function $u(e){this._internalRoot=e}$u.prototype.unstable_scheduleHydration=function(e){if(e){var t=vv();e={blockedOn:null,target:e,priority:t};for(var a=0;a<Zn.length&&t!==0&&t<Zn[a].priority;a++);Zn.splice(a,0,e),a===0&&e0(e)}};var ev=tv.version;if(ev!=="19.3.0")throw Error(M(527,ev,"19.3.0"));xe.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(M(188)):(e=Object.keys(e).join(","),Error(M(268,e)));return e=ox(t),e=e!==null?ov(e):null,e=e===null?null:e.stateNode,e};var oS={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:ee,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(rl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!rl.isDisabled&&rl.supportsFiber))try{Ll=rl.inject(oS),ra=rl}catch{}var rl;xu.createRoot=function(e,t){if(!av(e))throw Error(M(299));var a=!1,n="",o=Dy,l=_y,c=Hy;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(l=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=Kw(e,1,!1,null,null,a,n,null,o,l,c,t0),e[vr]=t.current,rp(e),new gp(t)};xu.hydrateRoot=function(e,t,a){if(!av(e))throw Error(M(299));var n=!1,o="",l=Dy,c=_y,u=Hy,h=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(l=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(u=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=Kw(e,1,!0,t,a??null,n,o,h,l,c,u,t0),t.context=Jw(null),a=t.current,n=sa(),n=ym(n),o=ni(n),o.callback=null,ii(a,o,n),a=n,t.current.lanes=a,Gl(t,a),hn(t),e[vr]=t.current,rp(e),new $u(t)};xu.version="19.3.0"});var o0=Ja((S2,i0)=>{"use strict";function n0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n0)}catch(e){console.error(e)}}n0(),i0.exports=a0()});var x0=Ja(ku=>{"use strict";var hS=Symbol.for("react.transitional.element"),mS=Symbol.for("react.fragment");function $0(e,t,a){var n=null;if(a!==void 0&&(n=""+a),t.key!==void 0&&(n=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:hS,type:e,key:n,ref:t!==void 0?t:null,props:a}}ku.Fragment=mS;ku.jsx=$0;ku.jsxs=$0});var vp=Ja((V2,N0)=>{"use strict";N0.exports=x0()});var m=Ds(Hs()),Y0=Ds(o0());function rS(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),n="",o=[],l=[];for(let c=0;c<a.length;c++){let u=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(u)?.[1];if(h&&(n?h[0]===n[0]&&h.length>=n.length&&(n=""):n=h),!n&&!u.trim()&&(!t||c<a.length-1)){let g=o.join(`
`).trim();g&&l.push(g),o=[]}else o.push(u)}if(!t){let c=o.join(`
`).trim();c&&l.push(c)}return l}var lS=['"',"'","\u201D","\u2019","\xBB","\u300D"],sS=['"',"'","\u201C","\u2018","\xAB","\u300C"];function r0(e){let t=e.trim();return lS.includes(t.slice(-1))&&sS.some(n=>t.slice(0,-1).includes(n))?"speech":"prose"}function l0(e,t){let a=rS(e),n=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return n();let o=[],l=[],c=[],u=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){o.push(a[h]),l.push(u),c.push(g.expression??null),u=[];continue}let $={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};o.length?l[l.length-1].push($):u.push($)}return o.length===0?n():{paragraphs:o,asides:l,expressions:c}}var cS="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function ao(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],n=new RegExp(cS,"g"),o=0,l,c=u=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+u};return}a.push({kind:"text",text:u})};for(;(l=n.exec(e))!==null;)l.index>o&&c(e.slice(o,l.index)),l[1]!=null?c(l[1]):l[2]!=null&&l[3]!=null?a.push({kind:"link",text:l[2],href:l[3]}):l[4]!=null?a.push({kind:"code",text:l[4]}):l[5]!=null?a.push({kind:"styled",style:"highlight",children:ao(l[5],t+1)}):l[6]!=null?a.push({kind:"styled",style:"strikethrough",children:ao(l[6],t+1)}):l[7]!=null?a.push({kind:"styled",style:"bold-italic",children:ao(l[7],t+1)}):l[8]!=null?a.push({kind:"styled",style:"bold",children:ao(l[8],t+1)}):l[9]!=null?a.push({kind:"styled",style:"underline",children:ao(l[9],t+1)}):(l[10]!=null||l[11]!=null)&&a.push({kind:"styled",style:"italic",children:ao(l[10]??l[11],t+1)}),o=l.index+l[0].length;return o<e.length&&c(e.slice(o)),a}function s0(e){return ao(e,0)}function Dn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function c0(e){return e===null||typeof e=="string"}function u0(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function Nu(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function uS(e){return e===null?!0:Dn(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function dS(e){if(!Dn(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!Nu(e.capabilities)||!Dn(e.presentation)||!Dn(e.occupancy)||!Dn(e.state))return!1;let{presentation:t,occupancy:a,state:n}=e;return uS(t.image)&&u0(t.x)&&u0(t.y)&&typeof a.playerHome=="boolean"&&c0(a.residentCharacterId)&&c0(a.homeKind)&&typeof n.condition=="string"&&Nu(n.upgrades)&&Nu(n.furniture)&&Nu(n.publicFacts)&&typeof n.updatedAt=="string"}function d0(e){if(!Dn(e)||!Dn(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(dS),n=Array.isArray(e.venueRequests)?e.venueRequests:[],o=n.filter(l=>Dn(l)&&typeof l.id=="string"&&Dn(l.venueDraft)&&typeof l.venueDraft.name=="string"&&typeof l.venueDraft.category=="string");return a.length===t.length&&o.length===n.length&&n===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function h0(e,t,a){return e==="Enter"&&!t&&!a}function Su(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,n=>n.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function m0(e,t,a,n){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(n,o)}function p0(e,t){return t<0||t===e?"front":t<e?"left":"right"}function g0(e,t,a){let n=a==="front"?"front":"side",o=e.find(l=>l.view===n&&l.label===t)??e.find(l=>l.view===n&&l.label==="neutral")??e.find(l=>l.view==="front"&&l.label===t)??e.find(l=>l.view==="front"&&l.label==="neutral");return o?{image:o,mirrored:o.view==="side"&&a==="left"}:null}function f0(e,t,a){let n=.2*a.photoWidth/a.width,o=.2*a.photoHeight/a.height;return t.some(l=>l.x!==null&&l.y!==null&&Math.abs(l.x-e.x)<n&&Math.abs(l.y-e.y)<o)}function b0(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var vi=(e,t,a)=>Math.min(a,Math.max(t,e));function Tu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function fp(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let n=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,Tu(e,t)),l=e.width*n*o,c=e.height*n*o,u=t.width/2-a.centerX*l,h=t.height/2-a.centerY*c;return{left:l<=t.width?(t.width-l)/2:vi(u,t.width-l,0),top:c<=t.height?(t.height-c)/2:vi(h,t.height-c,0),width:l,height:c}}function v0(e,t,a,n,o,l){let c=fp(e,t,a);if(!c.width||!c.height)return a;let u=Tu(e,t),h=vi(a.zoom*l,u,Math.max(4,u*2)),g=h/Math.max(a.zoom,u),$=c.width*g,x=c.height*g,f=(n.x-c.left)/c.width,b=(n.y-c.top)/c.height,C=o.x-f*$,k=o.y-b*x;return{zoom:h,centerX:vi((t.width/2-C)/$,0,1),centerY:vi((t.height/2-k)/x,0,1)}}function y0(e,t){let a=Math.max(1,t),n=Math.max(4,a*2);return .32+1.03*((vi(e,a,n)-a)/(n-a))}function w0(e,t){return t?Math.max(1,e):e}function bp(e,t,a){let n=Math.min(90,t.width/2),o=64,l=116,c=e.left+a.x*e.width,u=e.top+a.y*e.height,h=u+o,g=h+l<=t.height?h:u-o-l;return{left:vi(c,n,t.width-n),top:vi(g,0,Math.max(0,t.height-l))}}var r=Ds(vp()),i="marinara-capability-villages",S0="marinara-capability-villages-styles",pS="/api/villages",gS=.7,Cp=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],yp=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),fS={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},ro=e=>Cp.find(t=>t.value===e),bS=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,T0={roads:"auto",structures:"auto",water:"auto"},Eu=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],k0=1,wp=3,vS={residence:["A modest stone home, with ivy growing on the walls","A tent and hammock pitched in the shade between two pine trees","A mighty castle, with imposing obsidian pillars and multiple dungeons","A dumpster behind the supermarket","An armored cash transport car, converted into a mobile home"],gathering:["A communal fire pit, with logs and stumps arranged around it in a semicircle","A decommissioned pizzeria, complete with inert animatronic performers","The situation room, with a round table bearing strategic maps","The hardy Brandythrone tavern, where ale and fistfights are plentiful","A meticulously-landscaped public park, where trampling the roses is punishable by fine"]},$p="__villages_image_disabled__",Au=["neutral","happy","sad","angry","surprised","thinking"];function E0(e,t,a,n,o=!1,l=1){let c=t==="gathering"?"Gathering Place":o?"Your residence":`Residence ${l}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:n},occupancy:{playerHome:o,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}function yS(e){let t=[];for(let a of e){let n=t[t.length-1];n&&n.label===a.dateLabel?n.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}var X0={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function Cu(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function wS(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let n=Math.floor(a/36e5),o=Math.max(1,Math.ceil(a%36e5/6e4));return n>0?`${n}h ${o}m left`:`${o}m left`}function $S({library:e,busy:t,onRefresh:a,onForget:n}){let[o,l]=(0,m.useState)("all"),[c,u]=(0,m.useState)(""),[h,g]=(0,m.useState)(""),[$,x]=(0,m.useState)(null),[f,b]=(0,m.useState)(""),C=Date.now(),k=(v,S)=>(!h.trim()||`${v} ${S.map(O=>O.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||S.some(O=>O.id===c)),R=(e?.recollections??[]).filter(v=>k(v.text,[...v.subjects,...v.knownBy])),w=(e?.durable??[]).filter(v=>k(v.text,[...v.subjects,...v.knownBy])),y=async(v,S)=>{try{let O=await D(`/rooms/archive/${encodeURIComponent(v)}`);x({visit:O.visit,lineIds:S}),b("")}catch(O){x(null),b(I(O,"The source visit could not be read."))}};return(0,r.jsxs)("div",{className:`${i}-memory-library`,children:[(0,r.jsxs)("section",{className:`${i}-memory-hero`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-kicker`,children:"Continuity, with receipts"}),(0,r.jsx)("h3",{children:"What your villagers carry forward"}),(0,r.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,r.jsxs)("div",{className:`${i}-memory-stats`,children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,r.jsxs)("div",{className:`${i}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"01"}),(0,r.jsx)("strong",{children:"Passing"}),(0,r.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"02"}),(0,r.jsx)("strong",{children:"Durable"}),(0,r.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"03"}),(0,r.jsx)("strong",{children:"Archive"}),(0,r.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,r.jsxs)("div",{className:`${i}-memory-health`,role:"status",children:[(0,r.jsx)("span",{children:"\u25C7"}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,r.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,r.jsxs)("div",{className:`${i}-memory-toolbar`,children:[(0,r.jsx)("div",{className:`${i}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([v,S])=>(0,r.jsx)("button",{type:"button","data-active":o===v,onClick:()=>l(v),children:S},v))}),(0,r.jsx)("input",{type:"search",value:h,onChange:v=>g(v.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,r.jsxs)("select",{value:c,onChange:v=>u(v.target.value),"aria-label":"Filter memories by resident",children:[(0,r.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(v=>(0,r.jsx)("option",{value:v.id,children:v.name},v.id))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&o!=="durable"&&R.length>0?(0,r.jsxs)("section",{className:`${i}-memory-section`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,r.jsx)("h3",{children:"Passing recollections"})]}),(0,r.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,r.jsx)("div",{className:`${i}-memory-grid`,children:R.map(v=>{let S=v.evidence[v.evidence.length-1]??{visitId:v.visitId,lineIds:[]};return(0,r.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"passing",children:[(0,r.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${i}-memory-pill`,children:"Passing"}),(0,r.jsx)("span",{children:wS(v.expiresAt,C)})]}),(0,r.jsx)("p",{className:`${i}-memory-text`,children:v.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:Cu(v.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:Cu(v.knownBy)})]})]}),v.reinforcementCount>0?(0,r.jsxs)("p",{className:`${i}-memory-reinforced`,children:["\u21BB Reinforced ",v.reinforcementCount," ",v.reinforcementCount===1?"time":"times"]}):null,(0,r.jsxs)("div",{className:`${i}-memory-card-actions`,children:[(0,r.jsx)("button",{type:"button",onClick:()=>{y(S.visitId,S.lineIds)},children:"View evidence"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>n("recollections",v.id),children:"Let go"})]})]},v.id)})})]}):null,e&&o!=="passing"&&w.length>0?(0,r.jsxs)("section",{className:`${i}-memory-section`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,r.jsx)("h3",{children:"Durable memories"})]}),(0,r.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,r.jsx)("div",{className:`${i}-memory-grid`,children:w.map(v=>(0,r.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"durable",children:[(0,r.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${i}-memory-pill`,children:v.memoryCategory?X0[v.memoryCategory]:v.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,r.jsxs)("span",{children:[v.dateLabel,zp(v)?` \xB7 ${zp(v)}`:""]})]}),(0,r.jsx)("p",{className:`${i}-memory-text`,children:v.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:Cu(v.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:Cu(v.knownBy)})]})]}),(0,r.jsxs)("div",{className:`${i}-memory-card-actions`,children:[v.evidence?(0,r.jsx)("button",{type:"button",onClick:()=>{y(v.evidence.visitId,v.evidence.lineIds)},children:"View evidence"}):(0,r.jsx)("span",{className:`${i}-memory-legacy`,children:"No evidence link on this older memory"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>n("durable",v.id),children:"Forget"})]})]},v.id))})]}):null,e&&(o!=="durable"&&R.length||o!=="passing"&&w.length)===0?(0,r.jsxs)("div",{className:`${i}-memory-empty`,children:[(0,r.jsx)("span",{children:"\u2727"}),(0,r.jsx)("h3",{children:"No memories match"}),(0,r.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,r.jsxs)("p",{className:`${i}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null,$?(0,r.jsxs)("section",{className:`${i}-memory-evidence`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,r.jsxs)("h3",{children:["Exact evidence \xB7 ",$.visit.placeName]})]}),(0,r.jsx)("button",{type:"button",onClick:()=>x(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,r.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,r.jsx)("ol",{children:$.visit.lines.filter(v=>$.lineIds.includes(v.id)).map(v=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:v.name||"Player"}),(0,r.jsxs)("small",{children:[Mu(v.at)," \xB7 heard by"," ",v.heardBy.map(S=>$.visit.participants.find(O=>O.characterId===S)?.name??S).join(", ")||"no one"]})]}),Tr(v.content,`memory-evidence-${v.id}-`)]},v.id))})]}):null]})}function Mu(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":P0.format(t)}function zp(e){return Mu(e.occurredAt)}function xS(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function C0(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function xp(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var NS=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function SS(e,t){let a=[],n=Date.parse(e);if(Number.isFinite(n)){let l=Math.floor((Date.now()-n)/864e5);a.push(l<=0?"written today":l===1?"written yesterday":`written ${l} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${NS.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function TS(e,t){let a=e.find(n=>n.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(n=>n.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?at(a,t.spaceClass).image:null)?.url??"":""}var Ap=class extends m.Component{constructor(){super(...arguments);Hg(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let n=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=n,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:n},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${i}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h1",{className:`${i}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${i}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},kS=`
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
`;function z0(){let e=document.getElementById(S0);if(!document.querySelector(i)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=S0,t.textContent=kS,document.head.appendChild(t)}var ES="marinara_admin_secret";function Q0(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(ES)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var CS="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function Z0(e,t,a){let n=e?.error,o=typeof n=="string"&&n?n:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${CS} (${o})`):new Error(o)}async function D(e,t){let a=await fetch(`${pS}${e}`,{...t,headers:Q0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw Z0(n,a.status,`The village replied ${a.status}.`);return d0(n)}async function Op(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:Q0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw Z0(n,a.status,`The Engine replied ${a.status}.`);return n}var no=e=>typeof e=="number"&&Number.isFinite(e);function Vp(e){let t=e;for(let x=0;x<2&&typeof t=="string";x+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:n,srcY:o,srcWidth:l,srcHeight:c}=a;if(no(n)&&no(o)&&no(l)&&no(c))return l<=0||c<=0||n<0||o<0||n+l>1.001||o+c>1.001?null:{srcX:n,srcY:o,srcWidth:l,srcHeight:c};let{zoom:u,offsetX:h,offsetY:g,fullImage:$}=a;return!no(u)||u<=0||!no(h)||!no(g)||$!==void 0&&typeof $!="boolean"?null:$===void 0?{zoom:u,offsetX:h,offsetY:g}:{zoom:u,offsetX:h,offsetY:g,fullImage:$}}function zS(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function AS(e,t){if(e.length===0)return{};let a=await Op("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),n={};if(!Array.isArray(a))return n;for(let o of a){let l=typeof o?.id=="string"?o.id:"",c=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";l.length>0&&c.length>0&&(n[l]={url:c,crop:Vp(o.avatarCrop)})}return n}async function MS(e,t){let a=e.trim();if(a.length===0)return null;let n=await Op(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof n?.avatarPath=="string"?n.avatarPath.trim():"";return o.length===0?null:{url:o,crop:Vp(n.avatarCrop)}}function RS(e){let t=[];for(let a of e){let n=typeof a.id=="string"?a.id.trim():"";if(n.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let l=typeof a.name=="string"&&a.name.trim()?a.name.trim():n;t.push({id:n,name:l,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function I(e,t){return e instanceof Error&&e.message?e.message:t}function Wl(e){let t=I(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function A0(e){try{let{session:t}=await D("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}function M0(e){let t=I(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function K0(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function Tr(e,t){return J0(s0(e),t)}function J0(e,t){let a=0;return e.map(n=>{let o=`${t}${a++}`;switch(n.kind){case"text":return n.text;case"code":return(0,r.jsx)("code",{className:`${i}-chat-md-code`,dir:"ltr",children:n.text},o);case"link":return(0,r.jsx)("a",{className:`${i}-chat-md-link`,href:n.href,target:"_blank",rel:"noopener noreferrer",children:n.text},o);default:return OS(n,o)}})}function OS(e,t){let a=J0(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${i}-chat-md-highlight`,children:a},t)}}function VS(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function kr(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var F0=["residence","workplace","gathering","other"];function Hn(e){return e.classes?.length?e.classes:kr(e)?["residence"]:["other"]}function R0(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function Ru(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function at(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function O0({draft:e,existing:t,villagers:a,editableClasses:n,onChange:o}){let l=Hn(e),c=(u,h)=>{let g=l.map($=>$===u?{...at(e,$),...h}:at(e,$));o({...e,spaces:g,description:g[0]?.description??e.description})};return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.name,maxLength:100,onChange:u=>o({...e,name:u.target.value}),placeholder:"The Lantern Workshop"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form ",(0,r.jsx)("span",{className:`${i}-hint`,children:"What is it, in your world?"}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.form??"",maxLength:200,onChange:u=>o({...e,form:u.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map pin \xB7 optional"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,r.jsx)("div",{className:`${i}-row`,children:["x","y"].map(u=>(0,r.jsxs)("label",{className:`${i}-label`,children:[u==="x"?"Across":"Down",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[u]??"",disabled:t&&Ru(e)>0,onChange:h=>o({...e,presentation:{...e.presentation,[u]:h.target.value===""?null:Number(h.target.value)}})})]},u))}),t&&Ru(e)>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:F0.map(u=>(0,r.jsxs)("label",{className:`${i}-label`,style:{textTransform:"capitalize"},children:[(0,r.jsx)("input",{type:"checkbox",checked:l.includes(u),disabled:t||!l.includes(u)&&l.length>=2,onChange:h=>{let g=h.target.checked?[...l,u]:l.filter($=>$!==u);g.length<1||g.length>2||o({...e,classes:g,spaces:g.map($=>at(e,$))})}})," ",u]},u))}),t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Class changes go through a Venue proposal."}):null]}),l.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:u=>o({...e,residenceCapacity:Number(u.target.value)})}),t?(0,r.jsx)("span",{className:`${i}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,l.includes("workplace")?(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Workers"}),a.map(u=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(u.characterId),onChange:h=>o({...e,workerIds:h.target.checked?[...e.workerIds??[],u.characterId]:(e.workerIds??[]).filter(g=>g!==u.characterId)})})," ",u.name]},u.characterId)),a.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No villagers are available yet."}):null]}):null,l.filter(u=>!n||n.includes(u)).map(u=>{let h=at(e,u);return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,style:{textTransform:"capitalize"},children:[u," space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.description,maxLength:1e3,onChange:g=>c(u,{description:g.target.value})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Current physical state used by visits and pictures."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:h.state.condition,onChange:g=>c(u,{state:{...h.state,condition:g.target.value}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.items.join(`
`),onChange:g=>c(u,{state:{...h.state,items:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.publicFacts.join(`
`),onChange:g=>c(u,{state:{...h.state,publicFacts:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((g,$)=>(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,value:g.text,"aria-label":`Feature ${$+1}`,onChange:x=>c(u,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,text:x.target.value}:f)}})}),(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g.locked,onChange:x=>c(u,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,locked:x.target.checked}:f)}})})," ","Locked"]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,"aria-label":`Remove feature ${$+1}`,onClick:()=>c(u,{state:{...h.state,features:h.state.features.filter(x=>x.id!==g.id)}}),children:"\xD7"})]},g.id)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:h.state.features.length>=5,onClick:()=>c(u,{state:{...h.state,features:[...h.state.features,{id:Su(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},u)})]})}function Mp(e){return e.filter(t=>kr(t))}function _n(e){return e.filter(t=>!kr(t)||Hn(t).some(a=>a!=="residence"))}function DS(e,t){let a=Mp(e);return a.length!==t.length?!1:t.every((n,o)=>{let l=a[o];return l.id===n.id&&l.name===n.name&&(l.form??"Home")===n.form&&l.occupancy.playerHome===n.isPlayerHome&&l.occupancy.residentCharacterId===n.characterId&&l.description===n.description&&Math.abs((l.presentation.x??-1)-(n.x??-1))<1e-4&&Math.abs((l.presentation.y??-1)-(n.y??-1))<1e-4})}function _S(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let l=a.get(o.id);return{id:o.id,name:o.name,form:o.form,classes:["residence"],spaces:[{...at(l??{id:o.id,name:o.name,description:o.description,category:"",presentation:{image:null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}},"residence"),description:o.description}],residenceCapacity:l?.residenceCapacity??1,residentIds:o.characterId?[o.characterId]:[],improvements:l?.improvements??[null,null],description:o.description,category:l?.category??"",presentation:{image:l?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:l?.capabilities??[],state:l?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...e.filter(o=>!kr(o))]}function es(){return Math.random().toString(36).slice(2,10)}function io(e){return Math.round(e*1e4)/1e4}var HS=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),P0=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),US=6e4,IS=700;function V0(e){return`${HS.format(e)} \xB7 ${P0.format(e)}`}function qS(){let[e,t]=(0,m.useState)(()=>V0(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(V0(new Date)),1e3);return()=>clearInterval(a)},[]),e}function BS(){let[e,t]=qS().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${i}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function LS({weather:e}){return(0,r.jsxs)("span",{className:`${i}-mobile-datetime`,children:[(0,r.jsx)(BS,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:jS(e)})]})}function jS(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function D0(e){return e?.closest(i)??null}function GS(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(D0(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,n=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":n,title:n,onClick:o=>{let l=D0(o.currentTarget);if(!l)return;if(document.fullscreenElement===l){document.exitFullscreen().catch(()=>{});return}let c=l.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function YS({happenings:e,recap:t,mobile:a=!1}){let n=(0,m.useRef)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=n.current;if(!c)return;let u=()=>l(c.open);return c.addEventListener("toggle",u),()=>c.removeEventListener("toggle",u)},[]),(0,m.useEffect)(()=>{if(!o)return;let c=u=>{!(u.target instanceof Node)||n.current?.contains(u.target)||n.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[o]),(0,r.jsxs)("details",{ref:n,className:`${i}-news`,children:[(0,r.jsxs)("summary",{className:`${i}-button ${i}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${i}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${i}-news-panel`,children:[(0,r.jsx)("h2",{className:`${i}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${i}-news-list`,children:t.details.map(c=>(0,r.jsx)("li",{className:`${i}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,r.jsx)("p",{className:`${i}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${i}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${i}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${i}-news-list`,children:e.map(c=>(0,r.jsx)("li",{className:`${i}-news-item`,children:c.text},c.id))})]})]})}function W0(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function XS(e){return e.length>0?W0(e,!0):"Empty house"}function _0(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function H0(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function QS(e,t){return t.length>0?W0(t,!0):e.name||"An empty house"}function ts(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var ZS=.028;function as(e){return new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(typeof n.result=="string"?n.result:""),n.onerror=()=>a(new Error("That picture could not be read.")),n.readAsDataURL(e)})}function Np(e){return new Promise((t,a)=>{let n=new Image;n.onload=()=>t({width:n.naturalWidth,height:n.naturalHeight}),n.onerror=()=>a(new Error("That picture could not be read.")),n.src=e})}var U0=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function Sp(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function Tp(e,t,a){return e<t?t:e>a?a:e}function KS(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),u=e.width*c,h=e.height*c;return{left:(t.width-u)/2,top:(t.height-h)/2,width:u,height:h}}let n=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*n,l=e.height*n;return{left:(t.width-o)*(a.focusX/100),top:(t.height-l)*(a.focusY/100),width:o,height:l}}function JS(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function zu(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function kp({src:e,alt:t,pins:a,placing:n,view:o,shape:l,zoom:c,onPlace:u,onView:h,onDismiss:g,compact:$,fitToRoom:x,mobile:f,photoPins:b,children:C}){let k=u!==void 0,R=h!==void 0,w=(0,m.useRef)(null),y=(0,m.useRef)(null),[v,S]=(0,m.useState)(null),[O,P]=(0,m.useState)(null),[H,B]=(0,m.useState)(null),be=(0,m.useRef)(null),X=(0,m.useRef)(new Map),De=(0,m.useRef)(null),[Me,qa]=(0,m.useState)(null),[yi,It]=(0,m.useState)(null),nt=(0,m.useRef)(null),q=(0,m.useRef)(null),ae=(0,m.useRef)(!1),[qe,Ba]=(0,m.useState)(null),le=(0,m.useMemo)(()=>qe?{...o,...qe}:o,[qe,o]),oe=e?v?.src===e?v:null:l,wi={zoom:oe&&O?Tu(oe,O):1,centerX:.5,centerY:.5},da=H??wi,Z=(0,m.useMemo)(()=>f?oe&&O?fp(oe,O,da):null:e?v&&v.src===e&&O?KS(v,O,le):null:O?{left:0,top:0,width:O.width,height:O.height}:null,[v,O,le,f,oe,da,e]);(0,m.useEffect)(()=>{B(null),be.current=null,X.current.clear(),De.current=null},[e,O?.width,O?.height]);let Ft=l?x&&Me?{width:`${Me.width}px`,height:`${Me.height}px`,aspectRatio:`${l.width} / ${l.height}`}:{aspectRatio:`${l.width} / ${l.height}`}:void 0,Pt=(0,m.useCallback)(()=>{let z=y.current;if(!z)return;let U=z.getBoundingClientRect();U.width===0||U.height===0||P(se=>se&&se.width===U.width&&se.height===U.height?se:{width:U.width,height:U.height})},[]);(0,m.useEffect)(()=>{let z=y.current;if(!z||typeof ResizeObserver>"u")return;let U=new ResizeObserver(()=>Pt());return U.observe(z),()=>U.disconnect()},[Pt]);let ha=(0,m.useCallback)(()=>{let z=w.current?.parentElement;if(!z||!l)return;let U=z.getBoundingClientRect(),se=getComputedStyle(z),we=Xe=>Number.parseFloat(se.getPropertyValue(Xe))||0,W=U.width-we("padding-left")-we("padding-right"),pt=U.height-we("padding-top")-we("padding-bottom"),Fe=l.width/l.height,j=Math.min(W,pt*Fe);j>0&&qa(Xe=>Xe&&Math.abs(Xe.width-j)<.5?Xe:{width:j,height:j/Fe})},[l]);(0,m.useLayoutEffect)(()=>{if(!x||(ha(),typeof ResizeObserver>"u"))return;let z=w.current?.parentElement;if(!z)return;let U=new ResizeObserver(()=>ha());return U.observe(z),()=>U.disconnect()},[x,ha]);let ge=(0,m.useCallback)(z=>{if(!k||!u||!Z)return;let U=z.currentTarget.getBoundingClientRect(),se=(z.clientX-U.left-Z.left)/Z.width,we=(z.clientY-U.top-Z.top)/Z.height;if(!(se>=0&&se<=1)||!(we>=0&&we<=1))return;let pt=y.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();u(io(se),io(we),{width:Z.width,height:Z.height,photoWidth:pt?.width??58,photoHeight:pt?.height??58})},[u,k,Z]),Ge=(0,m.useCallback)(z=>{if(!R||!Z||!h||le.fit!=="cover")return;let U=z.currentTarget.getBoundingClientRect();nt.current={x:z.clientX,y:z.clientY,focusX:le.focusX,focusY:le.focusY,spanX:U.width-Z.width,spanY:U.height-Z.height},Ba({focusX:le.focusX,focusY:le.focusY}),z.currentTarget.setPointerCapture(z.pointerId),z.preventDefault()},[R,le.focusX,le.focusY,le.fit,h,Z]),re=(0,m.useCallback)(z=>{let U=nt.current;if(!U)return;let se=U.spanX===0?U.focusX:U.focusX+(z.clientX-U.x)/U.spanX*100,we=U.spanY===0?U.focusY:U.focusY+(z.clientY-U.y)/U.spanY*100;Ba({focusX:io(Tp(se,0,100)),focusY:io(Tp(we,0,100))})},[]),mt=(0,m.useCallback)(z=>{if(!nt.current)return;nt.current=null,z.currentTarget.hasPointerCapture(z.pointerId)&&z.currentTarget.releasePointerCapture(z.pointerId);let U=qe;Ba(null),U&&h&&h({...o,...U})},[qe,h,o]),Ea=(0,m.useCallback)(z=>{!h||!c||h({...o,zoom:io(Tp(z,c.min,c.max))})},[h,o,c]),qt=()=>{let z=[...X.current.values()];if(z.length===0){De.current=null;return}let U=z[0],se=z[1];De.current={view:be.current??da,x:se?(U.x+se.x)/2:U.x,y:se?(U.y+se.y)/2:U.y,distance:se?Math.hypot(U.x-se.x,U.y-se.y):1}},ma=z=>{if(!f||z.pointerType!=="touch"||(z.isPrimary&&(X.current.clear(),ae.current=!1),!y.current)||z.target instanceof Element&&z.target.closest(`.${i}-doors, .${i}-zoom`))return;w.current?.setAttribute("data-mobile-gesturing","true");let U=y.current.getBoundingClientRect();X.current.set(z.pointerId,{x:z.clientX-U.left,y:z.clientY-U.top}),X.current.size>1&&(ae.current=!0),qt()},St=z=>{if(!f||!X.current.has(z.pointerId)||!oe||!O||!y.current)return;let U=y.current.getBoundingClientRect();X.current.set(z.pointerId,{x:z.clientX-U.left,y:z.clientY-U.top});let se=[...X.current.values()],we=se[0],W=se[1],pt=W?(we.x+W.x)/2:we.x,Fe=W?(we.y+W.y)/2:we.y,j=W?Math.hypot(we.x-W.x,we.y-W.y):1,Xe=De.current;if(!Xe||!b0(Xe,{x:pt,y:Fe,distance:j})&&!ae.current)return;ae.current||g?.(),ae.current=!0;let Ca=v0(oe,O,Xe.view,{x:Xe.x,y:Xe.y},{x:pt,y:Fe},W&&Xe.distance>0?j/Xe.distance:1);be.current=Ca,B(Ca)},mn=(z,U=!1)=>{if(!f||!X.current.has(z.pointerId))return;let se=!U&&X.current.size===1&&!ae.current;if(X.current.delete(z.pointerId),X.current.size===0&&w.current?.removeAttribute("data-mobile-gesturing"),qt(),!se||!(z.target instanceof Element))return;let we=z.target.closest(`.${i}-pin`)?.dataset.pinId,W=we?a.find(pt=>pt.id===we):null;if(W?.onSelect){ae.current=!0,W.onSelect();return}if(!(!z.target.closest(`.${i}-canvas`)||z.target.closest("button")))if(k&&n&&u&&Z){let pt=y.current.getBoundingClientRect(),Fe=(z.clientX-pt.left-Z.left)/Z.width,j=(z.clientY-pt.top-Z.top)/Z.height;if(Fe>=0&&Fe<=1&&j>=0&&j<=1){ae.current=!0;let Bt=y.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();u(io(Fe),io(j),{width:Z.width,height:Z.height,photoWidth:Bt?.width??72,photoHeight:Bt?.height??72})}}else g&&(ae.current=!0,g())};return(0,r.jsxs)("div",{ref:w,className:`${i}-stage${$?` ${i}-stage-compact`:""}`,style:Ft,"data-shaped":l?"true":"false","data-framing":R&&le.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":b?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:z=>{if(f){ma(z);return}ae.current=!1,q.current=z.pointerType==="touch"?{x:z.clientX,y:z.clientY}:null},onPointerMoveCapture:z=>{if(f){St(z);return}let U=q.current;U&&(Math.abs(z.clientX-U.x)>8||Math.abs(z.clientY-U.y)>8)&&(ae.current=!0)},onPointerUpCapture:f?mn:void 0,onPointerCancelCapture:z=>{f&&mn(z,!0),q.current&&(ae.current=!0)},onClickCapture:z=>{ae.current&&(ae.current=!1,z.preventDefault(),z.stopPropagation())},children:[C,(0,r.jsxs)("div",{ref:y,className:`${i}-canvas`,"data-placing":k&&n?"true":"false","data-dragging":qe?"true":"false",onClick:k&&n?ge:g?()=>g():void 0,onPointerDown:R?Ge:void 0,onPointerMove:R?re:void 0,onPointerUp:R?mt:void 0,onPointerCancel:R?mt:void 0,children:[e?(0,r.jsx)("img",{className:`${i}-canvas-img`,style:f&&Z?{position:"absolute",left:Z.left,top:Z.top,width:Z.width,height:Z.height,objectFit:"fill"}:JS(le),src:e,alt:t,draggable:!1,onLoad:z=>{let{naturalWidth:U,naturalHeight:se}=z.currentTarget;U<=0||se<=0||(S({src:e,width:U,height:se}),Pt())},onError:()=>It(e)}):(0,r.jsxs)(r.Fragment,{children:[f&&Z?(0,r.jsx)("span",{className:`${i}-mobile-logical`,style:{left:Z.left,top:Z.top,width:Z.width,height:Z.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${i}-canvas-empty`,children:"Logical village map"})]}),e&&yi===e?(0,r.jsx)("span",{className:`${i}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,Z?a.map(z=>(0,r.jsxs)("span",{className:`${i}-pin-holder`,"data-selected":z.selected?"true":"false",style:{left:`${Z.left+z.x*Z.width}px`,top:`${Z.top+(z.y+(f&&z.kind!=="person"?0:z.dy??0))*Z.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${i}-pin`,"data-pin-id":z.id,"data-tone":z.tone,"data-kind":z.kind??"place","data-selected":z.selected?"true":"false","aria-expanded":z.doors?!0:void 0,disabled:z.onSelect===void 0,title:z.text,onClick:U=>{U.stopPropagation(),z.onSelect?.()},children:(f||b)&&z.kind!=="person"?(0,r.jsxs)("span",{className:`${i}-pin-photo-card`,style:{transform:`scale(${w0(f?y0(da.zoom,wi.zoom):gS,z.selected===!0)})`},children:[(0,r.jsxs)("span",{className:`${i}-pin-photo`,"aria-hidden":"true",children:[z.image?(0,r.jsx)("img",{src:z.image,alt:"",loading:"lazy",draggable:!1}):(0,r.jsx)("span",{className:`${i}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,r.jsx)("span",{className:`${i}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:z.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${i}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:z.text})]})}),z.onRemove?(0,r.jsx)("button",{type:"button",className:`${i}-pin-remove`,"aria-label":`Take ${z.text} off the map`,onClick:U=>{U.stopPropagation(),z.onRemove?.()},children:"\xD7"}):null,z.onResume?(0,r.jsx)("button",{type:"button",className:`${i}-pin-resume`,onClick:U=>{U.stopPropagation(),z.onResume?.()},children:"DEBUG: Resume Chat"}):null]},z.id)):null]}),Z?a.filter(z=>z.doors!==void 0&&z.doors.length>0).map(z=>(0,r.jsx)("div",{className:`${i}-doors`,style:{left:`${O?bp(Z,O,z).left:Z.left+z.x*Z.width}px`,top:`${O?bp(Z,O,z).top:Z.top+(z.y+(z.dy??0))*Z.height}px`},children:z.doors?.map(U=>(0,r.jsx)("button",{type:"button",className:`${i}-door`,onClick:se=>{se.stopPropagation(),U.onSelect()},children:U.label},U.label))},`doors:${z.id}`)):null,R&&c&&le.fit==="cover"?(0,r.jsxs)("div",{className:`${i}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:le.zoom>=c.max,onClick:()=>Ea(le.zoom+c.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:le.zoom<=c.min,onClick:()=>Ea(le.zoom-c.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:le.focusX===50&&le.focusY===50&&le.zoom===c.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function oo(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function FS({scenario:e}){let t=bS(e),[a,n]=(0,m.useState)(null);return(0,r.jsxs)("div",{className:`${i}-scenario-art-panel`,children:[a===t?(0,r.jsx)("span",{className:`${i}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,r.jsx)("img",{src:t,alt:`${ro(e).label} village scene`,onError:()=>n(t)}),(0,r.jsxs)("div",{className:`${i}-scenario-art-content`,children:[(0,r.jsx)("p",{children:"A new beginning awaits."}),(0,r.jsx)("strong",{children:ro(e).description})]})]})}function PS({label:e,choices:t,selectedId:a,onSelect:n,disabled:o,emptyMessage:l}){return t.length?(0,r.jsx)("div",{className:`${i}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,r.jsxs)("button",{type:"button",className:`${i}-identity-card`,"aria-pressed":a===c.id,disabled:o,onClick:()=>n(c.id),children:[(0,r.jsx)(lo,{portrait:c.portrait,name:c.name,className:`${i}-identity-card-face`,glyph:"person"}),(0,r.jsx)("strong",{children:c.name}),c.hint?(0,r.jsx)("small",{children:c.hint}):null]},c.id))}):(0,r.jsx)("p",{className:`${i}-hint`,children:l})}function WS({value:e}){return(0,r.jsxs)("section",{className:`${i}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,r.jsx)(lo,{portrait:e.portrait,name:e.name,className:`${i}-identity-preview-face`,glyph:"person"}),(0,r.jsxs)("div",{className:`${i}-identity-preview-copy`,children:[(0,r.jsx)("h3",{children:e.name}),e.overview?(0,r.jsx)("p",{className:`${i}-identity-overview`,children:e.overview}):null,e.details.length?(0,r.jsx)("dl",{className:`${i}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:t}),(0,r.jsx)("dd",{children:a})]},t))}):null,(0,r.jsx)("p",{className:`${i}-identity-context`,children:e.context})]})]})}function I0(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let n=a.lastIndexOf(" ",t),o=a.indexOf(" ",t);return`${a.slice(0,n>0?n:o>0?o:a.length).trimEnd()}\u2026`}function q0(e){return e.avatarPath?{url:e.avatarPath,crop:Vp(e.avatarCrop)}:void 0}function e2({personas:e,draft:t,onDraft:a,disabled:n}){let[o,l]=(0,m.useState)(""),[c,u]=(0,m.useState)(null),[h,g]=(0,m.useState)(""),$=e?.find(k=>k.id===t),x=$?.id,f=o.trim().toLocaleLowerCase(),b=(e??[]).filter(k=>!f||`${k.name} ${k.summary}`.toLocaleLowerCase().includes(f)).sort((k,R)=>k.name.localeCompare(R.name,void 0,{sensitivity:"base"})).map(k=>({id:k.id,name:k.name,portrait:q0(k),hint:k.summary}));(0,m.useEffect)(()=>{if(u(null),g(""),!t||!x)return;let k=new AbortController;return D(`/personas/${encodeURIComponent(t)}`,{signal:k.signal}).then(R=>{k.signal.aborted||u(R.persona)}).catch(R=>{k.signal.aborted||g(I(R,"This Persona could not be read."))}),()=>k.abort()},[t,x]);let C=c&&c.id===t?{id:c.id,name:c.name,portrait:q0(c),overview:I0(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,k])=>k.trim()).map(([k,R])=>({label:k,text:I0(R,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,r.jsxs)("div",{className:`${i}-founding-persona`,children:[(0,r.jsxs)("div",{className:`${i}-identity-picker-head`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-persona-search`,children:"Who are you?"}),(0,r.jsx)("input",{id:`${i}-setup-persona-search`,className:`${i}-search`,type:"search",value:o,placeholder:"Search Personas",onChange:k=>l(k.target.value),disabled:n||e===null})]}),(0,r.jsx)(PS,{label:"Choose a Persona",choices:b,selectedId:t,onSelect:a,disabled:n,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!$?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):C?(0,r.jsx)(WS,{value:C}):h?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:h}):$?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Reading ",$.name,"\u2026"]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function t2({idPrefix:e,personas:t,draft:a,onDraft:n,storedId:o,storedName:l,storedMissing:c,disabled:u}){let h=(t??[]).find(f=>f.id===a)??null,g=h?.name??(a===o?l:""),$=c&&a===o,x=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${i}-${e}-persona`,className:`${i}-select`,value:a,disabled:u||t===null||t.length===0,onChange:f=>n(f.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,r.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),x?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:$?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${i}-macro-help`,children:h.summary}):null]}):null]})}function B0({books:e,error:t,selected:a,onChange:n,disabled:o}){let[l,c]=(0,m.useState)(""),u=new Map((e??[]).map(b=>[b.id,b])),h=(e??[]).filter(b=>!b.hiddenFromLibrary||a.includes(b.id)),g=a.filter(b=>!u.has(b)),x=[...h,...g.map(b=>({id:b,name:b,enabled:!1}))].filter(b=>b.name.toLocaleLowerCase().includes(l.trim().toLocaleLowerCase())),f=x.slice(0,50);return(0,r.jsxs)("fieldset",{className:`${i}-field ${i}-lore-picker`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,r.jsx)("div",{className:`${i}-lore-selected`,"aria-live":"polite",children:a.length?a.map(b=>(0,r.jsxs)("span",{className:`${i}-lore-chip`,children:[(0,r.jsxs)("span",{children:[u.get(b)?.name??b,e===null?" (checking)":u.has(b)?u.get(b)?.enabled?"":" (disabled)":" (missing)"]}),(0,r.jsx)("button",{type:"button","aria-label":`Remove ${u.get(b)?.name??b}`,disabled:o,onClick:()=>n(a.filter(C=>C!==b)),children:"\xD7"})]},b)):(0,r.jsx)("span",{className:`${i}-hint`,children:"No lorebooks selected."})}),t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No lorebooks in the Engine library."}):null,(0,r.jsxs)("details",{className:`${i}-lore-options`,children:[(0,r.jsxs)("summary",{className:`${i}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,r.jsx)("input",{type:"search",className:`${i}-search`,value:l,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:b=>c(b.target.value)}),(0,r.jsxs)("div",{className:`${i}-lore-results`,children:[f.map(b=>{let C=a.includes(b.id),k=g.includes(b.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":b.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:C,disabled:o||!b.enabled&&!C||!C&&a.length>=24,onChange:()=>n(C?a.filter(R=>R!==b.id):[...a,b.id])}),b.name,k?` (${k})`:""]},b.id)}),e!==null&&x.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No matching lorebooks."}):null,x.length>f.length?(0,r.jsx)("p",{className:`${i}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function a2({homes:e,villagers:t,disabled:a,selectedId:n,onPatch:o,onRemove:l,onSelect:c,lockedIds:u,showDescriptions:h,onGenerateDescription:g}){let $=new Set(e.map(x=>x.characterId));return(0,r.jsx)("div",{className:`${i}-home-list`,children:e.map((x,f)=>{let b=u?.has(x.id)??!1,C=t.find(k=>k.id===x.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${i}-home-row`,"data-selected":x.id===n?"true":"false",onMouseEnter:()=>c(x.id),children:[(0,r.jsx)("span",{className:`${i}-home-index`,"aria-hidden":"true",children:f+1}),x.isPlayerHome?(0,r.jsx)("span",{className:`${i}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-who`,children:C?`${C} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${i}-select`,value:x.characterId??"",disabled:a||b,"aria-label":`Who lives in home ${f+1}`,onChange:k=>o(x.id,{characterId:k.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(k=>{let R=k.id!==x.characterId&&$.has(k.id);return(0,r.jsx)("option",{value:k.id,disabled:R,children:R?`${k.name} \u2014 already housed`:k.name},k.id)})]}):null]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Venue name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:x.name,maxLength:60,disabled:a||b,onChange:k=>o(x.id,{name:k.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:x.form,maxLength:240,disabled:a||b,onChange:k=>o(x.id,{form:k.target.value}),placeholder:"Cabin, truck, sleeping pod\u2026"})]}),h?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("textarea",{className:`${i}-textarea`,value:x.description,maxLength:1e3,disabled:a||b,"aria-label":`Description of home ${f+1}`,onChange:k=>o(x.id,{description:k.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:a||b,onClick:()=>g?.(x),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:a||b,"aria-label":`Take home ${f+1} off the map`,onClick:()=>l(x.id),children:"\xD7"}),b?(0,r.jsx)("span",{className:`${i}-hint`,children:"Move approved and completed before changing this home."}):null]},x.id)})})}function L0({id:e,label:t,hint:a,options:n,value:o,disabled:l,onChange:c}){let u=o.length>0&&!n.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${i}-select`,value:o,disabled:l,onChange:h=>c(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),u?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,n.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a})]})}function Ep({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[n,o]=(0,m.useState)(null),[l,c]=(0,m.useState)([]),[u,h]=(0,m.useState)(""),[g,$]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let R=!1;return(async()=>{try{let[w,y]=await Promise.all([D("/connections"),Op("/api/connections")]);if(R)return;o(w),c(RS(Array.isArray(y)?y:[]))}catch(w){R||h(I(w,"This agent's connections could not be read."))}})(),()=>{R=!0}},[]);let x=(0,m.useCallback)(async R=>{$(!0),h("");try{o(await D("/connections",{method:"PUT",body:JSON.stringify(R)}))}catch(w){h(I(w,"That connection could not be saved."))}finally{$(!1)}},[]),f=l.filter(R=>R.category==="language"),b=l.filter(R=>R.category==="image_generation"),C=b.some(R=>R.defaultForAgents),k=n!==null&&(n.imageConnectionId===$p||b.length===0||n.imageConnectionId.length===0&&!C);return(0,m.useEffect)(()=>{if(!e)return;let R=n?.systemConnectionId??"",w=n?.narrationConnectionId??"";n?R.length===0||w.length===0?e("Choose both System and Narration connections before continuing."):!f.some(y=>y.id===R)||!f.some(y=>y.id===w)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,n,f]),(0,m.useEffect)(()=>{t?.(k)},[k,t]),(0,r.jsxs)("div",{className:`${i}-field ${a?`${i}-connections-compact`:""}`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Connections"}),a?(0,r.jsx)("p",{className:`${i}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),n?(0,r.jsxs)("div",{className:a?`${i}-connections-grid`:"",children:[(0,r.jsx)(L0,{id:`${i}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:f,value:n.systemConnectionId,disabled:g,onChange:R=>{x({systemConnectionId:R})}}),(0,r.jsx)(L0,{id:`${i}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:f,value:n.narrationConnectionId,disabled:g,onChange:R=>{x({narrationConnectionId:R})}}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${i}-connection-image`,className:`${i}-select`,value:n.imageConnectionId,disabled:g,onChange:R=>{x({imageConnectionId:R.target.value})},children:[(0,r.jsx)("option",{value:$p,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),n.imageConnectionId.length>0&&n.imageConnectionId!==$p&&!b.some(R=>R.id===n.imageConnectionId)?(0,r.jsx)("option",{value:n.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,b.map(R=>(0,r.jsx)("option",{value:R.id,children:R.name},R.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,r.jsxs)(r.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${i}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):u.length===0?(0,r.jsx)("span",{className:`${i}-hint`,children:"Reading this agent's connections\u2026"}):null,u?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:u}):null]})}function e1(){let[e,t]=(0,m.useState)(null),[a,n]=(0,m.useState)(""),[o,l]=(0,m.useState)(!1),[c,u]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return D("/narration").then($=>{g||t($)}).catch($=>{g||n(I($,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{l(!0),u(!1),n("");try{let $=await D("/narration",{method:"PUT",body:JSON.stringify(g)});return t($),u(!0),$}catch($){return n(I($,"That writing change could not be saved.")),null}finally{l(!1)}},[]);return{view:e,error:a,busy:o,saved:c,save:h}}function n2(){let{view:e,error:t,busy:a,saved:n,save:o}=e1(),[l,c]=(0,m.useState)(null),u=l??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:i+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Narration style",value:u,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.styleInstructions,onClick:()=>{o({styleInstructions:u}).then(h=>{h&&c(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&c(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:i+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function i2(){let{view:e,error:t,busy:a,saved:n,save:o}=e1(),[l,c]=(0,m.useState)(null),u=l??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:i+"-panel",children:[(0,r.jsx)("h2",{className:i+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:i+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Villager reply guidance",value:u,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.replyGuidance,onClick:()=>{o({replyGuidance:u}).then(h=>{h&&c(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&c(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:i+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function lo({portrait:e,name:t,className:a,glyph:n="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:zS(e.crop)}):n==="person"?(0,r.jsxs)("svg",{className:`${i}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function o2({villager:e,portrait:t,selected:a,onSelect:n}){return(0,r.jsxs)("div",{className:`${i}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-tile-head`,children:[(0,r.jsx)(lo,{portrait:t,name:e.name,className:`${i}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${i}-tile-name`,onClick:n,disabled:n===void 0,title:n?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${i}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${i}-tag`,children:o},o))]})]})}function j0(e,t){let a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function r2(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((x,f)=>{let b=C=>{let k=Au.indexOf(C);return k<0?Au.length:k};return b(x.label)-b(f.label)||x.label.localeCompare(f.label)||x.view.localeCompare(f.view)}),n=512,o=768,l=2,c=document.createElement("canvas");c.width=l*n,c.height=Math.ceil(a.length/l)*o;let u=c.getContext("2d");if(!u)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let x=0;x<a.length;x+=1){let f=a[x],b=new Image;b.src=f.url,await b.decode();let C=x%l*n,k=Math.floor(x/l)*o,R=Math.min(n/b.naturalWidth,o/b.naturalHeight),w=Math.round(b.naturalWidth*R),y=Math.round(b.naturalHeight*R);u.drawImage(b,C+Math.floor((n-w)/2),k+o-y,w,y),h.push({view:f.view,expression:f.label,x:C,y:k,width:n,height:o})}let g=await new Promise((x,f)=>c.toBlob(b=>b?x(b):f(new Error("The browser could not export this sheet.")),"image/png")),$=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";j0(`${$}-sprites.png`,g),j0(`${$}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function l2({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[n,o]=(0,m.useState)("front"),[l,c]=(0,m.useState)("neutral"),[u,h]=(0,m.useState)(""),[g,$]=(0,m.useState)(""),[x,f]=(0,m.useState)(!0),[b,C]=(0,m.useState)(null),[k,R]=(0,m.useState)([]),[w,y]=(0,m.useState)(!1),[v,S]=(0,m.useState)(""),[O,P]=(0,m.useState)(""),H=(0,m.useRef)(null),B=e.sprite?.images??[],be=B.filter(q=>q.view===n),X=B.some(q=>q.view==="front"&&q.label==="neutral"),De=be.some(q=>q.label==="neutral"),Me=l==="custom"?u.trim().toLowerCase().replace(/\s+/g,"_"):l,qa=be.find(q=>q.label===Me),yi=[...Au,...B.map(q=>q.label).filter(q=>!Au.includes(q))].filter((q,ae,qe)=>qe.indexOf(q)===ae);(0,m.useEffect)(()=>{C(null),o("front"),c("neutral"),S(""),D(`${a}/source`).then(q=>R(q.sprites)).catch(()=>R([]))},[a]);async function It(q){y(!0),S(""),P("");try{await q()}catch(ae){S(I(ae,"The sprite could not be prepared."))}finally{y(!1)}}function nt(){if(!/^[a-z0-9_-]{1,40}$/.test(Me))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(n==="side"&&!X)throw new Error("Approve the front neutral sprite first.");if(Me!=="neutral"&&!De)throw new Error(`Approve the ${n} neutral sprite first.`);return Me}return(0,r.jsxs)("section",{className:`${i}-sprite-editor`,"aria-label":`${e.name} sprite studio`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-heading`,children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{children:[e.name,"'s sprite studio"]}),(0,r.jsx)("p",{children:"Build a front view for player conversations and one side profile for villager-to-villager moments."})]}),(0,r.jsxs)("span",{className:`${i}-sprite-count`,children:[B.length," approved"]})]}),(0,r.jsx)("div",{className:`${i}-sprite-views`,"aria-label":"Sprite view",children:["front","side"].map(q=>(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-view`,"aria-pressed":n===q,"data-active":n===q?"true":"false",disabled:w,onClick:()=>{o(q),c("neutral"),C(null)},children:[(0,r.jsx)("strong",{children:q==="front"?"Facing you":"Facing villagers"}),(0,r.jsxs)("span",{children:[B.filter(ae=>ae.view===q).length," approved \xB7"," ",q==="front"?"front":"side, mirrored left or right"]})]},q))}),(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Choose an expression"}),(0,r.jsx)("span",{children:"Only approved images appear in scenes."})]}),(0,r.jsxs)("div",{className:`${i}-sprite-choices`,children:[yi.map(q=>{let ae=be.find(qe=>qe.label===q);return(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":l===q?"true":"false","aria-pressed":l===q,disabled:w,onClick:()=>{c(q),C(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,children:ae?(0,r.jsx)("img",{src:ae.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:"\uFF0B"})}),(0,r.jsx)("span",{children:q}),(0,r.jsx)("small",{children:ae?"Approved":"Open"})]},q)}),(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":l==="custom"?"true":"false","aria-pressed":l==="custom",disabled:w,onClick:()=>{c("custom"),C(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,"aria-hidden":"true",children:"\u2726"}),(0,r.jsx)("span",{children:"Custom"}),(0,r.jsx)("small",{children:"Name your own"})]})]}),l==="custom"?(0,r.jsxs)("label",{children:["Custom expression name",(0,r.jsx)("input",{value:u,maxLength:40,disabled:w,onChange:q=>{h(q.target.value),C(null)}})]}):null,(0,r.jsxs)("div",{className:`${i}-sprite-selected`,children:[(0,r.jsxs)("strong",{children:[n==="front"?"Front":"Side"," \xB7 ",Me||"custom"]}),(0,r.jsx)("span",{children:qa?"Approved art is ready. You can replace it after reviewing a new candidate.":"No approved art yet."})]}),n==="side"&&!X?(0,r.jsx)("p",{className:`${i}-hint`,children:"Start with an approved front neutral sprite to keep the side profile recognizable."}):null,Me!=="neutral"&&!De?(0,r.jsx)("p",{className:`${i}-hint`,children:"Approve this view's neutral sprite before adding expressions."}):null,(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:g,maxLength:2e3,disabled:w,onChange:q=>$(q.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${i}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:x,disabled:w,onChange:q=>f(q.target.checked)})," ","Use an approved neutral or available portrait as the identity reference"]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${i}-sprite-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||n==="side"&&!X||Me!=="neutral"&&!De,onClick:()=>{It(async()=>{let q=nt(),ae=await D(`${a}/generate`,{method:"POST",body:JSON.stringify({view:n,expression:q,appearance:g,useReference:x})});C({view:n,label:q,image:ae.image}),P(`Candidate: ${ae.width} \xD7 ${ae.height}. Review before approving.`)})},children:w?"Working\u2026":`Generate ${n} ${Me||"sprite"} \xB7 1 image request`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||n==="side"&&!X||Me!=="neutral"&&!De,onClick:()=>H.current?.click(),children:"Upload candidate"}),(0,r.jsx)("input",{ref:H,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:q=>{It(async()=>{let ae=nt(),qe=q.target.files?.[0];qe&&C({view:n,label:ae,image:await as(qe)}),q.target.value=""})}})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"One cell per click. Approval, mirroring, and export use no image API. If the selected Engine connection fails, its configured fallback may make another provider attempt."}),b?(0,r.jsxs)("div",{className:`${i}-sprite-candidate`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Review candidate"}),(0,r.jsxs)("span",{children:[b.view," \xB7 ",b.label]})]}),(0,r.jsxs)("div",{className:`${i}-sprite-candidate-views`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:b.image,alt:`${b.view} ${b.label} candidate for ${e.name}`}),(0,r.jsx)("span",{children:b.view==="side"?"Facing right":"Facing you"})]}),b.view==="side"?(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{className:`${i}-sprite-mirrored`,src:b.image,alt:""}),(0,r.jsx)("span",{children:"Mirrored left \xB7 no extra image"})]}):null]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>{It(async()=>{let q=await D(`${a}/approve`,{method:"POST",body:JSON.stringify({view:b.view,expression:b.label,image:b.image})});t(q),C(null),P(`${b.view} ${b.label} approved.`)})},children:"Approve this sprite"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>C(null),children:"Discard candidate"})]})]}):null,k.length&&n==="front"?(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Copy an existing Engine full-body sprite"}),(0,r.jsx)("div",{className:`${i}-row`,children:k.map(q=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||q.expression!=="neutral"&&!De,onClick:()=>{It(async()=>{let ae=await D(`${a}/import`,{method:"POST",body:JSON.stringify({view:n,expression:q.expression})});t(ae),P(`${q.expression} copied to this Village.`)})},children:q.expression},q.expression))})]}):null,B.length?(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Display framing and export"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:w,onChange:q=>{It(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:q.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:w,onChange:q=>{It(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(q.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>{It(()=>r2(e))},children:"Download both views and manifest"})]})]})}):null,O?(0,r.jsx)("p",{role:"status",children:O}):null,v?(0,r.jsx)("p",{role:"alert",children:v}):null]})}function s2({entry:e,onDecide:t}){let[a,n]=(0,m.useState)(e.improvement?.title??""),[o,l]=(0,m.useState)(e.improvement?.description??""),[c,u]=(0,m.useState)(e.improvement?.extraBeds??0),[h,g]=(0,m.useState)(e.improvementSlot??0),[$,x]=(0,m.useState)(!1),[f,b]=(0,m.useState)(""),C=R=>{x(!0),b(""),t(R,{title:a,description:o,extraBeds:c,slot:h}).catch(w=>b(I(w,"That Venue request could not be decided."))).finally(()=>x(!1))},k=a!==e.improvement?.title||o!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Proposed improvement",(0,r.jsx)("input",{className:`${i}-notice-input`,value:a,onChange:R=>n(R.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:o,onChange:R=>l(R.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds",(0,r.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:R=>u(Number(R.target.value))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:h,onChange:R=>g(Number(R.target.value)),children:[(0,r.jsx)("option",{value:0,children:"Slot 1"}),(0,r.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:$||!a.trim()||!o.trim(),onClick:()=>C(!0),children:k?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:$,onClick:()=>C(!1),children:"Decline"})]}),f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null]})}function c2({room:e,speechColors:t,picture:a,draft:n,mode:o,targetId:l,busy:c,error:u,greetingNotice:h,ruling:g,open:$,ended:x,playerName:f,playerPortrait:b,portraits:C,sprites:k,onDraft:R,onMode:w,onTarget:y,onSend:v,onViewVenue:S,onEnterPrivate:O,privateSpaceOwnerName:P,onEnd:H,onLeavePending:B,endFailed:be,onRetryGreeting:X,onContinueWithoutGreeting:De,notices:Me,onDismissNotice:qa,debugDiscardEnabled:yi,onDebugDiscard:It,onUseMailbox:nt}){let[q,ae]=(0,m.useState)(0),[qe,Ba]=(0,m.useState)(!1),[le,oe]=(0,m.useState)(!1),[wi,da]=(0,m.useState)(!1),[Z,Ft]=(0,m.useState)(!1),[Pt,ha]=(0,m.useState)(null),ge=(0,m.useRef)(null),Ge=(0,m.useRef)(null),re=(0,m.useRef)(null),mt=(0,m.useRef)(null),Ea=(0,m.useRef)(null),qt=(0,m.useRef)(null),ma=(0,m.useRef)(null),St=(0,m.useRef)(null),mn=(0,m.useRef)(null),z=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let E=new Set(Me.map(F=>F.id)),ue=Me.some(F=>F.kind==="memory"&&!z.current.has(F.id));z.current=E,ue?da(!0):Me.length===0&&da(!1)},[Me,e.id]),(0,m.useEffect)(()=>{qe&&window.requestAnimationFrame(()=>qt.current?.focus())},[qe]),(0,m.useEffect)(()=>{if(!le)return;let E=F=>{St.current?.contains(F.target)||oe(!1)},ue=F=>{F.key==="Escape"&&oe(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("keydown",ue),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("keydown",ue)}},[le]),(0,m.useEffect)(()=>{if(!Z)return;let E=F=>{mt.current?.contains(F.target)||Ft(!1)},ue=F=>{F.key==="Escape"&&Ft(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("focusin",E),document.addEventListener("keydown",ue),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("focusin",E),document.removeEventListener("keydown",ue)}},[Z]);let U=(0,m.useCallback)(()=>{ha(null),window.requestAnimationFrame(()=>ge.current?.focus())},[]);(0,m.useEffect)(()=>{if(!Pt)return;window.requestAnimationFrame(()=>Ge.current?.focus());let E=ue=>{if(ue.key==="Tab"){ue.preventDefault(),Ge.current?.focus();return}ue.key==="Escape"&&(ue.preventDefault(),U())};return window.addEventListener("keydown",E),()=>window.removeEventListener("keydown",E)},[U,Pt]);let se=(0,m.useMemo)(()=>{let E=[],ue=new Map;for(let F of e.lines){if(F.kind!=="side"&&F.kind!=="whisper"||!F.asideFor)continue;let zt=ue.get(F.asideFor)??[];zt.push({register:F.kind,text:F.content,...F.targetId?{target:e.participants.find(Wt=>Wt.characterId===F.targetId)?.name??F.targetId}:{},speakerId:F.speakerId,name:F.name,expression:F.expression,gazeAt:F.gazeAt}),ue.set(F.asideFor,zt)}for(let F of e.lines){if(F.kind==="side"||F.kind==="whisper")continue;let zt=F.speakerId.length===0,Wt=l0(F.content,F.beats??null);Wt.paragraphs.forEach((Tt,pn)=>{E.push({key:`${E.length}`,speakerId:zt?"":F.speakerId,name:zt?f:F.name,player:zt,text:Tt,asides:[...Wt.asides[pn]??[],...pn===Wt.paragraphs.length-1?ue.get(F.id??"")??[]:[]],...F.kind?{register:F.kind==="narration"?"narration":"speech"}:{},...F.expression?{expression:F.expression}:{},...F.gazeAt?{gazeAt:F.gazeAt}:{}})})}return E},[f,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{ae(E=>m0(mn.current,e.id,se.length,E)),mn.current={roomId:e.id,stepCount:se.length}},[e.id,se.length]);let we=Math.min(q,Math.max(0,se.length-1)),W=se[we],pt=we>0,Fe=we<se.length-1,j=!x&&e.status==="active"&&!Fe,Xe=(0,m.useCallback)(()=>{let E=re.current;if(!E)return;let ue=window.getComputedStyle(E),F=Number.parseFloat(ue.lineHeight),zt=Number.parseFloat(ue.paddingTop)+Number.parseFloat(ue.paddingBottom),Wt=Math.ceil(F+zt),Tt=Math.ceil(F*2+zt);E.style.height="auto",E.style.height=`${Math.min(Math.max(E.scrollHeight,Wt),Tt)}px`,E.style.overflowY=E.scrollHeight>Tt+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{Xe()},[j,n,Xe]),(0,m.useEffect)(()=>{let E=re.current?.parentElement;if(!E)return;let ue=E.clientWidth,F=new ResizeObserver(()=>{E.clientWidth!==ue&&(ue=E.clientWidth,Xe())});return F.observe(E),()=>F.disconnect()},[j,Xe]);let Bt=()=>{!j||c||o!=="conclude"&&!n.trim()||o==="fulfill"&&!l||(Ft(!1),v())};(0,m.useLayoutEffect)(()=>{ma.current&&(ma.current.scrollTop=0)},[we,e.id]);let Ca=W?.register??(W===void 0||W.speakerId==="__venue_scene__"?"narration":W.player||r0(W.text)==="speech"?"speech":"narration"),Er=W===void 0?void 0:W.player?b:C[W.speakerId],Lt=e.participants.filter(E=>e.activeIds.includes(E.characterId)),Un=e.status==="closed"&&Lt.length===0?e.participants:Lt,so=Un.find(E=>E.characterId===W?.speakerId),$i=E=>K0(t[E]),co=Un.slice(0,4),La=Un.filter(E=>!co.some(ue=>ue.characterId===E.characterId)),ns=co.findIndex(E=>E.characterId===so?.characterId)>=2?"left":"right",Cr=(0,r.jsxs)("p",{className:`${i}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${i}-chat-spinner ${i}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${i}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${i}-chat`,"data-open":$?"true":"false","data-ended":x?"true":"false","data-opening-error":e.status==="opening"&&u?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${i}-visually-hidden`,children:`Here now: ${Lt.length?Lt.map(E=>`${E.name}${E.doing?` is ${E.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${i}-chat-scene`,"aria-hidden":"true",children:a?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${i}-chat-scene-backdrop`,src:a,alt:""}),(0,r.jsx)("span",{className:`${i}-chat-scrim`}),(0,r.jsx)("span",{className:`${i}-chat-vignette`})]}):(0,r.jsx)("span",{className:`${i}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,r.jsxs)("div",{className:`${i}-chat-head`,children:[(0,r.jsx)("span",{className:`${i}-room-place`,children:e.placeName}),(0,r.jsxs)("span",{ref:St,className:`${i}-chat-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-actions-trigger`,onClick:()=>oe(E=>!E),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":le,children:"\xB7\xB7\xB7"}),le?(0,r.jsxs)("span",{className:`${i}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{oe(!1),S()},disabled:c,children:"View Venue"}),O?(0,r.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{oe(!1),O()},disabled:c,children:["Enter ",P??"private space"]}):null,(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{oe(!1),H()},disabled:c,children:x?"Return to map":"End visit now"}),be||e.status==="closing"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{oe(!1),B()},children:"Leave with memory pending"}):null,yi&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{oe(!1),It()},disabled:c,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like."}):null,Me.length>0?(0,r.jsxs)("div",{className:`${i}-room-notices`,"aria-live":"polite",children:[(0,r.jsxs)("button",{type:"button",className:`${i}-room-notices-trigger`,onClick:()=>da(E=>!E),"aria-expanded":wi,"aria-label":`${Me.length} village ${Me.length===1?"notice":"notices"}`,children:["\u2726 ",Me.length]}),wi?(0,r.jsx)("div",{className:`${i}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:Me.map(E=>(0,r.jsxs)("div",{className:`${i}-room-star`,children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),E.kind==="memory"&&E.detail?(0,r.jsx)("button",{type:"button",className:`${i}-room-star-detail`,onClick:ue=>{ge.current=ue.currentTarget,ha(E)},"aria-label":`View memory: ${E.text}`,title:"View saved memory",children:E.text}):(0,r.jsx)("span",{children:E.text}),(0,r.jsx)("button",{type:"button",className:`${i}-room-star-dismiss`,onClick:()=>{Pt?.id===E.id&&ha(null),qa(E.id)},"aria-label":`Dismiss ${E.text}`,title:"Dismiss notice",children:"\xD7"})]},E.id))}):null]}):null,Pt?.detail?(0,r.jsx)("div",{className:`${i}-memory-backdrop`,onClick:E=>{E.currentTarget===E.target&&U()},children:(0,r.jsxs)("div",{className:`${i}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${i}-memory-dialog-title`,children:[(0,r.jsxs)("div",{className:`${i}-memory-dialog-head`,children:[(0,r.jsx)("h2",{id:`${i}-memory-dialog-title`,children:Pt.text}),(0,r.jsx)("button",{ref:Ge,type:"button",onClick:U,"aria-label":"Close memory",children:"\xD7"})]}),(0,r.jsx)("p",{children:Pt.detail})]})}):null,Lt.length>0?(0,r.jsx)("div",{className:`${i}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:Lt.map(E=>(0,r.jsx)("span",{className:`${i}-chat-activity`,children:`${E.name}: ${E.doing||"spending time here"}`},E.characterId))}):null,(0,r.jsxs)("div",{className:`${i}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${i}-chat-cast`,children:co.map((E,ue)=>{let F=k[E.characterId],zt=E.characterId===so?.characterId,Wt=W?.asides.find(fn=>fn.speakerId===E.characterId),Tt=zt?W?.expression??"neutral":Wt?.expression??"neutral",pn=zt?W?.gazeAt:Wt?.gazeAt??(E.characterId===W?.gazeAt?so?.characterId:void 0),At=co.findIndex(fn=>fn.characterId===pn),gn=g0(F?.images??[],Tt,p0(ue,At));return(0,r.jsxs)("div",{className:`${i}-chat-cast-person`,"data-active":E.characterId===so?.characterId?"true":"false","data-sprite":gn?"true":"false",children:[gn?(0,r.jsx)("img",{src:gn.image.url,alt:"","data-framing":F?.framing.mode??"full","data-facing":gn.mirrored?"left":"right"}):(0,r.jsx)(lo,{portrait:C[E.characterId],name:E.name,className:`${i}-avatar`}),(0,r.jsx)("span",{children:E.name})]},E.characterId)})}),La.length>0?(0,r.jsx)("div",{className:`${i}-chat-cast-rest`,children:La.map(E=>(0,r.jsxs)("span",{children:[(0,r.jsx)(lo,{portrait:C[E.characterId],name:E.name,className:`${i}-avatar`}),E.name]},E.characterId))}):null]}),(0,r.jsxs)("div",{className:`${i}-chat-vn`,children:[qe?(0,r.jsx)("div",{ref:qt,className:`${i}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:E=>{E.key==="Escape"&&(Ba(!1),window.requestAnimationFrame(()=>Ea.current?.focus()))},children:e.lines.map((E,ue)=>(0,r.jsxs)("p",{className:`${i}-chat-vn-text`,children:[(0,r.jsxs)("strong",{children:[E.role==="user"?f:E.kind==="narration"||E.speakerId==="__venue_scene__"?"Narration":E.name||"Resident",E.kind==="side"?" \xB7 aside":E.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,r.jsx)("span",{style:E.role==="assistant"&&E.kind!=="narration"?$i(E.speakerId):void 0,children:Tr(E.content,`history-${ue}-`)})]},E.id??ue))}):null,W&&W.asides.length>0?(0,r.jsx)("div",{className:`${i}-chat-vn-asides`,"data-side":ns,"aria-live":"polite",children:W.asides.map((E,ue)=>(0,r.jsxs)("div",{className:`${i}-chat-vn-aside`,"data-register":E.register,children:[(0,r.jsx)(lo,{portrait:E.speakerId?C[E.speakerId]:Er,name:E.name??W.name,glyph:W.player?"person":"initial",className:`${i}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${i}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${i}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${i}-chat-vn-aside-icon`,children:E.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${i}-chat-vn-aside-name`,children:E.name??W.name}),E.register==="whisper"&&E.target?(0,r.jsx)("span",{className:`${i}-chat-vn-aside-target`,children:`\u2192 ${E.target}`}):null]}),(0,r.jsx)("p",{className:`${i}-chat-vn-aside-text`,style:$i(E.speakerId??W.speakerId),children:Tr(E.text,`vn-aside-${ue}-`)})]})]},`${ue}-${E.register}`))}):null,(0,r.jsx)("div",{className:`${i}-chat-vn-card`,"data-register":Ca,children:(0,r.jsx)("div",{className:`${i}-chat-vn-row`,children:(0,r.jsxs)("div",{className:`${i}-chat-vn-column`,children:[Ca==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${i}-chat-vn-name`,children:W?.name??""}),(0,r.jsxs)("div",{ref:ma,className:`${i}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[W?Ca==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-beat`,"data-register":"narration",children:Tr(W.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,style:W.player?void 0:$i(W.speakerId),children:Tr(W.text,"vn-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:Lt.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!x&&c?Cr:null]})]})})}),(0,r.jsxs)("div",{className:`${i}-room-panel-tools`,children:[e.lines.length>0?(0,r.jsx)("button",{ref:Ea,type:"button",className:`${i}-chat-history-toggle`,"aria-label":"History","aria-expanded":qe,onClick:()=>Ba(E=>!E),children:qe?"Hide history":"History"}):null,(0,r.jsx)("span",{className:`${i}-chat-vn-counter`,children:`${we+1} / ${Math.max(1,se.length)}`}),(0,r.jsxs)("span",{className:`${i}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>ae(we-1),disabled:!pt,"aria-label":"Previous paragraph",children:["\u2039 ",(0,r.jsx)("span",{children:"Previous"})]}),Fe?(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>ae(we+1),"aria-label":"Next paragraph",children:[(0,r.jsx)("span",{children:"Next"})," \u203A"]}):x?(0,r.jsx)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:H,disabled:c,children:"Return to map"}):null]})]}),u&&e.status==="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:u}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:H,disabled:c,children:"Back to map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:X,disabled:c,children:"Retry opening"}),e.id?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:De,disabled:c,children:"Continue without opening"}):null]}):null,h?(0,r.jsx)("div",{className:`${i}-room-error`,role:"status",children:(0,r.jsx)("p",{children:h})}):null,g?(0,r.jsx)("p",{className:`${i}-empty`,children:g}):null,e.status==="closing"?(0,r.jsx)("p",{className:`${i}-hint`,children:"The visit is still being remembered. You can leave with memory pending if filing cannot finish."}):null,j&&o==="fulfill"&&Lt.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,j?(0,r.jsxs)("div",{className:`${i}-composer`,children:[o==="fulfill"&&Lt.length>0?(0,r.jsxs)("select",{value:l,onChange:E=>y(E.target.value),"aria-label":"Whose wish you fulfilled",disabled:c||x||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),Lt.map(E=>(0,r.jsx)("option",{value:E.characterId,children:E.name},E.characterId))]}):null,(0,r.jsx)("div",{className:`${i}-composer-row`,children:(0,r.jsxs)("span",{className:`${i}-chat-input`,children:[(0,r.jsxs)("span",{ref:mt,className:`${i}-room-mode-anchor`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-mode-toggle`,onClick:()=>Ft(E=>!E),"aria-label":`Mode: ${o==="chat"?"Chat":o==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":Z,title:o==="chat"?"Chat":o==="fulfill"?"Fulfill":"Conclude",children:o==="chat"?"\u{1F4AC}":o==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),Z?(0,r.jsx)("span",{className:`${i}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(E=>(0,r.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":o===E,disabled:c||E==="fulfill"&&Lt.length===0,onClick:()=>{w(E),Ft(!1)},children:E==="chat"?"Chat":E==="fulfill"?"Fulfill":"Conclude"},E))}):null]}),nt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:nt,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,(0,r.jsx)("textarea",{ref:re,className:`${i}-textarea`,rows:1,value:n,onChange:E=>R(E.target.value),onKeyDown:E=>{h0(E.key,E.shiftKey,E.nativeEvent.isComposing)&&(E.preventDefault(),Bt())},placeholder:o==="fulfill"?"What did you do for them?":o==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:c||x||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${i}-chat-send`,onClick:Bt,disabled:c||x||e.status!=="active"||o!=="conclude"&&n.trim().length===0||o==="fulfill"&&!l,"aria-label":c?"Sending":"Send",title:c?"Sending":"Send",children:c?"Sending\u2026":"Send"})]})})]}):null,u&&e.status!=="opening"?(0,r.jsx)("div",{className:`${i}-room-error`,role:"alert",children:(0,r.jsx)("p",{children:u})}):null]})]})}var G0="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function u2({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let s=()=>{let p=e.getBoundingClientRect();a(p.width<=704||p.width<=880&&p.height<=512)};s();let d=new ResizeObserver(s);return d.observe(e),()=>d.disconnect()},[e]);let[n,o]=(0,m.useState)(null),[l,c]=(0,m.useState)(null),[u,h]=(0,m.useState)(null),[g,$]=(0,m.useState)(0),[x,f]=(0,m.useState)("residents"),[b,C]=(0,m.useState)(null),[k,R]=(0,m.useState)(null),[w,y]=(0,m.useState)(0),[v,S]=(0,m.useState)(0),[O,P]=(0,m.useState)(0),[H,B]=(0,m.useState)(null),[be,X]=(0,m.useState)(!1),[De,Me]=(0,m.useState)(""),[qa,yi]=(0,m.useState)(""),[It,nt]=(0,m.useState)(""),[q,ae]=(0,m.useState)(null),[qe,Ba]=(0,m.useState)(!1),[le,oe]=(0,m.useState)("home"),[wi,da]=(0,m.useState)(null),[Z,Ft]=(0,m.useState)("view"),[Pt,ha]=(0,m.useState)(!1),[ge,Ge]=(0,m.useState)(null),[re,mt]=(0,m.useState)(null),[Ea,qt]=(0,m.useState)(!1),[ma,St]=(0,m.useState)(""),[mn,z]=(0,m.useState)(""),[U,se]=(0,m.useState)(""),[we,W]=(0,m.useState)(null),[pt,Fe]=(0,m.useState)(!1),[j,Xe]=(0,m.useState)("village"),[Bt,Ca]=(0,m.useState)("index"),[Er,Lt]=(0,m.useState)({}),[Un,so]=(0,m.useState)(null),[$i,co]=(0,m.useState)({}),[La,ns]=(0,m.useState)({}),[Cr,E]=(0,m.useState)(""),[ue,F]=(0,m.useState)(null),[zt,Wt]=(0,m.useState)(""),[Tt,pn]=(0,m.useState)(""),[At,gn]=(0,m.useState)(""),[fn,Dp]=(0,m.useState)(null),[is,_p]=(0,m.useState)(""),[os,Hp]=(0,m.useState)([]),[Ou,Up]=(0,m.useState)(1600),[za,Ip]=(0,m.useState)([]),[uo,qp]=(0,m.useState)(1600),[Vu,n1]=(0,m.useState)(null),[Bp,Lp]=(0,m.useState)(""),[rs,ho]=(0,m.useState)([]),[jp,i1]=(0,m.useState)(""),[pa,ls]=(0,m.useState)([]),[xi,jt]=(0,m.useState)(!1),[ss,Ni]=(0,m.useState)(!1),[o1,Du]=(0,m.useState)(null),[r1,_u]=(0,m.useState)(null),[cs,Hu]=(0,m.useState)(null),[us,Gp]=(0,m.useState)(""),[Ee,ds]=(0,m.useState)(0),[ja,Yp]=(0,m.useState)(""),[gt,Xp]=(0,m.useState)(""),[bn,Qp]=(0,m.useState)("rebuild"),[ga,Uu]=(0,m.useState)(ro("rebuild").premise),[zr,Zp]=(0,m.useState)(""),[l1,s1]=(0,m.useState)(yp),[vn,Kp]=(0,m.useState)([]),[c1,hs]=(0,m.useState)([]),[Be,Si]=(0,m.useState)([]),[Ar,Aa]=(0,m.useState)(null),[u1,Jp]=(0,m.useState)(0),[Fp,Iu]=(0,m.useState)(!1),[qu,Ti]=(0,m.useState)(null),[Mr,In]=(0,m.useState)(null),[Ga,ms]=(0,m.useState)(!1),[Pp,Bu]=(0,m.useState)(""),[ps,Wp]=(0,m.useState)(T0),[Ce,ki]=(0,m.useState)("generate"),[d1,Lu]=(0,m.useState)(""),[gs,ju]=(0,m.useState)(null),[h1,eg]=(0,m.useState)(""),[Rr,Gu]=(0,m.useState)(null),[mo,Yu]=(0,m.useState)(""),[po,Xu]=(0,m.useState)(""),Or=JSON.stringify({scenario:bn,premise:ga.trim(),direction:zr.trim(),setting:gt.trim(),lorebooks:za,loreBudget:uo}),Qu=(0,m.useRef)(Or);(0,m.useEffect)(()=>{Qu.current!==Or&&!n?.isFounded&&In(null),Qu.current=Or},[Or,n?.isFounded]);let Zu=JSON.stringify({setting:gt.trim(),worldFacts:n?.isFounded?vn:null,lorebooks:za,structure:mo,negative:po,options:ps}),[Mt,Vr]=(0,m.useState)(!1),[tg,fs]=(0,m.useState)(""),[Ku,m1]=(0,m.useState)("Connections are still loading."),[ag,ng]=(0,m.useState)(!1),[p1,Dr]=(0,m.useState)(!1),[ig,pe]=(0,m.useState)(""),[g1,bs]=(0,m.useState)(!1),[vs,ys]=(0,m.useState)(""),[Ma,Ju]=(0,m.useState)(null),[Fu,_r]=(0,m.useState)(null),[f1,Pu]=(0,m.useState)(!1),[Ya,go]=(0,m.useState)(""),[og,qn]=(0,m.useState)(null),fo=n?.settings.townMapView??zu("cover"),rg=n?Ma?.size??{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:null,lg=n?Ce==="existing"?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:Rr&&gs===Ce?Rr:{width:n.settings.townMapGenerationWidth,height:n.settings.townMapGenerationHeight}:null,b1=n?{min:n.settings.townMapZoomMin,max:n.settings.townMapZoomMax,step:n.settings.townMapZoomStep}:{min:1,max:1,step:.1},ws=Ma?Ma.image:vs||null,Ei=Ce==="none"?null:Ce==="existing"?vs||null:gs===Ce&&(Ce!=="generate"||h1===Zu)&&d1||null,$s=Ma!==null||f1,Hr=$s?Fu??fo:fo,Wu=Ma?Sp(Ma.size):null,[Ur,Re]=(0,m.useState)(""),[Rt,K]=(0,m.useState)(""),[_,G]=(0,m.useState)(!1),[L,Qe]=(0,m.useState)(null),[v1,Ir]=(0,m.useState)(!1),[y1,Xa]=(0,m.useState)(!1),[qr,Ci]=(0,m.useState)(""),[Br,xs]=(0,m.useState)("chat"),[Lr,ed]=(0,m.useState)(""),[w1,sg]=(0,m.useState)(""),[$1,Qa]=(0,m.useState)([]),Za=(0,m.useRef)(new Set),[td,x1]=(0,m.useState)(!1),cg=(0,m.useRef)(0),bo=(0,m.useRef)(0),ug=(0,m.useRef)(""),[ad,jr]=(0,m.useState)(""),[fa,Pe]=(0,m.useState)(!1),vo=(0,m.useRef)(!1),yo=(0,m.useRef)(null),Ns=(0,m.useRef)(null),wo=(0,m.useCallback)(s=>{let d=[];for(let p of s)Za.current.has(p.id)||(Za.current.add(p.id),d.push(p));d.length>0&&Qa(p=>[...p,...d])},[]),Gr=(0,m.useRef)(!1),[N1,ft]=(0,m.useState)(""),[S1,$o]=(0,m.useState)(""),[Yr,Ss]=(0,m.useState)(!1),[Ts,nd]=(0,m.useState)(""),dg=(0,m.useRef)(""),ks=(0,m.useRef)(!1),[Es,hg]=(0,m.useState)(!1),id=(0,m.useRef)(null),od=(0,m.useRef)(null);(0,m.useEffect)(()=>{let s=od.current,d=id.current;s===null||!d||(od.current=null,d.focus(),d.setSelectionRange(s,s))},[Tt]);let Cs=(0,m.useCallback)(async(s=!1)=>{if(ks.current)return null;ks.current=!0;let d=setTimeout(()=>hg(!0),IS);try{let p=await D("/reconcile",{method:"POST",body:s?JSON.stringify({forceStory:!0}):void 0});return o(p),p}catch{return null}finally{clearTimeout(d),hg(!1),ks.current=!1}},[]),mg=(0,m.useCallback)(async()=>{let s=n?.happenings[0]?.id??"";nd("Writing...");let d=await Cs(!0);if(!d){nd("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}nd((d.happenings[0]?.id??"")===s?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[n,Cs]),ze=(0,m.useCallback)(async(s={})=>{try{let d=await D("",{signal:s.signal});o(d),Re("")}catch(d){if(s.signal?.aborted||s.quiet)return;o(null),Re(I(d,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let s=n?.village.nextTransitionAt??"";s.length===0||s===dg.current||(dg.current=s,n?.isFounded&&Cs())},[n,Cs]);let Ka=(0,m.useCallback)(async s=>{try{let d=await D("/catalog",{signal:s});c(d.characters),Re("")}catch(d){if(s?.aborted)return;Re(I(d,"Could not read your character library."))}},[]),xo=(0,m.useCallback)(async s=>{try{let d=await D("/personas",{signal:s});Dp(d.personas)}catch(d){if(s?.aborted)return;Dp([]),Re(I(d,"Could not read your Personas."))}},[]),No=(0,m.useCallback)(async s=>{try{let d=await D("/lorebooks",{signal:s});n1(d.books),Lp("")}catch(d){if(s?.aborted)return;Lp(I(d,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),pg=(0,m.useCallback)(async s=>{try{let d=await D("/story?offset=0&limit=50",{signal:s});h(d.entries),$(d.total)}catch(d){if(s?.aborted)return;h(null),Re(I(d,"Could not read the village story."))}},[]),zs=(0,m.useCallback)(async s=>{try{let d=await D("/memories",{signal:s});C(d),Re("")}catch(d){if(s?.aborted)return;C(null),Re(I(d,"Could not read villager memories."))}},[]),T1=(0,m.useCallback)(async(s,d)=>{let p=s==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(p)){G(!0);try{await D(`/memories/${s}/${encodeURIComponent(d)}`,{method:"DELETE"}),await zs()}catch(N){Re(I(N,"That memory could not be removed."))}finally{G(!1)}}},[zs]),k1=(0,m.useCallback)(async s=>{G(!0);try{let d=await D(`/story/${encodeURIComponent(s)}`,{method:"DELETE"});h(d.entries),$(d.total),Re("")}catch(d){Re(I(d,"That memory could not be removed."))}finally{G(!1)}},[]),E1=(0,m.useCallback)(async()=>{let s=u?.length??0;try{let d=await D(`/story?offset=${s}&limit=50`);h(p=>[...p??[],...d.entries]),$(d.total)}catch(d){Re(I(d,"Could not read more memories."))}},[u]),As=(0,m.useCallback)(async s=>{try{let d=await D("/agendas",{signal:s});ae(d.villagers)}catch(d){if(s?.aborted)return;ae(null),Re(I(d,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(le!=="menu"||j!=="agendas"&&j!=="schedules"||!q?.some(d=>d.agenda?.personalizationPending&&!d.agenda.personalizationFailure))return;let s=window.setInterval(()=>{As()},5e3);return()=>window.clearInterval(s)},[q,As,j,le]);let C1=(0,m.useCallback)(async s=>{G(!0);try{let d=await D(`/agendas/${encodeURIComponent(s)}/regenerate`,{method:"POST"});ae(d.villagers),Re("")}catch(d){Re(I(d,"That villager could not be asked again."))}finally{G(!1)}},[]),z1=(0,m.useCallback)(async(s,d)=>{G(!0);try{let p=await D(`/agendas/${encodeURIComponent(s)}/completed/${encodeURIComponent(d)}/correct`,{method:"POST"});ae(p.villagers),Re("")}catch(p){Re(I(p,"That wish completion could not be corrected."))}finally{G(!1)}},[]),A1=(0,m.useCallback)(async(s,d)=>{G(!0);try{let p=await D(`/agendas/${encodeURIComponent(s)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:d})});ae(p.villagers),Re("")}catch(p){Re(I(p,"Schedule use could not be changed."))}finally{G(!1)}},[]);(0,m.useEffect)(()=>{let s=new AbortController;return ze({signal:s.signal}),()=>s.abort()},[ze]),(0,m.useEffect)(()=>{let s=()=>{document.hidden||ze({quiet:!0})},d=setInterval(()=>{document.hidden||ks.current||ze({quiet:!0})},US);return document.addEventListener("visibilitychange",s),()=>{clearInterval(d),document.removeEventListener("visibilitychange",s)}},[ze]),(0,m.useEffect)(()=>{if(!L?.id||L.status==="closed"||le!=="room")return;ug.current!==L.id?(ug.current=L.id,bo.current=Date.parse(L.lastActivityAt||L.startedAt)||Date.now()):bo.current=Math.max(bo.current,Date.parse(L.lastActivityAt||L.startedAt)||0);let s=!1,d=V=>{s||(Qe(null),Xa(!1),Qa([]),Za.current.clear(),jr(V==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),oe("home"),ze())},p=(V=!1)=>{D("/rooms/active").then(async({session:Y})=>{if(Y?.id===L.id){V&&(await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})}),bo.current=Date.now());return}let fe=await D(`/rooms/archive/${encodeURIComponent(L.id)}`).catch(()=>null);d(fe?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(Y=>{let fe=Wl(Y);fe&&d(fe)})},N=V=>{if(Date.now()-bo.current>=30*6e4){V.cancelable&&V.preventDefault(),V.stopImmediatePropagation(),p(!0);return}bo.current=Date.now(),!(Date.now()-cg.current<15e3)&&(cg.current=Date.now(),D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})}).catch(Y=>{let fe=Wl(Y);fe?d(fe):p()}))},A=()=>p();window.addEventListener("focus",A),document.addEventListener("visibilitychange",A);for(let V of["pointerdown","keydown","input","scroll"])window.addEventListener(V,N,!0);return()=>{s=!0,window.removeEventListener("focus",A),document.removeEventListener("visibilitychange",A);for(let V of["pointerdown","keydown","input","scroll"])window.removeEventListener(V,N,!0)}},[L?.id,L?.status,L?.lastActivityAt,L?.startedAt,le,ze]),(0,m.useEffect)(()=>{let s=new AbortController;return D("/rooms/active",{signal:s.signal}).then(({session:d,debugDiscardEnabled:p})=>{x1(p),!(s.signal.aborted||!d)&&(Qe(d),xs("chat"),Xa(!0),oe("room"),d.status==="opening"&&(Pe(!0),D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:d.id}),signal:AbortSignal.timeout(3e4)}).then(({session:N})=>{s.signal.aborted||Qe(N)}).catch(async N=>{if(s.signal.aborted)return;let A=await A0(d.id);s.signal.aborted||(A?Qe(A):ft(M0(N)))}).finally(()=>{s.signal.aborted||Pe(!1)})))}).catch(()=>{}),()=>s.abort()},[]),(0,m.useEffect)(()=>{if(j!=="chatlogs"||!n?.isFounded)return;let s=new AbortController,d=new URLSearchParams;return De&&d.set("venueId",De),qa&&d.set("characterId",qa),d.set("offset",String(v)),d.set("limit","20"),R(null),D(`/rooms/archive?${d.toString()}`,{signal:s.signal}).then(({visits:p,total:N})=>{s.signal.aborted||(R(p),y(N),nt(""))}).catch(p=>{s.signal.aborted||nt(I(p,"Venue visits could not be read."))}),()=>s.abort()},[De,qa,v,O,j,n?.isFounded]);let rd=(0,m.useCallback)(async s=>{try{let d=await D(`/rooms/archive/${encodeURIComponent(s)}`);B(d.visit),nt("")}catch(d){nt(I(d,"That visit could not be read."))}},[]),M1=(0,m.useCallback)(async s=>{G(!0);try{await D(`/rooms/archive/${encodeURIComponent(s)}/retry-memory`,{method:"POST"}),await rd(s),P(d=>d+1),nt("")}catch(d){nt(I(d,"Memory filing is still pending."))}finally{G(!1)}},[rd]),gg=(0,m.useCallback)(async s=>{if(window.confirm(s?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){G(!0);try{await D(s?`/rooms/archive/${encodeURIComponent(s)}`:"/rooms/archive",{method:"DELETE"}),B(null),S(0),P(d=>d+1),nt("")}catch(d){nt(I(d,"Visit transcripts could not be deleted."))}finally{G(!1)}}},[]);(0,m.useEffect)(()=>{if(!qe)return;let s=new AbortController;return Ka(s.signal),()=>s.abort()},[qe,Ka]);let fg=n?n.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(fg===null)return;let s=new AbortController;return(async()=>{try{let d=await D("/town-map",{signal:s.signal});ys(d.image)}catch{s.signal.aborted||ys("")}})(),()=>s.abort()},[fg]);let R1=(0,m.useCallback)(async s=>{G(!0);try{o(await D("/villagers",{method:"POST",body:JSON.stringify({characterId:s})})),Re(""),await Ka()}catch(d){Re(I(d,"That character could not move in."))}finally{G(!1)}},[Ka]),O1=(0,m.useCallback)(async s=>{G(!0);try{o(await D(`/villagers/${encodeURIComponent(s)}`,{method:"DELETE"})),Re(""),l&&await Ka()}catch(d){Re(I(d,"That villager could not leave."))}finally{G(!1)}},[l,Ka]),V1=(0,m.useCallback)(async s=>{E(s);try{let d=await D(`/villagers/${encodeURIComponent(s)}/refresh`);ns(p=>({...p,[s]:d})),Re("")}catch(d){Re(I(d,"That villager's card could not be compared."))}finally{E("")}},[]),D1=(0,m.useCallback)(async s=>{E(s);try{o(await D(`/villagers/${encodeURIComponent(s)}/refresh`,{method:"POST"})),ns(d=>{let p={...d};return delete p[s],p}),Re("")}catch(d){Re(I(d,"That villager's card could not be refreshed."))}finally{E("")}},[]),it=(0,m.useCallback)(s=>{Ca(s==="noticeboard"?"noticeboard":s==="general"?"general":s==="replyGuidance"||s==="story"||s==="chatlogs"||s==="agendas"||s==="schedules"?"debug":"village"),K(""),Fe(!1),s==="villagers"&&Ka(),s==="villagers"&&(le!=="menu"||j!=="villagers")&&f("residents"),s==="village"&&xo(),s==="village"&&No(),s==="story"&&pg(),(s==="agendas"||s==="schedules")&&As(),s==="village"&&(le!=="menu"||j!=="village")&&n&&(pn(n.settings.promptKnowledge),gn(n.settings.playerPersonaId),_p(n.settings.setting),Hp(n.settings.selectedLorebookIds),Up(n.settings.loreTokenBudget),ho(_n(n.settings.venues).map(p=>({...p})))),Xe(s),oe("menu")},[As,Ka,No,xo,pg,j,le,n]),ld=(0,m.useCallback)(()=>{Ba(!1),K(""),W(null),Fe(!1),oe("home")},[]),_1=(0,m.useCallback)(async()=>{if(!(!L||fa)){if(!L.id||L.status==="closed"||Yr){Xa(!1),Qe(null),Qa([]),Za.current.clear(),Ci(""),$o(""),oe("home"),ze();return}Pe(!0),ft(""),X(!1),Qe({...L,status:"closing"});try{let s=await D("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:L.id})});if(vo.current)return;Qe(s.session),Ss(!0),wo(s.recordEvents??[]),Ci(""),$o(""),ze()}catch(s){if(vo.current)return;let d=Wl(s);if(d){Qe(null),Xa(!1),Qa([]),Za.current.clear(),jr(d==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),oe("home"),ze();return}ft(I(s,"You could not leave the venue.")),X(!0)}finally{Pe(!1)}}},[ze,wo,L,fa,Yr]),H1=(0,m.useCallback)(async()=>{if(!L?.id||L.status!=="active"||fa||Gr.current)return;let s=Ns.current??Su();Ns.current=s,Pe(!0),ft(""),X(!1);try{let d=await D("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:L.id,submissionId:s,message:qr}),signal:AbortSignal.timeout(3e5)});Qe(d.session),ze(),Ss(!0),wo(d.recordEvents??[]),Ns.current=null,ze()}catch(d){ft(I(d,"The scene could not end yet.")),X(!0)}finally{Pe(!1)}},[ze,wo,L,fa,qr]),U1=(0,m.useCallback)(async()=>{if(!(!L?.id||vo.current)){vo.current=!0,Pe(!0);try{await D("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:L.id})}),Xa(!1),Qe(null),Qa([]),Za.current.clear(),oe("home"),X(!1),ze()}catch(s){ft(I(s,"The visit could not be left yet.")),vo.current=!1}finally{Pe(!1)}}},[ze,L]),I1=(0,m.useCallback)(async()=>{if(!(!L?.id||!td||fa)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){Pe(!0);try{await D("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:L.id})}),Qe(null),Xa(!1),Qa([]),Za.current.clear(),Ci(""),oe("home"),ze()}catch(s){ft(I(s,"The debug discard failed."))}finally{Pe(!1)}}},[L,td,fa,ze]),q1=(0,m.useCallback)(async()=>{let s=qr.trim();if(L===null||!L.id||Yr||fa||Gr.current||s.length===0)return;Gr.current=!0;let d=yo.current??Su();yo.current=d;let p=L;try{await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})})}catch(A){Gr.current=!1;let V=Wl(A);V?(Qe(null),Xa(!1),Qa([]),Za.current.clear(),jr(V==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),oe("home"),ze()):ft(I(A,"The visit could not be checked."));return}let N={speakerId:"",name:"",role:"user",content:s,at:new Date().toISOString()};Pe(!0),ft(""),Ci(""),Qe({...L,lines:[...L.lines,N]});try{let A=await D("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:L.id,message:s,mode:Br,targetId:Br==="fulfill"?Lr:"",submissionId:d}),signal:AbortSignal.timeout(3e5)});Qe(A.session),Ss(A.session.status==="closed"),wo(A.recordEvents??[]),Lr&&!A.session.activeIds.includes(Lr)&&ed(""),sg(A.verdict?.reason??""),xs("chat"),yo.current=null,$o(""),ze()}catch(A){let V=Wl(A);if(V){Qe(null),Xa(!1),Qa([]),Za.current.clear(),jr(V==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),oe("home"),ze();return}Qe(p),Ci(s),ft(I(A,"That line could not be sent."))}finally{Gr.current=!1,Pe(!1)}},[ze,wo,L,fa,qr,Yr,Br,Lr]),B1=(0,m.useCallback)(s=>(n?.villagers??[]).filter(d=>d.place?.id===s),[n]),Ms=(0,m.useCallback)(s=>{W(null),Fe(!1),da(s.id),Ft("view"),ha(!1),Ge(null),mt(null),oe("venue")},[]),sd=(0,m.useCallback)(async s=>{Pe(!0),ft(""),$o("");try{let d=await D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:s}),signal:AbortSignal.timeout(3e4)});Qe(d.session),ze()}catch(d){let p=await A0(s);p?Qe(p):ft(M0(d))}finally{Pe(!1)}},[ze]),L1=(0,m.useCallback)(async s=>{Pe(!0);try{let{session:d}=await D("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:s}),signal:AbortSignal.timeout(1e4)});Qe(d),$o(d.lines.length===0?"The opening failed. You can start the conversation now.":""),ft("")}catch(d){ft(I(d,"The visit could not continue. Retry or leave the venue."))}finally{Pe(!1)}},[]),Xr=(0,m.useCallback)(async(s,d,p="")=>{vo.current=!1,W(null),Fe(!1),qn(null),Ci(""),Ss(!1),ft(""),$o(""),Qa([]),Za.current.clear(),Pe(!0),Qe({version:1,id:"",placeId:s.id,placeName:s.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Xa(!0),oe("room");try{let{session:N}=await D("/rooms",{method:"POST",body:JSON.stringify({venueId:s.id,spaceClass:d,privateOwnerId:p}),signal:AbortSignal.timeout(2e4)});Qe(N),xs("chat"),ed(""),sg(""),jr(""),Xa(!0),ze(),N.status==="opening"&&await sd(N.id)}catch(N){ft(I(N,"That room could not be opened. Retry or leave the venue."))}finally{Pe(!1)}},[sd,ze]),bg=(0,m.useCallback)(s=>{Fe(!1),W(s.id),oe("home")},[]),vg=(0,m.useCallback)(()=>{da(null),Ft("view"),ha(!1),Ge(null),mt(null),W(null),oe("home")},[]),j1=(0,m.useCallback)(async()=>{G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:Tt,playerPersonaId:At,setting:is,selectedLorebookIds:os,loreTokenBudget:Ou})}))}catch(s){K(I(s,"Those settings could not be saved."))}finally{G(!1)}},[Tt,os,Ou,At,is]),G1=(0,m.useCallback)(async s=>{G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({storyPace:s})}))}catch(d){K(I(d,"That could not be saved."))}finally{G(!1)}},[]),Y1=(0,m.useCallback)(async s=>{let d=n?.settings.characterSpeechColors??!0;o(p=>p&&{...p,settings:{...p.settings,characterSpeechColors:s}}),G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:s})}))}catch(p){o(N=>N&&{...N,settings:{...N.settings,characterSpeechColors:d}}),K(I(p,"Character speech colors could not be saved."))}finally{G(!1)}},[n?.settings.characterSpeechColors]),yg=(0,m.useCallback)(async s=>{G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:s})})),P(d=>d+1)}catch(d){K(I(d,"Visit retention could not be saved."))}finally{G(!1)}},[]),X1=(0,m.useCallback)(async()=>{if(!(n&&_n(n.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){G(!0),K("");try{let s=await D("/bootstrap",{method:"POST"});ho(s.places.map(d=>({id:es(),name:d.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(s){K(I(s,"The village did not suggest any places."))}finally{G(!1)}}},[n]),Q1=(0,m.useCallback)(async()=>{if(gt.trim().length===0){pe("Describe what the village is like before generating its map.");return}Vr(!0),pe("");try{let s=await D("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:mo===n?.settings.townMapLayoutPrompt?void 0:mo,negative:po===n?.settings.townMapNegativePrompt?void 0:po,setting:gt,options:ps,selectedLorebookIds:za,scenarioImprint:n?.isFounded?{origin:"",worldFacts:vn,openingConditions:[],visualCues:[]}:null})}),d=await Np(s.image);if(d.width!==s.width||d.height!==s.height)throw new Error("The generated map's reported dimensions do not match the image.");Lu(s.image),ju("generate"),eg(Zu),Gu(d),ki("generate")}catch(s){pe(I(s,"The village map could not be generated."))}finally{Vr(!1)}},[za,po,mo,gt,ps,Zu,vn,n?.isFounded,n?.settings.townMapLayoutPrompt,n?.settings.townMapNegativePrompt]),Z1=(0,m.useCallback)(async()=>{pe(""),G(!0);try{let s=await D("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:gt,selectedLorebookIds:za,loreTokenBudget:uo})});hs(s.names)}catch(s){pe(I(s,"The village could not suggest names for the public venue."))}finally{G(!1)}},[za,uo,gt]),K1=(0,m.useCallback)(async s=>{if(!s||!n)return;pe("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(s.size>d){let p=N=>Math.round(N/1e5)/10;pe(`That picture is ${p(s.size)} MB and a village map holds ${p(d)} MB. Choose a smaller copy.`);return}Vr(!0);try{let p=await as(s),N=await Np(p);Lu(p),ju("upload"),Gu(N),ki("upload")}catch(p){pe(I(p,"That picture could not be used as the village map."))}finally{Vr(!1)}},[n]),wg=(0,m.useCallback)(async s=>{if(!s||!n)return;K("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(s.size>d){let p=N=>Math.round(N/1e5)/10;K(`That picture is ${p(s.size)} MB and the village map holds ${p(d)} MB. Try a smaller copy.`);return}G(!0);try{let p=await as(s),N=await Np(p);Ju({image:p,size:N}),_r(zu("cover"))}catch(p){K(I(p,"That picture could not be used as the town map."))}finally{G(!1)}},[n]),$g=(0,m.useCallback)(async()=>{if(!n)return;let s=Ma?Ma.image:vs;G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:s,townMapView:Fu??n.settings.townMapView})})),ys(s),Ju(null),_r(null),Pu(!1)}catch(d){K(I(d,"The town map could not be saved."))}finally{G(!1)}},[n,Fu,vs,Ma]),Rs=(0,m.useCallback)(()=>{Ju(null),_r(null),Pu(!1),K("")},[]),xg=(0,m.useCallback)(async()=>{G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),ys(""),Rs()}catch(s){K(I(s,"The town map could not be taken down."))}finally{G(!1)}},[Rs]),J1=(0,m.useCallback)(async(s,d,p="")=>{if(!Ya){go(s),qn(null),K("");try{o(await D("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:s,spaceClass:d,privateOwnerId:p})}))}catch(N){qn({id:s,text:I(N,"That place could not be drawn.")})}finally{go("")}}},[Ya]),F1=(0,m.useCallback)(async(s,d,p,N="")=>{if(!(!d||!n||Ya)){go(s),qn(null),K("");try{let A=Y=>Math.round(Y/1e5)/10;if(d.size>n.settings.maxVenueImageBytes){qn({id:s,text:`That picture is ${A(d.size)} MB and a place holds ${A(n.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let V=await as(d);o(await D("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:s,image:V,spaceClass:p,privateOwnerId:N})}))}catch(A){qn({id:s,text:I(A,"That picture could not be kept.")})}finally{go("")}}},[Ya,n]),P1=(0,m.useCallback)(async(s,d,p="")=>{if(!Ya){go(s),qn(null),K("");try{o(await D("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:s,spaceClass:d,privateOwnerId:p})}))}catch(N){qn({id:s,text:I(N,"That picture could not be taken away.")})}finally{go("")}}},[Ya]),W1=n?.settings.maxPlaces??48,So=n?.settings.setupMaxVillagerCount??wp,Ng=(n?.settings.homeBuildings??[]).map(s=>({...s,name:n?.settings.homeBuildingNames?.[s.kind]??s.name})),e$=n&&!n.isFounded?1+So:W1,Os=Math.max(0,e$-_n(n?.settings.venues??[]).length),t$=(n?.settings.venues.length??0)+rs.filter(s=>!n?.settings.venues.some(d=>d.id===s.id)).length,Qr=(0,m.useCallback)(s=>{let d=Mp(s);ls(d.map(p=>({id:p.id,name:p.name,form:p.form??"Home",description:p.description,x:p.presentation.x,y:p.presentation.y,building:p.occupancy.homeKind,isPlayerHome:p.occupancy.playerHome,characterId:p.occupancy.residentCharacterId}))),Du(d[0]?.id??null),jt(!1)},[]),Sg=(0,m.useCallback)(()=>{K(""),n&&Qr(n.settings.venues),Ca("village"),Xe("homes"),oe("menu")},[Qr,n]),Tg=(0,m.useCallback)((s,d)=>{if(K(""),pa.length>=Os||pa.length>=1+So)return;let p=es(),N=pa.length===0;ls(A=>[...A,{id:p,name:N?"Your residence":`Residence ${A.length+1}`,form:"Home",description:"",x:s,y:d,building:null,isPlayerHome:N,characterId:null}]),Du(p)},[pa.length,Os,So]),a$=(0,m.useCallback)((s,d,p)=>{let N=Be.find(V=>V.category==="public-center"),A=qu??(ss?N?.id:void 0);if(f0({x:s,y:d},Be.filter(V=>V.id!==A).map(V=>V.presentation),p??{width:1e3,height:700,photoWidth:58,photoHeight:58})){Bu("That photograph would cover another venue. Place it a little to the side.");return}if(Bu(""),A)Si(V=>V.map(Y=>Y.id===A?{...Y,presentation:{...Y.presentation,x:s,y:d}}:Y)),Aa(A);else if(ss){let V=E0(es(),"gathering",s,d);Si(Y=>[...Y,V]),Aa(V.id)}else if(xi){let V=Be.filter(fe=>fe.classes?.includes("residence"));if(V.length>=1+So)return;let Y=E0(es(),"residence",s,d,V.length===0,V.length+1);Si(fe=>[...fe,Y]),Aa(Y.id)}Ti(null),jt(!1),Ni(!1)},[qu,xi,ss,So,Be]),zi=(0,m.useCallback)((s,d)=>{Si(p=>p.map(N=>N.id===s?d(N):N))},[]),n$=(0,m.useCallback)(s=>{Si(d=>{let p=d.filter(N=>N.id!==s);if(!p.some(N=>N.occupancy.playerHome)){let N=p.findIndex(A=>A.classes?.includes("residence"));N>=0&&(p[N]={...p[N],occupancy:{...p[N].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return p}),Aa(d=>d===s?null:d)},[]),i$=(0,m.useCallback)((s,d)=>{Tg(s,d),jt(!1),oe("menu")},[Tg]),kg=(0,m.useCallback)((s,d)=>{n?.settings.venues.some(p=>p.id===s&&p.occupancy.residentCharacterId)||ls(p=>p.map(N=>N.id===s?{...N,...d}:N))},[n]),o$=(0,m.useCallback)(s=>{if(n?.settings.venues.some(d=>d.id===s&&d.occupancy.residentCharacterId)){K("Move the resident to another venue before removing this home.");return}ls(d=>{let p=d.filter(N=>N.id!==s);return p.length>0&&!p.some(N=>N.isPlayerHome)&&(p[0]={...p[0],isPlayerHome:!0,characterId:null}),p})},[n]),r$=(0,m.useCallback)(async()=>{if(n){if(pa.some(s=>!s.description.trim())){K("Review a description for every home before saving.");return}G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({venues:_S(n.settings.venues,pa),venueScope:"homes"})})),jt(!1)}catch(s){K(I(s,"Those homes could not be saved."))}finally{G(!1)}}},[pa,n]),l$=async s=>{if(!n)return;let d=n.villagers.find(N=>N.characterId===s.characterId)?.name,p=s.isPlayerHome?`${oo(n)}'s home`:d?`${d}'s home`:_0(Ng,s.building).name;G(!0),K("");try{let N=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:s.id,name:p,homeKind:s.building}]})});kg(s.id,{description:N.descriptions[s.id]??""})}catch(N){K(I(N,"The home description could not be generated. You can write it by hand."))}finally{G(!1)}},s$=s=>{if(n?.isFounded||s===bn)return;let d=ro(bn).premise,p=!!ga.trim()&&ga!==d;Qp(s),p||Uu(ro(s).premise),Zp(""),pe("")},Zr=(0,m.useCallback)((s,d)=>{K(""),pe(""),ng(!1),Dr(!1),bs(!1),Ba(!1),Wt(""),ds(0),Yp(s?"":d?.village.name??""),Xp(s?"":d?.village.setting??"");let p=s?"":d?.settings.foundingReason??"",N=Cp.some(Oa=>Oa.value===p),A=N?p:p?"custom":"rebuild",V=fS[p]??p,Y=d?.settings.foundingDetails??"",fe=[V,Y].filter(Boolean).join(" "),Ra=fe.length>(d?.settings.foundingDetailsMaxLength??500),To=d?.isFounded?Y:p&&!N?Ra?Y:fe:s||!p?ro(A).premise:Y,Ai=s?"":d?.isFounded?d.settings.foundingGuidance??"":[Ra?V:"",d?.settings.foundingGuidance??""].filter(Boolean).join(" ");Qp(A),Uu(To),Zp(A==="none"?"":Ai),s1(s?yp():d?.settings.scenarioImprint??yp()),Kp(s?[]:d?.settings.worldFacts??[]),hs([]);let ko=s||!d?[]:d.settings.venues.filter(Oa=>Oa.classes?.includes("residence")||Oa.category==="public-center");Si(ko),Aa(ko[0]?.id??null),Ti(null),In(null),Bu(""),Ip(s?[]:d?.settings.selectedLorebookIds??[]),qp(s?1600:d?.settings.loreTokenBudget??1600),Wp({...T0}),ki(s?"generate":d?.settings.townMapImageSetAt?"existing":"none"),Lu(""),ju(null),eg(""),Gu(null),Yu(d?.settings.townMapLayoutPrompt??""),Xu(d?.settings.townMapNegativePrompt??""),Vr(!1),gn(s?"":d?.settings.playerPersonaId??""),xo(),No(),Qr(s||!d?[]:d.settings.venues),oe("setup")},[No,xo,Qr]),Eg=(0,m.useCallback)(s=>{if(Ee===0&&s>0){if(ja.trim().length===0){pe("Give the village a name before continuing.");return}if(gt.trim().length===0){pe("Describe what the village is like before continuing.");return}if(!n?.isFounded&&!ga.trim()){pe("Describe the village's first day before continuing.");return}}if(Ee===1&&s>1){if(!At.trim()){pe("Choose the Persona who lives in this village.");return}if(!fn?.some(d=>d.id===At)){pe("That Persona is no longer in your library. Choose another one to continue.");return}if(Ku.length>0){pe(Ku);return}if(ag){Dr(!0);return}}if(Ee===2&&s>2&&Ce!=="none"&&!Ei){pe(Ce==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(Ee===3&&s>3){let d=Be.filter(Y=>Y.classes?.includes("residence")),p=d.filter(Y=>!Y.occupancy.playerHome),N=p.length;if(!d.some(Y=>Y.occupancy.playerHome)||N<k0||N>wp||!Be.some(Y=>Y.category==="public-center")){pe("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let A=p.map(Y=>Y.occupancy.residentCharacterId).filter(Boolean);if(A.length!==p.length||new Set(A).size!==A.length){pe("Assign a different villager to each villager Residence before review.");return}let V=Be.map(Y=>({venue:Y,field:Y.name.trim()?Y.form?.trim()?Y.description.trim()?Y.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:Y})=>Y);if(V){Aa(V.venue.id),pe(`Complete ${V.field.replaceAll("-"," ")} for ${V.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${i}-setup-${V.field}`)?.focus(),0);return}}Dr(!1),pe(""),ds(s),s===1&&xo(),s===0&&No(),s===3&&Ka(),jt(!1),Ni(!1),Ti(null)},[Ku,Be,ag,Ka,xo,No,At,fn,Ce,Ei,ja,ga,n?.isFounded,gt,Ee,e]),c$=(0,m.useCallback)(()=>{Dr(!1),pe(""),ds(2),jt(!1),Ni(!1)},[]),u$=(0,m.useCallback)(()=>{Dr(!1),pe("")},[]),ve=Be.find(s=>s.id===Ar)??null,Kr=ve?.classes?.includes("gathering")?"gathering":"residence";(0,m.useEffect)(()=>{Jp(0),Iu(!1)},[Ar,Kr]),(0,m.useEffect)(()=>{if(!Ar||ve?.form?.trim()||Fp)return;let s=window.setInterval(()=>Jp(d=>(d+1)%5),4e3);return()=>window.clearInterval(s)},[Ar,ve?.form,Fp]);let cd=ve?at(ve,ve.category==="public-center"?"gathering":"residence"):null,d$=s=>({id:s.id,name:s.name,form:s.form??"",description:s.description,spaceDescription:s.spaces?.[0]?.description??"",venueClass:s.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:s.occupancy.residentCharacterId??""}),h$=async(s,d)=>{if(Ga)return;if(!(d==="exterior"?s.description:s.spaces?.[0]?.description??"").trim()){Aa(s.id),pe(`Add an ${d} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${i}-setup-${d}-description`)?.focus(),0);return}let N=Or;ms(!0),pe("");try{let A=await D("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:d$(s),area:d,villageName:ja,setting:gt,foundingDetails:ga,scenarioImprint:n?.isFounded?l1:null,worldFacts:n?.isFounded?vn:[],selectedLorebookIds:za})});Qu.current===N&&In({venueId:s.id,area:d,image:A})}catch(A){pe(I(A,"Venue art could not be generated."))}finally{ms(!1)}},m$=async(s,d,p)=>{if(!(!p||Ga)){if(p.size>(n?.settings.maxVenueImageBytes??8e6)){pe("That venue image is too large. Choose a smaller file.");return}ms(!0),pe("");try{let N=await D("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:s.name,image:await as(p)})});In({venueId:s.id,area:d,image:N})}catch(N){pe(I(N,"That venue image could not be uploaded."))}finally{ms(!1)}}},p$=()=>{if(!Mr)return;let{venueId:s,area:d,image:p}=Mr;zi(s,N=>d==="exterior"?{...N,presentation:{...N.presentation,image:p}}:{...N,spaces:[{...at(N,N.classes?.includes("gathering")?"gathering":"residence"),image:p}]}),In(null)},Cg=(0,m.useCallback)(()=>{if(ja.trim().length===0)return"Give the village a name.";if(At.trim().length===0)return"Choose the Persona who lives in this village.";if(!n?.isFounded&&!ga.trim())return"Describe the village's first day.";let s=vn.map(A=>A.trim()).filter(Boolean);if(n?.isFounded&&(s.length>4||s.some(A=>A.length>160)))return"Use at most four current world facts of 160 characters each.";if(gt.trim().length===0)return"Describe what the village is like.";if(Ce!=="none"&&!Ei)return"Choose, generate, or upload the village map.";let d=Be.filter(A=>A.classes?.includes("residence")),p=d.filter(A=>!A.occupancy.playerHome);if(p.length<k0||p.length>wp)return"Place one to three homes for initial villagers.";if(!d.some(A=>A.occupancy.playerHome))return"One Residence has to be yours.";if(Be.some(A=>!A.name.trim()||!A.form?.trim()||!A.description.trim()||!A.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let N=p.map(A=>A.occupancy.residentCharacterId).filter(A=>A!==null);return N.length!==p.length?"Choose who lives in each villager home.":new Set(N).size!==N.length?"A villager can only live in one house.":Be.filter(A=>A.category==="public-center").length!==1?"Place one Gathering Place.":""},[Be,At,Ce,Ei,ja,ga,n?.isFounded,vn,gt]),g$=(0,m.useCallback)(async()=>{let s=Cg();if(s){let d=Be.find(p=>!p.name.trim()||!p.form?.trim()||!p.description.trim()||!p.spaces?.[0]?.description.trim());if(d){let p=d.name.trim()?d.form?.trim()?d.description.trim()?"interior-description":"exterior-description":"form":"venue-name";Aa(d.id),ds(3),window.setTimeout(()=>e.querySelector(`#${i}-setup-${p}`)?.focus(),0)}pe(s);return}G(!0),pe("");try{let d=await D("/setup",{method:"POST",body:JSON.stringify({name:ja.trim(),setting:gt.trim(),foundingReason:n?.isFounded?n.settings.foundingReason:bn,foundingDetails:n?.isFounded?n.settings.foundingDetails:ga.trim(),foundingGuidance:n?.isFounded?n.settings.foundingGuidance:zr.trim(),scenarioImprint:n?.isFounded?n.settings.scenarioImprint:null,worldFacts:n?.isFounded?vn.map(p=>p.trim()).filter(Boolean):[],selectedLorebookIds:za,loreTokenBudget:uo,playerPersonaId:At,townMapImage:Ei??"",townMapView:Ce==="existing"?fo:zu("cover"),venues:Be})});o(d),jt(!1),oe(!n?.isFounded||d.foundingPreparation?.status==="pending"||d.foundingPreparation?.status==="failed"?"preparing":"home")}catch(d){pe(I(d,"The village could not be founded."))}finally{G(!1)}},[e,Be,n?.isFounded,n?.settings.foundingReason,n?.settings.foundingDetails,n?.settings.foundingGuidance,n?.settings.scenarioImprint,At,fo,Cg,Ce,Ei,ja,bn,ga,zr,vn,za,uo,gt]),f$=(0,m.useCallback)(async()=>{G(!0),K("");try{let s=await D("/setup/reset",{method:"POST"});o(s),c(null),Zr(!0,s)}catch(s){K(I(s,"The village could not be reset."))}finally{G(!1),bs(!1)}},[Zr]),zg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!n||zg.current||(zg.current=!0,n.isFounded?n.foundingPreparation&&n.foundingPreparation.status!=="ready"&&oe("preparing"):Zr(!1,n))},[Zr,n]),(0,m.useEffect)(()=>{if(le!=="preparing")return;let s=!1,d=async()=>{try{let N=await D("/setup/preparation");if(s)return;o(N),fs(""),(!N.foundingPreparation||N.foundingPreparation.status==="ready")&&oe("home")}catch(N){s||fs(I(N,"Preparation status could not be read."))}};d();let p=window.setInterval(()=>{d()},2500);return()=>{s=!0,window.clearInterval(p)}},[le]);let b$=(0,m.useCallback)(async()=>{fs("");try{o(await D("/setup/preparation/retry",{method:"POST"}))}catch(s){fs(I(s,"Preparation could not be retried."))}},[]),v$=(0,m.useCallback)(()=>{Ge({id:es(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),y$=(0,m.useCallback)(async s=>{G(!0),K("");try{let d=n?.settings.venues.some(V=>V.id===s.id)??!1,p=Hn(s).map(V=>at(s,V)),N=await D(d?`/locations/venue/${encodeURIComponent(s.id)}`:"/locations/venue",{method:d?"PUT":"POST",body:JSON.stringify({name:s.name,form:s.form,classes:s.classes,residenceCapacity:s.residenceCapacity,spaces:p,workerIds:s.workerIds??[],presentation:{x:s.presentation.x,y:s.presentation.y},category:s.category,description:p[0]?.description??s.description,state:{condition:p[0]?.state.condition??"",furniture:p[0]?.state.items??[],publicFacts:p[0]?.state.publicFacts??[],features:p[0]?.state.features??[]}})}),A=_n(N.settings.venues).find(V=>d?V.id===s.id:V.name.toLowerCase()===s.name.trim().toLowerCase());o(N),Ge(null),ho(V=>{let Y=V.map(fe=>fe.id===s.id&&A?A:fe);return[...Y,..._n(N.settings.venues).filter(fe=>!Y.some(Ra=>Ra.id===fe.id))]})}catch(d){K(I(d,"That place could not be saved."))}finally{G(!1)}},[n]),w$=(0,m.useCallback)(async s=>{let d=n?.settings.venues.find(p=>p.id===s);if(!d){ho(p=>p.filter(N=>N.id!==s));return}G(!0),K("");try{let p=await D(`/locations/venue/${encodeURIComponent(s)}/dependencies`);if(p.roomPresent||p.playerHome||p.residentCharacterIds.length||p.pendingMailCount){K(p.roomPresent?"End the active visit before deleting this Venue.":p.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let N=p.residentCharacterIds.length+p.pendingResidenceCharacterIds.length,A=N||p.workerCharacterIds.length||p.remapCount||p.eventCount?`This place is referenced by ${N} pending moves, ${p.workerCharacterIds.length} workers, ${p.remapCount} schedule moves, and ${p.eventCount} events. Delete it?`:`Delete ${d.name}?`;if(!window.confirm(A))return;let V=await D(`/locations/venue/${encodeURIComponent(s)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(V),ho(Y=>Y.filter(fe=>fe.id!==s))}catch(p){K(I(p,"That place could not be removed."))}finally{G(!1)}},[n]),Ag=(0,m.useCallback)(async(s,d)=>{G(!0),K("");try{let p=Er[s.id]??s.venueDraft,N=await D(`/venue-requests/${encodeURIComponent(s.id)}/${d?"approve":"deny"}`,{method:"POST",body:d?JSON.stringify(p):void 0});if(o(N),d){let A=new Set(rs.map(V=>V.id));ho(V=>[...V,..._n(N.settings.venues).filter(Y=>!A.has(Y.id))])}Lt(A=>{let V={...A};return delete V[s.id],V})}catch(p){K(I(p,d?"That venue could not be approved.":"That request could not be denied."))}finally{G(!1)}},[Er,rs]),$$=(0,m.useCallback)(s=>{let d=id.current,p=d?.selectionStart??Tt.length,N=d?.selectionEnd??p;od.current=p+s.length,pn(`${Tt.slice(0,p)}${s}${Tt.slice(N)}`)},[Tt]),Mg=(0,m.useCallback)(async()=>{let s=us.trim();if(s.length!==0){G(!0),K("");try{o(await D("/noticeboard",{method:"POST",body:JSON.stringify({notice:s})})),Gp("")}catch(d){K(I(d,"That notice could not be pinned up."))}finally{G(!1)}}},[us]),x$=(0,m.useCallback)(async s=>{G(!0),K("");try{o(await D(`/noticeboard/${s}`,{method:"DELETE"}))}catch(d){K(I(d,"That notice could not be taken down."))}finally{G(!1)}},[]),Vs=zt.trim().toLowerCase(),ud=(l??[]).filter(s=>Vs.length===0||s.name.toLowerCase().includes(Vs)||s.comment.toLowerCase().includes(Vs)||s.tags.some(d=>d.toLowerCase().includes(Vs))),Rg=[...(n?.villagers??[]).map(s=>s.characterId),...qe?ud.map(s=>s.id):[]].join(`
`),Og=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let s=Rg.split(`
`).filter(p=>p.length>0&&!Og.current.has(p));if(s.length===0)return;for(let p of s)Og.current.add(p);let d=new AbortController;return(async()=>{try{let p=await AS(s,d.signal);d.signal.aborted||co(N=>({...N,...p}))}catch{}})(),()=>d.abort()},[Rg]);let dd=n?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(F(null),dd.length===0)return;let s=new AbortController;return(async()=>{try{let d=await MS(dd,s.signal);s.signal.aborted||F(d)}catch{}})(),()=>s.abort()},[dd]);let Ot=(0,m.useCallback)(s=>s?l?.find(d=>d.id===s)?.name??n?.villagers.find(d=>d.characterId===s)?.name??"":"",[l,n]),N$=(()=>{let s=n?.settings.venues??[],d=[],p=new Map;for(let N of n?.villagers??[]){let A=N.place?.id;if(!A)continue;let V=p.get(A);V?V.push(N):p.set(A,[N])}for(let N of s){let A=ts(N);if(!A)continue;let V=N.occupancy.residentCharacterId,Y=kr(N),fe=N.occupancy.playerHome?oo(n):Ot(V);d.push({id:N.id,x:A.x,y:A.y,text:Y?XS(fe):N.name,image:N.presentation.image?.url??null,tone:Y?H0({isPlayerHome:N.occupancy.playerHome,occupant:V}):"venue",selected:we===N.id,doors:we===N.id?[{label:"View venue",onSelect:()=>Ms(N)},{label:"Visit",onSelect:()=>{Xr(N)}}]:void 0,onSelect:()=>bg(N)}),(p.get(N.id)??[]).forEach((Ra,To)=>{d.push({id:`villager:${Ra.characterId}`,x:A.x,y:A.y,dy:ZS*(To+1),text:Ra.name,tone:"resident",kind:"person"})})}return d})(),S$=Be.flatMap(s=>{let d=ts(s);return d?[{id:s.id,x:d.x,y:d.y,text:s.name||(s.category==="public-center"?"Gathering Place":"Residence"),image:s.presentation.image?.url??null,tone:s.category==="public-center"?"venue":s.occupancy.playerHome?"player":"resident",onSelect:()=>Aa(s.id)}]:[]});if(le==="room")return(0,r.jsxs)("div",{className:`${i}-root ${i}-room-screen`,"data-mobile":t?"true":"false",children:[L?(0,r.jsx)(c2,{room:L,speechColors:n?.settings.characterSpeechColors?Object.fromEntries(n.villagers.map(s=>[s.characterId,s.dialogueColor])):{},picture:TS(n?.settings.venues??[],L),draft:qr,mode:Br,targetId:Lr,busy:fa,error:N1,greetingNotice:S1,ruling:w1,open:y1,ended:Yr,playerName:oo(n),playerPortrait:ue??void 0,portraits:$i,sprites:Object.fromEntries((n?.villagers??[]).map(s=>[s.characterId,s.sprite])),onDraft:s=>{yo.current=null,Ns.current=null,Ci(s)},onMode:s=>{yo.current=null,xs(s)},onTarget:s=>{yo.current=null,ed(s)},onSend:()=>{Br==="conclude"?H1():q1()},onViewVenue:()=>{da(L.placeId),Ge(null),oe("venue"),ze()},onEnterPrivate:L.area==="shared"&&L.privateAccessOwnerId?()=>{Pe(!0),D("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:L.id,ownerId:L.privateAccessOwnerId})}).then(({session:s})=>{Qe(s),ze()}).catch(s=>ft(I(s,"That private space could not be entered."))).finally(()=>Pe(!1))}:void 0,privateSpaceOwnerName:Ot(L.privateAccessOwnerId),onEnd:()=>{_1()},notices:$1,onDismissNotice:s=>Qa(d=>d.filter(p=>p.id!==s)),debugDiscardEnabled:td,onDebugDiscard:()=>{I1()},onLeavePending:()=>{U1()},endFailed:be,onRetryGreeting:()=>{if(L.id)sd(L.id);else{let s=n?.settings.venues.find(d=>d.id===L.placeId);s&&Xr(s)}},onContinueWithoutGreeting:()=>{L.id&&L1(L.id)},onUseMailbox:n?.settings.venues.some(s=>s.id===L.placeId&&s.occupancy.playerHome&&(!L.spaceClass||L.spaceClass==="residence"))?()=>Ir(!0):void 0}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:ld,children:"Back to village"}),v1&&n?(0,r.jsx)("div",{className:`${i}-mailbox-backdrop`,onClick:()=>Ir(!1),children:(0,r.jsxs)("section",{className:`${i}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:s=>s.stopPropagation(),children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Mailbox"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ir(!1),children:"Close"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,r.jsxs)("div",{className:`${i}-mailbox-list`,children:[[...n.venueMail??[]].reverse().map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsx)("strong",{children:s.title}),(0,r.jsx)("p",{children:s.detail}),(0,r.jsx)("p",{className:`${i}-hint`,children:s.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(s.dueAt).toLocaleString()}`:s.status==="pending-player"?"Awaiting your decision":s.status==="approved"?"Approved":"Declined"}),s.decisions.map(d=>(0,r.jsxs)("p",{children:[(0,r.jsxs)("strong",{children:[Ot(d.characterId),":"]})," ",d.reply]},d.characterId)),s.status==="pending-player"&&s.kind==="villager-change"?(0,r.jsx)(s2,{entry:s,onDecide:async(d,p)=>{o(await D(`/venue-mail/${encodeURIComponent(s.id)}/decision`,{method:"POST",body:JSON.stringify({approved:d,...p})}))}}):null,s.error?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Reply delayed: ",s.error]}):null]},s.id)),(n.venueMail?.length??0)===0&&n.venueRequests.length===0&&n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No Venue mail yet."}):null,n.venueRequests.map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[s.requesterName||"A villager"," suggests ",s.venueDraft.name]}),(0,r.jsx)("p",{children:s.venueDraft.classes.map(d=>d[0].toUpperCase()+d.slice(1)).join(" / ")}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ir(!1),it("venueRequests")},children:"Review request"})]},s.id)),n.upgradeRequests.map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[s.requesterName," suggests a home change"]}),(0,r.jsx)("p",{children:s.detail}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ir(!1),it("venueRequests")},children:"Review request"})]},s.id))]})]})}):null]});if(le==="venue"){let s=(n?.settings.venues??[]).find(T=>T.id===wi)??null;if(!n||!s)return(0,r.jsx)("div",{className:`${i}-root`,children:(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:"This venue is no longer in the village."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:vg,children:"Back to map"})]})});let d=B1(s.id),p=Hn(s),N=s.occupancy.homeKind?_0(Ng,s.occupancy.homeKind).name:"",A=s.occupancy.playerHome?oo(n):Ot(s.occupancy.residentCharacterId),V=p.includes("residence")&&(s.residentIds?.length??0)>0,Y=L?.placeId===s.id&&(L.area==="shared"||L.area==="private"),fe=L?.placeId===s.id&&L.area==="private"?L.privateOwnerId:"",Ra=s.occupancy.playerHome||s.playerSeenShared||Y,To=(s.privateSpaces??[]).filter(T=>s.playerSeenPrivateIds?.includes(T.ownerId)||T.ownerId===fe),Ai=[...p.map(T=>({key:T,label:`${T[0].toUpperCase()}${T.slice(1)} space`,spaceClass:T,ownerId:""})),...(s.playerInvitations??[]).filter(T=>T.scope==="private"&&T.ownerId).map(T=>({key:`private:${T.ownerId}`,label:`${Ot(T.ownerId??"")}'s private space`,spaceClass:"residence",ownerId:T.ownerId??""}))],ko=(T,J,Q,ne="")=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:T}),J?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:J.url,alt:`${T} at ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"No image yet"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Ya||_,onClick:()=>{J1(s.id,Q,ne)},children:J?"Redraw image":"Draw image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*","aria-label":`Upload ${T.toLowerCase()} image`,disabled:!!Ya||_,onChange:ot=>{let Jr=ot.target.files?.[0];ot.target.value="",F1(s.id,Jr,Q,ne)}}),J?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Ya||_,onClick:()=>{P1(s.id,Q,ne)},children:"Remove image"}):null]})]},ne||Q||"exterior"),Oa=T=>({name:T.name,form:T.form,workerIds:T.workerIds,position:{x:T.presentation.x,y:T.presentation.y},spaces:p.map(J=>{let Q=at(T,J);return{description:Q.description,condition:Q.state.condition,items:Q.state.items,publicFacts:Q.state.publicFacts,features:Q.state.features.map(({id:ne,text:ot,locked:Jr})=>({id:ne,text:ot,locked:Jr}))}}),privateSpaces:T.privateSpaces?.map(J=>({ownerId:J.ownerId,description:J.description,condition:J.state.condition,items:J.state.items,publicFacts:J.state.publicFacts,features:J.state.features.map(({id:Q,text:ne,locked:ot})=>({id:Q,text:ne,locked:ot}))}))}),T$=!!(ge&&JSON.stringify(Oa(ge))!==JSON.stringify(Oa(s))),k$=!!(re&&(JSON.stringify(re.classes)!==JSON.stringify(p)||re.capacity!==(s.residenceCapacity??1)||re.slot!==0||re.title||re.description||re.extraBeds)),E$=()=>{(Z==="edit"&&T$||Z==="proposal"&&k$)&&!window.confirm("Discard your unsaved changes?")||(Ft("view"),Ge(null),mt(null),St(""),z(""))},Vg=(T,J)=>{o(T);let Q=T.settings.venues.find(ne=>ne.id===s.id);Q&&Ge(structuredClone(Q)),z(J)},C$=async()=>{if(ge){if(V){let T=Oa(ge),J=Oa(s),Q=p.indexOf("residence");if((Q>=0&&JSON.stringify(T.spaces[Q])!==JSON.stringify(J.spaces[Q])||JSON.stringify(T.privateSpaces)!==JSON.stringify(J.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}qt(!0),St(""),z("");try{let T=p.map(ne=>at(V&&ne==="residence"?s:ge,ne)),J=T[0],Q=await D(`/locations/venue/${encodeURIComponent(s.id)}`,{method:"PUT",body:JSON.stringify({name:ge.name,form:ge.form,description:V?s.description:J?.description??ge.description,spaces:T,workerIds:ge.workerIds??[],presentation:{x:ge.presentation.x,y:ge.presentation.y},state:V?s.state:{condition:J?.state.condition??"",furniture:J?.state.items??[],publicFacts:J?.state.publicFacts??[],features:J?.state.features??[]}})});Vg(Q,"Venue details saved.")}catch(T){St(I(T,"The Venue could not be saved."))}finally{qt(!1)}}},Dg=async(T,J="")=>{if(!ge)return;let Q=T==="private"?ge.privateSpaces?.find(ot=>ot.ownerId===J):at(ge,"residence");if(!Q)return;let ne=structuredClone(ge);if(T==="shared"?ne.spaces=ne.spaces?.map(ot=>ot.venueClass==="residence"?at(s,"residence"):ot):ne.privateSpaces=ne.privateSpaces?.map(ot=>ot.ownerId===J?s.privateSpaces?.find(Jr=>Jr.ownerId===J)??ot:ot),!(JSON.stringify(Oa(ne))!==JSON.stringify(Oa(s))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){qt(!0),St(""),z("");try{let ot=await D(`/locations/venue/${encodeURIComponent(s.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:T,ownerId:J,description:Q.description,state:Q.state})});Vg(ot,`${T==="private"?"Private":"Shared"} room edit proposed.`)}catch(ot){St(I(ot,"That room edit could not be proposed."))}finally{qt(!1)}}},_g=QS(s,A);return(0,r.jsxs)("div",{className:`${i}-root`,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:Z==="view"?_g:`${Z==="edit"?"Edit Venue":"Propose Change"} \xB7 ${_g}`}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:Z==="view"?d.length===0?"Nobody is here right now":`Villagers here: ${d.map(T=>T.name).join(", ")}`:Z==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:Z==="view"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ge(structuredClone(s)),St(""),z(""),Ft("edit")},children:"Edit Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{mt({classes:p,capacity:s.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),St(""),z(""),Ft("proposal")},children:"Propose Change"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:L?.placeId===s.id&&L.status!=="closed"?()=>oe("room"):vg,children:L?.placeId===s.id&&L.status!=="closed"?"Return to scene":"Back to map"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:E$,children:Z==="edit"?"Close Editor":"Exit Change Proposal"})})]}),Z==="view"?(0,r.jsxs)("main",{className:`${i}-venue-page`,children:[(0,r.jsxs)("section",{className:`${i}-venue-hero`,children:[s.presentation.image?(0,r.jsx)("img",{className:`${i}-venue-picture`,src:s.presentation.image.url,alt:`Exterior of ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Exterior image not drawn yet"}),(0,r.jsxs)("div",{className:`${i}-venue-context`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"The place"}),s.form||N?(0,r.jsx)("p",{children:s.form||N}):null,n.village.setting?(0,r.jsx)("p",{className:`${i}-hint`,children:n.village.setting}):null,p.includes("residence")?(0,r.jsxs)("p",{className:`${i}-hint`,children:[Ru(s)," / ",R0(s)," residents"]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:fa,"aria-expanded":Ai.length>1?Pt:void 0,onClick:()=>{if(Ai.length===1){let T=Ai[0];Xr(s,T.spaceClass,T.ownerId)}else ha(T=>!T)},children:fa?"Opening visit\u2026":"Visit Venue"})}),Pt&&Ai.length>1?(0,r.jsxs)("div",{className:`${i}-venue-visit-picker`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Choose a space"}),Ai.map(T=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:fa,onClick:()=>{ha(!1),Xr(s,T.spaceClass,T.ownerId)},children:T.label},T.key))]}):null,p.includes("residence")&&!s.occupancy.playerHome?(0,r.jsx)("p",{className:`${i}-hint`,children:"You can speak from outside. Entering a resident's home requires an invitation."}):null]})]}),p.includes("residence")&&!Ra?(0,r.jsx)("p",{className:`${i}-hint`,children:"The shared Residence space appears after you enter with an invitation."}):null,(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[p.filter(T=>T!=="residence"||Ra).map(T=>{let J=at(s,T);return(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:T==="residence"?"Shared Residence space":`${T[0].toUpperCase()}${T.slice(1)} space`}),J.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:J.image.url,alt:`${T} space at ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),J.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:J.description}):null,J.state.condition?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Condition now: ",J.state.condition]}):null,J.state.items.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Present items: ",J.state.items.join(", ")]}):null,J.state.publicFacts.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Established facts: ",J.state.publicFacts.join(" \xB7 ")]}):null,J.state.features.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Defining features: ",J.state.features.map(Q=>Q.text).join(" \xB7 ")]}):null]},T)}),To.map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:[Ot(T.ownerId),"'s private space"]}),T.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:T.image.url,alt:`${Ot(T.ownerId)}'s private space`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),T.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:T.description}):null,T.adaptationPending?(0,r.jsx)("p",{className:`${i}-hint`,children:"This room is still being adapted after a move."}):null]},T.ownerId))]}),(s.editProposals??[]).map(T=>(0,r.jsxs)("p",{className:`${i}-hint`,children:["Proposed ",T.target," room edit:"," ",T.declined?"declined or stale":`approved by ${T.approvedIds.length} of ${T.requiredIds.length} residents`]},T.id)),p.includes("residence")&&!s.occupancy.playerHome?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{D(`/locations/venue/${encodeURIComponent(s.id)}/player-move`,{method:"POST"}).then(o).catch(T=>St(I(T,"The move could not be requested.")))},children:"Request to live here"}):null,ma?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:ma}):null]}):Z==="edit"?(0,r.jsxs)("main",{className:`${i}-venue-editor-page`,children:[(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[ko("Exterior image",s.presentation.image),p.filter(T=>T!=="residence"||Ra).map(T=>ko(T==="residence"?"Shared Residence image":`${T} space image`,at(s,T).image,T)),To.map(T=>ko(`${Ot(T.ownerId)}'s private image`,T.image,"residence",T.ownerId))]}),Ya===s.id?(0,r.jsx)("p",{className:`${i}-hint`,children:"Drawing or saving the image\u2026"}):null,og?.id===s.id?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:og.text}):null,ge?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue details"}),(0,r.jsx)(O0,{draft:ge,existing:!0,villagers:n.villagers,editableClasses:p.filter(T=>T!=="residence"||!V||Y),onChange:Ge}),V?(0,r.jsx)("p",{className:`${i}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ea||!ge.name.trim(),onClick:()=>{C$()},children:"Save Venue details"}),V&&Y?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ea||!at(ge,"residence").description.trim(),onClick:()=>{Dg("shared")},children:"Propose shared room edit"}):null]}),V&&!Y?(0,r.jsx)("p",{className:`${i}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,fe&&ge?.privateSpaces?.filter(T=>T.ownerId===fe).map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:["Propose changes to ",Ot(T.ownerId),"'s private space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.description,onChange:J=>Ge(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ne=>ne.ownerId===T.ownerId?{...ne,description:J.target.value}:ne)})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.condition,onChange:J=>Ge(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ne=>ne.ownerId===T.ownerId?{...ne,state:{...ne.state,condition:J.target.value}}:ne)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.items.join(`
`),onChange:J=>Ge(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ne=>ne.ownerId===T.ownerId?{...ne,state:{...ne.state,items:J.target.value.split(`
`)}}:ne)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.publicFacts.join(`
`),onChange:J=>Ge(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ne=>ne.ownerId===T.ownerId?{...ne,state:{...ne.state,publicFacts:J.target.value.split(`
`)}}:ne)})})]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ea||!T.description.trim(),onClick:()=>{Dg("private",T.ownerId)},children:"Propose private room edit"})]},T.ownerId)),V&&(s.residentIds?.length??0)>0?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Resident moves"}),(0,r.jsxs)("select",{value:U,onChange:T=>se(T.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),n.settings.venues.filter(T=>T.id!==s.id&&Hn(T).includes("residence")&&Ru(T)<R0(T)).map(T=>(0,r.jsx)("option",{value:T.id,children:T.name},T.id))]}),(s.residentIds??[]).map(T=>{let J=n.residences.find(Q=>Q.characterId===T&&Q.status!=="current");return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("strong",{children:Ot(T)}),J?(0,r.jsx)("span",{className:`${i}-hint`,children:J.status==="moving"?"Moving":"Awaiting consent"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!U||Ea,onClick:()=>{qt(!0),D("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:T,venueId:U})}).then(o).catch(Q=>St(I(Q,"The move could not be requested."))).finally(()=>qt(!1))},children:"Ask to move"})]},T)})]}):null,mn?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:mn}):null,ma?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:ma}):null]}):(0,r.jsx)("main",{className:`${i}-venue-proposal-page`,children:(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Propose a Venue change"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),re?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:F0.map(T=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:re.classes.includes(T),disabled:!re.classes.includes(T)&&re.classes.length>=2,onChange:J=>mt(Q=>Q&&{...Q,classes:J.target.checked?[...Q.classes,T]:Q.classes.filter(ne=>ne!==T)})})," ",T]},T))})]}),re.classes.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Base capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:re.capacity,onChange:T=>mt({...re,capacity:Number(T.target.value)})})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:re.slot,onChange:T=>mt({...re,slot:Number(T.target.value)}),children:[(0,r.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",s.improvements?.[0]?.title??"empty"]}),(0,r.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",s.improvements?.[1]?.title??"empty"]})]})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,r.jsx)("input",{className:`${i}-notice-input`,value:re.title,onChange:T=>mt({...re,title:T.target.value}),placeholder:"A second sleeping alcove"})]}),re.title?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes in the story?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:re.description,onChange:T=>mt({...re,description:T.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:3,value:re.extraBeds,onChange:T=>mt({...re,extraBeds:Number(T.target.value)})})]})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ea||re.classes.length<1||re.title.trim().length>0&&!re.description.trim(),onClick:()=>{qt(!0),St(""),D(`/locations/venue/${encodeURIComponent(s.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:re.classes,capacity:re.capacity,...re.title.trim()?{slot:re.slot,improvement:{title:re.title,description:re.description,extraBeds:re.extraBeds}}:{},title:re.title||`Change ${s.name}`,detail:re.description||`Change Venue Classes or capacity at ${s.name}.`})}).then(T=>{o(T),mt(null),z("Proposal submitted.")}).catch(T=>St(I(T,"The proposal could not be saved."))).finally(()=>qt(!1))},children:"Submit proposal"})]}):(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:mn||"Proposal submitted."}),ma?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:ma}):null]})})]})}if(le==="menu")return(0,r.jsxs)("div",{className:`${i}-root ${i}-sectioned-menu`,"data-section":Bt,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[Bt]}),t?null:(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Bt!=="index"?()=>Ca("index"):ld,children:Bt!=="index"?"Back to menu":"Back to the village"})})]}),Ur?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ur}):null,(0,r.jsx)("nav",{className:`${i}-mobile-menu-nav`,"aria-label":"Village menu",children:Bt==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>it("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>it("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>it("story"),children:"DEBUG Settings"})]}):Bt==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([s,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":j===s,onClick:()=>s==="homes"?Sg():it(s),children:d},s))}):Bt==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([s,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":j===s,onClick:()=>it(s),children:d},s)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||_||Es,onClick:()=>{mg()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${i}-status`,children:G0}),Ts?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:Ts}):null]}):null}),(0,r.jsxs)("nav",{className:`${i}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="villagers","data-active":j==="villagers"?"true":"false",disabled:!n||_,onClick:()=>it("villagers"),children:`Villagers (${n?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="noticeboard","data-active":j==="noticeboard"?"true":"false",disabled:!n||_,onClick:()=>it("noticeboard"),children:`Noticeboard (${n?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="venueRequests","data-active":j==="venueRequests"?"true":"false",disabled:!n||_,onClick:()=>it("venueRequests"),children:`Venue Requests (${(n?.venueRequests?.length??0)+(n?.upgradeRequests?.length??0)+(n?.residences?.filter(s=>s.status==="pending"&&s.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="homes","data-active":j==="homes"?"true":"false",disabled:!n||_,onClick:Sg,children:`Homes (${Mp(n?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="map","data-active":j==="map"?"true":"false",disabled:!n||_,onClick:()=>it("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="village","data-active":j==="village"?"true":"false",onClick:()=>it("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${i}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="general","data-active":j==="general"?"true":"false",onClick:()=>it("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="replyGuidance","data-active":j==="replyGuidance"?"true":"false",disabled:!n||_,onClick:()=>it("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="story","data-active":j==="story"?"true":"false",disabled:!n||_,onClick:()=>it("story"),children:`DEBUG: Village Story (${u?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="chatlogs","data-active":j==="chatlogs"?"true":"false",disabled:!n||_,onClick:()=>it("chatlogs"),children:`DEBUG: Venue Visits (${k?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="agendas","data-active":j==="agendas"?"true":"false",disabled:!n||_,onClick:()=>it("agendas"),children:`DEBUG: Villager Wishes (${q?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":j==="schedules","data-active":j==="schedules"?"true":"false",disabled:!n||_,onClick:()=>it("schedules"),children:`Villager Agendas (${q?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||_||Es,onClick:()=>{mg()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${i}-status`,children:G0}),Ts?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:Ts}):null]})]}),j==="general"?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General settings"}),(0,r.jsx)(Ep,{}),n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-row`,htmlFor:`${i}-speech-colors`,children:[(0,r.jsx)("input",{id:`${i}-speech-colors`,type:"checkbox",checked:n.settings.characterSpeechColors,disabled:_,onChange:s=>{Y1(s.target.checked)}}),(0,r.jsx)("span",{children:"Character speech colors"})]}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Show each villager\u2019s character card dialogue color in chats."})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${i}-story-pace`,value:n.settings.storyPace,disabled:_,onChange:s=>{G1(s.target.value)},children:n.settings.storyPaces.map(s=>(0,r.jsx)("option",{value:s,children:s.charAt(0).toUpperCase()+s.slice(1)},s))}),(0,r.jsx)("span",{className:`${i}-hint`,children:VS(n.settings.storyPace)})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${i}-visit-retention`,value:n.settings.visitRetention.mode,disabled:_,onChange:s=>{let d=s.target.value;yg({mode:d,value:d==="count"?100:d==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),n.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":n.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:n.settings.visitRetention.mode==="count"?1:30,max:n.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:n.settings.visitRetention.value,onBlur:s=>{let d=Number(s.target.value);d!==n.settings.visitRetention.value&&yg({mode:n.settings.visitRetention.mode,value:d})}},`${n.settings.visitRetention.mode}:${n.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!n,onClick:()=>Zr(!1,n),children:"Run setup again"}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${i}-row`,children:g1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-danger`,disabled:_,onClick:()=>{f$()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>bs(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!n,onClick:()=>bs(!0),children:"Reset the village and start over"})})]}),Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]}):j==="village"?(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[n?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(n2,{}),t?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Map background image"}),ws?(0,r.jsx)("img",{className:`${i}-mobile-map-preview`,src:ws,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:_,"aria-label":"Choose a town map picture",onChange:s=>{let d=s.target.files?.[0];s.target.value="",wg(d)}}),Ma?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{$g()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:Rs,children:"Cancel"})]}):n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{xg()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setting`,children:"What is this village like?"}),(0,r.jsx)("textarea",{id:`${i}-setting`,className:`${i}-textarea ${i}-off`,value:is,maxLength:n.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:s=>_p(s.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,r.jsx)(B0,{books:Vu,error:Bp,selected:os,onChange:Hp,disabled:_}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-lore-budget`,className:`${i}-notice-input`,type:"number",min:n.settings.loreTokenBudgetMin,max:n.settings.loreTokenBudgetMax,step:100,value:Ou,disabled:_,onChange:s=>Up(Number(s.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venues"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:v$,disabled:_||t$>=n.settings.maxPlaces,children:"Create Venue"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"search",value:jp,onChange:s=>i1(s.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,r.jsx)("div",{className:`${i}-notice-add`,children:n.settings.venues.filter(s=>`${s.name} ${s.form??""} ${Hn(s).join(" ")}`.toLowerCase().includes(jp.toLowerCase())).map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:s.name||"Unnamed Residence"}),(0,r.jsx)("span",{className:`${i}-hint`,children:[s.form,Hn(s).join(" + ")].filter(Boolean).join(" \xB7 ")}),Hn(s).includes("residence")?(0,r.jsxs)("span",{className:`${i}-hint`,children:[(s.residentIds?.length??+!!s.occupancy.residentCharacterId)+Number(s.occupancy.playerHome)," ","/ ",s.residenceCapacity??1," residents"]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ms(s),children:"View Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ge(structuredClone(s)),children:"Edit"}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{w$(s.id)},"aria-label":`Delete ${s.name}`,disabled:_,children:"\xD7"})]})]},s.id))}),ge?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:n.settings.venues.some(s=>s.id===ge.id)?"Edit Venue":"Create Venue"}),(0,r.jsx)(O0,{draft:ge,existing:n.settings.venues.some(s=>s.id===ge.id),villagers:n.villagers,onChange:Ge}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!ge.name.trim()||!Hn(ge).every(s=>at(ge,s).description.trim()),onClick:()=>{y$(ge)},children:"Save Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ge(null),children:"Cancel"})]})]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{X1()},disabled:_,children:"Suggest Venues"})}),rs.filter(s=>!n.settings.venues.some(d=>d.id===s.id)).map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:s.name}),(0,r.jsx)("span",{className:`${i}-hint`,children:s.form}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ge(s),children:"Review suggestion"})]},s.id))]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${i}-knowledge`,ref:id,className:`${i}-preset`,value:Tt,maxLength:n.settings.promptBoxMaxLength,spellCheck:!1,onChange:s=>pn(s.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${i}-macros`,children:n.settings.macros.map(s=>(0,r.jsx)("button",{type:"button",className:`${i}-macro`,title:`${s.label} \u2014 ${s.help}`,onClick:()=>$$(s.token),children:s.token},s.token))}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)(t2,{idPrefix:"settings",personas:fn,draft:At,onDraft:gn,storedId:n.settings.playerPersonaId,storedName:n.settings.playerPersonaName,storedMissing:n.settings.playerPersonaMissing,disabled:_}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{j1()},disabled:_,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{pn(n.settings.defaultPromptKnowledge)},disabled:_,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${i}-hint`,children:Tt===n.settings.promptKnowledge&&At===n.settings.playerPersonaId&&is===n.settings.setting&&JSON.stringify(os)===JSON.stringify(n.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]}):(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[j==="villagers"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villagers"})}),(0,r.jsxs)("nav",{className:`${i}-villager-submenu`,"aria-label":"Villagers sections",children:[(0,r.jsxs)("button",{type:"button","data-active":x==="residents","aria-pressed":x==="residents",onClick:()=>f("residents"),children:[(0,r.jsx)("span",{children:"Residents"}),(0,r.jsxs)("small",{children:[n?.villagers.length??0," living here"]})]}),(0,r.jsxs)("button",{type:"button","data-active":x==="memories","aria-pressed":x==="memories",onClick:()=>{f("memories"),C(null),zs()},children:[(0,r.jsx)("span",{children:"Memories"}),(0,r.jsx)("small",{children:"Passing, durable & evidence"})]})]}),x==="residents"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ba(s=>!s),disabled:_,children:qe?"Close the list":"Add a villager"})}),qe?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("input",{className:`${i}-search`,type:"search",value:zt,onChange:s=>Wt(s.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),l===null?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):ud.length===0?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${i}-picker-list`,children:ud.map(s=>(0,r.jsxs)("div",{className:`${i}-picker-item`,"data-resident":s.inVillage?"true":"false",children:[(0,r.jsx)(lo,{portrait:$i[s.id],name:s.name,className:`${i}-avatar`}),(0,r.jsxs)("div",{className:`${i}-picker-text`,children:[(0,r.jsx)("div",{className:`${i}-villager-name`,children:s.name}),(0,r.jsx)("div",{className:`${i}-villager-role`,children:s.comment||s.tags.slice(0,3).join(" \xB7 ")}),s.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:s.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{R1(s.id)},disabled:_||s.inVillage,children:s.inVillage?"Lives here":"Move in"})]},s.id))})]}):null,n&&n.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-villagers`,children:n.villagers.map(s=>(0,r.jsx)(o2,{villager:s,portrait:$i[s.characterId],selected:!1,onSelect:!s.place||L!==null?void 0:()=>{let d=n.settings.venues.find(p=>p.id===s.place?.id);d&&bg(d)}},s.characterId))}),(0,r.jsx)("div",{className:`${i}-roster`,children:n.villagers.map(s=>(0,r.jsxs)("div",{className:`${i}-roster-entry`,children:[(0,r.jsxs)("div",{className:`${i}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-villager-name`,children:s.name}),s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,La[s.characterId]?(0,r.jsx)("div",{className:`${i}-tile-summary`,children:La[s.characterId].changed?`New card: ${La[s.characterId].proposed?.name??"unavailable"}`:La[s.characterId].sourceAvailable?`Snapshot revision ${La[s.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>so(Un===s.characterId?null:s.characterId),"aria-expanded":Un===s.characterId,children:Un===s.characterId?"Close sprite studio":`Sprites \xB7 ${s.sprite?.images.length??0} approved`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{V1(s.characterId)},disabled:_||Cr.length>0,children:"Compare card"}),La[s.characterId]?.changed&&La[s.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{D1(s.characterId)},disabled:_||Cr.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{O1(s.characterId)},disabled:_||Cr.length>0,children:"Move out"})]})]}),Un===s.characterId?(0,r.jsx)(l2,{villager:s,onSaved:o}):null]},s.characterId))})]}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):(0,r.jsx)($S,{library:b,busy:_,onRefresh:()=>{C(null),zs()},onForget:(s,d)=>{T1(s,d)}})]}):null,j==="noticeboard"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Noticeboard"})}),n.noticeboard.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.noticeboard.map((s,d)=>(0,r.jsxs)("li",{className:`${i}-notice-row`,children:[(0,r.jsxs)("span",{children:[s.author.length>0?(0,r.jsx)("span",{className:`${i}-notice-author`,children:`${s.author}: `}):null,s.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{x$(d)},disabled:_,"aria-label":`Take down: ${s.text}`,children:"\xD7"})]},`${d}:${s.text}`))}),(0,r.jsxs)("div",{className:`${i}-notice-add`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:us,maxLength:n.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:s=>Gp(s.target.value),onKeyDown:s=>{s.key==="Enter"&&(s.preventDefault(),Mg())}}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Mg()},disabled:_||us.trim().length===0||n.noticeboard.length>=n.settings.maxNoticeboardNotes,children:`Pin it up (${n.noticeboard.length}/${n.settings.maxNoticeboardNotes})`})]})]}):null,j==="venueRequests"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villagers can ask for places in conversation or during village life. A place joins the village only when you approve it here. Taking down a notice does not change a request."}),n.venueRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.venueRequests.map(s=>{let d=Er[s.id]??s.venueDraft,p=N=>Lt(A=>({...A,[s.id]:{...d,...N}}));return(0,r.jsx)("li",{className:`${i}-notice-row`,children:(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:s.requesterName||"A villager"}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${s.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.name,maxLength:n.settings.maxVenueNameLength,"aria-label":`Requested place name from ${s.requesterName||"villager"}`,onChange:N=>p({name:N.target.value})}),(0,r.jsxs)("select",{className:`${i}-notice-input`,value:d.classes[0]??"gathering","aria-label":`Requested place class from ${s.requesterName||"villager"}`,onChange:N=>p({classes:[N.target.value]}),children:[(0,r.jsx)("option",{value:"residence",children:"Residence"}),(0,r.jsx)("option",{value:"gathering",children:"Gathering"}),(0,r.jsx)("option",{value:"workplace",children:"Workplace"}),(0,r.jsx)("option",{value:"other",children:"Other"})]}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:d.description??"",maxLength:1e3,"aria-label":`Requested place description from ${s.requesterName||"villager"}`,onChange:N=>p({description:N.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!d.name.trim(),onClick:()=>{G(!0),K(""),D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:s.id,name:d.name,classes:d.classes}]})}).then(N=>p({description:N.descriptions[s.id]??""})).catch(N=>K(I(N,"The description draft could not be generated."))).finally(()=>G(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!d.name.trim()||d.classes.length===0||!d.description?.trim(),onClick:()=>{Ag(s,!0)},children:d.name!==s.venueDraft.name||JSON.stringify(d.classes)!==JSON.stringify(s.venueDraft.classes)?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{Ag(s,!1)},children:"Deny"})]})]})},s.id)})}),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Home upgrade requests"}),n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No home upgrades requested."}):n.upgradeRequests.map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:s.detail}),[!0,!1].map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{G(!0),K(""),D(`/venue-upgrades/${encodeURIComponent(s.id)}/${d?"approve":"deny"}`,{method:"POST"}).then(o).catch(p=>K(I(p,"The upgrade request could not be decided."))).finally(()=>G(!1))},children:d?"Approve upgrade":"Deny"},String(d)))]},s.id)),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Resident move requests"}),n.residences.filter(s=>s.status!=="current").length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No moves pending."}):n.residences.filter(s=>s.status!=="current").map(s=>{let d=Ot(s.characterId),p=n.settings.venues.find(N=>N.id===s.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:`${d} \u2192 ${p}`}),s.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${i}-hint`,children:["Move due ",new Date(s.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{G(!0),K(""),D("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:s.characterId})}).then(o).catch(N=>K(I(N,"The move could not be completed."))).finally(()=>G(!1))},children:"DEBUG: Complete move now"})]}):s.requestedBy==="player"?(0,r.jsxs)("span",{className:`${i}-hint`,children:["Awaiting ",d,"'s answer in conversation."]}):[!0,!1].map(N=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{G(!0),K(""),D(`/residences/${N?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:s.characterId})}).then(o).catch(A=>K(I(A,"The move request could not be decided."))).finally(()=>G(!1))},children:N?"Approve move":"Deny"},String(N)))]},s.characterId)}),Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]}):null,j==="homes"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Homes on the map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||pa.length>=Os,onClick:()=>{jt(!0),ld()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${pa.length} of at most ${Os}`})]}),pa.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(a2,{homes:pa,villagers:(n?.villagers??[]).map(s=>({id:s.characterId,name:s.name})),disabled:_,selectedId:o1,onPatch:kg,onRemove:o$,onSelect:Du,showDescriptions:!0,onGenerateDescription:s=>{l$(s)},lockedIds:new Set(n.settings.venues.filter(s=>s.occupancy.residentCharacterId).map(s=>s.id))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{r$()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>Qr(n.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${i}-hint`,children:DS(n.settings.venues,pa)?"No unsaved changes.":"Unsaved changes."})]})]}):null,j==="map"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(kp,{src:ws,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:n.settings.venues.flatMap(s=>{let d=ts(s);if(!d)return[];let p=s.occupancy.residentCharacterId?Ot(s.occupancy.residentCharacterId):s.occupancy.playerHome?oo(n):"";return[{id:s.id,x:d.x,y:d.y,text:p?`${s.name||"Home"} \xB7 ${p}`:s.name,tone:kr(s)?H0({isPlayerHome:s.occupancy.playerHome,occupant:s.occupancy.residentCharacterId}):"venue",onSelect:()=>_u(s.id)}]}),placing:cs!==null,view:Hr,shape:rg,zoom:b1,onView:$s?_r:void 0,onPlace:cs?(s,d)=>{let p=cs;G(!0),K(""),D(`/locations/venue/${encodeURIComponent(p)}`,{method:"PUT",body:JSON.stringify({presentation:{x:s,y:d}})}).then(o).catch(N=>K(I(N,"The venue could not be placed."))).finally(()=>{G(!1),Hu(null)})}:void 0}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Venue positions and residents"}),n.settings.venues.map(s=>{let d=s.occupancy.residentCharacterId?Ot(s.occupancy.residentCharacterId):s.occupancy.playerHome?oo(n):"",p=!!s.occupancy.residentCharacterId;return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":r1===s.id,onClick:()=>_u(s.id),children:s.name||"Home"}),(0,r.jsx)("span",{className:`${i}-hint`,children:d?`Lives here: ${d}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${i}-hint`,children:ts(s)?"On map":"Not placed"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||p,onClick:()=>{_u(s.id),Hu(s.id)},children:ts(s)?"Move pin":"Place pin"})]},s.id)}),cs?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Hu(null),children:"Cancel pin placement"}):null,Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]}),$s?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:U0.map(s=>(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Hr.fit===s.fit?"true":"false","aria-pressed":Hr.fit===s.fit,onClick:()=>_r({...Hr,fit:s.fit}),children:s.label},s.fit))}),(0,r.jsx)("p",{className:`${i}-hint`,children:U0.find(s=>s.fit===Hr.fit)?.help})]}):null,Wu?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":Wu.tone,children:Wu.text}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:_,"aria-label":"Choose a town map picture",onChange:s=>{let d=s.target.files?.[0];s.target.value="",wg(d)}}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{xg()},children:"Remove background image"}):null]}),$s?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{$g()},children:Ma?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:Rs,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>Pu(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:n.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),_n(n.settings.venues).length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${i}-places`,children:_n(n.settings.venues).map(s=>(0,r.jsxs)("li",{className:`${i}-place`,children:[s.presentation.image?(0,r.jsx)("img",{className:`${i}-place-thumb`,src:s.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${i}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${i}-place-body`,children:[(0,r.jsx)("span",{className:`${i}-place-name`,children:s.name}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{Ms(s)},children:"View Venue"})})]})]},s.id))})]})]}):null,j==="replyGuidance"?(0,r.jsx)(i2,{}):null,j==="story"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),u===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the village remembers\u2026"}):u.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):yS(u).map(s=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${i}-story-day`,children:s.label}),(0,r.jsx)("ul",{className:`${i}-story`,children:s.entries.map(d=>{let p=zp(d),N=d.actors.map(A=>A.name).join(", ");return(0,r.jsxs)("li",{className:`${i}-story-row`,children:[(0,r.jsxs)("span",{children:[p.length>0||d.scope==="private"||d.kind==="favour"?(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[p,d.scope==="private"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:` \xB7 private to ${N}`}):null,d.kind==="favour"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 a favour"}):null,d.kind==="tick"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,d.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:_,onClick:()=>{k1(d.id)},"aria-label":`Forget: ${d.text}`,children:"\xD7"})]},d.id)})})]},`${s.label}:${s.entries[0]?.id??""}`)),u&&u.length<g?(0,r.jsxs)("button",{type:"button",className:`${i}-button`,onClick:()=>{E1()},children:["Load more memories (",u.length," of ",g,")"]}):null]}):null,j==="chatlogs"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:De,onChange:s=>{Me(s.target.value),S(0),B(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(n?.settings.venues??[]).map(s=>(0,r.jsx)("option",{value:s.id,children:s.name},s.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:qa,onChange:s=>{yi(s.target.value),S(0),B(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(n?.villagers??[]).map(s=>(0,r.jsx)("option",{value:s.characterId,children:s.name},s.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||w===0,onClick:()=>{gg()},children:"Delete all completed logs"}),It?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:It}):null,k===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading venue visits\u2026"}):k.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No completed visits match these filters."}):k.map(s=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[s.placeName," \xB7 ",Mu(s.startedAt)]}),(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[s.participants.map(d=>d.name).join(", ")," \xB7 ",s.lineCount," lines",s.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",s.memoryPending?s.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${s.memoryReview.attempts} ${s.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${s.memoryProgress?.nextUnit??0}/${s.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{rd(s.id)},children:H?.id===s.id?"Refresh transcript":"Open transcript"}),s.memoryPending?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{M1(s.id)},children:s.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{gg(s.id)},children:"Delete log"})]}),H?.id===s.id?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("ul",{className:`${i}-story`,children:H.lines.map((d,p)=>(0,r.jsx)("li",{className:`${i}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[d.name||oo(n)," \xB7 ",Mu(d.at)]}),(0,r.jsx)("span",{style:n?.settings.characterSpeechColors&&d.role==="assistant"&&d.kind!=="narration"?K0(n.villagers.find(N=>N.characterId===d.speakerId)?.dialogueColor):void 0,children:Tr(d.content,`venue-${s.id}-${p}-`)}),(0,r.jsxs)("span",{className:`${i}-story-meta`,children:["Heard by:"," ",d.heardBy?.map(N=>H.participants.find(A=>A.characterId===N)?.name??N).join(", ")||"no one"]})]})},`${s.id}:${p}`))}),(H.submissions??[]).some(d=>d.recollections?.length)?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:"Captured recollections and evidence"}),(0,r.jsx)("ul",{className:`${i}-story`,children:(H.submissions??[]).flatMap(d=>(d.recollections??[]).map(p=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:p.text}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Subjects: ${p.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${p.knownByCharacterIds.join(", ")}`}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Evidence: ${p.lineIds.join(", ")}`})]},p.id)))})]}):null,H.memoryReview&&H.memoryReview.status!=="none"?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,open:H.memoryPending,children:[(0,r.jsx)("summary",{children:`Durable review \xB7 ${H.memoryReview?.status??"none"}`}),(0,r.jsxs)("div",{className:`${i}-agenda-notes-body`,children:[(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[`${H.memoryReview?.attempts??0} review attempts`,H.memoryReview?.error?` \xB7 Last error: ${H.memoryReview.error}`:""]}),(0,r.jsx)("ul",{className:`${i}-story`,children:(H.memoryReview?.decisions??[]).map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:`${d.action==="promote"?"Promoted":"Rejected"}${d.category?` \xB7 ${X0[d.category]}`:""}`}),d.text?(0,r.jsx)("p",{children:d.text}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:d.reason}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Sources: ${d.recollectionIds.join(", ")}`})]},d.id))})]})]}):null]}):null]},s.id)),w>20?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:v===0,onClick:()=>{S(Math.max(0,v-20)),B(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[v+1,"\u2013",Math.min(w,v+20)," of ",w]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:v+20>=w,onClick:()=>{S(v+20),B(null)},children:"Next"})]}):null]}):null,j==="agendas"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),q===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the villagers wish\u2026"}):q.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:q.map(s=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[s.name,s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null]}),s.agenda===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):s.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:s.agenda.personalizationFailure?`Wish generation failed: ${s.agenda.personalizationFailure}`:s.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${i}-story`,children:s.agenda.wishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish}),d.tell.length>0?(0,r.jsx)("p",{className:`${i}-wish-tell`,children:`Shows as: ${d.tell}`}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`${d.intensity===1?"Faint":d.intensity===3?"Strong":"Present"} \xB7 ${SS(d.addedAt??"",d.expiresAt??"")}`})]},d.id))}),s.completedWishes.length>0?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:`Completed wishes (${s.completedWishes.length})`}),(0,r.jsx)("ul",{className:`${i}-story`,children:s.completedWishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish.wish}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Fulfilled ${new Date(d.fulfilledAt).toLocaleDateString()}`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{z1(s.characterId,d.wish.id)},children:"Mark as not fulfilled"})]},d.wish.id))})]}):null]},s.characterId))})]}):null,j==="schedules"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),q===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Loading agendas\u2026"}):q.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${i}-agenda-list`,children:q.map(s=>(0,r.jsxs)("details",{className:`${i}-week`,children:[(0,r.jsx)("summary",{className:`${i}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${i}-week-head`,children:[s.name,s.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${i}-badge`,children:s.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,s.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${i}-badge`,children:"Personalization failed"}):null,s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"Card missing"}):null,s.nativeSchedule?(0,r.jsx)("span",{className:`${i}-badge`,children:s.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,xp(s)?(0,r.jsx)("span",{className:`${i}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${i}-week-body`,children:[s.agenda?.routineSummary?(0,r.jsx)("p",{className:`${i}-story-meta`,children:s.agenda.routineSummary}):null,s.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${i}-empty`,children:s.agenda.personalizationFailure}):s.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${i}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${i}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:s.ingestSchedule,disabled:_,onChange:d=>{A1(s.characterId,d.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{C1(s.characterId)},children:"Regenerate agenda"})]}),s.nativeSchedule?(0,r.jsxs)("p",{className:`${i}-story-scope`,children:[s.ingestSchedule&&s.remapFailure?`Schedule translation failed: ${s.remapFailure.message}`:s.ingestSchedule&&s.agenda?.scheduleWeek?"Schedule guides today and future days.":s.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",xp(s)?" Earlier hours retain the previous plan.":""]}):xp(s)?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Earlier hours retain the previous plan."}):null,s.weekUnreadable?(0,r.jsx)("p",{className:`${i}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):s.nativeSchedule?null:(0,r.jsx)("p",{className:`${i}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${i}-agenda-days`,children:s.days.map(d=>{let p=d.isToday?s.agenda?.activeDay?.blocks??s.agenda?.week?.[d.weekday]??[]:(s.ingestSchedule?s.agenda?.scheduleWeek?.[d.weekday]:void 0)??s.agenda?.week?.[d.weekday]??[],N=s.nativeSchedule?.days[d.weekday]??[];return(0,r.jsxs)("details",{className:`${i}-agenda-day`,open:d.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[d.weekday," \xB7 ",d.dateLabel,d.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${i}-agenda-compare`,"data-comparison":s.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${d.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:p.map((A,V)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[C0(A.startMinute),"\u2013",C0(A.endMinute)]}),(0,r.jsx)("strong",{children:A.activity}),(0,r.jsx)("span",{children:A.venueId?xS(n?.settings.venues??[],A.venueId):"Home"}),(0,r.jsx)("span",{children:A.reason}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:A.status==="idle"?"Available":A.status==="dnd"?"Busy":A.status==="offline"?"Offline":"Online"})]},`${A.startMinute}-${A.endMinute}-${V}`))})]}),s.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${d.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),N.length?(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:N.map((A,V)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:A.time}),(0,r.jsx)("strong",{children:A.activity}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:A.status||"No availability set"})]},`${A.time}-${V}`))}):(0,r.jsx)("p",{className:`${i}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${d.weekday}-${d.dateLabel}`)})})]})]},s.characterId))})]}):null,Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]})]});if(le==="preparing"){let s=n?.foundingPreparation,d=n?.villagers.length??0,p=s?.completedIds.length??0,N=n?.villagers.find(fe=>fe.characterId===s?.currentId)?.name,A=s?.stage==="reading"?"Reading the character card and native schedule":s?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":s?.stage==="resolving"?"Connecting to the System model":s?.stage==="model"?`Waiting for ${s.modelName||"the System model"} to write wishes, the week, and schedule mappings`:s?.stage==="applying"?"Expanding the week and applying native schedule times":s?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",V=s?.stageStartedAt?Date.parse(s.stageStartedAt):NaN,Y=s?.status==="pending"&&Number.isFinite(V)?Math.max(0,Math.floor((Date.now()-V)/1e3)):null;return(0,r.jsx)("div",{className:`${i}-root ${i}-preparing`,role:"status","aria-live":"polite",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("div",{className:`${i}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,r.jsxs)("h1",{children:[n?.village.name??"Your village"," is settling in"]}),(0,r.jsx)("p",{children:s?.status==="failed"?"The villagers need a hand before the gates open.":N?`Making room for ${N}\u2026`:"Lighting windows and making plans\u2026"}),(0,r.jsx)("p",{children:`${p} of ${d} villagers ready`}),s?.status==="pending"&&s.stage?(0,r.jsxs)("p",{children:[A,N?` for ${N}`:"","."]}):null,s?.attempt?(0,r.jsx)("p",{children:`Attempt ${s.attempt} of 3${Y!==null?` \xB7 ${Y}s in this stage`:""}`}):null,s?.stage==="resolving"||s?.stage==="model"||s?.stage==="applying"||s?.stage==="saving"?(0,r.jsx)("p",{children:`${s.loreEntryCount??0} relevant lorebook entries included`}):null,s?.status==="pending"&&s.error?(0,r.jsx)("p",{className:`${i}-hint`,children:`Previous attempt: ${s.error}`}):null,s?.status==="failed"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:s.error}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{b$()},children:"Retry this villager"}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Change connections"}),(0,r.jsx)(Ep,{})]})]}):null,tg?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:tg}):null]})})}if(le==="setup"){let s=(l??[]).map(d=>({id:d.id,name:d.name}));return(0,r.jsx)("div",{className:`${i}-root ${i}-home ${i}-setup-root`,children:(0,r.jsxs)("div",{className:`${i}-home-body ${i}-setup-body`,"data-step":Ee,children:[(0,r.jsx)("aside",{className:`${i}-setup-rail`,"aria-label":"Founding progress",children:Eu.map((d,p)=>(0,r.jsxs)("div",{className:`${i}-setup-rail-step`,"data-active":p===Ee?"true":"false","data-done":p<Ee?"true":"false","aria-current":p===Ee?"step":void 0,children:[(0,r.jsx)("span",{className:`${i}-setup-rail-number`,children:p+1}),(0,r.jsx)("span",{children:d})]},d))}),(0,r.jsx)("div",{className:`${i}-side`,children:(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:n?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsxs)("p",{className:`${i}-setup-kicker`,children:["Step ",Ee+1," of ",Eu.length," \xB7 ",Eu[Ee]]}),Ee===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${i}-setup-name`,className:`${i}-search`,type:"text",value:ja,maxLength:n?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:_,onChange:d=>Yp(d.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Choose a scenario"}),(0,r.jsx)("div",{className:`${i}-scenario-options`,children:Cp.filter(d=>d.value!=="custom"||n?.isFounded&&bn==="custom").map(d=>(0,r.jsxs)("label",{className:`${i}-scenario-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${i}-founding-scenario`,checked:bn===d.value,disabled:_||n?.isFounded,onChange:()=>s$(d.value)}),(0,r.jsx)("span",{className:`${i}-scenario-icon`,"aria-hidden":"true",children:d.icon}),(0,r.jsx)("strong",{children:d.label}),(0,r.jsx)("small",{children:d.description})]},d.value))})]}),n?.isFounded?(0,r.jsx)("p",{className:`${i}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,Ee===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(e2,{personas:fn,draft:At,onDraft:gn,disabled:_}),(0,r.jsx)(Ep,{onSetupProblem:m1,onImageWarningChange:ng,compact:!0}),p1?(0,r.jsxs)("div",{className:`${i}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${i}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${i}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:u$,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:c$,children:"I understand, continue"})]})]}):null]}):null,Ee===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-setting`,children:"What is this village like?"}),(0,r.jsx)("textarea",{id:`${i}-setup-setting`,className:`${i}-textarea ${i}-setup-beginning-textarea`,value:gt,maxLength:n?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:_||Mt,onChange:d=>{Xp(d.target.value),hs([])}}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),n?.isFounded?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:"Day 1 record"}),(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.foundingDetails||"This village has no recorded first-day description."}),(0,r.jsx)("span",{className:`${i}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-founding-details`,children:"What happens on the village's first day?"}),(0,r.jsx)("textarea",{id:`${i}-founding-details`,className:`${i}-textarea ${i}-setup-beginning-textarea`,value:ga,maxLength:n?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:_,onChange:d=>Uu(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history."})]}),n?.isFounded?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-world-facts`,children:"Current world facts"}),(0,r.jsx)("textarea",{id:`${i}-world-facts`,className:`${i}-textarea`,value:vn.join(`
`),disabled:_,placeholder:"One stable fact per line, up to four.",onChange:d=>Kp(d.target.value.split(/\r?\n/u))}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,r.jsx)(B0,{books:Vu,error:Bp,selected:za,onChange:d=>{Ip(d),hs([])},disabled:_}),(0,r.jsxs)("details",{className:`${i}-field`,children:[(0,r.jsx)("summary",{className:`${i}-label`,children:"Advanced lore settings"}),(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-setup-lore-budget`,className:`${i}-notice-input`,type:"number",min:n?.settings.loreTokenBudgetMin??200,max:n?.settings.loreTokenBudgetMax??3200,step:100,value:uo,disabled:_,onChange:d=>qp(Number(d.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Ee===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Ce==="generate"?"true":"false","aria-pressed":Ce==="generate",disabled:Mt,onClick:()=>ki("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Ce==="upload"?"true":"false","aria-pressed":Ce==="upload",disabled:Mt,onClick:()=>ki("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Ce==="none"?"true":"false","aria-pressed":Ce==="none",disabled:Mt,onClick:()=>ki("none"),children:"No background image"}),n?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Ce==="existing"?"true":"false","aria-pressed":Ce==="existing",disabled:Mt,onClick:()=>ki("existing"),children:"Keep current map"}):null]}),Ce==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("details",{className:`${i}-field ${i}-setup-advanced`,children:[(0,r.jsx)("summary",{className:`${i}-label`,children:"Advanced map elements"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([d,p])=>(0,r.jsxs)("label",{className:`${i}-label`,children:[p,(0,r.jsxs)("select",{className:`${i}-select`,value:ps[d],disabled:Mt,onChange:N=>Wp(A=>({...A,[d]:N.target.value})),children:[(0,r.jsx)("option",{value:"auto",children:"Auto"}),(0,r.jsx)("option",{value:"include",children:"Include"}),(0,r.jsx)("option",{value:"exclude",children:"Exclude"})]})]},d))})]}),(0,r.jsxs)("details",{className:`${i}-field ${i}-setup-advanced`,children:[(0,r.jsx)("summary",{className:`${i}-label`,children:"Testing prompt controls"}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-prompt`,className:`${i}-textarea`,value:mo,maxLength:1500,disabled:Mt,onChange:d=>Yu(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-negative`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-negative`,className:`${i}-textarea`,value:po,maxLength:1500,disabled:Mt,onChange:d=>Xu(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Mt||mo===n?.settings.townMapLayoutPrompt&&po===n?.settings.townMapNegativePrompt,onClick:()=>{Yu(n?.settings.townMapLayoutPrompt??""),Xu(n?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Mt||gt.trim().length===0,onClick:()=>{Q1()},children:Mt?"Generating map\u2026":gs==="generate"?"Generate again":"Generate map"})})]}):null,Ce==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:Mt,"aria-label":"Choose a village map image",onChange:d=>{let p=d.target.files?.[0];d.target.value="",K1(p)}}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,Ce==="none"?(0,r.jsx)("p",{className:`${i}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,Rr&&Ce!=="none"&&gs===Ce&&lg?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":Sp(Rr).tone,children:Sp(Rr).text}):null]}):null,Ee===3?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Place your home, one to three villager homes, and a Gathering Place. Choose who lives where. Villages will draft the place details for you to review."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Ga||Be.filter(d=>d.classes?.includes("residence")).length>=1+So,onClick:()=>{jt(!0),Ni(!1),Ti(null)},children:"Place a Residence"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Ga||Be.some(d=>d.category==="public-center"),onClick:()=>{jt(!1),Ni(!0),Ti(null)},children:"Place a Gathering Place"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Ga||Be.length===0,onClick:()=>{Si([]),Aa(null),In(null),Ti(null),jt(!1),Ni(!1)},children:"Reset all venues"})]}),Pp?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Pp}):null,(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:Be.map(d=>(0,r.jsxs)("button",{type:"button",className:`${i}-setup-venue-card`,"data-selected":d.id===Ar?"true":"false",onClick:()=>Aa(d.id),children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:d.name||"Unnamed venue"}),(0,r.jsxs)("small",{children:[d.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",d.occupancy.playerHome?"You":Ot(d.occupancy.residentCharacterId)||"Choose a villager"]})]})]},d.id))}),ve&&cd?(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,children:[ve.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",ve.name]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ti(ve.id),jt(!1),Ni(!1)},children:"Move on map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>n$(ve.id),children:"Remove venue"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{id:`${i}-setup-venue-name`,className:`${i}-notice-input`,value:ve.name,maxLength:100,onChange:d=>zi(ve.id,p=>({...p,name:d.target.value}))})]}),ve.category==="public-center"?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Ga,onClick:()=>{Z1()},children:"Suggest three names"}),c1.map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>zi(ve.id,p=>({...p,name:d})),children:d},d))]}):null,(0,r.jsxs)("p",{className:`${i}-hint`,children:["Class: ",Kr==="gathering"?"Gathering":"Residence"]}),(0,r.jsxs)("div",{className:`${i}-setup-form-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-form`,children:"Form"}),(0,r.jsx)("textarea",{id:`${i}-setup-form`,className:`${i}-textarea`,rows:2,value:ve.form??"",maxLength:240,placeholder:vS[Kr][u1],onFocus:()=>Iu(!0),onBlur:()=>Iu(!1),onChange:d=>{zi(ve.id,p=>({...p,form:d.target.value})),pe("")}}),(0,r.jsx)("small",{className:`${i}-hint`,children:"What the Venue actually is"})]}),ve.category!=="public-center"?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident",(0,r.jsxs)("select",{className:`${i}-select`,value:ve.occupancy.residentCharacterId??"",disabled:ve.occupancy.playerHome,onChange:d=>zi(ve.id,p=>({...p,residentIds:d.target.value?[d.target.value]:[],occupancy:{...p.occupancy,residentCharacterId:d.target.value||null}})),children:[(0,r.jsx)("option",{value:"",children:ve.occupancy.playerHome?"You":"Choose a villager"}),s.map(d=>(0,r.jsx)("option",{value:d.id,disabled:Be.some(p=>p.id!==ve.id&&p.occupancy.residentCharacterId===d.id),children:d.name},d.id))]})]}):null,(0,r.jsx)("div",{className:`${i}-setup-place-spaces`,children:["exterior","interior"].map(d=>{let p=d==="exterior",N=p?"Exterior":"Interior",A=p?ve.presentation.image:cd.image;return(0,r.jsxs)("section",{className:`${i}-setup-place-space`,children:[(0,r.jsx)("h4",{children:N}),(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-${d}-description`,children:[N," Description \xB7 required"]}),(0,r.jsx)("textarea",{id:`${i}-setup-${d}-description`,className:`${i}-textarea`,value:p?ve.description:cd.description,maxLength:1e3,onChange:V=>{let Y=V.target.value;zi(ve.id,fe=>p?{...fe,description:Y}:{...fe,spaces:[{...at(fe,Kr),description:Y}]}),pe(""),In(null)}}),(0,r.jsxs)("span",{className:`${i}-label`,children:[N," Image \xB7 optional"]}),A?(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:A.url,alt:`${d} of ${ve.name}`}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No image yet. A placeholder will be used."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ga,onClick:()=>{h$(ve,d)},children:A?`Regenerate ${N} Image`:`Generate ${N} Image`}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*",disabled:Ga,"aria-label":`Upload ${d} image for ${ve.name}`,onChange:V=>{let Y=V.target.files?.[0];V.target.value="",m$(ve,d,Y)}}),A?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>zi(ve.id,V=>p?{...V,presentation:{...V.presentation,image:null}}:{...V,spaces:[{...at(V,Kr),image:null}]}),children:"Remove image"}):null]}),Mr?.venueId===ve.id&&Mr.area===d?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:Mr.image.url,alt:`New ${d} image preview`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:p$,children:"Use this image"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>In(null),children:"Discard"})]}):null]},d)})})]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"Place or select a venue to edit it."}),l===null?(0,r.jsx)("p",{className:`${i}-hint`,children:"Reading your villager library\u2026"}):null]}):null,Ee===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,r.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Village Beginning"}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:ja.trim()})," \xB7 ",gt.trim()]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Persona:"})," ",fn?.find(d=>d.id===At)?.name??"Selected Persona"," \xB7 ",(0,r.jsx)("strong",{children:"Scenario:"})," ",ro(bn).label]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Day 1:"})," ",ga||"No first-day description was recorded."]}),zr?(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Original founding direction:"})," ",zr]}):null]}),(0,r.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Map and lore"}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Map:"})," ",Ce==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,r.jsx)("strong",{children:"Lorebooks:"})," ",za.map(d=>Vu?.find(p=>p.id===d)?.name??d).join(", ")||"None"]})]}),(0,r.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Starting places"}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:Be.map(d=>(0,r.jsxs)("div",{className:`${i}-setup-venue-card`,children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsxs)("strong",{children:[d.name," \xB7 ",d.category==="public-center"?"Gathering Place":"Residence"]}),(0,r.jsxs)("small",{children:[d.form," \xB7"," ",d.occupancy.playerHome?"You":Ot(d.occupancy.residentCharacterId)||"Community"]})]})]},d.id))}),Be.map(d=>(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsxs)("strong",{children:[d.name,":"]})," ",d.description," ",d.spaces?.[0]?.description]},`${d.id}-summary`))]})]}):null,ig?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:ig}):null,Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]})}),(0,r.jsxs)("div",{className:`${i}-setup-visual`,children:[Ee<=1?(0,r.jsx)(FS,{scenario:bn}):(0,r.jsx)("div",{className:`${i}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${i}-setup-map-viewport`,children:(0,r.jsx)(kp,{src:Ei,alt:`A map of ${ja.trim()||"your new village"}.`,pins:Ee<3?[]:S$,placing:Ee===3&&(xi||ss||qu!==null),view:Ce==="existing"?fo:zu("cover"),shape:lg,onPlace:Ee===3?a$:void 0,compact:Ee<2,mobile:t&&Ee>=2,photoPins:Ee>=3})})}),(0,r.jsxs)("nav",{className:`${i}-setup-footer`,"aria-label":"Founding navigation",children:[Ee>0?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Mt||Ga,onClick:()=>Eg(Ee-1),children:"\u2190 Back"}):null,Ee<Eu.length-1?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-setup-forward`,disabled:_||Mt||Ga,onClick:()=>Eg(Ee+1),children:"Next \u2192"}):(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-setup-forward`,disabled:_||Mt||!n,onClick:()=>{g$()},children:n?.isFounded?"Save this village":"Found the village"}),n?.isFounded?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{jt(!1),oe("home")},children:"Show me the village"}):null]})]})]})})}return(0,r.jsxs)("div",{className:`${i}-root ${i}-home ${i}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-home-bar`,children:[(0,r.jsx)(LS,{weather:n?.village.weather??""}),!t&&n?.isFounded&&_n(n.settings.venues).length>0?(0,r.jsxs)("div",{className:`${i}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":pt,"aria-controls":`${i}-places-list`,disabled:_,onClick:()=>{W(null),Fe(s=>!s)},children:"Places"}),pt?(0,r.jsx)("div",{id:`${i}-places-list`,className:`${i}-places-list`,children:n.settings.venues.map(s=>(0,r.jsxs)("div",{className:`${i}-places-list-row`,children:[(0,r.jsx)("span",{className:`${i}-places-list-name`,children:s.name}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ms(s),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Xr(s)},children:"Visit"})]},s.id))}):null]}):null,(0,r.jsxs)("span",{className:`${i}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-mobile-board-button`,"aria-label":`Noticeboard (${n?.noticeboard.length??0})`,disabled:!n||_,onClick:()=>it("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),n?.isFounded?(0,r.jsx)(YS,{happenings:n.happenings,recap:n.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:_||!n,onClick:()=>{Ca("index"),oe("menu")},children:"\u2630"}),t?null:(0,r.jsx)(GS,{}),xi?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>jt(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${i}-room`,children:(0,r.jsx)("div",{className:`${i}-home-map-viewport`,children:(0,r.jsx)(kp,{src:ws,alt:`A map of ${n?.village.name??"the village"}.`,pins:N$,placing:xi,view:fo,shape:rg,onPlace:i$,onDismiss:()=>{W(null),Fe(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Ur||Rt||xi||Es||ad?(0,r.jsxs)("div",{className:`${i}-notice`,children:[Ur?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ur}):null,Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null,xi?(0,r.jsx)("span",{className:`${i}-status`,children:"Click the map where the house stands."}):null,Es?(0,r.jsxs)("span",{className:`${i}-status`,children:["Catching up on what ",n?.village.name??"the village"," has been doing\u2026"]}):null,ad?(0,r.jsx)("p",{className:`${i}-status`,children:ad}):null]}):null})})})]})}var Rp=class extends HTMLElement{connectedCallback(){z0(),this.__root??(this.__root=(0,Y0.createRoot)(this)),this.__root.render((0,r.jsx)(Ap,{element:this,children:(0,r.jsx)(d2,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),z0()})}};function d2({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let n=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",n),()=>e.removeEventListener("marinara-capability-props",n)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(g2,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(p2,{props:e.capabilityProps??{}}):(0,r.jsx)(u2,{element:e})}function h2(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var m2="marinara-active-chat-id";function t1(){try{window.localStorage.removeItem(m2)}catch{}window.location.reload()}function a1(e,t){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(l(!1),n(null),!t)return;let c=new AbortController;return(async()=>{try{let u=await D(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;n(u??null),l(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:o}}function p2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",n=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:l,known:c}=a1(t,a&&t.length>0),[u,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!u)return;let b=k=>{g.current?.contains(k.target)||h(!1)},C=k=>{k.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",b),document.addEventListener("keydown",C),()=>{document.removeEventListener("pointerdown",b),document.removeEventListener("keydown",C)}},[u]),!a||!c||l===null)return null;let $=l.name||"your villager",x=l.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${x}`;return(0,r.jsxs)("span",{className:`${i}-tracker`,"data-compact":n,"data-open":u,ref:g,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${i}-tracker-chip`:`${i}-button ${i}-tracker-chip`,onClick:()=>h(b=>!b),"aria-haspopup":"menu","aria-expanded":u,title:f,"aria-label":f,children:[(0,r.jsx)(h2,{}),(0,r.jsx)("span",{className:`${i}-tracker-label`,children:"Villages"})]}),u?(0,r.jsxs)("div",{className:`${i}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${x}`,children:[(0,r.jsxs)("p",{className:`${i}-tracker-menu-title`,children:["This roleplay spun off from ",x]}),l.resident?(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[$," still lives there. ",x," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[$," does not live in ",x," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${i}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:t1,title:`Leaves this chat and opens Marinara's home screen, where the ${x} tab is waiting.`,children:"Open the village"})})]}):null]})}function g2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:n,known:o}=a1(t,a&&t.length>0);if(!a||!o)return null;if(n===null)return(0,r.jsx)("div",{className:`${i}-panel-view`,children:(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let l=n.name||"this villager",c=n.villageName||"your village";return(0,r.jsxs)("div",{className:`${i}-panel-view`,children:[(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:n.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${l} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:l})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:n.room})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:c})]}),(0,r.jsx)("div",{className:`${i}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:t1,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(i)||customElements.define(i,Rp);
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
