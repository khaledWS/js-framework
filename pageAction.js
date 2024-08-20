class PageAction {
    _event_object; // the Jquery Object of the element that the event has been triggered on
    event; //The Event Object
    action_name; //The name of the Action  (SELECT,CREATE,STORE,EDIT,UPDATE,DELETE,EXECUTE)
    request_method = 'POST';
    controller;
    controller_function; //the name of the controller function to execute
    callback_function; //the callback function to execute after the request is sent (overrides generic callback code)
    target; //The Target for a select Action
    event_handler; // The function to handle the triggered event (overrides everything)
    spinner_on = "body"; //The Location of the loading spinner (body,this,#element,none)
    target_modal; //The Target Modal to open when loading a modal
    action_data = {}; //the data relevant to the action
    form;
    append_data_function;
    hash_id;
    load_type = "LOAD";
    formdata;
    callback_after_function;

    constructor(_event_object = null, event = null) {
        this._event_object = _event_object;
        if (this._event_object != null) {

            let data_event_object = this._event_object.data();

            for (let [key, value] of Object.entries(data_event_object)) {
                if (isDefined(value) && value.length != 0) {
                    if (this.hasOwnProperty(key)) {
                        this[key] = value;
                    }
                }

            }
        }
        if (event != null) {
            this.event = event;
        }
    }

    async execute() {
        //if the controller_function, action name and event handler are all undefined then throw an error and return
        if ((!isDefined(this.action_name) || !isDefined(this.controller_function)) && !isDefined(this.event_handler)) {
            dd('This event has no handler');
            return false;
        }

        //if the event handler attribute is defined then call the function and return
        if (isDefined(this.event_handler)) {
            return window[this.event_handler](this._event_object, this.event);
        }

        //setting up an action
        switch (this.action_name) {
            case "SELECT":
                this.setUpSelectAction();
                break;
            case 'CREATE':
                this.setUpCreateAction();
                break;
            case 'STORE':
                this.setUpStoreAction();
                break;
            case 'EDIT':
                this.setUpEditAction();
                break;
            case 'UPDATE':
                this.setUpUpdateAction();
                break;
            case 'DELETE':
                await this.setUpDeleteAction();
                break;
            case 'EXECUTE':
                break;
            default:
                dd('Action name is not Valid');
                return;
        }

        this._exe();
    }



    setUpSelectAction() {
        if (!isDefined(this.target)) {
            dd('Target must be specified when the action is of type Select');
        }
        if (this._event_object.is('select, input, textarea')) {
            this.action_data.value = this._event_object.val();
        }
    }

    setUpCreateAction() {
        if (isDefined(this.target_modal) && this.action_name == "CREATE") {
            let target = $(window.app.modals_container);
            target.html('');
        }
        return;
    }

    setUpStoreAction() {
        this.event.preventDefault();
        if (!isDefined(this.form)) {
            dd('form must be specified when the action is of type store');
        }
        if (isDefined($(this.form).valid)) {
            if (!$(this.form).valid()) {
                dd('form is not valid');
            }
        }


        var formData = new FormData($(this.form)[0]);
        if (isDefined(this.append_data_function)) {
            formData = window[this.append_data_function](this.form, formData);
        }
        this.formdata = formData;
        this.action_data = formDataToObject(formData, this.action_data);

    }

    setUpEditAction() {
        if (!isDefined(this.hash_id)) {
            dd('Id Must be defined');
        }
    }

    setUpUpdateAction() {
        this.event.preventDefault();
        if (!isDefined(this.hash_id)) {
            dd('Id Must be defined');
        }
        if (!isDefined(this.form)) {
            dd('form must be specified when the action is of type UPDATE');
        }
        if (isDefined($(this.form).valid)) {
            if (!$(this.form).valid()) {
                dd('form is not valid');
            }
        }


        var formData = new FormData($(this.form)[0]);
        if (isDefined(this.append_data_function)) {
            formData = window[this.append_data_function](this.form, formData);
        }
        this.formdata = formData;
        this.action_data = formDataToObject(formData, this.action_data);
        // log(this.action_data);
    }

    async setUpDeleteAction() {
        let result = await areYouSureSwal();
        if (!result) {
            dd('refused');
        }
    }


    _exe() {
        //getting the Url and Method
        var controller_url = window.app.page_url;
        if (isDefined(this.controller)) {
            controller_url = window.app.secondary_page_url[this.controller];
        }
        let request_url = controller_url + '/' + this.controller_function;
        if (isDefined(this.hash_id)) {
            request_url = request_url + '/' + this.hash_id;
        }
        let request_method = this.request_method;

        //Collecting the data of the request
        let url_request_data = this.action_data;

        url_request_data.function = this.controller_function;
        url_request_data.actionName = this.action_name;

        if (isDefined(this.formdata)) {
            url_request_data = this.formdata;
            url_request_data.append('function', this.controller_function);
            url_request_data.append('actionName', this.action_name);
        }


        // log(url_request_data);
        let current_object = this;


        let AjaxObject = {
            url: request_url,
            // dataType: "json",
            type: request_method,
            data: url_request_data,
            // Let the browser set the content type automatically
            beforeSend: function () {
                current_object._spinner();
            },
            success: function (response, status, xhr) {
                validateResponse(response);
                if (isDefined(current_object.callback_function)) {
                    let callbackFunction = current_object.callback_function;
                    current_object.callback_function = undefined;
                    callFunctionByName(callbackFunction, current_object, response);
                } else {
                    current_object.genericCallback(response, current_object);
                }
                if (isDefined(current_object.callback_after_function)) {
                    let callbackFunction = current_object.callback_after_function;
                    callFunctionByName(callbackFunction, current_object, response);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // if (jqXHR.responseJSON.MESSAGE_CODE) {
                //     switch (jqXHR.responseJSON.MESSAGE_CODE) {
                //         case 400:
                //         case 401:
                //             if (jqXHR.responseJSON && jqXHR.responseJSON.STATUS == false) {
                //                 //   dd("m0: show modal login");
                //                 $('#Login_Modal').modal('show');
                //             }
                //             break;

                //         case 419:// refresh csfr token
                //             showNotification('error', "CSRF token mismatch.");
                //             break;
                //         default:
                //             if (current_object.controller_function != 'generatePDF') {
                //                 let err = errorThrown;

                //                 if (jqXHR.responseJSON && jqXHR.responseJSON.MESSAGE) err = jqXHR.responseJSON.MESSAGE;

                //                 showNotification('error', err);
                //             }
                //     }
                // } else {
                //     if (current_object.controller_function != 'generatePDF') {
                //         let err = errorThrown;

                //         if (jqXHR.responseJSON && jqXHR.responseJSON.MESSAGE) err = jqXHR.responseJSON.MESSAGE;

                //         showNotification('error', err);
                //     }
                // }


            },
            complete: function () {
                current_object._spinner(false);
            }
        }

        let ajaxSettings = AjaxObject;
        if (isDefined(this.formdata)) {
            ajaxSettings = $.extend(AjaxObject, {
                processData: false, // Prevent jQuery from processing the FormData
                contentType: false,
            });
        }

        setTimeout(() => {
            $.ajax(ajaxSettings).always(function () {
                current_object._spinner(false);
            }); //complete;
        }, 50);


    }

    genericCallback(response, current_object) {
        current_object.event.preventDefault();
        switch (this.action_name) {
            case 'SELECT':
                this.genericSelectCallback(response, current_object);
                break;
            case 'CREATE':
                this.genericCreateCallback(response, current_object);
                break;
            case 'STORE':
                current_object.sendNotification(response, current_object);
                this.genericStoreCallback(response, current_object);
                break;
            case 'EDIT':
                this.genericEditCallback(response, current_object);
                break;
            case 'UPDATE':
                current_object.sendNotification(response, current_object);
                this.genericUpdateCallback(response, current_object);
                break;
            case 'DELETE':
                current_object.sendNotification(response, current_object);
                this.genericDeleteCallback(response, current_object);
                break;
            case 'EXECUTE':
                current_object.sendNotification(response, current_object);
                this.genericExecuteCallback(response, current_object);
                break;
            default:
                break;
        }
    }

    genericSelectCallback(json, current_object) {
        if (isDefined(window.app.datatable_element)) {
            $(window.app.datatable_element).dataTable().api().draw();
        }

        if ($(this.target).is('select')) {
            if (json.DATATYPE != 'ARRAY') {
                dd('DATATYPE MUST BE OF TYPE ARRAY WHEN THE TARGET IS A SELECT ELEMENT');
            }

            let select = $(this.target);
            let selectData = '';
            selectData = selectData + `<option disabled selected> اختار </option>`;
            json.DATA.forEach(element => {
                selectData = selectData + `<option value="${element.value}">${element.text}</option>`
            });

            select.html(selectData);
            // log(select.html(selectData));

            if (select.hasClass('selectpicker')) {
                select.selectpicker('refresh');
            }
            if (select.hasClass('select2-hidden-accessible')) {
                select.val(null).trigger('change');
            }
        }

        if ($(this.target).is('input, textarea')) {
            if (json.DATATYPE != 'STRING') {
                dd('DATA MUST BE OF TYPE STRING');
            }

            let input = $(this.target);
            input.val(json.DATA);
        }

        if ($(this.target).is('label, span')) {
            if (json.DATATYPE != 'STRING') {
                dd('DATA MUST BE OF TYPE STRING');
            }

            let input = $(this.target);
            input.html(json.DATA);
        }

        if (json.DATATYPE === 'HTML') {
            let target = $(this.target);
            if (this.load_type === 'PREPEND') {
                target.prepend(json.DATA);
            } else if (this.load_type === 'APPEND') {
                target.append(json.DATA);
            } else if (this.load_type === 'REPLACE') {
                target.replace(json.DATA);
            } else if (this.load_type === 'LOAD') {
                target.html(json.DATA);
            }
        }

    }

    genericCreateCallback(json, current_object) {
        if (json.DATATYPE == 'HTML') {
            if (isDefined(current_object.target_modal)) {
                $(current_object.target_modal).remove();
                let target = $(window.app.modals_container);
                target.html(json.DATA);
            } else {
                let target = $(current_object.target);
                if (this.load_type === 'PREPEND') {
                    target.prepend(json.DATA);
                } else if (current_object.load_type === 'APPEND') {
                    target.append(json.DATA);
                } else if (current_object.load_type === 'REPLACE') {
                    target.replace(json.DATA);
                } else if (current_object.load_type === 'LOAD') {
                    target.html(json.DATA);
                }
            }


            if (isDefined(current_object.target_modal)) {
                if ($(current_object.target_modal).attr('uk-offcanvas')) {
                    UIkit.offcanvas(current_object.target_modal).show();
                } else {
                    UIkit.modal(current_object.target_modal).show();
                }
            }
        }
    }

    genericStoreCallback(json, current_object) {
        var element = current_object._event_object;
        // console.log('modal' + element.closest('[uk-modal]').length > 0);
        if (element.closest('[uk-modal]').length > 0) {
            UIkit.modal(element.closest('[uk-modal]')).hide();
            element.closest('.uk-open').remove();
        }

        // console.log(' offcanvas '+element.closest('[uk-offcanvas]').length > 0);
        if (element.closest('[uk-offcanvas]').length > 0) {
            UIkit.modal(element.closest('[uk-offcanvas]')).hide();
        }
        // if($('#test-createForm').parent().find('.congratulation-box').length > 0){
        //     $('#test-createForm').parent().find('.congratulation-box')
        // }
        if (isDefined(window.app.datatable_element)) {
            $(window.app.datatable_element).dataTable().api().draw();
        }
    }

    genericEditCallback(json, current_object) {
        if (json.DATATYPE == 'HTML') {
            if (isDefined(current_object.target_modal)) {
                $(current_object.target_modal).remove();
                let target = $(window.app.modals_container);
                target.html(json.DATA);
            } else {
                let target = $(current_object.target);
                if (this.load_type === 'PREPEND') {
                    target.prepend(json.DATA);
                } else if (this.load_type === 'APPEND') {
                    target.append(json.DATA);
                } else if (this.load_type === 'REPLACE') {
                    target.replace(json.DATA);
                } else if (this.load_type === 'LOAD') {
                    target.html(json.DATA);
                }
            }




            if (isDefined(current_object.target_modal)) {
                if ($(current_object.target_modal).attr('uk-offcanvas')) {
                    UIkit.offcanvas(current_object.target_modal).show();
                } else {
                    UIkit.modal(current_object.target_modal).show();
                }
            }
        }
    }

    genericUpdateCallback(json, current_object) {
        var element = current_object._event_object;
        if (element.closest('[uk-modal]').length > 0) {
            UIkit.modal(element.closest('[uk-modal]')).hide();
            element.closest('.uk-open').remove();
        }
        if (element.closest('[uk-offcanvas]').length > 0) {
            UIkit.modal(element.closest('[uk-offcanvas]')).hide();
        }
        if (isDefined(window.app.datatable_element)) {
            $(window.app.datatable_element).dataTable().api().draw();
        }
    }

    genericDeleteCallback(json, current_object) {
        if (isDefined(window.app.datatable_element)) {
            $(window.app.datatable_element).dataTable().api().draw();
        }
    }

    genericExecuteCallback(json, current_object) {
        if (isDefined(window.app.datatable_element)) {
            $(window.app.datatable_element).dataTable().api().draw();
        }
    }

    _spinner(show = true) {

        if (show) {
            if (this.spinner_on == 'body') {
                $(".loading-wrapper").css("display", "block");
            } else if (this.spinner_on == 'this') {
                if (this._event_object.is(':button, :input[type="button"], :input[type="submit"], a')) {
                    this._event_object.prop("disabled", true);
                    if (this._event_object.find('[type="icon"], ion-icon').length > 0) {
                        this._event_object.find('[type="icon"], ion-icon').css('display', 'none');
                    }
                }
                this._event_object.prepend(getLoader());
            } else if (this.spinner_on == 'none') {
                return;
            } else {

            }
        } else {
            if (this.spinner_on === 'body') {
                $(".loading-wrapper").css("display", "none");
            } else if (this.spinner_on === 'this') {
                if (this._event_object.is(':button, :input[type="button"], :input[type="submit"], a')) {
                    this._event_object.prop("disabled", false);
                    if (this._event_object.find('[type="icon"], ion-icon').length > 0) {
                        this._event_object.find('[type="icon"], ion-icon').css('display', 'block');
                    }
                }
                if (this._event_object.find('[is_spinner="true"]').length > 0) {
                    this._event_object.find('[is_spinner="true"]').remove();
                }
            } else if (this.spinner_on == 'none') {
                return;
            } else {

            }
        }

    }

    sendNotification(json, current_object) {
        let mode = 'SUCCESS';
        let incomingStatus = json.STATUS + '';
        // log(incomingStatus);
        if (incomingStatus.toUpperCase() !== 'TRUE') {
            mode = 'ERROR';
        }
        showNotification(mode, json.MESSAGE);
    }



}
