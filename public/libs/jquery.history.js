(function( $ ){
	var historyGlobal = {
		defaults: {
				swapBox : '',
				loadBox : '',
				swapTriggerBox : '',
				swapTrigger : '.history-btn',
				direction: '',
				inDuration : 1200,
				outDuration : 1200,
				inEasing : 'easeInSine',
				outEasing : 'easeInSine',
				bouncingBoxes : '',
				bouncingBoxHandling: 'fade',
				preloadImages : false,
				positionType: 'fixed',
				moveSwapBoxClasses: '',
				history: false,
				outerWidth: true,
				loadErrorMessage : 'The requested page was not found.',
				loadErrorBacklinkText : 'Go back to the last page',
		},
		listenToPopState: function(settings, $swapTrigger) {
			$(window)
			.off('popstate')
			.on('popstate', function(e) {
				var $swapBoxIn;
				switch (settings.direction) {
				    case 'left-to-right':
						$swapBoxIn = 'history-swap-box-in-l-pushstate';
						break;
				    case 'right-to-left':
						$swapBoxIn = 'history-swap-box-in-r-pushstate';
						break;
				    case 'top-to-bottom':
						$swapBoxIn = 'history-swap-box-in-b-pushstate';
						break;
				    case 'bottom-to-top':
						$swapBoxIn = 'history-swap-box-in-b-pushstate';
						break;
				    case '':
						$swapBoxIn = 'history-swap-box-in-pushstate';
						break;
			        default:
						alert('History Error: \n The defined direction ' + settings.direction + ' does not exist.');
			        	return false;
			        	break;
				}
				historyPageSwap.swapHistoryPage(settings, $swapTrigger, $swapBoxIn);
				e.stopPropagation();
			});
		}
	};
	
	var historyPageSwap = {
		defaults: function($this, options) {
			psSettings = $this.data('history-window');
			
			if(typeof(psSettings) == 'undefined') {
				psSettings = $.extend({}, historyGlobal.defaults, options);
				$this.data('history-window', psSettings);
			} else {
				psSettings = $.extend(psSettings, options);
			}

			return psSettings;
		},
		init: function(options) {
			var hasPushstate = (window.history && history.pushState);
			
			return this.each(function() {
				historyPageSwap.defaults($(this), options);
				
				var $swapBox = $(psSettings.swapBox),
					swapTriggerBox = psSettings.swapTriggerBox,
					swapTrigger = psSettings.swapTrigger,
					pageSwap = true;

				if (hasPushstate && $('html').not('[data-history-initialised]') ) {
					$('html').attr('data-history-initialised', 'true');
					historyGlobal.listenToPopState(psSettings, $(swapTriggerBox + ' ' + swapTrigger));
				}
				
				historyMethods.trigger(psSettings, hasPushstate, swapTriggerBox, swapTrigger, pageSwap);
			});
		}, 
		swapHistoryPage: function(psSettings, $swapTrigger, swapBoxIn) {
			if($('html').is('[data-history-history-pushed]')) { 
				var href = location.pathname;
					$swapTrigger = $swapTrigger.filter('[href="' + href + '"]');

				historyMethods.historyLoadPage(psSettings, $swapTrigger, href, swapBoxIn);
			}
		},
		destroy : function($this) {
			$(document).off('click', psSettings.swapTriggerBox + ' ' + psSettings.swapTrigger);
			return $(this).each(function() {
				var $this = $(this);
				$this.removeData('history-window');
			});
		},
	};
	
	var historySelectorSwap = {
		defaults: function($this, options) {
			settings = $this.data('history');
			
			if(typeof(settings) == 'undefined') {
				settings = $.extend({}, historyGlobal.defaults, options);
				$this.data('history', settings);
			} else {
				settings = $.extend(settings, options);
			}
			return settings;
		},
		init: function(options) {
			var hasPushstate = (window.history && history.pushState);

			return this.each(function() {
				historySelectorSwap.defaults($(this), options);
				
				settings.swapBox = $(this);
				
				var swapTriggerBox = settings.swapTriggerBox,
					swapTrigger = settings.swapTrigger,
					pageSwap;

				if (settings.history == true) {
					var pageSwap = true;
					
					if (hasPushstate && $('html').not('[data-history-initialised]') ) {
						$('html').attr('data-history-initialised', 'true');
						historyGlobal.listenToPopState(psSettings, $(swapTriggerBox + ' ' + swapTrigger));
					}
				}
				else
				{
					var pageSwap = false;
				}
				
				historyMethods.trigger(settings, true, swapTriggerBox, swapTrigger, pageSwap);
			});
		},		
		destroy : function($this) {
			$(document).off('click', settings.swapTriggerBox + ' ' + settings.swapTrigger);
			return $(this).each(function() {
				var $this = $(this);
				$this.removeData('history');
			});
		},

	};
	
	var historyMethods = {
		trigger: function(settings, hasPushstate, swapTriggerBox, swapTrigger, pageSwap) {
			if (hasPushstate) {
				function is_touch_device() {
					var el = document.createElement('div');
					el.setAttribute('ongesturestart', 'return;');
					return typeof el.ongesturestart === "function";
				};
				
				// on iOS there is a bug with touchend being triggered on scroll unintentionally
				// so on iOS we use click event just like on desktop
				if (is_touch_device() && !$('html').hasClass('ios')) {
					$(document)
					.on('touchend', '.ajaxPageSwitchBacklink', function() {
						window.history.back();
					})
					.off('touchend', swapTriggerBox + ' ' + swapTrigger)
					.on('touchend', swapTriggerBox + ' ' + swapTrigger, function(e) {
						e.preventDefault();
						var $swapTrigger = $(this);
						if (!$('html').hasClass('mobile') || !($swapTrigger.parent('h3').length && $swapTrigger.parents('.case-study').length)) {
							$('<div class="history-overlay" />').appendTo('body');
							$('.history-overlay').css({
								'position': 'fixed',
								'left': '0px',
								'top': '0px',
								'zIndex': '9999',
								'width': '100%',
								'height': '100%'
							});							
							historyMethods.historyDefineSwapBoxIn(settings, $swapTrigger, hasPushstate, pageSwap);
						}
					});
				} else {
					$(document)
					.on('click', '.ajaxPageSwitchBacklink', function() {
						window.history.back();
					})
					.off('click', swapTriggerBox + ' ' + swapTrigger)
					.on('click', swapTriggerBox + ' ' + swapTrigger, function(e) {
						e.preventDefault();
						var $swapTrigger = $(this);
						$('<div class="history-overlay" />').appendTo('body');
						$('.history-overlay').css({
							'position': 'fixed',
							'left': '0px',
							'top': '0px',
							'zIndex': '9999',
							'width': '100%',
							'height': '100%'
						});
						historyMethods.historyDefineSwapBoxIn(settings, $swapTrigger, hasPushstate, pageSwap);
					});
				}
			}
		},
		historyDefineSwapBoxIn: function(settings, $swapTrigger, hasPushstate, pageSwap) {
			switch (settings.direction) {
			    case 'left-to-right':
			    case 'right-to-left':
			    case 'top-to-bottom':
			    case 'bottom-to-top':
			    case '':
					$swapBoxIn = 'history-swap-box-in';
					if (!$('.history-swap-box-in').length) {
						var item = $(this);
						historyMethods.historyCollectLoadPageInfo(settings, $swapTrigger, hasPushstate, $swapBoxIn, pageSwap);
					} else {
						return false;
					}
					break;
		        default:
					alert('History Error: \n The defined direction ' + settings.direction + ' does not exist.');
		        	return false;
		        	break;
			}
		},
		historyCollectLoadPageInfo: function(settings, $swapTrigger, hasPushstate, $swapBoxIn, pageSwap) {
			var url = $swapTrigger.attr('href');

			var $swapBoxIn;
			switch (settings.direction) {
			    case 'left-to-right':
					$swapBoxIn = 'history-swap-box-in-l';
					break;
			    case 'right-to-left':
					$swapBoxIn = 'history-swap-box-in-r';
					break;
			    case 'top-to-bottom':
					$swapBoxIn = 'history-swap-box-in-t';
					break;
			    case 'bottom-to-top':
					$swapBoxIn = 'history-swap-box-in-b';
					break;
			    case '':
					$swapBoxIn = 'history-swap-box-in';
					break;
		        default:
					alert('History Error: \n The defined direction ' + settings.direction + ' does not exist.');
		        	return false;
		        	break;
			}

			historyMethods.historyLoadPage(settings, $swapTrigger, url, $swapBoxIn, pageSwap);
			
			if (pageSwap) {
				history.pushState({'url':url}, null, url);
				$('html').attr('data-history-history-pushed', 'true');
			}
		},
		historyLoadPage: function(settings, $swapTrigger, href, swapBoxIn, pageSwap) {
			var $swapBox = $(settings.swapBox);
			if (href != '') {
				var delayedAjax = $swapBox.hasClass('home') && $swapTrigger.parents('section').hasClass('case-study') ? 500 : 0,
					delayed = 0;
//				if (delayedAjax == 500 && $('.sections-nav li:last-child a').hasClass('active')) {
//					$('.sections-nav li:nth-last-child(2) a').trigger('click');
//					delayed = 1250;
//				}
				if (delayedAjax != 0) {
					setTimeout(function() {
						$swapTrigger.parents('section').addClass('clicked').find('.layer').each(function() {
							var curr = $(this),
								left = curr.position().left - $(window).width() / 2,
								top = curr.position().top - $(window).height() / 2;
							left = left < 0 ?
								curr.position().left + curr.width() / 2 < $(window).width() / 2 ? -200 : 200 : 200
							top = top < 0 ?
								curr.position().top + curr.height() / 2 < $(window).height() / 2 ? -200 : 200 : 200
							$(this).css({
								'marginTop': top,
								'marginLeft': left
							})
						});
					}, delayed);
				};
				if ($('header').hasClass('opened')) 
					$('.nav-trigger').trigger('click');				
				setTimeout(function() {
					historyMethods.historyAddSwapBoxIn(settings, swapBoxIn);
					$.ajax({
						type: 'GET',
						url: href,
						data: {},
						beforeSend: function() {
							historyMethods.historyCreateLoadBox();
						},
						error : function(data, xhrStatusText, xhrStatus) {
							$swapBox.html(settings.loadErrorMessage + '<p>' + xhrStatusText + ': <strong>' + xhrStatus + '</strong></p><p><a class="ajaxPageSwitchBacklink">' + settings.loadErrorBacklinkText + '</a></p>');
						},
						success: function(data) {
							$(settings.swapTriggerBox).find('*').filter('.active').removeClass('active');
							$swapTrigger.addClass('active');

							if (settings.bouncingBoxes) {
								if (settings.bouncingBoxHandling == 'fade') {
									historyMethods.historyFadeSiblings(settings, $swapTrigger, data, swapBoxIn, pageSwap);
								} else if (settings.bouncingBoxHandling == 'slide') {
									historyMethods.historySlideSiblings(settings, $swapTrigger, data, $swapBox, swapBoxIn, pageSwap);
								}
							} else {
								historyMethods.historyPositionAndPrepare(settings, $swapTrigger, data, swapBoxIn, pageSwap);
							}
						},
						dataType: 'html',
					});
				}, delayedAjax);
			} else {
				alert('No target defined! Please check the references (i.e. normally href) of the swapTriggers.');
			}
		},
		historyAddSwapBoxIn: function(settings, swapBoxIn) {
			var $swapBox = $(settings.swapBox),
				swapBoxClass = $swapBox.attr('class'),
				swapBoxTagName = $swapBox.prop("tagName");
				
			$(document).find('.history-swap-box-in').remove();

			if (settings.moveSwapBoxClasses) {
				$swapBox.after('<' + swapBoxTagName.toLowerCase() + ' class="history-swap-box-in ' + (typeof swapBoxClass != 'undefined' ? swapBoxClass : '') + '" id="' + swapBoxIn + '"></' + swapBoxTagName.toLowerCase() + '>'); // create the temp container
			} else {
				$swapBox.after('<' + swapBoxTagName.toLowerCase() + ' class="history-swap-box-in" id="' + swapBoxIn + '"></' + swapBoxTagName.toLowerCase() + '>');
			}
			
			$swapBox.siblings('.history-swap-box-in')
			.hide();

		},
		historyFadeSiblings: function(settings, $swapTrigger, data, swapBoxIn, pageSwap) {
			$(document)
			.find(settings.bouncingBoxes)
			.animate({opacity: 0}, 50, function() {
				historyMethods.historyPositionAndPrepare(settings, $swapTrigger, data, swapBoxIn, pageSwap);
			});
		},
		historySlideSiblings: function(settings, $swapTrigger, data, swapBox, swapBoxIn, pageSwap) {
			swapBox.siblings('history-ghost-box').remove();
			
			swapBox.wrap('<div class="history-ghost-box" style="height: ' + swapBox.outerHeight(true) + 'px"></div>');
			historyMethods.historyPositionAndPrepare(settings, $swapTrigger, data, swapBoxIn);
		},
		historyPositionAndPrepare: function(settings, $swapTrigger, data, swapBoxIn, pageSwap) {
			var $swapBox = $(settings.swapBox),
				swapBoxId = $swapBox.attr('id'),
				swapBoxInHeader = $(data).filter('header'),
				mainOffset = $swapBox.offset(),
				mainWidth = $swapBox.width(),
				mainMarginLeft = $swapBox.css('margin-left'),
				mainMarginRight = $swapBox.css('margin-left'),
				swapBoxLeftAbsolute = mainOffset.left + parseFloat(mainMarginLeft);
				swapBoxRightAbsolute = mainOffset.left + parseFloat(mainMarginLeft) + mainWidth - parseFloat(mainMarginRight),
				$swapBoxIn = $('#' + swapBoxIn),
				loadSelector = $swapTrigger.attr('data-history-load-selector');
			if (settings.outerWidth) {
				var mainWidth = $swapBox.outerWidth();
			}
//			if (pageSwap) {
				var	htmlId = data.match(/<\/*html\s+.*id="([^"].*)".*>/),
					bodyId = data.match(/<\/*body\s+.*id="([^"].*)".*>/),
					htmlClass = data.match(/<\/*html\s+.*class="([^"].*)".*>/),
					bodyClass = data.match(/<\/*body\s+.*class="([^"].*)".*>/),
					pageTitle = data.match(/<\/*title>(.*)<\/title>/);
//			}

			$swapBox
			.addClass('history-swap-box-out')
			.css({
				position: 'fixed',
				top: mainOffset.top,
				left: swapBoxLeftAbsolute,
				marginLeft: 0,
				width: mainWidth,
			});
			
			if (swapBoxInContents = $(data).filter('#' + swapBoxId).html() != undefined) {
				if (settings.loadBox) {
					var swapBoxInContainer = $(data).filter(settings.loadBox);
				} else if (loadSelector) {
					var swapBoxInContainer = $(data).filter(loadSelector);
				} else {
					var swapBoxInContainer = $(data).filter('#' + swapBoxId);
				}
				swapBoxInContents = swapBoxInContainer.html();
				var swapBoxInClasses = swapBoxInContainer.attr('class');
			} else {
				if (settings.loadBox) {
					var swapBoxInContainer = $(data).find(settings.loadBox);
				} else if (loadSelector) {
					var swapBoxInContainer = $(data).find(loadSelector);
				} else {
					var swapBoxInContainer = $(data).find('#' + swapBoxId);
				}
				swapBoxInContents = swapBoxInContainer.html();						
				var swapBoxInClasses = swapBoxInContainer.attr('class');
			}
			
			$swapBoxIn
			.addClass(swapBoxInClasses)
			.css({
				position: settings.positionType,
				marginLeft: 0,
				top: mainOffset.top,
				left: swapBoxLeftAbsolute,
			})
			.html(swapBoxInContents);

			noformat.single.introVideoReady = noformat.single.contentReady = false;

			if ($swapTrigger.parents('section').hasClass('case-study')) {
				$swapBoxIn.find('.single-intro').preloadingSingle({
					truePercentage: false,
//					forceSequentialLoad: true,
					beforeComplete: function() {
					},
					onComplete: function() {
						$('.intro-video-spinner span i').addClass('activated');	
						$(document).trigger('historyLoadCallback');
				       	historyMethods.historySwapContent(settings, swapBoxIn, $swapTrigger, mainOffset, swapBoxLeftAbsolute, mainWidth, htmlId, bodyId, htmlClass, bodyClass, pageTitle, pageSwap, swapBoxInHeader);					
					}
				});
			} else {
				if ($swapBoxIn.find('.single-intro').length) {
					$swapBoxIn.find('.single-intro').preloading({
						truePercentage: false,
//						forceSequentialLoad: true,
						beforeComplete: function() {},
						onComplete: function() {
							$('.intro-video-spinner span i').addClass('activated');	
							$(document).trigger('historyLoadCallback');
				       		historyMethods.historySwapContent(settings, swapBoxIn, $swapTrigger, mainOffset, swapBoxLeftAbsolute, mainWidth, htmlId, bodyId, htmlClass, bodyClass, pageTitle, pageSwap, swapBoxInHeader);					
						}
					});
				} else {
					$swapBoxIn.preloading({
						beforeComplete: function() {},
						onComplete: function() {
							$(document).trigger('historyLoadCallback');
					       	historyMethods.historySwapContent(settings, swapBoxIn, $swapTrigger, mainOffset, swapBoxLeftAbsolute, mainWidth, htmlId, bodyId, htmlClass, bodyClass, pageTitle, pageSwap, swapBoxInHeader);					
						}
					});
				}
			};

		},
		historySwapContent: function(settings, swapBoxIn, $swapTrigger, mainOffset, swapBoxLeftAbsolute, mainWidth, htmlId, bodyId, htmlClass, bodyClass, pageTitle, pageSwap, swapBoxInHeader) {
			var $swapBox = $(settings.swapBox),
				swapBoxId = $swapBox.attr('id'),
				$swapBoxIn = $('#' + swapBoxIn),
				swapBoxInHeight = $swapBoxIn.outerHeight(),
				swapBoxInWidth = $swapBoxIn.outerWidth(),
				swapBoxHeight = $swapBox.outerHeight(),
				viewportHeight = $(window).outerHeight(),
				viewportWidth = $(window).outerWidth(),
				hash = $swapTrigger.prop('hash');

			clearTimeout(loadTimer);
			historyMethods.historyRemoveLoadBox();

			if ($('html').hasClass('mobile')) 
				$('header').removeClass('header-up sticky-header');
			
			$('header nav').find('.history-btn').removeClass('active');
			var currUrl = window.location;
			$('header nav .main li a[href="' + currUrl + '"]').addClass('active');

			$swapBoxIn.css({width: mainWidth});
				
			var swapBoxOutAnimProperties = {}, swapBoxInAnimProperties = {};
				
			var swapBoxOutAnimValue;
			switch (swapBoxIn) {
				case 'history-swap-box-in-t':
				case 'history-swap-box-in-t-pushstate':
				   	break;
				case 'history-swap-box-in-b-pushstate':
			    case 'history-swap-box-in-b':
					$swapBoxIn.css('top', swapBoxHeight);
				  	swapBoxOutAnimValue = -swapBoxHeight;
				   	break;
			   	case 'history-swap-box-in-r-pushstate':
			    case 'history-swap-box-in-l':
					$swapBoxIn.css('left', -viewportWidth);
			    	swapBoxOutAnimValue = viewportWidth;
			    	break;
				case 'history-swap-box-in-l-pushstate':
			    case 'history-swap-box-in-r':
					$swapBoxIn.css('left', viewportWidth);
			    	swapBoxOutAnimValue = -viewportWidth;
			    	break;
			    default:
					alert('History Error: \n The swapBoxIn class is in an undefined format: ' + swapBoxIn + '.');
		        	return false;
		        	break;
			}

			noformat.windowW = null;

			if (swapBoxIn == 'history-swap-box-in-b-pushstate' || swapBoxIn == 'history-swap-box-in-b') {

				var additionValue = (swapBoxHeight * settings.inDuration / 1000),
					finalVal = additionValue / 100,
					finalInDuration = settings.inDuration + finalVal,
					finalOutDuration = settings.outDuration;
				
				swapBoxInAnimProperties = {top: mainOffset.top};
				swapBoxOutAnimProperties = {top: swapBoxOutAnimValue};
				$('body').css('overflow-y', 'scroll');

				var swapBoxInFullHeight = $swapBoxIn.outerHeight(true);
				if ($swapBox.parent('.history-ghost-box')) {
					$ghostBox = $swapBox.parent('.history-ghost-box');					
					$ghostBox
					.animate({
						height: swapBoxInFullHeight,
					});
				}
			
				$swapBoxIn.find('.sections-nav, header, .mouse, .intro-content').removeClass('initial');

				$('<div class="red-overlay" />').appendTo('body').stop().animate({
					'top' : '0'
				}, {
					duration: 600,
					easing: 'easeInCubic',
					complete: function() {
						$swapBox.remove();
						$('body').css('background-color', '');
						$('header').css('margin-top', '0px').removeClass('sticky-header');
						$(this).stop().animate({
							'top' : '-100%'
						}, {
							duration: 600,
							easing: 'easeOutCubic'
						});				
						$swapBoxIn
						.stop()
						.show()
						.animate(
							swapBoxInAnimProperties, 600, 'easeOutCubic', function() {
								$ghostBox.remove();
								$(this)
								.css({display: '', left: '', marginLeft: '', position: '', top: '', width: ''})
								.attr('id', swapBoxId)
								.removeClass('history-swap-box-in');
								$('.red-overlay').remove();
								$(document).scrollTop(0);
//								if ($swapTrigger.hasClass('work-btn')) $swapBoxIn.find('.sections-nav li').eq(1).children('a').trigger('click');
								if ($swapBoxIn.hasClass('about')) {
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
									        }, 250)
									    }, i * 150); 
				            		})
								}
								historyMethods.animationCallback(hash, settings, pageSwap);
							});	
						historyMethods.historySwitchClasses(htmlId, bodyId, htmlClass, bodyClass, pageTitle);						
						if ($('html').hasClass('desktop')) {
							noformat.single.contentReady = true;
							if (noformat.single.introVideoReady) {
								noformat.single.players[0].play();
							}
						}
						noformat.init();
					}
				})

				swapBoxInHeader.hasClass('light') ?
					$('header').addClass('light') :
					$('header').removeClass('light');					

			} else {

				var clonedIntro = $swapBoxIn.find('.single-intro').clone(true, true);
				clonedIntro.find('article').remove();
				clonedIntro.find('.video-wrapper').remove();
				clonedIntro.find('.bgr-holder').css('display', 'block');

				$swapBoxIn.find('.bgr-holder').css('display', 'block');
				$swapBoxIn.find('.single-intro article').css('opacity', '0');
				$swapBoxIn.find('.single-intro .video-wrapper').css('opacity', '0');

				$swapBoxIn.find('.single-intro .vimeovideo-play-large').css({ 'opacity': '0', 'visibility': 'hidden' });

				clonedIntro.css({
					'position': 'absolute',
					'left': '0px',
					'top': '0px',
					'width': '100%',
					'height': $(window).height() * 0.85,
					'zIndex': '9999',
					'opacity': '0',
					'-webkit-transform': 'translate3d(0, 0, 0)',
					'-moz-transform': 'translate3d(0, 0, 0)',
					'transform': 'translate3d(0, 0, 0)',
					'-webkit-transition': 'all 600ms 0ms ease-in-out',
					'-moz-transition': 'all 600ms 0ms ease-in-out',
					'transition': 'all 600ms 0ms ease-in-out',
					'backfaceVisibility': 'hidden'
				});
				$swapTrigger.parents('section').find('.media-holder span').css({
					'opacity': '0',
					'-webkit-transition': 'all 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)',
					'-moz-transition': 'all 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)',
					'transition': 'all 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)'
				})
				$swapTrigger.parents('section').find('.media-holder').append(clonedIntro).css({
					'-webkit-transition': 'all 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)',
					'-moz-transition': 'all 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)',
					'transition': 'all 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)'
				});
				$swapTrigger.parents('section').find('article').css({
					'-webkit-transform': 'translate3d(-50%,' + -noformat.windowH + 'px, 0)',
					'-moz-transform': 'translate3d(-50%,' + -noformat.windowH + 'px, 0)',
					'transform': 'translate3d(-50%,' + -noformat.windowH + 'px, 0)',
					'-webkit-transition': '-webkit-transform 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)',
					'-moz-transition': '-moz-transform 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)',
					'transition': 'transform 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)',
					'will-change': 'transform'
				});
				$swapTrigger.parents('section').find('.parallax').parallax('disable');
				$swapTrigger.parents('section').find('.parallax').css({
					'-webkit-transform': 'translate3d(-50%,' + -noformat.windowH * 2 + 'px, 0)',
					'-moz-transform': 'translate3d(-50%,' + -noformat.windowH * 2+ 'px, 0)',
					'transform': 'translate3d(-50%,' + -noformat.windowH* 2 + 'px, 0)',
					'-webkit-transition': '-webkit-transform 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)',
					'-moz-transition': '-moz-transform 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)',
					'transition': 'transform 1000ms 0ms cubic-bezier(0.645, 0.045, 0.355, 1.000)',
					'will-change': 'transform'
				});

				setTimeout(function() {
					clonedIntro.css('opacity', '1');
					$swapTrigger.parents('section').removeClass('clicked');
					setTimeout(function() {
						historyMethods.historySwitchClasses(htmlId, bodyId, htmlClass, bodyClass, pageTitle);
						$swapBox.remove();
						noformat.init();
						$swapBoxIn
							.css({display: '', left: '', marginLeft: '', position: '', top: '', width: '',}).attr('id', swapBoxId).removeClass('history-swap-box-in');
							historyMethods.animationCallback(hash, settings, pageSwap);
						$swapBoxIn.find('.single-intro .video-wrapper').css('opacity', '1');
						$swapBoxIn.find('.single-intro article').stop().animate({'opacity': '1'}, 1000);
						$swapBoxIn.find('.single-intro .vimeovideo-play-large').css({ 'opacity': '0', 'visibility': 'hidden' });
						noformat.single.contentReady = true;
						if (noformat.single.introVideoReady) {
							noformat.single.players[0].play();
						}
						$(window).trigger('resize');
					}, 950);
					swapBoxInHeader.hasClass('light') ?
						$('header').addClass('light') :
						$('header').removeClass('light');					
				}, 10);
				
			}

		},
		animationCallback: function(hash, settings, pageSwap) {
			if (hash) {
				$('html:not(:animated),body:not(:animated)').animate({scrollTop: $(hash).offset().top },'normal');
			}
			$('.history-overlay').remove();
			historyMethods.historyCheckForSiblings(settings, pageSwap);
		},
		historyCheckForSiblings: function(settings, pageSwap) {
			if (settings.bouncingBoxes) {
				$(document)
				.find(settings.bouncingBoxes)
					.animate({opacity: 1}, 400, function() {
						(1 ? historyMethods.historySwapCallback() : historyMethods.historySwapSectionCallback());
					});
			} else {
				(1 ? historyMethods.historySwapCallback() : historyMethods.historySwapSectionCallback());
			}
		},
		historySwitchClasses : function(htmlId, bodyId, htmlClass, bodyClass, pageTitle) {
			$('body').attr({
				'class': '',
				'id' : '',
			}); 
			(bodyId ? $('body').attr('id', bodyId[1]) : '');
			(bodyClass ? $('body').addClass(bodyClass[1]) : ''); 
			(pageTitle ? $('title').text(pageTitle[1]) : '');

			// if( $('body').hasClass('page-template-page-work') || $('body').hasClass('category') ) {
				setTimeout(() => {

					$('html').css({
						'overflow-y' : 'auto !important',
						'widows' : 'auto',
					});
					
					setTimeout(() => {

						$('html').css({
							'overflow' : 'hidden !important',
						});	

						console.log('2 drugi');
					}, 100);
					console.log('1 prvi');
				}, 1000);
			// }
		},
		historyCreateLoadBox: function() {
			if (!$('#history-loading-box').length) {
				loadTimer = setTimeout(function() {
					$('html').append('<div id="history-loading-box"><div class="history-loading"></div></div>');
					$('#history-loading-box').fadeIn('fast');
				}, 200);
			} else {
				historyMethods.historyRemoveLoadBox();
				historyMethods.historyCreateLoadBox();
			}
		},
		historyRemoveLoadBox: function() {
			$('#history-loading-box').fadeOut('fast').remove();
		},
		historySwapCallback: function() {
			$('body').css({
				overflowX: 'auto'				
			});
			$(document).trigger('historySwapCallback');
		},
		historySwapSectionCallback: function() {
			$(document).trigger('historySwapSectionCallback');
		},
	};
	
	$.history = function(method) {
		if (historyPageSwap[method]) {
			return historyPageSwap[method].apply($(window), Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return historyPageSwap.init.apply($(window), arguments, false);
		} else {
			$.error( 'Method ' + method + ' does not exist on jQuery.history' );
		}    
	};
	
	$.fn.history = function(method) {
		if (historySelectorSwap[method]) {
			return historySelectorSwap[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return historySelectorSwap.init.apply(this, arguments);
		} else {
			$.error( 'Method ' + method + ' does not exist on jQuery.history' );
		}    
	};
})( jQuery );