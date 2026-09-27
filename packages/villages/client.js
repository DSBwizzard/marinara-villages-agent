var t$=Object.create;var Zc=Object.defineProperty;var a$=Object.getOwnPropertyDescriptor;var n$=Object.getOwnPropertyNames;var i$=Object.getPrototypeOf,o$=Object.prototype.hasOwnProperty;var l$=(e,t,a)=>t in e?Zc(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var Qa=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var r$=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of n$(t))!o$.call(e,o)&&o!==a&&Zc(e,o,{get:()=>t[o],enumerable:!(n=a$(t,o))||n.enumerable});return e};var vs=(e,t,a)=>(a=e!=null?t$(i$(e)):{},r$(t||!e||!e.__esModule?Zc(a,"default",{value:e,enumerable:!0}):a,e));var bg=(e,t,a)=>l$(e,typeof t!="symbol"?t+"":t,a);var zg=Qa(ee=>{"use strict";var Fc=Symbol.for("react.transitional.element"),s$=Symbol.for("react.portal"),u$=Symbol.for("react.fragment"),c$=Symbol.for("react.strict_mode"),d$=Symbol.for("react.profiler"),h$=Symbol.for("react.consumer"),m$=Symbol.for("react.context"),p$=Symbol.for("react.forward_ref"),g$=Symbol.for("react.suspense"),f$=Symbol.for("react.memo"),xg=Symbol.for("react.lazy"),b$=Symbol.for("react.activity"),v$=Symbol.for("react.view_transition"),vg=Symbol.iterator;function y$(e){return e===null||typeof e!="object"?null:(e=vg&&e[vg]||e["@@iterator"],typeof e=="function"?e:null)}var Ng={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Sg=Object.assign,Tg={};function vo(e,t,a){this.props=e,this.context=t,this.refs=Tg,this.updater=a||Ng}vo.prototype.isReactComponent={};vo.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};vo.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Eg(){}Eg.prototype=vo.prototype;function Pc(e,t,a){this.props=e,this.context=t,this.refs=Tg,this.updater=a||Ng}var Wc=Pc.prototype=new Eg;Wc.constructor=Pc;Sg(Wc,vo.prototype);Wc.isPureReactComponent=!0;var yg=Array.isArray;function Jc(){}var ze={H:null,A:null,T:null,S:null},kg=Object.prototype.hasOwnProperty;function ed(e,t,a){var n=a.ref;return{$$typeof:Fc,type:e,key:t,ref:n!==void 0?n:null,props:a}}function w$(e,t){return ed(e.type,t,e.props)}function td(e){return typeof e=="object"&&e!==null&&e.$$typeof===Fc}function $$(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var wg=/\/+/g;function Kc(e,t){return typeof e=="object"&&e!==null&&e.key!=null?$$(""+e.key):t.toString(36)}function x$(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Jc,Jc):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function bo(e,t,a,n,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var u=!1;if(e===null)u=!0;else switch(l){case"bigint":case"string":case"number":u=!0;break;case"object":switch(e.$$typeof){case Fc:case s$:u=!0;break;case xg:return u=e._init,bo(u(e._payload),t,a,n,o)}}if(u)return o=o(e),u=n===""?"."+Kc(e,0):n,yg(o)?(a="",u!=null&&(a=u.replace(wg,"$&/")+"/"),bo(o,t,a,"",function(g){return g})):o!=null&&(td(o)&&(o=w$(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(wg,"$&/")+"/")+u)),t.push(o)),1;u=0;var c=n===""?".":n+":";if(yg(e))for(var h=0;h<e.length;h++)n=e[h],l=c+Kc(n,h),u+=bo(n,t,a,l,o);else if(h=y$(e),typeof h=="function")for(e=h.call(e),h=0;!(n=e.next()).done;)n=n.value,l=c+Kc(n,h++),u+=bo(n,t,a,l,o);else if(l==="object"){if(typeof e.then=="function")return bo(x$(e),t,a,n,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return u}function ys(e,t,a){if(e==null)return e;var n=[],o=0;return bo(e,n,"","",function(l){return t.call(a,l,o++)}),n}function N$(e){if(e._status===-1){var t=e._result,a=t();a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n,a.status===void 0&&(a.status="fulfilled",a.value=n))},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n,a.status===void 0&&(a.status="rejected",a.reason=n))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var $g=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Cg(e){var t=ze.T,a={};a.types=t!==null?t.types:null,ze.T=a;try{var n=e(),o=ze.S;o!==null&&o(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(Jc,$g)}catch(l){$g(l)}finally{t!==null&&a.types!==null&&(t.types=a.types),ze.T=t}}function Ag(e){var t=ze.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else Cg(Ag.bind(null,e))}var S$={map:ys,forEach:function(e,t,a){ys(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return ys(e,function(){t++}),t},toArray:function(e){return ys(e,function(t){return t})||[]},only:function(e){if(!td(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};ee.Activity=b$;ee.Children=S$;ee.Component=vo;ee.Fragment=u$;ee.Profiler=d$;ee.PureComponent=Pc;ee.StrictMode=c$;ee.Suspense=g$;ee.ViewTransition=v$;ee.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ze;ee.__COMPILER_RUNTIME={__proto__:null,c:function(e){return ze.H.useMemoCache(e)}};ee.addTransitionType=Ag;ee.cache=function(e){return function(){return e.apply(null,arguments)}};ee.cacheSignal=function(){return null};ee.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var n=Sg({},e.props),o=e.key;if(t!=null)for(l in t.key!==void 0&&(o=""+t.key),t)!kg.call(t,l)||l==="key"||l==="__self"||l==="__source"||l==="ref"&&t.ref===void 0||(n[l]=t[l]);var l=arguments.length-2;if(l===1)n.children=a;else if(1<l){for(var u=Array(l),c=0;c<l;c++)u[c]=arguments[c+2];n.children=u}return ed(e.type,o,n)};ee.createContext=function(e){return e={$$typeof:m$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:h$,_context:e},e};ee.createElement=function(e,t,a){var n,o={},l=null;if(t!=null)for(n in t.key!==void 0&&(l=""+t.key),t)kg.call(t,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(o[n]=t[n]);var u=arguments.length-2;if(u===1)o.children=a;else if(1<u){for(var c=Array(u),h=0;h<u;h++)c[h]=arguments[h+2];o.children=c}if(e&&e.defaultProps)for(n in u=e.defaultProps,u)o[n]===void 0&&(o[n]=u[n]);return ed(e,l,o)};ee.createRef=function(){return{current:null}};ee.forwardRef=function(e){return{$$typeof:p$,render:e}};ee.isValidElement=td;ee.lazy=function(e){return{$$typeof:xg,_payload:{_status:-1,_result:e},_init:N$}};ee.memo=function(e,t){return{$$typeof:f$,type:e,compare:t===void 0?null:t}};ee.startTransition=Cg;ee.unstable_useCacheRefresh=function(){return ze.H.useCacheRefresh()};ee.use=function(e){return ze.H.use(e)};ee.useActionState=function(e,t,a){return ze.H.useActionState(e,t,a)};ee.useCallback=function(e,t){return ze.H.useCallback(e,t)};ee.useContext=function(e){return ze.H.useContext(e)};ee.useDebugValue=function(){};ee.useDeferredValue=function(e,t){return ze.H.useDeferredValue(e,t)};ee.useEffect=function(e,t){return ze.H.useEffect(e,t)};ee.useEffectEvent=function(e){return ze.H.useEffectEvent(e)};ee.useId=function(){return ze.H.useId()};ee.useImperativeHandle=function(e,t,a){return ze.H.useImperativeHandle(e,t,a)};ee.useInsertionEffect=function(e,t){return ze.H.useInsertionEffect(e,t)};ee.useLayoutEffect=function(e,t){return ze.H.useLayoutEffect(e,t)};ee.useMemo=function(e,t){return ze.H.useMemo(e,t)};ee.useOptimistic=function(e,t){return ze.H.useOptimistic(e,t)};ee.useReducer=function(e,t,a){return ze.H.useReducer(e,t,a)};ee.useRef=function(e){return ze.H.useRef(e)};ee.useState=function(e){return ze.H.useState(e)};ee.useSyncExternalStore=function(e,t,a){return ze.H.useSyncExternalStore(e,t,a)};ee.useTransition=function(){return ze.H.useTransition()};ee.version="19.3.0"});var ws=Qa((DS,Mg)=>{"use strict";Mg.exports=zg()});var Ig=Qa(He=>{"use strict";function od(e,t){var a=e.length;e.push(t);e:for(;0<a;){var n=a-1>>>1,o=e[n];if(0<$s(o,t))e[n]=t,e[a]=o,a=n;else break e}}function Za(e){return e.length===0?null:e[0]}function Ns(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var n=0,o=e.length,l=o>>>1;n<l;){var u=2*(n+1)-1,c=e[u],h=u+1,g=e[h];if(0>$s(c,a))h<o&&0>$s(g,c)?(e[n]=g,e[h]=a,n=h):(e[n]=c,e[u]=a,n=u);else if(h<o&&0>$s(g,a))e[n]=g,e[h]=a,n=h;else break e}}return t}function $s(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}He.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(Og=performance,He.unstable_now=function(){return Og.now()}):(ad=Date,Rg=ad.now(),He.unstable_now=function(){return ad.now()-Rg});var Og,ad,Rg,hn=[],Vn=[],T$=1,ya=null,Ct=3,ld=!1,Hl=!1,Ul=!1,rd=!1,_g=typeof setTimeout=="function"?setTimeout:null,Hg=typeof clearTimeout=="function"?clearTimeout:null,Vg=typeof setImmediate<"u"?setImmediate:null;function xs(e){for(var t=Za(Vn);t!==null;){if(t.callback===null)Ns(Vn);else if(t.startTime<=e)Ns(Vn),t.sortIndex=t.expirationTime,od(hn,t);else break;t=Za(Vn)}}function sd(e){if(Ul=!1,xs(e),!Hl)if(Za(hn)!==null)Hl=!0,wo||(wo=!0,yo());else{var t=Za(Vn);t!==null&&ud(sd,t.startTime-e)}}var wo=!1,ql=-1,Ug=5,qg=-1;function Bg(){return rd?!0:!(He.unstable_now()-qg<Ug)}function nd(){if(rd=!1,wo){var e=He.unstable_now();qg=e;var t=!0;try{e:{Hl=!1,Ul&&(Ul=!1,Hg(ql),ql=-1),ld=!0;var a=Ct;try{t:{for(xs(e),ya=Za(hn);ya!==null&&!(ya.expirationTime>e&&Bg());){var n=ya.callback;if(typeof n=="function"){ya.callback=null,Ct=ya.priorityLevel;var o=n(ya.expirationTime<=e);if(e=He.unstable_now(),typeof o=="function"){ya.callback=o,xs(e),t=!0;break t}ya===Za(hn)&&Ns(hn),xs(e)}else Ns(hn);ya=Za(hn)}if(ya!==null)t=!0;else{var l=Za(Vn);l!==null&&ud(sd,l.startTime-e),t=!1}}break e}finally{ya=null,Ct=a,ld=!1}t=void 0}}finally{t?yo():wo=!1}}}var yo;typeof Vg=="function"?yo=function(){Vg(nd)}:typeof MessageChannel<"u"?(id=new MessageChannel,Dg=id.port2,id.port1.onmessage=nd,yo=function(){Dg.postMessage(null)}):yo=function(){_g(nd,0)};var id,Dg;function ud(e,t){ql=_g(function(){e(He.unstable_now())},t)}He.unstable_IdlePriority=5;He.unstable_ImmediatePriority=1;He.unstable_LowPriority=4;He.unstable_NormalPriority=3;He.unstable_Profiling=null;He.unstable_UserBlockingPriority=2;He.unstable_cancelCallback=function(e){e.callback=null};He.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Ug=0<e?Math.floor(1e3/e):5};He.unstable_getCurrentPriorityLevel=function(){return Ct};He.unstable_next=function(e){switch(Ct){case 1:case 2:case 3:var t=3;break;default:t=Ct}var a=Ct;Ct=t;try{return e()}finally{Ct=a}};He.unstable_requestPaint=function(){rd=!0};He.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=Ct;Ct=e;try{return t()}finally{Ct=a}};He.unstable_scheduleCallback=function(e,t,a){var n=He.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:T$++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>n?(e.sortIndex=a,od(Vn,e),Za(hn)===null&&e===Za(Vn)&&(Ul?(Hg(ql),ql=-1):Ul=!0,ud(sd,a-n))):(e.sortIndex=o,od(hn,e),Hl||ld||(Hl=!0,wo||(wo=!0,yo()))),e};He.unstable_shouldYield=Bg;He.unstable_wrapCallback=function(e){var t=Ct;return function(){var a=Ct;Ct=t;try{return e.apply(this,arguments)}finally{Ct=a}}}});var Gg=Qa((HS,Lg)=>{"use strict";Lg.exports=Ig()});var Xg=Qa(At=>{"use strict";var E$=ws();function jg(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Dn(){}var _t={d:{f:Dn,r:function(){throw Error(jg(522))},D:Dn,C:Dn,L:Dn,m:Dn,X:Dn,S:Dn,M:Dn},p:0,findDOMNode:null},k$=Symbol.for("react.portal"),C$=Symbol.for("react.recoverable"),Yg=Symbol.for("react.optimistic_key");function A$(e,t,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:k$,key:n==null?null:n===Yg?Yg:""+n,children:e,containerInfo:t,implementation:a}}var Bl=E$.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Ss(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}At.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=_t;At.browser=function(e){return{$$typeof:C$,_reason:e}};At.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(jg(299));return A$(e,t,null,a)};At.flushSync=function(e){var t=Bl.T,a=_t.p;try{if(Bl.T=null,_t.p=2,e)return e()}finally{Bl.T=t,_t.p=a,_t.d.f()}};At.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,_t.d.C(e,t))};At.prefetchDNS=function(e){typeof e=="string"&&_t.d.D(e)};At.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,n=Ss(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,l=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?_t.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:n,integrity:o,fetchPriority:l}):a==="script"&&_t.d.X(e,{crossOrigin:n,integrity:o,fetchPriority:l,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};At.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=Ss(t.as,t.crossOrigin);_t.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&_t.d.M(e)};At.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,n=Ss(a,t.crossOrigin);_t.d.L(e,a,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};At.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=Ss(t.as,t.crossOrigin);_t.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else _t.d.m(e)};At.requestFormReset=function(e){_t.d.r(e)};At.unstable_batchedUpdates=function(e,t){return e(t)};At.useFormState=function(e,t,a){return Bl.H.useFormState(e,t,a)};At.useFormStatus=function(){return Bl.H.useHostTransitionStatus()};At.version="19.3.0"});var Kg=Qa((qS,Zg)=>{"use strict";function Qg(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Qg)}catch(e){console.error(e)}}Qg(),Zg.exports=Xg()});var _w=Qa(oc=>{"use strict";var ot=Gg(),Db=ws(),z$=Kg();function C(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function _b(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function kr(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function Hb(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Ub(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Jg(e){if(kr(e)!==e)throw Error(C(188))}function M$(e){var t=e.alternate;if(!t){if(t=kr(e),t===null)throw Error(C(188));return t!==e?null:e}for(var a=e,n=t;;){var o=a.return;if(o===null)break;var l=o.alternate;if(l===null){if(n=o.return,n!==null){a=n;continue}break}if(o.child===l.child){for(l=o.child;l;){if(l===a)return Jg(o),e;if(l===n)return Jg(o),t;l=l.sibling}throw Error(C(188))}if(a.return!==n.return)a=o,n=l;else{for(var u=!1,c=o.child;c;){if(c===a){u=!0,a=o,n=l;break}if(c===n){u=!0,n=o,a=l;break}c=c.sibling}if(!u){for(c=l.child;c;){if(c===a){u=!0,a=l,n=o;break}if(c===n){u=!0,n=l,a=o;break}c=c.sibling}if(!u)throw Error(C(189))}}if(a.alternate!==n)throw Error(C(190))}if(a.tag!==3)throw Error(C(188));return a.stateNode.current===a?e:t}function qb(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=qb(e),t!==null)return t;e=e.sibling}return null}function Jt(e,t,a,n,o,l){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,n,o,l)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Jt(e.child,t,a,n,o,l))return!0;e=e.sibling}return!1}function qi(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Fg(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function Bb(e){var t=[null,null],a=qi(e);return a===null||Ib(t,e,a.child,{foundSelf:!1}),t}function Ib(e,t,a,n){for(;a!==null;){if(a===t)n.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(n.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&Ib(e,t,a.child,n))return!0;a=a.sibling}return!1}function it(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(C(559))}}var ko=null,Id=null;function O$(e,t,a){return e===a?!0:e===t?(ko=e,!0):!1}function R$(e,t,a){return e===a?(Id=e,!1):e===t?(Id!==null&&(ko=e),!0):!1}function Pg(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function Ld(e,t,a){for(var n=0,o=e;o;o=a(o))n++;o=0;for(var l=t;l;l=a(l))o++;for(;0<n-o;)e=a(e),n--;for(;0<o-n;)t=a(t),o--;for(;n--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var Ae=Object.assign,V$=Symbol.for("react.element"),Ts=Symbol.for("react.transitional.element"),Ql=Symbol.for("react.portal"),Co=Symbol.for("react.fragment"),Lb=Symbol.for("react.strict_mode"),Gd=Symbol.for("react.profiler"),Gb=Symbol.for("react.consumer"),en=Symbol.for("react.context"),Ph=Symbol.for("react.forward_ref"),Yd=Symbol.for("react.suspense"),jd=Symbol.for("react.suspense_list"),Wh=Symbol.for("react.memo"),qn=Symbol.for("react.lazy"),Xd=Symbol.for("react.activity"),D$=Symbol.for("react.legacy_hidden"),_$=Symbol.for("react.memo_cache_sentinel"),Qd=Symbol.for("react.view_transition"),H$=Symbol.for("react.recoverable"),Wg=Symbol.iterator;function Il(e){return e===null||typeof e!="object"?null:(e=Wg&&e[Wg]||e["@@iterator"],typeof e=="function"?e:null)}var U$=Symbol.for("react.client.reference");function Zd(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===U$?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Co:return"Fragment";case Gd:return"Profiler";case Lb:return"StrictMode";case Yd:return"Suspense";case jd:return"SuspenseList";case Xd:return"Activity";case Qd:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case Ql:return"Portal";case en:return e.displayName||"Context";case Gb:return(e._context.displayName||"Context")+".Consumer";case Ph:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Wh:return t=e.displayName||null,t!==null?t:Zd(e.type)||"Memo";case qn:t=e._payload,e=e._init;try{return Zd(e(t))}catch{}}return null}var Zl=Array.isArray,W=Db.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ve=z$.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ei={pending:!1,data:null,method:null,action:null},Kd=[],Ao=-1;function sn(e){return{current:e}}function $t(e){0>Ao||(e.current=Kd[Ao],Kd[Ao]=null,Ao--)}function Re(e,t){Ao++,Kd[Ao]=e.current,e.current=t}var on=sn(null),dr=sn(null),Zn=sn(null),du=sn(null);function hu(e,t){switch(Re(Zn,t),Re(dr,e),Re(on,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?pb(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=pb(t),e=dw(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}$t(on),Re(on,e)}function Ko(){$t(on),$t(dr),$t(Zn)}function Jd(e){var t=e.memoizedState;t!==null&&(ol._currentValue=t.memoizedState,Re(du,e)),t=on.current;var a=dw(t,e.type);t!==a&&(Re(dr,e),Re(on,a))}function mu(e){dr.current===e&&($t(on),$t(dr)),du.current===e&&($t(du),ol._currentValue=Ei)}var cd,ef;function Hn(e){if(cd===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);cd=t&&t[1]||"",ef=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+cd+e+ef}var dd=!1;function hd(e,t){if(!e||dd)return"";dd=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var x=function(){throw Error()};if(Object.defineProperty(x.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(x,[])}catch(z){var f=z}Reflect.construct(e,[],x)}else{try{x.call()}catch(z){f=z}x=!1;try{var v=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),x=!0,new e}finally{x&&(v!==void 0?Object.defineProperty(e.prototype,"props",v):delete e.prototype.props)}}}else{try{throw Error()}catch(z){f=z}(x=e())&&typeof x.catch=="function"&&x.catch(function(){})}}catch(z){if(z&&f&&typeof z.stack=="string")return[z.stack,f.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var l=n.DetermineComponentFrameRoot(),u=l[0],c=l[1];if(u&&c){var h=u.split(`
`),g=c.split(`
`);for(o=n=0;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;for(;o<g.length&&!g[o].includes("DetermineComponentFrameRoot");)o++;if(n===h.length||o===g.length)for(n=h.length-1,o=g.length-1;1<=n&&0<=o&&h[n]!==g[o];)o--;for(;1<=n&&0<=o;n--,o--)if(h[n]!==g[o]){if(n!==1||o!==1)do if(n--,o--,0>o||h[n]!==g[o]){var y=`
`+h[n].replace(" at new "," at ");return e.displayName&&y.includes("<anonymous>")&&(y=y.replace("<anonymous>",e.displayName)),y}while(1<=n&&0<=o);break}}}finally{dd=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Hn(a):""}function q$(e,t){switch(e.tag){case 26:case 27:case 5:return Hn(e.type);case 16:return Hn("Lazy");case 13:return e.child!==t&&t!==null?Hn("Suspense Fallback"):Hn("Suspense");case 19:return Hn("SuspenseList");case 0:case 15:return hd(e.type,!1);case 11:return hd(e.type.render,!1);case 1:return hd(e.type,!0);case 31:return Hn("Activity");case 30:return Hn("ViewTransition");default:return""}}function tf(e){try{var t="",a=null;do t+=q$(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var Fd=Object.prototype.hasOwnProperty,em=ot.unstable_scheduleCallback,md=ot.unstable_cancelCallback,B$=ot.unstable_shouldYield,I$=ot.unstable_requestPaint,ra=ot.unstable_now,L$=ot.unstable_getCurrentPriorityLevel,Yb=ot.unstable_ImmediatePriority,jb=ot.unstable_UserBlockingPriority,pu=ot.unstable_NormalPriority,G$=ot.unstable_LowPriority,Xb=ot.unstable_IdlePriority,Y$=ot.log,j$=ot.unstable_setDisableYieldValue,Cr=null,sa=null;function Ln(e){if(typeof Y$=="function"&&j$(e),sa&&typeof sa.setStrictMode=="function")try{sa.setStrictMode(Cr,e)}catch{}}var ua=Math.clz32?Math.clz32:Z$,X$=Math.log,Q$=Math.LN2;function Z$(e){return e>>>=0,e===0?32:31-(X$(e)/Q$|0)|0}var Es=256,ks=262144,Cs=4194304;function $i(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Bu(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var o=0,l=e.suspendedLanes,u=e.pingedLanes;e=e.warmLanes;var c=n&134217727;return c!==0?(n=c&~l,n!==0?o=$i(n):(u&=c,u!==0?o=$i(u):a||(a=c&~e,a!==0&&(o=$i(a))))):(c=n&~l,c!==0?o=$i(c):u!==0?o=$i(u):a||(a=n&~e,a!==0&&(o=$i(a)))),o===0?0:t!==0&&t!==o&&(t&l)===0&&(l=o&-o,a=t&-t,l>=a||l===32&&(a&4194048)!==0)?t:o}function Ar(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Qb(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-ua(a),o=1<<n;t|=e[n],a&=~o}return t}function K$(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Zb(){var e=Cs;return Cs<<=1,(Cs&62914560)===0&&(Cs=4194304),e}function pd(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function zr(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function J$(e,t,a,n,o,l){var u=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var c=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=u&~a;0<a;){var y=31-ua(a),x=1<<y;c[y]=0,h[y]=-1;var f=g[y];if(f!==null)for(g[y]=null,y=0;y<f.length;y++){var v=f[y];v!==null&&(v.lane&=-536870913)}a&=~x}n!==0&&Kb(e,n,0),l!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=l&~(u&~t))}function Kb(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-ua(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function Jb(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-ua(a),o=1<<n;o&t|e[n]&t&&(e[n]|=t),a&=~o}}function Fb(e,t){var a=t&-t;return a=(a&42)!==0?1:tm(a),(a&(e.suspendedLanes|t))!==0?0:a}function tm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function am(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Pb(){var e=ve.p;return e!==0?e:(e=window.event,e===void 0?32:Rw(e.type))}function af(e,t){var a=ve.p;try{return ve.p=e,t()}finally{ve.p=a}}var Tn=Math.random().toString(36).slice(2),yt="__reactFiber$"+Tn,Ft="__reactProps$"+Tn,sl="__reactContainer$"+Tn,nf="__reactEvents$"+Tn,F$="__reactListeners$"+Tn,P$="__reactHandles$"+Tn,of="__reactResources$"+Tn,Mr="__reactMarker$"+Tn,gu="__reactLoad$"+Tn;function Iu(e){delete e[yt],delete e[Ft],delete e[F$],delete e[P$]}function Si(e){var t;if(t=e[yt])return t;for(var a=e.parentNode;a;){if(t=a[sl]||a[yt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=xb(e);e!==null;){if(a=e[yt])return a;e=xb(e)}return t}e=a,a=e.parentNode}return null}function ul(e){if(e=e[yt]||e[sl]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Kl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(C(33))}function qo(e){var t=e[of];return t||(t=e[of]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function ht(e){e[Mr]=!0}function Wb(e){e[gu]=void 0}var ev=new Set,tv={};function Bi(e,t){Jo(e,t),Jo(e+"Capture",t)}function Jo(e,t){for(tv[e]=t,e=0;e<t.length;e++)ev.add(t[e])}var W$=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),lf={},rf={};function ex(e){return Fd.call(rf,e)?!0:Fd.call(lf,e)?!1:W$.test(e)?rf[e]=!0:(lf[e]=!0,!1)}var fe=!1;function sf(){var e=fe;return fe=!1,e}function Xs(e,t,a){if(ex(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function As(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function mn(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,n)}}function na(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function av(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function tx(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(u){a=""+u,l.call(this,u)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(u){a=""+u},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Pd(e){if(!e._valueTracker){var t=av(e)?"checked":"value";e._valueTracker=tx(e,t,""+e[t])}}function nv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=av(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}var ax=/[\n"\\]/g;function Sa(e){return e.replace(ax,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Wd(e,t,a,n,o,l,u,c){e.name="",u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?e.type=u:e.removeAttribute("type"),t!=null?u==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+na(t)):e.value!==""+na(t)&&(e.value=""+na(t)):u!=="submit"&&u!=="reset"||e.removeAttribute("value"),t!=null?u==="number"&&e.value==t?gd(e,na(e.value)):gd(e,na(t)):a!=null?gd(e,na(a)):n!=null&&e.removeAttribute("value"),o==null&&l!=null&&(e.defaultChecked=!!l),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.name=""+na(c):e.removeAttribute("name")}function iv(e,t,a,n,o,l,u,c){if(l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"&&(e.type=l),t!=null||a!=null){if(!(l!=="submit"&&l!=="reset"||t!=null)){Pd(e);return}a=a!=null?""+na(a):"",t=t!=null?""+na(t):a,c||t===e.value||(e.value=t),e.defaultValue=t}n=n??o,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=c?e.checked:!!n,e.defaultChecked=!!n,u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"&&(e.name=u),Pd(e)}function gd(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function Bo(e,t,a,n){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&n&&(e[a].defaultSelected=!0)}else{for(a=""+na(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,n&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function ov(e,t,a){if(t!=null&&(t=""+na(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+na(a):""}function lv(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(C(92));if(Zl(n)){if(1<n.length)throw Error(C(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=na(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),Pd(e)}function Fo(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var nx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function uf(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||nx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function rv(e,t,a){if(t!=null&&typeof t!="object")throw Error(C(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="",fe=!0);for(var o in t)n=t[o],t.hasOwnProperty(o)&&a[o]!==n&&(uf(e,o,n),fe=!0)}else for(var l in t)t.hasOwnProperty(l)&&uf(e,l,t[l])}function nm(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var ix=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),ox=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Qs(e){return ox.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function tn(){}var eh=null;function im(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var zo=null,Io=null;function cf(e){var t=ul(e);if(t&&(e=t.stateNode)){var a=e[Ft]||null;e:switch(e=t.stateNode,t.type){case"input":if(Wd(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Sa(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var o=n[Ft]||null;if(!o)throw Error(C(90));Wd(n,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&nv(n)}break e;case"textarea":ov(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&Bo(e,!!a.multiple,t,!1)}}}var fd=!1;function sv(e,t,a){if(fd)return e(t,a);fd=!0;try{var n=e(t);return n}finally{if(fd=!1,(zo!==null||Io!==null)&&(tc(),zo&&(t=zo,e=Io,Io=zo=null,cf(t),e)))for(t=0;t<e.length;t++)cf(e[t])}}function hr(e,t){var a=e.stateNode;if(a===null)return null;var n=a[Ft]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(C(231,t,typeof a));return a}var yn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),th=!1;if(yn)try{$o={},Object.defineProperty($o,"passive",{get:function(){th=!0}}),window.addEventListener("test",$o,$o),window.removeEventListener("test",$o,$o)}catch{th=!1}var $o,Gn=null,om=null,Zs=null;function uv(){if(Zs)return Zs;var e,t=om,a=t.length,n,o="value"in Gn?Gn.value:Gn.textContent,l=o.length;for(e=0;e<a&&t[e]===o[e];e++);var u=a-e;for(n=1;n<=u&&t[a-n]===o[l-n];n++);return Zs=o.slice(e,1<n?1-n:void 0)}function Ks(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function zs(){return!0}function df(){return!1}function Bt(e){function t(a,n,o,l,u){this._reactName=a,this._targetInst=o,this.type=n,this.nativeEvent=l,this.target=u,this.currentTarget=null;for(var c in e)e.hasOwnProperty(c)&&(a=e[c],this[c]=a?a(l):l[c]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?zs:df,this.isPropagationStopped=df,this}return Ae(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=zs)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=zs)},persist:function(){},isPersistent:zs}),t}var ui={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Lu=Bt(ui),Or=Ae({},ui,{view:0,detail:0}),lx=Bt(Or),bd,vd,Ll,Gu=Ae({},Or,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:lm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Ll&&(Ll&&e.type==="mousemove"?(bd=e.screenX-Ll.screenX,vd=e.screenY-Ll.screenY):vd=bd=0,Ll=e),bd)},movementY:function(e){return"movementY"in e?e.movementY:vd}}),hf=Bt(Gu),rx=Ae({},Gu,{dataTransfer:0}),sx=Bt(rx),ux=Ae({},Or,{relatedTarget:0}),yd=Bt(ux),cx=Ae({},ui,{animationName:0,elapsedTime:0,pseudoElement:0}),dx=Bt(cx),hx=Ae({},ui,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),mx=Bt(hx),px=Ae({},ui,{data:0}),mf=Bt(px),gx={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},fx={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},bx={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function vx(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=bx[e])?!!t[e]:!1}function lm(){return vx}var yx=Ae({},Or,{key:function(e){if(e.key){var t=gx[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Ks(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?fx[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:lm,charCode:function(e){return e.type==="keypress"?Ks(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Ks(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),wx=Bt(yx),$x=Ae({},Gu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),pf=Bt($x),xx=Ae({},ui,{submitter:0}),Nx=Bt(xx),Sx=Ae({},Or,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:lm}),Tx=Bt(Sx),Ex=Ae({},ui,{propertyName:0,elapsedTime:0,pseudoElement:0}),kx=Bt(Ex),Cx=Ae({},Gu,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Ax=Bt(Cx),zx=Ae({},ui,{newState:0,oldState:0,source:0}),Mx=Bt(zx),Ox=[9,13,27,32],rm=yn&&"CompositionEvent"in window,Pl=null;yn&&"documentMode"in document&&(Pl=document.documentMode);var Rx=yn&&"TextEvent"in window&&!Pl,cv=yn&&(!rm||Pl&&8<Pl&&11>=Pl),gf=" ",ff=!1;function dv(e,t){switch(e){case"keyup":return Ox.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function hv(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Mo=!1;function Vx(e,t){switch(e){case"compositionend":return hv(t);case"keypress":return t.which!==32?null:(ff=!0,gf);case"textInput":return e=t.data,e===gf&&ff?null:e;default:return null}}function Dx(e,t){if(Mo)return e==="compositionend"||!rm&&dv(e,t)?(e=uv(),Zs=om=Gn=null,Mo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return cv&&t.locale!=="ko"?null:t.data;default:return null}}var _x={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function bf(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!_x[e.type]:t==="textarea"}function mv(e,t,a,n){zo?Io?Io.push(n):Io=[n]:zo=n,t=Hu(t,"onChange"),0<t.length&&(a=new Lu("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var Wl=null,mr=null;function Hx(e){sw(e,0)}function Yu(e){var t=Kl(e);if(nv(t))return e}function vf(e,t){if(e==="change")return t}var pv=!1;yn&&(yn?(Os="oninput"in document,Os||(wd=document.createElement("div"),wd.setAttribute("oninput","return;"),Os=typeof wd.oninput=="function"),Ms=Os):Ms=!1,pv=Ms&&(!document.documentMode||9<document.documentMode));var Ms,Os,wd;function yf(){Wl&&(Wl.detachEvent("onpropertychange",gv),mr=Wl=null)}function gv(e){if(e.propertyName==="value"&&Yu(mr)){var t=[];mv(t,mr,e,im(e)),sv(Hx,t)}}function Ux(e,t,a){e==="focusin"?(yf(),Wl=t,mr=a,Wl.attachEvent("onpropertychange",gv)):e==="focusout"&&yf()}function qx(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Yu(mr)}function Bx(e,t){if(e==="click")return Yu(t)}function Ix(e,t){if(e==="input"||e==="change")return Yu(t)}function Lx(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var da=typeof Object.is=="function"?Object.is:Lx;function pr(e,t){if(da(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var o=a[n];if(!Fd.call(t,o)||!da(e[o],t[o]))return!1}return!0}function ah(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function wf(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function $f(e,t){var a=wf(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=wf(a)}}function fv(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?fv(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function bv(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=ah(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=ah(e.document)}return t}function sm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Gx=yn&&"documentMode"in document&&11>=document.documentMode,Oo=null,nh=null,er=null,ih=!1;function xf(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;ih||Oo==null||Oo!==ah(n)||(n=Oo,"selectionStart"in n&&sm(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),er&&pr(er,n)||(er=n,n=Hu(nh,"onSelect"),0<n.length&&(t=new Lu("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=Oo)))}function yi(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Ro={animationend:yi("Animation","AnimationEnd"),animationiteration:yi("Animation","AnimationIteration"),animationstart:yi("Animation","AnimationStart"),transitionrun:yi("Transition","TransitionRun"),transitionstart:yi("Transition","TransitionStart"),transitioncancel:yi("Transition","TransitionCancel"),transitionend:yi("Transition","TransitionEnd")},$d={},vv={};yn&&(vv=document.createElement("div").style,"AnimationEvent"in window||(delete Ro.animationend.animation,delete Ro.animationiteration.animation,delete Ro.animationstart.animation),"TransitionEvent"in window||delete Ro.transitionend.transition);function Ii(e){if($d[e])return $d[e];if(!Ro[e])return e;var t=Ro[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in vv)return $d[e]=t[a];return e}var yv=Ii("animationend"),wv=Ii("animationiteration"),$v=Ii("animationstart"),Yx=Ii("transitionrun"),jx=Ii("transitionstart"),Xx=Ii("transitioncancel"),xv=Ii("transitionend"),Nv=new Map,oh="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");oh.push("scrollEnd");function qa(e,t){Nv.set(e,t),Bi(t,[e])}var Qx=0;function wn(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Ua.identifierPrefix;var a=Qx++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function Nf(e){if(e==null||typeof e=="string")return e;var t=null,a=Zo;if(a!==null)for(var n=0;n<a.length;n++){var o=e[a[n]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function En(e,t){return e=Nf(e),t=Nf(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var fu=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},$a=[],Vo=0,um=0;function ju(){for(var e=Vo,t=um=Vo=0;t<e;){var a=$a[t];$a[t++]=null;var n=$a[t];$a[t++]=null;var o=$a[t];$a[t++]=null;var l=$a[t];if($a[t++]=null,n!==null&&o!==null){var u=n.pending;u===null?o.next=o:(o.next=u.next,u.next=o),n.pending=o}l!==0&&Sv(a,o,l)}}function Xu(e,t,a,n){$a[Vo++]=e,$a[Vo++]=t,$a[Vo++]=a,$a[Vo++]=n,um|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function cm(e,t,a,n){return Xu(e,t,a,n),bu(e)}function Li(e,t){return Xu(e,null,null,t),bu(e)}function Sv(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var o=!1,l=e.return;l!==null;)l.childLanes|=a,n=l.alternate,n!==null&&(n.childLanes|=a),l.tag===22&&(e=l.stateNode,e===null||e._visibility&1||(o=!0)),e=l,l=l.return;return e.tag===3?(l=e.stateNode,o&&t!==null&&(o=31-ua(a),e=l.hiddenUpdates,n=e[o],n===null?e[o]=[t]:n.push(t),t.lane=a|536870912),l):null}function bu(e){if(50<cr)throw cr=0,ou=null,Error(C(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Do={};function Zx(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Zt(e,t,a,n){return new Zx(e,t,a,n)}function dm(e){return e=e.prototype,!(!e||!e.isReactComponent)}function bn(e,t){var a=e.alternate;return a===null?(a=Zt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Tv(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Js(e,t,a,n,o,l){var u=0;if(n=e,typeof n=="function")dm(n)&&(u=1);else if(typeof n=="string")u=w5(e,a,on.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(n){case Xd:return e=Zt(31,a,t,o),e.elementType=Xd,e.lanes=l,e;case Co:return ki(a.children,o,l,t);case Lb:u=8,o|=24;break;case Gd:return e=Zt(12,a,t,o|2),e.elementType=Gd,e.lanes=l,e;case Yd:return e=Zt(13,a,t,o),e.elementType=Yd,e.lanes=l,e;case jd:return e=Zt(19,a,t,o),e.elementType=jd,e.lanes=l,e;case D$:case Qd:return e=o|32,e=Zt(30,a,t,e),e.elementType=Qd,e.lanes=l,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case en:u=10;break e;case Gb:u=9;break e;case Ph:u=11;break e;case Wh:u=14;break e;case qn:u=16,n=null;break e}u=29,a=Error(C(130,e===null?"null":typeof e,"")),n=null}return t=Zt(u,a,t,o),t.elementType=e,t.type=n,t.lanes=l,t}function ki(e,t,a,n){return e=Zt(7,e,n,t),e.lanes=a,e}function xd(e,t,a){return e=Zt(6,e,null,t),e.lanes=a,e}function Ev(e){var t=Zt(18,null,null,0);return t.stateNode=e,t}function Nd(e,t,a){return t=Zt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Sf=new WeakMap;function Ta(e,t){if(typeof e=="object"&&e!==null){var a=Sf.get(e);return a!==void 0?a:(t={value:e,source:t,stack:tf(t)},Sf.set(e,t),t)}return{value:e,source:t,stack:tf(t)}}var _o=[],Ho=0,vu=null,gr=0,xa=[],Na=0,ii=null,an=1,nn="";function gn(e,t){_o[Ho++]=gr,_o[Ho++]=vu,vu=e,gr=t}function kv(e,t,a){xa[Na++]=an,xa[Na++]=nn,xa[Na++]=ii,ii=e;var n=an;e=nn;var o=32-ua(n)-1;n&=~(1<<o),a+=1;var l=32-ua(t)+o;if(30<l){var u=o-o%5;l=(n&(1<<u)-1).toString(32),n>>=u,o-=u,an=1<<32-ua(t)+o|a<<o|n,nn=l+e}else an=1<<l|a<<o|n,nn=e}function Qu(e){e.return!==null&&(gn(e,1),kv(e,1,0))}function hm(e){for(;e===vu;)vu=_o[--Ho],_o[Ho]=null,gr=_o[--Ho],_o[Ho]=null;for(;e===ii;)ii=xa[--Na],xa[Na]=null,nn=xa[--Na],xa[Na]=null,an=xa[--Na],xa[Na]=null}function Cv(e,t){xa[Na++]=an,xa[Na++]=nn,xa[Na++]=ii,an=t.id,nn=t.overflow,ii=e}var mt=null,Oe=null,re=!1,Kn=null,Ea=!1,lh=Error(C(519));function oi(e){var t=Error(C(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw fr(Ta(t,e)),lh}function Tf(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[yt]=e,t[Ft]=n,a){case"dialog":ue("cancel",t),ue("close",t);break;case"iframe":case"object":case"embed":ue("load",t);break;case"video":case"audio":for(a=0;a<wr.length;a++)ue(wr[a],t);break;case"source":ue("error",t);break;case"img":case"image":case"link":ue("error",t),ue("load",t);break;case"details":ue("toggle",t);break;case"input":ue("invalid",t),iv(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":ue("invalid",t);break;case"textarea":ue("invalid",t),lv(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||cw(t.textContent,a)?(n.popover!=null&&(ue("beforetoggle",t),ue("toggle",t)),n.onScroll!=null&&ue("scroll",t),n.onScrollEnd!=null&&ue("scrollend",t),n.onClick!=null&&(t.onclick=tn),t=!0):t=!1,t||oi(e,!0)}function yu(e){for(mt=e.return;mt;)switch(mt.tag){case 5:case 31:case 13:Ea=!1;return;case 27:case 3:Ea=!0;return;default:mt=mt.return}}function xo(e){if(e!==mt)return!1;if(!re)return yu(e),re=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Yh(e.type,e.memoizedProps)),a=!a),a&&Oe&&oi(e),yu(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(C(317));Oe=$b(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(C(317));Oe=$b(e)}else t===27?(t=Oe,ci(e.type)?(e=Zh,Zh=null,Oe=e):Oe=t):Oe=mt?ka(e.stateNode.nextSibling):null;return!0}function Mi(){Oe=mt=null,re=!1}function Sd(){var e=Kn;return e!==null&&(Xt===null?Xt=e:Xt.push.apply(Xt,e),Kn=null),e}function fr(e){Kn===null?Kn=[e]:Kn.push(e)}var rh=sn(null),Gi=null,fn=null;function Yn(e,t,a){Re(rh,t._currentValue),t._currentValue=a}function vn(e){e._currentValue=rh.current,$t(rh)}function Fs(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function sh(e,t,a,n){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var l=o.dependencies;if(l!==null){var u=o.child;l=l.firstContext;e:for(;l!==null;){var c=l;l=o;for(var h=0;h<t.length;h++)if(c.context===t[h]){l.lanes|=a,c=l.alternate,c!==null&&(c.lanes|=a),Fs(l.return,a,e),n||(u=null);break e}l=c.next}}else if(o.tag===18){if(u=o.return,u===null)throw Error(C(341));u.lanes|=a,l=u.alternate,l!==null&&(l.lanes|=a),Fs(u,a,e),u=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,u=o.alternate,u!==null&&(u.lanes|=a),Fs(o.return,a,e),u=o.child,u=u!==null?u.sibling:null):u=o.child;if(u!==null)u.return=o;else for(u=o;u!==null;){if(u===e){u=null;break}if(o=u.sibling,o!==null){o.return=u.return,u=o;break}u=u.return}o=u}}function Oi(e,t,a,n){e=null;for(var o=t,l=!1;o!==null;){if(!l){if((o.flags&524288)!==0)l=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var u=o.alternate;if(u===null)throw Error(C(387));if(u=u.memoizedProps,u!==null){var c=o.type;da(o.pendingProps.value,u.value)||(e!==null?e.push(c):e=[c])}}else if(o===du.current){if(u=o.alternate,u===null)throw Error(C(387));u.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(ol):e=[ol])}o=o.return}return e!==null&&sh(t,e,a,n),t.flags|=262144,e!==null}function wu(e){for(e=e.firstContext;e!==null;){if(!da(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Ri(e){Gi=e,fn=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function wt(e){return Av(Gi,e)}function Rs(e,t){return Gi===null&&Ri(e),Av(e,t)}function Av(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},fn===null){if(e===null)throw Error(C(308));fn=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else fn=fn.next=t;return a}var Kx=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},Jx=ot.unstable_scheduleCallback,Fx=ot.unstable_NormalPriority,Pe={$$typeof:en,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function mm(){return{controller:new Kx,data:new Map,refCount:0}}function Rr(e){e.refCount--,e.refCount===0&&Jx(Fx,function(){e.controller.abort()})}function Ef(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var n=t[e];a.indexOf(n)===-1&&a.push(n)}}}var Jl=null;function Px(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var tr=null,uh=0,Vi=0,Lo=null;function Wx(e,t){if(tr===null){var a=tr=[];uh=0,Vi=Im(),Lo={status:"pending",value:void 0,then:function(n){a.push(n)}}}return uh++,t.then(kf,kf),t}function kf(){if(--uh===0&&(Jl=null,tr!==null)){Lo!==null&&(Lo.status="fulfilled");var e=tr;tr=null,Vi=0,Lo=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function eN(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(n.status="rejected",n.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),n}var Cf=W.S;W.S=function(e,t){if(Qy=ra(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&Wx(e,t),Jl!==null)for(var a=al;a!==null;)Ef(a,Jl),a=a.next;if(a=e.types,a!==null){for(var n=al;n!==null;)Ef(n,a),n=n.next;if(Vi!==0){n=Jl,n===null&&(n=Jl=[]);for(var o=0;o<a.length;o++){var l=a[o];n.indexOf(l)===-1&&n.push(l)}}}Cf!==null&&Cf(e,t)};var Ci=sn(null);function pm(){var e=Ci.current;return e!==null?e:Ce.pooledCache}function Ps(e,t){t===null?Re(Ci,Ci.current):Re(Ci,t.pool)}function zv(){var e=pm();return e===null?null:{parent:Pe._currentValue,pool:e}}var cl=Error(C(460)),gm=Error(C(474)),Zu=Error(C(542)),$u={then:function(){}};function Af(e){return e=e.status,e==="fulfilled"||e==="rejected"}function Mv(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(tn,tn),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Mf(e),e===void 0&&!("reason"in t)?Error(C(600)):e;default:if(typeof t.status=="string")t.then(tn,tn);else{if(e=Ce,e!==null&&100<e.shellSuspendCounter)throw Error(C(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=n}},function(n){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Mf(e),e}throw Ai=t,cl}}function xi(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Ai=a,cl):a}}var Ai=null;function zf(){if(Ai===null)throw Error(C(459));var e=Ai;return Ai=null,e}function Mf(e){if(e===cl||e===Zu)throw Error(C(483))}var Go=null,br=0;function Vs(e){var t=br;return br+=1,Go===null&&(Go=[]),Mv(Go,e,t)}function _n(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Ds(e,t){throw t.$$typeof===V$?Error(C(525)):(e=Object.prototype.toString.call(t),Error(C(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function Ov(e){function t(w,b){if(e){var N=w.deletions;N===null?(w.deletions=[b],w.flags|=16):N.push(b)}}function a(w,b){if(!e)return null;for(;b!==null;)t(w,b),b=b.sibling;return null}function n(w){for(var b=new Map;w!==null;)w.key===null?b.set(w.index,w):b.set(w.key,w),w=w.sibling;return b}function o(w,b){return w=bn(w,b),w.index=0,w.sibling=null,w}function l(w,b,N){return w.index=N,e?(N=w.alternate,N!==null?(N=N.index,N<b?(w.flags|=2,b):N):(w.flags|=134217730,b)):(w.flags|=1048576,b)}function u(w){return e&&w.alternate===null&&(w.flags|=134217730),w}function c(w,b,N,E){return b===null||b.tag!==6?(b=xd(N,w.mode,E),b.return=w,b):(b=o(b,N),b.return=w,b)}function h(w,b,N,E){var R=N.type;return R===Co?(w=y(w,b,N.props.children,E,N.key),_n(w,N),w):b!==null&&(b.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===qn&&xi(R)===b.type)?(b=o(b,N.props),_n(b,N),b.return=w,b):(b=Js(N.type,N.key,N.props,null,w.mode,E),_n(b,N),b.return=w,b)}function g(w,b,N,E){return b===null||b.tag!==4||b.stateNode.containerInfo!==N.containerInfo||b.stateNode.implementation!==N.implementation?(b=Nd(N,w.mode,E),b.return=w,b):(b=o(b,N.children||[]),b.return=w,b)}function y(w,b,N,E,R){return b===null||b.tag!==7?(b=ki(N,w.mode,E,R),b.return=w,b):(b=o(b,N),b.return=w,b)}function x(w,b,N){if(typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint")return b=xd(""+b,w.mode,N),b.return=w,b;if(typeof b=="object"&&b!==null){switch(b.$$typeof){case Ts:return N=Js(b.type,b.key,b.props,null,w.mode,N),_n(N,b),N.return=w,N;case Ql:return b=Nd(b,w.mode,N),b.return=w,b;case qn:return b=xi(b),x(w,b,N)}if(Zl(b)||Il(b))return b=ki(b,w.mode,N,null),b.return=w,b;if(typeof b.then=="function")return x(w,Vs(b),N);if(b.$$typeof===en)return x(w,Rs(w,b),N);Ds(w,b)}return null}function f(w,b,N,E){var R=b!==null?b.key:null;if(typeof N=="string"&&N!==""||typeof N=="number"||typeof N=="bigint")return R!==null?null:c(w,b,""+N,E);if(typeof N=="object"&&N!==null){switch(N.$$typeof){case Ts:return N.key===R?h(w,b,N,E):null;case Ql:return N.key===R?g(w,b,N,E):null;case qn:return N=xi(N),f(w,b,N,E)}if(Zl(N)||Il(N))return R!==null?null:y(w,b,N,E,null);if(typeof N.then=="function")return f(w,b,Vs(N),E);if(N.$$typeof===en)return f(w,b,Rs(w,N),E);Ds(w,N)}return null}function v(w,b,N,E,R){if(typeof E=="string"&&E!==""||typeof E=="number"||typeof E=="bigint")return w=w.get(N)||null,c(b,w,""+E,R);if(typeof E=="object"&&E!==null){switch(E.$$typeof){case Ts:return w=w.get(E.key===null?N:E.key)||null,h(b,w,E,R);case Ql:return w=w.get(E.key===null?N:E.key)||null,g(b,w,E,R);case qn:return E=xi(E),v(w,b,N,E,R)}if(Zl(E)||Il(E))return w=w.get(N)||null,y(b,w,E,R,null);if(typeof E.then=="function")return v(w,b,N,Vs(E),R);if(E.$$typeof===en)return v(w,b,N,Rs(b,E),R);Ds(b,E)}return null}function z(w,b,N,E){for(var R=null,F=null,L=b,Y=b=0,me=null;L!==null&&Y<N.length;Y++){L.index>Y?(me=L,L=null):me=L.sibling;var Q=f(w,L,N[Y],E);if(Q===null){L===null&&(L=me);break}e&&L&&Q.alternate===null&&t(w,L),b=l(Q,b,Y),F===null?R=Q:F.sibling=Q,F=Q,L=me}if(Y===N.length)return a(w,L),re&&gn(w,Y),R;if(L===null){for(;Y<N.length;Y++)L=x(w,N[Y],E),L!==null&&(b=l(L,b,Y),F===null?R=L:F.sibling=L,F=L);return re&&gn(w,Y),R}for(L=n(L);Y<N.length;Y++)me=v(L,w,Y,N[Y],E),me!==null&&(e&&(Q=me.alternate,Q!==null&&L.delete(Q.key===null?Y:Q.key)),b=l(me,b,Y),F===null?R=me:F.sibling=me,F=me);return e&&L.forEach(function(De){return t(w,De)}),re&&gn(w,Y),R}function T(w,b,N,E){if(N==null)throw Error(C(151));for(var R=null,F=null,L=b,Y=b=0,me=null,Q=N.next();L!==null&&!Q.done;Y++,Q=N.next()){L.index>Y?(me=L,L=null):me=L.sibling;var De=f(w,L,Q.value,E);if(De===null){L===null&&(L=me);break}e&&L&&De.alternate===null&&t(w,L),b=l(De,b,Y),F===null?R=De:F.sibling=De,F=De,L=me}if(Q.done)return a(w,L),re&&gn(w,Y),R;if(L===null){for(;!Q.done;Y++,Q=N.next())Q=x(w,Q.value,E),Q!==null&&(b=l(Q,b,Y),F===null?R=Q:F.sibling=Q,F=Q);return re&&gn(w,Y),R}for(L=n(L);!Q.done;Y++,Q=N.next())Q=v(L,w,Y,Q.value,E),Q!==null&&(e&&(me=Q.alternate,me!==null&&L.delete(me.key===null?Y:me.key)),b=l(Q,b,Y),F===null?R=Q:F.sibling=Q,F=Q);return e&&L.forEach(function(Te){return t(w,Te)}),re&&gn(w,Y),R}function V(w,b,N,E){if(typeof N=="object"&&N!==null&&N.type===Co&&N.key===null&&N.props.ref===void 0&&(N=N.props.children),typeof N=="object"&&N!==null){switch(N.$$typeof){case Ts:e:{for(var R=N.key;b!==null;){if(b.key===R){if(R=N.type,R===Co){if(b.tag===7){a(w,b.sibling),E=o(b,N.props.children),_n(E,N),E.return=w,w=E;break e}}else if(b.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===qn&&xi(R)===b.type){a(w,b.sibling),E=o(b,N.props),_n(E,N),E.return=w,w=E;break e}a(w,b);break}else t(w,b);b=b.sibling}N.type===Co?(E=ki(N.props.children,w.mode,E,N.key),_n(E,N),E.return=w,w=E):(E=Js(N.type,N.key,N.props,null,w.mode,E),_n(E,N),E.return=w,w=E)}return u(w);case Ql:e:{for(R=N.key;b!==null;){if(b.key===R)if(b.tag===4&&b.stateNode.containerInfo===N.containerInfo&&b.stateNode.implementation===N.implementation){a(w,b.sibling),E=o(b,N.children||[]),E.return=w,w=E;break e}else{a(w,b);break}else t(w,b);b=b.sibling}E=Nd(N,w.mode,E),E.return=w,w=E}return u(w);case qn:return N=xi(N),V(w,b,N,E)}if(Zl(N))return z(w,b,N,E);if(Il(N)){if(R=Il(N),typeof R!="function")throw Error(C(150));return N=R.call(N),T(w,b,N,E)}if(typeof N.then=="function")return V(w,b,Vs(N),E);if(N.$$typeof===en)return V(w,b,Rs(w,N),E);Ds(w,N)}return typeof N=="string"&&N!==""||typeof N=="number"||typeof N=="bigint"?(N=""+N,b!==null&&b.tag===6?(a(w,b.sibling),E=o(b,N),E.return=w,w=E):(a(w,b),E=xd(N,w.mode,E),E.return=w,w=E),u(w)):a(w,b)}return function(w,b,N,E){try{br=0;var R=V(w,b,N,E);return Go=null,R}catch(L){if(L===cl||L===Zu)throw L;var F=Zt(29,L,null,w.mode);return F.lanes=E,F.return=w,F}}}var Di=Ov(!0),Rv=Ov(!1),Bn=!1;function fm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function ch(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Jn(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Fn(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,(be&2)!==0){var o=n.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),n.pending=t,t=bu(e),Sv(e,null,a),t}return Xu(e,n,t,a),bu(e)}function ar(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,Jb(e,a)}}function Td(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var o=null,l=null;if(a=a.firstBaseUpdate,a!==null){do{var u={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};l===null?o=l=u:l=l.next=u,a=a.next}while(a!==null);l===null?o=l=t:l=l.next=t}else o=l=t;a={baseState:n.baseState,firstBaseUpdate:o,lastBaseUpdate:l,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var dh=!1;function nr(){if(dh){var e=Lo;if(e!==null)throw e}}function ir(e,t,a,n){dh=!1;var o=e.updateQueue;Bn=!1;var l=o.firstBaseUpdate,u=o.lastBaseUpdate,c=o.shared.pending;if(c!==null){o.shared.pending=null;var h=c,g=h.next;h.next=null,u===null?l=g:u.next=g,u=h;var y=e.alternate;y!==null&&(y=y.updateQueue,c=y.lastBaseUpdate,c!==u&&(c===null?y.firstBaseUpdate=g:c.next=g,y.lastBaseUpdate=h))}if(l!==null){var x=o.baseState;u=0,y=g=h=null,c=l;do{var f=c.lane&-536870913,v=f!==c.lane;if(v?(he&f)===f:(n&f)===f){f!==0&&f===Vi&&(dh=!0),y!==null&&(y=y.next={lane:0,tag:c.tag,payload:c.payload,callback:null,next:null});e:{var z=e,T=c;f=t;var V=a;switch(T.tag){case 1:if(z=T.payload,typeof z=="function"){x=z.call(V,x,f);break e}x=z;break e;case 3:z.flags=z.flags&-65537|128;case 0:if(z=T.payload,f=typeof z=="function"?z.call(V,x,f):z,f==null)break e;x=Ae({},x,f);break e;case 2:Bn=!0}}f=c.callback,f!==null&&(e.flags|=64,v&&(e.flags|=8192),v=o.callbacks,v===null?o.callbacks=[f]:v.push(f))}else v={lane:f,tag:c.tag,payload:c.payload,callback:c.callback,next:null},y===null?(g=y=v,h=x):y=y.next=v,u|=f;if(c=c.next,c===null){if(c=o.shared.pending,c===null)break;v=c,c=v.next,v.next=null,o.lastBaseUpdate=v,o.shared.pending=null}}while(!0);y===null&&(h=x),o.baseState=h,o.firstBaseUpdate=g,o.lastBaseUpdate=y,l===null&&(o.shared.lanes=0),si|=u,e.lanes=u,e.memoizedState=x}}function Vv(e,t){if(typeof e!="function")throw Error(C(191,e));e.call(t)}function Dv(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)Vv(a[e],t)}var li=sn(null),xu=sn(0);function Of(e,t){e=Sn,Re(xu,e),Re(li,t),Sn=e|t.baseLanes}function hh(){Re(xu,Sn),Re(li,li.current)}function bm(){Sn=xu.current,$t(li),$t(xu)}var St=sn(null),zt=null;function Pn(e){var t=e.alternate;Re(xt,xt.current&1),Re(St,e),zt===null&&(t===null||li.current!==null||t.memoizedState!==null)&&(zt=e)}function mh(e){Re(xt,xt.current),Re(St,e),zt===null&&(zt=e)}function _v(e){e.tag===22?(Re(xt,xt.current),Re(St,e),zt===null&&(zt=e)):Wn()}function Wn(){Re(xt,xt.current),Re(St,St.current)}function ia(e){$t(St),zt===e&&(zt=null),$t(xt)}var xt=sn(0);function vr(e,t){Re(St,St.current),Re(xt,t)}function vm(e){$t(xt),$t(St),zt===e&&(zt=null)}function Nu(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Qh(a)||jm(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var $n=0,ie=null,Se=null,Fe=null,Su=!1,Yo=!1,_i=!1,Tu=0,yr=0,jo=null,tN=0;function Ye(){throw Error(C(321))}function ym(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!da(e[a],t[a]))return!1;return!0}function wm(e,t,a,n,o,l){return $n=l,ie=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,W.H=e===null||e.memoizedState===null?my:py,_i=!1,l=a(n,o),_i=!1,Yo&&(l=Uv(t,a,n,o)),Hv(e),l}function Hv(e){W.H=Eu;var t=Se!==null&&Se.next!==null;if($n=0,Fe=Se=ie=null,Su=!1,yr=0,jo=null,t)throw Error(C(300));e===null||We||(e=e.dependencies,e!==null&&wu(e)&&(We=!0))}function Uv(e,t,a,n){ie=e;var o=0;do{if(Yo&&(jo=null),yr=0,Yo=!1,25<=o)throw Error(C(301));if(o+=1,Fe=Se=null,e.updateQueue!=null){var l=e.updateQueue;l.lastEffect=null,l.events=null,l.stores=null,l.memoCache!=null&&(l.memoCache.index=0)}W.H=uN,l=t(a,n)}while(Yo);return l}function aN(){var e=W.H,t=e.useState()[0];return t=typeof t.then=="function"?Vr(t):t,e=e.useState()[0],(Se!==null?Se.memoizedState:null)!==e&&(ie.flags|=1024),t}function $m(){var e=Tu!==0;return Tu=0,e}function xm(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Nm(e){if(Su){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Su=!1}$n=0,Fe=Se=ie=null,Yo=!1,yr=Tu=0,jo=null}function qt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Fe===null?ie.memoizedState=Fe=e:Fe=Fe.next=e,Fe}function Ze(){if(Se===null){var e=ie.alternate;e=e!==null?e.memoizedState:null}else e=Se.next;var t=Fe===null?ie.memoizedState:Fe.next;if(t!==null)Fe=t,Se=e;else{if(e===null)throw ie.alternate===null?Error(C(467)):Error(C(310));Se=e,e={memoizedState:Se.memoizedState,baseState:Se.baseState,baseQueue:Se.baseQueue,queue:Se.queue,next:null},Fe===null?ie.memoizedState=Fe=e:Fe=Fe.next=e}return Fe}function Ku(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Vr(e){var t=yr;return yr+=1,jo===null&&(jo=[]),e=Mv(jo,e,t),t=ie,(Fe===null?t.memoizedState:Fe.next)===null&&(t=t.alternate,W.H=t===null||t.memoizedState===null?my:py),e}function Ju(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Vr(e);if(e.$$typeof===H$)return;if(e.$$typeof===en)return wt(e)}throw Error(C(438,String(e)))}function Sm(e){var t=null,a=ie.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=ie.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=Ku(),ie.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=_$;return t.index++,a}function xn(e,t){return typeof t=="function"?t(e):t}function Ws(e){var t=Ze();return Tm(t,Se,e)}function Tm(e,t,a){var n=e.queue;if(n===null)throw Error(C(311));n.lastRenderedReducer=a;var o=e.baseQueue,l=n.pending;if(l!==null){if(o!==null){var u=o.next;o.next=l.next,l.next=u}t.baseQueue=o=l,n.pending=null}if(l=e.baseState,o===null)e.memoizedState=l;else{t=o.next;var c=u=null,h=null,g=t,y=!1;do{var x=g.lane&-536870913;if(x!==g.lane?(he&x)===x:($n&x)===x){var f=g.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),x===Vi&&(y=!0);else if(($n&f)===f){g=g.next,f===Vi&&(y=!0);continue}else x={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(c=h=x,u=l):h=h.next=x,ie.lanes|=f,si|=f;x=g.action,_i&&a(l,x),l=g.hasEagerState?g.eagerState:a(l,x)}else f={lane:x,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(c=h=f,u=l):h=h.next=f,ie.lanes|=x,si|=x;g=g.next}while(g!==null&&g!==t);if(h===null?u=l:h.next=c,!da(l,e.memoizedState)&&(We=!0,y&&(a=Lo,a!==null)))throw a;e.memoizedState=l,e.baseState=u,e.baseQueue=h,n.lastRenderedState=l}return o===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function Ed(e){var t=Ze(),a=t.queue;if(a===null)throw Error(C(311));a.lastRenderedReducer=e;var n=a.dispatch,o=a.pending,l=t.memoizedState;if(o!==null){a.pending=null;var u=o=o.next;do l=e(l,u.action),u=u.next;while(u!==o);da(l,t.memoizedState)||(We=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),a.lastRenderedState=l}return[l,n]}function qv(e,t,a){var n=ie,o=Ze(),l=re;if(l){if(a===void 0)throw Error(C(407));a=a()}else a=t();var u=!da((Se||o).memoizedState,a);if(u&&(o.memoizedState=a,We=!0),o=o.queue,Em(Lv.bind(null,n,o,e),[e]),e=o.getSnapshot!==t||u||Fe!==null&&(Fe.memoizedState.tag&1)!==0,Po(e?9:8,{destroy:void 0},Iv.bind(null,n,o,a,t),null),e){if(n.flags|=2048,Ce===null)throw Error(C(349));l||($n&127)!==0||Bv(n,t,a)}return a}function Bv(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=ie.updateQueue,t===null?(t=Ku(),ie.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function Iv(e,t,a,n){t.value=a,t.getSnapshot=n,Gv(t)&&Yv(e)}function Lv(e,t,a){return a(function(){Gv(t)&&Yv(e)})}function Gv(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!da(e,a)}catch{return!0}}function Yv(e){var t=Li(e,2);t!==null&&Kt(t,e,2)}function ph(e){var t=qt();if(typeof e=="function"){var a=e;if(e=a(),_i){Ln(!0);try{a()}finally{Ln(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:xn,lastRenderedState:e},t}function jv(e,t,a,n){return e.baseState=a,Tm(e,Se,typeof n=="function"?n:xn)}function nN(e,t,a,n,o){if(Pu(e))throw Error(C(485));if(e=t.action,e!==null){var l={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(u){l.listeners.push(u)}};W.T!==null?a(!0):l.isTransition=!1,n(l),a=t.pending,a===null?(l.next=t.pending=l,Xv(t,l)):(l.next=a.next,t.pending=a.next=l)}}function Xv(e,t){var a=t.action,n=t.payload,o=e.state;if(t.isTransition){var l=W.T,u={};u.types=l!==null?l.types:null,W.T=u;try{var c=a(o,n),h=W.S;h!==null&&h(u,c),Rf(e,t,c)}catch(g){gh(e,t,g)}finally{l!==null&&u.types!==null&&(l.types=u.types),W.T=l}}else try{l=a(o,n),Rf(e,t,l)}catch(g){gh(e,t,g)}}function Rf(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){Vf(e,t,n)},function(n){return gh(e,t,n)}):Vf(e,t,a)}function Vf(e,t,a){t.status="fulfilled",t.value=a,Qv(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,Xv(e,a)))}function gh(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,Qv(t),t=t.next;while(t!==n)}e.action=null}function Qv(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Zv(e,t){return t}function Df(e,t){if(re){var a=Ce.formState;if(a!==null){e:{var n=ie;if(re){if(Oe){t:{for(var o=Oe,l=Ea;o.nodeType!==8;){if(!l){o=null;break t}if(o=ka(o.nextSibling),o===null){o=null;break t}}l=o.data,o=l==="F!"||l==="F"?o:null}if(o){Oe=ka(o.nextSibling),n=o.data==="F!";break e}}oi(n)}n=!1}n&&(t=a[0])}}return a=qt(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Zv,lastRenderedState:t},a.queue=n,a=cy.bind(null,ie,n),n.dispatch=a,n=ph(!1),l=zm.bind(null,ie,!1,n.queue),n=qt(),o={state:t,dispatch:null,action:e,pending:null},n.queue=o,a=nN.bind(null,ie,o,l,a),o.dispatch=a,n.memoizedState=e,[t,a,!1]}function _f(e){var t=Ze();return Kv(t,Se,e)}function Kv(e,t,a){if(t=Tm(e,t,Zv)[0],e=Ws(xn)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=Vr(t)}catch(u){throw u===cl?Zu:u}else n=t;t=Ze();var o=t.queue,l=o.dispatch;return a!==t.memoizedState&&(ie.flags|=2048,Po(9,{destroy:void 0},iN.bind(null,o,a),null)),[n,l,e]}function iN(e,t){e.action=t}function Hf(e){var t=Ze(),a=Se;if(a!==null)return Kv(t,a,e);Ze(),t=t.memoizedState,a=Ze();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function Po(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=ie.updateQueue,t===null&&(t=Ku(),ie.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function Jv(){return Ze().memoizedState}function eu(e,t,a,n){var o=qt();ie.flags|=e,o.memoizedState=Po(1|t,{destroy:void 0},a,n===void 0?null:n)}function Fu(e,t,a,n){var o=Ze();n=n===void 0?null:n;var l=o.memoizedState.inst;Se!==null&&n!==null&&ym(n,Se.memoizedState.deps)?o.memoizedState=Po(t,l,a,n):(ie.flags|=e,o.memoizedState=Po(1|t,l,a,n))}function Uf(e,t){eu(8390656,8,e,t)}function Em(e,t){Fu(2048,8,e,t)}function oN(e){ie.flags|=4;var t=ie.updateQueue;if(t===null)t=Ku(),ie.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function Fv(e){var t=Ze().memoizedState;return oN({ref:t,nextImpl:e}),function(){if((be&2)!==0)throw Error(C(440));return t.impl.apply(void 0,arguments)}}function Pv(e,t){return Fu(4,2,e,t)}function Wv(e,t){return Fu(4,4,e,t)}function ey(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function ty(e,t,a){a=a!=null?a.concat([e]):null,Fu(4,4,ey.bind(null,t,e),a)}function km(){}function ay(e,t){var a=Ze();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&ym(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function ny(e,t){var a=Ze();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&ym(t,n[1]))return n[0];if(n=e(),_i){Ln(!0);try{e()}finally{Ln(!1)}}return a.memoizedState=[n,t],n}function Cm(e,t,a){return a===void 0||($n&1073741824)!==0&&(he&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=Ky(),ie.lanes|=e,si|=e,a)}function iy(e,t,a,n){return da(a,t)?a:li.current!==null?(e=Cm(e,a,n),da(e,t)||(We=!0),e):($n&106)===0||($n&1073741824)!==0&&(he&261930)===0?(We=!0,e.memoizedState=a):(e=Ky(),ie.lanes|=e,si|=e,t)}function oy(e,t,a,n,o){var l=ve.p;ve.p=l!==0&&8>l?l:8;var u=W.T,c={};c.types=u!==null?u.types:null,W.T=c,zm(e,!1,t,a);try{var h=o(),g=W.S;if(g!==null&&g(c,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var y=eN(h,n);or(e,t,y,ca(e))}else or(e,t,n,ca(e))}catch(x){or(e,t,{then:function(){},status:"rejected",reason:x},ca())}finally{ve.p=l,u!==null&&c.types!==null&&(u.types=c.types),W.T=u}}function lN(){}function fh(e,t,a,n){if(e.tag!==5)throw Error(C(476));var o=ly(e).queue;oy(e,o,t,Ei,a===null?lN:function(){return ry(e),a(n)})}function ly(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Ei,baseState:Ei,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:xn,lastRenderedState:Ei},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:xn,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function ry(e){var t=ly(e);t.next===null&&(t=e.alternate.memoizedState),or(e,t.next.queue,{},ca())}function Am(){return wt(ol)}function sy(){return Ze().memoizedState}function uy(){return Ze().memoizedState}function rN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=ca();e=Jn(a);var n=Fn(t,e,a);n!==null&&(Kt(n,t,a),ar(n,t,a)),t={cache:mm()},e.payload=t;return}t=t.return}}function sN(e,t,a){var n=ca();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Pu(e)?dy(t,a):(a=cm(e,t,a,n),a!==null&&(Kt(a,e,n),hy(a,t,n)))}function cy(e,t,a){var n=ca();or(e,t,a,n)}function or(e,t,a,n){var o={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Pu(e))dy(t,o);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var u=t.lastRenderedState,c=l(u,a);if(o.hasEagerState=!0,o.eagerState=c,da(c,u))return Xu(e,t,o,0),Ce===null&&ju(),!1}catch{}if(a=cm(e,t,o,n),a!==null)return Kt(a,e,n),hy(a,t,n),!0}return!1}function zm(e,t,a,n){if(n={lane:2,revertLane:Im(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Pu(e)){if(t)throw Error(C(479))}else t=cm(e,a,n,2),t!==null&&Kt(t,e,2)}function Pu(e){var t=e.alternate;return e===ie||t!==null&&t===ie}function dy(e,t){Yo=Su=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function hy(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,Jb(e,a)}}var Eu={readContext:wt,use:Ju,useCallback:Ye,useContext:Ye,useEffect:Ye,useImperativeHandle:Ye,useLayoutEffect:Ye,useInsertionEffect:Ye,useMemo:Ye,useReducer:Ye,useRef:Ye,useState:Ye,useDebugValue:Ye,useDeferredValue:Ye,useTransition:Ye,useSyncExternalStore:Ye,useId:Ye,useHostTransitionStatus:Ye,useFormState:Ye,useActionState:Ye,useOptimistic:Ye,useMemoCache:Ye,useCacheRefresh:Ye,useEffectEvent:Ye},my={readContext:wt,use:Ju,useCallback:function(e,t){return qt().memoizedState=[e,t===void 0?null:t],e},useContext:wt,useEffect:Uf,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,eu(4194308,4,ey.bind(null,t,e),a)},useLayoutEffect:function(e,t){return eu(4194308,4,e,t)},useInsertionEffect:function(e,t){eu(4,2,e,t)},useMemo:function(e,t){var a=qt();t=t===void 0?null:t;var n=e();if(_i){Ln(!0);try{e()}finally{Ln(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=qt();if(a!==void 0){var o=a(t);if(_i){Ln(!0);try{a(t)}finally{Ln(!1)}}}else o=t;return n.memoizedState=n.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},n.queue=e,e=e.dispatch=sN.bind(null,ie,e),[n.memoizedState,e]},useRef:function(e){var t=qt();return e={current:e},t.memoizedState=e},useState:function(e){e=ph(e);var t=e.queue,a=cy.bind(null,ie,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:km,useDeferredValue:function(e,t){var a=qt();return Cm(a,e,t)},useTransition:function(){var e=ph(!1);return e=oy.bind(null,ie,e.queue,!0,!1),qt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=ie,o=qt();if(re){if(a===void 0)throw Error(C(407));a=a()}else{if(a=t(),Ce===null)throw Error(C(349));(he&127)!==0||Bv(n,t,a)}o.memoizedState=a;var l={value:a,getSnapshot:t};return o.queue=l,Uf(Lv.bind(null,n,l,e),[e]),n.flags|=2048,Po(9,{destroy:void 0},Iv.bind(null,n,l,a,t),null),a},useId:function(){var e=qt(),t=Ce.identifierPrefix;if(re){var a=nn,n=an;a=(n&~(1<<32-ua(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Tu++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=tN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Am,useFormState:Df,useActionState:Df,useOptimistic:function(e){var t=qt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=zm.bind(null,ie,!0,a),a.dispatch=t,[e,t]},useMemoCache:Sm,useCacheRefresh:function(){return qt().memoizedState=rN.bind(null,ie)},useEffectEvent:function(e){var t=qt(),a={impl:e};return t.memoizedState=a,function(){if((be&2)!==0)throw Error(C(440));return a.impl.apply(void 0,arguments)}}},py={readContext:wt,use:Ju,useCallback:ay,useContext:wt,useEffect:Em,useImperativeHandle:ty,useInsertionEffect:Pv,useLayoutEffect:Wv,useMemo:ny,useReducer:Ws,useRef:Jv,useState:function(){return Ws(xn)},useDebugValue:km,useDeferredValue:function(e,t){var a=Ze();return iy(a,Se.memoizedState,e,t)},useTransition:function(){var e=Ws(xn)[0],t=Ze().memoizedState;return[typeof e=="boolean"?e:Vr(e),t]},useSyncExternalStore:qv,useId:sy,useHostTransitionStatus:Am,useFormState:_f,useActionState:_f,useOptimistic:function(e,t){var a=Ze();return jv(a,Se,e,t)},useMemoCache:Sm,useCacheRefresh:uy,useEffectEvent:Fv},uN={readContext:wt,use:Ju,useCallback:ay,useContext:wt,useEffect:Em,useImperativeHandle:ty,useInsertionEffect:Pv,useLayoutEffect:Wv,useMemo:ny,useReducer:Ed,useRef:Jv,useState:function(){return Ed(xn)},useDebugValue:km,useDeferredValue:function(e,t){var a=Ze();return Se===null?Cm(a,e,t):iy(a,Se.memoizedState,e,t)},useTransition:function(){var e=Ed(xn)[0],t=Ze().memoizedState;return[typeof e=="boolean"?e:Vr(e),t]},useSyncExternalStore:qv,useId:sy,useHostTransitionStatus:Am,useFormState:Hf,useActionState:Hf,useOptimistic:function(e,t){var a=Ze();return Se!==null?jv(a,Se,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Sm,useCacheRefresh:uy,useEffectEvent:Fv};function kd(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:Ae({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var bh={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=ca(),o=Jn(n);o.payload=t,a!=null&&(o.callback=a),t=Fn(e,o,n),t!==null&&(Kt(t,e,n),ar(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=ca(),o=Jn(n);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=Fn(e,o,n),t!==null&&(Kt(t,e,n),ar(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=ca(),n=Jn(a);n.tag=2,t!=null&&(n.callback=t),t=Fn(e,n,a),t!==null&&(Kt(t,e,a),ar(t,e,a))}};function qf(e,t,a,n,o,l,u){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,l,u):t.prototype&&t.prototype.isPureReactComponent?!pr(a,n)||!pr(o,l):!0}function Bf(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&bh.enqueueReplaceState(t,t.state,null)}function Hi(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=Ae({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function gy(e){fu(e)}function fy(e){console.error(e)}function by(e){fu(e)}function ku(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function If(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function vh(e,t,a){return a=Jn(a),a.tag=3,a.payload={element:null},a.callback=function(){ku(e,t)},a}function vy(e){return e=Jn(e),e.tag=3,e}function yy(e,t,a,n){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var l=n.value;e.payload=function(){return o(l)},e.callback=function(){If(t,a,n)}}var u=a.stateNode;u!==null&&typeof u.componentDidCatch=="function"&&(e.callback=function(){If(t,a,n),typeof o!="function"&&(ei===null?ei=new Set([this]):ei.add(this));var c=n.stack;this.componentDidCatch(n.value,{componentStack:c!==null?c:""})})}function cN(e,t,a,n,o){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&Oi(t,a,o,!0),a=St.current,a!==null){switch(a.tag){case 31:case 13:case 19:return zt===null?Du():a.alternate===null&&je===0&&(je=3),a.flags&=-257,a.flags|=65536,a.lanes=o,n===$u?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),Vd(e,n,o)),!1;case 22:return a.flags|=65536,n===$u?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),Vd(e,n,o)),!1}throw Error(C(435,a.tag))}return Vd(e,n,o),Du(),!1}if(re)return t=St.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,n!==lh&&(e=Error(C(422),{cause:n}),fr(Ta(e,a)))):(n!==lh&&(t=Error(C(423),{cause:n}),fr(Ta(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,n=Ta(n,a),o=vh(e.stateNode,n,o),Td(e,o),je!==4&&(je=2)),!1;var l=Error(C(520),{cause:n});if(l=Ta(l,a),ur===null?ur=[l]:ur.push(l),je!==4&&(je=2),t===null)return!0;n=Ta(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=vh(a.stateNode,n,e),Td(a,e),!1;case 1:if(t=a.type,l=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||l!==null&&typeof l.componentDidCatch=="function"&&(ei===null||!ei.has(l))))return a.flags|=65536,o&=-o,a.lanes|=o,o=vy(o),yy(o,e,a,n),Td(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var Mm=Error(C(461)),We=!1;function nt(e,t,a,n){t.child=e===null?Rv(t,null,a,n):Di(t,e.child,a,n)}function Lf(e,t,a,n,o){a=a.render;var l=t.ref;if("ref"in n){var u={};for(var c in n)c!=="ref"&&(u[c]=n[c])}else u=n;return Ri(t),n=wm(e,t,a,u,l,o),c=$m(),e!==null&&!We?(xm(e,t,o),Nn(e,t,o)):(re&&c&&Qu(t),t.flags|=1,nt(e,t,n,o),t.child)}function Gf(e,t,a,n,o){if(e===null){var l=a.type;return typeof l=="function"&&!dm(l)&&l.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=l,wy(e,t,l,n,o)):(e=Js(a.type,null,n,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,!Rm(e,o)){var u=l.memoizedProps;if(a=a.compare,a=a!==null?a:pr,a(u,n)&&e.ref===t.ref)return Nn(e,t,o)}return t.flags|=1,e=bn(l,n),e.ref=t.ref,e.return=t,t.child=e}function wy(e,t,a,n,o){if(e!==null){var l=e.memoizedProps;if(pr(l,n)&&e.ref===t.ref)if(We=!1,t.pendingProps=n=l,Rm(e,o))(e.flags&131072)!==0&&(We=!0);else return t.lanes=e.lanes,Nn(e,t,o)}return yh(e,t,a,n,o)}function $y(e,t,a,n){var o=n.children,l=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(l=l!==null?l.baseLanes|a:a,e!==null){for(n=t.child=e.child,o=0;n!==null;)o=o|n.lanes|n.childLanes,n=n.sibling;n=o&~l}else n=0,t.child=null;return Yf(e,t,l,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Ps(t,l!==null?l.cachePool:null),l!==null?Of(t,l):hh(),_v(t);else return n=t.lanes=536870912,Yf(e,t,l!==null?l.baseLanes|a:a,a,n)}else l!==null?(Ps(t,l.cachePool),Of(t,l),Wn(),t.memoizedState=null):(e!==null&&Ps(t,null),hh(),Wn());return nt(e,t,o,a),t.child}function lr(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Yf(e,t,a,n,o){var l=pm();return l=l===null?null:{parent:Pe._currentValue,pool:l},t.memoizedState={baseLanes:a,cachePool:l},e!==null&&Ps(t,null),hh(),_v(t),e!==null&&Oi(e,t,n,!0),t.childLanes=o,null}function tu(e,t){return t=Wu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function jf(e,t,a){return Di(t,e.child,null,a),e=tu(t,t.pendingProps),e.flags|=2,ia(t),t.memoizedState=null,e}function dN(e,t,a){var n=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(re){if(n.mode==="hidden")return e=tu(t,n),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},lr(null,e);if(mh(t),(e=Oe)?(e=$w(e,Ea),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ii!==null?{id:an,overflow:nn}:null,retryLane:536870912,hydrationErrors:null},a=Ev(e),a.return=t,t.child=a,mt=t,Oe=null)):e=null,e===null)throw oi(t);return t.lanes=536870912,null}return tu(t,n)}var l=e.memoizedState;if(l!==null){var u=l.dehydrated;if(mh(t),o)if(t.flags&256)t.flags&=-257,t=jf(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(C(558));else if(We||Oi(e,t,a,!1),o=(a&e.childLanes)!==0,We||o){if(li.current===null){if(n=Ce,n!==null&&(u=Fb(n,a),u!==0&&u!==l.retryLane))throw l.retryLane=u,Li(e,u),Kt(n,e,u),Mm;Du()}t=jf(e,t,a)}else e=l.treeContext,Oe=ka(u.nextSibling),mt=t,re=!0,Kn=null,Ea=!1,e!==null&&Cv(t,e),t=tu(t,n),t.flags|=134221824;return t}return e=bn(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function So(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(C(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function yh(e,t,a,n,o){return Ri(t),a=wm(e,t,a,n,void 0,o),n=$m(),e!==null&&!We?(xm(e,t,o),Nn(e,t,o)):(re&&n&&Qu(t),t.flags|=1,nt(e,t,a,o),t.child)}function Xf(e,t,a,n,o,l){return Ri(t),t.updateQueue=null,a=Uv(t,n,a,o),Hv(e),n=$m(),e!==null&&!We?(xm(e,t,l),Nn(e,t,l)):(re&&n&&Qu(t),t.flags|=1,nt(e,t,a,l),t.child)}function Qf(e,t,a,n,o){if(Ri(t),t.stateNode===null){var l=Do,u=a.contextType;typeof u=="object"&&u!==null&&(l=wt(u)),l=new a(n,l),t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,l.updater=bh,t.stateNode=l,l._reactInternals=t,l=t.stateNode,l.props=n,l.state=t.memoizedState,l.refs={},fm(t),u=a.contextType,l.context=typeof u=="object"&&u!==null?wt(u):Do,l.state=t.memoizedState,u=a.getDerivedStateFromProps,typeof u=="function"&&(kd(t,a,u,n),l.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(u=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),u!==l.state&&bh.enqueueReplaceState(l,l.state,null),ir(t,n,l,o),nr(),l.state=t.memoizedState),typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){l=t.stateNode;var c=t.memoizedProps,h=Hi(a,c);l.props=h;var g=l.context,y=a.contextType;u=Do,typeof y=="object"&&y!==null&&(u=wt(y));var x=a.getDerivedStateFromProps;y=typeof x=="function"||typeof l.getSnapshotBeforeUpdate=="function",c=t.pendingProps!==c,y||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(c||g!==u)&&Bf(t,l,n,u),Bn=!1;var f=t.memoizedState;l.state=f,ir(t,n,l,o),nr(),g=t.memoizedState,c||f!==g||Bn?(typeof x=="function"&&(kd(t,a,x,n),g=t.memoizedState),(h=Bn||qf(t,a,h,n,f,g,u))?(y||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount()),typeof l.componentDidMount=="function"&&(t.flags|=4194308)):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=g),l.props=n,l.state=g,l.context=u,n=h):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{l=t.stateNode,ch(e,t),u=t.memoizedProps,y=Hi(a,u),l.props=y,x=t.pendingProps,f=l.context,g=a.contextType,h=Do,typeof g=="object"&&g!==null&&(h=wt(g)),c=a.getDerivedStateFromProps,(g=typeof c=="function"||typeof l.getSnapshotBeforeUpdate=="function")||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(u!==x||f!==h)&&Bf(t,l,n,h),Bn=!1,f=t.memoizedState,l.state=f,ir(t,n,l,o),nr();var v=t.memoizedState;u!==x||f!==v||Bn||e!==null&&e.dependencies!==null&&wu(e.dependencies)?(typeof c=="function"&&(kd(t,a,c,n),v=t.memoizedState),(y=Bn||qf(t,a,y,n,f,v,h)||e!==null&&e.dependencies!==null&&wu(e.dependencies))?(g||typeof l.UNSAFE_componentWillUpdate!="function"&&typeof l.componentWillUpdate!="function"||(typeof l.componentWillUpdate=="function"&&l.componentWillUpdate(n,v,h),typeof l.UNSAFE_componentWillUpdate=="function"&&l.UNSAFE_componentWillUpdate(n,v,h)),typeof l.componentDidUpdate=="function"&&(t.flags|=4),typeof l.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof l.componentDidUpdate!="function"||u===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=v),l.props=n,l.state=v,l.context=h,n=y):(typeof l.componentDidUpdate!="function"||u===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),n=!1)}return l=n,So(e,t),n=(t.flags&128)!==0,l||n?(l=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:l.render(),t.flags|=1,e!==null&&n?(t.child=Di(t,e.child,null,o),t.child=Di(t,null,a,o)):nt(e,t,a,o),t.memoizedState=l.state,e=t.child):e=Nn(e,t,o),e}function Zf(e,t,a,n){return Mi(),t.flags|=256,nt(e,t,a,n),t.child}var wh={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function $h(e){return{baseLanes:e,cachePool:zv()}}function xh(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=la),e}function xy(e,t,a){var n=t.pendingProps,o=!1,l=(t.flags&128)!==0,u;if((u=l)||(u=e!==null&&e.memoizedState===null?!1:(xt.current&2)!==0),u&&(o=!0,t.flags&=-129),u=(t.flags&32)!==0,t.flags&=-33,e===null){if(re){if(o?Pn(t):Wn(),(e=Oe)?(e=$w(e,Ea),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ii!==null?{id:an,overflow:nn}:null,retryLane:536870912,hydrationErrors:null},a=Ev(e),a.return=t,t.child=a,mt=t,Oe=null)):e=null,e===null)throw oi(t);return jm(e)?t.lanes=32:t.lanes=536870912,null}return l=n.children,n=n.fallback,o?(Wn(),o=t.mode,l=Wu({mode:"hidden",children:l},o),n=ki(n,o,a,null),l.return=t,n.return=t,l.sibling=n,t.child=l,n=t.child,n.memoizedState=$h(a),n.childLanes=xh(e,u,a),t.memoizedState=wh,lr(null,n)):(Pn(t),Om(t,l))}var c=e.memoizedState;if(c!==null){var h=c.dehydrated;if(h!==null)return hN(e,t,l,u,n,h,c,a)}return o?(Wn(),o=n.fallback,l=t.mode,c=e.child,h=c.sibling,n=bn(c,{mode:"hidden",children:n.children}),n.subtreeFlags=c.subtreeFlags&1206910976,h!==null?o=bn(h,o):(o=ki(o,l,a,null),o.flags|=2),o.return=t,n.return=t,n.sibling=o,t.child=n,lr(null,n),n=t.child,o=e.child.memoizedState,o===null?o=$h(a):(l=o.cachePool,l!==null?(c=Pe._currentValue,l=l.parent!==c?{parent:c,pool:c}:l):l=zv(),o={baseLanes:o.baseLanes|a,cachePool:l}),n.memoizedState=o,n.childLanes=xh(e,u,a),t.memoizedState=wh,lr(e.child,n)):(Pn(t),a=e.child,e=a.sibling,a=bn(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(u=t.deletions,u===null?(t.deletions=[e],t.flags|=16):u.push(e)),t.child=a,t.memoizedState=null,a)}function Om(e,t){return t=Wu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Wu(e,t){return e=Zt(22,e,null,t),e.lanes=0,e}function _s(e,t,a){return Di(t,e.child,null,a),e=Om(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function hN(e,t,a,n,o,l,u,c){if(a)return t.flags&256?(Pn(t),t.flags&=-257,_s(e,t,c)):t.memoizedState!==null?(Wn(),t.child=e.child,t.flags|=128,null):(Wn(),l=o.fallback,u=t.mode,o=Wu({mode:"visible",children:o.children},u),l=ki(l,u,c,null),l.flags|=2,o.return=t,l.return=t,o.sibling=l,t.child=o,Di(t,e.child,null,c),o=t.child,o.memoizedState=$h(c),o.childLanes=xh(e,n,c),t.memoizedState=wh,lr(null,o));if(Pn(t),jm(l)){if(n=l.nextSibling&&l.nextSibling.dataset,n)var h=n.dgst;return n=h,n!==""&&(o=Error(C(419)),o.stack="",o.digest=n,fr({value:o,source:null,stack:null})),_s(e,t,c)}if(We||Oi(e,t,c,!1),n=(c&e.childLanes)!==0,We||n){if(li.current!==null)return _s(e,t,c);if(n=Ce,n!==null&&(o=Fb(n,c),o!==0&&o!==u.retryLane))throw u.retryLane=o,Li(e,o),Kt(n,e,o),Mm;return Qh(l)||Du(),_s(e,t,c)}return Qh(l)?(t.flags|=192,t.child=e.child,null):(e=u.treeContext,Oe=ka(l.nextSibling),mt=t,re=!0,Kn=null,Ea=!1,e!==null&&Cv(t,e),t=Om(t,o.children),t.flags|=134221824,t)}function Kf(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),Fs(e.return,t,a)}function Jf(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Nu(a)===null&&(t=e),e=e.sibling}return t}function Hs(e,t,a,n,o,l){var u=e.memoizedState;u===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:o,treeForkCount:l}:(u.isBackwards=t,u.rendering=null,u.renderingStartTime=0,u.last=n,u.tail=a,u.tailMode=o,u.treeForkCount=l)}function Cd(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Nh(e,t,a){var n=t.pendingProps,o=n.revealOrder,l=n.tail;n=n.children;var u=xt.current;if(t.flags&128)return vr(t,u),null;var c=(u&2)!==0;if(c?(u=u&1|2,t.flags|=128):u&=1,vr(t,u),o==="backwards"&&e!==null?(Cd(e),nt(e,t,n,a),Cd(e)):nt(e,t,n,a),n=re?gr:0,!c&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Kf(e,a,t);else if(e.tag===19)Kf(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=Jf(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,Cd(t)),Hs(t,!0,o,null,l,n);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&Nu(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}Hs(t,!0,a,null,l,n);break;case"together":Hs(t,!1,null,null,void 0,n);break;case"independent":t.memoizedState=null;break;default:a=Jf(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),Hs(t,!1,o,a,l,n)}return t.child}function Ff(e,t,a){var n=t.pendingProps;return Yn(t,t.type,n.value),nt(e,t,n.children,a),t.child}function Nn(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),si|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Oi(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(C(153));if(t.child!==null){for(e=t.child,a=bn(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=bn(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function Rm(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&wu(e)))}function mN(e,t,a){switch(t.tag){case 3:hu(t,t.stateNode.containerInfo),Yn(t,Pe,e.memoizedState.cache),Mi();break;case 27:case 5:Jd(t);break;case 4:hu(t,t.stateNode.containerInfo);break;case 10:Yn(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,mh(t),null;break;case 13:var n=t.memoizedState;if(n!==null){if(n.dehydrated!==null)return Pn(t),t.flags|=128,null;n=Oi(e,t,a,!1);var o=t.child.childLanes;return n||(a&o)!==0?xy(e,t,a):(Pn(t),e=Nn(e,t,a),e!==null?e.sibling:null)}Pn(t);break;case 19:if(t.flags&128)return Nh(e,t,a);if(o=(e.flags&128)!==0,n=(a&t.childLanes)!==0,n||(Oi(e,t,a,!1),n=(a&t.childLanes)!==0),o){if(n)return Nh(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),vr(t,xt.current),n)break;return null;case 22:return t.lanes=0,$y(e,t,a,t.pendingProps);case 24:Yn(t,Pe,e.memoizedState.cache)}return Nn(e,t,a)}function Ny(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)We=!0;else{if(!Rm(e,a)&&(t.flags&128)===0)return We=!1,mN(e,t,a);We=(e.flags&131072)!==0}else We=!1,re&&(t.flags&1048576)!==0&&kv(t,gr,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=xi(t.elementType),t.type=e,typeof e=="function")dm(e)?(n=Hi(e,n),t.tag=1,t=Qf(null,t,e,n,a)):(t.tag=0,t=yh(null,t,e,n,a));else{if(e!=null){var o=e.$$typeof;if(o===Ph){t.tag=11,t=Lf(null,t,e,n,a);break e}else if(o===Wh){t.tag=14,t=Gf(null,t,e,n,a);break e}else if(o===en){t.tag=10,t.type=e,t=Ff(null,t,a);break e}}throw t=Zd(e)||e,Error(C(306,t,""))}}return t;case 0:return yh(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,o=Hi(n,t.pendingProps),Qf(e,t,n,o,a);case 3:e:{if(hu(t,t.stateNode.containerInfo),e===null)throw Error(C(387));n=t.pendingProps;var l=t.memoizedState;o=l.element,ch(e,t),ir(t,n,null,a);var u=t.memoizedState;if(n=u.cache,Yn(t,Pe,n),n!==l.cache&&sh(t,[Pe],a,!0),nr(),n=u.element,l.isDehydrated)if(l={element:n,isDehydrated:!1,cache:u.cache},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){t=Zf(e,t,n,a);break e}else if(n!==o){o=Ta(Error(C(424)),t),fr(o),t=Zf(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Oe=ka(e.firstChild),mt=t,re=!0,Kn=null,Ea=!0,a=Rv(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Mi(),n===o){t=Nn(e,t,a);break e}nt(e,t,n,a)}t=t.child}return t;case 26:return So(e,t),e===null?(a=Sb(t.type,null,t.pendingProps,null))?t.memoizedState=a:re||(t.stateNode=hw(t.type,t.pendingProps,Zn.current,t)):t.memoizedState=Sb(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Jd(t),e===null&&re&&(n=t.stateNode=xw(t.type,t.pendingProps,Zn.current),mt=t,Ea=!0,o=Oe,ci(t.type)?(Zh=o,Oe=ka(n.firstChild)):Oe=o),nt(e,t,t.pendingProps.children,a),So(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&re&&((o=n=Oe)&&(n=o5(n,t.type,t.pendingProps,Ea),n!==null?(t.stateNode=n,mt=t,Oe=ka(n.firstChild),Ea=!1,o=!0):o=!1),o||oi(t)),Jd(t),o=t.type,l=t.pendingProps,u=e!==null?e.memoizedProps:null,n=l.children,Yh(o,l)?n=null:u!==null&&Yh(o,u)&&(t.flags|=32),t.memoizedState!==null&&(o=wm(e,t,aN,null,null,a),ol._currentValue=o),So(e,t),nt(e,t,n,a),t.child;case 6:return e===null&&re&&((e=a=Oe)&&(a=l5(a,t.pendingProps,Ea),a!==null?(t.stateNode=a,mt=t,Oe=null,e=!0):e=!1),e||oi(t)),null;case 13:return xy(e,t,a);case 4:return hu(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=Di(t,null,n,a):nt(e,t,n,a),t.child;case 11:return Lf(e,t,t.type,t.pendingProps,a);case 7:return n=t.pendingProps,So(e,t),nt(e,t,n,a),t.child;case 8:return nt(e,t,t.pendingProps.children,a),t.child;case 12:return nt(e,t,t.pendingProps.children,a),t.child;case 10:return Ff(e,t,a);case 9:return o=t.type._context,n=t.pendingProps.children,Ri(t),o=wt(o),n=n(o),t.flags|=1,nt(e,t,n,a),t.child;case 14:return Gf(e,t,t.type,t.pendingProps,a);case 15:return wy(e,t,t.type,t.pendingProps,a);case 19:return Nh(e,t,a);case 31:return dN(e,t,a);case 22:return $y(e,t,a,t.pendingProps);case 24:return Ri(t),n=wt(Pe),e===null?(o=pm(),o===null&&(o=Ce,l=mm(),o.pooledCache=l,l.refCount++,l!==null&&(o.pooledCacheLanes|=a),o=l),t.memoizedState={parent:n,cache:o},fm(t),Yn(t,Pe,o)):((e.lanes&a)!==0&&(ch(e,t),ir(t,null,null,a),nr()),o=e.memoizedState,l=t.memoizedState,o.parent!==n?(o={parent:n,cache:n},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),Yn(t,Pe,n)):(n=l.cache,Yn(t,Pe,n),n!==o.cache&&sh(t,[Pe],a,!0))),nt(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),n=t.pendingProps,n.name!=null&&n.name!=="auto"?t.flags|=e===null?18882560:18874368:re&&Qu(t),e!==null&&e.memoizedProps.name!==n.name?t.flags|=4194816:So(e,t),nt(e,t,n.children,a),t.child;case 29:throw t.pendingProps}throw Error(C(156,t.tag))}function pn(e){e.flags|=4}function Ad(e,t,a,n,o){var l;if((l=(e.mode&32)!==0)&&(l=a===null?kb(t,n):kb(t,n)&&(n.src!==a.src||n.srcSet!==a.srcSet)),l){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(Py())e.flags|=8192;else throw Ai=$u,gm}else e.flags&=-16777217}function Pf(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Ew(t))if(Py())e.flags|=8192;else throw Ai=$u,gm}function Us(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Zb():536870912,e.lanes|=t,Wo|=t)}function Gl(e,t){if(!re)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function Me(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags&1206910976,n|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags,n|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function pN(e,t,a){var n=t.pendingProps;switch(hm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Me(t),null;case 1:return Me(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),vn(Pe),Ko(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(xo(t)?pn(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Sd())),Me(t),null;case 26:var o=t.type,l=t.memoizedState;return e===null?(pn(t),l!==null?(Me(t),Pf(t,l)):(Me(t),Ad(t,o,null,n,a))):l?l!==e.memoizedState?(pn(t),Me(t),Pf(t,l)):(Me(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&pn(t),Me(t),Ad(t,o,e,n,a)),null;case 27:if(mu(t),a=Zn.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&pn(t);else{if(!n){if(t.stateNode===null)throw Error(C(166));return Me(t),t.subtreeFlags&=-33554433,null}e=on.current,xo(t)?Tf(t,e):(e=xw(o,n,a),t.stateNode=e,pn(t))}return Me(t),t.subtreeFlags&=-33554433,null;case 5:if(mu(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&pn(t);else{if(!n){if(t.stateNode===null)throw Error(C(166));return Me(t),t.subtreeFlags&=-33554433,null}if(l=on.current,xo(t))Tf(t,l);else{var u=xr(Zn.current);switch(l){case 1:l=u.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:l=u.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":l=u.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":l=u.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":l=u.createElement("div"),l.innerHTML="<script><\/script>",l=l.removeChild(l.firstChild);break;case"select":l=typeof n.is=="string"?u.createElement("select",{is:n.is}):u.createElement("select"),n.multiple?l.multiple=!0:n.size&&(l.size=n.size);break;default:l=typeof n.is=="string"?u.createElement(o,{is:n.is}):u.createElement(o)}}l[yt]=t,l[Ft]=n;e:for(u=t.child;u!==null;){if(u.tag===5||u.tag===6)l.appendChild(u.stateNode);else if(u.tag!==4&&u.tag!==27&&u.child!==null){u.child.return=u,u=u.child;continue}if(u===t)break e;for(;u.sibling===null;){if(u.return===null||u.return===t)break e;u=u.return}u.sibling.return=u.return,u=u.sibling}t.stateNode=l;e:switch(Nt(l,o,n),o){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&pn(t)}}return Me(t),t.subtreeFlags&=-33554433,Ad(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&pn(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(C(166));if(e=Zn.current,xo(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,o=mt,o!==null)switch(o.tag){case 27:case 5:n=o.memoizedProps}e[yt]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||cw(e.nodeValue,a)),e||oi(t,!0)}else e=xr(e).createTextNode(n),e[yt]=t,t.stateNode=e}return Me(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=xo(t),a!==null){if(e===null){if(!n)throw Error(C(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(C(557));e[yt]=t}else Mi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Me(t),e=!1}else a=Sd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(ia(t),t):(ia(t),null);if((t.flags&128)!==0)throw Error(C(558))}return Me(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=xo(t),n!==null&&n.dehydrated!==null){if(e===null){if(!o)throw Error(C(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(C(317));o[yt]=t}else Mi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Me(t),o=!1}else o=Sd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(ia(t),t):(ia(t),null)}return ia(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,o=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(o=n.alternate.memoizedState.cachePool.pool),l=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(l=n.memoizedState.cachePool.pool),l!==o&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),Us(t,t.updateQueue),Me(t),null);case 4:return Ko(),e===null&&Lm(t.stateNode.containerInfo),t.flags|=67108864,Me(t),null;case 10:return vn(t.type),Me(t),null;case 19:if(vm(t),n=t.memoizedState,n===null)return Me(t),null;if(o=(t.flags&128)!==0,l=n.rendering,l===null)if(o)Gl(n,!1);else{if(je!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(l=Nu(e),l!==null){for(t.flags|=128,Gl(n,!1),e=l.updateQueue,t.updateQueue=e,Us(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Tv(a,e),a=a.sibling;return vr(t,xt.current&1|2),re&&gn(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&ra()>Ru&&(t.flags|=128,o=!0,Gl(n,!1),t.lanes=4194304)}else{if(!o)if(e=Nu(l),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,Us(t,e),Gl(n,!0),n.tail===null&&n.tailMode!=="collapsed"&&n.tailMode!=="visible"&&!l.alternate&&!re)return Me(t),null}else 2*ra()-n.renderingStartTime>Ru&&a!==536870912&&(t.flags|=128,o=!0,Gl(n,!1),t.lanes=4194304);n.isBackwards?(l.sibling=t.child,t.child=l):(e=n.last,e!==null?e.sibling=l:t.child=l,n.last=l)}if(n.tail!==null){e=n.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return n.rendering=e,n.tail=e.sibling,n.renderingStartTime=ra(),e.sibling=null,l=xt.current,l=o?l&1|2:l&1,n.tailMode==="visible"||n.tailMode==="collapsed"||!a||re?vr(t,l):(a=l,Re(St,t),Re(xt,a),zt===null&&(zt=t)),re&&gn(t,n.treeForkCount),e}return Me(t),null;case 22:case 23:return ia(t),bm(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&(Me(t),t.subtreeFlags&6&&(t.flags|=8192)):Me(t),a=t.updateQueue,a!==null&&Us(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&$t(Ci),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),vn(Pe),Me(t),null;case 25:return null;case 30:return t.flags|=33554432,Me(t),null}throw Error(C(156,t.tag))}function gN(e,t){switch(hm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return vn(Pe),Ko(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return mu(t),null;case 31:if(t.memoizedState!==null){if(ia(t),t.alternate===null)throw Error(C(340));Mi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(ia(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(C(340));Mi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return vm(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Ko(),null;case 10:return vn(t.type),null;case 22:case 23:return ia(t),bm(),e!==null&&$t(Ci),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return vn(Pe),null;case 25:return null;default:return null}}function Sy(e,t){switch(hm(t),t.tag){case 3:vn(Pe),Ko();break;case 26:case 27:case 5:mu(t);break;case 4:Ko();break;case 31:t.memoizedState!==null&&ia(t);break;case 13:ia(t);break;case 19:vm(t);break;case 10:vn(t.type);break;case 22:case 23:ia(t),bm(),e!==null&&$t(Ci);break;case 24:vn(Pe)}}function Dr(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var o=n.next;a=o;do{if((a.tag&e)===e){n=void 0;var l=a.create,u=a.inst;n=l(),u.destroy=n}a=a.next}while(a!==o)}}catch(c){xe(t,t.return,c)}}function ri(e,t,a){try{var n=t.updateQueue,o=n!==null?n.lastEffect:null;if(o!==null){var l=o.next;n=l;do{if((n.tag&e)===e){var u=n.inst,c=u.destroy;if(c!==void 0){u.destroy=void 0,o=t;var h=a,g=c;try{g()}catch(y){xe(o,h,y)}}}n=n.next}while(n!==l)}}catch(y){xe(t,t.return,y)}}function Ty(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{Dv(t,a)}catch(n){xe(e,e.return,n)}}}function Ey(e,t,a){a.props=Hi(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){xe(e,t,n)}}function Pa(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:var o=e.stateNode,l=wn(e.memoizedProps,o);(o.ref===null||o.ref.name!==l)&&(o.ref=fw(l)),n=o.ref;break;case 7:if(e.stateNode===null){var u=new ha(e);Jt(e.child,!1,n5,u,void 0,void 0),e.stateNode=u}n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(c){xe(e,t,c)}}function vt(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(o){xe(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){xe(e,t,o)}else a.current=null}function Cu(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)ww(e.stateNode,t[a])}function Wf(e){for(var t=e.return;t!==null&&(Dm(t)&&ww(e.stateNode,t.stateNode),!Vm(t));)t=t.return}function rr(e){for(var t=e.return;t!==null&&(Dm(t)&&i5(e.stateNode,t.stateNode),!Vm(t));)t=t.return}function Vm(e){return e.tag===5||e.tag===3||e.tag===27}function Dm(e){return e&&e.tag===7&&e.stateNode!==null}function Sh(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(o){xe(e,e.return,o)}}function zd(e,t,a){try{var n=e.stateNode;qN(n,e.type,a,t),n[Ft]=t}catch(o){xe(e,e.return,o)}}function ky(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&ci(e.type)||e.tag===4}function Md(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||ky(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&ci(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Th(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=tn)),Cu(e,n),fe=!0;else if(o!==4&&(o===27&&(Cu(e,n),n=null,ci(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(Th(e,t,a,n),e=e.sibling;e!==null;)Th(e,t,a,n),e=e.sibling}function Au(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),Cu(e,n),fe=!0;else if(o!==4&&(o===27&&(Cu(e,n),n=null,ci(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(Au(e,t,a,n),e=e.sibling;e!==null;)Au(e,t,a,n),e=e.sibling}function Cy(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);Nt(t,n,a),t[yt]=e,t[Ft]=a}catch(l){xe(e,e.return,l)}}var zu=!1,oa=null;function eb(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(zu=!0)}var Wa=null;function tb(){var e=Wa;return Wa=null,e}var Qt=0;function dl(e,t,a,n,o){return Qt=0,Ay(e.child,t,a,n,o)}function Ay(e,t,a,n,o){for(var l=!1;e!==null;){if(e.tag===5){var u=e.stateNode;if(n!==null){var c=jh(u);n.push(c),c.view&&(l=!0)}else l||jh(u).view&&(l=!0);zu=!0,mw(u,Qt===0?t:t+"_"+Qt,a),Qt++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||Ay(e.child,t,a,n,o)&&(l=!0));e=e.sibling}return l}function rn(e,t){for(;e!==null;)e.tag===5?pw(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||rn(e.child,t)),e=e.sibling}function au(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(au(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(C(544));var a=t.name;t=En(t.default,t.share),t!=="none"&&(dl(e,a,t,null,!1)||rn(e.child,!1))}e=e.sibling}}function Eh(e,t){if(e.tag===30){var a=e.stateNode,n=e.memoizedProps,o=wn(n,a),l=En(n.default,a.paired?n.share:n.enter);l!=="none"?dl(e,o,l,null,!1)?(au(e),a.paired||t||el(e,n.onEnter)):rn(e.child,!1):au(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Eh(e,t),e=e.sibling;else au(e)}function kh(e){if(oa!==null&&oa.size!==0){var t=oa;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,n=a.name;if(n!=null&&n!=="auto"){var o=t.get(n);if(o!==void 0){var l=En(a.default,a.share);if(l!=="none"&&(dl(e,n,l,null,!1)?(l=e.stateNode,o.paired=l,l.paired=o,el(e,a.onShare)):rn(e.child,!1)),t.delete(n),t.size===0)break}}}kh(e)}e=e.sibling}}}function Ch(e){if(e.tag===30){var t=e.memoizedProps,a=wn(t,e.stateNode),n=oa!==null?oa.get(a):void 0,o=En(t.default,n!==void 0?t.share:t.exit);o!=="none"&&(dl(e,a,o,null,!1)?n!==void 0?(o=e.stateNode,n.paired=o,o.paired=n,oa.delete(a),el(e,t.onShare)):el(e,t.onExit):rn(e.child,!1)),oa!==null&&kh(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Ch(e),e=e.sibling;else oa!==null&&kh(e)}function zy(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=wn(t,e.stateNode);t=En(t.default,t.update),e.flags&=-5,t!=="none"&&dl(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&zy(e);e=e.sibling}}function Ah(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,rn(e.child,!1))}Ah(e)}e=e.sibling}}function nu(e){if(e.tag===30)e.stateNode.paired=null,rn(e.child,!1),Ah(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)nu(e),e=e.sibling;else Ah(e)}function My(e){for(e=e.child;e!==null;)e.tag===30?rn(e.child,!1):(e.subtreeFlags&33554432)!==0&&My(e),e=e.sibling}function _m(e,t,a,n,o,l,u){for(var c=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(l!==null&&Qt<l.length){var g=l[Qt],y=jh(h);(g.view||y.view)&&(c=!0);var x;if(x=(e.flags&4)===0)if(y.clip)x=!0;else{x=g.rect;var f=y.rect;x=x.y!==f.y||x.x!==f.x||x.height!==f.height||x.width!==f.width}x&&(e.flags|=4),y.abs?y=!g.abs:(g=g.rect,y=y.rect,y=g.height!==y.height||g.width!==y.width),y&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&mw(h,Qt===0?a:a+"_"+Qt,o),c&&(e.flags&4)!==0||(Wa===null&&(Wa=[]),Wa.push(h,Qt===0?n:n+"_"+Qt,t.memoizedProps)),Qt++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&u?e.flags|=t.flags&32:_m(e,t.child,a,n,o,l,u)&&(c=!0));t=t.sibling}return c}function Oy(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,n=e.stateNode,o=wn(a,n),l=En(a.default,a.update);if(t){n=n.clones;var u=n===null?null:n.map(jN)}else u=e.memoizedState,e.memoizedState=null;n=e;var c=e.child;Qt=0,o=_m(n,c,o,o,l,u,!1),(e.flags&4)!==0&&o&&(t||el(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&Oy(e,t);e=e.sibling}}var ct=!1,ye=!1,Ka=!1,Od=!1,ab=typeof WeakSet=="function"?WeakSet:Set,dt=null,Ja=!1,Fl=!1,Mu=!1,zh=!1;function fN(e,t,a){if(e=e.containerInfo,Lh=ll,e=bv(e),sm(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var l=o.anchorOffset,u=o.focusNode;o=o.focusOffset;try{n.nodeType,u.nodeType}catch{n=null;break e}var c=0,h=-1,g=-1,y=0,x=0,f=e,v=null;t:for(;;){for(var z;f!==n||l!==0&&f.nodeType!==3||(h=c+l),f!==u||o!==0&&f.nodeType!==3||(g=c+o),f.nodeType===3&&(c+=f.nodeValue.length),(z=f.firstChild)!==null;)v=f,f=z;for(;;){if(f===e)break t;if(v===n&&++y===l&&(h=c),v===u&&++x===o&&(g=c),(z=f.nextSibling)!==null)break;f=v,v=f.parentNode}f=z}n=h===-1||g===-1?null:{start:h,end:g}}else n=null}n=n||{start:0,end:0}}else n=null;for(Gh={focusedElem:e,selectionRange:n},ll=!1,a=(a&335544064)===a,dt=t,t=a?9270:1024;dt!==null;){if(e=dt,a&&(n=e.deletions,n!==null))for(l=0;l<n.length;l++)a&&Ch(n[l]);if(e.alternate===null&&(e.flags&2)!==0)a&&eb(e),qs(a);else{if(e.tag===22){if(n=e.alternate,e.memoizedState!==null){n!==null&&n.memoizedState===null&&a&&Ch(n),qs(a);continue}else if(n!==null&&n.memoizedState!==null){a&&eb(e),qs(a);continue}}n=e.child,(e.subtreeFlags&t)!==0&&n!==null?(n.return=e,dt=n):(a&&zy(e),qs(a))}}oa=null}function qs(e){for(;dt!==null;){var t=dt,a=e,n=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&n!==null){a=void 0,o=n.memoizedProps,n=n.memoizedState;var l=t.stateNode;try{var u=Hi(t.type,o);a=l.getSnapshotBeforeUpdate(u,n),l.__reactInternalSnapshotBeforeUpdate=a}catch(c){xe(t,t.return,c)}}break;case 3:if((o&1024)!==0){if(n=t.stateNode.containerInfo,a=n.nodeType,a===9)Xh(n);else if(a===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":Xh(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&n!==null&&(a=wn(n.memoizedProps,n.stateNode),o=t.memoizedProps,o=En(o.default,o.update),o!=="none"&&dl(n,a,o,n.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(C(163))}if(n=t.sibling,n!==null){n.return=t.return,dt=n;break}dt=t.return}}function Ry(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:Fa(e,a),n&4&&Dr(5,a);break;case 1:if(Fa(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(u){xe(a,a.return,u)}else{var o=Hi(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(u){xe(a,a.return,u)}}n&64&&Ty(a),n&512&&Pa(a,a.return);break;case 3:if(Fa(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{Dv(e,t)}catch(u){xe(a,a.return,u)}}break;case 27:t===null&&n&4&&Cy(a);case 26:case 5:Fa(e,a),t===null&&n&4&&Sh(a),n&512&&Pa(a,a.return);break;case 12:Fa(e,a);break;case 31:Fa(e,a),n&4&&Hy(e,a);break;case 13:Fa(e,a),n&4&&Uy(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=CN.bind(null,a),r5(e,a))));break;case 22:if(n=a.memoizedState!==null||ct,!n){var l=t!==null&&t.memoizedState!==null||ye;t=ct,o=ye,ct=n,(ye=l)&&!o?(n=2,(a.subtreeFlags&8772)!==0&&(n|=1),Da(e,a,n)):Fa(e,a),ct=t,ye=o}break;case 30:Fa(e,a),n&512&&Pa(a,a.return);break;case 7:n&512&&Pa(a,a.return);default:Fa(e,a)}}function Mh(e,t){for(e=e.child;e!==null;)Vy(e,t),e=e.sibling}function Vy(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var n=a.style;typeof n.setProperty=="function"?n.setProperty("display","none","important"):n.display="none"}else{var o=e.stateNode,l=e.memoizedProps.style,u=l!=null&&l.hasOwnProperty("display")?l.display:null;o.style.display=u==null||typeof u=="boolean"?"":(""+u).trim()}}catch(h){xe(e,e.return,h)}Oh(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,fe=!0}catch(h){xe(e,e.return,h)}break;case 18:try{var c=e.stateNode;t?vb(c,!0):vb(e.stateNode,!1)}catch(h){xe(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&Mh(e,t);break;default:Mh(e,t)}}function Oh(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,n=t;switch(a.tag){case 4:Vy(a,n);break e;case 22:a.memoizedState===null&&Oh(a,n);break e;default:Oh(a,n)}}e=e.sibling}}function Dy(e){var t=e.alternate;t!==null&&(e.alternate=null,Dy(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Iu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Ue=null,jt=!1;function Va(e,t,a){for(a=a.child;a!==null;)_y(e,t,a),a=a.sibling}function _y(e,t,a){if(sa&&typeof sa.onCommitFiberUnmount=="function")try{sa.onCommitFiberUnmount(Cr,a)}catch{}switch(a.tag){case 26:ye||vt(a,t),Va(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!ye&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:ye||vt(a,t),rr(a);var n=Ue,o=jt;ci(a.type)&&(Ue=a.stateNode,jt=!1),Va(e,t,a),Nw(a.stateNode,a.type,a.memoizedProps),Ue=n,jt=o;break;case 5:ye||vt(a,t),rr(a);case 6:if(a.tag===6&&rr(a),n=Ue,o=jt,Ue=null,Va(e,t,a),Ue=n,jt=o,Ue!==null)if(jt)try{(Ue.nodeType===9?Ue.body:Ue.nodeName==="HTML"?Ue.ownerDocument.body:Ue).removeChild(a.stateNode),fe=!0}catch(l){xe(a,t,l)}else try{Ue.removeChild(a.stateNode),fe=!0}catch(l){xe(a,t,l)}break;case 18:Ue!==null&&(jt?(e=Ue,bb(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),rl(e)):bb(Ue,a.stateNode));break;case 4:n=Ue,o=jt,Ue=a.stateNode.containerInfo,jt=!0,Va(e,t,a),Ue=n,jt=o;break;case 0:case 11:case 14:case 15:ri(2,a,t),ye||ri(4,a,t),Va(e,t,a);break;case 1:ye||(vt(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&Ey(a,t,n)),Va(e,t,a);break;case 21:Va(e,t,a);break;case 22:ye=(n=ye)||a.memoizedState!==null,Va(e,t,a),ye=n;break;case 30:vt(a,t),Va(e,t,a);break;case 7:ye||vt(a,t),Va(e,t,a);break;default:Va(e,t,a)}}function Hy(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{rl(e)}catch(a){xe(t,t.return,a)}}}function Uy(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{rl(e)}catch(a){xe(t,t.return,a)}}function bN(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new ab),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new ab),t;default:throw Error(C(435,e.tag))}}function Bs(e,t){var a=bN(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var o=AN.bind(null,e,n);n.then(o,o)}})}function Ht(e,t,a){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var l=n[o],u=e,c=t,h=c;e:for(;h!==null;){switch(h.tag){case 27:if(ci(h.type)){Ue=h.stateNode,jt=!1;break e}break;case 5:Ue=h.stateNode,jt=!1;break e;case 3:case 4:Ue=h.stateNode.containerInfo,jt=!0;break e}h=h.return}if(Ue===null)throw Error(C(160));_y(u,c,l),Ue=null,jt=!1,u=l.alternate,u!==null&&(u.return=null),l.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)qy(t,e,a),t=t.sibling}var _a=null;function qy(e,t,a){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(n=e.updateQueue,n=n!==null?n.events:null,n!==null))for(var l=0;l<n.length;l++){var u=n[l];u.ref.impl=u.nextImpl}Ht(t,e,a),Ut(e),o&4&&(ri(3,e,e.return),Dr(3,e),ri(5,e,e.return));break;case 1:Ht(t,e,a),Ut(e),o&512&&(ye||n===null||vt(n,n.return)),o&64&&ct&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(l=_a,Ht(t,e,a),Ut(e),o&512&&(ye||n===null||vt(n,n.return)),o&4)if(o=n!==null?n.memoizedState:null,a=e.memoizedState,n===null)if(a===null)if(e.stateNode===null)if(ct)e.stateNode=hw(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=l.ownerDocument||l;t:switch(t){case"title":n=o.getElementsByTagName("title")[0],(!n||n[Mr]||n[yt]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=o.createElement(t),o.head.insertBefore(n,o.querySelector("head > title"))),Nt(n,t,a),n[yt]=e,ht(n),t=n;break e;case"link":if(l=Eb("link","href",o).get(t+(a.href||""))){for(u=0;u<l.length;u++)if(n=l[u],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){l.splice(u,1);break t}}n=o.createElement(t),Nt(n,t,a),o.head.appendChild(n);break;case"meta":if(l=Eb("meta","content",o).get(t+(a.content||""))){for(u=0;u<l.length;u++)if(n=l[u],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){l.splice(u,1);break t}}n=o.createElement(t),Nt(n,t,a),o.head.appendChild(n);break;default:throw Error(C(468,t))}n[yt]=e,ht(n),t=n}e.stateNode=t}else ct||Kh(l,e.type,e.stateNode);else e.stateNode=Tb(l,a,e.memoizedProps);else o!==a?(o===null?(t=n.stateNode,t===null||ye||t.parentNode.removeChild(t)):o.count--,a===null?ct||Kh(l,e.type,e.stateNode):Tb(l,a,e.memoizedProps)):a===null&&e.stateNode!==null&&zd(e,e.memoizedProps,n.memoizedProps);break;case 27:Ht(t,e,a),Ut(e),o&512&&(ye||n===null||vt(n,n.return)),n!==null&&o&4&&zd(e,e.memoizedProps,n.memoizedProps);break;case 5:if(l=Ka,Ka=!1,Ht(t,e,a),Ka=l,Ut(e),o&512&&(ye||n===null||vt(n,n.return)),e.flags&32){t=e.stateNode;try{Fo(t,""),fe=!0}catch(y){xe(e,e.return,y)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,zd(e,t,n!==null?n.memoizedProps:t)),o&1024&&(Od=!0);break;case 6:if(Ht(t,e,a),Ut(e),o&4){if(e.stateNode===null)throw Error(C(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,fe=!0}catch(y){xe(e,e.return,y)}}break;case 3:if(fe=!1,ru=null,l=_a,_a=Nr(t.containerInfo),Ht(t,e,a),_a=l,Ut(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{rl(t.containerInfo)}catch(y){xe(e,e.return,y)}Od&&(Od=!1,By(e)),fe=!1;break;case 4:o=Ka,Ka=ct,n=sf(),l=_a,_a=Nr(e.stateNode.containerInfo),Ht(t,e,a),Ut(e),_a=l,fe&&Fl&&(Mu=!0),fe=n,Ka=o;break;case 12:Ht(t,e,a),Ut(e);break;case 31:Ht(t,e,a),Ut(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Bs(e,t)));break;case 13:Ht(t,e,a),Ut(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(ec=ra()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Bs(e,t)));break;case 22:l=e.memoizedState!==null,u=n!==null&&n.memoizedState!==null;var c=ct,h=ye,g=Ka;ct=c||l,Ka=g||l,ye=h||u,Ht(t,e,a),ye=h,Ka=g,ct=c,Ut(e),o&8192&&(t=e.stateNode,t._visibility=l?t._visibility&-2:t._visibility|1,!l||n===null||u||ct||ye||(t=u||ye,a=ct,n=ye,ct=l||ct,ye=t,Un(e,2),ct=a,ye=n),!l&&Ka||Mh(e,l)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,Bs(e,a))));break;case 19:Ht(t,e,a),Ut(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Bs(e,t)));break;case 30:o&512&&(ye||n===null||vt(n,n.return)),o=sf(),l=Fl,u=(a&335544064)===a,c=e.memoizedProps,Fl=u&&En(c.default,c.update)!=="none",Ht(t,e,a),Ut(e),u&&n!==null&&fe&&(e.flags|=4),Fl=l,fe=o;break;case 21:break;case 7:o&512&&(ye||n===null||vt(n,n.return)),n&&n.stateNode!==null&&(n.stateNode._fragmentFiber=e);default:Ht(t,e,a),Ut(e)}}function Ut(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(ky(n)){a=n;break}n=n.return}n=null;for(var o=e.return;o!==null;){if(Dm(o)){var l=o.stateNode;n===null?n=[l]:n.push(l)}if(Vm(o))break;o=o.return}var u=n;if(a==null)throw Error(C(160));switch(a.tag){case 27:var c=a.stateNode,h=Md(e);Au(e,h,c,u);break;case 5:var g=a.stateNode;a.flags&32&&(Fo(g,""),a.flags&=-33);var y=Md(e);Au(e,y,g,u);break;case 3:case 4:var x=a.stateNode.containerInfo,f=Md(e);Th(e,f,x,u);break;default:throw Error(C(161))}}catch(v){xe(e,e.return,v)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function By(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;By(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,ll=!0,t.reset(),ll=!1),e=e.sibling}}function No(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)Iy(t,e),t=t.sibling;else Oy(t,!1)}function Iy(e,t){var a=e.alternate;if(a===null)Eh(e,!1);else switch(e.tag){case 3:if(zh=Ja=!1,tb(),No(t,e),!Ja&&!Mu){if(e=Wa,e!==null)for(var n=0;n<e.length;n+=3){a=e[n];var o=e[n+1];pw(a,e[n+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),zh=!0}Wa=null;break;case 5:No(t,e);break;case 4:n=Ja,Ja=!1,No(t,e),Ja&&(Mu=!0),Ja=n;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Eh(e,!1):No(t,e));break;case 30:n=Ja,o=tb(),Ja=!1,No(t,e),Ja&&(e.flags|=4);var l=e.memoizedProps,u=e.stateNode;t=wn(l,u),u=wn(a.memoizedProps,u);var c=En(l.default,l.update);c==="none"?t=!1:(l=a.memoizedState,a.memoizedState=null,a=e.child,Qt=0,t=_m(e,a,t,u,c,l,!0),Qt!==(l===null?0:l.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(el(e,e.memoizedProps.onUpdate),Wa=o):o!==null&&(o.push.apply(o,Wa),Wa=o),Ja=(e.flags&32)!==0?!0:n;break;default:No(t,e)}}function Fa(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Ry(e,t.alternate,t),t=t.sibling}function Un(e,t){for(e=e.child;e!==null;){var a=e,n=t;switch(a.tag){case 0:case 11:case 14:case 15:ri(4,a,a.return),Un(a,n);break;case 1:vt(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&Ey(a,a.return,o),Un(a,n);break;case 27:(n&2)!==0&&Nw(a.stateNode,a.type,a.memoizedProps);case 5:vt(a,a.return),a.tag!==5&&a.tag!==27||rr(a),Un(a,n);break;case 6:rr(a);break;case 26:vt(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||ye||o.parentNode.removeChild(o),Un(a,n);break;case 22:a.memoizedState===null&&Un(a,n);break;case 30:vt(a,a.return),Un(a,n);break;case 7:vt(a,a.return);default:Un(a,n)}e=e.sibling}}function Da(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var n=t.alternate,o=e,l=t,u=l.flags,c=(a&1)!==0;switch(l.tag){case 0:case 11:case 15:Da(o,l,a),Dr(4,l);break;case 1:if(Da(o,l,a),n=l,o=n.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch(y){xe(n,n.return,y)}if(n=l,o=n.updateQueue,o!==null){var h=n.stateNode;try{var g=o.shared.hiddenCallbacks;if(g!==null)for(o.shared.hiddenCallbacks=null,o=0;o<g.length;o++)Vv(g[o],h)}catch(y){xe(n,n.return,y)}}c&&u&64&&Ty(l),Pa(l,l.return);break;case 27:(a&2)!==0&&Cy(l);case 5:l.tag!==5&&l.tag!==27||Wf(l),Da(o,l,a),c&&n===null&&u&4&&Sh(l),Pa(l,l.return);break;case 6:Wf(l);break;case 26:h=l.stateNode,l.memoizedState!==null||h===null||ct||Kh(Nr(h.ownerDocument),l.type,h),Da(o,l,a),c&&n===null&&u&4&&Sh(l),Pa(l,l.return);break;case 12:Da(o,l,a);break;case 31:Da(o,l,a),c&&u&4&&Hy(o,l);break;case 13:Da(o,l,a),c&&u&4&&Uy(o,l);break;case 22:l.memoizedState===null&&Da(o,l,a),Pa(l,l.return);break;case 30:Da(o,l,a),Pa(l,l.return);break;case 7:Pa(l,l.return);default:Da(o,l,a)}t=t.sibling}}function Hm(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Rr(a))}function Um(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Rr(e))}function wa(e,t,a,n){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)Ly(e,t,a,n),t=t.sibling;else o&&My(t)}function Ly(e,t,a,n){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&nu(t);var l=t.flags;switch(t.tag){case 0:case 11:case 15:wa(e,t,a,n),l&2048&&Dr(9,t);break;case 1:wa(e,t,a,n);break;case 3:wa(e,t,a,n),o&&zh&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),l&2048&&(l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&Rr(l)));break;case 12:if(l&2048){wa(e,t,a,n),l=t.stateNode;try{var u=t.memoizedProps,c=u.id,h=u.onPostCommit;typeof h=="function"&&h(c,t.alternate===null?"mount":"update",l.passiveEffectDuration,-0)}catch(g){xe(t,t.return,g)}}else wa(e,t,a,n);break;case 31:wa(e,t,a,n);break;case 13:wa(e,t,a,n);break;case 23:break;case 22:u=t.stateNode,c=t.alternate,t.memoizedState!==null?(o&&c!==null&&c.memoizedState===null&&nu(c),u._visibility&2?wa(e,t,a,n):sr(e,t)):(o&&c!==null&&c.memoizedState!==null&&nu(t),u._visibility&2?wa(e,t,a,n):(u._visibility|=2,To(e,t,a,n,(t.subtreeFlags&10256)!==0||!1))),l&2048&&Hm(c,t);break;case 24:wa(e,t,a,n),l&2048&&Um(t.alternate,t);break;case 30:o&&(l=t.alternate,l!==null&&(rn(l.child,!0),rn(t.child,!0))),wa(e,t,a,n);break;default:wa(e,t,a,n)}}function To(e,t,a,n,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var l=e,u=t,c=a,h=n,g=u.flags;switch(u.tag){case 0:case 11:case 15:To(l,u,c,h,o),Dr(8,u);break;case 23:break;case 22:var y=u.stateNode;u.memoizedState!==null?y._visibility&2?To(l,u,c,h,o):sr(l,u):(y._visibility|=2,To(l,u,c,h,o)),o&&g&2048&&Hm(u.alternate,u);break;case 24:To(l,u,c,h,o),o&&g&2048&&Um(u.alternate,u);break;default:To(l,u,c,h,o)}t=t.sibling}}function sr(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,o=n.flags;switch(n.tag){case 22:sr(a,n),o&2048&&Hm(n.alternate,n);break;case 24:sr(a,n),o&2048&&Um(n.alternate,n);break;default:sr(a,n)}t=t.sibling}}var Ni=8192;function wi(e,t,a){if(e.subtreeFlags&Ni)for(e=e.child;e!==null;)Gy(e,t,a),e=e.sibling}function Gy(e,t,a){switch(e.tag){case 26:wi(e,t,a),e.flags&Ni&&(e.memoizedState!==null?$5(a,_a,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Cb(a,e)));break;case 5:wi(e,t,a),e.flags&Ni&&(e=e.stateNode,(t&335544128)===t&&Cb(a,e));break;case 3:case 4:var n=_a;_a=Nr(e.stateNode.containerInfo),wi(e,t,a),_a=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=Ni,Ni=16777216,wi(e,t,a),Ni=n):wi(e,t,a));break;case 30:if((e.flags&Ni)!==0&&(n=e.memoizedProps.name,n!=null&&n!=="auto")){var o=e.stateNode;o.paired=null,oa===null&&(oa=new Map),oa.set(n,o)}wi(e,t,a);break;default:wi(e,t,a)}}function Yy(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Yl(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];dt=n,Xy(n,e)}Yy(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)jy(e),e=e.sibling}function jy(e){switch(e.tag){case 0:case 11:case 15:Yl(e),e.flags&2048&&ri(9,e,e.return);break;case 3:Yl(e);break;case 12:Yl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,iu(e)):Yl(e);break;default:Yl(e)}}function iu(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];dt=n,Xy(n,e)}Yy(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:ri(8,t,t.return),iu(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,iu(t));break;default:iu(t)}e=e.sibling}}function Xy(e,t){for(;dt!==null;){var a=dt;switch(a.tag){case 0:case 11:case 15:ri(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:Rr(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,dt=n;else e:for(a=e;dt!==null;){n=dt;var o=n.sibling,l=n.return;if(Dy(n),n===a){dt=null;break e}if(o!==null){o.return=l,dt=o;break e}dt=l}}}var vN={getCacheForType:function(e){var t=wt(Pe),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return wt(Pe).controller.signal}},yN=typeof WeakMap=="function"?WeakMap:Map,be=0,Ce=null,ce=null,he=0,we=0,aa=null,jn=!1,hl=!1,qm=!1,Sn=0,je=0,si=0,zi=0,Ou=0,la=0,Wo=0,ur=null,Xt=null,Rh=!1,ec=0,Qy=0,Ru=1/0,Vu=null,ei=null,Ge=0,Ua=null,Ui=null,ln=0,Vh=0,Dh=null,Zy=null,Xo=null,Qo=null,Zo=null,cr=0,ou=null;function ca(){return(be&2)!==0&&he!==0?he&-he:W.T!==null?Im():Pb()}function Ky(){if(la===0)if((he&536870912)===0||re){var e=ks;ks<<=1,(ks&3932160)===0&&(ks=262144),la=e}else la=536870912;return e=St.current,e!==null&&(e.flags|=32),la}function el(e,t){if(t!=null){var a=e.stateNode,n=a.ref;n===null&&(n=a.ref=fw(wn(e.memoizedProps,a))),Qo===null&&(Qo=[]),Qo.push(t.bind(null,n))}}function Kt(e,t,a){(e===Ce&&(we===2||we===9)||e.cancelPendingCommit!==null)&&(tl(e,0),Xn(e,he,la,!1)),zr(e,a),((be&2)===0||e!==Ce)&&(e===Ce&&((be&2)===0&&(zi|=a),je===4&&Xn(e,he,la,!1)),un(e))}function Jy(e,t,a){if((be&6)!==0)throw Error(C(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||Ar(e,t),o=n?xN(e,t):Rd(e,t,!0),l=n;do{if(o===0){hl&&!n&&Xn(e,t,0,!1);break}else{if(a=e.current.alternate,l&&!wN(a)){o=Rd(e,t,!1),l=!1;continue}if(o===2){if(l=t,e.errorRecoveryDisabledLanes&l)var u=0;else u=e.pendingLanes&-536870913,u=u!==0?u:u&536870912?536870912:0;if(u!==0){t=u;e:{var c=e;o=ur;var h=c.current.memoizedState.isDehydrated;if(h&&(tl(c,u).flags|=256),u=Rd(c,u,!1),u!==2&&u!==6){if(qm&&!h){c.errorRecoveryDisabledLanes|=l,zi|=l,o=4;break e}l=Xt,Xt=o,l!==null&&(Xt===null?Xt=l:Xt.push.apply(Xt,l))}o=u}if(l=!1,o!==2)continue}}if(o===1){tl(e,0),Xn(e,t,0,!0);break}e:{switch(n=e,l=o,l){case 0:case 1:throw Error(C(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:Xn(n,t,la,!jn);break e;case 2:Xt=null;break;case 3:case 5:break;default:throw Error(C(329))}if((t&62914560)===t&&(o=ec+300-ra(),10<o)){if(Xn(n,t,la,!jn),Bu(n,0,!0)!==0)break e;ln=t,n.timeoutHandle=Gm(nb.bind(null,n,a,Xt,Vu,Rh,t,la,zi,Wo,jn,l,"Throttled",-0,0),o);break e}nb(n,a,Xt,Vu,Rh,t,la,zi,Wo,jn,l,null,-0,0)}}break}while(!0);un(e)}function nb(e,t,a,n,o,l,u,c,h,g,y,x,f,v){e.timeoutHandle=-1;var z=t.subtreeFlags,T=(l&335544064)===l;if(x=null,(T||z&8192||(z&16785408)===16785408)&&(x={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:tn},oa=null,Gy(t,l,x),T&&(z=x,T=e.containerInfo,T=(T.nodeType===9?T:T.ownerDocument).__reactViewTransition,T!=null&&(z.count++,z.waitingForViewTransition=!0,z=Sr.bind(z),T.finished.then(z,z))),z=(l&62914560)===l?ec-ra():(l&4194048)===l?Qy-ra():0,z=x5(x,z),z!==null)){ln=l,e.cancelPendingCommit=z(ob.bind(null,e,t,l,a,n,o,u,c,h,g,y,x,null,f,v)),Xn(e,l,u,!g);return}ob(e,t,l,a,n,o,u,c,h,g,y,x)}function wN(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var o=a[n],l=o.getSnapshot;o=o.value;try{if(!da(l(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Xn(e,t,a,n){t=Qb(e,t),t&=~Ou,t&=~zi,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var o=t;0<o;){var l=31-ua(o),u=1<<l;n[l]=-1,o&=~u}a!==0&&Kb(e,a,t)}function tc(){return(be&6)===0?(_r(0,!1),!1):!0}function Bm(){if(ce!==null){if(we===0)var e=ce.return;else e=ce,fn=Gi=null,Nm(e),Go=null,br=0,e=ce;for(;e!==null;)Sy(e.alternate,e),e=e.return;ce=null}}function tl(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,LN(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),ln=0,Bm(),Ce=e,ce=a=bn(e.current,null),he=t,we=0,aa=null,jn=!1,hl=Ar(e,t),qm=!1,Wo=la=Ou=zi=si=je=0,Xt=ur=null,Rh=!1,Sn=Qb(e,t),ju(),a}function Fy(e,t){ie=null,W.H=Eu,t===cl||t===Zu?(t=zf(),we=3):t===gm?(t=zf(),we=4):we=t===Mm?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,aa=t,ce===null&&(je=1,ku(e,Ta(t,e.current)))}function Py(){var e=St.current;return e===null?!0:(he&4194048)===he?zt===null:(he&62914560)===he||(he&536870912)!==0?e===zt:!1}function Wy(){var e=W.H;return W.H=Eu,e===null?Eu:e}function ew(){var e=W.A;return W.A=vN,e}function Du(){je=4,jn||(he&4194048)!==he&&St.current!==null||(hl=!0),(si&134217727)===0&&(zi&134217727)===0||Ce===null||Xn(Ce,he,la,!1)}function Rd(e,t,a){var n=be;be|=2;var o=Wy(),l=ew();(Ce!==e||he!==t)&&(Vu=null,tl(e,t)),t=!1;var u=je;e:do try{if(we!==0&&ce!==null){var c=ce,h=aa;switch(we){case 8:Bm(),u=6;break e;case 3:case 2:case 9:case 6:St.current===null&&(t=!0);var g=we;if(we=0,aa=null,Uo(e,c,h,g),a&&hl){u=0;break e}break;default:g=we,we=0,aa=null,Uo(e,c,h,g)}}$N(),u=je;break}catch(y){Fy(e,y)}while(!0);return t&&e.shellSuspendCounter++,fn=Gi=null,be=n,W.H=o,W.A=l,ce===null&&(Ce=null,he=0,ju()),u}function $N(){for(;ce!==null;)tw(ce)}function xN(e,t){var a=be;be|=2;var n=Wy(),o=ew();Ce!==e||he!==t?(Vu=null,Ru=ra()+500,tl(e,t)):hl=Ar(e,t);e:do try{if(we!==0&&ce!==null){t=ce;var l=aa;t:switch(we){case 1:we=0,aa=null,Uo(e,t,l,1);break;case 2:case 9:if(Af(l)){we=0,aa=null,ib(t);break}t=function(){we!==2&&we!==9||Ce!==e||(we=7),un(e)},l.then(t,t);break e;case 3:we=7;break e;case 4:we=5;break e;case 7:Af(l)?(we=0,aa=null,ib(t)):(we=0,aa=null,Uo(e,t,l,7));break;case 5:var u=null;switch(ce.tag){case 26:u=ce.memoizedState;case 5:case 27:var c=ce;if(u?Ew(u):c.stateNode.complete){we=0,aa=null;var h=c.sibling;if(h!==null)ce=h;else{var g=c.return;g!==null?(ce=g,ac(g)):ce=null}break t}}we=0,aa=null,Uo(e,t,l,5);break;case 6:we=0,aa=null,Uo(e,t,l,6);break;case 8:Bm(),je=6;break e;default:throw Error(C(462))}}NN();break}catch(y){Fy(e,y)}while(!0);return fn=Gi=null,W.H=n,W.A=o,be=a,ce!==null?0:(Ce=null,he=0,ju(),je)}function NN(){for(;ce!==null&&!B$();)tw(ce)}function tw(e){var t=Ny(e.alternate,e,Sn);e.memoizedProps=e.pendingProps,t===null?ac(e):ce=t}function ib(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=Xf(a,t,t.pendingProps,t.type,void 0,he);break;case 11:t=Xf(a,t,t.pendingProps,t.type.render,t.ref,he);break;case 5:Nm(t);var n=t;n===mt&&(re?(yu(n),n.tag===5&&n.stateNode!=null&&(Oe=n.stateNode)):(yu(n),re=!0));default:Sy(a,t),t=ce=Tv(t,Sn),t=Ny(a,t,Sn)}e.memoizedProps=e.pendingProps,t===null?ac(e):ce=t}function Uo(e,t,a,n){fn=Gi=null,Nm(t),Go=null,br=0;var o=t.return;try{if(cN(e,o,t,a,he)){je=1,ku(e,Ta(a,e.current)),ce=null;return}}catch(l){if(o!==null)throw ce=o,l;je=1,ku(e,Ta(a,e.current)),ce=null;return}t.flags&32768?(re||n===1?e=!0:hl||(he&536870912)!==0?e=!1:(jn=e=!0,(n===2||n===9||n===3||n===6)&&(n=St.current,n!==null&&n.tag===13&&(n.flags|=16384))),aw(t,e)):ac(t)}function ac(e){var t=e;do{if((t.flags&32768)!==0){aw(t,jn);return}e=t.return;var a=pN(t.alternate,t,Sn);if(a!==null){ce=a;return}if(t=t.sibling,t!==null){ce=t;return}ce=t=e}while(t!==null);je===0&&(je=5)}function aw(e,t){do{var a=gN(e.alternate,e);if(a!==null){a.flags&=32767,ce=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){ce=e;return}ce=e=a}while(e!==null);je=6,ce=null}function ob(e,t,a,n,o,l,u,c,h,g,y,x){e.cancelPendingCommit=null;do nc();while(Ge!==0);if((be&6)!==0)throw Error(C(327));if(t!==null){if(t===e.current)throw Error(C(177));e===Ce&&(ce=Ce=null,he=0),Ui=t,Ua=e,ln=a,Dh=o,Zy=n,SN(e,t,a,u,c,h,x)}}function SN(e,t,a,n,o,l,u){var c=t.lanes|t.childLanes;if(Vh=c,c|=um,J$(e,a,c,n,o,l),Qo=null,(a&335544064)===a?(Zo=Px(e),n=10262):(Zo=null,n=10256),(t.subtreeFlags&n)!==0||(t.flags&n)!==0?(e.callbackNode=null,e.callbackPriority=0,zN(pu,function(){return qh(),null})):(e.callbackNode=null,e.callbackPriority=0),zu=!1,n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=W.T,W.T=null,o=ve.p,ve.p=2,l=be,be|=4;try{fN(e,t,a)}finally{be=l,ve.p=o,W.T=n}}Ge=1,zu?Xo=ZN(u,e.containerInfo,Zo,_h,Hh,EN,Uh,qh,TN,null,null):(_h(),Hh(),Uh())}function TN(e){if(Ge!==0){var t=Ua.onRecoverableError;t(e,{componentStack:null})}}function EN(){Ge===3&&(Ge=0,Iy(Ui,Ua),Ge=4)}function _h(){if(Ge===1){Ge=0;var e=Ua,t=Ui,a=ln,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=W.T,W.T=null;var o=ve.p;ve.p=2;var l=be;be|=4;try{Fl=Mu=!1,qy(t,e,a),a=Gh;var u=bv(e.containerInfo),c=a.focusedElem,h=a.selectionRange;if(u!==c&&c&&c.ownerDocument&&fv(c.ownerDocument.documentElement,c)){if(h!==null&&sm(c)){var g=h.start,y=h.end;if(y===void 0&&(y=g),"selectionStart"in c)c.selectionStart=g,c.selectionEnd=Math.min(y,c.value.length);else{var x=c.ownerDocument||document,f=x&&x.defaultView||window;if(f.getSelection){var v=f.getSelection(),z=c.textContent.length,T=Math.min(h.start,z),V=h.end===void 0?T:Math.min(h.end,z);!v.extend&&T>V&&(u=V,V=T,T=u);var w=$f(c,T),b=$f(c,V);if(w&&b&&(v.rangeCount!==1||v.anchorNode!==w.node||v.anchorOffset!==w.offset||v.focusNode!==b.node||v.focusOffset!==b.offset)){var N=x.createRange();N.setStart(w.node,w.offset),v.removeAllRanges(),T>V?(v.addRange(N),v.extend(b.node,b.offset)):(N.setEnd(b.node,b.offset),v.addRange(N))}}}}for(x=[],v=c;v=v.parentNode;)v.nodeType===1&&x.push({element:v,left:v.scrollLeft,top:v.scrollTop});for(typeof c.focus=="function"&&c.focus(),c=0;c<x.length;c++){var E=x[c];E.element.scrollLeft=E.left,E.element.scrollTop=E.top}}ll=!!Lh,Gh=Lh=null}finally{be=l,ve.p=o,W.T=n}}e.current=t,Ge=2}}function Hh(){if(Ge===2){Ge=0;var e=Ua,t=Ui,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=W.T,W.T=null;var n=ve.p;ve.p=2;var o=be;be|=4;try{Ry(e,t.alternate,t)}finally{be=o,ve.p=n,W.T=a}}Ge=3}}function Uh(){if(Ge===4||Ge===3){Ge=0;var e=Xo;Xo=null,I$();var t=Ua,a=Ui,n=ln,o=Zy,l=(n&335544064)===n?10262:10256;if((a.subtreeFlags&l)!==0||(a.flags&l)!==0?Ge=5:(Ge=0,Ui=Ua=null,nw(t,t.pendingLanes)),l=t.pendingLanes,l===0&&(ei=null),am(n),a=a.stateNode,sa&&typeof sa.onCommitFiberRoot=="function")try{sa.onCommitFiberRoot(Cr,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=W.T,l=ve.p,ve.p=2,W.T=null;try{for(var u=t.onRecoverableError,c=0;c<o.length;c++){var h=o[c];u(h.value,{componentStack:h.stack})}}finally{W.T=a,ve.p=l}}if(o=Qo,u=Zo,Zo=null,o!==null&&(Qo=null,u===null&&(u=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(u),a!==void 0&&e.finished.finally(a);(ln&3)!==0&&nc(),un(t),l=t.pendingLanes,(n&261930)!==0&&(l&42)!==0?t===ou?cr++:(cr=0,ou=t):(cr=0,ou=null),_r(0,!1)}}function nw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Rr(t)))}function nc(){return Xo!==null&&(Xo.skipTransition(),Xo=null),_h(),Hh(),Uh(),qh()}function qh(){if(Ge!==5)return!1;var e=Ua,t=Vh;Vh=0;var a=am(ln),n=W.T,o=ve.p;try{ve.p=32>a?32:a,W.T=null,a=Dh,Dh=null;var l=Ua,u=ln;if(Ge=0,Ui=Ua=null,ln=0,(be&6)!==0)throw Error(C(331));var c=be;if(be|=4,jy(l.current),Ly(l,l.current,u,a),be=c,_r(0,!1),sa&&typeof sa.onPostCommitFiberRoot=="function")try{sa.onPostCommitFiberRoot(Cr,l)}catch{}return!0}finally{ve.p=o,W.T=n,nw(e,t)}}function lb(e,t,a){t=Ta(a,t),t=vh(e.stateNode,t,2),e=Fn(e,t,2),e!==null&&(zr(e,2),un(e))}function xe(e,t,a){if(e.tag===3)lb(e,e,a);else for(;t!==null;){if(t.tag===3){lb(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(ei===null||!ei.has(n))){e=Ta(a,e),a=vy(2),n=Fn(t,a,2),n!==null&&(yy(a,n,t,e),zr(n,2),un(n));break}}t=t.return}}function Vd(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new yN;var o=new Set;n.set(t,o)}else o=n.get(t),o===void 0&&(o=new Set,n.set(t,o));o.has(a)||(qm=!0,o.add(a),e=kN.bind(null,e,t,a),t.then(e,e))}function kN(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Ce===e&&(he&a)===a&&((je===4||je===3&&(he&62914560)===he&&300>ra()-ec)&&(be&2)===0?tl(e,0):Ou|=a,Wo===he&&(Wo=0)),un(e)}function iw(e,t){t===0&&(t=Zb()),e=Li(e,t),e!==null&&(zr(e,t),un(e))}function CN(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),iw(e,a)}function AN(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(C(314))}n!==null&&n.delete(t),iw(e,a)}function zN(e,t){return em(e,t)}var al=null,Eo=null,Bh=!1,_u=!1,Dd=!1,Qn=0;function un(e){e!==Eo&&e.next===null&&(Eo===null?al=Eo=e:Eo=Eo.next=e),_u=!0,Bh||(Bh=!0,ON())}function _r(e,t){if(!Dd&&_u){Dd=!0;do for(var a=!1,n=al;n!==null;){if(!t)if(e!==0){var o=n.pendingLanes;if(o===0)var l=0;else{var u=n.suspendedLanes,c=n.pingedLanes;l=(1<<31-ua(42|e)+1)-1,l&=o&~(u&~c),l=l&201326741?l&201326741|1:l?l|2:0}l!==0&&(a=!0,rb(n,l))}else l=he,l=Bu(n,n===Ce?l:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(l&3)===0||Ar(n,l)||(a=!0,rb(n,l));n=n.next}while(a);Dd=!1}}function MN(){ow()}function ow(){_u=Bh=!1;var e=0;Qn!==0&&IN()&&(e=Qn);for(var t=ra(),a=null,n=al;n!==null;){var o=n.next,l=lw(n,t);l===0?(n.next=null,a===null?al=o:a.next=o,o===null&&(Eo=a)):(a=n,(e!==0||(l&3)!==0)&&(_u=!0)),n=o}Ge!==0&&Ge!==5||_r(e,!1),Qn!==0&&(Qn=0)}function lw(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,o=e.expirationTimes,l=e.pendingLanes&-62914561;0<l;){var u=31-ua(l),c=1<<u,h=o[u];h===-1?((c&a)===0||(c&n)!==0)&&(o[u]=K$(c,t)):h<=t&&(e.expiredLanes|=c),l&=~c}if(t=Ce,a=he,a=Bu(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(we===2||we===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&md(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Ar(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&md(n),am(a)){case 2:case 8:a=jb;break;case 32:a=pu;break;case 268435456:a=Xb;break;default:a=pu}return n=rw.bind(null,e),a=em(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&md(n),e.callbackPriority=2,e.callbackNode=null,2}function rw(e,t){if(Ge!==0&&Ge!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(nc()&&e.callbackNode!==a)return null;var n=he;return n=Bu(e,e===Ce?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:(Jy(e,n,t),lw(e,ra()),e.callbackNode!=null&&e.callbackNode===a?rw.bind(null,e):null)}function rb(e,t){if(nc())return null;Jy(e,t,!0)}function ON(){GN(function(){(be&6)!==0?em(Yb,MN):ow()})}function Im(){if(Qn===0){var e=Vi;e===0&&(e=Es,Es<<=1,(Es&261888)===0&&(Es=256)),Qn=e}return Qn}function sb(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Qs(e)}function RN(e,t,a,n,o){if(t==="submit"&&a&&a.stateNode===o){var l=sb((o[Ft]||null).action),u=n.submitter;u&&(t=(t=u[Ft]||null)?sb(t.formAction):u.getAttribute("formAction"),t!==null&&(l=t,u=null));var c=new Lu("action","action",null,n,o);e.push({event:c,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(Qn!==0){var h=new FormData(o,u);fh(a,{pending:!0,data:h,method:o.method,action:l},null,h)}}else typeof l=="function"&&(c.preventDefault(),h=new FormData(o,u),fh(a,{pending:!0,data:h,method:o.method,action:l},l,h))},currentTarget:o}]})}}for(Is=0;Is<oh.length;Is++)Ls=oh[Is],ub=Ls.toLowerCase(),cb=Ls[0].toUpperCase()+Ls.slice(1),qa(ub,"on"+cb);var Ls,ub,cb,Is;qa(yv,"onAnimationEnd");qa(wv,"onAnimationIteration");qa($v,"onAnimationStart");qa("dblclick","onDoubleClick");qa("focusin","onFocus");qa("focusout","onBlur");qa(Yx,"onTransitionRun");qa(jx,"onTransitionStart");qa(Xx,"onTransitionCancel");qa(xv,"onTransitionEnd");Jo("onMouseEnter",["mouseout","mouseover"]);Jo("onMouseLeave",["mouseout","mouseover"]);Jo("onPointerEnter",["pointerout","pointerover"]);Jo("onPointerLeave",["pointerout","pointerover"]);Bi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Bi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Bi("onBeforeInput",["compositionend","keypress","textInput","paste"]);Bi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Bi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Bi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var wr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),VN=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(wr));function sw(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],o=n.event;n=n.listeners;e:{var l=void 0;if(t)for(var u=n.length-1;0<=u;u--){var c=n[u],h=c.instance,g=c.currentTarget;if(c=c.listener,h!==l&&o.isPropagationStopped())break e;l=c,o.currentTarget=g;try{l(o)}catch(y){fu(y)}o.currentTarget=null,l=h}else for(u=0;u<n.length;u++){if(c=n[u],h=c.instance,g=c.currentTarget,c=c.listener,h!==l&&o.isPropagationStopped())break e;l=c,o.currentTarget=g;try{l(o)}catch(y){fu(y)}o.currentTarget=null,l=h}}}}function ue(e,t){var a=t[nf];a===void 0&&(a=t[nf]=new Set);var n=e+"__bubble";a.has(n)||(uw(t,e,2,!1),a.add(n))}function _d(e,t,a){var n=0;t&&(n|=4),uw(a,e,n,t)}var Gs="_reactListening"+Math.random().toString(36).slice(2);function Lm(e){if(!e[Gs]){e[Gs]=!0,ev.forEach(function(a){a!=="selectionchange"&&(VN.has(a)||_d(a,!1,e),_d(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Gs]||(t[Gs]=!0,_d("selectionchange",!1,t))}}function uw(e,t,a,n){switch(Rw(t)){case 2:var o=E5;break;case 8:o=k5;break;default:o=Km}a=o.bind(null,t,a,e),o=void 0,!th||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),n?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function Hd(e,t,a,n,o){var l=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var u=n.tag;if(u===3||u===4){var c=n.stateNode.containerInfo;if(c===o)break;if(u===4)for(u=n.return;u!==null;){var h=u.tag;if((h===3||h===4)&&u.stateNode.containerInfo===o)return;u=u.return}for(;c!==null;){if(u=Si(c),u===null)return;if(h=u.tag,h===5||h===6||h===26||h===27){n=l=u;continue e}c=c.parentNode}}n=n.return}sv(function(){var g=l,y=im(a),x=[];e:{var f=Nv.get(e);if(f!==void 0){var v=Lu,z=e;switch(e){case"keypress":if(Ks(a)===0)break e;case"keydown":case"keyup":v=wx;break;case"focusin":z="focus",v=yd;break;case"focusout":z="blur",v=yd;break;case"beforeblur":case"afterblur":v=yd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":v=hf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":v=sx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":v=Tx;break;case yv:case wv:case $v:v=dx;break;case xv:v=kx;break;case"scroll":case"scrollend":v=lx;break;case"wheel":v=Ax;break;case"copy":case"cut":case"paste":v=mx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":v=pf;break;case"submit":v=Nx;break;case"toggle":case"beforetoggle":v=Mx}var T=(t&4)!==0,V=!T&&(e==="scroll"||e==="scrollend"),w=T?f!==null?f+"Capture":null:f;T=[];for(var b=g,N;b!==null;){var E=b;if(N=E.stateNode,E=E.tag,E!==5&&E!==26&&E!==27||N===null||w===null||(E=hr(b,w),E!=null&&T.push($r(b,E,N))),V)break;b=b.return}0<T.length&&(f=new v(f,z,null,a,y),x.push({event:f,listeners:T}))}}if((t&7)===0){e:{if(v=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",v&&a!==eh&&(z=a.relatedTarget||a.fromElement)&&(Si(z)||z[sl]))break e;(f||v)&&(z=y.window===y?y:(v=y.ownerDocument)?v.defaultView||v.parentWindow:window,f?(v=a.relatedTarget||a.toElement,f=g,v=v?Si(v):null,v!==null&&(V=kr(v),T=v.tag,v!==V||T!==5&&T!==27&&T!==6)&&(v=null)):(f=null,v=g),f!==v&&(T=hf,E="onMouseLeave",w="onMouseEnter",b="mouse",(e==="pointerout"||e==="pointerover")&&(T=pf,E="onPointerLeave",w="onPointerEnter",b="pointer"),V=f==null?z:Kl(f),N=v==null?z:Kl(v),z=new T(E,b+"leave",f,a,y),z.target=V,z.relatedTarget=N,E=null,Si(y)===g&&(T=new T(w,b+"enter",v,a,y),T.target=N,T.relatedTarget=V,E=T),V=E,T=f&&v?Ld(f,v,DN):null,f!==null&&db(x,z,f,T,!1),v!==null&&V!==null&&db(x,V,v,T,!0)))}e:{if(f=g?Kl(g):window,v=f.nodeName&&f.nodeName.toLowerCase(),v==="select"||v==="input"&&f.type==="file")var R=vf;else if(bf(f))if(pv)R=Ix;else{R=qx;var F=Ux}else v=f.nodeName,!v||v.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?g&&nm(g.elementType)&&(R=vf):R=Bx;if(R&&(R=R(e,g))){mv(x,R,a,y);break e}F&&F(e,f,g)}switch(F=g?Kl(g):window,e){case"focusin":(bf(F)||F.contentEditable==="true")&&(Oo=F,nh=g,er=null);break;case"focusout":er=nh=Oo=null;break;case"mousedown":ih=!0;break;case"contextmenu":case"mouseup":case"dragend":ih=!1,xf(x,a,y);break;case"selectionchange":if(Gx)break;case"keydown":case"keyup":xf(x,a,y)}var L;if(rm)e:{switch(e){case"compositionstart":var Y="onCompositionStart";break e;case"compositionend":Y="onCompositionEnd";break e;case"compositionupdate":Y="onCompositionUpdate";break e}Y=void 0}else Mo?dv(e,a)&&(Y="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(Y="onCompositionStart");Y&&(cv&&a.locale!=="ko"&&(Mo||Y!=="onCompositionStart"?Y==="onCompositionEnd"&&Mo&&(L=uv()):(Gn=y,om="value"in Gn?Gn.value:Gn.textContent,Mo=!0)),F=Hu(g,Y),0<F.length&&(Y=new mf(Y,e,null,a,y),x.push({event:Y,listeners:F}),L?Y.data=L:(L=hv(a),L!==null&&(Y.data=L)))),(L=Rx?Vx(e,a):Dx(e,a))&&(Y=Hu(g,"onBeforeInput"),0<Y.length&&(F=new mf("onBeforeInput","beforeinput",null,a,y),x.push({event:F,listeners:Y}),F.data=L)),RN(x,e,g,a,y)}sw(x,t)})}function $r(e,t,a){return{instance:e,listener:t,currentTarget:a}}function Hu(e,t){for(var a=t+"Capture",n=[];e!==null;){var o=e,l=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||l===null||(o=hr(e,a),o!=null&&n.unshift($r(e,o,l)),o=hr(e,t),o!=null&&n.push($r(e,o,l))),e.tag===3)return n;e=e.return}return[]}function DN(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function db(e,t,a,n,o){for(var l=t._reactName,u=[];a!==null&&a!==n;){var c=a,h=c.alternate,g=c.stateNode;if(c=c.tag,h!==null&&h===n)break;c!==5&&c!==26&&c!==27||g===null||(h=g,o?(g=hr(a,l),g!=null&&u.unshift($r(a,g,h))):o||(g=hr(a,l),g!=null&&u.push($r(a,g,h)))),a=a.return}u.length!==0&&e.push({event:t,listeners:u})}var _N=/\r\n?/g,HN=/\u0000|\uFFFD/g;function hb(e){return(typeof e=="string"?e:""+e).replace(_N,`
`).replace(HN,"")}function cw(e,t){return t=hb(t),hb(e)===t}function $e(e,t,a,n,o,l){switch(a){case"children":if(typeof n=="string")t==="body"||t==="textarea"&&n===""||Fo(e,n);else if(typeof n=="number"||typeof n=="bigint")t!=="body"&&Fo(e,""+n);else return;break;case"className":As(e,"class",n);break;case"tabIndex":As(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":As(e,a,n);break;case"style":rv(e,n,l);return;case"data":if(t!=="object"){As(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=Qs(n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof l=="function"&&(a==="formAction"?(t!=="input"&&$e(e,t,"name",o.name,o,null),$e(e,t,"formEncType",o.formEncType,o,null),$e(e,t,"formMethod",o.formMethod,o,null),$e(e,t,"formTarget",o.formTarget,o,null)):($e(e,t,"encType",o.encType,o,null),$e(e,t,"method",o.method,o,null),$e(e,t,"target",o.target,o,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=Qs(n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=tn);return;case"onScroll":n!=null&&ue("scroll",e);return;case"onScrollEnd":n!=null&&ue("scrollend",e);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(C(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(C(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=Qs(n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":ue("beforetoggle",e),ue("toggle",e),Xs(e,"popover",n);break;case"xlinkActuate":mn(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":mn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":mn(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":mn(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":mn(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":mn(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":mn(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":mn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":mn(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":Xs(e,"is",n);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=ix.get(a)||a,Xs(e,a,n);else return}fe=!0}function Ih(e,t,a,n,o,l){switch(a){case"style":rv(e,n,l);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(C(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(C(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof n=="string")Fo(e,n);else if(typeof n=="number"||typeof n=="bigint")Fo(e,""+n);else return;break;case"onScroll":n!=null&&ue("scroll",e);return;case"onScrollEnd":n!=null&&ue("scrollend",e);return;case"onClick":n!=null&&(e.onclick=tn);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!tv.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),l=a.slice(2,o?a.length-7:void 0),t=e[Ft]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(l,t,o),typeof n=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(l,n,o);break e}fe=!0,a in e?e[a]=n:n===!0?e.setAttribute(a,""):Xs(e,a,n)}return}fe=!0}function Nt(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ue("error",e),ue("load",e);var n=!1,o=!1,l;for(l in a)if(a.hasOwnProperty(l)){var u=a[l];if(u!=null)switch(l){case"src":n=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(C(137,t));default:$e(e,t,l,u,a,null)}}o&&$e(e,t,"srcSet",a.srcSet,a,null),n&&$e(e,t,"src",a.src,a,null);return;case"input":ue("invalid",e);var c=l=u=o=null,h=null,g=null;for(n in a)if(a.hasOwnProperty(n)){var y=a[n];if(y!=null)switch(n){case"name":o=y;break;case"type":u=y;break;case"checked":h=y;break;case"defaultChecked":g=y;break;case"value":l=y;break;case"defaultValue":c=y;break;case"children":case"dangerouslySetInnerHTML":if(y!=null)throw Error(C(137,t));break;default:$e(e,t,n,y,a,null)}}iv(e,l,c,h,g,u,o,!1);return;case"select":ue("invalid",e),n=u=l=null;for(o in a)if(a.hasOwnProperty(o)&&(c=a[o],c!=null))switch(o){case"value":l=c;break;case"defaultValue":u=c;break;case"multiple":n=c;default:$e(e,t,o,c,a,null)}t=l,a=u,e.multiple=!!n,t!=null?Bo(e,!!n,t,!1):a!=null&&Bo(e,!!n,a,!0);return;case"textarea":ue("invalid",e),l=o=n=null;for(u in a)if(a.hasOwnProperty(u)&&(c=a[u],c!=null))switch(u){case"value":n=c;break;case"defaultValue":o=c;break;case"children":l=c;break;case"dangerouslySetInnerHTML":if(c!=null)throw Error(C(91));break;default:$e(e,t,u,c,a,null)}lv(e,n,o,l);return;case"option":for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!=null)&&(h==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":$e(e,t,h,n,a,null));return;case"dialog":ue("beforetoggle",e),ue("toggle",e),ue("cancel",e),ue("close",e);break;case"iframe":case"object":ue("load",e);break;case"video":case"audio":for(n=0;n<wr.length;n++)ue(wr[n],e);break;case"image":ue("error",e),ue("load",e);break;case"details":ue("toggle",e);break;case"embed":case"source":case"link":ue("error",e),ue("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(n=a[g],n!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(C(137,t));default:$e(e,t,g,n,a,null)}return;default:if(nm(t)){for(y in a)a.hasOwnProperty(y)&&(n=a[y],n!==void 0&&Ih(e,t,y,n,a,void 0));return}}for(c in a)a.hasOwnProperty(c)&&(n=a[c],n!=null&&$e(e,t,c,n,a,null))}var UN={};function qN(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,l=null,u=null,c=null,h=null,g=null,y=null;for(v in a){var x=a[v];if(a.hasOwnProperty(v)&&x!=null)switch(v){case"checked":break;case"value":break;case"defaultValue":h=x;default:n.hasOwnProperty(v)||$e(e,t,v,null,n,x)}}for(var f in n){var v=n[f];if(x=a[f],n.hasOwnProperty(f)&&(v!=null||x!=null))switch(f){case"type":v!==x&&(fe=!0),l=v;break;case"name":v!==x&&(fe=!0),o=v;break;case"checked":v!==x&&(fe=!0),g=v;break;case"defaultChecked":v!==x&&(fe=!0),y=v;break;case"value":v!==x&&(fe=!0),u=v;break;case"defaultValue":v!==x&&(fe=!0),c=v;break;case"children":case"dangerouslySetInnerHTML":if(v!=null)throw Error(C(137,t));break;default:v!==x&&$e(e,t,f,v,n,x)}}Wd(e,u,c,h,g,y,l,o);return;case"select":v=u=c=f=null;for(l in a)if(h=a[l],a.hasOwnProperty(l)&&h!=null)switch(l){case"value":break;case"multiple":v=h;default:n.hasOwnProperty(l)||$e(e,t,l,null,n,h)}for(o in n)if(l=n[o],h=a[o],n.hasOwnProperty(o)&&(l!=null||h!=null))switch(o){case"value":l!==h&&(fe=!0),f=l;break;case"defaultValue":l!==h&&(fe=!0),c=l;break;case"multiple":l!==h&&(fe=!0),u=l;default:l!==h&&$e(e,t,o,l,n,h)}t=c,a=u,n=v,f!=null?Bo(e,!!a,f,!1):!!n!=!!a&&(t!=null?Bo(e,!!a,t,!0):Bo(e,!!a,a?[]:"",!1));return;case"textarea":v=f=null;for(c in a)if(o=a[c],a.hasOwnProperty(c)&&o!=null&&!n.hasOwnProperty(c))switch(c){case"value":break;case"children":break;default:$e(e,t,c,null,n,o)}for(u in n)if(o=n[u],l=a[u],n.hasOwnProperty(u)&&(o!=null||l!=null))switch(u){case"value":o!==l&&(fe=!0),f=o;break;case"defaultValue":o!==l&&(fe=!0),v=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(C(91));break;default:o!==l&&$e(e,t,u,o,n,l)}ov(e,f,v);return;case"option":for(var z in a)f=a[z],a.hasOwnProperty(z)&&f!=null&&!n.hasOwnProperty(z)&&(z==="selected"?e.selected=!1:$e(e,t,z,null,n,f));for(h in n)f=n[h],v=a[h],n.hasOwnProperty(h)&&f!==v&&(f!=null||v!=null)&&(h==="selected"?(f!==v&&(fe=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):$e(e,t,h,f,n,v));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var T in a)f=a[T],a.hasOwnProperty(T)&&f!=null&&!n.hasOwnProperty(T)&&$e(e,t,T,null,n,f);for(g in n)if(f=n[g],v=a[g],n.hasOwnProperty(g)&&f!==v&&(f!=null||v!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(C(137,t));break;default:$e(e,t,g,f,n,v)}return;default:if(nm(t)){for(var V in a)f=a[V],a.hasOwnProperty(V)&&f!==void 0&&!n.hasOwnProperty(V)&&Ih(e,t,V,void 0,n,f);for(y in n)f=n[y],v=a[y],!n.hasOwnProperty(y)||f===v||f===void 0&&v===void 0||Ih(e,t,y,f,n,v);return}}for(var w in a)f=a[w],a.hasOwnProperty(w)&&f!=null&&!n.hasOwnProperty(w)&&$e(e,t,w,null,n,f);for(x in n)f=n[x],v=a[x],!n.hasOwnProperty(x)||f===v||f==null&&v==null||$e(e,t,x,f,n,v)}function mb(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function BN(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var o=a[n],l=o.transferSize,u=o.initiatorType,c=o.duration;if(l&&c&&mb(u)){for(u=0,c=o.responseEnd,n+=1;n<a.length;n++){var h=a[n],g=h.startTime;if(g>c)break;var y=h.transferSize,x=h.initiatorType;y&&mb(x)&&(h=h.responseEnd,u+=y*(h<c?1:(c-g)/(h-g)))}if(--n,t+=8*(l+u)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Lh=null,Gh=null;function xr(e){return e.nodeType===9?e:e.ownerDocument}function pb(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function dw(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function hw(e,t,a,n){return a=xr(a).createElement(e),a[yt]=n,a[Ft]=t,Nt(a,e,t),ht(a),a}function Yh(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Ud=null;function IN(){var e=window.event;return e&&e.type==="popstate"?e===Ud?!1:(Ud=e,!0):(Ud=null,!1)}var Gm=typeof setTimeout=="function"?setTimeout:void 0,LN=typeof clearTimeout=="function"?clearTimeout:void 0,gb=typeof Promise=="function"?Promise:void 0,fb=typeof requestAnimationFrame=="function"?requestAnimationFrame:Gm,GN=typeof queueMicrotask=="function"?queueMicrotask:typeof gb<"u"?function(e){return gb.resolve(null).then(e).catch(YN)}:Gm;function YN(e){setTimeout(function(){throw e})}function ci(e){return e==="head"}function bb(e,t){var a=t,n=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(o),rl(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")Bd(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,Bd(a);for(var l=a.firstChild;l;){var u=l.nextSibling,c=l.nodeName;l[Mr]||c==="SCRIPT"||c==="STYLE"||c==="LINK"&&l.rel.toLowerCase()==="stylesheet"||a.removeChild(l),l=u}}else a==="body"&&Bd(e.ownerDocument.body);a=o}while(a);rl(t)}function vb(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function mw(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var n=1;else for(var o=n=0;o<t.length;o++){var l=t[o];0<l.width&&0<l.height&&n++}n===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function pw(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function gw(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function jh(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return gw(t,a,e)}function jN(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return gw(t,a,e)}function XN(e){return e.documentElement.clientHeight}function QN(e){this.addEventListener("load",e),this.addEventListener("error",e)}function ZN(e,t,a,n,o,l,u,c,h){var g=t.nodeType===9?t:t.ownerDocument;try{var y=g.startViewTransition({update:function(){var f=g.defaultView,v=f.navigation&&f.navigation.transition,z=g.fonts.status;n();var T=[];if(z==="loaded"&&(XN(g),g.fonts.status==="loading"&&T.push(g.fonts.ready)),z=T.length,e!==null)for(var V=e.suspenseyImages,w=0,b=0;b<V.length;b++){var N=V[b];if(!N.complete){var E=N.getBoundingClientRect();if(0<E.bottom&&0<E.right&&E.top<f.innerHeight&&E.left<f.innerWidth){if(w+=kw(N),w>su){T.length=z;break}N=new Promise(QN.bind(N)),T.push(N)}}}if(0<T.length)return f=Promise.race([Promise.all(T),new Promise(function(R){return setTimeout(R,500)})]).then(o,o),(v?Promise.allSettled([v.finished,f]):f).then(l,l);if(o(),v)return v.finished.then(l,l);l()},types:a});g.__reactViewTransition=y;var x=[];return y.ready.then(function(){for(var f=g.documentElement.getAnimations({subtree:!0}),v=0;v<f.length;v++){var z=f[v],T=z.effect,V=T.pseudoElement;if(V!=null&&V.startsWith("::view-transition")){x.push(z),z=T.getKeyframes();for(var w=V=void 0,b=!0,N=0;N<z.length;N++){var E=z[N],R=E.width;if(V===void 0)V=R;else if(V!==R){b=!1;break}if(R=E.height,w===void 0)w=R;else if(w!==R){b=!1;break}delete E.width,delete E.height,E.transform==="none"&&delete E.transform}b&&V!==void 0&&w!==void 0&&(T.setKeyframes(z),b=getComputedStyle(T.target,T.pseudoElement),b.width!==V||b.height!==w)&&(b=z[0],b.width=V,b.height=w,b=z[z.length-1],b.width=V,b.height=w,T.setKeyframes(z))}}u()},function(f){g.__reactViewTransition===y&&(g.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{n(),o(),u()}}),y.finished.finally(function(){for(var f=0;f<x.length;f++)x[f].cancel();g.__reactViewTransition===y&&(g.__reactViewTransition=null),c()}),y}catch{return n(),o(),u(),null}}function Ti(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Ti.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:Ae({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Ti.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),n=[],o=0;o<a.length;o++){var l=a[o].effect;l!==null&&l.target===e&&l.pseudoElement===t&&n.push(a[o])}return n};Ti.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function fw(e){return{name:e,group:new Ti("group",e),imagePair:new Ti("image-pair",e),old:new Ti("old",e),new:new Ti("new",e)}}function ha(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}ha.prototype.addEventListener=function(e,t,a){var n=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(n=a.signal||null,n!==null&&n.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var l=this._eventListeners;if(bw(l,e,t,a)===-1){var u=this,c=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(c=function(h){u.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),n!==null&&(o=u.removeEventListener.bind(u,e,t,a),n.addEventListener("abort",o,{once:!0}),o=n.removeEventListener.bind(n,"abort",o)),n=nl(a),l.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:c,cleanup:o}),Jt(this._fragmentFiber.child,!1,KN,e,c,n)}this._eventListeners=l}};function KN(e,t,a,n){return it(e).addEventListener(t,a,n),!1}ha.prototype.removeEventListener=function(e,t,a){var n=this._eventListeners;if(n!==null&&(t=bw(n,e,t,a),t!==-1)){var o=n[t];a=o.attachedListener;var l=o.cleanup;o=nl(o.optionsOrUseCapture),Jt(this._fragmentFiber.child,!1,JN,e,a,o),n.splice(t,1),l!==null&&l()}};function JN(e,t,a,n){return it(e).removeEventListener(t,a,n),!1}function nl(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function yb(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function bw(e,t,a,n){if(e.length===0)return-1;n=yb(n);for(var o=0;o<e.length;o++){var l=e[o];if(l.type===t&&l.listener===a&&yb(l.optionsOrUseCapture)===n)return o}return-1}ha.prototype.dispatchEvent=function(e){var t=qi(this._fragmentFiber);if(t===null)return!0;t=it(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var n=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var l=a[o];n.addEventListener(l.type,l.attachedListener,nl(l.optionsOrUseCapture))}if(t.appendChild(n),e=n.dispatchEvent(e),a)for(o=0;o<a.length;o++)l=a[o],n.removeEventListener(l.type,l.attachedListener,nl(l.optionsOrUseCapture));return t.removeChild(n),e}return t.dispatchEvent(e)};ha.prototype.focus=function(e){Jt(this._fragmentFiber.child,!0,vw,e,void 0,void 0)};function vw(e,t){return e.tag===6?!1:(e=it(e),s5(e,t))}ha.prototype.focusLast=function(e){var t=[];Jt(this._fragmentFiber.child,!0,Ym,t,void 0,void 0);for(var a=t.length-1;0<=a&&!vw(t[a],e);a--);};function Ym(e,t){return t.push(e),!1}ha.prototype.blur=function(){var e=qi(this._fragmentFiber);e!==null&&(e=it(e),e=xr(e).activeElement,e!==null&&Jt(this._fragmentFiber.child,!1,FN,e,void 0,void 0))};function FN(e,t){return e.tag===6?!1:(e=it(e),e===t||e.contains(t)?(t.blur(),!0):!1)}ha.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Jt(this._fragmentFiber.child,!1,PN,e,void 0,void 0)};function PN(e,t){return e.tag===6||(e=it(e),t.observe(e)),!1}ha.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Jt(this._fragmentFiber.child,!1,WN,e,void 0,void 0);for(var a=t=0;a<Ha.length;a++){var n=Ha[a];n.fragmentInstance===this&&n.observer===e?e.unobserve(n.instance):Ha[t++]=n}Ha.length=t}};function WN(e,t){return e.tag===6||(e=it(e),t.unobserve(e)),!1}var Ha=[],qd=!1;function e5(e,t,a){Ha.push({fragmentInstance:e,observer:t,instance:a}),qd||(qd=!0,u5(function(){qd=!1;var n=Ha;Ha=[];for(var o=0;o<n.length;o++){var l=n[o];l.observer.unobserve(l.instance)}}))}ha.prototype.getClientRects=function(){var e=[];return Jt(this._fragmentFiber.child,!1,t5,e,void 0,void 0),e};function t5(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=it(e),t.push.apply(t,e.getClientRects());return!1}ha.prototype.getRootNode=function(e){var t=qi(this._fragmentFiber);return t===null?this:it(t).getRootNode(e)};ha.prototype.compareDocumentPosition=function(e){var t=qi(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Jt(this._fragmentFiber.child,!1,Ym,a,void 0,void 0);var n=it(t);if(a.length===0){if(a=n,Fg(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=n=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:n&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=Bb(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=it(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=it(a[0]),o=it(a[a.length-1]);var l=Fg(this._fragmentFiber)?t.parentElement:n;if(l==null)return Node.DOCUMENT_POSITION_DISCONNECTED;n=l.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,l=l.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var u=t.compareDocumentPosition(e),c=o.compareDocumentPosition(e),h=u&Node.DOCUMENT_POSITION_CONTAINED_BY||c&Node.DOCUMENT_POSITION_CONTAINED_BY;return c=n&&l&&u&Node.DOCUMENT_POSITION_FOLLOWING&&c&Node.DOCUMENT_POSITION_PRECEDING,t=n&&t===e||l&&o===e||h||c?Node.DOCUMENT_POSITION_CONTAINED_BY:!n&&t===e||!l&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:u,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||a5(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function a5(e,t,a,n,o){var l=Si(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!l)e:{for(;l!==null;){if(l.tag===7&&(l===t||l.alternate===t)){a=!0;break e}l=l.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(l===null)return l=o.ownerDocument,o===l||o===l.documentElement||o===l.body;e:{for(l=t,t=qi(t);l!==null;){if(!(l.tag!==5&&l.tag!==3&&l.tag!==27||l!==t&&l.alternate!==t)){l=!0;break e}l=l.return}l=!1}return l}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!l)&&!(t=l===a)&&(t=Ld(a,l,Pg),t===null?t=!1:(Jt(t,!0,O$,l,a),l=ko,ko=null,t=l!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!l)&&!(t=l===n)&&(t=Ld(n,l,Pg),t===null?t=!1:(Jt(t,!0,R$,l,n),l=ko,Id=ko=null,t=l!==null)),t):!1}function wb(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}ha.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(C(566));var t=[];Jt(this._fragmentFiber.child,!1,Ym,t,void 0,void 0);var a=e!==!1;if(t.length===0){var n=Bb(this._fragmentFiber);if(n=a?n[1]||n[0]||qi(this._fragmentFiber):n[0]||n[1],n===null)return;if(n.tag===6){e=it(n),wb(e,a);return}if(n=it(n),n.nodeType!==9){if(n.nodeType===11){a="host"in n?n.host:null,a!==null&&a.scrollIntoView(e);return}n.scrollIntoView(e)}}for(n=a?t.length-1:0;n!==(a?-1:t.length);){var o=t[n];o.tag===6?(o=it(o),wb(o,a)):it(o).scrollIntoView(e),n+=a?-1:1}};function n5(e,t){return e=it(e),yw(e,t),!1}function yw(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function ww(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.addEventListener(o.type,o.attachedListener,nl(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){for(var u=0,c=0;c<Ha.length;c++){var h=Ha[c];(h.fragmentInstance!==t||h.observer!==l||h.instance!==e)&&(Ha[u++]=h)}Ha.length=u,l.observe(e)}),yw(e,t))}function i5(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.removeEventListener(o.type,o.attachedListener,nl(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){typeof l.rootMargin=="string"?e5(t,l,e):l.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function Xh(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Xh(a),Iu(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function o5(e,t,a,n){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[Mr])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(l=e.getAttribute("rel"),l==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(l!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(l=e.getAttribute("src"),(l!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&l&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var l=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===l)return e}else return e;if(e=ka(e.nextSibling),e===null)break}return null}function l5(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=ka(e.nextSibling),e===null))return null;return e}function $w(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=ka(e.nextSibling),e===null))return null;return e}function Qh(e){return e.data==="$?"||e.data==="$~"}function jm(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function r5(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function ka(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Zh=null;function $b(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return ka(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function xb(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function s5(e,t){function a(){n=!0}if(e.ownerDocument.activeElement===e)return!0;var n=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return n}function u5(e){fb(function(){fb(function(t){return e(t)})})}function xw(e,t,a){switch(t=xr(a),e){case"html":if(e=t.documentElement,!e)throw Error(C(452));return e;case"head":if(e=t.head,!e)throw Error(C(453));return e;case"body":if(e=t.body,!e)throw Error(C(454));return e;default:throw Error(C(451))}}function Nw(e,t,a){for(var n in a){var o=a[n];a.hasOwnProperty(n)&&o!=null&&$e(e,t,n,null,UN,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===tn&&(e.onclick=null),Iu(e)}function Bd(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Iu(e)}var Ca=new Map,Nb=new Set;function Nr(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var kn=ve.d;ve.d={f:c5,r:d5,D:h5,C:m5,L:p5,m:g5,X:b5,S:f5,M:v5};function c5(){var e=kn.f(),t=tc();return e||t}function d5(e){var t=ul(e);t!==null&&t.tag===5&&t.type==="form"?ry(t):kn.r(e)}var ml=typeof document>"u"?null:document;function Sw(e,t,a){var n=ml;if(n&&typeof t=="string"&&t){var o=Sa(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),Nb.has(o)||(Nb.add(o),e={rel:e,crossOrigin:a,href:t},n.querySelector(o)===null&&(t=n.createElement("link"),Nt(t,"link",e),ht(t),n.head.appendChild(t)))}}function h5(e){kn.D(e),Sw("dns-prefetch",e,null)}function m5(e,t){kn.C(e,t),Sw("preconnect",e,t)}function p5(e,t,a){kn.L(e,t,a);var n=ml;if(n&&e&&t){var o='link[rel="preload"][as="'+Sa(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+Sa(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+Sa(a.imageSizes)+'"]')):o+='[href="'+Sa(e)+'"]';var l=o;switch(t){case"style":l=il(e);break;case"script":l=pl(e)}if(!(Ca.has(l)||(e=Ae({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),Ca.set(l,e),n.querySelector(o)!==null||t==="style"&&n.querySelector(Hr(l))||t==="script"&&n.querySelector(Ur(l))))){var u=n.createElement("link");Nt(u,"link",e),t==="style"&&(u[gu]=!0,u.onload=u.onerror=function(){Wb(u)}),ht(u),n.head.appendChild(u)}}}function g5(e,t){kn.m(e,t);var a=ml;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+Sa(n)+'"][href="'+Sa(e)+'"]',l=o;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":l=pl(e)}if(!Ca.has(l)&&(e=Ae({rel:"modulepreload",href:e},t),Ca.set(l,e),a.querySelector(o)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Ur(l)))return}n=a.createElement("link"),Nt(n,"link",e),ht(n),a.head.appendChild(n)}}}function f5(e,t,a){kn.S(e,t,a);var n=ml;if(n&&e){var o=qo(n).hoistableStyles,l=il(e);t=t||"default";var u=o.get(l);if(!u){var c={loading:0,preload:null};if(u=n.querySelector(Hr(l)))c.loading=5;else{e=Ae({rel:"stylesheet",href:e,"data-precedence":t},a),(a=Ca.get(l))&&Xm(e,a);var h=u=n.createElement("link");ht(h),Nt(h,"link",e),h._p=new Promise(function(g,y){h.onload=g,h.onerror=y}),h.addEventListener("load",function(){c.loading|=1}),h.addEventListener("error",function(){c.loading|=2}),c.loading|=4,lu(u,t,n)}u={type:"stylesheet",instance:u,count:1,state:c},o.set(l,u)}}}function b5(e,t){kn.X(e,t);var a=ml;if(a&&e){var n=qo(a).hoistableScripts,o=pl(e),l=n.get(o);l||(l=a.querySelector(Ur(o)),l||(e=Ae({src:e,async:!0},t),(t=Ca.get(o))&&Qm(e,t),l=a.createElement("script"),ht(l),Nt(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function v5(e,t){kn.M(e,t);var a=ml;if(a&&e){var n=qo(a).hoistableScripts,o=pl(e),l=n.get(o);l||(l=a.querySelector(Ur(o)),l||(e=Ae({src:e,async:!0,type:"module"},t),(t=Ca.get(o))&&Qm(e,t),l=a.createElement("script"),ht(l),Nt(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function Sb(e,t,a,n){var o=(o=Zn.current)?Nr(o):null;if(!o)throw Error(C(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=il(a.href),t=qo(o).hoistableStyles,n=t.get(a),n||(n={type:"style",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=il(a.href);var l=qo(o).hoistableStyles,u=l.get(e);if(u||(o=o.ownerDocument||o,u={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},l.set(e,u),(l=o.querySelector(Hr(e)))?l._p||(u.instance=l,u.state.loading=5):(l=Ca.get(e),l||(l={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Ca.set(e,l)),y5(o,e,l,u.state))),t&&n===null)throw Error(C(528,""));return u}if(t&&n!==null)throw Error(C(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=pl(a),t=qo(o).hoistableScripts,n=t.get(a),n||(n={type:"script",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(C(444,e))}}function il(e){return'href="'+Sa(e)+'"'}function Hr(e){return'link[rel="stylesheet"]['+e+"]"}function Tw(e){return Ae({},e,{"data-precedence":e.precedence,precedence:null})}function y5(e,t,a,n){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[gu]!==!0){n.loading=1;return}}else t=e.createElement("link"),t[gu]=!0,t.onload=t.onerror=Wb.bind(null,t),Nt(t,"link",a),ht(t),e.head.appendChild(t);n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2})}function pl(e){return'[src="'+Sa(e)+'"]'}function Ur(e){return"script[async]"+e}function Tb(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+Sa(a.href)+'"]');if(n)return t.instance=n,ht(n),n;var o=Ae({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),ht(n),Nt(n,"style",o),lu(n,a.precedence,e),t.instance=n;case"stylesheet":o=il(a.href);var l=e.querySelector(Hr(o));if(l)return t.state.loading|=4,t.instance=l,ht(l),l;n=Tw(a),(o=Ca.get(o))&&Xm(n,o),l=(e.ownerDocument||e).createElement("link"),ht(l);var u=l;return u._p=new Promise(function(c,h){u.onload=c,u.onerror=h}),Nt(l,"link",n),t.state.loading|=4,lu(l,a.precedence,e),t.instance=l;case"script":return l=pl(a.src),(o=e.querySelector(Ur(l)))?(t.instance=o,ht(o),o):(n=a,(o=Ca.get(l))&&(n=Ae({},a),Qm(n,o)),e=e.ownerDocument||e,o=e.createElement("script"),ht(o),Nt(o,"link",n),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(C(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,lu(n,a.precedence,e));return t.instance}function lu(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=n.length?n[n.length-1]:null,l=o,u=0;u<n.length;u++){var c=n[u];if(c.dataset.precedence===t)l=c;else if(l!==o)break}l?l.parentNode.insertBefore(e,l.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function Xm(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Qm(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var ru=null;function Eb(e,t,a){if(ru===null){var n=new Map,o=ru=new Map;o.set(a,n)}else o=ru,n=o.get(a),n||(n=new Map,o.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var l=a[o];if(!(l[Mr]||l[yt]||e==="link"&&l.getAttribute("rel")==="stylesheet")&&l.namespaceURI!=="http://www.w3.org/2000/svg"){var u=l.getAttribute(t)||"";u=e+u;var c=n.get(u);c?c.push(l):n.set(u,[l])}}return n}function Kh(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function w5(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function kb(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function Ew(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function kw(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Cb(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=kw(t),e.suspenseyImages.push(t)),e=N5.bind(e),t.decode().then(e,e))}function $5(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=il(n.href),l=t.querySelector(Hr(o));if(l){t=l._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Sr.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=l,ht(l);return}l=t.ownerDocument||t,n=Tw(n),(o=Ca.get(o))&&Xm(n,o),l=l.createElement("link"),ht(l);var u=l;u._p=new Promise(function(c,h){u.onload=c,u.onerror=h}),Nt(l,"link",n),a.instance=l}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Sr.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var su=0;function x5(e,t){return e.stylesheets&&e.count===0&&uu(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&uu(e,e.stylesheets),e.unsuspend){var l=e.unsuspend;e.unsuspend=null,l()}},6e4+t);0<e.imgBytes&&su===0&&(su=62500*BN());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&uu(e,e.stylesheets),e.unsuspend)){var l=e.unsuspend;e.unsuspend=null,l()}},(e.imgBytes>su?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(o)}}:null}function Cw(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)uu(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Sr(){this.count--,Cw(this)}function N5(){this.imgCount--,Cw(this)}var Uu=null;function uu(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Uu=new Map,t.forEach(S5,e),Uu=null,Sr.call(e))}function S5(e,t){if(!(t.state.loading&4)){var a=Uu.get(e);if(a)var n=a.get(null);else{a=new Map,Uu.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),l=0;l<o.length;l++){var u=o[l];(u.nodeName==="LINK"||u.getAttribute("media")!=="not all")&&(a.set(u.dataset.precedence,u),n=u)}n&&a.set(null,n)}o=t.instance,u=o.getAttribute("data-precedence"),l=a.get(u)||n,l===n&&a.set(null,o),a.set(u,o),this.count++,n=Sr.bind(this),o.addEventListener("load",n),o.addEventListener("error",n),l?l.parentNode.insertBefore(o,l.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var ol={$$typeof:en,Provider:null,Consumer:null,_currentValue:Ei,_currentValue2:Ei,_threadCount:0};function T5(e,t,a,n,o,l,u,c,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=pd(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=pd(0),this.hiddenUpdates=pd(null),this.identifierPrefix=n,this.onUncaughtError=o,this.onCaughtError=l,this.onRecoverableError=u,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function Aw(e,t,a,n,o,l,u,c,h,g,y,x){return e=new T5(e,t,a,u,h,g,y,x,c),t=1,l===!0&&(t|=24),l=Zt(3,null,null,t),e.current=l,l.stateNode=e,t=mm(),t.refCount++,e.pooledCache=t,t.refCount++,l.memoizedState={element:n,isDehydrated:a,cache:t},fm(l),e}function zw(e){return e?(e=Do,e):Do}function Mw(e,t,a,n,o,l){o=zw(o),n.context===null?n.context=o:n.pendingContext=o,n=Jn(t),n.payload={element:a},l=l===void 0?null:l,l!==null&&(n.callback=l),a=Fn(e,n,t),a!==null&&(Kt(a,e,t),ar(a,e,t))}function Ab(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function Zm(e,t){Ab(e,t),(e=e.alternate)&&Ab(e,t)}function Ow(e){if(e.tag===13||e.tag===31){var t=Li(e,67108864);t!==null&&Kt(t,e,67108864),Zm(e,67108864)}}function zb(e){if(e.tag===13||e.tag===31){var t=ca();t=tm(t);var a=Li(e,t);a!==null&&Kt(a,e,t),Zm(e,t)}}var ll=!0;function E5(e,t,a,n){var o=W.T;W.T=null;var l=ve.p;try{ve.p=2,Km(e,t,a,n)}finally{ve.p=l,W.T=o}}function k5(e,t,a,n){var o=W.T;W.T=null;var l=ve.p;try{ve.p=8,Km(e,t,a,n)}finally{ve.p=l,W.T=o}}function Km(e,t,a,n){if(ll){var o=Jh(n);if(o===null)Hd(e,t,n,qu,a),Mb(e,n);else if(A5(o,e,t,a,n))n.stopPropagation();else if(Mb(e,n),t&4&&-1<C5.indexOf(e)){for(;o!==null;){var l=ul(o);if(l!==null)switch(l.tag){case 3:if(l=l.stateNode,l.current.memoizedState.isDehydrated){var u=$i(l.pendingLanes);if(u!==0){var c=l;for(c.pendingLanes|=2,c.entangledLanes|=2;u;){var h=1<<31-ua(u);c.entanglements[1]|=h,u&=~h}un(l),(be&6)===0&&(Ru=ra()+500,_r(0,!1))}}break;case 31:case 13:c=Li(l,2),c!==null&&Kt(c,l,2),tc(),Zm(l,2)}if(l=Jh(n),l===null&&Hd(e,t,n,qu,a),l===o)break;o=l}o!==null&&n.stopPropagation()}else Hd(e,t,n,null,a)}}function Jh(e){return e=im(e),Jm(e)}var qu=null;function Jm(e){if(qu=null,e=Si(e),e!==null){var t=kr(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=Hb(t),e!==null)return e;e=null}else if(a===31){if(e=Ub(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return qu=e,null}function Rw(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(L$()){case Yb:return 2;case jb:return 8;case pu:case G$:return 32;case Xb:return 268435456;default:return 32}default:return 32}}var Fh=!1,ti=null,ai=null,ni=null,Tr=new Map,Er=new Map,In=[],C5="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Mb(e,t){switch(e){case"focusin":case"focusout":ti=null;break;case"dragenter":case"dragleave":ai=null;break;case"mouseover":case"mouseout":ni=null;break;case"pointerover":case"pointerout":Tr.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Er.delete(t.pointerId)}}function jl(e,t,a,n,o,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:l,targetContainers:[o]},t!==null&&(t=ul(t),t!==null&&Ow(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function A5(e,t,a,n,o){switch(t){case"focusin":return ti=jl(ti,e,t,a,n,o),!0;case"dragenter":return ai=jl(ai,e,t,a,n,o),!0;case"mouseover":return ni=jl(ni,e,t,a,n,o),!0;case"pointerover":var l=o.pointerId;return Tr.set(l,jl(Tr.get(l)||null,e,t,a,n,o)),!0;case"gotpointercapture":return l=o.pointerId,Er.set(l,jl(Er.get(l)||null,e,t,a,n,o)),!0}return!1}function Vw(e){var t=Si(e.target);if(t!==null){var a=kr(t);if(a!==null){if(t=a.tag,t===13){if(t=Hb(a),t!==null){e.blockedOn=t,af(e.priority,function(){zb(a)});return}}else if(t===31){if(t=Ub(a),t!==null){e.blockedOn=t,af(e.priority,function(){zb(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function cu(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=Jh(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);eh=n,a.target.dispatchEvent(n),eh=null}else return t=ul(a),t!==null&&Ow(t),e.blockedOn=a,!1;t.shift()}return!0}function Ob(e,t,a){cu(e)&&a.delete(t)}function z5(){Fh=!1,ti!==null&&cu(ti)&&(ti=null),ai!==null&&cu(ai)&&(ai=null),ni!==null&&cu(ni)&&(ni=null),Tr.forEach(Ob),Er.forEach(Ob)}function Ys(e,t){e.blockedOn===t&&(e.blockedOn=null,Fh||(Fh=!0,ot.unstable_scheduleCallback(ot.unstable_NormalPriority,z5)))}var js=null;function Rb(e){js!==e&&(js=e,ot.unstable_scheduleCallback(ot.unstable_NormalPriority,function(){js===e&&(js=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],o=e[t+2];if(typeof n!="function"){if(Jm(n||a)===null)continue;break}var l=ul(a);l!==null&&(e.splice(t,3),t-=3,fh(l,{pending:!0,data:o,method:a.method,action:n},n,o))}}))}function rl(e){function t(h){return Ys(h,e)}ti!==null&&Ys(ti,e),ai!==null&&Ys(ai,e),ni!==null&&Ys(ni,e),Tr.forEach(t),Er.forEach(t);for(var a=0;a<In.length;a++){var n=In[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<In.length&&(a=In[0],a.blockedOn===null);)Vw(a),a.blockedOn===null&&In.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var o=a[n],l=a[n+1],u=o[Ft]||null;if(typeof l=="function")u||Rb(a);else if(u){var c=null;if(l&&l.hasAttribute("formAction")){if(o=l,u=l[Ft]||null)c=u.formAction;else if(Jm(o)!==null)continue}else c=u.action;typeof c=="function"?a[n+1]=c:(a.splice(n,3),n-=3),Rb(a)}}}function Dw(){function e(l){l.canIntercept&&l.info==="react-transition"&&l.intercept({handler:function(){return new Promise(function(u){return o=u})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var l=navigation.currentEntry;l&&l.url!=null&&navigation.navigate(l.url,{state:l.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function Fm(e){this._internalRoot=e}ic.prototype.render=Fm.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(C(409));var a=t.current,n=ca();Mw(a,n,e,t,null,null)};ic.prototype.unmount=Fm.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Mw(e.current,2,null,e,null,null),tc(),t[sl]=null}};function ic(e){this._internalRoot=e}ic.prototype.unstable_scheduleHydration=function(e){if(e){var t=Pb();e={blockedOn:null,target:e,priority:t};for(var a=0;a<In.length&&t!==0&&t<In[a].priority;a++);In.splice(a,0,e),a===0&&Vw(e)}};var Vb=Db.version;if(Vb!=="19.3.0")throw Error(C(527,Vb,"19.3.0"));ve.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(C(188)):(e=Object.keys(e).join(","),Error(C(268,e)));return e=M$(t),e=e!==null?qb(e):null,e=e===null?null:e.stateNode,e};var M5={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:W,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Xl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Xl.isDisabled&&Xl.supportsFiber))try{Cr=Xl.inject(M5),sa=Xl}catch{}var Xl;oc.createRoot=function(e,t){if(!_b(e))throw Error(C(299));var a=!1,n="",o=gy,l=fy,u=by;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(l=t.onCaughtError),t.onRecoverableError!==void 0&&(u=t.onRecoverableError)),t=Aw(e,1,!1,null,null,a,n,null,o,l,u,Dw),e[sl]=t.current,Lm(e),new Fm(t)};oc.hydrateRoot=function(e,t,a){if(!_b(e))throw Error(C(299));var n=!1,o="",l=gy,u=fy,c=by,h=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(l=a.onUncaughtError),a.onCaughtError!==void 0&&(u=a.onCaughtError),a.onRecoverableError!==void 0&&(c=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=Aw(e,1,!0,t,a??null,n,o,h,l,u,c,Dw),t.context=zw(null),a=t.current,n=ca(),n=tm(n),o=Jn(n),o.callback=null,Fn(a,o,n),a=n,t.current.lanes=a,zr(t,a),un(t),e[sl]=t.current,Lm(e),new ic(t)};oc.version="19.3.0"});var qw=Qa((IS,Uw)=>{"use strict";function Hw(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Hw)}catch(e){console.error(e)}}Hw(),Uw.exports=_w()});var a0=Qa(uc=>{"use strict";var U5=Symbol.for("react.transitional.element"),q5=Symbol.for("react.fragment");function t0(e,t,a){var n=null;if(a!==void 0&&(n=""+a),t.key!==void 0&&(n=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:U5,type:e,key:n,ref:t!==void 0?t:null,props:a}}uc.Fragment=q5;uc.jsx=t0;uc.jsxs=t0});var ep=Qa((FS,n0)=>{"use strict";n0.exports=a0()});var m=vs(ws()),E0=vs(qw());function O5(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),n="",o=[],l=[];for(let u=0;u<a.length;u++){let c=a[u],h=/^ {0,3}(`{3,}|~{3,})/.exec(c)?.[1];if(h&&(n?h[0]===n[0]&&h.length>=n.length&&(n=""):n=h),!n&&!c.trim()&&(!t||u<a.length-1)){let g=o.join(`
`).trim();g&&l.push(g),o=[]}else o.push(c)}if(!t){let u=o.join(`
`).trim();u&&l.push(u)}return l}var R5=['"',"'","\u201D","\u2019","\xBB","\u300D"],V5=['"',"'","\u201C","\u2018","\xAB","\u300C"];function Bw(e){let t=e.trim();return R5.includes(t.slice(-1))&&V5.some(n=>t.slice(0,-1).includes(n))?"speech":"prose"}function Iw(e,t){let a=O5(e),n=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return n();let o=[],l=[],u=[],c=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){o.push(a[h]),l.push(c),u.push(g.expression??null),c=[];continue}let y={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};o.length?l[l.length-1].push(y):c.push(y)}return o.length===0?n():{paragraphs:o,asides:l,expressions:u}}var D5="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function Yi(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],n=new RegExp(D5,"g"),o=0,l,u=c=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+c};return}a.push({kind:"text",text:c})};for(;(l=n.exec(e))!==null;)l.index>o&&u(e.slice(o,l.index)),l[1]!=null?u(l[1]):l[2]!=null&&l[3]!=null?a.push({kind:"link",text:l[2],href:l[3]}):l[4]!=null?a.push({kind:"code",text:l[4]}):l[5]!=null?a.push({kind:"styled",style:"highlight",children:Yi(l[5],t+1)}):l[6]!=null?a.push({kind:"styled",style:"strikethrough",children:Yi(l[6],t+1)}):l[7]!=null?a.push({kind:"styled",style:"bold-italic",children:Yi(l[7],t+1)}):l[8]!=null?a.push({kind:"styled",style:"bold",children:Yi(l[8],t+1)}):l[9]!=null?a.push({kind:"styled",style:"underline",children:Yi(l[9],t+1)}):(l[10]!=null||l[11]!=null)&&a.push({kind:"styled",style:"italic",children:Yi(l[10]??l[11],t+1)}),o=l.index+l[0].length;return o<e.length&&u(e.slice(o)),a}function Lw(e){return Yi(e,0)}function Cn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Gw(e){return e===null||typeof e=="string"}function Yw(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function lc(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function _5(e){return e===null?!0:Cn(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function H5(e){if(!Cn(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.purpose!="string"||typeof e.category!="string"||!lc(e.capabilities)||!Cn(e.presentation)||!Cn(e.occupancy)||!Cn(e.state))return!1;let{presentation:t,occupancy:a,state:n}=e;return _5(t.image)&&Yw(t.x)&&Yw(t.y)&&typeof a.playerHome=="boolean"&&Gw(a.residentCharacterId)&&Gw(a.homeKind)&&typeof n.condition=="string"&&lc(n.upgrades)&&lc(n.furniture)&&lc(n.publicFacts)&&typeof n.updatedAt=="string"}function jw(e){if(!Cn(e)||!Cn(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(H5),n=Array.isArray(e.venueRequests)?e.venueRequests:[],o=n.filter(l=>Cn(l)&&typeof l.id=="string"&&Cn(l.venueDraft)&&typeof l.venueDraft.name=="string"&&typeof l.venueDraft.purpose=="string"&&typeof l.venueDraft.category=="string");return a.length===t.length&&o.length===n.length&&n===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function Xw(e,t,a){return e==="Enter"&&!t&&!a}function rc(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,n=>n.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function Qw(e,t,a,n){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(n,o)}function Zw(e,t){return t<0||t===e?"front":t<e?"left":"right"}function Kw(e,t,a){let n=a==="front"?"front":"side",o=e.find(l=>l.view===n&&l.label===t)??e.find(l=>l.view===n&&l.label==="neutral")??e.find(l=>l.view==="front"&&l.label===t)??e.find(l=>l.view==="front"&&l.label==="neutral");return o?{image:o,mirrored:o.view==="side"&&a==="left"}:null}function Jw(e,t,a){let n=.2*a.photoWidth/a.width,o=.2*a.photoHeight/a.height;return t.some(l=>l.x!==null&&l.y!==null&&Math.abs(l.x-e.x)<n&&Math.abs(l.y-e.y)<o)}function Fw(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var di=(e,t,a)=>Math.min(a,Math.max(t,e));function sc(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function Pm(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let n=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,sc(e,t)),l=e.width*n*o,u=e.height*n*o,c=t.width/2-a.centerX*l,h=t.height/2-a.centerY*u;return{left:l<=t.width?(t.width-l)/2:di(c,t.width-l,0),top:u<=t.height?(t.height-u)/2:di(h,t.height-u,0),width:l,height:u}}function Pw(e,t,a,n,o,l){let u=Pm(e,t,a);if(!u.width||!u.height)return a;let c=sc(e,t),h=di(a.zoom*l,c,Math.max(4,c*2)),g=h/Math.max(a.zoom,c),y=u.width*g,x=u.height*g,f=(n.x-u.left)/u.width,v=(n.y-u.top)/u.height,z=o.x-f*y,T=o.y-v*x;return{zoom:h,centerX:di((t.width/2-z)/y,0,1),centerY:di((t.height/2-T)/x,0,1)}}function Ww(e,t){let a=Math.max(1,t),n=Math.max(4,a*2);return .32+1.03*((di(e,a,n)-a)/(n-a))}function e0(e,t){return t?Math.max(1,e):e}function Wm(e,t,a){let n=Math.min(90,t.width/2),o=64,l=116,u=e.left+a.x*e.width,c=e.top+a.y*e.height,h=c+o,g=h+l<=t.height?h:c-o-l;return{left:di(u,n,t.width-n),top:di(g,0,Math.max(0,t.height-l))}}var r=vs(ep()),i="marinara-capability-villages",i0="marinara-capability-villages-styles",B5="/api/villages",I5=.7,o0=[{value:"fresh-start",label:"Fresh start"},{value:"refuge",label:"Refuge"},{value:"shared-project",label:"Shared project"},{value:"discovery",label:"Discovery"},{value:"homecoming",label:"Homecoming"},{value:"something-else",label:"Something else"}],l0={roads:!0,structures:!1,water:!1},r0=["Village identity","Connections","Village map","Build the village","Review"],s0=1,tp=3,ap="__villages_image_disabled__",dc=["neutral","happy","sad","angry","surprised","thinking"];function u0(e,t,a,n,o=!1,l=1){let u=t==="gathering"?"Gathering Place":o?"Your residence":`Residence ${l}`;return{id:e,name:u,form:t==="gathering"?"Gathering place":"Home",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],purpose:"",description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:n},occupancy:{playerHome:o,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""},guidance:""}}function L5(e){let t=[];for(let a of e){let n=t[t.length-1];n&&n.label===a.dateLabel?n.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}function up(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":O0.format(t)}function G5(e){return up(e.occurredAt)}function Y5(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function c0(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function np(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var j5=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function X5(e,t){let a=[],n=Date.parse(e);if(Number.isFinite(n)){let l=Math.floor((Date.now()-n)/864e5);a.push(l<=0?"written today":l===1?"written yesterday":`written ${l} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${j5.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function Q5(e,t){let a=e.find(n=>n.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(n=>n.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?qe(a,t.spaceClass).image:null)?.url??"":""}var cp=class extends m.Component{constructor(){super(...arguments);bg(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let n=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=n,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:n},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${i}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h1",{className:`${i}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${i}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},Z5=`
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
`;function d0(){let e=document.getElementById(i0);if(!document.querySelector(i)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=i0,t.textContent=Z5,document.head.appendChild(t)}var K5="marinara_admin_secret";function k0(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(K5)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var J5="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function C0(e,t,a){let n=e?.error,o=typeof n=="string"&&n?n:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${J5} (${o})`):new Error(o)}async function _(e,t){let a=await fetch(`${B5}${e}`,{...t,headers:k0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw C0(n,a.status,`The village replied ${a.status}.`);return jw(n)}async function mp(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:k0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw C0(n,a.status,`The Engine replied ${a.status}.`);return n}var ji=e=>typeof e=="number"&&Number.isFinite(e);function A0(e){let t=e;for(let x=0;x<2&&typeof t=="string";x+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:n,srcY:o,srcWidth:l,srcHeight:u}=a;if(ji(n)&&ji(o)&&ji(l)&&ji(u))return l<=0||u<=0||n<0||o<0||n+l>1.001||o+u>1.001?null:{srcX:n,srcY:o,srcWidth:l,srcHeight:u};let{zoom:c,offsetX:h,offsetY:g,fullImage:y}=a;return!ji(c)||c<=0||!ji(h)||!ji(g)||y!==void 0&&typeof y!="boolean"?null:y===void 0?{zoom:c,offsetX:h,offsetY:g}:{zoom:c,offsetX:h,offsetY:g,fullImage:y}}function F5(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function P5(e,t){if(e.length===0)return{};let a=await mp("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),n={};if(!Array.isArray(a))return n;for(let o of a){let l=typeof o?.id=="string"?o.id:"",u=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";l.length>0&&u.length>0&&(n[l]={url:u,crop:A0(o.avatarCrop)})}return n}async function W5(e,t){let a=e.trim();if(a.length===0)return null;let n=await mp(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof n?.avatarPath=="string"?n.avatarPath.trim():"";return o.length===0?null:{url:o,crop:A0(n.avatarCrop)}}function eS(e){let t=[];for(let a of e){let n=typeof a.id=="string"?a.id.trim():"";if(n.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let l=typeof a.name=="string"&&a.name.trim()?a.name.trim():n;t.push({id:n,name:l,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function I(e,t){return e instanceof Error&&e.message?e.message:t}function qr(e){let t=I(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function h0(e){try{let{session:t}=await _("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}function m0(e){let t=I(e,"The greeting could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The greeting took too long. Retry it or continue without a greeting.":`${t} Retry it or continue without a greeting.`}function Ir(e,t){return z0(Lw(e),t)}function z0(e,t){let a=0;return e.map(n=>{let o=`${t}${a++}`;switch(n.kind){case"text":return n.text;case"code":return(0,r.jsx)("code",{className:`${i}-chat-md-code`,dir:"ltr",children:n.text},o);case"link":return(0,r.jsx)("a",{className:`${i}-chat-md-link`,href:n.href,target:"_blank",rel:"noopener noreferrer",children:n.text},o);default:return tS(n,o)}})}function tS(e,t){let a=z0(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${i}-chat-md-highlight`,children:a},t)}}function aS(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function fl(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var M0=["residence","workplace","gathering","other"];function zn(e){return e.classes?.length?e.classes:fl(e)?["residence"]:["other"]}function p0(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function hc(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function qe(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function g0({draft:e,existing:t,villagers:a,editableClasses:n,onChange:o}){let l=zn(e),u=(c,h)=>{let g=l.map(y=>y===c?{...qe(e,y),...h}:qe(e,y));o({...e,spaces:g,description:g[0]?.description??e.description})};return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.name,maxLength:100,onChange:c=>o({...e,name:c.target.value}),placeholder:"The Lantern Workshop"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form ",(0,r.jsx)("span",{className:`${i}-hint`,children:"What is it, in your world?"}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.form??"",maxLength:200,onChange:c=>o({...e,form:c.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Purpose",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.purpose,maxLength:200,onChange:c=>o({...e,purpose:c.target.value}),placeholder:"What happens here?"})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map pin \xB7 optional"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,r.jsx)("div",{className:`${i}-row`,children:["x","y"].map(c=>(0,r.jsxs)("label",{className:`${i}-label`,children:[c==="x"?"Across":"Down",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[c]??"",disabled:t&&hc(e)>0,onChange:h=>o({...e,presentation:{...e.presentation,[c]:h.target.value===""?null:Number(h.target.value)}})})]},c))}),t&&hc(e)>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:M0.map(c=>(0,r.jsxs)("label",{className:`${i}-label`,style:{textTransform:"capitalize"},children:[(0,r.jsx)("input",{type:"checkbox",checked:l.includes(c),disabled:t||!l.includes(c)&&l.length>=2,onChange:h=>{let g=h.target.checked?[...l,c]:l.filter(y=>y!==c);g.length<1||g.length>2||o({...e,classes:g,spaces:g.map(y=>qe(e,y))})}})," ",c]},c))}),t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Class changes go through a Venue proposal."}):null]}),l.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:c=>o({...e,residenceCapacity:Number(c.target.value)})}),t?(0,r.jsx)("span",{className:`${i}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,l.includes("workplace")?(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Workers"}),a.map(c=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(c.characterId),onChange:h=>o({...e,workerIds:h.target.checked?[...e.workerIds??[],c.characterId]:(e.workerIds??[]).filter(g=>g!==c.characterId)})})," ",c.name]},c.characterId)),a.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No villagers are available yet."}):null]}):null,l.filter(c=>!n||n.includes(c)).map(c=>{let h=qe(e,c);return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,style:{textTransform:"capitalize"},children:[c," space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.description,maxLength:1e3,onChange:g=>u(c,{description:g.target.value})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Current physical state used by visits and pictures."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:h.state.condition,onChange:g=>u(c,{state:{...h.state,condition:g.target.value}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.items.join(`
`),onChange:g=>u(c,{state:{...h.state,items:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.publicFacts.join(`
`),onChange:g=>u(c,{state:{...h.state,publicFacts:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((g,y)=>(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,value:g.text,"aria-label":`Feature ${y+1}`,onChange:x=>u(c,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,text:x.target.value}:f)}})}),(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g.locked,onChange:x=>u(c,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,locked:x.target.checked}:f)}})})," ","Locked"]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,"aria-label":`Remove feature ${y+1}`,onClick:()=>u(c,{state:{...h.state,features:h.state.features.filter(x=>x.id!==g.id)}}),children:"\xD7"})]},g.id)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:h.state.features.length>=5,onClick:()=>u(c,{state:{...h.state,features:[...h.state.features,{id:rc(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},c)})]})}function dp(e){return e.filter(t=>fl(t))}function An(e){return e.filter(t=>!fl(t)||zn(t).some(a=>a!=="residence"))}function nS(e,t){let a=dp(e);return a.length!==t.length?!1:t.every((n,o)=>{let l=a[o];return l.id===n.id&&l.name===n.name&&(l.form??"Home")===n.form&&l.occupancy.playerHome===n.isPlayerHome&&l.occupancy.residentCharacterId===n.characterId&&l.description===n.description&&Math.abs((l.presentation.x??-1)-(n.x??-1))<1e-4&&Math.abs((l.presentation.y??-1)-(n.y??-1))<1e-4})}function iS(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let l=a.get(o.id);return{id:o.id,name:o.name,form:o.form,classes:["residence"],spaces:[{...qe(l??{id:o.id,name:o.name,description:o.description,purpose:"",category:"",presentation:{image:null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}},"residence"),description:o.description}],residenceCapacity:l?.residenceCapacity??1,residentIds:o.characterId?[o.characterId]:[],improvements:l?.improvements??[null,null],purpose:l?.purpose??"",description:o.description,category:l?.category??"",presentation:{image:l?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:l?.capabilities??[],state:l?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...e.filter(o=>!fl(o))]}function Xi(){return Math.random().toString(36).slice(2,10)}function Qi(e){return Math.round(e*1e4)/1e4}var oS=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),O0=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),lS=6e4,rS=700;function f0(e){return`${oS.format(e)} \xB7 ${O0.format(e)}`}function sS(){let[e,t]=(0,m.useState)(()=>f0(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(f0(new Date)),1e3);return()=>clearInterval(a)},[]),e}function uS(){let[e,t]=sS().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${i}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function cS({weather:e}){return(0,r.jsxs)("span",{className:`${i}-mobile-datetime`,children:[(0,r.jsx)(uS,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:dS(e)})]})}function dS(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function b0(e){return e?.closest(i)??null}function hS(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(b0(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,n=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":n,title:n,onClick:o=>{let l=b0(o.currentTarget);if(!l)return;if(document.fullscreenElement===l){document.exitFullscreen().catch(()=>{});return}let u=l.requestFullscreen?.();u&&u.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function mS({happenings:e,recap:t,mobile:a=!1}){let n=(0,m.useRef)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let u=n.current;if(!u)return;let c=()=>l(u.open);return u.addEventListener("toggle",c),()=>u.removeEventListener("toggle",c)},[]),(0,m.useEffect)(()=>{if(!o)return;let u=c=>{!(c.target instanceof Node)||n.current?.contains(c.target)||n.current?.removeAttribute("open")};return document.addEventListener("pointerdown",u),document.addEventListener("keydown",u),()=>{document.removeEventListener("pointerdown",u),document.removeEventListener("keydown",u)}},[o]),(0,r.jsxs)("details",{ref:n,className:`${i}-news`,children:[(0,r.jsxs)("summary",{className:`${i}-button ${i}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${i}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${i}-news-panel`,children:[(0,r.jsx)("h2",{className:`${i}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${i}-news-list`,children:t.details.map(u=>(0,r.jsx)("li",{className:`${i}-news-item`,children:u.text},`recap-${u.id}`))}):null,t.summaries.map(u=>(0,r.jsx)("p",{className:`${i}-news-empty`,children:u},u)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${i}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${i}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${i}-news-list`,children:e.map(u=>(0,r.jsx)("li",{className:`${i}-news-item`,children:u.text},u.id))})]})]})}function R0(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function pS(e){return e.length>0?R0(e,!0):"Empty house"}function v0(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function y0(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function gS(e,t){return t.length>0?R0(t,!0):e.name||"An empty house"}function Br(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var fS=.028;function Lr(e){return new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(typeof n.result=="string"?n.result:""),n.onerror=()=>a(new Error("That picture could not be read.")),n.readAsDataURL(e)})}function ip(e){return new Promise((t,a)=>{let n=new Image;n.onload=()=>t({width:n.naturalWidth,height:n.naturalHeight}),n.onerror=()=>a(new Error("That picture could not be read.")),n.src=e})}var w0=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function op(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function lp(e,t,a){return e<t?t:e>a?a:e}function bS(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let u=Math.min(t.width/e.width,t.height/e.height),c=e.width*u,h=e.height*u;return{left:(t.width-c)/2,top:(t.height-h)/2,width:c,height:h}}let n=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*n,l=e.height*n;return{left:(t.width-o)*(a.focusX/100),top:(t.height-l)*(a.focusY/100),width:o,height:l}}function vS(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function cc(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function rp({src:e,alt:t,pins:a,placing:n,view:o,shape:l,zoom:u,onPlace:c,onView:h,onDismiss:g,compact:y,fitToRoom:x,mobile:f,photoPins:v,children:z}){let T=c!==void 0,V=h!==void 0,w=(0,m.useRef)(null),b=(0,m.useRef)(null),[N,E]=(0,m.useState)(null),[R,F]=(0,m.useState)(null),[L,Y]=(0,m.useState)(null),me=(0,m.useRef)(null),Q=(0,m.useRef)(new Map),De=(0,m.useRef)(null),[Te,Tt]=(0,m.useState)(null),[Aa,pt]=(0,m.useState)(null),It=(0,m.useRef)(null),U=(0,m.useRef)(null),j=(0,m.useRef)(!1),[Xe,Ba]=(0,m.useState)(null),pe=(0,m.useMemo)(()=>Xe?{...o,...Xe}:o,[Xe,o]),gt=e?N?.src===e?N:null:l,ma={zoom:gt&&R?sc(gt,R):1,centerX:.5,centerY:.5},Pt=L??ma,q=(0,m.useMemo)(()=>f?gt&&R?Pm(gt,R,Pt):null:e?N&&N.src===e&&R?bS(N,R,pe):null:R?{left:0,top:0,width:R.width,height:R.height}:null,[N,R,pe,f,gt,Pt,e]);(0,m.useEffect)(()=>{Y(null),me.current=null,Q.current.clear(),De.current=null},[e,R?.width,R?.height]);let Be=l?x&&Te?{width:`${Te.width}px`,height:`${Te.height}px`,aspectRatio:`${l.width} / ${l.height}`}:{aspectRatio:`${l.width} / ${l.height}`}:void 0,te=(0,m.useCallback)(()=>{let k=b.current;if(!k)return;let H=k.getBoundingClientRect();H.width===0||H.height===0||F(ae=>ae&&ae.width===H.width&&ae.height===H.height?ae:{width:H.width,height:H.height})},[]);(0,m.useEffect)(()=>{let k=b.current;if(!k||typeof ResizeObserver>"u")return;let H=new ResizeObserver(()=>te());return H.observe(k),()=>H.disconnect()},[te]);let lt=(0,m.useCallback)(()=>{let k=w.current?.parentElement;if(!k||!l)return;let H=k.getBoundingClientRect(),ae=getComputedStyle(k),B=et=>Number.parseFloat(ae.getPropertyValue(et))||0,Ke=H.width-B("padding-left")-B("padding-right"),Ie=H.height-B("padding-top")-B("padding-bottom"),st=l.width/l.height,ut=Math.min(Ke,Ie*st);ut>0&&Tt(et=>et&&Math.abs(et.width-ut)<.5?et:{width:ut,height:ut/st})},[l]);(0,m.useLayoutEffect)(()=>{if(!x||(lt(),typeof ResizeObserver>"u"))return;let k=w.current?.parentElement;if(!k)return;let H=new ResizeObserver(()=>lt());return H.observe(k),()=>H.disconnect()},[x,lt]);let pa=(0,m.useCallback)(k=>{if(!T||!c||!q)return;let H=k.currentTarget.getBoundingClientRect(),ae=(k.clientX-H.left-q.left)/q.width,B=(k.clientY-H.top-q.top)/q.height;if(!(ae>=0&&ae<=1)||!(B>=0&&B<=1))return;let Ie=b.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();c(Qi(ae),Qi(B),{width:q.width,height:q.height,photoWidth:Ie?.width??58,photoHeight:Ie?.height??58})},[c,T,q]),rt=(0,m.useCallback)(k=>{if(!V||!q||!h||pe.fit!=="cover")return;let H=k.currentTarget.getBoundingClientRect();It.current={x:k.clientX,y:k.clientY,focusX:pe.focusX,focusY:pe.focusY,spanX:H.width-q.width,spanY:H.height-q.height},Ba({focusX:pe.focusX,focusY:pe.focusY}),k.currentTarget.setPointerCapture(k.pointerId),k.preventDefault()},[V,pe.focusX,pe.focusY,pe.fit,h,q]),Mt=(0,m.useCallback)(k=>{let H=It.current;if(!H)return;let ae=H.spanX===0?H.focusX:H.focusX+(k.clientX-H.x)/H.spanX*100,B=H.spanY===0?H.focusY:H.focusY+(k.clientY-H.y)/H.spanY*100;Ba({focusX:Qi(lp(ae,0,100)),focusY:Qi(lp(B,0,100))})},[]),le=(0,m.useCallback)(k=>{if(!It.current)return;It.current=null,k.currentTarget.hasPointerCapture(k.pointerId)&&k.currentTarget.releasePointerCapture(k.pointerId);let H=Xe;Ba(null),H&&h&&h({...o,...H})},[Xe,h,o]),cn=(0,m.useCallback)(k=>{!h||!u||h({...o,zoom:Qi(lp(k,u.min,u.max))})},[h,o,u]),Lt=()=>{let k=[...Q.current.values()];if(k.length===0){De.current=null;return}let H=k[0],ae=k[1];De.current={view:me.current??Pt,x:ae?(H.x+ae.x)/2:H.x,y:ae?(H.y+ae.y)/2:H.y,distance:ae?Math.hypot(H.x-ae.x,H.y-ae.y):1}},Ia=k=>{if(!f||k.pointerType!=="touch"||(k.isPrimary&&(Q.current.clear(),j.current=!1),!b.current)||k.target instanceof Element&&k.target.closest(`.${i}-doors, .${i}-zoom`))return;w.current?.setAttribute("data-mobile-gesturing","true");let H=b.current.getBoundingClientRect();Q.current.set(k.pointerId,{x:k.clientX-H.left,y:k.clientY-H.top}),Q.current.size>1&&(j.current=!0),Lt()},Ki=k=>{if(!f||!Q.current.has(k.pointerId)||!gt||!R||!b.current)return;let H=b.current.getBoundingClientRect();Q.current.set(k.pointerId,{x:k.clientX-H.left,y:k.clientY-H.top});let ae=[...Q.current.values()],B=ae[0],Ke=ae[1],Ie=Ke?(B.x+Ke.x)/2:B.x,st=Ke?(B.y+Ke.y)/2:B.y,ut=Ke?Math.hypot(B.x-Ke.x,B.y-Ke.y):1,et=De.current;if(!et||!Fw(et,{x:Ie,y:st,distance:ut})&&!j.current)return;j.current||g?.(),j.current=!0;let Ve=Pw(gt,R,et.view,{x:et.x,y:et.y},{x:Ie,y:st},Ke&&et.distance>0?ut/et.distance:1);me.current=Ve,Y(Ve)},ft=(k,H=!1)=>{if(!f||!Q.current.has(k.pointerId))return;let ae=!H&&Q.current.size===1&&!j.current;if(Q.current.delete(k.pointerId),Q.current.size===0&&w.current?.removeAttribute("data-mobile-gesturing"),Lt(),!ae||!(k.target instanceof Element))return;let B=k.target.closest(`.${i}-pin`)?.dataset.pinId,Ke=B?a.find(Ie=>Ie.id===B):null;if(Ke?.onSelect){j.current=!0,Ke.onSelect();return}if(!(!k.target.closest(`.${i}-canvas`)||k.target.closest("button")))if(T&&n&&c&&q){let Ie=b.current.getBoundingClientRect(),st=(k.clientX-Ie.left-q.left)/q.width,ut=(k.clientY-Ie.top-q.top)/q.height;if(st>=0&&st<=1&&ut>=0&&ut<=1){j.current=!0;let A=b.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();c(Qi(st),Qi(ut),{width:q.width,height:q.height,photoWidth:A?.width??72,photoHeight:A?.height??72})}}else g&&(j.current=!0,g())};return(0,r.jsxs)("div",{ref:w,className:`${i}-stage${y?` ${i}-stage-compact`:""}`,style:Be,"data-shaped":l?"true":"false","data-framing":V&&pe.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":v?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:k=>{if(f){Ia(k);return}j.current=!1,U.current=k.pointerType==="touch"?{x:k.clientX,y:k.clientY}:null},onPointerMoveCapture:k=>{if(f){Ki(k);return}let H=U.current;H&&(Math.abs(k.clientX-H.x)>8||Math.abs(k.clientY-H.y)>8)&&(j.current=!0)},onPointerUpCapture:f?ft:void 0,onPointerCancelCapture:k=>{f&&ft(k,!0),U.current&&(j.current=!0)},onClickCapture:k=>{j.current&&(j.current=!1,k.preventDefault(),k.stopPropagation())},children:[z,(0,r.jsxs)("div",{ref:b,className:`${i}-canvas`,"data-placing":T&&n?"true":"false","data-dragging":Xe?"true":"false",onClick:T&&n?pa:g?()=>g():void 0,onPointerDown:V?rt:void 0,onPointerMove:V?Mt:void 0,onPointerUp:V?le:void 0,onPointerCancel:V?le:void 0,children:[e?(0,r.jsx)("img",{className:`${i}-canvas-img`,style:f&&q?{position:"absolute",left:q.left,top:q.top,width:q.width,height:q.height,objectFit:"fill"}:vS(pe),src:e,alt:t,draggable:!1,onLoad:k=>{let{naturalWidth:H,naturalHeight:ae}=k.currentTarget;H<=0||ae<=0||(E({src:e,width:H,height:ae}),te())},onError:()=>pt(e)}):(0,r.jsxs)(r.Fragment,{children:[f&&q?(0,r.jsx)("span",{className:`${i}-mobile-logical`,style:{left:q.left,top:q.top,width:q.width,height:q.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${i}-canvas-empty`,children:"Logical village map"})]}),e&&Aa===e?(0,r.jsx)("span",{className:`${i}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,q?a.map(k=>(0,r.jsxs)("span",{className:`${i}-pin-holder`,"data-selected":k.selected?"true":"false",style:{left:`${q.left+k.x*q.width}px`,top:`${q.top+(k.y+(f&&k.kind!=="person"?0:k.dy??0))*q.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${i}-pin`,"data-pin-id":k.id,"data-tone":k.tone,"data-kind":k.kind??"place","data-selected":k.selected?"true":"false","aria-expanded":k.doors?!0:void 0,disabled:k.onSelect===void 0,title:k.text,onClick:H=>{H.stopPropagation(),k.onSelect?.()},children:(f||v)&&k.kind!=="person"?(0,r.jsxs)("span",{className:`${i}-pin-photo-card`,style:{transform:`scale(${e0(f?Ww(Pt.zoom,ma.zoom):I5,k.selected===!0)})`},children:[(0,r.jsxs)("span",{className:`${i}-pin-photo`,"aria-hidden":"true",children:[k.image?(0,r.jsx)("img",{src:k.image,alt:"",loading:"lazy",draggable:!1}):(0,r.jsx)("span",{className:`${i}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,r.jsx)("span",{className:`${i}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:k.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${i}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:k.text})]})}),k.onRemove?(0,r.jsx)("button",{type:"button",className:`${i}-pin-remove`,"aria-label":`Take ${k.text} off the map`,onClick:H=>{H.stopPropagation(),k.onRemove?.()},children:"\xD7"}):null,k.onResume?(0,r.jsx)("button",{type:"button",className:`${i}-pin-resume`,onClick:H=>{H.stopPropagation(),k.onResume?.()},children:"DEBUG: Resume Chat"}):null]},k.id)):null]}),q?a.filter(k=>k.doors!==void 0&&k.doors.length>0).map(k=>(0,r.jsx)("div",{className:`${i}-doors`,style:{left:`${R?Wm(q,R,k).left:q.left+k.x*q.width}px`,top:`${R?Wm(q,R,k).top:q.top+(k.y+(k.dy??0))*q.height}px`},children:k.doors?.map(H=>(0,r.jsx)("button",{type:"button",className:`${i}-door`,onClick:ae=>{ae.stopPropagation(),H.onSelect()},children:H.label},H.label))},`doors:${k.id}`)):null,V&&u&&pe.fit==="cover"?(0,r.jsxs)("div",{className:`${i}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:pe.zoom>=u.max,onClick:()=>cn(pe.zoom+u.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:pe.zoom<=u.min,onClick:()=>cn(pe.zoom-u.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:pe.focusX===50&&pe.focusY===50&&pe.zoom===u.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:u.min})},children:"Centre"})]}):null]})}function Zi(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function $0({idPrefix:e,personas:t,draft:a,onDraft:n,storedId:o,storedName:l,storedMissing:u,disabled:c}){let h=(t??[]).find(f=>f.id===a)??null,g=h?.name??(a===o?l:""),y=u&&a===o,x=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${i}-${e}-persona`,className:`${i}-select`,value:a,disabled:c||t===null||t.length===0,onChange:f=>n(f.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,r.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),x?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:y?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${i}-macro-help`,children:h.summary}):null]}):null]})}function x0({books:e,error:t,selected:a,onChange:n,disabled:o}){let l=new Map((e??[]).map(h=>[h.id,h])),u=(e??[]).filter(h=>!h.hiddenFromLibrary||a.includes(h.id)),c=a.filter(h=>!l.has(h));return(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No lorebooks in the Engine library."}):null,[...u,...c.map(h=>({id:h,name:h,enabled:!1}))].map(h=>{let g=a.includes(h.id),y=c.includes(h.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":h.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g,disabled:o||!h.enabled&&!g,onChange:()=>n(g?a.filter(x=>x!==h.id):[...a,h.id])}),h.name,y?` (${y})`:""]},h.id)})]})}function yS({homes:e,villagers:t,disabled:a,selectedId:n,onPatch:o,onRemove:l,onSelect:u,lockedIds:c,showDescriptions:h,onGenerateDescription:g}){let y=new Set(e.map(x=>x.characterId));return(0,r.jsx)("div",{className:`${i}-home-list`,children:e.map((x,f)=>{let v=c?.has(x.id)??!1,z=t.find(T=>T.id===x.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${i}-home-row`,"data-selected":x.id===n?"true":"false",onMouseEnter:()=>u(x.id),children:[(0,r.jsx)("span",{className:`${i}-home-index`,"aria-hidden":"true",children:f+1}),x.isPlayerHome?(0,r.jsx)("span",{className:`${i}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-who`,children:z?`${z} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${i}-select`,value:x.characterId??"",disabled:a||v,"aria-label":`Who lives in home ${f+1}`,onChange:T=>o(x.id,{characterId:T.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(T=>{let V=T.id!==x.characterId&&y.has(T.id);return(0,r.jsx)("option",{value:T.id,disabled:V,children:V?`${T.name} \u2014 already housed`:T.name},T.id)})]}):null]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Venue name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:x.name,maxLength:60,disabled:a||v,onChange:T=>o(x.id,{name:T.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:x.form,maxLength:240,disabled:a||v,onChange:T=>o(x.id,{form:T.target.value}),placeholder:"Cabin, truck, sleeping pod\u2026"})]}),h?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("textarea",{className:`${i}-textarea`,value:x.description,maxLength:1e3,disabled:a||v,"aria-label":`Description of home ${f+1}`,onChange:T=>o(x.id,{description:T.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:a||v,onClick:()=>g?.(x),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:a||v,"aria-label":`Take home ${f+1} off the map`,onClick:()=>l(x.id),children:"\xD7"}),v?(0,r.jsx)("span",{className:`${i}-hint`,children:"Move approved and completed before changing this home."}):null]},x.id)})})}function N0({id:e,label:t,hint:a,options:n,value:o,disabled:l,onChange:u}){let c=o.length>0&&!n.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${i}-select`,value:o,disabled:l,onChange:h=>u(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),c?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,n.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a})]})}function sp({onSetupProblem:e,onImageWarningChange:t}){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)([]),[u,c]=(0,m.useState)(""),[h,g]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let T=!1;return(async()=>{try{let[V,w]=await Promise.all([_("/connections"),mp("/api/connections")]);if(T)return;n(V),l(eS(Array.isArray(w)?w:[]))}catch(V){T||c(I(V,"This agent's connections could not be read."))}})(),()=>{T=!0}},[]);let y=(0,m.useCallback)(async T=>{g(!0),c("");try{n(await _("/connections",{method:"PUT",body:JSON.stringify(T)}))}catch(V){c(I(V,"That connection could not be saved."))}finally{g(!1)}},[]),x=o.filter(T=>T.category==="language"),f=o.filter(T=>T.category==="image_generation"),v=f.some(T=>T.defaultForAgents),z=a!==null&&(a.imageConnectionId===ap||f.length===0||a.imageConnectionId.length===0&&!v);return(0,m.useEffect)(()=>{if(!e)return;let T=a?.systemConnectionId??"",V=a?.narrationConnectionId??"";a?T.length===0||V.length===0?e("Choose both System and Narration connections before continuing."):!x.some(w=>w.id===T)||!x.some(w=>w.id===V)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,a,x]),(0,m.useEffect)(()=>{t?.(z)},[z,t]),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Connections"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),a?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(N0,{id:`${i}-connection-system`,label:"System",hint:"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:x,value:a.systemConnectionId,disabled:h,onChange:T=>{y({systemConnectionId:T})}}),(0,r.jsx)(N0,{id:`${i}-connection-narration`,label:"Narration",hint:"Everything the villagers say to you, and how the conversation reads back afterwards.",options:x,value:a.narrationConnectionId,disabled:h,onChange:T=>{y({narrationConnectionId:T})}}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${i}-connection-image`,className:`${i}-select`,value:a.imageConnectionId,disabled:h,onChange:T=>{y({imageConnectionId:T.target.value})},children:[(0,r.jsx)("option",{value:ap,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),a.imageConnectionId.length>0&&a.imageConnectionId!==ap&&!f.some(T=>T.id===a.imageConnectionId)?(0,r.jsx)("option",{value:a.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,f.map(T=>(0,r.jsx)("option",{value:T.id,children:T.name},T.id))]}),(0,r.jsxs)("span",{className:`${i}-hint`,children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${i}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})]})]}):u.length===0?(0,r.jsx)("span",{className:`${i}-hint`,children:"Reading this agent's connections\u2026"}):null,u?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:u}):null]})}function V0(){let[e,t]=(0,m.useState)(null),[a,n]=(0,m.useState)(""),[o,l]=(0,m.useState)(!1),[u,c]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return _("/narration").then(y=>{g||t(y)}).catch(y=>{g||n(I(y,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{l(!0),c(!1),n("");try{let y=await _("/narration",{method:"PUT",body:JSON.stringify(g)});return t(y),c(!0),y}catch(y){return n(I(y,"That writing change could not be saved.")),null}finally{l(!1)}},[]);return{view:e,error:a,busy:o,saved:u,save:h}}function wS(){let{view:e,error:t,busy:a,saved:n,save:o}=V0(),[l,u]=(0,m.useState)(null),c=l??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:i+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Narration style",value:c,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>u(h.target.value)}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.styleInstructions,onClick:()=>{o({styleInstructions:c}).then(h=>{h&&u(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&u(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:i+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function $S(){let{view:e,error:t,busy:a,saved:n,save:o}=V0(),[l,u]=(0,m.useState)(null),c=l??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:i+"-panel",children:[(0,r.jsx)("h2",{className:i+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:i+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Villager reply guidance",value:c,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>u(h.target.value)}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.replyGuidance,onClick:()=>{o({replyGuidance:c}).then(h=>{h&&u(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&u(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:i+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function gl({portrait:e,name:t,className:a,glyph:n="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:F5(e.crop)}):n==="person"?(0,r.jsxs)("svg",{className:`${i}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function xS({villager:e,portrait:t,selected:a,onSelect:n}){return(0,r.jsxs)("div",{className:`${i}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-tile-head`,children:[(0,r.jsx)(gl,{portrait:t,name:e.name,className:`${i}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${i}-tile-name`,onClick:n,disabled:n===void 0,title:n?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${i}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${i}-tag`,children:o},o))]})]})}function S0(e,t){let a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function NS(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((x,f)=>{let v=z=>{let T=dc.indexOf(z);return T<0?dc.length:T};return v(x.label)-v(f.label)||x.label.localeCompare(f.label)||x.view.localeCompare(f.view)}),n=512,o=768,l=2,u=document.createElement("canvas");u.width=l*n,u.height=Math.ceil(a.length/l)*o;let c=u.getContext("2d");if(!c)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let x=0;x<a.length;x+=1){let f=a[x],v=new Image;v.src=f.url,await v.decode();let z=x%l*n,T=Math.floor(x/l)*o,V=Math.min(n/v.naturalWidth,o/v.naturalHeight),w=Math.round(v.naturalWidth*V),b=Math.round(v.naturalHeight*V);c.drawImage(v,z+Math.floor((n-w)/2),T+o-b,w,b),h.push({view:f.view,expression:f.label,x:z,y:T,width:n,height:o})}let g=await new Promise((x,f)=>u.toBlob(v=>v?x(v):f(new Error("The browser could not export this sheet.")),"image/png")),y=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";S0(`${y}-sprites.png`,g),S0(`${y}-sprites.json`,new Blob([JSON.stringify({width:u.width,height:u.height,cells:h},null,2)],{type:"application/json"}))}function SS({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[n,o]=(0,m.useState)("front"),[l,u]=(0,m.useState)("neutral"),[c,h]=(0,m.useState)(""),[g,y]=(0,m.useState)(""),[x,f]=(0,m.useState)(!0),[v,z]=(0,m.useState)(null),[T,V]=(0,m.useState)([]),[w,b]=(0,m.useState)(!1),[N,E]=(0,m.useState)(""),[R,F]=(0,m.useState)(""),L=(0,m.useRef)(null),Y=e.sprite?.images??[],me=Y.filter(U=>U.view===n),Q=Y.some(U=>U.view==="front"&&U.label==="neutral"),De=me.some(U=>U.label==="neutral"),Te=l==="custom"?c.trim().toLowerCase().replace(/\s+/g,"_"):l,Tt=me.find(U=>U.label===Te),Aa=[...dc,...Y.map(U=>U.label).filter(U=>!dc.includes(U))].filter((U,j,Xe)=>Xe.indexOf(U)===j);(0,m.useEffect)(()=>{z(null),o("front"),u("neutral"),E(""),_(`${a}/source`).then(U=>V(U.sprites)).catch(()=>V([]))},[a]);async function pt(U){b(!0),E(""),F("");try{await U()}catch(j){E(I(j,"The sprite could not be prepared."))}finally{b(!1)}}function It(){if(!/^[a-z0-9_-]{1,40}$/.test(Te))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(n==="side"&&!Q)throw new Error("Approve the front neutral sprite first.");if(Te!=="neutral"&&!De)throw new Error(`Approve the ${n} neutral sprite first.`);return Te}return(0,r.jsxs)("section",{className:`${i}-sprite-editor`,"aria-label":`${e.name} sprite studio`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-heading`,children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{children:[e.name,"'s sprite studio"]}),(0,r.jsx)("p",{children:"Build a front view for player conversations and one side profile for villager-to-villager moments."})]}),(0,r.jsxs)("span",{className:`${i}-sprite-count`,children:[Y.length," approved"]})]}),(0,r.jsx)("div",{className:`${i}-sprite-views`,"aria-label":"Sprite view",children:["front","side"].map(U=>(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-view`,"aria-pressed":n===U,"data-active":n===U?"true":"false",disabled:w,onClick:()=>{o(U),u("neutral"),z(null)},children:[(0,r.jsx)("strong",{children:U==="front"?"Facing you":"Facing villagers"}),(0,r.jsxs)("span",{children:[Y.filter(j=>j.view===U).length," approved \xB7"," ",U==="front"?"front":"side, mirrored left or right"]})]},U))}),(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Choose an expression"}),(0,r.jsx)("span",{children:"Only approved images appear in scenes."})]}),(0,r.jsxs)("div",{className:`${i}-sprite-choices`,children:[Aa.map(U=>{let j=me.find(Xe=>Xe.label===U);return(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":l===U?"true":"false","aria-pressed":l===U,disabled:w,onClick:()=>{u(U),z(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,children:j?(0,r.jsx)("img",{src:j.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:"\uFF0B"})}),(0,r.jsx)("span",{children:U}),(0,r.jsx)("small",{children:j?"Approved":"Open"})]},U)}),(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":l==="custom"?"true":"false","aria-pressed":l==="custom",disabled:w,onClick:()=>{u("custom"),z(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,"aria-hidden":"true",children:"\u2726"}),(0,r.jsx)("span",{children:"Custom"}),(0,r.jsx)("small",{children:"Name your own"})]})]}),l==="custom"?(0,r.jsxs)("label",{children:["Custom expression name",(0,r.jsx)("input",{value:c,maxLength:40,disabled:w,onChange:U=>{h(U.target.value),z(null)}})]}):null,(0,r.jsxs)("div",{className:`${i}-sprite-selected`,children:[(0,r.jsxs)("strong",{children:[n==="front"?"Front":"Side"," \xB7 ",Te||"custom"]}),(0,r.jsx)("span",{children:Tt?"Approved art is ready. You can replace it after reviewing a new candidate.":"No approved art yet."})]}),n==="side"&&!Q?(0,r.jsx)("p",{className:`${i}-hint`,children:"Start with an approved front neutral sprite to keep the side profile recognizable."}):null,Te!=="neutral"&&!De?(0,r.jsx)("p",{className:`${i}-hint`,children:"Approve this view's neutral sprite before adding expressions."}):null,(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:g,maxLength:2e3,disabled:w,onChange:U=>y(U.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${i}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:x,disabled:w,onChange:U=>f(U.target.checked)})," ","Use an approved neutral or available portrait as the identity reference"]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${i}-sprite-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||n==="side"&&!Q||Te!=="neutral"&&!De,onClick:()=>{pt(async()=>{let U=It(),j=await _(`${a}/generate`,{method:"POST",body:JSON.stringify({view:n,expression:U,appearance:g,useReference:x})});z({view:n,label:U,image:j.image}),F(`Candidate: ${j.width} \xD7 ${j.height}. Review before approving.`)})},children:w?"Working\u2026":`Generate ${n} ${Te||"sprite"} \xB7 1 image request`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||n==="side"&&!Q||Te!=="neutral"&&!De,onClick:()=>L.current?.click(),children:"Upload candidate"}),(0,r.jsx)("input",{ref:L,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:U=>{pt(async()=>{let j=It(),Xe=U.target.files?.[0];Xe&&z({view:n,label:j,image:await Lr(Xe)}),U.target.value=""})}})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"One cell per click. Approval, mirroring, and export use no image API. If the selected Engine connection fails, its configured fallback may make another provider attempt."}),v?(0,r.jsxs)("div",{className:`${i}-sprite-candidate`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Review candidate"}),(0,r.jsxs)("span",{children:[v.view," \xB7 ",v.label]})]}),(0,r.jsxs)("div",{className:`${i}-sprite-candidate-views`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:v.image,alt:`${v.view} ${v.label} candidate for ${e.name}`}),(0,r.jsx)("span",{children:v.view==="side"?"Facing right":"Facing you"})]}),v.view==="side"?(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{className:`${i}-sprite-mirrored`,src:v.image,alt:""}),(0,r.jsx)("span",{children:"Mirrored left \xB7 no extra image"})]}):null]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>{pt(async()=>{let U=await _(`${a}/approve`,{method:"POST",body:JSON.stringify({view:v.view,expression:v.label,image:v.image})});t(U),z(null),F(`${v.view} ${v.label} approved.`)})},children:"Approve this sprite"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>z(null),children:"Discard candidate"})]})]}):null,T.length&&n==="front"?(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Copy an existing Engine full-body sprite"}),(0,r.jsx)("div",{className:`${i}-row`,children:T.map(U=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||U.expression!=="neutral"&&!De,onClick:()=>{pt(async()=>{let j=await _(`${a}/import`,{method:"POST",body:JSON.stringify({view:n,expression:U.expression})});t(j),F(`${U.expression} copied to this Village.`)})},children:U.expression},U.expression))})]}):null,Y.length?(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Display framing and export"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:w,onChange:U=>{pt(async()=>t(await _(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:U.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:w,onChange:U=>{pt(async()=>t(await _(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(U.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>{pt(()=>NS(e))},children:"Download both views and manifest"})]})]})}):null,R?(0,r.jsx)("p",{role:"status",children:R}):null,N?(0,r.jsx)("p",{role:"alert",children:N}):null]})}function TS({entry:e,onDecide:t}){let[a,n]=(0,m.useState)(e.improvement?.title??""),[o,l]=(0,m.useState)(e.improvement?.description??""),[u,c]=(0,m.useState)(e.improvement?.extraBeds??0),[h,g]=(0,m.useState)(e.improvementSlot??0),[y,x]=(0,m.useState)(!1),[f,v]=(0,m.useState)(""),z=V=>{x(!0),v(""),t(V,{title:a,description:o,extraBeds:u,slot:h}).catch(w=>v(I(w,"That Venue request could not be decided."))).finally(()=>x(!1))},T=a!==e.improvement?.title||o!==e.improvement?.description||u!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Proposed improvement",(0,r.jsx)("input",{className:`${i}-notice-input`,value:a,onChange:V=>n(V.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:o,onChange:V=>l(V.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds",(0,r.jsx)("input",{type:"number",min:0,max:3,value:u,onChange:V=>c(Number(V.target.value))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:h,onChange:V=>g(Number(V.target.value)),children:[(0,r.jsx)("option",{value:0,children:"Slot 1"}),(0,r.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:y||!a.trim()||!o.trim(),onClick:()=>z(!0),children:T?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:y,onClick:()=>z(!1),children:"Decline"})]}),f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null]})}function ES({room:e,picture:t,draft:a,mode:n,targetId:o,busy:l,error:u,greetingNotice:c,ruling:h,open:g,ended:y,playerName:x,playerPortrait:f,portraits:v,sprites:z,onDraft:T,onMode:V,onTarget:w,onSend:b,onLeave:N,onViewVenue:E,onEnterPrivate:R,privateSpaceOwnerName:F,onEnd:L,onLeavePending:Y,endFailed:me,onRetryGreeting:Q,onContinueWithoutGreeting:De,notices:Te,onDismissNotice:Tt,debugDiscardEnabled:Aa,onDebugDiscard:pt,onUseMailbox:It}){let[U,j]=(0,m.useState)(0),[Xe,Ba]=(0,m.useState)(!1),[pe,gt]=(0,m.useState)(!1),[ma,Pt]=(0,m.useState)(null),q=(0,m.useRef)(null),Be=(0,m.useRef)(null),te=!y&&e.status==="active",lt=(0,m.useRef)(null),pa=(0,m.useCallback)(()=>{Pt(null),window.requestAnimationFrame(()=>q.current?.focus())},[]);(0,m.useEffect)(()=>{if(!ma)return;window.requestAnimationFrame(()=>Be.current?.focus());let A=Ve=>{if(Ve.key==="Tab"){Ve.preventDefault(),Be.current?.focus();return}Ve.key==="Escape"&&(Ve.preventDefault(),pa())};return window.addEventListener("keydown",A),()=>window.removeEventListener("keydown",A)},[pa,ma]);let rt=(0,m.useMemo)(()=>{let A=[],Ve=new Map;for(let de of e.lines){if(de.kind!=="side"&&de.kind!=="whisper"||!de.asideFor)continue;let za=Ve.get(de.asideFor)??[];za.push({register:de.kind,text:de.content,...de.targetId?{target:e.participants.find(Et=>Et.characterId===de.targetId)?.name??de.targetId}:{},speakerId:de.speakerId,name:de.name,expression:de.expression,gazeAt:de.gazeAt}),Ve.set(de.asideFor,za)}for(let de of e.lines){if(de.kind==="side"||de.kind==="whisper")continue;let za=de.speakerId.length===0,Et=Iw(de.content,de.beats??null);Et.paragraphs.forEach((Ji,Mn)=>{A.push({key:`${A.length}`,speakerId:za?"":de.speakerId,name:za?x:de.name,player:za,text:Ji,asides:[...Et.asides[Mn]??[],...Mn===Et.paragraphs.length-1?Ve.get(de.id??"")??[]:[]],...de.kind?{register:de.kind==="narration"?"narration":"speech"}:{},...de.expression?{expression:de.expression}:{},...de.gazeAt?{gazeAt:de.gazeAt}:{}})})}return A},[x,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{j(A=>Qw(lt.current,e.id,rt.length,A)),lt.current={roomId:e.id,stepCount:rt.length}},[e.id,rt.length]);let Mt=Math.min(U,Math.max(0,rt.length-1)),le=rt[Mt],cn=Mt>0,Lt=Mt<rt.length-1,Ia=le?.register??(le===void 0||le.speakerId==="__venue_scene__"?"narration":le.player||Bw(le.text)==="speech"?"speech":"narration"),Ki=le===void 0?void 0:le.player?f:v[le.speakerId],ft=e.participants.filter(A=>e.activeIds.includes(A.characterId)),k=e.status==="closed"&&ft.length===0?e.participants:ft,H=k.find(A=>A.characterId===le?.speakerId),ae=k.filter(A=>A.characterId!==H?.characterId),B=k.find(A=>A.characterId===le?.gazeAt&&A.characterId!==H?.characterId),Ke=ae.filter(A=>A.characterId!==B?.characterId),Ie=!!(H&&B&&k.indexOf(B)<k.indexOf(H)),st=H?B?[Ie?B:Ke[0],H,Ie?Ke[0]:B].filter(A=>!!A):[ae[0],H,ae[1]].filter(A=>!!A):k.slice(0,3),ut=k.filter(A=>!st.some(Ve=>Ve.characterId===A.characterId)),et=(0,r.jsxs)("p",{className:`${i}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${i}-chat-spinner ${i}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${i}-chat-pending-label`,children:e.status==="opening"?"Preparing a greeting\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${i}-chat`,"data-open":g?"true":"false","data-ended":y?"true":"false","data-opening-error":e.status==="opening"&&u?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${i}-visually-hidden`,children:`Here now: ${ft.length?ft.map(A=>`${A.name}${A.doing?` is ${A.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${i}-chat-scene`,"aria-hidden":"true",children:t?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${i}-chat-scene-backdrop`,src:t,alt:""}),(0,r.jsx)("span",{className:`${i}-chat-scrim`}),(0,r.jsx)("span",{className:`${i}-chat-vignette`})]}):(0,r.jsx)("span",{className:`${i}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,r.jsx)("div",{className:`${i}-chat-head`,children:(0,r.jsxs)("span",{className:`${i}-chat-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:E,disabled:l,children:"View Venue"}),R?(0,r.jsxs)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:R,disabled:l,children:["Enter ",F??"private space"]}):null,Aa&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:pt,disabled:l,title:"DEBUG: Clears this visit and transcript. Completed effects and memories remain.",children:"DEBUG: Discard Visit"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:L,disabled:l,title:"End this visit and leave the venue",children:"End visit and leave"}),me||e.status==="closing"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:Y,children:"Leave with memory pending"}):null]})}),e.area==="outside"?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like."}):null,Te.length>0?(0,r.jsx)("div",{className:`${i}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:Te.map(A=>(0,r.jsxs)("div",{className:`${i}-room-star`,children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),A.kind==="memory"&&A.detail?(0,r.jsx)("button",{type:"button",className:`${i}-room-star-detail`,onClick:Ve=>{q.current=Ve.currentTarget,Pt(A)},"aria-label":`View memory: ${A.text}`,title:"View saved memory",children:A.text}):(0,r.jsx)("span",{children:A.text}),(0,r.jsx)("button",{type:"button",className:`${i}-room-star-dismiss`,onClick:()=>{ma?.id===A.id&&Pt(null),Tt(A.id)},"aria-label":`Dismiss ${A.text}`,title:"Dismiss notice",children:"\xD7"})]},A.id))}):null,ma?.detail?(0,r.jsx)("div",{className:`${i}-memory-backdrop`,onClick:A=>{A.currentTarget===A.target&&pa()},children:(0,r.jsxs)("div",{className:`${i}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${i}-memory-dialog-title`,children:[(0,r.jsxs)("div",{className:`${i}-memory-dialog-head`,children:[(0,r.jsx)("h2",{id:`${i}-memory-dialog-title`,children:ma.text}),(0,r.jsx)("button",{ref:Be,type:"button",onClick:pa,"aria-label":"Close memory",children:"\xD7"})]}),(0,r.jsx)("p",{children:ma.detail})]})}):null,ft.length>0?(0,r.jsx)("div",{className:`${i}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:ft.map(A=>(0,r.jsx)("span",{className:`${i}-chat-activity`,children:`${A.name}: ${A.doing||"spending time here"}`},A.characterId))}):null,(0,r.jsxs)("div",{className:`${i}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${i}-chat-cast`,children:st.map((A,Ve)=>{let de=z[A.characterId],za=A.characterId===H?.characterId,Et=le?.asides.find(Pi=>Pi.speakerId===A.characterId),Ji=za?le?.expression??"neutral":Et?.expression??"neutral",Mn=za?le?.gazeAt:Et?.gazeAt??(A.characterId===B?.characterId?H?.characterId:void 0),Fi=st.findIndex(Pi=>Pi.characterId===Mn),bl=Kw(de?.images??[],Ji,Zw(Ve,Fi));return(0,r.jsxs)("div",{className:`${i}-chat-cast-person`,"data-active":A.characterId===H?.characterId?"true":"false",children:[bl?(0,r.jsx)("img",{src:bl.image.url,alt:"","data-framing":de?.framing.mode??"full","data-facing":bl.mirrored?"left":"right"}):(0,r.jsx)(gl,{portrait:v[A.characterId],name:A.name,className:`${i}-avatar`}),(0,r.jsx)("span",{children:A.name})]},A.characterId)})}),ut.length>0?(0,r.jsx)("div",{className:`${i}-chat-cast-rest`,children:ut.map(A=>(0,r.jsxs)("span",{children:[(0,r.jsx)(gl,{portrait:v[A.characterId],name:A.name,className:`${i}-avatar`}),A.name]},A.characterId))}):null]}),(0,r.jsxs)("div",{className:`${i}-chat-vn`,children:[e.lines.length>0?(0,r.jsx)("button",{type:"button",className:`${i}-chat-history-toggle`,"aria-expanded":Xe,onClick:()=>Ba(A=>!A),children:Xe?"Hide history":"History"}):null,Xe?(0,r.jsx)("div",{className:`${i}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,children:e.lines.map((A,Ve)=>(0,r.jsxs)("p",{className:`${i}-chat-vn-text`,children:[(0,r.jsxs)("strong",{children:[A.role==="user"?x:A.kind==="narration"||A.speakerId==="__venue_scene__"?"Narration":A.name||"Resident",A.kind==="side"?" \xB7 aside":A.kind==="whisper"?" \xB7 whisper":"",":"," "]}),Ir(A.content,`history-${Ve}-`)]},A.id??Ve))}):null,le&&le.asides.length>0?(0,r.jsx)("div",{className:`${i}-chat-vn-asides`,"aria-live":"polite",children:le.asides.map((A,Ve)=>(0,r.jsxs)("div",{className:`${i}-chat-vn-aside`,"data-register":A.register,children:[(0,r.jsx)(gl,{portrait:A.speakerId?v[A.speakerId]:Ki,name:A.name??le.name,glyph:le.player?"person":"initial",className:`${i}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${i}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${i}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${i}-chat-vn-aside-icon`,children:A.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${i}-chat-vn-aside-name`,children:A.name??le.name}),A.register==="whisper"&&A.target?(0,r.jsx)("span",{className:`${i}-chat-vn-aside-target`,children:`\u2192 ${A.target}`}):null]}),(0,r.jsx)("p",{className:`${i}-chat-vn-aside-text`,children:Ir(A.text,`vn-aside-${Ve}-`)})]})]},`${Ve}-${A.register}`))}):null,(0,r.jsxs)("div",{className:`${i}-chat-vn-card`,"data-register":Ia,children:[(0,r.jsxs)("div",{className:`${i}-chat-vn-row`,children:[Ia==="speech"?(0,r.jsx)(gl,{portrait:Ki,name:le?.name??"",glyph:le?.player?"person":"initial",className:`${i}-chat-vn-portrait`}):null,(0,r.jsxs)("div",{className:`${i}-chat-vn-column`,children:[Ia==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${i}-chat-vn-name`,children:le?.name??""}),(0,r.jsxs)("div",{className:`${i}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[le?Ia==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-beat`,"data-register":"narration",children:Ir(le.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,children:Ir(le.text,"vn-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Preparing a greeting in ${e.placeName}\u2026`:ft.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!y&&l?et:null]})]})]}),cn||Lt?(0,r.jsxs)("div",{className:`${i}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>j(Mt-1),disabled:!cn,title:"Read the paragraph before this one",children:[(0,r.jsx)("svg",{viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:(0,r.jsx)("path",{d:"M10 3.5 5.5 8l4.5 4.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})}),"Previous paragraph"]}),(0,r.jsx)("span",{className:`${i}-chat-vn-counter`,children:`${Mt+1} / ${Math.max(1,rt.length)}`}),(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>j(Mt+1),disabled:!Lt,title:"Read the next paragraph",children:["Next paragraph",(0,r.jsx)("svg",{viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:(0,r.jsx)("path",{d:"M6 3.5 10.5 8 6 12.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]})]}):null]}),(0,r.jsxs)("div",{className:`${i}-room-panel-tools`,children:[e.lines.length>0?(0,r.jsx)("button",{type:"button",className:`${i}-chat-history-toggle`,"aria-expanded":Xe,onClick:()=>Ba(A=>!A),children:Xe?"Hide history":"History"}):null,(0,r.jsx)("span",{className:`${i}-spacer`}),y&&!Lt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:L,disabled:l,children:"Return to map"}):null]}),u&&e.status==="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:u}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:L,disabled:l,children:"Back to map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Q,disabled:l,children:"Retry greeting"}),e.id?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:De,disabled:l,children:"Continue without greeting"}):null]}):null,c?(0,r.jsx)("div",{className:`${i}-room-error`,role:"status",children:(0,r.jsx)("p",{children:c})}):null,h?(0,r.jsx)("p",{className:`${i}-empty`,children:h}):null,e.status==="closing"?(0,r.jsx)("p",{className:`${i}-hint`,children:"The visit is still being remembered. You can leave with memory pending if filing cannot finish."}):null,te&&n==="fulfill"&&ft.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,te?(0,r.jsxs)("div",{className:`${i}-composer`,children:[n==="fulfill"&&ft.length>0?(0,r.jsxs)("select",{value:o,onChange:A=>w(A.target.value),"aria-label":"Whose wish you fulfilled",disabled:l||y||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),ft.map(A=>(0,r.jsx)("option",{value:A.characterId,children:A.name},A.characterId))]}):null,(0,r.jsx)("div",{className:`${i}-composer-row`,children:(0,r.jsxs)("span",{className:`${i}-chat-input`,children:[(0,r.jsxs)("span",{className:`${i}-room-mode-anchor`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-mode-toggle`,onClick:()=>gt(A=>!A),"aria-label":`Mode: ${n==="chat"?"Chat":"Fulfill"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":pe,title:n==="chat"?"Chat":"Fulfill",children:"\u{1F4AC}"}),pe?(0,r.jsxs)("span",{className:`${i}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:[["chat","fulfill"].map(A=>(0,r.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":n===A,disabled:l||A==="fulfill"&&ft.length===0,onClick:()=>{V(A),gt(!1)},children:A==="chat"?"Chat":"Fulfill"},A)),(0,r.jsx)("button",{type:"button",role:"menuitem",disabled:l||e.status!=="active",onClick:()=>{gt(!1),N()},children:"Leave Scene"})]}):null]}),It?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:It,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,(0,r.jsx)("textarea",{className:`${i}-textarea`,value:a,onChange:A=>T(A.target.value),onKeyDown:A=>{Xw(A.key,A.shiftKey,A.nativeEvent.isComposing)&&(A.preventDefault(),e.status==="active"&&(n!=="fulfill"||o)&&b())},placeholder:n==="fulfill"?"What did you do for them?":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:l||y||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${i}-chat-send`,onClick:b,disabled:l||y||e.status!=="active"||a.trim().length===0||n==="fulfill"&&!o,"aria-label":l?"Sending":"Send",title:l?"Sending":"Send",children:l?"Sending\u2026":"Send"})]})}),u&&e.status!=="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:u}),e.status==="active"&&a.trim()?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:b,disabled:l||y,children:"Retry message"}):null]}):null]}):null]}),y?(0,r.jsx)("p",{className:`${i}-chat-ended`,children:"That is the end of it. Each of them has kept what they took from it, and the village is yours again."}):null]})}var T0="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function kS({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let s=()=>{let p=e.getBoundingClientRect();a(p.width<=704||p.width<=880&&p.height<=512)};s();let d=new ResizeObserver(s);return d.observe(e),()=>d.disconnect()},[e]);let[n,o]=(0,m.useState)(null),[l,u]=(0,m.useState)(null),[c,h]=(0,m.useState)(null),[g,y]=(0,m.useState)(0),[x,f]=(0,m.useState)(null),[v,z]=(0,m.useState)(0),[T,V]=(0,m.useState)(0),[w,b]=(0,m.useState)(0),[N,E]=(0,m.useState)(null),[R,F]=(0,m.useState)(!1),[L,Y]=(0,m.useState)(""),[me,Q]=(0,m.useState)(""),[De,Te]=(0,m.useState)(""),[Tt,Aa]=(0,m.useState)(null),[pt,It]=(0,m.useState)(!1),[U,j]=(0,m.useState)("home"),[Xe,Ba]=(0,m.useState)(null),[pe,gt]=(0,m.useState)("view"),[ma,Pt]=(0,m.useState)(!1),[q,Be]=(0,m.useState)(null),[te,lt]=(0,m.useState)(null),[pa,rt]=(0,m.useState)(!1),[Mt,le]=(0,m.useState)(""),[cn,Lt]=(0,m.useState)(""),[Ia,Ki]=(0,m.useState)(""),[ft,k]=(0,m.useState)(null),[H,ae]=(0,m.useState)(!1),[B,Ke]=(0,m.useState)("village"),[Ie,st]=(0,m.useState)("index"),[ut,et]=(0,m.useState)({}),[A,Ve]=(0,m.useState)(null),[de,za]=(0,m.useState)({}),[Et,Ji]=(0,m.useState)({}),[Mn,Fi]=(0,m.useState)(""),[bl,Pi]=(0,m.useState)(null),[pp,gp]=(0,m.useState)(""),[dn,Gr]=(0,m.useState)(""),[ga,Yr]=(0,m.useState)(""),[mc,fp]=(0,m.useState)(null),[jr,bp]=(0,m.useState)(""),[Xr,vp]=(0,m.useState)([]),[pc,yp]=(0,m.useState)(1600),[La,wp]=(0,m.useState)([]),[Wi,$p]=(0,m.useState)(1600),[gc,H0]=(0,m.useState)(null),[xp,Np]=(0,m.useState)(""),[Qr,eo]=(0,m.useState)([]),[Sp,U0]=(0,m.useState)(""),[fa,Zr]=(0,m.useState)([]),[hi,Gt]=(0,m.useState)(!1),[Kr,mi]=(0,m.useState)(!1),[q0,fc]=(0,m.useState)(null),[B0,bc]=(0,m.useState)(null),[Jr,vc]=(0,m.useState)(null),[Fr,Tp]=(0,m.useState)(""),[Le,yc]=(0,m.useState)(0),[Ma,Ep]=(0,m.useState)(""),[kt,kp]=(0,m.useState)(""),[Wt,Cp]=(0,m.useState)(""),[Ga,Ap]=(0,m.useState)(""),[I0,Pr]=(0,m.useState)([]),[Ne,pi]=(0,m.useState)([]),[zp,On]=(0,m.useState)(null),[wc,gi]=(0,m.useState)(null),[ea,to]=(0,m.useState)({}),[vl,ao]=(0,m.useState)(null),[Oa,no]=(0,m.useState)(!1),[Mp,$c]=(0,m.useState)(""),[xc,Op]=(0,m.useState)(l0),[Ee,fi]=(0,m.useState)("generate"),[L0,Nc]=(0,m.useState)(""),[Wr,Sc]=(0,m.useState)(null),[yl,Tc]=(0,m.useState)(null),[bi,Ec]=(0,m.useState)(""),[wl,kc]=(0,m.useState)(""),[Ot,$l]=(0,m.useState)(!1),[Rp,es]=(0,m.useState)(""),[Cc,G0]=(0,m.useState)("Connections are still loading."),[Vp,Dp]=(0,m.useState)(!1),[Y0,xl]=(0,m.useState)(!1),[_p,ge]=(0,m.useState)(""),[j0,ts]=(0,m.useState)(!1),[as,ns]=(0,m.useState)(""),[Ra,Ac]=(0,m.useState)(null),[zc,Nl]=(0,m.useState)(null),[X0,Mc]=(0,m.useState)(!1),[Ya,io]=(0,m.useState)(""),[Hp,Rn]=(0,m.useState)(null),oo=n?.settings.townMapView??cc("cover"),Up=n?Ra?.size??{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:null,qp=n?Ee==="existing"?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:yl&&Wr===Ee?yl:{width:n.settings.townMapGenerationWidth,height:n.settings.townMapGenerationHeight}:null,Q0=n?{min:n.settings.townMapZoomMin,max:n.settings.townMapZoomMax,step:n.settings.townMapZoomStep}:{min:1,max:1,step:.1},is=Ra?Ra.image:as||null,vi=Ee==="none"?null:Ee==="existing"?as||null:Wr===Ee&&L0||null,os=Ra!==null||X0,Sl=os?zc??oo:oo,Oc=Ra?op(Ra.size):null,[Tl,_e]=(0,m.useState)(""),[Rt,K]=(0,m.useState)(""),[D,X]=(0,m.useState)(!1),[G,Qe]=(0,m.useState)(null),[Z0,El]=(0,m.useState)(!1),[K0,ja]=(0,m.useState)(!1),[kl,lo]=(0,m.useState)(""),[ls,Rc]=(0,m.useState)("chat"),[Cl,rs]=(0,m.useState)(""),[J0,Bp]=(0,m.useState)(""),[F0,ba]=(0,m.useState)([]),ta=(0,m.useRef)(new Set),[Vc,P0]=(0,m.useState)(!1),Ip=(0,m.useRef)(0),ro=(0,m.useRef)(0),Lp=(0,m.useRef)(""),[Dc,Al]=(0,m.useState)(""),[va,Je]=(0,m.useState)(!1),so=(0,m.useRef)(!1),uo=(0,m.useRef)(null),ss=(0,m.useRef)(null),zl=(0,m.useRef)(!1),[W0,bt]=(0,m.useState)(""),[e1,Ml]=(0,m.useState)(""),[_c,Hc]=(0,m.useState)(!1),[us,Uc]=(0,m.useState)(""),Gp=(0,m.useRef)(""),cs=(0,m.useRef)(!1),[ds,Yp]=(0,m.useState)(!1),qc=(0,m.useRef)(null),Bc=(0,m.useRef)(null);(0,m.useEffect)(()=>{let s=Bc.current,d=qc.current;s===null||!d||(Bc.current=null,d.focus(),d.setSelectionRange(s,s))},[dn]);let hs=(0,m.useCallback)(async(s=!1)=>{if(cs.current)return null;cs.current=!0;let d=setTimeout(()=>Yp(!0),rS);try{let p=await _("/reconcile",{method:"POST",body:s?JSON.stringify({forceStory:!0}):void 0});return o(p),p}catch{return null}finally{clearTimeout(d),Yp(!1),cs.current=!1}},[]),jp=(0,m.useCallback)(async()=>{let s=n?.happenings[0]?.id??"";Uc("Writing...");let d=await hs(!0);if(!d){Uc("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}Uc((d.happenings[0]?.id??"")===s?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[n,hs]),ke=(0,m.useCallback)(async(s={})=>{try{let d=await _("",{signal:s.signal});o(d),_e("")}catch(d){if(s.signal?.aborted||s.quiet)return;o(null),_e(I(d,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let s=n?.village.nextTransitionAt??"";s.length===0||s===Gp.current||(Gp.current=s,n?.isFounded&&hs())},[n,hs]);let Xa=(0,m.useCallback)(async s=>{try{let d=await _("/catalog",{signal:s});u(d.characters),_e("")}catch(d){if(s?.aborted)return;_e(I(d,"Could not read your character library."))}},[]),co=(0,m.useCallback)(async s=>{try{let d=await _("/personas",{signal:s});fp(d.personas)}catch(d){if(s?.aborted)return;fp([]),_e(I(d,"Could not read your Personas."))}},[]),ho=(0,m.useCallback)(async s=>{try{let d=await _("/lorebooks",{signal:s});H0(d.books),Np("")}catch(d){if(s?.aborted)return;Np(I(d,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),Xp=(0,m.useCallback)(async s=>{try{let d=await _("/story?offset=0&limit=50",{signal:s});h(d.entries),y(d.total)}catch(d){if(s?.aborted)return;h(null),_e(I(d,"Could not read the village story."))}},[]),t1=(0,m.useCallback)(async s=>{X(!0);try{let d=await _(`/story/${encodeURIComponent(s)}`,{method:"DELETE"});h(d.entries),y(d.total),_e("")}catch(d){_e(I(d,"That memory could not be removed."))}finally{X(!1)}},[]),a1=(0,m.useCallback)(async()=>{let s=c?.length??0;try{let d=await _(`/story?offset=${s}&limit=50`);h(p=>[...p??[],...d.entries]),y(d.total)}catch(d){_e(I(d,"Could not read more memories."))}},[c]),ms=(0,m.useCallback)(async s=>{try{let d=await _("/agendas",{signal:s});Aa(d.villagers)}catch(d){if(s?.aborted)return;Aa(null),_e(I(d,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(U!=="menu"||B!=="agendas"&&B!=="schedules"||!Tt?.some(d=>d.agenda?.personalizationPending&&!d.agenda.personalizationFailure))return;let s=window.setInterval(()=>{ms()},5e3);return()=>window.clearInterval(s)},[Tt,ms,B,U]);let n1=(0,m.useCallback)(async s=>{X(!0);try{let d=await _(`/agendas/${encodeURIComponent(s)}/regenerate`,{method:"POST"});Aa(d.villagers),_e("")}catch(d){_e(I(d,"That villager could not be asked again."))}finally{X(!1)}},[]),i1=(0,m.useCallback)(async(s,d)=>{X(!0);try{let p=await _(`/agendas/${encodeURIComponent(s)}/completed/${encodeURIComponent(d)}/correct`,{method:"POST"});Aa(p.villagers),_e("")}catch(p){_e(I(p,"That wish completion could not be corrected."))}finally{X(!1)}},[]),o1=(0,m.useCallback)(async(s,d)=>{X(!0);try{let p=await _(`/agendas/${encodeURIComponent(s)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:d})});Aa(p.villagers),_e("")}catch(p){_e(I(p,"Schedule use could not be changed."))}finally{X(!1)}},[]);(0,m.useEffect)(()=>{let s=new AbortController;return ke({signal:s.signal}),()=>s.abort()},[ke]),(0,m.useEffect)(()=>{let s=()=>{document.hidden||ke({quiet:!0})},d=setInterval(()=>{document.hidden||cs.current||ke({quiet:!0})},lS);return document.addEventListener("visibilitychange",s),()=>{clearInterval(d),document.removeEventListener("visibilitychange",s)}},[ke]),(0,m.useEffect)(()=>{if(!G?.id||G.status==="closed"||U!=="room")return;Lp.current!==G.id?(Lp.current=G.id,ro.current=Date.parse(G.lastActivityAt||G.startedAt)||Date.now()):ro.current=Math.max(ro.current,Date.parse(G.lastActivityAt||G.startedAt)||0);let s=!1,d=O=>{s||(Qe(null),ja(!1),ba([]),ta.current.clear(),Al(O==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),ke())},p=(O=!1)=>{_("/rooms/active").then(async({session:se})=>{if(se?.id===G.id){O&&(await _("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:G.id})}),ro.current=Date.now());return}let oe=await _(`/rooms/archive/${encodeURIComponent(G.id)}`).catch(()=>null);d(oe?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(se=>{let oe=qr(se);oe&&d(oe)})},$=O=>{if(Date.now()-ro.current>=30*6e4){O.cancelable&&O.preventDefault(),O.stopImmediatePropagation(),p(!0);return}ro.current=Date.now(),!(Date.now()-Ip.current<15e3)&&(Ip.current=Date.now(),_("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:G.id})}).catch(se=>{let oe=qr(se);oe?d(oe):p()}))},M=()=>p();window.addEventListener("focus",M),document.addEventListener("visibilitychange",M);for(let O of["pointerdown","keydown","input","scroll"])window.addEventListener(O,$,!0);return()=>{s=!0,window.removeEventListener("focus",M),document.removeEventListener("visibilitychange",M);for(let O of["pointerdown","keydown","input","scroll"])window.removeEventListener(O,$,!0)}},[G?.id,G?.status,G?.lastActivityAt,G?.startedAt,U,ke]),(0,m.useEffect)(()=>{let s=new AbortController;return _("/rooms/active",{signal:s.signal}).then(({session:d,debugDiscardEnabled:p})=>{P0(p),!(s.signal.aborted||!d)&&(Qe(d),Rc("chat"),ja(!0),j("room"),d.status==="opening"&&(Je(!0),_("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:d.id}),signal:AbortSignal.timeout(3e4)}).then(({session:$})=>{s.signal.aborted||Qe($)}).catch(async $=>{if(s.signal.aborted)return;let M=await h0(d.id);s.signal.aborted||(M?Qe(M):bt(m0($)))}).finally(()=>{s.signal.aborted||Je(!1)})))}).catch(()=>{}),()=>s.abort()},[]),(0,m.useEffect)(()=>{if(B!=="chatlogs"||!n?.isFounded)return;let s=new AbortController,d=new URLSearchParams;return L&&d.set("venueId",L),me&&d.set("characterId",me),d.set("offset",String(T)),d.set("limit","20"),f(null),_(`/rooms/archive?${d.toString()}`,{signal:s.signal}).then(({visits:p,total:$})=>{s.signal.aborted||(f(p),z($),Te(""))}).catch(p=>{s.signal.aborted||Te(I(p,"Venue visits could not be read."))}),()=>s.abort()},[L,me,T,w,B,n?.isFounded]);let Ic=(0,m.useCallback)(async s=>{try{let d=await _(`/rooms/archive/${encodeURIComponent(s)}`);E(d.visit),Te("")}catch(d){Te(I(d,"That visit could not be read."))}},[]),l1=(0,m.useCallback)(async s=>{X(!0);try{await _(`/rooms/archive/${encodeURIComponent(s)}/retry-memory`,{method:"POST"}),await Ic(s),b(d=>d+1),Te("")}catch(d){Te(I(d,"Memory filing is still pending."))}finally{X(!1)}},[Ic]),Qp=(0,m.useCallback)(async s=>{if(window.confirm(s?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){X(!0);try{await _(s?`/rooms/archive/${encodeURIComponent(s)}`:"/rooms/archive",{method:"DELETE"}),E(null),V(0),b(d=>d+1),Te("")}catch(d){Te(I(d,"Visit transcripts could not be deleted."))}finally{X(!1)}}},[]);(0,m.useEffect)(()=>{if(!pt)return;let s=new AbortController;return Xa(s.signal),()=>s.abort()},[pt,Xa]);let Zp=n?n.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(Zp===null)return;let s=new AbortController;return(async()=>{try{let d=await _("/town-map",{signal:s.signal});ns(d.image)}catch{s.signal.aborted||ns("")}})(),()=>s.abort()},[Zp]);let r1=(0,m.useCallback)(async s=>{X(!0);try{o(await _("/villagers",{method:"POST",body:JSON.stringify({characterId:s})})),_e(""),await Xa()}catch(d){_e(I(d,"That character could not move in."))}finally{X(!1)}},[Xa]),s1=(0,m.useCallback)(async s=>{X(!0);try{o(await _(`/villagers/${encodeURIComponent(s)}`,{method:"DELETE"})),_e(""),l&&await Xa()}catch(d){_e(I(d,"That villager could not leave."))}finally{X(!1)}},[l,Xa]),u1=(0,m.useCallback)(async s=>{Fi(s);try{let d=await _(`/villagers/${encodeURIComponent(s)}/refresh`);Ji(p=>({...p,[s]:d})),_e("")}catch(d){_e(I(d,"That villager's card could not be compared."))}finally{Fi("")}},[]),c1=(0,m.useCallback)(async s=>{Fi(s);try{o(await _(`/villagers/${encodeURIComponent(s)}/refresh`,{method:"POST"})),Ji(d=>{let p={...d};return delete p[s],p}),_e("")}catch(d){_e(I(d,"That villager's card could not be refreshed."))}finally{Fi("")}},[]),tt=(0,m.useCallback)(s=>{st(s==="noticeboard"?"noticeboard":s==="general"?"general":s==="replyGuidance"||s==="story"||s==="chatlogs"||s==="agendas"||s==="schedules"?"debug":"village"),K(""),ae(!1),s==="villagers"&&Xa(),s==="village"&&co(),s==="village"&&ho(),s==="story"&&Xp(),(s==="agendas"||s==="schedules")&&ms(),s==="village"&&(U!=="menu"||B!=="village")&&n&&(Gr(n.settings.promptKnowledge),Yr(n.settings.playerPersonaId),bp(n.settings.setting),vp(n.settings.selectedLorebookIds),yp(n.settings.loreTokenBudget),eo(An(n.settings.venues).map(p=>({...p})))),Ke(s),j("menu")},[ms,Xa,ho,co,Xp,B,U,n]),Lc=(0,m.useCallback)(()=>{It(!1),K(""),k(null),ae(!1),j("home")},[]),d1=(0,m.useCallback)(async()=>{if(!(!G||va)){Je(!0),bt(""),F(!1),Qe({...G,status:"closing"});try{if(G.id&&await _("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:G.id})}),so.current)return;ja(!1),Qe(null),ba([]),ta.current.clear(),lo(""),Ml(""),j("home"),ke()}catch(s){if(so.current)return;let d=qr(s);if(d){Qe(null),ja(!1),ba([]),ta.current.clear(),Al(d==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),ke();return}bt(I(s,"You could not leave the venue.")),F(!0)}finally{Je(!1)}}},[ke,G,va]),h1=(0,m.useCallback)(async()=>{if(!G?.id||G.status!=="active"||va||zl.current)return;let s=ss.current??rc();ss.current=s,Je(!0),bt(""),F(!1);try{let d=await _("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:G.id,submissionId:s,message:kl}),signal:AbortSignal.timeout(3e5)});Qe(d.session),ke(),Hc(!0);for(let p of d.recordEvents??[])ta.current.has(p.id)||(ta.current.add(p.id),ba($=>[...$,p]));ss.current=null,ke()}catch(d){bt(I(d,"The scene could not end yet.")),F(!0)}finally{Je(!1)}},[ke,G,va,kl]),m1=(0,m.useCallback)(async()=>{if(!(!G?.id||so.current)){so.current=!0,Je(!0);try{await _("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:G.id})}),ja(!1),Qe(null),ba([]),ta.current.clear(),j("home"),F(!1),ke()}catch(s){bt(I(s,"The visit could not be left yet.")),so.current=!1}finally{Je(!1)}}},[ke,G]),p1=(0,m.useCallback)(async()=>{if(!(!G?.id||!Vc||va)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){Je(!0);try{await _("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:G.id})}),Qe(null),ja(!1),ba([]),ta.current.clear(),lo(""),j("home"),ke()}catch(s){bt(I(s,"The debug discard failed."))}finally{Je(!1)}}},[G,Vc,va,ke]),g1=(0,m.useCallback)(async()=>{let s=kl.trim();if(G===null||!G.id||_c||va||zl.current||s.length===0)return;zl.current=!0;let d=uo.current??rc();uo.current=d;let p=G;try{await _("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:G.id})})}catch(M){zl.current=!1;let O=qr(M);O?(Qe(null),ja(!1),ba([]),ta.current.clear(),Al(O==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),ke()):bt(I(M,"The visit could not be checked."));return}let $={speakerId:"",name:"",role:"user",content:s,at:new Date().toISOString()};Je(!0),bt(""),lo(""),Qe({...G,lines:[...G.lines,$]});try{let M=await _("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:G.id,message:s,mode:ls,targetId:ls==="fulfill"?Cl:"",submissionId:d}),signal:AbortSignal.timeout(3e5)});if(Qe(M.session),Hc(M.session.status==="closed"),M.session.status==="closed")ba([]),ta.current.clear();else for(let O of M.recordEvents??[])ta.current.has(O.id)||(ta.current.add(O.id),ba(se=>[...se,O]));Cl&&!M.session.activeIds.includes(Cl)&&rs(""),Bp(M.verdict?.reason??""),uo.current=null,Ml(""),ke()}catch(M){let O=qr(M);if(O){Qe(null),ja(!1),ba([]),ta.current.clear(),Al(O==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),ke();return}Qe(p),lo(s),bt(I(M,"That line could not be sent."))}finally{zl.current=!1,Je(!1)}},[ke,G,va,kl,_c,ls,Cl]),f1=(0,m.useCallback)(s=>(n?.villagers??[]).filter(d=>d.place?.id===s),[n]),ps=(0,m.useCallback)(s=>{k(null),ae(!1),Ba(s.id),gt("view"),Pt(!1),Be(null),lt(null),j("venue")},[]),Gc=(0,m.useCallback)(async s=>{Je(!0),bt(""),Ml("");try{let d=await _("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:s}),signal:AbortSignal.timeout(3e4)});Qe(d.session),ke()}catch(d){let p=await h0(s);p?Qe(p):bt(m0(d))}finally{Je(!1)}},[ke]),b1=(0,m.useCallback)(async s=>{Je(!0);try{let{session:d}=await _("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:s}),signal:AbortSignal.timeout(1e4)});Qe(d),Ml(d.lines.length===0?"The greeting failed. You can start the conversation now.":""),bt("")}catch(d){bt(I(d,"The visit could not continue. Retry or leave the venue."))}finally{Je(!1)}},[]),Ol=(0,m.useCallback)(async(s,d,p="")=>{so.current=!1,k(null),ae(!1),Rn(null),lo(""),Hc(!1),bt(""),Ml(""),ba([]),ta.current.clear(),Je(!0),Qe({version:1,id:"",placeId:s.id,placeName:s.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),ja(!0),j("room");try{let{session:$}=await _("/rooms",{method:"POST",body:JSON.stringify({venueId:s.id,spaceClass:d,privateOwnerId:p}),signal:AbortSignal.timeout(2e4)});Qe($),Rc("chat"),rs(""),Bp(""),Al(""),ja(!0),ke(),$.status==="opening"&&await Gc($.id)}catch($){bt(I($,"That room could not be opened. Retry or leave the venue."))}finally{Je(!1)}},[Gc,ke]),Kp=(0,m.useCallback)(s=>{ae(!1),k(s.id),j("home")},[]),Jp=(0,m.useCallback)(()=>{Ba(null),gt("view"),Pt(!1),Be(null),lt(null),k(null),j("home")},[]),v1=(0,m.useCallback)(async()=>{X(!0),K("");try{o(await _("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:dn,playerPersonaId:ga,setting:jr,selectedLorebookIds:Xr,loreTokenBudget:pc})}))}catch(s){K(I(s,"Those settings could not be saved."))}finally{X(!1)}},[dn,Xr,pc,ga,jr]),y1=(0,m.useCallback)(async s=>{X(!0),K("");try{o(await _("/settings",{method:"PATCH",body:JSON.stringify({storyPace:s})}))}catch(d){K(I(d,"That could not be saved."))}finally{X(!1)}},[]),Fp=(0,m.useCallback)(async s=>{X(!0),K("");try{o(await _("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:s})})),b(d=>d+1)}catch(d){K(I(d,"Visit retention could not be saved."))}finally{X(!1)}},[]),w1=(0,m.useCallback)(async()=>{if(!(n&&An(n.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){X(!0),K("");try{let s=await _("/bootstrap",{method:"POST"});eo(s.places.map(d=>({id:Xi(),name:d.name,purpose:d.purpose,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(s){K(I(s,"The village did not suggest any places."))}finally{X(!1)}}},[n]),$1=(0,m.useCallback)(async()=>{if(kt.trim().length===0){ge("Write the Setting and Theme before generating its map.");return}if(bi.trim().length===0){ge("The DEBUG map layout prompt cannot be blank.");return}$l(!0),ge("");try{let s=await _("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:bi===n?.settings.townMapLayoutPrompt?void 0:bi,negative:wl===n?.settings.townMapNegativePrompt?void 0:wl,setting:kt,options:xc,selectedLorebookIds:La})}),d=await ip(s.image);if(d.width!==s.width||d.height!==s.height)throw new Error("The generated map's reported dimensions do not match the image.");Nc(s.image),Sc("generate"),Tc(d),fi("generate")}catch(s){ge(I(s,"The village map could not be generated."))}finally{$l(!1)}},[La,wl,bi,kt,xc,n?.settings.townMapLayoutPrompt,n?.settings.townMapNegativePrompt]),x1=(0,m.useCallback)(async()=>{ge(""),X(!0);try{let s=await _("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:kt,selectedLorebookIds:La,loreTokenBudget:Wi})});Pr(s.names)}catch(s){ge(I(s,"The village could not suggest names for the public venue."))}finally{X(!1)}},[La,Wi,kt]),N1=(0,m.useCallback)(async s=>{if(!s||!n)return;ge("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(s.size>d){let p=$=>Math.round($/1e5)/10;ge(`That picture is ${p(s.size)} MB and a village map holds ${p(d)} MB. Choose a smaller copy.`);return}$l(!0);try{let p=await Lr(s),$=await ip(p);Nc(p),Sc("upload"),Tc($),fi("upload")}catch(p){ge(I(p,"That picture could not be used as the village map."))}finally{$l(!1)}},[n]),Pp=(0,m.useCallback)(async s=>{if(!s||!n)return;K("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(s.size>d){let p=$=>Math.round($/1e5)/10;K(`That picture is ${p(s.size)} MB and the village map holds ${p(d)} MB. Try a smaller copy.`);return}X(!0);try{let p=await Lr(s),$=await ip(p);Ac({image:p,size:$}),Nl(cc("cover"))}catch(p){K(I(p,"That picture could not be used as the town map."))}finally{X(!1)}},[n]),Wp=(0,m.useCallback)(async()=>{if(!n)return;let s=Ra?Ra.image:as;X(!0),K("");try{o(await _("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:s,townMapView:zc??n.settings.townMapView})})),ns(s),Ac(null),Nl(null),Mc(!1)}catch(d){K(I(d,"The town map could not be saved."))}finally{X(!1)}},[n,zc,as,Ra]),gs=(0,m.useCallback)(()=>{Ac(null),Nl(null),Mc(!1),K("")},[]),eg=(0,m.useCallback)(async()=>{X(!0),K("");try{o(await _("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),ns(""),gs()}catch(s){K(I(s,"The town map could not be taken down."))}finally{X(!1)}},[gs]),S1=(0,m.useCallback)(async(s,d,p="")=>{if(!Ya){io(s),Rn(null),K("");try{o(await _("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:s,spaceClass:d,privateOwnerId:p})}))}catch($){Rn({id:s,text:I($,"That place could not be drawn.")})}finally{io("")}}},[Ya]),T1=(0,m.useCallback)(async(s,d,p,$="")=>{if(!(!d||!n||Ya)){io(s),Rn(null),K("");try{let M=se=>Math.round(se/1e5)/10;if(d.size>n.settings.maxVenueImageBytes){Rn({id:s,text:`That picture is ${M(d.size)} MB and a place holds ${M(n.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let O=await Lr(d);o(await _("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:s,image:O,spaceClass:p,privateOwnerId:$})}))}catch(M){Rn({id:s,text:I(M,"That picture could not be kept.")})}finally{io("")}}},[Ya,n]),E1=(0,m.useCallback)(async(s,d,p="")=>{if(!Ya){io(s),Rn(null),K("");try{o(await _("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:s,spaceClass:d,privateOwnerId:p})}))}catch($){Rn({id:s,text:I($,"That picture could not be taken away.")})}finally{io("")}}},[Ya]),k1=n?.settings.maxPlaces??48,mo=n?.settings.setupMaxVillagerCount??tp,tg=(n?.settings.homeBuildings??[]).map(s=>({...s,name:n?.settings.homeBuildingNames?.[s.kind]??s.name})),C1=n&&!n.isFounded?1+mo:k1,fs=Math.max(0,C1-An(n?.settings.venues??[]).length),A1=(n?.settings.venues.length??0)+Qr.filter(s=>!n?.settings.venues.some(d=>d.id===s.id)).length,Rl=(0,m.useCallback)(s=>{let d=dp(s);Zr(d.map(p=>({id:p.id,name:p.name,form:p.form??"Home",description:p.description,x:p.presentation.x,y:p.presentation.y,building:p.occupancy.homeKind,isPlayerHome:p.occupancy.playerHome,characterId:p.occupancy.residentCharacterId}))),fc(d[0]?.id??null),Gt(!1)},[]),ag=(0,m.useCallback)(()=>{K(""),n&&Rl(n.settings.venues),st("village"),Ke("homes"),j("menu")},[Rl,n]),ng=(0,m.useCallback)((s,d)=>{if(K(""),fa.length>=fs||fa.length>=1+mo)return;let p=Xi(),$=fa.length===0;Zr(M=>[...M,{id:p,name:$?"Your residence":`Residence ${M.length+1}`,form:"Home",description:"",x:s,y:d,building:null,isPlayerHome:$,characterId:null}]),fc(p)},[fa.length,fs,mo]),z1=(0,m.useCallback)((s,d,p)=>{let $=Ne.find(O=>O.category==="public-center"),M=wc??(Kr?$?.id:void 0);if(Jw({x:s,y:d},Ne.filter(O=>O.id!==M).map(O=>O.presentation),p??{width:1e3,height:700,photoWidth:58,photoHeight:58})){$c("That photograph would cover another venue. Place it a little to the side.");return}if($c(""),M)pi(O=>O.map(se=>se.id===M?{...se,presentation:{...se.presentation,x:s,y:d}}:se)),On(M);else if(Kr){let O=u0(Xi(),"gathering",s,d);pi(se=>[...se,O]),On(O.id)}else if(hi){let O=Ne.filter(oe=>oe.classes?.includes("residence"));if(O.length>=1+mo)return;let se=u0(Xi(),"residence",s,d,O.length===0,O.length+1);pi(oe=>[...oe,se]),On(se.id)}gi(null),Gt(!1),mi(!1)},[wc,hi,Kr,mo,Ne]),Yt=(0,m.useCallback)((s,d)=>{pi(p=>p.map($=>$.id===s?d($):$))},[]),M1=(0,m.useCallback)(s=>{pi(d=>{let p=d.filter($=>$.id!==s);if(!p.some($=>$.occupancy.playerHome)){let $=p.findIndex(M=>M.classes?.includes("residence"));$>=0&&(p[$]={...p[$],occupancy:{...p[$].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return p}),On(d=>d===s?null:d),to(d=>{let p={...d};return delete p[s],p})},[]),O1=(0,m.useCallback)((s,d)=>{ng(s,d),Gt(!1),j("menu")},[ng]),ig=(0,m.useCallback)((s,d)=>{n?.settings.venues.some(p=>p.id===s&&p.occupancy.residentCharacterId)||Zr(p=>p.map($=>$.id===s?{...$,...d}:$))},[n]),R1=(0,m.useCallback)(s=>{if(n?.settings.venues.some(d=>d.id===s&&d.occupancy.residentCharacterId)){K("Move the resident to another venue before removing this home.");return}Zr(d=>{let p=d.filter($=>$.id!==s);return p.length>0&&!p.some($=>$.isPlayerHome)&&(p[0]={...p[0],isPlayerHome:!0,characterId:null}),p})},[n]),V1=(0,m.useCallback)(async()=>{if(n){if(fa.some(s=>!s.description.trim())){K("Review a description for every home before saving.");return}X(!0),K("");try{o(await _("/settings",{method:"PATCH",body:JSON.stringify({venues:iS(n.settings.venues,fa),venueScope:"homes"})})),Gt(!1)}catch(s){K(I(s,"Those homes could not be saved."))}finally{X(!1)}}},[fa,n]),D1=async s=>{if(!n)return;let d=n.villagers.find($=>$.characterId===s.characterId)?.name,p=s.isPlayerHome?`${Zi(n)}'s home`:d?`${d}'s home`:v0(tg,s.building).name;X(!0),K("");try{let $=await _("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:s.id,name:p,purpose:s.isPlayerHome?"Player residence":d?`Home of ${d}`:"Available home",homeKind:s.building}]})});ig(s.id,{description:$.descriptions[s.id]??""})}catch($){K(I($,"The home description could not be generated. You can write it by hand."))}finally{X(!1)}},Vl=(0,m.useCallback)((s,d)=>{K(""),ge(""),Dp(!1),xl(!1),ts(!1),It(!1),gp(""),yc(0),Ep(s?"":d?.village.name??""),kp(s?"":d?.village.setting??""),Cp(s?"":d?.settings.foundingReason??""),Ap(s?"":d?.settings.foundingDetails??""),Pr([]);let p=s||!d?[]:d.settings.venues.filter($=>$.classes?.includes("residence")||$.category==="public-center");pi(p.map($=>({...$,guidance:""}))),On(p[0]?.id??null),gi(null),to({}),ao(null),$c(""),wp(s?[]:d?.settings.selectedLorebookIds??[]),$p(s?1600:d?.settings.loreTokenBudget??1600),Op({...l0}),fi(s?"generate":d?.settings.townMapImageSetAt?"existing":"none"),Nc(""),Sc(null),Tc(null),Ec(d?.settings.townMapLayoutPrompt??""),kc(d?.settings.townMapNegativePrompt??""),$l(!1),Yr(s?"":d?.settings.playerPersonaId??""),co(),ho(),Rl(s||!d?[]:d.settings.venues),j("setup")},[ho,co,Rl]),og=(0,m.useCallback)(s=>{if(Le===0&&s>0){if(Ma.trim().length===0){ge("Give the village a name before continuing.");return}if(ga.trim().length===0){ge("Choose the Persona who lives in this village.");return}if(!Wt||Wt==="something-else"&&!Ga.trim()){ge("Choose why the village is being founded, and describe Something else if selected.");return}}if(Le===1&&s>1&&Cc.length>0){ge(Cc);return}if(Le===1&&s>1&&Vp){xl(!0);return}if(Le===2&&s>2){if(kt.trim().length===0){ge("Write the Setting and Theme before continuing.");return}if(Ee!=="none"&&!vi){ge(Ee==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}}if(Le===3&&s>3){let d=Ne.filter(O=>O.classes?.includes("residence")),p=d.filter(O=>!O.occupancy.playerHome),$=p.length;if(!d.some(O=>O.occupancy.playerHome)||$<s0||$>tp||!Ne.some(O=>O.category==="public-center")){ge("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}if(Ne.some(O=>!O.name.trim()||!O.form?.trim()||!O.description.trim()||!O.spaces?.[0]?.description.trim())){ge("Give every venue a name, form, exterior description, and scene description before review.");return}let M=p.map(O=>O.occupancy.residentCharacterId).filter(Boolean);if(M.length!==p.length||new Set(M).size!==M.length){ge("Assign a different villager to each villager Residence before review.");return}}xl(!1),ge(""),yc(s),s===0&&(co(),ho()),s===3&&Xa(),Gt(!1),mi(!1),gi(null)},[Cc,Ne,Vp,Xa,co,ho,ga,Ee,vi,Ma,Wt,Ga,kt,Le]),_1=(0,m.useCallback)(()=>{xl(!1),ge(""),yc(2),Gt(!1),mi(!1)},[]),H1=(0,m.useCallback)(()=>{xl(!1),ge("")},[]),P=Ne.find(s=>s.id===zp)??null,po=P?qe(P,P.category==="public-center"?"gathering":"residence"):null,lg=s=>({id:s.id,name:s.name,form:s.form??"",purpose:s.purpose,description:s.description,spaceDescription:s.spaces?.[0]?.description??"",venueClass:s.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:s.occupancy.residentCharacterId??"",guidance:s.guidance}),rg=async s=>{if(!(!s.length||Oa)){no(!0),ge("");try{let d=await _("/setup/venues/draft",{method:"POST",body:JSON.stringify({setting:kt,foundingReason:Wt,foundingDetails:Ga,selectedLorebookIds:La,loreTokenBudget:Wi,venues:s.map(lg)})});to(p=>({...p,...d.drafts}))}catch(d){ge(I(d,"Venue text could not be drafted."))}finally{no(!1)}}},Yc=(s,d)=>{let p=ea[s];p&&(Yt(s,$=>{let M=(oe,Dt,go="")=>(d||!oe.trim()||oe===go)&&Dt||oe,O=qe($,$.classes?.includes("gathering")?"gathering":"residence"),se=(oe,Dt)=>d||oe.length===0?Dt??oe:oe;return{...$,name:M($.name,p.name,$.category==="public-center"?"Gathering Place":$.occupancy.playerHome?"Your residence":`Residence ${Ne.filter(oe=>oe.classes?.includes("residence")).findIndex(oe=>oe.id===$.id)+1}`),form:M($.form??"",p.form,$.category==="public-center"?"Gathering place":"Home"),purpose:M($.purpose,p.purpose),description:M($.description,p.description),spaces:[{...O,description:M(O.description,p.spaceDescription),state:{...O.state,condition:M(O.state.condition,p.condition),items:se(O.state.items,p.items),publicFacts:se(O.state.publicFacts,p.publicFacts),features:se(O.state.features.map(oe=>oe.text),p.features).map((oe,Dt)=>({id:O.state.features[Dt]?.id??Xi(),text:oe,sourceCharacterId:"",locked:O.state.features[Dt]?.locked??!1,updatedAt:""}))}}]}}),to($=>{let M={...$};return delete M[s],M}))},U1=async(s,d)=>{if(!Oa){no(!0),ge("");try{let p=await _("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:lg(s),area:d,villageName:Ma,setting:kt,selectedLorebookIds:La})});ao({venueId:s.id,area:d,image:p})}catch(p){ge(I(p,"Venue art could not be generated."))}finally{no(!1)}}},q1=async(s,d,p)=>{if(!(!p||Oa)){if(p.size>(n?.settings.maxVenueImageBytes??8e6)){ge("That venue image is too large. Choose a smaller file.");return}no(!0),ge("");try{let $=await _("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:s.name,image:await Lr(p)})});ao({venueId:s.id,area:d,image:$})}catch($){ge(I($,"That venue image could not be uploaded."))}finally{no(!1)}}},B1=()=>{if(!vl)return;let{venueId:s,area:d,image:p}=vl;Yt(s,$=>d==="exterior"?{...$,presentation:{...$.presentation,image:p}}:{...$,spaces:[{...qe($,$.classes?.includes("gathering")?"gathering":"residence"),image:p}]}),ao(null)},sg=(0,m.useCallback)(()=>{if(Ma.trim().length===0)return"Give the village a name.";if(ga.trim().length===0)return"Choose the Persona who lives in this village.";if(!Wt||Wt==="something-else"&&!Ga.trim())return"Choose why the village is being founded.";if(kt.trim().length===0)return"Write the Setting and Theme.";if(Ee!=="none"&&!vi)return"Choose, generate, or upload the village map.";let s=Ne.filter($=>$.classes?.includes("residence")),d=s.filter($=>!$.occupancy.playerHome);if(d.length<s0||d.length>tp)return"Place one to three homes for initial villagers.";if(!s.some($=>$.occupancy.playerHome))return"One Residence has to be yours.";if(Ne.some($=>!$.name.trim()||!$.form?.trim()||!$.description.trim()||!$.spaces?.[0]?.description.trim()))return"Give every venue a name, Form, exterior description, and scene description in Step 4.";let p=d.map($=>$.occupancy.residentCharacterId).filter($=>$!==null);return p.length!==d.length?"Choose who lives in each villager home.":new Set(p).size!==p.length?"A villager can only live in one house.":Ne.filter($=>$.category==="public-center").length!==1?"Place one Gathering Place.":""},[Ne,ga,Ee,vi,Ma,Wt,Ga,kt]),I1=(0,m.useCallback)(async()=>{let s=sg();if(s){ge(s);return}X(!0),ge("");try{let d=await _("/setup",{method:"POST",body:JSON.stringify({name:Ma.trim(),setting:kt.trim(),foundingReason:Wt,foundingDetails:Ga.trim(),selectedLorebookIds:La,loreTokenBudget:Wi,playerPersonaId:ga,townMapImage:vi??"",townMapView:Ee==="existing"?oo:cc("cover"),venues:Ne})});o(d),Gt(!1),j(!n?.isFounded||d.foundingPreparation?.status==="pending"||d.foundingPreparation?.status==="failed"?"preparing":"home")}catch(d){ge(I(d,"The village could not be founded."))}finally{X(!1)}},[n?.isFounded,Ne,ga,oo,sg,Ee,vi,Ma,Wt,Ga,La,Wi,kt]),L1=(0,m.useCallback)(async()=>{X(!0),K("");try{let s=await _("/setup/reset",{method:"POST"});o(s),u(null),Vl(!0,s)}catch(s){K(I(s,"The village could not be reset."))}finally{X(!1),ts(!1)}},[Vl]),ug=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!n||ug.current||(ug.current=!0,n.isFounded?n.foundingPreparation&&n.foundingPreparation.status!=="ready"&&j("preparing"):Vl(!1,n))},[Vl,n]),(0,m.useEffect)(()=>{if(U!=="preparing")return;let s=!1,d=async()=>{try{let $=await _("/setup/preparation");if(s)return;o($),es(""),(!$.foundingPreparation||$.foundingPreparation.status==="ready")&&j("home")}catch($){s||es(I($,"Preparation status could not be read."))}};d();let p=window.setInterval(()=>{d()},2500);return()=>{s=!0,window.clearInterval(p)}},[U]);let G1=(0,m.useCallback)(async()=>{es("");try{o(await _("/setup/preparation/retry",{method:"POST"}))}catch(s){es(I(s,"Preparation could not be retried."))}},[]),Y1=(0,m.useCallback)(()=>{Be({id:Xi(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],purpose:"",description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),j1=(0,m.useCallback)(async s=>{X(!0),K("");try{let d=n?.settings.venues.some(O=>O.id===s.id)??!1,p=zn(s).map(O=>qe(s,O)),$=await _(d?`/locations/venue/${encodeURIComponent(s.id)}`:"/locations/venue",{method:d?"PUT":"POST",body:JSON.stringify({name:s.name,form:s.form,classes:s.classes,residenceCapacity:s.residenceCapacity,spaces:p,workerIds:s.workerIds??[],presentation:{x:s.presentation.x,y:s.presentation.y},purpose:s.purpose,category:s.category,description:p[0]?.description??s.description,state:{condition:p[0]?.state.condition??"",furniture:p[0]?.state.items??[],publicFacts:p[0]?.state.publicFacts??[],features:p[0]?.state.features??[]}})}),M=An($.settings.venues).find(O=>d?O.id===s.id:O.name.toLowerCase()===s.name.trim().toLowerCase());o($),Be(null),eo(O=>{let se=O.map(oe=>oe.id===s.id&&M?M:oe);return[...se,...An($.settings.venues).filter(oe=>!se.some(Dt=>Dt.id===oe.id))]})}catch(d){K(I(d,"That place could not be saved."))}finally{X(!1)}},[n]),X1=(0,m.useCallback)(async s=>{let d=n?.settings.venues.find(p=>p.id===s);if(!d){eo(p=>p.filter($=>$.id!==s));return}X(!0),K("");try{let p=await _(`/locations/venue/${encodeURIComponent(s)}/dependencies`);if(p.roomPresent||p.playerHome||p.residentCharacterIds.length||p.pendingMailCount){K(p.roomPresent?"End the active visit before deleting this Venue.":p.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let $=p.residentCharacterIds.length+p.pendingResidenceCharacterIds.length,M=$||p.workerCharacterIds.length||p.remapCount||p.eventCount?`This place is referenced by ${$} pending moves, ${p.workerCharacterIds.length} workers, ${p.remapCount} schedule moves, and ${p.eventCount} events. Delete it?`:`Delete ${d.name}?`;if(!window.confirm(M))return;let O=await _(`/locations/venue/${encodeURIComponent(s)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(O),eo(se=>se.filter(oe=>oe.id!==s))}catch(p){K(I(p,"That place could not be removed."))}finally{X(!1)}},[n]),cg=(0,m.useCallback)(async(s,d)=>{X(!0),K("");try{let p=ut[s.id]??s.venueDraft,$=await _(`/venue-requests/${encodeURIComponent(s.id)}/${d?"approve":"deny"}`,{method:"POST",body:d?JSON.stringify(p):void 0});if(o($),d){let M=new Set(Qr.map(O=>O.id));eo(O=>[...O,...An($.settings.venues).filter(se=>!M.has(se.id))])}et(M=>{let O={...M};return delete O[s.id],O})}catch(p){K(I(p,d?"That venue could not be approved.":"That request could not be denied."))}finally{X(!1)}},[ut,Qr]),Q1=(0,m.useCallback)(s=>{let d=qc.current,p=d?.selectionStart??dn.length,$=d?.selectionEnd??p;Bc.current=p+s.length,Gr(`${dn.slice(0,p)}${s}${dn.slice($)}`)},[dn]),dg=(0,m.useCallback)(async()=>{let s=Fr.trim();if(s.length!==0){X(!0),K("");try{o(await _("/noticeboard",{method:"POST",body:JSON.stringify({notice:s})})),Tp("")}catch(d){K(I(d,"That notice could not be pinned up."))}finally{X(!1)}}},[Fr]),Z1=(0,m.useCallback)(async s=>{X(!0),K("");try{o(await _(`/noticeboard/${s}`,{method:"DELETE"}))}catch(d){K(I(d,"That notice could not be taken down."))}finally{X(!1)}},[]),bs=pp.trim().toLowerCase(),jc=(l??[]).filter(s=>bs.length===0||s.name.toLowerCase().includes(bs)||s.comment.toLowerCase().includes(bs)||s.tags.some(d=>d.toLowerCase().includes(bs))),hg=[...(n?.villagers??[]).map(s=>s.characterId),...pt?jc.map(s=>s.id):[]].join(`
`),mg=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let s=hg.split(`
`).filter(p=>p.length>0&&!mg.current.has(p));if(s.length===0)return;for(let p of s)mg.current.add(p);let d=new AbortController;return(async()=>{try{let p=await P5(s,d.signal);d.signal.aborted||za($=>({...$,...p}))}catch{}})(),()=>d.abort()},[hg]);let Xc=n?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(Pi(null),Xc.length===0)return;let s=new AbortController;return(async()=>{try{let d=await W5(Xc,s.signal);s.signal.aborted||Pi(d)}catch{}})(),()=>s.abort()},[Xc]);let Vt=(0,m.useCallback)(s=>s?l?.find(d=>d.id===s)?.name??n?.villagers.find(d=>d.characterId===s)?.name??"":"",[l,n]),K1=(()=>{let s=n?.settings.venues??[],d=[],p=new Map;for(let $ of n?.villagers??[]){let M=$.place?.id;if(!M)continue;let O=p.get(M);O?O.push($):p.set(M,[$])}for(let $ of s){let M=Br($);if(!M)continue;let O=$.occupancy.residentCharacterId,se=fl($),oe=$.occupancy.playerHome?Zi(n):Vt(O);d.push({id:$.id,x:M.x,y:M.y,text:se?pS(oe):$.name,image:$.presentation.image?.url??null,tone:se?y0({isPlayerHome:$.occupancy.playerHome,occupant:O}):"venue",selected:ft===$.id,doors:ft===$.id?[{label:"View venue",onSelect:()=>ps($)},{label:"Visit",onSelect:()=>{Ol($)}}]:void 0,onSelect:()=>Kp($)}),(p.get($.id)??[]).forEach((Dt,go)=>{d.push({id:`villager:${Dt.characterId}`,x:M.x,y:M.y,dy:fS*(go+1),text:Dt.name,tone:"resident",kind:"person"})})}return d})(),J1=Ne.flatMap(s=>{let d=Br(s);return d?[{id:s.id,x:d.x,y:d.y,text:s.name||(s.category==="public-center"?"Gathering Place":"Residence"),image:s.presentation.image?.url??null,tone:s.category==="public-center"?"venue":s.occupancy.playerHome?"player":"resident",onSelect:()=>On(s.id)}]:[]});if(U==="room")return(0,r.jsxs)("div",{className:`${i}-root ${i}-room-screen`,"data-mobile":t?"true":"false",children:[G?(0,r.jsx)(ES,{room:G,picture:Q5(n?.settings.venues??[],G),draft:kl,mode:ls,targetId:Cl,busy:va,error:W0,greetingNotice:e1,ruling:J0,open:K0,ended:_c,playerName:Zi(n),playerPortrait:bl??void 0,portraits:de,sprites:Object.fromEntries((n?.villagers??[]).map(s=>[s.characterId,s.sprite])),onDraft:s=>{uo.current=null,ss.current=null,lo(s)},onMode:s=>{uo.current=null,Rc(s),s!=="fulfill"&&rs("")},onTarget:s=>{uo.current=null,rs(s)},onSend:()=>{g1()},onLeave:()=>{h1()},onViewVenue:()=>{Ba(G.placeId),Be(null),j("venue"),ke()},onEnterPrivate:G.area==="shared"&&G.privateAccessOwnerId?()=>{Je(!0),_("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:G.id,ownerId:G.privateAccessOwnerId})}).then(({session:s})=>{Qe(s),ke()}).catch(s=>bt(I(s,"That private space could not be entered."))).finally(()=>Je(!1))}:void 0,privateSpaceOwnerName:Vt(G.privateAccessOwnerId),onEnd:()=>{d1()},notices:F0,onDismissNotice:s=>ba(d=>d.filter(p=>p.id!==s)),debugDiscardEnabled:Vc,onDebugDiscard:()=>{p1()},onLeavePending:()=>{m1()},endFailed:R,onRetryGreeting:()=>{if(G.id)Gc(G.id);else{let s=n?.settings.venues.find(d=>d.id===G.placeId);s&&Ol(s)}},onContinueWithoutGreeting:()=>{G.id&&b1(G.id)},onUseMailbox:n?.settings.venues.some(s=>s.id===G.placeId&&s.occupancy.playerHome&&(!G.spaceClass||G.spaceClass==="residence"))?()=>El(!0):void 0}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Lc,children:"Back to village"}),Z0&&n?(0,r.jsx)("div",{className:`${i}-mailbox-backdrop`,onClick:()=>El(!1),children:(0,r.jsxs)("section",{className:`${i}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:s=>s.stopPropagation(),children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Mailbox"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>El(!1),children:"Close"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,r.jsxs)("div",{className:`${i}-mailbox-list`,children:[[...n.venueMail??[]].reverse().map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsx)("strong",{children:s.title}),(0,r.jsx)("p",{children:s.detail}),(0,r.jsx)("p",{className:`${i}-hint`,children:s.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(s.dueAt).toLocaleString()}`:s.status==="pending-player"?"Awaiting your decision":s.status==="approved"?"Approved":"Declined"}),s.decisions.map(d=>(0,r.jsxs)("p",{children:[(0,r.jsxs)("strong",{children:[Vt(d.characterId),":"]})," ",d.reply]},d.characterId)),s.status==="pending-player"&&s.kind==="villager-change"?(0,r.jsx)(TS,{entry:s,onDecide:async(d,p)=>{o(await _(`/venue-mail/${encodeURIComponent(s.id)}/decision`,{method:"POST",body:JSON.stringify({approved:d,...p})}))}}):null,s.error?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Reply delayed: ",s.error]}):null]},s.id)),(n.venueMail?.length??0)===0&&n.venueRequests.length===0&&n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No Venue mail yet."}):null,n.venueRequests.map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[s.requesterName||"A villager"," suggests ",s.venueDraft.name]}),(0,r.jsx)("p",{children:s.venueDraft.purpose}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{El(!1),tt("venueRequests")},children:"Review request"})]},s.id)),n.upgradeRequests.map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[s.requesterName," suggests a home change"]}),(0,r.jsx)("p",{children:s.detail}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{El(!1),tt("venueRequests")},children:"Review request"})]},s.id))]})]})}):null]});if(U==="venue"){let s=(n?.settings.venues??[]).find(S=>S.id===Xe)??null;if(!n||!s)return(0,r.jsx)("div",{className:`${i}-root`,children:(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:"This venue is no longer in the village."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Jp,children:"Back to map"})]})});let d=f1(s.id),p=zn(s),$=s.occupancy.homeKind?v0(tg,s.occupancy.homeKind).name:"",M=s.occupancy.playerHome?Zi(n):Vt(s.occupancy.residentCharacterId),O=p.includes("residence")&&(s.residentIds?.length??0)>0,se=G?.placeId===s.id&&(G.area==="shared"||G.area==="private"),oe=G?.placeId===s.id&&G.area==="private"?G.privateOwnerId:"",Dt=s.occupancy.playerHome||s.playerSeenShared||se,go=(s.privateSpaces??[]).filter(S=>s.playerSeenPrivateIds?.includes(S.ownerId)||S.ownerId===oe),Dl=[...p.map(S=>({key:S,label:`${S[0].toUpperCase()}${S.slice(1)} space`,spaceClass:S,ownerId:""})),...(s.playerInvitations??[]).filter(S=>S.scope==="private"&&S.ownerId).map(S=>({key:`private:${S.ownerId}`,label:`${Vt(S.ownerId??"")}'s private space`,spaceClass:"residence",ownerId:S.ownerId??""}))],Qc=(S,J,Z,ne="")=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:S}),J?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:J.url,alt:`${S} at ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"No image yet"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Ya||D,onClick:()=>{S1(s.id,Z,ne)},children:J?"Redraw image":"Draw image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*","aria-label":`Upload ${S.toLowerCase()} image`,disabled:!!Ya||D,onChange:at=>{let _l=at.target.files?.[0];at.target.value="",T1(s.id,_l,Z,ne)}}),J?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Ya||D,onClick:()=>{E1(s.id,Z,ne)},children:"Remove image"}):null]})]},ne||Z||"exterior"),fo=S=>({name:S.name,form:S.form,purpose:S.purpose,workerIds:S.workerIds,position:{x:S.presentation.x,y:S.presentation.y},spaces:p.map(J=>{let Z=qe(S,J);return{description:Z.description,condition:Z.state.condition,items:Z.state.items,publicFacts:Z.state.publicFacts,features:Z.state.features.map(({id:ne,text:at,locked:_l})=>({id:ne,text:at,locked:_l}))}}),privateSpaces:S.privateSpaces?.map(J=>({ownerId:J.ownerId,description:J.description,condition:J.state.condition,items:J.state.items,publicFacts:J.state.publicFacts,features:J.state.features.map(({id:Z,text:ne,locked:at})=>({id:Z,text:ne,locked:at}))}))}),F1=!!(q&&JSON.stringify(fo(q))!==JSON.stringify(fo(s))),P1=!!(te&&(JSON.stringify(te.classes)!==JSON.stringify(p)||te.capacity!==(s.residenceCapacity??1)||te.slot!==0||te.title||te.description||te.extraBeds)),W1=()=>{(pe==="edit"&&F1||pe==="proposal"&&P1)&&!window.confirm("Discard your unsaved changes?")||(gt("view"),Be(null),lt(null),le(""),Lt(""))},pg=(S,J)=>{o(S);let Z=S.settings.venues.find(ne=>ne.id===s.id);Z&&Be(structuredClone(Z)),Lt(J)},e$=async()=>{if(q){if(O){let S=fo(q),J=fo(s),Z=p.indexOf("residence");if((Z>=0&&JSON.stringify(S.spaces[Z])!==JSON.stringify(J.spaces[Z])||JSON.stringify(S.privateSpaces)!==JSON.stringify(J.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}rt(!0),le(""),Lt("");try{let S=p.map(ne=>qe(O&&ne==="residence"?s:q,ne)),J=S[0],Z=await _(`/locations/venue/${encodeURIComponent(s.id)}`,{method:"PUT",body:JSON.stringify({name:q.name,form:q.form,purpose:q.purpose,description:O?s.description:J?.description??q.description,spaces:S,workerIds:q.workerIds??[],presentation:{x:q.presentation.x,y:q.presentation.y},state:O?s.state:{condition:J?.state.condition??"",furniture:J?.state.items??[],publicFacts:J?.state.publicFacts??[],features:J?.state.features??[]}})});pg(Z,"Venue details saved.")}catch(S){le(I(S,"The Venue could not be saved."))}finally{rt(!1)}}},gg=async(S,J="")=>{if(!q)return;let Z=S==="private"?q.privateSpaces?.find(at=>at.ownerId===J):qe(q,"residence");if(!Z)return;let ne=structuredClone(q);if(S==="shared"?ne.spaces=ne.spaces?.map(at=>at.venueClass==="residence"?qe(s,"residence"):at):ne.privateSpaces=ne.privateSpaces?.map(at=>at.ownerId===J?s.privateSpaces?.find(_l=>_l.ownerId===J)??at:at),!(JSON.stringify(fo(ne))!==JSON.stringify(fo(s))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){rt(!0),le(""),Lt("");try{let at=await _(`/locations/venue/${encodeURIComponent(s.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:S,ownerId:J,description:Z.description,state:Z.state})});pg(at,`${S==="private"?"Private":"Shared"} room edit proposed.`)}catch(at){le(I(at,"That room edit could not be proposed."))}finally{rt(!1)}}},fg=gS(s,M);return(0,r.jsxs)("div",{className:`${i}-root`,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:pe==="view"?fg:`${pe==="edit"?"Edit Venue":"Propose Change"} \xB7 ${fg}`}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:pe==="view"?d.length===0?"Nobody is here right now":`Villagers here: ${d.map(S=>S.name).join(", ")}`:pe==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:pe==="view"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Be(structuredClone(s)),le(""),Lt(""),gt("edit")},children:"Edit Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{lt({classes:p,capacity:s.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),le(""),Lt(""),gt("proposal")},children:"Propose Change"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:G?.placeId===s.id&&G.status!=="closed"?()=>j("room"):Jp,children:G?.placeId===s.id&&G.status!=="closed"?"Return to scene":"Back to map"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:W1,children:pe==="edit"?"Close Editor":"Exit Change Proposal"})})]}),pe==="view"?(0,r.jsxs)("main",{className:`${i}-venue-page`,children:[(0,r.jsxs)("section",{className:`${i}-venue-hero`,children:[s.presentation.image?(0,r.jsx)("img",{className:`${i}-venue-picture`,src:s.presentation.image.url,alt:`Exterior of ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Exterior image not drawn yet"}),(0,r.jsxs)("div",{className:`${i}-venue-context`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"The place"}),s.purpose?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:s.purpose}):null,s.form||$?(0,r.jsx)("p",{children:s.form||$}):null,n.village.setting?(0,r.jsx)("p",{className:`${i}-hint`,children:n.village.setting}):null,p.includes("residence")?(0,r.jsxs)("p",{className:`${i}-hint`,children:[hc(s)," / ",p0(s)," residents"]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:va,"aria-expanded":Dl.length>1?ma:void 0,onClick:()=>{if(Dl.length===1){let S=Dl[0];Ol(s,S.spaceClass,S.ownerId)}else Pt(S=>!S)},children:va?"Opening visit\u2026":"Visit Venue"})}),ma&&Dl.length>1?(0,r.jsxs)("div",{className:`${i}-venue-visit-picker`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Choose a space"}),Dl.map(S=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:va,onClick:()=>{Pt(!1),Ol(s,S.spaceClass,S.ownerId)},children:S.label},S.key))]}):null,p.includes("residence")&&!s.occupancy.playerHome?(0,r.jsx)("p",{className:`${i}-hint`,children:"You can speak from outside. Entering a resident's home requires an invitation."}):null]})]}),p.includes("residence")&&!Dt?(0,r.jsx)("p",{className:`${i}-hint`,children:"The shared Residence space appears after you enter with an invitation."}):null,(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[p.filter(S=>S!=="residence"||Dt).map(S=>{let J=qe(s,S);return(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:S==="residence"?"Shared Residence space":`${S[0].toUpperCase()}${S.slice(1)} space`}),J.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:J.image.url,alt:`${S} space at ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),J.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:J.description}):null,J.state.condition?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Condition now: ",J.state.condition]}):null,J.state.items.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Present items: ",J.state.items.join(", ")]}):null,J.state.publicFacts.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Established facts: ",J.state.publicFacts.join(" \xB7 ")]}):null]},S)}),go.map(S=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:[Vt(S.ownerId),"'s private space"]}),S.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:S.image.url,alt:`${Vt(S.ownerId)}'s private space`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),S.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:S.description}):null,S.adaptationPending?(0,r.jsx)("p",{className:`${i}-hint`,children:"This room is still being adapted after a move."}):null]},S.ownerId))]}),(s.editProposals??[]).map(S=>(0,r.jsxs)("p",{className:`${i}-hint`,children:["Proposed ",S.target," room edit:"," ",S.declined?"declined or stale":`approved by ${S.approvedIds.length} of ${S.requiredIds.length} residents`]},S.id)),p.includes("residence")&&!s.occupancy.playerHome?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{_(`/locations/venue/${encodeURIComponent(s.id)}/player-move`,{method:"POST"}).then(o).catch(S=>le(I(S,"The move could not be requested.")))},children:"Request to live here"}):null,Mt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mt}):null]}):pe==="edit"?(0,r.jsxs)("main",{className:`${i}-venue-editor-page`,children:[(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[Qc("Exterior image",s.presentation.image),p.filter(S=>S!=="residence"||Dt).map(S=>Qc(S==="residence"?"Shared Residence image":`${S} space image`,qe(s,S).image,S)),go.map(S=>Qc(`${Vt(S.ownerId)}'s private image`,S.image,"residence",S.ownerId))]}),Ya===s.id?(0,r.jsx)("p",{className:`${i}-hint`,children:"Drawing or saving the image\u2026"}):null,Hp?.id===s.id?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Hp.text}):null,q?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue details"}),(0,r.jsx)(g0,{draft:q,existing:!0,villagers:n.villagers,editableClasses:p.filter(S=>S!=="residence"||!O||se),onChange:Be}),O?(0,r.jsx)("p",{className:`${i}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:pa||!q.name.trim(),onClick:()=>{e$()},children:"Save Venue details"}),O&&se?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:pa||!qe(q,"residence").description.trim(),onClick:()=>{gg("shared")},children:"Propose shared room edit"}):null]}),O&&!se?(0,r.jsx)("p",{className:`${i}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,oe&&q?.privateSpaces?.filter(S=>S.ownerId===oe).map(S=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:["Propose changes to ",Vt(S.ownerId),"'s private space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:S.description,onChange:J=>Be(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(ne=>ne.ownerId===S.ownerId?{...ne,description:J.target.value}:ne)})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:S.state.condition,onChange:J=>Be(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(ne=>ne.ownerId===S.ownerId?{...ne,state:{...ne.state,condition:J.target.value}}:ne)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:S.state.items.join(`
`),onChange:J=>Be(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(ne=>ne.ownerId===S.ownerId?{...ne,state:{...ne.state,items:J.target.value.split(`
`)}}:ne)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:S.state.publicFacts.join(`
`),onChange:J=>Be(Z=>Z&&{...Z,privateSpaces:Z.privateSpaces?.map(ne=>ne.ownerId===S.ownerId?{...ne,state:{...ne.state,publicFacts:J.target.value.split(`
`)}}:ne)})})]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:pa||!S.description.trim(),onClick:()=>{gg("private",S.ownerId)},children:"Propose private room edit"})]},S.ownerId)),O&&(s.residentIds?.length??0)>0?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Resident moves"}),(0,r.jsxs)("select",{value:Ia,onChange:S=>Ki(S.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),n.settings.venues.filter(S=>S.id!==s.id&&zn(S).includes("residence")&&hc(S)<p0(S)).map(S=>(0,r.jsx)("option",{value:S.id,children:S.name},S.id))]}),(s.residentIds??[]).map(S=>{let J=n.residences.find(Z=>Z.characterId===S&&Z.status!=="current");return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("strong",{children:Vt(S)}),J?(0,r.jsx)("span",{className:`${i}-hint`,children:J.status==="moving"?"Moving":"Awaiting consent"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!Ia||pa,onClick:()=>{rt(!0),_("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:S,venueId:Ia})}).then(o).catch(Z=>le(I(Z,"The move could not be requested."))).finally(()=>rt(!1))},children:"Ask to move"})]},S)})]}):null,cn?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:cn}):null,Mt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mt}):null]}):(0,r.jsx)("main",{className:`${i}-venue-proposal-page`,children:(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Propose a Venue change"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),te?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:M0.map(S=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:te.classes.includes(S),disabled:!te.classes.includes(S)&&te.classes.length>=2,onChange:J=>lt(Z=>Z&&{...Z,classes:J.target.checked?[...Z.classes,S]:Z.classes.filter(ne=>ne!==S)})})," ",S]},S))})]}),te.classes.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Base capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:te.capacity,onChange:S=>lt({...te,capacity:Number(S.target.value)})})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:te.slot,onChange:S=>lt({...te,slot:Number(S.target.value)}),children:[(0,r.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",s.improvements?.[0]?.title??"empty"]}),(0,r.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",s.improvements?.[1]?.title??"empty"]})]})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,r.jsx)("input",{className:`${i}-notice-input`,value:te.title,onChange:S=>lt({...te,title:S.target.value}),placeholder:"A second sleeping alcove"})]}),te.title?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes in the story?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:te.description,onChange:S=>lt({...te,description:S.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:3,value:te.extraBeds,onChange:S=>lt({...te,extraBeds:Number(S.target.value)})})]})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:pa||te.classes.length<1||te.title.trim().length>0&&!te.description.trim(),onClick:()=>{rt(!0),le(""),_(`/locations/venue/${encodeURIComponent(s.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:te.classes,capacity:te.capacity,...te.title.trim()?{slot:te.slot,improvement:{title:te.title,description:te.description,extraBeds:te.extraBeds}}:{},title:te.title||`Change ${s.name}`,detail:te.description||`Change Venue Classes or capacity at ${s.name}.`})}).then(S=>{o(S),lt(null),Lt("Proposal submitted.")}).catch(S=>le(I(S,"The proposal could not be saved."))).finally(()=>rt(!1))},children:"Submit proposal"})]}):(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:cn||"Proposal submitted."}),Mt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mt}):null]})})]})}if(U==="menu")return(0,r.jsxs)("div",{className:`${i}-root ${i}-sectioned-menu`,"data-section":Ie,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[Ie]}),t?null:(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Ie!=="index"?()=>st("index"):Lc,children:Ie!=="index"?"Back to menu":"Back to the village"})})]}),Tl?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tl}):null,(0,r.jsx)("nav",{className:`${i}-mobile-menu-nav`,"aria-label":"Village menu",children:Ie==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>tt("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>tt("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>tt("story"),children:"DEBUG Settings"})]}):Ie==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([s,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":B===s,onClick:()=>s==="homes"?ag():tt(s),children:d},s))}):Ie==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([s,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":B===s,onClick:()=>tt(s),children:d},s)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||D||ds,onClick:()=>{jp()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${i}-status`,children:T0}),us?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:us}):null]}):null}),(0,r.jsxs)("nav",{className:`${i}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="villagers","data-active":B==="villagers"?"true":"false",disabled:!n||D,onClick:()=>tt("villagers"),children:`Villagers (${n?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="noticeboard","data-active":B==="noticeboard"?"true":"false",disabled:!n||D,onClick:()=>tt("noticeboard"),children:`Noticeboard (${n?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="venueRequests","data-active":B==="venueRequests"?"true":"false",disabled:!n||D,onClick:()=>tt("venueRequests"),children:`Venue Requests (${(n?.venueRequests?.length??0)+(n?.upgradeRequests?.length??0)+(n?.residences?.filter(s=>s.status==="pending"&&s.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="homes","data-active":B==="homes"?"true":"false",disabled:!n||D,onClick:ag,children:`Homes (${dp(n?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="map","data-active":B==="map"?"true":"false",disabled:!n||D,onClick:()=>tt("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="village","data-active":B==="village"?"true":"false",onClick:()=>tt("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${i}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="general","data-active":B==="general"?"true":"false",onClick:()=>tt("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="replyGuidance","data-active":B==="replyGuidance"?"true":"false",disabled:!n||D,onClick:()=>tt("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="story","data-active":B==="story"?"true":"false",disabled:!n||D,onClick:()=>tt("story"),children:`DEBUG: Village Story (${c?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="chatlogs","data-active":B==="chatlogs"?"true":"false",disabled:!n||D,onClick:()=>tt("chatlogs"),children:`DEBUG: Venue Visits (${x?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="agendas","data-active":B==="agendas"?"true":"false",disabled:!n||D,onClick:()=>tt("agendas"),children:`DEBUG: Villager Wishes (${Tt?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B==="schedules","data-active":B==="schedules"?"true":"false",disabled:!n||D,onClick:()=>tt("schedules"),children:`Villager Agendas (${Tt?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||D||ds,onClick:()=>{jp()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${i}-status`,children:T0}),us?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:us}):null]})]}),B==="general"?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General settings"}),(0,r.jsx)(sp,{}),n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${i}-story-pace`,value:n.settings.storyPace,disabled:D,onChange:s=>{y1(s.target.value)},children:n.settings.storyPaces.map(s=>(0,r.jsx)("option",{value:s,children:s.charAt(0).toUpperCase()+s.slice(1)},s))}),(0,r.jsx)("span",{className:`${i}-hint`,children:aS(n.settings.storyPace)})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${i}-visit-retention`,value:n.settings.visitRetention.mode,disabled:D,onChange:s=>{let d=s.target.value;Fp({mode:d,value:d==="count"?100:d==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),n.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":n.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:n.settings.visitRetention.mode==="count"?1:30,max:n.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:n.settings.visitRetention.value,onBlur:s=>{let d=Number(s.target.value);d!==n.settings.visitRetention.value&&Fp({mode:n.settings.visitRetention.mode,value:d})}},`${n.settings.visitRetention.mode}:${n.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Setting the village up again is the same three questions you answered when you arrived, over the village as it stands now."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||!n,onClick:()=>Vl(!1,n),children:"Run setup again"}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${i}-row`,children:j0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-danger`,disabled:D,onClick:()=>{L1()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>ts(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||!n,onClick:()=>ts(!0),children:"Reset the village and start over"})})]}),Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]}):B==="village"?(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[n?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(wS,{}),t?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Map background image"}),is?(0,r.jsx)("img",{className:`${i}-mobile-map-preview`,src:is,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:D,"aria-label":"Choose a town map picture",onChange:s=>{let d=s.target.files?.[0];s.target.value="",Pp(d)}}),Ra?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Wp()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:gs,children:"Cancel"})]}):n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{eg()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setting`,className:`${i}-textarea ${i}-off`,value:jr,maxLength:n.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:s=>bp(s.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Read-only here. What this place is like is the wizard's first question, asked beside where the houses stand so the village is described once rather than twice; run it again to change this. What is written still reaches every villager in the meantime."})]}),(0,r.jsx)(x0,{books:gc,error:xp,selected:Xr,onChange:vp,disabled:D}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-lore-budget`,className:`${i}-notice-input`,type:"number",min:n.settings.loreTokenBudgetMin,max:n.settings.loreTokenBudgetMax,step:100,value:pc,disabled:D,onChange:s=>yp(Number(s.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venues"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Y1,disabled:D||A1>=n.settings.maxPlaces,children:"Create Venue"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"search",value:Sp,onChange:s=>U0(s.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,r.jsx)("div",{className:`${i}-notice-add`,children:n.settings.venues.filter(s=>`${s.name} ${s.form??""} ${zn(s).join(" ")}`.toLowerCase().includes(Sp.toLowerCase())).map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:s.name||"Unnamed Residence"}),(0,r.jsx)("span",{className:`${i}-hint`,children:[s.form,zn(s).join(" + ")].filter(Boolean).join(" \xB7 ")}),zn(s).includes("residence")?(0,r.jsxs)("span",{className:`${i}-hint`,children:[(s.residentIds?.length??+!!s.occupancy.residentCharacterId)+Number(s.occupancy.playerHome)," ","/ ",s.residenceCapacity??1," residents"]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ps(s),children:"View Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Be(structuredClone(s)),children:"Edit"}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{X1(s.id)},"aria-label":`Delete ${s.name}`,disabled:D,children:"\xD7"})]})]},s.id))}),q?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:n.settings.venues.some(s=>s.id===q.id)?"Edit Venue":"Create Venue"}),(0,r.jsx)(g0,{draft:q,existing:n.settings.venues.some(s=>s.id===q.id),villagers:n.villagers,onChange:Be}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||!q.name.trim()||!zn(q).every(s=>qe(q,s).description.trim()),onClick:()=>{j1(q)},children:"Save Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Be(null),children:"Cancel"})]})]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{w1()},disabled:D,children:"Suggest Venues"})}),Qr.filter(s=>!n.settings.venues.some(d=>d.id===s.id)).map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:s.name}),(0,r.jsx)("span",{className:`${i}-hint`,children:s.purpose}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Be(s),children:"Review suggestion"})]},s.id))]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${i}-knowledge`,ref:qc,className:`${i}-preset`,value:dn,maxLength:n.settings.promptBoxMaxLength,spellCheck:!1,onChange:s=>Gr(s.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${i}-macros`,children:n.settings.macros.map(s=>(0,r.jsx)("button",{type:"button",className:`${i}-macro`,title:`${s.label} \u2014 ${s.help}`,onClick:()=>Q1(s.token),children:s.token},s.token))}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)($0,{idPrefix:"settings",personas:mc,draft:ga,onDraft:Yr,storedId:n.settings.playerPersonaId,storedName:n.settings.playerPersonaName,storedMissing:n.settings.playerPersonaMissing,disabled:D}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{v1()},disabled:D,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Gr(n.settings.defaultPromptKnowledge)},disabled:D,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${i}-hint`,children:dn===n.settings.promptKnowledge&&ga===n.settings.playerPersonaId&&jr===n.settings.setting&&JSON.stringify(Xr)===JSON.stringify(n.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]}):(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[B==="villagers"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villagers"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>It(s=>!s),disabled:D,children:pt?"Close the list":"Add a villager"})}),pt?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("input",{className:`${i}-search`,type:"search",value:pp,onChange:s=>gp(s.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),l===null?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):jc.length===0?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${i}-picker-list`,children:jc.map(s=>(0,r.jsxs)("div",{className:`${i}-picker-item`,"data-resident":s.inVillage?"true":"false",children:[(0,r.jsx)(gl,{portrait:de[s.id],name:s.name,className:`${i}-avatar`}),(0,r.jsxs)("div",{className:`${i}-picker-text`,children:[(0,r.jsx)("div",{className:`${i}-villager-name`,children:s.name}),(0,r.jsx)("div",{className:`${i}-villager-role`,children:s.comment||s.tags.slice(0,3).join(" \xB7 ")}),s.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:s.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{r1(s.id)},disabled:D||s.inVillage,children:s.inVillage?"Lives here":"Move in"})]},s.id))})]}):null,n&&n.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-villagers`,children:n.villagers.map(s=>(0,r.jsx)(xS,{villager:s,portrait:de[s.characterId],selected:!1,onSelect:!s.place||G!==null?void 0:()=>{let d=n.settings.venues.find(p=>p.id===s.place?.id);d&&Kp(d)}},s.characterId))}),(0,r.jsx)("div",{className:`${i}-roster`,children:n.villagers.map(s=>(0,r.jsxs)("div",{className:`${i}-roster-entry`,children:[(0,r.jsxs)("div",{className:`${i}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-villager-name`,children:s.name}),s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,Et[s.characterId]?(0,r.jsx)("div",{className:`${i}-tile-summary`,children:Et[s.characterId].changed?`New card: ${Et[s.characterId].proposed?.name??"unavailable"}`:Et[s.characterId].sourceAvailable?`Snapshot revision ${Et[s.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ve(A===s.characterId?null:s.characterId),"aria-expanded":A===s.characterId,children:A===s.characterId?"Close sprite studio":`Sprites \xB7 ${s.sprite?.images.length??0} approved`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{u1(s.characterId)},disabled:D||Mn.length>0,children:"Compare card"}),Et[s.characterId]?.changed&&Et[s.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{c1(s.characterId)},disabled:D||Mn.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{s1(s.characterId)},disabled:D||Mn.length>0,children:"Move out"})]})]}),A===s.characterId?(0,r.jsx)(SS,{villager:s,onSaved:o}):null]},s.characterId))})]}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):null,B==="noticeboard"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Noticeboard"})}),n.noticeboard.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.noticeboard.map((s,d)=>(0,r.jsxs)("li",{className:`${i}-notice-row`,children:[(0,r.jsxs)("span",{children:[s.author.length>0?(0,r.jsx)("span",{className:`${i}-notice-author`,children:`${s.author}: `}):null,s.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{Z1(d)},disabled:D,"aria-label":`Take down: ${s.text}`,children:"\xD7"})]},`${d}:${s.text}`))}),(0,r.jsxs)("div",{className:`${i}-notice-add`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:Fr,maxLength:n.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:s=>Tp(s.target.value),onKeyDown:s=>{s.key==="Enter"&&(s.preventDefault(),dg())}}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{dg()},disabled:D||Fr.trim().length===0||n.noticeboard.length>=n.settings.maxNoticeboardNotes,children:`Pin it up (${n.noticeboard.length}/${n.settings.maxNoticeboardNotes})`})]})]}):null,B==="venueRequests"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villagers can ask for places in conversation or during village life. A place joins the village only when you approve it here. Taking down a notice does not change a request."}),n.venueRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.venueRequests.map(s=>{let d=ut[s.id]??s.venueDraft,p=$=>et(M=>({...M,[s.id]:{...d,...$}}));return(0,r.jsx)("li",{className:`${i}-notice-row`,children:(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:s.requesterName||"A villager"}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${s.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.name,maxLength:n.settings.maxVenueNameLength,"aria-label":`Requested place name from ${s.requesterName||"villager"}`,onChange:$=>p({name:$.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.purpose,maxLength:n.settings.maxVenueNoteLength,"aria-label":`Requested place purpose from ${s.requesterName||"villager"}`,onChange:$=>p({purpose:$.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.category,maxLength:n.settings.maxVenueNoteLength,placeholder:"Category (optional)","aria-label":`Requested place category from ${s.requesterName||"villager"}`,onChange:$=>p({category:$.target.value})}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:d.description??"",maxLength:1e3,"aria-label":`Requested place description from ${s.requesterName||"villager"}`,onChange:$=>p({description:$.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||!d.name.trim(),onClick:()=>{X(!0),K(""),_("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:s.id,name:d.name,purpose:d.purpose}]})}).then($=>p({description:$.descriptions[s.id]??""})).catch($=>K(I($,"The description draft could not be generated."))).finally(()=>X(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||!d.name.trim()||!d.purpose.trim()||!d.description?.trim(),onClick:()=>{cg(s,!0)},children:d.name!==s.venueDraft.name||d.purpose!==s.venueDraft.purpose||d.category!==s.venueDraft.category?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{cg(s,!1)},children:"Deny"})]})]})},s.id)})}),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Home upgrade requests"}),n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No home upgrades requested."}):n.upgradeRequests.map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:s.detail}),[!0,!1].map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{X(!0),K(""),_(`/venue-upgrades/${encodeURIComponent(s.id)}/${d?"approve":"deny"}`,{method:"POST"}).then(o).catch(p=>K(I(p,"The upgrade request could not be decided."))).finally(()=>X(!1))},children:d?"Approve upgrade":"Deny"},String(d)))]},s.id)),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Resident move requests"}),n.residences.filter(s=>s.status!=="current").length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No moves pending."}):n.residences.filter(s=>s.status!=="current").map(s=>{let d=Vt(s.characterId),p=n.settings.venues.find($=>$.id===s.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:`${d} \u2192 ${p}`}),s.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${i}-hint`,children:["Move due ",new Date(s.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{X(!0),K(""),_("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:s.characterId})}).then(o).catch($=>K(I($,"The move could not be completed."))).finally(()=>X(!1))},children:"DEBUG: Complete move now"})]}):s.requestedBy==="player"?(0,r.jsxs)("span",{className:`${i}-hint`,children:["Awaiting ",d,"'s answer in conversation."]}):[!0,!1].map($=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{X(!0),K(""),_(`/residences/${$?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:s.characterId})}).then(o).catch(M=>K(I(M,"The move request could not be decided."))).finally(()=>X(!1))},children:$?"Approve move":"Deny"},String($)))]},s.characterId)}),Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]}):null,B==="homes"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Homes on the map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||fa.length>=fs,onClick:()=>{Gt(!0),Lc()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${fa.length} of at most ${fs}`})]}),fa.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(yS,{homes:fa,villagers:(n?.villagers??[]).map(s=>({id:s.characterId,name:s.name})),disabled:D,selectedId:q0,onPatch:ig,onRemove:R1,onSelect:fc,showDescriptions:!0,onGenerateDescription:s=>{D1(s)},lockedIds:new Set(n.settings.venues.filter(s=>s.occupancy.residentCharacterId).map(s=>s.id))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{V1()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>Rl(n.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${i}-hint`,children:nS(n.settings.venues,fa)?"No unsaved changes.":"Unsaved changes."})]})]}):null,B==="map"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(rp,{src:is,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:n.settings.venues.flatMap(s=>{let d=Br(s);if(!d)return[];let p=s.occupancy.residentCharacterId?Vt(s.occupancy.residentCharacterId):s.occupancy.playerHome?Zi(n):"";return[{id:s.id,x:d.x,y:d.y,text:p?`${s.name||"Home"} \xB7 ${p}`:s.name,tone:fl(s)?y0({isPlayerHome:s.occupancy.playerHome,occupant:s.occupancy.residentCharacterId}):"venue",onSelect:()=>bc(s.id)}]}),placing:Jr!==null,view:Sl,shape:Up,zoom:Q0,onView:os?Nl:void 0,onPlace:Jr?(s,d)=>{let p=Jr;X(!0),K(""),_(`/locations/venue/${encodeURIComponent(p)}`,{method:"PUT",body:JSON.stringify({presentation:{x:s,y:d}})}).then(o).catch($=>K(I($,"The venue could not be placed."))).finally(()=>{X(!1),vc(null)})}:void 0}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Venue positions and residents"}),n.settings.venues.map(s=>{let d=s.occupancy.residentCharacterId?Vt(s.occupancy.residentCharacterId):s.occupancy.playerHome?Zi(n):"",p=!!s.occupancy.residentCharacterId;return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":B0===s.id,onClick:()=>bc(s.id),children:s.name||"Home"}),(0,r.jsx)("span",{className:`${i}-hint`,children:d?`Lives here: ${d}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${i}-hint`,children:Br(s)?"On map":"Not placed"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||p,onClick:()=>{bc(s.id),vc(s.id)},children:Br(s)?"Move pin":"Place pin"})]},s.id)}),Jr?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>vc(null),children:"Cancel pin placement"}):null,Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]}),os?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:w0.map(s=>(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Sl.fit===s.fit?"true":"false","aria-pressed":Sl.fit===s.fit,onClick:()=>Nl({...Sl,fit:s.fit}),children:s.label},s.fit))}),(0,r.jsx)("p",{className:`${i}-hint`,children:w0.find(s=>s.fit===Sl.fit)?.help})]}):null,Oc?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":Oc.tone,children:Oc.text}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:D,"aria-label":"Choose a town map picture",onChange:s=>{let d=s.target.files?.[0];s.target.value="",Pp(d)}}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{eg()},children:"Remove background image"}):null]}),os?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Wp()},children:Ra?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:gs,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>Mc(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:n.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),An(n.settings.venues).length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${i}-places`,children:An(n.settings.venues).map(s=>(0,r.jsxs)("li",{className:`${i}-place`,children:[s.presentation.image?(0,r.jsx)("img",{className:`${i}-place-thumb`,src:s.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${i}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${i}-place-body`,children:[(0,r.jsx)("span",{className:`${i}-place-name`,children:s.name}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{ps(s)},children:"View Venue"})})]})]},s.id))})]})]}):null,B==="replyGuidance"?(0,r.jsx)($S,{}):null,B==="story"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),c===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the village remembers\u2026"}):c.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):L5(c).map(s=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${i}-story-day`,children:s.label}),(0,r.jsx)("ul",{className:`${i}-story`,children:s.entries.map(d=>{let p=G5(d),$=d.actors.map(M=>M.name).join(", ");return(0,r.jsxs)("li",{className:`${i}-story-row`,children:[(0,r.jsxs)("span",{children:[p.length>0||d.scope==="private"||d.kind==="favour"?(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[p,d.scope==="private"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:` \xB7 private to ${$}`}):null,d.kind==="favour"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 a favour"}):null,d.kind==="tick"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,d.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:D,onClick:()=>{t1(d.id)},"aria-label":`Forget: ${d.text}`,children:"\xD7"})]},d.id)})})]},`${s.label}:${s.entries[0]?.id??""}`)),c&&c.length<g?(0,r.jsxs)("button",{type:"button",className:`${i}-button`,onClick:()=>{a1()},children:["Load more memories (",c.length," of ",g,")"]}):null]}):null,B==="chatlogs"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:L,onChange:s=>{Y(s.target.value),V(0),E(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(n?.settings.venues??[]).map(s=>(0,r.jsx)("option",{value:s.id,children:s.name},s.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:me,onChange:s=>{Q(s.target.value),V(0),E(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(n?.villagers??[]).map(s=>(0,r.jsx)("option",{value:s.characterId,children:s.name},s.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||v===0,onClick:()=>{Qp()},children:"Delete all completed logs"}),De?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:De}):null,x===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading venue visits\u2026"}):x.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No completed visits match these filters."}):x.map(s=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[s.placeName," \xB7 ",up(s.startedAt)]}),(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[s.participants.map(d=>d.name).join(", ")," \xB7 ",s.lineCount," lines",s.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",s.memoryPending?` \xB7 memory pending (${s.memoryProgress?.nextUnit??0}/${s.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ic(s.id)},children:N?.id===s.id?"Refresh transcript":"Open transcript"}),s.memoryPending?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{l1(s.id)},children:"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Qp(s.id)},children:"Delete log"})]}),N?.id===s.id?(0,r.jsx)("ul",{className:`${i}-story`,children:N.lines.map((d,p)=>(0,r.jsx)("li",{className:`${i}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[d.name||Zi(n)," \xB7 ",up(d.at)]}),Ir(d.content,`venue-${s.id}-${p}-`),(0,r.jsxs)("span",{className:`${i}-story-meta`,children:["Heard by:"," ",d.heardBy?.map($=>N.participants.find(M=>M.characterId===$)?.name??$).join(", ")||"no one"]})]})},`${s.id}:${p}`))}):null]},s.id)),v>20?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:T===0,onClick:()=>{V(Math.max(0,T-20)),E(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[T+1,"\u2013",Math.min(v,T+20)," of ",v]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:T+20>=v,onClick:()=>{V(T+20),E(null)},children:"Next"})]}):null]}):null,B==="agendas"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),Tt===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the villagers wish\u2026"}):Tt.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:Tt.map(s=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[s.name,s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null]}),s.agenda===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):s.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:s.agenda.personalizationFailure?`Wish generation failed: ${s.agenda.personalizationFailure}`:s.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${i}-story`,children:s.agenda.wishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish}),d.tell.length>0?(0,r.jsx)("p",{className:`${i}-wish-tell`,children:`Shows as: ${d.tell}`}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`${d.intensity===1?"Faint":d.intensity===3?"Strong":"Present"} \xB7 ${X5(d.addedAt??"",d.expiresAt??"")}`})]},d.id))}),s.completedWishes.length>0?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:`Completed wishes (${s.completedWishes.length})`}),(0,r.jsx)("ul",{className:`${i}-story`,children:s.completedWishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish.wish}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Fulfilled ${new Date(d.fulfilledAt).toLocaleDateString()}`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{i1(s.characterId,d.wish.id)},children:"Mark as not fulfilled"})]},d.wish.id))})]}):null]},s.characterId))})]}):null,B==="schedules"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),Tt===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Loading agendas\u2026"}):Tt.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${i}-agenda-list`,children:Tt.map(s=>(0,r.jsxs)("details",{className:`${i}-week`,children:[(0,r.jsx)("summary",{className:`${i}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${i}-week-head`,children:[s.name,s.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${i}-badge`,children:s.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,s.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${i}-badge`,children:"Personalization failed"}):null,s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"Card missing"}):null,s.nativeSchedule?(0,r.jsx)("span",{className:`${i}-badge`,children:s.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,np(s)?(0,r.jsx)("span",{className:`${i}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${i}-week-body`,children:[s.agenda?.routineSummary?(0,r.jsx)("p",{className:`${i}-story-meta`,children:s.agenda.routineSummary}):null,s.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${i}-empty`,children:s.agenda.personalizationFailure}):s.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${i}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${i}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:s.ingestSchedule,disabled:D,onChange:d=>{o1(s.characterId,d.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{n1(s.characterId)},children:"Regenerate agenda"})]}),s.nativeSchedule?(0,r.jsxs)("p",{className:`${i}-story-scope`,children:[s.ingestSchedule&&s.remapFailure?`Schedule translation failed: ${s.remapFailure.message}`:s.ingestSchedule&&s.agenda?.scheduleWeek?"Schedule guides today and future days.":s.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",np(s)?" Earlier hours retain the previous plan.":""]}):np(s)?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Earlier hours retain the previous plan."}):null,s.weekUnreadable?(0,r.jsx)("p",{className:`${i}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):s.nativeSchedule?null:(0,r.jsx)("p",{className:`${i}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${i}-agenda-days`,children:s.days.map(d=>{let p=d.isToday?s.agenda?.activeDay?.blocks??s.agenda?.week?.[d.weekday]??[]:(s.ingestSchedule?s.agenda?.scheduleWeek?.[d.weekday]:void 0)??s.agenda?.week?.[d.weekday]??[],$=s.nativeSchedule?.days[d.weekday]??[];return(0,r.jsxs)("details",{className:`${i}-agenda-day`,open:d.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[d.weekday," \xB7 ",d.dateLabel,d.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${i}-agenda-compare`,"data-comparison":s.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${d.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:p.map((M,O)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[c0(M.startMinute),"\u2013",c0(M.endMinute)]}),(0,r.jsx)("strong",{children:M.activity}),(0,r.jsx)("span",{children:M.venueId?Y5(n?.settings.venues??[],M.venueId):"Home"}),(0,r.jsx)("span",{children:M.reason}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:M.status==="idle"?"Available":M.status==="dnd"?"Busy":M.status==="offline"?"Offline":"Online"})]},`${M.startMinute}-${M.endMinute}-${O}`))})]}),s.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${d.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),$.length?(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:$.map((M,O)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:M.time}),(0,r.jsx)("strong",{children:M.activity}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:M.status||"No availability set"})]},`${M.time}-${O}`))}):(0,r.jsx)("p",{className:`${i}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${d.weekday}-${d.dateLabel}`)})})]})]},s.characterId))})]}):null,Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]})]});if(U==="preparing"){let s=n?.foundingPreparation,d=n?.villagers.length??0,p=s?.completedIds.length??0,$=n?.villagers.find(M=>M.characterId===s?.currentId)?.name;return(0,r.jsx)("div",{className:`${i}-root ${i}-preparing`,role:"status","aria-live":"polite",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("div",{className:`${i}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,r.jsxs)("h1",{children:[n?.village.name??"Your village"," is settling in"]}),(0,r.jsx)("p",{children:s?.status==="failed"?"The villagers need a hand before the gates open.":$?`Making room for ${$}\u2026`:"Lighting windows and making plans\u2026"}),(0,r.jsx)("p",{children:`${p} of ${d} villagers ready`}),s?.status==="failed"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:s.error}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{G1()},children:"Retry"}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Change connections"}),(0,r.jsx)(sp,{})]})]}):null,Rp?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rp}):null]})})}if(U==="setup"){let s=(l??[]).map(d=>({id:d.id,name:d.name}));return(0,r.jsxs)("div",{className:`${i}-root ${i}-home`,children:[(0,r.jsx)("div",{className:`${i}-mapbar`,children:(0,r.jsx)("span",{className:`${i}-mapbar-title`,children:Ma.trim()||"A new village"})}),(0,r.jsxs)("div",{className:`${i}-home-body`,children:[(0,r.jsx)("div",{className:`${i}-side`,children:(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:n?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsx)("div",{className:`${i}-steps`,children:r0.map((d,p)=>(0,r.jsx)("span",{className:`${i}-step`,"data-active":p===Le?"true":"false","data-done":p<Le?"true":"false",children:`${p+1}. ${d}`},d))}),Le===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${i}-setup-name`,className:`${i}-search`,type:"text",value:Ma,maxLength:n?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:D,onChange:d=>Ep(d.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Why is this village being founded?"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:o0.map(d=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${i}-founding-reason`,checked:Wt===d.value,disabled:D,onChange:()=>Cp(d.value)}),d.label]},d.value))})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-founding-details`,children:["Founding details ",Wt==="something-else"?"(required)":"(optional)"]}),(0,r.jsx)("textarea",{id:`${i}-founding-details`,className:`${i}-textarea`,value:Ga,maxLength:n?.settings.foundingDetailsMaxLength??500,placeholder:"Who brought everyone together, and what are they hoping to build?",disabled:D,onChange:d=>Ap(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"This premise informs village stories without forcing repeated events."})]}),(0,r.jsx)($0,{idPrefix:"setup",personas:mc,draft:ga,onDraft:Yr,storedId:n?.settings.playerPersonaId??"",storedName:n?.settings.playerPersonaName??"",storedMissing:n?.settings.playerPersonaMissing??!1,disabled:D}),(0,r.jsx)(x0,{books:gc,error:xp,selected:La,onChange:d=>{wp(d),Pr([])},disabled:D}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-setup-lore-budget`,className:`${i}-notice-input`,type:"number",min:n?.settings.loreTokenBudgetMin??200,max:n?.settings.loreTokenBudgetMax??3200,step:100,value:Wi,disabled:D,onChange:d=>$p(Number(d.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Le===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(sp,{onSetupProblem:G0,onImageWarningChange:Dp}),Y0?(0,r.jsxs)("div",{className:`${i}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${i}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${i}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:H1,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:_1,children:"I understand, continue"})]})]}):null]}):null,Le===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setup-setting`,className:`${i}-textarea`,value:kt,maxLength:n?.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:D||Ot,onChange:d=>{kp(d.target.value),Pr([])}}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required. Describe the village's setting, visual style, and narrative vibe."})]}),(0,r.jsxs)("div",{className:`${i}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Ee==="generate"?"true":"false","aria-pressed":Ee==="generate",disabled:Ot,onClick:()=>fi("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Ee==="upload"?"true":"false","aria-pressed":Ee==="upload",disabled:Ot,onClick:()=>fi("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Ee==="none"?"true":"false","aria-pressed":Ee==="none",disabled:Ot,onClick:()=>fi("none"),children:"No background image"}),n?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Ee==="existing"?"true":"false","aria-pressed":Ee==="existing",disabled:Ot,onClick:()=>fi("existing"),children:"Keep current map"}):null]}),Ee==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map elements"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([d,p])=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:xc[d],disabled:Ot,onChange:$=>Op(M=>({...M,[d]:$.target.checked}))}),p]},d))}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Unchecked elements are excluded, even if Setting and Theme mentions them. Structures may appear anywhere but must leave room for future locations."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-prompt`,className:`${i}-textarea`,value:bi,maxLength:1500,disabled:Ot,onChange:d=>Ec(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-negative`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-negative`,className:`${i}-textarea`,value:wl,maxLength:1500,disabled:Ot,onChange:d=>kc(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ot||kt.trim().length===0||bi.trim().length===0,onClick:()=>{$1()},children:Ot?"Generating map\u2026":Wr==="generate"?"Generate again":"Generate map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Ot||bi===n?.settings.townMapLayoutPrompt&&wl===n?.settings.townMapNegativePrompt,onClick:()=>{Ec(n?.settings.townMapLayoutPrompt??""),kc(n?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})]})]}):null,Ee==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:Ot,"aria-label":"Choose a village map image",onChange:d=>{let p=d.target.files?.[0];d.target.value="",N1(p)}}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,Ee==="none"?(0,r.jsx)("p",{className:`${i}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,yl&&Ee!=="none"&&Wr===Ee&&qp?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":op(yl).tone,children:op(yl).text}):null]}):null,Le===3?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Place your Residence, one to three villager Residences, and one Gathering Place. Select a photograph to finish it."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Oa||Ne.filter(d=>d.classes?.includes("residence")).length>=1+mo,onClick:()=>{Gt(!0),mi(!1),gi(null)},children:"Place a Residence"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Oa||Ne.some(d=>d.category==="public-center"),onClick:()=>{Gt(!1),mi(!0),gi(null)},children:"Place a Gathering Place"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Oa||Ne.length===0,onClick:()=>{pi([]),On(null),to({}),ao(null),gi(null),Gt(!1),mi(!1)},children:"Reset all venues"})]}),Mp?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mp}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Oa||!Ne.length,onClick:()=>{rg(Ne)},children:"Draft all venue text"}),Object.keys(ea).length>1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Object.keys(ea).forEach(d=>Yc(d,!1)),children:"Use all drafts in empty fields"}):null]}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:Ne.map(d=>(0,r.jsxs)("button",{type:"button",className:`${i}-setup-venue-card`,"data-selected":d.id===zp?"true":"false",onClick:()=>On(d.id),children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:d.name||"Unnamed venue"}),(0,r.jsxs)("small",{children:[d.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",d.occupancy.playerHome?"You":Vt(d.occupancy.residentCharacterId)||"Choose a villager"]})]})]},d.id))}),P&&po?(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,children:[P.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",P.name]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{gi(P.id),Gt(!1),mi(!1)},children:"Move on map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>M1(P.id),children:"Remove venue"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:P.name,maxLength:100,onChange:d=>Yt(P.id,p=>({...p,name:d.target.value}))})]}),P.category==="public-center"?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Oa,onClick:()=>{x1()},children:"Suggest three names"}),I0.map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Yt(P.id,p=>({...p,name:d})),children:d},d))]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:P.form??"",maxLength:240,onChange:d=>Yt(P.id,p=>({...p,form:d.target.value}))})]}),P.category!=="public-center"?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident",(0,r.jsxs)("select",{className:`${i}-select`,value:P.occupancy.residentCharacterId??"",disabled:P.occupancy.playerHome,onChange:d=>Yt(P.id,p=>({...p,residentIds:d.target.value?[d.target.value]:[],occupancy:{...p.occupancy,residentCharacterId:d.target.value||null}})),children:[(0,r.jsx)("option",{value:"",children:P.occupancy.playerHome?"You":"Choose a villager"}),s.map(d=>(0,r.jsx)("option",{value:d.id,disabled:Ne.some(p=>p.id!==P.id&&p.occupancy.residentCharacterId===d.id),children:d.name},d.id))]})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Purpose",(0,r.jsx)("input",{className:`${i}-notice-input`,value:P.purpose,maxLength:240,onChange:d=>Yt(P.id,p=>({...p,purpose:d.target.value}))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Guidance for AI text and art",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:P.guidance,maxLength:1e3,placeholder:"Mood, materials, details to include or avoid\u2026",onChange:d=>Yt(P.id,p=>({...p,guidance:d.target.value}))})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Oa,onClick:()=>{rg([P])},children:"Generate text draft"}),ea[P.id]?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("strong",{children:"Suggested venue text"}),(0,r.jsxs)("p",{children:[ea[P.id]?.name," \xB7"," ",ea[P.id]?.form]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Purpose:"})," ",ea[P.id]?.purpose]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Exterior:"})," ",ea[P.id]?.description]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Scene:"})," ",ea[P.id]?.spaceDescription]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Initial condition:"})," ",ea[P.id]?.condition]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Items:"})," ",ea[P.id]?.items.join(", ")||"None"]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Public facts:"})," ",ea[P.id]?.publicFacts.join(", ")||"None"]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Features:"})," ",ea[P.id]?.features.join(", ")||"None"]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Yc(P.id,!1),children:"Use in empty fields"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Yc(P.id,!0),children:"Replace text with this draft"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>to(d=>{let p={...d};return delete p[P.id],p}),children:"Discard draft"})]})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Exterior description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:P.description,maxLength:1e3,onChange:d=>Yt(P.id,p=>({...p,description:d.target.value}))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:po.description,maxLength:1e3,onChange:d=>Yt(P.id,p=>({...p,spaces:[{...qe(p,p.category==="public-center"?"gathering":"residence"),description:d.target.value}]}))})]}),["exterior","interior"].map(d=>{let p=d==="exterior"?P.presentation.image:po.image;return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("span",{className:`${i}-label`,children:[d==="exterior"?"Exterior photograph":"Interior photograph"," \xB7 optional"]}),p?(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:p.url,alt:`${d} of ${P.name}`}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No image yet. A placeholder will be used."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Oa,onClick:()=>{U1(P,d)},children:p?"Regenerate image":"Generate image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*",disabled:Oa,"aria-label":`Upload ${d} image for ${P.name}`,onChange:$=>{let M=$.target.files?.[0];$.target.value="",q1(P,d,M)}}),p?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Yt(P.id,$=>d==="exterior"?{...$,presentation:{...$.presentation,image:null}}:{...$,spaces:[{...qe($,$.category==="public-center"?"gathering":"residence"),image:null}]}),children:"Remove image"}):null]}),vl?.venueId===P.id&&vl.area===d?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:vl.image.url,alt:"New image preview"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:B1,children:"Use this photograph"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ao(null),children:"Discard"})]}):null]},d)}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Advanced venue details"}),(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Initial condition",(0,r.jsx)("input",{className:`${i}-notice-input`,value:po.state.condition,onChange:d=>Yt(P.id,p=>{let $=qe(p,p.category==="public-center"?"gathering":"residence");return{...p,spaces:[{...$,state:{...$.state,condition:d.target.value}}]}})})]}),["items","publicFacts"].map(d=>(0,r.jsxs)("label",{className:`${i}-label`,children:[d==="items"?"Notable items \xB7 one per line":"Public facts \xB7 one per line",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:po.state[d].join(`
`),onChange:p=>Yt(P.id,$=>{let M=qe($,$.category==="public-center"?"gathering":"residence");return{...$,spaces:[{...M,state:{...M.state,[d]:p.target.value.split(`
`).map(O=>O.trim()).filter(Boolean)}}]}})})]},d)),(0,r.jsxs)("label",{className:`${i}-label`,children:["Features \xB7 one per line",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:po.state.features.map(d=>d.text).join(`
`),onChange:d=>Yt(P.id,p=>{let $=qe(p,p.category==="public-center"?"gathering":"residence");return{...p,spaces:[{...$,state:{...$.state,features:d.target.value.split(`
`).map(M=>M.trim()).filter(Boolean).slice(0,5).map((M,O)=>({id:$.state.features[O]?.id??Xi(),text:M,sourceCharacterId:"",locked:!1,updatedAt:""}))}}]}})})]})]})]})]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"Place or select a venue to edit it."}),l===null?(0,r.jsx)("p",{className:`${i}-hint`,children:"Reading your villager library\u2026"}):null]}):null,Le===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[Ma.trim()," \xB7 ",kt.trim()," \xB7"," ",Ne.filter(d=>d.classes?.includes("residence")).length," Residences \xB7"," ",Ne.filter(d=>d.category==="public-center").length," Gathering Place"]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Persona:"})," ",mc?.find(d=>d.id===ga)?.name??"Selected Persona"," \xB7 ",(0,r.jsx)("strong",{children:"Founded for:"})," ",o0.find(d=>d.value===Wt)?.label??Wt,Ga?` \xB7 ${Ga}`:""]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Map:"})," ",Ee==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,r.jsx)("strong",{children:"Lorebooks:"})," ",La.map(d=>gc?.find(p=>p.id===d)?.name??d).join(", ")||"None"]}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:Ne.map(d=>(0,r.jsxs)("div",{className:`${i}-setup-venue-card`,children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsxs)("strong",{children:[d.name," \xB7 ",d.category==="public-center"?"Gathering Place":"Residence"]}),(0,r.jsxs)("small",{children:[d.form," \xB7"," ",d.occupancy.playerHome?"You":Vt(d.occupancy.residentCharacterId)||"Community"]})]})]},d.id))}),Ne.map(d=>(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsxs)("strong",{children:[d.name,":"]})," ",d.description," ",d.spaces?.[0]?.description]},`${d.id}-summary`))]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[Le>0?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Ot,onClick:()=>og(Le-1),children:"Back"}):null,Le<r0.length-1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Ot,onClick:()=>og(Le+1),children:"Next"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D||Ot||!n,onClick:()=>{I1()},children:n?.isFounded?"Save this village":"Found the village"}),n?.isFounded?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-spacer`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:D,onClick:()=>{Gt(!1),j("home")},children:"Show me the village"})]}):null]}),_p?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_p}):null,Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null]})}),(0,r.jsx)("div",{className:`${i}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${i}-setup-map-viewport`,children:(0,r.jsx)(rp,{src:vi,alt:`A map of ${Ma.trim()||"your new village"}.`,pins:Le<3?[]:J1,placing:Le===3&&(hi||Kr||wc!==null),view:Ee==="existing"?oo:cc("cover"),shape:qp,onPlace:Le===3?z1:void 0,compact:Le<2,mobile:t&&Le>=2,photoPins:Le>=3})})})]})]})}return(0,r.jsxs)("div",{className:`${i}-root ${i}-home ${i}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-home-bar`,children:[(0,r.jsx)(cS,{weather:n?.village.weather??""}),!t&&n?.isFounded&&An(n.settings.venues).length>0?(0,r.jsxs)("div",{className:`${i}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":H,"aria-controls":`${i}-places-list`,disabled:D,onClick:()=>{k(null),ae(s=>!s)},children:"Places"}),H?(0,r.jsx)("div",{id:`${i}-places-list`,className:`${i}-places-list`,children:n.settings.venues.map(s=>(0,r.jsxs)("div",{className:`${i}-places-list-row`,children:[(0,r.jsx)("span",{className:`${i}-places-list-name`,children:s.name}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ps(s),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ol(s)},children:"Visit"})]},s.id))}):null]}):null,(0,r.jsxs)("span",{className:`${i}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-mobile-board-button`,"aria-label":`Noticeboard (${n?.noticeboard.length??0})`,disabled:!n||D,onClick:()=>tt("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),n?.isFounded?(0,r.jsx)(mS,{happenings:n.happenings,recap:n.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:D||!n,onClick:()=>{st("index"),j("menu")},children:"\u2630"}),t?null:(0,r.jsx)(hS,{}),hi?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Gt(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${i}-room`,children:(0,r.jsx)("div",{className:`${i}-home-map-viewport`,children:(0,r.jsx)(rp,{src:is,alt:`A map of ${n?.village.name??"the village"}.`,pins:K1,placing:hi,view:oo,shape:Up,onPlace:O1,onDismiss:()=>{k(null),ae(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Tl||Rt||hi||ds||Dc?(0,r.jsxs)("div",{className:`${i}-notice`,children:[Tl?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tl}):null,Rt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Rt}):null,hi?(0,r.jsx)("span",{className:`${i}-status`,children:"Click the map where the house stands."}):null,ds?(0,r.jsxs)("span",{className:`${i}-status`,children:["Catching up on what ",n?.village.name??"the village"," has been doing\u2026"]}):null,Dc?(0,r.jsx)("p",{className:`${i}-status`,children:Dc}):null]}):null})})})]})}var hp=class extends HTMLElement{connectedCallback(){d0(),this.__root??(this.__root=(0,E0.createRoot)(this)),this.__root.render((0,r.jsx)(cp,{element:this,children:(0,r.jsx)(CS,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),d0()})}};function CS({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let n=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",n),()=>e.removeEventListener("marinara-capability-props",n)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(OS,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(MS,{props:e.capabilityProps??{}}):(0,r.jsx)(kS,{element:e})}function AS(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var zS="marinara-active-chat-id";function D0(){try{window.localStorage.removeItem(zS)}catch{}window.location.reload()}function _0(e,t){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(l(!1),n(null),!t)return;let u=new AbortController;return(async()=>{try{let c=await _(`/spinoffs/${encodeURIComponent(e)}`,{signal:u.signal});if(u.signal.aborted)return;n(c??null),l(!0)}catch{}})(),()=>u.abort()},[e,t]),{origin:a,known:o}}function MS({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",n=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:l,known:u}=_0(t,a&&t.length>0),[c,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!c)return;let v=T=>{g.current?.contains(T.target)||h(!1)},z=T=>{T.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",v),document.addEventListener("keydown",z),()=>{document.removeEventListener("pointerdown",v),document.removeEventListener("keydown",z)}},[c]),!a||!u||l===null)return null;let y=l.name||"your villager",x=l.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${x}`;return(0,r.jsxs)("span",{className:`${i}-tracker`,"data-compact":n,"data-open":c,ref:g,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${i}-tracker-chip`:`${i}-button ${i}-tracker-chip`,onClick:()=>h(v=>!v),"aria-haspopup":"menu","aria-expanded":c,title:f,"aria-label":f,children:[(0,r.jsx)(AS,{}),(0,r.jsx)("span",{className:`${i}-tracker-label`,children:"Villages"})]}),c?(0,r.jsxs)("div",{className:`${i}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${x}`,children:[(0,r.jsxs)("p",{className:`${i}-tracker-menu-title`,children:["This roleplay spun off from ",x]}),l.resident?(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[y," still lives there. ",x," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[y," does not live in ",x," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${i}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:D0,title:`Leaves this chat and opens Marinara's home screen, where the ${x} tab is waiting.`,children:"Open the village"})})]}):null]})}function OS({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:n,known:o}=_0(t,a&&t.length>0);if(!a||!o)return null;if(n===null)return(0,r.jsx)("div",{className:`${i}-panel-view`,children:(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let l=n.name||"this villager",u=n.villageName||"your village";return(0,r.jsxs)("div",{className:`${i}-panel-view`,children:[(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:n.resident?`This roleplay spun off from ${u}, and ${u} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${u}, and ${l} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:l})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:n.room})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:u})]}),(0,r.jsx)("div",{className:`${i}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:D0,title:`Leaves this chat and opens Marinara's home screen, where the ${u} tab is waiting.`,children:"Open the village"})})]})}customElements.get(i)||customElements.define(i,hp);
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
