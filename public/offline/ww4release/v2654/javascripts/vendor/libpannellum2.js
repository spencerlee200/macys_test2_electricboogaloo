window.libpannellum2=function(e,t,r){"use strict";function a(a){function n(e,t){return 1==e.level&&1!=t.level?-1:1==t.level&&1!=e.level?1:t.timestamp-e.timestamp}function d(e,t){return e.level!=t.level?e.level-t.level:e.diff-t.diff}function l(){if(!P.drawInProgress){P.drawInProgress=!0;for(var e=0;e<P.currentNodes.length;e++)P.currentNodes[e].textureLoaded&&(U.bindBuffer(U.ARRAY_BUFFER,O),U.bufferData(U.ARRAY_BUFFER,new Float32Array(P.currentNodes[e].vertices),U.STATIC_DRAW),U.vertexAttribPointer(P.vertPosLocation,3,U.FLOAT,!1,0,0),U.bindBuffer(U.ARRAY_BUFFER,W),U.vertexAttribPointer(P.texCoordLocation,2,U.FLOAT,!1,0,0),U.bindTexture(U.TEXTURE_2D,P.currentNodes[e].texture),U.drawElements(U.TRIANGLES,6,U.UNSIGNED_SHORT,0));P.drawInProgress=!1}}function c(e,t,r,a,o,i){this.vertices=e,this.side=t,this.level=r,this.x=a,this.y=o,this.path=i.replace("%s",t).replace("%l",r).replace("%x",a).replace("%y",o)}function f(e,t,r,a,o){if(b(e,t.vertices)){var i=t.vertices,n=i[0]+i[3]+i[6]+i[9],h=i[1]+i[4]+i[7]+i[10],s=i[2]+i[5]+i[8]+i[11],u=Math.sqrt(n*n+h*h+s*s),d=Math.asin(s/u),l=Math.atan2(h,n),g=l-a;g+=g>Math.PI?-2*Math.PI:g<-Math.PI?2*Math.PI:0,g=Math.abs(g),t.diff=Math.acos(Math.sin(r)*Math.sin(d)+Math.cos(r)*Math.cos(d)*Math.cos(g));for(var m=!1,_=0;_<P.nodeCache.length;_++)if(P.nodeCache[_].path==t.path){m=!0,P.nodeCache[_].timestamp=P.nodeCacheTimestamp++,P.nodeCache[_].diff=t.diff,P.currentNodes.push(P.nodeCache[_]);break}if(m||(t.timestamp=P.nodeCacheTimestamp++,P.currentNodes.push(t),P.nodeCache.push(t)),t.level<P.level){var v=G.cubeResolution*Math.pow(2,t.level-G.maxLevel),x=Math.ceil(v*G.invTileResolution)-1,p=v%G.tileResolution*2,E=2*v%G.tileResolution;0===E&&(E=G.tileResolution),0===p&&(p=2*G.tileResolution);var R=.5;t.x!=x&&t.y!=x||(R=1-G.tileResolution/(G.tileResolution+E));var T,M,w=1-R,A=[],C=R,I=R,U=R,B=w,L=w,y=w;E<G.tileResolution&&(t.x==x&&t.y!=x?(I=.5,L=.5,"d"!=t.side&&"u"!=t.side||(U=.5,y=.5)):t.x!=x&&t.y==x&&(C=.5,B=.5,"l"!=t.side&&"r"!=t.side||(U=.5,y=.5))),p<=G.tileResolution&&(t.x==x&&(C=0,B=1,"l"!=t.side&&"r"!=t.side||(U=0,y=1)),t.y==x&&(I=0,L=1,"d"!=t.side&&"u"!=t.side||(U=0,y=1))),T=[i[0],i[1],i[2],i[0]*C+i[3]*B,i[1]*R+i[4]*w,i[2]*U+i[5]*y,i[0]*C+i[6]*B,i[1]*I+i[7]*L,i[2]*U+i[8]*y,i[0]*R+i[9]*w,i[1]*I+i[10]*L,i[2]*U+i[11]*y],M=new c(T,t.side,t.level+1,2*t.x,2*t.y,G.fullpath),A.push(M),t.x==x&&p<=G.tileResolution||(T=[i[0]*C+i[3]*B,i[1]*R+i[4]*w,i[2]*U+i[5]*y,i[3],i[4],i[5],i[3]*R+i[6]*w,i[4]*I+i[7]*L,i[5]*U+i[8]*y,i[0]*C+i[6]*B,i[1]*I+i[7]*L,i[2]*U+i[8]*y],M=new c(T,t.side,t.level+1,2*t.x+1,2*t.y,G.fullpath),A.push(M)),t.x==x&&p<=G.tileResolution||t.y==x&&p<=G.tileResolution||(T=[i[0]*C+i[6]*B,i[1]*I+i[7]*L,i[2]*U+i[8]*y,i[3]*R+i[6]*w,i[4]*I+i[7]*L,i[5]*U+i[8]*y,i[6],i[7],i[8],i[9]*C+i[6]*B,i[10]*R+i[7]*w,i[11]*U+i[8]*y],M=new c(T,t.side,t.level+1,2*t.x+1,2*t.y+1,G.fullpath),A.push(M)),t.y==x&&p<=G.tileResolution||(T=[i[0]*R+i[9]*w,i[1]*I+i[10]*L,i[2]*U+i[11]*y,i[0]*C+i[6]*B,i[1]*I+i[7]*L,i[2]*U+i[8]*y,i[9]*C+i[6]*B,i[10]*R+i[7]*w,i[11]*U+i[8]*y,i[9],i[10],i[11]],M=new c(T,t.side,t.level+1,2*t.x,2*t.y+1,G.fullpath),A.push(M));for(var N=0;N<A.length;N++)f(e,A[N],r,a,o)}}}function g(){return[-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,1,1,-1,1,1,1,1,-1,1,1,-1,-1]}function m(){return[1,0,0,0,1,0,0,0,1]}function _(e,t,r){var a=Math.sin(t),o=Math.cos(t);return"x"==r?[e[0],o*e[1]+a*e[2],o*e[2]-a*e[1],e[3],o*e[4]+a*e[5],o*e[5]-a*e[4],e[6],o*e[7]+a*e[8],o*e[8]-a*e[7]]:"y"==r?[o*e[0]-a*e[2],e[1],o*e[2]+a*e[0],o*e[3]-a*e[5],e[4],o*e[5]+a*e[3],o*e[6]-a*e[8],e[7],o*e[8]+a*e[6]]:"z"==r?[o*e[0]+a*e[1],o*e[1]-a*e[0],e[2],o*e[3]+a*e[4],o*e[4]-a*e[3],e[5],o*e[6]+a*e[7],o*e[7]-a*e[6],e[8]]:void 0}function v(e){return[e[0],e[1],e[2],0,e[3],e[4],e[5],0,e[6],e[7],e[8],0,0,0,0,1]}function x(e){return[e[0],e[4],e[8],e[12],e[1],e[5],e[9],e[13],e[2],e[6],e[10],e[14],e[3],e[7],e[11],e[15]]}function p(e,t,r,a){var o=2*Math.atan(Math.tan(e/2)*U.drawingBufferHeight/U.drawingBufferWidth),i=1/Math.tan(o/2);return[i/t,0,0,0,0,i,0,0,0,0,(a+r)/(r-a),2*a*r/(r-a),0,0,-1,0]}function E(e,t){U.bindTexture(U.TEXTURE_2D,t),U.texImage2D(U.TEXTURE_2D,0,U.RGB,U.RGB,U.UNSIGNED_BYTE,e),U.texParameteri(U.TEXTURE_2D,U.TEXTURE_MAG_FILTER,U.LINEAR),U.texParameteri(U.TEXTURE_2D,U.TEXTURE_MIN_FILTER,U.LINEAR),U.texParameteri(U.TEXTURE_2D,U.TEXTURE_WRAP_S,U.CLAMP_TO_EDGE),U.texParameteri(U.TEXTURE_2D,U.TEXTURE_WRAP_T,U.CLAMP_TO_EDGE),U.bindTexture(U.TEXTURE_2D,null)}function R(e){e.textureLoad||(e.textureLoad=!0,V(encodeURI(e.path+"."+G.extension),function(t){e.texture=t,e.textureLoaded=!0},z.crossOrigin))}function T(e){for(var t=1;t<G.maxLevel&&U.drawingBufferWidth>G.tileResolution*Math.pow(2,t-1)*Math.tan(e/2)*.707;)t++;P.level=t}function M(e,t){return[e[0]*t[0],e[0]*t[1],e[0]*t[2],0,e[5]*t[4],e[5]*t[5],e[5]*t[6],0,e[10]*t[8],e[10]*t[9],e[10]*t[10],e[11],-t[8],-t[9],-t[10],0]}function w(e,t){return[e[0]*t[0]+e[1]*t[1]+e[2]*t[2],e[4]*t[0]+e[5]*t[1]+e[6]*t[2],e[11]+e[8]*t[0]+e[9]*t[1]+e[10]*t[2],1/(e[12]*t[0]+e[13]*t[1]+e[14]*t[2])]}function A(e,t){var r=w(e,t),a=r[0]*r[3],o=r[1]*r[3],i=r[2]*r[3],n=[0,0,0];return a<-1&&(n[0]=-1),a>1&&(n[0]=1),o<-1&&(n[1]=-1),o>1&&(n[1]=1),(i<-1||i>1)&&(n[2]=1),n}function b(e,t){var r=A(e,t.slice(0,3)),a=A(e,t.slice(3,6)),o=A(e,t.slice(6,9)),i=A(e,t.slice(9,12)),n=r[0]+a[0]+o[0]+i[0];if(-4==n||4==n)return!1;var h=r[1]+a[1]+o[1]+i[1];return-4!=h&&4!=h&&4!=r[2]+a[2]+o[2]+i[2]}function C(){console.log("Reducing canvas size due to error 1286!"),I.width=Math.round(I.width/2),I.height=Math.round(I.height/2)}var I=t.createElement("canvas");I.style.width=I.style.height="100%",a.appendChild(I);var P,U,B,L,y,N,S,D,G,F,X,Y,O,W,k,z;this.init=function(e,n,d,l,c,f,m,_){if(n===r&&(n="equirectangular"),"equirectangular"!=n&&"cubemap"!=n&&"multires"!=n)throw console.log("Error: invalid image type specified!"),{type:"config error"};if(F=n,G=e,X=d,z=_||{},P){if(B&&(U.detachShader(P,B),U.deleteShader(B)),L&&(U.detachShader(P,L),U.deleteShader(L)),U.bindBuffer(U.ARRAY_BUFFER,null),U.bindBuffer(U.ELEMENT_ARRAY_BUFFER,null),P.texture&&U.deleteTexture(P.texture),P.nodeCache)for(var v=0;v<P.nodeCache.length;v++)U.deleteTexture(P.nodeCache[v].texture);U.deleteProgram(P),P=r}D=r;var x;if("cubemap"!=F||0==(G[0].width&G[0].width-1)||!(navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 8_/)||navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 9_/)||navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 10_/)||navigator.userAgent.match(/Trident.*rv[ :]*11\./))){if(!U){var p=navigator.userAgent.search("Safari")>=0&&navigator.userAgent.substring(navigator.userAgent.indexOf("Version/")+8,navigator.userAgent.indexOf("Version/")+8+2);U=navigator.userAgent.indexOf("iPhone")>0&&p>=12?I.getContext("webgl2",{alpha:!1,depth:!1}):I.getContext("webgl",{alpha:!1,depth:!1})}U&&1286==U.getError()&&C()}if(!U&&("multires"==F&&G.hasOwnProperty("fallbackPath")||"cubemap"==F)&&("WebkitAppearance"in t.documentElement.style||navigator.userAgent.match(/Trident.*rv[ :]*11\./)||-1!==navigator.appVersion.indexOf("MSIE 10"))){N&&a.removeChild(N),N=t.createElement("div"),N.className="pnlm-world";var E;E=G.basePath?G.basePath+G.fallbackPath:G.fallbackPath;var R=["f","r","b","l","u","d"],T=0,M=function(){var e=t.createElement("canvas");e.className="pnlm-face pnlm-"+R[this.side]+"face",N.appendChild(e);var r=e.getContext("2d");e.style.width=this.width+4+"px",e.style.height=this.height+4+"px",e.width=this.width+4,e.height=this.height+4,r.drawImage(this,2,2);var o,i,n=r.getImageData(0,0,e.width,e.height),h=n.data;for(o=2;o<e.width-2;o++)for(i=0;i<4;i++)h[4*(o+e.width)+i]=h[4*(o+2*e.width)+i],h[4*(o+e.width*(e.height-2))+i]=h[4*(o+e.width*(e.height-3))+i];for(o=2;o<e.height-2;o++)for(i=0;i<4;i++)h[4*(o*e.width+1)+i]=h[4*(o*e.width+2)+i],h[4*((o+1)*e.width-2)+i]=h[4*((o+1)*e.width-3)+i];for(i=0;i<4;i++)h[4*(e.width+1)+i]=h[4*(2*e.width+2)+i],h[4*(2*e.width-2)+i]=h[4*(3*e.width-3)+i],h[4*(e.width*(e.height-2)+1)+i]=h[4*(e.width*(e.height-3)+2)+i],h[4*(e.width*(e.height-1)-2)+i]=h[4*(e.width*(e.height-2)-3)+i];for(o=1;o<e.width-1;o++)for(i=0;i<4;i++)h[4*o+i]=h[4*(o+e.width)+i],h[4*(o+e.width*(e.height-1))+i]=h[4*(o+e.width*(e.height-2))+i];for(o=1;o<e.height-1;o++)for(i=0;i<4;i++)h[o*e.width*4+i]=h[4*(o*e.width+1)+i],h[4*((o+1)*e.width-1)+i]=h[4*((o+1)*e.width-2)+i];for(i=0;i<4;i++)h[i]=h[4*(e.width+1)+i],h[4*(e.width-1)+i]=h[4*(2*e.width-2)+i],h[e.width*(e.height-1)*4+i]=h[4*(e.width*(e.height-2)+1)+i],h[4*(e.width*e.height-1)+i]=h[4*(e.width*(e.height-1)-2)+i];r.putImageData(n,0,0),6==++T&&(y=this.width,a.appendChild(N),m())};for(x=0;x<6;x++){var w=new Image;w.crossOrigin=z.crossOrigin?z.crossOrigin:"anonymous",w.side=x,w.onload=M,w.src="multires"==F?encodeURI(E.replace("%s",R[x])+"."+G.extension):encodeURI(G[x].src)}}else{if(!U)throw console.log("Error: no WebGL support detected!"),{type:"no webgl"};G.basePath?G.fullpath=G.basePath+G.path:G.fullpath=G.path,G.invTileResolution=1/G.tileResolution;var A=g();for(S=[],x=0;x<6;x++)S[x]=A.slice(12*x,12*x+12),A=g();var b,V;if("equirectangular"==F){if(b=Math.max(G.width,G.height),V=U.getParameter(U.MAX_TEXTURE_SIZE),b>V)throw console.log("Error: The image is too big; it's "+b+"px wide, but this device's maximum supported width is "+V+"px."),{type:"webgl size error",width:b,maxWidth:V}}else if("cubemap"==F&&(b=G[0].width,V=U.getParameter(U.MAX_CUBE_MAP_TEXTURE_SIZE),b>V))throw console.log("Error: The cube face image is too big; it's "+b+"px wide, but this device's maximum supported width is "+V+"px."),{type:"webgl size error",width:b,maxWidth:V};_===r||_.horizonPitch===r&&_.horizonRoll===r||(D=[_.horizonPitch==r?0:_.horizonPitch,_.horizonRoll==r?0:_.horizonRoll]);var H=U.TEXTURE_2D;U.viewport(0,0,U.drawingBufferWidth,U.drawingBufferHeight),B=U.createShader(U.VERTEX_SHADER);var q=o;"multires"==F&&(q=i),U.shaderSource(B,q),U.compileShader(B),L=U.createShader(U.FRAGMENT_SHADER);var j=s;if("cubemap"==F?(H=U.TEXTURE_CUBE_MAP,j=h):"multires"==F&&(j=u),U.shaderSource(L,j),U.compileShader(L),P=U.createProgram(),U.attachShader(P,B),U.attachShader(P,L),U.linkProgram(P),U.getShaderParameter(B,U.COMPILE_STATUS)||console.log(U.getShaderInfoLog(B)),U.getShaderParameter(L,U.COMPILE_STATUS)||console.log(U.getShaderInfoLog(L)),U.getProgramParameter(P,U.LINK_STATUS)||console.log(U.getProgramInfoLog(P)),U.useProgram(P),P.drawInProgress=!1,P.texCoordLocation=U.getAttribLocation(P,"a_texCoord"),U.enableVertexAttribArray(P.texCoordLocation),"multires"!=F){if(Y||(Y=U.createBuffer()),U.bindBuffer(U.ARRAY_BUFFER,Y),U.bufferData(U.ARRAY_BUFFER,new Float32Array([-1,1,1,1,1,-1,-1,1,1,-1,-1,-1]),U.STATIC_DRAW),U.vertexAttribPointer(P.texCoordLocation,2,U.FLOAT,!1,0,0),P.aspectRatio=U.getUniformLocation(P,"u_aspectRatio"),U.uniform1f(P.aspectRatio,U.drawingBufferWidth/U.drawingBufferHeight),P.psi=U.getUniformLocation(P,"u_psi"),P.theta=U.getUniformLocation(P,"u_theta"),P.f=U.getUniformLocation(P,"u_f"),P.h=U.getUniformLocation(P,"u_h"),P.v=U.getUniformLocation(P,"u_v"),P.vo=U.getUniformLocation(P,"u_vo"),P.rot=U.getUniformLocation(P,"u_rot"),U.uniform1f(P.h,l/(2*Math.PI)),U.uniform1f(P.v,c/Math.PI),U.uniform1f(P.vo,f/Math.PI*2),"equirectangular"==F){P.backgroundColor=U.getUniformLocation(P,"u_backgroundColor");var Z=_.backgroundColor?_.backgroundColor:[0,0,0];U.uniform4fv(P.backgroundColor,Z.concat([1]))}P.texture=U.createTexture(),U.bindTexture(H,P.texture),"cubemap"==F?(U.texImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X,0,U.RGB,U.RGB,U.UNSIGNED_BYTE,G[1]),U.texImage2D(U.TEXTURE_CUBE_MAP_NEGATIVE_X,0,U.RGB,U.RGB,U.UNSIGNED_BYTE,G[3]),U.texImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_Y,0,U.RGB,U.RGB,U.UNSIGNED_BYTE,G[4]),U.texImage2D(U.TEXTURE_CUBE_MAP_NEGATIVE_Y,0,U.RGB,U.RGB,U.UNSIGNED_BYTE,G[5]),U.texImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_Z,0,U.RGB,U.RGB,U.UNSIGNED_BYTE,G[0]),U.texImage2D(U.TEXTURE_CUBE_MAP_NEGATIVE_Z,0,U.RGB,U.RGB,U.UNSIGNED_BYTE,G[2])):U.texImage2D(H,0,U.RGB,U.RGB,U.UNSIGNED_BYTE,G),U.texParameteri(H,U.TEXTURE_WRAP_S,U.CLAMP_TO_EDGE),U.texParameteri(H,U.TEXTURE_WRAP_T,U.CLAMP_TO_EDGE),U.texParameteri(H,U.TEXTURE_MIN_FILTER,U.LINEAR),U.texParameteri(H,U.TEXTURE_MAG_FILTER,U.LINEAR)}else P.vertPosLocation=U.getAttribLocation(P,"a_vertCoord"),U.enableVertexAttribArray(P.vertPosLocation),O||(O=U.createBuffer()),W||(W=U.createBuffer()),k||(k=U.createBuffer()),U.bindBuffer(U.ARRAY_BUFFER,W),U.bufferData(U.ARRAY_BUFFER,new Float32Array([0,0,1,0,1,1,0,1]),U.STATIC_DRAW),U.bindBuffer(U.ELEMENT_ARRAY_BUFFER,k),U.bufferData(U.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),U.STATIC_DRAW),P.perspUniform=U.getUniformLocation(P,"u_perspMatrix"),P.cubeUniform=U.getUniformLocation(P,"u_cubeMatrix"),P.level=-1,P.currentNodes=[],P.nodeCache=[],P.nodeCacheTimestamp=0;var K=U.getError();if(0!==K)throw console.log("Error: Something went wrong with WebGL!",K),{type:"webgl error"};m()}},this.destroy=function(){if(a!==r&&(I!==r&&a.contains(I)&&a.removeChild(I),N!==r&&a.contains(N)&&a.removeChild(N)),U){var e=U.getExtension("WEBGL_lose_context");e&&e.loseContext()}},this.resize=function(){var t=e.devicePixelRatio||1;I.width=I.clientWidth*t,I.height=I.clientHeight*t,U&&(1286==U.getError()&&C(),U.viewport(0,0,U.drawingBufferWidth,U.drawingBufferHeight),"multires"!=F&&U.uniform1f(P.aspectRatio,I.clientWidth/I.clientHeight))},this.resize(),this.setPose=function(e,t){D=[e,t]},this.render=function(e,t,a,o){var i,h,s,u=0;if(o===r&&(o={}),o.roll&&(u=o.roll),D!==r){var g=D[0],E=D[1],w=e,A=t,b=Math.cos(E)*Math.sin(e)*Math.sin(g)+Math.cos(e)*(Math.cos(g)*Math.cos(t)+Math.sin(E)*Math.sin(g)*Math.sin(t)),C=-Math.sin(e)*Math.sin(E)+Math.cos(e)*Math.cos(E)*Math.sin(t),B=Math.cos(E)*Math.cos(g)*Math.sin(e)+Math.cos(e)*(-Math.cos(t)*Math.sin(g)+Math.cos(g)*Math.sin(E)*Math.sin(t));e=Math.asin(Math.max(Math.min(B,1),-1)),t=Math.atan2(C,b);var L=[Math.cos(w)*(Math.sin(E)*Math.sin(g)*Math.cos(A)-Math.cos(g)*Math.sin(A)),Math.cos(w)*Math.cos(E)*Math.cos(A),Math.cos(w)*(Math.cos(g)*Math.sin(E)*Math.cos(A)+Math.sin(A)*Math.sin(g))],Y=[-Math.cos(e)*Math.sin(t),Math.cos(e)*Math.cos(t)],O=Math.acos(Math.max(Math.min((L[0]*Y[0]+L[1]*Y[1])/(Math.sqrt(L[0]*L[0]+L[1]*L[1]+L[2]*L[2])*Math.sqrt(Y[0]*Y[0]+Y[1]*Y[1])),1),-1));L[2]<0&&(O=2*Math.PI-O),u+=O}if(U||"multires"!=F&&"cubemap"!=F){if("multires"!=F){if(U){var W=2*Math.atan(Math.tan(.5*a)/(U.drawingBufferWidth/U.drawingBufferHeight));i=1/Math.tan(.5*W),U.uniform1f(P.psi,t),U.uniform1f(P.theta,e),U.uniform1f(P.rot,u),U.uniform1f(P.f,i),!0===X&&"equirectangular"==F&&(U.bindTexture(U.TEXTURE_2D,P.texture),U.texImage2D(U.TEXTURE_2D,0,U.RGB,U.RGB,U.UNSIGNED_BYTE,G)),U.drawArrays(U.TRIANGLES,0,6)}}else{var k=p(a,U.drawingBufferWidth/U.drawingBufferHeight,.1,100);T(a);var z=m();z=_(z,-u,"z"),z=_(z,-e,"x"),z=_(z,t,"y"),z=v(z),U.uniformMatrix4fv(P.perspUniform,!1,new Float32Array(x(k))),U.uniformMatrix4fv(P.cubeUniform,!1,new Float32Array(x(z)));var V=M(k,z);if(P.nodeCache.sort(n),P.nodeCache.length>200&&P.nodeCache.length>P.currentNodes.length+50)for(var H=P.nodeCache.splice(200,P.nodeCache.length-200),h=0;h<H.length;h++)U.deleteTexture(H[h].texture);P.currentNodes=[];var q=["f","b","u","d","l","r"];for(s=0;s<6;s++){f(V,new c(S[s],q[s],1,0,0,G.fullpath),e,t,a)}for(P.currentNodes.sort(d),h=0;h<P.currentNodes.length;h++)if(!P.currentNodes[h].texture){setTimeout(R,0,P.currentNodes[h]);break}l()}if(o.returnImage!==r)return I.toDataURL("image/png")}else{s=y/2;var j={f:"translate3d(-"+(s+2)+"px, -"+(s+2)+"px, -"+s+"px)",b:"translate3d("+(s+2)+"px, -"+(s+2)+"px, "+s+"px) rotateX(180deg) rotateZ(180deg)",u:"translate3d(-"+(s+2)+"px, -"+s+"px, "+(s+2)+"px) rotateX(270deg)",d:"translate3d(-"+(s+2)+"px, "+s+"px, -"+(s+2)+"px) rotateX(90deg)",l:"translate3d(-"+s+"px, -"+(s+2)+"px, "+(s+2)+"px) rotateX(180deg) rotateY(90deg) rotateZ(180deg)",r:"translate3d("+s+"px, -"+(s+2)+"px, -"+(s+2)+"px) rotateY(270deg)"};i=1/Math.tan(a/2);var Z=i*U.drawingBufferWidth/2+"px",K="perspective("+Z+") translateZ("+Z+") rotateX("+e+"rad) rotateY("+t+"rad) ",J=Object.keys(j);for(h=0;h<6;h++){var Q=N.querySelector(".pnlm-"+J[h]+"face").style;Q.webkitTransform=K+j[J[h]],Q.transform=K+j[J[h]]}}},this.isLoading=function(){if(U&&"multires"==F)for(var e=0;e<P.currentNodes.length;e++)if(!P.currentNodes[e].textureLoaded)return!0;return!1},this.getCanvas=function(){return I};var V=function(){function e(){var e=this;this.texture=this.callback=null,this.image=new Image,this.image.crossOrigin=a||"anonymous",this.image.addEventListener("load",function(){E(e.image,e.texture),e.callback(e.texture),r(e)})}function t(e,t,r){this.src=e,this.texture=t,this.callback=r}function r(e){if(n.length){var t=n.shift();e.loadTexture(t.src,t.texture,t.callback)}else i[o++]=e}var a,o=4,i={},n=[];e.prototype.loadTexture=function(e,t,r){this.texture=t,this.callback=r,this.image.src=e};for(var h=0;h<o;h++)i[h]=new e;return function(e,r,h){a=h;var s=U.createTexture();return o?i[--o].loadTexture(e,s,r):n.push(new t(e,s,r)),s}}()}var o=["attribute vec2 a_texCoord;","varying vec2 v_texCoord;","void main() {","gl_Position = vec4(a_texCoord, 0.0, 1.0);","v_texCoord = a_texCoord;","}"].join(""),i=["attribute vec3 a_vertCoord;","attribute vec2 a_texCoord;","uniform mat4 u_cubeMatrix;","uniform mat4 u_perspMatrix;","varying mediump vec2 v_texCoord;","void main(void) {","gl_Position = u_perspMatrix * u_cubeMatrix * vec4(a_vertCoord, 1.0);","v_texCoord = a_texCoord;","}"].join(""),n=["precision mediump float;","uniform float u_aspectRatio;","uniform float u_psi;","uniform float u_theta;","uniform float u_f;","uniform float u_h;","uniform float u_v;","uniform float u_vo;","uniform float u_rot;","const float PI = 3.14159265358979323846264;","uniform sampler2D u_image;","uniform samplerCube u_imageCube;","varying vec2 v_texCoord;","uniform vec4 u_backgroundColor;","void main() {","float x = v_texCoord.x * u_aspectRatio;","float y = v_texCoord.y;","float sinrot = sin(u_rot);","float cosrot = cos(u_rot);","float rot_x = x * cosrot - y * sinrot;","float rot_y = x * sinrot + y * cosrot;","float sintheta = sin(u_theta);","float costheta = cos(u_theta);","float a = u_f * costheta - rot_y * sintheta;","float root = sqrt(rot_x * rot_x + a * a);","float lambda = atan(rot_x / root, a / root) + u_psi;","float phi = atan((rot_y * costheta + u_f * sintheta) / root);"].join("\n"),h=n+["float cosphi = cos(phi);","gl_FragColor = textureCube(u_imageCube, vec3(cosphi*sin(lambda), sin(phi), cosphi*cos(lambda)));","}"].join("\n"),s=n+["lambda = mod(lambda + PI, PI * 2.0) - PI;","vec2 coord = vec2(lambda / PI, phi / (PI / 2.0));","if(coord.x < -u_h || coord.x > u_h || coord.y < -u_v + u_vo || coord.y > u_v + u_vo)","gl_FragColor = u_backgroundColor;","else","gl_FragColor = texture2D(u_image, vec2((coord.x + u_h) / (u_h * 2.0), (-coord.y + u_v + u_vo) / (u_v * 2.0)));","}"].join("\n"),u=["varying mediump vec2 v_texCoord;","uniform sampler2D u_sampler;","void main(void) {","gl_FragColor = texture2D(u_sampler, v_texCoord);","}"].join("");return{renderer:function(e,t,r,o){return new a(e,t,r,o)}}}(window,document);