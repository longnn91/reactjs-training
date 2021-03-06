(function($) {
    "use strict";
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    }
    var windowWidth = window.innerWidth,
        windowHeight = $(window).height(),
        paginationSlider = ['<i class="fa fa-caret-left"></i>', '<i class="fa fa-caret-right"></i>'];

    function grid() {
        if ($('.blog-grid').length) {
            setTimeout(function() {
                $('.post-wrapper', '.blog-grid ').masonry({
                    columnWidth: '.grid-item',
                    itemSelector: '.grid-item'
                });
            }, 1);
        }
    }

    function piPlaceholder() {
        var $ph = $('input[type="search"], input[type="text"], input[type="email"], textarea');
        $ph.each(function() {
            var $this = $(this),
                value = $this.val();
            $this.on("focus", function() {
                if ($(this).val() === value) {
                    $(this).val('');
                }
            });
            $this.on("blur", function() {
                if ($(this).val() === '') {
                    $(this).val(value);
                }
            });
        });
    }

    function timeLine() {
        if ($('.blog-timeline').length) {
            var scrollTop = $(window).scrollTop(),
                windowHeight = $(window).height(),
                lineOffsetTop = $('.blog-timeline .content').offset().top,
                topLine = scrollTop - lineOffsetTop;
            $('.pi-line', '.post-wrapper').css({
                'top': '0',
                '-webkit-transform': 'translateY(' + topLine + 'px)',
                '-o-transform': 'translateY(' + topLine + 'px)',
                '-ms-transform': 'translateY(' + topLine + 'px)',
                '-moz-transform': 'translateY(' + topLine + 'px)',
                'transform': 'translateY(' + topLine + 'px)'
            });
            $('.blog-timeline .post-meta').each(function() {
                var $this = $(this),
                    offsetTop = $this.offset().top,
                    light = offsetTop - (windowHeight / 2);
                if (scrollTop >= light) {
                    $this.addClass('metaLight');
                } else {
                    $this.removeClass('metaLight');
                }
            });
        }
    }
    var piPostSlider = function() {
        var $piPostSlider = $(".post-slider");
        if ($piPostSlider.length > 0) {
            $piPostSlider.owlCarousel({
                autoPlay: false,
                slideSpeed: 300,
                navigation: true,
                pagination: false,
                singleItem: true,
                autoHeight: true,
                navigationText: paginationSlider
            });
        }
    }
    var piFeaturesSlider = function() {
        var $featuredSlider = $(".featured-slider");
        if ($featuredSlider.length > 0) {
            $featuredSlider.owlCarousel({
                autoPlay: 20000,
                slideSpeed: 300,
                navigation: true,
                pagination: false,
                items: 5,
                itemsCustom: [
                    [0, 1],
                    [500, 2],
                    [992, 3],
                    [1200, 4],
                    [1400, 5]
                ],
                navigationText: paginationSlider
            });
        }
    }
    var piAjaxSubscribe = {
        obj: {
            subscribeEmail: $('#subscribe-email'),
            subscribeButton: $('#subscribe-button'),
            subscribeMsg: $('#subscribe-form .subscribe-status'),
            subscribeContent: $("#subscribe-form .form-remove"),
            dataMailchimp: $('#subscribe-form').attr('data-mailchimp'),
            success_message: 'Thank you for joining our mailing list. Please check your email for a confirmation link.',
            failure_message: 'There was a problem processing your submission.',
            noticeError: '{msg}',
            noticeInfo: '{msg}',
            basicAction: 'mail/subscribe.php',
            mailChimpAction: 'mail/subscribe-mailchimp.php'
        },
        eventLoad: function() {
            var objUse = piAjaxSubscribe.obj;
            $(objUse.subscribeButton).on('click', function(event) {
                if (objUse.subscribeEmail.val() != '') {
                    if (window.ajaxCalling) return;
                    var isMailchimp = objUse.dataMailchimp === 'true';
                    if (isMailchimp) {
                        piAjaxSubscribe.ajaxCall(objUse.mailChimpAction);
                    } else {
                        piAjaxSubscribe.ajaxCall(objUse.basicAction);
                    }
                } else {
                    objUse.subscribeMsg.html('Email is required.').fadeIn('slow');
                }
            });
        },
        ajaxCall: function(action) {
            window.ajaxCalling = true;
            var objUse = piAjaxSubscribe.obj;
            var messageDiv = objUse.subscribeMsg.html('').hide();
            objUse.subscribeButton.val("Sending");
            $.ajax({
                url: action,
                type: 'POST',
                dataType: 'json',
                data: {
                    subscribeEmail: objUse.subscribeEmail.val()
                },
                success: function(responseData, textStatus, jqXHR) {
                    if (responseData.status) {
                        objUse.subscribeContent.fadeOut(500, function() {
                            messageDiv.html(objUse.success_message).fadeIn(500);
                        });
                    } else {
                        switch (responseData.msg) {
                            case "email-required":
                                messageDiv.html(objUse.noticeError.replace('{msg}', 'Email is required.'));
                                break;
                            case "email-err":
                                messageDiv.html(objUse.noticeError.replace('{msg}', 'Email invalid.'));
                                break;
                            case "duplicate":
                                messageDiv.html(objUse.noticeError.replace('{msg}', 'Email is duplicate.'));
                                break;
                            case "filewrite":
                                messageDiv.html(objUse.noticeInfo.replace('{msg}', 'Mail list file is open.'));
                                break;
                            case "undefined":
                                messageDiv.html(objUse.noticeInfo.replace('{msg}', 'undefined error.'));
                                break;
                            case 'not-support':
                                messageDiv.html(objUse.noticeInfo.replace('{msg}', 'Your host do not support php mail function.'));
                                break;
                            case "api-error":
                                objUse.subscribeContent.fadeOut(500, function() {
                                    messageDiv.html(objUse.failure_message);
                                });
                        }
                        objUse.subscribeButton.val("Send");
                        messageDiv.fadeIn(500);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert('Connection error');
                },
                complete: function(data) {
                    window.ajaxCalling = false;
                }
            });
        }
    };
    var piTwitterSlider = function() {
        $(".twitter-slider").owlCarousel({
            autoPlay: false,
            slideSpeed: 300,
            navigation: true,
            pagination: false,
            singleItem: true,
            autoHeight: true,
            transitionStyle: 'fade',
            navigationText: ['<i class="fa fa-caret-left"></i>', '<i class="fa fa-caret-right"></i>']
        });
    }

    function piLastestTweets() {
        if ($().tweet) {
            $('.latest-tweets').each(function() {
                var $this = $('.latest-tweets');
                $this.tweet({
                    username: $this.data('username'),
                    join_text: "auto",
                    avatar_size: null,
                    count: $this.data('number'),
                    template: "{text}",
                    loading_text: "loading tweets...",
                    modpath: $this.data('modpath'),
                    callback: piTwitterSlider,
                })
            });
        }
    };

    function navFixed() {
        var menu = $('.pi-navigation'),
            calScroll = $('#header').offset().top + $('#header').outerHeight() - 52,
            windowScroll = $(window).scrollTop();
        if (windowScroll >= calScroll) {
            menu.addClass('nav-fixed');
        } else {
            menu.removeClass('nav-fixed');
        }
    }
    $(document).ready(function() {
        piAjaxSubscribe.eventLoad();
        if (isMobile.any()) {
            $('html').addClass('ismobile');
        }
        $(document).on("click", ".share-toggle", function(event) {
            var $this = $(this);
            $this.toggleClass('toggle-active');
            $this.siblings('.share').toggleClass('share-active');
        });
        $('.icon-search', '.search-box').on("click", function(event) {
            $(this).toggleClass('active');
            $('.search-box input[type="search"]').toggleClass('fadein');
        });
        $('html').on("click", function(event) {
            $('.search-box .icon-search').removeClass('active');
            $('.search-box input[type="search"]').removeClass('fadein');
        });
        $('.search-box').on("click", function(evt) {
            evt.stopPropagation();
        });
        $('.pi-line').height($(window).height() / 2);
        $(window).scroll(function() {
            timeLine();
            navFixed();
        });
    });
    $(window).on('load resize', function() {
        var $siderbarRight = $(".sidebar-right"),
            $sidebarLeft = $(".sidebar-left");
        $siderbarRight.closest('.blog-standard').find('.content').css('margin-right', '100px');
        $sidebarLeft.closest('.blog-standard').find('.content').css({
            'margin-left': '30px',
            'margin-right': '70px'
        });
        $siderbarRight.closest('.blog-grid, .blog-list, .blog-timeline').find('.content').css('margin-right', '30px');
        $sidebarLeft.closest('.blog-grid, .blog-list, .blog-timeline').find('.content').css('margin-left', '30px');
        $sidebarLeft.closest('.blog-content').find('.col-md-9').addClass('col-md-push-3');
        $sidebarLeft.closest('.blog-content').find('.col-md-3').addClass('col-md-pull-9');
        $('.blog-standard .post').each(function() {
            var $this = $(this),
                $postmeta = $this.find('.post-meta'),
                $posttitle = $this.find('.post-title'),
                $postmedia = $this.find('.post-media');
            if (window.innerWidth < 992) {
                $postmeta.insertAfter($posttitle);
            } else {
                $postmeta.insertAfter($postmedia);
            }
        });
        $('.blog-list .post').each(function() {
            var $this = $(this),
                $postmeta = $this.find('.post-meta'),
                $posttitle = $this.find('.post-title'),
                $postauthor = $this.find('.post-author'),
                $postmedia = $this.find('.post-media');
            $postauthor.insertAfter($postmeta.children().first());
            $postmeta.insertAfter($posttitle);
        });
        $('.pi-navigation').each(function() {
            var menu = $(this),
                openMenu = menu.find('.open-menu'),
                closeMenu = menu.find('.close-menu'),
                menuList = menu.find('.navlist'),
                subMenu = menu.find('.sub-menu'),
                header = $('#header'),
                windowWidth = window.innerWidth,
                windowHeight = $(window).height(),
                menuType = menu.data('menu-responsive');
            if (windowWidth < menuType) {
                openMenu.show();
                header.addClass('header-responsive');
                menuList.addClass('off-canvas').css('height', windowHeight - 52);
                menuList.children('.menu-item-has-children').removeClass('item-plus');
                if (menu.find('.submenu-toggle').length === 0) {
                    $('.menu-item-has-children, .navList > .menu-item-language-current').children('a').after('<span class="submenu-toggle"><i class="fa fa-angle-right"></i></span>');
                    menuList.on('click', '.submenu-toggle', function(evt) {
                        evt.preventDefault();
                        $(this).siblings('.sub-menu').addClass('sub-menu-active');
                    });
                }
                subMenu.each(function() {
                    var $this = $(this);
                    if ($this.find('.back-mb').length === 0) {
                        $this.prepend('<li class="back-mb"><a href="#">Back</a></li>');
                    }
                    menu.on('click', '.back-mb a', function(evt) {
                        evt.preventDefault();
                        $(this).parent().parent().removeClass('sub-menu-active');
                    });
                });
                openMenu.on('click', function() {
                    menuList.addClass('off-canvas-active');
                    $(this).addClass('toggle-active');
                    closeMenu.show();
                });
                closeMenu.on('click', function() {
                    menuList.removeClass('off-canvas-active');
                    openMenu.removeClass('toggle-active');
                    $('.sub-menu').removeClass('sub-menu-active');
                    $(this).hide();
                });
                $('html').on('click', function() {
                    menuList.removeClass('off-canvas-active');
                    openMenu.removeClass('toggle-active');
                    $('.sub-menu').removeClass('sub-menu-active');
                    closeMenu.hide();
                });
                menu.on('click', function(evt) {
                    evt.stopPropagation();
                });
            } else {
                openMenu.hide();
                header.removeClass('header-responsive');
                menuList.removeClass('off-canvas').css('height', 'auto');
                menuList.children('.menu-item-has-children').addClass('item-plus');
                $('.back-mb, .submenu-toggle').remove();
            }
        });
    });
    $(document).ready(function() {
        $('#preloader').fadeOut(1000);
        piLastestTweets();
        grid();
        piPlaceholder();
        piPostSlider();
        piFeaturesSlider();
    });
})(jQuery);
