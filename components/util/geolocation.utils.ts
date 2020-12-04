// declare var window: any;

// let locale_data;
// var __sfr = {};
// var __sf = [];
// var __swv: any = 0;
// var ver_info: any = {};
// var f_loc = null, f_lang = null;
// var region_abbr = 'us';
// var data_region = 'US';
// var locale_hn_override;
// var locnver;
// var main_lang = 'EN';
// var isDev = true;
// var isBeta = false;
// var isAlpha = false;
// var locale_front = '';
// var sw_topv = null;

// export class GeolocateUtils {
// 	static localeRouting(dontLoadScript?) {
// 		if(!window.locale_routed){
// 			window.locale_routed = true;
// 			if(locale_data){
// 				console.log('INDEX','Client Info = IP: '+locale_data.ip+' ['+locale_data.country+']'
// 								+' ('+locale_data.city+', '+locale_data.region+')'
// 								// +', ('+locale_data.loc+')'
// 								// +'  ::  ISP: '+locale_data.org+', '+locale_data.hostname
// 							);
// 				if(f_loc && f_loc !== 'none' && f_loc !== 'null' && f_loc !== 'undefined'){
// 					locale_data.country = f_loc;
// 					console.log('INDEX','Service Region Override to ['+f_loc+']');
// 				}
// 				if(f_lang && f_lang !== 'none' && f_lang !== 'null' && f_lang !== 'undefined'){
// 					//locale_data.country = f_lang;
// 				}
// 				if(locale_data.country){
// 					var c = locale_data.country;
// 					var route_map: any = [
// 						[ ['US','CA'] , 'US' ], //North America
// 						[ ['KR','JP','CN'] , 'KR' ], //East Asia
// 					];
// 					var ip_map = {
// 						'0.0.0.0':'',
// 						filter:function(IPv4,IPv6){
// 							return 'KR';
// 						},
// 					};
// 					for(var i = 0; i < route_map.length; ++i){
// 						var route = route_map[i];
// 						if(route[0].indexOf(c) >= 0){
// 							data_region = route[1];
// 							region_abbr = route[1].toLowerCase();
// 							break;
// 						}
// 					}
// 				}
// 			}
// 			console.log('INDEX','Service Region Resolved to ['+data_region+']');
// 			if(!locale_hn_override)
// 				locnver = isDev ? region_abbr+'-dev' : isAlpha ? region_abbr+'-alpha' :  isBeta ? region_abbr+'-beta' : region_abbr;
// 			else
// 				locnver = locale_front;
				
// 			if(!f_lang || f_lang === 'none' || f_lang === 'null' || f_lang === 'undefined'){
// 				var auto_routed = true;
// 				if(data_region == 'KR') main_lang = 'KR';
// 				else auto_routed = false;
// 				if(auto_routed){
// 					console.log('INDEX','Service Language Auto-routed to ['+main_lang+']');
// 				}
// 			}
// 		}
// 		// if(!dontLoadScript) window.load_script();
// 	}

// 	static initialize() {

// 		if(navigator.serviceWorker && navigator.serviceWorker.controller) {
// 			navigator.serviceWorker.controller.postMessage({ action:'versions', ver_info: ver_info});
// 		}

// 		var df_locale_data = {ip: "0.0.0.0", cached_time: 0, city: "Unknown", country: "XX", hostname: "localhost", loc: null, org: "Unknown", postal: "00000", region: "Unknown"};

// 		if(localStorage){
// 			var last_ip = localStorage.getItem('last_ip'); if(!last_ip) last_ip = '0.0.0.0';
// 			__swv = localStorage.getItem('swv'); if(!__swv) __swv = 0; else __swv = parseInt(__swv);
// 			var a: any = localStorage.getItem('ipinfo/'+last_ip); if(a) a = JSON.parse(a);
// 			if(a) { locale_data = a; }
// 			if(navigator.onLine){
// 				if(!a || Date.now() - a.cached_time > 2592000000){
// 					var _lq = new XMLHttpRequest();
// 						_lq.open("GET", "https://ipinfo.io/json?token=9b1c21870018e0");
// 						_lq.onreadystatechange = function(e){
// 							if(this.readyState == 4){
// 								if(this.status == 200){
// 									a = JSON.parse(this.responseText);
// 									a.cached_time = Date.now();
// 									localStorage.setItem('ipinfo/'+a.ip,JSON.stringify(a));
// 									locale_data = a;
// 								}
// 								else{
// 									locale_data = df_locale_data;
// 								}
// 								ServiceWorkerUtil.localeRouting();
// 							}
// 						}
// 						_lq.send();
// 				}
// 				else{
// 					ServiceWorkerUtil.localeRouting();
// 				}
// 			}
// 			else if(!a){
// 				locale_data = df_locale_data;
// 				ServiceWorkerUtil.localeRouting();
// 			}
// 			else{
// 				ServiceWorkerUtil.localeRouting();
// 			}
// 		}
// 		else{
// 			locale_data = df_locale_data;
// 			ServiceWorkerUtil.localeRouting();
// 		}
		
// 		if(__swv != ver_info.sw && 'serviceWorker' in navigator){
// 			if(!navigator.onLine){
// 				console.log('SW','Cannot Register New Service Worker: Network Not Live','#de00ff');
// 				return;
// 			}
// 			console.log('SW','Version Changed Detected','#de00ff');
// 			console.log('%c[SW]','color:#de00ff;',   'Version Changed Detected');
// 			localStorage.setItem('swv',ver_info.sw);
// 			navigator.serviceWorker.register("/sw.js?v="+sw_topv);
// 		}
// 	}
// }
