(function($) {

	var defaults = {
		preloadSelector: true,
		truePercentage: true,
		disableOverlay: false,
		showInContainer: false,
		hideBackground: false,
		hideNonImageElements: false,
		progressiveReveal: false,
		forceSequentialLoad: false,
		silentMode: false,
		debugMode: false,
		useOpacity: true,
		hidePercentage: false,
		loaderText: '',
		animateDuration: 1000,
		fadeOutDuration: 1000,
		showImagesBeforeComplete: true,
		afterEach: function() {},
		beforeComplete: function() {},
		onComplete: function() {}
	};

	var spinnerStepInterval = null,
		spinnerReadyInterval = null,
		spinnerStep = 0,
		spinnerReady = false,
		elementsReady = false;

	var methods = {
		init: function(options) {
			var settings = $.extend({}, defaults, options);

			return this.each(function() {

				var parent = $(this);
				var elementChildren = getAllChildren(parent);
				var imageElements = [];
				var nonImageElements = [];
				var imagesLoaded = 0;
				var totalImages = 0;
				var progressPercentage = 0;
				var totalPercentage = 0;
				var count = 0;
				var minUpdateToValue = 0; 

				var preloadContainer = $('<div id="site-preloader"></div>');

				if (!settings.showInContainer) {
					preloadContainer.appendTo('body');
					preloadContainer.css('position', 'fixed');
				} else {
					preloadContainer.appendTo(parent);
					parent.css('position', 'relative');
					preloadContainer.css('position', 'absolute');
				}

				if (!settings.disableOverlay) {
					var preloadOverlay = $('<div class="loader_overlay"></div>').appendTo(preloadContainer);
				} else {
					preloadContainer.css('height', 'auto');
				}

				$('<div class="spinner"><span class="left"><i/></span><span class="right"><i/></span></div>').appendTo(preloadContainer);

				var preloadLoader = $('<div class="loader"></div>').appendTo(preloadContainer);

				if (!settings.hidePercentage) {
					var progressNotification = $('<div class="progress_notification">' + settings.loaderText + ' <span class="progress_percentage">' + progressPercentage + '</span>%</div>').appendTo(preloadLoader);
				} else {
					var progressNotification = $('<div class="progress_notification">' + settings.loaderText + '</div>').appendTo(preloadLoader);
				}

				var progressBar    = $('<div class="progress_bar"></div>').appendTo(preloadLoader);
				var progressLoaded = $('<div class="progress_loaded"></div>').appendTo(progressBar);

				if (settings.silentMode) {
					preloadContainer.hide();
				}

				if (settings.truePercentage) {
					updateProgressbar(1, 3000); 
				}

				if (settings.debugMode) {
					var startTime = (new Date).getTime();

					console.groupCollapsed('preloading > ', parent);
					console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': scanning DOM for image elements...');
					console.groupCollapsed('image elements');
				}

				elementChildren.forEach(function(child) {
					if (child.is('img') || child.css('background-image') !== 'none' && child.css('background-image').indexOf('gradient') == -1) {
						if (!(settings.preloadSelector && settings.showInContainer && child === parent)) {
							if (!settings.useOpacity) {
								child.hide();
							} else {
								child.css('opacity', '0');
							}
						} else if (settings.hideBackground) {
							child.attr('data-bg', child.css('background-image')).css('background-image', 'none');
						}

						var imageElement = {
							node     : child,
							fileSize : 0
						};

						if (settings.debugMode) {
							console.log(imageElement.node);
						}

						imageElements.push(imageElement);
						totalImages++;
					} else if (settings.hideNonImageElements) {
						if (!settings.useOpacity) {
							child.hide();
						} else {
							child.css('opacity', '0');
						}

						nonImageElements.push(child);
					}
				});

				if (settings.debugMode) {
					console.groupEnd();
					console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': scanning DOM for image elements DONE');
				}

				if (settings.truePercentage) {
					if (settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': getting image sizes...');
						console.groupCollapsed('image sizes');
					}
					imageElements.forEach(function(element) {
						$.ajax({
							type: 'HEAD',
							cache: false,
							url: getImageUrl(element.node),
							success: function(response, message, object) {
								element.fileSize = parseInt(object.getResponseHeader('Content-Length'));
								totalPercentage += element.fileSize;

								if (settings.debugMode) {
									console.log((element.fileSize / 1000).toFixed(2) + ' KB \t' + (totalPercentage / 1000).toFixed(2) + ' KB total');
								}
								continueCounting();
							},
							error: function(object, response, message) {
								continueCounting();

								var markup = '';

								markup += 'Not all of your images were preloaded!<br>';
								markup += 'Loader failed getting image sizes.<br><br>';
								markup += '1. Make sure your images exist.<br>';
								markup += '2. Make sure your image paths/urls are correct.<br>';
								markup += '3. If you load images from a remote domain set <code>truePercentage: false</code>.<br><br>';
								markup += '<button>Close</button>';

								progressNotification.addClass('error').html(markup);
								progressBar.addClass('error');

								settings.fadeOutDuration = 500000;

								$('#preloader button').click(function() {
									preloadContainer.remove();
								});
							}
						});

						function continueCounting() {
							count++;

							if (count === totalImages) {
								if (settings.debugMode) {
									console.groupEnd();
									console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': getting image sizes DONE');
								}

								startPreloading();
							}
						}
					});
				} else {
					if (settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': getting image sizes SKIPPED');
					}

					totalPercentage = totalImages;
					startPreloading();
				}

				spinnerStepInterval = setInterval(function() {
					spinnerStep += 3;
					if (spinnerStep == 360) spinnerStep = 0;
					$('.spinner').css({
						'-webkit-transform': 'rotate(' + spinnerStep + 'deg)',
						'-moz-transform': 'rotate(' + spinnerStep + 'deg)',
						'transform': 'rotate(' + spinnerStep + 'deg)',
					});
					if ((spinnerStep % 315 == 0 || spinnerStep % 135 == 0 && spinnerStep % 270 != 0) && spinnerStep != 0) {
						spinnerReady = true;
					} else {
						spinnerReady = false;
					}
				}, 15)

				function startPreloading() {

					if (settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': preloading image elements...');
						console.groupCollapsed('intervals');
					}
					if (!settings.forceSequentialLoad) {
						if (imageElements.length) {
							imageElements.forEach(function(element, index) {
								var img = $('<img>').attr('src', getImageUrl(element.node));

								img.load(function() {
									updateLoader(element);
								}).error(function() {
									updateLoader(element);
									handleLoadingError(img, element);
								});
							});
						} else {

							$('.spinner span i').css({
								'-webkit-transform': 'rotate(' + 180 + 'deg)',
							    '-moz-transform': 'rotate(' + 180 + 'deg)',
							    'transform': 'rotate(' + 180 + 'deg)'
							});								

							spinnerReadyInterval = setInterval(function() {

								if (spinnerReady) {

									clearInterval(spinnerStepInterval)
											
									preloadContainer.animate({'opacity':'0'}, settings.fadeOutDuration, function() {
										preloadContainer.remove();
									});
							
									$('.sections-nav, header, .mouse, .intro-content').removeClass('initial');

									clearInterval(spinnerReadyInterval)

								}

							}, 10)

						}

					} else {
						
						(function loadImage(index) {
							var currentElement = imageElements[index];
							var img            = $('<img>').attr('src', getImageUrl(currentElement.node));

							img.load(function() {
								updateLoader(currentElement);

								if (++index < imageElements.length) {
									loadImage(index);
								}
							}).error(function() {
								updateLoader(currentElement);

								if (++index < imageElements.length) {
									loadImage(index);
								}
								handleLoadingError(img, currentElement);
							});
						})(0);
					}
				}

				function handleLoadingError(image, element) {
					element.node.addClass('preloader_not_found_error');
				}

				function updateLoader(element) {

					imagesLoaded++;
					updateProgressPercentage(element);
					updateProgressbar(progressPercentage, undefined, element);

					if (settings.progressiveReveal) {
						revealElement(element.node);
					}

					settings.afterEach.call(element.node);
				}

				function updateProgressPercentage(element) {

					if (settings.truePercentage) {
						progressPercentage += (element.fileSize / totalPercentage) * 100;

						if (imagesLoaded === totalImages) {
							progressPercentage = 100;
						}
					} else {
						progressPercentage = (imagesLoaded / totalPercentage) * 100;
					}
				}

				function updateProgressbar(value, updateDuration, element) {
					updateDuration = updateDuration !== undefined ? updateDuration : settings.animateDuration;
					var totalWidth = 0;
					var updateTo   = value;
					var remaining  = 0;

					if (updateDuration === undefined && settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': ' + value.toFixed(2) + '%');
					}
					if (value < 100) {
						if (element !== undefined) {
							if (element.round === undefined) {
								element.round = 0;

								updateTo  = value / 4 * 3;
								remaining = value / 4;
							} else {
								element.round++;

								updateTo       = value / (4 + element.round) * (3 + element.round);
								remaining      = value / (4 + element.round);
								updateDuration = 200;
							}
						}
					}

					if (element === undefined) {
						element = {};
					}

					if (element.round === undefined) {
						element.round = 0;
					}

					if (updateTo > minUpdateToValue) {
						minUpdateToValue = updateTo;
					}

					if (updateTo < minUpdateToValue) {
						updateTo = minUpdateToValue;
					}

					progressLoaded.stop();

					if (element.round < 30) {
						progressLoaded.animate({'width': updateTo + '%'}, {
							duration: updateDuration,
							easing: 'linear',
							step: function() {
								totalWidth = progressBar.width();

								progressNotification.children('span').html(Math.round((progressLoaded.width() / totalWidth) * 100));

								var spinnerAngle = (progressLoaded.width() / totalWidth) * 18000 / 100;

								$('.spinner span i').css({
								    '-webkit-transform': 'rotate(' + spinnerAngle + 'deg)',
								    '-moz-transform': 'rotate(' + spinnerAngle + 'deg)',
								    'transform': 'rotate(' + spinnerAngle + 'deg)'
								});								

							},
							complete: function() {

								progressNotification.children('span').html(Math.round(updateTo));

								if (imagesLoaded === totalImages) {
									
									if (settings.debugMode) {
										console.groupEnd();
										console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': preloading image elements DONE');
										console.groupEnd();
									}

									progressLoaded.delay(100).queue(function() {
										if (settings.showImagesBeforeComplete) {

											spinnerReadyInterval = setInterval(function() {

												if (spinnerReady) {

													clearInterval(spinnerStepInterval)
											
													imageElements.forEach(function(element) {
														revealElement(element.node);
													});

													nonImageElements.forEach(function(element) {
														revealElement(element);
													});

													settings.beforeComplete.call(this);

													preloadContainer.animate({'opacity':'0'}, settings.fadeOutDuration, function() {
														preloadContainer.remove();
														settings.onComplete.call(this);
/*														if ($('#main').hasClass('about')) {
								        		    		setTimeout(function() {
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
															}, 1000);
														}
*/
														$('.sections-nav, header, .mouse, .intro-content').removeClass('initial');
			
														if ($('html').hasClass('desktop') && $('body').hasClass('single')) {

															noformat.scroll = new Smooth({
											    				native: false,
																section: document.querySelector('.single-holder')
									        				});
															noformat.scroll.init();		

															noformat.single.resize();

														} else if ($('html').hasClass('desktop') && $('body').hasClass('page-template-page-work')) {

															noformat.scroll = new Smooth({
											    				native: false,
																section: document.querySelector('.work-grid')
									        				});

															noformat.scroll.init();		

															noformat.work.resize();

														}  else if ($('html').hasClass('desktop') && $('body').hasClass('category')) {

															noformat.scroll = new Smooth({
											    				native: false,
																section: document.querySelector('.awards-holder')
									        				});

															noformat.scroll.init();		

															noformat.awards.resize();

														}

													});

													if ($('body').hasClass('single') && $('html').hasClass('desktop')) {

														noformat.single.contentReady = true;
														if (noformat.single.introVideoReady) 
															noformat.single.players[0].play();
	
													}

													clearInterval(spinnerReadyInterval)

												}

											}, 10)

										} else {
											settings.beforeComplete.call(this);

											preloadContainer.animate({'opacity':'0'}, settings.fadeOutDuration, function() {
												imageElements.forEach(function(element) {
													revealElement(element.node);
												});

												nonImageElements.forEach(function(element) {
													revealElement(element);
												});

												preloadContainer.remove();
												settings.onComplete.call(this);
											});
										}
									});
								} else {
									updateProgressbar(value, updateDuration, element);
								}
							}
						});
					}
				}

				function getAllChildren(selector) {
					var selectorChildren = [];

					if (selector.children().length > 0) {
						if (settings.preloadSelector) {
							selectorChildren.push(selector);
						}

						getChildren(selector);
					} else if (settings.preloadSelector) {
						selectorChildren.push(selector);
					}

					function getChildren(element) {
						var children = element.children();

						if (children.length > 0) {
							children.each(function() {
								var _this = $(this);

								selectorChildren.push(_this);

								if (_this.children().length > 0) {
									getChildren(_this);
								}
							});
						}
					}

					return selectorChildren;
				}

				function getImageUrl(image) {
					if (image.css('background-image') !== 'none') {
						return image.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
					} else if (image.css('background-image') === 'none' && image.attr('data-bg')) {
						return image.attr('data-bg').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
					} else {
						return image.attr('src');
					}
				}

				function revealElement(element) {
					if (!settings.useOpacity) {
						element.show();
					} else {
						element.css('opacity', '1');
					}
					if (element.attr('data-bg')) {
						element.css('background-image', element.attr('data-bg'));
					}
				}
			});
		}
	};

	if (!('forEach' in Array.prototype)) {
		Array.prototype.forEach = function(action, that /*opt*/) {
			for (var i = 0, n = this.length; i < n; i++) {
				if (i in this) {
					action.call(that, this[i], i, this);
				}
			}
		};
	}

	$.fn.preloadingSite = function(method) {

		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.preloading');
		}
	};
})(jQuery);

(function($) {

	var defaults = {
		preloadSelector: true,
		truePercentage: false,
		disableOverlay: false,
		showInContainer: false,
		hideBackground: false,
		hideNonImageElements: false,
		progressiveReveal: false,
		forceSequentialLoad: false,
		silentMode: false,
		debugMode: false,
		useOpacity: true,
		hidePercentage: false,
		loaderText: '',
		animateDuration: 1000,
		fadeOutDuration: 1000,
		showImagesBeforeComplete: true,
		afterEach: function() {},
		beforeComplete: function() {},
		onComplete: function() {}
	};

	var methods = {
		init: function(options) {
			var settings = $.extend({}, defaults, options);

			return this.each(function() {
				var parent = $(this);
				var elementChildren = getAllChildren(parent);
				var imageElements = [];
				var nonImageElements = [];
				var imagesLoaded = 0;
				var totalImages = 0;
				var progressPercentage = 0;
				var totalPercentage = 0;
				var count = 0;
				var minUpdateToValue = 0; 

				var preloadContainer = $('<div id="preloader"></div>');

				if (!settings.showInContainer) {
					preloadContainer.appendTo('body');
					preloadContainer.css('position', 'fixed');
				} else {
					preloadContainer.appendTo(parent);
					parent.css('position', 'relative');
					preloadContainer.css('position', 'absolute');
				}

				if (!settings.disableOverlay) {
					var preloadOverlay = $('<div class="loader_overlay"></div>').appendTo(preloadContainer);
				} else {
					preloadContainer.css('height', 'auto');
				}

				var preloadLoader = $('<div class="loader"></div>').appendTo(preloadContainer);

				if (!settings.hidePercentage) {
					var progressNotification = $('<div class="progress_notification">' + settings.loaderText + ' <span class="progress_percentage">' + progressPercentage + '</span>%</div>').appendTo(preloadLoader);
				} else {
					var progressNotification = $('<div class="progress_notification">' + settings.loaderText + '</div>').appendTo(preloadLoader);
				}

				var progressBar    = $('<div class="progress_bar"></div>').appendTo(preloadLoader);
				var progressLoaded = $('<div class="progress_loaded"></div>').appendTo(progressBar);

				if ($('body').hasClass('home')) {
					progressColor = $('section.active').data('progress-color');
					progressLoaded.css('border-bottom-color', progressColor)
				}

				if (settings.silentMode) {
					preloadContainer.hide();
				}

				if (settings.truePercentage) {
					updateProgressbar(1, 3000); 
				}

				if (settings.debugMode) {
					var startTime = (new Date).getTime();

					console.groupCollapsed('preloading > ', parent);
					console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': scanning DOM for image elements...');
					console.groupCollapsed('image elements');
				}

				elementChildren.forEach(function(child) {
					if (child.is('img') || child.css('background-image') !== 'none' && child.css('background-image').indexOf('gradient') == -1) {
						if (!(settings.preloadSelector && settings.showInContainer && child === parent)) {
							if (!settings.useOpacity) {
								child.hide();
							} else {
								child.css('opacity', '1');
							}
						} else if (settings.hideBackground) {
							child.attr('data-bg', child.css('background-image')).css('background-image', 'none');
						}

						var imageElement = {
							node     : child,
							fileSize : 0
						};

						if (settings.debugMode) {
							console.log(imageElement.node);
						}

						imageElements.push(imageElement);
						totalImages++;
					} else if (settings.hideNonImageElements) {
						if (!settings.useOpacity) {
							child.hide();
						} else {
							child.css('opacity', '0');
						}

						nonImageElements.push(child);
					}
				});

				if (settings.debugMode) {
					console.groupEnd();
					console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': scanning DOM for image elements DONE');
				}

				if (settings.truePercentage) {
					if (settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': getting image sizes...');
						console.groupCollapsed('image sizes');
					}




					imageElements.forEach(function(element) {
						$.ajax({
							type: 'HEAD',
							cache: false,
							url: getImageUrl(element.node),
							success: function(response, message, object) {
								element.fileSize = parseInt(object.getResponseHeader('Content-Length'));
								totalPercentage += element.fileSize;

								if (settings.debugMode) {
									console.log((element.fileSize / 1000).toFixed(2) + ' KB \t' + (totalPercentage / 1000).toFixed(2) + ' KB total');
								}

								continueCounting();
							},
							error: function(object, response, message) {
								continueCounting();

								var markup = '';

								markup += 'Not all of your images were preloaded!<br>';
								markup += 'Loader failed getting image sizes.<br><br>';
								markup += '1. Make sure your images exist.<br>';
								markup += '2. Make sure your image paths/urls are correct.<br>';
								markup += '3. If you load images from a remote domain set <code>truePercentage: false</code>.<br><br>';
								markup += '<button>Close</button>';

								progressNotification.addClass('error').html(markup);
								progressBar.addClass('error');

								settings.fadeOutDuration = 500000;

								$('#preloader button').click(function() {
									preloadContainer.remove();
								});
							}
						});

						function continueCounting() {
							count++;

							if (count === totalImages) {
								if (settings.debugMode) {
									console.groupEnd();
									console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': getting image sizes DONE');
								}

								startPreloading();
							}
						}
					});
				} else {
					if (settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': getting image sizes SKIPPED');
					}

					totalPercentage = totalImages;
					startPreloading();
				}

				function startPreloading() {
					if (settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': preloading image elements...');
						console.groupCollapsed('intervals');
					}

					if (!settings.forceSequentialLoad) {


						if (imageElements.length) {
							imageElements.forEach(function(element, index) {
								var img = $('<img>').attr('src', getImageUrl(element.node));

								img.load(function() {
									updateLoader(element);
								}).error(function() {
									updateLoader(element);
									handleLoadingError(img, element);
								});
							});
			
						} else {

							progressLoaded.animate({
								'width': '100%'
							}, {
								duration: 750,
								easing: 'linear',
								complete: function() {
									settings.beforeComplete.call(this);
									settings.onComplete.call(this);					
									preloadContainer.animate({'opacity':'0'}, settings.fadeOutDuration, function() {
										preloadContainer.remove();
									});
								}
							})

						}
			
					} else {
						(function loadImage(index) {
							var currentElement = imageElements[index];
							var img            = $('<img>').attr('src', getImageUrl(currentElement.node));

							img.load(function() {
								updateLoader(currentElement);

								if (++index < imageElements.length) {
									loadImage(index);
								}
							}).error(function() {
								updateLoader(currentElement);

								if (++index < imageElements.length) {
									loadImage(index);
								}
								handleLoadingError(img, currentElement);
							});
						})(0);
					}
				}

				function handleLoadingError(image, element) {
					element.node.addClass('preloader_not_found_error');
				}

				function updateLoader(element) {
					imagesLoaded++;
					updateProgressPercentage(element);
					updateProgressbar(progressPercentage, undefined, element);

					if (settings.progressiveReveal) {
						revealElement(element.node);
					}

					settings.afterEach.call(element.node);
				}

				function updateProgressPercentage(element) {
					if (settings.truePercentage) {
						progressPercentage += (element.fileSize / totalPercentage) * 100;

						if (imagesLoaded === totalImages) {
							progressPercentage = 100;
						}
					} else {
						progressPercentage = (imagesLoaded / totalPercentage) * 100;
					}
				}

				function updateProgressbar(value, updateDuration, element) {
					updateDuration = updateDuration !== undefined ? updateDuration : settings.animateDuration;
					var totalWidth = 0;
					var updateTo   = value;
					var remaining  = 0;

					if (updateDuration === undefined && settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': ' + value.toFixed(2) + '%');
					}

					if (value < 100) {
						if (element !== undefined) {
							if (element.round === undefined) {
								element.round = 0;

								updateTo  = value / 4 * 3;
								remaining = value / 4;
							} else {
								element.round++;

								updateTo       = value / (4 + element.round) * (3 + element.round);
								remaining      = value / (4 + element.round);
								updateDuration = 200;
							}
						}
					}

					if (element === undefined) {
						element = {};
					}

					if (element.round === undefined) {
						element.round = 0;
					}

					if (updateTo > minUpdateToValue) {
						minUpdateToValue = updateTo;
					}

					if (updateTo < minUpdateToValue) {
						updateTo = minUpdateToValue;
					}

					progressLoaded.stop();

					if (element.round < 30) {
						progressLoaded.animate({'width': updateTo + '%'}, {
							duration: updateDuration,
							easing: 'linear',
							step: function() {
								totalWidth = progressBar.width();

								progressNotification.children('span').html(Math.round((progressLoaded.width() / totalWidth) * 100));
							},
							complete: function() {

								progressNotification.children('span').html(Math.round(updateTo));

								if (imagesLoaded === totalImages) {
									if (settings.debugMode) {
										console.groupEnd();
										console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': preloading image elements DONE');
										console.groupEnd();
									}

									progressLoaded.delay(100).queue(function() {
										if (settings.showImagesBeforeComplete) {
											imageElements.forEach(function(element) {
												revealElement(element.node);
											});

											nonImageElements.forEach(function(element) {
												revealElement(element);
											});

											settings.beforeComplete.call(this);

											settings.onComplete.call(this);
					
											preloadContainer.animate({'opacity':'0'}, settings.fadeOutDuration, function() {
												preloadContainer.remove();
											});
										} else {
											settings.beforeComplete.call(this);

											preloadContainer.animate({'opacity':'0'}, settings.fadeOutDuration, function() {
												imageElements.forEach(function(element) {
													revealElement(element.node);
												});

												nonImageElements.forEach(function(element) {
													revealElement(element);
												});

												preloadContainer.remove();
												settings.onComplete.call(this);
											});
										}
									});
								} else {
									updateProgressbar(value, updateDuration, element);
								}
							}
						});
					}
				}

				function getAllChildren(selector) {
					var selectorChildren = [];

					if (selector.children().length > 0) {
						if (settings.preloadSelector) {
							selectorChildren.push(selector);
						}

						getChildren(selector);
					} else if (settings.preloadSelector) {
						selectorChildren.push(selector);
					}

					function getChildren(element) {
						var children = element.children();

						if (children.length > 0) {
							children.each(function() {
								var _this = $(this);

								selectorChildren.push(_this);

								if (_this.children().length > 0) {
									getChildren(_this);
								}
							});
						}
					}

					return selectorChildren;
				}

				function getImageUrl(image) {
					if (image.css('background-image') !== 'none') {
						return image.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
					} else if (image.css('background-image') === 'none' && image.attr('data-bg')) {
						return image.attr('data-bg').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
					} else {
						return image.attr('src');
					}
				}

				function revealElement(element) {
					if (!settings.useOpacity) {
						element.show();
					} else {
						element.css('opacity', '1');
					}
					if (element.attr('data-bg')) {
						element.css('background-image', element.attr('data-bg'));
					}
				}
			});
		}
	};

	if (!('forEach' in Array.prototype)) {
		Array.prototype.forEach = function(action, that /*opt*/) {
			for (var i = 0, n = this.length; i < n; i++) {
				if (i in this) {
					action.call(that, this[i], i, this);
				}
			}
		};
	}

	$.fn.preloading = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.preloading');
		}
	};
})(jQuery);


(function($) {

	var defaults = {
		preloadSelector: true,
		truePercentage: false,
		disableOverlay: false,
		showInContainer: false,
		hideBackground: false,
		hideNonImageElements: false,
		progressiveReveal: false,
		forceSequentialLoad: true,
		silentMode: false,
		debugMode: false,
		useOpacity: true,
		hidePercentage: false,
		loaderText: '',
		animateDuration: 1000,
		fadeOutDuration: 1000,
		showImagesBeforeComplete: true,
		afterEach: function() {},
		beforeComplete: function() {},
		onComplete: function() {}
	};

	var methods = {
		init: function(options) {
			var settings = $.extend({}, defaults, options);

			return this.each(function() {
				var parent = $(this);
				var elementChildren = getAllChildren(parent);
				var imageElements = [];
				var nonImageElements = [];
				var imagesLoaded = 0;
				var totalImages = 0;
				var progressPercentage = 0;
				var totalPercentage = 0;
				var count = 0;
				var minUpdateToValue = 0; 

				var preloadContainer = $('<div id="single-preloader"></div>');

				if (!settings.showInContainer) {
					preloadContainer.prependTo('section.active');
					preloadContainer.css('position', 'absolute');
				} else {
					preloadContainer.appendTo(parent);
					parent.css('position', 'relative');
					preloadContainer.css('position', 'absolute');
				}

				if (!settings.disableOverlay) {
					var preloadOverlay = $('<div class="loader_overlay"></div>').appendTo(preloadContainer);
				} else {
					preloadContainer.css('height', 'auto');
				}

				var preloadLoader = $('<div class="loader"></div>').appendTo(preloadContainer);

				if (!settings.hidePercentage) {
					var progressNotification = $('<div class="progress_notification">' + settings.loaderText + ' <span class="progress_percentage">' + progressPercentage + '</span>%</div>').appendTo(preloadLoader);
				} else {
					var progressNotification = $('<div class="progress_notification">' + settings.loaderText + '</div>').appendTo(preloadLoader);
				}

				var progressBar    = $('<div class="progress_bar"></div>').appendTo(preloadLoader);
				var progressLoaded = $('<div class="progress_loaded"></div>').appendTo(progressBar);

				if (settings.silentMode) {
					preloadContainer.hide();
				}

				if (settings.truePercentage) {
					updateProgressbar(1, 3000); 
				}

				if (settings.debugMode) {
					var startTime = (new Date).getTime();

					console.groupCollapsed('preloading > ', parent);
					console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': scanning DOM for image elements...');
					console.groupCollapsed('image elements');
				}

				elementChildren.forEach(function(child) {
					if (child.is('img') || child.css('background-image') !== 'none' && child.css('background-image').indexOf('gradient') == -1) {
						if (!(settings.preloadSelector && settings.showInContainer && child === parent)) {
							if (!settings.useOpacity) {
								child.hide();
							} else {
								child.css('opacity', '1');
							}
						} else if (settings.hideBackground) {
							child.attr('data-bg', child.css('background-image')).css('background-image', 'none');
						}

						var imageElement = {
							node     : child,
							fileSize : 0
						};

						if (settings.debugMode) {
							console.log(imageElement.node);
						}

						imageElements.push(imageElement);
						totalImages++;
					} else if (settings.hideNonImageElements) {
						if (!settings.useOpacity) {
							child.hide();
						} else {
							child.css('opacity', '0');
						}

						nonImageElements.push(child);
					}
				});

				if (settings.debugMode) {
					console.groupEnd();
					console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': scanning DOM for image elements DONE');
				}

				if (settings.truePercentage) {
					if (settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': getting image sizes...');
						console.groupCollapsed('image sizes');
					}

					imageElements.forEach(function(element) {
						$.ajax({
							type: 'HEAD',
							cache: false,
							url: getImageUrl(element.node),
							success: function(response, message, object) {
								element.fileSize = parseInt(object.getResponseHeader('Content-Length'));
								totalPercentage += element.fileSize;

								if (settings.debugMode) {
									console.log((element.fileSize / 1000).toFixed(2) + ' KB \t' + (totalPercentage / 1000).toFixed(2) + ' KB total');
								}

								continueCounting();
							},
							error: function(object, response, message) {
								continueCounting();

								var markup = '';

								markup += 'Not all of your images were preloaded!<br>';
								markup += 'Loader failed getting image sizes.<br><br>';
								markup += '1. Make sure your images exist.<br>';
								markup += '2. Make sure your image paths/urls are correct.<br>';
								markup += '3. If you load images from a remote domain set <code>truePercentage: false</code>.<br><br>';
								markup += '<button>Close</button>';

								progressNotification.addClass('error').html(markup);
								progressBar.addClass('error');

								settings.fadeOutDuration = 500000;

								$('#preloader button').click(function() {
									preloadContainer.remove();
								});
							}
						});

						function continueCounting() {
							count++;

							if (count === totalImages) {
								if (settings.debugMode) {
									console.groupEnd();
									console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': getting image sizes DONE');
								}

								startPreloading();
							}
						}
					});
				} else {
					if (settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': getting image sizes SKIPPED');
					}

					totalPercentage = totalImages;
					startPreloading();
				}

				function startPreloading() {
					if (settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': preloading image elements...');
						console.groupCollapsed('intervals');
					}

					if (!settings.forceSequentialLoad) {
						imageElements.forEach(function(element, index) {
							var img = $('<img>').attr('src', getImageUrl(element.node));

							img.load(function() {
								updateLoader(element);
							}).error(function() {
								updateLoader(element);
								handleLoadingError(img, element);
							});
						});
					} else {
						(function loadImage(index) {
							var currentElement = imageElements[index];
							var img            = $('<img>').attr('src', getImageUrl(currentElement.node));

							img.load(function() {
								updateLoader(currentElement);

								if (++index < imageElements.length) {
									loadImage(index);
								}
							}).error(function() {
								updateLoader(currentElement);

								if (++index < imageElements.length) {
									loadImage(index);
								}
								handleLoadingError(img, currentElement);
							});
						})(0);
					}
				}

				function handleLoadingError(image, element) {
					element.node.addClass('preloader_not_found_error');
				}

				function updateLoader(element) {
					imagesLoaded++;
					updateProgressPercentage(element);
					updateProgressbar(progressPercentage, undefined, element);

					if (settings.progressiveReveal) {
						revealElement(element.node);
					}

					settings.afterEach.call(element.node);
				}

				function updateProgressPercentage(element) {
					if (settings.truePercentage) {
						progressPercentage += (element.fileSize / totalPercentage) * 100;

						if (imagesLoaded === totalImages) {
							progressPercentage = 100;
						}
					} else {
						progressPercentage = (imagesLoaded / totalPercentage) * 100;
					}
				}

				function updateProgressbar(value, updateDuration, element) {
					updateDuration = updateDuration !== undefined ? updateDuration : settings.animateDuration;
					var totalWidth = 0;
					var updateTo   = value;
					var remaining  = 0;

					if (updateDuration === undefined && settings.debugMode) {
						console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': ' + value.toFixed(2) + '%');
					}

					if (value < 100) {
						if (element !== undefined) {
							if (element.round === undefined) {
								element.round = 0;

								updateTo  = value / 4 * 3;
								remaining = value / 4;
							} else {
								element.round++;

								updateTo       = value / (4 + element.round) * (3 + element.round);
								remaining      = value / (4 + element.round);
								updateDuration = 200;
							}
						}
					}

					if (element === undefined) {
						element = {};
					}

					if (element.round === undefined) {
						element.round = 0;
					}

					if (updateTo > minUpdateToValue) {
						minUpdateToValue = updateTo;
					}

					if (updateTo < minUpdateToValue) {
						updateTo = minUpdateToValue;
					}

					progressLoaded.stop();

					if (element.round < 30) {
						progressLoaded.animate({'height': updateTo + '%'}, {
							duration: updateDuration,
							easing: 'linear',
							step: function() {
								totalWidth = progressBar.height();

								progressNotification.children('span').html(Math.round((progressLoaded.height() / totalWidth) * 100));
							},
							complete: function() {

								progressNotification.children('span').html(Math.round(updateTo));

								if (imagesLoaded === totalImages) {
									if (settings.debugMode) {
										console.groupEnd();
										console.log((((new Date).getTime() - startTime) / 1000).toFixed(3) + ': preloading image elements DONE');
										console.groupEnd();
									}

									progressLoaded.delay(100).queue(function() {
										if (settings.showImagesBeforeComplete) {
											imageElements.forEach(function(element) {
												revealElement(element.node);
											});

											nonImageElements.forEach(function(element) {
												revealElement(element);
											});

											settings.beforeComplete.call(this);

											settings.onComplete.call(this);

											preloadContainer.animate({'opacity':'0'}, settings.fadeOutDuration, function() {
												preloadContainer.remove();
											});
											
										} else {
											settings.beforeComplete.call(this);

											preloadContainer.animate({'opacity':'0'}, settings.fadeOutDuration, function() {
												imageElements.forEach(function(element) {
													revealElement(element.node);
												});

												nonImageElements.forEach(function(element) {
													revealElement(element);
												});

												preloadContainer.remove();
												settings.onComplete.call(this);
											});
										}
									});
								} else {
									updateProgressbar(value, updateDuration, element);
								}
							}
						});
					}
				}

				function getAllChildren(selector) {
					var selectorChildren = [];

					if (selector.children().length > 0) {
						if (settings.preloadSelector) {
							selectorChildren.push(selector);
						}

						getChildren(selector);
					} else if (settings.preloadSelector) {
						selectorChildren.push(selector);
					}

					function getChildren(element) {
						var children = element.children();

						if (children.length > 0) {
							children.each(function() {
								var _this = $(this);

								selectorChildren.push(_this);

								if (_this.children().length > 0) {
									getChildren(_this);
								}
							});
						}
					}

					return selectorChildren;
				}

				function getImageUrl(image) {
					if (image.css('background-image') !== 'none') {
						return image.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
					} else if (image.css('background-image') === 'none' && image.attr('data-bg')) {
						return image.attr('data-bg').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
					} else {
						return image.attr('src');
					}
				}

				function revealElement(element) {
					if (!settings.useOpacity) {
						element.show();
					} else {
						element.css('opacity', '1');
					}
					if (element.attr('data-bg')) {
						element.css('background-image', element.attr('data-bg'));
					}
				}
			});
		}
	};

	if (!('forEach' in Array.prototype)) {
		Array.prototype.forEach = function(action, that /*opt*/) {
			for (var i = 0, n = this.length; i < n; i++) {
				if (i in this) {
					action.call(that, this[i], i, this);
				}
			}
		};
	}

	$.fn.preloadingSingle = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.preloading');
		}
	};
})(jQuery);