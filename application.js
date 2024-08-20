class Application {
    page_url;
    datatable_element;
    debugging = true;
    modals_container = "#results-modals";
    event_index_reached = 0;
    secondary_page_url;

    constructor(object) {
        if(!isDefined(object.page_url)){
            alert('no page url is specified');
            return;
        }

        this.page_url = object.page_url;

        if(isDefined(object.debugging)){
            this.debugging = object.debugging;
        }

        if(isDefined(object.secondary_page_url)){
            this.secondary_page_url = object.secondary_page_url;
        }
    }

    defineEvents(){
        defineEvents();
    }

    definePageDatatable( object ,functionName ='dataTable' ){
        let element = object.tableElementId;
        this.datatable_element = element;
        let options = object.options;
        let url = this.page_url+'/'+functionName;
        options.ajax.url =url;
        let settings = $.extend(genericDatatableOptions, options);
        return $(element).dataTable(settings);
    }

    loadLibraries(modal_id,libraries){
        alert('hello');
              libraries.forEach(function(library) {
                var scriptUrl = getLibraryUrl(library);

                $.getScript(scriptUrl, function() {
                  log(library + ' loaded');
                });
              });
              localStorage.setItem('librariesLoaded'+modal_id, true);
    }

    setUpValidation(form, validation) {
        $(document).ready(function(){
            let opt = {
                errorClass: 'errors',
                errorPlacement: function (error, element) {
                    if (element.is("select") || element.attr("type") == "radio" ) {
                        error.insertAfter(element.parent());
                    } else {
                        error.insertAfter(element);
                    }
                },
                rules: validation.rules,
                messages: validation.messages,
                highlight: function(element) {
                    $(element).addClass('borderError'); // Add class to input on error
                  },
                  unhighlight: function(element) {
                    $(element).removeClass('borderError'); // Remove class from input on success
                  },
                }
            log(form);
            log(opt);
            $(form).validate(opt);
        });
    }
}
