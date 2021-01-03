$(function () {
    let form = layui.form;
    // 初始化富文本编辑器
    initEditor();

    // 实现封面图片初始的剪裁效果
    // 1. 初始化图片裁剪器
    var $image = $('#image')

    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    }

    // 3. 初始化裁剪区域
    $image.cropper(options);


    let state = '已发布';
    // 点击不同的按钮，切换state的值
    $('.fabu').click(function () {
        state = '已发布';
    });
    $('.caogao').click(function () {
        state = '草稿';
    });

    // --------------------  监听表单的提交事件，调用接口，完成添加 -------------
    $('form').on('submit', function (e) {
        e.preventDefault();
        // 使用FormData收集表单数据
        let fd = new FormData(this); // 传入表单的DOM对象
        // FormData也是根据表单各项的name属性获取值的
        // 默认会收集到 title、cate_id、content三个值
        fd.append('state', state);
        // 剪裁图片
        $image.cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
            width: 400,
            height: 280
        }).toBlob(function (img) {
            fd.append('cover_img', img); // 将剪裁后的图片，放到fd里面
            // 发送ajax请求，从而完成添加
            $.ajax({
                type: 'POST',
                url: '/my/article/add',
                data: fd,
                processData: false,
                contentType: false,
                success: function (res) {
                    layer.msg(res.message);
                    if (res.status === 0) {
                        // 添加成功，跳转到列表页面
                        location.href = '/article/article.html';
                    }
                }
            });
        });;
    });

    // ----- 发送ajax请求，获取所有的分类，渲染到下拉框 -----
    renderCategory();
    function renderCategory() {
        $.ajax({
            url: '/my/article/cates',
            success: function (res) {
                if (res.status === 0) {
                    // 通过模板引擎渲染结果
                    let str = template('cate', res);
                    $('select').html(str);
                    // 更新layui的表单元素渲染
                    form.render('select');
                }
            }
        });
    }

    // ----- 处理图片 ------
    // 点击选择封面，可以选择图片
    $('.chooseImage').click(function () {
        $('#file').click();
    });
    // 当选择了新图片，更换剪裁区的图片
    $('#file').change(function () {
        // 找到文件对象
        let fileObj = this.files[0];
        // 生成临时的url
        let url = URL.createObjectURL(fileObj);
        // 销毁之前的剪裁区、更换图片、重新创建剪裁区
        $image.cropper('destroy').attr('src', url).cropper(options);
    });
    // ajax提交数据到接口的时候，实现真正的剪裁
})