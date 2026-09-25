var o1=Object.create;var $c=Object.defineProperty;var l1=Object.getOwnPropertyDescriptor;var r1=Object.getOwnPropertyNames;var s1=Object.getPrototypeOf,u1=Object.prototype.hasOwnProperty;var c1=(e,t,a)=>t in e?$c(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var Ea=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var d1=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of r1(t))!u1.call(e,o)&&o!==a&&$c(e,o,{get:()=>t[o],enumerable:!(n=l1(t,o))||n.enumerable});return e};var Zr=(e,t,a)=>(a=e!=null?o1(s1(e)):{},d1(t||!e||!e.__esModule?$c(a,"default",{value:e,enumerable:!0}):a,e));var Lf=(e,t,a)=>c1(e,typeof t!="symbol"?t+"":t,a);var Wf=Ea(Q=>{"use strict";var Ec=Symbol.for("react.transitional.element"),h1=Symbol.for("react.portal"),m1=Symbol.for("react.fragment"),f1=Symbol.for("react.strict_mode"),g1=Symbol.for("react.profiler"),p1=Symbol.for("react.consumer"),b1=Symbol.for("react.context"),v1=Symbol.for("react.forward_ref"),y1=Symbol.for("react.suspense"),w1=Symbol.for("react.memo"),If=Symbol.for("react.lazy"),x1=Symbol.for("react.activity"),N1=Symbol.for("react.view_transition"),Bf=Symbol.iterator;function $1(e){return e===null||typeof e!="object"?null:(e=Bf&&e[Bf]||e["@@iterator"],typeof e=="function"?e:null)}var Xf={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Qf=Object.assign,Zf={};function Xi(e,t,a){this.props=e,this.context=t,this.refs=Zf,this.updater=a||Xf}Xi.prototype.isReactComponent={};Xi.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Xi.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Kf(){}Kf.prototype=Xi.prototype;function kc(e,t,a){this.props=e,this.context=t,this.refs=Zf,this.updater=a||Xf}var Cc=kc.prototype=new Kf;Cc.constructor=kc;Qf(Cc,Xi.prototype);Cc.isPureReactComponent=!0;var Gf=Array.isArray;function Tc(){}var Se={H:null,A:null,T:null,S:null},Jf=Object.prototype.hasOwnProperty;function Ac(e,t,a){var n=a.ref;return{$$typeof:Ec,type:e,key:t,ref:n!==void 0?n:null,props:a}}function S1(e,t){return Ac(e.type,t,e.props)}function zc(e){return typeof e=="object"&&e!==null&&e.$$typeof===Ec}function T1(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var Yf=/\/+/g;function Sc(e,t){return typeof e=="object"&&e!==null&&e.key!=null?T1(""+e.key):t.toString(36)}function E1(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Tc,Tc):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Ii(e,t,a,n,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var s=!1;if(e===null)s=!0;else switch(l){case"bigint":case"string":case"number":s=!0;break;case"object":switch(e.$$typeof){case Ec:case h1:s=!0;break;case If:return s=e._init,Ii(s(e._payload),t,a,n,o)}}if(s)return o=o(e),s=n===""?"."+Sc(e,0):n,Gf(o)?(a="",s!=null&&(a=s.replace(Yf,"$&/")+"/"),Ii(o,t,a,"",function(g){return g})):o!=null&&(zc(o)&&(o=S1(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(Yf,"$&/")+"/")+s)),t.push(o)),1;s=0;var c=n===""?".":n+":";if(Gf(e))for(var h=0;h<e.length;h++)n=e[h],l=c+Sc(n,h),s+=Ii(n,t,a,l,o);else if(h=$1(e),typeof h=="function")for(e=h.call(e),h=0;!(n=e.next()).done;)n=n.value,l=c+Sc(n,h++),s+=Ii(n,t,a,l,o);else if(l==="object"){if(typeof e.then=="function")return Ii(E1(e),t,a,n,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return s}function Kr(e,t,a){if(e==null)return e;var n=[],o=0;return Ii(e,n,"","",function(l){return t.call(a,l,o++)}),n}function k1(e){if(e._status===-1){var t=e._result,a=t();a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n,a.status===void 0&&(a.status="fulfilled",a.value=n))},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n,a.status===void 0&&(a.status="rejected",a.reason=n))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var jf=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Ff(e){var t=Se.T,a={};a.types=t!==null?t.types:null,Se.T=a;try{var n=e(),o=Se.S;o!==null&&o(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(Tc,jf)}catch(l){jf(l)}finally{t!==null&&a.types!==null&&(t.types=a.types),Se.T=t}}function Pf(e){var t=Se.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else Ff(Pf.bind(null,e))}var C1={map:Kr,forEach:function(e,t,a){Kr(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Kr(e,function(){t++}),t},toArray:function(e){return Kr(e,function(t){return t})||[]},only:function(e){if(!zc(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};Q.Activity=x1;Q.Children=C1;Q.Component=Xi;Q.Fragment=m1;Q.Profiler=g1;Q.PureComponent=kc;Q.StrictMode=f1;Q.Suspense=y1;Q.ViewTransition=N1;Q.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Se;Q.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Se.H.useMemoCache(e)}};Q.addTransitionType=Pf;Q.cache=function(e){return function(){return e.apply(null,arguments)}};Q.cacheSignal=function(){return null};Q.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var n=Qf({},e.props),o=e.key;if(t!=null)for(l in t.key!==void 0&&(o=""+t.key),t)!Jf.call(t,l)||l==="key"||l==="__self"||l==="__source"||l==="ref"&&t.ref===void 0||(n[l]=t[l]);var l=arguments.length-2;if(l===1)n.children=a;else if(1<l){for(var s=Array(l),c=0;c<l;c++)s[c]=arguments[c+2];n.children=s}return Ac(e.type,o,n)};Q.createContext=function(e){return e={$$typeof:b1,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:p1,_context:e},e};Q.createElement=function(e,t,a){var n,o={},l=null;if(t!=null)for(n in t.key!==void 0&&(l=""+t.key),t)Jf.call(t,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(o[n]=t[n]);var s=arguments.length-2;if(s===1)o.children=a;else if(1<s){for(var c=Array(s),h=0;h<s;h++)c[h]=arguments[h+2];o.children=c}if(e&&e.defaultProps)for(n in s=e.defaultProps,s)o[n]===void 0&&(o[n]=s[n]);return Ac(e,l,o)};Q.createRef=function(){return{current:null}};Q.forwardRef=function(e){return{$$typeof:v1,render:e}};Q.isValidElement=zc;Q.lazy=function(e){return{$$typeof:If,_payload:{_status:-1,_result:e},_init:k1}};Q.memo=function(e,t){return{$$typeof:w1,type:e,compare:t===void 0?null:t}};Q.startTransition=Ff;Q.unstable_useCacheRefresh=function(){return Se.H.useCacheRefresh()};Q.use=function(e){return Se.H.use(e)};Q.useActionState=function(e,t,a){return Se.H.useActionState(e,t,a)};Q.useCallback=function(e,t){return Se.H.useCallback(e,t)};Q.useContext=function(e){return Se.H.useContext(e)};Q.useDebugValue=function(){};Q.useDeferredValue=function(e,t){return Se.H.useDeferredValue(e,t)};Q.useEffect=function(e,t){return Se.H.useEffect(e,t)};Q.useEffectEvent=function(e){return Se.H.useEffectEvent(e)};Q.useId=function(){return Se.H.useId()};Q.useImperativeHandle=function(e,t,a){return Se.H.useImperativeHandle(e,t,a)};Q.useInsertionEffect=function(e,t){return Se.H.useInsertionEffect(e,t)};Q.useLayoutEffect=function(e,t){return Se.H.useLayoutEffect(e,t)};Q.useMemo=function(e,t){return Se.H.useMemo(e,t)};Q.useOptimistic=function(e,t){return Se.H.useOptimistic(e,t)};Q.useReducer=function(e,t,a){return Se.H.useReducer(e,t,a)};Q.useRef=function(e){return Se.H.useRef(e)};Q.useState=function(e){return Se.H.useState(e)};Q.useSyncExternalStore=function(e,t,a){return Se.H.useSyncExternalStore(e,t,a)};Q.useTransition=function(){return Se.H.useTransition()};Q.version="19.3.0"});var Jr=Ea((D5,eg)=>{"use strict";eg.exports=Wf()});var cg=Ea(Ae=>{"use strict";function Vc(e,t){var a=e.length;e.push(t);e:for(;0<a;){var n=a-1>>>1,o=e[n];if(0<Fr(o,t))e[n]=t,e[a]=o,a=n;else break e}}function ka(e){return e.length===0?null:e[0]}function Wr(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var n=0,o=e.length,l=o>>>1;n<l;){var s=2*(n+1)-1,c=e[s],h=s+1,g=e[h];if(0>Fr(c,a))h<o&&0>Fr(g,c)?(e[n]=g,e[h]=a,n=h):(e[n]=c,e[s]=a,n=s);else if(h<o&&0>Fr(g,a))e[n]=g,e[h]=a,n=h;else break e}}return t}function Fr(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Ae.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(tg=performance,Ae.unstable_now=function(){return tg.now()}):(Mc=Date,ag=Mc.now(),Ae.unstable_now=function(){return Mc.now()-ag});var tg,Mc,ag,Za=[],bn=[],A1=1,Ft=null,ht=3,Dc=!1,sl=!1,ul=!1,_c=!1,og=typeof setTimeout=="function"?setTimeout:null,lg=typeof clearTimeout=="function"?clearTimeout:null,ng=typeof setImmediate<"u"?setImmediate:null;function Pr(e){for(var t=ka(bn);t!==null;){if(t.callback===null)Wr(bn);else if(t.startTime<=e)Wr(bn),t.sortIndex=t.expirationTime,Vc(Za,t);else break;t=ka(bn)}}function Hc(e){if(ul=!1,Pr(e),!sl)if(ka(Za)!==null)sl=!0,Zi||(Zi=!0,Qi());else{var t=ka(bn);t!==null&&Uc(Hc,t.startTime-e)}}var Zi=!1,cl=-1,rg=5,sg=-1;function ug(){return _c?!0:!(Ae.unstable_now()-sg<rg)}function Oc(){if(_c=!1,Zi){var e=Ae.unstable_now();sg=e;var t=!0;try{e:{sl=!1,ul&&(ul=!1,lg(cl),cl=-1),Dc=!0;var a=ht;try{t:{for(Pr(e),Ft=ka(Za);Ft!==null&&!(Ft.expirationTime>e&&ug());){var n=Ft.callback;if(typeof n=="function"){Ft.callback=null,ht=Ft.priorityLevel;var o=n(Ft.expirationTime<=e);if(e=Ae.unstable_now(),typeof o=="function"){Ft.callback=o,Pr(e),t=!0;break t}Ft===ka(Za)&&Wr(Za),Pr(e)}else Wr(Za);Ft=ka(Za)}if(Ft!==null)t=!0;else{var l=ka(bn);l!==null&&Uc(Hc,l.startTime-e),t=!1}}break e}finally{Ft=null,ht=a,Dc=!1}t=void 0}}finally{t?Qi():Zi=!1}}}var Qi;typeof ng=="function"?Qi=function(){ng(Oc)}:typeof MessageChannel<"u"?(Rc=new MessageChannel,ig=Rc.port2,Rc.port1.onmessage=Oc,Qi=function(){ig.postMessage(null)}):Qi=function(){og(Oc,0)};var Rc,ig;function Uc(e,t){cl=og(function(){e(Ae.unstable_now())},t)}Ae.unstable_IdlePriority=5;Ae.unstable_ImmediatePriority=1;Ae.unstable_LowPriority=4;Ae.unstable_NormalPriority=3;Ae.unstable_Profiling=null;Ae.unstable_UserBlockingPriority=2;Ae.unstable_cancelCallback=function(e){e.callback=null};Ae.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):rg=0<e?Math.floor(1e3/e):5};Ae.unstable_getCurrentPriorityLevel=function(){return ht};Ae.unstable_next=function(e){switch(ht){case 1:case 2:case 3:var t=3;break;default:t=ht}var a=ht;ht=t;try{return e()}finally{ht=a}};Ae.unstable_requestPaint=function(){_c=!0};Ae.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=ht;ht=e;try{return t()}finally{ht=a}};Ae.unstable_scheduleCallback=function(e,t,a){var n=Ae.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:A1++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>n?(e.sortIndex=a,Vc(bn,e),ka(Za)===null&&e===ka(bn)&&(ul?(lg(cl),cl=-1):ul=!0,Uc(Hc,a-n))):(e.sortIndex=o,Vc(Za,e),sl||Dc||(sl=!0,Zi||(Zi=!0,Qi()))),e};Ae.unstable_shouldYield=ug;Ae.unstable_wrapCallback=function(e){var t=ht;return function(){var a=ht;ht=t;try{return e.apply(this,arguments)}finally{ht=a}}}});var hg=Ea((H5,dg)=>{"use strict";dg.exports=cg()});var gg=Ea(mt=>{"use strict";var z1=Jr();function fg(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function vn(){}var bt={d:{f:vn,r:function(){throw Error(fg(522))},D:vn,C:vn,L:vn,m:vn,X:vn,S:vn,M:vn},p:0,findDOMNode:null},M1=Symbol.for("react.portal"),O1=Symbol.for("react.recoverable"),mg=Symbol.for("react.optimistic_key");function R1(e,t,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:M1,key:n==null?null:n===mg?mg:""+n,children:e,containerInfo:t,implementation:a}}var dl=z1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function es(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}mt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=bt;mt.browser=function(e){return{$$typeof:O1,_reason:e}};mt.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(fg(299));return R1(e,t,null,a)};mt.flushSync=function(e){var t=dl.T,a=bt.p;try{if(dl.T=null,bt.p=2,e)return e()}finally{dl.T=t,bt.p=a,bt.d.f()}};mt.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,bt.d.C(e,t))};mt.prefetchDNS=function(e){typeof e=="string"&&bt.d.D(e)};mt.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,n=es(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,l=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?bt.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:n,integrity:o,fetchPriority:l}):a==="script"&&bt.d.X(e,{crossOrigin:n,integrity:o,fetchPriority:l,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};mt.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=es(t.as,t.crossOrigin);bt.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&bt.d.M(e)};mt.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,n=es(a,t.crossOrigin);bt.d.L(e,a,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};mt.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=es(t.as,t.crossOrigin);bt.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else bt.d.m(e)};mt.requestFormReset=function(e){bt.d.r(e)};mt.unstable_batchedUpdates=function(e,t){return e(t)};mt.useFormState=function(e,t,a){return dl.H.useFormState(e,t,a)};mt.useFormStatus=function(){return dl.H.useHostTransitionStatus()};mt.version="19.3.0"});var vg=Ea((q5,bg)=>{"use strict";function pg(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(pg)}catch(e){console.error(e)}}pg(),bg.exports=gg()});var iw=Ea(Du=>{"use strict";var Xe=hg(),nb=Jr(),V1=vg();function k(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ib(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Pl(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function ob(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function lb(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function yg(e){if(Pl(e)!==e)throw Error(k(188))}function D1(e){var t=e.alternate;if(!t){if(t=Pl(e),t===null)throw Error(k(188));return t!==e?null:e}for(var a=e,n=t;;){var o=a.return;if(o===null)break;var l=o.alternate;if(l===null){if(n=o.return,n!==null){a=n;continue}break}if(o.child===l.child){for(l=o.child;l;){if(l===a)return yg(o),e;if(l===n)return yg(o),t;l=l.sibling}throw Error(k(188))}if(a.return!==n.return)a=o,n=l;else{for(var s=!1,c=o.child;c;){if(c===a){s=!0,a=o,n=l;break}if(c===n){s=!0,n=o,a=l;break}c=c.sibling}if(!s){for(c=l.child;c;){if(c===a){s=!0,a=l,n=o;break}if(c===n){s=!0,n=l,a=o;break}c=c.sibling}if(!s)throw Error(k(189))}}if(a.alternate!==n)throw Error(k(190))}if(a.tag!==3)throw Error(k(188));return a.stateNode.current===a?e:t}function rb(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=rb(e),t!==null)return t;e=e.sibling}return null}function Ot(e,t,a,n,o,l){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,n,o,l)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Ot(e.child,t,a,n,o,l))return!0;e=e.sibling}return!1}function xi(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function wg(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function sb(e){var t=[null,null],a=xi(e);return a===null||ub(t,e,a.child,{foundSelf:!1}),t}function ub(e,t,a,n){for(;a!==null;){if(a===t)n.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(n.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&ub(e,t,a.child,n))return!0;a=a.sibling}return!1}function Ie(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(k(559))}}var to=null,pd=null;function _1(e,t,a){return e===a?!0:e===t?(to=e,!0):!1}function H1(e,t,a){return e===a?(pd=e,!1):e===t?(pd!==null&&(to=e),!0):!1}function xg(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function bd(e,t,a){for(var n=0,o=e;o;o=a(o))n++;o=0;for(var l=t;l;l=a(l))o++;for(;0<n-o;)e=a(e),n--;for(;0<o-n;)t=a(t),o--;for(;n--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var we=Object.assign,U1=Symbol.for("react.element"),ts=Symbol.for("react.transitional.element"),vl=Symbol.for("react.portal"),ao=Symbol.for("react.fragment"),cb=Symbol.for("react.strict_mode"),vd=Symbol.for("react.profiler"),db=Symbol.for("react.consumer"),Ra=Symbol.for("react.context"),kh=Symbol.for("react.forward_ref"),yd=Symbol.for("react.suspense"),wd=Symbol.for("react.suspense_list"),Ch=Symbol.for("react.memo"),Nn=Symbol.for("react.lazy"),xd=Symbol.for("react.activity"),q1=Symbol.for("react.legacy_hidden"),L1=Symbol.for("react.memo_cache_sentinel"),Nd=Symbol.for("react.view_transition"),B1=Symbol.for("react.recoverable"),Ng=Symbol.iterator;function hl(e){return e===null||typeof e!="object"?null:(e=Ng&&e[Ng]||e["@@iterator"],typeof e=="function"?e:null)}var G1=Symbol.for("react.client.reference");function $d(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===G1?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case ao:return"Fragment";case vd:return"Profiler";case cb:return"StrictMode";case yd:return"Suspense";case wd:return"SuspenseList";case xd:return"Activity";case Nd:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case vl:return"Portal";case Ra:return e.displayName||"Context";case db:return(e._context.displayName||"Context")+".Consumer";case kh:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Ch:return t=e.displayName||null,t!==null?t:$d(e.type)||"Memo";case Nn:t=e._payload,e=e._init;try{return $d(e(t))}catch{}}return null}var yl=Array.isArray,j=nb.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,se=V1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,si={pending:!1,data:null,method:null,action:null},Sd=[],no=-1;function La(e){return{current:e}}function nt(e){0>no||(e.current=Sd[no],Sd[no]=null,no--)}function ke(e,t){no++,Sd[no]=e.current,e.current=t}var Ha=La(null),_l=La(null),Mn=La(null),Bs=La(null);function Gs(e,t){switch(ke(Mn,t),ke(_l,e),ke(Ha,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?_p(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=_p(t),e=Ry(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}nt(Ha),ke(Ha,e)}function So(){nt(Ha),nt(_l),nt(Mn)}function Td(e){var t=e.memoizedState;t!==null&&(Vo._currentValue=t.memoizedState,ke(Bs,e)),t=Ha.current;var a=Ry(t,e.type);t!==a&&(ke(_l,e),ke(Ha,a))}function Ys(e){_l.current===e&&(nt(Ha),nt(_l)),Bs.current===e&&(nt(Bs),Vo._currentValue=si)}var qc,$g;function wn(e){if(qc===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);qc=t&&t[1]||"",$g=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+qc+e+$g}var Lc=!1;function Bc(e,t){if(!e||Lc)return"";Lc=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var N=function(){throw Error()};if(Object.defineProperty(N.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(N,[])}catch(A){var f=A}Reflect.construct(e,[],N)}else{try{N.call()}catch(A){f=A}N=!1;try{var y=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),N=!0,new e}finally{N&&(y!==void 0?Object.defineProperty(e.prototype,"props",y):delete e.prototype.props)}}}else{try{throw Error()}catch(A){f=A}(N=e())&&typeof N.catch=="function"&&N.catch(function(){})}}catch(A){if(A&&f&&typeof A.stack=="string")return[A.stack,f.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var l=n.DetermineComponentFrameRoot(),s=l[0],c=l[1];if(s&&c){var h=s.split(`
`),g=c.split(`
`);for(o=n=0;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;for(;o<g.length&&!g[o].includes("DetermineComponentFrameRoot");)o++;if(n===h.length||o===g.length)for(n=h.length-1,o=g.length-1;1<=n&&0<=o&&h[n]!==g[o];)o--;for(;1<=n&&0<=o;n--,o--)if(h[n]!==g[o]){if(n!==1||o!==1)do if(n--,o--,0>o||h[n]!==g[o]){var v=`
`+h[n].replace(" at new "," at ");return e.displayName&&v.includes("<anonymous>")&&(v=v.replace("<anonymous>",e.displayName)),v}while(1<=n&&0<=o);break}}}finally{Lc=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?wn(a):""}function Y1(e,t){switch(e.tag){case 26:case 27:case 5:return wn(e.type);case 16:return wn("Lazy");case 13:return e.child!==t&&t!==null?wn("Suspense Fallback"):wn("Suspense");case 19:return wn("SuspenseList");case 0:case 15:return Bc(e.type,!1);case 11:return Bc(e.type.render,!1);case 1:return Bc(e.type,!0);case 31:return wn("Activity");case 30:return wn("ViewTransition");default:return""}}function Sg(e){try{var t="",a=null;do t+=Y1(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var Ed=Object.prototype.hasOwnProperty,Ah=Xe.unstable_scheduleCallback,Gc=Xe.unstable_cancelCallback,j1=Xe.unstable_shouldYield,I1=Xe.unstable_requestPaint,Gt=Xe.unstable_now,X1=Xe.unstable_getCurrentPriorityLevel,hb=Xe.unstable_ImmediatePriority,mb=Xe.unstable_UserBlockingPriority,js=Xe.unstable_NormalPriority,Q1=Xe.unstable_LowPriority,fb=Xe.unstable_IdlePriority,Z1=Xe.log,K1=Xe.unstable_setDisableYieldValue,Wl=null,Yt=null;function Tn(e){if(typeof Z1=="function"&&K1(e),Yt&&typeof Yt.setStrictMode=="function")try{Yt.setStrictMode(Wl,e)}catch{}}var jt=Math.clz32?Math.clz32:P1,J1=Math.log,F1=Math.LN2;function P1(e){return e>>>=0,e===0?32:31-(J1(e)/F1|0)|0}var as=256,ns=262144,is=4194304;function ni(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function pu(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var o=0,l=e.suspendedLanes,s=e.pingedLanes;e=e.warmLanes;var c=n&134217727;return c!==0?(n=c&~l,n!==0?o=ni(n):(s&=c,s!==0?o=ni(s):a||(a=c&~e,a!==0&&(o=ni(a))))):(c=n&~l,c!==0?o=ni(c):s!==0?o=ni(s):a||(a=n&~e,a!==0&&(o=ni(a)))),o===0?0:t!==0&&t!==o&&(t&l)===0&&(l=o&-o,a=t&-t,l>=a||l===32&&(a&4194048)!==0)?t:o}function er(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function gb(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-jt(a),o=1<<n;t|=e[n],a&=~o}return t}function W1(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function pb(){var e=is;return is<<=1,(is&62914560)===0&&(is=4194304),e}function Yc(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function tr(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function ex(e,t,a,n,o,l){var s=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var c=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=s&~a;0<a;){var v=31-jt(a),N=1<<v;c[v]=0,h[v]=-1;var f=g[v];if(f!==null)for(g[v]=null,v=0;v<f.length;v++){var y=f[v];y!==null&&(y.lane&=-536870913)}a&=~N}n!==0&&bb(e,n,0),l!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=l&~(s&~t))}function bb(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-jt(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function vb(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-jt(a),o=1<<n;o&t|e[n]&t&&(e[n]|=t),a&=~o}}function yb(e,t){var a=t&-t;return a=(a&42)!==0?1:zh(a),(a&(e.suspendedLanes|t))!==0?0:a}function zh(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Mh(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function wb(){var e=se.p;return e!==0?e:(e=window.event,e===void 0?32:tw(e.type))}function Tg(e,t){var a=se.p;try{return se.p=e,t()}finally{se.p=a}}var sn=Math.random().toString(36).slice(2),tt="__reactFiber$"+sn,Rt="__reactProps$"+sn,Ho="__reactContainer$"+sn,Eg="__reactEvents$"+sn,tx="__reactListeners$"+sn,ax="__reactHandles$"+sn,kg="__reactResources$"+sn,ar="__reactMarker$"+sn,Is="__reactLoad$"+sn;function bu(e){delete e[tt],delete e[Rt],delete e[tx],delete e[ax]}function li(e){var t;if(t=e[tt])return t;for(var a=e.parentNode;a;){if(t=a[Ho]||a[tt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=jp(e);e!==null;){if(a=e[tt])return a;e=jp(e)}return t}e=a,a=e.parentNode}return null}function Uo(e){if(e=e[tt]||e[Ho]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function wl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(k(33))}function fo(e){var t=e[kg];return t||(t=e[kg]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function Je(e){e[ar]=!0}function xb(e){e[Is]=void 0}var Nb=new Set,$b={};function Ni(e,t){To(e,t),To(e+"Capture",t)}function To(e,t){for($b[e]=t,e=0;e<t.length;e++)Nb.add(t[e])}var nx=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Cg={},Ag={};function ix(e){return Ed.call(Ag,e)?!0:Ed.call(Cg,e)?!1:nx.test(e)?Ag[e]=!0:(Cg[e]=!0,!1)}var oe=!1;function zg(){var e=oe;return oe=!1,e}function Ns(e,t,a){if(ix(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function os(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function Ka(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,n)}}function Ut(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Sb(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function ox(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(s){a=""+s,l.call(this,s)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(s){a=""+s},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function kd(e){if(!e._valueTracker){var t=Sb(e)?"checked":"value";e._valueTracker=ox(e,t,""+e[t])}}function Tb(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=Sb(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}var lx=/[\n"\\]/g;function aa(e){return e.replace(lx,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Cd(e,t,a,n,o,l,s,c){e.name="",s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?e.type=s:e.removeAttribute("type"),t!=null?s==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Ut(t)):e.value!==""+Ut(t)&&(e.value=""+Ut(t)):s!=="submit"&&s!=="reset"||e.removeAttribute("value"),t!=null?s==="number"&&e.value==t?jc(e,Ut(e.value)):jc(e,Ut(t)):a!=null?jc(e,Ut(a)):n!=null&&e.removeAttribute("value"),o==null&&l!=null&&(e.defaultChecked=!!l),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.name=""+Ut(c):e.removeAttribute("name")}function Eb(e,t,a,n,o,l,s,c){if(l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"&&(e.type=l),t!=null||a!=null){if(!(l!=="submit"&&l!=="reset"||t!=null)){kd(e);return}a=a!=null?""+Ut(a):"",t=t!=null?""+Ut(t):a,c||t===e.value||(e.value=t),e.defaultValue=t}n=n??o,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=c?e.checked:!!n,e.defaultChecked=!!n,s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.name=s),kd(e)}function jc(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function go(e,t,a,n){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&n&&(e[a].defaultSelected=!0)}else{for(a=""+Ut(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,n&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function kb(e,t,a){if(t!=null&&(t=""+Ut(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+Ut(a):""}function Cb(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(k(92));if(yl(n)){if(1<n.length)throw Error(k(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=Ut(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),kd(e)}function Eo(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var rx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Mg(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||rx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Ab(e,t,a){if(t!=null&&typeof t!="object")throw Error(k(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="",oe=!0);for(var o in t)n=t[o],t.hasOwnProperty(o)&&a[o]!==n&&(Mg(e,o,n),oe=!0)}else for(var l in t)t.hasOwnProperty(l)&&Mg(e,l,t[l])}function Oh(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var sx=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),ux=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function $s(e){return ux.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Va(){}var Ad=null;function Rh(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var io=null,po=null;function Og(e){var t=Uo(e);if(t&&(e=t.stateNode)){var a=e[Rt]||null;e:switch(e=t.stateNode,t.type){case"input":if(Cd(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+aa(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var o=n[Rt]||null;if(!o)throw Error(k(90));Cd(n,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&Tb(n)}break e;case"textarea":kb(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&go(e,!!a.multiple,t,!1)}}}var Ic=!1;function zb(e,t,a){if(Ic)return e(t,a);Ic=!0;try{var n=e(t);return n}finally{if(Ic=!1,(io!==null||po!==null)&&(Mu(),io&&(t=io,e=po,po=io=null,Og(t),e)))for(t=0;t<e.length;t++)Og(e[t])}}function Hl(e,t){var a=e.stateNode;if(a===null)return null;var n=a[Rt]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(k(231,t,typeof a));return a}var tn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),zd=!1;if(tn)try{Ki={},Object.defineProperty(Ki,"passive",{get:function(){zd=!0}}),window.addEventListener("test",Ki,Ki),window.removeEventListener("test",Ki,Ki)}catch{zd=!1}var Ki,En=null,Vh=null,Ss=null;function Mb(){if(Ss)return Ss;var e,t=Vh,a=t.length,n,o="value"in En?En.value:En.textContent,l=o.length;for(e=0;e<a&&t[e]===o[e];e++);var s=a-e;for(n=1;n<=s&&t[a-n]===o[l-n];n++);return Ss=o.slice(e,1<n?1-n:void 0)}function Ts(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function ls(){return!0}function Rg(){return!1}function xt(e){function t(a,n,o,l,s){this._reactName=a,this._targetInst=o,this.type=n,this.nativeEvent=l,this.target=s,this.currentTarget=null;for(var c in e)e.hasOwnProperty(c)&&(a=e[c],this[c]=a?a(l):l[c]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?ls:Rg,this.isPropagationStopped=Rg,this}return we(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=ls)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=ls)},persist:function(){},isPersistent:ls}),t}var Xn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},vu=xt(Xn),nr=we({},Xn,{view:0,detail:0}),cx=xt(nr),Xc,Qc,ml,yu=we({},nr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Dh,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==ml&&(ml&&e.type==="mousemove"?(Xc=e.screenX-ml.screenX,Qc=e.screenY-ml.screenY):Qc=Xc=0,ml=e),Xc)},movementY:function(e){return"movementY"in e?e.movementY:Qc}}),Vg=xt(yu),dx=we({},yu,{dataTransfer:0}),hx=xt(dx),mx=we({},nr,{relatedTarget:0}),Zc=xt(mx),fx=we({},Xn,{animationName:0,elapsedTime:0,pseudoElement:0}),gx=xt(fx),px=we({},Xn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),bx=xt(px),vx=we({},Xn,{data:0}),Dg=xt(vx),yx={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},wx={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},xx={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Nx(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=xx[e])?!!t[e]:!1}function Dh(){return Nx}var $x=we({},nr,{key:function(e){if(e.key){var t=yx[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Ts(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?wx[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Dh,charCode:function(e){return e.type==="keypress"?Ts(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Ts(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Sx=xt($x),Tx=we({},yu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),_g=xt(Tx),Ex=we({},Xn,{submitter:0}),kx=xt(Ex),Cx=we({},nr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Dh}),Ax=xt(Cx),zx=we({},Xn,{propertyName:0,elapsedTime:0,pseudoElement:0}),Mx=xt(zx),Ox=we({},yu,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Rx=xt(Ox),Vx=we({},Xn,{newState:0,oldState:0,source:0}),Dx=xt(Vx),_x=[9,13,27,32],_h=tn&&"CompositionEvent"in window,$l=null;tn&&"documentMode"in document&&($l=document.documentMode);var Hx=tn&&"TextEvent"in window&&!$l,Ob=tn&&(!_h||$l&&8<$l&&11>=$l),Hg=" ",Ug=!1;function Rb(e,t){switch(e){case"keyup":return _x.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Vb(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var oo=!1;function Ux(e,t){switch(e){case"compositionend":return Vb(t);case"keypress":return t.which!==32?null:(Ug=!0,Hg);case"textInput":return e=t.data,e===Hg&&Ug?null:e;default:return null}}function qx(e,t){if(oo)return e==="compositionend"||!_h&&Rb(e,t)?(e=Mb(),Ss=Vh=En=null,oo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Ob&&t.locale!=="ko"?null:t.data;default:return null}}var Lx={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function qg(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Lx[e.type]:t==="textarea"}function Db(e,t,a,n){io?po?po.push(n):po=[n]:io=n,t=mu(t,"onChange"),0<t.length&&(a=new vu("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var Sl=null,Ul=null;function Bx(e){zy(e,0)}function wu(e){var t=wl(e);if(Tb(t))return e}function Lg(e,t){if(e==="change")return t}var _b=!1;tn&&(tn?(ss="oninput"in document,ss||(Kc=document.createElement("div"),Kc.setAttribute("oninput","return;"),ss=typeof Kc.oninput=="function"),rs=ss):rs=!1,_b=rs&&(!document.documentMode||9<document.documentMode));var rs,ss,Kc;function Bg(){Sl&&(Sl.detachEvent("onpropertychange",Hb),Ul=Sl=null)}function Hb(e){if(e.propertyName==="value"&&wu(Ul)){var t=[];Db(t,Ul,e,Rh(e)),zb(Bx,t)}}function Gx(e,t,a){e==="focusin"?(Bg(),Sl=t,Ul=a,Sl.attachEvent("onpropertychange",Hb)):e==="focusout"&&Bg()}function Yx(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return wu(Ul)}function jx(e,t){if(e==="click")return wu(t)}function Ix(e,t){if(e==="input"||e==="change")return wu(t)}function Xx(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Xt=typeof Object.is=="function"?Object.is:Xx;function ql(e,t){if(Xt(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var o=a[n];if(!Ed.call(t,o)||!Xt(e[o],t[o]))return!1}return!0}function Md(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Gg(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Yg(e,t){var a=Gg(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Gg(a)}}function Ub(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Ub(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function qb(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Md(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=Md(e.document)}return t}function Hh(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Qx=tn&&"documentMode"in document&&11>=document.documentMode,lo=null,Od=null,Tl=null,Rd=!1;function jg(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Rd||lo==null||lo!==Md(n)||(n=lo,"selectionStart"in n&&Hh(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),Tl&&ql(Tl,n)||(Tl=n,n=mu(Od,"onSelect"),0<n.length&&(t=new vu("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=lo)))}function ti(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var ro={animationend:ti("Animation","AnimationEnd"),animationiteration:ti("Animation","AnimationIteration"),animationstart:ti("Animation","AnimationStart"),transitionrun:ti("Transition","TransitionRun"),transitionstart:ti("Transition","TransitionStart"),transitioncancel:ti("Transition","TransitionCancel"),transitionend:ti("Transition","TransitionEnd")},Jc={},Lb={};tn&&(Lb=document.createElement("div").style,"AnimationEvent"in window||(delete ro.animationend.animation,delete ro.animationiteration.animation,delete ro.animationstart.animation),"TransitionEvent"in window||delete ro.transitionend.transition);function $i(e){if(Jc[e])return Jc[e];if(!ro[e])return e;var t=ro[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in Lb)return Jc[e]=t[a];return e}var Bb=$i("animationend"),Gb=$i("animationiteration"),Yb=$i("animationstart"),Zx=$i("transitionrun"),Kx=$i("transitionstart"),Jx=$i("transitioncancel"),jb=$i("transitionend"),Ib=new Map,Vd="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Vd.push("scrollEnd");function va(e,t){Ib.set(e,t),Ni(t,[e])}var Fx=0;function an(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=ba.identifierPrefix;var a=Fx++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function Ig(e){if(e==null||typeof e=="string")return e;var t=null,a=$o;if(a!==null)for(var n=0;n<a.length;n++){var o=e[a[n]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function un(e,t){return e=Ig(e),t=Ig(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Xs=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Wt=[],so=0,Uh=0;function xu(){for(var e=so,t=Uh=so=0;t<e;){var a=Wt[t];Wt[t++]=null;var n=Wt[t];Wt[t++]=null;var o=Wt[t];Wt[t++]=null;var l=Wt[t];if(Wt[t++]=null,n!==null&&o!==null){var s=n.pending;s===null?o.next=o:(o.next=s.next,s.next=o),n.pending=o}l!==0&&Xb(a,o,l)}}function Nu(e,t,a,n){Wt[so++]=e,Wt[so++]=t,Wt[so++]=a,Wt[so++]=n,Uh|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function qh(e,t,a,n){return Nu(e,t,a,n),Qs(e)}function Si(e,t){return Nu(e,null,null,t),Qs(e)}function Xb(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var o=!1,l=e.return;l!==null;)l.childLanes|=a,n=l.alternate,n!==null&&(n.childLanes|=a),l.tag===22&&(e=l.stateNode,e===null||e._visibility&1||(o=!0)),e=l,l=l.return;return e.tag===3?(l=e.stateNode,o&&t!==null&&(o=31-jt(a),e=l.hiddenUpdates,n=e[o],n===null?e[o]=[t]:n.push(t),t.lane=a|536870912),l):null}function Qs(e){if(50<Dl)throw Dl=0,Ds=null,Error(k(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var uo={};function Px(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function zt(e,t,a,n){return new Px(e,t,a,n)}function Lh(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Wa(e,t){var a=e.alternate;return a===null?(a=zt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Qb(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Es(e,t,a,n,o,l){var s=0;if(n=e,typeof n=="function")Lh(n)&&(s=1);else if(typeof n=="string")s=S$(e,a,Ha.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(n){case xd:return e=zt(31,a,t,o),e.elementType=xd,e.lanes=l,e;case ao:return ui(a.children,o,l,t);case cb:s=8,o|=24;break;case vd:return e=zt(12,a,t,o|2),e.elementType=vd,e.lanes=l,e;case yd:return e=zt(13,a,t,o),e.elementType=yd,e.lanes=l,e;case wd:return e=zt(19,a,t,o),e.elementType=wd,e.lanes=l,e;case q1:case Nd:return e=o|32,e=zt(30,a,t,e),e.elementType=Nd,e.lanes=l,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case Ra:s=10;break e;case db:s=9;break e;case kh:s=11;break e;case Ch:s=14;break e;case Nn:s=16,n=null;break e}s=29,a=Error(k(130,e===null?"null":typeof e,"")),n=null}return t=zt(s,a,t,o),t.elementType=e,t.type=n,t.lanes=l,t}function ui(e,t,a,n){return e=zt(7,e,n,t),e.lanes=a,e}function Fc(e,t,a){return e=zt(6,e,null,t),e.lanes=a,e}function Zb(e){var t=zt(18,null,null,0);return t.stateNode=e,t}function Pc(e,t,a){return t=zt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Xg=new WeakMap;function na(e,t){if(typeof e=="object"&&e!==null){var a=Xg.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Sg(t)},Xg.set(e,t),t)}return{value:e,source:t,stack:Sg(t)}}var co=[],ho=0,Zs=null,Ll=0,ea=[],ta=0,Bn=null,Da=1,_a="";function Fa(e,t){co[ho++]=Ll,co[ho++]=Zs,Zs=e,Ll=t}function Kb(e,t,a){ea[ta++]=Da,ea[ta++]=_a,ea[ta++]=Bn,Bn=e;var n=Da;e=_a;var o=32-jt(n)-1;n&=~(1<<o),a+=1;var l=32-jt(t)+o;if(30<l){var s=o-o%5;l=(n&(1<<s)-1).toString(32),n>>=s,o-=s,Da=1<<32-jt(t)+o|a<<o|n,_a=l+e}else Da=1<<l|a<<o|n,_a=e}function $u(e){e.return!==null&&(Fa(e,1),Kb(e,1,0))}function Bh(e){for(;e===Zs;)Zs=co[--ho],co[ho]=null,Ll=co[--ho],co[ho]=null;for(;e===Bn;)Bn=ea[--ta],ea[ta]=null,_a=ea[--ta],ea[ta]=null,Da=ea[--ta],ea[ta]=null}function Jb(e,t){ea[ta++]=Da,ea[ta++]=_a,ea[ta++]=Bn,Da=t.id,_a=t.overflow,Bn=e}var Fe=null,Ee=null,P=!1,On=null,ia=!1,Dd=Error(k(519));function Gn(e){var t=Error(k(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Bl(na(t,e)),Dd}function Qg(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[tt]=e,t[Rt]=n,a){case"dialog":W("cancel",t),W("close",t);break;case"iframe":case"object":case"embed":W("load",t);break;case"video":case"audio":for(a=0;a<Il.length;a++)W(Il[a],t);break;case"source":W("error",t);break;case"img":case"image":case"link":W("error",t),W("load",t);break;case"details":W("toggle",t);break;case"input":W("invalid",t),Eb(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":W("invalid",t);break;case"textarea":W("invalid",t),Cb(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||Oy(t.textContent,a)?(n.popover!=null&&(W("beforetoggle",t),W("toggle",t)),n.onScroll!=null&&W("scroll",t),n.onScrollEnd!=null&&W("scrollend",t),n.onClick!=null&&(t.onclick=Va),t=!0):t=!1,t||Gn(e,!0)}function Ks(e){for(Fe=e.return;Fe;)switch(Fe.tag){case 5:case 31:case 13:ia=!1;return;case 27:case 3:ia=!0;return;default:Fe=Fe.return}}function Ji(e){if(e!==Fe)return!1;if(!P)return Ks(e),P=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||yh(e.type,e.memoizedProps)),a=!a),a&&Ee&&Gn(e),Ks(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(k(317));Ee=Yp(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(k(317));Ee=Yp(e)}else t===27?(t=Ee,Qn(e.type)?(e=$h,$h=null,Ee=e):Ee=t):Ee=Fe?oa(e.stateNode.nextSibling):null;return!0}function mi(){Ee=Fe=null,P=!1}function Wc(){var e=On;return e!==null&&(Ct===null?Ct=e:Ct.push.apply(Ct,e),On=null),e}function Bl(e){On===null?On=[e]:On.push(e)}var _d=La(null),Ti=null,Pa=null;function kn(e,t,a){ke(_d,t._currentValue),t._currentValue=a}function en(e){e._currentValue=_d.current,nt(_d)}function ks(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function Hd(e,t,a,n){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var l=o.dependencies;if(l!==null){var s=o.child;l=l.firstContext;e:for(;l!==null;){var c=l;l=o;for(var h=0;h<t.length;h++)if(c.context===t[h]){l.lanes|=a,c=l.alternate,c!==null&&(c.lanes|=a),ks(l.return,a,e),n||(s=null);break e}l=c.next}}else if(o.tag===18){if(s=o.return,s===null)throw Error(k(341));s.lanes|=a,l=s.alternate,l!==null&&(l.lanes|=a),ks(s,a,e),s=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,s=o.alternate,s!==null&&(s.lanes|=a),ks(o.return,a,e),s=o.child,s=s!==null?s.sibling:null):s=o.child;if(s!==null)s.return=o;else for(s=o;s!==null;){if(s===e){s=null;break}if(o=s.sibling,o!==null){o.return=s.return,s=o;break}s=s.return}o=s}}function fi(e,t,a,n){e=null;for(var o=t,l=!1;o!==null;){if(!l){if((o.flags&524288)!==0)l=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var s=o.alternate;if(s===null)throw Error(k(387));if(s=s.memoizedProps,s!==null){var c=o.type;Xt(o.pendingProps.value,s.value)||(e!==null?e.push(c):e=[c])}}else if(o===Bs.current){if(s=o.alternate,s===null)throw Error(k(387));s.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(Vo):e=[Vo])}o=o.return}return e!==null&&Hd(t,e,a,n),t.flags|=262144,e!==null}function Js(e){for(e=e.firstContext;e!==null;){if(!Xt(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function gi(e){Ti=e,Pa=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function at(e){return Fb(Ti,e)}function us(e,t){return Ti===null&&gi(e),Fb(e,t)}function Fb(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},Pa===null){if(e===null)throw Error(k(308));Pa=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Pa=Pa.next=t;return a}var Wx=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},eN=Xe.unstable_scheduleCallback,tN=Xe.unstable_NormalPriority,Le={$$typeof:Ra,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Gh(){return{controller:new Wx,data:new Map,refCount:0}}function ir(e){e.refCount--,e.refCount===0&&eN(tN,function(){e.controller.abort()})}function Zg(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var n=t[e];a.indexOf(n)===-1&&a.push(n)}}}var xl=null;function aN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var El=null,Ud=0,pi=0,bo=null;function nN(e,t){if(El===null){var a=El=[];Ud=0,pi=pm(),bo={status:"pending",value:void 0,then:function(n){a.push(n)}}}return Ud++,t.then(Kg,Kg),t}function Kg(){if(--Ud===0&&(xl=null,El!==null)){bo!==null&&(bo.status="fulfilled");var e=El;El=null,pi=0,bo=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function iN(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(n.status="rejected",n.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),n}var Jg=j.S;j.S=function(e,t){if(gy=Gt(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&nN(e,t),xl!==null)for(var a=Mo;a!==null;)Zg(a,xl),a=a.next;if(a=e.types,a!==null){for(var n=Mo;n!==null;)Zg(n,a),n=n.next;if(pi!==0){n=xl,n===null&&(n=xl=[]);for(var o=0;o<a.length;o++){var l=a[o];n.indexOf(l)===-1&&n.push(l)}}}Jg!==null&&Jg(e,t)};var ci=La(null);function Yh(){var e=ci.current;return e!==null?e:ye.pooledCache}function Cs(e,t){t===null?ke(ci,ci.current):ke(ci,t.pool)}function Pb(){var e=Yh();return e===null?null:{parent:Le._currentValue,pool:e}}var qo=Error(k(460)),jh=Error(k(474)),Su=Error(k(542)),Fs={then:function(){}};function Fg(e){return e=e.status,e==="fulfilled"||e==="rejected"}function Wb(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(Va,Va),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Wg(e),e===void 0&&!("reason"in t)?Error(k(600)):e;default:if(typeof t.status=="string")t.then(Va,Va);else{if(e=ye,e!==null&&100<e.shellSuspendCounter)throw Error(k(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=n}},function(n){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Wg(e),e}throw di=t,qo}}function ii(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(di=a,qo):a}}var di=null;function Pg(){if(di===null)throw Error(k(459));var e=di;return di=null,e}function Wg(e){if(e===qo||e===Su)throw Error(k(483))}var vo=null,Gl=0;function cs(e){var t=Gl;return Gl+=1,vo===null&&(vo=[]),Wb(vo,e,t)}function yn(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function ds(e,t){throw t.$$typeof===U1?Error(k(525)):(e=Object.prototype.toString.call(t),Error(k(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function ev(e){function t(b,p){if(e){var x=b.deletions;x===null?(b.deletions=[p],b.flags|=16):x.push(p)}}function a(b,p){if(!e)return null;for(;p!==null;)t(b,p),p=p.sibling;return null}function n(b){for(var p=new Map;b!==null;)b.key===null?p.set(b.index,b):p.set(b.key,b),b=b.sibling;return p}function o(b,p){return b=Wa(b,p),b.index=0,b.sibling=null,b}function l(b,p,x){return b.index=x,e?(x=b.alternate,x!==null?(x=x.index,x<p?(b.flags|=2,p):x):(b.flags|=134217730,p)):(b.flags|=1048576,p)}function s(b){return e&&b.alternate===null&&(b.flags|=134217730),b}function c(b,p,x,T){return p===null||p.tag!==6?(p=Fc(x,b.mode,T),p.return=b,p):(p=o(p,x),p.return=b,p)}function h(b,p,x,T){var z=x.type;return z===ao?(b=v(b,p,x.props.children,T,x.key),yn(b,x),b):p!==null&&(p.elementType===z||typeof z=="object"&&z!==null&&z.$$typeof===Nn&&ii(z)===p.type)?(p=o(p,x.props),yn(p,x),p.return=b,p):(p=Es(x.type,x.key,x.props,null,b.mode,T),yn(p,x),p.return=b,p)}function g(b,p,x,T){return p===null||p.tag!==4||p.stateNode.containerInfo!==x.containerInfo||p.stateNode.implementation!==x.implementation?(p=Pc(x,b.mode,T),p.return=b,p):(p=o(p,x.children||[]),p.return=b,p)}function v(b,p,x,T,z){return p===null||p.tag!==7?(p=ui(x,b.mode,T,z),p.return=b,p):(p=o(p,x),p.return=b,p)}function N(b,p,x){if(typeof p=="string"&&p!==""||typeof p=="number"||typeof p=="bigint")return p=Fc(""+p,b.mode,x),p.return=b,p;if(typeof p=="object"&&p!==null){switch(p.$$typeof){case ts:return x=Es(p.type,p.key,p.props,null,b.mode,x),yn(x,p),x.return=b,x;case vl:return p=Pc(p,b.mode,x),p.return=b,p;case Nn:return p=ii(p),N(b,p,x)}if(yl(p)||hl(p))return p=ui(p,b.mode,x,null),p.return=b,p;if(typeof p.then=="function")return N(b,cs(p),x);if(p.$$typeof===Ra)return N(b,us(b,p),x);ds(b,p)}return null}function f(b,p,x,T){var z=p!==null?p.key:null;if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return z!==null?null:c(b,p,""+x,T);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case ts:return x.key===z?h(b,p,x,T):null;case vl:return x.key===z?g(b,p,x,T):null;case Nn:return x=ii(x),f(b,p,x,T)}if(yl(x)||hl(x))return z!==null?null:v(b,p,x,T,null);if(typeof x.then=="function")return f(b,p,cs(x),T);if(x.$$typeof===Ra)return f(b,p,us(b,x),T);ds(b,x)}return null}function y(b,p,x,T,z){if(typeof T=="string"&&T!==""||typeof T=="number"||typeof T=="bigint")return b=b.get(x)||null,c(p,b,""+T,z);if(typeof T=="object"&&T!==null){switch(T.$$typeof){case ts:return b=b.get(T.key===null?x:T.key)||null,h(p,b,T,z);case vl:return b=b.get(T.key===null?x:T.key)||null,g(p,b,T,z);case Nn:return T=ii(T),y(b,p,x,T,z)}if(yl(T)||hl(T))return b=b.get(x)||null,v(p,b,T,z,null);if(typeof T.then=="function")return y(b,p,x,cs(T),z);if(T.$$typeof===Ra)return y(b,p,x,us(p,T),z);ds(p,T)}return null}function A(b,p,x,T){for(var z=null,I=null,_=p,q=p=0,ae=null;_!==null&&q<x.length;q++){_.index>q?(ae=_,_=null):ae=_.sibling;var M=f(b,_,x[q],T);if(M===null){_===null&&(_=ae);break}e&&_&&M.alternate===null&&t(b,_),p=l(M,p,q),I===null?z=M:I.sibling=M,I=M,_=ae}if(q===x.length)return a(b,_),P&&Fa(b,q),z;if(_===null){for(;q<x.length;q++)_=N(b,x[q],T),_!==null&&(p=l(_,p,q),I===null?z=_:I.sibling=_,I=_);return P&&Fa(b,q),z}for(_=n(_);q<x.length;q++)ae=y(_,b,q,x[q],T),ae!==null&&(e&&(M=ae.alternate,M!==null&&_.delete(M.key===null?q:M.key)),p=l(ae,p,q),I===null?z=ae:I.sibling=ae,I=ae);return e&&_.forEach(function(he){return t(b,he)}),P&&Fa(b,q),z}function S(b,p,x,T){if(x==null)throw Error(k(151));for(var z=null,I=null,_=p,q=p=0,ae=null,M=x.next();_!==null&&!M.done;q++,M=x.next()){_.index>q?(ae=_,_=null):ae=_.sibling;var he=f(b,_,M.value,T);if(he===null){_===null&&(_=ae);break}e&&_&&he.alternate===null&&t(b,_),p=l(he,p,q),I===null?z=he:I.sibling=he,I=he,_=ae}if(M.done)return a(b,_),P&&Fa(b,q),z;if(_===null){for(;!M.done;q++,M=x.next())M=N(b,M.value,T),M!==null&&(p=l(M,p,q),I===null?z=M:I.sibling=M,I=M);return P&&Fa(b,q),z}for(_=n(_);!M.done;q++,M=x.next())M=y(_,b,q,M.value,T),M!==null&&(e&&(ae=M.alternate,ae!==null&&_.delete(ae.key===null?q:ae.key)),p=l(M,p,q),I===null?z=M:I.sibling=M,I=M);return e&&_.forEach(function(rt){return t(b,rt)}),P&&Fa(b,q),z}function V(b,p,x,T){if(typeof x=="object"&&x!==null&&x.type===ao&&x.key===null&&x.props.ref===void 0&&(x=x.props.children),typeof x=="object"&&x!==null){switch(x.$$typeof){case ts:e:{for(var z=x.key;p!==null;){if(p.key===z){if(z=x.type,z===ao){if(p.tag===7){a(b,p.sibling),T=o(p,x.props.children),yn(T,x),T.return=b,b=T;break e}}else if(p.elementType===z||typeof z=="object"&&z!==null&&z.$$typeof===Nn&&ii(z)===p.type){a(b,p.sibling),T=o(p,x.props),yn(T,x),T.return=b,b=T;break e}a(b,p);break}else t(b,p);p=p.sibling}x.type===ao?(T=ui(x.props.children,b.mode,T,x.key),yn(T,x),T.return=b,b=T):(T=Es(x.type,x.key,x.props,null,b.mode,T),yn(T,x),T.return=b,b=T)}return s(b);case vl:e:{for(z=x.key;p!==null;){if(p.key===z)if(p.tag===4&&p.stateNode.containerInfo===x.containerInfo&&p.stateNode.implementation===x.implementation){a(b,p.sibling),T=o(p,x.children||[]),T.return=b,b=T;break e}else{a(b,p);break}else t(b,p);p=p.sibling}T=Pc(x,b.mode,T),T.return=b,b=T}return s(b);case Nn:return x=ii(x),V(b,p,x,T)}if(yl(x))return A(b,p,x,T);if(hl(x)){if(z=hl(x),typeof z!="function")throw Error(k(150));return x=z.call(x),S(b,p,x,T)}if(typeof x.then=="function")return V(b,p,cs(x),T);if(x.$$typeof===Ra)return V(b,p,us(b,x),T);ds(b,x)}return typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint"?(x=""+x,p!==null&&p.tag===6?(a(b,p.sibling),T=o(p,x),T.return=b,b=T):(a(b,p),T=Fc(x,b.mode,T),T.return=b,b=T),s(b)):a(b,p)}return function(b,p,x,T){try{Gl=0;var z=V(b,p,x,T);return vo=null,z}catch(_){if(_===qo||_===Su)throw _;var I=zt(29,_,null,b.mode);return I.lanes=T,I.return=b,I}}}var bi=ev(!0),tv=ev(!1),$n=!1;function Ih(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function qd(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Rn(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Vn(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,(re&2)!==0){var o=n.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),n.pending=t,t=Qs(e),Xb(e,null,a),t}return Nu(e,n,t,a),Qs(e)}function kl(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,vb(e,a)}}function ed(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var o=null,l=null;if(a=a.firstBaseUpdate,a!==null){do{var s={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};l===null?o=l=s:l=l.next=s,a=a.next}while(a!==null);l===null?o=l=t:l=l.next=t}else o=l=t;a={baseState:n.baseState,firstBaseUpdate:o,lastBaseUpdate:l,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var Ld=!1;function Cl(){if(Ld){var e=bo;if(e!==null)throw e}}function Al(e,t,a,n){Ld=!1;var o=e.updateQueue;$n=!1;var l=o.firstBaseUpdate,s=o.lastBaseUpdate,c=o.shared.pending;if(c!==null){o.shared.pending=null;var h=c,g=h.next;h.next=null,s===null?l=g:s.next=g,s=h;var v=e.alternate;v!==null&&(v=v.updateQueue,c=v.lastBaseUpdate,c!==s&&(c===null?v.firstBaseUpdate=g:c.next=g,v.lastBaseUpdate=h))}if(l!==null){var N=o.baseState;s=0,v=g=h=null,c=l;do{var f=c.lane&-536870913,y=f!==c.lane;if(y?(te&f)===f:(n&f)===f){f!==0&&f===pi&&(Ld=!0),v!==null&&(v=v.next={lane:0,tag:c.tag,payload:c.payload,callback:null,next:null});e:{var A=e,S=c;f=t;var V=a;switch(S.tag){case 1:if(A=S.payload,typeof A=="function"){N=A.call(V,N,f);break e}N=A;break e;case 3:A.flags=A.flags&-65537|128;case 0:if(A=S.payload,f=typeof A=="function"?A.call(V,N,f):A,f==null)break e;N=we({},N,f);break e;case 2:$n=!0}}f=c.callback,f!==null&&(e.flags|=64,y&&(e.flags|=8192),y=o.callbacks,y===null?o.callbacks=[f]:y.push(f))}else y={lane:f,tag:c.tag,payload:c.payload,callback:c.callback,next:null},v===null?(g=v=y,h=N):v=v.next=y,s|=f;if(c=c.next,c===null){if(c=o.shared.pending,c===null)break;y=c,c=y.next,y.next=null,o.lastBaseUpdate=y,o.shared.pending=null}}while(!0);v===null&&(h=N),o.baseState=h,o.firstBaseUpdate=g,o.lastBaseUpdate=v,l===null&&(o.shared.lanes=0),In|=s,e.lanes=s,e.memoizedState=N}}function av(e,t){if(typeof e!="function")throw Error(k(191,e));e.call(t)}function nv(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)av(a[e],t)}var Yn=La(null),Ps=La(0);function ep(e,t){e=rn,ke(Ps,e),ke(Yn,t),rn=e|t.baseLanes}function Bd(){ke(Ps,rn),ke(Yn,Yn.current)}function Xh(){rn=Ps.current,nt(Yn),nt(Ps)}var lt=La(null),ft=null;function Dn(e){var t=e.alternate;ke(it,it.current&1),ke(lt,e),ft===null&&(t===null||Yn.current!==null||t.memoizedState!==null)&&(ft=e)}function Gd(e){ke(it,it.current),ke(lt,e),ft===null&&(ft=e)}function iv(e){e.tag===22?(ke(it,it.current),ke(lt,e),ft===null&&(ft=e)):_n()}function _n(){ke(it,it.current),ke(lt,lt.current)}function qt(e){nt(lt),ft===e&&(ft=null),nt(it)}var it=La(0);function Yl(e,t){ke(lt,lt.current),ke(it,t)}function Qh(e){nt(it),nt(lt),ft===e&&(ft=null)}function Ws(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Nh(a)||wm(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var nn=0,J=null,ve=null,qe=null,eu=!1,yo=!1,vi=!1,tu=0,jl=0,wo=null,oN=0;function De(){throw Error(k(321))}function Zh(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!Xt(e[a],t[a]))return!1;return!0}function Kh(e,t,a,n,o,l){return nn=l,J=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,j.H=e===null||e.memoizedState===null?Dv:_v,vi=!1,l=a(n,o),vi=!1,yo&&(l=lv(t,a,n,o)),ov(e),l}function ov(e){j.H=au;var t=ve!==null&&ve.next!==null;if(nn=0,qe=ve=J=null,eu=!1,jl=0,wo=null,t)throw Error(k(300));e===null||Be||(e=e.dependencies,e!==null&&Js(e)&&(Be=!0))}function lv(e,t,a,n){J=e;var o=0;do{if(yo&&(wo=null),jl=0,yo=!1,25<=o)throw Error(k(301));if(o+=1,qe=ve=null,e.updateQueue!=null){var l=e.updateQueue;l.lastEffect=null,l.events=null,l.stores=null,l.memoCache!=null&&(l.memoCache.index=0)}j.H=mN,l=t(a,n)}while(yo);return l}function lN(){var e=j.H,t=e.useState()[0];return t=typeof t.then=="function"?or(t):t,e=e.useState()[0],(ve!==null?ve.memoizedState:null)!==e&&(J.flags|=1024),t}function Jh(){var e=tu!==0;return tu=0,e}function Fh(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Ph(e){if(eu){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}eu=!1}nn=0,qe=ve=J=null,yo=!1,jl=tu=0,wo=null}function wt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return qe===null?J.memoizedState=qe=e:qe=qe.next=e,qe}function He(){if(ve===null){var e=J.alternate;e=e!==null?e.memoizedState:null}else e=ve.next;var t=qe===null?J.memoizedState:qe.next;if(t!==null)qe=t,ve=e;else{if(e===null)throw J.alternate===null?Error(k(467)):Error(k(310));ve=e,e={memoizedState:ve.memoizedState,baseState:ve.baseState,baseQueue:ve.baseQueue,queue:ve.queue,next:null},qe===null?J.memoizedState=qe=e:qe=qe.next=e}return qe}function Tu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function or(e){var t=jl;return jl+=1,wo===null&&(wo=[]),e=Wb(wo,e,t),t=J,(qe===null?t.memoizedState:qe.next)===null&&(t=t.alternate,j.H=t===null||t.memoizedState===null?Dv:_v),e}function Eu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return or(e);if(e.$$typeof===B1)return;if(e.$$typeof===Ra)return at(e)}throw Error(k(438,String(e)))}function Wh(e){var t=null,a=J.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=J.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=Tu(),J.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=L1;return t.index++,a}function on(e,t){return typeof t=="function"?t(e):t}function As(e){var t=He();return em(t,ve,e)}function em(e,t,a){var n=e.queue;if(n===null)throw Error(k(311));n.lastRenderedReducer=a;var o=e.baseQueue,l=n.pending;if(l!==null){if(o!==null){var s=o.next;o.next=l.next,l.next=s}t.baseQueue=o=l,n.pending=null}if(l=e.baseState,o===null)e.memoizedState=l;else{t=o.next;var c=s=null,h=null,g=t,v=!1;do{var N=g.lane&-536870913;if(N!==g.lane?(te&N)===N:(nn&N)===N){var f=g.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),N===pi&&(v=!0);else if((nn&f)===f){g=g.next,f===pi&&(v=!0);continue}else N={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(c=h=N,s=l):h=h.next=N,J.lanes|=f,In|=f;N=g.action,vi&&a(l,N),l=g.hasEagerState?g.eagerState:a(l,N)}else f={lane:N,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(c=h=f,s=l):h=h.next=f,J.lanes|=N,In|=N;g=g.next}while(g!==null&&g!==t);if(h===null?s=l:h.next=c,!Xt(l,e.memoizedState)&&(Be=!0,v&&(a=bo,a!==null)))throw a;e.memoizedState=l,e.baseState=s,e.baseQueue=h,n.lastRenderedState=l}return o===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function td(e){var t=He(),a=t.queue;if(a===null)throw Error(k(311));a.lastRenderedReducer=e;var n=a.dispatch,o=a.pending,l=t.memoizedState;if(o!==null){a.pending=null;var s=o=o.next;do l=e(l,s.action),s=s.next;while(s!==o);Xt(l,t.memoizedState)||(Be=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),a.lastRenderedState=l}return[l,n]}function rv(e,t,a){var n=J,o=He(),l=P;if(l){if(a===void 0)throw Error(k(407));a=a()}else a=t();var s=!Xt((ve||o).memoizedState,a);if(s&&(o.memoizedState=a,Be=!0),o=o.queue,tm(cv.bind(null,n,o,e),[e]),e=o.getSnapshot!==t||s||qe!==null&&(qe.memoizedState.tag&1)!==0,ko(e?9:8,{destroy:void 0},uv.bind(null,n,o,a,t),null),e){if(n.flags|=2048,ye===null)throw Error(k(349));l||(nn&127)!==0||sv(n,t,a)}return a}function sv(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=J.updateQueue,t===null?(t=Tu(),J.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function uv(e,t,a,n){t.value=a,t.getSnapshot=n,dv(t)&&hv(e)}function cv(e,t,a){return a(function(){dv(t)&&hv(e)})}function dv(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!Xt(e,a)}catch{return!0}}function hv(e){var t=Si(e,2);t!==null&&Mt(t,e,2)}function Yd(e){var t=wt();if(typeof e=="function"){var a=e;if(e=a(),vi){Tn(!0);try{a()}finally{Tn(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:on,lastRenderedState:e},t}function mv(e,t,a,n){return e.baseState=a,em(e,ve,typeof n=="function"?n:on)}function rN(e,t,a,n,o){if(Cu(e))throw Error(k(485));if(e=t.action,e!==null){var l={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(s){l.listeners.push(s)}};j.T!==null?a(!0):l.isTransition=!1,n(l),a=t.pending,a===null?(l.next=t.pending=l,fv(t,l)):(l.next=a.next,t.pending=a.next=l)}}function fv(e,t){var a=t.action,n=t.payload,o=e.state;if(t.isTransition){var l=j.T,s={};s.types=l!==null?l.types:null,j.T=s;try{var c=a(o,n),h=j.S;h!==null&&h(s,c),tp(e,t,c)}catch(g){jd(e,t,g)}finally{l!==null&&s.types!==null&&(l.types=s.types),j.T=l}}else try{l=a(o,n),tp(e,t,l)}catch(g){jd(e,t,g)}}function tp(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){ap(e,t,n)},function(n){return jd(e,t,n)}):ap(e,t,a)}function ap(e,t,a){t.status="fulfilled",t.value=a,gv(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,fv(e,a)))}function jd(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,gv(t),t=t.next;while(t!==n)}e.action=null}function gv(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function pv(e,t){return t}function np(e,t){if(P){var a=ye.formState;if(a!==null){e:{var n=J;if(P){if(Ee){t:{for(var o=Ee,l=ia;o.nodeType!==8;){if(!l){o=null;break t}if(o=oa(o.nextSibling),o===null){o=null;break t}}l=o.data,o=l==="F!"||l==="F"?o:null}if(o){Ee=oa(o.nextSibling),n=o.data==="F!";break e}}Gn(n)}n=!1}n&&(t=a[0])}}return a=wt(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:pv,lastRenderedState:t},a.queue=n,a=Ov.bind(null,J,n),n.dispatch=a,n=Yd(!1),l=om.bind(null,J,!1,n.queue),n=wt(),o={state:t,dispatch:null,action:e,pending:null},n.queue=o,a=rN.bind(null,J,o,l,a),o.dispatch=a,n.memoizedState=e,[t,a,!1]}function ip(e){var t=He();return bv(t,ve,e)}function bv(e,t,a){if(t=em(e,t,pv)[0],e=As(on)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=or(t)}catch(s){throw s===qo?Su:s}else n=t;t=He();var o=t.queue,l=o.dispatch;return a!==t.memoizedState&&(J.flags|=2048,ko(9,{destroy:void 0},sN.bind(null,o,a),null)),[n,l,e]}function sN(e,t){e.action=t}function op(e){var t=He(),a=ve;if(a!==null)return bv(t,a,e);He(),t=t.memoizedState,a=He();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function ko(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=J.updateQueue,t===null&&(t=Tu(),J.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function vv(){return He().memoizedState}function zs(e,t,a,n){var o=wt();J.flags|=e,o.memoizedState=ko(1|t,{destroy:void 0},a,n===void 0?null:n)}function ku(e,t,a,n){var o=He();n=n===void 0?null:n;var l=o.memoizedState.inst;ve!==null&&n!==null&&Zh(n,ve.memoizedState.deps)?o.memoizedState=ko(t,l,a,n):(J.flags|=e,o.memoizedState=ko(1|t,l,a,n))}function lp(e,t){zs(8390656,8,e,t)}function tm(e,t){ku(2048,8,e,t)}function uN(e){J.flags|=4;var t=J.updateQueue;if(t===null)t=Tu(),J.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function yv(e){var t=He().memoizedState;return uN({ref:t,nextImpl:e}),function(){if((re&2)!==0)throw Error(k(440));return t.impl.apply(void 0,arguments)}}function wv(e,t){return ku(4,2,e,t)}function xv(e,t){return ku(4,4,e,t)}function Nv(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function $v(e,t,a){a=a!=null?a.concat([e]):null,ku(4,4,Nv.bind(null,t,e),a)}function am(){}function Sv(e,t){var a=He();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&Zh(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function Tv(e,t){var a=He();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&Zh(t,n[1]))return n[0];if(n=e(),vi){Tn(!0);try{e()}finally{Tn(!1)}}return a.memoizedState=[n,t],n}function nm(e,t,a){return a===void 0||(nn&1073741824)!==0&&(te&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=by(),J.lanes|=e,In|=e,a)}function Ev(e,t,a,n){return Xt(a,t)?a:Yn.current!==null?(e=nm(e,a,n),Xt(e,t)||(Be=!0),e):(nn&106)===0||(nn&1073741824)!==0&&(te&261930)===0?(Be=!0,e.memoizedState=a):(e=by(),J.lanes|=e,In|=e,t)}function kv(e,t,a,n,o){var l=se.p;se.p=l!==0&&8>l?l:8;var s=j.T,c={};c.types=s!==null?s.types:null,j.T=c,om(e,!1,t,a);try{var h=o(),g=j.S;if(g!==null&&g(c,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var v=iN(h,n);zl(e,t,v,It(e))}else zl(e,t,n,It(e))}catch(N){zl(e,t,{then:function(){},status:"rejected",reason:N},It())}finally{se.p=l,s!==null&&c.types!==null&&(s.types=c.types),j.T=s}}function cN(){}function Id(e,t,a,n){if(e.tag!==5)throw Error(k(476));var o=Cv(e).queue;kv(e,o,t,si,a===null?cN:function(){return Av(e),a(n)})}function Cv(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:si,baseState:si,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:on,lastRenderedState:si},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:on,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Av(e){var t=Cv(e);t.next===null&&(t=e.alternate.memoizedState),zl(e,t.next.queue,{},It())}function im(){return at(Vo)}function zv(){return He().memoizedState}function Mv(){return He().memoizedState}function dN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=It();e=Rn(a);var n=Vn(t,e,a);n!==null&&(Mt(n,t,a),kl(n,t,a)),t={cache:Gh()},e.payload=t;return}t=t.return}}function hN(e,t,a){var n=It();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Cu(e)?Rv(t,a):(a=qh(e,t,a,n),a!==null&&(Mt(a,e,n),Vv(a,t,n)))}function Ov(e,t,a){var n=It();zl(e,t,a,n)}function zl(e,t,a,n){var o={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Cu(e))Rv(t,o);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var s=t.lastRenderedState,c=l(s,a);if(o.hasEagerState=!0,o.eagerState=c,Xt(c,s))return Nu(e,t,o,0),ye===null&&xu(),!1}catch{}if(a=qh(e,t,o,n),a!==null)return Mt(a,e,n),Vv(a,t,n),!0}return!1}function om(e,t,a,n){if(n={lane:2,revertLane:pm(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Cu(e)){if(t)throw Error(k(479))}else t=qh(e,a,n,2),t!==null&&Mt(t,e,2)}function Cu(e){var t=e.alternate;return e===J||t!==null&&t===J}function Rv(e,t){yo=eu=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Vv(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,vb(e,a)}}var au={readContext:at,use:Eu,useCallback:De,useContext:De,useEffect:De,useImperativeHandle:De,useLayoutEffect:De,useInsertionEffect:De,useMemo:De,useReducer:De,useRef:De,useState:De,useDebugValue:De,useDeferredValue:De,useTransition:De,useSyncExternalStore:De,useId:De,useHostTransitionStatus:De,useFormState:De,useActionState:De,useOptimistic:De,useMemoCache:De,useCacheRefresh:De,useEffectEvent:De},Dv={readContext:at,use:Eu,useCallback:function(e,t){return wt().memoizedState=[e,t===void 0?null:t],e},useContext:at,useEffect:lp,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,zs(4194308,4,Nv.bind(null,t,e),a)},useLayoutEffect:function(e,t){return zs(4194308,4,e,t)},useInsertionEffect:function(e,t){zs(4,2,e,t)},useMemo:function(e,t){var a=wt();t=t===void 0?null:t;var n=e();if(vi){Tn(!0);try{e()}finally{Tn(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=wt();if(a!==void 0){var o=a(t);if(vi){Tn(!0);try{a(t)}finally{Tn(!1)}}}else o=t;return n.memoizedState=n.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},n.queue=e,e=e.dispatch=hN.bind(null,J,e),[n.memoizedState,e]},useRef:function(e){var t=wt();return e={current:e},t.memoizedState=e},useState:function(e){e=Yd(e);var t=e.queue,a=Ov.bind(null,J,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:am,useDeferredValue:function(e,t){var a=wt();return nm(a,e,t)},useTransition:function(){var e=Yd(!1);return e=kv.bind(null,J,e.queue,!0,!1),wt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=J,o=wt();if(P){if(a===void 0)throw Error(k(407));a=a()}else{if(a=t(),ye===null)throw Error(k(349));(te&127)!==0||sv(n,t,a)}o.memoizedState=a;var l={value:a,getSnapshot:t};return o.queue=l,lp(cv.bind(null,n,l,e),[e]),n.flags|=2048,ko(9,{destroy:void 0},uv.bind(null,n,l,a,t),null),a},useId:function(){var e=wt(),t=ye.identifierPrefix;if(P){var a=_a,n=Da;a=(n&~(1<<32-jt(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=tu++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=oN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:im,useFormState:np,useActionState:np,useOptimistic:function(e){var t=wt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=om.bind(null,J,!0,a),a.dispatch=t,[e,t]},useMemoCache:Wh,useCacheRefresh:function(){return wt().memoizedState=dN.bind(null,J)},useEffectEvent:function(e){var t=wt(),a={impl:e};return t.memoizedState=a,function(){if((re&2)!==0)throw Error(k(440));return a.impl.apply(void 0,arguments)}}},_v={readContext:at,use:Eu,useCallback:Sv,useContext:at,useEffect:tm,useImperativeHandle:$v,useInsertionEffect:wv,useLayoutEffect:xv,useMemo:Tv,useReducer:As,useRef:vv,useState:function(){return As(on)},useDebugValue:am,useDeferredValue:function(e,t){var a=He();return Ev(a,ve.memoizedState,e,t)},useTransition:function(){var e=As(on)[0],t=He().memoizedState;return[typeof e=="boolean"?e:or(e),t]},useSyncExternalStore:rv,useId:zv,useHostTransitionStatus:im,useFormState:ip,useActionState:ip,useOptimistic:function(e,t){var a=He();return mv(a,ve,e,t)},useMemoCache:Wh,useCacheRefresh:Mv,useEffectEvent:yv},mN={readContext:at,use:Eu,useCallback:Sv,useContext:at,useEffect:tm,useImperativeHandle:$v,useInsertionEffect:wv,useLayoutEffect:xv,useMemo:Tv,useReducer:td,useRef:vv,useState:function(){return td(on)},useDebugValue:am,useDeferredValue:function(e,t){var a=He();return ve===null?nm(a,e,t):Ev(a,ve.memoizedState,e,t)},useTransition:function(){var e=td(on)[0],t=He().memoizedState;return[typeof e=="boolean"?e:or(e),t]},useSyncExternalStore:rv,useId:zv,useHostTransitionStatus:im,useFormState:op,useActionState:op,useOptimistic:function(e,t){var a=He();return ve!==null?mv(a,ve,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Wh,useCacheRefresh:Mv,useEffectEvent:yv};function ad(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:we({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Xd={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=It(),o=Rn(n);o.payload=t,a!=null&&(o.callback=a),t=Vn(e,o,n),t!==null&&(Mt(t,e,n),kl(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=It(),o=Rn(n);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=Vn(e,o,n),t!==null&&(Mt(t,e,n),kl(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=It(),n=Rn(a);n.tag=2,t!=null&&(n.callback=t),t=Vn(e,n,a),t!==null&&(Mt(t,e,a),kl(t,e,a))}};function rp(e,t,a,n,o,l,s){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,l,s):t.prototype&&t.prototype.isPureReactComponent?!ql(a,n)||!ql(o,l):!0}function sp(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&Xd.enqueueReplaceState(t,t.state,null)}function yi(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=we({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function Hv(e){Xs(e)}function Uv(e){console.error(e)}function qv(e){Xs(e)}function nu(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function up(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function Qd(e,t,a){return a=Rn(a),a.tag=3,a.payload={element:null},a.callback=function(){nu(e,t)},a}function Lv(e){return e=Rn(e),e.tag=3,e}function Bv(e,t,a,n){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var l=n.value;e.payload=function(){return o(l)},e.callback=function(){up(t,a,n)}}var s=a.stateNode;s!==null&&typeof s.componentDidCatch=="function"&&(e.callback=function(){up(t,a,n),typeof o!="function"&&(Hn===null?Hn=new Set([this]):Hn.add(this));var c=n.stack;this.componentDidCatch(n.value,{componentStack:c!==null?c:""})})}function fN(e,t,a,n,o){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&fi(t,a,o,!0),a=lt.current,a!==null){switch(a.tag){case 31:case 13:case 19:return ft===null?du():a.alternate===null&&_e===0&&(_e=3),a.flags&=-257,a.flags|=65536,a.lanes=o,n===Fs?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),ud(e,n,o)),!1;case 22:return a.flags|=65536,n===Fs?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),ud(e,n,o)),!1}throw Error(k(435,a.tag))}return ud(e,n,o),du(),!1}if(P)return t=lt.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,n!==Dd&&(e=Error(k(422),{cause:n}),Bl(na(e,a)))):(n!==Dd&&(t=Error(k(423),{cause:n}),Bl(na(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,n=na(n,a),o=Qd(e.stateNode,n,o),ed(e,o),_e!==4&&(_e=2)),!1;var l=Error(k(520),{cause:n});if(l=na(l,a),Vl===null?Vl=[l]:Vl.push(l),_e!==4&&(_e=2),t===null)return!0;n=na(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=Qd(a.stateNode,n,e),ed(a,e),!1;case 1:if(t=a.type,l=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||l!==null&&typeof l.componentDidCatch=="function"&&(Hn===null||!Hn.has(l))))return a.flags|=65536,o&=-o,a.lanes|=o,o=Lv(o),Bv(o,e,a,n),ed(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var lm=Error(k(461)),Be=!1;function je(e,t,a,n){t.child=e===null?tv(t,null,a,n):bi(t,e.child,a,n)}function cp(e,t,a,n,o){a=a.render;var l=t.ref;if("ref"in n){var s={};for(var c in n)c!=="ref"&&(s[c]=n[c])}else s=n;return gi(t),n=Kh(e,t,a,s,l,o),c=Jh(),e!==null&&!Be?(Fh(e,t,o),ln(e,t,o)):(P&&c&&$u(t),t.flags|=1,je(e,t,n,o),t.child)}function dp(e,t,a,n,o){if(e===null){var l=a.type;return typeof l=="function"&&!Lh(l)&&l.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=l,Gv(e,t,l,n,o)):(e=Es(a.type,null,n,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,!sm(e,o)){var s=l.memoizedProps;if(a=a.compare,a=a!==null?a:ql,a(s,n)&&e.ref===t.ref)return ln(e,t,o)}return t.flags|=1,e=Wa(l,n),e.ref=t.ref,e.return=t,t.child=e}function Gv(e,t,a,n,o){if(e!==null){var l=e.memoizedProps;if(ql(l,n)&&e.ref===t.ref)if(Be=!1,t.pendingProps=n=l,sm(e,o))(e.flags&131072)!==0&&(Be=!0);else return t.lanes=e.lanes,ln(e,t,o)}return Zd(e,t,a,n,o)}function Yv(e,t,a,n){var o=n.children,l=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(l=l!==null?l.baseLanes|a:a,e!==null){for(n=t.child=e.child,o=0;n!==null;)o=o|n.lanes|n.childLanes,n=n.sibling;n=o&~l}else n=0,t.child=null;return hp(e,t,l,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Cs(t,l!==null?l.cachePool:null),l!==null?ep(t,l):Bd(),iv(t);else return n=t.lanes=536870912,hp(e,t,l!==null?l.baseLanes|a:a,a,n)}else l!==null?(Cs(t,l.cachePool),ep(t,l),_n(),t.memoizedState=null):(e!==null&&Cs(t,null),Bd(),_n());return je(e,t,o,a),t.child}function Ml(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function hp(e,t,a,n,o){var l=Yh();return l=l===null?null:{parent:Le._currentValue,pool:l},t.memoizedState={baseLanes:a,cachePool:l},e!==null&&Cs(t,null),Bd(),iv(t),e!==null&&fi(e,t,n,!0),t.childLanes=o,null}function Ms(e,t){return t=Au({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function mp(e,t,a){return bi(t,e.child,null,a),e=Ms(t,t.pendingProps),e.flags|=2,qt(t),t.memoizedState=null,e}function gN(e,t,a){var n=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(P){if(n.mode==="hidden")return e=Ms(t,n),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},Ml(null,e);if(Gd(t),(e=Ee)?(e=Yy(e,ia),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Bn!==null?{id:Da,overflow:_a}:null,retryLane:536870912,hydrationErrors:null},a=Zb(e),a.return=t,t.child=a,Fe=t,Ee=null)):e=null,e===null)throw Gn(t);return t.lanes=536870912,null}return Ms(t,n)}var l=e.memoizedState;if(l!==null){var s=l.dehydrated;if(Gd(t),o)if(t.flags&256)t.flags&=-257,t=mp(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(k(558));else if(Be||fi(e,t,a,!1),o=(a&e.childLanes)!==0,Be||o){if(Yn.current===null){if(n=ye,n!==null&&(s=yb(n,a),s!==0&&s!==l.retryLane))throw l.retryLane=s,Si(e,s),Mt(n,e,s),lm;du()}t=mp(e,t,a)}else e=l.treeContext,Ee=oa(s.nextSibling),Fe=t,P=!0,On=null,ia=!1,e!==null&&Jb(t,e),t=Ms(t,n),t.flags|=134221824;return t}return e=Wa(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Pi(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(k(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Zd(e,t,a,n,o){return gi(t),a=Kh(e,t,a,n,void 0,o),n=Jh(),e!==null&&!Be?(Fh(e,t,o),ln(e,t,o)):(P&&n&&$u(t),t.flags|=1,je(e,t,a,o),t.child)}function fp(e,t,a,n,o,l){return gi(t),t.updateQueue=null,a=lv(t,n,a,o),ov(e),n=Jh(),e!==null&&!Be?(Fh(e,t,l),ln(e,t,l)):(P&&n&&$u(t),t.flags|=1,je(e,t,a,l),t.child)}function gp(e,t,a,n,o){if(gi(t),t.stateNode===null){var l=uo,s=a.contextType;typeof s=="object"&&s!==null&&(l=at(s)),l=new a(n,l),t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,l.updater=Xd,t.stateNode=l,l._reactInternals=t,l=t.stateNode,l.props=n,l.state=t.memoizedState,l.refs={},Ih(t),s=a.contextType,l.context=typeof s=="object"&&s!==null?at(s):uo,l.state=t.memoizedState,s=a.getDerivedStateFromProps,typeof s=="function"&&(ad(t,a,s,n),l.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(s=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),s!==l.state&&Xd.enqueueReplaceState(l,l.state,null),Al(t,n,l,o),Cl(),l.state=t.memoizedState),typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){l=t.stateNode;var c=t.memoizedProps,h=yi(a,c);l.props=h;var g=l.context,v=a.contextType;s=uo,typeof v=="object"&&v!==null&&(s=at(v));var N=a.getDerivedStateFromProps;v=typeof N=="function"||typeof l.getSnapshotBeforeUpdate=="function",c=t.pendingProps!==c,v||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(c||g!==s)&&sp(t,l,n,s),$n=!1;var f=t.memoizedState;l.state=f,Al(t,n,l,o),Cl(),g=t.memoizedState,c||f!==g||$n?(typeof N=="function"&&(ad(t,a,N,n),g=t.memoizedState),(h=$n||rp(t,a,h,n,f,g,s))?(v||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount()),typeof l.componentDidMount=="function"&&(t.flags|=4194308)):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=g),l.props=n,l.state=g,l.context=s,n=h):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{l=t.stateNode,qd(e,t),s=t.memoizedProps,v=yi(a,s),l.props=v,N=t.pendingProps,f=l.context,g=a.contextType,h=uo,typeof g=="object"&&g!==null&&(h=at(g)),c=a.getDerivedStateFromProps,(g=typeof c=="function"||typeof l.getSnapshotBeforeUpdate=="function")||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(s!==N||f!==h)&&sp(t,l,n,h),$n=!1,f=t.memoizedState,l.state=f,Al(t,n,l,o),Cl();var y=t.memoizedState;s!==N||f!==y||$n||e!==null&&e.dependencies!==null&&Js(e.dependencies)?(typeof c=="function"&&(ad(t,a,c,n),y=t.memoizedState),(v=$n||rp(t,a,v,n,f,y,h)||e!==null&&e.dependencies!==null&&Js(e.dependencies))?(g||typeof l.UNSAFE_componentWillUpdate!="function"&&typeof l.componentWillUpdate!="function"||(typeof l.componentWillUpdate=="function"&&l.componentWillUpdate(n,y,h),typeof l.UNSAFE_componentWillUpdate=="function"&&l.UNSAFE_componentWillUpdate(n,y,h)),typeof l.componentDidUpdate=="function"&&(t.flags|=4),typeof l.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof l.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=y),l.props=n,l.state=y,l.context=h,n=v):(typeof l.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),n=!1)}return l=n,Pi(e,t),n=(t.flags&128)!==0,l||n?(l=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:l.render(),t.flags|=1,e!==null&&n?(t.child=bi(t,e.child,null,o),t.child=bi(t,null,a,o)):je(e,t,a,o),t.memoizedState=l.state,e=t.child):e=ln(e,t,o),e}function pp(e,t,a,n){return mi(),t.flags|=256,je(e,t,a,n),t.child}var Kd={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Jd(e){return{baseLanes:e,cachePool:Pb()}}function Fd(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=Bt),e}function jv(e,t,a){var n=t.pendingProps,o=!1,l=(t.flags&128)!==0,s;if((s=l)||(s=e!==null&&e.memoizedState===null?!1:(it.current&2)!==0),s&&(o=!0,t.flags&=-129),s=(t.flags&32)!==0,t.flags&=-33,e===null){if(P){if(o?Dn(t):_n(),(e=Ee)?(e=Yy(e,ia),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Bn!==null?{id:Da,overflow:_a}:null,retryLane:536870912,hydrationErrors:null},a=Zb(e),a.return=t,t.child=a,Fe=t,Ee=null)):e=null,e===null)throw Gn(t);return wm(e)?t.lanes=32:t.lanes=536870912,null}return l=n.children,n=n.fallback,o?(_n(),o=t.mode,l=Au({mode:"hidden",children:l},o),n=ui(n,o,a,null),l.return=t,n.return=t,l.sibling=n,t.child=l,n=t.child,n.memoizedState=Jd(a),n.childLanes=Fd(e,s,a),t.memoizedState=Kd,Ml(null,n)):(Dn(t),rm(t,l))}var c=e.memoizedState;if(c!==null){var h=c.dehydrated;if(h!==null)return pN(e,t,l,s,n,h,c,a)}return o?(_n(),o=n.fallback,l=t.mode,c=e.child,h=c.sibling,n=Wa(c,{mode:"hidden",children:n.children}),n.subtreeFlags=c.subtreeFlags&1206910976,h!==null?o=Wa(h,o):(o=ui(o,l,a,null),o.flags|=2),o.return=t,n.return=t,n.sibling=o,t.child=n,Ml(null,n),n=t.child,o=e.child.memoizedState,o===null?o=Jd(a):(l=o.cachePool,l!==null?(c=Le._currentValue,l=l.parent!==c?{parent:c,pool:c}:l):l=Pb(),o={baseLanes:o.baseLanes|a,cachePool:l}),n.memoizedState=o,n.childLanes=Fd(e,s,a),t.memoizedState=Kd,Ml(e.child,n)):(Dn(t),a=e.child,e=a.sibling,a=Wa(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=a,t.memoizedState=null,a)}function rm(e,t){return t=Au({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Au(e,t){return e=zt(22,e,null,t),e.lanes=0,e}function hs(e,t,a){return bi(t,e.child,null,a),e=rm(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function pN(e,t,a,n,o,l,s,c){if(a)return t.flags&256?(Dn(t),t.flags&=-257,hs(e,t,c)):t.memoizedState!==null?(_n(),t.child=e.child,t.flags|=128,null):(_n(),l=o.fallback,s=t.mode,o=Au({mode:"visible",children:o.children},s),l=ui(l,s,c,null),l.flags|=2,o.return=t,l.return=t,o.sibling=l,t.child=o,bi(t,e.child,null,c),o=t.child,o.memoizedState=Jd(c),o.childLanes=Fd(e,n,c),t.memoizedState=Kd,Ml(null,o));if(Dn(t),wm(l)){if(n=l.nextSibling&&l.nextSibling.dataset,n)var h=n.dgst;return n=h,n!==""&&(o=Error(k(419)),o.stack="",o.digest=n,Bl({value:o,source:null,stack:null})),hs(e,t,c)}if(Be||fi(e,t,c,!1),n=(c&e.childLanes)!==0,Be||n){if(Yn.current!==null)return hs(e,t,c);if(n=ye,n!==null&&(o=yb(n,c),o!==0&&o!==s.retryLane))throw s.retryLane=o,Si(e,o),Mt(n,e,o),lm;return Nh(l)||du(),hs(e,t,c)}return Nh(l)?(t.flags|=192,t.child=e.child,null):(e=s.treeContext,Ee=oa(l.nextSibling),Fe=t,P=!0,On=null,ia=!1,e!==null&&Jb(t,e),t=rm(t,o.children),t.flags|=134221824,t)}function bp(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),ks(e.return,t,a)}function vp(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Ws(a)===null&&(t=e),e=e.sibling}return t}function ms(e,t,a,n,o,l){var s=e.memoizedState;s===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:o,treeForkCount:l}:(s.isBackwards=t,s.rendering=null,s.renderingStartTime=0,s.last=n,s.tail=a,s.tailMode=o,s.treeForkCount=l)}function nd(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Pd(e,t,a){var n=t.pendingProps,o=n.revealOrder,l=n.tail;n=n.children;var s=it.current;if(t.flags&128)return Yl(t,s),null;var c=(s&2)!==0;if(c?(s=s&1|2,t.flags|=128):s&=1,Yl(t,s),o==="backwards"&&e!==null?(nd(e),je(e,t,n,a),nd(e)):je(e,t,n,a),n=P?Ll:0,!c&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&bp(e,a,t);else if(e.tag===19)bp(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=vp(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,nd(t)),ms(t,!0,o,null,l,n);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&Ws(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}ms(t,!0,a,null,l,n);break;case"together":ms(t,!1,null,null,void 0,n);break;case"independent":t.memoizedState=null;break;default:a=vp(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),ms(t,!1,o,a,l,n)}return t.child}function yp(e,t,a){var n=t.pendingProps;return kn(t,t.type,n.value),je(e,t,n.children,a),t.child}function ln(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),In|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(fi(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(k(153));if(t.child!==null){for(e=t.child,a=Wa(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=Wa(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function sm(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Js(e)))}function bN(e,t,a){switch(t.tag){case 3:Gs(t,t.stateNode.containerInfo),kn(t,Le,e.memoizedState.cache),mi();break;case 27:case 5:Td(t);break;case 4:Gs(t,t.stateNode.containerInfo);break;case 10:kn(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Gd(t),null;break;case 13:var n=t.memoizedState;if(n!==null){if(n.dehydrated!==null)return Dn(t),t.flags|=128,null;n=fi(e,t,a,!1);var o=t.child.childLanes;return n||(a&o)!==0?jv(e,t,a):(Dn(t),e=ln(e,t,a),e!==null?e.sibling:null)}Dn(t);break;case 19:if(t.flags&128)return Pd(e,t,a);if(o=(e.flags&128)!==0,n=(a&t.childLanes)!==0,n||(fi(e,t,a,!1),n=(a&t.childLanes)!==0),o){if(n)return Pd(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),Yl(t,it.current),n)break;return null;case 22:return t.lanes=0,Yv(e,t,a,t.pendingProps);case 24:kn(t,Le,e.memoizedState.cache)}return ln(e,t,a)}function Iv(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)Be=!0;else{if(!sm(e,a)&&(t.flags&128)===0)return Be=!1,bN(e,t,a);Be=(e.flags&131072)!==0}else Be=!1,P&&(t.flags&1048576)!==0&&Kb(t,Ll,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=ii(t.elementType),t.type=e,typeof e=="function")Lh(e)?(n=yi(e,n),t.tag=1,t=gp(null,t,e,n,a)):(t.tag=0,t=Zd(null,t,e,n,a));else{if(e!=null){var o=e.$$typeof;if(o===kh){t.tag=11,t=cp(null,t,e,n,a);break e}else if(o===Ch){t.tag=14,t=dp(null,t,e,n,a);break e}else if(o===Ra){t.tag=10,t.type=e,t=yp(null,t,a);break e}}throw t=$d(e)||e,Error(k(306,t,""))}}return t;case 0:return Zd(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,o=yi(n,t.pendingProps),gp(e,t,n,o,a);case 3:e:{if(Gs(t,t.stateNode.containerInfo),e===null)throw Error(k(387));n=t.pendingProps;var l=t.memoizedState;o=l.element,qd(e,t),Al(t,n,null,a);var s=t.memoizedState;if(n=s.cache,kn(t,Le,n),n!==l.cache&&Hd(t,[Le],a,!0),Cl(),n=s.element,l.isDehydrated)if(l={element:n,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){t=pp(e,t,n,a);break e}else if(n!==o){o=na(Error(k(424)),t),Bl(o),t=pp(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Ee=oa(e.firstChild),Fe=t,P=!0,On=null,ia=!0,a=tv(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(mi(),n===o){t=ln(e,t,a);break e}je(e,t,n,a)}t=t.child}return t;case 26:return Pi(e,t),e===null?(a=Xp(t.type,null,t.pendingProps,null))?t.memoizedState=a:P||(t.stateNode=Vy(t.type,t.pendingProps,Mn.current,t)):t.memoizedState=Xp(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Td(t),e===null&&P&&(n=t.stateNode=jy(t.type,t.pendingProps,Mn.current),Fe=t,ia=!0,o=Ee,Qn(t.type)?($h=o,Ee=oa(n.firstChild)):Ee=o),je(e,t,t.pendingProps.children,a),Pi(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&P&&((o=n=Ee)&&(n=u$(n,t.type,t.pendingProps,ia),n!==null?(t.stateNode=n,Fe=t,Ee=oa(n.firstChild),ia=!1,o=!0):o=!1),o||Gn(t)),Td(t),o=t.type,l=t.pendingProps,s=e!==null?e.memoizedProps:null,n=l.children,yh(o,l)?n=null:s!==null&&yh(o,s)&&(t.flags|=32),t.memoizedState!==null&&(o=Kh(e,t,lN,null,null,a),Vo._currentValue=o),Pi(e,t),je(e,t,n,a),t.child;case 6:return e===null&&P&&((e=a=Ee)&&(a=c$(a,t.pendingProps,ia),a!==null?(t.stateNode=a,Fe=t,Ee=null,e=!0):e=!1),e||Gn(t)),null;case 13:return jv(e,t,a);case 4:return Gs(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=bi(t,null,n,a):je(e,t,n,a),t.child;case 11:return cp(e,t,t.type,t.pendingProps,a);case 7:return n=t.pendingProps,Pi(e,t),je(e,t,n,a),t.child;case 8:return je(e,t,t.pendingProps.children,a),t.child;case 12:return je(e,t,t.pendingProps.children,a),t.child;case 10:return yp(e,t,a);case 9:return o=t.type._context,n=t.pendingProps.children,gi(t),o=at(o),n=n(o),t.flags|=1,je(e,t,n,a),t.child;case 14:return dp(e,t,t.type,t.pendingProps,a);case 15:return Gv(e,t,t.type,t.pendingProps,a);case 19:return Pd(e,t,a);case 31:return gN(e,t,a);case 22:return Yv(e,t,a,t.pendingProps);case 24:return gi(t),n=at(Le),e===null?(o=Yh(),o===null&&(o=ye,l=Gh(),o.pooledCache=l,l.refCount++,l!==null&&(o.pooledCacheLanes|=a),o=l),t.memoizedState={parent:n,cache:o},Ih(t),kn(t,Le,o)):((e.lanes&a)!==0&&(qd(e,t),Al(t,null,null,a),Cl()),o=e.memoizedState,l=t.memoizedState,o.parent!==n?(o={parent:n,cache:n},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),kn(t,Le,n)):(n=l.cache,kn(t,Le,n),n!==o.cache&&Hd(t,[Le],a,!0))),je(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),n=t.pendingProps,n.name!=null&&n.name!=="auto"?t.flags|=e===null?18882560:18874368:P&&$u(t),e!==null&&e.memoizedProps.name!==n.name?t.flags|=4194816:Pi(e,t),je(e,t,n.children,a),t.child;case 29:throw t.pendingProps}throw Error(k(156,t.tag))}function Ja(e){e.flags|=4}function id(e,t,a,n,o){var l;if((l=(e.mode&32)!==0)&&(l=a===null?Kp(t,n):Kp(t,n)&&(n.src!==a.src||n.srcSet!==a.srcSet)),l){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(wy())e.flags|=8192;else throw di=Fs,jh}else e.flags&=-16777217}function wp(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Zy(t))if(wy())e.flags|=8192;else throw di=Fs,jh}function fs(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?pb():536870912,e.lanes|=t,Co|=t)}function fl(e,t){if(!P)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function Te(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags&1206910976,n|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags,n|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function vN(e,t,a){var n=t.pendingProps;switch(Bh(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Te(t),null;case 1:return Te(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),en(Le),So(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Ji(t)?Ja(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Wc())),Te(t),null;case 26:var o=t.type,l=t.memoizedState;return e===null?(Ja(t),l!==null?(Te(t),wp(t,l)):(Te(t),id(t,o,null,n,a))):l?l!==e.memoizedState?(Ja(t),Te(t),wp(t,l)):(Te(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&Ja(t),Te(t),id(t,o,e,n,a)),null;case 27:if(Ys(t),a=Mn.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&Ja(t);else{if(!n){if(t.stateNode===null)throw Error(k(166));return Te(t),t.subtreeFlags&=-33554433,null}e=Ha.current,Ji(t)?Qg(t,e):(e=jy(o,n,a),t.stateNode=e,Ja(t))}return Te(t),t.subtreeFlags&=-33554433,null;case 5:if(Ys(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&Ja(t);else{if(!n){if(t.stateNode===null)throw Error(k(166));return Te(t),t.subtreeFlags&=-33554433,null}if(l=Ha.current,Ji(t))Qg(t,l);else{var s=Ql(Mn.current);switch(l){case 1:l=s.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:l=s.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":l=s.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":l=s.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":l=s.createElement("div"),l.innerHTML="<script><\/script>",l=l.removeChild(l.firstChild);break;case"select":l=typeof n.is=="string"?s.createElement("select",{is:n.is}):s.createElement("select"),n.multiple?l.multiple=!0:n.size&&(l.size=n.size);break;default:l=typeof n.is=="string"?s.createElement(o,{is:n.is}):s.createElement(o)}}l[tt]=t,l[Rt]=n;e:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)l.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break e;for(;s.sibling===null;){if(s.return===null||s.return===t)break e;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=l;e:switch(ot(l,o,n),o){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&Ja(t)}}return Te(t),t.subtreeFlags&=-33554433,id(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&Ja(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(k(166));if(e=Mn.current,Ji(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,o=Fe,o!==null)switch(o.tag){case 27:case 5:n=o.memoizedProps}e[tt]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||Oy(e.nodeValue,a)),e||Gn(t,!0)}else e=Ql(e).createTextNode(n),e[tt]=t,t.stateNode=e}return Te(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=Ji(t),a!==null){if(e===null){if(!n)throw Error(k(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(k(557));e[tt]=t}else mi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Te(t),e=!1}else a=Wc(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(qt(t),t):(qt(t),null);if((t.flags&128)!==0)throw Error(k(558))}return Te(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=Ji(t),n!==null&&n.dehydrated!==null){if(e===null){if(!o)throw Error(k(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(k(317));o[tt]=t}else mi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Te(t),o=!1}else o=Wc(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(qt(t),t):(qt(t),null)}return qt(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,o=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(o=n.alternate.memoizedState.cachePool.pool),l=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(l=n.memoizedState.cachePool.pool),l!==o&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),fs(t,t.updateQueue),Te(t),null);case 4:return So(),e===null&&bm(t.stateNode.containerInfo),t.flags|=67108864,Te(t),null;case 10:return en(t.type),Te(t),null;case 19:if(Qh(t),n=t.memoizedState,n===null)return Te(t),null;if(o=(t.flags&128)!==0,l=n.rendering,l===null)if(o)fl(n,!1);else{if(_e!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(l=Ws(e),l!==null){for(t.flags|=128,fl(n,!1),e=l.updateQueue,t.updateQueue=e,fs(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Qb(a,e),a=a.sibling;return Yl(t,it.current&1|2),P&&Fa(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&Gt()>uu&&(t.flags|=128,o=!0,fl(n,!1),t.lanes=4194304)}else{if(!o)if(e=Ws(l),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,fs(t,e),fl(n,!0),n.tail===null&&n.tailMode!=="collapsed"&&n.tailMode!=="visible"&&!l.alternate&&!P)return Te(t),null}else 2*Gt()-n.renderingStartTime>uu&&a!==536870912&&(t.flags|=128,o=!0,fl(n,!1),t.lanes=4194304);n.isBackwards?(l.sibling=t.child,t.child=l):(e=n.last,e!==null?e.sibling=l:t.child=l,n.last=l)}if(n.tail!==null){e=n.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return n.rendering=e,n.tail=e.sibling,n.renderingStartTime=Gt(),e.sibling=null,l=it.current,l=o?l&1|2:l&1,n.tailMode==="visible"||n.tailMode==="collapsed"||!a||P?Yl(t,l):(a=l,ke(lt,t),ke(it,a),ft===null&&(ft=t)),P&&Fa(t,n.treeForkCount),e}return Te(t),null;case 22:case 23:return qt(t),Xh(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&(Te(t),t.subtreeFlags&6&&(t.flags|=8192)):Te(t),a=t.updateQueue,a!==null&&fs(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&nt(ci),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),en(Le),Te(t),null;case 25:return null;case 30:return t.flags|=33554432,Te(t),null}throw Error(k(156,t.tag))}function yN(e,t){switch(Bh(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return en(Le),So(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Ys(t),null;case 31:if(t.memoizedState!==null){if(qt(t),t.alternate===null)throw Error(k(340));mi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(qt(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(k(340));mi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Qh(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return So(),null;case 10:return en(t.type),null;case 22:case 23:return qt(t),Xh(),e!==null&&nt(ci),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return en(Le),null;case 25:return null;default:return null}}function Xv(e,t){switch(Bh(t),t.tag){case 3:en(Le),So();break;case 26:case 27:case 5:Ys(t);break;case 4:So();break;case 31:t.memoizedState!==null&&qt(t);break;case 13:qt(t);break;case 19:Qh(t);break;case 10:en(t.type);break;case 22:case 23:qt(t),Xh(),e!==null&&nt(ci);break;case 24:en(Le)}}function lr(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var o=n.next;a=o;do{if((a.tag&e)===e){n=void 0;var l=a.create,s=a.inst;n=l(),s.destroy=n}a=a.next}while(a!==o)}}catch(c){ge(t,t.return,c)}}function jn(e,t,a){try{var n=t.updateQueue,o=n!==null?n.lastEffect:null;if(o!==null){var l=o.next;n=l;do{if((n.tag&e)===e){var s=n.inst,c=s.destroy;if(c!==void 0){s.destroy=void 0,o=t;var h=a,g=c;try{g()}catch(v){ge(o,h,v)}}}n=n.next}while(n!==l)}}catch(v){ge(t,t.return,v)}}function Qv(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{nv(t,a)}catch(n){ge(e,e.return,n)}}}function Zv(e,t,a){a.props=yi(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){ge(e,t,n)}}function Ma(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:var o=e.stateNode,l=an(e.memoizedProps,o);(o.ref===null||o.ref.name!==l)&&(o.ref=Uy(l)),n=o.ref;break;case 7:if(e.stateNode===null){var s=new Qt(e);Ot(e.child,!1,r$,s,void 0,void 0),e.stateNode=s}n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(c){ge(e,t,c)}}function et(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(o){ge(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){ge(e,t,o)}else a.current=null}function iu(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)Gy(e.stateNode,t[a])}function xp(e){for(var t=e.return;t!==null&&(cm(t)&&Gy(e.stateNode,t.stateNode),!um(t));)t=t.return}function Ol(e){for(var t=e.return;t!==null&&(cm(t)&&s$(e.stateNode,t.stateNode),!um(t));)t=t.return}function um(e){return e.tag===5||e.tag===3||e.tag===27}function cm(e){return e&&e.tag===7&&e.stateNode!==null}function Wd(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(o){ge(e,e.return,o)}}function od(e,t,a){try{var n=e.stateNode;YN(n,e.type,a,t),n[Rt]=t}catch(o){ge(e,e.return,o)}}function Kv(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Qn(e.type)||e.tag===4}function ld(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Kv(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Qn(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function eh(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=Va)),iu(e,n),oe=!0;else if(o!==4&&(o===27&&(iu(e,n),n=null,Qn(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(eh(e,t,a,n),e=e.sibling;e!==null;)eh(e,t,a,n),e=e.sibling}function ou(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),iu(e,n),oe=!0;else if(o!==4&&(o===27&&(iu(e,n),n=null,Qn(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(ou(e,t,a,n),e=e.sibling;e!==null;)ou(e,t,a,n),e=e.sibling}function Jv(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);ot(t,n,a),t[tt]=e,t[Rt]=a}catch(l){ge(e,e.return,l)}}var lu=!1,Lt=null;function Np(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(lu=!0)}var Oa=null;function $p(){var e=Oa;return Oa=null,e}var At=0;function Lo(e,t,a,n,o){return At=0,Fv(e.child,t,a,n,o)}function Fv(e,t,a,n,o){for(var l=!1;e!==null;){if(e.tag===5){var s=e.stateNode;if(n!==null){var c=wh(s);n.push(c),c.view&&(l=!0)}else l||wh(s).view&&(l=!0);lu=!0,Dy(s,At===0?t:t+"_"+At,a),At++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||Fv(e.child,t,a,n,o)&&(l=!0));e=e.sibling}return l}function qa(e,t){for(;e!==null;)e.tag===5?_y(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||qa(e.child,t)),e=e.sibling}function Os(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Os(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(k(544));var a=t.name;t=un(t.default,t.share),t!=="none"&&(Lo(e,a,t,null,!1)||qa(e.child,!1))}e=e.sibling}}function th(e,t){if(e.tag===30){var a=e.stateNode,n=e.memoizedProps,o=an(n,a),l=un(n.default,a.paired?n.share:n.enter);l!=="none"?Lo(e,o,l,null,!1)?(Os(e),a.paired||t||Ao(e,n.onEnter)):qa(e.child,!1):Os(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)th(e,t),e=e.sibling;else Os(e)}function ah(e){if(Lt!==null&&Lt.size!==0){var t=Lt;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,n=a.name;if(n!=null&&n!=="auto"){var o=t.get(n);if(o!==void 0){var l=un(a.default,a.share);if(l!=="none"&&(Lo(e,n,l,null,!1)?(l=e.stateNode,o.paired=l,l.paired=o,Ao(e,a.onShare)):qa(e.child,!1)),t.delete(n),t.size===0)break}}}ah(e)}e=e.sibling}}}function nh(e){if(e.tag===30){var t=e.memoizedProps,a=an(t,e.stateNode),n=Lt!==null?Lt.get(a):void 0,o=un(t.default,n!==void 0?t.share:t.exit);o!=="none"&&(Lo(e,a,o,null,!1)?n!==void 0?(o=e.stateNode,n.paired=o,o.paired=n,Lt.delete(a),Ao(e,t.onShare)):Ao(e,t.onExit):qa(e.child,!1)),Lt!==null&&ah(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)nh(e),e=e.sibling;else Lt!==null&&ah(e)}function Pv(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=an(t,e.stateNode);t=un(t.default,t.update),e.flags&=-5,t!=="none"&&Lo(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&Pv(e);e=e.sibling}}function ih(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,qa(e.child,!1))}ih(e)}e=e.sibling}}function Rs(e){if(e.tag===30)e.stateNode.paired=null,qa(e.child,!1),ih(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Rs(e),e=e.sibling;else ih(e)}function Wv(e){for(e=e.child;e!==null;)e.tag===30?qa(e.child,!1):(e.subtreeFlags&33554432)!==0&&Wv(e),e=e.sibling}function dm(e,t,a,n,o,l,s){for(var c=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(l!==null&&At<l.length){var g=l[At],v=wh(h);(g.view||v.view)&&(c=!0);var N;if(N=(e.flags&4)===0)if(v.clip)N=!0;else{N=g.rect;var f=v.rect;N=N.y!==f.y||N.x!==f.x||N.height!==f.height||N.width!==f.width}N&&(e.flags|=4),v.abs?v=!g.abs:(g=g.rect,v=v.rect,v=g.height!==v.height||g.width!==v.width),v&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&Dy(h,At===0?a:a+"_"+At,o),c&&(e.flags&4)!==0||(Oa===null&&(Oa=[]),Oa.push(h,At===0?n:n+"_"+At,t.memoizedProps)),At++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&s?e.flags|=t.flags&32:dm(e,t.child,a,n,o,l,s)&&(c=!0));t=t.sibling}return c}function ey(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,n=e.stateNode,o=an(a,n),l=un(a.default,a.update);if(t){n=n.clones;var s=n===null?null:n.map(KN)}else s=e.memoizedState,e.memoizedState=null;n=e;var c=e.child;At=0,o=dm(n,c,o,o,l,s,!1),(e.flags&4)!==0&&o&&(t||Ao(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&ey(e,t);e=e.sibling}}var Ze=!1,de=!1,Ca=!1,rd=!1,Sp=typeof WeakSet=="function"?WeakSet:Set,Ke=null,Aa=!1,Nl=!1,ru=!1,oh=!1;function wN(e,t,a){if(e=e.containerInfo,bh=Do,e=qb(e),Hh(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var l=o.anchorOffset,s=o.focusNode;o=o.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var c=0,h=-1,g=-1,v=0,N=0,f=e,y=null;t:for(;;){for(var A;f!==n||l!==0&&f.nodeType!==3||(h=c+l),f!==s||o!==0&&f.nodeType!==3||(g=c+o),f.nodeType===3&&(c+=f.nodeValue.length),(A=f.firstChild)!==null;)y=f,f=A;for(;;){if(f===e)break t;if(y===n&&++v===l&&(h=c),y===s&&++N===o&&(g=c),(A=f.nextSibling)!==null)break;f=y,y=f.parentNode}f=A}n=h===-1||g===-1?null:{start:h,end:g}}else n=null}n=n||{start:0,end:0}}else n=null;for(vh={focusedElem:e,selectionRange:n},Do=!1,a=(a&335544064)===a,Ke=t,t=a?9270:1024;Ke!==null;){if(e=Ke,a&&(n=e.deletions,n!==null))for(l=0;l<n.length;l++)a&&nh(n[l]);if(e.alternate===null&&(e.flags&2)!==0)a&&Np(e),gs(a);else{if(e.tag===22){if(n=e.alternate,e.memoizedState!==null){n!==null&&n.memoizedState===null&&a&&nh(n),gs(a);continue}else if(n!==null&&n.memoizedState!==null){a&&Np(e),gs(a);continue}}n=e.child,(e.subtreeFlags&t)!==0&&n!==null?(n.return=e,Ke=n):(a&&Pv(e),gs(a))}}Lt=null}function gs(e){for(;Ke!==null;){var t=Ke,a=e,n=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&n!==null){a=void 0,o=n.memoizedProps,n=n.memoizedState;var l=t.stateNode;try{var s=yi(t.type,o);a=l.getSnapshotBeforeUpdate(s,n),l.__reactInternalSnapshotBeforeUpdate=a}catch(c){ge(t,t.return,c)}}break;case 3:if((o&1024)!==0){if(n=t.stateNode.containerInfo,a=n.nodeType,a===9)xh(n);else if(a===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":xh(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&n!==null&&(a=an(n.memoizedProps,n.stateNode),o=t.memoizedProps,o=un(o.default,o.update),o!=="none"&&Lo(n,a,o,n.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(k(163))}if(n=t.sibling,n!==null){n.return=t.return,Ke=n;break}Ke=t.return}}function ty(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:za(e,a),n&4&&lr(5,a);break;case 1:if(za(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(s){ge(a,a.return,s)}else{var o=yi(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(s){ge(a,a.return,s)}}n&64&&Qv(a),n&512&&Ma(a,a.return);break;case 3:if(za(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{nv(e,t)}catch(s){ge(a,a.return,s)}}break;case 27:t===null&&n&4&&Jv(a);case 26:case 5:za(e,a),t===null&&n&4&&Wd(a),n&512&&Ma(a,a.return);break;case 12:za(e,a);break;case 31:za(e,a),n&4&&oy(e,a);break;case 13:za(e,a),n&4&&ly(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=ON.bind(null,a),d$(e,a))));break;case 22:if(n=a.memoizedState!==null||Ze,!n){var l=t!==null&&t.memoizedState!==null||de;t=Ze,o=de,Ze=n,(de=l)&&!o?(n=2,(a.subtreeFlags&8772)!==0&&(n|=1),fa(e,a,n)):za(e,a),Ze=t,de=o}break;case 30:za(e,a),n&512&&Ma(a,a.return);break;case 7:n&512&&Ma(a,a.return);default:za(e,a)}}function lh(e,t){for(e=e.child;e!==null;)ay(e,t),e=e.sibling}function ay(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var n=a.style;typeof n.setProperty=="function"?n.setProperty("display","none","important"):n.display="none"}else{var o=e.stateNode,l=e.memoizedProps.style,s=l!=null&&l.hasOwnProperty("display")?l.display:null;o.style.display=s==null||typeof s=="boolean"?"":(""+s).trim()}}catch(h){ge(e,e.return,h)}rh(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,oe=!0}catch(h){ge(e,e.return,h)}break;case 18:try{var c=e.stateNode;t?Lp(c,!0):Lp(e.stateNode,!1)}catch(h){ge(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&lh(e,t);break;default:lh(e,t)}}function rh(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,n=t;switch(a.tag){case 4:ay(a,n);break e;case 22:a.memoizedState===null&&rh(a,n);break e;default:rh(a,n)}}e=e.sibling}}function ny(e){var t=e.alternate;t!==null&&(e.alternate=null,ny(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&bu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var ze=null,kt=!1;function ma(e,t,a){for(a=a.child;a!==null;)iy(e,t,a),a=a.sibling}function iy(e,t,a){if(Yt&&typeof Yt.onCommitFiberUnmount=="function")try{Yt.onCommitFiberUnmount(Wl,a)}catch{}switch(a.tag){case 26:de||et(a,t),ma(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!de&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:de||et(a,t),Ol(a);var n=ze,o=kt;Qn(a.type)&&(ze=a.stateNode,kt=!1),ma(e,t,a),Iy(a.stateNode,a.type,a.memoizedProps),ze=n,kt=o;break;case 5:de||et(a,t),Ol(a);case 6:if(a.tag===6&&Ol(a),n=ze,o=kt,ze=null,ma(e,t,a),ze=n,kt=o,ze!==null)if(kt)try{(ze.nodeType===9?ze.body:ze.nodeName==="HTML"?ze.ownerDocument.body:ze).removeChild(a.stateNode),oe=!0}catch(l){ge(a,t,l)}else try{ze.removeChild(a.stateNode),oe=!0}catch(l){ge(a,t,l)}break;case 18:ze!==null&&(kt?(e=ze,qp(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),_o(e)):qp(ze,a.stateNode));break;case 4:n=ze,o=kt,ze=a.stateNode.containerInfo,kt=!0,ma(e,t,a),ze=n,kt=o;break;case 0:case 11:case 14:case 15:jn(2,a,t),de||jn(4,a,t),ma(e,t,a);break;case 1:de||(et(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&Zv(a,t,n)),ma(e,t,a);break;case 21:ma(e,t,a);break;case 22:de=(n=de)||a.memoizedState!==null,ma(e,t,a),de=n;break;case 30:et(a,t),ma(e,t,a);break;case 7:de||et(a,t),ma(e,t,a);break;default:ma(e,t,a)}}function oy(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{_o(e)}catch(a){ge(t,t.return,a)}}}function ly(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{_o(e)}catch(a){ge(t,t.return,a)}}function xN(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Sp),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Sp),t;default:throw Error(k(435,e.tag))}}function ps(e,t){var a=xN(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var o=RN.bind(null,e,n);n.then(o,o)}})}function vt(e,t,a){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var l=n[o],s=e,c=t,h=c;e:for(;h!==null;){switch(h.tag){case 27:if(Qn(h.type)){ze=h.stateNode,kt=!1;break e}break;case 5:ze=h.stateNode,kt=!1;break e;case 3:case 4:ze=h.stateNode.containerInfo,kt=!0;break e}h=h.return}if(ze===null)throw Error(k(160));iy(s,c,l),ze=null,kt=!1,s=l.alternate,s!==null&&(s.return=null),l.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)ry(t,e,a),t=t.sibling}var ga=null;function ry(e,t,a){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(n=e.updateQueue,n=n!==null?n.events:null,n!==null))for(var l=0;l<n.length;l++){var s=n[l];s.ref.impl=s.nextImpl}vt(t,e,a),yt(e),o&4&&(jn(3,e,e.return),lr(3,e),jn(5,e,e.return));break;case 1:vt(t,e,a),yt(e),o&512&&(de||n===null||et(n,n.return)),o&64&&Ze&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(l=ga,vt(t,e,a),yt(e),o&512&&(de||n===null||et(n,n.return)),o&4)if(o=n!==null?n.memoizedState:null,a=e.memoizedState,n===null)if(a===null)if(e.stateNode===null)if(Ze)e.stateNode=Vy(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=l.ownerDocument||l;t:switch(t){case"title":n=o.getElementsByTagName("title")[0],(!n||n[ar]||n[tt]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=o.createElement(t),o.head.insertBefore(n,o.querySelector("head > title"))),ot(n,t,a),n[tt]=e,Je(n),t=n;break e;case"link":if(l=Zp("link","href",o).get(t+(a.href||""))){for(s=0;s<l.length;s++)if(n=l[s],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){l.splice(s,1);break t}}n=o.createElement(t),ot(n,t,a),o.head.appendChild(n);break;case"meta":if(l=Zp("meta","content",o).get(t+(a.content||""))){for(s=0;s<l.length;s++)if(n=l[s],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){l.splice(s,1);break t}}n=o.createElement(t),ot(n,t,a),o.head.appendChild(n);break;default:throw Error(k(468,t))}n[tt]=e,Je(n),t=n}e.stateNode=t}else Ze||Sh(l,e.type,e.stateNode);else e.stateNode=Qp(l,a,e.memoizedProps);else o!==a?(o===null?(t=n.stateNode,t===null||de||t.parentNode.removeChild(t)):o.count--,a===null?Ze||Sh(l,e.type,e.stateNode):Qp(l,a,e.memoizedProps)):a===null&&e.stateNode!==null&&od(e,e.memoizedProps,n.memoizedProps);break;case 27:vt(t,e,a),yt(e),o&512&&(de||n===null||et(n,n.return)),n!==null&&o&4&&od(e,e.memoizedProps,n.memoizedProps);break;case 5:if(l=Ca,Ca=!1,vt(t,e,a),Ca=l,yt(e),o&512&&(de||n===null||et(n,n.return)),e.flags&32){t=e.stateNode;try{Eo(t,""),oe=!0}catch(v){ge(e,e.return,v)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,od(e,t,n!==null?n.memoizedProps:t)),o&1024&&(rd=!0);break;case 6:if(vt(t,e,a),yt(e),o&4){if(e.stateNode===null)throw Error(k(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,oe=!0}catch(v){ge(e,e.return,v)}}break;case 3:if(oe=!1,Hs=null,l=ga,ga=Zl(t.containerInfo),vt(t,e,a),ga=l,yt(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{_o(t.containerInfo)}catch(v){ge(e,e.return,v)}rd&&(rd=!1,sy(e)),oe=!1;break;case 4:o=Ca,Ca=Ze,n=zg(),l=ga,ga=Zl(e.stateNode.containerInfo),vt(t,e,a),yt(e),ga=l,oe&&Nl&&(ru=!0),oe=n,Ca=o;break;case 12:vt(t,e,a),yt(e);break;case 31:vt(t,e,a),yt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,ps(e,t)));break;case 13:vt(t,e,a),yt(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(zu=Gt()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,ps(e,t)));break;case 22:l=e.memoizedState!==null,s=n!==null&&n.memoizedState!==null;var c=Ze,h=de,g=Ca;Ze=c||l,Ca=g||l,de=h||s,vt(t,e,a),de=h,Ca=g,Ze=c,yt(e),o&8192&&(t=e.stateNode,t._visibility=l?t._visibility&-2:t._visibility|1,!l||n===null||s||Ze||de||(t=s||de,a=Ze,n=de,Ze=l||Ze,de=t,xn(e,2),Ze=a,de=n),!l&&Ca||lh(e,l)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,ps(e,a))));break;case 19:vt(t,e,a),yt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,ps(e,t)));break;case 30:o&512&&(de||n===null||et(n,n.return)),o=zg(),l=Nl,s=(a&335544064)===a,c=e.memoizedProps,Nl=s&&un(c.default,c.update)!=="none",vt(t,e,a),yt(e),s&&n!==null&&oe&&(e.flags|=4),Nl=l,oe=o;break;case 21:break;case 7:o&512&&(de||n===null||et(n,n.return)),n&&n.stateNode!==null&&(n.stateNode._fragmentFiber=e);default:vt(t,e,a),yt(e)}}function yt(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(Kv(n)){a=n;break}n=n.return}n=null;for(var o=e.return;o!==null;){if(cm(o)){var l=o.stateNode;n===null?n=[l]:n.push(l)}if(um(o))break;o=o.return}var s=n;if(a==null)throw Error(k(160));switch(a.tag){case 27:var c=a.stateNode,h=ld(e);ou(e,h,c,s);break;case 5:var g=a.stateNode;a.flags&32&&(Eo(g,""),a.flags&=-33);var v=ld(e);ou(e,v,g,s);break;case 3:case 4:var N=a.stateNode.containerInfo,f=ld(e);eh(e,f,N,s);break;default:throw Error(k(161))}}catch(y){ge(e,e.return,y)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function sy(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;sy(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,Do=!0,t.reset(),Do=!1),e=e.sibling}}function Fi(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)uy(t,e),t=t.sibling;else ey(t,!1)}function uy(e,t){var a=e.alternate;if(a===null)th(e,!1);else switch(e.tag){case 3:if(oh=Aa=!1,$p(),Fi(t,e),!Aa&&!ru){if(e=Oa,e!==null)for(var n=0;n<e.length;n+=3){a=e[n];var o=e[n+1];_y(a,e[n+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),oh=!0}Oa=null;break;case 5:Fi(t,e);break;case 4:n=Aa,Aa=!1,Fi(t,e),Aa&&(ru=!0),Aa=n;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?th(e,!1):Fi(t,e));break;case 30:n=Aa,o=$p(),Aa=!1,Fi(t,e),Aa&&(e.flags|=4);var l=e.memoizedProps,s=e.stateNode;t=an(l,s),s=an(a.memoizedProps,s);var c=un(l.default,l.update);c==="none"?t=!1:(l=a.memoizedState,a.memoizedState=null,a=e.child,At=0,t=dm(e,a,t,s,c,l,!0),At!==(l===null?0:l.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(Ao(e,e.memoizedProps.onUpdate),Oa=o):o!==null&&(o.push.apply(o,Oa),Oa=o),Aa=(e.flags&32)!==0?!0:n;break;default:Fi(t,e)}}function za(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)ty(e,t.alternate,t),t=t.sibling}function xn(e,t){for(e=e.child;e!==null;){var a=e,n=t;switch(a.tag){case 0:case 11:case 14:case 15:jn(4,a,a.return),xn(a,n);break;case 1:et(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&Zv(a,a.return,o),xn(a,n);break;case 27:(n&2)!==0&&Iy(a.stateNode,a.type,a.memoizedProps);case 5:et(a,a.return),a.tag!==5&&a.tag!==27||Ol(a),xn(a,n);break;case 6:Ol(a);break;case 26:et(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||de||o.parentNode.removeChild(o),xn(a,n);break;case 22:a.memoizedState===null&&xn(a,n);break;case 30:et(a,a.return),xn(a,n);break;case 7:et(a,a.return);default:xn(a,n)}e=e.sibling}}function fa(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var n=t.alternate,o=e,l=t,s=l.flags,c=(a&1)!==0;switch(l.tag){case 0:case 11:case 15:fa(o,l,a),lr(4,l);break;case 1:if(fa(o,l,a),n=l,o=n.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch(v){ge(n,n.return,v)}if(n=l,o=n.updateQueue,o!==null){var h=n.stateNode;try{var g=o.shared.hiddenCallbacks;if(g!==null)for(o.shared.hiddenCallbacks=null,o=0;o<g.length;o++)av(g[o],h)}catch(v){ge(n,n.return,v)}}c&&s&64&&Qv(l),Ma(l,l.return);break;case 27:(a&2)!==0&&Jv(l);case 5:l.tag!==5&&l.tag!==27||xp(l),fa(o,l,a),c&&n===null&&s&4&&Wd(l),Ma(l,l.return);break;case 6:xp(l);break;case 26:h=l.stateNode,l.memoizedState!==null||h===null||Ze||Sh(Zl(h.ownerDocument),l.type,h),fa(o,l,a),c&&n===null&&s&4&&Wd(l),Ma(l,l.return);break;case 12:fa(o,l,a);break;case 31:fa(o,l,a),c&&s&4&&oy(o,l);break;case 13:fa(o,l,a),c&&s&4&&ly(o,l);break;case 22:l.memoizedState===null&&fa(o,l,a),Ma(l,l.return);break;case 30:fa(o,l,a),Ma(l,l.return);break;case 7:Ma(l,l.return);default:fa(o,l,a)}t=t.sibling}}function hm(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&ir(a))}function mm(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ir(e))}function Pt(e,t,a,n){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)cy(e,t,a,n),t=t.sibling;else o&&Wv(t)}function cy(e,t,a,n){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&Rs(t);var l=t.flags;switch(t.tag){case 0:case 11:case 15:Pt(e,t,a,n),l&2048&&lr(9,t);break;case 1:Pt(e,t,a,n);break;case 3:Pt(e,t,a,n),o&&oh&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),l&2048&&(l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&ir(l)));break;case 12:if(l&2048){Pt(e,t,a,n),l=t.stateNode;try{var s=t.memoizedProps,c=s.id,h=s.onPostCommit;typeof h=="function"&&h(c,t.alternate===null?"mount":"update",l.passiveEffectDuration,-0)}catch(g){ge(t,t.return,g)}}else Pt(e,t,a,n);break;case 31:Pt(e,t,a,n);break;case 13:Pt(e,t,a,n);break;case 23:break;case 22:s=t.stateNode,c=t.alternate,t.memoizedState!==null?(o&&c!==null&&c.memoizedState===null&&Rs(c),s._visibility&2?Pt(e,t,a,n):Rl(e,t)):(o&&c!==null&&c.memoizedState!==null&&Rs(t),s._visibility&2?Pt(e,t,a,n):(s._visibility|=2,Wi(e,t,a,n,(t.subtreeFlags&10256)!==0||!1))),l&2048&&hm(c,t);break;case 24:Pt(e,t,a,n),l&2048&&mm(t.alternate,t);break;case 30:o&&(l=t.alternate,l!==null&&(qa(l.child,!0),qa(t.child,!0))),Pt(e,t,a,n);break;default:Pt(e,t,a,n)}}function Wi(e,t,a,n,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var l=e,s=t,c=a,h=n,g=s.flags;switch(s.tag){case 0:case 11:case 15:Wi(l,s,c,h,o),lr(8,s);break;case 23:break;case 22:var v=s.stateNode;s.memoizedState!==null?v._visibility&2?Wi(l,s,c,h,o):Rl(l,s):(v._visibility|=2,Wi(l,s,c,h,o)),o&&g&2048&&hm(s.alternate,s);break;case 24:Wi(l,s,c,h,o),o&&g&2048&&mm(s.alternate,s);break;default:Wi(l,s,c,h,o)}t=t.sibling}}function Rl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,o=n.flags;switch(n.tag){case 22:Rl(a,n),o&2048&&hm(n.alternate,n);break;case 24:Rl(a,n),o&2048&&mm(n.alternate,n);break;default:Rl(a,n)}t=t.sibling}}var oi=8192;function ai(e,t,a){if(e.subtreeFlags&oi)for(e=e.child;e!==null;)dy(e,t,a),e=e.sibling}function dy(e,t,a){switch(e.tag){case 26:ai(e,t,a),e.flags&oi&&(e.memoizedState!==null?T$(a,ga,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Jp(a,e)));break;case 5:ai(e,t,a),e.flags&oi&&(e=e.stateNode,(t&335544128)===t&&Jp(a,e));break;case 3:case 4:var n=ga;ga=Zl(e.stateNode.containerInfo),ai(e,t,a),ga=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=oi,oi=16777216,ai(e,t,a),oi=n):ai(e,t,a));break;case 30:if((e.flags&oi)!==0&&(n=e.memoizedProps.name,n!=null&&n!=="auto")){var o=e.stateNode;o.paired=null,Lt===null&&(Lt=new Map),Lt.set(n,o)}ai(e,t,a);break;default:ai(e,t,a)}}function hy(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function gl(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];Ke=n,fy(n,e)}hy(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)my(e),e=e.sibling}function my(e){switch(e.tag){case 0:case 11:case 15:gl(e),e.flags&2048&&jn(9,e,e.return);break;case 3:gl(e);break;case 12:gl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Vs(e)):gl(e);break;default:gl(e)}}function Vs(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];Ke=n,fy(n,e)}hy(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:jn(8,t,t.return),Vs(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Vs(t));break;default:Vs(t)}e=e.sibling}}function fy(e,t){for(;Ke!==null;){var a=Ke;switch(a.tag){case 0:case 11:case 15:jn(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:ir(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,Ke=n;else e:for(a=e;Ke!==null;){n=Ke;var o=n.sibling,l=n.return;if(ny(n),n===a){Ke=null;break e}if(o!==null){o.return=l,Ke=o;break e}Ke=l}}}var NN={getCacheForType:function(e){var t=at(Le),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return at(Le).controller.signal}},$N=typeof WeakMap=="function"?WeakMap:Map,re=0,ye=null,ee=null,te=0,me=0,Ht=null,Cn=!1,Bo=!1,fm=!1,rn=0,_e=0,In=0,hi=0,su=0,Bt=0,Co=0,Vl=null,Ct=null,sh=!1,zu=0,gy=0,uu=1/0,cu=null,Hn=null,Oe=0,ba=null,wi=null,Ua=0,uh=0,ch=null,py=null,xo=null,No=null,$o=null,Dl=0,Ds=null;function It(){return(re&2)!==0&&te!==0?te&-te:j.T!==null?pm():wb()}function by(){if(Bt===0)if((te&536870912)===0||P){var e=ns;ns<<=1,(ns&3932160)===0&&(ns=262144),Bt=e}else Bt=536870912;return e=lt.current,e!==null&&(e.flags|=32),Bt}function Ao(e,t){if(t!=null){var a=e.stateNode,n=a.ref;n===null&&(n=a.ref=Uy(an(e.memoizedProps,a))),No===null&&(No=[]),No.push(t.bind(null,n))}}function Mt(e,t,a){(e===ye&&(me===2||me===9)||e.cancelPendingCommit!==null)&&(zo(e,0),An(e,te,Bt,!1)),tr(e,a),((re&2)===0||e!==ye)&&(e===ye&&((re&2)===0&&(hi|=a),_e===4&&An(e,te,Bt,!1)),Ba(e))}function vy(e,t,a){if((re&6)!==0)throw Error(k(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||er(e,t),o=n?EN(e,t):sd(e,t,!0),l=n;do{if(o===0){Bo&&!n&&An(e,t,0,!1);break}else{if(a=e.current.alternate,l&&!SN(a)){o=sd(e,t,!1),l=!1;continue}if(o===2){if(l=t,e.errorRecoveryDisabledLanes&l)var s=0;else s=e.pendingLanes&-536870913,s=s!==0?s:s&536870912?536870912:0;if(s!==0){t=s;e:{var c=e;o=Vl;var h=c.current.memoizedState.isDehydrated;if(h&&(zo(c,s).flags|=256),s=sd(c,s,!1),s!==2&&s!==6){if(fm&&!h){c.errorRecoveryDisabledLanes|=l,hi|=l,o=4;break e}l=Ct,Ct=o,l!==null&&(Ct===null?Ct=l:Ct.push.apply(Ct,l))}o=s}if(l=!1,o!==2)continue}}if(o===1){zo(e,0),An(e,t,0,!0);break}e:{switch(n=e,l=o,l){case 0:case 1:throw Error(k(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:An(n,t,Bt,!Cn);break e;case 2:Ct=null;break;case 3:case 5:break;default:throw Error(k(329))}if((t&62914560)===t&&(o=zu+300-Gt(),10<o)){if(An(n,t,Bt,!Cn),pu(n,0,!0)!==0)break e;Ua=t,n.timeoutHandle=vm(Tp.bind(null,n,a,Ct,cu,sh,t,Bt,hi,Co,Cn,l,"Throttled",-0,0),o);break e}Tp(n,a,Ct,cu,sh,t,Bt,hi,Co,Cn,l,null,-0,0)}}break}while(!0);Ba(e)}function Tp(e,t,a,n,o,l,s,c,h,g,v,N,f,y){e.timeoutHandle=-1;var A=t.subtreeFlags,S=(l&335544064)===l;if(N=null,(S||A&8192||(A&16785408)===16785408)&&(N={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Va},Lt=null,dy(t,l,N),S&&(A=N,S=e.containerInfo,S=(S.nodeType===9?S:S.ownerDocument).__reactViewTransition,S!=null&&(A.count++,A.waitingForViewTransition=!0,A=Kl.bind(A),S.finished.then(A,A))),A=(l&62914560)===l?zu-Gt():(l&4194048)===l?gy-Gt():0,A=E$(N,A),A!==null)){Ua=l,e.cancelPendingCommit=A(kp.bind(null,e,t,l,a,n,o,s,c,h,g,v,N,null,f,y)),An(e,l,s,!g);return}kp(e,t,l,a,n,o,s,c,h,g,v,N)}function SN(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var o=a[n],l=o.getSnapshot;o=o.value;try{if(!Xt(l(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function An(e,t,a,n){t=gb(e,t),t&=~su,t&=~hi,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var o=t;0<o;){var l=31-jt(o),s=1<<l;n[l]=-1,o&=~s}a!==0&&bb(e,a,t)}function Mu(){return(re&6)===0?(rr(0,!1),!1):!0}function gm(){if(ee!==null){if(me===0)var e=ee.return;else e=ee,Pa=Ti=null,Ph(e),vo=null,Gl=0,e=ee;for(;e!==null;)Xv(e.alternate,e),e=e.return;ee=null}}function zo(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,XN(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),Ua=0,gm(),ye=e,ee=a=Wa(e.current,null),te=t,me=0,Ht=null,Cn=!1,Bo=er(e,t),fm=!1,Co=Bt=su=hi=In=_e=0,Ct=Vl=null,sh=!1,rn=gb(e,t),xu(),a}function yy(e,t){J=null,j.H=au,t===qo||t===Su?(t=Pg(),me=3):t===jh?(t=Pg(),me=4):me=t===lm?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Ht=t,ee===null&&(_e=1,nu(e,na(t,e.current)))}function wy(){var e=lt.current;return e===null?!0:(te&4194048)===te?ft===null:(te&62914560)===te||(te&536870912)!==0?e===ft:!1}function xy(){var e=j.H;return j.H=au,e===null?au:e}function Ny(){var e=j.A;return j.A=NN,e}function du(){_e=4,Cn||(te&4194048)!==te&&lt.current!==null||(Bo=!0),(In&134217727)===0&&(hi&134217727)===0||ye===null||An(ye,te,Bt,!1)}function sd(e,t,a){var n=re;re|=2;var o=xy(),l=Ny();(ye!==e||te!==t)&&(cu=null,zo(e,t)),t=!1;var s=_e;e:do try{if(me!==0&&ee!==null){var c=ee,h=Ht;switch(me){case 8:gm(),s=6;break e;case 3:case 2:case 9:case 6:lt.current===null&&(t=!0);var g=me;if(me=0,Ht=null,mo(e,c,h,g),a&&Bo){s=0;break e}break;default:g=me,me=0,Ht=null,mo(e,c,h,g)}}TN(),s=_e;break}catch(v){yy(e,v)}while(!0);return t&&e.shellSuspendCounter++,Pa=Ti=null,re=n,j.H=o,j.A=l,ee===null&&(ye=null,te=0,xu()),s}function TN(){for(;ee!==null;)$y(ee)}function EN(e,t){var a=re;re|=2;var n=xy(),o=Ny();ye!==e||te!==t?(cu=null,uu=Gt()+500,zo(e,t)):Bo=er(e,t);e:do try{if(me!==0&&ee!==null){t=ee;var l=Ht;t:switch(me){case 1:me=0,Ht=null,mo(e,t,l,1);break;case 2:case 9:if(Fg(l)){me=0,Ht=null,Ep(t);break}t=function(){me!==2&&me!==9||ye!==e||(me=7),Ba(e)},l.then(t,t);break e;case 3:me=7;break e;case 4:me=5;break e;case 7:Fg(l)?(me=0,Ht=null,Ep(t)):(me=0,Ht=null,mo(e,t,l,7));break;case 5:var s=null;switch(ee.tag){case 26:s=ee.memoizedState;case 5:case 27:var c=ee;if(s?Zy(s):c.stateNode.complete){me=0,Ht=null;var h=c.sibling;if(h!==null)ee=h;else{var g=c.return;g!==null?(ee=g,Ou(g)):ee=null}break t}}me=0,Ht=null,mo(e,t,l,5);break;case 6:me=0,Ht=null,mo(e,t,l,6);break;case 8:gm(),_e=6;break e;default:throw Error(k(462))}}kN();break}catch(v){yy(e,v)}while(!0);return Pa=Ti=null,j.H=n,j.A=o,re=a,ee!==null?0:(ye=null,te=0,xu(),_e)}function kN(){for(;ee!==null&&!j1();)$y(ee)}function $y(e){var t=Iv(e.alternate,e,rn);e.memoizedProps=e.pendingProps,t===null?Ou(e):ee=t}function Ep(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=fp(a,t,t.pendingProps,t.type,void 0,te);break;case 11:t=fp(a,t,t.pendingProps,t.type.render,t.ref,te);break;case 5:Ph(t);var n=t;n===Fe&&(P?(Ks(n),n.tag===5&&n.stateNode!=null&&(Ee=n.stateNode)):(Ks(n),P=!0));default:Xv(a,t),t=ee=Qb(t,rn),t=Iv(a,t,rn)}e.memoizedProps=e.pendingProps,t===null?Ou(e):ee=t}function mo(e,t,a,n){Pa=Ti=null,Ph(t),vo=null,Gl=0;var o=t.return;try{if(fN(e,o,t,a,te)){_e=1,nu(e,na(a,e.current)),ee=null;return}}catch(l){if(o!==null)throw ee=o,l;_e=1,nu(e,na(a,e.current)),ee=null;return}t.flags&32768?(P||n===1?e=!0:Bo||(te&536870912)!==0?e=!1:(Cn=e=!0,(n===2||n===9||n===3||n===6)&&(n=lt.current,n!==null&&n.tag===13&&(n.flags|=16384))),Sy(t,e)):Ou(t)}function Ou(e){var t=e;do{if((t.flags&32768)!==0){Sy(t,Cn);return}e=t.return;var a=vN(t.alternate,t,rn);if(a!==null){ee=a;return}if(t=t.sibling,t!==null){ee=t;return}ee=t=e}while(t!==null);_e===0&&(_e=5)}function Sy(e,t){do{var a=yN(e.alternate,e);if(a!==null){a.flags&=32767,ee=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){ee=e;return}ee=e=a}while(e!==null);_e=6,ee=null}function kp(e,t,a,n,o,l,s,c,h,g,v,N){e.cancelPendingCommit=null;do Ru();while(Oe!==0);if((re&6)!==0)throw Error(k(327));if(t!==null){if(t===e.current)throw Error(k(177));e===ye&&(ee=ye=null,te=0),wi=t,ba=e,Ua=a,ch=o,py=n,CN(e,t,a,s,c,h,N)}}function CN(e,t,a,n,o,l,s){var c=t.lanes|t.childLanes;if(uh=c,c|=Uh,ex(e,a,c,n,o,l),No=null,(a&335544064)===a?($o=aN(e),n=10262):($o=null,n=10256),(t.subtreeFlags&n)!==0||(t.flags&n)!==0?(e.callbackNode=null,e.callbackPriority=0,VN(js,function(){return fh(),null})):(e.callbackNode=null,e.callbackPriority=0),lu=!1,n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=j.T,j.T=null,o=se.p,se.p=2,l=re,re|=4;try{wN(e,t,a)}finally{re=l,se.p=o,j.T=n}}Oe=1,lu?xo=PN(s,e.containerInfo,$o,dh,hh,zN,mh,fh,AN,null,null):(dh(),hh(),mh())}function AN(e){if(Oe!==0){var t=ba.onRecoverableError;t(e,{componentStack:null})}}function zN(){Oe===3&&(Oe=0,uy(wi,ba),Oe=4)}function dh(){if(Oe===1){Oe=0;var e=ba,t=wi,a=Ua,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=j.T,j.T=null;var o=se.p;se.p=2;var l=re;re|=4;try{Nl=ru=!1,ry(t,e,a),a=vh;var s=qb(e.containerInfo),c=a.focusedElem,h=a.selectionRange;if(s!==c&&c&&c.ownerDocument&&Ub(c.ownerDocument.documentElement,c)){if(h!==null&&Hh(c)){var g=h.start,v=h.end;if(v===void 0&&(v=g),"selectionStart"in c)c.selectionStart=g,c.selectionEnd=Math.min(v,c.value.length);else{var N=c.ownerDocument||document,f=N&&N.defaultView||window;if(f.getSelection){var y=f.getSelection(),A=c.textContent.length,S=Math.min(h.start,A),V=h.end===void 0?S:Math.min(h.end,A);!y.extend&&S>V&&(s=V,V=S,S=s);var b=Yg(c,S),p=Yg(c,V);if(b&&p&&(y.rangeCount!==1||y.anchorNode!==b.node||y.anchorOffset!==b.offset||y.focusNode!==p.node||y.focusOffset!==p.offset)){var x=N.createRange();x.setStart(b.node,b.offset),y.removeAllRanges(),S>V?(y.addRange(x),y.extend(p.node,p.offset)):(x.setEnd(p.node,p.offset),y.addRange(x))}}}}for(N=[],y=c;y=y.parentNode;)y.nodeType===1&&N.push({element:y,left:y.scrollLeft,top:y.scrollTop});for(typeof c.focus=="function"&&c.focus(),c=0;c<N.length;c++){var T=N[c];T.element.scrollLeft=T.left,T.element.scrollTop=T.top}}Do=!!bh,vh=bh=null}finally{re=l,se.p=o,j.T=n}}e.current=t,Oe=2}}function hh(){if(Oe===2){Oe=0;var e=ba,t=wi,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=j.T,j.T=null;var n=se.p;se.p=2;var o=re;re|=4;try{ty(e,t.alternate,t)}finally{re=o,se.p=n,j.T=a}}Oe=3}}function mh(){if(Oe===4||Oe===3){Oe=0;var e=xo;xo=null,I1();var t=ba,a=wi,n=Ua,o=py,l=(n&335544064)===n?10262:10256;if((a.subtreeFlags&l)!==0||(a.flags&l)!==0?Oe=5:(Oe=0,wi=ba=null,Ty(t,t.pendingLanes)),l=t.pendingLanes,l===0&&(Hn=null),Mh(n),a=a.stateNode,Yt&&typeof Yt.onCommitFiberRoot=="function")try{Yt.onCommitFiberRoot(Wl,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=j.T,l=se.p,se.p=2,j.T=null;try{for(var s=t.onRecoverableError,c=0;c<o.length;c++){var h=o[c];s(h.value,{componentStack:h.stack})}}finally{j.T=a,se.p=l}}if(o=No,s=$o,$o=null,o!==null&&(No=null,s===null&&(s=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(s),a!==void 0&&e.finished.finally(a);(Ua&3)!==0&&Ru(),Ba(t),l=t.pendingLanes,(n&261930)!==0&&(l&42)!==0?t===Ds?Dl++:(Dl=0,Ds=t):(Dl=0,Ds=null),rr(0,!1)}}function Ty(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,ir(t)))}function Ru(){return xo!==null&&(xo.skipTransition(),xo=null),dh(),hh(),mh(),fh()}function fh(){if(Oe!==5)return!1;var e=ba,t=uh;uh=0;var a=Mh(Ua),n=j.T,o=se.p;try{se.p=32>a?32:a,j.T=null,a=ch,ch=null;var l=ba,s=Ua;if(Oe=0,wi=ba=null,Ua=0,(re&6)!==0)throw Error(k(331));var c=re;if(re|=4,my(l.current),cy(l,l.current,s,a),re=c,rr(0,!1),Yt&&typeof Yt.onPostCommitFiberRoot=="function")try{Yt.onPostCommitFiberRoot(Wl,l)}catch{}return!0}finally{se.p=o,j.T=n,Ty(e,t)}}function Cp(e,t,a){t=na(a,t),t=Qd(e.stateNode,t,2),e=Vn(e,t,2),e!==null&&(tr(e,2),Ba(e))}function ge(e,t,a){if(e.tag===3)Cp(e,e,a);else for(;t!==null;){if(t.tag===3){Cp(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(Hn===null||!Hn.has(n))){e=na(a,e),a=Lv(2),n=Vn(t,a,2),n!==null&&(Bv(a,n,t,e),tr(n,2),Ba(n));break}}t=t.return}}function ud(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new $N;var o=new Set;n.set(t,o)}else o=n.get(t),o===void 0&&(o=new Set,n.set(t,o));o.has(a)||(fm=!0,o.add(a),e=MN.bind(null,e,t,a),t.then(e,e))}function MN(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,ye===e&&(te&a)===a&&((_e===4||_e===3&&(te&62914560)===te&&300>Gt()-zu)&&(re&2)===0?zo(e,0):su|=a,Co===te&&(Co=0)),Ba(e)}function Ey(e,t){t===0&&(t=pb()),e=Si(e,t),e!==null&&(tr(e,t),Ba(e))}function ON(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Ey(e,a)}function RN(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(k(314))}n!==null&&n.delete(t),Ey(e,a)}function VN(e,t){return Ah(e,t)}var Mo=null,eo=null,gh=!1,hu=!1,cd=!1,zn=0;function Ba(e){e!==eo&&e.next===null&&(eo===null?Mo=eo=e:eo=eo.next=e),hu=!0,gh||(gh=!0,_N())}function rr(e,t){if(!cd&&hu){cd=!0;do for(var a=!1,n=Mo;n!==null;){if(!t)if(e!==0){var o=n.pendingLanes;if(o===0)var l=0;else{var s=n.suspendedLanes,c=n.pingedLanes;l=(1<<31-jt(42|e)+1)-1,l&=o&~(s&~c),l=l&201326741?l&201326741|1:l?l|2:0}l!==0&&(a=!0,Ap(n,l))}else l=te,l=pu(n,n===ye?l:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(l&3)===0||er(n,l)||(a=!0,Ap(n,l));n=n.next}while(a);cd=!1}}function DN(){ky()}function ky(){hu=gh=!1;var e=0;zn!==0&&IN()&&(e=zn);for(var t=Gt(),a=null,n=Mo;n!==null;){var o=n.next,l=Cy(n,t);l===0?(n.next=null,a===null?Mo=o:a.next=o,o===null&&(eo=a)):(a=n,(e!==0||(l&3)!==0)&&(hu=!0)),n=o}Oe!==0&&Oe!==5||rr(e,!1),zn!==0&&(zn=0)}function Cy(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,o=e.expirationTimes,l=e.pendingLanes&-62914561;0<l;){var s=31-jt(l),c=1<<s,h=o[s];h===-1?((c&a)===0||(c&n)!==0)&&(o[s]=W1(c,t)):h<=t&&(e.expiredLanes|=c),l&=~c}if(t=ye,a=te,a=pu(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(me===2||me===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&Gc(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||er(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&Gc(n),Mh(a)){case 2:case 8:a=mb;break;case 32:a=js;break;case 268435456:a=fb;break;default:a=js}return n=Ay.bind(null,e),a=Ah(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&Gc(n),e.callbackPriority=2,e.callbackNode=null,2}function Ay(e,t){if(Oe!==0&&Oe!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(Ru()&&e.callbackNode!==a)return null;var n=te;return n=pu(e,e===ye?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:(vy(e,n,t),Cy(e,Gt()),e.callbackNode!=null&&e.callbackNode===a?Ay.bind(null,e):null)}function Ap(e,t){if(Ru())return null;vy(e,t,!0)}function _N(){QN(function(){(re&6)!==0?Ah(hb,DN):ky()})}function pm(){if(zn===0){var e=pi;e===0&&(e=as,as<<=1,(as&261888)===0&&(as=256)),zn=e}return zn}function zp(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:$s(e)}function HN(e,t,a,n,o){if(t==="submit"&&a&&a.stateNode===o){var l=zp((o[Rt]||null).action),s=n.submitter;s&&(t=(t=s[Rt]||null)?zp(t.formAction):s.getAttribute("formAction"),t!==null&&(l=t,s=null));var c=new vu("action","action",null,n,o);e.push({event:c,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(zn!==0){var h=new FormData(o,s);Id(a,{pending:!0,data:h,method:o.method,action:l},null,h)}}else typeof l=="function"&&(c.preventDefault(),h=new FormData(o,s),Id(a,{pending:!0,data:h,method:o.method,action:l},l,h))},currentTarget:o}]})}}for(bs=0;bs<Vd.length;bs++)vs=Vd[bs],Mp=vs.toLowerCase(),Op=vs[0].toUpperCase()+vs.slice(1),va(Mp,"on"+Op);var vs,Mp,Op,bs;va(Bb,"onAnimationEnd");va(Gb,"onAnimationIteration");va(Yb,"onAnimationStart");va("dblclick","onDoubleClick");va("focusin","onFocus");va("focusout","onBlur");va(Zx,"onTransitionRun");va(Kx,"onTransitionStart");va(Jx,"onTransitionCancel");va(jb,"onTransitionEnd");To("onMouseEnter",["mouseout","mouseover"]);To("onMouseLeave",["mouseout","mouseover"]);To("onPointerEnter",["pointerout","pointerover"]);To("onPointerLeave",["pointerout","pointerover"]);Ni("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ni("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ni("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ni("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ni("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ni("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Il="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),UN=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Il));function zy(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],o=n.event;n=n.listeners;e:{var l=void 0;if(t)for(var s=n.length-1;0<=s;s--){var c=n[s],h=c.instance,g=c.currentTarget;if(c=c.listener,h!==l&&o.isPropagationStopped())break e;l=c,o.currentTarget=g;try{l(o)}catch(v){Xs(v)}o.currentTarget=null,l=h}else for(s=0;s<n.length;s++){if(c=n[s],h=c.instance,g=c.currentTarget,c=c.listener,h!==l&&o.isPropagationStopped())break e;l=c,o.currentTarget=g;try{l(o)}catch(v){Xs(v)}o.currentTarget=null,l=h}}}}function W(e,t){var a=t[Eg];a===void 0&&(a=t[Eg]=new Set);var n=e+"__bubble";a.has(n)||(My(t,e,2,!1),a.add(n))}function dd(e,t,a){var n=0;t&&(n|=4),My(a,e,n,t)}var ys="_reactListening"+Math.random().toString(36).slice(2);function bm(e){if(!e[ys]){e[ys]=!0,Nb.forEach(function(a){a!=="selectionchange"&&(UN.has(a)||dd(a,!1,e),dd(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[ys]||(t[ys]=!0,dd("selectionchange",!1,t))}}function My(e,t,a,n){switch(tw(t)){case 2:var o=z$;break;case 8:o=M$;break;default:o=Sm}a=o.bind(null,t,a,e),o=void 0,!zd||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),n?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function hd(e,t,a,n,o){var l=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var s=n.tag;if(s===3||s===4){var c=n.stateNode.containerInfo;if(c===o)break;if(s===4)for(s=n.return;s!==null;){var h=s.tag;if((h===3||h===4)&&s.stateNode.containerInfo===o)return;s=s.return}for(;c!==null;){if(s=li(c),s===null)return;if(h=s.tag,h===5||h===6||h===26||h===27){n=l=s;continue e}c=c.parentNode}}n=n.return}zb(function(){var g=l,v=Rh(a),N=[];e:{var f=Ib.get(e);if(f!==void 0){var y=vu,A=e;switch(e){case"keypress":if(Ts(a)===0)break e;case"keydown":case"keyup":y=Sx;break;case"focusin":A="focus",y=Zc;break;case"focusout":A="blur",y=Zc;break;case"beforeblur":case"afterblur":y=Zc;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":y=Vg;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":y=hx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":y=Ax;break;case Bb:case Gb:case Yb:y=gx;break;case jb:y=Mx;break;case"scroll":case"scrollend":y=cx;break;case"wheel":y=Rx;break;case"copy":case"cut":case"paste":y=bx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":y=_g;break;case"submit":y=kx;break;case"toggle":case"beforetoggle":y=Dx}var S=(t&4)!==0,V=!S&&(e==="scroll"||e==="scrollend"),b=S?f!==null?f+"Capture":null:f;S=[];for(var p=g,x;p!==null;){var T=p;if(x=T.stateNode,T=T.tag,T!==5&&T!==26&&T!==27||x===null||b===null||(T=Hl(p,b),T!=null&&S.push(Xl(p,T,x))),V)break;p=p.return}0<S.length&&(f=new y(f,A,null,a,v),N.push({event:f,listeners:S}))}}if((t&7)===0){e:{if(y=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",y&&a!==Ad&&(A=a.relatedTarget||a.fromElement)&&(li(A)||A[Ho]))break e;(f||y)&&(A=v.window===v?v:(y=v.ownerDocument)?y.defaultView||y.parentWindow:window,f?(y=a.relatedTarget||a.toElement,f=g,y=y?li(y):null,y!==null&&(V=Pl(y),S=y.tag,y!==V||S!==5&&S!==27&&S!==6)&&(y=null)):(f=null,y=g),f!==y&&(S=Vg,T="onMouseLeave",b="onMouseEnter",p="mouse",(e==="pointerout"||e==="pointerover")&&(S=_g,T="onPointerLeave",b="onPointerEnter",p="pointer"),V=f==null?A:wl(f),x=y==null?A:wl(y),A=new S(T,p+"leave",f,a,v),A.target=V,A.relatedTarget=x,T=null,li(v)===g&&(S=new S(b,p+"enter",y,a,v),S.target=x,S.relatedTarget=V,T=S),V=T,S=f&&y?bd(f,y,qN):null,f!==null&&Rp(N,A,f,S,!1),y!==null&&V!==null&&Rp(N,V,y,S,!0)))}e:{if(f=g?wl(g):window,y=f.nodeName&&f.nodeName.toLowerCase(),y==="select"||y==="input"&&f.type==="file")var z=Lg;else if(qg(f))if(_b)z=Ix;else{z=Yx;var I=Gx}else y=f.nodeName,!y||y.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?g&&Oh(g.elementType)&&(z=Lg):z=jx;if(z&&(z=z(e,g))){Db(N,z,a,v);break e}I&&I(e,f,g)}switch(I=g?wl(g):window,e){case"focusin":(qg(I)||I.contentEditable==="true")&&(lo=I,Od=g,Tl=null);break;case"focusout":Tl=Od=lo=null;break;case"mousedown":Rd=!0;break;case"contextmenu":case"mouseup":case"dragend":Rd=!1,jg(N,a,v);break;case"selectionchange":if(Qx)break;case"keydown":case"keyup":jg(N,a,v)}var _;if(_h)e:{switch(e){case"compositionstart":var q="onCompositionStart";break e;case"compositionend":q="onCompositionEnd";break e;case"compositionupdate":q="onCompositionUpdate";break e}q=void 0}else oo?Rb(e,a)&&(q="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(q="onCompositionStart");q&&(Ob&&a.locale!=="ko"&&(oo||q!=="onCompositionStart"?q==="onCompositionEnd"&&oo&&(_=Mb()):(En=v,Vh="value"in En?En.value:En.textContent,oo=!0)),I=mu(g,q),0<I.length&&(q=new Dg(q,e,null,a,v),N.push({event:q,listeners:I}),_?q.data=_:(_=Vb(a),_!==null&&(q.data=_)))),(_=Hx?Ux(e,a):qx(e,a))&&(q=mu(g,"onBeforeInput"),0<q.length&&(I=new Dg("onBeforeInput","beforeinput",null,a,v),N.push({event:I,listeners:q}),I.data=_)),HN(N,e,g,a,v)}zy(N,t)})}function Xl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function mu(e,t){for(var a=t+"Capture",n=[];e!==null;){var o=e,l=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||l===null||(o=Hl(e,a),o!=null&&n.unshift(Xl(e,o,l)),o=Hl(e,t),o!=null&&n.push(Xl(e,o,l))),e.tag===3)return n;e=e.return}return[]}function qN(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Rp(e,t,a,n,o){for(var l=t._reactName,s=[];a!==null&&a!==n;){var c=a,h=c.alternate,g=c.stateNode;if(c=c.tag,h!==null&&h===n)break;c!==5&&c!==26&&c!==27||g===null||(h=g,o?(g=Hl(a,l),g!=null&&s.unshift(Xl(a,g,h))):o||(g=Hl(a,l),g!=null&&s.push(Xl(a,g,h)))),a=a.return}s.length!==0&&e.push({event:t,listeners:s})}var LN=/\r\n?/g,BN=/\u0000|\uFFFD/g;function Vp(e){return(typeof e=="string"?e:""+e).replace(LN,`
`).replace(BN,"")}function Oy(e,t){return t=Vp(t),Vp(e)===t}function fe(e,t,a,n,o,l){switch(a){case"children":if(typeof n=="string")t==="body"||t==="textarea"&&n===""||Eo(e,n);else if(typeof n=="number"||typeof n=="bigint")t!=="body"&&Eo(e,""+n);else return;break;case"className":os(e,"class",n);break;case"tabIndex":os(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":os(e,a,n);break;case"style":Ab(e,n,l);return;case"data":if(t!=="object"){os(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=$s(n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof l=="function"&&(a==="formAction"?(t!=="input"&&fe(e,t,"name",o.name,o,null),fe(e,t,"formEncType",o.formEncType,o,null),fe(e,t,"formMethod",o.formMethod,o,null),fe(e,t,"formTarget",o.formTarget,o,null)):(fe(e,t,"encType",o.encType,o,null),fe(e,t,"method",o.method,o,null),fe(e,t,"target",o.target,o,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=$s(n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=Va);return;case"onScroll":n!=null&&W("scroll",e);return;case"onScrollEnd":n!=null&&W("scrollend",e);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(k(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(k(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=$s(n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":W("beforetoggle",e),W("toggle",e),Ns(e,"popover",n);break;case"xlinkActuate":Ka(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":Ka(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":Ka(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":Ka(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":Ka(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":Ka(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":Ka(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":Ka(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":Ka(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":Ns(e,"is",n);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=sx.get(a)||a,Ns(e,a,n);else return}oe=!0}function ph(e,t,a,n,o,l){switch(a){case"style":Ab(e,n,l);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(k(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(k(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof n=="string")Eo(e,n);else if(typeof n=="number"||typeof n=="bigint")Eo(e,""+n);else return;break;case"onScroll":n!=null&&W("scroll",e);return;case"onScrollEnd":n!=null&&W("scrollend",e);return;case"onClick":n!=null&&(e.onclick=Va);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!$b.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),l=a.slice(2,o?a.length-7:void 0),t=e[Rt]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(l,t,o),typeof n=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(l,n,o);break e}oe=!0,a in e?e[a]=n:n===!0?e.setAttribute(a,""):Ns(e,a,n)}return}oe=!0}function ot(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":W("error",e),W("load",e);var n=!1,o=!1,l;for(l in a)if(a.hasOwnProperty(l)){var s=a[l];if(s!=null)switch(l){case"src":n=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(k(137,t));default:fe(e,t,l,s,a,null)}}o&&fe(e,t,"srcSet",a.srcSet,a,null),n&&fe(e,t,"src",a.src,a,null);return;case"input":W("invalid",e);var c=l=s=o=null,h=null,g=null;for(n in a)if(a.hasOwnProperty(n)){var v=a[n];if(v!=null)switch(n){case"name":o=v;break;case"type":s=v;break;case"checked":h=v;break;case"defaultChecked":g=v;break;case"value":l=v;break;case"defaultValue":c=v;break;case"children":case"dangerouslySetInnerHTML":if(v!=null)throw Error(k(137,t));break;default:fe(e,t,n,v,a,null)}}Eb(e,l,c,h,g,s,o,!1);return;case"select":W("invalid",e),n=s=l=null;for(o in a)if(a.hasOwnProperty(o)&&(c=a[o],c!=null))switch(o){case"value":l=c;break;case"defaultValue":s=c;break;case"multiple":n=c;default:fe(e,t,o,c,a,null)}t=l,a=s,e.multiple=!!n,t!=null?go(e,!!n,t,!1):a!=null&&go(e,!!n,a,!0);return;case"textarea":W("invalid",e),l=o=n=null;for(s in a)if(a.hasOwnProperty(s)&&(c=a[s],c!=null))switch(s){case"value":n=c;break;case"defaultValue":o=c;break;case"children":l=c;break;case"dangerouslySetInnerHTML":if(c!=null)throw Error(k(91));break;default:fe(e,t,s,c,a,null)}Cb(e,n,o,l);return;case"option":for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!=null)&&(h==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":fe(e,t,h,n,a,null));return;case"dialog":W("beforetoggle",e),W("toggle",e),W("cancel",e),W("close",e);break;case"iframe":case"object":W("load",e);break;case"video":case"audio":for(n=0;n<Il.length;n++)W(Il[n],e);break;case"image":W("error",e),W("load",e);break;case"details":W("toggle",e);break;case"embed":case"source":case"link":W("error",e),W("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(n=a[g],n!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(k(137,t));default:fe(e,t,g,n,a,null)}return;default:if(Oh(t)){for(v in a)a.hasOwnProperty(v)&&(n=a[v],n!==void 0&&ph(e,t,v,n,a,void 0));return}}for(c in a)a.hasOwnProperty(c)&&(n=a[c],n!=null&&fe(e,t,c,n,a,null))}var GN={};function YN(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,l=null,s=null,c=null,h=null,g=null,v=null;for(y in a){var N=a[y];if(a.hasOwnProperty(y)&&N!=null)switch(y){case"checked":break;case"value":break;case"defaultValue":h=N;default:n.hasOwnProperty(y)||fe(e,t,y,null,n,N)}}for(var f in n){var y=n[f];if(N=a[f],n.hasOwnProperty(f)&&(y!=null||N!=null))switch(f){case"type":y!==N&&(oe=!0),l=y;break;case"name":y!==N&&(oe=!0),o=y;break;case"checked":y!==N&&(oe=!0),g=y;break;case"defaultChecked":y!==N&&(oe=!0),v=y;break;case"value":y!==N&&(oe=!0),s=y;break;case"defaultValue":y!==N&&(oe=!0),c=y;break;case"children":case"dangerouslySetInnerHTML":if(y!=null)throw Error(k(137,t));break;default:y!==N&&fe(e,t,f,y,n,N)}}Cd(e,s,c,h,g,v,l,o);return;case"select":y=s=c=f=null;for(l in a)if(h=a[l],a.hasOwnProperty(l)&&h!=null)switch(l){case"value":break;case"multiple":y=h;default:n.hasOwnProperty(l)||fe(e,t,l,null,n,h)}for(o in n)if(l=n[o],h=a[o],n.hasOwnProperty(o)&&(l!=null||h!=null))switch(o){case"value":l!==h&&(oe=!0),f=l;break;case"defaultValue":l!==h&&(oe=!0),c=l;break;case"multiple":l!==h&&(oe=!0),s=l;default:l!==h&&fe(e,t,o,l,n,h)}t=c,a=s,n=y,f!=null?go(e,!!a,f,!1):!!n!=!!a&&(t!=null?go(e,!!a,t,!0):go(e,!!a,a?[]:"",!1));return;case"textarea":y=f=null;for(c in a)if(o=a[c],a.hasOwnProperty(c)&&o!=null&&!n.hasOwnProperty(c))switch(c){case"value":break;case"children":break;default:fe(e,t,c,null,n,o)}for(s in n)if(o=n[s],l=a[s],n.hasOwnProperty(s)&&(o!=null||l!=null))switch(s){case"value":o!==l&&(oe=!0),f=o;break;case"defaultValue":o!==l&&(oe=!0),y=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(k(91));break;default:o!==l&&fe(e,t,s,o,n,l)}kb(e,f,y);return;case"option":for(var A in a)f=a[A],a.hasOwnProperty(A)&&f!=null&&!n.hasOwnProperty(A)&&(A==="selected"?e.selected=!1:fe(e,t,A,null,n,f));for(h in n)f=n[h],y=a[h],n.hasOwnProperty(h)&&f!==y&&(f!=null||y!=null)&&(h==="selected"?(f!==y&&(oe=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):fe(e,t,h,f,n,y));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var S in a)f=a[S],a.hasOwnProperty(S)&&f!=null&&!n.hasOwnProperty(S)&&fe(e,t,S,null,n,f);for(g in n)if(f=n[g],y=a[g],n.hasOwnProperty(g)&&f!==y&&(f!=null||y!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(k(137,t));break;default:fe(e,t,g,f,n,y)}return;default:if(Oh(t)){for(var V in a)f=a[V],a.hasOwnProperty(V)&&f!==void 0&&!n.hasOwnProperty(V)&&ph(e,t,V,void 0,n,f);for(v in n)f=n[v],y=a[v],!n.hasOwnProperty(v)||f===y||f===void 0&&y===void 0||ph(e,t,v,f,n,y);return}}for(var b in a)f=a[b],a.hasOwnProperty(b)&&f!=null&&!n.hasOwnProperty(b)&&fe(e,t,b,null,n,f);for(N in n)f=n[N],y=a[N],!n.hasOwnProperty(N)||f===y||f==null&&y==null||fe(e,t,N,f,n,y)}function Dp(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function jN(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var o=a[n],l=o.transferSize,s=o.initiatorType,c=o.duration;if(l&&c&&Dp(s)){for(s=0,c=o.responseEnd,n+=1;n<a.length;n++){var h=a[n],g=h.startTime;if(g>c)break;var v=h.transferSize,N=h.initiatorType;v&&Dp(N)&&(h=h.responseEnd,s+=v*(h<c?1:(c-g)/(h-g)))}if(--n,t+=8*(l+s)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var bh=null,vh=null;function Ql(e){return e.nodeType===9?e:e.ownerDocument}function _p(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Ry(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Vy(e,t,a,n){return a=Ql(a).createElement(e),a[tt]=n,a[Rt]=t,ot(a,e,t),Je(a),a}function yh(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var md=null;function IN(){var e=window.event;return e&&e.type==="popstate"?e===md?!1:(md=e,!0):(md=null,!1)}var vm=typeof setTimeout=="function"?setTimeout:void 0,XN=typeof clearTimeout=="function"?clearTimeout:void 0,Hp=typeof Promise=="function"?Promise:void 0,Up=typeof requestAnimationFrame=="function"?requestAnimationFrame:vm,QN=typeof queueMicrotask=="function"?queueMicrotask:typeof Hp<"u"?function(e){return Hp.resolve(null).then(e).catch(ZN)}:vm;function ZN(e){setTimeout(function(){throw e})}function Qn(e){return e==="head"}function qp(e,t){var a=t,n=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(o),_o(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")gd(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,gd(a);for(var l=a.firstChild;l;){var s=l.nextSibling,c=l.nodeName;l[ar]||c==="SCRIPT"||c==="STYLE"||c==="LINK"&&l.rel.toLowerCase()==="stylesheet"||a.removeChild(l),l=s}}else a==="body"&&gd(e.ownerDocument.body);a=o}while(a);_o(t)}function Lp(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function Dy(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var n=1;else for(var o=n=0;o<t.length;o++){var l=t[o];0<l.width&&0<l.height&&n++}n===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function _y(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function Hy(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function wh(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return Hy(t,a,e)}function KN(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return Hy(t,a,e)}function JN(e){return e.documentElement.clientHeight}function FN(e){this.addEventListener("load",e),this.addEventListener("error",e)}function PN(e,t,a,n,o,l,s,c,h){var g=t.nodeType===9?t:t.ownerDocument;try{var v=g.startViewTransition({update:function(){var f=g.defaultView,y=f.navigation&&f.navigation.transition,A=g.fonts.status;n();var S=[];if(A==="loaded"&&(JN(g),g.fonts.status==="loading"&&S.push(g.fonts.ready)),A=S.length,e!==null)for(var V=e.suspenseyImages,b=0,p=0;p<V.length;p++){var x=V[p];if(!x.complete){var T=x.getBoundingClientRect();if(0<T.bottom&&0<T.right&&T.top<f.innerHeight&&T.left<f.innerWidth){if(b+=Ky(x),b>Us){S.length=A;break}x=new Promise(FN.bind(x)),S.push(x)}}}if(0<S.length)return f=Promise.race([Promise.all(S),new Promise(function(z){return setTimeout(z,500)})]).then(o,o),(y?Promise.allSettled([y.finished,f]):f).then(l,l);if(o(),y)return y.finished.then(l,l);l()},types:a});g.__reactViewTransition=v;var N=[];return v.ready.then(function(){for(var f=g.documentElement.getAnimations({subtree:!0}),y=0;y<f.length;y++){var A=f[y],S=A.effect,V=S.pseudoElement;if(V!=null&&V.startsWith("::view-transition")){N.push(A),A=S.getKeyframes();for(var b=V=void 0,p=!0,x=0;x<A.length;x++){var T=A[x],z=T.width;if(V===void 0)V=z;else if(V!==z){p=!1;break}if(z=T.height,b===void 0)b=z;else if(b!==z){p=!1;break}delete T.width,delete T.height,T.transform==="none"&&delete T.transform}p&&V!==void 0&&b!==void 0&&(S.setKeyframes(A),p=getComputedStyle(S.target,S.pseudoElement),p.width!==V||p.height!==b)&&(p=A[0],p.width=V,p.height=b,p=A[A.length-1],p.width=V,p.height=b,S.setKeyframes(A))}}s()},function(f){g.__reactViewTransition===v&&(g.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{n(),o(),s()}}),v.finished.finally(function(){for(var f=0;f<N.length;f++)N[f].cancel();g.__reactViewTransition===v&&(g.__reactViewTransition=null),c()}),v}catch{return n(),o(),s(),null}}function ri(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}ri.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:we({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};ri.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),n=[],o=0;o<a.length;o++){var l=a[o].effect;l!==null&&l.target===e&&l.pseudoElement===t&&n.push(a[o])}return n};ri.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function Uy(e){return{name:e,group:new ri("group",e),imagePair:new ri("image-pair",e),old:new ri("old",e),new:new ri("new",e)}}function Qt(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}Qt.prototype.addEventListener=function(e,t,a){var n=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(n=a.signal||null,n!==null&&n.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var l=this._eventListeners;if(qy(l,e,t,a)===-1){var s=this,c=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(c=function(h){s.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),n!==null&&(o=s.removeEventListener.bind(s,e,t,a),n.addEventListener("abort",o,{once:!0}),o=n.removeEventListener.bind(n,"abort",o)),n=Oo(a),l.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:c,cleanup:o}),Ot(this._fragmentFiber.child,!1,WN,e,c,n)}this._eventListeners=l}};function WN(e,t,a,n){return Ie(e).addEventListener(t,a,n),!1}Qt.prototype.removeEventListener=function(e,t,a){var n=this._eventListeners;if(n!==null&&(t=qy(n,e,t,a),t!==-1)){var o=n[t];a=o.attachedListener;var l=o.cleanup;o=Oo(o.optionsOrUseCapture),Ot(this._fragmentFiber.child,!1,e$,e,a,o),n.splice(t,1),l!==null&&l()}};function e$(e,t,a,n){return Ie(e).removeEventListener(t,a,n),!1}function Oo(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function Bp(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function qy(e,t,a,n){if(e.length===0)return-1;n=Bp(n);for(var o=0;o<e.length;o++){var l=e[o];if(l.type===t&&l.listener===a&&Bp(l.optionsOrUseCapture)===n)return o}return-1}Qt.prototype.dispatchEvent=function(e){var t=xi(this._fragmentFiber);if(t===null)return!0;t=Ie(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var n=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var l=a[o];n.addEventListener(l.type,l.attachedListener,Oo(l.optionsOrUseCapture))}if(t.appendChild(n),e=n.dispatchEvent(e),a)for(o=0;o<a.length;o++)l=a[o],n.removeEventListener(l.type,l.attachedListener,Oo(l.optionsOrUseCapture));return t.removeChild(n),e}return t.dispatchEvent(e)};Qt.prototype.focus=function(e){Ot(this._fragmentFiber.child,!0,Ly,e,void 0,void 0)};function Ly(e,t){return e.tag===6?!1:(e=Ie(e),h$(e,t))}Qt.prototype.focusLast=function(e){var t=[];Ot(this._fragmentFiber.child,!0,ym,t,void 0,void 0);for(var a=t.length-1;0<=a&&!Ly(t[a],e);a--);};function ym(e,t){return t.push(e),!1}Qt.prototype.blur=function(){var e=xi(this._fragmentFiber);e!==null&&(e=Ie(e),e=Ql(e).activeElement,e!==null&&Ot(this._fragmentFiber.child,!1,t$,e,void 0,void 0))};function t$(e,t){return e.tag===6?!1:(e=Ie(e),e===t||e.contains(t)?(t.blur(),!0):!1)}Qt.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Ot(this._fragmentFiber.child,!1,a$,e,void 0,void 0)};function a$(e,t){return e.tag===6||(e=Ie(e),t.observe(e)),!1}Qt.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Ot(this._fragmentFiber.child,!1,n$,e,void 0,void 0);for(var a=t=0;a<pa.length;a++){var n=pa[a];n.fragmentInstance===this&&n.observer===e?e.unobserve(n.instance):pa[t++]=n}pa.length=t}};function n$(e,t){return e.tag===6||(e=Ie(e),t.unobserve(e)),!1}var pa=[],fd=!1;function i$(e,t,a){pa.push({fragmentInstance:e,observer:t,instance:a}),fd||(fd=!0,m$(function(){fd=!1;var n=pa;pa=[];for(var o=0;o<n.length;o++){var l=n[o];l.observer.unobserve(l.instance)}}))}Qt.prototype.getClientRects=function(){var e=[];return Ot(this._fragmentFiber.child,!1,o$,e,void 0,void 0),e};function o$(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=Ie(e),t.push.apply(t,e.getClientRects());return!1}Qt.prototype.getRootNode=function(e){var t=xi(this._fragmentFiber);return t===null?this:Ie(t).getRootNode(e)};Qt.prototype.compareDocumentPosition=function(e){var t=xi(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Ot(this._fragmentFiber.child,!1,ym,a,void 0,void 0);var n=Ie(t);if(a.length===0){if(a=n,wg(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=n=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:n&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=sb(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=Ie(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=Ie(a[0]),o=Ie(a[a.length-1]);var l=wg(this._fragmentFiber)?t.parentElement:n;if(l==null)return Node.DOCUMENT_POSITION_DISCONNECTED;n=l.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,l=l.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var s=t.compareDocumentPosition(e),c=o.compareDocumentPosition(e),h=s&Node.DOCUMENT_POSITION_CONTAINED_BY||c&Node.DOCUMENT_POSITION_CONTAINED_BY;return c=n&&l&&s&Node.DOCUMENT_POSITION_FOLLOWING&&c&Node.DOCUMENT_POSITION_PRECEDING,t=n&&t===e||l&&o===e||h||c?Node.DOCUMENT_POSITION_CONTAINED_BY:!n&&t===e||!l&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:s,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||l$(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function l$(e,t,a,n,o){var l=li(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!l)e:{for(;l!==null;){if(l.tag===7&&(l===t||l.alternate===t)){a=!0;break e}l=l.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(l===null)return l=o.ownerDocument,o===l||o===l.documentElement||o===l.body;e:{for(l=t,t=xi(t);l!==null;){if(!(l.tag!==5&&l.tag!==3&&l.tag!==27||l!==t&&l.alternate!==t)){l=!0;break e}l=l.return}l=!1}return l}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!l)&&!(t=l===a)&&(t=bd(a,l,xg),t===null?t=!1:(Ot(t,!0,_1,l,a),l=to,to=null,t=l!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!l)&&!(t=l===n)&&(t=bd(n,l,xg),t===null?t=!1:(Ot(t,!0,H1,l,n),l=to,pd=to=null,t=l!==null)),t):!1}function Gp(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}Qt.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(k(566));var t=[];Ot(this._fragmentFiber.child,!1,ym,t,void 0,void 0);var a=e!==!1;if(t.length===0){var n=sb(this._fragmentFiber);if(n=a?n[1]||n[0]||xi(this._fragmentFiber):n[0]||n[1],n===null)return;if(n.tag===6){e=Ie(n),Gp(e,a);return}if(n=Ie(n),n.nodeType!==9){if(n.nodeType===11){a="host"in n?n.host:null,a!==null&&a.scrollIntoView(e);return}n.scrollIntoView(e)}}for(n=a?t.length-1:0;n!==(a?-1:t.length);){var o=t[n];o.tag===6?(o=Ie(o),Gp(o,a)):Ie(o).scrollIntoView(e),n+=a?-1:1}};function r$(e,t){return e=Ie(e),By(e,t),!1}function By(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function Gy(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.addEventListener(o.type,o.attachedListener,Oo(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){for(var s=0,c=0;c<pa.length;c++){var h=pa[c];(h.fragmentInstance!==t||h.observer!==l||h.instance!==e)&&(pa[s++]=h)}pa.length=s,l.observe(e)}),By(e,t))}function s$(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.removeEventListener(o.type,o.attachedListener,Oo(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){typeof l.rootMargin=="string"?i$(t,l,e):l.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function xh(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":xh(a),bu(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function u$(e,t,a,n){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[ar])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(l=e.getAttribute("rel"),l==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(l!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(l=e.getAttribute("src"),(l!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&l&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var l=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===l)return e}else return e;if(e=oa(e.nextSibling),e===null)break}return null}function c$(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=oa(e.nextSibling),e===null))return null;return e}function Yy(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=oa(e.nextSibling),e===null))return null;return e}function Nh(e){return e.data==="$?"||e.data==="$~"}function wm(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function d$(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function oa(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var $h=null;function Yp(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return oa(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function jp(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function h$(e,t){function a(){n=!0}if(e.ownerDocument.activeElement===e)return!0;var n=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return n}function m$(e){Up(function(){Up(function(t){return e(t)})})}function jy(e,t,a){switch(t=Ql(a),e){case"html":if(e=t.documentElement,!e)throw Error(k(452));return e;case"head":if(e=t.head,!e)throw Error(k(453));return e;case"body":if(e=t.body,!e)throw Error(k(454));return e;default:throw Error(k(451))}}function Iy(e,t,a){for(var n in a){var o=a[n];a.hasOwnProperty(n)&&o!=null&&fe(e,t,n,null,GN,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===Va&&(e.onclick=null),bu(e)}function gd(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);bu(e)}var la=new Map,Ip=new Set;function Zl(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var cn=se.d;se.d={f:f$,r:g$,D:p$,C:b$,L:v$,m:y$,X:x$,S:w$,M:N$};function f$(){var e=cn.f(),t=Mu();return e||t}function g$(e){var t=Uo(e);t!==null&&t.tag===5&&t.type==="form"?Av(t):cn.r(e)}var Go=typeof document>"u"?null:document;function Xy(e,t,a){var n=Go;if(n&&typeof t=="string"&&t){var o=aa(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),Ip.has(o)||(Ip.add(o),e={rel:e,crossOrigin:a,href:t},n.querySelector(o)===null&&(t=n.createElement("link"),ot(t,"link",e),Je(t),n.head.appendChild(t)))}}function p$(e){cn.D(e),Xy("dns-prefetch",e,null)}function b$(e,t){cn.C(e,t),Xy("preconnect",e,t)}function v$(e,t,a){cn.L(e,t,a);var n=Go;if(n&&e&&t){var o='link[rel="preload"][as="'+aa(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+aa(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+aa(a.imageSizes)+'"]')):o+='[href="'+aa(e)+'"]';var l=o;switch(t){case"style":l=Ro(e);break;case"script":l=Yo(e)}if(!(la.has(l)||(e=we({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),la.set(l,e),n.querySelector(o)!==null||t==="style"&&n.querySelector(sr(l))||t==="script"&&n.querySelector(ur(l))))){var s=n.createElement("link");ot(s,"link",e),t==="style"&&(s[Is]=!0,s.onload=s.onerror=function(){xb(s)}),Je(s),n.head.appendChild(s)}}}function y$(e,t){cn.m(e,t);var a=Go;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+aa(n)+'"][href="'+aa(e)+'"]',l=o;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":l=Yo(e)}if(!la.has(l)&&(e=we({rel:"modulepreload",href:e},t),la.set(l,e),a.querySelector(o)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(ur(l)))return}n=a.createElement("link"),ot(n,"link",e),Je(n),a.head.appendChild(n)}}}function w$(e,t,a){cn.S(e,t,a);var n=Go;if(n&&e){var o=fo(n).hoistableStyles,l=Ro(e);t=t||"default";var s=o.get(l);if(!s){var c={loading:0,preload:null};if(s=n.querySelector(sr(l)))c.loading=5;else{e=we({rel:"stylesheet",href:e,"data-precedence":t},a),(a=la.get(l))&&xm(e,a);var h=s=n.createElement("link");Je(h),ot(h,"link",e),h._p=new Promise(function(g,v){h.onload=g,h.onerror=v}),h.addEventListener("load",function(){c.loading|=1}),h.addEventListener("error",function(){c.loading|=2}),c.loading|=4,_s(s,t,n)}s={type:"stylesheet",instance:s,count:1,state:c},o.set(l,s)}}}function x$(e,t){cn.X(e,t);var a=Go;if(a&&e){var n=fo(a).hoistableScripts,o=Yo(e),l=n.get(o);l||(l=a.querySelector(ur(o)),l||(e=we({src:e,async:!0},t),(t=la.get(o))&&Nm(e,t),l=a.createElement("script"),Je(l),ot(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function N$(e,t){cn.M(e,t);var a=Go;if(a&&e){var n=fo(a).hoistableScripts,o=Yo(e),l=n.get(o);l||(l=a.querySelector(ur(o)),l||(e=we({src:e,async:!0,type:"module"},t),(t=la.get(o))&&Nm(e,t),l=a.createElement("script"),Je(l),ot(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function Xp(e,t,a,n){var o=(o=Mn.current)?Zl(o):null;if(!o)throw Error(k(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=Ro(a.href),t=fo(o).hoistableStyles,n=t.get(a),n||(n={type:"style",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=Ro(a.href);var l=fo(o).hoistableStyles,s=l.get(e);if(s||(o=o.ownerDocument||o,s={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},l.set(e,s),(l=o.querySelector(sr(e)))?l._p||(s.instance=l,s.state.loading=5):(l=la.get(e),l||(l={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},la.set(e,l)),$$(o,e,l,s.state))),t&&n===null)throw Error(k(528,""));return s}if(t&&n!==null)throw Error(k(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=Yo(a),t=fo(o).hoistableScripts,n=t.get(a),n||(n={type:"script",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(k(444,e))}}function Ro(e){return'href="'+aa(e)+'"'}function sr(e){return'link[rel="stylesheet"]['+e+"]"}function Qy(e){return we({},e,{"data-precedence":e.precedence,precedence:null})}function $$(e,t,a,n){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Is]!==!0){n.loading=1;return}}else t=e.createElement("link"),t[Is]=!0,t.onload=t.onerror=xb.bind(null,t),ot(t,"link",a),Je(t),e.head.appendChild(t);n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2})}function Yo(e){return'[src="'+aa(e)+'"]'}function ur(e){return"script[async]"+e}function Qp(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+aa(a.href)+'"]');if(n)return t.instance=n,Je(n),n;var o=we({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),Je(n),ot(n,"style",o),_s(n,a.precedence,e),t.instance=n;case"stylesheet":o=Ro(a.href);var l=e.querySelector(sr(o));if(l)return t.state.loading|=4,t.instance=l,Je(l),l;n=Qy(a),(o=la.get(o))&&xm(n,o),l=(e.ownerDocument||e).createElement("link"),Je(l);var s=l;return s._p=new Promise(function(c,h){s.onload=c,s.onerror=h}),ot(l,"link",n),t.state.loading|=4,_s(l,a.precedence,e),t.instance=l;case"script":return l=Yo(a.src),(o=e.querySelector(ur(l)))?(t.instance=o,Je(o),o):(n=a,(o=la.get(l))&&(n=we({},a),Nm(n,o)),e=e.ownerDocument||e,o=e.createElement("script"),Je(o),ot(o,"link",n),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(k(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,_s(n,a.precedence,e));return t.instance}function _s(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=n.length?n[n.length-1]:null,l=o,s=0;s<n.length;s++){var c=n[s];if(c.dataset.precedence===t)l=c;else if(l!==o)break}l?l.parentNode.insertBefore(e,l.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function xm(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Nm(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Hs=null;function Zp(e,t,a){if(Hs===null){var n=new Map,o=Hs=new Map;o.set(a,n)}else o=Hs,n=o.get(a),n||(n=new Map,o.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var l=a[o];if(!(l[ar]||l[tt]||e==="link"&&l.getAttribute("rel")==="stylesheet")&&l.namespaceURI!=="http://www.w3.org/2000/svg"){var s=l.getAttribute(t)||"";s=e+s;var c=n.get(s);c?c.push(l):n.set(s,[l])}}return n}function Sh(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function S$(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Kp(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function Zy(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function Ky(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Jp(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=Ky(t),e.suspenseyImages.push(t)),e=k$.bind(e),t.decode().then(e,e))}function T$(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=Ro(n.href),l=t.querySelector(sr(o));if(l){t=l._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Kl.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=l,Je(l);return}l=t.ownerDocument||t,n=Qy(n),(o=la.get(o))&&xm(n,o),l=l.createElement("link"),Je(l);var s=l;s._p=new Promise(function(c,h){s.onload=c,s.onerror=h}),ot(l,"link",n),a.instance=l}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Kl.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Us=0;function E$(e,t){return e.stylesheets&&e.count===0&&qs(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&qs(e,e.stylesheets),e.unsuspend){var l=e.unsuspend;e.unsuspend=null,l()}},6e4+t);0<e.imgBytes&&Us===0&&(Us=62500*jN());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&qs(e,e.stylesheets),e.unsuspend)){var l=e.unsuspend;e.unsuspend=null,l()}},(e.imgBytes>Us?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(o)}}:null}function Jy(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)qs(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Kl(){this.count--,Jy(this)}function k$(){this.imgCount--,Jy(this)}var fu=null;function qs(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,fu=new Map,t.forEach(C$,e),fu=null,Kl.call(e))}function C$(e,t){if(!(t.state.loading&4)){var a=fu.get(e);if(a)var n=a.get(null);else{a=new Map,fu.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),l=0;l<o.length;l++){var s=o[l];(s.nodeName==="LINK"||s.getAttribute("media")!=="not all")&&(a.set(s.dataset.precedence,s),n=s)}n&&a.set(null,n)}o=t.instance,s=o.getAttribute("data-precedence"),l=a.get(s)||n,l===n&&a.set(null,o),a.set(s,o),this.count++,n=Kl.bind(this),o.addEventListener("load",n),o.addEventListener("error",n),l?l.parentNode.insertBefore(o,l.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var Vo={$$typeof:Ra,Provider:null,Consumer:null,_currentValue:si,_currentValue2:si,_threadCount:0};function A$(e,t,a,n,o,l,s,c,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Yc(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Yc(0),this.hiddenUpdates=Yc(null),this.identifierPrefix=n,this.onUncaughtError=o,this.onCaughtError=l,this.onRecoverableError=s,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function Fy(e,t,a,n,o,l,s,c,h,g,v,N){return e=new A$(e,t,a,s,h,g,v,N,c),t=1,l===!0&&(t|=24),l=zt(3,null,null,t),e.current=l,l.stateNode=e,t=Gh(),t.refCount++,e.pooledCache=t,t.refCount++,l.memoizedState={element:n,isDehydrated:a,cache:t},Ih(l),e}function Py(e){return e?(e=uo,e):uo}function Wy(e,t,a,n,o,l){o=Py(o),n.context===null?n.context=o:n.pendingContext=o,n=Rn(t),n.payload={element:a},l=l===void 0?null:l,l!==null&&(n.callback=l),a=Vn(e,n,t),a!==null&&(Mt(a,e,t),kl(a,e,t))}function Fp(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function $m(e,t){Fp(e,t),(e=e.alternate)&&Fp(e,t)}function ew(e){if(e.tag===13||e.tag===31){var t=Si(e,67108864);t!==null&&Mt(t,e,67108864),$m(e,67108864)}}function Pp(e){if(e.tag===13||e.tag===31){var t=It();t=zh(t);var a=Si(e,t);a!==null&&Mt(a,e,t),$m(e,t)}}var Do=!0;function z$(e,t,a,n){var o=j.T;j.T=null;var l=se.p;try{se.p=2,Sm(e,t,a,n)}finally{se.p=l,j.T=o}}function M$(e,t,a,n){var o=j.T;j.T=null;var l=se.p;try{se.p=8,Sm(e,t,a,n)}finally{se.p=l,j.T=o}}function Sm(e,t,a,n){if(Do){var o=Th(n);if(o===null)hd(e,t,n,gu,a),Wp(e,n);else if(R$(o,e,t,a,n))n.stopPropagation();else if(Wp(e,n),t&4&&-1<O$.indexOf(e)){for(;o!==null;){var l=Uo(o);if(l!==null)switch(l.tag){case 3:if(l=l.stateNode,l.current.memoizedState.isDehydrated){var s=ni(l.pendingLanes);if(s!==0){var c=l;for(c.pendingLanes|=2,c.entangledLanes|=2;s;){var h=1<<31-jt(s);c.entanglements[1]|=h,s&=~h}Ba(l),(re&6)===0&&(uu=Gt()+500,rr(0,!1))}}break;case 31:case 13:c=Si(l,2),c!==null&&Mt(c,l,2),Mu(),$m(l,2)}if(l=Th(n),l===null&&hd(e,t,n,gu,a),l===o)break;o=l}o!==null&&n.stopPropagation()}else hd(e,t,n,null,a)}}function Th(e){return e=Rh(e),Tm(e)}var gu=null;function Tm(e){if(gu=null,e=li(e),e!==null){var t=Pl(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=ob(t),e!==null)return e;e=null}else if(a===31){if(e=lb(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return gu=e,null}function tw(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(X1()){case hb:return 2;case mb:return 8;case js:case Q1:return 32;case fb:return 268435456;default:return 32}default:return 32}}var Eh=!1,Un=null,qn=null,Ln=null,Jl=new Map,Fl=new Map,Sn=[],O$="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Wp(e,t){switch(e){case"focusin":case"focusout":Un=null;break;case"dragenter":case"dragleave":qn=null;break;case"mouseover":case"mouseout":Ln=null;break;case"pointerover":case"pointerout":Jl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Fl.delete(t.pointerId)}}function pl(e,t,a,n,o,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:l,targetContainers:[o]},t!==null&&(t=Uo(t),t!==null&&ew(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function R$(e,t,a,n,o){switch(t){case"focusin":return Un=pl(Un,e,t,a,n,o),!0;case"dragenter":return qn=pl(qn,e,t,a,n,o),!0;case"mouseover":return Ln=pl(Ln,e,t,a,n,o),!0;case"pointerover":var l=o.pointerId;return Jl.set(l,pl(Jl.get(l)||null,e,t,a,n,o)),!0;case"gotpointercapture":return l=o.pointerId,Fl.set(l,pl(Fl.get(l)||null,e,t,a,n,o)),!0}return!1}function aw(e){var t=li(e.target);if(t!==null){var a=Pl(t);if(a!==null){if(t=a.tag,t===13){if(t=ob(a),t!==null){e.blockedOn=t,Tg(e.priority,function(){Pp(a)});return}}else if(t===31){if(t=lb(a),t!==null){e.blockedOn=t,Tg(e.priority,function(){Pp(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Ls(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=Th(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);Ad=n,a.target.dispatchEvent(n),Ad=null}else return t=Uo(a),t!==null&&ew(t),e.blockedOn=a,!1;t.shift()}return!0}function eb(e,t,a){Ls(e)&&a.delete(t)}function V$(){Eh=!1,Un!==null&&Ls(Un)&&(Un=null),qn!==null&&Ls(qn)&&(qn=null),Ln!==null&&Ls(Ln)&&(Ln=null),Jl.forEach(eb),Fl.forEach(eb)}function ws(e,t){e.blockedOn===t&&(e.blockedOn=null,Eh||(Eh=!0,Xe.unstable_scheduleCallback(Xe.unstable_NormalPriority,V$)))}var xs=null;function tb(e){xs!==e&&(xs=e,Xe.unstable_scheduleCallback(Xe.unstable_NormalPriority,function(){xs===e&&(xs=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],o=e[t+2];if(typeof n!="function"){if(Tm(n||a)===null)continue;break}var l=Uo(a);l!==null&&(e.splice(t,3),t-=3,Id(l,{pending:!0,data:o,method:a.method,action:n},n,o))}}))}function _o(e){function t(h){return ws(h,e)}Un!==null&&ws(Un,e),qn!==null&&ws(qn,e),Ln!==null&&ws(Ln,e),Jl.forEach(t),Fl.forEach(t);for(var a=0;a<Sn.length;a++){var n=Sn[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<Sn.length&&(a=Sn[0],a.blockedOn===null);)aw(a),a.blockedOn===null&&Sn.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var o=a[n],l=a[n+1],s=o[Rt]||null;if(typeof l=="function")s||tb(a);else if(s){var c=null;if(l&&l.hasAttribute("formAction")){if(o=l,s=l[Rt]||null)c=s.formAction;else if(Tm(o)!==null)continue}else c=s.action;typeof c=="function"?a[n+1]=c:(a.splice(n,3),n-=3),tb(a)}}}function nw(){function e(l){l.canIntercept&&l.info==="react-transition"&&l.intercept({handler:function(){return new Promise(function(s){return o=s})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var l=navigation.currentEntry;l&&l.url!=null&&navigation.navigate(l.url,{state:l.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function Em(e){this._internalRoot=e}Vu.prototype.render=Em.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(k(409));var a=t.current,n=It();Wy(a,n,e,t,null,null)};Vu.prototype.unmount=Em.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Wy(e.current,2,null,e,null,null),Mu(),t[Ho]=null}};function Vu(e){this._internalRoot=e}Vu.prototype.unstable_scheduleHydration=function(e){if(e){var t=wb();e={blockedOn:null,target:e,priority:t};for(var a=0;a<Sn.length&&t!==0&&t<Sn[a].priority;a++);Sn.splice(a,0,e),a===0&&aw(e)}};var ab=nb.version;if(ab!=="19.3.0")throw Error(k(527,ab,"19.3.0"));se.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(k(188)):(e=Object.keys(e).join(","),Error(k(268,e)));return e=D1(t),e=e!==null?rb(e):null,e=e===null?null:e.stateNode,e};var D$={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:j,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(bl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!bl.isDisabled&&bl.supportsFiber))try{Wl=bl.inject(D$),Yt=bl}catch{}var bl;Du.createRoot=function(e,t){if(!ib(e))throw Error(k(299));var a=!1,n="",o=Hv,l=Uv,s=qv;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(l=t.onCaughtError),t.onRecoverableError!==void 0&&(s=t.onRecoverableError)),t=Fy(e,1,!1,null,null,a,n,null,o,l,s,nw),e[Ho]=t.current,bm(e),new Em(t)};Du.hydrateRoot=function(e,t,a){if(!ib(e))throw Error(k(299));var n=!1,o="",l=Hv,s=Uv,c=qv,h=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(l=a.onUncaughtError),a.onCaughtError!==void 0&&(s=a.onCaughtError),a.onRecoverableError!==void 0&&(c=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=Fy(e,1,!0,t,a??null,n,o,h,l,s,c,nw),t.context=Py(null),a=t.current,n=It(),n=zh(n),o=Rn(n),o.callback=null,Vn(a,o,n),a=n,t.current.lanes=a,tr(t,a),Ba(t),e[Ho]=t.current,bm(e),new Vu(t)};Du.version="19.3.0"});var rw=Ea((B5,lw)=>{"use strict";function ow(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(ow)}catch(e){console.error(e)}}ow(),lw.exports=iw()});var ww=Ea(qu=>{"use strict";var G$=Symbol.for("react.transitional.element"),Y$=Symbol.for("react.fragment");function yw(e,t,a){var n=null;if(a!==void 0&&(n=""+a),t.key!==void 0&&(n=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:G$,type:e,key:n,ref:t!==void 0?t:null,props:a}}qu.Fragment=Y$;qu.jsx=yw;qu.jsxs=yw});var Am=Ea((K5,xw)=>{"use strict";xw.exports=ww()});var m=Zr(Jr()),jw=Zr(rw());function _$(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),n="",o=[],l=[];for(let s=0;s<a.length;s++){let c=a[s],h=/^ {0,3}(`{3,}|~{3,})/.exec(c)?.[1];if(h&&(n?h[0]===n[0]&&h.length>=n.length&&(n=""):n=h),!n&&!c.trim()&&(!t||s<a.length-1)){let g=o.join(`
`).trim();g&&l.push(g),o=[]}else o.push(c)}if(!t){let s=o.join(`
`).trim();s&&l.push(s)}return l}var H$=['"',"'","\u201D","\u2019","\xBB","\u300D"],U$=['"',"'","\u201C","\u2018","\xAB","\u300C"];function sw(e){let t=e.trim();return H$.includes(t.slice(-1))&&U$.some(n=>t.slice(0,-1).includes(n))?"speech":"prose"}function uw(e,t){let a=_$(e),n=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return n();let o=[],l=[],s=[],c=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){o.push(a[h]),l.push(c),s.push(g.expression??null),c=[];continue}let v={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};o.length?l[l.length-1].push(v):c.push(v)}return o.length===0?n():{paragraphs:o,asides:l,expressions:s}}var q$="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function Ei(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],n=new RegExp(q$,"g"),o=0,l,s=c=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+c};return}a.push({kind:"text",text:c})};for(;(l=n.exec(e))!==null;)l.index>o&&s(e.slice(o,l.index)),l[1]!=null?s(l[1]):l[2]!=null&&l[3]!=null?a.push({kind:"link",text:l[2],href:l[3]}):l[4]!=null?a.push({kind:"code",text:l[4]}):l[5]!=null?a.push({kind:"styled",style:"highlight",children:Ei(l[5],t+1)}):l[6]!=null?a.push({kind:"styled",style:"strikethrough",children:Ei(l[6],t+1)}):l[7]!=null?a.push({kind:"styled",style:"bold-italic",children:Ei(l[7],t+1)}):l[8]!=null?a.push({kind:"styled",style:"bold",children:Ei(l[8],t+1)}):l[9]!=null?a.push({kind:"styled",style:"underline",children:Ei(l[9],t+1)}):(l[10]!=null||l[11]!=null)&&a.push({kind:"styled",style:"italic",children:Ei(l[10]??l[11],t+1)}),o=l.index+l[0].length;return o<e.length&&s(e.slice(o)),a}function cw(e){return Ei(e,0)}function dn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function dw(e){return e===null||typeof e=="string"}function hw(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function _u(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function L$(e){return e===null?!0:dn(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function B$(e){if(!dn(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.purpose!="string"||typeof e.category!="string"||!_u(e.capabilities)||!dn(e.presentation)||!dn(e.occupancy)||!dn(e.state))return!1;let{presentation:t,occupancy:a,state:n}=e;return L$(t.image)&&hw(t.x)&&hw(t.y)&&typeof a.playerHome=="boolean"&&dw(a.residentCharacterId)&&dw(a.homeKind)&&typeof n.condition=="string"&&_u(n.upgrades)&&_u(n.furniture)&&_u(n.publicFacts)&&typeof n.updatedAt=="string"}function mw(e){if(!dn(e)||!dn(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(B$),n=Array.isArray(e.venueRequests)?e.venueRequests:[],o=n.filter(l=>dn(l)&&typeof l.id=="string"&&dn(l.venueDraft)&&typeof l.venueDraft.name=="string"&&typeof l.venueDraft.purpose=="string"&&typeof l.venueDraft.category=="string");return a.length===t.length&&o.length===n.length&&n===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function fw(e,t,a){return e==="Enter"&&!t&&!a}function Hu(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,n=>n.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function gw(e,t,a,n){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(n,o)}function pw(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var Zn=(e,t,a)=>Math.min(a,Math.max(t,e));function Uu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function km(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let n=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,Uu(e,t)),l=e.width*n*o,s=e.height*n*o,c=t.width/2-a.centerX*l,h=t.height/2-a.centerY*s;return{left:l<=t.width?(t.width-l)/2:Zn(c,t.width-l,0),top:s<=t.height?(t.height-s)/2:Zn(h,t.height-s,0),width:l,height:s}}function bw(e,t,a,n,o,l){let s=km(e,t,a);if(!s.width||!s.height)return a;let c=Uu(e,t),h=Zn(a.zoom*l,c,Math.max(4,c*2)),g=h/Math.max(a.zoom,c),v=s.width*g,N=s.height*g,f=(n.x-s.left)/s.width,y=(n.y-s.top)/s.height,A=o.x-f*v,S=o.y-y*N;return{zoom:h,centerX:Zn((t.width/2-A)/v,0,1),centerY:Zn((t.height/2-S)/N,0,1)}}function vw(e,t){let a=Math.max(1,t),n=Math.max(4,a*2);return .32+1.03*((Zn(e,a,n)-a)/(n-a))}function Cm(e,t,a){let n=Math.min(90,t.width/2),o=e.left+a.x*e.width,l=e.top+a.y*e.height;return{left:Zn(o,n,t.width-n),top:Zn(l>t.height-130?l-116:l,0,Math.max(0,t.height-116))}}var r=Zr(Am()),i="marinara-capability-villages",Nw="marinara-capability-villages-styles",j$="/api/villages",I$=[{value:"fresh-start",label:"Fresh start"},{value:"refuge",label:"Refuge"},{value:"shared-project",label:"Shared project"},{value:"discovery",label:"Discovery"},{value:"homecoming",label:"Homecoming"},{value:"something-else",label:"Something else"}],$w={roads:!0,structures:!1,water:!1},Sw=["Village identity","Connections","Village map","Build the village","Review"],Tw=1,zm=3,Mm="__villages_image_disabled__",Um=["neutral","happy","sad","angry","surprised","thinking"],Ew="A small home with a modest main room and a quiet place to rest.";function X$(e){let t=[];for(let a of e){let n=t[t.length-1];n&&n.label===a.dateLabel?n.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}function qm(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":Kw.format(t)}function Q$(e){return qm(e.occurredAt)}function Z$(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function kw(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Om(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var K$=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function J$(e,t){let a=[],n=Date.parse(e);if(Number.isFinite(n)){let l=Math.floor((Date.now()-n)/864e5);a.push(l<=0?"written today":l===1?"written yesterday":`written ${l} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${K$.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function F$(e,t){return e.find(a=>a.id===t)?.presentation.image?.url??""}var Lm=class extends m.Component{constructor(){super(...arguments);Lf(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let n=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=n,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:n},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${i}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h1",{className:`${i}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${i}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},P$=`
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
`;function Cw(){let e=document.getElementById(Nw);if(!document.querySelector(i)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=Nw,t.textContent=P$,document.head.appendChild(t)}var W$="marinara_admin_secret";function Iw(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(W$)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var e5="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function Xw(e,t,a){let n=e?.error,o=typeof n=="string"&&n?n:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${e5} (${o})`):new Error(o)}async function D(e,t){let a=await fetch(`${j$}${e}`,{...t,headers:Iw(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw Xw(n,a.status,`The village replied ${a.status}.`);return mw(n)}async function Gm(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:Iw(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw Xw(n,a.status,`The Engine replied ${a.status}.`);return n}var ki=e=>typeof e=="number"&&Number.isFinite(e);function Qw(e){let t=e;for(let N=0;N<2&&typeof t=="string";N+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:n,srcY:o,srcWidth:l,srcHeight:s}=a;if(ki(n)&&ki(o)&&ki(l)&&ki(s))return l<=0||s<=0||n<0||o<0||n+l>1.001||o+s>1.001?null:{srcX:n,srcY:o,srcWidth:l,srcHeight:s};let{zoom:c,offsetX:h,offsetY:g,fullImage:v}=a;return!ki(c)||c<=0||!ki(h)||!ki(g)||v!==void 0&&typeof v!="boolean"?null:v===void 0?{zoom:c,offsetX:h,offsetY:g}:{zoom:c,offsetX:h,offsetY:g,fullImage:v}}function t5(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function a5(e,t){if(e.length===0)return{};let a=await Gm("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),n={};if(!Array.isArray(a))return n;for(let o of a){let l=typeof o?.id=="string"?o.id:"",s=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";l.length>0&&s.length>0&&(n[l]={url:s,crop:Qw(o.avatarCrop)})}return n}async function n5(e,t){let a=e.trim();if(a.length===0)return null;let n=await Gm(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof n?.avatarPath=="string"?n.avatarPath.trim():"";return o.length===0?null:{url:o,crop:Qw(n.avatarCrop)}}function i5(e){let t=[];for(let a of e){let n=typeof a.id=="string"?a.id.trim():"";if(n.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let l=typeof a.name=="string"&&a.name.trim()?a.name.trim():n;t.push({id:n,name:l,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function U(e,t){return e instanceof Error&&e.message?e.message:t}function cr(e){let t=U(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function Aw(e){try{let{session:t}=await D("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}function zw(e){let t=U(e,"The greeting could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The greeting took too long. Retry it or continue without a greeting.":`${t} Retry it or continue without a greeting.`}function hr(e,t){return Zw(cw(e),t)}function Zw(e,t){let a=0;return e.map(n=>{let o=`${t}${a++}`;switch(n.kind){case"text":return n.text;case"code":return(0,r.jsx)("code",{className:`${i}-chat-md-code`,dir:"ltr",children:n.text},o);case"link":return(0,r.jsx)("a",{className:`${i}-chat-md-link`,href:n.href,target:"_blank",rel:"noopener noreferrer",children:n.text},o);default:return o5(n,o)}})}function o5(e,t){let a=Zw(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${i}-chat-md-highlight`,children:a},t)}}function l5(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function fr(e){return e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null}function mr(e){return e.filter(t=>fr(t))}function ya(e){return e.filter(t=>!fr(t))}function r5(e,t){let a=mr(e);return a.length!==t.length?!1:t.every((n,o)=>{let l=a[o];return l.id===n.id&&l.occupancy.homeKind===n.building&&l.occupancy.playerHome===n.isPlayerHome&&l.occupancy.residentCharacterId===n.characterId&&l.description===n.description&&Math.abs((l.presentation.x??-1)-(n.x??-1))<1e-4&&Math.abs((l.presentation.y??-1)-(n.y??-1))<1e-4})}function Mw(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let l=a.get(o.id);return{id:o.id,name:l?.name??"",purpose:l?.purpose??"",description:o.description,category:l?.category??"",presentation:{image:l?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:o.building},capabilities:l?.capabilities??[],state:l?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...ya(e)]}function Lu(){return Math.random().toString(36).slice(2,10)}function Ci(e){return Math.round(e*1e4)/1e4}var s5=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),Kw=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),u5=6e4,c5=700;function Ow(e){return`${s5.format(e)} \xB7 ${Kw.format(e)}`}function d5(){let[e,t]=(0,m.useState)(()=>Ow(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(Ow(new Date)),1e3);return()=>clearInterval(a)},[]),e}function h5(){let[e,t]=d5().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${i}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function m5({weather:e}){return(0,r.jsxs)("span",{className:`${i}-mobile-datetime`,children:[(0,r.jsx)(h5,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:f5(e)})]})}function f5(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function Rw(e){return e?.closest(i)??null}function g5(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(Rw(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,n=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":n,title:n,onClick:o=>{let l=Rw(o.currentTarget);if(!l)return;if(document.fullscreenElement===l){document.exitFullscreen().catch(()=>{});return}let s=l.requestFullscreen?.();s&&s.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function p5({happenings:e,recap:t,mobile:a=!1}){let n=(0,m.useRef)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let s=n.current;if(!s)return;let c=()=>l(s.open);return s.addEventListener("toggle",c),()=>s.removeEventListener("toggle",c)},[]),(0,m.useEffect)(()=>{if(!o)return;let s=c=>{!(c.target instanceof Node)||n.current?.contains(c.target)||n.current?.removeAttribute("open")};return document.addEventListener("pointerdown",s),document.addEventListener("keydown",s),()=>{document.removeEventListener("pointerdown",s),document.removeEventListener("keydown",s)}},[o]),(0,r.jsxs)("details",{ref:n,className:`${i}-news`,children:[(0,r.jsxs)("summary",{className:`${i}-button ${i}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${i}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${i}-news-panel`,children:[(0,r.jsx)("h2",{className:`${i}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${i}-news-list`,children:t.details.map(s=>(0,r.jsx)("li",{className:`${i}-news-item`,children:s.text},`recap-${s.id}`))}):null,t.summaries.map(s=>(0,r.jsx)("p",{className:`${i}-news-empty`,children:s},s)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${i}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${i}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${i}-news-list`,children:e.map(s=>(0,r.jsx)("li",{className:`${i}-news-item`,children:s.text},s.id))})]})]})}function Jw(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function Vw(e){return e.length>0?Jw(e,!0):"Empty house"}function Gu(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function Rm(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function Dw(e,t){return t.length>0?Jw(t,!0):e.name||"An empty house"}function dr(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var b5=.028;function Yu(e){return new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(typeof n.result=="string"?n.result:""),n.onerror=()=>a(new Error("That picture could not be read.")),n.readAsDataURL(e)})}function Vm(e){return new Promise((t,a)=>{let n=new Image;n.onload=()=>t({width:n.naturalWidth,height:n.naturalHeight}),n.onerror=()=>a(new Error("That picture could not be read.")),n.src=e})}var _w=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function Dm(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function _m(e,t,a){return e<t?t:e>a?a:e}function v5(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let s=Math.min(t.width/e.width,t.height/e.height),c=e.width*s,h=e.height*s;return{left:(t.width-c)/2,top:(t.height-h)/2,width:c,height:h}}let n=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*n,l=e.height*n;return{left:(t.width-o)*(a.focusX/100),top:(t.height-l)*(a.focusY/100),width:o,height:l}}function y5(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Bu(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function Hm({src:e,alt:t,pins:a,placing:n,view:o,shape:l,zoom:s,onPlace:c,onView:h,onDismiss:g,compact:v,fitToRoom:N,mobile:f,photoPins:y,children:A}){let S=c!==void 0,V=h!==void 0,b=(0,m.useRef)(null),p=(0,m.useRef)(null),[x,T]=(0,m.useState)(null),[z,I]=(0,m.useState)(null),[_,q]=(0,m.useState)(null),ae=(0,m.useRef)(null),M=(0,m.useRef)(new Map),he=(0,m.useRef)(null),[rt,st]=(0,m.useState)(null),[wa,Ga]=(0,m.useState)(null),ra=(0,m.useRef)(null),Re=(0,m.useRef)(null),K=(0,m.useRef)(!1),[le,Ya]=(0,m.useState)(null),xe=(0,m.useMemo)(()=>le?{...o,...le}:o,[le,o]),ut=e?x?.src===e?x:null:l,F={zoom:ut&&z?Uu(ut,z):1,centerX:.5,centerY:.5},ue=_??F,X=(0,m.useMemo)(()=>f?ut&&z?km(ut,z,ue):null:e?x&&x.src===e&&z?v5(x,z,xe):null:z?{left:0,top:0,width:z.width,height:z.height}:null,[x,z,xe,f,ut,ue,e]);(0,m.useEffect)(()=>{q(null),ae.current=null,M.current.clear(),he.current=null},[e,z?.width,z?.height]);let Nt=l?N&&rt?{width:`${rt.width}px`,height:`${rt.height}px`,aspectRatio:`${l.width} / ${l.height}`}:{aspectRatio:`${l.width} / ${l.height}`}:void 0,ja=(0,m.useCallback)(()=>{let C=p.current;if(!C)return;let H=C.getBoundingClientRect();H.width===0||H.height===0||I(ie=>ie&&ie.width===H.width&&ie.height===H.height?ie:{width:H.width,height:H.height})},[]);(0,m.useEffect)(()=>{let C=p.current;if(!C||typeof ResizeObserver>"u")return;let H=new ResizeObserver(()=>ja());return H.observe(C),()=>H.disconnect()},[ja]);let $t=(0,m.useCallback)(()=>{let C=b.current?.parentElement;if(!C||!l)return;let H=C.getBoundingClientRect(),ie=getComputedStyle(C),Ce=ct=>Number.parseFloat(ie.getPropertyValue(ct))||0,gt=H.width-Ce("padding-left")-Ce("padding-right"),Dt=H.height-Ce("padding-top")-Ce("padding-bottom"),sa=l.width/l.height,Ge=Math.min(gt,Dt*sa);Ge>0&&st(ct=>ct&&Math.abs(ct.width-Ge)<.5?ct:{width:Ge,height:Ge/sa})},[l]);(0,m.useLayoutEffect)(()=>{if(!N||($t(),typeof ResizeObserver>"u"))return;let C=b.current?.parentElement;if(!C)return;let H=new ResizeObserver(()=>$t());return H.observe(C),()=>H.disconnect()},[N,$t]);let hn=(0,m.useCallback)(C=>{if(!S||!c||!X)return;let H=C.currentTarget.getBoundingClientRect(),ie=(C.clientX-H.left-X.left)/X.width,Ce=(C.clientY-H.top-X.top)/X.height;!(ie>=0&&ie<=1)||!(Ce>=0&&Ce<=1)||c(Ci(ie),Ci(Ce))},[c,S,X]),Io=(0,m.useCallback)(C=>{if(!V||!X||!h||xe.fit!=="cover")return;let H=C.currentTarget.getBoundingClientRect();ra.current={x:C.clientX,y:C.clientY,focusX:xe.focusX,focusY:xe.focusY,spanX:H.width-X.width,spanY:H.height-X.height},Ya({focusX:xe.focusX,focusY:xe.focusY}),C.currentTarget.setPointerCapture(C.pointerId),C.preventDefault()},[V,xe.focusX,xe.focusY,xe.fit,h,X]),O=(0,m.useCallback)(C=>{let H=ra.current;if(!H)return;let ie=H.spanX===0?H.focusX:H.focusX+(C.clientX-H.x)/H.spanX*100,Ce=H.spanY===0?H.focusY:H.focusY+(C.clientY-H.y)/H.spanY*100;Ya({focusX:Ci(_m(ie,0,100)),focusY:Ci(_m(Ce,0,100))})},[]),Ne=(0,m.useCallback)(C=>{if(!ra.current)return;ra.current=null,C.currentTarget.hasPointerCapture(C.pointerId)&&C.currentTarget.releasePointerCapture(C.pointerId);let H=le;Ya(null),H&&h&&h({...o,...H})},[le,h,o]),ne=(0,m.useCallback)(C=>{!h||!s||h({...o,zoom:Ci(_m(C,s.min,s.max))})},[h,o,s]),Ue=()=>{let C=[...M.current.values()];if(C.length===0){he.current=null;return}let H=C[0],ie=C[1];he.current={view:ae.current??ue,x:ie?(H.x+ie.x)/2:H.x,y:ie?(H.y+ie.y)/2:H.y,distance:ie?Math.hypot(H.x-ie.x,H.y-ie.y):1}},G=C=>{if(!f||C.pointerType!=="touch"||(C.isPrimary&&(M.current.clear(),K.current=!1),!p.current)||C.target instanceof Element&&C.target.closest(`.${i}-doors, .${i}-zoom`))return;let H=p.current.getBoundingClientRect();M.current.set(C.pointerId,{x:C.clientX-H.left,y:C.clientY-H.top}),M.current.size>1&&(K.current=!0),Ue()},Ai=C=>{if(!f||!M.current.has(C.pointerId)||!ut||!z||!p.current)return;let H=p.current.getBoundingClientRect();M.current.set(C.pointerId,{x:C.clientX-H.left,y:C.clientY-H.top});let ie=[...M.current.values()],Ce=ie[0],gt=ie[1],Dt=gt?(Ce.x+gt.x)/2:Ce.x,sa=gt?(Ce.y+gt.y)/2:Ce.y,Ge=gt?Math.hypot(Ce.x-gt.x,Ce.y-gt.y):1,ct=he.current;if(!ct||!pw(ct,{x:Dt,y:sa,distance:Ge})&&!K.current)return;K.current||g?.(),K.current=!0;let Jn=bw(ut,z,ct.view,{x:ct.x,y:ct.y},{x:Dt,y:sa},gt&&ct.distance>0?Ge/ct.distance:1);ae.current=Jn,q(Jn)},Vt=(C,H=!1)=>{if(!f||!M.current.has(C.pointerId))return;let ie=!H&&M.current.size===1&&!K.current;if(M.current.delete(C.pointerId),Ue(),!ie||!(C.target instanceof Element))return;let Ce=C.target.closest(`.${i}-pin`)?.dataset.pinId,gt=Ce?a.find(Dt=>Dt.id===Ce):null;if(gt?.onSelect){K.current=!0,gt.onSelect();return}if(!(!C.target.closest(`.${i}-canvas`)||C.target.closest("button")))if(S&&n&&c&&X){let Dt=p.current.getBoundingClientRect(),sa=(C.clientX-Dt.left-X.left)/X.width,Ge=(C.clientY-Dt.top-X.top)/X.height;sa>=0&&sa<=1&&Ge>=0&&Ge<=1&&(K.current=!0,c(Ci(sa),Ci(Ge)))}else g&&(K.current=!0,g())};return(0,r.jsxs)("div",{ref:b,className:`${i}-stage${v?` ${i}-stage-compact`:""}`,style:Nt,"data-shaped":l?"true":"false","data-framing":V&&xe.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:C=>{if(f){G(C);return}K.current=!1,Re.current=C.pointerType==="touch"?{x:C.clientX,y:C.clientY}:null},onPointerMoveCapture:C=>{if(f){Ai(C);return}let H=Re.current;H&&(Math.abs(C.clientX-H.x)>8||Math.abs(C.clientY-H.y)>8)&&(K.current=!0)},onPointerUpCapture:f?Vt:void 0,onPointerCancelCapture:C=>{f&&Vt(C,!0),Re.current&&(K.current=!0)},onClickCapture:C=>{K.current&&(K.current=!1,C.preventDefault(),C.stopPropagation())},children:[A,(0,r.jsxs)("div",{ref:p,className:`${i}-canvas`,"data-placing":S&&n?"true":"false","data-dragging":le?"true":"false",onClick:S&&n?hn:g?()=>g():void 0,onPointerDown:V?Io:void 0,onPointerMove:V?O:void 0,onPointerUp:V?Ne:void 0,onPointerCancel:V?Ne:void 0,children:[e?(0,r.jsx)("img",{className:`${i}-canvas-img`,style:f&&X?{position:"absolute",left:X.left,top:X.top,width:X.width,height:X.height,objectFit:"fill"}:y5(xe),src:e,alt:t,draggable:!1,onLoad:C=>{let{naturalWidth:H,naturalHeight:ie}=C.currentTarget;H<=0||ie<=0||(T({src:e,width:H,height:ie}),ja())},onError:()=>Ga(e)}):(0,r.jsxs)(r.Fragment,{children:[f&&X?(0,r.jsx)("span",{className:`${i}-mobile-logical`,style:{left:X.left,top:X.top,width:X.width,height:X.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${i}-canvas-empty`,children:"Logical village map"})]}),e&&wa===e?(0,r.jsx)("span",{className:`${i}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,X?a.map(C=>(0,r.jsxs)("span",{className:`${i}-pin-holder`,style:{left:`${X.left+C.x*X.width}px`,top:`${X.top+(C.y+(f&&C.kind!=="person"?0:C.dy??0))*X.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${i}-pin`,"data-pin-id":C.id,"data-tone":C.tone,"data-kind":C.kind??"place",disabled:C.onSelect===void 0,title:C.text,onClick:H=>{H.stopPropagation(),C.onSelect?.()},children:(f||y)&&C.kind!=="person"?(0,r.jsxs)("span",{className:`${i}-pin-photo-card`,style:f?{transform:`scale(${vw(ue.zoom,F.zoom)})`}:void 0,children:[(0,r.jsxs)("span",{className:`${i}-pin-photo`,"aria-hidden":"true",children:[C.image?(0,r.jsx)("img",{src:C.image,alt:"",loading:"lazy",draggable:!1}):null,(0,r.jsx)("span",{className:`${i}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:C.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${i}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:C.text})]})}),C.onRemove?(0,r.jsx)("button",{type:"button",className:`${i}-pin-remove`,"aria-label":`Take ${C.text} off the map`,onClick:H=>{H.stopPropagation(),C.onRemove?.()},children:"\xD7"}):null,C.onResume?(0,r.jsx)("button",{type:"button",className:`${i}-pin-resume`,onClick:H=>{H.stopPropagation(),C.onResume?.()},children:"DEBUG: Resume Chat"}):null]},C.id)):null]}),X?a.filter(C=>C.doors!==void 0&&C.doors.length>0).map(C=>(0,r.jsx)("div",{className:`${i}-doors`,style:{left:`${z?Cm(X,z,C).left:X.left+C.x*X.width}px`,top:`${z?Cm(X,z,C).top:X.top+(C.y+(C.dy??0))*X.height}px`},children:C.doors?.map(H=>(0,r.jsx)("button",{type:"button",className:`${i}-door`,onClick:ie=>{ie.stopPropagation(),H.onSelect()},children:H.label},H.label))},`doors:${C.id}`)):null,V&&s&&xe.fit==="cover"?(0,r.jsxs)("div",{className:`${i}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:xe.zoom>=s.max,onClick:()=>ne(xe.zoom+s.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:xe.zoom<=s.min,onClick:()=>ne(xe.zoom-s.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:xe.focusX===50&&xe.focusY===50&&xe.zoom===s.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:s.min})},children:"Centre"})]}):null]})}function Kn(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function Hw({idPrefix:e,personas:t,draft:a,onDraft:n,storedId:o,storedName:l,storedMissing:s,disabled:c}){let h=(t??[]).find(f=>f.id===a)??null,g=h?.name??(a===o?l:""),v=s&&a===o,N=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${i}-${e}-persona`,className:`${i}-select`,value:a,disabled:c||t===null||t.length===0,onChange:f=>n(f.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,r.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),N?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:v?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${i}-macro-help`,children:h.summary}):null]}):null]})}function Uw({books:e,error:t,selected:a,onChange:n,disabled:o}){let l=new Map((e??[]).map(h=>[h.id,h])),s=(e??[]).filter(h=>!h.hiddenFromLibrary||a.includes(h.id)),c=a.filter(h=>!l.has(h));return(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books supply live world facts for places, stories, conversations, and generated scenery. Villages never edits them."}),t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No lorebooks in the Engine library."}):null,[...s,...c.map(h=>({id:h,name:h,enabled:!1}))].map(h=>{let g=a.includes(h.id),v=c.includes(h.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":h.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g,disabled:o||!h.enabled&&!g,onChange:()=>n(g?a.filter(N=>N!==h.id):[...a,h.id])}),h.name,v?` (${v})`:""]},h.id)})]})}function qw({homes:e,villagers:t,buildings:a,disabled:n,selectedId:o,onPatch:l,onRemove:s,onSelect:c,lockedIds:h,showDescriptions:g,onGenerateDescription:v}){let N=new Set(e.map(f=>f.characterId));return(0,r.jsx)("div",{className:`${i}-home-list`,children:e.map((f,y)=>{let A=Gu(a,f.building),S=h?.has(f.id)??!1,V=t.find(b=>b.id===f.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${i}-home-row`,"data-selected":f.id===o?"true":"false",onMouseEnter:()=>c(f.id),children:[(0,r.jsx)("span",{className:`${i}-home-index`,"aria-hidden":"true",children:y+1}),f.isPlayerHome?(0,r.jsx)("span",{className:`${i}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-who`,children:V?`${V} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${i}-select`,value:f.characterId??"",disabled:n||S,"aria-label":`Who lives in home ${y+1}`,onChange:b=>l(f.id,{characterId:b.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(b=>{let p=b.id!==f.characterId&&N.has(b.id);return(0,r.jsx)("option",{value:b.id,disabled:p,children:p?`${b.name} \u2014 already housed`:b.name},b.id)})]}):null]}),(0,r.jsxs)("span",{className:`${i}-building`,children:[A.name,A.category?(0,r.jsx)("span",{className:`${i}-hint`,children:A.category}):null]}),g?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("textarea",{className:`${i}-textarea`,value:f.description,maxLength:1e3,disabled:n||S,"aria-label":`Description of home ${y+1}`,onChange:b=>l(f.id,{description:b.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:n||S,onClick:()=>v?.(f),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:n||S,"aria-label":`Take home ${y+1} off the map`,onClick:()=>s(f.id),children:"\xD7"}),S?(0,r.jsx)("span",{className:`${i}-hint`,children:"Move approved and completed before changing this home."}):null]},f.id)})})}function Lw({id:e,label:t,hint:a,options:n,value:o,disabled:l,onChange:s}){let c=o.length>0&&!n.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${i}-select`,value:o,disabled:l,onChange:h=>s(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),c?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,n.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a})]})}function Bw({onSetupProblem:e,onImageWarningChange:t}){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)([]),[s,c]=(0,m.useState)(""),[h,g]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let S=!1;return(async()=>{try{let[V,b]=await Promise.all([D("/connections"),Gm("/api/connections")]);if(S)return;n(V),l(i5(Array.isArray(b)?b:[]))}catch(V){S||c(U(V,"This agent's connections could not be read."))}})(),()=>{S=!0}},[]);let v=(0,m.useCallback)(async S=>{g(!0),c("");try{n(await D("/connections",{method:"PUT",body:JSON.stringify(S)}))}catch(V){c(U(V,"That connection could not be saved."))}finally{g(!1)}},[]),N=o.filter(S=>S.category==="language"),f=o.filter(S=>S.category==="image_generation"),y=f.some(S=>S.defaultForAgents),A=a!==null&&(a.imageConnectionId===Mm||f.length===0||a.imageConnectionId.length===0&&!y);return(0,m.useEffect)(()=>{if(!e)return;let S=a?.systemConnectionId??"",V=a?.narrationConnectionId??"";a?S.length===0||V.length===0?e("Choose both System and Narration connections before continuing."):!N.some(b=>b.id===S)||!N.some(b=>b.id===V)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,a,N]),(0,m.useEffect)(()=>{t?.(A)},[A,t]),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Connections"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),a?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(Lw,{id:`${i}-connection-system`,label:"System",hint:"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:N,value:a.systemConnectionId,disabled:h,onChange:S=>{v({systemConnectionId:S})}}),(0,r.jsx)(Lw,{id:`${i}-connection-narration`,label:"Narration",hint:"Everything the villagers say to you, and how the conversation reads back afterwards.",options:N,value:a.narrationConnectionId,disabled:h,onChange:S=>{v({narrationConnectionId:S})}}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${i}-connection-image`,className:`${i}-select`,value:a.imageConnectionId,disabled:h,onChange:S=>{v({imageConnectionId:S.target.value})},children:[(0,r.jsx)("option",{value:Mm,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),a.imageConnectionId.length>0&&a.imageConnectionId!==Mm&&!f.some(S=>S.id===a.imageConnectionId)?(0,r.jsx)("option",{value:a.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,f.map(S=>(0,r.jsx)("option",{value:S.id,children:S.name},S.id))]}),(0,r.jsxs)("span",{className:`${i}-hint`,children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${i}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})]})]}):s.length===0?(0,r.jsx)("span",{className:`${i}-hint`,children:"Reading this agent's connections\u2026"}):null,s?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:s}):null]})}function Fw(){let[e,t]=(0,m.useState)(null),[a,n]=(0,m.useState)(""),[o,l]=(0,m.useState)(!1),[s,c]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return D("/narration").then(v=>{g||t(v)}).catch(v=>{g||n(U(v,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{l(!0),c(!1),n("");try{let v=await D("/narration",{method:"PUT",body:JSON.stringify(g)});return t(v),c(!0),v}catch(v){return n(U(v,"That writing change could not be saved.")),null}finally{l(!1)}},[]);return{view:e,error:a,busy:o,saved:s,save:h}}function w5(){let{view:e,error:t,busy:a,saved:n,save:o}=Fw(),[l,s]=(0,m.useState)(null),c=l??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:i+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Narration style",value:c,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>s(h.target.value)}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.styleInstructions,onClick:()=>{o({styleInstructions:c}).then(h=>{h&&s(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&s(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:i+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function x5(){let{view:e,error:t,busy:a,saved:n,save:o}=Fw(),[l,s]=(0,m.useState)(null),c=l??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:i+"-panel",children:[(0,r.jsx)("h2",{className:i+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:i+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Villager reply guidance",value:c,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>s(h.target.value)}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.replyGuidance,onClick:()=>{o({replyGuidance:c}).then(h=>{h&&s(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&s(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:i+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function jo({portrait:e,name:t,className:a,glyph:n="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:t5(e.crop)}):n==="person"?(0,r.jsxs)("svg",{className:`${i}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function N5({villager:e,portrait:t,selected:a,onSelect:n}){return(0,r.jsxs)("div",{className:`${i}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-tile-head`,children:[(0,r.jsx)(jo,{portrait:t,name:e.name,className:`${i}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${i}-tile-name`,onClick:n,disabled:n===void 0,title:n?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${i}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${i}-tag`,children:o},o))]})]})}function Gw(e,t){let a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function $5(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((N,f)=>{let y=A=>{let S=Um.indexOf(A);return S<0?Um.length:S};return y(N.label)-y(f.label)||N.label.localeCompare(f.label)}),n=512,o=768,l=2,s=document.createElement("canvas");s.width=l*n,s.height=Math.ceil(a.length/l)*o;let c=s.getContext("2d");if(!c)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let N=0;N<a.length;N+=1){let f=a[N],y=new Image;y.src=f.url,await y.decode();let A=N%l*n,S=Math.floor(N/l)*o,V=Math.min(n/y.naturalWidth,o/y.naturalHeight),b=Math.round(y.naturalWidth*V),p=Math.round(y.naturalHeight*V);c.drawImage(y,A+Math.floor((n-b)/2),S+o-p,b,p),h.push({expression:f.label,x:A,y:S,width:n,height:o})}let g=await new Promise((N,f)=>s.toBlob(y=>y?N(y):f(new Error("The browser could not export this sheet.")),"image/png")),v=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";Gw(`${v}-sprites.png`,g),Gw(`${v}-sprites.json`,new Blob([JSON.stringify({width:s.width,height:s.height,cells:h},null,2)],{type:"application/json"}))}function S5({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[n,o]=(0,m.useState)("neutral"),[l,s]=(0,m.useState)(""),[c,h]=(0,m.useState)(""),[g,v]=(0,m.useState)(!0),[N,f]=(0,m.useState)(null),[y,A]=(0,m.useState)([]),[S,V]=(0,m.useState)(!1),[b,p]=(0,m.useState)(""),[x,T]=(0,m.useState)(""),z=e.sprite?.images??[],I=z.some(M=>M.label==="neutral"),_=n==="custom"?l.trim().toLowerCase().replace(/\s+/g,"_"):n;(0,m.useEffect)(()=>{f(null),o("neutral"),p(""),D(`${a}/source`).then(M=>A(M.sprites)).catch(()=>A([]))},[a]);async function q(M){V(!0),p(""),T("");try{await M()}catch(he){p(U(he,"The sprite could not be prepared."))}finally{V(!1)}}function ae(){if(!/^[a-z0-9_-]{1,40}$/.test(_))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(_!=="neutral"&&!I)throw new Error("Approve the neutral sprite first.");return _}return(0,r.jsxs)("section",{className:`${i}-sprite-editor`,"aria-label":`${e.name} sprite creator`,children:[(0,r.jsxs)("h3",{children:["Sprites for ",e.name]}),(0,r.jsx)("p",{children:"Generate a neutral full-body sprite, review it, then add expressions one at a time. Your approved art belongs to this Village."}),(0,r.jsxs)("label",{children:["Expression",(0,r.jsxs)("select",{value:n,onChange:M=>{o(M.target.value),f(null)},children:[Um.map(M=>(0,r.jsx)("option",{value:M,children:M},M)),(0,r.jsx)("option",{value:"custom",children:"Custom\u2026"})]})]}),n==="custom"?(0,r.jsxs)("label",{children:["Custom expression",(0,r.jsx)("input",{value:l,maxLength:40,onChange:M=>{s(M.target.value),f(null)}})]}):null,(0,r.jsx)("p",{className:`${i}-hint`,children:"More starter expressions are coming."}),(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:c,maxLength:2e3,onChange:M=>h(M.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${i}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g,onChange:M=>v(M.target.checked)})," Use approved neutral and available portrait as identity references"]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S,onClick:()=>{q(async()=>{let M=ae(),he=await D(`${a}/generate`,{method:"POST",body:JSON.stringify({expression:M,appearance:c,useReference:g})});f(he.image),T(`Candidate: ${he.width} \xD7 ${he.height}. Review before approving.`)})},children:S?"Working\u2026":N?"Retry this expression":"Generate candidate"}),(0,r.jsxs)("label",{className:`${i}-button`,children:["Upload candidate",(0,r.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:M=>{q(async()=>{ae();let he=M.target.files?.[0];he&&f(await Yu(he)),M.target.value=""})}})]})]}),N?(0,r.jsxs)("div",{className:`${i}-sprite-candidate`,children:[(0,r.jsx)("img",{src:N,alt:`${_} candidate for ${e.name}`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S,onClick:()=>{q(async()=>{let M=await D(`${a}/approve`,{method:"POST",body:JSON.stringify({expression:ae(),image:N})});t(M),f(null),T(`${_} approved.`)})},children:"Approve this sprite"})]}):null,y.length?(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{children:"Copy an existing Engine full-body sprite:"}),(0,r.jsx)("div",{className:`${i}-row`,children:y.map(M=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S||M.expression!=="neutral"&&!I,onClick:()=>{q(async()=>{let he=await D(`${a}/import`,{method:"POST",body:JSON.stringify({expression:M.expression})});t(he),T(`${M.expression} copied to this Village.`)})},children:M.expression},M.expression))})]}):null,z.length?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-sprite-approved`,children:z.map(M=>(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:M.url,alt:`${e.name}: ${M.label}`}),(0,r.jsx)("span",{children:M.label})]},M.label))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:S,onChange:M=>{q(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:M.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:S,onChange:M=>{q(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(M.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S,onClick:()=>{q(()=>$5(e))},children:"Download sheet and manifest"})]})]}):null,x?(0,r.jsx)("p",{role:"status",children:x}):null,b?(0,r.jsx)("p",{role:"alert",children:b}):null]})}function T5({room:e,picture:t,draft:a,mode:n,targetId:o,busy:l,error:s,greetingNotice:c,ruling:h,open:g,ended:v,playerName:N,playerPortrait:f,portraits:y,sprites:A,onDraft:S,onMode:V,onTarget:b,onSend:p,onEnd:x,onLeavePending:T,endFailed:z,onRetryGreeting:I,onContinueWithoutGreeting:_,notices:q,onDismissNotice:ae,debugDiscardEnabled:M,onDebugDiscard:he}){let[rt,st]=(0,m.useState)(0),[wa,Ga]=(0,m.useState)(!1),ra=(0,m.useRef)(null),Re=(0,m.useMemo)(()=>{let O=[],Ne=new Map;for(let ne of e.lines){if(ne.kind!=="side"&&ne.kind!=="whisper"||!ne.asideFor)continue;let Ue=Ne.get(ne.asideFor)??[];Ue.push({register:ne.kind,text:ne.content,...ne.targetId?{target:e.participants.find(G=>G.characterId===ne.targetId)?.name??ne.targetId}:{},speakerId:ne.speakerId,name:ne.name,expression:ne.expression}),Ne.set(ne.asideFor,Ue)}for(let ne of e.lines){if(ne.kind==="side"||ne.kind==="whisper")continue;let Ue=ne.speakerId.length===0,G=uw(ne.content,ne.beats??null);G.paragraphs.forEach((Ai,Vt)=>{O.push({key:`${O.length}`,speakerId:Ue?"":ne.speakerId,name:Ue?N:ne.name,player:Ue,text:Ai,asides:[...G.asides[Vt]??[],...Vt===G.paragraphs.length-1?Ne.get(ne.id??"")??[]:[]],...ne.kind?{register:ne.kind==="narration"?"narration":"speech"}:{},...ne.expression?{expression:ne.expression}:{}})})}return O},[N,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{st(O=>gw(ra.current,e.id,Re.length,O)),ra.current={roomId:e.id,stepCount:Re.length}},[e.id,Re.length]);let K=Math.min(rt,Math.max(0,Re.length-1)),le=Re[K],Ya=K>0,xe=K<Re.length-1,ut=le?.register??(le===void 0||le.speakerId==="__venue_scene__"?"narration":le.player||sw(le.text)==="speech"?"speech":"narration"),F=le===void 0?void 0:le.player?f:y[le.speakerId],ue=e.participants.filter(O=>e.activeIds.includes(O.characterId)),X=e.status==="closed"&&ue.length===0?e.participants:ue,Nt=X.find(O=>O.characterId===le?.speakerId),ja=X.filter(O=>O.characterId!==Nt?.characterId),$t=Nt?[ja[0],Nt,ja[1]].filter(O=>!!O):X.slice(0,3),hn=X.filter(O=>!$t.some(Ne=>Ne.characterId===O.characterId)),Io=(0,r.jsxs)("p",{className:`${i}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${i}-chat-spinner ${i}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${i}-chat-pending-label`,children:e.status==="opening"?"Preparing a greeting\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${i}-chat`,"data-open":g?"true":"false","data-ended":v?"true":"false","data-opening-error":e.status==="opening"&&s?"true":"false","aria-label":`Inside ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${i}-visually-hidden`,children:`Here now: ${ue.length?ue.map(O=>`${O.name}${O.doing?` is ${O.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${i}-chat-scene`,"aria-hidden":"true",children:t?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${i}-chat-scene-backdrop`,src:t,alt:""}),(0,r.jsx)("span",{className:`${i}-chat-scrim`}),(0,r.jsx)("span",{className:`${i}-chat-vignette`})]}):null}),(0,r.jsx)("div",{className:`${i}-chat-head`,children:(0,r.jsxs)("span",{className:`${i}-chat-actions`,children:[M&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:he,disabled:l,title:"DEBUG: Clears this visit and transcript. Completed effects and memories remain.",children:"DEBUG: Discard Visit"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:x,disabled:l,title:"End this visit and leave the venue",children:"End visit and leave"}),z||e.status==="closing"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:T,children:"Leave with memory pending"}):null]})}),q.length>0&&e.status!=="closed"?(0,r.jsx)("div",{className:`${i}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:q.map(O=>(0,r.jsxs)("div",{className:`${i}-room-star`,role:"status",children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),(0,r.jsx)("span",{children:O.text}),(0,r.jsx)("button",{type:"button",onClick:()=>ae(O.id),"aria-label":`Dismiss ${O.text}`,title:"Dismiss notice",children:"\xD7"})]},O.id))}):null,ue.length>0?(0,r.jsx)("div",{className:`${i}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:ue.map(O=>(0,r.jsx)("span",{className:`${i}-chat-activity`,children:`${O.name}: ${O.doing||"spending time here"}`},O.characterId))}):null,(0,r.jsxs)("div",{className:`${i}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${i}-chat-cast`,children:$t.map(O=>{let Ne=A[O.characterId],ne=O.characterId===Nt?.characterId?le?.expression??"neutral":"neutral",Ue=Ne?.images.find(G=>G.label===ne)??Ne?.images.find(G=>G.label==="neutral");return(0,r.jsxs)("div",{className:`${i}-chat-cast-person`,"data-active":O.characterId===Nt?.characterId?"true":"false",children:[Ue?(0,r.jsx)("img",{src:Ue.url,alt:"","data-framing":Ne?.framing.mode??"full"}):(0,r.jsx)(jo,{portrait:y[O.characterId],name:O.name,className:`${i}-avatar`}),(0,r.jsx)("span",{children:O.name})]},O.characterId)})}),hn.length>0?(0,r.jsx)("div",{className:`${i}-chat-cast-rest`,children:hn.map(O=>(0,r.jsxs)("span",{children:[(0,r.jsx)(jo,{portrait:y[O.characterId],name:O.name,className:`${i}-avatar`}),O.name]},O.characterId))}):null]}),(0,r.jsxs)("div",{className:`${i}-chat-vn`,children:[e.lines.length>0?(0,r.jsx)("button",{type:"button",className:`${i}-chat-history-toggle`,"aria-expanded":wa,onClick:()=>Ga(O=>!O),children:wa?"Hide history":"History"}):null,wa?(0,r.jsx)("div",{className:`${i}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,children:e.lines.map((O,Ne)=>(0,r.jsxs)("p",{className:`${i}-chat-vn-text`,children:[(0,r.jsxs)("strong",{children:[O.role==="user"?N:O.kind==="narration"||O.speakerId==="__venue_scene__"?"Narration":O.name||"Resident",O.kind==="side"?" \xB7 aside":O.kind==="whisper"?" \xB7 whisper":"",":"," "]}),hr(O.content,`history-${Ne}-`)]},O.id??Ne))}):null,le&&le.asides.length>0?(0,r.jsx)("div",{className:`${i}-chat-vn-asides`,"aria-live":"polite",children:le.asides.map((O,Ne)=>(0,r.jsxs)("div",{className:`${i}-chat-vn-aside`,"data-register":O.register,children:[(0,r.jsx)(jo,{portrait:O.speakerId?y[O.speakerId]:F,name:O.name??le.name,glyph:le.player?"person":"initial",className:`${i}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${i}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${i}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${i}-chat-vn-aside-icon`,children:O.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${i}-chat-vn-aside-name`,children:O.name??le.name}),O.register==="whisper"&&O.target?(0,r.jsx)("span",{className:`${i}-chat-vn-aside-target`,children:`\u2192 ${O.target}`}):null]}),(0,r.jsx)("p",{className:`${i}-chat-vn-aside-text`,children:hr(O.text,`vn-aside-${Ne}-`)})]})]},`${Ne}-${O.register}`))}):null,(0,r.jsxs)("div",{className:`${i}-chat-vn-card`,"data-register":ut,children:[(0,r.jsxs)("div",{className:`${i}-chat-vn-row`,children:[ut==="speech"?(0,r.jsx)(jo,{portrait:F,name:le?.name??"",glyph:le?.player?"person":"initial",className:`${i}-chat-vn-portrait`}):null,(0,r.jsxs)("div",{className:`${i}-chat-vn-column`,children:[ut==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${i}-chat-vn-name`,children:le?.name??""}),(0,r.jsxs)("div",{className:`${i}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[le?ut==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-beat`,"data-register":"narration",children:hr(le.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,children:hr(le.text,"vn-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Preparing a greeting in ${e.placeName}\u2026`:ue.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!v&&l?Io:null]})]})]}),Ya||xe?(0,r.jsxs)("div",{className:`${i}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>st(K-1),disabled:!Ya,title:"Read the paragraph before this one",children:[(0,r.jsx)("svg",{viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:(0,r.jsx)("path",{d:"M10 3.5 5.5 8l4.5 4.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})}),"Previous paragraph"]}),(0,r.jsx)("span",{className:`${i}-chat-vn-counter`,children:`${K+1} / ${Math.max(1,Re.length)}`}),(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>st(K+1),disabled:!xe,title:"Read the next paragraph",children:["Next paragraph",(0,r.jsx)("svg",{viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:(0,r.jsx)("path",{d:"M6 3.5 10.5 8 6 12.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]})]}):null]})]}),s&&e.status==="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:s}),e.status==="opening"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:I,disabled:l,children:"Retry greeting"}),e.id?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:_,disabled:l,children:"Continue without greeting"}):null]}):null]}):null,c?(0,r.jsx)("div",{className:`${i}-room-error`,role:"status",children:(0,r.jsx)("p",{children:c})}):null,h?(0,r.jsx)("p",{className:`${i}-empty`,children:h}):null,e.status==="closing"?(0,r.jsx)("p",{className:`${i}-hint`,children:"The visit is still being remembered. Choose End visit and leave to retry closing it."}):null,n==="fulfill"&&ue.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,(0,r.jsxs)("div",{className:`${i}-composer`,children:[n==="fulfill"&&ue.length>0?(0,r.jsxs)("select",{value:o,onChange:O=>b(O.target.value),"aria-label":"Whose wish you fulfilled",disabled:l||v||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),ue.map(O=>(0,r.jsx)("option",{value:O.characterId,children:O.name},O.characterId))]}):null,(0,r.jsx)("div",{className:`${i}-room-modes`,role:"group","aria-label":"Visit mode",children:["chat","fulfill"].map(O=>(0,r.jsx)("button",{type:"button",className:`${i}-room-mode`,"data-active":n===O?"true":"false","aria-pressed":n===O,disabled:l||v||e.status!=="active"||O==="fulfill"&&ue.length===0,onClick:()=>V(O),children:O==="chat"?"Chat":"Fulfill"},O))}),(0,r.jsx)("div",{className:`${i}-composer-row`,children:(0,r.jsxs)("span",{className:`${i}-chat-input`,children:[(0,r.jsx)("textarea",{className:`${i}-textarea`,value:a,onChange:O=>S(O.target.value),onKeyDown:O=>{fw(O.key,O.shiftKey,O.nativeEvent.isComposing)&&(O.preventDefault(),e.status==="active"&&(n!=="fulfill"||o)&&p())},placeholder:n==="fulfill"?"What did you do for them?":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:l||v||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${i}-chat-send`,onClick:p,disabled:l||v||e.status!=="active"||a.trim().length===0||n==="fulfill"&&!o,"aria-label":l?"Sending":"Send",title:l?"Sending":"Send",children:l?"Sending\u2026":"Send"})]})}),s&&e.status!=="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:s}),e.status==="active"&&a.trim()?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:p,disabled:l||v,children:"Retry message"}):null]}):null]}),v?(0,r.jsx)("p",{className:`${i}-chat-ended`,children:"That is the end of it. Each of them has kept what they took from it, and the village is yours again."}):null]})}function E5({place:e,residents:t,onSave:a,onPromoteItem:n}){let[o,l]=(0,m.useState)(e.state.features??[]),[s,c]=(0,m.useState)(e.workerIds??[]),[h,g]=(0,m.useState)(""),[v,N]=(0,m.useState)(!1),[f,y]=(0,m.useState)(""),A=JSON.stringify(o)!==JSON.stringify(e.state.features??[])||JSON.stringify(s)!==JSON.stringify(e.workerIds??[]);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("span",{className:`${i}-label`,children:["Defining features (",o.length,"/5)"]}),o.map((S,V)=>(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,value:S.text,maxLength:240,"aria-label":`Feature ${V+1}`,onChange:b=>l(p=>p.map(x=>x.id===S.id?{...x,text:b.target.value}:x))}),(0,r.jsxs)("label",{children:[(0,r.jsx)("input",{type:"checkbox",checked:S.locked,onChange:b=>l(p=>p.map(x=>x.id===S.id?{...x,locked:b.target.checked}:x))}),"Locked"]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,"aria-label":`Remove feature ${V+1}`,onClick:()=>l(b=>b.filter(p=>p.id!==S.id)),children:"\xD7"})]},S.id)),o.length<5?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>l(S=>[...S,{id:Hu(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]),children:"Add feature"}),e.state.furniture.length>0?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{value:h,onChange:S=>g(S.target.value),"aria-label":"Item to promote to a venue feature",children:[(0,r.jsx)("option",{value:"",children:"Choose an item to promote"}),e.state.furniture.map((S,V)=>(0,r.jsx)("option",{value:V,children:S},`${V}-${S}`))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:v||h===""||A,onClick:()=>{N(!0),y(""),n(Number(h)).catch(S=>y(U(S,"That item could not be promoted."))).finally(()=>N(!1))},children:"Promote to feature"}),A?(0,r.jsx)("span",{className:`${i}-hint`,children:"Save feature edits first."}):null]}):null]}):null,!e.occupancy.playerHome&&!e.occupancy.residentCharacterId?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Assigned workers"}),t.map(S=>(0,r.jsxs)("label",{children:[(0,r.jsx)("input",{type:"checkbox",checked:s.includes(S.characterId),onChange:V=>c(b=>V.target.checked?[...b,S.characterId]:b.filter(p=>p!==S.characterId))}),S.name]},S.characterId))]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:v||o.some(S=>!S.text.trim()),onClick:()=>{N(!0),y(""),a(o,s).catch(S=>y(U(S,"Features could not be saved."))).finally(()=>N(!1))},children:v?"Saving\u2026":"Save features and workers"}),f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null]})}var Yw="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function k5({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let u=()=>{let w=e.getBoundingClientRect();a(w.width<=704||w.width<=880&&w.height<=512)};u();let d=new ResizeObserver(u);return d.observe(e),()=>d.disconnect()},[e]);let[n,o]=(0,m.useState)(null),[l,s]=(0,m.useState)(null),[c,h]=(0,m.useState)(null),[g,v]=(0,m.useState)(0),[N,f]=(0,m.useState)(null),[y,A]=(0,m.useState)(0),[S,V]=(0,m.useState)(0),[b,p]=(0,m.useState)(0),[x,T]=(0,m.useState)(null),[z,I]=(0,m.useState)(!1),[_,q]=(0,m.useState)(""),[ae,M]=(0,m.useState)(""),[he,rt]=(0,m.useState)(""),[st,wa]=(0,m.useState)(null),[Ga,ra]=(0,m.useState)(!1),[Re,K]=(0,m.useState)("home"),[le,Ya]=(0,m.useState)(null),[xe,ut]=(0,m.useState)(!1),[F,ue]=(0,m.useState)(null),[X,Nt]=(0,m.useState)(!1),[ja,$t]=(0,m.useState)(""),[hn,Io]=(0,m.useState)(""),[O,Ne]=(0,m.useState)(null),[ne,Ue]=(0,m.useState)(!1),[G,Ai]=(0,m.useState)("village"),[Vt,C]=(0,m.useState)("index"),[H,ie]=(0,m.useState)({}),[Ce,gt]=(0,m.useState)(null),[Dt,sa]=(0,m.useState)({}),[Ge,ct]=(0,m.useState)({}),[gr,Jn]=(0,m.useState)(""),[e0,Ym]=(0,m.useState)(null),[jm,Im]=(0,m.useState)(""),[Ia,pr]=(0,m.useState)(""),[_t,br]=(0,m.useState)(""),[vr,Xm]=(0,m.useState)(null),[yr,Qm]=(0,m.useState)(""),[wr,Zm]=(0,m.useState)([]),[xa,Km]=(0,m.useState)([]),[Jm,t0]=(0,m.useState)(null),[Fm,Pm]=(0,m.useState)(""),[zi,mn]=(0,m.useState)([]),[ce,Xo]=(0,m.useState)([]),[Qo,Zt]=(0,m.useState)(!1),[ju,Mi]=(0,m.useState)(!1),[Wm,Oi]=(0,m.useState)(null),[a0,Iu]=(0,m.useState)(null),[xr,Xu]=(0,m.useState)(null),[Nr,ef]=(0,m.useState)(""),[Me,Qu]=(0,m.useState)(0),[Na,tf]=(0,m.useState)(""),[Pe,af]=(0,m.useState)(""),[Kt,nf]=(0,m.useState)(""),[Xa,of]=(0,m.useState)(""),[lf,$r]=(0,m.useState)([]),[Fn,Ri]=(0,m.useState)({}),[Sr,fn]=(0,m.useState)([]),[Zo,Tr]=(0,m.useState)({}),[Er,rf]=(0,m.useState)($w),[pe,Pn]=(0,m.useState)("generate"),[n0,Zu]=(0,m.useState)(""),[kr,Ku]=(0,m.useState)(null),[Ko,Ju]=(0,m.useState)(null),[gn,Fu]=(0,m.useState)(""),[Cr,Pu]=(0,m.useState)(""),[St,Jo]=(0,m.useState)(!1),[ua,Wu]=(0,m.useState)(""),[Jt,sf]=(0,m.useState)(null),[ec,i0]=(0,m.useState)("Connections are still loading."),[uf,cf]=(0,m.useState)(!1),[o0,Fo]=(0,m.useState)(!1),[df,$e]=(0,m.useState)(""),[l0,Ar]=(0,m.useState)(!1),[zr,Mr]=(0,m.useState)(""),[ca,tc]=(0,m.useState)(null),[ac,Po]=(0,m.useState)(null),[r0,nc]=(0,m.useState)(!1),[$a,Vi]=(0,m.useState)(""),[ic,pn]=(0,m.useState)(null),Di=n?.settings.townMapView??Bu("cover"),hf=n?ca?.size??{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:null,mf=n?pe==="existing"?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:Ko&&kr===pe?Ko:{width:n.settings.townMapGenerationWidth,height:n.settings.townMapGenerationHeight}:null,s0=n?{min:n.settings.townMapZoomMin,max:n.settings.townMapZoomMax,step:n.settings.townMapZoomStep}:{min:1,max:1,step:.1},Or=ca?ca.image:zr||null,Wn=pe==="none"?null:pe==="existing"?zr||null:kr===pe&&n0||null,Rr=ca!==null||r0,Wo=Rr?ac??Di:Di,oc=ca?Dm(ca.size):null,[el,Ve]=(0,m.useState)(""),[pt,Y]=(0,m.useState)(""),[R,B]=(0,m.useState)(!1),[Z,Ye]=(0,m.useState)(null),[u0,Sa]=(0,m.useState)(!1),[lc,_i]=(0,m.useState)(""),[Vr,rc]=(0,m.useState)("chat"),[tl,Dr]=(0,m.useState)(""),[c0,ff]=(0,m.useState)(""),[d0,da]=(0,m.useState)([]),ha=(0,m.useRef)(new Set),[sc,h0]=(0,m.useState)(!1),gf=(0,m.useRef)(0),Hi=(0,m.useRef)(0),pf=(0,m.useRef)(""),[uc,al]=(0,m.useState)(""),[Qa,dt]=(0,m.useState)(!1),Ui=(0,m.useRef)(!1),qi=(0,m.useRef)(null),_r=(0,m.useRef)(!1),[m0,Tt]=(0,m.useState)(""),[f0,nl]=(0,m.useState)(""),[cc,bf]=(0,m.useState)(!1),[Hr,dc]=(0,m.useState)(""),vf=(0,m.useRef)(""),Ur=(0,m.useRef)(!1),[qr,yf]=(0,m.useState)(!1),hc=(0,m.useRef)(null),mc=(0,m.useRef)(null);(0,m.useEffect)(()=>{let u=mc.current,d=hc.current;u===null||!d||(mc.current=null,d.focus(),d.setSelectionRange(u,u))},[Ia]);let Lr=(0,m.useCallback)(async(u=!1)=>{if(Ur.current)return null;Ur.current=!0;let d=setTimeout(()=>yf(!0),c5);try{let w=await D("/reconcile",{method:"POST",body:u?JSON.stringify({forceStory:!0}):void 0});return o(w),w}catch{return null}finally{clearTimeout(d),yf(!1),Ur.current=!1}},[]),wf=(0,m.useCallback)(async()=>{let u=n?.happenings[0]?.id??"";dc("Writing...");let d=await Lr(!0);if(!d){dc("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}dc((d.happenings[0]?.id??"")===u?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[n,Lr]),Qe=(0,m.useCallback)(async(u={})=>{try{let d=await D("",{signal:u.signal});o(d),Ve("")}catch(d){if(u.signal?.aborted||u.quiet)return;o(null),Ve(U(d,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let u=n?.village.nextTransitionAt??"";u.length===0||u===vf.current||(vf.current=u,n?.isFounded&&Lr())},[n,Lr]);let Ta=(0,m.useCallback)(async u=>{try{let d=await D("/catalog",{signal:u});s(d.characters),Ve("")}catch(d){if(u?.aborted)return;Ve(U(d,"Could not read your character library."))}},[]),Li=(0,m.useCallback)(async u=>{try{let d=await D("/personas",{signal:u});Xm(d.personas)}catch(d){if(u?.aborted)return;Xm([]),Ve(U(d,"Could not read your Personas."))}},[]),Bi=(0,m.useCallback)(async u=>{try{let d=await D("/lorebooks",{signal:u});t0(d.books),Pm("")}catch(d){if(u?.aborted)return;Pm(U(d,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),xf=(0,m.useCallback)(async u=>{try{let d=await D("/story?offset=0&limit=50",{signal:u});h(d.entries),v(d.total)}catch(d){if(u?.aborted)return;h(null),Ve(U(d,"Could not read the village story."))}},[]),g0=(0,m.useCallback)(async u=>{B(!0);try{let d=await D(`/story/${encodeURIComponent(u)}`,{method:"DELETE"});h(d.entries),v(d.total),Ve("")}catch(d){Ve(U(d,"That memory could not be removed."))}finally{B(!1)}},[]),p0=(0,m.useCallback)(async()=>{let u=c?.length??0;try{let d=await D(`/story?offset=${u}&limit=50`);h(w=>[...w??[],...d.entries]),v(d.total)}catch(d){Ve(U(d,"Could not read more memories."))}},[c]),Br=(0,m.useCallback)(async u=>{try{let d=await D("/agendas",{signal:u});wa(d.villagers)}catch(d){if(u?.aborted)return;wa(null),Ve(U(d,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(Re!=="menu"||G!=="agendas"&&G!=="schedules"||!st?.some(d=>d.agenda?.personalizationPending&&!d.agenda.personalizationFailure))return;let u=window.setInterval(()=>{Br()},5e3);return()=>window.clearInterval(u)},[st,Br,G,Re]);let b0=(0,m.useCallback)(async u=>{B(!0);try{let d=await D(`/agendas/${encodeURIComponent(u)}/regenerate`,{method:"POST"});wa(d.villagers),Ve("")}catch(d){Ve(U(d,"That villager could not be asked again."))}finally{B(!1)}},[]),v0=(0,m.useCallback)(async(u,d)=>{B(!0);try{let w=await D(`/agendas/${encodeURIComponent(u)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:d})});wa(w.villagers),Ve("")}catch(w){Ve(U(w,"Schedule use could not be changed."))}finally{B(!1)}},[]);(0,m.useEffect)(()=>{let u=new AbortController;return Qe({signal:u.signal}),()=>u.abort()},[Qe]),(0,m.useEffect)(()=>{let u=()=>{document.hidden||Qe({quiet:!0})},d=setInterval(()=>{document.hidden||Ur.current||Qe({quiet:!0})},u5);return document.addEventListener("visibilitychange",u),()=>{clearInterval(d),document.removeEventListener("visibilitychange",u)}},[Qe]),(0,m.useEffect)(()=>{if(!Z?.id||Z.status==="closed"||Re!=="room")return;pf.current!==Z.id?(pf.current=Z.id,Hi.current=Date.parse(Z.lastActivityAt||Z.startedAt)||Date.now()):Hi.current=Math.max(Hi.current,Date.parse(Z.lastActivityAt||Z.startedAt)||0);let u=!1,d=L=>{u||(Ye(null),Sa(!1),da([]),ha.current.clear(),al(L==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),K("home"),Qe())},w=(L=!1)=>{D("/rooms/active").then(async({session:be})=>{if(be?.id===Z.id){L&&(await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:Z.id})}),Hi.current=Date.now());return}let Et=await D(`/rooms/archive/${encodeURIComponent(Z.id)}`).catch(()=>null);d(Et?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(be=>{let Et=cr(be);Et&&d(Et)})},E=L=>{if(Date.now()-Hi.current>=30*6e4){L.cancelable&&L.preventDefault(),L.stopImmediatePropagation(),w(!0);return}Hi.current=Date.now(),!(Date.now()-gf.current<15e3)&&(gf.current=Date.now(),D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:Z.id})}).catch(be=>{let Et=cr(be);Et?d(Et):w()}))},$=()=>w();window.addEventListener("focus",$),document.addEventListener("visibilitychange",$);for(let L of["pointerdown","keydown","input","scroll"])window.addEventListener(L,E,!0);return()=>{u=!0,window.removeEventListener("focus",$),document.removeEventListener("visibilitychange",$);for(let L of["pointerdown","keydown","input","scroll"])window.removeEventListener(L,E,!0)}},[Z?.id,Z?.status,Z?.lastActivityAt,Z?.startedAt,Re,Qe]),(0,m.useEffect)(()=>{let u=new AbortController;return D("/rooms/active",{signal:u.signal}).then(({session:d,debugDiscardEnabled:w})=>{h0(w),!(u.signal.aborted||!d)&&(Ye(d),rc("chat"),Sa(!0),K("room"),d.status==="opening"&&(dt(!0),D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:d.id}),signal:AbortSignal.timeout(3e4)}).then(({session:E})=>{u.signal.aborted||Ye(E)}).catch(async E=>{if(u.signal.aborted)return;let $=await Aw(d.id);u.signal.aborted||($?Ye($):Tt(zw(E)))}).finally(()=>{u.signal.aborted||dt(!1)})))}).catch(()=>{}),()=>u.abort()},[]),(0,m.useEffect)(()=>{if(G!=="chatlogs"||!n?.isFounded)return;let u=new AbortController,d=new URLSearchParams;return _&&d.set("venueId",_),ae&&d.set("characterId",ae),d.set("offset",String(S)),d.set("limit","20"),f(null),D(`/rooms/archive?${d.toString()}`,{signal:u.signal}).then(({visits:w,total:E})=>{u.signal.aborted||(f(w),A(E),rt(""))}).catch(w=>{u.signal.aborted||rt(U(w,"Venue visits could not be read."))}),()=>u.abort()},[_,ae,S,b,G,n?.isFounded]);let fc=(0,m.useCallback)(async u=>{try{let d=await D(`/rooms/archive/${encodeURIComponent(u)}`);T(d.visit),rt("")}catch(d){rt(U(d,"That visit could not be read."))}},[]),y0=(0,m.useCallback)(async u=>{B(!0);try{await D(`/rooms/archive/${encodeURIComponent(u)}/retry-memory`,{method:"POST"}),await fc(u),p(d=>d+1),rt("")}catch(d){rt(U(d,"Memory filing is still pending."))}finally{B(!1)}},[fc]),Nf=(0,m.useCallback)(async u=>{if(window.confirm(u?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){B(!0);try{await D(u?`/rooms/archive/${encodeURIComponent(u)}`:"/rooms/archive",{method:"DELETE"}),T(null),V(0),p(d=>d+1),rt("")}catch(d){rt(U(d,"Visit transcripts could not be deleted."))}finally{B(!1)}}},[]);(0,m.useEffect)(()=>{if(!Ga)return;let u=new AbortController;return Ta(u.signal),()=>u.abort()},[Ga,Ta]);let $f=n?n.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if($f===null)return;let u=new AbortController;return(async()=>{try{let d=await D("/town-map",{signal:u.signal});Mr(d.image)}catch{u.signal.aborted||Mr("")}})(),()=>u.abort()},[$f]);let w0=(0,m.useCallback)(async u=>{B(!0);try{o(await D("/villagers",{method:"POST",body:JSON.stringify({characterId:u})})),Ve(""),await Ta()}catch(d){Ve(U(d,"That character could not move in."))}finally{B(!1)}},[Ta]),x0=(0,m.useCallback)(async u=>{B(!0);try{o(await D(`/villagers/${encodeURIComponent(u)}`,{method:"DELETE"})),Ve(""),l&&await Ta()}catch(d){Ve(U(d,"That villager could not leave."))}finally{B(!1)}},[l,Ta]),N0=(0,m.useCallback)(async u=>{Jn(u);try{let d=await D(`/villagers/${encodeURIComponent(u)}/refresh`);ct(w=>({...w,[u]:d})),Ve("")}catch(d){Ve(U(d,"That villager's card could not be compared."))}finally{Jn("")}},[]),$0=(0,m.useCallback)(async u=>{Jn(u);try{o(await D(`/villagers/${encodeURIComponent(u)}/refresh`,{method:"POST"})),ct(d=>{let w={...d};return delete w[u],w}),Ve("")}catch(d){Ve(U(d,"That villager's card could not be refreshed."))}finally{Jn("")}},[]),We=(0,m.useCallback)(u=>{C(u==="noticeboard"?"noticeboard":u==="general"?"general":u==="replyGuidance"||u==="story"||u==="chatlogs"||u==="agendas"||u==="schedules"?"debug":"village"),Y(""),Ue(!1),u==="villagers"&&Ta(),u==="village"&&Li(),u==="village"&&Bi(),u==="story"&&xf(),(u==="agendas"||u==="schedules")&&Br(),u==="village"&&(Re!=="menu"||G!=="village")&&n&&(pr(n.settings.promptKnowledge),br(n.settings.playerPersonaId),Qm(n.settings.setting),Zm(n.settings.selectedLorebookIds),mn(ya(n.settings.venues).map(w=>({...w}))),Tr(n.settings.homeBuildingNames)),Ai(u),K("menu")},[Br,Ta,Bi,Li,xf,G,Re,n]),gc=(0,m.useCallback)(()=>{ra(!1),Y(""),Ne(null),Ue(!1),K("home")},[]),S0=(0,m.useCallback)(async()=>{if(!(!Z||Qa)){dt(!0),Tt(""),I(!1),Ye({...Z,status:"closing"});try{if(Z.id&&await D("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:Z.id})}),Ui.current)return;Sa(!1),Ye(null),da([]),ha.current.clear(),_i(""),nl(""),K("home"),Qe()}catch(u){if(Ui.current)return;let d=cr(u);if(d){Ye(null),Sa(!1),da([]),ha.current.clear(),al(d==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),K("home"),Qe();return}Tt(U(u,"You could not leave the venue.")),I(!0)}finally{dt(!1)}}},[Qe,Z,Qa]),T0=(0,m.useCallback)(async()=>{if(!(!Z?.id||Ui.current)){Ui.current=!0,dt(!0);try{await D("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:Z.id})}),Sa(!1),Ye(null),da([]),ha.current.clear(),K("home"),I(!1),Qe()}catch(u){Tt(U(u,"The visit could not be left yet.")),Ui.current=!1}finally{dt(!1)}}},[Qe,Z]),E0=(0,m.useCallback)(async()=>{if(!(!Z?.id||!sc||Qa)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){dt(!0);try{await D("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:Z.id})}),Ye(null),Sa(!1),da([]),ha.current.clear(),_i(""),K("home"),Qe()}catch(u){Tt(U(u,"The debug discard failed."))}finally{dt(!1)}}},[Z,sc,Qa,Qe]),k0=(0,m.useCallback)(async()=>{let u=lc.trim();if(Z===null||!Z.id||cc||Qa||_r.current||u.length===0)return;_r.current=!0;let d=qi.current??Hu();qi.current=d;let w=Z;try{await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:Z.id})})}catch($){_r.current=!1;let L=cr($);L?(Ye(null),Sa(!1),da([]),ha.current.clear(),al(L==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),K("home"),Qe()):Tt(U($,"The visit could not be checked."));return}let E={speakerId:"",name:"",role:"user",content:u,at:new Date().toISOString()};dt(!0),Tt(""),_i(""),Ye({...Z,lines:[...Z.lines,E]});try{let $=await D("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:Z.id,message:u,mode:Vr,targetId:Vr==="fulfill"?tl:"",submissionId:d}),signal:AbortSignal.timeout(3e5)});if(Ye($.session),bf($.session.status==="closed"),$.session.status==="closed")da([]),ha.current.clear();else for(let L of $.recordEvents??[])ha.current.has(L.id)||(ha.current.add(L.id),da(be=>[...be,L]));tl&&!$.session.activeIds.includes(tl)&&Dr(""),ff($.verdict?.reason??""),qi.current=null,nl(""),Qe()}catch($){let L=cr($);if(L){Ye(null),Sa(!1),da([]),ha.current.clear(),al(L==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),K("home"),Qe();return}Ye(w),_i(u),Tt(U($,"That line could not be sent."))}finally{_r.current=!1,dt(!1)}},[Qe,Z,Qa,lc,cc,Vr,tl]),C0=(0,m.useCallback)(u=>(n?.villagers??[]).filter(d=>d.place?.id===u),[n]),pc=(0,m.useCallback)((u,d=!1)=>{Ne(null),Ue(!1),Ya(u.id),ut(d),ue(null),K("venue")},[]),bc=(0,m.useCallback)(async u=>{dt(!0),Tt(""),nl("");try{let d=await D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u}),signal:AbortSignal.timeout(3e4)});Ye(d.session)}catch(d){let w=await Aw(u);w?Ye(w):Tt(zw(d))}finally{dt(!1)}},[]),A0=(0,m.useCallback)(async u=>{dt(!0);try{let{session:d}=await D("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:u}),signal:AbortSignal.timeout(1e4)});Ye(d),nl(d.lines.length===0?"The greeting failed. You can start the conversation now.":""),Tt("")}catch(d){Tt(U(d,"The visit could not continue. Retry or leave the venue."))}finally{dt(!1)}},[]),Gr=(0,m.useCallback)(async u=>{Ui.current=!1,Ne(null),Ue(!1),pn(null),_i(""),bf(!1),Tt(""),nl(""),da([]),ha.current.clear(),dt(!0),Ye({version:1,id:"",placeId:u.id,placeName:u.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Sa(!0),K("room");try{let{session:d}=await D("/rooms",{method:"POST",body:JSON.stringify({venueId:u.id}),signal:AbortSignal.timeout(2e4)});Ye(d),rc("chat"),Dr(""),ff(""),al(""),Sa(!0),d.status==="opening"&&await bc(d.id)}catch(d){Tt(U(d,"That room could not be opened. Retry or leave the venue."))}finally{dt(!1)}},[bc]),Sf=(0,m.useCallback)(u=>{Ue(!1),Ne(u.id),K("home")},[]),Tf=(0,m.useCallback)(()=>{Ya(null),ut(!1),ue(null),Ne(null),K("home")},[]),z0=(0,m.useCallback)(async()=>{B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:Ia,playerPersonaId:_t,setting:yr,selectedLorebookIds:wr})}))}catch(u){Y(U(u,"Those settings could not be saved."))}finally{B(!1)}},[Ia,wr,_t,yr]),M0=(0,m.useCallback)(async u=>{B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({storyPace:u})}))}catch(d){Y(U(d,"That could not be saved."))}finally{B(!1)}},[]),Ef=(0,m.useCallback)(async u=>{B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:u})})),p(d=>d+1)}catch(d){Y(U(d,"Visit retention could not be saved."))}finally{B(!1)}},[]),O0=(0,m.useCallback)(async()=>{if(!(n&&ya(n.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){B(!0),Y("");try{let u=await D("/bootstrap",{method:"POST"});mn(u.places.map(d=>({id:Lu(),name:d.name,purpose:d.purpose,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(u){Y(U(u,"The village did not suggest any places."))}finally{B(!1)}}},[n]),Gi=`${gn.trim()}\0${Pe.trim()}\0${JSON.stringify(Er)}\0${xa.join(",")}`,R0=(0,m.useCallback)(async()=>{if(Pe.trim().length===0){$e("Write the Setting and Theme before generating its map.");return}if(gn.trim().length===0){$e("The DEBUG map layout prompt cannot be blank.");return}Jo(!0),$e("");try{let u=await D("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:gn===n?.settings.townMapLayoutPrompt?void 0:gn,setting:Pe,options:Er,selectedLorebookIds:xa})}),d=await Vm(u.image);if(d.width!==u.width||d.height!==u.height)throw new Error("The generated map's reported dimensions do not match the image.");Zu(u.image),Ku("generate"),Ju(d),Pu(Gi),Pn("generate")}catch(u){$e(U(u,"The village map could not be generated."))}finally{Jo(!1)}},[xa,Gi,gn,Pe,Er,n?.settings.townMapLayoutPrompt]),V0=(0,m.useCallback)(async()=>{$e(""),B(!0);try{let u=await D("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:Pe,selectedLorebookIds:xa})});$r(u.names)}catch(u){$e(U(u,"The village could not suggest names for the public venue."))}finally{B(!1)}},[xa,Pe]),D0=(0,m.useCallback)(async u=>{if(!u||!n)return;$e("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(u.size>d){let w=E=>Math.round(E/1e5)/10;$e(`That picture is ${w(u.size)} MB and a village map holds ${w(d)} MB. Choose a smaller copy.`);return}Jo(!0);try{let w=await Yu(u),E=await Vm(w);Zu(w),Ku("upload"),Ju(E),Pu(""),Pn("upload")}catch(w){$e(U(w,"That picture could not be used as the village map."))}finally{Jo(!1)}},[n]),kf=(0,m.useCallback)(async u=>{if(!u||!n)return;Y("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(u.size>d){let w=E=>Math.round(E/1e5)/10;Y(`That picture is ${w(u.size)} MB and the village map holds ${w(d)} MB. Try a smaller copy.`);return}B(!0);try{let w=await Yu(u),E=await Vm(w);tc({image:w,size:E}),Po(Bu("cover"))}catch(w){Y(U(w,"That picture could not be used as the town map."))}finally{B(!1)}},[n]),Cf=(0,m.useCallback)(async()=>{if(!n)return;let u=ca?ca.image:zr;B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:u,townMapView:ac??n.settings.townMapView})})),Mr(u),tc(null),Po(null),nc(!1)}catch(d){Y(U(d,"The town map could not be saved."))}finally{B(!1)}},[n,ac,zr,ca]),Yr=(0,m.useCallback)(()=>{tc(null),Po(null),nc(!1),Y("")},[]),Af=(0,m.useCallback)(async()=>{B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),Mr(""),Yr()}catch(u){Y(U(u,"The town map could not be taken down."))}finally{B(!1)}},[Yr]),_0=(0,m.useCallback)(async u=>{if(!$a){Vi(u),pn(null),Y("");try{o(await D("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:u})}))}catch(d){pn({id:u,text:U(d,"That place could not be drawn.")})}finally{Vi("")}}},[$a]),H0=(0,m.useCallback)(async(u,d)=>{if(!(!d||!n||$a)){Vi(u),pn(null),Y("");try{let w=$=>Math.round($/1e5)/10;if(d.size>n.settings.maxVenueImageBytes){pn({id:u,text:`That picture is ${w(d.size)} MB and a place holds ${w(n.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let E=await Yu(d);o(await D("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:u,image:E})}))}catch(w){pn({id:u,text:U(w,"That picture could not be kept.")})}finally{Vi("")}}},[$a,n]),U0=(0,m.useCallback)(async u=>{if(!$a){Vi(u),pn(null),Y("");try{o(await D("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:u})}))}catch(d){pn({id:u,text:U(d,"That picture could not be taken away.")})}finally{Vi("")}}},[$a]),q0=n?.settings.maxPlaces??48,il=n?.settings.setupMaxVillagerCount??zm,ol=(n?.settings.homeBuildings??[]).map(u=>({...u,name:n?.settings.homeBuildingNames?.[u.kind]??u.name})),vc=n?.settings.defaultHomeBuilding??"",zf=Gu(ol,vc).name.toLowerCase(),L0=n&&!n.isFounded?1+il:q0,jr=Math.max(0,L0-ya(n?.settings.venues??[]).length),Mf=mr(n?.settings.venues??[]).length+zi.length,ll=(0,m.useCallback)(u=>{let d=mr(u);Xo(d.map(w=>({id:w.id,description:w.description,x:w.x,y:w.y,building:w.building,isPlayerHome:w.isPlayerHome,characterId:w.characterId}))),Oi(d[0]?.id??null),Zt(!1)},[]),Of=(0,m.useCallback)(()=>{Y(""),n&&ll(n.settings.venues),C("village"),Ai("homes"),K("menu")},[ll,n]),Ir=(0,m.useCallback)((u,d)=>{if(Y(""),ce.length>=jr||ce.length>=1+il)return;let w=Lu(),E=ce.length===0;Xo($=>[...$,{id:w,description:Ew,x:u,y:d,building:vc,isPlayerHome:E,characterId:null}]),Ri($=>({...$,[w]:Ew})),Oi(w)},[vc,ce.length,jr,il]),B0=(0,m.useCallback)((u,d)=>{if(ju){sf({x:u,y:d}),Mi(!1);return}Ir(u,d)},[Ir,ju]),G0=(0,m.useCallback)((u,d)=>{Ir(u,d),Zt(!1),K("menu")},[Ir]),yc=(0,m.useCallback)((u,d)=>{n?.settings.venues.some(w=>w.id===u&&w.occupancy.residentCharacterId)||Xo(w=>w.map(E=>E.id===u?{...E,...d}:E))},[n]),wc=(0,m.useCallback)(u=>{if(n?.settings.venues.some(d=>d.id===u&&d.occupancy.residentCharacterId)){Y("Move the resident to another venue before removing this home.");return}Xo(d=>{let w=d.filter(E=>E.id!==u);return w.length>0&&!w.some(E=>E.isPlayerHome)&&(w[0]={...w[0],isPlayerHome:!0,characterId:null}),w})},[n]),Y0=(0,m.useCallback)(async()=>{if(n){if(ce.some(u=>!u.description.trim())){Y("Review a description for every home before saving.");return}B(!0),Y("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({venues:Mw(n.settings.venues,ce),venueScope:"homes"})})),Zt(!1)}catch(u){Y(U(u,"Those homes could not be saved."))}finally{B(!1)}}},[ce,n]),j0=async u=>{if(!n)return;let d=n.villagers.find(E=>E.characterId===u.characterId)?.name,w=u.isPlayerHome?`${Kn(n)}'s home`:d?`${d}'s home`:Gu(ol,u.building).name;B(!0),Y("");try{let E=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:u.id,name:w,purpose:u.isPlayerHome?"Player residence":d?`Home of ${d}`:"Available home",homeKind:u.building}]})});yc(u.id,{description:E.descriptions[u.id]??""})}catch(E){Y(U(E,"The home description could not be generated. You can write it by hand."))}finally{B(!1)}},rl=(0,m.useCallback)((u,d)=>{Y(""),$e(""),cf(!1),Fo(!1),Ar(!1),ra(!1),Im(""),Qu(0),tf(u?"":d?.village.name??""),af(u?"":d?.village.setting??""),nf(u?"":d?.settings.foundingReason??""),of(u?"":d?.settings.foundingDetails??""),$r([]);let w=d?.settings.venues.find($=>$.category.trim().toLowerCase()==="public-center");Ri(u||!d?{}:{...Object.fromEntries(mr(d.settings.venues).map($=>[$.id,$.description])),"setup-public-center":w?.description??""}),fn([]),Tr(u?{"small-home":"Small home","medium-home":"Medium home","large-home":"Large home","huge-home":"Huge home"}:d?.settings.homeBuildingNames??{}),Km(u?[]:d?.settings.selectedLorebookIds??[]),rf({...$w}),Pn(u?"generate":d?.settings.townMapImageSetAt?"existing":"none"),Zu(""),Ku(null),Ju(null),Fu(d?.settings.townMapLayoutPrompt??""),Pu(""),Jo(!1),Wu(u?"":d?.settings.venues.find($=>$.category.trim().toLowerCase()==="public-center")?.name??"");let E=d?.settings.venues.find($=>$.category.trim().toLowerCase()==="public-center");sf(u?null:dr(E)),br(u?"":d?.settings.playerPersonaId??""),Li(),Bi(),ll(u||!d?[]:d.settings.venues),K("setup")},[Bi,Li,ll]),Rf=(0,m.useCallback)(u=>{if(Me===0&&u>0){if(Na.trim().length===0){$e("Give the village a name before continuing.");return}if(_t.trim().length===0){$e("Choose the Persona who lives in this village.");return}if(!Kt||Kt==="something-else"&&!Xa.trim()){$e("Choose why the village is being founded, and describe Something else if selected.");return}}if(Me===1&&u>1&&ec.length>0){$e(ec);return}if(Me===1&&u>1&&uf){Fo(!0);return}if(Me===2&&u>2){if(Pe.trim().length===0){$e("Write the Setting and Theme before continuing.");return}if(pe!=="none"&&!Wn){$e(pe==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(pe==="generate"&&Cr!==Gi){$e("The setting, map options, or DEBUG prompt changed. Generate the map again before continuing.");return}}if(Me===3&&u>3){let d=ce.filter(w=>!w.isPlayerHome).length;if(!ce.some(w=>w.isPlayerHome)||d<Tw||d>zm||ua.trim().length===0||Jt===null){$e("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}}Fo(!1),$e(""),Me===4&&u<4&&fn([]),Qu(u),u===0&&(Li(),Bi()),u===3&&Ta(),Zt(u===3),Mi(!1)},[ec,ce,uf,Ta,Li,Bi,_t,ua,Jt,Cr,Gi,pe,Wn,Na,Kt,Xa,Pe,Me]),I0=(0,m.useCallback)(()=>{Fo(!1),$e(""),Qu(2),Zt(!1),Mi(!1)},[]),X0=(0,m.useCallback)(()=>{Fo(!1),$e("")},[]),Yi=(0,m.useMemo)(()=>[...ce.map(u=>{let d=u.isPlayerHome?vr?.find(w=>w.id===_t)?.name??"Player":l?.find(w=>w.id===u.characterId)?.name??"Villager";return{id:u.id,name:`${d}'s home`,purpose:`Home of ${d}`,homeKind:u.building}}),{id:"setup-public-center",name:ua.trim(),purpose:"A public meeting place",homeKind:null}],[ce,vr,_t,l,ua]),Q0=(0,m.useCallback)(async()=>{$e(""),B(!0);try{let u=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({setting:Pe,foundingReason:Kt,foundingDetails:Xa,selectedLorebookIds:xa,venues:Yi.filter(d=>d.id==="setup-public-center")})});Ri(d=>({...d,...u.descriptions})),fn(d=>d.filter(w=>w!=="setup-public-center"))}catch(u){$e(U(u,"Descriptions could not be generated. You can write them by hand."))}finally{B(!1)}},[Yi,Xa,Kt,xa,Pe]),Vf=(0,m.useCallback)(()=>{if(Na.trim().length===0)return"Give the village a name.";if(_t.trim().length===0)return"Choose the Persona who lives in this village.";if(!Kt||Kt==="something-else"&&!Xa.trim())return"Choose why the village is being founded.";if(Pe.trim().length===0)return"Write the Setting and Theme.";if(pe!=="none"&&!Wn)return"Choose, generate, or upload the village map.";if(pe==="generate"&&Cr!==Gi)return"Generate the map again so it matches the current setting, options, and prompt.";let u=ce.filter(w=>!w.isPlayerHome);if(u.length<Tw||u.length>zm)return"Place one to three homes for initial villagers.";if(!ce.some(w=>w.isPlayerHome))return"One of the homes has to be yours.";let d=u.map(w=>w.characterId).filter(w=>w!==null);return d.length!==u.length?"Choose who lives in each villager home.":new Set(d).size!==d.length?"A villager can only live in one house.":ua.trim().length===0?"Give the public center a name.":Jt===null?"Place the public center on the map.":!n?.isFounded&&Yi.some(w=>!Fn[w.id]?.trim()||!Sr.includes(w.id))?"Approve a description for every founding place.":""},[ce,_t,ua,Jt,Cr,Gi,pe,Wn,Na,Kt,Xa,Pe,Yi,Fn,Sr,n?.isFounded]),Z0=(0,m.useCallback)(async()=>{let u=Vf();if(u){$e(u);return}B(!0),$e("");try{let d=n?.settings.venues.find(E=>E.category.trim().toLowerCase()==="public-center"),w={id:d?.id??Lu(),name:ua.trim(),purpose:d?.purpose??"",description:Fn["setup-public-center"]??d?.description??"",category:"public-center",presentation:{image:d?.presentation.image??null,x:Jt.x,y:Jt.y},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:d?.capabilities??[],state:d?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}};o(await D("/setup",{method:"POST",body:JSON.stringify({name:Na.trim(),setting:Pe.trim(),foundingReason:Kt,foundingDetails:Xa.trim(),selectedLorebookIds:xa,playerPersonaId:_t,townMapImage:Wn??"",townMapView:pe==="existing"?Di:Bu("cover"),homeBuildingNames:Zo,venues:[...Mw(n?.settings.venues??[],ce).filter(E=>E.id!==w.id).map(E=>({...E,description:Fn[E.id]??E.description})),w]})})),Zt(!1),K("home")}catch(d){$e(U(d,"The village could not be founded."))}finally{B(!1)}},[ce,_t,ua,Jt,Di,Vf,pe,Wn,Na,Kt,Xa,xa,Pe,Fn,Zo,n]),K0=(0,m.useCallback)(async()=>{B(!0),Y("");try{let u=await D("/setup/reset",{method:"POST"});o(u),s(null),rl(!0,u)}catch(u){Y(U(u,"The village could not be reset."))}finally{B(!1),Ar(!1)}},[rl]),Df=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!n||Df.current||(Df.current=!0,n.isFounded||rl(!1,n))},[rl,n]);let J0=(0,m.useCallback)(()=>{mn(u=>[...u,{id:Lu(),name:"",purpose:"",description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}])},[]),ji=(0,m.useCallback)((u,d)=>{mn(w=>w.map(E=>E.id===u?{...E,...d}:E))},[]),F0=(0,m.useCallback)(async u=>{B(!0),Y("");try{let d=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:u.id,name:u.name,purpose:u.purpose}]})});ji(u.id,{description:d.descriptions[u.id]??""})}catch(d){Y(U(d,"The description draft could not be generated."))}finally{B(!1)}},[ji]),P0=(0,m.useCallback)(async u=>{B(!0),Y("");try{let d=n?.settings.venues.some($=>$.id===u.id)??!1,w=await D(d?`/locations/venue/${encodeURIComponent(u.id)}`:"/locations/venue",{method:d?"PUT":"POST",body:JSON.stringify({name:u.name,purpose:u.purpose,category:u.category,description:u.description})}),E=ya(w.settings.venues).find($=>d?$.id===u.id:$.name.toLowerCase()===u.name.trim().toLowerCase());o(w),mn($=>{let L=$.map(be=>be.id===u.id&&E?E:be);return[...L,...ya(w.settings.venues).filter(be=>!L.some(Et=>Et.id===be.id))]})}catch(d){Y(U(d,"That place could not be saved."))}finally{B(!1)}},[n]),W0=(0,m.useCallback)(async u=>{let d=n?.settings.venues.find(w=>w.id===u);if(!d){mn(w=>w.filter(E=>E.id!==u));return}B(!0),Y("");try{let w=await D(`/locations/venue/${encodeURIComponent(u)}/dependencies`);if(w.roomPresent){Y("End the active visit before deleting this venue.");return}let E=w.residentCharacterIds.length+w.pendingResidenceCharacterIds.length,$=E||w.remapCount||w.eventCount?`This place is referenced by ${E} residents, ${w.remapCount} schedule moves, and ${w.eventCount} events. Delete it?`:`Delete ${d.name}?`;if(!window.confirm($))return;let L=await D(`/locations/venue/${encodeURIComponent(u)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(L),mn(be=>be.filter(Et=>Et.id!==u))}catch(w){Y(U(w,"That place could not be removed."))}finally{B(!1)}},[n]),_f=(0,m.useCallback)(async(u,d)=>{B(!0),Y("");try{let w=H[u.id]??u.venueDraft,E=await D(`/venue-requests/${encodeURIComponent(u.id)}/${d?"approve":"deny"}`,{method:"POST",body:d?JSON.stringify(w):void 0});if(o(E),d){let $=new Set(zi.map(L=>L.id));mn(L=>[...L,...ya(E.settings.venues).filter(be=>!$.has(be.id))])}ie($=>{let L={...$};return delete L[u.id],L})}catch(w){Y(U(w,d?"That venue could not be approved.":"That request could not be denied."))}finally{B(!1)}},[H,zi]),e1=(0,m.useCallback)(u=>{let d=hc.current,w=d?.selectionStart??Ia.length,E=d?.selectionEnd??w;mc.current=w+u.length,pr(`${Ia.slice(0,w)}${u}${Ia.slice(E)}`)},[Ia]),Hf=(0,m.useCallback)(async()=>{let u=Nr.trim();if(u.length!==0){B(!0),Y("");try{o(await D("/noticeboard",{method:"POST",body:JSON.stringify({notice:u})})),ef("")}catch(d){Y(U(d,"That notice could not be pinned up."))}finally{B(!1)}}},[Nr]),t1=(0,m.useCallback)(async u=>{B(!0),Y("");try{o(await D(`/noticeboard/${u}`,{method:"DELETE"}))}catch(d){Y(U(d,"That notice could not be taken down."))}finally{B(!1)}},[]),Xr=jm.trim().toLowerCase(),xc=(l??[]).filter(u=>Xr.length===0||u.name.toLowerCase().includes(Xr)||u.comment.toLowerCase().includes(Xr)||u.tags.some(d=>d.toLowerCase().includes(Xr))),Uf=[...(n?.villagers??[]).map(u=>u.characterId),...Ga?xc.map(u=>u.id):[]].join(`
`),qf=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let u=Uf.split(`
`).filter(w=>w.length>0&&!qf.current.has(w));if(u.length===0)return;for(let w of u)qf.current.add(w);let d=new AbortController;return(async()=>{try{let w=await a5(u,d.signal);d.signal.aborted||sa(E=>({...E,...w}))}catch{}})(),()=>d.abort()},[Uf]);let Nc=n?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(Ym(null),Nc.length===0)return;let u=new AbortController;return(async()=>{try{let d=await n5(Nc,u.signal);u.signal.aborted||Ym(d)}catch{}})(),()=>u.abort()},[Nc]);let ei=(0,m.useCallback)(u=>u?l?.find(d=>d.id===u)?.name??n?.villagers.find(d=>d.characterId===u)?.name??"":"",[l,n]),a1=(()=>{let u=n?.settings.venues??[],d=[],w=new Map;for(let E of n?.villagers??[]){let $=E.place?.id;if(!$)continue;let L=w.get($);L?L.push(E):w.set($,[E])}for(let E of u){let $=dr(E);if(!$)continue;let L=E.occupancy.residentCharacterId,be=fr(E),Et=E.occupancy.playerHome?Kn(n):ei(L);d.push({id:E.id,x:$.x,y:$.y,text:be?Vw(Et):E.name,image:E.presentation.image?.url??null,tone:be?Rm({isPlayerHome:E.occupancy.playerHome,occupant:L}):"venue",doors:O===E.id?[{label:"View venue",onSelect:()=>pc(E,!0)},{label:"Visit",onSelect:()=>{Gr(E)}}]:void 0,onSelect:()=>Sf(E)}),(w.get(E.id)??[]).forEach((Qr,i1)=>{d.push({id:`villager:${Qr.characterId}`,x:$.x,y:$.y,dy:b5*(i1+1),text:Qr.name,tone:"resident",kind:"person"})})}return d})(),n1=[...ce.flatMap(u=>{if(u.x===null||u.y===null)return[];let d=u.isPlayerHome?Kn(n):ei(u.characterId);return[{id:u.id,x:u.x,y:u.y,text:Vw(d),tone:Rm({isPlayerHome:u.isPlayerHome,occupant:d}),onSelect:()=>Oi(u.id),onRemove:()=>wc(u.id)}]}),...Jt?[{id:"setup-public-center",x:Jt.x,y:Jt.y,text:ua.trim()||"Public center",tone:"place",onSelect:()=>{Zt(!1),Mi(!0)}}]:[]];if(Re==="room")return(0,r.jsx)("div",{className:`${i}-root ${i}-room-screen`,children:Z?(0,r.jsx)(T5,{room:Z,picture:F$(n?.settings.venues??[],Z.placeId),draft:lc,mode:Vr,targetId:tl,busy:Qa,error:m0,greetingNotice:f0,ruling:c0,open:u0,ended:cc,playerName:Kn(n),playerPortrait:e0??void 0,portraits:Dt,sprites:Object.fromEntries((n?.villagers??[]).map(u=>[u.characterId,u.sprite])),onDraft:u=>{qi.current=null,_i(u)},onMode:u=>{qi.current=null,rc(u),u!=="fulfill"&&Dr("")},onTarget:u=>{qi.current=null,Dr(u)},onSend:()=>{k0()},onEnd:()=>{S0()},notices:d0,onDismissNotice:u=>da(d=>d.filter(w=>w.id!==u)),debugDiscardEnabled:sc,onDebugDiscard:()=>{E0()},onLeavePending:()=>{T0()},endFailed:z,onRetryGreeting:()=>{if(Z.id)bc(Z.id);else{let u=n?.settings.venues.find(d=>d.id===Z.placeId);u&&Gr(u)}},onContinueWithoutGreeting:()=>{Z.id&&A0(Z.id)}}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:gc,children:"Back to village"})});if(Re==="venue"){let u=(n?.settings.venues??[]).find($=>$.id===le)??null;if(!n||!u)return(0,r.jsx)("div",{className:`${i}-root`,children:(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Whatever this screen was standing in is not in the village now."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Tf,children:"Back to the map"})})]})});let d=C0(u.id),w=u.occupancy.homeKind?Gu(ol,u.occupancy.homeKind).name:"",E=u.occupancy.playerHome?Kn(n):ei(u.occupancy.residentCharacterId);return(0,r.jsxs)("div",{className:`${i}-root`,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:Dw(u,E)}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:d.length===0?"Nobody is here at this hour.":d.map($=>$.name).join(", ")})]}),(0,r.jsxs)("div",{className:`${i}-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":xe,onClick:()=>ut($=>!$),children:"About"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{$t(""),ue($=>$?null:structuredClone(u))},children:F?"Close editor":"Edit room"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Tf,children:"Back to map"})]})]}),(0,r.jsxs)("div",{className:`${i}-venue`,children:[u.presentation.image?(0,r.jsx)("img",{className:`${i}-venue-picture`,src:u.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-venue-picture`,"data-empty":"true","aria-hidden":"true",children:w.length>0?`A ${w.toLowerCase()}, not drawn yet`:"Not drawn yet"}),(0,r.jsxs)("div",{className:`${i}-venue-body`,children:[(0,r.jsx)("p",{className:`${i}-venue-beat`,children:u.description||u.purpose||`A place in ${n.village.name||"the village"}.`}),u.description&&u.purpose?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Venue Purpose: ",u.purpose]}):null,u.state.condition?(0,r.jsx)("p",{className:`${i}-empty`,children:u.state.condition}):null,u.state.upgrades.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Approved upgrades: ",u.state.upgrades.join(", ")]}):null,(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Furniture and items"}),u.state.furniture.length?(0,r.jsx)("ul",{className:`${i}-roster`,children:u.state.furniture.map(($,L)=>(0,r.jsx)("li",{className:`${i}-roster-row`,children:$},`${L}-${$}`))}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No items listed."})]}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("span",{className:`${i}-label`,children:["Venue features (",u.state.features?.length??0,"/5)"]}),(u.state.features?.length??0)>0?(0,r.jsx)("ul",{className:`${i}-roster`,children:u.state.features?.map($=>(0,r.jsxs)("li",{className:`${i}-roster-row`,children:[(0,r.jsx)("strong",{children:$.text}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${$.locked?"Locked":"Unlocked"} \xB7 Added by ${n.villagers.find(L=>L.characterId===$.sourceCharacterId)?.name??"player"}${$.updatedAt?` \xB7 Updated ${new Date($.updatedAt).toLocaleDateString()}`:""}`})]},$.id))}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No venue features yet."})]}),F?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:["Edit ",Dw(u,E)]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:F.name,maxLength:n.settings.maxVenueNameLength,onChange:$=>ue({...F,name:$.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Venue Purpose",(0,r.jsx)("input",{className:`${i}-notice-input`,value:F.purpose,maxLength:n.settings.maxVenueNoteLength,onChange:$=>ue({...F,purpose:$.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Category",(0,r.jsx)("input",{className:`${i}-notice-input`,value:F.category,maxLength:n.settings.maxVenueNoteLength,onChange:$=>ue({...F,category:$.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Room description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:F.description,maxLength:1e3,onChange:$=>ue({...F,description:$.target.value})})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:X,onClick:()=>{Nt(!0),$t(""),D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:u.id,name:F.name,purpose:F.purpose,homeKind:u.occupancy.homeKind}]})}).then($=>ue(L=>L?{...L,description:$.descriptions[u.id]??L.description}:null)).catch($=>$t(U($,"A description draft could not be generated."))).finally(()=>Nt(!1))},children:"Generate description draft"}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition",(0,r.jsx)("input",{className:`${i}-notice-input`,value:F.state.condition,maxLength:n.settings.maxVenueNoteLength,onChange:$=>ue({...F,state:{...F.state,condition:$.target.value}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Furniture and items (one per line)",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:F.state.furniture.join(`
`),onChange:$=>ue({...F,state:{...F.state,furniture:$.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Public facts (one per line)",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:F.state.publicFacts.join(`
`),onChange:$=>ue({...F,state:{...F.state,publicFacts:$.target.value.split(`
`)}})})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Structural upgrades come from villager requests and player approval."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:X||!fr(F)&&!F.name.trim()||!F.description.trim(),onClick:()=>{Nt(!0),$t(""),D(`/locations/venue/${encodeURIComponent(u.id)}`,{method:"PUT",body:JSON.stringify({name:F.name,purpose:F.purpose,category:F.category,description:F.description,state:{condition:F.state.condition,furniture:F.state.furniture.map($=>$.trim()).filter(Boolean),publicFacts:F.state.publicFacts.map($=>$.trim()).filter(Boolean)}})}).then($=>{o($),ue(structuredClone($.settings.venues.find(L=>L.id===u.id)??u))}).catch($=>$t(U($,"The room could not be saved."))).finally(()=>Nt(!1))},children:"Approve and save room details"}),ja?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:ja}):null]}):null,F?(0,r.jsx)(E5,{place:u,residents:n.villagers,onSave:async($,L)=>{let be=await D(`/locations/venue/${encodeURIComponent(u.id)}`,{method:"PUT",body:JSON.stringify({workerIds:L,state:{features:$}})});o(be)},onPromoteItem:async $=>{if((u.state.features?.length??0)>=5)throw new Error("This venue already has five features.");let L=u.state.furniture[$];if(!L)throw new Error("Choose an item to promote.");let be=await D(`/locations/venue/${encodeURIComponent(u.id)}`,{method:"PUT",body:JSON.stringify({state:{furniture:u.state.furniture.filter((Et,Qr)=>Qr!==$),features:[...u.state.features??[],{id:Hu(),text:L,sourceCharacterId:"",locked:!1,updatedAt:""}]}})});o(be)}},`${u.id}:${u.state.updatedAt}`):null,F&&u.occupancy.residentCharacterId?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Resident move"}),(0,r.jsx)("p",{className:`${i}-hint`,children:`${ei(u.occupancy.residentCharacterId)} lives here. You may ask them to move; they can accept or decline in conversation. Their home stays here until an approved move finishes.`}),n.residences.find($=>$.characterId===u.occupancy.residentCharacterId&&$.status!=="current")?(0,r.jsx)("p",{className:`${i}-hint`,children:(()=>{let $=n.residences.find(be=>be.characterId===u.occupancy.residentCharacterId&&be.status!=="current"),L=n.settings.venues.find(be=>be.id===$.proposedVenueId)?.name??"another venue";return $.status==="moving"?`Moving to ${L}; due ${new Date($.completesAt??"").toLocaleString()}.`:`Move to ${L} requested by ${$.requestedBy??"villager"}; awaiting approval.`})()}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{value:hn,onChange:$=>Io($.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose an available venue"}),n.settings.venues.filter($=>$.id!==u.id&&!$.occupancy.playerHome&&!$.occupancy.residentCharacterId).map($=>(0,r.jsx)("option",{value:$.id,children:$.name||"Empty home"},$.id))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!hn||X,onClick:()=>{Nt(!0),$t(""),D("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:u.occupancy.residentCharacterId,venueId:hn})}).then(o).catch($=>$t(U($,"The move could not be requested."))).finally(()=>Nt(!1))},children:"Ask resident to move"})]})]}):null,(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-label`,children:"DEBUG: Active traces"}),(u.state.traces?.length??0)>0?(0,r.jsx)("ul",{className:`${i}-roster`,children:u.state.traces?.map($=>(0,r.jsxs)("li",{className:`${i}-roster-row`,children:[$.text," ",(0,r.jsx)("span",{className:`${i}-hint`,children:`(${$.kind}, ${$.id})`})]},$.id))}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No active traces."})]}),u.state.publicFacts.length?(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-label`,children:"About this place"}),(0,r.jsx)("ul",{className:`${i}-roster`,children:u.state.publicFacts.map(($,L)=>(0,r.jsx)("li",{className:`${i}-roster-row`,children:$},`${L}-${$}`))})]}):null,F?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:$a===u.id||R,onClick:()=>{_0(u.id)},children:u.presentation.image?"Draw it again":"Draw a picture"}),(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*",disabled:$a===u.id||R,"aria-label":`Choose a picture for ${u.name}`,onChange:$=>{let L=$.target.files?.[0];$.target.value="",H0(u.id,L)}}),u.presentation.image?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:$a===u.id||R,onClick:()=>{U0(u.id)},children:"Take picture away"}):null]})]}):null,$a===u.id?(0,r.jsx)("p",{className:`${i}-hint`,children:"Working on it\u2026 a drawing can take a minute."}):null,ic&&ic.id===u.id?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":"warn",children:ic.text}):null,xe?(0,r.jsxs)("div",{className:`${i}-venue-about`,children:[u.purpose.length>0?(0,r.jsx)("p",{className:`${i}-empty`,children:u.purpose}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has written anything about this place."}),w.length>0?(0,r.jsxs)("p",{className:`${i}-hint`,children:["What stands here is ",w.toLowerCase(),"."]}):null,(0,r.jsx)("p",{className:`${i}-hint`,children:n.village.setting.length>0?n.village.setting:"This village has not said what it is like yet, so this is everything it knows."})]}):null,(0,r.jsxs)("div",{className:`${i}-venue-here`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Here right now"}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Qa,onClick:()=>{Gr(u)},title:`Enter the shared space with ${d.length} ${d.length===1?"villager":"villagers"} present. They may speak or continue what they are doing.`,children:Qa?"Opening visit\u2026":"Visit"})}),d.length>0?(0,r.jsx)("ul",{className:`${i}-roster`,children:d.map($=>(0,r.jsx)("li",{className:`${i}-roster-row`,children:(0,r.jsx)("span",{className:`${i}-villager-name`,children:$.name})},$.characterId))}):null]})]})]})]})}if(Re==="menu")return(0,r.jsxs)("div",{className:`${i}-root ${i}-sectioned-menu`,"data-section":Vt,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[Vt]}),t?null:(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Vt!=="index"?()=>C("index"):gc,children:Vt!=="index"?"Back to menu":"Back to the village"})})]}),el?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:el}):null,(0,r.jsx)("nav",{className:`${i}-mobile-menu-nav`,"aria-label":"Village menu",children:Vt==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>We("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>We("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>We("story"),children:"DEBUG Settings"})]}):Vt==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([u,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":G===u,onClick:()=>u==="homes"?Of():We(u),children:d},u))}):Vt==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([u,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":G===u,onClick:()=>We(u),children:d},u)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||R||qr,onClick:()=>{wf()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${i}-status`,children:Yw}),Hr?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:Hr}):null]}):null}),(0,r.jsxs)("nav",{className:`${i}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="villagers","data-active":G==="villagers"?"true":"false",disabled:!n||R,onClick:()=>We("villagers"),children:`Villagers (${n?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="noticeboard","data-active":G==="noticeboard"?"true":"false",disabled:!n||R,onClick:()=>We("noticeboard"),children:`Noticeboard (${n?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="venueRequests","data-active":G==="venueRequests"?"true":"false",disabled:!n||R,onClick:()=>We("venueRequests"),children:`Venue Requests (${(n?.venueRequests?.length??0)+(n?.upgradeRequests?.length??0)+(n?.residences?.filter(u=>u.status==="pending"&&u.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="homes","data-active":G==="homes"?"true":"false",disabled:!n||R,onClick:Of,children:`Homes (${mr(n?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="map","data-active":G==="map"?"true":"false",disabled:!n||R,onClick:()=>We("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="village","data-active":G==="village"?"true":"false",onClick:()=>We("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${i}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="general","data-active":G==="general"?"true":"false",onClick:()=>We("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="replyGuidance","data-active":G==="replyGuidance"?"true":"false",disabled:!n||R,onClick:()=>We("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="story","data-active":G==="story"?"true":"false",disabled:!n||R,onClick:()=>We("story"),children:`DEBUG: Village Story (${c?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="chatlogs","data-active":G==="chatlogs"?"true":"false",disabled:!n||R,onClick:()=>We("chatlogs"),children:`DEBUG: Venue Visits (${N?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="agendas","data-active":G==="agendas"?"true":"false",disabled:!n||R,onClick:()=>We("agendas"),children:`DEBUG: Villager Wishes (${st?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="schedules","data-active":G==="schedules"?"true":"false",disabled:!n||R,onClick:()=>We("schedules"),children:`Villager Agendas (${st?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||R||qr,onClick:()=>{wf()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${i}-status`,children:Yw}),Hr?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:Hr}):null]})]}),G==="general"?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General settings"}),(0,r.jsx)(Bw,{}),n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${i}-story-pace`,value:n.settings.storyPace,disabled:R,onChange:u=>{M0(u.target.value)},children:n.settings.storyPaces.map(u=>(0,r.jsx)("option",{value:u,children:u.charAt(0).toUpperCase()+u.slice(1)},u))}),(0,r.jsx)("span",{className:`${i}-hint`,children:l5(n.settings.storyPace)})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${i}-visit-retention`,value:n.settings.visitRetention.mode,disabled:R,onChange:u=>{let d=u.target.value;Ef({mode:d,value:d==="count"?100:d==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),n.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":n.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:n.settings.visitRetention.mode==="count"?1:30,max:n.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:n.settings.visitRetention.value,onBlur:u=>{let d=Number(u.target.value);d!==n.settings.visitRetention.value&&Ef({mode:n.settings.visitRetention.mode,value:d})}},`${n.settings.visitRetention.mode}:${n.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Setting the village up again is the same three questions you answered when you arrived, over the village as it stands now."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!n,onClick:()=>rl(!1,n),children:"Run setup again"}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${i}-row`,children:l0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-danger`,disabled:R,onClick:()=>{K0()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>Ar(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!n,onClick:()=>Ar(!0),children:"Reset the village and start over"})})]}),pt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:pt}):null]}):G==="village"?(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[n?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(w5,{}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Home tier names"}),["small-home","medium-home","large-home","huge-home"].map(u=>(0,r.jsxs)("label",{className:`${i}-label`,children:[u.replace("-"," "),(0,r.jsx)("input",{className:`${i}-notice-input`,value:Zo[u]??"",maxLength:60,onChange:d=>Tr(w=>({...w,[u]:d.target.value}))})]},u)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{B(!0),Y(""),D("/settings",{method:"PATCH",body:JSON.stringify({homeBuildingNames:Zo})}).then(o).catch(u=>Y(U(u,"Home tier names could not be saved."))).finally(()=>B(!1))},children:"Save home tier names"})]}),t?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Map background image"}),Or?(0,r.jsx)("img",{className:`${i}-mobile-map-preview`,src:Or,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:R,"aria-label":"Choose a town map picture",onChange:u=>{let d=u.target.files?.[0];u.target.value="",kf(d)}}),ca?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Cf()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:Yr,children:"Cancel"})]}):n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Af()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setting`,className:`${i}-textarea ${i}-off`,value:yr,maxLength:n.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:u=>Qm(u.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Read-only here. What this place is like is the wizard's first question, asked beside where the houses stand so the village is described once rather than twice; run it again to change this. What is written still reaches every villager in the meantime."})]}),(0,r.jsx)(Uw,{books:Jm,error:Fm,selected:wr,onChange:Zm,disabled:R}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Places in the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{O0()},disabled:R||!n,children:zi.length>0?"Replace with suggestions":"Suggest places"})]}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a character's card says they ",(0,r.jsx)("em",{children:"do"})," gets translated into one of these places \u2014 the card supplies the verb, the village supplies the noun. Renaming or reworking a place is safe: nothing about a villager is stored here."]}),(0,r.jsxs)("div",{children:[zi.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet. Suggest some, or add the first one by hand."}):(0,r.jsx)("div",{className:`${i}-notice-add`,children:zi.map((u,d)=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:u.name,maxLength:n.settings.maxVenueNameLength,placeholder:"Name of the place","aria-label":`Name of place ${d+1}`,onChange:w=>ji(u.id,{name:w.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:u.purpose,maxLength:n.settings.maxVenueNoteLength,placeholder:"What happens there (optional)",title:"Venue Purpose","aria-label":`What happens at place ${d+1}`,onChange:w=>ji(u.id,{purpose:w.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:u.category,maxLength:n.settings.maxVenueNoteLength,placeholder:"Category (optional)","aria-label":`Category of place ${d+1}`,onChange:w=>ji(u.id,{category:w.target.value})}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:u.description,maxLength:1e3,placeholder:"Approved room description","aria-label":`Description of ${u.name||`place ${d+1}`}`,onChange:w=>ji(u.id,{description:w.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!u.name.trim(),onClick:()=>{F0(u)},children:"Generate description draft"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{P0(u)},disabled:R||!u.name.trim()||!u.description.trim(),"aria-label":`Save place: ${u.name||d+1}`,children:"Save place"}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{W0(u.id)},disabled:R,"aria-label":`Remove place: ${u.name||d+1}`,children:"\xD7"})]},u.id))}),Mf<n.settings.maxPlaces?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>J0(),style:{marginTop:".5rem"},children:`Add a place (${Mf}/${n.settings.maxPlaces})`}):null]}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Nothing here is stored against a villager. A card says what somebody ",(0,r.jsx)("em",{children:"does"}),"; this is the list of places the village offers them to do it in. Open any saved place from ",(0,r.jsx)("strong",{children:"Places"})," on the village screen, even if it has no map pin yet."]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${i}-knowledge`,ref:hc,className:`${i}-preset`,value:Ia,maxLength:n.settings.promptBoxMaxLength,spellCheck:!1,onChange:u=>pr(u.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${i}-macros`,children:n.settings.macros.map(u=>(0,r.jsx)("button",{type:"button",className:`${i}-macro`,title:`${u.label} \u2014 ${u.help}`,onClick:()=>e1(u.token),children:u.token},u.token))}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)(Hw,{idPrefix:"settings",personas:vr,draft:_t,onDraft:br,storedId:n.settings.playerPersonaId,storedName:n.settings.playerPersonaName,storedMissing:n.settings.playerPersonaMissing,disabled:R}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{z0()},disabled:R,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{pr(n.settings.defaultPromptKnowledge)},disabled:R,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${i}-hint`,children:Ia===n.settings.promptKnowledge&&_t===n.settings.playerPersonaId&&yr===n.settings.setting&&JSON.stringify(wr)===JSON.stringify(n.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,pt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:pt}):null]}):(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[G==="villagers"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villagers"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ra(u=>!u),disabled:R,children:Ga?"Close the list":"Add a villager"})}),Ga?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("input",{className:`${i}-search`,type:"search",value:jm,onChange:u=>Im(u.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),l===null?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):xc.length===0?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${i}-picker-list`,children:xc.map(u=>(0,r.jsxs)("div",{className:`${i}-picker-item`,"data-resident":u.inVillage?"true":"false",children:[(0,r.jsx)(jo,{portrait:Dt[u.id],name:u.name,className:`${i}-avatar`}),(0,r.jsxs)("div",{className:`${i}-picker-text`,children:[(0,r.jsx)("div",{className:`${i}-villager-name`,children:u.name}),(0,r.jsx)("div",{className:`${i}-villager-role`,children:u.comment||u.tags.slice(0,3).join(" \xB7 ")}),u.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:u.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{w0(u.id)},disabled:R||u.inVillage,children:u.inVillage?"Lives here":"Move in"})]},u.id))})]}):null,n&&n.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-villagers`,children:n.villagers.map(u=>(0,r.jsx)(N5,{villager:u,portrait:Dt[u.characterId],selected:!1,onSelect:!u.place||Z!==null?void 0:()=>{let d=n.settings.venues.find(w=>w.id===u.place?.id);d&&Sf(d)}},u.characterId))}),(0,r.jsx)("div",{className:`${i}-roster`,children:n.villagers.map(u=>(0,r.jsxs)("div",{className:`${i}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-villager-name`,children:u.name}),u.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,Ge[u.characterId]?(0,r.jsx)("div",{className:`${i}-tile-summary`,children:Ge[u.characterId].changed?`New card: ${Ge[u.characterId].proposed?.name??"unavailable"}`:Ge[u.characterId].sourceAvailable?`Snapshot revision ${Ge[u.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>gt(Ce===u.characterId?null:u.characterId),children:Ce===u.characterId?"Close sprites":"Sprites"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{N0(u.characterId)},disabled:R||gr.length>0,children:"Compare card"}),Ge[u.characterId]?.changed&&Ge[u.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{$0(u.characterId)},disabled:R||gr.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{x0(u.characterId)},disabled:R||gr.length>0,children:"Move out"})]})]},u.characterId))}),n.villagers.find(u=>u.characterId===Ce)?(0,r.jsx)(S5,{villager:n.villagers.find(u=>u.characterId===Ce),onSaved:o}):null]}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):null,G==="noticeboard"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Noticeboard"})}),n.noticeboard.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.noticeboard.map((u,d)=>(0,r.jsxs)("li",{className:`${i}-notice-row`,children:[(0,r.jsxs)("span",{children:[u.author.length>0?(0,r.jsx)("span",{className:`${i}-notice-author`,children:`${u.author}: `}):null,u.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{t1(d)},disabled:R,"aria-label":`Take down: ${u.text}`,children:"\xD7"})]},`${d}:${u.text}`))}),(0,r.jsxs)("div",{className:`${i}-notice-add`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:Nr,maxLength:n.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:u=>ef(u.target.value),onKeyDown:u=>{u.key==="Enter"&&(u.preventDefault(),Hf())}}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Hf()},disabled:R||Nr.trim().length===0||n.noticeboard.length>=n.settings.maxNoticeboardNotes,children:`Pin it up (${n.noticeboard.length}/${n.settings.maxNoticeboardNotes})`})]})]}):null,G==="venueRequests"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villagers can ask for places in conversation or during village life. A place joins the village only when you approve it here. Taking down a notice does not change a request."}),n.venueRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.venueRequests.map(u=>{let d=H[u.id]??u.venueDraft,w=E=>ie($=>({...$,[u.id]:{...d,...E}}));return(0,r.jsx)("li",{className:`${i}-notice-row`,children:(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:u.requesterName||"A villager"}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${u.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.name,maxLength:n.settings.maxVenueNameLength,"aria-label":`Requested place name from ${u.requesterName||"villager"}`,onChange:E=>w({name:E.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.purpose,maxLength:n.settings.maxVenueNoteLength,"aria-label":`Requested place purpose from ${u.requesterName||"villager"}`,onChange:E=>w({purpose:E.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.category,maxLength:n.settings.maxVenueNoteLength,placeholder:"Category (optional)","aria-label":`Requested place category from ${u.requesterName||"villager"}`,onChange:E=>w({category:E.target.value})}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:d.description??"",maxLength:1e3,"aria-label":`Requested place description from ${u.requesterName||"villager"}`,onChange:E=>w({description:E.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!d.name.trim(),onClick:()=>{B(!0),Y(""),D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:u.id,name:d.name,purpose:d.purpose}]})}).then(E=>w({description:E.descriptions[u.id]??""})).catch(E=>Y(U(E,"The description draft could not be generated."))).finally(()=>B(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!d.name.trim()||!d.purpose.trim()||!d.description?.trim(),onClick:()=>{_f(u,!0)},children:"Approve"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{_f(u,!1)},children:"Deny"})]})]})},u.id)})}),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Home upgrade requests"}),n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No home upgrades requested."}):n.upgradeRequests.map(u=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:u.detail}),[!0,!1].map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{B(!0),Y(""),D(`/venue-upgrades/${encodeURIComponent(u.id)}/${d?"approve":"deny"}`,{method:"POST"}).then(o).catch(w=>Y(U(w,"The upgrade request could not be decided."))).finally(()=>B(!1))},children:d?"Approve upgrade":"Deny"},String(d)))]},u.id)),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Resident move requests"}),n.residences.filter(u=>u.status!=="current").length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No moves pending."}):n.residences.filter(u=>u.status!=="current").map(u=>{let d=ei(u.characterId),w=n.settings.venues.find(E=>E.id===u.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:`${d} \u2192 ${w}`}),u.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${i}-hint`,children:["Move due ",new Date(u.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{B(!0),Y(""),D("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:u.characterId})}).then(o).catch(E=>Y(U(E,"The move could not be completed."))).finally(()=>B(!1))},children:"DEBUG: Complete move now"})]}):u.requestedBy==="player"?(0,r.jsxs)("span",{className:`${i}-hint`,children:["Awaiting ",d,"'s answer in conversation."]}):[!0,!1].map(E=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{B(!0),Y(""),D(`/residences/${E?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:u.characterId})}).then(o).catch($=>Y(U($,"The move request could not be decided."))).finally(()=>B(!1))},children:E?"Approve move":"Deny"},String(E)))]},u.characterId)}),pt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:pt}):null]}):null,G==="homes"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Homes on the map"})}),(0,r.jsxs)("p",{className:`${i}-empty`,children:["Where everyone lives. Every house here is a ",zf,". A house nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||ce.length>=jr,onClick:()=>{Zt(!0),gc()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${ce.length} of at most ${jr}`})]}),ce.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(qw,{homes:ce,villagers:(n?.villagers??[]).map(u=>({id:u.characterId,name:u.name})),buildings:ol,disabled:R,selectedId:Wm,onPatch:yc,onRemove:wc,onSelect:Oi,showDescriptions:!0,onGenerateDescription:u=>{j0(u)},lockedIds:new Set(n.settings.venues.filter(u=>u.occupancy.residentCharacterId).map(u=>u.id))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Y0()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>ll(n.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${i}-hint`,children:r5(n.settings.venues,ce)?"No unsaved changes.":"Unsaved changes."})]})]}):null,G==="map"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(Hm,{src:Or,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:n.settings.venues.flatMap(u=>{let d=dr(u);if(!d)return[];let w=u.occupancy.residentCharacterId?ei(u.occupancy.residentCharacterId):u.occupancy.playerHome?Kn(n):"";return[{id:u.id,x:d.x,y:d.y,text:w?`${u.name||"Home"} \xB7 ${w}`:u.name,tone:fr(u)?Rm({isPlayerHome:u.occupancy.playerHome,occupant:u.occupancy.residentCharacterId}):"venue",onSelect:()=>Iu(u.id)}]}),placing:xr!==null,view:Wo,shape:hf,zoom:s0,onView:Rr?Po:void 0,onPlace:xr?(u,d)=>{let w=xr;B(!0),Y(""),D(`/locations/venue/${encodeURIComponent(w)}`,{method:"PUT",body:JSON.stringify({presentation:{x:u,y:d}})}).then(o).catch(E=>Y(U(E,"The venue could not be placed."))).finally(()=>{B(!1),Xu(null)})}:void 0}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Venue positions and residents"}),n.settings.venues.map(u=>{let d=u.occupancy.residentCharacterId?ei(u.occupancy.residentCharacterId):u.occupancy.playerHome?Kn(n):"",w=!!u.occupancy.residentCharacterId;return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":a0===u.id,onClick:()=>Iu(u.id),children:u.name||"Home"}),(0,r.jsx)("span",{className:`${i}-hint`,children:d?`Lives here: ${d}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${i}-hint`,children:dr(u)?"On map":"Not placed"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||w,onClick:()=>{Iu(u.id),Xu(u.id)},children:dr(u)?"Move pin":"Place pin"})]},u.id)}),xr?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Xu(null),children:"Cancel pin placement"}):null,pt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:pt}):null]}),Rr?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:_w.map(u=>(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Wo.fit===u.fit?"true":"false","aria-pressed":Wo.fit===u.fit,onClick:()=>Po({...Wo,fit:u.fit}),children:u.label},u.fit))}),(0,r.jsx)("p",{className:`${i}-hint`,children:_w.find(u=>u.fit===Wo.fit)?.help})]}):null,oc?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":oc.tone,children:oc.text}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:R,"aria-label":"Choose a town map picture",onChange:u=>{let d=u.target.files?.[0];u.target.value="",kf(d)}}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Af()},children:"Remove background image"}):null]}),Rr?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Cf()},children:ca?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:Yr,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>nc(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a conversation stands in when somebody is there. Open Edit Room to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:n.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),ya(n.settings.venues).length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${i}-places`,children:ya(n.settings.venues).map(u=>(0,r.jsxs)("li",{className:`${i}-place`,children:[u.presentation.image?(0,r.jsx)("img",{className:`${i}-place-thumb`,src:u.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${i}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${i}-place-body`,children:[(0,r.jsx)("span",{className:`${i}-place-name`,children:u.name}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{pc(u),ue(structuredClone(u))},children:"Edit room"})})]})]},u.id))})]})]}):null,G==="replyGuidance"?(0,r.jsx)(x5,{}):null,G==="story"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),c===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the village remembers\u2026"}):c.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):X$(c).map(u=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${i}-story-day`,children:u.label}),(0,r.jsx)("ul",{className:`${i}-story`,children:u.entries.map(d=>{let w=Q$(d),E=d.actors.map($=>$.name).join(", ");return(0,r.jsxs)("li",{className:`${i}-story-row`,children:[(0,r.jsxs)("span",{children:[w.length>0||d.scope==="private"||d.kind==="favour"?(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[w,d.scope==="private"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:` \xB7 private to ${E}`}):null,d.kind==="favour"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 a favour"}):null,d.kind==="tick"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,d.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:R,onClick:()=>{g0(d.id)},"aria-label":`Forget: ${d.text}`,children:"\xD7"})]},d.id)})})]},`${u.label}:${u.entries[0]?.id??""}`)),c&&c.length<g?(0,r.jsxs)("button",{type:"button",className:`${i}-button`,onClick:()=>{p0()},children:["Load more memories (",c.length," of ",g,")"]}):null]}):null,G==="chatlogs"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:_,onChange:u=>{q(u.target.value),V(0),T(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(n?.settings.venues??[]).map(u=>(0,r.jsx)("option",{value:u.id,children:u.name},u.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:ae,onChange:u=>{M(u.target.value),V(0),T(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(n?.villagers??[]).map(u=>(0,r.jsx)("option",{value:u.characterId,children:u.name},u.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||y===0,onClick:()=>{Nf()},children:"Delete all completed logs"}),he?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:he}):null,N===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading venue visits\u2026"}):N.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No completed visits match these filters."}):N.map(u=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[u.placeName," \xB7 ",qm(u.startedAt)]}),(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[u.participants.map(d=>d.name).join(", ")," \xB7 ",u.lineCount," lines",u.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",u.memoryPending?` \xB7 memory pending (${u.memoryProgress?.nextUnit??0}/${u.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{fc(u.id)},children:x?.id===u.id?"Refresh transcript":"Open transcript"}),u.memoryPending?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{y0(u.id)},children:"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Nf(u.id)},children:"Delete log"})]}),x?.id===u.id?(0,r.jsx)("ul",{className:`${i}-story`,children:x.lines.map((d,w)=>(0,r.jsx)("li",{className:`${i}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[d.name||Kn(n)," \xB7 ",qm(d.at)]}),hr(d.content,`venue-${u.id}-${w}-`),(0,r.jsxs)("span",{className:`${i}-story-meta`,children:["Heard by:"," ",d.heardBy?.map(E=>x.participants.find($=>$.characterId===E)?.name??E).join(", ")||"no one"]})]})},`${u.id}:${w}`))}):null]},u.id)),y>20?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S===0,onClick:()=>{V(Math.max(0,S-20)),T(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[S+1,"\u2013",Math.min(y,S+20)," of ",y]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:S+20>=y,onClick:()=>{V(S+20),T(null)},children:"Next"})]}):null]}):null,G==="agendas"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),st===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the villagers wish\u2026"}):st.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:st.map(u=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[u.name,u.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null]}),u.agenda===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):u.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:u.agenda.personalizationFailure?`Wish generation failed: ${u.agenda.personalizationFailure}`:u.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${i}-story`,children:u.agenda.wishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish}),d.tell.length>0?(0,r.jsx)("p",{className:`${i}-wish-tell`,children:`Shows as: ${d.tell}`}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`${d.intensity===1?"Faint":d.intensity===3?"Strong":"Present"} \xB7 ${J$(d.addedAt??"",d.expiresAt??"")}`})]},d.id))})]},u.characterId))})]}):null,G==="schedules"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),st===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Loading agendas\u2026"}):st.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${i}-agenda-list`,children:st.map(u=>(0,r.jsxs)("details",{className:`${i}-week`,children:[(0,r.jsx)("summary",{className:`${i}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${i}-week-head`,children:[u.name,u.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${i}-badge`,children:u.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,u.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${i}-badge`,children:"Personalization failed"}):null,u.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"Card missing"}):null,u.nativeSchedule?(0,r.jsx)("span",{className:`${i}-badge`,children:u.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,Om(u)?(0,r.jsx)("span",{className:`${i}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${i}-week-body`,children:[u.agenda?.routineSummary?(0,r.jsx)("p",{className:`${i}-story-meta`,children:u.agenda.routineSummary}):null,u.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${i}-empty`,children:u.agenda.personalizationFailure}):u.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${i}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${i}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:u.ingestSchedule,disabled:R,onChange:d=>{v0(u.characterId,d.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{b0(u.characterId)},children:"Regenerate agenda"})]}),u.nativeSchedule?(0,r.jsxs)("p",{className:`${i}-story-scope`,children:[u.ingestSchedule&&u.remapFailure?`Schedule translation failed: ${u.remapFailure.message}`:u.ingestSchedule&&u.agenda?.scheduleWeek?"Schedule guides today and future days.":u.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",Om(u)?" Earlier hours retain the previous plan.":""]}):Om(u)?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Earlier hours retain the previous plan."}):null,u.weekUnreadable?(0,r.jsx)("p",{className:`${i}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):u.nativeSchedule?null:(0,r.jsx)("p",{className:`${i}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${i}-agenda-days`,children:u.days.map(d=>{let w=d.isToday?u.agenda?.activeDay?.blocks??u.agenda?.week?.[d.weekday]??[]:(u.ingestSchedule?u.agenda?.scheduleWeek?.[d.weekday]:void 0)??u.agenda?.week?.[d.weekday]??[],E=u.nativeSchedule?.days[d.weekday]??[];return(0,r.jsxs)("details",{className:`${i}-agenda-day`,open:d.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[d.weekday," \xB7 ",d.dateLabel,d.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${i}-agenda-compare`,"data-comparison":u.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${d.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:w.map(($,L)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[kw($.startMinute),"\u2013",kw($.endMinute)]}),(0,r.jsx)("strong",{children:$.activity}),(0,r.jsx)("span",{children:$.venueId?Z$(n?.settings.venues??[],$.venueId):"Home"}),(0,r.jsx)("span",{children:$.reason}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:$.status==="idle"?"Available":$.status==="dnd"?"Busy":$.status==="offline"?"Offline":"Online"})]},`${$.startMinute}-${$.endMinute}-${L}`))})]}),u.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${d.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),E.length?(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:E.map(($,L)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:$.time}),(0,r.jsx)("strong",{children:$.activity}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:$.status||"No availability set"})]},`${$.time}-${L}`))}):(0,r.jsx)("p",{className:`${i}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${d.weekday}-${d.dateLabel}`)})})]})]},u.characterId))})]}):null,pt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:pt}):null]})]});if(Re==="setup"){let u=(l??[]).map(d=>({id:d.id,name:d.name}));return(0,r.jsxs)("div",{className:`${i}-root ${i}-home`,children:[(0,r.jsx)("div",{className:`${i}-mapbar`,children:(0,r.jsx)("span",{className:`${i}-mapbar-title`,children:Na.trim()||"A new village"})}),(0,r.jsxs)("div",{className:`${i}-home-body`,children:[(0,r.jsx)("div",{className:`${i}-side`,children:(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:n?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsx)("div",{className:`${i}-steps`,children:Sw.map((d,w)=>(0,r.jsx)("span",{className:`${i}-step`,"data-active":w===Me?"true":"false","data-done":w<Me?"true":"false",children:`${w+1}. ${d}`},d))}),Me===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${i}-setup-name`,className:`${i}-search`,type:"text",value:Na,maxLength:n?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:R,onChange:d=>tf(d.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Why is this village being founded?"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:I$.map(d=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${i}-founding-reason`,checked:Kt===d.value,disabled:R,onChange:()=>nf(d.value)}),d.label]},d.value))})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-founding-details`,children:["Founding details ",Kt==="something-else"?"(required)":"(optional)"]}),(0,r.jsx)("textarea",{id:`${i}-founding-details`,className:`${i}-textarea`,value:Xa,maxLength:n?.settings.foundingDetailsMaxLength??500,placeholder:"Who brought everyone together, and what are they hoping to build?",disabled:R,onChange:d=>of(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"This premise informs village stories without forcing repeated events."})]}),(0,r.jsx)(Hw,{idPrefix:"setup",personas:vr,draft:_t,onDraft:br,storedId:n?.settings.playerPersonaId??"",storedName:n?.settings.playerPersonaName??"",storedMissing:n?.settings.playerPersonaMissing??!1,disabled:R}),(0,r.jsx)(Uw,{books:Jm,error:Fm,selected:xa,onChange:d=>{Km(d),$r([])},disabled:R})]}):null,Me===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(Bw,{onSetupProblem:i0,onImageWarningChange:cf}),o0?(0,r.jsxs)("div",{className:`${i}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${i}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${i}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:X0,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:I0,children:"I understand, continue"})]})]}):null]}):null,Me===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setup-setting`,className:`${i}-textarea`,value:Pe,maxLength:n?.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:R||St,onChange:d=>{af(d.target.value),$r([])}}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required. Describe the village's setting, visual style, and narrative vibe."})]}),(0,r.jsxs)("div",{className:`${i}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":pe==="generate"?"true":"false","aria-pressed":pe==="generate",disabled:St,onClick:()=>Pn("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":pe==="upload"?"true":"false","aria-pressed":pe==="upload",disabled:St,onClick:()=>Pn("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":pe==="none"?"true":"false","aria-pressed":pe==="none",disabled:St,onClick:()=>Pn("none"),children:"No background image"}),n?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":pe==="existing"?"true":"false","aria-pressed":pe==="existing",disabled:St,onClick:()=>Pn("existing"),children:"Keep current map"}):null]}),pe==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map elements"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([d,w])=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:Er[d],disabled:St,onChange:E=>rf($=>({...$,[d]:E.target.checked}))}),w]},d))}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Unchecked elements are excluded, even if Setting and Theme mentions them. Structures may appear anywhere but must leave room for future locations."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-prompt`,className:`${i}-textarea`,value:gn,maxLength:1500,disabled:St,onChange:d=>Fu(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:St||Pe.trim().length===0||gn.trim().length===0,onClick:()=>{R0()},children:St?"Generating map\u2026":kr==="generate"?"Generate again":"Generate map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:St||gn===n?.settings.townMapLayoutPrompt,onClick:()=>Fu(n?.settings.townMapLayoutPrompt??""),children:"Restore default prompt"})]})]}):null,pe==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:St,"aria-label":"Choose a village map image",onChange:d=>{let w=d.target.files?.[0];d.target.value="",D0(w)}}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,pe==="none"?(0,r.jsx)("p",{className:`${i}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,Ko&&pe!=="none"&&kr===pe&&mf?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":Dm(Ko).tone,children:Dm(Ko).text}):null]}):null,Me===3?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("p",{className:`${i}-empty`,children:["Place one home for you, one to three homes for initial villagers, and the public center. Every home is a ",zf,"."]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Nothing has to be exact: a pin marks a building, not a doorstep."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Zt(!0),Mi(!1)},disabled:R||ce.length>=1+il,children:"Place a home"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Zt(!1),Mi(!0)},disabled:R,children:Jt?"Move public center":"Place public center"})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Xo([]),Oi(null)},disabled:R||ce.length===0,children:"Start the map over"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${ce.length}/${1+il} placed`})]}),ce.length>0?(0,r.jsx)(qw,{homes:ce,villagers:u,buildings:ol,disabled:R,selectedId:Wm,onPatch:yc,onRemove:wc,onSelect:Oi,lockedIds:new Set((n?.settings.venues??[]).filter(d=>d.occupancy.residentCharacterId).map(d=>d.id))}):null,(0,r.jsx)("p",{className:`${i}-empty`,children:"Give each villager home to someone. Everyone you name moves in when the village is founded, and their conversation starts here."}),l===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading your library\u2026"}):u.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Your character library is empty, so add characters there before founding this village."}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-center-name`,children:"Public venue name"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||!Pe.trim(),onClick:()=>{V0()},children:"Suggest three names from setting and lore"}),lf.length>0?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-hint`,children:"Choose a name for the public venue, or write your own."}),lf.map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Wu(d),Ri(w=>({...w,"setup-public-center":""})),fn(w=>w.filter(E=>E!=="setup-public-center"))},children:d},d))]}):null,(0,r.jsx)("input",{id:`${i}-setup-center-name`,className:`${i}-search`,type:"text",value:ua,maxLength:n?.settings.maxVenueNameLength,disabled:R,onChange:d=>{Wu(d.target.value),Ri(w=>({...w,"setup-public-center":""})),fn(w=>w.filter(E=>E!=="setup-public-center"))}}),(0,r.jsx)("span",{className:`${i}-hint`,children:Jt?"The public center is placed on the map. Choose Move public center to place it again.":"Place the named public center on the map."})]})]}):null,Me===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Review the homes and public venue, then approve their descriptions before founding."}),(0,r.jsx)("p",{className:`${i}-hint`,children:`${Na.trim()||"Unnamed village"}, ${ce.length} homes, ${ce.filter(d=>!d.isPlayerHome&&d.characterId!==null).length} initial villagers, and ${ua.trim()||"an unnamed"} public center`}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Home tier names"}),["small-home","medium-home","large-home","huge-home"].map(d=>(0,r.jsxs)("label",{className:`${i}-label`,children:[d.replace("-"," "),(0,r.jsx)("input",{className:`${i}-notice-input`,value:Zo[d]??"",maxLength:60,onChange:w=>{Tr(E=>({...E,[d]:w.target.value})),fn([])}})]},d))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||Yi.some(d=>!d.name.trim()),onClick:()=>{Q0()},children:"Generate public venue description draft"}),Yi.map(d=>(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:[d.name||"Unnamed venue"," description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:Fn[d.id]??"",maxLength:1e3,onChange:w=>{Ri(E=>({...E,[d.id]:w.target.value})),fn(E=>E.filter($=>$!==d.id))}})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!Fn[d.id]?.trim()||Sr.includes(d.id),onClick:()=>fn(w=>[...w,d.id]),children:Sr.includes(d.id)?"Approved":"Approve description"})]},d.id))]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[Me>0?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||St,onClick:()=>Rf(Me-1),children:"Back"}):null,Me<Sw.length-1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||St,onClick:()=>Rf(Me+1),children:"Next"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R||St||!n,onClick:()=>{Z0()},children:n?.isFounded?"Save this village":"Found the village"}),n?.isFounded?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-spacer`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:R,onClick:()=>{Zt(!1),K("home")},children:"Show me the village"})]}):null]}),df?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:df}):null,pt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:pt}):null]})}),(0,r.jsx)("div",{className:`${i}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${i}-setup-map-viewport`,children:(0,r.jsx)(Hm,{src:Wn,alt:`A map of ${Na.trim()||"your new village"}.`,pins:Me<3?[]:n1,placing:Me===3&&(Qo||ju),view:pe==="existing"?Di:Bu("cover"),shape:mf,onPlace:Me===3?B0:void 0,compact:Me<2,mobile:t&&Me>=2})})})]})]})}return(0,r.jsxs)("div",{className:`${i}-root ${i}-home ${i}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-home-bar`,children:[(0,r.jsx)(m5,{weather:n?.village.weather??""}),!t&&n?.isFounded&&ya(n.settings.venues).length>0?(0,r.jsxs)("div",{className:`${i}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":ne,"aria-controls":`${i}-places-list`,disabled:R,onClick:()=>{Ne(null),Ue(u=>!u)},children:"Places"}),ne?(0,r.jsx)("div",{id:`${i}-places-list`,className:`${i}-places-list`,children:ya(n.settings.venues).map(u=>(0,r.jsxs)("div",{className:`${i}-places-list-row`,children:[(0,r.jsx)("span",{className:`${i}-places-list-name`,children:u.name}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>pc(u,!0),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Gr(u)},children:"Visit"})]},u.id))}):null]}):null,(0,r.jsxs)("span",{className:`${i}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-mobile-board-button`,"aria-label":`Noticeboard (${n?.noticeboard.length??0})`,disabled:!n||R,onClick:()=>We("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),n?.isFounded?(0,r.jsx)(p5,{happenings:n.happenings,recap:n.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:R||!n,onClick:()=>{C("index"),K("menu")},children:"\u2630"}),t?null:(0,r.jsx)(g5,{}),Qo?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Zt(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${i}-room`,children:(0,r.jsx)("div",{className:`${i}-home-map-viewport`,children:(0,r.jsx)(Hm,{src:Or,alt:`A map of ${n?.village.name??"the village"}.`,pins:a1,placing:Qo,view:Di,shape:hf,onPlace:G0,onDismiss:()=>{Ne(null),Ue(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:el||pt||Qo||qr||uc?(0,r.jsxs)("div",{className:`${i}-notice`,children:[el?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:el}):null,pt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:pt}):null,Qo?(0,r.jsx)("span",{className:`${i}-status`,children:"Click the map where the house stands."}):null,qr?(0,r.jsxs)("span",{className:`${i}-status`,children:["Catching up on what ",n?.village.name??"the village"," has been doing\u2026"]}):null,uc?(0,r.jsx)("p",{className:`${i}-status`,children:uc}):null]}):null})})})]})}var Bm=class extends HTMLElement{connectedCallback(){Cw(),this.__root??(this.__root=(0,jw.createRoot)(this)),this.__root.render((0,r.jsx)(Lm,{element:this,children:(0,r.jsx)(C5,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),Cw()})}};function C5({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let n=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",n),()=>e.removeEventListener("marinara-capability-props",n)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(O5,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(M5,{props:e.capabilityProps??{}}):(0,r.jsx)(k5,{element:e})}function A5(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var z5="marinara-active-chat-id";function Pw(){try{window.localStorage.removeItem(z5)}catch{}window.location.reload()}function Ww(e,t){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(l(!1),n(null),!t)return;let s=new AbortController;return(async()=>{try{let c=await D(`/spinoffs/${encodeURIComponent(e)}`,{signal:s.signal});if(s.signal.aborted)return;n(c??null),l(!0)}catch{}})(),()=>s.abort()},[e,t]),{origin:a,known:o}}function M5({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",n=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:l,known:s}=Ww(t,a&&t.length>0),[c,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!c)return;let y=S=>{g.current?.contains(S.target)||h(!1)},A=S=>{S.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",y),document.addEventListener("keydown",A),()=>{document.removeEventListener("pointerdown",y),document.removeEventListener("keydown",A)}},[c]),!a||!s||l===null)return null;let v=l.name||"your villager",N=l.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${N}`;return(0,r.jsxs)("span",{className:`${i}-tracker`,"data-compact":n,"data-open":c,ref:g,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${i}-tracker-chip`:`${i}-button ${i}-tracker-chip`,onClick:()=>h(y=>!y),"aria-haspopup":"menu","aria-expanded":c,title:f,"aria-label":f,children:[(0,r.jsx)(A5,{}),(0,r.jsx)("span",{className:`${i}-tracker-label`,children:"Villages"})]}),c?(0,r.jsxs)("div",{className:`${i}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${N}`,children:[(0,r.jsxs)("p",{className:`${i}-tracker-menu-title`,children:["This roleplay spun off from ",N]}),l.resident?(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[v," still lives there. ",N," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[v," does not live in ",N," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${i}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Pw,title:`Leaves this chat and opens Marinara's home screen, where the ${N} tab is waiting.`,children:"Open the village"})})]}):null]})}function O5({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:n,known:o}=Ww(t,a&&t.length>0);if(!a||!o)return null;if(n===null)return(0,r.jsx)("div",{className:`${i}-panel-view`,children:(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let l=n.name||"this villager",s=n.villageName||"your village";return(0,r.jsxs)("div",{className:`${i}-panel-view`,children:[(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:n.resident?`This roleplay spun off from ${s}, and ${s} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${s}, and ${l} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:l})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:n.room})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:s})]}),(0,r.jsx)("div",{className:`${i}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Pw,title:`Leaves this chat and opens Marinara's home screen, where the ${s} tab is waiting.`,children:"Open the village"})})]})}customElements.get(i)||customElements.define(i,Bm);
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
