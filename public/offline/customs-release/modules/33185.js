wwplayer.define(["module","BaseModule","jquery","globals","underscore","apiService","pubsub"],function(e,t,o,r,n,a,i){"use strict";function u(e){return e&&e.__esModule?e:{default:e}}function f(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function c(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function l(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var s=u(t),d=(u(o),u(r)),p=(u(n),u(a)),b=u(i),h=function(){function e(e,t){for(var o=0;o<t.length;o++){var r=t[o];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,o,r){return o&&e(t.prototype,o),r&&e(t,r),t}}(),v=void 0;e.exports=function(e){function t(e){f(this,t);var o=c(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return v=o,b.default.subscribe("getGiftData",function(){b.default.publish("giftData",v.giftSheetData)}),v.getData(),o}return l(t,e),h(t,[{key:"preloadVideo",value:function(){v.VideoPreload=document.createElement("video"),d.default.IS_DESKTOP?v.VideoPreload.src="public/offline/80E87A/wirewax-videos/vidData/8116764/8116764_4k.mp4":v.VideoPreload.src="public/offline/80E87A/wirewax-videos/vidData/8116764/8116764_1080.mp4"}},{key:"getData",value:function(){var e=this;p.default.getSheetDataCdn("1jO1N2ND1GZWBETyEnrSpbKjnHtpkhIrDxgEtv8jQx4M",function(t){e.giftSheetData=t,b.default.publish("giftData",e.giftSheetData)},function(){console.error("get main data failed!")})}}]),t}(s.default)});