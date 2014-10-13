module.exports = function (value) {
    if (value === true || value === 'true')
        return '<i class="icon icon-check text-success"></i>'

    if (value === false || value === 'false')
        return '<i class="icon icon-times text-danger"></i>'

    if (value === 'selectall')
        return '<i v-on="click: selectAll" v-class="icon-check-square-o:allChecked, icon-square-o:!allChecked" class="icon"></i>'

    if (value === 'select')
       return '<i v-on="click: select(this)" v-class="icon-check-square-o:vui_checked, icon-square-o:!vui_checked" class="icon"></i>' 
}
