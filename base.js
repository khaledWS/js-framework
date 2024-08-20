$(document).ready(function () {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
});

function setUpPageLoaderObserver() {
    var element = $('.loading-wrapper'); // Replace 'yourElementId' with the actual ID of your element
    $('body').css('overflow', 'hidden');
    // Create a new MutationObserver
    var loaderObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                let loader = $('.loading-wrapper');
                if (loader.css('display') == 'block') {
                    $('body').css('overflow', 'hidden');
                }
                if (loader.css('display') == 'none') {
                    $('body').css('overflow', 'auto');
                }
            }
        });
    });

    // Configure and start observing the element0
    var observerConfig = {
        attributes: true, // Watch for attribute changes
        attributeFilter: ['style'], // Only watch for style attribute changes
    };

    loaderObserver.observe(element[0], observerConfig);

}

setUpPageLoaderObserver();

$(document).on("click", ".delete-file", async function (event) {
    var _this = $(this);
    var action = _this.attr("url");
    var deleteBtn = $(this).data("delete");
    let result = await areYouSureSwal();
    if (!result) return;
    $.ajax({
        type: "post",
        url: action,
        contentType: "application/json",
        success: function (data) {
            if (data.STATUS) {
                var deleteElemet = $('[data-file="' + deleteBtn + '"]');
                $(deleteElemet).animate({
                    height: 0
                }, 200);
                $(deleteElemet).fadeIn(650);
                $(deleteElemet).remove();
                showNotification('SUCCESS', data.MESSAGE);
            } else
                showNotification('ERROR', data.MESSAGE);
        },
        error: function (data) {
            showNotification('ERROR', data.MESSAGE);
        },
    });
});


