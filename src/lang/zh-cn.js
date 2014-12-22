module.exports = {
    httpStatus: {
        401: '没有访问权限',
        404: '请求的地址不存在',
        500: '内部服务器错误'
    },
    button: {
        filter: '筛选',
        reset: '重置',
        submit: '提交',
        ok: '确定',
        close: '关闭',
        cancel: '取消',
        back: '返回',
        add: '增加',
        new: '新建',
        refresh: '刷新',
        edit: '编辑',
        del: '删除'
    },
    boolSelect: [
        { text: '　', value: '' },
        { text: '是', value: 1 },
        { text: '否', value: 0 }
    ],
    validation: {
        msgs: {
            'require': '不能为空',
            'maxlen': '长度不能大于<%= _maxlen %>',
            'minlen': '长度不能小于<%= _minlen %>',
            'maxlen_cb': '最多选<%= _maxlen}个选项',
            'minlen_cb': '最少选<%= _minlen}个选项',
            'max': '不能大于<%= _max %>',
            'min': '不能小于<%= _min %>',
            'regex': '格式不正确',
            'alpha': '只能包含英文字符，"-"，"_"',
            'alphanum': '只能包含数字、英文字符和"_"',
            'tip': '<%= _tip %>'
        },
        tips: {
            'require': '必填',
            'max': '最大值<%= max %>',
            'min': '最小值<%= min %>',
            'maxlen': '最大长度<%= maxlen %>',
            'minlen': '最小长度<%= minlen %>',
            'maxlen_cb': '最多选<%= maxlen %>项',
            'minlen_cb': '最少选<%= minlen %>项'
        }
    },
    page: {
        delConfirm: '是否确定要删除这 <%= count %> 条数据？',
        mustSelect: '至少选择一条数据'
    },
    date: {
        month: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
        weekday: ['日','一','二','三','四','五','六'],
        header: '<%= year %>年 <%= month %>',
        format: 'yyyy-MM-dd'
    }
}
