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
            'maxlen': '长度不能大于{_maxlen}',
            'minlen': '长度不能小于{_minlen}',
            'maxlen_cb': '最多选{_maxlen}个选项',
            'minlen_cb': '最少选{_minlen}个选项',
            'max': '不能大于{_max}',
            'min': '不能小于{_min}',
            'regex': '格式不正确',
            'alpha': '只能包含英文字符，"-"，"_"',
            'alphanum': '只能包含数字、英文字符和"_"',
            'tip': '{_tip}',
            'exts': '只允许上传{_exts}格式的文件'
        },
        tips: {
            'require': '必填',
            'max': '最大值{_max}',
            'min': '最小值{_min}',
            'maxlen': '最大长度{_maxlen}',
            'minlen': '最小长度{_minlen}',
            'maxlen_cb': '最多选{_maxlen}项',
            'minlen_cb': '最少选{_minlen}项',
            'exts': '可以上传的文件格式{_exts}'
        }
    },
    page: {
        del_confirm: '是否确定要删除这 {count} 条数据？',
        must_select: '至少选择一条数据'
    }
}
