var m$=Object.create;var Hu=Object.defineProperty;var p$=Object.getOwnPropertyDescriptor;var g$=Object.getOwnPropertyNames;var f$=Object.getPrototypeOf,b$=Object.prototype.hasOwnProperty;var v$=(e,t,a)=>t in e?Hu(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var xn=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var y$=(e,t,a,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of g$(t))!b$.call(e,r)&&r!==a&&Hu(e,r,{get:()=>t[r],enumerable:!(i=p$(t,r))||i.enumerable});return e};var cr=(e,t,a)=>(a=e!=null?m$(f$(e)):{},y$(t||!e||!e.__esModule?Hu(a,"default",{value:e,enumerable:!0}):a,e));var lc=(e,t,a)=>v$(e,typeof t!="symbol"?t+"":t,a);var $f=xn(ve=>{"use strict";var Bu=Symbol.for("react.transitional.element"),w$=Symbol.for("react.portal"),x$=Symbol.for("react.fragment"),$$=Symbol.for("react.strict_mode"),N$=Symbol.for("react.profiler"),S$=Symbol.for("react.consumer"),k$=Symbol.for("react.context"),T$=Symbol.for("react.forward_ref"),C$=Symbol.for("react.suspense"),E$=Symbol.for("react.memo"),pf=Symbol.for("react.lazy"),A$=Symbol.for("react.activity"),R$=Symbol.for("react.view_transition"),df=Symbol.iterator;function M$(e){return e===null||typeof e!="object"?null:(e=df&&e[df]||e["@@iterator"],typeof e=="function"?e:null)}var gf={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ff=Object.assign,bf={};function oo(e,t,a){this.props=e,this.context=t,this.refs=bf,this.updater=a||gf}oo.prototype.isReactComponent={};oo.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};oo.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function vf(){}vf.prototype=oo.prototype;function Lu(e,t,a){this.props=e,this.context=t,this.refs=bf,this.updater=a||gf}var ju=Lu.prototype=new vf;ju.constructor=Lu;ff(ju,oo.prototype);ju.isPureReactComponent=!0;var uf=Array.isArray;function qu(){}var pt={H:null,A:null,T:null,S:null},yf=Object.prototype.hasOwnProperty;function Gu(e,t,a){var i=a.ref;return{$$typeof:Bu,type:e,key:t,ref:i!==void 0?i:null,props:a}}function z$(e,t){return Gu(e.type,t,e.props)}function Yu(e){return typeof e=="object"&&e!==null&&e.$$typeof===Bu}function O$(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var hf=/\/+/g;function Uu(e,t){return typeof e=="object"&&e!==null&&e.key!=null?O$(""+e.key):t.toString(36)}function V$(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(qu,qu):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function ro(e,t,a,i,r){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case Bu:case w$:c=!0;break;case pf:return c=e._init,ro(c(e._payload),t,a,i,r)}}if(c)return r=r(e),c=i===""?"."+Uu(e,0):i,uf(r)?(a="",c!=null&&(a=c.replace(hf,"$&/")+"/"),ro(r,t,a,"",function(g){return g})):r!=null&&(Yu(r)&&(r=z$(r,a+(r.key==null||e&&e.key===r.key?"":(""+r.key).replace(hf,"$&/")+"/")+c)),t.push(r)),1;c=0;var d=i===""?".":i+":";if(uf(e))for(var h=0;h<e.length;h++)i=e[h],s=d+Uu(i,h),c+=ro(i,t,a,s,r);else if(h=M$(e),typeof h=="function")for(e=h.call(e),h=0;!(i=e.next()).done;)i=i.value,s=d+Uu(i,h++),c+=ro(i,t,a,s,r);else if(s==="object"){if(typeof e.then=="function")return ro(V$(e),t,a,i,r);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function cc(e,t,a){if(e==null)return e;var i=[],r=0;return ro(e,i,"","",function(s){return t.call(a,s,r++)}),i}function I$(e){if(e._status===-1){var t=e._result,a=t();a.then(function(i){(e._status===0||e._status===-1)&&(e._status=1,e._result=i,a.status===void 0&&(a.status="fulfilled",a.value=i))},function(i){(e._status===0||e._status===-1)&&(e._status=2,e._result=i,a.status===void 0&&(a.status="rejected",a.reason=i))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var mf=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function wf(e){var t=pt.T,a={};a.types=t!==null?t.types:null,pt.T=a;try{var i=e(),r=pt.S;r!==null&&r(a,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(qu,mf)}catch(s){mf(s)}finally{t!==null&&a.types!==null&&(t.types=a.types),pt.T=t}}function xf(e){var t=pt.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else wf(xf.bind(null,e))}var D$={map:cc,forEach:function(e,t,a){cc(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return cc(e,function(){t++}),t},toArray:function(e){return cc(e,function(t){return t})||[]},only:function(e){if(!Yu(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};ve.Activity=A$;ve.Children=D$;ve.Component=oo;ve.Fragment=x$;ve.Profiler=N$;ve.PureComponent=Lu;ve.StrictMode=$$;ve.Suspense=C$;ve.ViewTransition=R$;ve.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=pt;ve.__COMPILER_RUNTIME={__proto__:null,c:function(e){return pt.H.useMemoCache(e)}};ve.addTransitionType=xf;ve.cache=function(e){return function(){return e.apply(null,arguments)}};ve.cacheSignal=function(){return null};ve.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=ff({},e.props),r=e.key;if(t!=null)for(s in t.key!==void 0&&(r=""+t.key),t)!yf.call(t,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&t.ref===void 0||(i[s]=t[s]);var s=arguments.length-2;if(s===1)i.children=a;else if(1<s){for(var c=Array(s),d=0;d<s;d++)c[d]=arguments[d+2];i.children=c}return Gu(e.type,r,i)};ve.createContext=function(e){return e={$$typeof:k$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:S$,_context:e},e};ve.createElement=function(e,t,a){var i,r={},s=null;if(t!=null)for(i in t.key!==void 0&&(s=""+t.key),t)yf.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(r[i]=t[i]);var c=arguments.length-2;if(c===1)r.children=a;else if(1<c){for(var d=Array(c),h=0;h<c;h++)d[h]=arguments[h+2];r.children=d}if(e&&e.defaultProps)for(i in c=e.defaultProps,c)r[i]===void 0&&(r[i]=c[i]);return Gu(e,s,r)};ve.createRef=function(){return{current:null}};ve.forwardRef=function(e){return{$$typeof:T$,render:e}};ve.isValidElement=Yu;ve.lazy=function(e){return{$$typeof:pf,_payload:{_status:-1,_result:e},_init:I$}};ve.memo=function(e,t){return{$$typeof:E$,type:e,compare:t===void 0?null:t}};ve.startTransition=wf;ve.unstable_useCacheRefresh=function(){return pt.H.useCacheRefresh()};ve.use=function(e){return pt.H.use(e)};ve.useActionState=function(e,t,a){return pt.H.useActionState(e,t,a)};ve.useCallback=function(e,t){return pt.H.useCallback(e,t)};ve.useContext=function(e){return pt.H.useContext(e)};ve.useDebugValue=function(){};ve.useDeferredValue=function(e,t){return pt.H.useDeferredValue(e,t)};ve.useEffect=function(e,t){return pt.H.useEffect(e,t)};ve.useEffectEvent=function(e){return pt.H.useEffectEvent(e)};ve.useId=function(){return pt.H.useId()};ve.useImperativeHandle=function(e,t,a){return pt.H.useImperativeHandle(e,t,a)};ve.useInsertionEffect=function(e,t){return pt.H.useInsertionEffect(e,t)};ve.useLayoutEffect=function(e,t){return pt.H.useLayoutEffect(e,t)};ve.useMemo=function(e,t){return pt.H.useMemo(e,t)};ve.useOptimistic=function(e,t){return pt.H.useOptimistic(e,t)};ve.useReducer=function(e,t,a){return pt.H.useReducer(e,t,a)};ve.useRef=function(e){return pt.H.useRef(e)};ve.useState=function(e){return pt.H.useState(e)};ve.useSyncExternalStore=function(e,t,a){return pt.H.useSyncExternalStore(e,t,a)};ve.useTransition=function(){return pt.H.useTransition()};ve.version="19.3.0"});var Ms=xn((dk,Nf)=>{"use strict";Nf.exports=$f()});var Cf=xn(dc=>{"use strict";var _$=Symbol.for("react.transitional.element"),H$=Symbol.for("react.fragment");function Tf(e,t,a){var i=null;if(a!==void 0&&(i=""+a),t.key!==void 0&&(i=""+t.key),"key"in t){a={};for(var r in t)r!=="key"&&(a[r]=t[r])}else a=t;return t=a.ref,{$$typeof:_$,type:e,key:i,ref:t!==void 0?t:null,props:a}}dc.Fragment=H$;dc.jsx=Tf;dc.jsxs=Tf});var zs=xn((mk,Ef)=>{"use strict";Ef.exports=Cf()});var Lf=xn($t=>{"use strict";function Fu(e,t){var a=e.length;e.push(t);e:for(;0<a;){var i=a-1>>>1,r=e[i];if(0<uc(r,t))e[i]=t,e[a]=r,a=i;else break e}}function $n(e){return e.length===0?null:e[0]}function mc(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var i=0,r=e.length,s=r>>>1;i<s;){var c=2*(i+1)-1,d=e[c],h=c+1,g=e[h];if(0>uc(d,a))h<r&&0>uc(g,d)?(e[i]=g,e[h]=a,i=h):(e[i]=d,e[c]=a,i=c);else if(h<r&&0>uc(g,a))e[i]=g,e[h]=a,i=h;else break e}}return t}function uc(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}$t.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(Of=performance,$t.unstable_now=function(){return Of.now()}):(Zu=Date,Vf=Zu.now(),$t.unstable_now=function(){return Zu.now()-Vf});var Of,Zu,Vf,Jn=[],yi=[],j$=1,Za=null,sa=3,Ku=!1,Os=!1,Vs=!1,Wu=!1,_f=typeof setTimeout=="function"?setTimeout:null,Hf=typeof clearTimeout=="function"?clearTimeout:null,If=typeof setImmediate<"u"?setImmediate:null;function hc(e){for(var t=$n(yi);t!==null;){if(t.callback===null)mc(yi);else if(t.startTime<=e)mc(yi),t.sortIndex=t.expirationTime,Fu(Jn,t);else break;t=$n(yi)}}function eh(e){if(Vs=!1,hc(e),!Os)if($n(Jn)!==null)Os=!0,co||(co=!0,lo());else{var t=$n(yi);t!==null&&th(eh,t.startTime-e)}}var co=!1,Is=-1,Uf=5,qf=-1;function Bf(){return Wu?!0:!($t.unstable_now()-qf<Uf)}function Qu(){if(Wu=!1,co){var e=$t.unstable_now();qf=e;var t=!0;try{e:{Os=!1,Vs&&(Vs=!1,Hf(Is),Is=-1),Ku=!0;var a=sa;try{t:{for(hc(e),Za=$n(Jn);Za!==null&&!(Za.expirationTime>e&&Bf());){var i=Za.callback;if(typeof i=="function"){Za.callback=null,sa=Za.priorityLevel;var r=i(Za.expirationTime<=e);if(e=$t.unstable_now(),typeof r=="function"){Za.callback=r,hc(e),t=!0;break t}Za===$n(Jn)&&mc(Jn),hc(e)}else mc(Jn);Za=$n(Jn)}if(Za!==null)t=!0;else{var s=$n(yi);s!==null&&th(eh,s.startTime-e),t=!1}}break e}finally{Za=null,sa=a,Ku=!1}t=void 0}}finally{t?lo():co=!1}}}var lo;typeof If=="function"?lo=function(){If(Qu)}:typeof MessageChannel<"u"?(Ju=new MessageChannel,Df=Ju.port2,Ju.port1.onmessage=Qu,lo=function(){Df.postMessage(null)}):lo=function(){_f(Qu,0)};var Ju,Df;function th(e,t){Is=_f(function(){e($t.unstable_now())},t)}$t.unstable_IdlePriority=5;$t.unstable_ImmediatePriority=1;$t.unstable_LowPriority=4;$t.unstable_NormalPriority=3;$t.unstable_Profiling=null;$t.unstable_UserBlockingPriority=2;$t.unstable_cancelCallback=function(e){e.callback=null};$t.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Uf=0<e?Math.floor(1e3/e):5};$t.unstable_getCurrentPriorityLevel=function(){return sa};$t.unstable_next=function(e){switch(sa){case 1:case 2:case 3:var t=3;break;default:t=sa}var a=sa;sa=t;try{return e()}finally{sa=a}};$t.unstable_requestPaint=function(){Wu=!0};$t.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=sa;sa=e;try{return t()}finally{sa=a}};$t.unstable_scheduleCallback=function(e,t,a){var i=$t.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?i+a:i):a=i,e){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=a+r,e={id:j$++,callback:t,priorityLevel:e,startTime:a,expirationTime:r,sortIndex:-1},a>i?(e.sortIndex=a,Fu(yi,e),$n(Jn)===null&&e===$n(yi)&&(Vs?(Hf(Is),Is=-1):Vs=!0,th(eh,a-i))):(e.sortIndex=r,Fu(Jn,e),Os||Ku||(Os=!0,co||(co=!0,lo()))),e};$t.unstable_shouldYield=Bf;$t.unstable_wrapCallback=function(e){var t=sa;return function(){var a=sa;sa=t;try{return e.apply(this,arguments)}finally{sa=a}}}});var Gf=xn((vk,jf)=>{"use strict";jf.exports=Lf()});var Pf=xn(la=>{"use strict";var G$=Ms();function Xf(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function wi(){}var ba={d:{f:wi,r:function(){throw Error(Xf(522))},D:wi,C:wi,L:wi,m:wi,X:wi,S:wi,M:wi},p:0,findDOMNode:null},Y$=Symbol.for("react.portal"),X$=Symbol.for("react.recoverable"),Yf=Symbol.for("react.optimistic_key");function P$(e,t,a){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Y$,key:i==null?null:i===Yf?Yf:""+i,children:e,containerInfo:t,implementation:a}}var Ds=G$.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function pc(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}la.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ba;la.browser=function(e){return{$$typeof:X$,_reason:e}};la.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Xf(299));return P$(e,t,null,a)};la.flushSync=function(e){var t=Ds.T,a=ba.p;try{if(Ds.T=null,ba.p=2,e)return e()}finally{Ds.T=t,ba.p=a,ba.d.f()}};la.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,ba.d.C(e,t))};la.prefetchDNS=function(e){typeof e=="string"&&ba.d.D(e)};la.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,i=pc(a,t.crossOrigin),r=typeof t.integrity=="string"?t.integrity:void 0,s=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?ba.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:r,fetchPriority:s}):a==="script"&&ba.d.X(e,{crossOrigin:i,integrity:r,fetchPriority:s,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};la.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=pc(t.as,t.crossOrigin);ba.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&ba.d.M(e)};la.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,i=pc(a,t.crossOrigin);ba.d.L(e,a,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};la.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=pc(t.as,t.crossOrigin);ba.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else ba.d.m(e)};la.requestFormReset=function(e){ba.d.r(e)};la.unstable_batchedUpdates=function(e,t){return e(t)};la.useFormState=function(e,t,a){return Ds.H.useFormState(e,t,a)};la.useFormStatus=function(){return Ds.H.useHostTransitionStatus()};la.version="19.3.0"});var Jf=xn((wk,Qf)=>{"use strict";function Zf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Zf)}catch(e){console.error(e)}}Zf(),Qf.exports=Pf()});var D0=xn(Qd=>{"use strict";var Gt=Gf(),Iv=Ms(),Z$=Jf();function H(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Dv(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Nl(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function _v(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Hv(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Ff(e){if(Nl(e)!==e)throw Error(H(188))}function Q$(e){var t=e.alternate;if(!t){if(t=Nl(e),t===null)throw Error(H(188));return t!==e?null:e}for(var a=e,i=t;;){var r=a.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){a=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===a)return Ff(r),e;if(s===i)return Ff(r),t;s=s.sibling}throw Error(H(188))}if(a.return!==i.return)a=r,i=s;else{for(var c=!1,d=r.child;d;){if(d===a){c=!0,a=r,i=s;break}if(d===i){c=!0,i=r,a=s;break}d=d.sibling}if(!c){for(d=s.child;d;){if(d===a){c=!0,a=s,i=r;break}if(d===i){c=!0,i=s,a=r;break}d=d.sibling}if(!c)throw Error(H(189))}}if(a.alternate!==i)throw Error(H(190))}if(a.tag!==3)throw Error(H(188));return a.stateNode.current===a?e:t}function Uv(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=Uv(e),t!==null)return t;e=e.sibling}return null}function Ea(e,t,a,i,r,s){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,i,r,s)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Ea(e.child,t,a,i,r,s))return!0;e=e.sibling}return!1}function Rr(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Kf(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function qv(e){var t=[null,null],a=Rr(e);return a===null||Bv(t,e,a.child,{foundSelf:!1}),t}function Bv(e,t,a,i){for(;a!==null;){if(a===t)i.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(i.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&Bv(e,t,a.child,i))return!0;a=a.sibling}return!1}function jt(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(H(559))}}var bo=null,Oh=null;function J$(e,t,a){return e===a?!0:e===t?(bo=e,!0):!1}function F$(e,t,a){return e===a?(Oh=e,!1):e===t?(Oh!==null&&(bo=e),!0):!1}function Wf(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function Vh(e,t,a){for(var i=0,r=e;r;r=a(r))i++;r=0;for(var s=t;s;s=a(s))r++;for(;0<i-r;)e=a(e),i--;for(;0<r-i;)t=a(t),r--;for(;i--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var lt=Object.assign,K$=Symbol.for("react.element"),gc=Symbol.for("react.transitional.element"),js=Symbol.for("react.portal"),vo=Symbol.for("react.fragment"),Lv=Symbol.for("react.strict_mode"),Ih=Symbol.for("react.profiler"),jv=Symbol.for("react.consumer"),En=Symbol.for("react.context"),Gm=Symbol.for("react.forward_ref"),Dh=Symbol.for("react.suspense"),_h=Symbol.for("react.suspense_list"),Ym=Symbol.for("react.memo"),Si=Symbol.for("react.lazy"),Hh=Symbol.for("react.activity"),W$=Symbol.for("react.legacy_hidden"),e5=Symbol.for("react.memo_cache_sentinel"),Uh=Symbol.for("react.view_transition"),t5=Symbol.for("react.recoverable"),eb=Symbol.iterator;function _s(e){return e===null||typeof e!="object"?null:(e=eb&&e[eb]||e["@@iterator"],typeof e=="function"?e:null)}var a5=Symbol.for("react.client.reference");function qh(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===a5?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case vo:return"Fragment";case Ih:return"Profiler";case Lv:return"StrictMode";case Dh:return"Suspense";case _h:return"SuspenseList";case Hh:return"Activity";case Uh:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case js:return"Portal";case En:return e.displayName||"Context";case jv:return(e._context.displayName||"Context")+".Consumer";case Gm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Ym:return t=e.displayName||null,t!==null?t:qh(e.type)||"Memo";case Si:t=e._payload,e=e._init;try{return qh(e(t))}catch{}}return null}var Gs=Array.isArray,ge=Iv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Xe=Z$.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,br={pending:!1,data:null,method:null,action:null},Bh=[],yo=-1;function In(e){return{current:e}}function ea(e){0>yo||(e.current=Bh[yo],Bh[yo]=null,yo--)}function bt(e,t){yo++,Bh[yo]=e.current,e.current=t}var zn=In(null),sl=In(null),Oi=In(null),td=In(null);function ad(e,t){switch(bt(Oi,t),bt(sl,e),bt(zn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?pv(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=pv(t),e=u0(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}ea(zn),bt(zn,e)}function Uo(){ea(zn),ea(sl),ea(Oi)}function Lh(e){var t=e.memoizedState;t!==null&&(Qo._currentValue=t.memoizedState,bt(td,e)),t=zn.current;var a=u0(t,e.type);t!==a&&(bt(sl,e),bt(zn,a))}function nd(e){sl.current===e&&(ea(zn),ea(sl)),td.current===e&&(ea(td),Qo._currentValue=br)}var ah,tb;function $i(e){if(ah===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);ah=t&&t[1]||"",tb=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+ah+e+tb}var nh=!1;function ih(e,t){if(!e||nh)return"";nh=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var N=function(){throw Error()};if(Object.defineProperty(N.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(N,[])}catch(V){var f=V}Reflect.construct(e,[],N)}else{try{N.call()}catch(V){f=V}N=!1;try{var v=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),N=!0,new e}finally{N&&(v!==void 0?Object.defineProperty(e.prototype,"props",v):delete e.prototype.props)}}}else{try{throw Error()}catch(V){f=V}(N=e())&&typeof N.catch=="function"&&N.catch(function(){})}}catch(V){if(V&&f&&typeof V.stack=="string")return[V.stack,f.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=i.DetermineComponentFrameRoot(),c=s[0],d=s[1];if(c&&d){var h=c.split(`
`),g=d.split(`
`);for(r=i=0;i<h.length&&!h[i].includes("DetermineComponentFrameRoot");)i++;for(;r<g.length&&!g[r].includes("DetermineComponentFrameRoot");)r++;if(i===h.length||r===g.length)for(i=h.length-1,r=g.length-1;1<=i&&0<=r&&h[i]!==g[r];)r--;for(;1<=i&&0<=r;i--,r--)if(h[i]!==g[r]){if(i!==1||r!==1)do if(i--,r--,0>r||h[i]!==g[r]){var b=`
`+h[i].replace(" at new "," at ");return e.displayName&&b.includes("<anonymous>")&&(b=b.replace("<anonymous>",e.displayName)),b}while(1<=i&&0<=r);break}}}finally{nh=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?$i(a):""}function n5(e,t){switch(e.tag){case 26:case 27:case 5:return $i(e.type);case 16:return $i("Lazy");case 13:return e.child!==t&&t!==null?$i("Suspense Fallback"):$i("Suspense");case 19:return $i("SuspenseList");case 0:case 15:return ih(e.type,!1);case 11:return ih(e.type.render,!1);case 1:return ih(e.type,!0);case 31:return $i("Activity");case 30:return $i("ViewTransition");default:return""}}function ab(e){try{var t="",a=null;do t+=n5(e,a),a=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var jh=Object.prototype.hasOwnProperty,Xm=Gt.unstable_scheduleCallback,rh=Gt.unstable_cancelCallback,i5=Gt.unstable_shouldYield,r5=Gt.unstable_requestPaint,Da=Gt.unstable_now,o5=Gt.unstable_getCurrentPriorityLevel,Gv=Gt.unstable_ImmediatePriority,Yv=Gt.unstable_UserBlockingPriority,id=Gt.unstable_NormalPriority,s5=Gt.unstable_LowPriority,Xv=Gt.unstable_IdlePriority,l5=Gt.log,c5=Gt.unstable_setDisableYieldValue,Sl=null,_a=null;function Ci(e){if(typeof l5=="function"&&c5(e),_a&&typeof _a.setStrictMode=="function")try{_a.setStrictMode(Sl,e)}catch{}}var Ha=Math.clz32?Math.clz32:h5,d5=Math.log,u5=Math.LN2;function h5(e){return e>>>=0,e===0?32:31-(d5(e)/u5|0)|0}var fc=256,bc=262144,vc=4194304;function hr(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Rd(e,t,a){var i=e.pendingLanes;if(i===0)return 0;var r=0,s=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var d=i&134217727;return d!==0?(i=d&~s,i!==0?r=hr(i):(c&=d,c!==0?r=hr(c):a||(a=d&~e,a!==0&&(r=hr(a))))):(d=i&~s,d!==0?r=hr(d):c!==0?r=hr(c):a||(a=i&~e,a!==0&&(r=hr(a)))),r===0?0:t!==0&&t!==r&&(t&s)===0&&(s=r&-r,a=t&-t,s>=a||s===32&&(a&4194048)!==0)?t:r}function kl(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Pv(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var i=31-Ha(a),r=1<<i;t|=e[i],a&=~r}return t}function m5(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Zv(){var e=vc;return vc<<=1,(vc&62914560)===0&&(vc=4194304),e}function oh(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Tl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function p5(e,t,a,i,r,s){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var d=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=c&~a;0<a;){var b=31-Ha(a),N=1<<b;d[b]=0,h[b]=-1;var f=g[b];if(f!==null)for(g[b]=null,b=0;b<f.length;b++){var v=f[b];v!==null&&(v.lane&=-536870913)}a&=~N}i!==0&&Qv(e,i,0),s!==0&&r===0&&e.tag!==0&&(e.suspendedLanes|=s&~(c&~t))}function Qv(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-Ha(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|a&261930}function Jv(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var i=31-Ha(a),r=1<<i;r&t|e[i]&t&&(e[i]|=t),a&=~r}}function Fv(e,t){var a=t&-t;return a=(a&42)!==0?1:Pm(a),(a&(e.suspendedLanes|t))!==0?0:a}function Pm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Zm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Kv(){var e=Xe.p;return e!==0?e:(e=window.event,e===void 0?32:O0(e.type))}function nb(e,t){var a=Xe.p;try{return Xe.p=e,t()}finally{Xe.p=a}}var ci=Math.random().toString(36).slice(2),Kt="__reactFiber$"+ci,Aa="__reactProps$"+ci,Ko="__reactContainer$"+ci,ib="__reactEvents$"+ci,g5="__reactListeners$"+ci,f5="__reactHandles$"+ci,rb="__reactResources$"+ci,Cl="__reactMarker$"+ci,rd="__reactLoad$"+ci;function Md(e){delete e[Kt],delete e[Aa],delete e[g5],delete e[f5]}function gr(e){var t;if(t=e[Kt])return t;for(var a=e.parentNode;a;){if(t=a[Ko]||a[Kt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=$v(e);e!==null;){if(a=e[Kt])return a;e=$v(e)}return t}e=a,a=e.parentNode}return null}function Wo(e){if(e=e[Kt]||e[Ko]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Ys(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(H(33))}function Ao(e){var t=e[rb];return t||(t=e[rb]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function Zt(e){e[Cl]=!0}function Wv(e){e[rd]=void 0}var ey=new Set,ty={};function Mr(e,t){qo(e,t),qo(e+"Capture",t)}function qo(e,t){for(ty[e]=t,e=0;e<t.length;e++)ey.add(t[e])}var b5=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),ob={},sb={};function v5(e){return jh.call(sb,e)?!0:jh.call(ob,e)?!1:b5.test(e)?sb[e]=!0:(ob[e]=!0,!1)}var je=!1;function lb(){var e=je;return je=!1,e}function Dc(e,t,a){if(v5(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function yc(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function Fn(e,t,a,i){if(i===null)e.removeAttribute(a);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,i)}}function za(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function ay(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function y5(e,t,a){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var r=i.get,s=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return r.call(this)},set:function(c){a=""+c,s.call(this,c)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Gh(e){if(!e._valueTracker){var t=ay(e)?"checked":"value";e._valueTracker=y5(e,t,""+e[t])}}function ny(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),i="";return e&&(i=ay(e)?e.checked?"true":"false":e.value),e=i,e!==a?(t.setValue(e),!0):!1}var w5=/[\n"\\]/g;function Wa(e){return e.replace(w5,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Yh(e,t,a,i,r,s,c,d){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+za(t)):e.value!==""+za(t)&&(e.value=""+za(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?sh(e,za(e.value)):sh(e,za(t)):a!=null?sh(e,za(a)):i!=null&&e.removeAttribute("value"),r==null&&s!=null&&(e.defaultChecked=!!s),r!=null&&(e.checked=r&&typeof r!="function"&&typeof r!="symbol"),d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"?e.name=""+za(d):e.removeAttribute("name")}function iy(e,t,a,i,r,s,c,d){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.type=s),t!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||t!=null)){Gh(e);return}a=a!=null?""+za(a):"",t=t!=null?""+za(t):a,d||t===e.value||(e.value=t),e.defaultValue=t}i=i??r,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=d?e.checked:!!i,e.defaultChecked=!!i,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),Gh(e)}function sh(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function Ro(e,t,a,i){if(e=e.options,t){t={};for(var r=0;r<a.length;r++)t["$"+a[r]]=!0;for(a=0;a<e.length;a++)r=t.hasOwnProperty("$"+e[a].value),e[a].selected!==r&&(e[a].selected=r),r&&i&&(e[a].defaultSelected=!0)}else{for(a=""+za(a),t=null,r=0;r<e.length;r++){if(e[r].value===a){e[r].selected=!0,i&&(e[r].defaultSelected=!0);return}t!==null||e[r].disabled||(t=e[r])}t!==null&&(t.selected=!0)}}function ry(e,t,a){if(t!=null&&(t=""+za(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+za(a):""}function oy(e,t,a,i){if(t==null){if(i!=null){if(a!=null)throw Error(H(92));if(Gs(i)){if(1<i.length)throw Error(H(93));i=i[0]}a=i}a==null&&(a=""),t=a}a=za(t),e.defaultValue=a,i=e.textContent,i===a&&i!==""&&i!==null&&(e.value=i),Gh(e)}function Bo(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var x5=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function cb(e,t,a){var i=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,a):typeof a!="number"||a===0||x5.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function sy(e,t,a){if(t!=null&&typeof t!="object")throw Error(H(62));if(e=e.style,a!=null){for(var i in a)!a.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="",je=!0);for(var r in t)i=t[r],t.hasOwnProperty(r)&&a[r]!==i&&(cb(e,r,i),je=!0)}else for(var s in t)t.hasOwnProperty(s)&&cb(e,s,t[s])}function Qm(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var $5=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),N5=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function _c(e){return N5.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function An(){}var Xh=null;function Jm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var wo=null,Mo=null;function db(e){var t=Wo(e);if(t&&(e=t.stateNode)){var a=e[Aa]||null;e:switch(e=t.stateNode,t.type){case"input":if(Yh(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Wa(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var i=a[t];if(i!==e&&i.form===e.form){var r=i[Aa]||null;if(!r)throw Error(H(90));Yh(i,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(t=0;t<a.length;t++)i=a[t],i.form===e.form&&ny(i)}break e;case"textarea":ry(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&Ro(e,!!a.multiple,t,!1)}}}var lh=!1;function ly(e,t,a){if(lh)return e(t,a);lh=!0;try{var i=e(t);return i}finally{if(lh=!1,(wo!==null||Mo!==null)&&(Yd(),wo&&(t=wo,e=Mo,Mo=wo=null,db(t),e)))for(t=0;t<e.length;t++)db(e[t])}}function ll(e,t){var a=e.stateNode;if(a===null)return null;var i=a[Aa]||null;if(i===null)return null;a=i[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(H(231,t,typeof a));return a}var ni=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Ph=!1;if(ni)try{uo={},Object.defineProperty(uo,"passive",{get:function(){Ph=!0}}),window.addEventListener("test",uo,uo),window.removeEventListener("test",uo,uo)}catch{Ph=!1}var uo,Ei=null,Fm=null,Hc=null;function cy(){if(Hc)return Hc;var e,t=Fm,a=t.length,i,r="value"in Ei?Ei.value:Ei.textContent,s=r.length;for(e=0;e<a&&t[e]===r[e];e++);var c=a-e;for(i=1;i<=c&&t[a-i]===r[s-i];i++);return Hc=r.slice(e,1<i?1-i:void 0)}function Uc(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function wc(){return!0}function ub(){return!1}function xa(e){function t(a,i,r,s,c){this._reactName=a,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=c,this.currentTarget=null;for(var d in e)e.hasOwnProperty(d)&&(a=e[d],this[d]=a?a(s):s[d]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?wc:ub,this.isPropagationStopped=ub,this}return lt(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=wc)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=wc)},persist:function(){},isPersistent:wc}),t}var Zi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},zd=xa(Zi),El=lt({},Zi,{view:0,detail:0}),S5=xa(El),ch,dh,Hs,Od=lt({},El,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Km,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Hs&&(Hs&&e.type==="mousemove"?(ch=e.screenX-Hs.screenX,dh=e.screenY-Hs.screenY):dh=ch=0,Hs=e),ch)},movementY:function(e){return"movementY"in e?e.movementY:dh}}),hb=xa(Od),k5=lt({},Od,{dataTransfer:0}),T5=xa(k5),C5=lt({},El,{relatedTarget:0}),uh=xa(C5),E5=lt({},Zi,{animationName:0,elapsedTime:0,pseudoElement:0}),A5=xa(E5),R5=lt({},Zi,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),M5=xa(R5),z5=lt({},Zi,{data:0}),mb=xa(z5),O5={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},V5={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},I5={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function D5(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=I5[e])?!!t[e]:!1}function Km(){return D5}var _5=lt({},El,{key:function(e){if(e.key){var t=O5[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Uc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?V5[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Km,charCode:function(e){return e.type==="keypress"?Uc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Uc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),H5=xa(_5),U5=lt({},Od,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),pb=xa(U5),q5=lt({},Zi,{submitter:0}),B5=xa(q5),L5=lt({},El,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Km}),j5=xa(L5),G5=lt({},Zi,{propertyName:0,elapsedTime:0,pseudoElement:0}),Y5=xa(G5),X5=lt({},Od,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),P5=xa(X5),Z5=lt({},Zi,{newState:0,oldState:0,source:0}),Q5=xa(Z5),J5=[9,13,27,32],Wm=ni&&"CompositionEvent"in window,Zs=null;ni&&"documentMode"in document&&(Zs=document.documentMode);var F5=ni&&"TextEvent"in window&&!Zs,dy=ni&&(!Wm||Zs&&8<Zs&&11>=Zs),gb=" ",fb=!1;function uy(e,t){switch(e){case"keyup":return J5.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function hy(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var xo=!1;function K5(e,t){switch(e){case"compositionend":return hy(t);case"keypress":return t.which!==32?null:(fb=!0,gb);case"textInput":return e=t.data,e===gb&&fb?null:e;default:return null}}function W5(e,t){if(xo)return e==="compositionend"||!Wm&&uy(e,t)?(e=cy(),Hc=Fm=Ei=null,xo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return dy&&t.locale!=="ko"?null:t.data;default:return null}}var eN={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function bb(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!eN[e.type]:t==="textarea"}function my(e,t,a,i){wo?Mo?Mo.push(i):Mo=[i]:wo=i,t=Cd(t,"onChange"),0<t.length&&(a=new zd("onChange","change",null,a,i),e.push({event:a,listeners:t}))}var Qs=null,cl=null;function tN(e){l0(e,0)}function Vd(e){var t=Ys(e);if(ny(t))return e}function vb(e,t){if(e==="change")return t}var py=!1;ni&&(ni?($c="oninput"in document,$c||(hh=document.createElement("div"),hh.setAttribute("oninput","return;"),$c=typeof hh.oninput=="function"),xc=$c):xc=!1,py=xc&&(!document.documentMode||9<document.documentMode));var xc,$c,hh;function yb(){Qs&&(Qs.detachEvent("onpropertychange",gy),cl=Qs=null)}function gy(e){if(e.propertyName==="value"&&Vd(cl)){var t=[];my(t,cl,e,Jm(e)),ly(tN,t)}}function aN(e,t,a){e==="focusin"?(yb(),Qs=t,cl=a,Qs.attachEvent("onpropertychange",gy)):e==="focusout"&&yb()}function nN(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Vd(cl)}function iN(e,t){if(e==="click")return Vd(t)}function rN(e,t){if(e==="input"||e==="change")return Vd(t)}function oN(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var qa=typeof Object.is=="function"?Object.is:oN;function dl(e,t){if(qa(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),i=Object.keys(t);if(a.length!==i.length)return!1;for(i=0;i<a.length;i++){var r=a[i];if(!jh.call(t,r)||!qa(e[r],t[r]))return!1}return!0}function Zh(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function wb(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function xb(e,t){var a=wb(e);e=0;for(var i;a;){if(a.nodeType===3){if(i=e+a.textContent.length,e<=t&&i>=t)return{node:a,offset:t-e};e=i}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=wb(a)}}function fy(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?fy(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function by(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Zh(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=Zh(e.document)}return t}function ep(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var sN=ni&&"documentMode"in document&&11>=document.documentMode,$o=null,Qh=null,Js=null,Jh=!1;function $b(e,t,a){var i=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Jh||$o==null||$o!==Zh(i)||(i=$o,"selectionStart"in i&&ep(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Js&&dl(Js,i)||(Js=i,i=Cd(Qh,"onSelect"),0<i.length&&(t=new zd("onSelect","select",null,t,a),e.push({event:t,listeners:i}),t.target=$o)))}function dr(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var No={animationend:dr("Animation","AnimationEnd"),animationiteration:dr("Animation","AnimationIteration"),animationstart:dr("Animation","AnimationStart"),transitionrun:dr("Transition","TransitionRun"),transitionstart:dr("Transition","TransitionStart"),transitioncancel:dr("Transition","TransitionCancel"),transitionend:dr("Transition","TransitionEnd")},mh={},vy={};ni&&(vy=document.createElement("div").style,"AnimationEvent"in window||(delete No.animationend.animation,delete No.animationiteration.animation,delete No.animationstart.animation),"TransitionEvent"in window||delete No.transitionend.transition);function zr(e){if(mh[e])return mh[e];if(!No[e])return e;var t=No[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in vy)return mh[e]=t[a];return e}var yy=zr("animationend"),wy=zr("animationiteration"),xy=zr("animationstart"),lN=zr("transitionrun"),cN=zr("transitionstart"),dN=zr("transitioncancel"),$y=zr("transitionend"),Ny=new Map,Fh="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Fh.push("scrollEnd");function pn(e,t){Ny.set(e,t),Mr(t,[e])}var uN=0;function ii(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=mn.identifierPrefix;var a=uN++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function Nb(e){if(e==null||typeof e=="string")return e;var t=null,a=Ho;if(a!==null)for(var i=0;i<a.length;i++){var r=e[a[i]];if(r!=null){if(r==="none")return"none";t=t==null?r:t+(" "+r)}}return t??e.default}function di(e,t){return e=Nb(e),t=Nb(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var od=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Ja=[],So=0,tp=0;function Id(){for(var e=So,t=tp=So=0;t<e;){var a=Ja[t];Ja[t++]=null;var i=Ja[t];Ja[t++]=null;var r=Ja[t];Ja[t++]=null;var s=Ja[t];if(Ja[t++]=null,i!==null&&r!==null){var c=i.pending;c===null?r.next=r:(r.next=c.next,c.next=r),i.pending=r}s!==0&&Sy(a,r,s)}}function Dd(e,t,a,i){Ja[So++]=e,Ja[So++]=t,Ja[So++]=a,Ja[So++]=i,tp|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function ap(e,t,a,i){return Dd(e,t,a,i),sd(e)}function Or(e,t){return Dd(e,null,null,t),sd(e)}function Sy(e,t,a){e.lanes|=a;var i=e.alternate;i!==null&&(i.lanes|=a);for(var r=!1,s=e.return;s!==null;)s.childLanes|=a,i=s.alternate,i!==null&&(i.childLanes|=a),s.tag===22&&(e=s.stateNode,e===null||e._visibility&1||(r=!0)),e=s,s=s.return;return e.tag===3?(s=e.stateNode,r&&t!==null&&(r=31-Ha(a),e=s.hiddenUpdates,i=e[r],i===null?e[r]=[t]:i.push(t),t.lane=a|536870912),s):null}function sd(e){if(50<ol)throw ol=0,Qc=null,Error(H(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var ko={};function hN(e,t,a,i){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ta(e,t,a,i){return new hN(e,t,a,i)}function np(e){return e=e.prototype,!(!e||!e.isReactComponent)}function ti(e,t){var a=e.alternate;return a===null?(a=Ta(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function ky(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function qc(e,t,a,i,r,s){var c=0;if(i=e,typeof i=="function")np(i)&&(c=1);else if(typeof i=="string")c=HS(e,a,zn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(i){case Hh:return e=Ta(31,a,t,r),e.elementType=Hh,e.lanes=s,e;case vo:return vr(a.children,r,s,t);case Lv:c=8,r|=24;break;case Ih:return e=Ta(12,a,t,r|2),e.elementType=Ih,e.lanes=s,e;case Dh:return e=Ta(13,a,t,r),e.elementType=Dh,e.lanes=s,e;case _h:return e=Ta(19,a,t,r),e.elementType=_h,e.lanes=s,e;case W$:case Uh:return e=r|32,e=Ta(30,a,t,e),e.elementType=Uh,e.lanes=s,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof i=="object"&&i!==null)switch(i.$$typeof){case En:c=10;break e;case jv:c=9;break e;case Gm:c=11;break e;case Ym:c=14;break e;case Si:c=16,i=null;break e}c=29,a=Error(H(130,e===null?"null":typeof e,"")),i=null}return t=Ta(c,a,t,r),t.elementType=e,t.type=i,t.lanes=s,t}function vr(e,t,a,i){return e=Ta(7,e,i,t),e.lanes=a,e}function ph(e,t,a){return e=Ta(6,e,null,t),e.lanes=a,e}function Ty(e){var t=Ta(18,null,null,0);return t.stateNode=e,t}function gh(e,t,a){return t=Ta(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Sb=new WeakMap;function en(e,t){if(typeof e=="object"&&e!==null){var a=Sb.get(e);return a!==void 0?a:(t={value:e,source:t,stack:ab(t)},Sb.set(e,t),t)}return{value:e,source:t,stack:ab(t)}}var To=[],Co=0,ld=null,ul=0,Fa=[],Ka=0,ji=null,Rn=1,Mn="";function Wn(e,t){To[Co++]=ul,To[Co++]=ld,ld=e,ul=t}function Cy(e,t,a){Fa[Ka++]=Rn,Fa[Ka++]=Mn,Fa[Ka++]=ji,ji=e;var i=Rn;e=Mn;var r=32-Ha(i)-1;i&=~(1<<r),a+=1;var s=32-Ha(t)+r;if(30<s){var c=r-r%5;s=(i&(1<<c)-1).toString(32),i>>=c,r-=c,Rn=1<<32-Ha(t)+r|a<<r|i,Mn=s+e}else Rn=1<<s|a<<r|i,Mn=e}function _d(e){e.return!==null&&(Wn(e,1),Cy(e,1,0))}function ip(e){for(;e===ld;)ld=To[--Co],To[Co]=null,ul=To[--Co],To[Co]=null;for(;e===ji;)ji=Fa[--Ka],Fa[Ka]=null,Mn=Fa[--Ka],Fa[Ka]=null,Rn=Fa[--Ka],Fa[Ka]=null}function Ey(e,t){Fa[Ka++]=Rn,Fa[Ka++]=Mn,Fa[Ka++]=ji,Rn=t.id,Mn=t.overflow,ji=e}var Qt=null,ft=null,Te=!1,Vi=null,tn=!1,Kh=Error(H(519));function Gi(e){var t=Error(H(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw hl(en(t,e)),Kh}function kb(e){var t=e.stateNode,a=e.type,i=e.memoizedProps;switch(t[Kt]=e,t[Aa]=i,a){case"dialog":Ce("cancel",t),Ce("close",t);break;case"iframe":case"object":case"embed":Ce("load",t);break;case"video":case"audio":for(a=0;a<fl.length;a++)Ce(fl[a],t);break;case"source":Ce("error",t);break;case"img":case"image":case"link":Ce("error",t),Ce("load",t);break;case"details":Ce("toggle",t);break;case"input":Ce("invalid",t),iy(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":Ce("invalid",t);break;case"textarea":Ce("invalid",t),oy(t,i.value,i.defaultValue,i.children)}a=i.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||i.suppressHydrationWarning===!0||d0(t.textContent,a)?(i.popover!=null&&(Ce("beforetoggle",t),Ce("toggle",t)),i.onScroll!=null&&Ce("scroll",t),i.onScrollEnd!=null&&Ce("scrollend",t),i.onClick!=null&&(t.onclick=An),t=!0):t=!1,t||Gi(e,!0)}function cd(e){for(Qt=e.return;Qt;)switch(Qt.tag){case 5:case 31:case 13:tn=!1;return;case 27:case 3:tn=!0;return;default:Qt=Qt.return}}function ho(e){if(e!==Qt)return!1;if(!Te)return cd(e),Te=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Dm(e.type,e.memoizedProps)),a=!a),a&&ft&&Gi(e),cd(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(H(317));ft=xv(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(H(317));ft=xv(e)}else t===27?(t=ft,Qi(e.type)?(e=qm,qm=null,ft=e):ft=t):ft=Qt?an(e.stateNode.nextSibling):null;return!0}function $r(){ft=Qt=null,Te=!1}function fh(){var e=Vi;return e!==null&&(Sa===null?Sa=e:Sa.push.apply(Sa,e),Vi=null),e}function hl(e){Vi===null?Vi=[e]:Vi.push(e)}var Wh=In(null),Vr=null,ei=null;function Ai(e,t,a){bt(Wh,t._currentValue),t._currentValue=a}function ai(e){e._currentValue=Wh.current,ea(Wh)}function Bc(e,t,a){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===a)break;e=e.return}}function em(e,t,a,i){var r=e.child;for(r!==null&&(r.return=e);r!==null;){var s=r.dependencies;if(s!==null){var c=r.child;s=s.firstContext;e:for(;s!==null;){var d=s;s=r;for(var h=0;h<t.length;h++)if(d.context===t[h]){s.lanes|=a,d=s.alternate,d!==null&&(d.lanes|=a),Bc(s.return,a,e),i||(c=null);break e}s=d.next}}else if(r.tag===18){if(c=r.return,c===null)throw Error(H(341));c.lanes|=a,s=c.alternate,s!==null&&(s.lanes|=a),Bc(c,a,e),c=null}else r.tag===13&&r.memoizedState!==null&&r.memoizedState.dehydrated===null?(r.lanes|=a,c=r.alternate,c!==null&&(c.lanes|=a),Bc(r.return,a,e),c=r.child,c=c!==null?c.sibling:null):c=r.child;if(c!==null)c.return=r;else for(c=r;c!==null;){if(c===e){c=null;break}if(r=c.sibling,r!==null){r.return=c.return,c=r;break}c=c.return}r=c}}function Nr(e,t,a,i){e=null;for(var r=t,s=!1;r!==null;){if(!s){if((r.flags&524288)!==0)s=!0;else if((r.flags&262144)!==0)break}if(r.tag===10){var c=r.alternate;if(c===null)throw Error(H(387));if(c=c.memoizedProps,c!==null){var d=r.type;qa(r.pendingProps.value,c.value)||(e!==null?e.push(d):e=[d])}}else if(r===td.current){if(c=r.alternate,c===null)throw Error(H(387));c.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(e!==null?e.push(Qo):e=[Qo])}r=r.return}return e!==null&&em(t,e,a,i),t.flags|=262144,e!==null}function dd(e){for(e=e.firstContext;e!==null;){if(!qa(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Sr(e){Vr=e,ei=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Wt(e){return Ay(Vr,e)}function Nc(e,t){return Vr===null&&Sr(e),Ay(e,t)}function Ay(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},ei===null){if(e===null)throw Error(H(308));ei=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else ei=ei.next=t;return a}var mN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},pN=Gt.unstable_scheduleCallback,gN=Gt.unstable_NormalPriority,Ht={$$typeof:En,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function rp(){return{controller:new mN,data:new Map,refCount:0}}function Al(e){e.refCount--,e.refCount===0&&pN(gN,function(){e.controller.abort()})}function Tb(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var i=t[e];a.indexOf(i)===-1&&a.push(i)}}}var Xs=null;function fN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var Fs=null,tm=0,kr=0,zo=null;function bN(e,t){if(Fs===null){var a=Fs=[];tm=0,kr=Op(),zo={status:"pending",value:void 0,then:function(i){a.push(i)}}}return tm++,t.then(Cb,Cb),t}function Cb(){if(--tm===0&&(Xs=null,Fs!==null)){zo!==null&&(zo.status="fulfilled");var e=Fs;Fs=null,kr=0,zo=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function vN(e,t){var a=[],i={status:"pending",value:null,reason:null,then:function(r){a.push(r)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var r=0;r<a.length;r++)(0,a[r])(t)},function(r){for(i.status="rejected",i.reason=r,r=0;r<a.length;r++)(0,a[r])(void 0)}),i}var Eb=ge.S;ge.S=function(e,t){if(Pw=Da(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&bN(e,t),Xs!==null)for(var a=Xo;a!==null;)Tb(a,Xs),a=a.next;if(a=e.types,a!==null){for(var i=Xo;i!==null;)Tb(i,a),i=i.next;if(kr!==0){i=Xs,i===null&&(i=Xs=[]);for(var r=0;r<a.length;r++){var s=a[r];i.indexOf(s)===-1&&i.push(s)}}}Eb!==null&&Eb(e,t)};var yr=In(null);function op(){var e=yr.current;return e!==null?e:st.pooledCache}function Lc(e,t){t===null?bt(yr,yr.current):bt(yr,t.pool)}function Ry(){var e=op();return e===null?null:{parent:Ht._currentValue,pool:e}}var es=Error(H(460)),sp=Error(H(474)),Hd=Error(H(542)),ud={then:function(){}};function Ab(e){return e=e.status,e==="fulfilled"||e==="rejected"}function My(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(An,An),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Mb(e),e===void 0&&!("reason"in t)?Error(H(600)):e;default:if(typeof t.status=="string")t.then(An,An);else{if(e=st,e!==null&&100<e.shellSuspendCounter)throw Error(H(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var r=t;r.status="fulfilled",r.value=i}},function(i){if(t.status==="pending"){var r=t;r.status="rejected",r.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Mb(e),e}throw wr=t,es}}function mr(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(wr=a,es):a}}var wr=null;function Rb(){if(wr===null)throw Error(H(459));var e=wr;return wr=null,e}function Mb(e){if(e===es||e===Hd)throw Error(H(483))}var Oo=null,ml=0;function Sc(e){var t=ml;return ml+=1,Oo===null&&(Oo=[]),My(Oo,e,t)}function xi(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function kc(e,t){throw t.$$typeof===K$?Error(H(525)):(e=Object.prototype.toString.call(t),Error(H(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function zy(e){function t($,w){if(e){var y=$.deletions;y===null?($.deletions=[w],$.flags|=16):y.push(w)}}function a($,w){if(!e)return null;for(;w!==null;)t($,w),w=w.sibling;return null}function i($){for(var w=new Map;$!==null;)$.key===null?w.set($.index,$):w.set($.key,$),$=$.sibling;return w}function r($,w){return $=ti($,w),$.index=0,$.sibling=null,$}function s($,w,y){return $.index=y,e?(y=$.alternate,y!==null?(y=y.index,y<w?($.flags|=2,w):y):($.flags|=134217730,w)):($.flags|=1048576,w)}function c($){return e&&$.alternate===null&&($.flags|=134217730),$}function d($,w,y,R){return w===null||w.tag!==6?(w=ph(y,$.mode,R),w.return=$,w):(w=r(w,y),w.return=$,w)}function h($,w,y,R){var U=y.type;return U===vo?($=b($,w,y.props.children,R,y.key),xi($,y),$):w!==null&&(w.elementType===U||typeof U=="object"&&U!==null&&U.$$typeof===Si&&mr(U)===w.type)?(w=r(w,y.props),xi(w,y),w.return=$,w):(w=qc(y.type,y.key,y.props,null,$.mode,R),xi(w,y),w.return=$,w)}function g($,w,y,R){return w===null||w.tag!==4||w.stateNode.containerInfo!==y.containerInfo||w.stateNode.implementation!==y.implementation?(w=gh(y,$.mode,R),w.return=$,w):(w=r(w,y.children||[]),w.return=$,w)}function b($,w,y,R,U){return w===null||w.tag!==7?(w=vr(y,$.mode,R,U),w.return=$,w):(w=r(w,y),w.return=$,w)}function N($,w,y){if(typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint")return w=ph(""+w,$.mode,y),w.return=$,w;if(typeof w=="object"&&w!==null){switch(w.$$typeof){case gc:return y=qc(w.type,w.key,w.props,null,$.mode,y),xi(y,w),y.return=$,y;case js:return w=gh(w,$.mode,y),w.return=$,w;case Si:return w=mr(w),N($,w,y)}if(Gs(w)||_s(w))return w=vr(w,$.mode,y,null),w.return=$,w;if(typeof w.then=="function")return N($,Sc(w),y);if(w.$$typeof===En)return N($,Nc($,w),y);kc($,w)}return null}function f($,w,y,R){var U=w!==null?w.key:null;if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return U!==null?null:d($,w,""+y,R);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case gc:return y.key===U?h($,w,y,R):null;case js:return y.key===U?g($,w,y,R):null;case Si:return y=mr(y),f($,w,y,R)}if(Gs(y)||_s(y))return U!==null?null:b($,w,y,R,null);if(typeof y.then=="function")return f($,w,Sc(y),R);if(y.$$typeof===En)return f($,w,Nc($,y),R);kc($,y)}return null}function v($,w,y,R,U){if(typeof R=="string"&&R!==""||typeof R=="number"||typeof R=="bigint")return $=$.get(y)||null,d(w,$,""+R,U);if(typeof R=="object"&&R!==null){switch(R.$$typeof){case gc:return $=$.get(R.key===null?y:R.key)||null,h(w,$,R,U);case js:return $=$.get(R.key===null?y:R.key)||null,g(w,$,R,U);case Si:return R=mr(R),v($,w,y,R,U)}if(Gs(R)||_s(R))return $=$.get(y)||null,b(w,$,R,U,null);if(typeof R.then=="function")return v($,w,y,Sc(R),U);if(R.$$typeof===En)return v($,w,y,Nc(w,R),U);kc(w,R)}return null}function V($,w,y,R){for(var U=null,Z=null,F=w,te=w=0,ye=null;F!==null&&te<y.length;te++){F.index>te?(ye=F,F=null):ye=F.sibling;var oe=f($,F,y[te],R);if(oe===null){F===null&&(F=ye);break}e&&F&&oe.alternate===null&&t($,F),w=s(oe,w,te),Z===null?U=oe:Z.sibling=oe,Z=oe,F=ye}if(te===y.length)return a($,F),Te&&Wn($,te),U;if(F===null){for(;te<y.length;te++)F=N($,y[te],R),F!==null&&(w=s(F,w,te),Z===null?U=F:Z.sibling=F,Z=F);return Te&&Wn($,te),U}for(F=i(F);te<y.length;te++)ye=v(F,$,te,y[te],R),ye!==null&&(e&&(oe=ye.alternate,oe!==null&&F.delete(oe.key===null?te:oe.key)),w=s(ye,w,te),Z===null?U=ye:Z.sibling=ye,Z=ye);return e&&F.forEach(function(Pe){return t($,Pe)}),Te&&Wn($,te),U}function M($,w,y,R){if(y==null)throw Error(H(151));for(var U=null,Z=null,F=w,te=w=0,ye=null,oe=y.next();F!==null&&!oe.done;te++,oe=y.next()){F.index>te?(ye=F,F=null):ye=F.sibling;var Pe=f($,F,oe.value,R);if(Pe===null){F===null&&(F=ye);break}e&&F&&Pe.alternate===null&&t($,F),w=s(Pe,w,te),Z===null?U=Pe:Z.sibling=Pe,Z=Pe,F=ye}if(oe.done)return a($,F),Te&&Wn($,te),U;if(F===null){for(;!oe.done;te++,oe=y.next())oe=N($,oe.value,R),oe!==null&&(w=s(oe,w,te),Z===null?U=oe:Z.sibling=oe,Z=oe);return Te&&Wn($,te),U}for(F=i(F);!oe.done;te++,oe=y.next())oe=v(F,$,te,oe.value,R),oe!==null&&(e&&(ye=oe.alternate,ye!==null&&F.delete(ye.key===null?te:ye.key)),w=s(oe,w,te),Z===null?U=oe:Z.sibling=oe,Z=oe);return e&&F.forEach(function(qe){return t($,qe)}),Te&&Wn($,te),U}function O($,w,y,R){if(typeof y=="object"&&y!==null&&y.type===vo&&y.key===null&&y.props.ref===void 0&&(y=y.props.children),typeof y=="object"&&y!==null){switch(y.$$typeof){case gc:e:{for(var U=y.key;w!==null;){if(w.key===U){if(U=y.type,U===vo){if(w.tag===7){a($,w.sibling),R=r(w,y.props.children),xi(R,y),R.return=$,$=R;break e}}else if(w.elementType===U||typeof U=="object"&&U!==null&&U.$$typeof===Si&&mr(U)===w.type){a($,w.sibling),R=r(w,y.props),xi(R,y),R.return=$,$=R;break e}a($,w);break}else t($,w);w=w.sibling}y.type===vo?(R=vr(y.props.children,$.mode,R,y.key),xi(R,y),R.return=$,$=R):(R=qc(y.type,y.key,y.props,null,$.mode,R),xi(R,y),R.return=$,$=R)}return c($);case js:e:{for(U=y.key;w!==null;){if(w.key===U)if(w.tag===4&&w.stateNode.containerInfo===y.containerInfo&&w.stateNode.implementation===y.implementation){a($,w.sibling),R=r(w,y.children||[]),R.return=$,$=R;break e}else{a($,w);break}else t($,w);w=w.sibling}R=gh(y,$.mode,R),R.return=$,$=R}return c($);case Si:return y=mr(y),O($,w,y,R)}if(Gs(y))return V($,w,y,R);if(_s(y)){if(U=_s(y),typeof U!="function")throw Error(H(150));return y=U.call(y),M($,w,y,R)}if(typeof y.then=="function")return O($,w,Sc(y),R);if(y.$$typeof===En)return O($,w,Nc($,y),R);kc($,y)}return typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint"?(y=""+y,w!==null&&w.tag===6?(a($,w.sibling),R=r(w,y),R.return=$,$=R):(a($,w),R=ph(y,$.mode,R),R.return=$,$=R),c($)):a($,w)}return function($,w,y,R){try{ml=0;var U=O($,w,y,R);return Oo=null,U}catch(F){if(F===es||F===Hd)throw F;var Z=Ta(29,F,null,$.mode);return Z.lanes=R,Z.return=$,Z}}}var Tr=zy(!0),Oy=zy(!1),ki=!1;function lp(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function am(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Ii(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Di(e,t,a){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(Ye&2)!==0){var r=i.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),i.pending=t,t=sd(e),Sy(e,null,a),t}return Dd(e,i,t,a),sd(e)}function Ks(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Jv(e,a)}}function bh(e,t){var a=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,a===i)){var r=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?r=s=c:s=s.next=c,a=a.next}while(a!==null);s===null?r=s=t:s=s.next=t}else r=s=t;a={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,callbacks:i.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var nm=!1;function Ws(){if(nm){var e=zo;if(e!==null)throw e}}function el(e,t,a,i){nm=!1;var r=e.updateQueue;ki=!1;var s=r.firstBaseUpdate,c=r.lastBaseUpdate,d=r.shared.pending;if(d!==null){r.shared.pending=null;var h=d,g=h.next;h.next=null,c===null?s=g:c.next=g,c=h;var b=e.alternate;b!==null&&(b=b.updateQueue,d=b.lastBaseUpdate,d!==c&&(d===null?b.firstBaseUpdate=g:d.next=g,b.lastBaseUpdate=h))}if(s!==null){var N=r.baseState;c=0,b=g=h=null,d=s;do{var f=d.lane&-536870913,v=f!==d.lane;if(v?(ze&f)===f:(i&f)===f){f!==0&&f===kr&&(nm=!0),b!==null&&(b=b.next={lane:0,tag:d.tag,payload:d.payload,callback:null,next:null});e:{var V=e,M=d;f=t;var O=a;switch(M.tag){case 1:if(V=M.payload,typeof V=="function"){N=V.call(O,N,f);break e}N=V;break e;case 3:V.flags=V.flags&-65537|128;case 0:if(V=M.payload,f=typeof V=="function"?V.call(O,N,f):V,f==null)break e;N=lt({},N,f);break e;case 2:ki=!0}}f=d.callback,f!==null&&(e.flags|=64,v&&(e.flags|=8192),v=r.callbacks,v===null?r.callbacks=[f]:v.push(f))}else v={lane:f,tag:d.tag,payload:d.payload,callback:d.callback,next:null},b===null?(g=b=v,h=N):b=b.next=v,c|=f;if(d=d.next,d===null){if(d=r.shared.pending,d===null)break;v=d,d=v.next,v.next=null,r.lastBaseUpdate=v,r.shared.pending=null}}while(!0);b===null&&(h=N),r.baseState=h,r.firstBaseUpdate=g,r.lastBaseUpdate=b,s===null&&(r.shared.lanes=0),Pi|=c,e.lanes=c,e.memoizedState=N}}function Vy(e,t){if(typeof e!="function")throw Error(H(191,e));e.call(t)}function Iy(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)Vy(a[e],t)}var Yi=In(null),hd=In(0);function zb(e,t){e=li,bt(hd,e),bt(Yi,t),li=e|t.baseLanes}function im(){bt(hd,li),bt(Yi,Yi.current)}function cp(){li=hd.current,ea(Yi),ea(hd)}var na=In(null),ca=null;function _i(e){var t=e.alternate;bt(ta,ta.current&1),bt(na,e),ca===null&&(t===null||Yi.current!==null||t.memoizedState!==null)&&(ca=e)}function rm(e){bt(ta,ta.current),bt(na,e),ca===null&&(ca=e)}function Dy(e){e.tag===22?(bt(ta,ta.current),bt(na,e),ca===null&&(ca=e)):Hi()}function Hi(){bt(ta,ta.current),bt(na,na.current)}function Oa(e){ea(na),ca===e&&(ca=null),ea(ta)}var ta=In(0);function pl(e,t){bt(na,na.current),bt(ta,t)}function dp(e){ea(ta),ea(na),ca===e&&(ca=null)}function md(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Um(a)||_p(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var ri=0,xe=null,rt=null,_t=null,pd=!1,Vo=!1,Cr=!1,gd=0,gl=0,Io=null,yN=0;function Rt(){throw Error(H(321))}function up(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!qa(e[a],t[a]))return!1;return!0}function hp(e,t,a,i,r,s){return ri=s,xe=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,ge.H=e===null||e.memoizedState===null?mw:pw,Cr=!1,s=a(i,r),Cr=!1,Vo&&(s=Hy(t,a,i,r)),_y(e),s}function _y(e){ge.H=fd;var t=rt!==null&&rt.next!==null;if(ri=0,_t=rt=xe=null,pd=!1,gl=0,Io=null,t)throw Error(H(300));e===null||Ut||(e=e.dependencies,e!==null&&dd(e)&&(Ut=!0))}function Hy(e,t,a,i){xe=e;var r=0;do{if(Vo&&(Io=null),gl=0,Vo=!1,25<=r)throw Error(H(301));if(r+=1,_t=rt=null,e.updateQueue!=null){var s=e.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}ge.H=CN,s=t(a,i)}while(Vo);return s}function wN(){var e=ge.H,t=e.useState()[0];return t=typeof t.then=="function"?Rl(t):t,e=e.useState()[0],(rt!==null?rt.memoizedState:null)!==e&&(xe.flags|=1024),t}function mp(){var e=gd!==0;return gd=0,e}function pp(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function gp(e){if(pd){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}pd=!1}ri=0,_t=rt=xe=null,Vo=!1,gl=gd=0,Io=null}function wa(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return _t===null?xe.memoizedState=_t=e:_t=_t.next=e,_t}function It(){if(rt===null){var e=xe.alternate;e=e!==null?e.memoizedState:null}else e=rt.next;var t=_t===null?xe.memoizedState:_t.next;if(t!==null)_t=t,rt=e;else{if(e===null)throw xe.alternate===null?Error(H(467)):Error(H(310));rt=e,e={memoizedState:rt.memoizedState,baseState:rt.baseState,baseQueue:rt.baseQueue,queue:rt.queue,next:null},_t===null?xe.memoizedState=_t=e:_t=_t.next=e}return _t}function Ud(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Rl(e){var t=gl;return gl+=1,Io===null&&(Io=[]),e=My(Io,e,t),t=xe,(_t===null?t.memoizedState:_t.next)===null&&(t=t.alternate,ge.H=t===null||t.memoizedState===null?mw:pw),e}function qd(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Rl(e);if(e.$$typeof===t5)return;if(e.$$typeof===En)return Wt(e)}throw Error(H(438,String(e)))}function fp(e){var t=null,a=xe.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var i=xe.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(r){return r.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=Ud(),xe.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),i=0;i<e;i++)a[i]=e5;return t.index++,a}function oi(e,t){return typeof t=="function"?t(e):t}function jc(e){var t=It();return bp(t,rt,e)}function bp(e,t,a){var i=e.queue;if(i===null)throw Error(H(311));i.lastRenderedReducer=a;var r=e.baseQueue,s=i.pending;if(s!==null){if(r!==null){var c=r.next;r.next=s.next,s.next=c}t.baseQueue=r=s,i.pending=null}if(s=e.baseState,r===null)e.memoizedState=s;else{t=r.next;var d=c=null,h=null,g=t,b=!1;do{var N=g.lane&-536870913;if(N!==g.lane?(ze&N)===N:(ri&N)===N){var f=g.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),N===kr&&(b=!0);else if((ri&f)===f){g=g.next,f===kr&&(b=!0);continue}else N={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(d=h=N,c=s):h=h.next=N,xe.lanes|=f,Pi|=f;N=g.action,Cr&&a(s,N),s=g.hasEagerState?g.eagerState:a(s,N)}else f={lane:N,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(d=h=f,c=s):h=h.next=f,xe.lanes|=N,Pi|=N;g=g.next}while(g!==null&&g!==t);if(h===null?c=s:h.next=d,!qa(s,e.memoizedState)&&(Ut=!0,b&&(a=zo,a!==null)))throw a;e.memoizedState=s,e.baseState=c,e.baseQueue=h,i.lastRenderedState=s}return r===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function vh(e){var t=It(),a=t.queue;if(a===null)throw Error(H(311));a.lastRenderedReducer=e;var i=a.dispatch,r=a.pending,s=t.memoizedState;if(r!==null){a.pending=null;var c=r=r.next;do s=e(s,c.action),c=c.next;while(c!==r);qa(s,t.memoizedState)||(Ut=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),a.lastRenderedState=s}return[s,i]}function Uy(e,t,a){var i=xe,r=It(),s=Te;if(s){if(a===void 0)throw Error(H(407));a=a()}else a=t();var c=!qa((rt||r).memoizedState,a);if(c&&(r.memoizedState=a,Ut=!0),r=r.queue,vp(Ly.bind(null,i,r,e),[e]),e=r.getSnapshot!==t||c||_t!==null&&(_t.memoizedState.tag&1)!==0,Lo(e?9:8,{destroy:void 0},By.bind(null,i,r,a,t),null),e){if(i.flags|=2048,st===null)throw Error(H(349));s||(ri&127)!==0||qy(i,t,a)}return a}function qy(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=xe.updateQueue,t===null?(t=Ud(),xe.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function By(e,t,a,i){t.value=a,t.getSnapshot=i,jy(t)&&Gy(e)}function Ly(e,t,a){return a(function(){jy(t)&&Gy(e)})}function jy(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!qa(e,a)}catch{return!0}}function Gy(e){var t=Or(e,2);t!==null&&Ca(t,e,2)}function om(e){var t=wa();if(typeof e=="function"){var a=e;if(e=a(),Cr){Ci(!0);try{a()}finally{Ci(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:oi,lastRenderedState:e},t}function Yy(e,t,a,i){return e.baseState=a,bp(e,rt,typeof i=="function"?i:oi)}function xN(e,t,a,i,r){if(Ld(e))throw Error(H(485));if(e=t.action,e!==null){var s={payload:r,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){s.listeners.push(c)}};ge.T!==null?a(!0):s.isTransition=!1,i(s),a=t.pending,a===null?(s.next=t.pending=s,Xy(t,s)):(s.next=a.next,t.pending=a.next=s)}}function Xy(e,t){var a=t.action,i=t.payload,r=e.state;if(t.isTransition){var s=ge.T,c={};c.types=s!==null?s.types:null,ge.T=c;try{var d=a(r,i),h=ge.S;h!==null&&h(c,d),Ob(e,t,d)}catch(g){sm(e,t,g)}finally{s!==null&&c.types!==null&&(s.types=c.types),ge.T=s}}else try{s=a(r,i),Ob(e,t,s)}catch(g){sm(e,t,g)}}function Ob(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(i){Vb(e,t,i)},function(i){return sm(e,t,i)}):Vb(e,t,a)}function Vb(e,t,a){t.status="fulfilled",t.value=a,Py(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,Xy(e,a)))}function sm(e,t,a){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=a,Py(t),t=t.next;while(t!==i)}e.action=null}function Py(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Zy(e,t){return t}function Ib(e,t){if(Te){var a=st.formState;if(a!==null){e:{var i=xe;if(Te){if(ft){t:{for(var r=ft,s=tn;r.nodeType!==8;){if(!s){r=null;break t}if(r=an(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){ft=an(r.nextSibling),i=r.data==="F!";break e}}Gi(i)}i=!1}i&&(t=a[0])}}return a=wa(),a.memoizedState=a.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Zy,lastRenderedState:t},a.queue=i,a=dw.bind(null,xe,i),i.dispatch=a,i=om(!1),s=$p.bind(null,xe,!1,i.queue),i=wa(),r={state:t,dispatch:null,action:e,pending:null},i.queue=r,a=xN.bind(null,xe,r,s,a),r.dispatch=a,i.memoizedState=e,[t,a,!1]}function Db(e){var t=It();return Qy(t,rt,e)}function Qy(e,t,a){if(t=bp(e,t,Zy)[0],e=jc(oi)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=Rl(t)}catch(c){throw c===es?Hd:c}else i=t;t=It();var r=t.queue,s=r.dispatch;return a!==t.memoizedState&&(xe.flags|=2048,Lo(9,{destroy:void 0},$N.bind(null,r,a),null)),[i,s,e]}function $N(e,t){e.action=t}function _b(e){var t=It(),a=rt;if(a!==null)return Qy(t,a,e);It(),t=t.memoizedState,a=It();var i=a.queue.dispatch;return a.memoizedState=e,[t,i,!1]}function Lo(e,t,a,i){return e={tag:e,create:a,deps:i,inst:t,next:null},t=xe.updateQueue,t===null&&(t=Ud(),xe.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(i=a.next,a.next=e,e.next=i,t.lastEffect=e),e}function Jy(){return It().memoizedState}function Gc(e,t,a,i){var r=wa();xe.flags|=e,r.memoizedState=Lo(1|t,{destroy:void 0},a,i===void 0?null:i)}function Bd(e,t,a,i){var r=It();i=i===void 0?null:i;var s=r.memoizedState.inst;rt!==null&&i!==null&&up(i,rt.memoizedState.deps)?r.memoizedState=Lo(t,s,a,i):(xe.flags|=e,r.memoizedState=Lo(1|t,s,a,i))}function Hb(e,t){Gc(8390656,8,e,t)}function vp(e,t){Bd(2048,8,e,t)}function NN(e){xe.flags|=4;var t=xe.updateQueue;if(t===null)t=Ud(),xe.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function Fy(e){var t=It().memoizedState;return NN({ref:t,nextImpl:e}),function(){if((Ye&2)!==0)throw Error(H(440));return t.impl.apply(void 0,arguments)}}function Ky(e,t){return Bd(4,2,e,t)}function Wy(e,t){return Bd(4,4,e,t)}function ew(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function tw(e,t,a){a=a!=null?a.concat([e]):null,Bd(4,4,ew.bind(null,t,e),a)}function yp(){}function aw(e,t){var a=It();t=t===void 0?null:t;var i=a.memoizedState;return t!==null&&up(t,i[1])?i[0]:(a.memoizedState=[e,t],e)}function nw(e,t){var a=It();t=t===void 0?null:t;var i=a.memoizedState;if(t!==null&&up(t,i[1]))return i[0];if(i=e(),Cr){Ci(!0);try{e()}finally{Ci(!1)}}return a.memoizedState=[i,t],i}function wp(e,t,a){return a===void 0||(ri&1073741824)!==0&&(ze&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=Qw(),xe.lanes|=e,Pi|=e,a)}function iw(e,t,a,i){return qa(a,t)?a:Yi.current!==null?(e=wp(e,a,i),qa(e,t)||(Ut=!0),e):(ri&106)===0||(ri&1073741824)!==0&&(ze&261930)===0?(Ut=!0,e.memoizedState=a):(e=Qw(),xe.lanes|=e,Pi|=e,t)}function rw(e,t,a,i,r){var s=Xe.p;Xe.p=s!==0&&8>s?s:8;var c=ge.T,d={};d.types=c!==null?c.types:null,ge.T=d,$p(e,!1,t,a);try{var h=r(),g=ge.S;if(g!==null&&g(d,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var b=vN(h,i);tl(e,t,b,Ua(e))}else tl(e,t,i,Ua(e))}catch(N){tl(e,t,{then:function(){},status:"rejected",reason:N},Ua())}finally{Xe.p=s,c!==null&&d.types!==null&&(c.types=d.types),ge.T=c}}function SN(){}function lm(e,t,a,i){if(e.tag!==5)throw Error(H(476));var r=ow(e).queue;rw(e,r,t,br,a===null?SN:function(){return sw(e),a(i)})}function ow(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:br,baseState:br,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:oi,lastRenderedState:br},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:oi,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function sw(e){var t=ow(e);t.next===null&&(t=e.alternate.memoizedState),tl(e,t.next.queue,{},Ua())}function xp(){return Wt(Qo)}function lw(){return It().memoizedState}function cw(){return It().memoizedState}function kN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=Ua();e=Ii(a);var i=Di(t,e,a);i!==null&&(Ca(i,t,a),Ks(i,t,a)),t={cache:rp()},e.payload=t;return}t=t.return}}function TN(e,t,a){var i=Ua();a={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Ld(e)?uw(t,a):(a=ap(e,t,a,i),a!==null&&(Ca(a,e,i),hw(a,t,i)))}function dw(e,t,a){var i=Ua();tl(e,t,a,i)}function tl(e,t,a,i){var r={lane:i,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Ld(e))uw(t,r);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var c=t.lastRenderedState,d=s(c,a);if(r.hasEagerState=!0,r.eagerState=d,qa(d,c))return Dd(e,t,r,0),st===null&&Id(),!1}catch{}if(a=ap(e,t,r,i),a!==null)return Ca(a,e,i),hw(a,t,i),!0}return!1}function $p(e,t,a,i){if(i={lane:2,revertLane:Op(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},Ld(e)){if(t)throw Error(H(479))}else t=ap(e,a,i,2),t!==null&&Ca(t,e,2)}function Ld(e){var t=e.alternate;return e===xe||t!==null&&t===xe}function uw(e,t){Vo=pd=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function hw(e,t,a){if((a&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,a|=i,t.lanes=a,Jv(e,a)}}var fd={readContext:Wt,use:qd,useCallback:Rt,useContext:Rt,useEffect:Rt,useImperativeHandle:Rt,useLayoutEffect:Rt,useInsertionEffect:Rt,useMemo:Rt,useReducer:Rt,useRef:Rt,useState:Rt,useDebugValue:Rt,useDeferredValue:Rt,useTransition:Rt,useSyncExternalStore:Rt,useId:Rt,useHostTransitionStatus:Rt,useFormState:Rt,useActionState:Rt,useOptimistic:Rt,useMemoCache:Rt,useCacheRefresh:Rt,useEffectEvent:Rt},mw={readContext:Wt,use:qd,useCallback:function(e,t){return wa().memoizedState=[e,t===void 0?null:t],e},useContext:Wt,useEffect:Hb,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,Gc(4194308,4,ew.bind(null,t,e),a)},useLayoutEffect:function(e,t){return Gc(4194308,4,e,t)},useInsertionEffect:function(e,t){Gc(4,2,e,t)},useMemo:function(e,t){var a=wa();t=t===void 0?null:t;var i=e();if(Cr){Ci(!0);try{e()}finally{Ci(!1)}}return a.memoizedState=[i,t],i},useReducer:function(e,t,a){var i=wa();if(a!==void 0){var r=a(t);if(Cr){Ci(!0);try{a(t)}finally{Ci(!1)}}}else r=t;return i.memoizedState=i.baseState=r,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:r},i.queue=e,e=e.dispatch=TN.bind(null,xe,e),[i.memoizedState,e]},useRef:function(e){var t=wa();return e={current:e},t.memoizedState=e},useState:function(e){e=om(e);var t=e.queue,a=dw.bind(null,xe,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:yp,useDeferredValue:function(e,t){var a=wa();return wp(a,e,t)},useTransition:function(){var e=om(!1);return e=rw.bind(null,xe,e.queue,!0,!1),wa().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var i=xe,r=wa();if(Te){if(a===void 0)throw Error(H(407));a=a()}else{if(a=t(),st===null)throw Error(H(349));(ze&127)!==0||qy(i,t,a)}r.memoizedState=a;var s={value:a,getSnapshot:t};return r.queue=s,Hb(Ly.bind(null,i,s,e),[e]),i.flags|=2048,Lo(9,{destroy:void 0},By.bind(null,i,s,a,t),null),a},useId:function(){var e=wa(),t=st.identifierPrefix;if(Te){var a=Mn,i=Rn;a=(i&~(1<<32-Ha(i)-1)).toString(32)+a,t="_"+t+"R_"+a,a=gd++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=yN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:xp,useFormState:Ib,useActionState:Ib,useOptimistic:function(e){var t=wa();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=$p.bind(null,xe,!0,a),a.dispatch=t,[e,t]},useMemoCache:fp,useCacheRefresh:function(){return wa().memoizedState=kN.bind(null,xe)},useEffectEvent:function(e){var t=wa(),a={impl:e};return t.memoizedState=a,function(){if((Ye&2)!==0)throw Error(H(440));return a.impl.apply(void 0,arguments)}}},pw={readContext:Wt,use:qd,useCallback:aw,useContext:Wt,useEffect:vp,useImperativeHandle:tw,useInsertionEffect:Ky,useLayoutEffect:Wy,useMemo:nw,useReducer:jc,useRef:Jy,useState:function(){return jc(oi)},useDebugValue:yp,useDeferredValue:function(e,t){var a=It();return iw(a,rt.memoizedState,e,t)},useTransition:function(){var e=jc(oi)[0],t=It().memoizedState;return[typeof e=="boolean"?e:Rl(e),t]},useSyncExternalStore:Uy,useId:lw,useHostTransitionStatus:xp,useFormState:Db,useActionState:Db,useOptimistic:function(e,t){var a=It();return Yy(a,rt,e,t)},useMemoCache:fp,useCacheRefresh:cw,useEffectEvent:Fy},CN={readContext:Wt,use:qd,useCallback:aw,useContext:Wt,useEffect:vp,useImperativeHandle:tw,useInsertionEffect:Ky,useLayoutEffect:Wy,useMemo:nw,useReducer:vh,useRef:Jy,useState:function(){return vh(oi)},useDebugValue:yp,useDeferredValue:function(e,t){var a=It();return rt===null?wp(a,e,t):iw(a,rt.memoizedState,e,t)},useTransition:function(){var e=vh(oi)[0],t=It().memoizedState;return[typeof e=="boolean"?e:Rl(e),t]},useSyncExternalStore:Uy,useId:lw,useHostTransitionStatus:xp,useFormState:_b,useActionState:_b,useOptimistic:function(e,t){var a=It();return rt!==null?Yy(a,rt,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:fp,useCacheRefresh:cw,useEffectEvent:Fy};function yh(e,t,a,i){t=e.memoizedState,a=a(i,t),a=a==null?t:lt({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var cm={enqueueSetState:function(e,t,a){e=e._reactInternals;var i=Ua(),r=Ii(i);r.payload=t,a!=null&&(r.callback=a),t=Di(e,r,i),t!==null&&(Ca(t,e,i),Ks(t,e,i))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var i=Ua(),r=Ii(i);r.tag=1,r.payload=t,a!=null&&(r.callback=a),t=Di(e,r,i),t!==null&&(Ca(t,e,i),Ks(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=Ua(),i=Ii(a);i.tag=2,t!=null&&(i.callback=t),t=Di(e,i,a),t!==null&&(Ca(t,e,a),Ks(t,e,a))}};function Ub(e,t,a,i,r,s,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,s,c):t.prototype&&t.prototype.isPureReactComponent?!dl(a,i)||!dl(r,s):!0}function qb(e,t,a,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,i),t.state!==e&&cm.enqueueReplaceState(t,t.state,null)}function Er(e,t){var a=t;if("ref"in t){a={};for(var i in t)i!=="ref"&&(a[i]=t[i])}if(e=e.defaultProps){a===t&&(a=lt({},a));for(var r in e)a[r]===void 0&&(a[r]=e[r])}return a}function gw(e){od(e)}function fw(e){console.error(e)}function bw(e){od(e)}function bd(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function Bb(e,t,a){try{var i=e.onCaughtError;i(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function dm(e,t,a){return a=Ii(a),a.tag=3,a.payload={element:null},a.callback=function(){bd(e,t)},a}function vw(e){return e=Ii(e),e.tag=3,e}function yw(e,t,a,i){var r=a.type.getDerivedStateFromError;if(typeof r=="function"){var s=i.value;e.payload=function(){return r(s)},e.callback=function(){Bb(t,a,i)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){Bb(t,a,i),typeof r!="function"&&(Ui===null?Ui=new Set([this]):Ui.add(this));var d=i.stack;this.componentDidCatch(i.value,{componentStack:d!==null?d:""})})}function EN(e,t,a,i,r){if(a.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=a.alternate,t!==null&&Nr(t,a,r,!0),a=na.current,a!==null){switch(a.tag){case 31:case 13:case 19:return ca===null?kd():a.alternate===null&&Mt===0&&(Mt=3),a.flags&=-257,a.flags|=65536,a.lanes=r,i===ud?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([i]):t.add(i),Th(e,i,r)),!1;case 22:return a.flags|=65536,i===ud?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([i]):a.add(i)),Th(e,i,r)),!1}throw Error(H(435,a.tag))}return Th(e,i,r),kd(),!1}if(Te)return t=na.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=r,i!==Kh&&(e=Error(H(422),{cause:i}),hl(en(e,a)))):(i!==Kh&&(t=Error(H(423),{cause:i}),hl(en(t,a))),e=e.current.alternate,e.flags|=65536,r&=-r,e.lanes|=r,i=en(i,a),r=dm(e.stateNode,i,r),bh(e,r),Mt!==4&&(Mt=2)),!1;var s=Error(H(520),{cause:i});if(s=en(s,a),rl===null?rl=[s]:rl.push(s),Mt!==4&&(Mt=2),t===null)return!0;i=en(i,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=r&-r,a.lanes|=e,e=dm(a.stateNode,i,e),bh(a,e),!1;case 1:if(t=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(Ui===null||!Ui.has(s))))return a.flags|=65536,r&=-r,a.lanes|=r,r=vw(r),yw(r,e,a,i),bh(a,r),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var Np=Error(H(461)),Ut=!1;function Lt(e,t,a,i){t.child=e===null?Oy(t,null,a,i):Tr(t,e.child,a,i)}function Lb(e,t,a,i,r){a=a.render;var s=t.ref;if("ref"in i){var c={};for(var d in i)d!=="ref"&&(c[d]=i[d])}else c=i;return Sr(t),i=hp(e,t,a,c,s,r),d=mp(),e!==null&&!Ut?(pp(e,t,r),si(e,t,r)):(Te&&d&&_d(t),t.flags|=1,Lt(e,t,i,r),t.child)}function jb(e,t,a,i,r){if(e===null){var s=a.type;return typeof s=="function"&&!np(s)&&s.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=s,ww(e,t,s,i,r)):(e=qc(a.type,null,i,t,t.mode,r),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!kp(e,r)){var c=s.memoizedProps;if(a=a.compare,a=a!==null?a:dl,a(c,i)&&e.ref===t.ref)return si(e,t,r)}return t.flags|=1,e=ti(s,i),e.ref=t.ref,e.return=t,t.child=e}function ww(e,t,a,i,r){if(e!==null){var s=e.memoizedProps;if(dl(s,i)&&e.ref===t.ref)if(Ut=!1,t.pendingProps=i=s,kp(e,r))(e.flags&131072)!==0&&(Ut=!0);else return t.lanes=e.lanes,si(e,t,r)}return um(e,t,a,i,r)}function xw(e,t,a,i){var r=i.children,s=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(s=s!==null?s.baseLanes|a:a,e!==null){for(i=t.child=e.child,r=0;i!==null;)r=r|i.lanes|i.childLanes,i=i.sibling;i=r&~s}else i=0,t.child=null;return Gb(e,t,s,a,i)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Lc(t,s!==null?s.cachePool:null),s!==null?zb(t,s):im(),Dy(t);else return i=t.lanes=536870912,Gb(e,t,s!==null?s.baseLanes|a:a,a,i)}else s!==null?(Lc(t,s.cachePool),zb(t,s),Hi(),t.memoizedState=null):(e!==null&&Lc(t,null),im(),Hi());return Lt(e,t,r,a),t.child}function al(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Gb(e,t,a,i,r){var s=op();return s=s===null?null:{parent:Ht._currentValue,pool:s},t.memoizedState={baseLanes:a,cachePool:s},e!==null&&Lc(t,null),im(),Dy(t),e!==null&&Nr(e,t,i,!0),t.childLanes=r,null}function Yc(e,t){return t=jd({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Yb(e,t,a){return Tr(t,e.child,null,a),e=Yc(t,t.pendingProps),e.flags|=2,Oa(t),t.memoizedState=null,e}function AN(e,t,a){var i=t.pendingProps,r=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(Te){if(i.mode==="hidden")return e=Yc(t,i),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},al(null,e);if(rm(t),(e=ft)?(e=x0(e,tn),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ji!==null?{id:Rn,overflow:Mn}:null,retryLane:536870912,hydrationErrors:null},a=Ty(e),a.return=t,t.child=a,Qt=t,ft=null)):e=null,e===null)throw Gi(t);return t.lanes=536870912,null}return Yc(t,i)}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(rm(t),r)if(t.flags&256)t.flags&=-257,t=Yb(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(H(558));else if(Ut||Nr(e,t,a,!1),r=(a&e.childLanes)!==0,Ut||r){if(Yi.current===null){if(i=st,i!==null&&(c=Fv(i,a),c!==0&&c!==s.retryLane))throw s.retryLane=c,Or(e,c),Ca(i,e,c),Np;kd()}t=Yb(e,t,a)}else e=s.treeContext,ft=an(c.nextSibling),Qt=t,Te=!0,Vi=null,tn=!1,e!==null&&Ey(t,e),t=Yc(t,i),t.flags|=134221824;return t}return e=ti(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function po(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(H(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function um(e,t,a,i,r){return Sr(t),a=hp(e,t,a,i,void 0,r),i=mp(),e!==null&&!Ut?(pp(e,t,r),si(e,t,r)):(Te&&i&&_d(t),t.flags|=1,Lt(e,t,a,r),t.child)}function Xb(e,t,a,i,r,s){return Sr(t),t.updateQueue=null,a=Hy(t,i,a,r),_y(e),i=mp(),e!==null&&!Ut?(pp(e,t,s),si(e,t,s)):(Te&&i&&_d(t),t.flags|=1,Lt(e,t,a,s),t.child)}function Pb(e,t,a,i,r){if(Sr(t),t.stateNode===null){var s=ko,c=a.contextType;typeof c=="object"&&c!==null&&(s=Wt(c)),s=new a(i,s),t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=cm,t.stateNode=s,s._reactInternals=t,s=t.stateNode,s.props=i,s.state=t.memoizedState,s.refs={},lp(t),c=a.contextType,s.context=typeof c=="object"&&c!==null?Wt(c):ko,s.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(yh(t,a,c,i),s.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(c=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),c!==s.state&&cm.enqueueReplaceState(s,s.state,null),el(t,i,s,r),Ws(),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){s=t.stateNode;var d=t.memoizedProps,h=Er(a,d);s.props=h;var g=s.context,b=a.contextType;c=ko,typeof b=="object"&&b!==null&&(c=Wt(b));var N=a.getDerivedStateFromProps;b=typeof N=="function"||typeof s.getSnapshotBeforeUpdate=="function",d=t.pendingProps!==d,b||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(d||g!==c)&&qb(t,s,i,c),ki=!1;var f=t.memoizedState;s.state=f,el(t,i,s,r),Ws(),g=t.memoizedState,d||f!==g||ki?(typeof N=="function"&&(yh(t,a,N,i),g=t.memoizedState),(h=ki||Ub(t,a,h,i,f,g,c))?(b||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=g),s.props=i,s.state=g,s.context=c,i=h):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{s=t.stateNode,am(e,t),c=t.memoizedProps,b=Er(a,c),s.props=b,N=t.pendingProps,f=s.context,g=a.contextType,h=ko,typeof g=="object"&&g!==null&&(h=Wt(g)),d=a.getDerivedStateFromProps,(g=typeof d=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==N||f!==h)&&qb(t,s,i,h),ki=!1,f=t.memoizedState,s.state=f,el(t,i,s,r),Ws();var v=t.memoizedState;c!==N||f!==v||ki||e!==null&&e.dependencies!==null&&dd(e.dependencies)?(typeof d=="function"&&(yh(t,a,d,i),v=t.memoizedState),(b=ki||Ub(t,a,b,i,f,v,h)||e!==null&&e.dependencies!==null&&dd(e.dependencies))?(g||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(i,v,h),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(i,v,h)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=v),s.props=i,s.state=v,s.context=h,i=b):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),i=!1)}return s=i,po(e,t),i=(t.flags&128)!==0,s||i?(s=t.stateNode,a=i&&typeof a.getDerivedStateFromError!="function"?null:s.render(),t.flags|=1,e!==null&&i?(t.child=Tr(t,e.child,null,r),t.child=Tr(t,null,a,r)):Lt(e,t,a,r),t.memoizedState=s.state,e=t.child):e=si(e,t,r),e}function Zb(e,t,a,i){return $r(),t.flags|=256,Lt(e,t,a,i),t.child}var hm={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function mm(e){return{baseLanes:e,cachePool:Ry()}}function pm(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=Ia),e}function $w(e,t,a){var i=t.pendingProps,r=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(ta.current&2)!==0),c&&(r=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(Te){if(r?_i(t):Hi(),(e=ft)?(e=x0(e,tn),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ji!==null?{id:Rn,overflow:Mn}:null,retryLane:536870912,hydrationErrors:null},a=Ty(e),a.return=t,t.child=a,Qt=t,ft=null)):e=null,e===null)throw Gi(t);return _p(e)?t.lanes=32:t.lanes=536870912,null}return s=i.children,i=i.fallback,r?(Hi(),r=t.mode,s=jd({mode:"hidden",children:s},r),i=vr(i,r,a,null),s.return=t,i.return=t,s.sibling=i,t.child=s,i=t.child,i.memoizedState=mm(a),i.childLanes=pm(e,c,a),t.memoizedState=hm,al(null,i)):(_i(t),Sp(t,s))}var d=e.memoizedState;if(d!==null){var h=d.dehydrated;if(h!==null)return RN(e,t,s,c,i,h,d,a)}return r?(Hi(),r=i.fallback,s=t.mode,d=e.child,h=d.sibling,i=ti(d,{mode:"hidden",children:i.children}),i.subtreeFlags=d.subtreeFlags&1206910976,h!==null?r=ti(h,r):(r=vr(r,s,a,null),r.flags|=2),r.return=t,i.return=t,i.sibling=r,t.child=i,al(null,i),i=t.child,r=e.child.memoizedState,r===null?r=mm(a):(s=r.cachePool,s!==null?(d=Ht._currentValue,s=s.parent!==d?{parent:d,pool:d}:s):s=Ry(),r={baseLanes:r.baseLanes|a,cachePool:s}),i.memoizedState=r,i.childLanes=pm(e,c,a),t.memoizedState=hm,al(e.child,i)):(_i(t),a=e.child,e=a.sibling,a=ti(a,{mode:"visible",children:i.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function Sp(e,t){return t=jd({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function jd(e,t){return e=Ta(22,e,null,t),e.lanes=0,e}function Tc(e,t,a){return Tr(t,e.child,null,a),e=Sp(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function RN(e,t,a,i,r,s,c,d){if(a)return t.flags&256?(_i(t),t.flags&=-257,Tc(e,t,d)):t.memoizedState!==null?(Hi(),t.child=e.child,t.flags|=128,null):(Hi(),s=r.fallback,c=t.mode,r=jd({mode:"visible",children:r.children},c),s=vr(s,c,d,null),s.flags|=2,r.return=t,s.return=t,r.sibling=s,t.child=r,Tr(t,e.child,null,d),r=t.child,r.memoizedState=mm(d),r.childLanes=pm(e,i,d),t.memoizedState=hm,al(null,r));if(_i(t),_p(s)){if(i=s.nextSibling&&s.nextSibling.dataset,i)var h=i.dgst;return i=h,i!==""&&(r=Error(H(419)),r.stack="",r.digest=i,hl({value:r,source:null,stack:null})),Tc(e,t,d)}if(Ut||Nr(e,t,d,!1),i=(d&e.childLanes)!==0,Ut||i){if(Yi.current!==null)return Tc(e,t,d);if(i=st,i!==null&&(r=Fv(i,d),r!==0&&r!==c.retryLane))throw c.retryLane=r,Or(e,r),Ca(i,e,r),Np;return Um(s)||kd(),Tc(e,t,d)}return Um(s)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,ft=an(s.nextSibling),Qt=t,Te=!0,Vi=null,tn=!1,e!==null&&Ey(t,e),t=Sp(t,r.children),t.flags|=134221824,t)}function Qb(e,t,a){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),Bc(e.return,t,a)}function Jb(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&md(a)===null&&(t=e),e=e.sibling}return t}function Cc(e,t,a,i,r,s){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:a,tailMode:r,treeForkCount:s}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=i,c.tail=a,c.tailMode=r,c.treeForkCount=s)}function wh(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function gm(e,t,a){var i=t.pendingProps,r=i.revealOrder,s=i.tail;i=i.children;var c=ta.current;if(t.flags&128)return pl(t,c),null;var d=(c&2)!==0;if(d?(c=c&1|2,t.flags|=128):c&=1,pl(t,c),r==="backwards"&&e!==null?(wh(e),Lt(e,t,i,a),wh(e)):Lt(e,t,i,a),i=Te?ul:0,!d&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Qb(e,a,t);else if(e.tag===19)Qb(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(r){case"backwards":a=Jb(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null,wh(t)),Cc(t,!0,r,null,s,i);break;case"unstable_legacy-backwards":for(a=null,r=t.child,t.child=null;r!==null;){if(e=r.alternate,e!==null&&md(e)===null){t.child=r;break}e=r.sibling,r.sibling=a,a=r,r=e}Cc(t,!0,a,null,s,i);break;case"together":Cc(t,!1,null,null,void 0,i);break;case"independent":t.memoizedState=null;break;default:a=Jb(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null),Cc(t,!1,r,a,s,i)}return t.child}function Fb(e,t,a){var i=t.pendingProps;return Ai(t,t.type,i.value),Lt(e,t,i.children,a),t.child}function si(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),Pi|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Nr(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(H(153));if(t.child!==null){for(e=t.child,a=ti(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=ti(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function kp(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&dd(e)))}function MN(e,t,a){switch(t.tag){case 3:ad(t,t.stateNode.containerInfo),Ai(t,Ht,e.memoizedState.cache),$r();break;case 27:case 5:Lh(t);break;case 4:ad(t,t.stateNode.containerInfo);break;case 10:Ai(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,rm(t),null;break;case 13:var i=t.memoizedState;if(i!==null){if(i.dehydrated!==null)return _i(t),t.flags|=128,null;i=Nr(e,t,a,!1);var r=t.child.childLanes;return i||(a&r)!==0?$w(e,t,a):(_i(t),e=si(e,t,a),e!==null?e.sibling:null)}_i(t);break;case 19:if(t.flags&128)return gm(e,t,a);if(r=(e.flags&128)!==0,i=(a&t.childLanes)!==0,i||(Nr(e,t,a,!1),i=(a&t.childLanes)!==0),r){if(i)return gm(e,t,a);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),pl(t,ta.current),i)break;return null;case 22:return t.lanes=0,xw(e,t,a,t.pendingProps);case 24:Ai(t,Ht,e.memoizedState.cache)}return si(e,t,a)}function Nw(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)Ut=!0;else{if(!kp(e,a)&&(t.flags&128)===0)return Ut=!1,MN(e,t,a);Ut=(e.flags&131072)!==0}else Ut=!1,Te&&(t.flags&1048576)!==0&&Cy(t,ul,t.index);switch(t.lanes=0,t.tag){case 16:e:{var i=t.pendingProps;if(e=mr(t.elementType),t.type=e,typeof e=="function")np(e)?(i=Er(e,i),t.tag=1,t=Pb(null,t,e,i,a)):(t.tag=0,t=um(null,t,e,i,a));else{if(e!=null){var r=e.$$typeof;if(r===Gm){t.tag=11,t=Lb(null,t,e,i,a);break e}else if(r===Ym){t.tag=14,t=jb(null,t,e,i,a);break e}else if(r===En){t.tag=10,t.type=e,t=Fb(null,t,a);break e}}throw t=qh(e)||e,Error(H(306,t,""))}}return t;case 0:return um(e,t,t.type,t.pendingProps,a);case 1:return i=t.type,r=Er(i,t.pendingProps),Pb(e,t,i,r,a);case 3:e:{if(ad(t,t.stateNode.containerInfo),e===null)throw Error(H(387));i=t.pendingProps;var s=t.memoizedState;r=s.element,am(e,t),el(t,i,null,a);var c=t.memoizedState;if(i=c.cache,Ai(t,Ht,i),i!==s.cache&&em(t,[Ht],a,!0),Ws(),i=c.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){t=Zb(e,t,i,a);break e}else if(i!==r){r=en(Error(H(424)),t),hl(r),t=Zb(e,t,i,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,ft=an(e.firstChild),Qt=t,Te=!0,Vi=null,tn=!0,a=Oy(t,null,i,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if($r(),i===r){t=si(e,t,a);break e}Lt(e,t,i,a)}t=t.child}return t;case 26:return po(e,t),e===null?(a=Sv(t.type,null,t.pendingProps,null))?t.memoizedState=a:Te||(t.stateNode=h0(t.type,t.pendingProps,Oi.current,t)):t.memoizedState=Sv(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Lh(t),e===null&&Te&&(i=t.stateNode=$0(t.type,t.pendingProps,Oi.current),Qt=t,tn=!0,r=ft,Qi(t.type)?(qm=r,ft=an(i.firstChild)):ft=r),Lt(e,t,t.pendingProps.children,a),po(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&Te&&((r=i=ft)&&(i=NS(i,t.type,t.pendingProps,tn),i!==null?(t.stateNode=i,Qt=t,ft=an(i.firstChild),tn=!1,r=!0):r=!1),r||Gi(t)),Lh(t),r=t.type,s=t.pendingProps,c=e!==null?e.memoizedProps:null,i=s.children,Dm(r,s)?i=null:c!==null&&Dm(r,c)&&(t.flags|=32),t.memoizedState!==null&&(r=hp(e,t,wN,null,null,a),Qo._currentValue=r),po(e,t),Lt(e,t,i,a),t.child;case 6:return e===null&&Te&&((e=a=ft)&&(a=SS(a,t.pendingProps,tn),a!==null?(t.stateNode=a,Qt=t,ft=null,e=!0):e=!1),e||Gi(t)),null;case 13:return $w(e,t,a);case 4:return ad(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=Tr(t,null,i,a):Lt(e,t,i,a),t.child;case 11:return Lb(e,t,t.type,t.pendingProps,a);case 7:return i=t.pendingProps,po(e,t),Lt(e,t,i,a),t.child;case 8:return Lt(e,t,t.pendingProps.children,a),t.child;case 12:return Lt(e,t,t.pendingProps.children,a),t.child;case 10:return Fb(e,t,a);case 9:return r=t.type._context,i=t.pendingProps.children,Sr(t),r=Wt(r),i=i(r),t.flags|=1,Lt(e,t,i,a),t.child;case 14:return jb(e,t,t.type,t.pendingProps,a);case 15:return ww(e,t,t.type,t.pendingProps,a);case 19:return gm(e,t,a);case 31:return AN(e,t,a);case 22:return xw(e,t,a,t.pendingProps);case 24:return Sr(t),i=Wt(Ht),e===null?(r=op(),r===null&&(r=st,s=rp(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=a),r=s),t.memoizedState={parent:i,cache:r},lp(t),Ai(t,Ht,r)):((e.lanes&a)!==0&&(am(e,t),el(t,null,null,a),Ws()),r=e.memoizedState,s=t.memoizedState,r.parent!==i?(r={parent:i,cache:i},t.memoizedState=r,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=r),Ai(t,Ht,i)):(i=s.cache,Ai(t,Ht,i),i!==r.cache&&em(t,[Ht],a,!0))),Lt(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),i=t.pendingProps,i.name!=null&&i.name!=="auto"?t.flags|=e===null?18882560:18874368:Te&&_d(t),e!==null&&e.memoizedProps.name!==i.name?t.flags|=4194816:po(e,t),Lt(e,t,i.children,a),t.child;case 29:throw t.pendingProps}throw Error(H(156,t.tag))}function Kn(e){e.flags|=4}function xh(e,t,a,i,r){var s;if((s=(e.mode&32)!==0)&&(s=a===null?Cv(t,i):Cv(t,i)&&(i.src!==a.src||i.srcSet!==a.srcSet)),s){if(e.flags|=16777216,(r&335544128)===r)if(e.stateNode.complete)e.flags|=8192;else if(Kw())e.flags|=8192;else throw wr=ud,sp}else e.flags&=-16777217}function Kb(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!T0(t))if(Kw())e.flags|=8192;else throw wr=ud,sp}function Ec(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Zv():536870912,e.lanes|=t,jo|=t)}function Us(e,t){if(!Te)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,i=null;a!==null;)a.alternate!==null&&(i=a),a=a.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function gt(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,i=0;if(t)for(var r=e.child;r!==null;)a|=r.lanes|r.childLanes,i|=r.subtreeFlags&1206910976,i|=r.flags&1206910976,r.return=e,r=r.sibling;else for(r=e.child;r!==null;)a|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=e,r=r.sibling;return e.subtreeFlags|=i,e.childLanes=a,t}function zN(e,t,a){var i=t.pendingProps;switch(ip(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return gt(t),null;case 1:return gt(t),null;case 3:return a=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),ai(Ht),Uo(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(ho(t)?Kn(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,fh())),gt(t),null;case 26:var r=t.type,s=t.memoizedState;return e===null?(Kn(t),s!==null?(gt(t),Kb(t,s)):(gt(t),xh(t,r,null,i,a))):s?s!==e.memoizedState?(Kn(t),gt(t),Kb(t,s)):(gt(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&Kn(t),gt(t),xh(t,r,e,i,a)),null;case 27:if(nd(t),a=Oi.current,r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Kn(t);else{if(!i){if(t.stateNode===null)throw Error(H(166));return gt(t),t.subtreeFlags&=-33554433,null}e=zn.current,ho(t)?kb(t,e):(e=$0(r,i,a),t.stateNode=e,Kn(t))}return gt(t),t.subtreeFlags&=-33554433,null;case 5:if(nd(t),r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Kn(t);else{if(!i){if(t.stateNode===null)throw Error(H(166));return gt(t),t.subtreeFlags&=-33554433,null}if(s=zn.current,ho(t))kb(t,s);else{var c=vl(Oi.current);switch(s){case 1:s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=c.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof i.is=="string"?c.createElement("select",{is:i.is}):c.createElement("select"),i.multiple?s.multiple=!0:i.size&&(s.size=i.size);break;default:s=typeof i.is=="string"?c.createElement(r,{is:i.is}):c.createElement(r)}}s[Kt]=t,s[Aa]=i;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)s.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=s;e:switch(aa(s,r,i),r){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}i&&Kn(t)}}return gt(t),t.subtreeFlags&=-33554433,xh(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&Kn(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(H(166));if(e=Oi.current,ho(t)){if(e=t.stateNode,a=t.memoizedProps,i=null,r=Qt,r!==null)switch(r.tag){case 27:case 5:i=r.memoizedProps}e[Kt]=t,e=!!(e.nodeValue===a||i!==null&&i.suppressHydrationWarning===!0||d0(e.nodeValue,a)),e||Gi(t,!0)}else e=vl(e).createTextNode(i),e[Kt]=t,t.stateNode=e}return gt(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(i=ho(t),a!==null){if(e===null){if(!i)throw Error(H(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(H(557));e[Kt]=t}else $r(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;gt(t),e=!1}else a=fh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(Oa(t),t):(Oa(t),null);if((t.flags&128)!==0)throw Error(H(558))}return gt(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(r=ho(t),i!==null&&i.dehydrated!==null){if(e===null){if(!r)throw Error(H(318));if(r=t.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(H(317));r[Kt]=t}else $r(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;gt(t),r=!1}else r=fh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=r),r=!0;if(!r)return t.flags&256?(Oa(t),t):(Oa(t),null)}return Oa(t),(t.flags&128)!==0?(t.lanes=a,t):(a=i!==null,e=e!==null&&e.memoizedState!==null,a&&(i=t.child,r=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(r=i.alternate.memoizedState.cachePool.pool),s=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(s=i.memoizedState.cachePool.pool),s!==r&&(i.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),Ec(t,t.updateQueue),gt(t),null);case 4:return Uo(),e===null&&Vp(t.stateNode.containerInfo),t.flags|=67108864,gt(t),null;case 10:return ai(t.type),gt(t),null;case 19:if(dp(t),i=t.memoizedState,i===null)return gt(t),null;if(r=(t.flags&128)!==0,s=i.rendering,s===null)if(r)Us(i,!1);else{if(Mt!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=md(e),s!==null){for(t.flags|=128,Us(i,!1),e=s.updateQueue,t.updateQueue=e,Ec(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)ky(a,e),a=a.sibling;return pl(t,ta.current&1|2),Te&&Wn(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&Da()>Nd&&(t.flags|=128,r=!0,Us(i,!1),t.lanes=4194304)}else{if(!r)if(e=md(s),e!==null){if(t.flags|=128,r=!0,e=e.updateQueue,t.updateQueue=e,Ec(t,e),Us(i,!0),i.tail===null&&i.tailMode!=="collapsed"&&i.tailMode!=="visible"&&!s.alternate&&!Te)return gt(t),null}else 2*Da()-i.renderingStartTime>Nd&&a!==536870912&&(t.flags|=128,r=!0,Us(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(e=i.last,e!==null?e.sibling=s:t.child=s,i.last=s)}if(i.tail!==null){e=i.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return i.rendering=e,i.tail=e.sibling,i.renderingStartTime=Da(),e.sibling=null,s=ta.current,s=r?s&1|2:s&1,i.tailMode==="visible"||i.tailMode==="collapsed"||!a||Te?pl(t,s):(a=s,bt(na,t),bt(ta,a),ca===null&&(ca=t)),Te&&Wn(t,i.treeForkCount),e}return gt(t),null;case 22:case 23:return Oa(t),cp(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(a&536870912)!==0&&(t.flags&128)===0&&(gt(t),t.subtreeFlags&6&&(t.flags|=8192)):gt(t),a=t.updateQueue,a!==null&&Ec(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==a&&(t.flags|=2048),e!==null&&ea(yr),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),ai(Ht),gt(t),null;case 25:return null;case 30:return t.flags|=33554432,gt(t),null}throw Error(H(156,t.tag))}function ON(e,t){switch(ip(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return ai(Ht),Uo(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return nd(t),null;case 31:if(t.memoizedState!==null){if(Oa(t),t.alternate===null)throw Error(H(340));$r()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Oa(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(H(340));$r()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return dp(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Uo(),null;case 10:return ai(t.type),null;case 22:case 23:return Oa(t),cp(),e!==null&&ea(yr),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return ai(Ht),null;case 25:return null;default:return null}}function Sw(e,t){switch(ip(t),t.tag){case 3:ai(Ht),Uo();break;case 26:case 27:case 5:nd(t);break;case 4:Uo();break;case 31:t.memoizedState!==null&&Oa(t);break;case 13:Oa(t);break;case 19:dp(t);break;case 10:ai(t.type);break;case 22:case 23:Oa(t),cp(),e!==null&&ea(yr);break;case 24:ai(Ht)}}function Ml(e,t){try{var a=t.updateQueue,i=a!==null?a.lastEffect:null;if(i!==null){var r=i.next;a=r;do{if((a.tag&e)===e){i=void 0;var s=a.create,c=a.inst;i=s(),c.destroy=i}a=a.next}while(a!==r)}}catch(d){nt(t,t.return,d)}}function Xi(e,t,a){try{var i=t.updateQueue,r=i!==null?i.lastEffect:null;if(r!==null){var s=r.next;i=s;do{if((i.tag&e)===e){var c=i.inst,d=c.destroy;if(d!==void 0){c.destroy=void 0,r=t;var h=a,g=d;try{g()}catch(b){nt(r,h,b)}}}i=i.next}while(i!==s)}}catch(b){nt(t,t.return,b)}}function kw(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{Iy(t,a)}catch(i){nt(e,e.return,i)}}}function Tw(e,t,a){a.props=Er(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(i){nt(e,t,i)}}function Tn(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:var r=e.stateNode,s=ii(e.memoizedProps,r);(r.ref===null||r.ref.name!==s)&&(r.ref=f0(s)),i=r.ref;break;case 7:if(e.stateNode===null){var c=new Ba(e);Ea(e.child,!1,xS,c,void 0,void 0),e.stateNode=c}i=e.stateNode;break;default:i=e.stateNode}typeof a=="function"?e.refCleanup=a(i):a.current=i}}catch(d){nt(e,t,d)}}function Ft(e,t){var a=e.ref,i=e.refCleanup;if(a!==null)if(typeof i=="function")try{i()}catch(r){nt(e,t,r)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(r){nt(e,t,r)}else a.current=null}function vd(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)w0(e.stateNode,t[a])}function Wb(e){for(var t=e.return;t!==null&&(Cp(t)&&w0(e.stateNode,t.stateNode),!Tp(t));)t=t.return}function nl(e){for(var t=e.return;t!==null&&(Cp(t)&&$S(e.stateNode,t.stateNode),!Tp(t));)t=t.return}function Tp(e){return e.tag===5||e.tag===3||e.tag===27}function Cp(e){return e&&e.tag===7&&e.stateNode!==null}function fm(e){var t=e.type,a=e.memoizedProps,i=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&i.focus();break e;case"img":a.src?i.src=a.src:a.srcSet&&(i.srcset=a.srcSet)}}catch(r){nt(e,e.return,r)}}function $h(e,t,a){try{var i=e.stateNode;nS(i,e.type,a,t),i[Aa]=t}catch(r){nt(e,e.return,r)}}function Cw(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Qi(e.type)||e.tag===4}function Nh(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Cw(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Qi(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function bm(e,t,a,i){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(r,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(r),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=An)),vd(e,i),je=!0;else if(r!==4&&(r===27&&(vd(e,i),i=null,Qi(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(bm(e,t,a,i),e=e.sibling;e!==null;)bm(e,t,a,i),e=e.sibling}function yd(e,t,a,i){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?a.insertBefore(r,t):a.appendChild(r),vd(e,i),je=!0;else if(r!==4&&(r===27&&(vd(e,i),i=null,Qi(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(yd(e,t,a,i),e=e.sibling;e!==null;)yd(e,t,a,i),e=e.sibling}function Ew(e){var t=e.stateNode,a=e.memoizedProps;try{for(var i=e.type,r=t.attributes;r.length;)t.removeAttributeNode(r[0]);aa(t,i,a),t[Kt]=e,t[Aa]=a}catch(s){nt(e,e.return,s)}}var wd=!1,Va=null;function ev(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(wd=!0)}var Cn=null;function tv(){var e=Cn;return Cn=null,e}var ka=0;function ts(e,t,a,i,r){return ka=0,Aw(e.child,t,a,i,r)}function Aw(e,t,a,i,r){for(var s=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(i!==null){var d=_m(c);i.push(d),d.view&&(s=!0)}else s||_m(c).view&&(s=!0);wd=!0,m0(c,ka===0?t:t+"_"+ka,a),ka++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&r||Aw(e.child,t,a,i,r)&&(s=!0));e=e.sibling}return s}function Vn(e,t){for(;e!==null;)e.tag===5?p0(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||Vn(e.child,t)),e=e.sibling}function Xc(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Xc(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(H(544));var a=t.name;t=di(t.default,t.share),t!=="none"&&(ts(e,a,t,null,!1)||Vn(e.child,!1))}e=e.sibling}}function vm(e,t){if(e.tag===30){var a=e.stateNode,i=e.memoizedProps,r=ii(i,a),s=di(i.default,a.paired?i.share:i.enter);s!=="none"?ts(e,r,s,null,!1)?(Xc(e),a.paired||t||Go(e,i.onEnter)):Vn(e.child,!1):Xc(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)vm(e,t),e=e.sibling;else Xc(e)}function ym(e){if(Va!==null&&Va.size!==0){var t=Va;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,i=a.name;if(i!=null&&i!=="auto"){var r=t.get(i);if(r!==void 0){var s=di(a.default,a.share);if(s!=="none"&&(ts(e,i,s,null,!1)?(s=e.stateNode,r.paired=s,s.paired=r,Go(e,a.onShare)):Vn(e.child,!1)),t.delete(i),t.size===0)break}}}ym(e)}e=e.sibling}}}function wm(e){if(e.tag===30){var t=e.memoizedProps,a=ii(t,e.stateNode),i=Va!==null?Va.get(a):void 0,r=di(t.default,i!==void 0?t.share:t.exit);r!=="none"&&(ts(e,a,r,null,!1)?i!==void 0?(r=e.stateNode,i.paired=r,r.paired=i,Va.delete(a),Go(e,t.onShare)):Go(e,t.onExit):Vn(e.child,!1)),Va!==null&&ym(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)wm(e),e=e.sibling;else Va!==null&&ym(e)}function Rw(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=ii(t,e.stateNode);t=di(t.default,t.update),e.flags&=-5,t!=="none"&&ts(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&Rw(e);e=e.sibling}}function xm(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,Vn(e.child,!1))}xm(e)}e=e.sibling}}function Pc(e){if(e.tag===30)e.stateNode.paired=null,Vn(e.child,!1),xm(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Pc(e),e=e.sibling;else xm(e)}function Mw(e){for(e=e.child;e!==null;)e.tag===30?Vn(e.child,!1):(e.subtreeFlags&33554432)!==0&&Mw(e),e=e.sibling}function Ep(e,t,a,i,r,s,c){for(var d=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(s!==null&&ka<s.length){var g=s[ka],b=_m(h);(g.view||b.view)&&(d=!0);var N;if(N=(e.flags&4)===0)if(b.clip)N=!0;else{N=g.rect;var f=b.rect;N=N.y!==f.y||N.x!==f.x||N.height!==f.height||N.width!==f.width}N&&(e.flags|=4),b.abs?b=!g.abs:(g=g.rect,b=b.rect,b=g.height!==b.height||g.width!==b.width),b&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&m0(h,ka===0?a:a+"_"+ka,r),d&&(e.flags&4)!==0||(Cn===null&&(Cn=[]),Cn.push(h,ka===0?i:i+"_"+ka,t.memoizedProps)),ka++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:Ep(e,t.child,a,i,r,s,c)&&(d=!0));t=t.sibling}return d}function zw(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,i=e.stateNode,r=ii(a,i),s=di(a.default,a.update);if(t){i=i.clones;var c=i===null?null:i.map(cS)}else c=e.memoizedState,e.memoizedState=null;i=e;var d=e.child;ka=0,r=Ep(i,d,r,r,s,c,!1),(e.flags&4)!==0&&r&&(t||Go(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&zw(e,t);e=e.sibling}}var Xt=!1,We=!1,Nn=!1,Sh=!1,av=typeof WeakSet=="function"?WeakSet:Set,Pt=null,Sn=!1,Ps=!1,xd=!1,$m=!1;function VN(e,t,a){if(e=e.containerInfo,Vm=Jo,e=by(e),ep(e)){if("selectionStart"in e)var i={start:e.selectionStart,end:e.selectionEnd};else e:{i=(i=e.ownerDocument)&&i.defaultView||window;var r=i.getSelection&&i.getSelection();if(r&&r.rangeCount!==0){i=r.anchorNode;var s=r.anchorOffset,c=r.focusNode;r=r.focusOffset;try{i.nodeType,c.nodeType}catch{i=null;break e}var d=0,h=-1,g=-1,b=0,N=0,f=e,v=null;t:for(;;){for(var V;f!==i||s!==0&&f.nodeType!==3||(h=d+s),f!==c||r!==0&&f.nodeType!==3||(g=d+r),f.nodeType===3&&(d+=f.nodeValue.length),(V=f.firstChild)!==null;)v=f,f=V;for(;;){if(f===e)break t;if(v===i&&++b===s&&(h=d),v===c&&++N===r&&(g=d),(V=f.nextSibling)!==null)break;f=v,v=f.parentNode}f=V}i=h===-1||g===-1?null:{start:h,end:g}}else i=null}i=i||{start:0,end:0}}else i=null;for(Im={focusedElem:e,selectionRange:i},Jo=!1,a=(a&335544064)===a,Pt=t,t=a?9270:1024;Pt!==null;){if(e=Pt,a&&(i=e.deletions,i!==null))for(s=0;s<i.length;s++)a&&wm(i[s]);if(e.alternate===null&&(e.flags&2)!==0)a&&ev(e),Ac(a);else{if(e.tag===22){if(i=e.alternate,e.memoizedState!==null){i!==null&&i.memoizedState===null&&a&&wm(i),Ac(a);continue}else if(i!==null&&i.memoizedState!==null){a&&ev(e),Ac(a);continue}}i=e.child,(e.subtreeFlags&t)!==0&&i!==null?(i.return=e,Pt=i):(a&&Rw(e),Ac(a))}}Va=null}function Ac(e){for(;Pt!==null;){var t=Pt,a=e,i=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((r&1024)!==0&&i!==null){a=void 0,r=i.memoizedProps,i=i.memoizedState;var s=t.stateNode;try{var c=Er(t.type,r);a=s.getSnapshotBeforeUpdate(c,i),s.__reactInternalSnapshotBeforeUpdate=a}catch(d){nt(t,t.return,d)}}break;case 3:if((r&1024)!==0){if(i=t.stateNode.containerInfo,a=i.nodeType,a===9)Hm(i);else if(a===1)switch(i.nodeName){case"HEAD":case"HTML":case"BODY":Hm(i);break;default:i.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&i!==null&&(a=ii(i.memoizedProps,i.stateNode),r=t.memoizedProps,r=di(r.default,r.update),r!=="none"&&ts(i,a,r,i.memoizedState=[],!0));break;default:if((r&1024)!==0)throw Error(H(163))}if(i=t.sibling,i!==null){i.return=t.return,Pt=i;break}Pt=t.return}}function Ow(e,t,a){var i=a.flags;switch(a.tag){case 0:case 11:case 15:kn(e,a),i&4&&Ml(5,a);break;case 1:if(kn(e,a),i&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){nt(a,a.return,c)}else{var r=Er(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(r,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){nt(a,a.return,c)}}i&64&&kw(a),i&512&&Tn(a,a.return);break;case 3:if(kn(e,a),i&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{Iy(e,t)}catch(c){nt(a,a.return,c)}}break;case 27:t===null&&i&4&&Ew(a);case 26:case 5:kn(e,a),t===null&&i&4&&fm(a),i&512&&Tn(a,a.return);break;case 12:kn(e,a);break;case 31:kn(e,a),i&4&&_w(e,a);break;case 13:kn(e,a),i&4&&Hw(e,a),i&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=XN.bind(null,a),kS(e,a))));break;case 22:if(i=a.memoizedState!==null||Xt,!i){var s=t!==null&&t.memoizedState!==null||We;t=Xt,r=We,Xt=i,(We=s)&&!r?(i=2,(a.subtreeFlags&8772)!==0&&(i|=1),dn(e,a,i)):kn(e,a),Xt=t,We=r}break;case 30:kn(e,a),i&512&&Tn(a,a.return);break;case 7:i&512&&Tn(a,a.return);default:kn(e,a)}}function Nm(e,t){for(e=e.child;e!==null;)Vw(e,t),e=e.sibling}function Vw(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var i=a.style;typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"}else{var r=e.stateNode,s=e.memoizedProps.style,c=s!=null&&s.hasOwnProperty("display")?s.display:null;r.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){nt(e,e.return,h)}Sm(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,je=!0}catch(h){nt(e,e.return,h)}break;case 18:try{var d=e.stateNode;t?vv(d,!0):vv(e.stateNode,!1)}catch(h){nt(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&Nm(e,t);break;default:Nm(e,t)}}function Sm(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,i=t;switch(a.tag){case 4:Vw(a,i);break e;case 22:a.memoizedState===null&&Sm(a,i);break e;default:Sm(a,i)}}e=e.sibling}}function Iw(e){var t=e.alternate;t!==null&&(e.alternate=null,Iw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Md(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Nt=null,Na=!1;function cn(e,t,a){for(a=a.child;a!==null;)Dw(e,t,a),a=a.sibling}function Dw(e,t,a){if(_a&&typeof _a.onCommitFiberUnmount=="function")try{_a.onCommitFiberUnmount(Sl,a)}catch{}switch(a.tag){case 26:We||Ft(a,t),cn(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!We&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:We||Ft(a,t),nl(a);var i=Nt,r=Na;Qi(a.type)&&(Nt=a.stateNode,Na=!1),cn(e,t,a),N0(a.stateNode,a.type,a.memoizedProps),Nt=i,Na=r;break;case 5:We||Ft(a,t),nl(a);case 6:if(a.tag===6&&nl(a),i=Nt,r=Na,Nt=null,cn(e,t,a),Nt=i,Na=r,Nt!==null)if(Na)try{(Nt.nodeType===9?Nt.body:Nt.nodeName==="HTML"?Nt.ownerDocument.body:Nt).removeChild(a.stateNode),je=!0}catch(s){nt(a,t,s)}else try{Nt.removeChild(a.stateNode),je=!0}catch(s){nt(a,t,s)}break;case 18:Nt!==null&&(Na?(e=Nt,bv(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),Fo(e)):bv(Nt,a.stateNode));break;case 4:i=Nt,r=Na,Nt=a.stateNode.containerInfo,Na=!0,cn(e,t,a),Nt=i,Na=r;break;case 0:case 11:case 14:case 15:Xi(2,a,t),We||Xi(4,a,t),cn(e,t,a);break;case 1:We||(Ft(a,t),i=a.stateNode,typeof i.componentWillUnmount=="function"&&Tw(a,t,i)),cn(e,t,a);break;case 21:cn(e,t,a);break;case 22:We=(i=We)||a.memoizedState!==null,cn(e,t,a),We=i;break;case 30:Ft(a,t),cn(e,t,a);break;case 7:We||Ft(a,t),cn(e,t,a);break;default:cn(e,t,a)}}function _w(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Fo(e)}catch(a){nt(t,t.return,a)}}}function Hw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Fo(e)}catch(a){nt(t,t.return,a)}}function IN(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new av),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new av),t;default:throw Error(H(435,e.tag))}}function Rc(e,t){var a=IN(e);t.forEach(function(i){if(!a.has(i)){a.add(i);var r=PN.bind(null,e,i);i.then(r,r)}})}function va(e,t,a){var i=t.deletions;if(i!==null)for(var r=0;r<i.length;r++){var s=i[r],c=e,d=t,h=d;e:for(;h!==null;){switch(h.tag){case 27:if(Qi(h.type)){Nt=h.stateNode,Na=!1;break e}break;case 5:Nt=h.stateNode,Na=!1;break e;case 3:case 4:Nt=h.stateNode.containerInfo,Na=!0;break e}h=h.return}if(Nt===null)throw Error(H(160));Dw(c,d,s),Nt=null,Na=!1,c=s.alternate,c!==null&&(c.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Uw(t,e,a),t=t.sibling}var un=null;function Uw(e,t,a){var i=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(r&4&&(i=e.updateQueue,i=i!==null?i.events:null,i!==null))for(var s=0;s<i.length;s++){var c=i[s];c.ref.impl=c.nextImpl}va(t,e,a),ya(e),r&4&&(Xi(3,e,e.return),Ml(3,e),Xi(5,e,e.return));break;case 1:va(t,e,a),ya(e),r&512&&(We||i===null||Ft(i,i.return)),r&64&&Xt&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(s=un,va(t,e,a),ya(e),r&512&&(We||i===null||Ft(i,i.return)),r&4)if(r=i!==null?i.memoizedState:null,a=e.memoizedState,i===null)if(a===null)if(e.stateNode===null)if(Xt)e.stateNode=h0(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,r=s.ownerDocument||s;t:switch(t){case"title":i=r.getElementsByTagName("title")[0],(!i||i[Cl]||i[Kt]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=r.createElement(t),r.head.insertBefore(i,r.querySelector("head > title"))),aa(i,t,a),i[Kt]=e,Zt(i),t=i;break e;case"link":if(s=Tv("link","href",r).get(t+(a.href||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&i.getAttribute("rel")===(a.rel==null?null:a.rel)&&i.getAttribute("title")===(a.title==null?null:a.title)&&i.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(c,1);break t}}i=r.createElement(t),aa(i,t,a),r.head.appendChild(i);break;case"meta":if(s=Tv("meta","content",r).get(t+(a.content||""))){for(c=0;c<s.length;c++)if(i=s[c],i.getAttribute("content")===(a.content==null?null:""+a.content)&&i.getAttribute("name")===(a.name==null?null:a.name)&&i.getAttribute("property")===(a.property==null?null:a.property)&&i.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&i.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(c,1);break t}}i=r.createElement(t),aa(i,t,a),r.head.appendChild(i);break;default:throw Error(H(468,t))}i[Kt]=e,Zt(i),t=i}e.stateNode=t}else Xt||Bm(s,e.type,e.stateNode);else e.stateNode=kv(s,a,e.memoizedProps);else r!==a?(r===null?(t=i.stateNode,t===null||We||t.parentNode.removeChild(t)):r.count--,a===null?Xt||Bm(s,e.type,e.stateNode):kv(s,a,e.memoizedProps)):a===null&&e.stateNode!==null&&$h(e,e.memoizedProps,i.memoizedProps);break;case 27:va(t,e,a),ya(e),r&512&&(We||i===null||Ft(i,i.return)),i!==null&&r&4&&$h(e,e.memoizedProps,i.memoizedProps);break;case 5:if(s=Nn,Nn=!1,va(t,e,a),Nn=s,ya(e),r&512&&(We||i===null||Ft(i,i.return)),e.flags&32){t=e.stateNode;try{Bo(t,""),je=!0}catch(b){nt(e,e.return,b)}}r&4&&e.stateNode!=null&&(t=e.memoizedProps,$h(e,t,i!==null?i.memoizedProps:t)),r&1024&&(Sh=!0);break;case 6:if(va(t,e,a),ya(e),r&4){if(e.stateNode===null)throw Error(H(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,je=!0}catch(b){nt(e,e.return,b)}}break;case 3:if(je=!1,Fc=null,s=un,un=yl(t.containerInfo),va(t,e,a),un=s,ya(e),r&4&&i!==null&&i.memoizedState.isDehydrated)try{Fo(t.containerInfo)}catch(b){nt(e,e.return,b)}Sh&&(Sh=!1,qw(e)),je=!1;break;case 4:r=Nn,Nn=Xt,i=lb(),s=un,un=yl(e.stateNode.containerInfo),va(t,e,a),ya(e),un=s,je&&Ps&&(xd=!0),je=i,Nn=r;break;case 12:va(t,e,a),ya(e);break;case 31:va(t,e,a),ya(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Rc(e,t)));break;case 13:va(t,e,a),ya(e),e.child.flags&8192&&e.memoizedState!==null!=(i!==null&&i.memoizedState!==null)&&(Gd=Da()),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Rc(e,t)));break;case 22:s=e.memoizedState!==null,c=i!==null&&i.memoizedState!==null;var d=Xt,h=We,g=Nn;Xt=d||s,Nn=g||s,We=h||c,va(t,e,a),We=h,Nn=g,Xt=d,ya(e),r&8192&&(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,!s||i===null||c||Xt||We||(t=c||We,a=Xt,i=We,Xt=s||Xt,We=t,Ni(e,2),Xt=a,We=i),!s&&Nn||Nm(e,s)),r&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,Rc(e,a))));break;case 19:va(t,e,a),ya(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Rc(e,t)));break;case 30:r&512&&(We||i===null||Ft(i,i.return)),r=lb(),s=Ps,c=(a&335544064)===a,d=e.memoizedProps,Ps=c&&di(d.default,d.update)!=="none",va(t,e,a),ya(e),c&&i!==null&&je&&(e.flags|=4),Ps=s,je=r;break;case 21:break;case 7:r&512&&(We||i===null||Ft(i,i.return)),i&&i.stateNode!==null&&(i.stateNode._fragmentFiber=e);default:va(t,e,a),ya(e)}}function ya(e){var t=e.flags;if(t&2){try{for(var a,i=e.return;i!==null;){if(Cw(i)){a=i;break}i=i.return}i=null;for(var r=e.return;r!==null;){if(Cp(r)){var s=r.stateNode;i===null?i=[s]:i.push(s)}if(Tp(r))break;r=r.return}var c=i;if(a==null)throw Error(H(160));switch(a.tag){case 27:var d=a.stateNode,h=Nh(e);yd(e,h,d,c);break;case 5:var g=a.stateNode;a.flags&32&&(Bo(g,""),a.flags&=-33);var b=Nh(e);yd(e,b,g,c);break;case 3:case 4:var N=a.stateNode.containerInfo,f=Nh(e);bm(e,f,N,c);break;default:throw Error(H(161))}}catch(v){nt(e,e.return,v)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function qw(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;qw(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,Jo=!0,t.reset(),Jo=!1),e=e.sibling}}function mo(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)Bw(t,e),t=t.sibling;else zw(t,!1)}function Bw(e,t){var a=e.alternate;if(a===null)vm(e,!1);else switch(e.tag){case 3:if($m=Sn=!1,tv(),mo(t,e),!Sn&&!xd){if(e=Cn,e!==null)for(var i=0;i<e.length;i+=3){a=e[i];var r=e[i+1];p0(a,e[i+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+r+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),$m=!0}Cn=null;break;case 5:mo(t,e);break;case 4:i=Sn,Sn=!1,mo(t,e),Sn&&(xd=!0),Sn=i;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?vm(e,!1):mo(t,e));break;case 30:i=Sn,r=tv(),Sn=!1,mo(t,e),Sn&&(e.flags|=4);var s=e.memoizedProps,c=e.stateNode;t=ii(s,c),c=ii(a.memoizedProps,c);var d=di(s.default,s.update);d==="none"?t=!1:(s=a.memoizedState,a.memoizedState=null,a=e.child,ka=0,t=Ep(e,a,t,c,d,s,!0),ka!==(s===null?0:s.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(Go(e,e.memoizedProps.onUpdate),Cn=r):r!==null&&(r.push.apply(r,Cn),Cn=r),Sn=(e.flags&32)!==0?!0:i;break;default:mo(t,e)}}function kn(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Ow(e,t.alternate,t),t=t.sibling}function Ni(e,t){for(e=e.child;e!==null;){var a=e,i=t;switch(a.tag){case 0:case 11:case 14:case 15:Xi(4,a,a.return),Ni(a,i);break;case 1:Ft(a,a.return);var r=a.stateNode;typeof r.componentWillUnmount=="function"&&Tw(a,a.return,r),Ni(a,i);break;case 27:(i&2)!==0&&N0(a.stateNode,a.type,a.memoizedProps);case 5:Ft(a,a.return),a.tag!==5&&a.tag!==27||nl(a),Ni(a,i);break;case 6:nl(a);break;case 26:Ft(a,a.return),r=a.stateNode,a.memoizedState!==null||r===null||We||r.parentNode.removeChild(r),Ni(a,i);break;case 22:a.memoizedState===null&&Ni(a,i);break;case 30:Ft(a,a.return),Ni(a,i);break;case 7:Ft(a,a.return);default:Ni(a,i)}e=e.sibling}}function dn(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var i=t.alternate,r=e,s=t,c=s.flags,d=(a&1)!==0;switch(s.tag){case 0:case 11:case 15:dn(r,s,a),Ml(4,s);break;case 1:if(dn(r,s,a),i=s,r=i.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(b){nt(i,i.return,b)}if(i=s,r=i.updateQueue,r!==null){var h=i.stateNode;try{var g=r.shared.hiddenCallbacks;if(g!==null)for(r.shared.hiddenCallbacks=null,r=0;r<g.length;r++)Vy(g[r],h)}catch(b){nt(i,i.return,b)}}d&&c&64&&kw(s),Tn(s,s.return);break;case 27:(a&2)!==0&&Ew(s);case 5:s.tag!==5&&s.tag!==27||Wb(s),dn(r,s,a),d&&i===null&&c&4&&fm(s),Tn(s,s.return);break;case 6:Wb(s);break;case 26:h=s.stateNode,s.memoizedState!==null||h===null||Xt||Bm(yl(h.ownerDocument),s.type,h),dn(r,s,a),d&&i===null&&c&4&&fm(s),Tn(s,s.return);break;case 12:dn(r,s,a);break;case 31:dn(r,s,a),d&&c&4&&_w(r,s);break;case 13:dn(r,s,a),d&&c&4&&Hw(r,s);break;case 22:s.memoizedState===null&&dn(r,s,a),Tn(s,s.return);break;case 30:dn(r,s,a),Tn(s,s.return);break;case 7:Tn(s,s.return);default:dn(r,s,a)}t=t.sibling}}function Ap(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Al(a))}function Rp(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Al(e))}function Qa(e,t,a,i){var r=(a&335544064)===a;if(t.subtreeFlags&(r?10262:10256))for(t=t.child;t!==null;)Lw(e,t,a,i),t=t.sibling;else r&&Mw(t)}function Lw(e,t,a,i){var r=(a&335544064)===a;r&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&Pc(t);var s=t.flags;switch(t.tag){case 0:case 11:case 15:Qa(e,t,a,i),s&2048&&Ml(9,t);break;case 1:Qa(e,t,a,i);break;case 3:Qa(e,t,a,i),r&&$m&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),s&2048&&(s=null,t.alternate!==null&&(s=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==s&&(t.refCount++,s!=null&&Al(s)));break;case 12:if(s&2048){Qa(e,t,a,i),s=t.stateNode;try{var c=t.memoizedProps,d=c.id,h=c.onPostCommit;typeof h=="function"&&h(d,t.alternate===null?"mount":"update",s.passiveEffectDuration,-0)}catch(g){nt(t,t.return,g)}}else Qa(e,t,a,i);break;case 31:Qa(e,t,a,i);break;case 13:Qa(e,t,a,i);break;case 23:break;case 22:c=t.stateNode,d=t.alternate,t.memoizedState!==null?(r&&d!==null&&d.memoizedState===null&&Pc(d),c._visibility&2?Qa(e,t,a,i):il(e,t)):(r&&d!==null&&d.memoizedState!==null&&Pc(t),c._visibility&2?Qa(e,t,a,i):(c._visibility|=2,go(e,t,a,i,(t.subtreeFlags&10256)!==0||!1))),s&2048&&Ap(d,t);break;case 24:Qa(e,t,a,i),s&2048&&Rp(t.alternate,t);break;case 30:r&&(s=t.alternate,s!==null&&(Vn(s.child,!0),Vn(t.child,!0))),Qa(e,t,a,i);break;default:Qa(e,t,a,i)}}function go(e,t,a,i,r){for(r=r&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var s=e,c=t,d=a,h=i,g=c.flags;switch(c.tag){case 0:case 11:case 15:go(s,c,d,h,r),Ml(8,c);break;case 23:break;case 22:var b=c.stateNode;c.memoizedState!==null?b._visibility&2?go(s,c,d,h,r):il(s,c):(b._visibility|=2,go(s,c,d,h,r)),r&&g&2048&&Ap(c.alternate,c);break;case 24:go(s,c,d,h,r),r&&g&2048&&Rp(c.alternate,c);break;default:go(s,c,d,h,r)}t=t.sibling}}function il(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,i=t,r=i.flags;switch(i.tag){case 22:il(a,i),r&2048&&Ap(i.alternate,i);break;case 24:il(a,i),r&2048&&Rp(i.alternate,i);break;default:il(a,i)}t=t.sibling}}var pr=8192;function ur(e,t,a){if(e.subtreeFlags&pr)for(e=e.child;e!==null;)jw(e,t,a),e=e.sibling}function jw(e,t,a){switch(e.tag){case 26:ur(e,t,a),e.flags&pr&&(e.memoizedState!==null?US(a,un,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Ev(a,e)));break;case 5:ur(e,t,a),e.flags&pr&&(e=e.stateNode,(t&335544128)===t&&Ev(a,e));break;case 3:case 4:var i=un;un=yl(e.stateNode.containerInfo),ur(e,t,a),un=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=pr,pr=16777216,ur(e,t,a),pr=i):ur(e,t,a));break;case 30:if((e.flags&pr)!==0&&(i=e.memoizedProps.name,i!=null&&i!=="auto")){var r=e.stateNode;r.paired=null,Va===null&&(Va=new Map),Va.set(i,r)}ur(e,t,a);break;default:ur(e,t,a)}}function Gw(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function qs(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];Pt=i,Xw(i,e)}Gw(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Yw(e),e=e.sibling}function Yw(e){switch(e.tag){case 0:case 11:case 15:qs(e),e.flags&2048&&Xi(9,e,e.return);break;case 3:qs(e);break;case 12:qs(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Zc(e)):qs(e);break;default:qs(e)}}function Zc(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var i=t[a];Pt=i,Xw(i,e)}Gw(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Xi(8,t,t.return),Zc(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Zc(t));break;default:Zc(t)}e=e.sibling}}function Xw(e,t){for(;Pt!==null;){var a=Pt;switch(a.tag){case 0:case 11:case 15:Xi(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var i=a.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:Al(a.memoizedState.cache)}if(i=a.child,i!==null)i.return=a,Pt=i;else e:for(a=e;Pt!==null;){i=Pt;var r=i.sibling,s=i.return;if(Iw(i),i===a){Pt=null;break e}if(r!==null){r.return=s,Pt=r;break e}Pt=s}}}var DN={getCacheForType:function(e){var t=Wt(Ht),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return Wt(Ht).controller.signal}},_N=typeof WeakMap=="function"?WeakMap:Map,Ye=0,st=null,Ee=null,ze=0,tt=0,Ma=null,Ri=!1,as=!1,Mp=!1,li=0,Mt=0,Pi=0,xr=0,$d=0,Ia=0,jo=0,rl=null,Sa=null,km=!1,Gd=0,Pw=0,Nd=1/0,Sd=null,Ui=null,Ct=0,mn=null,Ar=null,On=0,Tm=0,Cm=null,Zw=null,Do=null,_o=null,Ho=null,ol=0,Qc=null;function Ua(){return(Ye&2)!==0&&ze!==0?ze&-ze:ge.T!==null?Op():Kv()}function Qw(){if(Ia===0)if((ze&536870912)===0||Te){var e=bc;bc<<=1,(bc&3932160)===0&&(bc=262144),Ia=e}else Ia=536870912;return e=na.current,e!==null&&(e.flags|=32),Ia}function Go(e,t){if(t!=null){var a=e.stateNode,i=a.ref;i===null&&(i=a.ref=f0(ii(e.memoizedProps,a))),_o===null&&(_o=[]),_o.push(t.bind(null,i))}}function Ca(e,t,a){(e===st&&(tt===2||tt===9)||e.cancelPendingCommit!==null)&&(Yo(e,0),Mi(e,ze,Ia,!1)),Tl(e,a),((Ye&2)===0||e!==st)&&(e===st&&((Ye&2)===0&&(xr|=a),Mt===4&&Mi(e,ze,Ia,!1)),Dn(e))}function Jw(e,t,a){if((Ye&6)!==0)throw Error(H(327));var i=!a&&(t&127)===0&&(t&e.expiredLanes)===0||kl(e,t),r=i?qN(e,t):kh(e,t,!0),s=i;do{if(r===0){as&&!i&&Mi(e,t,0,!1);break}else{if(a=e.current.alternate,s&&!HN(a)){r=kh(e,t,!1),s=!1;continue}if(r===2){if(s=t,e.errorRecoveryDisabledLanes&s)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var d=e;r=rl;var h=d.current.memoizedState.isDehydrated;if(h&&(Yo(d,c).flags|=256),c=kh(d,c,!1),c!==2&&c!==6){if(Mp&&!h){d.errorRecoveryDisabledLanes|=s,xr|=s,r=4;break e}s=Sa,Sa=r,s!==null&&(Sa===null?Sa=s:Sa.push.apply(Sa,s))}r=c}if(s=!1,r!==2)continue}}if(r===1){Yo(e,0),Mi(e,t,0,!0);break}e:{switch(i=e,s=r,s){case 0:case 1:throw Error(H(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:Mi(i,t,Ia,!Ri);break e;case 2:Sa=null;break;case 3:case 5:break;default:throw Error(H(329))}if((t&62914560)===t&&(r=Gd+300-Da(),10<r)){if(Mi(i,t,Ia,!Ri),Rd(i,0,!0)!==0)break e;On=t,i.timeoutHandle=Ip(nv.bind(null,i,a,Sa,Sd,km,t,Ia,xr,jo,Ri,s,"Throttled",-0,0),r);break e}nv(i,a,Sa,Sd,km,t,Ia,xr,jo,Ri,s,null,-0,0)}}break}while(!0);Dn(e)}function nv(e,t,a,i,r,s,c,d,h,g,b,N,f,v){e.timeoutHandle=-1;var V=t.subtreeFlags,M=(s&335544064)===s;if(N=null,(M||V&8192||(V&16785408)===16785408)&&(N={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:An},Va=null,jw(t,s,N),M&&(V=N,M=e.containerInfo,M=(M.nodeType===9?M:M.ownerDocument).__reactViewTransition,M!=null&&(V.count++,V.waitingForViewTransition=!0,V=wl.bind(V),M.finished.then(V,V))),V=(s&62914560)===s?Gd-Da():(s&4194048)===s?Pw-Da():0,V=qS(N,V),V!==null)){On=s,e.cancelPendingCommit=V(rv.bind(null,e,t,s,a,i,r,c,d,h,g,b,N,null,f,v)),Mi(e,s,c,!g);return}rv(e,t,s,a,i,r,c,d,h,g,b,N)}function HN(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var i=0;i<a.length;i++){var r=a[i],s=r.getSnapshot;r=r.value;try{if(!qa(s(),r))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Mi(e,t,a,i){t=Pv(e,t),t&=~$d,t&=~xr,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var r=t;0<r;){var s=31-Ha(r),c=1<<s;i[s]=-1,r&=~c}a!==0&&Qv(e,a,t)}function Yd(){return(Ye&6)===0?(zl(0,!1),!1):!0}function zp(){if(Ee!==null){if(tt===0)var e=Ee.return;else e=Ee,ei=Vr=null,gp(e),Oo=null,ml=0,e=Ee;for(;e!==null;)Sw(e.alternate,e),e=e.return;Ee=null}}function Yo(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,oS(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),On=0,zp(),st=e,Ee=a=ti(e.current,null),ze=t,tt=0,Ma=null,Ri=!1,as=kl(e,t),Mp=!1,jo=Ia=$d=xr=Pi=Mt=0,Sa=rl=null,km=!1,li=Pv(e,t),Id(),a}function Fw(e,t){xe=null,ge.H=fd,t===es||t===Hd?(t=Rb(),tt=3):t===sp?(t=Rb(),tt=4):tt=t===Np?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Ma=t,Ee===null&&(Mt=1,bd(e,en(t,e.current)))}function Kw(){var e=na.current;return e===null?!0:(ze&4194048)===ze?ca===null:(ze&62914560)===ze||(ze&536870912)!==0?e===ca:!1}function Ww(){var e=ge.H;return ge.H=fd,e===null?fd:e}function e0(){var e=ge.A;return ge.A=DN,e}function kd(){Mt=4,Ri||(ze&4194048)!==ze&&na.current!==null||(as=!0),(Pi&134217727)===0&&(xr&134217727)===0||st===null||Mi(st,ze,Ia,!1)}function kh(e,t,a){var i=Ye;Ye|=2;var r=Ww(),s=e0();(st!==e||ze!==t)&&(Sd=null,Yo(e,t)),t=!1;var c=Mt;e:do try{if(tt!==0&&Ee!==null){var d=Ee,h=Ma;switch(tt){case 8:zp(),c=6;break e;case 3:case 2:case 9:case 6:na.current===null&&(t=!0);var g=tt;if(tt=0,Ma=null,Eo(e,d,h,g),a&&as){c=0;break e}break;default:g=tt,tt=0,Ma=null,Eo(e,d,h,g)}}UN(),c=Mt;break}catch(b){Fw(e,b)}while(!0);return t&&e.shellSuspendCounter++,ei=Vr=null,Ye=i,ge.H=r,ge.A=s,Ee===null&&(st=null,ze=0,Id()),c}function UN(){for(;Ee!==null;)t0(Ee)}function qN(e,t){var a=Ye;Ye|=2;var i=Ww(),r=e0();st!==e||ze!==t?(Sd=null,Nd=Da()+500,Yo(e,t)):as=kl(e,t);e:do try{if(tt!==0&&Ee!==null){t=Ee;var s=Ma;t:switch(tt){case 1:tt=0,Ma=null,Eo(e,t,s,1);break;case 2:case 9:if(Ab(s)){tt=0,Ma=null,iv(t);break}t=function(){tt!==2&&tt!==9||st!==e||(tt=7),Dn(e)},s.then(t,t);break e;case 3:tt=7;break e;case 4:tt=5;break e;case 7:Ab(s)?(tt=0,Ma=null,iv(t)):(tt=0,Ma=null,Eo(e,t,s,7));break;case 5:var c=null;switch(Ee.tag){case 26:c=Ee.memoizedState;case 5:case 27:var d=Ee;if(c?T0(c):d.stateNode.complete){tt=0,Ma=null;var h=d.sibling;if(h!==null)Ee=h;else{var g=d.return;g!==null?(Ee=g,Xd(g)):Ee=null}break t}}tt=0,Ma=null,Eo(e,t,s,5);break;case 6:tt=0,Ma=null,Eo(e,t,s,6);break;case 8:zp(),Mt=6;break e;default:throw Error(H(462))}}BN();break}catch(b){Fw(e,b)}while(!0);return ei=Vr=null,ge.H=i,ge.A=r,Ye=a,Ee!==null?0:(st=null,ze=0,Id(),Mt)}function BN(){for(;Ee!==null&&!i5();)t0(Ee)}function t0(e){var t=Nw(e.alternate,e,li);e.memoizedProps=e.pendingProps,t===null?Xd(e):Ee=t}function iv(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=Xb(a,t,t.pendingProps,t.type,void 0,ze);break;case 11:t=Xb(a,t,t.pendingProps,t.type.render,t.ref,ze);break;case 5:gp(t);var i=t;i===Qt&&(Te?(cd(i),i.tag===5&&i.stateNode!=null&&(ft=i.stateNode)):(cd(i),Te=!0));default:Sw(a,t),t=Ee=ky(t,li),t=Nw(a,t,li)}e.memoizedProps=e.pendingProps,t===null?Xd(e):Ee=t}function Eo(e,t,a,i){ei=Vr=null,gp(t),Oo=null,ml=0;var r=t.return;try{if(EN(e,r,t,a,ze)){Mt=1,bd(e,en(a,e.current)),Ee=null;return}}catch(s){if(r!==null)throw Ee=r,s;Mt=1,bd(e,en(a,e.current)),Ee=null;return}t.flags&32768?(Te||i===1?e=!0:as||(ze&536870912)!==0?e=!1:(Ri=e=!0,(i===2||i===9||i===3||i===6)&&(i=na.current,i!==null&&i.tag===13&&(i.flags|=16384))),a0(t,e)):Xd(t)}function Xd(e){var t=e;do{if((t.flags&32768)!==0){a0(t,Ri);return}e=t.return;var a=zN(t.alternate,t,li);if(a!==null){Ee=a;return}if(t=t.sibling,t!==null){Ee=t;return}Ee=t=e}while(t!==null);Mt===0&&(Mt=5)}function a0(e,t){do{var a=ON(e.alternate,e);if(a!==null){a.flags&=32767,Ee=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){Ee=e;return}Ee=e=a}while(e!==null);Mt=6,Ee=null}function rv(e,t,a,i,r,s,c,d,h,g,b,N){e.cancelPendingCommit=null;do Pd();while(Ct!==0);if((Ye&6)!==0)throw Error(H(327));if(t!==null){if(t===e.current)throw Error(H(177));e===st&&(Ee=st=null,ze=0),Ar=t,mn=e,On=a,Cm=r,Zw=i,LN(e,t,a,c,d,h,N)}}function LN(e,t,a,i,r,s,c){var d=t.lanes|t.childLanes;if(Tm=d,d|=tp,p5(e,a,d,i,r,s),_o=null,(a&335544064)===a?(Ho=fN(e),i=10262):(Ho=null,i=10256),(t.subtreeFlags&i)!==0||(t.flags&i)!==0?(e.callbackNode=null,e.callbackPriority=0,ZN(id,function(){return Mm(),null})):(e.callbackNode=null,e.callbackPriority=0),wd=!1,i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=ge.T,ge.T=null,r=Xe.p,Xe.p=2,s=Ye,Ye|=4;try{VN(e,t,a)}finally{Ye=s,Xe.p=r,ge.T=i}}Ct=1,wd?Do=hS(c,e.containerInfo,Ho,Em,Am,GN,Rm,Mm,jN,null,null):(Em(),Am(),Rm())}function jN(e){if(Ct!==0){var t=mn.onRecoverableError;t(e,{componentStack:null})}}function GN(){Ct===3&&(Ct=0,Bw(Ar,mn),Ct=4)}function Em(){if(Ct===1){Ct=0;var e=mn,t=Ar,a=On,i=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||i){i=ge.T,ge.T=null;var r=Xe.p;Xe.p=2;var s=Ye;Ye|=4;try{Ps=xd=!1,Uw(t,e,a),a=Im;var c=by(e.containerInfo),d=a.focusedElem,h=a.selectionRange;if(c!==d&&d&&d.ownerDocument&&fy(d.ownerDocument.documentElement,d)){if(h!==null&&ep(d)){var g=h.start,b=h.end;if(b===void 0&&(b=g),"selectionStart"in d)d.selectionStart=g,d.selectionEnd=Math.min(b,d.value.length);else{var N=d.ownerDocument||document,f=N&&N.defaultView||window;if(f.getSelection){var v=f.getSelection(),V=d.textContent.length,M=Math.min(h.start,V),O=h.end===void 0?M:Math.min(h.end,V);!v.extend&&M>O&&(c=O,O=M,M=c);var $=xb(d,M),w=xb(d,O);if($&&w&&(v.rangeCount!==1||v.anchorNode!==$.node||v.anchorOffset!==$.offset||v.focusNode!==w.node||v.focusOffset!==w.offset)){var y=N.createRange();y.setStart($.node,$.offset),v.removeAllRanges(),M>O?(v.addRange(y),v.extend(w.node,w.offset)):(y.setEnd(w.node,w.offset),v.addRange(y))}}}}for(N=[],v=d;v=v.parentNode;)v.nodeType===1&&N.push({element:v,left:v.scrollLeft,top:v.scrollTop});for(typeof d.focus=="function"&&d.focus(),d=0;d<N.length;d++){var R=N[d];R.element.scrollLeft=R.left,R.element.scrollTop=R.top}}Jo=!!Vm,Im=Vm=null}finally{Ye=s,Xe.p=r,ge.T=i}}e.current=t,Ct=2}}function Am(){if(Ct===2){Ct=0;var e=mn,t=Ar,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=ge.T,ge.T=null;var i=Xe.p;Xe.p=2;var r=Ye;Ye|=4;try{Ow(e,t.alternate,t)}finally{Ye=r,Xe.p=i,ge.T=a}}Ct=3}}function Rm(){if(Ct===4||Ct===3){Ct=0;var e=Do;Do=null,r5();var t=mn,a=Ar,i=On,r=Zw,s=(i&335544064)===i?10262:10256;if((a.subtreeFlags&s)!==0||(a.flags&s)!==0?Ct=5:(Ct=0,Ar=mn=null,n0(t,t.pendingLanes)),s=t.pendingLanes,s===0&&(Ui=null),Zm(i),a=a.stateNode,_a&&typeof _a.onCommitFiberRoot=="function")try{_a.onCommitFiberRoot(Sl,a,void 0,(a.current.flags&128)===128)}catch{}if(r!==null){a=ge.T,s=Xe.p,Xe.p=2,ge.T=null;try{for(var c=t.onRecoverableError,d=0;d<r.length;d++){var h=r[d];c(h.value,{componentStack:h.stack})}}finally{ge.T=a,Xe.p=s}}if(r=_o,c=Ho,Ho=null,r!==null&&(_o=null,c===null&&(c=[]),e!==null))for(h=0;h<r.length;h++)a=(0,r[h])(c),a!==void 0&&e.finished.finally(a);(On&3)!==0&&Pd(),Dn(t),s=t.pendingLanes,(i&261930)!==0&&(s&42)!==0?t===Qc?ol++:(ol=0,Qc=t):(ol=0,Qc=null),zl(0,!1)}}function n0(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Al(t)))}function Pd(){return Do!==null&&(Do.skipTransition(),Do=null),Em(),Am(),Rm(),Mm()}function Mm(){if(Ct!==5)return!1;var e=mn,t=Tm;Tm=0;var a=Zm(On),i=ge.T,r=Xe.p;try{Xe.p=32>a?32:a,ge.T=null,a=Cm,Cm=null;var s=mn,c=On;if(Ct=0,Ar=mn=null,On=0,(Ye&6)!==0)throw Error(H(331));var d=Ye;if(Ye|=4,Yw(s.current),Lw(s,s.current,c,a),Ye=d,zl(0,!1),_a&&typeof _a.onPostCommitFiberRoot=="function")try{_a.onPostCommitFiberRoot(Sl,s)}catch{}return!0}finally{Xe.p=r,ge.T=i,n0(e,t)}}function ov(e,t,a){t=en(a,t),t=dm(e.stateNode,t,2),e=Di(e,t,2),e!==null&&(Tl(e,2),Dn(e))}function nt(e,t,a){if(e.tag===3)ov(e,e,a);else for(;t!==null;){if(t.tag===3){ov(t,e,a);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Ui===null||!Ui.has(i))){e=en(a,e),a=vw(2),i=Di(t,a,2),i!==null&&(yw(a,i,t,e),Tl(i,2),Dn(i));break}}t=t.return}}function Th(e,t,a){var i=e.pingCache;if(i===null){i=e.pingCache=new _N;var r=new Set;i.set(t,r)}else r=i.get(t),r===void 0&&(r=new Set,i.set(t,r));r.has(a)||(Mp=!0,r.add(a),e=YN.bind(null,e,t,a),t.then(e,e))}function YN(e,t,a){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,st===e&&(ze&a)===a&&((Mt===4||Mt===3&&(ze&62914560)===ze&&300>Da()-Gd)&&(Ye&2)===0?Yo(e,0):$d|=a,jo===ze&&(jo=0)),Dn(e)}function i0(e,t){t===0&&(t=Zv()),e=Or(e,t),e!==null&&(Tl(e,t),Dn(e))}function XN(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),i0(e,a)}function PN(e,t){var a=0;switch(e.tag){case 31:case 13:var i=e.stateNode,r=e.memoizedState;r!==null&&(a=r.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(H(314))}i!==null&&i.delete(t),i0(e,a)}function ZN(e,t){return Xm(e,t)}var Xo=null,fo=null,zm=!1,Td=!1,Ch=!1,zi=0;function Dn(e){e!==fo&&e.next===null&&(fo===null?Xo=fo=e:fo=fo.next=e),Td=!0,zm||(zm=!0,JN())}function zl(e,t){if(!Ch&&Td){Ch=!0;do for(var a=!1,i=Xo;i!==null;){if(!t)if(e!==0){var r=i.pendingLanes;if(r===0)var s=0;else{var c=i.suspendedLanes,d=i.pingedLanes;s=(1<<31-Ha(42|e)+1)-1,s&=r&~(c&~d),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,sv(i,s))}else s=ze,s=Rd(i,i===st?s:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(s&3)===0||kl(i,s)||(a=!0,sv(i,s));i=i.next}while(a);Ch=!1}}function QN(){r0()}function r0(){Td=zm=!1;var e=0;zi!==0&&rS()&&(e=zi);for(var t=Da(),a=null,i=Xo;i!==null;){var r=i.next,s=o0(i,t);s===0?(i.next=null,a===null?Xo=r:a.next=r,r===null&&(fo=a)):(a=i,(e!==0||(s&3)!==0)&&(Td=!0)),i=r}Ct!==0&&Ct!==5||zl(e,!1),zi!==0&&(zi=0)}function o0(e,t){for(var a=e.suspendedLanes,i=e.pingedLanes,r=e.expirationTimes,s=e.pendingLanes&-62914561;0<s;){var c=31-Ha(s),d=1<<c,h=r[c];h===-1?((d&a)===0||(d&i)!==0)&&(r[c]=m5(d,t)):h<=t&&(e.expiredLanes|=d),s&=~d}if(t=st,a=ze,a=Rd(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,a===0||e===t&&(tt===2||tt===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&rh(i),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||kl(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(i!==null&&rh(i),Zm(a)){case 2:case 8:a=Yv;break;case 32:a=id;break;case 268435456:a=Xv;break;default:a=id}return i=s0.bind(null,e),a=Xm(a,i),e.callbackPriority=t,e.callbackNode=a,t}return i!==null&&i!==null&&rh(i),e.callbackPriority=2,e.callbackNode=null,2}function s0(e,t){if(Ct!==0&&Ct!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(Pd()&&e.callbackNode!==a)return null;var i=ze;return i=Rd(e,e===st?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(Jw(e,i,t),o0(e,Da()),e.callbackNode!=null&&e.callbackNode===a?s0.bind(null,e):null)}function sv(e,t){if(Pd())return null;Jw(e,t,!0)}function JN(){sS(function(){(Ye&6)!==0?Xm(Gv,QN):r0()})}function Op(){if(zi===0){var e=kr;e===0&&(e=fc,fc<<=1,(fc&261888)===0&&(fc=256)),zi=e}return zi}function lv(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:_c(e)}function FN(e,t,a,i,r){if(t==="submit"&&a&&a.stateNode===r){var s=lv((r[Aa]||null).action),c=i.submitter;c&&(t=(t=c[Aa]||null)?lv(t.formAction):c.getAttribute("formAction"),t!==null&&(s=t,c=null));var d=new zd("action","action",null,i,r);e.push({event:d,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(zi!==0){var h=new FormData(r,c);lm(a,{pending:!0,data:h,method:r.method,action:s},null,h)}}else typeof s=="function"&&(d.preventDefault(),h=new FormData(r,c),lm(a,{pending:!0,data:h,method:r.method,action:s},s,h))},currentTarget:r}]})}}for(Mc=0;Mc<Fh.length;Mc++)zc=Fh[Mc],cv=zc.toLowerCase(),dv=zc[0].toUpperCase()+zc.slice(1),pn(cv,"on"+dv);var zc,cv,dv,Mc;pn(yy,"onAnimationEnd");pn(wy,"onAnimationIteration");pn(xy,"onAnimationStart");pn("dblclick","onDoubleClick");pn("focusin","onFocus");pn("focusout","onBlur");pn(lN,"onTransitionRun");pn(cN,"onTransitionStart");pn(dN,"onTransitionCancel");pn($y,"onTransitionEnd");qo("onMouseEnter",["mouseout","mouseover"]);qo("onMouseLeave",["mouseout","mouseover"]);qo("onPointerEnter",["pointerout","pointerover"]);qo("onPointerLeave",["pointerout","pointerover"]);Mr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Mr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Mr("onBeforeInput",["compositionend","keypress","textInput","paste"]);Mr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Mr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Mr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var fl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),KN=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(fl));function l0(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var i=e[a],r=i.event;i=i.listeners;e:{var s=void 0;if(t)for(var c=i.length-1;0<=c;c--){var d=i[c],h=d.instance,g=d.currentTarget;if(d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=g;try{s(r)}catch(b){od(b)}r.currentTarget=null,s=h}else for(c=0;c<i.length;c++){if(d=i[c],h=d.instance,g=d.currentTarget,d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=g;try{s(r)}catch(b){od(b)}r.currentTarget=null,s=h}}}}function Ce(e,t){var a=t[ib];a===void 0&&(a=t[ib]=new Set);var i=e+"__bubble";a.has(i)||(c0(t,e,2,!1),a.add(i))}function Eh(e,t,a){var i=0;t&&(i|=4),c0(a,e,i,t)}var Oc="_reactListening"+Math.random().toString(36).slice(2);function Vp(e){if(!e[Oc]){e[Oc]=!0,ey.forEach(function(a){a!=="selectionchange"&&(KN.has(a)||Eh(a,!1,e),Eh(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Oc]||(t[Oc]=!0,Eh("selectionchange",!1,t))}}function c0(e,t,a,i){switch(O0(t)){case 2:var r=GS;break;case 8:r=YS;break;default:r=Bp}a=r.bind(null,t,a,e),r=void 0,!Ph||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),i?r!==void 0?e.addEventListener(t,a,{capture:!0,passive:r}):e.addEventListener(t,a,!0):r!==void 0?e.addEventListener(t,a,{passive:r}):e.addEventListener(t,a,!1)}function Ah(e,t,a,i,r){var s=i;if((t&1)===0&&(t&2)===0&&i!==null)e:for(;;){if(i===null)return;var c=i.tag;if(c===3||c===4){var d=i.stateNode.containerInfo;if(d===r)break;if(c===4)for(c=i.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===r)return;c=c.return}for(;d!==null;){if(c=gr(d),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){i=s=c;continue e}d=d.parentNode}}i=i.return}ly(function(){var g=s,b=Jm(a),N=[];e:{var f=Ny.get(e);if(f!==void 0){var v=zd,V=e;switch(e){case"keypress":if(Uc(a)===0)break e;case"keydown":case"keyup":v=H5;break;case"focusin":V="focus",v=uh;break;case"focusout":V="blur",v=uh;break;case"beforeblur":case"afterblur":v=uh;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":v=hb;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":v=T5;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":v=j5;break;case yy:case wy:case xy:v=A5;break;case $y:v=Y5;break;case"scroll":case"scrollend":v=S5;break;case"wheel":v=P5;break;case"copy":case"cut":case"paste":v=M5;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":v=pb;break;case"submit":v=B5;break;case"toggle":case"beforetoggle":v=Q5}var M=(t&4)!==0,O=!M&&(e==="scroll"||e==="scrollend"),$=M?f!==null?f+"Capture":null:f;M=[];for(var w=g,y;w!==null;){var R=w;if(y=R.stateNode,R=R.tag,R!==5&&R!==26&&R!==27||y===null||$===null||(R=ll(w,$),R!=null&&M.push(bl(w,R,y))),O)break;w=w.return}0<M.length&&(f=new v(f,V,null,a,b),N.push({event:f,listeners:M}))}}if((t&7)===0){e:{if(v=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",v&&a!==Xh&&(V=a.relatedTarget||a.fromElement)&&(gr(V)||V[Ko]))break e;(f||v)&&(V=b.window===b?b:(v=b.ownerDocument)?v.defaultView||v.parentWindow:window,f?(v=a.relatedTarget||a.toElement,f=g,v=v?gr(v):null,v!==null&&(O=Nl(v),M=v.tag,v!==O||M!==5&&M!==27&&M!==6)&&(v=null)):(f=null,v=g),f!==v&&(M=hb,R="onMouseLeave",$="onMouseEnter",w="mouse",(e==="pointerout"||e==="pointerover")&&(M=pb,R="onPointerLeave",$="onPointerEnter",w="pointer"),O=f==null?V:Ys(f),y=v==null?V:Ys(v),V=new M(R,w+"leave",f,a,b),V.target=O,V.relatedTarget=y,R=null,gr(b)===g&&(M=new M($,w+"enter",v,a,b),M.target=y,M.relatedTarget=O,R=M),O=R,M=f&&v?Vh(f,v,WN):null,f!==null&&uv(N,V,f,M,!1),v!==null&&O!==null&&uv(N,O,v,M,!0)))}e:{if(f=g?Ys(g):window,v=f.nodeName&&f.nodeName.toLowerCase(),v==="select"||v==="input"&&f.type==="file")var U=vb;else if(bb(f))if(py)U=rN;else{U=nN;var Z=aN}else v=f.nodeName,!v||v.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?g&&Qm(g.elementType)&&(U=vb):U=iN;if(U&&(U=U(e,g))){my(N,U,a,b);break e}Z&&Z(e,f,g)}switch(Z=g?Ys(g):window,e){case"focusin":(bb(Z)||Z.contentEditable==="true")&&($o=Z,Qh=g,Js=null);break;case"focusout":Js=Qh=$o=null;break;case"mousedown":Jh=!0;break;case"contextmenu":case"mouseup":case"dragend":Jh=!1,$b(N,a,b);break;case"selectionchange":if(sN)break;case"keydown":case"keyup":$b(N,a,b)}var F;if(Wm)e:{switch(e){case"compositionstart":var te="onCompositionStart";break e;case"compositionend":te="onCompositionEnd";break e;case"compositionupdate":te="onCompositionUpdate";break e}te=void 0}else xo?uy(e,a)&&(te="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(te="onCompositionStart");te&&(dy&&a.locale!=="ko"&&(xo||te!=="onCompositionStart"?te==="onCompositionEnd"&&xo&&(F=cy()):(Ei=b,Fm="value"in Ei?Ei.value:Ei.textContent,xo=!0)),Z=Cd(g,te),0<Z.length&&(te=new mb(te,e,null,a,b),N.push({event:te,listeners:Z}),F?te.data=F:(F=hy(a),F!==null&&(te.data=F)))),(F=F5?K5(e,a):W5(e,a))&&(te=Cd(g,"onBeforeInput"),0<te.length&&(Z=new mb("onBeforeInput","beforeinput",null,a,b),N.push({event:Z,listeners:te}),Z.data=F)),FN(N,e,g,a,b)}l0(N,t)})}function bl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function Cd(e,t){for(var a=t+"Capture",i=[];e!==null;){var r=e,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=ll(e,a),r!=null&&i.unshift(bl(e,r,s)),r=ll(e,t),r!=null&&i.push(bl(e,r,s))),e.tag===3)return i;e=e.return}return[]}function WN(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function uv(e,t,a,i,r){for(var s=t._reactName,c=[];a!==null&&a!==i;){var d=a,h=d.alternate,g=d.stateNode;if(d=d.tag,h!==null&&h===i)break;d!==5&&d!==26&&d!==27||g===null||(h=g,r?(g=ll(a,s),g!=null&&c.unshift(bl(a,g,h))):r||(g=ll(a,s),g!=null&&c.push(bl(a,g,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var eS=/\r\n?/g,tS=/\u0000|\uFFFD/g;function hv(e){return(typeof e=="string"?e:""+e).replace(eS,`
`).replace(tS,"")}function d0(e,t){return t=hv(t),hv(e)===t}function at(e,t,a,i,r,s){switch(a){case"children":if(typeof i=="string")t==="body"||t==="textarea"&&i===""||Bo(e,i);else if(typeof i=="number"||typeof i=="bigint")t!=="body"&&Bo(e,""+i);else return;break;case"className":yc(e,"class",i);break;case"tabIndex":yc(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":yc(e,a,i);break;case"style":sy(e,i,s);return;case"data":if(t!=="object"){yc(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=_c(i),e.setAttribute(a,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(t!=="input"&&at(e,t,"name",r.name,r,null),at(e,t,"formEncType",r.formEncType,r,null),at(e,t,"formMethod",r.formMethod,r,null),at(e,t,"formTarget",r.formTarget,r,null)):(at(e,t,"encType",r.encType,r,null),at(e,t,"method",r.method,r,null),at(e,t,"target",r.target,r,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(a);break}i=_c(i),e.setAttribute(a,i);break;case"onClick":i!=null&&(e.onclick=An);return;case"onScroll":i!=null&&Ce("scroll",e);return;case"onScrollEnd":i!=null&&Ce("scrollend",e);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(H(61));if(a=i.__html,a!=null){if(r.children!=null)throw Error(H(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}a=_c(i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":i===!0?e.setAttribute(a,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(a,i):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(a,i):e.removeAttribute(a);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(a):e.setAttribute(a,i);break;case"popover":Ce("beforetoggle",e),Ce("toggle",e),Dc(e,"popover",i);break;case"xlinkActuate":Fn(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":Fn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":Fn(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":Fn(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":Fn(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":Fn(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":Fn(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":Fn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":Fn(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":Dc(e,"is",i);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=$5.get(a)||a,Dc(e,a,i);else return}je=!0}function Om(e,t,a,i,r,s){switch(a){case"style":sy(e,i,s);return;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(H(61));if(a=i.__html,a!=null){if(r.children!=null)throw Error(H(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof i=="string")Bo(e,i);else if(typeof i=="number"||typeof i=="bigint")Bo(e,""+i);else return;break;case"onScroll":i!=null&&Ce("scroll",e);return;case"onScrollEnd":i!=null&&Ce("scrollend",e);return;case"onClick":i!=null&&(e.onclick=An);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!ty.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(r=a.endsWith("Capture"),s=a.slice(2,r?a.length-7:void 0),t=e[Aa]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(s,t,r),typeof i=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(s,i,r);break e}je=!0,a in e?e[a]=i:i===!0?e.setAttribute(a,""):Dc(e,a,i)}return}je=!0}function aa(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Ce("error",e),Ce("load",e);var i=!1,r=!1,s;for(s in a)if(a.hasOwnProperty(s)){var c=a[s];if(c!=null)switch(s){case"src":i=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(H(137,t));default:at(e,t,s,c,a,null)}}r&&at(e,t,"srcSet",a.srcSet,a,null),i&&at(e,t,"src",a.src,a,null);return;case"input":Ce("invalid",e);var d=s=c=r=null,h=null,g=null;for(i in a)if(a.hasOwnProperty(i)){var b=a[i];if(b!=null)switch(i){case"name":r=b;break;case"type":c=b;break;case"checked":h=b;break;case"defaultChecked":g=b;break;case"value":s=b;break;case"defaultValue":d=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(H(137,t));break;default:at(e,t,i,b,a,null)}}iy(e,s,d,h,g,c,r,!1);return;case"select":Ce("invalid",e),i=c=s=null;for(r in a)if(a.hasOwnProperty(r)&&(d=a[r],d!=null))switch(r){case"value":s=d;break;case"defaultValue":c=d;break;case"multiple":i=d;default:at(e,t,r,d,a,null)}t=s,a=c,e.multiple=!!i,t!=null?Ro(e,!!i,t,!1):a!=null&&Ro(e,!!i,a,!0);return;case"textarea":Ce("invalid",e),s=r=i=null;for(c in a)if(a.hasOwnProperty(c)&&(d=a[c],d!=null))switch(c){case"value":i=d;break;case"defaultValue":r=d;break;case"children":s=d;break;case"dangerouslySetInnerHTML":if(d!=null)throw Error(H(91));break;default:at(e,t,c,d,a,null)}oy(e,i,r,s);return;case"option":for(h in a)a.hasOwnProperty(h)&&(i=a[h],i!=null)&&(h==="selected"?e.selected=i&&typeof i!="function"&&typeof i!="symbol":at(e,t,h,i,a,null));return;case"dialog":Ce("beforetoggle",e),Ce("toggle",e),Ce("cancel",e),Ce("close",e);break;case"iframe":case"object":Ce("load",e);break;case"video":case"audio":for(i=0;i<fl.length;i++)Ce(fl[i],e);break;case"image":Ce("error",e),Ce("load",e);break;case"details":Ce("toggle",e);break;case"embed":case"source":case"link":Ce("error",e),Ce("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(i=a[g],i!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(H(137,t));default:at(e,t,g,i,a,null)}return;default:if(Qm(t)){for(b in a)a.hasOwnProperty(b)&&(i=a[b],i!==void 0&&Om(e,t,b,i,a,void 0));return}}for(d in a)a.hasOwnProperty(d)&&(i=a[d],i!=null&&at(e,t,d,i,a,null))}var aS={};function nS(e,t,a,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,c=null,d=null,h=null,g=null,b=null;for(v in a){var N=a[v];if(a.hasOwnProperty(v)&&N!=null)switch(v){case"checked":break;case"value":break;case"defaultValue":h=N;default:i.hasOwnProperty(v)||at(e,t,v,null,i,N)}}for(var f in i){var v=i[f];if(N=a[f],i.hasOwnProperty(f)&&(v!=null||N!=null))switch(f){case"type":v!==N&&(je=!0),s=v;break;case"name":v!==N&&(je=!0),r=v;break;case"checked":v!==N&&(je=!0),g=v;break;case"defaultChecked":v!==N&&(je=!0),b=v;break;case"value":v!==N&&(je=!0),c=v;break;case"defaultValue":v!==N&&(je=!0),d=v;break;case"children":case"dangerouslySetInnerHTML":if(v!=null)throw Error(H(137,t));break;default:v!==N&&at(e,t,f,v,i,N)}}Yh(e,c,d,h,g,b,s,r);return;case"select":v=c=d=f=null;for(s in a)if(h=a[s],a.hasOwnProperty(s)&&h!=null)switch(s){case"value":break;case"multiple":v=h;default:i.hasOwnProperty(s)||at(e,t,s,null,i,h)}for(r in i)if(s=i[r],h=a[r],i.hasOwnProperty(r)&&(s!=null||h!=null))switch(r){case"value":s!==h&&(je=!0),f=s;break;case"defaultValue":s!==h&&(je=!0),d=s;break;case"multiple":s!==h&&(je=!0),c=s;default:s!==h&&at(e,t,r,s,i,h)}t=d,a=c,i=v,f!=null?Ro(e,!!a,f,!1):!!i!=!!a&&(t!=null?Ro(e,!!a,t,!0):Ro(e,!!a,a?[]:"",!1));return;case"textarea":v=f=null;for(d in a)if(r=a[d],a.hasOwnProperty(d)&&r!=null&&!i.hasOwnProperty(d))switch(d){case"value":break;case"children":break;default:at(e,t,d,null,i,r)}for(c in i)if(r=i[c],s=a[c],i.hasOwnProperty(c)&&(r!=null||s!=null))switch(c){case"value":r!==s&&(je=!0),f=r;break;case"defaultValue":r!==s&&(je=!0),v=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(H(91));break;default:r!==s&&at(e,t,c,r,i,s)}ry(e,f,v);return;case"option":for(var V in a)f=a[V],a.hasOwnProperty(V)&&f!=null&&!i.hasOwnProperty(V)&&(V==="selected"?e.selected=!1:at(e,t,V,null,i,f));for(h in i)f=i[h],v=a[h],i.hasOwnProperty(h)&&f!==v&&(f!=null||v!=null)&&(h==="selected"?(f!==v&&(je=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):at(e,t,h,f,i,v));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var M in a)f=a[M],a.hasOwnProperty(M)&&f!=null&&!i.hasOwnProperty(M)&&at(e,t,M,null,i,f);for(g in i)if(f=i[g],v=a[g],i.hasOwnProperty(g)&&f!==v&&(f!=null||v!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(H(137,t));break;default:at(e,t,g,f,i,v)}return;default:if(Qm(t)){for(var O in a)f=a[O],a.hasOwnProperty(O)&&f!==void 0&&!i.hasOwnProperty(O)&&Om(e,t,O,void 0,i,f);for(b in i)f=i[b],v=a[b],!i.hasOwnProperty(b)||f===v||f===void 0&&v===void 0||Om(e,t,b,f,i,v);return}}for(var $ in a)f=a[$],a.hasOwnProperty($)&&f!=null&&!i.hasOwnProperty($)&&at(e,t,$,null,i,f);for(N in i)f=i[N],v=a[N],!i.hasOwnProperty(N)||f===v||f==null&&v==null||at(e,t,N,f,i,v)}function mv(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function iS(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),i=0;i<a.length;i++){var r=a[i],s=r.transferSize,c=r.initiatorType,d=r.duration;if(s&&d&&mv(c)){for(c=0,d=r.responseEnd,i+=1;i<a.length;i++){var h=a[i],g=h.startTime;if(g>d)break;var b=h.transferSize,N=h.initiatorType;b&&mv(N)&&(h=h.responseEnd,c+=b*(h<d?1:(d-g)/(h-g)))}if(--i,t+=8*(s+c)/(r.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Vm=null,Im=null;function vl(e){return e.nodeType===9?e:e.ownerDocument}function pv(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function u0(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function h0(e,t,a,i){return a=vl(a).createElement(e),a[Kt]=i,a[Aa]=t,aa(a,e,t),Zt(a),a}function Dm(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Rh=null;function rS(){var e=window.event;return e&&e.type==="popstate"?e===Rh?!1:(Rh=e,!0):(Rh=null,!1)}var Ip=typeof setTimeout=="function"?setTimeout:void 0,oS=typeof clearTimeout=="function"?clearTimeout:void 0,gv=typeof Promise=="function"?Promise:void 0,fv=typeof requestAnimationFrame=="function"?requestAnimationFrame:Ip,sS=typeof queueMicrotask=="function"?queueMicrotask:typeof gv<"u"?function(e){return gv.resolve(null).then(e).catch(lS)}:Ip;function lS(e){setTimeout(function(){throw e})}function Qi(e){return e==="head"}function bv(e,t){var a=t,i=0;do{var r=a.nextSibling;if(e.removeChild(a),r&&r.nodeType===8)if(a=r.data,a==="/$"||a==="/&"){if(i===0){e.removeChild(r),Fo(t);return}i--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")i++;else if(a==="html")zh(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,zh(a);for(var s=a.firstChild;s;){var c=s.nextSibling,d=s.nodeName;s[Cl]||d==="SCRIPT"||d==="STYLE"||d==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=c}}else a==="body"&&zh(e.ownerDocument.body);a=r}while(a);Fo(t)}function vv(e,t){var a=e;e=0;do{var i=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),i&&i.nodeType===8)if(a=i.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=i}while(a)}function m0(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var i=1;else for(var r=i=0;r<t.length;r++){var s=t[r];0<s.width&&0<s.height&&i++}i===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function p0(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function g0(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function _m(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return g0(t,a,e)}function cS(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return g0(t,a,e)}function dS(e){return e.documentElement.clientHeight}function uS(e){this.addEventListener("load",e),this.addEventListener("error",e)}function hS(e,t,a,i,r,s,c,d,h){var g=t.nodeType===9?t:t.ownerDocument;try{var b=g.startViewTransition({update:function(){var f=g.defaultView,v=f.navigation&&f.navigation.transition,V=g.fonts.status;i();var M=[];if(V==="loaded"&&(dS(g),g.fonts.status==="loading"&&M.push(g.fonts.ready)),V=M.length,e!==null)for(var O=e.suspenseyImages,$=0,w=0;w<O.length;w++){var y=O[w];if(!y.complete){var R=y.getBoundingClientRect();if(0<R.bottom&&0<R.right&&R.top<f.innerHeight&&R.left<f.innerWidth){if($+=C0(y),$>Kc){M.length=V;break}y=new Promise(uS.bind(y)),M.push(y)}}}if(0<M.length)return f=Promise.race([Promise.all(M),new Promise(function(U){return setTimeout(U,500)})]).then(r,r),(v?Promise.allSettled([v.finished,f]):f).then(s,s);if(r(),v)return v.finished.then(s,s);s()},types:a});g.__reactViewTransition=b;var N=[];return b.ready.then(function(){for(var f=g.documentElement.getAnimations({subtree:!0}),v=0;v<f.length;v++){var V=f[v],M=V.effect,O=M.pseudoElement;if(O!=null&&O.startsWith("::view-transition")){N.push(V),V=M.getKeyframes();for(var $=O=void 0,w=!0,y=0;y<V.length;y++){var R=V[y],U=R.width;if(O===void 0)O=U;else if(O!==U){w=!1;break}if(U=R.height,$===void 0)$=U;else if($!==U){w=!1;break}delete R.width,delete R.height,R.transform==="none"&&delete R.transform}w&&O!==void 0&&$!==void 0&&(M.setKeyframes(V),w=getComputedStyle(M.target,M.pseudoElement),w.width!==O||w.height!==$)&&(w=V[0],w.width=O,w.height=$,w=V[V.length-1],w.width=O,w.height=$,M.setKeyframes(V))}}c()},function(f){g.__reactViewTransition===b&&(g.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{i(),r(),c()}}),b.finished.finally(function(){for(var f=0;f<N.length;f++)N[f].cancel();g.__reactViewTransition===b&&(g.__reactViewTransition=null),d()}),b}catch{return i(),r(),c(),null}}function fr(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}fr.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:lt({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};fr.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),i=[],r=0;r<a.length;r++){var s=a[r].effect;s!==null&&s.target===e&&s.pseudoElement===t&&i.push(a[r])}return i};fr.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function f0(e){return{name:e,group:new fr("group",e),imagePair:new fr("image-pair",e),old:new fr("old",e),new:new fr("new",e)}}function Ba(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}Ba.prototype.addEventListener=function(e,t,a){var i=null,r=null;if(!(a!=null&&typeof a!="boolean"&&(i=a.signal||null,i!==null&&i.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var s=this._eventListeners;if(b0(s,e,t,a)===-1){var c=this,d=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(d=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),i!==null&&(r=c.removeEventListener.bind(c,e,t,a),i.addEventListener("abort",r,{once:!0}),r=i.removeEventListener.bind(i,"abort",r)),i=Po(a),s.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:d,cleanup:r}),Ea(this._fragmentFiber.child,!1,mS,e,d,i)}this._eventListeners=s}};function mS(e,t,a,i){return jt(e).addEventListener(t,a,i),!1}Ba.prototype.removeEventListener=function(e,t,a){var i=this._eventListeners;if(i!==null&&(t=b0(i,e,t,a),t!==-1)){var r=i[t];a=r.attachedListener;var s=r.cleanup;r=Po(r.optionsOrUseCapture),Ea(this._fragmentFiber.child,!1,pS,e,a,r),i.splice(t,1),s!==null&&s()}};function pS(e,t,a,i){return jt(e).removeEventListener(t,a,i),!1}function Po(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function yv(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function b0(e,t,a,i){if(e.length===0)return-1;i=yv(i);for(var r=0;r<e.length;r++){var s=e[r];if(s.type===t&&s.listener===a&&yv(s.optionsOrUseCapture)===i)return r}return-1}Ba.prototype.dispatchEvent=function(e){var t=Rr(this._fragmentFiber);if(t===null)return!0;t=jt(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var i=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var r=0;r<a.length;r++){var s=a[r];i.addEventListener(s.type,s.attachedListener,Po(s.optionsOrUseCapture))}if(t.appendChild(i),e=i.dispatchEvent(e),a)for(r=0;r<a.length;r++)s=a[r],i.removeEventListener(s.type,s.attachedListener,Po(s.optionsOrUseCapture));return t.removeChild(i),e}return t.dispatchEvent(e)};Ba.prototype.focus=function(e){Ea(this._fragmentFiber.child,!0,v0,e,void 0,void 0)};function v0(e,t){return e.tag===6?!1:(e=jt(e),TS(e,t))}Ba.prototype.focusLast=function(e){var t=[];Ea(this._fragmentFiber.child,!0,Dp,t,void 0,void 0);for(var a=t.length-1;0<=a&&!v0(t[a],e);a--);};function Dp(e,t){return t.push(e),!1}Ba.prototype.blur=function(){var e=Rr(this._fragmentFiber);e!==null&&(e=jt(e),e=vl(e).activeElement,e!==null&&Ea(this._fragmentFiber.child,!1,gS,e,void 0,void 0))};function gS(e,t){return e.tag===6?!1:(e=jt(e),e===t||e.contains(t)?(t.blur(),!0):!1)}Ba.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Ea(this._fragmentFiber.child,!1,fS,e,void 0,void 0)};function fS(e,t){return e.tag===6||(e=jt(e),t.observe(e)),!1}Ba.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Ea(this._fragmentFiber.child,!1,bS,e,void 0,void 0);for(var a=t=0;a<hn.length;a++){var i=hn[a];i.fragmentInstance===this&&i.observer===e?e.unobserve(i.instance):hn[t++]=i}hn.length=t}};function bS(e,t){return e.tag===6||(e=jt(e),t.unobserve(e)),!1}var hn=[],Mh=!1;function vS(e,t,a){hn.push({fragmentInstance:e,observer:t,instance:a}),Mh||(Mh=!0,CS(function(){Mh=!1;var i=hn;hn=[];for(var r=0;r<i.length;r++){var s=i[r];s.observer.unobserve(s.instance)}}))}Ba.prototype.getClientRects=function(){var e=[];return Ea(this._fragmentFiber.child,!1,yS,e,void 0,void 0),e};function yS(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=jt(e),t.push.apply(t,e.getClientRects());return!1}Ba.prototype.getRootNode=function(e){var t=Rr(this._fragmentFiber);return t===null?this:jt(t).getRootNode(e)};Ba.prototype.compareDocumentPosition=function(e){var t=Rr(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Ea(this._fragmentFiber.child,!1,Dp,a,void 0,void 0);var i=jt(t);if(a.length===0){if(a=i,Kf(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var r=i=a.compareDocumentPosition(e);return a===e?r=Node.DOCUMENT_POSITION_CONTAINS:i&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=qv(t)[1],a===null?r=Node.DOCUMENT_POSITION_PRECEDING:(e=jt(a).compareDocumentPosition(e),r=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),r|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=jt(a[0]),r=jt(a[a.length-1]);var s=Kf(this._fragmentFiber)?t.parentElement:i;if(s==null)return Node.DOCUMENT_POSITION_DISCONNECTED;i=s.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,s=s.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),d=r.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||d&Node.DOCUMENT_POSITION_CONTAINED_BY;return d=i&&s&&c&Node.DOCUMENT_POSITION_FOLLOWING&&d&Node.DOCUMENT_POSITION_PRECEDING,t=i&&t===e||s&&r===e||h||d?Node.DOCUMENT_POSITION_CONTAINED_BY:!i&&t===e||!s&&r===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||wS(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function wS(e,t,a,i,r){var s=gr(r);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!s)e:{for(;s!==null;){if(s.tag===7&&(s===t||s.alternate===t)){a=!0;break e}s=s.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(s===null)return s=r.ownerDocument,r===s||r===s.documentElement||r===s.body;e:{for(s=t,t=Rr(t);s!==null;){if(!(s.tag!==5&&s.tag!==3&&s.tag!==27||s!==t&&s.alternate!==t)){s=!0;break e}s=s.return}s=!1}return s}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!s)&&!(t=s===a)&&(t=Vh(a,s,Wf),t===null?t=!1:(Ea(t,!0,J$,s,a),s=bo,bo=null,t=s!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!s)&&!(t=s===i)&&(t=Vh(i,s,Wf),t===null?t=!1:(Ea(t,!0,F$,s,i),s=bo,Oh=bo=null,t=s!==null)),t):!1}function wv(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}Ba.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(H(566));var t=[];Ea(this._fragmentFiber.child,!1,Dp,t,void 0,void 0);var a=e!==!1;if(t.length===0){var i=qv(this._fragmentFiber);if(i=a?i[1]||i[0]||Rr(this._fragmentFiber):i[0]||i[1],i===null)return;if(i.tag===6){e=jt(i),wv(e,a);return}if(i=jt(i),i.nodeType!==9){if(i.nodeType===11){a="host"in i?i.host:null,a!==null&&a.scrollIntoView(e);return}i.scrollIntoView(e)}}for(i=a?t.length-1:0;i!==(a?-1:t.length);){var r=t[i];r.tag===6?(r=jt(r),wv(r,a)):jt(r).scrollIntoView(e),i+=a?-1:1}};function xS(e,t){return e=jt(e),y0(e,t),!1}function y0(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function w0(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i];e.addEventListener(r.type,r.attachedListener,Po(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){for(var c=0,d=0;d<hn.length;d++){var h=hn[d];(h.fragmentInstance!==t||h.observer!==s||h.instance!==e)&&(hn[c++]=h)}hn.length=c,s.observe(e)}),y0(e,t))}function $S(e,t){var a=t._eventListeners;if(a!==null)for(var i=0;i<a.length;i++){var r=a[i];e.removeEventListener(r.type,r.attachedListener,Po(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){typeof s.rootMargin=="string"?vS(t,s,e):s.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function Hm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Hm(a),Md(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function NS(e,t,a,i){for(;e.nodeType===1;){var r=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[Cl])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(s=e.getAttribute("rel"),s==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(s!==r.rel||e.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||e.getAttribute("title")!==(r.title==null?null:r.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(s=e.getAttribute("src"),(s!==(r.src==null?null:r.src)||e.getAttribute("type")!==(r.type==null?null:r.type)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&e.getAttribute("name")===s)return e}else return e;if(e=an(e.nextSibling),e===null)break}return null}function SS(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=an(e.nextSibling),e===null))return null;return e}function x0(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=an(e.nextSibling),e===null))return null;return e}function Um(e){return e.data==="$?"||e.data==="$~"}function _p(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function kS(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var i=function(){t(),a.removeEventListener("DOMContentLoaded",i)};a.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function an(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var qm=null;function xv(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return an(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function $v(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function TS(e,t){function a(){i=!0}if(e.ownerDocument.activeElement===e)return!0;var i=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return i}function CS(e){fv(function(){fv(function(t){return e(t)})})}function $0(e,t,a){switch(t=vl(a),e){case"html":if(e=t.documentElement,!e)throw Error(H(452));return e;case"head":if(e=t.head,!e)throw Error(H(453));return e;case"body":if(e=t.body,!e)throw Error(H(454));return e;default:throw Error(H(451))}}function N0(e,t,a){for(var i in a){var r=a[i];a.hasOwnProperty(i)&&r!=null&&at(e,t,i,null,aS,r)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===An&&(e.onclick=null),Md(e)}function zh(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Md(e)}var nn=new Map,Nv=new Set;function yl(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var ui=Xe.d;Xe.d={f:ES,r:AS,D:RS,C:MS,L:zS,m:OS,X:IS,S:VS,M:DS};function ES(){var e=ui.f(),t=Yd();return e||t}function AS(e){var t=Wo(e);t!==null&&t.tag===5&&t.type==="form"?sw(t):ui.r(e)}var ns=typeof document>"u"?null:document;function S0(e,t,a){var i=ns;if(i&&typeof t=="string"&&t){var r=Wa(t);r='link[rel="'+e+'"][href="'+r+'"]',typeof a=="string"&&(r+='[crossorigin="'+a+'"]'),Nv.has(r)||(Nv.add(r),e={rel:e,crossOrigin:a,href:t},i.querySelector(r)===null&&(t=i.createElement("link"),aa(t,"link",e),Zt(t),i.head.appendChild(t)))}}function RS(e){ui.D(e),S0("dns-prefetch",e,null)}function MS(e,t){ui.C(e,t),S0("preconnect",e,t)}function zS(e,t,a){ui.L(e,t,a);var i=ns;if(i&&e&&t){var r='link[rel="preload"][as="'+Wa(t)+'"]';t==="image"&&a&&a.imageSrcSet?(r+='[imagesrcset="'+Wa(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(r+='[imagesizes="'+Wa(a.imageSizes)+'"]')):r+='[href="'+Wa(e)+'"]';var s=r;switch(t){case"style":s=Zo(e);break;case"script":s=is(e)}if(!(nn.has(s)||(e=lt({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),nn.set(s,e),i.querySelector(r)!==null||t==="style"&&i.querySelector(Ol(s))||t==="script"&&i.querySelector(Vl(s))))){var c=i.createElement("link");aa(c,"link",e),t==="style"&&(c[rd]=!0,c.onload=c.onerror=function(){Wv(c)}),Zt(c),i.head.appendChild(c)}}}function OS(e,t){ui.m(e,t);var a=ns;if(a&&e){var i=t&&typeof t.as=="string"?t.as:"script",r='link[rel="modulepreload"][as="'+Wa(i)+'"][href="'+Wa(e)+'"]',s=r;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=is(e)}if(!nn.has(s)&&(e=lt({rel:"modulepreload",href:e},t),nn.set(s,e),a.querySelector(r)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Vl(s)))return}i=a.createElement("link"),aa(i,"link",e),Zt(i),a.head.appendChild(i)}}}function VS(e,t,a){ui.S(e,t,a);var i=ns;if(i&&e){var r=Ao(i).hoistableStyles,s=Zo(e);t=t||"default";var c=r.get(s);if(!c){var d={loading:0,preload:null};if(c=i.querySelector(Ol(s)))d.loading=5;else{e=lt({rel:"stylesheet",href:e,"data-precedence":t},a),(a=nn.get(s))&&Hp(e,a);var h=c=i.createElement("link");Zt(h),aa(h,"link",e),h._p=new Promise(function(g,b){h.onload=g,h.onerror=b}),h.addEventListener("load",function(){d.loading|=1}),h.addEventListener("error",function(){d.loading|=2}),d.loading|=4,Jc(c,t,i)}c={type:"stylesheet",instance:c,count:1,state:d},r.set(s,c)}}}function IS(e,t){ui.X(e,t);var a=ns;if(a&&e){var i=Ao(a).hoistableScripts,r=is(e),s=i.get(r);s||(s=a.querySelector(Vl(r)),s||(e=lt({src:e,async:!0},t),(t=nn.get(r))&&Up(e,t),s=a.createElement("script"),Zt(s),aa(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function DS(e,t){ui.M(e,t);var a=ns;if(a&&e){var i=Ao(a).hoistableScripts,r=is(e),s=i.get(r);s||(s=a.querySelector(Vl(r)),s||(e=lt({src:e,async:!0,type:"module"},t),(t=nn.get(r))&&Up(e,t),s=a.createElement("script"),Zt(s),aa(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},i.set(r,s))}}function Sv(e,t,a,i){var r=(r=Oi.current)?yl(r):null;if(!r)throw Error(H(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=Zo(a.href),t=Ao(r).hoistableStyles,i=t.get(a),i||(i={type:"style",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=Zo(a.href);var s=Ao(r).hoistableStyles,c=s.get(e);if(c||(r=r.ownerDocument||r,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(e,c),(s=r.querySelector(Ol(e)))?s._p||(c.instance=s,c.state.loading=5):(s=nn.get(e),s||(s={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},nn.set(e,s)),_S(r,e,s,c.state))),t&&i===null)throw Error(H(528,""));return c}if(t&&i!==null)throw Error(H(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=is(a),t=Ao(r).hoistableScripts,i=t.get(a),i||(i={type:"script",instance:null,count:0,state:null},t.set(a,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(H(444,e))}}function Zo(e){return'href="'+Wa(e)+'"'}function Ol(e){return'link[rel="stylesheet"]['+e+"]"}function k0(e){return lt({},e,{"data-precedence":e.precedence,precedence:null})}function _S(e,t,a,i){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[rd]!==!0){i.loading=1;return}}else t=e.createElement("link"),t[rd]=!0,t.onload=t.onerror=Wv.bind(null,t),aa(t,"link",a),Zt(t),e.head.appendChild(t);i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2})}function is(e){return'[src="'+Wa(e)+'"]'}function Vl(e){return"script[async]"+e}function kv(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+Wa(a.href)+'"]');if(i)return t.instance=i,Zt(i),i;var r=lt({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),Zt(i),aa(i,"style",r),Jc(i,a.precedence,e),t.instance=i;case"stylesheet":r=Zo(a.href);var s=e.querySelector(Ol(r));if(s)return t.state.loading|=4,t.instance=s,Zt(s),s;i=k0(a),(r=nn.get(r))&&Hp(i,r),s=(e.ownerDocument||e).createElement("link"),Zt(s);var c=s;return c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),aa(s,"link",i),t.state.loading|=4,Jc(s,a.precedence,e),t.instance=s;case"script":return s=is(a.src),(r=e.querySelector(Vl(s)))?(t.instance=r,Zt(r),r):(i=a,(r=nn.get(s))&&(i=lt({},a),Up(i,r)),e=e.ownerDocument||e,r=e.createElement("script"),Zt(r),aa(r,"link",i),e.head.appendChild(r),t.instance=r);case"void":return null;default:throw Error(H(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Jc(i,a.precedence,e));return t.instance}function Jc(e,t,a){for(var i=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=i.length?i[i.length-1]:null,s=r,c=0;c<i.length;c++){var d=i[c];if(d.dataset.precedence===t)s=d;else if(s!==r)break}s?s.parentNode.insertBefore(e,s.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function Hp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Up(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Fc=null;function Tv(e,t,a){if(Fc===null){var i=new Map,r=Fc=new Map;r.set(a,i)}else r=Fc,i=r.get(a),i||(i=new Map,r.set(a,i));if(i.has(e))return i;for(i.set(e,null),a=a.getElementsByTagName(e),r=0;r<a.length;r++){var s=a[r];if(!(s[Cl]||s[Kt]||e==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var c=s.getAttribute(t)||"";c=e+c;var d=i.get(c);d?d.push(s):i.set(c,[s])}}return i}function Bm(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function HS(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Cv(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function T0(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function C0(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Ev(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=C0(t),e.suspenseyImages.push(t)),e=BS.bind(e),t.decode().then(e,e))}function US(e,t,a,i){if(a.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var r=Zo(i.href),s=t.querySelector(Ol(r));if(s){t=s._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=wl.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=s,Zt(s);return}s=t.ownerDocument||t,i=k0(i),(r=nn.get(r))&&Hp(i,r),s=s.createElement("link"),Zt(s);var c=s;c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),aa(s,"link",i),a.instance=s}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=wl.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Kc=0;function qS(e,t){return e.stylesheets&&e.count===0&&Wc(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var i=setTimeout(function(){if(e.stylesheets&&Wc(e,e.stylesheets),e.unsuspend){var s=e.unsuspend;e.unsuspend=null,s()}},6e4+t);0<e.imgBytes&&Kc===0&&(Kc=62500*iS());var r=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Wc(e,e.stylesheets),e.unsuspend)){var s=e.unsuspend;e.unsuspend=null,s()}},(e.imgBytes>Kc?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(r)}}:null}function E0(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)Wc(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function wl(){this.count--,E0(this)}function BS(){this.imgCount--,E0(this)}var Ed=null;function Wc(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Ed=new Map,t.forEach(LS,e),Ed=null,wl.call(e))}function LS(e,t){if(!(t.state.loading&4)){var a=Ed.get(e);if(a)var i=a.get(null);else{a=new Map,Ed.set(e,a);for(var r=e.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var c=r[s];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),i=c)}i&&a.set(null,i)}r=t.instance,c=r.getAttribute("data-precedence"),s=a.get(c)||i,s===i&&a.set(null,r),a.set(c,r),this.count++,i=wl.bind(this),r.addEventListener("load",i),r.addEventListener("error",i),s?s.parentNode.insertBefore(r,s.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(r,e.firstChild)),t.state.loading|=4}}var Qo={$$typeof:En,Provider:null,Consumer:null,_currentValue:br,_currentValue2:br,_threadCount:0};function jS(e,t,a,i,r,s,c,d,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=oh(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=oh(0),this.hiddenUpdates=oh(null),this.identifierPrefix=i,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function A0(e,t,a,i,r,s,c,d,h,g,b,N){return e=new jS(e,t,a,c,h,g,b,N,d),t=1,s===!0&&(t|=24),s=Ta(3,null,null,t),e.current=s,s.stateNode=e,t=rp(),t.refCount++,e.pooledCache=t,t.refCount++,s.memoizedState={element:i,isDehydrated:a,cache:t},lp(s),e}function R0(e){return e?(e=ko,e):ko}function M0(e,t,a,i,r,s){r=R0(r),i.context===null?i.context=r:i.pendingContext=r,i=Ii(t),i.payload={element:a},s=s===void 0?null:s,s!==null&&(i.callback=s),a=Di(e,i,t),a!==null&&(Ca(a,e,t),Ks(a,e,t))}function Av(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function qp(e,t){Av(e,t),(e=e.alternate)&&Av(e,t)}function z0(e){if(e.tag===13||e.tag===31){var t=Or(e,67108864);t!==null&&Ca(t,e,67108864),qp(e,67108864)}}function Rv(e){if(e.tag===13||e.tag===31){var t=Ua();t=Pm(t);var a=Or(e,t);a!==null&&Ca(a,e,t),qp(e,t)}}var Jo=!0;function GS(e,t,a,i){var r=ge.T;ge.T=null;var s=Xe.p;try{Xe.p=2,Bp(e,t,a,i)}finally{Xe.p=s,ge.T=r}}function YS(e,t,a,i){var r=ge.T;ge.T=null;var s=Xe.p;try{Xe.p=8,Bp(e,t,a,i)}finally{Xe.p=s,ge.T=r}}function Bp(e,t,a,i){if(Jo){var r=Lm(i);if(r===null)Ah(e,t,i,Ad,a),Mv(e,i);else if(PS(r,e,t,a,i))i.stopPropagation();else if(Mv(e,i),t&4&&-1<XS.indexOf(e)){for(;r!==null;){var s=Wo(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var c=hr(s.pendingLanes);if(c!==0){var d=s;for(d.pendingLanes|=2,d.entangledLanes|=2;c;){var h=1<<31-Ha(c);d.entanglements[1]|=h,c&=~h}Dn(s),(Ye&6)===0&&(Nd=Da()+500,zl(0,!1))}}break;case 31:case 13:d=Or(s,2),d!==null&&Ca(d,s,2),Yd(),qp(s,2)}if(s=Lm(i),s===null&&Ah(e,t,i,Ad,a),s===r)break;r=s}r!==null&&i.stopPropagation()}else Ah(e,t,i,null,a)}}function Lm(e){return e=Jm(e),Lp(e)}var Ad=null;function Lp(e){if(Ad=null,e=gr(e),e!==null){var t=Nl(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=_v(t),e!==null)return e;e=null}else if(a===31){if(e=Hv(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return Ad=e,null}function O0(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(o5()){case Gv:return 2;case Yv:return 8;case id:case s5:return 32;case Xv:return 268435456;default:return 32}default:return 32}}var jm=!1,qi=null,Bi=null,Li=null,xl=new Map,$l=new Map,Ti=[],XS="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Mv(e,t){switch(e){case"focusin":case"focusout":qi=null;break;case"dragenter":case"dragleave":Bi=null;break;case"mouseover":case"mouseout":Li=null;break;case"pointerover":case"pointerout":xl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":$l.delete(t.pointerId)}}function Bs(e,t,a,i,r,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:a,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},t!==null&&(t=Wo(t),t!==null&&z0(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),e)}function PS(e,t,a,i,r){switch(t){case"focusin":return qi=Bs(qi,e,t,a,i,r),!0;case"dragenter":return Bi=Bs(Bi,e,t,a,i,r),!0;case"mouseover":return Li=Bs(Li,e,t,a,i,r),!0;case"pointerover":var s=r.pointerId;return xl.set(s,Bs(xl.get(s)||null,e,t,a,i,r)),!0;case"gotpointercapture":return s=r.pointerId,$l.set(s,Bs($l.get(s)||null,e,t,a,i,r)),!0}return!1}function V0(e){var t=gr(e.target);if(t!==null){var a=Nl(t);if(a!==null){if(t=a.tag,t===13){if(t=_v(a),t!==null){e.blockedOn=t,nb(e.priority,function(){Rv(a)});return}}else if(t===31){if(t=Hv(a),t!==null){e.blockedOn=t,nb(e.priority,function(){Rv(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function ed(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=Lm(e.nativeEvent);if(a===null){a=e.nativeEvent;var i=new a.constructor(a.type,a);Xh=i,a.target.dispatchEvent(i),Xh=null}else return t=Wo(a),t!==null&&z0(t),e.blockedOn=a,!1;t.shift()}return!0}function zv(e,t,a){ed(e)&&a.delete(t)}function ZS(){jm=!1,qi!==null&&ed(qi)&&(qi=null),Bi!==null&&ed(Bi)&&(Bi=null),Li!==null&&ed(Li)&&(Li=null),xl.forEach(zv),$l.forEach(zv)}function Vc(e,t){e.blockedOn===t&&(e.blockedOn=null,jm||(jm=!0,Gt.unstable_scheduleCallback(Gt.unstable_NormalPriority,ZS)))}var Ic=null;function Ov(e){Ic!==e&&(Ic=e,Gt.unstable_scheduleCallback(Gt.unstable_NormalPriority,function(){Ic===e&&(Ic=null);for(var t=0;t<e.length;t+=3){var a=e[t],i=e[t+1],r=e[t+2];if(typeof i!="function"){if(Lp(i||a)===null)continue;break}var s=Wo(a);s!==null&&(e.splice(t,3),t-=3,lm(s,{pending:!0,data:r,method:a.method,action:i},i,r))}}))}function Fo(e){function t(h){return Vc(h,e)}qi!==null&&Vc(qi,e),Bi!==null&&Vc(Bi,e),Li!==null&&Vc(Li,e),xl.forEach(t),$l.forEach(t);for(var a=0;a<Ti.length;a++){var i=Ti[a];i.blockedOn===e&&(i.blockedOn=null)}for(;0<Ti.length&&(a=Ti[0],a.blockedOn===null);)V0(a),a.blockedOn===null&&Ti.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(i=0;i<a.length;i+=3){var r=a[i],s=a[i+1],c=r[Aa]||null;if(typeof s=="function")c||Ov(a);else if(c){var d=null;if(s&&s.hasAttribute("formAction")){if(r=s,c=s[Aa]||null)d=c.formAction;else if(Lp(r)!==null)continue}else d=c.action;typeof d=="function"?a[i+1]=d:(a.splice(i,3),i-=3),Ov(a)}}}function I0(){function e(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(c){return r=c})},focusReset:"manual",scroll:"manual"})}function t(){r!==null&&(r(),r=null),i||setTimeout(a,20)}function a(){if(!i&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,r=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),r!==null&&(r(),r=null)}}}function jp(e){this._internalRoot=e}Zd.prototype.render=jp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(H(409));var a=t.current,i=Ua();M0(a,i,e,t,null,null)};Zd.prototype.unmount=jp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;M0(e.current,2,null,e,null,null),Yd(),t[Ko]=null}};function Zd(e){this._internalRoot=e}Zd.prototype.unstable_scheduleHydration=function(e){if(e){var t=Kv();e={blockedOn:null,target:e,priority:t};for(var a=0;a<Ti.length&&t!==0&&t<Ti[a].priority;a++);Ti.splice(a,0,e),a===0&&V0(e)}};var Vv=Iv.version;if(Vv!=="19.3.0")throw Error(H(527,Vv,"19.3.0"));Xe.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(H(188)):(e=Object.keys(e).join(","),Error(H(268,e)));return e=Q$(t),e=e!==null?Uv(e):null,e=e===null?null:e.stateNode,e};var QS={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:ge,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Ls=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ls.isDisabled&&Ls.supportsFiber))try{Sl=Ls.inject(QS),_a=Ls}catch{}var Ls;Qd.createRoot=function(e,t){if(!Dv(e))throw Error(H(299));var a=!1,i="",r=gw,s=fw,c=bw;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(r=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=A0(e,1,!1,null,null,a,i,null,r,s,c,I0),e[Ko]=t.current,Vp(e),new jp(t)};Qd.hydrateRoot=function(e,t,a){if(!Dv(e))throw Error(H(299));var i=!1,r="",s=gw,c=fw,d=bw,h=null;return a!=null&&(a.unstable_strictMode===!0&&(i=!0),a.identifierPrefix!==void 0&&(r=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(d=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=A0(e,1,!0,t,a??null,i,r,h,s,c,d,I0),t.context=R0(null),a=t.current,i=Ua(),i=Pm(i),r=Ii(i),r.callback=null,Di(a,r,i),a=i,t.current.lanes=a,Tl(t,a),Dn(t),e[Ko]=t.current,Vp(e),new Zd(t)};Qd.version="19.3.0"});var U0=xn(($k,H0)=>{"use strict";function _0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(_0)}catch(e){console.error(e)}}_0(),H0.exports=D0()});function cf(e,t,a){let i=t*a;if(!i||e.length!==i*4)return!1;let r=e.slice(),s=Math.max(1,Math.ceil(t*.18)),c=Math.max(1,Math.ceil(a*.18)),d=Math.max(1,Math.floor(Math.sqrt(i/4e4))),h=new Map,g=0;for(let A=0;A<a;A+=d)for(let X=0;X<t;X+=d){if(X>=s&&X<t-s&&A>=c&&A<a-c)continue;let Y=(A*t+X)*4;if(e[Y+3]<128)continue;g++;let le=[e[Y],e[Y+1],e[Y+2]];if(Math.max(...le)<180||Math.max(...le)-Math.min(...le)<140)continue;let $e=le.map(_e=>Math.floor(_e/32)).join(":"),Ze=h.get($e)??{rgb:[0,0,0],count:0};for(let _e=0;_e<3;_e++)Ze.rgb[_e]+=le[_e];Ze.count++,h.set($e,Ze)}let b=[...h.values()].sort((A,X)=>X.count-A.count)[0];if(!b||b.count<Math.max(4,g*.25))return!1;let N=b.rgb.map(A=>A/b.count),f=new Float32Array(i);for(let A=0;A<i;A++)f[A]=Math.hypot(r[A*4]-N[0],r[A*4+1]-N[1],r[A*4+2]-N[2]);let v=A=>f[A],V=new Set;for(let A=0;A<a;A+=d)for(let X=0;X<t;X+=d){if(X>=s&&X<t-s&&A>=c&&A<a-c)continue;let Y=A*t+X;e[Y*4+3]>128&&v(Y)<28&&V.add((X>=t/2?1:0)+(A>=a/2?2:0))}if(V.size<3)return!1;let M=new Uint8Array(i),O=new Int32Array(i),$=0,w=0,y=t,R=-1,U=a,Z=-1;for(let A=0;A<i;A++)e[A*4+3]===0||v(A)>=28||(M[A]=1,O[w++]=A,y=Math.min(y,A%t),R=Math.max(R,A%t),U=Math.min(U,Math.floor(A/t)),Z=Math.max(Z,Math.floor(A/t)));let F=(A,X)=>{A%t>0&&X(A-1),A%t<t-1&&X(A+1),A>=t&&X(A-t),A<i-t&&X(A+t)};for(;$<w;)F(O[$++],A=>{M[A]||e[A*4+3]===0||v(A)>=90||(M[A]=1,O[w++]=A)});let te=N.map((A,X)=>({value:A,index:X})).filter(({value:A})=>A>Math.max(...N)-48),ye=N.map((A,X)=>({value:A,index:X})).filter(({value:A})=>A<Math.min(...N)+48),oe=new Float32Array(i),Pe=new Uint8Array(i);for(let A=0;A<i;A++){let X=255,Y=0,le=0;for(let{index:$e}of te)X=Math.min(X,r[A*4+$e]),Y=Math.max(Y,r[A*4+$e]);for(let{index:$e}of ye)le=Math.max(le,r[A*4+$e]);oe[A]=X-le,Pe[A]=X-le>8&&Y-X<48?1:0}let qe=A=>oe[A],yt=new Uint8Array(i);for(let A=0;A<i;A++){if(yt[A]||M[A]||e[A*4+3]===0)continue;$=0,w=1,O[0]=A,yt[A]=1;let X=!0;for(;$<w;){let Y=O[$++];X&&(X=qe(Y)>8&&v(Y)<180),F(Y,le=>{yt[le]||M[le]||e[le*4+3]===0||(yt[le]=1,O[w++]=le)})}if(w<=16&&X)for(let Y=0;Y<w;Y++)M[O[Y]]=1}let Oe=Math.min(12,Math.max(6,Math.ceil(Math.min(t,a)/32))),ct=new Uint8Array(i);$=0,w=0;for(let A=0;A<i;A++)(M[A]||e[A*4+3]===0)&&(ct[A]=1,O[w++]=A);for(;$<w;){let A=O[$++];ct[A]>Oe*2||F(A,X=>{ct[X]||(ct[X]=ct[A]+1,O[w++]=X)})}for(let A=0;A<i;A++){if(M[A]||!ct[A]||ct[A]>Oe+1||e[A*4+3]===0)continue;let X=A%t,Y=Math.floor(A/t),le=r[A*4]-N[0],$e=r[A*4+1]-N[1],Ze=r[A*4+2]-N[2],_e,W=1,St=1/0,Dt=!!Pe[A],ot=Dt?Oe*2:Oe,dt=v(A)+8,Qe=qe(A)-8;e:for(let Ve=Math.max(0,Y-ot);Ve<=Math.min(a-1,Y+ot);Ve++)for(let ut=Math.max(0,X-ot);ut<=Math.min(t-1,X+ot);ut++){let ie=Ve*t+ut;if(M[ie]||r[ie*4+3]<=128||Pe[ie]&&ct[ie]&&ct[ie]<=Oe*2||qe(ie)>=Qe||v(ie)<=dt)continue;let Ae=r[ie*4]-N[0],me=r[ie*4+1]-N[1],Je=r[ie*4+2]-N[2],Be=Math.max(0,Math.min(1,(Ae*le+me*$e+Je*Ze)/(Ae*Ae+me*me+Je*Je))),D=le-Be*Ae,G=$e-Be*me,ae=Ze-Be*Je,we=D*D+G*G+ae*ae;if(we<St&&(St=we,W=Be,_e=[r[ie*4],r[ie*4+1],r[ie*4+2]],St<1e-6))break e}if(!_e){Dt&&v(A)<180&&(e[A*4+3]=0);continue}if(Dt){let Ve=Math.min(...te.map(({index:ie})=>_e[ie]))-Math.max(...ye.map(({index:ie})=>_e[ie])),ut=Math.min(...te.map(({value:ie})=>ie))-Math.max(...ye.map(({value:ie})=>ie));W=Math.max(0,Math.min(1,(ut-qe(A))/(ut-Ve)))}else if(St>64||W>=.98)continue;if(e[A*4+3]=Math.round(r[A*4+3]*W),_e)for(let Ve=0;Ve<3;Ve++)e[A*4+Ve]=_e[Ve]}let Et=A=>A.filter(X=>M[X]).length/A.length,qt=y<=t*.1&&R>=t*.9-1&&U<=a*.1&&Z>=a*.9-1&&Et(Array.from({length:R-y+1},(A,X)=>U*t+y+X))>.7&&Et(Array.from({length:R-y+1},(A,X)=>Z*t+y+X))>.7&&Et(Array.from({length:Z-U+1},(A,X)=>(U+X)*t+y))>.7&&Et(Array.from({length:Z-U+1},(A,X)=>(U+X)*t+R))>.7;for(let A=0;A<i;A++){let X=A%t,Y=Math.floor(A/t),le=A*4,$e=[e[le],e[le+1],e[le+2]];(M[A]||qt&&(X<y||X>R||Y<U||Y>Z)&&(Math.max(...$e)<100&&Math.max(...$e)-Math.min(...$e)<50||qe(A)>8))&&(e[le+3]=0)}return!0}var Se=cr(Ms());var Xu={PAPERCRAFT:"Faithfully preserve the source character\u2019s design, clothing, colors, anatomy, and identifying features. Render as a handcrafted 2D papercraft game character: simplified cartoon proportions, bold clean near-black outlines, and a distinct thin off-white paper-cut border around the entire silhouette. Construct the character from flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply a clearly visible matte handmade paper texture with fine fibers and gentle printed color variation across the entire character. Slightly imperfect physical cut edges. Clean, expressive, polished storybook character design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. The result should look like a physical illustrated paper character assembled from printed cutouts.",BATTLEHIGHWAY:"Use the reference image ONLY as a character-design reference for identity, species/anatomy, core outfit, colors, proportions, and defining features. Redraw the character strictly in the visual style of early-2000s Sonic Battle character art. Reconstruct the character from bold angular graphic shapes, not smooth modern anatomy. Use exaggerated proportions, a strong asymmetrical silhouette, and slightly hand-drawn, irregular contours. Build the design from large faceted masses, wedges, spikes, tapered limbs, and simplified shape clusters. Do not just take normal anatomy and make it slightly angular. Use thick dark outer outlines and selective thinner interior lines to divide important forms only. Group repeated details like feathers, fur, hair, folds, fingers, and accessories into a few large simplified shapes instead of many small ones. Use flat saturated colors with one large hard-edged shadow shape per major form and only occasional small highlight accents. Keep strong value separation and graphic cutout-like shading, not realistic form rendering. Include some medium-scale structural details that define the character, but remove microdetail. The final image should feel like Sonic Battle character key art: graphic, angular, simplified, lively, and highly readable, not polished modern anime art, not painterly, not vector-clean, and not realistic. No gradients, soft shading, painterly texture, glossy rendering, realistic lighting, detailed folds, excessive feather/fur/hair separation, or 3D volume.",Custom:""},Sf=["neutral","happy","sad","angry","surprised","thinking"];function kf(e,t){if(!e||!/^[a-z0-9_-]{1,40}$/.test(e.label)||!["front","side"].includes(e.view))throw new Error("Choose a valid view and expression label.");if(typeof e.pose!="string"||e.pose.length>500)throw new Error("Pose instructions must be at most 500 characters.");if(![e.x,e.y,e.width,e.height].every(Number.isInteger)||e.x<0||e.y<0||e.width<1||e.height<1||e.x+e.width>t.width||e.y+e.height>t.height)throw new Error("The crop must fit inside the source image.");if(![e.scale,e.offsetX,e.offsetY].every(Number.isFinite)||e.scale<.1||e.scale>3||Math.abs(e.offsetX)>512||Math.abs(e.offsetY)>768)throw new Error("Choose a scale between 0.1 and 3 and an offset inside the sprite canvas.")}var k=cr(zs()),so=e=>e instanceof Error?e.message:"The sprite action failed.";function U$(){let e=crypto.getRandomValues(new Uint8Array(16));e[6]=e[6]&15|64,e[8]=e[8]&63|128;let t=Array.from(e,a=>a.toString(16).padStart(2,"0")).join("");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}var Af=e=>new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(String(i.result)),i.onerror=()=>a(new Error("The file could not be read.")),i.readAsDataURL(e)}),Rf=e=>new Promise((t,a)=>{let i=new Image;i.onload=()=>t(i),i.onerror=()=>a(new Error("The image could not be loaded.")),i.src=e});function q$(e,t,a){let i=e.getImageData(0,0,t,a);cf(i.data,t,a)&&e.putImageData(i,0,0)}async function Mf(e,t,a=!1){kf(t,e);let i=await Rf(e.url),r=document.createElement("canvas");r.width=t.width,r.height=t.height;let s=r.getContext("2d");s.drawImage(i,t.x,t.y,t.width,t.height,0,0,t.width,t.height),a&&q$(s,r.width,r.height);let c=document.createElement("canvas");c.width=512,c.height=768;let d=c.getContext("2d"),g=(e.baseScale??Math.min(512/Math.max(...e.cells.map(M=>M.width)),768/Math.max(...e.cells.map(M=>M.height))))*t.scale,b=s.getImageData(0,0,r.width,r.height).data,N=r.width,f=-1,v=r.height,V=-1;for(let M=0;M<r.height;M++)for(let O=0;O<r.width;O++)b[(M*r.width+O)*4+3]>16&&(N=Math.min(N,O),f=Math.max(f,O),v=Math.min(v,M),V=Math.max(V,M));if(f>=N){let M=f-N+1,O=V-v+1,$=Math.min(g,480/M,736/O),w=M*$,y=O*$;d.drawImage(r,N,v,M,O,(512-w)/2+t.offsetX,752-y+t.offsetY,w,y)}return c}function Pu({candidate:e,mirrored:t=!1}){let a=(0,Se.useRef)(null),[i,r]=(0,Se.useState)("");return(0,Se.useEffect)(()=>{if(e.cell.rendered)return;let s=!1;return Mf(e.sheet,e.cell,e.cell.cleanup).then(c=>{!s&&a.current&&(a.current.getContext("2d").clearRect(0,0,512,768),a.current.getContext("2d").drawImage(c,0,0),r(""))}).catch(c=>{s||r(so(c))}),()=>{s=!0}},[e.sheet,e.cell]),e.cell.rendered?(0,k.jsx)("img",{src:e.cell.rendered.url,alt:e.cell.view+" "+e.cell.label,style:{transform:t?"scaleX(-1)":void 0}}):(0,k.jsxs)(k.Fragment,{children:[i?(0,k.jsx)("small",{role:"alert",children:i}):null,(0,k.jsx)("canvas",{ref:a,width:512,height:768,style:{transform:t?"scaleX(-1)":void 0},role:"img","aria-label":e.cell.view+" "+e.cell.label})]})}var B$=`
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
`;function zf({villager:e,request:t,onSaved:a,onBack:i,onExport:r}){let s="/villagers/"+encodeURIComponent(e.characterId)+"/sprites",[c,d]=(0,Se.useState)(null),[h,g]=(0,Se.useState)(null),[b,N]=(0,Se.useState)("Create"),[f,v]=(0,Se.useState)("front"),[V,M]=(0,Se.useState)([...Sf]),[O,$]=(0,Se.useState)(""),[w,y]=(0,Se.useState)({}),[R,U]=(0,Se.useState)(!1),[Z,F]=(0,Se.useState)(null),[te,ye]=(0,Se.useState)(""),[oe,Pe]=(0,Se.useState)(!1),[qe,yt]=(0,Se.useState)([]),[Oe,ct]=(0,Se.useState)(""),[Et,qt]=(0,Se.useState)(""),[A,X]=(0,Se.useState)(null),[Y,le]=(0,Se.useState)(!1),[$e,Ze]=(0,Se.useState)(""),[_e,W]=(0,Se.useState)(""),[St,Dt]=(0,Se.useState)(!1),[ot,dt]=(0,Se.useState)(!1),[Qe,Ve]=(0,Se.useState)(null),ut=(0,Se.useRef)(null),[ie,Ae]=(0,Se.useState)(""),[me,Je]=(0,Se.useState)(null),[Be,D]=(0,Se.useState)(1),[G,ae]=(0,Se.useState)(1),[we,Re]=(0,Se.useState)("neutral"),Ie=(0,Se.useRef)(null),et=(0,Se.useRef)(""),ee=(0,Se.useRef)(null),B=(S,x)=>t(s+"/studio"+(S?"/"+S:""),x===void 0?void 0:{method:"POST",body:JSON.stringify(x)}),Yt=S=>{d(S.studio),a(S.snapshot)},De=(c?.jobs??[]).flatMap(S=>S.sheets.flatMap(x=>x.cells.map(I=>({sheet:x,cell:I})))),re=De.find(S=>S.cell.id===Oe),zt=A?De.find(S=>S.cell.id===A.id):null,Ra=c?.jobs.some(S=>S.status==="running")??!1,kt=e.sprite?.images??[],La=De.filter(S=>S.cell.pending).length,ht=c?.expressions??[],ia={view:f,individual:R,settings:h,expressions:V.filter(S=>ht.some(x=>x.label===S)).map(S=>{let x=ht.find(I=>I.label===S);return{label:S,pose:w[S]??x.pose,expressionId:x.id}})},At=JSON.stringify(ia),C=c?.reference?.url;(0,Se.useEffect)(()=>{Qe&&!ut.current?.open&&ut.current?.showModal(),!Qe&&ut.current?.open&&ut.current.close()},[Qe]),(0,Se.useEffect)(()=>{let S=!1;return t(s+"/studio").then(x=>{S||(d(x),g(x.settings),x.jobs.length&&N("Review"))}).catch(x=>{S||Ze(so(x))}),ee.current?.focus(),()=>{S=!0}},[s,t]),(0,Se.useEffect)(()=>{if(!Ra)return;let S=window.setInterval(()=>{t(s+"/studio").then(d).catch(x=>Ze(so(x)))},2e3);return()=>window.clearInterval(S)},[Ra,s,t]),(0,Se.useEffect)(()=>{let S=!1;if(F(null),ye(""),et.current!==At&&(Ie.current=null,et.current=At),!C||!JSON.parse(At).expressions.length){Pe(!1);return}Pe(!0);let x=window.setTimeout(()=>{t(s+"/studio/plan",{method:"POST",body:At}).then(I=>{S||F(I)}).catch(I=>{S||ye(so(I))}).finally(()=>{S||Pe(!1)})},350);return()=>{S=!0,window.clearTimeout(x)}},[At,C,s,t]);async function j(S){le(!0),Ze(""),W("");try{await S()}catch(x){Ze(so(x));try{d(await B(""))}catch{}}finally{le(!1)}}async function ce(){let S=await B("plan",ia);F(S),Ie.current??(Ie.current=U$());try{let x=Ie.current,I=await B("jobs",{...ia,plan:S,submissionId:x});if(d(I),Ie.current=null,!I.jobs.some(P=>P.id===x)){W("This submission already completed and its artwork was removed. Click Generate to start a new batch.");return}N("Review"),W("Drawing a saved batch. Existing scene images stay active.")}catch(x){if(/plan changed|model changed|size changed/i.test(so(x)))F(await B("plan",ia)),W("Summary refreshed. Click Generate to submit the updated request.");else throw x}}async function ke(S,x){if(!S.length)throw new Error("Choose cutouts and expression slots.");let I=[];for(let{candidate:P,expressionId:he}of S)I.push({id:P.cell.id,expressionId:he,expected:P.cell,...P.cell.rendered?{}:{image:(await Mf(P.sheet,P.cell,P.cell.cleanup)).toDataURL("image/png")}});Yt(await B("assign",{cells:I,batchId:x})),W("Assigned. These images are now used in scenes.")}async function Tt(S){let x=(S.assignments??[]).filter(P=>ht.some(he=>he.id===P.expressionId)),I=new Map;for(let P of S.sheets)for(let he of P.cells)!he.expressionId||!ht.some(se=>se.id===he.expressionId)||x.some(se=>se.cellId===he.id)||I.set(he.view+":"+he.expressionId,{candidate:{sheet:P,cell:he},expressionId:he.expressionId});for(let P of x){let he=De.find(se=>se.cell.id===P.cellId);he&&I.set(P.view+":"+P.expressionId,{candidate:he,expressionId:P.expressionId})}await ke([...I.values()],S.id)}async function ua(S){let x=await B("repair-background",{batchId:S.id});d(x);let I=new Map((x.repairedCells??[]).map(he=>[he.originalId,he.cellId])),P=x.assignments.flatMap(he=>{let se=I.get(he.cellId),Ge=x.jobs.flatMap(ma=>ma.sheets).find(ma=>ma.cells.some(Un=>Un.id===se)),ha=Ge?.cells.find(ma=>ma.id===se);return Ge&&ha?[{candidate:{sheet:Ge,cell:ha},expressionId:he.expressionId}]:[]});P.length&&await ke(P,S.id),W("Backgrounds repaired. Original artwork retained; active sprites updated.")}function $a(S){ct(S.cell.id),qt(c?.assignments.find(x=>x.cellId===S.cell.id)?.expressionId??S.cell.expressionId??ht[0]?.id??""),X(null)}async function Hn(S){let x=await B("delete",{...S,confirmed:!0});d(x.studio),Ve(null),Ie.current=null,yt([]),ct(""),X(null),W("Artwork removed. "+x.deleted+" unused files deleted."+(x.failures.length?" Use Delete unused files to retry: "+x.failures.map(I=>I.error).join("; "):""))}async function Fi(){let S=await Rf(ie),x;if(me&&typeof me=="object"&&Array.isArray(me.cells))x=me.cells;else{if(!Number.isInteger(Be)||!Number.isInteger(G)||Be<1||G<1)throw new Error("Choose a valid grid.");let I=we.split(",").map(P=>P.trim().toLowerCase().replace(/\s+/g,"_")).filter(Boolean);if(!I.length||I.length>Be*G)throw new Error("Supply one name per occupied cell, separated by commas.");x=I.map((P,he)=>{let se=Math.floor(he%Be*S.naturalWidth/Be),Ge=Math.floor(Math.floor(he/Be)*S.naturalHeight/G);return{label:P,view:f,x:se,y:Ge,width:Math.floor((he%Be+1)*S.naturalWidth/Be)-se,height:Math.floor((Math.floor(he/Be)+1)*S.naturalHeight/G)-Ge}})}d(await B("import",{image:ie,cells:x})),Ae(""),Je(null),N("Review")}function Ki(S){if(S.style&&Object.hasOwn(Xu,S.style)){let I=S.style;g(P=>P&&{...P,style:I,connectionId:S.connectionId,prompts:{...P.prompts,[I]:S.stylePrompt??P.prompts[I]}})}let x=S.requestedExpressions??[...S.sheets.flatMap(I=>I.cells),...S.pendingExpressions??[]];M([...new Set(x.map(I=>I.label))]),y(Object.fromEntries(x.map(I=>[I.label,I.pose]))),v(S.view),U(S.individual??!1),Ie.current=null,N("Create"),W("Retry prepared. Generate creates a new batch with the displayed request count.")}let mi=(0,k.jsxs)("aside",{className:"vss-panel vss-slots","data-open":ot,"aria-label":"Expression assignment panel",children:[(0,k.jsxs)("h3",{children:["Expressions \xB7 ",ht.length]}),(0,k.jsx)("p",{className:"vss-hint",children:re?"Selected: "+re.cell.label+" \xB7 "+re.cell.view:"Select a cutout, then Assign. Or drag it onto an expression."}),(0,k.jsxs)("label",{children:["Assign selected cutout to",(0,k.jsxs)("select",{"aria-label":"Assign selected cutout to",value:Et,onChange:S=>qt(S.target.value),children:[(0,k.jsx)("option",{value:"",children:"Choose expression"}),ht.map(S=>(0,k.jsx)("option",{value:S.id,children:S.name},S.id))]})]}),(0,k.jsx)("button",{className:"vss-primary",disabled:Y||!re||!Et,onClick:()=>re&&void j(()=>ke([{candidate:re,expressionId:Et}])),children:"Assign"}),(0,k.jsx)("button",{className:"vss-slot-toggle","aria-expanded":ot,onClick:()=>dt(!ot),children:ot?"Hide expressions":"Show expressions"}),(0,k.jsx)("div",{className:"vss-slot-list",children:ht.map(S=>{let x=(c?.assignments??[]).filter(I=>I.expressionId===S.id);return(0,k.jsxs)("div",{className:"vss-slot",onDragOver:I=>I.preventDefault(),onDrop:I=>{I.preventDefault();let P=De.find(he=>he.cell.id===I.dataTransfer.getData("application/x-villages-cutout"));P&&!Y&&j(()=>ke([{candidate:P,expressionId:S.id}]))},children:[(0,k.jsxs)("strong",{children:[S.name,c?.defaultExpressionId===S.id?" \xB7 Default":""]}),(0,k.jsx)("small",{children:S.useWhen||S.pose||"Uses this expression's name as guidance."}),(0,k.jsxs)("div",{className:"vss-row",children:[x.map(I=>{let P=De.find(he=>he.cell.id===I.cellId);return P?(0,k.jsxs)("div",{className:"vss-mini",children:[(0,k.jsx)(Pu,{candidate:P}),(0,k.jsx)("small",{children:I.view})]},I.view):null}),x.length?null:(0,k.jsx)("small",{children:"Empty \xB7 optional"})]}),(0,k.jsxs)("button",{disabled:Y||!re,"aria-label":"Assign selected cutout to "+S.name,onClick:()=>re&&void j(()=>ke([{candidate:re,expressionId:S.id}])),children:["Assign ",re?.cell.view??""," here"]}),x.length&&c?.defaultExpressionId!==S.id?(0,k.jsx)("button",{disabled:Y,onClick:()=>{j(async()=>Yt(await B("expression",{defaultId:S.id})))},children:"Use as default scene image"}):null,(0,k.jsxs)("details",{children:[(0,k.jsxs)("summary",{children:["Edit ",S.name]}),(0,k.jsxs)("form",{onSubmit:I=>{I.preventDefault();let P=new FormData(I.currentTarget);j(async()=>Yt(await B("expression",{id:S.id,name:P.get("name"),label:P.get("name"),pose:P.get("pose"),useWhen:P.get("useWhen")})))},children:[(0,k.jsxs)("label",{children:["Name",(0,k.jsx)("input",{name:"name",defaultValue:S.name,maxLength:40,required:!0})]}),(0,k.jsxs)("label",{children:["Pose for generation",(0,k.jsx)("input",{name:"pose",defaultValue:S.pose,maxLength:500})]}),(0,k.jsxs)("label",{children:["Use when \xB7 optional",(0,k.jsx)("input",{name:"useWhen",defaultValue:S.useWhen,maxLength:1e3})]}),(0,k.jsx)("button",{disabled:Y,children:"Save expression"}),(0,k.jsx)("button",{type:"button",disabled:Y||!!x.length,onClick:()=>{j(async()=>Yt(await B("expression",{removeId:S.id})))},children:"Remove empty slot"})]})]})]},S.id)})}),(0,k.jsxs)("form",{onSubmit:S=>{S.preventDefault();let x=O.trim();j(async()=>{Yt(await B("expression",{name:x})),$(""),M(I=>[...new Set([...I,x.toLowerCase().replace(/\s+/g,"_")])])})},children:[(0,k.jsxs)("label",{children:["New expression",(0,k.jsx)("input",{value:O,maxLength:40,onChange:S=>$(S.target.value),placeholder:"Delighted, running\u2026"})]}),(0,k.jsx)("button",{disabled:Y||!O.trim(),children:"Add expression"})]})]});return(0,k.jsxs)("section",{className:"vss","aria-label":e.name+" Sprite Studio",children:[(0,k.jsx)("style",{children:B$+L$}),(0,k.jsxs)("header",{className:"vss-header",children:[(0,k.jsxs)("div",{children:[(0,k.jsxs)("p",{className:"vss-hint",children:["Villagers / ",e.name]}),(0,k.jsxs)("h2",{ref:ee,tabIndex:-1,children:[e.name,"\u2019s Sprite Studio"]}),(0,k.jsxs)("small",{children:[kt.length," in use \xB7 ",De.length," saved cutouts \xB7 ",La," pending review"]})]}),(0,k.jsx)("button",{disabled:Y,onClick:()=>{j(async()=>{h&&await B("settings",h),i()})},children:"\u2190 Back to Villagers"})]}),$e&&!Qe?(0,k.jsx)("p",{className:"vss-error",role:"alert",children:$e}):null,(0,k.jsx)("p",{role:"status","aria-live":"polite",children:_e}),!c||!h?(0,k.jsx)("p",{children:"Loading saved sprite work\u2026"}):(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)("nav",{className:"vss-nav","aria-label":"Sprite Studio sections",children:["Create","Review","In use"].map(S=>(0,k.jsxs)("button",{"aria-pressed":b===S,onClick:()=>{N(S),X(null)},children:[S,S==="Review"&&La?" \xB7 "+La:""]},S))}),c.reference?null:(0,k.jsxs)("div",{className:"vss-panel",children:[(0,k.jsx)("h3",{children:"Capture an identity reference"}),(0,k.jsx)("button",{disabled:Y,onClick:()=>{j(async()=>d(await B("reference",{})))},children:"Capture current avatar"}),(0,k.jsxs)("label",{children:["Upload reference",(0,k.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",onChange:S=>{let x=S.target.files?.[0];x&&j(async()=>d(await B("reference",{image:await Af(x)})))}})]})]}),b==="Create"?(0,k.jsxs)("div",{className:"vss-create",children:[(0,k.jsxs)("div",{className:"vss-panel",children:[(0,k.jsx)("h3",{children:"Generate a saved batch"}),(0,k.jsx)("p",{className:"vss-hint",children:"Choose any expressions. Neutral is optional. Assign images in Review to use them in scenes."}),(0,k.jsxs)("label",{children:["View",(0,k.jsxs)("select",{"aria-label":"View",value:f,onChange:S=>v(S.target.value),children:[(0,k.jsx)("option",{value:"front",children:"Front \xB7 facing you"}),(0,k.jsx)("option",{value:"side",children:"Side \xB7 facing right, mirrored for left"})]})]}),(0,k.jsx)("div",{className:"vss-expressions",children:ht.map(S=>(0,k.jsxs)("div",{children:[(0,k.jsxs)("label",{className:"vss-check",children:[(0,k.jsx)("input",{type:"checkbox",checked:V.includes(S.label),onChange:x=>M(x.target.checked?[...V,S.label]:V.filter(I=>I!==S.label))}),S.name]}),V.includes(S.label)?(0,k.jsxs)("label",{children:["Pose \xB7 optional",(0,k.jsx)("input",{value:w[S.label]??S.pose,maxLength:500,onChange:x=>y({...w,[S.label]:x.target.value})})]}):null]},S.id))}),(0,k.jsxs)("label",{children:["Art style",(0,k.jsxs)("select",{"aria-label":"Art style",value:h.style,onChange:S=>g({...h,style:S.target.value}),children:[(0,k.jsx)("option",{value:"PAPERCRAFT",children:"Papercraft"}),(0,k.jsx)("option",{value:"BATTLEHIGHWAY",children:"Battle Highway"}),(0,k.jsx)("option",{value:"Custom",children:"Custom"})]})]}),(0,k.jsxs)("details",{children:[(0,k.jsx)("summary",{children:"Style prompt"}),(0,k.jsxs)("label",{children:["Drawing instructions",(0,k.jsx)("textarea",{value:h.prompts[h.style],maxLength:6e3,onChange:S=>g({...h,prompts:{...h.prompts,[h.style]:S.target.value}})})]}),(0,k.jsx)("button",{onClick:()=>g({...h,prompts:{...h.prompts,[h.style]:Xu[h.style]}}),children:"Restore style prompt"})]}),(0,k.jsxs)("label",{children:["Image connection",(0,k.jsxs)("select",{"aria-label":"Image connection",value:h.connectionId,onChange:S=>g({...h,connectionId:S.target.value}),children:[(0,k.jsx)("option",{value:"",children:"Village default"}),c.connections.map(S=>(0,k.jsxs)("option",{value:S.id,children:[S.name," \xB7 ",S.model]},S.id))]})]}),(0,k.jsxs)("label",{children:["Drawing layout",(0,k.jsxs)("select",{"aria-label":"Drawing layout",value:R?"individual":"sheet",onChange:S=>U(S.target.value==="individual"),children:[(0,k.jsx)("option",{value:"sheet",children:"Efficient sheets \xB7 up to six sprites each"}),(0,k.jsx)("option",{value:"individual",children:"Individual \xB7 more drawing space per sprite"})]})]}),(0,k.jsx)("div",{className:"vss-panel","aria-label":"Generation request summary",children:oe?(0,k.jsx)("p",{children:"Updating request summary\u2026"}):Z?(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)("strong",{children:[Z.connection.name," \xB7 ",Z.connection.model]}),(0,k.jsxs)("p",{children:[ia.expressions.length," expressions \xB7 ",Z.batches.length," image"," ",Z.batches.length===1?"request":"requests"," \xB7"," ",Z.estimatedCost===null?"Cost unavailable":"Estimated $"+Z.estimatedCost.toFixed(3)]}),Z.batches.map((S,x)=>(0,k.jsxs)("small",{children:["Sheet ",x+1,": ",S.count," sprites \xB7 ",S.cols," \xD7 ",S.rows," \xB7 ",S.width," \xD7"," ",S.height,"px source"]},x)),(0,k.jsxs)("small",{children:["Cutouts saved at 512 \xD7 768."," ",Z.localWorkflow?"Local workflow internal steps and costs are unavailable. ":"","No automatic retries or provider changes."]})]}):(0,k.jsx)("p",{className:"vss-hint",children:te||"Select expressions and capture a reference to see the request summary."})}),(0,k.jsx)("button",{className:"vss-primary",disabled:Y||Ra||oe||!Z||!ia.expressions.length,onClick:()=>{j(ce)},children:Y?"Working\u2026":"Generate"}),(0,k.jsxs)("details",{children:[(0,k.jsx)("summary",{children:"Import images or a sheet"}),(0,k.jsxs)("label",{children:["Image",(0,k.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",onChange:S=>{let x=S.target.files?.[0];x&&j(async()=>Ae(await Af(x)))}})]}),(0,k.jsxs)("label",{children:["Optional exported JSON manifest",(0,k.jsx)("input",{type:"file",accept:".json,application/json",onChange:S=>{let x=S.target.files?.[0];x&&j(async()=>Je(JSON.parse(await x.text())))}})]}),me?(0,k.jsx)("small",{children:"Using manifest cell positions and views."}):(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)("div",{className:"vss-fields",children:[(0,k.jsxs)("label",{children:["Columns",(0,k.jsx)("input",{type:"number",min:1,value:Be,onChange:S=>D(Number(S.target.value))})]}),(0,k.jsxs)("label",{children:["Rows",(0,k.jsx)("input",{type:"number",min:1,value:G,onChange:S=>ae(Number(S.target.value))})]})]}),(0,k.jsxs)("label",{children:["Expression names in reading order",(0,k.jsx)("input",{value:we,onChange:S=>Re(S.target.value)})]})]}),(0,k.jsx)("button",{disabled:Y||!ie,onClick:()=>{j(Fi)},children:"Import to gallery"})]})]}),(0,k.jsxs)("div",{children:[c.reference?(0,k.jsxs)("div",{className:"vss-panel",children:[(0,k.jsx)("h3",{children:"Original identity reference"}),(0,k.jsx)("img",{className:"vss-reference",src:c.reference.url,alt:"Captured identity reference"}),(0,k.jsx)("small",{children:"Used for every generation and art style."})]}):null,mi]})]}):b==="Review"?(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)("div",{className:"vss-row",children:[(0,k.jsx)("h3",{children:"Saved artwork"}),(0,k.jsx)("button",{disabled:Y||!La,onClick:()=>{j(async()=>{d(await B("clear-review",{})),Dt(!1),W("Pending review cleared. All saved artwork remains available.")})},children:"Clear pending review"}),(0,k.jsxs)("label",{className:"vss-check",children:[(0,k.jsx)("input",{type:"checkbox",checked:St,onChange:S=>Dt(S.target.checked)}),"Pending only"]}),(0,k.jsxs)("button",{disabled:Y||!qe.length,onClick:()=>Ve({ids:qe,deleteFiles:!1}),children:["Delete selected cutouts (",qe.length,")"]}),(0,k.jsx)("button",{disabled:Y,onClick:()=>{j(async()=>{if(!window.confirm("Delete unused Studio-owned files? Saved alternatives, active assignments, shared originals, and the identity reference are retained."))return;let S=await B("delete-unused",{});d(S.studio),W(S.deleted+" unused files deleted."+(S.failures.length?" Retry needed: "+S.failures.map(x=>x.error).join("; "):""))})},children:"Delete unused files"})]}),(0,k.jsxs)("div",{className:"vss-library",children:[(0,k.jsxs)("div",{className:"vss-gallery",children:[c.jobs.length?null:(0,k.jsx)("div",{className:"vss-panel",children:(0,k.jsx)("p",{children:"Generate or import artwork to begin. Each batch stays here for future swaps."})}),[...c.jobs].reverse().map(S=>{let x=S.sheets.flatMap(I=>I.cells.filter(P=>!St||P.pending).map(P=>({sheet:I,cell:P})));return St&&!x.length&&S.status==="ready"?null:(0,k.jsxs)("article",{className:"vss-panel","aria-label":"Batch "+S.id,children:[(0,k.jsx)("h3",{children:S.style==="PAPERCRAFT"?"Papercraft":S.style==="BATTLEHIGHWAY"?"Battle Highway":S.style||S.model||"Saved batch"}),(0,k.jsxs)("small",{children:[new Date(S.createdAt).toLocaleString()," \xB7 ",S.model," \xB7 ",S.attempted," submitted /"," ",S.planned," planned requests \xB7 ",S.status]}),S.error?(0,k.jsx)("p",{className:"vss-hint",children:S.error}):null,(0,k.jsxs)("div",{className:"vss-row",children:[(0,k.jsx)("button",{className:"vss-primary",disabled:Y||S.status==="running"||!x.length,onClick:()=>{j(()=>Tt(S))},children:"Use this batch"}),(0,k.jsx)("button",{disabled:Y||S.status==="running",onClick:()=>Ve({batchId:S.id,deleteFiles:!1}),children:"Delete batch"}),(0,k.jsx)("button",{disabled:Y||S.status==="running"||!x.length,onClick:()=>{j(()=>ua(S))},children:"Repair backgrounds"}),S.status==="interrupted"?(0,k.jsx)("button",{disabled:Y||Ra,onClick:()=>Ki(S),children:"Prepare retry"}):null,S.pendingAssetId&&S.status!=="running"?(0,k.jsx)("button",{disabled:Y,onClick:()=>{j(async()=>d(await B("recover",{id:S.id})))},children:"Recover saved original \xB7 no image request"}):null]}),(0,k.jsx)("div",{className:"vss-originals",children:S.sheets.map((I,P)=>(0,k.jsxs)("details",{children:[(0,k.jsxs)("summary",{children:["Original sheet ",P+1,(0,k.jsx)("img",{className:"vss-sheet-thumb",src:I.url,alt:"Sheet thumbnail "+(P+1)})]}),(0,k.jsx)("a",{href:I.url,target:"_blank",rel:"noreferrer",children:(0,k.jsx)("img",{src:I.url,alt:"Original sheet "+(P+1)})}),(0,k.jsxs)("small",{children:[I.width," \xD7 ",I.height,"px \xB7 Provider usage"," ",I.usage?JSON.stringify(I.usage):"unavailable"]})]},I.assetId+":"+P))}),(0,k.jsx)("div",{className:"vss-grid",children:x.map(I=>{let P=c.assignments.filter(he=>he.cellId===I.cell.id);return(0,k.jsxs)("div",{className:"vss-card",draggable:!Y,onDragStart:he=>{he.dataTransfer.setData("application/x-villages-cutout",I.cell.id),he.dataTransfer.effectAllowed="copy",$a(I)},children:[(0,k.jsx)("button",{"aria-label":"Select "+I.cell.view+" "+I.cell.label+" cutout","aria-pressed":Oe===I.cell.id,onClick:()=>$a(I),children:(0,k.jsx)(Pu,{candidate:I})}),(0,k.jsx)("strong",{children:I.cell.label.replaceAll("_"," ")}),(0,k.jsx)("small",{children:I.cell.view}),P.length?(0,k.jsxs)("span",{className:"vss-badge",children:["In use \xB7"," ",P.map(he=>ht.find(se=>se.id===he.expressionId)?.name).join(", ")]}):(0,k.jsx)("small",{children:I.cell.pending?"Pending review":"Saved alternative"}),(0,k.jsxs)("label",{className:"vss-check",children:[(0,k.jsx)("input",{type:"checkbox",checked:qe.includes(I.cell.id),"aria-label":"Select "+I.cell.label+" for deletion",onChange:he=>yt(he.target.checked?[...qe,I.cell.id]:qe.filter(se=>se!==I.cell.id))}),"Select for deletion"]}),(0,k.jsx)("button",{disabled:Y,onClick:()=>{$a(I),X(structuredClone(I.cell))},children:"Adjust image"})]},I.cell.id)})})]},S.id)})]}),mi]}),A&&zt?(0,k.jsxs)("div",{className:"vss-panel","aria-label":"Adjust image",children:[(0,k.jsx)("h3",{children:"Adjust image \xB7 saves another cutout"}),(0,k.jsxs)("div",{className:"vss-adjust",children:[(0,k.jsx)("div",{className:"vss-stage","data-background":"checker",children:(0,k.jsx)(Pu,{candidate:{sheet:zt.sheet,cell:{...A,rendered:void 0}}})}),(0,k.jsxs)("svg",{className:"vss-source",viewBox:"0 0 "+zt.sheet.width+" "+zt.sheet.height,role:"img","aria-label":"Original sheet with selected crop",children:[(0,k.jsx)("image",{href:zt.sheet.url,width:zt.sheet.width,height:zt.sheet.height}),(0,k.jsx)("rect",{x:A.x,y:A.y,width:A.width,height:A.height,fill:"none",stroke:"#c5a4ff",strokeWidth:Math.max(3,zt.sheet.width/150)})]})]}),(0,k.jsx)("div",{className:"vss-fields",children:["x","y","width","height","scale","offsetX","offsetY"].map(S=>(0,k.jsxs)("label",{children:[{x:"Crop X",y:"Crop Y",width:"Crop width",height:"Crop height",scale:"Scale",offsetX:"Horizontal offset",offsetY:"Foot offset"}[S],(0,k.jsx)("input",{type:"number",step:S==="scale"?.05:1,value:A[S],onChange:x=>X({...A,[S]:Number(x.target.value)})})]},S))}),(0,k.jsxs)("label",{className:"vss-check",children:[(0,k.jsx)("input",{type:"checkbox",checked:A.cleanup??!1,onChange:S=>X({...A,cleanup:S.target.checked})}),"Remove background"]}),(0,k.jsxs)("div",{className:"vss-row",children:[(0,k.jsx)("button",{disabled:Y,onClick:()=>{j(async()=>{let S=await B("cell",{id:A.id,cell:A});d(S),ct(S.adjustedCellId??Oe),X(null),W("Adjusted cutout saved. Assign it when ready.")})},children:"Save adjusted cutout"}),(0,k.jsx)("button",{onClick:()=>X(null),children:"Cancel"})]})]}):null]}):(0,k.jsxs)("div",{className:"vss-panel",children:[(0,k.jsx)("h3",{children:"In use"}),(0,k.jsx)("p",{className:"vss-hint",children:"These assignments are used in scenes. Saved alternatives remain in Review."}),(0,k.jsx)("div",{className:"vss-grid",children:kt.map(S=>(0,k.jsxs)("div",{className:"vss-card",children:[(0,k.jsx)("img",{src:S.url,alt:S.label+" "+S.view}),(0,k.jsx)("strong",{children:S.label.replaceAll("_"," ")}),(0,k.jsx)("small",{children:S.view}),(0,k.jsx)("button",{disabled:Y,onClick:()=>{j(async()=>{Yt(await B("remove",S)),W("Removed from scenes. Saved artwork remains available.")})},children:"Remove from scenes"})]},S.view+":"+S.label))}),kt.length?(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)("label",{children:["Scene framing",(0,k.jsxs)("select",{value:e.sprite?.framing.mode??"full",onChange:S=>{j(async()=>a(await t(s+"/framing",{method:"POST",body:JSON.stringify({mode:S.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,k.jsx)("option",{value:"full",children:"Full body"}),(0,k.jsx)("option",{value:"half",children:"Half body"})]})]}),e.sprite?.framing.mode==="half"?(0,k.jsxs)("label",{children:["Visible body height \xB7 percent",(0,k.jsx)("input",{type:"number",min:40,max:85,defaultValue:e.sprite.framing.cropPercent,onBlur:S=>{let x=Number(S.target.value);x!==e.sprite?.framing.cropPercent&&j(async()=>a(await t(s+"/framing",{method:"POST",body:JSON.stringify({mode:"half",cropPercent:x})})))}})]}):null,(0,k.jsx)("button",{disabled:Y,onClick:()=>{j(r)},children:"Download both views and manifest"})]}):(0,k.jsx)("p",{children:"No assigned images yet."}),mi]})]}),(0,k.jsx)("dialog",{ref:ut,className:"vss-delete-dialog","aria-labelledby":"vss-delete-title",onCancel:()=>Ve(null),children:Qe?(0,k.jsxs)("div",{className:"vss-panel",children:[(0,k.jsx)("h3",{id:"vss-delete-title",children:"Delete saved artwork?"}),$e?(0,k.jsx)("p",{className:"vss-error",role:"alert",children:$e}):null,(0,k.jsxs)("p",{children:[Qe.batchId?"Remove this batch from the gallery.":"Remove "+Qe.ids?.length+" selected cutouts from the gallery."," ","Images currently in use are protected."]}),(0,k.jsxs)("label",{className:"vss-check",children:[(0,k.jsx)("input",{type:"checkbox",checked:Qe.deleteFiles,onChange:S=>Ve({...Qe,deleteFiles:S.target.checked})}),"Also delete unused files from disk"]}),(0,k.jsx)("small",{children:"Shared originals and retained alternatives stay saved. Files kept on disk can be removed later with Delete unused files."}),(0,k.jsxs)("div",{className:"vss-row",children:[(0,k.jsx)("button",{disabled:Y,onClick:()=>Ve(null),children:"Cancel"}),(0,k.jsx)("button",{disabled:Y,onClick:()=>{j(()=>Hn(Qe))},children:"Delete artwork"})]})]}):null})]})}var L$=`
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
`;var m=cr(Ms()),A1=cr(U0());function JS(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),i="",r=[],s=[];for(let c=0;c<a.length;c++){let d=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(d)?.[1];if(h&&(i?h[0]===i[0]&&h.length>=i.length&&(i=""):i=h),!i&&!d.trim()&&(!t||c<a.length-1)){let g=r.join(`
`).trim();g&&s.push(g),r=[]}else r.push(d)}if(!t){let c=r.join(`
`).trim();c&&s.push(c)}return s}var FS=['"',"'","\u201D","\u2019","\xBB","\u300D"],KS=['"',"'","\u201C","\u2018","\xAB","\u300C"];function q0(e){let t=e.trim();return FS.includes(t.slice(-1))&&KS.some(i=>t.slice(0,-1).includes(i))?"speech":"prose"}function B0(e,t){let a=JS(e),i=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return i();let r=[],s=[],c=[],d=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){r.push(a[h]),s.push(d),c.push(g.expression??null),d=[];continue}let b={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};r.length?s[s.length-1].push(b):d.push(b)}return r.length===0?i():{paragraphs:r,asides:s,expressions:c}}var WS="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function Ir(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],i=new RegExp(WS,"g"),r=0,s,c=d=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+d};return}a.push({kind:"text",text:d})};for(;(s=i.exec(e))!==null;)s.index>r&&c(e.slice(r,s.index)),s[1]!=null?c(s[1]):s[2]!=null&&s[3]!=null?a.push({kind:"link",text:s[2],href:s[3]}):s[4]!=null?a.push({kind:"code",text:s[4]}):s[5]!=null?a.push({kind:"styled",style:"highlight",children:Ir(s[5],t+1)}):s[6]!=null?a.push({kind:"styled",style:"strikethrough",children:Ir(s[6],t+1)}):s[7]!=null?a.push({kind:"styled",style:"bold-italic",children:Ir(s[7],t+1)}):s[8]!=null?a.push({kind:"styled",style:"bold",children:Ir(s[8],t+1)}):s[9]!=null?a.push({kind:"styled",style:"underline",children:Ir(s[9],t+1)}):(s[10]!=null||s[11]!=null)&&a.push({kind:"styled",style:"italic",children:Ir(s[10]??s[11],t+1)}),r=s.index+s[0].length;return r<e.length&&c(e.slice(r)),a}function L0(e){return Ir(e,0)}function hi(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function j0(e){return e===null||typeof e=="string"}function G0(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function Jd(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function e2(e){return e===null?!0:hi(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function t2(e){if(!hi(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!Jd(e.capabilities)||!hi(e.presentation)||!hi(e.occupancy)||!hi(e.state))return!1;let{presentation:t,occupancy:a,state:i}=e;return e2(t.image)&&G0(t.x)&&G0(t.y)&&typeof a.playerHome=="boolean"&&j0(a.residentCharacterId)&&j0(a.homeKind)&&typeof i.condition=="string"&&Jd(i.upgrades)&&Jd(i.furniture)&&Jd(i.publicFacts)&&typeof i.updatedAt=="string"}function Y0(e){if(!hi(e)||!hi(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(t2),i=Array.isArray(e.venueRequests)?e.venueRequests:[],r=i.filter(s=>hi(s)&&typeof s.id=="string"&&hi(s.venueDraft)&&typeof s.venueDraft.name=="string"&&typeof s.venueDraft.category=="string");return a.length===t.length&&r.length===i.length&&i===e.venueRequests?e:{...e,venueRequests:r,settings:{...e.settings,venues:a}}}function X0(e,t,a){return e==="Enter"&&!t&&!a}function Fd(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,i=>i.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function P0(e,t,a,i){let r=Math.max(0,a-1);return!e||e.roomId!==t?r:a>e.stepCount?e.stepCount:Math.min(i,r)}function rs(e,t){return t?.roomId===e}function Z0(e,t){return e.status==="closed"&&e.submissions?.some(a=>a.id===t)===!0}function Gp(e){return Object.fromEntries(e.map((t,a)=>[t,{position:e.length===3&&a===1?"center":a<Math.ceil(e.length/2)?"left":"right",expression:"",look:{target:"player"}}]))}function Yp(e){let t=(e.staging??[]).map(r=>({...r}));if(!e.speakerId||e.kind==="narration"||e.speakerId==="__venue_scene__")return t;let a=t.find(r=>r.characterId===e.speakerId)??{characterId:e.speakerId};!a.expression&&e.expression&&(a.expression=e.expression);let i=e.gazeAt||(e.kind==="whisper"?e.targetId:void 0);return!a.look&&i&&(a.look=i==="player"?{target:"player"}:{target:"villager",characterId:i}),!t.includes(a)&&(a.expression||a.look)&&t.push(a),t}function Q0(e,t){return Object.fromEntries(Object.entries(e).map(([a,i])=>[a,i.look.target==="villager"&&!t.includes(i.look.characterId)?{...i,look:{target:"player"}}:i]))}function J0(e,t){let a=Gp(e),i=e;return t.map(r=>{r.beforeIds&&(i=r.beforeIds,a=Q0(a,i)),a={...a};for(let s of r.cues??[]){if(!i.includes(s.characterId)||!a[s.characterId])continue;let{characterId:c,...d}=s;a[c]={...a[c],...d}}return r.afterIds&&(i=r.afterIds,a=Q0(a,i)),{state:a,activeIds:i}})}function F0(e,t){let a=new Map,i=new Map(e.flatMap((r,s)=>r.id?[[r.id,s]]:[]));for(let r of t){let s=(r.replyLineIds??[]).filter(b=>i.has(b));if(!s.length)continue;let c=s[0],d=s.at(-1),h=i.get(c);h>0&&e[h-1].role==="user"&&(h-=1);let g=e[h].id;g&&r.activeIdsAtTurn&&a.set(g,{...a.get(g),beforeIds:r.activeIdsAtTurn}),r.activeIdsAfterTurn&&a.set(d,{...a.get(d),afterIds:r.activeIdsAfterTurn})}return a}function K0(e,t){let a=["left","center","right"],i={};a.forEach((r,s)=>{let c=Object.keys(t).filter(d=>t[d]?.position===r);c.forEach((d,h)=>{i[d]={x:(s+(h+.5)/c.length)/3,width:Math.min(.25,.9/(3*c.length)),facing:"front"}})});for(let r of Object.keys(i))e.includes(r)||delete i[r];for(let r of e){let s=i[r];if(!s)continue;let c=t[r].look;if(c.target==="direction")s.facing=c.direction;else if(c.target==="villager"&&i[c.characterId]){let d=i[c.characterId].x;s.facing=d===s.x?"front":d<s.x?"left":"right"}}return i}function W0(e,t){return t<0||t===e?"front":t<e?"left":"right"}function e1(e,t,a){let i=a==="front"?"front":"side",r=d=>d.expressionId===t||d.label===t||d.aliases?.includes(t),s=d=>d.isDefault||d.label==="neutral",c=e.find(d=>d.view===i&&r(d))??e.find(d=>d.view==="front"&&r(d))??e.find(r)??e.find(d=>d.view===i&&d.isDefault)??e.find(d=>d.view==="front"&&d.isDefault)??e.find(d=>d.isDefault)??e.find(d=>d.view===i&&s(d))??e.find(d=>d.view==="front"&&s(d))??e.find(d=>d.view===i)??e[0];return c?{image:c,mirrored:c.view==="side"&&a==="left"}:null}function t1(e,t,a){let i=.2*a.photoWidth/a.width,r=.2*a.photoHeight/a.height;return t.some(s=>s.x!==null&&s.y!==null&&Math.abs(s.x-e.x)<i&&Math.abs(s.y-e.y)<r)}function a1(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var Ji=(e,t,a)=>Math.min(a,Math.max(t,e));function Kd(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function Xp(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let i=Math.min(t.width/e.width,t.height/e.height),r=Math.max(a.zoom,Kd(e,t)),s=e.width*i*r,c=e.height*i*r,d=t.width/2-a.centerX*s,h=t.height/2-a.centerY*c;return{left:s<=t.width?(t.width-s)/2:Ji(d,t.width-s,0),top:c<=t.height?(t.height-c)/2:Ji(h,t.height-c,0),width:s,height:c}}function n1(e,t,a,i,r,s){let c=Xp(e,t,a);if(!c.width||!c.height)return a;let d=Kd(e,t),h=Ji(a.zoom*s,d,Math.max(4,d*2)),g=h/Math.max(a.zoom,d),b=c.width*g,N=c.height*g,f=(i.x-c.left)/c.width,v=(i.y-c.top)/c.height,V=r.x-f*b,M=r.y-v*N;return{zoom:h,centerX:Ji((t.width/2-V)/b,0,1),centerY:Ji((t.height/2-M)/N,0,1)}}function i1(e,t){let a=Math.max(1,t),i=Math.max(4,a*2);return .32+1.03*((Ji(e,a,i)-a)/(i-a))}function r1(e,t){return t?Math.max(1,e):e}function Pp(e,t,a){let i=Math.min(90,t.width/2),r=64,s=116,c=e.left+a.x*e.width,d=e.top+a.y*e.height,h=d+r,g=h+s<=t.height?h:d-r-s;return{left:Ji(c,i,t.width-i),top:Ji(g,0,Math.max(0,t.height-s))}}var o=cr(zs()),n="marinara-capability-villages",o1="marinara-capability-villages-styles",a2="/api/villages",n2=.7,ng=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],Zp=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),i2={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},Hr=e=>ng.find(t=>t.value===e),r2=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,s1={roads:"auto",structures:"auto",water:"auto"},Wd=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],l1=1,c1=3,o2={residence:["A modest stone home, with ivy growing on the walls","A tent and hammock pitched in the shade between two pine trees","A mighty castle, with imposing obsidian pillars and multiple dungeons","A dumpster behind the supermarket","An armored cash transport car, converted into a mobile home"],gathering:["A communal fire pit, with logs and stumps arranged around it in a semicircle","A decommissioned pizzeria, complete with inert animatronic performers","The situation room, with a round table bearing strategic maps","The hardy Brandythrone tavern, where ale and fistfights are plentiful","A meticulously-landscaped public park, where trampling the roses is punishable by fine"]},Qp="__villages_image_disabled__",d1=["neutral","happy","sad","angry","surprised","thinking"];function u1(e,t,a,i,r=!1,s=1){let c=t==="gathering"?"Gathering Place":r?"Your residence":`Residence ${s}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:i},occupancy:{playerHome:r,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}var R1={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function eu(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function s2(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let i=Math.floor(a/36e5),r=Math.max(1,Math.ceil(a%36e5/6e4));return i>0?`${i}h ${r}m left`:`${r}m left`}function l2({library:e,busy:t,onRefresh:a,onForget:i}){let[r,s]=(0,m.useState)("all"),[c,d]=(0,m.useState)(""),[h,g]=(0,m.useState)(""),[b,N]=(0,m.useState)(null),[f,v]=(0,m.useState)(""),V=Date.now(),M=(y,R)=>(!h.trim()||`${y} ${R.map(U=>U.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||R.some(U=>U.id===c)),O=(e?.recollections??[]).filter(y=>M(y.text,[...y.subjects,...y.knownBy])),$=(e?.durable??[]).filter(y=>M(y.text,[...y.subjects,...y.knownBy])),w=async(y,R)=>{try{let U=await L(`/rooms/archive/${encodeURIComponent(y)}`);N({visit:U.visit,lineIds:R}),v("")}catch(U){N(null),v(Q(U,"The source visit could not be read."))}};return(0,o.jsxs)("div",{className:`${n}-memory-library`,children:[(0,o.jsxs)("section",{className:`${n}-memory-hero`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-kicker`,children:"Continuity, with receipts"}),(0,o.jsx)("h3",{children:"What your villagers carry forward"}),(0,o.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,o.jsxs)("div",{className:`${n}-memory-stats`,children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,o.jsxs)("div",{className:`${n}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"01"}),(0,o.jsx)("strong",{children:"Passing"}),(0,o.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"02"}),(0,o.jsx)("strong",{children:"Durable"}),(0,o.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"03"}),(0,o.jsx)("strong",{children:"Archive"}),(0,o.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,o.jsxs)("div",{className:`${n}-memory-health`,role:"status",children:[(0,o.jsx)("span",{children:"\u25C7"}),(0,o.jsxs)("div",{children:[(0,o.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,o.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,o.jsxs)("div",{className:`${n}-memory-toolbar`,children:[(0,o.jsx)("div",{className:`${n}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([y,R])=>(0,o.jsx)("button",{type:"button","data-active":r===y,onClick:()=>s(y),children:R},y))}),(0,o.jsx)("input",{type:"search",value:h,onChange:y=>g(y.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,o.jsxs)("select",{value:c,onChange:y=>d(y.target.value),"aria-label":"Filter memories by resident",children:[(0,o.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(y=>(0,o.jsx)("option",{value:y.id,children:y.name},y.id))]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&r!=="durable"&&O.length>0?(0,o.jsxs)("section",{className:`${n}-memory-section`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,o.jsx)("h3",{children:"Passing recollections"})]}),(0,o.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,o.jsx)("div",{className:`${n}-memory-grid`,children:O.map(y=>{let R=y.evidence[y.evidence.length-1]??{visitId:y.visitId,lineIds:[]};return(0,o.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"passing",children:[(0,o.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${n}-memory-pill`,children:"Passing"}),(0,o.jsx)("span",{children:s2(y.expiresAt,V)})]}),(0,o.jsx)("p",{className:`${n}-memory-text`,children:y.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:eu(y.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:eu(y.knownBy)})]})]}),y.reinforcementCount>0?(0,o.jsxs)("p",{className:`${n}-memory-reinforced`,children:["\u21BB Reinforced ",y.reinforcementCount," ",y.reinforcementCount===1?"time":"times"]}):null,(0,o.jsxs)("div",{className:`${n}-memory-card-actions`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>{w(R.visitId,R.lineIds)},children:"View evidence"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>i("recollections",y.id),children:"Let go"})]})]},y.id)})})]}):null,e&&r!=="passing"&&$.length>0?(0,o.jsxs)("section",{className:`${n}-memory-section`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,o.jsx)("h3",{children:"Durable memories"})]}),(0,o.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,o.jsx)("div",{className:`${n}-memory-grid`,children:$.map(y=>(0,o.jsxs)("article",{className:`${n}-memory-card`,"data-kind":"durable",children:[(0,o.jsxs)("div",{className:`${n}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${n}-memory-pill`,children:y.memoryCategory?R1[y.memoryCategory]:y.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,o.jsxs)("span",{children:[y.dateLabel,h1(y)?` \xB7 ${h1(y)}`:""]})]}),(0,o.jsx)("p",{className:`${n}-memory-text`,children:y.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:eu(y.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:eu(y.knownBy)})]})]}),(0,o.jsxs)("div",{className:`${n}-memory-card-actions`,children:[y.evidence?(0,o.jsx)("button",{type:"button",onClick:()=>{w(y.evidence.visitId,y.evidence.lineIds)},children:"View evidence"}):(0,o.jsx)("span",{className:`${n}-memory-legacy`,children:"No evidence link on this older memory"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>i("durable",y.id),children:"Forget"})]})]},y.id))})]}):null,e&&(r!=="durable"&&O.length||r!=="passing"&&$.length)===0?(0,o.jsxs)("div",{className:`${n}-memory-empty`,children:[(0,o.jsx)("span",{children:"\u2727"}),(0,o.jsx)("h3",{children:"No memories match"}),(0,o.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,o.jsxs)("p",{className:`${n}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,f?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:f}):null,b?(0,o.jsxs)("section",{className:`${n}-memory-evidence`,children:[(0,o.jsxs)("div",{className:`${n}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,o.jsxs)("h3",{children:["Exact evidence \xB7 ",b.visit.placeName]})]}),(0,o.jsx)("button",{type:"button",onClick:()=>N(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,o.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,o.jsx)("ol",{children:b.visit.lines.filter(y=>b.lineIds.includes(y.id)).map(y=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:y.name||"Player"}),(0,o.jsxs)("small",{children:[iu(y.at)," \xB7 heard by"," ",y.heardBy.map(R=>b.visit.participants.find(U=>U.characterId===R)?.name??R).join(", ")||"no one"]})]}),cs(y.content,`memory-evidence-${y.id}-`)]},y.id))})]}):null]})}function iu(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":V1.format(t)}function h1(e){return iu(e.occurredAt)}function c2(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function m1(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Jp(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var d2=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function u2(e,t){let a=[],i=Date.parse(e);if(Number.isFinite(i)){let s=Math.floor((Date.now()-i)/864e5);a.push(s<=0?"written today":s===1?"written yesterday":`written ${s} days ago`)}let r=Date.parse(t);return a.push(Number.isFinite(r)?`fades ${d2.format(new Date(r))}`:"no set end"),a.join(" \xB7 ")}function h2(e,t){let a=e.find(i=>i.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.zoneId&&a.zones?a.zones.find(i=>i.id===t.zoneId)?.image?.url??"":t.area==="private"?a.privateSpaces?.find(i=>i.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?da(a,t.spaceClass).image:null)?.url??"":""}var ig=class extends m.Component{constructor(){super(...arguments);lc(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let i=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=i,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:i},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,o.jsx)("div",{className:`${n}-root`,role:"alert",children:(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h1",{className:`${n}-panel-title`,children:"Villages could not open"}),(0,o.jsx)("p",{className:`${n}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},Fp=`
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
`;function rg(){let e=document.getElementById(o1);if(!document.querySelector(n)){e?.remove();return}if(e){e.textContent!==Fp&&(e.textContent=Fp);return}let t=document.createElement("style");t.id=o1,t.textContent=Fp,document.head.appendChild(t)}var m2=new MutationObserver(()=>{document.querySelector(n)&&rg()});m2.observe(document.head,{childList:!0,subtree:!0});var p2="marinara_admin_secret";function M1(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(p2)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var g2="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.",_l=class extends Error{constructor(a,i,r){super(a);lc(this,"status",i);lc(this,"code",r)}};function z1(e,t,a){let i=e?.error,r=typeof i=="string"&&i?i:a;return t===403&&/admin[-_ ]?secret/iu.test(r)?new Error(`${g2} (${r})`):new _l(r,t,e?.code)}async function L(e,t){let a=await fetch(`${a2}${e}`,{...t,headers:M1(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw z1(i,a.status,`The village replied ${a.status}.`);return Y0(i)}async function sg(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:M1(t)}),i=await a.json().catch(()=>null);if(!a.ok)throw z1(i,a.status,`The Engine replied ${a.status}.`);return i}var Dr=e=>typeof e=="number"&&Number.isFinite(e);function lg(e){let t=e;for(let N=0;N<2&&typeof t=="string";N+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:i,srcY:r,srcWidth:s,srcHeight:c}=a;if(Dr(i)&&Dr(r)&&Dr(s)&&Dr(c))return s<=0||c<=0||i<0||r<0||i+s>1.001||r+c>1.001?null:{srcX:i,srcY:r,srcWidth:s,srcHeight:c};let{zoom:d,offsetX:h,offsetY:g,fullImage:b}=a;return!Dr(d)||d<=0||!Dr(h)||!Dr(g)||b!==void 0&&typeof b!="boolean"?null:b===void 0?{zoom:d,offsetX:h,offsetY:g}:{zoom:d,offsetX:h,offsetY:g,fullImage:b}}function f2(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function b2(e,t){if(e.length===0)return{};let a=await sg("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),i={};if(!Array.isArray(a))return i;for(let r of a){let s=typeof r?.id=="string"?r.id:"",c=typeof r?.avatarUrl=="string"?r.avatarUrl.trim():"";s.length>0&&c.length>0&&(i[s]={url:c,crop:lg(r.avatarCrop)})}return i}async function v2(e,t){let a=e.trim();if(a.length===0)return null;let i=await sg(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),r=typeof i?.avatarPath=="string"?i.avatarPath.trim():"";return r.length===0?null:{url:r,crop:lg(i.avatarCrop)}}function y2(e){let t=[];for(let a of e){let i=typeof a.id=="string"?a.id.trim():"";if(i.length===0)continue;let r=typeof a.provider=="string"?a.provider:"";if(r==="video_generation")continue;let s=typeof a.name=="string"&&a.name.trim()?a.name.trim():i;t.push({id:i,name:s,category:r==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function Q(e,t){return e instanceof Error&&e.message?e.message:t}function os(e){let t=Q(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function p1(e){try{let{session:t}=await L("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}async function ss(e,t){try{t&&await L(`/rooms/${encodeURIComponent(e)}/operations/${encodeURIComponent(t)}`,{signal:AbortSignal.timeout(5e3)});let{session:a}=await L("/rooms/active",{signal:AbortSignal.timeout(5e3)});if(a?.id===e)return a;let{visit:i}=await L(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return i}catch{return null}}async function g1(e,t){try{let{visit:a}=await L(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return Z0(a,t)?a:null}catch{return null}}function f1(e){let t=Q(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function ru(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function cs(e,t){return O1(L0(e),t)}function O1(e,t){let a=0;return e.map(i=>{let r=`${t}${a++}`;switch(i.kind){case"text":return i.text;case"code":return(0,o.jsx)("code",{className:`${n}-chat-md-code`,dir:"ltr",children:i.text},r);case"link":return(0,o.jsx)("a",{className:`${n}-chat-md-link`,href:i.href,target:"_blank",rel:"noopener noreferrer",children:i.text},r);default:return w2(i,r)}})}function w2(e,t){let a=O1(e.children,`${t}-`);switch(e.style){case"bold":return(0,o.jsx)("strong",{children:a},t);case"bold-italic":return(0,o.jsx)("strong",{children:(0,o.jsx)("em",{children:a})},t);case"italic":return(0,o.jsx)("em",{children:a},t);case"underline":return(0,o.jsx)("u",{children:a},t);case"strikethrough":return(0,o.jsx)("del",{children:a},t);default:return(0,o.jsx)("mark",{className:`${n}-chat-md-highlight`,children:a},t)}}function x2(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function ou(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}function $2({zone:e,onSave:t}){let[a,i]=(0,m.useState)(e.description),[r,s]=(0,m.useState)(e.state?.features.map(b=>b.text).join(`
`)??""),[c,d]=(0,m.useState)(!1),[h,g]=(0,m.useState)("");return(0,o.jsxs)("section",{className:n+"-venue-card",children:[(0,o.jsxs)("h2",{children:[e.label," details"]}),(0,o.jsxs)("label",{children:["Description",(0,o.jsx)("textarea",{value:a,onChange:b=>i(b.target.value)})]}),(0,o.jsxs)("label",{children:["Features \xB7 one per line",(0,o.jsx)("textarea",{value:r,onChange:b=>s(b.target.value)})]}),(0,o.jsx)("p",{children:e.area==="shared"||e.area==="private"?"Resident-controlled changes become exact proposals during an invited visit.":"These details describe this zone."}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:c||!a.trim(),onClick:async()=>{d(!0),g("");try{await t({description:a,state:{features:r.split(`
`).map(b=>b.trim()).filter(Boolean).map(b=>({...e.state?.features.find(N=>N.text===b),text:b}))}}),g(e.area==="shared"||e.area==="private"?"Saved. Any required resident approvals appear in the Venue.":"Zone saved.")}catch{g("The zone could not be saved. See the message above.")}finally{d(!1)}},children:c?"Saving\u2026":e.area==="shared"||e.area==="private"?"Save / propose zone changes":"Save zone details"}),h?(0,o.jsx)("p",{role:"status",children:h}):null]})}var us=["residence","workplace","gathering","other"];function _n(e){return e.classes?.length?e.classes:ou(e)?["residence"]:["other"]}function b1(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function su(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function da(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function v1({draft:e,existing:t,villagers:a,editableClasses:i,onChange:r}){let s=_n(e),c=(d,h)=>{let g=s.map(b=>b===d?{...da(e,b),...h}:da(e,b));r({...e,spaces:g,description:g[0]?.description??e.description})};return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["Name",(0,o.jsx)("input",{className:`${n}-notice-input`,value:e.name,maxLength:100,onChange:d=>r({...e,name:d.target.value}),placeholder:"The Lantern Workshop"})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Form ",(0,o.jsx)("span",{className:`${n}-hint`,children:"What is it, in your world?"}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:e.form??"",maxLength:200,onChange:d=>r({...e,form:d.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Map pin \xB7 optional"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,o.jsx)("div",{className:`${n}-row`,children:["x","y"].map(d=>(0,o.jsxs)("label",{className:`${n}-label`,children:[d==="x"?"Across":"Down",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[d]??"",disabled:t&&su(e)>0,onChange:h=>r({...e,presentation:{...e.presentation,[d]:h.target.value===""?null:Number(h.target.value)}})})]},d))}),t&&su(e)>0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${n}-row`,children:us.map(d=>(0,o.jsxs)("label",{className:`${n}-label`,style:{textTransform:"capitalize"},children:[(0,o.jsx)("input",{type:"checkbox",checked:s.includes(d),disabled:t||!s.includes(d)&&s.length>=2,onChange:h=>{let g=h.target.checked?[...s,d]:s.filter(b=>b!==d);g.length<1||g.length>2||r({...e,classes:g,spaces:g.map(b=>da(e,b))})}})," ",d]},d))}),t?(0,o.jsx)("p",{className:`${n}-hint`,children:"Class changes go through a Venue proposal."}):null]}),s.includes("residence")?(0,o.jsxs)("label",{className:`${n}-label`,children:["Resident capacity \xB7 includes you",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:d=>r({...e,residenceCapacity:Number(d.target.value)})}),t?(0,o.jsx)("span",{className:`${n}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,s.includes("workplace")?(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Workers"}),a.map(d=>(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(d.characterId),onChange:h=>r({...e,workerIds:h.target.checked?[...e.workerIds??[],d.characterId]:(e.workerIds??[]).filter(g=>g!==d.characterId)})})," ",d.name]},d.characterId)),a.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No villagers are available yet."}):null]}):null,s.filter(d=>!i||i.includes(d)).map(d=>{let h=da(e,d);return(0,o.jsxs)("section",{className:`${n}-field`,children:[(0,o.jsxs)("h3",{className:`${n}-panel-title`,style:{textTransform:"capitalize"},children:[d," space"]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.description,maxLength:1e3,onChange:g=>c(d,{description:g.target.value})})]}),(0,o.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Current physical state used by visits and pictures."}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:h.state.condition,onChange:g=>c(d,{state:{...h.state,condition:g.target.value}})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this space."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.state.items.join(`
`),onChange:g=>c(d,{state:{...h.state,items:g.target.value.split(`
`)}})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this space."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:h.state.publicFacts.join(`
`),onChange:g=>c(d,{state:{...h.state,publicFacts:g.target.value.split(`
`)}})})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((g,b)=>(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("input",{className:`${n}-notice-input`,value:g.text,"aria-label":`Feature ${b+1}`,onChange:N=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,text:N.target.value}:f)}})}),(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:g.locked,onChange:N=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,locked:N.target.checked}:f)}})})," ","Locked"]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,"aria-label":`Remove feature ${b+1}`,onClick:()=>c(d,{state:{...h.state,features:h.state.features.filter(N=>N.id!==g.id)}}),children:"\xD7"})]},g.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:h.state.features.length>=5,onClick:()=>c(d,{state:{...h.state,features:[...h.state.features,{id:Fd(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},d)})]})}function ls(e){return e.filter(t=>!ou(t)||_n(t).some(a=>a!=="residence"))}function tu(){return Math.random().toString(36).slice(2,10)}function _r(e){return Math.round(e*1e4)/1e4}var N2=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),V1=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),S2=6e4,k2=700;function y1(e){return`${N2.format(e)} \xB7 ${V1.format(e)}`}function T2(){let[e,t]=(0,m.useState)(()=>y1(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(y1(new Date)),1e3);return()=>clearInterval(a)},[]),e}function C2(){let[e,t]=T2().split(" \xB7 ");return(0,o.jsxs)("span",{className:`${n}-mobile-clock`,children:[(0,o.jsx)("span",{children:e}),(0,o.jsx)("strong",{children:t})]})}function E2({weather:e}){return(0,o.jsxs)("span",{className:`${n}-mobile-datetime`,children:[(0,o.jsx)(C2,{}),(0,o.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:A2(e)})]})}function A2(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function w1(e){return e?.closest(n)??null}function R2(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let r=()=>t(w1(document.fullscreenElement)!==null);return r(),document.addEventListener("fullscreenchange",r),()=>document.removeEventListener("fullscreenchange",r)},[]);let a=document.fullscreenEnabled,i=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":i,title:i,onClick:r=>{let s=w1(r.currentTarget);if(!s)return;if(document.fullscreenElement===s){document.exitFullscreen().catch(()=>{});return}let c=s.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,o.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,o.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,o.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function M2({happenings:e,recap:t,mobile:a=!1}){let i=(0,m.useRef)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=i.current;if(!c)return;let d=()=>s(c.open);return c.addEventListener("toggle",d),()=>c.removeEventListener("toggle",d)},[]),(0,m.useEffect)(()=>{if(!r)return;let c=d=>{!(d.target instanceof Node)||i.current?.contains(d.target)||i.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[r]),(0,o.jsxs)("details",{ref:i,className:`${n}-news`,children:[(0,o.jsxs)("summary",{className:`${n}-button ${n}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,o.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,o.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,o.jsx)("span",{className:`${n}-news-nyi`,children:"NYI"})]}),(0,o.jsxs)("div",{className:`${n}-news-panel`,children:[(0,o.jsx)("h2",{className:`${n}-news-title`,children:"Events"}),t?(0,o.jsxs)("div",{children:[(0,o.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,o.jsx)("ul",{className:`${n}-news-list`,children:t.details.map(c=>(0,o.jsx)("li",{className:`${n}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,o.jsx)("p",{className:`${n}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,o.jsxs)("p",{className:`${n}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,o.jsx)("p",{className:`${n}-news-empty`,children:"No events to show yet."}):(0,o.jsx)("ul",{className:`${n}-news-list`,children:e.map(c=>(0,o.jsx)("li",{className:`${n}-news-item`,children:c.text},c.id))})]})]})}function I1(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function z2(e){return e.length>0?I1(e,!0):"Empty house"}function O2(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function x1(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function V2(e,t){return t.length>0?I1(t,!0):e.name||"An empty house"}function au(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var I2=.028;function ds(e){return new Promise((t,a)=>{let i=new FileReader;i.onload=()=>t(typeof i.result=="string"?i.result:""),i.onerror=()=>a(new Error("That picture could not be read.")),i.readAsDataURL(e)})}function nu(e){return new Promise((t,a)=>{let i=new Image;i.onload=()=>t({width:i.naturalWidth,height:i.naturalHeight}),i.onerror=()=>a(new Error("That picture could not be read.")),i.src=e})}var $1=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function Kp(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}var D2=`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><rect width="640" height="440" fill="#11285b"/><g stroke="#6c9bd5" opacity=".34" stroke-width="1"><path d="M0 40H640M0 80H640M0 120H640M0 160H640M0 200H640M0 240H640M0 280H640M0 320H640M0 360H640M0 400H640M40 0V440M80 0V440M120 0V440M160 0V440M200 0V440M240 0V440M280 0V440M320 0V440M360 0V440M400 0V440M440 0V440M480 0V440M520 0V440M560 0V440M600 0V440"/></g><g fill="none" stroke="#d7e9ff" stroke-width="5" stroke-linejoin="round"><path d="M110 195 320 88 530 195 320 302Z"/><path d="M110 195v150l210 87 210-87V195M320 302v130"/><path d="M212 153v89l108 46 108-46v-89M257 128v76l63 29 63-29v-76"/><path d="M160 221v72l95 40v-72zM385 334l95-40v-72l-95 40z"/></g><g fill="#d7e9ff" font-family="Arial,sans-serif" letter-spacing="9" text-anchor="middle"><text x="320" y="48" font-size="22">VILLAGE PROJECT</text></g></svg>')}`;function Wp(e,t,a){return e<t?t:e>a?a:e}function _2(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),d=e.width*c,h=e.height*c;return{left:(t.width-d)/2,top:(t.height-h)/2,width:d,height:h}}let i=Math.max(t.width/e.width,t.height/e.height)*a.zoom,r=e.width*i,s=e.height*i;return{left:(t.width-r)*(a.focusX/100),top:(t.height-s)*(a.focusY/100),width:r,height:s}}function H2(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Il(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function eg({src:e,alt:t,pins:a,placing:i,view:r,shape:s,zoom:c,onPlace:d,onView:h,onDismiss:g,compact:b,fitToRoom:N,mobile:f,photoPins:v,children:V}){let M=d!==void 0,O=h!==void 0,$=(0,m.useRef)(null),w=(0,m.useRef)(null),[y,R]=(0,m.useState)(null),[U,Z]=(0,m.useState)(null),[F,te]=(0,m.useState)(null),ye=(0,m.useRef)(null),oe=(0,m.useRef)(new Map),Pe=(0,m.useRef)(null),[qe,yt]=(0,m.useState)(null),[Oe,ct]=(0,m.useState)(null),Et=(0,m.useRef)(null),qt=(0,m.useRef)(null),A=(0,m.useRef)(!1),[X,Y]=(0,m.useState)(null),le=(0,m.useMemo)(()=>X?{...r,...X}:r,[X,r]),$e=e?y?.src===e?y:null:s,Ze={zoom:$e&&U?Kd($e,U):1,centerX:.5,centerY:.5},_e=F??Ze,W=(0,m.useMemo)(()=>f?$e&&U?Xp($e,U,_e):null:e?y&&y.src===e&&U?_2(y,U,le):null:U?{left:0,top:0,width:U.width,height:U.height}:null,[y,U,le,f,$e,_e,e]);(0,m.useEffect)(()=>{te(null),ye.current=null,oe.current.clear(),Pe.current=null},[e,U?.width,U?.height]);let St=s?N&&qe?{width:`${qe.width}px`,height:`${qe.height}px`,aspectRatio:`${s.width} / ${s.height}`}:{aspectRatio:`${s.width} / ${s.height}`}:void 0,Dt=(0,m.useCallback)(()=>{let D=w.current;if(!D)return;let G=D.getBoundingClientRect();G.width===0||G.height===0||Z(ae=>ae&&ae.width===G.width&&ae.height===G.height?ae:{width:G.width,height:G.height})},[]);(0,m.useEffect)(()=>{let D=w.current;if(!D||typeof ResizeObserver>"u")return;let G=new ResizeObserver(()=>Dt());return G.observe(D),()=>G.disconnect()},[Dt]);let ot=(0,m.useCallback)(()=>{let D=$.current?.parentElement;if(!D||!s)return;let G=D.getBoundingClientRect(),ae=getComputedStyle(D),we=B=>Number.parseFloat(ae.getPropertyValue(B))||0,Re=G.width-we("padding-left")-we("padding-right"),Ie=G.height-we("padding-top")-we("padding-bottom"),et=s.width/s.height,ee=Math.min(Re,Ie*et);ee>0&&yt(B=>B&&Math.abs(B.width-ee)<.5?B:{width:ee,height:ee/et})},[s]);(0,m.useLayoutEffect)(()=>{if(!N||(ot(),typeof ResizeObserver>"u"))return;let D=$.current?.parentElement;if(!D)return;let G=new ResizeObserver(()=>ot());return G.observe(D),()=>G.disconnect()},[N,ot]);let dt=(0,m.useCallback)(D=>{if(!M||!d||!W)return;let G=D.currentTarget.getBoundingClientRect(),ae=(D.clientX-G.left-W.left)/W.width,we=(D.clientY-G.top-W.top)/W.height;if(!(ae>=0&&ae<=1)||!(we>=0&&we<=1))return;let Ie=w.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();d(_r(ae),_r(we),{width:W.width,height:W.height,photoWidth:Ie?.width??58,photoHeight:Ie?.height??58})},[d,M,W]),Qe=(0,m.useCallback)(D=>{if(!O||!W||!h||le.fit!=="cover")return;let G=D.currentTarget.getBoundingClientRect();Et.current={x:D.clientX,y:D.clientY,focusX:le.focusX,focusY:le.focusY,spanX:G.width-W.width,spanY:G.height-W.height},Y({focusX:le.focusX,focusY:le.focusY}),D.currentTarget.setPointerCapture(D.pointerId),D.preventDefault()},[O,le.focusX,le.focusY,le.fit,h,W]),Ve=(0,m.useCallback)(D=>{let G=Et.current;if(!G)return;let ae=G.spanX===0?G.focusX:G.focusX+(D.clientX-G.x)/G.spanX*100,we=G.spanY===0?G.focusY:G.focusY+(D.clientY-G.y)/G.spanY*100;Y({focusX:_r(Wp(ae,0,100)),focusY:_r(Wp(we,0,100))})},[]),ut=(0,m.useCallback)(D=>{if(!Et.current)return;Et.current=null,D.currentTarget.hasPointerCapture(D.pointerId)&&D.currentTarget.releasePointerCapture(D.pointerId);let G=X;Y(null),G&&h&&h({...r,...G})},[X,h,r]),ie=(0,m.useCallback)(D=>{!h||!c||h({...r,zoom:_r(Wp(D,c.min,c.max))})},[h,r,c]),Ae=()=>{let D=[...oe.current.values()];if(D.length===0){Pe.current=null;return}let G=D[0],ae=D[1];Pe.current={view:ye.current??_e,x:ae?(G.x+ae.x)/2:G.x,y:ae?(G.y+ae.y)/2:G.y,distance:ae?Math.hypot(G.x-ae.x,G.y-ae.y):1}},me=D=>{if(!f||D.pointerType!=="touch"||(D.isPrimary&&(oe.current.clear(),A.current=!1),!w.current)||D.target instanceof Element&&D.target.closest(`.${n}-doors, .${n}-zoom`))return;$.current?.setAttribute("data-mobile-gesturing","true");let G=w.current.getBoundingClientRect();oe.current.set(D.pointerId,{x:D.clientX-G.left,y:D.clientY-G.top}),oe.current.size>1&&(A.current=!0),Ae()},Je=D=>{if(!f||!oe.current.has(D.pointerId)||!$e||!U||!w.current)return;let G=w.current.getBoundingClientRect();oe.current.set(D.pointerId,{x:D.clientX-G.left,y:D.clientY-G.top});let ae=[...oe.current.values()],we=ae[0],Re=ae[1],Ie=Re?(we.x+Re.x)/2:we.x,et=Re?(we.y+Re.y)/2:we.y,ee=Re?Math.hypot(we.x-Re.x,we.y-Re.y):1,B=Pe.current;if(!B||!a1(B,{x:Ie,y:et,distance:ee})&&!A.current)return;A.current||g?.(),A.current=!0;let De=n1($e,U,B.view,{x:B.x,y:B.y},{x:Ie,y:et},Re&&B.distance>0?ee/B.distance:1);ye.current=De,te(De)},Be=(D,G=!1)=>{if(!f||!oe.current.has(D.pointerId))return;let ae=!G&&oe.current.size===1&&!A.current;if(oe.current.delete(D.pointerId),oe.current.size===0&&$.current?.removeAttribute("data-mobile-gesturing"),Ae(),!ae||!(D.target instanceof Element))return;let we=D.target.closest(`.${n}-pin`)?.dataset.pinId,Re=we?a.find(Ie=>Ie.id===we):null;if(Re?.onSelect){A.current=!0,Re.onSelect();return}if(!(!D.target.closest(`.${n}-canvas`)||D.target.closest("button")))if(M&&i&&d&&W){let Ie=w.current.getBoundingClientRect(),et=(D.clientX-Ie.left-W.left)/W.width,ee=(D.clientY-Ie.top-W.top)/W.height;if(et>=0&&et<=1&&ee>=0&&ee<=1){A.current=!0;let Yt=w.current?.querySelector(`.${n}-pin-photo`)?.getBoundingClientRect();d(_r(et),_r(ee),{width:W.width,height:W.height,photoWidth:Yt?.width??72,photoHeight:Yt?.height??72})}}else g&&(A.current=!0,g())};return(0,o.jsxs)("div",{ref:$,className:`${n}-stage${b?` ${n}-stage-compact`:""}`,style:St,"data-shaped":s?"true":"false","data-framing":O&&le.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":v?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:D=>{if(f){me(D);return}A.current=!1,qt.current=D.pointerType==="touch"?{x:D.clientX,y:D.clientY}:null},onPointerMoveCapture:D=>{if(f){Je(D);return}let G=qt.current;G&&(Math.abs(D.clientX-G.x)>8||Math.abs(D.clientY-G.y)>8)&&(A.current=!0)},onPointerUpCapture:f?Be:void 0,onPointerCancelCapture:D=>{f&&Be(D,!0),qt.current&&(A.current=!0)},onClickCapture:D=>{A.current&&(A.current=!1,D.preventDefault(),D.stopPropagation())},children:[V,(0,o.jsxs)("div",{ref:w,className:`${n}-canvas`,"data-placing":M&&i?"true":"false","data-dragging":X?"true":"false",onClick:M&&i?dt:g?()=>g():void 0,onPointerDown:O?Qe:void 0,onPointerMove:O?Ve:void 0,onPointerUp:O?ut:void 0,onPointerCancel:O?ut:void 0,children:[e?(0,o.jsx)("img",{className:`${n}-canvas-img`,style:f&&W?{position:"absolute",left:W.left,top:W.top,width:W.width,height:W.height,objectFit:"fill"}:H2(le),src:e,alt:t,draggable:!1,onLoad:D=>{let{naturalWidth:G,naturalHeight:ae}=D.currentTarget;G<=0||ae<=0||(R({src:e,width:G,height:ae}),Dt())},onError:()=>ct(e)}):(0,o.jsxs)(o.Fragment,{children:[f&&W?(0,o.jsx)("span",{className:`${n}-mobile-logical`,style:{left:W.left,top:W.top,width:W.width,height:W.height},"aria-hidden":"true"}):null,(0,o.jsx)("span",{className:`${n}-canvas-empty`,children:"Logical village map"})]}),e&&Oe===e?(0,o.jsx)("span",{className:`${n}-canvas-missing`,children:"The map picture could not be loaded \u2014 choose another one in Village Settings \u2192 Village Map."}):null,W?a.map(D=>(0,o.jsxs)("span",{className:`${n}-pin-holder`,"data-selected":D.selected?"true":"false",style:{left:`${W.left+D.x*W.width}px`,top:`${W.top+(D.y+(f&&D.kind!=="person"?0:D.dy??0))*W.height}px`},children:[(0,o.jsx)("button",{type:"button",className:`${n}-pin`,"data-pin-id":D.id,"data-tone":D.tone,"data-kind":D.kind??"place","data-selected":D.selected?"true":"false","aria-expanded":D.doors?!0:void 0,disabled:D.onSelect===void 0,title:D.text,onClick:G=>{G.stopPropagation(),D.onSelect?.()},children:(f||v)&&D.kind!=="person"?(0,o.jsxs)("span",{className:`${n}-pin-photo-card`,style:{transform:`scale(${r1(f?i1(_e.zoom,Ze.zoom):n2,D.selected===!0)})`},children:[(0,o.jsxs)("span",{className:`${n}-pin-photo`,"aria-hidden":"true",children:[D.image?(0,o.jsx)("img",{src:D.image,alt:"",loading:"lazy",draggable:!1}):(0,o.jsx)("span",{className:`${n}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,o.jsx)("span",{className:`${n}-pin-photo-tack`})]}),(0,o.jsx)("span",{className:`${n}-pin-name`,children:D.text})]}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("span",{"aria-hidden":"true",className:`${n}-pin-tack`,children:(0,o.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,o.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,o.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,o.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,o.jsx)("span",{className:`${n}-pin-name`,children:D.text})]})}),D.onRemove?(0,o.jsx)("button",{type:"button",className:`${n}-pin-remove`,"aria-label":`Take ${D.text} off the map`,onClick:G=>{G.stopPropagation(),D.onRemove?.()},children:"\xD7"}):null,D.onResume?(0,o.jsx)("button",{type:"button",className:`${n}-pin-resume`,onClick:G=>{G.stopPropagation(),D.onResume?.()},children:"DEBUG: Resume Chat"}):null]},D.id)):null]}),W?a.filter(D=>D.doors!==void 0&&D.doors.length>0).map(D=>(0,o.jsx)("div",{className:`${n}-doors`,style:{left:`${U?Pp(W,U,D).left:W.left+D.x*W.width}px`,top:`${U?Pp(W,U,D).top:W.top+(D.y+(D.dy??0))*W.height}px`},children:D.doors?.map(G=>(0,o.jsx)("button",{type:"button",className:`${n}-door`,onClick:ae=>{ae.stopPropagation(),G.onSelect()},children:G.label},G.label))},`doors:${D.id}`)):null,O&&c&&le.fit==="cover"?(0,o.jsxs)("div",{className:`${n}-zoom`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:le.zoom>=c.max,onClick:()=>ie(le.zoom+c.step),children:"+"}),(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:le.zoom<=c.min,onClick:()=>ie(le.zoom-c.step),children:"\u2212"}),(0,o.jsx)("button",{type:"button",className:`${n}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:le.focusX===50&&le.focusY===50&&le.zoom===c.min,onClick:()=>{h&&h({...r,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function Dl(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function U2({scenario:e}){let t=r2(e),[a,i]=(0,m.useState)(null);return(0,o.jsxs)("div",{className:`${n}-scenario-art-panel`,children:[a===t?(0,o.jsx)("span",{className:`${n}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,o.jsx)("img",{src:t,alt:`${Hr(e).label} village scene`,onError:()=>i(t)}),(0,o.jsxs)("div",{className:`${n}-scenario-art-content`,children:[(0,o.jsx)("p",{children:"A new beginning awaits."}),(0,o.jsx)("strong",{children:Hr(e).description})]})]})}function q2({label:e,choices:t,selectedId:a,onSelect:i,disabled:r,emptyMessage:s}){return t.length?(0,o.jsx)("div",{className:`${n}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,o.jsxs)("button",{type:"button",className:`${n}-identity-card`,"aria-pressed":a===c.id,disabled:r,onClick:()=>i(c.id),children:[(0,o.jsx)(Ur,{portrait:c.portrait,name:c.name,className:`${n}-identity-card-face`,glyph:"person"}),(0,o.jsx)("strong",{children:c.name}),c.hint?(0,o.jsx)("small",{children:c.hint}):null]},c.id))}):(0,o.jsx)("p",{className:`${n}-hint`,children:s})}function B2({value:e}){return(0,o.jsxs)("section",{className:`${n}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,o.jsx)(Ur,{portrait:e.portrait,name:e.name,className:`${n}-identity-preview-face`,glyph:"person"}),(0,o.jsxs)("div",{className:`${n}-identity-preview-copy`,children:[(0,o.jsx)("h3",{children:e.name}),e.overview?(0,o.jsx)("p",{className:`${n}-identity-overview`,children:e.overview}):null,e.details.length?(0,o.jsx)("dl",{className:`${n}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:t}),(0,o.jsx)("dd",{children:a})]},t))}):null,(0,o.jsx)("p",{className:`${n}-identity-context`,children:e.context})]})]})}function N1(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let i=a.lastIndexOf(" ",t),r=a.indexOf(" ",t);return`${a.slice(0,i>0?i:r>0?r:a.length).trimEnd()}\u2026`}function S1(e){return e.avatarPath?{url:e.avatarPath,crop:lg(e.avatarCrop)}:void 0}function L2({personas:e,draft:t,onDraft:a,disabled:i}){let[r,s]=(0,m.useState)(""),[c,d]=(0,m.useState)(null),[h,g]=(0,m.useState)(""),b=e?.find(M=>M.id===t),N=b?.id,f=r.trim().toLocaleLowerCase(),v=(e??[]).filter(M=>!f||`${M.name} ${M.summary}`.toLocaleLowerCase().includes(f)).sort((M,O)=>M.name.localeCompare(O.name,void 0,{sensitivity:"base"})).map(M=>({id:M.id,name:M.name,portrait:S1(M),hint:M.summary}));(0,m.useEffect)(()=>{if(d(null),g(""),!t||!N)return;let M=new AbortController;return L(`/personas/${encodeURIComponent(t)}`,{signal:M.signal}).then(O=>{M.signal.aborted||d(O.persona)}).catch(O=>{M.signal.aborted||g(Q(O,"This Persona could not be read."))}),()=>M.abort()},[t,N]);let V=c&&c.id===t?{id:c.id,name:c.name,portrait:S1(c),overview:N1(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,M])=>M.trim()).map(([M,O])=>({label:M,text:N1(O,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,o.jsxs)("div",{className:`${n}-founding-persona`,children:[(0,o.jsxs)("div",{className:`${n}-identity-picker-head`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-persona-search`,children:"Who are you?"}),(0,o.jsx)("input",{id:`${n}-setup-persona-search`,className:`${n}-search`,type:"search",value:r,placeholder:"Search Personas",onChange:M=>s(M.target.value),disabled:i||e===null})]}),(0,o.jsx)(q2,{label:"Choose a Persona",choices:v,selectedId:t,onSelect:a,disabled:i,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!b?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):V?(0,o.jsx)(B2,{value:V}):h?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:h}):b?(0,o.jsxs)("p",{className:`${n}-hint`,children:["Reading ",b.name,"\u2026"]}):(0,o.jsx)("p",{className:`${n}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function j2({idPrefix:e,personas:t,draft:a,onDraft:i,storedId:r,storedName:s,storedMissing:c,disabled:d}){let h=(t??[]).find(f=>f.id===a)??null,g=h?.name??(a===r?s:""),b=c&&a===r,N=a.length>0;return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-${e}-persona`,children:"Who are you?"}),(0,o.jsxs)("select",{id:`${n}-${e}-persona`,className:`${n}-select`,value:a,disabled:d||t===null||t.length===0,onChange:f=>i(f.target.value),children:[(0,o.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,o.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),N?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:b?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,o.jsx)("p",{className:`${n}-macro-help`,children:h.summary}):null]}):null]})}function k1({books:e,error:t,selected:a,onChange:i,disabled:r}){let[s,c]=(0,m.useState)(""),d=new Map((e??[]).map(v=>[v.id,v])),h=(e??[]).filter(v=>!v.hiddenFromLibrary||a.includes(v.id)),g=a.filter(v=>!d.has(v)),N=[...h,...g.map(v=>({id:v,name:v,enabled:!1}))].filter(v=>v.name.toLocaleLowerCase().includes(s.trim().toLocaleLowerCase())),f=N.slice(0,50);return(0,o.jsxs)("fieldset",{className:`${n}-field ${n}-lore-picker`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Lorebooks for this village"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,o.jsx)("div",{className:`${n}-lore-selected`,"aria-live":"polite",children:a.length?a.map(v=>(0,o.jsxs)("span",{className:`${n}-lore-chip`,children:[(0,o.jsxs)("span",{children:[d.get(v)?.name??v,e===null?" (checking)":d.has(v)?d.get(v)?.enabled?"":" (disabled)":" (missing)"]}),(0,o.jsx)("button",{type:"button","aria-label":`Remove ${d.get(v)?.name??v}`,disabled:r,onClick:()=>i(a.filter(V=>V!==v)),children:"\xD7"})]},v)):(0,o.jsx)("span",{className:`${n}-hint`,children:"No lorebooks selected."})}),t?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:t}):null,e===null&&!t?(0,o.jsx)("p",{className:`${n}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No lorebooks in the Engine library."}):null,(0,o.jsxs)("details",{className:`${n}-lore-options`,children:[(0,o.jsxs)("summary",{className:`${n}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,o.jsx)("input",{type:"search",className:`${n}-search`,value:s,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:v=>c(v.target.value)}),(0,o.jsxs)("div",{className:`${n}-lore-results`,children:[f.map(v=>{let V=a.includes(v.id),M=g.includes(v.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":v.enabled?"":"Disabled \u2014 skipped";return(0,o.jsxs)("label",{className:`${n}-reason-option`,children:[(0,o.jsx)("input",{type:"checkbox",checked:V,disabled:r||!v.enabled&&!V||!V&&a.length>=24,onChange:()=>i(V?a.filter(O=>O!==v.id):[...a,v.id])}),v.name,M?` (${M})`:""]},v.id)}),e!==null&&N.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No matching lorebooks."}):null,N.length>f.length?(0,o.jsx)("p",{className:`${n}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function T1({id:e,label:t,hint:a,options:i,value:r,disabled:s,onChange:c}){let d=r.length>0&&!i.some(h=>h.id===r);return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:e,children:t}),(0,o.jsxs)("select",{id:e,className:`${n}-select`,value:r,disabled:s,onChange:h=>c(h.target.value),children:[(0,o.jsx)("option",{value:"",children:"Engine default"}),d?(0,o.jsx)("option",{value:r,children:"Missing \u2014 this connection is gone"}):null,i.map(h=>(0,o.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,o.jsx)("span",{className:`${n}-hint`,children:a})]})}function tg({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[i,r]=(0,m.useState)(null),[s,c]=(0,m.useState)([]),[d,h]=(0,m.useState)(""),[g,b]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let O=!1;return(async()=>{try{let[$,w]=await Promise.all([L("/connections"),sg("/api/connections")]);if(O)return;r($),c(y2(Array.isArray(w)?w:[]))}catch($){O||h(Q($,"This agent's connections could not be read."))}})(),()=>{O=!0}},[]);let N=(0,m.useCallback)(async O=>{b(!0),h("");try{r(await L("/connections",{method:"PUT",body:JSON.stringify(O)}))}catch($){h(Q($,"That connection could not be saved."))}finally{b(!1)}},[]),f=s.filter(O=>O.category==="language"),v=s.filter(O=>O.category==="image_generation"),V=v.some(O=>O.defaultForAgents),M=i!==null&&(i.imageConnectionId===Qp||v.length===0||i.imageConnectionId.length===0&&!V);return(0,m.useEffect)(()=>{if(!e)return;let O=i?.systemConnectionId??"",$=i?.narrationConnectionId??"";i?O.length===0||$.length===0?e("Choose both System and Narration connections before continuing."):!f.some(w=>w.id===O)||!f.some(w=>w.id===$)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,i,f]),(0,m.useEffect)(()=>{t?.(M)},[M,t]),(0,o.jsxs)("div",{className:`${n}-field ${a?`${n}-connections-compact`:""}`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Connections"}),a?(0,o.jsx)("p",{className:`${n}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,o.jsx)("p",{className:`${n}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),i?(0,o.jsxs)("div",{className:a?`${n}-connections-grid`:"",children:[(0,o.jsx)(T1,{id:`${n}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:f,value:i.systemConnectionId,disabled:g,onChange:O=>{N({systemConnectionId:O})}}),(0,o.jsx)(T1,{id:`${n}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:f,value:i.narrationConnectionId,disabled:g,onChange:O=>{N({narrationConnectionId:O})}}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-connection-image`,children:"Images"}),(0,o.jsxs)("select",{id:`${n}-connection-image`,className:`${n}-select`,value:i.imageConnectionId,disabled:g,onChange:O=>{N({imageConnectionId:O.target.value})},children:[(0,o.jsx)("option",{value:Qp,children:"Disabled"}),(0,o.jsx)("option",{value:"",children:"Use Engine default"}),i.imageConnectionId.length>0&&i.imageConnectionId!==Qp&&!v.some(O=>O.id===i.imageConnectionId)?(0,o.jsx)("option",{value:i.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,v.map(O=>(0,o.jsx)("option",{value:O.id,children:O.name},O.id))]}),(0,o.jsx)("span",{className:`${n}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,o.jsxs)(o.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,o.jsxs)("span",{className:`${n}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,o.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):d.length===0?(0,o.jsx)("span",{className:`${n}-hint`,children:"Reading this agent's connections\u2026"}):null,d?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:d}):null]})}function G2(){let[e,t]=(0,m.useState)(null),[a,i]=(0,m.useState)(""),[r,s]=(0,m.useState)(!1),[c,d]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return L("/narration").then(b=>{g||t(b)}).catch(b=>{g||i(Q(b,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{s(!0),d(!1),i("");try{let b=await L("/narration",{method:"PUT",body:JSON.stringify(g)});return t(b),d(!0),b}catch(b){return i(Q(b,"That writing change could not be saved.")),null}finally{s(!1)}},[]);return{view:e,error:a,busy:r,saved:c,save:h}}function Y2(){let{view:e,error:t,busy:a,saved:i,save:r}=G2(),[s,c]=(0,m.useState)(null),d=s??e?.writingGuidance??"";return(0,o.jsxs)("div",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Additional writing guidance"}),(0,o.jsx)("p",{className:n+"-empty",children:"Optionally influence narration and dialogue in this village. Resident cards, scene facts, and the player's choices remain in charge. Leave this empty for Villages' own scene writing. Saved changes apply to the next generated venue turn."}),e?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("textarea",{className:n+"-textarea","aria-label":"Additional writing guidance",value:d,rows:5,maxLength:e.writingGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||d===e.writingGuidance,onClick:()=>{r({writingGuidance:d}).then(h=>{h&&c(h.writingGuidance)})},children:"Apply guidance"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:a||!d,onClick:()=>{r({writingGuidance:""}).then(h=>{h&&c(h.writingGuidance)})},children:"Clear guidance"}),(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Tense"}),(0,o.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{r({tense:h.target.value})},children:[(0,o.jsx)("option",{value:"present",children:"Present"}),(0,o.jsx)("option",{value:"past",children:"Past"})]})]}),(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Person"}),(0,o.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{r({person:h.target.value})},children:[(0,o.jsx)("option",{value:"first",children:"First person (I)"}),(0,o.jsx)("option",{value:"second",children:"Second person (you)"}),(0,o.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,o.jsxs)("label",{className:n+"-field",children:[(0,o.jsx)("span",{className:n+"-label",children:"Content rating"}),(0,o.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{r({rating:h.target.value})},children:[(0,o.jsx)("option",{value:"sfw",children:"SFW"}),(0,o.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,o.jsx)("span",{className:n+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,o.jsx)("span",{className:n+"-hint",children:"Reading village writing settings\u2026"}),a?(0,o.jsx)("span",{className:n+"-hint",children:"Saving\u2026"}):null,i&&!a?(0,o.jsx)("span",{className:n+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:t}):null]})}function Ur({portrait:e,name:t,className:a,glyph:i="initial"}){return(0,o.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,o.jsx)("img",{src:e.url,alt:"",style:f2(e.crop)}):i==="person"?(0,o.jsxs)("svg",{className:`${n}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,o.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,o.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function X2({villager:e,portrait:t,selected:a,onSelect:i}){return(0,o.jsxs)("div",{className:`${n}-tile`,"data-selected":a?"true":"false",children:[(0,o.jsxs)("div",{className:`${n}-tile-head`,children:[(0,o.jsx)(Ur,{portrait:t,name:e.name,className:`${n}-avatar`}),(0,o.jsx)("button",{type:"button",className:`${n}-tile-name`,onClick:i,disabled:i===void 0,title:i?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,o.jsx)("p",{className:`${n}-tile-summary`,children:e.summary}):null,(0,o.jsxs)("div",{className:`${n}-tile-meta`,children:[e.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(r=>(0,o.jsx)("span",{className:`${n}-tag`,children:r},r))]})]})}function C1(e,t){let a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=e,i.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function P2(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((N,f)=>{let v=V=>{let M=d1.indexOf(V);return M<0?d1.length:M};return v(N.label)-v(f.label)||N.label.localeCompare(f.label)||N.view.localeCompare(f.view)}),i=512,r=768,s=2,c=document.createElement("canvas");c.width=s*i,c.height=Math.ceil(a.length/s)*r;let d=c.getContext("2d");if(!d)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let N=0;N<a.length;N+=1){let f=a[N],v=new Image;v.src=f.url,await v.decode();let V=N%s*i,M=Math.floor(N/s)*r,O=Math.min(i/v.naturalWidth,r/v.naturalHeight),$=Math.round(v.naturalWidth*O),w=Math.round(v.naturalHeight*O);d.drawImage(v,V+Math.floor((i-$)/2),M+r-w,$,w),h.push({view:f.view,expression:f.label,x:V,y:M,width:i,height:r})}let g=await new Promise((N,f)=>c.toBlob(v=>v?N(v):f(new Error("The browser could not export this sheet.")),"image/png")),b=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";C1(`${b}-sprites.png`,g),C1(`${b}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function Z2({entry:e,onDecide:t}){let[a,i]=(0,m.useState)(e.improvement?.title??""),[r,s]=(0,m.useState)(e.improvement?.description??""),[c,d]=(0,m.useState)(e.improvement?.extraBeds??0),[h,g]=(0,m.useState)(e.improvementSlot??0),[b,N]=(0,m.useState)(!1),[f,v]=(0,m.useState)(""),V=O=>{N(!0),v(""),t(O,{title:a,description:r,extraBeds:c,slot:h}).catch($=>v(Q($,"That Venue request could not be decided."))).finally(()=>N(!1))},M=a!==e.improvement?.title||r!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["Proposed improvement",(0,o.jsx)("input",{className:`${n}-notice-input`,value:a,onChange:O=>i(O.target.value)})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["What changes?",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:r,onChange:O=>s(O.target.value)})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:O=>d(Number(O.target.value))})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:h,onChange:O=>g(Number(O.target.value)),children:[(0,o.jsx)("option",{value:0,children:"Slot 1"}),(0,o.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:b||!a.trim()||!r.trim(),onClick:()=>V(!0),children:M?"Send counteroffer":"Approve exact request"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:b,onClick:()=>V(!1),children:"Decline"})]}),f?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:f}):null]})}function Q2({room:e,nameColors:t,speechColors:a,picture:i,draft:r,mode:s,targetId:c,busy:d,error:h,greetingNotice:g,ruling:b,open:N,ended:f,playerName:v,playerPortrait:V,portraits:M,sprites:O,onDraft:$,onMode:w,onTarget:y,onSend:R,onViewVenue:U,onEnterPrivate:Z,privateSpaceOwnerName:F,onEnd:te,onLeavePending:ye,endFailed:oe,reviewing:Pe,onRetryGreeting:qe,onContinueWithoutGreeting:yt,notices:Oe,onDismissNotice:ct,debugDiscardEnabled:Et,onDebugDiscard:qt,onUseMailbox:A,onProjects:X}){let[Y,le]=(0,m.useState)(0),[$e,Ze]=(0,m.useState)(!1),[_e,W]=(0,m.useState)(!1),[St,Dt]=(0,m.useState)(!1),[ot,dt]=(0,m.useState)(!1),[Qe,Ve]=(0,m.useState)(null),ut=(0,m.useRef)(null),ie=(0,m.useRef)(null),Ae=(0,m.useRef)(null),me=(0,m.useRef)(null),Je=(0,m.useRef)(null),Be=(0,m.useRef)(null),D=(0,m.useRef)(null),G=(0,m.useRef)(null),ae=(0,m.useRef)(null),we=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let x=new Set(Oe.map(P=>P.id)),I=Oe.some(P=>P.kind==="memory"&&!we.current.has(P.id));we.current=x,I?Dt(!0):Oe.length===0&&Dt(!1)},[Oe,e.id]),(0,m.useEffect)(()=>{$e&&window.requestAnimationFrame(()=>Be.current?.focus())},[$e]),(0,m.useEffect)(()=>{if(!_e)return;let x=P=>{G.current?.contains(P.target)||W(!1)},I=P=>{P.key==="Escape"&&W(!1)};return document.addEventListener("pointerdown",x),document.addEventListener("keydown",I),()=>{document.removeEventListener("pointerdown",x),document.removeEventListener("keydown",I)}},[_e]),(0,m.useEffect)(()=>{if(!ot)return;let x=P=>{me.current?.contains(P.target)||dt(!1)},I=P=>{P.key==="Escape"&&dt(!1)};return document.addEventListener("pointerdown",x),document.addEventListener("focusin",x),document.addEventListener("keydown",I),()=>{document.removeEventListener("pointerdown",x),document.removeEventListener("focusin",x),document.removeEventListener("keydown",I)}},[ot]);let Re=(0,m.useCallback)(()=>{Ve(null),window.requestAnimationFrame(()=>ut.current?.focus())},[]),Ie=new Set((e.submissions??[]).flatMap(x=>(x.recollections??[]).map(I=>I.id))).size;(0,m.useEffect)(()=>{if(!Qe)return;window.requestAnimationFrame(()=>ie.current?.focus());let x=I=>{if(I.key==="Tab"){I.preventDefault(),ie.current?.focus();return}I.key==="Escape"&&(I.preventDefault(),Re())};return window.addEventListener("keydown",x),()=>window.removeEventListener("keydown",x)},[Re,Qe]);let et=(0,m.useMemo)(()=>{let x=[],I=F0(e.lines,e.submissions??[]),P=new Map,he=new Map;for(let se of e.lines){if(se.kind!=="side"&&se.kind!=="whisper"||!se.asideFor)continue;let Ge=he.get(se.asideFor)??[];Ge.push({register:se.kind,text:se.content,...se.targetId?{target:e.participants.find(ha=>ha.characterId===se.targetId)?.name??se.targetId}:{},speakerId:se.speakerId,name:se.name,expression:se.expression,gazeAt:se.gazeAt}),he.set(se.asideFor,Ge),P.set(se.asideFor,[...P.get(se.asideFor)??[],se])}for(let se of e.lines){if(se.kind==="side"||se.kind==="whisper")continue;let Ge=se.speakerId.length===0,ha=B0(se.content,se.beats??null),ma=P.get(se.id??"")??[],Un=[se,...ma].map(Bt=>I.get(Bt.id??"")),ja=Un.find(Bt=>Bt?.beforeIds)?.beforeIds,qn=Un.find(Bt=>Bt?.afterIds)?.afterIds;ha.paragraphs.forEach((Bt,Bn)=>{x.push({key:`${x.length}`,...e.stagingVersion===1?{stagingEvent:{cues:[...Bn===0?Yp(se):[],...Bn===ha.paragraphs.length-1?ma.flatMap(Yp):[]],...Bn===0&&ja?{beforeIds:ja}:{},...Bn===ha.paragraphs.length-1&&qn?{afterIds:qn}:{}}}:{},speakerId:Ge?"":se.speakerId,name:Ge?v:se.name,player:Ge,text:Bt,asides:[...ha.asides[Bn]??[],...Bn===ha.paragraphs.length-1?he.get(se.id??"")??[]:[]],...se.kind?{register:se.kind==="narration"?"narration":"speech"}:{},...se.expression?{expression:se.expression}:{},...se.gazeAt?{gazeAt:se.gazeAt}:{}})})}return x},[v,e.lines,e.participants,e.stagingVersion,e.submissions]);(0,m.useLayoutEffect)(()=>{le(x=>P0(ae.current,e.id,et.length,x)),ae.current={roomId:e.id,stepCount:et.length}},[e.id,et.length]);let ee=Math.min(Y,Math.max(0,et.length-1)),B=et[ee],De=(0,m.useMemo)(()=>e.stagingVersion===1?J0(e.participants.map(x=>x.characterId),et.map(x=>x.stagingEvent??{})):[],[e.stagingVersion,e.participants,et])[ee],re=De?.state??Gp(e.participants.map(x=>x.characterId)),zt=(0,m.useRef)(null),Ra=(0,m.useMemo)(()=>zt.current?.roomId===e.id&&!zt.current.restoring&&ee>zt.current.at,[e.id,ee]);(0,m.useLayoutEffect)(()=>{let x=zt.current?.roomId!==e.id;zt.current={roomId:e.id,at:ee,restoring:x&&ee!==Math.max(0,et.length-1)}},[e.id,ee,et.length]);let kt=ee>0,La=ee<et.length-1,ht=!f&&e.status==="active"&&!La,ia=(0,m.useCallback)(()=>{let x=Ae.current;if(!x)return;let I=window.getComputedStyle(x),P=Number.parseFloat(I.lineHeight),he=Number.parseFloat(I.paddingTop)+Number.parseFloat(I.paddingBottom),se=Math.ceil(P+he),Ge=Math.ceil(P*2+he);x.style.height="auto",x.style.height=`${Math.min(Math.max(x.scrollHeight,se),Ge)}px`,x.style.overflowY=x.scrollHeight>Ge+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{ia()},[ht,r,ia]),(0,m.useEffect)(()=>{let x=Ae.current?.parentElement;if(!x)return;let I=x.clientWidth,P=new ResizeObserver(()=>{x.clientWidth!==I&&(I=x.clientWidth,ia())});return P.observe(x),()=>P.disconnect()},[ht,ia]);let At=()=>{!ht||d||s!=="conclude"&&!r.trim()||s==="fulfill"&&!c||(dt(!1),R())};(0,m.useLayoutEffect)(()=>{D.current&&(D.current.scrollTop=0)},[ee,e.id]);let C=B?.register??(B===void 0||B.speakerId==="__venue_scene__"?"narration":B.player||q0(B.text)==="speech"?"speech":"narration"),j=B===void 0?void 0:B.player?V:M[B.speakerId],ce=e.participants.filter(x=>e.activeIds.includes(x.characterId)),ke=e.stagingVersion===1?e.participants.filter(x=>(De?.activeIds??e.activeIds).includes(x.characterId)):e.status==="closed"&&ce.length===0?e.participants:ce,Tt=ke.find(x=>x.characterId===B?.speakerId),ua=x=>ru(a[x]),$a=x=>ru(t[x]),Hn=ke.slice(0,4),Fi=ke.filter(x=>!Hn.some(I=>I.characterId===x.characterId)),Ki=K0(Hn.map(x=>x.characterId),re),mi=(e.stagingVersion===1?(Ki[Tt?.characterId??""]?.x??0)>.5:Hn.findIndex(x=>x.characterId===Tt?.characterId)>=2)?"left":"right",S=(0,o.jsxs)("p",{className:`${n}-chat-pending`,role:"status",children:[(0,o.jsx)("span",{className:`${n}-chat-spinner ${n}-spin`,"aria-hidden":"true"}),(0,o.jsx)("span",{className:`${n}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,o.jsxs)("aside",{className:`${n}-chat`,"data-open":N?"true":"false","data-ended":f?"true":"false","data-opening-error":e.status==="opening"&&h?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,o.jsx)("p",{className:`${n}-visually-hidden`,children:`Here now: ${ce.length?ce.map(x=>`${x.name}${x.doing?` is ${x.doing}`:""}`).join("; "):"nobody"}.`}),(0,o.jsx)("div",{className:`${n}-chat-scene`,"aria-hidden":"true",children:i?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("img",{className:`${n}-chat-scene-backdrop`,src:i,alt:""}),(0,o.jsx)("span",{className:`${n}-chat-scrim`}),(0,o.jsx)("span",{className:`${n}-chat-vignette`})]}):(0,o.jsx)("span",{className:`${n}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,o.jsxs)("div",{className:`${n}-chat-head`,children:[(0,o.jsx)("span",{className:`${n}-room-place`,children:e.placeName}),(0,o.jsxs)("span",{ref:G,className:`${n}-chat-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-room-actions-trigger`,onClick:()=>W(x=>!x),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":_e,children:"\xB7\xB7\xB7"}),_e?(0,o.jsxs)("span",{className:`${n}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{W(!1),U()},disabled:d,children:"View Venue"}),Z?(0,o.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{W(!1),Z()},disabled:d,children:["Enter ",F??"private space"]}):null,(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{W(!1),f&&e.memoryPending?ye():te()},disabled:d,children:f&&e.memoryPending?"Leave with memory pending":f?"Return to map":"End visit now"}),(oe||e.status==="closing"||e.memoryPending)&&!f?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{W(!1),ye()},children:"Leave with memory pending"}):null,Et&&e.status!=="closed"?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{W(!1),qt()},disabled:d,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:e.spaceClass==="residence"?"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like.":"You\u2019re outside this Venue. You can speak in your own words, or leave whenever you like."}):null,Oe.length>0?(0,o.jsxs)("div",{className:`${n}-room-notices`,"aria-live":"polite",children:[(0,o.jsxs)("button",{type:"button",className:`${n}-room-notices-trigger`,onClick:()=>Dt(x=>!x),"aria-expanded":St,"aria-label":`${Oe.length} village ${Oe.length===1?"notice":"notices"}`,children:["\u2726 ",Oe.length]}),St?(0,o.jsx)("div",{className:`${n}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:Oe.map(x=>(0,o.jsxs)("div",{className:`${n}-room-star`,children:[(0,o.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),x.kind==="memory"&&x.detail?(0,o.jsx)("button",{type:"button",className:`${n}-room-star-detail`,onClick:I=>{ut.current=I.currentTarget,Ve(x)},"aria-label":`View memory: ${x.text}`,title:"View saved memory",children:x.text}):(0,o.jsx)("span",{children:x.text}),(0,o.jsx)("button",{type:"button",className:`${n}-room-star-dismiss`,onClick:()=>{Qe?.id===x.id&&Ve(null),ct(x.id)},"aria-label":`Dismiss ${x.text}`,title:"Dismiss notice",children:"\xD7"})]},x.id))}):null]}):null,Qe?.detail?(0,o.jsx)("div",{className:`${n}-memory-backdrop`,onClick:x=>{x.currentTarget===x.target&&Re()},children:(0,o.jsxs)("div",{className:`${n}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${n}-memory-dialog-title`,children:[(0,o.jsxs)("div",{className:`${n}-memory-dialog-head`,children:[(0,o.jsx)("h2",{id:`${n}-memory-dialog-title`,children:Qe.text}),(0,o.jsx)("button",{ref:ie,type:"button",onClick:Re,"aria-label":"Close memory",children:"\xD7"})]}),(0,o.jsx)("p",{children:Qe.detail})]})}):null,ce.length>0?(0,o.jsx)("div",{className:`${n}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:ce.map(x=>(0,o.jsx)("span",{className:`${n}-chat-activity`,children:`${x.name}: ${x.doing||"spending time here"}`},x.characterId))}):null,(0,o.jsxs)("div",{className:`${n}-chat-stage`,"aria-hidden":"true",children:[(0,o.jsx)("div",{className:`${n}-chat-cast`,"data-staging":e.stagingVersion===1?"true":"false","data-animate":Ra?"true":"false",children:Hn.map((x,I)=>{let P=O[x.characterId],he=x.characterId===Tt?.characterId,se=B?.asides.find(qn=>qn.speakerId===x.characterId),Ge=e.stagingVersion===1?Ki[x.characterId]:void 0,ha=Ge?re[x.characterId].expression:he?B?.expression??"":se?.expression??"",ma=he?B?.gazeAt:se?.gazeAt??(x.characterId===B?.gazeAt?Tt?.characterId:void 0),Un=Hn.findIndex(qn=>qn.characterId===ma),ja=e1(P?.images??[],ha,Ge?.facing??W0(I,Un));return(0,o.jsxs)("div",{className:`${n}-chat-cast-person`,"data-active":x.characterId===Tt?.characterId?"true":"false","data-sprite":ja?"true":"false","data-character-id":x.characterId,"data-position":Ge?re[x.characterId].position:void 0,"data-attention":Ge?Ge.facing:void 0,style:Ge?{left:`${(Ge.x-Ge.width/2)*100}%`,width:`${Ge.width*100}%`}:void 0,children:[ja?(0,o.jsx)("img",{src:ja.image.url,alt:"","data-framing":P?.framing.mode??"full","data-facing":ja.image.view==="front"?"front":ja.mirrored?"left":"right"}):(0,o.jsx)(Ur,{portrait:M[x.characterId],name:x.name,className:`${n}-avatar`}),(0,o.jsx)("span",{style:$a(x.characterId),children:x.name})]},x.characterId)})}),Fi.length>0?(0,o.jsx)("div",{className:`${n}-chat-cast-rest`,children:Fi.map(x=>(0,o.jsxs)("span",{children:[(0,o.jsx)(Ur,{portrait:M[x.characterId],name:x.name,className:`${n}-avatar`}),(0,o.jsx)("span",{style:$a(x.characterId),children:x.name})]},x.characterId))}):null]}),(0,o.jsxs)("div",{className:`${n}-chat-vn`,children:[$e?(0,o.jsx)("div",{ref:Be,className:`${n}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:x=>{x.key==="Escape"&&(Ze(!1),window.requestAnimationFrame(()=>Je.current?.focus()))},children:e.lines.map((x,I)=>(0,o.jsxs)("p",{className:`${n}-chat-vn-text`,children:[(0,o.jsxs)("strong",{style:x.role==="assistant"&&x.kind!=="narration"?$a(x.speakerId):void 0,children:[x.role==="user"?v:x.kind==="narration"||x.speakerId==="__venue_scene__"?"Narration":x.name||"Resident",x.kind==="side"?" \xB7 aside":x.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,o.jsx)("span",{style:x.role==="assistant"&&x.kind!=="narration"?ua(x.speakerId):void 0,children:cs(x.content,`history-${I}-`)})]},x.id??I))}):null,B&&B.asides.length>0?(0,o.jsx)("div",{className:`${n}-chat-vn-asides`,"data-side":mi,"aria-live":"polite",children:B.asides.map((x,I)=>(0,o.jsxs)("div",{className:`${n}-chat-vn-aside`,"data-register":x.register,children:[(0,o.jsx)(Ur,{portrait:x.speakerId?M[x.speakerId]:j,name:x.name??B.name,glyph:B.player?"person":"initial",className:`${n}-chat-vn-aside-face`}),(0,o.jsxs)("div",{className:`${n}-chat-vn-aside-column`,children:[(0,o.jsxs)("p",{className:`${n}-chat-vn-aside-head`,children:[(0,o.jsx)("span",{className:`${n}-chat-vn-aside-icon`,children:x.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,o.jsx)("span",{className:`${n}-chat-vn-aside-name`,style:$a(x.speakerId??B.speakerId),children:x.name??B.name}),x.register==="whisper"&&x.target?(0,o.jsx)("span",{className:`${n}-chat-vn-aside-target`,children:`\u2192 ${x.target}`}):null]}),(0,o.jsx)("p",{className:`${n}-chat-vn-aside-text`,style:ua(x.speakerId??B.speakerId),children:cs(x.text,`vn-aside-${I}-`)})]})]},`${I}-${x.register}`))}):null,(0,o.jsx)("div",{className:`${n}-chat-vn-card`,"data-register":C,children:(0,o.jsx)("div",{className:`${n}-chat-vn-row`,children:(0,o.jsxs)("div",{className:`${n}-chat-vn-column`,children:[C==="narration"?(0,o.jsx)("p",{className:`${n}-chat-vn-label`,children:"Narration"}):(0,o.jsx)("p",{className:`${n}-chat-vn-name`,style:B?.player?void 0:$a(B?.speakerId??""),children:B?.name??""}),(0,o.jsxs)("div",{ref:D,className:`${n}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[B?C==="narration"?(0,o.jsx)("p",{className:`${n}-chat-vn-beat`,"data-register":"narration",children:cs(B.text,"vn-beat-")}):(0,o.jsx)("p",{className:`${n}-chat-vn-text`,style:B.player?void 0:ua(B.speakerId),children:cs(B.text,"vn-")}):(0,o.jsx)("p",{className:`${n}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:ce.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!f&&d?S:null]})]})})}),(0,o.jsxs)("div",{className:`${n}-room-panel-tools`,children:[e.lines.length>0?(0,o.jsx)("button",{ref:Je,type:"button",className:`${n}-chat-history-toggle`,"aria-label":"History","aria-expanded":$e,onClick:()=>Ze(x=>!x),children:$e?"Hide history":"History"}):null,(0,o.jsx)("span",{className:`${n}-chat-vn-counter`,children:`${ee+1} / ${Math.max(1,et.length)}`}),(0,o.jsxs)("span",{className:`${n}-chat-vn-nav`,children:[(0,o.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>le(ee-1),disabled:!kt,"aria-label":"Previous paragraph",children:["\u2039 ",(0,o.jsx)("span",{children:"Previous"})]}),La?(0,o.jsxs)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:()=>le(ee+1),"aria-label":"Next paragraph",children:[(0,o.jsx)("span",{children:"Next"})," \u203A"]}):f?(0,o.jsx)("button",{type:"button",className:`${n}-chat-vn-button`,onClick:e.memoryPending?ye:te,disabled:d,children:e.memoryPending?"Leave with memory pending":"Return to map"}):null]})]}),h&&e.status==="opening"?(0,o.jsxs)("div",{className:`${n}-room-error`,role:"alert",children:[(0,o.jsx)("p",{children:h}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:te,disabled:d,children:"Back to map"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:qe,disabled:d,children:"Retry opening"}),e.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:yt,disabled:d,children:"Continue without opening"}):null]}):null,g?(0,o.jsx)("div",{className:`${n}-room-error`,role:"status",children:(0,o.jsx)("p",{children:g})}):null,b?(0,o.jsx)("p",{className:`${n}-empty`,children:b}):null,e.status==="closing"||e.memoryPending?(0,o.jsx)("p",{className:`${n}-hint`,children:e.memoryPending?`Memory review ${Pe?"in progress":"pending"} \xB7 ${e.memoryReview?.nextRecollection??0}/${Ie} recollections reviewed. You can leave with memory pending and retry from Memories.`:"Closing this visit\u2026"}):null,f&&!e.memoryPending&&e.memoryReview?.status==="complete"&&!e.memoryReview.decisions?.some(x=>x.action==="promote")?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:"Review complete. No durable memories were made from this visit."}):null,ht&&s==="fulfill"&&ce.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,ht?(0,o.jsxs)("div",{className:`${n}-composer`,children:[s==="fulfill"&&ce.length>0?(0,o.jsxs)("select",{value:c,onChange:x=>y(x.target.value),"aria-label":"Whose wish you fulfilled",disabled:d||f||e.status!=="active",children:[(0,o.jsx)("option",{value:"",children:"Choose one villager"}),ce.map(x=>(0,o.jsx)("option",{value:x.characterId,children:x.name},x.characterId))]}):null,(0,o.jsx)("div",{className:`${n}-composer-row`,children:(0,o.jsxs)("span",{className:`${n}-chat-input`,children:[(0,o.jsxs)("span",{ref:me,className:`${n}-room-mode-anchor`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-room-mode-toggle`,onClick:()=>dt(x=>!x),"aria-label":`Mode: ${s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":ot,title:s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude",children:s==="chat"?"\u{1F4AC}":s==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),ot?(0,o.jsx)("span",{className:`${n}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(x=>(0,o.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":s===x,disabled:d||x==="fulfill"&&ce.length===0,onClick:()=>{w(x),dt(!1)},children:x==="chat"?"Chat":x==="fulfill"?"Fulfill":"Conclude"},x))}):null]}),A?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:A,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,X?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:X,children:"Projects"}):null,(0,o.jsx)("textarea",{ref:Ae,className:`${n}-textarea`,rows:1,value:r,onChange:x=>$(x.target.value),onKeyDown:x=>{X0(x.key,x.shiftKey,x.nativeEvent.isComposing)&&(x.preventDefault(),At())},placeholder:s==="fulfill"?"What did you do for them?":s==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:d||f||e.status!=="active"}),(0,o.jsx)("button",{type:"button",className:`${n}-chat-send`,onClick:At,disabled:d||f||e.status!=="active"||s!=="conclude"&&r.trim().length===0||s==="fulfill"&&!c,"aria-label":d?"Sending":"Send",title:d?"Sending":"Send",children:d?"Sending\u2026":"Send"})]})})]}):null,h&&e.status!=="opening"?(0,o.jsx)("div",{className:`${n}-room-error`,role:"alert",children:(0,o.jsx)("p",{children:h})}):null]})]})}function J2(e){return e==="index"||e==="general"?e:["chatlogs","progress","agendas","schedules"].includes(e)?"debug":"village"}var F2={index:"Menu",villagers:"Villagers",noticeboard:"Noticeboard",venueRequests:"Venue Requests",projects:"Projects",memories:"Memories",village:"Village Settings",general:"General Settings",chatlogs:"Venue Visits",progress:"Progress",agendas:"Villager Wishes",schedules:"Villager Agendas"},K2="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.",ag=["concept","approval","builder","requirements","materials","construction","finishing"],E1={concept:"Concept & placement",approval:"Affected villagers",builder:"Assign a Builder",requirements:"Define requirements",materials:"Prepare materials",construction:"Construction",finishing:"Finishing visit"};function W2({project:e,busy:t,onSave:a}){let[i,r]=(0,m.useState)(!1),[s,c]=(0,m.useState)(e.title),[d,h]=(0,m.useState)(()=>structuredClone(e.lifecycle.change)),g=d.improvement;return i?(0,o.jsxs)("section",{className:n+"-project-card",children:[(0,o.jsx)("p",{children:"Changing reviewed terms requires fresh affected-person approvals, a Builder agreement, and a checklist. Acquired supplies remain available."}),(0,o.jsxs)("label",{children:["Project name",(0,o.jsx)("input",{value:s,onChange:b=>c(b.target.value)})]}),(0,o.jsxs)("label",{children:["Reviewed change",(0,o.jsx)("textarea",{value:d.detail,onChange:b=>h({...d,detail:b.target.value})})]}),d.classes?(0,o.jsxs)("label",{children:["Base Classes",us.map(b=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:d.classes.includes(b),onChange:N=>h({...d,classes:N.target.checked?[...d.classes,b]:d.classes.filter(f=>f!==b)})}),b]},b))]}):null,d.capacity!==void 0?(0,o.jsxs)("label",{children:["Residential capacity",(0,o.jsx)("input",{type:"number",min:1,max:4,value:d.capacity,onChange:b=>h({...d,capacity:Number(b.target.value)})})]}):null,g?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Upgrade title",(0,o.jsx)("input",{value:g.title,onChange:b=>h({...d,improvement:{...g,title:b.target.value}})})]}),(0,o.jsxs)("label",{children:["Upgrade description",(0,o.jsx)("textarea",{value:g.description,onChange:b=>h({...d,improvement:{...g,description:b.target.value}})})]}),(0,o.jsxs)("label",{children:["Contributed Class",(0,o.jsxs)("select",{value:g.classContribution??"",onChange:b=>h({...d,improvement:{...g,classContribution:b.target.value||void 0}}),children:[(0,o.jsx)("option",{value:"",children:"No additional Class"}),us.map(b=>(0,o.jsx)("option",{value:b,children:b},b))]})]}),(g.zones??[]).map((b,N)=>(0,o.jsxs)("section",{children:[(0,o.jsxs)("label",{children:["Zone name",(0,o.jsx)("input",{value:b.name,onChange:f=>h({...d,improvement:{...g,zones:g.zones.map((v,V)=>V===N?{...v,name:f.target.value}:v)}})})]}),(0,o.jsxs)("label",{children:["Zone description",(0,o.jsx)("textarea",{value:b.description,onChange:f=>h({...d,improvement:{...g,zones:g.zones.map((v,V)=>V===N?{...v,description:f.target.value}:v)}})})]}),(0,o.jsxs)("label",{children:["Zone kind",(0,o.jsxs)("select",{value:b.kind,onChange:f=>h({...d,improvement:{...g,zones:g.zones.map((v,V)=>V===N?{...v,kind:f.target.value,venueClass:f.target.value==="staff"?"workplace":f.target.value==="shared-residence"?"residence":g.classContribution??v.venueClass}:v)}}),children:[(0,o.jsx)("option",{value:"public",children:"Public"}),(0,o.jsx)("option",{value:"shared-residence",children:"Shared residential"}),(0,o.jsx)("option",{value:"staff",children:"Staff"})]})]}),(0,o.jsx)("button",{type:"button",className:n+"-button",onClick:()=>h({...d,improvement:{...g,zones:g.zones.filter((f,v)=>v!==N)}}),children:"Remove this zone"})]},b.id||N)),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:(g.zones?.length??0)>=16,onClick:()=>h({...d,improvement:{...g,zones:[...g.zones??[],{id:"",name:"",description:"",kind:"public",venueClass:g.classContribution??"other"}]}}),children:"Add a zone"})]}):null,(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:t,onClick:async()=>{await a({title:s,...d})&&r(!1)},children:"Submit revised proposal"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:t,onClick:()=>r(!1),children:"Cancel revision"})]}):(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:t,onClick:()=>r(!0),children:"Revise reviewed proposal"})}function ek({snapshot:e,room:t,onSnapshot:a,onReturn:i,onMap:r,onPlaceOnMap:s,mobile:c,debugEnabled:d,focusProjectId:h,siteProjectId:g}){let[b,N]=(0,m.useState)(h),[f,v]=(0,m.useState)(""),[V,M]=(0,m.useState)(""),[O,$]=(0,m.useState)("gathering"),[w,y]=(0,m.useState)(""),[R,U]=(0,m.useState)(""),[Z,F]=(0,m.useState)("upgrade"),[te,ye]=(0,m.useState)(["gathering"]),[oe,Pe]=(0,m.useState)(""),[qe,yt]=(0,m.useState)(2),[Oe,ct]=(0,m.useState)(0),[Et,qt]=(0,m.useState)(0),[A,X]=(0,m.useState)("replace"),[Y,le]=(0,m.useState)(""),[$e,Ze]=(0,m.useState)([]),[_e,W]=(0,m.useState)(""),[St,Dt]=(0,m.useState)(""),[ot,dt]=(0,m.useState)(""),[Qe,Ve]=(0,m.useState)(null),[ut,ie]=(0,m.useState)(null),[Ae,me]=(0,m.useState)({}),[Je,Be]=(0,m.useState)(null),[D,G]=(0,m.useState)(!1),[ae,we]=(0,m.useState)(!1),[Re,Ie]=(0,m.useState)("");(0,m.useEffect)(()=>{h&&N(h)},[h]);let et=e.projects.filter(C=>(C.kind==="new-venue"||C.kind==="renovation")&&C.lifecycle?.phase!=="complete"),ee=et.find(C=>C.id===b)??null,B=ee?.lifecycle,Yt=e.settings.venues.find(C=>C.id===ee?.venueId),De=e.settings.venues.find(C=>C.id===R),re=JSON.stringify(De?.improvements?.[Oe]??null);(0,m.useEffect)(()=>{let C=JSON.parse(re);A==="modify"&&C?(M(C.title),y(C.description),qt(C.extraBeds),Pe(C.spaceId??""),le(C.classContribution??""),Ze(C.zones??[])):(le(""),Pe(""),Ze([]))},[De?.id,re,Oe,A]);let zt=JSON.stringify(De?.baseClasses??De?.classes??["gathering"]);(0,m.useEffect)(()=>{ye(JSON.parse(zt))},[De?.id,zt]);let Ra=async(C,j={})=>{we(!0),Ie("");try{let ce=await L(C,{method:"POST",body:JSON.stringify(j)});return a(ce),ce}catch(ce){return Ie(Q(ce,"The Project could not be updated.")),null}finally{we(!1)}},kt=(C,j={})=>ee&&Ra(`/projects/${encodeURIComponent(ee.id)}/${C}`,j),La=async()=>{let C=f==="new-venue"?{name:V,venueClass:O,description:w}:{title:V,detail:w,...Z==="class"&&De?{classes:te}:{},...Z==="capacity"?{capacity:qe}:{},...Z==="upgrade"?{slot:Oe,improvement:{id:A==="modify"?De?.improvements?.[Oe]?.id:void 0,title:V,description:w,extraBeds:Et,spaceId:oe||null,classContribution:Y||void 0,zones:$e}}:{},...Z==="remove-upgrade"?{slot:Oe,improvement:null}:{}},ce=(await Ra(f==="new-venue"?"/projects":`/projects/renovations/${encodeURIComponent(R)}`,C))?.projects.find(ke=>ke.kind===f&&ke.lifecycle?.phase!=="complete");ce&&(N(ce.id),v(""))},ht=async C=>{if(ee){we(!0),Ie("");try{let j=await L("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:{name:ee.title,form:_e||ee.title,description:St||ee.venueDraft?.description||Yt?.description,spaceDescription:ot||Yt?.spaces?.[0]?.description||St,venueClass:ee.venueDraft?.classes?.[0]??Yt?.classes?.[0]??"other"},area:C,villageName:e.village.name,setting:e.settings.setting,worldFacts:e.settings.worldFacts,selectedLorebookIds:e.settings.selectedLorebookIds})});Be({area:C,image:j})}catch(j){Ie(Q(j,"The Venue image could not be generated."))}finally{we(!1)}}},ia=async(C,j)=>{if(!(!j||!ee)){we(!0),Ie("");try{let ce=await L("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:ee.title,image:await ds(j)})});Be({area:C,image:ce})}catch(ce){Ie(Q(ce,"The Venue image could not be uploaded."))}finally{we(!1)}}},At=B?.phase;return ee&&At==="finishing"&&D?(0,o.jsxs)("div",{className:`${n}-project-finish-visit`,children:[(0,o.jsxs)("header",{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>G(!1),children:"Back to Project"}),(0,o.jsx)("h2",{children:ee.kind==="new-venue"?`Open ${ee.title}`:`Review ${ee.title}`}),(0,o.jsx)("p",{children:ee.kind==="new-venue"?"Give the finished place its form, exterior, and interior. Images are optional.":"Review the approved zone names, access, and descriptions, then choose final images if you wish."})]}),ee.kind==="renovation"?(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:ae,onClick:async()=>{await kt("renew-approvals")&&G(!1)},children:"Renew approvals for current residents and workers"}):null,ee.kind==="new-venue"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Form",(0,o.jsx)("input",{value:_e,onChange:C=>W(C.target.value),placeholder:"What is this place, physically?"})]}),(0,o.jsxs)("label",{children:["Exterior description",(0,o.jsx)("textarea",{value:St,onChange:C=>Dt(C.target.value)})]}),(0,o.jsxs)("label",{children:["Interior description",(0,o.jsx)("textarea",{value:ot,onChange:C=>dt(C.target.value)})]})]}):(0,o.jsx)("p",{children:B?.change?.detail}),["exterior",...ee.kind==="new-venue"?["interior"]:[]].map(C=>{let j=C==="exterior"?Qe:ut;return(0,o.jsxs)("section",{className:`${n}-project-image`,children:[(0,o.jsxs)("h3",{children:[C==="exterior"?"Exterior":"Interior"," image \xB7 optional"]}),j?(0,o.jsx)("img",{src:j.url,alt:`${C} preview`}):(0,o.jsx)("p",{children:"No image chosen. A placeholder will be used."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{ht(C)},children:"Generate image"}),(0,o.jsx)("input",{type:"file",accept:"image/*","aria-label":`Upload ${C} image`,disabled:ae,onChange:ce=>{let ke=ce.target.files?.[0];ce.target.value="",ia(C,ke)}})]},C)}),ee.kind==="renovation"?(B?.change?.improvement?.zones??[]).map(C=>(0,o.jsxs)("section",{className:n+"-project-image",children:[(0,o.jsxs)("h3",{children:[C.name," \xB7 ",C.kind]}),(0,o.jsx)("p",{children:C.description}),Ae[C.id]?(0,o.jsx)("img",{src:Ae[C.id].url,alt:C.name+" preview"}):(0,o.jsx)("p",{children:"Image optional. Existing images are preserved."}),(0,o.jsxs)("label",{children:["Upload final zone image",(0,o.jsx)("input",{type:"file",accept:"image/*",disabled:ae,onChange:async j=>{let ce=j.target.files?.[0];if(j.target.value="",!!ce){we(!0);try{let ke=await L("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:C.name,image:await ds(ce)})});me(Tt=>({...Tt,[C.id]:ke}))}catch(ke){Ie(Q(ke,"The zone image could not be uploaded."))}finally{we(!1)}}}})]})]},C.id)):null,Je?(0,o.jsxs)("section",{className:`${n}-project-image`,children:[(0,o.jsx)("img",{src:Je.image.url,alt:"Generated Venue candidate"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Je.area==="exterior"?Ve(Je.image):ie(Je.image),Be(null)},children:"Use this image"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Be(null),children:"Discard"})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae||ee.kind==="new-venue"&&(!_e.trim()||!St.trim()||!ot.trim()),onClick:async()=>{await kt("open",{form:_e,exteriorDescription:St,interiorDescription:ot,exteriorImage:Qe,interiorImage:ut,zoneImages:Ae})&&G(!1)},children:"Open Venue"}),Re?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Re}):null]}):(0,o.jsxs)("div",{className:`${n}-project-screen`,"data-mobile":c,children:[(0,o.jsxs)("header",{className:`${n}-project-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-project-eyebrow`,children:"PROJECTS"}),(0,o.jsx)("h2",{children:ee?.title??"Build something in the Village"}),(0,o.jsx)("p",{children:ee?ee.kind==="new-venue"?"A new place, from blueprint to opening day.":"Change a place that already belongs to the Village.":"One New Venue and one Renovation may be underway at once."})]}),ee?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>N(""),children:"All Projects"}):null]}),ee?(0,o.jsxs)("div",{className:`${n}-project-layout`,children:[(0,o.jsx)("nav",{className:`${n}-project-rail`,"aria-label":"Project phases",children:ag.filter(C=>C!=="approval"||ee.kind==="renovation").map((C,j)=>{let ce=ag.indexOf(At),ke=ag.indexOf(C);return(0,o.jsxs)("div",{className:`${n}-project-step`,"data-state":ke===ce?"active":ke<ce?"done":"locked",children:[(0,o.jsx)("b",{children:ke<ce?"\u2713":j+1}),(0,o.jsx)("span",{children:E1[C]})]},C)})}),(0,o.jsxs)("main",{className:`${n}-project-card`,children:[ee.kind==="renovation"&&!["construction","finishing","complete"].includes(At??"")?(0,o.jsx)(W2,{project:ee,busy:ae,onSave:C=>Ra(`/projects/${encodeURIComponent(ee.id)}/revise`,C)},ee.id+ee.updatedAt):null,At==="concept"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Place the blueprint"}),(0,o.jsx)("p",{children:ee.venueDraft?.description}),(0,o.jsx)("p",{children:"Choose a clear spot on the Village map. The blueprint marks where this Venue will be built."}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>s(ee.id),children:"Place on Village map"})]}):null,At==="approval"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"People affected by this change"}),(0,o.jsx)("p",{children:B?.change?.detail}),(B?.change?.improvement?.zones??[]).map(C=>(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:C.name})," \xB7 ",C.kind,": ",C.description]},C.id)),(0,o.jsx)("p",{children:"They may approve in conversation or reply through Mailbox. Every affected resident or worker must agree before you ask for a Builder."}),B?.affectedIds.map(C=>(0,o.jsxs)("p",{children:[e.villagers.find(j=>j.characterId===C)?.name??C,":"," ",B.approvals.some(j=>j.residentId===C)?"Approved":"Awaiting approval"]},C)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{kt("request-approval")},children:"Ask remaining villagers through Mailbox"})]}):null,At==="builder"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Find a Builder"}),(0,o.jsx)("p",{children:"Find villagers on the map and ask them about this Project in a real conversation. Their clear agreements appear here automatically."}),e.progressEngineVersion!==1?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{kt("recheck-builder")},children:"Review recent chats for missed agreements"}):null,B?.candidates.length?B.candidates.map(C=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{kt("builder",{residentId:C.residentId})},children:["Assign"," ",e.villagers.find(j=>j.characterId===C.residentId)?.name??"this Villager"]},C.residentId)):(0,o.jsx)("p",{children:"No one has agreed yet."})]}):null,At==="requirements"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Define requirements with your Builder"}),(0,o.jsxs)("p",{children:["Ask"," ",e.villagers.find(C=>C.characterId===B?.builderId)?.name??"your Builder"," ","what this job needs. They decide the materials, functional equipment, and finishing supplies. Their checklist appears here automatically."]}),B?.requirements.length?(0,o.jsxs)("div",{children:[B.requirements.map(C=>(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:C.category})," \xB7 ",C.needed?C.title:"Not needed"]},C.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{kt("requirements")},children:"Accept Builder's plan"}),(0,o.jsx)("p",{children:"To change it, discuss a revision with the Builder."})]}):(0,o.jsx)("p",{children:"Waiting for the Builder's plan."}),B?.candidates.filter(C=>C.residentId!==B.builderId).map(C=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{kt("builder",{residentId:C.residentId})},children:["Switch to"," ",e.villagers.find(j=>j.characterId===C.residentId)?.name??"another Builder"]},C.residentId))]}):null,At==="materials"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Prepare materials"}),(0,o.jsx)("p",{children:"Find each supply in the Village, then bring it to this blueprint site. Offers and handoffs are recognized during your visits. Deliveries update the list here."}),B?.requirements.filter(C=>C.needed).map(C=>(0,o.jsxs)("div",{className:`${n}-project-material`,children:[(0,o.jsx)("strong",{children:C.title}),(0,o.jsx)("span",{children:C.deliveredAt?"Delivered":C.carriedAt?"Ready to deliver":"Find and obtain"}),e.progressEngineVersion===1&&!C.carriedAt?(0,o.jsx)(o.Fragment,{children:B.sources?.some(j=>j.requirementId===C.id)?(0,o.jsx)("p",{children:"The supplier\u2019s handoff will be recognized during your visit."}):(0,o.jsxs)(o.Fragment,{children:[(B.recordedItems??[]).filter(j=>j.itemName.toLocaleLowerCase()===C.title.toLocaleLowerCase()).map(j=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{kt("existing-source",{requirementId:C.id,venueId:j.venueId,zoneId:j.zoneId})},children:["Choose available item at"," ",e.settings.venues.find(ce=>ce.id===j.venueId)?.name??"Venue",j.zoneId?" \xB7 "+(e.settings.venues.find(ce=>ce.id===j.venueId)?.zones?.find(ce=>ce.id===j.zoneId)?.name??"Zone"):""]},j.venueId+":"+j.zoneId+":"+j.itemName)),(B.heldSupplies??[]).filter(j=>!j.assignedRequirementId&&j.itemName.toLocaleLowerCase()===C.title.toLocaleLowerCase()).map(j=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{kt("reallocate-held",{requirementId:C.id,heldId:j.id})},children:["Commit previously acquired ",j.itemName,j.deliveredAt?" (already delivered)":""]},j.id))]})}):null,C.carriedAt&&!C.deliveredAt&&g===ee.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{kt("deliver",{requirementId:C.id})},children:"Deliver at blueprint site"}):null,C.carriedAt&&!C.deliveredAt&&g!==ee.id?(0,o.jsx)("span",{children:"Visit this Project's blueprint on the Village map to deliver it."}):null]},C.id)),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae||B?.requirements.some(C=>C.needed&&!C.deliveredAt),onClick:()=>{kt("start")},children:"Begin construction"})]}):null,At==="construction"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is underway"}),(0,o.jsxs)("p",{children:[e.villagers.find(C=>C.characterId===B?.builderId)?.name??"The Builder"," is focused on this site for 24 hours, with normal rest and essential breaks."]}),B?.workOrder?(0,o.jsxs)("p",{children:["Expected completion: ",new Date(B.workOrder.completesAt).toLocaleString()]}):null,B?.blockedReason?(0,o.jsx)("p",{role:"status",children:B.blockedReason}):null,ee.status==="blocked"?B?.candidates.filter(C=>C.residentId!==B.builderId).map(C=>(0,o.jsxs)("button",{type:"button",className:`${n}-button`,onClick:()=>{kt("builder",{residentId:C.residentId})},children:["Continue with"," ",e.villagers.find(j=>j.characterId===C.residentId)?.name??"Builder"]},C.residentId)):null,d&&ee.status==="building"?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae,onClick:()=>{kt("debug-complete")},children:"DEBUG: Complete construction now"}):null]}):null,At==="finishing"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is complete"}),(0,o.jsxs)("p",{children:["Visit the finished ",ee.kind==="new-venue"?"Venue":"Renovation"," to define its final details and open it to the Village."]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>G(!0),children:"Visit finished Venue"})]}):null,Re?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Re}):null,(0,o.jsx)("footer",{className:`${n}-project-footer`,children:t?.status==="active"?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:i,children:"Return to current visit"}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:r,children:"Back to map"})})]})]}):(0,o.jsxs)("div",{className:`${n}-project-slots`,children:[["new-venue","renovation"].map(C=>{let j=et.find(ce=>ce.kind===C);return(0,o.jsxs)("button",{type:"button",className:`${n}-project-slot`,onClick:()=>j?N(j.id):v(C),children:[(0,o.jsx)("span",{children:C==="new-venue"?"NEW VENUE":"RENOVATION"}),(0,o.jsx)("strong",{children:j?.title??(C==="new-venue"?"Imagine a new place":"Change an existing Venue")}),(0,o.jsx)("small",{children:j?.lifecycle?E1[j.lifecycle.phase]??"Opening":"Available"})]},C)}),f?(0,o.jsxs)("section",{className:`${n}-project-card ${n}-project-create`,children:[(0,o.jsx)("h3",{children:f==="new-venue"?"Describe the new Venue":"Describe the Renovation"}),f==="renovation"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Venue",(0,o.jsxs)("select",{value:R,onChange:C=>U(C.target.value),children:[(0,o.jsx)("option",{value:"",children:"Choose a Venue"}),e.settings.venues.filter(C=>C.constructionStatus!=="worksite").map(C=>(0,o.jsx)("option",{value:C.id,children:C.name},C.id))]})]}),(0,o.jsxs)("label",{children:["Physical change",(0,o.jsxs)("select",{value:Z,onChange:C=>F(C.target.value),children:[(0,o.jsx)("option",{value:"upgrade",children:"Add or replace an Upgrade"}),(0,o.jsx)("option",{value:"remove-upgrade",children:"Remove an Upgrade"}),(0,o.jsx)("option",{value:"class",children:"Change base Classes"}),(0,o.jsx)("option",{value:"capacity",children:"Change Residence capacity"})]})]}),Z==="class"?(0,o.jsxs)("fieldset",{children:[(0,o.jsx)("legend",{children:"Base Classes"}),(0,o.jsx)("p",{children:"Choose one or two base Classes. Upgrade contributions also count toward the two-Class limit."}),us.map(C=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:te.includes(C),onChange:j=>ye(ce=>j.target.checked?[...ce,C]:ce.filter(ke=>ke!==C))}),C]},C))]}):null,Z==="capacity"?(0,o.jsxs)("label",{children:["Capacity",(0,o.jsx)("input",{type:"number",min:1,max:4,value:qe,onChange:C=>yt(Number(C.target.value))})]}):null,Z==="upgrade"||Z==="remove-upgrade"?(0,o.jsxs)("label",{children:["Upgrade slot",(0,o.jsxs)("select",{value:Oe,onChange:C=>ct(Number(C.target.value)),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",De?.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",De?.improvements?.[1]?.title??"empty"]})]})]}):null,Z==="upgrade"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Upgrade action",(0,o.jsxs)("select",{value:A,onChange:C=>X(C.target.value),children:[(0,o.jsx)("option",{value:"replace",children:"Add or replace this Upgrade"}),De?.improvements?.[Oe]?(0,o.jsx)("option",{value:"modify",children:"Modify the existing Upgrade"}):null]})]}),(0,o.jsxs)("label",{children:["Class contributed",(0,o.jsxs)("select",{value:Y,onChange:C=>le(C.target.value),children:[(0,o.jsx)("option",{value:"",children:"No additional Class"}),us.map(C=>(0,o.jsx)("option",{value:C,children:C},C))]})]}),(0,o.jsxs)("label",{children:["Existing area improved (optional)",(0,o.jsxs)("select",{value:oe,onChange:C=>Pe(C.target.value),children:[(0,o.jsx)("option",{value:"",children:"No existing area"}),De?.zones?.filter(C=>C.kind!=="private-residence").map(C=>(0,o.jsx)("option",{value:C.id,children:C.name},C.id))]})]}),(0,o.jsx)("p",{children:"A Venue supports at most two distinct Classes, including its Upgrades. An Upgrade can add zones or improve an existing area."}),($e??[]).map((C,j)=>(0,o.jsxs)("section",{className:n+"-project-card",children:[(0,o.jsxs)("label",{children:["Zone name",(0,o.jsx)("input",{value:C.name,onChange:ce=>Ze(ke=>ke?.map((Tt,ua)=>ua===j?{...Tt,name:ce.target.value}:Tt))})]}),(0,o.jsxs)("label",{children:["Area",(0,o.jsxs)("select",{value:C.kind,onChange:ce=>Ze(ke=>ke?.map((Tt,ua)=>ua===j?{...Tt,kind:ce.target.value,venueClass:ce.target.value==="shared-residence"?"residence":ce.target.value==="staff"?"workplace":Y||De?.classes?.[0]||"other"}:Tt)),children:[(0,o.jsx)("option",{value:"public",children:"Public \xB7 everyone"}),(0,o.jsx)("option",{value:"shared-residence",children:"Shared living \xB7 residents and guests"}),(0,o.jsx)("option",{value:"staff",children:"Staff \xB7 workers and guests"})]})]}),(0,o.jsxs)("label",{children:["Description",(0,o.jsx)("textarea",{value:C.description,onChange:ce=>Ze(ke=>ke?.map((Tt,ua)=>ua===j?{...Tt,description:ce.target.value}:Tt))})]}),(0,o.jsx)("button",{type:"button",className:n+"-button",onClick:()=>Ze(ce=>ce?.filter((ke,Tt)=>Tt!==j)),children:"Remove from proposal"})]},C.id??j)),(0,o.jsx)("button",{type:"button",className:n+"-button",onClick:()=>Ze(C=>[...C??[],{name:"",kind:"public",description:"",venueClass:Y||De?.classes?.[0]||"other"}]),children:"Add a Zone to this Upgrade"})]}):null,Z==="upgrade"?(0,o.jsxs)("label",{children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:Et,onChange:C=>qt(Number(C.target.value))})]}):null]}):(0,o.jsxs)("label",{children:["Venue Class",(0,o.jsxs)("select",{value:O,onChange:C=>$(C.target.value),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"other",children:"Other"})]})]}),(0,o.jsxs)("label",{children:[f==="new-venue"?"Venue name":"Project name",(0,o.jsx)("input",{value:V,onChange:C=>M(C.target.value),placeholder:"Give this place a name"})]}),(0,o.jsxs)("label",{children:["What would this ",f==="new-venue"?"place":"change"," be like in the Village?",(0,o.jsx)("textarea",{value:w,onChange:C=>y(C.target.value)})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:ae||!V.trim()||!w.trim()||f==="renovation"&&(!R||Z==="class"&&(!te.length||te.length>2)),onClick:()=>{La()},children:f==="new-venue"?"Continue to map placement":"Start Renovation"})]}):null]}),!ee&&Re?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Re}):null]})}function tk({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let l=()=>{let p=e.getBoundingClientRect();a(p.width<=704||p.width<=880&&p.height<=512)};l();let u=new ResizeObserver(l);return u.observe(e),()=>u.disconnect()},[e]);let[i,r]=(0,m.useState)(null),s=i?.settings.setupMaxVillagerCount??3,c=i?.settings.homeBuildings??[],[d,h]=(0,m.useState)(null),[g,b]=(0,m.useState)(null),[N,f]=(0,m.useState)(null),[v,V]=(0,m.useState)(0),[M,O]=(0,m.useState)(0),[$,w]=(0,m.useState)(0),[y,R]=(0,m.useState)(null),[U,Z]=(0,m.useState)(!1),[F,te]=(0,m.useState)(""),[ye,oe]=(0,m.useState)(""),[Pe,qe]=(0,m.useState)(""),[yt,Oe]=(0,m.useState)(null),[ct,Et]=(0,m.useState)(null),[qt,A]=(0,m.useState)(!1),[X,Y]=(0,m.useState)("home"),[le,$e]=(0,m.useState)(""),[Ze,_e]=(0,m.useState)(""),[W,St]=(0,m.useState)(""),[Dt,ot]=(0,m.useState)(null),[dt,Qe]=(0,m.useState)("view"),[Ve,ut]=(0,m.useState)("exterior");(0,m.useEffect)(()=>{if(Ve==="exterior")return;let l=i?.settings.venues.find(p=>p.id===Dt);l?.zones?.some(p=>p.id===Ve)||(Ve.startsWith("class:")?l&&_n(l).includes(Ve.slice(6)):l&&Ve.startsWith("private:")&&(l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[])).includes(Ve.slice(8))&&l.privateSpaces?.some(p=>p.ownerId===Ve.slice(8)))||ut("exterior")},[i,Dt,Ve]);let[ie,Ae]=(0,m.useState)(null),[me,Je]=(0,m.useState)(null),[Be,D]=(0,m.useState)(!1),[G,ae]=(0,m.useState)(""),[we,Re]=(0,m.useState)(""),[Ie,et]=(0,m.useState)(""),[ee,B]=(0,m.useState)(null),[Yt,De]=(0,m.useState)(!1),[re,zt]=(0,m.useState)("index"),Ra=J2(re),[kt,La]=(0,m.useState)({}),[ht,ia]=(0,m.useState)(null),At=(0,m.useRef)(null),C=(0,m.useRef)([]),[j,ce]=(0,m.useState)({}),[ke,Tt]=(0,m.useState)({}),[ua,$a]=(0,m.useState)(""),[Hn,Fi]=(0,m.useState)(null),[Ki,mi]=(0,m.useState)(""),[S,x]=(0,m.useState)(""),[I,P]=(0,m.useState)(""),[he,se]=(0,m.useState)(null),[Ge,ha]=(0,m.useState)(""),[ma,Un]=(0,m.useState)([]),[ja,qn]=(0,m.useState)(1600),[Bt,Bn]=(0,m.useState)([]),[qr,cg]=(0,m.useState)(1600),[lu,H1]=(0,m.useState)(null),[dg,ug]=(0,m.useState)(""),[Hl,Br]=(0,m.useState)([]),[hg,U1]=(0,m.useState)(""),[cu,Ln]=(0,m.useState)(!1),[Ul,Wi]=(0,m.useState)(!1),[q1,ql]=(0,m.useState)(null),[Lr,hs]=(0,m.useState)(null),[rn,du]=(0,m.useState)(!1),[ms,jr]=(0,m.useState)(!1),[Gr,mg]=(0,m.useState)(!1),[pg,B1]=(0,m.useState)(""),[gg,L1]=(0,m.useState)({}),[ps,fg]=(0,m.useState)({}),[Bl,bg]=(0,m.useState)(""),[Fe,Ll]=(0,m.useState)(0),[gn,vg]=(0,m.useState)(""),[Jt,yg]=(0,m.useState)(""),[jn,wg]=(0,m.useState)("rebuild"),[Ga,uu]=(0,m.useState)(Hr("rebuild").premise),[gs,xg]=(0,m.useState)(""),[j1,G1]=(0,m.useState)(Zp),[Gn,$g]=(0,m.useState)([]),[Y1,jl]=(0,m.useState)([]),[wt,er]=(0,m.useState)([]),[fs,on]=(0,m.useState)(null),[X1,Ng]=(0,m.useState)(0),[Sg,hu]=(0,m.useState)(!1),[mu,tr]=(0,m.useState)(null),[bs,pi]=(0,m.useState)(null),[fn,Gl]=(0,m.useState)(!1),[kg,pu]=(0,m.useState)(""),[Yl,Tg]=(0,m.useState)(s1),[it,ar]=(0,m.useState)("generate"),[P1,gu]=(0,m.useState)(""),[Xl,fu]=(0,m.useState)(null),[Z1,Cg]=(0,m.useState)(""),[vs,bu]=(0,m.useState)(null),[Yr,vu]=(0,m.useState)(""),[Xr,yu]=(0,m.useState)(""),ys=JSON.stringify({scenario:jn,premise:Ga.trim(),direction:gs.trim(),setting:Jt.trim(),lorebooks:Bt,loreBudget:qr}),wu=(0,m.useRef)(ys);(0,m.useEffect)(()=>{wu.current!==ys&&!i?.isFounded&&pi(null),wu.current=ys},[ys,i?.isFounded]);let xu=JSON.stringify({setting:Jt.trim(),worldFacts:i?.isFounded?Gn:null,lorebooks:Bt,structure:Yr,negative:Xr,options:Yl}),[pa,ws]=(0,m.useState)(!1),[Eg,Pl]=(0,m.useState)(""),[$u,Q1]=(0,m.useState)("Connections are still loading."),[Ag,Rg]=(0,m.useState)(!1),[J1,xs]=(0,m.useState)(!1),[Mg,He]=(0,m.useState)(""),[F1,Zl]=(0,m.useState)(!1),[Pr,Nu]=(0,m.useState)(""),[bn,Zr]=(0,m.useState)(null),[Su,Yn]=(0,m.useState)(null),[zg,Ql]=(0,m.useState)(!1),[vn,Qr]=(0,m.useState)(""),[Og,Xn]=(0,m.useState)(null),Jr=i?.settings.townMapView??Il("cover"),Vg=i?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:null,K1=bn?.size??Vg,Ig=i?it==="existing"?{width:i.settings.townMapExpectedWidth,height:i.settings.townMapExpectedHeight}:vs&&Xl===it?vs:{width:i.settings.townMapGenerationWidth,height:i.settings.townMapGenerationHeight}:null,W1=i?{min:i.settings.townMapZoomMin,max:i.settings.townMapZoomMax,step:i.settings.townMapZoomStep}:{min:1,max:1,step:.1},ex=ms?null:bn?bn.image:Pr||null,nr=it==="none"?null:it==="existing"?Pr||null:Xl===it&&(it!=="generate"||Z1===xu)&&P1||null,Jl=bn!==null||zg,ir=Jl?Su??Jr:Jr,ku=bn?Kp(bn.size):null,[gi,mt]=(0,m.useState)(""),[ga,be]=(0,m.useState)(""),[J,ue]=(0,m.useState)(!1),[_,Me]=(0,m.useReducer)((l,u)=>{let p=typeof u=="function"?u(l):u;return l?.id&&l.id===p?.id&&(l.sceneRevision??0)>(p.sceneRevision??0)?l:p},null),[tx,$s]=(0,m.useState)(!1),[ax,Ya]=(0,m.useState)(!1),[rr,Xa]=(0,m.useState)(""),[Ns,Fl]=(0,m.useState)("chat"),[Ss,Kl]=(0,m.useState)(""),[nx,Dg]=(0,m.useState)(""),[ix,sn]=(0,m.useState)([]),ln=(0,m.useRef)(new Set),[ks,rx]=(0,m.useState)(!1),_g=(0,m.useRef)(0),Fr=(0,m.useRef)(0),Hg=(0,m.useRef)(""),[Tu,Kr]=(0,m.useState)(""),[ra,xt]=(0,m.useState)(!1),[Ts,Ug]=(0,m.useState)(""),Wl=(0,m.useRef)(new Set),Pn=(0,m.useRef)(!1),Zn=(0,m.useRef)(null),Wr=(0,m.useRef)(null),oa=(0,m.useRef)(null),yn=(0,m.useCallback)(l=>{let u=[];for(let p of l)ln.current.has(p.id)||(ln.current.add(p.id),u.push(p));u.length>0&&sn(p=>[...p,...u])},[]),Cs=(0,m.useRef)(!1),[ox,vt]=(0,m.useState)(""),[sx,or]=(0,m.useState)(""),[eo,Qn]=(0,m.useState)(!1),[qg,Cu]=(0,m.useState)(""),Bg=(0,m.useRef)(""),ec=(0,m.useRef)(!1),[Eu,Lg]=(0,m.useState)(!1),Au=(0,m.useRef)(null),Ru=(0,m.useRef)(null);(0,m.useEffect)(()=>{let l=Ru.current,u=Au.current;l===null||!u||(Ru.current=null,u.focus(),u.setSelectionRange(l,l))},[S]);let tc=(0,m.useCallback)(async(l=!1)=>{if(ec.current)return null;ec.current=!0;let u=setTimeout(()=>Lg(!0),k2);try{let p=await L("/reconcile",{method:"POST",body:l?JSON.stringify({forceStory:!0}):void 0});return r(p),p}catch{return null}finally{clearTimeout(u),Lg(!1),ec.current=!1}},[]),lx=(0,m.useCallback)(async()=>{let l=i?.happenings[0]?.id??"";Cu("Writing...");let u=await tc(!0);if(!u){Cu("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}Cu((u.happenings[0]?.id??"")===l?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[i,tc]),Ue=(0,m.useCallback)(async(l={})=>{try{let u=await L("",{signal:l.signal});r(u),mt("")}catch(u){if(l.signal?.aborted||l.quiet)return;r(null),mt(Q(u,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let l=i?.village.nextTransitionAt??"";l.length===0||l===Bg.current||(Bg.current=l,i?.isFounded&&tc())},[i,tc]);let wn=(0,m.useCallback)(async l=>{try{let u=await L("/catalog",{signal:l});h(u.characters),mt("")}catch(u){if(l?.aborted)return;mt(Q(u,"Could not read your character library."))}},[]),to=(0,m.useCallback)(async l=>{try{let u=await L("/personas",{signal:l});se(u.personas)}catch(u){if(l?.aborted)return;se([]),mt(Q(u,"Could not read your Personas."))}},[]),ao=(0,m.useCallback)(async l=>{try{let u=await L("/lorebooks",{signal:l});H1(u.books),ug("")}catch(u){if(l?.aborted)return;ug(Q(u,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),jg=(0,m.useRef)(new Set),Es=(0,m.useCallback)(async l=>{try{let u=await L("/memories",{signal:l});b(u),mt("");let p=u.archive.pendingReviewId;p&&!jg.current.has(p)&&!l?.aborted&&(jg.current.add(p),window.setTimeout(()=>{l?.aborted||L(`/rooms/archive/${encodeURIComponent(p)}/retry-memory`,{method:"POST"}).then(()=>L("/memories")).then(T=>{l?.aborted||b(T)}).catch(()=>{})},0))}catch(u){if(l?.aborted)return;b(null),mt(Q(u,"Could not read villager memories."))}},[]),cx=(0,m.useCallback)(async(l,u)=>{let p=l==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(p)){ue(!0);try{await L(`/memories/${l}/${encodeURIComponent(u)}`,{method:"DELETE"}),await Es()}catch(T){mt(Q(T,"That memory could not be removed."))}finally{ue(!1)}}},[Es]),ac=(0,m.useCallback)(async l=>{try{let u=await L("/agendas",{signal:l});Oe(u.villagers)}catch(u){if(l?.aborted)return;Oe(null),mt(Q(u,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(X!=="menu"||re!=="agendas"&&re!=="schedules"||!yt?.some(u=>u.agenda?.personalizationPending&&!u.agenda.personalizationFailure))return;let l=window.setInterval(()=>{ac()},5e3);return()=>window.clearInterval(l)},[yt,ac,re,X]);let dx=(0,m.useCallback)(async l=>{ue(!0);try{let u=await L(`/agendas/${encodeURIComponent(l)}/regenerate`,{method:"POST"});Oe(u.villagers),mt("")}catch(u){mt(Q(u,"That villager could not be asked again."))}finally{ue(!1)}},[]),ux=(0,m.useCallback)(async(l,u)=>{ue(!0);try{let p=await L(`/agendas/${encodeURIComponent(l)}/completed/${encodeURIComponent(u)}/correct`,{method:"POST"});Oe(p.villagers),mt("")}catch(p){mt(Q(p,"That wish completion could not be corrected."))}finally{ue(!1)}},[]),hx=(0,m.useCallback)(async(l,u)=>{ue(!0);try{let p=await L(`/agendas/${encodeURIComponent(l)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:u})});Oe(p.villagers),mt("")}catch(p){mt(Q(p,"Schedule use could not be changed."))}finally{ue(!1)}},[]);(0,m.useEffect)(()=>{let l=new AbortController;return Ue({signal:l.signal}),()=>l.abort()},[Ue]),(0,m.useEffect)(()=>{let l=()=>{document.hidden||Ue({quiet:!0})},u=setInterval(()=>{document.hidden||ec.current||Ue({quiet:!0})},S2);return document.addEventListener("visibilitychange",l),()=>{clearInterval(u),document.removeEventListener("visibilitychange",l)}},[Ue]),(0,m.useEffect)(()=>{if(!_?.id||_.status==="closed"||X!=="room")return;Hg.current!==_.id?(Hg.current=_.id,Fr.current=Date.parse(_.lastActivityAt||_.startedAt)||Date.now()):Fr.current=Math.max(Fr.current,Date.parse(_.lastActivityAt||_.startedAt)||0);let l=!1,u=q=>{l||rs(_.id,oa.current)||(Me(null),Ya(!1),sn([]),ln.current.clear(),Kr(q==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),Y("home"),Ue())},p=(q=!1)=>{rs(_.id,oa.current)||L("/rooms/active").then(async({session:K})=>{if(l||rs(_.id,oa.current))return;if(K?.id===_.id){Me(K),q&&(await L("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:_.id})}),Fr.current=Date.now());return}let Ne=await L(`/rooms/archive/${encodeURIComponent(_.id)}`).catch(()=>null);l||rs(_.id,oa.current)||u(Ne?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(K=>{let Ne=os(K);Ne&&u(Ne)})},T=q=>{if(!rs(_.id,oa.current)){if(Date.now()-Fr.current>=30*6e4){q.cancelable&&q.preventDefault(),q.stopImmediatePropagation(),p(!0);return}Fr.current=Date.now(),!(Date.now()-_g.current<15e3)&&(_g.current=Date.now(),L("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:_.id})}).catch(K=>{let Ne=os(K);Ne?u(Ne):p()}))}},z=()=>p();window.addEventListener("focus",z),document.addEventListener("visibilitychange",z);for(let q of["pointerdown","keydown","input","scroll"])window.addEventListener(q,T,!0);return()=>{l=!0,window.removeEventListener("focus",z),document.removeEventListener("visibilitychange",z);for(let q of["pointerdown","keydown","input","scroll"])window.removeEventListener(q,T,!0)}},[_?.id,_?.status,_?.lastActivityAt,_?.startedAt,X,Ue]),(0,m.useEffect)(()=>{if(!_?.id||_.operation?.status!=="running"||ra)return;let l=!1,u=!1,p=async()=>{if(l||u||document.hidden)return;u=!0;let z=await ss(_.id,_.operation?.id);u=!1,!l&&z&&(Me(z),Qn(z.status==="closed"),z.operation?.status!=="running"&&vt(""))},T=window.setInterval(()=>{p()},1500);return window.addEventListener("focus",p),document.addEventListener("visibilitychange",p),()=>{l=!0,window.clearInterval(T),window.removeEventListener("focus",p),document.removeEventListener("visibilitychange",p)}},[_?.id,_?.operation?.id,_?.operation?.status,ra]),(0,m.useEffect)(()=>{if(!_?.id||_.operation?.status!=="interrupted"||_.submissions?.some(u=>u.id===_.operation?.id))return;let l=!1;return L(`/rooms/${encodeURIComponent(_.id)}/operations/${encodeURIComponent(_.operation.id)}`).then(({operation:u})=>{l||!u?.input?.message||Xa(p=>p||u.input?.message||"")}).catch(()=>{}),()=>{l=!0}},[_?.id,_?.operation?.id,_?.operation?.status,_?.submissions]),(0,m.useEffect)(()=>{let l=new AbortController;return L("/rooms/active",{signal:l.signal}).then(({session:u,debugDiscardEnabled:p})=>{rx(p),!(l.signal.aborted||!u)&&(Me(u),Fl("chat"),Ya(!0),Y("room"),u.status==="opening"&&(xt(!0),L("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u.id}),signal:AbortSignal.timeout(3e4)}).then(({session:T})=>{l.signal.aborted||Me(T)}).catch(async T=>{if(l.signal.aborted)return;let z=await p1(u.id);l.signal.aborted||(z?Me(z):vt(f1(T)))}).finally(()=>{l.signal.aborted||xt(!1)})))}).catch(()=>{}),()=>l.abort()},[]),(0,m.useEffect)(()=>{if(re!=="chatlogs"||!i?.isFounded)return;let l=new AbortController,u=new URLSearchParams;return F&&u.set("venueId",F),ye&&u.set("characterId",ye),u.set("offset",String(M)),u.set("limit","20"),f(null),L(`/rooms/archive?${u.toString()}`,{signal:l.signal}).then(({visits:p,total:T})=>{l.signal.aborted||(f(p),V(T),qe(""))}).catch(p=>{l.signal.aborted||qe(Q(p,"Venue visits could not be read."))}),()=>l.abort()},[F,ye,M,$,re,i?.isFounded]);let Mu=(0,m.useCallback)(async l=>{try{let u=await L(`/rooms/archive/${encodeURIComponent(l)}`);R(u.visit),qe("")}catch(u){qe(Q(u,"That visit could not be read."))}},[]),mx=(0,m.useCallback)(async l=>{ue(!0);try{let u=await L(`/rooms/${encodeURIComponent(l)}/operation`);await L(`/rooms/archive/${encodeURIComponent(l)}/retry-memory`,{method:"POST",body:JSON.stringify({retryOfAttemptId:u.operation?.attemptId})}),await Mu(l),w(p=>p+1),qe("")}catch(u){qe(Q(u,"Memory filing is still pending."))}finally{ue(!1)}},[Mu]),Gg=(0,m.useCallback)(async l=>{if(window.confirm(l?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){ue(!0);try{await L(l?`/rooms/archive/${encodeURIComponent(l)}`:"/rooms/archive",{method:"DELETE"}),R(null),O(0),w(u=>u+1),qe("")}catch(u){qe(Q(u,"Visit transcripts could not be deleted."))}finally{ue(!1)}}},[]);(0,m.useEffect)(()=>{if(!qt)return;let l=new AbortController;return wn(l.signal),()=>l.abort()},[qt,wn]);let Yg=i?i.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(Yg===null)return;let l=new AbortController;return(async()=>{try{let u=await L("/town-map",{signal:l.signal});Nu(u.image)}catch{l.signal.aborted||Nu("")}})(),()=>l.abort()},[Yg]);let px=(0,m.useCallback)(async l=>{ue(!0);try{r(await L("/villagers",{method:"POST",body:JSON.stringify({characterId:l})})),mt(""),await wn()}catch(u){mt(Q(u,"That character could not move in."))}finally{ue(!1)}},[wn]),gx=(0,m.useCallback)(async l=>{ue(!0);try{r(await L(`/villagers/${encodeURIComponent(l)}`,{method:"DELETE"})),mt(""),d&&await wn()}catch(u){mt(Q(u,"That villager could not leave."))}finally{ue(!1)}},[d,wn]),fx=(0,m.useCallback)(async l=>{$a(l);try{let u=await L(`/villagers/${encodeURIComponent(l)}/refresh`);Tt(p=>({...p,[l]:u})),mt("")}catch(u){mt(Q(u,"That villager's card could not be compared."))}finally{$a("")}},[]),bx=(0,m.useCallback)(async l=>{$a(l);try{r(await L(`/villagers/${encodeURIComponent(l)}/refresh`,{method:"POST"})),Tt(u=>{let p={...u};return delete p[l],p}),mt("")}catch(u){mt(Q(u,"That villager's card could not be refreshed."))}finally{$a("")}},[]),Ot=(0,m.useCallback)(l=>{l==="projects"&&St(""),be(""),De(!1),l==="villagers"&&wn(),l==="village"&&to(),l==="village"&&ao(),l==="memories"&&(b(null),Es()),(l==="agendas"||l==="schedules")&&ac(),l==="progress"&&L("/progress/debug").then(Et).catch(p=>{Et(null),mt(Q(p,"Progress diagnostics are unavailable."))}),l==="village"&&(X!=="menu"||re!=="village")&&i&&(x(i.settings.promptKnowledge),P(i.settings.playerPersonaId),ha(i.settings.setting),Un(i.settings.selectedLorebookIds),qn(i.settings.loreTokenBudget),Br(ls(i.settings.venues).map(p=>({...p})))),zt(l),Y("menu")},[ac,wn,ao,Es,to,re,X,i]),nc=(0,m.useCallback)(()=>{A(!1),be(""),B(null),De(!1),Y("home")},[]),fi=(0,m.useCallback)(l=>{!l.memoryPending||Wl.current.has(l.id)||(Wl.current.add(l.id),Ug(l.id),L(`/rooms/archive/${encodeURIComponent(l.id)}/retry-memory`,{method:"POST"}).then(u=>{Pn.current||(Me(p=>p?.id===l.id?u.session:p),yn(u.recordEvents??[]))}).catch(u=>{Pn.current||vt(Q(u,"Memory review is still pending. You can leave and retry from Memories."))}).finally(()=>{Wl.current.delete(l.id),Ug(u=>u===l.id?"":u)}))},[yn]);(0,m.useEffect)(()=>{if(!Ts)return;let l=window.setInterval(()=>{L(`/rooms/archive/${encodeURIComponent(Ts)}`).then(({visit:u})=>{Pn.current||!Wl.current.has(Ts)||Me(p=>p?.id===u.id&&p.memoryPending?{...p,memoryPending:u.memoryPending,memoryReview:u.memoryReview}:p)}).catch(()=>{})},2e3);return()=>window.clearInterval(l)},[Ts]);let vx=(0,m.useCallback)(async()=>{if(!(!_||ra)&&!(_.memoryPending&&(_.status==="closed"||eo))){if(!_.id||_.status==="closed"||eo){oa.current=null,Ya(!1),Me(null),sn([]),ln.current.clear(),Xa(""),or(""),Y("home"),Ue();return}xt(!0),vt(""),Z(!1),Me({..._,status:"closing"}),oa.current={roomId:_.id,submissionId:""};try{let l=await L("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:_.id,expectedSceneRevision:_.sceneRevision??0})});if(Pn.current)return;Me(l.session),Qn(!0),yn(l.recordEvents??[]),fi(l.session),Xa(""),or(""),Ue()}catch(l){if(Pn.current)return;oa.current=null;let u=os(l);if(u){Me(null),Ya(!1),sn([]),ln.current.clear(),Kr(u==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),Y("home"),Ue();return}let p=await ss(_.id);p&&(Me(p),Qn(p.status==="closed")),vt(Q(l,"You could not leave the venue.")),Z(!0)}finally{xt(!1)}}},[Ue,yn,_,ra,eo,fi]),yx=(0,m.useCallback)(async()=>{if(!_?.id||_.status!=="active"||ra||Cs.current)return;let l=Wr.current??Fd();Wr.current=l,oa.current={roomId:_.id,submissionId:l},xt(!0),vt(""),Z(!1);try{let u=await L("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:_.id,submissionId:l,message:rr,expectedSceneRevision:_.sceneRevision??0}),signal:AbortSignal.timeout(3e5)});Me(u.session),Qn(!0),yn(u.recordEvents??[]),fi(u.session),Wr.current=null,Xa(""),Ue()}catch(u){let p=await ss(_.id,l);p&&Me(p);let T=p?.submissions?.some(q=>q.id===l)?p:await g1(_.id,l);if(T){Me(T),Qn(T.status==="closed"),T.status==="closed"&&fi(T),Xa(""),vt(""),Z(!1),Wr.current=null,Ue();return}oa.current=null;let z=os(u);if(z){Me(null),Ya(!1),sn([]),ln.current.clear(),Kr(z==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),Y("home"),Ue();return}vt(Q(u,"The scene could not end yet.")),Z(!0)}finally{xt(!1)}},[Ue,yn,_,ra,rr,fi]),wx=(0,m.useCallback)(async()=>{if(!(!_?.id||Pn.current)){Pn.current=!0,xt(!0);try{await L("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:_.id})}),oa.current=null,Ya(!1),Me(null),sn([]),ln.current.clear(),Y("home"),Z(!1),Ue()}catch(l){vt(Q(l,"The visit could not be left yet.")),Pn.current=!1}finally{xt(!1)}}},[Ue,_]),xx=(0,m.useCallback)(async()=>{if(!(!_?.id||!ks||ra)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){xt(!0);try{await L("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:_.id})}),Me(null),Ya(!1),sn([]),ln.current.clear(),Xa(""),Y("home"),Ue()}catch(l){vt(Q(l,"The debug discard failed."))}finally{xt(!1)}}},[_,ks,ra,Ue]),$x=(0,m.useCallback)(async()=>{let l=rr.trim();if(_===null||!_.id||eo||ra||Cs.current||l.length===0)return;Cs.current=!0;let u=Zn.current??Fd();Zn.current=u;let p=_;try{await L("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:_.id})})}catch(z){Cs.current=!1;let q=os(z);q?(Me(null),Ya(!1),sn([]),ln.current.clear(),Kr(q==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),Y("home"),Ue()):vt(Q(z,"The visit could not be checked."));return}let T={speakerId:"",name:"",role:"user",content:l,at:new Date().toISOString()};xt(!0),vt(""),Xa(""),Me({..._,lines:[..._.lines,T]}),oa.current={roomId:_.id,submissionId:u};try{let z=await L("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:_.id,message:l,mode:Ns,targetId:Ns==="fulfill"?Ss:"",submissionId:u,expectedSceneRevision:_.sceneRevision??0}),signal:AbortSignal.timeout(3e5)});Me(z.session),Qn(z.session.status==="closed"),z.session.status!=="closed"&&(oa.current=null),yn(z.recordEvents??[]),z.session.status==="closed"&&fi(z.session),Ss&&!z.session.activeIds.includes(Ss)&&Kl(""),Dg(z.verdict?.reason??""),Fl("chat"),Zn.current=null,or(""),Ue()}catch(z){let q=await ss(_.id,u);q&&Me(q);let K=q?.submissions?.some(lr=>lr.id===u)?q:await g1(_.id,u);if(K){Me(K),Qn(K.status==="closed"),K.status==="closed"&&fi(K),vt(""),Xa(""),Zn.current=null,or(""),Ue();return}oa.current=null;let Ne=os(z);if(Ne){Me(null),Ya(!1),sn([]),ln.current.clear(),Kr(Ne==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),Y("home"),Ue();return}let fa=await ss(_.id,u);fa?Me(fa):z instanceof _l||Me(p),z instanceof _l&&(z.code==="SCENE_BUSY"||z.code==="SCENE_STALE")&&(Zn.current=null),Xa(l),vt(Q(z,"That line could not be sent."))}finally{Cs.current=!1,xt(!1)}},[Ue,yn,_,ra,rr,eo,Ns,Ss,fi]),Nx=(0,m.useCallback)(l=>(i?.villagers??[]).filter(u=>u.place?.id===l),[i]),zu=(0,m.useCallback)(l=>{B(null),De(!1),ot(l.id),Qe("view"),ut("exterior"),Ae(null),Je(null),Y("venue")},[]),Ou=(0,m.useCallback)(async l=>{xt(!0),vt(""),or("");try{let u=await L("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(3e4)});Me(u.session),Ue()}catch(u){let p=await p1(l);p?Me(p):vt(f1(u))}finally{xt(!1)}},[Ue]),Sx=(0,m.useCallback)(async()=>{if(!(!_?.id||!_.operation||ra)){xt(!0);try{let{operation:l}=await L(`/rooms/${encodeURIComponent(_.id)}/operations/${encodeURIComponent(_.operation.id)}`),u=l.kind==="move"?"/rooms/zone":l.kind==="memory"?`/rooms/archive/${encodeURIComponent(_.id)}/retry-memory`:l.kind==="greet"?"/rooms/greet":l.kind==="turn"?l.input?.mode==="leave"?"/rooms/leave":"/rooms/turn":"/rooms/end",p=await L(u,{method:"POST",body:JSON.stringify({...l.input,sessionId:_.id,submissionId:l.id,operationId:l.id,expectedSceneRevision:_.sceneRevision??0,retryOfAttemptId:l.attemptId}),signal:AbortSignal.timeout(3e5)});Me(p.session),Qn(p.session.status==="closed"),yn(p.recordEvents??[]),rr.trim()===l.input?.message&&Xa(""),Zn.current=null,Wr.current=null,oa.current=null,vt(""),Ue()}catch(l){let u=await ss(_.id);u&&Me(u),vt(Q(l,"The saved request could not be recovered."))}finally{xt(!1)}}},[_,ra,rr,yn,Ue]),kx=(0,m.useCallback)(async l=>{xt(!0);try{let{session:u}=await L("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(1e4)});Me(u),or(u.lines.length===0?"The opening failed. You can start the conversation now.":""),vt("")}catch(u){vt(Q(u,"The visit could not continue. Retry or leave the venue."))}finally{xt(!1)}},[]),ic=(0,m.useCallback)(async(l,u,p="",T,z)=>{if(_?.id&&_.status==="active"&&_.placeId===l.id&&z){xt(!0),vt("");try{let{session:q}=await L("/rooms/zone",{method:"POST",body:JSON.stringify({sessionId:_.id,zoneId:z,expectedSceneRevision:_.sceneRevision??0})});Me(q),Kl(""),Y("room"),Ya(!0),Ue()}catch(q){vt(Q(q,"That zone could not be entered."))}finally{xt(!1)}return}Pn.current=!1,oa.current=null,B(null),De(!1),Xn(null),Xa(""),Qn(!1),vt(""),or(""),sn([]),ln.current.clear(),xt(!0),Me({version:1,id:"",placeId:l.id,placeName:l.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Ya(!0),Y("room");try{let{session:q}=await L("/rooms",{method:"POST",body:JSON.stringify({venueId:l.id,spaceClass:u,privateOwnerId:p,entryArea:T,zoneId:z,expectedSceneRevision:_?.sceneRevision}),signal:AbortSignal.timeout(2e4)});Me(q),Fl("chat"),Kl(""),Dg(""),Kr(""),Ya(!0),Ue(),q.status==="opening"&&await Ou(q.id)}catch(q){vt(Q(q,"That room could not be opened. Retry or leave the venue."))}finally{xt(!1)}},[Ou,Ue,_]),Xg=(0,m.useCallback)(l=>{De(!1),B(l.id),Y("home")},[]),Pg=(0,m.useCallback)(()=>{ot(null),Qe("view"),ut("exterior"),Ae(null),Je(null),B(null),Y("home")},[]),Tx=(0,m.useCallback)(async()=>{ue(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:S,playerPersonaId:I,setting:Ge,selectedLorebookIds:ma,loreTokenBudget:ja})}))}catch(l){be(Q(l,"Those settings could not be saved."))}finally{ue(!1)}},[S,ma,ja,I,Ge]),Cx=(0,m.useCallback)(async l=>{ue(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({storyPace:l})}))}catch(u){be(Q(u,"That could not be saved."))}finally{ue(!1)}},[]),Ex=(0,m.useCallback)(async l=>{let u=i?.settings.characterSpeechColors??!0;r(p=>p&&{...p,settings:{...p.settings,characterSpeechColors:l}}),ue(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:l})}))}catch(p){r(T=>T&&{...T,settings:{...T.settings,characterSpeechColors:u}}),be(Q(p,"Character speech colors could not be saved."))}finally{ue(!1)}},[i?.settings.characterSpeechColors]),Zg=(0,m.useCallback)(async l=>{ue(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:l})})),w(u=>u+1)}catch(u){be(Q(u,"Visit retention could not be saved."))}finally{ue(!1)}},[]),Ax=(0,m.useCallback)(async()=>{if(!(i&&ls(i.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){ue(!0),be("");try{let l=await L("/bootstrap",{method:"POST"});Br(l.places.map(u=>({id:tu(),name:u.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(l){be(Q(l,"The village did not suggest any places."))}finally{ue(!1)}}},[i]),Rx=(0,m.useCallback)(async()=>{if(Jt.trim().length===0){He("Describe what the village is like before generating its map.");return}ws(!0),He("");try{let l=await L("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:Yr===i?.settings.townMapLayoutPrompt?void 0:Yr,negative:Xr===i?.settings.townMapNegativePrompt?void 0:Xr,setting:Jt,options:Yl,selectedLorebookIds:Bt,scenarioImprint:i?.isFounded?{origin:"",worldFacts:Gn,openingConditions:[],visualCues:[]}:null})}),u=await nu(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");gu(l.image),fu("generate"),Cg(xu),bu(u),ar("generate")}catch(l){He(Q(l,"The village map could not be generated."))}finally{ws(!1)}},[Bt,Xr,Yr,Jt,Yl,xu,Gn,i?.isFounded,i?.settings.townMapLayoutPrompt,i?.settings.townMapNegativePrompt]),Mx=(0,m.useCallback)(async()=>{He(""),ue(!0);try{let l=await L("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:Jt,selectedLorebookIds:Bt,loreTokenBudget:qr})});jl(l.names)}catch(l){He(Q(l,"The village could not suggest names for the public venue."))}finally{ue(!1)}},[Bt,qr,Jt]),zx=(0,m.useCallback)(async l=>{if(!l||!i)return;He("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let p=T=>Math.round(T/1e5)/10;He(`That picture is ${p(l.size)} MB and a village map holds ${p(u)} MB. Choose a smaller copy.`);return}ws(!0);try{let p=await ds(l),T=await nu(p);gu(p),fu("upload"),bu(T),ar("upload")}catch(p){He(Q(p,"That picture could not be used as the village map."))}finally{ws(!1)}},[i]),Ox=(0,m.useCallback)(()=>{if(!i)return;let l=Object.fromEntries(i.settings.venues.map(u=>[u.id,{x:u.presentation.x,y:u.presentation.y}]));L1(l),fg(l),B1(i.settings.townMapImageSetAt),ql(i.settings.venues[0]?.id??null),du(!0),jr(!1),Zr(null),Yn(null),Ql(!1),be("")},[i]),Vx=(0,m.useCallback)(async()=>{if(i){mg(!0),be("");try{let l=await L("/setup/town-map/generate",{method:"POST",body:JSON.stringify({setting:i.settings.setting,selectedLorebookIds:i.settings.selectedLorebookIds,scenarioImprint:{origin:"",worldFacts:i.settings.worldFacts,openingConditions:[],visualCues:[]}})}),u=await nu(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");Zr({image:l.image,size:u}),jr(!1),Yn(Il("cover"))}catch(l){be(Q(l,"The village map could not be generated."))}finally{mg(!1)}}},[i]),Ix=(0,m.useCallback)(async l=>{if(!l||!i)return;be("");let u=Math.floor((i.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let p=T=>Math.round(T/1e5)/10;be(`That picture is ${p(l.size)} MB and the village map holds ${p(u)} MB. Try a smaller copy.`);return}ue(!0);try{let p=await ds(l),T=await nu(p);Zr({image:p,size:T}),jr(!1),Yn(Il("cover"))}catch(p){be(Q(p,"That picture could not be used as the village map."))}finally{ue(!1)}},[i]),Qg=(0,m.useCallback)(async()=>{if(!i)return;let l=ms?"":bn?.image??Pr;ue(!0),be("");try{let u=Object.fromEntries(i.settings.venues.map(T=>[T.id,au(T)])),p=await L("/town-map",{method:"PUT",body:JSON.stringify({image:l,view:Su??i.settings.townMapView,expectedMapSetAt:rn?pg:i.settings.townMapImageSetAt,placements:Object.entries(rn?gg:u).map(([T,z])=>({venueId:T,fromX:z.x,fromY:z.y,x:rn?ps[T]?.x??null:z.x,y:rn?ps[T]?.y??null:z.y}))})});r(p),Nu(l),Zr(null),Yn(null),Ql(!1),du(!1),jr(!1),hs(null)}catch(u){be(Q(u,"The village map could not be saved."))}finally{ue(!1)}},[i,Su,Pr,bn,ms,rn,pg,gg,ps]),Jg=(0,m.useCallback)(()=>{Zr(null),Yn(null),Ql(!1),du(!1),jr(!1),hs(null),be("")},[]),Dx=(0,m.useCallback)(async(l,u,p="",T)=>{if(!vn){Qr(l),Xn(null),be("");try{r(await L("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:p,zoneId:T})}))}catch(z){Xn({id:l,text:Q(z,"That place could not be drawn.")})}finally{Qr("")}}},[vn]),_x=(0,m.useCallback)(async(l,u,p,T="",z)=>{if(!(!u||!i||vn)){Qr(l),Xn(null),be("");try{let q=Ne=>Math.round(Ne/1e5)/10;if(u.size>i.settings.maxVenueImageBytes){Xn({id:l,text:`That picture is ${q(u.size)} MB and a place holds ${q(i.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let K=await ds(u);r(await L("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:l,image:K,spaceClass:p,privateOwnerId:T,zoneId:z})}))}catch(q){Xn({id:l,text:Q(q,"That picture could not be kept.")})}finally{Qr("")}}},[vn,i]),Hx=(0,m.useCallback)(async(l,u,p="",T)=>{if(!vn){Qr(l),Xn(null),be("");try{r(await L("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:p,zoneId:T})}))}catch(z){Xn({id:l,text:Q(z,"That picture could not be taken away.")})}finally{Qr("")}}},[vn]),Ux=(i?.settings.venues.length??0)+Hl.filter(l=>!i?.settings.venues.some(u=>u.id===l.id)).length,qx=(0,m.useCallback)((l,u,p)=>{let T=wt.find(q=>q.category==="public-center"),z=mu??(Ul?T?.id:void 0);if(t1({x:l,y:u},wt.filter(q=>q.id!==z).map(q=>q.presentation),p??{width:1e3,height:700,photoWidth:58,photoHeight:58})){pu("That photograph would cover another venue. Place it a little to the side.");return}if(pu(""),z)er(q=>q.map(K=>K.id===z?{...K,presentation:{...K.presentation,x:l,y:u}}:K)),on(z);else if(Ul){let q=u1(tu(),"gathering",l,u);er(K=>[...K,q]),on(q.id)}else if(cu){let q=wt.filter(Ne=>Ne.classes?.includes("residence"));if(q.length>=1+s)return;let K=u1(tu(),"residence",l,u,q.length===0,q.length+1);er(Ne=>[...Ne,K]),on(K.id)}tr(null),Ln(!1),Wi(!1)},[mu,cu,Ul,s,wt]),sr=(0,m.useCallback)((l,u)=>{er(p=>p.map(T=>T.id===l?u(T):T))},[]),Bx=(0,m.useCallback)(l=>{er(u=>{let p=u.filter(T=>T.id!==l);if(!p.some(T=>T.occupancy.playerHome)){let T=p.findIndex(z=>z.classes?.includes("residence"));T>=0&&(p[T]={...p[T],occupancy:{...p[T].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return p}),on(u=>u===l?null:u)},[]),Lx=l=>{if(i?.isFounded||l===jn)return;let u=Hr(jn).premise,p=!!Ga.trim()&&Ga!==u;wg(l),p||uu(Hr(l).premise),xg(""),He("")},As=(0,m.useCallback)((l,u)=>{be(""),He(""),Rg(!1),xs(!1),Zl(!1),A(!1),mi(""),Ll(0),vg(l?"":u?.village.name??""),yg(l?"":u?.village.setting??"");let p=l?"":u?.settings.foundingReason??"",T=ng.some(no=>no.value===p),z=T?p:p?"custom":"rebuild",q=i2[p]??p,K=u?.settings.foundingDetails??"",Ne=[q,K].filter(Boolean).join(" "),fa=Ne.length>(u?.settings.foundingDetailsMaxLength??500),lr=u?.isFounded?K:p&&!T?fa?K:Ne:l||!p?Hr(z).premise:K,bi=l?"":u?.isFounded?u.settings.foundingGuidance??"":[fa?q:"",u?.settings.foundingGuidance??""].filter(Boolean).join(" ");wg(z),uu(lr),xg(z==="none"?"":bi),G1(l?Zp():u?.settings.scenarioImprint??Zp()),$g(l?[]:u?.settings.worldFacts??[]),jl([]);let Vt=l||!u?[]:u.settings.venues.filter(no=>no.classes?.includes("residence")||no.category==="public-center");er(Vt),on(Vt[0]?.id??null),tr(null),pi(null),pu(""),Bn(l?[]:u?.settings.selectedLorebookIds??[]),cg(l?1600:u?.settings.loreTokenBudget??1600),Tg({...s1}),ar(l?"generate":u?.settings.townMapImageSetAt?"existing":"none"),gu(""),fu(null),Cg(""),bu(null),vu(u?.settings.townMapLayoutPrompt??""),yu(u?.settings.townMapNegativePrompt??""),ws(!1),P(l?"":u?.settings.playerPersonaId??""),to(),ao(),Y("setup")},[ao,to]),Fg=(0,m.useCallback)(l=>{if(Fe===0&&l>0){if(gn.trim().length===0){He("Give the village a name before continuing.");return}if(Jt.trim().length===0){He("Describe what the village is like before continuing.");return}if(!i?.isFounded&&!Ga.trim()){He("Describe the village's first day before continuing.");return}}if(Fe===1&&l>1){if(!I.trim()){He("Choose the Persona who lives in this village.");return}if(!he?.some(u=>u.id===I)){He("That Persona is no longer in your library. Choose another one to continue.");return}if($u.length>0){He($u);return}if(Ag){xs(!0);return}}if(Fe===2&&l>2&&it!=="none"&&!nr){He(it==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(Fe===3&&l>3){let u=wt.filter(K=>K.classes?.includes("residence")),p=u.filter(K=>!K.occupancy.playerHome),T=p.length;if(!u.some(K=>K.occupancy.playerHome)||T<l1||T>c1||!wt.some(K=>K.category==="public-center")){He("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let z=p.map(K=>K.occupancy.residentCharacterId).filter(Boolean);if(z.length!==p.length||new Set(z).size!==z.length){He("Assign a different villager to each villager Residence before review.");return}let q=wt.map(K=>({venue:K,field:K.name.trim()?K.form?.trim()?K.description.trim()?K.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:K})=>K);if(q){on(q.venue.id),He(`Complete ${q.field.replaceAll("-"," ")} for ${q.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${q.field}`)?.focus(),0);return}}xs(!1),He(""),Ll(l),l===1&&to(),l===0&&ao(),l===3&&wn(),Ln(!1),Wi(!1),tr(null)},[$u,wt,Ag,wn,to,ao,I,he,it,nr,gn,Ga,i?.isFounded,Jt,Fe,e]),jx=(0,m.useCallback)(()=>{xs(!1),He(""),Ll(2),Ln(!1),Wi(!1)},[]),Gx=(0,m.useCallback)(()=>{xs(!1),He("")},[]),Le=wt.find(l=>l.id===fs)??null,Rs=Le?.classes?.includes("gathering")?"gathering":"residence";(0,m.useEffect)(()=>{Ng(0),hu(!1)},[fs,Rs]),(0,m.useEffect)(()=>{if(!fs||Le?.form?.trim()||Sg)return;let l=window.setInterval(()=>Ng(u=>(u+1)%5),4e3);return()=>window.clearInterval(l)},[fs,Le?.form,Sg]);let Vu=Le?da(Le,Le.category==="public-center"?"gathering":"residence"):null,Yx=l=>({id:l.id,name:l.name,form:l.form??"",description:l.description,spaceDescription:l.spaces?.[0]?.description??"",venueClass:l.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:l.occupancy.residentCharacterId??""}),Xx=async(l,u)=>{if(fn)return;if(!(u==="exterior"?l.description:l.spaces?.[0]?.description??"").trim()){on(l.id),He(`Add an ${u} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${n}-setup-${u}-description`)?.focus(),0);return}let T=ys;Gl(!0),He("");try{let z=await L("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:Yx(l),area:u,villageName:gn,setting:Jt,foundingDetails:Ga,scenarioImprint:i?.isFounded?j1:null,worldFacts:i?.isFounded?Gn:[],selectedLorebookIds:Bt})});wu.current===T&&pi({venueId:l.id,area:u,image:z})}catch(z){He(Q(z,"Venue art could not be generated."))}finally{Gl(!1)}},Px=async(l,u,p)=>{if(!(!p||fn)){if(p.size>(i?.settings.maxVenueImageBytes??8e6)){He("That venue image is too large. Choose a smaller file.");return}Gl(!0),He("");try{let T=await L("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:l.name,image:await ds(p)})});pi({venueId:l.id,area:u,image:T})}catch(T){He(Q(T,"That venue image could not be uploaded."))}finally{Gl(!1)}}},Zx=()=>{if(!bs)return;let{venueId:l,area:u,image:p}=bs;sr(l,T=>u==="exterior"?{...T,presentation:{...T.presentation,image:p}}:{...T,spaces:[{...da(T,T.classes?.includes("gathering")?"gathering":"residence"),image:p}]}),pi(null)},Kg=(0,m.useCallback)(()=>{if(gn.trim().length===0)return"Give the village a name.";if(I.trim().length===0)return"Choose the Persona who lives in this village.";if(!i?.isFounded&&!Ga.trim())return"Describe the village's first day.";let l=Gn.map(z=>z.trim()).filter(Boolean);if(i?.isFounded&&(l.length>4||l.some(z=>z.length>160)))return"Use at most four current world facts of 160 characters each.";if(Jt.trim().length===0)return"Describe what the village is like.";if(it!=="none"&&!nr)return"Choose, generate, or upload the village map.";let u=wt.filter(z=>z.classes?.includes("residence")),p=u.filter(z=>!z.occupancy.playerHome);if(p.length<l1||p.length>c1)return"Place one to three homes for initial villagers.";if(!u.some(z=>z.occupancy.playerHome))return"One Residence has to be yours.";if(wt.some(z=>!z.name.trim()||!z.form?.trim()||!z.description.trim()||!z.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let T=p.map(z=>z.occupancy.residentCharacterId).filter(z=>z!==null);return T.length!==p.length?"Choose who lives in each villager home.":new Set(T).size!==T.length?"A villager can only live in one house.":wt.filter(z=>z.category==="public-center").length!==1?"Place one Gathering Place.":""},[wt,I,it,nr,gn,Ga,i?.isFounded,Gn,Jt]),Qx=(0,m.useCallback)(async()=>{let l=Kg();if(l){let u=wt.find(p=>!p.name.trim()||!p.form?.trim()||!p.description.trim()||!p.spaces?.[0]?.description.trim());if(u){let p=u.name.trim()?u.form?.trim()?u.description.trim()?"interior-description":"exterior-description":"form":"venue-name";on(u.id),Ll(3),window.setTimeout(()=>e.querySelector(`#${n}-setup-${p}`)?.focus(),0)}He(l);return}ue(!0),He("");try{let u=await L("/setup",{method:"POST",body:JSON.stringify({name:gn.trim(),setting:Jt.trim(),foundingReason:i?.isFounded?i.settings.foundingReason:jn,foundingDetails:i?.isFounded?i.settings.foundingDetails:Ga.trim(),foundingGuidance:i?.isFounded?i.settings.foundingGuidance:gs.trim(),scenarioImprint:i?.isFounded?i.settings.scenarioImprint:null,worldFacts:i?.isFounded?Gn.map(p=>p.trim()).filter(Boolean):[],selectedLorebookIds:Bt,loreTokenBudget:qr,playerPersonaId:I,townMapImage:nr??"",townMapView:it==="existing"?Jr:Il("cover"),venues:wt})});r(u),Ln(!1),Y(!i?.isFounded||u.foundingPreparation?.status==="pending"||u.foundingPreparation?.status==="failed"?"preparing":"home")}catch(u){He(Q(u,"The village could not be founded."))}finally{ue(!1)}},[e,wt,i?.isFounded,i?.settings.foundingReason,i?.settings.foundingDetails,i?.settings.foundingGuidance,i?.settings.scenarioImprint,I,Jr,Kg,it,nr,gn,jn,Ga,gs,Gn,Bt,qr,Jt]),Jx=(0,m.useCallback)(async()=>{ue(!0),be("");try{let l=await L("/setup/reset",{method:"POST"});r(l),h(null),As(!0,l)}catch(l){be(Q(l,"The village could not be reset."))}finally{ue(!1),Zl(!1)}},[As]),Wg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!i||Wg.current||(Wg.current=!0,i.isFounded?i.foundingPreparation&&i.foundingPreparation.status!=="ready"&&Y("preparing"):As(!1,i))},[As,i]),(0,m.useEffect)(()=>{if(X!=="preparing")return;let l=!1,u=async()=>{try{let T=await L("/setup/preparation");if(l)return;r(T),Pl(""),(!T.foundingPreparation||T.foundingPreparation.status==="ready")&&Y("home")}catch(T){l||Pl(Q(T,"Preparation status could not be read."))}};u();let p=window.setInterval(()=>{u()},2500);return()=>{l=!0,window.clearInterval(p)}},[X]);let Fx=(0,m.useCallback)(async()=>{Pl("");try{r(await L("/setup/preparation/retry",{method:"POST"}))}catch(l){Pl(Q(l,"Preparation could not be retried."))}},[]),Kx=(0,m.useCallback)(()=>{Ae({id:tu(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),Wx=(0,m.useCallback)(async l=>{ue(!0),be("");try{let u=i?.settings.venues.some(q=>q.id===l.id)??!1,p=_n(l).map(q=>da(l,q)),T=await L(u?`/locations/venue/${encodeURIComponent(l.id)}`:"/projects",{method:u?"PUT":"POST",body:JSON.stringify(u?{name:l.name,description:p[0]?.description??l.description}:{name:l.name,classes:l.classes,description:p[0]?.description??l.description})}),z=ls(T.settings.venues).find(q=>u?q.id===l.id:q.name.toLowerCase()===l.name.trim().toLowerCase());r(T),Ae(null),u||Ot("projects"),Br(q=>{let K=q.map(Ne=>Ne.id===l.id&&z?z:Ne);return[...K,...ls(T.settings.venues).filter(Ne=>!K.some(fa=>fa.id===Ne.id))]})}catch(u){be(Q(u,"That place could not be saved."))}finally{ue(!1)}},[i,Ot]),e$=(0,m.useCallback)(async l=>{let u=i?.settings.venues.find(p=>p.id===l);if(!u){Br(p=>p.filter(T=>T.id!==l));return}ue(!0),be("");try{let p=await L(`/locations/venue/${encodeURIComponent(l)}/dependencies`);if(p.roomPresent||p.playerHome||p.residentCharacterIds.length||p.pendingMailCount){be(p.roomPresent?"End the active visit before deleting this Venue.":p.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let T=p.residentCharacterIds.length+p.pendingResidenceCharacterIds.length,z=T||p.workerCharacterIds.length||p.remapCount||p.eventCount?`This place is referenced by ${T} pending moves, ${p.workerCharacterIds.length} workers, ${p.remapCount} schedule moves, and ${p.eventCount} events. Delete it?`:`Delete ${u.name}?`;if(!window.confirm(z))return;let q=await L(`/locations/venue/${encodeURIComponent(l)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});r(q),Br(K=>K.filter(Ne=>Ne.id!==l))}catch(p){be(Q(p,"That place could not be removed."))}finally{ue(!1)}},[i]),ef=(0,m.useCallback)(async(l,u)=>{ue(!0),be("");try{let p=kt[l.id]??l.venueDraft,T=await L(`/venue-requests/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST",body:u?JSON.stringify(p):void 0});if(r(T),u){let z=new Set(Hl.map(q=>q.id));Br(q=>[...q,...ls(T.settings.venues).filter(K=>!z.has(K.id))])}La(z=>{let q={...z};return delete q[l.id],q})}catch(p){be(Q(p,u?"That venue could not be approved.":"That request could not be denied."))}finally{ue(!1)}},[kt,Hl]),t$=(0,m.useCallback)(l=>{let u=Au.current,p=u?.selectionStart??S.length,T=u?.selectionEnd??p;Ru.current=p+l.length,x(`${S.slice(0,p)}${l}${S.slice(T)}`)},[S]),tf=(0,m.useCallback)(async()=>{let l=Bl.trim();if(l.length!==0){ue(!0),be("");try{r(await L("/noticeboard",{method:"POST",body:JSON.stringify({notice:l})})),bg("")}catch(u){be(Q(u,"That notice could not be pinned up."))}finally{ue(!1)}}},[Bl]),a$=(0,m.useCallback)(async l=>{ue(!0),be("");try{r(await L(`/noticeboard/${l}`,{method:"DELETE"}))}catch(u){be(Q(u,"That notice could not be taken down."))}finally{ue(!1)}},[]),rc=Ki.trim().toLowerCase(),Iu=(d??[]).filter(l=>rc.length===0||l.name.toLowerCase().includes(rc)||l.comment.toLowerCase().includes(rc)||l.tags.some(u=>u.toLowerCase().includes(rc))),af=[...(i?.villagers??[]).map(l=>l.characterId),...qt?Iu.map(l=>l.id):[]].join(`
`),nf=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let l=af.split(`
`).filter(p=>p.length>0&&!nf.current.has(p));if(l.length===0)return;for(let p of l)nf.current.add(p);let u=new AbortController;return(async()=>{try{let p=await b2(l,u.signal);u.signal.aborted||ce(T=>({...T,...p}))}catch{}})(),()=>u.abort()},[af]);let Du=i?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(Fi(null),Du.length===0)return;let l=new AbortController;return(async()=>{try{let u=await v2(Du,l.signal);l.signal.aborted||Fi(u)}catch{}})(),()=>l.abort()},[Du]);let Pa=(0,m.useCallback)(l=>l?d?.find(u=>u.id===l)?.name??i?.villagers.find(u=>u.characterId===l)?.name??"":"",[d,i]),n$=(()=>{let l=i?.settings.venues??[],u=[],p=new Map;for(let T of i?.villagers??[]){let z=T.place?.id;if(!z)continue;let q=p.get(z);q?q.push(T):p.set(z,[T])}for(let T of l){let z=au(T);if(!z)continue;let q=i?.projects.find(bi=>bi.venueId===T.id&&bi.lifecycle?.phase!=="complete"),K=()=>{q&&(Ot("projects"),$e(q.id),St(q.id))},Ne=T.occupancy.residentCharacterId,fa=ou(T),lr=T.occupancy.playerHome?Dl(i):Pa(Ne);u.push({id:T.id,x:z.x,y:z.y,text:fa?z2(lr):T.name,image:q?D2:T.presentation.image?.url??null,tone:fa?x1({isPlayerHome:T.occupancy.playerHome,occupant:Ne}):"venue",selected:ee===T.id,doors:ee===T.id?[...q?[{label:"View Project",onSelect:K}]:[],...q?.kind==="new-venue"?[]:[{label:"View venue",onSelect:()=>zu(T)},{label:"Visit",onSelect:()=>{ic(T)}}]]:void 0,onSelect:q?.kind==="new-venue"?K:()=>Xg(T)}),(p.get(T.id)??[]).forEach((bi,Vt)=>{u.push({id:`villager:${bi.characterId}`,x:z.x,y:z.y,dy:I2*(Vt+1),text:bi.name,tone:"resident",kind:"person"})})}return u})(),i$=wt.flatMap(l=>{let u=au(l);return u?[{id:l.id,x:u.x,y:u.y,text:l.name||(l.category==="public-center"?"Gathering Place":"Residence"),image:l.presentation.image?.url??null,tone:l.category==="public-center"?"venue":l.occupancy.playerHome?"player":"resident",onSelect:()=>on(l.id)}]:[]});if(X==="room")return(0,o.jsxs)("div",{className:`${n}-root ${n}-room-screen`,"data-mobile":t?"true":"false",children:[_?.operation?.status==="running"?(0,o.jsx)("div",{role:"status",children:"This conversation is responding. Your draft stays here."}):null,_?.operation?.status==="interrupted"?(0,o.jsxs)("div",{role:"alert",className:`${n}-room-error`,children:[(0,o.jsx)("p",{children:"The previous request may have been billed. Retry the saved request only when you are ready to authorize further work."}),(0,o.jsx)("button",{className:`${n}-button`,disabled:ra,onClick:()=>{Sx()},children:"Retry saved request"})]}):null,_?(0,o.jsx)(Q2,{room:_,nameColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.nameColor])):{},speechColors:i?.settings.characterSpeechColors?Object.fromEntries(i.villagers.map(l=>[l.characterId,l.dialogueColor])):{},picture:h2(i?.settings.venues??[],_),draft:rr,mode:Ns,targetId:Ss,busy:ra||_.operation?.status==="running",error:ox,greetingNotice:sx,ruling:nx,open:ax,ended:eo,playerName:Dl(i),playerPortrait:Hn??void 0,portraits:j,sprites:Object.fromEntries((i?.villagers??[]).map(l=>[l.characterId,l.sprite])),onDraft:l=>{Zn.current=null,Wr.current=null,Xa(l)},onMode:l=>{Zn.current=null,Fl(l)},onTarget:l=>{Zn.current=null,Kl(l)},onSend:()=>{Ns==="conclude"?yx():$x()},onViewVenue:()=>{ot(_.placeId),Ae(null),Y("venue"),Ue()},onEnterPrivate:_.area==="shared"&&_.privateAccessOwnerId?()=>{xt(!0),L("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:_.id,ownerId:_.privateAccessOwnerId,expectedSceneRevision:_.sceneRevision??0})}).then(({session:l})=>{Me(l),Ue()}).catch(l=>vt(Q(l,"That private space could not be entered."))).finally(()=>xt(!1))}:void 0,privateSpaceOwnerName:Pa(_.privateAccessOwnerId),onEnd:()=>{vx()},notices:ix,onDismissNotice:l=>sn(u=>u.filter(p=>p.id!==l)),debugDiscardEnabled:ks,onDebugDiscard:()=>{xx()},onLeavePending:()=>{wx()},endFailed:U,reviewing:Ts===_.id,onRetryGreeting:()=>{if(_.id)Ou(_.id);else{let l=i?.settings.venues.find(u=>u.id===_.placeId);l&&ic(l)}},onContinueWithoutGreeting:()=>{_.id&&kx(_.id)},onUseMailbox:i?.settings.venues.some(l=>l.id===_.placeId&&l.occupancy.playerHome&&(!_.spaceClass||_.spaceClass==="residence"))?()=>$s(!0):void 0,onProjects:()=>Ot("projects")}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:nc,children:"Back to village"}),tx&&i?(0,o.jsx)("div",{className:`${n}-mailbox-backdrop`,onClick:()=>$s(!1),children:(0,o.jsxs)("section",{className:`${n}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:l=>l.stopPropagation(),children:[(0,o.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Mailbox"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>$s(!1),children:"Close"})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,o.jsxs)("div",{className:`${n}-mailbox-list`,children:[[...i.venueMail??[]].reverse().map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsx)("strong",{children:l.title}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("p",{className:`${n}-hint`,children:l.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(l.dueAt).toLocaleString()}`:l.status==="pending-player"?"Awaiting your decision":l.status==="approved"?"Approved":"Declined"}),l.decisions.map(u=>(0,o.jsxs)("p",{children:[(0,o.jsxs)("strong",{children:[Pa(u.characterId),":"]})," ",u.reply]},u.characterId)),l.status==="pending-player"&&l.kind==="villager-change"?(0,o.jsx)(Z2,{entry:l,onDecide:async(u,p)=>{r(await L(`/venue-mail/${encodeURIComponent(l.id)}/decision`,{method:"POST",body:JSON.stringify({approved:u,...p})}))}}):null,l.error?(0,o.jsxs)("p",{className:`${n}-hint`,children:["Reply delayed: ",l.error]}):null]},l.id)),(i.venueMail?.length??0)===0&&i.venueRequests.length===0&&i.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No Venue mail yet."}):null,i.venueRequests.map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName||"A villager"," suggests ",l.venueDraft.name]}),(0,o.jsx)("p",{children:l.venueDraft.classes.map(u=>u[0].toUpperCase()+u.slice(1)).join(" / ")}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{$s(!1),Ot("venueRequests")},children:"Review request"})]},l.id)),i.upgradeRequests.map(l=>(0,o.jsxs)("article",{className:`${n}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName," suggests a home change"]}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{$s(!1),Ot("venueRequests")},children:"Review request"})]},l.id))]})]})}):null]});if(X==="venue"){let l=(i?.settings.venues??[]).find(E=>E.id===Dt)??null;if(!i||!l)return(0,o.jsx)("div",{className:`${n}-root`,children:(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:"A place that is gone"}),(0,o.jsx)("p",{className:`${n}-subtitle`,children:"This venue is no longer in the village."})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:Pg,children:"Back to map"})]})});let u=Nx(l.id),p=_n(l),T=l.occupancy.homeKind?O2(c,l.occupancy.homeKind).name:"",z=l.occupancy.playerHome?Dl(i):Pa(l.occupancy.residentCharacterId),q=l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[]),K=p.includes("residence")&&q.length>0,Ne=_?.placeId===l.id&&(_.area==="shared"||_.area==="private"),fa=_?.placeId===l.id&&_.area==="private"?_.privateOwnerId:"",lr=l.occupancy.playerHome||l.playerSeenShared||Ne,bi=(l.privateSpaces??[]).filter(E=>l.playerSeenPrivateIds?.includes(E.ownerId)||E.ownerId===fa),Vt=_?.status!=="closed"&&_?.id?_:null,no=(l.playerInvitations??[]).some(E=>q.includes(E.residentId)),r$=[{key:"exterior",label:"Exterior",subtitle:"Outside the building",area:"outside",spaceClass:p[0],ownerId:"",image:l.presentation.image,description:l.form||T||`The outside of ${l.name}.`,state:l.exteriorState,locked:!1,canEnter:!0,accessLabel:"Open (no restrictions)"},...p.map(E=>{let fe=da(l,E),ne=E==="residence",pe=ne?!lr:!l.playerSeenPublic&&!(Vt?.placeId===l.id&&Vt.area==="public"),Ke=!ne||!K||l.occupancy.playerHome||no;return{key:`class:${E}`,label:p.length===1?"Interior":`${E[0].toUpperCase()}${E.slice(1)} interior`,subtitle:ne?"Shared living space":`${E[0].toUpperCase()}${E.slice(1)} space`,area:ne?"shared":"public",spaceClass:E,ownerId:"",image:pe?null:fe.image,description:pe?"":fe.description,state:pe?void 0:fe.state,locked:pe,canEnter:Ke,accessLabel:Ke?"Open to visit":"Resident invitation required"}}),...(l.privateSpaces??[]).filter(E=>q.includes(E.ownerId)).map(E=>{let fe=Pa(E.ownerId),ne=!l.playerSeenPrivateIds?.includes(E.ownerId)&&E.ownerId!==fa,pe=(l.playerInvitations??[]).some(Ke=>Ke.scope==="private"&&Ke.ownerId===E.ownerId&&Ke.residentId===E.ownerId);return{key:`private:${E.ownerId}`,label:`${fe}'s Private Space`,subtitle:"Restricted area",area:"private",spaceClass:"residence",ownerId:E.ownerId,image:ne?null:E.image,description:ne?"":E.description,state:ne?void 0:E.state,locked:ne,canEnter:pe,accessLabel:pe?"Owner's invitation available":"Owner's invitation required",adaptationPending:!ne&&E.adaptationPending}})],oc=l.zones?l.zones.map(E=>{let fe=E.kind==="exterior"?"outside":E.kind==="private-residence"?"private":E.kind==="shared-residence"?"shared":"public",ne=E.kind!=="exterior"&&!E.seen&&!(l.occupancy.playerHome&&E.kind==="shared-residence")&&!(Vt?.placeId===l.id&&Vt.zoneId===E.id),pe=l.playerInvitations?.some(vi=>vi.zoneId===E.id)||Vt?.placeId===l.id&&Vt.grantedZoneIds?.includes(E.id),Ke=!E.closed&&(E.kind==="exterior"||E.kind==="public"||E.kind==="shared-residence"&&l.occupancy.playerHome||!!pe);return{key:E.id,zoneId:E.id,label:E.kind==="private-residence"?Pa(E.ownerId??"")+"'s Private Space":E.name,subtitle:E.kind==="staff"?"Staff area":E.kind==="shared-residence"?"Shared living space":E.kind==="private-residence"?"Resident's personal space":E.kind==="exterior"?"Outside the building":"Public area",area:fe,spaceClass:E.venueClass,ownerId:E.ownerId??"",image:ne?null:E.image,description:ne?"":E.description,state:ne?void 0:E.state,locked:ne,canEnter:Ke,accessLabel:E.closed?"Closed for Renovation":E.kind==="exterior"||E.kind==="public"?"Open to everyone":pe?"Permission for this visit":E.kind==="private-residence"?"Owner's invitation required":E.kind==="staff"?"Workers and invited guests":"Residents and invited guests"}}):r$,de=oc.find(E=>E.key===Ve)??oc[0],rf=(l.editProposals??[]).filter(E=>E.zoneId?E.zoneId===de.zoneId:de.area==="shared"?E.target==="shared":de.area==="private"&&E.target==="private"&&E.ownerId===de.ownerId),_u=de.description&&de.description!==l.form&&de.description!==T?de.description:"",o$=!de.locked&&!!(_u||de.adaptationPending||de.state?.condition||de.state?.items.length||de.state?.publicFacts.length||de.state?.features.length||de.area==="outside"&&i.village.setting||rf.length),sc=Vt?.placeId===l.id&&(de.zoneId?Vt.zoneId===de.zoneId:Vt.area===de.area)&&(de.zoneId?Vt.zoneId===de.zoneId:de.area==="outside"||Vt.spaceClass===de.spaceClass)&&(de.area!=="private"||Vt.privateOwnerId===de.ownerId),s$=(E,fe,ne,pe="",Ke)=>(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h3",{className:`${n}-panel-title`,children:E}),fe?(0,o.jsx)("img",{className:`${n}-venue-space-picture`,src:fe.url,alt:`${E} at ${l.name}`}):(0,o.jsx)("div",{className:`${n}-venue-image-empty`,children:"No image yet"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!vn||J,onClick:()=>{Dx(l.id,ne,pe,Ke)},children:fe?"Redraw image":"Draw image"}),(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*","aria-label":`Upload ${E.toLowerCase()} image`,disabled:!!vn||J,onChange:vi=>{let h$=vi.target.files?.[0];vi.target.value="",_x(l.id,h$,ne,pe,Ke)}}),fe?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!!vn||J,onClick:()=>{Hx(l.id,ne,pe,Ke)},children:"Remove image"}):null]})]},Ke||pe||ne||"exterior"),io=E=>({name:E.name,form:E.form,workerIds:E.workerIds,position:{x:E.presentation.x,y:E.presentation.y},spaces:p.map(fe=>{let ne=da(E,fe);return{description:ne.description,condition:ne.state.condition,items:ne.state.items,publicFacts:ne.state.publicFacts,features:ne.state.features.map(({id:pe,text:Ke,locked:vi})=>({id:pe,text:Ke,locked:vi}))}}),privateSpaces:E.privateSpaces?.map(fe=>({ownerId:fe.ownerId,description:fe.description,condition:fe.state.condition,items:fe.state.items,publicFacts:fe.state.publicFacts,features:fe.state.features.map(({id:ne,text:pe,locked:Ke})=>({id:ne,text:pe,locked:Ke}))}))}),l$=!!(ie&&JSON.stringify(io(ie))!==JSON.stringify(io(l))),c$=!!(me&&(JSON.stringify(me.classes)!==JSON.stringify(p)||me.capacity!==(l.residenceCapacity??1)||me.slot!==0||me.title||me.description||me.extraBeds)),d$=()=>{(dt==="edit"&&l$||dt==="proposal"&&c$)&&!window.confirm("Discard your unsaved changes?")||(Qe("view"),Ae(null),Je(null),ae(""),Re(""))},of=(E,fe)=>{r(E);let ne=E.settings.venues.find(pe=>pe.id===l.id);ne&&Ae(structuredClone(ne)),Re(fe)},u$=async()=>{if(ie){if(ie.form!==l.form||JSON.stringify(ie.classes)!==JSON.stringify(l.classes)||JSON.stringify(ie.workerIds??[])!==JSON.stringify(l.workerIds??[])||JSON.stringify(ie.state)!==JSON.stringify(l.state)||ie.presentation.x!==l.presentation.x||ie.presentation.y!==l.presentation.y){ae("Physical edits and map moves need an earned route. Edit only the name or description here.");return}if(K){let E=io(ie),fe=io(l),ne=p.indexOf("residence");if((ne>=0&&JSON.stringify(E.spaces[ne])!==JSON.stringify(fe.spaces[ne])||JSON.stringify(E.privateSpaces)!==JSON.stringify(fe.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}D(!0),ae(""),Re("");try{let E=await L(`/locations/venue/${encodeURIComponent(l.id)}`,{method:"PUT",body:JSON.stringify({name:ie.name,description:ie.description})});of(E,"Venue details saved.")}catch(E){ae(Q(E,"The Venue could not be saved."))}finally{D(!1)}}},sf=async(E,fe="")=>{if(!ie)return;let ne=E==="private"?ie.privateSpaces?.find(Ke=>Ke.ownerId===fe):da(ie,"residence");if(!ne)return;let pe=structuredClone(ie);if(E==="shared"?pe.spaces=pe.spaces?.map(Ke=>Ke.venueClass==="residence"?da(l,"residence"):Ke):pe.privateSpaces=pe.privateSpaces?.map(Ke=>Ke.ownerId===fe?l.privateSpaces?.find(vi=>vi.ownerId===fe)??Ke:Ke),!(JSON.stringify(io(pe))!==JSON.stringify(io(l))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){D(!0),ae(""),Re("");try{let Ke=await L(`/locations/venue/${encodeURIComponent(l.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:E,ownerId:fe,description:ne.description,state:ne.state})});of(Ke,`${E==="private"?"Private":"Shared"} room edit proposed.`)}catch(Ke){ae(Q(Ke,"That room edit could not be proposed."))}finally{D(!1)}}},lf=V2(l,z);return(0,o.jsxs)("div",{className:`${n}-root`,"data-venue-view":dt==="view"?"true":void 0,children:[(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:dt==="view"?lf:`${dt==="edit"?"Edit Venue":"Propose Change"} \xB7 ${lf}`}),(0,o.jsx)("p",{className:`${n}-subtitle`,children:dt==="view"?l.form||T||(u.length===0?"Nobody is here right now":`Villagers here: ${u.map(E=>E.name).join(", ")}`):dt==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,o.jsxs)("div",{className:`${n}-venue-header-controls`,children:[(0,o.jsx)("div",{className:`${n}-actions`,children:dt==="view"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Ae(structuredClone(l)),ae(""),Re(""),Qe("edit")},children:"Edit Venue"}),p.includes("residence")&&!l.occupancy.playerHome?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{ae(""),L(`/locations/venue/${encodeURIComponent(l.id)}/player-move`,{method:"POST"}).then(r).catch(E=>ae(Q(E,"The move could not be requested.")))},children:"Request to live here"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Je({classes:p,capacity:l.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),ae(""),Re(""),Qe("proposal")},children:"Propose Change"}),Vt?.placeId===l.id?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Y("room"),children:"Return to scene"}):null]}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:d$,children:dt==="edit"?"Close Editor":"Exit Change Proposal"})}),dt==="view"&&G?(0,o.jsx)("p",{className:`${n}-venue-move-error`,role:"alert",children:G}):null]})]}),dt==="view"?(0,o.jsxs)("main",{className:n+"-venue-page","aria-label":"View Venue",children:[(0,o.jsxs)("nav",{className:n+"-venue-zones","aria-label":"Venue zones",children:[(0,o.jsx)("button",{type:"button",className:n+"-venue-back",onClick:Pg,children:"\u2190 Back to map"}),oc.map(E=>(0,o.jsxs)("button",{type:"button",className:n+"-venue-zone-tab","data-active":de.key===E.key?"true":"false","aria-current":de.key===E.key?"page":void 0,onClick:()=>ut(E.key),children:[(0,o.jsx)("span",{className:n+"-venue-zone-thumb",children:E.image&&!E.locked?(0,o.jsx)("img",{src:E.image.url,alt:""}):(0,o.jsx)("span",{"aria-hidden":"true",children:E.locked?"\u25C8":"\u2302"})}),(0,o.jsxs)("span",{className:n+"-venue-zone-copy",children:[(0,o.jsx)("strong",{children:E.label}),(0,o.jsx)("small",{children:E.subtitle})]})]},E.key))]}),(0,o.jsxs)("div",{className:n+"-venue-zone-content",children:[(0,o.jsx)("section",{className:n+"-venue-zone-main","aria-label":de.label,children:(0,o.jsx)("div",{className:n+"-venue-artwork",children:de.image&&!de.locked?(0,o.jsx)("img",{src:de.image.url,alt:de.label+" at "+l.name}):(0,o.jsx)("div",{className:n+"-venue-artwork-empty",children:de.locked?"Area not discovered yet":"No image for this area yet"})})}),(0,o.jsxs)("aside",{className:n+"-venue-zone-context",children:[(0,o.jsx)("span",{className:n+"-venue-kicker",children:"Zone"}),(0,o.jsx)("h2",{children:de.label}),(0,o.jsx)("p",{children:de.subtitle}),(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Occupancy"}),(0,o.jsx)("strong",{children:p.includes("residence")?su(l)+" / "+b1(l)+" residents":u.length+" here now"})]}),(0,o.jsxs)("div",{className:n+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Accessibility"}),(0,o.jsx)("strong",{children:de.accessLabel})]}),o$?(0,o.jsxs)("details",{className:n+"-venue-more",children:[(0,o.jsx)("summary",{children:"Area details"}),_u?(0,o.jsx)("p",{children:_u}):null,de.adaptationPending?(0,o.jsx)("p",{children:"This room is still being adapted after a move."}):null,de.state?.condition?(0,o.jsxs)("p",{children:["Condition: ",de.state.condition]}):null,de.state?.items.length?(0,o.jsxs)("p",{children:["Present items: ",de.state.items.join(", ")]}):null,de.state?.publicFacts.length?(0,o.jsxs)("p",{children:["Established facts: ",de.state.publicFacts.join(" \xB7 ")]}):null,de.state?.features.length?(0,o.jsxs)("p",{children:["Defining features: ",de.state.features.map(E=>E.text).join(" \xB7 ")]}):null,de.area==="outside"&&i.village.setting?(0,o.jsxs)("p",{children:["Village: ",i.village.setting]}):null,rf.map(E=>(0,o.jsxs)("p",{children:["Proposed room edit:"," ",E.declined?"declined or stale":`approved by ${E.approvedIds.length} of ${E.requiredIds.length} residents`]},E.id))]}):null,de.locked&&!de.canEnter?(0,o.jsx)("p",{className:n+"-venue-zone-guidance",children:"Visit the exterior and ask the resident for an invitation."}):null,Vt&&!sc?(0,o.jsx)("p",{className:n+"-venue-zone-guidance",children:"Move between zones to continue this visit."}):null,(0,o.jsx)("button",{type:"button",className:n+"-venue-visit",disabled:ra||!sc&&(!!Vt&&Vt?.placeId!==l.id||!de.canEnter),onClick:()=>sc?Y("room"):void ic(l,de.spaceClass,de.ownerId,de.area,de.zoneId),children:ra?"Opening visit\u2026":sc?"Return to scene \u2192":"Visit this area \u2192"})]})]})]}):dt==="edit"?(0,o.jsxs)("main",{className:`${n}-venue-editor-page`,children:[(0,o.jsx)("div",{className:`${n}-venue-space-grid`,children:oc.filter(E=>!E.locked).map(E=>s$(E.label+" image",E.image,E.area==="outside"?void 0:E.spaceClass,E.ownerId,E.zoneId))}),vn===l.id?(0,o.jsx)("p",{className:`${n}-hint`,children:"Drawing or saving the image\u2026"}):null,Og?.id===l.id?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Og.text}):null,de.zoneId&&!de.locked?(0,o.jsx)($2,{zone:de,onSave:async E=>{try{r(await L(`/venues/${encodeURIComponent(l.id)}/zones/${encodeURIComponent(de.zoneId)}`,{method:"PUT",body:JSON.stringify(E)}))}catch(fe){throw Xn({id:l.id,text:Q(fe,"The zone could not be saved.")}),fe}}},de.zoneId):null,ie?(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue details"}),(0,o.jsx)(v1,{draft:ie,existing:!0,villagers:i.villagers,editableClasses:p.filter(E=>E!=="residence"||!K||Ne),onChange:Ae}),K?(0,o.jsx)("p",{className:`${n}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Be||!ie.name.trim(),onClick:()=>{u$()},children:"Save Venue details"}),K&&Ne?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Be||!da(ie,"residence").description.trim(),onClick:()=>{sf("shared")},children:"Propose shared room edit"}):null]}),K&&!Ne?(0,o.jsx)("p",{className:`${n}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,fa&&ie?.privateSpaces?.filter(E=>E.ownerId===fa).map(E=>(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsxs)("h2",{className:`${n}-panel-title`,children:["Propose changes to ",Pa(E.ownerId),"'s private space"]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:E.description,onChange:fe=>Ae(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(pe=>pe.ownerId===E.ownerId?{...pe,description:fe.target.value}:pe)})})]}),(0,o.jsxs)("details",{className:`${n}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:E.state.condition,onChange:fe=>Ae(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(pe=>pe.ownerId===E.ownerId?{...pe,state:{...pe.state,condition:fe.target.value}}:pe)})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Objects physically in this room."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:E.state.items.join(`
`),onChange:fe=>Ae(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(pe=>pe.ownerId===E.ownerId?{...pe,state:{...pe.state,items:fe.target.value.split(`
`)}}:pe)})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${n}-hint`,children:"Durable truths about this room."}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:E.state.publicFacts.join(`
`),onChange:fe=>Ae(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(pe=>pe.ownerId===E.ownerId?{...pe,state:{...pe.state,publicFacts:fe.target.value.split(`
`)}}:pe)})})]})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Be||!E.description.trim(),onClick:()=>{sf("private",E.ownerId)},children:"Propose private room edit"})]},E.ownerId)),K&&(l.residentIds?.length??0)>0?(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Resident moves"}),(0,o.jsxs)("select",{value:Ie,onChange:E=>et(E.target.value),"aria-label":"Destination for resident move",children:[(0,o.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),i.settings.venues.filter(E=>E.id!==l.id&&_n(E).includes("residence")&&su(E)<b1(E)).map(E=>(0,o.jsx)("option",{value:E.id,children:E.name},E.id))]}),(l.residentIds??[]).map(E=>{let fe=i.residences.find(ne=>ne.characterId===E&&ne.status!=="current");return(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("strong",{children:Pa(E)}),fe?(0,o.jsx)("span",{className:`${n}-hint`,children:fe.status==="moving"?"Moving":"Awaiting consent"}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!Ie||Be,onClick:()=>{D(!0),L("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:E,venueId:Ie})}).then(r).catch(ne=>ae(Q(ne,"The move could not be requested."))).finally(()=>D(!1))},children:"Ask to move"})]},E)})]}):null,we?(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:we}):null,G?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:G}):null]}):(0,o.jsx)("main",{className:`${n}-venue-proposal-page`,children:(0,o.jsxs)("section",{className:`${n}-venue-card`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Propose a Venue change"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),me?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${n}-row`,children:us.map(E=>(0,o.jsxs)("label",{className:`${n}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:me.classes.includes(E),disabled:!me.classes.includes(E)&&me.classes.length>=2,onChange:fe=>Je(ne=>ne&&{...ne,classes:fe.target.checked?[...ne.classes,E]:ne.classes.filter(pe=>pe!==E)})})," ",E]},E))})]}),me.classes.includes("residence")?(0,o.jsxs)("label",{className:`${n}-label`,children:["Base capacity \xB7 includes you",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:1,max:4,value:me.capacity,onChange:E=>Je({...me,capacity:Number(E.target.value)})})]}):null,(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:me.slot,onChange:E=>Je({...me,slot:Number(E.target.value)}),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",l.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",l.improvements?.[1]?.title??"empty"]})]})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,o.jsx)("input",{className:`${n}-notice-input`,value:me.title,onChange:E=>Je({...me,title:E.target.value}),placeholder:"A second sleeping alcove"})]}),me.title?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{className:`${n}-label`,children:["What changes in the story?",(0,o.jsx)("textarea",{className:`${n}-textarea`,value:me.description,onChange:E=>Je({...me,description:E.target.value})})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,o.jsx)("input",{className:`${n}-notice-input`,type:"number",min:0,max:3,value:me.extraBeds,onChange:E=>Je({...me,extraBeds:Number(E.target.value)})})]})]}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:Be||me.classes.length<1||me.title.trim().length>0&&!me.description.trim(),onClick:()=>{D(!0),ae(""),L(`/locations/venue/${encodeURIComponent(l.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:me.classes,capacity:me.capacity,...me.title.trim()?{slot:me.slot,improvement:{title:me.title,description:me.description,extraBeds:me.extraBeds}}:{},title:me.title||`Change ${l.name}`,detail:me.description||`Change Venue Classes or capacity at ${l.name}.`})}).then(E=>{r(E),Je(null),Re("Proposal submitted.")}).catch(E=>ae(Q(E,"The proposal could not be saved."))).finally(()=>D(!1))},children:"Submit proposal"})]}):(0,o.jsx)("p",{className:`${n}-hint`,role:"status",children:we||"Proposal submitted."}),G?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:G}):null]})})]})}if(X==="menu")return(0,o.jsxs)("div",{className:`${n}-root ${n}-sectioned-menu`,"data-section":Ra,"data-page":re,"data-mobile":t,children:[(0,o.jsxs)("header",{className:`${n}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${n}-title`,children:F2[re]}),t?null:(0,o.jsx)("p",{className:`${n}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,o.jsx)("div",{className:`${n}-actions`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:re!=="index"?()=>zt("index"):nc,children:re!=="index"?"Back to menu":"Back to the village"})}),gi?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:gi}):null]}),(0,o.jsxs)("nav",{className:`${n}-menu-nav`,"aria-label":"Village menu pages",children:[(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village Management"}),(0,o.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":re==="villagers","data-active":re==="villagers"?"true":"false",disabled:!i||J,onClick:()=>Ot("villagers"),children:`Villagers (${i?.villagers.length??0})`}),(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":re==="memories","data-active":re==="memories"?"true":"false",disabled:!i||J,onClick:()=>Ot("memories"),children:"Memories"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":re==="venueRequests","data-active":re==="venueRequests"?"true":"false",disabled:!i||J,onClick:()=>Ot("venueRequests"),children:`Venue Requests (${(i?.venueRequests?.length??0)+(i?.upgradeRequests?.length??0)+(i?.residences?.filter(l=>l.status==="pending"&&l.requestedBy==="villager").length??0)})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":re==="projects","data-active":re==="projects"?"true":"false",disabled:!i||J,onClick:()=>Ot("projects"),children:`Projects (${i?.projects?.filter(l=>(l.kind==="new-venue"||l.kind==="renovation")&&l.lifecycle?.phase!=="complete").length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":re==="village","data-active":re==="village"?"true":"false",onClick:()=>Ot("village"),children:"Village Settings"})]})]}),(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"General Settings"}),(0,o.jsx)("div",{className:`${n}-menu-group-buttons`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":re==="general","data-active":re==="general"?"true":"false",onClick:()=>Ot("general"),children:"General settings"})})]}),(0,o.jsxs)("div",{className:`${n}-menu-group`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Debug"}),(0,o.jsxs)("div",{className:`${n}-menu-group-buttons`,children:[ks?(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":re==="progress","data-active":re==="progress"?"true":"false",disabled:!i||J,onClick:()=>Ot("progress"),children:"DEBUG: Progress"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":re==="chatlogs","data-active":re==="chatlogs"?"true":"false",disabled:!i||J,onClick:()=>Ot("chatlogs"),children:`DEBUG: Venue Visits (${N?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":re==="agendas","data-active":re==="agendas"?"true":"false",disabled:!i||J,onClick:()=>Ot("agendas"),children:`DEBUG: Villager Wishes (${yt?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-pressed":re==="schedules","data-active":re==="schedules"?"true":"false",disabled:!i||J,onClick:()=>Ot("schedules"),children:`Villager Agendas (${yt?.length??0})`})]})]})]}),re==="index"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-content ${n}-menu-welcome`,role:"main",children:[(0,o.jsx)("span",{className:`${n}-venue-kicker`,children:"Village menu"}),(0,o.jsx)("h2",{children:"Choose where to go"}),(0,o.jsx)("p",{children:"Manage the people and places in your village, adjust settings, or inspect its DEBUG records."}),(0,o.jsxs)("div",{className:`${n}-menu-quick-links`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ot("villagers"),children:"Village Management"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ot("general"),children:"General Settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ot("chatlogs"),children:"DEBUG Settings"})]})]}):!i&&re!=="general"?(0,o.jsx)("section",{className:`${n}-panel ${n}-menu-content`,role:"main",children:gi?"The village could not be loaded. Return to the village and try again.":"Loading village menu\u2026"}):re==="general"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-content`,role:"main",children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"General settings"}),(0,o.jsx)(tg,{}),i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-row`,htmlFor:`${n}-speech-colors`,children:[(0,o.jsx)("input",{id:`${n}-speech-colors`,type:"checkbox",checked:i.settings.characterSpeechColors,disabled:J,onChange:l=>{Ex(l.target.checked)}}),(0,o.jsx)("span",{children:"Character chat colors"})]}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Show names and spoken words in the colors captured from each villager\u2019s card. Use Compare card and Apply refresh to adopt later color changes."})]}):null,i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-story-pace`,children:"Story pace"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,o.jsx)("select",{id:`${n}-story-pace`,value:i.settings.storyPace,disabled:J,onChange:l=>{Cx(l.target.value)},children:i.settings.storyPaces.map(l=>(0,o.jsx)("option",{value:l,children:l.charAt(0).toUpperCase()+l.slice(1)},l))}),(0,o.jsx)("span",{className:`${n}-hint`,children:x2(i.settings.storyPace)})]}):null,i?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-visit-retention`,children:"Visit transcripts"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,o.jsxs)("select",{id:`${n}-visit-retention`,value:i.settings.visitRetention.mode,disabled:J,onChange:l=>{let u=l.target.value;Zg({mode:u,value:u==="count"?100:u==="days"?365:0})},children:[(0,o.jsx)("option",{value:"forever",children:"Keep forever"}),(0,o.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,o.jsx)("option",{value:"days",children:"Retire after days"})]}),i.settings.visitRetention.mode!=="forever"?(0,o.jsx)("input",{type:"number","aria-label":i.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:i.settings.visitRetention.mode==="count"?1:30,max:i.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:i.settings.visitRetention.value,onBlur:l=>{let u=Number(l.target.value);u!==i.settings.visitRetention.value&&Zg({mode:i.settings.visitRetention.mode,value:u})}},`${i.settings.visitRetention.mode}:${i.settings.visitRetention.value}`):null]}):null,(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("span",{className:`${n}-label`,children:"Starting over"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,o.jsx)("div",{className:`${n}-row`,children:F1?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-danger`,disabled:J,onClick:()=>{Jx()},children:"Yes, empty the village"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:()=>Zl(!1),children:"Keep it"})]}):(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||!i,onClick:()=>Zl(!0),children:"Reset the village and start over"})})]}),ga?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:ga}):null]}):re==="village"?(0,o.jsxs)("div",{className:`${n}-menu-body ${n}-menu-content`,role:"main",children:[i?(0,o.jsxs)("section",{className:`${n}-panel`,children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Village settings"}),(0,o.jsx)("p",{className:`${n}-empty`,children:"These choices belong to this village. Resident cards shape their voices, and Villages writes each scene around what is happening now. Village knowledge is refreshed for every reply."}),(0,o.jsx)(Y2,{}),(0,o.jsxs)("section",{className:n+"-field","aria-label":"Village Map",children:[(0,o.jsx)("h3",{className:n+"-panel-title",children:"Village Map"}),(0,o.jsx)("p",{className:n+"-hint",children:"Replace the background image here. Venue pins remain in their saved places until you reposition them in the preview."}),rn?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:"Venues will not move automatically. Review every pin on the new map; moving one here is free and does not change its residents, projects, or history."}):null,(0,o.jsx)(eg,{src:ex,alt:"Village map preview with venue pins",pins:i.settings.venues.flatMap(l=>{let u=rn?ps[l.id]:au(l);return!u||u.x===null||u.y===null?[]:[{id:l.id,x:u.x,y:u.y,text:l.name,tone:ou(l)?x1({isPlayerHome:l.occupancy.playerHome,occupant:l.occupancy.residentCharacterId}):"venue",onSelect:()=>ql(l.id)}]}),placing:rn&&Lr!==null,view:ir,shape:K1,zoom:W1,mobile:t,onView:Jl&&!Lr?Yn:void 0,onPlace:rn&&Lr?(l,u)=>{fg(p=>({...p,[Lr]:{x:l,y:u}})),ql(Lr),hs(null)}:void 0}),rn?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:J||Gr,onClick:()=>{Vx()},children:Gr?"Generating map\u2026":"Generate replacement"}),(0,o.jsx)("input",{className:n+"-file",type:"file",accept:"image/png,image/jpeg,image/webp,image/avif","aria-label":"Upload replacement village map",disabled:J||Gr,onChange:l=>{let u=l.target.files?.[0];l.target.value="",Ix(u)}}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:J||Gr,onClick:()=>{jr(!0),Zr(null),Yn(null),hs(null)},children:"No background image"})]}),bn||ms?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:n+"-hint",children:"Select a venue, then choose Move pin and its new position on the preview. Unmoved venues keep their saved coordinates."}),(0,o.jsx)("div",{className:n+"-field","aria-label":"Venue placement",children:i.settings.venues.map(l=>{let u=ps[l.id],p=l.occupancy.residentCharacterId?Pa(l.occupancy.residentCharacterId):l.occupancy.playerHome?Dl(i):"";return(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":q1===l.id,onClick:()=>ql(l.id),children:l.name}),(0,o.jsx)("span",{className:n+"-hint",children:p||"No resident"}),(0,o.jsx)("span",{className:n+"-hint",children:u?.x!==null&&u?.x!==void 0&&u?.y!==null&&u?.y!==void 0?"On map":"Not placed"}),(0,o.jsx)("button",{type:"button",className:n+"-button","aria-pressed":Lr===l.id,onClick:()=>hs(l.id),children:"Move pin"})]},l.id)})})]}):null,ku?(0,o.jsx)("p",{className:n+"-hint","data-tone":ku.tone,children:ku.text}):null,Jl?(0,o.jsx)("div",{className:n+"-steps",role:"group","aria-label":"How the picture sits in the frame",children:$1.map(l=>(0,o.jsx)("button",{type:"button",className:n+"-step","data-clickable":"true","data-active":ir.fit===l.fit?"true":"false","aria-pressed":ir.fit===l.fit,onClick:()=>Yn({...ir,fit:l.fit}),children:l.label},l.fit))}):null,(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:J||Gr||!bn&&!ms,onClick:()=>{Qg()},children:"Save map and placements"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:J||Gr,onClick:Jg,children:"Cancel replacement"})]})]}):Jl?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:n+"-steps",role:"group","aria-label":"How the picture sits in the frame",children:$1.map(l=>(0,o.jsx)("button",{type:"button",className:n+"-step","data-clickable":"true","data-active":ir.fit===l.fit?"true":"false","aria-pressed":ir.fit===l.fit,onClick:()=>Yn({...ir,fit:l.fit}),children:l.label},l.fit))}),(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:J,onClick:()=>{Qg()},children:"Save framing"}),(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:J,onClick:Jg,children:"Cancel"})]})]}):(0,o.jsxs)("div",{className:n+"-row",children:[(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:J,onClick:Ox,children:"Replace map"}),i.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:n+"-button",disabled:J||!Pr,onClick:()=>Ql(!0),children:"Crop or fit current map"}):null]}),ga?(0,o.jsx)("p",{className:n+"-error",role:"alert",children:ga}):null]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||!i,onClick:()=>As(!1,i),children:"Run setup again"}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${n}-setting`,className:`${n}-textarea ${n}-off`,value:Ge,maxLength:i.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:l=>ha(l.target.value)}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,o.jsx)(k1,{books:lu,error:dg,selected:ma,onChange:Un,disabled:J}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${n}-lore-budget`,className:`${n}-notice-input`,type:"number",min:i.settings.loreTokenBudgetMin,max:i.settings.loreTokenBudgetMax,step:100,value:ja,disabled:J,onChange:l=>qn(Number(l.target.value))}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,o.jsxs)("section",{className:`${n}-field`,children:[(0,o.jsxs)("div",{className:`${n}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venues"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:Kx,disabled:J||Ux>=i.settings.maxPlaces,children:"Propose Venue Project"})]}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,o.jsx)("input",{className:`${n}-notice-input`,type:"search",value:hg,onChange:l=>U1(l.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,o.jsx)("div",{className:`${n}-notice-add`,children:i.settings.venues.filter(l=>`${l.name} ${l.form??""} ${_n(l).join(" ")}`.toLowerCase().includes(hg.toLowerCase())).map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name||"Unnamed Residence"}),(0,o.jsx)("span",{className:`${n}-hint`,children:[l.form,_n(l).join(" + ")].filter(Boolean).join(" \xB7 ")}),_n(l).includes("residence")?(0,o.jsxs)("span",{className:`${n}-hint`,children:[(l.residentIds?.length??+!!l.occupancy.residentCharacterId)+Number(l.occupancy.playerHome)," ","/ ",l.residenceCapacity??1," residents"]}):null,(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>zu(l),children:"View Venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ae(structuredClone(l)),children:"Edit"}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{e$(l.id)},"aria-label":`Delete ${l.name}`,disabled:J,children:"\xD7"})]})]},l.id))}),ie?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("h3",{className:`${n}-panel-title`,children:i.settings.venues.some(l=>l.id===ie.id)?"Edit Venue":"Create Venue"}),(0,o.jsx)(v1,{draft:ie,existing:i.settings.venues.some(l=>l.id===ie.id),villagers:i.villagers,onChange:Ae}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||!ie.name.trim()||!_n(ie).every(l=>da(ie,l).description.trim()),onClick:()=>{Wx(ie)},children:"Save Venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ae(null),children:"Cancel"})]})]}):null,(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Ax()},disabled:J,children:"Suggest Venues"})}),Hl.filter(l=>!i.settings.venues.some(u=>u.id===l.id)).map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name}),(0,o.jsx)("span",{className:`${n}-hint`,children:l.form}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Ae(l),children:"Review suggestion"})]},l.id))]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-knowledge`,children:"The information villagers know"}),(0,o.jsx)("textarea",{id:`${n}-knowledge`,ref:Au,className:`${n}-preset`,value:S,maxLength:i.settings.promptBoxMaxLength,spellCheck:!1,onChange:l=>x(l.target.value)}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card guides their voice; additional writing guidance is in Village Settings."}),(0,o.jsx)("div",{className:`${n}-macros`,children:i.settings.macros.map(l=>(0,o.jsx)("button",{type:"button",className:`${n}-macro`,title:`${l.label} \u2014 ${l.help}`,onClick:()=>t$(l.token),children:l.token},l.token))}),(0,o.jsxs)("p",{className:`${n}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,o.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,o.jsx)(j2,{idPrefix:"settings",personas:he,draft:I,onDraft:P,storedId:i.settings.playerPersonaId,storedName:i.settings.playerPersonaName,storedMissing:i.settings.playerPersonaMissing,disabled:J}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Tx()},disabled:J,children:"Save settings"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{x(i.settings.defaultPromptKnowledge)},disabled:J,children:"Restore the default box"}),(0,o.jsx)("span",{className:`${n}-hint`,children:S===i.settings.promptKnowledge&&I===i.settings.playerPersonaId&&Ge===i.settings.setting&&JSON.stringify(ma)===JSON.stringify(i.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,ga&&!rn&&!zg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:ga}):null]}):(0,o.jsxs)("div",{className:`${n}-menu-body ${n}-menu-content`,role:"main",children:[Ra==="debug"?(0,o.jsxs)("section",{className:`${n}-panel ${n}-menu-debug-action`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:!i||J||Eu,onClick:()=>{lx()},children:"Force Village Update"}),(0,o.jsx)("p",{className:`${n}-status`,children:K2}),qg?(0,o.jsx)("p",{className:`${n}-status`,role:"status",children:qg}):null]}):null,re==="villagers"&&ht&&i?.villagers.some(l=>l.characterId===ht)?(0,o.jsx)(zf,{villager:i.villagers.find(l=>l.characterId===ht),request:L,onSaved:l=>r(l),onExport:()=>P2(i.villagers.find(l=>l.characterId===ht)),onBack:()=>{ia(null),requestAnimationFrame(()=>{for(let{element:l,top:u}of C.current)l.scrollTop=u;At.current?.focus({preventScroll:!0})})}},ht):null,re==="villagers"?(0,o.jsxs)("div",{className:`${n}-overlay`,style:ht?{display:"none"}:void 0,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Villagers"})}),(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>A(l=>!l),disabled:J,children:qt?"Close the list":"Add a villager"})}),qt?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("input",{className:`${n}-search`,type:"search",value:Ki,onChange:l=>mi(l.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),d===null?(0,o.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):Iu.length===0?(0,o.jsx)("p",{className:`${n}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,o.jsx)("div",{className:`${n}-picker-list`,children:Iu.map(l=>(0,o.jsxs)("div",{className:`${n}-picker-item`,"data-resident":l.inVillage?"true":"false",children:[(0,o.jsx)(Ur,{portrait:j[l.id],name:l.name,className:`${n}-avatar`}),(0,o.jsxs)("div",{className:`${n}-picker-text`,children:[(0,o.jsx)("div",{className:`${n}-villager-name`,children:l.name}),(0,o.jsx)("div",{className:`${n}-villager-role`,children:l.comment||l.tags.slice(0,3).join(" \xB7 ")}),l.summary?(0,o.jsx)("p",{className:`${n}-tile-summary`,children:l.summary}):null]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{px(l.id)},disabled:J||l.inVillage,children:l.inVillage?"Lives here":"Move in"})]},l.id))})]}):null,i&&i.villagers.length>0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:`${n}-villagers`,children:i.villagers.map(l=>(0,o.jsx)(X2,{villager:l,portrait:j[l.characterId],selected:!1,onSelect:!l.place||_!==null?void 0:()=>{let u=i.settings.venues.find(p=>p.id===l.place?.id);u&&Xg(u)}},l.characterId))}),(0,o.jsx)("div",{className:`${n}-roster`,children:i.villagers.map(l=>(0,o.jsx)("div",{className:`${n}-roster-entry`,children:(0,o.jsxs)("div",{className:`${n}-roster-row`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${n}-villager-name`,children:l.name}),l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null,ke[l.characterId]?(0,o.jsx)("div",{className:`${n}-tile-summary`,children:ke[l.characterId].changed?`New card: ${ke[l.characterId].proposed?.name??"unavailable"}`:ke[l.characterId].sourceAvailable?`Snapshot revision ${ke[l.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,o.jsxs)("span",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:u=>{At.current=u.currentTarget,C.current=[];for(let p=u.currentTarget.parentElement;p;p=p.parentElement)C.current.push({element:p,top:p.scrollTop});ia(l.characterId)},"aria-expanded":ht===l.characterId,children:`Sprite Studio \xB7 ${l.sprite?.images.length??0} approved`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{fx(l.characterId)},disabled:J||ua.length>0,children:"Compare card"}),ke[l.characterId]?.changed&&ke[l.characterId]?.sourceAvailable?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{bx(l.characterId)},disabled:J||ua.length>0,children:"Apply refresh"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{gx(l.characterId)},disabled:J||ua.length>0,children:"Move out"})]})]})},l.characterId))})]}):(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]})]}):null,re==="memories"?(0,o.jsxs)("div",{className:n+"-overlay",children:[(0,o.jsx)("div",{className:n+"-overlay-head",children:(0,o.jsx)("h2",{className:n+"-panel-title",children:"Memories"})}),(0,o.jsx)(l2,{library:g,busy:J,onRefresh:()=>{b(null),Es()},onForget:(l,u)=>{cx(l,u)}})]}):null,re==="noticeboard"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Noticeboard"})}),i.noticeboard.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,o.jsx)("ul",{className:`${n}-notices`,children:i.noticeboard.map((l,u)=>(0,o.jsxs)("li",{className:`${n}-notice-row`,children:[(0,o.jsxs)("span",{children:[l.author.length>0?(0,o.jsx)("span",{className:`${n}-notice-author`,children:`${l.author}: `}):null,l.text]}),(0,o.jsx)("button",{type:"button",className:`${n}-remove`,onClick:()=>{a$(u)},disabled:J,"aria-label":`Take down: ${l.text}`,children:"\xD7"})]},`${u}:${l.text}`))}),(0,o.jsxs)("div",{className:`${n}-notice-add`,children:[(0,o.jsx)("input",{className:`${n}-notice-input`,type:"text",value:Bl,maxLength:i.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:l=>bg(l.target.value),onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),tf())}}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{tf()},disabled:J||Bl.trim().length===0||i.noticeboard.length>=i.settings.maxNoticeboardNotes,children:`Pin it up (${i.noticeboard.length}/${i.settings.maxNoticeboardNotes})`})]})]}):null,re==="projects"&&i?(0,o.jsx)(ek,{snapshot:i,room:_,onSnapshot:r,onReturn:()=>Y("room"),onMap:()=>{St(""),nc()},onPlaceOnMap:l=>{$e(l),_e(l),nc()},mobile:t,debugEnabled:ks,focusProjectId:le,siteProjectId:W}):null,re==="venueRequests"&&i?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue Requests"})}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Villagers can ask for places in conversation. Accepting a request starts a New Venue Project; place its blueprint on the map, find a willing Builder, and work through the Project phases."}),i.venueRequests.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody has requested a new place."}):(0,o.jsx)("ul",{className:`${n}-notices`,children:i.venueRequests.map(l=>{let u=kt[l.id]??l.venueDraft,p=T=>La(z=>({...z,[l.id]:{...u,...T}}));return(0,o.jsx)("li",{className:`${n}-notice-row`,children:(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("strong",{children:l.requesterName||"A villager"}),l.requestQuote?(0,o.jsxs)("p",{children:["\u201C",l.requestQuote,"\u201D"]}):null,(0,o.jsx)("span",{className:`${n}-hint`,children:` \xB7 ${l.source==="chat"?"Conversation":"Village life"}`}),(0,o.jsx)("input",{className:`${n}-notice-input`,value:u.name,maxLength:i.settings.maxVenueNameLength,"aria-label":`Requested place name from ${l.requesterName||"villager"}`,onChange:T=>p({name:T.target.value})}),(0,o.jsxs)("select",{className:`${n}-notice-input`,value:u.classes[0]??"gathering","aria-label":`Requested place class from ${l.requesterName||"villager"}`,onChange:T=>p({classes:[T.target.value]}),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"other",children:"Other"})]}),(0,o.jsx)("textarea",{className:`${n}-textarea`,value:u.description??"",maxLength:1e3,"aria-label":`Requested place description from ${l.requesterName||"villager"}`,onChange:T=>p({description:T.target.value})}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||!u.name.trim(),onClick:()=>{ue(!0),be(""),L("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:u.name,classes:u.classes}]})}).then(T=>p({description:T.descriptions[l.id]??""})).catch(T=>be(Q(T,"The description draft could not be generated."))).finally(()=>ue(!1))},children:"Generate description draft"}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||!u.name.trim()||u.classes.length===0||!u.description?.trim(),onClick:()=>{ef(l,!0)},children:u.name!==l.venueDraft.name||JSON.stringify(u.classes)!==JSON.stringify(l.venueDraft.classes)?"Send counteroffer":"Start planning project"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:()=>{ef(l,!1)},children:"Deny"})]})]})},l.id)})}),(0,o.jsx)("h3",{className:`${n}-panel-title`,children:"Home upgrade requests"}),i.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No home upgrades requested."}):i.upgradeRequests.map(l=>(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("span",{children:l.detail}),[!0,!1].map(u=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:()=>{ue(!0),be(""),L(`/venue-upgrades/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST"}).then(r).catch(p=>be(Q(p,"The upgrade request could not be decided."))).finally(()=>ue(!1))},children:u?"Approve upgrade":"Deny"},String(u)))]},l.id)),(0,o.jsx)("h3",{className:`${n}-panel-title`,children:"Resident move requests"}),i.residences.filter(l=>l.status!=="current").length===0?(0,o.jsx)("p",{className:`${n}-hint`,children:"No moves pending."}):i.residences.filter(l=>l.status!=="current").map(l=>{let u=Pa(l.characterId),p=i.settings.venues.find(T=>T.id===l.proposedVenueId)?.name||"another venue";return(0,o.jsxs)("div",{className:`${n}-notice-row`,children:[(0,o.jsx)("span",{children:`${u} \u2192 ${p}`}),l.status==="moving"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("span",{className:`${n}-hint`,children:["Move due ",new Date(l.completesAt??"").toLocaleString()]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:()=>{ue(!0),be(""),L("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(T=>be(Q(T,"The move could not be completed."))).finally(()=>ue(!1))},children:"DEBUG: Complete move now"})]}):l.requestedBy==="player"?(0,o.jsxs)("span",{className:`${n}-hint`,children:["Awaiting ",u,"'s answer in conversation."]}):[!0,!1].map(T=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:()=>{ue(!0),be(""),L(`/residences/${T?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(z=>be(Q(z,"The move request could not be decided."))).finally(()=>ue(!1))},children:T?"Approve move":"Deny"},String(T)))]},l.characterId)}),ga?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:ga}):null]}):null,re==="progress"?(0,o.jsxs)("div",{className:`${n}-panel`,children:[(0,o.jsx)("h2",{children:"DEBUG: Progress"}),(0,o.jsxs)("p",{children:["Engine version: ",ct?.engineVersion??"loading"]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{L("/progress/debug").then(Et)},children:"Refresh diagnostics"}),ct?.backlog.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Unprocessed saved turns"}),ct.backlog.map(l=>(0,o.jsxs)("p",{children:[l.at," \xB7 ",l.sessionId,"/",l.submissionId," ",l.error?`\xB7 ${l.error}`:"\xB7 awaiting replay"]},`${l.sessionId}:${l.submissionId}`))]}):(0,o.jsx)("p",{children:"No saved turns await replay."}),ct?.speechProofs?.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Captured Project speech"}),ct.speechProofs.map(l=>(0,o.jsxs)("p",{children:[l.projectId," \xB7 ",l.grade??"typed"," \xB7 ",l.lineId,": \u201C",l.quote,"\u201D",l.citations?.map((u,p)=>(0,o.jsxs)("span",{children:[" ","\xB7 ",u.lineId,": \u201C",u.quote,"\u201D"]},`${u.lineId}:${p}`))]},`${l.projectId}:${l.lineId}`))]}):null,ct?.tasks.map(l=>(0,o.jsxs)("details",{open:!0,children:[(0,o.jsxs)("summary",{children:[l.definition.owner.kind," ",l.definition.owner.id," \xB7 revision ",l.definition.revision," \xB7"," ",l.resolvedAt?"resolved":l.definition.phases[l.phaseIndex]?.title??"complete"]}),(0,o.jsxs)("p",{children:["Disclosed: ",l.visibleAt||"hidden",l.resolvedAt?` \xB7 Resolved: ${l.resolvedAt} \xB7 ${l.resolutionKey}`:""]}),l.definition.phases.map(u=>(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:u.title}),u.requirements.map(p=>{let T=l.receipts.filter(z=>z.phaseId===u.id&&z.requirementId===p.id);return(0,o.jsxs)("p",{children:[p.title," \xB7 ",l.requirementVisibleAt[p.id]||"hidden"," \xB7"," ",T.length?T.map(z=>`${z.routeId} [${z.evidence.grade??"typed"}]: ${z.evidence.sourceId} ${z.evidence.excerpt??""} ${(z.evidence.citations??[]).map(q=>`${q.lineId}: ${q.quote}`).join("; ")}`).join("; "):"pending"]},p.id)})]},u.id)),l.attempts.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Rejected or unavailable"}),l.attempts.map((u,p)=>(0,o.jsxs)("p",{children:[u.phaseId,"/",u.requirementId," \xB7 ",u.status,": ",u.reason]},`${u.evidenceId}:${p}`))]}):null,l.transitions.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Transitions"}),l.transitions.map((u,p)=>(0,o.jsxs)("p",{children:[u.phaseId," \u2192 ",u.at," \xB7 ",u.evidenceId]},`${u.phaseId}:${p}`))]}):null,l.revisionHistory?.map(u=>(0,o.jsxs)("details",{children:[(0,o.jsxs)("summary",{children:["Earlier revision ",u.definition.revision," \xB7 ",u.receipts.length," accepted sources"]}),u.receipts.map(p=>(0,o.jsxs)("p",{children:[p.requirementId," \xB7 ",p.evidence.grade??"typed"," \xB7 ",p.evidence.sourceId," ","\xB7 ",p.evidence.excerpt??"",p.evidence.citations?.map(T=>(0,o.jsxs)("span",{children:[" ","\xB7 ",T.lineId,": \u201C",T.quote,"\u201D"]},`${T.lineId}:${T.quote}`))]},`${p.requirementId}:${p.evidence.sourceId}`)),u.transitions.map((p,T)=>(0,o.jsxs)("p",{children:[p.phaseId," \u2192 ",p.at]},`${p.phaseId}:${T}`))]},u.definition.revision))]},l.definition.id)),gi?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:gi}):null]}):null,re==="chatlogs"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Venue visits"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsxs)("select",{"aria-label":"Filter visits by venue",value:F,onChange:l=>{te(l.target.value),O(0),R(null)},children:[(0,o.jsx)("option",{value:"",children:"All venues"}),(i?.settings.venues??[]).map(l=>(0,o.jsx)("option",{value:l.id,children:l.name},l.id))]}),(0,o.jsxs)("select",{"aria-label":"Filter visits by resident",value:ye,onChange:l=>{oe(l.target.value),O(0),R(null)},children:[(0,o.jsx)("option",{value:"",children:"All residents"}),(i?.villagers??[]).map(l=>(0,o.jsx)("option",{value:l.characterId,children:l.name},l.characterId))]})]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||v===0,onClick:()=>{Gg()},children:"Delete all completed logs"}),Pe?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Pe}):null,N===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading venue visits\u2026"}):N.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"No completed visits match these filters."}):N.map(l=>(0,o.jsxs)("section",{children:[(0,o.jsxs)("h3",{className:`${n}-story-day`,children:[l.placeName," \xB7 ",iu(l.startedAt)]}),(0,o.jsxs)("p",{className:`${n}-story-meta`,children:[l.participants.map(u=>u.name).join(", ")," \xB7 ",l.lineCount," lines",l.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",l.memoryPending?l.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${l.memoryReview.nextRecollection??0}/${l.recollectionCount} recollections reviewed \xB7 ${l.memoryReview.attempts} ${l.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${l.memoryProgress?.nextUnit??0}/${l.memoryUnits} pieces processed)`:""]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Mu(l.id)},children:y?.id===l.id?"Refresh transcript":"Open transcript"}),l.memoryPending?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:()=>{mx(l.id)},children:l.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:()=>{Gg(l.id)},children:"Delete log"})]}),y?.id===l.id?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("ul",{className:`${n}-story`,children:y.lines.map((u,p)=>(0,o.jsx)("li",{className:`${n}-story-row`,children:(0,o.jsxs)("span",{children:[(0,o.jsxs)("span",{className:`${n}-story-meta`,children:[(0,o.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?ru(i.villagers.find(T=>T.characterId===u.speakerId)?.nameColor):void 0,children:u.name||Dl(i)})," \xB7 ",iu(u.at)]}),(0,o.jsx)("span",{style:i?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?ru(i.villagers.find(T=>T.characterId===u.speakerId)?.dialogueColor):void 0,children:cs(u.content,`venue-${l.id}-${p}-`)}),(0,o.jsxs)("span",{className:`${n}-story-meta`,children:["Heard by:"," ",u.heardBy?.map(T=>y.participants.find(z=>z.characterId===T)?.name??T).join(", ")||"no one"]})]})},`${l.id}:${p}`))}),(y.submissions??[]).some(u=>u.recollections?.length)?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,o.jsx)("summary",{children:"Captured recollections and evidence"}),(0,o.jsx)("ul",{className:`${n}-story`,children:(y.submissions??[]).flatMap(u=>(u.recollections??[]).map(p=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:p.text}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Subjects: ${p.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${p.knownByCharacterIds.join(", ")}`}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Evidence: ${p.lineIds.join(", ")}`})]},p.id)))})]}):null,y.memoryReview&&y.memoryReview.status!=="none"?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,open:y.memoryPending,children:[(0,o.jsx)("summary",{children:`Durable review \xB7 ${y.memoryReview?.status??"none"}`}),(0,o.jsxs)("div",{className:`${n}-agenda-notes-body`,children:[(0,o.jsxs)("p",{className:`${n}-story-meta`,children:[`${y.memoryReview?.attempts??0} review attempts \xB7 ${y.memoryReview?.nextRecollection??0} recollections reviewed`,y.memoryReview?.error?` \xB7 Last error: ${y.memoryReview.error}`:""]}),(0,o.jsx)("ul",{className:`${n}-story`,children:(y.memoryReview?.decisions??[]).map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:`${u.action==="promote"?"Promoted":"Rejected"}${u.category?` \xB7 ${R1[u.category]}`:""}`}),u.text?(0,o.jsx)("p",{children:u.text}):null,(0,o.jsx)("p",{className:`${n}-wish-meta`,children:u.reason}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Sources: ${u.recollectionIds.join(", ")}`})]},u.id))})]})]}):null]}):null]},l.id)),v>20?(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:M===0,onClick:()=>{O(Math.max(0,M-20)),R(null)},children:"Previous"}),(0,o.jsxs)("span",{children:[M+1,"\u2013",Math.min(v,M+20)," of ",v]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:M+20>=v,onClick:()=>{O(M+20),R(null)},children:"Next"})]}):null]}):null,re==="agendas"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"What the villagers wish"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),yt===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Reading what the villagers wish\u2026"}):yt.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("section",{children:yt.map(l=>(0,o.jsxs)("div",{children:[(0,o.jsxs)("h3",{className:`${n}-story-day`,children:[l.name,l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"card missing"}):null]}),l.agenda===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):l.agenda.wishes.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure?`Wish generation failed: ${l.agenda.personalizationFailure}`:l.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,o.jsx)("ul",{className:`${n}-story`,children:l.agenda.wishes.map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:u.wish}),u.tell.length>0?(0,o.jsx)("p",{className:`${n}-wish-tell`,children:`Shows as: ${u.tell}`}):null,(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`${u.intensity===1?"Faint":u.intensity===3?"Strong":"Present"} \xB7 ${u2(u.addedAt??"",u.expiresAt??"")}`})]},u.id))}),l.completedWishes.length>0?(0,o.jsxs)("details",{className:`${n}-agenda-notes`,children:[(0,o.jsx)("summary",{children:`Completed wishes (${l.completedWishes.length})`}),(0,o.jsx)("ul",{className:`${n}-story`,children:l.completedWishes.map(u=>(0,o.jsxs)("li",{className:`${n}-wish-card`,children:[(0,o.jsx)("p",{className:`${n}-wish-text`,children:u.wish.wish}),(0,o.jsx)("p",{className:`${n}-wish-meta`,children:`Fulfilled ${new Date(u.fulfilledAt).toLocaleDateString()}`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:()=>{ux(l.characterId,u.wish.id)},children:"Mark as not fulfilled"})]},u.wish.id))})]}):null]},l.characterId))})]}):null,re==="schedules"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:"Villager agendas"})}),(0,o.jsx)("p",{className:`${n}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),yt===null?(0,o.jsx)("p",{className:`${n}-empty`,children:"Loading agendas\u2026"}):yt.length===0?(0,o.jsx)("p",{className:`${n}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("div",{className:`${n}-agenda-list`,children:yt.map(l=>(0,o.jsxs)("details",{className:`${n}-week`,children:[(0,o.jsx)("summary",{className:`${n}-week-toggle`,children:(0,o.jsxs)("h3",{className:`${n}-week-head`,children:[l.name,l.agenda?.personalizationPending?(0,o.jsx)("span",{className:`${n}-badge`,children:l.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,l.agenda?.personalizationFailure?(0,o.jsx)("span",{className:`${n}-badge`,children:"Personalization failed"}):null,l.missing?(0,o.jsx)("span",{className:`${n}-badge`,children:"Card missing"}):null,l.nativeSchedule?(0,o.jsx)("span",{className:`${n}-badge`,children:l.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,Jp(l)?(0,o.jsx)("span",{className:`${n}-badge`,children:"Earlier hours kept"}):null]})}),(0,o.jsxs)("div",{className:`${n}-week-body`,children:[l.agenda?.routineSummary?(0,o.jsx)("p",{className:`${n}-story-meta`,children:l.agenda.routineSummary}):null,l.agenda?.personalizationFailure?(0,o.jsx)("p",{className:`${n}-empty`,children:l.agenda.personalizationFailure}):l.agenda?.personalizationPending?(0,o.jsx)("p",{className:`${n}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,o.jsxs)("div",{className:`${n}-agenda-actions`,children:[(0,o.jsxs)("label",{className:`${n}-agenda-switch`,children:[(0,o.jsx)("input",{type:"checkbox",checked:l.ingestSchedule,disabled:J,onChange:u=>{hx(l.characterId,u.target.checked)}}),"Use Marinara schedule when available"]}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:()=>{dx(l.characterId)},children:"Regenerate agenda"})]}),l.nativeSchedule?(0,o.jsxs)("p",{className:`${n}-story-scope`,children:[l.ingestSchedule&&l.remapFailure?`Schedule translation failed: ${l.remapFailure.message}`:l.ingestSchedule&&l.agenda?.scheduleWeek?"Schedule guides today and future days.":l.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",Jp(l)?" Earlier hours retain the previous plan.":""]}):Jp(l)?(0,o.jsx)("p",{className:`${n}-story-scope`,children:"Earlier hours retain the previous plan."}):null,l.weekUnreadable?(0,o.jsx)("p",{className:`${n}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):l.nativeSchedule?null:(0,o.jsx)("p",{className:`${n}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,o.jsx)("div",{className:`${n}-agenda-days`,children:l.days.map(u=>{let p=u.isToday?l.agenda?.activeDay?.blocks??l.agenda?.week?.[u.weekday]??[]:(l.ingestSchedule?l.agenda?.scheduleWeek?.[u.weekday]:void 0)??l.agenda?.week?.[u.weekday]??[],T=l.nativeSchedule?.days[u.weekday]??[];return(0,o.jsxs)("details",{className:`${n}-agenda-day`,open:u.isToday||void 0,children:[(0,o.jsxs)("summary",{children:[u.weekday," \xB7 ",u.dateLabel,u.isToday?" \xB7 Today":""]}),(0,o.jsxs)("div",{className:`${n}-agenda-compare`,"data-comparison":l.nativeSchedule?"true":void 0,children:[(0,o.jsxs)("section",{"aria-label":`${u.weekday} Villages agenda`,children:[(0,o.jsx)("h4",{children:"Villages agenda"}),(0,o.jsx)("ol",{className:`${n}-agenda-blocks`,children:p.map((z,q)=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("time",{children:[m1(z.startMinute),"\u2013",m1(z.endMinute)]}),(0,o.jsx)("strong",{children:z.activity}),(0,o.jsx)("span",{children:z.venueId?c2(i?.settings.venues??[],z.venueId):"Home"}),(0,o.jsx)("span",{children:z.reason}),(0,o.jsx)("span",{className:`${n}-story-scope`,children:z.status==="idle"?"Available":z.status==="dnd"?"Busy":z.status==="offline"?"Offline":"Online"})]},`${z.startMinute}-${z.endMinute}-${q}`))})]}),l.nativeSchedule?(0,o.jsxs)("section",{"aria-label":`${u.weekday} Marinara schedule`,children:[(0,o.jsx)("h4",{children:"Marinara schedule"}),T.length?(0,o.jsx)("ol",{className:`${n}-agenda-blocks`,children:T.map((z,q)=>(0,o.jsxs)("li",{children:[(0,o.jsx)("time",{children:z.time}),(0,o.jsx)("strong",{children:z.activity}),(0,o.jsx)("span",{className:`${n}-story-scope`,children:z.status||"No availability set"})]},`${z.time}-${q}`))}):(0,o.jsx)("p",{className:`${n}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${u.weekday}-${u.dateLabel}`)})})]})]},l.characterId))})]}):null,ga?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:ga}):null]})]});if(X==="preparing"){let l=i?.foundingPreparation,u=i?.villagers.length??0,p=l?.completedIds.length??0,T=i?.villagers.find(Ne=>Ne.characterId===l?.currentId)?.name,z=l?.stage==="reading"?"Reading the character card and native schedule":l?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":l?.stage==="resolving"?"Connecting to the System model":l?.stage==="model"?`Waiting for ${l.modelName||"the System model"} to write wishes, the week, and schedule mappings`:l?.stage==="applying"?"Expanding the week and applying native schedule times":l?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",q=l?.stageStartedAt?Date.parse(l.stageStartedAt):NaN,K=l?.status==="pending"&&Number.isFinite(q)?Math.max(0,Math.floor((Date.now()-q)/1e3)):null;return(0,o.jsx)("div",{className:`${n}-root ${n}-preparing`,role:"status","aria-live":"polite",children:(0,o.jsxs)("div",{children:[(0,o.jsx)("div",{className:`${n}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,o.jsxs)("h1",{children:[i?.village.name??"Your village"," is settling in"]}),(0,o.jsx)("p",{children:l?.status==="failed"?"The villagers need a hand before the gates open.":T?`Making room for ${T}\u2026`:"Lighting windows and making plans\u2026"}),(0,o.jsx)("p",{children:`${p} of ${u} villagers ready`}),l?.status==="pending"&&l.stage?(0,o.jsxs)("p",{children:[z,T?` for ${T}`:"","."]}):null,l?.attempt?(0,o.jsx)("p",{children:`Attempt ${l.attempt} of 3${K!==null?` \xB7 ${K}s in this stage`:""}`}):null,l?.stage==="resolving"||l?.stage==="model"||l?.stage==="applying"||l?.stage==="saving"?(0,o.jsx)("p",{children:`${l.loreEntryCount??0} relevant lorebook entries included`}):null,l?.status==="pending"&&l.error?(0,o.jsx)("p",{className:`${n}-hint`,children:`Previous attempt: ${l.error}`}):null,l?.status==="failed"?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:l.error}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{Fx()},children:"Retry this villager"}),(0,o.jsxs)("details",{children:[(0,o.jsx)("summary",{children:"Change connections"}),(0,o.jsx)(tg,{})]})]}):null,Eg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Eg}):null]})})}if(X==="setup"){let l=(d??[]).map(u=>({id:u.id,name:u.name}));return(0,o.jsx)("div",{className:`${n}-root ${n}-home ${n}-setup-root`,children:(0,o.jsxs)("div",{className:`${n}-home-body ${n}-setup-body`,"data-step":Fe,children:[(0,o.jsx)("aside",{className:`${n}-setup-rail`,"aria-label":"Founding progress",children:Wd.map((u,p)=>(0,o.jsxs)("div",{className:`${n}-setup-rail-step`,"data-active":p===Fe?"true":"false","data-done":p<Fe?"true":"false","aria-current":p===Fe?"step":void 0,children:[(0,o.jsx)("span",{className:`${n}-setup-rail-number`,children:p+1}),(0,o.jsx)("span",{children:u})]},u))}),(0,o.jsx)("div",{className:`${n}-side`,children:(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("div",{className:`${n}-overlay-head`,children:(0,o.jsx)("h2",{className:`${n}-panel-title`,children:i?.isFounded?"Setting the village up again":"Founding your village"})}),(0,o.jsxs)("p",{className:`${n}-setup-kicker`,children:["Step ",Fe+1," of ",Wd.length," \xB7 ",Wd[Fe]]}),Fe===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-name`,children:"What is this village called?"}),(0,o.jsx)("input",{id:`${n}-setup-name`,className:`${n}-search`,type:"text",value:gn,maxLength:i?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:J,onChange:u=>vg(u.target.value)})]}),(0,o.jsxs)("fieldset",{className:`${n}-field`,children:[(0,o.jsx)("legend",{className:`${n}-label`,children:"Choose a scenario"}),(0,o.jsx)("div",{className:`${n}-scenario-options`,children:ng.filter(u=>u.value!=="custom"||i?.isFounded&&jn==="custom").map(u=>(0,o.jsxs)("label",{className:`${n}-scenario-option`,children:[(0,o.jsx)("input",{type:"radio",name:`${n}-founding-scenario`,checked:jn===u.value,disabled:J||i?.isFounded,onChange:()=>Lx(u.value)}),(0,o.jsx)("span",{className:`${n}-scenario-icon`,"aria-hidden":"true",children:u.icon}),(0,o.jsx)("strong",{children:u.label}),(0,o.jsx)("small",{children:u.description})]},u.value))})]}),i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,Fe===1?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(L2,{personas:he,draft:I,onDraft:P,disabled:J}),(0,o.jsx)(tg,{onSetupProblem:Q1,onImageWarningChange:Rg,compact:!0}),J1?(0,o.jsxs)("div",{className:`${n}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,o.jsx)("p",{className:`${n}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,o.jsx)("p",{className:`${n}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,o.jsxs)("span",{className:`${n}-chat-confirm-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:Gx,children:"Set up an image connection"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:jx,children:"I understand, continue"})]})]}):null]}):null,Fe===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${n}-setup-setting`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:Jt,maxLength:i?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:J||pa,onChange:u=>{yg(u.target.value),jl([])}}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),i?.isFounded?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("strong",{children:"Day 1 record"}),(0,o.jsx)("p",{className:`${n}-hint`,children:i.settings.foundingDetails||"This village has no recorded first-day description."}),(0,o.jsx)("span",{className:`${n}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-founding-details`,children:"What happens on the village's first day?"}),(0,o.jsx)("textarea",{id:`${n}-founding-details`,className:`${n}-textarea ${n}-setup-beginning-textarea`,value:Ga,maxLength:i?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:J,onChange:u=>uu(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history."})]}),i?.isFounded?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-world-facts`,children:"Current world facts"}),(0,o.jsx)("textarea",{id:`${n}-world-facts`,className:`${n}-textarea`,value:Gn.join(`
`),disabled:J,placeholder:"One stable fact per line, up to four.",onChange:u=>$g(u.target.value.split(/\r?\n/u))}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,o.jsx)(k1,{books:lu,error:dg,selected:Bt,onChange:u=>{Bn(u),jl([])},disabled:J}),(0,o.jsxs)("details",{className:`${n}-field`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Advanced lore settings"}),(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${n}-setup-lore-budget`,className:`${n}-notice-input`,type:"number",min:i?.settings.loreTokenBudgetMin??200,max:i?.settings.loreTokenBudgetMax??3200,step:100,value:qr,disabled:J,onChange:u=>cg(Number(u.target.value))}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Fe===2&&i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"Replace the map and review venue pins in Village Settings \u2192 Village Map. Finish this setup to keep changes you made on earlier steps."}):null,Fe===2&&!i?.isFounded?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${n}-steps`,role:"group","aria-label":"Village map image source",children:[(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":it==="generate"?"true":"false","aria-pressed":it==="generate",disabled:pa,onClick:()=>ar("generate"),children:"Generate with AI"}),(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":it==="upload"?"true":"false","aria-pressed":it==="upload",disabled:pa,onClick:()=>ar("upload"),children:"Upload an image"}),(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":it==="none"?"true":"false","aria-pressed":it==="none",disabled:pa,onClick:()=>ar("none"),children:"No background image"}),i?.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:`${n}-step`,"data-clickable":"true","data-active":it==="existing"?"true":"false","aria-pressed":it==="existing",disabled:pa,onClick:()=>ar("existing"),children:"Keep current map"}):null]}),it==="generate"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Advanced map elements"}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,o.jsx)("div",{className:`${n}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([u,p])=>(0,o.jsxs)("label",{className:`${n}-label`,children:[p,(0,o.jsxs)("select",{className:`${n}-select`,value:Yl[u],disabled:pa,onChange:T=>Tg(z=>({...z,[u]:T.target.value})),children:[(0,o.jsx)("option",{value:"auto",children:"Auto"}),(0,o.jsx)("option",{value:"include",children:"Include"}),(0,o.jsx)("option",{value:"exclude",children:"Exclude"})]})]},u))})]}),(0,o.jsxs)("details",{className:`${n}-field ${n}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${n}-label`,children:"Testing prompt controls"}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-prompt`,children:[(0,o.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,o.jsx)("textarea",{id:`${n}-setup-map-prompt`,className:`${n}-textarea`,value:Yr,maxLength:1500,disabled:pa,onChange:u=>vu(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-map-negative`,children:[(0,o.jsx)("span",{className:`${n}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,o.jsx)("textarea",{id:`${n}-setup-map-negative`,className:`${n}-textarea`,value:Xr,maxLength:1500,disabled:pa,onChange:u=>yu(u.target.value)}),(0,o.jsx)("span",{className:`${n}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pa||Yr===i?.settings.townMapLayoutPrompt&&Xr===i?.settings.townMapNegativePrompt,onClick:()=>{vu(i?.settings.townMapLayoutPrompt??""),yu(i?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,o.jsx)("div",{className:`${n}-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:pa||Jt.trim().length===0,onClick:()=>{Rx()},children:pa?"Generating map\u2026":Xl==="generate"?"Generate again":"Generate map"})})]}):null,it==="upload"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:pa,"aria-label":"Choose a village map image",onChange:u=>{let p=u.target.files?.[0];u.target.value="",zx(p)}}),(0,o.jsx)("p",{className:`${n}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,it==="none"?(0,o.jsx)("p",{className:`${n}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image in Village Settings \u2192 Village Map later."}):null,vs&&it!=="none"&&Xl===it&&Ig?(0,o.jsx)("p",{className:`${n}-hint`,"data-tone":Kp(vs).tone,children:Kp(vs).text}):null]}):null,Fe===3&&i?.isFounded?(0,o.jsx)("p",{className:`${n}-hint`,children:"Existing Venues keep their locations. Use Village Settings \u2192 Village Map to reposition them with a replacement map, and View Venue to edit their details."}):null,Fe===3&&!i?.isFounded?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Place your home, one to three villager homes, and a Gathering Place. Choose who lives where. Villages will draft the place details for you to review."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||fn||wt.filter(u=>u.classes?.includes("residence")).length>=1+s,onClick:()=>{Ln(!0),Wi(!1),tr(null)},children:"Place a Residence"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||fn||wt.some(u=>u.category==="public-center"),onClick:()=>{Ln(!1),Wi(!0),tr(null)},children:"Place a Gathering Place"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||fn||wt.length===0,onClick:()=>{er([]),on(null),pi(null),tr(null),Ln(!1),Wi(!1)},children:"Reset all venues"})]}),kg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:kg}):null,(0,o.jsx)("div",{className:`${n}-setup-venue-list`,children:wt.map(u=>(0,o.jsxs)("button",{type:"button",className:`${n}-setup-venue-card`,"data-selected":u.id===fs?"true":"false",onClick:()=>on(u.id),children:[u.presentation.image?(0,o.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,o.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:u.name||"Unnamed venue"}),(0,o.jsxs)("small",{children:[u.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",u.occupancy.playerHome?"You":Pa(u.occupancy.residentCharacterId)||"Choose a villager"]})]})]},u.id))}),Le&&Vu?(0,o.jsxs)("div",{className:`${n}-setup-venue-editor`,children:[(0,o.jsxs)("h3",{className:`${n}-panel-title`,children:[Le.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",Le.name]}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{tr(Le.id),Ln(!1),Wi(!1)},children:"Move on map"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>Bx(Le.id),children:"Remove venue"})]}),(0,o.jsxs)("label",{className:`${n}-label`,children:["Name",(0,o.jsx)("input",{id:`${n}-setup-venue-name`,className:`${n}-notice-input`,value:Le.name,maxLength:100,onChange:u=>sr(Le.id,p=>({...p,name:u.target.value}))})]}),Le.category==="public-center"?(0,o.jsxs)("div",{className:`${n}-field`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||fn,onClick:()=>{Mx()},children:"Suggest three names"}),Y1.map(u=>(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>sr(Le.id,p=>({...p,name:u})),children:u},u))]}):null,(0,o.jsxs)("p",{className:`${n}-hint`,children:["Class: ",Rs==="gathering"?"Gathering":"Residence"]}),(0,o.jsxs)("div",{className:`${n}-setup-form-field`,children:[(0,o.jsx)("label",{className:`${n}-label`,htmlFor:`${n}-setup-form`,children:"Form"}),(0,o.jsx)("textarea",{id:`${n}-setup-form`,className:`${n}-textarea`,rows:2,value:Le.form??"",maxLength:240,placeholder:o2[Rs][X1],onFocus:()=>hu(!0),onBlur:()=>hu(!1),onChange:u=>{sr(Le.id,p=>({...p,form:u.target.value})),He("")}}),(0,o.jsx)("small",{className:`${n}-hint`,children:"What the Venue actually is"})]}),Le.category!=="public-center"?(0,o.jsxs)("label",{className:`${n}-label`,children:["Resident",(0,o.jsxs)("select",{className:`${n}-select`,value:Le.occupancy.residentCharacterId??"",disabled:Le.occupancy.playerHome,onChange:u=>sr(Le.id,p=>({...p,residentIds:u.target.value?[u.target.value]:[],occupancy:{...p.occupancy,residentCharacterId:u.target.value||null}})),children:[(0,o.jsx)("option",{value:"",children:Le.occupancy.playerHome?"You":"Choose a villager"}),l.map(u=>(0,o.jsx)("option",{value:u.id,disabled:wt.some(p=>p.id!==Le.id&&p.occupancy.residentCharacterId===u.id),children:u.name},u.id))]})]}):null,(0,o.jsx)("div",{className:`${n}-setup-place-spaces`,children:["exterior","interior"].map(u=>{let p=u==="exterior",T=p?"Exterior":"Interior",z=p?Le.presentation.image:Vu.image;return(0,o.jsxs)("section",{className:`${n}-setup-place-space`,children:[(0,o.jsx)("h4",{children:T}),(0,o.jsxs)("label",{className:`${n}-label`,htmlFor:`${n}-setup-${u}-description`,children:[T," Description \xB7 required"]}),(0,o.jsx)("textarea",{id:`${n}-setup-${u}-description`,className:`${n}-textarea`,value:p?Le.description:Vu.description,maxLength:1e3,onChange:q=>{let K=q.target.value;sr(Le.id,Ne=>p?{...Ne,description:K}:{...Ne,spaces:[{...da(Ne,Rs),description:K}]}),He(""),pi(null)}}),(0,o.jsxs)("span",{className:`${n}-label`,children:[T," Image \xB7 optional"]}),z?(0,o.jsx)("img",{className:`${n}-setup-image-preview`,src:z.url,alt:`${u} of ${Le.name}`}):(0,o.jsx)("p",{className:`${n}-hint`,children:"No image yet. A placeholder will be used."}),(0,o.jsxs)("div",{className:`${n}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:fn,onClick:()=>{Xx(Le,u)},children:z?`Regenerate ${T} Image`:`Generate ${T} Image`}),(0,o.jsx)("input",{className:`${n}-file`,type:"file",accept:"image/*",disabled:fn,"aria-label":`Upload ${u} image for ${Le.name}`,onChange:q=>{let K=q.target.files?.[0];q.target.value="",Px(Le,u,K)}}),z?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>sr(Le.id,q=>p?{...q,presentation:{...q.presentation,image:null}}:{...q,spaces:[{...da(q,Rs),image:null}]}),children:"Remove image"}):null]}),bs?.venueId===Le.id&&bs.area===u?(0,o.jsxs)("div",{className:`${n}-overlay`,children:[(0,o.jsx)("img",{className:`${n}-setup-image-preview`,src:bs.image.url,alt:`New ${u} image preview`}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:Zx,children:"Use this image"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>pi(null),children:"Discard"})]}):null]},u)})})]}):(0,o.jsx)("p",{className:`${n}-hint`,children:"Place or select a venue to edit it."}),d===null?(0,o.jsx)("p",{className:`${n}-hint`,children:"Reading your villager library\u2026"}):null]}):null,Fe===4?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${n}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Village Beginning"}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:gn.trim()})," \xB7 ",Jt.trim()]}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Persona:"})," ",he?.find(u=>u.id===I)?.name??"Selected Persona"," \xB7 ",(0,o.jsx)("strong",{children:"Scenario:"})," ",Hr(jn).label]}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Day 1:"})," ",Ga||"No first-day description was recorded."]}),gs?(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Original founding direction:"})," ",gs]}):null]}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Map and lore"}),(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsx)("strong",{children:"Map:"})," ",it==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,o.jsx)("strong",{children:"Lorebooks:"})," ",Bt.map(u=>lu?.find(p=>p.id===u)?.name??u).join(", ")||"None"]})]}),(0,o.jsxs)("section",{className:`${n}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Starting places"}),(0,o.jsx)("div",{className:`${n}-setup-venue-list`,children:wt.map(u=>(0,o.jsxs)("div",{className:`${n}-setup-venue-card`,children:[u.presentation.image?(0,o.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,o.jsx)("span",{className:`${n}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,o.jsxs)("span",{children:[(0,o.jsxs)("strong",{children:[u.name," \xB7 ",u.category==="public-center"?"Gathering Place":"Residence"]}),(0,o.jsxs)("small",{children:[u.form," \xB7"," ",u.occupancy.playerHome?"You":Pa(u.occupancy.residentCharacterId)||"Community"]})]})]},u.id))}),wt.map(u=>(0,o.jsxs)("p",{className:`${n}-hint`,children:[(0,o.jsxs)("strong",{children:[u.name,":"]})," ",u.description," ",u.spaces?.[0]?.description]},`${u.id}-summary`))]})]}):null,Mg?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:Mg}):null,ga?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:ga}):null]})}),(0,o.jsxs)("div",{className:`${n}-setup-visual`,children:[Fe<=1?(0,o.jsx)(U2,{scenario:jn}):(0,o.jsx)("div",{className:`${n}-setup-map-shell`,children:(0,o.jsx)("div",{className:`${n}-setup-map-viewport`,children:(0,o.jsx)(eg,{src:nr,alt:`A map of ${gn.trim()||"your new village"}.`,pins:Fe<3?[]:i$,placing:Fe===3&&!i?.isFounded&&(cu||Ul||mu!==null),view:it==="existing"?Jr:Il("cover"),shape:Ig,onPlace:Fe===3&&!i?.isFounded?qx:void 0,compact:Fe<2,mobile:t&&Fe>=2,photoPins:Fe>=3})})}),(0,o.jsxs)("nav",{className:`${n}-setup-footer`,"aria-label":"Founding navigation",children:[Fe>0?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J||pa||fn,onClick:()=>Fg(Fe-1),children:"\u2190 Back"}):null,Fe<Wd.length-1?(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:J||pa||fn,onClick:()=>Fg(Fe+1),children:"Next \u2192"}):(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-setup-forward`,disabled:J||pa||!i,onClick:()=>{Qx()},children:i?.isFounded?"Save this village":"Found the village"}),i?.isFounded?(0,o.jsx)("button",{type:"button",className:`${n}-button`,disabled:J,onClick:()=>{Ln(!1),Y("home")},children:"Show me the village"}):null]})]})]})})}return(0,o.jsxs)("div",{className:`${n}-root ${n}-home ${n}-home-full`,"data-mobile":t?"true":"false",children:[(0,o.jsxs)("div",{className:`${n}-home-bar`,children:[(0,o.jsx)(E2,{weather:i?.village.weather??""}),!t&&i?.isFounded&&ls(i.settings.venues).length>0?(0,o.jsxs)("div",{className:`${n}-places-picker`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-button`,"aria-expanded":Yt,"aria-controls":`${n}-places-list`,disabled:J,onClick:()=>{B(null),De(l=>!l)},children:"Places"}),Yt?(0,o.jsx)("div",{id:`${n}-places-list`,className:`${n}-places-list`,children:i.settings.venues.map(l=>(0,o.jsxs)("div",{className:`${n}-places-list-row`,children:[(0,o.jsx)("span",{className:`${n}-places-list-name`,children:l.name}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>zu(l),children:"View venue"}),(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{ic(l)},children:"Visit"})]},l.id))}):null]}):null,(0,o.jsxs)("span",{className:`${n}-home-bar-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${n}-mobile-board-button`,"aria-label":`Noticeboard (${i?.noticeboard.length??0})`,disabled:!i||J,onClick:()=>Ot("noticeboard"),children:(0,o.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),i?.isFounded?(0,o.jsx)(M2,{happenings:i.happenings,recap:i.recap,mobile:t}):null,(0,o.jsx)("button",{type:"button",className:`${n}-button ${n}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:J||!i,onClick:()=>{zt("index"),Y("menu")},children:"\u2630"}),t?null:(0,o.jsx)(R2,{}),Ze?(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:()=>{_e("")},children:"Cancel placement"}):null]})]}),(0,o.jsx)("div",{className:`${n}-room`,children:(0,o.jsx)("div",{className:`${n}-home-map-viewport`,children:(0,o.jsx)(eg,{src:Pr||null,alt:`A map of ${i?.village.name??"the village"}.`,pins:n$,placing:!!Ze,view:Jr,shape:Vg,onPlace:(l,u)=>{if(!Ze)return;let p=Ze;ue(!0),mt(""),L(`/projects/${encodeURIComponent(p)}/place`,{method:"POST",body:JSON.stringify({x:l,y:u})}).then(T=>{r(T),_e(""),$e(p),Ot("projects")}).catch(T=>mt(Q(T,"The blueprint could not be placed here."))).finally(()=>ue(!1))},onDismiss:()=>{B(null),De(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:gi||ga||Eu||Tu?(0,o.jsxs)("div",{className:`${n}-notice`,children:[gi?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:gi}):null,ga?(0,o.jsx)("p",{className:`${n}-error`,role:"alert",children:ga}):null,Eu?(0,o.jsxs)("span",{className:`${n}-status`,children:["Catching up on what ",i?.village.name??"the village"," has been doing\u2026"]}):null,Tu?(0,o.jsx)("p",{className:`${n}-status`,children:Tu}):null]}):null})})})]})}var og=class extends HTMLElement{connectedCallback(){rg(),this.__root??(this.__root=(0,A1.createRoot)(this)),this.__root.render((0,o.jsx)(ig,{element:this,children:(0,o.jsx)(ak,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),rg()})}};function ak({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let i=()=>t(r=>r+1);return e.addEventListener("marinara-capability-props",i),()=>e.removeEventListener("marinara-capability-props",i)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,o.jsx)(ok,{props:e.capabilityProps??{}}):a==="toolbar"?(0,o.jsx)(rk,{props:e.capabilityProps??{}}):(0,o.jsx)(tk,{element:e})}function nk(){return(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,o.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,o.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,o.jsx)("path",{d:"M9.5 16.5h5"})]})}var ik="marinara-active-chat-id";function D1(){try{window.localStorage.removeItem(ik)}catch{}window.location.reload()}function _1(e,t){let[a,i]=(0,m.useState)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(s(!1),i(null),!t)return;let c=new AbortController;return(async()=>{try{let d=await L(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;i(d??null),s(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:r}}function rk({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",i=e.mobileCompact===!0,r=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:s,known:c}=_1(t,a&&t.length>0),[d,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!d)return;let v=M=>{g.current?.contains(M.target)||h(!1)},V=M=>{M.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",v),document.addEventListener("keydown",V),()=>{document.removeEventListener("pointerdown",v),document.removeEventListener("keydown",V)}},[d]),!a||!c||s===null)return null;let b=s.name||"your villager",N=s.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${N}`;return(0,o.jsxs)("span",{className:`${n}-tracker`,"data-compact":i,"data-open":d,ref:g,children:[(0,o.jsxs)("button",{type:"button",className:r?`${r} ${n}-tracker-chip`:`${n}-button ${n}-tracker-chip`,onClick:()=>h(v=>!v),"aria-haspopup":"menu","aria-expanded":d,title:f,"aria-label":f,children:[(0,o.jsx)(nk,{}),(0,o.jsx)("span",{className:`${n}-tracker-label`,children:"Villages"})]}),d?(0,o.jsxs)("div",{className:`${n}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${N}`,children:[(0,o.jsxs)("p",{className:`${n}-tracker-menu-title`,children:["This roleplay spun off from ",N]}),s.resident?(0,o.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[b," still lives there. ",N," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,o.jsxs)("p",{className:`${n}-tracker-menu-note`,children:[b," does not live in ",N," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,o.jsx)("div",{className:`${n}-tracker-menu-row`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:D1,title:`Leaves this chat and opens Marinara's home screen, where the ${N} tab is waiting.`,children:"Open the village"})})]}):null]})}function ok({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:i,known:r}=_1(t,a&&t.length>0);if(!a||!r)return null;if(i===null)return(0,o.jsx)("div",{className:`${n}-panel-view`,children:(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let s=i.name||"this villager",c=i.villageName||"your village";return(0,o.jsxs)("div",{className:`${n}-panel-view`,children:[(0,o.jsx)("p",{className:`${n}-tracker-menu-note`,children:i.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${s} does not live there any more. Nothing said here is read by the village either way.`}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Villager"}),(0,o.jsx)("span",{children:s})]}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Chat"}),(0,o.jsx)("span",{children:i.room})]}),(0,o.jsxs)("div",{className:`${n}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${n}-panel-view-key`,children:"Came from"}),(0,o.jsx)("span",{children:c})]}),(0,o.jsx)("div",{className:`${n}-panel-view-actions`,children:(0,o.jsx)("button",{type:"button",className:`${n}-button`,onClick:D1,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(n)||customElements.define(n,og);
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
