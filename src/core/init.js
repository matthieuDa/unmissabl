/*
= ADJUST FONT SIZE
------------------------------------------------------------------------------------- */


	// (function($) {
	// 	$.fn.textsize = function(options) {
	// 		var settings = $.extend({
	// 			maximum: 1920,
	// 			minimum: 0,
	// 			maxFont: 9999,
	// 			minFont: 30,
	// 			fontRatio: 35,
	// 		}, options),
	// 		changes = function(el) {
	// 			var $el = $(el),
	// 				elw = $el.width(),
	// 				width = elw > settings.maximum ? settings.maximum : elw < settings.minimum ? settings.minimum : elw,
	// 				fontBase = width / settings.fontRatio,
	// 				fontSize = fontBase > settings.maxFont ? settings.maxFont : fontBase < settings.minFont ? settings.minFont : fontBase;
	// 			$el.css('font-size', fontSize + 'px');
	// 		};
	// 		return this.each(function() {
	// 			var that = this;
	// 			$(window).resize(function() { changes(that); });
	// 			changes(this);
	// 		});
	// 	};
	// }(jQuery));

/*
= GET WINDOW WIDTH
------------------------------------------------------------------------------------- */

	function viewport() {
		var e = window, 
			a = 'inner';
		if (!('innerWidth' in window)) {
			a = 'client';
			e = document.documentElement || document.body;
		}
		return { width: e[a + 'Width'] };
	};

/*
= MAIN CONTROLLER
-------------------------------------------------------------------------------------- */

	var eyeVisible = false,
		ambientSound = null;

	var noformat = {
		windowW: null,
		windowH: $(window).height(),
		scroll: null,
		handheldScrollInterval: null,
		resizeTimeout: null,
		initOnce: function() {

			/* 
			+ Preloading */

				if ($('body').hasClass('single-projects')) {
					$('.single-intro').preloadingSite({
						truePercentage: false,
//						forceSequentialLoad: true,
//						progressiveReveal: true,
						beforeComplete: function() {},
						onComplete: function() {
							$('.intro-video-spinner span i').addClass('activated');	
						}
					});
				} else {
					$('body').preloadingSite({
						truePercentage: false,
						forceSequentialLoad: false,
						beforeComplete: function() {
							eyeVisible = true;	
					    	// if ($('body').hasClass('home'))
					        // 	eyeInit();
					 		// if ($('html').hasClass('desktop') && $('body').hasClass('home')) {
							// 	var bodyEl = document.getElementsByTagName('head')[0];
							// 	var script = document.createElement('script');
							// 	script.src = themeUrl + '/assets/js/libs/particles.js';
							// 	script.setAttribute('id', 'particles-script');
							// 	bodyEl.appendChild(script);		 			
					 		// }
						},
						onComplete: function() {}
					});					
				}

				$('.first-time-overlay').remove();

			/* 
			+ Preloading */

// 				if ($('body').hasClass('single-projects')) {
// 					$('.single-intro').preloadingSite({
// 						truePercentage: false,
// //						forceSequentialLoad: true,
// //						progressiveReveal: true,
// 						beforeComplete: function() {},
// 						onComplete: function() {
// 							$('.intro-video-spinner span i').addClass('activated');
							
// 							$('*[data-bgr]').each(function () {
// 								var currbgr = $(this).data('bgr');

// 								$(this).css({ 'background-image': 'url(' + currbgr + ')' });
// 							})

// 							$('img').each(function () {
// 								var curr = $(this),
// 									currImg = curr.data('src');

// 								curr.attr('src', currImg);
// 							})
							
// 							noformat.single.players = vimeovideo.setup();

// 							if ($('html').hasClass('desktop')) {

// 								noformat.single.isManuallyPaused = [];


// 								for (var i = 0; i < noformat.single.players.length; i++) {
// 									noformat.single.players[i].on('ready', function (event) {
// 										var curr = $(this),
// 											currIndex = curr.parent().index('.video-wrapper');
// 										if (!event.detail.vimeovideo.isMuted()) event.detail.vimeovideo.toggleMute();
// 										if (curr.parents('.single-intro').length) {
// 											$('.single-intro .vimeovideo-play-large').css({ 'opacity': '0', 'visibility': 'hidden' })
// 											noformat.single.introVideoReady = true;
// 											if (noformat.single.contentReady) {
// 												event.detail.vimeovideo.play();
// 											}
// 										};
// 										if (currIndex == noformat.single.players.length - 1) {
// 											console.log('');
// 											noformat.single.resize();
// 										}
// 									});
// 									noformat.single.isManuallyPaused.push(false);
// 								}

// 							}
// 							if (noformat.single.players) {
// 								noformat.single.players[0].on('timeupdate', function () {
// 									if (noformat.single.players[0].getCurrentTime() > 0.1) {
// 										$('.single-intro .vimeovideo-play-large').css({ 'opacity': '', 'visibility': '' })
// 										if ($('.intro-video-spinner-holder').length)
// 											$('.intro-video-spinner-holder').fadeOut(300, function () {
// 												$(this).remove();
// 											})
// 									}
// 								});
// 							}
// 						}
// 					});
// 				} else {
// 					$('body').preloadingSite({
// 						truePercentage: false,
// 						forceSequentialLoad: false,
// 						beforeComplete: function() {
// 							eyeVisible = true;	
// 						},
// 						onComplete: function() {}
// 					});					
// 				}
//
//				$('.first-time-overlay').remove();

			/*
			+ Page initialization */

				this.pageInit($('#main'));

			/*
			+ Add active class to navigation */

				$('header nav').find('.history-btn').removeClass('active');
				var currUrl = window.location;
				$('header nav .main li a[href="' + currUrl + '"]').addClass('active');

			/*
			+ Show discover btn */

				$('.single-intro .discover-btn').css('opacity', '1');

		},
		init: function() {
			/*
			+ Clear intervals / timeouts / arrays */

				if (noformat.home.introSlideshowInterval != null) {
					clearInterval(noformat.home.introSlideshowInterval);
					noformat.home.introSlideshowInterval = null;
				}

			/* 
			+ Trigger resize  */

				this.resize();

			/* 
			+ Enable browser's scrolling  */

				if (!$('html').hasClass('desktop')) {
					$(document).unbind('touchmove');
					$('body').unbind('touchmove touchstart touchend');
				}				

			/*
			+ Page initialization */

				if ($('.history-swap-box-in').length) {
					this.pageInit($('.history-swap-box-in'));
				}

			/*
			+ HTML overflow */

				if (!$('html').hasClass('desktop')) {
					if (($('html').hasClass('mobile') && $('body').hasClass('home')) || ($('html').hasClass('tablet') && ($('body').hasClass('home') || $('body').hasClass('page-template-page-about')))) {
						document.getElementsByTagName('html')[0].style.setProperty('overflow-x', 'hidden', 'important');
					} else {
						document.getElementsByTagName('html')[0].style.setProperty('overflow-y', 'visible', 'important');						
					}
				}				

		},
		pageInit: function(element) {

			var currClasses = element.attr('class').split(' ');

			for (var i = 0; i < currClasses.length; i++) {
				switch(currClasses[i]) {
					case 'home':
						$('.history-swap-box-in').length ?
							this.home.init($('.history-swap-box-in')) :
							this.home.init($('#main'));
						break;
					case 'about':
						$('.history-swap-box-in').length ?
							this.about.init($('.history-swap-box-in')) :
							this.about.init($('#main'));
						break;
					case 'single':
						$('.history-swap-box-in').length ?
							this.single.init($('.history-swap-box-in')) :
							this.single.init($('#main'));
						break;
                        case 'news':
						$('.history-swap-box-in').length ?
							this.news.init($('.history-swap-box-in')) :
							this.news.init($('#main'));
						break;
                        case 'awards':
						$('.history-swap-box-in').length ?
							this.awards.init($('.history-swap-box-in')) :
							this.awards.init($('#main'));
						break;
					case 'contact':
						$('.history-swap-box-in').length ?
							this.contact.init($('.history-swap-box-in')) :
							this.contact.init($('#main'));
						break;
					case 'work':
						$('.history-swap-box-in').length ?
							this.work.init($('.history-swap-box-in')) :
							this.work.init($('#main'));
						break;
					default: 
						break;
				};
			};

		},
		transformSetter: function(x, y) {
			return {
		   	    '-webkit-transform': 'translateX(' + x + ') translateY(' + y + ') translateZ(0px)',
		    	'-moz-transform': 'translateX(' + x + ') translateY(' + y + ') translateZ(0px)',
		   	  	'transform': 'translateX(' + x + ') translateY(' + y + ') translateZ(0px)'
			}
		},	
        parallaxOffsets: [],
        parallaxPosition: function(element, index) {

        	if ($('html').hasClass('desktop')) {
                var currSpeed = element.data('speed'),
	                siteTopOffset = this.parallaxOffsets[index].top < noformat.windowH ? noformat.windowH - this.parallaxOffsets[index].top : 0,
	                currMovement = element.is('.bgr') && element.parents('.hero').length ?
	                    currSpeed * (this.parallaxOffsets[index].top - noformat.scroll.vars.current - noformat.windowH + siteTopOffset) :
	                    currSpeed * (this.parallaxOffsets[index].top - noformat.scroll.vars.current - noformat.windowH + siteTopOffset);
        	} else {
	            var currSpeed = element.data('speed'),
	                siteTopOffset = this.parallaxOffsets[index].top < noformat.windowH ? noformat.windowH - this.parallaxOffsets[index].top : 0,
	                currMovement = element.is('.bgr') && element.parents('.hero').length ?
	                    currSpeed * (this.parallaxOffsets[index].top - $(window).scrollTop() - noformat.windowH + siteTopOffset) :
	                    currSpeed * (this.parallaxOffsets[index].top - $(window).scrollTop() - noformat.windowH + siteTopOffset);
            }
            currMovement += 0;
            if (((currSpeed < 0 && currMovement < 0) || (currSpeed > 0 && currMovement > 0))) currMovement = 0;
            element.css(noformat.transformSetter('0px', currMovement + 'px'));                   

        },					
		home: {
			introSlideshowInterval: null,
			parallaxCalculations: function() {
				console.log('');
				$('.parallax .layer').each(function() {
					var curr = $(this);
					curr.css({
						'left': '', 
						'top': '',
						'width': '',
						'height': ''
					});
					var currW = $('html').hasClass('portrait') ? curr.data('portrait-width') : curr.data('width'),
						currH = $('html').hasClass('portrait') ? curr.data('portrait-height') : curr.data('height'),
						currL = $('html').hasClass('portrait') ? curr.data('portrait-left') : curr.data('left'),
						currT = $('html').hasClass('portrait') ? curr.data('portrait-top') : curr.data('top'),
						newH = currH * noformat.windowH / 1080,
						newW = newH * currW / currH,
						newT = currT * noformat.windowH / 1080,
						newL = newT * currL / currT;
					curr.css({
						'left': newL,
						'top': newT,
						'width': newW,
						'height': newH
					});
					var currTransform = Math.abs($(window).height() - currH) > $(window).height() * 2 / 3 ? Math.abs($(window).height() - currH) : Math.abs($(window).height() - currH) * 0.3,
						currDelay = newT * 0.75 > 250 ? Math.abs(newT) * 1.2 : 550,
						currSpeed = currDelay > 250 ? 900 - Math.abs(newT) * 0.5 : 900;
					if (currTransform < 25) currTransform = 25;
					var currTransform = curr.hasClass('always-top') ? -70 : currTransform,
						transformFromUp = curr.hasClass('always-top') ? '-70%' : currTransform + '%',
						transformFromDown = curr.hasClass('always-bottom') || curr.hasClass('always-top') ? currTransform + '%' : -currTransform + '%';
					curr.children('span').css(noformat.transformSetter('0px' , currTransform + '%'));
					curr.children('span').data('transformFromUp', transformFromUp);
					curr.children('span').data('transformFromDown', transformFromDown);
					curr.children('span').data('transformDelayFromUp', currDelay);
					curr.children('span').data('transformDelayFromDown', currDelay);
					curr.children('span').data('transformSpeedFromUp', currSpeed);
					curr.children('span').data('transformSpeedFromDown', currSpeed);
					if (curr.parents('section').hasClass('active')) {
						curr.children('span').css(noformat.transformSetter('0px' , '0px')).css({
			       			'-webkit-transition':'-webkit-transform ' + curr.data('transformSpeedFromDown') + 'ms ' + curr.data('transformDelayFromDown') + 'ms ease-in-out',
		       				'-moz-transition':'-moz-transform ' + curr.data('transformSpeedFromDown') + 'ms ' + curr.data('transformDelayFromDown') + 'ms ease-in-out',
		       				'transition':'transform ' + curr.data('transformSpeedFromDown') + 'ms ' + curr.data('transformDelayFromDown') + 'ms ease-in-out'
		   				});	
					}
				});

			},
			cloneItems: function(element) {

			/* 
			+ Clone and position header and navigation  */

				$('.sections-holder section').each(function() {
					var colorScheme = $(this).data('color-scheme') == 'dark' ? 'light' : '';
					$(this).find('article').addClass(colorScheme);
				});

			},
			init: function(element) {
			/* 
			+ Intro slideshow */

				//if ($('html').hasClass('desktop')) {

/*				    var introVideo = $('.intro').find('video');

					introVideo.on('canplaythrough', function() {
					   this.play();
					   this.volume = 0;
					});		
*/
				//}

				var firstWordsArray = ['Fantastic', 'Beautiful', 'Inspiring', 'Lovely', 'Strong', 'Clever', 'Playful', 'Brilliant', 'Strong', 'Elegant', 'Remarkable', 'Spectacular', 'Sensational', 'Astonishing', 'Sophisticated', 'Innovative'],
					secondWordsArray = ['apps', 'websites', 'systems', 'brands', 'reports', 'art', 'design', 'decks', 'logos', 'UI', 'campaigns'],
					words = null;

    			var getRandomWord = function () {
      				return [firstWordsArray[Math.floor(Math.random() * firstWordsArray.length)], secondWordsArray[Math.floor(Math.random() * secondWordsArray.length)]];
    			};

			    function introSlideshow() {		
			    	if ($('html').hasClass('desktop')) {
/*				    	introVideo.get(0).play();
				    	introVideo.get(0).volume = 0;
*/				    }
			    	noformat.home.introSlideshowInterval = setInterval(function() {
			    		words = getRandomWord();
			    		$('.intro .first').html(words[0]);
			    		$('.intro .last').html(words[1]);
			    	}, 200);
			    };

			    introSlideshow(); 
				if (!$('html').hasClass('desktop')) {
					noformat.mobileTabletHeader();			
				}	

			/* 
			+ Prevent handheld devices from bouncing / reloading 

			+ disabling contact-btn on home-page mobile */

				if (!$('html').hasClass('desktop')) {
					$(document).bind('touchmove', function(e) {
						e.preventDefault();
						var $footer = $('.section.contact-part');
						if ($footer.length === 0) {
							return;
						}
						var footerOffset = $footer.offset().top;
						if(footerOffset < noformat.windowH) {
							$('.updated-nav ul li a.contact-btn').addClass('disable-contact-btn-mobile');
						} else {
							$('.updated-nav ul li a.contact-btn').removeClass('disable-contact-btn-mobile');
						}
					});

					$(document.body).on('scroll', function(e) {
						var scrollFromTop = $(document.body).scrollTop();
						var $footer = $('.section.contact-part');
						var footerOffset = $footer.offset().top;
						var lastScrollTop = 0;
						var delta = 2;
						if(footerOffset < noformat.windowH) {
							$('.updated-nav ul li a.contact-btn').addClass('disable-contact-btn-mobile');
						} else {
							$('.updated-nav ul li a.contact-btn').removeClass('disable-contact-btn-mobile');
						}					
					});
				}
					
				

			/* 
			+ Snap functionality  */
			if (!$('html').hasClass('mobile')) {
				var weAreSeen = false,
					clientsSeen = false;

			    element.find('.sections-holder').fullpage({
		            scrollingSpeed: 700,
		            scrollingDelay: 500,
		            onLeave: function(index, nextIndex, direction) {
			            $('body').addClass('scrolling');		            	
//		            	$('header nav .main li .work-btn').removeClass('active');
		            	if (nextIndex != 1) {
		            		eyeVisible = false;
		            		//if (ambientSound != null) ambientSound.pause();
		            		if (noformat.home.introSlideshowInterval != null) {
		            			if ($('html').hasClass('desktop')) {
/*		            				introVideo.get(0).pause();
*/		            			}
		            			clearInterval(noformat.home.introSlideshowInterval);
		            			noformat.home.introSlideshowInterval = null;
		            		}
/*		            		if (nextIndex != $('.sections-holder section').length) {
		            			$('header nav .main li .work-btn').addClass('active');
		            		}
*/		            	} else {
		            		introSlideshow();
		            	}
		            	$('header .nav-trigger').css({
		            		'-webkit-transition': 'all 900ms 500ms ease-in-out',
		            		'-moz-transition': 'all 900ms 500ms ease-in-out',
		            		'transition': 'all 900ms 500ms ease-in-out'
		            	});

						if ($('.sections-holder section').eq(nextIndex - 1).hasClass('happy-moves')) {
							$('header').addClass('red-bg');
						} else {
							$('header').removeClass('red-bg');
						}					

						if ($('.sections-holder section').eq(nextIndex - 1).hasClass('contact-part')) {
							$('.updated-main .contact-btn').addClass('disable-contact-btn');
						} else {
							$('.updated-main .contact-btn').removeClass('disable-contact-btn');
						}

		            	if (direction == 'down') {
		            		$('.sections-holder section').eq(nextIndex - 1).removeClass('went-down').find('.layer').each(function() {
		            			var curr = $(this).children('span');
		            			curr.css(noformat.transformSetter('0px' , '0px')).css({
		            				'-webkit-transition':'transform ' + curr.data('transformSpeedFromDown') + 'ms ' + curr.data('transformDelayFromDown') + 'ms ease-in-out',
		            				'-moz-transition':'transform ' + curr.data('transformSpeedFromDown') + 'ms ' + curr.data('transformDelayFromDown') + 'ms ease-in-out',
		            				'transition':'transform ' + curr.data('transformSpeedFromDown') + 'ms ' + curr.data('transformDelayFromDown') + 'ms ease-in-out'
		            			});
		            		});
		            		for (var i = index - 1; i < nextIndex - 1; i++) {
		            			$('.sections-holder section').eq(i).addClass('went-up').removeClass('went-down').find('.parallax').parallax('disable');
								$('.sections-holder section').eq(i).find('.layer').each(function() {
			           				var curr = $(this).children('span');
			           				curr.css(noformat.transformSetter('0px' , curr.data('transformFromDown'))).css({
		        	    				'-webkit-transition':'-webkit-transform 700ms 250ms ease-in-out',
		        	    				'-moz-transition':'-moz-transform 700ms 250ms ease-in-out',
		        	    				'transition':'transform 700ms 250ms ease-in-out'
		            				});
		            			});
		            		};
		            	} else {
		            		$('.sections-holder section').eq(nextIndex - 1).removeClass('went-up').find('.layer').each(function() {
		            			var curr = $(this).children('span');
		            			curr.css(noformat.transformSetter('0px' , '0px')).css({
		            				'-webkit-transition':'-webkit-transform ' + curr.data('transformSpeedFromUp') + 'ms 700ms ease-in-out',
		            				'-moz-transition':'-moz-transform ' + curr.data('transformSpeedFromUp') + 'ms 700ms ease-in-out',
		            				'transition':'transform ' + curr.data('transformSpeedFromUp') + 'ms 700ms ease-in-out'
		            			});
		            		});
		            		for (var i = nextIndex; i <= index - 1; i++) {
		            			$('.sections-holder section').eq(i).addClass('went-down').removeClass('went-up').find('.parallax').parallax('disable');
								$('.sections-holder section').eq(i).find('.layer').each(function() {
		            				var curr = $(this).children('span');
		            				curr.css(noformat.transformSetter('0px' , curr.data('transformFromUp'))).css({
			            				'-webkit-transition':'transform ' + curr.data('transformSpeedFromUp') + 'ms 250ms ease-in-out',
			            				'-moz-transition':'transform ' + curr.data('transformSpeedFromUp') + 'ms 250ms ease-in-out',
			            				'transition':'transform ' + curr.data('transformSpeedFromUp') + 'ms 250ms ease-in-out'			            				
			            			});
			            		});
		            		};
		            	}
		            },
		            afterLoad: function(index) {
		           		$('body').removeClass('scrolling');
		            	$('header .nav-trigger').css({
		            		'-webkit-transition': '',
		            		'-moz-transition': '',
		            		'transition': ''
		            	});
		            	if (index == 1) {
		            		//if (ambientSound != null) ambientSound.play();	
							eyeVisible = true;		            		
		            	}		            	
		            	$('section.active').find('.parallax').parallax('enable');
						if (index == 2 && !weAreSeen) {
			            	var weAreArray = ['strategists-list', 'designers-list', 'developers-list', 'inventors-list', 'artists-list', 'storytellers-list'];
							for (var i = 0; i < 4; i++) {
		            			var curr = weAreArray[Math.floor(Math.random() * weAreArray.length)];
		            			$('.we-are .text em[data-list="' + curr + '"]').addClass('blink');
							    weAreArray.splice($.inArray(curr, weAreArray), 1);
		            		}
    		        		$('.we-are .text .blink').each(function(i) {
								var el = $(this);
            					setTimeout(function() { 
							        el.addClass('hovered');
							        setTimeout(function() {
							        	el.removeClass('hovered');
							        }, 550)
							    }, i * 350); 
    		    			})
							weAreSeen = true;
			            } else if (index == 8 && !clientsSeen) {
							var clientsArray = [0, 1, 2, 3, 4, 5];
							for (var i = 0; i < 4; i++) {
		            			var curr = clientsArray[Math.floor(Math.random() * clientsArray.length)];
		            			$('.clients-intro .text em').eq(curr).addClass('blink');
							    clientsArray.splice($.inArray(curr, clientsArray), 1);
		            		}
    		        		$('.clients-intro .text .blink').each(function(i) {
								var el = $(this);
            					setTimeout(function() { 
							        el.addClass('hovered');
							        setTimeout(function() {
							        	el.removeClass('hovered');
							        }, 550)
							    }, i * 350); 
    		    			})
							clientsSeen = true;			            	
			            }

						// disabling contact-btn on desktop home page
						if($('html').hasClass('desktop') || $('html').hasClass('tablet')) {
							if($('section.section.contact-part').hasClass('active')) {
								$('.nav-contact-link').addClass('disable-contact-btn');
							} else {
								$('.nav-contact-link').removeClass('disable-contact-btn');
							}
						}

		            }
		        });
			}

			/* 
			+ Elements' cloning and repositioning */

				this.cloneItems(element);

			/* 
			+ Parallax */

				$('.parallax').each(function(i) {
					$(this).parallax();
					$(this).parallax('disable');
				});

				this.parallaxCalculations();

			/* 
			+ Clear interval for handheld devices */
				// if (noformat.handheldScrollInterval != null) {
				// 	$('header').removeClass('header-up').removeClass('sticky-header');
				// 	clearInterval(noformat.handheldScrollInterval);
				// 	noformat.handheldScrollInterval = null;
				// }

			},
			resize: function() {

				this.parallaxCalculations();

			}

		}, 
		about: {
			init: function(element) {

			    var weMakeSeen = false;

			/* 
			+ Mobile and tablet scroll */

				if ($('html').hasClass('mobile')) {
					noformat.mobileTabletHeader();			
				}

			/* 
			+ Mobile heights */

				if ($('html').hasClass('mobile') && !$('body').hasClass('page-template-page-about')) {
					element.find('section').not('.footer').each(function() {
						$(this).css('min-height', noformat.windowH);
					});
				}

			/* 
			+ Prevent handheld devices from bouncing / reloading */
			/*
			+ disabling contact-btn about page mobile 
			 */
			if (!$('html').hasClass('desktop')) {
				$(window).bind('touchmove', function(e) {
					e.preventDefault();
					var $footer = $('.section.quote .contact-new');
					if ($footer.length === 0) {
						// For pages without footer
						return;
					}
					var footerOffset = $footer.offset().top;
					if(footerOffset < noformat.windowH) {
						$('.nav-contact-link').addClass('disable-contact-btn-mobile');
					} else {
						$('.nav-contact-link').removeClass('disable-contact-btn-mobile');
					}
				});

				$(window).on('scroll', function(e) {
					var $footer = $('.section.quote .contact-new');
						var footerOffset = $footer.offset().top;
						if(noformat.windowH + $(document).scrollTop() >= footerOffset) {
						$('.nav-contact-link').addClass('disable-contact-btn-mobile');
					} else {
						$('.nav-contact-link').removeClass('disable-contact-btn-mobile');
					}
				});
			}

				
			    if (!$('html').hasClass('desktop') && !$('html').hasClass('mobile')) {
					$(document).bind('touchmove', function(e) {
     					e.preventDefault();
     				});
				};
				

			/* 
			+ Testimonials slider  */

				$('.testimonials-slider').slick({
					fade: true,
					arrows: false,
					dots: true,
					autoplay: true,
  					autoplaySpeed: 7000,
				}); 

			/* 
			+ Snap functionality services-page */

				if (!$('html').hasClass('mobile')) {

					$('.testimonials-slider').slick('slickPause');

				    element.find('.sections-holder').fullpage({			      
			            scrollingSpeed: 700,
			            scrollingDelay: 500,
			            onLeave: function(index, nextIndex, direction) {	
			            	$('body').addClass('scrolling');
			            	$('.we-design ul, .we-are ul').trigger('mousemove');
							if (direction == 'down') {
			            		$('.sections-holder section').eq(nextIndex - 1).removeClass('went-down');
			            		for (var i = index - 1; i < nextIndex - 1; i++) {
			            			$('.sections-holder section').eq(i).addClass('went-up').removeClass('went-down');
			            		};
			            	} else {
			            		$('.sections-holder section').eq(nextIndex - 1).removeClass('went-up');
			            		for (var i = nextIndex; i <= index - 1; i++) {
			            			$('.sections-holder section').eq(i).addClass('went-down').removeClass('went-up');
			            		};
			            	}
			            	$('.sections-holder section').eq(nextIndex - 1).hasClass('testimonials') ?
			            		$('.testimonials-slider').slick('slickPlay') :
			            		$('.testimonials-slider').slick('slickPause');

							
							if ($('.sections-holder section').eq(nextIndex - 1).hasClass('contact-part')) {
								$('.updated-main .contact-btn').addClass('disable-contact-btn');
							} else {
								$('.updated-main .contact-btn').removeClass('disable-contact-btn');
							}		
							// disabling contact-btn on desktop services-page
							if($('html').hasClass('desktop') || $('html').hasClass('tablet')) {
								if($('.sections-holder section').eq(nextIndex - 1).hasClass('quote')) {
									$('.updated-main .contact-btn').addClass('disable-contact-btn');
								} else {
									$('.updated-main .contact-btn').removeClass('disable-contact-btn');
								}
							}	
			            },
			            afterLoad: function(index) {
			            	$('body').removeClass('scrolling');			            	
			            	$('header .nav-trigger').css({
			            		'-webkit-transition': '',
			            		'-moz-transition': '',
			            		'transition': ''
			            	});
						
							// disabling contact-btn on desktop services-page
							if($('html').hasClass('desktop') || $('html').hasClass('tablet')) {
								if($('section.section.quote').hasClass('active')) {
									$('.nav-contact-link').addClass('disable-contact-btn');
								} else {
									$('.nav-contact-link').removeClass('disable-contact-btn');
								}
							}	
			            	/*if (index == 2 && !weMakeSeen) {
			            		var weMakeArray = ['websites-list', 'apps-list', 'brand-identities-list', 'marketing-campaigns-list', 'go-to-market-list', 'social-media-list'];
			            		for (var i = 0; i < 4; i++) {
			            			var curr = weMakeArray[Math.floor(Math.random() * weMakeArray.length)];
			            			$('.we-design .text em[data-list="' + curr + '"]').addClass('blink');
								    weMakeArray.splice($.inArray(curr, weMakeArray), 1);
			            		}
			            		$('.we-design .text .blink').each(function(i) {
									var el = $(this);
			            			setTimeout(function() { 
								        el.addClass('hovered');
								        setTimeout(function() {
								        	el.removeClass('hovered');
								        }, 250)
								    }, i * 150); 
			            		})
								weMakeSeen = true;
			            	}*/
			            }
			        });	

				}

			/* 
			+ We are section */

/*				$('.interactive').each(function() {

					var curr = $(this),
						paragraphW = curr.find('.text').outerWidth(),
						paragraphH = curr.find('.text').outerHeight(),
						currX = 0,
						currY = 0,
						interactiveInterval = null;

					function interactiveSlideshow(list) {
				    	interactiveInterval = setInterval(function() {
					    	var firstSlide = $(list).children('li:first-child');
					    	firstSlide.css('display', '');
							firstSlide.next('li').css('display', 'block')
								.end().appendTo(list);
				    	}, 250);
				    };

				    var hovered = false,
				    	hoveredItem = null,
				    	oldList = null;

					function interactiveHover() {
						if (currY >= 0 && currY < paragraphH && currX >= 0 && currX < paragraphW) {
							curr.find('.text').find('em').each(function() {
								var currEm = $(this),
									currList = currEm.data('list'),
									offsetTop = $('html').hasClass('mobile') ? 51 : 26,
									offsetLeft = $('html').hasClass('mobile') ? 0 : parseInt(currEm.parents('.text-holder').css('padding-left'));
								if (($('html').hasClass('desktop') && currY >= currEm.position().top - offsetTop && currY < currEm.position().top + currEm.height() - offsetTop && currX >= currEm.position().left - offsetLeft && currX < currEm.position().left + currEm.width() - offsetLeft) || 
									(!$('html').hasClass('desktop') && !currEm.hasClass('hovered') && currY >= currEm.position().top - offsetTop && currY < currEm.position().top + currEm.height() - offsetTop && currX >= currEm.position().left - offsetLeft && currX < currEm.position().left + currEm.width() - offsetLeft)) {
									if (!hovered || (hoveredItem != null && currEm.text() != hoveredItem.text())) {
										if (hoveredItem != null) {
											hoveredItem.removeClass('hovered').css('z-index', '');
											$('.' + oldList).css({
												'opacity': '',
												'-webkit-transform': '',
												'-moz-transform': '',
												'transform': ''
											});
										}
										$(this).addClass('hovered').css('z-index', 3);
										$('.' + currList).css(noformat.transformSetter('0px' , '-50%')).css({
											'opacity': '1',
											top: currEm.position().top + 10,
											left: currEm.position().left + currEm.width() / 2
										});
										clearInterval(interactiveInterval);
									    interactiveSlideshow('.' + currList); 
									    hovered = true;
										hoveredItem = currEm;
										oldList = currList;
									}
								    return false;
								} else {
									currEm.removeClass('hovered').css('z-index', '');
									$('.' + currList).css({
										'opacity': '',
										'-webkit-transform': '',
										'-moz-transform': '',
										'transform': ''
									});
									if (currEm.is(':last-of-type')) {
										clearInterval(interactiveInterval);
										hoveredItem = oldList = interactiveInterval = null;
										hovered = false;
									}
								}
							});
						} else {
							curr.find('.text').find('em').removeClass('hovered').css('z-index', '');
							curr.find('.text ul').css({
								'opacity': '',
								'-webkit-transform': '',
								'-moz-transform': '',
								'transform': ''
							});
							clearInterval(interactiveInterval);
							hoveredItem = oldList = interactiveInterval = null;
							hovered = false;
						}
					}

					if ($('html').hasClass('desktop')) {
						curr.find('.text').mousemove(function(e) {
							currY = e.pageY - $(this).offset().top;
							currX = e.pageX - $(this).offset().left;
							interactiveHover();
						});		
						curr.find('.text').mouseleave(function(e) {
							$(this).find('em').removeClass('hovered').css('z-index', '');
							$(this).find('ul').css({
								'opacity': '',
								'-webkit-transform': '',
								'-moz-transform': '',
								'transform': ''
							});
							clearInterval(interactiveInterval);
							hoveredItem = oldList = interactiveInterval = null;
							hovered = false;
						});		
					} else {
						curr.find('.text').click(function(e) {
							currY = e.pageY - $(this).offset().top;
							currX = e.pageX - $(this).offset().left;
							interactiveHover();
						});		
					}

				}) */

			}		

		},
		single: {
			singleElementsOffsets: [],
			players: null,
			isPlayerLoaded: false,
			playerLoadedInterval: null,
			isContentLoaded: false,
			contentLoadedInterval: null,
			videoOffsets: [],
			introVideoReady: false,
			contentReady: false,
			isManuallyPaused: [],
			resizeTimeout: null,
			calculations: function() {
				$('.single-holder .single-intro').css({'height': noformat.windowH * 0.85});

				$('.single-holder .images-list li').each(function() {
					var curr = $(this);
					if ($('html').hasClass('desktop')) {
						var currWidth = $(this).width();
							currPadding = parseInt($(this).css('padding-top')) + parseInt($(this).css('padding-bottom'))
						if ($('#main').hasClass('is-limited-wrapper')) {
							$(window).width() > 660 ?
	//							curr.css({'height': noformat.windowH * 0.85}) :
								curr.css({'height': currWidth * 1080 / 1920}) :
								curr.css({'height': curr.is(':empty') ? noformat.windowH * 830 / 1920 - currPadding : 'auto'});	
						} else {
							$(window).width() > 660 ?
	//							curr.css({'height': noformat.windowH * 0.85}) :
								curr.css({'height': noformat.windowW * 1080 / 1920 - currPadding}) :
								curr.css({'height': curr.is(':empty') ? noformat.windowH * 830 / 1920 - currPadding : 'auto'});								
						}
					} else {
						if ($('#main').hasClass('is-limited-wrapper')) {
							curr.css({'height': currWidth * 1080 / 1920});
						} else {
							curr.css({'height': noformat.windowW * 1080 / 1920});
						}
					}
				})

				$('.text-holder .img-holder').each(function() {
					var curr = $(this);					
					var currW = curr.find('img').attr('width'),
						currH = curr.find('img').attr('height'),
						newW = curr.parents('.text-holder').width(),
						newH =  Math.floor(currH * newW / currW) - 1;
					console.log('');
					curr.find('div').css({
						'height': newH
					})		
 				});

				var offset = $('.single-intro .video-holder').outerHeight();
				if (noformat.windowW >= noformat.windowH * 0.85 * 16 / 9) {
					$('.single-intro .video-wrapper, .single-holder .images-list .video-wrapper').css({'width': '', 'marginLeft': ''})
//					$('.single-intro .video-holder, .single-holder .images-list .video-holder').css(noformat.transformSetter('0px' , -(offset - noformat.windowH * 0.85) / 2 + 'px'));
					$('.single-intro .video-holder').css(noformat.transformSetter('0px' , -(offset - noformat.windowH * 0.85) / 2 + 'px'));
				} else {
//					$('.single-intro .video-holder, .single-holder .images-list .video-holder').css(noformat.transformSetter('0px' , '0px'));
					$('.single-intro .video-holder').css(noformat.transformSetter('0px' , '0px'));
					$('.single-intro .video-wrapper').css({
						'width': noformat.windowH * 0.85 * 16 / 9,
						'marginLeft': (noformat.windowW - noformat.windowH * 0.85 * 16 / 9) / 2
					})
					if ($('html').hasClass('desktop')) {
						$('.single-holder .images-list .video-wrapper').css({
							'width': noformat.windowH * 0.85 * 16 / 9,
							'marginLeft': (noformat.windowW - noformat.windowH * 0.85 * 16 / 9) / 2
						})
					}
				}

				noformat.single.videoOffsets = [];

				$('.video-wrapper').each(function() {
					var curr = $(this),
						offset = noformat.scroll == null ? 0 : noformat.scroll.vars.current,
						textHolderOffset = curr.parents('.text-holder').length ? 300 : 0;
					noformat.single.videoOffsets.push({
						'top': curr.offset().top + offset - textHolderOffset,
						'height': curr.outerHeight()
					});
				});

				noformat.single.singleElementsOffsets = [];

				$('.animated').each(function() {
					var curr = $(this),
						scrollOffset = noformat.scroll == null ? 0 : noformat.scroll.vars.current;
					noformat.single.singleElementsOffsets.push({
						'top': curr.offset().top + scrollOffset - 150,
						'height': curr.outerHeight()
					});
				});

				if (noformat.scroll != null) {
					noformat.scroll.resize(); 			
					noformat.scroll.calc({ deltaX: 0, deltaY: 0 });
				}

			},
			init: function(element) {

			/* 
			+ Mobile and tablet scroll */

				if (!$('html').hasClass('desktop')) {
					// disable contact-btn on single-projects page
					$(window).scroll(function(){
						var disableContactClass = $('html').hasClass('tablet') ? 'disable-contact-btn' : 'disable-contact-btn-mobile';
						var $footer = $('.single-holder .contact-holder-updated');
						if ($footer.length > 0) {
							var footerOffset = $footer.offset().top;
							if(noformat.windowH + $(document).scrollTop() >= footerOffset){
								$('.nav-contact-link').addClass(disableContactClass);
							} else {
								$('.nav-contact-link').removeClass(disableContactClass);
							}
						}
					});
					noformat.mobileTabletHeader();			
				}

			/*
			+ Show intro image if there's no video */

				if (!$('.single-intro').find('.video-holder').length)
					$('.single-intro .bgr-holder').css('display', 'block')

			/*
			+ Initialize videos / videos' color */

/*
			+ Initialize videos / videos' color */

				noformat.single.players = vimeovideo.setup();

				if ($('html').hasClass('desktop')) {

					noformat.single.isManuallyPaused = [];


					for (var i = 0; i < noformat.single.players.length; i++) {
						noformat.single.players[i].on('ready', function(event) {
							var curr = $(this),
								currIndex = curr.parent().index('.video-wrapper');
							if (!event.detail.vimeovideo.isMuted()) event.detail.vimeovideo.toggleMute();
							if (curr.parents('.single-intro').length) {
								$('.single-intro .vimeovideo-play-large').css({ 'opacity': '0', 'visibility': 'hidden' })
								noformat.single.introVideoReady = true;
								if (noformat.single.contentReady) {
									event.detail.vimeovideo.play();
								}
							};
							if (currIndex == noformat.single.players.length - 1) {
								console.log('');
								noformat.single.resize();
							}
						});
						noformat.single.isManuallyPaused.push(false);
					}

				}
				if (noformat.single.players) {
					noformat.single.players[0].on('timeupdate', function() {
						if (noformat.single.players[0].getCurrentTime() > 0.1) {
							$('.single-intro .vimeovideo-play-large').css({ 'opacity': '', 'visibility': '' })
							if ($('.intro-video-spinner-holder').length)
								$('.intro-video-spinner-holder').fadeOut(300, function() {
									$(this).remove();
								})
						}
					});		
				}

//				$('.single-holder .single-intro, .single-holder .images-list li').css({'height': noformat.windowH * 0.85});

				var offset = $('.single-intro .video-holder').outerHeight();
				if (noformat.windowW >= noformat.windowH * 0.85 * 16 / 9) {
					$('.single-intro .video-wrapper, .single-holder .images-list .video-wrapper').css({'width': '', 'marginLeft': ''})
//					$('.single-intro .video-holder, .single-holder .images-list .video-holder').css(noformat.transformSetter('0px' , -(offset - noformat.windowH * 0.85) / 2 + 'px'));
					$('.single-intro .video-holder').css(noformat.transformSetter('0px' , -(offset - noformat.windowH * 0.85) / 2 + 'px'));
				} else {
//					$('.single-intro .video-holder, .single-holder .images-list .video-holder').css(noformat.transformSetter('0px' , '0px'));
					$('.single-intro .video-holder').css(noformat.transformSetter('0px' , '0px'));
					$('.single-intro .video-wrapper').css({
						'width': noformat.windowH * 0.85 * 16 / 9,
						'marginLeft': (noformat.windowW - noformat.windowH * 0.85 * 16 / 9) / 2
					})
					if ($('html').hasClass('desktop')) {
						$('.single-holder .images-list .video-wrapper').css({
							'width': noformat.windowH * 0.85 * 16 / 9,
							'marginLeft': (noformat.windowW - noformat.windowH * 0.85 * 16 / 9) / 2
						})
					}
				}

			/* 
			+ Discover more and back to top buttons */

				$('.top-btn').click(function(e) {
					e.preventDefault();
					$('html').hasClass('desktop') ?
						noformat.scroll.scrollTo(0) :
						$('html, body').stop().animate({
							scrollTop: 0
						}, 2000)
					$('header').removeClass('header-up');
				});

			/* 
			+ Text alignment | Videos' / Images' width / offset  */

				$('.text-holder').children().each(function() {
					var curr = $(this);
					if (curr.css('text-align') == 'right') {
						curr.css({
							'float': 'right',
							'textAlign': 'left'
						});
					}
					if (curr.is('.project-tags')) {
						if ($('html').hasClass('mobile')) {
							var previous = curr.prevAll().last(),
								clonedTags = curr.clone(true, true);
							curr.remove();
							clonedTags.insertAfter(previous);
							clonedTags.css('float', 'right').prevAll().last().css({
								'float': 'left', 
								'clear': 'both'
							});
						} else {
							var previous = curr.prevAll().first();
							if (previous.css('float') == 'right') {
								var clonedTags = curr.clone(true, true);
								curr.remove();
								previous.css({
									'float': 'right', 
									'clear': 'right',
									'marginBottom': '0px'
								});
								clonedTags.insertBefore(previous).css({'float': 'left', 'clear': 'both'});
							} else {
								curr.css('float', 'right').prevAll().first().css({
									'float': 'left', 
									'clear': 'both',
									'marginBottom': '0px'
								});
							}							
						}
					}
					if (curr.children().length == 1 && (curr.children().is('img') || curr.children().is('video'))) {
						curr.css('width', '100%');
						if (curr.children().is('img')) {
							var currW = curr.children('img').attr('width'),
								currH = curr.children('img').attr('height'),
								newW = curr.parents('.text-holder').width(),
								newH =  Math.floor(currH * newW / currW) - 1;
							console.log('')
							curr.css('margin-bottom', '0px').children().wrap('<div class="img-holder"><div /></div>');
							curr.find('.img-holder div').css({
								'height': newH,
								'background' : '#eeeeee'
							})		
						}
					}
					if (curr.is('p')) curr.filter(function () { return $.trim(this.innerHTML) == "" }).remove();
					curr.addClass('animated');
 				});

 				this.calculations();

			/* 
			+ Scrolling animations  */

				var raf;

				if (typeof raf == 'undefined') scrollingAnimation();

		        function scrollingAnimation() {
		        	if ($('html').hasClass('desktop') && !$('body').hasClass('page-template-page-work') && noformat.scroll != null && Math.abs(noformat.scroll.vars.current - noformat.scroll.vars.target) >= 1) {	
		        		if (noformat.scroll.vars.current < noformat.windowH) {
		        			if ($('.single-intro .video-wrapper').length) {
	 			        		$('.single-intro .video-wrapper').css(noformat.transformSetter('0px' , noformat.scroll.vars.current + 'px'));
			        			$('.single-intro .vimeovideo-play-large').css(noformat.transformSetter('-50%' , -noformat.scroll.vars.current + 'px'));
			        			$('.single-intro .vimeovideo-controls').css(noformat.transformSetter('0px' , -noformat.scroll.vars.current + 'px'));
			        		} else {
			        			$('.single-intro .bgr-holder').css(noformat.transformSetter('0px' , noformat.scroll.vars.current + 'px'));
			        		}
		    	    		var opacity = noformat.scroll.vars.current / noformat.windowH * 2;
		        			$('.single-intro article').css(noformat.transformSetter('-50%' , -noformat.scroll.vars.current * 0.25 + 'px')).css('opacity', 1 - opacity);
		    	    	}

						if (noformat.scroll.vars.current > 100) {
							$('header').addClass('sticky-header');
							noformat.scroll.vars.current < noformat.scroll.vars.target && !$('header').hasClass('opened') ?
								$('header').css('margin-top', '-150px') :
								$('header').css('margin-top', '0px');
						} else {
							$('header').removeClass('sticky-header');
                            if($('body').hasClass('single-post')) {
                            }
                            
						}

						if(noformat.single.players) {
							$('.video-wrapper').each(function(i) {
								var curr = $(this);
								if (noformat.scroll.vars.current >= noformat.single.videoOffsets[i].top - noformat.windowH && 
									noformat.scroll.vars.current < noformat.single.videoOffsets[i].top + noformat.single.videoOffsets[i].height) {
									if (noformat.single.players[i].isPaused() && !noformat.single.isManuallyPaused[i]) noformat.single.players[i].play();
								} else if (!noformat.single.players[i].isPaused()) {
									noformat.single.players[i].pause();
								}
							});
					    }

						$('.animated').each(function(i) {
							var curr = $(this);
							noformat.single.singleElementsOffsets[i].top - noformat.scroll.vars.current < noformat.windowH ?
						       	curr.addClass('inview') :
				   				curr.removeClass('inview');
						});		

						if (!$('body').hasClass('scrolling')) $('body').addClass('scrolling');

						// disabling contact-btn on desktop single-projects-page
						var $footer = $('.single-holder .contact-new');
						var footerOffset = $footer.position().top;
						if(noformat.windowH + noformat.scroll.vars.current >= footerOffset){
							$('.nav-contact-link').addClass('disable-contact-btn');
						} else {
							$('.nav-contact-link').removeClass('disable-contact-btn');
						}


		
		        	} else {

		        		if ($('body').hasClass('scrolling')) $('body').removeClass('scrolling');

		        	}

	            	raf = requestAnimationFrame(scrollingAnimation);

		       	};		

		    },
		    resize: function() {

				if (noformat.single.resizeTimeout != null) {
					clearTimeout(noformat.single.resizeTimeout);
					noformat.single.resizeTimeout = null;
				}

				noformat.single.resizeTimeout = setTimeout(function() {

					noformat.single.calculations();

				}, 500);

		    }

		},

        news: {
            init: function(element) {

				// on load
				var matches = location.hash.match( /([^&]+)/i );
				var hashFilter = matches ? matches[1] : '#all';
				let tag = hashFilter && decodeURIComponent( hashFilter );
				tag = tag.slice(1);
				let tags = $('.blog-category-content').data('tags');
				let load = $('.blog-category-content').data('load');
				
				$(`.filters a`).removeClass('is-checked');
				let filter = $(`.filters a[data-filter="${tag}"]`);
				filter.addClass('is-checked');
				$('.filters-trigger').text(filter.text());

				$.ajax({
					type: 'POST', url: ajaxurl, data: {
						action: 'load_more',
						load: load,
						tag_in: tags,
						tag: tag,
					}, beforeSend: function () {
						$('.loader').addClass('active');
					}, success: function (response) {
						$('.blog-category-content').html(response);
						var posts_sum = $('.blog-category-content article').data('sum');
						var current_posts = $('.blog-category-content article').length;

						if (current_posts >= posts_sum) {
							$(".load-more").hide();
						} else {
							$(".load-more").show();
						}
					}, complete: function () {
						$('.loader').removeClass('active');
					},
				});



				if (typeof raf == 'undefined') scrollingAnimation();
                function scrollingAnimation() {
		        	if ($('html').hasClass('desktop') && !$('body').hasClass('page-template-page-work') && noformat.scroll != null && Math.abs(noformat.scroll.vars.current - noformat.scroll.vars.target) >= 1) {	
						if (noformat.scroll.vars.current > 100) {
							$('header').addClass('sticky-header');
							noformat.scroll.vars.current < noformat.scroll.vars.target && !$('header').hasClass('opened') ?
								$('header').css('margin-top', '-150px') :
								$('header').css('margin-top', '0px');
						} else {
							$('header').removeClass('sticky-header');
						}

						$('.animated').each(function(i) {
							var curr = $(this);
							noformat.single.singleElementsOffsets[i].top - noformat.scroll.vars.current < noformat.windowH ?
						       	curr.addClass('inview') :
				   				curr.removeClass('inview');
						});		

						if (!$('body').hasClass('scrolling')) $('body').addClass('scrolling');

                        // disabling contact-btn on desktop news-page
                        var $footer = $('.single-holder .contact-new');
						var footerOffset = $footer.offset().top;
						if(noformat.windowH + noformat.scroll.vars.current >= footerOffset){
							$('.nav-contact-link').addClass('disable-contact-btn');
						} else {
							$('.nav-contact-link').removeClass('disable-contact-btn');
						}

		        	} else {
		        		if ($('body').hasClass('scrolling')) $('body').removeClass('scrolling');
		        	}

	            	raf = requestAnimationFrame(scrollingAnimation);

		       	};
                
				$('.filters-trigger').click(function(e) {
					e.preventDefault();
					$(this).parent().toggleClass('active')
				})

				// ON FILTER CHANGE
				$('.filters').on('click', 'a', function(e) {
					e.preventDefault();
					var curr = $(this);
					if (!curr.hasClass('is-checked')) {
						var filterValue = curr.attr('data-filter');
						history.pushState(null,null,'#' + filterValue);
	
						curr.parents('ul').find('a').removeClass('is-checked');
						curr.addClass('is-checked');
						$('.filters-trigger').text(curr.text()).trigger('click');

						let tag = $(this).data('filter');
						let tags = $('.blog-category-content').data('tags');
						let load = $('.blog-category-content').data('load');

						$.ajax({
							type: 'POST', url: ajaxurl, data: {
								action: 'load_more',
								load: load,
								tag_in: tags,
								tag: tag,
							}, beforeSend: function () {
								$('.loader').addClass('active');
							}, success: function (response) {
								
								$('.blog-category-content').html(response);

								var posts_sum = $('.blog-category-content article').data('sum');
								var current_posts = $('.blog-category-content article').length;

								if (current_posts >= posts_sum) {
									$(".load-more").hide();
								} else {
									$(".load-more").show();
								}
							}, complete: function () {
								$('.loader').removeClass('active');
							},
						});

  					}
				});

                var scrollableElement = $('html').hasClass('tablet') ? window : document.body;
                var $dialogContact = $('.contact-dialog-wrapper .contact-new');
                var lastDistanceFromTop = $(scrollableElement).scrollTop();
                var navbarHeight = $('header').outerHeight();
                $(scrollableElement).on('scroll', function(e) {

                    if(!$('html').hasClass('desktop')) {
                        var distanceFromTop = $(scrollableElement).scrollTop();
                        if (Math.abs(lastDistanceFromTop - distanceFromTop) > 2) {
                            if (distanceFromTop > lastDistanceFromTop && lastDistanceFromTop > navbarHeight) {
                                $('header').addClass('header-up');
                            } else {
                                if (distanceFromTop + $(window).height() < $(document).height()) {
                                    $('header').removeClass('header-up');
                                }
                            }
                            lastDistanceFromTop = distanceFromTop;
                        }
                    }


                    if (($('html').hasClass('mobile') || $('body').hasClass('category-news') || $('body').hasClass('category-awards') ) || ($('html').hasClass('tablet') && !$('body').hasClass('page-template-page-about') && !$('body').hasClass('page-template-page-work'))) {
                        if(distanceFromTop > 0) {
                            $('header').addClass('sticky-header');
                        } else {
                            $('header').removeClass('sticky-header');
                        }
                    }

                     // disable contact-btn on mobile news-page
                    var disableContactClass = $('html').hasClass('tablet') ? 'disable-contact-btn' : 'disable-contact-btn-mobile';
                    var $footer = $('.contact-new').not($dialogContact);
                    if ($footer.length > 0) {
                        var footerOffset = $footer.position().top;
                        if($(scrollableElement).scrollTop() + noformat.windowH > footerOffset){
                            $('.nav-contact-link').addClass(disableContactClass);
                        } else {
                            $('.nav-contact-link').removeClass(disableContactClass);
                        }
                    }
                });
            },

            resize: function() { 
                if (noformat.scroll != null) {
                    noformat.scroll.resize(); 			
                    noformat.scroll.calc({ deltaX: 0, deltaY: 0 });
                }
            }
        },

        awards: {
            init: function(element) {
                $('header').addClass('light');
				if (typeof raf == 'undefined') scrollingAnimation();

                function scrollingAnimation() {
		        	if ($('html').hasClass('desktop') && !$('body').hasClass('page-template-page-work') && noformat.scroll != null && Math.abs(noformat.scroll.vars.current - noformat.scroll.vars.target) >= 1) {	
						if (noformat.scroll.vars.current > 100) {
							$('header').addClass('sticky-header');
							noformat.scroll.vars.current < noformat.scroll.vars.target && !$('header').hasClass('opened') ?
								$('header').css('margin-top', '-150px') :
								$('header').css('margin-top', '0px');
						} else {
							$('header').removeClass('sticky-header');
						}

						$('.animated').each(function(i) {
							var curr = $(this);
							noformat.single.singleElementsOffsets[i].top - noformat.scroll.vars.current < noformat.windowH ?
						       	curr.addClass('inview') :
				   				curr.removeClass('inview');
						});		

						if (!$('body').hasClass('scrolling')) $('body').addClass('scrolling');

                        // disabling contact-btn on desktop news-page
                        var $footer = $('.awards-holder .contact-new');
						var footerOffset = $footer.offset().top;
						if(noformat.windowH + noformat.scroll.vars.current >= footerOffset){
							$('.nav-contact-link').addClass('disable-contact-btn');
						} else {
							$('.nav-contact-link').removeClass('disable-contact-btn');
						}

		        	} else {

		        		if ($('body').hasClass('scrolling')) $('body').removeClass('scrolling');

		        	}

	            	raf = requestAnimationFrame(scrollingAnimation);

		       	};
                


                $('.blog-filters').on('click', 'a', function(e) {
                    e.preventDefault();
                    $('.blog-filters a').removeClass('is-checked');
                    $(e.target).toggleClass('is-checked');
                    var targetCategory = $(e.target).data('filter');
                    var $items = $('.item');
                    if (targetCategory === '*') {
                        $items.show();
                    } else {
                        $items.hide();
                        $items.filter('.' + targetCategory).show();
                    }
                });

                var scrollableElement = $('html').hasClass('tablet') ? window : document.body;

                var $dialogContact = $('.contact-dialog-wrapper .contact-new');
                var lastDistanceFromTop = $(scrollableElement).scrollTop();
                var navbarHeight = $('header').outerHeight();
                $(scrollableElement).on('scroll', function(e) {

                    if(!$('html').hasClass('desktop')) {
                        var distanceFromTop = $(scrollableElement).scrollTop();
                        if (Math.abs(lastDistanceFromTop - distanceFromTop) > 2) {
                            if (distanceFromTop > lastDistanceFromTop && lastDistanceFromTop > navbarHeight) {
                                $('header').addClass('header-up');
                            } else {
                                if (distanceFromTop + $(window).height() < $(document).height()) {
                                    $('header').removeClass('header-up');
                                }
                            }
                            lastDistanceFromTop = distanceFromTop;
                        }
                    }


                    if (($('html').hasClass('mobile') || $('body').hasClass('category-news')) || ($('html').hasClass('tablet') && !$('body').hasClass('page-template-page-about') && !$('body').hasClass('page-template-page-work'))) {
                        if(distanceFromTop > 0) {
                            $('header').addClass('sticky-header');
                        } else {
                            $('header').removeClass('sticky-header');
                        }
                    }

                     // disable contact-btn on mobile news-page
                    var disableContactClass = $('html').hasClass('tablet') ? 'disable-contact-btn' : 'disable-contact-btn-mobile';
                    var $footer = $('.contact-new').not($dialogContact);
                    if ($footer.length > 0) {
                        var footerOffset = $footer.position().top;
                        if($(scrollableElement).scrollTop() + noformat.windowH > footerOffset){
                            $('.nav-contact-link').addClass(disableContactClass);
                        } else {
                            $('.nav-contact-link').removeClass(disableContactClass);
                        }
                    }
                });
            },

            resize: function() { 
                if (noformat.scroll != null) {
                    noformat.scroll.resize(); 			
                    noformat.scroll.calc({ deltaX: 0, deltaY: 0 });
                }
            }
        },
		contact: {

			init: function(element) {

			/* 
			+ Mobile and tablet scroll */

				if ($('html').hasClass('mobile')) noformat.mobileTabletHeader();

			}

		},
		work: {
			grid: null,
			calculations: function() {
			/*
			+ Grid items' height */

				// $('.work-grid .item').each(function() {
				// 	var currW = $(this).width();
				// 	$(this).css('height', currW * 0.6)
				// });

			/*
			+ Recalculate scrollbar and grid */

				this.grid.isotope('layout');


				this.grid.on('layoutComplete', function(event, filteredItems) {
					if (noformat.scroll != null && $('html').hasClass('desktop')) {
						noformat.scroll.resize(); 			
						noformat.scroll.calc({ deltaX: 0, deltaY: 0 });
						noformat.parallaxOffsets = [];
			            $('.grid .item span').each(function(i) {
			                var curr = $(this);
			                var currParam = {
			                    top: curr.offset().top + noformat.scroll.vars.current,
			                    height: curr.outerHeight()
			                };
			                noformat.parallaxOffsets.push(currParam)
			            });
			            $('.grid .item span').each(function(i) {
			               noformat.parallaxPosition($(this), i);
			            });						
					} else if (!$('html').hasClass('desktop')) {
						noformat.parallaxOffsets = [];
			            $('.grid .item span').each(function(i) {
			                var curr = $(this);
			                var currParam = {
			                    top: curr.offset().top + $(window).scrollTop(),
			                    height: curr.outerHeight()
			                };
			                noformat.parallaxOffsets.push(currParam)
			            });						
			            $('.grid .item span').each(function(i) {
			               noformat.parallaxPosition($(this), i);
			            });						
					}
				});

			/*
			+ Filters width */

				// if ($('html').hasClass('mobile')) {

				// 	var visibleItems = 0;

				// 	for (var i = 0; i < 4; i++) {
				// 		var currOffset = i == 3 ? 2 : 1;
				// 		visibleItems += $('.filters li').eq(i).outerWidth() / currOffset;
				// 	}

				// 	var currMargin = (noformat.windowW - visibleItems) / 9;
				// 	$('.filters li').css({'margin': '0px ' + currMargin + 'px'})

				// 	var filtersW = 0;
				// 	$('.filters li').each(function() {
				// 		filtersW += $(this).outerWidth(true) + 3;
				// 	})
				// 	$('.filters').css('width', filtersW);

				// }				

			/*
			+ Parallax calculations */

				if (noformat.scroll != null && $('html').hasClass('desktop')) {
					noformat.parallaxOffsets = [];
		            $('.grid .item span').each(function(i) {
		                var curr = $(this);
		                var currParam = {
		                    top: curr.offset().top + noformat.scroll.vars.current,
		                    height: curr.outerHeight()
		                };
		                noformat.parallaxOffsets.push(currParam)
		            });
		            $('.grid .item span').each(function(i) {
		               noformat.parallaxPosition($(this), i);
		            });
		        } else if (!$('html').hasClass('desktop')) {
		            $('.grid .item span').each(function(i) {
		                var curr = $(this);
		                var currParam = {
		                    top: curr.offset().top + $(window).scrollTop(),
		                    height: curr.outerHeight()
		                };
		                noformat.parallaxOffsets.push(currParam)
		            });						
		            $('.grid .item span').each(function(i) {
		               noformat.parallaxPosition($(this), i);
		            });
				}

			},
			init: function(element) {
			/*
			+ Parallax speed / orientation */
				$('.item.heineken .layer-two').data('speed', '-0.05');
				$('.item.grand-marnier .layer-two').data('speed', '0');
				$('.item.grand-marnier .layer-three').data('speed', '-0.05');
				$('.item.the-assemblage .layer-one').data('speed', '0');
				$('.item.the-assemblage .layer-two').data('speed', '-0.05');
				$('.item.discover-your-city .layer-one').data('speed', '-0.1');
				$('.item.discover-your-city .layer-three').data('speed', '-0.05');
				$('.item.longo-park .layer-three').data('speed', '-0.05');
				$('.item.think-global-school .layer-two').data('speed', '0.05');
				$('.item.think-global-school .layer-one').data('speed', '0.1');
                $('.item.paattern-energy .layer-two').data('speed', '-0.1');
                $('.item.paattern-energy .layer-one').data('speed', '0');
                $('.item.prodigy-network-associates .layer-one').data('speed', '-0.1');
                $('.item.cloudforce .layer-one').data('speed', '-0.1');
                $('.item.cloudforce .layer-two').data('speed', '-0.05');
                $('.item.tarsadia .layer-two').data('speed', '0.1');
                $('.item.tarsadia .layer-one').data('speed', '-0.05');
                
			/* 
			+ Mobile and tablet scroll */
				if (!$('html').hasClass('desktop')) {
					noformat.mobileTabletHeader();			
				}
			/* 
			+ Scrolling animations  */
				var raf;
				if (typeof raf == 'undefined') scrollingAnimation();
				var currDistanceFromTop = $(window).scrollTop(),
					oldDistanceFromTop = 0;

		        function scrollingAnimation() {
                    
					var $footer = $('.work-page-footer-section');
					if (
						($('html').hasClass('desktop') || $('html').hasClass('tablet')) && 
						noformat.scroll != null && 
						Math.abs(noformat.scroll.vars.current - noformat.scroll.vars.target) >= 1 &&
						$footer.length > 0
					) {

                        if (noformat.scroll.vars.current > 20) {
                        $('header').addClass('sticky-header');
                        noformat.scroll.vars.current < noformat.scroll.vars.target && !$('header').hasClass('opened') ?
                            $('header').css('margin-top', '-150px') :
                            $('header').css('margin-top', '0px');
                        } else {
                        $('header').removeClass('sticky-header');
                        }
						// disabling contact-btn on desktop work-page
						var footerOffset = $footer.offset().top;
						if(noformat.windowH + $(document).scrollTop() >= footerOffset){
							$('.nav-contact-link').addClass('disable-contact-btn');
						} else {
							$('.nav-contact-link').removeClass('disable-contact-btn');
						}
						
		        	    $('.grid .item span').each(function(i) {
                            var curr = $(this);
                            if (noformat.parallaxOffsets[i].top - noformat.scroll.vars.current < noformat.windowH &&
                                noformat.scroll.vars.current - (noformat.parallaxOffsets[i].top + noformat.parallaxOffsets[i].height) <= 0) {
                                noformat.parallaxPosition(curr, i);
                            }
                        });
					}

	            	raf = requestAnimationFrame(scrollingAnimation);

		       	};	

		       	if (!$('html').hasClass('desktop')) {
					var disableContactClass = $('html').hasClass('tablet') ? 'disable-contact-btn' : 'disable-contact-btn-mobile';
		       		$(window).scroll(function() {
						//    disabling contact-btn on mobile work-page
						var $footer = $('.work-page-footer-section');
						if ($footer.length > 0) {
							var footerOffset = $footer.offset().top;
							if(noformat.windowH + $(document).scrollTop() >= footerOffset){
								$('.nav-contact-link').addClass(disableContactClass);
							} else {
								$('.nav-contact-link').removeClass(disableContactClass);
							}
						}
                        if ($(document).scrollTop() > 100) {
                            $('header').addClass('sticky-header');
                            $(document).scrollTop() < 50 && !$('header').hasClass('opened') ?
								$('header').css('margin-top', '-150px') :
								$('header').css('margin-top', '0px');
                            } else {
                            $('header').removeClass('sticky-header');
                        }

		        	    $('.grid .item span').each(function(i) {
                            var curr = $(this);
                            if (noformat.parallaxOffsets[i].top - currDistanceFromTop < noformat.windowH &&
                                currDistanceFromTop - (noformat.parallaxOffsets[i].top + noformat.parallaxOffsets[i].height) <= 0) {
                                noformat.parallaxPosition(curr, i);
                            }
                        });			
		       		});
		       	}

			/*
			+ Work grid | layout and filtering */

				var initialItems = 20;
				let allLoadedCount;
				let brandingLoadedCount;
				let appLoadedCount;
				let websiteLoadedCount;
				let socialLoadedCount;

				$('.filters-trigger').click(function(e) {
					e.preventDefault();
					$(this).parent().toggleClass('active')
				})

				// INIT ISOTOPE
				this.grid = $('.work-grid .grid').isotope({
  					itemSelector: '.item',
					stamp: '.stamp'  					
				});

				function onHashchange() {
					var hash = getHashFilter();

					if (hash == '#all' && allLoadedCount) {
						hideItems(allLoadedCount);
					} else if (hash == '#branding' && brandingLoadedCount) {
						hideItems(brandingLoadedCount);
					} else if (hash == '#app' && appLoadedCount) {
						hideItems(appLoadedCount);
					} else if (hash == '#website' && websiteLoadedCount) {
						hideItems(websiteLoadedCount);
					} else if (hash == '#social' && socialLoadedCount) {
						hideItems(socialLoadedCount);
					} else {
						hideItems(initialItems);
					}

					if ($('.filters-holder').hasClass('active')) {
						$('.filters-trigger').trigger('click');
					}
					
					if (hash) {
						hash = hash.slice(1);
						if (hash != 'all') {
							noformat.work.grid.isotope({ filter: '.' + hash });
							let text = $(`a[data-filter="${hash}"]`).text();
							$('ul.filters a').removeClass('is-checked');
							$(`a[data-filter="${hash}"]`).addClass('is-checked');
							$('.filters-trigger').text(text);
						} else {
							noformat.work.grid.isotope({ filter: '*' });
						}
					}
				}

				function getHashFilter() {
					var matches = location.hash.match( /([^&]+)/i );
					var hashFilter = matches && matches[1];
					return hashFilter && decodeURIComponent( hashFilter );
				  }
			
				function hideItems(pagination) {
					$(`.item`).each(function () {
						if ($(this).hasClass('hidden_item')) {
							$(this).removeClass('hidden_item');
						}
					});

					let filter = getHashFilter();

					if (filter == '#all' || !filter) {
						var itemsCount = 0;
						$(`.item`).each(function () {
							if (itemsCount >= pagination) {
								$(this).addClass('hidden_item');
							} else {
								itemsCount++;
							}
						});
					} else {
						var itemsCount = 0;
						$(`.item.${filter.slice(1)}`).each(function () {
							if (itemsCount >= pagination) {
								$(this).addClass('hidden_item');
							} else {
								itemsCount++;
							}
						});
					}

					let allCount;
					let visibleCount;
					if (filter == '#all' || !filter) {
						allCount = $(`.item`).length;
						visibleCount = $(`.item:not(.hidden_item)`).length;
					} else {
						allCount = $(`.item.${filter.slice(1)}`).length;
						visibleCount = $(`.item.${filter.slice(1)}:not(.hidden_item)`).length;
					}

					if (visibleCount >= allCount) {
						$('#showMore').hide();
					} else {
						$('#showMore').show();
					}
				}

				// ON FILTER CHANGE
				$('.filters').on('click', 'a', function(e) {
					e.preventDefault();
					var curr = $(this);
					if (!curr.hasClass('is-checked')) {
						var filterValue = curr.attr('data-filter');
						history.pushState(null,null,'#' + filterValue);

						if (filterValue != 'all') {
							$(`.item.${filterValue}`).removeClass('hidden_item');
						}
						
						if (filterValue == 'all') {
							curr.parents('ul').find('a').removeClass('is-checked');
							curr.addClass('is-checked');
							$('.filters-trigger').text(curr.text()).trigger('click');
						}
						onHashchange();
  					}
				});

				// LOAD MORE
				document.querySelector('#showMore').addEventListener('click', loadMore.bind(this));
				function loadMore(e) {
					e.preventDefault();
					let currentFilter = getHashFilter();
					
					if (currentFilter == '#all' || !currentFilter) {
						$(`.item.hidden_item:lt(${initialItems})`).each(function () {
							$(this).removeClass('hidden_item');
						});
					} else {
						$(`.item.${currentFilter.slice(1)}.hidden_item:lt(${initialItems})`).each(function () {
							$(this).removeClass('hidden_item');
					});
					}

					// this.grid = $('.work-grid .grid').isotope({
					// 	itemSelector: '.item',
					//   	stamp: '.stamp'  					
				  	// });

					let allCount;
					let visibleCount;
					if (currentFilter == '#all' || !currentFilter) {
						allCount = $(`.item`).length;
						visibleCount = $(`.item:not(.hidden_item)`).length;
					} else {
						allCount = $(`.item.${currentFilter.slice(1)}`).length;
						visibleCount = $(`.item.${currentFilter.slice(1)}:not(.hidden_item)`).length;
					}
					
					if (currentFilter == '#all' || !currentFilter) {
						allLoadedCount = visibleCount;
					} else if (currentFilter == '#branding') {
						brandingLoadedCount = visibleCount;
					} else if (currentFilter == '#app') {
						appLoadedCount = visibleCount;
					} else if (currentFilter == '#website') {
						websiteLoadedCount = visibleCount;
					} else if (currentFilter == '#social') {
						socialLoadedCount = visibleCount;
					}

					if (visibleCount >= allCount) {
					$('#showMore').hide();
					}

					this.grid = $('.grid').isotope( 'layout' );

					window.dispatchEvent(new Event('resize'));
				}

				onHashchange();
				  

			},
			resize: function() {

				this.calculations();

			}
		},
		mobileTabletHeader: function() {
			var distanceFromTop = $(window).scrollTop(),
				didScroll,
				lastScrollTop = 0,
				delta = 2,
				navbarHeight = $('header').outerHeight();
	

			if (noformat.handheldScrollInterval != null) {
				clearInterval(noformat.handheldScrollInterval);
				noformat.handheldScrollInterval = null;
			}

			var scrollableElement = $('body').hasClass('home') ? document.body : window;

			noformat.handheldScrollInterval = setInterval(function() {
				if (didScroll && !$('header').hasClass('opened')) {
					hasScrolled();
					didScroll = false;
				}
			}, 10);
			
			function hasScrolled() {
				var st = $(scrollableElement).scrollTop();
				if (Math.abs(lastScrollTop - st) <= delta) return;
				if (st > lastScrollTop && st > navbarHeight) {
					$('header').addClass('header-up');
				} else {
					if (st + $(window).height() < $(document).height()) {
						$('header').removeClass('header-up');
					}
				}
				lastScrollTop = st;
			};

			$('header').removeClass('header-up sticky-header');

			$(scrollableElement).on('scroll', function(e) {
				if (($('html').hasClass('mobile') || $('body').hasClass('category-news')) || ($('html').hasClass('tablet') && !$('body').hasClass('page-template-page-about') && !$('body').hasClass('page-template-page-work'))) {
					distanceFromTop = $(scrollableElement).scrollTop();
					// distanceFromTop > 0 ?
					// 	$('header').addClass('sticky-header light') :
					// 	$('header').removeClass('sticky-header light');
					
					// make menu to be light on mobile
					if(distanceFromTop > 0) {
						$('header').addClass('sticky-header light');
					} else {
						$('header').removeClass('sticky-header');
						if(!$('body').hasClass('home') && !$('body').hasClass('single-projects')) {
							$('header').removeClass('light');
						}
					}
					didScroll = true;
				}
			});	

		},		
		resize: function() {

			if (this.windowW != $(window).width() || $('html').hasClass('desktop')) {

				if (noformat.resizeTimeout != null) {
					clearTimeout(noformat.resizeTimeout);
					noformat.resizeTimeout = null;
				}

				this.windowW = viewport().width;
				this.windowH = $(window).height();

				noformat.resizeTimeout = setTimeout(function() {

					if ($(window).height() < 750) {
						$('html').addClass('lower-height');
					} else if ($(window).height() < 900) {
						$('html').addClass('low-height');			
					} else {
						$('html').removeClass('low-height').removeClass('lower-height');
					}

					var navPaddingR = noformat.windowW - $('.nav-trigger').offset().left + 80,
						navPadding = navPaddingR + parseInt($('nav').css('padding-left')),
						navPW = $('nav').find('p').width();
					$('nav').css({
						'paddingRight': navPaddingR,
						'minWidth': navPadding + navPW
					});

					if ($('body').hasClass('single')) {noformat.single.resize();}
					else if ($('body').hasClass('home')) {noformat.home.resize();}
					else if ($('body').hasClass('page-template-page-work')) {noformat.work.resize();}
                    else if ($('body').hasClass('category-news')) {noformat.news.resize();
                    }

					clearTimeout(noformat.resizeTimeout);
					noformat.resizeTimeout = null;

				}, 500);

			}

		}

	};


	/* 
	+ Navigation trigger */

		$('body').on('click', '.nav-trigger', function(e) {
			e.preventDefault();
			var closingTimeout = null;
			if (!$('header').hasClass('opened')) {
				if (closingTimeout != null) clearTimeout(closingTimeout);
				$('header').css({
					'-webkit-transform': 'none',
					'-moz-transform': 'none',
					'transform': 'none',
					'-webkit-transition': 'none',
					'-moz-transition': 'none',
					'transition': 'none'
				})
			} else {
				closingTimeout = setTimeout(function() {
					$('header').css({
						'-webkit-transform': '',
						'-moz-transform': '',
						'transform': '',
						'-webkit-transition': '',
						'-moz-transition': '',
						'transition': ''
					})
					clearTimeout(closingTimeout)
				}, 500)
			}
			$('header').hasClass('opened') ? 
				$(this).text('menu.') : 
				$(this).text('close.');
			$('header').toggleClass('opened');
			$('header').hasClass('opened') ?
 				$('.nav-overlay').stop().fadeIn(500) :
				$('.nav-overlay').stop().fadeOut(500);
		});

		$('.nav-overlay').click(function(e) {
			if ($('header').hasClass('opened'))
				$('.nav-trigger').trigger('click');
		});

	/* 
	+ Window resize */

		$(window).resize(function() {
			noformat.resize();
		});

		$(window).scroll(function(){
			$('.grid').isotope( 'layout' );
		});

/*
= THE EYE
-------------------------------------------------------------------------------------- */

	var mouseX = 0, 
        mouseY = 0,
        mouseX1 = 0,
        mouseY1 = 0,
        innerEyeRenderer = null,
        outerEyeRenderer = null,
        reqAnim;

    function eyeInit() {

    /*
    + Setting up scenes and renderers */

        var sceneBG = new THREE.Scene(),
            innerEyeScene = new THREE.Scene(),
            outerEyeScene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 3000 );
        camera.position.z = 78;
        camera.target = new THREE.Vector3( 0, 0, 0 );

        outerEyeRenderer = new THREE.WebGLRenderer({alpha: true});
        outerEyeRenderer.setClearColor(0x000000, 0.0);
        outerEyeRenderer.autoClear = false;
        outerEyeRenderer.setSize(window.innerWidth, window.innerHeight);

        innerEyeRenderer = new THREE.WebGLRenderer({alpha: true});
        innerEyeRenderer.setClearColor(0x000000, 0.0);
        innerEyeRenderer.autoClear = false;
        innerEyeRenderer.setSize(window.innerWidth, window.innerHeight);

        document.getElementById('outer-eye').appendChild(outerEyeRenderer.domElement);
        document.getElementById('inner-eye').appendChild(innerEyeRenderer.domElement);

        var clock = new THREE.Clock();

        var ambi = new THREE.AmbientLight(0xffffff);
        innerEyeScene.add(ambi);
        outerEyeScene.add(ambi);

        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('resize', onResize, false);
        window.addEventListener('deviceorientation', onDeviceOrientation, false);

        function onMouseMove(e) {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
            mouseX1 = (e.clientX - window.innerWidth / 2) * 0.0005;
            mouseY1 = (e.clientY - window.innerHeight / 2) * 0.0005;
            // ambientSound.position.x = (e.clientX - window.innerWidth / 2) * 0.2;
            // ambientSound.position.y = (e.clientY - window.innerHeight / 2) * 0.4;
        }

        function onResize() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
			if (outerEyeRenderer && innerEyeRenderer) {
				outerEyeRenderer.setSize(width, height);
				innerEyeRenderer.setSize(width, height);
			}
        }

        var orientationStatus = 0,
            startingPoint = {x: 0, y: 0};

        function onDeviceOrientation(e) {
            if ($('html').hasClass('tablet') && $('html').hasClass('landscape')) {
                var x = (e.beta || 0) / 90,
                    y = (e.gamma || 0) / 90;
                mouseY = y * 0.2;
                mouseY1 = y * 0.2;
                mouseX = x * 0.2;
                mouseX1 = x * 0.2;
                console.log(e.beta)
            } else {
                var y = (e.beta || 0) / 90,
                    x = (e.gamma || 0) / 90;
                mouseY = y * 0.2;
                mouseY1 = y * 0.2;
                mouseX = x * 0.2;
                mouseX1 = x * 0.2;
            }
            // if (!orientationStatus) {
            //     startingPoint.y = e.beta;
            //     startingPoint.x = e.gamma;
            //     orientationStatus = 1;
            // }
            // mouseX = (startingPoint.x - e.gamma) * 0.0065;
            // mouseX1 = (startingPoint.x - e.gamma) * 0.0065;
            // mouseY = (startingPoint.y - e.beta) * 0.0045;
            // mouseY1 = (startingPoint.y - e.beta) * 0.0045;
        };

    /*
    + Setting up ambiental sound */

        /*
        + !!!!!!!! THIS IS KLLING TABLET AND MOBILE !!!!!!!! */

        // if ($('html').hasClass('desktop')) {

        //     var listener = new THREE.AudioListener();
        //     camera.add(listener);
        //     ambientSound = new THREE.PositionalAudio(listener);
        //     innerEyeScene.add(ambientSound);

        //     var loader = new THREE.AudioLoader();
        //     loader.load(
        //         themeUrl + '/assets/audio/sample.mp3',
        //         function ( audioBuffer ) {
        //             ambientSound.setBuffer(audioBuffer);
        //             ambientSound.setRefDistance(10);
        //             ambientSound.setLoop(true);
        //             ambientSound.play();
        //         },
        //         function ( xhr ) {
        //         },
        //         function ( xhr ) {
        //         }
        //     );

        // }

    /*
    + Uniforms, textures and loading object */

        var textureEnvRefl_A = new THREE.ImageUtils.loadTexture(themeUrl + '/public/images/refract.png'),
            textureEnvDiff_A = new THREE.ImageUtils.loadTexture(themeUrl + '/public/images/noise.png'),
            textureEyeColor_A = new THREE.ImageUtils.loadTexture(themeUrl + '/public/images/eye-pattern.jpg'),
            textureEyeNormal_A = new THREE.ImageUtils.loadTexture(themeUrl + '/public/images/eye-normals1.png'),
            textureEyeNormal_A1 = new THREE.ImageUtils.loadTexture(themeUrl + '/public/images/eye-normals1.png'),
            textureEyeColor_A1 = new THREE.ImageUtils.loadTexture(themeUrl + '/public/images/eye-pattern1.jpg'),
            textureEyeRefract_C = new THREE.ImageUtils.loadTexture(themeUrl + '/public/images/refract.png');
        
        textureEyeColor_A.wrapS = textureEyeNormal_A.wrapS = 
        textureEyeColor_A1.wrapS = textureEyeNormal_A1.wrapS = THREE.RepeatWrapping;
        textureEyeColor_A.minFilter = textureEyeColor_A.magFilter = 
        textureEyeNormal_A.minFilter = textureEyeNormal_A.magFilter = 
        textureEyeColor_A1.minFilter = textureEyeColor_A1.magFilter = 
        textureEyeNormal_A1.minFilter = textureEyeNormal_A1.magFilter = THREE.LinearFilter;
        
        var innerEyeUniforms = {
            texEyeCol: { type: "t", value: textureEyeColor_A },
            texEyeNrm: { type: "t", value: textureEyeNormal_A },
            texEnvRfl: { type: "t", value: textureEnvRefl_A },
            texEnvDif: { type: "t", value: textureEnvDiff_A },
            texEnvRfr: { type: "t", value: textureEyeRefract_C },   
            pupil_size: { type: "f", value: 0.2 },
            iris_tex_start: { type: "f", value: 0.02 },
            iris_tex_end: { type: "f", value: 0.13 },
            iris_border: { type: "f", value: 0.0 },
            iris_size: { type: "f", value: 0.64 },
            iris_edge_fade: { type: "f", value: 0.2 },
            iris_inset_depth: { type: "f", value: 0.0 },
            sclera_tex_scale: { type: "f", value: 2 },
            sclera_tex_offset: { type: "f", value: -10 },
            ior: { type: "f", value: 2 },
            refract_edge_softness: { type: "f", value: 0.1 },
            iris_texture_curvature: { type: "f", value: -1 },
            arg_iris_shading_curvature: { type: "f", value: -1.0 },
            tex_U_offset: { type: "f", value: 0.0 },
            cornea_bump_amount: { type: "f", value: 0.0 },
            cornea_bump_radius_mult: { type: "f", value: 0.9 },
            iris_normal_offset: { type: "f", value: 0.001 },
            cornea_density: { type: "f", value: 0.001 },
            bump_texture: { type: "f", value: 2.0 },
            catshape: { type: "i", value: false },
            cybshape: { type: "f", value: false },
            col_texture: { type: "i", value: true },
            outer: { type: "i", value: false },
            alpha_intensity: { type: "f", value: 0.4 },
        };
            
        var outerEyeUniforms = {
            texEyeCol: { type: "t", value: textureEyeColor_A1 },
            texEyeNrm: { type: "t", value: textureEyeNormal_A1 },
            texEnvRfl: { type: "t", value: textureEnvRefl_A },
            texEnvDif: { type: "t", value: textureEnvDiff_A },
            texEnvRfr: { type: "t", value: textureEyeRefract_C },   
            pupil_size: { type: "f", value: 0.2 },
            iris_tex_start: { type: "f", value: 0.02 },
            iris_tex_end: { type: "f", value: 0.13 },
            iris_border: { type: "f", value: 0.001 },
            iris_size: { type: "f", value: 0.64 },
            iris_edge_fade: { type: "f", value: 0.2 },
            iris_inset_depth: { type: "f", value: 0.0 },
            sclera_tex_scale: { type: "f", value: 0 },
            sclera_tex_offset: { type: "f", value: 0.04 },
            ior: { type: "f", value: 2 },
            refract_edge_softness: { type: "f", value: 0.1 },
            iris_texture_curvature: { type: "f", value: -1 },
            arg_iris_shading_curvature: { type: "f", value: -1.0 },
            tex_U_offset: { type: "f", value: 0.0 },
            cornea_bump_amount: { type: "f", value: 0.0 },
            cornea_bump_radius_mult: { type: "f", value: 0.9 },
            iris_normal_offset: { type: "f", value: 0.001 },
            cornea_density: { type: "f", value: 0.001 },
            bump_texture: { type: "f", value: 0.3 },
            catshape: { type: "i", value: false },
            cybshape: { type: "f", value: false },
            col_texture: { type: "i", value: true },
            outer: { type: "i", value: true },
            alpha_intensity: { type: "f", value: 0.0 },                
        };

        var objectLoader = new THREE.OBJLoader(),
            halfSpheresObj = null,
            sphereGeomety = new THREE.SphereGeometry(32, 64, 64);

        objectLoader.load(
            themeUrl + '/assets/obj/eye.obj',
            function(object) {
                halfSpheresObj = object.children[0].geometry;
            },
            function(xhr) {},
            function(error) {}
        );            

    /*
    + Inner & outer eyes | black mask */

        var outerEyeMaterial = new THREE.ShaderMaterial({ 
                uniforms: outerEyeUniforms,
                vertexShader: document.getElementById('eyeVertexShader').textContent,
                fragmentShader: document.getElementById('eyeFragmentShader').textContent,
                transparent: true,
                side: THREE.doubleSide
            }),
            outerEye = new THREE.Mesh(sphereGeomety, outerEyeMaterial);
        outerEye.scale.set(0.6,0.6,0.6)
        outerEyeScene.add(outerEye);

        var innerEyeMaterial = new THREE.ShaderMaterial({ 
                uniforms: innerEyeUniforms,
                vertexShader: document.getElementById('eyeVertexShader').textContent,
                fragmentShader: document.getElementById('eyeFragmentShader').textContent,
                transparent: true,
                side: THREE.doubleSide
            }),
            innerEye = new THREE.Mesh(sphereGeomety, innerEyeMaterial);
        innerEye.scale.set(0.6,0.6,0.6)
        innerEyeScene.add(innerEye);

        var blackMaskGeometry = new THREE.SphereGeometry(46, 64, 64),
            blackMaskMaterial = new THREE.ShaderMaterial({
                vertexShader: document.getElementById('blackMaskVertexShader').textContent,
                fragmentShader: document.getElementById('blackMaskFragmentShader').textContent,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthTest: false
            }),
            blackMask = new THREE.Mesh(blackMaskGeometry, blackMaskMaterial)
        blackMask.scale.set(0.6,0.6,0.6)
        outerEyeScene.add(blackMask);

    /* 
    + Composers and postprocessing */

        var hBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader),
            vBlur = new THREE.ShaderPass(THREE.VerticalBlurShader);
        hBlur.uniforms.h.value = 2.75 / window.innerHeight;
        vBlur.uniforms.v.value = 2.75 / window.innerWidth;

        var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.0, 0.0, 1.0);

        var bgRenderPass = new THREE.RenderPass(sceneBG, camera),
            innerEyeRenderPass = new THREE.RenderPass(innerEyeScene, camera),
            outerEyerenderPass = new THREE.RenderPass(outerEyeScene, camera);
        innerEyeRenderPass.clear = false;
        outerEyerenderPass.clear = false;

        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        effectCopy.renderToScreen = true;

        var rtParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: true},
            outerEyeComposer = new THREE.EffectComposer(outerEyeRenderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters));
            innerEyeComposer = new THREE.EffectComposer(innerEyeRenderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters));
        outerEyeComposer.renderTarget1.stencilBuffer = true;
        outerEyeComposer.renderTarget2.stencilBuffer = true;
        innerEyeComposer.renderTarget1.stencilBuffer = true;
        innerEyeComposer.renderTarget2.stencilBuffer = true;

        outerEyeComposer.addPass(bgRenderPass);
        outerEyeComposer.addPass(outerEyerenderPass);
        outerEyeComposer.addPass(hBlur);
        outerEyeComposer.addPass(vBlur);
        outerEyeComposer.addPass(effectCopy);

        innerEyeComposer.addPass(bgRenderPass);
        innerEyeComposer.addPass(innerEyeRenderPass);
        innerEyeComposer.addPass(bloomPass);
        innerEyeComposer.addPass(effectCopy);

        render();
            
        var bloomTimer = 0;

        function showHideObj(obj, state) {
            obj.traverse(function(child) {
                if (child instanceof THREE.Mesh) { child.visible = state; }
            });                            
        }

        function render(a) {

        	if (eyeVisible) {

                bloomTimer += 0.1;

                if (bloomTimer >= 15) {

                    if (bloomTimer < 20) {
                        bloomPass.strength += 0.05;
                        bloomPass.threshold -= 0.05;
                        innerEyeUniforms.cornea_bump_amount.value += 0.0035;
                    } else {
                        bloomPass.strength -= 0.05;
                        bloomPass.threshold += 0.05;                    
                        innerEyeUniforms.cornea_bump_amount.value -= 0.0035;
                    }

                    var flash = 19;

                    if (bloomTimer > flash) {
                        if (bloomTimer < flash + 0.3) {
                            showHideObj(innerEye, false);
                            showHideObj(outerEye, false);
                        } else if (bloomTimer < flash + 0.6) {
                            showHideObj(innerEye, true);
                            showHideObj(outerEye, true);
                            if (innerEye != null && halfSpheresObj != null) 
                                innerEye.geometry = halfSpheresObj;
                        } else if (bloomTimer < flash + 0.9) {
                            showHideObj(innerEye, false);
                            showHideObj(outerEye, false);
                            if (innerEye != null && halfSpheresObj != null) 
                                innerEye.geometry = halfSpheresObj;
                        } else {
                            if (innerEye != null && halfSpheresObj != null) 
                                innerEye.geometry = halfSpheresObj;
                            showHideObj(innerEye, true);
                            showHideObj(outerEye, true);
                        } 
                        if (bloomTimer < flash + 0.15) {
                            outerEye.scale.set(0.0,0.0,0.0);
                        }
                        if (bloomTimer > 23 && bloomTimer < 23.5) {
                            showHideObj(innerEye, false);
                            showHideObj(outerEye, false);
                            outerEye.scale.set(0.6,0.6,0.6);
                        } else if (bloomTimer > 23.5) {
                            showHideObj(innerEye, true);
                            showHideObj(outerEye, true);
                            if (innerEye != null) 
                                innerEye.geometry = sphereGeomety;
                            outerEye.scale.set(0.6,0.6,0.6);                            
                        }    
                    } 

                    if (bloomTimer > 25) {
                        bloomTimer = 0;
                        bloomPass.strength = 0;
                        bloomPass.threshold = 1;
                        innerEyeUniforms.cornea_bump_amount.value = 0.0;
                    }

                } else {
                    if (innerEye != null) 
                        innerEye.geometry = sphereGeomety;
                }

                var time = Date.now() * 0.005;
   
                innerEyeUniforms.pupil_size.value = 0.1 * Math.sin(0.35 * time) + 0.3;
                outerEyeUniforms.iris_size.value = 0.005 * Math.cos(0.5 * time) + 0.74;

                var delta = clock.getDelta();

                if (innerEye != null) {
                    innerEye.lookAt(camera.position);
                    innerEye.rotateOnAxis(new THREE.Vector3(1, 0, 0), mouseY);
                    innerEye.rotateOnAxis(new THREE.Vector3(0, 1, 0), mouseX);    
                }
                if (outerEye != null) {
                    outerEye.lookAt(camera.position);
                    outerEye.rotateOnAxis(new THREE.Vector3(1, 0, 0), mouseY);
                    outerEye.rotateOnAxis(new THREE.Vector3(0, 1, 0), mouseX);    
                }

                outerEyeRenderer.clear();
                innerEyeRenderer.clear();
                outerEyeComposer.render(delta);
                innerEyeComposer.render(delta);

            }

            reqAnim = requestAnimationFrame(render);

        }

    }

    window.onload = function() {
    	if ($('body').hasClass('home'))
        	eyeInit();
    };

    /*
 	+ Add particles to intro section */

 		if ($('html').hasClass('desktop') && $('body').hasClass('home')) {
			var bodyEl = document.getElementsByTagName('head')[0];
			var script = document.createElement('script');
			script.src = themeUrl + '/assets/js/libs/particles.js';
			script.setAttribute('id', 'particles-script');
			bodyEl.appendChild(script);		 			
 		}
/*
= HISTORY
-------------------------------------------------------------------------------------- */

	$(function() {
		noformat.init();
		noformat.initOnce();
		$.history({
			swapBox: '#main',
			outerWidth: true,
			direction: 'bottom-to-top',
			inEasing: '',
			outEasing: ''
		});
		$(document).on({
			historyLoadCallback: function() {
				$('.updated-nav ul li a.contact-btn').removeClass('disable-contact-btn-mobile disable-contact-btn');
				if ($('html').hasClass('mobile')) {
					$('section.section.with-text, section.section.clients.from-services').addClass('active');
				}
				noformat.single.introVideoReady = noformat.single.contentReady = false;
				if (noformat.scroll != null) {
					noformat.scroll.destroy();
					noformat.scroll = null;
					$('.vs-scrollbar').remove();
				}
			},
			historySwapCallback: function() {
				if ($('html').hasClass('desktop') && ($('body').hasClass('single') || $('body').hasClass('category-news'))) {
					noformat.scroll = new Smooth({
    					native: false,
					    section: document.querySelector('.single-holder')
        			});
					noformat.scroll.init();
				}  else if ($('html').hasClass('desktop') && $('body').hasClass('page-template-page-work')) {
					noformat.scroll = new Smooth({
						native: false,
						section: document.querySelector('.work-grid')
					});
					noformat.scroll.init();		
					noformat.work.resize();
                    noformat.news.resize();
                    noformat.awards.resize();
				}
				if ($('body').hasClass('home')) {
					eyeVisible = true;
        			eyeInit();
					if ($('html').hasClass('desktop')) {
						var bodyEl = document.getElementsByTagName('body')[0];
	      				var script = document.createElement('script');
	      				script.setAttribute('id', 'particles-script');
	      				script.src= themeUrl + '/assets/js/libs/particles.js';
	      				bodyEl.appendChild(script);		 									
					}
				} else {
					if ($('html').hasClass('desktop')) {
						var script = document.getElementById('particles-script');
						if (script) {
							script.remove();
						}
					}
					eyeVisible = false;
					if (outerEyeRenderer != null) {
						outerEyeRenderer.clear();
						innerEyeRenderer.clearTarget();
						outerEyeRenderer.clear();
						innerEyeRenderer.clearTarget();
						outerEyeRenderer.dispose();
						innerEyeRenderer.dispose();
						outerEyeRenderer = null;
						cancelAnimationFrame(reqAnim);
					}
				}
			}
		});
	});

	$('body').on('click', '.single-intro article', function(e) {
		e.preventDefault();
		$(this).parents('.single-intro').find('.vimeovideo-video-wrapper').trigger('click');
	});

	$('body').on('click', '.video-wrapper', function(e) {
		var curr = $(this),
			currIndex = curr.index('.video-wrapper');		
		noformat.single.isManuallyPaused[currIndex] = curr.children().hasClass('vimeovideo-playing') ? true : false;
	});

	$('body').on('click touchend', '.history-btn', function(e) {
		var currUrl = window.location.href,
			curr = $(this);
		if (curr.attr('href') == currUrl) {
/*			if (curr.hasClass('work-btn') && !curr.hasClass('active')) {
				$('.sections-nav li').eq(1).children('a').trigger('click');
			}
*/			e.preventDefault();
			e.stopImmediatePropagation();
			return false;
		}
		curr.parents('section').hasClass('case-study') ?
			$.history({ direction: 'top-to-bottom' }) :
			$.history({ direction: 'bottom-to-top' });
	});
	
	
	

	$('body').on('click', '#contact-btn-trigger', function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('.contact-dialog-wrapper').addClass('show-contact-dialog');
	});

	$('body').on('click', '.contact-dialog-close-btn', function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('.contact-dialog-wrapper').removeClass('show-contact-dialog');
	});


	if ($('html').hasClass('mobile')) {
		$('section.section.with-text, section.section.clients.from-services').addClass('active');
	}

	// Blog functions
	$('.article-slider').slick({
		arrows: false,
		dotts: false,
		slidesToShow: 1,
		slidesToScroll: 1,
		centerMode: true,
		infinite: false,
		autoplay: true,
  		autoplaySpeed: 3000,
	});





// Load more global
$(document).on('click', '.load-more', function (e) {
	e.preventDefault();

	var tag = $('.filters a[class="is-checked"]').data('filter');
	var offset = $('.blog-category-content article').length;
	let tags = $('.blog-category-content').data('tags');
	let load = $('.blog-category-content').data('load');
	
	$.ajax({
		type: 'POST', url: ajaxurl, data: {
			action: 'load_more',
			load: load,
			offset: offset,
			tag: tag,
			tag_in: tags
		}, beforeSend: function () {
			$('.loader').addClass('active');
		}, success: function (response) {
			$('.blog-category-content').append(response);

			window.dispatchEvent(new Event('resize'));

			var posts_sum = $('.blog-category-content article').data('sum');
			var current_posts = $('.blog-category-content article').length;
			if (current_posts >= posts_sum) {
				$(".load-more").hide();
			} else {
				$(".load-more").show();
			}
		
		}, complete: function () {
			// $('.loader').removeClass('active');
		},
	});
});