
(function ($) {
    "use strict";

    /*[ Load page ]
    ===========================================================*/
    $(".animsition").animsition({
        inClass: 'fade-in',
        outClass: 'fade-out',
        inDuration: 1500,
        outDuration: 800,
        linkElement: '.animsition-link',
        loading: true,
        loadingParentElement: 'html',
        loadingClass: 'animsition-loading-1',
        loadingInner: '<div class="loader05"></div>',
        timeout: false,
        timeoutCountdown: 5000,
        onLoadEvent: true,
        browser: [ 'animation-duration', '-webkit-animation-duration'],
        overlay : false,
        overlayClass : 'animsition-overlay-slide',
        overlayParentElement : 'html',
        transition: function(url){ window.location.href = url; }
    });
    
    /*[ Back to top ]
    ===========================================================*/
    var windowH = $(window).height()/2;

    $(window).on('scroll',function(){
        if ($(this).scrollTop() > windowH) {
            $("#myBtn").css('display','flex');
        } else {
            $("#myBtn").css('display','none');
        }
    });

    $('#myBtn').on("click", function(){
        $('html, body').animate({scrollTop: 0}, 300);
    });


    /*==================================================================
    [ Fixed Header ]*/
    var headerDesktop = $('.container-menu-desktop');
    var wrapMenu = $('.wrap-menu-desktop');

    if($('.top-bar').length > 0) {
        var posWrapHeader = $('.top-bar').height();
    }
    else {
        var posWrapHeader = 0;
    }
    

    if($(window).scrollTop() > posWrapHeader) {
        $(headerDesktop).addClass('fix-menu-desktop');
        $(wrapMenu).css('top',0); 
    }  
    else {
        $(headerDesktop).removeClass('fix-menu-desktop');
        $(wrapMenu).css('top',posWrapHeader - $(this).scrollTop()); 
    }

    $(window).on('scroll',function(){
        if($(this).scrollTop() > posWrapHeader) {
            $(headerDesktop).addClass('fix-menu-desktop');
            $(wrapMenu).css('top',0); 
        }  
        else {
            $(headerDesktop).removeClass('fix-menu-desktop');
            $(wrapMenu).css('top',posWrapHeader - $(this).scrollTop()); 
        } 
    });


    /*==================================================================
    [ Menu mobile ]*/
    $('.btn-show-menu-mobile').on('click', function(){
        $(this).toggleClass('is-active');
        $('.menu-mobile').slideToggle();
    });

    var arrowMainMenu = $('.arrow-main-menu-m');

    for(var i=0; i<arrowMainMenu.length; i++){
        $(arrowMainMenu[i]).on('click', function(){
            $(this).parent().find('.sub-menu-m').slideToggle();
            $(this).toggleClass('turn-arrow-main-menu-m');
        })
    }

    $(window).resize(function(){
        if($(window).width() >= 992){
            if($('.menu-mobile').css('display') == 'block') {
                $('.menu-mobile').css('display','none');
                $('.btn-show-menu-mobile').toggleClass('is-active');
            }

            $('.sub-menu-m').each(function(){
                if($(this).css('display') == 'block') { console.log('hello');
                    $(this).css('display','none');
                    $(arrowMainMenu).removeClass('turn-arrow-main-menu-m');
                }
            });
                
        }
    });


    /*==================================================================
    [ Show / hide modal search ]*/
    $('.js-show-modal-search').on('click', function(){
        $('.modal-search-header').addClass('show-modal-search');
        $(this).css('opacity','0');
    });

    $('.js-hide-modal-search').on('click', function(){
        $('.modal-search-header').removeClass('show-modal-search');
        $('.js-show-modal-search').css('opacity','1');
    });

    $('.container-search-header').on('click', function(e){
        e.stopPropagation();
    });


    /*==================================================================
    [ Isotope ]*/
    var $topeContainer = $('.isotope-grid');
    var $filter = $('.filter-tope-group');

    // filter items on button click
    $filter.each(function () {
        $filter.on('click', 'button', function () {
            var filterValue = $(this).attr('data-filter');
            $topeContainer.isotope({filter: filterValue});
        });
        
    });

    // init Isotope
    $(window).on('load', function () {
        var $grid = $topeContainer.each(function () {
            $(this).isotope({
                itemSelector: '.isotope-item',
                layoutMode: 'fitRows',
                percentPosition: true,
                animationEngine : 'best-available',
                masonry: {
                    columnWidth: '.isotope-item'
                }
            });
        });
    });

    var isotopeButton = $('.filter-tope-group button');

    $(isotopeButton).each(function(){
        $(this).on('click', function(){
            for(var i=0; i<isotopeButton.length; i++) {
                $(isotopeButton[i]).removeClass('how-active1');
            }

            $(this).addClass('how-active1');
        });
    });

    /*==================================================================
    [ Filter / Search product ]*/
    $('.js-show-filter').on('click',function(){
        $(this).toggleClass('show-filter');
        $('.panel-filter').slideToggle(400);

        if ($('.js-show-search').hasClass('show-search')) {
            $('.js-show-search').removeClass('show-search');
            $('.panel-search').slideUp(400);
        }    
    });

    $('.js-show-search').on('click',function(){
        $(this).toggleClass('show-search');
        $('.panel-search').slideToggle(400);

        if ($('.js-show-filter').hasClass('show-filter')) {
            $('.js-show-filter').removeClass('show-filter');
            $('.panel-filter').slideUp(400);
        }    
    });

    $('#color-filter>li>a').on('click', function(event){
        event.preventDefault();
        let color = $(e.target).text();
        if ($('.js-show-filter').hasClass('show-filter')) {
            $('.js-show-filter').removeClass('show-filter');
            $('.panel-filter').slideUp(400);
        }
        window.location.href = `/product/color/${color}`;

    });

    $(document).on('keypress',function(e) {
        if (e.which == 13 && $('.js-show-search').hasClass('show-search')) {
            // alert('You pressed enter! Here is path name: ' + window.location.pathname);
            window.location.href = "/product/search/" + $('[name=search-product]').val().split(' ').join('+');

/* 
https://www.amazon.com/s?k=butter+farts&s=price-desc-rank&qid=1555269068&ref=sr_st_price-desc-rank
Goal: display this bar under the search box:
<div class="a-section a-spacing-small a-spacing-top-small">
                <span>1-48 of 472 results for</span><span> </span><span class="a-color-state a-text-bold">"butter tarts"</span>
            </div>

<div class="a-section a-spacing-small a-spacing-top-small">
    <span>1-48 of 152 results for</span><span> </span><span class="a-color-state a-text-bold">"chocolate penis"</span>
</div>
            */

        }
    });

    /*==================================================================
    [ Cart ]*/
    $(document.body).on('click', '.js-show-cart', function(){
        $('.js-panel-cart').addClass('show-header-cart');
    });

    $(document.body).on('click', '.js-hide-cart', function(){
        $('.js-panel-cart').removeClass('show-header-cart');
    });

    /*==================================================================
    [ Cart ]*/
    $('.js-show-sidebar').on('click',function(){
        $('.js-sidebar').addClass('show-sidebar');
    });

    $('.js-hide-sidebar').on('click',function(){
        $('.js-sidebar').removeClass('show-sidebar');
    });

    /*==================================================================
    [ +/- num product shopping-cart ]*/
    const changeQuantity = (prodId, qtyChange, csrf) => {
        
        // const prodId = btn.parent().children('[name=productId]').val();
        // const csrf = btn.parent().children('[name=_csrf]').val();
      
        fetch(`/change-cart/${prodId}/${qtyChange}`, {
          method: 'PATCH',
          headers: {
            'csrf-token': csrf
          }
        })
          .then(result => {
            return result.json();
          })
          .then(data => {
            console.log(data);
            if (data.fullCart) {
                $('form.bg0').replaceWith(data.fullCart);
            }
            if (data.cart) {
                $('div.wrap-header-cart').replaceWith(data.cart);
            }
            if (data.showCart) {
                $('.limiter-menu-desktop .js-show-cart').replaceWith(data.showCart);
            }
            if (data.showCartMobile) {
                $('.wrap-header-mobile .js-show-cart').replaceWith(data.showCartMobile);
            }
          })
          .catch(err => {
            console.log(err);
          });
      };

    $(document.body).on('click', '.btn-num-product-down.shopping-cart', function(){
        var numProduct = Number($(this).next().val());
        if(numProduct > 0) $(this).next().val(--numProduct);
        const prodId = $(this).parent().children('[name=productId]').val();
        const csrf = $(this).parent().children('[name=_csrf]').val();
        if (Number($(this).next().val()) === 0) {
            $(`#${prodId}`).remove();
        }
        changeQuantity(prodId, -1, csrf);
    });

    $(document.body).on('click', '.btn-num-product-up.shopping-cart', function(){
        var numProduct = Number($(this).prev().val());
        $(this).prev().val(numProduct + 1);
        const prodId = $(this).parent().children('[name=productId]').val();
        const csrf = $(this).parent().children('[name=_csrf]').val();
        changeQuantity(prodId, 1, csrf);
    });

    /*==================================================================
    [ +/- num product add-to-cart ]*/
    $('.btn-num-product-down.add-to-cart').on('click', function(){
        var numProduct = Number($(this).next().val());
        if(numProduct > 0) $(this).next().val(--numProduct);
        $(this).parent().parent().parent().parent().find('[name=num-product]').val(numProduct);
    });

    $('.btn-num-product-up.add-to-cart').on('click', function(){
        var numProduct = Number($(this).prev().val());
        $(this).prev().val(++numProduct);
        $(this).parent().find('[name=num-product]').val(numProduct);
    });

    $('.js-addcart-detail').each(function(){
        const nameProduct = $(this).parent().parent().parent().parent().find('.js-name-detail').html();
        
        $(this).on('click', function() {
            const productId = $(this).parent().find('[name=productId]').val();
            const numProduct = $(this).parent().find('[name=num-product]').val();
            const csrf = $(this).parent().find('[name=_csrf]').val();
            changeQuantity(productId, numProduct, csrf);
            swal(nameProduct, "is added to cart !", "success");
            $('.js-modal-all').removeClass('show-modal1');
        });
    });

    /*==================================================================
    [ +/- add-to-wishlist ]*/

    const addRemoveFromWishlist = (prodId, add, csrf) => {
      
        fetch(`/wishlist/${prodId}/${add}`, {
          method: 'PATCH',
          headers: {
            'csrf-token': csrf
          }
        })
          .then(result => {
            return result.json();
          })
          .then(data => {
            console.log(data);
            if (data.linkToWishlist) {
                $('.dis-block.p-l-22.icon-header-noti').replaceWith(data.linkToWishlist);
            }
            if (data.linkToWishlistMobile) {
                $('.dis-block.p-l-10.icon-header-noti').replaceWith(data.linkToWishlistMobile);
            }
          })
          .catch(err => {
            console.log(err);
          });
      };

    $('.js-addwish-b2').on('click', function(e){
        e.preventDefault();
    });

    $('.js-addwish-b2').each(function(){
        var nameProduct = $(this).parent().parent().find('.js-name-b2').html();
        //let prod_id = $(this).attr('id');
        const prodId = $(this).parent().children('[name=productId]').val();
        const csrf = $(this).parent().children('[name=_csrf]').val();
        $(this).on('click', function(){

            if ($(this).hasClass('js-addedwish-b2')) {
                $(this).removeClass('js-addedwish-b2');
                addRemoveFromWishlist(prodId, 0, csrf);
            } else {
                $(this).addClass('js-addedwish-b2');
                swal(nameProduct, "is added to wishlist !", "success");
                addRemoveFromWishlist(prodId, 1, csrf);
            }
            // $(this).off('click');
        });
    });
    /*==================================================================
    [ Rating ]*/
    $('.wrap-rating').each(function(){
        var item = $(this).find('.item-rating');
        var rated = -1;
        var input = $(this).find('input');
        $(input).val(0);

        $(item).on('mouseenter', function(){
            var index = item.index(this);
            var i = 0;
            for(i=0; i<=index; i++) {
                $(item[i]).removeClass('zmdi-star-outline');
                $(item[i]).addClass('zmdi-star');
            }

            for(var j=i; j<item.length; j++) {
                $(item[j]).addClass('zmdi-star-outline');
                $(item[j]).removeClass('zmdi-star');
            }
        });

        $(item).on('click', function(){
            var index = item.index(this);
            rated = index;
            $(input).val(index+1);
        });

        $(this).on('mouseleave', function(){
            var i = 0;
            for(i=0; i<=rated; i++) {
                $(item[i]).removeClass('zmdi-star-outline');
                $(item[i]).addClass('zmdi-star');
            }

            for(var j=i; j<item.length; j++) {
                $(item[j]).addClass('zmdi-star-outline');
                $(item[j]).removeClass('zmdi-star');
            }
        });
    });
    
    /*==================================================================
    [ Show modal1 ]*/
    $('.js-show-modal1').on('click',function(e){
        e.preventDefault();
        $(`.js-modal${$(this).attr('id')}`).addClass('show-modal1');
    });

    $('.js-hide-modal1').on('click',function(){
        $('.js-modal-all').removeClass('show-modal1');
    });



})(jQuery);