wwplayer.define(["jquery","AbstractPlayer","pubsub","globals","modernizr","LogEvent"],function(e,i,n,r,t,a){"use strict";var o;return i.extend({init:function(i,n,r,t,a,u){o=this,this._super(i,n,r,t,a,u),e("html").css("overflow","hidden"),o.playerReady=!0,o.isPlaying=!1,o.currentTime=0;var d=e(i).attr("data-vidid");o.vidId=d,window.wirewax.vidOverride&&(d=window.wirewax.vidOverride),e(i).append('<div id="wireWaxVideoContainer"><div class="poster-frame"></div><div id="wireWaxVideo"></div></div>');var s=o.cdnURL+"vidData/"+d+"/"+d+"_still.jpg";window.wirewax.posterUrl&&(s=window.wirewax.posterUrl),window.wirewax.blackPoster&&(s="public/offline/creativeData/pureblack.jpg"),e("#video-container .poster-frame").css({"background-image":"url('"+s+"')"}),o.videoElement=e("#wireWaxVideoContainer")[0],window.setTimeout(function(){t(o.videoElement,o)},10),window.setInterval(function(){o.isPlaying&&(o.currentTime=o.currentTime+.1,o.currentTime>o.videoData.duration&&(o.onEnd(),o.isPlaying=!1))},1e3/30)},getVolume:function(){return r.VOLUME},setVolume:function(e){this._super(e)},play:function(){e("#video-container .poster-frame").hide(),o.isPlaying=!0,this._super()},pause:function(){o.isPlaying=!1,this._super()},seeking:function(){return!1},seekToFrame:function(e){o.setCurrentTime("junk",parseFloat(e/o.videoData.fps)+1e-4)},getFrame:function(){return Math.floor((o.currentTime+1e-4)*o.videoData.fps)+1},setFrame:function(e){var i=e-25,n=o.videoData.fps*(i-1)+1e-4;o.setCurrentTime("junk",n)},frameBack:function(){},frameForward:function(){},getCurrentTime:function(e){return o.currentTime},setCurrentTime:function(e,i){o.currentTime=i},getBuffered:function(){return o.playerReady?o.videoData.duration:0},playing:function(){return o.isPlaying},paused:function(){return!!o.playerReady&&!o.isPlaying},playPause:function(){o.isPlaying?o.pause():o.play(),this._super()},getReadyState:function(){return o.playerReady?4:0},onError:function(e){},initialise:function(){o.mainLoop(),this._super(),e("#video-container #loader").remove()}})});