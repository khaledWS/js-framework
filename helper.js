/**
 * if the given selector is an #id it returns the jquery object if the element if the element exists
 * if the given selector is not an id and event_object is given then it gets the closest element to the event object with that selector identifier
 * otherwise it returns null
 * @param string selector
 * @param jquery event_object=null
 * @returns jquery|null
 */
function getSelector(selector, event_object = null) {
    if (typeof selector === "string" && selector.length > 0) {
        if (selector.indexOf("#") != -1) {
            return $(selector);
        } else if (event_object != null) {
            return event_object.closest(selector);
        }
    }
    return null;
}



/**
 * returns true if the given element/property is defined otherwise it returns false
 * @param {any} property
 * @returns bool
 */
function isDefined(property) {
    return property != undefined;
}



function callFunctionByName(funcName, current_object = null, json = null, pageaction = null) {
    let fn = null;
    let status = true;

    /*
     * If function has a scope (namespace) like this: "myScope.myFunction"
     */
    if (funcName.indexOf(".") != -1) {
        var ns = funcName.split(".");
        if (ns && ns.length == 2) {
            fn = window[ns[0]][ns[1]];
        } else {
            dd("Function with multiple scopes not supported: " + funcName);
        }
    }
    /*
     * Else function is just a plain string with no scope.
     */
    else {
        fn = window[funcName];
    }
    //fn is always undefined
    if (typeof fn === "function") {
        status = fn(current_object, json);
    } else {

        dd("Function not defined : " + funcName);
    }
    return status;
}



function showNotification(mode, msg) {
    //mode success, error, warning, info
    icon = "";
    html = '';
    mode = mode.toUpperCase();
    if(msg){
        switch (mode) {
            case 'SUCCESS':
                toastr.success(msg);
                break;
            case 'ERROR':
                toastr.error(msg);
                break;
            case 'WARNING':
                toastr.warning(msg);
                break;
            default:
                toastr.info(msg);
                break;
        }
    }
    
}


/**
 * to display data in dd
 */
function dd(data) {
    throw new Error(data);
}

/**
 * to display data in console
 */
function log(data) {
    console.log(data);
}



function getLoader() {
    return '<div class="spinner-border spinner-border-sm text-light spinner-loading ml-2" is_spinner="true" role="status"></div>'
}

async function areYouSureSwal() {
    return new Promise((resolve) => {
        Swal.fire({
            text: "هل انت متاكد من عملية الحذف ؟",
            confirmButtonClass: "btn btn-success btn-sm",
            cancelButtonClass: "btn btn-danger btn-sm",
            confirmButtonText: "حذف",
            cancelButtonText: " إلغاء",
            showCancelButton: true,
        }).then(function (result) {
            if (result.value) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}


function validateResponse(response) {
    if (!isDefined(response.STATUS) || !isDefined(response.CODE)) {
        dd('invalid Response');
    }

    // if(response.DATATYPE == 'HTML'){
    //     if(!isDefined(response.LOAD_TYPE)){
    //         dd('invalid Response');
    //     }
    // }

}

function getLibraryUrl(library) {
    switch (library) {
        case 'validation':
            return appUrl + '/assets/global/js/libraries/jquery.validate.js'; // Replace with actual URL
        case 'bootstrap-select':
            return 'url_to_bootstrap_select.js'; // Replace with actual URL
        case 'daterangepicker':
            return 'url_to_daterangepicker.js'; // Replace with actual URL
        default:
            return ''; // Return default URL or handle the case
    }
}


function defineEvents() {
    var array = [
        {
            event: 'click',
            elements: '[data-event_on="click"]'
        },
        {
            event: 'keyup',
            elements: '[data-event_on="keyup"]'
        },
        {
            event: 'submit',
            elements: '[data-event_on="submit"]'
        },
        {
            event: 'change',
            elements: '[data-event_on="change"]'
        },
    ];

    array.forEach(function (elem) {
        let eventname = elem.event;
        $(document).on(eventname, elem.elements, function (event) {
            let ob = new PageAction($(this), event);
            ob.execute();
            if (window.app.debugging == true) {
                console.log(`Event "${eventname}" triggered on element:`, this);
                console.log(`pageAction Object:`, ob);
            }
        });
    });


}

function formDataToObject(formData, object) {
    formData.forEach((value, key) => {
        object[key] = value;
    });
    return object
}


function addKeyword(element, event) {
    if ($(element).is('input')) {
        var input = $(element);
    } else {
        var input = $(element).siblings('input');
    }
    if (!isDefined(input)) return;
    let list = input.parent().siblings('.keywords-list');

    let real_input = input.parent().siblings('[real-input]');
    if (input.val() == "") {
        return;
    }
    var $newKeyword = $(
        "<span class='keyword'><span class='keyword-remove' data-event_on=\"click\" data-event_handler=\"removeKeyword\"></span><span class='keyword-text'>" +
        input.val() +
        "</span></span>"
    );
    list.append($newKeyword);
    list.trigger('resizeContainer');
    input.val("");

    populateKeywordsInput(list, real_input);
}


function removeKeyword(element, event) {
    let container = $(element).parent().parent();
    let input = container.siblings('[real-input]');
    $(element).parent().remove();
    container.trigger("resizeContainer");

    populateKeywordsInput(container, input);

}


function populateKeywordsInput(container, input) {
    let keywords = container.find('.keyword-text').get().map(function (element) {
        return $(element).html().trim();
    });
    if(keywords.length){
        input.val(JSON.stringify(keywords));

    }else{
        input.val(null);

    }
}


