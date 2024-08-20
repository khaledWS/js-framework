var genericDatatableOptions = {
    ordering: false,
    processing: true,
    serverSide: true,
    searching: false,
    bStateSave: !0,
    lengthMenu: [
      [5, 10, 15, 20, -1],
      [5, 10, 15, 20, "All"],
    ],
    pageLength: 10,
    columnDefs: [
      { orderable: !1, targets: [0] },
      { searchable: !1, targets: [0] },
      { className: "dt-right" },
    ],
    // order: [[2, "asc"]],
    createdRow: function (row, data, dataIndex) {
      $(row).attr("data-id", data.id);
    },
    ajax: {
        url: '',
        type: "GET",
        // dataSrc: function (json) {
        //     if (validateResponseAsAlert(json)) {
        //         try {
        //             json.recordsTotal = json.PAGINATION.TOTAL_ROWS;
        //             json.recordsFiltered = json.PAGINATION.TOTAL_ROWS;
        //         } catch (error) {
        //             if(Array.isArray(json.DATA)){
        //                 json.recordsTotal = json.DATA.length;
        //                 json.recordsFiltered = json.DATA.length;
        //             }else{
        //                 json.recordsTotal = 100;
        //                 json.recordsFiltered = 100;
        //             }
        //         }
        //         return json.DATA;
        //     }
        //     json.recordsTotal = 0;
        //     json.recordsFiltered = 0;
        //     return [];
        // },
        data: function (filters) {
            var searchdata = getData($("#searchBolckUI"),false);
            filters.function = 'DataTable';
            filters.actionName = 'SELECT';
            filters.data = JSON.stringify(searchdata) ;
            filters.action = 'execute';
        },
        error: function (jqXHR, textStatus, errorThrown) {

            if(jqXHR.responseJSON.STATUS == false && (jqXHR.responseJSON.MESSAGE_CODE == 401 || jqXHR.responseJSON.MESSAGE_CODE == 400 )){
               // dd("m2: show modal login");
                $('#Login_Modal').modal('show');
            }else{
                let err = jqXHR.responseJSON.MESSAGE;
                showNotification('error', err);
            }
        }
    },
    language: {
        sProcessing: "جارٍ التحميل...",
        sLengthMenu: "أظهر _MENU_ مدخلات",
        sZeroRecords: "لم يعثر على أية سجلات",
        sInfo: "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
        sInfoEmpty: "يعرض 0 إلى 0 من أصل 0 سجل",
        sInfoFiltered: "(منتقاة من مجموع _MAX_ مُدخل)",
        sInfoPostFix: "",
        sUrl: "",
        oPaginate: {
            sFirst: "الأول",
            sPrevious: "السابق",
            sNext: "التالي",
            sLast: "الأخير"
        }
    },


};
